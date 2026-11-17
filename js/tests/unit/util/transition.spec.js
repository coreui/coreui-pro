import { vi } from 'vitest'
import { reflow } from '../../../src/util/index.js'
import * as Transition from '../../../src/util/transition.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

const busy = ms => {
  const until = performance.now() + ms

  while (performance.now() < until) {
    Math.random()
  }
}

class FakeTransition {}

const runningTransition = (transitionProperty, endTime) => {
  const transition = Object.assign(Object.create(FakeTransition.prototype), {
    effect: { getComputedTiming: () => ({ endTime }) },
    playState: 'running',
    transitionProperty
  })
  let resolveFinished

  transition.finished = new Promise(resolve => {
    resolveFinished = resolve
  })

  const finish = () => {
    transition.playState = 'finished'
    resolveFinished(transition)
  }

  return { finish, transition }
}

const flushPromises = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

describe('Transition utilities', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('getTransitionDurationFromElement', () => {
    it('should get transition from element', () => {
      fixtureEl.innerHTML = '<div style="transition: all 300ms ease-out;"></div>'

      expect(Transition.getTransitionDurationFromElement(fixtureEl.querySelector('div'))).toEqual(300)
    })

    it('should return 0 if the element is undefined or null', () => {
      expect(Transition.getTransitionDurationFromElement(null)).toEqual(0)
      expect(Transition.getTransitionDurationFromElement(undefined)).toEqual(0)
    })

    it('should return 0 if the element do not possess transition', () => {
      fixtureEl.innerHTML = '<div></div>'

      expect(Transition.getTransitionDurationFromElement(fixtureEl.querySelector('div'))).toEqual(0)
    })
  })

  describe('executeAfterTransition', () => {
    it('should immediately execute a function when waitForTransition parameter is false', () => {
      const el = document.createElement('div')
      const callbackSpy = jasmine.createSpy('callback spy')
      const eventListenerSpy = spyOn(el, 'addEventListener')

      Transition.executeAfterTransition(callbackSpy, el, false)

      expect(callbackSpy).toHaveBeenCalled()
      expect(eventListenerSpy).not.toHaveBeenCalled()
    })

    it('should execute a function when a transitionend event is dispatched', () => {
      const el = document.createElement('div')
      const callbackSpy = jasmine.createSpy('callback spy')

      spyOn(window, 'getComputedStyle').and.returnValue({
        transitionDuration: '0.05s',
        transitionDelay: '0s'
      })

      Transition.executeAfterTransition(callbackSpy, el)

      el.dispatchEvent(new TransitionEvent('transitionend'))

      expect(callbackSpy).toHaveBeenCalled()
    })

    it('should execute a function after a computed CSS transition duration and there was no transitionend event dispatched', () => {
      return new Promise(resolve => {
        const el = document.createElement('div')
        const callbackSpy = jasmine.createSpy('callback spy')

        spyOn(window, 'getComputedStyle').and.returnValue({
          transitionDuration: '0.05s',
          transitionDelay: '0s'
        })

        Transition.executeAfterTransition(callbackSpy, el)

        setTimeout(() => {
          expect(callbackSpy).toHaveBeenCalled()
          resolve()
        }, 70)
      })
    })

    it('should leave a wait for one property alone when another wait times out, and finish it on its own timer', () => {
      return new Promise(resolve => {
        const el = document.createElement('div')
        const first = jasmine.createSpy('first')
        const second = jasmine.createSpy('second')
        const durations = ['0.02s', '0.1s']

        spyOn(window, 'getComputedStyle').and.callFake(() => ({
          transitionDuration: durations.shift() ?? '0.1s',
          transitionDelay: '0s'
        }))

        Transition.executeAfterTransition(first, el, true, 'left')
        Transition.executeAfterTransition(second, el, true, 'left')

        setTimeout(() => {
          expect(first).toHaveBeenCalled()
          expect(second).not.toHaveBeenCalled()
        }, 60)

        setTimeout(() => {
          expect(second).toHaveBeenCalled()
          resolve()
        }, 140)
      })
    })

    it('should not execute a function a second time after a computed CSS transition duration and if a transitionend event has already been dispatched', () => {
      return new Promise(resolve => {
        const el = document.createElement('div')
        const callbackSpy = jasmine.createSpy('callback spy')

        spyOn(window, 'getComputedStyle').and.returnValue({
          transitionDuration: '0.05s',
          transitionDelay: '0s'
        })

        Transition.executeAfterTransition(callbackSpy, el)

        setTimeout(() => {
          el.dispatchEvent(new TransitionEvent('transitionend'))
        }, 50)

        setTimeout(() => {
          expect(callbackSpy).toHaveBeenCalledTimes(1)
          resolve()
        }, 70)
      })
    })

    it('should ignore a transitionend of another property, or without one, while it waits for one property', () => {
      const el = document.createElement('div')
      const callbackSpy = jasmine.createSpy('callback spy')

      spyOn(window, 'getComputedStyle').and.returnValue({
        transitionDuration: '0.05s',
        transitionDelay: '0s'
      })

      Transition.executeAfterTransition(callbackSpy, el, true, 'height')
      el.dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'opacity' }))
      el.dispatchEvent(new Event('transitionend'))

      expect(callbackSpy).not.toHaveBeenCalled()

      el.dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'height' }))

      expect(callbackSpy).toHaveBeenCalledTimes(1)
    })

    it('should ignore transitionend events from nested elements', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div class="outer">',
          '  <div class="nested"></div>',
          '</div>'
        ].join('')

        const outer = fixtureEl.querySelector('.outer')
        const nested = fixtureEl.querySelector('.nested')
        const callbackSpy = jasmine.createSpy('callback spy')

        spyOn(window, 'getComputedStyle').and.returnValue({
          transitionDuration: '0.05s',
          transitionDelay: '0s'
        })

        Transition.executeAfterTransition(callbackSpy, outer)

        nested.dispatchEvent(new TransitionEvent('transitionend', {
          bubbles: true
        }))

        setTimeout(() => {
          expect(callbackSpy).not.toHaveBeenCalled()
        }, 20)

        setTimeout(() => {
          expect(callbackSpy).toHaveBeenCalled()
          resolve()
        }, 70)
      })
    })

    it('should settle on its timer when it fires on time, even while a covered transition runs', async () => {
      fixtureEl.innerHTML = '<div style="transition: opacity 0s, transform 5s linear"></div>'
      const el = fixtureEl.querySelector('div')

      reflow(el)
      el.style.transform = 'translateX(10px)'

      const start = performance.now()
      const elapsed = await new Promise(resolve => {
        Transition.executeAfterTransition(() => resolve(performance.now() - start), el, true, 'transform')
      })

      expect(elapsed).toBeLessThan(300)
    })

    it('should wait for a covered transition when its timer fires late, at most as long again and one more second', async () => {
      fixtureEl.innerHTML = '<div style="transition: opacity 200ms, transform 5s linear"></div>'
      const el = fixtureEl.querySelector('div')

      reflow(el)
      el.style.transform = 'translateX(10px)'

      const start = performance.now()
      const elapsed = new Promise(resolve => {
        Transition.executeAfterTransition(() => resolve(performance.now() - start), el, true, 'transform')
      })

      busy(250)

      expect(await elapsed).toBeGreaterThan(1350)
      expect(await elapsed).toBeLessThan(1800)
    })

    it('should settle as soon as the transition it waits for is cancelled', async () => {
      fixtureEl.innerHTML = '<div style="transition: opacity 0s, transform 5s linear"></div>'
      const el = fixtureEl.querySelector('div')

      reflow(el)
      el.style.transform = 'translateX(10px)'

      const start = performance.now()
      const elapsed = new Promise(resolve => {
        Transition.executeAfterTransition(() => resolve(performance.now() - start), el, true, 'transform')
      })

      busy(50)
      setTimeout(() => {
        el.style.display = 'none'
      }, 50)

      expect(await elapsed).toBeLessThan(500)
    })

    it('should settle on its timer when the transition was cancelled before it', async () => {
      fixtureEl.innerHTML = '<div style="transition: opacity 0s, transform 5s linear"></div>'
      const el = fixtureEl.querySelector('div')

      reflow(el)
      el.style.transform = 'translateX(10px)'

      const start = performance.now()
      const elapsed = new Promise(resolve => {
        Transition.executeAfterTransition(() => resolve(performance.now() - start), el, true, 'transform')
      })

      el.style.display = 'none'
      busy(50)

      expect(await elapsed).toBeLessThan(500)
    })

    it('should ignore a transition that starts after the call', async () => {
      fixtureEl.innerHTML = '<div style="transition: opacity 0s, transform 5s linear"></div>'
      const el = fixtureEl.querySelector('div')

      reflow(el)

      const start = performance.now()
      const elapsed = new Promise(resolve => {
        Transition.executeAfterTransition(() => resolve(performance.now() - start), el, true, 'transform')
      })

      el.style.transform = 'translateX(10px)'
      reflow(el)
      busy(50)

      expect(await elapsed).toBeLessThan(500)
    })

    it('should not wait for a transition longer than its own timer', async () => {
      fixtureEl.innerHTML = '<div style="transition: opacity 50ms linear, background-color 2s linear"></div>'
      const el = fixtureEl.querySelector('div')

      reflow(el)
      el.style.backgroundColor = 'blue'
      reflow(el)

      const start = performance.now()
      const elapsed = new Promise(resolve => {
        Transition.executeAfterTransition(() => resolve(performance.now() - start), el)
      })

      busy(100)

      expect(await elapsed).toBeLessThan(500)
    })

    it('should leave another wait on the same element alone when one wait times out, and finish it on its own timer', () => {
      return new Promise(resolve => {
        const el = document.createElement('div')
        const first = jasmine.createSpy('first')
        const second = jasmine.createSpy('second')
        const durations = ['0.02s', '0.1s']

        spyOn(window, 'getComputedStyle').and.callFake(() => ({
          transitionDuration: durations.shift() ?? '0.1s',
          transitionDelay: '0s'
        }))

        Transition.executeAfterTransition(first, el)
        Transition.executeAfterTransition(second, el)

        let calledAt60 = []

        setTimeout(() => {
          calledAt60 = [first.calls.any(), second.calls.any()]
        }, 60)

        setTimeout(() => {
          expect(calledAt60).toEqual([true, false])
          expect(second).toHaveBeenCalled()
          resolve()
        }, 140)
      })
    })

    it('should not dispatch a transitionend event when the timer settles the wait', () => {
      return new Promise(resolve => {
        const el = document.createElement('div')
        const callbackSpy = jasmine.createSpy('callback spy')
        const events = jasmine.createSpy('transitionend')

        spyOn(window, 'getComputedStyle').and.returnValue({
          transitionDuration: '0.02s',
          transitionDelay: '0s'
        })
        el.addEventListener('transitionend', events)

        Transition.executeAfterTransition(callbackSpy, el)

        setTimeout(() => {
          expect(callbackSpy).toHaveBeenCalled()
          expect(events).not.toHaveBeenCalled()
          resolve()
        }, 50)
      })
    })

    it('should stop the wait without running the callback when the returned function is called', () => {
      return new Promise(resolve => {
        const el = document.createElement('div')
        const callbackSpy = jasmine.createSpy('callback spy')

        spyOn(window, 'getComputedStyle').and.returnValue({
          transitionDuration: '0.02s',
          transitionDelay: '0s'
        })

        const cancel = Transition.executeAfterTransition(callbackSpy, el)
        cancel()
        el.dispatchEvent(new TransitionEvent('transitionend'))

        setTimeout(() => {
          expect(callbackSpy).not.toHaveBeenCalled()
          resolve()
        }, 50)
      })
    })
  })

  describe('executeAfterTransition with a late timer', () => {
    let el

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
      vi.stubGlobal('CSSTransition', FakeTransition)
      fixtureEl.innerHTML = '<div style="transition: opacity 0.1s"></div>'
      el = fixtureEl.querySelector('div')
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    })

    const fireLate = () => {
      vi.setSystemTime(Date.now() + 200)
      vi.advanceTimersByTime(105)
    }

    it('should settle once the first of the covered transitions finishes', async () => {
      const opacity = runningTransition('opacity', 100)
      const transform = runningTransition('transform', 80)
      el.getAnimations = () => [opacity.transition, transform.transition]
      const callbackSpy = jasmine.createSpy('callback spy')

      Transition.executeAfterTransition(callbackSpy, el)
      fireLate()
      await flushPromises()

      expect(callbackSpy).not.toHaveBeenCalled()

      transform.finish()
      await flushPromises()

      expect(callbackSpy).toHaveBeenCalledTimes(1)
    })

    it('should settle on its timer five milliseconds after the duration when nothing runs', () => {
      el.getAnimations = () => []
      const callbackSpy = jasmine.createSpy('callback spy')

      Transition.executeAfterTransition(callbackSpy, el)
      vi.advanceTimersByTime(104)

      expect(callbackSpy).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)

      expect(callbackSpy).toHaveBeenCalledTimes(1)
    })

    it('should settle on its timer when the document was hidden before it fired', () => {
      const { transition } = runningTransition('opacity', 100)
      el.getAnimations = () => [transition]
      const callbackSpy = jasmine.createSpy('callback spy')

      Transition.executeAfterTransition(callbackSpy, el)
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
      fireLate()

      expect(callbackSpy).toHaveBeenCalledTimes(1)
    })

    it('should stop a wait for a covered transition when the returned function is called', async () => {
      const { finish, transition } = runningTransition('opacity', 100)
      el.getAnimations = () => [transition]
      const callbackSpy = jasmine.createSpy('callback spy')

      const cancel = Transition.executeAfterTransition(callbackSpy, el)
      fireLate()
      cancel()
      finish()
      await flushPromises()
      vi.advanceTimersByTime(2000)

      expect(callbackSpy).not.toHaveBeenCalled()
    })

    it('should leave out a transition that has already finished', () => {
      const running = runningTransition('opacity', 100)
      const finished = runningTransition('transform', 50)
      finished.transition.playState = 'finished'
      el.getAnimations = () => [running.transition, finished.transition]

      expect(Transition.getCoveredTransitions(el, 105)).toEqual([running.transition])
    })
  })

  describe('getCoveredTransitions', () => {
    it('should return the unfinished transitions that end within the duration, or those of the given property', () => {
      fixtureEl.innerHTML = '<div style="transition: opacity 100ms linear, background-color 2s linear"></div>'
      const el = fixtureEl.querySelector('div')

      reflow(el)
      el.style.opacity = '0.5'
      el.style.backgroundColor = 'blue'
      reflow(el)

      expect(Transition.getCoveredTransitions(el, 105).map(transition => transition.transitionProperty)).toEqual(['opacity'])
      expect(Transition.getCoveredTransitions(el, 105, 'background-color').map(transition => transition.transitionProperty)).toEqual(['background-color'])
    })

    it('should return no transitions where Web Animations are not available', () => {
      const el = document.createElement('div')

      Object.defineProperty(el, 'getAnimations', { value: undefined })

      expect(Transition.getCoveredTransitions(el, 105)).toEqual([])
    })
  })
})

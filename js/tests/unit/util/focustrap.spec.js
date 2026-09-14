import EventHandler from '../../../src/dom/event-handler.js'
import SelectorEngine from '../../../src/dom/selector-engine.js'
import FocusTrap from '../../../src/util/focustrap.js'
import { clearFixture, createEvent, getFixture } from '../../helpers/fixture.js'

describe('FocusTrap', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('activate', () => {
    it('should autofocus itself by default', () => {
      fixtureEl.innerHTML = '<div id="focustrap" tabindex="-1"></div>'

      const trapElement = fixtureEl.querySelector('div')

      const spy = spyOn(trapElement, 'focus')

      const focustrap = new FocusTrap({ trapElement })
      focustrap.activate()

      expect(spy).toHaveBeenCalled()
    })

    it('if configured not to autofocus, should not autofocus itself', () => {
      fixtureEl.innerHTML = '<div id="focustrap" tabindex="-1"></div>'

      const trapElement = fixtureEl.querySelector('div')

      const spy = spyOn(trapElement, 'focus')

      const focustrap = new FocusTrap({ trapElement, autofocus: false })
      focustrap.activate()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should force focus inside focus trap if it can', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<a href="#" id="outside">outside</a>',
          '<div id="focustrap" tabindex="-1">',
          '  <a href="#" id="inside">inside</a>',
          '</div>'
        ].join('')

        const trapElement = fixtureEl.querySelector('div')
        const focustrap = new FocusTrap({ trapElement })
        focustrap.activate()

        const inside = document.getElementById('inside')

        const focusInListener = () => {
          expect(spy).toHaveBeenCalled()
          document.removeEventListener('focusin', focusInListener)
          resolve()
        }

        const spy = spyOn(inside, 'focus')
        spyOn(SelectorEngine, 'focusableChildren').and.callFake(() => [inside])

        document.addEventListener('focusin', focusInListener)

        const focusInEvent = createEvent('focusin', { bubbles: true })
        Object.defineProperty(focusInEvent, 'target', {
          value: document.getElementById('outside')
        })

        document.dispatchEvent(focusInEvent)
      })
    })

    it('should wrap focus around forward on tab', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<a href="#" id="outside">outside</a>',
          '<div id="focustrap" tabindex="-1">',
          '  <a href="#" id="first">first</a>',
          '  <a href="#" id="inside">inside</a>',
          '  <a href="#" id="last">last</a>',
          '</div>'
        ].join('')

        const trapElement = fixtureEl.querySelector('div')
        const focustrap = new FocusTrap({ trapElement })
        focustrap.activate()

        const first = document.getElementById('first')
        const inside = document.getElementById('inside')
        const last = document.getElementById('last')
        const outside = document.getElementById('outside')

        spyOn(SelectorEngine, 'focusableChildren').and.callFake(() => [first, inside, last])
        const spy = spyOn(first, 'focus').and.callThrough()

        const focusInListener = () => {
          expect(spy).toHaveBeenCalled()
          first.removeEventListener('focusin', focusInListener)
          resolve()
        }

        first.addEventListener('focusin', focusInListener)

        const keydown = createEvent('keydown')
        keydown.key = 'Tab'

        document.dispatchEvent(keydown)
        outside.focus()
      })
    })

    it('should wrap focus around backwards on shift-tab', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<a href="#" id="outside">outside</a>',
          '<div id="focustrap" tabindex="-1">',
          '  <a href="#" id="first">first</a>',
          '  <a href="#" id="inside">inside</a>',
          '  <a href="#" id="last">last</a>',
          '</div>'
        ].join('')

        const trapElement = fixtureEl.querySelector('div')
        const focustrap = new FocusTrap({ trapElement })
        focustrap.activate()

        const first = document.getElementById('first')
        const inside = document.getElementById('inside')
        const last = document.getElementById('last')
        const outside = document.getElementById('outside')

        spyOn(SelectorEngine, 'focusableChildren').and.callFake(() => [first, inside, last])
        const spy = spyOn(last, 'focus').and.callThrough()

        const focusInListener = () => {
          expect(spy).toHaveBeenCalled()
          last.removeEventListener('focusin', focusInListener)
          resolve()
        }

        last.addEventListener('focusin', focusInListener)

        const keydown = createEvent('keydown')
        keydown.key = 'Tab'
        keydown.shiftKey = true

        document.dispatchEvent(keydown)
        outside.focus()
      })
    })

    it('should leave Tab alone in the middle of a group when an additional element is configured', () => {
      fixtureEl.innerHTML = [
        '<div id="focustrap">',
        '  <a href="#" id="trap-first">first</a>',
        '  <a href="#" id="trap-middle">middle</a>',
        '  <a href="#" id="trap-last">last</a>',
        '</div>',
        '<div id="additional">',
        '  <a href="#" id="additional-first">first</a>',
        '  <a href="#" id="additional-last">last</a>',
        '</div>'
      ].join('')

      const trapElement = document.getElementById('focustrap')
      const additionalElement = document.getElementById('additional')
      const focustrap = new FocusTrap({ additionalElement, trapElement })
      focustrap.activate()

      const middle = document.getElementById('trap-middle')
      const keydown = createEvent('keydown', { bubbles: true, cancelable: true })
      keydown.key = 'Tab'

      middle.dispatchEvent(keydown)

      expect(keydown.defaultPrevented).toBeFalse()

      focustrap.deactivate()
    })

    it('should redirect at the seam between the trap element and the additional one', () => {
      fixtureEl.innerHTML = [
        '<div id="focustrap">',
        '  <a href="#" id="trap-first">first</a>',
        '  <a href="#" id="trap-last">last</a>',
        '</div>',
        '<div id="additional">',
        '  <a href="#" id="additional-first">first</a>',
        '  <a href="#" id="additional-last">last</a>',
        '</div>'
      ].join('')

      const trapElement = document.getElementById('focustrap')
      const additionalElement = document.getElementById('additional')
      const focustrap = new FocusTrap({ additionalElement, trapElement })
      focustrap.activate()

      const last = document.getElementById('trap-last')
      const additionalFirst = document.getElementById('additional-first')
      const spy = spyOn(additionalFirst, 'focus')

      const keydown = createEvent('keydown', { bubbles: true, cancelable: true })
      keydown.key = 'Tab'

      last.dispatchEvent(keydown)

      expect(keydown.defaultPrevented).toBeTrue()
      expect(spy).toHaveBeenCalled()

      focustrap.deactivate()
    })

    it('should force focus on itself if there is no focusable content', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<a href="#" id="outside">outside</a>',
          '<div id="focustrap" tabindex="-1"></div>'
        ].join('')

        const trapElement = fixtureEl.querySelector('div')
        const focustrap = new FocusTrap({ trapElement })
        focustrap.activate()

        const focusInListener = () => {
          expect(spy).toHaveBeenCalled()
          document.removeEventListener('focusin', focusInListener)
          resolve()
        }

        const spy = spyOn(focustrap._config.trapElement, 'focus')

        document.addEventListener('focusin', focusInListener)

        const focusInEvent = createEvent('focusin', { bubbles: true })
        Object.defineProperty(focusInEvent, 'target', {
          value: document.getElementById('outside')
        })

        document.dispatchEvent(focusInEvent)
      })
    })
  })

  describe('deactivate', () => {
    it('should flag itself as no longer active', () => {
      const focustrap = new FocusTrap({ trapElement: fixtureEl })
      focustrap.activate()
      expect(focustrap._isActive).toBeTrue()

      focustrap.deactivate()
      expect(focustrap._isActive).toBeFalse()
    })

    it('should remove all event listeners', () => {
      const focustrap = new FocusTrap({ trapElement: fixtureEl })
      focustrap.activate()

      const spy = spyOn(EventHandler, 'off')
      focustrap.deactivate()

      expect(spy).toHaveBeenCalled()
    })

    it('doesn\'t try removing event listeners unless it needs to (in case it hasn\'t been activated)', () => {
      const focustrap = new FocusTrap({ trapElement: fixtureEl })

      const spy = spyOn(EventHandler, 'off')
      focustrap.deactivate()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should hand focus back to the element focused before activation when configured to', () => {
      fixtureEl.innerHTML = [
        '<a href="#" id="opener">opener</a>',
        '<div id="focustrap">',
        '  <a href="#" id="inside">inside</a>',
        '</div>'
      ].join('')

      const trapElement = document.getElementById('focustrap')
      const opener = document.getElementById('opener')
      const inside = document.getElementById('inside')

      opener.focus()

      const focustrap = new FocusTrap({ autofocus: false, returnFocus: true, trapElement })
      focustrap.activate()

      inside.focus()

      const spy = spyOn(opener, 'focus')

      focustrap.deactivate()

      expect(spy).toHaveBeenCalled()
    })

    it('should leave focus where it is unless returnFocus is set', () => {
      fixtureEl.innerHTML = [
        '<a href="#" id="opener">opener</a>',
        '<div id="focustrap">',
        '  <a href="#" id="inside">inside</a>',
        '</div>'
      ].join('')

      const trapElement = document.getElementById('focustrap')
      const opener = document.getElementById('opener')
      const inside = document.getElementById('inside')

      opener.focus()

      const focustrap = new FocusTrap({ autofocus: false, trapElement })
      focustrap.activate()

      inside.focus()

      const spy = spyOn(opener, 'focus')

      focustrap.deactivate()

      expect(spy).not.toHaveBeenCalled()
      expect(document.activeElement).toEqual(inside)
    })

    it('should keep the other trap listening when one is deactivated', () => {
      fixtureEl.innerHTML = [
        '<a href="#" id="outside">outside</a>',
        '<div id="first" tabindex="-1"><a href="#" id="inside-first">first</a></div>',
        '<div id="second" tabindex="-1"><a href="#" id="inside-second">second</a></div>'
      ].join('')

      const first = new FocusTrap({ trapElement: fixtureEl.querySelector('#first'), autofocus: false })
      const second = new FocusTrap({ trapElement: fixtureEl.querySelector('#second'), autofocus: false })
      first.activate()
      second.activate()
      first.deactivate()

      const focusinSpy = spyOn(second, '_handleFocusin').and.callThrough()
      const keydownSpy = spyOn(second, '_handleKeydown').and.callThrough()

      fixtureEl.querySelector('#outside').focus()
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))

      expect(focusinSpy).toHaveBeenCalled()
      expect(keydownSpy).toHaveBeenCalled()
      expect(document.activeElement).toEqual(fixtureEl.querySelector('#inside-second'))

      second.deactivate()
    })

    it('should hand control back to the trap underneath when the top one is deactivated', () => {
      fixtureEl.innerHTML = [
        '<a href="#" id="outside">outside</a>',
        '<div id="first" tabindex="-1"><a href="#" id="inside-first">first</a></div>',
        '<div id="second" tabindex="-1"><a href="#" id="inside-second">second</a></div>'
      ].join('')

      const first = new FocusTrap({ trapElement: fixtureEl.querySelector('#first'), autofocus: false })
      const second = new FocusTrap({ trapElement: fixtureEl.querySelector('#second'), autofocus: false })
      first.activate()
      second.activate()

      fixtureEl.querySelector('#outside').focus()

      expect(document.activeElement).toEqual(fixtureEl.querySelector('#inside-second'))

      second.deactivate()
      fixtureEl.querySelector('#outside').focus()

      expect(document.activeElement).toEqual(fixtureEl.querySelector('#inside-first'))

      first.deactivate()
    })
  })

  describe('two active traps', () => {
    it('should not throw focus back and forth between disjoint trap elements', () => {
      fixtureEl.innerHTML = [
        '<a href="#" id="outside">outside</a>',
        '<div id="first" tabindex="-1"><a href="#" id="inside-first">first</a></div>',
        '<div id="second" tabindex="-1"><a href="#" id="inside-second">second</a></div>'
      ].join('')

      const first = new FocusTrap({ trapElement: fixtureEl.querySelector('#first'), autofocus: false })
      const second = new FocusTrap({ trapElement: fixtureEl.querySelector('#second'), autofocus: false })

      // Cap the recursion: without the topmost check the two handlers hand
      // focus to each other until the stack gives out.
      let calls = 0
      const firstFocusin = first._handleFocusin.bind(first)
      const secondFocusin = second._handleFocusin.bind(second)
      first._handleFocusin = event => {
        calls++
        if (calls < 50) {
          firstFocusin(event)
        }
      }

      second._handleFocusin = event => {
        calls++
        if (calls < 50) {
          secondFocusin(event)
        }
      }

      first.activate()
      second.activate()
      fixtureEl.querySelector('#outside').focus()

      expect(calls).toBeLessThan(10)
      expect(document.activeElement).toEqual(fixtureEl.querySelector('#inside-second'))

      second.deactivate()
      first.deactivate()
    })
  })
})

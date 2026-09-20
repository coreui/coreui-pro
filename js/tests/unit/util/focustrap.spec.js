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

  describe('tabbing inside a trap of its own', () => {
    it('should wrap the tab order without waiting for a focusin', () => {
      fixtureEl.innerHTML = [
        '<button id="outside" type="button">outside</button>',
        '<div id="trap"><button id="first">first</button><button id="last">last</button></div>'
      ].join('')

      const first = fixtureEl.querySelector('#first')
      const last = fixtureEl.querySelector('#last')
      const focustrap = new FocusTrap({ trapElement: fixtureEl.querySelector('#trap') })

      focustrap.activate()
      last.focus()

      const forward = createEvent('keydown', { bubbles: true, cancelable: true })
      forward.key = 'Tab'
      last.dispatchEvent(forward)

      expect(forward.defaultPrevented).toBeTrue()
      expect(document.activeElement).toEqual(first)

      const back = createEvent('keydown', { bubbles: true, cancelable: true })
      back.key = 'Tab'
      back.shiftKey = true
      first.dispatchEvent(back)

      expect(back.defaultPrevented).toBeTrue()
      expect(document.activeElement).toEqual(last)

      focustrap.deactivate()
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
  })

  describe('tabbing between the trap and its additional element', () => {
    it('should leave a Tab inside a group alone', () => {
      fixtureEl.innerHTML = [
        '<div id="trap"><button id="t1">t1</button><button id="t2">t2</button></div>',
        '<div id="extra"><button id="a1">a1</button><button id="a2">a2</button><button id="a3">a3</button></div>'
      ].join('')

      const focustrap = new FocusTrap({
        additionalElement: fixtureEl.querySelector('#extra'),
        trapElement: fixtureEl.querySelector('#trap')
      })

      focustrap.activate()

      // a2 sits in the middle of the additional group, so Tab is the browser's
      // to handle — taking it here would leave the key doing nothing at all.
      const middle = fixtureEl.querySelector('#a2')
      middle.focus()

      const event = createEvent('keydown', { bubbles: true, cancelable: true })
      event.key = 'Tab'
      middle.dispatchEvent(event)

      expect(event.defaultPrevented).toBeFalse()

      focustrap.deactivate()
    })

    it('should take a focusable additional element as a stop of its own', () => {
      fixtureEl.innerHTML = [
        '<div id="trap"><button id="only">only</button></div>',
        '<input id="field" type="text">'
      ].join('')

      const field = fixtureEl.querySelector('#field')
      const only = fixtureEl.querySelector('#only')
      const focustrap = new FocusTrap({
        additionalElement: field,
        trapElement: fixtureEl.querySelector('#trap')
      })

      focustrap.activate()
      only.focus()

      const forward = createEvent('keydown', { bubbles: true, cancelable: true })
      forward.key = 'Tab'
      only.dispatchEvent(forward)

      expect(forward.defaultPrevented).toBeTrue()
      expect(document.activeElement).toEqual(field)

      const back = createEvent('keydown', { bubbles: true, cancelable: true })
      back.key = 'Tab'
      field.dispatchEvent(back)

      expect(back.defaultPrevented).toBeTrue()
      expect(document.activeElement).toEqual(only)

      focustrap.deactivate()
    })

    it('should wrap the tab inside the trap when the additional element cannot take the focus', () => {
      fixtureEl.innerHTML = [
        '<div id="trap"><button id="t1">t1</button><button id="t2">t2</button></div>',
        '<input id="field" type="text" disabled>'
      ].join('')

      const last = fixtureEl.querySelector('#t2')
      const focustrap = new FocusTrap({
        additionalElement: fixtureEl.querySelector('#field'),
        trapElement: fixtureEl.querySelector('#trap')
      })

      focustrap.activate()
      last.focus()

      const event = createEvent('keydown', { bubbles: true, cancelable: true })
      event.key = 'Tab'
      last.dispatchEvent(event)

      expect(event.defaultPrevented).toBeTrue()
      expect(document.activeElement).toEqual(fixtureEl.querySelector('#t1'))

      focustrap.deactivate()
    })

    it('should carry focus across the seam between the groups', () => {
      fixtureEl.innerHTML = [
        '<div id="trap"><button id="t1">t1</button><button id="t2">t2</button></div>',
        '<div id="extra"><button id="a1">a1</button><button id="a2">a2</button></div>'
      ].join('')

      const focustrap = new FocusTrap({
        additionalElement: fixtureEl.querySelector('#extra'),
        trapElement: fixtureEl.querySelector('#trap')
      })

      focustrap.activate()

      const last = fixtureEl.querySelector('#t2')
      last.focus()

      const event = createEvent('keydown', { bubbles: true, cancelable: true })
      event.key = 'Tab'
      last.dispatchEvent(event)

      expect(event.defaultPrevented).toBeTrue()
      expect(document.activeElement.id).toEqual('a1')

      focustrap.deactivate()
    })
  })

  describe('two active traps', () => {
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

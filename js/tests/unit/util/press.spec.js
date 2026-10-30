import { forgetPress, pressPathOf, trackPress } from '../../../src/util/press.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('Press utilities', () => {
  let fixtureEl

  const press = (element, init = {}) => {
    element.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true, composed: true, button: 0, ...init
    }))
  }

  const click = element => {
    const event = new MouseEvent('click', { bubbles: true, composed: true })
    element.dispatchEvent(event)
    return event
  }

  beforeAll(() => {
    fixtureEl = getFixture()
    trackPress()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('pressPathOf', () => {
    it('should return the path of the press that produced the click', () => {
      fixtureEl.innerHTML = '<div id="panel"><button id="inside"></button></div><button id="outside"></button>'

      const panel = fixtureEl.querySelector('#panel')
      press(fixtureEl.querySelector('#inside'))
      const event = click(fixtureEl.querySelector('#outside'))

      expect(pressPathOf(event)).toContain(panel)
    })

    it('should return null for a click with no press of its own', () => {
      fixtureEl.innerHTML = '<button></button>'

      expect(pressPathOf(click(fixtureEl.querySelector('button')))).toBeNull()
    })

    it('should give the press to the first click after it only', () => {
      fixtureEl.innerHTML = '<button></button>'

      const button = fixtureEl.querySelector('button')
      press(button)
      click(button)

      expect(pressPathOf(click(button))).toBeNull()
    })

    it('should ignore a press with another button than the left one', () => {
      fixtureEl.innerHTML = '<button></button>'

      const button = fixtureEl.querySelector('button')
      press(button, { button: 2 })

      expect(pressPathOf(click(button))).toBeNull()
    })

    it('should forget the press on Enter, Space, contextmenu and pointercancel', () => {
      fixtureEl.innerHTML = '<button></button>'

      const button = fixtureEl.querySelector('button')
      const forget = [
        () => button.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })),
        () => button.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' })),
        () => button.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true })),
        () => button.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }))
      ]

      for (const event of forget) {
        press(button)
        event()
        expect(pressPathOf(click(button))).toBeNull()
      }
    })

    it('should keep the press on another key', () => {
      fixtureEl.innerHTML = '<button></button>'

      const button = fixtureEl.querySelector('button')
      press(button)
      button.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Shift' }))

      expect(pressPathOf(click(button))).toContain(button)
    })

    it('should keep the press of a click while another click is dispatched from its listeners', () => {
      fixtureEl.innerHTML = '<button id="outer"></button><button id="inner"></button>'

      const outer = fixtureEl.querySelector('#outer')
      const inner = fixtureEl.querySelector('#inner')
      outer.addEventListener('click', () => inner.click(), { once: true })
      press(outer)
      const event = click(outer)

      expect(pressPathOf(event)).toContain(outer)
      expect(pressPathOf(new MouseEvent('click'))).toBeNull()
    })

    it('should read the path through an open shadow root', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'

      const host = fixtureEl.querySelector('#host')
      const shadow = host.attachShadow({ mode: 'open' })
      shadow.innerHTML = '<div id="panel"><button></button></div>'
      press(shadow.querySelector('button'))
      const event = click(document.body)

      expect(pressPathOf(event)).toContain(shadow.querySelector('#panel'))
    })
    it('should give the press only to a click on the pressed element or an ancestor of it', () => {
      fixtureEl.innerHTML = '<div id="panel"><button id="inside"></button></div><button id="outside"></button>'

      const inside = fixtureEl.querySelector('#inside')
      press(inside)
      expect(pressPathOf(click(fixtureEl.querySelector('#outside')))).toBeNull()

      press(inside)
      expect(pressPathOf(click(fixtureEl))).toContain(inside)
    })
  })

  describe('forgetPress', () => {
    it('should drop a press that no click has taken yet', () => {
      fixtureEl.innerHTML = '<button></button>'

      const button = fixtureEl.querySelector('button')
      press(button)
      forgetPress()

      expect(pressPathOf(click(button))).toBeNull()
    })
  })

  describe('trackPress', () => {
    it('should add its listeners once, however many callers start it', () => {
      const spy = spyOn(document, 'addEventListener').and.callThrough()

      trackPress()
      trackPress()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should record presses in the document it is given, once', () => {
      const iframe = document.createElement('iframe')
      fixtureEl.append(iframe)
      const doc = iframe.contentDocument
      doc.body.innerHTML = '<div id="panel"><button id="inside"></button></div>'
      const spy = spyOn(doc, 'addEventListener').and.callThrough()

      trackPress(doc)
      const listeners = spy.calls.count()
      trackPress(doc)
      doc.querySelector('#inside').dispatchEvent(new iframe.contentWindow.PointerEvent('pointerdown', {
        bubbles: true, composed: true, button: 0
      }))
      const event = new iframe.contentWindow.MouseEvent('click', { bubbles: true, composed: true })
      doc.body.dispatchEvent(event)

      expect(listeners).toBeGreaterThan(0)
      expect(spy.calls.count()).toEqual(listeners)
      expect(pressPathOf(event)).toContain(doc.querySelector('#panel'))
    })
  })
})

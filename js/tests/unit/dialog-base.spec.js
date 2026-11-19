import Dialog from '../../src/dialog.js'
import Modal from '../../src/modal.js'
import { lastPressedElement } from '../../src/util/press.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

describe('DialogBase', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  it('should start recording presses when a dialog component is created', () => {
    fixtureEl.innerHTML = '<button type="button" id="open">Open</button><dialog class="modal"></dialog>'
    const open = fixtureEl.querySelector('#open')
    const press = () => open.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }))

    press()

    expect(lastPressedElement()).toBeNull()

    new Modal(fixtureEl.querySelector('dialog')) // eslint-disable-line no-new
    press()

    expect(lastPressedElement()).toBe(open)
  })

  for (const keyboard of [true, false]) {
    it(`should stay open when a file picker inside it is cancelled (keyboard: ${keyboard})`, async () => {
      fixtureEl.innerHTML = '<dialog class="modal modal-instant"><input type="file" aria-label="File"></dialog>'
      const modalEl = fixtureEl.querySelector('dialog')
      const events = []
      modalEl.addEventListener('hide.coreui.modal', () => events.push('hide'))
      modalEl.addEventListener('hidePrevented.coreui.modal', () => events.push('hidePrevented'))
      const modal = new Modal(modalEl, { keyboard })
      await modal.show()

      const cancel = new Event('cancel', { bubbles: true, cancelable: true })
      modalEl.querySelector('input').dispatchEvent(cancel)

      expect(cancel.defaultPrevented).toBeFalse()
      expect(events).toEqual([])
      expect(modalEl.open).toBeTrue()

      modalEl.dispatchEvent(new Event('cancel', { cancelable: true }))

      expect(events).toEqual([keyboard ? 'hide' : 'hidePrevented'])
    })
  }

  describe('opened again while it closes', () => {
    const settle = (delay = 50) => new Promise(resolve => {
      setTimeout(resolve, delay)
    })

    const setup = (content = '<button type="button" id="close">Close</button><button type="button" id="second">Second</button>', style = '') => {
      fixtureEl.innerHTML = [
        '<button type="button" id="trigger" data-coreui-toggle="dialog" data-coreui-target="#reopened">Open</button>',
        '<button type="button" id="other">Other</button>',
        `<dialog class="dialog" id="reopened" style="${style}">${content}</dialog>`
      ].join('')
      const element = fixtureEl.querySelector('dialog')
      const events = []
      for (const name of ['show', 'shown', 'hide', 'hidden']) {
        element.addEventListener(`${name}.coreui.dialog`, () => events.push(name))
      }

      return {
        element,
        events,
        instance: new Dialog(element, { modal: false }),
        other: fixtureEl.querySelector('#other'),
        trigger: fixtureEl.querySelector('#trigger')
      }
    }

    it('should open again on show(), fire no hidden and resolve hide() at shown', async () => {
      const { element, events, instance } = setup(undefined, 'transition: opacity .2s')
      await instance.show()
      events.length = 0
      element.addEventListener('shown.coreui.dialog', () => events.push('shown event'))

      const hidden = instance.hide().then(() => events.push('hide resolved'))
      await instance.show()
      await hidden
      await settle()

      expect(events).toEqual(['hide', 'show', 'shown', 'shown event', 'hide resolved'])
      expect(element.open).toBeTrue()
      expect(element.classList.contains('hiding')).toBeFalse()
    })

    it('should open again when its trigger is clicked', async () => {
      const { element, events, instance, trigger } = setup()
      await instance.show()
      events.length = 0

      instance.hide()
      trigger.click()
      await settle()

      expect(events).toEqual(['hide', 'show', 'shown'])
      expect(element.open).toBeTrue()
    })

    it('should go on closing when the show event is prevented', async () => {
      const { element, events, instance } = setup()
      await instance.show()
      events.length = 0
      element.addEventListener('show.coreui.dialog', event => event.preventDefault())

      instance.hide()
      await instance.show()
      await settle()

      expect(events).toEqual(['hide', 'show', 'hidden'])
      expect(element.open).toBeFalse()
    })

    it('should go on closing when a toggle inside it is pressed again', async () => {
      const { element, events, instance } = setup('<button type="button" id="inside" data-coreui-toggle="dialog" data-coreui-target="#reopened">Close</button>')
      await instance.show()
      events.length = 0

      instance.toggle(element.querySelector('#inside'))
      instance.toggle(element.querySelector('#inside'))
      await settle()

      expect(events).toEqual(['hide', 'hidden'])
      expect(element.open).toBeFalse()
    })

    it('should move the focus inside when it was outside', async () => {
      const { element, instance, trigger } = setup()
      await instance.show(trigger)
      trigger.focus()

      instance.hide()
      instance.show(trigger)

      expect(document.activeElement).toEqual(element.querySelector('#close'))
    })

    it('should leave the focus inside where it is', async () => {
      const { element, instance } = setup()
      await instance.show()
      const second = element.querySelector('#second')
      second.focus()

      instance.hide()
      instance.show()

      expect(document.activeElement).toEqual(second)
    })

    it('should give the focus back to where the first opening started', async () => {
      const { instance, other, trigger } = setup()
      trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }))
      document.activeElement.blur()
      await instance.show()

      instance.hide()
      other.focus()
      await instance.show(other)
      await instance.hide()

      expect(document.activeElement).toEqual(trigger)
    })

    it('should close on Escape while it opens again', async () => {
      const { element, events, instance } = setup()
      await instance.show()
      instance.hide()
      instance.show()
      events.length = 0

      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
      await settle()

      expect(events).toEqual(['hide', 'hidden'])
      expect(element.open).toBeFalse()
    })

    it('should clean up when closed natively while it opens again', async () => {
      const { element, events, instance } = setup(undefined, 'transition: opacity .2s')
      await instance.show()
      instance.hide()
      instance.show()

      expect(events.at(-1)).toEqual('show')
      expect(element.classList.contains('hiding')).toBeFalse()

      events.length = 0
      element.close()
      await settle(300)

      expect(events).toEqual(['hidden'])
      expect(element.classList.contains('hiding')).toBeFalse()
    })
  })
})

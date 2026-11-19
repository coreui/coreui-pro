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
})

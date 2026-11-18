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
})

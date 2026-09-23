/*!
 * The pickers' `shown` and `hidden` wait for the popup's opacity transition,
 * which exists only with the stylesheet, so only a real browser with it can
 * tell whether `shown` lands on a panel that has finished fading in.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import DatePicker from '../../src/date-picker.js'

let container
let picker

const mount = () => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 1rem; width: 420px;'
  container.innerHTML = '<div id="host"></div>'
  document.body.append(container)

  const host = container.querySelector('#host')
  picker = new DatePicker(host, { date: new Date(2026, 6, 14), locale: 'en-US' })

  return host
}

const once = (element, name, read) => new Promise(resolve => {
  element.addEventListener(`${name}.coreui.date-picker`, () => resolve(read()), { once: true })
})

describe('picker popup events', () => {
  afterEach(() => {
    picker?.dispose()
    picker = null
    container?.remove()
  })

  it('should fire shown once the panel has faded in', async () => {
    const host = mount()
    const opacity = once(host, 'shown', () => getComputedStyle(picker._menu).opacity)

    picker.show()

    expect(await opacity).toBe('1')
  })

  it('should fire hidden once the panel has faded out and left the page', async () => {
    const host = mount()
    const shown = once(host, 'shown', () => null)
    picker.show()
    await shown

    const connected = once(host, 'hidden', () => picker._menu.isConnected)
    picker.hide()

    expect(await connected).toBeFalse()
  })
})

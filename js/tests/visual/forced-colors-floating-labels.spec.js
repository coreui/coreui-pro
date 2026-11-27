/*!
 * A resting floating label hides the placeholder and the date mask with a
 * transparent color, and aligns its text with a transparent border. Forced
 * colors mode ignores both, so the placeholder and the mask showed under the
 * label and a box was drawn around it. Only the stylesheet decides it, so only
 * a real browser with it can tell.
 */

import { cdp } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import DateInput from '../../src/date-input.js'
import DateRangePicker from '../../src/date-range-picker.js'
import MultiSelect from '../../src/multi-select.js'

const OPTIONS = [{ value: 1, label: 'Angular' }, { value: 2, label: 'Bootstrap' }]
const DATE = new Date(2026, 6, 14)

let container

const mount = html => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 1rem; width: 420px;'
  container.innerHTML = `<div class="form-floating">${html}<label for="host">Label</label></div>`
  document.body.append(container)
  return container.querySelector('.form-floating')
}

const build = (Component, config) => {
  const root = mount('<div id="host"></div>')
  new Component(root.querySelector('#host'), config)
  return root
}

const forceColors = () => cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })

const labelBox = label => {
  const style = getComputedStyle(label)
  return {
    top: Number.parseFloat(style.paddingTop) + Number.parseFloat(style.borderTopWidth),
    start: Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.borderLeftWidth),
    border: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth]
  }
}

const PLAIN = '<input type="text" class="form-control" id="host" placeholder="name@example.com">'
const PLAINTEXT = '<input type="email" readonly class="form-control-plaintext" id="host" placeholder="name@example.com">'

describe('forced colors floating labels', () => {
  afterEach(async () => {
    container?.remove()
    container = null
    await cdp().send('Emulation.setEmulatedMedia', { features: [] })
  })

  for (const [name, html] of [['a plain control', PLAIN], ['a plain-text control', PLAINTEXT]]) {
    it(`should draw no border around the label of ${name} and keep its text in place in forced colors`, async () => {
      const normal = labelBox(mount(html).querySelector('label'))
      container.remove()

      await forceColors()
      const forced = labelBox(mount(html).querySelector('label'))

      expect(forced.border).toEqual(['0px', '0px', '0px', '0px'])
      expect(forced.top).toBe(normal.top)
      expect(forced.start).toBe(normal.start)
    })

    it(`should hide the placeholder of ${name} under a resting label in forced colors`, async () => {
      await forceColors()
      const input = mount(html).querySelector('input')

      expect(getComputedStyle(input, '::placeholder').opacity).toBe('0')
    })
  }

  it('should show the placeholder of a focused plain control in forced colors', async () => {
    await forceColors()
    const input = mount(PLAIN).querySelector('input')
    input.focus()

    expect(getComputedStyle(input, '::placeholder').opacity).toBe('1')
  })

  it('should hide the mask of an empty Date Input under a resting label in forced colors', async () => {
    await forceColors()
    const root = build(DateInput, {})

    for (const part of root.querySelectorAll('.form-date-time-section, .form-date-time-separator')) {
      expect(getComputedStyle(part).opacity).toBe('0')
    }
  })

  it('should show the mask of a filled Date Input in forced colors', async () => {
    await forceColors()
    const root = build(DateInput, { date: DATE })

    expect(getComputedStyle(root.querySelector('.form-date-time-section')).opacity).toBe('1')
  })

  it('should hide the mask and the arrow of an empty Date Range Picker under a resting label in forced colors', async () => {
    await forceColors()
    const root = build(DateRangePicker, { locale: 'en-US' })

    expect(getComputedStyle(root.querySelector('.form-date-time-section')).opacity).toBe('0')
    expect(getComputedStyle(root.querySelector('.form-control-icon')).opacity).toBe('0')
  })

  it('should hide the placeholder of an empty Multi Select under a resting label in forced colors', async () => {
    await forceColors()
    const root = build(MultiSelect, { options: OPTIONS })

    expect(getComputedStyle(root.querySelector('.multi-select-placeholder')).opacity).toBe('0')
  })

  it('should hide the search placeholder of an empty searchable Multi Select under a resting label in forced colors', async () => {
    await forceColors()
    const root = build(MultiSelect, { options: OPTIONS, search: true })

    expect(getComputedStyle(root.querySelector('.multi-select-search'), '::placeholder').opacity).toBe('0')
  })

  it('should leave the label border and the hidden parts alone outside forced colors', () => {
    const input = mount(PLAIN).querySelector('input')
    expect(getComputedStyle(container.querySelector('label')).borderTopWidth).toBe('1px')
    expect(getComputedStyle(input, '::placeholder').opacity).toBe('1')
    container.remove()

    const root = build(DateInput, {})
    expect(getComputedStyle(root.querySelector('.form-date-time-section')).opacity).toBe('1')
  })
})

/*!
 * Floating labels over the field components. Every one of them wraps its control
 * in `.form-control-group`, which the `.form-floating > .form-control` rules do
 * not reach — so the label silently stayed put and the field kept a plain height.
 * Asserting computed style rather than pixels: the question is whether the state
 * selectors match at all, and a screenshot would answer it far less directly.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Autocomplete from '../../src/autocomplete.js'
import DateInput from '../../src/date-input.js'
import DatePicker from '../../src/date-picker.js'
import DateRangePicker from '../../src/date-range-picker.js'
import DateTimePicker from '../../src/date-time-picker.js'
import MultiSelect from '../../src/multi-select.js'
import NumberInput from '../../src/number-input.js'
import PasswordInput from '../../src/password-input.js'
import TimePicker from '../../src/time-picker.js'

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

const labelFloats = root => getComputedStyle(root.querySelector('label')).transform !== 'none'
const wrapperHeight = root => Math.round(root.firstElementChild.getBoundingClientRect().height)

// A plain `.form-control` is the reference: whatever height it gets under
// `.form-floating`, every field component has to match, or the row it sits in
// stops lining up.
let plainHeight

afterEach(() => container?.remove())

describe('floating labels', () => {
  beforeAll(() => {
    const root = mount('<input type="text" class="form-control" id="host" placeholder=" ">')
    plainHeight = wrapperHeight(root)
    container.remove()
  })

  it('leaves the label in place while a plain control is empty', () => {
    expect(labelFloats(mount('<input type="text" class="form-control" id="host" placeholder=" ">'))).toBeFalse()
  })

  it('floats the label once a plain control has a value', () => {
    expect(labelFloats(mount('<input type="text" class="form-control" id="host" placeholder=" " value="x">'))).toBeTrue()
  })

  // Mount, initialise, hand back the wrapper — one expression per case, so the
  // table below reads as a matrix rather than a pile of statements.
  const build = (html, Component, config) => {
    const root = mount(html)

    new Component(root.querySelector('#host'), config)
    return root
  }

  const HOST_DIV = '<div id="host"></div>'
  const HOST_INPUT = '<input type="text" class="form-control" id="host" placeholder=" ">'
  const HOST_INPUT_VALUE = '<input type="text" class="form-control" id="host" placeholder=" " value="42">'
  // stepUp() throws on anything but the numeric types, so the number input gets
  // a real type="number" host rather than sharing the text one.
  const HOST_NUMBER = '<input type="number" class="form-control" id="host" placeholder=" ">'
  const HOST_NUMBER_VALUE = '<input type="number" class="form-control" id="host" placeholder=" " value="42">'
  const HOST_SELECT = '<select id="host" multiple><option value="1">Angular</option></select>'
  const HOST_SELECT_SELECTED = '<select id="host" multiple><option value="1" selected>Angular</option></select>'
  const SELECTED = [{ ...OPTIONS[0], selected: true }, OPTIONS[1]]

  const cases = [
    ['Date Input',
      () => build(HOST_DIV, DateInput, {}),
      () => build(HOST_DIV, DateInput, { date: DATE })],
    ['Password Input',
      () => build(HOST_INPUT, PasswordInput, {}),
      () => build(HOST_INPUT_VALUE, PasswordInput, {})],
    ['Number Input',
      () => build(HOST_NUMBER, NumberInput, {}),
      () => build(HOST_NUMBER_VALUE, NumberInput, { value: 42 })],
    ['Autocomplete',
      () => build(HOST_DIV, Autocomplete, { options: OPTIONS }),
      () => build(HOST_DIV, Autocomplete, { options: OPTIONS, value: 1 })],
    ['Multi Select',
      () => build(HOST_DIV, MultiSelect, { options: OPTIONS }),
      () => build(HOST_DIV, MultiSelect, { options: SELECTED })],
    // The docs example builds it from a `<select>`, a different init path that
    // has to reach the same structure.
    ['Multi Select over a select',
      () => build(HOST_SELECT, MultiSelect, {}),
      () => build(HOST_SELECT_SELECTED, MultiSelect, {})],
    // The pickers wrap one date-time control (two for the range) in the same
    // group; their empty state is the JS-managed class, not :placeholder-shown.
    ['Date Picker',
      () => build(HOST_DIV, DatePicker, { locale: 'en-US' }),
      () => build(HOST_DIV, DatePicker, { locale: 'en-US', date: DATE })],
    ['Time Picker',
      () => build(HOST_DIV, TimePicker, { locale: 'en-US' }),
      () => build(HOST_DIV, TimePicker, { locale: 'en-US', time: new Date(2026, 0, 1, 14, 30) })],
    ['Date Time Picker',
      () => build(HOST_DIV, DateTimePicker, { locale: 'en-US' }),
      () => build(HOST_DIV, DateTimePicker, { locale: 'en-US', date: DATE })],
    ['Date Range Picker',
      () => build(HOST_DIV, DateRangePicker, { locale: 'en-US' }),
      () => build(HOST_DIV, DateRangePicker, { locale: 'en-US', startDate: DATE, endDate: new Date(2026, 6, 20) })]
  ]

  // The masks (and the range picker's arrow) hide at rest so the label has the
  // field to itself, and come back once it floats.
  it('hides the picker mask while at rest and reveals it when filled', () => {
    const rest = build(HOST_DIV, DatePicker, { locale: 'en-US' })
    const restSection = rest.querySelector('.form-date-time-section')
    expect(getComputedStyle(restSection).color).toBe('rgba(0, 0, 0, 0)')

    const filled = build(HOST_DIV, DatePicker, { locale: 'en-US', date: DATE })
    const filledSection = filled.querySelector('.form-date-time-section')
    expect(getComputedStyle(filledSection).color).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('hides the range arrow while at rest', () => {
    const rest = build(HOST_DIV, DateRangePicker, { locale: 'en-US' })
    expect(getComputedStyle(rest.querySelector('.form-control-icon')).color).toBe('rgba(0, 0, 0, 0)')
  })

  // With only the start set, the empty end would stand bare under no label if
  // its mask showed — each control reveals its own, the arrow says "a second
  // date belongs here".
  it('keeps the empty end mask hidden while only the start date is set', () => {
    const root = build(HOST_DIV, DateRangePicker, { locale: 'en-US', startDate: DATE })
    const [start, end] = root.querySelectorAll('.form-date-time')
    expect(getComputedStyle(start.querySelector('.form-date-time-section')).color).not.toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(end.querySelector('.form-date-time-section')).color).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(root.querySelector('.form-control-icon')).color).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('floats the range label once only the start date is set', () => {
    const root = build(HOST_DIV, DateRangePicker, { locale: 'en-US', startDate: DATE })
    expect(labelFloats(root)).toBeTrue()
  })

  // The toggle is created by the component, so a wrong data attribute in an
  // example kills it silently while the label keeps floating via the plain-input
  // rules — which is exactly how it slipped past the first review pass.
  it('keeps the password toggle visible and centred under .form-floating', () => {
    const root = build('<input type="password" class="form-control" id="host" placeholder=" " value="secret">', PasswordInput, {})
    const group = root.querySelector('.form-control-group')
    const button = group.querySelector('.form-control-action')
    const g = group.getBoundingClientRect()
    const b = button.getBoundingClientRect()
    expect(b.height).toBeGreaterThan(0)
    expect(Math.abs((b.top + (b.height / 2)) - (g.top + (g.height / 2)))).toBeLessThanOrEqual(1)
  })

  for (const [name, empty, filled] of cases) {
    it(`leaves the label in place while ${name} is empty`, () => {
      expect(labelFloats(empty())).toBeFalse()
    })

    it(`floats the label once ${name} has a value`, () => {
      expect(labelFloats(filled())).toBeTrue()
    })

    it(`gives ${name} the same height as a plain control`, () => {
      expect(wrapperHeight(empty())).toBe(plainHeight)
    })
  }
})

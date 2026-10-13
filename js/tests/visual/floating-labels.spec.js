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
import DateRangeInput from '../../src/date-range-input.js'
import DateRangePicker from '../../src/date-range-picker.js'
import MultiSelect from '../../src/multi-select.js'
import NumberInput from '../../src/number-input.js'
import PasswordInput from '../../src/password-input.js'
import TimePicker from '../../src/time-picker.js'

const OPTIONS = [{ value: 1, label: 'Angular' }, { value: 2, label: 'Bootstrap' }]
const DATE = new Date(2026, 6, 14)

let container

let labelFirst = false
let floatingClass = 'form-floating'

const mount = html => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 1rem; width: 420px;'
  const label = '<label for="host">Label</label>'
  container.innerHTML = `<div class="${floatingClass}">${labelFirst ? label + html : html + label}</div>`
  document.body.append(container)
  return container.querySelector('.form-floating')
}

const labelFloats = root => getComputedStyle(root.querySelector('label')).transform !== 'none'
const placeholderColor = element => getComputedStyle(element, '::placeholder').color
const TRANSPARENT = 'rgba(0, 0, 0, 0)'
const wrapperHeight = root => Math.round((root.querySelector(':scope > :not(label)')).getBoundingClientRect().height)

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

  it('shows the placeholder of a plain control only while it has focus', () => {
    const input = mount('<input type="text" class="form-control" id="host" placeholder="name@example.com">').querySelector('input')
    expect(placeholderColor(input)).toBe(TRANSPARENT)

    input.focus()
    expect(placeholderColor(input)).not.toBe(TRANSPARENT)
  })

  describe('.form-floating-always', () => {
    afterEach(() => {
      floatingClass = 'form-floating'
    })

    it('keeps an empty plain control floated with its placeholder showing', () => {
      floatingClass = 'form-floating form-floating-always'
      const root = mount('<input type="text" class="form-control" id="host" placeholder="name@example.com">')
      const input = root.querySelector('input')
      const filled = mount('<input type="text" class="form-control" id="host" placeholder=" " value="x">').querySelector('input')

      expect(labelFloats(root)).toBeTrue()
      expect(placeholderColor(input)).not.toBe(TRANSPARENT)
      expect(getComputedStyle(input).paddingTop).toBe(getComputedStyle(filled).paddingTop)
      expect(getComputedStyle(input).paddingBottom).toBe(getComputedStyle(filled).paddingBottom)
    })

    it('applies from an ancestor of the wrapper', () => {
      floatingClass = 'form-floating'
      container = document.createElement('div')
      container.className = 'form-floating-always'
      container.innerHTML = '<div class="form-floating"><input type="text" class="form-control" id="host" placeholder="name@example.com"><label for="host">Label</label></div>'
      document.body.append(container)

      expect(labelFloats(container.querySelector('.form-floating'))).toBeTrue()
      expect(placeholderColor(container.querySelector('input'))).not.toBe(TRANSPARENT)
    })

    for (const order of ['label after', 'label first']) {
      it(`backs the label of an empty textarea, ${order}`, () => {
        floatingClass = 'form-floating form-floating-always'
        labelFirst = order === 'label first'
        const label = mount('<textarea class="form-control" id="host" placeholder="Leave a comment"></textarea>').querySelector('label')
        labelFirst = false

        expect(getComputedStyle(label, '::after').content).toBe('""')
      })
    }

    it('keeps the placeholder of a plain-text field hidden, focused or always floated', () => {
      const html = '<input type="email" readonly class="form-control-plaintext" id="host" placeholder="name@example.com">'
      const focused = mount(html).querySelector('input')
      focused.focus()
      expect(placeholderColor(focused)).toBe(TRANSPARENT)

      floatingClass = 'form-floating form-floating-always'
      expect(placeholderColor(mount(html).querySelector('input'))).toBe(TRANSPARENT)
    })
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
      () => build(HOST_DIV, DatePicker, { locale: 'en-US', timepicker: true }),
      () => build(HOST_DIV, DatePicker, { locale: 'en-US', date: DATE, timepicker: true })],
    ['Date Range Picker',
      () => build(HOST_DIV, DateRangePicker, { locale: 'en-US' }),
      () => build(HOST_DIV, DateRangePicker, { locale: 'en-US', startDate: DATE, endDate: new Date(2026, 6, 20) })]
  ]

  it('shows the placeholder of a field component only while its control has focus', () => {
    const root = build('<input type="text" class="form-control" id="host" placeholder="Password">', PasswordInput, {})
    const input = root.querySelector('input.form-control')
    expect(placeholderColor(input)).toBe(TRANSPARENT)

    input.focus()
    expect(placeholderColor(input)).not.toBe(TRANSPARENT)
  })

  it('shows the placeholder of an empty field component under .form-floating-always', () => {
    floatingClass = 'form-floating form-floating-always'
    const root = build('<input type="text" class="form-control" id="host" placeholder="Password">', PasswordInput, {})
    floatingClass = 'form-floating'

    expect(placeholderColor(root.querySelector('input.form-control'))).not.toBe(TRANSPARENT)
  })

  const blockPadding = element => {
    const style = getComputedStyle(element)
    return `${style.paddingTop} ${style.paddingBottom}`
  }

  it('gives an empty field component and a nested picker the floated padding under .form-floating-always', () => {
    const filledInput = build(HOST_INPUT_VALUE, PasswordInput, {}).querySelector('input.form-control')
    const filledRange = build(HOST_DIV, DateRangePicker, { locale: 'en-US', startDate: DATE, endDate: new Date(2026, 6, 20) })
      .querySelector('.form-date-time')
    floatingClass = 'form-floating form-floating-always'
    const input = build(HOST_INPUT, PasswordInput, {}).querySelector('input.form-control')
    const range = build(HOST_DIV, DateRangePicker, { locale: 'en-US' })
    floatingClass = 'form-floating'

    expect(range.querySelector('.picker > .form-control-group')).not.toBeNull()
    expect(blockPadding(input)).toBe(blockPadding(filledInput))
    expect(blockPadding(range.querySelector('.form-date-time'))).toBe(blockPadding(filledRange))
  })

  it('shows the empty picker mask and the range arrow under .form-floating-always', () => {
    floatingClass = 'form-floating form-floating-always'
    const root = build(HOST_DIV, DateRangePicker, { locale: 'en-US' })
    const single = build(HOST_DIV, DatePicker, { locale: 'en-US' })
    const input = build(HOST_DIV, DateInput, {})
    floatingClass = 'form-floating'

    expect(getComputedStyle(root.querySelector('.form-date-time-section')).color).not.toBe(TRANSPARENT)
    expect(getComputedStyle(root.querySelector('.form-control-icon')).color).not.toBe(TRANSPARENT)
    expect(getComputedStyle(single.querySelector('.form-date-time-section')).color).not.toBe(TRANSPARENT)
    expect(getComputedStyle(input.querySelector('.form-date-time-section')).color).not.toBe(TRANSPARENT)
  })

  const rulesSettingNoTransform = element => {
    const found = []
    const walk = rule => {
      for (const child of rule.cssRules ?? []) {
        walk(child)
      }

      if (rule.selectorText && rule.style?.transform === 'none' && element.matches(rule.selectorText)) {
        found.push(rule.selectorText)
      }
    }

    for (const sheet of document.styleSheets) {
      walk(sheet)
    }

    return found
  }

  it('lets no rule put the label of an empty field back under .form-floating-always', () => {
    floatingClass = 'form-floating form-floating-always'
    const roots = [
      build(HOST_DIV, DateInput, {}),
      build(HOST_DIV, DatePicker, { locale: 'en-US' }),
      build(HOST_DIV, DateRangePicker, { locale: 'en-US' }),
      build(HOST_DIV, MultiSelect, { options: OPTIONS })
    ]
    floatingClass = 'form-floating'

    for (const root of roots) {
      expect(rulesSettingNoTransform(root.querySelector('label'))).toEqual([])
    }
  })

  it('gives an empty Multi Select the floated padding under .form-floating-always', () => {
    const filled = build(HOST_DIV, MultiSelect, { options: SELECTED })
    floatingClass = 'form-floating form-floating-always'
    const empty = build(HOST_DIV, MultiSelect, { options: OPTIONS })
    floatingClass = 'form-floating'

    expect(blockPadding(empty.querySelector('.form-multi-select-selection')))
      .toBe(blockPadding(filled.querySelector('.form-multi-select-selection')))
  })

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

  // Search mode renders no placeholder element — a single selection lives in
  // the search input's placeholder attribute — so the states must come from the
  // JS-managed filled class, and the resting label must also silence the search
  // input's own placeholder text.
  it('rests the label over an empty searchable Multi Select and hides its placeholder', () => {
    const root = build(HOST_DIV, MultiSelect, { options: OPTIONS, search: true })
    expect(labelFloats(root)).toBeFalse()
    const search = root.querySelector('.form-multi-select-search')
    expect(getComputedStyle(search, '::placeholder').color).toBe('rgba(0, 0, 0, 0)')
  })

  it('floats the label once a searchable single Multi Select has a selection', () => {
    const root = build(HOST_DIV, MultiSelect, { multiple: false, options: SELECTED, search: true })
    expect(labelFloats(root)).toBeTrue()
  })

  // The label anchors its scale at the inline start, so in RTL the origin and
  // the inline shift have to mirror or the label drifts off its own field.
  it('scales the label from the inline-start edge in RTL', () => {
    document.documentElement.dir = 'rtl'

    try {
      const root = mount('<input type="text" class="form-control" id="host" placeholder=" " value="x">')
      const label = root.querySelector('label')
      const { transform, transformOrigin } = getComputedStyle(label)
      const [originX] = transformOrigin.split(' ')
      const translateX = Number(transform.match(/matrix\((?:[^,]+,){4}\s*([^,]+)/)[1])

      expect(Math.round(Number.parseFloat(originX))).toBe(label.offsetWidth)
      expect(translateX).toBeLessThan(0)
    } finally {
      document.documentElement.dir = ''
    }
  })

  it('scales the label from the left edge in LTR', () => {
    const root = mount('<input type="text" class="form-control" id="host" placeholder=" " value="x">')
    const label = root.querySelector('label')
    const { transform, transformOrigin } = getComputedStyle(label)
    const translateX = Number(transform.match(/matrix\((?:[^,]+,){4}\s*([^,]+)/)[1])

    expect(transformOrigin).toMatch(/^0px 0px/)
    expect(translateX).toBeGreaterThan(0)
  })

  // `floatingLabel` puts the field inside `.form-floating` inside the group, so
  // the cleaner and validation rules keyed to `> .form-date-time` must reach
  // one level deeper as well.
  const buildLabelled = config => {
    container = document.createElement('div')
    container.style.cssText = 'padding: 1rem; width: 420px;'
    container.innerHTML = '<div id="host"></div>'
    document.body.append(container)

    new DatePicker(container.querySelector('#host'), { locale: 'en-US', floatingLabel: 'Delivery date', ...config })
    return container.querySelector('.form-control-group')
  }

  it('hides the cleaner of a floating-labelled picker while it is empty', () => {
    const group = buildLabelled({})
    expect(getComputedStyle(group.querySelector('.form-control-cleaner')).display).toBe('none')
  })

  it('shows the cleaner of a floating-labelled picker once it is filled', () => {
    const group = buildLabelled({ date: DATE })
    expect(getComputedStyle(group.querySelector('.form-control-cleaner')).display).not.toBe('none')
  })

  it('carries the invalid state of a floating-labelled field to the frame', () => {
    const plain = build(HOST_DIV, DatePicker, { locale: 'en-US', date: DATE })
    plain.querySelector('.form-date-time').classList.add('is-invalid')
    const reference = getComputedStyle(plain.querySelector('.form-control-group')).borderColor

    const valid = buildLabelled({ date: DATE })
    expect(getComputedStyle(valid).borderColor).not.toBe(reference)

    const invalid = buildLabelled({ date: DATE })
    invalid.querySelector('.form-date-time').classList.add('is-invalid')
    expect(getComputedStyle(invalid).borderColor).toBe(reference)
  })

  // The per-field mode: startLabel / endLabel render a label inside the group
  // over each date, no wrapper markup. Each floats on its own field's state.
  const buildTwoLabel = config => {
    container = document.createElement('div')
    container.style.cssText = 'padding: 1rem; width: 640px;'
    container.innerHTML = '<div id="host"></div>'
    document.body.append(container)

    new DateRangePicker(container.querySelector('#host'), {
      locale: 'en-US', startFloatingLabel: 'Check-in', endFloatingLabel: 'Check-out', ...config
    })
    return container.querySelector('.form-control-group')
  }

  const floatsByText = (group, text) =>
    getComputedStyle([...group.querySelectorAll('label')].find(l => l.textContent === text)).transform !== 'none'

  it('renders a label per range field and floats only the filled one', () => {
    const group = buildTwoLabel({ startDate: DATE })
    expect(floatsByText(group, 'Check-in')).toBeTrue()
    expect(floatsByText(group, 'Check-out')).toBeFalse()
  })

  it('rests both range labels while the range is empty', () => {
    const group = buildTwoLabel({})
    expect(floatsByText(group, 'Check-in')).toBeFalse()
    expect(floatsByText(group, 'Check-out')).toBeFalse()
  })

  it('floats both range labels once both dates are set', () => {
    const group = buildTwoLabel({ startDate: DATE, endDate: new Date(2026, 6, 20) })
    expect(floatsByText(group, 'Check-in')).toBeTrue()
    expect(floatsByText(group, 'Check-out')).toBeTrue()
  })

  it('keeps the per-field-labelled group at a plain control height', () => {
    const group = buildTwoLabel({ startDate: DATE })
    expect(Math.round(group.getBoundingClientRect().height)).toBe(plainHeight)
  })

  // The field keeps its own inline padding, so the group's start padding would
  // stack under it and indent label and value twice.
  it('starts the range value at a plain control text offset', () => {
    const group = buildTwoLabel({ startDate: DATE })
    const section = group.querySelector('.form-date-time-section')
    const inset = Math.round(section.getBoundingClientRect().left - group.getBoundingClientRect().left)
    expect(inset).toBeLessThanOrEqual(14)
  })

  // The single pickers take the same shape through `floatingLabel` — the
  // component renders wrapper and label itself, no markup needed.
  it('renders and floats the single picker label from the floatingLabel option', () => {
    container = document.createElement('div')
    container.style.cssText = 'padding: 1rem; width: 420px;'
    container.innerHTML = '<div id="host"></div>'
    document.body.append(container)

    new DatePicker(container.querySelector('#host'), { locale: 'en-US', floatingLabel: 'Delivery date', date: DATE })
    const group = container.querySelector('.form-control-group')
    const label = group.querySelector('label')
    expect(label.textContent).toBe('Delivery date')
    expect(getComputedStyle(label).transform).not.toBe('none')
    expect(Math.round(group.getBoundingClientRect().height)).toBe(plainHeight)
  })

  it('floats the label a picker builds from the floatingLabel option when its host carries .form-floating-always', () => {
    container = document.createElement('div')
    container.style.cssText = 'padding: 1rem; width: 420px;'
    container.innerHTML = '<div id="host" class="form-floating-always"></div>'
    document.body.append(container)

    new DatePicker(container.querySelector('#host'), { locale: 'en-US', floatingLabel: 'Delivery date' })
    const group = container.querySelector('.form-control-group')
    expect(getComputedStyle(group.querySelector('label')).transform).not.toBe('none')
    expect(getComputedStyle(group.querySelector('.form-date-time-section')).color).not.toBe(TRANSPARENT)
    expect(Math.round(group.getBoundingClientRect().height)).toBe(plainHeight)
  })

  it('floats both labels a date range input builds when its host carries .form-floating-always', () => {
    container = document.createElement('div')
    container.style.cssText = 'padding: 1rem; width: 420px;'
    container.innerHTML = '<div id="host" class="form-floating-always"></div>'
    document.body.append(container)

    new DateRangeInput(container.querySelector('#host'), { locale: 'en-US', startFloatingLabel: 'Check-in', endFloatingLabel: 'Check-out' })
    const labels = container.querySelectorAll('.form-floating > label')
    expect(labels.length).toBe(2)
    for (const label of labels) {
      expect(getComputedStyle(label).transform).not.toBe('none')
    }
  })

  // With only the start set and no focus, the empty half shows nothing at all:
  // the end would stand bare under no label if its mask showed, and the arrow —
  // mid-field, since the pair flexes 50/50 — would hang over nothing.
  it('shows only the start date while the rest of the range is empty and blurred', () => {
    const root = build(HOST_DIV, DateRangePicker, { locale: 'en-US', startDate: DATE })
    const [start, end] = root.querySelectorAll('.form-date-time')
    expect(getComputedStyle(start.querySelector('.form-date-time-section')).color).not.toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(end.querySelector('.form-date-time-section')).color).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(root.querySelector('.form-control-icon')).color).toBe('rgba(0, 0, 0, 0)')
  })

  it('shows the arrow once the end date is set', () => {
    const root = build(HOST_DIV, DateRangePicker, { locale: 'en-US', startDate: DATE, endDate: new Date(2026, 6, 20) })
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

  // The label may sit either side of the control — the docs write it first, the
  // v5 order still works — so every case runs in both directions.
  for (const order of ['label after', 'label first']) {
    describe(order, () => {
      beforeEach(() => {
        labelFirst = order === 'label first'
      })

      afterEach(() => {
        labelFirst = false
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

        it(`floats the label of an empty ${name} under .form-floating-always`, () => {
          floatingClass = 'form-floating form-floating-always'
          const root = empty()
          floatingClass = 'form-floating'

          expect(labelFloats(root)).toBeTrue()
          expect(wrapperHeight(root)).toBe(plainHeight)
        })
      }
    })
  }
})

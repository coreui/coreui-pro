/*!
 * The frame takeover: a component that turns an element the author wrote into
 * `.form-control-group` inherits that element's computed border colour, which
 * is the initial `currentColor` — the body text. The frame transitions
 * `border-color`, so without silencing that transition for the takeover the
 * field loads with a black border fading to grey. Only a real browser with the
 * stylesheet can see it, which is why this lives in the visual suite.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import DateInput from '../../src/date-input.js'
import DatePicker from '../../src/date-picker.js'
import DateRangeInput from '../../src/date-range-input.js'
import DateRangePicker from '../../src/date-range-picker.js'
import DateTimePicker from '../../src/date-time-picker.js'
import TimePicker from '../../src/time-picker.js'

let container

const mount = () => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 1rem; width: 420px;'
  container.innerHTML = '<div id="host"></div>'
  document.body.append(container)
  return container.querySelector('#host')
}

// The border colour a frame is supposed to settle on, read from a field that
// was never anything else.
let restingBorderColor

afterEach(() => container?.remove())

describe('control frame takeover', () => {
  beforeAll(() => {
    const host = mount()
    const input = new DateInput(host, { locale: 'en-US' })
    restingBorderColor = getComputedStyle(host).borderTopColor
    input.dispose()
    container.remove()
  })

  const cases = [
    ['Date Range Input', DateRangeInput, {}],
    ['Date Picker', DatePicker, {}],
    ['Time Picker', TimePicker, {}],
    ['Date Time Picker', DateTimePicker, {}],
    ['Date Range Picker', DateRangePicker, {}]
  ]

  it.each(cases)('%s reaches its border colour without animating from the text colour', (_name, Component, config) => {
    const host = mount()
    const textColor = getComputedStyle(host).color
    const instance = new Component(host, { locale: 'en-US', ...config })
    const frame = host.classList.contains('form-control-group') ?
      host :
      host.querySelector('.form-control-group')

    const { borderTopColor, transitionProperty } = getComputedStyle(frame)

    expect(borderTopColor).toEqual(restingBorderColor)
    expect(borderTopColor).not.toEqual(textColor)
    // The transition is only silenced for the takeover — focus and validation
    // states still animate.
    expect(transitionProperty).toContain('border-color')

    instance.dispose()
  })
})

/*!
 * A component that owns a frame keeps the validation state on the control
 * inside it, while the feedback the author writes sits next to the frame. The
 * frame is supposed to answer for what it holds, which is a question about a
 * selector, so only a real browser with the stylesheet can settle it.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import DateRangeInput from '../../src/date-range-input.js'
import PasswordInput from '../../src/password-input.js'

let container
let instance

const mount = (markup, config = {}) => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 1rem; width: 420px;'
  container.innerHTML = markup
  document.body.append(container)

  const host = container.querySelector('#host')

  if (host) {
    instance = new DateRangeInput(host, { format: 'dd.MM.yyyy', locale: 'en-US', ...config })
  }

  return container
}

const displayOf = selector => getComputedStyle(container.querySelector(selector)).display
const fields = () => [...container.querySelectorAll('.form-date-time')]

describe('validation feedback next to a frame', () => {
  afterEach(() => {
    instance?.dispose()
    instance = null
    container?.remove()
  })

  it('shows the message for a plain frame holding an invalid control', () => {
    mount('<div class="form-control-group"><input class="form-control is-invalid"></div><div class="invalid-feedback">Pick another value.</div>')

    expect(displayOf('.invalid-feedback')).toBe('block')
  })

  it('shows the message when a field inside a date range is invalid', () => {
    mount('<div id="host"></div><div class="invalid-feedback">Pick both dates.</div>')

    expect(displayOf('.invalid-feedback')).toBe('none')

    fields()[0].classList.add('is-invalid')

    expect(displayOf('.invalid-feedback')).toBe('block')
  })

  it('keeps the success message away while anything inside is invalid', () => {
    mount('<div id="host"></div><div class="valid-feedback">Looks good!</div>')

    const [start, end] = fields()

    start.classList.add('is-valid')
    end.classList.add('is-invalid')

    expect(displayOf('.valid-feedback')).toBe('none')

    end.classList.remove('is-invalid')
    end.classList.add('is-valid')

    expect(displayOf('.valid-feedback')).toBe('block')
  })

  it('shows the message for a control the browser marks invalid', () => {
    mount('<form data-coreui-validate><input class="form-control" data-coreui-password-input required><div class="invalid-feedback">Pick a password.</div></form>')

    const form = container.querySelector('form')
    const password = new PasswordInput(container.querySelector('input'))

    form.addEventListener('submit', event => event.preventDefault())

    expect(displayOf('.invalid-feedback')).toBe('none')

    form.requestSubmit()

    expect(container.querySelector('input').matches(':user-invalid')).toBeTrue()
    expect(displayOf('.invalid-feedback')).toBe('block')

    password.dispose()
  })

  it('shows the message for a frame nested below the field wrapper', () => {
    mount('<div class="form-field"><div class="picker"><div class="form-control-group"><input class="form-control is-invalid"></div></div><div class="invalid-feedback">Pick both dates.</div></div>')

    expect(displayOf('.invalid-feedback')).toBe('block')
  })

  it('leaves a control deeper than the frame alone, the way the border does', () => {
    mount('<div class="form-control-group"><span><input class="form-control is-invalid"></span></div><div class="invalid-feedback">Pick another value.</div>')

    expect(displayOf('.invalid-feedback')).toBe('none')
  })

  it('keeps the success message away while the frame itself is invalid', () => {
    mount('<div id="host" class="is-valid"></div><div class="valid-feedback">Looks good!</div>')

    instance.setRange(new Date(2026, 6, 20), new Date(2026, 6, 14))

    for (const field of fields()) {
      field.classList.add('is-valid')
    }

    expect(displayOf('.valid-feedback')).toBe('none')
  })
})

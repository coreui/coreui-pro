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
const borderOf = selector => getComputedStyle(container.querySelector(selector)).borderTopColor
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

  it('styles a frame the author wrote the state around', () => {
    mount('<div id="wrapped" class="is-invalid"><div class="form-control-group"><input class="form-control"></div></div><div class="invalid-feedback">Pick both dates.</div><div id="plain"><div class="form-control-group"><input class="form-control"></div></div>')

    expect(borderOf('#wrapped .form-control-group')).not.toEqual(borderOf('#plain .form-control-group'))
    expect(displayOf('.invalid-feedback')).toEqual('block')
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

  it('shows the success message for a control the browser marks valid', () => {
    mount('<form data-coreui-validate="valid" novalidate><div class="form-control-group"><input class="form-control" value="secret" required></div><div class="valid-feedback">Looks good!</div></form>')
    const form = container.querySelector('form')

    form.addEventListener('submit', event => event.preventDefault())

    expect(displayOf('.valid-feedback')).toBe('none')

    form.requestSubmit()

    expect(container.querySelector('input').matches(':user-valid')).toBeTrue()
    expect(displayOf('.valid-feedback')).toBe('block')
  })

  it('shows the success message inside the field for a control the browser marks valid', () => {
    mount('<form data-coreui-validate="valid" novalidate><div class="form-field"><div class="form-control-group"><input class="form-control" value="secret" required></div><div><div class="valid-feedback">Looks good!</div></div></div></form>')
    const form = container.querySelector('form')

    form.addEventListener('submit', event => event.preventDefault())
    form.requestSubmit()

    expect(displayOf('.valid-feedback')).toBe('block')
  })

  it('keeps the success message and the success border away while a valid control sits in an invalid frame', () => {
    mount('<form data-coreui-validate="valid" novalidate><div id="frame" class="form-control-group is-invalid"><input class="form-control" value="taken"></div><div class="invalid-feedback">Taken.</div><div class="valid-feedback">Looks good!</div></form><div id="reference" class="form-control-group is-invalid"><input class="form-control"></div>')
    const form = container.querySelector('form')

    form.addEventListener('submit', event => event.preventDefault())
    form.requestSubmit()

    expect(container.querySelector('#frame input').matches(':user-valid')).toBeTrue()
    expect(displayOf('.invalid-feedback')).toBe('block')
    expect(displayOf('.valid-feedback')).toBe('none')
    expect(borderOf('#frame')).toBe(borderOf('#reference'))
  })

  it('keeps the success message away while another control of the frame is invalid', () => {
    mount('<form data-coreui-validate="valid" novalidate><div class="form-control-group"><input class="form-control" required><select class="form-select"><option>kg</option></select></div><div class="invalid-feedback">Required.</div><div class="valid-feedback">Looks good!</div></form>')
    const form = container.querySelector('form')

    form.addEventListener('submit', event => event.preventDefault())
    form.requestSubmit()

    expect(container.querySelector('select').matches(':user-valid')).toBeTrue()
    expect(displayOf('.invalid-feedback')).toBe('block')
    expect(displayOf('.valid-feedback')).toBe('none')
  })

  it('keeps the success message away for a helper field that validates nothing', () => {
    mount('<form data-coreui-validate="valid" novalidate><div class="form-control-group"><input value="tag"></div><div class="valid-feedback">Looks good!</div></form>')
    const form = container.querySelector('form')

    form.addEventListener('submit', event => event.preventDefault())
    form.requestSubmit()

    expect(container.querySelector('input').matches(':user-valid')).toBeTrue()
    expect(displayOf('.valid-feedback')).toBe('none')
  })
})

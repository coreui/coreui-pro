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

  it('shows the message in the field around an input group holding an invalid control', () => {
    mount('<div class="form-field"><div class="input-group"><span class="input-group-text">@</span><input class="form-control"></div><div class="invalid-feedback">Choose a username.</div></div>')

    expect(displayOf('.invalid-feedback')).toBe('none')

    container.querySelector('.form-control').classList.add('is-invalid')

    expect(displayOf('.invalid-feedback')).toBe('block')
  })

  it('shows the message in the field around an input group holding an invalid floating label', () => {
    mount('<div class="form-field"><div class="input-group"><span class="input-group-text">@</span><div class="form-floating"><label for="user">Username</label><input class="form-control is-invalid" id="user"></div></div><div class="invalid-feedback">Choose a username.</div></div>')

    expect(displayOf('.invalid-feedback')).toBe('block')
  })

  it('keeps the success message away while a frame inside an input group holds an error', () => {
    mount('<div class="form-field"><div class="input-group"><span class="input-group-text">@</span><div class="form-control-group is-invalid"><input class="form-control is-valid"></div></div><div class="valid-feedback">Looks good!</div><div class="invalid-feedback">Pick another value.</div></div>')

    expect(displayOf('.valid-feedback')).toBe('none')
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

  it('draws a reversed range with the valid option in the invalid colour', () => {
    mount('<div id="host" style="transition: none"></div><div id="reference" class="form-control-group is-invalid"><input class="form-control"></div>', {
      endDate: new Date(2026, 6, 14),
      startDate: new Date(2026, 6, 20),
      valid: true
    })

    expect(borderOf('#host')).toEqual(borderOf('#reference'))
  })

  it('keeps the success message away from floating labels while an end is invalid', () => {
    const config = {
      endDate: new Date(2026, 6, 20),
      endFloatingLabel: 'Check-out',
      maxDate: new Date(2026, 6, 14),
      startDate: new Date(2026, 6, 10),
      startFloatingLabel: 'Check-in',
      valid: true
    }

    for (const markup of [
      '<div id="host"></div><div class="invalid-feedback">Pick an earlier day.</div><div class="valid-feedback">Looks good!</div>',
      '<div class="form-field"><div id="host"></div><div class="invalid-feedback">Pick an earlier day.</div><div class="valid-feedback">Looks good!</div></div>',
      '<div id="host"></div><div class="invalid-tooltip">Pick an earlier day.</div><div class="valid-tooltip">Looks good!</div>'
    ]) {
      mount(markup, config)

      expect(fields().map(field => field.classList.contains('is-valid'))).toEqual([true, false])
      expect(displayOf('[class^="invalid-"]')).toBe('block')
      expect(displayOf('[class^="valid-"]')).toBe('none')

      instance.dispose()
      container.remove()
    }

    instance = null
  })

  it('shows the success message for floating labels once both ends are valid', () => {
    const config = {
      endDate: new Date(2026, 6, 14),
      endFloatingLabel: 'Check-out',
      startDate: new Date(2026, 6, 10),
      startFloatingLabel: 'Check-in',
      valid: true
    }

    for (const markup of [
      '<div id="host"></div><div class="valid-feedback">Looks good!</div>',
      '<div class="form-field"><div id="host"></div><div><div class="valid-feedback">Looks good!</div></div></div>',
      '<div id="host"></div><div class="valid-tooltip">Looks good!</div>'
    ]) {
      mount(markup, config)

      expect(displayOf('[class^="valid-"]')).toBe('block')

      instance.dispose()
      container.remove()
    }

    instance = null
  })

  it('keeps the success message of an invalid frame hidden after a valid one', () => {
    for (const control of ['<input class="form-control is-valid">', '<div class="form-floating"><input class="form-control is-valid"></div>']) {
      mount(`<div class="form-control-group">${control}</div><div class="valid-feedback">Strong.</div><div class="form-control-group"><input class="form-control is-invalid"></div><div class="invalid-feedback">No match.</div><div id="second" class="valid-feedback">Matches.</div>`)

      expect(displayOf('.valid-feedback')).toBe('block')
      expect(displayOf('#second')).toBe('none')

      container.remove()
    }
  })

  it('leaves class-driven success alone in a form that did not opt in', () => {
    mount('<form novalidate><div class="form-control-group"><input class="form-control is-valid" value="12"><select class="form-select" required><option value="">unit</option></select></div><div class="valid-feedback">Looks good!</div></form>')
    const form = container.querySelector('form')

    form.addEventListener('submit', event => event.preventDefault())
    form.requestSubmit()

    expect(container.querySelector('select').matches(':user-invalid')).toBeTrue()
    expect(displayOf('.valid-feedback')).toBe('block')
  })

  it('keeps the success message away while a control in a valid frame is user-invalid', () => {
    for (const markup of [
      '<form data-coreui-validate="valid" novalidate><div class="form-control-group is-valid"><input class="form-control" required></div><div class="invalid-feedback">Required.</div><div class="valid-feedback">Looks good!</div></form>',
      '<form data-coreui-validate="valid" novalidate><div class="form-field"><div class="form-control-group is-valid"><input class="form-control" required></div><div><div class="valid-feedback">Looks good!</div></div></div></form>',
      '<form data-coreui-validate="valid" novalidate><div class="form-field"><div class="input-group"><input class="form-control" value="1" required><input class="form-control" required></div><div class="valid-feedback">Looks good!</div></div></form>'
    ]) {
      mount(markup)
      const form = container.querySelector('form')

      form.addEventListener('submit', event => event.preventDefault())
      form.requestSubmit()

      expect(displayOf('.valid-feedback')).toBe('none')

      container.remove()
    }
  })

  it('keeps the success message away for a helper field that validates nothing', () => {
    mount('<form data-coreui-validate="valid" novalidate><div class="form-control-group"><input value="tag"></div><div class="valid-feedback">Looks good!</div></form>')
    const form = container.querySelector('form')

    form.addEventListener('submit', event => event.preventDefault())
    form.requestSubmit()

    expect(container.querySelector('input').matches(':user-valid')).toBeTrue()
    expect(displayOf('.valid-feedback')).toBe('none')
  })

  it('lays the value field of each end over its field, invisible and out of the pointer\'s way', async () => {
    mount('<form data-coreui-validate novalidate><div class="form-field"><div id="host"></div><div class="invalid-feedback">Pick both dates.</div></div></form>', { required: true })
    const form = container.querySelector('form')

    form.addEventListener('submit', event => event.preventDefault())
    form.requestSubmit()

    for (const field of fields()) {
      const input = field.querySelector(':scope > textarea')
      const styles = getComputedStyle(input)
      const fieldRect = field.getBoundingClientRect()
      const inputRect = input.getBoundingClientRect()

      expect(input.matches(':user-invalid')).toBeTrue()
      expect(styles.opacity).toBe('0')
      expect(styles.pointerEvents).toBe('none')
      expect([inputRect.left, inputRect.top, inputRect.width, inputRect.height].map(Math.round))
        .toEqual([fieldRect.left + field.clientLeft, fieldRect.top + field.clientTop, field.clientWidth, field.clientHeight].map(Math.round))
    }

    await Promise.resolve()

    expect(displayOf('.invalid-feedback')).toBe('block')
  })
})

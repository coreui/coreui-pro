/*!
 * A message shows for the control it belongs to, whether it follows the control
 * or sits in the .form-field around a check, a radio, a switch, an input group
 * or a frame, on the class path and on the browser path alike. Whether it shows
 * is a question about selectors, so only a real browser with the stylesheet can
 * settle it.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { userEvent } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import DateInput from '../../src/date-input.js'
import DatePicker from '../../src/date-picker.js'
import DateRangeInput from '../../src/date-range-input.js'
import DateRangePicker from '../../src/date-range-picker.js'
import OTPInput from '../../src/otp-input.js'
import TimePicker from '../../src/time-picker.js'
import { updateValidationState, validateForm } from '../../src/util/form-validation.js'

const FEEDBACK = '<div class="invalid-feedback">Error</div><div class="valid-feedback">Looks good!</div>'

const LAYOUTS = {
  'next to the control': `<input class="form-control" data-test required>${FEEDBACK}`,
  'after a frame': `<div class="form-control-group"><input class="form-control" data-test required></div>${FEEDBACK}`,
  'after an input group': `<div class="input-group"><span class="input-group-text">@</span><input class="form-control" data-test required></div>${FEEDBACK}`,
  'after a floating label': `<div class="form-floating"><input class="form-control" id="floatingAlone" placeholder="Name" data-test required><label for="floatingAlone">Name</label></div>${FEEDBACK}`,
  'after a floating label holding a select': `<div class="form-floating"><select class="form-select" id="floatingSelect" data-test required><option value="">Pick</option><option value="a">A</option></select><label for="floatingSelect">Pick</label></div>${FEEDBACK}`,
  'after an input group with a floating label': `<div class="input-group"><span class="input-group-text">@</span><div class="form-floating"><input class="form-control" id="floating" placeholder="Name" data-test required><label for="floating">Name</label></div></div>${FEEDBACK}`,
  'after an input group holding a select': `<div class="input-group"><span class="input-group-text">@</span><select class="form-select" data-test required><option value="">Pick</option><option value="a">A</option></select></div>${FEEDBACK}`,
  'in the content of a check': `<input class="check" type="checkbox" id="check" data-test required><div class="form-field-content"><label for="check">Agree</label><small class="form-text">Required.</small>${FEEDBACK}</div>`,
  'in the content of a radio': `<input class="radio" type="radio" name="plan" id="radio" data-test required><div class="form-field-content"><label for="radio">Basic</label>${FEEDBACK}</div>`,
  'in the content of a switch': `<input class="switch" type="checkbox" role="switch" id="switch" data-test required><div class="form-field-content"><label for="switch">Subscribe</label>${FEEDBACK}</div>`
}

const FIELDLESS_LAYOUTS = {
  'in a field inside an input group': '<div class="input-group"><span class="input-group-text">@</span><div class="form-field"><div class="form-floating"><input class="form-control" id="nested" placeholder="Name" data-test required><label for="nested">Name</label></div><div class="invalid-feedback">Error</div></div></div>',
  'in a field inside an input group inside a field': '<div class="form-field"><div class="input-group"><span class="input-group-text">@</span><div class="form-field"><div class="form-floating"><input class="form-control" id="nested" placeholder="Name" data-test required><label for="nested">Name</label></div><div class="invalid-feedback">Error</div></div></div></div>',
  'deeper than a frame': '<div class="form-field"><div class="form-control-group"><span><input class="form-control" data-test required></span></div><div class="invalid-feedback">Error</div></div>',
  'in a frame below the field wrapper': '<div class="form-field"><div class="picker"><div class="form-control-group"><input class="form-control" data-test required></div></div><div class="invalid-feedback">Error</div></div>',
  'in a frame inside an input group': `<div class="form-field"><div class="input-group"><span class="input-group-text">@</span><div class="form-control-group"><input class="form-control" data-test required></div></div>${FEEDBACK}</div>`,
  'bare in an input group': '<div class="form-field"><div class="input-group"><input data-test required></div><div class="invalid-feedback">Error</div></div>',
  'after a floating label inside a frame': '<div class="form-field"><div class="form-control-group"><div class="form-floating"><input class="form-control" id="framedFloating" placeholder="Name" data-test required><label for="framedFloating">Name</label></div><div class="invalid-feedback">Error</div></div></div>',
  'after a floating label inside a frame without a field': '<div class="form-control-group"><div class="form-floating"><input class="form-control" id="bareFramedFloating" placeholder="Name" data-test required><label for="bareFramedFloating">Name</label></div><div class="invalid-feedback">Error</div></div>',
  'in a range': '<div class="form-range"><input class="form-range-input" type="range" data-test></div><div class="invalid-feedback">Error</div>',
  'next to a range input inside the range wrapper': '<div class="form-range"><input type="number" data-test required></div><div class="invalid-feedback">Error</div>'
}

const DATE_LAYOUTS = {
  'next to a date field': [DateInput, `<div data-test></div>${FEEDBACK}`],
  'after a date field in an input group': [DateInput, `<div class="input-group"><span class="input-group-text">@</span><div class="form-control" data-test></div></div>${FEEDBACK}`],
  'inside a floating label after a date field': [DateInput, `<div class="form-floating"><div data-test></div><label>Due</label>${FEEDBACK}</div>`],
  'after a date picker': [DatePicker, `<div data-test></div>${FEEDBACK}`],
  'after a date range': [DateRangeInput, `<div data-test></div>${FEEDBACK}`],
  'after a date range picker': [DateRangePicker, `<div data-test></div>${FEEDBACK}`],
  'after a date picker the page also marks invalid': [DatePicker, `<div class="is-invalid" data-test></div>${FEEDBACK}`],
  'after a time picker the page also marks invalid': [TimePicker, `<div class="is-invalid" data-test></div>${FEEDBACK}`],
  'after a date range picker the page also marks invalid': [DateRangePicker, `<div class="is-invalid" data-test></div>${FEEDBACK}`],
  'next to a date range picker the page also marks invalid, outside a field': [DateRangePicker, `<div class="is-invalid" data-test></div>${FEEDBACK}`, { validationState: 'invalid' }, false]
}

let container

const mount = (fields, formAttributes = '', wrap = true) => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 1rem; width: 420px;'
  container.innerHTML = `<form ${formAttributes}>${wrap ? `<div class="form-field">${fields}</div>` : fields}</form>`
  document.body.append(container)

  const form = container.querySelector('form')
  form.addEventListener('submit', event => event.preventDefault())

  return form
}

const displayOf = selector => getComputedStyle(container.querySelector(selector)).display

const makeValid = control => {
  if (control.type === 'checkbox' || control.type === 'radio') {
    control.checked = true
  } else {
    control.value = control.tagName === 'SELECT' ? 'a' : 'filled'
  }
}

describe('messages of a form field', () => {
  afterEach(() => {
    container?.remove()
  })

  for (const [layout, fields] of Object.entries(LAYOUTS)) {
    describe(layout, () => {
      it('shows the error for a control marked invalid', () => {
        mount(fields)
        container.querySelector('[data-test]').classList.add('is-invalid')

        expect(displayOf('.invalid-feedback')).toBe('block')
        expect(displayOf('.valid-feedback')).toBe('none')
      })

      it('shows the success for a control marked valid', () => {
        mount(fields)
        container.querySelector('[data-test]').classList.add('is-valid')

        expect(displayOf('.valid-feedback')).toBe('block')
        expect(displayOf('.invalid-feedback')).toBe('none')
      })

      it('shows the error once the browser marks the control invalid', () => {
        mount(fields, 'data-coreui-validate="valid" novalidate').requestSubmit()

        expect(container.querySelector('[data-test]').matches(':user-invalid')).toBeTrue()
        expect(displayOf('.invalid-feedback')).toBe('block')
        expect(displayOf('.valid-feedback')).toBe('none')
      })

      it('shows the success once the browser marks the control valid', () => {
        const form = mount(fields, 'data-coreui-validate="valid" novalidate')
        makeValid(container.querySelector('[data-test]'))
        form.requestSubmit()

        expect(container.querySelector('[data-test]').matches(':user-valid')).toBeTrue()
        expect(displayOf('.valid-feedback')).toBe('block')
        expect(displayOf('.invalid-feedback')).toBe('none')
      })
    })
  }

  it('shows only the error after a floating label for a control marked invalid that the browser finds valid', () => {
    const form = mount(LAYOUTS['after a floating label'], 'data-coreui-validate="valid" novalidate')
    const control = container.querySelector('[data-test]')
    makeValid(control)
    form.requestSubmit()
    control.classList.add('is-invalid')

    expect(control.matches(':user-valid')).toBeTrue()
    expect(displayOf('.invalid-feedback')).toBe('block')
    expect(displayOf('.valid-feedback')).toBe('none')
  })

  it('shows only the error after a floating label the page marked invalid around a control the browser finds valid', () => {
    const form = mount(LAYOUTS['after a floating label'], 'data-coreui-validate="valid" novalidate')
    const control = container.querySelector('[data-test]')
    makeValid(control)
    form.requestSubmit()
    container.querySelector('.form-floating').classList.add('is-invalid')

    expect(control.matches(':user-valid')).toBeTrue()
    expect(displayOf('.invalid-feedback')).toBe('block')
    expect(displayOf('.valid-feedback')).toBe('none')
  })

  for (const [layout, fields, wrap] of [
    ...Object.entries(LAYOUTS).map(([layout, fields]) => [layout, fields, true]),
    ...Object.entries(FIELDLESS_LAYOUTS).map(([layout, fields]) => [layout, fields, false])
  ]) {
    it(`links to a control ${layout} the very messages it shows`, () => {
      const form = mount(fields, '', wrap)
      const control = container.querySelector('[data-test]')
      control.setCustomValidity('Error')

      updateValidationState(form, new WeakMap())

      const shown = [...container.querySelectorAll('.invalid-feedback, .invalid-tooltip')]
        .filter(feedback => getComputedStyle(feedback).display !== 'none')
      const linked = (control.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean)
        .map(id => document.getElementById(id))

      expect(linked).toEqual(shown)
    })
  }

  for (const [layout, [Component, fields, config = { validationState: 'invalid' }, wrap = true]] of Object.entries(DATE_LAYOUTS)) {
    it(`links to every section of an invalid date field the very messages it shows ${layout}`, () => {
      mount(fields, '', wrap)
      const instance = new Component(container.querySelector('[data-test]'), config)
      const shown = [...container.querySelectorAll('.invalid-feedback, .invalid-tooltip')]
        .filter(feedback => getComputedStyle(feedback).display !== 'none')

      expect(shown).toHaveSize(1)

      for (const section of container.querySelectorAll('[role="spinbutton"]')) {
        const linked = (section.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean)
          .map(id => document.getElementById(id))

        expect(linked).toEqual(shown)
      }

      instance.dispose()
    })
  }

  describe('a one-time password', () => {
    const OTP = `<div class="otp"><input class="otp-input" name="code" maxlength="2"></div>${FEEDBACK}`

    const mountOtp = (formAttributes, required = true) => {
      const form = mount(OTP, formAttributes)
      const input = container.querySelector('.otp-input')
      input.required = required
      const instance = new OTPInput(container.querySelector('.otp'))

      return {
        form, input, instance, slots: [...container.querySelectorAll('.otp-slot')]
      }
    }

    const typeCode = (input, value) => {
      input.value = value
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }

    for (const [route, formAttributes, validate] of [
      ['the browser', 'data-coreui-validate', form => form.requestSubmit()],
      ['the form validation', 'data-coreui-validate novalidate', form => validateForm(form, new WeakMap())]
    ]) {
      it(`shows the error after the field and links it to the input once ${route} reports the code`, () => {
        const { form, input, instance, slots } = mountOtp(formAttributes)

        validate(form)

        const feedback = container.querySelector('.invalid-feedback')

        expect(displayOf('.invalid-feedback')).toBe('block')
        expect(displayOf('.valid-feedback')).toBe('none')
        expect(getComputedStyle(slots[1]).borderTopColor).toBe(getComputedStyle(feedback).color)
        expect(input.getAttribute('aria-describedby')).toBe(feedback.id)

        instance.dispose()
      })
    }

    it('keeps the success away while the form validation finds the code incomplete', () => {
      const { form, input, instance } = mountOtp('data-coreui-validate="valid" novalidate')
      typeCode(input, '1')

      validateForm(form, new WeakMap())

      expect(displayOf('.invalid-feedback')).toBe('block')
      expect(displayOf('.valid-feedback')).toBe('none')

      instance.dispose()
    })

    it('keeps every slot in the error colour when the form validation reports a code the user touched', async () => {
      const { form, input, instance, slots } = mountOtp('data-coreui-validate="valid" novalidate')

      for (const slot of slots) {
        slot.style.transition = 'none'
      }

      await userEvent.type(input, '1')

      validateForm(form, new WeakMap())

      const { color } = getComputedStyle(container.querySelector('.invalid-feedback'))

      expect(slots.map(slot => getComputedStyle(slot).borderTopColor)).toEqual([color, color])

      instance.dispose()
    })

    it('shows only the error once the page gives the code the invalid state after a submit the browser took', () => {
      const { form, input, instance } = mountOtp('data-coreui-validate="valid" novalidate')
      typeCode(input, '01')

      form.requestSubmit()
      instance.setValidationState('invalid')

      expect(displayOf('.invalid-feedback')).toBe('block')
      expect(displayOf('.valid-feedback')).toBe('none')

      instance.dispose()
    })

    it('shows the success after the field once the browser takes the code', () => {
      const { form, input, instance } = mountOtp('data-coreui-validate="valid"')
      typeCode(input, '01')

      form.requestSubmit()

      expect(displayOf('.valid-feedback')).toBe('block')
      expect(displayOf('.invalid-feedback')).toBe('none')

      instance.dispose()
    })

    it('lays the input over the slots, where the browser shows its message', () => {
      const { input, instance } = mountOtp('')
      const otp = container.querySelector('.otp').getBoundingClientRect()
      const field = input.getBoundingClientRect()

      expect([field.left, field.top, field.width, field.height]).toEqual([otp.left, otp.top, otp.width, otp.height])
      expect(getComputedStyle(input).color).toBe('rgba(0, 0, 0, 0)')

      instance.dispose()
    })

    it('shows the error after the field for an input the page marks invalid, and writes no state on it', () => {
      const form = mount(OTP.replace('class="otp-input"', 'class="otp-input is-invalid"'), '')
      const instance = new OTPInput(container.querySelector('.otp'))
      const input = container.querySelector('.otp-input')

      expect(displayOf('.invalid-feedback')).toBe('block')
      expect(input.getAttribute('aria-invalid')).toBeNull()
      expect(form.checkValidity()).toBeTrue()

      instance.dispose()
    })

    it('keeps a valid state the page gives in a plain form once the user leaves the code incomplete', async () => {
      const { input, instance, slots } = mountOtp('', true)
      instance.setValidationState('valid')

      await userEvent.type(input, '1')
      input.blur()

      const { color } = getComputedStyle(container.querySelector('.valid-feedback'))

      expect(displayOf('.valid-feedback')).toBe('block')
      expect(getComputedStyle(slots[0]).borderTopColor).toBe(color)

      instance.dispose()
    })
  })

  it('colours a check, a radio and a switch, and their label, with the state', () => {
    for (const [markup, framed] of [
      ['<input class="check is-invalid" type="checkbox" id="c"><label for="c">Agree</label>', '.check'],
      ['<input class="radio is-invalid" type="radio" id="r"><label for="r">Basic</label>', '.radio'],
      ['<input class="switch is-invalid" type="checkbox" role="switch" id="s"><label for="s">Subscribe</label>', '.switch']
    ]) {
      mount(`${markup}${FEEDBACK}`)
      const { color } = getComputedStyle(container.querySelector('.invalid-feedback'))

      expect(getComputedStyle(container.querySelector(framed)).borderTopColor).toBe(color)
      expect(getComputedStyle(container.querySelector('label')).color).toBe(color)

      container.remove()
    }
  })

  it('colours a check, a radio and a switch, and their label, once the browser marks them invalid', () => {
    for (const markup of [
      '<input class="check" type="checkbox" id="c" required><label for="c">Agree</label>',
      '<input class="radio" type="radio" name="plan" id="r" required><label for="r">Basic</label>',
      '<input class="switch" type="checkbox" role="switch" id="s" required><label for="s">Subscribe</label>'
    ]) {
      mount(`${markup}${FEEDBACK}`, 'data-coreui-validate novalidate').requestSubmit()
      const control = container.querySelector('input')
      const { color } = getComputedStyle(container.querySelector('.invalid-feedback'))

      expect(control.matches(':user-invalid')).toBeTrue()
      expect(getComputedStyle(control).borderTopColor).toBe(color)
      expect(getComputedStyle(container.querySelector('label')).color).toBe(color)

      container.remove()
    }
  })

  it('fills a checked check, radio and switch with the state and keeps the border on the fill', () => {
    for (const markup of [
      '<input class="check" type="checkbox" checked aria-label="Agree" style="transition: none">',
      '<input class="radio" type="radio" checked aria-label="Basic" style="transition: none">',
      '<input class="switch" type="checkbox" role="switch" checked aria-label="Subscribe" style="transition: none">'
    ]) {
      mount(markup)
      const control = container.querySelector('input')
      const { backgroundColor: neutral } = getComputedStyle(control)
      control.classList.add('is-valid')
      const styles = getComputedStyle(control)

      expect(styles.backgroundColor).not.toBe(neutral)
      expect(styles.borderTopColor).toBe(styles.backgroundColor)

      container.remove()
    }
  })

  it('shows the shared message of a grouping field for a control in a field inside it', () => {
    mount('<label class="form-label">Plan</label><div class="form-field"><input class="radio is-invalid" type="radio" name="plan" id="basic"><label for="basic">Basic</label></div><div class="form-field"><input class="radio" type="radio" name="plan" id="pro"><label for="pro">Pro</label></div><div class="invalid-feedback">Pick a plan.</div>')

    expect(displayOf('.invalid-feedback')).toBe('block')
  })

  it('keeps the success away while a frame inside an input group holds a control the browser marks invalid', () => {
    mount(`<div class="input-group"><span class="input-group-text">@</span><div class="form-control-group"><input class="form-control is-valid" value="x"><select class="form-select" required><option value="">Unit</option></select></div></div>${FEEDBACK}`, 'data-coreui-validate="valid" novalidate').requestSubmit()

    expect(container.querySelector('select').matches(':user-invalid')).toBeTrue()
    expect(displayOf('.valid-feedback')).toBe('none')
    expect(displayOf('.invalid-feedback')).toBe('block')
  })

  it('leaves the success of a helper field that validates nothing alone', () => {
    const form = mount(`<div class="form-control-group"><input value="tag"></div>${FEEDBACK}`, 'data-coreui-validate="valid" novalidate')
    form.requestSubmit()

    expect(displayOf('.valid-feedback')).toBe('none')
  })
})

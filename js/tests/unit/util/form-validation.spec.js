import { vi } from 'vitest'
import {
  clearValidationState, focusFirstInvalidControl, followUserValidity, getFeedbackIds, getFeedbackText, getUserValidity,
  getValidationState, isFormValid, nextStateSerial, ownValidationState, setStateValidity, updateValidationState, validateForm
} from '../../../src/util/form-validation.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('Form validation utilities', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const describedBy = control => control.getAttribute('aria-describedby')

  const withAnnouncements = run => {
    const removeAnnouncers = () => {
      for (const announcer of document.querySelectorAll('[data-coreui-live-announcer]')) {
        announcer.remove()
      }
    }

    removeAnnouncers()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })

    try {
      run()
      vi.advanceTimersByTime(100)

      return [...document.querySelectorAll('[data-coreui-live-announcer] [aria-live="polite"] > *')].map(message => message.textContent)
    } finally {
      vi.useRealTimers()
      removeAnnouncers()
    }
  }

  describe('getFeedbackIds', () => {
    it('should find the messages of the value field of a date field around the field, giving them an id', () => {
      fixtureEl.innerHTML = `<form>
        <div class="form-field"><div class="form-control form-date-time"><textarea id="when" required></textarea></div><div class="invalid-feedback">Pick a date.</div></div>
        <div class="form-control-group"><div class="form-control form-date-time"><textarea id="framed" required></textarea></div></div><div id="framedError" class="invalid-feedback">Pick a time.</div>
      </form>`
      const feedback = fixtureEl.querySelector('.invalid-feedback')

      expect(getFeedbackIds(fixtureEl.querySelector('#when'))).toEqual([feedback.id])
      expect(feedback.id).not.toBe('')
      expect(getFeedbackIds(fixtureEl.querySelector('#framed'))).toEqual(['framedError'])
    })

    it('should leave the message after the next date field to that field', () => {
      fixtureEl.innerHTML = '<form><div class="form-control form-date-time"><textarea id="from" required></textarea></div><div class="form-control form-date-time"><textarea id="to" required></textarea></div><div id="toError" class="invalid-feedback">Pick a date.</div></form>'

      expect(getFeedbackIds(fixtureEl.querySelector('#from'))).toEqual([])
      expect(getFeedbackIds(fixtureEl.querySelector('#to'))).toEqual(['toError'])
    })

    it('should find the message after an element around the control that the page marks invalid', () => {
      fixtureEl.innerHTML = `<form>
        <div class="input-group is-invalid"><span class="input-group-text">@</span><input id="user" required></div><div id="userError" class="invalid-feedback">Pick a user name.</div>
        <div class="picker is-invalid"><div class="form-control-group"><div class="form-control form-date-time"><textarea id="start" required></textarea></div><div class="form-control form-date-time"><textarea id="end" required></textarea></div></div></div><div id="stayError" class="invalid-feedback">Already booked.</div>
      </form>`

      expect(getFeedbackIds(fixtureEl.querySelector('#user'))).toEqual(['userError'])
      expect(getFeedbackIds(fixtureEl.querySelector('#start'))).toEqual(['stayError'])
      expect(getFeedbackIds(fixtureEl.querySelector('#end'))).toEqual(['stayError'])
    })

    it('should take the messages after marked elements innermost first, and none after the form', () => {
      fixtureEl.innerHTML = `<div class="is-invalid"><form>
        <div class="is-invalid"><div class="is-invalid"><input id="name" required></div><div id="innerError" class="invalid-feedback">Too short.</div></div><div id="outerError" class="invalid-feedback">Enter a name.</div>
      </form></div><div class="invalid-feedback">Fix the form.</div>`

      expect(getFeedbackIds(fixtureEl.querySelector('#name'))).toEqual(['innerError', 'outerError'])
    })

    it('should leave out a message the page hides', () => {
      fixtureEl.innerHTML = `<form>
        <input id="city" required><div class="invalid-feedback" hidden>Too short.</div><div id="cityError" class="invalid-feedback">Enter a city.</div>
        <div class="form-field"><div class="form-control form-date-time"><textarea id="when" required></textarea></div><div class="invalid-feedback" aria-hidden="true">Too early.</div><div id="whenError" class="invalid-feedback">Too late.</div></div>
      </form>`

      expect(getFeedbackIds(fixtureEl.querySelector('#city'))).toEqual(['cityError'])
      expect(getFeedbackIds(fixtureEl.querySelector('#when'))).toEqual(['whenError'])
    })

    it('should read data-coreui-invalid-feedback from the date field for its value field', () => {
      fixtureEl.innerHTML = '<form><div class="form-control form-date-time" data-coreui-invalid-feedback="whenError"><textarea id="when" required></textarea></div><div class="invalid-feedback">Sibling</div><p id="whenError">Pick a date.</p></form>'

      expect(getFeedbackIds(fixtureEl.querySelector('#when'))).toEqual(['whenError'])
    })
  })

  describe('updateValidationState', () => {
    it('should link the invalid feedback that follows a control, giving it an id', () => {
      fixtureEl.innerHTML = '<form><input id="city" required><div class="valid-feedback">Good</div><div class="invalid-feedback">Enter a city.</div></form>'
      const form = fixtureEl.querySelector('form')
      const input = fixtureEl.querySelector('#city')
      const feedback = fixtureEl.querySelector('.invalid-feedback')

      updateValidationState(form, new WeakMap())

      expect(input).toHaveClass('is-invalid')
      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(feedback.id).not.toBe('')
      expect(describedBy(input)).toBe(feedback.id)
    })

    it('should prefer the feedback named in data-coreui-invalid-feedback', () => {
      fixtureEl.innerHTML = '<form><input id="city" data-coreui-invalid-feedback="cityError" required><div id="sibling" class="invalid-feedback">Sibling</div><div id="cityError">Enter a city.</div></form>'
      const input = fixtureEl.querySelector('#city')

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(describedBy(input)).toBe('cityError')
    })

    it('should link the feedback that follows the form control group or range around a control', () => {
      fixtureEl.innerHTML = `<form>
        <div class="form-control-group"><input id="date" required></div><div id="dateError" class="invalid-tooltip">Pick a date.</div>
        <div class="form-range"><input id="range" class="form-range-input" type="range"></div><div id="rangeError" class="invalid-feedback">Pick a step.</div>
      </form>`
      fixtureEl.querySelector('#range').setCustomValidity('Pick a step.')

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(describedBy(fixtureEl.querySelector('#date'))).toBe('dateError')
      expect(describedBy(fixtureEl.querySelector('#range'))).toBe('rangeError')
    })

    it('should link the feedback of the form field around an input group, but not of a field nested in it', () => {
      fixtureEl.innerHTML = `<form><div class="form-field">
        <div class="input-group"><span class="input-group-text">@</span><input id="user" class="form-control" required></div>
        <div id="userError" class="invalid-feedback">Choose a username.</div>
        <div class="form-field"><input id="other"><div id="otherError" class="invalid-feedback">Other</div></div>
      </div></form>`

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(describedBy(fixtureEl.querySelector('#user'))).toBe('userError')
    })

    it('should stop looking for feedback where the next field starts, but keep a radio group together', () => {
      fixtureEl.innerHTML = `<form>
        <input id="first" required><div id="firstError" class="invalid-feedback">First</div>
        <input id="second" required><div id="secondError" class="invalid-feedback">Second</div>
        <input id="basic" name="plan" type="radio" required><label>Basic</label>
        <input id="pro" name="plan" type="radio"><label>Pro</label>
        <div id="planError" class="invalid-feedback">Pick a plan.</div>
      </form>`

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(describedBy(fixtureEl.querySelector('#first'))).toBe('firstError')
      expect(describedBy(fixtureEl.querySelector('#second'))).toBe('secondError')
      expect(describedBy(fixtureEl.querySelector('#basic'))).toBe('planError')
      expect(describedBy(fixtureEl.querySelector('#pro'))).toBe('planError')
    })

    it('should link the feedback of a radio group to every radio, each in its own wrapper', () => {
      fixtureEl.innerHTML = `<form>
        <div class="form-check"><input id="basic" name="plan" type="radio" required><label>Basic</label></div>
        <div class="form-check"><input id="pro" name="plan" type="radio"><label>Pro</label><div id="planError" class="invalid-feedback">Pick a plan.</div></div>
      </form>`

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(describedBy(fixtureEl.querySelector('#basic'))).toBe('planError')
      expect(describedBy(fixtureEl.querySelector('#pro'))).toBe('planError')
    })

    it('should look past hidden inputs and buttons for the feedback', () => {
      fixtureEl.innerHTML = '<form><input id="code" required><input type="hidden" name="token"><input type="submit"><div id="codeError" class="invalid-feedback">Enter the code.</div></form>'

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(describedBy(fixtureEl.querySelector('#code'))).toBe('codeError')
    })

    it('should handle form-associated custom elements', () => {
      if (!customElements.get('test-required-field')) {
        customElements.define('test-required-field', class extends HTMLElement {
          static formAssociated = true

          constructor() {
            super()
            this.internals = this.attachInternals()
            this.tabIndex = 0
            this.internals.setValidity({ valueMissing: true }, 'Fill it in.')
          }

          get willValidate() {
            return this.internals.willValidate
          }

          get validity() {
            return this.internals.validity
          }

          get validationMessage() {
            return this.internals.validationMessage
          }
        })
      }

      fixtureEl.innerHTML = '<form><test-required-field id="custom"></test-required-field><div id="customError" class="invalid-feedback">Fill it in.</div></form>'
      const form = fixtureEl.querySelector('form')
      const custom = fixtureEl.querySelector('#custom')

      updateValidationState(form, new WeakMap())
      focusFirstInvalidControl(form)

      expect(custom.getAttribute('aria-invalid')).toBe('true')
      expect(describedBy(custom)).toBe('customError')
      expect(document.activeElement).toBe(custom)
    })

    it('should link the message in the content of a check', () => {
      fixtureEl.innerHTML = '<form><div class="form-field"><input id="agree" class="check" type="checkbox" required><div class="form-field-content"><label for="agree">Agree</label><div id="agreeError" class="invalid-feedback">You must agree.</div></div></div></form>'

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(describedBy(fixtureEl.querySelector('#agree'))).toBe('agreeError')
    })

    it('should link the shared message of a grouping field to a radio in a field inside it, and only its own message to a plain control', () => {
      fixtureEl.innerHTML = `<form><div class="form-field">
        <div class="form-field"><input id="basic" class="radio" type="radio" name="plan" required><label for="basic">Basic</label></div>
        <div class="form-field"><input id="other" required><div id="otherError" class="invalid-feedback">Other</div></div>
        <div id="planError" class="invalid-feedback">Pick a plan.</div>
      </div></form>`

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(describedBy(fixtureEl.querySelector('#basic'))).toBe('planError')
      expect(describedBy(fixtureEl.querySelector('#other'))).toBe('otherError')
    })

    it('should link the message in the content of a switch', () => {
      fixtureEl.innerHTML = '<form><div class="form-field"><input id="news" class="switch" type="checkbox" role="switch" required><div class="form-field-content"><label for="news">Subscribe</label><div id="newsError" class="invalid-feedback">You must subscribe.</div></div></div></form>'

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(describedBy(fixtureEl.querySelector('#news'))).toBe('newsError')
    })

    it('should not link the field message of an input group control the stylesheet does not reach', () => {
      fixtureEl.innerHTML = '<form><div class="form-field"><div class="input-group"><input id="bare" required></div><div class="invalid-feedback">Required</div></div></form>'

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(fixtureEl.querySelector('#bare').hasAttribute('aria-describedby')).toBeFalse()
    })

    it('should link the feedback after a frame to a control in its floating label, but not to one deeper than the frame', () => {
      fixtureEl.innerHTML = `<form>
        <div class="form-field"><div class="form-control-group"><div class="form-floating"><input id="floating" placeholder="Name" required><label for="floating">Name</label></div></div><div id="floatingError" class="invalid-feedback">Floating</div></div>
        <div class="form-field"><div class="form-control-group"><span><input id="deep" required></span></div><div class="invalid-feedback">Deep</div></div>
      </form>`

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(describedBy(fixtureEl.querySelector('#floating'))).toBe('floatingError')
      expect(fixtureEl.querySelector('#deep').hasAttribute('aria-describedby')).toBeFalse()
    })

    it('should link the message of a field inside an input group only when a field around the input group shows it', () => {
      fixtureEl.innerHTML = `<form>
        <div class="input-group"><div class="form-field"><div class="form-floating"><input id="alone" class="form-control" placeholder="Alone" required><label for="alone">Alone</label></div><div class="invalid-feedback">Alone</div></div></div>
        <div class="form-field"><div class="input-group"><div class="form-field"><div class="form-floating"><input id="wrapped" class="form-control" placeholder="Wrapped" required><label for="wrapped">Wrapped</label></div><div id="wrappedError" class="invalid-feedback">Wrapped</div></div></div></div>
      </form>`

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(fixtureEl.querySelector('#alone').hasAttribute('aria-describedby')).toBeFalse()
      expect(describedBy(fixtureEl.querySelector('#wrapped'))).toBe('wrappedError')
    })

    it('should not link the feedback after a range wrapper to a control other than its range input', () => {
      fixtureEl.innerHTML = '<form><div class="form-range"><input id="amount" type="number" required></div><div class="invalid-feedback">Amount</div></form>'

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(fixtureEl.querySelector('#amount').hasAttribute('aria-describedby')).toBeFalse()
    })

    it('should not link feedback the stylesheet does not show for the control', () => {
      fixtureEl.innerHTML = '<form><div class="invalid-feedback">Before</div><div class="form-field"><input id="plain" required></div><div class="invalid-feedback">After the field</div></form>'
      const input = fixtureEl.querySelector('#plain')

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(input.hasAttribute('aria-describedby')).toBeFalse()
    })

    it('should mark valid controls only when the form opts in, and skip buttons', () => {
      fixtureEl.innerHTML = '<form data-coreui-validate="valid"><input id="filled" required value="ok"><input id="submit" type="submit"><button id="button">Go</button></form>'

      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(fixtureEl.querySelector('#filled')).toHaveClass('is-valid')
      expect(fixtureEl.querySelector('#submit')).not.toHaveClass('is-valid')
      expect(fixtureEl.querySelector('#button')).not.toHaveClass('is-valid')
    })

    it('should drop the classes of a styled control once it stops taking part in validation', () => {
      fixtureEl.innerHTML = '<form data-coreui-validate="valid"><input id="filled" required value="ok"><input id="empty" required></form>'
      const form = fixtureEl.querySelector('form')
      const marks = new WeakMap()
      const filled = fixtureEl.querySelector('#filled')
      const empty = fixtureEl.querySelector('#empty')

      updateValidationState(form, marks)
      filled.disabled = true
      empty.disabled = true
      updateValidationState(form, marks)

      expect(filled).not.toHaveClass('is-valid')
      expect(empty).not.toHaveClass('is-invalid')
      expect(empty.hasAttribute('aria-invalid')).toBeFalse()
    })
  })

  describe('state classes', () => {
    it('should leave a state class the page set, and take its own off while one is there', () => {
      fixtureEl.innerHTML = '<form data-coreui-validate="valid"><input id="server" class="is-invalid" aria-invalid="true" value="taken" required><input id="later" value="ok" required></form>'
      const form = fixtureEl.querySelector('form')
      const marks = new WeakMap()
      const server = fixtureEl.querySelector('#server')
      const later = fixtureEl.querySelector('#later')

      updateValidationState(form, marks)

      expect(server).toHaveClass('is-invalid')
      expect(server).not.toHaveClass('is-valid')
      expect(later).toHaveClass('is-valid')

      later.classList.add('is-invalid')
      updateValidationState(form, marks)

      expect(later).toHaveClass('is-invalid')
      expect(later).not.toHaveClass('is-valid')
    })

    it('should put back a class of its own a re-render dropped', () => {
      fixtureEl.innerHTML = '<form><input id="empty" required></form>'
      const form = fixtureEl.querySelector('form')
      const marks = new WeakMap()
      const empty = fixtureEl.querySelector('#empty')

      updateValidationState(form, marks)
      empty.className = ''
      updateValidationState(form, marks)

      expect(empty).toHaveClass('is-invalid')
    })
  })

  describe('clearValidationState', () => {
    it('should remove the classes and only the attributes the marking added', () => {
      fixtureEl.innerHTML = '<form data-coreui-validate="valid"><input id="filled" required value="ok"><input id="empty" aria-describedby="hint" required><div id="emptyError" class="invalid-feedback">Required</div><div id="hint">Hint</div></form>'
      const form = fixtureEl.querySelector('form')
      const marks = new WeakMap()
      const filled = fixtureEl.querySelector('#filled')
      const empty = fixtureEl.querySelector('#empty')

      updateValidationState(form, marks)
      expect(describedBy(empty)).toBe('hint emptyError')
      filled.disabled = true
      clearValidationState(form, marks)

      expect(filled).not.toHaveClass('is-valid')
      expect(empty).not.toHaveClass('is-invalid')
      expect(empty.hasAttribute('aria-invalid')).toBeFalse()
      expect(describedBy(empty)).toBe('hint')
    })

    it('should leave the classes another owner or the page added', () => {
      fixtureEl.innerHTML = '<form><input id="empty" required><input id="server" class="is-invalid" value="taken"></form>'
      const form = fixtureEl.querySelector('form')
      const stepperMarks = new WeakMap()
      const formMarks = new WeakMap()
      const empty = fixtureEl.querySelector('#empty')

      updateValidationState(form, stepperMarks)
      updateValidationState(form, formMarks)
      clearValidationState(form, formMarks)

      expect(empty).toHaveClass('is-invalid')
      expect(empty.getAttribute('aria-invalid')).toBe('true')
      expect(fixtureEl.querySelector('#server')).toHaveClass('is-invalid')

      clearValidationState(form, stepperMarks)

      expect(empty).not.toHaveClass('is-invalid')
      expect(empty.hasAttribute('aria-invalid')).toBeFalse()
    })
  })

  describe('isFormValid', () => {
    it('should answer as checkValidity() does, without firing invalid events', () => {
      fixtureEl.innerHTML = '<form><input id="name" required value="filled"><button id="send">Send</button><fieldset><input id="note"></fieldset></form>'
      const form = fixtureEl.querySelector('form')
      const name = fixtureEl.querySelector('#name')
      const handleInvalid = vi.fn()
      form.addEventListener('invalid', handleInvalid, true)

      expect(isFormValid(form)).toBeTrue()

      name.value = ''

      expect(isFormValid(form)).toBeFalse()

      name.value = 'filled'
      fixtureEl.querySelector('#send').setCustomValidity('Not now')

      expect(isFormValid(form)).toBe(form.checkValidity())
      expect(isFormValid(form)).toBeFalse()
      expect(handleInvalid).toHaveBeenCalledTimes(1)
    })
  })

  describe('validateForm', () => {
    it('should tell the hook the validity, then show the state and focus the first invalid control', () => {
      fixtureEl.innerHTML = '<form><input id="name" required><div id="nameError" class="invalid-feedback">Required</div><button id="send">Send</button></form>'
      const form = fixtureEl.querySelector('form')
      const name = fixtureEl.querySelector('#name')
      const hook = vi.fn(() => false)
      fixtureEl.querySelector('#send').focus()

      expect(validateForm(form, new WeakMap(), hook)).toEqual({ handled: true, isValid: false })
      expect(hook).toHaveBeenCalledWith(false)
      expect(name).toHaveClass('is-invalid')
      expect(describedBy(name)).toBe('nameError')
      expect(document.activeElement).toBe(name)
    })

    it('should show nothing and fire no invalid event when the hook takes the result over', () => {
      fixtureEl.innerHTML = '<form><input id="name" required><button id="send">Send</button></form>'
      const form = fixtureEl.querySelector('form')
      const name = fixtureEl.querySelector('#name')
      const handleInvalid = vi.fn()
      name.addEventListener('invalid', handleInvalid)
      fixtureEl.querySelector('#send').focus()

      expect(validateForm(form, new WeakMap(), () => true)).toEqual({ handled: false, isValid: false })
      expect(handleInvalid).not.toHaveBeenCalled()
      expect(name).not.toHaveClass('is-invalid')
      expect(document.activeElement).toBe(fixtureEl.querySelector('#send'))
    })

    it('should count a custom validity the hook set, and keep focus where the hook moved it', () => {
      fixtureEl.innerHTML = '<form><input id="password" value="secret"><input id="confirm" value="secrets"><h2 id="summary" tabindex="-1">Errors</h2></form>'
      const form = fixtureEl.querySelector('form')
      const confirm = fixtureEl.querySelector('#confirm')
      const summary = fixtureEl.querySelector('#summary')

      const result = validateForm(form, new WeakMap(), isValid => {
        confirm.setCustomValidity(confirm.value === fixtureEl.querySelector('#password').value ? '' : 'Mismatch')
        summary.focus()
        return !isValid
      })

      expect(result).toEqual({ handled: true, isValid: false })
      expect(confirm).toHaveClass('is-invalid')
      expect(document.activeElement).toBe(summary)
    })

    it('should validate without a hook and read focus inside a shadow root', () => {
      const host = document.createElement('div')
      fixtureEl.append(host)
      const root = host.attachShadow({ mode: 'open' })
      root.innerHTML = '<form><input id="name" required><button id="send">Send</button></form>'
      root.querySelector('#send').focus()

      expect(validateForm(root.querySelector('form'), new WeakMap())).toEqual({ handled: true, isValid: false })
      expect(root.activeElement).toBe(root.querySelector('#name'))
    })
  })

  describe('focusFirstInvalidControl', () => {
    it('should move focus to the first invalid control without announcing anything', () => {
      fixtureEl.innerHTML = '<form><input id="filled" required value="ok"><input id="empty" required><div class="invalid-feedback">Required</div></form><button id="next">Next</button>'
      const form = fixtureEl.querySelector('form')

      const messages = withAnnouncements(() => {
        fixtureEl.querySelector('#next').focus()
        updateValidationState(form, new WeakMap())
        focusFirstInvalidControl(form)
      })

      expect(document.activeElement).toBe(fixtureEl.querySelector('#empty'))
      expect(messages).toEqual([])
    })

    it('should announce the feedback that follows a control when focus is already on it', () => {
      fixtureEl.innerHTML = '<form><input id="empty" required><div class="invalid-feedback">Enter <span hidden>secret</span>a   value.</div></form>'
      const form = fixtureEl.querySelector('form')
      const input = fixtureEl.querySelector('#empty')

      const messages = withAnnouncements(() => {
        input.focus()
        focusFirstInvalidControl(form)
      })

      expect(document.activeElement).toBe(input)
      expect(messages).toEqual(['Enter a value.'])
    })

    it('should announce the message as it reads after the validation, once a framework rendered it', () => {
      fixtureEl.innerHTML = '<form><input id="empty" required><div class="invalid-feedback">Required</div></form>'
      const form = fixtureEl.querySelector('form')
      const input = fixtureEl.querySelector('#empty')

      const messages = withAnnouncements(() => {
        input.focus()
        focusFirstInvalidControl(form)
        fixtureEl.querySelector('.invalid-feedback').textContent = 'Enter your e-mail address.'
      })

      expect(messages).toEqual(['Enter your e-mail address.'])
    })

    it('should not throw for a form outside the document', () => {
      const form = document.createElement('form')
      form.innerHTML = '<input required><div class="invalid-feedback">Fill it</div>'

      expect(() => withAnnouncements(() => focusFirstInvalidControl(form))).not.toThrow()
    })

    it('should put focus back outside a shadow root when no control inside it takes focus', () => {
      fixtureEl.innerHTML = '<div id="host"></div><button id="next">Next</button>'
      const shadowRoot = fixtureEl.querySelector('#host').attachShadow({ mode: 'open' })
      shadowRoot.innerHTML = '<form><div aria-hidden="true"><input required></div></form>'
      const next = fixtureEl.querySelector('#next')

      next.focus()
      focusFirstInvalidControl(shadowRoot.querySelector('form'))

      expect(document.activeElement).toBe(next)
    })
  })

  describe('getFeedbackText', () => {
    it('should read the text of the invalid feedback without the parts hidden from screen readers', () => {
      fixtureEl.innerHTML = '<form><input id="name" required><div class="invalid-feedback">Enter <span aria-hidden="true">*</span> a   name.</div></form>'

      expect(getFeedbackText(fixtureEl.querySelector('#name'))).toBe('Enter a name.')
    })

    it('should fall back to the invalid feedback aria-describedby points to, and to an empty string', () => {
      fixtureEl.innerHTML = '<form><input id="named" required aria-describedby="hint error"><input id="bare" required></form><p id="hint">Hint</p><p id="error" class="invalid-feedback">Wrong.</p>'

      expect(getFeedbackText(fixtureEl.querySelector('#named'))).toBe('Wrong.')
      expect(getFeedbackText(fixtureEl.querySelector('#bare'))).toBe('')
    })
  })

  describe('getValidationState', () => {
    it('should take validationState over the aliases and invalid over valid', () => {
      expect(getValidationState('warning', true, true)).toBe('warning')
      expect(getValidationState(null, true, true)).toBe('invalid')
      expect(getValidationState(undefined, true, false)).toBe('valid')
      expect(getValidationState(null, false, false)).toBeUndefined()
      expect(getValidationState('', true, false)).toBe('valid')
    })
  })

  describe('getUserValidity', () => {
    it('should read :user-invalid and :user-valid only in the forms that opt in', () => {
      fixtureEl.innerHTML = `<form id="invalid" data-coreui-validate novalidate><input id="empty" required></form>
        <form id="valid" data-coreui-validate="valid" novalidate><input id="filled" required value="x"></form>
        <form id="plain" novalidate><input id="plainEmpty" required></form>`

      for (const form of fixtureEl.querySelectorAll('form')) {
        form.addEventListener('submit', event => event.preventDefault())
        form.requestSubmit()
      }

      expect(getUserValidity(fixtureEl.querySelector('#empty'))).toBe('invalid')
      expect(getUserValidity(fixtureEl.querySelector('#filled'))).toBe('valid')
      expect(getUserValidity(fixtureEl.querySelector('#plainEmpty'))).toBeUndefined()
    })
  })

  describe('followUserValidity', () => {
    it('should report a control invalid once a validation reports it, until its value is valid', () => {
      fixtureEl.innerHTML = '<form novalidate><select id="value" required><option value="">None</option><option value="1">One</option></select><input id="other" required></form>'
      const control = fixtureEl.querySelector('#value')
      const updates = []
      const validity = followUserValidity(control, state => updates.push(state))

      expect(validity.read()).toBeUndefined()

      fixtureEl.querySelector('#other').checkValidity()
      expect(validity.read()).toBeUndefined()

      control.form.checkValidity()
      expect(validity.read()).toBe('invalid')
      expect(updates.at(-1)).toBe('invalid')

      control.value = '1'
      control.dispatchEvent(new Event('change', { bubbles: true }))
      expect(updates.at(-1)).toBeUndefined()

      control.value = ''
      expect(validity.read()).toBe('invalid')

      validity.stop()
    })

    it('should forget the report after a native reset, unless the reset was cancelled', async () => {
      fixtureEl.innerHTML = '<form novalidate><input id="value" required></form>'
      const control = fixtureEl.querySelector('#value')
      const resets = []
      const validity = followUserValidity(control, () => {}, () => resets.push(validity.read()))
      const nextTask = () => new Promise(resolve => {
        setTimeout(resolve)
      })
      const cancel = event => event.preventDefault()

      control.form.checkValidity()
      control.form.addEventListener('reset', cancel)
      control.form.reset()
      await nextTask()

      expect(validity.read()).toBe('invalid')
      expect(resets).toEqual([])

      control.form.removeEventListener('reset', cancel)
      control.form.reset()
      await nextTask()

      expect(validity.read()).toBeUndefined()
      expect(resets).toEqual([undefined])

      validity.stop()
    })

    it('should hand the reset the serial of the last state given out before it', async () => {
      fixtureEl.innerHTML = '<form novalidate><input id="value"></form>'
      const control = fixtureEl.querySelector('#value')
      const serials = []
      const validity = followUserValidity(control, () => {}, serial => serials.push(serial))
      const before = nextStateSerial()

      control.form.reset()
      const after = nextStateSerial()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(after).toBeGreaterThan(before)
      expect(serials).toEqual([before])

      validity.stop()
    })

    it('should keep a report made after a native reset in the same task', async () => {
      fixtureEl.innerHTML = '<form novalidate><input id="value" required></form>'
      const control = fixtureEl.querySelector('#value')
      const validity = followUserValidity(control, () => {})

      control.form.checkValidity()
      control.form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(validity.read()).toBeUndefined()

      control.form.reset()
      control.form.checkValidity()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(validity.read()).toBe('invalid')

      validity.stop()
    })

    it('should follow a reset in a shadow root and one whose propagation a listener stops', async () => {
      const host = document.createElement('div')
      fixtureEl.append(host)
      const shadowRoot = host.attachShadow({ mode: 'open' })
      shadowRoot.innerHTML = '<form novalidate><input id="value" required></form>'
      fixtureEl.insertAdjacentHTML('beforeend', '<form id="stopped" novalidate><input id="light" required></form>')
      const resets = []
      const followers = [shadowRoot.querySelector('#value'), fixtureEl.querySelector('#light')]
        .map(control => followUserValidity(control, () => {}, () => resets.push(control.id)))

      fixtureEl.querySelector('#stopped').addEventListener('reset', event => event.stopPropagation())
      shadowRoot.querySelector('form').reset()
      fixtureEl.querySelector('#stopped').reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(resets).toEqual(['value', 'light'])

      for (const follower of followers) {
        follower.stop()
      }
    })

    it('should follow a control that names its form from outside it, and leave the other fields of the form alone', async () => {
      fixtureEl.innerHTML = '<form id="owner" novalidate><input id="other"></form><input id="value" form="owner" required>'
      const control = fixtureEl.querySelector('#value')
      const updates = []
      const validity = followUserValidity(control, state => updates.push(state))

      fixtureEl.querySelector('#other').dispatchEvent(new Event('input', { bubbles: true }))
      expect(updates).toEqual([])

      control.form.checkValidity()
      expect(updates).toEqual(['invalid'])

      control.form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(updates).toEqual(['invalid', undefined])

      validity.stop()
    })

    it('should follow a control outside a form on the control itself, and stop when told', () => {
      fixtureEl.innerHTML = '<input id="value" required>'
      const control = fixtureEl.querySelector('#value')
      const updates = []
      const validity = followUserValidity(control, state => updates.push(state))

      control.checkValidity()
      expect(updates).toEqual(['invalid'])

      validity.stop()
      control.checkValidity()
      control.dispatchEvent(new Event('input'))

      expect(updates).toEqual(['invalid'])
    })
  })

  describe('ownValidationState', () => {
    it('should leave the controls a component took over to it, and mark them again once handed back', () => {
      fixtureEl.innerHTML = '<form data-coreui-validate="valid" novalidate><select id="value" required><option value="">None</option></select><input id="search"><div class="invalid-feedback">Pick one.</div></form>'
      const form = fixtureEl.querySelector('form')
      const select = fixtureEl.querySelector('#value')
      const search = fixtureEl.querySelector('#search')
      const marks = new WeakMap()

      updateValidationState(form, marks)
      expect(select.getAttribute('aria-invalid')).toBe('true')

      const handBack = ownValidationState(select, search)
      updateValidationState(form, marks)

      expect(select.hasAttribute('aria-invalid')).toBeFalse()
      expect(select.classList.contains('is-invalid')).toBeFalse()
      expect(search.classList.contains('is-valid')).toBeFalse()
      expect(isFormValid(form)).toBeFalse()

      handBack()
      updateValidationState(form, marks)

      expect(select.getAttribute('aria-invalid')).toBe('true')
      expect(search.classList.contains('is-valid')).toBeTrue()
    })
  })

  describe('setStateValidity', () => {
    it('should block the control with its invalid feedback, or a generic message, and clear only its own validity', () => {
      fixtureEl.innerHTML = '<form><input id="described" required value="x"><div class="invalid-feedback">Taken.</div><input id="bare"><input id="page"></form>'
      const described = fixtureEl.querySelector('#described')
      const bare = fixtureEl.querySelector('#bare')
      const page = fixtureEl.querySelector('#page')

      setStateValidity(described, true)
      setStateValidity(bare, true)
      page.setCustomValidity('Ours.')
      setStateValidity(page, false)

      expect(described.validationMessage).toBe('Taken.')
      expect(bare.validationMessage).toBe('Invalid value.')
      expect(page.validationMessage).toBe('Ours.')

      setStateValidity(described, false)

      expect(described.checkValidity()).toBeTrue()
    })

    it('should take its validity back from a control that is also missing its value', () => {
      fixtureEl.innerHTML = '<form><input id="empty" required></form>'
      const empty = fixtureEl.querySelector('#empty')

      setStateValidity(empty, true)
      setStateValidity(empty, false)

      expect(empty.validity.customError).toBeFalse()
      expect(empty.validity.valueMissing).toBeTrue()
    })

    it('should set and take back its validity while the control is barred from validation, as in a disabled fieldset', () => {
      fixtureEl.innerHTML = '<form><fieldset><input id="cleared" value="x"><input id="blocked" value="x"></fieldset><input id="readonly" value="x" readonly></form>'
      const fieldset = fixtureEl.querySelector('fieldset')
      const cleared = fixtureEl.querySelector('#cleared')
      const blocked = fixtureEl.querySelector('#blocked')
      const readonly = fixtureEl.querySelector('#readonly')

      setStateValidity(cleared, true)
      fieldset.disabled = true
      setStateValidity(cleared, false)
      setStateValidity(blocked, true)
      fieldset.disabled = false

      setStateValidity(readonly, true)
      readonly.readOnly = false

      expect(cleared.validity.valid).toBeTrue()
      expect(blocked.validationMessage).toBe('Invalid value.')
      expect(readonly.validationMessage).toBe('Invalid value.')

      setStateValidity(readonly, false)

      expect(readonly.validity.valid).toBeTrue()
    })

    it('should leave a validity the page set before or after it', () => {
      fixtureEl.innerHTML = '<form><input id="before"><input id="after"></form>'
      const before = fixtureEl.querySelector('#before')
      const after = fixtureEl.querySelector('#after')

      before.setCustomValidity('Page rule.')
      setStateValidity(before, true)

      expect(before.validationMessage).toBe('Page rule.')

      setStateValidity(before, false)

      expect(before.validationMessage).toBe('Page rule.')

      setStateValidity(after, true)
      after.setCustomValidity('Page rule.')
      setStateValidity(after, true)
      setStateValidity(after, false)

      expect(after.validationMessage).toBe('Page rule.')
    })
  })
})

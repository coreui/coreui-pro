import { vi } from 'vitest'
import {
  clearValidationState, focusFirstInvalidControl, updateValidationState, validateForm
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
})

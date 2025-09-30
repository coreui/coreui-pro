/* eslint-env jasmine */

import OTPInput from '../../src/otp-input.js'
import {
  getFixture, clearFixture, createEvent, jQueryMock
} from '../helpers/fixture.js'

describe('OTPInput', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(OTPInput.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(OTPInput.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(OTPInput.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(OTPInput.DATA_KEY).toEqual('coreui.otp-input')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(OTPInput.NAME).toEqual('otp-input')
    })
  })

  describe('constructor', () => {
    it('should create an OTPInput instance', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      const otpInput = new OTPInput(otpContainer)

      expect(otpInput).toBeInstanceOf(OTPInput)
      expect(otpInput._element).toEqual(otpContainer)
    })

    it('should create a hidden input element', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      const otpInput = new OTPInput(otpContainer)

      expect(otpInput._inputElement).toBeTruthy()
      expect(otpInput._inputElement.type).toBe('hidden')
    })

    it('should set role attribute to group', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer) // eslint-disable-line no-new

      expect(otpContainer.getAttribute('role')).toBe('group')
    })

    it('should set input attributes based on config', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { type: 'number' }) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      for (const input of inputs) {
        expect(input.maxLength).toBe(1)
        expect(input.autocomplete).toBe('off')
        expect(input.hasAttribute('required')).toBe(true)
        expect(input.inputMode).toBe('numeric')
        expect(input.pattern).toBe('[0-9]*')
      }
    })

    it('should set aria-labels for inputs', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      expect(inputs[0].getAttribute('aria-label')).toBe('Digit 1 of 3')
      expect(inputs[1].getAttribute('aria-label')).toBe('Digit 2 of 3')
      expect(inputs[2].getAttribute('aria-label')).toBe('Digit 3 of 3')
    })

    it('should set custom aria-label when provided', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { // eslint-disable-line no-new
        ariaLabel: (index, total) => `Code ${index + 1} of ${total}`
      })

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      expect(inputs[0].getAttribute('aria-label')).toBe('Code 1 of 2')
      expect(inputs[1].getAttribute('aria-label')).toBe('Code 2 of 2')
    })

    it('should set masked type when masked option is true', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { masked: true }) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      for (const input of inputs) {
        expect(input.type).toBe('password')
      }
    })

    it('should set initial value when provided', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { value: '123' }) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      expect(inputs[0].value).toBe('1')
      expect(inputs[1].value).toBe('2')
      expect(inputs[2].value).toBe('3')
    })

    it('should set disabled attribute when disabled option is true', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      const otpInput = new OTPInput(otpContainer, { disabled: true })

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      for (const input of inputs) {
        expect(input.disabled).toBe(true)
      }

      expect(otpInput._inputElement.disabled).toBe(true)
    })

    it('should set readonly attribute when readonly option is true', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { readonly: true }) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      for (const input of inputs) {
        expect(input.readOnly).toBe(true)
      }
    })

    it('should set id and name attributes when provided', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      const otpInput = new OTPInput(otpContainer, {
        id: 'my-otp',
        name: 'otp-code'
      })

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      expect(inputs[0].id).toBe('my-otp-0')
      expect(inputs[1].id).toBe('my-otp-1')
      expect(inputs[0].name).toBe('otp-code-0')
      expect(inputs[1].name).toBe('otp-code-1')

      expect(otpInput._inputElement.id).toBe('my-otp')
      expect(otpInput._inputElement.name).toBe('otp-code')
    })
  })

  describe('clear', () => {
    it('should clear all input values', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control" value="1">
          <input type="text" class="form-otp-control" value="2">
          <input type="text" class="form-otp-control" value="3">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      const otpInput = new OTPInput(otpContainer)

      otpInput.clear()

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      for (const input of inputs) {
        expect(input.value).toBe('')
      }
    })

    it('should clear hidden input value', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control" value="1">
          <input type="text" class="form-otp-control" value="2">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      const otpInput = new OTPInput(otpContainer)

      otpInput.clear()

      expect(otpInput._inputElement.value).toBe('')
    })
  })

  describe('reset', () => {
    it('should reset inputs to initial value', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      const otpInput = new OTPInput(otpContainer, { value: '123' })

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      inputs[0].value = '4'
      inputs[1].value = '5'
      inputs[2].value = '6'

      otpInput.reset()

      expect(inputs[0].value).toBe('1')
      expect(inputs[1].value).toBe('2')
      expect(inputs[2].value).toBe('3')
    })

    it('should clear inputs when no initial value was set', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control" value="1">
          <input type="text" class="form-otp-control" value="2">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      const otpInput = new OTPInput(otpContainer)

      otpInput.reset()

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      expect(inputs[0].value).toBe('')
      expect(inputs[1].value).toBe('')
    })
  })

  describe('update', () => {
    it('should update config', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      const otpInput = new OTPInput(otpContainer, { masked: false })

      otpInput.update({ masked: true })

      expect(otpInput._config.masked).toBe(true)
    })

    it('should update input attributes', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      const otpInput = new OTPInput(otpContainer, { masked: false })

      otpInput.update({ masked: true })

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      for (const input of inputs) {
        expect(input.type).toBe('password')
      }
    })

    it('should handle non-object config gracefully', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      const otpInput = new OTPInput(otpContainer)

      expect(() => {
        otpInput.update('string')
      }).not.toThrow()
    })
  })

  describe('input behavior', () => {
    it('should only accept single digit when type is number', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { type: 'number' }) // eslint-disable-line no-new

      const input = otpContainer.querySelector('.form-otp-control')
      input.value = '1'
      const inputEvent = createEvent('input')
      input.dispatchEvent(inputEvent)

      expect(input.value).toBe('1')
    })

    it('should reject non-numeric input when type is number', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { type: 'number' }) // eslint-disable-line no-new

      const input = otpContainer.querySelector('.form-otp-control')
      input.value = 'a'
      const inputEvent = createEvent('input')
      input.dispatchEvent(inputEvent)

      expect(input.value).toBe('')
    })

    it('should move focus to next input after entering digit', done => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      inputs[0].value = '1'
      const inputEvent = createEvent('input')
      inputs[0].dispatchEvent(inputEvent)

      setTimeout(() => {
        expect(document.activeElement).toBe(inputs[1])
        done()
      }, 50)
    })

    it('should trigger complete event when all inputs are filled', done => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control" value="1">
          <input type="text" class="form-otp-control" value="2">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer) // eslint-disable-line no-new

      otpContainer.addEventListener('complete.coreui.otp-input', event => {
        expect(event.value).toBe('123')
        done()
      })

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      inputs[2].value = '3'
      const inputEvent = createEvent('input')
      inputs[2].dispatchEvent(inputEvent)
    })

    it('should trigger change event with current value', done => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer) // eslint-disable-line no-new

      otpContainer.addEventListener('change.coreui.otp-input', event => {
        expect(event.value).toBe('1')
        done()
      })

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      inputs[0].value = '1'
      const inputEvent = createEvent('input')
      inputs[0].dispatchEvent(inputEvent)
    })
  })

  describe('keyboard navigation', () => {
    it('should move to previous input on backspace when empty', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      inputs[1].focus()

      const keyEvent = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true })
      inputs[1].dispatchEvent(keyEvent)

      expect(document.activeElement).toBe(inputs[0])
    })

    it('should move to next input on arrow right', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control" value="1">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      inputs[0].focus()

      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      inputs[0].dispatchEvent(keyEvent)

      expect(document.activeElement).toBe(inputs[1])
    })

    it('should move to previous input on arrow left', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      inputs[1].focus()

      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
      inputs[1].dispatchEvent(keyEvent)

      expect(document.activeElement).toBe(inputs[0])
    })

    it('should not move right on arrow right when empty in linear mode', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { linear: true }) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      inputs[0].focus()

      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      inputs[0].dispatchEvent(keyEvent)

      expect(document.activeElement).toBe(inputs[0])
    })
  })

  describe('paste behavior', () => {
    it('should handle paste and fill multiple inputs', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { type: 'number' }) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true
      })
      pasteEvent.clipboardData.setData('text', '123')
      spyOn(pasteEvent, 'preventDefault')

      inputs[0].dispatchEvent(pasteEvent)

      expect(pasteEvent.preventDefault).toHaveBeenCalled()
      expect(inputs[0].value).toBe('1')
      expect(inputs[1].value).toBe('2')
      expect(inputs[2].value).toBe('3')
    })

    it('should filter non-numeric characters on paste when type is number', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { type: 'number' }) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true
      })
      pasteEvent.clipboardData.setData('text', 'a1b2c3')

      inputs[0].dispatchEvent(pasteEvent)

      expect(inputs[0].value).toBe('1')
      expect(inputs[1].value).toBe('2')
      expect(inputs[2].value).toBe('3')
    })

    it('should trigger complete event after paste fills all inputs', done => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { type: 'number' }) // eslint-disable-line no-new

      otpContainer.addEventListener('complete.coreui.otp-input', event => {
        expect(event.value).toBe('12')
        done()
      })

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true
      })
      pasteEvent.clipboardData.setData('text', '12')

      inputs[0].dispatchEvent(pasteEvent)
    })

    it('should only fill from paste position onwards', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { type: 'number' }) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true
      })
      pasteEvent.clipboardData.setData('text', '23')

      inputs[1].dispatchEvent(pasteEvent)

      expect(inputs[0].value).toBe('')
      expect(inputs[1].value).toBe('2')
      expect(inputs[2].value).toBe('3')
    })
  })

  describe('focus behavior', () => {
    it('should select input value on focus when input has value', done => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control" value="1">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer) // eslint-disable-line no-new

      const input = otpContainer.querySelector('.form-otp-control')
      spyOn(input, 'select')

      const focusEvent = createEvent('focus')
      input.dispatchEvent(focusEvent)

      setTimeout(() => {
        expect(input.select).toHaveBeenCalled()
        done()
      }, 10)
    })

    it('should focus first empty input in linear mode', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control" value="1">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { linear: true }) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      const focusEvent = createEvent('focus')
      inputs[2].dispatchEvent(focusEvent)

      expect(document.activeElement).toBe(inputs[1])
    })
  })

  describe('autoSubmit', () => {
    it('should submit form when autoSubmit is true and all fields filled', done => {
      fixtureEl.innerHTML = `
        <form>
          <div class="form-otp">
            <input type="text" class="form-otp-control" value="1">
            <input type="text" class="form-otp-control">
          </div>
        </form>
      `

      const form = fixtureEl.querySelector('form')
      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { autoSubmit: true }) // eslint-disable-line no-new

      spyOn(form, 'requestSubmit')

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      inputs[1].value = '2'
      const inputEvent = createEvent('input')
      inputs[1].dispatchEvent(inputEvent)

      setTimeout(() => {
        expect(form.requestSubmit).toHaveBeenCalled()
        done()
      }, 50)
    })

    it('should not submit form when autoSubmit is false', done => {
      fixtureEl.innerHTML = `
        <form>
          <div class="form-otp">
            <input type="text" class="form-otp-control" value="1">
            <input type="text" class="form-otp-control">
          </div>
        </form>
      `

      const form = fixtureEl.querySelector('form')
      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { autoSubmit: false }) // eslint-disable-line no-new

      spyOn(form, 'requestSubmit')

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      inputs[1].value = '2'
      const inputEvent = createEvent('input')
      inputs[1].dispatchEvent(inputEvent)

      setTimeout(() => {
        expect(form.requestSubmit).not.toHaveBeenCalled()
        done()
      }, 50)
    })
  })

  describe('static methods', () => {
    describe('otpInputInterface', () => {
      it('should create instance when not exists', () => {
        fixtureEl.innerHTML = `
          <div class="form-otp">
            <input type="text" class="form-otp-control">
          </div>
        `

        const otpContainer = fixtureEl.querySelector('.form-otp')
        OTPInput.otpInputInterface(otpContainer, {})

        expect(OTPInput.getInstance(otpContainer)).toBeInstanceOf(OTPInput)
      })

      it('should call method on existing instance', () => {
        fixtureEl.innerHTML = `
          <div class="form-otp">
            <input type="text" class="form-otp-control">
          </div>
        `

        const otpContainer = fixtureEl.querySelector('.form-otp')
        const otpInput = new OTPInput(otpContainer)
        const spy = spyOn(otpInput, 'clear')

        OTPInput.otpInputInterface(otpContainer, 'clear')
        expect(spy).toHaveBeenCalled()
      })

      it('should throw error for undefined method', () => {
        fixtureEl.innerHTML = `
          <div class="form-otp">
            <input type="text" class="form-otp-control">
          </div>
        `

        const otpContainer = fixtureEl.querySelector('.form-otp')
        new OTPInput(otpContainer) // eslint-disable-line no-new

        expect(() => {
          OTPInput.otpInputInterface(otpContainer, 'undefinedMethod')
        }).toThrowError(TypeError, 'No method named "undefinedMethod"')
      })
    })

    describe('jQueryInterface', () => {
      it('should create otp input', () => {
        fixtureEl.innerHTML = `
          <div class="form-otp">
            <input type="text" class="form-otp-control">
          </div>
        `
        const otpContainer = fixtureEl.querySelector('.form-otp')

        jQueryMock.fn.otpInput = OTPInput.jQueryInterface
        jQueryMock.elements = [otpContainer]
        jQueryMock.fn.otpInput.call(jQueryMock)

        expect(OTPInput.getInstance(otpContainer)).toBeInstanceOf(OTPInput)
      })

      it('should not re-create otp input', () => {
        fixtureEl.innerHTML = `
          <div class="form-otp">
            <input type="text" class="form-otp-control">
          </div>
        `
        const otpContainer = fixtureEl.querySelector('.form-otp')
        const otpInput = new OTPInput(otpContainer)

        jQueryMock.fn.otpInput = OTPInput.jQueryInterface
        jQueryMock.elements = [otpContainer]
        jQueryMock.fn.otpInput.call(jQueryMock)

        expect(OTPInput.getInstance(otpContainer)).toEqual(otpInput)
      })
    })

    describe('getInstance', () => {
      it('should return otp input instance', () => {
        fixtureEl.innerHTML = `
          <div class="form-otp">
            <input type="text" class="form-otp-control">
          </div>
        `
        const otpContainer = fixtureEl.querySelector('.form-otp')
        const otpInput = new OTPInput(otpContainer)

        expect(OTPInput.getInstance(otpContainer)).toEqual(otpInput)
        expect(OTPInput.getInstance(otpContainer)).toBeInstanceOf(OTPInput)
      })

      it('should return null when there is no otp input instance', () => {
        fixtureEl.innerHTML = `
          <div class="form-otp">
            <input type="text" class="form-otp-control">
          </div>
        `
        const otpContainer = fixtureEl.querySelector('.form-otp')

        expect(OTPInput.getInstance(otpContainer)).toBeNull()
      })
    })

    describe('getOrCreateInstance', () => {
      it('should return otp input instance', () => {
        fixtureEl.innerHTML = `
          <div class="form-otp">
            <input type="text" class="form-otp-control">
          </div>
        `
        const otpContainer = fixtureEl.querySelector('.form-otp')
        const otpInput = new OTPInput(otpContainer)

        expect(OTPInput.getOrCreateInstance(otpContainer)).toEqual(otpInput)
        expect(OTPInput.getOrCreateInstance(otpContainer)).toBeInstanceOf(OTPInput)
      })

      it('should return new instance when there is no otp input instance', () => {
        fixtureEl.innerHTML = `
          <div class="form-otp">
            <input type="text" class="form-otp-control">
          </div>
        `
        const otpContainer = fixtureEl.querySelector('.form-otp')

        expect(OTPInput.getInstance(otpContainer)).toBeNull()
        expect(OTPInput.getOrCreateInstance(otpContainer)).toBeInstanceOf(OTPInput)
      })

      it('should return new instance with given configuration', () => {
        fixtureEl.innerHTML = `
          <div class="form-otp">
            <input type="text" class="form-otp-control">
          </div>
        `
        const otpContainer = fixtureEl.querySelector('.form-otp')

        expect(OTPInput.getInstance(otpContainer)).toBeNull()
        const otpInput = OTPInput.getOrCreateInstance(otpContainer, {
          masked: true,
          linear: false
        })
        expect(otpInput).toBeInstanceOf(OTPInput)
        expect(otpInput._config.masked).toBe(true)
        expect(otpInput._config.linear).toBe(false)
      })

      it('should return the same instance when exists', () => {
        fixtureEl.innerHTML = `
          <div class="form-otp">
            <input type="text" class="form-otp-control">
          </div>
        `
        const otpContainer = fixtureEl.querySelector('.form-otp')
        const otpInput = new OTPInput(otpContainer)

        const otpInput2 = OTPInput.getOrCreateInstance(otpContainer)
        expect(otpInput2).toEqual(otpInput)
      })
    })
  })

  describe('data-api', () => {
    it('should initialize on page load', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp" data-coreui-toggle="otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('[data-coreui-toggle="otp"]')
      const loadEvent = createEvent('load')
      window.dispatchEvent(loadEvent)

      expect(OTPInput.getInstance(otpContainer)).toBeInstanceOf(OTPInput)
    })
  })

  describe('edge cases', () => {
    it('should handle empty inputs array', () => {
      fixtureEl.innerHTML = '<div class="form-otp"></div>'

      const otpContainer = fixtureEl.querySelector('.form-otp')

      expect(() => {
        new OTPInput(otpContainer) // eslint-disable-line no-new
      }).not.toThrow()
    })

    it('should handle partial initial value', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { value: '12' }) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      expect(inputs[0].value).toBe('1')
      expect(inputs[1].value).toBe('2')
      expect(inputs[2].value).toBe('')
    })

    it('should handle value longer than number of inputs', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { value: '12345' }) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      expect(inputs[0].value).toBe('1')
      expect(inputs[1].value).toBe('2')
    })

    it('should handle paste with more characters than inputs', () => {
      fixtureEl.innerHTML = `
        <div class="form-otp">
          <input type="text" class="form-otp-control">
          <input type="text" class="form-otp-control">
        </div>
      `

      const otpContainer = fixtureEl.querySelector('.form-otp')
      new OTPInput(otpContainer, { type: 'number' }) // eslint-disable-line no-new

      const inputs = otpContainer.querySelectorAll('.form-otp-control')
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true
      })
      pasteEvent.clipboardData.setData('text', '12345')

      inputs[0].dispatchEvent(pasteEvent)

      expect(inputs[0].value).toBe('1')
      expect(inputs[1].value).toBe('2')
    })
  })
})

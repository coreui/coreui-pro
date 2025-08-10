/* eslint-env jasmine */

import PasswordInput from '../../src/password-input.js'
import SelectorEngine from '../../src/dom/selector-engine.js'
import {
  getFixture, clearFixture, createEvent, jQueryMock
} from '../helpers/fixture.js'

describe('PasswordInput', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(PasswordInput.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(PasswordInput.DATA_KEY).toEqual('coreui.password-input')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(PasswordInput.NAME).toEqual('password-input')
    })
  })

  describe('constructor', () => {
    it('should create a PasswordInput instance', () => {
      fixtureEl.innerHTML = '<input type="password" class="form-control">'

      const input = fixtureEl.querySelector('input')
      const passwordInput = new PasswordInput(input)

      expect(passwordInput).toBeInstanceOf(PasswordInput)
      expect(passwordInput._element).toEqual(input)
    })

    it('should work with any input element', () => {
      fixtureEl.innerHTML = '<input type="text" id="test-input">'

      const input = fixtureEl.querySelector('input')
      const passwordInput = new PasswordInput(input)

      expect(passwordInput).toBeInstanceOf(PasswordInput)
      expect(passwordInput._element).toEqual(input)
    })
  })

  describe('toggle', () => {
    it('should toggle password visibility from password to text', () => {
      fixtureEl.innerHTML = '<input type="password" class="form-control">'

      const input = fixtureEl.querySelector('input')
      const passwordInput = new PasswordInput(input)

      expect(input.type).toBe('password')
      passwordInput.toggle()
      expect(input.type).toBe('text')
    })

    it('should toggle password visibility from text to password', () => {
      fixtureEl.innerHTML = '<input type="text" class="form-control">'

      const input = fixtureEl.querySelector('input')
      const passwordInput = new PasswordInput(input)

      expect(input.type).toBe('text')
      passwordInput.toggle()
      expect(input.type).toBe('password')
    })

    it('should toggle multiple times correctly', () => {
      fixtureEl.innerHTML = '<input type="password" class="form-control">'

      const input = fixtureEl.querySelector('input')
      const passwordInput = new PasswordInput(input)

      expect(input.type).toBe('password')

      passwordInput.toggle()
      expect(input.type).toBe('text')

      passwordInput.toggle()
      expect(input.type).toBe('password')

      passwordInput.toggle()
      expect(input.type).toBe('text')
    })

    it('should preserve input value when toggling', () => {
      fixtureEl.innerHTML = '<input type="password" class="form-control" value="secret123">'

      const input = fixtureEl.querySelector('input')
      const passwordInput = new PasswordInput(input)

      expect(input.value).toBe('secret123')
      passwordInput.toggle()
      expect(input.value).toBe('secret123')
      expect(input.type).toBe('text')

      passwordInput.toggle()
      expect(input.value).toBe('secret123')
      expect(input.type).toBe('password')
    })

    it('should work with dynamically set values', () => {
      fixtureEl.innerHTML = '<input type="password" class="form-control">'

      const input = fixtureEl.querySelector('input')
      const passwordInput = new PasswordInput(input)

      input.value = 'dynamic-password'
      passwordInput.toggle()

      expect(input.value).toBe('dynamic-password')
      expect(input.type).toBe('text')
    })
  })

  describe('static methods', () => {
    describe('jQueryInterface', () => {
      it('should create password input and call toggle method', () => {
        fixtureEl.innerHTML = '<input type="password" class="form-control">'
        const input = fixtureEl.querySelector('input')

        jQueryMock.fn.passwordInput = PasswordInput.jQueryInterface
        jQueryMock.elements = [input]
        jQueryMock.fn.passwordInput.call(jQueryMock, 'toggle')

        expect(PasswordInput.getInstance(input)).toBeInstanceOf(PasswordInput)
        expect(input.type).toBe('text')
      })

      it('should not re-create password input', () => {
        fixtureEl.innerHTML = '<input type="password" class="form-control">'
        const input = fixtureEl.querySelector('input')
        const passwordInput = new PasswordInput(input)

        jQueryMock.fn.passwordInput = PasswordInput.jQueryInterface
        jQueryMock.elements = [input]
        jQueryMock.fn.passwordInput.call(jQueryMock, 'toggle')

        expect(PasswordInput.getInstance(input)).toEqual(passwordInput)
      })

      it('should work with multiple elements', () => {
        fixtureEl.innerHTML = `
          <input type="password" class="form-control" id="input1">
          <input type="password" class="form-control" id="input2">
        `
        const input1 = fixtureEl.querySelector('#input1')
        const input2 = fixtureEl.querySelector('#input2')

        jQueryMock.fn.passwordInput = PasswordInput.jQueryInterface
        jQueryMock.elements = [input1, input2]
        jQueryMock.fn.passwordInput.call(jQueryMock, 'toggle')

        expect(input1.type).toBe('text')
        expect(input2.type).toBe('text')
      })
    })

    describe('getInstance', () => {
      it('should return password input instance', () => {
        fixtureEl.innerHTML = '<input type="password" class="form-control">'
        const input = fixtureEl.querySelector('input')
        const passwordInput = new PasswordInput(input)

        expect(PasswordInput.getInstance(input)).toEqual(passwordInput)
        expect(PasswordInput.getInstance(input)).toBeInstanceOf(PasswordInput)
      })

      it('should return null when there is no password input instance', () => {
        fixtureEl.innerHTML = '<input type="password" class="form-control">'
        const input = fixtureEl.querySelector('input')

        expect(PasswordInput.getInstance(input)).toBeNull()
      })
    })

    describe('getOrCreateInstance', () => {
      it('should return password input instance', () => {
        fixtureEl.innerHTML = '<input type="password" class="form-control">'
        const input = fixtureEl.querySelector('input')
        const passwordInput = new PasswordInput(input)

        expect(PasswordInput.getOrCreateInstance(input)).toEqual(passwordInput)
        expect(PasswordInput.getOrCreateInstance(input)).toBeInstanceOf(PasswordInput)
      })

      it('should return new instance when there is no password input instance', () => {
        fixtureEl.innerHTML = '<input type="password" class="form-control">'
        const input = fixtureEl.querySelector('input')

        expect(PasswordInput.getInstance(input)).toBeNull()
        expect(PasswordInput.getOrCreateInstance(input)).toBeInstanceOf(PasswordInput)
      })

      it('should return the same instance when exists', () => {
        fixtureEl.innerHTML = '<input type="password" class="form-control">'
        const input = fixtureEl.querySelector('input')
        const passwordInput = new PasswordInput(input)

        const passwordInput2 = PasswordInput.getOrCreateInstance(input)
        expect(passwordInput2).toEqual(passwordInput)
      })
    })
  })

  describe('data-api', () => {
    it('should toggle password visibility on toggle button click', () => {
      fixtureEl.innerHTML = `
        <div class="input-group">
          <input type="password" class="form-control">
          <button data-coreui-toggle="password" type="button">Toggle</button>
        </div>
      `
      const input = fixtureEl.querySelector('.form-control')
      const toggleButton = fixtureEl.querySelector('[data-coreui-toggle="password"]')

      expect(input.type).toBe('password')

      const clickEvent = createEvent('click')
      toggleButton.dispatchEvent(clickEvent)

      expect(input.type).toBe('text')
      expect(PasswordInput.getInstance(input)).toBeInstanceOf(PasswordInput)
    })

    it('should prevent default behavior on toggle button click', () => {
      fixtureEl.innerHTML = `
        <div class="input-group">
          <input type="password" class="form-control">
          <button data-coreui-toggle="password" type="button">Toggle</button>
        </div>
      `
      const toggleButton = fixtureEl.querySelector('[data-coreui-toggle="password"]')

      const clickEvent = createEvent('click')
      spyOn(clickEvent, 'preventDefault')
      toggleButton.dispatchEvent(clickEvent)

      expect(clickEvent.preventDefault).toHaveBeenCalled()
    })

    it('should work with nested toggle button elements', () => {
      fixtureEl.innerHTML = `
        <div class="input-group">
          <input type="password" class="form-control">
          <button data-coreui-toggle="password" type="button">
            <i class="icon"></i>
          </button>
        </div>
      `
      const input = fixtureEl.querySelector('.form-control')
      const icon = fixtureEl.querySelector('.icon')

      expect(input.type).toBe('password')

      const clickEvent = createEvent('click')
      icon.dispatchEvent(clickEvent)

      expect(input.type).toBe('text')
    })

    it('should not work with disabled inputs', () => {
      fixtureEl.innerHTML = `
        <div class="input-group">
          <input type="password" class="form-control" disabled>
          <button data-coreui-toggle="password" type="button">Toggle</button>
        </div>
      `
      const input = fixtureEl.querySelector('.form-control')
      const toggleButton = fixtureEl.querySelector('[data-coreui-toggle="password"]')

      expect(input.type).toBe('password')

      const clickEvent = createEvent('click')
      toggleButton.dispatchEvent(clickEvent)

      // Should remain password type because input is disabled
      expect(input.type).toBe('password')
      expect(PasswordInput.getInstance(input)).toBeNull()
    })

    it('should work with multiple password inputs', () => {
      fixtureEl.innerHTML = `
        <div class="input-group">
          <input type="password" class="form-control" id="pass1">
          <button data-coreui-toggle="password" type="button" id="toggle1">Toggle</button>
        </div>
        <div class="input-group">
          <input type="password" class="form-control" id="pass2">
          <button data-coreui-toggle="password" type="button" id="toggle2">Toggle</button>
        </div>
      `
      const input1 = fixtureEl.querySelector('#pass1')
      const input2 = fixtureEl.querySelector('#pass2')
      const toggleButton1 = fixtureEl.querySelector('#toggle1')
      const toggleButton2 = fixtureEl.querySelector('#toggle2')

      expect(input1.type).toBe('password')
      expect(input2.type).toBe('password')

      const clickEvent1 = createEvent('click')
      toggleButton1.dispatchEvent(clickEvent1)

      expect(input1.type).toBe('text')
      expect(input2.type).toBe('password') // Should remain unchanged

      const clickEvent2 = createEvent('click')
      toggleButton2.dispatchEvent(clickEvent2)

      expect(input1.type).toBe('text') // Should remain unchanged
      expect(input2.type).toBe('text')
    })

    it('should find the correct input using SelectorEngine', () => {
      fixtureEl.innerHTML = `
        <div class="form-group">
          <input type="password" class="form-control">
          <span data-coreui-toggle="password">Toggle</span>
        </div>
      `
      const input = fixtureEl.querySelector('.form-control')
      const toggleSpan = fixtureEl.querySelector('[data-coreui-toggle="password"]')

      spyOn(SelectorEngine, 'findOne').and.callThrough()

      const clickEvent = createEvent('click')
      toggleSpan.dispatchEvent(clickEvent)

      expect(SelectorEngine.findOne).toHaveBeenCalledWith('.form-control', toggleSpan.parentNode)
      expect(input.type).toBe('text')
    })
  })

  describe('edge cases', () => {
    it('should handle input without parent correctly', () => {
      const input = document.createElement('input')
      input.type = 'password'
      input.className = 'form-control'

      const passwordInput = new PasswordInput(input)
      passwordInput.toggle()

      expect(input.type).toBe('text')
    })

    it('should handle toggle on input that changes type attribute', () => {
      fixtureEl.innerHTML = '<input type="password" class="form-control">'
      const input = fixtureEl.querySelector('input')
      const passwordInput = new PasswordInput(input)

      // Manually change type
      input.type = 'email'
      passwordInput.toggle()

      expect(input.type).toBe('password')
    })

    it('should work with inputs that have other attributes', () => {
      fixtureEl.innerHTML = `
        <input 
          type="password" 
          class="form-control" 
          name="password" 
          id="user-password" 
          placeholder="Enter password"
          autocomplete="current-password"
          required
        >`
      const input = fixtureEl.querySelector('input')
      const passwordInput = new PasswordInput(input)

      expect(input.type).toBe('password')
      expect(input.name).toBe('password')
      expect(input.placeholder).toBe('Enter password')

      passwordInput.toggle()

      expect(input.type).toBe('text')
      expect(input.name).toBe('password') // Other attributes should remain
      expect(input.placeholder).toBe('Enter password')
      expect(input.hasAttribute('required')).toBe(true)
    })

    it('should handle rapidly repeated toggle calls', () => {
      fixtureEl.innerHTML = '<input type="password" class="form-control">'
      const input = fixtureEl.querySelector('input')
      const passwordInput = new PasswordInput(input)

      expect(input.type).toBe('password')

      // Rapid toggles
      passwordInput.toggle()
      passwordInput.toggle()
      passwordInput.toggle()
      passwordInput.toggle()

      expect(input.type).toBe('password') // Should end up back to original state
    })

    it('should work with programmatically created elements', () => {
      const container = document.createElement('div')
      const input = document.createElement('input')
      const button = document.createElement('button')

      input.type = 'password'
      input.className = 'form-control'
      button.setAttribute('data-coreui-toggle', 'password')
      button.textContent = 'Toggle'

      container.append(input)
      container.append(button)
      fixtureEl.append(container)

      const clickEvent = createEvent('click')
      button.dispatchEvent(clickEvent)

      expect(input.type).toBe('text')
      expect(PasswordInput.getInstance(input)).toBeInstanceOf(PasswordInput)
    })

    it('should handle missing form-control input gracefully', () => {
      fixtureEl.innerHTML = `
        <div class="input-group">
          <button data-coreui-toggle="password" type="button">Toggle</button>
        </div>
      `
      const toggleButton = fixtureEl.querySelector('[data-coreui-toggle="password"]')

      expect(() => {
        const clickEvent = createEvent('click')
        toggleButton.dispatchEvent(clickEvent)
      }).not.toThrow()
    })
  })

  describe('accessibility', () => {
    it('should maintain input accessibility attributes when toggling', () => {
      fixtureEl.innerHTML = `
        <input 
          type="password" 
          class="form-control"
          aria-label="User password"
          aria-describedby="password-help"
          role="textbox"
        >`
      const input = fixtureEl.querySelector('input')
      const passwordInput = new PasswordInput(input)

      expect(input.getAttribute('aria-label')).toBe('User password')
      expect(input.getAttribute('aria-describedby')).toBe('password-help')
      expect(input.getAttribute('role')).toBe('textbox')

      passwordInput.toggle()

      expect(input.type).toBe('text')
      expect(input.getAttribute('aria-label')).toBe('User password')
      expect(input.getAttribute('aria-describedby')).toBe('password-help')
      expect(input.getAttribute('role')).toBe('textbox')
    })

    it('should work with screen reader friendly toggle buttons', () => {
      fixtureEl.innerHTML = `
        <div class="input-group">
          <input type="password" class="form-control" aria-label="Password">
          <button 
            data-coreui-toggle="password" 
            type="button"
            aria-label="Show password"
          >
            <span aria-hidden="true">👁</span>
          </button>
        </div>
      `
      const input = fixtureEl.querySelector('.form-control')
      const toggleButton = fixtureEl.querySelector('[data-coreui-toggle="password"]')

      expect(input.type).toBe('password')

      const clickEvent = createEvent('click')
      toggleButton.dispatchEvent(clickEvent)

      expect(input.type).toBe('text')
      expect(toggleButton.getAttribute('aria-label')).toBe('Show password')
    })
  })
})

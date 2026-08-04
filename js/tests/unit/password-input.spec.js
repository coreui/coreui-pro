
import PasswordInput from '../../src/password-input.js'
import {
  getFixture, clearFixture, createEvent, jQueryMock
} from '../helpers/fixture.js'

describe('PasswordInput', () => {
  describe('icon', () => {
    it('should render the show icon on initialization', () => {
      fixtureEl.innerHTML = [
        '<input type="password" class="form-control">'
      ].join('')

      const passwordInput = new PasswordInput(fixtureEl.querySelector('input'))
      const toggler = fixtureEl.querySelector('.form-control-action')

      expect(toggler.querySelector('svg')).not.toBeNull()
      expect(toggler.getAttribute('aria-pressed')).toBe('false')

      passwordInput.toggle()

      expect(toggler.getAttribute('aria-pressed')).toBe('true')
    })

    it('should swap the icon when the password becomes visible', () => {
      fixtureEl.innerHTML = [
        '<input type="password" class="form-control">'
      ].join('')

      const passwordInput = new PasswordInput(fixtureEl.querySelector('input'), {
        hideIcon: '<svg viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>',
        showIcon: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg>'
      })
      const toggler = fixtureEl.querySelector('.form-control-action')

      expect(toggler.querySelector('circle')).not.toBeNull()

      passwordInput.toggle()

      expect(toggler.querySelector('path')).not.toBeNull()
      expect(toggler.querySelector('circle')).toBeNull()
    })
  })

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
    const initialized = markup => {
      fixtureEl.innerHTML = markup
      PasswordInput._initializeDataApi()
      return fixtureEl.querySelector('.form-control')
    }

    it('should build the frame and the toggle for a bare control', () => {
      const input = initialized('<input type="password" class="form-control" data-coreui-toggle="password-input">')
      const group = input.parentElement

      expect(group.classList.contains('form-control-group')).toBe(true)
      expect(group.classList.contains('password-input')).toBe(true)
      expect(group.querySelector('.form-control-action')).not.toBeNull()
      expect(PasswordInput.getInstance(input)).toBeInstanceOf(PasswordInput)
    })

    it('should toggle visibility when its button is clicked', () => {
      const input = initialized('<input type="password" class="form-control" data-coreui-toggle="password-input">')
      const toggle = fixtureEl.querySelector('.form-control-action')

      expect(input.type).toBe('password')

      toggle.dispatchEvent(createEvent('click'))

      expect(input.type).toBe('text')
      expect(toggle.getAttribute('aria-pressed')).toBe('true')

      toggle.dispatchEvent(createEvent('click'))

      expect(input.type).toBe('password')
      expect(toggle.getAttribute('aria-pressed')).toBe('false')
    })

    it('should disable its button for a disabled control', () => {
      initialized('<input type="password" class="form-control" disabled data-coreui-toggle="password-input">')

      expect(fixtureEl.querySelector('.form-control-action').disabled).toBe(true)
    })

    it('should handle several controls independently', () => {
      fixtureEl.innerHTML = [
        '<input type="password" class="form-control" data-coreui-toggle="password-input">',
        '<input type="password" class="form-control" data-coreui-toggle="password-input">'
      ].join('')
      PasswordInput._initializeDataApi()

      const inputs = fixtureEl.querySelectorAll('.form-control')
      const toggles = fixtureEl.querySelectorAll('.form-control-action')

      expect(toggles.length).toBe(2)

      toggles[0].dispatchEvent(createEvent('click'))

      expect(inputs[0].type).toBe('text')
      expect(inputs[1].type).toBe('password')
    })

    it('should move the author\'s classes onto the frame and back on dispose', () => {
      const input = initialized('<input type="password" class="form-control form-control-lg mb-3" data-coreui-toggle="password-input">')
      const group = input.parentElement

      expect(input.className).toBe('form-control')
      expect(group.classList.contains('form-control-lg')).toBe(true)
      expect(group.classList.contains('mb-3')).toBe(true)

      PasswordInput.getInstance(input).dispose()

      expect(input.className).toBe('form-control form-control-lg mb-3')
      expect(fixtureEl.querySelector('.form-control-group')).toBeNull()
    })

    it('should keep a group the author wrote', () => {
      fixtureEl.innerHTML = `<div class="form-control-group">
          <span class="form-control-icon"></span>
          <input type="password" class="form-control" data-coreui-toggle="password-input">
        </div>`
      PasswordInput._initializeDataApi()

      const input = fixtureEl.querySelector('.form-control')
      const group = fixtureEl.querySelector('.form-control-group')

      expect(input.parentElement).toBe(group)

      PasswordInput.getInstance(input).dispose()

      expect(group.isConnected).toBe(true)
      expect(group.querySelector('.form-control-action')).toBeNull()
    })
  })
})

import NumberInput from '../../src/number-input.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

describe('NumberInput', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const markup = (attributes = '') => {
    fixtureEl.innerHTML = `<div class="form-control-group">
        <input type="number" class="form-control" ${attributes}>
      </div>`
    return fixtureEl.querySelector('input')
  }

  const buttons = () => fixtureEl.querySelectorAll('.form-control-action')

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(NumberInput.VERSION).toEqual(expect.any(String))
    })
  })

  describe('constructor', () => {
    it('should add the stepper buttons to the group', () => {
      const input = markup('value="1"')
      const numberInput = new NumberInput(input) // eslint-disable-line no-unused-vars

      expect(buttons().length).toBe(2)
      expect(buttons()[0].querySelector('svg')).not.toBeNull()
      expect(input.closest('.form-control-group').classList.contains('number-input')).toBe(true)
    })

    it('should keep the buttons out of the tab order', () => {
      const numberInput = new NumberInput(markup('value="1"')) // eslint-disable-line no-unused-vars

      for (const button of buttons()) {
        expect(button.tabIndex).toBe(-1)
      }
    })
  })

  describe('increment / decrement', () => {
    it('should step by the input\'s step', () => {
      const input = markup('value="2" step="0.5"')
      const numberInput = new NumberInput(input)

      numberInput.increment()
      expect(input.value).toBe('2.5')

      numberInput.decrement()
      expect(input.value).toBe('2')
    })

    it('should start from the minimum when the value is empty', () => {
      const input = markup('min="3"')
      const numberInput = new NumberInput(input)

      numberInput.increment()

      expect(input.value).toBe('3')
    })

    it('should start from zero when the value is empty and there is no minimum', () => {
      const input = markup()
      const numberInput = new NumberInput(input)

      numberInput.decrement()

      expect(input.value).toBe('0')
    })

    it('should not step a disabled or readonly input', () => {
      const input = markup('value="1" disabled')
      const numberInput = new NumberInput(input)

      numberInput.increment()

      expect(input.value).toBe('1')
    })

    it('should fire input and change on the element', () => {
      const input = markup('value="1"')
      const numberInput = new NumberInput(input)
      const seen = []

      input.addEventListener('input', () => seen.push('input'))
      input.addEventListener('change', () => seen.push('change'))

      numberInput.increment()

      expect(seen).toEqual(['input', 'change'])
    })
  })

  describe('bounds', () => {
    it('should disable the button that cannot move the value', () => {
      const input = markup('value="5" min="5" max="6"')
      const numberInput = new NumberInput(input)

      expect(buttons()[0].disabled).toBe(true)
      expect(buttons()[1].disabled).toBe(false)

      numberInput.increment()

      expect(buttons()[0].disabled).toBe(false)
      expect(buttons()[1].disabled).toBe(true)
    })

    it('should follow a value typed into the input', () => {
      const input = markup('value="1" max="3"')
      const numberInput = new NumberInput(input) // eslint-disable-line no-unused-vars

      input.value = '3'
      input.dispatchEvent(new Event('input'))

      expect(buttons()[1].disabled).toBe(true)
    })
  })

  describe('config', () => {
    it('should take its icons from the options', () => {
      const numberInput = new NumberInput(markup('value="1"'), { // eslint-disable-line no-unused-vars
        decrementIcon: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg>',
        incrementIcon: '<svg viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>'
      })

      expect(buttons()[0].querySelector('circle')).not.toBeNull()
      expect(buttons()[1].querySelector('path')).not.toBeNull()
    })

    it('should read options from data attributes', () => {
      const numberInput = new NumberInput(markup('value="1" data-coreui-aria-increment-label="More"')) // eslint-disable-line no-unused-vars

      expect(buttons()[1].getAttribute('aria-label')).toBe('More')
    })

    it('should leave the icon alone when sanitize is off', () => {
      const numberInput = new NumberInput(markup('value="1"'), { // eslint-disable-line no-unused-vars
        incrementIcon: '<svg viewBox="0 0 16 16" data-keep="1"><path d="M0 0h16v16H0z"/></svg>',
        sanitize: false
      })

      expect(buttons()[1].querySelector('svg').getAttribute('data-keep')).toBe('1')
    })
  })

  describe('the frame', () => {
    it('should wrap a bare input in a group', () => {
      fixtureEl.innerHTML = '<input type="number" class="form-control" value="1">'
      const input = fixtureEl.querySelector('input')
      const numberInput = new NumberInput(input) // eslint-disable-line no-unused-vars
      const group = input.parentElement

      expect(group.classList.contains('form-control-group')).toBe(true)
      expect(group.classList.contains('number-input')).toBe(true)
      expect(buttons().length).toBe(2)
    })

    it('should move a size written on the input onto the group', () => {
      fixtureEl.innerHTML = '<input type="number" class="form-control form-control-lg" value="1">'
      const input = fixtureEl.querySelector('input')
      const numberInput = new NumberInput(input) // eslint-disable-line no-unused-vars

      expect(input.classList.contains('form-control-lg')).toBe(false)
      expect(input.parentElement.classList.contains('form-control-lg')).toBe(true)
    })

    it('should use a group the author already wrote', () => {
      const input = markup('value="1"')
      const group = input.closest('.form-control-group')
      const numberInput = new NumberInput(input) // eslint-disable-line no-unused-vars

      expect(input.parentElement).toBe(group)
    })

    it('should unwrap only the group it created', () => {
      fixtureEl.innerHTML = '<input type="number" class="form-control form-control-lg" value="1">'
      const input = fixtureEl.querySelector('input')
      const numberInput = new NumberInput(input)

      numberInput.dispose()

      expect(fixtureEl.querySelector('.form-control-group')).toBeNull()
      expect(input.parentElement).toBe(fixtureEl)
      expect(input.classList.contains('form-control-lg')).toBe(true)
    })

    it('should leave an authored group in place on dispose', () => {
      const input = markup('value="1"')
      const group = input.closest('.form-control-group')
      const numberInput = new NumberInput(input)

      numberInput.dispose()

      expect(group.isConnected).toBe(true)
      expect(group.classList.contains('number-input')).toBe(false)
      expect(input.parentElement).toBe(group)
    })
  })

  describe('dispose', () => {
    it('should take its buttons and class with it', () => {
      const input = markup('value="1"')
      const numberInput = new NumberInput(input)
      const group = input.closest('.form-control-group')

      numberInput.dispose()

      expect(buttons().length).toBe(0)
      expect(group.classList.contains('number-input')).toBe(false)
    })
  })

  describe('data-api', () => {
    it('should initialize inputs carrying the toggle', () => {
      fixtureEl.innerHTML = `<div class="form-control-group">
          <input type="number" class="form-control" value="1" data-coreui-toggle="number-input">
        </div>`

      NumberInput._initializeDataApi()

      expect(buttons().length).toBe(2)
    })
  })
})

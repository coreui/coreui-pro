import { vi } from 'vitest'

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

    it('should step an empty field from zero, like the arrow keys, and keep it inside min and max', () => {
      const cases = [
        ['', 'up', '1'],
        ['', 'down', '-1'],
        ['step="5"', 'up', '5'],
        ['step="5"', 'down', '-5'],
        ['min="-10" max="10"', 'up', '1'],
        ['min="-10" max="10"', 'down', '-1'],
        ['min="3"', 'up', '3'],
        ['min="3"', 'down', '3'],
        ['max="-5"', 'up', '-5'],
        ['max="-5"', 'down', '-5'],
        ['step="any" min="-3"', 'up', '1'],
        ['step="any" min="-3"', 'down', '-1']
      ]

      for (const [attributes, direction, expected] of cases) {
        const input = markup(attributes)
        const numberInput = new NumberInput(input)

        if (direction === 'up') {
          numberInput.increment()
        } else {
          numberInput.decrement()
        }

        expect(input.value, `${attributes} ${direction}`).toBe(expected)
        numberInput.dispose()
      }
    })

    it('should put an empty field inside min and max when the browser leaves it empty', () => {
      const input = markup('max="-5"')
      const numberInput = new NumberInput(input)

      vi.spyOn(input, 'stepUp').mockImplementation(() => {})
      numberInput.increment()

      expect(input.value).toBe('-5')
    })

    it('should not step a disabled or readonly input', () => {
      const input = markup('value="1" disabled')
      const numberInput = new NumberInput(input)

      numberInput.increment()

      expect(input.value).toBe('1')
    })

    it('should step by one when step is any', () => {
      const input = markup('value="1.5" step="any" max="2"')
      const numberInput = new NumberInput(input)

      numberInput.increment()
      expect(input.value).toBe('2')

      numberInput.decrement()
      numberInput.decrement()
      expect(input.value).toBe('0')
    })

    it('should not fire events when the value cannot move', () => {
      const input = markup('value="2" max="2"')
      const numberInput = new NumberInput(input)
      const seen = []

      input.addEventListener('input', () => seen.push('input'))
      input.addEventListener('change.coreui.number-input', () => seen.push('change'))

      numberInput.increment()

      expect(seen).toEqual([])
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

    it('should disable a button whose step would not move the value', () => {
      const input = markup('value="9" min="0" max="10" step="3"')
      const numberInput = new NumberInput(input)

      expect(buttons()[1].disabled).toBe(true)

      numberInput.decrement()

      expect(buttons()[1].disabled).toBe(false)
    })

    it('should follow a form reset', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<form><input type="number" class="form-control" value="1" max="2"></form>'
        const input = fixtureEl.querySelector('input')
        const numberInput = new NumberInput(input)

        numberInput.increment()
        expect(buttons()[1].disabled).toBe(true)

        fixtureEl.querySelector('form').reset()

        setTimeout(() => {
          expect(input.value).toBe('1')
          expect(buttons()[1].disabled).toBe(false)
          resolve()
        }, 10)
      })
    })

    it('should follow a value typed into the input', () => {
      const input = markup('value="1" max="3"')
      const numberInput = new NumberInput(input) // eslint-disable-line no-unused-vars

      input.value = '3'
      input.dispatchEvent(new Event('input'))

      expect(buttons()[1].disabled).toBe(true)
    })
  })

  describe('repeat', () => {
    const press = button => button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
    const release = () => document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    const pointerClick = button => button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))

    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should not step again on the click that ends a held button', () => {
      const input = markup('value="0"')
      const numberInput = new NumberInput(input) // eslint-disable-line no-unused-vars

      press(buttons()[1])
      vi.advanceTimersByTime(400 + (60 * 3))
      release()
      pointerClick(buttons()[1])

      expect(input.value).toBe('3')
    })

    it('should step on a short click and on a click no pointer made, even after a hold', () => {
      const input = markup('value="0"')
      const numberInput = new NumberInput(input) // eslint-disable-line no-unused-vars

      press(buttons()[1])
      release()
      pointerClick(buttons()[1])

      expect(input.value).toBe('1')

      press(buttons()[1])
      vi.advanceTimersByTime(400 + 60)
      release()
      buttons()[1].click()

      expect(input.value).toBe('3')
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

    it('should keep sanitizing when the markup asks to turn it off', () => {
      const numberInput = new NumberInput(markup('value="1" data-coreui-sanitize="false"'), { // eslint-disable-line no-unused-vars
        incrementIcon: '<svg viewBox="0 0 16 16" data-keep="1"><path d="M0 0h16v16H0z"/></svg>'
      })

      expect(buttons()[1].querySelector('svg').getAttribute('data-keep')).toBeNull()
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

    it('should move every class but form-control onto the group', () => {
      fixtureEl.innerHTML = '<input type="number" class="form-control form-control-lg mb-3 w-50" value="1">'
      const input = fixtureEl.querySelector('input')
      const numberInput = new NumberInput(input) // eslint-disable-line no-unused-vars
      const group = input.parentElement

      // Size, spacing and width describe the field, which is the frame now.
      for (const name of ['form-control-lg', 'mb-3', 'w-50']) {
        expect(input.classList.contains(name)).toBe(false)
        expect(group.classList.contains(name)).toBe(true)
      }

      expect(input.classList.contains('form-control')).toBe(true)
      expect(group.classList.contains('form-control')).toBe(false)
    })

    it('should keep state classes and js- hooks on the input', () => {
      fixtureEl.innerHTML = '<input type="number" class="form-control is-invalid was-validated js-price mb-3" value="1">'
      const input = fixtureEl.querySelector('input')
      const numberInput = new NumberInput(input)
      const group = input.parentElement

      for (const name of ['is-invalid', 'was-validated', 'js-price']) {
        expect(input.classList.contains(name)).toBe(true)
        expect(group.classList.contains(name)).toBe(false)
      }

      expect(group.classList.contains('mb-3')).toBe(true)
      expect(group.matches(':has(> .form-control.is-invalid)')).toBe(true)

      numberInput.dispose()

      expect(input.className).toBe('form-control is-invalid was-validated js-price mb-3')
    })

    it('should use a group the author already wrote', () => {
      const input = markup('value="1"')
      const group = input.closest('.form-control-group')
      const numberInput = new NumberInput(input) // eslint-disable-line no-unused-vars

      expect(input.parentElement).toBe(group)
    })

    it('should unwrap only the group it created', () => {
      fixtureEl.innerHTML = '<input type="number" class="form-control form-control-lg mb-3" value="1">'
      const input = fixtureEl.querySelector('input')
      const numberInput = new NumberInput(input)

      numberInput.dispose()

      expect(fixtureEl.querySelector('.form-control-group')).toBeNull()
      expect(input.parentElement).toBe(fixtureEl)
      expect(input.className).toBe('form-control form-control-lg mb-3')
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

    it('should ignore input typed after dispose', () => {
      const input = markup('value="1"')
      const numberInput = new NumberInput(input)

      numberInput.dispose()
      input.value = '2'
      input.dispatchEvent(new Event('input'))

      expect(input.value).toBe('2')
    })

    it('should drop its form listener', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<form><input type="number" class="form-control" value="1" max="2"></form>'
        const input = fixtureEl.querySelector('input')
        const numberInput = new NumberInput(input)
        const spy = spyOn(numberInput, '_updateButtonState').and.callThrough()

        numberInput.dispose()
        fixtureEl.querySelector('form').reset()

        setTimeout(() => {
          expect(spy).not.toHaveBeenCalled()
          resolve()
        }, 10)
      })
    })

    it('should drop its document listeners', () => {
      const stopRepeating = spyOn(NumberInput.prototype, '_stopRepeating').and.callThrough()
      const release = () => {
        stopRepeating.calls.reset()
        document.dispatchEvent(new Event('pointerup'))
        return stopRepeating.calls.count()
      }

      const idle = release()
      const numberInput = new NumberInput(markup('value="1"'))

      expect(release()).toBe(idle + 1)

      numberInput.dispose()

      expect(release()).toBe(idle)
    })
  })

  describe('data-api', () => {
    it('should initialize inputs carrying the toggle', () => {
      fixtureEl.innerHTML = `<div class="form-control-group">
          <input type="number" class="form-control" value="1" data-coreui-number-input>
        </div>`

      NumberInput._initializeDataApi()

      expect(buttons().length).toBe(2)
    })
  })
})

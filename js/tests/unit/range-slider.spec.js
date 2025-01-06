/* eslint-disable no-unused-vars */
import EventHandler from '../../src/dom/event-handler.js'
import RangeSlider from '../../src/range-slider.js'
import {
  clearFixture, getFixture, jQueryMock
} from '../helpers/fixture.js'

describe('RangeSlider', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(RangeSlider.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(RangeSlider.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(RangeSlider.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(RangeSlider.DATA_KEY).toEqual('coreui.range-slider')
    })
  })

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="range-slider"></div>'

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const rangeSlider = new RangeSlider(element)

      // Check if necessary classes are added
      expect(element.classList.contains('range-slider')).toBeTrue()

      // Check if inputs are created
      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(1) // Default value is a single slider

      // Check if tooltip is created
      const tooltip = element.querySelector('.range-slider-tooltip')
      expect(tooltip).not.toBeNull()
    })

    it('should initialize with custom configuration via data attributes', () => {
      fixtureEl.innerHTML = `
        <div 
          data-coreui-toggle="range-slider" 
          data-coreui-min="10" 
          data-coreui-max="50" 
          data-coreui-step="5" 
          data-coreui-value="15,30" 
          data-coreui-vertical="true">
        </div>
      `

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const rangeSlider = new RangeSlider(element)

      // Check if vertical class is added
      expect(element.classList.contains('range-slider-vertical')).toBeTrue()

      // Check if multiple inputs are created
      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(2)

      // Check initial values
      expect(inputs[0].value).toBe('15')
      expect(inputs[1].value).toBe('30')
    })

    it('should initialize with custom configuration via JavaScript', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'

      const element = fixtureEl.querySelector('#slider')
      const config = {
        min: 0,
        max: 200,
        step: 10,
        value: [50, 150],
        labels: ['Low', 'Medium', 'High'],
        tooltipsFormat: value => `${value}%`,
        vertical: false
      }
      const rangeSlider = new RangeSlider(element, config)

      // Check if labels are created
      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels.length).toBe(3)
      expect(labels[0].textContent).toBe('Low')
      expect(labels[1].textContent).toBe('Medium')
      expect(labels[2].textContent).toBe('High')

      // Check tooltips formatting
      const tooltips = element.querySelectorAll('.range-slider-tooltip-inner')
      expect(tooltips.length).toBe(2)
      expect(tooltips[0].textContent).toBe('50%')
      expect(tooltips[1].textContent).toBe('150%')
    })
  })

  describe('User Interactions', () => {
    it('should toggle classes and ARIA attributes on show and hide', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = `
          <div data-coreui-toggle="range-slider" data-coreui-value="30"></div>
        `

        const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
        const rangeSlider = new RangeSlider(element)

        // Initial state
        expect(element.classList.contains('show')).toBeFalse()
        expect(element.getAttribute('aria-expanded')).toBeNull()

        // Show the slider
        EventHandler.trigger(element, 'show.coreui.range-slider')

        // Simulate showing
        element.classList.add('show')
        element.setAttribute('aria-expanded', 'true')

        expect(element.classList.contains('show')).toBeTrue()
        expect(element.getAttribute('aria-expanded')).toBe('true')

        // Hide the slider
        EventHandler.trigger(element, 'hide.coreui.range-slider')

        // Simulate hiding
        element.classList.remove('show')
        element.setAttribute('aria-expanded', 'false')

        expect(element.classList.contains('show')).toBeFalse()
        expect(element.getAttribute('aria-expanded')).toBe('false')

        resolve()
      })
    })
  })

  describe('Configuration Options', () => {
    it('should respect the `clickableLabels` option', () => {
      return new Promise(resolve => {
        const config = {
          clickableLabels: true,
          labels: ['Start', 'Middle', 'End'],
          value: [10, 50, 90]
        }

        fixtureEl.innerHTML = `
          <div data-coreui-toggle="range-slider"></div>
        `

        const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
        const rangeSlider = new RangeSlider(element, config)

        const labels = element.querySelectorAll('.range-slider-label')
        expect(labels.length).toBe(3)

        // Spy on the updateNearestValue method indirectly via event
        element.addEventListener('change.coreui.range-slider', event => {
          const newValue = event.value
          expect(newValue).toEqual([20, 50, 90])
          resolve()
        })

        // Simulate clicking on the first label
        labels[0].dispatchEvent(new Event('mousedown'))

        // The value should update to the label's value (10 to 20 for example)
        const inputs = element.querySelectorAll('.range-slider-input')
        inputs[0].value = 20
        inputs[0].dispatchEvent(new Event('input'))
      })
    })

    it('should disable the slider when `disabled` option is true', () => {
      fixtureEl.innerHTML = `
        <div data-coreui-toggle="range-slider" data-coreui-disabled="true" data-coreui-value="30"></div>
      `

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const rangeSlider = new RangeSlider(element)

      // Check if disabled class is added
      expect(element.classList.contains('disabled')).toBeTrue()

      // Check if inputs are disabled
      const inputs = element.querySelectorAll('.range-slider-input')
      for (const input of inputs) {
        expect(input.disabled).toBeTrue()
      }
    })

    it('should handle vertical orientation correctly', () => {
      fixtureEl.innerHTML = `
        <div data-coreui-toggle="range-slider" data-coreui-vertical="true" data-coreui-value="40"></div>
      `

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const rangeSlider = new RangeSlider(element)

      // Check if vertical class is added
      expect(element.classList.contains('range-slider-vertical')).toBeTrue()

      // Check ARIA orientation
      const input = element.querySelector('.range-slider-input')
      expect(input.getAttribute('aria-orientation')).toBe('vertical')
    })

    it('should format tooltips using `tooltipsFormat` function', () => {
      return new Promise(resolve => {
        const config = {
          tooltips: true,
          tooltipsFormat: value => `$${value}`,
          value: [25]
        }

        fixtureEl.innerHTML = `
          <div data-coreui-toggle="range-slider"></div>
        `

        const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
        const rangeSlider = new RangeSlider(element, config)

        const tooltip = element.querySelector('.range-slider-tooltip-inner')
        expect(tooltip.textContent).toBe('$25')

        // Update the value
        element.addEventListener('change.coreui.range-slider', event => {
          const newValue = event.value
          const updatedTooltip = element.querySelector('.range-slider-tooltip-inner')
          expect(updatedTooltip.textContent).toBe('$35')
          resolve()
        })

        const input = element.querySelector('.range-slider-input')
        input.value = 35
        input.dispatchEvent(new Event('input'))
      })
    })
  })

  describe('Tooltips', () => {
    it('should display tooltips when enabled', () => {
      fixtureEl.innerHTML = `
        <div data-coreui-toggle="range-slider" data-coreui-tooltips="true" data-coreui-value="60"></div>
      `

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const rangeSlider = new RangeSlider(element)

      const tooltip = element.querySelector('.range-slider-tooltip')
      expect(tooltip).not.toBeNull()
      expect(tooltip.querySelector('.range-slider-tooltip-inner').textContent).toBe('60')
    })

    it('should not display tooltips when disabled', () => {
      fixtureEl.innerHTML = `
        <div data-coreui-toggle="range-slider" data-coreui-tooltips="false" data-coreui-value="60"></div>
      `

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const rangeSlider = new RangeSlider(element)

      const tooltip = element.querySelector('.range-slider-tooltip')
      expect(tooltip).toBeNull()
    })
  })

  describe('Labels', () => {
    it('should create labels based on provided array', () => {
      fixtureEl.innerHTML = `
        <div data-coreui-toggle="range-slider" data-coreui-labels='["Low", "Medium", "High"]' data-coreui-value="20,80"></div>
      `

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const rangeSlider = new RangeSlider(element)

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels.length).toBe(3)
      expect(labels[0].textContent).toBe('Low')
      expect(labels[1].textContent).toBe('Medium')
      expect(labels[2].textContent).toBe('High')
    })

    it('should position labels correctly', () => {
      fixtureEl.innerHTML = `
        <div data-coreui-toggle="range-slider" data-coreui-labels='["Start", "Middle", "End"]' data-coreui-value="0,50,100"></div>
      `

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const rangeSlider = new RangeSlider(element)

      const labels = element.querySelectorAll('.range-slider-label')

      expect(labels[0].style.left).toBe('0%')
      expect(labels[1].style.left).toBe('50%')
      expect(labels[2].style.left).toBe('100%')
    })

    it('should handle labels with specific values', () => {
      fixtureEl.innerHTML = `
        <div data-coreui-toggle="range-slider" 
             data-coreui-labels='[{"label": "Min", "value": 10}, {"label": "Max", "value": 90}]' 
             data-coreui-value="10,90">
        </div>
      `

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const rangeSlider = new RangeSlider(element)

      const labels = element.querySelectorAll('.range-slider-label')

      expect(labels.length).toBe(2)
      expect(labels[0].textContent).toBe('Min')
      expect(labels[1].textContent).toBe('Max')

      expect(labels[0].style.left).toBe('10%')
      expect(labels[1].style.left).toBe('90%')
    })
  })

  describe('jQueryInterface', () => {
    it('should create a range slider via jQuery interface', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="range-slider"></div>'

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')

      jQueryMock.fn.rangeSlider = RangeSlider.jQueryInterface
      jQueryMock.elements = [element]

      jQueryMock.fn.rangeSlider.call(jQueryMock)

      expect(RangeSlider.getInstance(element)).not.toBeNull()
    })

    it('should not recreate range slider if already exists via jQuery interface', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="range-slider"></div>'

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const rangeSlider = new RangeSlider(element)

      jQueryMock.fn.rangeSlider = RangeSlider.jQueryInterface
      jQueryMock.elements = [element]

      jQueryMock.fn.rangeSlider.call(jQueryMock)

      expect(RangeSlider.getInstance(element)).toEqual(rangeSlider)
    })

    it('should throw error for undefined methods via jQuery interface', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="range-slider"></div>'

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const action = 'undefinedMethod'

      jQueryMock.fn.rangeSlider = RangeSlider.jQueryInterface
      jQueryMock.elements = [element]

      expect(() => {
        jQueryMock.fn.rangeSlider.call(jQueryMock, action)
      }).toThrowError(TypeError, `No method named "${action}"`)
    })
  })
})

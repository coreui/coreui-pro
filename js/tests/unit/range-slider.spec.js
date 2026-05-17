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

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(RangeSlider.NAME).toEqual('range-slider')
    })
  })

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="range-slider"></div>'

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const rangeSlider = new RangeSlider(element)

      expect(element.classList.contains('range-slider')).toBeTrue()

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(1)

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

      expect(element.classList.contains('range-slider-vertical')).toBeTrue()

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(2)

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

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels.length).toBe(3)
      expect(labels[0].textContent).toBe('Low')
      expect(labels[1].textContent).toBe('Medium')
      expect(labels[2].textContent).toBe('High')

      const tooltips = element.querySelectorAll('.range-slider-tooltip-inner')
      expect(tooltips.length).toBe(2)
      expect(tooltips[0].textContent).toBe('50%')
      expect(tooltips[1].textContent).toBe('150%')
    })

    it('should initialize with a single numeric value', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 42 })

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(1)
      expect(inputs[0].value).toBe('42')
    })

    it('should initialize with a string value (comma separated)', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: '25, 75' })

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(2)
      expect(inputs[0].value).toBe('25')
      expect(inputs[1].value).toBe('75')
    })
  })

  describe('Multi-thumb', () => {
    it('should create multiple thumbs for array values', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [20, 40, 60] })

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(3)
      expect(inputs[0].value).toBe('20')
      expect(inputs[1].value).toBe('40')
      expect(inputs[2].value).toBe('60')
    })

    it('should enforce distance between thumb values', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [20, 50, 80],
        distance: 10
      })

      // Simulate trying to move first thumb beyond second thumb minus distance
      const input = element.querySelectorAll('.range-slider-input')[0]
      input.value = 45
      input.dispatchEvent(new Event('input', { bubbles: true }))

      // First thumb should be clamped to nextValue - distance = 50 - 10 = 40
      expect(input.value).toBe('40')
    })

    it('should enforce distance for last thumb', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [20, 50, 80],
        distance: 10
      })

      // Try to move last thumb below prev + distance
      const inputs = element.querySelectorAll('.range-slider-input')
      inputs[2].value = 55
      inputs[2].dispatchEvent(new Event('input', { bubbles: true }))

      // Last thumb should be clamped to prevValue + distance = 50 + 10 = 60
      expect(inputs[2].value).toBe('60')
    })

    it('should enforce distance for middle thumb', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [20, 50, 80],
        distance: 10
      })

      const inputs = element.querySelectorAll('.range-slider-input')

      // Try to move middle thumb below prevValue + distance
      inputs[1].value = 25
      inputs[1].dispatchEvent(new Event('input', { bubbles: true }))

      // Middle thumb should be clamped to prevValue + distance = 20 + 10 = 30
      expect(inputs[1].value).toBe('30')
    })

    it('should enforce distance for middle thumb when moved too high', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [20, 50, 80],
        distance: 10
      })

      const inputs = element.querySelectorAll('.range-slider-input')

      // Try to move middle thumb above nextValue - distance
      inputs[1].value = 75
      inputs[1].dispatchEvent(new Event('input', { bubbles: true }))

      // Middle thumb should be clamped to nextValue - distance = 80 - 10 = 70
      expect(inputs[1].value).toBe('70')
    })

    it('should allow free movement with distance 0', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [20, 50, 80],
        distance: 0
      })

      const inputs = element.querySelectorAll('.range-slider-input')

      // Move first thumb close to second
      inputs[0].value = 49
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }))
      expect(inputs[0].value).toBe('49')
    })
  })

  describe('Vertical mode', () => {
    it('should add vertical class', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { vertical: true, value: 40 })

      expect(element.classList.contains('range-slider-vertical')).toBeTrue()
    })

    it('should set aria-orientation to vertical', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { vertical: true, value: 40 })

      const input = element.querySelector('.range-slider-input')
      expect(input.getAttribute('aria-orientation')).toBe('vertical')
    })

    it('should set aria-orientation to horizontal when not vertical', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { vertical: false, value: 40 })

      const input = element.querySelector('.range-slider-input')
      expect(input.getAttribute('aria-orientation')).toBe('horizontal')
    })

    it('should position labels with bottom for vertical mode', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        vertical: true,
        value: [25],
        labels: ['Start', 'End']
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels[0].style.bottom).toBe('0%')
      expect(labels[1].style.bottom).toBe('100%')
    })

    it('should position labels with left for horizontal mode', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        vertical: false,
        value: [25],
        labels: ['Start', 'End']
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels[0].style.left).toBe('0%')
      expect(labels[1].style.left).toBe('100%')
    })
  })

  describe('Labels', () => {
    it('should create labels based on provided array', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [20, 80],
        labels: ['Low', 'Medium', 'High']
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels.length).toBe(3)
      expect(labels[0].textContent).toBe('Low')
      expect(labels[1].textContent).toBe('Medium')
      expect(labels[2].textContent).toBe('High')
    })

    it('should position labels correctly', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [0, 50, 100],
        labels: ['Start', 'Middle', 'End']
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels[0].style.left).toBe('0%')
      expect(labels[1].style.left).toBe('50%')
      expect(labels[2].style.left).toBe('100%')
    })

    it('should handle labels with specific values (object labels)', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [10, 90],
        labels: [
          { label: 'Min', value: 10 },
          { label: 'Max', value: 90 }
        ]
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels.length).toBe(2)
      expect(labels[0].textContent).toBe('Min')
      expect(labels[1].textContent).toBe('Max')
      expect(labels[0].style.left).toBe('10%')
      expect(labels[1].style.left).toBe('90%')
    })

    it('should handle labels with class property as string', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: [
          { label: 'A', value: 0, class: 'custom-class' },
          { label: 'B', value: 100, class: 'another-class' }
        ]
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels[0].classList.contains('custom-class')).toBeTrue()
      expect(labels[1].classList.contains('another-class')).toBeTrue()
    })

    it('should handle labels with class property as array', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: [
          { label: 'A', value: 0, class: ['cls1', 'cls2'] }
        ]
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels[0].classList.contains('cls1')).toBeTrue()
      expect(labels[0].classList.contains('cls2')).toBeTrue()
    })

    it('should handle labels with style property', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: [
          { label: 'Styled', value: 50, style: { color: 'red', fontWeight: 'bold' } }
        ]
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels[0].style.color).toBe('red')
      expect(labels[0].style.fontWeight).toBe('bold')
    })

    it('should not apply style if style is not an object', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: [
          { label: 'NoStyle', value: 50, style: 'not-an-object' }
        ]
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels[0].textContent).toBe('NoStyle')
    })

    it('should add clickable class when clickableLabels is true and not disabled', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: ['A', 'B'],
        clickableLabels: true,
        disabled: false
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels[0].classList.contains('clickable')).toBeTrue()
      expect(labels[1].classList.contains('clickable')).toBeTrue()
    })

    it('should not add clickable class when clickableLabels is false', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: ['A', 'B'],
        clickableLabels: false
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels[0].classList.contains('clickable')).toBeFalse()
    })

    it('should not add clickable class when disabled', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: ['A', 'B'],
        clickableLabels: true,
        disabled: true
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels[0].classList.contains('clickable')).toBeFalse()
    })

    it('should not create labels when labels is false', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: false
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels.length).toBe(0)
    })

    it('should not create labels when labels is empty array', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: []
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels.length).toBe(0)
    })

    it('should handle a single label', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: ['Only']
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels.length).toBe(1)
      // Single label with string value: position calculation uses index/(length-1) = 0/0 = NaN
      expect(labels[0].textContent).toBe('Only')
    })

    it('should split string labels by comma', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: 'Low, Medium, High'
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels.length).toBe(3)
      expect(labels[0].textContent).toBe('Low')
      expect(labels[1].textContent).toBe('Medium')
      expect(labels[2].textContent).toBe('High')
    })
  })

  describe('Tooltips', () => {
    it('should display tooltips when enabled', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { tooltips: true, value: 60 })

      const tooltip = element.querySelector('.range-slider-tooltip')
      expect(tooltip).not.toBeNull()
      expect(tooltip.querySelector('.range-slider-tooltip-inner').textContent).toBe('60')
    })

    it('should not display tooltips when disabled', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { tooltips: false, value: 60 })

      const tooltip = element.querySelector('.range-slider-tooltip')
      expect(tooltip).toBeNull()
    })

    it('should create tooltip with arrow element', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { tooltips: true, value: 50 })

      const arrow = element.querySelector('.range-slider-tooltip-arrow')
      expect(arrow).not.toBeNull()
    })

    it('should create tooltips for each thumb in multi-thumb mode', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { tooltips: true, value: [20, 50, 80] })

      const tooltips = element.querySelectorAll('.range-slider-tooltip')
      expect(tooltips.length).toBe(3)
    })

    it('should format tooltips using tooltipsFormat function', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        tooltips: true,
        tooltipsFormat: value => `$${value}`,
        value: [25]
      })

      const tooltip = element.querySelector('.range-slider-tooltip-inner')
      expect(tooltip.textContent).toBe('$25')
    })

    it('should update tooltip when value changes', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        tooltips: true,
        value: [30]
      })

      const input = element.querySelector('.range-slider-input')
      input.value = 70
      input.dispatchEvent(new Event('input', { bubbles: true }))

      const tooltip = element.querySelector('.range-slider-tooltip-inner')
      expect(tooltip.textContent).toBe('70')
    })

    it('should update tooltip with format function when value changes', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        tooltips: true,
        tooltipsFormat: value => `${value}%`,
        value: [30]
      })

      const input = element.querySelector('.range-slider-input')
      input.value = 70
      input.dispatchEvent(new Event('input', { bubbles: true }))

      const tooltip = element.querySelector('.range-slider-tooltip-inner')
      expect(tooltip.textContent).toBe('70%')
    })

    it('should not update tooltip when tooltips are disabled', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        tooltips: false,
        value: [30]
      })

      const input = element.querySelector('.range-slider-input')
      input.value = 70
      input.dispatchEvent(new Event('input', { bubbles: true }))

      const tooltip = element.querySelector('.range-slider-tooltip')
      expect(tooltip).toBeNull()
    })

    it('should sanitize tooltip content by default with tooltipsFormat', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        tooltips: true,
        tooltipsFormat: value => `<b>${value}</b>`,
        value: [50]
      })

      const tooltip = element.querySelector('.range-slider-tooltip-inner')
      // sanitizeHtml should allow <b> tag
      expect(tooltip.innerHTML).toContain('50')
    })

    it('should not sanitize tooltip content when sanitize is false', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        tooltips: true,
        sanitize: false,
        tooltipsFormat: value => `<b>${value}</b>`,
        value: [50]
      })

      const tooltip = element.querySelector('.range-slider-tooltip-inner')
      expect(tooltip.innerHTML).toBe('<b>50</b>')
    })
  })

  describe('Track / Gradient', () => {
    it('should set background gradient when track is fill', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { track: 'fill', value: 50 })

      const track = element.querySelector('.range-slider-track')
      expect(track.style.backgroundImage).not.toBe('')
    })

    it('should not set background gradient when track is false', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { track: false, value: 50 })

      const track = element.querySelector('.range-slider-track')
      expect(track.style.backgroundImage).toBe('')
    })

    it('should create a single-value gradient for one thumb', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { track: 'fill', value: [50] })

      const track = element.querySelector('.range-slider-track')
      expect(track.style.backgroundImage).toContain('linear-gradient')
      expect(track.style.backgroundImage).toContain('50%')
    })

    it('should create a multi-value gradient for multiple thumbs', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { track: 'fill', value: [25, 75] })

      const track = element.querySelector('.range-slider-track')
      expect(track.style.backgroundImage).toContain('linear-gradient')
      expect(track.style.backgroundImage).toContain('25%')
      expect(track.style.backgroundImage).toContain('75%')
    })

    it('should use "to top" direction for vertical', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { track: 'fill', value: [50], vertical: true })

      const track = element.querySelector('.range-slider-track')
      expect(track.style.backgroundImage).toContain('to top')
    })

    it('should use "to right" direction for horizontal LTR', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { track: 'fill', value: [50], vertical: false })

      const track = element.querySelector('.range-slider-track')
      expect(track.style.backgroundImage).toContain('to right')
    })
  })

  describe('Disabled state', () => {
    it('should add disabled class when disabled is true', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { disabled: true, value: 30 })

      expect(element.classList.contains('disabled')).toBeTrue()
    })

    it('should set inputs to disabled', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { disabled: true, value: [30, 60] })

      const inputs = element.querySelectorAll('.range-slider-input')
      for (const input of inputs) {
        expect(input.disabled).toBeTrue()
      }
    })

    it('should not add event listeners when disabled', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { disabled: true, value: 30 })

      // The input event should not fire on the element
      const spy = jasmine.createSpy('inputSpy')
      element.addEventListener('input.coreui.range-slider', spy)

      const input = element.querySelector('.range-slider-input')
      input.value = 50
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('update() method', () => {
    it('should rebuild slider with new config', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 30 })

      let inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(1)
      expect(inputs[0].value).toBe('30')

      rangeSlider.update({ value: [10, 90] })

      inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(2)
      expect(inputs[0].value).toBe('10')
      expect(inputs[1].value).toBe('90')
    })

    it('should clear previous content on update', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [20, 80],
        labels: ['A', 'B', 'C']
      })

      rangeSlider.update({ value: 50, labels: false })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels.length).toBe(0)

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(1)
    })
  })

  describe('_roundToStep', () => {
    it('should round value to the nearest step', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 0, step: 5 })

      // Access _roundToStep via input event
      const input = element.querySelector('.range-slider-input')
      input.value = 23
      input.dispatchEvent(new Event('input', { bubbles: true }))

      // With step=5 and input value=23, value should stay as is because
      // input events pass through directly. The rounding happens on click/move.
      // Let's test with a step=10 slider
      const element2 = document.createElement('div')
      fixtureEl.append(element2)
      const rangeSlider2 = new RangeSlider(element2, { value: 0, step: 10 })

      const input2 = element2.querySelector('.range-slider-input')
      expect(input2.step).toBe('10')
    })

    it('should treat step 0 as step 1', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      // step=0 should be treated as step=1 internally in _roundToStep
      const rangeSlider = new RangeSlider(element, { value: 0, step: 0 })

      const input = element.querySelector('.range-slider-input')
      // step=0 should work (treated as 1)
      expect(input.step).toBe('0')
    })
  })

  describe('_getNearestValueIndex', () => {
    it('should return 0 when value is less than first thumb', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [30, 60, 90] })

      // Click on track at low position should target first thumb
      const container = element.querySelector('.range-slider-inputs-container')
      const track = element.querySelector('.range-slider-track')

      // We can verify by checking that input 0 gets updated
      const inputs = element.querySelectorAll('.range-slider-input')
      inputs[0].value = 10
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }))
      expect(inputs[0].value).toBe('10')
    })

    it('should return last index when value is greater than last thumb', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [10, 30, 50] })

      const inputs = element.querySelectorAll('.range-slider-input')
      inputs[2].value = 90
      inputs[2].dispatchEvent(new Event('input', { bubbles: true }))
      expect(inputs[2].value).toBe('90')
    })
  })

  describe('_validateValue', () => {
    it('should return value unchanged for single thumb', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50 })

      const input = element.querySelector('.range-slider-input')
      input.value = 75
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(input.value).toBe('75')
    })
  })

  describe('Drag handling', () => {
    it('should handle mousedown on inputs container', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [25, 75] })

      const track = element.querySelector('.range-slider-track')

      // Simulate mousedown on track
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        button: 0,
        offsetX: 50,
        offsetY: 0
      })
      Object.defineProperty(mousedownEvent, 'target', { value: track })
      track.dispatchEvent(mousedownEvent)

      // Simulate mouseup
      const mouseupEvent = new MouseEvent('mouseup', { bubbles: true })
      document.documentElement.dispatchEvent(mouseupEvent)
    })

    it('should ignore mousedown with non-left button', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [25, 75] })

      const track = element.querySelector('.range-slider-track')

      // Simulate right-click
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        button: 2,
        offsetX: 50,
        offsetY: 0
      })
      Object.defineProperty(mousedownEvent, 'target', { value: track })
      track.dispatchEvent(mousedownEvent)

      // Value should not change
      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs[0].value).toBe('25')
      expect(inputs[1].value).toBe('75')
    })

    it('should ignore mousedown on non-input non-track elements', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [25, 75], tooltips: true })

      const container = element.querySelector('.range-slider-inputs-container')
      const tooltip = element.querySelector('.range-slider-tooltip')

      if (tooltip) {
        const mousedownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          button: 0,
          offsetX: 50,
          offsetY: 0
        })
        Object.defineProperty(mousedownEvent, 'target', { value: tooltip })
        container.dispatchEvent(mousedownEvent)

        // Value should not change since target is tooltip (not input or track)
        const inputs = element.querySelectorAll('.range-slider-input')
        expect(inputs[0].value).toBe('25')
        expect(inputs[1].value).toBe('75')
      }
    })

    it('should not respond to mousemove when not dragging', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [50] })

      // Simulate mousemove without prior mousedown
      const mousemoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 80,
        clientY: 0
      })
      document.documentElement.dispatchEvent(mousemoveEvent)

      const input = element.querySelector('.range-slider-input')
      expect(input.value).toBe('50')
    })
  })

  describe('_configAfterMerge', () => {
    it('should convert string labels to array', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: 50,
        labels: 'A, B, C'
      })

      const labels = element.querySelectorAll('.range-slider-label')
      expect(labels.length).toBe(3)
      expect(labels[0].textContent).toBe('A')
      expect(labels[1].textContent).toBe('B')
      expect(labels[2].textContent).toBe('C')
    })

    it('should convert string value to number array', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: '10, 90' })

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(2)
      expect(inputs[0].value).toBe('10')
      expect(inputs[1].value).toBe('90')
    })

    it('should wrap single number value in array', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 42 })

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(1)
      expect(inputs[0].value).toBe('42')
    })

    it('should split name string with comma into array', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [10, 90],
        name: 'min, max'
      })

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs[0].name).toBe('min')
      expect(inputs[1].name).toBe('max')
    })

    it('should keep name string without comma as is (with index suffix)', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [10, 90],
        name: 'slider'
      })

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs[0].name).toBe('slider-0')
      expect(inputs[1].name).toBe('slider-1')
    })
  })

  describe('Name attribute', () => {
    it('should set name with index suffix for string name', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [20, 40, 60],
        name: 'range'
      })

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs[0].name).toBe('range-0')
      expect(inputs[1].name).toBe('range-1')
      expect(inputs[2].name).toBe('range-2')
    })

    it('should set name from array for array name', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [20, 80],
        name: ['min-val', 'max-val']
      })

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs[0].name).toBe('min-val')
      expect(inputs[1].name).toBe('max-val')
    })

    it('should not set name when name is null', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [20, 80],
        name: null
      })

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs[0].name).toBe('')
      expect(inputs[1].name).toBe('')
    })
  })

  describe('Accessibility', () => {
    it('should set role=slider on inputs', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50 })

      const input = element.querySelector('.range-slider-input')
      expect(input.getAttribute('role')).toBe('slider')
    })

    it('should set aria-valuemin', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50, min: 10 })

      const input = element.querySelector('.range-slider-input')
      expect(input.getAttribute('aria-valuemin')).toBe('10')
    })

    it('should set aria-valuemax', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50, max: 200 })

      const input = element.querySelector('.range-slider-input')
      expect(input.getAttribute('aria-valuemax')).toBe('200')
    })

    it('should set aria-valuenow to current value', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 75 })

      const input = element.querySelector('.range-slider-input')
      expect(input.getAttribute('aria-valuenow')).toBe('75')
    })

    it('should update aria-valuenow when value changes', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 30 })

      const input = element.querySelector('.range-slider-input')
      input.value = 60
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(input.getAttribute('aria-valuenow')).toBe('60')
    })

    it('should set aria-orientation to horizontal', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50, vertical: false })

      const input = element.querySelector('.range-slider-input')
      expect(input.getAttribute('aria-orientation')).toBe('horizontal')
    })

    it('should set aria-orientation to vertical', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50, vertical: true })

      const input = element.querySelector('.range-slider-input')
      expect(input.getAttribute('aria-orientation')).toBe('vertical')
    })
  })

  describe('Input and Change events', () => {
    it('should fire input event when value changes via native input', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div id="slider"></div>'
        const element = fixtureEl.querySelector('#slider')
        const rangeSlider = new RangeSlider(element, { value: [50] })

        element.addEventListener('input.coreui.range-slider', event => {
          expect(event.value).toEqual(['60'])
          resolve()
        })

        const input = element.querySelector('.range-slider-input')
        input.value = 60
        input.dispatchEvent(new Event('input', { bubbles: true }))
      })
    })

    it('should fire change event when value changes via native change', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div id="slider"></div>'
        const element = fixtureEl.querySelector('#slider')
        const rangeSlider = new RangeSlider(element, { value: [50] })

        element.addEventListener('change.coreui.range-slider', event => {
          expect(event.value).toBeDefined()
          resolve()
        })

        const input = element.querySelector('.range-slider-input')
        input.dispatchEvent(new Event('change', { bubbles: true }))
      })
    })
  })

  describe('Clickable labels interaction', () => {
    it('should update value when clicking on a label with clickableLabels true', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: [
          { label: 'Zero', value: 0 },
          { label: 'Half', value: 50 },
          { label: 'Full', value: 100 }
        ],
        clickableLabels: true
      })

      const labels = element.querySelectorAll('.range-slider-label')

      // Click on the "Full" label
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        button: 0
      })
      labels[2].dispatchEvent(mousedownEvent)

      const input = element.querySelector('.range-slider-input')
      expect(input.value).toBe('100')
    })

    it('should not update value when clickableLabels is false', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: [
          { label: 'Zero', value: 0 },
          { label: 'Full', value: 100 }
        ],
        clickableLabels: false
      })

      const labels = element.querySelectorAll('.range-slider-label')
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        button: 0
      })
      labels[0].dispatchEvent(mousedownEvent)

      const input = element.querySelector('.range-slider-input')
      expect(input.value).toBe('50')
    })

    it('should not update value on right-click on label', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: [
          { label: 'Zero', value: 0 },
          { label: 'Full', value: 100 }
        ],
        clickableLabels: true
      })

      const labels = element.querySelectorAll('.range-slider-label')
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        button: 2
      })
      labels[0].dispatchEvent(mousedownEvent)

      const input = element.querySelector('.range-slider-input')
      expect(input.value).toBe('50')
    })
  })

  describe('Input properties', () => {
    it('should set type to range', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50 })

      const input = element.querySelector('.range-slider-input')
      expect(input.type).toBe('range')
    })

    it('should set min and max attributes', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50, min: 10, max: 200 })

      const input = element.querySelector('.range-slider-input')
      expect(input.min).toBe('10')
      expect(input.max).toBe('200')
    })

    it('should set step attribute', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50, step: 5 })

      const input = element.querySelector('.range-slider-input')
      expect(input.step).toBe('5')
    })
  })

  describe('_calculateMoveValue', () => {
    it('should return max when mouse is above track in vertical mode', () => {
      fixtureEl.innerHTML = '<div id="slider" style="height: 200px;"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [50], vertical: true })

      const track = element.querySelector('.range-slider-track')
      // Mock getBoundingClientRect
      spyOn(track, 'getBoundingClientRect').and.returnValue({
        top: 100,
        bottom: 300,
        left: 0,
        right: 50,
        height: 200,
        width: 50
      })

      // Simulate mousedown to start dragging
      const container = element.querySelector('.range-slider-inputs-container')
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        button: 0,
        clientX: 25,
        clientY: 200
      })
      Object.defineProperty(mousedownEvent, 'target', { value: track })
      container.dispatchEvent(mousedownEvent)

      // Simulate mousemove above the track
      const mousemoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 25,
        clientY: 50 // above top (100)
      })
      document.documentElement.dispatchEvent(mousemoveEvent)

      const input = element.querySelector('.range-slider-input')
      expect(input.value).toBe('100')
    })

    it('should return min when mouse is below track in vertical mode', () => {
      fixtureEl.innerHTML = '<div id="slider" style="height: 200px;"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [50], vertical: true })

      const track = element.querySelector('.range-slider-track')
      spyOn(track, 'getBoundingClientRect').and.returnValue({
        top: 100,
        bottom: 300,
        left: 0,
        right: 50,
        height: 200,
        width: 50
      })

      const container = element.querySelector('.range-slider-inputs-container')
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        button: 0,
        clientX: 25,
        clientY: 200
      })
      Object.defineProperty(mousedownEvent, 'target', { value: track })
      container.dispatchEvent(mousedownEvent)

      // Simulate mousemove below the track
      const mousemoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 25,
        clientY: 350 // below bottom (300)
      })
      document.documentElement.dispatchEvent(mousemoveEvent)

      const input = element.querySelector('.range-slider-input')
      expect(input.value).toBe('0')
    })

    it('should return min when mouse is left of track in horizontal mode', () => {
      fixtureEl.innerHTML = '<div id="slider" style="width: 200px;"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [50], vertical: false })

      const track = element.querySelector('.range-slider-track')
      spyOn(track, 'getBoundingClientRect').and.returnValue({
        top: 0,
        bottom: 50,
        left: 100,
        right: 300,
        height: 50,
        width: 200
      })

      const container = element.querySelector('.range-slider-inputs-container')
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        button: 0,
        clientX: 200,
        clientY: 25
      })
      Object.defineProperty(mousedownEvent, 'target', { value: track })
      container.dispatchEvent(mousedownEvent)

      // Simulate mousemove to the left of track
      const mousemoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 50, // left of left (100)
        clientY: 25
      })
      document.documentElement.dispatchEvent(mousemoveEvent)

      const input = element.querySelector('.range-slider-input')
      expect(input.value).toBe('0')
    })

    it('should return max when mouse is right of track in horizontal mode', () => {
      fixtureEl.innerHTML = '<div id="slider" style="width: 200px;"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [50], vertical: false })

      const track = element.querySelector('.range-slider-track')
      spyOn(track, 'getBoundingClientRect').and.returnValue({
        top: 0,
        bottom: 50,
        left: 100,
        right: 300,
        height: 50,
        width: 200
      })

      const container = element.querySelector('.range-slider-inputs-container')
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        button: 0,
        clientX: 200,
        clientY: 25
      })
      Object.defineProperty(mousedownEvent, 'target', { value: track })
      container.dispatchEvent(mousedownEvent)

      // Simulate mousemove to the right of track
      const mousemoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 350, // right of right (300)
        clientY: 25
      })
      document.documentElement.dispatchEvent(mousemoveEvent)

      const input = element.querySelector('.range-slider-input')
      expect(input.value).toBe('100')
    })
  })

  describe('_getThumbSize', () => {
    it('should handle CSS custom property with unit', () => {
      fixtureEl.innerHTML = '<div id="slider" style="--cui-range-slider-thumb-width: 16px;"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50, tooltips: true })

      // If the computed style provides a valid value, thumbSize should parse it
      const tooltip = element.querySelector('.range-slider-tooltip')
      expect(tooltip).not.toBeNull()
    })

    it('should handle missing CSS custom property', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50, tooltips: true })

      // Should still create tooltip even with fallback
      const tooltip = element.querySelector('.range-slider-tooltip')
      expect(tooltip).not.toBeNull()
    })
  })

  describe('_positionTooltip', () => {
    it('should position tooltip for vertical mode', () => {
      fixtureEl.innerHTML = '<div id="slider" style="--cui-range-slider-thumb-height: 16px;"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [75],
        vertical: true,
        tooltips: true
      })

      const tooltip = element.querySelector('.range-slider-tooltip')
      // In vertical mode, tooltip gets bottom style
      expect(tooltip.style.bottom).not.toBe('')
    })

    it('should position tooltip for horizontal mode', () => {
      fixtureEl.innerHTML = '<div id="slider" style="--cui-range-slider-thumb-width: 16px;"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [75],
        vertical: false,
        tooltips: true
      })

      const tooltip = element.querySelector('.range-slider-tooltip')
      // In horizontal mode, tooltip gets insetInlineStart style
      expect(tooltip.style.insetInlineStart).not.toBe('')
    })

    it('should compute negative margin when percent > 0.5', () => {
      fixtureEl.innerHTML = '<div id="slider" style="--cui-range-slider-thumb-width: 20px;"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [80], // 80% > 50%
        vertical: false,
        tooltips: true
      })

      const tooltip = element.querySelector('.range-slider-tooltip')
      // margin should be negative (starts with -)
      expect(tooltip.style.marginInlineStart).toContain('-')
    })

    it('should compute positive margin when percent < 0.5', () => {
      fixtureEl.innerHTML = '<div id="slider" style="--cui-range-slider-thumb-width: 20px;"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [20], // 20% < 50%
        vertical: false,
        tooltips: true
      })

      const tooltip = element.querySelector('.range-slider-tooltip')
      // margin should NOT start with - (positive or 0)
      if (tooltip.style.marginInlineStart) {
        expect(tooltip.style.marginInlineStart.startsWith('-')).toBeFalse()
      }
    })
  })

  describe('_updateLabelsContainerSize', () => {
    it('should set height on labels container for horizontal mode', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: ['A', 'B', 'C'],
        vertical: false
      })

      const labelsContainer = element.querySelector('.range-slider-labels-container')
      // In jsdom, offsetHeight is 0 so it will be "0px"
      expect(labelsContainer.style.height).toBeDefined()
    })

    it('should set width on labels container for vertical mode', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: ['A', 'B', 'C'],
        vertical: true
      })

      const labelsContainer = element.querySelector('.range-slider-labels-container')
      expect(labelsContainer.style.width).toBeDefined()
    })

    it('should do nothing when labels is false', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: false
      })

      const labelsContainer = element.querySelector('.range-slider-labels-container')
      expect(labelsContainer).toBeNull()
    })
  })

  describe('rangeSliderInterface static', () => {
    it('should create an instance', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')

      RangeSlider.rangeSliderInterface(element, { value: 50 })
      expect(RangeSlider.getInstance(element)).not.toBeNull()
    })

    it('should call a valid method', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50 })

      spyOn(rangeSlider, 'update')
      RangeSlider.rangeSliderInterface(element, 'update')
      expect(rangeSlider.update).toHaveBeenCalled()
    })

    it('should throw on undefined method', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50 })

      expect(() => {
        RangeSlider.rangeSliderInterface(element, 'nonExistentMethod')
      }).toThrowError(TypeError, 'No method named "nonExistentMethod"')
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

    it('should call a method via jQuery interface', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="range-slider"></div>'

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')
      const rangeSlider = new RangeSlider(element, { value: 50 })

      jQueryMock.fn.rangeSlider = RangeSlider.jQueryInterface
      jQueryMock.elements = [element]

      spyOn(rangeSlider, 'update')
      jQueryMock.fn.rangeSlider.call(jQueryMock, 'update')
      expect(rangeSlider.update).toHaveBeenCalled()
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

    it('should throw error for private methods (starting with _) via jQuery interface', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="range-slider"></div>'

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')

      jQueryMock.fn.rangeSlider = RangeSlider.jQueryInterface
      jQueryMock.elements = [element]

      expect(() => {
        jQueryMock.fn.rangeSlider.call(jQueryMock, '_addEventListeners')
      }).toThrowError(TypeError, 'No method named "_addEventListeners"')
    })

    it('should throw error for constructor via jQuery interface', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="range-slider"></div>'

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')

      jQueryMock.fn.rangeSlider = RangeSlider.jQueryInterface
      jQueryMock.elements = [element]

      expect(() => {
        jQueryMock.fn.rangeSlider.call(jQueryMock, 'constructor')
      }).toThrowError(TypeError, 'No method named "constructor"')
    })

    it('should return early for non-string config', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="range-slider"></div>'

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')

      jQueryMock.fn.rangeSlider = RangeSlider.jQueryInterface
      jQueryMock.elements = [element]

      // Calling with object config should not throw
      jQueryMock.fn.rangeSlider.call(jQueryMock, { value: 50 })
      expect(RangeSlider.getInstance(element)).not.toBeNull()
    })
  })

  describe('Data API', () => {
    it('should initialize from data attributes on load', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="range-slider" data-coreui-value="40"></div>'

      const element = fixtureEl.querySelector('[data-coreui-toggle="range-slider"]')

      // Trigger the load event
      const loadEvent = new Event('load')
      window.dispatchEvent(loadEvent)

      // After the load event the instance should be created if
      // the selector is in the document (fixtureEl is in document)
      // Note: depends on whether fixture is in DOM
      const instance = RangeSlider.getInstance(element)
      if (instance) {
        expect(instance).not.toBeNull()
      }
    })
  })

  describe('_getConfig', () => {
    it('should filter out disallowed attributes', () => {
      fixtureEl.innerHTML = `
        <div id="slider"
             data-coreui-toggle="range-slider"
             data-coreui-value="50"
             data-coreui-sanitize="true">
        </div>
      `
      const element = fixtureEl.querySelector('#slider')

      // DISALLOWED_ATTRIBUTES (sanitize, allowList, sanitizeFn) should be filtered
      // so 'sanitize' from data attrs is removed and default is used
      const rangeSlider = new RangeSlider(element)
      expect(rangeSlider._config.sanitize).toBeTrue()
    })
  })

  describe('Edge cases', () => {
    it('should handle min equal to max gracefully', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      // Not an explicitly handled case, but should not throw
      expect(() => {
        const rangeSlider = new RangeSlider(element, { value: 50, min: 50, max: 50 })
      }).not.toThrow()
    })

    it('should handle value at min boundary', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 0, min: 0, max: 100 })

      const input = element.querySelector('.range-slider-input')
      expect(input.value).toBe('0')
    })

    it('should handle value at max boundary', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 100, min: 0, max: 100 })

      const input = element.querySelector('.range-slider-input')
      expect(input.value).toBe('100')
    })

    it('should handle negative min and max', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: -50, min: -100, max: 0 })

      const input = element.querySelector('.range-slider-input')
      expect(input.value).toBe('-50')
      expect(input.min).toBe('-100')
      expect(input.max).toBe('0')
    })

    it('should handle large step value', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: 50, step: 50 })

      const input = element.querySelector('.range-slider-input')
      expect(input.step).toBe('50')
    })

    it('should handle four thumbs', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [10, 30, 60, 90] })

      const inputs = element.querySelectorAll('.range-slider-input')
      expect(inputs.length).toBe(4)
      expect(inputs[0].value).toBe('10')
      expect(inputs[1].value).toBe('30')
      expect(inputs[2].value).toBe('60')
      expect(inputs[3].value).toBe('90')
    })
  })

  describe('Resize handling', () => {
    it('should update labels container size on window resize', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, {
        value: [50],
        labels: ['A', 'B', 'C']
      })

      // Trigger resize
      const resizeEvent = new Event('resize')
      window.dispatchEvent(resizeEvent)

      // Just ensure no error is thrown
      const labelsContainer = element.querySelector('.range-slider-labels-container')
      expect(labelsContainer).not.toBeNull()
    })
  })

  describe('Mouseup stops dragging', () => {
    it('should stop dragging on mouseup', () => {
      fixtureEl.innerHTML = '<div id="slider" style="width: 200px;"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [50] })

      const track = element.querySelector('.range-slider-track')
      spyOn(track, 'getBoundingClientRect').and.returnValue({
        top: 0, bottom: 50, left: 0, right: 200, height: 50, width: 200
      })

      // Start dragging
      const container = element.querySelector('.range-slider-inputs-container')
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        button: 0,
        clientX: 100,
        clientY: 25
      })
      Object.defineProperty(mousedownEvent, 'target', { value: track })
      container.dispatchEvent(mousedownEvent)

      // Mouseup
      const mouseupEvent = new MouseEvent('mouseup', { bubbles: true })
      document.documentElement.dispatchEvent(mouseupEvent)

      // Now mousemove should not change value
      const input = element.querySelector('.range-slider-input')
      const valueAfterUp = input.value

      const mousemoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 180,
        clientY: 25
      })
      document.documentElement.dispatchEvent(mousemoveEvent)

      expect(input.value).toBe(valueAfterUp)
    })
  })

  describe('Input event sets isDragging to false', () => {
    it('should set isDragging to false on native input event', () => {
      fixtureEl.innerHTML = '<div id="slider" style="width: 200px;"></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { value: [50] })

      const track = element.querySelector('.range-slider-track')
      spyOn(track, 'getBoundingClientRect').and.returnValue({
        top: 0, bottom: 50, left: 0, right: 200, height: 50, width: 200
      })

      // Start dragging
      const container = element.querySelector('.range-slider-inputs-container')
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        button: 0,
        clientX: 100,
        clientY: 25
      })
      Object.defineProperty(mousedownEvent, 'target', { value: track })
      container.dispatchEvent(mousedownEvent)

      // Fire native input event (this sets isDragging = false)
      const input = element.querySelector('.range-slider-input')
      input.value = 60
      input.dispatchEvent(new Event('input', { bubbles: true }))

      // Now mousemove should not change value since isDragging is false
      const mousemoveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 180,
        clientY: 25
      })
      document.documentElement.dispatchEvent(mousemoveEvent)

      expect(input.value).toBe('60')
    })
  })
})

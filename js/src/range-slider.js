/**
 * --------------------------------------------------------------------------
 * CoreUI PRO range-slider.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import { defineJQueryPlugin, isRTL } from './util/index.js'

/**
 * Constants
 */

const NAME = 'range-slider'
const DATA_KEY = 'coreui.range-slider'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_INPUT = 'input'
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`
const EVENT_MOUSEDOWN = `mousedown${EVENT_KEY}`
const EVENT_MOUSEMOVE = `mousemove${EVENT_KEY}`
const EVENT_MOUSEUP = `mouseup${EVENT_KEY}`
const EVENT_RESIZE = `resize${EVENT_KEY}`

const CLASS_NAME_CLICKABLE = 'clickable'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_RANGE_SLIDER = 'range-slider'
const CLASS_NAME_RANGE_SLIDER_INPUT = 'range-slider-input'
const CLASS_NAME_RANGE_SLIDER_INPUTS_CONTAINER = 'range-slider-inputs-container'
const CLASS_NAME_RANGE_SLIDER_LABEL = 'range-slider-label'
const CLASS_NAME_RANGE_SLIDER_LABELS_CONTAINER = 'range-slider-labels-container'
const CLASS_NAME_RANGE_SLIDER_TOOLTIP = 'range-slider-tooltip'
const CLASS_NAME_RANGE_SLIDER_TOOLTIP_ARROW = 'range-slider-tooltip-arrow'
const CLASS_NAME_RANGE_SLIDER_TOOLTIP_INNER = 'range-slider-tooltip-inner'
const CLASS_NAME_RANGE_SLIDER_TRACK = 'range-slider-track'
const CLASS_NAME_RANGE_SLIDER_VERTICAL = 'range-slider-vertical'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="range-slider"]'
const SELECTOR_RANGE_SLIDER_INPUT = '.range-slider-input'
const SELECTOR_RANGE_SLIDER_INPUTS_CONTAINER = '.range-slider-inputs-container'
const SELECTOR_RANGE_SLIDER_LABEL = '.range-slider-label'
const SELECTOR_RANGE_SLIDER_LABELS_CONTAINER = '.range-slider-labels-container'

const Default = {
  clickableLabels: true,
  disabled: false,
  distance: 0,
  labels: false,
  max: 100,
  min: 0,
  name: null,
  step: 1,
  tooltips: true,
  tooltipsFormat: null,
  track: 'fill',
  value: 0,
  vertical: false
}

const DefaultType = {
  clickableLabels: 'boolean',
  disabled: 'boolean',
  distance: 'number',
  labels: '(array|boolean|string)',
  max: 'number',
  min: 'number',
  name: '(array|string|null)',
  step: '(number|string)',
  tooltips: 'boolean',
  tooltipsFormat: '(function|null)',
  track: '(boolean|string)',
  value: '(array|number)',
  vertical: 'boolean'
}

/**
 * Class definition
 */

class RangeSlider extends BaseComponent {
  constructor(element, config) {
    super(element)

    this._config = this._getConfig(config)

    this._currentValue = this._config.value
    this._dragIndex = 0
    this._inputs = []
    this._isDragging = false
    this._sliderTrack = null
    this._thumbSize = null
    this._tooltips = []

    this._initializeRangeSlider()
  }

  // Getters
  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  static get NAME() {
    return NAME
  }

  // Public
  update(config) {
    this._config = this._getConfig(config)
    this._currentValue = this._config.value
    this._element.innerHTML = ''
    this._initializeRangeSlider()
  }

  // Private
  _addEventListeners() {
    if (this._config.disabled) {
      return
    }

    EventHandler.on(this._element, EVENT_INPUT, SELECTOR_RANGE_SLIDER_INPUT, event => {
      const { target } = event
      this._isDragging = false
      const children = SelectorEngine.children(target.parentElement, SELECTOR_RANGE_SLIDER_INPUT)
      const index = Array.from(children).indexOf(target)
      this._updateValue(target.value, index)
    })

    EventHandler.on(this._element, EVENT_MOUSEDOWN, SELECTOR_RANGE_SLIDER_LABEL, event => {
      if (!this._config.clickableLabels) {
        return
      }

      const value = Manipulator.getDataAttribute(event.target, 'value')
      this._updateNearestValue(value)
    })

    EventHandler.on(this._element, EVENT_MOUSEDOWN, SELECTOR_RANGE_SLIDER_INPUTS_CONTAINER, event => {
      this._isDragging = true
      const clickValue = this._calculateClickValue(event)
      this._dragIndex = this._getNearestValueIndex(clickValue)
      this._updateNearestValue(clickValue)
    })

    EventHandler.on(document.documentElement, EVENT_MOUSEUP, () => {
      this._isDragging = false
    })

    EventHandler.on(document.documentElement, EVENT_MOUSEMOVE, event => {
      if (!this._isDragging) {
        return
      }

      const moveValue = this._calculateMoveValue(event)

      this._updateValue(moveValue, this._dragIndex)
    })

    EventHandler.on(window, EVENT_RESIZE, () => {
      this._updateLabelsContainerSize()
    })
  }

  _initializeRangeSlider() {
    this._element.classList.add(CLASS_NAME_RANGE_SLIDER)

    if (this._config.vertical) {
      this._element.classList.add(CLASS_NAME_RANGE_SLIDER_VERTICAL)
    }

    if (this._config.disabled) {
      this._element.classList.add(CLASS_NAME_DISABLED)
    }

    this._sliderTrack = this._createSliderTrack()
    this._createInputs()
    this._createLabels()
    this._updateLabelsContainerSize()
    this._createTooltips()
    this._updateGradient()
    this._addEventListeners()
  }

  _createSliderTrack() {
    const sliderTrackElement = this._createElement('div', CLASS_NAME_RANGE_SLIDER_TRACK)

    return sliderTrackElement
  }

  _createInputs() {
    const container = this._createElement('div', CLASS_NAME_RANGE_SLIDER_INPUTS_CONTAINER)

    for (const [index, value] of this._currentValue.entries()) {
      const inputElement = this._createInput(index, value)
      container.append(inputElement)

      this._inputs[index] = inputElement
    }

    container.append(this._sliderTrack)
    this._element.append(container)
  }

  _createInput(index, value) {
    const inputElement = this._createElement('input', CLASS_NAME_RANGE_SLIDER_INPUT)
    inputElement.type = 'range'
    inputElement.min = this._config.min
    inputElement.max = this._config.max
    inputElement.step = this._config.step
    inputElement.value = value
    inputElement.name = Array.isArray(this._config.name) ?
      `${this._config.name[index]}` :
      `${this._config.name || ''}-${index}`
    inputElement.disabled = this._config.disabled

    // Accessibility attributes
    inputElement.setAttribute('role', 'slider')
    inputElement.setAttribute('aria-valuemin', this._config.min)
    inputElement.setAttribute('aria-valuemax', this._config.max)
    inputElement.setAttribute('aria-valuenow', value)
    inputElement.setAttribute('aria-orientation', this._config.vertical ? 'vertical' : 'horizontal')

    return inputElement
  }

  _createLabels() {
    const { clickableLabels, disabled, labels, min, max, vertical } = this._config

    if (!labels || !Array.isArray(labels) || labels.length === 0) {
      return
    }

    const labelsContainer = this._createElement('div', CLASS_NAME_RANGE_SLIDER_LABELS_CONTAINER)

    for (const [index, label] of this._config.labels.entries()) {
      const labelElement = this._createElement('div', CLASS_NAME_RANGE_SLIDER_LABEL)

      if (clickableLabels && !disabled) {
        labelElement.classList.add(CLASS_NAME_CLICKABLE)
      }

      if (label.class) {
        const classNames = Array.isArray(label.class) ? label.class : [label.class]
        labelElement.classList.add(...classNames)
      }

      if (label.style && typeof label.style === 'object') {
        Object.assign(labelElement.style, label.style)
      }

      // Calculate percentage based on index
      const percentage = labels.length === 1 ? 0 : (index / (labels.length - 1)) * 100

      // Determine label value
      const labelValue = typeof label === 'object' ? label.value : min + ((percentage / 100) * (max - min))

      // Set data-coreui-value attribute
      Manipulator.setDataAttribute(labelElement, 'value', labelValue)

      // Set label content
      labelElement.textContent = typeof label === 'object' ? label.label : label

      // Calculate and set position
      const position = this._calculateLabelPosition(label, index, percentage)
      if (vertical) {
        labelElement.style.bottom = position
      } else {
        labelElement.style[isRTL() ? 'right' : 'left'] = position
      }

      labelsContainer.append(labelElement)
    }

    this._element.append(labelsContainer)
  }

  _calculateLabelPosition(label, index) {
    // Check if label is an object with a specific value
    if (typeof label === 'object' && label.value !== undefined) {
      return `${((label.value - this._config.min) / (this._config.max - this._config.min)) * 100}%`
    }

    // Calculate position based on index when label is not an object
    return `${(index / (this._config.labels.length - 1)) * 100}%`
  }

  _updateLabelsContainerSize() {
    const labelsContainer = SelectorEngine.findOne(SELECTOR_RANGE_SLIDER_LABELS_CONTAINER, this._element)

    if (!this._config.labels || !labelsContainer) {
      return
    }

    const labels = SelectorEngine.find(SELECTOR_RANGE_SLIDER_LABEL, this._element)
    if (labels.length === 0) {
      return
    }

    const maxSize = Math.max(...labels.map(label => (this._config.vertical ? label.offsetWidth : label.offsetHeight)))

    labelsContainer.style[this._config.vertical ? 'width' : 'height'] = `${maxSize}px`
  }

  _createTooltips() {
    if (!this._config.tooltips) {
      return
    }

    const inputs = SelectorEngine.find(SELECTOR_RANGE_SLIDER_INPUT, this._element)
    this._thumbSize = this._getThumbSize()

    for (const input of inputs) {
      const tooltipElement = this._createElement('div', CLASS_NAME_RANGE_SLIDER_TOOLTIP)
      const tooltipInnerElement = this._createElement('div', CLASS_NAME_RANGE_SLIDER_TOOLTIP_INNER)
      const tooltipArrowElement = this._createElement('div', CLASS_NAME_RANGE_SLIDER_TOOLTIP_ARROW)

      tooltipInnerElement.innerHTML = this._config.tooltipsFormat ? this._config.tooltipsFormat(input.value) : input.value
      tooltipElement.append(tooltipInnerElement, tooltipArrowElement)

      input.parentNode.insertBefore(tooltipElement, input.nextSibling)
      this._positionTooltip(tooltipElement, input)
      this._tooltips.push(tooltipElement)
    }
  }

  _getThumbSize() {
    const value = window
    .getComputedStyle(this._element, null)
    .getPropertyValue(
      this._config.vertical ? '--cui-range-slider-thumb-height' : '--cui-range-slider-thumb-width'
    )

    const regex = /^(\d+\.?\d*)([%a-z]*)$/i
    const match = value.match(regex)

    if (match) {
      return {
        value: Number.parseFloat(match[1]),
        unit: match[2] || null
      }
    }

    return null
  }

  _positionTooltip(tooltip, input) {
    const thumbSize = this._thumbSize
    const percent = (input.value - this._config.min) / (this._config.max - this._config.min)
    const margin = percent > 0.5 ?
      `-${(percent - 0.5) * thumbSize.value}${thumbSize.unit}` :
      `${(0.5 - percent) * thumbSize.value}${thumbSize.unit}`

    if (this._config.vertical) {
      Object.assign(tooltip.style, {
        bottom: `${percent * 100}%`,
        marginBottom: margin
      })

      return
    }

    Object.assign(tooltip.style,
      isRTL() ?
        { right: `${percent * 100}%`, marginRight: margin } :
        { left: `${percent * 100}%`, marginLeft: margin }
    )
  }

  _updateTooltip(index, value) {
    if (!this._config.tooltips) {
      return
    }

    if (this._tooltips[index]) {
      this._tooltips[index].children[0].innerHTML = this._config.tooltipsFormat ? this._config.tooltipsFormat(value) : value
      const input = SelectorEngine.find(SELECTOR_RANGE_SLIDER_INPUT, this._element)[index]
      this._positionTooltip(this._tooltips[index], input)
    }
  }

  _calculateClickValue(event) {
    const clickPosition = this._getClickPosition(event)
    const value = this._config.min + (clickPosition * (this._config.max - this._config.min))
    return this._roundToStep(value, this._config.step)
  }

  _calculateMoveValue(event) {
    const trackRect = this._sliderTrack.getBoundingClientRect()
    const position = this._config.vertical ?
      this._calculateVerticalPosition(event.clientY, trackRect) :
      this._calculateHorizontalPosition(event.clientX, trackRect)

    if (typeof position === 'string') {
      return position === 'max' ? this._config.max : this._config.min
    }

    const value = this._config.min + (position * (this._config.max - this._config.min))

    return this._roundToStep(value, this._config.step)
  }

  _calculateVerticalPosition(mouseY, rect) {
    if (mouseY < rect.top) {
      return 'max'
    }

    if (mouseY > rect.bottom) {
      return 'min'
    }

    return Math.min(Math.max((rect.bottom - mouseY) / rect.height, 0), 1)
  }

  _calculateHorizontalPosition(mouseX, rect) {
    if (mouseX < rect.left) {
      return isRTL() ? 'max' : 'min'
    }

    if (mouseX > rect.right) {
      return isRTL() ? 'min' : 'max'
    }

    const relativeX = isRTL() ? rect.right - mouseX : mouseX - rect.left
    return Math.min(Math.max(relativeX / rect.width, 0), 1)
  }

  _createElement(tag, className) {
    const element = document.createElement(tag)
    element.classList.add(className)
    return element
  }

  _getClickPosition(event) {
    const { offsetX, offsetY } = event
    const { offsetWidth, offsetHeight } = this._sliderTrack

    if (this._config.vertical) {
      return 1 - (offsetY / offsetHeight)
    }

    return isRTL() ? 1 - (offsetX / offsetWidth) : offsetX / offsetWidth
  }

  _getNearestValueIndex(value) {
    const values = this._currentValue
    const valuesLength = values.length

    if (value < values[0]) {
      return 0
    }

    if (value > values[valuesLength - 1]) {
      return valuesLength - 1
    }

    const distances = values.map(v => Math.abs(v - value))
    const min = Math.min(...distances)
    const firstIndex = distances.indexOf(min)

    return value < values[firstIndex] ? firstIndex : distances.lastIndexOf(min)
  }

  _updateGradient() {
    if (!this._config.track) {
      return
    }

    const [min, max] = [Math.min(...this._currentValue), Math.max(...this._currentValue)]
    const from = ((min - this._config.min) / (this._config.max - this._config.min)) * 100
    const to = ((max - this._config.min) / (this._config.max - this._config.min)) * 100
    const direction = this._config.vertical ? 'to top' : (isRTL() ? 'to left' : 'to right')

    if (this._currentValue.length === 1) {
      this._sliderTrack.style.backgroundImage = `linear-gradient(
        ${direction},
        var(--cui-range-slider-track-in-range-bg) 0%,
        var(--cui-range-slider-track-in-range-bg) ${to}%,
        transparent ${to}%,
        transparent 100%
      )`
      return
    }

    this._sliderTrack.style.backgroundImage = `linear-gradient(
      ${direction},
      transparent 0%,
      transparent ${from}%,
      var(--cui-range-slider-track-in-range-bg) ${from}%,
      var(--cui-range-slider-track-in-range-bg) ${to}%,
      transparent ${to}%,
      transparent 100%
    )`
  }

  _updateNearestValue(value) {
    const nearestIndex = this._getNearestValueIndex(value)
    this._updateValue(value, nearestIndex)
  }

  _updateValue(value, index) {
    const _value = this._validateValue(value, index)
    this._currentValue[index] = _value
    this._updateInput(index, _value)
    this._updateGradient()
    this._updateTooltip(index, _value)
    EventHandler.trigger(this._element, EVENT_CHANGE, { value: this._currentValue })
  }

  _updateInput(index, value) {
    const input = this._inputs[index]

    input.value = value
    input.setAttribute('aria-valuenow', value)
    setTimeout(() => {
      input.focus()
    })
  }

  _validateValue(value, index) {
    const { distance } = this._config
    const { length } = this._currentValue

    if (length === 1) {
      return value
    }

    const prevValue = index > 0 ? this._currentValue[index - 1] : undefined
    const nextValue = index < length - 1 ? this._currentValue[index + 1] : undefined

    if (index === 0 && nextValue !== undefined) {
      return Math.min(value, nextValue - distance)
    }

    if (index === length - 1 && prevValue !== undefined) {
      return Math.max(value, prevValue + distance)
    }

    if (prevValue !== undefined && nextValue !== undefined) {
      const minVal = prevValue + distance
      const maxVal = nextValue - distance
      return Math.min(Math.max(value, minVal), maxVal)
    }

    return value
  }

  _roundToStep(number, step) {
    const _step = step === 0 ? 1 : step
    return Math.round(number / _step) * _step
  }

  _configAfterMerge(config) {
    if (typeof config.labels === 'string') {
      config.labels = config.labels.split(/,\s*/)
    }

    if (typeof config.name === 'string') {
      config.name = config.name.split(/,\s*/)
    }

    if (typeof config.value === 'number') {
      config.value = [config.value]
    }

    if (typeof config.value === 'string') {
      config.value = config.value.split(/,\s*/).map(Number)
    }

    return config
  }

  _getConfig(config) {
    const dataAttributes = Manipulator.getDataAttributes(this._element)

    config = {
      ...dataAttributes,
      ...(typeof config === 'object' && config ? config : {})
    }
    config = this._mergeConfigObj(config)
    config = this._configAfterMerge(config)
    this._typeCheckConfig(config)
    return config
  }

  // Static
  static rangeSliderInterface(element, config) {
    const data = RangeSlider.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(config) {
    return this.each(function () {
      const data = RangeSlider.getOrCreateInstance(this)

      if (typeof config !== 'string') {
        return
      }

      if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config](this)
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  const ratings = SelectorEngine.find(SELECTOR_DATA_TOGGLE)
  for (let i = 0, len = ratings.length; i < len; i++) {
    RangeSlider.rangeSliderInterface(ratings[i])
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(RangeSlider)

export default RangeSlider

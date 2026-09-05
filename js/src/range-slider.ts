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
import type { ComponentConfig } from './util/config.js'
import { defineJQueryPlugin, isRTL } from './util/index.js'
import { DefaultAllowlist, type SanitizerAllowList, sanitizeHtml } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'range-slider'
const DATA_KEY = 'coreui.range-slider'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn'])

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`
const EVENT_MOUSEDOWN = `mousedown${EVENT_KEY}`
const EVENT_MOUSEMOVE = `mousemove${EVENT_KEY}`
const EVENT_MOUSEUP = `mouseup${EVENT_KEY}`

const CLASS_NAME_CLICKABLE = 'clickable'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_RANGE_SLIDER = 'range-slider'
const CLASS_NAME_RANGE_SLIDER_INPUT = 'range-slider-input'
const CLASS_NAME_RANGE_SLIDER_INPUTS_CONTAINER = 'range-slider-inputs-container'
const CLASS_NAME_RANGE_SLIDER_LABEL = 'range-slider-label'
const CLASS_NAME_RANGE_SLIDER_LABELS_CONTAINER = 'range-slider-labels-container'
const CLASS_NAME_RANGE_SLIDER_TOOLTIP = 'range-slider-tooltip'
const CLASS_NAME_TOOLTIP = 'tooltip'
const CLASS_NAME_TOOLTIP_ARROW = 'tooltip-arrow'
const CLASS_NAME_TOOLTIP_INNER = 'tooltip-inner'
const CLASS_NAME_TOOLTIP_START = 'bs-tooltip-start'
const CLASS_NAME_TOOLTIP_TOP = 'bs-tooltip-top'
const CLASS_NAME_RANGE_SLIDER_TRACK = 'range-slider-track'
const CLASS_NAME_RANGE_SLIDER_VERTICAL = 'range-slider-vertical'
const CLASS_NAME_SHOW = 'show'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="range-slider"]'
const SELECTOR_RANGE_SLIDER_INPUT = '.range-slider-input'
const SELECTOR_RANGE_SLIDER_INPUTS_CONTAINER = '.range-slider-inputs-container'
const SELECTOR_RANGE_SLIDER_LABEL = '.range-slider-label'

type RangeSliderLabel = string | { class?: string | string[], label?: string, style?: Record<string, string>, value?: number }

type RangeSliderConfig = {
  allowList: SanitizerAllowList
  ariaLabels: string[] | null
  clickableLabels: boolean
  disabled: boolean
  distance: number
  labels: RangeSliderLabel[] | boolean | string
  list: string | null
  max: number
  min: number
  name: string[] | string | null
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  step: number | string
  tooltipClass: string
  tooltips: boolean | 'always'
  tooltipsFormat: ((value: number | string) => string) | null
  track: boolean | string
  value: number[] | number
  vertical: boolean
}

const Default: RangeSliderConfig = {
  allowList: DefaultAllowlist,
  ariaLabels: null,
  clickableLabels: true,
  disabled: false,
  distance: 0,
  labels: false,
  list: null,
  max: 100,
  min: 0,
  name: null,
  sanitize: true,
  sanitizeFn: null,
  step: 1,
  tooltipClass: '',
  tooltips: true,
  tooltipsFormat: null,
  track: 'fill',
  value: 0,
  vertical: false
}

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaLabels: '(array|null)',
  clickableLabels: 'boolean',
  disabled: 'boolean',
  distance: 'number',
  labels: '(array|boolean|string)',
  list: '(string|null)',
  max: 'number',
  min: 'number',
  name: '(array|string|null)',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  step: '(number|string)',
  tooltipClass: 'string',
  tooltips: '(boolean|string)',
  tooltipsFormat: '(function|null)',
  track: '(boolean|string)',
  value: '(array|number)',
  vertical: 'boolean'
}

/**
 * Class definition
 */

class RangeSlider extends BaseComponent {
  protected declare _currentValue: number[]
  protected declare _dragIndex: number
  protected declare _inputs: HTMLInputElement[]
  protected declare _isDragging: boolean
  protected declare _onDocumentMouseMove: (event: any) => void
  protected declare _onDocumentMouseUp: () => void
  protected declare _sliderTrack: any
  protected declare _tooltips: HTMLElement[]

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element)

    this._config = this._getConfig(config)

    this._currentValue = this._config.value
    this._dragIndex = 0
    this._inputs = []
    this._isDragging = false
    this._sliderTrack = null
    this._tooltips = []

    this._onDocumentMouseMove = event => {
      if (!this._isDragging) {
        return
      }

      this._updateValue(this._calculateMoveValue(event), this._dragIndex)
    }

    this._onDocumentMouseUp = () => {
      this._isDragging = false
    }

    this._initializeRangeSlider()
  }

  // Getters
  static override get Default(): typeof Default {
    return Default
  }

  static override get DefaultType(): typeof DefaultType {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  update(config: any): void {
    this._config = this._getConfig(config)
    this._currentValue = this._config.value
    this._element.innerHTML = ''
    this._initializeRangeSlider()
  }

  override dispose(): void {
    EventHandler.off(document.documentElement, EVENT_MOUSEMOVE, this._onDocumentMouseMove)
    EventHandler.off(document.documentElement, EVENT_MOUSEUP, this._onDocumentMouseUp)

    super.dispose()
  }

  // Private
  _addEventListeners(): void {
    if (this._config.disabled) {
      return
    }

    EventHandler.on(this._element, EVENT_INPUT, SELECTOR_RANGE_SLIDER_INPUT, (event: any) => {
      const { target } = event
      this._isDragging = false
      const children = SelectorEngine.children(target.parentElement, SELECTOR_RANGE_SLIDER_INPUT)
      const index = Array.from(children).indexOf(target)
      this._updateValue(target.value, index)
      EventHandler.trigger(this._element, EVENT_INPUT, { value: this._currentValue })
    })

    EventHandler.on(this._element, EVENT_CHANGE, SELECTOR_RANGE_SLIDER_INPUT, () => {
      EventHandler.trigger(this._element, EVENT_CHANGE, { value: this._currentValue })
    })

    EventHandler.on(this._element, EVENT_MOUSEDOWN, SELECTOR_RANGE_SLIDER_LABEL, (event: any) => {
      if (!this._config.clickableLabels || event.button !== 0) {
        return
      }

      const value = Manipulator.getDataAttribute(event.target, 'value')
      this._updateNearestValue(value as number)
    })

    EventHandler.on(this._element, EVENT_MOUSEDOWN, SELECTOR_RANGE_SLIDER_INPUTS_CONTAINER, (event: any) => {
      if (event.button !== 0) {
        return
      }

      if (!(event.target instanceof HTMLInputElement) && !event.target.className.includes(CLASS_NAME_RANGE_SLIDER_TRACK)) {
        return
      }

      this._isDragging = true
      const clickValue = this._calculateClickValue(event)
      this._dragIndex = this._getNearestValueIndex(clickValue)
      this._updateNearestValue(clickValue)

      EventHandler.trigger(this._element, EVENT_CHANGE, { value: this._currentValue })
      EventHandler.trigger(this._element, EVENT_INPUT, { value: this._currentValue })
    })

    EventHandler.on(document.documentElement, EVENT_MOUSEUP, this._onDocumentMouseUp)
    EventHandler.on(document.documentElement, EVENT_MOUSEMOVE, this._onDocumentMouseMove)
  }

  _initializeRangeSlider(): void {
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
    this._createTooltips()
    this._updateGradient()
    this._addEventListeners()
  }

  _createSliderTrack(): HTMLElement {
    const sliderTrackElement = this._createElement('div', CLASS_NAME_RANGE_SLIDER_TRACK)

    return sliderTrackElement
  }

  _createInputs(): void {
    const container = this._createElement('div', CLASS_NAME_RANGE_SLIDER_INPUTS_CONTAINER)

    for (const [index, value] of this._currentValue.entries()) {
      const inputElement = this._createInput(index, value)
      container.append(inputElement)

      this._inputs[index] = inputElement
    }

    container.append(this._sliderTrack)
    this._element.append(container)
  }

  _createInput(index: number, value: number): HTMLInputElement {
    const inputElement = this._createElement('input', CLASS_NAME_RANGE_SLIDER_INPUT)
    inputElement.type = 'range'
    inputElement.min = this._config.min
    inputElement.max = this._config.max
    inputElement.step = this._config.step
    inputElement.value = value
    if (this._config.name) {
      inputElement.name = Array.isArray(this._config.name) ?
        `${this._config.name[index]}` :
        `${this._config.name}-${index}`
    }

    inputElement.disabled = this._config.disabled

    // Accessibility attributes
    inputElement.setAttribute('role', 'slider')
    inputElement.setAttribute('aria-valuemin', this._config.min)
    inputElement.setAttribute('aria-valuemax', this._config.max)
    inputElement.setAttribute('aria-valuenow', value)
    inputElement.setAttribute('aria-orientation', this._config.vertical ? 'vertical' : 'horizontal')

    if (this._currentValue.length > 1) {
      inputElement.setAttribute('aria-label', this._getAriaLabel(index))
    }

    const valueText = this._getValueText(value)
    if (valueText !== null) {
      inputElement.setAttribute('aria-valuetext', valueText)
    }

    return inputElement
  }

  _getAriaLabel(index: number): string {
    if (Array.isArray(this._config.ariaLabels) && this._config.ariaLabels[index]) {
      return this._config.ariaLabels[index]
    }

    if (this._currentValue.length === 2) {
      return index === 0 ? 'Minimum value' : 'Maximum value'
    }

    return `Value ${index + 1}`
  }

  _getValueText(value: number): string | null {
    return typeof this._config.tooltipsFormat === 'function' ? `${this._config.tooltipsFormat(value)}` : null
  }

  _createLabels(): void {
    const points = this._labelPoints()

    if (points.length === 0) {
      return
    }

    const { clickableLabels, disabled, vertical } = this._config
    const labelsContainer = this._createElement('div', CLASS_NAME_RANGE_SLIDER_LABELS_CONTAINER)

    // Columns (rows when vertical) are the gaps between 0, each point and 1, so every label lands on a grid line
    const stops = [0, ...points.map(point => point.ratio), 1]
    const tracks = stops.slice(1).map((stop, index) => `${stop - stops[index]}fr`)
    if (vertical) {
      labelsContainer.style.gridTemplateRows = tracks.toReversed().join(' ')
    } else {
      labelsContainer.style.gridTemplateColumns = tracks.join(' ')
    }

    for (const [index, point] of points.entries()) {
      const labelElement = this._createElement('div', CLASS_NAME_RANGE_SLIDER_LABEL)

      if (clickableLabels && !disabled) {
        labelElement.classList.add(CLASS_NAME_CLICKABLE)
      }

      if (point.class) {
        labelElement.classList.add(...(Array.isArray(point.class) ? point.class : [point.class]))
      }

      if (point.style && typeof point.style === 'object') {
        Object.assign(labelElement.style, point.style)
      }

      Manipulator.setDataAttribute(labelElement, 'value', point.value)
      labelElement.textContent = point.label

      if (vertical) {
        labelElement.style.gridRowStart = `${points.length - index + 1}`
      } else {
        labelElement.style.gridColumnStart = `${index + 2}`
      }

      labelsContainer.append(labelElement)
    }

    this._element.append(labelsContainer)
  }

  _labelPoints(): Array<{ class?: string | string[], label: string, ratio: number, style?: Record<string, string>, value: number }> {
    const { labels, list, min, max } = this._config
    const span = max - min || 1
    const ratio = (value: number) => Math.min(Math.max((value - min) / span, 0), 1)
    const points = []

    if (Array.isArray(labels) && labels.length > 0) {
      for (const [index, label] of labels.entries()) {
        const value = typeof label === 'object' && label.value !== undefined ?
          label.value :
          min + (labels.length === 1 ? 0 : (index / (labels.length - 1)) * span)

        points.push({
          class: typeof label === 'object' ? label.class : undefined,
          label: typeof label === 'object' ? (label.label ?? '') : label,
          ratio: ratio(value),
          style: typeof label === 'object' ? label.style : undefined,
          value
        })
      }
    }

    const datalist = list ? document.getElementById(list) : null
    if (datalist) {
      for (const option of SelectorEngine.find<HTMLOptionElement>('option', datalist)) {
        const value = Number.parseFloat(option.value)

        if (!Number.isNaN(value)) {
          points.push({ label: option.label, ratio: ratio(value), value })
        }
      }
    }

    return points.toSorted((a, b) => a.ratio - b.ratio)
  }

  _createTooltips(): void {
    if (!this._config.tooltips) {
      return
    }

    const inputs = SelectorEngine.find(SELECTOR_RANGE_SLIDER_INPUT, this._element as ParentNode) as HTMLInputElement[]

    for (const input of inputs) {
      // `<output>` is a live region; the input already announces the value.
      const tooltipElement = this._createElement('output', CLASS_NAME_RANGE_SLIDER_TOOLTIP)
      tooltipElement.classList.add(CLASS_NAME_TOOLTIP, this._config.vertical ? CLASS_NAME_TOOLTIP_START : CLASS_NAME_TOOLTIP_TOP)
      tooltipElement.classList.toggle(CLASS_NAME_SHOW, this._config.tooltips === 'always')
      if (this._config.tooltipClass) {
        tooltipElement.classList.add(...this._config.tooltipClass.split(' ').filter(Boolean))
      }

      tooltipElement.setAttribute('aria-hidden', 'true')
      const tooltipArrowElement = this._createElement('span', CLASS_NAME_TOOLTIP_ARROW)
      const tooltipInnerElement = this._createElement('span', CLASS_NAME_TOOLTIP_INNER)

      tooltipInnerElement.innerHTML = this._config.tooltipsFormat ?
        (this._config.sanitize ? sanitizeHtml(this._config.tooltipsFormat(input.value), this._config.allowList, this._config.sanitizeFn) : this._config.tooltipsFormat(input.value)) :
        input.value
      tooltipElement.append(tooltipArrowElement, tooltipInnerElement)

      input.parentNode!.insertBefore(tooltipElement, input.nextSibling)
      this._positionTooltip(tooltipElement, input)
      this._tooltips.push(tooltipElement)
    }
  }

  _positionTooltip(tooltip: HTMLElement, input: HTMLInputElement): void {
    const percent = (Number(input.value) - this._config.min) / (this._config.max - this._config.min)

    tooltip.style.setProperty('--cui-range-slider-tooltip-position', `${percent}`)
  }

  _updateTooltip(index: number, value: number): void {
    if (!this._config.tooltips) {
      return
    }

    if (this._tooltips[index]) {
      this._tooltips[index].children[1].innerHTML = this._config.tooltipsFormat ?
        (this._config.sanitize ? sanitizeHtml(this._config.tooltipsFormat(value), this._config.allowList, this._config.sanitizeFn) : this._config.tooltipsFormat(value)) :
        value
      const input = SelectorEngine.find(SELECTOR_RANGE_SLIDER_INPUT, this._element as ParentNode)[index] as HTMLInputElement
      this._positionTooltip(this._tooltips[index], input)
    }
  }

  _calculateClickValue(event: any): number {
    const clickPosition = this._getClickPosition(event)
    const value = this._config.min + (clickPosition * (this._config.max - this._config.min))
    return this._roundToStep(value, this._config.step)
  }

  _calculateMoveValue(event: any): number {
    const trackRect = this._sliderTrack.getBoundingClientRect()
    const position = this._config.vertical ?
      this._calculateVerticalPosition(event.clientY, trackRect) :
      this._calculateHorizontalPosition(event.clientX, trackRect)

    if (typeof position === 'string') {
      return this._roundToStep(position === 'max' ? this._config.max : this._config.min, this._config.step)
    }

    const value = this._config.min + (position * (this._config.max - this._config.min))

    return this._roundToStep(value, this._config.step)
  }

  _calculateVerticalPosition(mouseY: number, rect: DOMRect): number | string {
    if (mouseY < rect.top) {
      return 'max'
    }

    if (mouseY > rect.bottom) {
      return 'min'
    }

    return Math.min(Math.max((rect.bottom - mouseY) / rect.height, 0), 1)
  }

  _calculateHorizontalPosition(mouseX: number, rect: DOMRect): number | string {
    if (mouseX < rect.left) {
      return isRTL() ? 'max' : 'min'
    }

    if (mouseX > rect.right) {
      return isRTL() ? 'min' : 'max'
    }

    const relativeX = isRTL() ? rect.right - mouseX : mouseX - rect.left
    return Math.min(Math.max(relativeX / rect.width, 0), 1)
  }

  _createElement(tag: string, className: string): any {
    const element = document.createElement(tag)
    element.classList.add(className)
    return element
  }

  _getClickPosition(event: any): number {
    const { offsetX, offsetY } = event
    const { offsetWidth, offsetHeight } = this._sliderTrack

    if (this._config.vertical) {
      return 1 - (offsetY / offsetHeight)
    }

    return isRTL() ? 1 - (offsetX / offsetWidth) : offsetX / offsetWidth
  }

  _getNearestValueIndex(value: number): number {
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

  _updateGradient(): void {
    if (!this._config.track) {
      return
    }

    const [min, max] = [Math.min(...this._currentValue), Math.max(...this._currentValue)]
    const span = this._config.max - this._config.min
    const ratio = (value: number): string => `${(value - this._config.min) / span}`

    if (this._currentValue.length === 1) {
      this._sliderTrack.style.setProperty('--cui-range-slider-track-from-edge', '0')
    } else {
      this._sliderTrack.style.setProperty('--cui-range-slider-track-from', ratio(min))
    }

    this._sliderTrack.style.setProperty('--cui-range-slider-track-to', ratio(max))
  }

  _updateNearestValue(value: number): void {
    const nearestIndex = this._getNearestValueIndex(value)
    this._updateValue(value, nearestIndex)
  }

  _updateValue(value: number, index: number): void {
    const _value = this._validateValue(value, index)
    this._currentValue[index] = _value
    this._updateInput(index, _value)
    this._updateGradient()
    this._updateTooltip(index, _value)
  }

  _updateInput(index: number, value: number): void {
    const input = this._inputs[index]

    input.value = value as any
    input.setAttribute('aria-valuenow', value as any)

    const valueText = this._getValueText(value)
    if (valueText !== null) {
      input.setAttribute('aria-valuetext', valueText)
    }

    setTimeout(() => {
      input.focus()
    })
  }

  _validateValue(value: number, index: number): number {
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

  _getDecimals(number: number): number {
    const [mantissa, exponent = '0'] = `${number}`.split('e')

    return Math.max(0, (mantissa.split('.')[1] || '').length - Number(exponent))
  }

  _roundToStep(number: number, step: number | string): number {
    const { max, min } = this._config
    const value = Math.min(Math.max(number, min), max)
    const _step = Number(step)

    if (Number.isNaN(_step)) {
      return value
    }

    const size = _step === 0 ? 1 : _step
    const decimals = Math.max(this._getDecimals(size), this._getDecimals(min))
    const rounded = Number((min + (Math.round((value - min) / size) * size)).toFixed(decimals))

    return rounded > max ? Math.max(min, Number((rounded - size).toFixed(decimals))) : rounded
  }

  override _configAfterMerge(config: any): any {
    if (typeof config.labels === 'string') {
      config.labels = config.labels.split(/,\s*/)
    }

    if (typeof config.name === 'string' && config.name.includes(',')) {
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

  override _getConfig(config: any): any {
    const dataAttributes = Manipulator.getDataAttributes(this._element)

    for (const dataAttribute of Object.keys(dataAttributes)) {
      if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
        delete dataAttributes[dataAttribute]
      }
    }

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
  static rangeSliderInterface(element: string | Element | null, config?: any): void {
    const data: any = RangeSlider.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(this: any, config: any): any {
    return this.each(function (this: HTMLElement) {
      const data: any = RangeSlider.getOrCreateInstance(this)

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

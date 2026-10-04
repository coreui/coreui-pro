/**
 * --------------------------------------------------------------------------
 * CoreUI PRO range-slider.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import {
  defineJQueryPlugin, getUID, isRTL, jQueryDispatch
} from './util/index.js'
import {
  constrainInput,
  createTicks,
  createTooltip,
  getNearestInput,
  getRatio,
  getRatioAt,
  getStackOrder,
  getStep,
  getThumbSize,
  getTickLabel,
  getTickPoints,
  getValueText,
  setInputValue,
  type RangeTick,
  type RangeTickPoint
} from './util/range.js'
import { DefaultAllowlist, sanitizeByConfig, type SanitizerAllowList } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'range-slider'
const DATA_KEY = 'coreui.range-slider'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_POINTERCANCEL = `pointercancel${EVENT_KEY}`
const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY}`
const EVENT_POINTERMOVE = `pointermove${EVENT_KEY}`
const EVENT_POINTERUP = `pointerup${EVENT_KEY}`
const EVENT_RESET = `reset${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const HOST_ATTRIBUTES = ['aria-describedby', 'aria-label', 'aria-labelledby']

const CLASS_NAME_FORM_RANGE = 'form-range'
const CLASS_NAME_FORM_RANGE_INPUT = 'form-range-input'
const CLASS_NAME_FORM_RANGE_VERTICAL = 'form-range-vertical'
const CLASS_NAME_TICKS_CLICKABLE = 'form-range-ticks-clickable'
const CLASS_NAME_TOOLTIP_END = 'bs-tooltip-end'
const CLASS_NAME_TOOLTIP_START = 'bs-tooltip-start'
const CLASS_NAME_TOOLTIP_TOP = 'bs-tooltip-top'

const PROPERTY_FILL = '--cui-range-fill'
const PROPERTY_FILL_START = '--cui-range-fill-start'

const SELECTOR_DATA_RANGE_SLIDER = '[data-coreui-range-slider]'
const SELECTOR_INPUT = '.form-range-input'
const SELECTOR_TICK = '.form-range-tick'

type RangeSliderConfig = {
  allowList: SanitizerAllowList
  ariaLabel: string[] | string | ((index: number, total: number) => string) | null
  clickableTicks: boolean
  disabled: boolean
  distance: number
  list: string | null
  max: number
  min: number
  name: string[] | string | null
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  step: number | string
  ticks: RangeTick[] | boolean | string
  tooltipClass: string
  tooltips: boolean | 'always'
  tooltipsFormat: ((value: number) => string) | null
  track: boolean | string
  value: number[] | number | string
  vertical: boolean
}

type RangeSliderPress = {
  input: HTMLInputElement
  pointerId: number
  rect: DOMRect
  start: string
  thumb: number
}

const Default: RangeSliderConfig = {
  allowList: DefaultAllowlist,
  ariaLabel: null,
  clickableTicks: true,
  disabled: false,
  distance: 0,
  list: null,
  max: 100,
  min: 0,
  name: null,
  sanitize: true,
  sanitizeFn: null,
  step: 1,
  ticks: false,
  tooltipClass: '',
  tooltips: true,
  tooltipsFormat: null,
  track: 'fill',
  value: 0,
  vertical: false
}

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaLabel: '(array|function|string|null)',
  clickableTicks: 'boolean',
  disabled: 'boolean',
  distance: 'number',
  list: '(string|null)',
  max: 'number',
  min: 'number',
  name: '(array|string|null)',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  step: '(number|string)',
  ticks: '(array|boolean|string)',
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
  protected declare _config: RangeSliderConfig
  protected declare _form: HTMLFormElement | null
  protected declare _hostAttributes: Map<string, string>
  protected declare _inputs: HTMLInputElement[]
  protected declare _press: RangeSliderPress | null
  protected declare _resetTimeout: ReturnType<typeof setTimeout> | null
  protected declare _tickPoints: RangeTickPoint[]
  protected declare _ticks: HTMLElement | null
  protected declare _tooltips: HTMLElement[]
  protected declare _wrapper: HTMLElement | null
  protected declare _onChange: (event: Event) => void
  protected declare _onInput: (event: Event) => void
  protected declare _onKeydown: (event: Event) => void
  protected declare _onPointerDown: (event: Event) => void
  protected declare _onPointerMove: (event: Event) => void
  protected declare _onPointerUp: (event: Event) => void
  protected declare _onReset: () => void

  constructor(element?: string | Element | null, config?: Partial<RangeSliderConfig> | null) {
    super(element, config)

    if (!this._element) {
      return
    }

    this._form = null
    this._inputs = []
    this._press = null
    this._resetTimeout = null
    this._tickPoints = []
    this._ticks = null
    this._tooltips = []
    this._wrapper = null
    this._hostAttributes = new Map()

    this._onInput = event => {
      const input = event.target as HTMLInputElement

      if (this._inputs.includes(input)) {
        this._constrain(input)
        this._update()
        EventHandler.trigger(this._element, EVENT_INPUT, { value: this._values() })
      }
    }

    this._onChange = event => {
      if (this._inputs.includes(event.target as HTMLInputElement)) {
        this._update()
        EventHandler.trigger(this._element, EVENT_CHANGE, { value: this._values() })
      }
    }

    this._onKeydown = event => this._keydown(event as KeyboardEvent)
    this._onPointerDown = event => this._pointerDown(event as PointerEvent)
    this._onPointerMove = event => this._pointerMove(event as PointerEvent)
    this._onPointerUp = event => this._pointerUp(event as PointerEvent)
    this._onReset = () => {
      clearTimeout(this._resetTimeout!)
      this._resetTimeout = setTimeout(() => this._update())
    }

    this._build()
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
  setConfig(config: Partial<RangeSliderConfig>): void {
    const current = config && 'value' in config ? null : this._values()
    this._config = this._getConfig({ ...this._config, ...config }) as RangeSliderConfig
    this._teardown()
    this._build(current)
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    this._teardown()

    for (const [name, value] of this._hostAttributes) {
      if (!this._element.hasAttribute(name)) {
        this._element.setAttribute(name, value)
      }
    }

    super.dispose()
  }

  // Private
  _build(current: number[] | null = null): void {
    const { tooltipClass, tooltips, vertical } = this._config

    this._takeHostAttributes()
    this._wrapper = document.createElement('div')
    this._wrapper.className = CLASS_NAME_FORM_RANGE
    this._wrapper.classList.toggle(CLASS_NAME_FORM_RANGE_VERTICAL, vertical)
    this._inputs = (this._config.value as number[]).map((value, index) => this._createInput(index, value, current?.[index]))
    this._wrapper.append(...this._inputs)
    this._element.append(this._wrapper)

    if (tooltips) {
      const placement = vertical ?
        (isRTL(this._wrapper) ? CLASS_NAME_TOOLTIP_END : CLASS_NAME_TOOLTIP_START) :
        CLASS_NAME_TOOLTIP_TOP

      for (const input of this._inputs) {
        const tooltip = createTooltip(placement, tooltipClass, tooltips === 'always')
        input.after(tooltip)
        this._tooltips.push(tooltip)
      }
    }

    this._tickPoints = this._inputs.length > 0 ? getTickPoints(this._inputs[0], this._config.ticks, this._config.list) : []

    if (this._tickPoints.length > 0) {
      this._ticks = createTicks(this._tickPoints, vertical)
      this._ticks.classList.toggle(CLASS_NAME_TICKS_CLICKABLE, this._config.clickableTicks && this._inputs.some(input => !input.matches(':disabled')))
      this._wrapper.append(this._ticks)
    }

    this._form = this._inputs[0]?.form ?? null
    this._addEventListeners()
    this._update()
  }

  _teardown(): void {
    clearTimeout(this._resetTimeout!)
    this._releasePress()

    if (this._wrapper) {
      EventHandler.off(this._wrapper, EVENT_INPUT, SELECTOR_INPUT, this._onInput)
      EventHandler.off(this._wrapper, EVENT_CHANGE, SELECTOR_INPUT, this._onChange)
      EventHandler.off(this._wrapper, EVENT_KEYDOWN, SELECTOR_INPUT, this._onKeydown)
      EventHandler.off(this._wrapper, EVENT_POINTERDOWN, this._onPointerDown)
    }

    if (this._form) {
      EventHandler.off(this._form, EVENT_RESET, this._onReset)
    }

    this._wrapper?.remove()
    this._form = null
    this._inputs = []
    this._tickPoints = []
    this._ticks = null
    this._tooltips = []
    this._wrapper = null
  }

  _addEventListeners(): void {
    const wrapper = this._wrapper!

    // Delegated handlers run in the capture phase, so the order is kept before listeners on the inputs see the value
    EventHandler.on(wrapper, EVENT_INPUT, SELECTOR_INPUT, this._onInput)
    EventHandler.on(wrapper, EVENT_CHANGE, SELECTOR_INPUT, this._onChange)
    EventHandler.on(wrapper, EVENT_KEYDOWN, SELECTOR_INPUT, this._onKeydown)
    EventHandler.on(wrapper, EVENT_POINTERDOWN, this._onPointerDown)

    if (this._form) {
      EventHandler.on(this._form, EVENT_RESET, this._onReset)
    }
  }

  _createInput(index: number, value: number, current?: number): HTMLInputElement {
    const { disabled, max, min, step, vertical } = this._config
    const input = document.createElement('input')
    input.type = 'range'
    input.className = CLASS_NAME_FORM_RANGE_INPUT
    input.min = `${min}`
    input.max = `${max}`
    input.step = `${step}`
    input.defaultValue = `${value}`
    input.disabled = disabled

    if (current !== undefined) {
      input.value = `${current}`
    }

    const name = Array.isArray(this._config.name) ?
      this._config.name[index] :
      this._config.name && `${this._config.name}-${index}`

    if (name !== undefined && name !== null && name !== '') {
      input.name = String(name)
    }

    if (vertical) {
      input.setAttribute('aria-orientation', 'vertical')
    }

    this._nameInput(input, index)

    return input
  }

  _takeHostAttributes(): void {
    if (this._element.hasAttribute('role')) {
      return
    }

    for (const name of HOST_ATTRIBUTES) {
      const value = this._element.getAttribute(name)

      if (value !== null) {
        this._hostAttributes.set(name, value)
        this._element.removeAttribute(name)
      }
    }
  }

  _nameInput(input: HTMLInputElement, index: number): void {
    const handleLabel = this._ariaLabel(index)
    const describedBy = this._hostAttributes.get('aria-describedby')
    const label = this._hostAttributes.get('aria-label')
    const labelledBy = this._hostAttributes.get('aria-labelledby')

    if (describedBy) {
      input.setAttribute('aria-describedby', describedBy)
    }

    if (labelledBy && handleLabel) {
      input.id = getUID(`${NAME}-handle-`)
      input.setAttribute('aria-labelledby', `${labelledBy} ${input.id}`)
      input.setAttribute('aria-label', handleLabel)
      return
    }

    const name = [label, handleLabel].filter(Boolean).join(' ')

    if (name) {
      input.setAttribute('aria-label', name)
    }

    if (labelledBy) {
      input.setAttribute('aria-labelledby', labelledBy)
    }
  }

  _ariaLabel(index: number): string | null {
    const total = (this._config.value as number[]).length
    const { ariaLabel } = this._config
    const given = typeof ariaLabel === 'function' ? ariaLabel(index, total) : (ariaLabel as string[] | null)?.[index]

    if (given) {
      return given
    }

    if (total === 1) {
      return null
    }

    if (total === 2) {
      return index === 0 ? 'Minimum value' : 'Maximum value'
    }

    return `Value ${index + 1}`
  }

  _values(): number[] {
    return this._inputs.map(input => Number(input.value))
  }

  _update(): void {
    const ratios = this._inputs.map(input => getRatio(input))

    if (this._config.track && this._inputs.length > 0) {
      if (this._inputs.length > 1) {
        this._wrapper!.style.setProperty(PROPERTY_FILL_START, `${Math.min(...ratios)}`)
      }

      this._wrapper!.style.setProperty(PROPERTY_FILL, `${Math.max(...ratios)}`)
    }

    for (const [index, input] of this._inputs.entries()) {
      const value = Number.parseFloat(input.value)
      const tooltip = this._tooltips[index]

      const html = sanitizeByConfig(this._format(value), this._config)

      if (tooltip) {
        tooltip.style.setProperty(PROPERTY_FILL, `${ratios[index]}`)
        tooltip.lastElementChild!.innerHTML = html
      }

      const label = getTickLabel(this._tickPoints, value, getStep(input))
      const text = getValueText(value, label, typeof this._config.tooltipsFormat === 'function' ? html : null)

      if (text === null) {
        input.removeAttribute('aria-valuetext')
      } else {
        input.setAttribute('aria-valuetext', text)
      }

      if (this._inputs.length > 1) {
        input.style.zIndex = `${getStackOrder(ratios[index], index, this._inputs.length)}`
      }
    }
  }

  _format(value: number): string {
    return typeof this._config.tooltipsFormat === 'function' ? this._config.tooltipsFormat(value) : String(value)
  }

  _constrain(input: HTMLInputElement): void {
    const index = this._inputs.indexOf(input)
    constrainInput(input, this._inputs[index - 1], this._inputs[index + 1], this._config.distance)
  }

  _setValue(input: HTMLInputElement, value: number): void {
    const before = input.value
    setInputValue(input, value)
    this._constrain(input)

    if (input.value !== before) {
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  _keydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement

    if (!this._config.vertical || !this._inputs.includes(input) || !['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      return
    }

    event.preventDefault()

    const start = input.value
    const step = getStep(input)
    this._setValue(input, Number.parseFloat(input.value) + (event.key === 'ArrowRight' ? step : -step))

    if (input.value !== start) {
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  _pointerDown(event: PointerEvent): void {
    if (event.button !== 0 || this._press || this._inputs.length === 0) {
      return
    }

    const rect = this._inputs[0].getBoundingClientRect()
    const tick = (event.target as Element).closest?.(SELECTOR_TICK)

    if (tick && this._ticks?.contains(tick)) {
      if (this._ticks.classList.contains(CLASS_NAME_TICKS_CLICKABLE)) {
        const value = Number(tick.getAttribute('data-coreui-value'))
        const { max, min } = this._config
        this._startPress(event, rect, (value - min) / ((max - min) || 1), value)
      }

      return
    }

    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom

    if (event.target !== this._wrapper || this._inputs.length < 2 || !inside) {
      return
    }

    this._startPress(event, rect)
  }

  _startPress(event: PointerEvent, rect: DOMRect, ratio?: number, value?: number): void {
    const thumb = getThumbSize(this._wrapper!)
    const at = ratio ?? getRatioAt(event, rect, thumb, this._config.vertical, isRTL(this._wrapper!))
    const input = getNearestInput(this._inputs, at)

    if (!input) {
      return
    }

    event.preventDefault()
    this._press = {
      input, pointerId: event.pointerId, rect, start: input.value, thumb
    }
    EventHandler.on(document, EVENT_POINTERMOVE, this._onPointerMove)
    EventHandler.on(document, EVENT_POINTERUP, this._onPointerUp)
    EventHandler.on(document, EVENT_POINTERCANCEL, this._onPointerUp)
    input.focus({ preventScroll: true })
    this._setValue(input, value ?? this._config.min + (at * (this._config.max - this._config.min)))
  }

  _pointerMove(event: PointerEvent): void {
    if (!this._press || event.pointerId !== this._press.pointerId) {
      return
    }

    const { input, rect, thumb } = this._press
    const ratio = getRatioAt(event, rect, thumb, this._config.vertical, isRTL(this._wrapper!))
    this._setValue(input, this._config.min + (ratio * (this._config.max - this._config.min)))
  }

  _pointerUp(event: PointerEvent): void {
    if (!this._press || event.pointerId !== this._press.pointerId) {
      return
    }

    const { input, start } = this._press
    this._releasePress()

    if (input.value !== start) {
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  _releasePress(): void {
    this._press = null
    EventHandler.off(document, EVENT_POINTERMOVE, this._onPointerMove)
    EventHandler.off(document, EVENT_POINTERUP, this._onPointerUp)
    EventHandler.off(document, EVENT_POINTERCANCEL, this._onPointerUp)
  }

  override _configAfterMerge(config: any): any {
    if (config.tooltips === null) {
      config.tooltips = true
    }

    if (typeof config.ticks === 'number') {
      config.ticks = String(config.ticks)
    }

    if (typeof config.ticks === 'string') {
      config.ticks = config.ticks.split(/,\s*/)
    }

    if (typeof config.ariaLabel === 'string') {
      config.ariaLabel = config.ariaLabel.split(/,\s*/)
    }

    if (typeof config.name === 'string' && config.name.includes(',')) {
      config.name = config.name.split(/,\s*/)
    }

    if (typeof config.value === 'number') {
      config.value = [config.value]
    }

    if (typeof config.value === 'string') {
      config.value = config.value.split(/,\s*/).map(Number)
    } else if (Array.isArray(config.value)) {
      config.value = [...config.value]
    }

    return config
  }

  // Static
  static rangeSliderInterface(element: string | Element | null, config?: any, ...args: any[]): void {
    const data: any = RangeSlider.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config](...args)
    }
  }

  static jQueryInterface(this: any, config: any, ...args: any[]): any {
    return jQueryDispatch(this, RangeSlider, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_RANGE_SLIDER)) {
    RangeSlider.rangeSliderInterface(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(RangeSlider)

export default RangeSlider
export type { RangeSliderConfig }

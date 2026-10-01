/**
 * --------------------------------------------------------------------------
 * CoreUI range.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's range.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import type { ComponentConfig } from './util/config.js'
import { defineJQueryPlugin, isRTL, jQueryDispatch } from './util/index.js'
import { DefaultAllowlist, sanitizeByConfig, type SanitizerAllowList } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'range'
const DATA_KEY = 'coreui.range'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_CHANGED = `changed${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_POINTERCANCEL = `pointercancel${EVENT_KEY}`
const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY}`
const EVENT_POINTERMOVE = `pointermove${EVENT_KEY}`
const EVENT_POINTERUP = `pointerup${EVENT_KEY}`
const EVENT_RESET = `reset${EVENT_KEY}`
const EVENT_DOM_CONTENT_LOADED = `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_RANGE = '.form-range:has(> .form-range-input)'
const SELECTOR_INPUT = '.form-range-input'
const SELECTOR_TICK = '.form-range-tick'

const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_TICK = 'form-range-tick'
const CLASS_NAME_TICK_END = 'form-range-tick-end'
const CLASS_NAME_TICK_LABEL = 'form-range-tick-label'
const CLASS_NAME_TICK_START = 'form-range-tick-start'
const CLASS_NAME_TICKS = 'form-range-ticks'
const CLASS_NAME_TICKS_CLICKABLE = 'form-range-ticks-clickable'
const CLASS_NAME_TOOLTIP = 'form-range-tooltip'
const CLASS_NAME_TOOLTIP_END = 'bs-tooltip-end'
const CLASS_NAME_TOOLTIP_START = 'bs-tooltip-start'
const CLASS_NAME_TOOLTIP_TOP = 'bs-tooltip-top'
const CLASS_NAME_VERTICAL = 'form-range-vertical'

const PROPERTY_FILL = '--cui-range-fill'
const PROPERTY_FILL_START = '--cui-range-fill-start'
const PROPERTY_THUMB_WIDTH = '--cui-range-thumb-width'

const TOLERANCE = 1e-9

type RangeTick = number | string | { class?: string | string[], label?: string, style?: Record<string, string>, value?: number }

type RangeConfig = {
  allowList: SanitizerAllowList
  clickableTicks: boolean
  distance: number
  list: string | null
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  ticks: RangeTick[] | boolean | string
  tooltipClass: string
  tooltips: boolean | 'always' | null
  tooltipsFormat: ((value: number) => string) | null
  track: boolean | string
}

type RangeTickPoint = {
  class?: string | string[]
  label: string
  ratio: number
  style?: Record<string, string>
  value: number
}

type RangePress = {
  input: HTMLInputElement
  pointerId: number
  rect: DOMRect
  start: string
  thumb: number
}

const Default: RangeConfig = {
  allowList: DefaultAllowlist,
  clickableTicks: false,
  distance: 0,
  list: null,
  sanitize: true,
  sanitizeFn: null,
  ticks: false,
  tooltipClass: '',
  tooltips: false,
  tooltipsFormat: null,
  track: 'fill'
}

const DefaultType = {
  allowList: 'object',
  clickableTicks: 'boolean',
  distance: 'number',
  list: '(string|null)',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  ticks: '(array|boolean|string)',
  tooltipClass: 'string',
  tooltips: '(boolean|string|null)',
  tooltipsFormat: '(function|null)',
  track: '(boolean|string)'
}

/**
 * Class definition
 */

class Range extends BaseComponent {
  protected declare _config: RangeConfig
  protected declare _forms: HTMLFormElement[]
  protected declare _inputs: HTMLInputElement[]
  protected declare _press: RangePress | null
  protected declare _resetTimeout: ReturnType<typeof setTimeout> | null
  protected declare _tickLabels: Array<{ label: string, value: number }>
  protected declare _ticks: HTMLElement | null
  protected declare _tooltips: HTMLElement[]
  protected declare _valueTexts: Array<string | null>
  protected declare _valueTextsSet: boolean[]
  protected declare _onChange: (event: Event) => void
  protected declare _onInput: (event: Event) => void
  protected declare _onKeydown: (event: Event) => void
  protected declare _onPointerDown: (event: Event) => void
  protected declare _onPointerMove: (event: Event) => void
  protected declare _onPointerUp: (event: Event) => void
  protected declare _onReset: () => void

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    // BaseComponent bails (no `_element`) when the element can't be resolved
    if (!this._element) {
      return
    }

    this._inputs = SelectorEngine.children(this._element, SELECTOR_INPUT) as HTMLInputElement[]
    this._forms = [...new Set(this._inputs.map(input => input.form).filter(Boolean))] as HTMLFormElement[]
    this._press = null
    this._resetTimeout = null
    this._tickLabels = []
    this._ticks = null
    this._tooltips = []
    this._valueTexts = this._inputs.map(input => input.getAttribute('aria-valuetext'))
    this._valueTextsSet = this._inputs.map(() => false)

    this._onChange = event => {
      if (this._inputs.includes(event.target as HTMLInputElement)) {
        this._update(event.target as HTMLInputElement)
      }
    }

    this._onInput = event => {
      const input = event.target as HTMLInputElement

      if (this._inputs.includes(input)) {
        this._constrain(input)
        this._update(input)
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

    if (this._inputs.length === 0) {
      return
    }

    if (this._config.tooltips) {
      this._createTooltips()
    }

    this._createTicks()
    this._addEventListeners()
    this._update()
  }

  // Getters
  static override get Default(): RangeConfig {
    return Default
  }

  static override get DefaultType(): Record<string, string> {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  update(): void {
    this._update()
  }

  override dispose(): void {
    clearTimeout(this._resetTimeout!)

    EventHandler.off(this._element, EVENT_INPUT, SELECTOR_INPUT, this._onInput)
    EventHandler.off(this._element, EVENT_CHANGE, SELECTOR_INPUT, this._onChange)
    EventHandler.off(this._element, EVENT_KEYDOWN, SELECTOR_INPUT, this._onKeydown)
    EventHandler.off(this._element, EVENT_POINTERDOWN, this._onPointerDown)
    this._releasePress()

    for (const form of this._forms) {
      EventHandler.off(form, EVENT_RESET, this._onReset)
    }

    for (const [index, input] of this._inputs.entries()) {
      if (this._inputs.length > 1) {
        input.style.removeProperty('z-index')
      }

      this._restoreValueText(index)
    }

    for (const tooltip of this._tooltips) {
      tooltip.remove()
    }

    this._ticks?.remove()

    if (this._config.track && this._inputs.length > 0) {
      this._element.style.removeProperty(PROPERTY_FILL)
      this._element.style.removeProperty(PROPERTY_FILL_START)
    }

    super.dispose()
  }

  // Private
  override _configAfterMerge(config: ComponentConfig): ComponentConfig {
    // A bare `data-coreui-tooltips` attribute normalizes to `null`; treat it as enabled
    if (config.tooltips === null) {
      config.tooltips = true
    }

    if (typeof config.ticks === 'number') {
      config.ticks = String(config.ticks)
    }

    if (typeof config.ticks === 'string') {
      config.ticks = config.ticks.split(/,\s*/)
    }

    return config
  }

  protected _addEventListeners(): void {
    // Delegated handlers run in the capture phase, so the order is kept before listeners on the inputs see the value
    EventHandler.on(this._element, EVENT_INPUT, SELECTOR_INPUT, this._onInput)
    EventHandler.on(this._element, EVENT_CHANGE, SELECTOR_INPUT, this._onChange)
    EventHandler.on(this._element, EVENT_KEYDOWN, SELECTOR_INPUT, this._onKeydown)
    EventHandler.on(this._element, EVENT_POINTERDOWN, this._onPointerDown)

    for (const form of this._forms) {
      EventHandler.on(form, EVENT_RESET, this._onReset)
    }
  }

  protected _min(input: HTMLInputElement = this._inputs[0]): number {
    return input.min === '' ? 0 : Number.parseFloat(input.min)
  }

  protected _max(input: HTMLInputElement = this._inputs[0]): number {
    return input.max === '' ? 100 : Number.parseFloat(input.max)
  }

  protected _value(input: HTMLInputElement = this._inputs[0]): number {
    return Number.parseFloat(input.value)
  }

  protected _step(input: HTMLInputElement): number {
    return input.step === 'any' ? (this._max(input) - this._min(input)) / 100 : (Number.parseFloat(input.step) || 1)
  }

  protected _ratio(input: HTMLInputElement = this._inputs[0]): number {
    const span = this._max(input) - this._min(input)
    return span > 0 ? (this._value(input) - this._min(input)) / span : 0
  }

  protected _isDisabled(input: HTMLInputElement): boolean {
    return input.matches(':disabled')
  }

  protected _isVertical(): boolean {
    return this._element.classList.contains(CLASS_NAME_VERTICAL)
  }

  protected _update(changed?: HTMLInputElement): void {
    const ratios = this._inputs.map(input => this._ratio(input))

    if (this._config.track) {
      if (this._inputs.length > 1) {
        this._element.style.setProperty(PROPERTY_FILL_START, `${Math.min(...ratios)}`)
      }

      this._element.style.setProperty(PROPERTY_FILL, `${Math.max(...ratios)}`)
    }

    for (const [index, input] of this._inputs.entries()) {
      this._updateTooltip(index, ratios[index])
      this._updateValueText(index)

      if (this._inputs.length > 1) {
        input.style.zIndex = `${ratios[index] > 0.5 ? this._inputs.length - index : index + 1}`
      }

      if (!changed || changed === input) {
        EventHandler.trigger(input, EVENT_CHANGED, { value: this._value(input) })
      }
    }
  }

  protected _constrain(input: HTMLInputElement): void {
    const index = this._inputs.indexOf(input)
    const previous = this._inputs[index - 1]
    const next = this._inputs[index + 1]
    const { distance } = this._config

    if (previous && this._value(input) < this._value(previous) + distance - TOLERANCE) {
      input.value = `${this._value(previous) + distance}`

      if (this._value(input) < this._value(previous) + distance - TOLERANCE && input.step !== 'any') {
        input.stepUp()
      }
    }

    if (next && this._value(input) > this._value(next) - distance + TOLERANCE) {
      input.value = `${this._value(next) - distance}`

      if (this._value(input) > this._value(next) - distance + TOLERANCE && input.step !== 'any') {
        input.stepDown()
      }
    }
  }

  protected _format(value: number): string {
    return typeof this._config.tooltipsFormat === 'function' ? this._config.tooltipsFormat(value) : String(value)
  }

  protected _createTooltips(): void {
    const placement = this._isVertical() ?
      (isRTL(this._element) ? CLASS_NAME_TOOLTIP_END : CLASS_NAME_TOOLTIP_START) :
      CLASS_NAME_TOOLTIP_TOP

    for (const input of this._inputs) {
      // Reuse the tooltip markup so we don't duplicate the pill and arrow styles
      const tooltip = document.createElement('div')
      tooltip.className = `${CLASS_NAME_TOOLTIP} tooltip ${placement}`
      tooltip.classList.toggle(CLASS_NAME_SHOW, this._config.tooltips === 'always')
      tooltip.classList.add(...this._config.tooltipClass.split(' ').filter(Boolean))
      tooltip.setAttribute('aria-hidden', 'true')

      // Match the Tooltip template's block-level markup: `.tooltip-inner` has no `display` rule,
      // so an inline `<span>` would let its padding bleed outside the tooltip and clip the arrow.
      const arrow = document.createElement('div')
      arrow.className = 'tooltip-arrow'
      const inner = document.createElement('div')
      inner.className = 'tooltip-inner'
      tooltip.append(arrow, inner)

      input.after(tooltip)
      this._tooltips.push(tooltip)
    }
  }

  protected _updateTooltip(index: number, ratio: number): void {
    const tooltip = this._tooltips[index]

    if (tooltip) {
      tooltip.style.setProperty(PROPERTY_FILL, `${ratio}`)
      tooltip.lastElementChild!.innerHTML = sanitizeByConfig(this._format(this._value(this._inputs[index])), this._config)
    }
  }

  protected _valueText(input: HTMLInputElement): string | null {
    const value = this._value(input)
    const half = this._step(input) / 2
    const label = this._tickLabels.find(tick => Math.abs(tick.value - value) < half + TOLERANCE)?.label ?? null

    if (typeof this._config.tooltipsFormat !== 'function') {
      return label === null ? null : `${value}, ${label}`
    }

    const html = document.createElement('template')
    html.innerHTML = sanitizeByConfig(this._format(value), this._config)

    for (const lineBreak of html.content.querySelectorAll('br')) {
      lineBreak.replaceWith(' ')
    }

    const text = (html.content.textContent ?? '').replaceAll(/\s+/g, ' ').trim()
    return label === null || label === text ? text : `${text}, ${label}`
  }

  protected _updateValueText(index: number): void {
    const text = this._valueText(this._inputs[index])

    if (text === null) {
      this._restoreValueText(index)
      return
    }

    this._inputs[index].setAttribute('aria-valuetext', text)
    this._valueTextsSet[index] = true
  }

  protected _restoreValueText(index: number): void {
    if (!this._valueTextsSet[index]) {
      return
    }

    if (this._valueTexts[index] === null) {
      this._inputs[index].removeAttribute('aria-valuetext')
    } else {
      this._inputs[index].setAttribute('aria-valuetext', this._valueTexts[index]!)
    }

    this._valueTextsSet[index] = false
  }

  protected _tickPoints(): RangeTickPoint[] {
    const input = this._inputs[0]
    const min = this._min(input)
    const span = this._max(input) - min || 1
    const ratio = (value: number) => Math.min(Math.max((value - min) / span, 0), 1)
    const { ticks } = this._config
    const points: RangeTickPoint[] = []

    if (Array.isArray(ticks)) {
      for (const [index, tick] of ticks.entries()) {
        const value = typeof tick === 'number' ?
          tick :
          (typeof tick === 'object' && tick.value !== undefined ?
            tick.value :
            min + (ticks.length === 1 ? 0 : (index / (ticks.length - 1)) * span))

        points.push({
          class: typeof tick === 'object' ? tick.class : undefined,
          label: typeof tick === 'number' ? '' : (typeof tick === 'object' ? (tick.label ?? '') : tick),
          ratio: ratio(value),
          style: typeof tick === 'object' ? tick.style : undefined,
          value
        })
      }
    }

    const listId = this._config.list ?? input.getAttribute('list')
    const datalist = listId ? document.getElementById(listId) : null

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

  protected _createTicks(): void {
    const points = this._tickPoints()

    if (points.length === 0) {
      return
    }

    const vertical = this._isVertical()

    this._tickLabels = points.filter(point => point.label).map(({ label, value }) => ({ label, value }))
    this._ticks = document.createElement('div')
    this._ticks.className = CLASS_NAME_TICKS
    this._ticks.setAttribute('aria-hidden', 'true')

    if (this._config.clickableTicks && this._inputs.some(input => !this._isDisabled(input))) {
      this._ticks.classList.add(CLASS_NAME_TICKS_CLICKABLE)
    }

    // Tracks are the gaps between 0, each tick, and 1, so every tick lands on a grid line
    const stops = [0, ...points.map(point => point.ratio), 1]
    const tracks = stops.slice(1).map((stop, index) => `${stop - stops[index]}fr`)

    if (vertical) {
      this._ticks.style.gridTemplateRows = tracks.toReversed().join(' ')
    } else {
      this._ticks.style.gridTemplateColumns = tracks.join(' ')
    }

    for (const [index, point] of points.entries()) {
      const tick = document.createElement('span')
      tick.className = CLASS_NAME_TICK
      tick.classList.toggle(CLASS_NAME_TICK_START, point.ratio === 0)
      tick.classList.toggle(CLASS_NAME_TICK_END, point.ratio === 1)
      Manipulator.setDataAttribute(tick, 'value', `${point.value}`)

      if (vertical) {
        tick.style.gridRowStart = `${points.length - index + 1}`
      } else {
        tick.style.gridColumnStart = `${index + 2}`
      }

      if (point.class) {
        tick.classList.add(...[point.class].flat().flatMap(name => name.split(' ')).filter(Boolean))
      }

      if (point.style && typeof point.style === 'object') {
        Object.assign(tick.style, point.style)
      }

      if (point.label) {
        const label = document.createElement('span')
        label.className = CLASS_NAME_TICK_LABEL
        label.textContent = point.label
        tick.append(label)
      }

      this._ticks.append(tick)
    }

    this._element.append(this._ticks)
  }

  protected _nearest(ratio: number): HTMLInputElement | null {
    const inputs = this._inputs.filter(input => !this._isDisabled(input))

    if (inputs.length === 0) {
      return null
    }

    const ratios = inputs.map(input => this._ratio(input))

    if (ratio <= ratios[0]) {
      return inputs[0]
    }

    if (ratio >= ratios.at(-1)!) {
      return inputs.at(-1)!
    }

    const distances = ratios.map(value => Math.abs(value - ratio))
    const closest = Math.min(...distances)
    const first = distances.indexOf(closest)

    return inputs[ratio < ratios[first] ? first : distances.lastIndexOf(closest)]
  }

  protected _ratioAt(event: PointerEvent, rect: DOMRect, thumb: number): number {
    const vertical = this._isVertical()
    const length = (vertical ? rect.height : rect.width) - thumb
    const offset = vertical ?
      rect.bottom - event.clientY :
      (isRTL(this._element) ? rect.right - event.clientX : event.clientX - rect.left)

    return length > 0 ? Math.min(Math.max((offset - (thumb / 2)) / length, 0), 1) : 0
  }

  protected _thumbSize(): number {
    const probe = document.createElement('div')
    probe.style.cssText = `position: absolute; visibility: hidden; width: var(${PROPERTY_THUMB_WIDTH});`
    this._element.append(probe)
    const { width } = probe.getBoundingClientRect()
    probe.remove()

    return width
  }

  protected _setValue(input: HTMLInputElement, value: number): void {
    const before = input.value
    input.value = `${value}`
    this._constrain(input)

    if (input.value !== before) {
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  protected _keydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement

    if (!this._isVertical() || !this._inputs.includes(input) || !['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      return
    }

    event.preventDefault()

    const start = input.value
    this._setValue(input, this._value(input) + (event.key === 'ArrowRight' ? this._step(input) : -this._step(input)))

    if (input.value !== start) {
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  protected _pointerDown(event: PointerEvent): void {
    if (event.button !== 0 || this._press) {
      return
    }

    const rect = this._inputs[0].getBoundingClientRect()
    const tick = (event.target as Element).closest?.(SELECTOR_TICK)

    if (tick && this._ticks?.contains(tick)) {
      if (this._ticks.classList.contains(CLASS_NAME_TICKS_CLICKABLE)) {
        const value = Number(Manipulator.getDataAttribute(tick as HTMLElement, 'value'))
        this._startPress(event, rect, (value - this._min()) / ((this._max() - this._min()) || 1), value)
      }

      return
    }

    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom

    if (event.target !== this._element || this._inputs.length < 2 || !inside) {
      return
    }

    this._startPress(event, rect)
  }

  protected _startPress(event: PointerEvent, rect: DOMRect, ratio?: number, value?: number): void {
    const thumb = this._thumbSize()
    const at = ratio ?? this._ratioAt(event, rect, thumb)
    const input = this._nearest(at)

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
    this._setValue(input, value ?? this._min(input) + (at * (this._max(input) - this._min(input))))
  }

  protected _pointerMove(event: PointerEvent): void {
    if (!this._press || event.pointerId !== this._press.pointerId) {
      return
    }

    const { input, rect, thumb } = this._press
    const ratio = this._ratioAt(event, rect, thumb)
    this._setValue(input, this._min(input) + (ratio * (this._max(input) - this._min(input))))
  }

  protected _pointerUp(event: PointerEvent): void {
    if (!this._press || event.pointerId !== this._press.pointerId) {
      return
    }

    const { input, start } = this._press
    this._releasePress()

    if (input.value !== start) {
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  protected _releasePress(): void {
    this._press = null
    EventHandler.off(document, EVENT_POINTERMOVE, this._onPointerMove)
    EventHandler.off(document, EVENT_POINTERUP, this._onPointerUp)
    EventHandler.off(document, EVENT_POINTERCANCEL, this._onPointerUp)
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, Range, config, element => [element])
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, EVENT_DOM_CONTENT_LOADED, () => {
  for (const element of SelectorEngine.find(SELECTOR_RANGE)) {
    Range.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Range)

export default Range
export type { RangeConfig, RangeTick }

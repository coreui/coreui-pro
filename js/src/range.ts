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
import SelectorEngine from './dom/selector-engine.js'
import type { ComponentConfig } from './util/config.js'
import { defineJQueryPlugin } from './util/index.js'

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
const EVENT_DOM_CONTENT_LOADED = `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_RANGE = '.form-range:has(> .form-range-input)'
const SELECTOR_INPUT = '.form-range-input'

const CLASS_NAME_TOOLTIP = 'form-range-tooltip'
const CLASS_NAME_TICKS = 'form-range-ticks'
const CLASS_NAME_TICK = 'form-range-tick'
const CLASS_NAME_TICK_LABEL = 'form-range-tick-label'

const PROPERTY_FILL = '--cui-range-fill'

type RangeConfig = {
  tooltips: boolean | null
  tooltipsFormat: ((value: number) => string) | null
}

const Default: RangeConfig = {
  tooltips: false,
  tooltipsFormat: null
}

const DefaultType = {
  tooltips: '(boolean|null)',
  tooltipsFormat: '(function|null)'
}

/**
 * Class definition
 */

class Range extends BaseComponent {
  protected declare _config: RangeConfig
  protected declare _input: HTMLInputElement | null
  protected declare _tooltip: HTMLElement | null
  protected declare _tooltipText: HTMLElement | null
  protected declare _ticks: HTMLElement | null
  protected declare _updateHandler: () => void

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    // BaseComponent bails (no `_element`) when the element can't be resolved
    if (!this._element) {
      return
    }

    this._input = SelectorEngine.findOne<HTMLInputElement>(SELECTOR_INPUT, this._element)

    if (!this._input) {
      return
    }

    this._tooltip = null
    this._tooltipText = null
    this._ticks = null
    this._updateHandler = () => this._update()

    if (this._config.tooltips) {
      this._createTooltip()
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
    EventHandler.off(this._input, EVENT_INPUT, this._updateHandler)
    EventHandler.off(this._input, EVENT_CHANGE, this._updateHandler)

    this._tooltip?.remove()
    this._ticks?.remove()

    super.dispose()
  }

  // Private
  override _configAfterMerge(config: ComponentConfig): ComponentConfig {
    // A bare `data-coreui-tooltips` attribute normalizes to `null`; treat it as enabled
    if (config.tooltips === null) {
      config.tooltips = true
    }

    return config
  }

  protected _addEventListeners(): void {
    EventHandler.on(this._input, EVENT_INPUT, this._updateHandler)
    EventHandler.on(this._input, EVENT_CHANGE, this._updateHandler)
  }

  protected _min(): number {
    return this._input!.min === '' ? 0 : Number.parseFloat(this._input!.min)
  }

  protected _max(): number {
    return this._input!.max === '' ? 100 : Number.parseFloat(this._input!.max)
  }

  protected _value(): number {
    return Number.parseFloat(this._input!.value)
  }

  protected _ratio(): number {
    const span = this._max() - this._min()
    return span > 0 ? (this._value() - this._min()) / span : 0
  }

  protected _update(): void {
    // The fill ratio drives the track gradient and the tooltip/tick positions, all in CSS
    this._element.style.setProperty(PROPERTY_FILL, `${this._ratio()}`)

    if (this._tooltipText) {
      this._tooltipText.textContent = this._format(this._value())
    }

    EventHandler.trigger(this._input, EVENT_CHANGED, { value: this._value() })
  }

  protected _format(value: number): string {
    return typeof this._config.tooltipsFormat === 'function' ? this._config.tooltipsFormat(value) : String(value)
  }

  protected _createTooltip(): void {
    // Reuse the tooltip markup so we don't duplicate the pill and arrow styles
    this._tooltip = document.createElement('output')
    this._tooltip.className = `${CLASS_NAME_TOOLTIP} tooltip bs-tooltip-top show`
    this._tooltip.setAttribute('aria-hidden', 'true')

    // Match the Tooltip template's block-level markup: `.tooltip-inner` has no `display` rule,
    // so an inline `<span>` would let its padding bleed outside the tooltip and clip the arrow.
    const arrow = document.createElement('div')
    arrow.className = 'tooltip-arrow'
    this._tooltipText = document.createElement('div')
    this._tooltipText.className = 'tooltip-inner'
    this._tooltip.append(arrow, this._tooltipText)

    this._input!.insertAdjacentElement('afterend', this._tooltip)
  }

  protected _createTicks(): void {
    const listId = this._input!.getAttribute('list')
    const datalist = listId ? document.getElementById(listId) : null

    if (!datalist) {
      return
    }

    const min = this._min()
    const span = this._max() - min || 1

    const points = []
    for (const option of SelectorEngine.find<HTMLOptionElement>('option', datalist)) {
      const value = Number.parseFloat(option.value)

      if (!Number.isNaN(value)) {
        // Clamp to [0, 1] so out-of-range options can't produce negative `fr` tracks
        const ratio = Math.min(Math.max((value - min) / span, 0), 1)
        points.push({ ratio, label: option.label })
      }
    }

    if (points.length === 0) {
      return
    }

    points.sort((a, b) => a.ratio - b.ratio)

    this._ticks = document.createElement('div')
    this._ticks.className = CLASS_NAME_TICKS
    this._ticks.setAttribute('aria-hidden', 'true')

    // Columns are the gaps between 0, each tick, and 1, so every tick lands on a grid line
    const stops = [0, ...points.map(point => point.ratio), 1]
    this._ticks.style.gridTemplateColumns = stops.slice(1).map((stop, index) => `${stop - stops[index]}fr`).join(' ')

    for (const [index, point] of points.entries()) {
      const tick = document.createElement('span')
      tick.className = CLASS_NAME_TICK
      tick.style.gridColumnStart = `${index + 2}`

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

  // Static
  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Range.getOrCreateInstance(this, config)

      if (typeof config !== 'string') {
        return
      }

      if (data[config as string] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string](this)
    })
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
export type { RangeConfig }

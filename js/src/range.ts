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
import Data from './dom/data.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import type { ComponentConfig } from './util/config.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'
import {
  createTicks,
  createTooltip,
  getRatio,
  getStep,
  getTickLabel,
  getTickPoints,
  getValueText,
  type RangeTick,
  type RangeTickPoint
} from './util/range.js'
import { DefaultAllowlist, sanitizeByConfig, type SanitizerAllowList } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'range'
const DATA_KEY = 'coreui.range'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const DATA_KEY_RANGE_SLIDER = 'coreui.range-slider'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_CHANGED = `changed${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_RESET = `reset${EVENT_KEY}`
const EVENT_DOM_CONTENT_LOADED = `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_RANGE = '.form-range:has(> .form-range-input)'
const SELECTOR_INPUT = '.form-range-input'

const CLASS_NAME_TOOLTIP_TOP = 'bs-tooltip-top'

const PROPERTY_FILL = '--cui-range-fill'

type RangeConfig = {
  allowList: SanitizerAllowList
  list: string | null
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  ticks: RangeTick[] | boolean | string
  tooltipClass: string
  tooltips: boolean | 'always' | null
  tooltipsFormat: ((value: number) => string) | null
  track: boolean | string
}

const Default: RangeConfig = {
  allowList: DefaultAllowlist,
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
  protected declare _form: HTMLFormElement | null
  protected declare _input: HTMLInputElement | null
  protected declare _resetTimeout: ReturnType<typeof setTimeout> | null
  protected declare _tickPoints: RangeTickPoint[]
  protected declare _ticks: HTMLElement | null
  protected declare _tooltip: HTMLElement | null
  protected declare _valueText: string | null
  protected declare _valueTextSet: boolean
  protected declare _onChange: (event: Event) => void
  protected declare _onReset: () => void

  constructor(element?: string | Element | null, config?: Partial<RangeConfig> | null) {
    super(element, config)

    // BaseComponent bails (no `_element`) when the element can't be resolved
    if (!this._element) {
      return
    }

    this._input = (SelectorEngine.children(this._element, SELECTOR_INPUT)[0] as HTMLInputElement | undefined) ?? null
    this._form = this._input?.form ?? null
    this._resetTimeout = null
    this._tickPoints = []
    this._ticks = null
    this._tooltip = null
    this._valueText = this._input?.getAttribute('aria-valuetext') ?? null
    this._valueTextSet = false

    this._onChange = event => {
      if (event.target === this._input) {
        this._update()
      }
    }

    this._onReset = () => {
      clearTimeout(this._resetTimeout!)
      this._resetTimeout = setTimeout(() => this._update())
    }

    if (!this._input) {
      return
    }

    if (this._config.tooltips) {
      this._tooltip = createTooltip(CLASS_NAME_TOOLTIP_TOP, this._config.tooltipClass, this._config.tooltips === 'always')
      this._input.after(this._tooltip)
    }

    this._tickPoints = getTickPoints(this._input, this._config.ticks, this._config.list)

    if (this._tickPoints.length > 0) {
      this._ticks = createTicks(this._tickPoints, false)
      this._element.append(this._ticks)
    }

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
    if (this._input) {
      this._update()
    }
  }

  override dispose(): void {
    clearTimeout(this._resetTimeout!)

    EventHandler.off(this._element, EVENT_INPUT, SELECTOR_INPUT, this._onChange)
    EventHandler.off(this._element, EVENT_CHANGE, SELECTOR_INPUT, this._onChange)

    if (this._form) {
      EventHandler.off(this._form, EVENT_RESET, this._onReset)
    }

    this._restoreValueText()
    this._tooltip?.remove()
    this._ticks?.remove()

    if (this._config.track && this._input) {
      this._element.style.removeProperty(PROPERTY_FILL)
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
    EventHandler.on(this._element, EVENT_INPUT, SELECTOR_INPUT, this._onChange)
    EventHandler.on(this._element, EVENT_CHANGE, SELECTOR_INPUT, this._onChange)

    if (this._form) {
      EventHandler.on(this._form, EVENT_RESET, this._onReset)
    }
  }

  protected _update(): void {
    const input = this._input!
    const ratio = getRatio(input)
    const value = Number.parseFloat(input.value)

    if (this._config.track) {
      this._element.style.setProperty(PROPERTY_FILL, `${ratio}`)
    }

    const html = sanitizeByConfig(this._format(value), this._config)

    if (this._tooltip) {
      this._tooltip.style.setProperty(PROPERTY_FILL, `${ratio}`)
      this._tooltip.lastElementChild!.innerHTML = html
    }

    this._updateValueText(value, typeof this._config.tooltipsFormat === 'function' ? html : null)
    EventHandler.trigger(input, EVENT_CHANGED, { value })
  }

  protected _format(value: number): string {
    return typeof this._config.tooltipsFormat === 'function' ? this._config.tooltipsFormat(value) : String(value)
  }

  protected _updateValueText(value: number, html: string | null): void {
    const label = getTickLabel(this._tickPoints, value, getStep(this._input!))
    const text = getValueText(value, label, html)

    if (text === null) {
      this._restoreValueText()
      return
    }

    this._input!.setAttribute('aria-valuetext', text)
    this._valueTextSet = true
  }

  protected _restoreValueText(): void {
    if (!this._valueTextSet) {
      return
    }

    if (this._valueText === null) {
      this._input!.removeAttribute('aria-valuetext')
    } else {
      this._input!.setAttribute('aria-valuetext', this._valueText)
    }

    this._valueTextSet = false
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
    if (!Data.get(element.parentElement!, DATA_KEY_RANGE_SLIDER)) {
      Range.getOrCreateInstance(element)
    }
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Range)

export default Range
export type { RangeConfig }
export type { RangeTick } from './util/range.js'

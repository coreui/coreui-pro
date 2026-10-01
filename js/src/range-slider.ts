/**
 * --------------------------------------------------------------------------
 * CoreUI PRO range-slider.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import Range, { type RangeTick } from './range.js'
import type { ComponentConfig } from './util/config.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'
import { DefaultAllowlist, type SanitizerAllowList } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'range-slider'
const DATA_KEY = 'coreui.range-slider'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_FORM_RANGE = 'form-range'
const CLASS_NAME_FORM_RANGE_INPUT = 'form-range-input'
const CLASS_NAME_FORM_RANGE_VERTICAL = 'form-range-vertical'

const SELECTOR_DATA_RANGE_SLIDER = '[data-coreui-range-slider]'

type RangeSliderConfig = {
  allowList: SanitizerAllowList
  ariaLabels: string[] | null
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
  value: number[] | number
  vertical: boolean
}

const Default: RangeSliderConfig = {
  allowList: DefaultAllowlist,
  ariaLabels: null,
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
  ariaLabels: '(array|null)',
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
  protected declare _inputs: HTMLInputElement[]
  protected declare _range: Range | null
  protected declare _wrapper: HTMLElement | null
  protected declare _onChange: () => void
  protected declare _onInput: () => void

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    if (!this._element) {
      return
    }

    this._inputs = []
    this._range = null
    this._wrapper = null

    this._onInput = () => EventHandler.trigger(this._element, EVENT_INPUT, { value: this._values() })
    this._onChange = () => EventHandler.trigger(this._element, EVENT_CHANGE, { value: this._values() })

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
    this._config = this._getConfig({ ...this._config, ...config }) as RangeSliderConfig
    this._teardown()
    this._build()
  }

  override dispose(): void {
    this._teardown()
    super.dispose()
  }

  // Private
  _build(): void {
    this._wrapper = document.createElement('div')
    this._wrapper.className = CLASS_NAME_FORM_RANGE
    this._wrapper.classList.toggle(CLASS_NAME_FORM_RANGE_VERTICAL, this._config.vertical)
    this._inputs = (this._config.value as number[]).map((value, index) => this._createInput(index, value))
    this._wrapper.append(...this._inputs)
    this._element.append(this._wrapper)

    const {
      allowList, clickableTicks, distance, sanitize, sanitizeFn, ticks, tooltipClass, tooltips, tooltipsFormat, track
    } = this._config

    this._range = new Range(this._wrapper, {
      allowList, clickableTicks, distance, sanitize, sanitizeFn, ticks, tooltipClass, tooltips, tooltipsFormat, track
    })

    EventHandler.on(this._element, EVENT_INPUT, this._onInput)
    EventHandler.on(this._element, EVENT_CHANGE, this._onChange)
  }

  _teardown(): void {
    EventHandler.off(this._element, EVENT_INPUT, this._onInput)
    EventHandler.off(this._element, EVENT_CHANGE, this._onChange)
    this._range?.dispose()
    this._range = null
    this._wrapper?.remove()
    this._wrapper = null
    this._inputs = []
  }

  _createInput(index: number, value: number): HTMLInputElement {
    const { disabled, list, max, min, step, vertical } = this._config
    const input = document.createElement('input')
    input.type = 'range'
    input.className = CLASS_NAME_FORM_RANGE_INPUT
    input.min = `${min}`
    input.max = `${max}`
    input.step = `${step}`
    input.defaultValue = `${value}`
    input.disabled = disabled

    const name = Array.isArray(this._config.name) ?
      this._config.name[index] :
      this._config.name && `${this._config.name}-${index}`

    if (name !== undefined && name !== null && name !== '') {
      input.name = String(name)
    }

    if (list) {
      input.setAttribute('list', list)
    }

    if (vertical) {
      input.setAttribute('aria-orientation', 'vertical')
    }

    const ariaLabel = this._ariaLabel(index)

    if (ariaLabel !== null) {
      input.setAttribute('aria-label', ariaLabel)
    }

    return input
  }

  _ariaLabel(index: number): string | null {
    const values = this._config.value as number[]

    if (Array.isArray(this._config.ariaLabels) && this._config.ariaLabels[index]) {
      return this._config.ariaLabels[index]
    }

    if (values.length === 1) {
      return null
    }

    if (values.length === 2) {
      return index === 0 ? 'Minimum value' : 'Maximum value'
    }

    return `Value ${index + 1}`
  }

  _values(): number[] {
    return this._inputs.map(input => Number(input.value))
  }

  override _configAfterMerge(config: any): any {
    if (typeof config.ticks === 'string') {
      config.ticks = config.ticks.split(/,\s*/)
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

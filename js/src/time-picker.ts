/**
 * --------------------------------------------------------------------------
 * CoreUI PRO time-picker.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import PickerBase from './picker-base.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import TimeInput, { type TimeInputConfig } from './time-input.js'
import type { TimeSelectionConfig } from './time-selection/base.js'
import TimeRoll from './time-selection/roll.js'
import { type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'
import { createDate, isSameInstantAs } from './util/calendar.js'
import {
  constrainDateTime, convertValue, getDateWithin, getHourCycle
} from './util/date-sections.js'
import type { ValidationState } from './util/form-validation.js'
import { CLEANER_ICON, CLOCK_ICON } from './util/icons.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'time-picker'
const DATA_KEY = 'coreui.time-picker'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`
const EVENT_TIME_CHANGE = `timeChange${EVENT_KEY}`

const CLASS_NAME_TIME_PICKER = 'time-picker'

const SELECTOR_ACTION_NOW = '[data-coreui-picker-action="now"]'
const SELECTOR_DATA_TIME_PICKER = '[data-coreui-time-picker]'

type TimePickerConfig = {
  allowList: SanitizerAllowList,
  ariaCleanerLabel: string,
  ariaPickerLabel: string,
  ariaPopupLabel: string,
  cleaner: boolean,
  cleanerIcon: string,
  container: Element | boolean | string,
  disabled: boolean,
  floatingLabel: string | null,
  inputOptions: Partial<TimeInputConfig>,
  invalid: boolean,
  locale: string,
  name: string | null,
  pickerIcon: string | boolean,
  readonly: boolean,
  sanitize: boolean,
  sanitizeFn: ((unsafeHtml: string) => string) | null,
  seconds: boolean | number[] | ((second: number) => boolean),
  selectionOptions: Record<string, any>,
  size: string | null,
  time: Date | string | null,
  valid: boolean,
  validationState: ValidationState | null
}

type TimePickerOptions = Partial<TimePickerConfig>
  & Partial<Omit<TimeInputConfig, keyof TimePickerConfig | 'date'>>
  & Partial<Omit<TimeSelectionConfig, keyof TimePickerConfig | 'hourCycle' | 'onChange'>>

const Default: TimePickerConfig = {
  allowList: SVGAllowlist,
  ariaCleanerLabel: 'Clear time',
  ariaPickerLabel: 'Toggle time selection',
  ariaPopupLabel: 'Time selection',
  cleaner: true,
  cleanerIcon: CLEANER_ICON,
  container: false,
  disabled: false,
  floatingLabel: null,
  inputOptions: {},
  invalid: false,
  locale: navigator.language,
  name: null,
  pickerIcon: true,
  readonly: false,
  sanitize: true,
  sanitizeFn: null,
  seconds: true,
  selectionOptions: {},
  size: null,
  time: null,
  valid: false,
  validationState: null
}

const ORIGINAL_DEFAULT: TimePickerConfig = { ...Default }

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaCleanerLabel: 'string',
  ariaPickerLabel: 'string',
  ariaPopupLabel: 'string',
  cleaner: 'boolean',
  cleanerIcon: 'string',
  container: '(string|element|boolean)',
  disabled: 'boolean',
  floatingLabel: '(string|null)',
  inputOptions: 'object',
  invalid: 'boolean',
  locale: 'string',
  name: '(string|null)',
  pickerIcon: '(string|boolean)',
  readonly: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
  seconds: '(array|boolean|function)',
  selectionOptions: 'object',
  size: '(string|null)',
  time: '(date|string|null)',
  valid: 'boolean',
  validationState: '(string|null|undefined)'
}

/**
 * Class definition
 */

class TimePicker extends PickerBase {
  protected declare _initialTime: any
  protected declare _selection: any
  protected declare _selectionElement: any

  constructor(element?: string | Element | null, config?: TimePickerOptions | null) {
    super(element, config)

    this._initialTime = config?.time ?? this._config.time
    this._selection = null
    this._selectionElement = null

    this._createTimePicker()
    this._createPopup()
    this._addEventListeners()
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
  getTime(): Date | null {
    return this._input?.getDate() ?? null
  }

  setTime(time: Date | null): void {
    this._typeCheckConfig({ time }, { time: DefaultType.time })
    this._write(time, 'code', false)
  }

  now(): void {
    this._write(new Date())
  }

  clear(): void {
    this._write(null)
  }

  reset(): void {
    this._write(this._initialTime)
  }

  override getContext(): Record<string, any> {
    return {
      ...this._baseContext(),
      isTimeSelectable: (time: Date | null) => this._input.isDateSelectable(time),
      now: () => this._runAsUser(() => this.now()),
      setTime: (time: Date | null) => this._runAsUser(() => this._write(time)),
      time: this.getTime()
    }
  }

  override _disposeParts(): void {
    this._selection?.dispose()
  }

  // Private
  override _originalDefault(): Record<string, any> {
    return ORIGINAL_DEFAULT
  }

  _createTimePicker(): void {
    this._createControlGroup(CLASS_NAME_TIME_PICKER)

    const inputEl = this._appendField()
    this._moveAriaToField(inputEl)
    this._appendCleaner(this._element, this._config.ariaCleanerLabel)
    this._appendToggle(this._element, this._config.ariaPickerLabel, CLOCK_ICON)

    this._input = new TimeInput(inputEl, this._forwardConfig(TimeInput, {
      date: this._config.time,
      disabled: this._config.disabled,
      locale: this._config.locale,
      name: this._config.name,
      seconds: Boolean(this._config.seconds)
    }, {
      ...(this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {}),
      ...this._config.inputOptions,
      readonly: this._config.readonly,
      validationState: null
    }))

    this._validation.adopt(this._input._validation)

    EventHandler.on(inputEl, TimeInput.eventName(TimeInput.CHANGE_EVENT_NAME), (event: any) => {
      this._onFieldChange(event.date)
    })

    this._selectionElement = this._createMenu(CLASS_NAME_TIME_PICKER, [], SELECTOR_ACTION_NOW)
  }

  override _onPopupShow(): void {
    if (this._selection) {
      return
    }

    const { locale, maxDate: max, minDate: min } = this._input._config
    const [minDate, maxDate] = [min, max].map(limit => getDateWithin(this._input._sections, convertValue(limit, 'time', locale)))
    const hourCycle = getHourCycle(this._input._sections)

    this._selection = new TimeRoll(this._selectionElement, this._forwardConfig(TimeRoll, {
      locale: this._config.locale,
      maxDate: maxDate ?? (minDate && createDate(1970)),
      minDate
    }, {
      ...this._config.selectionOptions,
      ...(hourCycle && { hourCycle }),
      onChange: (time: Date | null) => this._runAsUser(() => this._applyTime(time && constrainDateTime(time, minDate, maxDate), time)),
      time: this.getTime()
    }))
  }

  _applyTime(time: Date | null, picked: Date | null): void {
    this._write(time, 'selection')

    if (this._element && isSameInstantAs(this._selection.getTime(), picked)) {
      this._selection.setTime(this.getTime() ?? time)
    }
  }

  _onFieldChange(time: Date | null): void {
    this._syncParts()
    EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time })
  }

  override _syncParts(): void {
    const source = this._source
    const time = this.getTime()
    this._source = null

    if (source !== 'selection' && this._selection && !isSameInstantAs(this._selection.getTime(), time)) {
      this._selection.setConfig({ time })
    }
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, TimePicker, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_TIME_PICKER)) {
    TimePicker.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(TimePicker)

export default TimePicker
export type { TimePickerConfig }

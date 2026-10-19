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
import {
  appendControlGroupField,
  applyControlGroupClasses,
  applyControlGroupSize
} from './util/form-control-group.js'
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

const CLASS_NAME_BODY = 'time-picker-body'
const CLASS_NAME_CLEANER = 'form-control-cleaner'
const CLASS_NAME_INDICATOR = 'form-control-action'
const CLASS_NAME_INPUT_GROUP = 'form-control-group'
const CLASS_NAME_PICKER = 'picker'
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
  protected declare _input: any
  protected declare _selection: any
  protected declare _selectionElement: any
  protected declare _source: 'selection' | null

  constructor(element?: string | Element | null, config?: TimePickerOptions | null) {
    super(element, config)

    this._initialTime = config?.time ?? this._config.time
    this._input = null
    this._selection = null
    this._selectionElement = null
    this._source = null

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
    this._write(() => this._input.setDate(time))
  }

  now(): void {
    this.setTime(new Date())
  }

  clear(): void {
    this._write(() => this._input.clear())
  }

  reset(): void {
    this.setTime(this._initialTime)
  }

  override getContext(): Record<string, any> {
    return {
      ...this._baseContext(),
      isTimeSelectable: (time: Date | null) => this._input.isDateSelectable(time),
      now: () => this._runAsUser(() => this.now()),
      setTime: (time: Date | null) => this._runAsUser(() => this.setTime(time)),
      time: this.getTime()
    }
  }

  override _disposeParts(): void {
    this._input.dispose()
    this._selection?.dispose()
    this._fieldElement.remove()
    this._cleanerElement?.remove()
    this._toggleElement?.remove()
  }

  // Private
  override _originalDefault(): Record<string, any> {
    return ORIGINAL_DEFAULT
  }

  _createTimePicker(): void {
    this._element.classList.add(CLASS_NAME_TIME_PICKER, CLASS_NAME_PICKER)

    const inputGroup = this._element
    applyControlGroupClasses(inputGroup, CLASS_NAME_INPUT_GROUP)

    applyControlGroupSize(inputGroup, this._config.size)

    const inputEl = document.createElement('div')
    this._fieldElement = appendControlGroupField(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`)
    this._moveAriaToField(inputEl)

    if (this._config.cleaner) {
      this._cleanerElement = this._createAction(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel)
      inputGroup.append(this._cleanerElement)
    }

    this._toggleElement = null

    if (this._config.pickerIcon) {
      this._toggleElement = this._createAction(CLASS_NAME_INDICATOR, this._config.pickerIcon === true ? CLOCK_ICON : this._config.pickerIcon, this._config.ariaPickerLabel)
      inputGroup.append(this._toggleElement)
    }

    this._input = new TimeInput(inputEl, this._forwardConfig(TimeInput, {
      date: this._config.time,
      disabled: this._config.disabled,
      locale: this._config.locale,
      name: this._config.name,
      seconds: Boolean(this._config.seconds)
    }, {
      ...(this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {}),
      ...this._config.inputOptions,
      validationState: null
    }))

    this._validation.adopt(this._input._validation)

    EventHandler.on(inputEl, TimeInput.eventName(TimeInput.CHANGE_EVENT_NAME), (event: any) => {
      this._onFieldChange(event.date)
    })

    this._selectionElement = document.createElement('div')
    this._selectionElement.classList.add(CLASS_NAME_BODY)
    this._createMenu(CLASS_NAME_TIME_PICKER, this._selectionElement, SELECTOR_ACTION_NOW)
  }

  override _isNowSelectable(): boolean {
    return this._input.isDateSelectable(new Date())
  }

  _ensureSelection(): void {
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
    this._write(() => this._input.setDate(time), 'selection')

    if (time !== picked) {
      this._selection.setTime(time)
    }
  }

  _write(action: () => void, source: 'selection' | null = null): void {
    const previous = this._source
    this._source = source

    try {
      action()
    } finally {
      this._source = previous
    }

    if (this._element && !source) {
      this._showTime(this.getTime())
    }
  }

  _onFieldChange(time: Date | null): void {
    const source = this._source
    this._source = null

    if (source !== 'selection') {
      this._showTime(time)
    }

    EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time })
  }

  _showTime(time: Date | null): void {
    if (this._selection && !isSameInstantAs(this._selection.getTime(), time)) {
      this._selection.setConfig({ time })
    }
  }

  override _onPopupShow(): void {
    this._ensureSelection()
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

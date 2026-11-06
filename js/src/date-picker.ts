/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-picker.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import PickerBase from './picker-base.js'
import Calendar, { type CalendarConfig } from './calendar.js'
import DateInput, { type DateInputConfig } from './date-input.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import type { TimeSelectionConfig } from './time-selection/base.js'
import TimeSelects from './time-selection/selects.js'
import {
  createDateTimeFormat,
  formatSelectionName,
  getDateBySelectionType,
  isSameDateAs,
  isSameInstantAs,
  type SelectionTypes
} from './util/calendar.js'
import {
  constrainDateTime, convertValue, getHourCycle, getPickerFormat
} from './util/date-sections.js'
import type { ValidationState } from './util/form-validation.js'
import { CALENDAR_ICON, CLEANER_ICON } from './util/icons.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'
import { type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'date-picker'
const DATA_KEY = 'coreui.date-picker'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_CALENDAR = 'date-picker-calendar'
const CLASS_NAME_CALENDARS = 'date-picker-calendars'
const CLASS_NAME_DATE_PICKER = 'date-picker'
const CLASS_NAME_TIME_BODY = 'date-picker-time-body'
const CLASS_NAME_TIME_PICKERS = 'date-picker-timepickers'

const SELECTOR_DATA_DATE_PICKER = '[data-coreui-date-picker]'
const SELECTOR_ROLE_CLEANER = '[data-coreui-picker-cleaner]'
const SELECTOR_ROLE_FIELD = '[data-coreui-picker-field]'
const SELECTOR_ROLE_TOGGLE = '[data-coreui-picker-toggle]'
const SELECTOR_ACTION_TODAY = '[data-coreui-picker-action="today"]'

type DatePickerConfig = {
  allowList: SanitizerAllowList,
  ariaCleanerLabel: string,
  ariaPickerLabel: string,
  ariaPopupLabel: string,
  calendarOptions: Partial<CalendarConfig>,
  cleaner: boolean,
  cleanerIcon: string,
  container: Element | boolean | string,
  date: Date | string | null,
  disabled: boolean,
  floatingLabel: string | null,
  format: DateInputConfig['format'],
  inputOptions: Partial<DateInputConfig>,
  invalid: boolean,
  locale: string,
  maxDate: Date | string | null,
  minDate: Date | string | null,
  monthNames: DateInputConfig['monthNames'],
  name: string | null,
  pickerIcon: string | boolean,
  readonly: boolean,
  sanitize: boolean,
  sanitizeFn: ((unsafeHtml: string) => string) | null,
  seconds: boolean | number[] | ((second: number) => boolean),
  selectionOptions: Record<string, any>,
  selectionType: SelectionTypes,
  size: string | null,
  timepicker: boolean,
  valid: boolean,
  validationState: ValidationState | null
}

type DatePickerOptions = Partial<DatePickerConfig>
  & Partial<Omit<CalendarConfig, keyof DatePickerConfig | 'startDate'>>
  & Partial<Omit<DateInputConfig, keyof DatePickerConfig>>
  & Partial<Omit<TimeSelectionConfig, keyof DatePickerConfig | 'hourCycle' | 'onChange' | 'time'>>

const Default: DatePickerConfig = {
  allowList: SVGAllowlist,
  ariaCleanerLabel: 'Clear date',
  ariaPickerLabel: 'Toggle calendar',
  ariaPopupLabel: 'Calendar',
  calendarOptions: {},
  cleaner: true,
  cleanerIcon: CLEANER_ICON,
  container: false,
  date: null,
  disabled: false,
  floatingLabel: null,
  format: null,
  inputOptions: {},
  invalid: false,
  locale: navigator.language,
  maxDate: null,
  minDate: null,
  monthNames: null,
  name: null,
  pickerIcon: true,
  readonly: false,
  sanitize: true,
  sanitizeFn: null,
  seconds: true,
  selectionOptions: {},
  selectionType: 'day',
  size: null,
  timepicker: false,
  valid: false,
  validationState: null
}

const ORIGINAL_DEFAULT: DatePickerConfig = { ...Default }

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaCleanerLabel: 'string',
  ariaPickerLabel: 'string',
  ariaPopupLabel: 'string',
  calendarOptions: 'object',
  cleaner: 'boolean',
  cleanerIcon: 'string',
  container: '(string|element|boolean)',
  date: '(date|string|null)',
  disabled: 'boolean',
  floatingLabel: '(string|null)',
  format: '(function|string|null)',
  inputOptions: 'object',
  invalid: 'boolean',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  monthNames: '(array|null)',
  name: '(string|null)',
  pickerIcon: '(string|boolean)',
  readonly: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
  seconds: '(array|boolean|function)',
  selectionOptions: 'object',
  selectionType: 'string',
  size: '(string|null)',
  timepicker: 'boolean',
  valid: 'boolean',
  validationState: '(string|null|undefined)'
}

/**
 * Class definition
 */

class DatePicker extends PickerBase {
  protected declare _initialDate: any
  protected declare _calendar: any
  protected declare _calendarElement: any
  protected declare _selection: any
  protected declare _selectionElement: any
  protected declare _toggleLabel: string | null

  constructor(element?: string | Element | null, config?: DatePickerOptions | null) {
    super(element, config)

    this._initialDate = config?.date ?? this._config.date
    this._calendar = null
    this._calendarElement = null
    this._selection = null
    this._selectionElement = null

    this._createDatePicker()
    this._nameToggle()
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
  getDate(): Date | null {
    return this._input?.getDate() ?? null
  }

  setDate(date: Date | null): void {
    this._typeCheckConfig({ date }, { date: DefaultType.date })
    this._write(date, 'code', false)
  }

  clear(): void {
    this._write(null)
  }

  reset(): void {
    this._write(this._initialDate)
  }

  today(): void {
    this._write(new Date())
  }

  override getContext(): Record<string, any> {
    return {
      ...this._baseContext(),
      date: this.getDate(),
      isDateSelectable: (date: Date | null) => this._input.isDateSelectable(date),
      setDate: (date: Date | null) => this._runAsUser(() => this._write(date)),
      today: () => this._runAsUser(() => this.today())
    }
  }

  override _disposeParts(): void {
    this._calendar?.dispose()
    this._selection?.dispose()
  }

  // Private
  override _originalDefault(): Record<string, any> {
    return ORIGINAL_DEFAULT
  }

  _createDatePicker(): void {
    this._createControlGroup(CLASS_NAME_DATE_PICKER)

    const inputGroup = this._element
    const inputEl = SelectorEngine.findOne(SELECTOR_ROLE_FIELD, inputGroup) ?? this._appendField()
    this._moveAriaToField(inputEl)

    const cleanerLabel = this._withTime('ariaCleanerLabel', 'Clear date and time')
    const pickerLabel = this._withTime('ariaPickerLabel', 'Toggle calendar and time selection')

    const ownCleaner = SelectorEngine.findOne(SELECTOR_ROLE_CLEANER, inputGroup)

    if (ownCleaner) {
      this._cleanerElement = this._adoptAction(ownCleaner, cleanerLabel)
    } else {
      this._appendCleaner(inputGroup, cleanerLabel)
    }

    const ownToggle = SelectorEngine.findOne(SELECTOR_ROLE_TOGGLE, inputGroup)

    if (ownToggle) {
      this._toggleLabel = ownToggle.hasAttribute('aria-label') || ownToggle.hasAttribute('aria-labelledby') || this._showsText(ownToggle) ? null : pickerLabel
      this._toggleElement = this._adoptAction(ownToggle, pickerLabel)
    } else {
      this._appendToggle(inputGroup, pickerLabel, CALENDAR_ICON)
      this._toggleLabel = this._toggleElement ? pickerLabel : null
    }

    const format = getPickerFormat(this._config.format, this._config.selectionType)

    this._input = new DateInput(inputEl, this._forwardConfig(DateInput, {
      date: this._config.date,
      disabled: this._config.disabled,
      locale: this._config.locale,
      name: this._config.name,
      seconds: Boolean(this._config.seconds),
      type: this._config.timepicker ? 'datetime' : 'date',
      ...(format ? { format } : {})
    }, {
      ...(this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {}),
      ...this._config.inputOptions,
      readonly: this._config.readonly,
      validationState: null
    }))
    this._validation.adopt(this._input._validation)

    EventHandler.on(inputEl, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event: any) => {
      this._onFieldChange(event.date)
    })

    this._calendarElement = this._createDiv(CLASS_NAME_CALENDAR)
    const parts = [this._createDiv(CLASS_NAME_CALENDARS, this._calendarElement)]

    if (this._config.timepicker) {
      this._selectionElement = this._createDiv(CLASS_NAME_TIME_BODY)
      parts.push(this._createDiv(CLASS_NAME_TIME_PICKERS, this._selectionElement))
    }

    this._createMenu(CLASS_NAME_DATE_PICKER, parts, SELECTOR_ACTION_TODAY)
  }

  override _popupLabel(): string {
    return this._withTime('ariaPopupLabel', 'Calendar and time selection')
  }

  _withTime(key: 'ariaCleanerLabel' | 'ariaPickerLabel' | 'ariaPopupLabel', timed: string): string {
    return this._config.timepicker && this._config[key] === ORIGINAL_DEFAULT[key] ? timed : this._config[key]
  }

  override _onPopupShow(): void {
    if (this._calendar) {
      return
    }

    this._calendar = new Calendar(this._calendarElement, this._forwardConfig(Calendar, {
      locale: this._config.locale,
      startDate: this.getDate()
    }, {
      ...this._config.calendarOptions,
      ...(this._config.timepicker || !this._toggleLabel ? {} : { ariaSelectedDateAnnouncement: '' })
    }))

    EventHandler.on(this._calendar._element, 'startDateChange.coreui.calendar', event => {
      this._runAsUser(() => this._write(this._withCurrentTime(event.dateObject), 'calendar'))

      if (!this._config.timepicker) {
        this.hide()
      }
    })

    if (!this._config.timepicker) {
      return
    }

    const hourCycle = getHourCycle(this._input._sections)

    this._selection = new TimeSelects(this._selectionElement, this._forwardConfig(TimeSelects, {
      locale: this._config.locale
    }, {
      ...this._config.selectionOptions,
      ...(hourCycle && { hourCycle }),
      onChange: (time: Date | null) => this._runAsUser(() => this._applyTime(time)),
      time: this.getDate()
    }))
  }

  _withinTimeLimits(date: Date): Date {
    const { locale, maxDate, minDate } = this._config

    return constrainDateTime(date, convertValue(minDate, 'datetime', locale), convertValue(maxDate, 'datetime', locale))
  }

  _withCurrentTime(date: Date | null): Date | null {
    if (!date || !this._config.timepicker) {
      return date
    }

    const merged = new Date(date)
    const current = this.getDate()

    if (current) {
      merged.setHours(current.getHours(), current.getMinutes(), current.getSeconds())
    }

    return this._withinTimeLimits(merged)
  }

  _applyTime(time: Date | null): void {
    if (!time) {
      return
    }

    const merged = new Date(this.getDate() ?? this._withinTimeLimits(new Date()))
    merged.setHours(time.getHours(), time.getMinutes(), time.getSeconds())
    const limited = this._withinTimeLimits(merged)

    this._write(limited, 'selection')

    if (this._element && isSameInstantAs(this._selection?.getTime(), time)) {
      this._selection.setTime(this.getDate() ?? limited)
    }
  }

  _onFieldChange(date: Date | null): void {
    this._syncParts()

    EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date, formattedDate: getDateBySelectionType(date, this._config.selectionType) })
  }

  override _syncParts(): void {
    const source = this._source
    const date = this.getDate()
    this._source = null

    if (this._calendar && (source === 'code' || !isSameDateAs(this._calendar._startDate, date))) {
      this._calendar.setStartDate(date)
    }

    if (source !== 'selection') {
      this._selection?.setConfig({ time: date })
    }

    this._nameToggle()
  }

  _nameToggle(): void {
    if (!this._toggleElement || !this._toggleLabel) {
      return
    }

    const date = this.getDate()
    const name = date && formatSelectionName(date, this._forwardConfig(Calendar, { locale: this._config.locale }, this._config.calendarOptions))
    const time = date && this._config.timepicker && createDateTimeFormat(this._config.locale, { timeStyle: this._config.seconds === false ? 'short' : 'medium' }).format(date)

    this._writeToggleAttribute('aria-label', [this._toggleLabel, name, time].filter(Boolean).join(', '))
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, DatePicker, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_DATE_PICKER)) {
    DatePicker.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(DatePicker)

export default DatePicker
export type { DatePickerConfig }

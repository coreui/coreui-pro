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
import type { SectionInputConfig } from './section-input.js'
import TimeSelects from './time-selection/selects.js'
import {
  convertToDateObject,
  getDateBySelectionType,
  isSameInstantAs,
  type SelectionTypes
} from './util/calendar.js'
import type { ComponentConfig } from './util/config.js'
import { getPickerFormat } from './util/date-sections.js'
import {
  appendControlGroupField,
  applyControlGroupClasses,
  applyControlGroupSize,
  captureHostClasses,
  managedSizeClassNames
} from './util/form-control-group.js'
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

const CLASS_NAME_BODY = 'date-picker-body'
const CLASS_NAME_CALENDAR = 'date-picker-calendar'
const CLASS_NAME_CALENDARS = 'date-picker-calendars'
const CLASS_NAME_DATE_PICKER = 'date-picker'
const CLASS_NAME_CLEANER = 'form-control-cleaner'
const CLASS_NAME_INDICATOR = 'form-control-action'
const CLASS_NAME_INPUT_GROUP = 'form-control-group'
const CLASS_NAME_PICKER = 'picker'
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
  calendarOptions: Partial<CalendarConfig>,
  cleaner: boolean,
  cleanerIcon: string,
  container: Element | boolean | string,
  date: Date | string | null,
  disabled: boolean,
  floatingLabel: string | null,
  format: SectionInputConfig['format'],
  inputOptions: Partial<DateInputConfig>,
  locale: string,
  maxDate: Date | string | null,
  minDate: Date | string | null,
  monthNames: SectionInputConfig['monthNames'],
  name: string | null,
  pickerIcon: string | boolean,
  sanitize: boolean,
  sanitizeFn: ((unsafeHtml: string) => string) | null,
  seconds: boolean | number[] | ((second: number) => boolean),
  selectionOptions: Record<string, any>,
  selectionType: SelectionTypes,
  size: string | null,
  timepicker: boolean
}

const Default: DatePickerConfig = {
  allowList: SVGAllowlist,
  ariaCleanerLabel: 'Clear date',
  ariaPickerLabel: 'Toggle calendar',
  calendarOptions: {},
  cleaner: true,
  cleanerIcon: CLEANER_ICON,
  container: false,
  date: null,
  disabled: false,
  floatingLabel: null,
  format: null,
  inputOptions: {},
  locale: navigator.language,
  maxDate: null,
  minDate: null,
  monthNames: null,
  name: null,
  pickerIcon: true,
  sanitize: true,
  sanitizeFn: null,
  seconds: true,
  selectionOptions: {},
  selectionType: 'day',
  size: null,
  timepicker: false
}

const ORIGINAL_DEFAULT: DatePickerConfig = { ...Default }

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaCleanerLabel: 'string',
  ariaPickerLabel: 'string',
  calendarOptions: 'object',
  cleaner: 'boolean',
  cleanerIcon: 'string',
  container: '(string|element|boolean)',
  date: '(date|string|null)',
  disabled: 'boolean',
  floatingLabel: '(string|null)',
  format: '(function|string|null)',
  inputOptions: 'object',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  monthNames: '(array|null)',
  name: '(string|null)',
  pickerIcon: '(string|boolean)',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
  seconds: '(array|boolean|function)',
  selectionOptions: 'object',
  selectionType: 'string',
  size: '(string|null)',
  timepicker: 'boolean'
}

/**
 * Class definition
 */

class DatePicker extends PickerBase {
  protected declare _created: { cleaner: boolean, field: boolean, toggle: boolean }
  protected declare _initialDate: any
  protected declare _date: Date | null
  protected declare _input: any
  protected declare _calendar: any
  protected declare _calendarElement: any
  protected declare _selection: any
  protected declare _selectionElement: any
  protected declare _applying: boolean

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._initialDate = config?.date ?? this._config.date
    this._created = { cleaner: false, field: false, toggle: false }
    this._input = null
    this._calendar = null
    this._applying = false
    this._calendarElement = null
    this._selection = null
    this._selectionElement = null

    this._hostClasses = captureHostClasses(this._element, this._managedClassNames())
    this._createDatePicker()
    this._date = this._input.getDate()
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
    return this._date
  }

  setDate(date: Date | null): void {
    this._applyDate(date)
  }

  clear(): void {
    this._applyDate(null)
  }

  reset(): void {
    this._applyDate(this._initialDate)
  }

  today(): void {
    this._applyDate(new Date())
  }

  override getContext(): Record<string, any> {
    return {
      ...this._baseContext(),
      date: this.getDate(),
      isDateSelectable: (date: Date | null) => this._input.isDateSelectable(date),
      setDate: (date: Date | null) => this.setDate(date),
      today: () => this.today()
    }
  }

  override _disposeParts(): void {
    this._input.dispose()
    this._calendar?.dispose()
    this._selection?.dispose()

    if (this._created.field) {
      this._fieldElement.remove()
    }

    if (this._created.cleaner) {
      this._cleanerElement?.remove()
    }

    if (this._created.toggle) {
      this._toggleElement?.remove()
    }
  }

  // Private
  override _originalDefault(): Record<string, any> {
    return ORIGINAL_DEFAULT
  }

  override _managedClassNames(): string[] {
    return [
      CLASS_NAME_DATE_PICKER,
      CLASS_NAME_PICKER,
      CLASS_NAME_INPUT_GROUP,
      ...managedSizeClassNames(this._config.size)
    ].filter(Boolean) as string[]
  }

  _createDatePicker(): void {
    this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_PICKER)

    const inputGroup = this._element
    applyControlGroupClasses(inputGroup, CLASS_NAME_INPUT_GROUP)

    applyControlGroupSize(inputGroup, this._config.size)

    const ownField = SelectorEngine.findOne(SELECTOR_ROLE_FIELD, inputGroup)
    const inputEl = ownField ?? document.createElement('div')
    this._created.field = !ownField
    this._fieldElement = ownField ?? appendControlGroupField(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`)

    const withTime = (key: 'ariaCleanerLabel' | 'ariaPickerLabel', timed: string) =>
      this._config.timepicker && this._config[key] === ORIGINAL_DEFAULT[key] ? timed : this._config[key]
    const cleanerLabel = withTime('ariaCleanerLabel', 'Clear date and time')
    const pickerLabel = withTime('ariaPickerLabel', 'Toggle calendar and time selection')

    const ownCleaner = SelectorEngine.findOne(SELECTOR_ROLE_CLEANER, inputGroup)

    if (ownCleaner) {
      this._cleanerElement = this._adoptAction(ownCleaner, cleanerLabel)
    } else if (this._config.cleaner) {
      this._cleanerElement = this._createAction(CLASS_NAME_CLEANER, this._config.cleanerIcon, cleanerLabel)
      this._created.cleaner = true
      inputGroup.append(this._cleanerElement)
    }

    const ownToggle = SelectorEngine.findOne(SELECTOR_ROLE_TOGGLE, inputGroup)

    this._toggleElement = null

    if (ownToggle) {
      this._toggleElement = this._adoptAction(ownToggle, pickerLabel)
    } else if (this._config.pickerIcon) {
      this._toggleElement = this._createAction(CLASS_NAME_INDICATOR, this._config.pickerIcon === true ? CALENDAR_ICON : this._config.pickerIcon, pickerLabel)
      this._created.toggle = true
      inputGroup.append(this._toggleElement)
    }

    const format = getPickerFormat(this._config.format, this._config.selectionType)

    this._input = new DateInput(inputEl, this._forwardConfig(DateInput, {
      date: this._config.date,
      disabled: this._config.disabled,
      locale: this._config.locale,
      name: this._config.name,
      seconds: Boolean(this._config.seconds),
      ...(this._config.timepicker ? { type: 'datetime' } : {}),
      ...(this._config.timepicker ? this._dayBounds() : {}),
      ...(format ? { format } : {})
    }, { ...(this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {}), ...this._config.inputOptions }))

    EventHandler.on(inputEl, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event: any) => {
      this._applyDate(event.date, { field: false })
    })

    const body = document.createElement('div')
    body.classList.add(CLASS_NAME_BODY)

    const calendars = document.createElement('div')
    calendars.classList.add(CLASS_NAME_CALENDARS)

    this._calendarElement = document.createElement('div')
    this._calendarElement.classList.add(CLASS_NAME_CALENDAR)
    calendars.append(this._calendarElement)
    body.append(calendars)

    if (this._config.timepicker) {
      const timePickers = document.createElement('div')
      timePickers.classList.add(CLASS_NAME_TIME_PICKERS)
      this._selectionElement = document.createElement('div')
      this._selectionElement.classList.add(CLASS_NAME_TIME_BODY)
      timePickers.append(this._selectionElement)
      body.append(timePickers)
    }

    this._createMenu(CLASS_NAME_DATE_PICKER, body, SELECTOR_ACTION_TODAY)
  }

  override _isNowSelectable(): boolean {
    return this._input.isDateSelectable(new Date())
  }

  _ensureCalendar(): void {
    if (this._calendar) {
      return
    }

    this._calendar = new Calendar(this._calendarElement, this._forwardConfig(Calendar, {
      locale: this._config.locale,
      startDate: this.getDate()
    }, this._config.calendarOptions))

    EventHandler.on(this._calendar._element, 'startDateChange.coreui.calendar', event => {
      this._applyDate(this._withCurrentTime(event.dateObject), { calendar: false })

      if (!this._config.timepicker) {
        this.hide()
      }
    })

    if (!this._config.timepicker) {
      return
    }

    this._selection = new TimeSelects(this._selectionElement, this._forwardConfig(TimeSelects, {
      hourCycle: this._hourCycle(),
      locale: this._config.locale,
      onChange: (time: Date | null) => this._applyTime(time),
      time: this.getDate()
    }, this._config.selectionOptions))
  }

  _hourCycle(): string | null {
    return (this._input._sections.find((section: any) => section.type === 'hour') as any)?.cycle ?? null
  }

  _dayBounds(): { maxDate?: Date, minDate?: Date } {
    const bounds: { maxDate?: Date, minDate?: Date } = {}
    const min = convertToDateObject(this._config.minDate, this._config.selectionType)
    const max = convertToDateObject(this._config.maxDate, this._config.selectionType)

    if (min) {
      bounds.minDate = new Date(new Date(min).setHours(0, 0, 0, 0))
    }

    if (max) {
      bounds.maxDate = new Date(new Date(max).setHours(23, 59, 59, 999))
    }

    return bounds
  }

  _withCurrentTime(date: Date | null): Date | null {
    if (!date || !this._config.timepicker || !this._date) {
      return date
    }

    const merged = new Date(date)
    merged.setHours(this._date.getHours(), this._date.getMinutes(), this._date.getSeconds())
    return merged
  }

  _applyTime(time: Date | null): void {
    if (!time) {
      return
    }

    const current = this.getDate()
    const merged = current ? new Date(current) : new Date()
    merged.setHours(time.getHours(), time.getMinutes(), time.getSeconds())

    this._applyDate(merged, { selection: false })
  }

  _applyDate(date: Date | null, { calendar = true, field = true, selection = true }: { calendar?: boolean, field?: boolean, selection?: boolean } = {}): void {
    if (this._applying) {
      return
    }

    this._applying = true

    try {
      if (field) {
        this._input.setConfig({ date })
      }
    } finally {
      this._applying = false
    }

    const applied = field ? this._input.getDate() : date
    const changed = !isSameInstantAs(applied, this._date)
    this._date = applied

    if (calendar) {
      this._calendar?.setConfig({ startDate: applied })
    }

    if (selection) {
      this._selection?.setConfig({ time: applied })
    }

    if (changed) {
      EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: applied, formattedDate: getDateBySelectionType(applied, this._config.selectionType) })
    }
  }

  override _writeToggleAttribute(name: string, value: string): void {
    if (!this._toggleElement) {
      return
    }

    if (this._created.toggle) {
      this._toggleElement.setAttribute(name, value)
      return
    }

    this._writeAdoptedAttribute(this._toggleElement, name, value)
  }

  override _onPopupShow(): void {
    this._ensureCalendar()
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

/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-time-picker.js
 * License (https://coreui.io/pro/license/)
 *
 * A DateInput section field in datetime mode plus a popup holding a Calendar and the
 * TimeSelection body — the date and the time halves are independent primitives,
 * composed here.
 * --------------------------------------------------------------------------
 */

import PickerBase from './picker-base.js'
import Calendar from './calendar.js'
import DateInput from './date-input.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import TimeSelection from './util/time-selection.js'
import { sanitizeByConfig, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'
import type { ComponentConfig } from './util/config.js'
import {
  appendControlGroupField,
  applyControlGroupClasses,
  applyControlGroupSize,
  captureHostClasses,
  createControlGroupAction,
  managedSizeClassNames
} from './util/form-control-group.js'
import { CALENDAR_ICON, CLEANER_ICON } from './util/icons.js'
import { defineJQueryPlugin, getUID, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'date-time-picker'
const DATA_KEY = 'coreui.date-time-picker'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_BODY = 'date-picker-body'
const CLASS_NAME_CALENDAR = 'date-picker-calendar'
const CLASS_NAME_CALENDARS = 'date-picker-calendars'
const CLASS_NAME_DATE_PICKER = 'date-picker'
const CLASS_NAME_DATE_TIME_PICKER = 'date-time-picker'
const CLASS_NAME_DROPDOWN = 'date-picker-popup'
const CLASS_NAME_FOOTER = 'date-picker-footer'
const CLASS_NAME_CLEANER = 'form-control-cleaner'
const CLASS_NAME_INDICATOR = 'form-control-action'
const CLASS_NAME_INPUT_GROUP = 'form-control-group'
const CLASS_NAME_PICKER = 'picker'
const CLASS_NAME_POPUP = 'popup'
const CLASS_NAME_TIME_BODY = 'time-picker-body'
const CLASS_NAME_TIME_PICKERS = 'date-picker-timepickers'

const SELECTOR_ACTION_TODAY = '[data-coreui-picker-action="today"]'
const SELECTOR_DATA_DATE_TIME_PICKER = '[data-coreui-date-time-picker]'

// Icons live in JavaScript, not in CSS masks — the chips pattern.

type DateTimePickerConfig = {
  allowList: SanitizerAllowList,
  ariaCleanerLabel: string,
  ariaPickerLabel: string,
  calendarOptions: Record<string, any>,
  cleaner: boolean,
  cleanerIcon: string,
  container: Element | boolean | string,
  date: Date | string | null,
  disabled: boolean,
  floatingLabel: string | null,
  inputOptions: Record<string, any>,
  locale: string,
  maxDate: Date | string | null,
  minDate: Date | string | null,
  name: string | null,
  pickerIcon: string | boolean,
  sanitize: boolean,
  sanitizeFn: ((unsafeHtml: string) => string) | null,
  seconds: boolean | number[] | ((second: number) => boolean),
  selectionOptions: Record<string, any>,
  size: string | null
}

const Default: DateTimePickerConfig = {
  allowList: SVGAllowlist,
  ariaCleanerLabel: 'Clear date and time',
  ariaPickerLabel: 'Toggle calendar and time selection',
  calendarOptions: {},
  cleaner: true,
  cleanerIcon: CLEANER_ICON,
  container: false,
  date: null,
  disabled: false,
  floatingLabel: null,
  inputOptions: {},
  locale: navigator.language,
  maxDate: null,
  minDate: null,
  name: null,
  pickerIcon: true,
  sanitize: true,
  sanitizeFn: null,
  seconds: true,
  selectionOptions: {},
  size: null
}

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
  inputOptions: 'object',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  name: '(string|null)',
  pickerIcon: '(string|boolean)',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
  seconds: '(array|boolean|function)',
  selectionOptions: 'object',
  size: '(string|null)'
}

/**
 * Class definition
 */

class DateTimePicker extends PickerBase {
  protected declare _initialDate: any
  protected declare _input: any
  protected declare _calendar: any
  protected declare _calendarElement: any
  protected declare _selection: any
  protected declare _selectionElement: any
  protected declare _syncingFromPanel: boolean

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    // see DatePicker — the shell owns the initial value for reset()
    this._initialDate = config?.date ?? this._config.date
    this._input = null
    this._calendar = null
    this._syncingFromPanel = false
    this._calendarElement = null
    this._selection = null
    this._selectionElement = null

    this._hostClasses = captureHostClasses(this._element, this._managedClassNames())
    this._createDateTimePicker()
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
    return this._input.getDate()
  }

  // See DatePicker.setDate — the emitted value and the calendar/time selection
  // follow the field's validation outcome, not the argument.
  setDate(date: Date | null): void {
    this._input.setConfig({ date })
  }

  today(): void {
    this.setDate(new Date())
  }

  clear(): void {
    this._input.clear()
  }

  reset(): void {
    this.setDate(this._initialDate)
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
    this._fieldElement.remove()
    this._cleanerElement?.remove()
    this._toggleElement?.remove()
  }

  // Private
  override _managedClassNames(): string[] {
    return [
      CLASS_NAME_DATE_PICKER,
      CLASS_NAME_DATE_TIME_PICKER,
      CLASS_NAME_PICKER,
      CLASS_NAME_INPUT_GROUP,
      ...managedSizeClassNames(this._config.size)
    ].filter(Boolean) as string[]
  }

  _createDateTimePicker(): void {
    this._element.classList.add(
      CLASS_NAME_DATE_PICKER, CLASS_NAME_DATE_TIME_PICKER, CLASS_NAME_PICKER
    )

    // The root is the frame: a field component has nothing to wrap, so it
    // carries `.form-control-group` itself instead of nesting one.
    const inputGroup = this._element
    applyControlGroupClasses(inputGroup, CLASS_NAME_INPUT_GROUP)

    // Sizing rides the standard control classes on the frame itself
    applyControlGroupSize(inputGroup, this._config.size)

    const inputEl = document.createElement('div')
    this._fieldElement = appendControlGroupField(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`)

    const action = (className: string, icon: string, label: string) => createControlGroupAction({
      className, disabled: this._config.disabled, icon, label, sanitizeIcon: (value: string) => sanitizeByConfig(value, this._config)
    })

    if (this._config.cleaner) {
      this._cleanerElement = action(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel)
      inputGroup.append(this._cleanerElement)
    }

    this._toggleElement = null

    if (this._config.pickerIcon) {
      const indicator = action(CLASS_NAME_INDICATOR, this._config.pickerIcon === true ? CALENDAR_ICON : this._config.pickerIcon, this._config.ariaPickerLabel)
      inputGroup.append(indicator)
      this._toggleElement = indicator
    }

    this._input = new DateInput(inputEl, this._forwardConfig(DateInput, {
      date: this._config.date,
      disabled: this._config.disabled,
      locale: this._config.locale,
      name: this._config.name,
      seconds: Boolean(this._config.seconds),
      type: 'datetime'
    }, { ...(this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {}), ...this._config.inputOptions }))

    // See DatePicker — the bridge from a typed value back to both panel halves
    EventHandler.on(inputEl, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event: any) => {
      if (!this._syncingFromPanel) {
        this._calendar?.setConfig({ startDate: event.date })
        this._selection?.setConfig({ time: event.date })
        EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: event.date })
      }
    })

    this._menu = document.createElement('div')
    this._menu.id = getUID(`${this.constructor.NAME}-popup-`)
    this._menu.classList.add(CLASS_NAME_POPUP, CLASS_NAME_DROPDOWN)
    this._writeToggleAttribute('aria-expanded', 'false')
    this._writeToggleAttribute('aria-haspopup', 'dialog')

    const body = document.createElement('div')
    body.classList.add(CLASS_NAME_BODY)

    const calendars = document.createElement('div')
    calendars.classList.add(CLASS_NAME_CALENDARS)
    this._calendarElement = document.createElement('div')
    this._calendarElement.classList.add(CLASS_NAME_CALENDAR)
    calendars.append(this._calendarElement)
    body.append(calendars)

    const timePickers = document.createElement('div')
    timePickers.classList.add(CLASS_NAME_TIME_PICKERS)
    this._selectionElement = document.createElement('div')
    this._selectionElement.classList.add(CLASS_NAME_TIME_BODY)
    timePickers.append(this._selectionElement)
    body.append(timePickers)

    this._menu.append(body)

    if (this._footerTemplate) {
      const footer = document.createElement('div')
      footer.classList.add(CLASS_NAME_FOOTER)
      footer.append(this._footerTemplate.content.cloneNode(true))
      this._disableUnselectableActions(SELECTOR_ACTION_TODAY, footer)
      this._menu.append(footer)
    }
  }

  // See DatePicker._disableUnselectableActions — a button opting into the
  // `today` action is disabled (never re-enabled) when today cannot be
  // selected.
  override _isNowSelectable(): boolean {
    return this._input.isDateSelectable(new Date())
  }

  // Both popup bodies are built on first open — see DatePicker._ensureCalendar.
  _ensureBodies(): void {
    if (this._calendar) {
      return
    }

    this._calendar = new Calendar(this._calendarElement, this._forwardConfig(Calendar, {
      locale: this._config.locale,
      startDate: this.getDate()
    }, this._config.calendarOptions))

    this._selection = new TimeSelection(this._selectionElement, this._forwardConfig(TimeSelection, {
      locale: this._config.locale,
      onChange: (time: Date | null) => this._applyTime(time),
      time: this.getDate(),
      variant: 'select'
    }, this._config.selectionOptions))

    EventHandler.on(this._calendar._element, 'startDateChange.coreui.calendar', (event: any) => {
      this._applyDate(event.dateObject)
    })
  }

  // The date and the time halves each own part of the value, so a change in one
  // must not discard the other.
  _applyDate(date: Date | null): void {
    if (!date) {
      return
    }

    const current = this.getDate()
    const merged = new Date(date)

    if (current) {
      merged.setHours(current.getHours(), current.getMinutes(), current.getSeconds())
    }

    this._syncingFromPanel = true
    this._input.setConfig({ date: merged })
    this._syncingFromPanel = false
    this._selection?.setConfig({ time: merged })
    EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: this.getDate() })
  }

  _applyTime(time: Date | null): void {
    if (!time) {
      return
    }

    const current = this.getDate()
    const merged = current ? new Date(current) : new Date()
    merged.setHours(time.getHours(), time.getMinutes(), time.getSeconds())

    this._syncingFromPanel = true
    this._input.setConfig({ date: merged })
    this._syncingFromPanel = false
    this._calendar?.setConfig({ startDate: merged })
    EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: this.getDate() })
  }

  override _onPopupShow(): void {
    this._ensureBodies()
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, DateTimePicker, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_DATE_TIME_PICKER)) {
    DateTimePicker.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(DateTimePicker)

export default DateTimePicker

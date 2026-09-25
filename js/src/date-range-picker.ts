/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-range-picker.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import PickerBase from './picker-base.js'
import Calendar, { type CalendarConfig } from './calendar.js'
import DateRangeInput, { type DateRangeInputConfig } from './date-range-input.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import type { SectionInputConfig } from './section-input.js'
import { captureHostClasses } from './util/form-control-group.js'
import { getDateBySelectionType, isSameInstantAs, type SelectionTypes } from './util/calendar.js'
import type { ComponentConfig } from './util/config.js'
import { getPickerFormat } from './util/date-sections.js'
import {
  CALENDAR_ICON, CLEANER_ICON, SEPARATOR_ICON, SEPARATOR_ICON_RTL
} from './util/icons.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'
import { type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'date-range-picker'
const DATA_KEY = 'coreui.date-range-picker'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY}`
const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_BODY = 'date-picker-body'
const CLASS_NAME_CALENDAR = 'date-picker-calendar'
const CLASS_NAME_CALENDARS = 'date-picker-calendars'
const CLASS_NAME_DATE_PICKER = 'date-picker'
const CLASS_NAME_DATE_RANGE_PICKER = 'date-range-picker'
const CLASS_NAME_CLEANER = 'form-control-cleaner'
const CLASS_NAME_INDICATOR = 'form-control-action'
const CLASS_NAME_PICKER = 'picker'
const CLASS_NAME_RANGES = 'date-picker-ranges'

const SELECTOR_DATA_DATE_RANGE_PICKER = '[data-coreui-date-range-picker]'
const SELECTOR_TEMPLATE_RANGES = 'template[data-coreui-template="ranges"]'

type DateRangePickerConfig = {
  allowList: SanitizerAllowList,
  ariaCleanerLabel: string,
  ariaEndLabel: string,
  ariaPickerLabel: string,
  ariaStartLabel: string,
  calendarOptions: Partial<CalendarConfig>,
  calendars: number,
  cleaner: boolean,
  cleanerIcon: string,
  container: Element | boolean | string,
  disabled: boolean,
  endDate: Date | string | null,
  endFloatingLabel: string | null,
  endName: string | null,
  format: SectionInputConfig['format'],
  inputOptions: Partial<DateRangeInputConfig>,
  locale: string,
  maxDate: Date | string | null,
  minDate: Date | string | null,
  pickerIcon: string | boolean,
  sanitize: boolean,
  sanitizeFn: ((unsafeHtml: string) => string) | null,
  selectionType: SelectionTypes,
  separatorIcon: string,
  separatorIconRtl: string,
  size: string | null,
  startDate: Date | string | null,
  startFloatingLabel: string | null,
  startName: string | null
}

const Default: DateRangePickerConfig = {
  allowList: SVGAllowlist,
  ariaCleanerLabel: 'Clear date range',
  ariaEndLabel: 'End date',
  ariaPickerLabel: 'Toggle calendar',
  ariaStartLabel: 'Start date',
  calendarOptions: {},
  calendars: 2,
  cleaner: true,
  cleanerIcon: CLEANER_ICON,
  container: false,
  disabled: false,
  endDate: null,
  endFloatingLabel: null,
  endName: null,
  format: null,
  inputOptions: {},
  locale: navigator.language,
  maxDate: null,
  minDate: null,
  pickerIcon: true,
  sanitize: true,
  sanitizeFn: null,
  selectionType: 'day',
  separatorIcon: SEPARATOR_ICON,
  separatorIconRtl: SEPARATOR_ICON_RTL,
  size: null,
  startDate: null,
  startFloatingLabel: null,
  startName: null
}

const ORIGINAL_DEFAULT: DateRangePickerConfig = { ...Default }

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaCleanerLabel: 'string',
  ariaEndLabel: 'string',
  ariaPickerLabel: 'string',
  ariaStartLabel: 'string',
  calendarOptions: 'object',
  calendars: 'number',
  cleaner: 'boolean',
  cleanerIcon: 'string',
  container: '(string|element|boolean)',
  disabled: 'boolean',
  endDate: '(date|string|null)',
  endFloatingLabel: '(string|null)',
  endName: '(string|null)',
  format: '(function|string|null)',
  inputOptions: 'object',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  pickerIcon: '(string|boolean)',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
  selectionType: 'string',
  separatorIcon: 'string',
  separatorIconRtl: 'string',
  size: '(string|null)',
  startDate: '(date|string|null)',
  startFloatingLabel: '(string|null)',
  startName: '(string|null)'
}

/**
 * Class definition
 */

class DateRangePicker extends PickerBase {
  protected declare _frameElement: HTMLElement
  protected declare _rangesTemplate: any
  protected declare _rangeInput: any
  protected declare _calendar: any
  protected declare _syncingFromPanel: boolean
  protected declare _calendarElement: any
  protected declare _selectEndDate: any

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._rangesTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_RANGES, this._element)
    this._rangeInput = null
    this._calendar = null
    this._syncingFromPanel = false
    this._calendarElement = null
    this._selectEndDate = false

    this._hostClasses = captureHostClasses(this._element, this._managedClassNames())
    this._createDateRangePicker()
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
  getStartDate(): Date | null {
    return this._rangeInput.getStartDate()
  }

  getEndDate(): Date | null {
    return this._rangeInput.getEndDate()
  }

  setRange(startDate: Date | null, endDate: Date | null): void {
    this._rangeInput.setRange(startDate, endDate)
    this._showRange()
    this._setSelectEndDate(false)
  }

  clear(): void {
    this._rangeInput.clear()
    this._setSelectEndDate(false)
  }

  reset(): void {
    this._rangeInput.reset()
    this._showRange()
    this._setSelectEndDate(false)
  }

  override getContext(): Record<string, any> {
    return {
      ...this._baseContext(),
      endDate: this.getEndDate(),
      isDateSelectable: (date: Date | null) => this._rangeInput.isDateSelectable(date),
      setRange: (startDate: Date | null, endDate: Date | null) => this.setRange(startDate, endDate),
      startDate: this.getStartDate()
    }
  }

  override _listeningElements(): (Element | null)[] {
    return [...super._listeningElements(), this._frameElement]
  }

  override _disposeParts(): void {
    this._rangeInput.dispose()
    this._calendar?.dispose()
    this._frameElement.remove()
  }

  // Private
  override _originalDefault(): Record<string, any> {
    return ORIGINAL_DEFAULT
  }

  override _managedClassNames(): string[] {
    return [
      CLASS_NAME_DATE_PICKER,
      CLASS_NAME_DATE_RANGE_PICKER,
      CLASS_NAME_PICKER
    ].filter(Boolean) as string[]
  }

  _setSelectEndDate(value: boolean): void {
    if (this._selectEndDate === value) {
      return
    }

    this._selectEndDate = value
    this._calendar?.setConfig({ selectEndDate: value })
  }

  _showRange(): void {
    this._calendar?.setConfig({ endDate: this.getEndDate(), startDate: this.getStartDate() })
  }

  _createDateRangePicker(): void {
    this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_DATE_RANGE_PICKER, CLASS_NAME_PICKER)

    const inputGroup = document.createElement('div')
    this._element.append(inputGroup)
    this._frameElement = inputGroup

    const format = getPickerFormat(this._config.format, this._config.selectionType)

    this._rangeInput = new DateRangeInput(inputGroup, this._forwardConfig(DateRangeInput, {
      disabled: this._config.disabled,
      endDate: this._config.endDate,
      locale: this._config.locale,
      size: this._config.size,
      startDate: this._config.startDate,
      ...(format ? { format } : {})
    }, { inputOptions: this._config.inputOptions }))

    EventHandler.on(inputGroup, DateRangeInput.eventName('startDateChange'), (event: any) => {
      if (!this._syncingFromPanel) {
        this._calendar?.setConfig({ startDate: event.date })
        this._triggerDateChange(EVENT_START_DATE_CHANGE, event.date)
      }
    })

    EventHandler.on(inputGroup, DateRangeInput.eventName('endDateChange'), (event: any) => {
      if (!this._syncingFromPanel) {
        this._calendar?.setConfig({ endDate: event.date })
        this._triggerDateChange(EVENT_END_DATE_CHANGE, event.date)
      }
    })

    if (this._config.cleaner) {
      this._cleanerElement = this._createAction(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel)
      inputGroup.append(this._cleanerElement)
    }

    this._toggleElement = null

    if (this._config.pickerIcon) {
      this._toggleElement = this._createAction(CLASS_NAME_INDICATOR, this._config.pickerIcon === true ? CALENDAR_ICON : this._config.pickerIcon, this._config.ariaPickerLabel)
      inputGroup.append(this._toggleElement)
    }

    const body = document.createElement('div')
    body.classList.add(CLASS_NAME_BODY)

    if (this._rangesTemplate) {
      const ranges = document.createElement('div')
      ranges.classList.add(CLASS_NAME_RANGES)
      ranges.append(this._rangesTemplate.content.cloneNode(true))
      body.append(ranges)
    }

    const calendars = document.createElement('div')
    calendars.classList.add(CLASS_NAME_CALENDARS)

    this._calendarElement = document.createElement('div')
    this._calendarElement.classList.add(CLASS_NAME_CALENDAR)
    calendars.append(this._calendarElement)
    body.append(calendars)
    this._createMenu(CLASS_NAME_DATE_PICKER, body)
  }

  _ensureCalendar(): void {
    if (this._calendar) {
      return
    }

    this._calendar = new Calendar(this._calendarElement, this._forwardConfig(Calendar, {
      calendars: this._config.calendars,
      endDate: this.getEndDate(),
      locale: this._config.locale,
      range: true,
      selectEndDate: this._selectEndDate,
      startDate: this.getStartDate()
    }, this._config.calendarOptions))

    EventHandler.on(this._calendar._element, 'selectEndChange.coreui.calendar', event => {
      this._selectEndDate = event.value
    })

    EventHandler.on(this._calendar._element, 'startDateChange.coreui.calendar', event => {
      const previous = this.getStartDate()
      this._syncingFromPanel = true
      this._rangeInput.setRange(event.dateObject, this.getEndDate())
      this._syncingFromPanel = false

      if (!isSameInstantAs(previous, this.getStartDate())) {
        this._triggerDateChange(EVENT_START_DATE_CHANGE, this.getStartDate())
      }
    })

    EventHandler.on(this._calendar._element, 'endDateChange.coreui.calendar', event => {
      const previous = this.getEndDate()
      this._syncingFromPanel = true
      this._rangeInput.setRange(this.getStartDate(), event.dateObject)
      this._syncingFromPanel = false

      if (!isSameInstantAs(previous, this.getEndDate())) {
        this._triggerDateChange(EVENT_END_DATE_CHANGE, this.getEndDate())
      }

      if (this.getEndDate() && this.getStartDate() && !this._footerTemplate) {
        this.hide()
      }
    })
  }

  _triggerDateChange(eventName: string, date: Date | null): void {
    EventHandler.trigger(this._element, eventName, { date, formattedDate: getDateBySelectionType(date, this._config.selectionType) })
  }

  override _addEventListeners(): void {
    super._addEventListeners()

    const eventName = this.constructor.eventName('focusin')

    EventHandler.on(this._rangeInput.getStartElement(), eventName, () => {
      this._setSelectEndDate(false)
    })

    EventHandler.on(this._rangeInput.getEndElement(), eventName, () => {
      this._setSelectEndDate(true)
    })
  }

  override _onPopupShow(): void {
    this._ensureCalendar()
  }

  override _popupAnchor(): HTMLElement {
    return this._frameElement
  }

  override _isNowSelectable(): boolean {
    return this._rangeInput.isDateSelectable(new Date())
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, DateRangePicker, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_DATE_RANGE_PICKER)) {
    DateRangePicker.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(DateRangePicker)

export default DateRangePicker
export type { DateRangePickerConfig }

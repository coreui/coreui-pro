/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-range-picker.js
 * License (https://coreui.io/pro/license/)
 *
 * Composed from a DateRangeInput field and one multi-month Calendar in a
 * Popup. The field owns the range — both dates and their validation — the
 * calendar owns the range mechanics (start/end, auto-advance), and the picker
 * joins them and projects the footer/ranges regions. The element is the
 * picker, not the frame: the frame is the field inside it.
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import Calendar from './calendar.js'
import DateRangeInput from './date-range-input.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import Popup from './util/popup.js'
import { createControlGroupAction } from './util/form-control-group.js'
import { getDateBySelectionType } from './util/calendar.js'
import type { ComponentConfig } from './util/config.js'
import { getWeekSectionsFromLocale } from './util/date-sections.js'
import {
  CALENDAR_ICON, CLEANER_ICON, SEPARATOR_ICON, SEPARATOR_ICON_RTL
} from './util/icons.js'
import { defineJQueryPlugin, getUID, jQueryDispatch } from './util/index.js'
import { sanitizeByConfig, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'date-range-picker'
const DATA_KEY = 'coreui.date-range-picker'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY}`
const EVENT_FOCUSIN = `focusin${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_BODY = 'date-picker-body'
const CLASS_NAME_CALENDAR = 'date-picker-calendar'
const CLASS_NAME_CALENDARS = 'date-picker-calendars'
const CLASS_NAME_DATE_PICKER = 'date-picker'
const CLASS_NAME_DATE_RANGE_PICKER = 'date-range-picker'
const CLASS_NAME_DROPDOWN = 'date-picker-popup'
const CLASS_NAME_FOOTER = 'date-picker-footer'
const CLASS_NAME_CLEANER = 'form-control-cleaner'
const CLASS_NAME_INDICATOR = 'form-control-action'
const CLASS_NAME_PICKER = 'picker'
const CLASS_NAME_POPUP = 'popup'
const CLASS_NAME_RANGES = 'date-picker-ranges'
const CLASS_NAME_SHOW = 'show'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="date-range-picker"]'
const SELECTOR_TEMPLATE_FOOTER = 'template[data-coreui-template="footer"]'
const SELECTOR_TEMPLATE_RANGES = 'template[data-coreui-template="ranges"]'
const SELECTOR_ACTION = '[data-coreui-picker-action]'

// Icons live in JavaScript only as the fallback for the generated buttons.

type DateRangePickerConfig = {
  allowList: SanitizerAllowList
  ariaCleanerLabel: string
  ariaEndLabel: string
  ariaStartLabel: string
  ariaToggleLabel: string
  cleaner: boolean
  cleanerIcon: string
  calendarOptions: Record<string, any>
  container: Element | boolean | string
  disabled: boolean
  indicatorIcon: string
  inputOptions: Record<string, any>
  locale: string
  maxDate: Date | string | null
  minDate: Date | string | null
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  size: string | null
  calendars: number
  endDate: Date | string | null
  endFloatingLabel: string | null
  endName: string | null
  separatorIcon: string
  separatorIconRtl: string
  startDate: Date | string | null
  startFloatingLabel: string | null
  startName: string | null
}

const Default: DateRangePickerConfig = {
  allowList: SVGAllowlist,
  ariaCleanerLabel: 'Clear the value',
  ariaEndLabel: 'End date',
  ariaStartLabel: 'Start date',
  ariaToggleLabel: 'Toggle the calendar',
  cleaner: true,
  cleanerIcon: CLEANER_ICON,
  calendarOptions: {},
  calendars: 2,
  container: false,
  disabled: false,
  endDate: null,
  endFloatingLabel: null,
  endName: null,
  indicatorIcon: CALENDAR_ICON,
  inputOptions: {},
  locale: navigator.language,
  maxDate: null,
  minDate: null,
  sanitize: true,
  sanitizeFn: null,
  separatorIcon: SEPARATOR_ICON,
  separatorIconRtl: SEPARATOR_ICON_RTL,
  size: null,
  startDate: null,
  startFloatingLabel: null,
  startName: null
}

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaCleanerLabel: 'string',
  ariaEndLabel: 'string',
  ariaStartLabel: 'string',
  ariaToggleLabel: 'string',
  cleaner: 'boolean',
  cleanerIcon: 'string',
  calendarOptions: 'object',
  calendars: 'number',
  container: '(string|element|boolean)',
  disabled: 'boolean',
  endDate: '(date|string|null)',
  endFloatingLabel: '(string|null)',
  endName: '(string|null)',
  indicatorIcon: 'string',
  inputOptions: 'object',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
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

class DateRangePicker extends BaseComponent {
  protected declare _footerTemplate: any
  protected declare _cleanerElement: HTMLElement | null
  protected declare _indicatorElement: HTMLElement
  protected declare _frameElement: HTMLElement
  protected declare _rangesTemplate: any
  protected declare _rangeInput: any
  protected declare _calendar: any
  protected declare _syncingFromPanel: boolean
  protected declare _calendarElement: any
  protected declare _menu: any
  protected declare _popup: any
  protected declare _selectEndDate: any

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element)
    this._rangesTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_RANGES, this._element)
    this._cleanerElement = null
    this._rangeInput = null
    this._calendar = null
    this._syncingFromPanel = false
    this._calendarElement = null
    this._menu = null
    this._popup = null
    this._selectEndDate = false

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
  show(): void {
    if (this._config.disabled) {
      return
    }

    this._popup.show()
  }

  hide(): void {
    this._popup.hide()
  }

  toggle(): void {
    return this._popup.isShown ? this.hide() : this.show()
  }

  getStartDate(): Date | null {
    return this._rangeInput.getStartDate()
  }

  getEndDate(): Date | null {
    return this._rangeInput.getEndDate()
  }

  // The field validates both dates, so the emitted values and the calendar
  // selection follow its outcome, not the arguments. Its change events carry
  // each date into the calendar; only the selection phase is this method's own
  // business.
  setRange(startDate: Date | null, endDate: Date | null): void {
    this._rangeInput.setRange(startDate, endDate)
    this._setSelectEndDate(false)
  }

  clear(): void {
    this._rangeInput.clear()
    this._setSelectEndDate(false)
  }

  reset(): void {
    this._rangeInput.reset()
    this._setSelectEndDate(false)
  }

  getContext(): Record<string, any> {
    return {
      clear: () => this.clear(),
      close: () => this.hide(),
      disabled: this._config.disabled,
      endDate: this.getEndDate(),
      isDateSelectable: (date: Date | null) => this._rangeInput.isDateSelectable(date),
      reset: () => this.reset(),
      setRange: (startDate: Date | null, endDate: Date | null) => this.setRange(startDate, endDate),
      startDate: this.getStartDate()
    }
  }

  override dispose(): void {
    for (const element of [this._menu, this._indicatorElement, this._cleanerElement, this._frameElement]) {
      EventHandler.off(element, EVENT_KEY)
    }

    this._popup.dispose()
    this._rangeInput.dispose()
    this._calendar?.dispose()
    this._frameElement.remove()
    this._element.classList.remove(CLASS_NAME_DATE_PICKER, CLASS_NAME_DATE_RANGE_PICKER, CLASS_NAME_PICKER)

    super.dispose()
  }

  // Private
  // See DatePicker._forwardConfig — options the inner primitives know about
  // are forwarded by name so data attributes reach them.
  _forwardConfig(Component: any, overrides: Record<string, any> = {}, extra: Record<string, any> = {}): Record<string, any> {
    const forwarded: Record<string, any> = {}

    for (const key of Object.keys(Component.Default)) {
      if (key in this._config && this._config[key] !== (Default as Record<string, any>)[key]) {
        forwarded[key] = this._config[key]
      }
    }

    return { ...forwarded, ...overrides, ...extra }
  }

  // See DatePicker._resolveFormat — a date mask can only express the sections
  // it has, so every non-day selection type gets a matching default mask.
  _resolveFormat(): any {
    if (this._config.format) {
      return this._config.format
    }

    const byType = {
      month: 'MM/yyyy', quarter: 'QQQ yyyy', week: getWeekSectionsFromLocale, year: 'yyyy'
    }

    return (byType as Record<string, any>)[this._config.selectionType] ?? null
  }

  _setSelectEndDate(value: boolean): void {
    if (this._selectEndDate === value) {
      return
    }

    this._selectEndDate = value
    this._calendar?.update({ selectEndDate: value })
  }

  _createDateRangePicker(): void {
    this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_DATE_RANGE_PICKER, CLASS_NAME_PICKER)

    // Only one component can own an element, and the range field owns the
    // frame — so the picker's element wraps it rather than being it. The
    // adornments still go inside the frame, where the layout expects them.
    const inputGroup = document.createElement('div')
    this._element.append(inputGroup)
    this._frameElement = inputGroup

    this._rangeInput = new DateRangeInput(inputGroup, this._forwardConfig(DateRangeInput, {
      disabled: this._config.disabled,
      endDate: this._config.endDate,
      locale: this._config.locale,
      size: this._config.size,
      startDate: this._config.startDate,
      ...(this._resolveFormat() ? { format: this._resolveFormat() } : {})
    }, { inputOptions: this._config.inputOptions }))

    // The bridge from typed values back to the calendar. The guard stops the
    // echo of the panel's own updates.
    EventHandler.on(inputGroup, DateRangeInput.eventName('startDateChange'), (event: any) => {
      if (!this._syncingFromPanel) {
        this._calendar?.update({ startDate: event.date })
        this._triggerDateChange(EVENT_START_DATE_CHANGE, event.date)
      }
    })

    EventHandler.on(inputGroup, DateRangeInput.eventName('endDateChange'), (event: any) => {
      if (!this._syncingFromPanel) {
        this._calendar?.update({ endDate: event.date })
        this._triggerDateChange(EVENT_END_DATE_CHANGE, event.date)
      }
    })

    const action = (className: string, icon: string, label: string) => createControlGroupAction({
      className, disabled: this._config.disabled, icon, label, sanitizeIcon: (value: string) => sanitizeByConfig(value, this._config)
    })

    if (this._config.cleaner) {
      this._cleanerElement = action(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel)
      inputGroup.append(this._cleanerElement)
    }

    const indicator = action(CLASS_NAME_INDICATOR, this._config.indicatorIcon, this._config.ariaToggleLabel)
    inputGroup.append(indicator)
    this._indicatorElement = indicator

    this._menu = document.createElement('div')
    this._menu.id = getUID(`${this.constructor.NAME}-popup-`)
    this._menu.classList.add(CLASS_NAME_POPUP, CLASS_NAME_DROPDOWN)
    indicator.setAttribute('aria-controls', this._menu.id)
    indicator.setAttribute('aria-expanded', 'false')
    indicator.setAttribute('aria-haspopup', 'dialog')

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
    this._menu.append(body)

    if (this._footerTemplate) {
      const footer = document.createElement('div')
      footer.classList.add(CLASS_NAME_FOOTER)
      footer.append(this._footerTemplate.content.cloneNode(true))
      this._menu.append(footer)
    }
  }

  // See DatePicker._ensureCalendar — the calendar is built on first show,
  // seeded from the shell's own state (the fields plus _selectEndDate).
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
      this._syncingFromPanel = true
      this._rangeInput.setRange(event.dateObject, this.getEndDate())
      this._syncingFromPanel = false
      this._triggerDateChange(EVENT_START_DATE_CHANGE, this.getStartDate())
    })

    EventHandler.on(this._calendar._element, 'endDateChange.coreui.calendar', event => {
      this._syncingFromPanel = true
      this._rangeInput.setRange(this.getStartDate(), event.dateObject)
      this._syncingFromPanel = false
      this._triggerDateChange(EVENT_END_DATE_CHANGE, this.getEndDate())

      if (this.getEndDate() && this.getStartDate() && !this._footerTemplate) {
        this.hide()
      }
    })
  }

  // The field validates the date, so the event reports what the field holds —
  // a selection the field refused (min/max) is announced as null, not as the
  // day that was clicked.
  _triggerDateChange(eventName: string, date: Date | null): void {
    EventHandler.trigger(this._element, eventName, { date, formattedDate: getDateBySelectionType(date, this._config.selectionType) })
  }

  _createPopup(): void {
    this._popup = new Popup({
      anchor: this._frameElement,
      container: this._config.container,
      content: this._menu,
      onBeforeHide: () => !EventHandler.trigger(this._element, EVENT_HIDE)?.defaultPrevented,
      onBeforeShow: () => !EventHandler.trigger(this._element, EVENT_SHOW)?.defaultPrevented,
      onHidden: () => EventHandler.trigger(this._element, EVENT_HIDDEN),
      onHide: () => {
        this._menu.classList.remove(CLASS_NAME_SHOW)
        this._element.classList.remove(CLASS_NAME_SHOW)
        this._indicatorElement.setAttribute('aria-expanded', 'false')
      },
      onShow: () => {
        this._ensureCalendar()
        this._menu.classList.add(CLASS_NAME_SHOW)
        this._element.classList.add(CLASS_NAME_SHOW)
        this._indicatorElement.setAttribute('aria-expanded', 'true')
      },
      onShown: () => EventHandler.trigger(this._element, EVENT_SHOWN)
    })
  }

  _addEventListeners(): void {
    if (this._cleanerElement) {
      EventHandler.on(this._cleanerElement, EVENT_CLICK, (event: any) => {
        event.stopPropagation()
        this.clear()
      })
    }

    EventHandler.on(this._indicatorElement, EVENT_CLICK, () => {
      if (!this._config.disabled) {
        this.toggle()
      }
    })

    // Focusing a field steers which end of the range the calendar selects —
    // the v1 behavior of clicking the start/end input, on section fields. The
    // guard matters: focusin fires per section, and an unguarded update would
    // re-render the calendar on every keystroke-navigation between sections.
    EventHandler.on(this._rangeInput.getStartElement(), EVENT_FOCUSIN, () => {
      this._setSelectEndDate(false)
    })

    EventHandler.on(this._rangeInput.getEndElement(), EVENT_FOCUSIN, () => {
      this._setSelectEndDate(true)
    })

    EventHandler.on(this._menu, EVENT_CLICK, SELECTOR_ACTION, (event: any) => {
      const action = event.target.closest(SELECTOR_ACTION).dataset.coreuiPickerAction
      const context = this.getContext()

      if (typeof context[action] === 'function') {
        context[action]()
      }
    })
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, DateRangePicker, config)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) {
    DateRangePicker.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(DateRangePicker)

export default DateRangePicker

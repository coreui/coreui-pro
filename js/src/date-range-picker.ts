/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-range-picker.js
 * License (https://coreui.io/pro/license/)
 *
 * Composed from two DateInput section fields and one multi-month Calendar in a
 * Popup. The calendar owns the range mechanics (start/end, auto-advance); the
 * shell wires fields, popup, and the projected footer/ranges regions.
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import Calendar from './calendar.js'
import DateInput from './date-input.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import Popup from './util/popup.js'
import type { ComponentConfig } from './util/config.js'
import { getWeekSectionsFromLocale } from './util/date-sections.js'
import { createControlGroupAction } from './util/form-control-group.js'
import { CLEANER_ICON } from './util/icons.js'
import { defineJQueryPlugin, getUID } from './util/index.js'
import { sanitizeHtml, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'

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
const CLASS_NAME_FORM_CONTROL = 'form-control'
const CLASS_NAME_INPUT_GROUP = 'form-control-group'
const CLASS_NAME_PICKER = 'picker'
const CLASS_NAME_POPUP = 'popup'
const CLASS_NAME_RANGES = 'date-picker-ranges'
const CLASS_NAME_FORM_FLOATING = 'form-floating'
const CLASS_NAME_SEPARATOR = 'form-control-icon'
const CLASS_NAME_SHOW = 'show'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="date-range-picker"]'
const SELECTOR_TEMPLATE_FOOTER = 'template[data-coreui-template="footer"]'
const SELECTOR_TEMPLATE_RANGES = 'template[data-coreui-template="ranges"]'
const SELECTOR_ACTION = '[data-coreui-picker-action]'

// Icons live in JavaScript, not in CSS masks — the chips pattern.
const DEFAULT_INDICATOR_ICON: string = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M472 96h-88V40h-32v56H160V40h-32v56H40a24.03 24.03 0 0 0-24 24v336a24.03 24.03 0 0 0 24 24h432a24.03 24.03 0 0 0 24-24V120a24.03 24.03 0 0 0-24-24Zm-8 352H48V128h80v40h32v-40h192v40h32v-40h80Z"/><rect width="32" height="32" x="112" y="224"/><rect width="32" height="32" x="200" y="224"/><rect width="32" height="32" x="280" y="224"/><rect width="32" height="32" x="368" y="224"/><rect width="32" height="32" x="112" y="296"/><rect width="32" height="32" x="200" y="296"/><rect width="32" height="32" x="280" y="296"/><rect width="32" height="32" x="368" y="296"/><rect width="32" height="32" x="112" y="368"/><rect width="32" height="32" x="200" y="368"/><rect width="32" height="32" x="280" y="368"/><rect width="32" height="32" x="368" y="368"/></svg>'
const DEFAULT_SEPARATOR_ICON: string = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="m359.873 121.377-22.627 22.627 95.997 95.997H16v32.001h417.24l-95.994 95.994 22.627 22.627L494.498 256z"/></svg>'
const DEFAULT_SEPARATOR_ICON_RTL: string = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="m152.127 121.377 22.627 22.627L78.757 240H496v32.001H78.76l95.994 95.994-22.627 22.627L17.502 256z"/></svg>'

type DateRangePickerConfig = {
  allowList: SanitizerAllowList
  ariaCleanerLabel: string
  ariaLabels: string[]
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
  endLabel: string | null
  endName: string | null
  separatorIcon: string
  separatorIconRtl: string
  startDate: Date | string | null
  startLabel: string | null
  startName: string | null
}

const Default: DateRangePickerConfig = {
  allowList: SVGAllowlist,
  ariaCleanerLabel: 'Clear the value',
  ariaLabels: ['Start date', 'End date'],
  ariaToggleLabel: 'Toggle the calendar',
  cleaner: true,
  cleanerIcon: CLEANER_ICON,
  calendarOptions: {},
  calendars: 2,
  container: false,
  disabled: false,
  endDate: null,
  endLabel: null,
  endName: null,
  indicatorIcon: DEFAULT_INDICATOR_ICON,
  inputOptions: {},
  locale: navigator.language,
  maxDate: null,
  minDate: null,
  sanitize: true,
  sanitizeFn: null,
  separatorIcon: DEFAULT_SEPARATOR_ICON,
  separatorIconRtl: DEFAULT_SEPARATOR_ICON_RTL,
  size: null,
  startDate: null,
  startLabel: null,
  startName: null
}

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaCleanerLabel: 'string',
  ariaLabels: 'array',
  ariaToggleLabel: 'string',
  cleaner: 'boolean',
  cleanerIcon: 'string',
  calendarOptions: 'object',
  calendars: 'number',
  container: '(string|element|boolean)',
  disabled: 'boolean',
  endDate: '(date|string|null)',
  endLabel: '(string|null)',
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
  startLabel: '(string|null)',
  startName: '(string|null)'
}

/**
 * Class definition
 */

class DateRangePicker extends BaseComponent {
  protected declare _footerTemplate: any
  protected declare _cleanerElement: HTMLElement | null
  protected declare _indicatorElement: HTMLElement
  protected declare _startInputElement: HTMLElement
  protected declare _endInputElement: HTMLElement
  protected declare _rangesTemplate: any
  protected declare _startInput: any
  protected declare _endInput: any
  protected declare _calendar: any
  protected declare _syncingFromPanel: boolean
  protected declare _calendarElement: any
  protected declare _menu: any
  protected declare _addedGroupClass: boolean
  protected declare _popup: any
  protected declare _selectEndDate: any
  protected declare _initialStartDate: any
  protected declare _initialEndDate: any

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element)
    this._rangesTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_RANGES, this._element)
    this._cleanerElement = null
    this._startInput = null
    this._endInput = null
    this._calendar = null
    this._syncingFromPanel = false
    this._calendarElement = null
    this._menu = null
    this._popup = null
    this._selectEndDate = false
    // see DatePicker — the shell owns the initial range for reset()
    this._initialStartDate = config?.startDate ?? this._config.startDate
    this._initialEndDate = config?.endDate ?? this._config.endDate

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
    return this._startInput.getDate()
  }

  getEndDate(): Date | null {
    return this._endInput.getDate()
  }

  // See DatePicker.setDate — the emitted values and the calendar selection
  // follow the fields' validation outcome, not the arguments.
  setRange(startDate: Date | null, endDate: Date | null): void {
    // The field listeners carry each date into the calendar and emit the
    // events; only the selection phase is this method's own business.
    this._startInput.update({ date: startDate })
    this._endInput.update({ date: endDate })
    this._selectEndDate = false
    this._calendar?.update({ selectEndDate: false })
  }

  clear(): void {
    this.setRange(null, null)
  }

  reset(): void {
    this.setRange(this._initialStartDate, this._initialEndDate)
  }

  getContext(): Record<string, any> {
    return {
      clear: () => this.clear(),
      close: () => this.hide(),
      disabled: this._config.disabled,
      endDate: this.getEndDate(),
      isDateSelectable: (date: Date | null) => this._startInput.isDateSelectable(date),
      reset: () => this.reset(),
      setRange: (startDate: Date | null, endDate: Date | null) => this.setRange(startDate, endDate),
      startDate: this.getStartDate()
    }
  }

  override dispose(): void {
    if (this._addedGroupClass) {
      this._element.classList.remove(CLASS_NAME_INPUT_GROUP)
    }

    this._popup.dispose()
    this._startInput.dispose()
    this._endInput.dispose()
    this._calendar?.dispose()
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

  _sanitizeIcon(icon: string): string {
    return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon
  }

  // The separator is a directional arrow, so it has an RTL counterpart (v1 did
  // the same with two icon variables, swapped in CSS). Read the element's
  // computed direction rather than isRTL(): the document can be LTR while an
  // ancestor sets dir="rtl" around the picker.
  _resolveSeparatorIcon(): string {
    const isRtl = window.getComputedStyle(this._element).direction === 'rtl'

    return isRtl ? this._config.separatorIconRtl : this._config.separatorIcon
  }

  // Both halves are the same primitive, so without a name of its own each would
  // announce identically and give no clue which end of the range it is.
  _ariaLabel(index: number): string {
    const labels = this._config.ariaLabels
    return (Array.isArray(labels) && labels[index]) || (Default.ariaLabels as string[])[index]
  }

  _createInput(date: Date | null, name: string, ariaLabel: string): any {
    const inputEl = document.createElement('div')

    const input = new DateInput(inputEl, this._forwardConfig(DateInput, {
      ariaLabel,
      date,
      disabled: this._config.disabled,
      locale: this._config.locale,
      name,
      ...(this._resolveFormat() ? { format: this._resolveFormat() } : {})
    }, this._config.inputOptions))

    return { input, inputEl }
  }

  _createDateRangePicker(): void {
    this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_DATE_RANGE_PICKER, CLASS_NAME_PICKER)

    // The root is the frame: a field component has nothing to wrap, so it
    // carries `.form-control-group` itself instead of nesting one.
    const inputGroup = this._element
    this._addedGroupClass = !inputGroup.classList.contains(CLASS_NAME_INPUT_GROUP)
    inputGroup.classList.add(CLASS_NAME_INPUT_GROUP)

    // Sizing rides the standard control classes on the frame itself
    if (this._config.size) {
      inputGroup.classList.add(`${CLASS_NAME_FORM_CONTROL}-${this._config.size}`)
    }

    // With a label the field gets its own `.form-floating` inside the group, so
    // the two labels float independently — the label text also becomes the
    // field's accessible name, keeping the visible and spoken labels one thing.
    const appendField = (inputEl: HTMLElement, labelText: string | null) => {
      if (!labelText) {
        inputGroup.append(inputEl)
        return
      }

      const wrapper = document.createElement('div')
      wrapper.classList.add(CLASS_NAME_FORM_FLOATING)
      inputEl.id ||= getUID(`${this.constructor.NAME}-`)
      const label = document.createElement('label')
      label.htmlFor = inputEl.id
      label.textContent = labelText
      wrapper.append(inputEl, label)
      inputGroup.append(wrapper)
    }

    const start = this._createInput(this._config.startDate, this._config.startName, this._config.startLabel ?? this._ariaLabel(0))
    this._startInput = start.input
    this._startInputElement = start.inputEl
    appendField(start.inputEl, this._config.startLabel)

    const separator = document.createElement('span')
    separator.classList.add(CLASS_NAME_SEPARATOR)
    separator.setAttribute('aria-hidden', 'true')
    separator.innerHTML = this._sanitizeIcon(this._resolveSeparatorIcon())
    inputGroup.append(separator)

    const end = this._createInput(this._config.endDate, this._config.endName, this._config.endLabel ?? this._ariaLabel(1))
    this._endInput = end.input
    this._endInputElement = end.inputEl
    appendField(end.inputEl, this._config.endLabel)

    // See DatePicker — the bridge from typed values back to the calendar
    EventHandler.on(start.inputEl, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event: any) => {
      if (!this._syncingFromPanel) {
        this._calendar?.update({ startDate: event.date })
        EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, { date: event.date })
      }
    })

    EventHandler.on(end.inputEl, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event: any) => {
      if (!this._syncingFromPanel) {
        this._calendar?.update({ endDate: event.date })
        EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, { date: event.date })
      }
    })

    const action = (className: string, icon: string, label: string) => createControlGroupAction({
      className, disabled: this._config.disabled, icon, label, sanitizeIcon: (value: string) => this._sanitizeIcon(value)
    })

    if (this._config.cleaner) {
      this._cleanerElement = action(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel)
      inputGroup.append(this._cleanerElement)
    }

    const indicator = action(CLASS_NAME_INDICATOR, this._config.indicatorIcon, this._config.ariaToggleLabel)
    inputGroup.append(indicator)
    this._indicatorElement = indicator

    this._menu = document.createElement('div')
    this._menu.classList.add(CLASS_NAME_POPUP, CLASS_NAME_DROPDOWN)

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
      const { date, dateObject } = event
      this._syncingFromPanel = true
      this._startInput.update({ date: dateObject })
      this._syncingFromPanel = false
      EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, { date, dateObject })
    })

    EventHandler.on(this._calendar._element, 'endDateChange.coreui.calendar', event => {
      const { date, dateObject } = event
      this._syncingFromPanel = true
      this._endInput.update({ date: dateObject })
      this._syncingFromPanel = false
      EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, { date, dateObject })

      if (dateObject && this.getStartDate() && !this._footerTemplate) {
        this.hide()
      }
    })
  }

  _createPopup(): void {
    this._popup = new Popup({
      anchor: this._element,
      container: this._config.container,
      content: this._menu,
      onHidden: () => EventHandler.trigger(this._element, EVENT_HIDDEN),
      onHide: () => {
        this._menu.classList.remove(CLASS_NAME_SHOW)
        this._element.classList.remove(CLASS_NAME_SHOW)
        this._element.setAttribute('aria-expanded', 'false')
        EventHandler.trigger(this._element, EVENT_HIDE)
      },
      onShow: () => {
        this._ensureCalendar()
        this._menu.classList.add(CLASS_NAME_SHOW)
        this._element.classList.add(CLASS_NAME_SHOW)
        this._element.setAttribute('aria-expanded', 'true')
        EventHandler.trigger(this._element, EVENT_SHOW)
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
    EventHandler.on(this._startInputElement, EVENT_FOCUSIN, () => {
      this._setSelectEndDate(false)
    })

    EventHandler.on(this._endInputElement, EVENT_FOCUSIN, () => {
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

// The v2 pickers define no `jQueryInterface`, so the plugin registers as
// `undefined` — preserved as-is; fixing it is a behaviour change.
defineJQueryPlugin(DateRangePicker as any)

export default DateRangePicker

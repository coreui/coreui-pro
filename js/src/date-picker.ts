/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-picker.js
 * License (https://coreui.io/pro/license/)
 *
 * Composed from existing primitives — DateInput (section field), Calendar, and
 * the Popup anchored-overlay util — rather than one monolith. Projected regions
 * (footer) come from a <template> child and act through the slot context, not
 * through configuration props.
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
import { defineJQueryPlugin } from './util/index.js'
import { sanitizeHtml, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'date-picker'
const DATA_KEY = 'coreui.date-picker'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_BODY = 'date-picker-body'
const CLASS_NAME_CALENDAR = 'date-picker-calendar'
const CLASS_NAME_CALENDARS = 'date-picker-calendars'
const CLASS_NAME_DATE_PICKER = 'date-picker'
const CLASS_NAME_DROPDOWN = 'date-picker-dropdown'
const CLASS_NAME_FOOTER = 'date-picker-footer'
const CLASS_NAME_CLEANER = 'form-control-cleaner'
const CLASS_NAME_INDICATOR = 'form-control-action'
const CLASS_NAME_FORM_CONTROL = 'form-control'
const CLASS_NAME_INPUT_GROUP = 'form-control-group'
const CLASS_NAME_PICKER = 'picker'
const CLASS_NAME_POPUP = 'popup'
const CLASS_NAME_SHOW = 'show'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="date-picker"]'
const SELECTOR_TEMPLATE_FOOTER = 'template[data-coreui-template="footer"]'
const SELECTOR_ACTION = '[data-coreui-picker-action]'
const SELECTOR_ACTION_TODAY = '[data-coreui-picker-action="today"]'

// Icons live in JavaScript, not in CSS masks — the chips pattern: inline SVG on
// currentColor, swappable through an option, sanitized like any user-provided
// markup.
const DEFAULT_INDICATOR_ICON: string = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M472 96h-88V40h-32v56H160V40h-32v56H40a24.03 24.03 0 0 0-24 24v336a24.03 24.03 0 0 0 24 24h432a24.03 24.03 0 0 0 24-24V120a24.03 24.03 0 0 0-24-24Zm-8 352H48V128h80v40h32v-40h192v40h32v-40h80Z"/><rect width="32" height="32" x="112" y="224"/><rect width="32" height="32" x="200" y="224"/><rect width="32" height="32" x="280" y="224"/><rect width="32" height="32" x="368" y="224"/><rect width="32" height="32" x="112" y="296"/><rect width="32" height="32" x="200" y="296"/><rect width="32" height="32" x="280" y="296"/><rect width="32" height="32" x="368" y="296"/><rect width="32" height="32" x="112" y="368"/><rect width="32" height="32" x="200" y="368"/><rect width="32" height="32" x="280" y="368"/><rect width="32" height="32" x="368" y="368"/></svg>'

type DatePickerConfig = {
  allowList: SanitizerAllowList
  ariaCleanerLabel: string
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
  date: Date | string | null
  name: string | null
}

const Default: DatePickerConfig = {
  allowList: SVGAllowlist,
  ariaCleanerLabel: 'Clear the value',
  ariaToggleLabel: 'Toggle the calendar',
  cleaner: true,
  cleanerIcon: CLEANER_ICON,
  calendarOptions: {},
  container: false,
  date: null,
  disabled: false,
  indicatorIcon: DEFAULT_INDICATOR_ICON,
  inputOptions: {},
  locale: navigator.language,
  maxDate: null,
  minDate: null,
  name: null,
  sanitize: true,
  sanitizeFn: null,
  size: null
}

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaCleanerLabel: 'string',
  ariaToggleLabel: 'string',
  cleaner: 'boolean',
  cleanerIcon: 'string',
  calendarOptions: 'object',
  container: '(string|element|boolean)',
  date: '(date|string|null)',
  disabled: 'boolean',
  indicatorIcon: 'string',
  inputOptions: 'object',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  name: '(string|null)',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
  size: '(string|null)'
}

/**
 * Class definition
 */

class DatePicker extends BaseComponent {
  protected declare _footerTemplate: any
  protected declare _cleanerElement: HTMLElement | null
  protected declare _indicatorElement: HTMLElement
  protected declare _initialDate: any
  protected declare _input: any
  protected declare _calendar: any
  protected declare _calendarElement: any
  protected declare _menu: any
  protected declare _popup: any

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element)
    // setDate() goes through the field's update(), which rewrites its config —
    // so the shell keeps the initial value for reset() itself
    this._initialDate = config?.date ?? this._config.date
    this._cleanerElement = null
    this._input = null
    this._calendar = null
    this._calendarElement = null
    this._menu = null
    this._popup = null

    this._createDatePicker()
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

  getDate(): Date | null {
    return this._input.getDate()
  }

  // The field validates the date against min/max — the emitted value and the
  // calendar selection follow the validation outcome, not the argument.
  setDate(date: Date | null): void {
    this._input.update({ date })
    const effectiveDate = this.getDate()
    this._calendar?.update({ startDate: effectiveDate })
    EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: effectiveDate })
  }

  clear(): void {
    this._input.clear()
    this._calendar?.update({ startDate: null })
    EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: null })
  }

  reset(): void {
    this.setDate(this._initialDate)
  }

  today(): void {
    this.setDate(new Date())
  }

  getContext(): Record<string, any> {
    return {
      clear: () => this.clear(),
      close: () => this.hide(),
      date: this.getDate(),
      disabled: this._config.disabled,
      isDateSelectable: (date: Date | null) => this._input.isDateSelectable(date),
      reset: () => this.reset(),
      setDate: (date: Date | null) => this.setDate(date),
      today: () => this.today()
    }
  }

  override dispose(): void {
    this._popup.dispose()
    this._input.dispose()
    this._calendar?.dispose()
    super.dispose()
  }

  // Private
  // Options the inner primitives know about are forwarded by name, so
  // `data-coreui-selection-type`, `data-coreui-format`, … work without the
  // shell re-declaring the whole calendar/field surface. The dedicated
  // *Options objects stay as the programmatic escape hatch.
  _forwardConfig(Component: any, overrides: Record<string, any> = {}, extra: Record<string, any> = {}): Record<string, any> {
    const forwarded: Record<string, any> = {}

    for (const key of Object.keys(Component.Default)) {
      if (key in this._config && this._config[key] !== (Default as Record<string, any>)[key]) {
        forwarded[key] = this._config[key]
      }
    }

    return { ...forwarded, ...overrides, ...extra }
  }

  // A date mask can only express the sections it has: every non-day selection
  // type gets a default mask matching its granularity (week mirrors the
  // native week input's presentation, "Week 29, 2026") and day keeps the
  // locale mask. An explicit `format` always wins.
  _resolveFormat(): any {
    if (this._config.format) {
      return this._config.format
    }

    const byType = {
      month: 'MM/yyyy', quarter: 'QQQ yyyy', week: getWeekSectionsFromLocale, year: 'yyyy'
    }

    return (byType as Record<string, any>)[this._config.selectionType] ?? null
  }

  _sanitizeIcon(icon: string): string {
    return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon
  }

  _createDatePicker(): void {
    this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_PICKER)

    const inputGroup = document.createElement('div')
    inputGroup.classList.add(CLASS_NAME_INPUT_GROUP)

    // Sizing rides the standard control classes on the frame itself
    if (this._config.size) {
      inputGroup.classList.add(`${CLASS_NAME_FORM_CONTROL}-${this._config.size}`)
    }

    const inputEl = document.createElement('div')
    inputGroup.append(inputEl)

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

    this._element.append(inputGroup)

    this._input = new DateInput(inputEl, this._forwardConfig(DateInput, {
      date: this._config.date,
      disabled: this._config.disabled,
      locale: this._config.locale,
      name: this._config.name,
      ...(this._resolveFormat() ? { format: this._resolveFormat() } : {})
    }, this._config.inputOptions))

    this._menu = document.createElement('div')
    this._menu.classList.add(CLASS_NAME_POPUP, CLASS_NAME_DROPDOWN)

    const body = document.createElement('div')
    body.classList.add(CLASS_NAME_BODY)

    const calendars = document.createElement('div')
    calendars.classList.add(CLASS_NAME_CALENDARS)

    this._calendarElement = document.createElement('div')
    this._calendarElement.classList.add(CLASS_NAME_CALENDAR)
    calendars.append(this._calendarElement)
    body.append(calendars)
    this._menu.append(body)
    this._element.append(this._menu)

    if (this._footerTemplate) {
      const footer = document.createElement('div')
      footer.classList.add(CLASS_NAME_FOOTER)
      footer.append(this._footerTemplate.content.cloneNode(true))
      this._disableUnselectableActions(footer)
      this._menu.append(footer)
    }
  }

  // A button opting into the `today` action opts into its state too: it is
  // disabled when today cannot be selected. One-way only — the picker never
  // re-enables a projected button, so a `disabled` set in the template stays.
  _disableUnselectableActions(container: HTMLElement): void {
    if (this._input.isDateSelectable(new Date())) {
      return
    }

    for (const button of SelectorEngine.find(SELECTOR_ACTION_TODAY, container)) {
      if ('disabled' in button) {
        (button as any).disabled = true
      }
    }
  }

  // The calendar is ~83% of the picker's DOM and construction cost, and it is
  // not observable before the popup opens — so it is built on first show, in
  // its final DOM position (which is also where it can resolve its direction).
  _ensureCalendar(): void {
    if (this._calendar) {
      return
    }

    this._calendar = new Calendar(this._calendarElement, this._forwardConfig(Calendar, {
      locale: this._config.locale,
      startDate: this.getDate()
    }, this._config.calendarOptions))

    EventHandler.on(this._calendar._element, 'startDateChange.coreui.calendar', event => {
      // `date` is formatted per selectionType ("2026-01", "2026Q1", …);
      // `dateObject` is the underlying Date the section field can hold
      const { date, dateObject } = event
      this._input.update({ date: dateObject })
      EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date, dateObject })
      this.hide()
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
    DatePicker.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

// The v2 pickers define no `jQueryInterface`, so the plugin registers as
// `undefined` — preserved as-is; fixing it is a behaviour change.
defineJQueryPlugin(DatePicker as any)

export default DatePicker

/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-picker.js
 * License (https://coreui.io/pro/license/)
 *
 * Composed from existing components — DateInput (section field), Calendar and
 * the Popup — joined by one piece of state, the date, that the picker owns.
 * The markup is the composition surface: a field, a toggle and a cleaner the
 * author wrote (by role attribute) are adopted; whatever is missing is
 * generated, so a bare `<div data-coreui-toggle="date-picker">` keeps working.
 * Projected regions (footer) come from a <template> child and act through the
 * slot context, not through configuration props.
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import Calendar from './calendar.js'
import DateInput from './date-input.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import Popup from './util/popup.js'
import { getDateBySelectionType, isSameDateAs } from './util/calendar.js'
import type { ComponentConfig } from './util/config.js'
import { getWeekSectionsFromLocale } from './util/date-sections.js'
import { appendControlGroupField, applyControlGroupClasses, createControlGroupAction } from './util/form-control-group.js'
import { CALENDAR_ICON, CLEANER_ICON } from './util/icons.js'
import { defineJQueryPlugin, getUID, jQueryDispatch } from './util/index.js'
import { sanitizeByConfig, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'

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
const CLASS_NAME_DROPDOWN = 'date-picker-popup'
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
const SELECTOR_ROLE_CLEANER = '[data-coreui-picker-cleaner]'
const SELECTOR_ROLE_FIELD = '[data-coreui-picker-field]'
const SELECTOR_ROLE_TOGGLE = '[data-coreui-picker-toggle]'
const SELECTOR_SVG = 'svg'
const SELECTOR_ACTION_TODAY = '[data-coreui-picker-action="today"]'

// Icons live in JavaScript only as the fallback for the minimal markup: an
// author who writes the toggle or the cleaner puts the SVG in the HTML.

type DatePickerConfig = {
  allowList: SanitizerAllowList
  ariaCleanerLabel: string
  ariaToggleLabel: string
  cleaner: boolean
  cleanerIcon: string
  calendarOptions: Record<string, any>
  container: Element | boolean | string
  disabled: boolean
  floatingLabel: string | null
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
  floatingLabel: null,
  indicatorIcon: CALENDAR_ICON,
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
  floatingLabel: '(string|null)',
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
  protected declare _toggleElement: HTMLElement
  protected declare _fieldElement: HTMLElement
  protected declare _created: { cleaner: boolean, field: boolean, toggle: boolean }
  protected declare _initialDate: any
  protected declare _date: Date | null
  protected declare _input: any
  protected declare _calendar: any
  protected declare _calendarElement: any
  protected declare _menu: any
  protected declare _applying: boolean
  protected declare _addedGroupClass: boolean
  protected declare _popup: any

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element)
    this._initialDate = config?.date ?? this._config.date
    this._cleanerElement = null
    this._created = { cleaner: false, field: false, toggle: false }
    this._input = null
    this._calendar = null
    this._applying = false
    this._calendarElement = null
    this._menu = null
    this._popup = null

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
    return this._date
  }

  // The field validates the date against min/max — the emitted value and the
  // calendar selection follow the validation outcome, not the argument.
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
    for (const element of [this._menu, this._toggleElement, this._cleanerElement]) {
      EventHandler.off(element, EVENT_KEY)
    }

    this._popup.dispose()
    this._input.dispose()
    this._calendar?.dispose()

    if (this._created.field) {
      this._fieldElement.remove()
    }

    if (this._created.cleaner) {
      this._cleanerElement?.remove()
    }

    if (this._created.toggle) {
      this._toggleElement.remove()
    }

    if (this._addedGroupClass) {
      this._element.classList.remove(CLASS_NAME_INPUT_GROUP)
    }

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

  _createDatePicker(): void {
    this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_PICKER)

    // The root is the frame: a field component has nothing to wrap, so it
    // carries `.form-control-group` itself instead of nesting one.
    const inputGroup = this._element
    this._addedGroupClass = !inputGroup.classList.contains(CLASS_NAME_INPUT_GROUP)
    applyControlGroupClasses(inputGroup, CLASS_NAME_INPUT_GROUP)

    // Sizing rides the standard control classes on the frame itself
    if (this._config.size) {
      inputGroup.classList.add(`${CLASS_NAME_FORM_CONTROL}-${this._config.size}`)
    }

    // Markup first: a part the author wrote is adopted, a missing one is built.
    const ownField = SelectorEngine.findOne(SELECTOR_ROLE_FIELD, inputGroup)
    const inputEl = ownField ?? document.createElement('div')
    this._created.field = !ownField
    this._fieldElement = ownField ?? appendControlGroupField(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`)

    const action = (className: string, icon: string, label: string) => createControlGroupAction({
      className, disabled: this._config.disabled, icon, label, sanitizeIcon: (value: string) => sanitizeByConfig(value, this._config)
    })

    const ownCleaner = SelectorEngine.findOne(SELECTOR_ROLE_CLEANER, inputGroup)

    if (ownCleaner) {
      this._cleanerElement = this._adoptAction(ownCleaner, this._config.ariaCleanerLabel)
    } else if (this._config.cleaner) {
      this._cleanerElement = action(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel)
      this._created.cleaner = true
      inputGroup.append(this._cleanerElement)
    }

    const ownToggle = SelectorEngine.findOne(SELECTOR_ROLE_TOGGLE, inputGroup)

    if (ownToggle) {
      this._toggleElement = this._adoptAction(ownToggle, this._config.ariaToggleLabel)
    } else {
      this._toggleElement = action(CLASS_NAME_INDICATOR, this._config.indicatorIcon, this._config.ariaToggleLabel)
      this._created.toggle = true
      inputGroup.append(this._toggleElement)
    }

    this._input = new DateInput(inputEl, this._forwardConfig(DateInput, {
      date: this._config.date,
      disabled: this._config.disabled,
      locale: this._config.locale,
      name: this._config.name,
      ...(this._resolveFormat() ? { format: this._resolveFormat() } : {})
    }, { ...(this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {}), ...this._config.inputOptions }))

    EventHandler.on(inputEl, DateInput.eventName(DateInput.CHANGE_EVENT_NAME), (event: any) => {
      this._applyDate(event.date, { field: false })
    })

    this._menu = document.createElement('div')
    this._menu.id = getUID(`${this.constructor.NAME}-popup-`)
    this._menu.classList.add(CLASS_NAME_POPUP, CLASS_NAME_DROPDOWN)
    this._toggleElement.setAttribute('aria-controls', this._menu.id)
    this._toggleElement.setAttribute('aria-expanded', 'false')
    this._toggleElement.setAttribute('aria-haspopup', 'dialog')

    const body = document.createElement('div')
    body.classList.add(CLASS_NAME_BODY)

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
      this._applyDate(event.dateObject, { calendar: false })
      this.hide()
    })
  }

  // The one place the date changes. The field validates it, so what the
  // picker keeps and announces is what the field holds — a selection the
  // field refused (min/max) becomes null, not the day that was clicked. The
  // side that reported the change is not written back to.
  _applyDate(date: Date | null, { calendar = true, field = true }: { calendar?: boolean, field?: boolean } = {}): void {
    if (this._applying) {
      return
    }

    this._applying = true

    if (field) {
      this._input.update({ date })
    }

    const applied = field ? this._input.getDate() : date
    this._applying = false

    const changed = !isSameDateAs(applied, this._date)
    this._date = applied

    if (calendar) {
      this._calendar?.update({ startDate: applied })
    }

    if (changed) {
      EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: applied, formattedDate: getDateBySelectionType(applied, this._config.selectionType) })
    }
  }

  // An element the author wrote gets the accessibility the component would
  // have given its own: a name when it has none, hidden decoration.
  _adoptAction(element: HTMLElement, label: string): HTMLElement {
    if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
      element.setAttribute('aria-label', label)
    }

    for (const svg of SelectorEngine.find(SELECTOR_SVG, element)) {
      if (!svg.hasAttribute('aria-hidden')) {
        svg.setAttribute('aria-hidden', 'true')
      }
    }

    if (this._config.disabled && 'disabled' in element) {
      (element as HTMLButtonElement).disabled = true
    }

    return element
  }

  _createPopup(): void {
    this._popup = new Popup({
      anchor: this._element,
      container: this._config.container,
      content: this._menu,
      onBeforeHide: () => !EventHandler.trigger(this._element, EVENT_HIDE)?.defaultPrevented,
      onBeforeShow: () => !EventHandler.trigger(this._element, EVENT_SHOW)?.defaultPrevented,
      onHidden: () => EventHandler.trigger(this._element, EVENT_HIDDEN),
      onHide: () => {
        this._menu.classList.remove(CLASS_NAME_SHOW)
        this._element.classList.remove(CLASS_NAME_SHOW)
        this._toggleElement.setAttribute('aria-expanded', 'false')
      },
      onShow: () => {
        this._ensureCalendar()
        this._menu.classList.add(CLASS_NAME_SHOW)
        this._element.classList.add(CLASS_NAME_SHOW)
        this._toggleElement.setAttribute('aria-expanded', 'true')
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

    EventHandler.on(this._toggleElement, EVENT_CLICK, () => {
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

  // Static
  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, DatePicker, config)
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

defineJQueryPlugin(DatePicker)

export default DatePicker

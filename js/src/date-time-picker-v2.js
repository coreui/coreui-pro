/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-time-picker-v2.js
 * License (https://coreui.io/pro/license/)
 *
 * Pickers v2 prototype (workspace: plans/pickers-v2-rewrite.md): the product
 * that replaces v1's `timepicker: true` flag on the date picker. A DateTimeInput
 * section field plus a popup holding a Calendar and the TimeSelection body —
 * the date and the time halves are independent primitives, composed here.
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import Calendar from './calendar.js'
import DateTimeInput from './date-time-input.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import Popup from './util/popup.js'
import TimeSelection from './util/time-selection.js'
import { sanitizeHtml, SVGAllowlist } from './util/sanitizer.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'date-time-picker-v2'
const DATA_KEY = 'coreui.date-time-picker-v2'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`

const CLASS_NAME_BODY = 'date-picker-body'
const CLASS_NAME_CALENDAR = 'date-picker-calendar'
const CLASS_NAME_CALENDARS = 'date-picker-calendars'
const CLASS_NAME_DATE_PICKER = 'date-picker'
const CLASS_NAME_DATE_PICKER_V2 = 'date-picker-v2'
const CLASS_NAME_DATE_TIME_PICKER = 'date-time-picker'
const CLASS_NAME_DROPDOWN = 'date-picker-dropdown'
const CLASS_NAME_FOOTER = 'date-picker-footer'
const CLASS_NAME_INDICATOR = 'date-picker-indicator'
const CLASS_NAME_INPUT_GROUP = 'date-picker-input-group'
const CLASS_NAME_PICKER = 'picker'
const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_TIME_BODY = 'time-picker-body'
const CLASS_NAME_TIME_PICKERS = 'date-picker-timepickers'

const SELECTOR_ACTION = '[data-coreui-picker-action]'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="date-time-picker-v2"]'
const SELECTOR_TEMPLATE_FOOTER = 'template[data-coreui-template="footer"]'

// Icons live in JavaScript, not in CSS masks — the chips pattern.
const DEFAULT_INDICATOR_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M472 96h-88V40h-32v56H160V40h-32v56H40a24.03 24.03 0 0 0-24 24v336a24.03 24.03 0 0 0 24 24h432a24.03 24.03 0 0 0 24-24V120a24.03 24.03 0 0 0-24-24Zm-8 352H48V128h80v40h32v-40h192v40h32v-40h80Z"/><rect width="32" height="32" x="112" y="224"/><rect width="32" height="32" x="200" y="224"/><rect width="32" height="32" x="280" y="224"/><rect width="32" height="32" x="368" y="224"/><rect width="32" height="32" x="112" y="296"/><rect width="32" height="32" x="200" y="296"/><rect width="32" height="32" x="280" y="296"/><rect width="32" height="32" x="368" y="296"/><rect width="32" height="32" x="112" y="368"/><rect width="32" height="32" x="200" y="368"/><rect width="32" height="32" x="280" y="368"/><rect width="32" height="32" x="368" y="368"/></svg>'

const Default = {
  allowList: SVGAllowlist,
  ariaToggleLabel: 'Toggle the calendar',
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
  selectionOptions: {},
  size: null,
  variant: 'roll'
}

const DefaultType = {
  allowList: 'object',
  ariaToggleLabel: 'string',
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
  selectionOptions: 'object',
  size: '(string|null)',
  variant: 'string'
}

/**
 * Class definition
 */

class DateTimePickerV2 extends BaseComponent {
  constructor(element, config) {
    super(element, config)

    this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element)
    // see DatePickerV2 — the shell owns the initial value for reset()
    this._initialDate = config?.date ?? this._config.date
    this._input = null
    this._calendar = null
    this._calendarElement = null
    this._selection = null
    this._selectionElement = null
    this._menu = null
    this._popup = null

    this._createDateTimePicker()
    this._createPopup()
    this._addEventListeners()
  }

  // Getters
  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  static get NAME() {
    return NAME
  }

  // Public
  show() {
    if (this._config.disabled) {
      return
    }

    this._popup.show()
  }

  hide() {
    this._popup.hide()
  }

  toggle() {
    return this._popup.isShown ? this.hide() : this.show()
  }

  getDate() {
    return this._input.getDate()
  }

  setDate(date) {
    this._input.update({ date })
    this._calendar?.update({ startDate: date })
    this._selection?.update({ time: date })
    EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date })
  }

  today() {
    this.setDate(new Date())
  }

  clear() {
    this._input.clear()
    this._calendar?.update({ startDate: null })
    this._selection?.update({ time: null })
    EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: null })
  }

  reset() {
    this.setDate(this._initialDate)
  }

  getContext() {
    return {
      clear: () => this.clear(),
      close: () => this.hide(),
      date: this.getDate(),
      disabled: this._config.disabled,
      reset: () => this.reset(),
      setDate: date => this.setDate(date),
      today: () => this.today()
    }
  }

  dispose() {
    this._popup.dispose()
    this._input.dispose()
    this._calendar?.dispose()
    this._selection?.dispose()
    super.dispose()
  }

  // Private
  _forwardConfig(Component, overrides = {}, extra = {}) {
    const forwarded = {}

    for (const key of Object.keys(Component.Default)) {
      if (key in this._config && this._config[key] !== Default[key]) {
        forwarded[key] = this._config[key]
      }
    }

    return { ...forwarded, ...overrides, ...extra }
  }

  _sanitizeIcon(icon) {
    return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon
  }

  _createDateTimePicker() {
    this._element.classList.add(
      CLASS_NAME_DATE_PICKER, CLASS_NAME_DATE_PICKER_V2, CLASS_NAME_DATE_TIME_PICKER, CLASS_NAME_PICKER
    )

    if (this._config.size) {
      this._element.classList.add(`${CLASS_NAME_DATE_PICKER}-${this._config.size}`)
    }

    const inputGroup = document.createElement('div')
    inputGroup.classList.add(CLASS_NAME_INPUT_GROUP)

    const inputEl = document.createElement('div')
    inputGroup.append(inputEl)

    const indicator = document.createElement('button')
    indicator.classList.add(CLASS_NAME_INDICATOR)
    indicator.type = 'button'
    indicator.setAttribute('aria-label', this._config.ariaToggleLabel)
    indicator.innerHTML = this._sanitizeIcon(this._config.indicatorIcon)
    inputGroup.append(indicator)
    this._indicatorElement = indicator

    this._element.append(inputGroup)

    this._input = new DateTimeInput(inputEl, this._forwardConfig(DateTimeInput, {
      date: this._config.date,
      disabled: this._config.disabled,
      locale: this._config.locale,
      name: this._config.name
    }, this._config.inputOptions))

    this._menu = document.createElement('div')
    this._menu.classList.add(CLASS_NAME_DROPDOWN)

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
      this._menu.append(footer)
    }

    this._element.append(this._menu)
  }

  // Both popup bodies are built on first open — see DatePickerV2._ensureCalendar.
  _ensureBodies() {
    if (this._calendar) {
      return
    }

    this._calendar = new Calendar(this._calendarElement, this._forwardConfig(Calendar, {
      locale: this._config.locale,
      startDate: this.getDate()
    }, this._config.calendarOptions))

    this._selection = new TimeSelection(this._selectionElement, this._forwardConfig(TimeSelection, {
      locale: this._config.locale,
      onChange: time => this._applyTime(time),
      time: this.getDate(),
      variant: this._config.variant
    }, this._config.selectionOptions))

    EventHandler.on(this._calendar._element, 'startDateChange.coreui.calendar', event => {
      this._applyDate(event.dateObject)
    })
  }

  // The date and the time halves each own part of the value, so a change in one
  // must not discard the other.
  _applyDate(date) {
    if (!date) {
      return
    }

    const current = this.getDate()
    const merged = new Date(date)

    if (current) {
      merged.setHours(current.getHours(), current.getMinutes(), current.getSeconds())
    }

    this._input.update({ date: merged })
    this._selection?.update({ time: merged })
    EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: merged })
  }

  _applyTime(time) {
    if (!time) {
      return
    }

    const current = this.getDate()
    const merged = current ? new Date(current) : new Date()
    merged.setHours(time.getHours(), time.getMinutes(), time.getSeconds())

    this._input.update({ date: merged })
    this._calendar?.update({ startDate: merged })
    EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: merged })
  }

  _createPopup() {
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
        // the classes come first: the selection body scrolls the selected cell
        // into view, which needs the dropdown to have layout
        this._menu.classList.add(CLASS_NAME_SHOW)
        this._element.classList.add(CLASS_NAME_SHOW)
        this._ensureBodies()
        this._element.setAttribute('aria-expanded', 'true')
        EventHandler.trigger(this._element, EVENT_SHOW)
      },
      onShown: () => EventHandler.trigger(this._element, EVENT_SHOWN)
    })
  }

  _addEventListeners() {
    EventHandler.on(this._indicatorElement, EVENT_CLICK, () => {
      if (!this._config.disabled) {
        this.toggle()
      }
    })

    EventHandler.on(this._menu, EVENT_CLICK, SELECTOR_ACTION, event => {
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
    DateTimePickerV2.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(DateTimePickerV2)

export default DateTimePickerV2

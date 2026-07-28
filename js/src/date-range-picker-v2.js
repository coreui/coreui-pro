/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-range-picker-v2.js
 * License (https://coreui.io/pro/license/)
 *
 * Pickers v2 prototype (workspace: plans/pickers-v2-rewrite.md): two DateInput
 * section fields + one multi-month Calendar in a Popup. The calendar owns the
 * range mechanics (start/end, auto-advance); the shell wires fields, popup,
 * and the projected footer/ranges regions. Not exported until the API review.
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import Calendar from './calendar.js'
import DateInput from './date-input.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import Popup from './util/popup.js'
import { sanitizeHtml, SVGAllowlist } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'date-range-picker-v2'
const DATA_KEY = 'coreui.date-range-picker-v2'
const EVENT_KEY = `.${DATA_KEY}`

const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY}`
const EVENT_FOCUSIN = `focusin${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY}`

const CLASS_NAME_BODY = 'date-picker-body'
const CLASS_NAME_CALENDAR = 'date-picker-calendar'
const CLASS_NAME_CALENDARS = 'date-picker-calendars'
const CLASS_NAME_DATE_PICKER = 'date-picker'
const CLASS_NAME_DATE_PICKER_V2 = 'date-picker-v2'
const CLASS_NAME_DATE_RANGE_PICKER = 'date-range-picker'
const CLASS_NAME_DROPDOWN = 'date-picker-dropdown'
const CLASS_NAME_FOOTER = 'date-picker-footer'
const CLASS_NAME_INDICATOR = 'date-picker-indicator'
const CLASS_NAME_INPUT_GROUP = 'date-picker-input-group'
const CLASS_NAME_PICKER = 'picker'
const CLASS_NAME_RANGES = 'date-picker-ranges'
const CLASS_NAME_SEPARATOR = 'date-picker-separator'
const CLASS_NAME_SHOW = 'show'

const SELECTOR_TEMPLATE_FOOTER = 'template[data-coreui-template="footer"]'
const SELECTOR_TEMPLATE_RANGES = 'template[data-coreui-template="ranges"]'
const SELECTOR_ACTION = '[data-coreui-picker-action]'

// Icons live in JavaScript, not in CSS masks — the chips pattern.
const DEFAULT_INDICATOR_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M472 96h-88V40h-32v56H160V40h-32v56H40a24.03 24.03 0 0 0-24 24v336a24.03 24.03 0 0 0 24 24h432a24.03 24.03 0 0 0 24-24V120a24.03 24.03 0 0 0-24-24Zm-8 352H48V128h80v40h32v-40h192v40h32v-40h80Z"/><rect width="32" height="32" x="112" y="224"/><rect width="32" height="32" x="200" y="224"/><rect width="32" height="32" x="280" y="224"/><rect width="32" height="32" x="368" y="224"/><rect width="32" height="32" x="112" y="296"/><rect width="32" height="32" x="200" y="296"/><rect width="32" height="32" x="280" y="296"/><rect width="32" height="32" x="368" y="296"/><rect width="32" height="32" x="112" y="368"/><rect width="32" height="32" x="200" y="368"/><rect width="32" height="32" x="280" y="368"/><rect width="32" height="32" x="368" y="368"/></svg>'
const DEFAULT_SEPARATOR_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="m359.873 121.377-22.627 22.627 95.997 95.997H16v32.001h417.24l-95.994 95.994 22.627 22.627L494.498 256z"/></svg>'

const Default = {
  allowList: SVGAllowlist,
  ariaToggleLabel: 'Toggle the calendar',
  calendarOptions: {},
  calendars: 2,
  container: false,
  disabled: false,
  endDate: null,
  endName: null,
  indicatorIcon: DEFAULT_INDICATOR_ICON,
  inputOptions: {},
  locale: navigator.language,
  maxDate: null,
  minDate: null,
  sanitize: true,
  sanitizeFn: null,
  separatorIcon: DEFAULT_SEPARATOR_ICON,
  startDate: null,
  startName: null
}

const DefaultType = {
  allowList: 'object',
  ariaToggleLabel: 'string',
  calendarOptions: 'object',
  calendars: 'number',
  container: '(string|element|boolean)',
  disabled: 'boolean',
  endDate: '(date|string|null)',
  endName: '(string|null)',
  indicatorIcon: 'string',
  inputOptions: 'object',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
  separatorIcon: 'string',
  startDate: '(date|string|null)'
}

/**
 * Class definition
 */

class DateRangePickerV2 extends BaseComponent {
  constructor(element, config) {
    super(element, config)

    this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element)
    this._rangesTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_RANGES, this._element)
    this._startInput = null
    this._endInput = null
    this._calendar = null
    this._menu = null
    this._popup = null
    this._selectEndDate = false

    this._createDateRangePicker()
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

  getStartDate() {
    return this._startInput.getDate()
  }

  getEndDate() {
    return this._endInput.getDate()
  }

  setRange(startDate, endDate) {
    this._startInput.update({ date: startDate })
    this._endInput.update({ date: endDate })
    this._selectEndDate = false
    this._calendar.update({ endDate, selectEndDate: false, startDate })
    EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, { date: startDate })
    EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, { date: endDate })
  }

  clear() {
    this.setRange(null, null)
  }

  reset() {
    this._startInput.reset()
    this._endInput.reset()
    const startDate = this._startInput.getDate()
    const endDate = this._endInput.getDate()
    this._selectEndDate = false
    this._calendar.update({ endDate, selectEndDate: false, startDate })
    EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, { date: startDate })
    EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, { date: endDate })
  }

  getContext() {
    return {
      clear: () => this.clear(),
      close: () => this.hide(),
      disabled: this._config.disabled,
      endDate: this.getEndDate(),
      reset: () => this.reset(),
      setRange: (startDate, endDate) => this.setRange(startDate, endDate),
      startDate: this.getStartDate()
    }
  }

  dispose() {
    this._popup.dispose()
    this._startInput.dispose()
    this._endInput.dispose()
    this._calendar.dispose()
    super.dispose()
  }

  // Private
  _setSelectEndDate(value) {
    if (this._selectEndDate === value) {
      return
    }

    this._selectEndDate = value
    this._calendar.update({ selectEndDate: value })
  }

  _sanitizeIcon(icon) {
    return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon
  }

  _createInput(date, name) {
    const inputEl = document.createElement('div')

    const input = new DateInput(inputEl, {
      date,
      disabled: this._config.disabled,
      locale: this._config.locale,
      maxDate: this._config.maxDate,
      minDate: this._config.minDate,
      name,
      ...this._config.inputOptions
    })

    return { input, inputEl }
  }

  _createDateRangePicker() {
    this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_DATE_PICKER_V2, CLASS_NAME_DATE_RANGE_PICKER, CLASS_NAME_PICKER)

    const inputGroup = document.createElement('div')
    inputGroup.classList.add(CLASS_NAME_INPUT_GROUP)

    const start = this._createInput(this._config.startDate, this._config.startName)
    this._startInput = start.input
    this._startInputElement = start.inputEl
    inputGroup.append(start.inputEl)

    const separator = document.createElement('span')
    separator.classList.add(CLASS_NAME_SEPARATOR)
    separator.setAttribute('aria-hidden', 'true')
    separator.innerHTML = this._sanitizeIcon(this._config.separatorIcon)
    inputGroup.append(separator)

    const end = this._createInput(this._config.endDate, this._config.endName)
    this._endInput = end.input
    this._endInputElement = end.inputEl
    inputGroup.append(end.inputEl)

    const indicator = document.createElement('button')
    indicator.classList.add(CLASS_NAME_INDICATOR)
    indicator.type = 'button'
    indicator.setAttribute('aria-label', this._config.ariaToggleLabel)
    indicator.innerHTML = this._sanitizeIcon(this._config.indicatorIcon)
    inputGroup.append(indicator)
    this._indicatorElement = indicator

    this._element.append(inputGroup)

    this._menu = document.createElement('div')
    this._menu.classList.add(CLASS_NAME_DROPDOWN)

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

    const calendarEl = document.createElement('div')
    calendarEl.classList.add(CLASS_NAME_CALENDAR)
    calendars.append(calendarEl)
    body.append(calendars)
    this._menu.append(body)

    this._calendar = new Calendar(calendarEl, {
      calendars: this._config.calendars,
      endDate: this._config.endDate,
      locale: this._config.locale,
      maxDate: this._config.maxDate,
      minDate: this._config.minDate,
      range: true,
      startDate: this._config.startDate,
      ...this._config.calendarOptions
    })

    if (this._footerTemplate) {
      const footer = document.createElement('div')
      footer.classList.add(CLASS_NAME_FOOTER)
      footer.append(this._footerTemplate.content.cloneNode(true))
      this._menu.append(footer)
    }

    this._element.append(this._menu)
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
        this._menu.classList.add(CLASS_NAME_SHOW)
        this._element.classList.add(CLASS_NAME_SHOW)
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

    EventHandler.on(this._calendar._element, 'selectEndChange.coreui.calendar', event => {
      this._selectEndDate = event.value
    })

    EventHandler.on(this._calendar._element, 'startDateChange.coreui.calendar', event => {
      const { date } = event
      this._startInput.update({ date })
      EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, { date })
    })

    EventHandler.on(this._calendar._element, 'endDateChange.coreui.calendar', event => {
      const { date } = event
      this._endInput.update({ date })
      EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, { date })

      if (date && this.getStartDate() && !this._footerTemplate) {
        this.hide()
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

export default DateRangePickerV2

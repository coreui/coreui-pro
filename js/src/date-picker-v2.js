/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-picker-v2.js
 * License (https://coreui.io/pro/license/)
 *
 * Pickers v2 prototype (workspace: plans/pickers-v2-rewrite.md). The shell is
 * a composition of existing primitives — DateInput (section field), Calendar,
 * and the Popup anchored-overlay util — instead of the v1 monolith. Projected
 * regions (footer) come from a <template> child and act through the slot
 * context, not through configuration props. Not exported from the bundle
 * until the API is reviewed.
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import Calendar from './calendar.js'
import DateInput from './date-input.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import Popup from './util/popup.js'

/**
 * Constants
 */

const NAME = 'date-picker-v2'
const DATA_KEY = 'coreui.date-picker-v2'
const EVENT_KEY = `.${DATA_KEY}`

const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`

const CLASS_NAME_BODY = 'date-picker-body'
const CLASS_NAME_CALENDAR = 'date-picker-calendar'
const CLASS_NAME_CALENDARS = 'date-picker-calendars'
const CLASS_NAME_DATE_PICKER = 'date-picker'
const CLASS_NAME_DROPDOWN = 'date-picker-dropdown'
const CLASS_NAME_FOOTER = 'date-picker-footer'
const CLASS_NAME_INDICATOR = 'date-picker-indicator'
const CLASS_NAME_INPUT_GROUP = 'date-picker-input-group'
const CLASS_NAME_PICKER = 'picker'
const CLASS_NAME_SHOW = 'show'

const SELECTOR_TEMPLATE_FOOTER = 'template[data-coreui-template="footer"]'
const SELECTOR_ACTION = '[data-coreui-picker-action]'

const Default = {
  calendarOptions: {},
  container: false,
  date: null,
  disabled: false,
  inputOptions: {},
  locale: navigator.language,
  maxDate: null,
  minDate: null,
  name: null
}

const DefaultType = {
  calendarOptions: 'object',
  container: '(string|element|boolean)',
  date: '(date|string|null)',
  disabled: 'boolean',
  inputOptions: 'object',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  name: '(string|null)'
}

/**
 * Class definition
 */

class DatePickerV2 extends BaseComponent {
  constructor(element, config) {
    super(element, config)

    this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element)
    this._input = null
    this._calendar = null
    this._menu = null
    this._popup = null

    this._createDatePicker()
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
    this._calendar.update({ startDate: date })
    EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date })
  }

  clear() {
    this._input.clear()
    this._calendar.update({ startDate: null })
    EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date: null })
  }

  reset() {
    this._input.reset()
    const date = this._input.getDate()
    this._calendar.update({ startDate: date })
    EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date })
  }

  today() {
    this.setDate(new Date())
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
    this._calendar.dispose()
    super.dispose()
  }

  // Private
  _createDatePicker() {
    this._element.classList.add(CLASS_NAME_DATE_PICKER, CLASS_NAME_PICKER)

    const inputGroup = document.createElement('div')
    inputGroup.classList.add(CLASS_NAME_INPUT_GROUP)

    const inputEl = document.createElement('div')
    inputGroup.append(inputEl)

    const indicator = document.createElement('button')
    indicator.classList.add(CLASS_NAME_INDICATOR)
    indicator.type = 'button'
    inputGroup.append(indicator)
    this._indicatorElement = indicator

    this._element.append(inputGroup)

    this._input = new DateInput(inputEl, {
      date: this._config.date,
      disabled: this._config.disabled,
      locale: this._config.locale,
      maxDate: this._config.maxDate,
      minDate: this._config.minDate,
      name: this._config.name,
      ...this._config.inputOptions
    })

    this._menu = document.createElement('div')
    this._menu.classList.add(CLASS_NAME_DROPDOWN)

    const body = document.createElement('div')
    body.classList.add(CLASS_NAME_BODY)

    const calendars = document.createElement('div')
    calendars.classList.add(CLASS_NAME_CALENDARS)

    const calendarEl = document.createElement('div')
    calendarEl.classList.add(CLASS_NAME_CALENDAR)
    calendars.append(calendarEl)
    body.append(calendars)
    this._menu.append(body)

    this._calendar = new Calendar(calendarEl, {
      locale: this._config.locale,
      maxDate: this._config.maxDate,
      minDate: this._config.minDate,
      startDate: this._config.date,
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

    EventHandler.on(this._calendar._element, 'startDateChange.coreui.calendar', event => {
      const { date } = event
      this._input.update({ date })
      EventHandler.trigger(this._element, EVENT_DATE_CHANGE, { date })
      this.hide()
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

export default DatePickerV2

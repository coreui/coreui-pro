/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-picker.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import DateRangePicker from './date-range-picker.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'date-picker'
const DATA_KEY = 'coreui.date-picker'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const TAB_KEY = 'Tab'
const RIGHT_MOUSE_BUTTON = 2

const EVENT_DATE_CHANGE = `dateChange${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_SHOW = 'show'

const SELECTOR_CALENDAR = '.calendar'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="date-picker"]:not(.disabled):not(:disabled)'
const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE}.${CLASS_NAME_SHOW}`

const Default = {
  ...DateRangePicker.Default,
  calendars: 1,
  placeholder: ['Select date'],
  range: false,
  separator: false
}

const DefaultType = {
  ...DateRangePicker.DefaultType,
  date: '(date|number|string|null)'
}

/**
 * Class definition
 */

class DatePicker extends DateRangePicker {
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

  // Overrides
  _addCalendarEventListeners() {
    super._addCalendarEventListeners()
    for (const calendar of SelectorEngine.find(SELECTOR_CALENDAR, this._element)) {
      EventHandler.on(calendar, 'startDateChange.coreui.calendar', event => {
        this._startDate = event.date
        this._startInput.value = this._setInputValue(event.date)
        this._selectEndDate = false
        this._calendar.update(this._getCalendarConfig())

        EventHandler.trigger(this._element, EVENT_DATE_CHANGE, {
          date: event.date
        })
      })
    }
  }

  // Static
  static datePickerInterface(element, config) {
    const data = DatePicker.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(config) {
    return this.each(function () {
      const data = DatePicker.getOrCreateInstance(this, config)

      if (typeof config !== 'string') {
        return
      }

      if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config](this)
    })
  }

  static clearMenus(event) {
    if (event.button === RIGHT_MOUSE_BUTTON || (event.type === 'keyup' && event.key !== TAB_KEY)) {
      return
    }

    const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN)

    for (const toggle of openToggles) {
      const context = DatePicker.getInstance(toggle)

      if (!context) {
        continue
      }

      const composedPath = event.composedPath()

      if (
        composedPath.includes(context._element)
      ) {
        continue
      }

      const relatedTarget = { relatedTarget: context._element }

      if (event.type === 'click') {
        relatedTarget.clickEvent = event
      }

      context.hide()
    }
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  const datePickers = SelectorEngine.find(SELECTOR_DATA_TOGGLE)
  for (let i = 0, len = datePickers.length; i < len; i++) {
    DatePicker.datePickerInterface(datePickers[i])
  }
})

EventHandler.on(document, EVENT_CLICK_DATA_API, DatePicker.clearMenus)
EventHandler.on(document, EVENT_KEYUP_DATA_API, DatePicker.clearMenus)

/**
 * jQuery
 */

defineJQueryPlugin(DatePicker)

export default DatePicker

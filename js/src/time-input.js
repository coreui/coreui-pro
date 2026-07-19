/**
 * --------------------------------------------------------------------------
 * CoreUI PRO time-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import SectionInput from './section-input.js'
import { convertToDateObject } from './util/calendar.js'
import { getTimeSectionsFromLocale } from './util/date-sections.js'
import { convert12hTo24h } from './util/time.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'time-input'
const DATA_KEY = 'coreui.time-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_DATA_TIME_INPUT = '[data-coreui-time-input]'

const Default = {
  ...SectionInput.Default,
  ariaLabel: 'Time input',
  seconds: false
}

const DefaultType = {
  ...SectionInput.DefaultType,
  seconds: 'boolean'
}

/**
 * Class definition
 */

class TimeInput extends SectionInput {
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

  static get CHANGE_EVENT_NAME() {
    return 'timeChange'
  }

  // Private
  _convertDate(value) {
    if (typeof value === 'string') {
      // Parse time strings without relying on `Date.parse`, whose support for
      // non-ISO strings differs between engines (e.g. Safari).
      const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(am|pm))?$/i.exec(value.trim())

      if (match) {
        const [, hour, minute, second, meridiem] = match
        const hours = meridiem ?
          convert12hTo24h(meridiem.toLowerCase(), Number.parseInt(hour, 10)) :
          Number.parseInt(hour, 10)

        return new Date(1970, 0, 1, hours, Number.parseInt(minute, 10), second ? Number.parseInt(second, 10) : 0)
      }
    }

    return convertToDateObject(value, 'day', this._config.locale, true)
  }

  _getDefaultSections(locale) {
    return getTimeSectionsFromLocale(locale, this._config.seconds)
  }

  // Static
  static jQueryInterface(config) {
    return this.each(function () {
      const data = TimeInput.getOrCreateInstance(this)

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }

        data[config]()
      }
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const timeInput of SelectorEngine.find(SELECTOR_DATA_TIME_INPUT)) {
    TimeInput.componentInterface(timeInput)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(TimeInput)

export default TimeInput

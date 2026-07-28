/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-time-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import SectionInput from './section-input.js'
import { convertToDateObject } from './util/calendar.js'
import { getDateTimeSectionsFromLocale } from './util/date-sections.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'date-time-input'
const DATA_KEY = 'coreui.date-time-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_DATA_DATE_TIME_INPUT = '[data-coreui-date-time-input]'

const Default = {
  ...SectionInput.Default,
  ariaLabel: 'Date and time input',
  seconds: false
}

const DefaultType = {
  ...SectionInput.DefaultType,
  seconds: 'boolean'
}

/**
 * Class definition
 */

class DateTimeInput extends SectionInput {
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

  // Private
  _convertDate(value) {
    const date = convertToDateObject(value, 'day', this._config.locale, true)

    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return date
    }

    if (typeof value === 'string') {
      const parsed = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
      return Number.isNaN(parsed.getTime()) ? null : parsed
    }

    return null
  }

  _getDefaultSections(locale) {
    return getDateTimeSectionsFromLocale(locale, this._config.seconds)
  }

  // Static
  static jQueryInterface(config) {
    return this.each(function () {
      const data = DateTimeInput.getOrCreateInstance(this)

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
  for (const dateTimeInput of SelectorEngine.find(SELECTOR_DATA_DATE_TIME_INPUT)) {
    DateTimeInput.componentInterface(dateTimeInput)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(DateTimeInput)

export default DateTimeInput

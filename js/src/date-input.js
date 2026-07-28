/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import SectionInput from './section-input.js'
import { getSectionsFromLocale } from './util/date-sections.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'date-input'
const DATA_KEY = 'coreui.date-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_DATA_DATE_INPUT = '[data-coreui-date-input]'

const Default = {
  ...SectionInput.Default,
  ariaLabel: 'Date input'
}

/**
 * Class definition
 */

class DateInput extends SectionInput {
  // Getters
  static get Default() {
    return Default
  }

  static get NAME() {
    return NAME
  }

  // Private
  _getDefaultSections(locale) {
    return getSectionsFromLocale(locale)
  }

  // Static
  static jQueryInterface(config) {
    return this.each(function () {
      const data = DateInput.getOrCreateInstance(this)

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
  for (const dateInput of SelectorEngine.find(SELECTOR_DATA_DATE_INPUT)) {
    DateInput.componentInterface(dateInput)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(DateInput)

export default DateInput

/**
 * --------------------------------------------------------------------------
 * CoreUI PRO time-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import SectionInput, { type SectionInputConfig } from './section-input.js'
import { convertToDateObject } from './util/calendar.js'
import { initializeOnReady } from './util/component-functions.js'
import { type DateSection, getTimeSectionsFromLocale } from './util/date-sections.js'
import { convert12hTo24h } from './util/time.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'time-input'

const SELECTOR_DATA_TIME_INPUT = '[data-coreui-time-input]'

const Default: SectionInputConfig & { seconds: boolean } = {
  ...SectionInput.Default,
  ariaLabel: 'Time input',
  seconds: false
}

const DefaultType: Record<string, string> = {
  ...SectionInput.DefaultType,
  seconds: 'boolean'
}

/**
 * Class definition
 */

class TimeInput extends SectionInput {
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

  static get CHANGE_EVENT_NAME() {
    return 'timeChange'
  }

  // Private
  override _convertDate(value: any): Date | null {
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

  override _getDefaultSections(locale: string): DateSection[] {
    return getTimeSectionsFromLocale(locale, this._config.seconds)
  }

  // Static
  static jQueryInterface(this: any, config: any): any {
    return jQueryDispatch(this, TimeInput, config)
  }
}

/**
 * Data API implementation
 */

initializeOnReady(TimeInput, SELECTOR_DATA_TIME_INPUT)

/**
 * jQuery
 */

defineJQueryPlugin(TimeInput)

export default TimeInput

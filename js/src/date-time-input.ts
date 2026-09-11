/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-time-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import SectionInput, { type SectionInputConfig } from './section-input.js'
import { convertToDateObject } from './util/calendar.js'
import { initializeOnReady } from './util/component-functions.js'
import { type DateSection, getDateTimeSectionsFromLocale } from './util/date-sections.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'date-time-input'

const SELECTOR_DATA_DATE_TIME_INPUT = '[data-coreui-date-time-input]'

const Default: SectionInputConfig & { seconds: boolean } = {
  ...SectionInput.Default,
  ariaLabel: 'Date and time input',
  seconds: false
}

const DefaultType: Record<string, string> = {
  ...SectionInput.DefaultType,
  seconds: 'boolean'
}

/**
 * Class definition
 */

class DateTimeInput extends SectionInput {
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

  // Private
  override _convertDate(value: any): Date | null {
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

  override _getDefaultSections(locale: string): DateSection[] {
    return getDateTimeSectionsFromLocale(locale, this._config.seconds)
  }

  // Static
  static jQueryInterface(this: any, config: any): any {
    return jQueryDispatch(this, DateTimeInput, config)
  }
}

/**
 * Data API implementation
 */

initializeOnReady(DateTimeInput, SELECTOR_DATA_DATE_TIME_INPUT)

/**
 * jQuery
 */

defineJQueryPlugin(DateTimeInput)

export default DateTimeInput

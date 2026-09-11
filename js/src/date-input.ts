/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import SectionInput, { type SectionInputConfig } from './section-input.js'
import { initializeOnReady } from './util/component-functions.js'
import { type DateSection, getSectionsFromLocale } from './util/date-sections.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'date-input'

const SELECTOR_DATA_DATE_INPUT = '[data-coreui-date-input]'

const Default: SectionInputConfig = {
  ...SectionInput.Default,
  ariaLabel: 'Date input'
}

/**
 * Class definition
 */

class DateInput extends SectionInput {
  // Getters
  static override get Default(): typeof Default {
    return Default
  }

  static override get NAME(): string {
    return NAME
  }

  // Private
  override _getDefaultSections(locale: string): DateSection[] {
    return getSectionsFromLocale(locale)
  }

  // Static
  static jQueryInterface(this: any, config: any): any {
    return jQueryDispatch(this, DateInput, config)
  }
}

/**
 * Data API implementation
 */

initializeOnReady(DateInput, SELECTOR_DATA_DATE_INPUT)

/**
 * jQuery
 */

defineJQueryPlugin(DateInput)

export default DateInput

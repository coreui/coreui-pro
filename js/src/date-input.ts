/**
 * --------------------------------------------------------------------------
 * CoreUI PRO date-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import SectionInput, { type SectionInputConfig } from './section-input.js'
import { convertValue, type DateSection, getSectionLayout } from './util/date-sections.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'date-input'
const DATA_KEY = 'coreui.date-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_DATA_DATE_INPUT = '[data-coreui-date-input]'

const ARIA_LABEL_DATE = 'Date input'
const ARIA_LABEL_DATE_TIME = 'Date and time input'

type DateInputConfig = SectionInputConfig & {
  seconds: boolean
  type: 'date' | 'datetime'
}

const Default: DateInputConfig = {
  ...SectionInput.Default,
  ariaLabel: ARIA_LABEL_DATE,
  seconds: false,
  type: 'date'
}

const DefaultType: Record<string, string> = {
  ...SectionInput.DefaultType,
  seconds: 'boolean',
  type: 'string'
}

/**
 * Class definition
 */

class DateInput extends SectionInput {
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
  override _getAriaLabel(): string {
    return this._config.ariaLabel === ARIA_LABEL_DATE && this._config.type === 'datetime' ?
      ARIA_LABEL_DATE_TIME :
      this._config.ariaLabel
  }

  override _convertDate(value: any): Date | null {
    return convertValue(value, this._config.type, this._config.locale)
  }

  override _getDefaultSections(locale: string): DateSection[] {
    return getSectionLayout(null, locale, null, this._config.type === 'datetime' && { seconds: this._config.seconds })
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): any {
    return jQueryDispatch(this, DateInput, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const dateInput of SelectorEngine.find(SELECTOR_DATA_DATE_INPUT)) {
    DateInput.getOrCreateInstance(dateInput)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(DateInput)

export default DateInput
export type { DateInputConfig }

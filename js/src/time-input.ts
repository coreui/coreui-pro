/**
 * --------------------------------------------------------------------------
 * CoreUI PRO time-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import SectionInput, { type SectionInputConfig } from './section-input.js'
import { convertValue, type DateSection, getTimeSectionsFromLocale } from './util/date-sections.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'time-input'
const DATA_KEY = 'coreui.time-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_DATA_TIME_INPUT = '[data-coreui-time-input]'

type TimeInputConfig = SectionInputConfig & {
  seconds: boolean
}

const Default: TimeInputConfig = {
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
    return convertValue(value, 'time', this._config.locale)
  }

  override _getDefaultSections(locale: string): DateSection[] {
    return getTimeSectionsFromLocale(locale, this._config.seconds)
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): any {
    return jQueryDispatch(this, TimeInput, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const timeInput of SelectorEngine.find(SELECTOR_DATA_TIME_INPUT)) {
    TimeInput.getOrCreateInstance(timeInput)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(TimeInput)

export default TimeInput
export type { TimeInputConfig }

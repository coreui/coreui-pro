/**
 * --------------------------------------------------------------------------
 * CoreUI PRO time-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import DateInput, { type DateInputConfig } from './date-input.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
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

type TimeInputConfig = Omit<DateInputConfig, 'type'>

const Default: DateInputConfig = {
  ...DateInput.Default,
  ariaLabel: 'Time input',
  type: 'time'
}

/**
 * Class definition
 */

class TimeInput extends DateInput<TimeInputConfig> {
  // Getters
  static override get Default(): typeof Default {
    return Default
  }

  static override get NAME(): string {
    return NAME
  }

  static override get CHANGE_EVENT_NAME(): string {
    return 'timeChange'
  }

  // Private
  override _configAfterMerge(config: DateInputConfig): DateInputConfig {
    return { ...config, type: 'time' }
  }

  override _getAriaLabel(): string {
    return this._config.ariaLabel || this.constructor.Default.ariaLabel
  }

  // Static
  static override jQueryInterface(this: any, config: any, ...args: any[]): any {
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

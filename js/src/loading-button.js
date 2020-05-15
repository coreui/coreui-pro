/**
 * --------------------------------------------------------------------------
 * CoreUI PRO (v3.1.1): button.js
 * Licensed (https://coreui.io/pro/license)
 * --------------------------------------------------------------------------
 */

import { getjQuery } from './util/index'
import Data from './dom/data'
import EventHandler from './dom/event-handler'
import SelectorEngine from './dom/selector-engine'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'loading-button'
const VERSION = '3.1.0'
const DATA_KEY = 'coreui.loading-button'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const ClassName = {
  ACTIVE: 'active',
  BUTTON_LOADING: 'btn-loading',
  FOCUS: 'focus'
}

const Selector = {
  DATA_TOGGLE_CARROT: '[data-toggle^="button"]',
  DATA_TOGGLE: '[data-toggle="buttons"]',
  INPUT: 'input:not([type="hidden"])',
  ACTIVE: '.active',
  BUTTON: '.btn-loading'
}

const Event = {
  CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
  FOCUS_DATA_API: `focus${EVENT_KEY}${DATA_API_KEY}`,
  BLUR_DATA_API: `blur${EVENT_KEY}${DATA_API_KEY}`
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class LoadingButton {
  constructor(element) {
    this._element = element
    Data.setData(element, DATA_KEY, this)
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  // Public

  toggle() {
    let triggerChangeEvent = true
    let addAriaPressed = true

    const rootElement = SelectorEngine.closest(
      this._element,
      Selector.DATA_TOGGLE
    )

    if (rootElement) {
      const input = SelectorEngine.findOne(Selector.INPUT, this._element)

      if (input && input.type === 'radio') {
        if (input.checked &&
          this._element.classList.contains(ClassName.ACTIVE)) {
          triggerChangeEvent = false
        } else {
          const activeElement = SelectorEngine.findOne(Selector.ACTIVE, rootElement)

          if (activeElement) {
            activeElement.classList.remove(ClassName.ACTIVE)
          }
        }

        if (triggerChangeEvent) {
          if (input.hasAttribute('disabled') ||
            rootElement.hasAttribute('disabled') ||
            input.classList.contains('disabled') ||
            rootElement.classList.contains('disabled')) {
            return
          }

          input.checked = !this._element.classList.contains(ClassName.ACTIVE)
          EventHandler.trigger(input, 'change')
        }

        input.focus()
        addAriaPressed = false
      }
    }

    if (addAriaPressed) {
      this._element.setAttribute('aria-pressed',
        !this._element.classList.contains(ClassName.ACTIVE))
    }

    if (triggerChangeEvent) {
      this._element.classList.toggle(ClassName.ACTIVE)
    }
  }

  dispose() {
    Data.removeData(this._element, DATA_KEY)
    this._element = null
  }

  // Static

  static jQueryInterface(config) {
    return this.each(function () {
      let data = Data.getData(this, DATA_KEY)

      if (!data) {
        data = new LoadingButton(this)
      }

      if (config === 'toggle') {
        data[config]()
      }
    })
  }

  static getInstance(element) {
    return Data.getData(element, DATA_KEY)
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

EventHandler.on(document, Event.CLICK_DATA_API, Selector.DATA_TOGGLE_CARROT, event => {
  event.preventDefault()

  let button = event.target
  if (!button.classList.contains(ClassName.BUTTON)) {
    button = SelectorEngine.closest(button, Selector.BUTTON)
  }

  let data = Data.getData(button, DATA_KEY)
  if (!data) {
    data = new LoadingButton(button)
  }

  data.toggle()
})

EventHandler.on(document, Event.FOCUS_DATA_API, Selector.DATA_TOGGLE_CARROT, event => {
  const button = SelectorEngine.closest(event.target, Selector.BUTTON)

  if (button) {
    button.classList.add(ClassName.FOCUS)
  }
})

EventHandler.on(document, Event.BLUR_DATA_API, Selector.DATA_TOGGLE_CARROT, event => {
  const button = SelectorEngine.closest(event.target, Selector.BUTTON)

  if (button) {
    button.classList.remove(ClassName.FOCUS)
  }
})

const $ = getjQuery()

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .button to jQuery only if jQuery is present
 */
/* istanbul ignore if */
if ($) {
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = LoadingButton.jQueryInterface
  $.fn[NAME].Constructor = LoadingButton

  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return LoadingButton.jQueryInterface
  }
}

export default LoadingButton

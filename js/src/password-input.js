/**
 * --------------------------------------------------------------------------
 * CoreUI PRO password-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'password-input'
const DATA_KEY = 'coreui.password-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_FORM_CONTROL = '.form-control'
const SELECTOR_DATA_TOGGLE = `${SELECTOR_FORM_CONTROL}:not([disabled]) ~ [data-coreui-toggle="password"]`

/**
 * Class definition
 */

class PasswordInput extends BaseComponent {
  // Getters
  static get NAME() {
    return NAME
  }

  // Public
  toggle() {
    this._element.type = this._element.type === 'password' ? 'text' : 'password'
  }

  // Static
  static jQueryInterface(config) {
    return this.each(function () {
      const data = PasswordInput.getOrCreateInstance(this)

      data[config](this)
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, event => {
  event.preventDefault()

  const toggler = event.target.closest(SELECTOR_DATA_TOGGLE)
  PasswordInput.getOrCreateInstance(SelectorEngine.findOne(SELECTOR_FORM_CONTROL, toggler.parentNode)).toggle()
})

/**
 * jQuery
 */

defineJQueryPlugin(PasswordInput)

export default PasswordInput

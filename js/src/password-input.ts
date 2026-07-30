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
const SELECTOR_TOGGLE = '[data-coreui-toggle="password"]'
const SELECTOR_DATA_TOGGLE = `${SELECTOR_FORM_CONTROL}:not([disabled]) ~ ${SELECTOR_TOGGLE}`

/**
 * Class definition
 */

class PasswordInput extends BaseComponent {
  // The component only ever binds to an <input>
  protected declare _element: HTMLInputElement

  // Getters
  static override get NAME(): string {
    return NAME
  }

  // Public
  toggle(): any {
    this._element.type = this._element.type === 'password' ? 'text' : 'password'
    this._updateToggleState()
  }

  // Private
  _updateToggleState(): any {
    if (!this._element.parentNode) {
      return
    }

    const toggler = SelectorEngine.findOne(SELECTOR_TOGGLE, this._element.parentNode)

    if (toggler) {
      toggler.setAttribute('aria-pressed', this._element.type === 'text' ? 'true' : 'false')
    }
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = PasswordInput.getOrCreateInstance(this)

      data[config as string](this)
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, event => {
  event.preventDefault()

  const toggler = (event.target as HTMLElement).closest(SELECTOR_DATA_TOGGLE)
  PasswordInput.getOrCreateInstance(SelectorEngine.findOne(SELECTOR_FORM_CONTROL, toggler!.parentNode as ParentNode)).toggle()
})

/**
 * jQuery
 */

defineJQueryPlugin(PasswordInput)

export default PasswordInput

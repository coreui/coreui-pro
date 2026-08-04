/**
 * --------------------------------------------------------------------------
 * CoreUI PRO password-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { PASSWORD_HIDE_ICON, PASSWORD_SHOW_ICON } from './util/icons.js'
import { sanitizeHtml, SVGAllowlist, type SanitizerAllowList } from './util/sanitizer.js'
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
const SELECTOR_DATA_INIT = `${SELECTOR_FORM_CONTROL} ~ ${SELECTOR_TOGGLE}`

interface PasswordInputConfig {
  allowList: SanitizerAllowList
  hideIcon: string
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  showIcon: string
}

const Default: PasswordInputConfig = {
  allowList: SVGAllowlist,
  hideIcon: PASSWORD_HIDE_ICON,
  sanitize: true,
  sanitizeFn: null,
  showIcon: PASSWORD_SHOW_ICON
}

const DefaultType = {
  allowList: 'object',
  hideIcon: 'string',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  showIcon: 'string'
}

/**
 * Class definition
 */

class PasswordInput extends BaseComponent {
  // The component only ever binds to an <input>
  protected declare _element: HTMLInputElement
  protected declare _config: PasswordInputConfig

  constructor(element: string | Element, config?: Partial<PasswordInputConfig>) {
    super(element, config)

    this._updateToggleState()
  }

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

  // Public
  toggle(): any {
    this._element.type = this._element.type === 'password' ? 'text' : 'password'
    this._updateToggleState()
  }

  // Private
  // The toggle reflects the input's type: the pressed state for assistive
  // technology, and the icon for everyone else. Both are written here rather
  // than authored in the markup, so the button carries no icon markup of its
  // own and an author who wants different artwork passes it as an option.
  _updateToggleState(): any {
    if (!this._element.parentNode) {
      return
    }

    const toggler = SelectorEngine.findOne(SELECTOR_TOGGLE, this._element.parentNode)

    if (!toggler) {
      return
    }

    const visible = this._element.type === 'text'

    toggler.setAttribute('aria-pressed', visible ? 'true' : 'false')
    toggler.innerHTML = this._sanitizeIcon(visible ? this._config.hideIcon : this._config.showIcon)
  }

  _sanitizeIcon(icon: string): string {
    return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon
  }

  // Static
  static _initializeDataApi(): void {
    for (const toggler of document.querySelectorAll(SELECTOR_DATA_INIT)) {
      const input = SelectorEngine.findOne(SELECTOR_FORM_CONTROL, toggler.parentNode as ParentNode)

      if (input) {
        PasswordInput.getOrCreateInstance(input)
      }
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

EventHandler.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
  PasswordInput._initializeDataApi()
})

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

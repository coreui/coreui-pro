/**
 * --------------------------------------------------------------------------
 * CoreUI password-input.js
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import {
  createControlGroupAction, ensureControlGroup, releaseControlGroup, type ControlGroup
} from './util/form-control-group.js'
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

const CLASS_NAME_ACTION = 'form-control-action'
const CLASS_NAME_PASSWORD_INPUT = 'password-input'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="password-input"]'

interface PasswordInputConfig {
  allowList: SanitizerAllowList
  ariaToggleLabel: string
  hideIcon: string
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  showIcon: string
}

const Default: PasswordInputConfig = {
  allowList: SVGAllowlist,
  ariaToggleLabel: 'Toggle password visibility',
  hideIcon: PASSWORD_HIDE_ICON,
  sanitize: true,
  sanitizeFn: null,
  showIcon: PASSWORD_SHOW_ICON
}

const DefaultType = {
  allowList: 'object',
  ariaToggleLabel: 'string',
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
  private _group: ControlGroup | null = null
  private _toggleElement: HTMLButtonElement | null = null

  constructor(element: string | Element, config?: Partial<PasswordInputConfig>) {
    super(element, config)

    this._createToggle()
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

  override dispose(): void {
    this._toggleElement?.remove()

    if (this._group) {
      this._group.element.classList.remove(CLASS_NAME_PASSWORD_INPUT)
      releaseControlGroup(this._element, this._group)
    }

    super.dispose()
  }

  // Private
  // The button is the component's, so the frame that lays it out can be too:
  // the markup is a plain form control and the author writes neither.
  _createToggle(): void {
    this._group = ensureControlGroup(this._element)
    this._group.element.classList.add(CLASS_NAME_PASSWORD_INPUT)

    this._toggleElement = createControlGroupAction({
      className: CLASS_NAME_ACTION,
      disabled: this._element.disabled,
      icon: this._config.showIcon,
      label: this._config.ariaToggleLabel,
      sanitizeIcon: (icon: string) => this._sanitizeIcon(icon)
    })

    EventHandler.on(this._toggleElement, 'click', () => this.toggle())
    this._group.element.append(this._toggleElement)
  }

  // The toggle reflects the input's type: the pressed state for assistive
  // technology, and the icon for everyone else.
  _updateToggleState(): any {
    if (!this._toggleElement) {
      return
    }

    const visible = this._element.type === 'text'

    this._toggleElement.setAttribute('aria-pressed', visible ? 'true' : 'false')
    this._toggleElement.innerHTML = this._sanitizeIcon(visible ? this._config.hideIcon : this._config.showIcon)
  }

  _sanitizeIcon(icon: string): string {
    return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon
  }

  // Static
  static _initializeDataApi(): void {
    for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) {
      PasswordInput.getOrCreateInstance(element)
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

/**
 * jQuery
 */

defineJQueryPlugin(PasswordInput)

export default PasswordInput

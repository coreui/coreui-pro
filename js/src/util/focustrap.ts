/**
 * --------------------------------------------------------------------------
 * CoreUI util/focustrap.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This is a modified version of the Bootstrap's util/focustrap.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import EventHandler, { type CoreUIEvent } from '../dom/event-handler.js'
import SelectorEngine from '../dom/selector-engine.js'
import Config from './config.js'

/**
 * Constants
 */

const NAME = 'focustrap'
const DATA_KEY = 'coreui.focustrap'
const EVENT_KEY = `.${DATA_KEY}`
const EVENT_FOCUSIN = `focusin${EVENT_KEY}`
const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY}`

const TAB_KEY = 'Tab'
const TAB_NAV_FORWARD = 'forward'
const TAB_NAV_BACKWARD = 'backward'

const Default: FocusTrapConfig = {
  additionalElement: null,
  autofocus: true,
  trapElement: null // The element to trap focus inside of
}

const DefaultType = {
  additionalElement: '(element|null|undefined)',
  autofocus: 'boolean',
  trapElement: 'element'
}

/**
 * Types
 */

type FocusTrapConfig = {
  additionalElement: HTMLElement | null
  autofocus: boolean
  trapElement: HTMLElement | null
}

/**
 * Class definition
 */

class FocusTrap extends Config {
  protected declare _config: FocusTrapConfig
  protected declare _isActive: boolean
  protected declare _lastTabNavDirection: string | null

  constructor(config?: Partial<FocusTrapConfig> | null) {
    super()
    this._config = this._getConfig(config) as FocusTrapConfig
    this._isActive = false
    this._lastTabNavDirection = null
  }

  // Getters
  static override get Default(): FocusTrapConfig {
    return Default
  }

  static override get DefaultType(): Record<string, string> {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  activate(): void {
    if (this._isActive) {
      return
    }

    if (this._config.autofocus) {
      this._config.trapElement!.focus()
    }

    EventHandler.off(document, EVENT_KEY) // guard against infinite focus loop
    EventHandler.on(document, EVENT_FOCUSIN, event => this._handleFocusin(event))
    EventHandler.on(document, EVENT_KEYDOWN_TAB, event => this._handleKeydown(event))

    this._isActive = true
  }

  deactivate(): void {
    if (!this._isActive) {
      return
    }

    this._isActive = false
    EventHandler.off(document, EVENT_KEY)
  }

  // Private
  _handleFocusin(event: CoreUIEvent): void {
    const { additionalElement, trapElement } = this._config

    if (event.target === document || event.target === trapElement || trapElement!.contains(event.target as Node)) {
      return
    }

    if (additionalElement && (event.target === additionalElement || additionalElement.contains(event.target as Node))) {
      return
    }

    const elements = SelectorEngine.focusableChildren(trapElement!)

    if (elements.length === 0) {
      trapElement!.focus()
    } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
      elements[elements.length - 1].focus()
    } else {
      elements[0].focus()
    }
  }

  _handleKeydown(event: CoreUIEvent): void {
    if (event.key !== TAB_KEY) {
      return
    }

    this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD

    const { additionalElement, trapElement } = this._config

    if (!additionalElement) {
      return
    }

    const trapElements = SelectorEngine.focusableChildren(trapElement!)
    const additionalElements = SelectorEngine.focusableChildren(additionalElement)

    if (trapElements.length === 0 || additionalElements.length === 0) {
      return
    }

    event.preventDefault()

    if (trapElements.indexOf(event.target as HTMLElement) === trapElements.length - 1 && !event.shiftKey) {
      additionalElements[0].focus()
      return
    }

    if (trapElements.indexOf(event.target as HTMLElement) === 0 && event.shiftKey) {
      additionalElements[additionalElements.length - 1].focus()
      return
    }

    if (additionalElements.indexOf(event.target as HTMLElement) === additionalElements.length - 1 && !event.shiftKey) {
      trapElements[0].focus()
      return
    }

    if (additionalElements.indexOf(event.target as HTMLElement) === 0 && event.shiftKey) {
      trapElements[trapElements.length - 1].focus()
    }
  }
}

export default FocusTrap

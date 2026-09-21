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
import { isDisabled, isVisible } from './index.js'

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

// Only the most recently activated trap reacts. Two traps over disjoint
// elements would otherwise throw focus at each other without end.
const activeTraps: FocusTrap[] = []

/**
 * Class definition
 */

class FocusTrap extends Config {
  protected declare _config: FocusTrapConfig
  protected declare _isActive: boolean
  protected declare _lastTabNavDirection: string | null
  protected declare _focusinHandler: (event: CoreUIEvent) => void
  protected declare _keydownHandler: (event: CoreUIEvent) => void

  constructor(config?: Partial<FocusTrapConfig> | null) {
    super()
    this._config = this._getConfig(config) as FocusTrapConfig
    this._isActive = false
    this._lastTabNavDirection = null
    this._focusinHandler = event => this._handleFocusin(event)
    this._keydownHandler = event => this._handleKeydown(event)
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

    EventHandler.on(document, EVENT_FOCUSIN, this._focusinHandler)
    EventHandler.on(document, EVENT_KEYDOWN_TAB, this._keydownHandler)

    activeTraps.push(this)
    this._isActive = true
  }

  deactivate(): void {
    if (!this._isActive) {
      return
    }

    this._isActive = false
    activeTraps.splice(activeTraps.indexOf(this), 1)
    EventHandler.off(document, EVENT_FOCUSIN, this._focusinHandler)
    EventHandler.off(document, EVENT_KEYDOWN_TAB, this._keydownHandler)
  }

  // Private
  _isTopmost(): boolean {
    return activeTraps[activeTraps.length - 1] === this
  }

  _handleFocusin(event: CoreUIEvent): void {
    const { additionalElement, trapElement } = this._config

    if (!this._isTopmost() || event.target === document || event.target === trapElement || trapElement!.contains(event.target as Node)) {
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

  // The additional element can be a container of focusables, or one itself.
  _focusables(element: HTMLElement): HTMLElement[] {
    const children = SelectorEngine.focusableChildren(element)
    const itself = element.tabIndex >= 0 && !isDisabled(element) && isVisible(element)

    return itself ? [element, ...children] : children
  }

  _handleKeydown(event: CoreUIEvent): void {
    if (!this._isTopmost() || event.key !== TAB_KEY) {
      return
    }

    this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD

    const { additionalElement, trapElement } = this._config
    const trapElements = SelectorEngine.focusableChildren(trapElement!)
    const additionalElements = additionalElement ? this._focusables(additionalElement) : []

    if (trapElements.length === 0) {
      return
    }

    if (additionalElements.length === 0) {
      // Tabbing off the last focusable of a trailing trap fires no focusin.
      const index = trapElements.indexOf(event.target as HTMLElement)

      if (index === trapElements.length - 1 && !event.shiftKey) {
        event.preventDefault()
        trapElements[0].focus()
      } else if (index === 0 && event.shiftKey) {
        event.preventDefault()
        trapElements[trapElements.length - 1].focus()
      }

      return
    }

    // Only the four seams between the two groups are ours to redirect. Taking
    // the event on every Tab would swallow the ones in the middle of a group —
    // preventDefault with nothing to focus leaves Tab dead, which is what a
    // calendar's navigation buttons used to run into.
    const target = event.target as HTMLElement
    const trapIndex = trapElements.indexOf(target)
    const additionalIndex = additionalElements.indexOf(target)

    const redirect = (element: HTMLElement) => {
      event.preventDefault()
      element.focus()
    }

    if (trapIndex === trapElements.length - 1 && !event.shiftKey) {
      redirect(additionalElements[0])
      return
    }

    if (trapIndex === 0 && event.shiftKey) {
      redirect(additionalElements[additionalElements.length - 1])
      return
    }

    if (additionalIndex === additionalElements.length - 1 && !event.shiftKey) {
      redirect(trapElements[0])
      return
    }

    if (additionalIndex === 0 && event.shiftKey) {
      redirect(trapElements[trapElements.length - 1])
    }
  }
}

export default FocusTrap

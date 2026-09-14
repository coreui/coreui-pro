/**
 * --------------------------------------------------------------------------
 * CoreUI util/focustrap.js
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This is a modified version of the Bootstrap's util/focustrap.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import EventHandler from '../dom/event-handler.js'
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

const Default = {
  additionalElement: null,
  autofocus: true,
  returnFocus: false,
  trapElement: null // The element to trap focus inside of
}

const DefaultType = {
  additionalElement: '(element|null|undefined)',
  autofocus: 'boolean',
  returnFocus: 'boolean',
  trapElement: 'element'
}

// Only the most recently activated trap reacts. Two traps over disjoint
// elements would otherwise throw focus at each other without end.
const activeTraps = []

/**
 * Class definition
 */

class FocusTrap extends Config {
  constructor(config) {
    super()
    this._config = this._getConfig(config)
    this._isActive = false
    this._lastTabNavDirection = null
    this._previouslyFocused = null
    this._focusinHandler = event => this._handleFocusin(event)
    this._keydownHandler = event => this._handleKeydown(event)
  }

  // Getters
  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  static get NAME() {
    return NAME
  }

  // Public
  activate() {
    if (this._isActive) {
      return
    }

    this._previouslyFocused = document.activeElement

    if (this._config.autofocus) {
      this._config.trapElement.focus()
    }

    EventHandler.on(document, EVENT_FOCUSIN, this._focusinHandler)
    EventHandler.on(document, EVENT_KEYDOWN_TAB, this._keydownHandler)

    activeTraps.push(this)
    this._isActive = true
  }

  deactivate() {
    if (!this._isActive) {
      return
    }

    this._isActive = false
    activeTraps.splice(activeTraps.indexOf(this), 1)
    EventHandler.off(document, EVENT_FOCUSIN, this._focusinHandler)
    EventHandler.off(document, EVENT_KEYDOWN_TAB, this._keydownHandler)

    if (this._config.returnFocus && this._holdsFocus()) {
      this._returnFocusTarget()?.focus()
    }

    this._previouslyFocused = null
  }

  // Private
  _handleFocusin(event) {
    const { additionalElement, trapElement } = this._config

    if (!this._isTopmost() || event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
      return
    }

    if (additionalElement && (event.target === additionalElement || additionalElement.contains(event.target))) {
      return
    }

    const elements = SelectorEngine.focusableChildren(trapElement)

    if (elements.length === 0) {
      trapElement.focus()
    } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
      elements[elements.length - 1].focus()
    } else {
      elements[0].focus()
    }
  }

  _handleKeydown(event) {
    if (!this._isTopmost() || event.key !== TAB_KEY) {
      return
    }

    this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD

    const { additionalElement, trapElement } = this._config

    if (!additionalElement) {
      return
    }

    const trapElements = SelectorEngine.focusableChildren(trapElement)
    const additionalElements = SelectorEngine.focusableChildren(additionalElement)

    if (trapElements.length === 0 || additionalElements.length === 0) {
      return
    }

    const trapIndex = trapElements.indexOf(event.target)
    const additionalIndex = additionalElements.indexOf(event.target)

    const redirect = element => {
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

  _holdsFocus() {
    const { additionalElement, trapElement } = this._config
    const active = document.activeElement

    return Boolean(
      active &&
      (active === document.body ||
        trapElement.contains(active) ||
        (additionalElement && additionalElement.contains(active)))
    )
  }

  _returnFocusTarget() {
    const previous = this._previouslyFocused

    if (previous && previous !== document.body && previous.isConnected) {
      return previous
    }

    return SelectorEngine.focusableChildren(this._config.trapElement)[0] ?? null
  }

  _isTopmost() {
    return activeTraps[activeTraps.length - 1] === this
  }
}

export default FocusTrap

/**
 * --------------------------------------------------------------------------
 * CoreUI toast.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's toast.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import EventHandler, { type CoreUIEvent } from './dom/event-handler.js'
import { enableDismissTrigger } from './util/component-functions.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'toast'
const DATA_KEY = 'coreui.toast'
const EVENT_KEY = `.${DATA_KEY}`

const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`
const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`
const EVENT_FOCUSIN = `focusin${EVENT_KEY}`
const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`

const CLASS_NAME_INSTANT = 'toast-instant'
const CLASS_NAME_SHOW = 'show'

const DefaultType = {
  autohide: 'boolean',
  delay: 'number'
}

const Default = {
  autohide: true,
  delay: 5000
}

/**
 * Types
 */

type ToastConfig = {
  autohide: boolean
  delay: number
}

/**
 * Class definition
 */

class Toast extends BaseComponent {
  protected declare _timeout: number | null
  protected declare _hasMouseInteraction: boolean
  protected declare _hasKeyboardInteraction: boolean

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._timeout = null
    this._hasMouseInteraction = false
    this._hasKeyboardInteraction = false
    this._setListeners()
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
  show(): void {
    const showEvent = EventHandler.trigger(this._element, EVENT_SHOW)

    if (showEvent!.defaultPrevented) {
      return
    }

    this._clearTimeout()

    const complete = () => {
      EventHandler.trigger(this._element, EVENT_SHOWN)

      this._maybeScheduleHide()
    }

    this._element.classList.add(CLASS_NAME_SHOW)

    this._queueCallback(complete, this._element, this._isAnimated())
  }

  hide(): void {
    if (!this.isShown()) {
      return
    }

    const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE)

    if (hideEvent!.defaultPrevented) {
      return
    }

    const complete = () => {
      EventHandler.trigger(this._element, EVENT_HIDDEN)
    }

    // Removing .show starts the fade-out. The discrete `display` transition
    // keeps the toast laid out until the fade finishes.
    this._element.classList.remove(CLASS_NAME_SHOW)
    this._queueCallback(complete, this._element, this._isAnimated())
  }

  override dispose(): void {
    this._clearTimeout()

    if (this.isShown()) {
      this._element.classList.remove(CLASS_NAME_SHOW)
    }

    super.dispose()
  }

  isShown(): boolean {
    return this._element.classList.contains(CLASS_NAME_SHOW)
  }

  // Private
  _isAnimated(): boolean {
    return !this._element.classList.contains(CLASS_NAME_INSTANT)
  }

  _maybeScheduleHide(): void {
    if (!this._config.autohide) {
      return
    }

    if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
      return
    }

    this._timeout = setTimeout(() => {
      this.hide()
    }, this._config.delay)
  }

  _onInteraction(event: CoreUIEvent, isInteracting: boolean): void {
    switch (event.type) {
      case 'mouseover':
      case 'mouseout': {
        this._hasMouseInteraction = isInteracting
        break
      }

      case 'focusin':
      case 'focusout': {
        this._hasKeyboardInteraction = isInteracting
        break
      }

      default: {
        break
      }
    }

    if (isInteracting) {
      this._clearTimeout()
      return
    }

    const nextElement = event.relatedTarget
    if (this._element === nextElement || this._element.contains(nextElement)) {
      return
    }

    this._maybeScheduleHide()
  }

  _setListeners(): void {
    EventHandler.on(this._element, EVENT_MOUSEOVER, event => this._onInteraction(event, true))
    EventHandler.on(this._element, EVENT_MOUSEOUT, event => this._onInteraction(event, false))
    EventHandler.on(this._element, EVENT_FOCUSIN, event => this._onInteraction(event, true))
    EventHandler.on(this._element, EVENT_FOCUSOUT, event => this._onInteraction(event, false))
  }

  _clearTimeout(): void {
    clearTimeout(this._timeout!)
    this._timeout = null
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Toast.getOrCreateInstance(this, config)

      if (typeof config === 'string') {
        if (typeof data[config as string] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }

        data[config as string](this)
      }
    })
  }
}

/**
 * Data API implementation
 */

enableDismissTrigger(Toast)

/**
 * jQuery
 */

defineJQueryPlugin(Toast)

export default Toast
export type { ToastConfig }

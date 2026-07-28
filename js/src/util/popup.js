/**
 * --------------------------------------------------------------------------
 * CoreUI PRO util/popup.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import {
  autoUpdate, computePosition, flip, offset, shift
} from '@floating-ui/dom'
import EventHandler from '../dom/event-handler.js'
import Config from './config.js'
import FocusTrap from './focustrap.js'
import { execute, getElement, isRTL } from './index.js'

/**
 * Constants
 */

const NAME = 'popup'
const DATA_KEY = 'coreui.popup'
const EVENT_KEY = `.${DATA_KEY}`

const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`

const ESCAPE_KEY = 'Escape'

const Default = {
  anchor: null,
  container: false,
  content: null,
  fallbackPlacements: null, // null → mirror of placement via flip()
  focusTrap: true,
  mobileBreakpoint: 768,
  offset: [0, 2],
  onHidden: null,
  onHide: null,
  onShow: null,
  onShown: null,
  placement: 'bottom-start',
  returnFocus: true
}

const DefaultType = {
  anchor: 'element',
  container: '(string|element|boolean)',
  content: 'element',
  fallbackPlacements: '(array|null)',
  focusTrap: 'boolean',
  mobileBreakpoint: 'number',
  offset: 'array',
  onHidden: '(function|null)',
  onHide: '(function|null)',
  onShow: '(function|null)',
  onShown: '(function|null)',
  placement: 'string',
  returnFocus: 'boolean'
}

/**
 * Class definition
 *
 * Anchored-overlay primitive shared by the picker shells (and, over time,
 * autocomplete / multi-select / dropdown). Owns exactly four concerns:
 * positioning (Floating UI), container teleport, focus containment across the
 * anchor/content split, and dismissal (outside click, Escape, return focus).
 * Lifecycle notifications are callbacks — public events belong to the owning
 * component, so the primitive never emits on its own.
 */

class Popup extends Config {
  constructor(config) {
    super()
    this._config = this._getConfig(config)
    this._anchor = this._config.anchor
    this._content = this._config.content
    this._container = this._config.container ? getElement(this._config.container) : null
    this._cleanupAutoUpdate = null
    this._isShown = false
    this._previouslyFocused = null
    this._clickListener = null
    this._keydownListener = null
    this._focustrap = this._config.focusTrap ?
      new FocusTrap({
        additionalElement: this._container ? this._content : null,
        trapElement: this._anchor
      }) :
      null
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

  get isShown() {
    return this._isShown
  }

  get isMobile() {
    return window.matchMedia(`(max-width: ${this._config.mobileBreakpoint - 1}px)`).matches
  }

  // Public
  show() {
    if (this._isShown) {
      return
    }

    execute(this._config.onShow)
    this._isShown = true
    this._previouslyFocused = document.activeElement

    if (this._container) {
      this._container.append(this._content)
    }

    if (!this.isMobile) {
      this._startPositioning()
    }

    this._addDismissListeners()

    if (this._focustrap) {
      this._focustrap.activate()
    }

    execute(this._config.onShown)
  }

  hide() {
    if (!this._isShown) {
      return
    }

    execute(this._config.onHide)
    this._isShown = false
    this._stopPositioning()
    this._removeDismissListeners()

    if (this._focustrap) {
      this._focustrap.deactivate()
    }

    if (this._config.returnFocus && this._previouslyFocused) {
      this._previouslyFocused.focus()
      this._previouslyFocused = null
    }

    execute(this._config.onHidden)
  }

  toggle() {
    return this._isShown ? this.hide() : this.show()
  }

  update() {
    if (this._isShown && !this.isMobile) {
      this._updatePosition()
    }
  }

  dispose() {
    this.hide()
    this._focustrap = null
    this._anchor = null
    this._content = null
    this._container = null
  }

  // Private
  _startPositioning() {
    this._cleanupAutoUpdate = autoUpdate(this._anchor, this._content, () => this._updatePosition())
  }

  _stopPositioning() {
    if (this._cleanupAutoUpdate) {
      this._cleanupAutoUpdate()
      this._cleanupAutoUpdate = null
    }
  }

  _updatePosition() {
    const [skidding, distance] = this._config.offset
    const middleware = [
      offset({ crossAxis: skidding, mainAxis: distance }),
      flip(this._config.fallbackPlacements ? { fallbackPlacements: this._config.fallbackPlacements } : {}),
      shift()
    ]

    computePosition(this._anchor, this._content, {
      middleware,
      placement: this._resolvePlacement(),
      strategy: 'absolute'
    }).then(({ x, y }) => {
      Object.assign(this._content.style, {
        insetInlineStart: '0',
        left: `${x}px`,
        position: 'absolute',
        top: `${y}px`
      })
    })
  }

  _resolvePlacement() {
    const { placement } = this._config
    if (!isRTL()) {
      return placement
    }

    return placement.endsWith('-start') ?
      placement.replace('-start', '-end') :
      (placement.endsWith('-end') ? placement.replace('-end', '-start') : placement)
  }

  _addDismissListeners() {
    this._clickListener = event => {
      const { target } = event
      if (this._anchor.contains(target) || this._content.contains(target)) {
        return
      }

      this.hide()
    }

    this._keydownListener = event => {
      if (event.key === ESCAPE_KEY) {
        this.hide()
      }
    }

    EventHandler.on(document, EVENT_CLICK, this._clickListener)
    EventHandler.on(document, EVENT_KEYDOWN, this._keydownListener)
  }

  _removeDismissListeners() {
    EventHandler.off(document, EVENT_CLICK, this._clickListener)
    EventHandler.off(document, EVENT_KEYDOWN, this._keydownListener)
    this._clickListener = null
    this._keydownListener = null
  }
}

export default Popup

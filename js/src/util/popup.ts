/**
 * --------------------------------------------------------------------------
 * CoreUI PRO util/popup.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import {
  autoUpdate, computePosition, flip, offset, type Placement, shift
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

type PopupConfig = {
  anchor: HTMLElement | null
  container: Element | boolean | string
  content: HTMLElement | null
  fallbackPlacements: Placement[] | null
  focusTrap: boolean
  mobileBreakpoint: number
  offset: [number, number]
  onHidden: (() => void) | null
  onHide: (() => void) | null
  onShow: (() => void) | null
  onShown: (() => void) | null
  placement: string
  returnFocus: boolean
  topLayer: boolean
}

const Default: PopupConfig = {
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
  returnFocus: true,
  topLayer: true
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
  returnFocus: 'boolean',
  topLayer: 'boolean'
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
  protected declare _anchor: HTMLElement | null
  protected declare _content: HTMLElement | null
  protected declare _container: HTMLElement | null
  protected declare _cleanupAutoUpdate: (() => void) | null
  protected declare _isShown: boolean
  protected declare _previouslyFocused: HTMLElement | null
  protected declare _clickListener: any
  protected declare _keydownListener: any
  protected declare _focustrap: any
  protected declare _config: PopupConfig

  constructor(config?: Partial<PopupConfig> | null) {
    super()
    this._config = this._getConfig(config) as PopupConfig
    this._anchor = this._config.anchor as HTMLElement | null
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
  static override get Default(): typeof Default {
    return Default
  }

  static override get DefaultType(): typeof DefaultType {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  get isShown(): any {
    return this._isShown
  }

  get isMobile(): any {
    return window.matchMedia(`(max-width: ${this._config.mobileBreakpoint - 1}px)`).matches
  }

  // Public
  show(): void {
    if (this._isShown) {
      return
    }

    execute(this._config.onShow)
    this._isShown = true
    this._previouslyFocused = document.activeElement as HTMLElement | null

    if (this._container) {
      this._container.append(this._content!)
    }

    this._showPopover()

    if (!this.isMobile) {
      this._startPositioning()
    }

    this._addDismissListeners()

    if (this._focustrap) {
      this._focustrap.activate()
    }

    execute(this._config.onShown)
  }

  hide(): any {
    if (!this._isShown) {
      return
    }

    execute(this._config.onHide)
    this._isShown = false
    this._stopPositioning()
    this._hidePopover()
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

  toggle(): any {
    return this._isShown ? this.hide() : this.show()
  }

  update(): void {
    if (this._isShown && !this.isMobile) {
      this._updatePosition()
    }
  }

  dispose(): void {
    this.hide()
    this._focustrap = null
    this._anchor = null as HTMLElement | null
    this._content = null
    this._container = null
  }

  // Private

  // Promote the surface to the top layer with the Popover API. `manual` (not
  // `auto`) because the popup owns its own dismissal: light dismiss would race
  // our click/keydown listeners and bypass `returnFocus`.
  _showPopover(): void {
    if (!this._config.topLayer || !this._supportsPopover()) {
      return
    }

    this._content!.setAttribute('popover', 'manual')

    if (!this._content!.matches(':popover-open')) {
      this._content!.showPopover()
    }
  }

  _hidePopover(): void {
    if (!this._config.topLayer || !this._supportsPopover() || !this._content) {
      return
    }

    if (this._content.matches(':popover-open')) {
      this._content.hidePopover()
    }

    this._content.removeAttribute('popover')
  }

  _supportsPopover(): boolean {
    return typeof this._content?.showPopover === 'function'
  }

  _isInTopLayer(): boolean {
    return Boolean(this._content?.matches(':popover-open'))
  }

  _startPositioning(): void {
    // A top-layer panel is `position: fixed`, so it no longer scrolls with the
    // content the way an absolutely positioned one did — every frame has to be
    // caught up in JS. Scroll events alone lag behind compositor-driven
    // scrolling (the panel visibly drifts, then snaps back), so the top layer
    // pays for a per-frame loop; the in-flow path keeps the cheap listeners.
    this._cleanupAutoUpdate = autoUpdate(
      this._anchor!,
      this._content,
      () => this._updatePosition(),
      { animationFrame: this._isInTopLayer() }
    )
  }

  _stopPositioning(): void {
    if (this._cleanupAutoUpdate) {
      this._cleanupAutoUpdate()
      this._cleanupAutoUpdate = null
    }
  }

  _updatePosition(): any {
    const [skidding, distance] = this._config.offset
    const middleware = [
      offset({ crossAxis: skidding, mainAxis: distance }),
      flip(this._config.fallbackPlacements ? { fallbackPlacements: this._config.fallbackPlacements } : {}),
      shift()
    ]

    // A top-layer element's containing block is the viewport, so it has no
    // offsetParent to measure against — `absolute` would resolve the
    // coordinates against the wrong origin.
    const strategy = this._isInTopLayer() ? 'fixed' : 'absolute'

    computePosition(this._anchor!, this._content!, {
      middleware,
      placement: this._resolvePlacement() as any,
      strategy
    }).then(({ x, y }) => {
      // dispose() can null the content while computePosition is in flight
      if (!this._content || !this._content.isConnected) {
        return
      }

      Object.assign(this._content.style, {
        insetInlineStart: '0',
        left: `${x}px`,
        position: strategy,
        top: `${y}px`
      })
    })
  }

  _resolvePlacement(): any {
    const { placement } = this._config
    if (!isRTL()) {
      return placement
    }

    return placement.endsWith('-start') ?
      placement.replace('-start', '-end') :
      (placement.endsWith('-end') ? placement.replace('-end', '-start') : placement)
  }

  _addDismissListeners(): void {
    this._clickListener = (event: Event) => {
      // composedPath, not contains(): the click may re-render part of the
      // content (calendar navigation) and detach the target before the event
      // reaches document — the dispatch-time path still holds the ancestors
      const path = event.composedPath()
      if (path.includes(this._anchor!) || path.includes(this._content!)) {
        return
      }

      this.hide()
    }

    this._keydownListener = (event: KeyboardEvent) => {
      if (event.key === ESCAPE_KEY) {
        this.hide()
      }
    }

    EventHandler.on(document, EVENT_CLICK, this._clickListener)
    EventHandler.on(document, EVENT_KEYDOWN, this._keydownListener)
  }

  _removeDismissListeners(): void {
    EventHandler.off(document, EVENT_CLICK, this._clickListener)
    EventHandler.off(document, EVENT_KEYDOWN, this._keydownListener)
    this._clickListener = null
    this._keydownListener = null
  }
}

export default Popup
export type { PopupConfig }

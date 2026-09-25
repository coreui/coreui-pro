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
import SelectorEngine from '../dom/selector-engine.js'
import Config from './config.js'
import FocusTrap from './focustrap.js'
import {
  execute, getElement, getTransitionDurationFromElement
} from './index.js'

/**
 * Constants
 */

const NAME = 'popup'
const DATA_KEY = 'coreui.popup'
const EVENT_KEY = `.${DATA_KEY}`

const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`

const ESCAPE_KEY = 'Escape'
const ARROW_DOWN_KEY = 'ArrowDown'

type PopupConfig = {
  anchor: HTMLElement | null
  container: Element | boolean | string
  content: HTMLElement | null
  fallbackPlacements: Placement[] | null
  focusTrap: boolean
  mobileBreakpoint: number
  offset: [number, number]
  onBeforeHide: (() => boolean | void) | null
  onBeforeShow: (() => boolean | void) | null
  onHidden: (() => void) | null
  onHide: (() => void) | null
  onShow: (() => void) | null
  onShown: (() => void) | null
  placement: Placement
  returnFocus: boolean
}

const Default: PopupConfig = {
  anchor: null,
  container: false,
  content: null,
  fallbackPlacements: null,
  focusTrap: true,
  mobileBreakpoint: 768,
  offset: [0, 2],
  onBeforeHide: null,
  onBeforeShow: null,
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
  onBeforeHide: '(null|function)',
  onBeforeShow: '(null|function)',
  onHidden: '(function|null)',
  onHide: '(function|null)',
  onShow: '(function|null)',
  onShown: '(function|null)',
  placement: 'string',
  returnFocus: 'boolean'
}

const hasConstrainingAncestor = (anchor: HTMLElement | null, boundary: HTMLElement = document.body): boolean => {
  let node = anchor?.parentElement

  while (node && node !== boundary && node !== document.body && node !== document.documentElement) {
    const styles = getComputedStyle(node)

    if (
      styles.overflow !== 'visible' ||
      styles.transform !== 'none' ||
      styles.filter !== 'none' ||
      styles.perspective !== 'none' ||
      styles.contain.includes('paint') ||
      styles.willChange.includes('transform')
    ) {
      return true
    }

    node = node.parentElement
  }

  return false
}

/**
 * Picks where a panel opens, never outside an open dialog, which is modal.
 *
 * @param anchor - The element the panel opens from
 * @param explicitContainer - The configured container
 * @returns The element to append to, or `null` to stay by the anchor
 */
const resolvePopupContainer = (anchor: HTMLElement | null, explicitContainer: HTMLElement | null = null): HTMLElement | null => {
  const dialog = anchor?.closest('dialog[open]') as HTMLElement | null

  if (explicitContainer) {
    return dialog && !dialog.contains(explicitContainer) ? dialog : explicitContainer
  }

  if (dialog) {
    return hasConstrainingAncestor(anchor, dialog) ? dialog : null
  }

  return hasConstrainingAncestor(anchor) ? document.body : null
}

/**
 * Class definition
 */

class Popup extends Config {
  protected declare _anchor: HTMLElement | null
  protected declare _content: HTMLElement | null
  protected declare _container: HTMLElement | null
  protected declare _cleanupAutoUpdate: (() => void) | null
  protected declare _isShown: boolean
  protected declare _transition: number
  protected declare _hiding: boolean
  protected declare _previouslyFocused: HTMLElement | null
  protected declare _pointerdownListener: any
  protected declare _keydownListener: any
  protected declare _contentKeydownListener: any
  protected declare _anchorKeydownListener: any
  protected declare _focustrap: FocusTrap | null
  protected declare _revealPending: boolean
  protected declare _config: PopupConfig

  constructor(config?: Partial<PopupConfig> | null) {
    super()
    this._config = this._getConfig(config) as PopupConfig
    this._anchor = this._config.anchor as HTMLElement | null
    this._content = this._config.content
    this._container = this._config.container ? getElement(this._config.container) : null
    this._cleanupAutoUpdate = null
    this._isShown = false
    this._transition = 0
    this._hiding = false
    this._previouslyFocused = null
    this._pointerdownListener = null
    this._keydownListener = null
    this._contentKeydownListener = null
    this._anchorKeydownListener = null
    this._revealPending = false
    this._focustrap = this._config.focusTrap ?
      new FocusTrap({
        autofocus: false,
        trapElement: this._content
      }) :
      null

    this._addAnchorKeydownListener()
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

  get isShown(): boolean {
    return this._isShown
  }

  get isMobile(): boolean {
    return window.matchMedia(`(max-width: ${this._config.mobileBreakpoint - 1}px)`).matches
  }

  // Public
  show(): void {
    if (this._isShown || execute(this._config.onBeforeShow) === false) {
      return
    }

    this._isShown = true
    this._hiding = false
    const transition = ++this._transition
    this._previouslyFocused = document.activeElement as HTMLElement | null

    this._mount()

    execute(this._config.onShow)

    if (this.isMobile) {
      Object.assign(this._content!.style, { left: '', position: '', top: '' })
    } else {
      this._startPositioning()
    }

    this._addDismissListeners()

    if (this._focustrap) {
      this._focustrap.activate()
    }

    this._focusPanel()

    if (this.isMobile) {
      this._revealEntry()
    }

    this._afterTransition(transition, () => execute(this._config.onShown))
  }

  hide(): void {
    if (!this._isShown || execute(this._config.onBeforeHide) === false) {
      return
    }

    this._hide()
  }

  _hide(): void {
    execute(this._config.onHide)
    this._isShown = false
    this._revealPending = false
    this._hiding = true
    const transition = ++this._transition
    this._stopPositioning()
    this._removeDismissListeners()

    if (this._focustrap) {
      this._focustrap.deactivate()
    }

    if (this._config.returnFocus && this._holdsFocus()) {
      this._returnFocusTarget()?.focus()
    }

    this._previouslyFocused = null

    this._afterTransition(transition, () => {
      this._hiding = false
      this._unmount()
      execute(this._config.onHidden)
    })
  }

  toggle(): void {
    return this._isShown ? this.hide() : this.show()
  }

  update(): void {
    if (this._isShown && !this.isMobile) {
      this._updatePosition()
    }
  }

  dispose(): void {
    const owesHidden = this._isShown || this._hiding

    if (this._isShown) {
      this._hide()
    }

    this._transition++
    this._hiding = false
    this._unmount()

    if (owesHidden) {
      execute(this._config.onHidden)
    }

    if (this._anchorKeydownListener) {
      EventHandler.off(this._anchor!, EVENT_KEYDOWN, this._anchorKeydownListener)
      this._anchorKeydownListener = null
    }

    this._focustrap = null
    this._anchor = null as HTMLElement | null
    this._content = null
    this._container = null
  }

  // Private

  _mount(): void {
    if (!this._content) {
      return
    }

    if (this._config.focusTrap) {
      this._content.setAttribute('role', 'dialog')
      this._content.setAttribute('aria-modal', 'true')
    }

    const container = this._resolveContainer()

    if (container) {
      container.append(this._content)
      return
    }

    this._anchor?.after(this._content)
  }

  _holdsFocus(): boolean {
    const active = document.activeElement
    return Boolean(active && (active === document.body || this._content?.contains(active)))
  }

  _returnFocusTarget(): HTMLElement | null {
    if (this._previouslyFocused?.isConnected) {
      return this._previouslyFocused
    }

    return this._anchor ? SelectorEngine.focusableChildren(this._anchor)[0] ?? null : null
  }

  _afterTransition(transition: number, callback: () => void): void {
    const content = this._content!
    let settled = false

    const settle = () => {
      if (settled) {
        return
      }

      settled = true
      content.removeEventListener('transitionend', onTransitionEnd)

      if (transition === this._transition) {
        callback()
      }
    }

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === content && event.propertyName === 'opacity') {
        settle()
      }
    }

    content.addEventListener('transitionend', onTransitionEnd)
    setTimeout(settle, getTransitionDurationFromElement(content) + 5)
  }

  _unmount(): void {
    if (!this._isShown) {
      this._content?.remove()
    }
  }

  _resolveContainer(): HTMLElement | null {
    return resolvePopupContainer(this._anchor, this._container)
  }

  _startPositioning(): void {
    this._cleanupAutoUpdate = autoUpdate(this._anchor!, this._content, () => this._updatePosition())
  }

  _stopPositioning(): void {
    if (this._cleanupAutoUpdate) {
      this._cleanupAutoUpdate()
      this._cleanupAutoUpdate = null
    }
  }

  _updatePosition(): void {
    const [skidding, distance] = this._config.offset
    const middleware = [
      offset({ crossAxis: skidding, mainAxis: distance }),
      flip(this._config.fallbackPlacements ? { fallbackPlacements: this._config.fallbackPlacements } : {}),
      shift()
    ]

    computePosition(this._anchor!, this._content!, {
      middleware,
      placement: this._config.placement,
      strategy: 'absolute'
    }).then(({ x, y }) => {
      if (!this._content || !this._content.isConnected) {
        return
      }

      Object.assign(this._content.style, {
        left: `${x}px`,
        position: 'absolute',
        top: `${y}px`
      })

      this._revealEntry()
    })
  }

  _addAnchorKeydownListener(): void {
    if (!this._anchor) {
      return
    }

    this._anchorKeydownListener = (event: KeyboardEvent) => {
      const opensPanel = event.key === 'F4' || (event.altKey && event.key === ARROW_DOWN_KEY)

      if (!opensPanel || this._isShown) {
        return
      }

      event.preventDefault()
      this.show()
    }

    EventHandler.on(this._anchor, EVENT_KEYDOWN, this._anchorKeydownListener)
  }

  _focusPanel(): void {
    if (!this._content) {
      return
    }

    const current = SelectorEngine.findOne('[aria-current="date"]', this._content) as HTMLElement | null
    const today = current?.closest('[aria-disabled="true"]') ? null : current

    const entry =
      SelectorEngine.findOne('[aria-selected="true"]', this._content) as HTMLElement | null ??
      (today?.closest('[tabindex]') as HTMLElement | null) ??
      SelectorEngine.findOne('[tabindex="0"]', this._content) as HTMLElement | null ??
      SelectorEngine.focusableChildren(this._content)[0]

    entry?.focus({ preventScroll: true })
    this._revealPending = Boolean(entry)
  }

  _revealEntry(): void {
    if (!this._revealPending) {
      return
    }

    this._revealPending = false
    const active = document.activeElement

    if (active instanceof HTMLElement && this._content?.contains(active)) {
      active.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }

  _addDismissListeners(): void {
    this._pointerdownListener = (event: Event) => {
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

    this._contentKeydownListener = (event: KeyboardEvent) => {
      if (event.key === ESCAPE_KEY) {
        event.preventDefault()
        event.stopPropagation()
        this.hide()
      }
    }

    EventHandler.on(document, EVENT_POINTERDOWN, this._pointerdownListener)
    EventHandler.on(document, EVENT_KEYDOWN, this._keydownListener)
    EventHandler.on(this._content!, EVENT_KEYDOWN, this._contentKeydownListener)
    EventHandler.on(this._anchor!, EVENT_KEYDOWN, this._contentKeydownListener)
  }

  _removeDismissListeners(): void {
    EventHandler.off(document, EVENT_POINTERDOWN, this._pointerdownListener)
    EventHandler.off(document, EVENT_KEYDOWN, this._keydownListener)
    EventHandler.off(this._content, EVENT_KEYDOWN, this._contentKeydownListener)
    EventHandler.off(this._anchor, EVENT_KEYDOWN, this._contentKeydownListener)
    this._pointerdownListener = null
    this._keydownListener = null
    this._contentKeydownListener = null
  }
}

export default Popup
export { resolvePopupContainer }
export type { PopupConfig }

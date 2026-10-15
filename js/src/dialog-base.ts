/**
 * --------------------------------------------------------------------------
 * CoreUI dialog-base.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's dialog-base.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import Data from './dom/data.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { holdAnnouncements } from './util/announce.js'
import { unwrapLegacyShell } from './util/legacy-markup.js'

/**
 * Constants
 */

const CLASS_NAME_OPEN = 'dialog-open'
const CLASS_NAME_HIDING = 'hiding'

const SELECTOR_NAVBAR_EXPAND = '.navbar[class*="navbar-expand"]'

const POPUP_DATA_KEYS = [
  'coreui.autocomplete',
  'coreui.combobox',
  'coreui.context-menu',
  'coreui.date-picker',
  'coreui.date-range-picker',
  'coreui.dropdown',
  'coreui.menu',
  'coreui.multi-select',
  'coreui.time-picker'
]

/**
 * Class definition
 *
 * Shared base class for the Modal and Offcanvas components, built on the
 * native <dialog> element. Provides the show/hide/toggle lifecycle with
 * events, opening via showModal()/show(), Escape handling for modal and
 * non-modal states, backdrop-click dismissal, the static-backdrop "bounce",
 * body scroll prevention, and child component cleanup.
 */

class DialogBase<C extends ComponentConfig = ComponentConfig> extends BaseComponent {
  protected declare _element: HTMLDialogElement
  protected declare _isTransitioning: boolean
  protected declare _openedAsModal: boolean
  protected declare _closedByComponent: boolean
  protected declare _hiddenByComponent: boolean
  protected declare _cancelHandler: (event: Event) => void
  protected declare _closeHandler: (event: Event) => void
  protected declare _resizeObserver: ResizeObserver | null
  protected declare _resizeFrame: number | null

  constructor(element?: string | Element | null, config?: Partial<C> | null) {
    super(element, config)

    this._isTransitioning = false
    this._openedAsModal = false
    this._closedByComponent = false
    this._hiddenByComponent = !this._element?.open
    this._resizeObserver = null
    this._resizeFrame = null
    this._addDialogListeners()
  }

  // Getters
  static override get NAME(): string {
    return 'dialogbase'
  }

  // A consumer may still hold a reference to the pre-migration legacy element
  // (now the shell around the <dialog>) — resolve lookups through it.
  static override getInstance(element?: string | Element | null): any {
    return super.getInstance(unwrapLegacyShell(element, this.NAME))
  }

  // Public
  toggle(relatedTarget?: HTMLElement | null): Promise<void> {
    return this._element.open ? this.hide() : this.show(relatedTarget)
  }

  async show(relatedTarget?: HTMLElement | null): Promise<void> {
    if (!this._canShow(relatedTarget)) {
      return
    }

    await this._show(relatedTarget)
  }

  async hide(): Promise<void> {
    if (!this._canHide()) {
      return
    }

    await this._hide()
  }

  // Protected — lifecycle stages

  protected _canShow(relatedTarget?: HTMLElement | null): boolean {
    if (this._element.open || this._isTransitioning) {
      return false
    }

    const showEvent = EventHandler.trigger(this._element, this.constructor.eventName('show'), { relatedTarget })

    return !showEvent.defaultPrevented
  }

  protected async _show(relatedTarget?: HTMLElement | null): Promise<void> {
    this._isTransitioning = true
    this._hiddenByComponent = false
    this._onBeforeShow()

    const { modal, preventBodyScroll } = this._getShowOptions()
    this._showElement({ modal, preventBodyScroll })

    await this._queueCallback(() => {
      this._isTransitioning = false
      EventHandler.trigger(this._element, this.constructor.eventName('shown'), { relatedTarget })
    }, this._element, this._isAnimated())
  }

  protected _canHide(): boolean {
    if (!this._element.open || this._isTransitioning) {
      return false
    }

    const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName('hide'))

    return !hideEvent.defaultPrevented
  }

  protected async _hide(): Promise<void> {
    this._isTransitioning = true
    this._hiddenByComponent = true
    this._hideElement()

    await this._queueCallback(() => {
      // For subclasses that defer close() until the exit transition ends
      // (so the dialog stays in the top layer with its ::backdrop), close()
      // happens here instead of in _hideElement(). It runs unconditionally:
      // _closeAndCleanup() is a no-op on an already-closed dialog, and skipping
      // it when something else closed the dialog during the exit (app code,
      // a <form method="dialog"> submit) would leave scroll prevention
      // (dialog-open) stuck on the root element.
      this._closeAndCleanup()

      this._finishHide()
    }, this._element, this._isAnimated())
  }

  override dispose(): void {
    this._resizeObserver?.disconnect()

    if (this._resizeFrame !== null) {
      cancelAnimationFrame(this._resizeFrame)
    }

    // Disposed while still open (e.g. an SPA tearing the component down
    // mid-navigation): close the native <dialog> and restore body scroll, or
    // `dialog-open` (overflow: hidden) stays stuck on the root element.
    if (this._element.open) {
      this._closeAndCleanup()
    }

    // `_queueCallback` skips its completion callback once the instance is
    // disposed, so nothing else would clear the exit state. A stranded
    // `.hiding` suppresses the `[open]:not(.hiding)` open state, which would
    // leave a later instance on the same element showing an invisible dialog.
    this._element.classList.remove(CLASS_NAME_HIDING)

    // The `cancel` and `close` listeners are unnamespaced, so super.dispose()'s
    // EVENT_KEY teardown misses them.
    EventHandler.off(this._element, 'cancel', this._cancelHandler)
    EventHandler.off(this._element, 'close', this._closeHandler)

    super.dispose()
  }

  // Protected — hooks for subclasses to override

  protected _getShowOptions(): { modal: boolean, preventBodyScroll: boolean } {
    return { modal: true, preventBodyScroll: true }
  }

  protected _onBeforeShow(): void {}

  protected _onAfterHide(): void {}

  protected _onCancel(): void {}

  protected _isAnimated(): boolean {
    return !this._element.classList.contains(`${this.constructor.NAME}-instant`)
  }

  // Hook: return true to keep the dialog in the top layer (i.e. delay close())
  // until the exit transition completes. Modal overrides this for animated
  // dialogs — close() strips the native centering and the ::backdrop
  // synchronously, which would make the exit animation appear to skip.
  protected _shouldDeferClose(): boolean {
    return false
  }

  // Protected — shared mechanics

  protected _showElement({ modal = true, preventBodyScroll = true }: { modal?: boolean, preventBodyScroll?: boolean } = {}): void {
    this._openedAsModal = modal

    // `backdrop: false` still opens modally (focus trap, inert background),
    // only the ::backdrop is visually suppressed.
    this._element.classList.toggle(`${this.constructor.NAME}-no-backdrop`, modal && !this._config.backdrop)

    if (modal) {
      this._element.showModal()
    } else {
      this._element.show()
    }

    if (preventBodyScroll) {
      // The lock lands on the root element, where `scrollbar-gutter: stable`
      // keeps the gutter reserved while the scrollbar is hidden, so the page
      // doesn't shift and the ::backdrop covers the gutter.
      document.documentElement.classList.add(CLASS_NAME_OPEN)
    }
  }

  protected _hideElement(): void {
    this._hideChildComponents()

    // .hiding must be present before close() so CSS exit transitions play.
    this._element.classList.add(CLASS_NAME_HIDING)

    if (!this._shouldDeferClose()) {
      this._closeAndCleanup()
    }
  }

  // Safe to call multiple times — close() is a no-op on a closed dialog.
  protected _closeAndCleanup(): void {
    if (this._element.open) {
      this._closedByComponent = true
      this._element.close()
    }

    holdAnnouncements()
    this._openedAsModal = false

    if (!document.querySelector('dialog[open]:modal')) {
      document.documentElement.classList.remove(CLASS_NAME_OPEN)
    }
  }

  protected _finishHide(): void {
    this._element.classList.remove(CLASS_NAME_HIDING)
    this._onAfterHide()
    this._isTransitioning = false
    EventHandler.trigger(this._element, this.constructor.eventName('hidden'))
  }

  protected _triggerBackdropTransition(): void {
    const hidePreventedEvent = EventHandler.trigger(this._element, this.constructor.eventName('hidePrevented'))

    if (hidePreventedEvent.defaultPrevented) {
      return
    }

    const staticClass = `${this.constructor.NAME}-static`
    this._element.classList.add(staticClass)
    this._queueCallback(() => {
      this._element.classList.remove(staticClass)
    }, this._element)
  }

  // Hide tooltips, popovers, and toasts inside the dialog before closing.
  // These components append to the dialog (for top-layer rendering) and would
  // otherwise persist visibly after close().
  protected _hideChildComponents(): void {
    const selector = '[data-coreui-toggle="tooltip"], [data-coreui-toggle="popover"]'

    for (const element of SelectorEngine.find(selector, this._element)) {
      const instance = Data.get(element, 'coreui.tooltip') ?? Data.get(element, 'coreui.popover')
      if (instance && typeof instance.hide === 'function') {
        instance.hide()
      }
    }

    for (const element of SelectorEngine.find('*', this._element)) {
      for (const key of POPUP_DATA_KEYS) {
        const instance = Data.get(element, key)
        if (instance && typeof instance.hide === 'function') {
          instance.hide()
        }
      }
    }

    for (const element of SelectorEngine.find('.toast.show', this._element)) {
      const instance = Data.get(element, 'coreui.toast')
      if (instance && typeof instance.hide === 'function') {
        instance.hide()
      }
    }
  }

  protected _initResizeObserver(): void {
    const navbar = this._element?.classList.contains(this.constructor.NAME) && this._element.closest(SELECTOR_NAVBAR_EXPAND)

    if (!navbar || typeof ResizeObserver === 'undefined') {
      return
    }

    const hideWhenInline = (): void => {
      if (this._isTransitioning) {
        this._resizeFrame = requestAnimationFrame(hideWhenInline)
        return
      }

      this._resizeFrame = null

      if (this._element.open && getComputedStyle(this._element).position !== 'fixed') {
        this.hide()
      }
    }

    this._resizeObserver = new ResizeObserver(() => {
      if (this._resizeFrame !== null) {
        cancelAnimationFrame(this._resizeFrame)
      }

      this._resizeFrame = requestAnimationFrame(hideWhenInline)
    })
    this._resizeObserver.observe(navbar)
  }

  // Private

  protected _addDialogListeners(): void {
    const eventKey = this.constructor.EVENT_KEY

    // The native cancel event (Escape) only fires for modal dialogs. Bound
    // unnamespaced because it is a real native event; a per-instance handler
    // lets dispose() remove only this listener, not a consumer's own.
    this._cancelHandler = event => {
      event.preventDefault()

      if (!this._config.keyboard) {
        this._triggerBackdropTransition()
        return
      }

      this._onCancel()
      this.hide()
    }

    EventHandler.on(this._element, 'cancel', this._cancelHandler)

    // The native close event also follows the component's own close(), a task
    // later — `_closedByComponent` tells that one apart from a form with
    // method="dialog", a consumer's dialog.close() or any other native path,
    // which skip hide() and would otherwise leave the scroll lock and the
    // lifecycle state behind. A close that arrives while the dialog is open
    // again belongs to an earlier close, e.g. one made by a disposed instance.
    this._closeHandler = () => {
      if (this._closedByComponent) {
        this._closedByComponent = false
        return
      }

      if (this._hiddenByComponent || this._element.open) {
        return
      }

      this._hideChildComponents()
      this._closeAndCleanup()
      this._finishHide()
    }

    EventHandler.on(this._element, 'close', this._closeHandler)

    // Escape for non-modal dialogs — native cancel doesn't fire for show()
    EventHandler.on(this._element, `keydown${eventKey}`, event => {
      if (event.key !== 'Escape' || this._openedAsModal) {
        return
      }

      event.preventDefault()

      if (!this._config.keyboard) {
        return
      }

      this._onCancel()
      this.hide()
    })

    // Backdrop clicks — clicks on ::backdrop target the dialog element itself
    EventHandler.on(this._element, `click${eventKey}`, event => {
      if (event.target !== this._element || !this._openedAsModal) {
        return
      }

      if (this._config.backdrop === 'static') {
        this._triggerBackdropTransition()
        return
      }

      if (this._config.backdrop) {
        this.hide()
      }
    })
  }
}

export default DialogBase

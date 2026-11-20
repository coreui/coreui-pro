/**
 * --------------------------------------------------------------------------
 * CoreUI dialog.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's dialog.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import DialogBase from './dialog-base.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { enableDismissTrigger } from './util/component-functions.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'dialog'
const DATA_KEY = 'coreui.dialog'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="dialog"]'

type DialogConfig = {
  backdrop: boolean | 'static'
  keyboard: boolean
  modal: boolean
}

const Default: DialogConfig = {
  backdrop: true,
  keyboard: true,
  modal: true
}

const DefaultType = {
  backdrop: '(boolean|string)',
  keyboard: 'boolean',
  modal: 'boolean'
}

/**
 * Class definition
 */

class Dialog extends DialogBase<DialogConfig> {
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
  handleUpdate(): void {
    // Provided for API consistency with Modal; the native <dialog> needs no
    // manual adjustments.
  }

  override dispose(): void {
    this._element.classList.remove(`${this.constructor.NAME}-swap-in`)
    super.dispose()
  }

  // Protected — hook overrides

  protected override _getShowOptions(): { modal: boolean, preventBodyScroll: boolean } {
    return {
      modal: this._config.modal,
      preventBodyScroll: this._config.modal
    }
  }

  protected override _onBeforeShow(): void {
    if (!this._config.modal) {
      this._element.classList.add(`${this.constructor.NAME}-nonmodal`)
    }
  }

  protected override _onAfterHide(): void {
    this._element.classList.remove(`${this.constructor.NAME}-nonmodal`)
  }

  // Keep the dialog in the top layer until the exit transition ends — close()
  // strips the browser's modal centering and the ::backdrop synchronously,
  // which would make the exit animation appear to skip.
  protected override _shouldDeferClose(): boolean {
    return this._isAnimated()
  }

  protected override _onCancel(): void {
    EventHandler.trigger(this._element, this.constructor.eventName('cancel'))
  }

  // Static
  static {
    EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (this: HTMLElement, event: Event) {
      Dialog._handleDataApiClick(this, event)
    })
  }

  static jQueryInterface(this: any, config?: any, relatedTarget?: HTMLElement | null): void {
    return jQueryDispatch(this, Dialog, config, [relatedTarget])
  }

  protected static _getTarget(trigger: HTMLElement): Element | null {
    return SelectorEngine.getElementFromSelector(trigger)
  }

  protected static _onTriggerInside(_dialog: Element, _trigger: HTMLElement): void {}

  protected static _handleDataApiClick(trigger: HTMLElement, event: Event): void {
    const target = this._getTarget(trigger)
    if (!target) {
      return
    }

    if (['A', 'AREA'].includes(trigger.tagName)) {
      event.preventDefault()
    }

    // A trigger inside an open dialog swaps to the target one
    const currentDialog = trigger.closest<HTMLDialogElement>('dialog[open]')

    // A trigger inside the open dialog that targets the same dialog has
    // nothing to swap to.
    if (currentDialog === target) {
      this._onTriggerInside(target, trigger)
      return
    }

    const currentInstance = currentDialog ? this.getInstance(currentDialog) : null

    if (!currentDialog || !currentInstance) {
      this.getOrCreateInstance(target).toggle(trigger)
      return
    }

    const swapInClass = `${this.NAME}-swap-in`
    const instantClass = `${this.NAME}-instant`
    const shownEvent = this.eventName('shown')
    const hiddenEvent = this.eventName('hidden')

    if (currentDialog.classList.contains(swapInClass)) {
      return
    }

    const newDialog = this.getOrCreateInstance(target)

    // Check both cancelable events before changing either dialog. This keeps
    // the current dialog open when either side rejects the swap.
    if (newDialog._isTransitioning || !newDialog._canShow(trigger) || currentInstance._isTransitioning || !currentInstance._canHide()) {
      return
    }

    // Swap strategy (seamless backdrop, no flash):
    //   1. .dialog-swap-in makes the incoming ::backdrop skip its
    //      @starting-style fade-in and appear fully opaque on its first frame.
    //   2. Open the incoming dialog.
    //   3. Close the outgoing one synchronously (.dialog-instant forces the
    //      non-deferred close path), so its ::backdrop is removed in the same
    //      frame the incoming one appears — the user sees one continuous
    //      backdrop instead of a double-darkened or half-faded flash.
    target.classList.add(swapInClass)
    const settleSwapIn = (): void => {
      target.classList.remove(swapInClass)
      EventHandler.off(target, shownEvent, settleSwapIn)
      EventHandler.off(target, hiddenEvent, settleSwapIn)
    }

    EventHandler.on(target, shownEvent, settleSwapIn)
    EventHandler.on(target, hiddenEvent, settleSwapIn)
    newDialog._show(trigger)

    if (!currentDialog.classList.contains(instantClass)) {
      currentDialog.classList.add(instantClass)
      EventHandler.one(currentDialog, hiddenEvent, () => {
        currentDialog.classList.remove(instantClass)
      })
    }

    currentInstance._hide()
  }
}

/**
 * Data API implementation
 */

enableDismissTrigger(Dialog)

/**
 * jQuery
 */

defineJQueryPlugin(Dialog)

export default Dialog
export type { DialogConfig }

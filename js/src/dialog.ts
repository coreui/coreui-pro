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
import { defineJQueryPlugin, isVisible } from './util/index.js'

/**
 * Constants
 */

const NAME = 'dialog'
const DATA_KEY = 'coreui.dialog'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_CANCEL = `cancel${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_NONMODAL = 'dialog-nonmodal'
const CLASS_NAME_INSTANT = 'dialog-instant'
const CLASS_NAME_SWAP_IN = 'dialog-swap-in'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="dialog"]'

const Default = {
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

class Dialog extends DialogBase {
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

  // Protected — hook overrides

  protected override _getShowOptions(): { modal: boolean, preventBodyScroll: boolean } {
    return {
      modal: this._config.modal,
      preventBodyScroll: this._config.modal
    }
  }

  protected override _onBeforeShow(): void {
    if (!this._config.modal) {
      this._element.classList.add(CLASS_NAME_NONMODAL)
    }
  }

  protected override _onAfterHide(): void {
    this._element.classList.remove(CLASS_NAME_NONMODAL)
  }

  // Keep the dialog in the top layer until the exit transition ends — close()
  // strips the browser's modal centering and the ::backdrop synchronously,
  // which would make the exit animation appear to skip.
  protected override _shouldDeferClose(): boolean {
    return this._isAnimated()
  }

  protected override _onCancel(): void {
    EventHandler.trigger(this._element, EVENT_CANCEL)
  }

  // Static
  static jQueryInterface(this: any, config?: any, relatedTarget?: HTMLElement | null): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Dialog.getOrCreateInstance(this, config)

      if (typeof config !== 'string') {
        return
      }

      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string](relatedTarget)
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
  const target = SelectorEngine.getElementFromSelector(this)

  if (['A', 'AREA'].includes(this.tagName)) {
    event.preventDefault()
  }

  EventHandler.one(target, EVENT_SHOW, showEvent => {
    if (showEvent.defaultPrevented) {
      // only register focus restorer if dialog will actually get shown
      return
    }

    EventHandler.one(target, EVENT_HIDDEN, () => {
      if (isVisible(this)) {
        // Returning focus must not scroll the page back to the trigger.
        this.focus({ preventScroll: true })
      }
    })
  })

  // A trigger inside an open dialog swaps to the target one
  const currentDialog = this.closest('dialog[open]')
  const shouldSwap = currentDialog && currentDialog !== target

  if (shouldSwap && target) {
    // Swap strategy (seamless backdrop, no flash):
    //   1. .dialog-swap-in makes the incoming ::backdrop skip its
    //      @starting-style fade-in and appear fully opaque on its first frame.
    //   2. Open the incoming dialog.
    //   3. Close the outgoing one synchronously (.dialog-instant forces the
    //      non-deferred close path), so its ::backdrop is removed in the same
    //      frame the incoming one appears — the user sees one continuous
    //      backdrop instead of a double-darkened or half-faded flash.
    const newDialog = Dialog.getOrCreateInstance(target)
    target.classList.add(CLASS_NAME_SWAP_IN)
    newDialog.show(this)
    EventHandler.one(target, EVENT_SHOWN, () => {
      target.classList.remove(CLASS_NAME_SWAP_IN)
    })

    const currentInstance = Dialog.getInstance(currentDialog)
    if (currentInstance) {
      currentDialog.classList.add(CLASS_NAME_INSTANT)
      EventHandler.one(currentDialog, EVENT_HIDDEN, () => {
        currentDialog.classList.remove(CLASS_NAME_INSTANT)
      })
      currentInstance.hide()
    }

    return
  }

  const data: any = Dialog.getOrCreateInstance(target)

  data.toggle(this)
})

enableDismissTrigger(Dialog)

/**
 * jQuery
 */

defineJQueryPlugin(Dialog)

export default Dialog

/**
 * --------------------------------------------------------------------------
 * CoreUI offcanvas.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's drawer.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import DialogBase from './dialog-base.js'
import type { ComponentConfig } from './util/config.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { enableDismissTrigger } from './util/component-functions.js'
import {
  defineJQueryPlugin,
  isDisabled,
  isVisible
} from './util/index.js'
import { resolveDialogElement } from './util/legacy-markup.js'

/**
 * Constants
 */

const NAME = 'offcanvas'
const DATA_KEY = 'coreui.offcanvas'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_RESIZE = `resize${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const OPEN_SELECTOR = 'dialog[open][class*="offcanvas"]'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="offcanvas"]'
// Responsive variants replace the base class, so the dismiss fallback must
// match them too
const SELECTOR_DISMISS_SCOPE = '.offcanvas, .offcanvas-sm, .offcanvas-md, .offcanvas-lg, .offcanvas-xl, .offcanvas-2xl'

const Default = {
  backdrop: true,
  keyboard: true,
  scroll: false
}

const DefaultType = {
  backdrop: '(boolean|string)',
  keyboard: 'boolean',
  scroll: 'boolean'
}

/**
 * Class definition
 */

class Offcanvas extends DialogBase {
  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(resolveDialogElement(element, NAME), config)
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

  // Protected — hook overrides

  protected override _getShowOptions(): { modal: boolean, preventBodyScroll: boolean } {
    // A visible backdrop needs the top layer; `scroll: true` alone opens
    // non-modally so the page stays interactive and scrollable.
    return {
      modal: Boolean(this._config.backdrop) || !this._config.scroll,
      preventBodyScroll: !this._config.scroll
    }
  }

  // Keep the dialog in the top layer during the exit so the ::backdrop fade
  // plays in every browser (without this, only browsers supporting the
  // `overlay` transition would animate it).
  protected override _shouldDeferClose(): boolean {
    return this._isAnimated()
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Offcanvas.getOrCreateInstance(this, config)

      if (typeof config !== 'string') {
        return
      }

      if (data[config as string] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string](this)
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
  const target = resolveDialogElement(SelectorEngine.getElementFromSelector(this), NAME)

  if (['A', 'AREA'].includes(this.tagName)) {
    event.preventDefault()
  }

  if (isDisabled(this)) {
    return
  }

  EventHandler.one(target, EVENT_HIDDEN, () => {
    // focus on trigger when it is closed; returning focus must not scroll the
    // page back to the trigger
    if (isVisible(this)) {
      this.focus({ preventScroll: true })
    }
  })

  // avoid conflict when clicking a toggler of an offcanvas, while another is open
  const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR)
  if (alreadyOpen && alreadyOpen !== target) {
    Offcanvas.getInstance(alreadyOpen)?.hide()
  }

  const data: any = Offcanvas.getOrCreateInstance(target)
  data.toggle(this)
})

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
    Offcanvas.getOrCreateInstance(selector).show()
  }
})

EventHandler.on(window, EVENT_RESIZE, () => {
  for (const element of SelectorEngine.find(OPEN_SELECTOR)) {
    if (getComputedStyle(element).position !== 'fixed') {
      Offcanvas.getOrCreateInstance(element).hide()
    }
  }
})

enableDismissTrigger(Offcanvas, 'hide', SELECTOR_DISMISS_SCOPE)

/**
 * jQuery
 */

defineJQueryPlugin(Offcanvas)

export default Offcanvas

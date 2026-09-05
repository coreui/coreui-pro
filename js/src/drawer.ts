/**
 * --------------------------------------------------------------------------
 * CoreUI drawer.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's drawer.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import DialogBase from './dialog-base.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { enableDismissTrigger } from './util/component-functions.js'
import {
  defineJQueryPlugin,
  isDisabled,
  isVisible
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'drawer'
const DATA_KEY = 'coreui.drawer'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_RESIZE = `resize${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const OPEN_SELECTOR = 'dialog[open][class*="drawer"]'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="drawer"]'
// Responsive variants replace the base class, so the dismiss fallback must
// match them too
const SELECTOR_DISMISS_SCOPE = '.drawer, .drawer-sm, .drawer-md, .drawer-lg, .drawer-xl, .drawer-2xl'

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

class Drawer extends DialogBase {
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
      const data: any = Drawer.getOrCreateInstance(this, config)

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
  const target = SelectorEngine.getElementFromSelector(this)

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

  // avoid conflict when clicking a toggler of a drawer, while another is open
  const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR)
  if (alreadyOpen && alreadyOpen !== target) {
    Drawer.getInstance(alreadyOpen)?.hide()
  }

  const data: any = Drawer.getOrCreateInstance(target)
  data.toggle(this)
})

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
    Drawer.getOrCreateInstance(selector).show()
  }
})

EventHandler.on(window, EVENT_RESIZE, () => {
  for (const element of SelectorEngine.find(OPEN_SELECTOR)) {
    if (getComputedStyle(element).position !== 'fixed') {
      Drawer.getOrCreateInstance(element).hide()
    }
  }
})

enableDismissTrigger(Drawer, 'hide', SELECTOR_DISMISS_SCOPE)

/**
 * jQuery
 */

defineJQueryPlugin(Drawer)

export default Drawer

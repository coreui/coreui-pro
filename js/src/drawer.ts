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
import { enableDismissTrigger, onDocumentReady } from './util/component-functions.js'
import {
  defineJQueryPlugin, isDisabled, jQueryDispatch
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'drawer'

type DrawerConfig = {
  backdrop: boolean | 'static'
  keyboard: boolean
  scroll: boolean
}

const Default: DrawerConfig = {
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

class Drawer extends DialogBase<DrawerConfig> {
  constructor(element?: string | Element | null, config?: Partial<DrawerConfig> | null) {
    super(element, config)
    this._initResizeObserver()
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
  static {
    this._enableDataApi()
  }

  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, Drawer, config, element => [element])
  }

  protected static _enableDataApi(): void {
    const name = this.NAME
    const variants = `[class^="${name}-"], [class*=" ${name}-"]`
    const openSelector = `dialog[open]:is(.${name}, ${variants})`
    const dataApiKey = `${this.EVENT_KEY}.data-api`

    EventHandler.on(document, `click${dataApiKey}`, `[data-coreui-toggle="${name}"]`, event => {
      const trigger = event.delegateTarget as HTMLElement
      const target = SelectorEngine.getElementFromSelector(trigger)

      if (['A', 'AREA'].includes(trigger.tagName)) {
        event.preventDefault()
      }

      if (isDisabled(trigger)) {
        return
      }

      // avoid conflict when clicking a toggler of a drawer, while another is open
      const alreadyOpen = SelectorEngine.find(openSelector).find(element => !this.getInstance(element)?._isClosing())
      if (alreadyOpen && alreadyOpen !== target) {
        this.getInstance(alreadyOpen)?.hide()
      }

      this.getOrCreateInstance(target).toggle(trigger)
    })

    onDocumentReady(window, `load${dataApiKey}`, () => {
      for (const element of SelectorEngine.find(openSelector)) {
        this.getOrCreateInstance(element).show()
      }
    })

    EventHandler.on(window, `resize${this.EVENT_KEY}`, () => {
      for (const element of SelectorEngine.find(`dialog[open]:not(.${name}):is(${variants})`)) {
        if (getComputedStyle(element).position !== 'fixed') {
          this.getOrCreateInstance(element).hide()
        }
      }
    })

    // Responsive variants replace the base class, so the dismiss fallback must
    // match them too
    enableDismissTrigger(this, 'hide', ['', '-sm', '-md', '-lg', '-xl', '-2xl'].map(suffix => `.${name}${suffix}`).join(', '))
  }
}

/**
 * jQuery
 */

defineJQueryPlugin(Drawer)

export default Drawer
export type { DrawerConfig }

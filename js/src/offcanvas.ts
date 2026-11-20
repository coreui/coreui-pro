/**
 * --------------------------------------------------------------------------
 * CoreUI offcanvas.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's drawer.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import Drawer from './drawer.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'
import { resolveDialogElement } from './util/legacy-markup.js'

/**
 * Constants
 */

const NAME = 'offcanvas'

type OffcanvasConfig = {
  backdrop: boolean | 'static'
  keyboard: boolean
  scroll: boolean
}

const Default: OffcanvasConfig = {
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

class Offcanvas extends Drawer {
  constructor(element?: string | Element | null, config?: Partial<OffcanvasConfig> | null) {
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

  // Static
  static {
    this._enableDataApi()
  }

  static override jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, Offcanvas, config, element => [element])
  }
}

/**
 * jQuery
 */

defineJQueryPlugin(Offcanvas)

export default Offcanvas
export type { OffcanvasConfig }

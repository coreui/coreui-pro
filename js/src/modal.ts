/**
 * --------------------------------------------------------------------------
 * CoreUI modal.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's dialog.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import Dialog from './dialog.js'
import EventHandler from './dom/event-handler.js'
import { enableDismissTrigger } from './util/component-functions.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'
import { resolveDialogElement } from './util/legacy-markup.js'

/**
 * Constants
 */

const NAME = 'modal'
const DATA_KEY = 'coreui.modal'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="modal"]'

type ModalConfig = {
  backdrop: boolean | 'static'
  keyboard: boolean
  modal: boolean
}

const Default: ModalConfig = {
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

class Modal extends Dialog {
  constructor(element?: string | Element | null, config?: Partial<ModalConfig> | null) {
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
    EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (this: HTMLElement, event: Event) {
      Modal._handleDataApiClick(this, event)
    })
  }

  static override jQueryInterface(this: any, config?: any, relatedTarget?: HTMLElement | null): void {
    return jQueryDispatch(this, Modal, config, [relatedTarget])
  }

  protected static override _getTarget(trigger: HTMLElement): Element | null {
    return resolveDialogElement(super._getTarget(trigger), NAME)
  }

  protected static override _onTriggerInside(dialog: Element, trigger: HTMLElement): void {
    this.getOrCreateInstance(dialog).toggle(trigger)
  }
}

/**
 * Data API implementation
 */

enableDismissTrigger(Modal)

/**
 * jQuery
 */

defineJQueryPlugin(Modal)

export default Modal
export type { ModalConfig }

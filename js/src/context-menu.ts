/**
 * --------------------------------------------------------------------------
 * CoreUI PRO context-menu.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import type { ReferenceElement } from '@floating-ui/dom'
import EventHandler, { type CoreUIEvent } from './dom/event-handler.js'
import Menu, { type MenuConfig } from './menu.js'
import type { ComponentConfig } from './util/config.js'
import {
  defineJQueryPlugin, getElement, isDisabled, noop
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'context-menu'
const DATA_KEY = 'coreui.context-menu'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const CONTEXT_MENU_KEY = 'ContextMenu'
const F10_KEY = 'F10'

const EVENT_CONTEXTMENU_DATA_API = `contextmenu${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_SHOW = 'show'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="context-menu"]'

type Point = { x: number, y: number }

const Default: MenuConfig = {
  ...Menu.Default,
  reference: 'pointer',
  strategy: 'fixed'
}

const DefaultType: Record<string, string> = {
  ...Menu.DefaultType,
  menu: '(null|string|element)'
}

/**
 * Class definition
 */

class ContextMenu extends Menu {
  declare ['constructor']: typeof ContextMenu
  protected declare _point: Point | null

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._point = null

    if (this._menu && !this._menu.hasAttribute('tabindex')) {
      this._menu.setAttribute('tabindex', '-1')
    }
  }

  // Getters
  static override get SELECTOR_DATA_TOGGLE(): string {
    return SELECTOR_DATA_TOGGLE
  }

  static override get Default(): MenuConfig {
    return Default
  }

  static override get DefaultType(): Record<string, string> {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  override toggle(point?: Point): Promise<void> {
    return this._isShown() ? this.hide() : this.show(point)
  }

  override async show(point?: Point): Promise<void> {
    this._show(point, { relatedTarget: this._element })
  }

  // Private
  protected _show(point: Point | undefined, relatedTarget: Record<string, unknown>): void {
    if (isDisabled(this._element) || this._isShown()) {
      return
    }

    const showEvent = EventHandler.trigger(this._element, this.constructor.eventName('show'), relatedTarget)

    if (showEvent.defaultPrevented) {
      return
    }

    this._point = point ?? null

    this._moveMenuToContainer()
    this._createFloating()

    if ('ontouchstart' in document.documentElement) {
      for (const element of document.body.children) {
        EventHandler.on(element, 'mouseover', noop)
      }
    }

    this._menu.classList.add(CLASS_NAME_SHOW)
    this._menu.focus({ preventScroll: true })

    Menu._openInstances.add(this)
    EventHandler.trigger(this._element, this.constructor.eventName('shown'), relatedTarget)
  }

  protected override _completeHide(relatedTarget: Record<string, unknown>): void {
    const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName('hide'), relatedTarget)
    if (hideEvent.defaultPrevented) {
      return
    }

    this._closeAllSubmenus()

    if ('ontouchstart' in document.documentElement) {
      for (const element of document.body.children) {
        EventHandler.off(element, 'mouseover', noop)
      }
    }

    const hadFocus = this._menu.contains(document.activeElement)

    this._disposeFloating()
    this._restoreMenuToOriginalParent()

    this._menu.classList.remove(CLASS_NAME_SHOW)
    this._removeMenuAttributes()
    this._point = null

    if (hadFocus) {
      this._element.focus({ preventScroll: true })
    }

    Menu._openInstances.delete(this)
    EventHandler.trigger(this._element, this.constructor.eventName('hidden'), relatedTarget)
  }

  override _getConfig(config?: ComponentConfig | null): ComponentConfig {
    config = super._getConfig(config)

    if (typeof config.menu === 'string') {
      config.menu = getElement(config.menu)
    }

    return config
  }

  protected override _getReferenceElement(): ReferenceElement {
    if (this._config.reference !== 'pointer') {
      return super._getReferenceElement()
    }

    if (!this._point) {
      return this._element
    }

    const { x, y } = this._point

    return {
      getBoundingClientRect: () => new DOMRect(x, y, 0, 0),
      contextElement: this._element
    }
  }

  // Static
  static dataApiContextMenuHandler(event: CoreUIEvent): void {
    const target = event.target as Element

    for (const instance of Menu._openInstances) {
      if (instance instanceof ContextMenu && instance._menu.contains(target)) {
        event.preventDefault()
        return
      }
    }

    const toggle = target.closest<HTMLElement>(SELECTOR_DATA_TOGGLE)
    if (!toggle || isDisabled(toggle)) {
      ContextMenu._clearContextMenus()
      return
    }

    event.preventDefault()

    const instance = ContextMenu.getOrCreateInstance(toggle)
    if (instance._isShown()) {
      instance.hide()
    }

    Menu.clearMenus(event)

    // A keyboard-invoked event (Shift+F10, the Menu key) reports no coordinates
    // in some browsers; the menu then anchors to the element itself.
    const point = event.clientX || event.clientY ? { x: event.clientX, y: event.clientY } : undefined
    instance._show(point, { relatedTarget: toggle, contextmenuEvent: event })
  }

  // A right-click outside every open context menu dismisses them, while the
  // menus opened by click stay put — a right-click does not close those.
  protected static _clearContextMenus(): void {
    for (const instance of Menu._openInstances) {
      if (instance instanceof ContextMenu && instance._config.autoClose !== false && instance._config.autoClose !== 'inside') {
        instance._completeHide({ relatedTarget: instance._element })
      }
    }
  }

  // Not every platform turns Shift+F10 or the Menu key into a `contextmenu`
  // event (macOS never does), so the keys open the menu on their own; on the
  // platforms that do, the prevented keydown keeps the native event away.
  static dataApiKeydownHandler(this: HTMLElement, event: CoreUIEvent): void {
    if (event.key !== CONTEXT_MENU_KEY && !(event.key === F10_KEY && event.shiftKey)) {
      return
    }

    if (isDisabled(this)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const instance = ContextMenu.getOrCreateInstance(this)
    if (instance._isShown()) {
      instance.hide()
    }

    Menu.clearMenus(event)
    instance._show(undefined, { relatedTarget: this })
  }

  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = ContextMenu.getOrCreateInstance(this, config)

      if (typeof config !== 'string') {
        return
      }

      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string]()
    })
  }
}

/**
 * Data API implementation
 *
 * Keyboard handling and dismissal come from Menu's document-level listeners:
 * the menu carries the same `.menu` class and the open-instance registry
 * resolves key events to this instance.
 */

EventHandler.on(document, EVENT_CONTEXTMENU_DATA_API, ContextMenu.dataApiContextMenuHandler)
EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE, ContextMenu.dataApiKeydownHandler)

/**
 * jQuery
 */

defineJQueryPlugin(ContextMenu)

export default ContextMenu
export { Default, DefaultType }

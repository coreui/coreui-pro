/**
 * --------------------------------------------------------------------------
 * CoreUI PRO context-menu.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import type { ReferenceElement } from '@floating-ui/dom'
import EventHandler, { type CoreUIEvent } from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import Menu, { type MenuConfig } from './menu.js'
import { focusIfUsable } from './util/focus.js'
import {
  defineJQueryPlugin, isDisabled, jQueryDispatch
} from './util/index.js'
import type { LayerEntry } from './util/layers.js'

/**
 * Constants
 */

const NAME = 'context-menu'
const DATA_KEY = 'coreui.context-menu'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const CONTEXT_MENU_KEY = 'ContextMenu'
const ESCAPE_KEY = 'Escape'
const F10_KEY = 'F10'
const TAB_KEY = 'Tab'

const EVENT_CONTEXTMENU_DATA_API = `contextmenu${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY}${DATA_API_KEY}`

const SCROLL_EVENTS = ['wheel', 'touchmove', 'keydown']
const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown'])

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="context-menu"]'

type Point = { x: number, y: number }

type ContextMenuConfig = Omit<MenuConfig, 'placement'> & {
  ariaMenuLabel: string | null
  placement: string
}

const Default = {
  ...Menu.Default,
  ariaMenuLabel: null,
  reference: 'pointer',
  strategy: 'fixed'
} as ContextMenuConfig

const DefaultType: Record<string, string> = {
  ...Menu.DefaultType,
  ariaMenuLabel: '(null|string)'
}

/**
 * Class definition
 */

class ContextMenu extends Menu {
  declare ['constructor']: typeof ContextMenu
  protected declare _config: ContextMenuConfig
  protected declare _point: Point | null
  protected declare _scrollBlocker: ((event: Event) => void) | null
  protected declare _shown: boolean
  protected static _opening: ContextMenu | null = null

  constructor(element?: string | Element | null, config?: Partial<ContextMenuConfig> | null) {
    super(element, config as Partial<MenuConfig>)

    this._point = null
    this._scrollBlocker = null
    this._shown = false
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
    this._showAt(point, { relatedTarget: this._element })
  }

  override dispose(): void {
    this._unlockScroll()
    super.dispose()
  }

  // Private
  protected _showAt(point: Point | undefined, relatedTarget: Record<string, unknown>, fromKeyboard = false): void {
    if (!this._isShown()) {
      this._point = point ?? null
    }

    this._openedBy = fromKeyboard ? 'key' : 'pointer'
    ContextMenu._opening = this
    this._show(relatedTarget)
    ContextMenu._opening = null
    this._openedBy = null
  }

  protected override _isShown(): boolean {
    return this._shown
  }

  protected override _createLayer(): LayerEntry {
    const layer = super._createLayer()

    return {
      ...layer,
      closesOn: (reason, event) => (reason === 'sibling' && ContextMenu._opening?._menu === this._menu) || layer.closesOn(reason, event),
      parts: () => [this._menu]
    }
  }

  protected override _setShown(shown: boolean): void {
    this._shown = shown

    if (shown) {
      this._lockScroll()
      this._setRoles()
      this._focusOnShow()
    } else {
      this._unlockScroll()
      this._point = null
    }
  }

  protected override _returnFocus(): void {
    focusIfUsable(this._element, { preventScroll: true })
  }

  // The trigger is an area, not a button: a click anywhere outside the menu
  // closes it, the trigger included.
  protected override _isToggleTarget(): boolean {
    return false
  }

  protected override _onTabInside(): void {}

  protected override _handleTab(): void {}

  protected override _keepsFocus(): boolean {
    return false
  }

  protected override _isMenuPanel(): boolean {
    return true
  }

  protected override _announceMenu(): void {}

  protected override _setRoles(): void {
    if (this._menu.getAttribute('role') !== 'menu') {
      Menu._engineMenus.add(this._menu)
      this._menu.setAttribute('role', 'menu')
    }

    this._menu.setAttribute('tabindex', '-1')

    if (this._config.ariaMenuLabel && !this._menu.hasAttribute('aria-label')) {
      this._menu.setAttribute('aria-label', this._config.ariaMenuLabel)
    }

    super._setRoles()
  }

  // Wheel and touch listeners on the document are passive by default, so the
  // blocker goes through the native API to be allowed to prevent the scroll.
  protected _lockScroll(): void {
    if (this._scrollBlocker) {
      return
    }

    this._scrollBlocker = (event: Event) => {
      if (event.type === 'keydown' && (event as KeyboardEvent).key === TAB_KEY && this._menu.contains(event.target as Node)) {
        event.preventDefault()
        return
      }

      if (event.type === 'keydown' && !SCROLL_KEYS.has((event as KeyboardEvent).key)) {
        return
      }

      if (!this._menu.contains(event.target as Node) || (event.type === 'keydown' && event.target === this._menu)) {
        event.preventDefault()
      }
    }

    for (const type of SCROLL_EVENTS) {
      document.addEventListener(type, this._scrollBlocker, { passive: false })
    }
  }

  protected _unlockScroll(): void {
    if (!this._scrollBlocker) {
      return
    }

    for (const type of SCROLL_EVENTS) {
      document.removeEventListener(type, this._scrollBlocker)
    }

    this._scrollBlocker = null
  }

  protected override _findMenu(): Element | null {
    return SelectorEngine.getElementFromSelector(this._element) || super._findMenu()
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

    // A keyboard-invoked event (Shift+F10, the Menu key) reports no coordinates
    // in some browsers; the menu then anchors to the element itself.
    const point = event.clientX || event.clientY ? { x: event.clientX, y: event.clientY } : undefined
    instance._showAt(point, { relatedTarget: toggle, contextmenuEvent: event })
  }

  // A right-click outside every open context menu dismisses them, while the
  // menus opened by click stay put — a right-click does not close those.
  protected static _clearContextMenus(): void {
    for (const instance of Menu._openInstances) {
      if (instance instanceof ContextMenu && instance._config.autoClose !== false && instance._config.autoClose !== 'inside') {
        instance._completeHide({ relatedTarget: instance._element }, 'outside')
      }
    }
  }

  // Not every platform turns Shift+F10 or the Menu key into a `contextmenu`
  // event (macOS never does), so the keys open the menu on their own; on the
  // platforms that do, the prevented keydown keeps the native event away.
  static dataApiKeydownHandler(this: HTMLElement, event: CoreUIEvent): void {
    if (event.key === ESCAPE_KEY) {
      const menu = ContextMenu.getOrCreateInstance(this)._menu
      for (const instance of Menu._openInstances) {
        if (instance instanceof ContextMenu && instance._menu === menu && !menu.contains(event.target as Node)) {
          event.preventDefault()
          event.stopPropagation()
          instance.hide()
        }
      }

      return
    }

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

    instance._showAt(undefined, { relatedTarget: this }, true)
  }

  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, ContextMenu, config, args)
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
export type { ContextMenuConfig }

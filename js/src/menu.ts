/**
 * --------------------------------------------------------------------------
 * CoreUI menu.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's menu.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 *
 * Deviation from upstream: the selectors and class hooks live in static
 * getters, not module constants, so Dropdown can subclass Menu and keep the
 * v5 markup working.
 * --------------------------------------------------------------------------
 */

import {
  computePosition,
  flip,
  shift,
  offset,
  autoUpdate,
  type Boundary,
  type Middleware,
  type MiddlewareState,
  type Placement,
  type ReferenceElement,
  type Strategy
} from '@floating-ui/dom'
import BaseComponent from './base-component.js'
import EventHandler, { type CoreUIEvent, type EventCallable } from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import type { ComponentConfig } from './util/config.js'
import {
  defineJQueryPlugin, execute, getElement, getNextActiveElement, getUID, isDisabled, isElement, isRTL, isVisible, jQueryDispatch, noop
} from './util/index.js'
import {
  parseResponsivePlacement,
  getResponsivePlacement,
  createBreakpointListeners,
  disposeBreakpointListeners,
  toFloatingOffset,
  type BreakpointListener,
  type ResponsivePlacements,
  type FloatingOffsetOption,
  type FloatingConfigOption
} from './util/floating-ui.js'
import { containsFocus, focusIfUsable, holdsFocusOrNone } from './util/focus.js'
import { resolvePopupContainer } from './util/popup.js'
import { pressPathOf, trackPress } from './util/press.js'

/**
 * Constants
 */

const NAME = 'menu'
const DATA_KEY = 'coreui.menu'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const ESCAPE_KEY = 'Escape'
const TAB_KEY = 'Tab'
const ARROW_UP_KEY = 'ArrowUp'
const ARROW_DOWN_KEY = 'ArrowDown'
const ARROW_LEFT_KEY = 'ArrowLeft'
const ARROW_RIGHT_KEY = 'ArrowRight'
const HOME_KEY = 'Home'
const END_KEY = 'End'
const ENTER_KEY = 'Enter'
const SPACE_KEY = ' '
const RIGHT_MOUSE_BUTTON = 2

const SUBMENU_CLOSE_DELAY = 100

const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_SHOW = 'show'

const SELECTOR_MENU_FAMILY = '.menu, .dropdown-menu'
const SELECTOR_NAVBAR_NAV = '.navbar-nav'

const DEFAULT_PLACEMENT = 'bottom-start'
const SUBMENU_PLACEMENT = 'end-start'

type Point = { x: number, y: number }

const triangleSign = (p1: Point, p2: Point, p3: Point): number =>
  ((p1.x - p3.x) * (p2.y - p3.y)) - ((p2.x - p3.x) * (p1.y - p3.y))

type MenuConfig = {
  autoClose: boolean | 'inside' | 'outside'
  boundary: string | Element
  container: string | Element | boolean
  display: 'dynamic' | 'static'
  floatingConfig: FloatingConfigOption
  loopFocus: boolean
  menu: Element | null
  offset: FloatingOffsetOption
  placement: string | null
  reference: string | Element | { getBoundingClientRect: () => DOMRect }
  strategy: 'absolute' | 'fixed'
  submenuDelay: number
  submenuTrigger: 'both' | 'click' | 'hover'
}

const Default: MenuConfig = {
  autoClose: true,
  boundary: 'clippingParents',
  container: false,
  display: 'dynamic',
  floatingConfig: null,
  loopFocus: false,
  menu: null,
  offset: [0, 2],
  placement: DEFAULT_PLACEMENT,
  reference: 'toggle',
  strategy: 'absolute',
  submenuDelay: SUBMENU_CLOSE_DELAY,
  submenuTrigger: 'both'
}

const DefaultType = {
  autoClose: '(boolean|string)',
  boundary: '(string|element)',
  container: '(string|element|boolean)',
  display: 'string',
  floatingConfig: '(null|object|function)',
  loopFocus: 'boolean',
  menu: '(null|element)',
  offset: '(array|string|function)',
  placement: 'string',
  reference: '(string|element|object)',
  strategy: 'string',
  submenuDelay: 'number',
  submenuTrigger: 'string'
}

/**
 * Class definition
 */

class Menu extends BaseComponent {
  declare ['constructor']: typeof Menu
  static _openInstances: Set<Menu> = new Set<Menu>()
  static _engineMenus: WeakSet<Element> = new WeakSet<Element>()
  protected declare _config: MenuConfig
  protected declare _disabledItems: WeakSet<Element>
  protected declare _floatingCleanup: (() => void) | null
  protected declare _mediaQueryListeners: BreakpointListener[]
  protected declare _responsivePlacements: ResponsivePlacements | null
  protected declare _parent: HTMLElement
  protected declare _openSubmenus: Map<HTMLElement, () => void>
  protected declare _hoverOpenedSubmenus: Set<HTMLElement>
  protected declare _submenuCloseTimeouts: Map<HTMLElement, number>
  protected declare _submenuListeners: Array<[string, string | null, EventCallable]>
  protected declare _hoverIntentData: { x: number, y: number, timestamp: number } | null
  protected declare _menu: HTMLElement
  protected declare _isMenu: boolean
  protected declare _isSubmenu: boolean
  protected declare _menuOriginalParent: ParentNode | null
  protected declare _menuDirection: string | null
  protected declare _openedBy: 'key' | 'pointer' | null

  constructor(element?: string | Element | null, config?: Partial<MenuConfig> | null) {
    if (typeof computePosition === 'undefined') {
      throw new TypeError('CoreUI\'s menus require Floating UI (https://floating-ui.com)')
    }

    super(element, config)

    this._floatingCleanup = null
    this._mediaQueryListeners = []
    this._responsivePlacements = null
    this._parent = this._element.parentNode as HTMLElement // menu wrapper
    this._openSubmenus = new Map()
    this._hoverOpenedSubmenus = new Set()
    this._submenuCloseTimeouts = new Map()
    this._submenuListeners = []
    this._hoverIntentData = null
    this._disabledItems = new WeakSet()
    this._openedBy = null

    this._menu = (this._config.menu || this._findMenu()) as HTMLElement

    // When the menu was discovered from the DOM, refine the wrapper to the closest
    // ancestor that actually contains it, so the toggle doesn't have to be a direct
    // sibling of `.menu` (e.g. when wrapped by web components). The wrapper still
    // receives `.show` and acts as the `reference: 'parent'` positioning anchor.
    if (!this._config.menu && this._menu) {
      this._parent = this._findWrapper(this._menu)
    }

    this._isSubmenu = this._parent.classList?.contains(this.constructor.SELECTOR_SUBMENU.slice(1))

    this._menuOriginalParent = this._menu?.parentNode
    this._menuDirection = null
    this._isMenu = this._isMenuPanel()

    this._parseResponsivePlacements()
    this._setupSubmenuListeners()
    this._initSubmenuTriggers()

    if (this._isMenu) {
      this._announceMenu()
      this._listenOnMenu('click', `${this.constructor.SELECTOR_ITEM}.disabled`, event => {
        event.preventDefault()
        event.stopPropagation()
      })
    }
  }

  // Getters
  //
  // The selectors are part of the class surface on purpose: Dropdown overrides
  // them to keep the v5 markup working on this implementation.
  static get SELECTOR_DATA_TOGGLE(): string {
    return '[data-coreui-toggle="menu"]:not(.disabled):not(:disabled)'
  }

  static get SELECTOR_HEADER(): string {
    return '.menu-header'
  }

  static get SELECTOR_ITEM(): string {
    return '.menu-item'
  }

  static get SELECTOR_MENU(): string {
    return '.menu'
  }

  static get SELECTOR_SUBMENU(): string {
    return '.submenu'
  }

  static get SELECTOR_SUBMENU_TOGGLE(): string {
    return '.submenu > .menu-item'
  }

  static get SELECTOR_VISIBLE_ITEMS(): string {
    return '.menu-item:not(.disabled):not(:disabled)'
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
  toggle(): Promise<void> {
    return this._isShown() ? this.hide() : this.show()
  }

  async show(): Promise<void> {
    this._show({ relatedTarget: this._element })
  }

  protected _show(relatedTarget: Record<string, unknown>): void {
    if (isDisabled(this._element) || this._isShown()) {
      return
    }

    const showEvent = EventHandler.trigger(this._element, this.constructor.eventName('show'), relatedTarget)

    if (showEvent.defaultPrevented) {
      return
    }

    this._moveMenuToContainer()
    this._createFloating()

    if ('ontouchstart' in document.documentElement && !this._parent.closest?.(SELECTOR_NAVBAR_NAV)) {
      for (const element of document.body.children) {
        EventHandler.on(element, 'mouseover', noop)
      }
    }

    this._menu.classList.add(CLASS_NAME_SHOW)
    this._setShown(true)

    Menu._openInstances.add(this)
    EventHandler.trigger(this._element, this.constructor.eventName('shown'), relatedTarget)
  }

  async hide(): Promise<void> {
    if (isDisabled(this._element) || !this._isShown()) {
      return
    }

    const relatedTarget = {
      relatedTarget: this._element
    }

    this._completeHide(relatedTarget)
  }

  override dispose(): void {
    this._disposeFloating()
    this._restoreMenuToOriginalParent()
    this._disposeMediaQueryListeners()
    this._closeAllSubmenus()
    this._clearAllSubmenuTimeouts()
    Menu._openInstances.delete(this)

    for (const [type, selector, handler] of this._submenuListeners) {
      if (selector) {
        EventHandler.off(this._menu, type, selector, handler)
      } else {
        EventHandler.off(this._menu, type, handler)
      }
    }

    super.dispose()
  }

  update(): void {
    if (this._isMenu && this._isShown()) {
      this._setRoles()
    }

    if (this._floatingCleanup) {
      this._updateFloatingPosition()
    }
  }

  // Private
  protected _findMenu(): Element | null {
    // Fall back to the closest ancestor that contains a menu so the toggle can be
    // nested deeper than a direct sibling of `.menu`.
    const wrapper = SelectorEngine.closest(this._element, `:has(${this.constructor.SELECTOR_MENU})`)
    return SelectorEngine.next(this._element, this.constructor.SELECTOR_MENU)[0] ||
      SelectorEngine.prev(this._element, this.constructor.SELECTOR_MENU)[0] ||
      SelectorEngine.findOne(this.constructor.SELECTOR_MENU, wrapper || this._parent)
  }

  protected _findWrapper(menu: HTMLElement): HTMLElement {
    let wrapper = this._element.parentNode
    while (wrapper instanceof Element && !wrapper.contains(menu)) {
      wrapper = wrapper.parentNode
    }

    return (wrapper instanceof Element ? wrapper : this._element.parentNode) as HTMLElement
  }

  protected _completeHide(relatedTarget: Record<string, unknown>, returnFocus = true): void {
    const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName('hide'), relatedTarget)
    if (hideEvent.defaultPrevented) {
      return
    }

    const refocus = returnFocus && holdsFocusOrNone(this._menu)

    this._closeAllSubmenus()

    if ('ontouchstart' in document.documentElement) {
      for (const element of document.body.children) {
        EventHandler.off(element, 'mouseover', noop)
      }
    }

    this._disposeFloating()
    this._restoreMenuToOriginalParent()

    this._menu.classList.remove(CLASS_NAME_SHOW)
    this._setShown(false)
    this._removeMenuAttributes()
    Menu._openInstances.delete(this)

    if (refocus) {
      this._returnFocus()
    }

    EventHandler.trigger(this._element, this.constructor.eventName('hidden'), relatedTarget)
  }

  protected _setShown(shown: boolean): void {
    if (shown) {
      if (this._isMenu) {
        this._setRoles()
      }

      this._focusOnShow()
    }

    this._element.setAttribute('aria-expanded', String(shown))
    this._element.classList.toggle(CLASS_NAME_SHOW, shown)
    this._parent?.classList.toggle(CLASS_NAME_SHOW, shown)
  }

  protected _focusOnShow(): void {
    const openedBy = this._openedBy ?? (containsFocus(this._element) ? 'key' : null)

    if (!this._isMenu || !openedBy || this._keepsFocus()) {
      this._element.focus({ focusVisible: false } as FocusOptions)
      return
    }

    if (openedBy === 'pointer' || !this._getItemsInMenu(this._menu).some(item => focusIfUsable(item, { preventScroll: true }))) {
      this._menu.focus({ preventScroll: true })
    }
  }

  protected _returnFocus(): void {
    focusIfUsable(this._element)
  }

  protected _keepsFocus(): boolean {
    return this._element.matches('input, select, textarea') || this._element.isContentEditable
  }

  protected _isMenuPanel(): boolean {
    return this._menu?.getAttribute('role') === 'menu' && !Menu._engineMenus.has(this._menu)
  }

  protected _announceMenu(): void {
    const { NAME } = this.constructor
    this._element.id ||= getUID(NAME)
    this._menu.id ||= getUID(NAME)
    this._element.setAttribute('aria-haspopup', 'menu')
    this._element.setAttribute('aria-controls', this._menu.id)
    this._menu.setAttribute('tabindex', '-1')

    if (!this._menu.hasAttribute('aria-label') && !this._menu.hasAttribute('aria-labelledby')) {
      this._menu.setAttribute('aria-labelledby', this._element.getAttribute('aria-labelledby') || this._element.id)
    }
  }

  protected _setRoles(): void {
    this._initSubmenuTriggers()

    const { SELECTOR_HEADER, SELECTOR_ITEM, SELECTOR_MENU, SELECTOR_SUBMENU, SELECTOR_SUBMENU_TOGGLE } = this.constructor
    for (const element of SelectorEngine.find(`${SELECTOR_ITEM}, ${SELECTOR_HEADER}, ${SELECTOR_SUBMENU}, ul, ol, li`, this._menu).filter(element => this._ownsElement(element))) {
      if (element.matches(SELECTOR_MENU_FAMILY) || (!element.matches(SELECTOR_ITEM) && element.closest(SELECTOR_ITEM))) {
        continue
      }

      if (!element.matches(SELECTOR_ITEM)) {
        if (!['group', 'separator'].includes(element.getAttribute('role')!)) {
          element.setAttribute('role', 'none')
        }

        continue
      }

      if (!element.getAttribute('role')?.startsWith('menuitem')) {
        element.setAttribute('role', 'menuitem')
      }

      element.setAttribute('tabindex', '-1')

      if (element.classList.contains('disabled')) {
        element.setAttribute('aria-disabled', 'true')
        this._disabledItems.add(element)
      } else if (this._disabledItems.delete(element)) {
        element.removeAttribute('aria-disabled')
      }

      const [submenu] = element.matches(SELECTOR_SUBMENU_TOGGLE) ? SelectorEngine.children(element.parentElement!, SELECTOR_MENU) : []
      if (submenu) {
        element.id ||= getUID(this.constructor.NAME)
        submenu.setAttribute('role', 'menu')
        submenu.setAttribute('aria-labelledby', element.id)
      }
    }
  }

  protected _ownsElement(element: Element): boolean {
    let level = element.parentElement?.closest(SELECTOR_MENU_FAMILY)

    while (level && level !== this._menu) {
      const wrapper = level.parentElement
      level = wrapper?.matches(this.constructor.SELECTOR_SUBMENU) ? wrapper.parentElement?.closest(SELECTOR_MENU_FAMILY) : null
    }

    return level === this._menu
  }

  // Everything the engine stamped on the menu; Dropdown extends this with its
  // own data-coreui-popper hook.
  protected _removeMenuAttributes(): void {
    Manipulator.removeDataAttribute(this._menu, 'placement')
    Manipulator.removeDataAttribute(this._menu, 'display')
  }

  override _getConfig(config?: ComponentConfig | null): ComponentConfig {
    config = super._getConfig(config)

    if (typeof config.reference === 'object' && !isElement(config.reference) &&
      typeof config.reference.getBoundingClientRect !== 'function'
    ) {
      throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`)
    }

    return config
  }

  protected _createFloating(): void {
    if (this._config.display === 'static') {
      Manipulator.setDataAttribute(this._menu, 'display', 'static')
      return
    }

    const referenceElement = this._getReferenceElement()

    this._updateFloatingPosition(referenceElement)

    this._floatingCleanup = autoUpdate(
      referenceElement,
      this._menu,
      () => this._updateFloatingPosition(referenceElement)
    )
  }

  protected async _updateFloatingPosition(referenceElement: ReferenceElement | null = null): Promise<void> {
    if (!this._menu) {
      return
    }

    referenceElement ??= this._getReferenceElement()

    const placement = this._getPlacement()
    const middleware = this._getFloatingMiddleware()
    const floatingConfig = this._getFloatingConfig(placement, middleware)

    await this._applyFloatingPosition(
      referenceElement!,
      this._menu,
      floatingConfig.placement,
      floatingConfig.middleware,
      floatingConfig.strategy
    )
  }

  protected _getReferenceElement(): ReferenceElement {
    const { reference } = this._config

    if (reference === 'parent') {
      return this._parent
    }

    if (isElement(reference)) {
      return getElement(reference)!
    }

    if (typeof reference === 'object') {
      return reference as ReferenceElement
    }

    return this._element
  }

  protected _isShown(): boolean {
    return this._menu.classList.contains(CLASS_NAME_SHOW)
  }

  protected _isToggleTarget(composedPath: EventTarget[]): boolean {
    return composedPath.includes(this._element)
  }

  protected _getPlacement(): string {
    const placement = this._responsivePlacements ?
      getResponsivePlacement(this._responsivePlacements, DEFAULT_PLACEMENT) :
      (this._config.placement ?? DEFAULT_PLACEMENT)

    return this._resolveLogicalPlacement(placement)
  }

  protected _resolveLogicalPlacement(placement: string, element: Element = this._element): string {
    if (isRTL(element)) {
      return placement.replace(/^start(?=-|$)/, 'right').replace(/^end(?=-|$)/, 'left')
    }

    return placement.replace(/^start(?=-|$)/, 'left').replace(/^end(?=-|$)/, 'right')
  }

  protected _parseResponsivePlacements(): void {
    this._responsivePlacements = parseResponsivePlacement(this._config.placement, DEFAULT_PLACEMENT)

    if (this._responsivePlacements) {
      this._setupMediaQueryListeners()
    }
  }

  protected _setupMediaQueryListeners(): void {
    this._disposeMediaQueryListeners()
    this._mediaQueryListeners = createBreakpointListeners(() => {
      if (this._isShown()) {
        this._updateFloatingPosition()
      }
    })
  }

  protected _disposeMediaQueryListeners(): void {
    disposeBreakpointListeners(this._mediaQueryListeners)
    this._mediaQueryListeners = []
  }

  protected _getOffset(): number[] | ((state: MiddlewareState) => any) {
    const { offset: offsetConfig } = this._config

    if (typeof offsetConfig === 'string') {
      return offsetConfig.split(',').map(value => Number.parseInt(value, 10))
    }

    if (typeof offsetConfig === 'function') {
      return ({ placement, rects }) => {
        const result = offsetConfig({ placement, reference: rects.reference, floating: rects.floating }, this._element)
        return toFloatingOffset(result)
      }
    }

    return offsetConfig
  }

  protected _getFloatingMiddleware(): Middleware[] {
    const offsetValue = this._getOffset()

    const middleware = [
      offset(
        typeof offsetValue === 'function' ?
          offsetValue :
          toFloatingOffset(offsetValue)
      ),
      flip({
        fallbackPlacements: this._getFallbackPlacements(),
        // When no placement fits, keep the initial one. Overflow below can be
        // scrolled to; overflow above the scroll origin can never be reached.
        fallbackStrategy: 'initialPlacement'
      }),
      shift({
        boundary: (this._config.boundary === 'clippingParents' ? 'clippingAncestors' : this._config.boundary) as Boundary
      })
    ]

    return middleware
  }

  protected _getFallbackPlacements(): Placement[] {
    const placement = this._getPlacement()

    const fallbackMap: Record<string, Placement[]> = {
      bottom: ['top', 'bottom-start', 'bottom-end', 'top-start', 'top-end'],
      'bottom-start': ['top-start', 'bottom-end', 'top-end'],
      'bottom-end': ['top-end', 'bottom-start', 'top-start'],
      top: ['bottom', 'top-start', 'top-end', 'bottom-start', 'bottom-end'],
      'top-start': ['bottom-start', 'top-end', 'bottom-end'],
      'top-end': ['bottom-end', 'top-start', 'bottom-start'],
      right: ['left', 'right-start', 'right-end', 'left-start', 'left-end'],
      'right-start': ['left-start', 'right-end', 'left-end', 'top-start', 'bottom-start'],
      'right-end': ['left-end', 'right-start', 'left-start', 'top-end', 'bottom-end'],
      left: ['right', 'left-start', 'left-end', 'right-start', 'right-end'],
      'left-start': ['right-start', 'left-end', 'right-end', 'top-start', 'bottom-start'],
      'left-end': ['right-end', 'left-start', 'right-start', 'top-end', 'bottom-end']
    }

    return fallbackMap[placement] || ['top', 'bottom', 'right', 'left']
  }

  protected _getFloatingConfig(placement: string, middleware: Middleware[]): Record<string, any> {
    const defaultConfig = {
      placement,
      middleware,
      strategy: this._config.strategy
    }

    return {
      ...defaultConfig,
      ...execute(this._config.floatingConfig, [undefined, defaultConfig])
    }
  }

  protected _disposeFloating(): void {
    if (this._floatingCleanup) {
      this._floatingCleanup()
      this._floatingCleanup = null
    }
  }

  protected _getContainer(): HTMLElement | null {
    const { container } = this._config
    if (container === false) {
      return null
    }

    const target = container === true ? document.body : getElement(container)
    return target ? resolvePopupContainer(this._element, target) : null
  }

  protected _moveMenuToContainer(): void {
    const container = this._getContainer()
    if (!container || !this._menu) {
      return
    }

    if (this._menu.parentNode !== container) {
      container.append(this._menu)
    }

    // The menu is styled by its own direction, and out here it no longer
    // inherits the toggle's, so it carries it along.
    if (!this._menu.hasAttribute('dir')) {
      this._menuDirection = isRTL(this._element) ? 'rtl' : 'ltr'
      this._menu.dir = this._menuDirection
    }
  }

  protected _restoreMenuToOriginalParent(): void {
    if (!this._menuOriginalParent || !this._menu) {
      return
    }

    if (this._menu.parentNode !== this._menuOriginalParent) {
      this._menuOriginalParent.append(this._menu)
    }

    if (this._menuDirection && this._menu.dir === this._menuDirection) {
      this._menu.removeAttribute('dir')
      this._menuDirection = null
    }
  }

  protected async _applyFloatingPosition(reference: ReferenceElement, floating: HTMLElement, placement: Placement, middleware: Middleware[], strategy: Strategy = 'absolute'): Promise<string | null> {
    if (!floating.isConnected) {
      return null
    }

    const { x, y, placement: finalPlacement } = await computePosition(
      reference,
      floating,
      { placement, middleware, strategy }
    )

    if (!floating.isConnected) {
      return null
    }

    Object.assign(floating.style, {
      position: strategy,
      left: `${x}px`,
      top: `${y}px`,
      margin: '0'
    })

    Manipulator.setDataAttribute(floating, 'placement', finalPlacement)
    return finalPlacement
  }

  // -------------------------------------------------------------------------
  // Submenu handling
  // -------------------------------------------------------------------------

  protected _setupSubmenuListeners(): void {
    if (this._config.submenuTrigger === 'hover' || this._config.submenuTrigger === 'both') {
      this._listenOnMenu('mouseenter', this.constructor.SELECTOR_SUBMENU_TOGGLE, event => {
        this._onSubmenuTriggerEnter(event)
      })

      this._listenOnMenu('mouseleave', this.constructor.SELECTOR_SUBMENU, event => {
        this._onSubmenuLeave(event)
      })

      this._listenOnMenu('mousemove', null, event => {
        this._trackMousePosition(event)
      })
    }

    if (this._config.submenuTrigger === 'click' || this._config.submenuTrigger === 'both') {
      this._listenOnMenu('click', this.constructor.SELECTOR_SUBMENU_TOGGLE, event => {
        this._onSubmenuTriggerClick(event)
      })

      this._listenOnMenu('pointerdown', this.constructor.SELECTOR_SUBMENU_TOGGLE, event => {
        if ((event as unknown as PointerEvent).pointerType !== 'mouse') {
          this._hoverOpenedSubmenus.clear()
        }
      })
    }
  }

  protected _listenOnMenu(type: string, selector: string | null, handler: EventCallable): void {
    if (selector) {
      EventHandler.on(this._menu, type, selector, handler)
    } else {
      EventHandler.on(this._menu, type, handler)
    }

    this._submenuListeners.push([type, selector, handler])
  }

  protected _onSubmenuTriggerEnter(event: CoreUIEvent): void {
    const trigger = (event.target as Element).closest<HTMLElement>(this.constructor.SELECTOR_SUBMENU_TOGGLE)
    if (!trigger) {
      return
    }

    const submenuWrapper = trigger.closest(this.constructor.SELECTOR_SUBMENU)!
    const submenu = SelectorEngine.findOne(this.constructor.SELECTOR_MENU, submenuWrapper)
    if (!submenu) {
      return
    }

    if (!this._openSubmenus.has(submenu)) {
      this._hoverOpenedSubmenus.add(submenu)
    }

    this._cancelSubmenuCloseTimeout(submenu)
    this._closeSiblingSubmenus(submenuWrapper)
    this._openSubmenu(trigger, submenu, submenuWrapper)
  }

  protected _onSubmenuLeave(event: CoreUIEvent): void {
    const submenuWrapper = (event.target as Element).closest(this.constructor.SELECTOR_SUBMENU)!
    const submenu = SelectorEngine.findOne(this.constructor.SELECTOR_MENU, submenuWrapper)
    if (!submenu || !this._openSubmenus.has(submenu)) {
      return
    }

    if (this._isMovingTowardSubmenu(event, submenu)) {
      return
    }

    this._scheduleSubmenuClose(submenu, submenuWrapper)
  }

  protected _onSubmenuTriggerClick(event: CoreUIEvent): void {
    const trigger = (event.target as Element).closest<HTMLElement>(this.constructor.SELECTOR_SUBMENU_TOGGLE)
    if (!trigger || isDisabled(trigger)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const submenuWrapper = trigger.closest(this.constructor.SELECTOR_SUBMENU)!
    const submenu = SelectorEngine.findOne(this.constructor.SELECTOR_MENU, submenuWrapper)
    if (!submenu) {
      return
    }

    if (this._hoverOpenedSubmenus.delete(submenu)) {
      return
    }

    if (this._openSubmenus.has(submenu)) {
      this._closeSubmenu(submenu, submenuWrapper)
    } else {
      this._closeSiblingSubmenus(submenuWrapper)
      this._openSubmenu(trigger, submenu, submenuWrapper)
    }
  }

  // Announce every submenu trigger up front. Waiting until the submenu opens hides
  // the popup from assistive technology until a user has already found it.
  protected _initSubmenuTriggers(): void {
    if (!this._menu) {
      return
    }

    for (const trigger of SelectorEngine.find(this.constructor.SELECTOR_SUBMENU_TOGGLE, this._menu)) {
      const submenu = SelectorEngine.findOne(this.constructor.SELECTOR_MENU, trigger.parentElement!)
      if (!submenu) {
        continue
      }

      trigger.setAttribute('aria-haspopup', 'menu')
      trigger.setAttribute('aria-expanded', String(this._openSubmenus.has(submenu)))
    }
  }

  protected _openSubmenu(trigger: HTMLElement, submenu: HTMLElement, submenuWrapper: Element): void {
    if (this._openSubmenus.has(submenu)) {
      return
    }

    trigger.setAttribute('aria-expanded', 'true')
    trigger.setAttribute('aria-haspopup', 'menu')

    // Keep the submenu transparent until Floating UI applies the first position, so
    // it doesn't flash at its CSS fallback position (top: 0, over the parent menu)
    // before being moved into place. `opacity` (unlike `visibility`/`display`) keeps
    // the submenu measurable for flip/shift and focusable for keyboard navigation.
    submenu.style.opacity = '0'
    submenu.classList.add(CLASS_NAME_SHOW)
    submenuWrapper.classList.add(CLASS_NAME_SHOW)

    const cleanup = this._createSubmenuFloating(trigger, submenu, submenuWrapper)
    const cancelClose = (): void => {
      this._cancelSubmenuCloseTimeout(submenu)
    }

    this._openSubmenus.set(submenu, () => {
      cleanup()
      EventHandler.off(submenu, 'mouseenter', cancelClose)
    })

    EventHandler.on(submenu, 'mouseenter', cancelClose)
  }

  protected _closeSubmenu(submenu: HTMLElement, submenuWrapper: Element): void {
    if (!this._openSubmenus.has(submenu)) {
      return
    }

    const nestedSubmenus = SelectorEngine.find(`${this.constructor.SELECTOR_SUBMENU} ${this.constructor.SELECTOR_MENU}.${CLASS_NAME_SHOW}`, submenu)
    for (const nested of nestedSubmenus) {
      const nestedWrapper = nested.closest(this.constructor.SELECTOR_SUBMENU)!
      this._closeSubmenu(nested, nestedWrapper)
    }

    const trigger = SelectorEngine.findOne(this.constructor.SELECTOR_SUBMENU_TOGGLE, submenuWrapper)

    const cleanup = this._openSubmenus.get(submenu)
    if (cleanup) {
      cleanup()
    }

    this._openSubmenus.delete(submenu)
    this._hoverOpenedSubmenus.delete(submenu)

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false')
    }

    submenu.classList.remove(CLASS_NAME_SHOW)
    submenuWrapper.classList.remove(CLASS_NAME_SHOW)

    // Keep the Floating UI position styles in place while the submenu fades out.
    // Clearing them here would let the submenu snap back to its CSS fallback
    // (`top: 0`, over the parent menu) for the duration of the close transition,
    // causing it to flash over the parent. They get recomputed on the next open
    // (and the opacity gate in `_openSubmenu` hides any stale position until then).
    submenu.style.opacity = ''
  }

  protected _closeAllSubmenus(): void {
    for (const [submenu] of this._openSubmenus) {
      const submenuWrapper = submenu.closest(this.constructor.SELECTOR_SUBMENU)!
      this._closeSubmenu(submenu, submenuWrapper)
    }
  }

  protected _closeSiblingSubmenus(currentSubmenuWrapper: Element): void {
    const parent = currentSubmenuWrapper.parentNode!
    const siblingSubmenus = SelectorEngine.find(`${this.constructor.SELECTOR_SUBMENU} > ${this.constructor.SELECTOR_MENU}.${CLASS_NAME_SHOW}`, parent)

    for (const siblingMenu of siblingSubmenus) {
      const siblingWrapper = siblingMenu.closest(this.constructor.SELECTOR_SUBMENU)!
      if (siblingWrapper !== currentSubmenuWrapper) {
        this._closeSubmenu(siblingMenu, siblingWrapper)
      }
    }
  }

  protected _createSubmenuFloating(trigger: HTMLElement, submenu: HTMLElement, submenuWrapper: Element): () => void {
    const referenceElement = submenuWrapper
    const placement = this._resolveLogicalPlacement(SUBMENU_PLACEMENT, trigger) as Placement
    const middleware = [
      offset({ mainAxis: 0, crossAxis: -4 }),
      flip({
        fallbackPlacements: [
          this._resolveLogicalPlacement('start-start', trigger),
          this._resolveLogicalPlacement('end-end', trigger),
          this._resolveLogicalPlacement('start-end', trigger)
        ] as Placement[]
      }),
      shift({ padding: 8 })
    ]

    const updatePosition = () => this._applyFloatingPosition(referenceElement, submenu, placement, middleware)
      .then(finalPlacement => {
        // Reveal the submenu now that it has been positioned (see `_openSubmenu`);
        // clearing the inline opacity lets the CSS fade-in transition take over.
        submenu.style.opacity = ''
        return finalPlacement
      })

    updatePosition()
    return autoUpdate(referenceElement, submenu, updatePosition)
  }

  protected _scheduleSubmenuClose(submenu: HTMLElement, submenuWrapper: Element): void {
    this._cancelSubmenuCloseTimeout(submenu)

    const timeoutId = setTimeout(() => {
      this._closeSubmenu(submenu, submenuWrapper)
      this._submenuCloseTimeouts.delete(submenu)
    }, this._config.submenuDelay)

    this._submenuCloseTimeouts.set(submenu, timeoutId)
  }

  protected _cancelSubmenuCloseTimeout(submenu: HTMLElement): void {
    const timeoutId = this._submenuCloseTimeouts.get(submenu)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this._submenuCloseTimeouts.delete(submenu)
    }
  }

  protected _clearAllSubmenuTimeouts(): void {
    for (const timeoutId of this._submenuCloseTimeouts.values()) {
      clearTimeout(timeoutId)
    }

    this._submenuCloseTimeouts.clear()
  }

  // -------------------------------------------------------------------------
  // Hover intent / Safe triangle
  // -------------------------------------------------------------------------

  protected _trackMousePosition(event: CoreUIEvent): void {
    this._hoverIntentData = {
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now()
    }
  }

  protected _isMovingTowardSubmenu(event: CoreUIEvent, submenu: HTMLElement): boolean {
    if (!this._hoverIntentData) {
      return false
    }

    const submenuRect = submenu.getBoundingClientRect()
    const currentPos = { x: event.clientX, y: event.clientY }
    const lastPos = { x: this._hoverIntentData.x, y: this._hoverIntentData.y }

    const isRtl = isRTL(submenu)
    const targetX = isRtl ? submenuRect.right : submenuRect.left
    const topCorner = { x: targetX, y: submenuRect.top }
    const bottomCorner = { x: targetX, y: submenuRect.bottom }

    return this._pointInTriangle(currentPos, lastPos, topCorner, bottomCorner)
  }

  protected _pointInTriangle(point: Point, v1: Point, v2: Point, v3: Point): boolean {
    const d1 = triangleSign(point, v1, v2)
    const d2 = triangleSign(point, v2, v3)
    const d3 = triangleSign(point, v3, v1)

    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0)
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0)

    return !(hasNeg && hasPos)
  }

  // -------------------------------------------------------------------------
  // Keyboard navigation
  // -------------------------------------------------------------------------

  // Items sit either directly in `.menu`, or as a submenu trigger one level deeper
  // (`.menu > .submenu > .menu-item`). Both are navigable at the same level.
  protected _getItemsInMenu(menu: Element): HTMLElement[] {
    const { SELECTOR_SUBMENU, SELECTOR_VISIBLE_ITEMS } = this.constructor
    return SelectorEngine.find(
      [':scope', ':scope > [role="group"]', ':scope > [role="group"] > *'].flatMap(level => [`${level} > ${SELECTOR_VISIBLE_ITEMS}`, `${level} > ${SELECTOR_SUBMENU} > ${SELECTOR_VISIBLE_ITEMS}`]).join(', '),
      menu
    ).filter(element => isVisible(element))
  }

  protected _getLevelMenu(target: Element): Element {
    return (this._menu.contains(target) && target.closest(this.constructor.SELECTOR_MENU)) || this._menu
  }

  protected _selectMenuItem({ key, target }: CoreUIEvent): void {
    const currentMenu = this._getLevelMenu(target as Element)
    const items = this._getItemsInMenu(currentMenu)

    if (!items.length) {
      return
    }

    const nextItem = getNextActiveElement(items, target as HTMLElement, key === ARROW_DOWN_KEY, this._config.loopFocus || !items.includes(target as HTMLElement))
    nextItem.focus()
    this._closeUnrelatedSubmenus(currentMenu, nextItem)
  }

  // Moving focus along one level closes the submenus focus left behind, matching
  // what hover and click already do through `_closeSiblingSubmenus`.
  protected _closeUnrelatedSubmenus(currentMenu: Element, focusedElement: HTMLElement): void {
    for (const [submenu] of this._openSubmenus) {
      const submenuWrapper = submenu.closest(this.constructor.SELECTOR_SUBMENU)

      if (!submenuWrapper || submenuWrapper.parentElement !== currentMenu || submenuWrapper.contains(focusedElement)) {
        continue
      }

      this._closeSubmenu(submenu, submenuWrapper)
    }
  }

  protected _onTabInside(target: HTMLElement): void {
    this._closeUnrelatedSubmenus(this._getLevelMenu(target), target)
  }

  protected _handleTab(event: CoreUIEvent): void {
    const fromToggle = this._element.contains(event.target as Node)

    if (!this._isMenu) {
      this._tabThroughContainer(event, fromToggle)
      return
    }

    this._completeHide({ relatedTarget: this._element }, false)

    if (fromToggle) {
      return
    }

    if (this._isShown() || event.shiftKey) {
      event.preventDefault()
    }

    if (!this._isShown()) {
      this._element.focus({ preventScroll: true })
    }
  }

  protected _tabThroughContainer(event: CoreUIEvent, fromToggle: boolean): void {
    if (!this._getContainer()) {
      return
    }

    const focusables = SelectorEngine.focusableChildren(this._menu)

    if (fromToggle) {
      if (!event.shiftKey && focusables.length) {
        event.preventDefault()
        focusables[0].focus()
      }

      return
    }

    if (event.shiftKey ? event.target === focusables[0] : event.target === focusables.at(-1)) {
      if (event.shiftKey) {
        event.preventDefault()
      } else {
        this._menu.inert = true
        setTimeout(() => {
          this._menu.inert = false
        })
      }

      this._element.focus({ preventScroll: true })
    }
  }

  protected _handleSubmenuKeydown(event: CoreUIEvent): boolean {
    const { key, target } = event
    const submenuWrapper = (target as Element).closest(this.constructor.SELECTOR_SUBMENU)
    const isRtl = isRTL(submenuWrapper ?? target as Element)

    const enterKey = isRtl ? ARROW_LEFT_KEY : ARROW_RIGHT_KEY
    const exitKey = isRtl ? ARROW_RIGHT_KEY : ARROW_LEFT_KEY

    const isSubmenuToggle = (target as Element).matches(this.constructor.SELECTOR_SUBMENU_TOGGLE)

    const isOpenKey = key === ENTER_KEY || key === SPACE_KEY || key === enterKey

    if (isOpenKey && submenuWrapper && isSubmenuToggle) {
      event.preventDefault()
      event.stopPropagation()

      const submenu = SelectorEngine.findOne(this.constructor.SELECTOR_MENU, submenuWrapper)
      if (submenu) {
        this._closeSiblingSubmenus(submenuWrapper)
        this._openSubmenu(target as HTMLElement, submenu, submenuWrapper)
        requestAnimationFrame(() => {
          const firstItem = SelectorEngine.findOne(this.constructor.SELECTOR_VISIBLE_ITEMS, submenu)
          if (firstItem) {
            firstItem.focus()
          }
        })
      }

      return true
    }

    if (key === exitKey) {
      const currentMenu = (target as Element).closest(this.constructor.SELECTOR_MENU)
      const parentSubmenuWrapper = currentMenu?.closest(this.constructor.SELECTOR_SUBMENU)

      if (parentSubmenuWrapper) {
        event.preventDefault()
        event.stopPropagation()

        const parentTrigger = SelectorEngine.findOne(this.constructor.SELECTOR_SUBMENU_TOGGLE, parentSubmenuWrapper)
        this._closeSubmenu(currentMenu as HTMLElement, parentSubmenuWrapper)
        if (parentTrigger) {
          parentTrigger.focus()
        }

        return true
      }
    }

    if ((key === HOME_KEY || key === END_KEY) && this._isShown()) {
      event.preventDefault()
      event.stopPropagation()

      const currentMenu = this._getLevelMenu(target as Element)
      const items = this._getItemsInMenu(currentMenu)

      if (items.length) {
        const targetItem = key === HOME_KEY ? items[0] : items.at(-1)!
        targetItem.focus()
        this._closeUnrelatedSubmenus(currentMenu, targetItem)
      }

      return true
    }

    return false
  }

  static clearMenus(event: CoreUIEvent): void {
    if ((event.type === 'click' && event.button === RIGHT_MOUSE_BUTTON) || (event.type === 'keyup' && event.key !== TAB_KEY)) {
      return
    }

    for (const instance of Menu._openInstances) {
      if (event.type === 'keyup' && instance._menu.contains(event.target as Node)) {
        instance._onTabInside(event.target as HTMLElement)
      }

      if (instance._config.autoClose === false) {
        continue
      }

      const composedPath = event.composedPath()
      const isMenuTarget = composedPath.includes(instance._menu)
      const pressPath = isMenuTarget ? null : pressPathOf(event)
      if (
        instance._isToggleTarget(composedPath) ||
        (pressPath && (pressPath.includes(instance._menu) || instance._isToggleTarget(pressPath))) ||
        (instance._config.autoClose === 'inside' && !isMenuTarget) ||
        (instance._config.autoClose === 'outside' && isMenuTarget)
      ) {
        continue
      }

      // Don't auto-close when interacting with a form inside the menu — clicks
      // on a form's labels, buttons, etc. (not just inputs) should keep it open.
      const formAncestor = (event.target as HTMLElement).closest?.('form')
      const isInsideMenuForm = Boolean(formAncestor) && instance._menu.contains(formAncestor!)
      if (instance._menu.contains(event.target as HTMLElement) && ((event.type === 'keyup' && event.key === TAB_KEY) ||
          /input|select|option|textarea|form/i.test((event.target as HTMLElement).tagName) || isInsideMenuForm)) {
        continue
      }

      const relatedTarget: Record<string, unknown> = { relatedTarget: instance._element }

      if (event.type === 'click') {
        relatedTarget.clickEvent = event
      }

      instance._completeHide(relatedTarget, isMenuTarget && event.type === 'click')
    }
  }

  static dataApiKeydownHandler(event: CoreUIEvent): void {
    const delegateTarget = event.delegateTarget as HTMLElement

    // Treat contenteditable hosts (e.g. rich-text editors) like inputs so the
    // menu doesn't hijack their arrow keys.
    const isInput = /input|select|textarea/i.test((event.target as HTMLElement).tagName) || (event.target as HTMLElement).isContentEditable
    const isEscapeEvent = event.key === ESCAPE_KEY
    const isUpOrDownEvent = [ARROW_UP_KEY, ARROW_DOWN_KEY].includes(event.key)
    const isLeftOrRightEvent = [ARROW_LEFT_KEY, ARROW_RIGHT_KEY].includes(event.key)
    const isHomeOrEndEvent = [HOME_KEY, END_KEY].includes(event.key)
    const isEnterOrSpaceEvent = [ENTER_KEY, SPACE_KEY].includes(event.key)

    const isSubmenuTrigger = (event.target as Element).matches(this.SELECTOR_SUBMENU_TOGGLE)
    const isSpaceOnLinkToggle = event.key === SPACE_KEY && delegateTarget === event.target && delegateTarget.matches(`a${this.SELECTOR_DATA_TOGGLE}`)

    if (!isUpOrDownEvent && !isEscapeEvent && !isLeftOrRightEvent && !isHomeOrEndEvent &&
        !(isEnterOrSpaceEvent && isSubmenuTrigger) && !isSpaceOnLinkToggle) {
      return
    }

    if ((isInput && !isEscapeEvent) || (delegateTarget.matches(SELECTOR_MENU_FAMILY) && (event.target as Element).closest(SELECTOR_MENU_FAMILY) !== delegateTarget)) {
      return
    }

    if (isSpaceOnLinkToggle) {
      if (this.getOrCreateInstance(delegateTarget)._isMenu) {
        event.preventDefault()
        delegateTarget.click()
      }

      return
    }

    const instance = this._getKeyboardInstance(delegateTarget)

    if (!instance) {
      return
    }

    if ((isLeftOrRightEvent || isHomeOrEndEvent || (isEnterOrSpaceEvent && isSubmenuTrigger)) && instance._handleSubmenuKeydown(event)) {
      return
    }

    if (isUpOrDownEvent) {
      event.preventDefault()
      event.stopPropagation()
      instance.show()
      instance._selectMenuItem(event)
      return
    }

    if (isEscapeEvent && instance._isShown()) {
      event.preventDefault()
      event.stopPropagation()

      const currentMenu = (event.target as Element).closest(this.SELECTOR_MENU)
      const parentSubmenuWrapper = currentMenu?.closest(this.SELECTOR_SUBMENU)

      if (parentSubmenuWrapper && instance._openSubmenus.size > 0) {
        const parentTrigger = SelectorEngine.findOne(this.SELECTOR_SUBMENU_TOGGLE, parentSubmenuWrapper)
        instance._closeSubmenu(currentMenu as HTMLElement, parentSubmenuWrapper)
        if (parentTrigger) {
          parentTrigger.focus()
        }

        return
      }

      instance.hide()
    }
  }

  // A key event from inside an open menu belongs to the instance that opened
  // it, whatever its class and wherever `container` moved the menu; only a
  // closed menu is resolved through the toggle next to it.
  protected static _getKeyboardInstance(delegateTarget: HTMLElement): Menu | null {
    const owner = Menu._getOpenInstance(delegateTarget)
    if (owner) {
      return owner
    }

    const toggle = delegateTarget.matches(this.SELECTOR_DATA_TOGGLE) ?
      delegateTarget :
      (SelectorEngine.prev(delegateTarget, this.SELECTOR_DATA_TOGGLE)[0] ||
        SelectorEngine.next(delegateTarget, this.SELECTOR_DATA_TOGGLE)[0] ||
        SelectorEngine.findOne(this.SELECTOR_DATA_TOGGLE, delegateTarget.parentNode ?? undefined))

    return toggle ? this.getOrCreateInstance(toggle) : null
  }

  protected static _getOpenInstance(target: Element): Menu | null {
    let owner: Menu | null = null

    for (const instance of Menu._openInstances) {
      if (instance._element === target) {
        return instance
      }

      if (instance._menu.contains(target) && (!owner || owner._menu.contains(instance._menu))) {
        owner = instance
      }
    }

    return owner
  }

  static dataApiClickHandler(event: CoreUIEvent): void {
    event.preventDefault()

    const instance = this.getOrCreateInstance(event.delegateTarget as HTMLElement) as Menu
    instance._openedBy = pressPathOf(event) ? 'pointer' : 'key'
    instance.toggle()
    instance._openedBy = null
  }

  static dataApiTabHandler(event: CoreUIEvent): void {
    if (event.key === TAB_KEY) {
      Menu._getOpenInstance(event.target as Element)?._handleTab(event)
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, Menu, config)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, EVENT_KEYDOWN_DATA_API, Menu.SELECTOR_DATA_TOGGLE, event => Menu.dataApiKeydownHandler(event))
EventHandler.on(document, EVENT_KEYDOWN_DATA_API, Menu.SELECTOR_MENU, event => Menu.dataApiKeydownHandler(event))
trackPress()
EventHandler.on(document, EVENT_CLICK_DATA_API, Menu.clearMenus)
EventHandler.on(document, EVENT_KEYDOWN_DATA_API, Menu.dataApiTabHandler)
EventHandler.on(document, EVENT_KEYUP_DATA_API, Menu.clearMenus)
EventHandler.on(document, EVENT_CLICK_DATA_API, Menu.SELECTOR_DATA_TOGGLE, event => Menu.dataApiClickHandler(event))

/**
 * jQuery
 */

defineJQueryPlugin(Menu)

export default Menu
export type { MenuConfig }

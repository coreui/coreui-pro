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
import EventHandler, { type CoreUIEvent } from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import type { ComponentConfig } from './util/config.js'
import {
  defineJQueryPlugin,
  execute,
  getElement,
  getNextActiveElement,
  isDisabled,
  isElement,
  isRTL,
  isVisible,
  noop
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

const SELECTOR_NAVBAR_NAV = '.navbar-nav'

const DEFAULT_PLACEMENT = 'bottom-start'
const SUBMENU_PLACEMENT = 'end-start'

const resolveLogicalPlacement = (placement: string): string => {
  if (isRTL()) {
    return placement.replace(/^start(?=-|$)/, 'right').replace(/^end(?=-|$)/, 'left')
  }

  return placement.replace(/^start(?=-|$)/, 'left').replace(/^end(?=-|$)/, 'right')
}

type Point = { x: number, y: number }

const triangleSign = (p1: Point, p2: Point, p3: Point): number =>
  ((p1.x - p3.x) * (p2.y - p3.y)) - ((p2.x - p3.x) * (p1.y - p3.y))

type MenuConfig = {
  autoClose: boolean | 'inside' | 'outside'
  boundary: string | Element
  container: string | Element | boolean
  display: string
  offset: FloatingOffsetOption
  floatingConfig: FloatingConfigOption
  menu: HTMLElement | null
  placement: string
  reference: string | Element | Record<string, any>
  strategy: string
  submenuTrigger: string
  submenuDelay: number
}

const Default: MenuConfig = {
  autoClose: true,
  boundary: 'clippingParents',
  container: false,
  display: 'dynamic',
  offset: [0, 2],
  floatingConfig: null,
  menu: null,
  placement: DEFAULT_PLACEMENT,
  reference: 'toggle',
  strategy: 'absolute',
  submenuTrigger: 'both',
  submenuDelay: SUBMENU_CLOSE_DELAY
}

const DefaultType = {
  autoClose: '(boolean|string)',
  boundary: '(string|element)',
  container: '(string|element|boolean)',
  display: 'string',
  offset: '(array|string|function)',
  floatingConfig: '(null|object|function)',
  menu: '(null|element)',
  placement: 'string',
  reference: '(string|element|object)',
  strategy: 'string',
  submenuTrigger: 'string',
  submenuDelay: 'number'
}

/**
 * Class definition
 */

class Menu extends BaseComponent {
  declare ['constructor']: typeof Menu
  static _openInstances: Set<Menu> = new Set<Menu>()
  protected declare _config: MenuConfig
  protected declare _floatingCleanup: (() => void) | null
  protected declare _mediaQueryListeners: BreakpointListener[]
  protected declare _responsivePlacements: ResponsivePlacements | null
  protected declare _parent: HTMLElement
  protected declare _openSubmenus: Map<HTMLElement, () => void>
  protected declare _submenuCloseTimeouts: Map<HTMLElement, number>
  protected declare _hoverIntentData: { x: number, y: number, timestamp: number } | null
  protected declare _menu: HTMLElement
  protected declare _isSubmenu: boolean
  protected declare _menuOriginalParent: ParentNode | null

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    if (typeof computePosition === 'undefined') {
      throw new TypeError('CoreUI\'s menus require Floating UI (https://floating-ui.com)')
    }

    super(element, config)

    this._floatingCleanup = null
    this._mediaQueryListeners = []
    this._responsivePlacements = null
    this._parent = this._element.parentNode as HTMLElement // menu wrapper
    this._openSubmenus = new Map()
    this._submenuCloseTimeouts = new Map()
    this._hoverIntentData = null

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

    this._parseResponsivePlacements()
    this._setupSubmenuListeners()
  }

  // Getters
  //
  // The selectors are part of the class surface on purpose: Dropdown overrides
  // them to keep the v5 markup working on this implementation.
  static get SELECTOR_DATA_TOGGLE(): string {
    return '[data-coreui-toggle="menu"]:not(.disabled):not(:disabled)'
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
    if (isDisabled(this._element) || this._isShown()) {
      return
    }

    const relatedTarget = {
      relatedTarget: this._element
    }

    const showEvent = EventHandler.trigger(this._element, this.constructor.eventName('show'), relatedTarget)

    if (showEvent.defaultPrevented) {
      return
    }

    this._moveMenuToContainer()
    this._createFloating()

    if ('ontouchstart' in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
      for (const element of document.body.children) {
        EventHandler.on(element, 'mouseover', noop)
      }
    }

    this._element.focus({ focusVisible: false } as FocusOptions)
    this._element.setAttribute('aria-expanded', 'true')

    this._menu.classList.add(CLASS_NAME_SHOW)
    this._element.classList.add(CLASS_NAME_SHOW)

    if (this._parent) {
      this._parent.classList.add(CLASS_NAME_SHOW)
    }

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
    super.dispose()
  }

  update(): void {
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

  protected _completeHide(relatedTarget: Record<string, unknown>): void {
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

    this._disposeFloating()
    this._restoreMenuToOriginalParent()

    this._menu.classList.remove(CLASS_NAME_SHOW)
    this._element.classList.remove(CLASS_NAME_SHOW)

    if (this._parent) {
      this._parent.classList.remove(CLASS_NAME_SHOW)
    }

    this._element.setAttribute('aria-expanded', 'false')
    this._removeMenuAttributes()
    Menu._openInstances.delete(this)
    EventHandler.trigger(this._element, this.constructor.eventName('hidden'), relatedTarget)
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
      throw new TypeError(`${NAME.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`)
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
      this._config.placement

    return resolveLogicalPlacement(placement)
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

    return container === true ? document.body : getElement(container)
  }

  protected _moveMenuToContainer(): void {
    const container = this._getContainer()
    if (!container || !this._menu) {
      return
    }

    if (this._menu.parentNode !== container) {
      container.append(this._menu)
    }
  }

  protected _restoreMenuToOriginalParent(): void {
    if (!this._menuOriginalParent || !this._menu) {
      return
    }

    if (this._menu.parentNode !== this._menuOriginalParent) {
      this._menuOriginalParent.append(this._menu)
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
      EventHandler.on(this._menu, 'mouseenter', this.constructor.SELECTOR_SUBMENU_TOGGLE, event => {
        this._onSubmenuTriggerEnter(event)
      })

      EventHandler.on(this._menu, 'mouseleave', this.constructor.SELECTOR_SUBMENU, event => {
        this._onSubmenuLeave(event)
      })

      EventHandler.on(this._menu, 'mousemove', event => {
        this._trackMousePosition(event)
      })
    }

    if (this._config.submenuTrigger === 'click' || this._config.submenuTrigger === 'both') {
      EventHandler.on(this._menu, 'click', this.constructor.SELECTOR_SUBMENU_TOGGLE, event => {
        this._onSubmenuTriggerClick(event)
      })
    }
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
    if (!trigger) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const submenuWrapper = trigger.closest(this.constructor.SELECTOR_SUBMENU)!
    const submenu = SelectorEngine.findOne(this.constructor.SELECTOR_MENU, submenuWrapper)
    if (!submenu) {
      return
    }

    if (this._openSubmenus.has(submenu)) {
      this._closeSubmenu(submenu, submenuWrapper)
    } else {
      this._closeSiblingSubmenus(submenuWrapper)
      this._openSubmenu(trigger, submenu, submenuWrapper)
    }
  }

  protected _openSubmenu(trigger: HTMLElement, submenu: HTMLElement, submenuWrapper: Element): void {
    if (this._openSubmenus.has(submenu)) {
      return
    }

    trigger.setAttribute('aria-expanded', 'true')
    trigger.setAttribute('aria-haspopup', 'true')

    // Keep the submenu transparent until Floating UI applies the first position, so
    // it doesn't flash at its CSS fallback position (top: 0, over the parent menu)
    // before being moved into place. `opacity` (unlike `visibility`/`display`) keeps
    // the submenu measurable for flip/shift and focusable for keyboard navigation.
    submenu.style.opacity = '0'
    submenu.classList.add(CLASS_NAME_SHOW)
    submenuWrapper.classList.add(CLASS_NAME_SHOW)

    const cleanup = this._createSubmenuFloating(trigger, submenu, submenuWrapper)
    this._openSubmenus.set(submenu, cleanup)

    EventHandler.on(submenu, 'mouseenter', () => {
      this._cancelSubmenuCloseTimeout(submenu)
    })
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
    EventHandler.off(submenu, 'mouseenter')

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
    const placement = resolveLogicalPlacement(SUBMENU_PLACEMENT) as Placement
    const middleware = [
      offset({ mainAxis: 0, crossAxis: -4 }),
      flip({
        fallbackPlacements: [
          resolveLogicalPlacement('start-start'),
          resolveLogicalPlacement('end-end'),
          resolveLogicalPlacement('start-end')
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

    const isRtl = isRTL()
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

  protected _selectMenuItem({ key, target }: CoreUIEvent): void {
    const currentMenu = (target as Element).closest(this.constructor.SELECTOR_MENU) || this._menu
    const items = SelectorEngine.find(`:scope > ${this.constructor.SELECTOR_VISIBLE_ITEMS}`, currentMenu)
      .filter(element => isVisible(element))

    if (!items.length) {
      return
    }

    getNextActiveElement(items, target as HTMLElement, key === ARROW_DOWN_KEY, !items.includes(target as HTMLElement)).focus()
  }

  protected _handleSubmenuKeydown(event: CoreUIEvent): boolean {
    const { key, target } = event
    const isRtl = isRTL()

    const enterKey = isRtl ? ARROW_LEFT_KEY : ARROW_RIGHT_KEY
    const exitKey = isRtl ? ARROW_RIGHT_KEY : ARROW_LEFT_KEY

    const submenuWrapper = (target as Element).closest(this.constructor.SELECTOR_SUBMENU)
    const isSubmenuToggle = (target as Element).matches(this.constructor.SELECTOR_SUBMENU_TOGGLE)

    if ((key === ENTER_KEY || key === SPACE_KEY) && submenuWrapper && isSubmenuToggle) {
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

    if (key === enterKey && submenuWrapper && isSubmenuToggle) {
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

    if (key === HOME_KEY || key === END_KEY) {
      event.preventDefault()
      event.stopPropagation()

      const currentMenu = (target as Element).closest(this.constructor.SELECTOR_MENU)!
      const items = SelectorEngine.find(`:scope > ${this.constructor.SELECTOR_VISIBLE_ITEMS}`, currentMenu)
        .filter(element => isVisible(element))

      if (items.length) {
        const targetItem = key === HOME_KEY ? items[0] : items[items.length - 1]
        targetItem.focus()
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
      if (instance._config.autoClose === false) {
        continue
      }

      const composedPath = event.composedPath()
      const isMenuTarget = composedPath.includes(instance._menu)
      if (
        instance._isToggleTarget(composedPath) ||
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

      instance._completeHide(relatedTarget)
    }
  }

  static dataApiKeydownHandler(event: CoreUIEvent): void {
    const delegateTarget = event.delegateTarget as HTMLElement

    // Treat contenteditable hosts (e.g. rich-text editors) like inputs so the
    // menu doesn't hijack their arrow keys.
    const isInput = /input|textarea/i.test((event.target as HTMLElement).tagName) || (event.target as HTMLElement).isContentEditable
    const isEscapeEvent = event.key === ESCAPE_KEY
    const isUpOrDownEvent = [ARROW_UP_KEY, ARROW_DOWN_KEY].includes(event.key)
    const isLeftOrRightEvent = [ARROW_LEFT_KEY, ARROW_RIGHT_KEY].includes(event.key)
    const isHomeOrEndEvent = [HOME_KEY, END_KEY].includes(event.key)
    const isEnterOrSpaceEvent = [ENTER_KEY, SPACE_KEY].includes(event.key)

    const isSubmenuTrigger = (event.target as Element).matches(this.SELECTOR_SUBMENU_TOGGLE)

    if (!isUpOrDownEvent && !isEscapeEvent && !isLeftOrRightEvent && !isHomeOrEndEvent &&
        !(isEnterOrSpaceEvent && isSubmenuTrigger)) {
      return
    }

    if (isInput && !isEscapeEvent) {
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
      instance._element.focus()
    }
  }

  // A key event from inside an open menu belongs to the instance that opened
  // it, whatever its class and wherever `container` moved the menu; only a
  // closed menu is resolved through the toggle next to it.
  protected static _getKeyboardInstance(delegateTarget: HTMLElement): Menu | null {
    for (const instance of Menu._openInstances) {
      if (instance._menu.contains(delegateTarget)) {
        return instance
      }
    }

    const toggle = delegateTarget.matches(this.SELECTOR_DATA_TOGGLE) ?
      delegateTarget :
      (SelectorEngine.prev(delegateTarget, this.SELECTOR_DATA_TOGGLE)[0] ||
        SelectorEngine.next(delegateTarget, this.SELECTOR_DATA_TOGGLE)[0] ||
        SelectorEngine.findOne(this.SELECTOR_DATA_TOGGLE, delegateTarget.parentNode ?? undefined))

    return toggle ? this.getOrCreateInstance(toggle) : null
  }

  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Menu.getOrCreateInstance(this, config)

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
 */

EventHandler.on(document, EVENT_KEYDOWN_DATA_API, Menu.SELECTOR_DATA_TOGGLE, event => Menu.dataApiKeydownHandler(event))
EventHandler.on(document, EVENT_KEYDOWN_DATA_API, Menu.SELECTOR_MENU, event => Menu.dataApiKeydownHandler(event))
EventHandler.on(document, EVENT_CLICK_DATA_API, Menu.clearMenus)
EventHandler.on(document, EVENT_KEYUP_DATA_API, Menu.clearMenus)
EventHandler.on(document, EVENT_CLICK_DATA_API, Menu.SELECTOR_DATA_TOGGLE, function (event) {
  event.preventDefault()
  Menu.getOrCreateInstance(this).toggle()
})

/**
 * jQuery
 */

defineJQueryPlugin(Menu)

export default Menu
export type { MenuConfig }

/**
 * --------------------------------------------------------------------------
 * CoreUI tooltip.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's tooltip.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
  autoUpdate,
  type Boundary,
  type Middleware,
  type Placement
} from '@floating-ui/dom'
import BaseComponent from './base-component.js'
import EventHandler, { type CoreUIEvent } from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import type { ComponentConfig } from './util/config.js'
import { containsFocus, focusIfUsable } from './util/focus.js'
import {
  closeLayersIn, handleEscape, reanchorLayer, registerLayer, unregisterLayer, type LayerEntry
} from './util/layers.js'
import {
  defineJQueryPlugin, execute, findShadowRoot, getElement, getUID, isRTL, jQueryDispatch, noop, splitIds, writeAttribute
} from './util/index.js'
import { DefaultAllowlist, type SanitizerAllowList } from './util/sanitizer.js'
import { followPointerIntent, type Point } from './util/safe-triangle.js'
import TemplateFactory, { type TemplateContentEntry } from './util/template-factory.js'
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

const NAME = 'tooltip'

const CLASS_NAME_SHOW = 'show'

const ATTRIBUTE_MOVING = 'data-coreui-moving'

const SELECTOR_TOOLTIP_INNER = '.tooltip-inner'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="tooltip"]'
const SELECTOR_DATA_ANCHORS = '[data-coreui-toggle="tooltip"][data-coreui-anchors]'

const TRIGGER_HOVER = 'hover'
const TRIGGER_FOCUS = 'focus'
const TRIGGER_CLICK = 'click'
const TRIGGER_MANUAL = 'manual'

const EVENT_HIDE = 'hide'
const EVENT_HIDDEN = 'hidden'
const EVENT_SHOW = 'show'
const EVENT_SHOWN = 'shown'
const EVENT_INSERTED = 'inserted'
const EVENT_MOVE = 'move'
const EVENT_MOVED = 'moved'
const EVENT_CLICK = 'click'
const EVENT_FOCUSIN = 'focusin'
const EVENT_FOCUSOUT = 'focusout'
const EVENT_MOUSEENTER = 'mouseenter'
const EVENT_MOUSELEAVE = 'mouseleave'
const EVENT_KEYDOWN = 'keydown'
const EVENT_POINTERCANCEL = 'pointercancel'
const EVENT_POINTERDOWN = 'pointerdown'

const ANCHOR_LEAVE_DELAY = 100
const ANCHOR_SWITCH_DELAY = 30

const ATTACHMENTS: Record<string, [string, string]> = {
  AUTO: ['auto', 'auto'],
  TOP: ['top', 'top'],
  RIGHT: ['right', 'left'],
  BOTTOM: ['bottom', 'bottom'],
  LEFT: ['left', 'right'],
  START: ['left', 'right'],
  END: ['right', 'left']
}

type TooltipConfig = {
  allowList: SanitizerAllowList
  anchors: string | boolean
  animation: boolean
  boundary: string | Element
  container: string | Element | boolean
  customClass: string | ((...args: any[]) => string)
  delay: number | { show: number, hide: number }
  disabled: boolean
  fallbackPlacements: string[]
  floatingConfig: FloatingConfigOption
  html: boolean
  offset: FloatingOffsetOption
  placement: string | ((this: Tooltip, tip: HTMLElement, trigger: HTMLElement) => string)
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  selector: string | boolean
  template: string
  title: string | Element | ((...args: any[]) => string | Element)
  trigger: string
}

// Delegated tooltips are created on the fly with their `trigger` forced to
// `manual`, so the real trigger is stored here for later reference.
type TooltipInternalConfig = TooltipConfig & { _trigger: string }

const Default: TooltipConfig = {
  allowList: DefaultAllowlist,
  anchors: false,
  animation: true,
  boundary: 'clippingParents',
  container: false,
  customClass: '',
  delay: 0,
  disabled: false,
  fallbackPlacements: ['top', 'right', 'bottom', 'left'],
  floatingConfig: null,
  html: false,
  offset: [0, 6],
  placement: 'top',
  sanitize: true,
  sanitizeFn: null,
  selector: false,
  template: '<div class="tooltip" role="tooltip">' +
            '<div class="tooltip-arrow"></div>' +
            '<div class="tooltip-inner"></div>' +
            '</div>',
  title: '',
  trigger: 'hover focus'
}

const DefaultType = {
  allowList: 'object',
  anchors: '(string|boolean)',
  animation: 'boolean',
  boundary: '(string|element)',
  container: '(string|element|boolean)',
  customClass: '(string|function)',
  delay: '(number|object)',
  disabled: 'boolean',
  fallbackPlacements: 'array',
  floatingConfig: '(null|object|function)',
  html: 'boolean',
  offset: '(array|string|function)',
  placement: '(string|function)',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  selector: '(string|boolean)',
  template: 'string',
  title: '(string|element|function)',
  trigger: 'string'
}

/**
 * Class definition
 */

class Tooltip extends BaseComponent {
  declare ['constructor']: typeof Tooltip
  protected declare _config: TooltipConfig
  protected declare _isEnabled: boolean
  protected declare _timeout: number
  protected declare _resolveTimeout: (() => void) | null
  protected declare _isHovered: boolean | null
  protected declare _activeTrigger: Record<string, boolean>
  protected declare _openedBy: string | null
  protected declare _floatingCleanup: (() => void) | null
  protected declare _keydownHandler: ((event: KeyboardEvent) => void) | null
  protected declare _focusOutsideHandler: ((event: Event) => void) | null
  protected declare _pressedInside: boolean
  protected declare _tipEventOut: ((event: CoreUIEvent) => void) | null
  protected declare _templateFactory: TemplateFactory | null
  protected declare _newContent: Record<string, TemplateContentEntry> | null
  protected declare _mediaQueryListeners: BreakpointListener[]
  protected declare _responsivePlacements: ResponsivePlacements | null
  protected declare _layer: LayerEntry
  protected declare _anchor: HTMLElement
  protected declare _described: Element | null
  protected declare _focusedAnchor: HTMLElement | null
  protected declare _switchTimeout: number
  protected declare _exitPoint: Point | null
  protected declare _intent: (() => void) | null
  declare tip: HTMLElement | null

  constructor(element?: string | Element | null, config?: Partial<TooltipConfig> | null) {
    if (typeof computePosition === 'undefined') {
      throw new TypeError('CoreUI\'s tooltips require Floating UI (https://floating-ui.com)')
    }

    super(element, config)

    // Private
    this._isEnabled = !this._config.disabled
    this._timeout = 0
    this._resolveTimeout = null
    this._isHovered = null
    this._activeTrigger = {}
    this._openedBy = null
    this._floatingCleanup = null
    this._keydownHandler = null
    this._focusOutsideHandler = null
    this._layer = {
      anchor: () => this._anchor,
      closesOn: reason => reason === 'escape' || reason === 'parent',
      closesSiblings: () => false,
      dismiss: () => {
        this.hide()
      },
      escapeAnywhere: () => true,
      isOpen: () => Boolean(this._isShown()),
      kind: 'popup',
      parts: () => [this.tip]
    }
    this._pressedInside = false
    this._tipEventOut = null
    this._templateFactory = null
    this._newContent = null
    this._mediaQueryListeners = []
    this._responsivePlacements = null
    this._anchor = this._element as HTMLElement
    this._described = null
    this._focusedAnchor = null
    this._switchTimeout = 0
    this._exitPoint = null
    this._intent = null

    // Protected
    this.tip = null

    this._parseResponsivePlacements()
    this._setListeners()

    if (!this._config.selector && !this._config.anchors) {
      this._fixTitle()
    }
  }

  // Getters
  static override get Default(): TooltipConfig {
    return Default
  }

  static override get DefaultType(): Record<string, string> {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  enable(): void {
    this._isEnabled = true
  }

  disable(): void {
    this._isEnabled = false
    this.hide()

    if (this._config.selector) {
      for (const element of SelectorEngine.find(this._config.selector as string, this._element)) {
        this.constructor.getInstance(element)?.hide()
      }
    }
  }

  toggleEnabled(): void {
    if (this._isEnabled) {
      this.disable()
    } else {
      this.enable()
    }
  }

  toggle(): Promise<void> {
    if (!this._isEnabled) {
      return Promise.resolve()
    }

    return this._isShown() ? this._leave() : this._enter()
  }

  override dispose(): void {
    this._clearTimeout()
    clearTimeout(this._switchTimeout)
    this._stopIntent()

    this._removeEscapeListener()
    this._removeFocusOutsideListener()
    unregisterLayer(this._layer, 'parent')

    for (const element of this._config.anchors ? SelectorEngine.find(this._config.anchors as string, this._element) : [this._element]) {
      if (element.getAttribute('data-coreui-original-title')) {
        element.setAttribute('title', element.getAttribute('data-coreui-original-title')!)
      }
    }

    this._disposeFloating()
    this._disposeMediaQueryListeners()
    super.dispose()
  }

  async show(): Promise<void> {
    if (this._config.anchors && this._anchor === this._element) {
      return
    }

    if (this._anchor.style.display === 'none') {
      throw new Error('Please use show on visible elements')
    }

    if (!(this._isWithContent() && this._isEnabled)) {
      return
    }

    const showEvent = this._triggerEvent(EVENT_SHOW)
    const shadowRoot = findShadowRoot(this._anchor)
    const isInTheDom = (shadowRoot || this._anchor.ownerDocument.documentElement).contains(this._anchor)

    if (showEvent.defaultPrevented || !isInTheDom) {
      // Reset the transient hover/active state so a prevented (or not-in-DOM)
      // show doesn't leave `_isHovered` stuck true — otherwise a click-triggered
      // tip would hit the `_enter()` early-return on every later click and never
      // reopen.
      this._isHovered = false
      return
    }

    this._disposeFloating()

    const tip = this._getTipElement()

    this._describe(tip, true)

    let { container } = this._config as TooltipConfig & { container: Element }
    const closestDialog = this._anchor.closest('dialog[open]')
    if (closestDialog && container === document.body) {
      container = closestDialog
    }

    if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
      container.append(tip)

      // The tip usually lands in the body, where it no longer inherits the
      // direction the trigger is in, so it carries it along.
      if (!tip.hasAttribute('dir')) {
        tip.dir = this._isRTL() ? 'rtl' : 'ltr'
      }

      this._triggerEvent(EVENT_INSERTED)
      this._setTipListeners(tip)
    }

    await this._createFloating(tip)

    tip.classList.add(CLASS_NAME_SHOW)
    registerLayer(this._layer)

    // Allow dismissing the tooltip with the Escape key (WCAG 1.4.13)
    this._setEscapeListener()
    this._setFocusOutsideListener()

    // If this is a touch-enabled device we add extra
    // empty mouseover listeners to the body's immediate children;
    // only needed because of broken event delegation on iOS
    // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
    if ('ontouchstart' in document.documentElement) {
      for (const element of document.body.children) {
        EventHandler.on(element, 'mouseover', noop)
      }
    }

    const complete = () => {
      this._triggerEvent(EVENT_SHOWN)

      if (this._isHovered === false) {
        this._leave()
      }

      this._isHovered = false
    }

    await this._queueCallback(complete, this.tip!, this._isAnimated())
  }

  async hide(): Promise<void> {
    if (!this._isShown()) {
      return
    }

    const hideEvent = this._triggerEvent(EVENT_HIDE)
    if (hideEvent.defaultPrevented) {
      return
    }

    this._removeEscapeListener()
    this._removeFocusOutsideListener()

    const tip = this._getTipElement()
    const { focusInside } = unregisterLayer(this._layer)

    if (focusInside && this._element.ownerDocument.hasFocus()) {
      this._describe(tip, false)
      focusIfUsable(this._anchor)
    }

    tip.classList.remove(CLASS_NAME_SHOW)
    tip.removeAttribute(ATTRIBUTE_MOVING)

    // If this is a touch-enabled device we remove the extra
    // empty mouseover listeners we added for iOS support
    if ('ontouchstart' in document.documentElement) {
      for (const element of document.body.children) {
        EventHandler.off(element, 'mouseover', noop)
      }
    }

    this._activeTrigger[TRIGGER_CLICK] = false
    this._activeTrigger[TRIGGER_FOCUS] = false
    this._activeTrigger[TRIGGER_HOVER] = false
    this._openedBy = null
    this._isHovered = null // it is a trick to support manual triggering
    this._focusedAnchor = null
    clearTimeout(this._switchTimeout)
    this._stopIntent()
    this._exitPoint = null

    const complete = () => {
      if (this._isWithActiveTrigger()) {
        return
      }

      if (!this._isHovered) {
        this._disposeFloating()
      }

      this._describe(tip, false)
      this._triggerEvent(EVENT_HIDDEN)
    }

    await this._queueCallback(complete, this.tip!, this._isAnimated())
  }

  update(): void {
    if (this._floatingCleanup && this.tip) {
      this._updateFloatingPosition()
    }
  }

  // Protected
  protected _isWithContent(): boolean {
    return Boolean(this._getTitle()) || this._hasNewContent()
  }

  // Content supplied via setContent() (a `{ selector: content }` map) overrides
  // the configured title/content when rendering, so it should also satisfy the
  // show() gate — otherwise a tip whose content is only set via setContent()
  // can never be shown.
  protected _hasNewContent(): boolean {
    return Boolean(this._newContent) && Object.values(this._newContent!).some(Boolean)
  }

  protected _getTipElement(): HTMLElement {
    if (!this.tip) {
      this.tip = this._createTipElement(this._newContent || this._getContentForTemplate())
    }

    return this.tip
  }

  protected _createTipElement(content: Record<string, TemplateContentEntry>): HTMLElement {
    const tip = this._getTemplateFactory(content).toHtml()

    tip.classList.remove(CLASS_NAME_SHOW)
    tip.classList.add(`bs-${this.constructor.NAME}-auto`)

    const tipId = getUID(this.constructor.NAME).toString()

    tip.setAttribute('id', tipId)

    if (!this._config.animation) {
      tip.classList.add(this._getInstantClassName())
    }

    return tip
  }

  setContent(content: Record<string, TemplateContentEntry>): void {
    this._newContent = content
    if (this._config.anchors && this._isShown()) {
      this._renderTip(this.tip!)
      return
    }

    if (this._isShown()) {
      this._disposeFloating()
      this.show()
    }
  }

  protected _getTemplateFactory(content: Record<string, TemplateContentEntry>): TemplateFactory {
    if (this._templateFactory) {
      this._templateFactory.changeContent(content)
    } else {
      this._templateFactory = new TemplateFactory({
        ...this._config,
        // the `content` var has to be after `this._config`
        // to override config.content in case of popover
        content,
        extraClass: this._resolvePossibleFunction(this._config.customClass)
      })
    }

    return this._templateFactory
  }

  protected _getContentForTemplate(): Record<string, TemplateContentEntry> {
    return {
      [SELECTOR_TOOLTIP_INNER]: this._getTitle()
    }
  }

  protected _getTitle(): string | Element | null {
    return (this._config.anchors && (this._anchor.getAttribute('data-coreui-title') || this._anchor.getAttribute('data-coreui-original-title'))) ||
      this._resolvePossibleFunction(this._config.title) || this._anchor.getAttribute('data-coreui-original-title')
  }

  // Private
  protected _initializeOnDelegatedTarget(event: CoreUIEvent): Tooltip | null {
    return event.delegateTarget.hasAttribute('data-coreui-anchors') ? null : this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig())
  }

  protected _getInstantClassName(): string {
    return `${this.constructor.NAME}-instant`
  }

  protected _isAnimated(): boolean {
    return !this.tip?.classList.contains(this._getInstantClassName())
  }

  protected _isShown(): boolean | null {
    return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW)
  }

  protected _describe(tip: HTMLElement, described: boolean): void {
    const write = (element: Element, add: boolean) => {
      const ids = splitIds(element.getAttribute('aria-describedby')).filter(id => id !== tip.id)

      if (add) {
        ids.push(tip.id)
      }

      writeAttribute(element, 'aria-describedby', ids.join(' ') || null)
    }

    if (this._described) {
      write(this._described, false)
    }

    const active = this._anchor.ownerDocument.activeElement
    this._described = described ? (this._config.anchors && active !== this._anchor && this._anchor.contains(active) ? active! : this._anchor) : null

    if (this._described) {
      write(this._described, true)
    }
  }

  protected _getPlacement(tip: HTMLElement): string {
    // If we have responsive placements, get the one for current viewport
    if (this._responsivePlacements) {
      return this._attachment(getResponsivePlacement(this._responsivePlacements, 'top'))
    }

    // Execute placement (can be a function)
    return this._attachment(execute(this._config.placement, [this, tip, this._anchor]) as string)
  }

  protected _attachment(placement: string): string {
    return ATTACHMENTS[placement.toUpperCase()]?.[this._isRTL() ? 1 : 0] ?? placement
  }

  // A tooltip belongs to the context its trigger sits in, not to the trigger's
  // own text direction: reboot keeps `tel`, `url`, `email` and `number` fields
  // left-to-right whatever the page does, and the tip is not part of the value.
  protected _isRTL(): boolean {
    return isRTL(this._anchor.parentElement ?? this._anchor)
  }

  protected _parseResponsivePlacements(): void {
    // Only parse if placement is a string (not a function)
    if (typeof this._config.placement !== 'string') {
      this._responsivePlacements = null
      return
    }

    this._responsivePlacements = parseResponsivePlacement(this._config.placement, 'top')

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

  protected async _createFloating(tip: HTMLElement): Promise<void> {
    const placement = this._getPlacement(tip)
    const arrowElement = tip.querySelector<HTMLElement>(`.${this.constructor.NAME}-arrow`)

    // Initial position update
    await this._updateFloatingPosition(tip, placement, arrowElement)

    if (tip !== this.tip) {
      return
    }

    // Set up auto-update for scroll/resize
    this._floatingCleanup?.()
    this._floatingCleanup = autoUpdate(
      this._anchor,
      tip,
      () => this._config.anchors && !this._anchor.isConnected ? this.hide() : this._updateFloatingPosition(tip, null, arrowElement)
    )
  }

  protected async _updateFloatingPosition(tip: HTMLElement | null = this.tip, placement: string | null = null, arrowElement: HTMLElement | null = null): Promise<void> {
    const anchor = this._anchor

    if (!tip?.isConnected) {
      return
    }

    if (!placement) {
      placement = this._getPlacement(tip)
    }

    if (!arrowElement) {
      arrowElement = tip.querySelector<HTMLElement>(`.${this.constructor.NAME}-arrow`)
    }

    const middleware = this._getFloatingMiddleware(arrowElement)
    const floatingConfig = this._getFloatingConfig(placement, middleware)

    // The placement attribute drives the arrow's CSS (which edge it sits on
    // AND its width/height, which swap between vertical and horizontal
    // placements). The arrow middleware measures the arrow during
    // computePosition, so the attribute must reflect the placement BEFORE the
    // measurement — stamping it afterwards leaves the arrow centred with the
    // other orientation's dimensions, visibly off-centre on left/right tips.
    // Stamp the requested placement up front; when flip() lands elsewhere,
    // restamp and measure once more with the right dimensions.
    Manipulator.setDataAttribute(tip, 'placement', floatingConfig.placement)

    let { x, y, placement: finalPlacement, middlewareData } = await computePosition(
      anchor,
      tip,
      floatingConfig
    )

    if (finalPlacement !== floatingConfig.placement && tip.isConnected) {
      Manipulator.setDataAttribute(tip, 'placement', finalPlacement);
      ({ x, y, placement: finalPlacement, middlewareData } = await computePosition(
        anchor,
        tip,
        { ...floatingConfig, placement: finalPlacement }
      ))
    }

    // Apply position to tooltip
    Object.assign(tip.style, {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`
    })

    // Ensure arrow is absolutely positioned within tooltip
    if (arrowElement) {
      arrowElement.style.position = 'absolute'
    }

    // Position arrow along the edge (center it) if present
    // The CSS handles which edge to place it on via data-coreui-placement
    if (arrowElement && middlewareData.arrow) {
      const { x: arrowX, y: arrowY } = middlewareData.arrow
      const isVertical = finalPlacement.startsWith('top') || finalPlacement.startsWith('bottom')

      // Only set the cross-axis position (centering along the edge)
      // The main-axis position (which edge) is handled by CSS
      // Floating UI reports the unused axis as `undefined`, never `null`
      Object.assign(arrowElement.style, {
        left: isVertical && arrowX !== undefined ? `${arrowX}px` : '',
        top: isVertical || arrowY === undefined ? '' : `${arrowY}px`,
        // Reset the other axis to let CSS handle it
        right: '',
        bottom: ''
      })
    }
  }

  protected _getOffset(): number[] | ((state: any) => any) {
    const { offset } = this._config

    if (typeof offset === 'string') {
      return offset.split(',').map(value => Number.parseInt(value, 10))
    }

    if (typeof offset === 'function') {
      // Floating UI passes different args, adapt the interface for offset function callbacks
      return ({ placement, rects }) => {
        const result = offset({ placement, reference: rects.reference, floating: rects.floating }, this._anchor)
        return toFloatingOffset(result)
      }
    }

    return offset
  }

  protected _resolvePossibleFunction<T>(arg: T | ((...args: any[]) => T)): T {
    return execute(arg, [this._anchor, this._anchor])
  }

  protected _getFloatingMiddleware(arrowElement: HTMLElement | null): Middleware[] {
    const offsetValue = this._getOffset()

    const middleware = [
      // Offset middleware - handles distance from reference
      offset(
        typeof offsetValue === 'function' ?
          offsetValue :
          toFloatingOffset(offsetValue)
      ),
      // Flip middleware - handles fallback placements
      flip({
        fallbackPlacements: this._config.fallbackPlacements as Placement[]
      }),
      // Shift middleware - prevents overflow
      shift({
        boundary: (this._config.boundary === 'clippingParents' ? 'clippingAncestors' : this._config.boundary) as Boundary
      })
    ]

    // Arrow middleware - positions the arrow element
    if (arrowElement) {
      middleware.push(arrow({ element: arrowElement }))
    }

    return middleware
  }

  protected _getFloatingConfig(placement: string, middleware: Middleware[]): Record<string, any> {
    const defaultConfig = {
      placement,
      middleware
    }

    return {
      ...defaultConfig,
      ...execute(this._config.floatingConfig, [undefined, defaultConfig])
    }
  }

  protected _setListeners(): void {
    if (this._config.anchors) {
      this._setAnchorListeners()
      return
    }

    const triggers = this._config.trigger.split(' ')

    for (const trigger of triggers) {
      if (trigger === 'click') {
        EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK), this._config.selector as string, event => {
          const context = this._initializeOnDelegatedTarget(event)
          if (!context || !this._isEnabled) {
            return
          }

          context._clickToggle()
        })
      } else if (trigger !== TRIGGER_MANUAL) {
        const [eventIn, eventOut] = this._getTriggerEvents(trigger)

        EventHandler.on(this._element, eventIn, this._config.selector as string, event => {
          const context = this._initializeOnDelegatedTarget(event)
          if (!context || !this._isEnabled) {
            return
          }

          const via = event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER

          if (!context._isShown()) {
            context._openedBy = via
          }

          context._activeTrigger[via] = true
          context._enter()
        })
        EventHandler.on(this._element, eventOut, this._config.selector as string, event => {
          const context = this._initializeOnDelegatedTarget(event)

          if (!context || (event.type === 'focusout' && context._pressedInside)) {
            return
          }

          context._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] =
            context._isInside(event.relatedTarget)

          if (event.type === 'focusout') {
            context._leave()
          } else {
            context._leaveTowardTip(event)
          }
        })
      }
    }
  }

  protected _setAnchorListeners(): void {
    const anchors = this._config.anchors as string

    for (const trigger of this._config.trigger.split(' ')) {
      if (trigger === TRIGGER_CLICK) {
        EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK), anchors, event => {
          const anchor = event.delegateTarget as HTMLElement
          this._fixTitle(anchor)

          if (!this._isEnabled) {
            return
          }

          if (this._isShown() && anchor !== this._anchor) {
            this._moveTo(anchor, true)
            return
          }

          this._setAnchor(anchor)
          this._clickToggle()
        })
      } else if (trigger !== TRIGGER_MANUAL) {
        const [eventIn, eventOut] = this._getTriggerEvents(trigger)

        EventHandler.on(this._element, eventIn, anchors, event => {
          this._enterAnchor(event.delegateTarget as HTMLElement, trigger, event as unknown as MouseEvent)
        })
        EventHandler.on(this._element, eventOut, anchors, event => {
          this._leaveAnchor(event, trigger)
        })
      }
    }
  }

  protected _enterAnchor(anchor: HTMLElement, trigger: string, event: MouseEvent): void {
    this._fixTitle(anchor)

    if (!this._isEnabled || this.tip?.contains(anchor)) {
      return
    }

    clearTimeout(this._switchTimeout)
    this._stopIntent()

    if (!this._hasContent(anchor)) {
      if (this._isShown() && this._focusedAnchor !== this._anchor) {
        this._activeTrigger[trigger] = false
        this._leave()
      }

      return
    }

    if (trigger === TRIGGER_FOCUS) {
      this._focusedAnchor = anchor
    }

    if (!this._isShown()) {
      this._openedBy = trigger
    }

    this._activeTrigger[trigger] = true

    if (!this._isShown() || anchor === this._anchor) {
      if (this.tip && anchor === this._anchor) {
        this._describe(this.tip, true)
      }

      this._setAnchor(anchor)
      this._enter()
      return
    }

    this._isHovered = true
    this._clearTimeout()
    this._openedBy = trigger

    if (trigger === TRIGGER_FOCUS) {
      this._moveTo(anchor)
      return
    }

    if (!this._exitPoint || !this._follow(this._exitPoint, { x: event.clientX, y: event.clientY }, () => this._moveTo(anchor))) {
      this._moveTo(anchor)
    }
  }

  protected _follow(exit: Point, point: Point, onLeave: () => void): boolean {
    this._stopIntent()
    this._intent = followPointerIntent({
      exit,
      floating: this.tip!,
      onLeave: () => {
        this._intent = null
        onLeave()
      },
      placement: this.tip!.getAttribute('data-coreui-placement') ?? 'top',
      point,
      rest: ANCHOR_SWITCH_DELAY
    })

    return Boolean(this._intent)
  }

  protected _leaveTowardTip(event: CoreUIEvent): void {
    const point = { x: (event as unknown as MouseEvent).clientX, y: (event as unknown as MouseEvent).clientY }

    if (this._isWithActiveTrigger() || !this._tipEventOut || !this._isShown() || !this._follow(point, point, () => this._leave())) {
      this._leave()
    }
  }

  protected _stopIntent(): void {
    this._intent?.()
    this._intent = null
  }

  protected _leaveAnchor(event: CoreUIEvent, trigger: string): void {
    const related = event.relatedTarget as Node | null

    if (trigger === TRIGGER_FOCUS) {
      if (this._pressedInside) {
        return
      }

      this._focusedAnchor = null
    } else {
      clearTimeout(this._switchTimeout)
      this._stopIntent()
      this._exitPoint = related && this._element.contains(related) ? { x: (event as unknown as MouseEvent).clientX, y: (event as unknown as MouseEvent).clientY } : null
    }

    this._activeTrigger[trigger] = this._isInside(related)

    if (this._activeTrigger[trigger]) {
      return
    }

    const focused = this._focusedAnchor

    if (focused && focused !== this._anchor) {
      if (this._exitPoint) {
        this._switchTimeout = setTimeout(() => this._moveTo(focused), ANCHOR_LEAVE_DELAY)
      } else {
        this._moveTo(focused)
      }

      return
    }

    if (trigger === TRIGGER_FOCUS) {
      this._leave()
    } else {
      this._leaveTowardTip(event)
    }
  }

  protected _setAnchor(anchor: HTMLElement): void {
    if (anchor !== this._anchor) {
      this._anchor = anchor
      this._newContent = null
      this._templateFactory = null
    }
  }

  protected _hasContent(anchor: HTMLElement): boolean {
    if (anchor === this._anchor) {
      return this._isWithContent()
    }

    const { _anchor: current, _newContent: content } = this
    this._anchor = anchor
    this._newContent = null
    const hasContent = this._isWithContent()
    this._anchor = current
    this._newContent = content
    return hasContent
  }

  protected async _moveTo(anchor: HTMLElement, pinned = false): Promise<void> {
    const { tip } = this
    const previous = this._anchor

    if (!tip || anchor === previous) {
      return
    }

    this._activeTrigger[TRIGGER_CLICK] = pinned
    closeLayersIn(tip)
    this._setAnchor(anchor)

    if (containsFocus(tip)) {
      focusIfUsable(anchor)
    }

    if (anchor.closest('dialog[open]') !== previous.closest('dialog[open]') || this._isRTL() !== isRTL(previous.parentElement ?? previous)) {
      const openedBy = this._openedBy
      await this.hide()
      this._activeTrigger[TRIGGER_CLICK] ||= pinned
      this._openedBy ??= openedBy
      return this.show()
    }

    const animated = this._isAnimated()
    tip.toggleAttribute(ATTRIBUTE_MOVING, animated)
    const positioned = this._renderTip(tip)
    this._describe(tip, true)
    reanchorLayer(this._layer)
    this._triggerEvent(EVENT_MOVE)
    await positioned

    await this._queueCallback(() => {
      if (this._anchor === anchor && this._isShown()) {
        tip.removeAttribute(ATTRIBUTE_MOVING)
        this._triggerEvent(EVENT_MOVED)
      }
    }, tip, animated, 'left')
  }

  protected _renderTip(tip: HTMLElement): Promise<void> {
    closeLayersIn(tip)

    if (containsFocus(tip)) {
      focusIfUsable(this._anchor)
    }

    const fresh = this._createTipElement(this._newContent || this._getContentForTemplate())
    fresh.classList.add(CLASS_NAME_SHOW)
    tip.className = fresh.className
    tip.replaceChildren(...fresh.childNodes)
    this._floatingCleanup?.()
    return this._createFloating(tip)
  }

  protected _triggerEvent(name: string): CoreUIEvent {
    return EventHandler.trigger(this._element, this.constructor.eventName(name), { relatedTarget: this._anchor })
  }

  // Keep the tooltip open while the pointer or focus moves onto the tip
  // itself, so users can reach interactive content inside it (WCAG 1.4.13).
  // Hover/focus tips get matching leave listeners on the tip element.
  protected _setTipListeners(tip: HTMLElement): void {
    const trigger = this._getTrigger()

    if (!trigger.includes(TRIGGER_HOVER) && !trigger.includes(TRIGGER_FOCUS)) {
      return
    }

    this._tipEventOut = event => {
      if (event.type === 'focusout' && this._pressedInside) {
        return
      }

      this._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] = this._isInside(event.relatedTarget as Node | null)
      this._leave()
    }

    for (const name of trigger.split(' ')) {
      if (name === TRIGGER_HOVER || name === TRIGGER_FOCUS) {
        const [, eventOut] = this._getTriggerEvents(name)
        EventHandler.on(tip, eventOut, this._tipEventOut)
      }
    }

    if (trigger.includes(TRIGGER_HOVER)) {
      EventHandler.on(tip, this.constructor.eventName(EVENT_MOUSEENTER), () => {
        clearTimeout(this._switchTimeout)
        this._stopIntent()
        this._clearTimeout()
        this._activeTrigger[TRIGGER_HOVER] = Boolean(this._isShown())
      })
    }
  }

  protected _removeTipListeners(tip: HTMLElement): void {
    if (!this._tipEventOut) {
      return
    }

    const trigger = this._getTrigger()

    for (const name of trigger.split(' ')) {
      if (name === TRIGGER_HOVER || name === TRIGGER_FOCUS) {
        const [, eventOut] = this._getTriggerEvents(name)
        EventHandler.off(tip, eventOut, this._tipEventOut)
      }
    }

    EventHandler.off(tip, this.constructor.eventName(EVENT_MOUSEENTER))
    this._tipEventOut = null
  }

  protected _isInside(element: Node | null): boolean {
    return this._anchor.contains(element) || Boolean(this.tip?.contains(element))
  }

  protected _getTrigger(): string {
    return (this._config as TooltipInternalConfig)._trigger
  }

  protected _getTriggerEvents(trigger: string): [string, string] {
    const events: Record<string, [string, string]> = {
      [TRIGGER_HOVER]: [
        this.constructor.eventName(EVENT_MOUSEENTER),
        this.constructor.eventName(EVENT_MOUSELEAVE)
      ],
      [TRIGGER_FOCUS]: [
        this.constructor.eventName(EVENT_FOCUSIN),
        this.constructor.eventName(EVENT_FOCUSOUT)
      ]
    }

    return events[trigger]
  }

  protected _setEscapeListener(): void {
    if (this._keydownHandler) {
      return
    }

    this._keydownHandler = event => {
      handleEscape(event, this._layer)
    }

    this.tip!.addEventListener(EVENT_KEYDOWN, this._keydownHandler)
  }

  protected _removeEscapeListener(): void {
    if (!this._keydownHandler) {
      return
    }

    this.tip?.removeEventListener(EVENT_KEYDOWN, this._keydownHandler)
    this._keydownHandler = null
  }

  protected _setFocusOutsideListener(): void {
    if (this._focusOutsideHandler || !this._getTrigger().split(' ').includes(TRIGGER_FOCUS)) {
      return
    }

    this._focusOutsideHandler = event => {
      const inside = event.composedPath().some(node =>
        node === this._anchor || node === this.tip || (node as Element).getAttribute?.('role') === 'tooltip'
      )

      if (event.type === EVENT_POINTERDOWN) {
        this._pressedInside = inside
        return
      }

      const pressedInside = this._pressedInside
      this._pressedInside = false

      if (
        inside ||
        event.type === EVENT_POINTERCANCEL ||
        (event.type === EVENT_CLICK && pressedInside) ||
        !this._activeTrigger[TRIGGER_FOCUS] ||
        [this._anchor, this.tip].some(element => containsFocus(element))
      ) {
        return
      }

      this._activeTrigger[TRIGGER_FOCUS] = false
      this._leave()
    }

    for (const type of [EVENT_POINTERDOWN, EVENT_POINTERCANCEL, EVENT_CLICK, EVENT_FOCUSIN]) {
      this._element.ownerDocument.addEventListener(type, this._focusOutsideHandler, true)
    }
  }

  protected _removeFocusOutsideListener(): void {
    if (!this._focusOutsideHandler) {
      return
    }

    for (const type of [EVENT_POINTERDOWN, EVENT_POINTERCANCEL, EVENT_CLICK, EVENT_FOCUSIN]) {
      this._element.ownerDocument.removeEventListener(type, this._focusOutsideHandler, true)
    }

    this._focusOutsideHandler = null
    this._pressedInside = false
  }

  protected _fixTitle(element: Element = this._element): void {
    const title = element.getAttribute('title')

    if (!title) {
      return
    }

    if (!element.getAttribute('aria-label') && !element.textContent!.trim()) {
      element.setAttribute('aria-label', title)
    }

    element.setAttribute('data-coreui-original-title', title) // DO NOT USE IT. Is only for backwards compatibility
    writeAttribute(element, 'title', this._config.anchors ? '' : null)
  }

  protected _clickToggle(): Promise<void> {
    const close = this._isShown() && (this._activeTrigger[TRIGGER_CLICK] || !this._openedBy)

    this._activeTrigger = close ? {} : { ...this._activeTrigger, [TRIGGER_CLICK]: true }

    if (!close && this._isShown()) {
      this._clearTimeout()
    }

    return this.toggle()
  }

  protected _enter(): Promise<void> {
    if (this._isShown() || this._isHovered) {
      this._isHovered = true
      return Promise.resolve()
    }

    this._isHovered = true

    return this._setTimeout(
      () => this._isHovered ? this.show() : undefined,
      (this._config.delay as { show: number, hide: number }).show
    )
  }

  protected _leave(): Promise<void> {
    if (this._isWithActiveTrigger()) {
      return Promise.resolve()
    }

    if (!this._isShown()) {
      this._openedBy = null
    }

    this._isHovered = false

    const { hide } = this._config.delay as { show: number, hide: number }

    return this._setTimeout(
      () => this._isHovered ? undefined : this.hide(),
      this._config.anchors ? Math.max(hide, ANCHOR_LEAVE_DELAY) : hide
    )
  }

  protected _setTimeout(handler: () => void | Promise<void>, timeout: number): Promise<void> {
    this._clearTimeout()

    return new Promise(resolve => {
      this._resolveTimeout = resolve
      this._timeout = setTimeout(() => {
        this._resolveTimeout = null
        resolve(handler())
      }, timeout)
    })
  }

  // Cancels the pending hover delay. The superseded promise resolves right away, so a
  // caller awaiting `toggle()` resumes instead of waiting on a timer that never fires.
  protected _clearTimeout(): void {
    clearTimeout(this._timeout)

    if (this._resolveTimeout) {
      this._resolveTimeout()
      this._resolveTimeout = null
    }
  }

  protected _isWithActiveTrigger(): boolean {
    return Object.values(this._activeTrigger).includes(true)
  }

  override _mergeConfigObj(config?: ComponentConfig | null, element?: Element): ComponentConfig {
    const merged = super._mergeConfigObj(config, element)

    for (const key of ['title', 'content']) {
      const attribute = element?.getAttribute(`data-coreui-${key}`)

      if (attribute !== null && attribute !== undefined && !(config && key in config)) {
        merged[key] = attribute
      }
    }

    return merged
  }

  override _configAfterMerge(config: ComponentConfig): ComponentConfig {
    if (config.anchors && (config.selector || config.trigger.includes(TRIGGER_MANUAL))) {
      throw new TypeError(`${this.constructor.NAME.toUpperCase()}: "anchors" cannot be used with "selector" or a manual trigger.`)
    }

    config.container = config.container === false ? document.body : getElement(config.container)

    // Delegated tooltips are created on the fly with `trigger` set to `manual`,
    // which makes the real trigger hard to check later. Preserve it here so the
    // tip listeners know whether the tooltip is hover- or focus-driven.
    config._trigger = config._trigger || config.trigger

    if (typeof config.delay === 'number') {
      config.delay = {
        show: config.delay,
        hide: config.delay
      }
    }

    // Coerce number/boolean title and content to strings. `data-coreui-title="true"`
    // / `data-coreui-content="false"` are auto-converted to booleans by the data-API,
    // which would otherwise fail the (null|string|element|function) type check.
    if (typeof config.title === 'number' || typeof config.title === 'boolean') {
      config.title = config.title.toString()
    }

    if (typeof config.content === 'number' || typeof config.content === 'boolean') {
      config.content = config.content.toString()
    }

    return config
  }

  protected _getDelegateConfig(): ComponentConfig {
    const config: ComponentConfig = {}

    for (const [key, value] of Object.entries(this._config)) {
      if (this.constructor.Default[key as keyof TooltipConfig] !== value) {
        config[key] = value
      }
    }

    config.disabled = false
    config.selector = false
    config.trigger = 'manual'

    // In the future can be replaced with:
    // const keysWithDifferentValues = Object.entries(this._config).filter(entry => this.constructor.Default[entry[0]] !== this._config[entry[0]])
    // `Object.fromEntries(keysWithDifferentValues)`
    return config
  }

  protected _disposeFloating(): void {
    if (this._floatingCleanup) {
      this._floatingCleanup()
      this._floatingCleanup = null
    }

    if (this.tip) {
      this._describe(this.tip, false)
      this._removeEscapeListener()
      this._removeTipListeners(this.tip)
      this.tip.remove()
      this.tip = null
    }
  }

  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, Tooltip, config, args)
  }
}

/**
 * Data API implementation - auto-initialize tooltips
 */

const initTooltip = (event: CoreUIEvent): void => {
  const element = event.target as Element
  const host = element.closest(SELECTOR_DATA_ANCHORS)
  const target = host?.contains(element.closest(host.getAttribute('data-coreui-anchors')!)) ? host : element.closest(SELECTOR_DATA_TOGGLE)
  if (!target) {
    return
  }

  // Lazily create the instance. The instance's own `_setListeners()` registers
  // the appropriate listeners on the element for the configured triggers
  // (hover/focus by default), so we don't mutate `_activeTrigger` or call
  // `_enter` here — doing so would show tooltips for triggers the user didn't
  // opt into (e.g. `focusin` firing for click-focused buttons in Chromium,
  // even when `trigger="hover"` or `trigger="manual"`) and leave stale state
  // on `_activeTrigger`.
  Tooltip.getOrCreateInstance(target)
}

// Auto-initialize tooltips on first interaction for hover and focus triggers
EventHandler.on(document, EVENT_FOCUSIN, SELECTOR_DATA_TOGGLE, initTooltip)
EventHandler.on(document, EVENT_MOUSEENTER, SELECTOR_DATA_TOGGLE, initTooltip)

/**
 * jQuery
 */

defineJQueryPlugin(Tooltip)

export default Tooltip
export type { TooltipConfig }

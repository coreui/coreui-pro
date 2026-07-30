/**
 * --------------------------------------------------------------------------
 * CoreUI tooltip.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's tooltip.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import * as Popper from '@popperjs/core'
import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import EventHandler, { type CoreUIEvent } from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import {
  defineJQueryPlugin, execute, findShadowRoot, getElement, getUID, isRTL, noop
} from './util/index.js'
import { DefaultAllowlist, type SanitizerAllowList } from './util/sanitizer.js'
import TemplateFactory from './util/template-factory.js'

/**
 * Constants
 */

const NAME = 'tooltip'
const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn'])

const ESCAPE_KEY = 'Escape'

const CLASS_NAME_FADE = 'fade'
const CLASS_NAME_MODAL = 'modal'
const CLASS_NAME_SHOW = 'show'

const SELECTOR_TOOLTIP_INNER = '.tooltip-inner'
const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`

const EVENT_MODAL_HIDE = 'hide.coreui.modal'
const EVENT_KEYDOWN = 'keydown'

const TRIGGER_HOVER = 'hover'
const TRIGGER_FOCUS = 'focus'
const TRIGGER_CLICK = 'click'
const TRIGGER_MANUAL = 'manual'

const EVENT_HIDE = 'hide'
const EVENT_HIDDEN = 'hidden'
const EVENT_SHOW = 'show'
const EVENT_SHOWN = 'shown'
const EVENT_INSERTED = 'inserted'
const EVENT_CLICK = 'click'
const EVENT_FOCUSIN = 'focusin'
const EVENT_FOCUSOUT = 'focusout'
const EVENT_MOUSEENTER = 'mouseenter'
const EVENT_MOUSELEAVE = 'mouseleave'

const AttachmentMap = {
  AUTO: 'auto',
  TOP: 'top',
  RIGHT: isRTL() ? 'left' : 'right',
  BOTTOM: 'bottom',
  LEFT: isRTL() ? 'right' : 'left'
}

type TooltipConfig = {
  allowList: SanitizerAllowList
  animation: boolean
  boundary: string
  container: HTMLElement | string | false
  customClass: string | ((...args: any[]) => string)
  delay: number | { show: number, hide: number }
  fallbackPlacements: string[]
  html: boolean
  offset: [number, number] | string | ((...args: any[]) => [number, number])
  placement: string | ((...args: any[]) => string)
  popperConfig: Record<string, any> | ((...args: any[]) => Record<string, any>) | null
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  selector: string | false
  template: string
  title: string | Element | ((...args: any[]) => string | Element)
  trigger: string
}

const Default: TooltipConfig = {
  allowList: DefaultAllowlist,
  animation: true,
  boundary: 'clippingParents',
  container: false,
  customClass: '',
  delay: 0,
  fallbackPlacements: ['top', 'right', 'bottom', 'left'],
  html: false,
  offset: [0, 6],
  placement: 'top',
  popperConfig: null,
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

const DefaultType: Record<string, string> = {
  allowList: 'object',
  animation: 'boolean',
  boundary: '(string|element)',
  container: '(string|element|boolean)',
  customClass: '(string|function)',
  delay: '(number|object)',
  fallbackPlacements: 'array',
  html: 'boolean',
  offset: '(array|string|function)',
  placement: '(string|function)',
  popperConfig: '(null|object|function)',
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
  protected declare _isEnabled: boolean
  protected declare _timeout: number
  protected declare _isHovered: boolean | null
  protected declare _activeTrigger: Record<string, boolean>
  protected declare _popper: any
  protected declare _templateFactory: TemplateFactory | null
  protected declare _newContent: Record<string, any> | null
  protected declare _keydownHandler: ((event: KeyboardEvent) => void) | null
  declare tip: HTMLElement | null
  protected declare _hideModalHandler: any

  constructor(element?: string | Element | null, config?: any) {
    if (typeof Popper === 'undefined') {
      throw new TypeError('CoreUI\'s dropdowns require Popper (https://popper.js.org/docs/v2/)')
    }

    super(element, config)

    // Private
    this._isEnabled = true
    this._timeout = 0
    this._isHovered = null
    this._activeTrigger = {}
    this._popper = null
    this._templateFactory = null
    this._newContent = null

    // Protected
    this.tip = null

    // Private
    this._keydownHandler = null

    this._setListeners()

    if (!this._config.selector) {
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
  }

  toggleEnabled(): void {
    this._isEnabled = !this._isEnabled
  }

  toggle(): void {
    if (!this._isEnabled) {
      return
    }

    if (this._isShown()) {
      this._leave()
      return
    }

    this._enter()
  }

  override dispose(): void {
    clearTimeout(this._timeout)

    this._removeEscapeListener()

    EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler)

    if (this._element.getAttribute('data-coreui-original-title')!) {
      this._element.setAttribute('title', this._element.getAttribute('data-coreui-original-title')!)
    }

    this._disposePopper()
    super.dispose()
  }

  show(): void {
    if (this._element.style.display === 'none') {
      throw new Error('Please use show on visible elements')
    }

    if (!(this._isWithContent() && this._isEnabled)) {
      return
    }

    const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW))
    const shadowRoot = findShadowRoot(this._element)
    const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element)

    if (showEvent!.defaultPrevented || !isInTheDom) {
      return
    }

    // TODO: v6 remove this or make it optional
    this._disposePopper()

    const tip = this._getTipElement()

    this._element.setAttribute('aria-describedby', tip.getAttribute('id')!)

    const { container } = this._config

    if (!this._element.ownerDocument.documentElement.contains(this.tip!)) {
      container.append(tip)
      EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED))
    }

    this._popper = this._createPopper(tip)

    tip.classList.add(CLASS_NAME_SHOW)

    this._setEscapeListener()

    // If this is a touch-enabled device we add extra
    // empty mouseover listeners to the body's immediate children;
    // only needed because of broken event delegation on iOS
    // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
    if ('ontouchstart' in document.documentElement) {
      for (const element of ([] as Element[]).concat(...document.body.children as unknown as Element[][])) {
        EventHandler.on(element, 'mouseover', noop)
      }
    }

    const complete = () => {
      EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN))

      if (this._isHovered === false) {
        this._leave()
      }

      this._isHovered = false
    }

    this._queueCallback(complete, this.tip!, this._isAnimated() as boolean)
  }

  hide(): void {
    if (!this._isShown()) {
      return
    }

    const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE))
    if (hideEvent!.defaultPrevented) {
      return
    }

    const tip = this._getTipElement()
    tip.classList.remove(CLASS_NAME_SHOW)

    this._removeEscapeListener()

    // If this is a touch-enabled device we remove the extra
    // empty mouseover listeners we added for iOS support
    if ('ontouchstart' in document.documentElement) {
      for (const element of ([] as Element[]).concat(...document.body.children as unknown as Element[][])) {
        EventHandler.off(element, 'mouseover', noop)
      }
    }

    this._activeTrigger[TRIGGER_CLICK] = false
    this._activeTrigger[TRIGGER_FOCUS] = false
    this._activeTrigger[TRIGGER_HOVER] = false
    this._isHovered = null // it is a trick to support manual triggering

    const complete = () => {
      if (this._isWithActiveTrigger()) {
        return
      }

      if (!this._isHovered) {
        this._disposePopper()
      }

      this._element.removeAttribute('aria-describedby')
      EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN))
    }

    this._queueCallback(complete, this.tip!, this._isAnimated() as boolean)
  }

  update(): void {
    if (this._popper) {
      this._popper.update()
    }
  }

  // Protected
  _isWithContent(): boolean {
    return Boolean(this._getTitle())
  }

  _getTipElement(): HTMLElement {
    if (!this.tip!) {
      this.tip = this._createTipElement(this._newContent || this._getContentForTemplate())
    }

    return this.tip!
  }

  _createTipElement(content: any): any {
    const tip = this._getTemplateFactory(content).toHtml()

    // TODO: remove this check in v6
    if (!tip) {
      return null
    }

    tip.classList.remove(CLASS_NAME_FADE, CLASS_NAME_SHOW)
    // TODO: v6 the following can be achieved with CSS only
    tip.classList.add(`bs-${this.constructor.NAME}-auto`)

    const tipId = getUID(this.constructor.NAME).toString()

    tip.setAttribute('id', tipId)

    if (this._isAnimated()) {
      tip.classList.add(CLASS_NAME_FADE)
    }

    return tip
  }

  setContent(content: any): any {
    this._newContent = content
    if (this._isShown()) {
      this._disposePopper()
      this.show()
    }
  }

  _getTemplateFactory(content: any): any {
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

  _getContentForTemplate(): Record<string, any> {
    return {
      [SELECTOR_TOOLTIP_INNER]: this._getTitle()
    }
  }

  _getTitle(): string | Element | null {
    return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute('data-coreui-original-title')
  }

  // Private
  _initializeOnDelegatedTarget(event: CoreUIEvent): Tooltip {
    return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig()) as Tooltip
  }

  _isAnimated(): boolean | null {
    return this._config.animation || (this.tip! && this.tip!.classList.contains(CLASS_NAME_FADE))
  }

  _isShown(): boolean | null {
    return this.tip! && this.tip!.classList.contains(CLASS_NAME_SHOW)
  }

  _setEscapeListener(): void {
    if (this._keydownHandler) {
      return
    }

    this._keydownHandler = event => {
      if (event.key !== ESCAPE_KEY || !this._isShown() || !this.tip!.isConnected) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      this.hide()
    }

    this._element.ownerDocument.addEventListener(EVENT_KEYDOWN, this._keydownHandler, true)
  }

  _removeEscapeListener(): void {
    if (!this._keydownHandler) {
      return
    }

    this._element.ownerDocument.removeEventListener(EVENT_KEYDOWN, this._keydownHandler, true)
    this._keydownHandler = null
  }

  _createPopper(tip: HTMLElement): any {
    const placement = execute(this._config.placement, [this, tip, this._element])
    const attachment = (AttachmentMap as Record<string, string>)[(placement as string).toUpperCase()]
    return Popper.createPopper(this._element, tip, this._getPopperConfig(attachment))
  }

  _getOffset(): any {
    const { offset } = this._config

    if (typeof offset === 'string') {
      return offset.split(',').map(value => Number.parseInt(value, 10))
    }

    if (typeof offset === 'function') {
      return (popperData: any) => offset(popperData, this._element)
    }

    return offset
  }

  _resolvePossibleFunction(arg: any): any {
    return execute(arg, [this._element, this._element])
  }

  _getPopperConfig(attachment: any): Record<string, any> {
    const defaultBsPopperConfig = {
      placement: attachment,
      modifiers: [
        {
          name: 'flip',
          options: {
            fallbackPlacements: this._config.fallbackPlacements as any
          }
        },
        {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        },
        {
          name: 'arrow',
          options: {
            element: `.${this.constructor.NAME}-arrow`
          }
        },
        {
          name: 'preSetPlacement',
          enabled: true,
          phase: 'beforeMain',
          fn: (data: any) => {
            // Pre-set Popper's placement attribute in order to read the arrow sizes properly.
            // Otherwise, Popper mixes up the width and height dimensions since the initial arrow style is for top placement
            this._getTipElement().setAttribute('data-popper-placement', data.state.placement)
          }
        }
      ]
    }

    return {
      ...defaultBsPopperConfig,
      ...execute(this._config.popperConfig, [undefined, defaultBsPopperConfig])
    }
  }

  _setListeners(): void {
    const triggers = this._config.trigger.split(' ')

    for (const trigger of triggers) {
      if (trigger === 'click') {
        EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK), this._config.selector, event => {
          const context = this._initializeOnDelegatedTarget(event)
          context._activeTrigger[TRIGGER_CLICK] = !(context._isShown() && context._activeTrigger[TRIGGER_CLICK])
          context.toggle()
        })
      } else if (trigger !== TRIGGER_MANUAL) {
        const eventIn = trigger === TRIGGER_HOVER ?
          this.constructor.eventName(EVENT_MOUSEENTER) :
          this.constructor.eventName(EVENT_FOCUSIN)
        const eventOut = trigger === TRIGGER_HOVER ?
          this.constructor.eventName(EVENT_MOUSELEAVE) :
          this.constructor.eventName(EVENT_FOCUSOUT)

        EventHandler.on(this._element, eventIn, this._config.selector, event => {
          const context = this._initializeOnDelegatedTarget(event)
          context._activeTrigger[event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER] = true
          context._enter()
        })
        EventHandler.on(this._element, eventOut, this._config.selector, event => {
          const context = this._initializeOnDelegatedTarget(event)
          context._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] =
            context._element.contains(event.relatedTarget)

          context._leave()
        })
      }
    }

    this._hideModalHandler = () => {
      if (this._element) {
        this.hide()
      }
    }

    EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler)
  }

  _fixTitle(): void {
    const title = this._element.getAttribute('title')

    if (!title) {
      return
    }

    if (!this._element.getAttribute('aria-label') && !this._element.textContent!.trim()) {
      this._element.setAttribute('aria-label', title as unknown as string)
    }

    this._element.setAttribute('data-coreui-original-title', title) // DO NOT USE IT. Is only for backwards compatibility
    this._element.removeAttribute('title')
  }

  _enter(): void {
    if (this._isShown() || this._isHovered) {
      this._isHovered = true
      return
    }

    this._isHovered = true

    this._setTimeout(() => {
      if (this._isHovered) {
        this.show()
      }
    }, this._config.delay.show)
  }

  _leave(): void {
    if (this._isWithActiveTrigger()) {
      return
    }

    this._isHovered = false

    this._setTimeout(() => {
      if (!this._isHovered) {
        this.hide()
      }
    }, this._config.delay.hide)
  }

  _setTimeout(handler: () => void, timeout: number): void {
    clearTimeout(this._timeout)
    this._timeout = setTimeout(handler, timeout)
  }

  _isWithActiveTrigger(): boolean {
    return Object.values(this._activeTrigger).includes(true)
  }

  override _getConfig(config?: ComponentConfig | null): ComponentConfig {
    const dataAttributes = Manipulator.getDataAttributes(this._element)

    for (const dataAttribute of Object.keys(dataAttributes)) {
      if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
        delete dataAttributes[dataAttribute]
      }
    }

    config = {
      ...dataAttributes,
      ...(typeof config === 'object' && config ? config : {})
    }
    config = this._mergeConfigObj(config)
    config = this._configAfterMerge(config)
    this._typeCheckConfig(config)
    return config
  }

  override _configAfterMerge(config: ComponentConfig): ComponentConfig {
    config.container = config.container === false ? document.body : getElement(config.container)

    if (typeof config.delay === 'number') {
      config.delay = {
        show: config.delay,
        hide: config.delay
      }
    }

    if (typeof config.title === 'number') {
      config.title = config.title.toString()
    }

    if (typeof config.content === 'number') {
      config.content = config.content.toString()
    }

    return config
  }

  _getDelegateConfig(): ComponentConfig {
    const config: Record<string, any> = {}

    for (const [key, value] of Object.entries(this._config)) {
      if ((this.constructor.Default as Record<string, any>)[key] !== value) {
        config[key] = value
      }
    }

    config.selector = false
    config.trigger = 'manual'

    // In the future can be replaced with:
    // const keysWithDifferentValues = Object.entries(this._config).filter(entry => this.constructor.Default[entry[0]] !== this._config[entry[0]])
    // `Object.fromEntries(keysWithDifferentValues)`
    return config
  }

  _disposePopper(): any {
    if (this._popper) {
      this._popper.destroy()
      this._popper = null
    }

    if (this.tip!) {
      this.tip!.remove()
      this.tip = null
    }
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Tooltip.getOrCreateInstance(this, config)

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
 * jQuery
 */

defineJQueryPlugin(Tooltip)

export default Tooltip
export type { TooltipConfig }

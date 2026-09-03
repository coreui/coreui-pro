/**
 * --------------------------------------------------------------------------
 * CoreUI sidebar.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import { defineJQueryPlugin } from './util/index.js'
import Backdrop from './util/backdrop.js'
import ScrollBarHelper from './util/scrollbar.js'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'sidebar'
const DATA_KEY = 'coreui.sidebar'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Default = {}

const DefaultType = {}

const CLASS_NAME_BACKDROP = 'sidebar-backdrop'
const CLASS_NAME_HIDE = 'hide'
const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_SIDEBAR_NARROW = 'sidebar-narrow'
const CLASS_NAME_SIDEBAR_OVERLAID = 'sidebar-overlaid'
const CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE = 'sidebar-narrow-unfoldable'

const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_RESIZE = `resize${EVENT_KEY}`
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_DATA_CLOSE = '[data-coreui-close="sidebar"]'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="narrow"], [data-coreui-toggle="unfoldable"]'

const SELECTOR_SIDEBAR = '.sidebar'

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Sidebar extends BaseComponent {
  protected declare _show: boolean
  protected declare _mobile: boolean
  protected declare _overlaid: boolean
  protected declare _narrow: boolean
  protected declare _unfoldable: boolean
  protected declare _backdrop: Backdrop
  protected declare _clickOutHandler: (event: Event) => void
  protected declare _resizeHandler: () => void

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element)

    this._config = this._getConfig(config)
    this._show = this._isVisible()
    this._mobile = this._isMobile()
    this._overlaid = this._isOverlaid()
    this._narrow = this._isNarrow()
    this._unfoldable = this._isUnfoldable()
    this._backdrop = this._initializeBackDrop()
    this._clickOutHandler = event => this._clickOutListener(event)
    this._resizeHandler = () => {
      if (this._isMobile() && this._isVisible()) {
        this.hide()
        this._backdrop = this._initializeBackDrop()
      }
    }

    this._addEventListeners()
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

  // Public

  async show(): Promise<void> {
    EventHandler.trigger(this._element, EVENT_SHOW)

    if (this._element.classList.contains(CLASS_NAME_HIDE)) {
      this._element.classList.remove(CLASS_NAME_HIDE)
    }

    if (this._overlaid) {
      this._element.classList.add(CLASS_NAME_SHOW)
    }

    if (this._isMobile()) {
      this._element.classList.add(CLASS_NAME_SHOW)
      this._backdrop.show()
      new ScrollBarHelper().hide()
    }

    const complete = () => {
      if (this._isVisible() === true) {
        this._show = true
        if (this._isMobile() || this._isOverlaid()) {
          this._addClickOutListener()
        }

        EventHandler.trigger(this._element, EVENT_SHOWN)
      }
    }

    await this._queueCallback(complete, this._element, true)
  }

  async hide(): Promise<void> {
    EventHandler.trigger(this._element, EVENT_HIDE)

    if (this._element.classList.contains(CLASS_NAME_SHOW)) {
      this._element.classList.remove(CLASS_NAME_SHOW)
    }

    if (this._isMobile()) {
      this._backdrop.hide()
      new ScrollBarHelper().reset()
    }

    if (!this._isMobile() && !this._overlaid) {
      this._element.classList.add(CLASS_NAME_HIDE)
    }

    const complete = () => {
      if (this._isVisible() === false) {
        this._show = false
        if (this._isMobile() || this._isOverlaid()) {
          this._removeClickOutListener()
        }

        EventHandler.trigger(this._element, EVENT_HIDDEN)
      }
    }

    await this._queueCallback(complete, this._element, true)
  }

  toggle(): Promise<void> {
    return this._isVisible() ? this.hide() : this.show()
  }

  narrow(): void {
    if (!this._isMobile()) {
      this._element.classList.add(CLASS_NAME_SIDEBAR_NARROW)
      this._narrow = true
    }
  }

  unfoldable(): void {
    if (!this._isMobile()) {
      this._element.classList.add(CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE)
      this._unfoldable = true
    }
  }

  reset(): void {
    if (!this._isMobile()) {
      if (this._narrow) {
        this._element.classList.remove(CLASS_NAME_SIDEBAR_NARROW)
        this._narrow = false
      }

      if (this._unfoldable) {
        this._element.classList.remove(CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE)
        this._unfoldable = false
      }
    }
  }

  toggleNarrow(): any {
    if (this._narrow) {
      this.reset()
      return
    }

    this.narrow()
  }

  toggleUnfoldable(): any {
    if (this._unfoldable) {
      this.reset()
      return
    }

    this.unfoldable()
  }

  override dispose(): void {
    if (this._isMobile() && this._isVisible()) {
      new ScrollBarHelper().reset()
    }

    this._backdrop.dispose()
    this._removeClickOutListener()
    EventHandler.off(window, EVENT_RESIZE, this._resizeHandler)

    super.dispose()
  }

  // Private

  _initializeBackDrop(): any {
    return new Backdrop({
      className: CLASS_NAME_BACKDROP,
      isVisible: this._isMobile(),
      isAnimated: true,
      rootElement: this._element.parentNode,
      clickCallback: () => this.hide()
    })
  }

  _isMobile(): any {
    return Boolean(window.getComputedStyle(this._element, null).getPropertyValue('--cui-is-mobile'))
  }

  _isNarrow(): any {
    return this._element.classList.contains(CLASS_NAME_SIDEBAR_NARROW)
  }

  _isOverlaid(): any {
    return this._element.classList.contains(CLASS_NAME_SIDEBAR_OVERLAID)
  }

  _isUnfoldable(): any {
    return this._element.classList.contains(CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE)
  }

  _isVisible(): any {
    const rect = this._element.getBoundingClientRect()
    return (
      rect.top >= 0 && rect.left >= 0 && Math.floor(rect.bottom) <= (window.innerHeight || document.documentElement.clientHeight) && Math.floor(rect.right) <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  _clickOutListener(event: any): void {
    if ((event.target as HTMLElement).closest(SELECTOR_SIDEBAR) === null) {
      event.preventDefault()
      event.stopPropagation()
      this.hide()
    }
  }

  _addClickOutListener(): void {
    EventHandler.on(document, EVENT_CLICK_DATA_API, this._clickOutHandler)
  }

  _removeClickOutListener(): void {
    EventHandler.off(document, EVENT_CLICK_DATA_API, this._clickOutHandler)
  }

  // Sidebar navigation
  _addEventListeners(): void {
    if (this._mobile && this._show) {
      this._addClickOutListener()
    }

    if (this._overlaid && this._show) {
      this._addClickOutListener()
    }

    EventHandler.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, event => {
      event.preventDefault()
      const toggle = Manipulator.getDataAttribute((event.target as HTMLElement).closest(SELECTOR_DATA_TOGGLE)!, 'toggle')

      if (toggle === 'narrow') {
        this.toggleNarrow()
      }

      if (toggle === 'unfoldable') {
        this.toggleUnfoldable()
      }
    })

    EventHandler.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_DATA_CLOSE, event => {
      event.preventDefault()
      this.hide()
    })

    EventHandler.on(window, EVENT_RESIZE, this._resizeHandler)
  }

  // Static

  static sidebarInterface(element: string | Element | null, config?: any): void {
    const data: any = Sidebar.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string]()
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      Sidebar.sidebarInterface(this, config)
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of Array.from(document.querySelectorAll(SELECTOR_SIDEBAR))) {
    Sidebar.sidebarInterface(element)
  }
})

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

defineJQueryPlugin(Sidebar)

export default Sidebar

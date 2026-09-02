/**
 * --------------------------------------------------------------------------
 * CoreUI navigation.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'navigation'
const DATA_KEY = 'coreui.navigation'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Default = {
  activeLinksExact: true,
  groupsAutoCollapse: true
}

const DefaultType = {
  activeLinksExact: 'boolean',
  groupsAutoCollapse: '(string|boolean)'
}

const CLASS_NAME_ACTIVE = 'active'
const CLASS_NAME_SHOW = 'show'

const CLASS_NAME_NAV_GROUP = 'nav-group'
const CLASS_NAME_NAV_GROUP_TOGGLE = 'nav-group-toggle'

const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_NAV_GROUP = '.nav-group'
const SELECTOR_NAV_GROUP_ITEMS = '.nav-group-items'
const SELECTOR_NAV_GROUP_TOGGLE = '.nav-group-toggle'
const SELECTOR_NAV_LINK = '.nav-link'
const SELECTOR_DATA_NAVIGATION = '[data-coreui-navigation], [data-coreui="navigation"]'

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Navigation extends BaseComponent {
  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element)
    this._config = this._getConfig(config)
    this._setActiveLink()
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

  // Private

  _setActiveLink(): void {
    for (const element of Array.from(this._element.querySelectorAll(SELECTOR_NAV_LINK))) {
      if (element.classList.contains(CLASS_NAME_NAV_GROUP_TOGGLE)) {
        continue
      }

      let currentUrl = String(window.location)

      const urlHasParams = /\?.*=/
      const urlHasQueryString = /\?./
      const urlHasHash = /#./

      if (urlHasParams.test(currentUrl) || urlHasQueryString.test(currentUrl)) {
        currentUrl = currentUrl.split('?')[0]
      }

      if (urlHasHash.test(currentUrl)) {
        currentUrl = currentUrl.split('#')[0]
      }

      if (this._config.activeLinksExact && (element as HTMLAnchorElement).href === currentUrl) {
        element.classList.add(CLASS_NAME_ACTIVE)
        // eslint-disable-next-line unicorn/no-array-for-each
        Array.from(this._getParents(element as HTMLElement, SELECTOR_NAV_GROUP)).forEach(element => {
          element.classList.add(CLASS_NAME_SHOW)
          element.setAttribute('aria-expanded', true as unknown as string)
        })
      }

      if (!this._config.activeLinksExact && currentUrl.startsWith((element as HTMLAnchorElement).href)) {
        element.classList.add(CLASS_NAME_ACTIVE)
        // eslint-disable-next-line unicorn/no-array-for-each
        Array.from(this._getParents(element as HTMLElement, SELECTOR_NAV_GROUP)).forEach(element => {
          element.classList.add(CLASS_NAME_SHOW)
          element.setAttribute('aria-expanded', true as unknown as string)
        })
      }
    }
  }

  _getParents(element: any, selector: string): HTMLElement[] {
    // Setup parents array
    const parents: HTMLElement[] = []

    // Get matching parent elements
    for (; element && element !== document; element = element.parentNode) {
      // Add matching parents to array
      if (selector) {
        if (element.matches(selector)) {
          parents.push(element)
        }
      } else {
        parents.push(element)
      }
    }

    return parents
  }

  _getAllSiblings(element: any, filter: (element: any) => boolean): HTMLElement[] {
    const siblings: HTMLElement[] = []
    element = element.parentNode.firstChild
    do {
      if (element.nodeType === 3) {
        continue // text node
      }

      if (element.nodeType === 8) {
        continue // comment node
      }

      if (!filter || filter(element)) {
        siblings.push(element)
      }

    // eslint-disable-next-line no-cond-assign
    } while (element = element.nextSibling)

    return siblings
  }

  _getChildren(n: any, skipMe: any): HTMLElement[] {
    const children = []
    for (; n; n = n.nextSibling) {
      if (n.nodeType === 1 && n !== skipMe) {
        children.push(n)
      }
    }

    return children
  }

  _getSiblings(element: any, filter: (element: any) => boolean): HTMLElement[] {
    const siblings = this._getChildren(element.parentNode.firstChild, element).filter(filter)
    return siblings
  }

  _slideDown(element: HTMLElement): void {
    element.style.height = 'auto'
    const height = element.clientHeight
    element.style.height = '0px'
    setTimeout(() => {
      element.style.height = `${height}px`
    }, 0)

    this._queueCallback(() => {
      element.style.height = 'auto'
    }, element, true)
  }

  _slideUp(element: any, callback: (...args: any[]) => void): void {
    const height = element.clientHeight
    element.style.height = `${height}px`
    setTimeout(() => {
      element.style.height = '0px'
    }, 0)

    this._queueCallback(() => {
      if (typeof callback === 'function') {
        callback()
      }
    }, element, true)
  }

  _toggleGroupItems(event: any): void {
    let toggler = event.target
    if (!toggler.classList.contains(CLASS_NAME_NAV_GROUP_TOGGLE)) {
      toggler = toggler.closest(SELECTOR_NAV_GROUP_TOGGLE)
    }

    const filter = (element: HTMLElement) => Boolean(element.classList.contains(CLASS_NAME_NAV_GROUP) && element.classList.contains(CLASS_NAME_SHOW))

    // Close other groups
    if (this._config.groupsAutoCollapse === true) {
      for (const element of this._getSiblings(toggler.parentNode, filter)) {
        this._slideUp(SelectorEngine.findOne(SELECTOR_NAV_GROUP_ITEMS, element), () => {
          element.classList.remove(CLASS_NAME_SHOW)
          element.setAttribute('aria-expanded', false as unknown as string)
        })
      }
    }

    if (toggler.parentNode.classList.contains(CLASS_NAME_SHOW)) {
      this._slideUp(SelectorEngine.findOne(SELECTOR_NAV_GROUP_ITEMS, toggler.parentNode), () => {
        toggler.parentNode.classList.remove(CLASS_NAME_SHOW)
        toggler.parentNode.setAttribute('aria-expanded', false as unknown as string)
      })
      return
    }

    toggler.parentNode.classList.add(CLASS_NAME_SHOW)
    toggler.parentNode.setAttribute('aria-expanded', true as unknown as string)
    this._slideDown(SelectorEngine.findOne(SELECTOR_NAV_GROUP_ITEMS, toggler.parentNode as ParentNode)!)
  }

  _addEventListeners(): any {
    EventHandler.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_NAV_GROUP_TOGGLE, event => {
      event.preventDefault()
      // @ts-expect-error -- the call passes an argument the method ignores.
      // Dropping it is a behaviour change, so it is flagged rather than typed away.
      this._toggleGroupItems(event, this)
    })
  }

  // Static

  static navigationInterface(element: string | Element | null, config?: any): void {
    const data: any = Navigation.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string]()
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      Navigation.navigationInterface(this, config)
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */
EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of Array.from(document.querySelectorAll(SELECTOR_DATA_NAVIGATION))) {
    Navigation.navigationInterface(element)
  }
})

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .Navigation to jQuery only if jQuery is present
 */

defineJQueryPlugin(Navigation)

export default Navigation

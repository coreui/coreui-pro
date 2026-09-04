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
import { startSizeTransition, supportsInterpolateSize } from './util/size-transition.js'

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
const CLASS_NAME_COLLAPSING = 'collapsing'
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
    const currentUrl = String(window.location).split(/[?#]/)[0]

    for (const element of SelectorEngine.find<HTMLAnchorElement>(SELECTOR_NAV_LINK, this._element)) {
      if (element.classList.contains(CLASS_NAME_NAV_GROUP_TOGGLE)) {
        continue
      }

      const isActive = this._config.activeLinksExact ? element.href === currentUrl : currentUrl.startsWith(element.href)

      if (!isActive) {
        continue
      }

      element.classList.add(CLASS_NAME_ACTIVE)

      for (const group of this._getParentGroups(element)) {
        this._setExpanded(group, true, false)
      }
    }
  }

  _getParentGroups(element: Element): HTMLElement[] {
    const groups: HTMLElement[] = []
    let group = element.closest<HTMLElement>(SELECTOR_NAV_GROUP)

    while (group && this._element.contains(group)) {
      groups.push(group)
      group = group.parentElement ? group.parentElement.closest<HTMLElement>(SELECTOR_NAV_GROUP) : null
    }

    return groups
  }

  _setExpanded(group: HTMLElement, expanded: boolean, animate = true): void {
    const toggle = group.querySelector(`:scope > ${SELECTOR_NAV_GROUP_TOGGLE}`)

    if (toggle) {
      toggle.setAttribute('aria-expanded', String(expanded))
    }

    const items = SelectorEngine.findOne<HTMLElement>(`:scope > ${SELECTOR_NAV_GROUP_ITEMS}`, group)

    if (!items || !animate) {
      group.classList.toggle(CLASS_NAME_SHOW, expanded)
      return
    }

    const cssPath = supportsInterpolateSize()
    const size = expanded || cssPath ? 0 : items.getBoundingClientRect().height

    items.classList.add(CLASS_NAME_COLLAPSING)
    group.classList.toggle(CLASS_NAME_SHOW, expanded)

    if (!cssPath) {
      startSizeTransition(items, 'height', expanded ? 0 : size, expanded ? items.scrollHeight : 0)
    }

    this._queueCallback(() => {
      items.classList.remove(CLASS_NAME_COLLAPSING)
      items.style.height = ''
    }, items, true)
  }

  _toggleGroupItems(event: Event): void {
    const toggler = (event.target as Element).closest<HTMLElement>(SELECTOR_NAV_GROUP_TOGGLE)
    const group = toggler ? toggler.closest<HTMLElement>(SELECTOR_NAV_GROUP) : null

    if (!group) {
      return
    }

    if (this._config.groupsAutoCollapse === true && group.parentElement) {
      for (const sibling of Array.from(group.parentElement.children) as HTMLElement[]) {
        if (sibling !== group && sibling.classList.contains(CLASS_NAME_NAV_GROUP) && sibling.classList.contains(CLASS_NAME_SHOW)) {
          this._setExpanded(sibling, false)
        }
      }
    }

    this._setExpanded(group, !group.classList.contains(CLASS_NAME_SHOW))
  }

  _addEventListeners(): any {
    EventHandler.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_NAV_GROUP_TOGGLE, event => {
      event.preventDefault()
      this._toggleGroupItems(event)
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

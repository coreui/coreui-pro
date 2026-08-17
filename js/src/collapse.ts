/**
 * --------------------------------------------------------------------------
 * CoreUI collapse.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's collapse.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import {
  defineJQueryPlugin,
  getElement,
  reflow,
  setAriaAttribute
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'collapse'
const DATA_KEY = 'coreui.collapse'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_LOAD_DATA_API = `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`
const EVENT_BEFOREMATCH = `beforematch${EVENT_KEY}`

const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_COLLAPSE = 'collapse'
const CLASS_NAME_COLLAPSING = 'collapsing'
const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`
const CLASS_NAME_HORIZONTAL = 'collapse-horizontal'

const WIDTH = 'width'
const HEIGHT = 'height'

const ATTRIBUTE_HIDDEN = 'hidden'
const VALUE_UNTIL_FOUND = 'until-found'

const SELECTOR_ACTIVES = '.collapse.show, .collapse.collapsing'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="collapse"]'
const SELECTOR_HIDDEN_UNTIL_FOUND = '.collapse[data-coreui-hidden-until-found="true"]'

const Default = {
  hiddenUntilFound: false,
  parent: null
}

const DefaultType = {
  hiddenUntilFound: 'boolean',
  parent: '(null|element)'
}

/**
 * Types
 */

type CollapseConfig = {
  hiddenUntilFound: boolean
  parent: string | Element | null
}

// Where `auto` can be interpolated, a `hidden="until-found"` area is animated by
// the stylesheet: it stays in the layout, so its height needs no measuring.
const usesInterpolatedHeight = (): boolean =>
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('interpolate-size', 'allow-keywords')

/**
 * Class definition
 */

class Collapse extends BaseComponent {
  protected declare _config: CollapseConfig
  protected declare _isTransitioning: boolean
  protected declare _triggerArray: HTMLElement[]

  constructor(element?: string | Element | null, config?: Partial<CollapseConfig> | null) {
    super(element, config)

    this._isTransitioning = false
    this._triggerArray = []

    const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE)

    for (const elem of toggleList) {
      const selector = SelectorEngine.getSelectorFromElement(elem)
      const filterElement = SelectorEngine.find(selector!)
        .filter(foundElement => foundElement === this._element)

      if (selector !== null && filterElement.length) {
        this._triggerArray.push(elem)
      }
    }

    this._initializeChildren()

    if (!this._config.parent) {
      this._setAriaExpanded(this._triggerArray, this._isShown())
    }

    if (this._config.hiddenUntilFound) {
      // The browser strips the attribute as it reveals the content, so the
      // classes have to catch up before it does — otherwise the stylesheet
      // hides what the reader was just sent to.
      EventHandler.on(this._element, EVENT_BEFOREMATCH, () => this._onBeforeMatch())
      this._setHiddenUntilFound(!this._isShown())
    }
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
  toggle(): Promise<void> {
    return this._isShown() ? this.hide() : this.show()
  }

  async show(): Promise<void> {
    if (this._isTransitioning || this._isShown()) {
      return
    }

    let activeChildren: Collapse[] = []

    // find active children
    if (this._config.parent) {
      activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES)
        .filter(element => element !== this._element)
        .map(element => Collapse.getOrCreateInstance(element))
    }

    if (activeChildren.length && activeChildren[0]._isTransitioning) {
      return
    }

    const startEvent = EventHandler.trigger(this._element, EVENT_SHOW)
    if (startEvent!.defaultPrevented) {
      return
    }

    for (const activeInstance of activeChildren) {
      activeInstance.hide()
    }

    const dimension = this._getDimension()
    const interpolated = this._usesInterpolatedHeight()

    this._setHiddenUntilFound(false)

    this._element.classList.remove(CLASS_NAME_COLLAPSE)
    this._element.classList.add(CLASS_NAME_COLLAPSING)

    if (!interpolated) {
      this._element.style[dimension] = '0'
    }

    this._setAriaExpanded(this._triggerArray, true)
    this._isTransitioning = true

    const complete = () => {
      this._isTransitioning = false

      this._element.classList.remove(CLASS_NAME_COLLAPSING)
      this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW)

      this._element.style[dimension] = ''

      EventHandler.trigger(this._element, EVENT_SHOWN)
    }

    if (interpolated) {
      await this._queueCallback(complete, this._element, true)
      return
    }

    const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1)
    const scrollSize = `scroll${capitalizedDimension}` as 'scrollWidth' | 'scrollHeight'

    // Register the completion callback first, then set the target size to start the
    // transition. Awaiting here instead would stop the size from ever being applied.
    const transition = this._queueCallback(complete, this._element, true)
    this._element.style[dimension] = `${this._element[scrollSize]}px`

    await transition
  }

  async hide(): Promise<void> {
    if (this._isTransitioning || !this._isShown()) {
      return
    }

    const startEvent = EventHandler.trigger(this._element, EVENT_HIDE)
    if (startEvent!.defaultPrevented) {
      return
    }

    const dimension = this._getDimension()
    const interpolated = this._usesInterpolatedHeight()

    if (interpolated) {
      // The attribute is what the stylesheet animates towards, so it goes on
      // now rather than at the end; `content-visibility` is transitioned with
      // `allow-discrete`, which keeps the content on screen until it finishes.
      this._setHiddenUntilFound(true)
    } else {
      this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`

      reflow(this._element)
    }

    this._element.classList.add(CLASS_NAME_COLLAPSING)
    this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW)

    for (const trigger of this._triggerArray) {
      const element = SelectorEngine.getElementFromSelector(trigger)

      if (element && !this._isShown(element)) {
        this._setAriaExpanded([trigger], false)
      }
    }

    this._isTransitioning = true

    const complete = () => {
      this._isTransitioning = false
      this._element.classList.remove(CLASS_NAME_COLLAPSING)
      this._element.classList.add(CLASS_NAME_COLLAPSE)

      if (!interpolated) {
        this._setHiddenUntilFound(true)
      }

      EventHandler.trigger(this._element, EVENT_HIDDEN)
    }

    this._element.style[dimension] = ''

    await this._queueCallback(complete, this._element, true)
  }

  // Private
  _isShown(element: Element = this._element): boolean {
    return element.classList.contains(CLASS_NAME_SHOW)
  }

  override _configAfterMerge(config: ComponentConfig): ComponentConfig {
    config.parent = getElement(config.parent)
    return config
  }

  _getDimension(): 'width' | 'height' {
    return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT
  }

  _initializeChildren(): void {
    if (!this._config.parent) {
      return
    }

    const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE)

    for (const element of children) {
      const selected = SelectorEngine.getElementFromSelector(element)

      if (selected) {
        this._setAriaExpanded([element], this._isShown(selected))
      }
    }
  }

  _getFirstLevelChildren(selector: string): HTMLElement[] {
    const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent as ParentNode)
    // remove children if greater depth
    return SelectorEngine.find(selector, this._config.parent as ParentNode).filter(element => !children.includes(element))
  }

  _usesInterpolatedHeight(): boolean {
    return this._config.hiddenUntilFound && usesInterpolatedHeight()
  }

  _setHiddenUntilFound(hidden: boolean): void {
    if (!this._config.hiddenUntilFound) {
      return
    }

    if (hidden) {
      this._element.setAttribute(ATTRIBUTE_HIDDEN, VALUE_UNTIL_FOUND)
      return
    }

    this._element.removeAttribute(ATTRIBUTE_HIDDEN)
  }

  // Find-in-page reveals the content itself; this only brings the component's
  // state in line with what the reader can already see. `beforematch` is not
  // cancelable, so there is no `show` event to prevent here.
  _onBeforeMatch(): void {
    if (this._isShown()) {
      return
    }

    this._element.classList.add(CLASS_NAME_SHOW)
    this._setAriaExpanded(this._triggerArray, true)

    EventHandler.trigger(this._element, EVENT_SHOWN)
  }

  _setAriaExpanded(triggerArray: HTMLElement[], isOpen: boolean): void {
    if (!triggerArray.length) {
      return
    }

    for (const element of triggerArray) {
      setAriaAttribute(element, 'aria-expanded', isOpen)
    }
  }

  // Static
  // The option has to take effect before anyone interacts with the area, and
  // Collapse is otherwise only constructed on the first click of a trigger.
  static _initializeDataApi(): void {
    for (const element of SelectorEngine.find(SELECTOR_HIDDEN_UNTIL_FOUND)) {
      Collapse.getOrCreateInstance(element)
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Collapse.getOrCreateInstance(this)

      if (typeof config === 'string') {
        if (typeof data[config as string] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }

        data[config as string]()
      }
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, EVENT_LOAD_DATA_API, () => {
  Collapse._initializeDataApi()
})

EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
  // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
  if ((event.target as HTMLElement).tagName === 'A' || (event.delegateTarget && event.delegateTarget.tagName === 'A')) {
    event.preventDefault()
  }

  for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
    Collapse.getOrCreateInstance(element).toggle()
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Collapse)

export default Collapse
export type { CollapseConfig }

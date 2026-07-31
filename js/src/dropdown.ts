/**
 * --------------------------------------------------------------------------
 * CoreUI dropdown.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * Dropdown is the v5 compatibility surface built on the Menu implementation:
 * the same engine, keyboard handling and dismissal, with the v5 class names,
 * events (`*.coreui.dropdown`), class-driven placement and the navbar/static
 * CSS hook preserved. The acceptance contract is the untouched v5 spec suite —
 * see workspace/plans/menu-and-dropdown-compat.md.
 * --------------------------------------------------------------------------
 */

import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import Menu, { type MenuConfig } from './menu.js'
import {
  defineJQueryPlugin, getNextActiveElement, isRTL, isVisible
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'dropdown'
const DATA_KEY = 'coreui.dropdown'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const ARROW_DOWN_KEY = 'ArrowDown'

const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_DROPUP = 'dropup'
const CLASS_NAME_DROPEND = 'dropend'
const CLASS_NAME_DROPSTART = 'dropstart'
const CLASS_NAME_DROPUP_CENTER = 'dropup-center'
const CLASS_NAME_DROPDOWN_CENTER = 'dropdown-center'

const SELECTOR_NAVBAR = '.navbar'

const PLACEMENT_TOP = isRTL() ? 'top-end' : 'top-start'
const PLACEMENT_TOPEND = isRTL() ? 'top-start' : 'top-end'
const PLACEMENT_BOTTOM = isRTL() ? 'bottom-end' : 'bottom-start'
const PLACEMENT_BOTTOMEND = isRTL() ? 'bottom-start' : 'bottom-end'
const PLACEMENT_RIGHT = isRTL() ? 'left-start' : 'right-start'
const PLACEMENT_LEFT = isRTL() ? 'right-start' : 'left-start'
const PLACEMENT_TOPCENTER = 'top'
const PLACEMENT_BOTTOMCENTER = 'bottom'

const Default: MenuConfig = {
  ...Menu.Default
}

const DefaultType: Record<string, string> = {
  ...Menu.DefaultType
}

/**
 * Class definition
 */

class Dropdown extends Menu {
  declare ['constructor']: typeof Dropdown
  protected declare _inNavbar: boolean

  constructor(element?: string | Element | null, config?: Record<string, any> | null) {
    super(element, config)

    this._inNavbar = this._detectNavbar()
  }

  // Getters
  static override get SELECTOR_DATA_TOGGLE(): string {
    return '[data-coreui-toggle="dropdown"]:not(.disabled):not(:disabled)'
  }

  static override get SELECTOR_MENU(): string {
    return '.dropdown-menu'
  }

  static override get SELECTOR_VISIBLE_ITEMS(): string {
    return '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)'
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

  // Overrides
  override update(): void {
    this._inNavbar = this._detectNavbar()
    super.update()
  }

  // The v5 dropdown derives its placement from the wrapper classes and the
  // `--cui-position` custom property, not from a `placement` option.
  protected override _getPlacement(): string {
    const parentDropdown = this._parent

    if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
      return PLACEMENT_RIGHT
    }

    if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
      return PLACEMENT_LEFT
    }

    if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
      return PLACEMENT_TOPCENTER
    }

    if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
      return PLACEMENT_BOTTOMCENTER
    }

    // We need to trim the value because custom properties can also include spaces
    const isEnd = getComputedStyle(this._menu).getPropertyValue('--cui-position').trim() === 'end'

    if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
      return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP
    }

    return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM
  }

  // In a navbar (or with static display) the menu is positioned by the
  // dropdown CSS, which keys on this attribute — the engine stays out of it.
  protected override _createFloating(): void {
    if (this._inNavbar || this._config.display === 'static') {
      Manipulator.setDataAttribute(this._menu, 'popper', 'static')
      return
    }

    super._createFloating()
  }

  protected override _removeMenuAttributes(): void {
    super._removeMenuAttributes()
    Manipulator.removeDataAttribute(this._menu, 'popper')
  }

  // The v5 markup wraps items in `<li>`, so item discovery is descendant-based
  // rather than Menu's direct-child (`:scope >`) lookup.
  protected override _selectMenuItem({ key, target }: any): void {
    const items = SelectorEngine.find(this.constructor.SELECTOR_VISIBLE_ITEMS, this._menu)
      .filter(element => isVisible(element))

    if (!items.length) {
      return
    }

    // if target isn't included in items (e.g. when expanding the dropdown)
    // allow cycling to get the last item in case key equals ARROW_UP_KEY
    getNextActiveElement(items, target, key === ARROW_DOWN_KEY, !items.includes(target)).focus()
  }

  _detectNavbar(): boolean {
    return this._element.closest(SELECTOR_NAVBAR) !== null
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Dropdown.getOrCreateInstance(this, config)

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
 * clearMenus is not re-registered here: Menu's document-level registration
 * iterates the open-instance registry, which the subclass shares.
 */

EventHandler.on(document, EVENT_KEYDOWN_DATA_API, Dropdown.SELECTOR_DATA_TOGGLE, event => Dropdown.dataApiKeydownHandler(event))
EventHandler.on(document, EVENT_KEYDOWN_DATA_API, Dropdown.SELECTOR_MENU, event => Dropdown.dataApiKeydownHandler(event))
EventHandler.on(document, EVENT_CLICK_DATA_API, Dropdown.SELECTOR_DATA_TOGGLE, function (event) {
  event.preventDefault()
  Dropdown.getOrCreateInstance(this).toggle()
})

/**
 * jQuery
 */

defineJQueryPlugin(Dropdown)

export default Dropdown
export { Default, DefaultType }

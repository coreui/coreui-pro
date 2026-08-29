/**
 * --------------------------------------------------------------------------
 * CoreUI chip.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import { sanitizeHtml, SVGAllowlist, type SanitizerAllowList } from './util/sanitizer.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'chip'
const DATA_KEY = 'coreui.chip'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_REMOVE = `remove${EVENT_KEY}`
const EVENT_REMOVED = `removed${EVENT_KEY}`
const EVENT_SELECT = `select${EVENT_KEY}`
const EVENT_SELECTED = `selected${EVENT_KEY}`
const EVENT_DESELECT = `deselect${EVENT_KEY}`
const EVENT_DESELECTED = `deselected${EVENT_KEY}`

const SELECTOR_CHIP_CHECK = '.chip-check'
const SELECTOR_CHIP_REMOVE = '.chip-remove'
const SELECTOR_DATA_CHIP = '[data-coreui-chip]'

const CLASS_NAME_CHIP_CHECK = 'chip-check'
const CLASS_NAME_CHIP_CLICKABLE = 'chip-clickable'
const CLASS_NAME_CHIP_REMOVE = 'chip-remove'
const CLASS_NAME_ACTIVE = 'active'
const CLASS_NAME_DISABLED = 'disabled'

const DEFAULT_REMOVE_ICON: string = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>'
const DEFAULT_SELECTED_ICON: string = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M425.373 89.373 196 318.745 86.627 209.373l-45.254 45.254L196 409.255l274.627-274.628z"/></svg>'

const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn'])

type ChipConfig = {
  allowList: SanitizerAllowList
  ariaRemoveLabel: string
  disabled: boolean
  filter: boolean
  removable: boolean
  removeIcon: string
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  selectable: boolean
  selected: boolean
  selectedIcon: string
}

const Default: ChipConfig = {
  allowList: SVGAllowlist,
  ariaRemoveLabel: 'Remove',
  disabled: false,
  filter: false,
  removable: false,
  removeIcon: DEFAULT_REMOVE_ICON,
  sanitize: true,
  sanitizeFn: null,
  selectable: false,
  selected: false,
  selectedIcon: DEFAULT_SELECTED_ICON
}

const DefaultType = {
  allowList: 'object',
  ariaRemoveLabel: 'string',
  disabled: 'boolean',
  filter: 'boolean',
  removable: 'boolean',
  removeIcon: 'string',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  selectable: 'boolean',
  selected: 'boolean',
  selectedIcon: 'string'
}

/**
 * Class definition
 */

class Chip extends BaseComponent {
  protected declare _disabled: any
  protected declare _selected: any

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._disabled = this._config.disabled || this._element.classList.contains(CLASS_NAME_DISABLED)
    this._selected = this._config.selected || this._element.classList.contains(CLASS_NAME_ACTIVE)

    this._applyRole()
    this._ensureRemoveButton()
    this._applyState()

    if (this._config.selectable || this._config.removable) {
      this._makeFocusable()
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
  remove(): void {
    const removeEvent = EventHandler.trigger(this._element, EVENT_REMOVE)

    if (removeEvent.defaultPrevented) {
      return
    }

    this._destroyElement()
  }

  toggle(): void {
    if (!this._config.selectable) {
      return
    }

    if (this._selected) {
      this.deselect()
      return
    }

    this.select()
  }

  select(): void {
    if (!this._config.selectable) {
      return
    }

    if (this._selected) {
      return
    }

    const selectEvent = EventHandler.trigger(this._element, EVENT_SELECT)
    if (selectEvent.defaultPrevented) {
      return
    }

    this._selected = true
    this._applyState()

    EventHandler.trigger(this._element, EVENT_SELECTED)
  }

  deselect(): any {
    if (!this._config.selectable) {
      return
    }

    if (!this._selected) {
      return
    }

    const deselectEvent = EventHandler.trigger(this._element, EVENT_DESELECT)
    if (deselectEvent.defaultPrevented) {
      return
    }

    this._selected = false
    this._applyState()

    EventHandler.trigger(this._element, EVENT_DESELECTED)
  }

  // Private
  _configAfterMerge(config: any): any {
    // A filter chip is selectable by definition.
    if (config.filter) {
      config.selectable = true
    }

    return config
  }

  _addEventListeners(): void {
    EventHandler.on(this._element, 'keydown', event => this._handleKeydown(event))

    EventHandler.on(this._element, 'click', event => {
      if (this._disabled) {
        return
      }

      if ((event.target as HTMLElement).closest(SELECTOR_CHIP_REMOVE)) {
        return
      }

      this.toggle()
    })

    EventHandler.on(this._element, 'click', SELECTOR_CHIP_REMOVE, event => {
      event.stopPropagation()
      this.remove()
    })
  }

  // A selectable chip needs a role its selection state is valid on: inside a
  // selectable chip set the set stamps role="option" (listbox pattern) before
  // initializing the chip; a standalone selectable chip is a toggle button.
  _applyRole(): void {
    if (this._config.selectable && !this._element.hasAttribute('role')) {
      this._element.setAttribute('role', 'button')
    }
  }

  // aria-selected is only valid on role="option"; a toggle button reflects its
  // state via aria-pressed instead.
  _selectionStateAttribute(): string {
    return this._element.getAttribute('role') === 'option' ? 'aria-selected' : 'aria-pressed'
  }

  _applyState(): void {
    if (!this._disabled && (this._config.clickable || this._config.selectable)) {
      this._element.classList.add(CLASS_NAME_CHIP_CLICKABLE)
    }

    // aria-disabled is not allowed on a generic element — only stamp it when
    // the chip carries a role; a role-less chip conveys the state through the
    // disabled class and the removed interactivity.
    const hasRole = this._element.hasAttribute('role')

    if (this._disabled) {
      this._element.classList.add(CLASS_NAME_DISABLED)
      if (hasRole) {
        this._element.setAttribute('aria-disabled', 'true')
      } else {
        this._element.removeAttribute('aria-disabled')
      }
    } else {
      this._element.classList.remove(CLASS_NAME_DISABLED)
      if (this._element.hasAttribute('aria-disabled')) {
        if (hasRole) {
          this._element.setAttribute('aria-disabled', 'false')
        } else {
          this._element.removeAttribute('aria-disabled')
        }
      }
    }

    if (this._config.selectable) {
      this._element.classList.toggle(CLASS_NAME_ACTIVE, this._selected)
      this._element.setAttribute(this._selectionStateAttribute(), this._selected ? 'true' : 'false')

      if (this._config.filter) {
        if (this._selected) {
          this._ensureCheckIcon()
        } else {
          SelectorEngine.findOne(SELECTOR_CHIP_CHECK, this._element)?.remove()
        }
      }
    } else {
      this._element.classList.remove(CLASS_NAME_ACTIVE)
      if (this._element.getAttribute('role') === 'option') {
        this._element.setAttribute('aria-selected', 'false')
      } else {
        this._element.removeAttribute('aria-selected')
      }
    }
  }

  _ensureCheckIcon(): any {
    if (SelectorEngine.findOne(SELECTOR_CHIP_CHECK, this._element)) {
      return
    }

    const check = document.createElement('span')
    check.className = CLASS_NAME_CHIP_CHECK
    check.setAttribute('aria-hidden', 'true')
    check.innerHTML = this._sanitizeIcon(this._config.selectedIcon)
    this._element.prepend(check)
  }

  _createRemoveButton(): any {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = CLASS_NAME_CHIP_REMOVE
    button.setAttribute('aria-label', this._config.ariaRemoveLabel)
    button.setAttribute('tabindex', '-1') // Not in tab order, chips handle keyboard
    button.innerHTML = this._sanitizeIcon(this._config.removeIcon)
    return button
  }

  _ensureRemoveButton(): void {
    // A disabled chip is not interactive, so it never shows a remove button.
    if (!this._config.removable || this._disabled) {
      return
    }

    if (SelectorEngine.findOne(SELECTOR_CHIP_REMOVE, this._element)) {
      return
    }

    this._element.append(this._createRemoveButton())
  }

  _makeFocusable(): void {
    if (this._element.hasAttribute('tabindex') || this._disabled) {
      return
    }

    this._element.setAttribute('tabindex', '0')
  }

  _handleKeydown(event: any): void {
    const { key } = event
    if (this._disabled) {
      return
    }

    switch (key) {
      case 'Enter':
      case ' ':
      case 'Spacebar': {
        if (!this._config.selectable) {
          return
        }

        event.preventDefault()
        this.toggle()
        break
      }

      case 'Backspace':
      case 'Delete': {
        if (this._config.removable) {
          event.preventDefault()
          this.remove()
        }

        break
      }

      // No default
    }
  }

  _destroyElement(): void {
    EventHandler.trigger(this._element, EVENT_REMOVED)
    this._element.remove()
    this.dispose()
  }

  _sanitizeIcon(icon: string): string {
    return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon
  }

  _getConfig(config: any): any {
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

  // Static
  static chipInterface(element: string | Element | null, config?: any): void {
    const data: any = Chip.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string]()
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Chip.getOrCreateInstance(this)

      if (typeof config !== 'string') {
        return
      }

      if (data[config as string] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string](this)
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_CHIP)) {
    Chip.chipInterface(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Chip)

export default Chip
export type { ChipConfig }

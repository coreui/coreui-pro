/**
 * --------------------------------------------------------------------------
 * CoreUI list-box.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import type { ComponentConfig } from './util/config.js'
import {
  defineJQueryPlugin,
  getElement,
  getNextActiveElement,
  getUID
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'list-box'
const DATA_KEY = 'coreui.list-box'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const ARROW_UP_KEY = 'ArrowUp'
const ARROW_DOWN_KEY = 'ArrowDown'
const HOME_KEY = 'Home'
const END_KEY = 'End'
const ENTER_KEY = 'Enter'
const SPACE_KEY = ' '
const A_KEY = 'a'

const TYPEAHEAD_TIMEOUT = 500

const EVENT_ACTION = 'action'
const EVENT_ACTIVATE = 'activate'
const EVENT_CHANGE = 'change'
const EVENT_DESELECT = 'deselect'
const EVENT_DESELECTED = 'deselected'
const EVENT_SELECT = 'select'
const EVENT_SELECTED = 'selected'

const EVENT_CLICK = 'click'
const EVENT_FOCUSIN = 'focusin'
const EVENT_KEYDOWN = 'keydown'

const CLASS_NAME_ACTIVE = 'active'
const CLASS_NAME_CHECK = 'check'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_INDETERMINATE = 'indeterminate'
const CLASS_NAME_ITEM_INDICATOR = 'list-box-item-indicator'
const CLASS_NAME_ITEM_WITH_INDICATOR = 'list-box-item-with-indicator'
const CLASS_NAME_SELECTED = 'selected'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="list-box"]'
const SELECTOR_EMPTY = '.list-box-empty'
const SELECTOR_ITEM = '.list-box-item'
const SELECTOR_ITEM_INDICATOR = '.list-box-item-indicator'
const SELECTOR_ITEM_LABEL = '.list-box-item-label'
const SELECTOR_SECTION = '.list-box-section'

const INDICATOR_CHECKBOX = 'checkbox'

const SELECTION_MODE_MULTIPLE = 'multiple'
const SELECTION_MODE_NONE = 'none'
const SELECTION_MODE_SINGLE = 'single'

type ListBoxConfig = {
  activeDescendant: string | Element | null
  disabled: boolean
  indicator: string
  selected: string | string[] | null
  selectionMode: string
  typeahead: boolean
}

const Default: ListBoxConfig = {
  activeDescendant: null,
  disabled: false,
  indicator: 'none',
  selected: null,
  selectionMode: SELECTION_MODE_SINGLE,
  typeahead: true
}

const DefaultType: Record<string, string> = {
  activeDescendant: '(string|element|null)',
  disabled: 'boolean',
  indicator: 'string',
  selected: '(string|array|null)',
  selectionMode: 'string',
  typeahead: 'boolean'
}

/**
 * Class definition
 */

class ListBox extends BaseComponent {
  protected declare _active: string | null
  protected declare _anchor: string | null
  protected declare _field: HTMLElement | null
  protected declare _search: string
  protected declare _searchTimeout: ReturnType<typeof setTimeout> | null
  protected declare _selected: Set<string>

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._active = null
    this._anchor = null
    this._field = getElement(this._config.activeDescendant)
    this._search = ''
    this._searchTimeout = null
    this._selected = new Set(this._initialSelection())

    this._addEventListeners()
    this.update()
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
  select(value: string): void {
    if (this._selectValue(value)) {
      this._anchor = value
      this._triggerChange()
    }
  }

  deselect(value: string): void {
    if (this._deselectValue(value)) {
      this._triggerChange()
    }
  }

  toggle(value: string): void {
    if (this._selected.has(value)) {
      this.deselect(value)
      return
    }

    this.select(value)
  }

  selectAll(values?: string[]): void {
    if (this._config.selectionMode !== SELECTION_MODE_MULTIPLE) {
      return
    }

    const scope = values ?? this._selectableItems().map(item => this._itemValue(item))
    let changed = false

    for (const value of scope) {
      changed = this._selectValue(value) || changed
    }

    if (changed) {
      this._triggerChange()
    }
  }

  clear(): void {
    const values = this.getSelected()
    let changed = false

    for (const value of values) {
      changed = this._deselectValue(value) || changed
    }

    if (changed) {
      this._triggerChange()
    }
  }

  getSelected(): string[] {
    return [...this._selected]
  }

  setActive(value: string | null): void {
    this._setActive(value, false)
  }

  getActive(): string | null {
    return this._active
  }

  next(): void {
    this._move(true)
  }

  prev(): void {
    this._move(false)
  }

  first(): void {
    this._moveToEdge(0)
  }

  last(): void {
    this._moveToEdge(-1)
  }

  update(): void {
    this._element.setAttribute('role', 'listbox')

    if (this._config.selectionMode === SELECTION_MODE_MULTIPLE) {
      this._element.setAttribute('aria-multiselectable', 'true')
    } else {
      this._element.removeAttribute('aria-multiselectable')
    }

    if (this._config.disabled) {
      this._element.setAttribute('aria-disabled', 'true')
    } else {
      this._element.removeAttribute('aria-disabled')
    }

    for (const section of SelectorEngine.find(SELECTOR_SECTION, this._element)) {
      if (!section.hasAttribute('role')) {
        section.setAttribute('role', 'group')
      }
    }

    if (this._active !== null && !this._navigableItems().some(item => this._itemValue(item) === this._active)) {
      this._active = null
    }

    const navigable = this._navigableItems()
    const roving = this._active === null && !this._field ? navigable[0] : null

    for (const item of this._items()) {
      item.setAttribute('role', 'option')

      if (this._field && !item.id) {
        item.id = getUID(`${NAME}-item-`)
      }

      const value = this._itemValue(item)
      const selected = this._isSelectAll(item) ? this._allSelected() : this._selected.has(value)

      this._decorateItem(item)

      if (this._isSelectAll(item)) {
        item.classList.toggle(CLASS_NAME_INDETERMINATE, !selected && this._someSelected())
      }

      if (this._config.selectionMode === SELECTION_MODE_NONE) {
        item.removeAttribute('aria-selected')
      } else {
        item.setAttribute('aria-selected', String(selected))
      }

      item.classList.toggle(CLASS_NAME_SELECTED, selected)
      item.classList.toggle(CLASS_NAME_ACTIVE, value === this._active)

      if (this._field) {
        item.removeAttribute('tabindex')
        continue
      }

      item.setAttribute('tabindex', value === this._active || item === roving ? '0' : '-1')
    }

    const empty = SelectorEngine.findOne(SELECTOR_EMPTY, this._element)
    if (empty) {
      empty.toggleAttribute('hidden', navigable.length > 0)
    }

    this._updateActiveDescendant()
  }

  override dispose(): void {
    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout)
    }

    if (this._field) {
      EventHandler.off(this._field, EVENT_KEY)
      this._field.removeAttribute('aria-activedescendant')
      this._field.removeAttribute('aria-controls')
    }

    super.dispose()
  }

  // Private
  _initialSelection(): string[] {
    const { selected, selectionMode } = this._config

    if (selectionMode === SELECTION_MODE_NONE || selected === null) {
      return []
    }

    const values = Array.isArray(selected) ? selected : [selected]
    return selectionMode === SELECTION_MODE_SINGLE ? values.slice(0, 1) : values
  }

  _items(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_ITEM, this._element)
  }

  _navigableItems(): HTMLElement[] {
    return this._items().filter(item => !this._isHidden(item) && !this._isDisabled(item))
  }

  _selectableItems(): HTMLElement[] {
    return this._navigableItems().filter(item => !this._isSelectAll(item))
  }

  _isHidden(item: HTMLElement): boolean {
    return item.hasAttribute('hidden') || item.closest('[hidden]') !== null
  }

  _isDisabled(item: HTMLElement): boolean {
    return item.classList.contains(CLASS_NAME_DISABLED) || item.getAttribute('aria-disabled') === 'true'
  }

  _isSelectAll(item: HTMLElement): boolean {
    return item.hasAttribute('data-coreui-select-all')
  }

  _isLink(item: HTMLElement): boolean {
    return item.tagName === 'A' && item.hasAttribute('href')
  }

  _itemValue(item: HTMLElement): string {
    return item.dataset.coreuiValue ?? item.textContent?.trim() ?? ''
  }

  _itemText(item: HTMLElement): string {
    const label = SelectorEngine.findOne(SELECTOR_ITEM_LABEL, item)
    return (label ?? item).textContent?.trim().toLowerCase() ?? ''
  }

  _findItem(value: string): HTMLElement | undefined {
    return this._items().find(item => this._itemValue(item) === value)
  }

  _activeItem(): HTMLElement | null {
    return this._active === null ? null : (this._findItem(this._active) ?? null)
  }

  _decorateItem(item: HTMLElement): void {
    if (this._config.indicator !== INDICATOR_CHECKBOX) {
      return
    }

    item.classList.add(CLASS_NAME_ITEM_WITH_INDICATOR)

    if (SelectorEngine.findOne(SELECTOR_ITEM_INDICATOR, item)) {
      return
    }

    const indicator = document.createElement('span')
    indicator.classList.add(CLASS_NAME_CHECK, CLASS_NAME_ITEM_INDICATOR)
    indicator.setAttribute('aria-hidden', 'true')
    item.prepend(indicator)
  }

  _allSelected(): boolean {
    const items = this._selectableItems()
    return items.length > 0 && items.every(item => this._selected.has(this._itemValue(item)))
  }

  _someSelected(): boolean {
    return this._selectableItems().some(item => this._selected.has(this._itemValue(item)))
  }

  _selectValue(value: string): boolean {
    if (this._config.disabled || this._config.selectionMode === SELECTION_MODE_NONE) {
      return false
    }

    const item = this._findItem(value)

    if (!item || this._isDisabled(item) || this._isSelectAll(item) || this._selected.has(value)) {
      return false
    }

    if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT), { value }).defaultPrevented) {
      return false
    }

    if (this._config.selectionMode === SELECTION_MODE_SINGLE) {
      const previous = this.getSelected()

      for (const value of previous) {
        this._removeSelection(value)
      }
    }

    this._selected.add(value)
    this.update()

    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECTED), { value })

    return true
  }

  _deselectValue(value: string): boolean {
    if (this._config.disabled || !this._selected.has(value)) {
      return false
    }

    if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_DESELECT), { value }).defaultPrevented) {
      return false
    }

    this._removeSelection(value)

    return true
  }

  _removeSelection(value: string): void {
    this._selected.delete(value)
    this.update()

    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_DESELECTED), { value })
  }

  _selectRange(from: string | null, to: string): void {
    const items = this._selectableItems()
    const start = items.findIndex(item => this._itemValue(item) === from)
    const end = items.findIndex(item => this._itemValue(item) === to)

    if (end === -1) {
      return
    }

    let changed = false

    for (const item of items.slice(Math.min(start === -1 ? end : start, end), Math.max(start === -1 ? end : start, end) + 1)) {
      changed = this._selectValue(this._itemValue(item)) || changed
    }

    if (changed) {
      this._triggerChange()
    }
  }

  _triggerChange(): void {
    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_CHANGE), { selected: this.getSelected() })
  }

  _setActive(value: string | null, focus: boolean): void {
    if (value === this._active) {
      this._updateActiveDescendant()
      return
    }

    this._active = value
    this.update()

    const item = this._activeItem()

    if (item) {
      item.scrollIntoView({ block: 'nearest' })

      if (focus && !this._field) {
        item.focus()
      }

      EventHandler.trigger(this._element, this.constructor.eventName(EVENT_ACTIVATE), { value })
    }
  }

  _updateActiveDescendant(): void {
    if (!this._field) {
      return
    }

    if (!this._element.id) {
      this._element.id = getUID(`${NAME}-`)
    }

    this._field.setAttribute('aria-controls', this._element.id)

    const item = this._activeItem()

    if (item) {
      this._field.setAttribute('aria-activedescendant', item.id)
      return
    }

    this._field.removeAttribute('aria-activedescendant')
  }

  _move(forward: boolean): void {
    const items = this._navigableItems()

    if (items.length === 0) {
      return
    }

    const current = this._activeItem()
    const next = current ? getNextActiveElement(items, current, forward, false) : items[forward ? 0 : items.length - 1]

    this._setActive(this._itemValue(next), true)
  }

  _moveToEdge(index: number): void {
    const items = this._navigableItems()
    const item = items.at(index)

    if (item) {
      this._setActive(this._itemValue(item), true)
    }
  }

  _activate(item: HTMLElement): void {
    const value = this._itemValue(item)

    if (this._isSelectAll(item)) {
      if (this._allSelected()) {
        this.clear()
        return
      }

      this.selectAll()
      return
    }

    if (this._config.selectionMode === SELECTION_MODE_NONE || this._isLink(item)) {
      EventHandler.trigger(this._element, this.constructor.eventName(EVENT_ACTION), { value, relatedTarget: item })
    }

    if (this._config.selectionMode === SELECTION_MODE_MULTIPLE) {
      this.toggle(value)
      return
    }

    if (this._config.selectionMode === SELECTION_MODE_SINGLE) {
      this.select(value)
    }
  }

  _typeahead(key: string): void {
    if (!this._config.typeahead || key.length !== 1 || key === SPACE_KEY) {
      return
    }

    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout)
    }

    this._search += key.toLowerCase()
    this._searchTimeout = setTimeout(() => {
      this._search = ''
    }, TYPEAHEAD_TIMEOUT)

    const items = this._navigableItems()
    const start = items.findIndex(item => this._itemValue(item) === this._active) + 1
    const ordered = this._search.length > 1 ?
      [...items.slice(start - 1), ...items.slice(0, start - 1)] :
      [...items.slice(start), ...items.slice(0, start)]
    const match = ordered.find(item => this._itemText(item).startsWith(this._search))

    if (match) {
      this._setActive(this._itemValue(match), true)
    }
  }

  _addEventListeners(): void {
    EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK), SELECTOR_ITEM, (event: any) => this._handleClick(event))
    EventHandler.on(this._element, this.constructor.eventName(EVENT_FOCUSIN), SELECTOR_ITEM, (event: any) => {
      if (!this._config.disabled && !this._field) {
        this._setActive(this._itemValue(event.target.closest(SELECTOR_ITEM)), false)
      }
    })

    const target = this._field ?? this._element
    EventHandler.on(target, this.constructor.eventName(EVENT_KEYDOWN), (event: any) => this._handleKeydown(event))
  }

  _handleClick(event: any): void {
    const item = (event.target as HTMLElement).closest(SELECTOR_ITEM) as HTMLElement | null

    if (!item || this._config.disabled) {
      return
    }

    if (this._isDisabled(item)) {
      event.preventDefault()
      return
    }

    const value = this._itemValue(item)

    if (event.shiftKey && this._config.selectionMode === SELECTION_MODE_MULTIPLE && !this._isSelectAll(item)) {
      event.preventDefault()
      this._setActive(value, !this._field)
      this._selectRange(this._anchor, value)
      return
    }

    this._setActive(value, !this._field)

    if ((event.ctrlKey || event.metaKey) && this._config.selectionMode === SELECTION_MODE_MULTIPLE && !this._isSelectAll(item)) {
      this._anchor = value
      this.toggle(value)
      return
    }

    this._anchor = value
    this._activate(item)
  }

  _handleKeydown(event: any): void {
    if (this._config.disabled) {
      return
    }

    const { key } = event

    if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === A_KEY) {
      if (this._config.selectionMode === SELECTION_MODE_MULTIPLE) {
        event.preventDefault()
        this.selectAll()
      }

      return
    }

    if (key === ARROW_UP_KEY || key === ARROW_DOWN_KEY) {
      event.preventDefault()
      this._handleArrowKey(key === ARROW_DOWN_KEY, event.shiftKey)
      return
    }

    if (key === HOME_KEY || key === END_KEY) {
      event.preventDefault()
      this._handleEdgeKey(key === HOME_KEY ? 0 : -1, event.shiftKey)
      return
    }

    if (key === SPACE_KEY || key === ENTER_KEY) {
      this._handleActivationKey(event, key === ENTER_KEY)
      return
    }

    this._typeahead(key)
  }

  _handleArrowKey(forward: boolean, extend: boolean): void {
    this._move(forward)

    if (extend && this._config.selectionMode === SELECTION_MODE_MULTIPLE && this._active !== null) {
      this.select(this._active)
      return
    }

    this._anchor = this._active
  }

  _handleEdgeKey(index: number, extend: boolean): void {
    const anchor = this._anchor ?? this._active
    this._moveToEdge(index)

    if (extend && this._config.selectionMode === SELECTION_MODE_MULTIPLE && this._active !== null) {
      this._selectRange(anchor, this._active)
      return
    }

    this._anchor = this._active
  }

  _handleActivationKey(event: any, isEnter: boolean): void {
    const item = this._activeItem()

    if (!item) {
      return
    }

    const follows = isEnter && this._isLink(item)

    if (!follows) {
      event.preventDefault()
    }

    if (!isEnter && this._config.selectionMode === SELECTION_MODE_NONE) {
      return
    }

    this._anchor = this._active
    this._activate(item)

    if (follows && this._field) {
      item.click()
    }
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): any {
    return this.each(function (this: HTMLElement) {
      const data: any = ListBox.getOrCreateInstance(this, typeof config === 'object' ? config : null)

      if (typeof config !== 'string') {
        return
      }

      if (data[config as string] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string](...args)
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) {
    ListBox.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(ListBox)

export default ListBox
export type { ListBoxConfig }

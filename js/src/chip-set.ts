/**
 * --------------------------------------------------------------------------
 * CoreUI chip-set.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import Chip from './chip.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import { CHECK_ICON, REMOVE_ICON } from './util/icons.js'
import {
  defineJQueryPlugin, getNextActiveElement, isRTL, jQueryDispatch
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'chip-set'
const DATA_KEY = 'coreui.chip-set'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_ADD = 'add'
const EVENT_REMOVE = 'remove'
const EVENT_CHANGE = 'change'
const EVENT_SELECT = 'select'
const EVENT_CLICK = 'click'
const EVENT_KEYDOWN = 'keydown'

const A_KEY = 'a'
const ARROW_LEFT_KEY = 'ArrowLeft'
const ARROW_RIGHT_KEY = 'ArrowRight'
const END_KEY = 'End'
const HOME_KEY = 'Home'
const SPACE_KEY = ' '

const TYPEAHEAD_TIMEOUT = 500

const EVENT_CHIP_SELECTED = 'selected.coreui.chip'
const EVENT_CHIP_DESELECTED = 'deselected.coreui.chip'
const EVENT_CHIP_REMOVE = 'remove.coreui.chip'
const EVENT_CHIP_REMOVED = 'removed.coreui.chip'

const SELECTOR_DATA_CHIP_SET = '[data-coreui-chip-set]'
const SELECTOR_CHIP = '.chip'
const SELECTOR_CHIP_ACTIVE = `${SELECTOR_CHIP}.active`
const SELECTOR_CHIP_REMOVE = '.chip-remove'
const SELECTOR_FOCUSABLE_ITEMS = '.chip:not(.disabled)'

const CLASS_NAME_CHIP = 'chip'
const CLASS_NAME_DISABLED = 'disabled'

const SELECTION_MODE_SINGLE = 'single'

export type ChipSetConfig = {
  ariaAddedAnnouncement: string
  ariaRemoveLabel: string
  ariaRemovedAnnouncement: string
  chipClassName: string | ((value: string) => string) | null
  disabled: boolean
  filter: boolean
  maxChips: number | null
  removable: boolean
  removeIcon: string
  selectable: boolean
  selectedIcon: string
  selectionMode: string
  typeahead: boolean
  unique: boolean
}

const Default: ChipSetConfig = {
  ariaAddedAnnouncement: 'added',
  ariaRemoveLabel: 'Remove',
  ariaRemovedAnnouncement: 'removed',
  chipClassName: null,
  disabled: false,
  filter: false,
  maxChips: null,
  removable: false,
  removeIcon: REMOVE_ICON,
  selectable: false,
  selectedIcon: CHECK_ICON,
  selectionMode: 'multiple',
  typeahead: true,
  unique: false
}

const DefaultType: Record<string, string> = {
  ariaAddedAnnouncement: 'string',
  ariaRemoveLabel: 'string',
  ariaRemovedAnnouncement: 'string',
  chipClassName: '(string|function|null)',
  disabled: 'boolean',
  filter: 'boolean',
  maxChips: '(number|null)',
  removable: 'boolean',
  removeIcon: 'string',
  selectable: 'boolean',
  selectedIcon: 'string',
  selectionMode: 'string',
  typeahead: 'boolean',
  unique: 'boolean'
}

/**
 * Class definition
 */

class ChipSet extends BaseComponent {
  protected declare _disabled: boolean
  protected declare _pendingFocus: HTMLElement | null
  protected declare _chips: string[]
  protected declare _input: HTMLElement | null
  protected declare _liveRegion: HTMLElement | null
  protected declare _anchor: HTMLElement | null
  protected declare _search: string
  protected declare _searchTimeout: ReturnType<typeof setTimeout> | null

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._disabled = this._config.disabled || this._element.classList.contains(CLASS_NAME_DISABLED)
    this._pendingFocus = null
    this._chips = []
    this._liveRegion = null
    this._anchor = null
    this._search = ''
    this._searchTimeout = null

    this._applyAccessibilityRoles()
    this._initChips()
    this._createLiveRegion()
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
  add(chip: HTMLElement | string): HTMLElement | null {
    if (!this._canModify()) {
      return null
    }

    const isElement = typeof chip !== 'string'
    const value = isElement ? this._getChipValue(chip) : String(chip).trim()

    if (!value) {
      return null
    }

    if (this._config.unique && this._chips.includes(value)) {
      return null
    }

    if (this._config.maxChips !== null && this._chips.length >= this._config.maxChips) {
      return null
    }

    const addEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_ADD), {
      value,
      relatedTarget: this._input ?? null
    })

    if (addEvent.defaultPrevented) {
      return null
    }

    const element = isElement ? chip : this._createChip(value)
    this._appendChip(element)
    this._setupChip(element)
    this._chips.push(value)
    this._announce(`${value} ${this._config.ariaAddedAnnouncement}`)

    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_CHANGE), {
      values: this.getValues()
    })

    return element
  }

  remove(chipOrValue: HTMLElement | string): boolean {
    if (!this._canModify()) {
      return false
    }

    let chip: HTMLElement | undefined
    let value: string | undefined

    if (typeof chipOrValue === 'string') {
      value = chipOrValue
      chip = this._findChipByValue(value)
    } else {
      chip = chipOrValue
      value = this._getChipValue(chip)
    }

    if (!chip || !value) {
      return false
    }

    const removeEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_REMOVE), {
      value,
      chip,
      relatedTarget: this._input ?? null
    })

    if (removeEvent.defaultPrevented) {
      return false
    }

    const instance = Chip.getInstance(chip)
    if (instance) {
      instance.remove()
    } else {
      chip.remove()
      this._handleChipRemoval(chip, value)
    }

    return !chip.isConnected
  }

  removeSelected(): void {
    for (const chip of this._getSelectedChipElements()) {
      this.remove(chip)
    }
  }

  clear(): void {
    for (const chip of this._getChipElements()) {
      this.remove(chip)
    }
  }

  selectChip(chip: HTMLElement): void {
    if (!this._getChipElements().includes(chip)) {
      return
    }

    Chip.getInstance(chip)?.select()
  }

  selectAll(): void {
    if (!this._config.selectable) {
      return
    }

    for (const chip of this._getChipElements()) {
      Chip.getInstance(chip)?.select()
    }
  }

  deselectAll(): void {
    for (const chip of this._getSelectedChipElements()) {
      Chip.getInstance(chip)?.deselect()
    }
  }

  clearSelection(): void {
    this.deselectAll()
    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT), {
      selected: this.getSelectedValues()
    })
  }

  getValues(): string[] {
    return [...this._chips]
  }

  getSelectedValues(): string[] {
    return this._getSelectedChipElements().map(chip => this._getChipValue(chip))
  }

  override dispose(): void {
    EventHandler.off(this._element, Chip.EVENT_KEY)

    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout)
    }

    if (this._liveRegion) {
      this._liveRegion.remove()
      this._liveRegion = null
    }

    super.dispose()
  }

  // Private
  override _configAfterMerge(config: any): any {
    // Filter chips are selectable by definition.
    if (config.filter) {
      config.selectable = true
    }

    return config
  }

  _canModify(): boolean {
    return !this._disabled
  }

  _appendChip(chip: HTMLElement): void {
    this._element.append(chip)
  }

  _getChipElements(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_CHIP, this._element as ParentNode)
  }

  _getSelectedChipElements(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_CHIP_ACTIVE, this._element as ParentNode)
  }

  _findChipByValue(value: string): HTMLElement | undefined {
    return this._getChipElements().find(chip => this._getChipValue(chip) === value)
  }

  _getChipValue(chip: HTMLElement): string {
    if (chip.dataset.coreuiChipValue) {
      return chip.dataset.coreuiChipValue
    }

    const clone = chip.cloneNode(true)
    const remove = SelectorEngine.findOne(SELECTOR_CHIP_REMOVE, clone as ParentNode)
    if (remove) {
      remove.remove()
    }

    return clone.textContent?.trim() || ''
  }

  _getFocusableChips(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_FOCUSABLE_ITEMS, this._element as ParentNode)
  }

  _initChips(): void {
    for (const chip of this._getChipElements()) {
      const value = this._getChipValue(chip)
      if (value) {
        this._chips.push(value)
        this._applyChipClassName(chip, value)
      }

      this._setupChip(chip)
    }
  }

  // A selectable set is a horizontal listbox: the set element gets the
  // listbox role and each chip becomes an option, so the chips' selection and
  // disabled states are expressed on roles that allow them. A non-selectable
  // set is a plain group (which also legitimizes the documented aria-label).
  _applyAccessibilityRoles(): void {
    if (!this._element.hasAttribute('role')) {
      this._element.setAttribute('role', this._config.selectable ? 'listbox' : 'group')
    }

    if (this._config.selectable && this._element.getAttribute('role') === 'listbox') {
      this._element.setAttribute('aria-orientation', 'horizontal')

      if (this._config.selectionMode === 'multiple') {
        this._element.setAttribute('aria-multiselectable', 'true')
      }
    }
  }

  // Announce add/remove without moving focus. The region lives NEXT TO the
  // set element: a role=status child inside a listbox would violate the
  // listbox's required children.
  _createLiveRegion(): void {
    const region = document.createElement('span')
    region.classList.add('visually-hidden')
    region.setAttribute('role', 'status')
    this._element.after(region)
    this._liveRegion = region
  }

  _announce(message: string): void {
    if (this._liveRegion) {
      this._liveRegion.textContent = message
    }
  }

  _setupChip(chip: HTMLElement): void {
    if (this._element.getAttribute('role') === 'listbox' && !chip.hasAttribute('role')) {
      chip.setAttribute('role', 'option')
    }

    Chip.getOrCreateInstance(chip, this._getChipConfig(chip))
  }

  _getChipConfig(chip: HTMLElement): Record<string, any> {
    // A chip's own data attributes override the set's options.
    return {
      ariaRemoveLabel: this._config.ariaRemoveLabel,
      disabled: this._disabled,
      filter: this._config.filter,
      removable: this._config.removable,
      removeIcon: this._config.removeIcon,
      selectable: this._config.selectable,
      selectedIcon: this._config.selectedIcon,
      ...Manipulator.getDataAttributes(chip)
    }
  }

  _createChip(value: string): HTMLElement {
    const chip = document.createElement('span')
    chip.className = CLASS_NAME_CHIP
    chip.dataset.coreuiChipValue = value
    chip.append(document.createTextNode(value))
    this._applyChipClassName(chip, value)
    return chip
  }

  _applyChipClassName(chip: HTMLElement, value: string): void {
    const className = this._resolveChipClassName(value)
    if (!className) {
      return
    }

    chip.classList.add(...className.split(/\s+/).filter(Boolean))
  }

  _resolveChipClassName(value: string): string {
    const { chipClassName } = this._config
    if (!chipClassName) {
      return ''
    }

    if (typeof chipClassName === 'function') {
      const resolvedClassName = chipClassName(value)
      return typeof resolvedClassName === 'string' ? resolvedClassName : ''
    }

    return typeof chipClassName === 'string' ? chipClassName : ''
  }

  _addEventListeners(): void {
    EventHandler.on(this._element, this.constructor.eventName(EVENT_KEYDOWN), SELECTOR_CHIP, event => this._handleKeydown(event))
    EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK), SELECTOR_CHIP, event => this._handleClick(event))

    EventHandler.on(this._element, EVENT_CHIP_SELECTED, SELECTOR_CHIP, event => this._handleSelectionChange(event))
    EventHandler.on(this._element, EVENT_CHIP_DESELECTED, SELECTOR_CHIP, event => this._handleSelectionChange(event))
    EventHandler.on(this._element, EVENT_CHIP_REMOVE, SELECTOR_CHIP, event => this._handleChipRemove(event))
    EventHandler.on(this._element, EVENT_CHIP_REMOVED, SELECTOR_CHIP, event => this._handleChipRemoved(event))
  }

  _handleKeydown(event: any): void {
    const chip = (event.target as HTMLElement).closest(SELECTOR_CHIP)
    if (!chip || chip.classList.contains(CLASS_NAME_DISABLED)) {
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === A_KEY) {
      if (this._selectsRange()) {
        event.preventDefault()
        this.selectAll()
      }

      return
    }

    switch (event.key) {
      case ARROW_LEFT_KEY: {
        event.preventDefault()
        // In RTL the visual direction is mirrored, so ArrowLeft moves to the next chip.
        this._moveFocus(this._focusSibling(chip as HTMLElement, isRTL()), event.shiftKey)
        break
      }

      case ARROW_RIGHT_KEY: {
        event.preventDefault()
        this._moveFocus(this._focusSibling(chip as HTMLElement, !isRTL()), event.shiftKey)
        break
      }

      case HOME_KEY: {
        event.preventDefault()
        this._moveFocus(this._navigateToEdge(0), event.shiftKey)
        break
      }

      case END_KEY: {
        event.preventDefault()
        this._moveFocus(this._navigateToEdge(-1), event.shiftKey)
        break
      }

      default: {
        this._typeahead(event.key)
      }
    }
  }

  _handleClick(event: any): void {
    const chip = (event.target as HTMLElement).closest(SELECTOR_CHIP) as HTMLElement | null
    if (!chip || chip.classList.contains(CLASS_NAME_DISABLED) || (event.target as HTMLElement).closest(SELECTOR_CHIP_REMOVE)) {
      return
    }

    if (event.shiftKey && this._selectsRange()) {
      this._selectRange(this._anchor ?? chip, chip)
      return
    }

    this._anchor = chip
  }

  _selectsRange(): boolean {
    return this._config.selectable && this._config.selectionMode !== SELECTION_MODE_SINGLE
  }

  _moveFocus(target: HTMLElement | null, extend: boolean): void {
    if (!target) {
      return
    }

    if (extend && this._selectsRange()) {
      this._selectRange(this._anchor ?? target, target)
      return
    }

    this._anchor = target
  }

  _selectRange(from: HTMLElement, to: HTMLElement): void {
    const chips = this._getFocusableChips()
    const start = chips.indexOf(from)
    const end = chips.indexOf(to)

    if (end === -1) {
      return
    }

    const first = Math.min(start === -1 ? end : start, end)
    const last = Math.max(start === -1 ? end : start, end)

    for (const chip of chips.slice(first, last + 1)) {
      Chip.getInstance(chip)?.select()
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

    const chips = this._getFocusableChips()
    const current = chips.indexOf(document.activeElement as HTMLElement)
    const start = this._search.length > 1 ? Math.max(current, 0) : current + 1
    const ordered = [...chips.slice(start), ...chips.slice(0, start)]
    const match = ordered.find(chip => this._getChipValue(chip).toLowerCase().startsWith(this._search))

    match?.focus()
  }

  _focusSibling(chip: HTMLElement, shouldGetNext: boolean): HTMLElement | null {
    const chips = this._getFocusableChips()
    if (chips.length === 0) {
      return null
    }

    // No cycling: navigation stops at the edges.
    const sibling = getNextActiveElement(chips, chip, shouldGetNext, false)
    if (sibling && sibling !== chip) {
      sibling.focus()
      return sibling
    }

    return null
  }

  _getRemovalNeighbor(chip: HTMLElement): HTMLElement | null {
    const chips = this._getFocusableChips()
    if (chips.length === 0) {
      return null
    }

    // Prefer the next chip, fall back to the previous one at the end.
    const next = getNextActiveElement(chips, chip, true, false)
    if (next && next !== chip) {
      return next
    }

    const previous = getNextActiveElement(chips, chip, false, false)
    return previous && previous !== chip ? previous : null
  }

  _navigateToEdge(targetIndex: number): HTMLElement | null {
    const chips = this._getFocusableChips()
    const target = chips[targetIndex < 0 ? chips.length + targetIndex : targetIndex] ?? null
    target?.focus()
    return target
  }

  _handleSelectionChange(event: any): void {
    const chip = (event.target as HTMLElement).closest(SELECTOR_CHIP)
    if (this._config.selectionMode === SELECTION_MODE_SINGLE && chip?.matches(SELECTOR_CHIP_ACTIVE)) {
      this._enforceSingleSelection(chip as HTMLElement)
    }

    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT), {
      selected: this.getSelectedValues()
    })
  }

  _enforceSingleSelection(selectedChip: HTMLElement): void {
    for (const chip of this._getSelectedChipElements()) {
      if (chip !== selectedChip) {
        Chip.getInstance(chip)?.deselect()
      }
    }
  }

  _handleChipRemove(event: any): void {
    const chip = (event.target as HTMLElement).closest(SELECTOR_CHIP)
    this._pendingFocus = chip ? this._getRemovalNeighbor(chip as HTMLElement) : null
  }

  _handleChipRemoved(event: any): void {
    const chip = (event.target as HTMLElement).closest(SELECTOR_CHIP)

    this._pendingFocus?.focus()
    this._pendingFocus = null

    this._handleChipRemoval(chip as HTMLElement, this._getChipValue(chip as HTMLElement))
  }

  _handleChipRemoval(chip: HTMLElement, value: string): void {
    const index = this._chips.indexOf(value)
    if (index !== -1) {
      this._chips.splice(index, 1)
    }

    this._announce(`${value} ${this._config.ariaRemovedAnnouncement}`)

    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_CHANGE), {
      values: this.getValues()
    })
    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT), {
      selected: this.getSelectedValues()
    })
  }

  // Static
  static chipSetInterface(element: string | Element | null, config?: any): void {
    const data: any = ChipSet.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string]()
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, ChipSet, config, element => [element])
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_CHIP_SET)) {
    ChipSet.chipSetInterface(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(ChipSet)

export default ChipSet

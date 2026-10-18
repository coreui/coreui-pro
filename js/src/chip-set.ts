/**
 * --------------------------------------------------------------------------
 * CoreUI chip-set.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import Chip from './chip.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import { announce } from './util/announce.js'
import { type ChipAnnouncement, getChipAnnouncement, resolveChipClassName } from './util/chip-values.js'
import { containsFocus } from './util/focus.js'
import { CHECK_ICON, REMOVE_ICON } from './util/icons.js'
import {
  createTypeaheadBuffer, findTypeaheadMatch, getRemovalNeighbor, rangeBetween, type TypeaheadBuffer
} from './util/list-navigation.js'
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
const EVENT_BLUR = 'blur'
const EVENT_CLICK = 'click'
const EVENT_KEYDOWN = 'keydown'

const A_KEY = 'a'
const ARROW_LEFT_KEY = 'ArrowLeft'
const ARROW_RIGHT_KEY = 'ArrowRight'
const END_KEY = 'End'
const HOME_KEY = 'Home'

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

const HOST_ATTRIBUTES = ['aria-multiselectable', 'aria-orientation', 'role']

const SELECTION_MODE_SINGLE = 'single'

export type ChipSetConfig = {
  ariaAddedAnnouncement: ChipAnnouncement
  ariaRemoveLabel: string
  ariaRemovedAnnouncement: ChipAnnouncement
  chipClassName: string | ((value: string) => string) | null
  disabled: boolean
  filter: boolean
  maxChips: number | null
  removable: boolean
  removeIcon: string
  selectable: boolean
  selectedIcon: string
  selectionMode: 'multiple' | 'single'
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
  ariaAddedAnnouncement: '(string|function)',
  ariaRemoveLabel: 'string',
  ariaRemovedAnnouncement: '(string|function)',
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
  protected declare _addedAttributes: string[]
  protected declare _disabled: boolean
  protected declare _pendingFocus: HTMLElement | null
  protected declare _chips: string[]
  protected declare _optionChips: Set<HTMLElement>
  protected declare _ownedChips: Map<HTMLElement, Chip>
  protected declare _input: HTMLElement | null
  protected declare _anchor: HTMLElement | null
  protected declare _typeaheadBuffer: TypeaheadBuffer
  protected declare _announcedFrom: string[] | null
  protected declare _batch: { changed: boolean } | null
  protected declare _settled: boolean

  constructor(element?: string | Element | null, config?: Partial<ChipSetConfig> | null) {
    super(element, config)

    this._addedAttributes = HOST_ATTRIBUTES.filter(name => !this._element.hasAttribute(name))
    this._disabled = this._config.disabled
    this._pendingFocus = null
    this._chips = []
    this._optionChips = new Set()
    this._ownedChips = new Map()
    this._anchor = null
    this._typeaheadBuffer = createTypeaheadBuffer()
    this._announcedFrom = null
    this._batch = null
    this._settled = false

    this._applyAccessibilityRoles()
    this._initChips()
    this._addEventListeners()
    queueMicrotask(() => {
      this._settled = true
    })
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
    this._noteChange()
    this._chips.push(value)

    if (this._batch) {
      this._batch.changed = true
    } else {
      this._triggerChange()
    }

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
    this._removeChips(this._getSelectedChipElements())
  }

  clear(): void {
    this._removeChips(this._getChipElements())
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
    if (!this._element) {
      return
    }

    EventHandler.off(this._element, Chip.EVENT_KEY)

    for (const [chip, instance] of this._ownedChips) {
      if (Chip.getInstance(chip) === instance && this._element.contains(chip)) {
        instance.dispose()
      }
    }

    for (const chip of this._optionChips) {
      if (this._element.contains(chip)) {
        chip.removeAttribute('role')
      }
    }

    for (const name of this._addedAttributes) {
      this._element.removeAttribute(name)
    }

    this._typeaheadBuffer.clear()

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

  _noteChange(): void {
    if (!this._settled || this._announcedFrom) {
      return
    }

    this._announcedFrom = [...this._chips]
    queueMicrotask(() => this._announceChange())
  }

  _announceChange(): void {
    const before = this._announcedFrom ?? []
    this._announcedFrom = null

    if (!this._element?.isConnected || !this._element.checkVisibility()) {
      return
    }

    const message = getChipAnnouncement(before, this._chips, this._config.ariaAddedAnnouncement, this._config.ariaRemovedAnnouncement)

    if (message) {
      announce(message, { context: this._element })
    }
  }

  _triggerChange(): void {
    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_CHANGE), {
      value: this.getValues()
    })
  }

  _setupChip(chip: HTMLElement): void {
    if (this._element.getAttribute('role') === 'listbox' && !chip.hasAttribute('role')) {
      chip.setAttribute('role', 'option')
      this._optionChips.add(chip)
    }

    if (!Chip.getInstance(chip)) {
      this._ownedChips.set(chip, new Chip(chip, this._getChipConfig(chip)))
    }
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
    const className = resolveChipClassName(this._config.chipClassName, value)
    if (!className) {
      return
    }

    chip.classList.add(...className.split(/\s+/).filter(Boolean))
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

    const rtl = isRTL(this._element)

    switch (event.key) {
      case ARROW_LEFT_KEY: {
        event.preventDefault()
        // In RTL the visual direction is mirrored, so ArrowLeft moves to the next chip.
        this._moveFocus(this._focusSibling(chip as HTMLElement, rtl), event.shiftKey)
        break
      }

      case ARROW_RIGHT_KEY: {
        event.preventDefault()
        this._moveFocus(this._focusSibling(chip as HTMLElement, !rtl), event.shiftKey)
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

    for (const chip of rangeBetween(chips, chips.indexOf(from), chips.indexOf(to))) {
      Chip.getInstance(chip)?.select()
    }
  }

  _typeahead(key: string): void {
    const text = this._config.typeahead ? this._typeaheadBuffer.push(key) : null

    if (!text) {
      return
    }

    const chips = this._getFocusableChips()
    const current = chips.indexOf(document.activeElement as HTMLElement)

    findTypeaheadMatch(chips, current, text, chip => this._getChipValue(chip))?.focus()
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

  _getRemovalFocusTarget(chip: HTMLElement): HTMLElement {
    return getRemovalNeighbor(this._getFocusableChips(), chip) ?? this._element
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
    const chip = (event.target as HTMLElement).closest<HTMLElement>(SELECTOR_CHIP)
    this._pendingFocus = chip ? this._getRemovalFocusTarget(chip) : null
  }

  _handleChipRemoved(event: any): void {
    const chip = (event.target as HTMLElement).closest<HTMLElement>(SELECTOR_CHIP)
    const target = this._pendingFocus
    this._pendingFocus = null

    if (target && containsFocus(chip)) {
      if (target === this._element) {
        this._focusSet()
      } else {
        target.focus()
      }
    }

    this._handleChipRemoval(chip as HTMLElement, this._getChipValue(chip as HTMLElement))
  }

  _focusSet(): void {
    if (this._element.hasAttribute('tabindex')) {
      this._element.focus()
      return
    }

    this._element.setAttribute('tabindex', '-1')
    this._addedAttributes.push('tabindex')
    EventHandler.on(this._element, this.constructor.eventName(EVENT_BLUR), () => this._releaseSetTabindex())
    this._element.focus()
    this._releaseSetTabindex()
  }

  _releaseSetTabindex(): void {
    if ((this._element.getRootNode() as Document | ShadowRoot).activeElement === this._element) {
      return
    }

    EventHandler.off(this._element, this.constructor.eventName(EVENT_BLUR))
    this._element.removeAttribute('tabindex')
    this._addedAttributes = this._addedAttributes.filter(name => name !== 'tabindex')
  }

  _handleChipRemoval(chip: HTMLElement, value: string): void {
    this._optionChips.delete(chip)
    this._ownedChips.delete(chip)

    const index = this._chips.indexOf(value)
    if (index !== -1) {
      this._noteChange()
      this._chips.splice(index, 1)
    }

    if (this._batch) {
      this._batch.changed = true
    } else {
      this._reportRemoval()
    }
  }

  _removeChips(chips: HTMLElement[]): void {
    const outer = !this._batch
    const batch = this._batch ?? { changed: false }

    this._batch = batch

    try {
      for (const chip of chips) {
        if (this._element.contains(chip)) {
          this.remove(chip)
        }
      }
    } finally {
      if (outer) {
        this._batch = null

        if (batch.changed && this._config) {
          this._reportRemoval()
        }
      }
    }
  }

  _reportRemoval(): void {
    this._triggerChange()
    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT), {
      selected: this.getSelectedValues()
    })
  }

  // Static
  static chipSetInterface(element: string | Element | null, config?: any, ...args: any[]): void {
    const data: any = ChipSet.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string](...args)
    }
  }

  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, ChipSet, config, args)
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

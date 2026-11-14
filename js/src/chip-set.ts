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
import {
  type ChipAnnouncement, type ChipRemoveLabel, getChipAnnouncement, resolveChipClassName
} from './util/chip-values.js'
import { containsFocus, focusWithTemporaryTabindex, rootActiveElement } from './util/focus.js'
import { REMOVE_ICON } from './util/icons.js'
import {
  createTypeaheadBuffer, getRemovalNeighbor, isTypingKey, type TypeaheadBuffer
} from './util/list-navigation.js'
import {
  defineJQueryPlugin, getNextActiveElement, isRTL, jQueryDispatch, writeAttribute
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
const EVENT_FOCUSIN = 'focusin'
const EVENT_KEYDOWN = 'keydown'

const ARROW_DOWN_KEY = 'ArrowDown'
const ARROW_LEFT_KEY = 'ArrowLeft'
const ARROW_RIGHT_KEY = 'ArrowRight'
const ARROW_UP_KEY = 'ArrowUp'
const END_KEY = 'End'
const HOME_KEY = 'Home'

const EVENT_CHIP_REMOVE = 'remove.coreui.chip'
const EVENT_CHIP_REMOVED = 'removed.coreui.chip'

const SELECTOR_DATA_CHIP_SET = '[data-coreui-chip-set]'
const SELECTOR_CHIP = '.chip'
const SELECTOR_CHIP_REMOVE = '.chip-remove'
const SELECTOR_CHIP_ROW = '.chip-row'
const SELECTOR_FOCUSABLE_ITEMS = '.chip[data-coreui-chip-focusable]'
const SELECTOR_NATIVE_HOST = 'a[href], button'

const CLASS_NAME_CHIP = 'chip'
const CLASS_NAME_CHIP_ROW = 'chip-row'
const CLASS_NAME_DISABLED = 'disabled'

export type ChipSetConfig = {
  ariaAddedAnnouncement: ChipAnnouncement
  ariaRemoveLabel: ChipRemoveLabel
  ariaRemovedAnnouncement: ChipAnnouncement
  chipClassName: string | ((value: string) => string) | null
  disabled: boolean
  maxChips: number | null
  removable: boolean
  removeIcon: string
  typeahead: boolean
  unique: boolean
}

const Default: ChipSetConfig = {
  ariaAddedAnnouncement: 'added',
  ariaRemoveLabel: 'Remove',
  ariaRemovedAnnouncement: 'removed',
  chipClassName: null,
  disabled: false,
  maxChips: null,
  removable: false,
  removeIcon: REMOVE_ICON,
  typeahead: true,
  unique: false
}

const DefaultType: Record<string, string> = {
  ariaAddedAnnouncement: '(string|function)',
  ariaRemoveLabel: '(string|function)',
  ariaRemovedAnnouncement: '(string|function)',
  chipClassName: '(string|function|null)',
  disabled: 'boolean',
  maxChips: '(number|null)',
  removable: 'boolean',
  removeIcon: 'string',
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
  protected declare _ownedChips: Map<HTMLElement, Chip>
  protected declare _input: HTMLElement | null
  protected declare _typeaheadBuffer: TypeaheadBuffer
  protected declare _announcedFrom: string[] | null
  protected declare _batch: { added: boolean, removed: boolean } | null
  protected declare _settled: boolean

  constructor(element?: string | Element | null, config?: Partial<ChipSetConfig> | null) {
    super(element, config)

    this._disabled = this._config.disabled
    this._pendingFocus = null
    this._chips = []
    this._ownedChips = new Map()
    this._typeaheadBuffer = createTypeaheadBuffer()
    this._announcedFrom = null
    this._batch = null
    this._settled = false

    this._initChips()
    this._syncRoles()
    this._moveTabStop()
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
    const previousRow = element.closest(SELECTOR_CHIP_ROW)

    this._appendChip(element)
    previousRow?.remove()
    this._setupChip(element)
    this._syncRoles()
    this._moveTabStop()
    this._noteChange()
    this._chips.push(value)

    if (this._batch) {
      this._batch.added = true
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
      const row = this._chipRoot(chip)

      row.remove()
      this._handleChipRemoval(chip, value)
    }

    return !chip.isConnected
  }

  clear(): void {
    this._removeChips(this._getChipElements())
  }

  getValues(): string[] {
    return [...this._chips]
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

    if (this._chipRole()) {
      for (const chip of this._getChipElements()) {
        chip.removeAttribute('role')

        const row = chip.closest(SELECTOR_CHIP_ROW)
        row?.replaceWith(chip)
      }
    }

    this._typeaheadBuffer.clear()

    super.dispose()
  }

  // Private
  _canModify(): boolean {
    return !this._disabled
  }

  _appendChip(chip: HTMLElement): void {
    this._element.append(chip)
  }

  _getChipElements(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_CHIP, this._element as ParentNode)
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

  _chipRoot(chip: HTMLElement): Element {
    return chip.closest(SELECTOR_CHIP_ROW) ?? chip
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

  _containerRole(leaving: HTMLElement | null = null): string | null {
    const hasOther = (chips: HTMLElement[]): boolean => chips.some(chip => chip !== leaving)

    if (!this._config.removable) {
      return hasOther(this._getChipElements()) ? 'list' : null
    }

    return hasOther(this._getFocusableChips()) ? 'grid' : 'group'
  }

  _chipRole(): string | null {
    return this._config.removable ? 'gridcell' : 'listitem'
  }

  _roleElement(): HTMLElement | null {
    return this._element
  }

  _syncRoles(leaving: HTMLElement | null = null): void {
    const element = this._roleElement()

    if (!element) {
      return
    }

    const role = this._containerRole(leaving)

    writeAttribute(element, 'role', role)
    writeAttribute(element, 'aria-disabled', this._disabled && ['grid', 'group', 'listbox'].includes(role as string) ? 'true' : null)

    if (this._chipRole() !== 'gridcell') {
      return
    }

    for (const chip of this._getChipElements()) {
      const row = chip.closest(SELECTOR_CHIP_ROW)

      if (row) {
        writeAttribute(row, 'role', role === 'grid' ? 'row' : null)
        writeAttribute(chip, 'role', role === 'grid' ? 'gridcell' : null)
        Chip.getInstance(chip)?._applyState()
      }
    }
  }

  _moveTabStop(stop: HTMLElement | null = null): void {
    const chips = this._getFocusableChips()
    const current = stop ?? chips.find(chip => chip.tabIndex === 0) ?? chips[0]

    for (const chip of chips) {
      chip.tabIndex = chip === current ? 0 : -1
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
    const existing = Chip.getInstance(chip)

    if (existing && (this._ownedChips.get(chip) === existing || this._chipRole() === null)) {
      return
    }

    existing?.dispose()

    const role = this._chipRole()
    const isNative = chip.matches(SELECTOR_NATIVE_HOST)

    if (role && (!isNative || role === 'option')) {
      chip.setAttribute('role', role)
    }

    if ((role === 'gridcell' && !isNative) || (role === 'listitem' && isNative)) {
      const row = document.createElement('span')

      row.className = CLASS_NAME_CHIP_ROW

      if (isNative) {
        row.setAttribute('role', role)
      }

      chip.replaceWith(row)
      row.append(chip)
    }

    this._ownedChips.set(chip, new Chip(chip, this._getChipConfig(chip)))
  }

  _getChipConfig(chip: HTMLElement): Record<string, any> {
    const {
      filter: _filter, removable, selectable: _selectable, ...attributes
    } = this._removeDisallowed(Manipulator.getDataAttributes(chip))

    return {
      ariaRemoveLabel: this._config.ariaRemoveLabel,
      disabled: this._disabled,
      filter: false,
      owned: true,
      removeIcon: this._config.removeIcon,
      selectable: false,
      ...attributes,
      removable: Boolean(this._config.removable) && removable !== false
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
    EventHandler.on(this._element, this.constructor.eventName(EVENT_FOCUSIN), SELECTOR_CHIP, event => this._moveTabStop(event.delegateTarget))

    EventHandler.on(this._element, EVENT_CHIP_REMOVE, SELECTOR_CHIP, event => this._handleChipRemove(event))
    EventHandler.on(this._element, EVENT_CHIP_REMOVED, SELECTOR_CHIP, event => this._handleChipRemoved(event))
  }

  _handleKeydown(event: any): void {
    const chip = (event.target as HTMLElement).closest(SELECTOR_CHIP)
    if (!chip || chip.classList.contains(CLASS_NAME_DISABLED)) {
      return
    }

    if (this._handleCommandKey(event)) {
      return
    }

    const rtl = isRTL(this._element)

    if ([ARROW_DOWN_KEY, ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, HOME_KEY, END_KEY].includes(event.key)) {
      this._typeaheadBuffer.clear()
    }

    switch (event.key) {
      case ARROW_LEFT_KEY: {
        event.preventDefault()
        // In RTL the visual direction is mirrored, so ArrowLeft moves to the next chip.
        this._moveFocus(this._focusSibling(chip as HTMLElement, rtl), event.shiftKey, chip as HTMLElement)
        break
      }

      case ARROW_RIGHT_KEY: {
        event.preventDefault()
        this._moveFocus(this._focusSibling(chip as HTMLElement, !rtl), event.shiftKey, chip as HTMLElement)
        break
      }

      case ARROW_DOWN_KEY:
      case ARROW_UP_KEY: {
        if (this._chipRole() === 'gridcell') {
          event.preventDefault()
          this._moveFocus(this._focusSibling(chip as HTMLElement, event.key === ARROW_DOWN_KEY), event.shiftKey, chip as HTMLElement)
        }

        break
      }

      case HOME_KEY: {
        event.preventDefault()
        this._moveFocus(this._navigateToEdge(0), event.shiftKey, chip as HTMLElement)
        break
      }

      case END_KEY: {
        event.preventDefault()
        this._moveFocus(this._navigateToEdge(-1), event.shiftKey, chip as HTMLElement)
        break
      }

      default: {
        if (isTypingKey(event)) {
          this._typeahead(event.key)
        }
      }
    }
  }

  _handleCommandKey(_event: any): boolean {
    return false
  }

  _moveFocus(_target: HTMLElement | null, _extend: boolean, _origin: HTMLElement): void {}

  _typeahead(key: string): void {
    if (!this._config.typeahead) {
      return
    }

    const chips = this._getFocusableChips()
    const current = chips.indexOf(rootActiveElement(this._element) as HTMLElement)

    this._typeaheadBuffer.search(key, chips, current, chip => this._getChipValue(chip))?.focus()
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
    return getRemovalNeighbor(this._getFocusableChips(), chip) ?? this._getRemovalFallback()
  }

  _getRemovalFallback(): HTMLElement {
    return this._element
  }

  _navigateToEdge(targetIndex: number): HTMLElement | null {
    const chips = this._getFocusableChips()
    const target = chips[targetIndex < 0 ? chips.length + targetIndex : targetIndex] ?? null
    target?.focus()
    return target
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
        this._syncRoles(chip)
        focusWithTemporaryTabindex(this._element)
      } else {
        target.focus()
      }
    }

    this._handleChipRemoval(chip as HTMLElement, this._getChipValue(chip as HTMLElement))
  }

  _handleChipRemoval(chip: HTMLElement, value: string): void {
    this._ownedChips.delete(chip)
    this._syncRoles(chip)
    this._moveTabStop()

    const index = this._chips.indexOf(value)
    if (index !== -1) {
      this._noteChange()
      this._chips.splice(index, 1)
    }

    if (this._batch) {
      this._batch.removed = true
    } else {
      this._triggerChange()
    }
  }

  _removeChips(chips: HTMLElement[]): void {
    const outer = !this._batch
    const batch = this._batch ?? { added: false, removed: false }

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

        if (batch.removed || batch.added) {
          this._triggerChange()
        }
      }
    }
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, ChipSet, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_CHIP_SET)) {
    ChipSet.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(ChipSet)

export default ChipSet

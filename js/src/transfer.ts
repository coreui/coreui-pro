/**
 * --------------------------------------------------------------------------
 * CoreUI transfer.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import ListBox, { type ListBoxEntry, type ListBoxGroup, type ListBoxItem } from './list-box.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import type { ComponentConfig } from './util/config.js'
import {
  CHEVRON_DOUBLE_LEFT_ICON, CHEVRON_DOUBLE_RIGHT_ICON, CHEVRON_LEFT_ICON, CHEVRON_RIGHT_ICON
} from './util/icons.js'
import { defineJQueryPlugin, getUID } from './util/index.js'
import { sanitizeHtml, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'

/**
 * Constants
 */

const NAME = 'transfer'
const DATA_KEY = 'coreui.transfer'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CHANGE = 'change'
const EVENT_MOVE = 'move'
const EVENT_MOVED = 'moved'
const EVENT_SEARCH = 'search'

const EVENT_CLICK = 'click'
const EVENT_INPUT = 'input'
const EVENT_LIST_BOX_CHANGE = 'change.coreui.list-box'
const EVENT_LIST_BOX_SEARCH = 'search.coreui.list-box'

const CLASS_NAME_ANNOUNCER = 'transfer-announcer'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_OPTIONS = 'list-box-options'
const CLASS_NAME_VISUALLY_HIDDEN = 'visually-hidden'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="transfer"]'
const SELECTOR_LIST = '[data-coreui-transfer-list]'
const SELECTOR_MOVE = '[data-coreui-transfer-move]'
const SELECTOR_OPTION = '.list-box-option'
const SELECTOR_OPTIONS = '.list-box-options'
const SELECTOR_SEARCH = '[data-coreui-list-box-search]'
const SELECTOR_SELECT_ALL = '[data-coreui-select-all]'

const SIDE_SOURCE = 'source'
const SIDE_TARGET = 'target'
const SUFFIX_ALL = '-all'

const MOVE_KINDS = new Set([SIDE_SOURCE, SIDE_TARGET, `${SIDE_SOURCE}${SUFFIX_ALL}`, `${SIDE_TARGET}${SUFFIX_ALL}`])

type TransferSide = {
  element: HTMLElement
  listBox: ListBox
  name: string
  options: HTMLElement
  selectAll: HTMLElement | null
  title: string
}

type TransferConfig = {
  allowList: SanitizerAllowList
  ariaMoveAllToSourceLabel: string
  ariaMoveAllToTargetLabel: string
  ariaMoveToSourceLabel: string
  ariaMoveToTargetLabel: string
  ariaMovedAnnouncement: string
  disabled: boolean
  html: boolean
  indicator: string
  items: ListBoxEntry[]
  loading: boolean
  moveAllToSourceIcon: string
  moveAllToTargetIcon: string
  moveToSourceIcon: string
  moveToTargetIcon: string
  oneWay: boolean
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  search: boolean | string
  searchPlaceholder: string
  selectedCounterText: string
  sourceTitle: string
  targetTitle: string
  typeahead: boolean
  value: string[]
}

const Default: TransferConfig = {
  allowList: SVGAllowlist,
  ariaMoveAllToSourceLabel: 'Move all to available',
  ariaMoveAllToTargetLabel: 'Move all to chosen',
  ariaMoveToSourceLabel: 'Move to available',
  ariaMoveToTargetLabel: 'Move to chosen',
  ariaMovedAnnouncement: '{count} moved to {title}',
  disabled: false,
  html: false,
  indicator: 'checkbox',
  items: [],
  loading: false,
  moveAllToSourceIcon: CHEVRON_DOUBLE_LEFT_ICON,
  moveAllToTargetIcon: CHEVRON_DOUBLE_RIGHT_ICON,
  moveToSourceIcon: CHEVRON_LEFT_ICON,
  moveToTargetIcon: CHEVRON_RIGHT_ICON,
  oneWay: false,
  sanitize: true,
  sanitizeFn: null,
  search: false,
  searchPlaceholder: 'Search',
  selectedCounterText: 'selected',
  sourceTitle: 'Available',
  targetTitle: 'Chosen',
  typeahead: true,
  value: []
}

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaMoveAllToSourceLabel: 'string',
  ariaMoveAllToTargetLabel: 'string',
  ariaMoveToSourceLabel: 'string',
  ariaMoveToTargetLabel: 'string',
  ariaMovedAnnouncement: 'string',
  disabled: 'boolean',
  html: 'boolean',
  indicator: 'string',
  items: 'array',
  loading: 'boolean',
  moveAllToSourceIcon: 'string',
  moveAllToTargetIcon: 'string',
  moveToSourceIcon: 'string',
  moveToTargetIcon: 'string',
  oneWay: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
  search: '(boolean|string)',
  searchPlaceholder: 'string',
  selectedCounterText: 'string',
  sourceTitle: 'string',
  targetTitle: 'string',
  typeahead: 'boolean',
  value: 'array'
}

/**
 * Class definition
 */

class Transfer extends BaseComponent {
  protected declare _announcer: HTMLElement
  protected declare _itemRanks: Map<string, number>
  protected declare _items: ListBoxEntry[] | null
  protected declare _onListBoxChange: () => void
  protected declare _onListBoxSearch: (event: Event) => void
  protected declare _order: WeakMap<HTMLElement, number>
  protected declare _ranks: number
  protected declare _rendered: boolean
  protected declare _sides: Record<string, TransferSide>

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._announcer = this._createAnnouncer()
    this._itemRanks = new Map()
    this._items = this._config.items.length > 0 ? this._config.items : null
    this._sides = {
      [SIDE_SOURCE]: this._createSide(SIDE_SOURCE),
      [SIDE_TARGET]: this._createSide(SIDE_TARGET)
    }
    this._onListBoxChange = () => this._refresh()
    this._onListBoxSearch = (event: Event) => this._reportSearch(event)
    this._order = new WeakMap()
    this._ranks = 0
    this._rendered = false

    if (this._items) {
      this._applyItems(this._config.value)
    }

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
  moveToTarget(values?: string[]): void {
    this._moveValues(SIDE_TARGET, values)
  }

  moveToSource(values?: string[]): void {
    this._moveValues(SIDE_SOURCE, values)
  }

  moveAllToTarget(): void {
    this._moveValues(SIDE_TARGET, this._movableValues(this._sides[SIDE_SOURCE]))
  }

  moveAllToSource(): void {
    this._moveValues(SIDE_SOURCE, this._movableValues(this._sides[SIDE_TARGET]))
  }

  getSource(): string[] {
    return this._values(this._sides[SIDE_SOURCE])
  }

  getTarget(): string[] {
    return this._values(this._sides[SIDE_TARGET])
  }

  getSelected(side: string): string[] {
    return this._sides[side].listBox.getSelected()
  }

  setItems(items: ListBoxEntry[]): void {
    this._items = Array.isArray(items) ? items : []
    this._applyItems(this.getTarget())
    this.update()
  }

  getItems(): ListBoxEntry[] {
    return this._items ?? []
  }

  setLoading(loading: boolean, side?: string): void {
    if (side === undefined) {
      this._config.loading = loading
    }

    for (const [name, entry] of Object.entries(this._sides)) {
      if (side === undefined || side === name) {
        entry.listBox.setLoading(loading)
      }
    }
  }

  update(): void {
    this._rankOptions()

    for (const side of Object.values(this._sides)) {
      this._decorateSide(side)
      side.listBox.update()
    }

    this._decorateMoveButtons()
    this._refresh()
  }

  override dispose(): void {
    this._element.removeEventListener(EVENT_LIST_BOX_CHANGE, this._onListBoxChange)
    this._element.removeEventListener(EVENT_LIST_BOX_SEARCH, this._onListBoxSearch)
    EventHandler.off(this._element, EVENT_KEY)

    for (const side of Object.values(this._sides)) {
      side.listBox.dispose()
    }

    this._announcer.remove()

    super.dispose()
  }

  // Private
  _createAnnouncer(): HTMLElement {
    const announcer = document.createElement('div')

    announcer.classList.add(CLASS_NAME_ANNOUNCER, CLASS_NAME_VISUALLY_HIDDEN)
    announcer.setAttribute('role', 'status')
    this._element.append(announcer)

    return announcer
  }

  _createSide(name: string): TransferSide {
    const element = SelectorEngine.findOne(`[data-coreui-transfer-list="${name}"]`, this._element) as HTMLElement | null

    if (!element) {
      throw new TypeError(`Transfer requires a [data-coreui-transfer-list="${name}"] element`)
    }

    const title = name === SIDE_SOURCE ? this._config.sourceTitle : this._config.targetTitle
    const options = this._resolveOptions(element)

    return {
      element,
      listBox: ListBox.getOrCreateInstance(element, {
        allowList: this._config.allowList,
        ariaSearchLabel: `${this._config.searchPlaceholder} ${title}`,
        counter: true,
        disabled: this._config.disabled,
        html: this._config.html,
        indicator: this._config.indicator,
        loading: this._config.loading,
        sanitize: this._config.sanitize,
        sanitizeFn: this._config.sanitizeFn,
        search: this._config.search,
        searchPlaceholder: this._config.searchPlaceholder,
        selectedCounterText: this._config.selectedCounterText,
        selectionMode: 'multiple',
        typeahead: this._config.typeahead
      }) as ListBox,
      name,
      options,
      selectAll: SelectorEngine.findOne(SELECTOR_SELECT_ALL, element),
      title
    }
  }

  _resolveOptions(element: HTMLElement): HTMLElement {
    const existing = SelectorEngine.findOne(SELECTOR_OPTIONS, element) as HTMLElement | null

    if (existing) {
      return existing
    }

    if (!this._items) {
      return element
    }

    const options = document.createElement('div')

    options.classList.add(CLASS_NAME_OPTIONS)
    element.append(options)

    return options
  }

  _decorateSide(side: TransferSide): void {
    if (!side.options.id) {
      side.options.id = getUID(`${NAME}-options-`)
    }

    if (!side.options.hasAttribute('aria-label') && !side.options.hasAttribute('aria-labelledby')) {
      side.options.setAttribute('aria-label', side.title)
    }

    if (side.selectAll && side.selectAll.textContent?.trim() === '') {
      side.selectAll.textContent = side.title
    }
  }

  _decorateMoveButtons(): void {
    for (const button of this._moveButtons()) {
      const kind = this._moveKind(button)
      const side = this._moveSide(kind)

      if (!button.hasAttribute('aria-label')) {
        button.setAttribute('aria-label', this._moveLabel(kind))
      }

      if (button.innerHTML.trim() === '') {
        button.innerHTML = this._sanitizeIcon(this._moveIcon(kind))
      }

      button.setAttribute('aria-controls', this._sides[side].options.id)

      if (side === SIDE_SOURCE) {
        button.toggleAttribute('hidden', this._config.oneWay)
      }
    }
  }

  _moveKind(button: HTMLElement): string {
    const kind = button.dataset.coreuiTransferMove ?? ''
    return MOVE_KINDS.has(kind) ? kind : SIDE_TARGET
  }

  _moveSide(kind: string): string {
    return kind.startsWith(SIDE_TARGET) ? SIDE_TARGET : SIDE_SOURCE
  }

  _movesAll(kind: string): boolean {
    return kind.endsWith(SUFFIX_ALL)
  }

  _moveLabel(kind: string): string {
    if (this._movesAll(kind)) {
      return this._moveSide(kind) === SIDE_TARGET ? this._config.ariaMoveAllToTargetLabel : this._config.ariaMoveAllToSourceLabel
    }

    return this._moveSide(kind) === SIDE_TARGET ? this._config.ariaMoveToTargetLabel : this._config.ariaMoveToSourceLabel
  }

  _moveIcon(kind: string): string {
    if (this._movesAll(kind)) {
      return this._moveSide(kind) === SIDE_TARGET ? this._config.moveAllToTargetIcon : this._config.moveAllToSourceIcon
    }

    return this._moveSide(kind) === SIDE_TARGET ? this._config.moveToTargetIcon : this._config.moveToSourceIcon
  }

  _sanitizeIcon(icon: string): string {
    return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon
  }

  _moveButtons(): HTMLButtonElement[] {
    return SelectorEngine.find(SELECTOR_MOVE, this._element) as HTMLButtonElement[]
  }

  _options(side: TransferSide): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_OPTION, side.options)
  }

  _visibleOptions(side: TransferSide): HTMLElement[] {
    return this._options(side).filter(option => !option.hasAttribute('hidden'))
  }

  _applyItems(values: string[]): void {
    const items = this._items ?? []
    const flat = this._flatItems(items)
    const byValue = new Map(flat.map(item => [this._itemValue(item), item]))

    this._itemRanks = new Map([...byValue.keys()].map((value, index) => [value, index]))

    const chosen = (Array.isArray(values) ? values : []).filter(value => byValue.has(value))
    const taken = new Set(chosen)

    this._sides[SIDE_TARGET].listBox.setItems(this._forwardItems(chosen.map(value => byValue.get(value) as ListBoxItem)))
    this._sides[SIDE_SOURCE].listBox.setItems(this._forwardItems(this._availableItems(items, taken)))

    if (this._rendered) {
      for (const side of Object.values(this._sides)) {
        side.listBox.clear()
      }
    }

    this._rendered = true
  }

  _forwardItems(entries: ListBoxEntry[]): ListBoxEntry[] {
    if (!this._rendered) {
      return entries
    }

    return entries.map(entry => {
      if (Array.isArray((entry as ListBoxGroup).items)) {
        const group = entry as ListBoxGroup
        return { label: group.label, items: group.items.map(item => this._unmarked(item)) }
      }

      return this._unmarked(entry as ListBoxItem)
    })
  }

  _unmarked(item: ListBoxItem): ListBoxItem {
    if (!item.selected) {
      return item
    }

    const { selected, ...rest } = item

    return rest
  }

  _availableItems(items: ListBoxEntry[], taken: Set<string>): ListBoxEntry[] {
    const available: ListBoxEntry[] = []

    for (const entry of items) {
      if (entry === null || typeof entry !== 'object') {
        continue
      }

      if (!Array.isArray((entry as ListBoxGroup).items)) {
        if (!taken.has(this._itemValue(entry as ListBoxItem))) {
          available.push(entry)
        }

        continue
      }

      const group = entry as ListBoxGroup
      const rest = group.items.filter(item => !taken.has(this._itemValue(item)))

      if (rest.length > 0) {
        available.push({ label: group.label, items: rest })
      }
    }

    return available
  }

  _flatItems(items: ListBoxEntry[]): ListBoxItem[] {
    return items
      .filter(entry => entry !== null && typeof entry === 'object')
      .flatMap(entry => (Array.isArray((entry as ListBoxGroup).items) ? (entry as ListBoxGroup).items : [entry as ListBoxItem]))
  }

  _itemValue(item: ListBoxItem): string {
    return String(item.value ?? item.label ?? '')
  }

  _rankOptions(): void {
    if (this._items) {
      return
    }

    for (const side of [this._sides[SIDE_SOURCE], this._sides[SIDE_TARGET]]) {
      for (const option of this._options(side)) {
        if (!this._order.has(option)) {
          this._order.set(option, this._ranks++)
        }
      }
    }
  }

  _rankOf(option: HTMLElement): number {
    if (this._items) {
      return this._itemRanks.get(this._optionValue(option)) ?? Number.MAX_SAFE_INTEGER
    }

    return this._order.get(option) ?? Number.MAX_SAFE_INTEGER
  }

  _insertInOriginalOrder(to: TransferSide, options: HTMLElement[]): void {
    for (const option of options.toSorted((a, b) => this._rankOf(a) - this._rankOf(b))) {
      const next = this._options(to).find(existing => this._rankOf(existing) > this._rankOf(option))

      if (next) {
        next.before(option)
        continue
      }

      to.options.append(option)
    }
  }

  _movableValues(side: TransferSide): string[] {
    return this._visibleOptions(side)
      .filter(option => !option.classList.contains(CLASS_NAME_DISABLED) && option.getAttribute('aria-disabled') !== 'true')
      .map(option => this._optionValue(option))
  }

  _values(side: TransferSide): string[] {
    return this._options(side).map(option => this._optionValue(option))
  }

  _optionValue(option: HTMLElement): string {
    return option.dataset.coreuiValue ?? option.textContent?.trim() ?? ''
  }

  _sideOf(element: HTMLElement): TransferSide | null {
    const list = element.closest(SELECTOR_LIST) as HTMLElement | null

    return list ? this._sides[list.dataset.coreuiTransferList as string] ?? null : null
  }

  _reportSearch(event: Event): void {
    const side = this._sideOf(event.target as HTMLElement)

    if (!side) {
      return
    }

    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SEARCH), {
      query: (event as CustomEvent & { query: string }).query,
      side: side.name
    })
  }

  _refresh(): void {
    this._refreshMoveButtons()
  }

  _refreshMoveButtons(): void {
    for (const button of this._moveButtons()) {
      const kind = this._moveKind(button)
      const side = this._moveSide(kind)
      const from = this._sides[side === SIDE_TARGET ? SIDE_SOURCE : SIDE_TARGET]
      const blocked = this._config.disabled || (side === SIDE_SOURCE && this._config.oneWay)
      const movable = this._movesAll(kind) ? this._movableValues(from).length : from.listBox.getSelected().length

      button.disabled = blocked || movable === 0
    }
  }

  _moveValues(side: string, values?: string[]): void {
    if (this._config.disabled || (side === SIDE_SOURCE && this._config.oneWay)) {
      return
    }

    const to = this._sides[side]
    const from = this._sides[side === SIDE_TARGET ? SIDE_SOURCE : SIDE_TARGET]
    const wanted = values ?? from.listBox.getSelected()
    const options = this._options(from).filter(option => wanted.includes(this._optionValue(option)))

    if (options.length === 0) {
      return
    }

    const moved = options.map(option => this._optionValue(option))
    const trigger = document.activeElement as HTMLElement | null

    if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_MOVE), { direction: side, values: moved }).defaultPrevented) {
      return
    }

    for (const value of moved) {
      from.listBox.deselect(value)
    }

    if (side === SIDE_TARGET) {
      to.options.append(...options)
    } else {
      this._insertInOriginalOrder(to, options)
    }

    to.listBox.clear()
    from.listBox.update()
    to.listBox.update()
    this._refresh()
    this._restoreFocus(trigger, options[0])

    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_MOVED), { direction: side, values: moved })
    this._triggerChange()
    this._announce(moved.length, to.title)
  }

  _restoreFocus(trigger: HTMLElement | null, option: HTMLElement): void {
    if (!trigger || !trigger.matches(SELECTOR_MOVE) || !(trigger as HTMLButtonElement).disabled) {
      return
    }

    option.focus()
  }

  _triggerChange(): void {
    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_CHANGE), {
      sourceValues: this.getSource(),
      targetValues: this.getTarget()
    })
  }

  _announce(count: number, title: string): void {
    this._announcer.textContent = this._config.ariaMovedAnnouncement
      .replace('{count}', String(count))
      .replace('{title}', title)
  }

  _addEventListeners(): void {
    EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK), SELECTOR_MOVE, (event: any) => {
      const button = (event.target as HTMLElement).closest(SELECTOR_MOVE) as HTMLElement | null

      if (button) {
        const kind = this._moveKind(button)
        const from = this._sides[this._moveSide(kind) === SIDE_TARGET ? SIDE_SOURCE : SIDE_TARGET]

        this._moveValues(this._moveSide(kind), this._movesAll(kind) ? this._movableValues(from) : undefined)
      }
    })

    EventHandler.on(this._element, this.constructor.eventName(EVENT_INPUT), SELECTOR_SEARCH, (event: any) => {
      const side = this._sideOf(event.target as HTMLElement)

      if (side) {
        side.listBox.update()
        this._refresh()
      }
    })

    this._element.addEventListener(EVENT_LIST_BOX_CHANGE, this._onListBoxChange)
    this._element.addEventListener(EVENT_LIST_BOX_SEARCH, this._onListBoxSearch)
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): any {
    return this.each(function (this: HTMLElement) {
      const data: any = Transfer.getOrCreateInstance(this, typeof config === 'object' ? config : null)

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
    Transfer.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Transfer)

export default Transfer
export type { TransferConfig }

/**
 * --------------------------------------------------------------------------
 * CoreUI transfer.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import ListBox from './list-box.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import type { ComponentConfig } from './util/config.js'
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

const EVENT_CLICK = 'click'
const EVENT_INPUT = 'input'
const EVENT_LIST_BOX_CHANGE = 'change.coreui.list-box'

const CLASS_NAME_ANNOUNCER = 'transfer-announcer'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_SEARCH = 'transfer-search'
const CLASS_NAME_SUBTITLE = 'list-box-subtitle'
const CLASS_NAME_VISUALLY_HIDDEN = 'visually-hidden'

const SELECTOR_COUNTER = '[data-coreui-transfer-counter]'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="transfer"]'
const SELECTOR_HEADER = '.list-box-header'
const SELECTOR_MOVE = '[data-coreui-transfer-move]'
const SELECTOR_OPTION = '.list-box-option'
const SELECTOR_OPTION_LABEL = '.list-box-option-label'
const SELECTOR_OPTIONS = '.list-box-options'
const SELECTOR_SEARCH = '[data-coreui-transfer-search]'
const SELECTOR_SELECT_ALL = '[data-coreui-select-all]'

const SIDE_SOURCE = 'source'
const SIDE_TARGET = 'target'
const SUFFIX_ALL = '-all'

const MOVE_KINDS = new Set([SIDE_SOURCE, SIDE_TARGET, `${SIDE_SOURCE}${SUFFIX_ALL}`, `${SIDE_TARGET}${SUFFIX_ALL}`])

const CHEVRON_LEFT_ICON: string = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true"><path fill="var(--ci-primary-color, currentcolor)" d="M324.687 451.313 129.373 256 324.687 60.687l22.626 22.626L174.628 256l172.685 172.687z" class="ci-primary"/></svg>'
const CHEVRON_RIGHT_ICON: string = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true"><path fill="var(--ci-primary-color, currentcolor)" d="m179.313 451.313-22.626-22.626L329.372 256 156.687 83.313l22.626-22.626L374.627 256z" class="ci-primary"/></svg>'
const CHEVRON_DOUBLE_LEFT_ICON: string = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true"><path fill="var(--ci-primary-color, currentcolor)" d="M416.686 447.313 221.373 252 416.686 56.687l22.628 22.626L266.627 252l172.687 172.687z" class="ci-primary"/><path fill="var(--ci-primary-color, currentcolor)" d="M256.686 447.313 61.373 252 256.686 56.687l22.628 22.626L106.627 252l172.687 172.687z" class="ci-primary"/></svg>'
const CHEVRON_DOUBLE_RIGHT_ICON: string = '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true"><path fill="var(--ci-primary-color, currentcolor)" d="m95.314 447.313-22.628-22.626L245.373 252 72.686 79.313l22.628-22.626L290.627 252z" class="ci-primary"/><path fill="var(--ci-primary-color, currentcolor)" d="m255.314 447.313-22.628-22.626L405.373 252 232.686 79.313l22.628-22.626L450.627 252z" class="ci-primary"/></svg>'

type TransferSide = {
  counter: HTMLElement | null
  element: HTMLElement
  listBox: ListBox
  options: HTMLElement
  search: HTMLInputElement | null
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
  indicator: string
  moveAllToSourceIcon: string
  moveAllToTargetIcon: string
  moveToSourceIcon: string
  moveToTargetIcon: string
  oneWay: boolean
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  search: boolean
  searchPlaceholder: string
  selectedCounterText: string
  sourceTitle: string
  targetTitle: string
  typeahead: boolean
}

const Default: TransferConfig = {
  allowList: SVGAllowlist,
  ariaMoveAllToSourceLabel: 'Move all to available',
  ariaMoveAllToTargetLabel: 'Move all to chosen',
  ariaMoveToSourceLabel: 'Move to available',
  ariaMoveToTargetLabel: 'Move to chosen',
  ariaMovedAnnouncement: '{count} moved to {title}',
  disabled: false,
  indicator: 'checkbox',
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
  typeahead: true
}

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaMoveAllToSourceLabel: 'string',
  ariaMoveAllToTargetLabel: 'string',
  ariaMoveToSourceLabel: 'string',
  ariaMoveToTargetLabel: 'string',
  ariaMovedAnnouncement: 'string',
  disabled: 'boolean',
  indicator: 'string',
  moveAllToSourceIcon: 'string',
  moveAllToTargetIcon: 'string',
  moveToSourceIcon: 'string',
  moveToTargetIcon: 'string',
  oneWay: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
  search: 'boolean',
  searchPlaceholder: 'string',
  selectedCounterText: 'string',
  sourceTitle: 'string',
  targetTitle: 'string',
  typeahead: 'boolean'
}

/**
 * Class definition
 */

class Transfer extends BaseComponent {
  protected declare _announcer: HTMLElement
  protected declare _onListBoxChange: () => void
  protected declare _sides: Record<string, TransferSide>

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._announcer = this._createAnnouncer()
    this._sides = {
      [SIDE_SOURCE]: this._createSide(SIDE_SOURCE),
      [SIDE_TARGET]: this._createSide(SIDE_TARGET)
    }
    this._onListBoxChange = () => this._refresh()

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

  update(): void {
    for (const side of Object.values(this._sides)) {
      this._decorateSide(side)
      this._filter(side)
      side.listBox.update()
    }

    this._decorateMoveButtons()
    this._refresh()
  }

  override dispose(): void {
    this._element.removeEventListener(EVENT_LIST_BOX_CHANGE, this._onListBoxChange)
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
    const options = (SelectorEngine.findOne(SELECTOR_OPTIONS, element) ?? element) as HTMLElement

    return {
      counter: this._resolveCounter(element),
      element,
      listBox: ListBox.getOrCreateInstance(element, {
        disabled: this._config.disabled,
        indicator: this._config.indicator,
        selectionMode: 'multiple',
        typeahead: this._config.typeahead
      }) as ListBox,
      options,
      search: this._resolveSearch(element, options, title),
      selectAll: SelectorEngine.findOne(SELECTOR_SELECT_ALL, element),
      title
    }
  }

  _resolveCounter(element: HTMLElement): HTMLElement | null {
    const existing = SelectorEngine.findOne(SELECTOR_COUNTER, element)

    if (existing) {
      return existing
    }

    const header = SelectorEngine.findOne(SELECTOR_HEADER, element)

    if (!header) {
      return null
    }

    const counter = document.createElement('div')

    counter.classList.add(CLASS_NAME_SUBTITLE)
    counter.setAttribute('data-coreui-transfer-counter', '')
    header.append(counter)

    return counter
  }

  _resolveSearch(element: HTMLElement, options: HTMLElement, title: string): HTMLInputElement | null {
    const existing = SelectorEngine.findOne(SELECTOR_SEARCH, element) as HTMLInputElement | null

    if (existing || !this._config.search) {
      return existing
    }

    const search = document.createElement('input')

    search.type = 'search'
    search.className = `form-control ${CLASS_NAME_SEARCH}`
    search.setAttribute('data-coreui-transfer-search', '')
    search.placeholder = this._config.searchPlaceholder
    search.setAttribute('aria-label', `${this._config.searchPlaceholder} ${title}`)
    options.before(search)

    return search
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

    if (side.search) {
      side.search.disabled = this._config.disabled

      if (!side.search.hasAttribute('aria-label')) {
        side.search.setAttribute('aria-label', `${this._config.searchPlaceholder} ${side.title}`)
      }
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

  _optionText(option: HTMLElement): string {
    const label = SelectorEngine.findOne(SELECTOR_OPTION_LABEL, option)
    return (label ?? option).textContent?.trim().toLowerCase() ?? ''
  }

  _filter(side: TransferSide): void {
    if (!side.search) {
      return
    }

    const query = side.search.value.trim().toLowerCase()

    for (const option of this._options(side)) {
      option.toggleAttribute('hidden', query !== '' && !this._optionText(option).includes(query))
    }
  }

  _refresh(): void {
    for (const side of Object.values(this._sides)) {
      this._refreshCounter(side)
    }

    this._refreshMoveButtons()
  }

  _refreshCounter(side: TransferSide): void {
    if (!side.counter) {
      return
    }

    const visible = this._visibleOptions(side)
    const selected = side.listBox.getSelected()
    const count = visible.filter(option => selected.includes(this._optionValue(option))).length

    side.counter.textContent = `${count}/${visible.length} ${this._config.selectedCounterText}`
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

    to.options.append(...options)

    this._filter(from)
    this._filter(to)
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
      const side = Object.values(this._sides).find(({ search }) => search === event.target)

      if (side) {
        this._filter(side)
        side.listBox.update()
        this._refresh()
      }
    })

    this._element.addEventListener(EVENT_LIST_BOX_CHANGE, this._onListBoxChange)
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

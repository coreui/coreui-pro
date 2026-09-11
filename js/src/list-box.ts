/**
 * --------------------------------------------------------------------------
 * CoreUI list-box.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { initializeOnReady } from './util/component-functions.js'
import type { ComponentConfig } from './util/config.js'
import { DefaultAllowlist, sanitizeHtml, type SanitizerAllowList } from './util/sanitizer.js'
import {
  defineJQueryPlugin, getElement, getNextActiveElement, getUID, jQueryDispatch
} from './util/index.js'

/**
 * Constants
 */

const NAME = 'list-box'
const DATA_KEY = 'coreui.list-box'
const EVENT_KEY = `.${DATA_KEY}`

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
const EVENT_SEARCH = 'search'
const EVENT_SELECT = 'select'
const EVENT_SELECTED = 'selected'
const EVENT_SELECTION_LIMIT = 'selectionLimit'

const EVENT_CLICK = 'click'
const EVENT_FOCUSIN = 'focusin'
const EVENT_FOCUSOUT = 'focusout'
const EVENT_INPUT = 'input'
const EVENT_KEYDOWN = 'keydown'

const CLASS_NAME_ACTIVE = 'active'
const CLASS_NAME_CHECK = 'check'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_FORM_CONTROL = 'form-control'
const CLASS_NAME_HEADER = 'list-box-header'
const CLASS_NAME_INDETERMINATE = 'indeterminate'
const CLASS_NAME_LOADING = 'loading'
const CLASS_NAME_OPTION = 'list-box-option'
const CLASS_NAME_OPTION_DESCRIPTION = 'list-box-option-description'
const CLASS_NAME_OPTION_INDICATOR = 'list-box-option-indicator'
const CLASS_NAME_OPTION_LABEL = 'list-box-option-label'
const CLASS_NAME_OPTIONS = 'list-box-options'
const CLASS_NAME_SEARCH = 'list-box-search'
const CLASS_NAME_SECTION = 'list-box-section'
const CLASS_NAME_SECTION_LABEL = 'list-box-section-label'
const CLASS_NAME_SUBTITLE = 'list-box-subtitle'
const CLASS_NAME_SELECTED = 'selected'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="list-box"]'
const SELECTOR_COUNTER = '[data-coreui-list-box-counter]'
const SELECTOR_EMPTY = '.list-box-empty'
const SELECTOR_HEADER = '.list-box-header'
const SELECTOR_OPTION = '.list-box-option'
const SELECTOR_OPTION_INDICATOR = '.list-box-option-indicator'
const SELECTOR_OPTION_LABEL = '.list-box-option-label'
const SELECTOR_OPTIONS = '.list-box-options'
const SELECTOR_SEARCH = '[data-coreui-list-box-search]'
const SELECTOR_SECTION = '.list-box-section'
const SELECTOR_SECTION_LABEL = '.list-box-section-label'
const SELECTOR_SECTION_TOGGLE = '[data-coreui-section-toggle]'
const SELECTOR_SELECT_ALL = '[data-coreui-select-all]'

const ATTRIBUTE_INDICATOR = 'data-coreui-indicator'
const ATTRIBUTE_SECTION_TOGGLE = 'data-coreui-section-toggle'

const INDICATOR_CHECKBOX = 'checkbox'

const SEARCH_EXTERNAL = 'external'

const SELECTION_MODE_MULTIPLE = 'multiple'
const SELECTION_MODE_NONE = 'none'
const SELECTION_MODE_SINGLE = 'single'

type ListBoxItem = {
  value: string
  label?: string
  description?: string
  disabled?: boolean
  selected?: boolean
}

type ListBoxGroup = {
  label: string
  items: ListBoxItem[]
}

type ListBoxEntry = ListBoxItem | ListBoxGroup

type ListBoxConfig = {
  activeDescendant: string | Element | null
  allowList: SanitizerAllowList
  ariaSearchLabel: string
  counter: boolean
  disabled: boolean
  html: boolean
  indicator: string
  items: ListBoxEntry[]
  loading: boolean
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  search: boolean | string
  searchNormalize: boolean
  searchPlaceholder: string
  sectionsSelectable: boolean
  selected: string | string[] | null
  selectedCounterText: string
  selectionLimit: number | null
  selectionMode: string
  typeahead: boolean
}

const Default: ListBoxConfig = {
  activeDescendant: null,
  allowList: DefaultAllowlist,
  ariaSearchLabel: 'Search options',
  counter: false,
  disabled: false,
  html: false,
  indicator: 'none',
  items: [],
  loading: false,
  sanitize: true,
  sanitizeFn: null,
  search: false,
  searchNormalize: false,
  searchPlaceholder: 'Search',
  sectionsSelectable: false,
  selected: null,
  selectedCounterText: 'selected',
  selectionLimit: null,
  selectionMode: SELECTION_MODE_SINGLE,
  typeahead: true
}

const DefaultType: Record<string, string> = {
  activeDescendant: '(string|element|null)',
  allowList: 'object',
  ariaSearchLabel: 'string',
  counter: 'boolean',
  disabled: 'boolean',
  html: 'boolean',
  indicator: 'string',
  items: 'array',
  loading: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  search: '(boolean|string)',
  searchNormalize: 'boolean',
  searchPlaceholder: 'string',
  sectionsSelectable: 'boolean',
  selected: '(string|array|null)',
  selectedCounterText: 'string',
  selectionLimit: '(null|number)',
  selectionMode: 'string',
  typeahead: 'boolean'
}

/**
 * Class definition
 */

class ListBox extends BaseComponent {
  protected declare _active: string | null
  protected declare _anchor: string | null
  protected declare _counter: HTMLElement | null
  protected declare _field: HTMLElement | null
  protected declare _items: ListBoxEntry[] | null
  protected declare _focused: boolean
  protected declare _limited: string | null
  protected declare _list: HTMLElement
  protected declare _query: string | null
  protected declare _search: string
  protected declare _searchField: HTMLInputElement | null
  protected declare _searchTimeout: ReturnType<typeof setTimeout> | null
  protected declare _selected: Set<string>
  protected declare _selectAll: HTMLButtonElement | null

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._active = null
    this._anchor = null
    this._field = getElement(this._config.activeDescendant)
    this._items = this._config.items.length > 0 ? this._normalizeItems(this._config.items) : null
    this._focused = false
    this._limited = null
    this._list = this._resolveList()
    this._counter = this._resolveCounter()
    this._query = null
    this._search = ''
    this._searchField = this._resolveSearch()
    this._searchTimeout = null
    this._selectAll = SelectorEngine.findOne(SELECTOR_SELECT_ALL, this._element) as HTMLButtonElement | null
    this._selected = new Set(this._initialSelection())

    this._render()
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
    this._limited = null

    if (this._selectValue(value)) {
      this._anchor = value
      this._triggerChange()
    }

    this._reportLimit()
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

    const scope = values ?? this._navigableOptions().map(option => this._optionValue(option))
    let changed = false

    this._limited = null

    for (const value of scope) {
      changed = this._selectValue(value) || changed
    }

    if (changed) {
      this._triggerChange()
    }

    this._reportLimit()
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

  setItems(items: ListBoxEntry[]): void {
    const previous = this.getSelected()

    this._items = this._normalizeItems(items)
    this._render()

    const values = new Set(this._flatItems().map(item => item.value))
    const kept = previous.filter(value => values.has(value))
    const marked = this._flatItems().filter(item => item.selected).map(item => item.value)
    const next = [...new Set([...kept, ...marked])]

    this._anchor = null
    this._selected = new Set(this._selectionFor(next))
    this.update()

    if (previous.length !== this._selected.size || previous.some(value => !this._selected.has(value))) {
      this._triggerChange()
    }
  }

  getItems(): ListBoxEntry[] {
    return this._items ?? []
  }

  setLoading(loading: boolean): void {
    this._config.loading = loading
    this.update()
  }

  filter(query: string | null): void {
    this._query = query === null ? null : this._normalizeText(query.trim().toLowerCase())

    if (this._query === null) {
      for (const element of [...this._allOptions(), ...SelectorEngine.find(SELECTOR_SECTION, this._list)]) {
        element.removeAttribute('hidden')
      }
    }

    this.update()
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
    this._list.setAttribute('role', 'listbox')

    this._decorateSearch()
    this._filter()
    this._updateListAttributes()

    for (const section of SelectorEngine.find(SELECTOR_SECTION, this._list)) {
      if (!section.hasAttribute('role')) {
        section.setAttribute('role', 'group')
      }

      this._decorateSection(section)
    }

    if (this._active !== null && !this._navigable().some(element => this._optionValue(element) === this._active)) {
      this._active = null
    }

    this._updateOptions()
    this._updateSections()
    this._updateSelectAll()
    this._updateCounter()
    this._updateActiveDescendant()
  }

  override dispose(): void {
    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout)
    }

    this._element.removeAttribute(ATTRIBUTE_INDICATOR)
    this._element.classList.remove(CLASS_NAME_LOADING)

    EventHandler.off(this._list, EVENT_KEY)

    if (this._field) {
      EventHandler.off(this._field, EVENT_KEY)
      this._field.removeAttribute('aria-activedescendant')
      this._field.removeAttribute('aria-controls')
    }

    super.dispose()
  }

  // Private
  _updateListAttributes(): void {
    if (this._config.indicator === INDICATOR_CHECKBOX) {
      this._element.setAttribute(ATTRIBUTE_INDICATOR, INDICATOR_CHECKBOX)
    }

    if (this._config.selectionMode === SELECTION_MODE_MULTIPLE) {
      this._list.setAttribute('aria-multiselectable', 'true')
    } else {
      this._list.removeAttribute('aria-multiselectable')
    }

    if (this._config.disabled) {
      this._list.setAttribute('aria-disabled', 'true')
    } else {
      this._list.removeAttribute('aria-disabled')
    }

    this._element.classList.toggle(CLASS_NAME_LOADING, this._config.loading)

    if (this._config.loading) {
      this._list.setAttribute('aria-busy', 'true')
    } else {
      this._list.removeAttribute('aria-busy')
    }
  }

  _updateOptions(): void {
    const navigable = this._navigableOptions()
    const roving = this._active === null && !this._field ? navigable[0] : null

    for (const option of this._allOptions()) {
      option.setAttribute('role', 'option')

      if (this._field && !option.id) {
        option.id = getUID(`${NAME}-option-`)
      }

      const value = this._optionValue(option)

      this._decorateOption(option)

      if (this._config.selectionMode === SELECTION_MODE_NONE) {
        option.removeAttribute('aria-selected')
      } else {
        option.setAttribute('aria-selected', String(this._selected.has(value)))
      }

      option.classList.toggle(CLASS_NAME_SELECTED, this._selected.has(value))
      option.classList.toggle(CLASS_NAME_ACTIVE, value === this._active && (this._focused || Boolean(this._field)))

      if (this._field) {
        option.removeAttribute('tabindex')
        continue
      }

      option.setAttribute('tabindex', value === this._active || option === roving ? '0' : '-1')
    }

    const empty = SelectorEngine.findOne(SELECTOR_EMPTY, this._list)
    if (empty) {
      empty.toggleAttribute('hidden', this._config.loading || navigable.length > 0)
    }
  }

  _resolveCounter(): HTMLElement | null {
    const existing = SelectorEngine.findOne(SELECTOR_COUNTER, this._element) as HTMLElement | null

    if (existing || !this._config.counter) {
      return existing
    }

    const counter = document.createElement('div')

    counter.classList.add(CLASS_NAME_SUBTITLE)
    counter.setAttribute('data-coreui-list-box-counter', '')
    this._resolveHeader().append(counter)

    return counter
  }

  _resolveHeader(): HTMLElement {
    const existing = SelectorEngine.findOne(SELECTOR_HEADER, this._element) as HTMLElement | null

    if (existing) {
      return existing
    }

    const header = document.createElement('div')

    header.classList.add(CLASS_NAME_HEADER)
    this._element.prepend(header)

    return header
  }

  _updateCounter(): void {
    if (!this._counter) {
      return
    }

    const navigable = this._navigableOptions()
    const count = navigable.filter(option => this._selected.has(this._optionValue(option))).length

    this._counter.textContent = `${count}/${navigable.length} ${this._config.selectedCounterText}`
  }

  _resolveSearch(): HTMLInputElement | null {
    const existing = SelectorEngine.findOne(SELECTOR_SEARCH, this._element) as HTMLInputElement | null

    if (existing || !this._config.search) {
      return existing
    }

    const search = document.createElement('input')

    search.type = 'search'
    search.className = `${CLASS_NAME_FORM_CONTROL} ${CLASS_NAME_SEARCH}`
    search.setAttribute('data-coreui-list-box-search', '')
    this._list.before(search)

    return search
  }

  _decorateSearch(): void {
    if (!this._searchField) {
      return
    }

    if (!this._list.id) {
      this._list.id = getUID(`${NAME}-options-`)
    }

    if (!this._searchField.placeholder) {
      this._searchField.placeholder = this._config.searchPlaceholder
    }

    if (!this._searchField.hasAttribute('aria-label')) {
      this._searchField.setAttribute('aria-label', this._config.ariaSearchLabel)
    }

    this._searchField.setAttribute('aria-controls', this._list.id)
    this._searchField.disabled = this._config.disabled
  }

  _filter(): void {
    if (this._query === null && (!this._searchField || this._config.search === SEARCH_EXTERNAL)) {
      return
    }

    const query = this._query ?? this._normalizeText(this._searchField!.value.trim().toLowerCase())

    for (const option of this._allOptions()) {
      option.toggleAttribute('hidden', query !== '' && !this._normalizeText(this._optionText(option)).includes(query))
    }

    for (const section of SelectorEngine.find(SELECTOR_SECTION, this._list)) {
      section.toggleAttribute('hidden', SelectorEngine.find(SELECTOR_OPTION, section).every(option => option.hasAttribute('hidden')))
    }
  }

  _normalizeText(text: string): string {
    return this._config.searchNormalize ? text.normalize('NFD').replaceAll(/[\u0300-\u036F]/g, '') : text
  }

  _initialSelection(): string[] {
    const { selected } = this._config
    const configured = selected === null ? [] : (Array.isArray(selected) ? selected : [selected])
    const marked = this._flatItems().filter(item => item.selected).map(item => item.value)

    return this._selectionFor([...new Set([...configured, ...marked])])
  }

  _selectionFor(values: string[]): string[] {
    const { selectionMode } = this._config

    if (selectionMode === SELECTION_MODE_NONE) {
      return []
    }

    return selectionMode === SELECTION_MODE_SINGLE ? values.slice(0, 1) : values
  }

  _normalizeItems(items: ListBoxEntry[]): ListBoxEntry[] {
    return (Array.isArray(items) ? items : [])
      .filter(entry => entry !== null && typeof entry === 'object')
      .map(entry => (Array.isArray((entry as ListBoxGroup).items) ? this._normalizeGroup(entry as ListBoxGroup) : this._normalizeItem(entry as ListBoxItem)))
  }

  _normalizeGroup(group: ListBoxGroup): ListBoxGroup {
    return {
      label: String(group.label ?? ''),
      items: group.items.filter(item => item !== null && typeof item === 'object').map(item => this._normalizeItem(item))
    }
  }

  _normalizeItem(item: ListBoxItem): ListBoxItem {
    const value = String(item.value ?? item.label ?? '')
    const normalized: ListBoxItem = { value, label: String(item.label ?? value) }

    if (item.description !== undefined) {
      normalized.description = String(item.description)
    }

    if (item.disabled) {
      normalized.disabled = true
    }

    if (item.selected) {
      normalized.selected = true
    }

    return normalized
  }

  _flatItems(): ListBoxItem[] {
    return (this._items ?? []).flatMap(entry => (Array.isArray((entry as ListBoxGroup).items) ? (entry as ListBoxGroup).items : [entry as ListBoxItem]))
  }

  _resolveList(): HTMLElement {
    const list = SelectorEngine.findOne(SELECTOR_OPTIONS, this._element) as HTMLElement | null

    if (list) {
      return list
    }

    if (this._items === null) {
      return this._element
    }

    const created = document.createElement('div')
    created.classList.add(CLASS_NAME_OPTIONS)
    this._element.append(created)

    return created
  }

  _render(): void {
    if (this._items === null) {
      return
    }

    const empty = SelectorEngine.findOne(SELECTOR_EMPTY, this._list)

    this._list.replaceChildren(...this._items.map(entry => (Array.isArray((entry as ListBoxGroup).items) ? this._renderSection(entry as ListBoxGroup) : this._renderOption(entry as ListBoxItem))))

    if (empty) {
      this._list.append(empty)
    }
  }

  _renderSection(group: ListBoxGroup): HTMLElement {
    const section = document.createElement('div')
    const label = document.createElement('div')

    label.classList.add(CLASS_NAME_SECTION_LABEL)
    label.id = getUID(`${NAME}-section-`)
    this._setContent(label, group.label)

    section.classList.add(CLASS_NAME_SECTION)
    section.setAttribute('role', 'group')
    section.setAttribute('aria-labelledby', label.id)
    section.append(label, ...group.items.map(item => this._renderOption(item)))

    return section
  }

  _renderOption(item: ListBoxItem): HTMLElement {
    const option = document.createElement('div')

    option.classList.add(CLASS_NAME_OPTION)
    option.dataset.coreuiValue = item.value

    if (item.disabled) {
      option.classList.add(CLASS_NAME_DISABLED)
      option.setAttribute('aria-disabled', 'true')
    }

    if (item.description === undefined) {
      this._setContent(option, item.label ?? item.value)
      return option
    }

    const label = document.createElement('span')
    const description = document.createElement('span')

    label.classList.add(CLASS_NAME_OPTION_LABEL)
    this._setContent(label, item.label ?? item.value)

    description.classList.add(CLASS_NAME_OPTION_DESCRIPTION)
    this._setContent(description, item.description)

    option.append(label, description)

    return option
  }

  _setContent(target: HTMLElement, content: string): void {
    if (this._config.html) {
      target.innerHTML = this._config.sanitize ? sanitizeHtml(content, this._config.allowList, this._config.sanitizeFn) : content
      return
    }

    target.textContent = content
  }

  _allOptions(): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_OPTION, this._list)
  }

  _navigableOptions(): HTMLElement[] {
    return this._allOptions().filter(option => !this._isHidden(option) && !this._isDisabled(option))
  }

  _navigable(): HTMLElement[] {
    if (!this._sectionsSelectable()) {
      return this._navigableOptions()
    }

    return SelectorEngine.find(`${SELECTOR_OPTION}, ${SELECTOR_SECTION_TOGGLE}`, this._list)
      .filter(element => !this._isHidden(element) && !this._isDisabled(element))
  }

  _sectionsSelectable(): boolean {
    return this._config.sectionsSelectable && this._config.selectionMode === SELECTION_MODE_MULTIPLE
  }

  _isSectionToggle(element: HTMLElement): boolean {
    return element.hasAttribute(ATTRIBUTE_SECTION_TOGGLE)
  }

  _sectionOptions(section: HTMLElement): HTMLElement[] {
    return SelectorEngine.find(SELECTOR_OPTION, section).filter(option => !this._isHidden(option) && !this._isDisabled(option))
  }

  _decorateSection(section: HTMLElement): void {
    const label = SelectorEngine.findOne(SELECTOR_SECTION_LABEL, section) as HTMLElement | null

    if (!label || !this._sectionsSelectable()) {
      return
    }

    if (!label.id) {
      label.id = getUID(`${NAME}-section-`)
    }

    label.setAttribute(ATTRIBUTE_SECTION_TOGGLE, '')
    label.setAttribute('role', 'button')
    label.dataset.coreuiValue = label.id
    this._decorateOption(label)
  }

  _updateSections(): void {
    if (!this._sectionsSelectable()) {
      return
    }

    for (const label of SelectorEngine.find(SELECTOR_SECTION_TOGGLE, this._list)) {
      const options = this._sectionOptions(label.closest(SELECTOR_SECTION) as HTMLElement)
      const selected = options.filter(option => this._selected.has(this._optionValue(option))).length
      const all = options.length > 0 && selected >= options.length
      const some = selected > 0

      label.setAttribute('aria-pressed', all ? 'true' : (some ? 'mixed' : 'false'))
      label.classList.toggle(CLASS_NAME_SELECTED, all)
      label.classList.toggle(CLASS_NAME_INDETERMINATE, !all && some)
      label.classList.toggle(CLASS_NAME_ACTIVE, this._optionValue(label) === this._active && (this._focused || Boolean(this._field)))

      if (this._field) {
        label.removeAttribute('tabindex')
        continue
      }

      label.setAttribute('tabindex', this._optionValue(label) === this._active ? '0' : '-1')
    }
  }

  _toggleSection(section: HTMLElement | null): void {
    if (!section || !this._sectionsSelectable()) {
      return
    }

    const values = this._sectionOptions(section).map(option => this._optionValue(option))
    const all = values.length > 0 && values.every(value => this._selected.has(value))
    let changed = false

    this._limited = null

    for (const value of values) {
      changed = (all ? this._deselectValue(value) : this._selectValue(value)) || changed
    }

    if (changed) {
      this._triggerChange()
    }

    this._reportLimit()
  }

  _isHidden(option: HTMLElement): boolean {
    return option.hasAttribute('hidden') || option.closest('[hidden]') !== null
  }

  _isDisabled(option: HTMLElement): boolean {
    return option.classList.contains(CLASS_NAME_DISABLED) || option.getAttribute('aria-disabled') === 'true'
  }

  _isLink(option: HTMLElement): boolean {
    return option.tagName === 'A' && option.hasAttribute('href')
  }

  _fieldTakesText(): boolean {
    return this._field instanceof HTMLInputElement || this._field instanceof HTMLTextAreaElement
  }

  _optionValue(option: HTMLElement): string {
    return option.dataset.coreuiValue ?? option.textContent?.trim() ?? ''
  }

  _optionText(option: HTMLElement): string {
    const label = SelectorEngine.findOne(SELECTOR_OPTION_LABEL, option)
    return (label ?? option).textContent?.trim().toLowerCase() ?? ''
  }

  _findOption(value: string): HTMLElement | undefined {
    return this._allOptions().find(option => this._optionValue(option) === value)
  }

  _findNavigable(value: string): HTMLElement | undefined {
    return this._navigable().find(element => this._optionValue(element) === value)
  }

  _activeOption(): HTMLElement | null {
    return this._active === null ? null : (this._findNavigable(this._active) ?? null)
  }

  _decorateOption(option: HTMLElement): void {
    if (this._config.indicator !== INDICATOR_CHECKBOX) {
      return
    }

    if (SelectorEngine.findOne(SELECTOR_OPTION_INDICATOR, option)) {
      return
    }

    const indicator = document.createElement('span')
    indicator.classList.add(CLASS_NAME_CHECK, CLASS_NAME_OPTION_INDICATOR)
    indicator.setAttribute('aria-hidden', 'true')
    option.prepend(indicator)
  }

  _atLimit(): boolean {
    const { selectionLimit, selectionMode } = this._config
    return selectionMode === SELECTION_MODE_MULTIPLE && selectionLimit !== null && this._selected.size >= selectionLimit
  }

  _reportLimit(): void {
    if (this._limited === null) {
      return
    }

    const value = this._limited
    this._limited = null

    EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECTION_LIMIT), {
      limit: this._config.selectionLimit,
      value
    })
  }

  _selectionCap(): number {
    const { selectionLimit, selectionMode } = this._config
    const options = this._navigableOptions().length

    return selectionMode === SELECTION_MODE_MULTIPLE && selectionLimit !== null ? Math.min(selectionLimit, options) : options
  }

  _selectedNavigable(): number {
    return this._navigableOptions().filter(option => this._selected.has(this._optionValue(option))).length
  }

  _allSelected(): boolean {
    const cap = this._selectionCap()
    return cap > 0 && this._selectedNavigable() >= cap
  }

  _updateSelectAll(): void {
    if (!this._selectAll) {
      return
    }

    if (!this._list.id) {
      this._list.id = getUID(`${NAME}-options-`)
    }

    this._selectAll.setAttribute('aria-controls', this._list.id)
    this._selectAll.disabled = this._config.disabled || this._config.selectionMode !== SELECTION_MODE_MULTIPLE

    const all = this._allSelected()
    const some = this._selectedNavigable() > 0

    this._decorateOption(this._selectAll)
    this._selectAll.setAttribute('aria-pressed', all ? 'true' : (some ? 'mixed' : 'false'))
    this._selectAll.classList.toggle(CLASS_NAME_SELECTED, all)
    this._selectAll.classList.toggle(CLASS_NAME_INDETERMINATE, !all && some)
  }

  _toggleSelectAll(): void {
    if (this._allSelected()) {
      this.clear()
      return
    }

    this.selectAll()
  }

  _selectValue(value: string): boolean {
    if (this._config.disabled || this._config.selectionMode === SELECTION_MODE_NONE) {
      return false
    }

    const option = this._findOption(value)

    if (!option || this._isDisabled(option) || this._selected.has(value)) {
      return false
    }

    if (this._atLimit()) {
      this._limited ??= value
      return false
    }

    if (EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SELECT), { value }).defaultPrevented) {
      return false
    }

    if (this._config.selectionMode === SELECTION_MODE_SINGLE) {
      const previous = this.getSelected()

      for (const selected of previous) {
        this._removeSelection(selected)
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
    const options = this._navigableOptions()
    const start = options.findIndex(option => this._optionValue(option) === from)
    const end = options.findIndex(option => this._optionValue(option) === to)

    if (end === -1) {
      return
    }

    const first = Math.min(start === -1 ? end : start, end)
    const last = Math.max(start === -1 ? end : start, end)
    let changed = false

    this._limited = null

    for (const option of options.slice(first, last + 1)) {
      changed = this._selectValue(this._optionValue(option)) || changed
    }

    if (changed) {
      this._triggerChange()
    }

    this._reportLimit()
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

    const option = this._activeOption()

    if (option) {
      option.scrollIntoView({ block: 'nearest' })

      if (focus && !this._field) {
        option.focus()
      }

      EventHandler.trigger(this._element, this.constructor.eventName(EVENT_ACTIVATE), { value })
    }
  }

  _updateActiveDescendant(): void {
    if (!this._field) {
      return
    }

    if (!this._list.id) {
      this._list.id = getUID(`${NAME}-options-`)
    }

    this._field.setAttribute('aria-controls', this._list.id)

    const option = this._activeOption()

    if (option) {
      this._field.setAttribute('aria-activedescendant', option.id)
      return
    }

    this._field.removeAttribute('aria-activedescendant')
  }

  _move(forward: boolean): void {
    const options = this._navigable()

    if (options.length === 0) {
      return
    }

    const current = this._activeOption()
    const next = current ? getNextActiveElement(options, current, forward, false) : options[forward ? 0 : options.length - 1]

    this._setActive(this._optionValue(next), true)
  }

  _moveToEdge(index: number): void {
    const option = this._navigable().at(index)

    if (option) {
      this._setActive(this._optionValue(option), true)
    }
  }

  _activate(option: HTMLElement): void {
    const value = this._optionValue(option)

    if (this._isSectionToggle(option)) {
      this._toggleSection(option.closest(SELECTOR_SECTION) as HTMLElement)
      return
    }

    if (this._config.selectionMode === SELECTION_MODE_NONE || this._isLink(option)) {
      EventHandler.trigger(this._element, this.constructor.eventName(EVENT_ACTION), { value, relatedTarget: option })
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

    const options = this._navigableOptions()
    const start = options.findIndex(option => this._optionValue(option) === this._active) + 1
    const from = this._search.length > 1 ? start - 1 : start
    const ordered = [...options.slice(from), ...options.slice(0, from)]
    const match = ordered.find(option => this._optionText(option).startsWith(this._search))

    if (match) {
      this._setActive(this._optionValue(match), true)
    }
  }

  _addEventListeners(): void {
    EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK), SELECTOR_OPTION, (event: any) => this._handleClick(event))
    EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK), SELECTOR_SELECT_ALL, () => {
      if (!this._config.disabled) {
        this._toggleSelectAll()
      }
    })
    EventHandler.on(this._list, this.constructor.eventName(EVENT_FOCUSIN), () => {
      this._focused = true
      this.update()
    })
    EventHandler.on(this._list, this.constructor.eventName(EVENT_FOCUSOUT), (event: any) => {
      if (!this._list.contains(event.relatedTarget as Node)) {
        this._focused = false
        this.update()
      }
    })
    EventHandler.on(this._element, this.constructor.eventName(EVENT_INPUT), SELECTOR_SEARCH, (event: any) => {
      if (this._config.search === SEARCH_EXTERNAL) {
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SEARCH), {
          query: (event.target as HTMLInputElement).value
        })
        return
      }

      this.update()
    })
    EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK), SELECTOR_SECTION_TOGGLE, (event: any) => {
      const label = (event.target as HTMLElement).closest(SELECTOR_SECTION_TOGGLE) as HTMLElement | null

      if (!label || this._config.disabled) {
        return
      }

      this._setActive(this._optionValue(label), !this._field)
      this._toggleSection(label.closest(SELECTOR_SECTION) as HTMLElement)
    })
    EventHandler.on(this._element, this.constructor.eventName(EVENT_FOCUSIN), `${SELECTOR_OPTION}, ${SELECTOR_SECTION_TOGGLE}`, (event: any) => {
      if (!this._config.disabled && !this._field) {
        this._setActive(this._optionValue(event.target.closest(`${SELECTOR_OPTION}, ${SELECTOR_SECTION_TOGGLE}`)), false)
      }
    })

    const target = this._field ?? this._list
    EventHandler.on(target, this.constructor.eventName(EVENT_KEYDOWN), (event: any) => this._handleKeydown(event))
  }

  _handleClick(event: any): void {
    const option = (event.target as HTMLElement).closest(SELECTOR_OPTION) as HTMLElement | null

    if (!option || this._config.disabled) {
      return
    }

    if (this._isDisabled(option)) {
      event.preventDefault()
      return
    }

    const value = this._optionValue(option)

    if (event.shiftKey && this._config.selectionMode === SELECTION_MODE_MULTIPLE) {
      event.preventDefault()
      this._setActive(value, !this._field)
      this._selectRange(this._anchor, value)
      return
    }

    this._setActive(value, !this._field)

    if ((event.ctrlKey || event.metaKey) && this._config.selectionMode === SELECTION_MODE_MULTIPLE) {
      this._anchor = value
      this.toggle(value)
      return
    }

    this._anchor = value
    this._activate(option)
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
      if (this._fieldTakesText()) {
        return
      }

      event.preventDefault()
      this._handleEdgeKey(key === HOME_KEY ? 0 : -1, event.shiftKey)
      return
    }

    if (key === SPACE_KEY || key === ENTER_KEY) {
      if (key === SPACE_KEY && this._fieldTakesText()) {
        return
      }

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
    const option = this._activeOption()

    if (!option) {
      return
    }

    const follows = isEnter && this._isLink(option)

    if (!follows) {
      event.preventDefault()
    }

    if (!isEnter && this._config.selectionMode === SELECTION_MODE_NONE) {
      return
    }

    this._anchor = this._active
    this._activate(option)

    if (follows && this._field) {
      option.click()
    }
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): any {
    return jQueryDispatch(this, ListBox, config, args)
  }
}

/**
 * Data API implementation
 */

initializeOnReady(ListBox, SELECTOR_DATA_TOGGLE, 'DOMContentLoaded')

/**
 * jQuery
 */

defineJQueryPlugin(ListBox)

export default ListBox
export type {
  ListBoxConfig,
  ListBoxEntry,
  ListBoxGroup,
  ListBoxItem
}

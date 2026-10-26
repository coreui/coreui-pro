/**
 * --------------------------------------------------------------------------
 * CoreUI combobox.ts
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import ComboboxBase from './combobox-base.js'
import Data from './dom/data.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import ListBox, { type ListBoxEntry } from './list-box.js'
import FieldValidation from './util/field-validation.js'
import {
  alignValueField, configureValueField, createValueField, dispatchValueChange, type ValidationState, writeValueField
} from './util/form-validation.js'
import { CARET_ICON } from './util/icons.js'
import {
  DefaultAllowlist, sanitizeByConfig, type SanitizerAllowList, SVGAllowlist
} from './util/sanitizer.js'
import {
  type CountLabel, createSelectionStore, getSelectionLimit, resolveCountLabel, toSelectionValues
} from './util/selection-state.js'
import { defineJQueryPlugin, getUID, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'combobox'
const DATA_KEY = 'coreui.combobox'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const ARROW_UP_KEY = 'ArrowUp'
const ARROW_DOWN_KEY = 'ArrowDown'
const ENTER_KEY = 'Enter'
const ESCAPE_KEY = 'Escape'
const SPACE_KEY = ' '
const TAB_KEY = 'Tab'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_SEARCH = `search${EVENT_KEY}`
const EVENT_SELECTION_LIMIT = `selectionLimit${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const EVENT_LIST_BOX = '.coreui.list-box'
const EVENT_LIST_BOX_SEARCH = `search${EVENT_LIST_BOX}`

const CLASS_NAME_CARET = 'combobox-caret'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_LIST_BOX = 'list-box'
const CLASS_NAME_OPTIONS = 'list-box-options'
const CLASS_NAME_INPUT_GROUP_IGNORE = 'input-group-ignore'
const CLASS_NAME_PLACEHOLDER = 'combobox-placeholder'
const CLASS_NAME_POPUP = 'popup'
const CLASS_NAME_POPUP_COMBOBOX = 'combobox-popup'
const CLASS_NAME_SEARCH = 'list-box-search'
const CLASS_NAME_SELECT = 'combobox-select'
const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_TOGGLE = 'combobox-toggle'
const CLASS_NAME_VALUE = 'combobox-value'

const SELECTOR_CARET = '.combobox-caret'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="combobox"]'
const SELECTOR_DATA_TOGGLE_SHOWN = `.${CLASS_NAME_TOGGLE}.${CLASS_NAME_SHOW}`
const SELECTOR_LIST_BOX = '.list-box'
const SELECTOR_OPTION = '.list-box-option'
const SELECTOR_OPTION_LABEL = '.list-box-option-label'
const SELECTOR_OPTIONS = '.list-box-options'
const SELECTOR_POPUP = '.popup'
const SELECTOR_SEARCH = '[data-coreui-list-box-search]'
const SELECTOR_VALUE = '.combobox-value'

type ComboboxConfig = {
  allowList: SanitizerAllowList
  ariaSearchLabel: string
  caretIcon: string
  container: string | Element | boolean
  disabled: boolean
  html: boolean
  indicator: string
  items: ListBoxEntry[]
  multiple: boolean
  name: string | null
  placeholder: string
  required: boolean
  resetSelectionOnItemsChange: boolean
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  search: boolean | string
  searchNormalize: boolean
  searchPlaceholder: string
  selectedLabel: CountLabel
  selectionLimit: number | null
  typeahead: boolean
  validationState: ValidationState | null
  value: string | string[] | null
}

const Default: ComboboxConfig = {
  allowList: DefaultAllowlist,
  ariaSearchLabel: 'Search options',
  caretIcon: CARET_ICON,
  container: false,
  disabled: false,
  html: false,
  indicator: 'none',
  items: [],
  multiple: false,
  name: null,
  placeholder: '',
  required: false,
  resetSelectionOnItemsChange: false,
  sanitize: true,
  sanitizeFn: null,
  search: false,
  searchNormalize: false,
  searchPlaceholder: 'Search',
  selectedLabel: (count: number) => `${count} selected`,
  selectionLimit: null,
  typeahead: true,
  validationState: null,
  value: null
}

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaSearchLabel: 'string',
  caretIcon: 'string',
  container: '(string|element|boolean)',
  disabled: 'boolean',
  html: 'boolean',
  indicator: 'string',
  items: 'array',
  multiple: 'boolean',
  name: '(string|null)',
  placeholder: 'string',
  required: 'boolean',
  resetSelectionOnItemsChange: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  search: '(boolean|string)',
  searchNormalize: 'boolean',
  searchPlaceholder: 'string',
  selectedLabel: '(string|function)',
  selectionLimit: '(null|number)',
  typeahead: 'boolean',
  validationState: '(string|null|undefined)',
  value: '(string|array|null)'
}

/**
 * Class definition
 */

class Combobox extends ComboboxBase {
  protected declare _createdNodes: ChildNode[]
  protected declare _hostValue: Node[] | null
  protected declare _labels: Map<string, string>
  protected declare _resetValues: string[]
  protected declare _searchElement: HTMLInputElement | null
  protected declare _validation: FieldValidation
  protected declare _valueElement: HTMLElement
  protected declare _valueField: HTMLSelectElement
  protected declare _valueFromMarkup: boolean

  constructor(element?: string | Element | null, config?: Partial<ComboboxConfig> | null) {
    super(element, config)

    this._uniqueId = this._element.id || getUID(NAME)
    this._togglerElement = this._element
    this._createdNodes = []
    this._hostValue = null
    this._labels = new Map()
    this._resetValues = []
    this._searchElement = null
    this._validation = new FieldValidation(this._element, {
      config: () => this._config,
      describedTargets: () => [this._element],
      fields: () => [this._valueField],
      frames: () => [this._element],
      invalidTargets: () => [],
      owned: () => [this._valueField, this._searchElement].filter(Boolean) as Element[],
      restore: () => this._restoreValue()
    })
    this._listBox = null
    this._listBoxElement = null
    this._menu = null
    this._optionsElement = null
    this._floatingCleanup = null
    this._anchoredPosition = null
    this._search = ''

    this._createCombobox()
    this._addEventListeners()

    Data.set(this._element, DATA_KEY, this)
  }

  // Getters
  static override get Default(): ComboboxConfig {
    return Default
  }

  static override get DefaultType(): typeof DefaultType {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  getValue(): string | string[] | null {
    const selected = this._listBox ? this._listBox.getSelectedValues() : []

    return this._config.multiple ? selected : (selected[0] ?? null)
  }

  setValue(value: string | string[] | null): void {
    const given = typeof value === 'number' ? String(value) : value

    this._typeCheckConfig({ value: given }, { value: DefaultType.value })
    this._applySelection(toSelectionValues(given, 'multiple').map(String), false)
  }

  clear(): void {
    this._applySelection([])
  }

  setItems(items: ListBoxEntry[]): void {
    const listed = new Map(SelectorEngine.find(SELECTOR_OPTION, this._optionsElement).map(option => [this._valueOf(option as HTMLElement), this._labelOf(option as HTMLElement)]))

    this._labels = new Map((this._listBox?.getSelectedValues() ?? []).map(value => [value, listed.get(value) ?? this._labels.get(value) ?? value]))
    this._listBox?.setItems(items)
    this._updateValue()
  }

  update(): void {
    this._listBox?.update()
    this._updateValue()
  }

  setValidationState(validationState: ValidationState | null): void {
    this._setConfig({ validationState })
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    this._validation.dispose()
    this._disposeFloating()
    this._disposeListBox()
    this._valueField.remove()

    if (this._menu) {
      EventHandler.off(this._menu, EVENT_KEY)
    }

    this._element.after(this._menu)
    this._menu.classList.remove(CLASS_NAME_SHOW)

    if (this._listBoxElement) {
      EventHandler.off(this._listBoxElement, EVENT_LIST_BOX)
    }

    if (this._searchElement) {
      EventHandler.off(this._searchElement, EVENT_KEY)
    }

    for (const node of this._createdNodes) {
      node.remove()
    }

    if (this._hostValue) {
      this._valueElement.replaceChildren(...this._hostValue)
    }

    this._element.classList.remove(CLASS_NAME_SHOW)
    this._element.setAttribute('aria-expanded', 'false')

    super.dispose()
  }

  // Private
  _setConfig(config: Partial<ComboboxConfig> | null): void {
    if (!config || !('validationState' in config)) {
      return
    }

    this._config = this._getConfig({ ...this._config, validationState: config.validationState })
    this._validation.configure({ validationState: config.validationState })
  }

  override _getConfig(config?: any): any {
    this._valueFromMarkup = !(config !== null && typeof config === 'object' && 'value' in config)

    return super._getConfig(config)
  }

  override _configAfterMerge(config: any): any {
    config = this._normalizeContainerConfig(config)

    if (typeof config.value === 'number') {
      config.value = String(config.value)
    }

    if (config.multiple && this._valueFromMarkup && typeof config.value === 'string') {
      config.value = config.value.split(/,\s*/)
    }

    return config
  }

  _createCombobox(): void {
    this._element.classList.add(CLASS_NAME_TOGGLE)
    this._element.classList.toggle(CLASS_NAME_DISABLED, this._config.disabled)
    this._element.setAttribute('aria-haspopup', 'listbox')
    this._element.setAttribute('aria-expanded', 'false')

    if (this._element instanceof HTMLButtonElement) {
      this._element.type = 'button'
      this._element.disabled = this._config.disabled
    }

    this._createValueElement()
    this._createCaret()
    this._createValueField()
    this._resolveMenu()
    this._createSearchInput()
    this._validation.refresh()

    this._store = createSelectionStore(next => toSelectionValues(next, this._config.multiple ? 'multiple' : 'single'))
    this._store.commit(toSelectionValues(this._config.value, 'multiple').map(String))
    this._listBox = new ListBox(this._listBoxElement, this._getListBoxConfig(), this._store)
    this._addListBoxListeners()
    this._addPanelEscapeListener(this._menu)

    this._updateValue()
    this._resetValues = this._listBox.getSelectedValues()
  }

  _createValueElement(): void {
    const existing = SelectorEngine.findOne(SELECTOR_VALUE, this._element) as HTMLElement | null

    if (existing) {
      this._hostValue = [...existing.childNodes]
      this._valueElement = existing
      return
    }

    const value = document.createElement('span')
    value.classList.add(CLASS_NAME_VALUE)
    this._element.prepend(value)

    this._createdNodes.push(value)
    this._valueElement = value
  }

  _createCaret(): void {
    const existing = SelectorEngine.findOne(SELECTOR_CARET, this._element) as HTMLElement | null

    if (existing || !this._config.caretIcon) {
      return
    }

    const template = document.createElement('template')
    template.innerHTML = sanitizeByConfig(this._config.caretIcon, { ...this._config, allowList: SVGAllowlist })
    const caret = template.content.lastElementChild as HTMLElement | null

    if (!caret) {
      return
    }

    caret.classList.add(CLASS_NAME_CARET)
    caret.setAttribute('aria-hidden', 'true')
    this._createdNodes.push(...template.content.childNodes)
    this._element.append(template.content)
  }

  _createValueField(): void {
    const field = createValueField('select', () => this._element)

    field.classList.add(CLASS_NAME_SELECT, CLASS_NAME_INPUT_GROUP_IGNORE)
    field.multiple = this._config.multiple
    configureValueField(field, {
      disabled: this._config.disabled,
      name: this._config.name,
      required: this._config.required
    })
    field.addEventListener('invalid', () => alignValueField(field, this._element))
    this._element.after(field)

    this._valueField = field
  }

  // The panel is written next to the toggle, or built here when the options
  // come from `items`. Either way it leaves the document until the first
  // open — a `.popup` is laid out absolutely, so it would otherwise sit in
  // the flow of whatever follows the toggle.
  _resolveMenu(): void {
    const pagePopup = SelectorEngine.next(this._element, SELECTOR_POPUP)[0] as HTMLElement | undefined
    const popup = pagePopup ?? document.createElement('div')

    if (!pagePopup) {
      this._createdNodes.push(popup)
    }

    popup.classList.add(CLASS_NAME_POPUP, CLASS_NAME_POPUP_COMBOBOX)

    let listBox = SelectorEngine.findOne(SELECTOR_LIST_BOX, popup) as HTMLElement | null

    if (!listBox) {
      listBox = document.createElement('div')
      listBox.classList.add(CLASS_NAME_LIST_BOX)
      popup.append(listBox)
      this._createdNodes.push(listBox)
    }

    let options = SelectorEngine.findOne(SELECTOR_OPTIONS, listBox) as HTMLElement | null

    if (!options) {
      options = document.createElement('div')
      options.classList.add(CLASS_NAME_OPTIONS)
      listBox.append(options)
      this._createdNodes.push(options)
    }

    if (!options.id) {
      options.id = `${this._uniqueId}-listbox`
    }

    popup.remove()

    this._menu = popup
    this._listBoxElement = listBox
    this._optionsElement = options
  }

  // The list builds its own search field, but only after it has resolved the
  // field that keeps the focus — so the one the focus stays in has to exist
  // first.
  _createSearchInput(): void {
    if (!this._config.search) {
      return
    }

    const existing = SelectorEngine.findOne(SELECTOR_SEARCH, this._listBoxElement) as HTMLInputElement | null

    if (existing) {
      this._searchElement = existing
      return
    }

    const search = document.createElement('input')
    search.type = 'search'
    search.className = `form-control ${CLASS_NAME_SEARCH}`
    search.setAttribute('data-coreui-list-box-search', '')
    this._optionsElement.before(search)

    this._createdNodes.push(search)
    this._searchElement = search
  }

  override _getListBoxConfig(): any {
    return {
      activeDescendant: this._searchElement ?? this._element,
      allowList: this._config.allowList,
      ariaSearchLabel: this._config.ariaSearchLabel,
      disabled: this._config.disabled,
      html: this._config.html,
      indicator: this._config.indicator,
      items: this._config.items,
      resetSelectionOnItemsChange: this._config.resetSelectionOnItemsChange,
      sanitize: this._config.sanitize,
      sanitizeFn: this._config.sanitizeFn,
      search: this._config.search,
      searchNormalize: this._config.searchNormalize,
      searchPlaceholder: this._config.searchPlaceholder,
      selected: null,
      selectionLimit: this._config.selectionLimit,
      selectionMode: this._config.multiple ? 'multiple' : 'single',
      typeahead: this._config.typeahead
    }
  }

  _valueOf(option: HTMLElement): string {
    return option.dataset.coreuiValue ?? option.textContent?.trim() ?? ''
  }

  _applySelection(values: string[], notify = true): void {
    if (!this._listBox) {
      return
    }

    const listed = new Set(SelectorEngine.find(SELECTOR_OPTION, this._optionsElement).map(option => this._valueOf(option as HTMLElement)))
    const next = [...new Set(values)].filter(value => listed.has(value) || this._store.has(value))

    this._commitSelection(next.slice(0, getSelectionLimit(this._config.multiple, this._config.selectionLimit) ?? next.length))

    if (notify) {
      this._commitValue()
    } else {
      this._updateValue()
    }
  }

  _commitValue(): void {
    if (!this._updateValue()) {
      return
    }

    EventHandler.trigger(this._element, EVENT_CHANGE, { value: this.getValue() })
    dispatchValueChange(this._valueField)
  }

  _updateValue(): boolean {
    const values = this._listBox ? this._listBox.getSelectedValues() : []
    const isChanged = writeValueField(this._valueField, values)

    this._validation.update()
    this._updateValueText(values)

    return isChanged
  }

  _updateValueText(values: string[]): void {
    if (values.length === 0) {
      this._valueElement.textContent = this._config.placeholder
      this._valueElement.classList.add(CLASS_NAME_PLACEHOLDER)
      return
    }

    this._valueElement.classList.remove(CLASS_NAME_PLACEHOLDER)
    this._valueElement.textContent = this._config.multiple && values.length > 1 ?
      resolveCountLabel(
        this._config.selectedLabel,
        values.length,
        new Set([...SelectorEngine.find(SELECTOR_OPTION, this._optionsElement).map(option => this._valueOf(option as HTMLElement)), ...values]).size
      ) :
      this._optionLabel(values[0])
  }

  _optionLabel(value: string): string {
    const option = SelectorEngine.find(SELECTOR_OPTION, this._optionsElement)
      .find(element => this._valueOf(element as HTMLElement) === value) as HTMLElement | undefined

    return option ? this._labelOf(option) : this._labels.get(value) ?? value
  }

  _labelOf(option: HTMLElement): string {
    const label = SelectorEngine.findOne(SELECTOR_OPTION_LABEL, option)

    return (label ?? option).textContent?.trim() ?? this._valueOf(option)
  }

  override _afterShow(): void {
    this._searchElement?.focus()
  }

  override _afterHideDispose(): void {
    if (this._searchElement) {
      this._searchElement.value = ''
      this._listBox?.update()
    }
  }

  override _onOptionSelected(): void {
    this._validation.dismiss()
  }

  override _onOptionDeselected(): void {
    this._validation.dismiss()
  }

  override _onSelectionChange(): void {
    this._commitValue()

    // One value, one decision: the panel has nothing left to offer, so it
    // closes and hands the focus back to the control the user came from.
    if (!this._config.multiple && this._isShown()) {
      this.hide()
      this._element.focus()
    }
  }

  override _onSelectionLimit(limit: number, value: string): void {
    EventHandler.trigger(this._element, EVENT_SELECTION_LIMIT, { limit, value })
  }

  _restoreValue(): void {
    if (this._listBox && this._listBox.getSelectedValues().join('\0') !== this._resetValues.join('\0')) {
      this._applySelection(this._resetValues)
    }
  }

  _addEventListeners(): void {
    EventHandler.on(this._element, EVENT_KEYDOWN, (event: any) => this._handleToggleKeydown(event))

    EventHandler.on(this._listBoxElement, EVENT_LIST_BOX_SEARCH, (event: any) => {
      EventHandler.trigger(this._element, EVENT_SEARCH, { query: event.query })
    })

    if (this._searchElement) {
      EventHandler.on(this._searchElement, EVENT_KEYDOWN, (event: any) => {
        if (event.key === TAB_KEY) {
          this.hide()
        }
      })
    }
  }

  _handleToggleKeydown(event: any): void {
    const { key } = event

    if (key === TAB_KEY) {
      if (this._isShown()) {
        this.hide()
      }

      return
    }

    if (this._isShown()) {
      if (key === ESCAPE_KEY) {
        event.preventDefault()
        event.stopPropagation()
        this.hide()
      }

      return
    }

    if (key === ARROW_DOWN_KEY || key === ARROW_UP_KEY) {
      event.preventDefault()
      this.show()
      return
    }

    // The list runs its own typeahead off the same field, so a press it has
    // already spent on a value must not also open the panel.
    if ((key === ENTER_KEY || key === SPACE_KEY) && !event.defaultPrevented) {
      event.preventDefault()
      this.show()
    }
  }

  // Static
  static clearMenus(event: any): void {
    for (const toggle of SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN)) {
      Combobox.getInstance(toggle)?._hideOnOutside(event)
    }
  }

  static jQueryInterface(this: any, config: any, ...args: any[]): any {
    return jQueryDispatch(this, Combobox, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const toggle of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) {
    Combobox.getOrCreateInstance(toggle)
  }
})

EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (this: HTMLElement, event: any) {
  event.preventDefault()
  Combobox.getOrCreateInstance(this).toggle()
})

EventHandler.on(document, EVENT_CLICK_DATA_API, Combobox.clearMenus)
EventHandler.on(document, EVENT_KEYUP_DATA_API, Combobox.clearMenus)

/**
 * jQuery
 */

defineJQueryPlugin(Combobox)

export default Combobox
export type { ComboboxConfig }

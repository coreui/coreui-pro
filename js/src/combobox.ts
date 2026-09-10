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
import type { ComponentConfig } from './util/config.js'
import { CARET_ICON } from './util/icons.js'
import { DefaultAllowlist, type SanitizerAllowList } from './util/sanitizer.js'
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
const RIGHT_MOUSE_BUTTON = 2

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_SEARCH = `search${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const EVENT_LIST_BOX = '.coreui.list-box'
const EVENT_LIST_BOX_SEARCH = `search${EVENT_LIST_BOX}`

const CLASS_NAME_CARET = 'combobox-caret'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_LIST_BOX = 'list-box'
const CLASS_NAME_OPTIONS = 'list-box-options'
const CLASS_NAME_PLACEHOLDER = 'combobox-placeholder'
const CLASS_NAME_POPUP = 'popup'
const CLASS_NAME_POPUP_COMBOBOX = 'combobox-popup'
const CLASS_NAME_SEARCH = 'list-box-search'
const CLASS_NAME_SELECTED = 'selected'
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

const COUNT_PLACEHOLDER = '{count}'

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
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  search: boolean | string
  searchNormalize: boolean
  searchPlaceholder: string
  selectedText: string
  selectionLimit: number | null
  typeahead: boolean
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
  sanitize: true,
  sanitizeFn: null,
  search: false,
  searchNormalize: false,
  searchPlaceholder: 'Search',
  selectedText: '{count} selected',
  selectionLimit: null,
  typeahead: true,
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
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  search: '(boolean|string)',
  searchNormalize: 'boolean',
  searchPlaceholder: 'string',
  selectedText: 'string',
  selectionLimit: '(null|number)',
  typeahead: 'boolean',
  value: '(string|array|null)'
}

/**
 * Class definition
 */

class Combobox extends ComboboxBase {
  protected declare _caretElement: HTMLElement | null
  protected declare _hiddenInput: HTMLInputElement | null
  protected declare _searchElement: HTMLInputElement | null
  protected declare _valueElement: HTMLElement

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._uniqueId = this._element.id || getUID(NAME)
    this._togglerElement = this._element
    this._caretElement = null
    this._hiddenInput = null
    this._searchElement = null
    this._listBox = null
    this._listBoxElement = null
    this._menu = null
    this._optionsElement = null
    this._floatingCleanup = null
    this._anchoredPosition = null
    this._search = ''
    this._syncing = false

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
    const selected = this._listBox ? this._listBox.getSelected() : []

    return this._config.multiple ? selected : (selected[0] ?? null)
  }

  setValue(value: string | string[] | null): void {
    this._applySelection(value === null ? [] : (Array.isArray(value) ? value.map(String) : [String(value)]))
  }

  clear(): void {
    this._applySelection([])
  }

  setItems(items: ListBoxEntry[]): void {
    this._listBox?.setItems(items)
    this._updateValue()
  }

  update(): void {
    this._listBox?.update()
    this._updateValue()
  }

  override dispose(): void {
    this._disposeFloating()
    this._disposeListBox()

    this._hiddenInput?.remove()

    if (this._caretElement) {
      this._caretElement.classList.remove(CLASS_NAME_CARET)
      this._caretElement.removeAttribute('aria-hidden')
    }

    // The panel is markup the page owns, so it goes back where it came from
    // rather than being destroyed with the instance.
    if (this._menu) {
      this._menu.classList.remove(CLASS_NAME_SHOW)
      this._element.after(this._menu)
      EventHandler.off(this._menu, EVENT_KEY)
    }

    if (this._listBoxElement) {
      EventHandler.off(this._listBoxElement, EVENT_LIST_BOX)
    }

    this._element.classList.remove(CLASS_NAME_SHOW)
    this._element.removeAttribute('aria-expanded')
    this._element.removeAttribute('aria-haspopup')

    super.dispose()
  }

  // Private
  override _configAfterMerge(config: any): any {
    config = this._normalizeContainerConfig(config)

    if (typeof config.value === 'string' && config.value.includes(',')) {
      config.value = config.value.split(/,\s*/)
    }

    return config
  }

  _createCombobox(): void {
    this._element.classList.add(CLASS_NAME_TOGGLE)
    this._element.setAttribute('aria-haspopup', 'listbox')
    this._element.setAttribute('aria-expanded', 'false')

    if (this._element instanceof HTMLButtonElement) {
      this._element.type = 'button'
      this._config.disabled = this._config.disabled || this._element.disabled
      this._element.disabled = this._config.disabled
    }

    this._config.disabled = this._config.disabled || this._element.classList.contains(CLASS_NAME_DISABLED)
    this._element.classList.toggle(CLASS_NAME_DISABLED, this._config.disabled)

    this._createValueElement()
    this._createCaret()
    this._createHiddenInput()
    this._resolveMenu()
    this._createSearchInput()

    this._listBox = new ListBox(this._listBoxElement, this._getListBoxConfig())
    this._addListBoxListeners()
    this._addPanelEscapeListener(this._menu)

    this._updateValue()
  }

  _createValueElement(): void {
    const existing = SelectorEngine.findOne(SELECTOR_VALUE, this._element) as HTMLElement | null

    if (existing) {
      this._valueElement = existing
      return
    }

    const value = document.createElement('span')
    value.classList.add(CLASS_NAME_VALUE)
    this._element.prepend(value)

    this._valueElement = value
  }

  _createCaret(): void {
    const existing = SelectorEngine.findOne(SELECTOR_CARET, this._element) as HTMLElement | null

    if (existing || !this._config.caretIcon) {
      this._caretElement = existing
      return
    }

    this._element.insertAdjacentHTML('beforeend', this._config.caretIcon)

    const caret = this._element.lastElementChild as HTMLElement
    caret.classList.add(CLASS_NAME_CARET)
    caret.setAttribute('aria-hidden', 'true')

    this._caretElement = caret
  }

  _createHiddenInput(): void {
    if (!this._config.name) {
      return
    }

    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = this._config.name
    this._element.before(input)

    this._hiddenInput = input
  }

  // The panel is written next to the toggle, or built here when the options
  // come from `items`. Either way it leaves the document until the first
  // open — a `.popup` is laid out absolutely, so it would otherwise sit in
  // the flow of whatever follows the toggle.
  _resolveMenu(): void {
    const popup = (SelectorEngine.next(this._element, SELECTOR_POPUP)[0] ?? document.createElement('div')) as HTMLElement
    popup.classList.add(CLASS_NAME_POPUP, CLASS_NAME_POPUP_COMBOBOX)

    let listBox = SelectorEngine.findOne(SELECTOR_LIST_BOX, popup) as HTMLElement | null

    if (!listBox) {
      listBox = document.createElement('div')
      listBox.classList.add(CLASS_NAME_LIST_BOX)
      popup.append(listBox)
    }

    let options = SelectorEngine.findOne(SELECTOR_OPTIONS, listBox) as HTMLElement | null

    if (!options) {
      options = document.createElement('div')
      options.classList.add(CLASS_NAME_OPTIONS)
      listBox.append(options)
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
      sanitize: this._config.sanitize,
      sanitizeFn: this._config.sanitizeFn,
      search: this._config.search,
      searchNormalize: this._config.searchNormalize,
      searchPlaceholder: this._config.searchPlaceholder,
      selected: this._initialValues(),
      selectionLimit: this._config.selectionLimit,
      selectionMode: this._config.multiple ? 'multiple' : 'single',
      typeahead: this._config.typeahead
    }
  }

  _initialValues(): string[] {
    const { value } = this._config
    const configured = value === null ? [] : (Array.isArray(value) ? value : [value]).map(String)
    const marked = SelectorEngine.find(`${SELECTOR_OPTION}.${CLASS_NAME_SELECTED}`, this._optionsElement)
      .map(option => this._valueOf(option as HTMLElement))

    return [...new Set([...configured, ...marked])]
  }

  _valueOf(option: HTMLElement): string {
    return option.dataset.coreuiValue ?? option.textContent?.trim() ?? ''
  }

  _applySelection(values: string[]): void {
    if (!this._listBox) {
      return
    }

    this._syncing = true
    this._listBox.clear()

    for (const value of (this._config.multiple ? values : values.slice(0, 1))) {
      this._listBox.select(value)
    }

    this._syncing = false

    this._updateValue()
    EventHandler.trigger(this._element, EVENT_CHANGE, { value: this.getValue() })
  }

  _updateValue(): void {
    const values = this._listBox ? this._listBox.getSelected() : []

    if (this._hiddenInput) {
      this._hiddenInput.value = values.join(',')
    }

    if (values.length === 0) {
      this._valueElement.textContent = this._config.placeholder
      this._valueElement.classList.add(CLASS_NAME_PLACEHOLDER)
      return
    }

    this._valueElement.classList.remove(CLASS_NAME_PLACEHOLDER)
    this._valueElement.textContent = this._config.multiple && values.length > 1 ?
      this._config.selectedText.replace(COUNT_PLACEHOLDER, String(values.length)) :
      this._optionLabel(values[0])
  }

  _optionLabel(value: string): string {
    const option = SelectorEngine.find(SELECTOR_OPTION, this._optionsElement)
      .find(element => this._valueOf(element as HTMLElement) === value) as HTMLElement | undefined

    if (!option) {
      return value
    }

    const label = SelectorEngine.findOne(SELECTOR_OPTION_LABEL, option)

    return (label ?? option).textContent?.trim() ?? value
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

  override _onSelectionChange(): void {
    this._updateValue()
    EventHandler.trigger(this._element, EVENT_CHANGE, { value: this.getValue() })

    // One value, one decision: the panel has nothing left to offer, so it
    // closes and hands the focus back to the control the user came from.
    if (!this._config.multiple && this._isShown()) {
      this.hide()
      this._element.focus()
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
    if (event.button === RIGHT_MOUSE_BUTTON || (event.type === 'keyup' && event.key !== TAB_KEY)) {
      return
    }

    for (const toggle of SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN)) {
      const context = Combobox.getInstance(toggle) as Combobox | null

      if (!context) {
        continue
      }

      const composedPath = event.composedPath()

      if (composedPath.includes(context._element) || composedPath.includes(context._menu)) {
        continue
      }

      context.hide()
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

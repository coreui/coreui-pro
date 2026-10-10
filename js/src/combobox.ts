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
import {
  alignValueField, configureValueField, createValueField, dispatchValueChange, followUserValidity, getFeedbackIds,
  getValidationState, nextStateSerial, ownValidationState, setStateValidity, type UserValidity, type ValidationState,
  writeValueField
} from './util/form-validation.js'
import { CARET_ICON } from './util/icons.js'
import {
  DefaultAllowlist, sanitizeByConfig, type SanitizerAllowList, SVGAllowlist
} from './util/sanitizer.js'
import {
  captureHostClasses, type CountLabel, defineJQueryPlugin, getUID, type HostClasses, jQueryDispatch, resolveCountLabel,
  restoreHostClasses
} from './util/index.js'

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
const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const CLASS_NAME_LIST_BOX = 'list-box'
const CLASS_NAME_OPTIONS = 'list-box-options'
const CLASS_NAME_INPUT_GROUP_IGNORE = 'input-group-ignore'
const CLASS_NAME_PLACEHOLDER = 'combobox-placeholder'
const CLASS_NAME_POPUP = 'popup'
const CLASS_NAME_POPUP_COMBOBOX = 'combobox-popup'
const CLASS_NAME_SEARCH = 'list-box-search'
const CLASS_NAME_SELECT = 'combobox-select'
const CLASS_NAME_SELECTED = 'selected'
const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_TOGGLE = 'combobox-toggle'
const CLASS_NAME_VALUE = 'combobox-value'

const HOST_ATTRIBUTES = ['aria-activedescendant', 'aria-controls', 'aria-describedby', 'aria-expanded', 'aria-haspopup', 'type']
const HOST_CLASS_NAMES = [CLASS_NAME_SHOW, CLASS_NAME_TOGGLE]
const MENU_STYLE_PROPERTIES = ['left', 'min-width', 'position', 'top']

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
  protected declare _addedDisabled: boolean
  protected declare _addedDisabledClass: boolean
  protected declare _addedMenuClassNames: string[]
  protected declare _createdNodes: ChildNode[]
  protected declare _describedBy: string | null
  protected declare _hostAttributes: Map<string, string | null>
  protected declare _hostClasses: HostClasses
  protected declare _hostMenuStyle: Map<string, string> | null
  protected declare _hostOptionsId: string
  protected declare _hostValue: { nodes: Node[], placeholder: boolean } | null
  protected declare _listGesture: boolean
  protected declare _releaseValidationState: (() => void) | null
  protected declare _resetValues: string[]
  protected declare _searchElement: HTMLInputElement | null
  protected declare _serverClasses: string[]
  protected declare _stateClass: string | null
  protected declare _stateSerial: number
  protected declare _userValidity: UserValidity
  protected declare _valueElement: HTMLElement
  protected declare _valueField: HTMLSelectElement
  protected declare _valueFromMarkup: boolean

  constructor(element?: string | Element | null, config?: Partial<ComboboxConfig> | null) {
    super(element, config)

    this._uniqueId = this._element.id || getUID(NAME)
    this._togglerElement = this._element
    this._addedDisabled = false
    this._addedDisabledClass = false
    this._addedMenuClassNames = []
    this._createdNodes = []
    this._hostAttributes = new Map(HOST_ATTRIBUTES.map(name => [name, this._element.getAttribute(name)]))
    this._hostClasses = captureHostClasses(this._element, HOST_CLASS_NAMES)
    this._hostMenuStyle = null
    this._hostOptionsId = ''
    this._hostValue = null
    this._listGesture = false
    this._releaseValidationState = null
    this._resetValues = []
    this._searchElement = null
    this._serverClasses = [CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID].filter(name => this._element.classList.contains(name))
    this._element.classList.remove(...this._serverClasses)
    this._stateClass = null
    this._stateSerial = nextStateSerial()
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
    const selected = this._listBox ? this._listBox.getSelectedValues() : []

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

  setConfig(config: Partial<ComboboxConfig> | null): void {
    if (!config || !('validationState' in config)) {
      return
    }

    this._serverClasses = []
    this._stateSerial = nextStateSerial()
    this._config = this._getConfig({ ...this._config, validationState: config.validationState })
    this._updateValidity()
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    this._disposeFloating()
    this._disposeListBox()

    this._userValidity.stop()
    this._releaseValidationState?.()
    this._valueField.remove()

    if (this._stateClass) {
      this._element.classList.remove(this._stateClass)
    }

    this._element.classList.add(...this._serverClasses)

    if (this._menu) {
      EventHandler.off(this._menu, EVENT_KEY)
    }

    if (this._hostMenuStyle) {
      this._element.after(this._menu)
      this._menu.classList.remove(CLASS_NAME_SHOW, ...this._addedMenuClassNames)

      for (const [property, value] of this._hostMenuStyle) {
        this._menu.style.setProperty(property, value)
      }

      if (this._menu.getAttribute('style') === '') {
        this._menu.removeAttribute('style')
      }
    }

    if (this._optionsElement && !this._hostOptionsId) {
      this._optionsElement.removeAttribute('id')
    }

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
      this._valueElement.replaceChildren(...this._hostValue.nodes)
      this._valueElement.classList.toggle(CLASS_NAME_PLACEHOLDER, this._hostValue.placeholder)
    }

    if (this._addedDisabled) {
      this._element.removeAttribute('disabled')
    }

    if (this._addedDisabledClass) {
      this._element.classList.remove(CLASS_NAME_DISABLED)
    }

    for (const [name, value] of this._hostAttributes) {
      this._restoreAttribute(name, value)
    }

    restoreHostClasses(this._element, HOST_CLASS_NAMES, this._hostClasses)

    super.dispose()
  }

  // Private
  override _getConfig(config?: any): any {
    this._valueFromMarkup = !(config !== null && typeof config === 'object' && 'value' in config)

    return super._getConfig(config)
  }

  override _configAfterMerge(config: any): any {
    config = this._normalizeContainerConfig(config)

    if (config.multiple && this._valueFromMarkup && typeof config.value === 'string') {
      config.value = config.value.split(/,\s*/)
    }

    return config
  }

  _createCombobox(): void {
    const hadDisabled = this._element.hasAttribute('disabled')
    const hadDisabledClass = this._element.classList.contains(CLASS_NAME_DISABLED)

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
    this._addedDisabledClass = !hadDisabledClass && this._config.disabled
    this._addedDisabled = !hadDisabled && this._element.hasAttribute('disabled')

    this._createValueElement()
    this._createCaret()
    this._createValueField()
    this._resolveMenu()
    this._createSearchInput()
    this._releaseValidationState = ownValidationState(...[this._valueField, this._searchElement].filter(Boolean) as Element[])

    this._listBox = new ListBox(this._listBoxElement, this._getListBoxConfig())
    this._addListBoxListeners()
    this._addPanelEscapeListener(this._menu)

    this._updateValue()
    this._resetValues = this._listBox.getSelectedValues()
  }

  _createValueElement(): void {
    const existing = SelectorEngine.findOne(SELECTOR_VALUE, this._element) as HTMLElement | null

    if (existing) {
      this._hostValue = { nodes: [...existing.childNodes], placeholder: existing.classList.contains(CLASS_NAME_PLACEHOLDER) }
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
    this._describedBy = this._hostAttributes.get('aria-describedby') ?? null
    this._userValidity = followUserValidity(field, () => this._updateValidity(), serial => this._restoreValue(serial))
  }

  // The panel is written next to the toggle, or built here when the options
  // come from `items`. Either way it leaves the document until the first
  // open — a `.popup` is laid out absolutely, so it would otherwise sit in
  // the flow of whatever follows the toggle.
  _resolveMenu(): void {
    const pagePopup = SelectorEngine.next(this._element, SELECTOR_POPUP)[0] as HTMLElement | undefined
    const popup = pagePopup ?? document.createElement('div')

    if (pagePopup) {
      this._hostMenuStyle = new Map(MENU_STYLE_PROPERTIES.map(property => [property, pagePopup.style.getPropertyValue(property)]))
    } else {
      this._createdNodes.push(popup)
    }

    this._addedMenuClassNames = [CLASS_NAME_POPUP, CLASS_NAME_POPUP_COMBOBOX].filter(name => !popup.classList.contains(name))
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

    this._hostOptionsId = options.id

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

  _restoreAttribute(name: string, value: string | null): void {
    if (value === null) {
      this._element.removeAttribute(name)
      return
    }

    this._element.setAttribute(name, value)
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

    this._commitValue()
  }

  _commitValue(): void {
    const isChanged = this._updateValue()

    EventHandler.trigger(this._element, EVENT_CHANGE, { value: this.getValue() })

    if (isChanged) {
      dispatchValueChange(this._valueField)
    }
  }

  _updateValue(): boolean {
    const values = this._listBox ? this._listBox.getSelectedValues() : []
    const isChanged = writeValueField(this._valueField, values)

    this._updateValidity()
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
        SelectorEngine.find(SELECTOR_OPTION, this._optionsElement).length
      ) :
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

  override _onOptionSelected(): void {
    this._listGesture = true
  }

  override _onOptionDeselected(): void {
    this._listGesture = true
  }

  override _onSelectionChange(): void {
    if (this._listGesture) {
      this._listGesture = false
      this._dismissValidationState()
    }

    this._commitValue()

    // One value, one decision: the panel has nothing left to offer, so it
    // closes and hands the focus back to the control the user came from.
    if (!this._config.multiple && this._isShown()) {
      this.hide()
      this._element.focus()
    }
  }

  _dismissValidationState(serial: number = Number.POSITIVE_INFINITY): void {
    if (this._stateSerial > serial) {
      return
    }

    this._config.validationState = null
    this._serverClasses = []
  }

  _updateValidity(): void {
    const givenState = getValidationState(this._config.validationState) ??
      getValidationState(null, this._serverClasses.includes(CLASS_NAME_IS_VALID), this._serverClasses.includes(CLASS_NAME_IS_INVALID))

    setStateValidity(this._valueField, givenState === 'invalid')

    const state = givenState ?? this._userValidity.read()
    const stateClass = state ? `is-${state}` : null
    const describedBy = [...new Set([
      ...(this._describedBy ?? '').split(/\s+/),
      ...(state === 'invalid' ? getFeedbackIds(this._valueField) : [])
    ])].filter(Boolean).join(' ')

    if (stateClass !== this._stateClass) {
      if (this._stateClass) {
        this._element.classList.remove(this._stateClass)
      }

      if (stateClass) {
        this._element.classList.add(stateClass)
      }

      this._stateClass = stateClass
    }

    this._restoreAttribute('aria-describedby', describedBy || null)
  }

  _restoreValue(serial: number): void {
    this._dismissValidationState(serial)

    if (this._listBox && this._listBox.getSelectedValues().join('\u0000') !== this._resetValues.join('\u0000')) {
      this._applySelection(this._resetValues)
      return
    }

    this._updateValidity()
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

/**
 * --------------------------------------------------------------------------
 * CoreUI PRO autocomplete.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import ComboboxBase from './combobox-base.js'
import Data from './dom/data.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import type { ComponentConfig } from './util/config.js'
import { applyControlGroupClasses } from './util/form-control-group.js'
import {
  DefaultAllowlist, escapeHtml, sanitizeByConfig, type SanitizerAllowList, SVGAllowlist
} from './util/sanitizer.js'
import { CLEANER_ICON, PICKER_ICON } from './util/icons.js'
import { defineJQueryPlugin, getUID, jQueryDispatch } from './util/index.js'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'autocomplete'
const DATA_KEY = 'coreui.autocomplete'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const ARROW_DOWN_KEY = 'ArrowDown'
const BACKSPACE_KEY = 'Backspace'
const DELETE_KEY = 'Delete'
const ENTER_KEY = 'Enter'
const ESCAPE_KEY = 'Escape'
const TAB_KEY = 'Tab'
const RIGHT_MOUSE_BUTTON = 2 // MouseEvent.button value for the secondary button, usually the right button

const EVENT_BLUR = `blur${EVENT_KEY}`
const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_MOUSEDOWN = `mousedown${EVENT_KEY}`
const EVENT_RESET = `reset${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_AUTOCOMPLETE = 'autocomplete'
const CLASS_NAME_CLEANER = 'form-control-cleaner'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_INDICATOR = 'form-control-action'
const CLASS_NAME_INPUT = 'form-control'
const CLASS_NAME_INPUT_HINT = 'autocomplete-input-hint'
const CLASS_NAME_INPUT_GROUP = 'form-control-group'
const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const CLASS_NAME_SHOW = 'show'

const SELECTOR_DATA_AUTOCOMPLETE = '[data-coreui-autocomplete]:not(.disabled)'
const SELECTOR_DATA_TOGGLE_SHOWN = `.autocomplete:not(.disabled).${CLASS_NAME_SHOW}`
const SELECTOR_INDICATOR = '.form-control-action'

const Default = {
  allowList: DefaultAllowlist as SanitizerAllowList,
  allowOnlyDefinedOptions: false,
  ariaCleanerLabel: 'Clear selection',
  ariaPickerLabel: 'Toggle options list',
  cleaner: false,
  clearSearchOnSelect: true,
  container: false,
  disabled: false,
  highlightOptionsOnSearch: false,
  id: null,
  invalid: false,
  name: null,
  options: [] as any[],
  optionsGroupsTemplate: null,
  optionsMaxHeight: 'auto',
  optionsTemplate: null,
  pickerIcon: false,
  placeholder: null,
  required: false,
  sanitize: true,
  sanitizeFn: null,
  search: null,
  searchNoResultsLabel: false,
  showHints: false,
  valid: false,
  value: null
}

const DefaultType: Record<string, string> = {
  allowList: 'object',
  allowOnlyDefinedOptions: 'boolean',
  ariaCleanerLabel: 'string',
  ariaPickerLabel: 'string',
  cleaner: 'boolean',
  clearSearchOnSelect: 'boolean',
  container: '(string|element|boolean)',
  disabled: 'boolean',
  highlightOptionsOnSearch: 'boolean',
  id: '(string|null)',
  invalid: 'boolean',
  name: '(string|null)',
  options: '(array|null)',
  optionsGroupsTemplate: '(function|null)',
  optionsMaxHeight: '(number|string)',
  optionsTemplate: '(function|null)',
  pickerIcon: '(string|boolean)',
  placeholder: '(string|null)',
  required: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  search: '(array|string|null)',
  searchNoResultsLabel: 'boolean|string',
  showHints: 'boolean',
  valid: 'boolean',
  value: '(number|string|null)'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Autocomplete extends ComboboxBase {
  protected declare _indicatorElement: any
  protected declare _cleanerElement: any
  protected declare _inputElement: any
  protected declare _inputHintElement: any
  protected declare _addedClassNames: string[]
  protected declare _claimedText: string
  protected declare _previousTabIndex: string | null
  protected declare _form: HTMLFormElement | null
  protected declare _hostStateClassNames: string[]
  protected declare _initialValue: any
  protected declare _ownedStateClassNames: Set<string>
  protected declare _reportSeed: boolean
  protected declare _resetHandler: (event: Event) => void
  protected declare _seenOptionValues: Set<string>
  protected declare _valueApplied: boolean

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._uniqueId = this._config.id ?? getUID(`${this.constructor.NAME}`)
    this._indicatorElement = null
    this._inputElement = null
    this._inputHintElement = null
    this._togglerElement = null
    this._addedClassNames = []
    this._hostStateClassNames = [CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID].filter(className => this._element.classList.contains(className))
    this._ownedStateClassNames = new Set(this._hostStateClassNames)
    this._previousTabIndex = null
    this._optionsElement = null

    this._menu = null
    this._selected = []
    this._options = this._getOptionsFromConfig()
    this._floatingCleanup = null
    this._anchoredPosition = null
    this._search = ''
    this._seenOptionValues = new Set()
    this._valueApplied = false
    this._initialValue = this._config.value
    this._reportSeed = false
    this._form = this._element.closest('form')
    this._resetHandler = (event: Event) => {
      const text = this._inputElement.value

      setTimeout(() => {
        if (this._element && !event.defaultPrevented) {
          this._restoreInitialSelection(text)
        }
      })
    }

    this._createAutocomplete()
    this._claimedText = this._inputElement.value
    this._updateValidationState()
    this._addEventListeners()

    Data.set(this._element, DATA_KEY, this)
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

  override _canShow(): boolean {
    return Boolean(this._config.searchNoResultsLabel) ||
      this._flattenOptions().some(option => option.label.toLowerCase().includes(this._search.toLowerCase()))
  }

  override _getAriaExpandedTarget(): HTMLElement {
    return this._inputElement
  }

  override _onHideEnd(): void {
    if (this._inputHintElement) {
      this._inputHintElement.value = ''
    }
  }

  override _escapeFocusTarget(): HTMLElement | null {
    return this._inputElement
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    this._disposeFloating()
    this._disposeListBox()
    EventHandler.off(this._form, EVENT_RESET, this._resetHandler)

    for (const element of [
      this._menu,
      this._optionsElement,
      this._inputHintElement,
      this._inputElement,
      this._cleanerElement,
      this._indicatorElement
    ]) {
      if (element) {
        EventHandler.off(element, EVENT_KEY)
        element.remove()
      }
    }

    const claimed = this._markupClaimApplies()

    this._element.classList.remove(CLASS_NAME_SHOW, ...this._addedClassNames, ...this._ownedStateClassNames)

    if (claimed) {
      this._element.classList.add(...this._hostStateClassNames)
    }

    if (this._previousTabIndex === null) {
      this._element.removeAttribute('tabindex')
    } else {
      this._element.setAttribute('tabindex', this._previousTabIndex)
    }

    super.dispose()
  }

  clear(): void {
    this.deselectAll()
    this.search('')
    this._filterOptionsList()
    this._inputElement.value = ''
    this._updateValidationState()

    this._triggerChangeEvent(null)
  }

  search(label: string): void {
    this._search = label.length > 0 ? label.toLowerCase() : ''
    if (!this._isExternalSearch()) {
      this._filterOptionsList()
    }

    EventHandler.trigger(this._element, EVENT_INPUT, {
      value: label
    })
  }

  setConfig(config: any): void {
    this._config = this._getConfig({ ...this._config, ...config })
    this._options = this._getOptionsFromConfig()
    this._setListBoxItems()
    this._syncInputName()

    for (const option of this._selected) {
      this._syncOptionElementState(option.value, true)
    }

    if (config?.value !== undefined) {
      this._valueApplied = false
      this.deselectAll()
      this._inputElement.value = ''
    }

    this._seedSelection()
    this._updateValidationState()
  }

  deselectAll(options: any[] = this._selected): void {
    if (this._selected.length === 0) {
      return
    }

    for (const option of options) {
      if (option.disabled) {
        continue
      }

      if (Array.isArray(option.options)) {
        this.deselectAll(option.options)
        continue
      }

      this._deselectOption(option.value)
      this._updateCleaner()
    }
  }

  // Helpers

  _triggerChangeEvent(value: any): void {
    EventHandler.trigger(this._element, EVENT_CHANGE, {
      value
    })
  }

  _highlightOption(label: string): string {
    if (!this._search) {
      return escapeHtml(label)
    }

    const escapedSearch = this._search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedSearch})`, 'gi')
    return String(label)
      .split(regex)
      .map((part, index) => (index % 2 === 0 ? escapeHtml(part) : `<strong>${escapeHtml(part)}</strong>`))
      .join('')
  }

  _isExternalSearch(): boolean {
    return Array.isArray(this._config.search) && this._config.search.includes('external')
  }

  _isGlobalSearch(): boolean {
    return Array.isArray(this._config.search) && this._config.search.includes('global')
  }

  // Private

  _addEventListeners(): void {
    EventHandler.on(this._element, EVENT_CLICK, (event: any) => {
      if (!this._config.disabled && !event.target.closest(SELECTOR_INDICATOR)) {
        this.show()
      }
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, (event: any) => {
      if (event.key === ESCAPE_KEY) {
        // An open menu owns the press; a closed one leaves it to whatever
        // encloses the field, such as a modal dialog.
        if (this._isShown()) {
          event.preventDefault()
          event.stopPropagation()
        }

        this.hide()
        if (this._config.allowOnlyDefinedOptions && this._selected.length === 0) {
          this.search('')
          this._inputElement.value = ''
          this._updateValidationState()
        }

        return
      }

      if (this._isGlobalSearch() && (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY)) {
        this._inputElement.focus()
      }

      if (event.target === this._inputElement && (event.key === BACKSPACE_KEY || event.key === DELETE_KEY) && this._selected.length > 0) {
        this.deselectAll()
        this._triggerChangeEvent(null)
      }
    })

    EventHandler.on(this._menu, EVENT_KEYDOWN, (event: any) => {
      if (this._isGlobalSearch() && (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY)) {
        this._inputElement.focus()
      }
    })

    this._addTogglerKeydownListeners()

    EventHandler.on(this._indicatorElement, EVENT_CLICK, (event: any) => {
      event.preventDefault()
      this.toggle()
    })

    EventHandler.on(this._inputElement, EVENT_BLUR, () => {
      const inputValue = this._inputElement.value

      if (inputValue.length === 0) {
        return
      }

      const inputValueLower = inputValue.toLowerCase()
      const exactMatches = this._flattenOptions().filter(option => option.label.toLowerCase() === inputValueLower)

      if (exactMatches.length === 1) {
        this._selectOption(exactMatches[0])
        return
      }

      if (this._config.allowOnlyDefinedOptions) {
        this.clear()
        return
      }

      this._triggerChangeEvent(inputValue)
    })

    EventHandler.on(this._inputElement, EVENT_KEYDOWN, (event: any) => {
      // The list activated its highlighted option and closed the panel; the
      // same press must not reopen it or match the value it just wrote.
      const handledByList = event.key === ENTER_KEY && event.defaultPrevented

      if (!handledByList && !this._isShown() && event.key !== TAB_KEY && event.key !== ESCAPE_KEY && event.key !== ENTER_KEY) {
        this.show()
      }

      if (handledByList) {
        return
      }

      if (event.key === TAB_KEY && this._config.showHints && this._inputHintElement.value) {
        event.preventDefault()
        event.stopPropagation()

        const option = this._findHintOption(this._inputElement.value)

        if (option) {
          this._selectOption(option)
        }
      }

      if (event.key === ENTER_KEY) {
        this._handleEnterKey(event)
      }
    })

    EventHandler.on(this._inputElement, EVENT_INPUT, () => {
      const { value } = this._inputElement

      this._updateValidationState()

      if (this._selected.length > 0) {
        this.deselectAll()
        this._triggerChangeEvent(null)
      }

      this.search(value)
      if (this._config.showHints) {
        const option = value ? this._findHintOption(value) : undefined
        this._inputHintElement.value = option ? `${value}${option.label.slice(value.length)}` : ''
      }

      if (value && !this._isShown()) {
        this.show()
      }
    })

    if (this._form) {
      EventHandler.on(this._form, EVENT_RESET, this._resetHandler)
    }

    EventHandler.on(this._optionsElement, EVENT_MOUSEDOWN, (event: any) => {
      // Keep focus on the input so its blur handler doesn't clear the search
      // (and re-render the list) before the click selects the option.
      event.preventDefault()
    })

    EventHandler.on(this._cleanerElement, EVENT_CLICK, (event: any) => {
      if (!this._config.disabled) {
        event.preventDefault()
        event.stopPropagation()
        this.clear()
      }
    })

    EventHandler.on(this._cleanerElement, EVENT_KEYDOWN, (event: any) => {
      if (!this._config.disabled && event.key === ENTER_KEY) {
        event.preventDefault()
        event.stopPropagation()
        this.clear()
      }
    })
  }

  _handleEnterKey(event: KeyboardEvent): void {
    if (event.isComposing || event.keyCode === 229) {
      return
    }

    if (this._isShown()) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (this._inputElement.value.length === 0) {
      return
    }

    const options = this._flattenOptions().filter(option => !option.disabled && option.label.toLowerCase() === this._inputElement.value.toLowerCase())

    if (options.length > 0) {
      if (this._selected.some((option: any) => option.value === options[0].value)) {
        this.hide()
      } else {
        this._selectOption(options[0])
      }

      return
    }

    if (this._config.allowOnlyDefinedOptions) {
      event.preventDefault()
      return
    }

    this._triggerChangeEvent(this._inputElement.value)

    this.hide()

    if (this._config.clearSearchOnSelect) {
      this.search('')
    }
  }

  _syncInputName(): void {
    if (this._config.name) {
      this._inputElement.setAttribute('name', this._config.name.toString())
      return
    }

    this._inputElement.removeAttribute('name')
  }

  _getOptionsFromConfig(options: any = this._config.options): any[] {
    if (!options || !Array.isArray(options)) {
      return []
    }

    const _options = []
    for (const option of options) {
      if (option.options && Array.isArray(option.options)) {
        const customGroupProperties = { ...option }

        delete customGroupProperties.label
        delete customGroupProperties.options

        _options.push({
          ...customGroupProperties,
          label: option.label,
          options: this._getOptionsFromConfig(option.options)
        })

        continue
      }

      const label = typeof option === 'string' ? option : option.label
      const value = option.value ?? (typeof option === 'string' ? option : option.label)
      const isSelected = option.selected || (this._config.value && this._config.value === value)

      const customProperties = typeof option === 'object' ? { ...option } : {}

      delete customProperties.label
      delete customProperties.value
      delete customProperties.selected
      delete customProperties.disabled

      _options.push({
        ...customProperties,
        label,
        value: String(value),
        ...isSelected && { selected: true },
        ...option.disabled && { disabled: true }
      })
    }

    return _options
  }

  _addClassName(className: string): void {
    if (this._element.classList.contains(className)) {
      return
    }

    this._element.classList.add(className)
    this._addedClassNames.push(className)
  }

  _createAutocomplete(): void {
    this._addClassName(CLASS_NAME_AUTOCOMPLETE)

    if (this._config.disabled) {
      this._addClassName(CLASS_NAME_DISABLED)
    }

    this._createInputGroup()
    this._createButtons()
    this._createOptionsContainer()
    this._seedSelection()
  }

  _createInputGroup(): void {
    // The root is the frame: a field component has nothing to wrap, so it
    // carries `.form-control-group` itself instead of nesting one.
    const togglerEl = this._element
    this._previousTabIndex = togglerEl.getAttribute('tabindex')

    if (!togglerEl.classList.contains(CLASS_NAME_INPUT_GROUP)) {
      this._addedClassNames.push(CLASS_NAME_INPUT_GROUP)
    }

    applyControlGroupClasses(togglerEl, CLASS_NAME_INPUT_GROUP)
    this._togglerElement = togglerEl

    if (!this._config.search && !this._config.disabled) {
      togglerEl.tabIndex = -1
    }

    if (!this._config.disabled && this._config.showHints) {
      const inputHintEl = document.createElement('input')
      inputHintEl.classList.add(CLASS_NAME_INPUT, CLASS_NAME_INPUT_HINT)
      inputHintEl.autocomplete = 'off'
      inputHintEl.readOnly = true
      inputHintEl.tabIndex = -1
      inputHintEl.setAttribute('aria-hidden', true as any)
      inputHintEl.setAttribute('form', '')

      togglerEl.append(inputHintEl)
      this._inputHintElement = inputHintEl
    }

    const inputEl = document.createElement('input')
    inputEl.classList.add(CLASS_NAME_INPUT)
    inputEl.id = this._uniqueId
    inputEl.autocomplete = 'off'
    inputEl.placeholder = this._config.placeholder ?? ''
    inputEl.role = 'combobox'
    inputEl.setAttribute('aria-autocomplete', 'list')
    inputEl.setAttribute('aria-expanded', 'false')
    inputEl.setAttribute('aria-haspopup', 'listbox')

    if (this._config.disabled) {
      inputEl.setAttribute('disabled', true as any)
      inputEl.tabIndex = -1
    }

    if (this._config.required) {
      inputEl.setAttribute('required', true as any)
    }

    togglerEl.append(inputEl)
    this._inputElement = inputEl
    this._syncInputName()
  }

  _createButtons(): void {
    if (!this._config.cleaner && !this._config.pickerIcon) {
      return
    }

    // The group lays its adornments out itself — they are its children, not a
    // wrapper's.
    const buttons = this._togglerElement

    if (!this._config.disabled && this._config.cleaner) {
      const cleaner = document.createElement('button')
      cleaner.type = 'button'
      cleaner.classList.add(CLASS_NAME_CLEANER)
      cleaner.style.display = 'none'
      cleaner.setAttribute('aria-label', this._config.ariaCleanerLabel)
      cleaner.innerHTML = CLEANER_ICON

      buttons.append(cleaner)
      this._cleanerElement = cleaner
    }

    if (this._config.pickerIcon) {
      const indicator = document.createElement('button')
      indicator.type = 'button'
      indicator.classList.add(CLASS_NAME_INDICATOR)
      indicator.disabled = this._config.disabled
      indicator.setAttribute('aria-label', this._config.ariaPickerLabel)
      indicator.innerHTML = sanitizeByConfig(
        this._config.pickerIcon === true ? PICKER_ICON : this._config.pickerIcon,
        { ...this._config, allowList: SVGAllowlist }
      )

      buttons.append(indicator)
      this._indicatorElement = indicator
    }

    this._updateCleaner()
  }

  override _decorateListbox(optionsDiv: HTMLElement): void {
    optionsDiv.setAttribute('aria-labelledby', this._uniqueId)
  }

  override _syncPanelReferences(): void {
    super._syncPanelReferences()

    if (this._config.container && this._menu.isConnected) {
      this._inputElement.setAttribute('aria-owns', `${this._uniqueId}-listbox`)
    } else {
      this._inputElement.removeAttribute('aria-owns')
    }
  }

  override _getActiveDescendantField(): HTMLElement {
    return this._inputElement
  }

  override _onOptionSelected(value: string): void {
    const foundOption = this._findOptionByValue(value)

    if (foundOption) {
      this._selectOption(foundOption)
      this._inputElement.focus()
    }
  }

  _selectOption(option: any): void {
    this._applySelection(option)
    this._updateValidationState()
    this._triggerChangeEvent(option)

    if (this._config.showHints) {
      this._inputHintElement.value = ''
    }

    this.hide()

    if (this._config.clearSearchOnSelect) {
      this.search('')
    }
  }

  _applySelection(option: any): void {
    if (option.disabled) {
      return
    }

    this.deselectAll()
    this._selected.push(option)
    this._syncOptionElementState(option.value, true)
    this._inputElement.value = option.label
    this._updateCleaner()
  }

  _deselectOption(value: any): void {
    this._selected = this._selected.filter((option: any) => option.value !== value)

    this._syncOptionElementState(value, false)
  }

  _findHintOption(text: string): any {
    return this._flattenOptions().find(option => !option.disabled && option.label.toLowerCase().startsWith(text.toLowerCase()))
  }

  _markupClaimApplies(): boolean {
    return this._inputElement.value === this._claimedText
  }

  _updateValidationState(): void {
    const claimed = this._markupClaimApplies()
    const isInvalid = (claimed && this._hostStateClassNames.includes(CLASS_NAME_IS_INVALID)) || this._config.invalid
    const isValid = ((claimed && this._hostStateClassNames.includes(CLASS_NAME_IS_VALID)) || this._config.valid) && !isInvalid

    this._toggleStateClassName(CLASS_NAME_IS_INVALID, isInvalid)
    this._toggleStateClassName(CLASS_NAME_IS_VALID, isValid)

    if (this._element.classList.contains(CLASS_NAME_IS_INVALID)) {
      this._inputElement.setAttribute('aria-invalid', 'true')
    } else {
      this._inputElement.removeAttribute('aria-invalid')
    }
  }

  _toggleStateClassName(className: string, on: boolean): void {
    if (on) {
      if (!this._element.classList.contains(className)) {
        this._element.classList.add(className)
        this._ownedStateClassNames.add(className)
      }

      return
    }

    if (this._ownedStateClassNames.delete(className)) {
      this._element.classList.remove(className)
    }
  }

  _updateCleaner(): void {
    if (!this._config.cleaner || this._cleanerElement === null) {
      return
    }

    if (this._selected.length > 0) {
      this._cleanerElement.style.removeProperty('display')
      return
    }

    this._cleanerElement.style.display = 'none'
  }

  override _isOpenKey(event: KeyboardEvent): boolean {
    return event.key === ARROW_DOWN_KEY || (event.key === ENTER_KEY && event.target === this._togglerElement)
  }

  _restoreInitialSelection(text: string): void {
    const previous = this._selected[0]?.value

    this._reportSeed = false
    this.deselectAll()
    this._inputElement.value = ''

    if (this._inputHintElement) {
      this._inputHintElement.value = ''
    }

    if (this._search !== '') {
      this.search('')
    }

    this._config.value = this._initialValue
    this._valueApplied = false
    this._seenOptionValues.clear()
    this._seedSelection()
    this._updateValidationState()

    const current = this._selected[0]

    if (current ? current.value !== previous : previous !== undefined || text !== '') {
      this._triggerChangeEvent(current ?? null)
    }

    this._reportSeed = !current
  }

  _seedSelection(): void {
    const options = this._flattenOptions()
    const { value } = this._config
    let seed

    if (value !== null && value !== undefined && value !== '') {
      if (!this._valueApplied) {
        seed = options.find(option => option.value === String(value))
        this._valueApplied = Boolean(seed)
      }
    } else {
      seed = options.find(option => option.selected && !this._seenOptionValues.has(option.value))
    }

    for (const option of options) {
      this._seenOptionValues.add(option.value)
    }

    if (seed && !this._selected.some((option: any) => option.value === seed.value)) {
      const claimsSeed = this._config.value === this._initialValue && this._inputElement.value === this._claimedText

      this._applySelection(seed)

      if (claimsSeed && this._selected.includes(seed)) {
        this._claimedText = seed.label
      }

      if (this._reportSeed && this._selected.includes(seed)) {
        this._reportSeed = false
        this._updateValidationState()
        this._triggerChangeEvent(seed)
      }
    }
  }

  override _afterOptionsRendered(): void {
    if (!this._config.highlightOptionsOnSearch || this._config.optionsTemplate) {
      return
    }

    for (const option of this._getDisplayedOptions()) {
      option.innerHTML = this._highlightOption(option.textContent!)
    }
  }

  override _afterFilter(visibleOptions: number): void {
    if (visibleOptions === 0 && !this._config.searchNoResultsLabel) {
      this.hide()
    }
  }

  override _configAfterMerge(config: any): any {
    config = this._normalizeContainerConfig(config)

    if (typeof config.options === 'string') {
      config.options = config.options.split(/,\s*/).map(String)
    }

    if (typeof config.search === 'string') {
      config.search = config.search.split(/,\s*/).map(String)
    }

    if (config.searchNoResultsLabel === true) {
      config.searchNoResultsLabel = 'No results found'
    }

    return config
  }

  // Static

  static autocompleteInterface(element: string | Element | null, config?: any, ...args: any[]): void {
    const data: any = Autocomplete.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config](...args)
    }
  }

  static jQueryInterface(this: any, config: any, ...args: any[]): any {
    return jQueryDispatch(this, Autocomplete, config, args)
  }

  static clearMenus(event: any): void {
    if (event.button === RIGHT_MOUSE_BUTTON || (event.type === 'keyup' && event.key !== TAB_KEY)) {
      return
    }

    const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN)

    for (const toggle of openToggles) {
      const context = Autocomplete.getInstance(toggle)

      if (!context) {
        continue
      }

      const composedPath = event.composedPath()

      // The panel mounts outside the frame while open — a click on an option
      // is very much inside
      if (composedPath.includes(context._element) || composedPath.includes(context._menu)) {
        continue
      }

      context.hide()
      context.search('')
      if (context._config.allowOnlyDefinedOptions && context._selected.length === 0) {
        context._inputElement.value = ''
        context._updateValidationState()
      }
    }
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const autocomplete of SelectorEngine.find(SELECTOR_DATA_AUTOCOMPLETE)) {
    Autocomplete.autocompleteInterface(autocomplete)
  }
})
EventHandler.on(document, EVENT_CLICK_DATA_API, Autocomplete.clearMenus)
EventHandler.on(document, EVENT_KEYUP_DATA_API, Autocomplete.clearMenus)

/**
 * jQuery
 */

defineJQueryPlugin(Autocomplete)

export default Autocomplete

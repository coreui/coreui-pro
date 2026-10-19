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
import FieldValidation from './util/field-validation.js'
import { applyControlGroupClasses } from './util/form-control-group.js'
import { nextStateSerial, type ValidationState } from './util/form-validation.js'
import {
  DefaultAllowlist, sanitizeByConfig, type SanitizerAllowList, SVGAllowlist
} from './util/sanitizer.js'
import { CLEANER_ICON, PICKER_ICON } from './util/icons.js'
import { isTypingKey } from './util/list-navigation.js'
import {
  filterOptionTree, findOptionByValue, flattenOptions, getSelectableOptions, highlightMatches, isOptionGroup
} from './util/option-tree.js'
import { createSelectionStore } from './util/selection-state.js'
import {
  defineJQueryPlugin, getUID, jQueryDispatch, writeAttribute
} from './util/index.js'

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
const EVENT_KEYUP = `keyup${EVENT_KEY}`
const EVENT_MOUSEDOWN = `mousedown${EVENT_KEY}`
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
const CLASS_NAME_SHOW = 'show'

const HOST_FIELD_ATTRIBUTES = new Set([
  'aria-description',
  'aria-details',
  'aria-errormessage',
  'aria-label',
  'aria-labelledby',
  'aria-placeholder',
  'aria-readonly',
  'aria-required'
])

const SELECTOR_DATA_AUTOCOMPLETE = '[data-coreui-autocomplete]'
const SELECTOR_DATA_TOGGLE_SHOWN = `.autocomplete.${CLASS_NAME_SHOW}`
const SELECTOR_INDICATOR = '.form-control-action'

type AutocompleteConfig = {
  allowList: SanitizerAllowList
  allowOnlyDefinedOptions: boolean
  ariaCleanerLabel: string
  ariaPickerLabel: string
  cleaner: boolean
  clearSearchOnSelect: boolean
  container: Element | boolean | string
  disabled: boolean
  globalSearch: boolean
  highlightOptionsOnSearch: boolean
  id: string | null
  invalid: boolean
  name: string | null
  options: string | any[] | null
  optionsGroupsTemplate: ((group: any) => string) | null
  optionsMaxHeight: number | string
  optionsTemplate: ((option: any) => string) | null
  pickerIcon: string | boolean
  placeholder: string | null
  required: boolean
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  search: 'external' | null
  searchNoResultsLabel: boolean | string
  showHints: boolean
  valid: boolean
  validationState: ValidationState | null
  value: number | string | null
}

const Default: AutocompleteConfig = {
  allowList: DefaultAllowlist as SanitizerAllowList,
  allowOnlyDefinedOptions: false,
  ariaCleanerLabel: 'Clear selection',
  ariaPickerLabel: 'Toggle options list',
  cleaner: false,
  clearSearchOnSelect: true,
  container: false,
  disabled: false,
  globalSearch: true,
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
  validationState: null,
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
  globalSearch: 'boolean',
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
  search: '(string|null)',
  searchNoResultsLabel: 'boolean|string',
  showHints: 'boolean',
  valid: 'boolean',
  validationState: '(string|null|undefined)',
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
  protected declare _hostAria: Array<[string, string]>
  protected declare _keySerial: number | null
  protected declare _known: Map<string, any>
  protected declare _initialValue: any
  protected declare _reportSeed: boolean
  protected declare _seenOptionValues: Set<string>
  protected declare _shownText: string
  protected declare _validation: FieldValidation
  protected declare _valueApplied: boolean

  constructor(element?: string | Element | null, config?: Partial<AutocompleteConfig> | null) {
    super(element, config)

    this._uniqueId = this._config.id ?? getUID(`${this.constructor.NAME}`)
    this._cleanerElement = null
    this._indicatorElement = null
    this._inputElement = null
    this._inputHintElement = null
    this._togglerElement = null
    this._keySerial = null
    this._shownText = ''
    this._validation = new FieldValidation(this._element, {
      aliases: true,
      config: () => this._config,
      fields: () => [this._inputElement],
      frames: () => [this._element],
      invalidTargets: () => [this._inputElement],
      restore: () => this._restoreInitialSelection()
    })
    this._optionsElement = null

    this._menu = null
    this._known = new Map()
    this._store = createSelectionStore(next => next.slice(-1))
    this._options = this._getOptionsFromConfig()
    this._floatingCleanup = null
    this._anchoredPosition = null
    this._search = ''
    this._seenOptionValues = new Set()
    this._valueApplied = false
    this._initialValue = this._config.value
    this._reportSeed = false

    this._createAutocomplete()
    this._validation.refresh()
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
      (this._isExternalSearch() ? this._options : filterOptionTree(this._options, this._search)).length > 0
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

    this._validation.dispose()
    this._disposeFloating()
    this._disposeListBox()

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

    this._element.classList.remove(CLASS_NAME_SHOW)

    for (const [name, value] of this._hostAria) {
      if (!this._element.hasAttribute(name)) {
        this._element.setAttribute(name, value)
      }
    }

    super.dispose()
  }

  clear(): void {
    const isChanged = this._store.size() > 0 || this._shownText !== ''

    this.deselectAll()
    this.search('')
    this._filterOptionsList()
    this._setText('')
    this._validation.update()

    if (isChanged) {
      this._triggerChangeEvent(null)
    }
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

  disable(): void {
    this._setConfig({ disabled: true })
  }

  enable(): void {
    this._setConfig({ disabled: false })
  }

  setOptions(options: AutocompleteConfig['options']): void {
    this._setConfig({ options })
  }

  setValidationState(validationState: ValidationState | null): void {
    this._setConfig({ validationState })
  }

  setValue(value: AutocompleteConfig['value']): void {
    this._setConfig({ value })
  }

  deselectAll(options: any[] = this._selectedOptions()): void {
    if (this._store.size() === 0) {
      return
    }

    for (const option of options) {
      if (option.disabled) {
        continue
      }

      if (isOptionGroup(option)) {
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

  _isExternalSearch(): boolean {
    return this._config.search === 'external'
  }

  // Private
  _setConfig(config: Partial<AutocompleteConfig> | null): void {
    this._config = this._getConfig({ ...this._config, ...config })

    if (this._validation.configure(config)) {
      return
    }

    this._options = this._getOptionsFromConfig()
    this._setListBoxItems()

    if (config?.value !== undefined) {
      this._valueApplied = false
      this.deselectAll()
      this._setText('')
    }

    this._seedSelection()
    this._applyState()

    if (this._config.disabled) {
      this.hide()
    }

    this._validation.update()
  }

  _addEventListeners(): void {
    EventHandler.on(this._element, EVENT_CLICK, (event: any) => {
      if (!this._config.disabled && !event.target.closest(SELECTOR_INDICATOR)) {
        this.show()
        this._inputElement.focus()
      }
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, (event: any) => {
      this._keySerial = nextStateSerial()

      if (event.key === ESCAPE_KEY) {
        // An open menu owns the press; a closed one leaves it to whatever
        // encloses the field, such as a modal dialog.
        if (this._isShown()) {
          event.preventDefault()
          event.stopPropagation()
        }

        this.hide()
        if (this._config.allowOnlyDefinedOptions && this._store.size() === 0) {
          this._emptyByUser()
          this.search('')
        }

        return
      }

      if (this._config.globalSearch && !event.defaultPrevented && isTypingKey(event)) {
        this._inputElement.focus()
      }

      if (event.target === this._inputElement && (event.key === BACKSPACE_KEY || event.key === DELETE_KEY) && this._store.size() > 0) {
        this._validation.dismiss(this._keySerial)
        this.deselectAll()
        this._validation.update()
        this._triggerChangeEvent(null)
      }
    })

    EventHandler.on(this._element, EVENT_KEYUP, () => {
      this._keySerial = null
    })

    EventHandler.on(this._menu, EVENT_KEYDOWN, (event: any) => {
      if (this._config.globalSearch && !event.defaultPrevented && isTypingKey(event)) {
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

      if (this._config.disabled || inputValue.length === 0) {
        return
      }

      if (this._namesSelection(inputValue)) {
        this.hide()
        return
      }

      const inputValueLower = inputValue.trim().toLowerCase()
      const exactMatches = getSelectableOptions(this._options).filter(option => option.label.trim().toLowerCase() === inputValueLower)

      if (exactMatches.length === 1) {
        this._selectOption(exactMatches[0])
        return
      }

      if (this._config.allowOnlyDefinedOptions) {
        this._clearByUser()
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

      if (event.key === TAB_KEY && this._inputHintElement?.value) {
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

      if (value !== this._shownText) {
        this._validation.dismiss(this._keySerial ?? Number.POSITIVE_INFINITY)
      }

      this._shownText = value
      this._validation.update()

      if (this._store.size() > 0) {
        this.deselectAll()
        this._triggerChangeEvent(null)
      }

      this.search(value)
      if (this._inputHintElement) {
        const option = value.trim() ? this._findHintOption(value) : undefined
        this._inputHintElement.value = option ? `${value}${option.label.slice(value.trimStart().length)}` : ''
      }

      if (value && !this._isShown()) {
        this.show()
      }
    })

    EventHandler.on(this._optionsElement, EVENT_MOUSEDOWN, (event: any) => {
      // Keep focus on the input so its blur handler doesn't clear the search
      // (and re-render the list) before the click selects the option.
      event.preventDefault()
    })

    EventHandler.on(this._cleanerElement, EVENT_CLICK, (event: any) => {
      if (!this._config.disabled) {
        event.preventDefault()
        event.stopPropagation()
        this._clearByUser()
      }
    })

    EventHandler.on(this._cleanerElement, EVENT_KEYDOWN, (event: any) => {
      if (!this._config.disabled && event.key === ENTER_KEY) {
        event.preventDefault()
        event.stopPropagation()
        this._clearByUser()
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

    if (this._namesSelection(this._inputElement.value)) {
      this.hide()
      return
    }

    const options = getSelectableOptions(this._options).filter(option => option.label.trim().toLowerCase() === this._inputElement.value.trim().toLowerCase())

    if (options.length > 0) {
      if (this._store.has(String(options[0].value))) {
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

  _getOptionsFromConfig(options: any = this._config.options, disabled = false): any[] {
    if (!options || !Array.isArray(options)) {
      return []
    }

    const _options = []
    for (const option of options) {
      if (isOptionGroup(option)) {
        const customGroupProperties = { ...option }

        delete customGroupProperties.label
        delete customGroupProperties.options

        _options.push({
          ...customGroupProperties,
          label: option.label,
          options: this._getOptionsFromConfig(option.options, disabled || option.disabled)
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
        ...(disabled || option.disabled) && { disabled: true }
      })
    }

    return _options
  }

  _createAutocomplete(): void {
    this._element.classList.add(CLASS_NAME_AUTOCOMPLETE)

    this._createInputGroup()
    this._createButtons()
    this._createOptionsContainer()
    this._seedSelection()
    this._applyState()
  }

  _applyState(): void {
    const { disabled, required } = this._config

    this._element.classList.toggle(CLASS_NAME_DISABLED, disabled)
    this._inputElement.disabled = disabled
    this._inputElement.required = required
    writeAttribute(this._inputElement, 'tabindex', disabled ? '-1' : null)

    if (this._indicatorElement) {
      this._indicatorElement.disabled = disabled
    }

    this._updateCleaner()
  }

  _createInputGroup(): void {
    // The root is the frame: a field component has nothing to wrap, so it
    // carries `.form-control-group` itself instead of nesting one.
    const togglerEl = this._element
    this._hostAria = [...togglerEl.attributes]
      .filter(({ name }) => HOST_FIELD_ATTRIBUTES.has(name))
      .map(({ name, value }): [string, string] => [name, value])
    togglerEl.removeAttribute('tabindex')

    applyControlGroupClasses(togglerEl, CLASS_NAME_INPUT_GROUP)
    this._togglerElement = togglerEl

    if (this._config.showHints) {
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

    for (const [name, value] of this._hostAria) {
      inputEl.setAttribute(name, value)
      togglerEl.removeAttribute(name)
    }

    inputEl.setAttribute('aria-autocomplete', 'list')
    inputEl.setAttribute('aria-expanded', 'false')
    inputEl.setAttribute('aria-haspopup', 'listbox')

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

    if (this._config.cleaner) {
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

  override _getActiveDescendantField(): HTMLElement {
    return this._inputElement
  }

  override _onOptionSelected(value: string): void {
    const foundOption = this._findOptionByValue(value)

    if (foundOption && !this._config.disabled) {
      this._selectOption(foundOption)
      this._inputElement.focus()
    }
  }

  _selectOption(option: any): void {
    if (option.disabled) {
      return
    }

    if (this._inputElement.value !== option.label) {
      this._validation.dismiss()
    }

    this._applySelection(option)
    this._validation.update()
    this._triggerChangeEvent(option)

    if (this._inputHintElement) {
      this._inputHintElement.value = ''
    }

    this.hide()

    if (this._config.clearSearchOnSelect) {
      this.search('')
    }
  }

  _applySelection(option: any): void {
    this._known.set(String(option.value), option)
    this._commitSelection([String(option.value)])
    this._setText(option.label)
    this._updateCleaner()
  }

  _deselectOption(value: any): void {
    this._commitSelection(this._store.values().filter(selected => selected !== String(value)))
  }

  _selectedOptions(): any[] {
    return this._store.values().map(value => this._known.get(value) ?? this._findOptionByValue(value)).filter(Boolean)
  }

  _findHintOption(text: string): any {
    return getSelectableOptions(this._options).find(option => option.label.toLowerCase().startsWith(text.trimStart().toLowerCase()))
  }

  _namesSelection(text: string): boolean {
    return this._selectedOptions().some((option: any) => option.label.trim() === text.trim())
  }

  _clearByUser(): void {
    if (this._store.size() > 0 || this._inputElement.value !== '') {
      this._validation.dismiss()
    }

    this.clear()
  }

  _emptyByUser(): void {
    if (this._inputElement.value !== '') {
      this._validation.dismiss()
    }

    this._setText('')
    this._validation.update()
  }

  _setText(text: string): void {
    this._inputElement.value = text
    this._shownText = text
  }

  _updateCleaner(): void {
    if (!this._cleanerElement) {
      return
    }

    if (this._store.size() > 0 && !this._config.disabled) {
      this._cleanerElement.style.removeProperty('display')
      return
    }

    this._cleanerElement.style.display = 'none'
  }

  override _isOpenKey(event: KeyboardEvent): boolean {
    return event.key === ARROW_DOWN_KEY || (event.key === ENTER_KEY && event.target === this._togglerElement)
  }

  _restoreInitialSelection(): void {
    const previous = this._selectedOptions()[0]?.value
    const text = this._shownText

    this._reportSeed = false
    this.deselectAll()
    this._setText('')

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
    this._validation.update()

    const current = this._selectedOptions()[0]

    if (current ? current.value !== previous : previous !== undefined || text !== '') {
      this._triggerChangeEvent(current ?? null)
    }

    this._reportSeed = !current
  }

  _seedSelection(): void {
    const options = flattenOptions(this._options)
    const { value } = this._config
    let seed

    if (value !== null && value !== undefined && value !== '') {
      if (!this._valueApplied) {
        seed = findOptionByValue(options, value)
        this._valueApplied = Boolean(seed)
      }
    } else {
      seed = options.find(option => option.selected && !this._seenOptionValues.has(option.value))
    }

    for (const option of options) {
      this._seenOptionValues.add(option.value)
    }

    if (seed && !this._store.has(String(seed.value))) {
      this._applySelection(seed)

      if (this._reportSeed && this._store.has(String(seed.value))) {
        this._reportSeed = false
        this._validation.update()
        this._triggerChangeEvent(seed)
      }
    }
  }

  override _afterOptionsRendered(): void {
    if (!this._config.highlightOptionsOnSearch || this._config.optionsTemplate) {
      return
    }

    for (const option of this._getDisplayedOptions()) {
      option.innerHTML = highlightMatches(option.textContent!, this._search)
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
      if (context._config.allowOnlyDefinedOptions && context._store.size() === 0) {
        context._emptyByUser()
      }

      context.search('')
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
export type { AutocompleteConfig }

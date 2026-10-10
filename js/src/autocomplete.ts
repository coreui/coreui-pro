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
import { applyControlGroupClasses } from './util/form-control-group.js'
import {
  followUserValidity, getFeedbackIds, getValidationState, nextStateSerial, ownValidationState, setStateValidity,
  type UserValidity, type ValidationState
} from './util/form-validation.js'
import {
  DefaultAllowlist, escapeHtml, sanitizeByConfig, type SanitizerAllowList, SVGAllowlist
} from './util/sanitizer.js'
import { CLEANER_ICON, PICKER_ICON } from './util/icons.js'
import {
  captureHostClasses, defineJQueryPlugin, getUID, type HostClasses, jQueryDispatch, restoreHostClasses
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
const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const CLASS_NAME_SHOW = 'show'

const HOST_CLASS_NAMES = [CLASS_NAME_AUTOCOMPLETE, CLASS_NAME_INPUT_GROUP, CLASS_NAME_SHOW]

const SELECTOR_DATA_AUTOCOMPLETE = '[data-coreui-autocomplete]:not(.disabled)'
const SELECTOR_DATA_TOGGLE_SHOWN = `.autocomplete:not(.disabled).${CLASS_NAME_SHOW}`
const SELECTOR_INDICATOR = '.form-control-action'

const VALIDATION_OPTIONS = new Set(['invalid', 'valid', 'validationState'])

type AutocompleteConfig = {
  allowList: SanitizerAllowList
  allowOnlyDefinedOptions: boolean
  ariaCleanerLabel: string
  ariaPickerLabel: string
  cleaner: boolean
  clearSearchOnSelect: boolean
  container: Element | boolean | string
  disabled: boolean
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
  search: string | ('external' | 'global')[] | null
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
  protected declare _addedDisabledClass: boolean
  protected declare _hostClasses: HostClasses
  protected declare _feedbackIds: string[]
  protected declare _keySerial: number | null
  protected declare _previousTabIndex: string | null
  protected declare _initialValue: any
  protected declare _reportSeed: boolean
  protected declare _seenOptionValues: Set<string>
  protected declare _serverClasses: string[]
  protected declare _shownText: string
  protected declare _stateClass: string | null
  protected declare _stateSerial: number
  protected declare _userValidity: UserValidity | null
  protected declare _valueApplied: boolean

  constructor(element?: string | Element | null, config?: Partial<AutocompleteConfig> | null) {
    super(element, config)

    this._uniqueId = this._config.id ?? getUID(`${this.constructor.NAME}`)
    this._indicatorElement = null
    this._inputElement = null
    this._inputHintElement = null
    this._togglerElement = null
    this._addedDisabledClass = false
    this._hostClasses = captureHostClasses(this._element, HOST_CLASS_NAMES)
    this._feedbackIds = []
    this._keySerial = null
    this._serverClasses = [CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID].filter(className => this._element.classList.contains(className))
    this._element.classList.remove(...this._serverClasses)
    this._shownText = ''
    this._stateClass = null
    this._stateSerial = nextStateSerial()
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

    this._createAutocomplete()
    ownValidationState(this._inputElement)
    this._userValidity = followUserValidity(this._inputElement, () => this._updateValidationState(), serial => this._restoreInitialSelection(serial))
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
    this._userValidity?.stop()

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

    if (this._addedDisabledClass) {
      this._element.classList.remove(CLASS_NAME_DISABLED)
    }

    if (this._stateClass) {
      this._element.classList.remove(this._stateClass)
    }

    this._element.classList.add(...this._serverClasses)
    restoreHostClasses(this._element, HOST_CLASS_NAMES, this._hostClasses)

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
    this._setText('')
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

  setConfig(config: Partial<AutocompleteConfig> | null): void {
    const keys = Object.keys(config ?? {})

    this._config = this._getConfig({ ...this._config, ...config })

    if (keys.some(key => VALIDATION_OPTIONS.has(key))) {
      this._serverClasses = []
      this._stateSerial = nextStateSerial()
    }

    if (keys.length > 0 && keys.every(key => VALIDATION_OPTIONS.has(key))) {
      this._updateValidationState()
      return
    }

    this._options = this._getOptionsFromConfig()
    this._setListBoxItems()
    this._syncInputName()

    for (const option of this._selected) {
      this._syncOptionElementState(option.value, true)
    }

    if (config?.value !== undefined) {
      this._valueApplied = false
      this.deselectAll()
      this._setText('')
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
      this._keySerial = nextStateSerial()

      if (event.key === ESCAPE_KEY) {
        // An open menu owns the press; a closed one leaves it to whatever
        // encloses the field, such as a modal dialog.
        if (this._isShown()) {
          event.preventDefault()
          event.stopPropagation()
        }

        this.hide()
        if (this._config.allowOnlyDefinedOptions && this._selected.length === 0) {
          this._emptyByUser()
          this.search('')
        }

        return
      }

      if (this._isGlobalSearch() && (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY)) {
        this._inputElement.focus()
      }

      if (event.target === this._inputElement && (event.key === BACKSPACE_KEY || event.key === DELETE_KEY) && this._selected.length > 0) {
        this._dismissValidationState(this._keySerial)
        this.deselectAll()
        this._updateValidationState()
        this._triggerChangeEvent(null)
      }
    })

    EventHandler.on(this._element, EVENT_KEYUP, () => {
      this._keySerial = null
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

      if (value !== this._shownText) {
        this._dismissValidationState(this._keySerial ?? Number.POSITIVE_INFINITY)
      }

      this._shownText = value
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

  _createAutocomplete(): void {
    this._element.classList.add(CLASS_NAME_AUTOCOMPLETE)

    if (this._config.disabled && !this._element.classList.contains(CLASS_NAME_DISABLED)) {
      this._element.classList.add(CLASS_NAME_DISABLED)
      this._addedDisabledClass = true
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
    if (this._inputElement.value !== option.label) {
      this._dismissValidationState()
    }

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
    this._setText(option.label)
    this._updateCleaner()
  }

  _deselectOption(value: any): void {
    this._selected = this._selected.filter((option: any) => option.value !== value)

    this._syncOptionElementState(value, false)
  }

  _findHintOption(text: string): any {
    return this._flattenOptions().find(option => !option.disabled && option.label.toLowerCase().startsWith(text.toLowerCase()))
  }

  _clearByUser(): void {
    if (this._selected.length > 0 || this._inputElement.value !== '') {
      this._dismissValidationState()
    }

    this.clear()
  }

  _emptyByUser(): void {
    if (this._inputElement.value !== '') {
      this._dismissValidationState()
    }

    this._setText('')
    this._updateValidationState()
  }

  _setText(text: string): void {
    this._inputElement.value = text
    this._shownText = text
  }

  _dismissValidationState(serial: number = Number.POSITIVE_INFINITY): void {
    if (this._stateSerial > serial) {
      return
    }

    this._config.invalid = false
    this._config.valid = false
    this._config.validationState = null
    this._serverClasses = []
    this._updateValidationState()
  }

  _updateValidationState(): void {
    const input = this._inputElement
    const givenState = getValidationState(this._config.validationState, this._config.valid, this._config.invalid) ??
      getValidationState(null, this._serverClasses.includes(CLASS_NAME_IS_VALID), this._serverClasses.includes(CLASS_NAME_IS_INVALID))

    setStateValidity(input, givenState === 'invalid')

    const state = givenState ?? this._userValidity?.read()
    const stateClass = state ? `is-${state}` : null
    const feedbackIds = state === 'invalid' ? getFeedbackIds(input) : []

    if (stateClass !== this._stateClass) {
      if (this._stateClass) {
        this._element.classList.remove(this._stateClass)
      }

      if (stateClass) {
        this._element.classList.add(stateClass)
      }

      this._stateClass = stateClass
    }

    const current: string = input.getAttribute('aria-describedby') ?? ''
    const pageIds = current.split(/\s+/).filter(id => id && !this._feedbackIds.includes(id))
    const describedBy = [...new Set([...pageIds, ...feedbackIds])].join(' ')

    this._feedbackIds = feedbackIds.filter(id => !pageIds.includes(id))
    this._writeInputAttribute('aria-invalid', state === 'invalid' ? 'true' : null)
    this._writeInputAttribute('aria-describedby', describedBy || null)
  }

  _writeInputAttribute(name: string, value: string | null): void {
    if (this._inputElement.getAttribute(name) === value) {
      return
    }

    if (value === null) {
      this._inputElement.removeAttribute(name)
    } else {
      this._inputElement.setAttribute(name, value)
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

  _restoreInitialSelection(serial: number): void {
    const previous = this._selected[0]?.value
    const text = this._shownText

    this._dismissValidationState(serial)
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
      this._applySelection(seed)

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
      if (context._config.allowOnlyDefinedOptions && context._selected.length === 0) {
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

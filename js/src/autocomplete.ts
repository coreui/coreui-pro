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
  DefaultAllowlist, type SanitizerAllowList
} from './util/sanitizer.js'
import { isComposingKey, settleClick } from './util/layers.js'
import { containsFocus } from './util/focus.js'
import { isOpeningF4 } from './util/list-navigation.js'
import {
  filterOptionTree, findOptionByValue, flattenOptions, getSelectableOptions, hasSameValues, highlightMatches, isOptionGroup
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

const BACKSPACE_KEY = 'Backspace'
const DELETE_KEY = 'Delete'
const ENTER_KEY = 'Enter'
const ESCAPE_KEY = 'Escape'
const TAB_KEY = 'Tab'

const EVENT_BLUR = `blur${EVENT_KEY}`
const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_CLEAR = `clear${EVENT_KEY}`
const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_KEYUP = `keyup${EVENT_KEY}`
const EVENT_MOUSEDOWN = `mousedown${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_AUTOCOMPLETE = 'autocomplete'
const CLASS_NAME_DISABLED = 'disabled'
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
  loading: boolean
  loadingLabel: string
  name: string | null
  options: string | any[] | null
  optionsGroupsTemplate: ((group: any) => string) | null
  optionsMaxHeight: number | string
  optionsTemplate: ((option: any) => string) | null
  pickerIcon: string | boolean
  placeholder: string | null
  required: boolean
  resetSelectionOnOptionsChange: boolean
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
  loading: false,
  loadingLabel: 'Loading…',
  name: null,
  options: [] as any[],
  optionsGroupsTemplate: null,
  optionsMaxHeight: 'auto',
  optionsTemplate: null,
  pickerIcon: false,
  placeholder: null,
  required: false,
  resetSelectionOnOptionsChange: false,
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
  loading: 'boolean',
  loadingLabel: 'string',
  name: '(string|null)',
  options: '(array|null)',
  optionsGroupsTemplate: '(function|null)',
  optionsMaxHeight: '(number|string)',
  optionsTemplate: '(function|null)',
  pickerIcon: '(string|boolean)',
  placeholder: '(string|null)',
  required: 'boolean',
  resetSelectionOnOptionsChange: 'boolean',
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
  protected declare _disabled: boolean
  protected declare _givenValue: any
  protected declare _known: Map<string, any>
  protected declare _initialValue: any
  protected declare _awaitingOptions: boolean
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
    this._openingKey = null
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
    this._disabled = this._config.disabled
    this._givenValue = this._config.value
    this._options = this._getOptionsFromConfig(this._config.options)
    this._floatingCleanup = null
    this._anchoredPosition = null
    this._search = ''
    this._seenOptionValues = new Set()
    this._valueApplied = false
    this._initialValue = this._config.value
    this._reportSeed = false
    this._awaitingOptions = false

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

  override _getFocusTarget(): HTMLElement {
    return this._inputElement
  }

  override _onHideEnd(): void {
    this._clearHint()
  }

  override _afterOutsideHide(): void {
    if (this._config.allowOnlyDefinedOptions && this._store.size() === 0) {
      this._emptyByUser()
    }

    this.search('')
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    this._disposeLayer()
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
    if (this._emptyField()) {
      EventHandler.trigger(this._element, EVENT_CLEAR)
    }
  }

  search(label: string): void {
    this._search = label.toLowerCase()
    this._awaitingOptions = false
    if (!this._isExternalSearch()) {
      this._filterOptionsList()
    }

    EventHandler.trigger(this._element, EVENT_INPUT, {
      value: label
    })
  }

  disable(): void {
    this._setDisabled(true)
  }

  enable(): void {
    this._setDisabled(false)
  }

  setOptions(options: AutocompleteConfig['options']): void {
    const normalized = this._normalizeOptions(options)
    this._typeCheckConfig({ options: normalized }, { options: DefaultType.options })

    const previous = this._optionValues()
    const selected = this._selectedOptions()[0]?.value

    this._options = this._getOptionsFromConfig(normalized)
    this._setListBoxOptions()

    const reset = this._config.resetSelectionOnOptionsChange && !hasSameValues(previous, this._optionValues())

    if (reset) {
      if (this._namesSelection(this._shownText)) {
        this._setText('')
        this.search('')
      }

      if (this._valueApplied) {
        this._givenValue = null
      }

      this._reportSeed = false
      this._seenOptionValues.clear()
      this._clearSelection()
    }

    this._seedSelection()
    this._validation.update()

    const current = this._selectedOptions()[0]

    if (reset && current?.value !== selected && current?.value !== String(this._givenValue)) {
      this._triggerChangeEvent(current ?? null)
    }

    if (this._awaitingOptions && containsFocus(this._inputElement)) {
      this._showForText()
    }
  }

  setValidationState(validationState: ValidationState | null): void {
    const state = { invalid: false, valid: false, validationState }
    this._config = this._getConfig({ ...this._config, ...state })
    this._validation.configure()
  }

  setValue(value: AutocompleteConfig['value']): void {
    this._typeCheckConfig({ value }, { value: DefaultType.value })
    this._givenValue = value
    this._valueApplied = false
    this._reportSeed = false
    this._clearSelection()
    this._setText('')
    this._seedSelection()
    this._validation.update()
  }

  deselectAll(): void {
    for (const option of this._selectedOptions()) {
      if (!option.disabled) {
        this._deselectOption(option.value)
      }
    }

    this._updateCleaner()
  }

  // Helpers

  _triggerChangeEvent(value: any): void {
    EventHandler.trigger(this._element, EVENT_CHANGE, {
      value
    })
  }

  override _typingField(): HTMLElement | null {
    return this._config.globalSearch ? this._inputElement : null
  }

  _isExternalSearch(): boolean {
    return this._config.search === 'external'
  }

  _showForText(): void {
    this.show()
    this._awaitingOptions = !this._isShown()
  }

  _optionValues(): Set<string> {
    return new Set(flattenOptions(this._options).map(option => option.value))
  }

  // Private
  override _isDisabled(): boolean {
    return this._disabled
  }

  _setDisabled(disabled: boolean): void {
    if (disabled === this._disabled) {
      return
    }

    this._disabled = disabled

    if (disabled) {
      this.hide()
    }

    this._applyState()
    this._validation.update()
  }

  _addEventListeners(): void {
    EventHandler.on(this._element, EVENT_CLICK, (event: any) => {
      if (!this._disabled && !event.target.closest(SELECTOR_INDICATOR)) {
        this.show()
        this._inputElement.focus()
      }
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, (event: any) => {
      this._keySerial = nextStateSerial()

      if (event.key === ESCAPE_KEY) {
        const handled = event.defaultPrevented

        this._awaitingOptions = false
        this._handleFieldEscape(event)

        if (!handled && !event.repeat && !isComposingKey(event) && this._config.allowOnlyDefinedOptions && this._store.size() === 0) {
          this._emptyByUser()
          this.search('')
        }

        return
      }

      this._routeTyping(event)

      if (event.target === this._inputElement && (event.key === BACKSPACE_KEY || event.key === DELETE_KEY) && this._store.size() > 0) {
        this._validation.dismiss(this._keySerial)
        this._clearSelection()
        this._validation.update()
        this._triggerChangeEvent(null)
      }
    })

    EventHandler.on(this._element, EVENT_KEYUP, () => {
      this._keySerial = null
    })

    EventHandler.on(this._menu, EVENT_KEYDOWN, (event: any) => this._routeTyping(event))

    EventHandler.on(this._indicatorElement, EVENT_MOUSEDOWN, (event: any) => event.preventDefault())

    EventHandler.on(this._indicatorElement, EVENT_CLICK, (event: any) => {
      event.preventDefault()
      this.toggle()

      if (this._isShown()) {
        this._inputElement.focus()
      }
    })

    EventHandler.on(this._inputElement, EVENT_BLUR, () => {
      const inputValue = this._inputElement.value

      this._awaitingOptions = false
      this._keySerial = null

      if (this._disabled || inputValue.length === 0) {
        return
      }

      if (this._namesSelection(inputValue)) {
        this._hide(false)
        return
      }

      const exactMatches = this._optionsLabelled(inputValue)

      if (exactMatches.length === 1) {
        this._selectOption(exactMatches[0], false)
        return
      }

      if (this._config.allowOnlyDefinedOptions) {
        this._dismissForClear()
        this._emptyField()
      }
    })

    EventHandler.on(this._inputElement, EVENT_KEYDOWN, (event: any) => {
      const f4 = isOpeningF4(event)

      if (!this._isShown() && (f4 || this._isOpeningArrow(event))) {
        this._showForKey(event, f4 ? null : event.key)
      }

      // The list activated its highlighted option and closed the panel; the
      // same press must not match the value it just wrote.
      if (event.key === ENTER_KEY && event.defaultPrevented) {
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

    EventHandler.on(this._inputElement, EVENT_INPUT, (event: any) => {
      const { value } = this._inputElement

      if (event.inputType === 'deleteByDrag') {
        this._keySerial = nextStateSerial()
      }

      this._listBox?._requestEntry(null)

      if (value !== this._shownText) {
        this._validation.dismiss(this._keySerial ?? Number.POSITIVE_INFINITY)
      }

      this._shownText = value
      this._valueApplied = true
      this._validation.update()

      if (this._store.size() > 0) {
        this._clearSelection()
        this._triggerChangeEvent(null)
      }

      this._updateCleaner()
      this.search(value)
      if (this._inputHintElement) {
        const option = value.trim() ? this._findHintOption(value) : undefined
        this._inputHintElement.value = option ? `${value}${option.label.slice(value.trimStart().length)}` : ''
      }

      if (value && !this._isShown()) {
        this._showForText()
      }

      if (event.inputType === 'insertFromDrop') {
        this._keySerial = null
      }
    })

    EventHandler.on(this._optionsElement, EVENT_MOUSEDOWN, (event: any) => {
      // Keep focus on the input so its blur handler doesn't clear the search
      // (and re-render the list) before the click selects the option.
      event.preventDefault()
    })

    EventHandler.on(this._cleanerElement, EVENT_CLICK, (event: any) => {
      if (!this._disabled) {
        event.preventDefault()
        settleClick(event)
        event.stopPropagation()
        this._clearByUser()
        this._inputElement.focus()
      }
    })
  }

  _handleEnterKey(event: KeyboardEvent): void {
    if (isComposingKey(event)) {
      return
    }

    this._awaitingOptions = false

    if (this._isShown()) {
      event.preventDefault()
      event.stopPropagation()
    }

    const { value } = this._inputElement

    if (value.length === 0) {
      return
    }

    if (this._namesSelection(value)) {
      this.hide()
      return
    }

    const options = this._optionsLabelled(value)

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

    this.hide()

    if (this._config.clearSearchOnSelect) {
      this.search('')
    }
  }

  _syncInputName(): void {
    writeAttribute(this._inputElement, 'name', this._config.name ? String(this._config.name) : null)
  }

  _getOptionsFromConfig(options: any, disabled = false): any[] {
    const _options = []
    for (const option of options ?? []) {
      if (isOptionGroup(option)) {
        _options.push({
          ...option,
          options: this._getOptionsFromConfig(option.options, disabled || option.disabled)
        })

        continue
      }

      const label = typeof option === 'string' ? option : option.label
      const value = option.value ?? label

      const customProperties = typeof option === 'object' ? { ...option } : {}

      delete customProperties.selected
      delete customProperties.disabled

      _options.push({
        ...customProperties,
        label,
        value: String(value),
        ...option.selected && { selected: true },
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
    const { required } = this._config
    const disabled = this._disabled

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

    inputEl.setAttribute('aria-autocomplete', this._config.showHints ? 'both' : 'list')
    inputEl.setAttribute('aria-expanded', 'false')
    inputEl.setAttribute('aria-haspopup', 'listbox')

    togglerEl.append(inputEl)
    this._inputElement = inputEl
    this._syncInputName()
  }

  _createButtons(): void {
    if (this._config.cleaner) {
      this._cleanerElement = this._createCleaner()
      this._cleanerElement.tabIndex = -1
      this._togglerElement.append(this._cleanerElement)
    }

    if (this._config.pickerIcon) {
      this._indicatorElement = this._createIndicator()
    }

    this._updateCleaner()
  }

  override _decorateListbox(optionsDiv: HTMLElement): void {
    optionsDiv.setAttribute('aria-labelledby', this._inputElement.getAttribute('aria-labelledby') ?? this._uniqueId)
  }

  override _getActiveDescendantField(): HTMLElement {
    return this._inputElement
  }

  override _onOptionSelected(value: string): void {
    const foundOption = this._findOptionByValue(value)

    if (foundOption && !this._disabled) {
      this._selectOption(foundOption)
    }
  }

  _selectOption(option: any, returnFocus = true): void {
    if (option.disabled) {
      return
    }

    this._valueApplied = true

    if (this._inputElement.value !== option.label) {
      this._validation.dismiss()
    }

    this._applySelection(option)
    this._validation.update()
    this._triggerChangeEvent(option)

    this._clearHint()

    this._hide(returnFocus)

    if (this._config.clearSearchOnSelect) {
      this.search('')
    }
  }

  _applySelection(option: any): void {
    this._known.set(String(option.value), option)
    this._commitSelection([String(option.value)])
    this._setText(option.label)
  }

  _clearSelection(): void {
    this._commitSelection([])
    this._updateCleaner()
  }

  _deselectOption(value: any): void {
    this._commitSelection(this._store.values().filter(selected => selected !== String(value)))
  }

  _selectedOptions(): any[] {
    return this._store.values().map(value => this._known.get(value) ?? this._findOptionByValue(value)).filter(Boolean)
  }

  _optionsLabelled(text: string): any[] {
    return getSelectableOptions(this._options).filter(option => option.label.trim().toLowerCase() === text.trim().toLowerCase())
  }

  _clearHint(): void {
    if (this._inputHintElement) {
      this._inputHintElement.value = ''
    }
  }

  _findHintOption(text: string): any {
    return getSelectableOptions(this._options).find(option => option.label.toLowerCase().startsWith(text.trimStart().toLowerCase()))
  }

  _namesSelection(text: string): boolean {
    return this._selectedOptions().some((option: any) => option.label.trim() === text.trim())
  }

  _emptyField(): boolean {
    const isChanged = this._store.size() > 0 || this._shownText !== ''

    this._valueApplied = true
    this._clearSelection()
    this._setText('')
    this.search('')
    this._filterOptionsList()
    this._validation.update()

    if (isChanged) {
      this._triggerChangeEvent(null)
    }

    return isChanged
  }

  _clearByUser(): void {
    this._dismissForClear()
    this.clear()
  }

  _dismissForClear(): void {
    if (this._store.size() > 0 || this._inputElement.value !== '') {
      this._validation.dismiss()
    }
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
    this._updateCleaner()
  }

  _updateCleaner(): void {
    if (!this._cleanerElement) {
      return
    }

    const shown = (this._store.size() > 0 || (!this._config.allowOnlyDefinedOptions && this._shownText)) && !this._disabled

    this._cleanerElement.style.display = shown ? '' : 'none'
  }

  _restoreInitialSelection(): void {
    const previous = this._selectedOptions()[0]?.value
    this._reportSeed = false
    this._clearSelection()
    this._setText('')

    this._clearHint()

    if (this._search !== '') {
      this.search('')
    }

    this._givenValue = this._initialValue
    this._valueApplied = false
    this._seenOptionValues.clear()
    this._seedSelection()
    this._validation.update()

    const current = this._selectedOptions()[0]

    if (current ? current.value !== previous : previous !== undefined) {
      this._triggerChangeEvent(current ?? null)
    }

    this._reportSeed = !current
  }

  _seedSelection(): void {
    const options = flattenOptions(this._options)
    const value = this._givenValue
    let seed

    if (value === null || value === undefined || value === '') {
      seed = options.find(option => option.selected && !this._seenOptionValues.has(option.value))
    } else if (!this._valueApplied) {
      seed = findOptionByValue(options, value)
      this._valueApplied = Boolean(seed)
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

  _normalizeOptions(options: any): any {
    return typeof options === 'string' ? options.split(/,\s*/).map(String) : options
  }

  override _configAfterMerge(config: any): any {
    config = this._normalizeContainerConfig(config)

    config.options = this._normalizeOptions(config.options)

    if (config.searchNoResultsLabel === true) {
      config.searchNoResultsLabel = 'No results found'
    }

    return config
  }

  // Static

  static jQueryInterface(this: any, config: any, ...args: any[]): any {
    return jQueryDispatch(this, Autocomplete, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const autocomplete of SelectorEngine.find(SELECTOR_DATA_AUTOCOMPLETE)) {
    Autocomplete.getOrCreateInstance(autocomplete)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Autocomplete)

export default Autocomplete
export type { AutocompleteConfig }

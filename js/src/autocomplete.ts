/**
 * --------------------------------------------------------------------------
 * CoreUI PRO autocomplete.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import Combobox from './combobox.js'
import Data from './dom/data.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import type { ComponentConfig } from './util/config.js'
import {
  DefaultAllowlist, escapeHtml, type SanitizerAllowList
} from './util/sanitizer.js'
import { CLEANER_ICON, INDICATOR_ICON } from './util/icons.js'
import { defineJQueryPlugin, getUID } from './util/index.js'

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
const EVENT_CHANGED = `changed${EVENT_KEY}`
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

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="autocomplete"]:not(.disabled)'
const SELECTOR_DATA_TOGGLE_SHOWN = `.autocomplete:not(.disabled).${CLASS_NAME_SHOW}`
const SELECTOR_INDICATOR = '.form-control-action'

const Default = {
  allowList: DefaultAllowlist as SanitizerAllowList,
  allowOnlyDefinedOptions: false,
  ariaCleanerLabel: 'Clear selection',
  ariaIndicatorLabel: 'Toggle visibility of options menu',
  cleaner: false,
  clearSearchOnSelect: true,
  container: false,
  disabled: false,
  highlightOptionsOnSearch: false,
  id: null,
  indicator: false,
  invalid: false,
  name: null,
  options: false,
  optionsGroupsTemplate: null,
  optionsMaxHeight: 'auto',
  optionsTemplate: null,
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
  ariaIndicatorLabel: 'string',
  cleaner: 'boolean',
  clearSearchOnSelect: 'boolean',
  container: '(string|element|boolean)',
  disabled: 'boolean',
  highlightOptionsOnSearch: 'boolean',
  id: '(string|null)',
  indicator: 'boolean',
  invalid: 'boolean',
  name: '(string|null)',
  options: '(array|null)',
  optionsGroupsTemplate: '(function|null)',
  optionsMaxHeight: '(number|string)',
  optionsTemplate: '(function|null)',
  placeholder: '(string|null)',
  required: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  search: '(array|string|null)',
  searchNoResultsLabel: ('boolean|string'),
  showHints: 'boolean',
  valid: 'boolean',
  value: '(number|string|null)'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Autocomplete extends Combobox {
  protected declare _indicatorElement: any
  protected declare _cleanerElement: any
  protected declare _inputElement: any
  protected declare _inputHintElement: any

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._uniqueId = this._config.id ?? getUID(`${this.constructor.NAME}`)
    this._indicatorElement = null
    this._inputElement = null
    this._inputHintElement = null
    this._togglerElement = null
    this._optionsElement = null

    this._menu = null
    this._selected = []
    this._options = this._getOptionsFromConfig()
    this._floatingCleanup = null
    this._anchoredPosition = null
    this._search = ''

    this._createAutocomplete()
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
    this._disposeFloating()
    this._menu?.remove()

    super.dispose()
  }

  clear(): void {
    this.deselectAll()
    this.search('')
    this._filterOptionsList()
    this._inputElement.value = ''

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

  update(config: any): void {
    if (config.value) {
      this.deselectAll()
    }

    this._config = { ...this._config, ...this._configAfterMerge(config) }
    this._options = this._getOptionsFromConfig()
    this._optionsElement.innerHTML = ''
    this._createOptions(this._optionsElement, this._options)
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
    EventHandler.trigger(this._element, EVENT_CHANGED, {
      value
    })
  }

  _getClassNames(): string[] {
    return this._element.classList.value.split(' ')
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
        this.hide()
        if (this._config.allowOnlyDefinedOptions && this._selected.length === 0) {
          this.search('')
          this._inputElement.value = ''
        }

        return
      }

      if (this._isGlobalSearch() && (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY)) {
        this._inputElement.focus()
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
      if (!this._isShown() && event.key !== TAB_KEY) {
        this.show()
      }

      if (event.key === ARROW_DOWN_KEY && this._inputElement.value.length === this._inputElement.selectionStart) {
        this._selectMenuItem(event)
        return
      }

      if (event.key === TAB_KEY && this._config.showHints && this._inputElement.value.length > 0) {
        if (this._inputHintElement.value) {
          event.preventDefault()
          event.stopPropagation()
        }

        const options = this._flattenOptions().filter(option => option.label.toLowerCase().startsWith(this._inputElement.value.toLowerCase()))

        if (options.length > 0) {
          this._selectOption(options[0])
        }
      }

      if (event.key === ENTER_KEY) {
        event.preventDefault()
        event.stopPropagation()

        if (this._inputElement.value.length === 0) {
          return
        }

        const options = this._flattenOptions().filter(option => option.label.toLowerCase() === this._inputElement.value.toLowerCase())

        if (options.length > 0) {
          this._selectOption(options[0])
        }

        if (options.length === 0 && !this._config.allowOnlyDefinedOptions) {
          this._triggerChangeEvent(this._inputElement.value)

          this.hide()

          if (this._config.clearSearchOnSelect) {
            this.search('')
          }
        }
      }
    })

    EventHandler.on(this._inputElement, EVENT_KEYUP, (event: any) => {
      if (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY) {
        const { value } = event.target
        this.search(value)
        if (this._config.showHints) {
          const options = value ?
            this._flattenOptions().filter(option => option.label.toLowerCase().startsWith(value.toLowerCase())) :
            []
          this._inputHintElement.value = options.length > 0 ? `${value}${options[0].label.slice(value.length)}` : ''
        }

        if (this._selected.length > 0) {
          this.deselectAll()
          this._triggerChangeEvent(null)
        }
      }
    })

    EventHandler.on(this._optionsElement, EVENT_MOUSEDOWN, (event: any) => {
      // Keep focus on the input so its blur handler doesn't clear the search
      // (and re-render the list) before the click selects the option.
      event.preventDefault()
    })

    EventHandler.on(this._optionsElement, EVENT_CLICK, (event: any) => {
      event.preventDefault()
      event.stopPropagation()
      this._onOptionsClick(event.target)
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

    this._addOptionsKeydownListeners()
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

      if (isSelected) {
        this._selected.push({
          label: option.label,
          value: String(value)
        })
      }
    }

    return _options
  }

  _createAutocomplete(): void {
    this._element.classList.add(CLASS_NAME_AUTOCOMPLETE)
    this._element.classList.toggle('is-invalid', this._config.invalid)
    this._element.classList.toggle('is-valid', this._config.valid)

    if (this._config.disabled) {
      this._element.classList.add(CLASS_NAME_DISABLED)
    }

    for (const className of this._getClassNames()) {
      this._element.classList.add(className)
    }

    this._createInputGroup()
    this._createButtons()
    this._createOptionsContainer()
    this._updateOptionsList()
  }

  _createInputGroup(): void {
    // The root is the frame: a field component has nothing to wrap, so it
    // carries `.form-control-group` itself instead of nesting one.
    const togglerEl = this._element
    togglerEl.classList.add(CLASS_NAME_INPUT_GROUP)
    this._togglerElement = togglerEl

    if (!this._config.search && !this._config.disabled) {
      togglerEl.tabIndex = -1
    }

    if (!this._config.disabled && this._config.showHints) {
      const inputHintEl = document.createElement('input')
      inputHintEl.classList.add(CLASS_NAME_INPUT, CLASS_NAME_INPUT_HINT)
      inputHintEl.setAttribute('name', (this._config.name || `${this._uniqueId}-hint`).toString())
      inputHintEl.autocomplete = 'off'
      inputHintEl.readOnly = true
      inputHintEl.tabIndex = -1
      inputHintEl.setAttribute('aria-hidden', true as any)

      togglerEl.append(inputHintEl)
      this._inputHintElement = inputHintEl
    }

    const inputEl = document.createElement('input')
    inputEl.classList.add(CLASS_NAME_INPUT)
    inputEl.id = this._uniqueId
    inputEl.setAttribute('name', (this._config.name || this._uniqueId).toString())
    inputEl.autocomplete = 'off'
    inputEl.placeholder = this._config.placeholder ?? ''
    inputEl.role = 'combobox'
    inputEl.setAttribute('aria-autocomplete', 'list')
    inputEl.setAttribute('aria-expanded', 'false')
    inputEl.setAttribute('aria-haspopup', 'listbox')
    inputEl.setAttribute('aria-controls', `${this._uniqueId}-listbox`)

    if (this._config.disabled) {
      inputEl.setAttribute('disabled', true as any)
      inputEl.tabIndex = -1
    }

    if (this._config.required) {
      inputEl.setAttribute('required', true as any)
    }

    togglerEl.append(inputEl)
    this._inputElement = inputEl
  }

  _createButtons(): void {
    if (!this._config.cleaner && !this._config.indicator) {
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

    if (this._config.indicator) {
      const indicator = document.createElement('button')
      indicator.type = 'button'
      indicator.classList.add(CLASS_NAME_INDICATOR)
      indicator.disabled = this._config.disabled
      indicator.setAttribute('aria-label', this._config.ariaIndicatorLabel)
      indicator.innerHTML = INDICATOR_ICON

      buttons.append(indicator)
      this._indicatorElement = indicator
    }

    this._updateCleaner()
  }

  override _decorateListbox(optionsDiv: HTMLElement): void {
    optionsDiv.setAttribute('aria-labelledby', this._uniqueId)
  }

  override _afterMenuCreated(): void {
    if (this._config.container) {
      this._inputElement.setAttribute('aria-owns', `${this._uniqueId}-listbox`)
    }
  }

  override _decorateOption(optionDiv: HTMLElement, option: any): void {
    if (option.disabled) {
      optionDiv.setAttribute('aria-disabled', 'true')
    }
  }

  override _isOptionSelectedInitially(option: any): boolean {
    return this._selected.some((selected: any) => selected.value === option.value)
  }

  override _renderOptionContent(optionDiv: HTMLElement, option: any): void {
    if (this._isExternalSearch() && this._config.highlightOptionsOnSearch && this._search) {
      optionDiv.innerHTML = this._highlightOption(option.label)
    } else if (this._config.optionsTemplate && typeof this._config.optionsTemplate === 'function') {
      optionDiv.innerHTML = this._maybeSanitize(this._config.optionsTemplate(option))
    } else {
      optionDiv.textContent = option.label
    }
  }

  override _onOptionActivate(value: string, element: HTMLElement): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    const foundOption = this._findOptionByValue(value)

    if (foundOption) {
      this._selectOption(foundOption)
      this._inputElement.focus()
    }
  }

  _selectOption(option: any): void {
    this.deselectAll()

    if (this._selected.filter((selectedOption: any) => selectedOption.value === option.value).length === 0) {
      this._selected.push(option)
    }

    this._syncOptionElementState(option.value, true)

    this._triggerChangeEvent(option)

    this._inputElement.value = option.label

    if (this._config.showHints) {
      this._inputHintElement.value = ''
    }

    this.hide()

    if (this._config.clearSearchOnSelect) {
      this.search('')
    }

    this._updateCleaner()
  }

  _deselectOption(value: any): void {
    this._selected = this._selected.filter((option: any) => option.value !== value)

    this._syncOptionElementState(value, false)
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

  _updateOptionsList(options: any[] = this._options): void {
    for (const option of options) {
      if (Array.isArray(option.options)) {
        this._updateOptionsList(option.options)
        continue
      }

      if (option.selected) {
        this._selectOption(option)
      }
    }
  }

  override _decorateFilteredOption(option: HTMLElement): void {
    if (this._config.highlightOptionsOnSearch && !this._config.optionsTemplate) {
      option.innerHTML = this._highlightOption(option.textContent!)
    }
  }

  override _afterFilter(visibleOptions: number): void {
    if (visibleOptions > 0 || this._config.searchNoResultsLabel) {
      this._syncNoResultsPlaceholder(visibleOptions)
      return
    }

    this.hide()
  }

  override _configAfterMerge(config: any): any {
    config = this._normalizeContainerConfig(config)

    if (typeof config.options === 'string') {
      config.options = config.options.split(/,\s*/).map(String)
    }

    if (typeof config.search === 'string') {
      config.search = config.search.split(/,\s*/).map(String)
    }

    return config
  }

  // Static

  static autocompleteInterface(element: string | Element | null, config?: any): void {
    const data: any = Autocomplete.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(this: any, config: any): any {
    return this.each(function (this: HTMLElement) {
      Autocomplete.autocompleteInterface(this, config)
    })
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

      const relatedTarget: any = { relatedTarget: context._element }

      if (event.type === 'click') {
        relatedTarget.clickEvent = event
      }

      context.hide()
      context.search('')
      if (context._config.allowOnlyDefinedOptions && context._selected.length === 0) {
        context._inputElement.value = ''
      }
    }
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const autocomplete of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) {
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

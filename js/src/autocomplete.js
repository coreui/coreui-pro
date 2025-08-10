/**
 * --------------------------------------------------------------------------
 * CoreUI PRO autocomplete.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import * as Popper from '@popperjs/core'
import BaseComponent from './base-component.js'
import Data from './dom/data.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { DefaultAllowlist, sanitizeHtml } from './util/sanitizer.js'
import {
  defineJQueryPlugin,
  getNextActiveElement,
  getElement,
  getUID,
  isVisible,
  isRTL
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

const ARROW_UP_KEY = 'ArrowUp'
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
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_KEYUP = `keyup${EVENT_KEY}`
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_AUTOCOMPLETE = 'autocomplete'
const CLASS_NAME_BUTTONS = 'autocomplete-buttons'
const CLASS_NAME_CLEANER = 'autocomplete-cleaner'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_DROPDOWN = 'autocomplete-dropdown'
const CLASS_NAME_INDICATOR = 'autocomplete-indicator'
const CLASS_NAME_INPUT = 'autocomplete-input'
const CLASS_NAME_INPUT_HINT = 'autocomplete-input-hint'
const CLASS_NAME_INPUT_GROUP = 'autocomplete-input-group'
const CLASS_NAME_LABEL = 'label'
const CLASS_NAME_OPTGROUP = 'autocomplete-optgroup'
const CLASS_NAME_OPTGROUP_LABEL = 'autocomplete-optgroup-label'
const CLASS_NAME_OPTION = 'autocomplete-option'
const CLASS_NAME_OPTIONS = 'autocomplete-options'
const CLASS_NAME_OPTIONS_EMPTY = 'autocomplete-options-empty'
const CLASS_NAME_SELECTED = 'selected'
const CLASS_NAME_SHOW = 'show'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="autocomplete"]:not(.disabled)'
const SELECTOR_DATA_TOGGLE_SHOWN = `.autocomplete:not(.disabled).${CLASS_NAME_SHOW}`
const SELECTOR_INDICATOR = '.autocomplete-indicator'
const SELECTOR_OPTGROUP = '.autocomplete-optgroup'
const SELECTOR_OPTION = '.autocomplete-option'
const SELECTOR_OPTIONS = '.autocomplete-options'
const SELECTOR_OPTIONS_EMPTY = '.autocomplete-options-empty'
const SELECTOR_VISIBLE_ITEMS = '.autocomplete-options .autocomplete-option:not(.disabled):not(:disabled)'

const Default = {
  allowList: DefaultAllowlist,
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

const DefaultType = {
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

class Autocomplete extends BaseComponent {
  constructor(element, config) {
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
    this._popper = null
    this._search = ''

    this._createAutocomplete()
    this._addEventListeners()

    Data.set(this._element, DATA_KEY, this)
  }

  // Getters

  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  static get NAME() {
    return NAME
  }

  // Public

  toggle() {
    return this._isShown() ? this.hide() : this.show()
  }

  show() {
    if (this._config.disabled || this._isShown()) {
      return
    }

    if (
      !this._config.searchNoResultsLabel &&
      this._flattenOptions().filter(option => option.label.toLowerCase().includes(this._search.toLowerCase())).length === 0) {
      return
    }

    EventHandler.trigger(this._element, EVENT_SHOW)
    this._element.classList.add(CLASS_NAME_SHOW)
    this._inputElement.setAttribute('aria-expanded', 'true')

    if (this._config.container) {
      this._menu.style.minWidth = `${this._element.offsetWidth}px`
      this._menu.classList.add(CLASS_NAME_SHOW)
    }

    EventHandler.trigger(this._element, EVENT_SHOWN)

    this._createPopper()
  }

  hide() {
    EventHandler.trigger(this._element, EVENT_HIDE)

    if (this._popper) {
      this._popper.destroy()
    }

    this._element.classList.remove(CLASS_NAME_SHOW)
    this._inputElement.setAttribute('aria-expanded', 'false')

    if (this._config.container) {
      this._menu.classList.remove(CLASS_NAME_SHOW)
    }

    if (this._inputHintElement) {
      this._inputHintElement.value = ''
    }

    EventHandler.trigger(this._element, EVENT_HIDDEN)
  }

  dispose() {
    if (this._popper) {
      this._popper.destroy()
    }

    super.dispose()
  }

  clear() {
    this.deselectAll()
    this.search('')
    this._filterOptionsList()
    this._inputElement.value = ''

    EventHandler.trigger(this._element, EVENT_CHANGED, {
      value: this._selected
    })
  }

  search(label) {
    this._search = label.length > 0 ? label.toLowerCase() : ''
    if (!this._isExternalSearch()) {
      this._filterOptionsList()
    }

    EventHandler.trigger(this._element, EVENT_INPUT, {
      value: label
    })
  }

  update(config) {
    if (config.value) {
      this.deselectAll()
    }

    this._config = { ...this._config, ...this._configAfterMerge(config) }
    this._options = this._getOptionsFromConfig()
    this._optionsElement.innerHTML = ''
    this._createOptions(this._optionsElement, this._options)
  }

  deselectAll(options = this._selected) {
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

  _flattenOptions(options = this._options, flat = []) {
    for (const opt of options) {
      if (opt && Array.isArray(opt.options)) {
        this._flattenOptions(opt.options, flat)
        continue
      }

      flat.push(opt)
    }

    return flat
  }

  _getClassNames() {
    return this._element.classList.value.split(' ')
  }

  _highlightOption(label) {
    const regex = new RegExp(this._search, 'gi')
    return label.replace(regex, string => `<strong>${string}</strong>`)
  }

  _isExternalSearch() {
    return Array.isArray(this._config.search) && this._config.search.includes('external')
  }

  _isGlobalSearch() {
    return Array.isArray(this._config.search) && this._config.search.includes('global')
  }

  _isVisible(element) {
    const style = window.getComputedStyle(element)
    return (style.display !== 'none')
  }

  _isShown() {
    return this._element.classList.contains(CLASS_NAME_SHOW)
  }

  // Private

  _addEventListeners() {
    EventHandler.on(this._element, EVENT_CLICK, event => {
      if (!this._config.disabled && !event.target.closest(SELECTOR_INDICATOR)) {
        this.show()
      }
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, event => {
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

    EventHandler.on(this._menu, EVENT_KEYDOWN, event => {
      if (this._isGlobalSearch() && (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY)) {
        this._inputElement.focus()
      }
    })

    EventHandler.on(this._togglerElement, EVENT_KEYDOWN, event => {
      if (!this._isShown() && (event.key === ENTER_KEY || event.key === ARROW_DOWN_KEY)) {
        event.preventDefault()
        this.show()
        return
      }

      if (this._isShown() && event.key === ARROW_DOWN_KEY) {
        event.preventDefault()
        this._selectMenuItem(event)
      }
    })

    EventHandler.on(this._indicatorElement, EVENT_CLICK, event => {
      event.preventDefault()
      this.toggle()
    })

    EventHandler.on(this._inputElement, EVENT_BLUR, () => {
      const options = this._flattenOptions().filter(option => option.label.toLowerCase().startsWith(this._inputElement.value.toLowerCase()))
      if (this._config.allowOnlyDefinedOptions && this._selected.length === 0 && options.length === 0) {
        this.clear()
      }
    })

    EventHandler.on(this._inputElement, EVENT_KEYDOWN, event => {
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
          EventHandler.trigger(this._element, EVENT_CHANGED, {
            value: this._inputElement.value
          })

          this.hide()

          if (this._config.clearSearchOnSelect) {
            this.search('')
          }
        }
      }
    })

    EventHandler.on(this._inputElement, EVENT_KEYUP, event => {
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
          EventHandler.trigger(this._element, EVENT_CHANGED, {
            value: this._selected
          })
        }
      }
    })

    EventHandler.on(this._optionsElement, EVENT_CLICK, event => {
      event.preventDefault()
      event.stopPropagation()
      this._onOptionsClick(event.target)
    })

    EventHandler.on(this._cleanerElement, EVENT_CLICK, event => {
      if (!this._config.disabled) {
        event.preventDefault()
        event.stopPropagation()
        this.clear()
      }
    })

    EventHandler.on(this._optionsElement, EVENT_KEYDOWN, event => {
      if (event.key === ENTER_KEY) {
        this._onOptionsClick(event.target)
      }

      if ([ARROW_UP_KEY, ARROW_DOWN_KEY].includes(event.key)) {
        event.preventDefault()
        this._selectMenuItem(event)
      }
    })
  }

  _getOptionsFromConfig(options = this._config.options) {
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

  _createAutocomplete() {
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

  _createInputGroup() {
    const togglerEl = document.createElement('div')
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
      inputHintEl.setAttribute('aria-hidden', true)

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

    if (this._config.disabled) {
      inputEl.setAttribute('disabled', true)
      inputEl.tabIndex = -1
    }

    if (this._config.required) {
      inputEl.setAttribute('required', true)
    }

    togglerEl.append(inputEl)
    this._inputElement = inputEl

    this._element.append(togglerEl)
  }

  _createButtons() {
    if (!this._config.cleaner && !this._config.indicator) {
      return
    }

    const buttons = document.createElement('div')
    buttons.classList.add(CLASS_NAME_BUTTONS)

    if (!this._config.disabled && this._config.cleaner) {
      const cleaner = document.createElement('button')
      cleaner.type = 'button'
      cleaner.classList.add(CLASS_NAME_CLEANER)
      cleaner.style.display = 'none'
      cleaner.setAttribute('aria-label', this._config.ariaCleanerLabel)

      buttons.append(cleaner)
      this._cleanerElement = cleaner
    }

    if (this._config.indicator) {
      const indicator = document.createElement('button')
      indicator.type = 'button'
      indicator.classList.add(CLASS_NAME_INDICATOR)
      indicator.setAttribute('aria-label', this._config.ariaIndicatorLabel)

      if (this._config.disabled) {
        indicator.tabIndex = -1
      }

      buttons.append(indicator)
      this._indicatorElement = indicator
      this._indicatorElement = indicator
    }

    this._togglerElement.append(buttons)
    this._updateCleaner()
  }

  _createPopper() {
    if (typeof Popper === 'undefined') {
      throw new TypeError('CoreUI\'s Auto Complete component require Popper (https://popper.js.org)')
    }

    const popperConfig = {
      modifiers: [{
        name: 'preventOverflow',
        options: {
          boundary: 'clippingParents'
        }
      },
      {
        name: 'offset',
        options: {
          offset: [0, 2]
        }
      }],
      placement: isRTL() ? 'bottom-end' : 'bottom-start'
    }

    this._popper = Popper.createPopper(this._togglerElement, this._menu, popperConfig)
  }

  _createOptionsContainer() {
    const dropdownDiv = document.createElement('div')
    dropdownDiv.classList.add(CLASS_NAME_DROPDOWN)
    dropdownDiv.role = 'listbox'
    dropdownDiv.setAttribute('aria-labelledby', this._uniqueId)
    dropdownDiv.setAttribute('id', `${this._uniqueId}-listbox`)

    const optionsDiv = document.createElement('div')
    optionsDiv.classList.add(CLASS_NAME_OPTIONS)

    if (this._config.optionsMaxHeight !== 'auto') {
      optionsDiv.style.maxHeight = `${this._config.optionsMaxHeight}px`
      optionsDiv.style.overflow = 'auto'
    }

    dropdownDiv.append(optionsDiv)

    const { container } = this._config
    if (container) {
      this._inputElement.setAttribute('aria-owns', `${this._uniqueId}-listbox`)
      dropdownDiv.id = `${this._uniqueId}-listbox`
      container.append(dropdownDiv)
    } else {
      this._element.append(dropdownDiv)
    }

    this._createOptions(optionsDiv, this._options)
    this._optionsElement = optionsDiv
    this._menu = dropdownDiv
  }

  _createOptions(parentElement, options) {
    for (const option of options) {
      if (Array.isArray(option.options)) {
        const optgroup = document.createElement('div')
        optgroup.classList.add(CLASS_NAME_OPTGROUP)
        optgroup.setAttribute('role', 'group')

        const optgrouplabel = document.createElement('div')
        if (this._config.optionsGroupsTemplate && typeof this._config.optionsGroupsTemplate === 'function') {
          optgrouplabel.innerHTML = this._config.sanitize ?
            sanitizeHtml(this._config.optionsGroupsTemplate(option), this._config.allowList, this._config.sanitizeFn) :
            this._config.optionsGroupsTemplate(option)
        } else {
          optgrouplabel.textContent = option.label
        }

        optgrouplabel.classList.add(CLASS_NAME_OPTGROUP_LABEL)
        optgroup.append(optgrouplabel)

        this._createOptions(optgroup, option.options)
        parentElement.append(optgroup)

        continue
      }

      const optionDiv = document.createElement('div')
      optionDiv.classList.add(CLASS_NAME_OPTION)

      if (option.disabled) {
        optionDiv.classList.add(CLASS_NAME_DISABLED)
        optionDiv.setAttribute('aria-disabled', 'true')
      }

      optionDiv.dataset.value = option.value
      optionDiv.tabIndex = 0
      if (this._isExternalSearch() && this._config.highlightOptionsOnSearch && this._search) {
        optionDiv.innerHTML = this._highlightOption(option.label)
      } else if (this._config.optionsTemplate && typeof this._config.optionsTemplate === 'function') {
        optionDiv.innerHTML = this._config.sanitize ?
          sanitizeHtml(this._config.optionsTemplate(option), this._config.allowList, this._config.sanitizeFn) :
          this._config.optionsTemplate(option)
      } else {
        optionDiv.textContent = option.label
      }

      parentElement.append(optionDiv)
    }
  }

  _onOptionsClick(element) {
    if (element.classList.contains(CLASS_NAME_LABEL)) {
      return
    }

    if (!element.classList.contains(CLASS_NAME_OPTION)) {
      element = element.closest(SELECTOR_OPTION)

      if (!element) {
        return
      }
    }

    const { value } = element.dataset
    const foundOption = this._findOptionByValue(value)

    if (foundOption) {
      this._selectOption(foundOption)
      this._inputElement.focus()
    }
  }

  _findOptionByValue(value, options = this._options) {
    for (const option of options) {
      if (option.value === value) {
        return option
      }

      if (option.options && Array.isArray(option.options)) {
        const found = this._findOptionByValue(value, option.options)
        if (found) {
          return found
        }
      }
    }

    return null
  }

  _selectOption(option) {
    this.deselectAll()

    if (this._selected.filter(selectedOption => selectedOption.value === option.value).length === 0) {
      this._selected.push(option)
    }

    const foundOption = SelectorEngine.findOne(`[data-value="${option.value}"]`, this._optionsElement)
    if (foundOption) {
      foundOption.classList.add(CLASS_NAME_SELECTED)
      foundOption.setAttribute('aria-selected', true)
    }

    EventHandler.trigger(this._element, EVENT_CHANGED, {
      value: option
    })

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

  _deselectOption(value) {
    this._selected = this._selected.filter(option => option.value !== value)

    const option = SelectorEngine.findOne(`[data-value="${value}"]`, this._optionsElement)
    if (option) {
      option.classList.remove(CLASS_NAME_SELECTED)
      option.setAttribute('aria-selected', false)
    }

    // EventHandler.trigger(this._element, EVENT_CHANGED, {
    //   value: this._selected
    // })
  }

  _updateCleaner() {
    if (!this._config.cleaner || this._cleanerElement === null) {
      return
    }

    if (this._selected.length > 0) {
      this._cleanerElement.style.removeProperty('display')
      return
    }

    this._cleanerElement.style.display = 'none'
  }

  _updateOptionsList(options = this._options) {
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

  _filterOptionsList() {
    const options = SelectorEngine.find(SELECTOR_OPTION, this._menu)
    let visibleOptions = 0

    for (const option of options) {
      // eslint-disable-next-line unicorn/prefer-includes
      if (option.textContent.toLowerCase().indexOf(this._search) === -1) {
        option.style.display = 'none'
      } else {
        if (this._config.highlightOptionsOnSearch && !this._config.optionsTemplate) {
          option.innerHTML = this._highlightOption(option.textContent)
        }

        option.style.removeProperty('display')
        visibleOptions++
      }

      const optgroup = option.closest(SELECTOR_OPTGROUP)
      if (optgroup) {
        // eslint-disable-next-line  unicorn/prefer-array-some
        if (SelectorEngine.children(optgroup, SELECTOR_OPTION).filter(element => this._isVisible(element)).length > 0) {
          optgroup.style.removeProperty('display')
        } else {
          optgroup.style.display = 'none'
        }
      }
    }

    if (visibleOptions > 0) {
      if (SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._menu)) {
        SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._menu).remove()
      }

      return
    }

    if (visibleOptions === 0) {
      if (this._config.searchNoResultsLabel) {
        const placeholder = document.createElement('div')
        placeholder.classList.add(CLASS_NAME_OPTIONS_EMPTY)
        placeholder.innerHTML = this._config.searchNoResultsLabel

        if (!SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._menu)) {
          SelectorEngine.findOne(SELECTOR_OPTIONS, this._menu).append(placeholder)
        }

        return
      }

      this.hide()
    }
  }

  _selectMenuItem({ key, target }) {
    const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter(element => isVisible(element))

    if (!items.length) {
      return
    }

    // if target isn't included in items (e.g. when expanding the dropdown)
    // allow cycling to get the last item in case key equals ARROW_UP_KEY
    getNextActiveElement(items, target, key === ARROW_DOWN_KEY, !items.includes(target)).focus()
  }

  _configAfterMerge(config) {
    if (config.container === true) {
      config.container = document.body
    }

    if (typeof config.container === 'object' || typeof config.container === 'string') {
      config.container = getElement(config.container)
    }

    if (typeof config.options === 'string') {
      config.options = config.options.split(/,\s*/).map(String)
    }

    if (typeof config.search === 'string') {
      config.search = config.search.split(/,\s*/).map(String)
    }

    return config
  }

  // Static

  static autocompleteInterface(element, config) {
    const data = Autocomplete.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(config) {
    return this.each(function () {
      Autocomplete.autocompleteInterface(this, config)
    })
  }

  static clearMenus(event) {
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

      if (
        composedPath.includes(context._element)
      ) {
        continue
      }

      const relatedTarget = { relatedTarget: context._element }

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

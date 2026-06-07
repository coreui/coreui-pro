/* eslint-disable max-lines */

/**
 * --------------------------------------------------------------------------
 * CoreUI PRO multi-select.js
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

const NAME = 'multi-select'
const DATA_KEY = 'coreui.multi-select'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const ARROW_UP_KEY = 'ArrowUp'
const ARROW_DOWN_KEY = 'ArrowDown'
const BACKSPACE_KEY = 'Backspace'
const DELETE_KEY = 'Delete'
const ENTER_KEY = 'Enter'
const ESCAPE_KEY = 'Escape'
const SPACE_KEY = ' '
const TAB_KEY = 'Tab'
const RIGHT_MOUSE_BUTTON = 2 // MouseEvent.button value for the secondary button, usually the right button

const SELECTOR_CLEANER = '.form-multi-select-cleaner'
const SELECTOR_OPTGROUP = '.form-multi-select-optgroup'
const SELECTOR_OPTION = '.form-multi-select-option'
const SELECTOR_OPTIONS = '.form-multi-select-options'
const SELECTOR_OPTIONS_EMPTY = '.form-multi-select-options-empty'
const SELECTOR_SEARCH = '.form-multi-select-search'
const SELECTOR_DATA_MULTI_SELECT = '[data-coreui-multi-select]'
// TODO: remove the class-based selector in v6, use the data attribute instead
const SELECTOR_SELECT = 'select.form-multi-select'
const SELECTOR_SELECTION = '.form-multi-select-selection'
const SELECTOR_TAG = '.form-multi-select-tag'
const SELECTOR_TAG_DELETE = '.form-multi-select-tag-delete'
const SELECTOR_VISIBLE_ITEMS = '.form-multi-select-options .form-multi-select-option:not(.disabled):not(:disabled)'
const SELECTOR_NAVIGABLE_ITEMS = `.form-multi-select-all:not(.disabled):not(:disabled), ${SELECTOR_VISIBLE_ITEMS}, .form-multi-select-options .form-multi-select-optgroup-label-with-checkbox`

const EVENT_CHANGED = `changed${EVENT_KEY}`
const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_KEYUP = `keyup${EVENT_KEY}`
const EVENT_SEARCH = `search${EVENT_KEY}`
const EVENT_SELECTION_LIMIT = `selectionLimit${EVENT_KEY}`
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_BUTTONS = 'form-multi-select-buttons'
const CLASS_NAME_CLEANER = 'form-multi-select-cleaner'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_DROPDOWN_HEADER = 'form-multi-select-dropdown-header'
const CLASS_NAME_INPUT_GROUP = 'form-multi-select-input-group'
const CLASS_NAME_LABEL = 'label'
const CLASS_NAME_SELECT = 'form-multi-select'
const CLASS_NAME_SELECT_DROPDOWN = 'form-multi-select-dropdown'
const CLASS_NAME_SELECT_ALL = 'form-multi-select-all'
const CLASS_NAME_SELECT_ALL_WITH_CHECKBOX = 'form-multi-select-all-with-checkbox'
const CLASS_NAME_OPTGROUP = 'form-multi-select-optgroup'
const CLASS_NAME_OPTGROUP_LABEL = 'form-multi-select-optgroup-label'
const CLASS_NAME_OPTGROUP_LABEL_WITH_CHECKBOX = 'form-multi-select-optgroup-label-with-checkbox'
const CLASS_NAME_OPTION = 'form-multi-select-option'
const CLASS_NAME_OPTION_WITH_CHECKBOX = 'form-multi-select-option-with-checkbox'
const CLASS_NAME_OPTIONS = 'form-multi-select-options'
const CLASS_NAME_OPTIONS_EMPTY = 'form-multi-select-options-empty'
const CLASS_NAME_SEARCH = 'form-multi-select-search'
const CLASS_NAME_SELECTED = 'form-multi-selected'
const CLASS_NAME_INDETERMINATE = 'form-multi-select-indeterminate'
const CLASS_NAME_SELECTION = 'form-multi-select-selection'
const CLASS_NAME_SELECTION_TAGS = 'form-multi-select-selection-tags'
const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_TAG = 'form-multi-select-tag'
const CLASS_NAME_TAG_DELETE = 'form-multi-select-tag-delete'

const Default = {
  allowList: DefaultAllowlist,
  ariaCleanerLabel: 'Clear all selections',
  ariaIndicatorLabel: 'Toggle visibility of options menu',
  ariaTagDeleteLabel: 'Remove',
  cleaner: true,
  clearSearchOnSelect: false,
  container: false,
  deselectAllLabel: 'Deselect all',
  deselectFilteredLabel: 'Deselect filtered',
  disabled: false,
  headerTemplate: null,
  id: null,
  invalid: false,
  multiple: true,
  name: null,
  options: false,
  optionsGroupsSelectable: false,
  optionsGroupsStyle: 'checkbox',
  optionsGroupsTemplate: null,
  optionsMaxHeight: 'auto',
  optionsStyle: 'checkbox',
  optionsTemplate: null,
  placeholder: 'Select...',
  required: false,
  sanitize: true,
  sanitizeFn: null,
  search: false,
  searchNoResultsLabel: 'No results found',
  selectAll: true,
  selectAllLabel: 'Select all',
  selectAllMode: 'all',
  selectAllStyle: 'checkbox',
  selectionLimit: null,
  selectionType: 'tags',
  selectionTypeCounterText: 'item(s) selected',
  selectFilteredLabel: 'Select filtered',
  valid: false,
  value: null
}

const DefaultType = {
  allowList: 'object',
  ariaCleanerLabel: 'string',
  ariaIndicatorLabel: 'string',
  ariaTagDeleteLabel: 'string',
  cleaner: 'boolean',
  clearSearchOnSelect: 'boolean',
  container: '(string|element|boolean)',
  deselectAllLabel: 'string',
  deselectFilteredLabel: 'string',
  disabled: 'boolean',
  headerTemplate: '(function|null)',
  id: '(string|null)',
  invalid: 'boolean',
  multiple: 'boolean',
  name: '(string|null)',
  options: '(boolean|array)',
  optionsGroupsSelectable: 'boolean',
  optionsGroupsStyle: 'string',
  optionsGroupsTemplate: '(function|null)',
  optionsMaxHeight: '(number|string)',
  optionsStyle: 'string',
  optionsTemplate: '(function|null)',
  placeholder: 'string',
  required: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  search: '(boolean|string)',
  searchNoResultsLabel: 'string',
  selectAll: 'boolean',
  selectAllStyle: 'string',
  selectAllLabel: 'string',
  selectAllMode: 'string',
  selectionLimit: '(number|null)',
  selectionType: 'string',
  selectionTypeCounterText: 'string',
  selectFilteredLabel: 'string',
  valid: 'boolean',
  value: '(string|array|null)'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class MultiSelect extends BaseComponent {
  constructor(element, config) {
    super(element, config)

    this._uniqueId = this._config.id || this._element.id || getUID(`${this.constructor.NAME}`)
    this._uniqueName = this._config.name || this._element.name || this._uniqueId
    this._configureNativeSelect()
    this._indicatorElement = null
    this._selectAllElement = null
    this._headerElement = null
    this._selectionElement = null
    this._selectionCleanerElement = null
    this._searchElement = null
    this._togglerElement = null
    this._optionsElement = null

    this._wrapperElement = null
    this._menu = null
    this._selected = []
    this._options = this._getOptions()
    this._popper = null
    this._search = ''

    if (this._config.options.length > 0) {
      this._createNativeOptions(this._element, this._config.options)
    }

    this._createSelect()
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

    EventHandler.trigger(this._element, EVENT_SHOW)
    this._wrapperElement.classList.add(CLASS_NAME_SHOW)
    this._togglerElement.setAttribute('aria-expanded', 'true')

    if (this._config.container) {
      this._menu.style.minWidth = `${this._wrapperElement.offsetWidth}px`
      this._menu.classList.add(CLASS_NAME_SHOW)
    }

    EventHandler.trigger(this._element, EVENT_SHOWN)

    this._createPopper()

    if (this._config.search) {
      SelectorEngine.findOne(SELECTOR_SEARCH, this._wrapperElement).focus()
    }
  }

  hide() {
    EventHandler.trigger(this._element, EVENT_HIDE)

    const refocusFromInside = this._wrapperElement.contains(document.activeElement) ||
      this._menu.contains(document.activeElement)

    if (this._popper) {
      this._popper.destroy()
    }

    if (this._config.search) {
      this._searchElement.value = ''
    }

    this._onSearchChange(this._searchElement)
    this._wrapperElement.classList.remove(CLASS_NAME_SHOW)
    this._togglerElement.setAttribute('aria-expanded', 'false')

    if (this._config.container) {
      this._menu.classList.remove(CLASS_NAME_SHOW)
    }

    if (refocusFromInside && !this._config.disabled) {
      const refocusTarget = this._config.search ? this._searchElement : this._togglerElement
      if (refocusTarget) {
        refocusTarget.focus()
      }
    }

    EventHandler.trigger(this._element, EVENT_HIDDEN)
  }

  dispose() {
    if (this._popper) {
      this._popper.destroy()
    }

    for (const element of [
      this._wrapperElement,
      this._menu,
      this._selectionElement,
      this._togglerElement,
      this._searchElement,
      this._indicatorElement,
      this._selectAllElement,
      this._headerElement,
      this._optionsElement
    ]) {
      if (element) {
        EventHandler.off(element, EVENT_KEY)
      }
    }

    if (this._menu) {
      this._menu.remove()
    }

    if (this._wrapperElement) {
      this._wrapperElement.before(this._element)
      this._wrapperElement.remove()
    }

    this._element.removeAttribute('tabindex')

    super.dispose()
  }

  search(text) {
    this._search = text.length > 0 ? text.toLowerCase() : text
    this._filterOptionsList()
    EventHandler.trigger(this._element, EVENT_SEARCH)
  }

  update(config) {
    if (config.value) {
      this.deselectAll()
    }

    this._config = { ...this._config, ...this._configAfterMerge(config) }
    this._selected = []
    this._options = this._getOptions()
    this._menu.remove()
    this._wrapperElement.before(this._element)
    this._wrapperElement.remove()
    this._element.innerHTML = ''
    this._createNativeOptions(this._element, this._options)
    this._createSelect()
    this._addEventListeners()
  }

  selectAll(options = this._options) {
    const limitReached = this._selectAllOptions(options)
    this._refreshAfterSelectionChange()

    if (limitReached) {
      this._triggerSelectionLimit()
    }
  }

  deselectAll(options = this._options) {
    this._deselectAllOptions(options)
    this._refreshAfterSelectionChange()
  }

  selectFiltered() {
    const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu)
      .filter(element => this._isOptionDisplayed(element))

    let limitReached = false
    for (const item of items) {
      if (this._isSelectionLimitReached()) {
        limitReached = true
        break
      }

      const value = String(item.dataset.value)
      const option = this._findOptionByValue(value)
      if (option && !this._selected.some(selected => selected.value === value)) {
        this._selectOption(value, option.text, { refresh: false })
      }
    }

    this._refreshAfterSelectionChange()

    if (limitReached) {
      this._triggerSelectionLimit()
    }
  }

  deselectFiltered() {
    const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu)
      .filter(element => this._isOptionDisplayed(element))

    for (const item of items) {
      const value = String(item.dataset.value)
      if (this._selected.some(selected => selected.value === value)) {
        this._deselectOption(value, { refresh: false })
      }
    }

    this._refreshAfterSelectionChange()
  }

  getValue() {
    return this._selected
  }

  // Private

  _addEventListeners() {
    EventHandler.on(this._selectionElement, EVENT_CLICK, SELECTOR_TAG_DELETE, event => {
      event.preventDefault()
      event.stopPropagation()

      const tag = event.target.closest(SELECTOR_TAG)
      if (tag) {
        this._deselectOption(String(tag.dataset.value))
      }
    })

    EventHandler.on(this._togglerElement, EVENT_CLICK, SELECTOR_CLEANER, event => {
      if (!this._config.disabled) {
        event.preventDefault()
        event.stopPropagation()
        this.deselectAll()
      }
    })

    EventHandler.on(this._wrapperElement, EVENT_CLICK, () => {
      if (!this._config.disabled) {
        this.show()
      }
    })

    EventHandler.on(this._wrapperElement, EVENT_KEYDOWN, event => {
      if (event.key === ESCAPE_KEY) {
        this.hide()
        return
      }

      if (this._config.search === 'global' && (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY)) {
        this._searchElement.focus()
      }
    })

    EventHandler.on(this._menu, EVENT_KEYDOWN, event => {
      if (this._config.search === 'global' && (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY)) {
        this._searchElement.focus()
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

    // Validation focuses the overlay select; hand its keystrokes to the custom control.
    EventHandler.on(this._element, EVENT_KEYDOWN, event => {
      if (event.key === TAB_KEY || event.key === ESCAPE_KEY) {
        return
      }

      // Suppress the native select's own keyboard behavior (typeahead, value change).
      event.preventDefault()

      const isPrintable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey

      if (!this._isShown() && (event.key === ENTER_KEY || event.key === ARROW_DOWN_KEY || (this._config.search && isPrintable))) {
        this.show()
      }

      if (this._config.search) {
        this._searchElement.focus()

        // The keystroke can't be retargeted mid-event, so inject the character that
        // would otherwise be lost and start filtering on this first press.
        if (isPrintable) {
          this._searchElement.value += event.key
          this._onSearchChange(this._searchElement)
        }
      } else {
        this._togglerElement.focus()
      }
    })

    EventHandler.on(this._indicatorElement, EVENT_CLICK, event => {
      event.preventDefault()
      event.stopPropagation()
      this.toggle()
    })

    EventHandler.on(this._searchElement, EVENT_KEYUP, () => {
      this._onSearchChange(this._searchElement)
    })

    EventHandler.on(this._searchElement, EVENT_KEYDOWN, event => {
      if ((!this._isShown() && event.key.length === 1 && !event.ctrlKey && !event.metaKey) || event.key === ARROW_DOWN_KEY) {
        this.show()
      }

      if (event.key === ARROW_DOWN_KEY && this._searchElement.value.length === this._searchElement.selectionStart) {
        this._selectMenuItem(event)
        return
      }

      if ((event.key === BACKSPACE_KEY || event.key === DELETE_KEY) && event.target.value.length === 0) {
        this._deselectLastOption()
      }

      this._searchElement.focus()
    })

    if (this._selectAllElement) {
      EventHandler.on(this._selectAllElement, EVENT_CLICK, event => {
        if (this._selectAllElement.disabled) {
          return
        }

        event.preventDefault()
        event.stopPropagation()

        this._toggleSelectAll()
      })

      // The select all button lives in the header, outside the options list, so it
      // needs its own arrow-key handler to join the navigation flow (Enter/Space
      // already toggle via the native button click above).
      EventHandler.on(this._selectAllElement, EVENT_KEYDOWN, event => {
        if ([ARROW_UP_KEY, ARROW_DOWN_KEY].includes(event.key)) {
          event.preventDefault()
          this._selectMenuItem(event)
        }
      })
    }

    EventHandler.on(this._optionsElement, EVENT_CLICK, event => {
      event.preventDefault()
      event.stopPropagation()
      this._onOptionsClick(event.target)
    })

    EventHandler.on(this._optionsElement, EVENT_KEYDOWN, event => {
      if (event.key === ENTER_KEY || event.key === SPACE_KEY) {
        // Space would otherwise scroll the options list.
        event.preventDefault()
        this._onOptionsClick(event.target)
      }

      if ([ARROW_UP_KEY, ARROW_DOWN_KEY].includes(event.key)) {
        event.preventDefault()
        this._selectMenuItem(event)
      }
    })
  }

  _getOptions() {
    if (this._config.options) {
      return this._getOptionsFromConfig()
    }

    return this._getOptionsFromElement()
  }

  _getOptionsFromConfig(options = this._config.options) {
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

      const value = String(option.value)
      const isSelected = option.selected || (this._config.value && this._config.value.includes(value))
      const shouldSelect = isSelected && !this._isSelectionLimitReached()

      const customProperties = typeof option === 'object' ? { ...option } : {}

      delete customProperties.value
      delete customProperties.selected
      delete customProperties.disabled

      _options.push({
        ...customProperties,
        value,
        ...shouldSelect && { selected: true },
        ...option.disabled && { disabled: true }
      })

      if (shouldSelect) {
        this._selected.push({
          value: String(option.value),
          text: option.text
        })
      }
    }

    return _options
  }

  _getOptionsFromElement(node = this._element) {
    const nodes = Array.from(node.childNodes).filter(element => element.nodeName === 'OPTION' || element.nodeName === 'OPTGROUP')
    const options = []

    for (const node of nodes) {
      if (node.nodeName === 'OPTION' && node.value) {
        const value = String(node.value)
        const text = node.textContent
        const isSelected = node.selected || (this._config.value && this._config.value.includes(node.value))
        const shouldSelect = isSelected && !this._isSelectionLimitReached()
        options.push({
          value,
          text,
          selected: shouldSelect,
          disabled: node.disabled
        })

        node.selected = shouldSelect

        if (shouldSelect) {
          this._selected.push({
            value,
            text: node.textContent,
            ...node.disabled && { disabled: true }
          })
        }
      }

      if (node.nodeName === 'OPTGROUP') {
        options.push({
          label: node.label,
          options: this._getOptionsFromElement(node)
        })
      }
    }

    return options
  }

  _configureNativeSelect() {
    this._element.classList.add(CLASS_NAME_SELECT)

    if (this._config.multiple) {
      this._element.setAttribute('multiple', true)
    }

    if (this._config.required) {
      this._element.setAttribute('required', true)
    }
  }

  _createNativeOptions(parentElement, options) {
    for (const option of options) {
      if ((typeof option.options === 'undefined')) {
        const opt = document.createElement('OPTION')
        opt.value = option.value

        if (option.disabled === true) {
          opt.setAttribute('disabled', 'disabled')
        }

        if (option.selected === true) {
          opt.setAttribute('selected', 'selected')
        }

        opt.textContent = option.text
        parentElement.append(opt)
      } else {
        const optgroup = document.createElement('optgroup')
        optgroup.label = option.label
        this._createNativeOptions(optgroup, option.options)
        parentElement.append(optgroup)
      }
    }
  }

  _hideNativeSelect() {
    this._element.tabIndex = '-1'
  }

  _createSelect() {
    const wrapper = document.createElement('div')
    wrapper.classList.add(CLASS_NAME_SELECT)
    wrapper.classList.toggle('is-invalid', this._config.invalid)
    wrapper.classList.toggle('is-valid', this._config.valid)

    if (this._config.disabled) {
      this._element.classList.add(CLASS_NAME_DISABLED)
    }

    for (const className of this._element.classList.value.split(' ')) {
      wrapper.classList.add(className)
    }

    this._wrapperElement = wrapper
    // The wrapper takes the native select's place, then the select moves inside it
    // as an invisible overlay so native `required` validation anchors over the control.
    this._element.parentNode.insertBefore(wrapper, this._element)
    wrapper.prepend(this._element)
    this._createSelection()
    this._createButtons()

    if (this._config.search) {
      this._createSearchInput()
      this._updateSearch()
    }

    this._element.setAttribute('id', this._uniqueId)
    this._element.setAttribute('name', this._uniqueName)

    this._createOptionsContainer()
    this._hideNativeSelect()
    this._updateOptionsList()
  }

  _createSelection() {
    const togglerEl = document.createElement('div')
    togglerEl.classList.add(CLASS_NAME_INPUT_GROUP)
    togglerEl.setAttribute('role', 'combobox')
    togglerEl.setAttribute('aria-expanded', 'false')
    togglerEl.setAttribute('aria-haspopup', 'listbox')
    togglerEl.setAttribute('aria-controls', `${this._uniqueId}-listbox`)
    this._togglerElement = togglerEl

    if (this._config.disabled) {
      togglerEl.setAttribute('aria-disabled', 'true')
    }

    if (!this._config.search && !this._config.disabled) {
      togglerEl.tabIndex = 0
    }

    const selectionEl = document.createElement('div')
    selectionEl.classList.add(CLASS_NAME_SELECTION)
    selectionEl.setAttribute('aria-live', 'polite')

    if (this._config.multiple && this._config.selectionType === 'tags') {
      selectionEl.classList.add(CLASS_NAME_SELECTION_TAGS)
    }

    togglerEl.append(selectionEl)
    this._wrapperElement.append(togglerEl)

    this._updateSelection()
    this._selectionElement = selectionEl
  }

  _createButtons() {
    const buttons = document.createElement('div')
    buttons.classList.add(CLASS_NAME_BUTTONS)

    const indicator = document.createElement('button')
    indicator.type = 'button'
    indicator.classList.add('form-multi-select-indicator')
    indicator.setAttribute('aria-label', this._config.ariaIndicatorLabel)

    if (this._config.disabled) {
      indicator.tabIndex = -1
    }

    buttons.append(indicator)

    this._indicatorElement = indicator
    this._togglerElement.append(buttons)
    this._updateSelectionCleaner()
  }

  _createSelectionCleaner() {
    const cleaner = document.createElement('button')
    cleaner.type = 'button'
    cleaner.classList.add(CLASS_NAME_CLEANER)
    cleaner.setAttribute('aria-label', this._config.ariaCleanerLabel)

    return cleaner
  }

  _createPopper() {
    if (typeof Popper === 'undefined') {
      throw new TypeError('CoreUI\'s multi select require Popper (https://popper.js.org)')
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

  _createSearchInput() {
    const input = document.createElement('input')
    input.classList.add(CLASS_NAME_SEARCH)

    if (this._config.disabled) {
      input.disabled = true
    }

    input.setAttribute('id', `search-${this._uniqueId}`)
    input.setAttribute('name', `search-${this._uniqueName}`)

    this._searchElement = input
    this._updateSearchSize()

    this._selectionElement.append(input)
  }

  _createOptionsContainer() {
    const dropdownDiv = document.createElement('div')
    dropdownDiv.classList.add(CLASS_NAME_SELECT_DROPDOWN)

    const hasHeaderTemplate = typeof this._config.headerTemplate === 'function'
    const showSelectAll = this._config.selectAll && this._config.multiple

    if (hasHeaderTemplate || showSelectAll) {
      const header = document.createElement('div')
      header.classList.add(CLASS_NAME_DROPDOWN_HEADER)

      if (hasHeaderTemplate) {
        const headerContent = document.createElement('div')

        // Keep interactions with custom controls from closing the dropdown,
        // mirroring the built-in button's stopPropagation behavior.
        EventHandler.on(headerContent, EVENT_CLICK, event => {
          event.stopPropagation()
        })

        this._headerElement = headerContent
        header.append(headerContent)
      } else {
        const selectAllButton = document.createElement('button')
        selectAllButton.type = 'button'
        selectAllButton.classList.add(CLASS_NAME_SELECT_ALL)

        if (this._config.selectAllStyle === 'checkbox' && this._config.multiple) {
          selectAllButton.classList.add(CLASS_NAME_SELECT_ALL_WITH_CHECKBOX)
        }

        this._selectAllElement = selectAllButton
        header.append(selectAllButton)
      }

      dropdownDiv.append(header)
    }

    const optionsDiv = document.createElement('div')
    optionsDiv.classList.add(CLASS_NAME_OPTIONS)
    optionsDiv.setAttribute('role', 'listbox')
    optionsDiv.setAttribute('id', `${this._uniqueId}-listbox`)

    if (this._config.multiple) {
      optionsDiv.setAttribute('aria-multiselectable', 'true')
    }

    if (this._config.optionsMaxHeight !== 'auto') {
      optionsDiv.style.maxHeight = `${this._config.optionsMaxHeight}px`
      optionsDiv.style.overflow = 'auto'
    }

    dropdownDiv.append(optionsDiv)

    const { container } = this._config
    if (container) {
      container.append(dropdownDiv)
    } else {
      this._wrapperElement.append(dropdownDiv)
    }

    this._createOptions(optionsDiv, this._options)
    this._optionsElement = optionsDiv
    this._menu = dropdownDiv
    this._updateHeader()
    this._updateGroupsState()
    this._updateMasterCheckbox()
  }

  _createOptions(parentElement, options) {
    for (const option of options) {
      if (typeof option.value !== 'undefined') {
        const optionDiv = document.createElement('div')
        optionDiv.classList.add(CLASS_NAME_OPTION)

        if (option.disabled) {
          optionDiv.classList.add(CLASS_NAME_DISABLED)
        }

        if (this._config.optionsStyle === 'checkbox') {
          optionDiv.classList.add(CLASS_NAME_OPTION_WITH_CHECKBOX)
        }

        optionDiv.dataset.value = String(option.value)
        optionDiv.tabIndex = 0
        optionDiv.setAttribute('role', 'option')
        optionDiv.setAttribute('aria-selected', option.selected === true ? 'true' : 'false')

        if (this._config.optionsTemplate && typeof this._config.optionsTemplate === 'function') {
          optionDiv.innerHTML = this._config.sanitize ?
            sanitizeHtml(this._config.optionsTemplate(option), this._config.allowList, this._config.sanitizeFn) :
            this._config.optionsTemplate(option)
        } else {
          optionDiv.textContent = option.text
        }

        parentElement.append(optionDiv)
      }

      if (typeof option.label !== 'undefined') {
        const optgroup = document.createElement('div')
        optgroup.classList.add(CLASS_NAME_OPTGROUP)

        const optgrouplabel = document.createElement('div')

        if (this._config.optionsGroupsTemplate && typeof this._config.optionsGroupsTemplate === 'function') {
          optgrouplabel.innerHTML = this._config.sanitize ?
            sanitizeHtml(this._config.optionsGroupsTemplate(option), this._config.allowList, this._config.sanitizeFn) :
            this._config.optionsGroupsTemplate(option)
        } else {
          optgrouplabel.textContent = option.label
        }

        optgrouplabel.classList.add(CLASS_NAME_OPTGROUP_LABEL)

        if (this._config.optionsGroupsSelectable && this._config.optionsGroupsStyle === 'checkbox' && this._config.multiple) {
          optgrouplabel.classList.add(CLASS_NAME_OPTGROUP_LABEL_WITH_CHECKBOX)
          optgrouplabel.tabIndex = 0
          optgrouplabel.setAttribute('role', 'button')
        }

        optgroup.append(optgrouplabel)

        this._createOptions(optgroup, option.options)
        parentElement.append(optgroup)
      }
    }
  }

  _createTag(value, text, disabled) {
    const tag = document.createElement('div')
    tag.classList.add(CLASS_NAME_TAG)
    tag.dataset.value = value
    tag.textContent = text

    if (!this._config.disabled && disabled !== true) {
      const closeBtn = document.createElement('button')
      closeBtn.type = 'button'
      closeBtn.classList.add(CLASS_NAME_TAG_DELETE)
      closeBtn.setAttribute('aria-label', `${this._config.ariaTagDeleteLabel} ${text}`.trim())

      tag.append(closeBtn)
    }

    return tag
  }

  _updateTags(selection, search) {
    const placeholder = SelectorEngine.findOne('.form-multi-select-placeholder', selection)
    if (placeholder) {
      placeholder.remove()
    }

    const existingTags = new Map()

    for (const tag of SelectorEngine.children(selection, SELECTOR_TAG)) {
      existingTags.set(tag.dataset.value, tag)
    }

    const selectedValues = new Set(this._selected.map(option => String(option.value)))

    for (const [value, tag] of existingTags) {
      if (!selectedValues.has(value)) {
        tag.remove()
        existingTags.delete(value)
      }
    }

    for (const option of this._selected) {
      const value = String(option.value)
      const tag = existingTags.get(value) || this._createTag(option.value, option.text, option.disabled)

      if (search) {
        search.before(tag)
      } else {
        selection.append(tag)
      }
    }
  }

  _onOptionsClick(element) {
    if (this._config.optionsGroupsSelectable) {
      const groupLabel = element.closest(`.${CLASS_NAME_OPTGROUP_LABEL_WITH_CHECKBOX}`)
      if (groupLabel) {
        this._toggleGroup(groupLabel.closest(SELECTOR_OPTGROUP))
        return
      }
    }

    if (element.classList.contains(CLASS_NAME_LABEL)) {
      return
    }

    if (!element.classList.contains(CLASS_NAME_OPTION)) {
      element = element.closest(SELECTOR_OPTION)

      if (!element) {
        return
      }
    }

    const value = String(element.dataset.value)
    const { text } = this._findOptionByValue(value)

    if (this._config.multiple && element.classList.contains(CLASS_NAME_SELECTED)) {
      this._deselectOption(value)
    } else if (this._config.multiple && !element.classList.contains(CLASS_NAME_SELECTED)) {
      this._selectOption(value, text)
    } else if (!this._config.multiple) {
      this._selectOption(value, text)
    }

    if (!this._config.multiple) {
      this.hide()
      this.search('')
      this._searchElement.value = null
    }

    if (this._config.clearSearchOnSelect && this._config.search) {
      this.search('')
      this._searchElement.value = null
      this._searchElement.focus()
    }
  }

  _findOptionByValue(value, options = this._options) {
    for (const option of options) {
      if (String(option.value) === value) {
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

  _selectAllOptions(options) {
    for (const option of options) {
      if (option.disabled) {
        continue
      }

      if (option.label) {
        if (this._selectAllOptions(option.options)) {
          return true
        }

        continue
      }

      if (this._isSelectionLimitReached()) {
        return true
      }

      this._selectOption(option.value, option.text, { refresh: false })
    }

    return false
  }

  _deselectAllOptions(options) {
    for (const option of options) {
      if (option.disabled) {
        continue
      }

      if (option.label) {
        this._deselectAllOptions(option.options)
        continue
      }

      this._deselectOption(option.value, { refresh: false })
    }
  }

  _selectOption(value, text, { refresh = true } = {}) {
    if (!this._config.multiple) {
      this.deselectAll()
    }

    const isSelected = this._selected.some(option => option.value === String(value))

    if (!isSelected && this._isSelectionLimitReached()) {
      this._triggerSelectionLimit()
      return
    }

    if (!isSelected) {
      this._selected.push({
        value: String(value),
        text
      })
    }

    const nativeOption = SelectorEngine.findOne(`option[value="${CSS.escape(value)}"]`, this._element)

    if (nativeOption) {
      nativeOption.selected = true
    }

    const option = SelectorEngine.findOne(`[data-value="${CSS.escape(value)}"]`, this._optionsElement)
    if (option) {
      option.classList.add(CLASS_NAME_SELECTED)
      option.setAttribute('aria-selected', 'true')
    }

    EventHandler.trigger(this._element, EVENT_CHANGED, {
      value: this._selected
    })

    // During init every preselected option runs through here while `_selected` is
    // already fully populated, so callers can batch the costly DOM refresh into a
    // single `_refreshAfterSelectionChange()` instead of repeating it per option.
    if (refresh) {
      this._refreshAfterSelectionChange()
    }
  }

  _deselectOption(value, { refresh = true } = {}) {
    this._selected = this._selected.filter(option => option.value !== String(value))

    const nativeOption = SelectorEngine.findOne(`option[value="${CSS.escape(value)}"]`, this._element)
    if (nativeOption) {
      nativeOption.selected = false
    }

    const option = SelectorEngine.findOne(`[data-value="${CSS.escape(value)}"]`, this._optionsElement)
    if (option) {
      option.classList.remove(CLASS_NAME_SELECTED)
      option.setAttribute('aria-selected', 'false')
    }

    EventHandler.trigger(this._element, EVENT_CHANGED, {
      value: this._selected
    })

    if (refresh) {
      this._refreshAfterSelectionChange()
    }
  }

  _deselectLastOption() {
    if (this._selected.length > 0) {
      const last = this._selected.findLast(option => option.disabled !== true)
      if (last) {
        this._deselectOption(last.value)
      }
    }
  }

  _refreshAfterSelectionChange() {
    this._updateSelection()
    this._updateSelectionCleaner()
    this._updateSearch()
    this._updateSearchSize()
    this._updateHeader()
    this._updateGroupsState()
    this._updateMasterCheckbox()
  }

  _toggleGroup(optgroupEl) {
    if (!optgroupEl) {
      return
    }

    const items = SelectorEngine.children(optgroupEl, SELECTOR_OPTION)
      .filter(element => !element.classList.contains(CLASS_NAME_DISABLED))
    const allSelected = items.length > 0 && items.every(element => element.classList.contains(CLASS_NAME_SELECTED))

    let limitReached = false
    for (const item of items) {
      const value = String(item.dataset.value)

      if (allSelected) {
        this._deselectOption(value, { refresh: false })
      } else if (!item.classList.contains(CLASS_NAME_SELECTED)) {
        if (this._isSelectionLimitReached()) {
          limitReached = true
          break
        }

        const option = this._findOptionByValue(value)
        if (option) {
          this._selectOption(value, option.text, { refresh: false })
        }
      }
    }

    this._refreshAfterSelectionChange()

    if (limitReached) {
      this._triggerSelectionLimit()
    }
  }

  _updateOptionsList() {
    // `_selected` is already fully populated by `_getOptions()` before this runs,
    // so iterate it directly (no tree walk) and batch the DOM refresh into one call.
    for (const option of this._selected) {
      this._selectOption(option.value, option.text, { refresh: false })
    }

    this._refreshAfterSelectionChange()
  }

  _updateSelection() {
    const selection = SelectorEngine.findOne(SELECTOR_SELECTION, this._wrapperElement)
    const search = SelectorEngine.findOne(SELECTOR_SEARCH, this._wrapperElement)

    if (this._selected.length === 0 && !this._config.search) {
      const placeholder = document.createElement('span')
      placeholder.classList.add('form-multi-select-placeholder')
      placeholder.textContent = this._config.placeholder
      selection.innerHTML = ''
      selection.append(placeholder)
      return
    }

    if (this._config.multiple && this._config.selectionType === 'counter' && !this._config.search) {
      selection.textContent = `${this._selected.length} ${this._config.selectionTypeCounterText}`
    }

    if (this._config.multiple && this._config.selectionType === 'tags') {
      this._updateTags(selection, search)
    }

    if (this._config.multiple && this._config.selectionType === 'text') {
      selection.innerHTML = ''

      for (const [index, option] of this._selected.entries()) {
        const span = document.createElement('span')
        span.textContent = `${option.text}${index === this._selected.length - 1 ? '' : ','}\u00A0`
        selection.append(span)
      }
    }

    if (!this._config.multiple && this._selected.length > 0 && !this._config.search) {
      selection.textContent = this._selected[0].text
    }

    if (search) {
      selection.append(search)
    }

    if (this._popper) {
      this._popper.update()
    }
  }

  _updateSelectionCleaner() {
    if (!this._config.cleaner || this._config.disabled) {
      return
    }

    if (this._selected.length > 0 && this._selectionCleanerElement === null) {
      const buttons = SelectorEngine.findOne(`.${CLASS_NAME_BUTTONS}`, this._wrapperElement)
      const selectionCleaner = this._createSelectionCleaner()

      buttons.insertBefore(selectionCleaner, this._indicatorElement)
      this._selectionCleanerElement = selectionCleaner
      return
    }

    if (this._selected.length === 0 && this._selectionCleanerElement !== null) {
      this._selectionCleanerElement.remove()
      this._selectionCleanerElement = null
    }
  }

  _updateSearch() {
    if (!this._config.search) {
      return
    }

    // Select single

    if (!this._config.multiple && this._selected.length > 0) {
      this._searchElement.placeholder = this._selected[0].text
      return
    }

    if (!this._config.multiple && this._selected.length === 0) {
      this._searchElement.placeholder = this._config.placeholder
      return
    }

    // Select multiple

    if (this._config.multiple && this._selected.length > 0 && this._config.selectionType !== 'counter') {
      this._searchElement.removeAttribute('placeholder')
      return
    }

    if (this._config.multiple && this._selected.length === 0) {
      this._searchElement.placeholder = this._config.placeholder
      return
    }

    if (this._config.multiple && this._config.selectionType === 'counter') {
      this._searchElement.placeholder = `${this._selected.length} ${this._config.selectionTypeCounterText}`
    }
  }

  _updateSearchSize(size = 2) {
    if (!this._searchElement || !this._config.multiple) {
      return
    }

    if (this._selected.length > 0 && (this._config.selectionType === 'tags' || this._config.selectionType === 'text')) {
      this._searchElement.size = size
      return
    }

    if (this._selected.length === 0 && (this._config.selectionType === 'tags' || this._config.selectionType === 'text')) {
      this._searchElement.removeAttribute('size')
    }
  }

  _updateHeader() {
    if (this._headerElement) {
      this._renderHeader()
      return
    }

    if (!this._selectAllElement) {
      return
    }

    this._selectAllElement.textContent = this._getSelectAllLabel()
  }

  _getSelectAllLabel() {
    const allSelected = this._isAllSelected()

    if (this._isFilteredScopeNarrowed()) {
      return allSelected ? this._config.deselectFilteredLabel : this._config.selectFilteredLabel
    }

    return allSelected ? this._config.deselectAllLabel : this._config.selectAllLabel
  }

  _isAllSelected() {
    const { selected, total } = this._getSelectAllScope()
    const target = this._getSelectableTarget(total)
    return target > 0 && selected >= target
  }

  _getSelectAllScope() {
    const { selected, total, filtered, filteredSelected } = this._getSelectionState()
    return this._config.selectAllMode === 'filtered' ?
      { selected: filteredSelected, total: filtered } :
      { selected, total }
  }

  _isFilteredScopeNarrowed() {
    if (this._config.selectAllMode !== 'filtered') {
      return false
    }

    const { filtered, total } = this._getSelectionState()
    return filtered < total
  }

  _toggleSelectAll() {
    const filteredMode = this._config.selectAllMode === 'filtered'

    if (this._isAllSelected()) {
      if (filteredMode) {
        this.deselectFiltered()
      } else {
        this.deselectAll()
      }

      return
    }

    if (filteredMode) {
      this.selectFiltered()
    } else {
      this.selectAll()
    }
  }

  _getSelectableTarget(total) {
    return this._hasSelectionLimit() ? Math.min(total, this._config.selectionLimit) : total
  }

  _getCheckboxState(selected, total) {
    if (total > 0 && selected >= total) {
      return 'all'
    }

    return selected === 0 ? 'none' : 'indeterminate'
  }

  _applyCheckboxState(element, state) {
    element.classList.toggle(CLASS_NAME_SELECTED, state === 'all')
    element.classList.toggle(CLASS_NAME_INDETERMINATE, state === 'indeterminate')
  }

  _updateGroupsState() {
    if (!this._config.optionsGroupsSelectable) {
      return
    }

    for (const optgroup of SelectorEngine.find(`.${CLASS_NAME_OPTGROUP}`, this._menu)) {
      const label = SelectorEngine.findOne(`.${CLASS_NAME_OPTGROUP_LABEL_WITH_CHECKBOX}`, optgroup)
      if (!label) {
        continue
      }

      const items = SelectorEngine.children(optgroup, SELECTOR_OPTION)
        .filter(element => !element.classList.contains(CLASS_NAME_DISABLED))
      const selected = items.filter(element => element.classList.contains(CLASS_NAME_SELECTED)).length
      this._applyCheckboxState(label, this._getCheckboxState(selected, items.length))
    }
  }

  _updateMasterCheckbox() {
    if (this._config.selectAllStyle !== 'checkbox' || !this._selectAllElement) {
      return
    }

    const { selected, total } = this._getSelectAllScope()
    this._applyCheckboxState(this._selectAllElement, this._getCheckboxState(selected, this._getSelectableTarget(total)))
  }

  _renderHeader() {
    if (!this._headerElement || typeof this._config.headerTemplate !== 'function') {
      return
    }

    const result = this._config.headerTemplate(this._getSelectionState(), this._getSelectionActions())

    if (result instanceof Node) {
      this._headerElement.replaceChildren(result)
    } else {
      this._headerElement.innerHTML = this._config.sanitize ?
        sanitizeHtml(result, this._config.allowList, this._config.sanitizeFn) :
        result
    }
  }

  _getSelectionState() {
    const allItems = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu)
    const filteredItems = allItems.filter(element => this._isOptionDisplayed(element))

    return {
      selected: this._selected.length,
      total: allItems.length,
      filtered: filteredItems.length,
      filteredSelected: filteredItems.filter(element => element.classList.contains(CLASS_NAME_SELECTED)).length
    }
  }

  _getSelectionActions() {
    return {
      selectAll: () => this.selectAll(),
      deselectAll: () => this.deselectAll(),
      selectFiltered: () => this.selectFiltered(),
      deselectFiltered: () => this.deselectFiltered()
    }
  }

  _onSearchChange(element) {
    if (element) {
      this.search(element.value)

      this._updateSearchSize(element.value.length + 1)
    }
  }

  // Checks only `display` (unlike the imported `isVisible`) so it still works while
  // the menu is closed, e.g. when called from the constructor.
  _isOptionDisplayed(element) {
    const style = window.getComputedStyle(element)
    return (style.display !== 'none')
  }

  _isShown() {
    return this._wrapperElement.classList.contains(CLASS_NAME_SHOW)
  }

  _hasSelectionLimit() {
    return this._config.multiple && this._config.selectionLimit !== null
  }

  _isSelectionLimitReached() {
    return this._hasSelectionLimit() && this._selected.length >= this._config.selectionLimit
  }

  _triggerSelectionLimit() {
    EventHandler.trigger(this._element, EVENT_SELECTION_LIMIT, {
      selectionLimit: this._config.selectionLimit
    })
  }

  _filterOptionsList() {
    const options = SelectorEngine.find(SELECTOR_OPTION, this._menu)
    let visibleOptions = 0

    for (const option of options) {
      // eslint-disable-next-line unicorn/prefer-includes
      if (option.textContent.toLowerCase().indexOf(this._search) === -1) {
        option.style.display = 'none'
      } else {
        option.style.removeProperty('display')
        visibleOptions++
      }

      const optgroup = option.closest(SELECTOR_OPTGROUP)
      if (optgroup) {
        // eslint-disable-next-line  unicorn/prefer-array-some
        if (SelectorEngine.children(optgroup, SELECTOR_OPTION).filter(element => this._isOptionDisplayed(element)).length > 0) {
          optgroup.style.removeProperty('display')
        } else {
          optgroup.style.display = 'none'
        }
      }
    }

    this._updateHeader()
    this._updateMasterCheckbox()

    if (visibleOptions > 0) {
      if (SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._menu)) {
        SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._menu).remove()
      }

      return
    }

    if (visibleOptions === 0) {
      const placeholder = document.createElement('div')
      placeholder.classList.add(CLASS_NAME_OPTIONS_EMPTY)
      placeholder.setAttribute('role', 'status')
      placeholder.textContent = this._config.searchNoResultsLabel

      if (!SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._menu)) {
        SelectorEngine.findOne(SELECTOR_OPTIONS, this._menu).append(placeholder)
      }
    }
  }

  _selectMenuItem({ key, target }) {
    const items = SelectorEngine.find(SELECTOR_NAVIGABLE_ITEMS, this._menu).filter(element => isVisible(element))

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

    if (typeof config.value === 'number') {
      config.value = [String(config.value)]
    }

    if (typeof config.value === 'string') {
      config.value = config.value.split(/,\s*/).map(String)
    }

    return config
  }

  // Static

  static multiSelectInterface(element, config) {
    const data = MultiSelect.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(config) {
    return this.each(function () {
      MultiSelect.multiSelectInterface(this, config)
    })
  }

  static clearMenus(event) {
    if (event && (event.button === RIGHT_MOUSE_BUTTON ||
      (event.type === 'keyup' && event.key !== TAB_KEY))) {
      return
    }

    const selects = SelectorEngine.find(SELECTOR_SELECT)

    for (let i = 0, len = selects.length; i < len; i++) {
      const context = Data.get(selects[i], DATA_KEY)
      const relatedTarget = {
        relatedTarget: selects[i]
      }

      if (event && event.type === 'click') {
        relatedTarget.clickEvent = event
      }

      if (!context) {
        continue
      }

      if (!context._wrapperElement.classList.contains(CLASS_NAME_SHOW)) {
        continue
      }

      if (context._wrapperElement.contains(event.target)) {
        continue
      }

      context.hide()

      EventHandler.trigger(context._element, EVENT_HIDDEN)
    }
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  const elements = new Set([
    ...SelectorEngine.find(SELECTOR_DATA_MULTI_SELECT),
    ...SelectorEngine.find(SELECTOR_SELECT)
  ])

  for (const ms of elements) {
    if (ms.tabIndex !== -1) {
      MultiSelect.multiSelectInterface(ms)
    }
  }
})
EventHandler.on(document, EVENT_CLICK_DATA_API, MultiSelect.clearMenus)
EventHandler.on(document, EVENT_KEYUP_DATA_API, MultiSelect.clearMenus)

/**
 * jQuery
 */

defineJQueryPlugin(MultiSelect)

export default MultiSelect

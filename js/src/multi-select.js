/**
 * --------------------------------------------------------------------------
 * CoreUI PRO (v3.4.0): multi-select.js
 * Licens (https://coreui.io/pro/license)
 * --------------------------------------------------------------------------
 */

import {
  getjQuery,
  typeCheckConfig
} from './util/index'
import Data from './dom/data'
import EventHandler from './dom/event-handler'
import Manipulator from './dom/manipulator'
import SelectorEngine from './dom/selector-engine'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'mutli-select'
const VERSION = '3.4.0-alpha.0'
const DATA_KEY = 'coreui.mutli-select'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const TAB_KEY = 'Tab'
const RIGHT_MOUSE_BUTTON = 2

const SELECTOR_INPUT = '.c-multi-select-search'
const SELECTOR_OPTGROUP = '.c-multi-select-optgroup'
const SELECTOR_OPTION = '.c-multi-select-option'
const SELECTOR_OPTIONS = '.c-multi-select-options'
const SELECTOR_OPTIONS_EMPTY = '.c-multi-select-options-empty'
const SELECTOR_SELECT = '.c-multi-select'
const SELECTOR_SELECTED = '.c-multi-selected'
const SELECTOR_SELECTION = '.c-multi-select-selection'
const SELECTOR_SELECTION_CLEANER = '.c-multi-select-selection-cleaner'

const EVENT_CHANGED = `changed${EVENT_KEY}`
const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_KEYUP = `keyup${EVENT_KEY}`
const EVENT_SEARCH = `search${EVENT_KEY}`
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `showN${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_SELECT = 'c-multi-select'
const CLASS_NAME_SELECT_INLINE = 'c-multi-select-inline'
const CLASS_NAME_SELECT_MULTIPLE = 'c-multi-select-multiple'
const CLASS_NAME_OPTGROUP = 'c-multi-select-optgroup'
const CLASS_NAME_OPTGROUP_LABEL = 'c-multi-select-optgroup-label'
const CLASS_NAME_OPTION = 'c-multi-select-option'
const CLASS_NAME_OPTIONS = 'c-multi-select-options'
const CLASS_NAME_OPTIONS_EMPTY = 'c-multi-select-options-empty'
const CLASS_NAME_SEARCH = 'c-multi-select-search'
const CLASS_NAME_SELECTED = 'c-multi-selected'
const CLASS_NAME_SELECTION = 'c-multi-select-selection'
const CLASS_NAME_SELECTION_CLEANER = 'c-multi-select-selection-cleaner'
const CLASS_NAME_SELECTION_TAGS = 'c-multi-select-selection-tags'
const CLASS_NAME_SHOW = 'c-show'
const CLASS_NAME_TAG = 'c-multi-select-tag'
const CLASS_NAME_TAG_DELETE = 'c-multi-select-tag-delete'

const CLASS_NAME_LABEL = 'c-label'

const Default = {
  inline: false,
  multiple: true,
  options: false,
  optionsEmptyPlaceholder: 'no items',
  search: false,
  searchPlaceholder: 'Select...',
  selection: true,
  selectionType: 'counter',
  selectionTypeCounterText: 'item(s) selected',
  selected: []
}

const DefaultType = {
  inline: 'boolean',
  multiple: 'boolean',
  options: '(boolean|array)',
  optionsEmptyPlaceholder: 'string',
  search: 'boolean',
  searchPlaceholder: 'string',
  selection: 'boolean',
  selectionType: 'string',
  selectionTypeCounterText: 'string',
  selected: 'array'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class MultiSelect {
  constructor(element, config) {
    this._element = element
    this._selectionElement = null
    this._selectionCleanerElement = null
    this._searchElement = null
    this._optionsElement = null
    this._config = this._getConfig(config)
    this._clone = null
    this._optionss = this._getOptions()
    this._search = ''
    this._selection = this._getSelectedOptions(this._optionss)
    this._options = {}

    if (this._config.options.length > 0) {
      this._createNativeSelect(this._config.options)
    }

    this._createSelect()
    this._addEventListeners()
    Data.setData(this._element, DATA_KEY, this)
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  // Public

  update(config) { // public method
    this._getConfig(config)
  }

  dispose() {
    Data.removeData(this._element, DATA_KEY)
    this._element = null
  }

  //

  show() {
    EventHandler.trigger(this._element, EVENT_SHOW)
    this._clone.classList.add(CLASS_NAME_SHOW)

    if (this._config.search) {
      SelectorEngine.findOne(SELECTOR_INPUT, this._clone).focus()
    }

    EventHandler.trigger(this._element, EVENT_SHOWN)
  }

  hide() {
    EventHandler.trigger(this._element, EVENT_HIDE)
    this._clone.classList.remove(CLASS_NAME_SHOW)
    EventHandler.trigger(this._element, EVENT_HIDDEN)
  }

  search(text) {
    this._search = text.length > 0 ? text.toLowerCase() : text
    this._filterOptionsList()
    EventHandler.trigger(this._element, EVENT_SEARCH)
  }

  // Private

  _addEventListeners() {
    EventHandler.on(this._clone, EVENT_CLICK, () => {
      this.show()
    })

    EventHandler.on(this._searchElement, EVENT_KEYUP, () => {
      this._onSearchChange(this._searchElement)
    })

    EventHandler.on(this._searchElement, EVENT_KEYDOWN, event => {
      const key = event.keyCode || event.charCode

      if ((key === 8 || key === 46) && event.target.value.length === 0) {
        this._selectionDeleteLast()
      }
    })

    EventHandler.on(this._optionsElement, EVENT_CLICK, event => {
      event.preventDefault()
      event.stopPropagation()
      this._onOptionsClick(event.target)
    })

    EventHandler.on(this._selectionCleanerElement, EVENT_CLICK, event => {
      event.preventDefault()
      event.stopPropagation()
      this._selectionClear()
      this._updateSelection()
      // this._updateSelectionCleaner()
      this._updateSearch()
      this._updateSearchSize()
    })

    EventHandler.on(this._optionsElement, EVENT_KEYDOWN, event => {
      const key = event.keyCode || event.charCode

      if (key === 13) {
        this._onOptionsClick(event.target)
        SelectorEngine.findOne(SELECTOR_INPUT, this._clone).focus()
      }
    })
  }

  _getConfig(config, update) {
    if (update !== true) {
      config = {
        ...this.constructor.Default,
        ...Manipulator.getDataAttributes(this._element),
        ...config
      }
    }

    typeCheckConfig(
      NAME,
      config,
      this.constructor.DefaultType
    )

    return config
  }

  _getOptions(node = this._element) {
    if (this._config.options) {
      return this._config.options
    }

    const nodes = Array.from(node.childNodes).filter(element => element.nodeName === 'OPTION' || element.nodeName === 'OPTGROUP')
    const options = []

    nodes.forEach(node => {
      if (node.nodeName === 'OPTION') {
        options.push({
          value: node.value,
          text: node.outerText,
          selected: node.selected
        })
      }

      if (node.nodeName === 'OPTGROUP') {
        options.push({
          label: node.label,
          options: this._getOptions(node)
        })
      }
    })

    return options
  }

  _getSelectedOptions(options) {
    const selected = []

    options.forEach(e => {
      if (typeof e.value === "undefined") {
        this._getSelectedOptions(e.options)
        return
      }

      if (e.selected) {
        // Add only the last option if single select
        if (!this._config.multiple) {
          selected.length = 0
        }

        selected.push({
          value: String(e.value),
          text: e.text
        })
      }
    })

    return selected
  }

  _createNativeSelect(data) {
    const select = document.createElement('select')
    select.classList.add(CLASS_NAME_SELECT)
    if (this._element.id) {
      select.id = this._element.id
    }

    if (this._config.multiple) {
      select.multiple = true
    }

    this._createNativeOptions(select, data)

    this._element.parentNode.replaceChild(select, this._element)
    this._element = select
  }

  _createNativeOptions(parentElement, options) {
    options.forEach(option => {
      // eslint-disable-next-line no-negated-condition
      if ((typeof option.options !== 'undefined')) {
        const optgroup = document.createElement('optgroup')
        optgroup.label = option.label
        this._createNativeOptions(optgroup, option.options)
        parentElement.append(optgroup)
      } else {
        const opt = document.createElement('OPTION')
        opt.value = option.value
        if (option.selected === true) {
          opt.selected = true
        }

        opt.innerHTML = option.text
        parentElement.append(opt)
      }
    })
  }

  _hideNativeSelect() {
    this._element.tabIndex = '-1'
    this._element.style.display = 'none'
  }

  _createSelect() {
    const div = document.createElement('div')
    div.classList.add(CLASS_NAME_SELECT)

    if (this._config.multiple) {
      div.classList.add(CLASS_NAME_SELECT_MULTIPLE)
    }

    if (this._config.inline) {
      div.classList.add(CLASS_NAME_SELECT_INLINE)
    }

    if (this._config.selectionType === 'tags') {
      div.classList.add(CLASS_NAME_SELECTION_TAGS)
    }

    this._clone = div
    this._element.parentNode.insertBefore(div, this._element.nextSibling)
    if (!this._config.inline || (this._config.inline && this._config.selection)) {
      this._createSelection()
      // this._createSelectionCleaner()
    }

    if (this._config.search) {
      this._createSearchInput()
      this._updateSearch()
    }

    this._createOptionsContainer()
    this._hideNativeSelect()
    this._updateOptionsList()
  }

  _createSelection() {
    const span = document.createElement('span')
    span.classList.add(CLASS_NAME_SELECTION)
    this._clone.append(span)

    this._updateSelection()
    this._selectionElement = span
  }

  _createSelectionCleaner() {
    const cleaner = document.createElement('span')
    cleaner.classList.add(CLASS_NAME_SELECTION_CLEANER)
    cleaner.innerHTML = '&times;'
    this._clone.append(cleaner)

    // this._updateSelectionCleaner()
    this._selectionCleanerElement = cleaner
  }

  _createSearchInput() {
    const input = document.createElement('input')
    input.classList.add(CLASS_NAME_SEARCH)

    this._searchElement = input
    this._updateSearchSize()

    this._clone.append(input)
  }

  _createOptionsContainer() {
    const div = document.createElement('div')
    div.classList.add(CLASS_NAME_OPTIONS)
    this._clone.append(div)

    this._createOptions(div, this._optionss)
    this._optionsElement = div
  }

  _createOptions(parentElement, options) {
    options.forEach(option => {
      if (typeof option.value !== 'undefined') {
        const optionDiv = document.createElement('div')
        optionDiv.classList.add(CLASS_NAME_OPTION)
        optionDiv.dataset.value = String(option.value)
        optionDiv.tabIndex = 0
        optionDiv.innerHTML = option.text
        parentElement.append(optionDiv)
      }

      if (typeof option.label !== 'undefined') {
        const optgroup = document.createElement('div')
        optgroup.classList.add(CLASS_NAME_OPTGROUP)

        const optgrouplabel = document.createElement('div')
        optgrouplabel.innerHTML = option.label
        optgrouplabel.classList.add(CLASS_NAME_OPTGROUP_LABEL)
        optgroup.append(optgrouplabel)

        this._createOptions(optgroup, option.options)
        parentElement.append(optgroup)
      }
    })
  }

  _createTag(value, text) {
    const tag = document.createElement('span')
    tag.classList.add(CLASS_NAME_TAG)
    tag.dataset.value = value
    tag.innerHTML = text

    const closeBtn = document.createElement('span')
    closeBtn.classList.add(CLASS_NAME_TAG_DELETE, 'close')
    closeBtn.setAttribute('aria-label', 'Close')
    closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>'

    tag.append(closeBtn)

    // TODO: zastanowić się czy nie zrobić tego globalnie
    EventHandler.on(closeBtn, EVENT_CLICK, event => {
      event.preventDefault()
      event.stopPropagation()

      tag.remove()
      this._selectionDelete(value)
      this._updateOptionsList()
      this._updateSearch()
    })

    return tag
  }

  _onOptionsClick(element) {
    if (!element.classList.contains(CLASS_NAME_OPTION) || element.classList.contains(CLASS_NAME_LABEL)) {
      return
    }

    const value = String(element.dataset.value)
    const text = element.textContent

    if (this._config.multiple && element.classList.contains(CLASS_NAME_SELECTED)) {
      this._selectionDelete(value)
    } else if (this._config.multiple && !element.classList.contains(CLASS_NAME_SELECTED)) {
      this._selectionAdd(value, text)
    } else if (!this._config.multiple) {
      this._selectionAdd(value, text)
    }

    this._updateSelection()
    // this._updateSelectionCleaner()
    this._updateSearch()
    this._updateSearchSize()
  }

  _selectionAdd(value, text) {
    if (!this._config.multiple) {
      this._selectionClear()
    }

    if (this._selection.filter(e => e.value === value).length === 0) {
      this._selection.push({
        value,
        text
      })
    }

    this._selectOption(value)
  }

  _selectionClear() {
    this._selection.length = 0
    this._clearOptions()
  }

  _selectionDelete(value) {
    const selected = this._selection.filter(e => e.value !== value)
    this._selection = selected
    this._unSelectOption(value)
  }

  _selectionDeleteLast() {
    if (this._selection.length > 0) {
      const last = this._selection.pop()
      this._selectionDelete(last.value)
      this._updateSelection()
      // this._updateSelectionCleaner()
      this._updateSearch()
    }
  }
  // .c-multi-select-selections

  _updateSelection() {
    if (this._config.inline && !this._config.selection) {
      return
    }

    const selection = SelectorEngine.findOne(SELECTOR_SELECTION, this._clone)

    if (this._config.multiple && this._config.selectionType === 'counter') {
      selection.innerHTML = `${this._selection.length} ${this._config.selectionTypeCounterText}`
      return
    }

    if (this._config.multiple && this._config.selectionType === 'tags') {
      selection.innerHTML = ''
      this._selection.forEach(e => {
        selection.append(this._createTag(e.value, e.text))
      })
      return
    }

    if (this._config.multiple && this._config.selectionType === 'text') {
      selection.innerHTML = this._selection.map(e => e.text).join(', ')
      return
    }

    if (this._selection.length > 0) {
      selection.innerHTML = this._selection[0].text
    }
  }

  _updateSelectionCleaner() {
    if (this._selectionCleanerElement === null) {
      return
    }

    const selectionCleaner = SelectorEngine.findOne(SELECTOR_SELECTION_CLEANER, this._clone)

    if (this._selection.length > 0) {
      selectionCleaner.style.removeProperty('display')
      return
    }

    selectionCleaner.style.display = 'none'
  }

  _updateSearch() {
    if (!this._config.search) {
      return
    }

    if (this._selection.length === 0 && (this._config.selectionType === 'tags' || this._config.selectionType === 'text')) {
      this._searchElement.removeAttribute('size')
    }

    if (this._selection.length > 0 && !this._config.multiple && !this._config.inline) {
      this._searchElement.placeholder = this._selection[0].text
      this._selectionElement.style.display = 'none'
      return
    }

    if (this._selection.length > 0 && this._config.multiple && this._config.selectionType !== 'counter' && !this._config.inline) {
      this._searchElement.placeholder = ''
      this._selectionElement.style.removeProperty('display')
      return
    }

    if (this._selection.length === 0 && this._config.multiple && !this._config.inline) {
      this._searchElement.placeholder = this._config.searchPlaceholder
      this._selectionElement.style.display = 'none'
      return
    }

    if (this._config.multiple && this._config.selectionType === 'counter' && !this._config.inline) {
      this._searchElement.placeholder = `${this._selection.length} item(s) selected`
      this._selectionElement.style.display = 'none'
      return
    }

    if (this._config.inline) {
      this._searchElement.placeholder = this._config.searchPlaceholder
    }
  }

  _updateSearchSize(size = 2) {
    if (!this._config.inline && this._selection.length > 0 && (this._config.selectionType === 'tags' || this._config.selectionType === 'text')) {
      this._searchElement.size = size
      return
    }

    if (this._selection.length === 0 && (this._config.selectionType === 'tags' || this._config.selectionType === 'text')) {
      this._searchElement.removeAttribute('size')
    }
  }

  // .c-multi-select-selections

  _selectOption(value) {
    SelectorEngine.findOne(`option[value="${value}"]`, this._element).selected = true

    // TODO: improve this solution
    const option = SelectorEngine.findOne(`[data-value="${value}"]`, this._optionsElement)
    if (option) {
      option.classList.add(CLASS_NAME_SELECTED)
    }

    EventHandler.trigger(this._element, EVENT_CHANGED, {
      value: this._selection
    })
  }

  _unSelectOption(value) {
    SelectorEngine.findOne(`option[value="${value}"]`, this._element).selected = false

    // TODO: improve this solution
    const option = SelectorEngine.findOne(`[data-value="${value}"]`, this._optionsElement)
    if (option) {
      option.classList.remove(CLASS_NAME_SELECTED)
    }

    EventHandler.trigger(this._element, EVENT_CHANGED, {
      value: this._selection
    })
  }

  _clearOptions() {
    this._element.value = null
    SelectorEngine.find(SELECTOR_SELECTED, this._clone).forEach(element => {
      element.classList.remove(CLASS_NAME_SELECTED)
    })
  }

  // TODO: poprawić tą nazwę
  _onSearchChange(element) {
    if (element) {
      this.search(element.value)

      this._updateSearchSize(element.value.length + 1)
    }
  }

  _updateOptionsList() {
    const options = SelectorEngine.find(SELECTOR_OPTION, this._clone)

    options.forEach(option => {
      if (this._selection.filter(e => e.value === option.dataset.value).length !== 0) {
        option.classList.add(CLASS_NAME_SELECTED)
      }

      if (this._selection.filter(e => e.value === option.dataset.value).length === 0) {
        option.classList.remove(CLASS_NAME_SELECTED)
      }
    })
  }

  _isHidden(element) {
    return element.offsetParent === null
  }

  _isVisible(element) {
    const style = window.getComputedStyle(element)
    return (style.display !== 'none')
  }

  _filterOptionsList() {
    const options = SelectorEngine.find(SELECTOR_OPTION, this._clone)
    let visibleOptions = 0

    options.forEach(option => {
      if (option.textContent.toLowerCase().indexOf(this._search) === -1) {
        option.style.display = 'none'
      } else {
        option.style.removeProperty('display')
        visibleOptions++
      }

      const optgroup = option.closest(SELECTOR_OPTGROUP)
      if (optgroup) {
        if (SelectorEngine.children(optgroup, SELECTOR_OPTION).filter(element => this._isVisible(element)).length > 0) {
          optgroup.style.removeProperty('display')
        } else {
          optgroup.style.display = 'none'
        }
      }
    })

    if (visibleOptions > 0) {
      if (SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._clone)) {
        SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._clone).remove()
      }

      return
    }

    if (visibleOptions === 0) {
      const placeholder = document.createElement('div')
      placeholder.classList.add(CLASS_NAME_OPTIONS_EMPTY)
      placeholder.innerHTML = this._config.optionsEmptyPlaceholder

      if (!SelectorEngine.findOne(SELECTOR_OPTIONS_EMPTY, this._clone)) {
        SelectorEngine.findOne(SELECTOR_OPTIONS, this._clone).append(placeholder)
      }
    }
  }

  // Static

  static jQueryInterface(config) {
    return this.each(function () {
      let data = Data.getData(this, DATA_KEY)

      if (!data) {
        data = new Select(this)
      }

      // eslint-disable-next-line default-case
      switch (config) {
        case 'update':
          data[config](this, par)
          break
        case 'dispose':
        case 'open':
        case 'close':
        case 'search':
        case 'value':
          data[config](this)
          break
      }
    })
  }

  static clearMenus(event) {
    if (event && (event.button === RIGHT_MOUSE_BUTTON ||
      (event.type === 'keyup' && event.key !== TAB_KEY))) {
      return
    }

    const selects = SelectorEngine.find(SELECTOR_SELECT)

    for (let i = 0, len = selects.length; i < len; i++) {
      const context = Data.getData(selects[i], DATA_KEY)
      const relatedTarget = {
        relatedTarget: selects[i]
      }

      if (event && event.type === 'click') {
        relatedTarget.clickEvent = event
      }

      if (!context) {
        continue
      }

      if (!context._clone.classList.contains(CLASS_NAME_SHOW)) {
        continue
      }

      if (context._clone.contains(event.target)) {
        continue
      }

      context._clone.classList.remove(CLASS_NAME_SHOW)

      EventHandler.trigger(context._element, EVENT_HIDDEN)
    }
  }

  static getInstance(element) {
    return Data.getData(element, DATA_KEY)
  }

  // API 2.0 (experimental)

  // functions available for dom element

  static new(element, config) {
    const data = Data.getData(element, DATA_KEY)
    if (!data) {
      return new Select(element, config)
    }

    return data
  }

  static destroy(element) { // remove instance connected to element
    const data = Data.getData(element, DATA_KEY)
    if (data) {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }

      Select.destroyInstance(data)
      Data.removeData(element, DATA_KEY)
      return true
    }

    return false
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

EventHandler.on(document, EVENT_CLICK_DATA_API, MultiSelect.clearMenus)
EventHandler.on(document, EVENT_KEYUP_DATA_API, MultiSelect.clearMenus)

const $ = getjQuery()

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .select to jQuery only if jQuery is present
 */

/* istanbul ignore if */
if ($) {
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = MultiSelect.jQueryInterface
  $.fn[NAME].Constructor = MultiSelect
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return MultiSelect.jQueryInterface
  }
}

export default MultiSelect

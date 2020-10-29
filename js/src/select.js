/**
 * --------------------------------------------------------------------------
 * CoreUI PRO (v3.4.0): multi-select.js
 * Licensed under MIT (https://coreui.io/license)
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

const NAME = 'select'
const VERSION = '3.4.0'
const DATA_KEY = 'coreui.select'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const TAB_KEY = 'Tab'
const RIGHT_MOUSE_BUTTON = 2

const SELECTOR_INPUT = '.c-select-search'
const SELECTOR_LIST = '.c-select-options'
const SELECTOR_MULTI_SELECT = '.c-select'
const SELECTOR_OPTION = '.c-select-option'
const SELECTOR_OPTIONS = '.c-select-options'
const SELECTOR_SELECTED = '.c-selected'
const SELECTOR_SELECTION = '.c-select-selection'
const SELECTOR_TAGS = '.c-select-tags'

const EVENT_CHANGE = `keyup${EVENT_KEY}`
const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_CLOSE = `close${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_OPEN = `open${EVENT_KEY}`
const EVENT_SEARCH = `search${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_SELECT = 'c-select'
const CLASS_NAME_SELECT_MULTIPLE = 'c-select-multiple'
const CLASS_NAME_OPTGROUP = 'c-select-optgroup'
const CLASS_NAME_OPTGROUP_LABEL = 'c-select-optgroup-label'
const CLASS_NAME_OPTION = 'c-select-option'
const CLASS_NAME_OPTIONS = 'c-select-options'
const CLASS_NAME_SEARCH = 'c-select-search'
const CLASS_NAME_SELECTED = 'c-selected'
const CLASS_NAME_SELECTION = 'c-select-selection'
const CLASS_NAME_SHOW = 'c-show'
const CLASS_NAME_TAG = 'c-select-tag'
const CLASS_NAME_TAG_DELETE = 'c-select-tag-delete'

const CLASS_NAME_LABEL = 'c-label'

const Default = {
  inline: false,
  multiple: false,
  options: [],
  search: false,
  searchPlaceholder: 'Select...',
  selectionType: 'counter',
  selected: [],
  tags: false
}

const DefaultType = {
  inline: 'boolean',
  multiple: 'boolean',
  options: 'array',
  search: 'boolean',
  searchPlaceholder: 'string',
  selectionType: 'string',
  selected: 'array'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Select {
  constructor(element, config) {
    this._element = element
    this._selectionElement = null
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
    } else {
      Data.setData(element, DATA_KEY, this)
    }

    this._createSelect()
    this._addEventListeners()
    // Data.setData(element, DATA_KEY, this)
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

  open() {
    this._clone.classList.add(CLASS_NAME_SHOW)

    if (this._config.search) {
      SelectorEngine.findOne(SELECTOR_INPUT, this._clone).focus()
    }

    // TODO: trigger
  }

  close() {
    this._clone.classList.remove(CLASS_NAME_SHOW)
    // TODO: trigger
  }

  search(text) {
    const rootElement = this._optionsElement
    const customEvent = this._triggerSearchEvent(rootElement)

    if (customEvent === null || customEvent.defaultPrevented) {
      return
    }

    this._search = text.lenght > 0 ? text.toLowerCase() : text
    this._filterOptionsList()
  }

  // Private

  _addEventListeners() {
    EventHandler.on(this._clone, EVENT_CLICK_DATA_API, () => {
      this.open()
    })

    EventHandler.on(this._searchElement, EVENT_CHANGE, event => {
      event.preventDefault()
      event.stopPropagation()
      this._onSearchChange(this._searchElement)
    })
    EventHandler.on(this._searchElement, EVENT_KEYDOWN, event => {
      const key = event.keyCode || event.charCode

      if ((key === 8 || key === 46) && event.target.value.length === 0) {
        this._deleteLastTag()
      }
    })
    EventHandler.on(this._optionsElement, EVENT_CLICK, event => {
      event.preventDefault()
      event.stopPropagation()
      this._onOptionsClick(event.target)
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

  _getOptions() {
    if (this._config.options) {
      return this._config.options
    }

    const nodes = Array.from(this._element.childNodes).filter(element => element.nodeName === 'OPTION' || element.nodeName === 'OPTGROUP')
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

    if (this._config.multiple) {
      select.multiple = true
    }

    this._createNativeOptions(select, data)

    this._element.parentNode.insertBefore(select, this._element.nextSibling)
    this._element.remove()
    this._element = select

    Data.setData(select, DATA_KEY, this)
  }

  _createNativeOptions(parentElement, options) {
    options.forEach(option => {
      // eslint-disable-next-line no-negated-condition
      if ((typeof option.options !== 'undefined')) {
        const optgroup = document.createElement('optgroup')
        optgroup.label = option.text
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
    // this._element.tabIndex = '-1'
    // this._element.style.display = 'none'
  }

  _createSelect() {
    const div = document.createElement('div')
    div.classList.add(CLASS_NAME_SELECT)

    if (this._config.multiple) {
      div.classList.add(CLASS_NAME_SELECT_MULTIPLE)
    }

    this._clone = div
    this._element.parentNode.insertBefore(div, this._element.nextSibling)
    this._createSelection()
    if (this._config.search) {
      this._createSearchInput()
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

  _createSearchInput() {
    const input = document.createElement('input')
    input.classList.add(CLASS_NAME_SEARCH)
    if (this._selection.length === 0) {
      input.placeholder = this._config.searchPlaceholder
    }

    if (this._selection.length > 0 && !this._config.multiple) {
      input.placeholder = this._selection[0].text
      this._selectionElement.style.display = 'none'
    }

    if (this._selection.length > 0 && this._config.multiple) {
      input.placeholder = ''
    }

    this._clone.append(input)
    this._searchElement = input
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
        // if (option.selected) {
        //   optionDiv.classList.add(CLASS_NAME_SELECTED)
        //   // this._selectionAdd(String(option.value), option.text)
        // }

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

    const closeBtn = document.createElement('button')
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
    })

    return tag
  }

  // events



  // user event triggers

  _triggerOpenEvent(element) {
    return EventHandler.trigger(element, EVENT_OPEN)
  }

  _triggerCloseEvent(element) {
    return EventHandler.trigger(element, EVENT_CLOSE)
  }

  _triggerSearchEvent(element) {
    return EventHandler.trigger(element, EVENT_SEARCH)
  }

  // list

  _onOptionsClick(element) {
    if (!element.classList.contains(CLASS_NAME_OPTION) || element.classList.contains(CLASS_NAME_LABEL)) {
      return
    }

    const value = String(element.dataset.value)
    const text = element.textContent

    if (this._config.multiple && element.classList.contains(CLASS_NAME_SELECTED)) {
      this._selectionDelete(value)
    }

    if (this._config.multiple && !element.classList.contains(CLASS_NAME_SELECTED)) {
      this._selectionAdd(value, text)
    }

    if (!this._config.multiple) {
      this._selectionAdd(value, text)
    }

    this._updateSelection()
    this._updateSearch()
  }

  _onListClick(element) {
    if (!element.classList.contains(CLASS_NAME_OPTION) || element.classList.contains(CLASS_NAME_LABEL)) {
      return
    }

    const value = String(element.dataset.value)
    const text = element.textContent

    if (this._config.multiple) {
      if (element.classList.contains(CLASS_NAME_SELECTED)) {
        this._selectionDelete(value)
      } else {
        this._selectionAdd(value, text)
      }
    } else {
      this._selectionAdd(value, element.textContent)
    }

    this._updateSearch()
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
    this._selection = this._selection.filter(e => e.value !== value)
    this._unSelectOption(value)
  }

  // .c-select-selections

  _updateSelection() {
    const selection = SelectorEngine.findOne(SELECTOR_SELECTION, this._clone)

    if (this._config.multiple && this._config.selectionType === 'counter') {
      selection.innerHTML = `${this._selection.length} item(s) selected`
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

    // selection.innerHTML = this._selection[0].text
    // console.log(this._selection)
  }

  _updateSearch() {
    // if (this._selection.length === 0) {
    //   this._searchElement.placeholder = this._config.searchPlaceholder
    // }

    if (this._selection.length > 0 && !this._config.multiple) {
      this._searchElement.placeholder = this._selection[0].text
      this._selectionElement.style.display = 'none'
    }

    if (this._selection.length > 0 && this._config.multiple) {
      this._searchElement.placeholder = ''
      this._selectionElement.style.display = 'initial'
    }


    // if (!this._config.multiple) {
    //   if (this._selection.length > 0) {
    //     this._searchElement.placeholder = this._selection[0].text
    //   }

    //   return
    // }
  }

  // .c-select-selections

  _selectOption(value) {
    SelectorEngine.findOne(`option[value="${value}"]`, this._element).selected = true

    // TODO: nie podoba mi się to rozwiązanie
    const option = SelectorEngine.findOne(`[data-value="${value}"]`, this._optionsElement)
    if (option) {
      option.classList.add(CLASS_NAME_SELECTED)
    }
  }

  _unSelectOption(value) {
    SelectorEngine.findOne(`option[value="${value}"]`, this._element).selected = false

    // TODO: nie podoba mi się to rozwiązanie
    const option = SelectorEngine.findOne(`[data-value="${value}"]`, this._optionsElement)
    if (option) {
      option.classList.remove(CLASS_NAME_SELECTED)
    }
  }

  _clearOptions() {
    this._element.value = null
    SelectorEngine.find(SELECTOR_SELECTED, this._clone).forEach(element => {
      element.classList.remove(CLASS_NAME_SELECTED)
    })
  }

  // search

  // _onSearchFocus(element) {
  //   this.open()
  // }

  // _onSearchFocusOut(element) {
  //   this.close()
  // }

  _onSearchChange(element) {
    if (element)
      this.search(element.value)
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

  _filterOptionsList() {
    const options = SelectorEngine.find(SELECTOR_OPTION, this._clone)

    options.forEach(option => {
      if (option.textContent.toLowerCase().indexOf(this._search) === -1) {
        option.style.display = 'none'
      } else {
        option.style.display = 'block'
      }
    })
  }

  _deleteLastTag() {
    const lastVal = Object.keys(this._selection)[Object.keys(this._selection).length - 1]
    this._selectionDelete(lastVal)
    this._updateSelection()
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

    const selects = SelectorEngine.find(SELECTOR_MULTI_SELECT)

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

      // if (event && ((event.type === 'click' &&
      //   /input|textarea/i.test(event.target.tagName)) ||
      //   (event.type === 'keyup' && event.key === TAB_KEY)) &&
      //   context._clone.contains(event.target)) {
      //   continue
      // }

      context._clone.classList.remove(CLASS_NAME_SHOW)

      // if (!context._clone.contains(event.target)) {
      //   context._clone.classList.remove(CLASS_NAME_SHOW)
      // }
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

EventHandler.on(document, EVENT_CLICK_DATA_API, Select.clearMenus)
EventHandler.on(document, EVENT_KEYUP_DATA_API, Select.clearMenus)

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
  $.fn[NAME] = Select.jQueryInterface
  $.fn[NAME].Constructor = Select
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Select.jQueryInterface
  }
}

export default Select

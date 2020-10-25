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

const NAME = 'multiselect'
const VERSION = '3.4.0'
const DATA_KEY = 'coreui.multiselect'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const SELECTOR_LIST = '.c-multi-select-options'
const SELECTOR_INPUT = '.c-multi-select-search'
const SELECTOR_OPTION = '.c-multi-select-option'
const SELECTOR_TAGS = '.c-multi-select-tags'
const SELECTOR_TAG_DELETE = '.c-multi-select-tag-delete'

const EVENT_BLUR = `blur${EVENT_KEY}`
const EVENT_CHANGE = `keyup${EVENT_KEY}`
const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_CLOSE = `close${EVENT_KEY}`
const EVENT_FOCUS = `focus${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_OPEN = `open${EVENT_KEY}`
const EVENT_SEARCH = `search${EVENT_KEY}`

const CLASSNAME_MULTI_SELECT = 'c-multi-select'
const CLASSNAME_OPTGROUP = 'c-multi-select-optgroup'
const CLASSNAME_OPTGROUP_LABEL = 'c-multi-select-optgroup-label'
const CLASSNAME_OPTION = 'c-multi-select-option'
const CLASSNAME_OPTIONS = 'c-multi-select-options'
const CLASSNAME_SEARCH = 'c-multi-select-search'
const CLASSNAME_SELECTED = 'c-selected'
const CLASSNAME_TAG = 'c-multi-select-tag'
const CLASSNAME_TAG_DELETE = 'c-multi-select-tag-delete'
const CLASSNAME_TAGS = 'c-multi-select-tags'

const CLASSNAME_LABEL = 'c-label'

const Default = {
  selected: []
}

const DefaultType = {
  selected: 'array'
}

/*

1. Jezeli element nie ma klasy `c-multiselect` to ją dodać

*/

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class MultiSelect {
  constructor(element, config) {

    if (Data.getData(element, DATA_KEY)) { // already found
      console.warn('Instance already exist.')
      return
    }

    this._element = element
    this._clone = null
    this._options = {}
    this._config = this._getConfig(config)

    // data
    if (this._element) {
      Data.setData(element, DATA_KEY, this)
    }

    this._createMultiSelect()


    // list
    this._elementList = SelectorEngine.findOne(SELECTOR_LIST, this._clone)
    if (this._elementList) {
      this._elementList.style.display = 'none'
    }

    // set init values
    this._getNames()
    this._config.selected.map(val => {
      this._options[val] = this._names[val]
    })

    // input
    this._elementInput = SelectorEngine.findOne(SELECTOR_INPUT, this._clone)

    // tags
    this._elementTags = SelectorEngine.findOne(SELECTOR_TAGS, this._clone)

    // events
    this._addEventListeners()
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

  open(element) {
    const rootElement = this._elementList

    const customEvent = this._triggerOpenEvent(rootElement)

    if (customEvent === null || customEvent.defaultPrevented) {
      return
    }

    this._open(rootElement)
  }

  close(element) {
    const rootElement = this._elementList

    const customEvent = this._triggerCloseEvent(rootElement)

    if (customEvent === null || customEvent.defaultPrevented) {
      return
    }

    this._close(rootElement)
  }

  search(text) {
    const rootElement = this._elementList
    const customEvent = this._triggerSearchEvent(rootElement)

    if (customEvent === null || customEvent.defaultPrevented) {
      return
    }

    this._search = text
    this._updateList(rootElement)
  }

  value() {
    return Object.keys(this._options)
  }

  // Private

  _getConfig(config, update) {
    if (update !== true)
      config = {
        ...this.constructor.Default,
        ...Manipulator.getDataAttributes(this._element),
        ...config
      }

    typeCheckConfig(
      NAME,
      config,
      this.constructor.DefaultType
    )

    return config
  }

  _createMultiSelect() {
    const div = document.createElement('div')
    div.classList.add(CLASSNAME_MULTI_SELECT)
    div.classList.add('c-open')

    this._clone = div
    this._element.parentNode.insertBefore(div, this._element.nextSibling)
    this._createOptionsContainer()
    this._createSearchInput()
    this._createTagsArea()
  }

  _createTagsArea() {
    const div = document.createElement('div')
    div.classList.add(CLASSNAME_TAGS)
    this._clone.insertBefore(div, this._clone.firstChild)
  }

  _createSearchInput() {
    const input = document.createElement('input')
    input.classList.add(CLASSNAME_SEARCH)
    this._clone.insertBefore(input, this._clone.firstChild)
  }

  _createOptionsContainer() {
    const div = document.createElement('div')
    div.classList.add(CLASSNAME_OPTIONS)
    this._clone.insertBefore(div, this._clone.firstChild)

    this._createOptions(div, this._getOptions(this._element))
  }

  _createOptions(parentElement, options) {
    options.forEach(option => {
      if (typeof option.value !== 'undefined') {
        const optionDiv = document.createElement('div')
        optionDiv.classList.add(CLASSNAME_OPTION)
        optionDiv.dataset.value = option.value
        optionDiv.tabIndex = 0
        optionDiv.innerHTML = option.text
        parentElement.append(optionDiv)
      }

      if (typeof option.label !== 'undefined') {
        const optgroup = document.createElement('div')
        optgroup.classList.add(CLASSNAME_OPTGROUP)

        const optgrouplabel = document.createElement('div')
        optgrouplabel.innerHTML = option.label
        optgrouplabel.classList.add(CLASSNAME_OPTGROUP_LABEL)
        optgroup.append(optgrouplabel)

        this._createOptions(optgroup, option.options)
        parentElement.append(optgroup)
      }
    })
  }

  _getOptions(element) {
    const nodes = Array.from(element.childNodes).filter(element => element.nodeName === 'OPTION' || element.nodeName === 'OPTGROUP')
    const options = []

    nodes.forEach(node => {
      if (node.nodeName === 'OPTION') {
        options.push({
          value: node.value,
          text: node.outerText
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

  // events

  _addEventListeners() {
    EventHandler.on(this._elementInput, EVENT_FOCUS, event => {
      event.preventDefault()
      event.stopPropagation()
      this._onSearchFocus(this._elementInput)
    })
    EventHandler.on(this._elementInput, EVENT_BLUR, event => {
      event.preventDefault()
      event.stopPropagation()
      // this._onSearchFocusOut(this._elementInput);
    })
    EventHandler.on(this._elementInput, EVENT_CHANGE, event => {
      event.preventDefault()
      event.stopPropagation()
      this._onSearchChange(this._elementInput)
    })
    EventHandler.on(this._elementInput, EVENT_KEYDOWN, event => {
      const key = event.keyCode || event.charCode

      if ((key === 8 || key === 46) && event.target.value.length === 0) {
        this._deleteLastTag()
      }
    })
    EventHandler.on(this._elementList, EVENT_CLICK, event => {
      event.preventDefault()
      event.stopPropagation()
      this._onListClick(event.target)
    })
    EventHandler.on(this._elementList, EVENT_KEYDOWN, event => {
      const key = event.keyCode || event.charCode

      if (key === 13) {
        this._onListClick(event.target)
        SelectorEngine.findOne(SELECTOR_INPUT, this._clone).focus()
      }
    })
  }

  _addTagsEventListeners() {
    EventHandler.on(this._elementTags, EVENT_CLICK, SELECTOR_TAG_DELETE, event => {
      let { target } = event
      if (!target.classList.contains(CLASSNAME_TAG_DELETE)) {
        target = target.closest(SELECTOR_TAG_DELETE)
      }

      event.preventDefault()
      event.stopPropagation()
      this._onTagDelClick(target)
    })
  }

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

  // actions

  _open(element) {
    if (element) element.style.display = 'initial'
  }

  _close(element) {
    if (element) element.style.display = 'none'
  }

  // list

  _onListClick(element) {
    if (!element.classList.contains(CLASSNAME_OPTION) || element.classList.contains(CLASSNAME_LABEL)) return
    const val = element.dataset.value || element.textContent
    element.classList.add(CLASSNAME_SELECTED)

    SelectorEngine.findOne(`option[value=${val}]`, this._element).selected = true

    if (this._options[val] === undefined) {
      this._options[val] = element.textContent
      this._updateTags()
    }

    this._updateList(this._elementList)
  }

  // search

  _onSearchFocus(element) {
    this.open()
  }

  _onSearchFocusOut(element) {
    this.close()
  }

  _onSearchChange(element) {
    if (element)
      this.search(element.value)
  }

  _updateList(element) {
    if (!element) return
    const nodes = SelectorEngine.find(SELECTOR_OPTION, element)
    nodes.map(node => {
      if (node.classList.contains(CLASSNAME_OPTGROUP)) {
        this._updateList(node)
        return
      }

      if (!node.classList.contains(CLASSNAME_OPTION) || node.classList.contains(CLASSNAME_LABEL)) return


      if (node.textContent.toLowerCase().indexOf(this._search.toLowerCase()) === -1) {
        // node.style.display = 'none'
        node.classList.add('c-hidden')
      } else {
        // node.style.display = 'block'
        node.classList.remove('c-hidden')
      }
    })
  }

  _getNames(element) {
    if (!element) return
    const nodes = SelectorEngine.find(SELECTOR_OPTION, element)
    nodes.map(node => {
      if (node.classList.contains(CLASSNAME_OPTGROUP)) {
        this._updateList(node)
        return
      }

      if (!node.classList.contains(CLASSNAME_OPTION) || node.classList.contains(CLASSNAME_LABEL)) return
      this._names[node.dataset.value || node.textContent] = node.textContent
    })
  }

  // tags

  _updateTags(element) {
    if (!this._elementTags)
      return
    let tag
    this._elementTags.innerHTML = ''
    // eslint-disable-next-line guard-for-in
    for (const val in this._options) {
      tag = Manipulator.createElementFromHTML(`<div class="${CLASSNAME_TAG}">${this._options[val]} <button type="button" class="${CLASSNAME_TAG_DELETE} close" aria-label="Close" value="${val}"><span aria-hidden="true">&times;</span></button></div>`)

      this._elementTags.append(tag)
    }

    this._addTagsEventListeners()
  }

  _onTagDelClick(element) {
    if (!element) return
    const val = element.value
    if (val !== undefined) {
      SelectorEngine.findOne(`option[value=${val}]`, this._element).selected = false
      SelectorEngine.findOne(`[data-value="${val}"]`, this._clone).classList.remove(CLASSNAME_SELECTED)
      delete this._options[val]
      this._updateTags()
    }
  }

  _deleteLastTag() {
    const lastVal = Object.keys(this._options)[Object.keys(this._options).length-1]
    SelectorEngine.findOne(`option[value=${lastVal}]`, this._element).selected = false
    SelectorEngine.findOne(`[data-value="${lastVal}"]`, this._clone).classList.remove(CLASSNAME_SELECTED)
    delete this._options[lastVal]
    this._updateTags()
  }

  // Static

  static jQueryInterface(config) {
    return this.each(function () {
      let data = Data.getData(this, DATA_KEY)

      if (!data) {
        data = new MultiSelect(this)
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

  static getInstance(element) {
    return Data.getData(element, DATA_KEY)
  }

  // API 2.0 (experimental)

  // functions available for dom element

  static new(element, config) {
    let data = Data.getData(element, DATA_KEY)
    if (!data) {
      return new MultiSelect(element, config)
    }

    return data
  }

  static destroy(element) { // remove instance connected to element
    let data = Data.getData(element, DATA_KEY)
    if (data) {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }

      MultiSelect.destroyInstance(data)
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

const $ = getjQuery()

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .multiselect to jQuery only if jQuery is present
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

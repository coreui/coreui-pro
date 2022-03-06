/**
 * --------------------------------------------------------------------------
 * CoreUI (v4.2.0-alpha.0): picker.js
 * Licensed under MIT (https://coreui.io/license)
 * --------------------------------------------------------------------------
 */

import { typeCheckConfig } from './util/index'
import EventHandler from './dom/event-handler'
import Manipulator from './dom/manipulator'
import BaseComponent from './base-component'
import Dropdown from './dropdown'

/**
* ------------------------------------------------------------------------
* Constants
* ------------------------------------------------------------------------
*/

const NAME = 'picker'
const DATA_KEY = 'coreui.picker'
const EVENT_KEY = `.${DATA_KEY}`

const EVENT_CANCEL = `onCancelClick${EVENT_KEY}`

const Default = {
  cancelButtonText: 'Cancel',
  container: 'dropdown',
  disabled: false,
  footer: false,
  okButtonText: 'OK'
}

const DefaultType = {
  cancelButtonText: 'string',
  container: 'string',
  disabled: 'boolean',
  footer: 'boolean',
  okButtonText: 'string'
}

/**
* ------------------------------------------------------------------------
* Class Definition
* ------------------------------------------------------------------------
*/

class Picker extends BaseComponent {
  constructor(element, config) {
    super(element)

    this._config = this._getConfig(config)
    this._dropdown = null

    //
    this._dropdownEl = null
    this._dropdownMenuEl = null
    this._dropdownToggleEl = null

    this._createPicker()
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

  // Private
  _createDropdown() {
    const dropdownEl = document.createElement('div')
    dropdownEl.classList.add('picker')
    this._dropdownEl = dropdownEl

    const dropdownToggleEl = document.createElement('div')
    this._dropdownToggleEl = dropdownToggleEl

    if (!this._config.disabled) {
      Manipulator.setDataAttribute(dropdownToggleEl, 'toggle', 'dropdown')
    }

    const dropdownMenuEl = document.createElement('div')
    dropdownMenuEl.classList.add('dropdown-menu')
    this._dropdownMenuEl = dropdownMenuEl

    dropdownEl.append(dropdownToggleEl, dropdownMenuEl)

    this._element.append(dropdownEl)

    this._dropdown = new Dropdown(dropdownToggleEl, {
      autoClose: 'outside'
    })
  }

  _createFooter() {
    const footerEl = document.createElement('div')
    footerEl.classList.add('picker-footer')

    const cancelButtonEl = document.createElement('button')
    cancelButtonEl.classList.add('btn', 'btn-sm', 'btn-ghost-primary')
    cancelButtonEl.type = 'button'
    cancelButtonEl.innerHTML = this._config.cancelButtonText
    cancelButtonEl.addEventListener('click', () => {
      this._dropdown.hide()
      EventHandler.trigger(this._element, EVENT_CANCEL)
    })

    const okButtonEl = document.createElement('button')
    okButtonEl.classList.add('btn', 'btn-sm', 'btn-primary')
    okButtonEl.type = 'button'
    okButtonEl.innerHTML = this._config.okButtonText
    okButtonEl.addEventListener('click', () => {
      this._dropdown.hide()
    })

    footerEl.append(cancelButtonEl, okButtonEl)
    this._dropdownMenuEl.append(footerEl)
  }

  _createPicker() {
    if (this._config.container === 'dropdown') {
      this._createDropdown()
    }

    if (this._config.footer || this._config.timepicker) {
      this._createFooter()
    }
  }

  _getConfig(config) {
    config = {
      ...this.constructor.Default,
      ...Manipulator.getDataAttributes(this._element),
      ...(typeof config === 'object' ? config : {})
    }

    typeCheckConfig(NAME, config, DefaultType)
    return config
  }
}

export default Picker

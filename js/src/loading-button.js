/**
 * --------------------------------------------------------------------------
 * CoreUI PRO loading-button.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import Data from './dom/data.js'
import EventHandler from './dom/event-handler.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'loading-button'
const DATA_KEY = 'coreui.loading-button'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_START = `start${EVENT_KEY}`
const EVENT_STOP = `stop${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_IS_LOADING = 'is-loading'
const CLASS_NAME_LOADING_BUTTON = 'btn-loading'
const CLASS_NAME_LOADING_BUTTON_SPINNER = 'btn-loading-spinner'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="loading-button"]'

const Default = {
  disabledOnLoading: false,
  spinner: true,
  spinnerType: 'border',
  timeout: false
}

const DefaultType = {
  disabledOnLoading: 'boolean',
  spinner: 'boolean',
  spinnerType: 'string',
  timeout: '(boolean|number)'
}

/**
 * Class definition
 */

class LoadingButton extends BaseComponent {
  constructor(element, config) {
    super(element)

    this._config = this._getConfig(config)
    this._timeout = this._config.timeout
    this._spinner = null
    this._state = 'idle'

    if (this._element) {
      Data.set(element, DATA_KEY, this)
    }

    this._createButton()
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

  start() {
    if (this._state !== 'loading') {
      this._createSpinner()
      this._state = 'loading'

      setTimeout(() => {
        this._element.classList.add(CLASS_NAME_IS_LOADING)
        EventHandler.trigger(this._element, EVENT_START)

        if (this._config.disabledOnLoading) {
          this._element.setAttribute('disabled', true)
        }
      }, 1)

      if (this._config.timeout) {
        setTimeout(() => {
          this.stop()
        }, this._config.timeout)
      }
    }
  }

  stop() {
    this._element.classList.remove(CLASS_NAME_IS_LOADING)
    const stoped = () => {
      this._removeSpinner()
      this._state = 'idle'

      if (this._config.disabledOnLoading) {
        this._element.removeAttribute('disabled')
      }

      EventHandler.trigger(this._element, EVENT_STOP)
    }

    if (this._spinner) {
      this._queueCallback(stoped, this._spinner, true)
      return
    }

    stoped()
  }

  dispose() {
    Data.removeData(this._element, DATA_KEY)
    this._element = null
  }

  _createButton() {
    this._element.classList.add(CLASS_NAME_LOADING_BUTTON)
  }

  _createSpinner() {
    if (this._config.spinner) {
      const spinner = document.createElement('span')
      const type = this._config.spinnerType
      spinner.classList.add(CLASS_NAME_LOADING_BUTTON_SPINNER, `spinner-${type}`, `spinner-${type}-sm`)
      spinner.setAttribute('role', 'status')
      spinner.setAttribute('aria-hidden', 'true')
      this._element.insertBefore(spinner, this._element.firstChild)
      this._spinner = spinner
    }
  }

  _removeSpinner() {
    if (this._config.spinner) {
      this._spinner.remove()
      this._spinner = null
    }
  }

  // Static

  static loadingButtonInterface(element, config) {
    const data = LoadingButton.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(config) {
    return this.each(function () {
      LoadingButton.loadingButtonInterface(this, config)
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, event => {
  event.preventDefault()
  const button = event.target.closest(SELECTOR_DATA_TOGGLE)
  const data = LoadingButton.getOrCreateInstance(button)

  data.start()
})

/**
 * jQuery
 */

defineJQueryPlugin(LoadingButton)

export default LoadingButton

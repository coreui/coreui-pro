/**
 * --------------------------------------------------------------------------
 * CoreUI (v4.0.0-alpha.0): alert.js
 * Licensed under MIT (https://coreui.io/license)
 *
 * This component is a modified version of the Bootstrap's alert.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import {
  defineJQueryPlugin,
  emulateTransitionEnd,
  getTransitionDurationFromElement,
  typeCheckConfig
} from './util/index'
import Data from './dom/data'
import EventHandler from './dom/event-handler'
import Manipulator from './dom/manipulator'
// import SelectorEngine from './dom/selector-engine'
import BaseComponent from './base-component'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'loading-button'
const DATA_KEY = 'coreui.loading-button'
const EVENT_KEY = `.${DATA_KEY}`
// const DATA_API_KEY = '.data-api'

const MAX_PERCENT = 100
const MILLISECONDS = 10
const PROGRESS_BAR_BG_COLOR_LIGHT = 'rgba(255, 255, 255, .2)'
const PROGRESS_BAR_BG_COLOR_DARK = 'rgba(0, 0, 0, .2)'

// const SELECTOR_COMPONENT = '[data-coreui="loading-button"]'

const EVENT_START = `start${EVENT_KEY}`
const EVENT_STOP = `stop${EVENT_KEY}`
const EVENT_COMPLETE = `complete${EVENT_KEY}`
// const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_LOADING_BUTTON_LOADING = 'loading-button-loading'
const CLASS_NAME_LOADING_BUTTON_PROGRESS = 'loading-button-progress'
const CLASS_NAME_LOADING_BUTTON_SPINNER = 'loading-button-spinner'

const Default = {
  percent: 0,
  progress: false,
  spinner: true,
  spinnerType: 'border',
  timeout: 1000
}

const DefaultType = {
  percent: 'number',
  progress: 'boolean',
  spinner: 'boolean',
  spinnerType: 'string',
  timeout: 'number'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class LoadingButton extends BaseComponent {
  constructor(element, config) {
    // eslint-disable-next-line no-console
    console.log('created')
    super(element)

    this._config = this._getConfig(config)
    this._pause = false
    this._percent = this._config.percent
    this._timeout = this._config.timeout
    this._progressBar = null
    this._spinner = null
    this._state = 'idle'

    if (this._element) {
      Data.setData(element, DATA_KEY, this)
    }
  }

  // Getters

  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  static get DATA_KEY() {
    return DATA_KEY
  }

  // Public

  start() {
    if (this._state !== 'loading') {
      this._createSpinner()
      this._createProgressBar()

      setTimeout(() => {
        this._element.classList.add(CLASS_NAME_LOADING_BUTTON_LOADING)
        this._loading()
        EventHandler.trigger(this._element, EVENT_START)
      }, 1)
    }
  }

  stop() {
    this._element.classList.remove(CLASS_NAME_LOADING_BUTTON_LOADING)
    const stoped = () => {
      this._removeSpinner()
      this._removeProgressBar()
      this._state = 'idle'

      EventHandler.trigger(this._element, EVENT_STOP)
      if (this._percent >= 100) {
        EventHandler.trigger(this._element, EVENT_COMPLETE)
      }

      this._percent = this._config.percent
      this._timeout = this._config.timeout
    }

    if (this._spinner) {
      const transitionDuration = getTransitionDurationFromElement(this._spinner)

      EventHandler.one(this._spinner, 'transitionend', stoped)
      emulateTransitionEnd(this._spinner, transitionDuration)
      return
    }

    stoped()
  }

  pause() {
    this._pause = true
    this._state = 'pause'
  }

  resume() {
    this._pause = false
    this._loading()
  }

  complete() {
    this._timeout = 1000
  }

  updatePercent(percent) {
    const diff = (this._percent - percent) / 100
    this._timeout *= (1 + diff)
    this._percent = percent
  }

  dispose() {
    Data.removeData(this._element, DATA_KEY)
    this._element = null
  }

  update(config) { // public method
    this._config = this._getConfig(config)
  }

  _getConfig(config) {
    config = {
      ...Default,
      ...Manipulator.getDataAttributes(this._element),
      ...config
    }
    typeCheckConfig(NAME, config, DefaultType)

    return config
  }

  _loading() {
    const progress = setInterval(() => {
      this._state = 'loading'
      if (this._percent >= MAX_PERCENT) {
        this.stop()
        clearInterval(progress)
        return
      }

      if (this._pause) {
        clearInterval(progress)
        return
      }

      const frames = this._timeout / (MAX_PERCENT - this._percent) / MILLISECONDS
      this._percent = Math.round((this._percent + (1 / frames)) * 100) / 100
      this._timeout -= MILLISECONDS
      this._animateProgressBar()
    }, MILLISECONDS)
  }

  _createProgressBar() {
    if (this._config.progress) {
      const progress = document.createElement('div')
      progress.classList.add(CLASS_NAME_LOADING_BUTTON_PROGRESS)
      progress.setAttribute('role', 'progressbar')
      progress.setAttribute('aria-hidden', 'true')
      progress.style.backgroundColor = this._progressBarBg()

      this._element.insertBefore(progress, this._element.firstChild)
      this._progressBar = progress
    }
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

  _removeProgressBar() {
    if (this._config.progress) {
      this._progressBar.remove()
      this._progressBar = null
    }
  }

  _removeSpinner() {
    if (this._config.spinner) {
      this._spinner.remove()
      this._spinner = null
    }
  }

  _progressBarBg() {
    // The yiq lightness value that determines when the lightness of color changes from "dark" to "light". Acceptable values are between 0 and 255.
    const yiqContrastedThreshold = 150
    const color = window.getComputedStyle(this._element).getPropertyValue('background-color') === 'rgba(0, 0, 0, 0)' ? 'rgb(255, 255, 255)' : window.getComputedStyle(this._element).getPropertyValue('background-color')

    const rgb = color.match(/^rgb?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i)

    const r = Number.parseInt(rgb[1], 10)
    const g = Number.parseInt(rgb[2], 10)
    const b = Number.parseInt(rgb[3], 10)

    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000

    if (yiq > yiqContrastedThreshold) {
      return PROGRESS_BAR_BG_COLOR_DARK
    }

    return PROGRESS_BAR_BG_COLOR_LIGHT
  }

  _animateProgressBar() {
    if (this._config.progress) {
      this._progressBar.style.width = `${this._percent}%`
    }
  }

  // Static

  static loadingButtonInterface(element, config) {
    let data = Data.getData(element, DATA_KEY)
    let _config = {
      ...Default,
      ...Manipulator.getDataAttributes(element)
    }

    if (typeof config === 'object') {
      _config = {
        ..._config,
        ...config
      }
    }

    if (!data) {
      data = new LoadingButton(element, _config)
    }

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(config, par) {
    return this.each(function () {
      LoadingButton.loadingButtonInterface(this, config, par)
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */
// EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
//   SelectorEngine.find(SELECTOR_COMPONENT).forEach(element => {
//     LoadingButton.loadingButtonInterface(element, Manipulator.getDataAttributes(element))
//   })
// })

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .Alert to jQuery only if jQuery is present
 */

defineJQueryPlugin(NAME, LoadingButton)

export default LoadingButton

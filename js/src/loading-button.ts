/**
 * --------------------------------------------------------------------------
 * CoreUI PRO loading-button.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
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
  protected declare _timeout: ReturnType<typeof setTimeout> | null
  protected declare _spinner: HTMLElement | null
  protected declare _state: string

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element)

    this._config = this._getConfig(config)
    this._timeout = this._config.timeout
    this._spinner = null
    this._state = 'idle'

    if (this._element) {
      Data.set(element as Element, DATA_KEY, this)
    }

    this._createButton()
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

  start(): void {
    if (this._state !== 'loading') {
      this._createSpinner()
      this._state = 'loading'

      setTimeout(() => {
        this._element.classList.add(CLASS_NAME_IS_LOADING)
        EventHandler.trigger(this._element, EVENT_START)

        if (this._config.disabledOnLoading) {
          this._element.setAttribute('disabled', true as unknown as string)
        }
      }, 1)

      if (this._config.timeout) {
        setTimeout(() => {
          this.stop()
        }, this._config.timeout)
      }
    }
  }

  stop(): void {
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

  _createButton(): void {
    this._element.classList.add(CLASS_NAME_LOADING_BUTTON)
  }

  _createSpinner(): void {
    if (this._config.spinner) {
      const spinner = document.createElement('span')
      const type = this._config.spinnerType
      spinner.classList.add(CLASS_NAME_LOADING_BUTTON_SPINNER, `spinner-${type}`)
      spinner.setAttribute('role', 'status')
      spinner.setAttribute('aria-hidden', 'true')
      this._element.insertBefore(spinner, this._element.firstChild)
      this._spinner = spinner
    }
  }

  _removeSpinner(): any {
    if (this._config.spinner) {
      this._spinner!.remove()
      this._spinner = null
    }
  }

  // Static

  static loadingButtonInterface(element: string | Element | null, config: any): any {
    const data: any = LoadingButton.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string]()
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      LoadingButton.loadingButtonInterface(this, config)
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, event => {
  const button = (event.target as HTMLElement).closest(SELECTOR_DATA_TOGGLE)
  const data: any = LoadingButton.getOrCreateInstance(button)

  data.start()
})

/**
 * jQuery
 */

defineJQueryPlugin(LoadingButton)

export default LoadingButton

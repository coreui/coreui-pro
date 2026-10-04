/**
 * --------------------------------------------------------------------------
 * CoreUI PRO loading-button.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import { announce, type AnnouncePriority } from './util/announce.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'loading-button'
const DATA_KEY = 'coreui.loading-button'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_START = `start${EVENT_KEY}`
const EVENT_STOP = `stop${EVENT_KEY}`
const EVENT_CLICK = 'click'
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_IS_LOADING = 'is-loading'
const CLASS_NAME_LOADING_BUTTON = 'btn-loading'
const CLASS_NAME_LOADING_BUTTON_SPINNER = 'btn-loading-spinner'

const SELECTOR_HIDDEN_CONTENT = `[aria-hidden="true"], [hidden], .${CLASS_NAME_LOADING_BUTTON_SPINNER}`

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="loading-button"]'

type LoadingButtonConfig = {
  ariaLoadingLabel: string
  disabledOnLoading: boolean
  spinner: boolean
  spinnerType: 'border' | 'grow'
  timeout: boolean | number
}

const Default: LoadingButtonConfig = {
  ariaLoadingLabel: 'Loading',
  disabledOnLoading: false,
  spinner: true,
  spinnerType: 'border',
  timeout: false
}

const DefaultType = {
  ariaLoadingLabel: 'string',
  disabledOnLoading: 'boolean',
  spinner: 'boolean',
  spinnerType: 'string',
  timeout: '(boolean|number)'
}

/**
 * Class definition
 */

class LoadingButton extends BaseComponent {
  protected declare _startTimeout: ReturnType<typeof setTimeout> | null
  protected declare _timeout: ReturnType<typeof setTimeout> | null
  protected declare _spinner: HTMLElement | null
  protected declare _state: string
  protected declare _handleClick: (event: Event) => void
  protected declare _blocked: boolean
  protected declare _announcement: (() => void) | null

  constructor(element?: string | Element | null, config?: Partial<LoadingButtonConfig> | null) {
    super(element)

    this._config = this._getConfig(config)
    this._startTimeout = null
    this._timeout = null
    this._spinner = null
    this._state = 'idle'
    this._handleClick = event => this._blockClick(event)
    this._blocked = false
    this._announcement = null

    this._createButton()
    this._element.addEventListener(EVENT_CLICK, this._handleClick, true)
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
    if (this._state === 'loading') {
      return
    }

    this._createSpinner()
    this._state = 'loading'

    this._startTimeout = setTimeout(() => {
      this._element.classList.add(CLASS_NAME_IS_LOADING)

      if (this._config.disabledOnLoading) {
        this._block()
      }

      this._announcement = this._announce(
        [this._getName(), this._config.ariaLoadingLabel].filter(Boolean).join(', '),
        'assertive'
      )
      EventHandler.trigger(this._element, EVENT_START)
    }, 1)

    if (this._config.timeout) {
      this._timeout = setTimeout(() => {
        this.stop()
      }, this._config.timeout)
    }
  }

  stop(): void {
    if (this._state !== 'loading') {
      return
    }

    this._clearTimeouts()
    this._element.classList.remove(CLASS_NAME_IS_LOADING)
    const stoped = () => {
      this._removeSpinner()
      this._state = 'idle'
      this._unblock()

      if (this._announcement) {
        this._announcement()
        this._announcement = null
        this._announce(this._getName(), 'polite')
      }

      EventHandler.trigger(this._element, EVENT_STOP)
    }

    if (this._spinner) {
      this._queueCallback(stoped, this._spinner, true)
      return
    }

    stoped()
  }

  override dispose(): void {
    this._clearTimeouts()
    this._unblock()
    this._element.removeEventListener(EVENT_CLICK, this._handleClick, true)

    super.dispose()
  }

  // Private

  _announce(message: string, priority: AnnouncePriority): (() => void) | null {
    if (!message || (this._element.getRootNode() as Document | ShadowRoot).activeElement !== this._element) {
      return null
    }

    return announce(message, { context: this._element, priority })
  }

  _block(): void {
    if (this._element.classList.contains(CLASS_NAME_DISABLED) || this._element.getAttribute('aria-disabled') === 'true') {
      return
    }

    this._element.classList.add(CLASS_NAME_DISABLED)
    this._element.setAttribute('aria-disabled', 'true')
    this._blocked = true
  }

  _blockClick(event: Event): void {
    if (this._blocked) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

  _clearTimeouts(): void {
    if (this._startTimeout) {
      clearTimeout(this._startTimeout)
      this._startTimeout = null
    }

    if (this._timeout) {
      clearTimeout(this._timeout)
      this._timeout = null
    }
  }

  _createButton(): void {
    this._element.classList.add(CLASS_NAME_LOADING_BUTTON)
  }

  _createSpinner(): void {
    if (this._config.spinner) {
      const spinner = document.createElement('span')
      const type = this._config.spinnerType
      spinner.classList.add(CLASS_NAME_LOADING_BUTTON_SPINNER, `spinner-${type}`)

      if (this._config.ariaLoadingLabel) {
        spinner.setAttribute('role', 'img')
        spinner.setAttribute('aria-label', this._config.ariaLoadingLabel)
      } else {
        spinner.setAttribute('aria-hidden', 'true')
      }

      this._element.insertBefore(spinner, this._element.firstChild)
      this._spinner = spinner
    }
  }

  _getName(): string {
    const root = this._element.getRootNode()
    const ids = this._element.getAttribute('aria-labelledby')

    if (ids && (root instanceof Document || root instanceof ShadowRoot)) {
      const labelledBy = ids
        .split(/\s+/)
        .map(id => root.getElementById(id)?.textContent?.trim())
        .filter(Boolean)
        .join(' ')

      if (labelledBy) {
        return labelledBy
      }
    }

    const label = this._element.getAttribute('aria-label')?.trim()

    if (label) {
      return label
    }

    const content = this._element.cloneNode(true) as HTMLElement

    for (const hidden of content.querySelectorAll(SELECTOR_HIDDEN_CONTENT)) {
      hidden.remove()
    }

    return content.textContent?.trim() || this._element.getAttribute('title')?.trim() || ''
  }

  _unblock(): void {
    if (!this._blocked) {
      return
    }

    this._element.classList.remove(CLASS_NAME_DISABLED)
    this._element.removeAttribute('aria-disabled')
    this._blocked = false
  }

  _removeSpinner(): any {
    if (this._config.spinner) {
      this._spinner!.remove()
      this._spinner = null
    }
  }

  // Static

  static loadingButtonInterface(element: string | Element | null, config: any, ...args: any[]): any {
    const data: any = LoadingButton.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string](...args)
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, LoadingButton, config)
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
export type { LoadingButtonConfig }

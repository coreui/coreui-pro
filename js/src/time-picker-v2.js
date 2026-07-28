/**
 * --------------------------------------------------------------------------
 * CoreUI PRO time-picker-v2.js
 * License (https://coreui.io/pro/license/)
 *
 * Pickers v2 prototype (workspace: plans/pickers-v2-rewrite.md): a TimeInput
 * section field + the TimeSelection popup body + the Popup primitive, instead
 * of the v1 monolith. Not exported under the v1 name until the API review.
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import TimeInput from './time-input.js'
import Popup from './util/popup.js'
import TimeSelection from './util/time-selection.js'
import { sanitizeHtml, SVGAllowlist } from './util/sanitizer.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'time-picker-v2'
const DATA_KEY = 'coreui.time-picker-v2'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_TIME_CHANGE = `timeChange${EVENT_KEY}`

const CLASS_NAME_BODY = 'time-picker-body'
const CLASS_NAME_DROPDOWN = 'time-picker-dropdown'
const CLASS_NAME_FOOTER = 'time-picker-footer'
const CLASS_NAME_INDICATOR = 'time-picker-indicator'
const CLASS_NAME_INPUT_GROUP = 'time-picker-input-group'
const CLASS_NAME_PICKER = 'picker'
const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_TIME_PICKER = 'time-picker'
const CLASS_NAME_TIME_PICKER_V2 = 'time-picker-v2'

const SELECTOR_ACTION = '[data-coreui-picker-action]'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="time-picker-v2"]'
const SELECTOR_TEMPLATE_FOOTER = 'template[data-coreui-template="footer"]'

// Icons live in JavaScript, not in CSS masks — the chips pattern.
const DEFAULT_INDICATOR_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M256 16C123.452 16 16 123.452 16 256s107.452 240 240 240 240-107.452 240-240S388.548 16 256 16Zm0 448c-114.875 0-208-93.125-208-208S141.125 48 256 48s208 93.125 208 208-93.125 208-208 208Z"/><path d="M272 128h-32v139.314l84.686 84.687 22.628-22.628L272 254.059V128Z"/></svg>'

const Default = {
  allowList: SVGAllowlist,
  ariaToggleLabel: 'Toggle the time selection',
  container: false,
  disabled: false,
  indicatorIcon: DEFAULT_INDICATOR_ICON,
  inputOptions: {},
  locale: navigator.language,
  name: null,
  sanitize: true,
  sanitizeFn: null,
  selectionOptions: {},
  size: null,
  time: null,
  variant: 'roll'
}

const DefaultType = {
  allowList: 'object',
  ariaToggleLabel: 'string',
  container: '(string|element|boolean)',
  disabled: 'boolean',
  indicatorIcon: 'string',
  inputOptions: 'object',
  locale: 'string',
  name: '(string|null)',
  sanitize: 'boolean',
  sanitizeFn: '(function|null)',
  selectionOptions: 'object',
  size: '(string|null)',
  time: '(date|string|null)',
  variant: 'string'
}

/**
 * Class definition
 */

class TimePickerV2 extends BaseComponent {
  constructor(element, config) {
    super(element, config)

    this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element)
    // see DatePickerV2 — the shell owns the initial value for reset()
    this._initialTime = config?.time ?? this._config.time
    this._input = null
    this._selection = null
    this._selectionElement = null
    this._menu = null
    this._popup = null

    this._createTimePicker()
    this._createPopup()
    this._addEventListeners()
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
  show() {
    if (this._config.disabled) {
      return
    }

    this._popup.show()
  }

  hide() {
    this._popup.hide()
  }

  toggle() {
    return this._popup.isShown ? this.hide() : this.show()
  }

  getTime() {
    return this._input.getDate()
  }

  setTime(time) {
    this._input.update({ date: time })
    this._selection?.update({ time })
    EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time })
  }

  now() {
    this.setTime(new Date())
  }

  clear() {
    this._input.clear()
    this._selection?.update({ time: null })
    EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time: null })
  }

  reset() {
    this.setTime(this._initialTime)
  }

  getContext() {
    return {
      clear: () => this.clear(),
      close: () => this.hide(),
      disabled: this._config.disabled,
      now: () => this.now(),
      reset: () => this.reset(),
      setTime: time => this.setTime(time),
      time: this.getTime()
    }
  }

  dispose() {
    this._popup.dispose()
    this._input.dispose()
    this._selection?.dispose()
    super.dispose()
  }

  // Private
  // Options the inner primitives know about are forwarded by name, so their
  // data attributes work on the picker element.
  _forwardConfig(Component, overrides = {}, extra = {}) {
    const forwarded = {}

    for (const key of Object.keys(Component.Default)) {
      if (key in this._config && this._config[key] !== Default[key]) {
        forwarded[key] = this._config[key]
      }
    }

    return { ...forwarded, ...overrides, ...extra }
  }

  _sanitizeIcon(icon) {
    return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon
  }

  _createTimePicker() {
    this._element.classList.add(CLASS_NAME_TIME_PICKER, CLASS_NAME_TIME_PICKER_V2, CLASS_NAME_PICKER)

    if (this._config.size) {
      this._element.classList.add(`${CLASS_NAME_TIME_PICKER}-${this._config.size}`)
    }

    const inputGroup = document.createElement('div')
    inputGroup.classList.add(CLASS_NAME_INPUT_GROUP)

    const inputEl = document.createElement('div')
    inputGroup.append(inputEl)

    const indicator = document.createElement('button')
    indicator.classList.add(CLASS_NAME_INDICATOR)
    indicator.type = 'button'
    indicator.setAttribute('aria-label', this._config.ariaToggleLabel)
    indicator.innerHTML = this._sanitizeIcon(this._config.indicatorIcon)
    inputGroup.append(indicator)
    this._indicatorElement = indicator

    this._element.append(inputGroup)

    this._input = new TimeInput(inputEl, this._forwardConfig(TimeInput, {
      date: this._config.time,
      disabled: this._config.disabled,
      locale: this._config.locale,
      name: this._config.name
    }, this._config.inputOptions))

    this._menu = document.createElement('div')
    this._menu.classList.add(CLASS_NAME_DROPDOWN)

    this._selectionElement = document.createElement('div')
    this._selectionElement.classList.add(CLASS_NAME_BODY)
    this._menu.append(this._selectionElement)

    if (this._footerTemplate) {
      const footer = document.createElement('div')
      footer.classList.add(CLASS_NAME_FOOTER)
      footer.append(this._footerTemplate.content.cloneNode(true))
      this._menu.append(footer)
    }

    this._element.append(this._menu)
  }

  // The selection body is built on first open, like the pickers' calendar.
  _ensureSelection() {
    if (this._selection) {
      return
    }

    this._selection = new TimeSelection(this._selectionElement, this._forwardConfig(TimeSelection, {
      locale: this._config.locale,
      onChange: time => {
        this._input.update({ date: time })
        EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time })
      },
      time: this.getTime(),
      variant: this._config.variant
    }, this._config.selectionOptions))
  }

  _createPopup() {
    this._popup = new Popup({
      anchor: this._element,
      container: this._config.container,
      content: this._menu,
      onHidden: () => EventHandler.trigger(this._element, EVENT_HIDDEN),
      onHide: () => {
        this._menu.classList.remove(CLASS_NAME_SHOW)
        this._element.classList.remove(CLASS_NAME_SHOW)
        this._element.setAttribute('aria-expanded', 'false')
        EventHandler.trigger(this._element, EVENT_HIDE)
      },
      onShow: () => {
        // the classes come first: the selection body scrolls the selected cell
        // into view, which needs the dropdown to have layout
        this._menu.classList.add(CLASS_NAME_SHOW)
        this._element.classList.add(CLASS_NAME_SHOW)
        this._ensureSelection()
        this._element.setAttribute('aria-expanded', 'true')
        EventHandler.trigger(this._element, EVENT_SHOW)
      },
      onShown: () => EventHandler.trigger(this._element, EVENT_SHOWN)
    })
  }

  _addEventListeners() {
    EventHandler.on(this._indicatorElement, EVENT_CLICK, () => {
      if (!this._config.disabled) {
        this.toggle()
      }
    })

    EventHandler.on(this._menu, EVENT_CLICK, SELECTOR_ACTION, event => {
      const action = event.target.closest(SELECTOR_ACTION).dataset.coreuiPickerAction
      const context = this.getContext()

      if (typeof context[action] === 'function') {
        context[action]()
      }
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) {
    TimePickerV2.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(TimePickerV2)

export default TimePickerV2

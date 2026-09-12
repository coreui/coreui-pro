/**
 * --------------------------------------------------------------------------
 * CoreUI PRO time-picker.js
 * License (https://coreui.io/pro/license/)
 *
 * Composed from a TimeInput section field, the TimeSelection popup body and the
 * Popup primitive.
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import TimeInput from './time-input.js'
import Popup from './util/popup.js'
import TimeSelection from './util/time-selection.js'
import { sanitizeByConfig, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'
import type { ComponentConfig } from './util/config.js'
import { appendControlGroupField, applyControlGroupClasses, createControlGroupAction } from './util/form-control-group.js'
import { CLEANER_ICON, CLOCK_ICON } from './util/icons.js'
import { defineJQueryPlugin, getUID, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'time-picker'
const DATA_KEY = 'coreui.time-picker'
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
const CLASS_NAME_DROPDOWN = 'time-picker-popup'
const CLASS_NAME_FOOTER = 'time-picker-footer'
const CLASS_NAME_CLEANER = 'form-control-cleaner'
const CLASS_NAME_INDICATOR = 'form-control-action'
const CLASS_NAME_FORM_CONTROL = 'form-control'
const CLASS_NAME_INPUT_GROUP = 'form-control-group'
const CLASS_NAME_PICKER = 'picker'
const CLASS_NAME_POPUP = 'popup'
const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_TIME_PICKER = 'time-picker'

const SELECTOR_ACTION = '[data-coreui-picker-action]'
const SELECTOR_ACTION_NOW = '[data-coreui-picker-action="now"]'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="time-picker"]'
const SELECTOR_TEMPLATE_FOOTER = 'template[data-coreui-template="footer"]'

// Icons live in JavaScript, not in CSS masks — the chips pattern.

type TimePickerConfig = {
  allowList: SanitizerAllowList
  ariaCleanerLabel: string
  ariaToggleLabel: string
  cleaner: boolean
  cleanerIcon: string
  container: Element | boolean | string
  disabled: boolean
  floatingLabel: string | null
  indicatorIcon: string
  inputOptions: Record<string, any>
  locale: string
  name: string | null
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  selectionOptions: Record<string, any>
  size: string | null
  time: Date | string | null
  variant: string
}

const Default: TimePickerConfig = {
  allowList: SVGAllowlist,
  ariaCleanerLabel: 'Clear the value',
  ariaToggleLabel: 'Toggle the time selection',
  cleaner: true,
  cleanerIcon: CLEANER_ICON,
  container: false,
  disabled: false,
  floatingLabel: null,
  indicatorIcon: CLOCK_ICON,
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

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaCleanerLabel: 'string',
  ariaToggleLabel: 'string',
  cleaner: 'boolean',
  cleanerIcon: 'string',
  container: '(string|element|boolean)',
  disabled: 'boolean',
  floatingLabel: '(string|null)',
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

class TimePicker extends BaseComponent {
  protected declare _footerTemplate: any
  protected declare _cleanerElement: HTMLElement | null
  protected declare _indicatorElement: HTMLElement
  protected declare _fieldElement: HTMLElement
  protected declare _initialTime: any
  protected declare _input: any
  protected declare _selection: any
  protected declare _selectionElement: any
  protected declare _menu: any
  protected declare _syncingFromPanel: boolean
  protected declare _addedGroupClass: boolean
  protected declare _popup: any

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    this._footerTemplate = SelectorEngine.findOne(SELECTOR_TEMPLATE_FOOTER, this._element)
    // see DatePicker — the shell owns the initial value for reset()
    this._initialTime = config?.time ?? this._config.time
    this._cleanerElement = null
    this._input = null
    this._selection = null
    this._syncingFromPanel = false
    this._selectionElement = null
    this._menu = null
    this._popup = null

    this._createTimePicker()
    this._createPopup()
    this._addEventListeners()
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
  show(): void {
    if (this._config.disabled) {
      return
    }

    this._popup.show()
  }

  hide(): void {
    this._popup.hide()
  }

  toggle(): void {
    return this._popup.isShown ? this.hide() : this.show()
  }

  getTime(): Date | null {
    return this._input.getDate()
  }

  setTime(time: Date | null): void {
    this._input.update({ date: time })
    EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time })
  }

  now(): void {
    this.setTime(new Date())
  }

  clear(): void {
    this._input.clear()
  }

  reset(): void {
    this.setTime(this._initialTime)
  }

  getContext(): Record<string, any> {
    return {
      clear: () => this.clear(),
      close: () => this.hide(),
      disabled: this._config.disabled,
      isTimeSelectable: (time: Date | null) => this._input.isDateSelectable(time),
      now: () => this.now(),
      reset: () => this.reset(),
      setTime: (time: Date | null) => this.setTime(time),
      time: this.getTime()
    }
  }

  override dispose(): void {
    for (const element of [this._menu, this._indicatorElement, this._cleanerElement]) {
      EventHandler.off(element, EVENT_KEY)
    }

    this._popup.dispose()
    this._input.dispose()
    this._selection?.dispose()
    this._fieldElement.remove()
    this._cleanerElement?.remove()
    this._indicatorElement.remove()

    if (this._addedGroupClass) {
      this._element.classList.remove(CLASS_NAME_INPUT_GROUP)
    }

    super.dispose()
  }

  // Private
  // Options the inner primitives know about are forwarded by name, so their
  // data attributes work on the picker element.
  _forwardConfig(Component: any, overrides: Record<string, any> = {}, extra: Record<string, any> = {}): Record<string, any> {
    const forwarded: Record<string, any> = {}

    for (const key of Object.keys(Component.Default)) {
      if (key in this._config && this._config[key] !== (Default as Record<string, any>)[key]) {
        forwarded[key] = this._config[key]
      }
    }

    return { ...forwarded, ...overrides, ...extra }
  }

  _createTimePicker(): void {
    this._element.classList.add(CLASS_NAME_TIME_PICKER, CLASS_NAME_PICKER)

    // The root is the frame: a field component has nothing to wrap, so it
    // carries `.form-control-group` itself instead of nesting one.
    const inputGroup = this._element
    this._addedGroupClass = !inputGroup.classList.contains(CLASS_NAME_INPUT_GROUP)
    applyControlGroupClasses(inputGroup, CLASS_NAME_INPUT_GROUP)

    // Sizing rides the standard control classes on the frame itself
    if (this._config.size) {
      inputGroup.classList.add(`${CLASS_NAME_FORM_CONTROL}-${this._config.size}`)
    }

    const inputEl = document.createElement('div')
    this._fieldElement = appendControlGroupField(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`)

    const action = (className: string, icon: string, label: string) => createControlGroupAction({
      className, disabled: this._config.disabled, icon, label, sanitizeIcon: (value: string) => sanitizeByConfig(value, this._config)
    })

    if (this._config.cleaner) {
      this._cleanerElement = action(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel)
      inputGroup.append(this._cleanerElement)
    }

    const indicator = action(CLASS_NAME_INDICATOR, this._config.indicatorIcon, this._config.ariaToggleLabel)
    inputGroup.append(indicator)
    this._indicatorElement = indicator

    this._input = new TimeInput(inputEl, this._forwardConfig(TimeInput, {
      date: this._config.time,
      disabled: this._config.disabled,
      locale: this._config.locale,
      name: this._config.name
    }, { ...(this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {}), ...this._config.inputOptions }))

    // See DatePicker — the bridge from a typed value back to the panel
    EventHandler.on(inputEl, TimeInput.eventName(TimeInput.CHANGE_EVENT_NAME), (event: any) => {
      if (!this._syncingFromPanel) {
        this._selection?.update({ time: event.date })
        EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time: event.date })
      }
    })

    this._menu = document.createElement('div')
    this._menu.id = getUID(`${this.constructor.NAME}-popup-`)
    this._menu.classList.add(CLASS_NAME_POPUP, CLASS_NAME_DROPDOWN)
    this._indicatorElement.setAttribute('aria-controls', this._menu.id)
    this._indicatorElement.setAttribute('aria-expanded', 'false')
    this._indicatorElement.setAttribute('aria-haspopup', 'dialog')

    this._selectionElement = document.createElement('div')
    this._selectionElement.classList.add(CLASS_NAME_BODY)
    this._menu.append(this._selectionElement)

    if (this._footerTemplate) {
      const footer = document.createElement('div')
      footer.classList.add(CLASS_NAME_FOOTER)
      footer.append(this._footerTemplate.content.cloneNode(true))
      this._disableUnselectableActions(footer)
      this._menu.append(footer)
    }
  }

  // See DatePicker._disableUnselectableActions — a button opting into the
  // `now` action is disabled (never re-enabled) when the current time cannot
  // be selected.
  _disableUnselectableActions(container: HTMLElement): void {
    if (this._input.isDateSelectable(new Date())) {
      return
    }

    for (const button of SelectorEngine.find(SELECTOR_ACTION_NOW, container)) {
      if ('disabled' in button) {
        (button as any).disabled = true
      }
    }
  }

  // The selection body is built on first open, like the pickers' calendar.
  _ensureSelection(): void {
    if (this._selection) {
      return
    }

    this._selection = new TimeSelection(this._selectionElement, this._forwardConfig(TimeSelection, {
      locale: this._config.locale,
      onChange: (time: Date | null) => {
        this._syncingFromPanel = true
        this._input.update({ date: time })
        this._syncingFromPanel = false
        EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time })
      },
      time: this.getTime(),
      variant: this._config.variant
    }, this._config.selectionOptions))
  }

  _createPopup(): void {
    this._popup = new Popup({
      anchor: this._element,
      container: this._config.container,
      content: this._menu,
      onBeforeHide: () => !EventHandler.trigger(this._element, EVENT_HIDE)?.defaultPrevented,
      onBeforeShow: () => !EventHandler.trigger(this._element, EVENT_SHOW)?.defaultPrevented,
      onHidden: () => EventHandler.trigger(this._element, EVENT_HIDDEN),
      onHide: () => {
        this._menu.classList.remove(CLASS_NAME_SHOW)
        this._element.classList.remove(CLASS_NAME_SHOW)
        this._indicatorElement.setAttribute('aria-expanded', 'false')
      },
      onShow: () => {
        // the classes come first: the selection body scrolls the selected cell
        // into view, which needs the dropdown to have layout
        this._menu.classList.add(CLASS_NAME_SHOW)
        this._element.classList.add(CLASS_NAME_SHOW)
        this._ensureSelection()
        this._indicatorElement.setAttribute('aria-expanded', 'true')
      },
      onShown: () => EventHandler.trigger(this._element, EVENT_SHOWN)
    })
  }

  _addEventListeners(): void {
    if (this._cleanerElement) {
      EventHandler.on(this._cleanerElement, EVENT_CLICK, (event: any) => {
        event.stopPropagation()
        this.clear()
      })
    }

    EventHandler.on(this._indicatorElement, EVENT_CLICK, () => {
      if (!this._config.disabled) {
        this.toggle()
      }
    })

    EventHandler.on(this._menu, EVENT_CLICK, SELECTOR_ACTION, (event: any) => {
      const action = event.target.closest(SELECTOR_ACTION).dataset.coreuiPickerAction
      const context = this.getContext()

      if (typeof context[action] === 'function') {
        context[action]()
      }
    })
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, TimePicker, config)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) {
    TimePicker.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(TimePicker)

export default TimePicker

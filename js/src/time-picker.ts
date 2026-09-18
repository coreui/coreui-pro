/**
 * --------------------------------------------------------------------------
 * CoreUI PRO time-picker.js
 * License (https://coreui.io/pro/license/)
 *
 * Composed from a TimeInput section field, the TimeSelection popup body and the
 * Popup primitive.
 * --------------------------------------------------------------------------
 */

import PickerBase from './picker-base.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import TimeInput from './time-input.js'
import TimeSelection from './util/time-selection.js'
import { sanitizeByConfig, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'
import type { ComponentConfig } from './util/config.js'
import {
  appendControlGroupField,
  applyControlGroupClasses,
  applyControlGroupSize,
  captureHostClasses,
  createControlGroupAction,
  managedSizeClassNames
} from './util/form-control-group.js'
import { CLEANER_ICON, CLOCK_ICON } from './util/icons.js'
import { defineJQueryPlugin, getUID, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'time-picker'
const DATA_KEY = 'coreui.time-picker'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`
const EVENT_TIME_CHANGE = `timeChange${EVENT_KEY}`

const CLASS_NAME_BODY = 'time-picker-body'
const CLASS_NAME_DROPDOWN = 'time-picker-popup'
const CLASS_NAME_FOOTER = 'time-picker-footer'
const CLASS_NAME_CLEANER = 'form-control-cleaner'
const CLASS_NAME_INDICATOR = 'form-control-action'
const CLASS_NAME_INPUT_GROUP = 'form-control-group'
const CLASS_NAME_PICKER = 'picker'
const CLASS_NAME_POPUP = 'popup'
const CLASS_NAME_TIME_PICKER = 'time-picker'

const SELECTOR_ACTION_NOW = '[data-coreui-picker-action="now"]'
const SELECTOR_DATA_TIME_PICKER = '[data-coreui-time-picker]'

// Icons live in JavaScript, not in CSS masks — the chips pattern.

type TimePickerConfig = {
  allowList: SanitizerAllowList,
  ariaCleanerLabel: string,
  ariaPickerLabel: string,
  cleaner: boolean,
  cleanerIcon: string,
  container: Element | boolean | string,
  disabled: boolean,
  floatingLabel: string | null,
  inputOptions: Record<string, any>,
  locale: string,
  name: string | null,
  pickerIcon: string,
  sanitize: boolean,
  sanitizeFn: ((unsafeHtml: string) => string) | null,
  selectionOptions: Record<string, any>,
  size: string | null,
  time: Date | string | null,
  variant: string
}

const Default: TimePickerConfig = {
  allowList: SVGAllowlist,
  ariaCleanerLabel: 'Clear the value',
  ariaPickerLabel: 'Toggle the time selection',
  cleaner: true,
  cleanerIcon: CLEANER_ICON,
  container: false,
  disabled: false,
  floatingLabel: null,
  inputOptions: {},
  locale: navigator.language,
  name: null,
  pickerIcon: CLOCK_ICON,
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
  ariaPickerLabel: 'string',
  cleaner: 'boolean',
  cleanerIcon: 'string',
  container: '(string|element|boolean)',
  disabled: 'boolean',
  floatingLabel: '(string|null)',
  inputOptions: 'object',
  locale: 'string',
  name: '(string|null)',
  pickerIcon: 'string',
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

class TimePicker extends PickerBase {
  protected declare _initialTime: any
  protected declare _input: any
  protected declare _selection: any
  protected declare _selectionElement: any
  protected declare _syncingFromPanel: boolean

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element, config)

    // see DatePicker — the shell owns the initial value for reset()
    this._initialTime = config?.time ?? this._config.time
    this._input = null
    this._selection = null
    this._syncingFromPanel = false
    this._selectionElement = null

    this._hostClasses = captureHostClasses(this._element, this._managedClassNames())
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
  getTime(): Date | null {
    return this._input.getDate()
  }

  setTime(time: Date | null): void {
    this._input.setConfig({ date: time })
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

  override getContext(): Record<string, any> {
    return {
      ...this._baseContext(),
      isTimeSelectable: (time: Date | null) => this._input.isDateSelectable(time),
      now: () => this.now(),
      setTime: (time: Date | null) => this.setTime(time),
      time: this.getTime()
    }
  }

  override _disposeParts(): void {
    this._input.dispose()
    this._selection?.dispose()
    this._fieldElement.remove()
    this._cleanerElement?.remove()
    this._toggleElement.remove()
  }

  // Private
  override _managedClassNames(): string[] {
    return [
      CLASS_NAME_TIME_PICKER,
      CLASS_NAME_PICKER,
      CLASS_NAME_INPUT_GROUP,
      ...managedSizeClassNames(this._config.size)
    ].filter(Boolean) as string[]
  }

  _createTimePicker(): void {
    this._element.classList.add(CLASS_NAME_TIME_PICKER, CLASS_NAME_PICKER)

    // The root is the frame: a field component has nothing to wrap, so it
    // carries `.form-control-group` itself instead of nesting one.
    const inputGroup = this._element
    applyControlGroupClasses(inputGroup, CLASS_NAME_INPUT_GROUP)

    // Sizing rides the standard control classes on the frame itself
    applyControlGroupSize(inputGroup, this._config.size)

    const inputEl = document.createElement('div')
    this._fieldElement = appendControlGroupField(inputGroup, inputEl, this._config.floatingLabel, `${this.constructor.NAME}-`)

    const action = (className: string, icon: string, label: string) => createControlGroupAction({
      className, disabled: this._config.disabled, icon, label, sanitizeIcon: (value: string) => sanitizeByConfig(value, this._config)
    })

    if (this._config.cleaner) {
      this._cleanerElement = action(CLASS_NAME_CLEANER, this._config.cleanerIcon, this._config.ariaCleanerLabel)
      inputGroup.append(this._cleanerElement)
    }

    const indicator = action(CLASS_NAME_INDICATOR, this._config.pickerIcon, this._config.ariaPickerLabel)
    inputGroup.append(indicator)
    this._toggleElement = indicator

    this._input = new TimeInput(inputEl, this._forwardConfig(TimeInput, {
      date: this._config.time,
      disabled: this._config.disabled,
      locale: this._config.locale,
      name: this._config.name
    }, { ...(this._config.floatingLabel ? { ariaLabel: this._config.floatingLabel } : {}), ...this._config.inputOptions }))

    // See DatePicker — the bridge from a typed value back to the panel
    EventHandler.on(inputEl, TimeInput.eventName(TimeInput.CHANGE_EVENT_NAME), (event: any) => {
      if (!this._syncingFromPanel) {
        this._selection?.setConfig({ time: event.date })
        EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time: event.date })
      }
    })

    this._menu = document.createElement('div')
    this._menu.id = getUID(`${this.constructor.NAME}-popup-`)
    this._menu.classList.add(CLASS_NAME_POPUP, CLASS_NAME_DROPDOWN)
    this._toggleElement.setAttribute('aria-expanded', 'false')
    this._toggleElement.setAttribute('aria-haspopup', 'dialog')

    this._selectionElement = document.createElement('div')
    this._selectionElement.classList.add(CLASS_NAME_BODY)
    this._menu.append(this._selectionElement)

    if (this._footerTemplate) {
      const footer = document.createElement('div')
      footer.classList.add(CLASS_NAME_FOOTER)
      footer.append(this._footerTemplate.content.cloneNode(true))
      this._disableUnselectableActions(SELECTOR_ACTION_NOW, footer)
      this._menu.append(footer)
    }
  }

  // See DatePicker._disableUnselectableActions — a button opting into the
  // `now` action is disabled (never re-enabled) when the current time cannot
  // be selected.
  override _isNowSelectable(): boolean {
    return this._input.isDateSelectable(new Date())
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
        this._input.setConfig({ date: time })
        this._syncingFromPanel = false
        EventHandler.trigger(this._element, EVENT_TIME_CHANGE, { time })
      },
      time: this.getTime(),
      variant: this._config.variant
    }, this._config.selectionOptions))
  }

  override _onPopupShow(): void {
    this._ensureSelection()
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, TimePicker, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of SelectorEngine.find(SELECTOR_DATA_TIME_PICKER)) {
    TimePicker.getOrCreateInstance(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(TimePicker)

export default TimePicker

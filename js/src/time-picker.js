/**
 * --------------------------------------------------------------------------
 * CoreUI PRO time-picker.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import * as Popper from '@popperjs/core'
import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import { defineJQueryPlugin, getElement, isRTL } from './util/index.js'
import {
  convert12hTo24h,
  convert24hTo12h,
  getAmPm,
  getLocalizedTimePartials,
  isAmPm,
  isValidTime
} from './util/time.js'

/**
 * Constants
 */

const NAME = 'time-picker'
const DATA_KEY = 'coreui.time-picker'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const ENTER_KEY = 'Enter'
const ESCAPE_KEY = 'Escape'
const SPACE_KEY = 'Space'
const TAB_KEY = 'Tab'
const RIGHT_MOUSE_BUTTON = 2

const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_HIDE = `hide${EVENT_KEY}`
const EVENT_HIDDEN = `hidden${EVENT_KEY}`
const EVENT_INPUT = 'input'
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_SHOW = `show${EVENT_KEY}`
const EVENT_SHOWN = `shown${EVENT_KEY}`
const EVENT_SUBMIT = 'submit'
const EVENT_TIME_CHANGE = `timeChange${EVENT_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`
const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_BODY = 'time-picker-body'
const CLASS_NAME_CLEANER = 'time-picker-cleaner'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_DROPDOWN = 'time-picker-dropdown'
const CLASS_NAME_FOOTER = 'time-picker-footer'
const CLASS_NAME_INDICATOR = 'time-picker-indicator'
const CLASS_NAME_INLINE_ICON = 'time-picker-inline-icon'
const CLASS_NAME_INLINE_SELECT = 'time-picker-inline-select'
const CLASS_NAME_INPUT = 'time-picker-input'
const CLASS_NAME_INPUT_GROUP = 'time-picker-input-group'
const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const CLASS_NAME_ROLL = 'time-picker-roll'
const CLASS_NAME_ROLL_COL = 'time-picker-roll-col'
const CLASS_NAME_ROLL_CELL = 'time-picker-roll-cell'
const CLASS_NAME_SELECTED = 'selected'
const CLASS_NAME_SHOW = 'show'
const CLASS_NAME_TIME_PICKER = 'time-picker'
const CLASS_NAME_WAS_VALIDATED = 'was-validated'

const SELECTOR_DATA_TOGGLE =
  '[data-coreui-toggle="time-picker"]:not(.disabled):not(:disabled)'
const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE}.${CLASS_NAME_SHOW}`
const SELECTOR_WAS_VALIDATED = 'form.was-validated'

const Default = {
  cancelButton: 'Cancel',
  cancelButtonClasses: ['btn', 'btn-sm', 'btn-ghost-primary'],
  cleaner: true,
  confirmButton: 'OK',
  confirmButtonClasses: ['btn', 'btn-sm', 'btn-primary'],
  container: false,
  disabled: false,
  footer: true,
  hours: null,
  indicator: true,
  inputReadOnly: false,
  invalid: false,
  locale: 'default',
  minutes: true,
  name: null,
  placeholder: 'Select time',
  required: true,
  seconds: true,
  size: null,
  time: null,
  type: 'dropdown',
  valid: false,
  variant: 'roll'
}

const DefaultType = {
  cancelButton: '(boolean|string)',
  cancelButtonClasses: '(array|string)',
  cleaner: 'boolean',
  confirmButton: '(boolean|string)',
  confirmButtonClasses: '(array|string)',
  container: '(string|element|boolean)',
  disabled: 'boolean',
  footer: 'boolean',
  hours: '(array|function|null)',
  indicator: 'boolean',
  inputReadOnly: 'boolean',
  invalid: 'boolean',
  locale: 'string',
  minutes: '(array|boolean|function)',
  name: '(string|null)',
  placeholder: 'string',
  required: 'boolean',
  seconds: '(array|boolean|function)',
  size: '(string|null)',
  time: '(date|string|null)',
  type: 'string',
  valid: 'boolean',
  variant: 'string'
}

/**
 * Class definition
 */

class TimePicker extends BaseComponent {
  constructor(element, config) {
    super(element)

    this._config = this._getConfig(config)
    this._date = this._convertStringToDate(this._config.time)
    this._initialDate = null
    this._ampm = this._date ?
      getAmPm(new Date(this._date), this._config.locale) :
      'am'
    this._popper = null

    this._indicatorElement = null
    this._input = null
    this._menu = null
    this._timePickerBody = null

    this._localizedTimePartials = getLocalizedTimePartials(
      this._config.locale,
      this.ampm,
      this._config.hours,
      this._config.minutes,
      this._config.seconds
    )

    this._createTimePicker()
    this._createTimePickerSelection()
    this._addEventListeners()
    this._setUpSelects()
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
  toggle() {
    return this._isShown() ? this.hide() : this.show()
  }

  show() {
    if (this._config.disabled || this._isShown()) {
      return
    }

    this._initialDate = new Date(this._date)

    EventHandler.trigger(this._element, EVENT_SHOW)
    this._element.classList.add(CLASS_NAME_SHOW)
    this._element.setAttribute('aria-expanded', true)

    if (this._config.container) {
      this._menu.classList.add(CLASS_NAME_SHOW)
    }

    EventHandler.trigger(this._element, EVENT_SHOWN)

    this._createPopper()
  }

  hide() {
    EventHandler.trigger(this._element, EVENT_HIDE)

    if (this._popper) {
      this._popper.destroy()
    }

    this._element.classList.remove(CLASS_NAME_SHOW)
    this._element.setAttribute('aria-expanded', 'false')

    if (this._config.container) {
      this._menu.classList.remove(CLASS_NAME_SHOW)
    }

    EventHandler.trigger(this._element, EVENT_HIDDEN)
  }

  dispose() {
    if (this._popper) {
      this._popper.destroy()
    }

    super.dispose()
  }

  cancel() {
    this._date = this._initialDate
    this._setInputValue(this._initialDate || '')
    this._timePickerBody.innerHTML = ''
    this.hide()
    this._createTimePickerSelection()
    this._emitChangeEvent(this._date)
  }

  clear() {
    this._date = null
    this._setInputValue('')
    this._timePickerBody.innerHTML = ''
    this._createTimePickerSelection()
    this._emitChangeEvent(this._date)
  }

  reset() {
    this._date = this._convertStringToDate(this._config.time)
    this._setInputValue(this._config.time)
    this._timePickerBody.innerHTML = ''
    this._createTimePickerSelection()
    this._emitChangeEvent(this._date)
  }

  update(config) {
    this._config = this._getConfig(config)
    this._date = this._convertStringToDate(this._config.time)
    this._ampm = this._date ?
      getAmPm(new Date(this._date), this._config.locale) :
      'am'
    this._timePickerBody.innerHTML = ''
    this._createTimePickerSelection()
  }

  // Private
  _addEventListeners() {
    EventHandler.on(this._indicatorElement, EVENT_CLICK, () => {
      if (!this._config.disabled) {
        this.toggle()
      }
    })

    EventHandler.on(this._indicatorElement, EVENT_KEYDOWN, event => {
      if (!this._config.disabled && event.key === ENTER_KEY) {
        this.toggle()
      }
    })

    EventHandler.on(this._togglerElement, EVENT_CLICK, event => {
      if (!this._config.disabled && event.target !== this._indicatorElement) {
        this.show()

        if (this._config.variant === 'roll') {
          this._setUpRolls(true)
        }

        if (this._config.variant === 'select') {
          this._setUpSelects()
        }
      }
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, event => {
      if (event.key === ESCAPE_KEY) {
        this.hide()
      }
    })

    EventHandler.on(this._element, 'timeChange.coreui.time-picker', () => {
      if (this._config.variant === 'roll') {
        this._setUpRolls()
      }

      if (this._config.variant === 'select') {
        this._setUpSelects()
      }
    })

    EventHandler.on(this._element, 'onCancelClick.coreui.picker', () => {
      this.cancel()
    })

    EventHandler.on(this._input, EVENT_INPUT, event => {
      if (isValidTime(event.target.value)) {
        this._date = this._convertStringToDate(event.target.value)

        EventHandler.trigger(this._element, EVENT_TIME_CHANGE, {
          timeString: this._date ? this._date.toTimeString() : null,
          localeTimeString: this._date ? this._date.toLocaleTimeString() : null,
          date: this._date
        })
      }
    })

    if (this._config.type === 'dropdown') {
      EventHandler.on(this._input.form, EVENT_SUBMIT, () => {
        if (this._input.form.classList.contains(CLASS_NAME_WAS_VALIDATED)) {
          if (Number.isNaN(Date.parse(`1970-01-01 ${this._input.value}`))) {
            return this._element.classList.add(CLASS_NAME_IS_INVALID)
          }

          if (this._date instanceof Date) {
            return this._element.classList.add(CLASS_NAME_IS_VALID)
          }

          this._element.classList.add(CLASS_NAME_IS_INVALID)
        }
      })
    }
  }

  _createTimePicker() {
    this._element.classList.add(CLASS_NAME_TIME_PICKER)

    Manipulator.setDataAttribute(
      this._element,
      'toggle',
      CLASS_NAME_TIME_PICKER
    )

    if (this._config.size) {
      this._element.classList.add(`time-picker-${this._config.size}`)
    }

    this._element.classList.toggle(CLASS_NAME_IS_VALID, this._config.valid)
    if (this._config.disabled) {
      this._element.classList.add(CLASS_NAME_DISABLED)
    }

    this._element.classList.toggle(CLASS_NAME_IS_INVALID, this._config.invalid)

    if (this._config.type === 'dropdown') {
      this._element.append(this._createTimePickerInputGroup())

      const dropdownEl = document.createElement('div')
      dropdownEl.classList.add(CLASS_NAME_DROPDOWN)

      dropdownEl.append(this._createTimePickerBody())
      if (this._config.footer || this._config.timepicker) {
        dropdownEl.append(this._createTimePickerFooter())
      }

      const { container } = this._config
      if (container) {
        container.append(dropdownEl)
      } else {
        this._element.append(dropdownEl)
      }

      this._menu = dropdownEl
    }

    if (this._config.type === 'inline') {
      this._element.append(this._createTimePickerBody())
    }
  }

  _createTimePickerInputGroup() {
    const inputGroupEl = document.createElement('div')
    inputGroupEl.classList.add(CLASS_NAME_INPUT_GROUP)

    const inputEl = document.createElement('input')
    inputEl.classList.add(CLASS_NAME_INPUT)
    inputEl.autocomplete = 'off'
    inputEl.disabled = this._config.disabled
    inputEl.placeholder = this._config.placeholder
    inputEl.readOnly = this._config.inputReadOnly
    inputEl.required = this._config.required
    inputEl.type = 'text'

    this._setInputValue(this._date || '', inputEl)

    if (this._config.name || this._element.id) {
      inputEl.name = this._config.name || `time-picker-${this._element.id}`
    }

    const events = ['change', 'keyup', 'paste']

    for (const event of events) {
      inputEl.addEventListener(event, ({ target }) => {
        if (target.closest(SELECTOR_WAS_VALIDATED)) {
          if (Number.isNaN(Date.parse(`1970-01-01 ${target.value}`))) {
            this._element.classList.add(CLASS_NAME_IS_INVALID)
            this._element.classList.remove(CLASS_NAME_IS_VALID)
            return
          }

          if (this._date instanceof Date) {
            this._element.classList.add(CLASS_NAME_IS_VALID)
            this._element.classList.remove(CLASS_NAME_IS_INVALID)
            return
          }

          this._element.classList.add(CLASS_NAME_IS_INVALID)
          this._element.classList.remove(CLASS_NAME_IS_VALID)
        }
      })
    }

    inputGroupEl.append(inputEl)

    if (this._config.indicator) {
      const inputGroupIndicatorEl = document.createElement('div')
      inputGroupIndicatorEl.classList.add(CLASS_NAME_INDICATOR)

      if (!this._config.disabled) {
        inputGroupIndicatorEl.tabIndex = 0
      }

      inputGroupEl.append(inputGroupIndicatorEl)

      this._indicatorElement = inputGroupIndicatorEl
    }

    if (this._config.cleaner) {
      const inputGroupCleanerEl = document.createElement('div')
      inputGroupCleanerEl.classList.add(CLASS_NAME_CLEANER)
      inputGroupCleanerEl.addEventListener('click', event => {
        event.stopPropagation()
        this.clear()
      })

      inputGroupEl.append(inputGroupCleanerEl)
    }

    this._input = inputEl
    this._togglerElement = inputGroupEl

    return inputGroupEl
  }

  _createTimePickerSelection() {
    if (this._config.variant === 'roll') {
      this._createTimePickerRoll()
    }

    if (this._config.variant === 'select') {
      this._createTimePickerInlineSelects()
    }
  }

  _createTimePickerBody() {
    const timePickerBodyEl = document.createElement('div')
    timePickerBodyEl.classList.add(CLASS_NAME_BODY)

    if (this._config.variant === 'roll') {
      timePickerBodyEl.classList.add(CLASS_NAME_ROLL)
    }

    this._timePickerBody = timePickerBodyEl

    return timePickerBodyEl
  }

  _createTimePickerInlineSelect(className, options) {
    const selectEl = document.createElement('select')
    selectEl.classList.add(CLASS_NAME_INLINE_SELECT, className)
    selectEl.disabled = this._config.disabled
    selectEl.addEventListener('change', event =>
      this._handleTimeChange(className, event.target.value)
    )

    for (const option of options) {
      const optionEl = document.createElement('option')
      optionEl.value = option.value
      optionEl.innerHTML = option.label

      selectEl.append(optionEl)
    }

    return selectEl
  }

  _createTimePickerInlineSelects() {
    const timeSeparatorEl = document.createElement('div')
    timeSeparatorEl.innerHTML = ':'

    this._timePickerBody.innerHTML = `<span class="${CLASS_NAME_INLINE_ICON}"></span>`
    this._timePickerBody.append(
      this._createTimePickerInlineSelect(
        'hours',
        this._localizedTimePartials.listOfHours
      )
    )

    if (this._config.minutes) {
      this._timePickerBody.append(
        timeSeparatorEl.cloneNode(true),
        this._createTimePickerInlineSelect(
          'minutes',
          this._localizedTimePartials.listOfMinutes
        )
      )
    }

    if (this._config.seconds) {
      this._timePickerBody.append(
        timeSeparatorEl,
        this._createTimePickerInlineSelect(
          'seconds',
          this._localizedTimePartials.listOfSeconds
        )
      )
    }

    if (this._localizedTimePartials.hour12) {
      this._timePickerBody.append(
        this._createTimePickerInlineSelect(
          'toggle',
          [
            { value: 'am', label: 'AM' },
            { value: 'pm', label: 'PM' }
          ],
          '_selectAmPm',
          this._ampm
        )
      )
    }
  }

  _createTimePickerRoll() {
    this._timePickerBody.append(
      this._createTimePickerRollCol(
        this._localizedTimePartials.listOfHours,
        'hours'
      )
    )

    if (this._config.minutes) {
      this._timePickerBody.append(
        this._createTimePickerRollCol(
          this._localizedTimePartials.listOfMinutes,
          'minutes'
        )
      )
    }

    if (this._config.seconds) {
      this._timePickerBody.append(
        this._createTimePickerRollCol(
          this._localizedTimePartials.listOfSeconds,
          'seconds'
        )
      )
    }

    if (this._localizedTimePartials.hour12) {
      this._timePickerBody.append(
        this._createTimePickerRollCol(
          [
            { value: 'am', label: 'AM' },
            { value: 'pm', label: 'PM' }
          ],
          'toggle',
          this._ampm
        )
      )
    }
  }

  _createTimePickerRollCol(options, part) {
    const timePickerRollColEl = document.createElement('div')
    timePickerRollColEl.classList.add(CLASS_NAME_ROLL_COL)

    for (const option of options) {
      const timePickerRollCellEl = document.createElement('div')
      timePickerRollCellEl.classList.add(CLASS_NAME_ROLL_CELL)
      timePickerRollCellEl.setAttribute('role', 'button')
      timePickerRollCellEl.tabIndex = 0
      timePickerRollCellEl.innerHTML = option.label
      timePickerRollCellEl.addEventListener('click', () => {
        this._handleTimeChange(part, option.value)
      })
      timePickerRollCellEl.addEventListener('keydown', event => {
        if (event.code === SPACE_KEY || event.key === ENTER_KEY) {
          event.preventDefault()
          this._handleTimeChange(part, option.value)
        }
      })

      Manipulator.setDataAttribute(timePickerRollCellEl, part, option.value)

      timePickerRollColEl.append(timePickerRollCellEl)
    }

    return timePickerRollColEl
  }

  _createTimePickerFooter() {
    const footerEl = document.createElement('div')
    footerEl.classList.add(CLASS_NAME_FOOTER)

    if (this._config.cancelButton) {
      const cancelButtonEl = document.createElement('button')
      cancelButtonEl.classList.add(
        ...this._getButtonClasses(this._config.cancelButtonClasses)
      )
      cancelButtonEl.type = 'button'
      cancelButtonEl.innerHTML = this._config.cancelButton
      cancelButtonEl.addEventListener('click', () => {
        this.cancel()
      })

      footerEl.append(cancelButtonEl)
    }

    if (this._config.confirmButton) {
      const confirmButtonEl = document.createElement('button')
      confirmButtonEl.classList.add(
        ...this._getButtonClasses(this._config.confirmButtonClasses)
      )
      confirmButtonEl.type = 'button'
      confirmButtonEl.innerHTML = this._config.confirmButton
      confirmButtonEl.addEventListener('click', () => {
        this.hide()
      })

      footerEl.append(confirmButtonEl)
    }

    return footerEl
  }

  _emitChangeEvent(date) {
    this._input.dispatchEvent(new Event('change'))
    EventHandler.trigger(this._element, EVENT_TIME_CHANGE, {
      timeString: date === null ? null : date.toTimeString(),
      localeTimeString: date === null ? null : date.toLocaleTimeString(),
      date
    })
  }

  _setUpRolls(initial = false) {
    for (const part of Array.from(['hours', 'minutes', 'seconds', 'toggle'])) {
      for (const element of SelectorEngine.find(
        `[data-coreui-${part}]`,
        this._element
      )) {
        if (
          this._getPartOfTime(part) ===
          Manipulator.getDataAttribute(element, part)
        ) {
          element.classList.add(CLASS_NAME_SELECTED)
          this._scrollTo(element.parentElement, element, initial)

          for (const sibling of element.parentElement.children) {
            // eslint-disable-next-line max-depth
            if (sibling !== element) {
              sibling.classList.remove(CLASS_NAME_SELECTED)
            }
          }
        }
      }
    }
  }

  _setInputValue(date, input = this._input) {
    input.value = date instanceof Date ?
      date.toLocaleTimeString(this._config.locale, {
        hour12: this._localizedTimePartials.hour12,
        hour: 'numeric',
        ...(this._config.minutes && { minute: 'numeric' }),
        ...(this._config.seconds && { second: 'numeric' })
      }) :
      date
  }

  _setUpSelects() {
    for (const part of Array.from(['hours', 'minutes', 'seconds', 'toggle'])) {
      for (const element of SelectorEngine.find(
        `select.${part}`,
        this._element
      )) {
        if (this._getPartOfTime(part)) {
          element.value = this._getPartOfTime(part)
        }
      }
    }
  }

  _updateTimePicker() {
    this._element.innerHTML = ''
    this._createTimePicker()
  }

  _convertStringToDate(date) {
    return date ?
      (date instanceof Date ?
        date :
        new Date(`1970-01-01 ${date}`)) :
      null
  }

  _createPopper() {
    if (typeof Popper === 'undefined') {
      throw new TypeError(
        'CoreUI\'s time picker require Popper (https://popper.js.org)'
      )
    }

    const popperConfig = {
      modifiers: [
        {
          name: 'preventOverflow',
          options: {
            boundary: 'clippingParents'
          }
        },
        {
          name: 'offset',
          options: {
            offset: [0, 2]
          }
        }
      ],
      placement: isRTL() ? 'bottom-end' : 'bottom-start'
    }

    this._popper = Popper.createPopper(
      this._togglerElement,
      this._menu,
      popperConfig
    )
  }

  _getButtonClasses(classes) {
    if (typeof classes === 'string') {
      return classes.split(' ')
    }

    return classes
  }

  _getPartOfTime(part) {
    if (this._date === null) {
      return null
    }

    if (part === 'hours') {
      return isAmPm(this._config.locale) ?
        convert24hTo12h(this._date.getHours()) :
        this._date.getHours()
    }

    if (part === 'minutes') {
      return this._date.getMinutes()
    }

    if (part === 'seconds') {
      return this._date.getSeconds()
    }

    if (part === 'toggle') {
      return getAmPm(new Date(this._date), this._config.locale)
    }
  }

  _handleTimeChange = (set, value) => {
    const _date = this._date || new Date('1970-01-01')

    if (set === 'toggle') {
      if (value === 'am') {
        this._ampm = 'am'
        _date.setHours(_date.getHours() - 12)
      }

      if (value === 'pm') {
        this._ampm = 'pm'
        _date.setHours(_date.getHours() + 12)
      }
    }

    if (set === 'hours') {
      if (isAmPm(this._config.locale)) {
        _date.setHours(convert12hTo24h(this._ampm, Number.parseInt(value, 10)))
      } else {
        _date.setHours(Number.parseInt(value, 10))
      }
    }

    if (set === 'minutes') {
      _date.setMinutes(Number.parseInt(value, 10))
    }

    if (set === 'seconds') {
      _date.setSeconds(Number.parseInt(value, 10))
    }

    this._date = new Date(_date)

    if (this._input) {
      this._setInputValue(_date)
      this._input.dispatchEvent(new Event('change'))
    }

    EventHandler.trigger(this._element, EVENT_TIME_CHANGE, {
      timeString: _date.toTimeString(),
      localeTimeString: _date.toLocaleTimeString(),
      date: _date
    })
  }

  _isShown() {
    return this._element.classList.contains(CLASS_NAME_SHOW)
  }

  _scrollTo(parent, children, initial = false) {
    parent.scrollTo({
      top: children.offsetTop,
      behavior: initial ? 'instant' : 'smooth'
    })
  }

  _configAfterMerge(config) {
    if (config.container === 'dropdown' || config.container === 'inline') {
      config.type = config.container
    }

    if (config.container === true) {
      config.container = document.body
    }

    if (
      typeof config.container === 'object' ||
      (typeof config.container === 'string' &&
        config.container === 'dropdown' &&
        config.container === 'inline')
    ) {
      config.container = getElement(config.container)
    }

    return config
  }

  // Static
  static timePickerInterface(element, config) {
    const data = TimePicker.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(config) {
    return this.each(function () {
      const data = TimePicker.getOrCreateInstance(this, config)

      if (typeof config !== 'string') {
        return
      }

      if (
        data[config] === undefined ||
        config.startsWith('_') ||
        config === 'constructor'
      ) {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config](this)
    })
  }

  static clearMenus(event) {
    if (
      event.button === RIGHT_MOUSE_BUTTON ||
      (event.type === 'keyup' && event.key !== TAB_KEY)
    ) {
      return
    }

    const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN)

    for (const toggle of openToggles) {
      const context = TimePicker.getInstance(toggle)

      if (!context) {
        continue
      }

      const composedPath = event.composedPath()

      if (composedPath.includes(context._element)) {
        continue
      }

      const relatedTarget = { relatedTarget: context._element }

      if (event.type === 'click') {
        relatedTarget.clickEvent = event
      }

      context.hide()
    }
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  const timePickers = SelectorEngine.find(SELECTOR_DATA_TOGGLE)
  for (let i = 0, len = timePickers.length; i < len; i++) {
    TimePicker.timePickerInterface(timePickers[i])
  }
})
EventHandler.on(document, EVENT_CLICK_DATA_API, TimePicker.clearMenus)
EventHandler.on(document, EVENT_KEYUP_DATA_API, TimePicker.clearMenus)

/**
 * jQuery
 */

defineJQueryPlugin(TimePicker)

export default TimePicker

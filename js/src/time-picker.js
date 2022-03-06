
/* eslint-disable indent */
/**
 * --------------------------------------------------------------------------
 * CoreUI (v4.2.0-alpha.0): time-picker.js
 * Licensed under MIT (https://coreui.io/license)
 * --------------------------------------------------------------------------
 */

import { defineJQueryPlugin, typeCheckConfig } from './util/index'
import EventHandler from './dom/event-handler'
import Manipulator from './dom/manipulator'
import SelectorEngine from './dom/selector-engine'
import { convert12hTo24h, convert24hTo12h, getAmPm, isAmPm } from './util/time'
import Picker from './picker'

/**
* ------------------------------------------------------------------------
* Constants
* ------------------------------------------------------------------------
*/

const NAME = 'time-picker'
const DATA_KEY = 'coreui.time-picker'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="time-picker"]'

const Default = {
  ...Picker.Default,
  cleaner: true,
  container: 'dropdown',
  disabled: false,
  footer: true,
  inputReadOnly: false,
  locale: navigator.language,
  placeholder: 'Select time',
  size: null,
  value: null,
  variant: 'roll'
}

const DefaultType = {
  ...Picker.DefaultType,
  cleaner: 'boolean',
  container: 'string',
  disabled: 'boolean',
  inputReadOnly: 'boolean',
  locale: 'string',
  placeholder: 'string',
  size: '(string|null)',
  value: '(date|string|null)',
  variant: 'string'
}

/**
* ------------------------------------------------------------------------
* Class Definition
* ------------------------------------------------------------------------
*/

class TimePicker extends Picker {
  constructor(element, config) {
    super(element)

    this._config = this._getConfig(config)
    this._date = this._convertStringToDate(this._config.value)
    this._ampm = this._date ? getAmPm(new Date(this._date), this._config.locale) : 'am'
    this._uid = Math.random().toString(36).slice(2)

    // subcomponents
    this._input = null
    this._selectAmPm = null
    this._selectHours = null
    this._selectMinutes = null
    this._selectSeconds = null
    this._timePickerBody = null

    this._createTimePicker()
    this._createTimePickerSelection()
    this._addEventListeners()

    const children = SelectorEngine.find('.selected', this._element)

    if (children) {
      children.forEach(child => this._scrollTop(child.parentNode, child))
    }
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

  clear() {
    this._date = null
    this._input.value = ''
    this._timePickerBody.innerHTML = ''
    this._createTimePickerSelection()
  }

  reset() {
    this._date = this._convertStringToDate(this._config.value)
    this._input.value = this._convertStringToDate(this._config.value).toLocaleTimeString(this._config.locale)
    this._timePickerBody.innerHTML = ''
    this._createTimePickerSelection()
  }

  update(config) {
    this._config = this._getConfig(config)
    this._element.innerHTML = ''
    this._createTimePicker()
    this._createTimePickerSelection()
  }

  // Private
  _addEventListeners() {
    EventHandler.on(this._element, 'click', '.picker-input-group-cleaner', event => {
      event.stopPropagation()
      this.clear()
    })
    EventHandler.on(this._element, 'onCancelClick.coreui.picker', () => {
      this.reset()
    })
  }

  _convertStringToDate(date) {
    return date ? (date instanceof Date ? date : new Date(`1970-01-01 ${this._config.value}`)) : null
  }

  _createInputGroup() {
    const inputGroupEl = document.createElement('div')
    inputGroupEl.classList.add('input-group', 'picker-input-group')

    if (this._config.size) {
      inputGroupEl.classList.add(`input-group-${this._config.size}`)
    }

    const inputEl = document.createElement('input')
    inputEl.classList.add('form-control')
    inputEl.disabled = this._config.disabled
    inputEl.placeholder = this._config.placeholder
    inputEl.readOnly = this._config.inputReadOnly
    inputEl.type = 'text'
    inputEl.value = this._date ? this._date.toLocaleTimeString(this._config.locale) : ''

    const inputGroupTextEl = document.createElement('span')
    inputGroupTextEl.classList.add('input-group-text')
    inputGroupTextEl.innerHTML = `
      <span class="picker-input-group-indicator">
        <span class="picker-input-group-icon time-picker-input-icon"></span>
      </span>`

    if (this._config.cleaner) {
      inputGroupTextEl.innerHTML += `
        <span class="picker-input-group-cleaner" role="button">
          <span class="picker-input-group-icon time-picker-cleaner-icon"></span>
        </span>`
    }

    inputGroupEl.append(inputEl, inputGroupTextEl)
    this._input = inputEl

    return inputGroupEl
  }

  _createTimePicker() {
    this._element.classList.add('time-picker')

    if (this._config.container === 'dropdown') {
      this._dropdownToggleEl.append(this._createInputGroup())
      this._dropdownMenuEl.prepend(this._createTimePickerBody())
    }

    if (this._config.container === 'inline') {
      this._element.append(this._createTimePickerBody())
    }
  }

  _createTimePickerBody() {
    const timePickerBodyEl = document.createElement('div')
    timePickerBodyEl.classList.add('time-picker-body')

    if (this._config.variant === 'roll') {
      timePickerBodyEl.classList.add('time-picker-roll')
    }

    this._timePickerBody = timePickerBodyEl

    return timePickerBodyEl
  }

  _createTimePickerSelection() {
    const selectedHour = this._date ?
    (isAmPm(this._config.locale) ?
      convert24hTo12h(this._date.getHours()) :
      this._date.getHours()) :
    null
    const selectedMinute = this._date ? this._date.getMinutes() : null
    const selectedSecond = this._date ? this._date.getSeconds() : null

    if (this._config.variant === 'roll') {
      this._createTimePickerRoll(selectedHour, selectedMinute, selectedSecond)
    }

    if (this._config.variant === 'select') {
      this._createTimePickerSelect(selectedHour, selectedMinute, selectedSecond)
    }
  }

  _createSelect(className, options, element, selected) {
    const selectEl = document.createElement('select')
    selectEl.classList.add('form-select', 'form-select-sm', className)
    selectEl.disabled = this._config.disabled
    selectEl.addEventListener('change', event => this._handleTimeChange(className, event.target.value))

    options.forEach(option => {
      const optionEl = document.createElement('option')
      optionEl.value = option.value
      optionEl.innerHTML = option.label

      selectEl.append(optionEl)
    })

    if (selected) {
      selectEl.value = selected.toString()
    }

    this[element] = selectEl
    return selectEl
  }

  _createTimePickerSelect(selectedHour, selectedMinute, selectedSecond) {
    const timeSeparatorEl = document.createElement('div')
    timeSeparatorEl.classList.add('time-separator')
    timeSeparatorEl.innerHTML = ':'

    this._timePickerBody.innerHTML = '<span class="time-picker-inline-icon"></span>'
    this._timePickerBody.append(
      this._createSelect('hours', this._getHours(), '_selectHours', selectedHour),
      timeSeparatorEl.cloneNode(true),
      this._createSelect('minutes', this._getMinutesOrSeconds(), '_selectMinutes', selectedMinute),
      timeSeparatorEl,
      this._createSelect('seconds', this._getMinutesOrSeconds(), '_selectSeconds', selectedSecond)
    )

    if (isAmPm(this._config.locale)) {
      this._timePickerBody.append(
        this._createSelect('toggle', [{ value: 'am', label: 'AM' }, { value: 'pm', label: 'PM' }], '_selectAmPm', this._ampm)
      )
    }
  }

  _createTimePickerRoll(selectedHour, selectedMinute, selectedSecond) {
    this._timePickerBody.append(
      this._createTimePickerRollCol(this._getHours(), 'hours', selectedHour),
      this._createTimePickerRollCol(this._getMinutesOrSeconds(), 'minutes', selectedMinute),
      this._createTimePickerRollCol(this._getMinutesOrSeconds(), 'seconds', selectedSecond)
    )

    if (isAmPm(this._config.locale)) {
      this._timePickerBody.append(
        this._createTimePickerRollCol([{ value: 'am', label: 'AM' }, { value: 'pm', label: 'PM' }], 'toggle', this._ampm)
      )
    }
  }

  _createTimePickerRollCol(options, part, selected) {
    const timePickerRollColEl = document.createElement('div')
    timePickerRollColEl.classList.add('time-picker-roll-col')

    options.forEach(option => {
      const timePickerRollCellEl = document.createElement('div')
      timePickerRollCellEl.classList.add('time-picker-roll-cell')
      if (option.value === selected) {
        timePickerRollCellEl.classList.add('selected')
      }

      timePickerRollCellEl.setAttribute('role', 'button')
      timePickerRollCellEl.innerHTML = option.label
      timePickerRollCellEl.addEventListener('click', () => {
        timePickerRollCellEl.classList.add('selected')
        this._scrollTo(timePickerRollColEl, timePickerRollCellEl)

        for (const sibling of timePickerRollColEl.children) {
          if (sibling !== timePickerRollCellEl) {
            sibling.classList.remove('selected')
          }
        }

        this._handleTimeChange(part, option.value)
      })

      timePickerRollColEl.append(timePickerRollCellEl)
    })

    return timePickerRollColEl
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

  _getHours(locale = this._config.locale) {
    return Array.from({ length: isAmPm(locale) ? 12 : 24 }, (_, i) => {
      return {
        value: isAmPm(locale) ? i + 1 : i,
        label: (isAmPm(locale) ? i + 1 : i).toLocaleString(locale)
      }
    })
  }

  _getMinutesOrSeconds(locale = this._config.locale) {
    return Array.from({ length: 60 }, (_, i) => {
      return {
        value: i,
        label: i.toLocaleString(locale).padStart(2, (0).toLocaleString(locale))
      }
    })
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

    if (this._input) {
      this._input.value = _date.toLocaleTimeString(this._config.locale)
    }

    this._date = new Date(_date)

    EventHandler.trigger(this._element, EVENT_CHANGE, {
      timeString: _date.toTimeString(),
      localeTimeString: _date.toLocaleTimeString(),
      date: _date
    })
  }

  _scrollTo(parent, children) {
    parent.scrollTo({ top: children.offsetTop, behavior: 'smooth' })
  }

  _scrollTop(parent, children) {
    parent.scrollTop = children.offsetTop
  }

  _updateTimePicker() {
    this._element.innerHTML = ''
    this._createTimePicker()
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
      const data = TimePicker.getOrCreateInstance(this)

      if (typeof config !== 'string') {
        return
      }

      if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config](this)
    })
  }
}

/**
* ------------------------------------------------------------------------
* Data Api implementation
* ------------------------------------------------------------------------
*/

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  const timePickers = SelectorEngine.find(SELECTOR_DATA_TOGGLE)
  for (let i = 0, len = timePickers.length; i < len; i++) {
    TimePicker.timePickerInterface(timePickers[i])
  }
})

/**
* ------------------------------------------------------------------------
* jQuery
* ------------------------------------------------------------------------
* add .TimePicker to jQuery only if jQuery is present
*/

defineJQueryPlugin(TimePicker)

export default TimePicker

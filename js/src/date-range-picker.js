/**
 * --------------------------------------------------------------------------
 * CoreUI (v4.1.0): date-range-picker.js
 * Licensed under MIT (https://coreui.io/license)
 * --------------------------------------------------------------------------
 */

import { defineJQueryPlugin, typeCheckConfig } from './util/index'
import EventHandler from './dom/event-handler'
import Manipulator from './dom/manipulator'
import SelectorEngine from './dom/selector-engine'
import BaseComponent from './base-component'
import Calendar from './calendar'
import TimePicker from './time-picker'

/**
* ------------------------------------------------------------------------
* Constants
* ------------------------------------------------------------------------
*/

const NAME = 'date-range-picker'
const DATA_KEY = 'coreui.date-range-picker'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY}`
const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="date-range-picker"]'

const Default = {
  calendars: 2,
  cleaner: true,
  calendarDate: new Date(),
  disabledDates: null,
  endDate: null,
  locale: navigator.language,
  maxDate: null,
  minDate: null,
  placeholder: ['Start date', 'End date'],
  range: true,
  ranges: {},
  size: null,
  startDate: null,
  selectEndDate: false,
  timepicker: false
}

const DefaultType = {
  calendars: 'number',
  cleaner: 'boolean',
  calendarDate: '(date|string|null)',
  disabledDates: '(array|null)',
  endDate: '(date|string|null)',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  placeholder: '(array|string)',
  range: 'boolean',
  ranges: 'object',
  size: '(string|null)',
  startDate: '(date|string|null)',
  selectEndDate: 'boolean',
  timepicker: 'boolean'
}

/**
* ------------------------------------------------------------------------
* Class Definition
* ------------------------------------------------------------------------
*/

class DateRangePicker extends BaseComponent {
  constructor(element, config) {
    super(element)

    this._config = this._getConfig(config)
    this._calendarDate = this._config.calendarDate
    this._startDate = this._config.startDate
    this._endDate = this._config.endDate
    this._selectEndDate = this._config.selectEndDate

    // nodes
    this._calendars = null
    this._calendarStart = null
    this._calendarEnd = null
    this._dateRangePicker = null
    this._endInput = null
    this._startInput = null
    this._timePickerEnd = null
    this._timePickerStart = null

    this._createDateRangePicker()
    this._createCalendars()
    this._addEventListeners()
    this._addCalendarEventListeners()
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
    this._endDate = null
    this._endInput.value = ''
    this._startDate = null
    this._startInput.value = ''
    this._element.innerHTML = ''
    this._createDateRangePicker()
    this._createCalendars()
    this._addEventListeners()
    this._addCalendarEventListeners()
  }

  update(config) {
    this._config = this._getConfig(config)
    this._element.innerHTML = ''
    this._createDateRangePicker()
    this._createCalendars()
    this._addEventListeners()
    this._addCalendarEventListeners()
  }

  // Private
  _addEventListeners() {
    EventHandler.on(this._startInput, 'click', () => {
      this._selectEndDate = false
    })
    EventHandler.on(this._endInput, 'click', () => {
      this._selectEndDate = true
    })
    EventHandler.on(this._element, 'click', '.picker-input-group-cleaner', event => {
      event.stopPropagation()
      this.clear()
    })
  }

  _addCalendarEventListeners() {
    SelectorEngine.find('.calendar', this._element).forEach(calendar => {
      EventHandler.on(calendar, 'calendarDateChange.coreui.calendar', event => {
        this._calendarDate = event.date

        this._updateCalendars()
      })
      EventHandler.on(calendar, 'startDateChange.coreui.calendar', event => {
        this._startDate = event.date
        this._selectEndDate = event.selectEndDate
        this._startInput.value = this._setInputValue(event.date)
        this._updateCalendars()

        EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, {
          date: event.date
        })
      })
      EventHandler.on(calendar, 'endDateChange.coreui.calendar', event => {
        this._endDate = event.date
        this._selectEndDate = event.selectEndDate
        this._endInput.value = this._setInputValue(event.date)
        this._updateCalendars()

        EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, {
          date: event.date
        })
      })
      EventHandler.on(calendar, 'cellHover.coreui.calendar', event => {
        if (this._selectEndDate) {
          this._endInput.value = event.date ? event.date.toLocaleDateString(this._config.locale) : (this._endDate ? this._setInputValue(this._endDate) : '')
          return
        }

        this._startInput.value = event.date ? event.date.toLocaleDateString(this._config.locale) : (this._startDate ? this._setInputValue(this._startDate) : '')
      })
    })
  }

  _createInputGroup() {
    const inputGroupEl = document.createElement('div')
    inputGroupEl.classList.add('input-group', 'picker-input-group')

    if (this._config.size) {
      inputGroupEl.classList.add(`input-group-${this._config.size}`)
    }

    if (!this._config.disabled) {
      Manipulator.setDataAttribute(inputGroupEl, 'toggle', 'dropdown')
      Manipulator.setDataAttribute(inputGroupEl, 'autoClose', 'outside')
    }

    const startInputEl = document.createElement('input')
    startInputEl.classList.add('form-control')
    startInputEl.disabled = this._config.disabled
    startInputEl.placeholder = this._getPlaceholder()[0]
    startInputEl.readOnly = this._config.inputReadOnly
    startInputEl.type = 'text'
    startInputEl.value = this._setInputValue(this._startDate)

    const endInputEl = document.createElement('input')
    endInputEl.classList.add('form-control')
    endInputEl.disabled = this._config.disabled
    endInputEl.placeholder = this._getPlaceholder()[1]
    endInputEl.readOnly = this._config.inputReadOnly
    endInputEl.type = 'text'
    endInputEl.value = this._setInputValue(this._endDate)

    const inputGroupTextSeparatorEl = document.createElement('span')
    inputGroupTextSeparatorEl.classList.add('input-group-text')
    inputGroupTextSeparatorEl.innerHTML = '<span class="picker-input-group-icon date-picker-arrow-icon"></span>'

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

    this._startInput = startInputEl
    this._endInput = endInputEl

    if (this._config.range) {
      inputGroupEl.append(startInputEl, inputGroupTextSeparatorEl, endInputEl, inputGroupTextEl)
    } else {
      inputGroupEl.append(startInputEl, inputGroupTextEl)
    }

    return inputGroupEl
  }

  _createCalendars() {
    const calendarStartElement = document.createElement('div')
    calendarStartElement.classList.add('date-picker-calendar')

    Array.from({ length: this._config.calendars }).forEach((_, index) => {
      const calendarEl = document.createElement('div')
      calendarEl.classList.add('date-picker-calendar')

      this._calendars.append(calendarEl)

      // eslint-disable-next-line no-new
      new Calendar(calendarEl, {
        calendarDate: new Date(
          this._calendarDate.getFullYear(),
          this._calendarDate.getMonth() + index,
          1
        ),
        disabledDates: this._config.disabledDates,
        endDate: this._endDate,
        locale: this._config.locale,
        maxDate: this._config.maxDate,
        minDate: this._config.minDate,
        range: this._config.range,
        selectEndDate: this._selectEndDate,
        startDate: this._startDate
      })

      if (this._config.timepicker) {
        if (this._config.calendars === 1 && this._config.range) {
          const timePickerStartEl = document.createElement('div')
          timePickerStartEl.classList.add('time-picker')

          // eslint-disable-next-line no-new
          new TimePicker(timePickerStartEl, {
            container: 'inline',
            date: this._startDate,
            disabled: !this._startDate,
            locale: this._config.locale,
            variant: 'select'
          })
          calendarEl.append(timePickerStartEl)

          EventHandler.one(timePickerStartEl, 'change.coreui.timepicker', event => {
            this._startDate = event.date
            this._startInput.value = this._setInputValue(this._startDate)
            this._updateCalendars()
          })

          const timePickerEndEl = document.createElement('div')
          timePickerEndEl.classList.add('time-picker')

          // eslint-disable-next-line no-new
          new TimePicker(timePickerEndEl, {
            container: 'inline',
            date: this._endDate,
            disabled: !this._endDate,
            locale: this._config.locale,
            variant: 'select'
          })
          calendarEl.append(timePickerEndEl)

          EventHandler.one(timePickerEndEl, 'change.coreui.time-picker', event => {
            this._endDate = event.date
            this._startInput.value = this._setInputValue(this._endDate)
            this._updateCalendars()
          })
        }

        if (index === 0 || this._config.calendars - index === 1) {
          const timePickerEl = document.createElement('div')
          timePickerEl.classList.add('time-picker')

          // eslint-disable-next-line no-new
          new TimePicker(timePickerEl, {
            container: 'inline',
            date: index === 0 ? this._startDate : this._endDate,
            disabled: index === 0 ? !this._startDate : !this._endDate,
            locale: this._config.locale,
            variant: 'select'
          })
          calendarEl.append(timePickerEl)

          EventHandler.one(timePickerEl, 'change.coreui.time-picker', event => {
            if (index === 0) {
              this._startDate = event.date
              this._startInput.value = this._setInputValue(this._startDate)
            } else {
              this._endDate = event.date
              this._endInput.value = this._setInputValue(this._endDate)
            }

            this._updateCalendars()
          })
        }
      }

      this._calendars.append(calendarEl)
    })
  }

  _createDateRangePicker() {
    const dateRangePickerEl = document.createElement('div')
    dateRangePickerEl.classList.add('date-picker', 'picker')

    this._dateRangePicker = dateRangePickerEl

    const dropdownMenuEl = document.createElement('div')
    dropdownMenuEl.classList.add('dropdown-menu')

    const dateRangePickerBodyEl = document.createElement('div')
    dateRangePickerBodyEl.classList.add('date-picker-body')

    if (Object.keys(this._config.ranges).length) {
      const dateRangePickerRangesEl = document.createElement('div')
      dateRangePickerRangesEl.classList.add('date-picker-ranges')

      Object.keys(this._config.ranges).forEach(key => {
        const buttonEl = document.createElement('button')
        buttonEl.classList.add('btn', 'btn-ghost-secondary')
        buttonEl.role = 'button'
        buttonEl.addEventListener('click', () => {
          this._startDate = this._config.ranges[key][0]
          this._endDate = this._config.ranges[key][1]
          this._startInput.value = this._setInputValue(this._startDate)
          this._endInput.value = this._setInputValue(this._endDate)
          this._updateCalendars()
        })

        buttonEl.innerHTML = key
        dateRangePickerRangesEl.append(buttonEl)
      })

      dateRangePickerBodyEl.append(dateRangePickerRangesEl)
    }

    const calendarsEl = document.createElement('div')
    calendarsEl.classList.add('date-picker-calendars')

    this._calendars = calendarsEl

    dateRangePickerBodyEl.append(calendarsEl)
    dropdownMenuEl.append(dateRangePickerBodyEl)
    dateRangePickerEl.append(this._createInputGroup(), dropdownMenuEl)

    this._element.append(dateRangePickerEl)
  }

  _setInputValue(date) {
    return date ?
      (this._config.timepicker ?
        date.toLocaleString(this._config.locale) :
        date.toLocaleDateString(this._config.locale)) :
      ''
  }

  _updateCalendars() {
    this._calendars.innerHTML = ''
    this._createCalendars()
    this._addCalendarEventListeners()
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

  _getPlaceholder() {
    const { placeholder } = this._config

    if (typeof placeholder === 'string') {
      return placeholder.split(',')
    }

    return placeholder
  }

  // Static

  static dateRangePickerInterface(element, config) {
    const data = DateRangePicker.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(config) {
    return this.each(function () {
      const data = DateRangePicker.getOrCreateInstance(this)

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
  const dateRangePickers = SelectorEngine.find(SELECTOR_DATA_TOGGLE)
  for (let i = 0, len = dateRangePickers.length; i < len; i++) {
    DateRangePicker.dateRangePickerInterface(dateRangePickers[i])
  }
})

/**
* ------------------------------------------------------------------------
* jQuery
* ------------------------------------------------------------------------
* add .DateRangePicker to jQuery only if jQuery is present
*/

defineJQueryPlugin(DateRangePicker)

export default DateRangePicker

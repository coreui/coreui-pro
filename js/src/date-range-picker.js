/**
 * --------------------------------------------------------------------------
 * CoreUI PRO (v4.2.0-rc.0): date-range-picker.js
 * License (https://coreui.io/pro/license-new/)
 * --------------------------------------------------------------------------
 */

import { defineJQueryPlugin, typeCheckConfig } from './util/index'
import EventHandler from './dom/event-handler'
import Manipulator from './dom/manipulator'
import SelectorEngine from './dom/selector-engine'
import { getLocalDateFromString } from './util/calendar'
import Calendar from './calendar'
import Picker from './picker'
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
  ...Picker.Default,
  calendars: 2,
  cleaner: true,
  calendarDate: null,
  date: null,
  disabled: false,
  disabledDates: null,
  endDate: null,
  firstDayOfWeek: 1,
  indicator: true,
  locale: 'default',
  maxDate: null,
  minDate: null,
  placeholder: ['Start date', 'End date'],
  range: true,
  ranges: {},
  rangesButtonsClasses: ['btn', 'btn-ghost-secondary'],
  separator: true,
  size: null,
  startDate: null,
  selectEndDate: false,
  timepicker: false
}

const DefaultType = {
  ...Picker.DefaultType,
  calendars: 'number',
  cleaner: 'boolean',
  calendarDate: '(date|string|null)',
  date: '(date|string|null)',
  disabledDates: '(array|null)',
  disabled: 'boolean',
  endDate: '(date|string|null)',
  firstDayOfWeek: 'number',
  indicator: 'boolean',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  placeholder: '(array|string)',
  range: 'boolean',
  ranges: 'object',
  rangesButtonsClasses: '(array|string)',
  separator: 'boolean',
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

class DateRangePicker extends Picker {
  constructor(element, config) {
    super(element)

    this._config = this._getConfig(config)
    this._calendarDate = this._convertStringToDate(this._config.calendarDate || this._config.date || this._config.startDate || new Date())
    this._startDate = this._convertStringToDate(this._config.date || this._config.startDate)
    this._endDate = this._convertStringToDate(this._config.endDate)
    this._initialStartDate = null
    this._initialEndDate = null
    this._mobile = window.innerWidth < 768
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

  cancel() {
    this._endDate = this._initialEndDate
    this._endInput.value = this._setInputValue(this._initialEndDate)
    this._startDate = this._initialStartDate
    this._startInput.value = this._setInputValue(this._initialStartDate)
    this._calendars.innerHTML = ''
    this._createCalendars()
    this._addCalendarEventListeners()
  }

  clear() {
    this._endDate = null
    this._endInput.value = ''
    this._startDate = null
    this._startInput.value = ''
    this._calendars.innerHTML = ''
    this._createCalendars()
    this._addCalendarEventListeners()
  }

  reset() {
    this._endDate = this._config.endDate
    this._endInput.value = this._setInputValue(this._config.endDate)
    this._startDate = this._config.startDate
    this._startInput.value = this._setInputValue(this._config.startDate)
    this._calendars.innerHTML = ''
    this._createCalendars()
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
    EventHandler.on(this._element, 'shown.coreui.dropdown', () => {
      this._initialStartDate = new Date(this._startDate)
      this._initialEndDate = new Date(this._endDate)
    })

    EventHandler.on(this._startInput, 'click', () => {
      this._dropdown.show()
      this._selectEndDate = false
      this._updateCalendars()
    })

    EventHandler.on(this._startInput, 'input', event => {
      const date = getLocalDateFromString(event.target.value, this._config.locale, this._config.timepicker)
      if (date instanceof Date && date.getTime()) {
        this._startDate = date
        this._calendarDate = date
        this._updateCalendars()
      }
    })

    EventHandler.on(this._endInput, 'click', () => {
      this._dropdown.show()
      this._selectEndDate = true
      this._updateCalendars()
    })

    EventHandler.on(this._endInput, 'input', event => {
      const date = getLocalDateFromString(event.target.value, this._config.locale, this._config.timepicker)
      if (date instanceof Date && date.getTime()) {
        this._endDate = date
        this._calendarDate = date
        this._updateCalendars()
      }
    })

    EventHandler.on(this._element, 'click', '.picker-input-group-cleaner', event => {
      event.stopPropagation()
      this.clear()
    })

    EventHandler.on(this._element, 'onCancelClick.coreui.picker', () => {
      this.cancel()
    })

    EventHandler.on(window, 'resize', () => {
      this._mobile = window.innerWidth < 768
    })
  }

  _addCalendarEventListeners() {
    SelectorEngine.find('.calendar', this._element).forEach(calendar => {
      EventHandler.on(calendar, 'startDateChange.coreui.calendar', event => {
        this._startDate = event.date
        this._selectEndDate = event.selectEndDate
        this._startInput.value = this._setInputValue(event.date)
        this._updateCalendars()

        if (!this._config.range && (!this._config.footer && !this._config.timepicker)) {
          this._dropdown.hide()
        }

        EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, {
          date: event.date
        })
      })

      EventHandler.on(calendar, 'endDateChange.coreui.calendar', event => {
        this._endDate = event.date
        this._selectEndDate = event.selectEndDate
        this._endInput.value = this._setInputValue(event.date)
        this._updateCalendars()

        if (this._startDate && (!this._config.footer && !this._config.timepicker)) {
          this._dropdown.hide()
        }

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

  _convertStringToDate(date) {
    return date ? (date instanceof Date ? date : new Date(date)) : null
  }

  _createInput(placeholder, value) {
    const inputEl = document.createElement('input')
    inputEl.classList.add('form-control')
    inputEl.disabled = this._config.disabled
    inputEl.placeholder = placeholder
    inputEl.readOnly = this._config.inputReadOnly
    inputEl.type = 'text'
    inputEl.value = value

    return inputEl
  }

  _createInputGroup() {
    const inputGroupEl = document.createElement('div')
    inputGroupEl.classList.add('input-group', 'picker-input-group')

    if (this._config.size) {
      inputGroupEl.classList.add(`input-group-${this._config.size}`)
    }

    const startInputEl = this._createInput(this._getPlaceholder()[0], this._setInputValue(this._startDate))
    const endInputEl = this._createInput(this._getPlaceholder()[1], this._setInputValue(this._endDate))

    const inputGroupTextSeparatorEl = document.createElement('span')
    inputGroupTextSeparatorEl.classList.add('input-group-text')
    inputGroupTextSeparatorEl.innerHTML = '<span class="picker-input-group-icon date-picker-arrow-icon"></span>'

    const inputGroupTextEl = document.createElement('span')
    inputGroupTextEl.classList.add('input-group-text')
    if (this._config.indicator) {
      inputGroupTextEl.innerHTML = `
        <span class="picker-input-group-indicator">
          <span class="picker-input-group-icon time-picker-input-icon"></span>
        </span>`
    }

    if (this._config.cleaner) {
      inputGroupTextEl.innerHTML += `
        <span class="picker-input-group-cleaner" role="button">
          <span class="picker-input-group-icon time-picker-cleaner-icon"></span>
        </span>`
    }

    this._startInput = startInputEl
    this._endInput = endInputEl

    inputGroupEl.append(startInputEl)

    if (this._config.separator) {
      inputGroupEl.append(inputGroupTextSeparatorEl)
    }

    if (this._config.range) {
      inputGroupEl.append(endInputEl)
    }

    if (this._config.indicator || this._config.cleaner) {
      inputGroupEl.append(inputGroupTextEl)
    }

    return inputGroupEl
  }

  _createCalendars() {
    Array.from({ length: this._mobile ? 1 : this._config.calendars }).forEach((_, index) => {
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
        firstDayOfWeek: this._config.firstDayOfWeek,
        locale: this._config.locale,
        maxDate: this._config.maxDate,
        minDate: this._config.minDate,
        range: this._config.range,
        selectEndDate: this._selectEndDate,
        startDate: this._startDate
      })

      EventHandler.one(calendarEl, 'calendarDateChange.coreui.calendar', event => {
        this._calendarDate = new Date(
          event.date.getFullYear(),
          event.date.getMonth() - index,
          1
        )
        this._updateCalendars()
      })

      if (this._config.timepicker) {
        if ((this._config.calendars === 1 || this._mobile) && this._config.range) {
          const timePickerStartEl = document.createElement('div')
          timePickerStartEl.classList.add('time-picker')

          // eslint-disable-next-line no-new
          new TimePicker(timePickerStartEl, {
            container: 'inline',
            disabled: !this._startDate,
            locale: this._config.locale,
            time: this._startDate,
            variant: 'select'
          })
          calendarEl.append(timePickerStartEl)

          EventHandler.one(timePickerStartEl, 'timeChange.coreui.time-picker', event => {
            this._startDate = event.date
            this._startInput.value = this._setInputValue(this._startDate)
            this._updateCalendars()
          })

          const timePickerEndEl = document.createElement('div')
          timePickerEndEl.classList.add('time-picker')

          // eslint-disable-next-line no-new
          new TimePicker(timePickerEndEl, {
            container: 'inline',
            disabled: !this._endDate,
            locale: this._config.locale,
            time: this._endDate,
            variant: 'select'
          })
          calendarEl.append(timePickerEndEl)

          EventHandler.one(timePickerEndEl, 'timeChange.coreui.time-picker', event => {
            this._endDate = event.date
            this._endInput.value = this._setInputValue(this._endDate)
            this._updateCalendars()
          })
        }

        if (!this._mobile && (index === 0 || this._config.calendars - index === 1)) {
          const timePickerEl = document.createElement('div')
          timePickerEl.classList.add('time-picker')

          // eslint-disable-next-line no-new
          new TimePicker(timePickerEl, {
            container: 'inline',
            disabled: index === 0 ? !this._startDate : !this._endDate,
            locale: this._config.locale,
            time: index === 0 ? this._startDate : this._endDate,
            variant: 'select'
          })
          calendarEl.append(timePickerEl)

          EventHandler.one(timePickerEl, 'timeChange.coreui.time-picker', event => {
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
    this._element.classList.add('date-picker')
    this._dropdownToggleEl.append(this._createInputGroup())
    this._dropdownMenuEl.prepend(this._createDateRangePickerBody())
  }

  _createDateRangePickerBody() {
    const dateRangePickerBodyEl = document.createElement('div')
    dateRangePickerBodyEl.classList.add('date-picker-body')

    if (Object.keys(this._config.ranges).length) {
      const dateRangePickerRangesEl = document.createElement('div')
      dateRangePickerRangesEl.classList.add('date-picker-ranges')

      Object.keys(this._config.ranges).forEach(key => {
        const buttonEl = document.createElement('button')
        buttonEl.classList.add(...this._getButtonClasses(this._config.rangesButtonsClasses))
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

    return dateRangePickerBodyEl
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

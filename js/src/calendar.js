/* eslint-disable multiline-ternary */
/* eslint-disable no-mixed-operators */
/* eslint-disable indent */
/**
 * --------------------------------------------------------------------------
 * CoreUI (v4.1.0): calendar.js
 * Licensed under MIT (https://coreui.io/license)
 * --------------------------------------------------------------------------
 */

import { defineJQueryPlugin, typeCheckConfig } from './util/index'
import EventHandler from './dom/event-handler'
import Manipulator from './dom/manipulator'
import {
  createGroupsInArray,
  getMonthDetails,
  getMonthsNames,
  getYears,
  isDisabled,
  isDateInRange,
  isDateSelected,
  isLastDayOfMonth,
  isToday,
  isStartDate,
  isEndDate } from './util/calendar'
import BaseComponent from './base-component'

/**
* ------------------------------------------------------------------------
* Constants
* ------------------------------------------------------------------------
*/

const NAME = 'calendar'
const DATA_KEY = 'coreui.calendar'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CALENDAR_DATE_CHANGE = `calendarDateChange${EVENT_KEY}`
const EVENT_CELL_HOVER = `cellHover${EVENT_KEY}`
const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`
const EVENT_MOUSEENTER = `mouseenter${EVENT_KEY}`
const EVENT_MOUSELEAVE = `mouseleave${EVENT_KEY}`
const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY}`

const CLASS_NAME_CALENDAR = 'calendar'

const SELECTOR_CALENDAR = '.calendar'
const SELECTOR_CALENDAR_CELL_INNER = '.calendar-cell-inner'

const Default = {
  calendarDate: new Date(),
  disabledDates: null,
  endDate: null,
  firstDayOfWeek: 1,
  locale: navigator.language,
  maxDate: null,
  minDate: null,
  range: true,
  startDate: null,
  selectEndDate: false,
  weekdayLength: 2
}

const DefaultType = {
  calendarDate: '(date|string|null)',
  disabledDates: '(array|null)',
  endDate: '(date|string|null)',
  firstDayOfWeek: 'number',
  locale: 'string',
  maxDate: '(date|string|null)',
  minDate: '(date|string|null)',
  range: 'boolean',
  startDate: '(date|string|null)',
  selectEndDate: 'boolean',
  weekdayLength: 'number'
}

/**
* ------------------------------------------------------------------------
* Class Definition
* ------------------------------------------------------------------------
*/

class Calendar extends BaseComponent {
  constructor(element, config) {
    super(element)

    this._config = this._getConfig(config)
    this._calendarDate = this._config.calendarDate
    this._startDate = this._config.startDate
    this._endDate = this._config.endDate
    this._selectEndDate = this._config.selectEndDate
    this._view = 'days'
    this._createCalendar()
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

  // Private
  _addEventListeners() {
    // Cell interactions
    EventHandler.on(this._element, 'click', SELECTOR_CALENDAR_CELL_INNER, event => {
      event.preventDefault()
      if (event.target.classList.contains('day')) {
        this._selectDate(Manipulator.getDataAttribute(event.target, 'date'))
      }

      if (event.target.classList.contains('month')) {
        this._setCalendarDate(new Date(this._calendarDate.getFullYear(), Manipulator.getDataAttribute(event.target, 'month'), 1))
        this._view = 'days'
      }

      if (event.target.classList.contains('year')) {
        this._calendarDate = new Date(Manipulator.getDataAttribute(event.target, 'year'), this._calendarDate.getMonth(), 1)
        this._view = 'months'
      }

      this._updateCalendar()
    })

    EventHandler.on(this._element, EVENT_MOUSEENTER, SELECTOR_CALENDAR_CELL_INNER, event => {
      event.preventDefault()
      if (event.target.parentElement.classList.contains('disabled')) {
        return
      }

      EventHandler.trigger(this._element, EVENT_CELL_HOVER, {
        date: new Date(Manipulator.getDataAttribute(event.target, 'date'))
      })
    })

    EventHandler.on(this._element, EVENT_MOUSELEAVE, SELECTOR_CALENDAR_CELL_INNER, event => {
      event.preventDefault()
      EventHandler.trigger(this._element, EVENT_CELL_HOVER, {
        date: null
      })
    })

    // Navigation
    EventHandler.on(this._element, 'click', '.btn-prev', event => {
      event.preventDefault()
      this._modifyCalendarDate(0, -1)
    })

    EventHandler.on(this._element, 'click', '.btn-double-prev', event => {
      event.preventDefault()
      this._modifyCalendarDate(-1)
    })

    EventHandler.on(this._element, 'click', '.btn-next', event => {
      event.preventDefault()
      this._modifyCalendarDate(0, 1)
    })

    EventHandler.on(this._element, 'click', '.btn-double-next', event => {
      event.preventDefault()
      this._modifyCalendarDate(1)
    })

    EventHandler.on(this._element, 'click', '.btn-month', event => {
      event.preventDefault()
      this._view = 'months'
      this._element.innerHTML = ''
      this._createCalendar()
    })

    EventHandler.on(this._element, 'click', '.btn-year', event => {
      event.preventDefault()
      this._view = 'years'
      this._element.innerHTML = ''
      this._createCalendar()
    })
  }

  _setCalendarDate(date) {
    this._calendarDate = date

    EventHandler.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
      date
    })
  }

  _modifyCalendarDate(years, months = 0) {
    const year = this._calendarDate.getFullYear()
    const month = this._calendarDate.getMonth()
    const d = new Date(year, month, 1)

    if (years) {
      d.setFullYear(d.getFullYear() + years)
    }

    if (months) {
      d.setMonth(d.getMonth() + months)
    }

    this._calendarDate = d

    EventHandler.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
      date: d
    })

    this._updateCalendar()
  }

  _setEndDate(date, selectEndDate = false) {
    this._endDate = new Date(date)
    EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, {
      date: this._endDate,
      selectEndDate
    })
  }

  _setStartDate(date, selectEndDate = true) {
    this._startDate = new Date(date)
    EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, {
      date: this._startDate,
      selectEndDate
    })
  }

  _selectDate(date) {
    if (isDisabled(date, this._config.minDate, this._config.maxDate, this._config.disabledDates)) {
      return
    }

    if (this._config.range) {
      if (this._selectEndDate) {
        if (this._startDate && this._startDate > new Date(date)) {
          this._setEndDate(this._startDate)
          this._setStartDate(date)
        } else {
          this._setEndDate(date)
        }
      } else {
        this._setStartDate(date, true)
      }
    } else {
      this._setStartDate(date)
    }
  }

  _createCalendar() {
    const { firstDayOfWeek, locale, weekdayLength } = this._config
    const year = this._calendarDate.getFullYear()
    const month = this._calendarDate.getMonth()

    // Create navigation
    const navigationElement = document.createElement('div')
    navigationElement.classList.add('calendar-nav')
    navigationElement.innerHTML = `
      <div class="calendar-nav-prev">
        <button class="btn btn-transparent btn-sm btn-double-prev">
          <span class="calendar-nav-icon calendar-nav-icon-double-prev"></span>
        </button>
        <button class="btn btn-transparent btn-sm btn-prev">
          <span class="calendar-nav-icon calendar-nav-icon-prev"></span>
        </button>
      </div>
      <div class="calendar-nav-date">
        <button class="btn btn-transparent btn-sm btn-month">
          ${this._calendarDate.toLocaleDateString(locale, { month: 'long' })}
        </button>
        <button class="btn btn-transparent btn-sm btn-year">
          ${this._calendarDate.toLocaleDateString(locale, { year: 'numeric' })}
        </button>
      </div>
      <div class="calendar-nav-next">
        <button class="btn btn-transparent btn-sm btn-next">
          <span class="calendar-nav-icon calendar-nav-icon-next"></span>
        </button>
        <button class="btn btn-transparent btn-sm btn-double-next">
          <span class="calendar-nav-icon calendar-nav-icon-double-next"></span>
        </button>
      </div>
    `

    const monthDetails = getMonthDetails(year, month, firstDayOfWeek)
    const listOfMonths = createGroupsInArray(getMonthsNames(locale), 4)
    const listOfYears = createGroupsInArray(getYears(this._calendarDate.getFullYear()), 4)
    const weekDays = monthDetails[0]

    const calendarTable = document.createElement('table')
    calendarTable.innerHTML = `
    ${this._view === 'days' ? `
      <thead>
        <tr>
          ${weekDays.map(({ date }) => (
            `<th class="calendar-cell">
              <div class="calendar-header-cell-inner">
                ${date.toLocaleDateString(locale, { weekday: 'long' }).slice(0, weekdayLength)}
              </div>
            </th>`
          )).join('')}
        </tr>
      </thead>` : ''}
      <tbody>
        ${this._view === 'days' ? monthDetails.map(week => (
          `<tr>${week.map(({ date, month }) => (
            `<td class="calendar-cell ${this._dayClassNames(date, month)}">
              <div
                class="calendar-cell-inner day"
                data-coreui-date="${date}"
              >${date.toLocaleDateString(locale, { day: 'numeric' })}</div>
            </td>`
          )).join('')}</tr>`
        )).join('') : ''}
        ${this._view === 'months' ? listOfMonths.map((row, index) => (
          `<tr>${row.map((month, idx) => (
            `<td class="calendar-cell">
              <div class="calendar-cell-inner month" data-coreui-month="${index * 3 + idx}">
                ${month}
              </div>
            </td>`
          )).join('')}</tr>`
        )).join('') : ''}
        ${this._view === 'years' ? listOfYears.map(row => (
          `<tr>${row.map(year => (
            `<td class="calendar-cell">
              <div class="calendar-cell-inner year" data-coreui-year="${year}">
                ${year}
              </div>
            </td>`
          )).join('')}</tr>`
        )).join('') : ''}
      </tbody>
    `

    this._element.classList.add(CLASS_NAME_CALENDAR)
    this._element.append(navigationElement, calendarTable)
  }

  _updateCalendar() {
    this._element.innerHTML = ''
    this._createCalendar()
  }

  _dayClassNames(date, month) {
    const classNames = [
      isToday(date) && 'today',
      isDisabled(date, this._config.minDate, this._config.maxDate, this._config.disabledDates) && 'disabled',
      `${month}`,
      isLastDayOfMonth(date) && 'last',
      month === 'current' && isDateInRange(date, this._startDate, this._endDate) && 'range',
      isDateSelected(date, this._startDate, this._endDate) && 'selected',
      isStartDate(date, this._startDate, this._endDate) && 'start',
      isEndDate(date, this._startDate, this._endDate) && 'end'
    ]
    return classNames.join(' ')
  }

  _getConfig(config) {
    config = {
      ...this.constructor.Default,
      ...Manipulator.getDataAttributes(this._element),
      ...config
    }

    typeCheckConfig(NAME, config, DefaultType)
    return config
  }

  // Static

  static calendarInterface(element, config) {
    const data = Calendar.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(config) {
    return this.each(function () {
      const data = Calendar.getOrCreateInstance(this)

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
  Array.from(document.querySelectorAll(SELECTOR_CALENDAR)).forEach(element => {
    Calendar.calendarInterface(element)
  })
})

/**
* ------------------------------------------------------------------------
* jQuery
* ------------------------------------------------------------------------
* add .Calendar to jQuery only if jQuery is present
*/

defineJQueryPlugin(Calendar)

export default Calendar

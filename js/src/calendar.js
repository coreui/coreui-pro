/* eslint-disable complexity, indent, multiline-ternary, @stylistic/multiline-ternary */
/**
 * --------------------------------------------------------------------------
 * CoreUI PRO calendar.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import { defineJQueryPlugin } from './util/index.js'
import {
  convertToDateObject,
  createGroupsInArray,
  getCalendarDate,
  getDateBySelectionType,
  getMonthDetails,
  getMonthsNames,
  getYears,
  isDateDisabled,
  isDateInRange,
  isDateSelected,
  isDisableDateInRange,
  isMonthDisabled,
  isMonthInRange,
  isMonthSelected,
  isToday,
  isYearDisabled,
  isYearInRange,
  isYearSelected,
  setTimeFromDate
} from './util/calendar.js'

/**
 * Constants
 */

const NAME = 'calendar'
const DATA_KEY = 'coreui.calendar'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const ARROW_UP_KEY = 'ArrowUp'
const ARROW_RIGHT_KEY = 'ArrowRight'
const ARROW_DOWN_KEY = 'ArrowDown'
const ARROW_LEFT_KEY = 'ArrowLeft'
const ENTER_KEY = 'Enter'
const SPACE_KEY = 'Space'

const EVENT_BLUR = `blur${EVENT_KEY}`
const EVENT_CALENDAR_DATE_CHANGE = `calendarDateChange${EVENT_KEY}`
const EVENT_CALENDAR_MOUSE_LEAVE = `calendarMouseleave${EVENT_KEY}`
const EVENT_CELL_HOVER = `cellHover${EVENT_KEY}`
const EVENT_END_DATE_CHANGE = `endDateChange${EVENT_KEY}`
const EVENT_FOCUS = `focus${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_SELECT_END_CHANGE = `selectEndChange${EVENT_KEY}`
const EVENT_START_DATE_CHANGE = `startDateChange${EVENT_KEY}`
const EVENT_MOUSEENTER = `mouseenter${EVENT_KEY}`
const EVENT_MOUSELEAVE = `mouseleave${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_CALENDAR_CELL = 'calendar-cell'
const CLASS_NAME_CALENDAR_CELL_INNER = 'calendar-cell-inner'
const CLASS_NAME_CALENDAR_ROW = 'calendar-row'
const CLASS_NAME_CALENDARS = 'calendars'
const CLASS_NAME_SHOW_WEEK_NUMBERS = 'show-week-numbers'

const SELECTOR_BTN_DOUBLE_NEXT = '.btn-double-next'
const SELECTOR_BTN_DOUBLE_PREV = '.btn-double-prev'
const SELECTOR_BTN_MONTH = '.btn-month'
const SELECTOR_BTN_NEXT = '.btn-next'
const SELECTOR_BTN_PREV = '.btn-prev'
const SELECTOR_BTN_YEAR = '.btn-year'
const SELECTOR_CALENDAR = '.calendar'
const SELECTOR_CALENDAR_CELL = '.calendar-cell'
const SELECTOR_CALENDAR_CELL_CLICKABLE = `${SELECTOR_CALENDAR_CELL}[tabindex="0"]`
const SELECTOR_CALENDAR_ROW = '.calendar-row'
const SELECTOR_CALENDAR_ROW_CLICKABLE = `${SELECTOR_CALENDAR_ROW}[tabindex="0"]`
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="calendar"]'

const Default = {
  ariaNavNextMonthLabel: 'Next month',
  ariaNavNextYearLabel: 'Next year',
  ariaNavPrevMonthLabel: 'Previous month',
  ariaNavPrevYearLabel: 'Previous year',
  calendarDate: null,
  calendars: 1,
  disabledDates: null,
  endDate: null,
  firstDayOfWeek: 1,
  locale: 'default',
  maxDate: null,
  minDate: null,
  range: false,
  selectAdjacementDays: false,
  selectEndDate: false,
  selectionType: 'day',
  showAdjacementDays: true,
  showWeekNumber: false,
  startDate: null,
  weekdayFormat: 2,
  weekNumbersLabel: null
}

const DefaultType = {
  ariaNavNextMonthLabel: 'string',
  ariaNavNextYearLabel: 'string',
  ariaNavPrevMonthLabel: 'string',
  ariaNavPrevYearLabel: 'string',
  calendarDate: '(date|number|string|null)',
  calendars: 'number',
  disabledDates: '(array|date|function|null)',
  endDate: '(date|number|string|null)',
  firstDayOfWeek: 'number',
  locale: 'string',
  maxDate: '(date|number|string|null)',
  minDate: '(date|number|string|null)',
  range: 'boolean',
  selectAdjacementDays: 'boolean',
  selectEndDate: 'boolean',
  selectionType: 'string',
  showAdjacementDays: 'boolean',
  showWeekNumber: 'boolean',
  startDate: '(date|number|string|null)',
  weekdayFormat: '(number|string)',
  weekNumbersLabel: '(string|null)'
}

/**
 * Class definition
 */

class Calendar extends BaseComponent {
  constructor(element, config) {
    super(element)

    this._config = this._getConfig(config)
    this._initializeDates()
    this._initializeView()
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

  // Public
  update(config) {
    this._config = this._getConfig(config)
    this._initializeDates()
    this._initializeView()

    // Clear the current calendar content
    this._element.innerHTML = ''
    this._createCalendar()
  }

  // Private
  _focusOnFirstAvailableCell() {
    const cell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL_CLICKABLE, this._element)

    if (cell) {
      cell.focus()
    }
  }

  _getDate(target) {
    if (this._config.selectionType === 'week') {
      const firstCell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, target.closest(SELECTOR_CALENDAR_ROW))
      return new Date(Manipulator.getDataAttribute(firstCell, 'date'))
    }

    return new Date(Manipulator.getDataAttribute(target, 'date'))
  }

  _handleCalendarClick(event) {
    const target = event.target.classList.contains(CLASS_NAME_CALENDAR_CELL_INNER) ? event.target.parentElement : event.target
    const date = this._getDate(target)
    const cloneDate = new Date(date)
    const index = Manipulator.getDataAttribute(target.closest(SELECTOR_CALENDAR), 'calendar-index')

    if (this._view === 'days') {
      this._setCalendarDate(index ? new Date(cloneDate.setMonth(cloneDate.getMonth() - index)) : date)
    }

    if (this._view === 'months' && this._config.selectionType !== 'month') {
      this._setCalendarDate(index ? new Date(cloneDate.setMonth(cloneDate.getMonth() - index)) : date)
      this._view = 'days'
      this._updateCalendar(this._focusOnFirstAvailableCell.bind(this))
      return
    }

    if (this._view === 'years' && this._config.selectionType !== 'year') {
      this._setCalendarDate(index ? new Date(cloneDate.setFullYear(cloneDate.getFullYear() - index)) : date)
      this._view = 'months'
      this._updateCalendar(this._focusOnFirstAvailableCell.bind(this))
      return
    }

    // Allow to change the calendarDate but not startDate or endDate
    if (isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)) {
      return
    }

    this._hoverDate = null
    this._selectDate(date)
    this._updateClassNamesAndAriaLabels()
  }

  _handleCalendarKeydown(event) {
    const date = this._getDate(event.target)

    if (event.code === SPACE_KEY || event.key === ENTER_KEY) {
      event.preventDefault()
      this._handleCalendarClick(event)
    }

    if (
      event.key === ARROW_RIGHT_KEY ||
      event.key === ARROW_LEFT_KEY ||
      event.key === ARROW_UP_KEY ||
      event.key === ARROW_DOWN_KEY
    ) {
      event.preventDefault()

      if (
        this._maxDate &&
        date >= convertToDateObject(this._maxDate, this._config.selectionType) &&
        (event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY)
      ) {
        return
      }

      if (
        this._minDate &&
        date <= convertToDateObject(this._minDate, this._config.selectionType) &&
        (event.key === ARROW_LEFT_KEY || event.key === ARROW_UP_KEY)
      ) {
        return
      }

      let element = event.target

      if (this._config.selectionType === 'week' && element.tabIndex === -1) {
        element = element.closest(SELECTOR_CALENDAR_ROW_CLICKABLE)
      }

      const list = SelectorEngine.find(
        this._config.selectionType === 'week' ? SELECTOR_CALENDAR_ROW_CLICKABLE : SELECTOR_CALENDAR_CELL_CLICKABLE,
        this._element
      )

      const index = list.indexOf(element)
      const first = index === 0
      const last = index === list.length - 1

      const toBoundary = {
        start: index,
        end: list.length - (index + 1)
      }

      const gap = {
        ArrowRight: 1,
        ArrowLeft: -1,
        ArrowUp: this._config.selectionType === 'week' && this._view === 'days' ? -1 : (this._view === 'days' ? -7 : -3),
        ArrowDown: this._config.selectionType === 'week' && this._view === 'days' ? 1 : (this._view === 'days' ? 7 : 3)
      }

      if (
        (event.key === ARROW_RIGHT_KEY && last) ||
        (event.key === ARROW_DOWN_KEY && toBoundary.end < gap.ArrowDown) ||
        (event.key === ARROW_LEFT_KEY && first) ||
        (event.key === ARROW_UP_KEY && toBoundary.start < Math.abs(gap.ArrowUp))
      ) {
        const callback = key => {
          const _list = SelectorEngine.find(`${SELECTOR_CALENDAR_CELL_CLICKABLE}, ${SELECTOR_CALENDAR_ROW_CLICKABLE}`, this._element)

          if (_list.length && key === ARROW_RIGHT_KEY) {
            _list[0].focus()
          }

          if (_list.length && key === ARROW_LEFT_KEY) {
            _list[_list.length - 1].focus()
          }

          if (_list.length && key === ARROW_DOWN_KEY) {
            _list[gap.ArrowDown - (list.length - index)].focus()
          }

          if (_list.length && key === ARROW_UP_KEY) {
            _list[_list.length - (Math.abs(gap.ArrowUp) + 1 - (index + 1))].focus()
          }
        }

        if (this._view === 'days') {
          this._modifyCalendarDate(0, event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY ? 1 : -1, callback.bind(this, event.key))
        }

        if (this._view === 'months') {
          this._modifyCalendarDate(event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY ? 1 : -1, 0, callback.bind(this, event.key))
        }

        if (this._view === 'years') {
          this._modifyCalendarDate(event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY ? 10 : -10, 0, callback.bind(this, event.key))
        }

        return
      }

      if (list[index + gap[event.key]].tabIndex === 0) {
        list[index + gap[event.key]].focus()
        return
      }

      for (let i = index; i < list.length; event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY ? i++ : i--) {
        if (list[i + gap[event.key]].tabIndex === 0) {
          list[i + gap[event.key]].focus()
          break
        }
      }
    }
  }

  _handleCalendarMouseEnter(event) {
    const target = event.target.classList.contains(CLASS_NAME_CALENDAR_CELL_INNER) ? event.target.parentElement : event.target
    const date = this._getDate(target)

    if (isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)) {
      return
    }

    this._hoverDate = setTimeFromDate(date, this._selectEndDate ? this._endDate : this._startDate)

    EventHandler.trigger(this._element, EVENT_CELL_HOVER, {
      date: getDateBySelectionType(this._hoverDate, this._config.selectionType)
    })

    this._updateClassNamesAndAriaLabels()
  }

  _handleCalendarMouseLeave() {
    this._hoverDate = null

    EventHandler.trigger(this._element, EVENT_CELL_HOVER, {
      date: null
    })

    this._updateClassNamesAndAriaLabels()
  }

  _addEventListeners() {
    EventHandler.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_CALENDAR_CELL_CLICKABLE, event => {
      this._handleCalendarClick(event)
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, SELECTOR_CALENDAR_CELL_CLICKABLE, event => {
      this._handleCalendarKeydown(event)
    })

    EventHandler.on(this._element, EVENT_MOUSEENTER, SELECTOR_CALENDAR_CELL_CLICKABLE, event => {
      this._handleCalendarMouseEnter(event)
    })

    EventHandler.on(this._element, EVENT_MOUSELEAVE, SELECTOR_CALENDAR_CELL_CLICKABLE, () => {
      this._handleCalendarMouseLeave()
    })

    EventHandler.on(this._element, EVENT_FOCUS, SELECTOR_CALENDAR_CELL_CLICKABLE, event => {
      this._handleCalendarMouseEnter(event)
    })

    EventHandler.on(this._element, EVENT_BLUR, SELECTOR_CALENDAR_CELL_CLICKABLE, () => {
      this._handleCalendarMouseLeave()
    })

    EventHandler.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_CALENDAR_ROW_CLICKABLE, event => {
      this._handleCalendarClick(event)
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, SELECTOR_CALENDAR_ROW_CLICKABLE, event => {
      this._handleCalendarKeydown(event)
    })

    EventHandler.on(this._element, EVENT_MOUSEENTER, SELECTOR_CALENDAR_ROW_CLICKABLE, event => {
      this._handleCalendarMouseEnter(event)
    })

    EventHandler.on(this._element, EVENT_MOUSELEAVE, SELECTOR_CALENDAR_ROW_CLICKABLE, () => {
      this._handleCalendarMouseLeave()
    })

    EventHandler.on(this._element, EVENT_FOCUS, SELECTOR_CALENDAR_ROW_CLICKABLE, event => {
      this._handleCalendarMouseEnter(event)
    })

    EventHandler.on(this._element, EVENT_BLUR, SELECTOR_CALENDAR_ROW_CLICKABLE, () => {
      this._handleCalendarMouseLeave()
    })

    // Navigation
    this._addNavigationEventListeners()

    EventHandler.on(this._element, EVENT_MOUSELEAVE, 'table', () => {
      EventHandler.trigger(this._element, EVENT_CALENDAR_MOUSE_LEAVE)
    })
  }

  _addNavigationEventListeners() {
    const navigationSelectors = {
      [SELECTOR_BTN_PREV]: () => this._modifyCalendarDate(0, -1),
      [SELECTOR_BTN_DOUBLE_PREV]: () => this._modifyCalendarDate(this._view === 'years' ? -10 : -1),
      [SELECTOR_BTN_NEXT]: () => this._modifyCalendarDate(0, 1),
      [SELECTOR_BTN_DOUBLE_NEXT]: () => this._modifyCalendarDate(this._view === 'years' ? 10 : 1),
      [SELECTOR_BTN_MONTH]: () => {
        this._view = 'months'
        this._updateCalendar()
      },
      [SELECTOR_BTN_YEAR]: () => {
        this._view = 'years'
        this._updateCalendar()
      }
    }

    for (const [selector, handler] of Object.entries(navigationSelectors)) {
      EventHandler.on(this._element, EVENT_CLICK_DATA_API, selector, event => {
        event.preventDefault()
        const selectors = SelectorEngine.find(selector, this._element)
        const selectorIndex = selectors.indexOf(event.target.closest(selector))
        handler()

        // Retrieve focus to the navigation element
        const _selectors = SelectorEngine.find(selector, this._element)
        if (_selectors && _selectors[selectorIndex]) {
          _selectors[selectorIndex].focus()
        }
      })
    }
  }

  _setCalendarDate(date) {
    this._calendarDate = date

    EventHandler.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
      date
    })
  }

  _modifyCalendarDate(years, months = 0, callback) {
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

    if (this._view === 'days') {
      EventHandler.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
        date: d
      })
    }

    this._updateCalendar(callback)
  }

  _setEndDate(date) {
    this._endDate = setTimeFromDate(date, this._endDate)
    EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, {
      date: getDateBySelectionType(this._endDate, this._config.selectionType)
    })
  }

  _setStartDate(date) {
    this._startDate = setTimeFromDate(date, this._startDate)
    EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, {
      date: getDateBySelectionType(this._startDate, this._config.selectionType)
    })
  }

  _setSelectEndDate(value) {
    this._selectEndDate = value
    EventHandler.trigger(this._element, EVENT_SELECT_END_CHANGE, {
      value
    })
  }

  _selectDate(date) {
    if (isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)) {
      return
    }

    if (this._config.range) {
      if (this._selectEndDate) {
        this._setSelectEndDate(false)

        if (this._startDate && this._startDate > date) {
          this._setStartDate(null)
          this._setEndDate(null)
          return
        }

        if (isDisableDateInRange(this._startDate, date, this._config.disabledDates)) {
          this._setStartDate(null)
          this._setEndDate(null)
          return
        }

        this._setEndDate(date)
        return
      }

      if (this._endDate && this._endDate < date) {
        this._setStartDate(null)
        this._setEndDate(null)
        return
      }

      if (isDisableDateInRange(date, this._endDate, this._config.disabledDates)) {
        this._setStartDate(null)
        this._setEndDate(null)
        return
      }

      this._setSelectEndDate(true)
      this._setStartDate(date)
      return
    }

    this._setStartDate(date)
  }

  _createCalendarPanel(order) {
    const calendarDate = getCalendarDate(this._calendarDate, order, this._view)
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()

    const calendarPanelEl = document.createElement('div')
    calendarPanelEl.classList.add('calendar')

    Manipulator.setDataAttribute(calendarPanelEl, 'calendar-index', order)

    // Create navigation
    const navigationElement = document.createElement('div')
    navigationElement.classList.add('calendar-nav')
    navigationElement.innerHTML = `
      <div class="calendar-nav-prev">
        <button class="btn btn-transparent btn-sm btn-double-prev" aria-label="${this._config.ariaNavPrevYearLabel}">
          <span class="calendar-nav-icon calendar-nav-icon-double-prev"></span>
        </button>
        ${this._view === 'days' ? `<button class="btn btn-transparent btn-sm btn-prev" aria-label="${this._config.ariaNavPrevMonthLabel}">
          <span class="calendar-nav-icon calendar-nav-icon-prev"></span>
        </button>` : ''}
      </div>
      <div class="calendar-nav-date" aria-live="polite">
        ${this._view === 'days' ? `<button class="btn btn-transparent btn-sm btn-month">
          ${calendarDate.toLocaleDateString(this._config.locale, { month: 'long' })}
        </button>` : ''}
        <button class="btn btn-transparent btn-sm btn-year">
          ${calendarDate.toLocaleDateString(this._config.locale, { year: 'numeric' })}
        </button>
      </div>
      <div class="calendar-nav-next">
        ${this._view === 'days' ? `<button class="btn btn-transparent btn-sm btn-next" aria-label="${this._config.ariaNavNextMonthLabel}">
          <span class="calendar-nav-icon calendar-nav-icon-next"></span>
        </button>` : ''}
        <button class="btn btn-transparent btn-sm btn-double-next" aria-label="${this._config.ariaNavNextYearLabel}">
          <span class="calendar-nav-icon calendar-nav-icon-double-next"></span>
        </button>
      </div>
    `

    const monthDetails = getMonthDetails(year, month, this._config.firstDayOfWeek)
    const listOfMonths = createGroupsInArray(getMonthsNames(this._config.locale), 4)
    const listOfYears = createGroupsInArray(getYears(calendarDate.getFullYear()), 4)
    const weekDays = monthDetails[0].days

    const calendarTable = document.createElement('table')
    calendarTable.innerHTML = `
    ${this._view === 'days' ? `
      <thead>
        <tr>
          ${this._config.showWeekNumber ?
            `<th class="${CLASS_NAME_CALENDAR_CELL}">
              <div class="calendar-header-cell-inner">
               ${this._config.weekNumbersLabel ?? ''}
              </div>
            </th>` : ''
          }
          ${weekDays.map(({ date }) => (
            `<th class="${CLASS_NAME_CALENDAR_CELL}" abbr="${date.toLocaleDateString(this._config.locale, { weekday: 'long' })}">
              <div class="calendar-header-cell-inner">
              ${typeof this._config.weekdayFormat === 'string' ?
                date.toLocaleDateString(this._config.locale, { weekday: this._config.weekdayFormat }) :
                date
                  .toLocaleDateString(this._config.locale, { weekday: 'long' })
                  .slice(0, this._config.weekdayFormat)}
              </div>
            </th>`
          )).join('')}
        </tr>
      </thead>` : ''}
      <tbody>
        ${this._view === 'days' ? monthDetails.map(week => {
          const date = convertToDateObject(
            week.weekNumber === 0 ?
              `${calendarDate.getFullYear()}W53` :
              `${calendarDate.getFullYear()}W${week.weekNumber}`,
            this._config.selectionType
          )
          const rowAttributes = this._rowWeekAttributes(date)
          return (
            `<tr 
              class="${rowAttributes.className}"
              tabindex="${rowAttributes.tabIndex}"
              ${rowAttributes.ariaSelected ? 'aria-selected="true"' : ''}
            >
              ${this._config.showWeekNumber ?
                `<th class="calendar-cell-week-number">${week.weekNumber === 0 ? 53 : week.weekNumber}</td>` : ''
              }
              ${week.days.map(({ date, month }) => {
                const cellAttributes = this._cellDayAttributes(date, month)
                return month === 'current' || this._config.showAdjacementDays ?
                  `<td 
                    class="${cellAttributes.className}"
                    tabindex="${cellAttributes.tabIndex}"
                    ${cellAttributes.ariaSelected ? 'aria-selected="true"' : ''}
                    data-coreui-date="${date}"
                  >
                    <div class="calendar-cell-inner day">
                      ${date.toLocaleDateString(this._config.locale, { day: 'numeric' })}
                    </div>
                  </td>` :
                  '<td></td>'
              }
            ).join('')}</tr>`
          )
        }).join('') : ''}
        ${this._view === 'months' ? listOfMonths.map((row, index) => (
          `<tr>
            ${row.map((month, idx) => {
              const date = new Date(calendarDate.getFullYear(), (index * 3) + idx, 1)
              const cellAttributes = this._cellMonthAttributes(date)
              return (
                `<td
                  class="${cellAttributes.className}"
                  tabindex="${cellAttributes.tabIndex}"
                  ${cellAttributes.ariaSelected ? 'aria-selected="true"' : ''}
                  data-coreui-date="${date.toDateString()}"
                >
                  <div class="calendar-cell-inner month">
                    ${month}
                  </div>
                </td>`
              )
            }).join('')}
          </tr>`
        )).join('') : ''}
        ${this._view === 'years' ? listOfYears.map(row => (
          `<tr>
            ${row.map(year => {
              const date = new Date(year, 0, 1)
              const cellAttributes = this._cellYearAttributes(date)
              return (
                `<td
                  class="${cellAttributes.className}"
                  tabindex="${cellAttributes.tabIndex}"
                  ${cellAttributes.ariaSelected ? 'aria-selected="true"' : ''}
                  data-coreui-date="${date.toDateString()}"
                >
                  <div class="calendar-cell-inner year">
                    ${year}
                  </div>
                </td>`
              )
            }).join('')}
          </tr>`
        )).join('') : ''}
      </tbody>
    `
    calendarPanelEl.append(navigationElement, calendarTable)

    return calendarPanelEl
  }

  _createCalendar() {
    if (this._config.selectionType && this._view === 'days') {
      this._element.classList.add(`select-${this._config.selectionType}`)
    }

    if (this._config.showWeekNumber) {
      this._element.classList.add(CLASS_NAME_SHOW_WEEK_NUMBERS)
    }

    for (const [index, _] of Array.from({ length: this._config.calendars }).entries()) {
      this._element.append(this._createCalendarPanel(index))
    }

    this._element.classList.add(CLASS_NAME_CALENDARS)
  }

  _initializeDates() {
    // Convert dates to date objects based on the selection type
    this._calendarDate = convertToDateObject(
      this._config.calendarDate || this._config.startDate || this._config.endDate || new Date(), this._config.selectionType
    )
    this._startDate = convertToDateObject(this._config.startDate, this._config.selectionType)
    this._endDate = convertToDateObject(this._config.endDate, this._config.selectionType)
    this._minDate = convertToDateObject(this._config.minDate, this._config.selectionType)
    this._maxDate = convertToDateObject(this._config.maxDate, this._config.selectionType)
    this._hoverDate = null
    this._selectEndDate = this._config.selectEndDate
  }

  _initializeView() {
    const viewMap = {
      day: 'days',
      week: 'days',
      month: 'months',
      year: 'years'
    }

    this._view = viewMap[this._config.selectionType] || 'days'
  }

  _updateCalendar(callback) {
    this._element.innerHTML = ''
    this._createCalendar()

    if (callback) {
      setTimeout(callback, 1)
    }
  }

  _updateClassNamesAndAriaLabels() {
    if (this._config.selectionType === 'week') {
      const rows = SelectorEngine.find(SELECTOR_CALENDAR_ROW, this._element)

      for (const row of rows) {
        const firstCell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, row)
        const date = new Date(Manipulator.getDataAttribute(firstCell, 'date'))
        const rowAttributes = this._rowWeekAttributes(date)

        row.className = rowAttributes.className
        row.tabIndex = rowAttributes.tabIndex

        if (rowAttributes.ariaSelected) {
          row.setAttribute('aria-selected', true)
        } else {
          row.removeAttribute('aria-selected')
        }
      }

      return
    }

    const cells = SelectorEngine.find(SELECTOR_CALENDAR_CELL_CLICKABLE, this._element)

    for (const cell of cells) {
      const date = new Date(Manipulator.getDataAttribute(cell, 'date'))
      let cellAttributes

      if (this._view === 'days') {
        cellAttributes = this._cellDayAttributes(date, 'current')
      } else if (this._view === 'months') {
        cellAttributes = this._cellMonthAttributes(date)
      } else {
        cellAttributes = this._cellYearAttributes(date)
      }

      cell.className = cellAttributes.className
      cell.tabIndex = cellAttributes.tabIndex

      if (cellAttributes.ariaSelected) {
        cell.setAttribute('aria-selected', true)
      } else {
        cell.removeAttribute('aria-selected')
      }
    }
  }

  _classNames(classNames) {
    return Object.entries(classNames)
      .filter(([_, value]) => Boolean(value))
      .map(([key]) => key)
      .join(' ')
  }

  _cellDayAttributes(date, month) {
    const isCurrentMonth = month === 'current'
    const isDisabled = isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)
    const isSelected = isDateSelected(date, this._startDate, this._endDate)

    const classNames = this._classNames({
      [CLASS_NAME_CALENDAR_CELL]: true,
      ...(this._config.selectionType === 'day' && this._view === 'days' && {
        clickable: !isCurrentMonth && this._config.selectAdjacementDays,
        disabled: isDisabled,
        range: isCurrentMonth && isDateInRange(date, this._startDate, this._endDate),
        'range-hover': isCurrentMonth &&
          (this._hoverDate && this._selectEndDate ?
            isDateInRange(date, this._startDate, this._hoverDate) :
            isDateInRange(date, this._hoverDate, this._endDate)),
        selected: isSelected
      }),
      today: isToday(date),
      [month]: true
    })

    return {
      className: classNames,
      tabIndex: this._config.selectionType === 'day' &&
        (isCurrentMonth || this._config.selectAdjacementDays) &&
        !isDisabled ? 0 : -1,
      ariaSelected: isSelected
    }
  }

  _cellMonthAttributes(date) {
    const isDisabled = isMonthDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)
    const isSelected = isMonthSelected(date, this._startDate, this._endDate)

    const classNames = this._classNames({
      [CLASS_NAME_CALENDAR_CELL]: true,
      disabled: isDisabled,
      'range-hover': this._config.selectionType === 'month' &&
        (this._hoverDate && this._selectEndDate ?
          isMonthInRange(date, this._startDate, this._hoverDate) :
          isMonthInRange(date, this._hoverDate, this._endDate)),
      range: isMonthInRange(date, this._startDate, this._endDate),
      selected: isSelected
    })

    return {
      className: classNames,
      tabIndex: isDisabled ? -1 : 0,
      ariaSelected: isSelected
    }
  }

  _cellYearAttributes(date) {
    const isDisabled = isYearDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)
    const isSelected = isYearSelected(date, this._startDate, this._endDate)

    const classNames = this._classNames({
      [CLASS_NAME_CALENDAR_CELL]: true,
      disabled: isDisabled,
      'range-hover': this._config.selectionType === 'year' &&
        (this._hoverDate && this._selectEndDate ?
          isYearInRange(date, this._startDate, this._hoverDate) :
          isYearInRange(date, this._hoverDate, this._endDate)),
      range: isYearInRange(date, this._startDate, this._endDate),
      selected: isSelected
    })

    return {
      className: classNames,
      tabIndex: isDisabled ? -1 : 0,
      ariaSelected: isSelected
    }
  }

  _rowWeekAttributes(date) {
    const isDisabled = isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)
    const isSelected = isDateSelected(date, this._startDate, this._endDate)

    const classNames = this._classNames({
      [CLASS_NAME_CALENDAR_ROW]: true,
      disabled: isDisabled,
      range: this._config.selectionType === 'week' && isDateInRange(date, this._startDate, this._endDate),
      'range-hover': this._config.selectionType === 'week' &&
        (this._hoverDate && this._selectEndDate ?
          isYearInRange(date, this._startDate, this._hoverDate) :
          isYearInRange(date, this._hoverDate, this._endDate)),
      selected: isSelected
    })

    return {
      className: classNames,
      tabIndex: this._config.selectionType === 'week' && !isDisabled ? 0 : -1,
      ariaSelected: isSelected
    }
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
      const data = Calendar.getOrCreateInstance(this, config)

      if (typeof config !== 'string') {
        return
      }

      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of Array.from(document.querySelectorAll(SELECTOR_DATA_TOGGLE))) {
    Calendar.calendarInterface(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Calendar)

export default Calendar

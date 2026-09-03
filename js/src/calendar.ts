/* eslint-disable complexity, indent, multiline-ternary, @stylistic/multiline-ternary */
/**
 * --------------------------------------------------------------------------
 * CoreUI PRO calendar.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import {
 escapeHtml, sanitizeHtml, type SanitizerAllowList, SVGAllowlist
} from './util/sanitizer.js'
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
  isQuarterDisabled,
  isQuarterInRange,
  isQuarterSelected,
  isToday,
  isYearDisabled,
  isYearInRange,
  isYearSelected,
  setTimeFromDate,
  type ViewTypes
} from './util/calendar.js'

/**
 * Constants
 */

const NAME = 'calendar'
const DATA_KEY = 'coreui.calendar'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn'])

const ARROW_UP_KEY = 'ArrowUp'
const ARROW_RIGHT_KEY = 'ArrowRight'
const ARROW_DOWN_KEY = 'ArrowDown'
const ARROW_LEFT_KEY = 'ArrowLeft'
const ENTER_KEY = 'Enter'
const SPACE_KEY = 'Space'
const HOME_KEY = 'Home'
const END_KEY = 'End'
const PAGE_UP_KEY = 'PageUp'
const PAGE_DOWN_KEY = 'PageDown'

const EVENT_BLUR = `blur${EVENT_KEY}`
const EVENT_CALENDAR_DATE_CHANGE = `calendarDateChange${EVENT_KEY}`
const EVENT_CALENDAR_MOUSE_LEAVE = `calendarMouseleave${EVENT_KEY}`
const EVENT_CALENDAR_VIEW_CHANGE = `calendarViewChange${EVENT_KEY}`
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

// Navigation icons live in JavaScript, not in CSS masks — the chips pattern:
// inline SVG on currentColor, swappable through an option, sanitized like any
// user-provided markup.
const DEFAULT_NAV_ICON_DOUBLE_NEXT: string = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" fill="currentColor"><polygon points="95.314 447.313 72.686 424.687 245.373 252 72.686 79.313 95.314 56.687 290.627 252 95.314 447.313"></polygon><polygon points="255.314 447.313 232.686 424.687 405.373 252 232.686 79.313 255.314 56.687 450.627 252 255.314 447.313"></polygon></svg>'
const DEFAULT_NAV_ICON_DOUBLE_PREV: string = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" fill="currentColor"><polygon points="416.686 447.313 221.373 252 416.686 56.687 439.314 79.313 266.627 252 439.314 424.687 416.686 447.313"></polygon><polygon points="256.686 447.313 61.373 252 256.686 56.687 279.314 79.313 106.627 252 279.314 424.687 256.686 447.313"></polygon></svg>'
const DEFAULT_NAV_ICON_NEXT: string = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" fill="currentColor"><polygon points="179.313 451.313 156.687 428.687 329.372 256 156.687 83.313 179.313 60.687 374.627 256 179.313 451.313"></polygon></svg>'
const DEFAULT_NAV_ICON_PREV: string = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" fill="currentColor"><polygon points="324.687 451.313 129.373 256 324.687 60.687 347.313 83.313 174.628 256 347.313 428.687 324.687 451.313"></polygon></svg>'

type CalendarConfig = {
  allowList: SanitizerAllowList
  ariaNavNextMonthLabel: string
  ariaNavNextYearLabel: string
  ariaNavPrevMonthLabel: string
  ariaNavPrevYearLabel: string
  calendarDate: Date | number | string | null
  calendars: number
  dayFormat: ((date: Date) => string) | string
  disabledDates: any
  endDate: Date | number | string | null
  firstDayOfWeek: number
  locale: string
  maxDate: Date | number | string | null
  minDate: Date | number | string | null
  monthFormat: ((date: Date) => string) | string
  navIconDoubleNext: string
  navIconDoublePrev: string
  navIconNext: string
  navIconPrev: string
  range: boolean
  renderDayCell: ((date: Date) => string) | null
  renderMonthCell: ((date: Date) => string) | null
  renderQuarterCell: ((date: Date) => string) | null
  renderYearCell: ((date: Date) => string) | null
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  selectAdjacentDays: boolean
  selectEndDate: boolean
  selectionType: string
  showAdjacentDays: boolean
  showWeekNumber: boolean
  startDate: Date | number | string | null
  weekdayFormat: number | string
  weekNumbersLabel: string | null
  yearFormat: ((date: Date) => string) | string
}

const Default: CalendarConfig = {
  allowList: SVGAllowlist,
  ariaNavNextMonthLabel: 'Next month',
  ariaNavNextYearLabel: 'Next year',
  ariaNavPrevMonthLabel: 'Previous month',
  ariaNavPrevYearLabel: 'Previous year',
  calendarDate: null,
  calendars: 1,
  dayFormat: 'numeric',
  disabledDates: null,
  endDate: null,
  firstDayOfWeek: 1,
  locale: 'default',
  maxDate: null,
  minDate: null,
  monthFormat: 'short',
  navIconDoubleNext: DEFAULT_NAV_ICON_DOUBLE_NEXT,
  navIconDoublePrev: DEFAULT_NAV_ICON_DOUBLE_PREV,
  navIconNext: DEFAULT_NAV_ICON_NEXT,
  navIconPrev: DEFAULT_NAV_ICON_PREV,
  range: false,
  renderDayCell: null,
  renderMonthCell: null,
  renderQuarterCell: null,
  renderYearCell: null,
  sanitize: true,
  sanitizeFn: null,
  selectAdjacentDays: false,
  selectEndDate: false,
  selectionType: 'day',
  showAdjacentDays: true,
  showWeekNumber: false,
  startDate: null,
  weekdayFormat: 2,
  weekNumbersLabel: null,
  yearFormat: 'numeric'
}

const DefaultType: Record<string, string> = {
  allowList: 'object',
  ariaNavNextMonthLabel: 'string',
  ariaNavNextYearLabel: 'string',
  ariaNavPrevMonthLabel: 'string',
  ariaNavPrevYearLabel: 'string',
  calendarDate: '(date|number|string|null)',
  calendars: 'number',
  dayFormat: 'string',
  disabledDates: '(array|date|function|null)',
  endDate: '(date|number|string|null)',
  firstDayOfWeek: 'number',
  locale: 'string',
  maxDate: '(date|number|string|null)',
  minDate: '(date|number|string|null)',
  monthFormat: 'string',
  navIconDoubleNext: 'string',
  navIconDoublePrev: 'string',
  navIconNext: 'string',
  navIconPrev: 'string',
  range: 'boolean',
  renderDayCell: '(function|null)',
  renderMonthCell: '(function|null)',
  renderQuarterCell: '(function|null)',
  renderYearCell: '(function|null)',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  selectAdjacentDays: 'boolean',
  selectEndDate: 'boolean',
  selectionType: 'string',
  showAdjacentDays: 'boolean',
  showWeekNumber: 'boolean',
  startDate: '(date|number|string|null)',
  weekdayFormat: '(number|string)',
  weekNumbersLabel: '(string|null)',
  yearFormat: 'string'
}

/**
 * Class definition
 */

class Calendar extends BaseComponent {
  declare ['constructor']: typeof Calendar
  protected declare _calendarDate: Date
  protected declare _startDate: Date | null
  protected declare _endDate: Date | null
  protected declare _minDate: Date | null
  protected declare _maxDate: Date | null
  protected declare _hoverDate: Date | null
  protected declare _selectEndDate: boolean
  protected declare _view: string

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element)

    this._config = this._getConfig(config)
    this._initializeDates()
    this._initializeView()
    this._createCalendar()
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
  update(config: any): void {
    // Merge over the current configuration (like SectionInput.update) — a
    // partial update must not reset the remaining options to their defaults
    this._config = this._getConfig({ ...this._config, ...config })
    this._initializeDates()
    this._initializeView()

    // Clear the current calendar content
    this._element.innerHTML = ''
    this._createCalendar()
  }

  refresh(): void {
    // Clear the current calendar content
    this._element.innerHTML = ''
    this._createCalendar()
  }

  override dispose(): void {
    this._element.innerHTML = ''
    this._element.classList.remove(CLASS_NAME_CALENDARS, CLASS_NAME_SHOW_WEEK_NUMBERS, `select-${this._config.selectionType}`)

    super.dispose()
  }

  // Private
  _focusOnFirstAvailableCell(): void {
    const cell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL_CLICKABLE, this._element as ParentNode)

    if (cell) {
      cell.focus()
    }
  }

  // Closest by date, not exact match: the requested date may sit on a cell
  // disabled by disabledDates or clamped away by min/max
  _focusOnDate(date: Date): void {
    const focusables = (SelectorEngine.find(
      this._config.selectionType === 'week' ? SELECTOR_CALENDAR_ROW_CLICKABLE : SELECTOR_CALENDAR_CELL_CLICKABLE,
      this._element as ParentNode
    ) as HTMLElement[]).filter(element => !element.classList.contains('previous') && !element.classList.contains('next'))

    let closest = null
    let closestGap = Number.POSITIVE_INFINITY

    for (const element of focusables) {
      const gap = Math.abs(this._getDate(element).getTime() - date.getTime())

      if (gap < closestGap) {
        closest = element
        closestGap = gap
      }
    }

    closest?.focus()
  }

  _getEventTarget(event: any): HTMLElement | null {
    // When weeks are the unit, the row is the focusable thing — a focus event
    // then arrives with no cell above it, and the row stands in for one.
    return event.target.closest(SELECTOR_CALENDAR_CELL) ??
      event.target.closest(SELECTOR_CALENDAR_ROW)
  }

  _getDate(target: HTMLElement): Date {
    if (this._config.selectionType === 'week') {
      const firstCell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, target.closest(SELECTOR_CALENDAR_ROW) as ParentNode)
      return new Date(Manipulator.getDataAttribute(firstCell as HTMLElement, 'date') as string)
    }

    return new Date(Manipulator.getDataAttribute(target, 'date') as string)
  }

  _handleCalendarClick(event: any): void {
    const target = this._getEventTarget(event)

    if (!target) {
      return
    }

    const date = this._getDate(target)
    const cloneDate = new Date(date)
    const index = Manipulator.getDataAttribute(target.closest(SELECTOR_CALENDAR) as HTMLElement, 'calendar-index') as number

    if (this._view === 'days') {
      this._setCalendarDate(index ? new Date(cloneDate.setMonth(cloneDate.getMonth() - index)) : date)
    }

    if (this._view === 'months' && this._config.selectionType !== 'month') {
      this._setCalendarDate(index ? new Date(cloneDate.setMonth(cloneDate.getMonth() - index)) : date, 'days')
      this._setCalendarView('days', 'cellClick')
      this._updateCalendar(this._focusOnFirstAvailableCell.bind(this))
      return
    }

    if (this._view === 'years' && this._config.selectionType !== 'year') {
      this._setCalendarDate(index ? new Date(cloneDate.setFullYear(cloneDate.getFullYear() - index)) : date, 'months')
      this._setCalendarView(this._config.selectionType === 'quarter' ? 'quarters' : 'months', 'cellClick')
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

  _handleCalendarKeydown(event: any): void {
    const date = this._getDate(event.target)

    if (event.code === SPACE_KEY || event.key === ENTER_KEY) {
      event.preventDefault()
      this._handleCalendarClick(event)
    }

    if (event.key === HOME_KEY || event.key === END_KEY) {
      event.preventDefault()

      const cells = SelectorEngine.find(SELECTOR_CALENDAR_CELL_CLICKABLE, event.target.closest('tr') as ParentNode)
      const cell = event.key === HOME_KEY ? cells[0] : cells[cells.length - 1]
      cell?.focus()
      return
    }

    if (event.key === PAGE_UP_KEY || event.key === PAGE_DOWN_KEY) {
      event.preventDefault()

      const direction = event.key === PAGE_DOWN_KEY ? 1 : -1
      const target = new Date(date)

      if (this._view === 'days') {
        // Land on day 1 before shifting so a 31st cannot overflow past the
        // target month, then restore the day clamped to that month's length
        const day = target.getDate()
        target.setDate(1)

        if (event.shiftKey) {
          target.setFullYear(target.getFullYear() + direction)
        } else {
          target.setMonth(target.getMonth() + direction)
        }

        target.setDate(Math.min(day, new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()))
      } else {
        target.setFullYear(target.getFullYear() + ((this._view === 'years' ? 10 : 1) * direction))
      }

      if (this._maxDate && target > this._maxDate) {
        target.setTime(this._maxDate.getTime())
      }

      if (this._minDate && target < this._minDate) {
        target.setTime(this._minDate.getTime())
      }

      if (target.getTime() === date.getTime()) {
        return
      }

      const monthsDelta = ((target.getFullYear() - date.getFullYear()) * 12) + (target.getMonth() - date.getMonth())
      this._modifyCalendarDate(0, monthsDelta, () => this._focusOnDate(target))
      return
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
        date >= (convertToDateObject(this._maxDate, this._config.selectionType) as Date) &&
        (event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY)
      ) {
        return
      }

      if (
        this._minDate &&
        date <= (convertToDateObject(this._minDate, this._config.selectionType) as Date) &&
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
        const callback = (key: string) => {
          const _list = SelectorEngine.find(`${SELECTOR_CALENDAR_CELL_CLICKABLE}, ${SELECTOR_CALENDAR_ROW_CLICKABLE}`, this._element as ParentNode)

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

        if (this._view === 'months' || this._view === 'quarters') {
          this._modifyCalendarDate(event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY ? 1 : -1, 0, callback.bind(this, event.key))
        }

        if (this._view === 'years') {
          this._modifyCalendarDate(event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY ? 10 : -10, 0, callback.bind(this, event.key))
        }

        return
      }

      if (list[index + (gap as Record<string, number>)[event.key]].tabIndex === 0) {
        list[index + (gap as Record<string, number>)[event.key]].focus()
        return
      }

      for (let i = index; i < list.length; event.key === ARROW_RIGHT_KEY || event.key === ARROW_DOWN_KEY ? i++ : i--) {
        if (list[i + (gap as Record<string, number>)[event.key]].tabIndex === 0) {
          list[i + (gap as Record<string, number>)[event.key]].focus()
          break
        }
      }
    }
  }

  _handleCalendarMouseEnter(event: any): void {
    const target = this._getEventTarget(event)

    if (!target) {
      return
    }

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

  _handleCalendarMouseLeave(): void {
    this._hoverDate = null

    EventHandler.trigger(this._element, EVENT_CELL_HOVER, {
      date: null
    })

    this._updateClassNamesAndAriaLabels()
  }

  _addEventListeners(): void {
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

  _addNavigationEventListeners(): void {
    const navigationSelectors = {
      [SELECTOR_BTN_PREV]: () => this._modifyCalendarDate(0, -1),
      [SELECTOR_BTN_DOUBLE_PREV]: () => this._modifyCalendarDate(this._view === 'years' ? -10 : -1),
      [SELECTOR_BTN_NEXT]: () => this._modifyCalendarDate(0, 1),
      [SELECTOR_BTN_DOUBLE_NEXT]: () => this._modifyCalendarDate(this._view === 'years' ? 10 : 1),
      [SELECTOR_BTN_MONTH]: () => {
        this._setCalendarView('months', 'navigation')
        this._updateCalendar()
      },
      [SELECTOR_BTN_YEAR]: () => {
        this._setCalendarView('years', 'navigation')
        this._updateCalendar()
      }
    }

    for (const [selector, handler] of Object.entries(navigationSelectors)) {
      EventHandler.on(this._element, EVENT_CLICK_DATA_API, selector, (event: any) => {
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

  _setCalendarDate(date: any, view: string = this._view): void {
    this._calendarDate = date

    EventHandler.trigger(this._element, EVENT_CALENDAR_DATE_CHANGE, {
      date,
      view
    })
  }

  _setCalendarView(view: string, source?: string): void {
    this._view = view

    EventHandler.trigger(this._element, EVENT_CALENDAR_VIEW_CHANGE, {
      view,
      source
    })
  }

  _modifyCalendarDate(years: number, months = 0, callback?: () => void): void {
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
      date: d,
      view: this._view
    })

    this._updateCalendar(callback)
  }

  _setEndDate(date: Date | null): void {
    this._endDate = setTimeFromDate(date, this._endDate)
    EventHandler.trigger(this._element, EVENT_END_DATE_CHANGE, {
      date: getDateBySelectionType(this._endDate, this._config.selectionType),
      dateObject: this._endDate
    })
  }

  _setStartDate(date: Date | null): void {
    this._startDate = setTimeFromDate(date, this._startDate)
    EventHandler.trigger(this._element, EVENT_START_DATE_CHANGE, {
      date: getDateBySelectionType(this._startDate, this._config.selectionType),
      dateObject: this._startDate
    })
  }

  _setSelectEndDate(value: boolean): void {
    this._selectEndDate = value
    EventHandler.trigger(this._element, EVENT_SELECT_END_CHANGE, {
      value
    })
  }

  _selectDate(date: any): void {
    if (isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)) {
      return
    }

    if (this._config.range) {
      if (this._selectEndDate) {
        if (this._startDate && this._startDate > date) {
          this._setStartDate(date)
          this._setEndDate(null)
          return
        }

        this._setSelectEndDate(false)

        if (isDisableDateInRange(this._startDate, date, this._config.disabledDates)) {
          this._setStartDate(null)
          this._setEndDate(null)
          return
        }

        this._setEndDate(date)
        return
      }

      if (this._endDate && this._endDate < date) {
        this._setStartDate(date)
        this._setEndDate(null)
        this._setSelectEndDate(true)
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

  _createCalendarPanel(order: number): HTMLElement {
    const calendarDate = getCalendarDate(this._calendarDate, order, this._view as ViewTypes)
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
        <button type="button" class="calendar-nav-btn btn-double-prev" aria-label="${escapeHtml(this._config.ariaNavPrevYearLabel)}">
          <span class="calendar-nav-icon">${this._navIcon('navIconDoublePrev')}</span>
        </button>
        ${this._view === 'days' ? `<button type="button" class="calendar-nav-btn btn-prev" aria-label="${escapeHtml(this._config.ariaNavPrevMonthLabel)}">
          <span class="calendar-nav-icon">${this._navIcon('navIconPrev')}</span>
        </button>` : ''}
      </div>
      <div class="calendar-nav-date" aria-live="polite">
        ${this._view === 'days' ? `<button type="button" class="calendar-nav-btn btn-sm btn-month">
          ${calendarDate.toLocaleDateString(this._config.locale, { month: 'long' })}
        </button>` : ''}
        <button type="button" class="calendar-nav-btn btn-year">
          ${calendarDate.toLocaleDateString(this._config.locale, { year: 'numeric' })}
        </button>
      </div>
      <div class="calendar-nav-next">
        ${this._view === 'days' ? `<button type="button" class="calendar-nav-btn btn-next" aria-label="${escapeHtml(this._config.ariaNavNextMonthLabel)}">
          <span class="calendar-nav-icon">${this._navIcon('navIconNext')}</span>
        </button>` : ''}
        <button type="button" class="calendar-nav-btn btn-double-next" aria-label="${escapeHtml(this._config.ariaNavNextYearLabel)}">
          <span class="calendar-nav-icon">${this._navIcon('navIconDoubleNext')}</span>
        </button>
      </div>
    `

    const monthDetails = getMonthDetails(year, month, this._config.firstDayOfWeek)
    const listOfMonths = createGroupsInArray(getMonthsNames(this._config.locale, this._config.monthFormat), 4)
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
               ${this._config.weekNumbersLabel ? escapeHtml(this._config.weekNumbersLabel) : ''}
              </div>
            </th>` : ''
          }
          ${weekDays.map(({ date }) => (
            `<th class="${CLASS_NAME_CALENDAR_CELL}" abbr="${date.toLocaleDateString(this._config.locale, { weekday: 'long' })}">
              <div class="calendar-header-cell-inner">
              ${typeof this._config.weekdayFormat === 'string' ?
                date.toLocaleDateString(this._config.locale, { weekday: this._config.weekdayFormat as 'long' }) :
                date
                  .toLocaleDateString(this._config.locale, { weekday: 'long' })
                  .slice(0, this._config.weekdayFormat)}
              </div>
            </th>`
          )).join('')}
        </tr>
      </thead>` : ''}
      <tbody>
        ${this._view === 'days' ? monthDetails.map(({ week, days }) => {
          const { date } = days[0]
          const rowAttributes = this._rowWeekAttributes(date)
          return (
            `<tr 
              class="${rowAttributes.className}"
              tabindex="${rowAttributes.tabIndex}"
              ${rowAttributes.ariaSelected ? 'aria-selected="true"' : ''}
            >
              ${this._config.showWeekNumber ?
                `<th class="calendar-cell-week-number">${week.number}</td>` : ''
              }
              ${days.map(({ date, month }) => {
                const cellAttributes = this._cellDayAttributes(date, month)
                return month === 'current' || this._config.showAdjacentDays ?
                  `<td
                    class="${cellAttributes.className}"
                    tabindex="${cellAttributes.tabIndex}"
                    ${cellAttributes.ariaSelected ? 'aria-selected="true"' : ''}
                    ${cellAttributes.ariaCurrent ? 'aria-current="date"' : ''}
                    aria-label="${escapeHtml(cellAttributes.ariaLabel)}"
                    data-coreui-date="${date}"
                  >
                    <div class="${CLASS_NAME_CALENDAR_CELL_INNER} day">
                      ${this._config.renderDayCell ? this._sanitizeHtml(this._config.renderDayCell(date, cellAttributes.meta)) : date.toLocaleDateString(this._config.locale, { day: this._config.dayFormat })}
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
                  <div class="${CLASS_NAME_CALENDAR_CELL_INNER} month">
                    ${this._config.renderMonthCell ? this._sanitizeHtml(this._config.renderMonthCell(date, cellAttributes.meta)) : month}
                  </div>
                </td>`
              )
            }).join('')}
          </tr>`
        )).join('') : ''}
        ${this._view === 'quarters' ?
          `<tr>
            ${Array.from({ length: 4 }, (_, index) => {
              const date = new Date(calendarDate.getFullYear(), index * 3, 1)
              const cellAttributes = this._cellQuarterAttributes(date)
              return (
                `<td
                  class="${cellAttributes.className}"
                  tabindex="${cellAttributes.tabIndex}"
                  ${cellAttributes.ariaSelected ? 'aria-selected="true"' : ''}
                  data-coreui-date="${date.toDateString()}"
                >
                  <div class="${CLASS_NAME_CALENDAR_CELL_INNER} quarter">
                    ${this._config.renderQuarterCell ? this._sanitizeHtml(this._config.renderQuarterCell(date, cellAttributes.meta)) : `Q${index + 1}`}
                  </div>
                </td>`
              )
            }).join('')}
          </tr>` : ''}
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
                  <div class="${CLASS_NAME_CALENDAR_CELL_INNER} year">
                    ${this._config.renderYearCell ? this._sanitizeHtml(this._config.renderYearCell(date, cellAttributes.meta)) : date.toLocaleDateString(this._config.locale, { year: this._config.yearFormat })}
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

  _createCalendar(): void {
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

  _initializeDates(): void {
    // Convert dates to date objects based on the selection type
    this._calendarDate = convertToDateObject(
      this._config.calendarDate || this._config.startDate || this._config.endDate, this._config.selectionType
    ) || new Date()
    this._startDate = convertToDateObject(this._config.startDate, this._config.selectionType)
    this._endDate = convertToDateObject(this._config.endDate, this._config.selectionType)
    this._minDate = convertToDateObject(this._config.minDate, this._config.selectionType)
    this._maxDate = convertToDateObject(this._config.maxDate, this._config.selectionType)
    this._hoverDate = null
    this._selectEndDate = this._config.selectEndDate
  }

  _initializeView(): void {
    const viewMap = {
      day: 'days',
      week: 'days',
      month: 'months',
      quarter: 'quarters',
      year: 'years'
    }

    this._view = (viewMap as Record<string, string>)[this._config.selectionType] || 'days'
  }

  _updateCalendar(callback?: () => void): void {
    this._element.innerHTML = ''
    this._createCalendar()

    if (callback) {
      callback()
    }
  }

  _updateClassNamesAndAriaLabels(): void {
    if (this._config.selectionType === 'week') {
      const rows = SelectorEngine.find(SELECTOR_CALENDAR_ROW, this._element as ParentNode)

      for (const row of rows) {
        const firstCell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, row)
        const date = new Date(Manipulator.getDataAttribute(firstCell as HTMLElement, 'date') as string)
        const rowAttributes = this._rowWeekAttributes(date)

        row.className = rowAttributes.className
        row.tabIndex = rowAttributes.tabIndex

        if (rowAttributes.ariaSelected) {
          row.setAttribute('aria-selected', true as any)
        } else {
          row.removeAttribute('aria-selected')
        }
      }

      return
    }

    const cells = SelectorEngine.find(SELECTOR_CALENDAR_CELL_CLICKABLE, this._element as ParentNode)

    for (const cell of cells) {
      const date = new Date(Manipulator.getDataAttribute(cell, 'date') as string)
      let cellAttributes

      switch (this._view) {
      case 'days': {
        cellAttributes = this._cellDayAttributes(date, 'current')
        break
      }

      case 'months': {
        cellAttributes = this._cellMonthAttributes(date)
        break
      }

      case 'quarters': {
        cellAttributes = this._cellQuarterAttributes(date)
        break
      }

      default: {
        cellAttributes = this._cellYearAttributes(date)
      }
      }

      cell.className = cellAttributes.className
      cell.tabIndex = cellAttributes.tabIndex

      if (cellAttributes.ariaSelected) {
        cell.setAttribute('aria-selected', true as any)
      } else {
        cell.removeAttribute('aria-selected')
      }
    }
  }

  _classNames(classNames: any): string {
    return Object.entries(classNames)
      .filter(([_, value]) => Boolean(value))
      .map(([key]) => key)
      .join(' ')
  }

  _cellDayAttributes(date: Date, month: string): Record<string, any> {
    const isCurrentMonth = month === 'current'

    const isDisabled = isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)
    const isSelected = isDateSelected(date, this._startDate, this._endDate)
    const isTodayDate = isToday(date)

    if (this._config.selectionType !== 'day' || this._view !== 'days') {
      return {
        className: this._classNames({
          [CLASS_NAME_CALENDAR_CELL]: true,
          today: isTodayDate,
          [month]: true
        }),
        tabIndex: -1,
        ariaSelected: false,
        ariaLabel: date.toLocaleDateString(this._config.locale),
        ariaCurrent: isTodayDate
      }
    }

    const isInRange = isCurrentMonth && isDateInRange(date, this._startDate, this._endDate)
    const isRangeHover = isCurrentMonth && this._hoverDate && (
      this._selectEndDate ?
        isDateInRange(date, this._startDate, this._hoverDate) :
        isDateInRange(date, this._hoverDate, this._endDate)
    )

    const classNames = this._classNames({
      [CLASS_NAME_CALENDAR_CELL]: true,
      clickable: !isCurrentMonth && this._config.selectAdjacentDays,
      disabled: isDisabled,
      range: isInRange,
      'range-hover': isRangeHover,
      selected: isSelected,
      today: isTodayDate,
      [month]: true
    })

    return {
      className: classNames,
      tabIndex: (isCurrentMonth || this._config.selectAdjacentDays) && !isDisabled ? 0 : -1,
      ariaSelected: isSelected,
      ariaLabel: date.toLocaleDateString(this._config.locale),
      ariaCurrent: isTodayDate,
      meta: {
        isDisabled,
        isInCurrentMonth: isCurrentMonth,
        isInRange,
        isSelected,
        isToday: isTodayDate
      }
    }
  }

  _cellMonthAttributes(date: Date): Record<string, any> {
    const isDisabled = isMonthDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)
    const isSelected = isMonthSelected(date, this._startDate, this._endDate)
    const isInRange = isMonthInRange(date, this._startDate, this._endDate)
    const isRangeHover = this._config.selectionType === 'month' && this._hoverDate && (
      this._selectEndDate ?
        isMonthInRange(date, this._startDate, this._hoverDate) :
        isMonthInRange(date, this._hoverDate, this._endDate)
    )

    const classNames = this._classNames({
      [CLASS_NAME_CALENDAR_CELL]: true,
      disabled: isDisabled,
      'range-hover': isRangeHover,
      range: isInRange,
      selected: isSelected
    })

    return {
      className: classNames,
      tabIndex: isDisabled ? -1 : 0,
      ariaSelected: isSelected,
      meta: {
        isDisabled,
        isInRange,
        isSelected
      }
    }
  }

  _cellQuarterAttributes(date: Date): Record<string, any> {
    const isDisabled = isQuarterDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)
    const isSelected = isQuarterSelected(date, this._startDate, this._endDate)
    const isInRange = isQuarterInRange(date, this._startDate, this._endDate)
    const isRangeHover = this._config.selectionType === 'quarter' && this._hoverDate && (
      this._selectEndDate ?
        isQuarterInRange(date, this._startDate, this._hoverDate) :
        isQuarterInRange(date, this._hoverDate, this._endDate)
    )

    const classNames = this._classNames({
      [CLASS_NAME_CALENDAR_CELL]: true,
      disabled: isDisabled,
      'range-hover': isRangeHover,
      range: isInRange,
      selected: isSelected
    })

    return {
      className: classNames,
      tabIndex: isDisabled ? -1 : 0,
      ariaSelected: isSelected,
      meta: {
        isDisabled,
        isInRange,
        isSelected
      }
    }
  }

  _cellYearAttributes(date: Date): Record<string, any> {
    const isDisabled = isYearDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)
    const isSelected = isYearSelected(date, this._startDate, this._endDate)
    const isInRange = isYearInRange(date, this._startDate, this._endDate)
    const isRangeHover = this._config.selectionType === 'year' && this._hoverDate && (
      this._selectEndDate ?
        isYearInRange(date, this._startDate, this._hoverDate) :
        isYearInRange(date, this._hoverDate, this._endDate)
    )

    const classNames = this._classNames({
      [CLASS_NAME_CALENDAR_CELL]: true,
      disabled: isDisabled,
      'range-hover': isRangeHover,
      range: isInRange,
      selected: isSelected
    })

    return {
      className: classNames,
      tabIndex: isDisabled ? -1 : 0,
      ariaSelected: isSelected,
      meta: {
        isDisabled,
        isInRange,
        isSelected
      }
    }
  }

  _rowWeekAttributes(date: Date): Record<string, any> {
    if (this._config.selectionType !== 'week') {
      return {
        className: this._classNames({ [CLASS_NAME_CALENDAR_ROW]: true }),
        tabIndex: -1,
        ariaSelected: false
      }
    }

    const isDisabled = isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)
    const isSelected = isDateSelected(date, this._startDate, this._endDate)
    const isInRange = isDateInRange(date, this._startDate, this._endDate)

    const isRangeHover = this._hoverDate && (
      this._selectEndDate ?
        isDateInRange(date, this._startDate, this._hoverDate) :
        isDateInRange(date, this._hoverDate, this._endDate)
    )

    const classNames = this._classNames({
      [CLASS_NAME_CALENDAR_ROW]: true,
      disabled: isDisabled,
      range: isInRange,
      'range-hover': isRangeHover,
      selected: isSelected
    })

    return {
      className: classNames,
      tabIndex: isDisabled ? -1 : 0,
      ariaSelected: isSelected
    }
  }

  // Navigation icons are directional, so prev/next swap when the calendar
  // renders right-to-left. The direction comes from the element's computed
  // style rather than isRTL(): the document can be LTR while an ancestor sets
  // dir="rtl" around the calendar.
  _isRtl(): boolean {
    // A detached element has no computed direction, so fall back to the nearest
    // ancestor that declares one (and finally to the document).
    if (this._element.isConnected) {
      return window.getComputedStyle(this._element).direction === 'rtl'
    }

    return ((this._element.closest('[dir]') as HTMLElement)?.dir ?? document.documentElement.dir) === 'rtl'
  }

  _navIcon(name: string): string {
    const mirrored = {
      navIconDoubleNext: 'navIconDoublePrev',
      navIconDoublePrev: 'navIconDoubleNext',
      navIconNext: 'navIconPrev',
      navIconPrev: 'navIconNext'
    }

    return this._sanitizeHtml(this._config[this._isRtl() ? (mirrored as Record<string, string>)[name] : name])
  }

  _sanitizeHtml(html: string): string {
    if (this._config.sanitize) {
      return sanitizeHtml(html, this._config.allowList, this._config.sanitizeFn)
    }

    return html
  }

  override _getConfig(config: any): any {
    const dataAttributes = Manipulator.getDataAttributes(this._element)

    for (const dataAttribute of Object.keys(dataAttributes)) {
      if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
        delete dataAttributes[dataAttribute]
      }
    }

    config = {
      ...dataAttributes,
      ...(typeof config === 'object' && config ? config : {})
    }
    config = this._mergeConfigObj(config)
    config = this._configAfterMerge(config)
    this._typeCheckConfig(config)

    return config
  }

  // Static

  static calendarInterface(element: string | Element | null, config?: any): void {
    const data: any = Calendar.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(this: any, config: any): any {
    return this.each(function (this: HTMLElement) {
      const data: any = Calendar.getOrCreateInstance(this, config)

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

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
import {
  escapeHtml, sanitizeByConfig, type SanitizerAllowList, SVGAllowlist
} from './util/sanitizer.js'
import {
  CHEVRON_DOUBLE_LEFT_ICON, CHEVRON_DOUBLE_RIGHT_ICON, CHEVRON_LEFT_ICON, CHEVRON_RIGHT_ICON
} from './util/icons.js'
import { defineJQueryPlugin, isRTL, jQueryDispatch } from './util/index.js'
import {
  type CalendarKeyAction,
  type CalendarKeyContext,
  convertToDateObject,
  createDateFormatter,
  createGroupsInArray,
  type DisabledDate,
  formatYearsRange,
  getCalendarDate,
  getCalendarKeyAction,
  getClosestSelectable,
  getDateBySelectionType,
  getMonthDetails,
  getMonthsNames,
  getStartOfView,
  getStartOfWeek,
  getYears,
  isDateDisabled,
  isDateInRange,
  isDateSelected,
  isDisableDateInRange,
  isPeriodDisabled,
  isPeriodInRange,
  isPeriodSelected,
  isToday,
  type PeriodViewTypes,
  type SelectionTypes,
  setRovingTabIndex,
  setTimeFromDate,
  type ViewTypes,
  YEARS_PER_PAGE
} from './util/calendar.js'

/**
 * Constants
 */

const NAME = 'calendar'
const DATA_KEY = 'coreui.calendar'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

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
const SELECTOR_CALENDAR_CELL_CLICKABLE = `${SELECTOR_CALENDAR_CELL}[data-coreui-selectable]`
const SELECTOR_CALENDAR_ROW = '.calendar-row'
const SELECTOR_CALENDAR_ROW_CLICKABLE = `${SELECTOR_CALENDAR_ROW}[data-coreui-selectable]`
const SELECTOR_DATA_CALENDAR = '[data-coreui-calendar]'

const CELL_RENDERERS: Record<ViewTypes, keyof CalendarConfig> = {
  days: 'renderDayCell',
  months: 'renderMonthCell',
  quarters: 'renderQuarterCell',
  years: 'renderYearCell'
}

const VIEW_BY_SELECTION_TYPE: Record<string, ViewTypes> = {
  day: 'days',
  week: 'days',
  month: 'months',
  quarter: 'quarters',
  year: 'years'
}

type CalendarCellMeta = {
  isDisabled: boolean
  isInRange: boolean
  isSelected: boolean
}

type CalendarDayCellMeta = CalendarCellMeta & {
  isInCurrentMonth: boolean
  isToday: boolean
}

type CalendarConfig = {
  allowList: SanitizerAllowList
  ariaNavNextMonthLabel: string
  ariaNavNextYearLabel: string
  ariaNavPrevMonthLabel: string
  ariaNavPrevYearLabel: string
  calendarDate: Date | number | string | null
  calendars: number
  dayFormat: 'numeric' | '2-digit'
  disabledDates: DisabledDate | DisabledDate[] | null
  endDate: Date | number | string | null
  firstDayOfWeek: number
  locale: string
  maxDate: Date | number | string | null
  minDate: Date | number | string | null
  monthFormat: 'long' | 'narrow' | 'short' | 'numeric' | '2-digit'
  navIconDoubleNext: string
  navIconDoublePrev: string
  navIconNext: string
  navIconPrev: string
  range: boolean
  renderDayCell: ((date: Date, meta?: CalendarDayCellMeta) => string) | null
  renderMonthCell: ((date: Date, meta: CalendarCellMeta) => string) | null
  renderQuarterCell: ((date: Date, meta: CalendarCellMeta) => string) | null
  renderYearCell: ((date: Date, meta: CalendarCellMeta) => string) | null
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  selectAdjacentDays: boolean
  selectEndDate: boolean
  selectionType: SelectionTypes
  showAdjacentDays: boolean
  showWeekNumber: boolean
  startDate: Date | number | string | null
  weekdayFormat: number | 'long' | 'narrow' | 'short'
  weekNumbersLabel: string | null
  yearFormat: 'numeric' | '2-digit'
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
  navIconDoubleNext: CHEVRON_DOUBLE_RIGHT_ICON,
  navIconDoublePrev: CHEVRON_DOUBLE_LEFT_ICON,
  navIconNext: CHEVRON_RIGHT_ICON,
  navIconPrev: CHEVRON_LEFT_ICON,
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
  protected declare _view: ViewTypes
  protected declare _formatter: ReturnType<typeof createDateFormatter>

  constructor(element?: string | Element | null, config?: Partial<CalendarConfig> | null) {
    super(element)

    this._formatter = createDateFormatter()
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
  setConfig(config?: Partial<CalendarConfig> | null): void {
    this._config = this._getConfig({ ...this._config, ...config })
    this._initializeDates(Object.keys(config ?? {}))

    if (!config || 'selectionType' in config) {
      this._initializeView()
    }

    this._updateCalendar()
  }

  refresh(): void {
    this._updateCalendar()
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

  _focusOnDate(date: Date): void {
    const targets = SelectorEngine.find(this._rovingSelector(), this._element as ParentNode) as HTMLElement[]
    const target = getClosestSelectable(targets, getStartOfView(date, this._view), this._rowsAreTargets()) ??
      SelectorEngine.findOne('table[tabindex="0"]', this._element as ParentNode)

    if (target) {
      target.focus()
    }
  }

  _focusOnCell(date: Date, panel?: number): void {
    const scope = panel === undefined ? this._element : SelectorEngine.find(SELECTOR_CALENDAR, this._element as ParentNode)[panel]
    const matches = (SelectorEngine.find(this._rovingSelector(), scope as ParentNode) as HTMLElement[])
      .filter(element => this._getDate(element).toDateString() === date.toDateString())

    const inMonth = matches.find(element => {
      const cell = this._rowsAreTargets() ? SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, element) : element
      return !cell?.classList.contains('previous') && !cell?.classList.contains('next')
    })

    const cell = inMonth ?? matches[0]

    if (cell) {
      cell.focus()
    }
  }

  _getEventTarget(event: any): HTMLElement | null {
    return event.target.closest(SELECTOR_CALENDAR_CELL) ??
      event.target.closest(SELECTOR_CALENDAR_ROW)
  }

  _rowsAreTargets(): boolean {
    return this._config.selectionType === 'week' && this._view === 'days'
  }

  _getDate(target: HTMLElement): Date {
    if (this._rowsAreTargets()) {
      const firstCell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, target.closest(SELECTOR_CALENDAR_ROW) as ParentNode)
      return getStartOfWeek(new Date(Manipulator.getDataAttribute(firstCell as HTMLElement, 'date') as string), this._config.firstDayOfWeek)
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

    if (isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)) {
      return
    }

    this._hoverDate = null
    this._selectDate(date)
    this._updateClassNamesAndAriaLabels()
    this._updateRovingTabIndex(SelectorEngine.findOne(':focus', this._element as ParentNode) as HTMLElement)
  }

  _handleCalendarKeydown(event: any): void {
    const target = this._getEventTarget(event) as HTMLElement
    const action = getCalendarKeyAction(event, this._getDate(target), this._getKeyContext(target))

    if (!action) {
      return
    }

    event.preventDefault()

    if (action.type === 'activate') {
      this._handleCalendarClick(event)
      return
    }

    if (action.type === 'page' && action.date) {
      const target = action.date
      this._modifyCalendarDate(action.years, action.months, () => this._focusOnDate(target))
      return
    }

    this._moveFocus(action)
  }

  _handleGridKeydown(event: any): void {
    if (!event.target.matches('table')) {
      return
    }

    const context = this._getKeyContext(event.target)
    const action = getCalendarKeyAction(event, null, context)

    if (!action) {
      return
    }

    event.preventDefault()

    if (action.type !== 'page') {
      this._moveFocus(action)
      return
    }

    this._modifyCalendarDate(action.years, action.months, () => {
      const panel = SelectorEngine.find(SELECTOR_CALENDAR, this._element as ParentNode)[context.panel]
      const stop = (SelectorEngine.findOne('[tabindex="0"]', panel as ParentNode) ??
        SelectorEngine.findOne('[tabindex="0"]', this._element as ParentNode)) as HTMLElement | null

      if (stop) {
        stop.focus()
      }
    })
  }

  _getKeyContext(target: HTMLElement): CalendarKeyContext {
    return {
      calendarDate: this._calendarDate,
      calendars: this._config.calendars,
      disabledDates: this._config.disabledDates,
      firstDayOfWeek: this._config.firstDayOfWeek,
      maxDate: this._maxDate,
      minDate: this._minDate,
      panel: SelectorEngine.find(SELECTOR_CALENDAR, this._element as ParentNode).indexOf(target.closest(SELECTOR_CALENDAR) as HTMLElement),
      rows: this._rowsAreTargets(),
      rtl: isRTL(this._element),
      view: this._view
    }
  }

  _moveFocus(action: CalendarKeyAction): void {
    if (action.type !== 'move') {
      return
    }

    if (action.years || action.months) {
      this._modifyCalendarDate(action.years, action.months, () => this._focusOnCell(action.date))
      return
    }

    this._focusOnCell(action.date, action.panel)
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

    this._updateRangeHover()
  }

  _handleCalendarMouseLeave(): void {
    this._hoverDate = null

    EventHandler.trigger(this._element, EVENT_CELL_HOVER, {
      date: null
    })

    this._updateRangeHover()
  }

  _updateRangeHover(): void {
    if (this._selectEndDate ? this._startDate : this._endDate) {
      this._updateClassNamesAndAriaLabels()
    }
  }

  _addEventListeners(): void {
    const targets = `${SELECTOR_CALENDAR_CELL_CLICKABLE}, ${SELECTOR_CALENDAR_ROW_CLICKABLE}`

    EventHandler.on(this._element, EVENT_CLICK_DATA_API, targets, event => {
      this._handleCalendarClick(event)
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, targets, event => {
      this._handleCalendarKeydown(event)
    })

    EventHandler.on(this._element, EVENT_MOUSEENTER, targets, event => {
      this._handleCalendarMouseEnter(event)
    })

    EventHandler.on(this._element, EVENT_MOUSELEAVE, targets, () => {
      this._handleCalendarMouseLeave()
    })

    EventHandler.on(this._element, EVENT_FOCUS, targets, event => {
      this._updateRovingTabIndex(this._getEventTarget(event) as HTMLElement)
      this._handleCalendarMouseEnter(event)
    })

    EventHandler.on(this._element, EVENT_BLUR, targets, () => {
      this._handleCalendarMouseLeave()
      this._updateRovingTabIndex()
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, 'table[tabindex]', event => {
      this._handleGridKeydown(event)
    })

    this._addNavigationEventListeners()

    EventHandler.on(this._element, EVENT_MOUSELEAVE, 'table', () => {
      EventHandler.trigger(this._element, EVENT_CALENDAR_MOUSE_LEAVE)
    })
  }

  _addNavigationEventListeners(): void {
    const navigationSelectors = {
      [SELECTOR_BTN_PREV]: () => this._modifyCalendarDate(0, -1),
      [SELECTOR_BTN_DOUBLE_PREV]: () => this._modifyCalendarDate(this._view === 'years' ? -YEARS_PER_PAGE : -1),
      [SELECTOR_BTN_NEXT]: () => this._modifyCalendarDate(0, 1),
      [SELECTOR_BTN_DOUBLE_NEXT]: () => this._modifyCalendarDate(this._view === 'years' ? YEARS_PER_PAGE : 1),
      [SELECTOR_BTN_MONTH]: (index: number) => this._showPeriodView('months', index),
      [SELECTOR_BTN_YEAR]: (index: number) => this._showPeriodView('years', index)
    }

    for (const [selector, handler] of Object.entries(navigationSelectors)) {
      EventHandler.on(this._element, EVENT_CLICK_DATA_API, selector, (event: any) => {
        event.preventDefault()
        const index = SelectorEngine.find(selector, this._element).indexOf(event.target.closest(selector))

        if (!handler(index)) {
          SelectorEngine.find(selector, this._element)[index]?.focus()
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

  _setCalendarView(view: ViewTypes, source?: string): void {
    this._view = view

    EventHandler.trigger(this._element, EVENT_CALENDAR_VIEW_CHANGE, {
      view,
      source
    })
  }

  _showPeriodView(view: 'months' | 'years', index: number): boolean {
    const shown = getCalendarDate(this._calendarDate, index, this._view)
    const start = new Date(shown.getFullYear(), view === 'months' ? shown.getMonth() : 0, 1).toDateString()
    const focus = view !== this._view && this._element.contains(document.activeElement)

    this._setCalendarView(view, 'navigation')
    this._updateCalendar(() => {
      if (focus) {
        const panel = SelectorEngine.find(SELECTOR_CALENDAR, this._element as ParentNode)[index]
        const target = SelectorEngine.findOne(`[data-coreui-selectable][data-coreui-date="${start}"]`, this._element) ?? SelectorEngine.findOne('[tabindex="0"]', panel)
        target?.focus()
      }
    })

    return focus
  }

  _modifyCalendarDate(years: number, months = 0, callback?: () => void): void {
    const year = this._calendarDate.getFullYear() + years
    const month = this._calendarDate.getMonth() + months
    const date = new Date(year, month, 1)
    date.setFullYear(year, month, 1)
    date.setHours(0, 0, 0, 0)

    this._setCalendarDate(date)
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
    const calendarPanelEl = document.createElement('div')
    calendarPanelEl.classList.add('calendar')

    Manipulator.setDataAttribute(calendarPanelEl, 'calendar-index', order)

    calendarPanelEl.innerHTML = '<div class="calendar-nav"><div class="calendar-nav-prev"></div><div class="calendar-nav-date" aria-live="polite"></div><div class="calendar-nav-next"></div></div><table role="grid"></table>'
    this._renderCalendarPanel(calendarPanelEl, order)

    return calendarPanelEl
  }

  _renderCalendarPanel(panel: HTMLElement, order: number): void {
    const calendarDate = getCalendarDate(this._calendarDate, order, this._view)
    const days = this._view === 'days'
    const [navigation, calendarTable] = panel.children
    const [prev, region, next] = navigation.children
    const monthLabel = days ? this._formatDate(calendarDate, { month: 'long' }) : ''
    const yearLabel = this._view === 'years' ? formatYearsRange(calendarDate.getFullYear(), this._config.locale) : this._formatDate(calendarDate, { year: 'numeric' })

    prev.innerHTML = `${this._navButton('btn-double-prev', 'navIconDoublePrev', this._config.ariaNavPrevYearLabel)} ${days ? this._navButton('btn-prev', 'navIconPrev', this._config.ariaNavPrevMonthLabel) : ''}`

    if (region.textContent !== `${monthLabel} ${yearLabel}`) {
      region.innerHTML = `${days ? `<button type="button" class="calendar-nav-btn btn-sm btn-month">${monthLabel}</button>` : ''} <button type="button" class="calendar-nav-btn btn-year">${yearLabel}</button>`
    }

    next.innerHTML = `${days ? this._navButton('btn-next', 'navIconNext', this._config.ariaNavNextMonthLabel) : ''} ${this._navButton('btn-double-next', 'navIconDoubleNext', this._config.ariaNavNextYearLabel)}`
    calendarTable.setAttribute('aria-label', this._gridLabel(calendarDate))
    calendarTable.innerHTML = days ? this._daysHtml(calendarDate) : this._periodsHtml(calendarDate)
  }

  _daysHtml(calendarDate: Date): string {
    const { showAdjacentDays, showWeekNumber, weekdayFormat, weekNumbersLabel } = this._config
    const weeks = getMonthDetails(calendarDate.getFullYear(), calendarDate.getMonth(), this._config.firstDayOfWeek)
    const headerCell = (content: string, abbr = '') => `<th class="${CLASS_NAME_CALENDAR_CELL}"${abbr}><div class="calendar-header-cell-inner">${content}</div></th>`

    const weekdays = weeks[0].days.map(({ date }) => {
      const long = this._formatDate(date, { weekday: 'long' })
      return headerCell(typeof weekdayFormat === 'string' ? this._formatDate(date, { weekday: weekdayFormat as 'long' }) : long.slice(0, weekdayFormat), ` abbr="${long}"`)
    })

    const rows = weeks.map(({ week, days }) => {
      const attributes = this._rowWeekAttributes(days[0].date, showAdjacentDays || days.some(({ month }) => month === 'current'))
      const cells = days.map(({ date, month }) => month === 'current' || showAdjacentDays ?
        this._cellHtml(date, this._cellDayAttributes(date, month), this._formatDate(date, { day: this._config.dayFormat })) :
        '<td role="gridcell"></td>')

      return `<tr class="${attributes.className}" tabindex="-1"${this._stateHtml(attributes)}>${showWeekNumber ? `<th class="calendar-cell-week-number">${week.number}</th>` : ''}${cells.join('')}</tr>`
    })

    return `<thead><tr>${showWeekNumber ? headerCell(weekNumbersLabel ? escapeHtml(weekNumbersLabel) : '') : ''}${weekdays.join('')}</tr></thead><tbody>${rows.join('')}</tbody>`
  }

  _periodsHtml(calendarDate: Date): string {
    const view = this._view
    const year = calendarDate.getFullYear()
    const monthNames = view === 'months' ? getMonthsNames(this._config.locale, this._config.monthFormat) : []
    const dates = view === 'years' ?
      getYears(year).map(value => new Date(value, 0, 1)) :
      Array.from({ length: view === 'months' ? 12 : 4 }, (_, index) => new Date(year, index * (view === 'months' ? 1 : 3), 1))

    const label = (date: Date) => {
      if (view === 'months') {
        return monthNames[date.getMonth()]
      }

      return view === 'quarters' ? `Q${(date.getMonth() / 3) + 1}` : this._formatDate(date, { year: this._config.yearFormat })
    }

    const rows = createGroupsInArray(dates, view === 'quarters' ? 1 : 4)
      .map(row => `<tr>${row.map(date => this._cellHtml(date, this._cellPeriodAttributes(date), label(date))).join('')}</tr>`)

    return `<tbody>${rows.join('')}</tbody>`
  }

  _cellHtml(date: Date, attributes: Record<string, any>, label: string): string {
    const renderer = CELL_RENDERERS[this._view]
    const content = this._config[renderer] ? sanitizeByConfig(this._config[renderer](date, attributes.meta), this._config) : label
    const ariaLabel = attributes.ariaLabel ? ` aria-label="${escapeHtml(attributes.ariaLabel)}"` : ''
    const ariaCurrent = attributes.ariaCurrent ? ' aria-current="date"' : ''

    return `<td class="${attributes.className}" role="gridcell" tabindex="-1"${this._stateHtml(attributes)}${ariaCurrent}${ariaLabel} data-coreui-date="${date.toDateString()}"><div class="${CLASS_NAME_CALENDAR_CELL_INNER} ${this._view.slice(0, -1)}">${content}</div></td>`
  }

  _stateHtml({ ariaDisabled, ariaSelected, selectable }: Record<string, any>): string {
    return `${selectable ? ' data-coreui-selectable' : ''}${ariaSelected ? ' aria-selected="true"' : ''}${ariaDisabled ? ' aria-disabled="true"' : ''}`
  }

  _updateRovingTabIndex(preferred?: HTMLElement): void {
    setRovingTabIndex(this._element as HTMLElement, this._rovingSelector(), getStartOfView(this._calendarDate as Date, this._view), this._rowsAreTargets(), preferred)
  }

  _gridLabel(date: Date): string {
    if (this._view === 'days') {
      return this._formatDate(date, { month: 'long', year: 'numeric' })
    }

    if (this._view === 'years') {
      return formatYearsRange(date.getFullYear(), this._config.locale)
    }

    return this._formatDate(date, { year: 'numeric' })
  }

  _rovingSelector(): string {
    return this._rowsAreTargets() ? SELECTOR_CALENDAR_ROW_CLICKABLE : SELECTOR_CALENDAR_CELL_CLICKABLE
  }

  _createCalendar(): void {
    this._setCalendarClasses()

    for (const [index, _] of Array.from({ length: this._config.calendars }).entries()) {
      this._element.append(this._createCalendarPanel(index))
    }

    this._updateRovingTabIndex()
  }

  _setCalendarClasses(): void {
    if (this._config.selectionType && this._view === 'days') {
      this._element.classList.add(`select-${this._config.selectionType}`)
    }

    if (this._config.showWeekNumber) {
      this._element.classList.add(CLASS_NAME_SHOW_WEEK_NUMBERS)
    }

    this._element.classList.add(CLASS_NAME_CALENDARS)
  }

  _initializeDates(keys?: string[]): void {
    const changed = (...names: string[]) => !keys || keys.includes('selectionType') || names.some(name => keys.includes(name))

    if (changed('calendarDate', 'startDate', 'endDate')) {
      const source = !keys || keys.includes('selectionType') ?
        this._config.calendarDate || this._config.startDate || this._config.endDate :
        ['calendarDate', 'startDate', 'endDate'].filter(name => keys.includes(name)).map(name => this._config[name]).find(Boolean) ?? null

      this._calendarDate = convertToDateObject(source, this._config.selectionType) || this._calendarDate || new Date()
    }

    if (changed('startDate')) {
      this._startDate = convertToDateObject(this._config.startDate, this._config.selectionType)
    }

    if (changed('endDate')) {
      this._endDate = convertToDateObject(this._config.endDate, this._config.selectionType)
    }

    if (changed('minDate')) {
      this._minDate = convertToDateObject(this._config.minDate, this._config.selectionType)
    }

    if (changed('maxDate')) {
      this._maxDate = convertToDateObject(this._config.maxDate, this._config.selectionType)
    }

    if (changed('selectEndDate')) {
      this._selectEndDate = this._config.selectEndDate
    }

    this._hoverDate = null
  }

  _initializeView(): void {
    this._view = VIEW_BY_SELECTION_TYPE[this._config.selectionType] || 'days'
  }

  _updateCalendar(callback?: () => void): void {
    const focused = this._element.contains(document.activeElement) ? document.activeElement as HTMLElement : null
    const restoreFocus = focused && this._focusRestorer(focused)
    const panels = SelectorEngine.find(SELECTOR_CALENDAR, this._element as ParentNode)

    if (panels.length === this._config.calendars) {
      this._setCalendarClasses()

      for (const [index, panel] of panels.entries()) {
        this._renderCalendarPanel(panel as HTMLElement, index)
      }

      this._updateRovingTabIndex()
    } else {
      this._element.innerHTML = ''
      this._createCalendar()
    }

    if (callback) {
      callback()
    }

    if (restoreFocus && (!document.activeElement || document.activeElement === document.body)) {
      restoreFocus()
    }
  }

  _focusRestorer(focused: HTMLElement): () => void {
    const index = SelectorEngine.find(SELECTOR_CALENDAR, this._element as ParentNode).indexOf(focused.closest(SELECTOR_CALENDAR) as HTMLElement)
    const cell = focused.matches(SELECTOR_CALENDAR_ROW) ? SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, focused) : focused.closest(SELECTOR_CALENDAR_CELL)
    const date = cell?.getAttribute('data-coreui-date')
    const { className } = focused

    return () => {
      const panel = SelectorEngine.find(SELECTOR_CALENDAR, this._element as ParentNode)[index] ?? this._element
      const matches = SelectorEngine.find(this._rovingSelector(), this._element as ParentNode).filter(target =>
        (target.matches(SELECTOR_CALENDAR_ROW) ? SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, target) : target)?.getAttribute('data-coreui-date') === date)
      const target = ((date ? matches.find(target => !target.matches('.next, .previous')) ?? matches[0] : panel.getElementsByClassName(className)[0]) ??
        SelectorEngine.findOne('[tabindex="0"]', panel) ?? SelectorEngine.findOne('[tabindex="0"]', this._element)) as HTMLElement | null

      target?.focus({ preventScroll: true })
    }
  }

  _updateClassNamesAndAriaLabels(): void {
    if (this._rowsAreTargets()) {
      for (const row of SelectorEngine.find(SELECTOR_CALENDAR_ROW, this._element as ParentNode)) {
        const firstCell = SelectorEngine.findOne(SELECTOR_CALENDAR_CELL, row)

        if (firstCell) {
          this._applyState(row, this._rowWeekAttributes(this._getDate(firstCell)))
        }
      }

      return
    }

    for (const cell of SelectorEngine.find(SELECTOR_CALENDAR_CELL_CLICKABLE, this._element as ParentNode)) {
      const date = this._getDate(cell)

      this._applyState(cell, this._view === 'days' ?
        this._cellDayAttributes(date, ['previous', 'next'].find(month => cell.classList.contains(month)) ?? 'current') :
        this._cellPeriodAttributes(date))
    }
  }

  _applyState(element: HTMLElement, { ariaDisabled, ariaSelected, className, selectable }: Record<string, any>): void {
    element.className = className
    element.toggleAttribute('data-coreui-selectable', selectable)

    if (ariaSelected) {
      element.setAttribute('aria-selected', 'true')
    } else {
      element.removeAttribute('aria-selected')
    }

    if (ariaDisabled) {
      element.setAttribute('aria-disabled', 'true')
    } else {
      element.removeAttribute('aria-disabled')
    }
  }

  _isRangeHover(inRange: (start: Date | null, end: Date | null) => boolean): boolean {
    return Boolean(this._hoverDate) && (this._selectEndDate ? inRange(this._startDate, this._hoverDate) : inRange(this._hoverDate, this._endDate))
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
        selectable: false,
        ariaSelected: false,
        ariaLabel: this._formatDate(date),
        ariaCurrent: isTodayDate
      }
    }

    const isInRange = isCurrentMonth && isDateInRange(date, this._startDate, this._endDate)
    const isRangeHover = isCurrentMonth && this._isRangeHover((start, end) => isDateInRange(date, start, end))

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
      selectable: (isCurrentMonth || this._config.selectAdjacentDays) && !isDisabled,
      ariaDisabled: isDisabled,
      ariaSelected: isSelected,
      ariaLabel: this._formatDate(date),
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

  _cellPeriodAttributes(date: Date): Record<string, any> {
    const view = this._view as PeriodViewTypes
    const isDisabled = isPeriodDisabled(date, view, this._minDate, this._maxDate, this._config.disabledDates)
    const isSelected = isPeriodSelected(date, view, this._startDate, this._endDate)
    const isInRange = isPeriodInRange(date, view, this._startDate, this._endDate)
    const isRangeHover = VIEW_BY_SELECTION_TYPE[this._config.selectionType] === view &&
      this._isRangeHover((start, end) => isPeriodInRange(date, view, start, end))

    return {
      className: this._classNames({
        [CLASS_NAME_CALENDAR_CELL]: true,
        disabled: isDisabled,
        'range-hover': isRangeHover,
        range: isInRange,
        selected: isSelected
      }),
      selectable: !isDisabled,
      ariaDisabled: isDisabled,
      ariaSelected: isSelected,
      meta: {
        isDisabled,
        isInRange,
        isSelected
      }
    }
  }

  _rowWeekAttributes(date: Date, visible = true): Record<string, any> {
    if (this._config.selectionType !== 'week' || !visible) {
      return {
        className: this._classNames({ [CLASS_NAME_CALENDAR_ROW]: true }),
        selectable: false,
        ariaSelected: false
      }
    }

    const isDisabled = isDateDisabled(date, this._minDate, this._maxDate, this._config.disabledDates)
    const isSelected = isDateSelected(date, this._startDate, this._endDate)
    const isInRange = isDateInRange(date, this._startDate, this._endDate)

    const isRangeHover = this._isRangeHover((start, end) => isDateInRange(date, start, end))

    const classNames = this._classNames({
      [CLASS_NAME_CALENDAR_ROW]: true,
      disabled: isDisabled,
      range: isInRange,
      'range-hover': isRangeHover,
      selected: isSelected
    })

    return {
      className: classNames,
      selectable: !isDisabled,
      ariaDisabled: isDisabled,
      ariaSelected: isSelected
    }
  }

  _navButton(className: string, icon: string, label: string): string {
    return `<button type="button" class="calendar-nav-btn ${className}" aria-label="${escapeHtml(label)}"><span class="calendar-nav-icon">${this._navIcon(icon)}</span></button>`
  }

  _navIcon(name: string): string {
    const mirrored = {
      navIconDoubleNext: 'navIconDoublePrev',
      navIconDoublePrev: 'navIconDoubleNext',
      navIconNext: 'navIconPrev',
      navIconPrev: 'navIconNext'
    }

    return sanitizeByConfig(this._config[isRTL(this._element) ? (mirrored as Record<string, string>)[name] : name], this._config)
  }

  _formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return this._formatter(date, this._config.locale, options)
  }

  // Static

  static calendarInterface(element: string | Element | null, config?: any, ...args: any[]): void {
    const data: any = Calendar.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config](...args)
    }
  }

  static jQueryInterface(this: any, config: any, ...args: any[]): any {
    return jQueryDispatch(this, Calendar, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const element of Array.from(document.querySelectorAll(SELECTOR_DATA_CALENDAR))) {
    Calendar.calendarInterface(element)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Calendar)

export default Calendar
export type { CalendarCellMeta, CalendarConfig, CalendarDayCellMeta }

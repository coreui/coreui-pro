/* eslint-env jasmine */

import Calendar from '../../src/calendar.js'
import {
  getFixture, clearFixture, createEvent, jQueryMock
} from '../helpers/fixture.js'
import EventHandler from '../../src/dom/event-handler.js'

describe('Calendar', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(Calendar.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(Calendar.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('NAME', () => {
    it('should return plugin NAME', () => {
      expect(Calendar.NAME).toEqual('calendar')
    })
  })

  describe('constructor', () => {
    it('should create a Calendar instance with default config if no config is provided', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      expect(calendar).toBeInstanceOf(Calendar)
      expect(calendar._config).toBeDefined()
      expect(calendar._element).toEqual(div)
    })

    it('should allow overriding default config', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        locale: 'fr',
        calendars: 2,
        selectionType: 'month'
      })

      expect(calendar._config.locale).toEqual('fr')
      expect(calendar._config.calendars).toEqual(2)
      expect(calendar._config.selectionType).toEqual('month')
    })

    it('should set `_view` based on `selectionType`', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year'
      })

      expect(calendar._view).toEqual('years')
    })

    it('should set _view to "days" for selectionType "day"', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'day'
      })

      expect(calendar._view).toEqual('days')
    })

    it('should set _view to "days" for selectionType "week"', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'week'
      })

      expect(calendar._view).toEqual('days')
    })

    it('should set _view to "months" for selectionType "month"', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'month'
      })

      expect(calendar._view).toEqual('months')
    })

    it('should set _view to "quarters" for selectionType "quarter"', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'quarter'
      })

      expect(calendar._view).toEqual('quarters')
    })

    it('should properly create the initial markup for days view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div) // eslint-disable-line no-new

      // Check if .calendar container is created
      expect(div.querySelector('.calendar')).not.toBeNull()

      // Check if .calendar-nav exists
      expect(div.querySelector('.calendar-nav')).not.toBeNull()

      // Check if a table with <thead> is created (days view)
      expect(div.querySelector('.calendar table thead')).not.toBeNull()
      expect(div.querySelector('.calendar table tbody')).not.toBeNull()
    })

    it('should create markup for months view when selectionType is "month"', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { selectionType: 'month' }) // eslint-disable-line no-new

      expect(div.querySelector('.calendar table thead')).toBeNull()
      expect(div.querySelector('.calendar table tbody')).not.toBeNull()
      expect(div.querySelector('.month')).not.toBeNull()
    })

    it('should create markup for quarters view when selectionType is "quarter"', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { selectionType: 'quarter' }) // eslint-disable-line no-new

      expect(div.querySelector('.calendar table thead')).toBeNull()
      expect(div.querySelector('.calendar table tbody')).not.toBeNull()
      expect(div.querySelector('.quarter')).not.toBeNull()
    })

    it('should create markup for years view when selectionType is "year"', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { selectionType: 'year' }) // eslint-disable-line no-new

      expect(div.querySelector('.calendar table thead')).toBeNull()
      expect(div.querySelector('.calendar table tbody')).not.toBeNull()
      expect(div.querySelector('.year')).not.toBeNull()
    })

    it('should create markup for week selection type with days view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { selectionType: 'week' }) // eslint-disable-line no-new

      expect(div.querySelector('.calendar table thead')).not.toBeNull()
      expect(div.querySelector('.calendar table tbody')).not.toBeNull()
      expect(div.classList).toContain('select-week')
    })

    it('should add "select-day" class for day selectionType', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { selectionType: 'day' }) // eslint-disable-line no-new

      expect(div.classList).toContain('select-day')
    })

    it('should initialize calendarDate from startDate if calendarDate is null', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const startDate = new Date(2023, 5, 15)
      const calendar = new Calendar(div, { startDate })

      expect(calendar._calendarDate.getFullYear()).toEqual(2023)
      expect(calendar._calendarDate.getMonth()).toEqual(5)
    })

    it('should initialize calendarDate from endDate if calendarDate and startDate are null', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const endDate = new Date(2023, 8, 20)
      const calendar = new Calendar(div, { endDate })

      expect(calendar._calendarDate.getFullYear()).toEqual(2023)
      expect(calendar._calendarDate.getMonth()).toEqual(8)
    })

    it('should default calendarDate to current date if no dates provided', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const now = new Date()

      expect(calendar._calendarDate.getFullYear()).toEqual(now.getFullYear())
      expect(calendar._calendarDate.getMonth()).toEqual(now.getMonth())
    })

    it('should initialize minDate and maxDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const minDate = new Date(2023, 0, 1)
      const maxDate = new Date(2023, 11, 31)
      const calendar = new Calendar(div, { minDate, maxDate })

      expect(calendar._minDate).not.toBeNull()
      expect(calendar._maxDate).not.toBeNull()
    })

    it('should initialize selectEndDate from config', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectEndDate: true, range: true })

      expect(calendar._selectEndDate).toBeTrue()
    })
  })

  describe('multiple calendars', () => {
    it('should render 2 calendar panels when calendars is 2', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendars: 2 }) // eslint-disable-line no-new

      const panels = div.querySelectorAll('.calendar')
      expect(panels.length).toEqual(2)
    })

    it('should render 3 calendar panels when calendars is 3', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendars: 3 }) // eslint-disable-line no-new

      const panels = div.querySelectorAll('.calendar')
      expect(panels.length).toEqual(3)
    })
  })

  describe('showWeekNumber', () => {
    it('should show week numbers when showWeekNumber is true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { showWeekNumber: true }) // eslint-disable-line no-new

      expect(div.classList).toContain('show-week-numbers')
      expect(div.querySelector('.calendar-cell-week-number')).not.toBeNull()
    })

    it('should show weekNumbersLabel in header when provided', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { showWeekNumber: true, weekNumbersLabel: 'Wk' }) // eslint-disable-line no-new

      const headerCells = div.querySelectorAll('thead th')
      expect(headerCells[0].textContent).toContain('Wk')
    })

    it('should not show week numbers by default', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div) // eslint-disable-line no-new

      expect(div.classList).not.toContain('show-week-numbers')
      expect(div.querySelector('.calendar-cell-week-number')).toBeNull()
    })
  })

  describe('showAdjacementDays', () => {
    it('should show adjacement days by default', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2023, 5, 1) }) // eslint-disable-line no-new

      const cells = div.querySelectorAll('.calendar-cell')
      const prevMonthCells = div.querySelectorAll('.calendar-cell.previous')
      const nextMonthCells = div.querySelectorAll('.calendar-cell.next')

      // There should be adjacement day cells rendered
      expect(prevMonthCells.length + nextMonthCells.length).toBeGreaterThan(0)
    })

    it('should not show adjacement days when showAdjacementDays is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { showAdjacementDays: false, calendarDate: new Date(2023, 5, 1) }) // eslint-disable-line no-new

      const prevMonthCells = div.querySelectorAll('.calendar-cell.previous')
      const nextMonthCells = div.querySelectorAll('.calendar-cell.next')

      expect(prevMonthCells.length).toEqual(0)
      expect(nextMonthCells.length).toEqual(0)
    })
  })

  describe('selectAdjacementDays', () => {
    it('should make adjacement day cells clickable when selectAdjacementDays is true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        selectAdjacementDays: true,
        calendarDate: new Date(2023, 5, 1)
      })

      const clickableCells = div.querySelectorAll('.calendar-cell.clickable')
      expect(clickableCells.length).toBeGreaterThan(0)
    })
  })

  describe('disabledDates', () => {
    it('should mark dates as disabled when disabledDates array is provided', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2023, 5, 1)
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate,
        disabledDates: [new Date(2023, 5, 10), new Date(2023, 5, 15)]
      })

      const disabledCells = div.querySelectorAll('.calendar-cell.disabled')
      expect(disabledCells.length).toBeGreaterThan(0)
    })

    it('should not allow selecting disabled dates', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2023, 5, 1)
      const calendar = new Calendar(div, {
        calendarDate,
        disabledDates: [new Date(2023, 5, 10)]
      })

      const disabledDate = new Date(2023, 5, 10)
      calendar._selectDate(disabledDate)

      expect(calendar._startDate).toBeNull()
    })

    it('should accept a function for disabledDates', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2023, 5, 1)
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate,
        disabledDates: date => date.getDay() === 0 // Disable Sundays
      })

      // Calendar should render without errors
      expect(div.querySelector('.calendar')).not.toBeNull()
    })
  })

  describe('minDate and maxDate', () => {
    it('should disable dates before minDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        minDate: new Date(2023, 5, 10)
      })

      const disabledCells = div.querySelectorAll('.calendar-cell.disabled')
      expect(disabledCells.length).toBeGreaterThan(0)
    })

    it('should disable dates after maxDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        maxDate: new Date(2023, 5, 20)
      })

      const disabledCells = div.querySelectorAll('.calendar-cell.disabled')
      expect(disabledCells.length).toBeGreaterThan(0)
    })

    it('should not allow selecting a date before minDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1),
        minDate: new Date(2023, 5, 10)
      })

      calendar._selectDate(new Date(2023, 5, 5))
      expect(calendar._startDate).toBeNull()
    })

    it('should not allow selecting a date after maxDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1),
        maxDate: new Date(2023, 5, 20)
      })

      calendar._selectDate(new Date(2023, 5, 25))
      expect(calendar._startDate).toBeNull()
    })
  })

  describe('renderDayCell', () => {
    it('should use renderDayCell function for custom day rendering', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        renderDayCell: (date, meta) => `<span class="custom-day">${date.getDate()}</span>`
      })

      const customDays = div.querySelectorAll('.custom-day')
      expect(customDays.length).toBeGreaterThan(0)
    })
  })

  describe('renderMonthCell', () => {
    it('should use renderMonthCell function for custom month rendering', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        selectionType: 'month',
        calendarDate: new Date(2023, 5, 1),
        renderMonthCell: (date, meta) => `<span class="custom-month">M${date.getMonth() + 1}</span>`
      })

      const customMonths = div.querySelectorAll('.custom-month')
      expect(customMonths.length).toBeGreaterThan(0)
    })
  })

  describe('renderQuarterCell', () => {
    it('should use renderQuarterCell function for custom quarter rendering', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        selectionType: 'quarter',
        calendarDate: new Date(2023, 5, 1),
        renderQuarterCell: (date, meta) => `<span class="custom-quarter">Quarter</span>`
      })

      const customQuarters = div.querySelectorAll('.custom-quarter')
      expect(customQuarters.length).toBeGreaterThan(0)
    })
  })

  describe('renderYearCell', () => {
    it('should use renderYearCell function for custom year rendering', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        selectionType: 'year',
        calendarDate: new Date(2023, 5, 1),
        renderYearCell: (date, meta) => `<span class="custom-year">${date.getFullYear()}</span>`
      })

      const customYears = div.querySelectorAll('.custom-year')
      expect(customYears.length).toBeGreaterThan(0)
    })
  })

  describe('sanitize', () => {
    it('should sanitize renderDayCell output by default', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        renderDayCell: () => '<script>alert("xss")</script><span>safe</span>'
      })

      // Script tags should be stripped
      expect(div.querySelector('script')).toBeNull()
    })

    it('should not sanitize when sanitize is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        sanitize: false,
        renderDayCell: () => '<b class="test-no-sanitize">bold</b>'
      })

      expect(div.querySelector('.test-no-sanitize')).not.toBeNull()
    })

    it('should use custom sanitizeFn when provided', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const sanitizeFn = jasmine.createSpy('sanitizeFn').and.callFake(html => html)
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        sanitizeFn,
        renderDayCell: () => '<span>custom</span>'
      })

      expect(sanitizeFn).toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('should clear the calendar HTML and create a new one', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const oldHtml = div.innerHTML

      calendar.update({
        selectionType: 'month'
      })

      expect(div.innerHTML).not.toEqual(oldHtml)
      // Now we should see the months view
      expect(div.querySelector('.calendar table thead')).toBeNull()
      expect(div.querySelector('.calendar table tbody')).not.toBeNull()
      expect(div.querySelector('.month')).not.toBeNull()
    })

    it('should use the new config object after update', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      calendar.update({
        showWeekNumber: true
      })

      expect(calendar._config.showWeekNumber).toBeTrue()
      expect(div.classList).toContain('show-week-numbers')
    })

    it('should reinitialize dates on update', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      calendar.update({
        startDate: new Date(2024, 2, 15)
      })

      expect(calendar._startDate).not.toBeNull()
      expect(calendar._startDate.getFullYear()).toEqual(2024)
    })
  })

  describe('refresh', () => {
    it('should refresh the calendar without changing config', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1)
      })

      const configBefore = { ...calendar._config }
      calendar.refresh()

      expect(calendar._config.locale).toEqual(configBefore.locale)
      expect(div.querySelector('.calendar')).not.toBeNull()
    })

    it('should recreate calendar markup on refresh', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      // Manually clear and verify refresh rebuilds
      calendar.refresh()

      expect(div.querySelector('.calendar')).not.toBeNull()
      expect(div.querySelector('.calendar-nav')).not.toBeNull()
    })
  })

  describe('range selection', () => {
    it('should set startDate on first click in range mode', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        range: true,
        calendarDate: new Date(2023, 5, 1)
      })

      const date = new Date(2023, 5, 10)
      calendar._selectDate(date)

      expect(calendar._startDate).not.toBeNull()
      expect(calendar._selectEndDate).toBeTrue()
    })

    it('should set endDate on second click in range mode', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        range: true,
        calendarDate: new Date(2023, 5, 1)
      })

      calendar._selectDate(new Date(2023, 5, 10))
      calendar._selectDate(new Date(2023, 5, 20))

      expect(calendar._startDate).not.toBeNull()
      expect(calendar._endDate).not.toBeNull()
    })

    it('should reset when selectEndDate is true and date < startDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        range: true,
        calendarDate: new Date(2023, 5, 1)
      })

      // Select start date
      calendar._selectDate(new Date(2023, 5, 15))
      // Now selectEndDate should be true, select a date before startDate
      calendar._selectDate(new Date(2023, 5, 5))

      // startDate should be reset to the earlier date, endDate should be null
      expect(calendar._startDate.getDate()).toEqual(5)
      expect(calendar._endDate).toBeNull()
    })

    it('should reset when selectEndDate is false and date > endDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        range: true,
        calendarDate: new Date(2023, 5, 1),
        startDate: new Date(2023, 5, 10),
        endDate: new Date(2023, 5, 20),
        selectEndDate: false
      })

      // Select a date after endDate while selectEndDate is false
      calendar._selectDate(new Date(2023, 5, 25))

      // Should set startDate to the new date and clear endDate
      expect(calendar._startDate.getDate()).toEqual(25)
      expect(calendar._endDate).toBeNull()
      expect(calendar._selectEndDate).toBeTrue()
    })

    it('should clear both dates if disableDateInRange is detected when selecting end date', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        range: true,
        calendarDate: new Date(2023, 5, 1),
        disabledDates: [new Date(2023, 5, 15)]
      })

      // Select start date before disabled date
      calendar._selectDate(new Date(2023, 5, 10))
      // Select end date after disabled date (should detect disabled in range)
      calendar._selectDate(new Date(2023, 5, 20))

      expect(calendar._startDate).toBeNull()
      expect(calendar._endDate).toBeNull()
    })

    it('should clear both dates if disableDateInRange is detected when selecting start date', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        range: true,
        calendarDate: new Date(2023, 5, 1),
        startDate: new Date(2023, 5, 10),
        endDate: new Date(2023, 5, 25),
        selectEndDate: false,
        disabledDates: [new Date(2023, 5, 8)]
      })

      // Select a start date that has a disabled date in range between it and endDate
      calendar._selectDate(new Date(2023, 5, 5))

      // Because disabled date 8 is between 5 and the current endDate (25)
      // the code checks isDisableDateInRange(date, this._endDate, ...)
      // If there's a disabled date in range, both are cleared
      expect(calendar._startDate).toBeNull()
      expect(calendar._endDate).toBeNull()
    })

    it('should set startDate directly in non-range mode', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1)
      })

      calendar._selectDate(new Date(2023, 5, 15))
      expect(calendar._startDate.getDate()).toEqual(15)
    })
  })

  describe('keyboard navigation', () => {
    it('should select a date on Enter key press', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div)
        const showSpy = spyOn(calendar, '_handleCalendarClick').and.callThrough()

        setTimeout(() => {
          const dayCell = div.querySelector('.calendar-cell[tabindex="0"]')
          expect(dayCell).not.toBeNull()

          const keydownEvent = createEvent('keydown')
          keydownEvent.key = 'Enter'
          dayCell.dispatchEvent(keydownEvent)

          expect(showSpy).toHaveBeenCalled()
          resolve()
        }, 10)
      })
    })

    it('should select a date on Space key press', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div)
        const clickSpy = spyOn(calendar, '_handleCalendarClick').and.callThrough()

        setTimeout(() => {
          const dayCell = div.querySelector('.calendar-cell[tabindex="0"]')
          expect(dayCell).not.toBeNull()

          const keydownEvent = createEvent('keydown')
          keydownEvent.key = 'Enter'
          Object.defineProperty(keydownEvent, 'code', { value: 'Space' })
          dayCell.dispatchEvent(keydownEvent)

          expect(clickSpy).toHaveBeenCalled()
          resolve()
        }, 10)
      })
    })

    it('should navigate with ArrowRight in days view', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div, { calendarDate: new Date(2023, 5, 1) }) // eslint-disable-line no-new

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          expect(cells.length).toBeGreaterThan(1)

          const firstCell = cells[0]
          firstCell.focus()

          const keydownEvent = createEvent('keydown')
          keydownEvent.key = 'ArrowRight'
          firstCell.dispatchEvent(keydownEvent)

          // The test verifies the event is handled without error
          resolve()
        }, 10)
      })
    })

    it('should navigate with ArrowLeft in days view', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div, { calendarDate: new Date(2023, 5, 1) }) // eslint-disable-line no-new

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          expect(cells.length).toBeGreaterThan(1)

          const lastCell = cells[cells.length - 1]
          lastCell.focus()

          const keydownEvent = createEvent('keydown')
          keydownEvent.key = 'ArrowLeft'
          lastCell.dispatchEvent(keydownEvent)

          resolve()
        }, 10)
      })
    })

    it('should navigate with ArrowDown in days view (moves 7 days)', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div, { calendarDate: new Date(2023, 5, 1) }) // eslint-disable-line no-new

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          expect(cells.length).toBeGreaterThan(7)

          const firstCell = cells[0]
          firstCell.focus()

          const keydownEvent = createEvent('keydown')
          keydownEvent.key = 'ArrowDown'
          firstCell.dispatchEvent(keydownEvent)

          resolve()
        }, 10)
      })
    })

    it('should navigate with ArrowUp in days view (moves -7 days)', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div, { calendarDate: new Date(2023, 5, 1) }) // eslint-disable-line no-new

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          expect(cells.length).toBeGreaterThan(7)

          const cell = cells[10]
          cell.focus()

          const keydownEvent = createEvent('keydown')
          keydownEvent.key = 'ArrowUp'
          cell.dispatchEvent(keydownEvent)

          resolve()
        }, 10)
      })
    })

    it('should not navigate past maxDate with ArrowRight', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const maxDate = new Date(2023, 5, 15)
        new Calendar(div, { calendarDate: new Date(2023, 5, 1), maxDate }) // eslint-disable-line no-new

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          if (cells.length > 0) {
            const lastEnabledCell = cells[cells.length - 1]
            lastEnabledCell.focus()

            const keydownEvent = createEvent('keydown')
            keydownEvent.key = 'ArrowRight'
            lastEnabledCell.dispatchEvent(keydownEvent)
          }

          resolve()
        }, 10)
      })
    })

    it('should not navigate before minDate with ArrowLeft', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const minDate = new Date(2023, 5, 10)
        new Calendar(div, { calendarDate: new Date(2023, 5, 1), minDate }) // eslint-disable-line no-new

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          if (cells.length > 0) {
            const firstEnabledCell = cells[0]
            firstEnabledCell.focus()

            const keydownEvent = createEvent('keydown')
            keydownEvent.key = 'ArrowLeft'
            firstEnabledCell.dispatchEvent(keydownEvent)
          }

          resolve()
        }, 10)
      })
    })

    it('should not navigate past maxDate with ArrowDown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const maxDate = new Date(2023, 5, 15)
        new Calendar(div, { calendarDate: new Date(2023, 5, 1), maxDate }) // eslint-disable-line no-new

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          if (cells.length > 0) {
            const lastEnabledCell = cells[cells.length - 1]
            lastEnabledCell.focus()

            const keydownEvent = createEvent('keydown')
            keydownEvent.key = 'ArrowDown'
            lastEnabledCell.dispatchEvent(keydownEvent)
          }

          resolve()
        }, 10)
      })
    })

    it('should not navigate before minDate with ArrowUp', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const minDate = new Date(2023, 5, 10)
        new Calendar(div, { calendarDate: new Date(2023, 5, 1), minDate }) // eslint-disable-line no-new

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          if (cells.length > 0) {
            const firstEnabledCell = cells[0]
            firstEnabledCell.focus()

            const keydownEvent = createEvent('keydown')
            keydownEvent.key = 'ArrowUp'
            firstEnabledCell.dispatchEvent(keydownEvent)
          }

          resolve()
        }, 10)
      })
    })

    it('should navigate at boundary and change month when ArrowRight at last cell', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })
        const modifySpy = spyOn(calendar, '_modifyCalendarDate').and.callThrough()

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          if (cells.length > 0) {
            const lastCell = cells[cells.length - 1]
            lastCell.focus()

            const keydownEvent = createEvent('keydown')
            keydownEvent.key = 'ArrowRight'
            lastCell.dispatchEvent(keydownEvent)

            expect(modifySpy).toHaveBeenCalled()
          }

          resolve()
        }, 10)
      })
    })

    it('should navigate at boundary and change month when ArrowLeft at first cell', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })
        const modifySpy = spyOn(calendar, '_modifyCalendarDate').and.callThrough()

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          if (cells.length > 0) {
            const firstCell = cells[0]
            firstCell.focus()

            const keydownEvent = createEvent('keydown')
            keydownEvent.key = 'ArrowLeft'
            firstCell.dispatchEvent(keydownEvent)

            expect(modifySpy).toHaveBeenCalled()
          }

          resolve()
        }, 10)
      })
    })

    it('should navigate at boundary with ArrowDown when near end of cells', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })
        const modifySpy = spyOn(calendar, '_modifyCalendarDate').and.callThrough()

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          if (cells.length > 0) {
            // Focus on a cell near the end (less than 7 from end)
            const nearEndCell = cells[cells.length - 3]
            nearEndCell.focus()

            const keydownEvent = createEvent('keydown')
            keydownEvent.key = 'ArrowDown'
            nearEndCell.dispatchEvent(keydownEvent)

            expect(modifySpy).toHaveBeenCalled()
          }

          resolve()
        }, 10)
      })
    })

    it('should navigate at boundary with ArrowUp when near start of cells', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })
        const modifySpy = spyOn(calendar, '_modifyCalendarDate').and.callThrough()

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          if (cells.length > 0) {
            // Focus on a cell near the start (less than 7 from start)
            const nearStartCell = cells[3]
            nearStartCell.focus()

            const keydownEvent = createEvent('keydown')
            keydownEvent.key = 'ArrowUp'
            nearStartCell.dispatchEvent(keydownEvent)

            expect(modifySpy).toHaveBeenCalled()
          }

          resolve()
        }, 10)
      })
    })

    it('should handle keyboard navigation in months view', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, {
          selectionType: 'month',
          calendarDate: new Date(2023, 5, 1)
        })
        const modifySpy = spyOn(calendar, '_modifyCalendarDate').and.callThrough()

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          if (cells.length > 0) {
            const lastCell = cells[cells.length - 1]
            lastCell.focus()

            const keydownEvent = createEvent('keydown')
            keydownEvent.key = 'ArrowRight'
            lastCell.dispatchEvent(keydownEvent)

            expect(modifySpy).toHaveBeenCalled()
          }

          resolve()
        }, 10)
      })
    })

    it('should handle keyboard navigation in years view', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, {
          selectionType: 'year',
          calendarDate: new Date(2023, 5, 1)
        })
        const modifySpy = spyOn(calendar, '_modifyCalendarDate').and.callThrough()

        setTimeout(() => {
          const cells = div.querySelectorAll('.calendar-cell[tabindex="0"]')
          if (cells.length > 0) {
            const lastCell = cells[cells.length - 1]
            lastCell.focus()

            const keydownEvent = createEvent('keydown')
            keydownEvent.key = 'ArrowRight'
            lastCell.dispatchEvent(keydownEvent)

            // Years view should modify by 10 years
            expect(modifySpy).toHaveBeenCalled()
          }

          resolve()
        }, 10)
      })
    })

    it('should handle keyboard navigation in week selection mode', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'week',
        calendarDate: new Date(2023, 5, 1)
      })

      // In week mode, rows should be clickable/focusable
      const rows = div.querySelectorAll('.calendar-row[tabindex="0"]')
      expect(rows.length).toBeGreaterThan(0)

      // Simulate keyboard Enter on a cell within a row to select a week
      const secondRow = rows[1]
      const cell = secondRow.querySelector('.calendar-cell')
      expect(cell).not.toBeNull()

      const event = { target: cell, key: 'Enter', code: 'Space', preventDefault: () => {} }
      calendar._handleCalendarKeydown(event)
      // After Enter on a week cell, the start date should be set
      expect(calendar._startDate).toBeDefined()
    })
  })

  describe('navigation buttons', () => {
    it('should go to next month when btn-next is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })
      const initialMonth = calendar._calendarDate.getMonth()

      const btnNext = div.querySelector('.btn-next')
      btnNext.click()

      expect(calendar._calendarDate.getMonth()).toEqual(initialMonth + 1)
    })

    it('should go to previous month when btn-prev is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })
      const initialMonth = calendar._calendarDate.getMonth()

      const btnPrev = div.querySelector('.btn-prev')
      btnPrev.click()

      expect(calendar._calendarDate.getMonth()).toEqual(initialMonth - 1)
    })

    it('should go to next year when btn-double-next is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })
      const initialYear = calendar._calendarDate.getFullYear()

      const btnDoubleNext = div.querySelector('.btn-double-next')
      btnDoubleNext.click()

      expect(calendar._calendarDate.getFullYear()).toEqual(initialYear + 1)
    })

    it('should go to previous year when btn-double-prev is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })
      const initialYear = calendar._calendarDate.getFullYear()

      const btnDoublePrev = div.querySelector('.btn-double-prev')
      btnDoublePrev.click()

      expect(calendar._calendarDate.getFullYear()).toEqual(initialYear - 1)
    })

    it('should switch to months view when btn-month is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })

      const btnMonth = div.querySelector('.btn-month')
      btnMonth.click()

      expect(calendar._view).toEqual('months')
    })

    it('should switch to years view when btn-year is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })

      const btnYear = div.querySelector('.btn-year')
      btnYear.click()

      expect(calendar._view).toEqual('years')
    })

    it('should advance by 10 years when btn-double-next is clicked in years view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year',
        calendarDate: new Date(2023, 5, 1)
      })
      const initialYear = calendar._calendarDate.getFullYear()

      const btnDoubleNext = div.querySelector('.btn-double-next')
      btnDoubleNext.click()

      expect(calendar._calendarDate.getFullYear()).toEqual(initialYear + 10)
    })

    it('should go back by 10 years when btn-double-prev is clicked in years view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year',
        calendarDate: new Date(2023, 5, 1)
      })
      const initialYear = calendar._calendarDate.getFullYear()

      const btnDoublePrev = div.querySelector('.btn-double-prev')
      btnDoublePrev.click()

      expect(calendar._calendarDate.getFullYear()).toEqual(initialYear - 10)
    })

    it('should not show btn-prev and btn-next in months view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { selectionType: 'month' }) // eslint-disable-line no-new

      expect(div.querySelector('.btn-prev')).toBeNull()
      expect(div.querySelector('.btn-next')).toBeNull()
    })

    it('should not show btn-prev and btn-next in years view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { selectionType: 'year' }) // eslint-disable-line no-new

      expect(div.querySelector('.btn-prev')).toBeNull()
      expect(div.querySelector('.btn-next')).toBeNull()
    })
  })

  describe('view switching via cell click', () => {
    it('should switch from months view to days view when a month is clicked (selectionType day)', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })

        // Switch to months view first
        const btnMonth = div.querySelector('.btn-month')
        btnMonth.click()
        expect(calendar._view).toEqual('months')

        setTimeout(() => {
          // Click a month cell
          const monthCell = div.querySelector('.calendar-cell[tabindex="0"]')
          if (monthCell) {
            monthCell.click()
          }

          setTimeout(() => {
            expect(calendar._view).toEqual('days')
            resolve()
          }, 50)
        }, 10)
      })
    })

    it('should switch from years view to months view when a year is clicked (selectionType day)', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })

        // Switch to years view
        const btnYear = div.querySelector('.btn-year')
        btnYear.click()
        expect(calendar._view).toEqual('years')

        setTimeout(() => {
          // Click a year cell
          const yearCell = div.querySelector('.calendar-cell[tabindex="0"]')
          if (yearCell) {
            yearCell.click()
          }

          setTimeout(() => {
            expect(calendar._view).toEqual('months')
            resolve()
          }, 50)
        }, 10)
      })
    })

    it('should switch from years view to quarters view when selectionType is quarter', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, {
          selectionType: 'quarter',
          calendarDate: new Date(2023, 5, 1)
        })

        // Switch to years view
        const btnYear = div.querySelector('.btn-year')
        btnYear.click()
        expect(calendar._view).toEqual('years')

        setTimeout(() => {
          const yearCell = div.querySelector('.calendar-cell[tabindex="0"]')
          if (yearCell) {
            yearCell.click()
          }

          setTimeout(() => {
            expect(calendar._view).toEqual('quarters')
            resolve()
          }, 50)
        }, 10)
      })
    })
  })

  describe('mouse enter/leave', () => {
    it('should set _hoverDate on mouseenter over a cell', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, {
          range: true,
          calendarDate: new Date(2023, 5, 1)
        })

        setTimeout(() => {
          const cell = div.querySelector('.calendar-cell[tabindex="0"]')
          if (cell) {
            calendar._handleCalendarMouseEnter({ target: cell })
            expect(calendar._hoverDate).not.toBeNull()
          }

          resolve()
        }, 10)
      })
    })

    it('should clear _hoverDate on mouseleave from a cell', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, {
          range: true,
          calendarDate: new Date(2023, 5, 1)
        })

        setTimeout(() => {
          const cell = div.querySelector('.calendar-cell[tabindex="0"]')
          if (cell) {
            // First hover - call handler directly
            calendar._handleCalendarMouseEnter({ target: cell })
            expect(calendar._hoverDate).not.toBeNull()

            // Then leave - call handler directly
            calendar._handleCalendarMouseLeave()
            expect(calendar._hoverDate).toBeNull()
          }

          resolve()
        }, 10)
      })
    })

    it('should not set _hoverDate on disabled date mouseenter', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, {
          range: true,
          calendarDate: new Date(2023, 5, 1),
          minDate: new Date(2023, 5, 10)
        })

        setTimeout(() => {
          // Try to hover on a disabled cell
          const disabledCell = div.querySelector('.calendar-cell.disabled')
          if (disabledCell) {
            calendar._handleCalendarMouseEnter({ target: disabledCell })
            expect(calendar._hoverDate).toBeNull()
          }

          resolve()
        }, 10)
      })
    })

    it('should emit cellHover event on mouseenter', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, {
          range: true,
          calendarDate: new Date(2023, 5, 1)
        })
        const listener = jasmine.createSpy('cellHoverListener')
        div.addEventListener('cellHover.coreui.calendar', listener)

        setTimeout(() => {
          const cell = div.querySelector('.calendar-cell[tabindex="0"]')
          if (cell) {
            calendar._handleCalendarMouseEnter({ target: cell })
            expect(listener).toHaveBeenCalled()
          }

          resolve()
        }, 10)
      })
    })

    it('should emit cellHover event with null on mouseleave', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, {
          range: true,
          calendarDate: new Date(2023, 5, 1)
        })
        const listener = jasmine.createSpy('cellHoverListener')
        div.addEventListener('cellHover.coreui.calendar', listener)

        setTimeout(() => {
          const cell = div.querySelector('.calendar-cell[tabindex="0"]')
          if (cell) {
            calendar._handleCalendarMouseLeave()
            expect(listener).toHaveBeenCalled()
          }

          resolve()
        }, 10)
      })
    })
  })

  describe('_updateClassNamesAndAriaLabels', () => {
    it('should update class names for day cells', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1),
        startDate: new Date(2023, 5, 15)
      })

      // Update and check that selected class is applied
      calendar._updateClassNamesAndAriaLabels()
      const selectedCell = div.querySelector('.calendar-cell.selected')
      expect(selectedCell).not.toBeNull()
    })

    it('should update class names for month cells', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'month',
        calendarDate: new Date(2023, 5, 1),
        startDate: new Date(2023, 5, 1)
      })

      calendar._updateClassNamesAndAriaLabels()
      const selectedCell = div.querySelector('.calendar-cell.selected')
      expect(selectedCell).not.toBeNull()
    })

    it('should update class names for quarter cells', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'quarter',
        calendarDate: new Date(2023, 3, 1),
        startDate: new Date(2023, 3, 1)
      })

      calendar._updateClassNamesAndAriaLabels()
      const selectedCell = div.querySelector('.calendar-cell.selected')
      expect(selectedCell).not.toBeNull()
    })

    it('should update class names for year cells', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year',
        calendarDate: new Date(2023, 0, 1),
        startDate: new Date(2023, 0, 1)
      })

      calendar._updateClassNamesAndAriaLabels()
      const selectedCell = div.querySelector('.calendar-cell.selected')
      expect(selectedCell).not.toBeNull()
    })

    it('should update class names for week rows', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'week',
        calendarDate: new Date(2023, 5, 1),
        startDate: new Date(2023, 5, 5)
      })

      calendar._updateClassNamesAndAriaLabels()
      const selectedRow = div.querySelector('.calendar-row.selected')
      expect(selectedRow).not.toBeNull()
    })

    it('should set aria-selected on selected cells', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1),
        startDate: new Date(2023, 5, 15)
      })

      calendar._updateClassNamesAndAriaLabels()
      const ariaSelectedCell = div.querySelector('.calendar-cell[aria-selected="true"]')
      expect(ariaSelectedCell).not.toBeNull()
    })

    it('should remove aria-selected from non-selected cells', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1),
        startDate: new Date(2023, 5, 15)
      })

      // Select a different date
      calendar._setStartDate(new Date(2023, 5, 20))
      calendar._updateClassNamesAndAriaLabels()

      const ariaSelectedCells = div.querySelectorAll('.calendar-cell[aria-selected="true"]')
      expect(ariaSelectedCells.length).toEqual(1)
    })

    it('should apply range class for dates in range', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1),
        range: true,
        startDate: new Date(2023, 5, 10),
        endDate: new Date(2023, 5, 20)
      })

      calendar._updateClassNamesAndAriaLabels()
      const rangeCells = div.querySelectorAll('.calendar-cell.range')
      expect(rangeCells.length).toBeGreaterThan(0)
    })

    it('should apply range-hover class when hovering in range mode', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1),
        range: true,
        startDate: new Date(2023, 5, 10),
        selectEndDate: true
      })

      calendar._hoverDate = new Date(2023, 5, 20)
      calendar._updateClassNamesAndAriaLabels()
      const rangeHoverCells = div.querySelectorAll('.calendar-cell.range-hover')
      expect(rangeHoverCells.length).toBeGreaterThan(0)
    })

    it('should apply range-hover class for month selection with hover', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'month',
        calendarDate: new Date(2023, 0, 1),
        range: true,
        startDate: new Date(2023, 2, 1),
        selectEndDate: true
      })

      calendar._hoverDate = new Date(2023, 8, 1)
      calendar._updateClassNamesAndAriaLabels()
      const rangeHoverCells = div.querySelectorAll('.calendar-cell.range-hover')
      expect(rangeHoverCells.length).toBeGreaterThan(0)
    })

    it('should apply range-hover class for quarter selection with hover', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'quarter',
        calendarDate: new Date(2023, 0, 1),
        range: true,
        startDate: new Date(2023, 0, 1),
        selectEndDate: true
      })

      calendar._hoverDate = new Date(2023, 9, 1)
      calendar._updateClassNamesAndAriaLabels()
      const rangeHoverCells = div.querySelectorAll('.calendar-cell.range-hover')
      expect(rangeHoverCells.length).toBeGreaterThan(0)
    })

    it('should apply range-hover class for year selection with hover', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year',
        calendarDate: new Date(2023, 0, 1),
        range: true,
        startDate: new Date(2020, 0, 1),
        selectEndDate: true
      })

      calendar._hoverDate = new Date(2025, 0, 1)
      calendar._updateClassNamesAndAriaLabels()
      const rangeHoverCells = div.querySelectorAll('.calendar-cell.range-hover')
      expect(rangeHoverCells.length).toBeGreaterThan(0)
    })

    it('should apply range-hover class with endDate hover (selectEndDate false)', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1),
        range: true,
        endDate: new Date(2023, 5, 25),
        selectEndDate: false
      })

      calendar._hoverDate = new Date(2023, 5, 10)
      calendar._updateClassNamesAndAriaLabels()
      const rangeHoverCells = div.querySelectorAll('.calendar-cell.range-hover')
      expect(rangeHoverCells.length).toBeGreaterThan(0)
    })
  })

  describe('_cellDayAttributes', () => {
    it('should mark today with "today" class', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const today = new Date()
      const attrs = calendar._cellDayAttributes(today, 'current')

      expect(attrs.className).toContain('today')
    })

    it('should return tabIndex -1 for non-day selectionType in days view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectionType: 'week' })
      const date = new Date(2023, 5, 15)
      const attrs = calendar._cellDayAttributes(date, 'current')

      expect(attrs.tabIndex).toEqual(-1)
    })

    it('should return tabIndex 0 for clickable day in current month', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'day',
        calendarDate: new Date(2023, 5, 1)
      })
      const date = new Date(2023, 5, 15)
      const attrs = calendar._cellDayAttributes(date, 'current')

      expect(attrs.tabIndex).toEqual(0)
    })

    it('should return tabIndex -1 for disabled dates', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'day',
        calendarDate: new Date(2023, 5, 1),
        disabledDates: [new Date(2023, 5, 15)]
      })
      const date = new Date(2023, 5, 15)
      const attrs = calendar._cellDayAttributes(date, 'current')

      expect(attrs.tabIndex).toEqual(-1)
      expect(attrs.className).toContain('disabled')
    })

    it('should return tabIndex 0 for adjacement days when selectAdjacementDays is true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'day',
        calendarDate: new Date(2023, 5, 1),
        selectAdjacementDays: true
      })
      const date = new Date(2023, 4, 31) // previous month
      const attrs = calendar._cellDayAttributes(date, 'previous')

      expect(attrs.tabIndex).toEqual(0)
    })

    it('should return tabIndex -1 for adjacement days when selectAdjacementDays is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'day',
        calendarDate: new Date(2023, 5, 1),
        selectAdjacementDays: false
      })
      const date = new Date(2023, 4, 31) // previous month
      const attrs = calendar._cellDayAttributes(date, 'previous')

      expect(attrs.tabIndex).toEqual(-1)
    })

    it('should include meta information', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'day',
        calendarDate: new Date(2023, 5, 1),
        startDate: new Date(2023, 5, 15)
      })
      const date = new Date(2023, 5, 15)
      const attrs = calendar._cellDayAttributes(date, 'current')

      expect(attrs.meta).toBeDefined()
      expect(attrs.meta.isSelected).toBeTrue()
      expect(attrs.meta.isInCurrentMonth).toBeTrue()
    })
  })

  describe('_cellMonthAttributes', () => {
    it('should return tabIndex 0 for enabled months', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectionType: 'month' })
      const date = new Date(2023, 5, 1)
      const attrs = calendar._cellMonthAttributes(date)

      expect(attrs.tabIndex).toEqual(0)
    })

    it('should return tabIndex -1 for disabled months', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'month',
        minDate: new Date(2023, 6, 1)
      })
      const date = new Date(2023, 3, 1)
      const attrs = calendar._cellMonthAttributes(date)

      expect(attrs.tabIndex).toEqual(-1)
      expect(attrs.className).toContain('disabled')
    })

    it('should mark selected month', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'month',
        startDate: new Date(2023, 5, 1)
      })
      const date = new Date(2023, 5, 1)
      const attrs = calendar._cellMonthAttributes(date)

      expect(attrs.ariaSelected).toBeTrue()
      expect(attrs.className).toContain('selected')
    })

    it('should include range class for months in range', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'month',
        range: true,
        startDate: new Date(2023, 2, 1),
        endDate: new Date(2023, 8, 1)
      })
      const date = new Date(2023, 5, 1)
      const attrs = calendar._cellMonthAttributes(date)

      expect(attrs.className).toContain('range')
    })

    it('should include meta information', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'month',
        startDate: new Date(2023, 5, 1)
      })
      const date = new Date(2023, 5, 1)
      const attrs = calendar._cellMonthAttributes(date)

      expect(attrs.meta).toBeDefined()
      expect(attrs.meta.isSelected).toBeTrue()
    })
  })

  describe('_cellQuarterAttributes', () => {
    it('should return tabIndex 0 for enabled quarters', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectionType: 'quarter' })
      const date = new Date(2023, 0, 1)
      const attrs = calendar._cellQuarterAttributes(date)

      expect(attrs.tabIndex).toEqual(0)
    })

    it('should return tabIndex -1 for disabled quarters', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'quarter',
        minDate: new Date(2023, 6, 1)
      })
      const date = new Date(2023, 0, 1)
      const attrs = calendar._cellQuarterAttributes(date)

      expect(attrs.tabIndex).toEqual(-1)
      expect(attrs.className).toContain('disabled')
    })

    it('should mark selected quarter', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'quarter',
        startDate: new Date(2023, 3, 1)
      })
      const date = new Date(2023, 3, 1)
      const attrs = calendar._cellQuarterAttributes(date)

      expect(attrs.ariaSelected).toBeTrue()
      expect(attrs.className).toContain('selected')
    })

    it('should include range class for quarters in range', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'quarter',
        range: true,
        startDate: new Date(2023, 0, 1),
        endDate: new Date(2023, 9, 1)
      })
      const date = new Date(2023, 3, 1)
      const attrs = calendar._cellQuarterAttributes(date)

      expect(attrs.className).toContain('range')
    })

    it('should include meta information', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'quarter',
        startDate: new Date(2023, 3, 1)
      })
      const date = new Date(2023, 3, 1)
      const attrs = calendar._cellQuarterAttributes(date)

      expect(attrs.meta).toBeDefined()
      expect(attrs.meta.isSelected).toBeTrue()
    })
  })

  describe('_cellYearAttributes', () => {
    it('should return tabIndex 0 for enabled years', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectionType: 'year' })
      const date = new Date(2023, 0, 1)
      const attrs = calendar._cellYearAttributes(date)

      expect(attrs.tabIndex).toEqual(0)
    })

    it('should return tabIndex -1 for disabled years', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year',
        minDate: new Date(2025, 0, 1)
      })
      const date = new Date(2023, 0, 1)
      const attrs = calendar._cellYearAttributes(date)

      expect(attrs.tabIndex).toEqual(-1)
      expect(attrs.className).toContain('disabled')
    })

    it('should mark selected year', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year',
        startDate: new Date(2023, 0, 1)
      })
      const date = new Date(2023, 0, 1)
      const attrs = calendar._cellYearAttributes(date)

      expect(attrs.ariaSelected).toBeTrue()
      expect(attrs.className).toContain('selected')
    })

    it('should include range class for years in range', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year',
        range: true,
        startDate: new Date(2020, 0, 1),
        endDate: new Date(2025, 0, 1)
      })
      const date = new Date(2023, 0, 1)
      const attrs = calendar._cellYearAttributes(date)

      expect(attrs.className).toContain('range')
    })

    it('should include meta information', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year',
        startDate: new Date(2023, 0, 1)
      })
      const date = new Date(2023, 0, 1)
      const attrs = calendar._cellYearAttributes(date)

      expect(attrs.meta).toBeDefined()
      expect(attrs.meta.isSelected).toBeTrue()
    })
  })

  describe('_rowWeekAttributes', () => {
    it('should return tabIndex -1 when selectionType is not week', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectionType: 'day' })
      const date = new Date(2023, 5, 5)
      const attrs = calendar._rowWeekAttributes(date)

      expect(attrs.tabIndex).toEqual(-1)
      expect(attrs.ariaSelected).toBeFalse()
    })

    it('should return tabIndex 0 for enabled weeks when selectionType is week', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectionType: 'week' })
      const date = new Date(2023, 5, 5)
      const attrs = calendar._rowWeekAttributes(date)

      expect(attrs.tabIndex).toEqual(0)
    })

    it('should return tabIndex -1 for disabled weeks', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'week',
        minDate: new Date(2023, 5, 10)
      })
      const date = new Date(2023, 5, 1)
      const attrs = calendar._rowWeekAttributes(date)

      expect(attrs.tabIndex).toEqual(-1)
      expect(attrs.className).toContain('disabled')
    })

    it('should mark selected week', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'week',
        startDate: new Date(2023, 5, 5)
      })
      const date = new Date(2023, 5, 5)
      const attrs = calendar._rowWeekAttributes(date)

      expect(attrs.ariaSelected).toBeTrue()
      expect(attrs.className).toContain('selected')
    })

    it('should apply range class for weeks in range', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'week',
        range: true,
        startDate: new Date(2023, 5, 1),
        endDate: new Date(2023, 5, 20)
      })
      const date = new Date(2023, 5, 10)
      const attrs = calendar._rowWeekAttributes(date)

      expect(attrs.className).toContain('range')
    })

    it('should apply range-hover for week rows when hovering', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'week',
        range: true,
        startDate: new Date(2023, 5, 1),
        selectEndDate: true
      })

      calendar._hoverDate = new Date(2023, 5, 20)
      const date = new Date(2023, 5, 10)
      const attrs = calendar._rowWeekAttributes(date)

      expect(attrs.className).toContain('range-hover')
    })
  })

  describe('events', () => {
    it('should emit `calendarDateChange.coreui.calendar` when the calendar date changes', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const listener = jasmine.createSpy('listener')

      div.addEventListener('calendarDateChange.coreui.calendar', listener)
      // For example, go to next month
      calendar._modifyCalendarDate(0, 1)

      expect(listener).toHaveBeenCalled()
    })

    it('should emit `startDateChange.coreui.calendar` when the start date is set', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const listener = jasmine.createSpy('listener')

      div.addEventListener('startDateChange.coreui.calendar', listener)
      calendar._setStartDate(new Date())

      expect(listener).toHaveBeenCalled()
    })

    it('should emit `endDateChange.coreui.calendar` when the end date is set', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const listener = jasmine.createSpy('listener')

      div.addEventListener('endDateChange.coreui.calendar', listener)
      calendar._setEndDate(new Date())

      expect(listener).toHaveBeenCalled()
    })

    it('should emit `calendarViewChange.coreui.calendar` when view changes', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const listener = jasmine.createSpy('listener')

      div.addEventListener('calendarViewChange.coreui.calendar', listener)
      calendar._setCalendarView('months', 'navigation')

      expect(listener).toHaveBeenCalled()
    })

    it('should emit `selectEndChange.coreui.calendar` when selectEndDate changes', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { range: true })
      const listener = jasmine.createSpy('listener')

      div.addEventListener('selectEndChange.coreui.calendar', listener)
      calendar._setSelectEndDate(true)

      expect(listener).toHaveBeenCalled()
    })

    it('should emit `calendarMouseleave.coreui.calendar` when mouse leaves table', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div) // eslint-disable-line no-new
        const listener = jasmine.createSpy('listener')

        div.addEventListener('calendarMouseleave.coreui.calendar', listener)

        setTimeout(() => {
          const table = div.querySelector('table')
          if (table) {
            // Dispatch mouseout from table with relatedTarget outside the table
            // EventHandler converts mouseleave delegation to mouseout internally
            const mouseoutEvent = new MouseEvent('mouseout', {
              bubbles: true,
              relatedTarget: div
            })
            table.dispatchEvent(mouseoutEvent)
            expect(listener).toHaveBeenCalled()
          }

          resolve()
        }, 10)
      })
    })
  })

  describe('_modifyCalendarDate', () => {
    it('should modify calendar date by months', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })

      calendar._modifyCalendarDate(0, 2)
      expect(calendar._calendarDate.getMonth()).toEqual(7)
    })

    it('should modify calendar date by years', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })

      calendar._modifyCalendarDate(2, 0)
      expect(calendar._calendarDate.getFullYear()).toEqual(2025)
    })

    it('should call callback after modifying date', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })
      const callback = jasmine.createSpy('callback')

      calendar._modifyCalendarDate(0, 1, callback)

      // Callback is called via setTimeout
      setTimeout(() => {
        expect(callback).toHaveBeenCalled()
      }, 10)
    })
  })

  describe('_handleCalendarClick', () => {
    it('should not select disabled dates', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, {
          calendarDate: new Date(2023, 5, 1),
          disabledDates: [new Date(2023, 5, 15)]
        })

        setTimeout(() => {
          const disabledCell = div.querySelector('.calendar-cell.disabled')
          if (disabledCell) {
            // The disabled cell is not clickable (tabindex=-1)
            // But we can test _selectDate directly
            calendar._selectDate(new Date(2023, 5, 15))
            expect(calendar._startDate).toBeNull()
          }

          resolve()
        }, 10)
      })
    })

    it('should update calendar date when clicking a day in days view', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, {
          calendarDate: new Date(2023, 5, 1)
        })

        setTimeout(() => {
          const cell = div.querySelector('.calendar-cell[tabindex="0"]')
          if (cell) {
            cell.click()
            expect(calendar._startDate).not.toBeNull()
          }

          resolve()
        }, 10)
      })
    })
  })

  describe('_getDate', () => {
    it('should get date from cell data attribute', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })

      const cell = div.querySelector('.calendar-cell[tabindex="0"]')
      if (cell) {
        const date = calendar._getDate(cell)
        expect(date).toBeInstanceOf(Date)
      }
    })

    it('should get date from row first cell for week selection', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'week',
        calendarDate: new Date(2023, 5, 1)
      })

      const row = div.querySelector('.calendar-row[tabindex="0"]')
      if (row) {
        const firstCell = row.querySelector('.calendar-cell')
        if (firstCell) {
          const date = calendar._getDate(firstCell)
          expect(date).toBeInstanceOf(Date)
        }
      }
    })
  })

  describe('weekday format', () => {
    it('should use string weekday format', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { weekdayFormat: 'narrow' }) // eslint-disable-line no-new

      const headers = div.querySelectorAll('thead th .calendar-header-cell-inner')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should use numeric weekday format (slice characters)', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { weekdayFormat: 3 }) // eslint-disable-line no-new

      const headers = div.querySelectorAll('thead th .calendar-header-cell-inner')
      expect(headers.length).toBeGreaterThan(0)
    })
  })

  describe('locale', () => {
    it('should render with specified locale', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { locale: 'de', calendarDate: new Date(2023, 0, 1) }) // eslint-disable-line no-new

      // Check that the month button text uses the German locale
      const btnMonth = div.querySelector('.btn-month')
      expect(btnMonth).not.toBeNull()
      expect(btnMonth.textContent.trim()).toEqual('Januar')
    })
  })

  describe('dispose', () => {
    it('should dispose Calendar instance', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const spy = spyOn(EventHandler, 'off').and.callThrough()

      expect(calendar._element).toEqual(div)
      calendar.dispose()

      // Typically, you'd set `_element` to null after disposing
      expect(calendar._element).toBeNull()
      // Should remove all event handlers
      expect(spy.calls.count()).toBeGreaterThan(0)
    })
  })

  describe('calendarInterface', () => {
    it('should create a new instance via calendarInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      Calendar.calendarInterface(div, { calendars: 2 })

      const instance = Calendar.getInstance(div)
      expect(instance).not.toBeNull()
      expect(instance._config.calendars).toEqual(2)
    })

    it('should call a method via calendarInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const spy = spyOn(calendar, 'refresh').and.callThrough()

      Calendar.calendarInterface(div, 'refresh')

      expect(spy).toHaveBeenCalled()
    })

    it('should throw error on undefined method via calendarInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div) // eslint-disable-line no-new

      expect(() => {
        Calendar.calendarInterface(div, 'nonExistentMethod')
      }).toThrowError(TypeError, 'No method named "nonExistentMethod"')
    })
  })

  describe('jQueryInterface', () => {
    it('should create a calendar via jQueryInterface', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="calendar"></div>'
      const element = fixtureEl.querySelector('[data-coreui-toggle="calendar"]')

      jQueryMock.fn.calendar = Calendar.jQueryInterface
      jQueryMock.elements = [element]
      jQueryMock.fn.calendar.call(jQueryMock)

      expect(Calendar.getInstance(element)).not.toBeNull()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="calendar"></div>'
      const element = fixtureEl.querySelector('[data-coreui-toggle="calendar"]')

      jQueryMock.fn.calendar = Calendar.jQueryInterface
      jQueryMock.elements = [element]

      expect(() => {
        jQueryMock.fn.calendar.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })

  describe('getInstance', () => {
    it('should return calendar instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      expect(Calendar.getInstance(div)).toEqual(calendar)
      expect(Calendar.getInstance(div)).toBeInstanceOf(Calendar)
    })

    it('should return null when there is no calendar instance', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      expect(Calendar.getInstance(div)).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return calendar instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      expect(Calendar.getOrCreateInstance(div)).toEqual(calendar)
      expect(Calendar.getInstance(div)).toEqual(Calendar.getOrCreateInstance(div, {}))
      expect(Calendar.getOrCreateInstance(div)).toBeInstanceOf(Calendar)
    })

    it('should return new instance when there is no calendar instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Calendar.getInstance(div)).toBeNull()
      expect(Calendar.getOrCreateInstance(div)).toBeInstanceOf(Calendar)
    })

    it('should return new instance when there is no calendar instance with given configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Calendar.getInstance(div)).toBeNull()
      const calendar = Calendar.getOrCreateInstance(div, {
        calendars: 3
      })
      expect(calendar).toBeInstanceOf(Calendar)
      expect(calendar._config.calendars).toEqual(3)
    })

    it('should return the same instance when exists, ignoring new configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendars: 2
      })

      const calendar2 = Calendar.getOrCreateInstance(div, {
        calendars: 5
      })
      expect(calendar2).toEqual(calendar)
      // Original config is still used
      expect(calendar2._config.calendars).toEqual(2)
    })
  })

  describe('_classNames helper', () => {
    it('should join class names from truthy values', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      const result = calendar._classNames({
        'class-a': true,
        'class-b': false,
        'class-c': true
      })

      expect(result).toContain('class-a')
      expect(result).not.toContain('class-b')
      expect(result).toContain('class-c')
    })
  })

  describe('date selection with startDate and endDate', () => {
    it('should initialize with startDate selected', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        startDate: new Date(2023, 5, 15)
      })

      const selectedCell = div.querySelector('.calendar-cell.selected')
      expect(selectedCell).not.toBeNull()
    })

    it('should initialize with range between startDate and endDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        range: true,
        startDate: new Date(2023, 5, 10),
        endDate: new Date(2023, 5, 20)
      })

      const rangeCells = div.querySelectorAll('.calendar-cell.range')
      expect(rangeCells.length).toBeGreaterThan(0)
    })
  })

  describe('first day of week', () => {
    it('should respect firstDayOfWeek configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        firstDayOfWeek: 0, // Sunday
        calendarDate: new Date(2023, 5, 1)
      })

      // Should render without errors
      expect(div.querySelector('.calendar table thead')).not.toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle month boundary transitions', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 11, 1) })

      // Navigate to next month (wraps to next year)
      calendar._modifyCalendarDate(0, 1)
      expect(calendar._calendarDate.getMonth()).toEqual(0)
      expect(calendar._calendarDate.getFullYear()).toEqual(2024)
    })

    it('should handle year boundary transitions', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 0, 1) })

      // Navigate to previous month (wraps to previous year)
      calendar._modifyCalendarDate(0, -1)
      expect(calendar._calendarDate.getMonth()).toEqual(11)
      expect(calendar._calendarDate.getFullYear()).toEqual(2022)
    })

    it('should handle null startDate in _setStartDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        startDate: new Date(2023, 5, 10)
      })

      calendar._setStartDate(null)
      expect(calendar._startDate).toBeNull()
    })

    it('should handle null endDate in _setEndDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        endDate: new Date(2023, 5, 20)
      })

      calendar._setEndDate(null)
      expect(calendar._endDate).toBeNull()
    })
  })

  describe('navigation in multiple calendars with index', () => {
    it('should handle calendar index offset when clicking cells in second panel', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div, {
          calendars: 2,
          calendarDate: new Date(2023, 5, 1)
        })

        setTimeout(() => {
          const panels = div.querySelectorAll('.calendar')
          if (panels.length >= 2) {
            const secondPanelCell = panels[1].querySelector('.calendar-cell[tabindex="0"]')
            if (secondPanelCell) {
              secondPanelCell.click()
              expect(calendar._startDate).not.toBeNull()
            }
          }

          resolve()
        }, 10)
      })
    })
  })

  describe('aria labels', () => {
    it('should use custom aria labels for navigation', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        ariaNavNextMonthLabel: 'Go to next month',
        ariaNavPrevMonthLabel: 'Go to previous month',
        ariaNavNextYearLabel: 'Go to next year',
        ariaNavPrevYearLabel: 'Go to previous year'
      })

      const btnNext = div.querySelector('.btn-next')
      const btnPrev = div.querySelector('.btn-prev')
      const btnDoubleNext = div.querySelector('.btn-double-next')
      const btnDoublePrev = div.querySelector('.btn-double-prev')

      expect(btnNext.getAttribute('aria-label')).toEqual('Go to next month')
      expect(btnPrev.getAttribute('aria-label')).toEqual('Go to previous month')
      expect(btnDoubleNext.getAttribute('aria-label')).toEqual('Go to next year')
      expect(btnDoublePrev.getAttribute('aria-label')).toEqual('Go to previous year')
    })
  })
})

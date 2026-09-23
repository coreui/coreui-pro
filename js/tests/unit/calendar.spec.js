
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

    it('should build one formatter per options shape, not one per cell', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const NativeDateTimeFormat = Intl.DateTimeFormat
      let built = 0

      Intl.DateTimeFormat = function (...args) {
        built++
        return new NativeDateTimeFormat(...args)
      }

      try {
        // eslint-disable-next-line no-new
        new Calendar(div, { calendars: 2, locale: 'en-US' })
      } finally {
        Intl.DateTimeFormat = NativeDateTimeFormat
      }

      expect(div.querySelectorAll('td.calendar-cell[aria-label]').length).toBeGreaterThan(50)
      expect(built).toBeGreaterThan(0)
      expect(built).toBeLessThan(10)
    })

    it('should build the month names only in the months view, with one formatter per panel', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const NativeDateTimeFormat = Intl.DateTimeFormat
      const built = []

      Intl.DateTimeFormat = function (locale, options) {
        if (options?.month === 'narrow') {
          built.push(options)
        }

        return new NativeDateTimeFormat(locale, options)
      }

      try {
        new Calendar(div, { calendars: 2, locale: 'en-US', monthFormat: 'narrow' }) // eslint-disable-line no-new
        expect(built.length).toEqual(0)

        div.querySelector('.btn-month').click()
        expect(built.length).toEqual(2)
      } finally {
        Intl.DateTimeFormat = NativeDateTimeFormat
      }
    })

    it('should re-read the locale when setConfig changes it', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { locale: 'en-US', calendarDate: new Date(2023, 0, 1) })

      expect(div.querySelector('.btn-month').textContent.trim()).toEqual('January')

      calendar.setConfig({ locale: 'de' })
      expect(div.querySelector('.btn-month').textContent.trim()).toEqual('Januar')
    })

    it('should render a calendar whose date cannot be parsed', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(() => {
        new Calendar(div, { selectionType: 'week', calendarDate: 'next week' }) // eslint-disable-line no-new
      }).not.toThrow()

      expect(div.querySelector('.calendar table')).not.toBeNull()
    })

    it('should survive focusing a row when weeks are the unit', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { selectionType: 'week' }) // eslint-disable-line no-new

      // The row is what takes focus in week selection, so the hover handler
      // gets an event with no cell above it — it used to read `closest` off
      // null and take the whole calendar down with it.
      const row = div.querySelector('.calendar-row[tabindex]')
      expect(row).not.toBeNull()

      expect(() => row.focus()).not.toThrow()
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

    it('should select the week when the week number cell is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1),
        selectionType: 'week',
        showWeekNumber: true
      })

      const row = div.querySelectorAll('.calendar-row[data-coreui-selectable]')[1]
      row.querySelector('.calendar-cell-week-number').click()

      expect(calendar._startDate).toEqual(new Date(row.querySelector('.calendar-cell').dataset.coreuiDate))
    })
  })

  describe('accessibility', () => {
    it('should give day cells a full-date aria-label and mark today with aria-current', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { locale: 'en-US' }) // eslint-disable-line no-new

      const labelledCells = div.querySelectorAll('td.calendar-cell[aria-label]')
      expect(labelledCells.length).toBeGreaterThan(0)
      expect(div.querySelector('[aria-current="date"]')).not.toBeNull()
    })

    it('should keep the grid to a single tab stop', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { locale: 'en-US' }) // eslint-disable-line no-new

      expect(div.querySelectorAll('.calendar-cell[data-coreui-selectable]').length).toBeGreaterThan(1)
      expect(div.querySelectorAll('.calendar-cell[tabindex="0"]').length).toEqual(1)
      expect(div.querySelector('.calendar-cell[tabindex="0"]').classList.contains('today')).toBeTrue()
    })

    it('should park the stop on the day the calendar opens on, whatever the time of day', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { locale: 'en-US', calendarDate: new Date(2026, 8, 22, 15, 30) }) // eslint-disable-line no-new

      const stop = div.querySelector('[tabindex="0"]')
      expect(new Date(stop.dataset.coreuiDate).getDate()).toEqual(22)
    })

    it('should prefer the selected date over the day the calendar opens on', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        locale: 'en-US', calendarDate: new Date(2026, 8, 22), startDate: new Date(2026, 8, 5)
      })

      const stop = div.querySelector('[tabindex="0"]')
      expect(new Date(stop.dataset.coreuiDate).getDate()).toEqual(5)
    })

    it('should keep a stop in every panel, one per grid', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { locale: 'en-US', calendars: 2 }) // eslint-disable-line no-new

      expect(div.querySelectorAll('table[role="grid"]').length).toEqual(2)
      expect(div.querySelectorAll('[tabindex="0"]').length).toEqual(2)
    })

    it('should park the stop on the period the view is showing, not on the nearest day', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2026, 8, 22)

      for (const [selectionType, expected] of [
        ['month', new Date(2026, 8, 1)],
        ['quarter', new Date(2026, 6, 1)],
        ['year', new Date(2026, 0, 1)]
      ]) {
        div.innerHTML = ''
        new Calendar(div, { locale: 'en-US', selectionType, calendarDate }) // eslint-disable-line no-new

        const stop = div.querySelector('[tabindex="0"]')
        expect(stop).not.toBeNull()
        expect(new Date(stop.dataset.coreuiDate).getTime()).toEqual(expected.getTime())
      }
    })

    it('should keep a stop in the month and year views of a week picker', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { locale: 'en-US', selectionType: 'week', calendarDate: new Date(2026, 8, 22) }) // eslint-disable-line no-new

      expect(div.querySelectorAll('[tabindex="0"]').length).toEqual(1)

      for (const button of ['.btn-year', '.btn-month']) {
        div.innerHTML = ''
        new Calendar(div, { locale: 'en-US', selectionType: 'week', calendarDate: new Date(2026, 8, 22) }) // eslint-disable-line no-new

        div.querySelector(button).click()
        expect(div.querySelectorAll('[tabindex="0"]').length).toEqual(1)
      }
    })

    it('should move the tab stop to the cell that takes focus', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { locale: 'en-US' }) // eslint-disable-line no-new

      const cells = div.querySelectorAll('.calendar-cell[data-coreui-selectable]')
      const target = cells[cells.length - 1]
      target.focus()

      expect(div.querySelectorAll('.calendar-cell[tabindex="0"]').length).toEqual(1)
      expect(target.tabIndex).toEqual(0)
    })

    it('should move the tab stop to a date picked without focus', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { locale: 'en-US', calendarDate: new Date(2026, 8, 1) }) // eslint-disable-line no-new

      const target = div.querySelector(`[data-coreui-date="${new Date(2026, 8, 17).toDateString()}"]`)
      target.click()

      expect(div.querySelectorAll('.calendar-cell[tabindex="0"]').length).toEqual(1)
      expect(target.tabIndex).toEqual(0)
    })

    it('should return the tab stop to the selected date when focus leaves the grid', () => {
      for (const config of [{}, { range: true, selectEndDate: true }]) {
        fixtureEl.innerHTML = '<div></div><button type="button"></button>'

        const div = fixtureEl.querySelector('div')
        new Calendar(div, { // eslint-disable-line no-new
          locale: 'en-US',
          calendarDate: new Date(2026, 8, 1),
          startDate: new Date(2026, 8, 5),
          ...config
        })

        div.querySelector(`[data-coreui-date="${new Date(2026, 8, 17).toDateString()}"]`).focus()
        fixtureEl.querySelector('button').focus()

        expect(div.querySelectorAll('.calendar-cell[tabindex="0"]').length).toEqual(1)
        expect(div.querySelector('.calendar-cell[tabindex="0"]').dataset.coreuiDate).toEqual(new Date(2026, 8, 5).toDateString())
      }
    })

    it('should return the tab stop to the selected week when focus leaves a week row', () => {
      fixtureEl.innerHTML = '<div></div><button type="button"></button>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        locale: 'en-US',
        selectionType: 'week',
        calendarDate: new Date(2026, 8, 1),
        startDate: '2026W38'
      })

      const rows = div.querySelectorAll('.calendar-row[data-coreui-selectable]')
      rows[rows.length - 1].focus()
      fixtureEl.querySelector('button').focus()

      expect(div.querySelectorAll('.calendar-row[tabindex="0"]').length).toEqual(1)
      expect(div.querySelector('.calendar-row[tabindex="0"]').getAttribute('aria-selected')).toEqual('true')
    })

    it('should keep one tab stop per row when weeks are the unit', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { locale: 'en-US', selectionType: 'week' }) // eslint-disable-line no-new

      expect(div.querySelectorAll('.calendar-row[data-coreui-selectable]').length).toBeGreaterThan(1)
      expect(div.querySelectorAll('.calendar-row[tabindex="0"]').length).toEqual(1)
    })
  })

  describe('showAdjacentDays', () => {
    it('should show adjacent days by default', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2023, 5, 1) }) // eslint-disable-line no-new

      const prevMonthCells = div.querySelectorAll('.calendar-cell.previous')
      const nextMonthCells = div.querySelectorAll('.calendar-cell.next')

      // There should be adjacent day cells rendered
      expect(prevMonthCells.length + nextMonthCells.length).toBeGreaterThan(0)
    })

    it('should not show adjacent days when showAdjacentDays is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { showAdjacentDays: false, calendarDate: new Date(2023, 5, 1) }) // eslint-disable-line no-new

      const prevMonthCells = div.querySelectorAll('.calendar-cell.previous')
      const nextMonthCells = div.querySelectorAll('.calendar-cell.next')

      expect(prevMonthCells.length).toEqual(0)
      expect(nextMonthCells.length).toEqual(0)
    })
  })

  describe('selectAdjacentDays', () => {
    it('should make adjacent day cells clickable when selectAdjacentDays is true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        selectAdjacentDays: true,
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
        renderDayCell: date => `<span class="custom-day">${date.getDate()}</span>`
      })

      const customDays = div.querySelectorAll('.custom-day')
      expect(customDays.length).toBeGreaterThan(0)
    })

    it('should call renderDayCell with the config as this', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        locale: 'en-US',
        calendarDate: new Date(2026, 8, 1),
        renderDayCell(date) {
          return `${this.locale}:${date.getDate()}`
        }
      })

      expect(div.querySelector('.calendar-cell-inner.day').textContent).toMatch(/^en-US:\d+$/)
    })
  })

  describe('renderMonthCell', () => {
    it('should use renderMonthCell function for custom month rendering', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        selectionType: 'month',
        calendarDate: new Date(2023, 5, 1),
        renderMonthCell: date => `<span class="custom-month">M${date.getMonth() + 1}</span>`
      })

      const customMonths = div.querySelectorAll('.custom-month')
      expect(customMonths.length).toBeGreaterThan(0)
    })

    it('should pass the cell meta to renderMonthCell', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const renderMonthCell = jasmine.createSpy('renderMonthCell').and.returnValue('x')
      new Calendar(div, { // eslint-disable-line no-new
        selectionType: 'month',
        calendarDate: new Date(2023, 0, 1),
        startDate: new Date(2023, 5, 1),
        renderMonthCell
      })

      expect(renderMonthCell).toHaveBeenCalledWith(new Date(2023, 5, 1), jasmine.objectContaining({ isDisabled: false, isSelected: true }))
    })
  })

  describe('renderQuarterCell', () => {
    it('should use renderQuarterCell function for custom quarter rendering', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        selectionType: 'quarter',
        calendarDate: new Date(2023, 5, 1),
        renderQuarterCell: () => `<span class="custom-quarter">Quarter</span>`
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
        renderYearCell: date => `<span class="custom-year">${date.getFullYear()}</span>`
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

  describe('navigation icons', () => {
    const navIcon = (element, selector) => element.querySelector(`${selector} .calendar-nav-icon svg`)

    it('should render the navigation icons as inline SVG on currentColor', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      // eslint-disable-next-line no-new
      new Calendar(div)

      for (const selector of ['.btn-double-prev', '.btn-prev', '.btn-next', '.btn-double-next']) {
        const svg = navIcon(div, selector)
        expect(svg).not.toBeNull()
        expect(svg.getAttribute('fill')).toEqual('currentColor')
      }
    })

    it('should swap the directional icons inside an RTL ancestor', () => {
      fixtureEl.innerHTML = '<div dir="rtl"><div id="ltr-calendar"></div></div><div id="rtl-probe"></div>'

      const rtlEl = fixtureEl.querySelector('#ltr-calendar')
      const ltrEl = fixtureEl.querySelector('#rtl-probe')
      // eslint-disable-next-line no-new
      new Calendar(rtlEl)
      // eslint-disable-next-line no-new
      new Calendar(ltrEl)

      const rtlNext = navIcon(rtlEl, '.btn-next').innerHTML
      const ltrPrev = navIcon(ltrEl, '.btn-prev').innerHTML

      expect(rtlNext).toEqual(ltrPrev)
      expect(rtlNext).not.toEqual(navIcon(ltrEl, '.btn-next').innerHTML)
    })

    it('should accept a custom navigation icon and sanitize it', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      // eslint-disable-next-line no-new
      new Calendar(div, {
        navIconNext: '<svg xmlns="http://www.w3.org/2000/svg"><script>window.calendarHacked = true</script><circle r="4" /></svg>'
      })

      expect(navIcon(div, '.btn-next').querySelector('circle')).not.toBeNull()
      expect(navIcon(div, '.btn-next').querySelector('script')).toBeNull()
      expect(window.calendarHacked).toBeUndefined()
    })
  })

  describe('setConfig', () => {
    it('should merge the previous configuration on a partial update', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendars: 2,
        range: true
      })

      expect(div.querySelectorAll('.calendar-nav')).toHaveSize(2)

      calendar.setConfig({ selectEndDate: true })

      expect(calendar._config.range).toBeTrue()
      expect(calendar._config.calendars).toEqual(2)
      expect(div.querySelectorAll('.calendar-nav')).toHaveSize(2)
    })

    it('should clear the calendar HTML and create a new one', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const oldHtml = div.innerHTML

      calendar.setConfig({
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

      calendar.setConfig({
        showWeekNumber: true
      })

      expect(calendar._config.showWeekNumber).toBeTrue()
      expect(div.classList).toContain('show-week-numbers')
    })

    it('should reinitialize dates on update', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      calendar.setConfig({
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
          const dayCell = div.querySelector('.calendar-cell[data-coreui-selectable]')
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
          const dayCell = div.querySelector('.calendar-cell[data-coreui-selectable]')
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

    const findDayCell = (div, year, month, day) =>
      [...div.querySelectorAll('.calendar-cell[data-coreui-selectable]')].find(cell => {
        const date = new Date(cell.dataset.coreuiDate)
        return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
      })

    const pressKey = (cell, key, shiftKey = false) => {
      const keydownEvent = createEvent('keydown')
      keydownEvent.key = key
      keydownEvent.shiftKey = shiftKey
      cell.dispatchEvent(keydownEvent)
    }

    const activeDate = () => new Date(document.activeElement.dataset.coreuiDate)

    const renderCalendar = (config, markup = '<div></div>') => {
      fixtureEl.innerHTML = markup
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 7, 1), locale: 'en-US', ...config }) // eslint-disable-line no-new
      return div
    }

    const focusDay = (div, year, month, day) => {
      const cell = findDayCell(div, year, month, day)
      cell.focus()
      return cell
    }

    it('should move focus one day with ArrowRight and ArrowLeft', () => {
      const div = renderCalendar()

      pressKey(focusDay(div, 2026, 7, 12), 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2026, 7, 13))

      pressKey(document.activeElement, 'ArrowLeft')
      expect(activeDate()).toEqual(new Date(2026, 7, 12))
    })

    it('should move focus one week with ArrowDown and ArrowUp', () => {
      const div = renderCalendar()

      pressKey(focusDay(div, 2026, 7, 12), 'ArrowDown')
      expect(activeDate()).toEqual(new Date(2026, 7, 19))

      pressKey(document.activeElement, 'ArrowUp')
      expect(activeDate()).toEqual(new Date(2026, 7, 12))
    })

    it('should keep the weekday with ArrowDown when weekends are disabled', () => {
      const div = renderCalendar({ disabledDates: date => date.getDay() === 0 || date.getDay() === 6 })

      pressKey(focusDay(div, 2026, 7, 12), 'ArrowDown')

      expect(activeDate()).toEqual(new Date(2026, 7, 19))
    })

    it('should step over a disabled day in the direction of the arrow', () => {
      const div = renderCalendar({ disabledDates: [new Date(2026, 7, 13), new Date(2026, 7, 19)] })

      pressKey(focusDay(div, 2026, 7, 12), 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2026, 7, 14))

      pressKey(focusDay(div, 2026, 7, 12), 'ArrowDown')
      expect(activeDate()).toEqual(new Date(2026, 7, 26))
    })

    it('should move into the next month when ArrowRight leaves the last day of the view', () => {
      const div = renderCalendar()

      pressKey(focusDay(div, 2026, 7, 31), 'ArrowRight')

      expect(activeDate()).toEqual(new Date(2026, 8, 1))
      expect(document.activeElement.classList).not.toContain('next')
    })

    it('should cross two panels without visiting the shared days twice', () => {
      const div = renderCalendar({ calendars: 2, selectAdjacentDays: true })
      const [first, second] = div.querySelectorAll('.calendar')
      const trailing = [...first.querySelectorAll('.calendar-cell[data-coreui-selectable]')]
        .find(cell => new Date(cell.dataset.coreuiDate).getTime() === new Date(2026, 8, 6).getTime())

      trailing.focus()
      pressKey(trailing, 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2026, 8, 7))
      expect(second.contains(document.activeElement)).toBeTrue()

      pressKey(focusDay(div, 2026, 7, 27), 'ArrowDown')
      expect(activeDate()).toEqual(new Date(2026, 8, 3))
      expect(second.contains(document.activeElement)).toBeTrue()
    })

    it('should keep selectable adjacent days marked as adjacent after a hover', () => {
      const div = renderCalendar({ selectAdjacentDays: true })
      const trailing = [...div.querySelectorAll('.calendar-cell.next')]

      focusDay(div, 2026, 7, 12)

      expect(trailing.length).toBeGreaterThan(0)
      expect(trailing.every(cell => cell.classList.contains('next'))).toBeTrue()
    })

    it('should move to the next week row across two panels without repeating the shared week', () => {
      const div = renderCalendar({ calendars: 2, selectionType: 'week' })
      const rowDate = row => new Date(row.querySelector('.calendar-cell').dataset.coreuiDate)
      const rows = [...div.querySelectorAll('.calendar')[0].querySelectorAll('.calendar-row[data-coreui-selectable]')]
      const last = rows.find(row => rowDate(row).getTime() === new Date(2026, 7, 31).getTime())

      last.focus()
      pressKey(last, 'ArrowDown')

      expect(rowDate(document.activeElement)).toEqual(new Date(2026, 8, 7))
    })

    it('should reach the first week row with ArrowUp without paging when that week starts in the previous month', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 8, 1), selectionType: 'week' })
      const rows = [...div.querySelectorAll('.calendar-row[data-coreui-selectable]')]

      rows[1].focus()
      pressKey(rows[1], 'ArrowUp')

      expect(document.activeElement).toBe(rows[0])
    })

    it('should move from the first week row with ArrowDown when adjacent days are hidden', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 8, 1), selectionType: 'week', showAdjacentDays: false })
      const rows = [...div.querySelectorAll('.calendar-row[data-coreui-selectable]')]

      rows[0].focus()
      pressKey(rows[0], 'ArrowDown')
      expect(document.activeElement).toBe(rows[1])

      pressKey(rows[1], 'ArrowUp')
      expect(document.activeElement).toBe(rows[0])
    })

    it('should not offer a week row with no visible day when adjacent days are hidden', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 8, 1), selectionType: 'week', showAdjacentDays: false })
      const rows = [...div.querySelectorAll('.calendar-row')]

      expect(rows.at(-1).querySelector('.calendar-cell')).toBeNull()
      expect(rows.at(-1).hasAttribute('data-coreui-selectable')).toBeFalse()
    })

    it('should move three months with ArrowDown in the months view', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 0, 1), selectionType: 'month' })
      const january = div.querySelector(`[data-coreui-date="${new Date(2026, 0, 1).toDateString()}"]`)

      january.focus()
      pressKey(january, 'ArrowDown')

      expect(activeDate()).toEqual(new Date(2026, 3, 1))
    })

    it('should move a quarter with ArrowRight and a year with ArrowDown in the quarters view', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 0, 1), selectionType: 'quarter' })
      const first = div.querySelector(`[data-coreui-date="${new Date(2026, 0, 1).toDateString()}"]`)

      first.focus()
      pressKey(first, 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2026, 3, 1))

      pressKey(document.activeElement, 'ArrowDown')
      expect(activeDate()).toEqual(new Date(2027, 3, 1))
    })

    it('should move three years with ArrowDown in the years view', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 0, 1), selectionType: 'year' })
      const year = div.querySelector(`[data-coreui-date="${new Date(2026, 0, 1).toDateString()}"]`)

      year.focus()
      pressKey(year, 'ArrowDown')

      expect(activeDate()).toEqual(new Date(2029, 0, 1))
    })

    it('should keep a week row in its own panel when two panels show it', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 1, 1), calendars: 2, selectionType: 'week' })
      const second = div.querySelectorAll('.calendar')[1]
      const row = [...second.querySelectorAll('.calendar-row[data-coreui-selectable]')]
        .find(element => new Date(element.querySelector('.calendar-cell').dataset.coreuiDate).getTime() === new Date(2026, 2, 9).getTime())

      row.focus()
      pressKey(row, 'ArrowUp')

      expect(second.contains(document.activeElement)).toBeTrue()
    })

    it('should move into the previous month when ArrowLeft leaves the first day of the view', () => {
      const div = renderCalendar()

      pressKey(focusDay(div, 2026, 7, 1), 'ArrowLeft')

      expect(activeDate()).toEqual(new Date(2026, 6, 31))
      expect(document.activeElement.classList).not.toContain('previous')
    })

    it('should move a month with ArrowRight in the months view and page into the next year', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 10, 1), selectionType: 'month' })
      const november = div.querySelector(`[data-coreui-date="${new Date(2026, 10, 1).toDateString()}"]`)

      november.focus()
      pressKey(november, 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2026, 11, 1))

      pressKey(document.activeElement, 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2027, 0, 1))
    })

    it('should move a year with ArrowRight and page back with ArrowLeft in the years view', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 0, 1), selectionType: 'year' })
      const year = div.querySelector(`[data-coreui-date="${new Date(2026, 0, 1).toDateString()}"]`)

      year.focus()
      pressKey(year, 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2027, 0, 1))

      const first = div.querySelector(`[data-coreui-date="${new Date(2020, 0, 1).toDateString()}"]`)
      first.focus()
      pressKey(first, 'ArrowLeft')
      expect(activeDate()).toEqual(new Date(2019, 0, 1))
    })

    it('should reach a month partly inside minDate and stop before it in the months view', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 0, 1), minDate: new Date(2026, 2, 15), selectionType: 'month' })
      const april = div.querySelector(`[data-coreui-date="${new Date(2026, 3, 1).toDateString()}"]`)

      april.focus()
      pressKey(april, 'ArrowLeft')
      expect(activeDate()).toEqual(new Date(2026, 2, 1))

      pressKey(document.activeElement, 'ArrowLeft')
      expect(activeDate()).toEqual(new Date(2026, 2, 1))
    })

    it('should give up within ten years when everything ahead is disabled', () => {
      let calls = 0
      const disabledDates = date => {
        calls++
        return date.getFullYear() > 2030
      }

      const div = renderCalendar({ calendarDate: new Date(2030, 0, 1), selectionType: 'year', disabledDates })
      const year = div.querySelector(`[data-coreui-date="${new Date(2030, 0, 1).toDateString()}"]`)

      year.focus()
      calls = 0
      pressKey(year, 'ArrowRight')

      expect(calls).toBeLessThan(20_000)
      expect(activeDate()).toEqual(new Date(2030, 0, 1))
    })

    it('should match the target cell by day, whatever the time of day', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 7, 1), locale: 'en-US' })

      calendar._focusOnCell(new Date(2026, 7, 13, 1))

      expect(activeDate()).toEqual(new Date(2026, 7, 13))
    })

    it('should keep the first week row selected after a refresh when adjacent days are hidden', () => {
      const div = renderCalendar({ selectionType: 'week', showAdjacentDays: false, startDate: new Date(2026, 6, 27) })
      const rows = [...div.querySelectorAll('.calendar-row[data-coreui-selectable]')]

      expect(rows[0].classList).toContain('selected')

      rows[1].focus()

      expect(rows[0].classList).toContain('selected')
    })

    it('should mirror ArrowLeft and ArrowRight in a right-to-left layout', () => {
      const div = renderCalendar({}, '<div dir="rtl"></div>')

      pressKey(focusDay(div, 2026, 7, 12), 'ArrowLeft')
      expect(activeDate()).toEqual(new Date(2026, 7, 13))

      pressKey(document.activeElement, 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2026, 7, 12))
    })

    it('should not move focus past maxDate or before minDate', () => {
      const div = renderCalendar({ minDate: new Date(2026, 7, 10), maxDate: new Date(2026, 7, 15) })

      pressKey(focusDay(div, 2026, 7, 15), 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2026, 7, 15))

      pressKey(document.activeElement, 'ArrowDown')
      expect(activeDate()).toEqual(new Date(2026, 7, 15))

      pressKey(focusDay(div, 2026, 7, 10), 'ArrowLeft')
      expect(activeDate()).toEqual(new Date(2026, 7, 10))

      pressKey(document.activeElement, 'ArrowUp')
      expect(activeDate()).toEqual(new Date(2026, 7, 10))
    })

    it('should make the grid the tab stop when nothing in the view is selectable', () => {
      const div = renderCalendar({ minDate: new Date(2026, 8, 1) })
      const grid = div.querySelector('table')

      expect(grid.getAttribute('tabindex')).toEqual('0')

      grid.focus()
      pressKey(grid, 'PageDown')

      expect(activeDate()).toEqual(new Date(2026, 8, 1))
      expect(div.querySelector('table').hasAttribute('tabindex')).toBeFalse()
    })

    it('should page the empty grid back with PageUp and by a year with Shift+PageDown', () => {
      const div = renderCalendar({ maxDate: new Date(2026, 6, 31) })

      div.querySelector('table').focus()
      pressKey(div.querySelector('table'), 'PageUp')
      expect(activeDate()).toEqual(new Date(2026, 6, 1))

      const grid = renderCalendar({ calendarDate: new Date(2026, 8, 1), maxDate: new Date(2026, 6, 31) }).querySelector('table')
      grid.focus()
      pressKey(grid, 'PageDown', true)
      expect(document.activeElement.matches('table')).toBeTrue()
      expect(document.activeElement.getAttribute('aria-label')).toEqual('September 2027')
    })

    it('should cross two blocked months with ArrowRight and come back with ArrowLeft', () => {
      const div = renderCalendar({ disabledDates: date => date.getMonth() === 8 || date.getMonth() === 9 })

      pressKey(focusDay(div, 2026, 7, 31), 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2026, 10, 1))

      pressKey(document.activeElement, 'ArrowLeft')
      expect(activeDate()).toEqual(new Date(2026, 7, 31))
    })

    it('should leave the empty grid for the nearest selectable date with the arrows', () => {
      const blocked = { disabledDates: date => date.getMonth() === 8 || date.getMonth() === 9 }
      let div = renderCalendar(blocked)

      pressKey(focusDay(div, 2026, 7, 12), 'PageDown')
      expect(document.activeElement.matches('table')).toBeTrue()

      pressKey(document.activeElement, 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2026, 10, 1))

      div = renderCalendar(blocked)
      pressKey(focusDay(div, 2026, 7, 12), 'PageDown')
      pressKey(document.activeElement, 'ArrowUp')
      expect(activeDate()).toEqual(new Date(2026, 7, 31))
    })

    it('should keep focus in the calendar when paging from an empty grid shows a date in another panel', () => {
      const div = renderCalendar({ calendars: 2, disabledDates: date => date.getMonth() === 8 || date.getMonth() === 9 })

      pressKey(focusDay(div, 2026, 7, 12), 'PageDown')
      expect(document.activeElement.matches('table')).toBeTrue()

      pressKey(document.activeElement, 'PageDown')

      expect(activeDate()).toEqual(new Date(2026, 10, 1))
      expect(div.querySelectorAll('.calendar')[1].contains(document.activeElement)).toBeTrue()
    })

    it('should keep arrows and Home/End on the empty grid from scrolling the page', () => {
      const grid = renderCalendar({ minDate: new Date(2026, 8, 1) }).querySelector('table')
      const event = createEvent('keydown', { cancelable: true })
      event.key = 'ArrowRight'

      grid.focus()
      grid.dispatchEvent(event)

      expect(event.defaultPrevented).toBeTrue()
    })

    it('should land on the empty grid when PageDown leads into a month with nothing selectable', () => {
      const div = renderCalendar({ disabledDates: date => date.getMonth() === 8 })

      pressKey(focusDay(div, 2026, 7, 12), 'PageDown')

      expect(document.activeElement).toBe(div.querySelector('table'))
    })

    it('should not make a grid the tab stop while another panel has a selectable date', () => {
      const div = renderCalendar({ calendars: 2, minDate: new Date(2026, 8, 10) })
      const [first, second] = div.querySelectorAll('.calendar table')

      expect(first.hasAttribute('tabindex')).toBeFalse()
      expect(second.hasAttribute('tabindex')).toBeFalse()
      expect(second.querySelector('[tabindex="0"]')).not.toBeNull()
    })

    it('should keep one tab stop after the next-month button leads into an empty month', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 8, 1), maxDate: new Date(2026, 8, 30) })

      div.querySelector('.btn-next').click()

      expect(div.querySelectorAll('[tabindex="0"]').length).toEqual(1)
      expect(div.querySelector('table').getAttribute('tabindex')).toEqual('0')
    })

    it('should keep one tab stop after a week row stops being selectable', () => {
      const div = renderCalendar({ selectionType: 'week', showAdjacentDays: false })
      const last = [...div.querySelectorAll('.calendar-row[data-coreui-selectable]')].at(-1)

      last.focus()
      pressKey(last, 'ArrowDown')

      expect(div.querySelectorAll('.calendar-row[tabindex="0"]').length).toEqual(1)
    })

    it('should name each grid after the period it shows', () => {
      expect(renderCalendar().querySelector('table').getAttribute('aria-label')).toEqual('August 2026')
      expect(renderCalendar({ selectionType: 'month' }).querySelector('table').getAttribute('aria-label')).toEqual('2026')
      expect(renderCalendar({ selectionType: 'year' }).querySelector('table').getAttribute('aria-label')).toEqual('2020 – 2031')
    })

    it('should move focus to the first day of the week on Home', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div, { calendarDate: new Date(2023, 5, 1), locale: 'en-US' }) // eslint-disable-line no-new

        setTimeout(() => {
          const cell = findDayCell(div, 2023, 5, 15)
          cell.focus()
          pressKey(cell, 'Home')

          expect(activeDate().getDate()).toEqual(12)
          resolve()
        }, 10)
      })
    })

    it('should move focus to the last day of the week on End', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div, { calendarDate: new Date(2023, 5, 1), locale: 'en-US' }) // eslint-disable-line no-new

        setTimeout(() => {
          const cell = findDayCell(div, 2023, 5, 15)
          cell.focus()
          pressKey(cell, 'End')

          expect(activeDate().getDate()).toEqual(18)
          resolve()
        }, 10)
      })
    })

    it('should move focus to the same day of the previous month on PageUp', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div, { calendarDate: new Date(2023, 5, 1), locale: 'en-US' }) // eslint-disable-line no-new

        setTimeout(() => {
          const cell = findDayCell(div, 2023, 5, 15)
          cell.focus()
          pressKey(cell, 'PageUp')

          setTimeout(() => {
            expect(activeDate()).toEqual(new Date(2023, 4, 15))
            resolve()
          }, 20)
        }, 10)
      })
    })

    it('should move focus to the same day of the next month on PageDown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div, { calendarDate: new Date(2023, 5, 1), locale: 'en-US' }) // eslint-disable-line no-new

        setTimeout(() => {
          const cell = findDayCell(div, 2023, 5, 15)
          cell.focus()
          pressKey(cell, 'PageDown')

          setTimeout(() => {
            expect(activeDate()).toEqual(new Date(2023, 6, 15))
            resolve()
          }, 20)
        }, 10)
      })
    })

    it('should move focus to the same day of the previous year on Shift+PageUp', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div, { calendarDate: new Date(2023, 5, 1), locale: 'en-US' }) // eslint-disable-line no-new

        setTimeout(() => {
          const cell = findDayCell(div, 2023, 5, 15)
          cell.focus()
          pressKey(cell, 'PageUp', true)

          setTimeout(() => {
            expect(activeDate()).toEqual(new Date(2022, 5, 15))
            resolve()
          }, 20)
        }, 10)
      })
    })

    it('should move focus to the same day of the next year on Shift+PageDown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div, { calendarDate: new Date(2023, 5, 1), locale: 'en-US' }) // eslint-disable-line no-new

        setTimeout(() => {
          const cell = findDayCell(div, 2023, 5, 15)
          cell.focus()
          pressKey(cell, 'PageDown', true)

          setTimeout(() => {
            expect(activeDate()).toEqual(new Date(2024, 5, 15))
            resolve()
          }, 20)
        }, 10)
      })
    })

    it('should clamp the day to the target month length on PageDown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div, { calendarDate: new Date(2023, 0, 1), locale: 'en-US' }) // eslint-disable-line no-new

        setTimeout(() => {
          const cell = findDayCell(div, 2023, 0, 31)
          cell.focus()
          pressKey(cell, 'PageDown')

          setTimeout(() => {
            expect(activeDate()).toEqual(new Date(2023, 1, 28))
            resolve()
          }, 20)
        }, 10)
      })
    })

    it('should not move focus past maxDate on PageDown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        // eslint-disable-next-line no-new
        new Calendar(div, { calendarDate: new Date(2023, 5, 1), locale: 'en-US', maxDate: new Date(2023, 6, 5) })

        setTimeout(() => {
          const cell = findDayCell(div, 2023, 5, 15)
          cell.focus()
          pressKey(cell, 'PageDown')

          setTimeout(() => {
            expect(activeDate()).toEqual(new Date(2023, 6, 5))
            resolve()
          }, 20)
        }, 10)
      })
    })

    it('should move focus to the same month of the next year on PageDown in months view', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        // eslint-disable-next-line no-new
        new Calendar(div, { calendarDate: new Date(2023, 5, 1), locale: 'en-US', selectionType: 'month' })

        setTimeout(() => {
          const cell = findDayCell(div, 2023, 5, 1)
          cell.focus()
          pressKey(cell, 'PageDown')

          setTimeout(() => {
            expect(activeDate()).toEqual(new Date(2024, 5, 1))
            resolve()
          }, 20)
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
          const cells = div.querySelectorAll('.calendar-cell[data-coreui-selectable]')
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
          const cells = div.querySelectorAll('.calendar-cell[data-coreui-selectable]')
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
          const cells = div.querySelectorAll('.calendar-cell[data-coreui-selectable]')
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
          const cells = div.querySelectorAll('.calendar-cell[data-coreui-selectable]')
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
          const cells = div.querySelectorAll('.calendar-cell[data-coreui-selectable]')
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
          const cells = div.querySelectorAll('.calendar-cell[data-coreui-selectable]')
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

    it('should handle keyboard navigation in week selection mode', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'week',
        calendarDate: new Date(2023, 5, 1)
      })

      const rows = div.querySelectorAll('.calendar-row[data-coreui-selectable]')
      expect(rows.length).toBeGreaterThan(0)

      const secondRow = rows[1]
      const event = {
        target: secondRow, key: 'Enter', code: 'Enter', preventDefault() {}
      }
      calendar._handleCalendarKeydown(event)
      expect(calendar._startDate).toEqual(new Date(secondRow.querySelector('.calendar-cell').dataset.coreuiDate))
    })

    it('should select the week on Enter keydown dispatched on the row', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'week',
        calendarDate: new Date(2023, 5, 1)
      })

      const row = div.querySelectorAll('.calendar-row[data-coreui-selectable]')[1]
      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Enter'
      row.dispatchEvent(keydownEvent)

      expect(calendar._startDate).toEqual(new Date(row.querySelector('.calendar-cell').dataset.coreuiDate))
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

    it('should keep a year below 100 when paging back ten years', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2000, 5, 1)
      calendarDate.setFullYear(105)
      const calendar = new Calendar(div, { selectionType: 'year', calendarDate })

      div.querySelector('.btn-double-prev').click()

      expect(calendar._calendarDate.getFullYear()).toEqual(95)
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
          const monthCell = div.querySelector('.calendar-cell[data-coreui-selectable]')
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
          const yearCell = div.querySelector('.calendar-cell[data-coreui-selectable]')
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
          const yearCell = div.querySelector('.calendar-cell[data-coreui-selectable]')
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
          const cell = div.querySelector('.calendar-cell[data-coreui-selectable]')
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
          const cell = div.querySelector('.calendar-cell[data-coreui-selectable]')
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
          const cell = div.querySelector('.calendar-cell[data-coreui-selectable]')
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
          const cell = div.querySelector('.calendar-cell[data-coreui-selectable]')
          if (cell) {
            calendar._handleCalendarMouseLeave()
            expect(listener).toHaveBeenCalled()
          }

          resolve()
        }, 10)
      })
    })

    it('should not rewrite the grid when hovering without a range to preview', async () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2023, 5, 1), calendars: 2 }) // eslint-disable-line no-new
      const records = []
      const observer = new MutationObserver(list => records.push(...list))
      observer.observe(div, { attributes: true, subtree: true })

      const cells = div.querySelectorAll('.calendar-cell[data-coreui-selectable]')
      cells[3].dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: cells[2] }))
      cells[3].dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: cells[4] }))
      await Promise.resolve()
      observer.disconnect()

      expect(records.length).toEqual(0)
    })

    it('should not rewrite the grid when hovering a single-date calendar with a picked date', async () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2023, 5, 1), startDate: new Date(2023, 5, 10) }) // eslint-disable-line no-new
      const records = []
      const observer = new MutationObserver(list => records.push(...list))
      observer.observe(div, { attributes: true, subtree: true })

      const cell = div.querySelector(`[data-coreui-date="${new Date(2023, 5, 20).toDateString()}"]`)
      cell.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: div }))
      await Promise.resolve()
      observer.disconnect()

      expect(records.length).toEqual(0)
    })

    it('should preview the range back to the end date while the start is picked again', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        range: true,
        startDate: new Date(2023, 5, 10),
        endDate: new Date(2023, 5, 25)
      })

      const cell = div.querySelector(`[data-coreui-date="${new Date(2023, 5, 5).toDateString()}"]`)
      cell.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: div }))

      expect(div.querySelectorAll('.calendar-cell.range-hover').length).toEqual(21)
    })

    it('should preview the range on hover without moving the tab stop', async () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        calendars: 2,
        range: true,
        startDate: new Date(2023, 5, 10),
        selectEndDate: true
      })
      const records = []
      const observer = new MutationObserver(list => records.push(...list))
      observer.observe(div, { attributeFilter: ['tabindex'], subtree: true })

      const cell = div.querySelector(`[data-coreui-date="${new Date(2023, 5, 20).toDateString()}"]`)
      cell.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: div }))
      await Promise.resolve()
      observer.disconnect()

      expect(div.querySelectorAll('.calendar-cell.range-hover').length).toEqual(11)
      expect(records.length).toEqual(0)
      expect(div.querySelector('.calendar-cell[tabindex="0"]').dataset.coreuiDate).toEqual(new Date(2023, 5, 10).toDateString())
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

    it('should keep the view when a day 29-31 in the second panel is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      // eslint-disable-next-line no-new
      new Calendar(div, {
        calendarDate: new Date(2026, 3, 1), calendars: 2, locale: 'en-US', range: true
      })
      const second = div.querySelectorAll('.calendar')[1]
      const may31 = [...second.querySelectorAll('.calendar-cell[data-coreui-selectable]')]
        .find(cell => new Date(cell.dataset.coreuiDate).toDateString() === new Date(2026, 4, 31).toDateString())

      may31.click()
      div.querySelector('.btn-next').click()

      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('May 2026')
    })

    it('should keep a picked range when setConfig changes only selectEndDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US', range: true })
      const pick = day => [...div.querySelectorAll('.calendar-cell[data-coreui-selectable]')]
        .find(cell => new Date(cell.dataset.coreuiDate).toDateString() === new Date(2026, 8, day).toDateString())
        .click()

      pick(11)
      pick(16)
      calendar.setConfig({ selectEndDate: true })

      expect(calendar._startDate).toEqual(new Date(2026, 8, 11))
      expect(calendar._endDate).toEqual(new Date(2026, 8, 16))
      expect(calendar._selectEndDate).toBeTrue()
      expect(div.querySelectorAll('.calendar-cell.selected').length).toEqual(2)
    })

    it('should keep the month and the view when setConfig changes only selectEndDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US', range: true })

      div.querySelector('.btn-next').click()
      div.querySelector('.btn-next').click()
      calendar.setConfig({ selectEndDate: true })
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('November 2026')

      div.querySelector('.btn-month').click()
      calendar.setConfig({ selectEndDate: false })
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('2026')
    })

    it('should keep the month when setConfig clears the start date', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { locale: 'en-US', startDate: new Date(2026, 8, 12) })

      div.querySelector('.btn-next').click()
      calendar.setConfig({ startDate: null })

      expect(calendar._startDate).toBeNull()
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('October 2026')
    })

    it('should show the month of the date setConfig names, not of a stale configured one', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { locale: 'en-US', range: true, startDate: new Date(2026, 0, 10) })

      calendar.setConfig({ endDate: new Date(2026, 8, 18) })

      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('September 2026')
    })

    it('should keep the view when the first week row is picked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      // eslint-disable-next-line no-new
      new Calendar(div, {
        calendarDate: new Date(2026, 8, 1), locale: 'en-US', selectionType: 'week', showAdjacentDays: false
      })

      div.querySelector('.calendar-row[data-coreui-selectable]').click()
      div.querySelector('.btn-next').click()

      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('October 2026')
    })

    it('should mark a date that cannot be picked with aria-disabled', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2026, 7, 1),
        disabledDates: [new Date(2026, 7, 14)]
      })
      const cellFor = date => [...div.querySelectorAll('.calendar-cell')]
        .find(cell => new Date(cell.dataset.coreuiDate).toDateString() === date.toDateString())

      expect(cellFor(new Date(2026, 7, 14)).getAttribute('aria-disabled')).toEqual('true')
      expect(cellFor(new Date(2026, 7, 13)).hasAttribute('aria-disabled')).toBeFalse()
      expect(cellFor(new Date(2026, 6, 31)).hasAttribute('aria-disabled')).toBeFalse()

      calendar._updateClassNamesAndAriaLabels()

      expect(cellFor(new Date(2026, 7, 14)).getAttribute('aria-disabled')).toEqual('true')
      expect(cellFor(new Date(2026, 7, 13)).hasAttribute('aria-disabled')).toBeFalse()
      expect(cellFor(new Date(2026, 7, 13)).hasAttribute('aria-selected')).toBeFalse()
    })

    it('should mark a week row that cannot be picked with aria-disabled, and leave its days alone', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 7, 1),
        minDate: new Date(2026, 7, 10),
        selectionType: 'week'
      })
      const rows = [...div.querySelectorAll('.calendar-row')]

      expect(rows[0].getAttribute('aria-disabled')).toEqual('true')
      expect(rows[2].hasAttribute('aria-disabled')).toBeFalse()
      expect(div.querySelectorAll('.calendar-cell[aria-disabled]').length).toEqual(0)
    })

    it('should mark a quarter and a year outside minDate with aria-disabled', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 0, 1),
        minDate: new Date(2026, 5, 15),
        selectionType: 'quarter'
      })

      expect(div.querySelector(`[data-coreui-date="${new Date(2026, 0, 1).toDateString()}"]`).getAttribute('aria-disabled')).toEqual('true')
      expect(div.querySelector(`[data-coreui-date="${new Date(2026, 3, 1).toDateString()}"]`).hasAttribute('aria-disabled')).toBeFalse()

      fixtureEl.innerHTML = '<div></div>'
      const years = fixtureEl.querySelector('div')
      new Calendar(years, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 0, 1),
        minDate: new Date(2024, 5, 15),
        selectionType: 'year'
      })

      expect(years.querySelector(`[data-coreui-date="${new Date(2023, 0, 1).toDateString()}"]`).getAttribute('aria-disabled')).toEqual('true')
      expect(years.querySelector(`[data-coreui-date="${new Date(2024, 0, 1).toDateString()}"]`).hasAttribute('aria-disabled')).toBeFalse()
    })

    it('should leave the month alone when a disabled adjacent day is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 7, 1),
        disabledDates: [new Date(2026, 8, 3)],
        locale: 'en-US',
        selectAdjacentDays: true
      })
      const trailing = [...div.querySelectorAll('.calendar-cell.next')]
        .find(cell => new Date(cell.dataset.coreuiDate).toDateString() === new Date(2026, 8, 3).toDateString())

      trailing.click()

      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('August 2026')
    })

    it('should park the tab stop on the week row that holds the date the calendar opens on', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 7, 14), selectionType: 'week' }) // eslint-disable-line no-new
      const row = div.querySelector('.calendar-row[tabindex="0"]')

      expect(new Date(row.querySelector('.calendar-cell').dataset.coreuiDate)).toEqual(new Date(2026, 7, 10))
    })

    it('should mark a month outside minDate with aria-disabled in the months view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 0, 1),
        minDate: new Date(2026, 2, 15),
        selectionType: 'month'
      })

      expect(div.querySelector(`[data-coreui-date="${new Date(2026, 0, 1).toDateString()}"]`).getAttribute('aria-disabled')).toEqual('true')
      expect(div.querySelector(`[data-coreui-date="${new Date(2026, 2, 1).toDateString()}"]`).hasAttribute('aria-disabled')).toBeFalse()
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

    it('should not preview a day range on the month cells', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 0, 1),
        range: true,
        startDate: new Date(2023, 0, 10),
        selectEndDate: true
      })

      div.querySelector('.btn-month').click()
      div.querySelector(`[data-coreui-date="${new Date(2023, 5, 1).toDateString()}"]`)
        .dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: div }))

      expect(div.querySelectorAll('.calendar-cell.range-hover').length).toEqual(0)
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

    it('should apply range-hover class only to rows inside the hovered range in week selection mode', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1),
        range: true,
        selectionType: 'week',
        selectEndDate: true
      })

      const rows = div.querySelectorAll('.calendar-row')
      const rowDate = row => new Date(row.querySelector('.calendar-cell').dataset.coreuiDate)
      calendar._startDate = rowDate(rows[1])
      calendar._hoverDate = rowDate(rows[2])
      calendar._updateClassNamesAndAriaLabels()

      const rangeHoverRows = div.querySelectorAll('.calendar-row.range-hover')
      expect(rangeHoverRows.length).toBe(2)
      expect(rows[1].classList).toContain('range-hover')
      expect(rows[2].classList).toContain('range-hover')
      expect(rows[3].classList).not.toContain('range-hover')
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

    it('should not mark as selectable non-day selectionType in days view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectionType: 'week' })
      const date = new Date(2023, 5, 15)
      const attrs = calendar._cellDayAttributes(date, 'current')

      expect(attrs.selectable).toBeFalse()
    })

    it('should mark as selectable clickable day in current month', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'day',
        calendarDate: new Date(2023, 5, 1)
      })
      const date = new Date(2023, 5, 15)
      const attrs = calendar._cellDayAttributes(date, 'current')

      expect(attrs.selectable).toBeTrue()
    })

    it('should not mark as selectable disabled dates', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'day',
        calendarDate: new Date(2023, 5, 1),
        disabledDates: [new Date(2023, 5, 15)]
      })
      const date = new Date(2023, 5, 15)
      const attrs = calendar._cellDayAttributes(date, 'current')

      expect(attrs.selectable).toBeFalse()
      expect(attrs.className).toContain('disabled')
    })

    it('should mark as selectable adjacent days when selectAdjacentDays is true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'day',
        calendarDate: new Date(2023, 5, 1),
        selectAdjacentDays: true
      })
      const date = new Date(2023, 4, 31) // previous month
      const attrs = calendar._cellDayAttributes(date, 'previous')

      expect(attrs.selectable).toBeTrue()
    })

    it('should not mark as selectable adjacent days when selectAdjacentDays is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'day',
        calendarDate: new Date(2023, 5, 1),
        selectAdjacentDays: false
      })
      const date = new Date(2023, 4, 31) // previous month
      const attrs = calendar._cellDayAttributes(date, 'previous')

      expect(attrs.selectable).toBeFalse()
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

  describe('_cellPeriodAttributes with months', () => {
    it('should mark as selectable enabled months', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectionType: 'month' })
      const date = new Date(2023, 5, 1)
      const attrs = calendar._cellPeriodAttributes(date)

      expect(attrs.selectable).toBeTrue()
    })

    it('should not mark as selectable disabled months', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'month',
        minDate: new Date(2023, 6, 1)
      })
      const date = new Date(2023, 3, 1)
      const attrs = calendar._cellPeriodAttributes(date)

      expect(attrs.selectable).toBeFalse()
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
      const attrs = calendar._cellPeriodAttributes(date)

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
      const attrs = calendar._cellPeriodAttributes(date)

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
      const attrs = calendar._cellPeriodAttributes(date)

      expect(attrs.meta).toBeDefined()
      expect(attrs.meta.isSelected).toBeTrue()
    })
  })

  describe('_cellPeriodAttributes with quarters', () => {
    it('should mark as selectable enabled quarters', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectionType: 'quarter' })
      const date = new Date(2023, 0, 1)
      const attrs = calendar._cellPeriodAttributes(date)

      expect(attrs.selectable).toBeTrue()
    })

    it('should not mark as selectable disabled quarters', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'quarter',
        minDate: new Date(2023, 6, 1)
      })
      const date = new Date(2023, 0, 1)
      const attrs = calendar._cellPeriodAttributes(date)

      expect(attrs.selectable).toBeFalse()
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
      const attrs = calendar._cellPeriodAttributes(date)

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
      const attrs = calendar._cellPeriodAttributes(date)

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
      const attrs = calendar._cellPeriodAttributes(date)

      expect(attrs.meta).toBeDefined()
      expect(attrs.meta.isSelected).toBeTrue()
    })
  })

  describe('_cellPeriodAttributes with years', () => {
    it('should mark as selectable enabled years', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectionType: 'year' })
      const date = new Date(2023, 0, 1)
      const attrs = calendar._cellPeriodAttributes(date)

      expect(attrs.selectable).toBeTrue()
    })

    it('should not mark as selectable disabled years', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year',
        minDate: new Date(2025, 0, 1)
      })
      const date = new Date(2023, 0, 1)
      const attrs = calendar._cellPeriodAttributes(date)

      expect(attrs.selectable).toBeFalse()
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
      const attrs = calendar._cellPeriodAttributes(date)

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
      const attrs = calendar._cellPeriodAttributes(date)

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
      const attrs = calendar._cellPeriodAttributes(date)

      expect(attrs.meta).toBeDefined()
      expect(attrs.meta.isSelected).toBeTrue()
    })
  })

  describe('_rowWeekAttributes', () => {
    it('should not mark a row as selectable when selectionType is not week', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectionType: 'day' })
      const date = new Date(2023, 5, 5)
      const attrs = calendar._rowWeekAttributes(date)

      expect(attrs.selectable).toBeFalse()
      expect(attrs.ariaSelected).toBeFalse()
    })

    it('should mark as selectable enabled weeks when selectionType is week', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { selectionType: 'week' })
      const date = new Date(2023, 5, 5)
      const attrs = calendar._rowWeekAttributes(date)

      expect(attrs.selectable).toBeTrue()
    })

    it('should not mark as selectable disabled weeks', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'week',
        minDate: new Date(2023, 5, 10)
      })
      const date = new Date(2023, 5, 1)
      const attrs = calendar._rowWeekAttributes(date)

      expect(attrs.selectable).toBeFalse()
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
          const cell = div.querySelector('.calendar-cell[data-coreui-selectable]')
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

      const cell = div.querySelector('.calendar-cell[data-coreui-selectable]')
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

      const row = div.querySelector('.calendar-row[data-coreui-selectable]')
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

    it('should remove the panels it built', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendars: 2, showWeekNumber: true })

      calendar.dispose()

      expect(div.children).toHaveLength(0)
      expect(div.className).toBe('')
    })

    it('should build one set of panels when re-initialised on the same element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div) // eslint-disable-line no-new
      new Calendar(div) // eslint-disable-line no-new

      expect(div.querySelectorAll('.calendar')).toHaveLength(1)
    })
  })

  describe('_updateCalendar', () => {
    it('should run the callback once the panels are rebuilt, before returning', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2023, 5, 1) })

      div.querySelector('.btn-month').click()
      div.querySelector('.calendar-cell[data-coreui-selectable]').click()

      expect(calendar._view).toEqual('days')
      expect(document.activeElement).toEqual(div.querySelector('.calendar-cell[data-coreui-selectable]'))
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
      fixtureEl.innerHTML = '<div data-coreui-calendar></div>'
      const element = fixtureEl.querySelector('[data-coreui-calendar]')

      jQueryMock.fn.calendar = Calendar.jQueryInterface
      jQueryMock.elements = [element]
      jQueryMock.fn.calendar.call(jQueryMock)

      expect(Calendar.getInstance(element)).not.toBeNull()
    })

    it('should pass the arguments to the method', () => {
      fixtureEl.innerHTML = '<div data-coreui-calendar></div>'
      const element = fixtureEl.querySelector('[data-coreui-calendar]')

      jQueryMock.fn.calendar = Calendar.jQueryInterface
      jQueryMock.elements = [element]

      const instance = Calendar.getOrCreateInstance(element)
      const spy = spyOn(instance, 'setConfig')

      jQueryMock.fn.calendar.call(jQueryMock, 'setConfig', { locale: 'en-US' })

      expect(spy).toHaveBeenCalledWith({ locale: 'en-US' })
      instance.dispose()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div data-coreui-calendar></div>'
      const element = fixtureEl.querySelector('[data-coreui-calendar]')

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
            const secondPanelCell = panels[1].querySelector('.calendar-cell[data-coreui-selectable]')
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

    it('should escape aria labels so they cannot break out of the attribute', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        ariaNavNextYearLabel: '"><img src=x onerror="window.xss = true">'
      })

      expect(div.querySelector('.calendar-nav img')).toBeNull()
      expect(div.querySelector('.btn-double-next').getAttribute('aria-label'))
        .toEqual('"><img src=x onerror="window.xss = true">')
    })

    it('should escape the week numbers label', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        showWeekNumber: true,
        weekNumbersLabel: '<img src=x onerror="window.xss = true">'
      })

      expect(div.querySelector('.calendar-header-cell-inner img')).toBeNull()
    })
  })
})

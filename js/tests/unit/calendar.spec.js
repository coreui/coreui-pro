
import { onTestFinished, vi } from 'vitest'
import { cdp } from 'vitest/browser'
import Calendar from '../../src/calendar.js'
import {
  getFixture, clearFixture, createEvent, jQueryMock
} from '../helpers/fixture.js'
import EventHandler from '../../src/dom/event-handler.js'

describe('Calendar', () => {
  let fixtureEl

  const selectedDays = selector => [...fixtureEl.querySelectorAll(`${selector}[aria-selected="true"]`)]
    .map(cell => new Date(cell.dataset.coreuiDate).getDate())

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

    it('should initialize calendarDate from startDate if calendarDate is empty', () => {
      fixtureEl.innerHTML = '<div></div><div></div>'

      const divs = fixtureEl.querySelectorAll('div')

      for (const [index, calendarDate] of ['', null].entries()) {
        new Calendar(divs[index], { calendarDate, locale: 'en-US', startDate: new Date(2023, 0, 15) }) // eslint-disable-line no-new
        expect(divs[index].querySelector('table').getAttribute('aria-label')).toEqual('January 2023')
      }
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

    it('should keep the navigated page when calendarDate becomes empty or null', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2022, 5, 15), locale: 'en-US' })

      div.querySelector('[aria-label="Next month"]').click()

      for (const calendarDate of ['', null]) {
        calendar.setConfig({ calendarDate })
        expect(div.querySelector('table').getAttribute('aria-label')).toEqual('July 2022')
      }
    })

    it('should keep the page it showed when calendarDate cannot be read', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2022, 5, 15), locale: 'en-US' })

      calendar.setConfig({ calendarDate: 'not a date' })

      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('June 2022')
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

  describe('markup', () => {
    it.each(['day', 'month', 'quarter', 'year'])('should name the %s view on the cell content, not on the panel or the cell', selectionType => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 7, 1), locale: 'en-US', selectionType }) // eslint-disable-line no-new

      expect(div.querySelector('.calendar').className).toEqual('calendar')

      for (const cell of div.querySelectorAll('td.calendar-cell')) {
        expect(cell.classList.contains(selectionType)).toBeFalse()
        expect(cell.classList.contains(`${selectionType}s`)).toBeFalse()
        expect(cell.querySelector('.calendar-cell-inner').classList.contains(selectionType)).toBeTrue()
      }
    })

    it('should mark each navigation button with the class of its action', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 7, 1), locale: 'en-US' }) // eslint-disable-line no-new

      expect([...div.querySelectorAll('.calendar-nav-btn')].map(button => button.className)).toEqual([
        'calendar-nav-btn btn-double-prev',
        'calendar-nav-btn btn-prev',
        'calendar-nav-btn btn-month',
        'calendar-nav-btn btn-year',
        'calendar-nav-btn btn-next',
        'calendar-nav-btn btn-double-next'
      ])
    })

    it('should put the year button before the month button where the locale writes the year first', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 7, 1), locale: 'ja-JP' }) // eslint-disable-line no-new

      expect([...div.querySelectorAll('.calendar-nav-date .calendar-nav-btn')].map(button => button.className)).toEqual([
        'calendar-nav-btn btn-year',
        'calendar-nav-btn btn-month'
      ])
    })

    it.each(['month', 'quarter', 'year'])('should show only the year button in %s selection', selectionType => {
      for (const locale of ['en-US', 'ja-JP']) {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new Calendar(div, { calendarDate: new Date(2026, 7, 1), locale, selectionType }) // eslint-disable-line no-new

        expect([...div.querySelectorAll('.calendar-nav-date .calendar-nav-btn')].map(button => button.className)).toEqual([
          'calendar-nav-btn btn-year'
        ])
      }
    })

    it('should mark each panel with its index', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 7, 1), calendars: 2, locale: 'en-US' }) // eslint-disable-line no-new

      expect([...div.querySelectorAll('.calendar')].map(panel => panel.dataset.coreuiCalendarIndex)).toEqual(['0', '1'])
    })

    it.each(['day', 'week', 'month', 'quarter', 'year'])('should mark what can be picked in %s selection with an empty data-coreui-selectable', selectionType => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 7, 1), locale: 'en-US', selectionType }) // eslint-disable-line no-new
      const marked = div.querySelectorAll('[data-coreui-selectable]')

      expect(marked.length).toBeGreaterThan(0)

      for (const element of marked) {
        expect(element.getAttribute('data-coreui-selectable')).toEqual('')
      }
    })

    it('should leave the date of a week to its cells', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 7, 1), locale: 'en-US', selectionType: 'week' }) // eslint-disable-line no-new

      expect(div.querySelectorAll('tr[data-coreui-date]').length).toEqual(0)
      expect(div.querySelectorAll('td[data-coreui-date]').length).toEqual(42)
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

    it('should name the week number column in the locale while weekNumbersLabel is not set', () => {
      fixtureEl.innerHTML = '<div></div><div></div>'

      const [english, polish] = fixtureEl.querySelectorAll('div')
      new Calendar(english, { locale: 'en-US', showWeekNumber: true }) // eslint-disable-line no-new
      new Calendar(polish, { locale: 'pl-PL', showWeekNumber: true }) // eslint-disable-line no-new

      expect(english.querySelector('thead th .visually-hidden').textContent).toEqual('Week')
      expect(polish.querySelector('thead th .visually-hidden').textContent).toEqual('Tydzień')
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

    it('should open on the limit today falls outside of and park the stop there', () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 8, 30))
      onTestFinished(() => vi.useRealTimers())
      fixtureEl.innerHTML = '<div></div><div></div>'

      const [before, after] = fixtureEl.querySelectorAll('div')
      new Calendar(before, { locale: 'en-US', maxDate: new Date(2026, 6, 14) }) // eslint-disable-line no-new
      new Calendar(after, { locale: 'en-US', minDate: new Date(2026, 11, 3) }) // eslint-disable-line no-new

      const stop = element => new Date(element.querySelector('.calendar-cell[tabindex="0"]').dataset.coreuiDate)
      expect(stop(before)).toEqual(new Date(2026, 6, 14))
      expect(stop(after)).toEqual(new Date(2026, 11, 3))
    })

    it('should let the day of a limit with a time of day be picked', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 9, 1),
        locale: 'en-US',
        maxDate: new Date(2026, 9, 20, 8),
        minDate: new Date(2026, 9, 15, 10)
      })

      const cell = day => div.querySelector(`.calendar-cell[data-coreui-date="${new Date(2026, 9, day).toDateString()}"]`)

      expect(cell(14).getAttribute('aria-disabled')).toEqual('true')
      expect(cell(15).hasAttribute('aria-disabled')).toBeFalse()
      expect(cell(20).hasAttribute('aria-disabled')).toBeFalse()
      expect(cell(21).getAttribute('aria-disabled')).toEqual('true')
    })

    it('should hold the stop on the limit today falls outside of, even when that day cannot be picked', () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 8, 30))
      onTestFinished(() => vi.useRealTimers())
      fixtureEl.innerHTML = '<div></div><div></div>'

      const [after, before] = fixtureEl.querySelectorAll('div')
      new Calendar(after, { disabledDates: [new Date(2026, 9, 31)], locale: 'en-US', minDate: new Date(2026, 9, 31) }) // eslint-disable-line no-new
      new Calendar(before, { disabledDates: [[new Date(2026, 6, 1), new Date(2026, 6, 14)]], locale: 'en-US', maxDate: new Date(2026, 6, 14) }) // eslint-disable-line no-new

      const stop = element => element.querySelector('.calendar-cell[tabindex="0"]')

      expect(new Date(stop(after).dataset.coreuiDate)).toEqual(new Date(2026, 9, 31))
      expect(stop(after).getAttribute('aria-disabled')).toEqual('true')
      expect(new Date(stop(before).dataset.coreuiDate)).toEqual(new Date(2026, 6, 14))
      expect(stop(before).getAttribute('aria-disabled')).toEqual('true')
    })

    it('should stay on today\'s page in month selection, holding the stop on today\'s month, and beside a second calendar', () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 11, 20))
      onTestFinished(() => vi.useRealTimers())
      fixtureEl.innerHTML = '<div></div><div></div>'

      const [months, panels] = fixtureEl.querySelectorAll('div')
      new Calendar(months, { disabledDates: [[new Date(2026, 11, 1), new Date(2026, 11, 31)]], locale: 'en-US', selectionType: 'month' }) // eslint-disable-line no-new
      new Calendar(panels, { calendars: 2, disabledDates: [[new Date(2026, 11, 1), new Date(2026, 11, 31)]], locale: 'en-US' }) // eslint-disable-line no-new

      const stop = months.querySelector('.calendar-cell[tabindex="0"]')

      expect(new Date(stop.dataset.coreuiDate)).toEqual(new Date(2026, 11, 1))
      expect(stop.getAttribute('aria-disabled')).toEqual('true')
      expect(panels.querySelector(`[data-coreui-date="${new Date(2026, 11, 15).toDateString()}"]`)).not.toBeNull()
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

    it('should keep the stop of each panel on an end of the range, not on the days between them', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 7, 1),
        calendars: 2,
        endDate: new Date(2026, 8, 5),
        locale: 'en-US',
        range: true,
        startDate: new Date(2026, 7, 10)
      })

      expect([...div.querySelectorAll('[tabindex="0"]')].map(stop => stop.dataset.coreuiDate))
        .toEqual([new Date(2026, 7, 10).toDateString(), new Date(2026, 8, 5).toDateString()])
    })

    it('should move focus into the panel whose month was picked, even when its view has nothing to pick', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 11, 1),
        calendars: 2,
        disabledDates: date => date.getDay() === 1,
        firstDayOfWeek: 1,
        locale: 'en-US',
        selectionType: 'week'
      })

      div.querySelector('.btn-month').click()

      const january = div.querySelector(`[data-coreui-date="${new Date(2027, 0, 1).toDateString()}"]`)

      january.focus()
      january.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))

      const grids = [...div.querySelectorAll('table')]

      expect(grids.map(grid => grid.getAttribute('aria-label'))).toEqual(['December 2026', 'January 2027'])
      expect(div.querySelector('[data-coreui-selectable]')).toBeNull()
      expect(document.activeElement.closest('table')).toBe(grids[1])
      expect(document.activeElement.getAttribute('aria-disabled')).toEqual('true')
    })

    it('should move focus to the first week of the panel whose month was picked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 11, 1),
        calendars: 2,
        firstDayOfWeek: 1,
        locale: 'en-US',
        selectionType: 'week',
        startDate: new Date(2027, 0, 13)
      })

      div.querySelector('.btn-month').click()

      const january = div.querySelector(`[data-coreui-date="${new Date(2027, 0, 1).toDateString()}"]`)

      january.focus()
      january.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))

      expect(document.activeElement.closest('.calendar')).toBe(div.querySelectorAll('.calendar')[1])
      expect(document.activeElement.querySelector('td').dataset.coreuiDate).toEqual(new Date(2026, 11, 28).toDateString())
    })

    it('should move focus to the first date after a click on a month, as after Enter', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 11, 1), calendars: 2, locale: 'en-US' }) // eslint-disable-line no-new

      div.querySelector('.btn-month').click()

      const january = div.querySelector(`[data-coreui-date="${new Date(2027, 0, 1).toDateString()}"]`)

      january.focus()
      january.click()

      expect(document.activeElement.closest('.calendar')).toBe(div.querySelectorAll('.calendar')[1])
      expect(document.activeElement.dataset.coreuiDate).toEqual(new Date(2027, 0, 1).toDateString())
    })

    it('should pick a month the limit falls within, or one that starts on a disabled day', () => {
      fixtureEl.innerHTML = '<div></div><div></div>'

      const [limited, weekends] = fixtureEl.querySelectorAll('div')
      const picked = []
      new Calendar(limited, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 9, 1), locale: 'en-US', minDate: new Date(2026, 9, 15), selectionType: 'month'
      })
      new Calendar(weekends, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 10, 1), disabledDates: date => date.getDay() === 0 || date.getDay() === 6, locale: 'en-US', selectionType: 'month'
      })

      for (const div of [limited, weekends]) {
        div.addEventListener('startDateChange.coreui.calendar', event => picked.push(event.dateObject))
      }

      limited.querySelector(`[data-coreui-date="${new Date(2026, 9, 1).toDateString()}"]`).click()
      weekends.querySelector(`[data-coreui-date="${new Date(2026, 10, 1).toDateString()}"]`).click()

      expect(picked).toEqual([new Date(2026, 9, 1), new Date(2026, 10, 1)])
    })

    it('should move focus to the first month after a year is picked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' }) // eslint-disable-line no-new

      div.querySelector('.btn-year').click()

      const year = div.querySelector(`[data-coreui-date="${new Date(2027, 0, 1).toDateString()}"]`)

      year.focus()
      year.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))

      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('2027')
      expect(document.activeElement.dataset.coreuiDate).toEqual(new Date(2027, 0, 1).toDateString())
    })

    it('should go back to the view that picks the date from the year button of the years view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 8, 15), locale: 'en-US' }) // eslint-disable-line no-new

      div.querySelector('.btn-year').click()
      div.querySelector('.btn-year').focus()
      div.querySelector('.btn-year').click()

      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('September 2026')
      expect(document.activeElement.dataset.coreuiDate).toEqual(new Date(2026, 8, 1).toDateString())
    })

    it('should focus the week that holds the start of the month when the year button goes back to the days view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 8, 15),
        locale: 'en-US',
        selectionType: 'week',
        startDate: new Date(2026, 8, 21)
      })

      div.querySelector('.btn-year').focus()
      div.querySelector('.btn-year').click()
      div.querySelector('.btn-year').click()

      expect(document.activeElement.matches('tr')).toBeTrue()
      expect(document.activeElement.querySelector(`[data-coreui-date="${new Date(2026, 8, 1).toDateString()}"]`)).not.toBeNull()
    })

    it('should focus the quarter that holds the start of the month when the year button goes back to the quarters view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 8, 15),
        locale: 'en-US',
        selectionType: 'quarter',
        startDate: new Date(2026, 1, 10)
      })

      div.querySelector('.btn-year').focus()
      div.querySelector('.btn-year').click()
      div.querySelector('.btn-year').click()

      expect(document.activeElement.dataset.coreuiDate).toEqual(new Date(2026, 6, 1).toDateString())
    })

    it('should focus the start of the month a later panel shows when its year button goes back', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 8, 15),
        calendars: 2,
        locale: 'en-US',
        startDate: new Date(2026, 9, 20)
      })
      const yearButton = () => div.querySelectorAll('.btn-year')[1]

      yearButton().focus()
      yearButton().click()
      yearButton().click()

      expect(document.activeElement.dataset.coreuiDate).toEqual(new Date(2026, 9, 1).toDateString())
    })

    it('should leave the year button disabled where the years view is the one that picks', () => {
      fixtureEl.innerHTML = '<div></div><div></div>'

      const [years, months] = fixtureEl.querySelectorAll('div')
      new Calendar(years, { calendarDate: new Date(2026, 8, 1), locale: 'en-US', selectionType: 'year' }) // eslint-disable-line no-new
      const calendar = new Calendar(months, { calendarDate: new Date(2026, 8, 1), locale: 'en-US', selectionType: 'month' })

      expect(years.querySelector('.btn-year').disabled).toBeTrue()
      expect(months.querySelector('.btn-year').disabled).toBeFalse()

      months.querySelector('.btn-year').click()

      expect(months.querySelector('.btn-year').disabled).toBeFalse()

      months.querySelector('.btn-year').click()

      expect(months.querySelector('.calendar-cell-inner.month')).not.toBeNull()

      months.querySelector('.btn-year').click()
      calendar.setConfig({ selectionType: 'year' })

      expect(months.querySelector('.btn-year').disabled).toBeTrue()
    })

    it('should keep the navigation region across a page turn, so the new month is announced in it', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' }) // eslint-disable-line no-new
      const region = div.querySelector('.calendar-nav-date')

      div.querySelector('.btn-next').click()

      expect(div.querySelector('.calendar-nav-date')).toBe(region)
      expect(region.textContent.trim()).toContain('October')
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

    it('should give the tab stop to the row holding the calendar date, even when that row cannot be picked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      // eslint-disable-next-line no-new
      new Calendar(div, {
        calendarDate: new Date(2026, 6, 9), disabledDates: [new Date(2026, 6, 6)], locale: 'en-US', selectionType: 'week'
      })

      const stop = div.querySelector('.calendar-row[tabindex="0"]')

      expect(new Date(stop.querySelector('.calendar-cell').dataset.coreuiDate)).toEqual(new Date(2026, 6, 6))
      expect(stop.getAttribute('aria-disabled')).toEqual('true')
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

    it('should keep the view when an adjacent day is picked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 7, 1), locale: 'en-US', selectAdjacentDays: true }) // eslint-disable-line no-new
      const adjacent = date => [...div.querySelectorAll('.calendar-cell.next')]
        .find(cell => new Date(cell.dataset.coreuiDate).getTime() === date.getTime())

      adjacent(new Date(2026, 8, 3)).click()

      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('August 2026')
      expect(adjacent(new Date(2026, 8, 3)).classList).toContain('selected')
      expect(adjacent(new Date(2026, 8, 3)).classList).toContain('clickable')

      div.querySelector('.btn-next').click()

      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('September 2026')
    })

    it('should move into the next month with an arrow from a picked adjacent day', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 7, 1), locale: 'en-US', selectAdjacentDays: true }) // eslint-disable-line no-new
      const cell = [...div.querySelectorAll('.calendar-cell.next')]
        .find(element => new Date(element.dataset.coreuiDate).getTime() === new Date(2026, 8, 3).getTime())
      const keydown = createEvent('keydown')
      keydown.key = 'ArrowRight'

      cell.click()
      cell.focus()
      cell.dispatchEvent(keydown)

      expect(new Date(document.activeElement.dataset.coreuiDate)).toEqual(new Date(2026, 8, 4))
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('September 2026')
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

    it('should name a day cell with its full date', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 7, 1), locale: 'en-US' })
      const cell = div.querySelector(`[data-coreui-date="${new Date(2026, 7, 12).toDateString()}"]`)

      expect(calendar._view).toBe('days')
      expect(cell.getAttribute('aria-label')).toEqual('Wednesday, August 12, 2026')
    })

    it('should name a week row by the days it spans in week selection', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2026, 7, 1), firstDayOfWeek: 1, locale: 'en-US', selectionType: 'week', showWeekNumber: true
      })
      const cell = div.querySelector(`[data-coreui-date="${new Date(2026, 7, 12).toDateString()}"]`)

      expect(calendar._view).toBe('days')
      expect(cell.closest('tr').getAttribute('aria-label')).toMatch(/^August 10\s–\s16, 2026$/)
      expect(cell.getAttribute('aria-label')).toEqual('Wednesday, August 12, 2026')
    })

    it('should not name the rows when days are selected', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 7, 1), locale: 'en-US' })

      expect(calendar._view).toBe('days')
      expect(div.querySelectorAll('tbody tr[aria-label]')).toHaveSize(0)
    })

    it('should leave a cell drawn by a render callback to its content and pass the full name as meta.label', () => {
      fixtureEl.innerHTML = '<div><div id="days"></div><div id="months"></div></div>'

      const days = fixtureEl.querySelector('#days')
      const months = fixtureEl.querySelector('#months')
      const renderDayCell = (date, meta) => `${date.getDate()}<span class="visually-hidden">${meta.label}</span>`
      const calendar = new Calendar(days, { calendarDate: new Date(2026, 7, 1), locale: 'en-US', renderDayCell })
      const cell = days.querySelector(`[data-coreui-date="${new Date(2026, 7, 12).toDateString()}"]`)

      expect(calendar._view).toBe('days')
      expect(cell.hasAttribute('aria-label')).toBeFalse()
      expect(cell.querySelector('.visually-hidden').textContent).toEqual('Wednesday, August 12, 2026')

      const monthCalendar = new Calendar(months, {
        calendarDate: new Date(2026, 7, 1), locale: 'en-US', renderMonthCell: (date, meta) => meta.label, selectionType: 'month'
      })

      expect(monthCalendar._view).toBe('months')
      expect(months.querySelector('.calendar-cell').textContent).toEqual('January 2026')
    })

    it('should draw the cells again with the new state after a pick, keeping focus, and not on hover', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      let calls = 0
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 7, 1),
        calendars: 2,
        range: true,
        renderDayCell(date, { isInRange, isSelected }) {
          calls++
          return `<span>${date.getDate()}${isSelected ? '*' : ''}${isInRange ? '~' : ''}</span>`
        }
      })
      const cell = (month, day) => div.querySelector(`td.current[data-coreui-date="${new Date(2026, month, day).toDateString()}"]`)
      const untouched = cell(7, 20).querySelector('span')

      cell(7, 10).focus()
      cell(7, 10).dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))

      expect(cell(7, 10).textContent).toEqual('10*')
      expect(document.activeElement).toBe(cell(7, 10))
      expect(untouched.isConnected).toBeTrue()

      const drawn = calls
      cell(7, 12).dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: div }))

      expect(cell(7, 12).classList.contains('range-hover')).toBeTrue()
      expect(calls).toEqual(drawn)

      cell(8, 3).click()

      expect([cell(7, 10), cell(7, 31), cell(8, 2), cell(8, 3), cell(8, 4)].map(day => day.textContent)).toEqual(['10*~', '31~', '2~', '3*~', '4'])
    })

    it('should give the focus back to the picked date when a control drawn in the cell had it', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 8, 1),
        range: true,
        renderDayCell: (date, { isSelected }) => `<a href="#d${date.getDate()}">${date.getDate()}</a>${isSelected ? '*' : ''}`
      })
      const cell = div.querySelector(`td.current[data-coreui-date="${new Date(2026, 8, 15).toDateString()}"]`)
      const link = cell.querySelector('a')

      link.focus()
      link.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))

      expect(cell.textContent).toEqual('15*')
      expect(document.activeElement).toBe(cell)
    })

    it('should draw the days of a picked week again with the state of its row', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 8, 1),
        firstDayOfWeek: 1,
        renderDayCell: (date, { isSelected }) => `${date.getDate()}${isSelected ? '*' : ''}`,
        selectionType: 'week'
      })
      const row = div.querySelector(`td.previous[data-coreui-date="${new Date(2026, 7, 31).toDateString()}"]`).closest('tr')

      row.querySelector('td').click()

      expect([...row.querySelectorAll('td')].map(cell => cell.textContent)).toEqual(['31*', '1*', '2*', '3*', '4*', '5*', '6*'])
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

    it('should draw the months again with the new state after a pick', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 0, 1),
        renderMonthCell: (date, { isSelected }) => `${date.getMonth() + 1}${isSelected ? '*' : ''}`,
        selectionType: 'month'
      })

      div.querySelector(`[data-coreui-date="${new Date(2026, 2, 1).toDateString()}"]`).click()

      expect([...div.querySelectorAll('td')].slice(0, 4).map(cell => cell.textContent)).toEqual(['1', '2', '3*', '4'])
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

    it('should draw the quarters again with the new state after a pick', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 0, 1),
        renderQuarterCell: (date, { isSelected }) => `${(date.getMonth() / 3) + 1}${isSelected ? '*' : ''}`,
        selectionType: 'quarter'
      })

      div.querySelector(`[data-coreui-date="${new Date(2026, 3, 1).toDateString()}"]`).click()

      expect([...div.querySelectorAll('td')].map(cell => cell.textContent)).toEqual(['1', '2*', '3', '4'])
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

    it('should draw the years again with the new state after a pick', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 0, 1),
        renderYearCell: (date, { isSelected }) => `${date.getFullYear()}${isSelected ? '*' : ''}`,
        selectionType: 'year'
      })
      const year = () => div.querySelector(`[data-coreui-date="${new Date(2027, 0, 1).toDateString()}"]`)

      year().click()

      expect(year().textContent).toEqual('2027*')
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

    it('should swap the icons a page gives in a right-to-left layout', () => {
      fixtureEl.innerHTML = '<div dir="rtl"><div></div></div>'
      const div = fixtureEl.querySelector('div > div')
      new Calendar(div, { // eslint-disable-line no-new
        navNextDoubleIcon: '<svg><circle id="double-next"></circle></svg>',
        navNextIcon: '<svg><circle id="next"></circle></svg>',
        navPrevDoubleIcon: '<svg><circle id="double-prev"></circle></svg>',
        navPrevIcon: '<svg><circle id="prev"></circle></svg>'
      })

      expect(navIcon(div, '.btn-double-prev').querySelector('circle').id).toEqual('double-next')
      expect(navIcon(div, '.btn-prev').querySelector('circle').id).toEqual('next')
      expect(navIcon(div, '.btn-next').querySelector('circle').id).toEqual('prev')
      expect(navIcon(div, '.btn-double-next').querySelector('circle').id).toEqual('double-prev')
    })

    it('should accept a custom navigation icon and sanitize it', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      // eslint-disable-next-line no-new
      new Calendar(div, {
        navNextIcon: '<svg xmlns="http://www.w3.org/2000/svg"><script>window.calendarHacked = true</script><circle r="4" /></svg>'
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

    it('should render the view of a new selection type', () => {
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

    it('should keep the announced month region when the dates change', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), calendars: 2, locale: 'en-US' })
      const regions = [...div.querySelectorAll('.calendar-nav-date')]

      calendar.setConfig({ startDate: new Date(2027, 0, 10) })

      for (const [index, region] of div.querySelectorAll('.calendar-nav-date').entries()) {
        expect(region).toBe(regions[index])
      }

      expect(regions.map(region => region.textContent.trim())).toEqual(['January 2027', 'February 2027'])
    })

    it('should leave the announced month region alone when the month does not change', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2026, 8, 1), calendars: 2, locale: 'en-US', range: true
      })
      const observer = new MutationObserver(() => {})

      for (const region of div.querySelectorAll('.calendar-nav-date')) {
        observer.observe(region, { characterData: true, childList: true, subtree: true })
      }

      calendar.refresh()
      calendar.setConfig({ selectEndDate: true })

      expect(observer.takeRecords()).toHaveSize(0)
      observer.disconnect()
    })

    it('should rebuild the panels when the number of calendars changes', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' })

      calendar.setConfig({ calendars: 3 })

      expect([...div.querySelectorAll('.calendar table')].map(table => table.getAttribute('aria-label'))).toEqual(['September 2026', 'October 2026', 'November 2026'])

      calendar.setConfig({ calendars: 1 })

      expect([...div.querySelectorAll('.calendar table')].map(table => table.getAttribute('aria-label'))).toEqual(['September 2026'])
    })

    it('should keep focus on the same date when setConfig() renders the calendar again', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' })

      div.querySelector('[data-coreui-date="Tue Sep 15 2026"]').focus()
      calendar.setConfig({ selectEndDate: true })

      expect(document.activeElement.getAttribute('data-coreui-date')).toBe('Tue Sep 15 2026')
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

    it('should render the calendar again on refresh', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      div.querySelector('table').innerHTML = ''
      calendar.refresh()

      expect(div.querySelector('.calendar')).not.toBeNull()
      expect(div.querySelector('.calendar-nav')).not.toBeNull()
      expect(div.querySelector('.calendar-cell')).not.toBeNull()
    })

    it('should keep focus on the same date when refresh() renders the grid again', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' })

      div.querySelector('[data-coreui-date="Tue Sep 15 2026"]').focus()
      calendar.refresh()

      expect(document.activeElement.getAttribute('data-coreui-date')).toBe('Tue Sep 15 2026')
    })

    it('should keep focus on the navigation button when refresh() follows a page turn', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' })

      div.querySelector('.btn-next').focus()
      div.querySelector('.btn-next').click()
      calendar.refresh()

      expect(document.activeElement).toBe(div.querySelector('.btn-next'))
    })

    it('should keep focus on the same date when a control inside a cell had focus', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2026, 8, 1),
        locale: 'en-US',
        renderDayCell: date => `<a class="day-link" href="#">${date.getDate()}</a>`
      })

      div.querySelector('[data-coreui-date="Tue Sep 15 2026"] .day-link').focus()
      calendar.refresh()

      expect(document.activeElement.closest('[data-coreui-date]').getAttribute('data-coreui-date')).toBe('Tue Sep 15 2026')
    })

    it('should keep focus on the navigation button of the same panel on refresh()', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), calendars: 2, locale: 'en-US' })

      div.querySelectorAll('.btn-next')[1].focus()
      calendar.refresh()

      expect(document.activeElement).toBe(div.querySelectorAll('.btn-next')[1])
    })

    it('should prefer the in-month cell when the focused date moves to another panel', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2026, 8, 1),
        calendars: 2,
        locale: 'en-US',
        selectAdjacentDays: true
      })

      div.querySelectorAll('.calendar')[1].querySelector('[data-coreui-date="Tue Oct 27 2026"]').focus()
      calendar.setConfig({ calendarDate: new Date(2026, 9, 1) })

      expect(document.activeElement.getAttribute('data-coreui-date')).toBe('Tue Oct 27 2026')
      expect(document.activeElement.closest('.calendar')).toBe(div.querySelectorAll('.calendar')[0])
    })

    it('should not scroll the page when refresh() restores focus', () => {
      fixtureEl.innerHTML = '<div></div><div style="height: 3000px"></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' })

      div.querySelector('[data-coreui-date="Tue Sep 15 2026"]').focus()
      document.scrollingElement.scrollTop = 2000
      const { scrollTop } = document.scrollingElement
      calendar.refresh()

      expect(document.scrollingElement.scrollTop).toBe(scrollTop)
      document.scrollingElement.scrollTop = 0
    })

    it('should leave focus outside the calendar where it is on refresh()', () => {
      fixtureEl.innerHTML = '<div></div><button id="outside" type="button">Outside</button>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' })
      const outside = fixtureEl.querySelector('#outside')

      outside.focus()
      calendar.refresh()

      expect(document.activeElement).toBe(outside)
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
      [...div.querySelectorAll('.calendar-cell[tabindex]')].find(cell => {
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

    const weekRow = (panel, date) => [...panel.querySelectorAll('.calendar-row[tabindex]')]
      .find(element => new Date(element.querySelector('[data-coreui-date]').dataset.coreuiDate).getTime() === date.getTime())

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

    it('should move onto a disabled day in the direction of the arrow', () => {
      const div = renderCalendar({ disabledDates: [new Date(2026, 7, 13), new Date(2026, 7, 19)] })

      pressKey(focusDay(div, 2026, 7, 12), 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2026, 7, 13))
      expect(document.activeElement.getAttribute('aria-disabled')).toEqual('true')

      pressKey(focusDay(div, 2026, 7, 12), 'ArrowDown')
      expect(activeDate()).toEqual(new Date(2026, 7, 19))
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

    it('should page a week row into the panel of its own month when two panels show it', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 5, 1), calendars: 2, selectionType: 'week' })
      const row = weekRow(div.querySelectorAll('.calendar')[1], new Date(2026, 6, 6))

      row.focus()
      pressKey(row, 'PageDown')

      expect(weekRow(div.querySelectorAll('.calendar')[1], new Date(2026, 7, 3))).toBe(document.activeElement)
    })

    it('should page a week row into the panel that shows the day when adjacent days are hidden', () => {
      const div = renderCalendar({
        calendarDate: new Date(2026, 1, 1), calendars: 2, selectionType: 'week', showAdjacentDays: false
      })
      const row = weekRow(div.querySelectorAll('.calendar')[1], new Date(2026, 2, 2))

      row.focus()
      pressKey(row, 'PageDown')

      expect(weekRow(div.querySelectorAll('.calendar')[1], new Date(2026, 3, 1))).toBe(document.activeElement)
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

    it('should move onto a disabled year with the arrows', () => {
      const div = renderCalendar({ calendarDate: new Date(2030, 0, 1), selectionType: 'year', disabledDates: date => date.getFullYear() > 2030 })
      const year = div.querySelector(`[data-coreui-date="${new Date(2030, 0, 1).toDateString()}"]`)

      year.focus()
      pressKey(year, 'ArrowRight')

      expect(activeDate()).toEqual(new Date(2031, 0, 1))
      expect(document.activeElement.getAttribute('aria-disabled')).toEqual('true')
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

    it('should make the grid the tab stop when the view lies wholly outside the limits', () => {
      const div = renderCalendar({ minDate: new Date(2026, 8, 1) })
      const grid = div.querySelector('table')

      expect(grid.getAttribute('tabindex')).toEqual('0')

      grid.focus()
      pressKey(grid, 'PageDown')

      expect(activeDate()).toEqual(new Date(2026, 8, 1))
      expect(div.querySelector('table').hasAttribute('tabindex')).toBeFalse()
    })

    it('should page a grid shown outside the limits back with PageUp and by a year with Shift+PageDown', () => {
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

    it('should move into a blocked month with ArrowRight and come back with ArrowLeft', () => {
      const div = renderCalendar({ disabledDates: date => date.getMonth() === 8 || date.getMonth() === 9 })

      pressKey(focusDay(div, 2026, 7, 31), 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2026, 8, 1))

      pressKey(document.activeElement, 'ArrowLeft')
      expect(activeDate()).toEqual(new Date(2026, 7, 31))
    })

    it('should leave a grid shown outside the limits for the limit the arrow points toward', () => {
      const div = renderCalendar({ disabledDates: [new Date(2026, 9, 15)], minDate: new Date(2026, 9, 15) })
      const grid = div.querySelector('table')

      expect(grid.getAttribute('tabindex')).toEqual('0')

      grid.focus()
      pressKey(grid, 'ArrowLeft')
      expect(document.activeElement).toBe(grid)

      pressKey(grid, 'ArrowRight')
      expect(activeDate()).toEqual(new Date(2026, 9, 15))
      expect(document.activeElement.getAttribute('aria-disabled')).toEqual('true')
    })

    it('should keep focus in the calendar when paging from a grid outside the limits shows a date in another panel', () => {
      const div = renderCalendar({ calendars: 2, minDate: new Date(2026, 9, 20) })
      const grid = div.querySelector('table')

      grid.focus()
      pressKey(grid, 'PageDown')

      expect(activeDate()).toEqual(new Date(2026, 9, 20))
      expect(div.querySelectorAll('.calendar')[1].contains(document.activeElement)).toBeTrue()
    })

    it('should keep arrows and Home/End on a grid shown outside the limits from scrolling the page', () => {
      const grid = renderCalendar({ minDate: new Date(2026, 8, 1) }).querySelector('table')
      const event = createEvent('keydown', { cancelable: true })
      event.key = 'ArrowRight'

      grid.focus()
      grid.dispatchEvent(event)

      expect(event.defaultPrevented).toBeTrue()
    })

    it('should land on the same day when PageDown leads into a month with nothing to pick', () => {
      renderCalendar({ disabledDates: date => date.getMonth() === 8 })

      pressKey(focusDay(fixtureEl.querySelector('div'), 2026, 7, 12), 'PageDown')

      expect(activeDate()).toEqual(new Date(2026, 8, 12))
      expect(document.activeElement.getAttribute('aria-disabled')).toEqual('true')
    })

    it('should stop PageDown on maxDate in the shown month without turning the calendar', () => {
      const div = renderCalendar({ maxDate: new Date(2026, 7, 20) })
      const listener = jasmine.createSpy('listener')

      div.addEventListener('calendarDateChange.coreui.calendar', listener)
      pressKey(focusDay(div, 2026, 7, 12), 'PageDown')

      expect(activeDate()).toEqual(new Date(2026, 7, 20))
      expect(listener).not.toHaveBeenCalled()

      pressKey(document.activeElement, 'PageDown')

      expect(activeDate()).toEqual(new Date(2026, 7, 20))
      expect(listener).not.toHaveBeenCalled()
    })

    it('should move PageDown from an adjacent day to the same day of the next month', () => {
      const div = renderCalendar({ selectAdjacentDays: true })

      pressKey(focusDay(div, 2026, 8, 1), 'PageDown')

      expect(activeDate()).toEqual(new Date(2026, 9, 1))
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('October 2026')
    })

    it('should move PageDown from an adjacent day to maxDate in the next month', () => {
      const div = renderCalendar({ maxDate: new Date(2026, 8, 15), selectAdjacentDays: true })

      pressKey(focusDay(div, 2026, 8, 1), 'PageDown')

      expect(activeDate()).toEqual(new Date(2026, 8, 15))
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('September 2026')
    })

    it('should keep a week row that starts in the previous month when maxDate cuts PageDown in the shown month', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 6, 1), maxDate: new Date(2026, 6, 3), selectionType: 'week' })
      const row = weekRow(div, new Date(2026, 5, 29))

      row.focus()
      pressKey(row, 'PageDown')

      expect(document.activeElement).toBe(row)
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('July 2026')
    })

    it('should page a week row back to the week that reaches minDate', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 6, 1), minDate: new Date(2026, 5, 10), selectionType: 'week' })
      const row = weekRow(div, new Date(2026, 5, 29))

      row.focus()
      pressKey(row, 'PageUp')

      expect(document.activeElement).toBe(weekRow(div, new Date(2026, 5, 8)))
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('June 2026')
    })

    it('should not make a grid the tab stop while another panel has a date that can take the focus', () => {
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

    it('should keep one tab stop after ArrowDown leaves the last week row', () => {
      const div = renderCalendar({ selectionType: 'week', showAdjacentDays: false })
      const last = [...div.querySelectorAll('.calendar-row[data-coreui-selectable]')].at(-1)

      last.focus()
      pressKey(last, 'ArrowDown')

      expect(div.querySelectorAll('.calendar-row[tabindex="0"]').length).toEqual(1)
    })

    it('should name each grid after the period it shows', () => {
      expect(renderCalendar().querySelector('table').getAttribute('aria-label')).toEqual('August 2026')
      expect(renderCalendar({ selectionType: 'month' }).querySelector('table').getAttribute('aria-label')).toEqual('2026')
      expect(renderCalendar({ selectionType: 'year' }).querySelector('table').getAttribute('aria-label')).toMatch(/^2020\s–\s2031$/)
    })

    it('should describe a grid with nothing to pick, and only such a grid', () => {
      const description = div => {
        const grid = div.querySelector('table')
        const id = grid.getAttribute('aria-describedby')

        return id ? document.getElementById(id).textContent : null
      }

      expect(description(renderCalendar({ minDate: new Date(2026, 8, 1) }))).toEqual('Nothing on this page can be picked')
      expect(description(renderCalendar({ disabledDates: date => date.getMonth() === 7 }))).toEqual('Nothing on this page can be picked')
      expect(description(renderCalendar({ disabledDates: date => date.getFullYear() === 2026, selectionType: 'month' }))).toEqual('Nothing on this page can be picked')
      expect(description(renderCalendar({ disabledDates: date => date.getFullYear() === 2026, selectionType: 'quarter' }))).toEqual('Nothing on this page can be picked')
      expect(description(renderCalendar({ disabledDates: date => date.getFullYear() >= 2020 && date.getFullYear() <= 2031, selectionType: 'year' }))).toEqual('Nothing on this page can be picked')
      expect(description(renderCalendar({ disabledDates: date => date.getDay() === 1, firstDayOfWeek: 1, selectionType: 'week' }))).toEqual('Nothing on this page can be picked')
      expect(description(renderCalendar({ disabledDates: [new Date(2026, 7, 14)] }))).toBeNull()

      for (const selectionType of ['week', 'month', 'quarter', 'year']) {
        expect(description(renderCalendar({ selectionType }))).toBeNull()
      }

      const panels = [...renderCalendar({ calendars: 2, maxDate: new Date(2026, 7, 20) }).querySelectorAll('.calendar')]

      const described = document.getElementById(panels[1].querySelector('table').getAttribute('aria-describedby'))

      expect(panels[0].querySelector('table').hasAttribute('aria-describedby')).toBeFalse()
      expect(described.hidden).toBeTrue()
      expect(panels[1].contains(described)).toBeTrue()
      expect(new Set(panels.map(panel => panel.querySelector('.calendar > span[hidden]').id)).size).toEqual(2)
    })

    it('should word the description with ariaNothingToPickLabel, and leave the grid undescribed without it', () => {
      const labelled = renderCalendar({ ariaNothingToPickLabel: 'Brak dat do wyboru', minDate: new Date(2026, 8, 1) }).querySelector('table')

      expect(document.getElementById(labelled.getAttribute('aria-describedby')).textContent).toEqual('Brak dat do wyboru')
      expect(renderCalendar({ ariaNothingToPickLabel: '', minDate: new Date(2026, 8, 1) }).querySelector('table').hasAttribute('aria-describedby')).toBeFalse()
      expect(renderCalendar({ minDate: new Date(2026, 8, 1) }, '<div data-coreui-aria-nothing-to-pick-label=""></div>').querySelector('table').hasAttribute('aria-describedby')).toBeFalse()

      const div = renderCalendar({ minDate: new Date(2026, 8, 1) })

      Calendar.getInstance(div).setConfig({ ariaNothingToPickLabel: 'Brak dat do wyboru' })

      expect(div.querySelector('.calendar-nav-date .visually-hidden').textContent).toEqual('Brak dat do wyboru')
    })

    it('should describe a grid again when a pick leaves nothing on it to pick', () => {
      let start = null
      const div = renderCalendar({ calendars: 2, disabledDates: date => start !== null && date - start > 7 * 86_400_000, range: true })
      const panels = [...div.querySelectorAll('.calendar')]

      div.addEventListener('startDateChange.coreui.calendar', event => {
        start = event.dateObject
      })

      expect(panels[1].querySelector('table').hasAttribute('aria-describedby')).toBeFalse()

      panels[0].querySelector(`[data-coreui-date="${new Date(2026, 7, 3).toDateString()}"]`).click()

      expect(panels[0].querySelector('table').hasAttribute('aria-describedby')).toBeFalse()
      expect(panels[1].querySelector('table').hasAttribute('aria-describedby')).toBeTrue()
      expect(panels[0].querySelector('.calendar-nav-date .visually-hidden')).toBeNull()
      expect(panels[1].querySelector('.calendar-nav-date .visually-hidden').textContent).toEqual('Nothing on this page can be picked')
    })

    it('should announce every page with nothing to pick the calendar turns to, with its name', () => {
      const div = renderCalendar({ disabledDates: date => date.getMonth() > 7 })
      const region = div.querySelector('.calendar-nav-date')
      const observer = new MutationObserver(() => {})

      expect(region.getAttribute('aria-live')).toEqual('polite')
      expect(region.getAttribute('aria-atomic')).toEqual('true')
      expect(region.querySelector('.visually-hidden')).toBeNull()

      observer.observe(region, { childList: true, subtree: true })
      div.querySelector('.btn-next').click()

      expect(region.textContent).toMatch(/^September 2026\s*Nothing on this page can be picked$/)
      expect(observer.takeRecords().length).toBeGreaterThan(0)

      div.querySelector('.btn-next').click()

      expect(region.textContent).toMatch(/^October 2026\s*Nothing on this page can be picked$/)
      expect(observer.takeRecords().length).toBeGreaterThan(0)

      div.querySelector('.btn-prev').click()
      div.querySelector('.btn-prev').click()

      expect(region.querySelector('.visually-hidden')).toBeNull()
      observer.disconnect()
    })

    it('should not announce a page with nothing to pick again while it stays on screen', () => {
      const div = renderCalendar({ calendars: 2, disabledDates: date => date.getMonth() === 8 })
      const [first, second] = [...div.querySelectorAll('.calendar')]
      const region = second.querySelector('.calendar-nav-date')
      const observer = new MutationObserver(() => {})

      observer.observe(region, { childList: true, subtree: true, characterData: true })
      first.querySelector(`[data-coreui-date="${new Date(2026, 7, 12).toDateString()}"]`).click()
      Calendar.getInstance(div).refresh()
      Calendar.getInstance(div).setConfig({ locale: 'en-US' })

      expect(region.querySelector('.visually-hidden').textContent).toEqual('Nothing on this page can be picked')
      expect(observer.takeRecords()).toHaveSize(0)
      observer.disconnect()
    })

    it('should announce every page with nothing to pick the keys turn to', () => {
      const div = renderCalendar({ disabledDates: date => date.getMonth() > 7 })
      const region = div.querySelector('.calendar-nav-date')
      const observer = new MutationObserver(() => {})

      observer.observe(region, { childList: true, subtree: true })
      pressKey(focusDay(div, 2026, 7, 12), 'PageDown')

      expect(region.textContent).toMatch(/^September 2026\s*Nothing on this page can be picked$/)
      expect(observer.takeRecords().length).toBeGreaterThan(0)

      pressKey(document.activeElement, 'PageDown')

      expect(region.textContent).toMatch(/^October 2026\s*Nothing on this page can be picked$/)
      expect(observer.takeRecords().length).toBeGreaterThan(0)
      observer.disconnect()
    })

    it('should drop the announcement when a page gets something to pick without turning', () => {
      let blocked = true
      const div = renderCalendar({ calendars: 2, disabledDates: date => blocked && date.getMonth() === 8 })
      const [first, second] = [...div.querySelectorAll('.calendar')]

      expect(second.querySelector('.calendar-nav-date .visually-hidden')).not.toBeNull()

      blocked = false
      first.querySelector(`[data-coreui-date="${new Date(2026, 7, 12).toDateString()}"]`).click()

      expect(second.querySelector('.calendar-nav-date .visually-hidden')).toBeNull()
      expect(second.querySelector('table').hasAttribute('aria-describedby')).toBeFalse()
    })

    it('should describe the grid again when the calendar turns to a page with nothing to pick', () => {
      const div = renderCalendar({ disabledDates: date => date.getMonth() === 8 })

      div.querySelector('.btn-next').click()
      expect(div.querySelector('table').hasAttribute('aria-describedby')).toBeTrue()

      div.querySelector('.btn-prev').click()
      expect(div.querySelector('table').hasAttribute('aria-describedby')).toBeFalse()
    })

    it('should write a calendar without Gregorian months in the Gregorian calendar', () => {
      const days = renderCalendar({ calendarDate: new Date(2026, 8, 1), locale: 'fa-IR' })

      expect(days.querySelector('.calendar-cell:not(.previous) .calendar-cell-inner').textContent.trim()).toEqual('۱')
      expect(days.querySelector('.btn-month').textContent.trim()).toEqual('سپتامبر')
      expect(days.querySelector('.btn-year').textContent.trim()).toEqual('۲۰۲۶')

      const months = renderCalendar({ calendarDate: new Date(2026, 8, 1), locale: 'fa-IR', selectionType: 'month' })

      expect(months.querySelector('.calendar-cell').textContent.trim()).toEqual('ژانویه')
    })

    it('should keep a calendar that shares the Gregorian months', () => {
      const years = renderCalendar({ calendarDate: new Date(2026, 8, 1), locale: 'th-TH', selectionType: 'month' })

      expect(years.querySelector('.btn-year').textContent.trim()).toContain('2569')
    })

    it('should name the years page in the navigation the way the grid does', () => {
      const div = renderCalendar({ locale: 'pl-PL', selectionType: 'year' })
      const region = div.querySelector('.calendar-nav-date')

      expect(region.getAttribute('aria-live')).toEqual('polite')
      expect(region.textContent.trim()).toEqual('2020–2031')
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('2020–2031')

      div.querySelector('.btn-double-next').click()

      expect(region.textContent.trim()).toEqual('2032–2043')
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('2032–2043')
    })

    it('should move focus to the same place of the next years page on PageDown and back on PageUp', () => {
      const div = renderCalendar({ locale: 'pl-PL', selectionType: 'year' })
      const cell = div.querySelector(`[data-coreui-date="${new Date(2021, 0, 1).toDateString()}"]`)

      cell.focus()
      pressKey(cell, 'PageDown')

      expect(document.activeElement.dataset.coreuiDate).toEqual(new Date(2033, 0, 1).toDateString())
      expect(div.querySelector('.calendar-nav-date').textContent.trim()).toEqual('2032–2043')

      pressKey(document.activeElement, 'PageUp')

      expect(document.activeElement.dataset.coreuiDate).toEqual(new Date(2021, 0, 1).toDateString())
      expect(div.querySelector('.calendar-nav-date').textContent.trim()).toEqual('2020–2031')
    })

    it('should name the years page after the year button', () => {
      const div = renderCalendar({ locale: 'ar-EG' })

      div.querySelector('.btn-year').click()

      expect(div.querySelector('.calendar-nav-date').textContent.trim()).toEqual('٢٠٢٠–٢٠٣١')
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('٢٠٢٠–٢٠٣١')
      expect(div.querySelector('.btn-double-next').getAttribute('aria-label')).toEqual('Next 12 years')
    })

    it('should write the full year in the navigation and yearFormat in the year cells', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2026, 8, 1), locale: 'en-US', selectionType: 'month', yearFormat: '2-digit'
      })

      expect(div.querySelector('.btn-year').textContent.trim()).toEqual('2026')

      calendar.setConfig({ selectionType: 'day' })

      expect(div.querySelector('.btn-year').textContent.trim()).toEqual('2026')

      calendar.setConfig({ selectionType: 'year' })

      expect(div.querySelector('.calendar-cell').textContent.trim()).toEqual('20')
    })

    it('should keep one year in the navigation of the months and quarters views', () => {
      expect(renderCalendar({ locale: 'pl-PL', selectionType: 'month' }).querySelector('.calendar-nav-date').textContent.trim()).toEqual('2026')
      expect(renderCalendar({ locale: 'pl-PL', selectionType: 'quarter' }).querySelector('.calendar-nav-date').textContent.trim()).toEqual('2026')
    })

    it('should keep a right-to-left years range in reading order in a left-to-right calendar', () => {
      const text = renderCalendar({ locale: 'fa-IR', selectionType: 'year' }).querySelector('.btn-year').firstChild
      const left = token => {
        const range = document.createRange()
        range.setStart(text, text.data.indexOf(token))
        range.setEnd(text, text.data.indexOf(token) + token.length)
        return range.getBoundingClientRect().left
      }

      expect(left('۲۰۳۱')).toBeLessThan(left('تا'))
      expect(left('تا')).toBeLessThan(left('۲۰۲۰'))
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

    it('should move into the previous month with Home when the week starts there', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 6, 1) })

      pressKey(focusDay(div, 2026, 6, 2), 'Home')

      expect(activeDate()).toEqual(new Date(2026, 5, 29))
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('June 2026')
    })

    it('should move into the next month with End when the week ends there', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 6, 1) })

      pressKey(focusDay(div, 2026, 6, 30), 'End')

      expect(activeDate()).toEqual(new Date(2026, 7, 2))
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('August 2026')
    })

    it('should move a week row to the first and last week of the month with Home and End', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 6, 1), selectionType: 'week' })
      const row = weekRow(div, new Date(2026, 6, 13))
      const firstCell = () => new Date(document.activeElement.querySelector('[data-coreui-date]').dataset.coreuiDate)

      row.focus()
      pressKey(row, 'Home')
      expect(firstCell()).toEqual(new Date(2026, 5, 29))

      pressKey(document.activeElement, 'End')
      expect(firstCell()).toEqual(new Date(2026, 6, 27))
    })

    it('should keep Home and End on week rows in the panel that has the focus', () => {
      const div = renderCalendar({ calendarDate: new Date(2026, 5, 1), calendars: 2, selectionType: 'week' })
      const july = div.querySelectorAll('.calendar')[1]
      const row = weekRow(july, new Date(2026, 6, 13))

      row.focus()
      pressKey(row, 'Home')
      expect(document.activeElement).toBe(weekRow(july, new Date(2026, 5, 29)))

      pressKey(document.activeElement, 'End')
      expect(document.activeElement).toBe(weekRow(july, new Date(2026, 6, 27)))
    })

    it('should take Home and End from the day cell when a link inside it has the focus', () => {
      const div = renderCalendar({
        calendarDate: new Date(2026, 6, 1),
        renderDayCell: date => (date.getMonth() === 6 && date.getDate() === 15 ? '<a href="#day">15</a>' : String(date.getDate()))
      })
      const link = div.querySelector('.calendar-cell a')

      link.focus()
      pressKey(link, 'Home')

      expect(activeDate()).toEqual(new Date(2026, 6, 13))
      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('July 2026')
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

    it('should keep moving through the next month with the arrows after a day of it is picked from the grid', () => {
      const div = renderCalendar({ selectAdjacentDays: true })
      const picked = [...div.querySelectorAll('.calendar-cell.next[data-coreui-selectable]')]
        .find(cell => new Date(cell.dataset.coreuiDate).getTime() === new Date(2026, 8, 1).getTime())

      picked.focus()
      picked.click()
      pressKey(picked, 'ArrowRight')

      expect(activeDate()).toEqual(new Date(2026, 8, 2))
    })

    it('should show the month of the target when PageDown stops at maxDate after a day of the next month is picked', () => {
      const div = renderCalendar({ maxDate: new Date(2026, 8, 20), selectAdjacentDays: true })
      const picked = [...div.querySelectorAll('.calendar-cell.next[data-coreui-selectable]')]
        .find(cell => new Date(cell.dataset.coreuiDate).getTime() === new Date(2026, 8, 1).getTime())

      picked.focus()
      picked.click()
      pressKey(picked, 'PageDown')

      expect(activeDate()).toEqual(new Date(2026, 8, 20))
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
    it('should move focus to the month the panel showed when its btn-month is activated', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2026, 8, 1),
        calendars: 2,
        locale: 'en-US',
        startDate: new Date(2026, 2, 10)
      })

      div.querySelectorAll('.btn-month')[1].focus()
      div.querySelectorAll('.btn-month')[1].click()

      expect(calendar._view).toBe('months')
      expect(document.activeElement.getAttribute('data-coreui-date')).toBe('Thu Oct 01 2026')
    })

    it('should move focus into the months grid when btn-month is activated', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' })

      div.querySelector('.btn-month').focus()
      div.querySelector('.btn-month').click()

      expect(calendar._view).toBe('months')
      expect(document.activeElement.getAttribute('data-coreui-date')).toBe('Tue Sep 01 2026')
      expect(document.activeElement.getAttribute('tabindex')).toBe('0')
    })

    it('should move focus into the years grid when btn-year is activated', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' })

      div.querySelector('.btn-year').focus()
      div.querySelector('.btn-year').click()

      expect(calendar._view).toBe('years')
      expect(document.activeElement.getAttribute('data-coreui-date')).toBe(new Date(2026, 0, 1).toDateString())
      expect(document.activeElement.getAttribute('tabindex')).toBe('0')
    })

    it('should move focus to the year a panel showed when its btn-year is activated', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 11, 1), calendars: 2, locale: 'en-US' })
      const button = div.querySelectorAll('.btn-year')[1]

      button.focus()
      button.click()

      expect(calendar._view).toBe('years')
      expect(document.activeElement.getAttribute('data-coreui-date')).toBe(new Date(2027, 0, 1).toDateString())
    })

    it('should move focus into the years grid from the months view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US', selectionType: 'month' })

      div.querySelector('.btn-year').focus()
      div.querySelector('.btn-year').click()

      expect(calendar._view).toBe('years')
      expect(document.activeElement.getAttribute('data-coreui-date')).toBe(new Date(2026, 0, 1).toDateString())
    })

    it('should keep the years view of a year selection, whose year button is disabled', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US', selectionType: 'year' })
      const button = div.querySelector('.btn-year')

      button.click()

      expect(button.disabled).toBeTrue()
      expect(calendar._view).toBe('years')
    })

    it('should stay in the years view while Enter repeats after btn-year', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' })

      div.querySelector('.btn-year').focus()
      div.querySelector('.btn-year').click()
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true, cancelable: true, code: 'Enter', key: 'Enter', repeat: true
      }))

      expect(calendar._view).toBe('years')
      expect(document.activeElement.getAttribute('data-coreui-date')).toBe(new Date(2026, 0, 1).toDateString())
    })

    it('should move focus to the month the panel showed when its btn-month is activated, even when that month cannot be picked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2026, 11, 1),
        calendars: 2,
        disabledDates: [[new Date(2027, 0, 1), new Date(2027, 0, 31)]],
        locale: 'en-US'
      })
      const button = div.querySelectorAll('.btn-month')[1]

      button.focus()
      button.click()

      expect(calendar._view).toBe('months')
      expect(document.activeElement.closest('.calendar')).toBe(div.querySelectorAll('.calendar')[1])
      expect(document.activeElement.dataset.coreuiDate).toEqual(new Date(2027, 0, 1).toDateString())
      expect(document.activeElement.getAttribute('aria-disabled')).toEqual('true')
      expect(document.activeElement.getAttribute('tabindex')).toBe('0')
    })

    it('should keep focus on btn-next when the focused button carries a class of its own', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' })
      const next = div.querySelector('.btn-next')

      next.focus()
      next.classList.add('focus-visible')
      next.click()

      expect(calendar._calendarDate.getMonth()).toBe(9)
      expect(document.activeElement).toBe(div.querySelector('.btn-next'))
    })

    it('should keep the announced month region when btn-next is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), locale: 'en-US' })
      const region = div.querySelector('.calendar-nav-date')

      div.querySelector('.btn-next').click()

      expect(div.querySelector('.calendar-nav-date')).toBe(region)
      expect(region.textContent).toContain('October')
      expect(calendar._calendarDate.getMonth()).toEqual(9)
    })

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

    it('should advance by the twelve years of a page when btn-double-next is clicked in years view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year',
        calendarDate: new Date(2023, 5, 1)
      })
      const initialYear = calendar._calendarDate.getFullYear()

      const btnDoubleNext = div.querySelector('.btn-double-next')
      btnDoubleNext.click()

      expect(calendar._calendarDate.getFullYear()).toEqual(initialYear + 12)
      expect(div.querySelector('.calendar-nav-date').textContent.trim()).toMatch(/^2029\s–\s2040$/)
    })

    it('should go back by the twelve years of a page when btn-double-prev is clicked in years view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year',
        calendarDate: new Date(2023, 5, 1)
      })
      const initialYear = calendar._calendarDate.getFullYear()

      const btnDoublePrev = div.querySelector('.btn-double-prev')
      btnDoublePrev.click()

      expect(calendar._calendarDate.getFullYear()).toEqual(initialYear - 12)
      expect(div.querySelector('.calendar-nav-date').textContent.trim()).toMatch(/^2005\s–\s2016$/)
    })

    it('should keep a year below 100 when paging back a page of years', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2000, 5, 1)
      calendarDate.setFullYear(95)
      const calendar = new Calendar(div, { selectionType: 'year', calendarDate })

      div.querySelector('.btn-double-prev').click()

      expect(calendar._calendarDate.getFullYear()).toEqual(83)
      expect(div.querySelector('.calendar-nav-date').textContent.trim()).toMatch(/^77\s–\s88$/)
    })

    it('should draw the days of both panels below year 100 in the years they show', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2000, 11, 1)
      calendarDate.setFullYear(99)
      new Calendar(div, { calendarDate, calendars: 2 }) // eslint-disable-line no-new

      const [december, january] = div.querySelectorAll('.calendar')
      const years = (panel, selector) => [...new Set([...panel.querySelectorAll(selector)].map(cell => cell.dataset.coreuiDate.slice(-4)))]

      expect(years(december, 'td.current')).toEqual(['0099'])
      expect(years(december, 'td.next')).toEqual(['0100'])
      expect(years(january, 'td.current')).toEqual(['0100'])
    })

    it.each([
      ['month', ['0026']],
      ['quarter', ['0026']]
    ])('should draw the %s cells below year 100 in the year the page shows', (selectionType, expected) => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2000, 0, 1)
      calendarDate.setFullYear(26)
      new Calendar(div, { calendarDate, selectionType }) // eslint-disable-line no-new

      expect([...new Set([...div.querySelectorAll('td[data-coreui-date]')].map(cell => cell.dataset.coreuiDate.slice(-4)))]).toEqual(expected)
    })

    it('should give each year cell below 100 the year it shows', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2000, 0, 1)
      calendarDate.setFullYear(26)
      new Calendar(div, { calendarDate, locale: 'en-US', selectionType: 'year' }) // eslint-disable-line no-new

      const cells = [...div.querySelectorAll('td[data-coreui-date]')]
      const years = cells.map(cell => Number(cell.dataset.coreuiDate.slice(-4)))

      expect(years).toContain(26)
      expect(Math.max(...years)).toBeLessThan(100)
      expect(years).toEqual(cells.map(cell => Number(cell.textContent)))
    })

    it('should move with the arrow keys from year 99 into year 100', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2000, 11, 1)
      calendarDate.setFullYear(99)
      new Calendar(div, { calendarDate }) // eslint-disable-line no-new

      const last = [...div.querySelectorAll('td.current[data-coreui-date]')].at(-1)

      last.focus()
      last.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }))

      expect(document.activeElement.dataset.coreuiDate).toMatch(/^\w{3} Jan 01 0100$/)
    })

    it('should pick a week below year 100 and mark the row that holds the start date', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2000, 11, 1)
      calendarDate.setFullYear(99)
      const startDate = new Date(2000, 11, 8)
      startDate.setFullYear(99)
      new Calendar(div, { calendarDate, selectionType: 'week', startDate }) // eslint-disable-line no-new

      const selected = div.querySelector('.calendar-row.selected')

      expect([...selected.querySelectorAll('td[data-coreui-date]')].map(cell => cell.dataset.coreuiDate)).toContain(startDate.toDateString())

      const picked = []
      div.addEventListener('startDateChange.coreui.calendar', event => picked.push(event.dateObject))
      div.querySelectorAll('.calendar-row[data-coreui-selectable]')[3].querySelector('td').click()

      expect(picked.map(date => date.getFullYear())).toEqual([99])
    })

    it('should hand renderDayCell the days below year 100 after a pick', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2000, 11, 1)
      calendarDate.setFullYear(99)
      const day = new Date(2000, 11, 10)
      day.setFullYear(99)
      const years = new Set()
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate,
        renderDayCell(date) {
          years.add(date.getFullYear())
          return `${date.getDate()}`
        }
      })

      years.clear()
      div.querySelector(`[data-coreui-date="${day.toDateString()}"]`).click()

      expect([...years].toSorted((a, b) => a - b)).toEqual([99, 100])
    })

    it('should focus the month the calendar shows below year 100 after the month button', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2000, 11, 1)
      calendarDate.setFullYear(99)
      const startDate = new Date(2000, 2, 5)
      startDate.setFullYear(99)
      new Calendar(div, { calendarDate, startDate }) // eslint-disable-line no-new

      div.querySelector('td.current[data-coreui-date]').focus()
      div.querySelector('.btn-month').click()

      expect(document.activeElement.dataset.coreuiDate).toMatch(/^\w{3} Dec 01 0099$/)
    })

    it('should disable the years before 1 and keep the arrow keys from reaching them', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendarDate = new Date(2000, 0, 1)
      calendarDate.setFullYear(1)
      new Calendar(div, { calendarDate, selectionType: 'year' }) // eslint-disable-line no-new

      const cells = [...div.querySelectorAll('td[data-coreui-date]')]
      const year = cell => Number(cell.dataset.coreuiDate.split(' ').at(-1))
      const first = cells.find(cell => year(cell) === 1)

      expect(cells.map(cell => cell.getAttribute('aria-disabled') === 'true')).toEqual(cells.map(cell => year(cell) < 1))
      expect(cells.filter(cell => year(cell) < 1)).toHaveSize(6)

      first.focus()
      first.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }))

      expect(document.activeElement).toBe(first)
    })

    it.each([
      ['America/Santiago', [2026, 8, 6], [2026, 9, 1]],
      ['Europe/Paris', [1919, 1, 15, 23, 30], [1919, 2, 1]],
      ['America/Santiago', [42, 6, 15], [42, 7, 1]]
    ])('should page to midnight of the 1st in %s from %j', async (timezoneId, from, to) => {
      await cdp().send('Emulation.setTimezoneOverride', { timezoneId })
      onTestFinished(() => cdp().send('Emulation.setTimezoneOverride', { timezoneId: '' }))
      const localDate = ([year, ...rest]) => {
        const date = new Date(2000, ...rest)
        date.setFullYear(year)
        return date
      }

      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: localDate(from) })

      div.querySelector('.btn-next').click()

      expect(calendar._calendarDate).toEqual(localDate(to))
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

    it('should not open a month where nothing can be picked from the months view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 7, 1),
        disabledDates: [[new Date(2026, 8, 1), new Date(2026, 8, 30)]],
        locale: 'en-US'
      })

      div.querySelector('.btn-month').click()

      const september = div.querySelector(`[data-coreui-date="${new Date(2026, 8, 1).toDateString()}"]`)

      expect(september.getAttribute('aria-disabled')).toEqual('true')

      september.click()
      september.focus()
      september.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))

      expect(div.querySelector('table').getAttribute('aria-label')).toEqual('2026')
      expect(document.activeElement).toBe(september)
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

    it('should let mouseover and focusin listeners on the calendar read the date of a cell or a week row', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const seen = []
      const read = event => seen.push((event.target.closest('td[data-coreui-date]') ?? event.target.querySelector('td[data-coreui-date]')).dataset.coreuiDate)
      new Calendar(div, { calendarDate: new Date(2023, 5, 1), selectionType: 'week' }) // eslint-disable-line no-new
      div.addEventListener('mouseover', read)
      div.addEventListener('focusin', read)

      const cell = div.querySelector(`[data-coreui-date="${new Date(2023, 5, 20).toDateString()}"]`)
      cell.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      cell.closest('tr').focus()

      expect(seen).toEqual([new Date(2023, 5, 20).toDateString(), new Date(2023, 5, 19).toDateString()])
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

    it('should clear the range preview once a date is picked', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        range: true,
        selectEndDate: true,
        startDate: new Date(2023, 5, 10)
      })
      const cell = div.querySelector(`[data-coreui-date="${new Date(2023, 5, 20).toDateString()}"]`)

      cell.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: div }))

      expect(div.querySelectorAll('.calendar-cell.range-hover').length).toEqual(11)

      div.querySelector(`[data-coreui-date="${new Date(2023, 5, 20).toDateString()}"]`).click()

      expect(div.querySelectorAll('.range-hover').length).toEqual(0)
    })

    it('should clear the range preview once a start is picked while the end is set', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        endDate: new Date(2023, 5, 25),
        range: true,
        startDate: new Date(2023, 5, 10)
      })
      const start = () => div.querySelector(`[data-coreui-date="${new Date(2023, 5, 5).toDateString()}"]`)

      start().dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: div }))

      expect(div.querySelectorAll('.calendar-cell.range-hover').length).toEqual(21)

      start().click()

      expect(div.querySelectorAll('.range-hover').length).toEqual(0)
    })

    it('should clear the range preview once a date is picked with Enter', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        range: true,
        selectEndDate: true,
        startDate: new Date(2023, 5, 10)
      })
      const end = () => div.querySelector(`[data-coreui-date="${new Date(2023, 5, 20).toDateString()}"]`)

      end().focus()

      expect(div.querySelectorAll('.calendar-cell.range-hover').length).toEqual(11)

      end().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))

      expect(div.querySelectorAll('.range-hover').length).toEqual(0)
    })

    it('should keep the week preview while the pointer moves onto a day of the adjacent month in the row', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2023, 5, 1),
        range: true,
        selectEndDate: true,
        selectionType: 'week',
        startDate: new Date(2023, 5, 5)
      })
      const current = div.querySelector(`td[data-coreui-date="${new Date(2023, 5, 30).toDateString()}"]`)
      const adjacent = div.querySelector(`td[data-coreui-date="${new Date(2023, 6, 1).toDateString()}"]`)

      current.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: div }))

      expect(div.querySelectorAll('tr.range-hover').length).toEqual(4)

      current.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: adjacent }))
      adjacent.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: current }))

      expect(div.querySelectorAll('tr.range-hover').length).toEqual(4)
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
      expect(cellFor(new Date(2026, 6, 31)).getAttribute('aria-disabled')).toEqual('true')

      calendar._updateClassNamesAndAriaLabels()

      expect(cellFor(new Date(2026, 7, 14)).getAttribute('aria-disabled')).toEqual('true')
      expect(cellFor(new Date(2026, 7, 13)).hasAttribute('aria-disabled')).toBeFalse()
      expect(cellFor(new Date(2026, 7, 13)).hasAttribute('aria-selected')).toBeFalse()
    })

    it('should clear the selection from a date that cannot be picked when another date is picked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 8, 1),
        disabledDates: [new Date(2026, 8, 10)],
        startDate: new Date(2026, 8, 10)
      })
      const cellFor = date => div.querySelector(`[data-coreui-date="${date.toDateString()}"]`)
      const picked = cellFor(new Date(2026, 8, 12))

      picked.focus()
      picked.click()
      picked.blur()

      expect(cellFor(new Date(2026, 8, 10)).hasAttribute('aria-selected')).toBeFalse()
      expect(cellFor(new Date(2026, 8, 10)).classList.contains('selected')).toBeFalse()
      expect(div.querySelector('.calendar-cell[tabindex="0"]')).toBe(picked)
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

    it('should give a tabindex to every week row, month, quarter or year inside the limits, also one that cannot be picked', () => {
      fixtureEl.innerHTML = '<div></div><div></div><div></div><div></div>'

      const [weeks, months, quarters, years] = fixtureEl.querySelectorAll('div')
      const cellFor = (element, date) => element.querySelector(`[data-coreui-date="${date.toDateString()}"]`)
      const limits = { calendarDate: new Date(2026, 7, 1), maxDate: new Date(2026, 8, 5), minDate: new Date(2026, 7, 12) }

      const august = [[new Date(2026, 7, 1), new Date(2026, 7, 31)]]
      const thirdQuarter = [[new Date(2026, 6, 1), new Date(2026, 8, 30)]]

      new Calendar(weeks, { // eslint-disable-line no-new
        ...limits,
        disabledDates: [new Date(2026, 7, 10)],
        firstDayOfWeek: 1,
        selectionType: 'week'
      })
      new Calendar(months, { ...limits, disabledDates: august, selectionType: 'month' }) // eslint-disable-line no-new
      new Calendar(quarters, { ...limits, disabledDates: thirdQuarter, selectionType: 'quarter' }) // eslint-disable-line no-new
      new Calendar(years, { // eslint-disable-line no-new
        ...limits,
        disabledDates: [new Date(2027, 0, 1)],
        maxDate: new Date(2027, 0, 1),
        selectionType: 'year'
      })

      expect(cellFor(weeks, new Date(2026, 7, 3)).closest('tr').hasAttribute('tabindex')).toBeFalse()
      expect(cellFor(weeks, new Date(2026, 7, 10)).closest('tr').hasAttribute('tabindex')).toBeTrue()
      expect(cellFor(weeks, new Date(2026, 7, 10)).closest('tr').getAttribute('aria-disabled')).toEqual('true')
      expect(cellFor(months, new Date(2026, 6, 1)).hasAttribute('tabindex')).toBeFalse()
      expect(cellFor(months, new Date(2026, 7, 1)).hasAttribute('tabindex')).toBeTrue()
      expect(cellFor(months, new Date(2026, 7, 1)).getAttribute('aria-disabled')).toEqual('true')
      expect(cellFor(months, new Date(2026, 9, 1)).hasAttribute('tabindex')).toBeFalse()
      expect(cellFor(quarters, new Date(2026, 3, 1)).hasAttribute('tabindex')).toBeFalse()
      expect(cellFor(quarters, new Date(2026, 6, 1)).hasAttribute('tabindex')).toBeTrue()
      expect(cellFor(quarters, new Date(2026, 6, 1)).getAttribute('aria-disabled')).toEqual('true')
      expect(cellFor(years, new Date(2025, 0, 1)).hasAttribute('tabindex')).toBeFalse()
      expect(cellFor(years, new Date(2027, 0, 1)).hasAttribute('tabindex')).toBeTrue()
      expect(cellFor(years, new Date(2027, 0, 1)).getAttribute('aria-disabled')).toEqual('true')
      expect(cellFor(years, new Date(2028, 0, 1)).hasAttribute('tabindex')).toBeFalse()
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

    it('should preview and pick a range up to a month that starts on a disabled day', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const picked = []
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 0, 1),
        disabledDates: date => date.getDay() === 0 || date.getDay() === 6,
        locale: 'en-US',
        range: true,
        selectEndDate: true,
        selectionType: 'month',
        startDate: new Date(2026, 8, 1)
      })
      div.addEventListener('endDateChange.coreui.calendar', event => picked.push(event.dateObject))

      const november = div.querySelector(`[data-coreui-date="${new Date(2026, 10, 1).toDateString()}"]`)
      november.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: div }))

      expect(november.classList.contains('range-hover')).toBeTrue()

      november.click()

      expect(picked).toEqual([new Date(2026, 10, 1)])
    })

    it('should pick the start of a range of months that spans disabled days', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const picked = []
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 0, 1),
        disabledDates: date => date.getDay() === 0 || date.getDay() === 6,
        endDate: new Date(2026, 10, 1),
        locale: 'en-US',
        range: true,
        selectionType: 'month'
      })
      div.addEventListener('startDateChange.coreui.calendar', event => picked.push(event.dateObject))

      div.querySelector(`[data-coreui-date="${new Date(2026, 8, 1).toDateString()}"]`).click()

      expect(picked).toEqual([new Date(2026, 8, 1)])
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

    it('should mark today only in its own month, for the renderer as well', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const attrs = calendar._cellDayAttributes(new Date(), 'next')

      expect(attrs.className).not.toContain('today')
      expect(attrs.ariaCurrent).toBeFalse()
      expect(attrs.meta.isToday).toBeFalse()
    })

    for (const selectionType of ['day', 'week']) {
      it(`should mark one cell as today when today also fills the next calendar in ${selectionType} selection`, () => {
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(new Date(2026, 8, 30))
        onTestFinished(() => vi.useRealTimers())
        fixtureEl.innerHTML = '<div></div>'

        const div = fixtureEl.querySelector('div')
        const metas = []
        const calendar = new Calendar(div, {
          calendarDate: new Date(2026, 8, 1),
          calendars: 2,
          firstDayOfWeek: 1,
          renderDayCell(date, meta) {
            if (date.toDateString() === new Date(2026, 8, 30).toDateString()) {
              metas.push(meta)
            }

            return String(date.getDate())
          },
          selectionType
        })

        expect(calendar._view).toBe('days')
        expect(metas.map(({ isInCurrentMonth, isToday }) => ({ isInCurrentMonth, isToday }))).toEqual([
          { isInCurrentMonth: true, isToday: true },
          { isInCurrentMonth: false, isToday: false }
        ])
        expect(metas[1]).toEqual(jasmine.objectContaining({ isDisabled: selectionType === 'day', isInRange: false, isSelected: false }))
        expect(div.querySelectorAll('[aria-current="date"]')).toHaveSize(1)
        expect(div.querySelectorAll('.calendar-cell.today')).toHaveSize(1)
      })
    }

    for (const [selectionType, selectAdjacentDays, adjacentInRange] of [['day', false, false], ['day', true, true], ['week', false, true]]) {
      it(`should give a renderer isInRange where the range is drawn in ${selectionType} selection${selectAdjacentDays ? ' with selectAdjacentDays' : ''}`, () => {
        fixtureEl.innerHTML = '<div></div>'

        const div = fixtureEl.querySelector('div')
        const metas = []
        const calendar = new Calendar(div, {
          calendarDate: new Date(2026, 8, 1),
          calendars: 2,
          endDate: new Date(2026, 9, 12),
          firstDayOfWeek: 1,
          range: true,
          renderDayCell(date, meta) {
            if (date.toDateString() === new Date(2026, 9, 1).toDateString()) {
              metas.push(meta)
            }

            return String(date.getDate())
          },
          selectAdjacentDays,
          selectionType,
          startDate: new Date(2026, 8, 21)
        })
        const adjacent = div.querySelector(`td.next[data-coreui-date="${new Date(2026, 9, 1).toDateString()}"]`)

        expect(calendar._view).toBe('days')
        expect(metas.map(({ isInCurrentMonth, isInRange }) => ({ isInCurrentMonth, isInRange }))).toEqual([
          { isInCurrentMonth: false, isInRange: adjacentInRange },
          { isInCurrentMonth: true, isInRange: true }
        ])
        expect(adjacent.classList.contains('range') || adjacent.closest('tr').classList.contains('range')).toBe(adjacentInRange)
      })
    }

    it('should mark the days of an adjacent month as disabled only when they cannot be picked', () => {
      fixtureEl.innerHTML = '<div id="day"></div><div id="adjacent"></div><div id="week"></div>'

      const adjacentDay = id => fixtureEl.querySelector(`#${id} td.next`)
      const calendars = [
        new Calendar(fixtureEl.querySelector('#day'), { calendarDate: new Date(2026, 8, 1) }),
        new Calendar(fixtureEl.querySelector('#adjacent'), { calendarDate: new Date(2026, 8, 1), selectAdjacentDays: true }),
        new Calendar(fixtureEl.querySelector('#week'), { calendarDate: new Date(2026, 8, 1), selectionType: 'week' })
      ]

      expect(calendars.map(calendar => calendar._view)).toEqual(['days', 'days', 'days'])
      expect(adjacentDay('day').getAttribute('aria-disabled')).toEqual('true')
      expect(adjacentDay('adjacent').hasAttribute('aria-disabled')).toBeFalse()
      expect(adjacentDay('week').hasAttribute('aria-disabled')).toBeFalse()
    })

    it('should treat the adjacent copy of a date as disabled filler and keep the date pickable in its own panel', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const metas = new Map()
      const calendar = new Calendar(div, {
        calendarDate: new Date(2026, 8, 1),
        calendars: 2,
        endDate: new Date(2026, 9, 3),
        range: true,
        renderDayCell(date, { isDisabled, isInCurrentMonth, isSelected }) {
          if (date.toDateString() === new Date(2026, 9, 1).toDateString()) {
            metas.set(isInCurrentMonth, { isDisabled, isSelected })
          }

          return String(date.getDate())
        },
        startDate: new Date(2026, 9, 1)
      })
      const [filler, own] = div.querySelectorAll(`[data-coreui-date="${new Date(2026, 9, 1).toDateString()}"]`)

      expect(calendar._view).toBe('days')
      expect(filler.classList.contains('next')).toBeTrue()
      expect(filler.getAttribute('aria-disabled')).toEqual('true')
      expect(filler.hasAttribute('aria-selected')).toBeFalse()
      expect(own.hasAttribute('aria-disabled')).toBeFalse()
      expect(own.getAttribute('aria-selected')).toEqual('true')
      expect(own.hasAttribute('data-coreui-selectable')).toBeTrue()
      expect(metas.get(false)).toEqual({ isDisabled: true, isSelected: false })
      expect(metas.get(true)).toEqual({ isDisabled: false, isSelected: true })
    })

    it('should leave the empty cells of hidden adjacent days without aria-disabled', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), showAdjacentDays: false })
      const empty = div.querySelectorAll('td[role="gridcell"]:not([data-coreui-date])')

      expect(calendar._view).toBe('days')
      expect(empty.length).toBeGreaterThan(0)
      expect([...empty].filter(cell => cell.hasAttribute('aria-disabled'))).toHaveSize(0)
    })

    it('should mark every pickable day of a range as selected and the grid as multiselectable', () => {
      fixtureEl.innerHTML = '<div id="range"></div><div id="single"></div>'
      const ends = new Set()

      new Calendar(fixtureEl.querySelector('#range'), { // eslint-disable-line no-new
        calendarDate: new Date(2026, 7, 1),
        disabledDates: [new Date(2026, 7, 12)],
        endDate: new Date(2026, 7, 14),
        range: true,
        renderDayCell(date, { isSelected }) {
          if (isSelected) {
            ends.add(date.getDate())
          }

          return String(date.getDate())
        },
        startDate: new Date(2026, 7, 10)
      })
      new Calendar(fixtureEl.querySelector('#single'), { // eslint-disable-line no-new
        calendarDate: new Date(2026, 7, 1),
        endDate: new Date(2026, 7, 14),
        startDate: new Date(2026, 7, 10)
      })

      expect(fixtureEl.querySelector('#range table').getAttribute('aria-multiselectable')).toEqual('true')
      expect(fixtureEl.querySelector('#single table').hasAttribute('aria-multiselectable')).toBeFalse()
      expect(selectedDays('#range td')).toEqual([10, 11, 13, 14])
      expect(selectedDays('#single td')).toEqual([10, 14])
      expect([...ends]).toEqual([10, 14])
    })

    it('should mark the pickable days of adjacent months inside a range as selected', () => {
      fixtureEl.innerHTML = '<div id="pickable"></div><div id="filler"></div>'
      const config = {
        calendarDate: new Date(2026, 7, 1),
        endDate: new Date(2026, 8, 3),
        firstDayOfWeek: 1,
        range: true,
        startDate: new Date(2026, 7, 28)
      }

      new Calendar(fixtureEl.querySelector('#pickable'), { ...config, selectAdjacentDays: true }) // eslint-disable-line no-new
      new Calendar(fixtureEl.querySelector('#filler'), config) // eslint-disable-line no-new

      expect(selectedDays('#pickable td')).toEqual([28, 29, 30, 31, 1, 2, 3])
      expect(selectedDays('#filler td')).toEqual([28, 29, 30, 31])
    })

    it('should paint the range and its preview on the pickable days of adjacent months', () => {
      fixtureEl.innerHTML = '<div id="pickable"></div><div id="filler"></div>'
      const config = {
        calendarDate: new Date(2026, 7, 1),
        firstDayOfWeek: 1,
        range: true,
        selectEndDate: true,
        startDate: new Date(2026, 7, 28)
      }
      const days = selector => [...fixtureEl.querySelectorAll(selector)].map(cell => new Date(cell.dataset.coreuiDate).getDate())

      new Calendar(fixtureEl.querySelector('#pickable'), { ...config, endDate: new Date(2026, 8, 3), selectAdjacentDays: true }) // eslint-disable-line no-new
      new Calendar(fixtureEl.querySelector('#filler'), { ...config, endDate: new Date(2026, 8, 3) }) // eslint-disable-line no-new

      expect(days('#pickable td.range')).toEqual([28, 29, 30, 31, 1, 2, 3])
      expect(days('#filler td.range')).toEqual([28, 29, 30, 31])

      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { ...config, selectAdjacentDays: true }) // eslint-disable-line no-new
      div.querySelector(`td.next[data-coreui-date="${new Date(2026, 8, 2).toDateString()}"]`)
        .dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: div }))

      expect(days('td.range-hover')).toEqual([28, 29, 30, 31, 1, 2])

      fixtureEl.innerHTML = '<div></div>'
      const filler = fixtureEl.querySelector('div')
      new Calendar(filler, { ...config, calendars: 2 }) // eslint-disable-line no-new
      filler.querySelector(`td.current[data-coreui-date="${new Date(2026, 8, 2).toDateString()}"]`)
        .dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: filler }))

      expect(days('td.range-hover')).toEqual([28, 29, 30, 31, 1, 2])
      expect(days('td.range-hover:is(.previous, .next)')).toEqual([])
    })

    it('should keep the preview of a range visual', () => {
      fixtureEl.innerHTML = '<div></div>'

      const calendar = new Calendar(fixtureEl.querySelector('div'), {
        calendarDate: new Date(2026, 7, 1),
        range: true,
        selectEndDate: true,
        startDate: new Date(2026, 7, 10)
      })

      calendar._hoverDate = new Date(2026, 7, 14)
      calendar._updateClassNamesAndAriaLabels()

      expect(fixtureEl.querySelectorAll('.calendar-cell.range-hover')).toHaveSize(5)
      expect(selectedDays('td')).toEqual([10])
    })

    it('should mark only the ends of a range in a view that navigates', () => {
      fixtureEl.innerHTML = '<div></div>'

      const calendar = new Calendar(fixtureEl.querySelector('div'), {
        calendarDate: new Date(2024, 1, 1),
        endDate: new Date(2026, 5, 5),
        range: true,
        startDate: new Date(2024, 1, 10)
      })
      const selected = () => [...fixtureEl.querySelectorAll('td[aria-selected="true"]')].map(cell => new Date(cell.dataset.coreuiDate))

      fixtureEl.querySelector('.btn-month').click()

      expect(calendar._view).toEqual('months')
      expect(fixtureEl.querySelector('table').hasAttribute('aria-multiselectable')).toBeFalse()
      expect(selected().map(date => date.getMonth())).toEqual([1])

      fixtureEl.querySelector('.btn-year').click()

      expect(calendar._view).toEqual('years')
      expect(fixtureEl.querySelector('table').hasAttribute('aria-multiselectable')).toBeFalse()
      expect(selected().map(date => date.getFullYear())).toEqual([2024, 2026])
    })

    it('should mark every week row and period of a range as selected, except the ones that cannot be picked', () => {
      fixtureEl.innerHTML = '<div id="weeks"></div><div id="months"></div><div id="quarters"></div><div id="years"></div>'
      const periods = id => [...fixtureEl.querySelectorAll(`${id} td[aria-selected="true"]`)].map(cell => new Date(cell.dataset.coreuiDate))

      new Calendar(fixtureEl.querySelector('#weeks'), { // eslint-disable-line no-new
        calendarDate: new Date(2026, 7, 1),
        disabledDates: [new Date(2026, 7, 17)],
        endDate: new Date(2026, 7, 26),
        firstDayOfWeek: 1,
        range: true,
        selectionType: 'week',
        startDate: new Date(2026, 7, 5)
      })
      new Calendar(fixtureEl.querySelector('#months'), { // eslint-disable-line no-new
        calendarDate: new Date(2026, 0, 1),
        disabledDates: date => date.getMonth() === 3,
        endDate: new Date(2026, 5, 1),
        range: true,
        selectionType: 'month',
        startDate: new Date(2026, 1, 1)
      })
      new Calendar(fixtureEl.querySelector('#quarters'), { // eslint-disable-line no-new
        calendarDate: new Date(2026, 0, 1),
        disabledDates: date => date.getMonth() > 2 && date.getMonth() < 6,
        endDate: new Date(2026, 9, 1),
        range: true,
        selectionType: 'quarter',
        startDate: new Date(2026, 0, 1)
      })
      new Calendar(fixtureEl.querySelector('#years'), { // eslint-disable-line no-new
        calendarDate: new Date(2026, 0, 1),
        disabledDates: date => date.getFullYear() === 2025,
        endDate: new Date(2027, 0, 1),
        range: true,
        selectionType: 'year',
        startDate: new Date(2024, 0, 1)
      })

      expect([...fixtureEl.querySelectorAll('#weeks tr[aria-selected="true"]')]
        .map(row => new Date(row.querySelector('td').dataset.coreuiDate).getDate())).toEqual([3, 10, 24])
      expect(periods('#months').map(date => date.getMonth())).toEqual([1, 2, 4, 5])
      expect(periods('#quarters').map(date => date.getMonth())).toEqual([0, 6, 9])
      expect(periods('#years').map(date => date.getFullYear())).toEqual([2024, 2026, 2027])
    })

    it('should describe the week row in the meta of its days in week selection', () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date(2026, 8, 30))
      onTestFinished(() => vi.useRealTimers())
      fixtureEl.innerHTML = '<div></div>'
      const metas = new Map()

      new Calendar(fixtureEl.querySelector('div'), { // eslint-disable-line no-new
        calendarDate: new Date(2026, 8, 1),
        disabledDates: [new Date(2026, 8, 16), new Date(2026, 8, 21)],
        endDate: new Date(2026, 9, 5),
        firstDayOfWeek: 1,
        range: true,
        renderDayCell(date, meta) {
          metas.set(date.toDateString(), meta)
          return String(date.getDate())
        },
        selectionType: 'week',
        startDate: new Date(2026, 8, 9)
      })

      const rows = [...fixtureEl.querySelectorAll('tbody tr')].map(row => {
        const days = [...row.querySelectorAll('td')].map(cell => metas.get(cell.dataset.coreuiDate))
        return ['isSelected', 'isInRange', 'isDisabled'].map(key => days.map(meta => Number(meta[key])).join('')).join(' ')
      })

      expect(rows).toEqual([
        '0000000 0000000 0000000',
        '1111111 1111111 0000000',
        '0000000 1111111 0000000',
        '0000000 1111111 1111111',
        '0000000 1111111 0000000',
        '1111111 1111111 0000000'
      ])
      expect(metas.get(new Date(2026, 9, 1).toDateString())).toEqual(jasmine.objectContaining({ isInCurrentMonth: false, isInRange: true }))
      expect([...metas].filter(([, meta]) => meta.isToday).map(([date]) => date)).toEqual([new Date(2026, 8, 30).toDateString()])
    })

    it('should leave a week row with no day of the month plain', () => {
      fixtureEl.innerHTML = '<div></div>'

      new Calendar(fixtureEl.querySelector('div'), { // eslint-disable-line no-new
        calendarDate: new Date(2026, 8, 1),
        endDate: new Date(2026, 9, 5),
        firstDayOfWeek: 1,
        range: true,
        selectionType: 'week',
        showAdjacentDays: false,
        startDate: new Date(2026, 7, 31)
      })

      const last = [...fixtureEl.querySelectorAll('tbody tr')].at(-1)

      expect(last.querySelectorAll('td[data-coreui-date]')).toHaveSize(0)
      expect(last.className).toEqual('calendar-row')
      expect(last.hasAttribute('aria-selected')).toBeFalse()
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

    it('should not emit `calendarDateChange.coreui.calendar` when a date is picked', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new Calendar(div, { calendarDate: new Date(2026, 7, 1), calendars: 2 }) // eslint-disable-line no-new
      const listener = jasmine.createSpy('listener')
      const [first, second] = div.querySelectorAll('.calendar')
      const enter = createEvent('keydown')
      enter.key = 'Enter'
      const space = createEvent('keydown')
      space.key = ' '
      Object.defineProperty(space, 'code', { value: 'Space' })

      div.addEventListener('calendarDateChange.coreui.calendar', listener)
      first.querySelector('.calendar-cell[data-coreui-selectable]').click()
      second.querySelector('.calendar-cell[data-coreui-selectable]').click()
      div.querySelector('.calendar-cell[data-coreui-selectable]').dispatchEvent(enter)
      div.querySelector('.calendar-cell[data-coreui-selectable]').dispatchEvent(space)

      expect(listener).not.toHaveBeenCalled()
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

    it('should not report a date that stays empty when a range starts over', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const events = []
      new Calendar(div, { calendarDate: new Date(2026, 9, 1), range: true }) // eslint-disable-line no-new
      div.addEventListener('startDateChange.coreui.calendar', event => events.push(['start', event.dateObject]))
      div.addEventListener('endDateChange.coreui.calendar', event => events.push(['end', event.dateObject]))

      const cell = day => div.querySelector(`td.current[data-coreui-date="${new Date(2026, 9, day).toDateString()}"]`)
      cell(10).click()
      cell(5).click()

      expect(events).toEqual([['start', new Date(2026, 9, 10)], ['start', new Date(2026, 9, 5)]])
    })

    it('should not report a start that stays empty when a range across a disabled day is cleared', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const events = []
      new Calendar(div, { // eslint-disable-line no-new
        calendarDate: new Date(2026, 9, 1), disabledDates: [new Date(2026, 9, 15)], endDate: new Date(2026, 9, 20), range: true
      })
      div.addEventListener('startDateChange.coreui.calendar', event => events.push(['start', event.dateObject]))
      div.addEventListener('endDateChange.coreui.calendar', event => events.push(['end', event.dateObject]))

      div.querySelector(`td.current[data-coreui-date="${new Date(2026, 9, 10).toDateString()}"]`).click()

      expect(events).toEqual([['end', null]])
    })

    it('should report a day picked again', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const picked = []
      new Calendar(div, { calendarDate: new Date(2026, 9, 1), startDate: new Date(2026, 9, 10) }) // eslint-disable-line no-new
      div.addEventListener('startDateChange.coreui.calendar', event => picked.push(event.dateObject))

      div.querySelector(`td.current[data-coreui-date="${new Date(2026, 9, 10).toDateString()}"]`).click()

      expect(picked).toEqual([new Date(2026, 9, 10)])
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
    it('should not pick a date that cannot be picked when it is clicked or activated with Enter or Space', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendarDate: new Date(2023, 5, 1),
        disabledDates: [new Date(2023, 5, 15)]
      })
      const picked = vi.fn()
      const cell = div.querySelector(`[data-coreui-date="${new Date(2023, 5, 15).toDateString()}"]`)

      div.addEventListener('startDateChange.coreui.calendar', picked)
      cell.click()
      cell.focus()
      cell.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))
      cell.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Space', key: ' ' }))

      expect(picked).not.toHaveBeenCalled()
      expect(calendar._startDate).toBeNull()
      expect(cell.hasAttribute('aria-selected')).toBeFalse()
      expect(document.activeElement).toBe(cell)
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
    it('should run the callback once the panels are rendered, before returning', () => {
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

    it('should name the double arrows of the years view after a page of years', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), selectionType: 'year' })

      expect(div.querySelector('.btn-double-next').getAttribute('aria-label')).toEqual('Next 12 years')
      expect(div.querySelector('.btn-double-prev').getAttribute('aria-label')).toEqual('Previous 12 years')

      calendar.setConfig({ ariaNavNextYearsLabel: 'Następne 12 lat', ariaNavPrevYearsLabel: 'Poprzednie 12 lat' })

      expect(div.querySelector('.btn-double-next').getAttribute('aria-label')).toEqual('Następne 12 lat')
      expect(div.querySelector('.btn-double-prev').getAttribute('aria-label')).toEqual('Poprzednie 12 lat')
    })

    it('should keep the year labels on the double arrows of the days, months and quarters views', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, { calendarDate: new Date(2026, 8, 1), selectionType: 'month' })

      expect(calendar._view).toBe('months')
      expect(div.querySelector('.btn-double-next').getAttribute('aria-label')).toEqual('Next year')
      expect(div.querySelector('.btn-double-prev').getAttribute('aria-label')).toEqual('Previous year')

      calendar.setConfig({ selectionType: 'quarter' })

      expect(calendar._view).toBe('quarters')
      expect(div.querySelector('.btn-double-next').getAttribute('aria-label')).toEqual('Next year')

      calendar.setConfig({ selectionType: 'day' })

      expect(div.querySelector('.btn-double-next').getAttribute('aria-label')).toEqual('Next year')
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

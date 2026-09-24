
import { onTestFinished } from 'vitest'
import { cdp } from 'vitest/browser'
import {
  convertIsoWeekToDate,
  convertToDateObject,
  createDateFormatter,
  createGroupsInArray,
  getCalendarDate,
  getDateBySelectionType,
  getISOWeekNumberAndYear,
  getLocalDateFromString,
  getMonthsNames,
  getSelectableDates,
  getTabStop,
  getYears,
  getMonthDetails,
  isDateDisabled,
  isDateInRange,
  isDateSelected,
  isDisableDateInRange,
  isPeriodDisabled,
  isPeriodInRange,
  isPeriodSelected,
  isSameInstantAs,
  isSameDateAs,
  isToday,
  parseYearSmart,
  removeTimeFromDate,
  setTimeFromDate
} from '../../../src/util/calendar.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('Calendar Utilities', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('convertIsoWeekToDate', () => {
    it('should convert a valid ISO week string to the corresponding Monday', () => {
      const result = convertIsoWeekToDate('2023W05')
      // 2023-W05 starts on Monday, 2023-01-30
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(30)
    })

    it('should handle lowercase "w" in ISO string', () => {
      const result = convertIsoWeekToDate('2023w10')
      // 2023-W10 starts on Monday, 2023-03-06
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(2) // March
      expect(result.getDate()).toBe(6)
    })

    it('should return an Invalid Date if the input string is malformed', () => {
      const result = convertIsoWeekToDate('abcdW01')
      // Some browsers might interpret "NaN" year. Let's check if it's not a valid date
      expect(Number.isNaN(result.getTime())).toBeTrue()
    })
  })

  describe('convertToDateObject', () => {
    it.each([null, undefined])('should return null for %s', value => {
      expect(convertToDateObject(value, 'day')).toBeNull()
      expect(convertToDateObject(value, 'week')).toBeNull()
    })

    it('should return the same Date object if date is already a Date', () => {
      const originalDate = new Date(2023, 0, 1)
      const result = convertToDateObject(originalDate, 'day')
      expect(result).toBe(originalDate)
    })

    it('should return null instead of an Invalid Date for a week string it cannot read', () => {
      expect(convertToDateObject('not a date', 'week')).toBeNull()
    })

    it('should return null for invalid Date object', () => {
      const invalidDate = new Date('invalid')
      const result = convertToDateObject(invalidDate, 'day')
      expect(result).toBeNull()
    })

    it('should parse a string date for "day" selectionType with default locale', () => {
      const result = convertToDateObject('2/15/2023', 'day')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(15)
    })

    it('should parse a string date for "day" selectionType with custom locale', () => {
      const result = convertToDateObject('15.2.2023', 'day', 'de-DE')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(15)
    })

    it('should parse a string date with time when includeTime is true', () => {
      const result = convertToDateObject('2/15/2023, 2:30:45 PM', 'day', 'en-US', true)
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(15)
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
      expect(result.getSeconds()).toBe(45)
    })

    it('should call convertIsoWeekToDate for "week" selectionType', () => {
      const result = convertToDateObject('2023W12', 'week')
      // Check if we got a Monday in the 12th ISO week
      // 2023-W12 starts on Monday, 2023-03-20
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(20)
    })

    it('should parse month string for "month" selectionType', () => {
      const result = convertToDateObject('2023-06', 'month')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(5) // June
      expect(result.getDate()).toBe(1)
    })

    it('should parse year string for "year" selectionType', () => {
      const result = convertToDateObject('2025', 'year')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(1)
    })
  })

  describe('convertToDateObject with day strings', () => {
    it.each([
      ['2/16/2022', 'en-US', [2022, 1, 16]],
      ['02/16/2022', 'en-US', [2022, 1, 16]],
      ['5/3/2022', 'en-US', [2022, 4, 3]],
      ['2/29/2024', 'en-US', [2024, 1, 29]],
      ['12/31/2022', 'en-US', [2022, 11, 31]],
      ['1/31/2022', 'en-US', [2022, 0, 31]],
      ['1/1/1900', 'en-US', [1900, 0, 1]],
      ['12/31/2099', 'en-US', [2099, 11, 31]],
      ['16/2/2022', 'en-GB', [2022, 1, 16]],
      ['2/16/2022', 'en_US', [2022, 1, 16]]
    ])('should read %s in %s as local midnight', (value, locale, [year, month, day]) => {
      expect(convertToDateObject(value, 'day', locale)).toEqual(new Date(year, month, day))
    })

    it.each(['', '   ', 'not-a-date', '2/16', '2/32/2022', '13/16/2022'])('should return null for %j', value => {
      expect(convertToDateObject(value, 'day', 'en-US')).toBeNull()
    })

    it('should keep the day when daylight saving time starts at midnight', async () => {
      await cdp().send('Emulation.setTimezoneOverride', { timezoneId: 'America/Santiago' })
      onTestFinished(() => cdp().send('Emulation.setTimezoneOverride', { timezoneId: '' }))

      const result = convertToDateObject('9/6/2026', 'day', 'en-US')

      expect([result.getFullYear(), result.getMonth(), result.getDate()]).toEqual([2026, 8, 6])
    })

    it.each(['2026-Q3', '2026Q3', '2026 Q3'])('should read the quarter string %s as the first day of the quarter', value => {
      expect(convertToDateObject(value, 'quarter')).toEqual(new Date(2026, 6, 1))
    })

    it.each(['2026Q5', 'q3 2026'])('should return null for the quarter string %s', value => {
      expect(convertToDateObject(value, 'quarter')).toBeNull()
    })

    it('should read an ISO week with a dash as the Monday of the week', () => {
      expect(convertToDateObject('2022-W07', 'week')).toEqual(new Date(2022, 1, 14))
    })

    it('should read the last month of the year as its first day', () => {
      expect(convertToDateObject('2022-12', 'month')).toEqual(new Date(2022, 11, 1))
    })
  })

  describe('createGroupsInArray', () => {
    it('should create groups of arrays', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      const result = createGroupsInArray(arr, 3)
      // We have 9 items, grouping into 3 => roughly: [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
      expect(result).toHaveSize(3)
      expect(result[0]).toEqual([1, 2, 3])
      expect(result[1]).toEqual([4, 5, 6])
      expect(result[2]).toEqual([7, 8, 9])
    })

    it('should handle an empty array', () => {
      const result = createGroupsInArray([], 2)
      expect(result).toEqual([[], []])
    })
  })

  describe('getCalendarDate', () => {
    const baseDate = new Date(2023, 0, 15) // Jan 15, 2023

    it('should add month if view is "days"', () => {
      const result = getCalendarDate(baseDate, 1, 'days')
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(1)
    })

    it('should add year if view is "months"', () => {
      const result = getCalendarDate(baseDate, 2, 'months')
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(1)
    })

    it('should add 12 * order years if view is "years"', () => {
      const result = getCalendarDate(baseDate, -1, 'years')
      expect(result.getFullYear()).toBe(2023 - 12)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(1)
    })

    it('should return the original date if order is 0', () => {
      const result = getCalendarDate(baseDate, 0, 'days')
      expect(result).toBe(baseDate)
    })
  })

  describe('getDateBySelectionType', () => {
    it('should return null if date is null', () => {
      expect(getDateBySelectionType(null, 'day')).toBeNull()
    })

    it('should return an ISO week string if selectionType is "week"', () => {
      // 2023-03-13 is Monday of ISO week 11
      const date = new Date(2023, 2, 13)
      const result = getDateBySelectionType(date, 'week')
      expect(result).toBe('2023W11')
    })

    it('should return "YYYY-MM" if selectionType is "month"', () => {
      const date = new Date(2023, 5, 10) // 2023-06-10
      const result = getDateBySelectionType(date, 'month')
      expect(result).toBe('2023-06')
    })

    it('should return "YYYY" if selectionType is "year"', () => {
      const date = new Date(2030, 0, 1)
      const result = getDateBySelectionType(date, 'year')
      expect(result).toBe('2030')
    })

    it('should return the Date object if selectionType is "day"', () => {
      const date = new Date(2025, 10, 20)
      const result = getDateBySelectionType(date, 'day')
      expect(result).toBe(date)
    })
  })

  describe('getMonthsNames', () => {
    it('should return an array of 12 month names (short)', () => {
      const result = getMonthsNames('en-US', 'short')
      expect(result).toHaveSize(12)
      expect(result[0]).toBeDefined()
    })

    it('should return an array of 12 month names (long)', () => {
      const result = getMonthsNames('en-US', 'long')
      expect(result).toHaveSize(12)
      expect(result[0]).toBeDefined()
    })

    it('should name every month the way the locale does', () => {
      for (const [locale, format] of [['en-US', 'short'], ['pl-PL', 'long'], ['ar-EG', 'long'], ['ja-JP', 'numeric']]) {
        const expected = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString(locale, { month: format }))
        expect(getMonthsNames(locale, format)).toEqual(expected)
      }
    })
  })

  describe('createDateFormatter', () => {
    it('should write a date the way Intl.DateTimeFormat does', () => {
      const format = createDateFormatter()
      const date = new Date(2026, 6, 14)

      expect(format(date, 'en-US', { month: 'long', year: 'numeric' })).toBe(new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date))
      expect(format(date, 'de-DE')).toBe(new Intl.DateTimeFormat('de-DE').format(date))
    })

    it('should build one formatter per locale and options', () => {
      const NativeDateTimeFormat = Intl.DateTimeFormat
      const format = createDateFormatter()
      let built = 0

      Intl.DateTimeFormat = function (...args) {
        built++
        return new NativeDateTimeFormat(...args)
      }

      try {
        for (let day = 1; day <= 28; day++) {
          format(new Date(2026, 1, day), 'en-US', { day: 'numeric' })
          format(new Date(2026, 1, day), 'en-US', { weekday: 'long' })
          format(new Date(2026, 1, day), 'pl-PL', { day: 'numeric' })
        }
      } finally {
        Intl.DateTimeFormat = NativeDateTimeFormat
      }

      expect(built).toBe(3)
    })

    it('should write an invalid date the way toLocaleDateString does', () => {
      const invalid = new Date(Number.NaN)

      expect(createDateFormatter()(invalid, 'en-US')).toBe(invalid.toLocaleDateString('en-US'))
    })
  })

  describe('getYears', () => {
    it('should generate years around a given center year', () => {
      const result = getYears(2020, 2)
      // range=2 => 4 total => 2020-2 => 2018, 2019, 2020, 2021
      expect(result).toEqual([2018, 2019, 2020, 2021])
    })
  })

  describe('getMonthDetails', () => {
    it('should return an array of weeks with day objects', () => {
      const result = getMonthDetails(2023, 0, 1) // January 2023, firstDayOfWeek=1 (Monday)
      // Typically 6 weeks for a 42-day calendar layout
      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)
      // Each element in the array is { weekNumber, days: [ ... ] }
      expect(result[0].days).toBeInstanceOf(Array)
      // Each day is { date: ..., month: 'previous'|'current'|'next' }
    })
  })

  describe('getTabStop', () => {
    const target = (date, { adjacent = false, end = date, selected = false } = {}) => ({
      adjacent, date, end, position: date, selected
    })

    it('should take the selected target', () => {
      const targets = [target(new Date(2026, 6, 1)), target(new Date(2026, 6, 20), { selected: true })]

      expect(getTabStop(targets, new Date(2026, 6, 2), false)).toBe(new Date(2026, 6, 20).getTime())
    })

    it('should take the target closest to the anchor and skip days of adjacent months', () => {
      const targets = [
        target(new Date(2026, 5, 30), { adjacent: true }),
        target(new Date(2026, 6, 3)),
        target(new Date(2026, 6, 10))
      ]

      expect(getTabStop(targets, new Date(2026, 5, 29), false)).toBe(new Date(2026, 6, 3).getTime())
      expect(getTabStop(targets, new Date(2026, 6, 8), false)).toBe(new Date(2026, 6, 10).getTime())
    })

    it('should measure a row from its first to its last day', () => {
      const targets = [
        target(new Date(2026, 5, 29), { adjacent: true, end: new Date(2026, 6, 5) }),
        target(new Date(2026, 6, 6), { end: new Date(2026, 6, 12) })
      ]

      expect(getTabStop(targets, new Date(2026, 6, 4), true)).toBe(new Date(2026, 5, 29).getTime())
    })

    it('should let a row of the panel\'s own month win a tie', () => {
      const adjacent = target(new Date(2026, 5, 30), { adjacent: true })
      const own = target(new Date(2026, 6, 2))

      expect(getTabStop([adjacent, own], new Date(2026, 6, 1), true)).toBe(own.date.getTime())
      expect(getTabStop([own, adjacent], new Date(2026, 6, 1), true)).toBe(own.date.getTime())
    })

    it('should take the first target without an anchor', () => {
      const targets = [target(new Date(2026, 6, 3)), target(new Date(2026, 6, 10))]

      expect(getTabStop(targets, null, false)).toBe(new Date(2026, 6, 3).getTime())
    })

    it('should return undefined without targets', () => {
      expect(getTabStop([], new Date(2026, 6, 1), false)).toBeUndefined()
    })
  })

  describe('getSelectableDates', () => {
    it('should find the selectable rows and cells in document order', () => {
      fixtureEl.innerHTML = [
        '<table><tbody>',
        '<tr><td data-coreui-selectable>1</td><td>2</td></tr>',
        '<tr data-coreui-selectable><td>3</td><td data-coreui-selectable>4</td></tr>',
        '</tbody></table>'
      ].join('')

      expect(getSelectableDates(fixtureEl).map(element => element.tagName + (element.textContent || ''))).toEqual(['TD1', 'TR34', 'TD4'])
    })

    it('should use the given selector', () => {
      fixtureEl.innerHTML = '<table><tbody><tr><td class="a">1</td><td>2</td><td class="a">3</td></tr></tbody></table>'

      expect(getSelectableDates(fixtureEl, 'td.a').map(element => element.textContent)).toEqual(['1', '3'])
    })
  })

  describe('getISOWeekNumberAndYear', () => {
    it('should return correct ISO week number', () => {
      // 2023-01-01 is a Sunday => last week of 2022 in ISO
      const date = new Date(2023, 0, 1)
      const week = getISOWeekNumberAndYear(date)
      // The ISO week for Sunday 2023-01-01 is typically 52 or 52/53 from the previous year
      // We'll just ensure it's not 1
      expect(week.weekNumber).not.toBe(1)
    })

    it('should properly handle mid-year dates', () => {
      // Monday 2023-06-05 => ISO week 23
      const date = new Date(2023, 5, 5)
      const week = getISOWeekNumberAndYear(date)
      expect(week.weekNumber).toBe(23)
    })

    it('should handle years below 100 without the 19xx date mapping', () => {
      const date = new Date(2000, 0, 1)
      date.setFullYear(22, 5, 15)
      expect(getISOWeekNumberAndYear(date)).toEqual({ weekNumber: 24, year: 22 })

      date.setFullYear(99, 0, 15)
      expect(getISOWeekNumberAndYear(date)).toEqual({ weekNumber: 3, year: 99 })
    })
  })

  describe('isDateDisabled', () => {
    it('should return true if date < min', () => {
      const date = new Date(2023, 0, 1)
      const min = new Date(2023, 0, 2)
      expect(isDateDisabled(date, min, null, undefined)).toBeTrue()
    })

    it('should return true if date > max', () => {
      const date = new Date(2023, 0, 10)
      const max = new Date(2023, 0, 5)
      expect(isDateDisabled(date, null, max, undefined)).toBeTrue()
    })

    it('should return false if within min/max and no disabledDates provided', () => {
      const date = new Date(2023, 0, 5)
      const min = new Date(2023, 0, 1)
      const max = new Date(2023, 0, 10)
      expect(isDateDisabled(date, min, max, undefined)).toBeFalse()
    })

    it('should return true if disabledDates is a function returning true', () => {
      const date = new Date(2023, 0, 5)
      const fn = d => d.getDate() === 5
      expect(isDateDisabled(date, null, null, fn)).toBeTrue()
    })

    it('should return true if disabledDates is a single Date matching the date', () => {
      const date = new Date(2023, 1, 1)
      const disabled = new Date(2023, 1, 1)
      expect(isDateDisabled(date, null, null, disabled)).toBeTrue()
    })

    it('should return true if date is in a disabled range', () => {
      const date = new Date(2023, 2, 5)
      const disabled = [[new Date(2023, 2, 1), new Date(2023, 2, 10)]]
      expect(isDateDisabled(date, null, null, disabled)).toBeTrue()
    })
  })

  describe('isDateInRange', () => {
    it('should return true if date is between start and end', () => {
      const date = new Date(2023, 0, 5)
      const start = new Date(2023, 0, 1)
      const end = new Date(2023, 0, 10)
      expect(isDateInRange(date, start, end)).toBeTrue()
    })

    it('should return false if date is outside start/end', () => {
      const date = new Date(2023, 0, 15)
      const start = new Date(2023, 0, 1)
      const end = new Date(2023, 0, 10)
      expect(isDateInRange(date, start, end)).toBeFalse()
    })
  })

  describe('isDateSelected', () => {
    it('should be true if date equals start', () => {
      const date = new Date(2023, 0, 5)
      const start = new Date(2023, 0, 5)
      expect(isDateSelected(date, start, null)).toBeTrue()
    })

    it('should be true if date equals end', () => {
      const date = new Date(2023, 0, 5)
      const end = new Date(2023, 0, 5)
      expect(isDateSelected(date, null, end)).toBeTrue()
    })

    it('should be false otherwise', () => {
      const date = new Date(2023, 0, 5)
      const start = new Date(2023, 0, 1)
      const end = new Date(2023, 0, 2)
      expect(isDateSelected(date, start, end)).toBeFalse()
    })
  })

  describe('isDisableDateInRange', () => {
    it('should return false if range does not contain a disabled date', () => {
      const start = new Date(2023, 0, 1)
      const end = new Date(2023, 0, 3)
      const disabledDates = [new Date(2023, 0, 5)]
      expect(isDisableDateInRange(start, end, disabledDates)).toBeFalse()
    })

    it('should return true if range contains a disabled date', () => {
      const start = new Date(2023, 0, 1)
      const end = new Date(2023, 0, 5)
      const disabledDates = [new Date(2023, 0, 3)]
      expect(isDisableDateInRange(start, end, disabledDates)).toBeTrue()
    })
  })

  describe('isPeriodDisabled with months', () => {
    it('should return true if month < min', () => {
      const date = new Date(2023, 0, 1)
      const min = new Date(2023, 1, 1) // Feb
      expect(isPeriodDisabled(date, 'months', min, null, undefined)).toBeTrue()
    })

    it('should return true if month > max', () => {
      const date = new Date(2023, 5, 1)
      const max = new Date(2023, 3, 1) // April
      expect(isPeriodDisabled(date, 'months', null, max, undefined)).toBeTrue()
    })

    it('should return false if no disabledDates and within min/max', () => {
      const date = new Date(2023, 2, 1)
      const min = new Date(2023, 0, 1)
      const max = new Date(2023, 5, 1)
      expect(isPeriodDisabled(date, 'months', min, max, undefined)).toBeFalse()
    })

    it('should return true if disabledDates disables every day of the month', () => {
      expect(isPeriodDisabled(new Date(2023, 2, 1), 'months', null, null, () => true)).toBeTrue()
    })

    it('should return false if disabledDates leaves any day of the month enabled', () => {
      const weekends = date => date.getDay() === 0 || date.getDay() === 6
      expect(isPeriodDisabled(new Date(2023, 2, 1), 'months', null, null, weekends)).toBeFalse()
    })

    it('should return true if the month lies entirely outside min/max', () => {
      expect(isPeriodDisabled(new Date(2023, 2, 1), 'months', new Date(2023, 3, 1), null, () => false)).toBeTrue()
      expect(isPeriodDisabled(new Date(2023, 2, 1), 'months', null, new Date(2023, 1, 1), () => false)).toBeTrue()
    })

    it('should return false if any day inside min/max is enabled', () => {
      const onlyMarch20 = date => date.getDate() !== 20
      expect(isPeriodDisabled(new Date(2023, 2, 1), 'months', new Date(2023, 2, 15), null, onlyMarch20)).toBeFalse()
      expect(isPeriodDisabled(new Date(2023, 2, 1), 'months', null, new Date(2023, 2, 10), onlyMarch20)).toBeTrue()
    })
  })

  describe('isPeriodSelected with months', () => {
    it('should return true if date matches start month', () => {
      const date = new Date(2023, 2, 10) // March
      const start = new Date(2023, 2, 1) // March
      expect(isPeriodSelected(date, 'months', start, null)).toBeTrue()
    })

    it('should return true if date matches end month', () => {
      const date = new Date(2023, 2, 10) // March
      const end = new Date(2023, 2, 12) // March
      expect(isPeriodSelected(date, 'months', null, end)).toBeTrue()
    })

    it('should return false otherwise', () => {
      const date = new Date(2023, 3, 1)
      const start = new Date(2023, 2, 1)
      const end = new Date(2023, 2, 10)
      expect(isPeriodSelected(date, 'months', start, end)).toBeFalse()
    })
  })

  describe('isPeriodInRange with months', () => {
    it('should return true if month is in range of start and end', () => {
      const date = new Date(2023, 2, 10)
      const start = new Date(2023, 1, 1)
      const end = new Date(2023, 3, 1)
      expect(isPeriodInRange(date, 'months', start, end)).toBeTrue()
    })

    it('should return false if month is out of range', () => {
      const date = new Date(2023, 5, 10)
      const start = new Date(2023, 1, 1)
      const end = new Date(2023, 3, 1)
      expect(isPeriodInRange(date, 'months', start, end)).toBeFalse()
    })
  })

  describe('isPeriodDisabled with quarters', () => {
    it('should return true if quarter is outside min/max', () => {
      expect(isPeriodDisabled(new Date(2023, 0, 1), 'quarters', new Date(2023, 3, 1), null, undefined)).toBeTrue()
      expect(isPeriodDisabled(new Date(2023, 6, 1), 'quarters', null, new Date(2023, 5, 30), undefined)).toBeTrue()
    })

    it('should return false if no disabledDates and within min/max', () => {
      expect(isPeriodDisabled(new Date(2023, 3, 1), 'quarters', new Date(2023, 0, 1), new Date(2023, 11, 31), undefined)).toBeFalse()
    })

    it('should return true if disabledDates disables every day of the quarter', () => {
      expect(isPeriodDisabled(new Date(2023, 3, 1), 'quarters', null, null, () => true)).toBeTrue()
    })

    it('should return false if disabledDates leaves any day of the quarter enabled', () => {
      const weekends = date => date.getDay() === 0 || date.getDay() === 6
      expect(isPeriodDisabled(new Date(2023, 3, 1), 'quarters', null, null, weekends)).toBeFalse()
    })

    it('should return true if the quarter lies entirely outside min/max', () => {
      expect(isPeriodDisabled(new Date(2023, 3, 1), 'quarters', new Date(2023, 6, 1), null, () => false)).toBeTrue()
    })

    it('should return false if any day inside min/max is enabled', () => {
      const onlyJune15 = date => !(date.getMonth() === 5 && date.getDate() === 15)
      expect(isPeriodDisabled(new Date(2023, 3, 1), 'quarters', new Date(2023, 5, 1), null, onlyJune15)).toBeFalse()
      expect(isPeriodDisabled(new Date(2023, 3, 1), 'quarters', null, new Date(2023, 4, 31), onlyJune15)).toBeTrue()
    })
  })

  describe('isSameInstantAs', () => {
    it('should return true for the same moment', () => {
      expect(isSameInstantAs(new Date(2026, 6, 14, 9, 30), new Date(2026, 6, 14, 9, 30))).toBe(true)
    })

    it('should return false for the same day at another time', () => {
      expect(isSameInstantAs(new Date(2026, 6, 14, 9, 30), new Date(2026, 6, 14, 9, 30, 0, 1))).toBe(false)
    })

    it('should return true when both are null and false when one is', () => {
      expect(isSameInstantAs(null, null)).toBe(true)
      expect(isSameInstantAs(new Date(2026, 6, 14), null)).toBe(false)
      expect(isSameInstantAs(null, new Date(2026, 6, 14))).toBe(false)
    })
  })

  describe('isSameDateAs', () => {
    it('should return true if both dates have same day, month, year', () => {
      const d1 = new Date(2023, 0, 1)
      const d2 = new Date(2023, 0, 1)
      expect(isSameDateAs(d1, d2)).toBeTrue()
    })

    it('should return false otherwise', () => {
      const d1 = new Date(2023, 0, 1)
      const d2 = new Date(2023, 0, 2)
      expect(isSameDateAs(d1, d2)).toBeFalse()
    })

    it('should return true if both are null', () => {
      expect(isSameDateAs(null, null)).toBeTrue()
    })
  })

  describe('isToday', () => {
    it('should return true if date is today', () => {
      const today = new Date()
      expect(isToday(today)).toBeTrue()
    })

    it('should return false if not today', () => {
      const notToday = new Date(2000, 0, 1)
      expect(isToday(notToday)).toBeFalse()
    })
  })

  describe('isPeriodDisabled with years', () => {
    it('should return true if year < minYear', () => {
      const date = new Date(2022, 0, 1)
      const min = new Date(2023, 0, 1)
      expect(isPeriodDisabled(date, 'years', min, null, undefined)).toBeTrue()
    })

    it('should return true if year > maxYear', () => {
      const date = new Date(2025, 0, 1)
      const max = new Date(2024, 0, 1)
      expect(isPeriodDisabled(date, 'years', null, max, undefined)).toBeTrue()
    })

    it('should return false if year in range', () => {
      const date = new Date(2023, 5, 1)
      const min = new Date(2023, 0, 1)
      const max = new Date(2023, 11, 31)
      expect(isPeriodDisabled(date, 'years', min, max, undefined)).toBeFalse()
    })

    it('should return true if disabledDates disables every day of the year', () => {
      expect(isPeriodDisabled(new Date(2023, 0, 1), 'years', null, null, () => true)).toBeTrue()
    })

    it('should return false if disabledDates leaves any day of the year enabled', () => {
      const weekends = date => date.getDay() === 0 || date.getDay() === 6
      expect(isPeriodDisabled(new Date(2023, 0, 1), 'years', null, null, weekends)).toBeFalse()
    })

    it('should return true if the year lies entirely outside min/max', () => {
      expect(isPeriodDisabled(new Date(2023, 0, 1), 'years', new Date(2024, 0, 1), null, () => false)).toBeTrue()
    })

    it('should return false if any day inside min/max is enabled', () => {
      const onlyDecember24 = date => !(date.getMonth() === 11 && date.getDate() === 24)
      expect(isPeriodDisabled(new Date(2023, 0, 1), 'years', new Date(2023, 11, 1), null, onlyDecember24)).toBeFalse()
      expect(isPeriodDisabled(new Date(2023, 0, 1), 'years', null, new Date(2023, 10, 30), onlyDecember24)).toBeTrue()
    })
  })

  describe('isPeriodSelected with years', () => {
    it('should return true if date year matches start year', () => {
      const date = new Date(2023, 0, 1)
      const start = new Date(2023, 5, 1)
      expect(isPeriodSelected(date, 'years', start, null)).toBeTrue()
    })

    it('should return true if date year matches end year', () => {
      const date = new Date(2023, 0, 1)
      const end = new Date(2023, 10, 1)
      expect(isPeriodSelected(date, 'years', null, end)).toBeTrue()
    })

    it('should return false otherwise', () => {
      const date = new Date(2023, 0, 1)
      const start = new Date(2022, 0, 1)
      const end = new Date(2024, 0, 1)
      // Even though 2023 is between 2022 and 2024, it must match exactly
      expect(isPeriodSelected(date, 'years', start, end)).toBeFalse()
    })
  })

  describe('isPeriodInRange with years', () => {
    it('should return true if date year is between start year and end year', () => {
      const date = new Date(2023, 5, 1)
      const start = new Date(2022, 0, 1)
      const end = new Date(2024, 0, 1)
      expect(isPeriodInRange(date, 'years', start, end)).toBeTrue()
    })

    it('should return false if date year is out of range', () => {
      const date = new Date(2025, 5, 1)
      const start = new Date(2022, 0, 1)
      const end = new Date(2024, 0, 1)
      expect(isPeriodInRange(date, 'years', start, end)).toBeFalse()
    })
  })

  describe('removeTimeFromDate', () => {
    it('should return a new Date object with hours, minutes, seconds, ms set to 0', () => {
      const original = new Date(2023, 0, 10, 12, 30, 45, 999)
      const cleared = removeTimeFromDate(original)

      expect(cleared).not.toBe(original) // should be a distinct object
      expect(cleared.getFullYear()).toBe(2023)
      expect(cleared.getMonth()).toBe(0)
      expect(cleared.getDate()).toBe(10)
      expect(cleared.getHours()).toBe(0)
      expect(cleared.getMinutes()).toBe(0)
      expect(cleared.getSeconds()).toBe(0)
      expect(cleared.getMilliseconds()).toBe(0)
    })
  })

  describe('setTimeFromDate', () => {
    it('should return null if target is null', () => {
      const source = new Date(2023, 0, 1, 12, 30, 45)
      const result = setTimeFromDate(null, source)
      expect(result).toBeNull()
    })

    it('should return target unchanged if source is not a Date', () => {
      const target = new Date(2023, 0, 1, 0, 0, 0)
      const result = setTimeFromDate(target, null)
      expect(result).toEqual(target)
    })

    it('should copy time from source to target date', () => {
      const target = new Date(2023, 5, 15, 0, 0, 0, 0) // June 15, 2023
      const source = new Date(2022, 0, 1, 14, 30, 45, 123) // Any date with time
      const result = setTimeFromDate(target, source)

      expect(result).not.toBe(target) // should be a new object
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(5)
      expect(result.getDate()).toBe(15)
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
      expect(result.getSeconds()).toBe(45)
      expect(result.getMilliseconds()).toBe(123)
    })
  })

  describe('parseYearSmart', () => {
    it('should parse 4-digit years as-is', () => {
      expect(parseYearSmart('2023')).toBe(2023)
      expect(parseYearSmart('1999')).toBe(1999)
    })

    it('should handle 2-digit years with smart century assignment', () => {
      const currentYear = new Date().getFullYear()
      const currentCentury = Math.floor(currentYear / 100) * 100

      // Test a year that should be in current century
      const result1 = parseYearSmart('25')
      expect(result1).toBe(currentCentury + 25)

      // Test a year that should be in previous century (more than 50 years in future)
      const result2 = parseYearSmart('90')
      if (currentCentury + 90 > currentYear + 50) {
        expect(result2).toBe(currentCentury + 90 - 100)
      } else {
        expect(result2).toBe(currentCentury + 90)
      }
    })
  })

  describe('getLocalDateFromString', () => {
    it('should return null for invalid input', () => {
      expect(getLocalDateFromString(null)).toBeNull()
      expect(getLocalDateFromString('')).toBeNull()
      expect(getLocalDateFromString(123)).toBeNull()
    })

    it('should parse date-only ISO strings as local midnight in every timezone', () => {
      expect(getLocalDateFromString('2026-07-14', 'en-US')).toEqual(new Date(2026, 6, 14))
      expect(getLocalDateFromString('2000-01-15', 'pl-PL')).toEqual(new Date(2000, 0, 15))
    })

    it('should parse date string with default parameters', () => {
      const result = getLocalDateFromString('2/15/2023')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(15)
    })

    it('should parse date string with custom locale', () => {
      const result = getLocalDateFromString('15.2.2023', 'de-DE')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(15)
    })

    it('should not treat the separator as a wildcard', () => {
      expect(getLocalDateFromString('2x15x2023', 'en-US')).toBeNull()
      expect(getLocalDateFromString('15x2x2023', 'de-DE')).toBeNull()
    })

    it('should parse date string with time when includeTime is true', () => {
      const result = getLocalDateFromString('2/15/2023, 2:30:45 PM', 'en-US', true)
      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
      expect(result.getSeconds()).toBe(45)
    })

    it('should return null for a date and time without the separator the locale writes', () => {
      expect(getLocalDateFromString('2/16/2022 14:30', 'en-US', true)).toBeNull()
    })

    it('should handle different selection types', () => {
      const weekResult = getLocalDateFromString('2023W12', 'en-US', false, 'week')
      expect(weekResult).toBeInstanceOf(Date)
      expect(weekResult.getDate()).toBe(20) // Monday of week 12

      const monthResult = getLocalDateFromString('2023-06', 'en-US', false, 'month')
      expect(monthResult).toBeInstanceOf(Date)
      expect(monthResult.getMonth()).toBe(5) // June

      const yearResult = getLocalDateFromString('2023', 'en-US', false, 'year')
      expect(yearResult).toBeInstanceOf(Date)
      expect(yearResult.getFullYear()).toBe(2023)
    })
  })
})

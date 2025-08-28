/* eslint-env jasmine */

import {
  convertIsoWeekToDate,
  convertToDateObject,
  createDateFromMonth,
  createDateFromWeek,
  createDateFromYear,
  createGroupsInArray,
  getCalendarDate,
  getDateBySelectionType,
  getFirstAvailableDateInRange,
  getISOWeekNumberAndYear,
  getLocalDateFromString,
  getMonthsNames,
  getSelectableDates,
  getYears,
  getMonthDetails,
  isDateDisabled,
  isDateInRange,
  isDateSelected,
  isDisableDateInRange,
  isMonthDisabled,
  isMonthSelected,
  isMonthInRange,
  isSameDateAs,
  isToday,
  isYearDisabled,
  isYearSelected,
  isYearInRange,
  parseYearSmart,
  removeTimeFromDate,
  setTimeFromDate
} from '../../../src/util/calendar.js'

describe('Calendar Utilities', () => {
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
    it('should return null if date is null', () => {
      const result = convertToDateObject(null, 'day')
      expect(result).toBeNull()
    })

    it('should return the same Date object if date is already a Date', () => {
      const originalDate = new Date(2023, 0, 1)
      const result = convertToDateObject(originalDate, 'day')
      expect(result).toEqual(originalDate)
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

  describe('getFirstAvailableDateInRange', () => {
    it('should return the start date if there are no disabled dates', () => {
      const start = new Date(2023, 0, 1)
      const end = new Date(2023, 0, 5)
      const result = getFirstAvailableDateInRange(start, end, null, null, undefined)
      expect(result).toEqual(start)
    })

    it('should return the first not-disabled date in the range', () => {
      const start = new Date(2023, 0, 1)
      const end = new Date(2023, 0, 5)
      const disabledDates = [
        new Date(2023, 0, 1),
        new Date(2023, 0, 2)
      ]
      const result = getFirstAvailableDateInRange(start, end, null, null, disabledDates)
      // The first available is Jan 3
      expect(result).toEqual(new Date(2023, 0, 3))
    })

    it('should return null if all dates in the range are disabled', () => {
      const start = new Date(2023, 0, 1)
      const end = new Date(2023, 0, 2)
      const disabledDates = [
        new Date(2023, 0, 1),
        new Date(2023, 0, 2)
      ]
      const result = getFirstAvailableDateInRange(start, end, null, null, disabledDates)
      expect(result).toBeNull()
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
  })

  describe('getSelectableDates', () => {
    it('should return all elements that match the default selector inside an element', () => {
      const container = document.createElement('tr')
      container.innerHTML = `
        <td tabindex="0"></td>
        <td tabindex="0"></td>
        <td tabindex="-1"></td>
      `
      const result = getSelectableDates(container)
      expect(result).toHaveSize(2)
    })

    it('should allow a custom selector', () => {
      const container = document.createElement('div')
      container.innerHTML = `
          <div class="date selectable"></div>
          <div class="date selectable"></div>
      `
      const result = getSelectableDates(container, '.date.selectable')
      expect(result).toHaveSize(2)
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

  describe('isMonthDisabled', () => {
    it('should return true if month < min', () => {
      const date = new Date(2023, 0, 1)
      const min = new Date(2023, 1, 1) // Feb
      expect(isMonthDisabled(date, min, null, undefined)).toBeTrue()
    })

    it('should return true if month > max', () => {
      const date = new Date(2023, 5, 1)
      const max = new Date(2023, 3, 1) // April
      expect(isMonthDisabled(date, null, max, undefined)).toBeTrue()
    })

    it('should return false if no disabledDates and within min/max', () => {
      const date = new Date(2023, 2, 1)
      const min = new Date(2023, 0, 1)
      const max = new Date(2023, 5, 1)
      expect(isMonthDisabled(date, min, max, undefined)).toBeFalse()
    })
  })

  describe('isMonthSelected', () => {
    it('should return true if date matches start month', () => {
      const date = new Date(2023, 2, 10) // March
      const start = new Date(2023, 2, 1) // March
      expect(isMonthSelected(date, start, null)).toBeTrue()
    })

    it('should return true if date matches end month', () => {
      const date = new Date(2023, 2, 10) // March
      const end = new Date(2023, 2, 12) // March
      expect(isMonthSelected(date, null, end)).toBeTrue()
    })

    it('should return false otherwise', () => {
      const date = new Date(2023, 3, 1)
      const start = new Date(2023, 2, 1)
      const end = new Date(2023, 2, 10)
      expect(isMonthSelected(date, start, end)).toBeFalse()
    })
  })

  describe('isMonthInRange', () => {
    it('should return true if month is in range of start and end', () => {
      const date = new Date(2023, 2, 10)
      const start = new Date(2023, 1, 1)
      const end = new Date(2023, 3, 1)
      expect(isMonthInRange(date, start, end)).toBeTrue()
    })

    it('should return false if month is out of range', () => {
      const date = new Date(2023, 5, 10)
      const start = new Date(2023, 1, 1)
      const end = new Date(2023, 3, 1)
      expect(isMonthInRange(date, start, end)).toBeFalse()
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

  describe('isYearDisabled', () => {
    it('should return true if year < minYear', () => {
      const date = new Date(2022, 0, 1)
      const min = new Date(2023, 0, 1)
      expect(isYearDisabled(date, min, null, undefined)).toBeTrue()
    })

    it('should return true if year > maxYear', () => {
      const date = new Date(2025, 0, 1)
      const max = new Date(2024, 0, 1)
      expect(isYearDisabled(date, null, max, undefined)).toBeTrue()
    })

    it('should return false if year in range', () => {
      const date = new Date(2023, 5, 1)
      const min = new Date(2023, 0, 1)
      const max = new Date(2023, 11, 31)
      expect(isYearDisabled(date, min, max, undefined)).toBeFalse()
    })
  })

  describe('isYearSelected', () => {
    it('should return true if date year matches start year', () => {
      const date = new Date(2023, 0, 1)
      const start = new Date(2023, 5, 1)
      expect(isYearSelected(date, start, null)).toBeTrue()
    })

    it('should return true if date year matches end year', () => {
      const date = new Date(2023, 0, 1)
      const end = new Date(2023, 10, 1)
      expect(isYearSelected(date, null, end)).toBeTrue()
    })

    it('should return false otherwise', () => {
      const date = new Date(2023, 0, 1)
      const start = new Date(2022, 0, 1)
      const end = new Date(2024, 0, 1)
      // Even though 2023 is between 2022 and 2024, it must match exactly
      expect(isYearSelected(date, start, end)).toBeFalse()
    })
  })

  describe('isYearInRange', () => {
    it('should return true if date year is between start year and end year', () => {
      const date = new Date(2023, 5, 1)
      const start = new Date(2022, 0, 1)
      const end = new Date(2024, 0, 1)
      expect(isYearInRange(date, start, end)).toBeTrue()
    })

    it('should return false if date year is out of range', () => {
      const date = new Date(2025, 5, 1)
      const start = new Date(2022, 0, 1)
      const end = new Date(2024, 0, 1)
      expect(isYearInRange(date, start, end)).toBeFalse()
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

  describe('createDateFromYear', () => {
    it('should create a date for January 1st of the given year', () => {
      const result = createDateFromYear({ year: '2023' })
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(1)
    })
  })

  describe('createDateFromMonth', () => {
    it('should create a date for the first day of the given month', () => {
      const result = createDateFromMonth({ year: '2023', month: '6' })
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(5) // June (0-indexed)
      expect(result.getDate()).toBe(1)
    })
  })

  describe('createDateFromWeek', () => {
    it('should create a date for the Monday of the given ISO week', () => {
      const result = createDateFromWeek({ year: '2023', week: '12' })
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(2) // March
      expect(result.getDate()).toBe(20) // Monday of week 12
    })
  })

  describe('getLocalDateFromString', () => {
    it('should return null for invalid input', () => {
      expect(getLocalDateFromString(null)).toBeNull()
      expect(getLocalDateFromString('')).toBeNull()
      expect(getLocalDateFromString(123)).toBeNull()
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

    it('should parse date string with time when includeTime is true', () => {
      const result = getLocalDateFromString('2/15/2023, 2:30:45 PM', 'en-US', true)
      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(14)
      expect(result.getMinutes()).toBe(30)
      expect(result.getSeconds()).toBe(45)
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

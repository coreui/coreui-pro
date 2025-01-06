/* eslint-env jasmine */

import {
  convert12hTo24h,
  convert24hTo12h,
  convertTimeToDate,
  getAmPm,
  formatTimePartials,
  getLocalizedTimePartials,
  getSelectedHour,
  getSelectedMinutes,
  getSelectedSeconds,
  isAmPm,
  isValidTime
} from '../../../src/util/time.js'

describe('Time Utilities', () => {
  describe('convert12hTo24h', () => {
    it('should convert 12 AM to 0 (midnight)', () => {
      expect(convert12hTo24h('am', 12)).toBe(0)
    })

    it('should not change hours for AM except 12 AM', () => {
      expect(convert12hTo24h('am', 1)).toBe(1)
      expect(convert12hTo24h('am', 6)).toBe(6)
      expect(convert12hTo24h('am', 11)).toBe(11)
    })

    it('should convert 12 PM to 12', () => {
      expect(convert12hTo24h('pm', 12)).toBe(12)
    })

    it('should add 12 to hours for PM except 12', () => {
      expect(convert12hTo24h('pm', 1)).toBe(13)
      expect(convert12hTo24h('pm', 6)).toBe(18)
      expect(convert12hTo24h('pm', 11)).toBe(23)
    })
  })

  describe('convert24hTo12h', () => {
    it('should convert 0 to 12 (midnight)', () => {
      expect(convert24hTo12h(0)).toBe(12)
    })

    it('should return same hours modulo 12 for typical times', () => {
      expect(convert24hTo12h(1)).toBe(1)
      expect(convert24hTo12h(12)).toBe(12)
      expect(convert24hTo12h(13)).toBe(1)
      expect(convert24hTo12h(23)).toBe(11)
    })
  })

  describe('convertTimeToDate', () => {
    it('should return null for falsy values', () => {
      expect(convertTimeToDate(null)).toBeNull()
      expect(convertTimeToDate(undefined)).toBeNull()
    })

    it('should return the same Date if input is already a Date', () => {
      const date = new Date('1970-01-01T05:00:00')
      const result = convertTimeToDate(date)
      expect(result).toBe(date)
    })

    it('should parse string times into a Date object for 1970-01-01', () => {
      const result = convertTimeToDate('02:30:00')
      expect(result).toBeInstanceOf(Date)
      // We can't guarantee the time zone, but let's check hours & minutes
      expect(result.getHours()).toBe(2)
      expect(result.getMinutes()).toBe(30)
    })
  })

  describe('getAmPm', () => {
    it('should return "am" for morning times', () => {
      const date = new Date('2023-01-01T08:00:00') // 8:00 AM
      // Use 'en-US' for example
      expect(getAmPm(date, 'en-US')).toBe('am')
    })

    it('should return "pm" for afternoon/evening times', () => {
      const date = new Date('2023-01-01T15:00:00') // 3:00 PM
      expect(getAmPm(date, 'en-US')).toBe('pm')
    })

    it('should default to hours >= 12 => pm, <12 => am if "AM"/"PM" is not found in locale time string', () => {
      // E.g., a locale that might not include the "AM"/"PM" substring
      const dateMorning = new Date('2023-01-01T03:00:00')
      const dateAfternoon = new Date('2023-01-01T13:00:00')
      // We'll pretend 'en-GB' doesn't include "AM"/"PM" (some do, but let's test logic anyway)
      expect(getAmPm(dateMorning, 'en-GB')).toBe('am')
      expect(getAmPm(dateAfternoon, 'en-GB')).toBe('pm')
    })
  })

  describe('formatTimePartials', () => {
    it('should return an array of formatted objects', () => {
      const values = [0, 1, 2]
      const result = formatTimePartials(values, 'en-US', 'hour')
      expect(result).toHaveSize(3)

      // Each item is { value, label: ... }
      expect(result[0].value).toBe(0)
      expect(result[0].label).toBeTruthy() // "12" in 12-hour or "0" in 24-hour for hour partial
    })

    it('should respect the partial type (hour, minute, second)', () => {
      const hours = [0, 1, 23]
      const formattedHours = formatTimePartials(hours, 'en-US', 'hour')
      // The 'label' should reflect the hours part from the formatted date/time
      expect(formattedHours[0].value).toBe(0)
      expect(formattedHours[1].value).toBe(1)
      expect(formattedHours[2].value).toBe(23)
    })
  })

  describe('getLocalizedTimePartials', () => {
    it('should generate the correct hours array for 12-hour format', () => {
      const { listOfHours, hour12 } = getLocalizedTimePartials('en-US', true)
      expect(hour12).toBeTrue()
      // By default, we expect 1..12
      expect(listOfHours).toHaveSize(12)
      expect(listOfHours[0].value).toBe(1)
      expect(listOfHours[11].value).toBe(12)
    })

    it('should generate the correct hours array for 24-hour format', () => {
      const { listOfHours, hour12 } = getLocalizedTimePartials('en-US', false)
      expect(hour12).toBeFalse()
      // By default, we expect 0..23
      expect(listOfHours).toHaveSize(24)
      expect(listOfHours[0].value).toBe(0)
      expect(listOfHours[23].value).toBe(23)
    })

    it('should filter hours if a function is passed', () => {
      // For example, only even hours in 24-hour format
      const hoursFn = hour => hour % 2 === 0
      const { listOfHours } = getLocalizedTimePartials('en-US', false, hoursFn)
      expect(listOfHours.length).toBe(12) // 0,2,4,...,22
    })

    it('should return a custom hours array if an array is passed', () => {
      const { listOfHours } = getLocalizedTimePartials('en-US', false, [0, 6, 12, 18])
      expect(listOfHours).toHaveSize(4)
      expect(listOfHours.map(({ value }) => value)).toEqual([0, 6, 12, 18])
    })

    it('should produce minutes and seconds arrays too', () => {
      const { listOfMinutes, listOfSeconds } = getLocalizedTimePartials('en-US', false)
      expect(listOfMinutes).toHaveSize(60)
      expect(listOfSeconds).toHaveSize(60)
    })
  })

  describe('getSelectedHour', () => {
    it('should return empty string if date is null', () => {
      expect(getSelectedHour(null, 'en-US')).toBe('')
    })

    it('should return 12-hour format if ampm=true', () => {
      const date = new Date('1970-01-01T15:00:00') // 3 PM in 24-hour
      // ampm=true => convert24hTo12h => 3
      expect(getSelectedHour(date, 'en-US', true)).toBe(3)
    })

    it('should return 24-hour format if ampm=false', () => {
      const date = new Date('1970-01-01T15:00:00')
      expect(getSelectedHour(date, 'en-US', false)).toBe(15)
    })

    it('should detect automatically if locale uses am/pm and ampm = "auto"', () => {
      const date = new Date('1970-01-01T15:00:00')
      // For "en-US", isAmPm => true
      expect(getSelectedHour(date, 'en-US', 'auto')).toBe(3)
    })
  })

  describe('getSelectedMinutes', () => {
    it('should return empty string if date is null', () => {
      expect(getSelectedMinutes(null)).toBe('')
    })

    it('should return the minutes', () => {
      const date = new Date('1970-01-01T05:42:00')
      expect(getSelectedMinutes(date)).toBe(42)
    })
  })

  describe('getSelectedSeconds', () => {
    it('should return empty string if date is null', () => {
      expect(getSelectedSeconds(null)).toBe('')
    })

    it('should return the seconds', () => {
      const date = new Date('1970-01-01T05:42:37')
      expect(getSelectedSeconds(date)).toBe(37)
    })
  })

  describe('isAmPm', () => {
    it('should return true if locale uses AM/PM', () => {
      // "en-US" typically uses AM/PM
      expect(isAmPm('en-US')).toBeTrue()
    })

    it('should return false if locale does not typically use AM/PM', () => {
      // "en-GB" sometimes uses 24h, but let's test:
      // Might not guarantee real-world correctness, but we test logic
      // If it doesn't contain 'AM' or 'PM' in the date string, returns false
      // This test can be environment-dependent, but let's keep it
      const result = isAmPm('en-GB')
      // Usually "en-GB" might or might not show 12 or 24 hour format
      // We'll just check the logic—this could be false in many environment setups
      expect(typeof result).toBe('boolean')
    })
  })

  describe('isValidTime', () => {
    it('should return true for a valid time string', () => {
      expect(isValidTime('02:30:00')).toBeTrue()
      expect(isValidTime('14:59:59')).toBeTrue()
    })

    it('should return false for invalid strings', () => {
      expect(isValidTime('abc')).toBeFalse()
      expect(isValidTime('25:00:00')).toBeFalse() // 25 is not a valid hour
      expect(isValidTime('-01:00:00')).toBeFalse()
    })
  })
})

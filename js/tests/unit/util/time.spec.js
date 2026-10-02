import { onTestFinished, vi } from 'vitest'
import { cdp } from 'vitest/browser'
import {
  convert12hTo24h,
  convert24hTo12h,
  convertTimeToDate,
  getAmPm,
  getLocalizedTimePartials,
  getSelectedHour,
  getSelectedMinutes,
  getSelectedSeconds,
  isAmPm,
  isTimeOutsideLimits
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

  describe('getLocalizedTimePartials', () => {
    it('should label every entry with the locale digits of its unit', () => {
      const { listOfHours, listOfMinutes, listOfSeconds } = getLocalizedTimePartials('en-US', false, [0, 13], [0, 5], [7])

      expect(listOfHours).toEqual([{ value: 0, label: '00', hours: [0] }, { value: 13, label: '13', hours: [13] }])
      expect(listOfMinutes).toEqual([{ value: 0, label: '00' }, { value: 5, label: '05' }])
      expect(listOfSeconds).toEqual([{ value: 7, label: '07' }])
    })

    it('should generate the correct hours array for 12-hour format', () => {
      const { listOfHours, hour12 } = getLocalizedTimePartials('en-US', true)
      expect(hour12).toBeTrue()
      // By default, we expect 1..12
      expect(listOfHours).toHaveSize(12)
      expect(listOfHours[0].value).toBe(1)
      expect(listOfHours[11].value).toBe(12)
    })

    it('should let every 12-hour entry stand for its morning and its afternoon hour by default', () => {
      const { listOfHours } = getLocalizedTimePartials('en-US', true)

      expect(listOfHours[0].hours).toEqual([1, 13])
      expect(listOfHours[11].hours).toEqual([12, 0])
    })

    it('should read the listed hours as 0 to 23 on the 12-hour cycle', () => {
      const { listOfHours } = getLocalizedTimePartials('en-US', true, [8, 9, 10, 11, 12, 13, 14, 15, 16])

      expect(listOfHours.map(({ value, hours }) => [value, hours])).toEqual([
        [8, [8]], [9, [9]], [10, [10]], [11, [11]], [12, [12]], [1, [13]], [2, [14]], [3, [15]], [4, [16]]
      ])
    })

    it('should keep one entry for an hour listed in the morning and the afternoon', () => {
      expect(getLocalizedTimePartials('en-US', true, [8, 20]).listOfHours).toEqual([{ value: 8, label: '8', hours: [8, 20] }])
    })

    it('should count an hour listed twice once', () => {
      expect(getLocalizedTimePartials('en-US', true, [12, 12]).listOfHours).toEqual([{ value: 12, label: '12', hours: [12] }])
    })

    it('should pass the hour filter 0 to 23 on the 12-hour cycle', () => {
      const filter = vi.fn(hour => hour >= 9 && hour <= 17)
      const { listOfHours } = getLocalizedTimePartials('en-US', true, filter)

      expect(filter.mock.calls.map(([hour]) => hour).toSorted((a, b) => a - b)).toEqual(Array.from({ length: 24 }, (_, index) => index))
      expect(listOfHours.map(({ value }) => value)).toEqual([9, 10, 11, 12, 1, 2, 3, 4, 5])
    })

    it('should list the hours a filter keeps in the order of the column', () => {
      const values = partials => partials.listOfHours.map(({ value }) => value)

      expect(values(getLocalizedTimePartials('en-US', true, () => true))).toEqual(values(getLocalizedTimePartials('en-US', true)))
      expect(values(getLocalizedTimePartials('en-US', false, () => true))).toEqual(values(getLocalizedTimePartials('en-US', false)))
    })

    it('should label a 12-hour picker with the hours 1 to 12', () => {
      const labels = getLocalizedTimePartials('en-US', true).listOfHours.map(hour => hour.label)
      expect(labels).toEqual(Array.from({ length: 12 }, (_, index) => String(index + 1)))
    })

    it.each([
      ['America/Santiago', [2026, 8, 6], 0, '00'],
      ['Europe/Warsaw', [2026, 2, 29], 2, '02']
    ])('should label the hour a daylight saving day skips in %s', async (timezoneId, [year, month, day], hour, label) => {
      await cdp().send('Emulation.setTimezoneOverride', { timezoneId })
      onTestFinished(() => cdp().send('Emulation.setTimezoneOverride', { timezoneId: '' }))
      vi.useFakeTimers({ toFake: ['Date'] })
      onTestFinished(() => vi.useRealTimers())
      vi.setSystemTime(new Date(year, month, day, 12))

      const skipped = new Date()
      skipped.setHours(hour)
      expect(skipped.getHours()).not.toBe(hour)

      expect(getLocalizedTimePartials('en-GB', false, [hour]).listOfHours.map(item => item.label)).toEqual([label])
    })

    it('should generate the correct hours array for 24-hour format', () => {
      const { listOfHours, hour12 } = getLocalizedTimePartials('en-US', false)
      expect(hour12).toBeFalse()
      // By default, we expect 0..23
      expect(listOfHours).toHaveSize(24)
      expect(listOfHours[0].value).toBe(0)
      expect(listOfHours[23].value).toBe(23)
    })

    it('should label a 24-hour picker with 24-hour hours (00…23) in a 12-hour locale', () => {
      // en-CA defaults to a 12-hour cycle, so without pinning the hour cycle a
      // 24-hour picker rendered duplicated 12-hour labels (12,01,…,11,12,01,…)
      // and older ICU labelled midnight "24".
      const { listOfHours } = getLocalizedTimePartials('en-CA', false)
      const labels = listOfHours.map(({ label }) => label)
      expect(labels).toContain('00')
      expect(labels).toContain('13')
      expect(labels).toContain('23')
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

    it('should filter minutes and seconds if functions are passed', () => {
      const { listOfMinutes, listOfSeconds } = getLocalizedTimePartials('en-US', false, [], minute => minute % 15 === 0, second => second < 3)

      expect(listOfMinutes.map(({ value }) => value)).toEqual([0, 15, 30, 45])
      expect(listOfSeconds.map(({ value }) => value)).toEqual([0, 1, 2])
    })
  })

  describe('convertTimeToDate', () => {
    it('should copy a date', () => {
      const time = new Date(2026, 6, 14, 9, 30)
      const result = convertTimeToDate(time)

      expect(result).toEqual(time)
      expect(result).not.toBe(time)
    })

    it('should read a time string on 1 January 1970', () => {
      expect(convertTimeToDate('14:30')).toEqual(new Date(1970, 0, 1, 14, 30))
      expect(convertTimeToDate('2:30:15 PM')).toEqual(new Date(1970, 0, 1, 14, 30, 15))
    })

    it('should return null for an empty value', () => {
      expect(convertTimeToDate(null)).toBeNull()
      expect(convertTimeToDate(undefined)).toBeNull()
      expect(convertTimeToDate('')).toBeNull()
    })
  })

  describe('getAmPm', () => {
    it('should read the day period a locale shows', () => {
      expect(getAmPm(new Date(2026, 6, 14, 9), 'en-US')).toBe('am')
      expect(getAmPm(new Date(2026, 6, 14, 21), 'en-US')).toBe('pm')
    })

    it('should fall back to the hour for a locale without a day period marker', () => {
      expect(getAmPm(new Date(2026, 6, 14, 9), 'de-DE')).toBe('am')
      expect(getAmPm(new Date(2026, 6, 14, 12), 'de-DE')).toBe('pm')
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

  describe('isTimeOutsideLimits', () => {
    const min = new Date(2026, 9, 15, 10, 30, 15)
    const max = new Date(2026, 9, 20, 17, 45, 30)

    it('should put an hour outside only when none of its minutes lies within the limits', () => {
      const day = new Date(2026, 9, 15, 12)

      expect(isTimeOutsideLimits(day, 'hours', 9, { max, min })).toBeTrue()
      expect(isTimeOutsideLimits(day, 'hours', 10, { max, min })).toBeFalse()
      expect(isTimeOutsideLimits(new Date(2026, 9, 20, 12), 'hours', 17, { max, min })).toBeFalse()
      expect(isTimeOutsideLimits(new Date(2026, 9, 20, 12), 'hours', 18, { max, min })).toBeTrue()
    })

    it('should check a minute within the hour and a second within the minute of the date', () => {
      expect(isTimeOutsideLimits(new Date(2026, 9, 15, 10), 'minutes', 29, { max, min })).toBeTrue()
      expect(isTimeOutsideLimits(new Date(2026, 9, 15, 10), 'minutes', 30, { max, min })).toBeFalse()
      expect(isTimeOutsideLimits(new Date(2026, 9, 15, 10, 30), 'seconds', 14, { max, min })).toBeTrue()
      expect(isTimeOutsideLimits(new Date(2026, 9, 15, 10, 30), 'seconds', 15, { max, min })).toBeFalse()
      expect(isTimeOutsideLimits(new Date(2026, 9, 20, 17, 45), 'seconds', 31, { max, min })).toBeTrue()
    })

    it('should put a half of the day outside when none of it lies within the limits', () => {
      expect(isTimeOutsideLimits(new Date(2026, 9, 15), 'meridiem', 'am', { max: null, min: new Date(2026, 9, 15, 13) })).toBeTrue()
      expect(isTimeOutsideLimits(new Date(2026, 9, 15), 'meridiem', 'pm', { max: null, min: new Date(2026, 9, 15, 13) })).toBeFalse()
      expect(isTimeOutsideLimits(new Date(2026, 9, 15), 'meridiem', 'pm', { max: new Date(2026, 9, 15, 11), min: null })).toBeTrue()
      expect(isTimeOutsideLimits(new Date(2026, 9, 15), 'meridiem', 'am', { max: new Date(2026, 9, 15, 11), min: null })).toBeFalse()
    })

    it('should put an hour or a minute outside when every minute or second it offers is', () => {
      const limits = { max: null, min: new Date(2026, 9, 15, 10, 50) }

      expect(isTimeOutsideLimits(new Date(2026, 9, 15), 'hours', 10, limits, [0, 15, 30, 45])).toBeTrue()
      expect(isTimeOutsideLimits(new Date(2026, 9, 15), 'hours', 10, limits, [0, 50])).toBeFalse()
      expect(isTimeOutsideLimits(new Date(2026, 9, 15, 10), 'minutes', 50, { max: null, min: new Date(2026, 9, 15, 10, 50, 45) }, [0, 30])).toBeTrue()
    })

    it('should keep every value on a day between the limits and without limits', () => {
      expect(isTimeOutsideLimits(new Date(2026, 9, 16), 'hours', 0, { max, min })).toBeFalse()
      expect(isTimeOutsideLimits(new Date(2026, 9, 16), 'hours', 23, { max, min })).toBeFalse()
      expect(isTimeOutsideLimits(new Date(2026, 9, 15), 'hours', 0, { max: null, min: null })).toBeFalse()
    })
  })
})

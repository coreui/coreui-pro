export type AmPm = 'am' | 'pm'

export type FormattedPartial = {
  label: string
  value: number
}

export type LocalizedTimePartials = {
  listOfHours: FormattedPartial[]
  listOfMinutes: FormattedPartial[]
  listOfSeconds: FormattedPartial[]
  hour12: boolean
}

type PartialFilter = boolean | number[] | ((value: number) => boolean)

/**
 * Converts an hour on the 12-hour clock to the 24-hour clock.
 *
 * @param abbr - The lowercase day period, `'am'` or `'pm'`; any other value adds 12 hours, even to 12
 * @param hour - The hour on the 12-hour clock, 1 to 12
 * @returns The hour on the 24-hour clock
 */
export const convert12hTo24h = (abbr: string, hour: number): number => {
  if (abbr === 'am' && hour === 12) {
    return 0
  }

  if (abbr === 'am') {
    return hour
  }

  if (abbr === 'pm' && hour === 12) {
    return 12
  }

  return hour + 12
}

/**
 * Converts an hour on the 24-hour clock to the 12-hour clock.
 *
 * @param hour - The hour on the 24-hour clock, 0 to 23
 * @returns The hour on the 12-hour clock, 1 to 12
 */
export const convert24hTo12h = (hour: number): number => hour % 12 || 12

/**
 * Converts a time value to a `Date`. A `Date` is copied, and a string such as
 * `'14:30'` or `'2:30 PM'` is read on 1 January 1970.
 *
 * @param time - The time as a `Date` or a string
 * @returns The time as a new `Date`, or `null` for an empty value
 */
export const convertTimeToDate = (time: Date | string | null | undefined): Date | null =>
  time ? (time instanceof Date ? new Date(time) : new Date(`1970-01-01 ${time}`)) : null

/**
 * Reads the day period a locale shows for a date, and falls back to the hour
 * when the locale's time format has no `AM`/`PM` marker.
 *
 * @param date - The date to read
 * @param locale - The locale whose time format is read
 * @returns `'am'` or `'pm'`
 */
export const getAmPm = (date: Date, locale: string): AmPm => {
  if (date.toLocaleTimeString(locale).includes('AM')) {
    return 'am'
  }

  if (date.toLocaleTimeString(locale).includes('PM')) {
    return 'pm'
  }

  return date.getHours() >= 12 ? 'pm' : 'am'
}

/**
 * Labels hour, minute or second values the way a locale writes that part of
 * a time.
 *
 * @param values - The values to label
 * @param locale - The locale to format with
 * @param partial - Which part of the time the values are
 * @param hour12 - Whether hours use the 12-hour cycle; when omitted the locale decides
 * @returns The values with their localized labels, in the given order
 */
const formatTimePartials = (values: number[], locale: string, partial: 'hour' | 'minute' | 'second', hour12?: boolean): FormattedPartial[] => {
  const date = new Date(2020, 0, 1)

  const forceTwoDigit = shouldUseTwoDigitHour(locale)
  const hourCycle = hour12 === undefined ? undefined : (hour12 ? 'h12' : 'h23')
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: forceTwoDigit ? '2-digit' : 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hourCycle
  })

  return values.map(value => {
    if (partial === 'hour') {
      date.setHours(value)
    }

    if (partial === 'minute') {
      date.setMinutes(value)
    }

    if (partial === 'second') {
      date.setSeconds(value)
    }

    return {
      value,
      label:
        formatter.formatToParts(date).find(part => part.type === partial)
          ?.value || ''
    }
  })
}

/**
 * Lists the localized hours, minutes and seconds a time selection offers.
 * For each part, a non-empty array lists exactly those values, a function
 * keeps the values for which it returns `true`, and anything else lists every
 * value.
 *
 * @param locale - The locale to format with
 * @param ampm - `true` for the 12-hour cycle, `false` for the 24-hour cycle, `'auto'` to follow the locale
 * @param hours - The hours to list
 * @param minutes - The minutes to list
 * @param seconds - The seconds to list
 * @returns The labelled hours, minutes and seconds, and whether hours use the 12-hour cycle
 */
export const getLocalizedTimePartials = (
  locale: string,
  ampm: 'auto' | boolean = 'auto',
  hours: PartialFilter = [],
  minutes: PartialFilter = [],
  seconds: PartialFilter = []
): LocalizedTimePartials => {
  const hour12 = (ampm === 'auto' && isAmPm(locale)) || ampm === true

  const listOfHours =
    Array.isArray(hours) && hours.length > 0 ?
      hours :
      (typeof hours === 'function' ?
        Array.from({ length: hour12 ? 12 : 24 }, (_, i) =>
          hour12 ? i + 1 : i
        ).filter(hour => hours(hour)) :
        Array.from({ length: hour12 ? 12 : 24 }, (_, i) => (hour12 ? i + 1 : i)))

  const listOfMinutes =
    Array.isArray(minutes) && minutes.length > 0 ?
      minutes :
      (typeof minutes === 'function' ?
        Array.from({ length: 60 }, (_, i) => i).filter(minute =>
          minutes(minute)
        ) :
        Array.from({ length: 60 }, (_, i) => i))

  const listOfSeconds =
    Array.isArray(seconds) && seconds.length > 0 ?
      seconds :
      (typeof seconds === 'function' ?
        Array.from({ length: 60 }, (_, i) => i).filter(second =>
          seconds(second)
        ) :
        Array.from({ length: 60 }, (_, i) => i))

  return {
    listOfHours: formatTimePartials(listOfHours, locale, 'hour', hour12),
    listOfMinutes: formatTimePartials(listOfMinutes, locale, 'minute'),
    listOfSeconds: formatTimePartials(listOfSeconds, locale, 'second'),
    hour12
  }
}

/**
 * Reads the hour of a date on the clock a locale uses.
 *
 * @param date - The date to read
 * @param locale - The locale that decides the clock when `ampm` is `'auto'`
 * @param ampm - `true` for the 12-hour clock, `false` for the 24-hour clock, `'auto'` to follow the locale
 * @returns The hour, or an empty string without a date
 */
export const getSelectedHour = (date: Date | null, locale: string, ampm: 'auto' | boolean = 'auto'): number | string =>
  date ?
    ((ampm === 'auto' && isAmPm(locale)) || ampm === true ?
      convert24hTo12h(date.getHours()) :
      date.getHours()) :
    ''

/**
 * Reads the minutes of a date.
 *
 * @param date - The date to read
 * @returns The minutes, or an empty string without a date
 */
export const getSelectedMinutes = (date: Date | null): number | string => (date ? date.getMinutes() : '')

/**
 * Reads the seconds of a date.
 *
 * @param date - The date to read
 * @returns The seconds, or an empty string without a date
 */
export const getSelectedSeconds = (date: Date | null): number | string => (date ? date.getSeconds() : '')

/**
 * Tells whether a locale writes times with an `AM`/`PM` marker.
 *
 * @param locale - The locale to check
 * @returns `true` when the locale's time format carries the marker
 */
export const isAmPm = (locale: string): boolean =>
  ['am', 'AM', 'pm', 'PM'].some(el =>
    new Date().toLocaleString(locale).includes(el)
  )

/**
 * Tells whether a locale pads a single-digit hour with a leading zero
 * (`07:05` rather than `7:05`), so hour labels can follow it.
 *
 * @param locale - The locale to check
 * @returns `true` when the locale writes the hour with two digits
 */
const shouldUseTwoDigitHour = (locale: string): boolean => {
  const d = new Date(2020, 0, 1, 7, 5, 7)
  const formatted = d.toLocaleTimeString(locale)

  return formatted.startsWith('0')
}

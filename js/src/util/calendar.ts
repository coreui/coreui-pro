export type DisabledDate = ((date: Date) => boolean) | Date | Date[]

export type SelectionTypes = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type ViewTypes = 'days' | 'months' | 'quarters' | 'years'

export type PeriodViewTypes = Exclude<ViewTypes, 'days'>

export type TabStopTarget = {
  adjacent: boolean
  date: Date
  end: Date
  position: Date
  selected: boolean
}

export type CalendarKeyAction =
  | { type: 'activate' }
  | { date: Date; keptDay?: KeptDay; months: number; panel?: number; type: 'move'; years: number }
  | { date?: Date; keptDay?: KeptDay; months: number; type: 'page'; years: number }
  | { type: 'stay' }

export type KeptDay = {
  day: number
  focused: Date
  target: Date
}

export type CalendarKeyContext = {
  calendarDate: Date
  calendars: number
  firstDayOfWeek: number
  keptDay?: KeptDay | null
  maxDate?: Date | null
  minDate?: Date | null
  panel: number
  rows: boolean
  rtl: boolean
  view: ViewTypes
}

export type BaseGroups = {
  year: string
  month: string
  day: string
}

export type WeekGroups = {
  year: string
  week: string
}

export type MonthGroups = {
  year: string
  month: string
}

export type YearGroups = {
  year: string
}

type TimeGroups = {
  hour: string
  minute?: string
  second?: string
  ampm?: string
}

type DateOnlyGroups = BaseGroups
type DateTimeGroups = BaseGroups & TimeGroups
type AnyGroups = DateOnlyGroups | DateTimeGroups | WeekGroups | MonthGroups | YearGroups

/**
 * Builds the start of a day from a year, a month and a day, keeping a year
 * below 100 as written where the `Date` constructor would move it to
 * 1900–1999. A month or day out of range rolls over as in the constructor.
 *
 * @param year - The full year
 * @param month - The month, 0 for January
 * @param day - The day of the month
 * @returns The date
 */
export const createDate = (year: number, month = 0, day = 1) : Date => {
  const date = new Date(year, month, day)
  date.setFullYear(year, month, day)
  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * Reads a date written by `Date#toDateString`, the form calendar cells carry
 * in `data-coreui-date`, keeping a year below 100 that the `Date` parser would
 * read as 19xx or 20xx. Any other string gives an invalid date.
 *
 * @param value - The date as written, such as `Thu Dec 31 0099`
 * @returns The start of that day
 */
export const parseToDateString = (value: string) : Date => {
  const [, month, day, year] = /^\w{3} (\w{3}) (\d{2}) (-?\d{4,})$/.exec(value) ?? []
  const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month)
  return monthIndex === -1 ? new Date(Number.NaN) : createDate(Number(year), monthIndex, Number(day))
}

/**
 * Gives a locale's week-of-year label, capitalized the way the native week
 * input shows it ("Week", "Tydzień", "Woche"), or "Week" where
 * `Intl.DisplayNames` has no data.
 *
 * @param locale - The locale to use
 * @returns The label
 */
export const getWeekLabel = (locale: string): string => {
  try {
    const label = new Intl.DisplayNames(locale, { type: 'dateTimeField' }).of('weekOfYear')
    return label ? label.charAt(0).toLocaleUpperCase(locale) + label.slice(1) : 'Week'
  } catch {
    return 'Week'
  }
}

/**
 * Names a week number for screen readers: what `label` returns for it, or,
 * without `label` or when it returns nothing, the week label followed by the
 * number ("Week 36").
 *
 * @param weekNumber - The week number
 * @param weekLabel - The locale's week label, as `getWeekLabel` gives it
 * @param label - A function that names a week number, `null` without one
 * @returns The name
 */
export const getWeekNumberName = (weekNumber: number, weekLabel: string, label?: ((weekNumber: number) => string | undefined) | null): string =>
  label?.(weekNumber) || `${weekLabel} ${weekNumber}`

/**
 * Finds the Monday that starts an ISO week.
 *
 * @param year - The full week-numbering year
 * @param week - The ISO week number, starting at 1
 * @returns The Monday of the week
 */
export const getDateOfISOWeek = (year: number, week: number) : Date => {
  const date = createDate(year, 0, 4)
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + ((week - 1) * 7))
  return date
}

const ARROW_KEYS = new Set(['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'])

const MODIFIER_KEYS = new Set(['Alt', 'Control', 'Meta', 'Shift'])

const GREGORIAN_MONTH_CALENDARS = new Set(['buddhist', 'gregory', 'iso8601', 'japanese', 'roc'])

const yearBeforeMonth = new Map<string, boolean>()

const CELL_NAME_FORMATS: Record<Exclude<ViewTypes, 'quarters'>, Intl.DateTimeFormatOptions> = {
  days: {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  },
  months: { month: 'long', year: 'numeric' },
  years: { year: 'numeric' }
}

const MONTHS_IN_PERIOD: Record<PeriodViewTypes, number> = {
  months: 1,
  quarters: 3,
  years: 12
}

/**
 * How many years one page of the years view shows, and how far its navigation
 * and Page Up / Page Down turn it.
 */
export const YEARS_PER_PAGE = 12

/**
 * Numbers the month, quarter or year a date falls in, counting from year 0,
 * so that two dates share a period exactly when the numbers match.
 *
 * @param date - The date to place
 * @param view - The unit of the period
 * @returns The index of the period
 */
const getPeriod = (date: Date, view: PeriodViewTypes) : number => Math.floor(((date.getFullYear() * 12) + date.getMonth()) / MONTHS_IN_PERIOD[view])

/**
 * Gives the time of the midnight that starts the ISO week of a date, so that
 * two dates share a week exactly when the times match.
 *
 * @param date - The date to place
 * @returns The time of the Monday that starts the week
 */
const getWeekTime = (date: Date) : number => {
  const monday = getStartOfWeek(date, 1)
  monday.setHours(0, 0, 0, 0)
  return monday.getTime()
}

/**
 * Tells whether `disabledDates` disables every day it reaches, walking a day
 * at a time from the day of the later of `start` and `min` to the day of the
 * earlier of `end` and `max`, times of day aside.
 *
 * @param start - The first day to check
 * @param end - The last day to check
 * @param min - The earliest date allowed
 * @param max - The latest date allowed
 * @param disabledDates - The dates that cannot be picked
 * @returns `true` when every day the walk reaches is disabled
 */
const isEveryDayDisabled = (start: Date, end: Date, min: Date | null | undefined, max: Date | null | undefined, disabledDates: DisabledDate | DisabledDate[]) : boolean => {
  const first = min && min > start ? createDate(min.getFullYear(), min.getMonth(), min.getDate()) : start
  const last = max && max < end ? createDate(max.getFullYear(), max.getMonth(), max.getDate()) : end

  for (
    const currentDate = new Date(first);
    currentDate.getTime() <= last.getTime();
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    if (!isDateDisabled(currentDate, null, null, disabledDates)) {
      return false
    }
  }

  return true
}

/**
 * Converts an ISO week string such as `2026W05` or `2026w05` to the Monday
 * of that week.
 *
 * @param isoWeek - The week as a year and a week number joined by `W`
 * @returns The Monday of the week
 */
export const convertIsoWeekToDate = (isoWeek: string) : Date => {
  const [year, week] = isoWeek.split(/[Ww]/)
  const parsedYear = parseYearSmart(year)
  const parsedWeek = Number.parseInt(week, 10)

  return getDateOfISOWeek(parsedYear, parsedWeek)
}

/**
 * Parses a week string (`2026-W05`, `2026W05` or `2026 W05`) to the Monday
 * of that week.
 *
 * @param dateString - The week string
 * @returns The Monday of the week
 */
const parseWeekString = (dateString: string) : Date | null => {
  const weekPatterns = [
    /^(\d{4})-W(\d{1,2})$/,
    /^(\d{4})W(\d{1,2})$/,
    /^(\d{4})\s+W(\d{1,2})$/
  ]

  for (const pattern of weekPatterns) {
    const match = dateString.trim().match(pattern)
    if (match) {
      const parsedYear = parseYearSmart(match[1])
      const parsedWeek = Number.parseInt(match[2], 10)

      return getDateOfISOWeek(parsedYear, parsedWeek)
    }
  }

  return convertIsoWeekToDate(dateString)
}

/**
 * Parses a quarter string (`2026-Q3`, `2026Q3` or `2026 Q3`) to the first
 * day of that quarter.
 *
 * @param dateString - The quarter string
 * @returns The first day of the quarter, or `null` for a string that is not a quarter
 */
const parseQuarterString = (dateString: string) : Date | null => {
  const quarterPatterns = [
    /^(\d{4})-Q(\d{1})$/,
    /^(\d{4})Q(\d{1})$/,
    /^(\d{4})\s+Q(\d{1})$/
  ]

  for (const pattern of quarterPatterns) {
    const match = dateString.trim().match(pattern)
    if (match) {
      const parsedYear = parseYearSmart(match[1])
      const parsedQuarter = Number.parseInt(match[2], 10)

      if (parsedQuarter >= 1 && parsedQuarter <= 4) {
        const monthIndex = (parsedQuarter - 1) * 3
        return createDate(parsedYear, monthIndex, 1)
      }
    }
  }

  return null
}

/**
 * Parses a month string with the year on either side (`2026-07`, `07/2026`,
 * `7.26`) to the first day of that month. A group of three or more digits, or a
 * value of 100 or more, is the year; of two short groups the first is the year
 * only when it cannot be a month and the second can.
 *
 * @param dateString - The month string
 * @returns The first day of the month, or `null` for a string that is not a month
 */
const parseMonthString = (dateString: string) : Date | null => {
  const monthPatterns = [
    /^(\d{2,4})[-/.\s](\d{1,2})$/,
    /^(\d{1,2})[-/.\s](\d{2,4})$/
  ]

  for (const pattern of monthPatterns) {
    const match = dateString.trim().match(pattern)
    if (match) {
      const firstGroup = match[1]
      const secondGroup = match[2]

      const parsedFirst = Number.parseInt(firstGroup, 10)
      const parsedSecond = Number.parseInt(secondGroup, 10)

      let parsedYear
      let parsedMonth

      if (firstGroup.length >= 3 || parsedFirst >= 100) {
        parsedYear = parseYearSmart(firstGroup)
        parsedMonth = parsedSecond - 1
      } else if (secondGroup.length >= 3 || parsedSecond >= 100) {
        parsedYear = parseYearSmart(secondGroup)
        parsedMonth = parsedFirst - 1
      } else {
        // eslint-disable-next-line no-lonely-if
        if (
          parsedSecond >= 1 &&
          parsedSecond <= 12 &&
          (parsedFirst > 12 || parsedFirst < 1)
        ) {
          parsedYear = parseYearSmart(firstGroup)
          parsedMonth = parsedSecond - 1
        } else {
          parsedYear = parseYearSmart(secondGroup)
          parsedMonth = parsedFirst - 1
        }
      }

      if (parsedMonth >= 0 && parsedMonth <= 11) {
        return createDate(parsedYear, parsedMonth, 1)
      }
    }
  }

  return null
}

/**
 * Parses a year of two to four digits to 1 January of that year, and passes
 * any other string to the native date parser, which can give any day.
 *
 * @param dateString - The year as a string or a number
 * @returns The date, or `null` for an unreadable value
 */
const parseYearString = (dateString: string | number) : Date | null => {
  const yearString = String(dateString)
  const yearPattern = /^(\d{2,4})$/
  const match = yearString.trim().match(yearPattern)

  if (match) {
    const groups = { year: match[1] }
    return createDateFromYear(groups)
  }

  return parseLocalDateString(yearString)
}

/**
 * Lists the ways a locale writes a reference date (31 December 2013,
 * 17:19:22): the locale's own format, then the same format with each other
 * separator.
 *
 * @param locale - The locale to write the date in
 * @param includeTime - Whether the patterns carry the time
 * @returns The patterns, the locale's own first
 */
const generateDatePatterns = (locale: string, includeTime: boolean) : string[] => {
  const referenceDate = new Date(2013, 11, 31, 17, 19, 22)
  const patterns = []

  try {
    const standardFormat = includeTime ?
      referenceDate.toLocaleString(locale, { calendar: 'gregory' }) :
      referenceDate.toLocaleDateString(locale, { calendar: 'gregory' })

    patterns.push(standardFormat)
  } catch {
    const standardFormat = includeTime ?
      referenceDate.toLocaleString("en-US") :
      referenceDate.toLocaleDateString("en-US")
    patterns.push(standardFormat)
  }

  const separators = ["/", "-", ".", " "]
  const standardFormat = patterns[0]

  let originalSeparator = "/"
  if (standardFormat.includes("/")) {
    originalSeparator = "/"
  } else if (standardFormat.includes("-")) {
    originalSeparator = "-"
  } else if (standardFormat.includes(".")) {
    originalSeparator = "."
  }

  for (const sep of separators) {
    if (sep !== originalSeparator) {
      const escapedSeparator = originalSeparator.replaceAll(
        /[.*+?^${}()|[\]\\]/g,
        String.raw`\$&`
      )
      const altFormat = standardFormat.replaceAll(
        new RegExp(escapedSeparator, "g"),
        sep
      )
      patterns.push(altFormat)
    }
  }

  return patterns
}

/**
 * Turns a pattern written with the reference date into a regular expression
 * with named groups for its parts.
 *
 * @param formatString - The pattern from `generateDatePatterns`
 * @param includeTime - Whether the time parts are matched
 * @returns The source of the regular expression
 */
const buildDateRegexPattern = (formatString: string, includeTime: boolean) : string => {
  let regexPattern = formatString.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")

  regexPattern = regexPattern
    .replace("2013", String.raw`(?<year>\d{2,4})`)
    .replace("12", String.raw`(?<month>\d{1,2})`)
    .replace("31", String.raw`(?<day>\d{1,2})`)

  if (includeTime) {
    regexPattern = regexPattern
      .replaceAll(/17|5/g, String.raw`(?<hour>\d{1,2})`)
      .replace("19", String.raw`(?<minute>\d{1,2})`)
      .replace("22", String.raw`(?<second>\d{1,2})`)
      .replaceAll(/AM|PM/gi, "(?<ampm>[APap][Mm])")
  }

  return regexPattern
}

/**
 * Matches a string against the patterns in order.
 *
 * @param dateString - The string to parse
 * @param patterns - The patterns from `generateDatePatterns`
 * @param includeTime - Whether the time parts are matched
 * @returns The named groups of the first match, or `null` when none matches
 */
const tryParseWithPatterns = (dateString: string, patterns: string[], includeTime: boolean) : AnyGroups | null => {
  for (const pattern of patterns) {
    const regexPattern = buildDateRegexPattern(pattern, includeTime)
    const regex = new RegExp(`^${regexPattern}$`)
    const match = dateString.trim().match(regex)

    if (match?.groups) {
      return match.groups as AnyGroups
    }
  }

  return null
}

/**
 * Converts a parsed hour to the 24-hour clock.
 *
 * @param hour - The hour as written
 * @param ampm - The day period as written, if any
 * @returns The hour on the 24-hour clock
 */
const convertTo24Hour = (hour: string, ampm?: string) : number => {
  const parsedHour = Number.parseInt(hour, 10)

  if (!ampm) {
    return parsedHour
  }

  const isPM = ampm.toLowerCase() === "pm"

  if (isPM && parsedHour !== 12) {
    return parsedHour + 12
  }

  if (!isPM && parsedHour === 12) {
    return 0
  }

  return parsedHour
}

/**
 * Tells whether an hour, a minute and a second form a valid time.
 *
 * @param hour - The hour on the 24-hour clock
 * @param minute - The minute
 * @param second - The second
 * @returns `true` for a valid time
 */
const validateTimeComponents = (hour: number, minute: number, second: number) : boolean => {
  return (
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59 &&
    second >= 0 &&
    second <= 59
  )
}

/**
 * Tells whether a parsed month and day are within range; the day is checked
 * against 31, whatever the month.
 *
 * @param month - The month as written, 1 to 12
 * @param day - The day as written
 * @returns `true` for a month and day within range
 */
const validateDateComponents = (month: string, day: string) : boolean => {
  const parsedMonth = Number.parseInt(month, 10) - 1
  const parsedDay = Number.parseInt(day, 10)

  return (
    parsedMonth >= 0 && parsedMonth <= 11 && parsedDay >= 1 && parsedDay <= 31
  )
}

/**
 * Builds a date with its time from parsed groups.
 *
 * @param groups - The parsed date and time parts
 * @returns The date, or `null` for an invalid time
 */
const createDateWithTime = (groups: DateTimeGroups) : Date | null => {
  const { year, month, day, hour, minute, second, ampm } = groups

  const parsedYear = parseYearSmart(year)
  const parsedMonth = Number.parseInt(month, 10) - 1
  const parsedDay = Number.parseInt(day, 10)
  const parsedHour = convertTo24Hour(hour, ampm)
  const parsedMinute = Number.parseInt(minute ?? "0", 10) || 0
  const parsedSecond = Number.parseInt(second ?? "0", 10) || 0

  if (!validateTimeComponents(parsedHour, parsedMinute, parsedSecond)) {
    return null
  }

  const date = createDate(parsedYear, parsedMonth, parsedDay)
  date.setHours(parsedHour, parsedMinute, parsedSecond)
  return date
}

/**
 * Builds a date at midnight from parsed groups.
 *
 * @param groups - The parsed date parts
 * @returns The date, or `null` for an invalid month or day
 */
const createDateOnly = (groups: DateOnlyGroups) : Date | null => {
  const { year, month, day } = groups

  if (!validateDateComponents(month, day)) {
    return null
  }

  const parsedYear = parseYearSmart(year)
  const parsedMonth = Number.parseInt(month, 10) - 1
  const parsedDay = Number.parseInt(day, 10)

  return createDate(parsedYear, parsedMonth, parsedDay)
}

/**
 * Counts the parts a complete date has in the locale's own pattern.
 *
 * @param patterns - The patterns from `generateDatePatterns`
 * @returns The number of parts, 3 without patterns
 */
const getExpectedPartsCount = (patterns: string[]) : number => {
  if (patterns.length === 0) {
    return 3
  }

  const firstPattern = patterns[0]
  const parts = firstPattern.split(/[-/.\s:]+/).filter(part => part.length > 0)
  return parts.length
}

/**
 * Parses a day, and optionally its time, in the locale's numeric format
 * written with Latin digits and a Gregorian year. When no pattern of the locale
 * matches, a string with separators and at least as many parts as the locale's
 * format goes to the native date parser.
 *
 * @param dateString - The string to parse
 * @param locale - The locale whose format is tried first
 * @param includeTime - Whether the time is read too
 * @returns The date, or `null` for an unreadable string
 */
const parseDayString = (dateString: string, locale: string, includeTime: boolean) : Date | null => {
  const patterns = generateDatePatterns(locale, includeTime)
  const groups = tryParseWithPatterns(dateString, patterns, includeTime)

  if (!groups) {
    const trimmed = dateString.trim()
    const hasDateSeparators = /[-/.:]/.test(trimmed)
    const parts = trimmed.split(/[-/.\s:]+/).filter(part => part.length > 0)
    const expectedPartsCount = getExpectedPartsCount(patterns)
    const hasRequiredParts = parts.length >= expectedPartsCount

    if (hasDateSeparators && hasRequiredParts) {
      return parseLocalDateString(dateString)
    }

    return null
  }

  if ("year" in groups && "month" in groups && "day" in groups) {
    const { month, day } = groups
    if (!validateDateComponents(month, day)) {
      return null
    }
  } else {
    return null
  }

  return includeTime ? createDateWithTime(groups as DateTimeGroups) : createDateOnly(groups as DateOnlyGroups)
}

/**
 * Parses a string with the native date parser, reading an ISO date without a
 * time (`2026-07-14`) as local midnight rather than UTC midnight.
 *
 * @param dateString - The string to parse
 * @returns The date, or `null` for an unreadable string
 */
const parseLocalDateString = (dateString: string) : Date | null => {
  const trimmed = dateString.trim()
  const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
  const _date = new Date(Date.parse(isoDateOnly ? `${trimmed}T00:00` : dateString))
  if (!Number.isNaN(_date.getTime())) {
    return _date
  }

  return null
}

/**
 * Converts a value to a `Date` for a selection type: a week, a month, a
 * quarter or a year string is read as the first day of that unit, and anything
 * else as a day by `parseDayString`. A day past the end of its month rolls over
 * into the next month.
 *
 * @param date - The value as a `Date` or a string; `null`, `undefined` or an empty string means no date
 * @param selectionType - The unit the string names
 * @param locale - The locale whose format reads a day
 * @param includeTime - Whether a day is read with its time
 * @returns The date, or `null` for no value or an invalid or unreadable one
 */
export const convertToDateObject = (date: Date | string | null | undefined, selectionType?: SelectionTypes, locale: string = 'en-US', includeTime: boolean = false) : Date | null => {
  if (!date) {
    return null
  }

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date
  }

  const parsers: Record<string, (value: string) => Date | null> = {
    week: parseWeekString,
    month: parseMonthString,
    quarter: parseQuarterString,
    year: parseYearString
  }
  const parse = selectionType ? parsers[selectionType] : undefined
  const parsed = parse ? parse(date) : parseDayString(date, locale, includeTime)

  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null
}

/**
 * Converts a selected value as `convertToDateObject` does and, in week
 * selection, moves it to the day `getWeekDate` gives its week, the day a click
 * on the row that stands for that week picks.
 *
 * @param date - The value as a `Date` or a string
 * @param selectionType - The unit the string names
 * @param firstDayOfWeek - The day the week rows start on, `0` for Sunday to `6` for Saturday
 * @returns The date, or `null` for no value or an unreadable one
 */
export const convertToSelectionDate = (date: Date | string | null | undefined, selectionType: SelectionTypes | undefined, firstDayOfWeek: number) : Date | null => {
  const value = convertToDateObject(date, selectionType)
  return value && selectionType === 'week' ? getWeekDate(value, firstDayOfWeek) : value
}

/**
 * Converts a selected value to the date a calendar opens on to show it: the
 * value itself, unless in week selection the row that stands for its week
 * lies wholly in another month, and then the day `getWeekDate` gives that
 * week, so the opened page holds the row.
 *
 * @param date - The value as a `Date` or a string
 * @param selectionType - The unit the string names
 * @param firstDayOfWeek - The day the week rows start on, `0` for Sunday to `6` for Saturday
 * @returns The date to open on, or `null` for no value or an unreadable one
 */
export const convertToShownDate = (date: Date | string | null | undefined, selectionType: SelectionTypes | undefined, firstDayOfWeek: number) : Date | null => {
  const value = convertToDateObject(date, selectionType)
  const weekDate = convertToSelectionDate(value, selectionType, firstDayOfWeek)

  if (!value || !weekDate || weekDate === value) {
    return value
  }

  const rowStart = getStartOfWeek(weekDate, firstDayOfWeek)
  const rowEnd = createDate(rowStart.getFullYear(), rowStart.getMonth(), rowStart.getDate() + 6)
  return [rowStart, rowEnd].some(day => day.getFullYear() === value.getFullYear() && day.getMonth() === value.getMonth()) ? value : weekDate
}

/**
 * Converts a `minDate` or `maxDate` value as `convertToDateObject` does and,
 * in week selection, widens it to the day `getWeekDate` gives its week when
 * that day lies outside it, earlier for a `minDate` and later for a
 * `maxDate`, so the week of a limit stays selectable whatever day the week
 * rows start on and no limit moves inward.
 *
 * @param date - The limit as a `Date` or a string
 * @param selectionType - The unit the string names
 * @param firstDayOfWeek - The day the week rows start on, `0` for Sunday to `6` for Saturday
 * @param limit - Which limit the value is
 * @returns The limit, or `null` for no value or an unreadable one
 */
export const convertToLimitDate = (date: Date | string | null | undefined, selectionType: SelectionTypes | undefined, firstDayOfWeek: number, limit: 'max' | 'min') : Date | null => {
  const value = convertToDateObject(date, selectionType)

  if (!value || selectionType !== 'week') {
    return value
  }

  const weekDate = getWeekDate(value, firstDayOfWeek)
  return (limit === 'min' ? weekDate < value : weekDate > value) ? weekDate : value
}

/**
 * Reads a date string for a selection type, as `convertToDateObject` does,
 * and returns `null` for anything that is not a non-empty string.
 *
 * @param dateString - The string to read
 * @param locale - The locale whose format reads a day
 * @param includeTime - Whether a day is read with its time
 * @param selectionType - The unit the string names
 * @returns The date, or `null` for an unreadable value
 */
export const getLocalDateFromString = (dateString: string, locale: string = 'en-US', includeTime: boolean = false, selectionType: SelectionTypes = 'day') : Date | null => {
  if (!dateString || typeof dateString !== "string") {
    return null
  }

  return convertToDateObject(dateString, selectionType, locale, includeTime)
}

/**
 * Splits an array into `numberOfGroups` groups of
 * `Math.ceil(arr.length / numberOfGroups)` items; the groups at the end can be
 * shorter or empty.
 *
 * @param arr - The array to split
 * @param numberOfGroups - How many groups to make
 * @returns The groups, in order
 */
export const createGroupsInArray = <T>(arr: T[], numberOfGroups: number) : T[][] => {
  const perGroup = Math.ceil(arr.length / numberOfGroups)
  return Array.from({ length: numberOfGroups })
    .fill("")
    .map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup))
}

/**
 * Gives the date a calendar panel shows when it sits `order` panels after
 * the first: a month later per panel in the days view, a year later in the
 * months and quarters views, and twelve years later in the years view, keeping
 * the month of `calendarDate`.
 *
 * @param calendarDate - The date the first panel shows
 * @param order - The position of the panel, 0 for the first
 * @param view - The view the panels show
 * @returns The first day of the month the panel is anchored to, or `calendarDate` itself for the first panel
 */
export const getCalendarDate = (calendarDate: Date, order: number, view: ViewTypes) : Date => {
  if (order !== 0 && view === "days") {
    return createDate(calendarDate.getFullYear(), calendarDate.getMonth() + order, 1)
  }

  if (order !== 0 && (view === "months" || view === "quarters")) {
    return createDate(calendarDate.getFullYear() + order, calendarDate.getMonth(), 1)
  }

  if (order !== 0 && view === "years") {
    return createDate(calendarDate.getFullYear() + (YEARS_PER_PAGE * order), calendarDate.getMonth(), 1)
  }

  return calendarDate
}

/**
 * Writes a date from year 1 on as the value of a selection type, the year in
 * four digits or more: `2026W05` for a week, `2026-07` for a month, `2026Q3`
 * for a quarter and `2026` for a year.
 *
 * @param date - The date to write
 * @param selectionType - The unit to write
 * @returns The string, the date itself for a day, or `null` without a date
 */
export const getDateBySelectionType = (date: Date | null, selectionType: SelectionTypes) : string | Date | null => {
  if (date === null) {
    return null
  }

  if (selectionType === "week") {
    const { year, weekNumber } = getISOWeekNumberAndYear(date)
    return `${String(year).padStart(4, "0")}W${weekNumber.toString().padStart(2, "0")}`
  }

  const year = String(date.getFullYear()).padStart(4, "0")

  if (selectionType === "month") {
    const monthNumber = `0${date.getMonth() + 1}`.slice(-2)
    return `${year}-${monthNumber}`
  }

  if (selectionType === "quarter") {
    const quarter = Math.floor(date.getMonth() / 3) + 1
    return `${year}Q${quarter}`
  }

  if (selectionType === "year") {
    return year
  }

  return date
}

/**
 * Builds an `Intl.DateTimeFormat` in the locale's calendar when that calendar
 * shares the Gregorian months, and in the Gregorian calendar, still in the
 * locale's language and digits, when it does not (Persian, Islamic, Hebrew,
 * Chinese), because the calendar grid is Gregorian. An explicit `calendar`
 * option is kept.
 *
 * @param locale - The locale to write in
 * @param options - The formatting options
 * @returns The formatter
 */
export const createDateTimeFormat = (locale?: string, options?: Intl.DateTimeFormatOptions) : Intl.DateTimeFormat => {
  const formatter = new Intl.DateTimeFormat(locale, options)

  return options?.calendar || GREGORIAN_MONTH_CALENDARS.has(formatter.resolvedOptions().calendar) ? formatter : new Intl.DateTimeFormat(locale, { ...options, calendar: 'gregory' })
}

/**
 * Tells whether a locale writes the year before the month, as Japanese,
 * Chinese, Korean or Hungarian do.
 *
 * @param locale - The locale to check
 * @returns `true` when the year comes first
 */
export const isYearBeforeMonth = (locale?: string) : boolean => {
  const key = locale ?? ''

  if (!yearBeforeMonth.has(key)) {
    const parts = createDateTimeFormat(locale, { month: 'long', year: 'numeric' }).formatToParts(new Date(2000, 0, 1))
    yearBeforeMonth.set(key, parts.findIndex(({ type }) => type === 'year') < parts.findIndex(({ type }) => type === 'month'))
  }

  return yearBeforeMonth.get(key) as boolean
}

/**
 * Lists a locale's month names.
 *
 * @param locale - The locale to use
 * @param format - How the months are written
 * @returns The twelve month names
 */
export const getMonthsNames = (locale: string, format: 'long' | 'narrow' | 'short' | 'numeric' | '2-digit' = 'short') : string[] => {
  const formatter = createDateTimeFormat(locale, { month: format })
  return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2000, i, 1)))
}

/**
 * Creates a date formatter that keeps one `Intl.DateTimeFormat` per locale
 * and options; an invalid date is written by `toLocaleDateString`.
 *
 * @returns A function that writes a date for a locale and options
 */
export const createDateFormatter = (): ((date: Date, locale?: string, options?: Intl.DateTimeFormatOptions) => string) => {
  const formatters = new Map<string, Intl.DateTimeFormat>()

  return (date, locale, options) => {
    if (Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(locale, options)
    }

    const key = `${locale}|${options ? JSON.stringify(options) : ''}`
    let formatter = formatters.get(key)

    if (!formatter) {
      formatter = createDateTimeFormat(locale, options)
      formatters.set(key, formatter)
    }

    return formatter.format(date)
  }
}

/**
 * Lists the years a years view shows: `range` years before the given one
 * and `range` years from it.
 *
 * @param year - The year the page is built around
 * @param range - How many years sit before it
 * @returns The years, in order
 */
export const getYears = (year: number, range: number = YEARS_PER_PAGE / 2) : number[] => {
  return Array.from({ length: range * 2 }, (_, i) => year - range + i)
}

/**
 * Names the page of a years view as one range, written like the calendar's
 * other dates (see `createDateTimeFormat`). A range whose connective is
 * written in a right-to-left script is wrapped in a right-to-left isolate, so
 * it reads in order inside a left-to-right calendar too.
 *
 * @param year - The year the page is built around
 * @param locale - The locale to write the range in
 * @returns The first and the last year of the page, e.g. `2020 – 2031`
 */
export const formatYearsRange = (year: number, locale?: string) : string => {
  const years = getYears(year)
  const [start, end] = [years[0], years.at(-1) as number].map(value => createDate(value))
  const range = createDateTimeFormat(locale, { year: 'numeric' }).formatRange(start, end)

  return /(?!\p{Nd})[\u0590-\u08FF]/u.test(range) ? `\u2067${range}\u2069` : range
}

/**
 * Names a calendar cell in full: the date with its weekday in the days view,
 * then the month and year, the quarter and year, or the year.
 *
 * @param date - The first day the cell stands for
 * @param view - The view the cell belongs to
 * @param format - Writes a date with the given `Intl.DateTimeFormat` options in the calendar's locale
 * @returns The name, e.g. `Wednesday, August 12, 2026`, `August 2026`, `Q3 2026` or `2026`
 */
export const formatCellName = (date: Date, view: ViewTypes, format: (date: Date, options: Intl.DateTimeFormatOptions) => string) : string =>
  view === 'quarters' ? `Q${Math.floor(date.getMonth() / 3) + 1} ${format(date, { year: 'numeric' })}` : format(date, CELL_NAME_FORMATS[view])

/**
 * Names a week row of the days view by the days it spans, written like the
 * calendar's other dates (see `createDateTimeFormat`).
 *
 * @param days - The days of the row, as `getMonthDetails` lists them
 * @param locale - The locale to write the range in
 * @returns The first and the last day of the week, e.g. `July 27 – August 2, 2026`
 */
export const formatWeekName = (days: { date: Date }[], locale?: string) : string =>
  createDateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).formatRange(days[0].date, (days.at(-1) as { date: Date }).date)

/**
 * Lists the days of the previous month that fill the first week row of a
 * month.
 *
 * @param year - The full year
 * @param month - The month, 0 to 11
 * @param firstDayOfWeek - The first day of the week, 0 for Sunday
 * @returns The leading days, marked `previous`
 */
const getLeadingDays = (year: number, month: number, firstDayOfWeek: number) : { date: Date; month: string }[] => {
  const dates = []
  const d = createDate(year, month)
  const y = d.getFullYear()
  const m = d.getMonth()
  const firstWeekday = createDate(y, m, 1).getDay()
  let leadingDays = 6 - (6 - firstWeekday) - firstDayOfWeek

  if (firstDayOfWeek) {
    leadingDays = leadingDays < 0 ? 7 + leadingDays : leadingDays
  }

  for (let i = leadingDays * -1; i < 0; i++) {
    dates.push({
      date: createDate(y, m, i + 1),
      month: "previous"
    })
  }

  return dates
}

/**
 * Lists the days of a month.
 *
 * @param year - The full year
 * @param month - The month, 0 to 11
 * @returns The days, marked `current`
 */
const getMonthDays = (year: number, month: number) : { date: Date; month: string }[] => {
  const dates = []
  const lastDay = createDate(year, month + 1, 0).getDate()
  for (let i = 1; i <= lastDay; i++) {
    dates.push({
      date: createDate(year, month, i),
      month: "current"
    })
  }

  return dates
}

/**
 * Lists the days of the next month that fill a month page to six weeks.
 *
 * @param year - The full year
 * @param month - The month, 0 to 11
 * @param leadingDays - The days before the month on the page
 * @param monthDays - The days of the month
 * @returns The trailing days, marked `next`
 */
const getTrailingDays = (year: number, month: number, leadingDays: { date: Date; month: string }[], monthDays: { date: Date; month: string }[]) => {
  const dates = []
  const days = 42 - (leadingDays.length + monthDays.length)
  for (let i = 1; i <= days; i++) {
    dates.push({
      date: createDate(year, month + 1, i),
      month: "next"
    })
  }

  return dates
}

/**
 * Gives the ISO 8601 week of a date and the year that week belongs to.
 * Weeks start on Monday and week 1 holds 4 January, so the week-numbering
 * year can differ from the calendar year: 29 December 2025 falls in week 1
 * of 2026.
 *
 * @param date - The date to place
 * @returns The week number and the week-numbering year
 */
export const getISOWeekNumberAndYear = (date: Date) : { weekNumber: number; year: number } => {
  const tempDate = new Date(date)
  tempDate.setHours(0, 0, 0, 0)

  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7))

  const week1 = new Date(tempDate)
  week1.setMonth(0, 4)

  const weekNumber =
    1 + Math.round((tempDate.getTime() - week1.getTime()) / (86_400_000 * 7))

  return { weekNumber, year: tempDate.getFullYear() }
}

/**
 * Builds the six week rows of a month page, each with the ISO week that holds
 * most of its days and its seven days marked `previous`, `current` or `next`.
 *
 * @param year - The full year
 * @param month - The month, 0 to 11
 * @param firstDayOfWeek - The first day of the week, 0 for Sunday
 * @returns The week rows
 */
export const getMonthDetails = (year: number, month: number, firstDayOfWeek: number) : { week: { number: number; year: number }; days: { date: Date; month: string }[] }[] => {
  const daysPrevMonth = getLeadingDays(year, month, firstDayOfWeek)
  const daysThisMonth = getMonthDays(year, month)
  const daysNextMonth = getTrailingDays(
    year,
    month,
    daysPrevMonth,
    daysThisMonth
  )
  const days = [...daysPrevMonth, ...daysThisMonth, ...daysNextMonth]
  const weeks: { week: { number: number, year: number }, days: { date: Date, month: string }[] }[] = []

  for (const [index, day] of days.entries()) {
    if (index % 7 === 0 || weeks.length === 0) {
      weeks.push({
        week: { number: 0, year: 0 },
        days: []
      })
    }

    if (index % 7 === 3) {
      const { weekNumber, year } = getISOWeekNumberAndYear(day.date)
      const lastWeek = weeks[weeks.length - 1]
      if (lastWeek) {
        lastWeek.week = { number: weekNumber, year }
      }
    }

    const lastWeek = weeks[weeks.length - 1]
    if (lastWeek) {
      lastWeek.days.push(day)
    }
  }

  return weeks
}

/**
 * Finds the target closest to a date: the one whose range holds it, else the
 * nearest. Days of adjacent months are skipped, and a row of the panel's own
 * month wins a tie.
 *
 * @param targets - The cells or rows of the grid that can take the focus
 * @param anchor - The date to measure from
 * @param rows - Whether the targets are week rows, which may start in an adjacent month
 * @returns The closest target, or `undefined` when none qualifies
 */
const getClosestTarget = <T extends TabStopTarget>(targets: T[], anchor: Date, rows: boolean) : T | undefined => {
  let closest: T | undefined
  let closestGap = Number.POSITIVE_INFINITY

  for (const target of targets) {
    if (!rows && target.adjacent) {
      continue
    }

    const time = anchor.getTime()
    const gap = time < target.position.getTime() ?
      target.position.getTime() - time :
      Math.max(0, time - target.end.getTime())

    if (gap < closestGap || (gap === closestGap && closest?.adjacent && !target.adjacent)) {
      closest = target
      closestGap = gap
    }
  }

  return closest
}

/**
 * Picks the one cell or row of a calendar grid that takes the keyboard tab
 * stop: the selected target; else, with an anchor date, the target closest to
 * it, skipping days of adjacent months and letting a row of the panel's own
 * month win a tie; else the first target.
 *
 * @param targets - The cells or rows of the grid that can take the focus
 * @param anchor - The date the grid is anchored to, usually the calendar date
 * @param rows - Whether the targets are week rows, which may start in an adjacent month
 * @returns The time of the target's date, or `undefined` without targets
 */
export const getTabStop = (targets: TabStopTarget[], anchor: Date | null, rows: boolean) : number | undefined =>
  (targets.find(target => target.selected) ??
    (anchor ? getClosestTarget(targets, anchor, rows) : undefined) ??
    targets[0])?.date.getTime()

/**
 * Finds the cells and rows of a calendar grid that can take the focus.
 *
 * @param element - The element holding the grid
 * @param selector - The selector of a cell or row that can take the focus
 * @returns The matching elements, in document order
 */
export const getSelectableDates = (element: HTMLElement, selector: string = 'tr[tabindex], td[tabindex]') : HTMLElement[] =>
  [...Element.prototype.querySelectorAll.call(element, selector)] as HTMLElement[]

/**
 * Picks the cell or week row of a rendered grid that can take the focus and
 * lies closest to a date, by the dates its cells carry in `data-coreui-date`:
 * the one whose shown days hold the date, else the nearest. Days of adjacent
 * months are skipped, a row of the panel's own month wins a tie, and the
 * selection plays no part.
 *
 * @param elements - The cells or rows that can take the focus
 * @param anchor - The date to measure from
 * @param rows - Whether the elements are week rows
 * @returns The closest element, or `undefined` without one
 */
export const getClosestSelectable = (elements: HTMLElement[], anchor: Date, rows: boolean) : HTMLElement | undefined => {
  const targets = []

  for (const element of elements) {
    const cells = rows ? [...element.querySelectorAll<HTMLElement>('td[data-coreui-date]')] : [element]
    const first = cells[0]?.dataset.coreuiDate
    const last = cells.at(-1)?.dataset.coreuiDate

    if (first && last) {
      const position = parseToDateString(first)
      targets.push({
        adjacent: cells[0].matches('.previous, .next'),
        date: position,
        element,
        end: parseToDateString(last),
        position,
        selected: element.classList.contains('selected')
      })
    }
  }

  return getClosestTarget(targets, anchor, rows)?.element
}

/**
 * Moves the roving tab stop in each `.calendar` panel of a calendar: to
 * `preferred` when the panel holds it, else to the selected target (the one
 * with the `selected` class, which in a range marks its ends, not the days
 * between them), else to the target closest to `anchor`, else to the first.
 * When no panel has a target, the grids themselves take the stop.
 *
 * @param element - The calendar holding the panels
 * @param selector - The selector of a cell or row that can take the focus
 * @param anchor - The date the stop falls back to, usually the calendar date cut to the unit the view shows
 * @param rows - Whether the targets are week rows
 * @param preferred - The target that should keep the stop, usually the focused one
 */
export const setRovingTabIndex = (element: HTMLElement, selector: string, anchor: Date | null, rows: boolean, preferred?: HTMLElement | null) : void => {
  const empty = !element.querySelector(selector)

  for (const panel of element.querySelectorAll<HTMLElement>('.calendar')) {
    const targets = getSelectableDates(panel, selector)
    const grid = panel.querySelector('table')

    if (empty) {
      grid?.setAttribute('tabindex', '0')
    } else {
      grid?.removeAttribute('tabindex')
    }

    for (const stale of panel.querySelectorAll<HTMLElement>('td[tabindex="0"], tr[tabindex="0"]')) {
      if (!targets.includes(stale)) {
        stale.tabIndex = -1
      }
    }

    if (targets.length === 0) {
      continue
    }

    const active = (preferred && targets.includes(preferred) ? preferred : undefined) ??
      targets.find(target => target.classList.contains('selected')) ??
      (anchor ? getClosestSelectable(targets, anchor, rows) : undefined) ??
      targets[0]

    for (const target of targets) {
      const tabIndex = target === active ? 0 : -1

      if (target.tabIndex !== tabIndex) {
        target.tabIndex = tabIndex
      }
    }
  }
}

/**
 * Moves a date to the start of the period a calendar view shows it in: its
 * day in the days view, its month, quarter or year in the others.
 *
 * @param date - The date to move
 * @param view - The view of the calendar
 * @returns A new date at midnight on the first day of that period
 */
export const getStartOfView = (date: Date, view: ViewTypes) : Date => {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)

  if (view === 'months') {
    value.setDate(1)
  }

  if (view === 'quarters') {
    value.setMonth(Math.floor(value.getMonth() / 3) * 3, 1)
  }

  if (view === 'years') {
    value.setMonth(0, 1)
  }

  return value
}

/**
 * Moves a date back to the first day of its week.
 *
 * @param date - The date to move
 * @param firstDayOfWeek - The day a week starts on, `0` for Sunday to `6` for Saturday
 * @returns A new date on the first day of the week, at the same time of day
 */
export const getStartOfWeek = (date: Date, firstDayOfWeek: number) : Date => {
  const value = new Date(date)
  value.setDate(value.getDate() - ((value.getDay() - firstDayOfWeek + 7) % 7))
  return value
}

/**
 * Finds the day that stands for a week row: the first of its days in the ISO
 * week that holds most of them, which is the row's first day when the row
 * starts on Monday to Thursday and the Monday in it otherwise.
 *
 * @param rowStart - The first day of the row
 * @returns The day that stands for the row
 */
export const getWeekRowDate = (rowStart: Date) : Date => {
  const monday = getStartOfWeek(createDate(rowStart.getFullYear(), rowStart.getMonth(), rowStart.getDate() + 3), 1)
  return monday > rowStart ? monday : rowStart
}

/**
 * Finds the day that stands for the ISO week of a date when week rows start
 * on `firstDayOfWeek`: the day `getWeekRowDate` gives the row that holds the
 * week's Thursday, and with it most of the week.
 *
 * @param date - A day of the week
 * @param firstDayOfWeek - The day the rows start on, `0` for Sunday to `6` for Saturday
 * @returns The day that stands for the week
 */
export const getWeekDate = (date: Date, firstDayOfWeek: number) : Date => {
  const monday = getStartOfWeek(date, 1)
  return getWeekRowDate(getStartOfWeek(createDate(monday.getFullYear(), monday.getMonth(), monday.getDate() + 3), firstDayOfWeek))
}

/**
 * Finds the first or the last day, month, quarter or year the panels of a
 * calendar show.
 *
 * @param forward - Whether to take the last one
 * @param context - The state of the calendar
 * @returns The date at that edge of the view
 */
const getViewEdge = (forward: boolean, { calendarDate, calendars, view }: CalendarKeyContext) : Date => {
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const last = calendars - 1

  if (view === 'days') {
    return forward ? createDate(year, month + last + 1, 0) : createDate(year, month, 1)
  }

  if (view === 'years') {
    return createDate(forward ? year + (YEARS_PER_PAGE / 2) - 1 + (YEARS_PER_PAGE * last) : year - (YEARS_PER_PAGE / 2), 0, 1)
  }

  return forward ? createDate(year + last, view === 'quarters' ? 9 : 11, 1) : createDate(year, 0, 1)
}

/**
 * Finds the first and the last day of the month a panel of the days view
 * shows.
 *
 * @param context - The state of the calendar
 * @returns The first and the last day of the month
 */
const getPanelMonth = ({ calendarDate, panel }: CalendarKeyContext) : [Date, Date] => [
  createDate(calendarDate.getFullYear(), calendarDate.getMonth() + panel, 1),
  createDate(calendarDate.getFullYear(), calendarDate.getMonth() + panel + 1, 0)
]

/**
 * Tells whether the cell or week row of a date cannot take the focus because it
 * lies wholly outside the limits.
 *
 * @param date - The date of the cell, or the first day of the week row
 * @param context - The state of the calendar
 * @returns `true` for a cell or row outside the limits
 */
const isUnfocusable = (date: Date, { maxDate, minDate, rows, view }: CalendarKeyContext) : boolean =>
  isCellOutsideLimits(date, view, minDate, maxDate, rows)

/**
 * Walks from a date toward the focused one, a cell or a week row at a time,
 * past the ones outside the limits.
 *
 * @param start - The date to walk from; it is moved in place
 * @param date - The date of the focused cell or week row
 * @param context - The state of the calendar
 * @returns The first date on the way that can take the focus, or the focused date when there is none before it
 */
const walkToFocusable = (start: Date, date: Date, context: CalendarKeyContext) : Date => {
  const { rows, view } = context
  const sign = start > date ? -1 : 1
  const isShort = (value: Date) : boolean => sign * (date.getTime() - value.getTime()) > 0

  while (isUnfocusable(start, context) && isShort(start)) {
    if (view === 'days') {
      start.setDate(start.getDate() + (sign * (rows ? 7 : 1)))
    } else {
      start.setMonth(start.getMonth() + (sign * MONTHS_IN_PERIOD[view]))
    }
  }

  return start
}

/**
 * Finds where an arrow key takes the focus: the next day, week, month, quarter
 * or year in the direction of the key, a whole row away for the vertical keys,
 * whether it can be picked or not. A step that leaves the limits goes nowhere.
 *
 * @param date - The date the focus leaves
 * @param forward - Whether the key points forward in time
 * @param vertical - Whether the key moves by a row instead of a cell
 * @param context - The state of the calendar
 * @returns The date to focus, or `null` when the step leaves the limits
 */
const getArrowTarget = (date: Date, forward: boolean, vertical: boolean, context: CalendarKeyContext) : Date | null => {
  const { firstDayOfWeek, rows, view } = context
  const steps: Record<ViewTypes, [number, number]> = {
    days: vertical || rows ? [7, 0] : [1, 0],
    months: vertical ? [0, 3] : [0, 1],
    quarters: vertical ? [0, 12] : [0, 3],
    years: vertical ? [0, 36] : [0, 12]
  }
  const [days, months] = steps[view]
  const sign = forward ? 1 : -1
  const target = rows ? getStartOfWeek(date, firstDayOfWeek) : new Date(date)
  target.setMonth(target.getMonth() + (sign * months), target.getDate() + (sign * days))

  return isUnfocusable(target, context) ? null : target
}

/**
 * Finds where an arrow key takes the focus from a grid with nothing to focus,
 * which happens when the calendar shows a page wholly outside the limits: the
 * day, week, month, quarter or year of the limit the key points toward.
 *
 * @param forward - Whether the key points forward in time
 * @param context - The state of the calendar
 * @returns The date to focus, or `null` when the key points away from the limits
 */
const getGridArrowTarget = (forward: boolean, context: CalendarKeyContext) : Date | null => {
  const { firstDayOfWeek, maxDate, minDate, rows, view } = context
  const limit = forward ? minDate ?? createDate(1) : maxDate

  if (!limit) {
    return null
  }

  const target = getStartOfView(limit, view)
  const edge = getViewEdge(forward, context)

  if (forward ? edge >= target : edge <= target) {
    return null
  }

  return rows ? getStartOfWeek(target, firstDayOfWeek) : target
}

/**
 * Works out how far a calendar has to page for a date to fall in the months or
 * years its panels show: nothing when it already does, else the smallest move.
 * A week counts as shown while any of its days is.
 *
 * @param date - The date to show
 * @param context - The state of the calendar
 * @returns The years and months to page by
 */
const getRevealOffset = (date: Date, { calendarDate, calendars, rows, view }: CalendarKeyContext) : { months: number; years: number } => {
  if (view === 'days') {
    const end = new Date(date)
    end.setDate(end.getDate() + (rows ? 6 : 0))
    const monthsFrom = (value: Date) : number => ((value.getFullYear() - calendarDate.getFullYear()) * 12) + value.getMonth() - calendarDate.getMonth()

    return {
      months: monthsFrom(end) < 0 ? monthsFrom(end) : Math.max(0, monthsFrom(date) - calendars + 1),
      years: 0
    }
  }

  if (view === 'years') {
    const page = Math.floor((date.getFullYear() - calendarDate.getFullYear() + (YEARS_PER_PAGE / 2)) / YEARS_PER_PAGE)
    return { months: 0, years: YEARS_PER_PAGE * (page < 0 ? page : Math.max(0, page - calendars + 1)) }
  }

  const delta = date.getFullYear() - calendarDate.getFullYear()
  return { months: 0, years: delta < 0 ? delta : Math.max(0, delta - calendars + 1) }
}

/**
 * Finds where Home or End takes the focus: the first or the last day of the
 * week, week of the month, month or year of the row, or quarter of the year.
 * One outside the limits gives way to the nearest one inside toward the
 * focused date. The focus never moves back past itself: the focused date is
 * kept when nothing inside the limits is left, and when a week row already
 * lies beyond the first or last week of the month.
 *
 * @param date - The date of the focused cell or week row
 * @param last - Whether the key is End
 * @param context - The state of the calendar
 * @returns The date to focus
 */
const getRowEdge = (date: Date, last: boolean, context: CalendarKeyContext) : Date => {
  const { calendarDate, firstDayOfWeek, rows, view } = context
  const year = date.getFullYear()
  const month = date.getMonth()
  let edge: Date

  if (view === 'days' && rows) {
    edge = getStartOfWeek(getPanelMonth(context)[last ? 1 : 0], firstDayOfWeek)
  } else {
    switch (view) {
      case 'days': {
        edge = getStartOfWeek(createDate(year, month, date.getDate()), firstDayOfWeek)
        edge.setDate(edge.getDate() + (last ? 6 : 0))

        break
      }

      case 'months': {
        edge = createDate(year, month - (month % 3) + (last ? 2 : 0), 1)

        break
      }

      case 'quarters': {
        edge = createDate(year, last ? 9 : 0, 1)

        break
      }

      default: {
        const offset = year - calendarDate.getFullYear() + (YEARS_PER_PAGE / 2)
        edge = createDate(year - (offset % 3) + (last ? 2 : 0), 0, 1)
      }
    }
  }

  if ((last ? -1 : 1) * (date.getTime() - edge.getTime()) < 0) {
    return new Date(date)
  }

  return walkToFocusable(edge, date, context)
}

/**
 * Builds the action that moves the focus to a date, paging the calendar first
 * when the date is out of view, or keeps the focus in place without a date.
 *
 * @param target - The date to focus, or `null` when there is none
 * @param context - The state of the calendar
 * @returns A `move` action, or `stay`
 */
const moveTo = (target: Date | null, context: CalendarKeyContext) : CalendarKeyAction =>
  target ? { date: target, ...getRevealOffset(target, context), type: 'move' } : { type: 'stay' }

/**
 * Gives how far Page Up / Page Down turns a calendar: a month, or a year with
 * Shift, in the days view, a year in the months and quarters views, and a page
 * of `YEARS_PER_PAGE` years in the years view.
 *
 * @param direction - `1` for Page Down, `-1` for Page Up
 * @param shiftKey - Whether Shift is held
 * @param view - The view of the calendar
 * @returns The years and months to page by
 */
const getPageOffset = (direction: number, shiftKey: boolean, view: ViewTypes) : { months: number; years: number } => view === 'days' && !shiftKey ?
  { months: direction, years: 0 } :
  { months: 0, years: direction * (view === 'years' ? YEARS_PER_PAGE : 1) }

/**
 * Decides what Page Up / Page Down does on a cell or a week row: the calendar
 * turns by `getPageOffset` and the focus moves to the same day there, cut to
 * the length of the month. While the focus is on the date the previous turn
 * reached (`context.keptDay.focused`, also after a stop at `minDate` /
 * `maxDate`), the turn starts from the month that turn aimed at and keeps the
 * day the series started from, so January 31 turns to February 28 and then to
 * March 31, and a week row that starts in the previous month turns from the
 * month it was reached in. From a day of an adjacent month the calendar turns
 * only as far as that day takes. A date past `minDate` / `maxDate` gives way to
 * the last date inside the limits, and the calendar turns only when that date
 * lies outside the months the panels show.
 *
 * @param date - The date of the focused cell or week row
 * @param direction - `1` for Page Down, `-1` for Page Up
 * @param shiftKey - Whether Shift is held
 * @param context - The state of the calendar
 * @returns A `page` action, a `move` to the date the focus stops on, both with the `keptDay` for the next turn (`focused` is the start of the week for week rows), or `stay` when that is the focused date
 */
const getPageAction = (date: Date, direction: number, shiftKey: boolean, context: CalendarKeyContext) : CalendarKeyAction => {
  const { firstDayOfWeek, keptDay, maxDate, minDate, rows, view } = context
  const offset = getPageOffset(direction, shiftKey, view)
  const kept = keptDay && isSameDateAs(keptDay.focused, date) ? keptDay : null
  const day = kept ? kept.day : date.getDate()
  const from = kept ? kept.target : date
  const target = new Date(date)
  target.setFullYear(from.getFullYear() + offset.years, from.getMonth() + offset.months, 1)
  target.setDate(Math.min(day, createDate(target.getFullYear(), target.getMonth() + 1, 0).getDate()))

  const bound = direction > 0 ? maxDate : minDate ?? createDate(1)
  const [first, last] = getPanelMonth(context)
  let start: Date

  if (bound && isUnfocusable(rows ? getStartOfWeek(target, firstDayOfWeek) : target, context)) {
    const edge = getStartOfView(bound, view)
    start = rows ? getStartOfWeek(edge, firstDayOfWeek) : edge
  } else if (view === 'days' && !rows && (date < first || date > last)) {
    start = target
  } else {
    return {
      date: target,
      keptDay: { day, focused: rows ? getStartOfWeek(target, firstDayOfWeek) : target, target },
      ...offset,
      type: 'page'
    }
  }

  const stop = walkToFocusable(start, date, context)

  if (stop.getTime() === date.getTime()) {
    return { type: 'stay' }
  }

  return {
    date: stop,
    keptDay: { day, focused: stop, target: stop },
    ...getRevealOffset(stop, context),
    type: 'move'
  }
}

/**
 * Tells whether an arrow key points forward in time: down, and right, or left
 * in a right-to-left layout.
 *
 * @param key - The key value
 * @param rtl - Whether the layout runs right to left
 * @returns `true` for a key that points forward
 */
const isForwardKey = (key: string, rtl: boolean) : boolean => key === 'ArrowDown' || key === (rtl ? 'ArrowLeft' : 'ArrowRight')

/**
 * Decides what a key does on a grid with nothing to focus: the arrows move to
 * the limit they point toward, Page Up / Page Down turn the calendar, and
 * Home / End do nothing.
 *
 * @param event - The key and its modifiers
 * @param event.key - The key value
 * @param event.shiftKey - Whether Shift is held
 * @param context - The state of the calendar
 * @returns The action, or `null` for a key the grid leaves alone
 */
const getGridKeyAction = ({ key, shiftKey }: { key: string; shiftKey: boolean }, context: CalendarKeyContext) : CalendarKeyAction | null => {
  if (ARROW_KEYS.has(key)) {
    return moveTo(getGridArrowTarget(isForwardKey(key, context.rtl), context), context)
  }

  if (key === 'PageDown' || key === 'PageUp') {
    return { ...getPageOffset(key === 'PageDown' ? 1 : -1, shiftKey, context.view), type: 'page' }
  }

  return key === 'End' || key === 'Home' ? { type: 'stay' } : null
}

/**
 * Decides what a key does on a cell or a week row: Space and Enter pick its
 * date unless the key repeats while held, the arrows move to the next cell or
 * row, Home and End to the edge of the week or row, and Page Up / Page Down
 * turn the calendar and move to the same day there, or to the last date inside
 * `minDate` / `maxDate`.
 *
 * @param event - The key and its modifiers
 * @param event.code - The physical key
 * @param event.key - The key value
 * @param event.shiftKey - Whether Shift is held
 * @param event.repeat - Whether the key repeats while held
 * @param date - The date of the focused cell or week row
 * @param context - The state of the calendar
 * @returns The action, or `null` for a key the grid leaves alone
 */
const getCellKeyAction = ({ code, key, repeat, shiftKey }: { code: string; key: string; repeat?: boolean; shiftKey: boolean }, date: Date, context: CalendarKeyContext) : CalendarKeyAction | null => {
  if (ARROW_KEYS.has(key)) {
    return moveTo(getArrowTarget(date, isForwardKey(key, context.rtl), key === 'ArrowDown' || key === 'ArrowUp', context), context)
  }

  if (code === 'Space' || key === 'Enter') {
    return repeat ? { type: 'stay' } : { type: 'activate' }
  }

  if (key === 'End' || key === 'Home') {
    const target = getRowEdge(date, key === 'End', context)

    if (target.getTime() === date.getTime()) {
      return { type: 'stay' }
    }

    if (!context.rows) {
      return moveTo(target, context)
    }

    return {
      date: target,
      months: 0,
      panel: context.panel,
      type: 'move',
      years: 0
    }
  }

  return key === 'PageDown' || key === 'PageUp' ?
    getPageAction(date, key === 'PageDown' ? 1 : -1, shiftKey, context) :
    null
}

/**
 * Decides what a key does in a calendar grid. The focus moves over every cell
 * inside `minDate` / `maxDate`, whether it can be picked or not. On a cell or a
 * week row, Space and Enter pick its date, the arrows move to the next cell or
 * row, and Page Up / Page Down turn the calendar a month (a year with Shift) in
 * the days view, a year in the months and quarters views and a page of
 * `YEARS_PER_PAGE` years in the years view, and move to the same day there,
 * the day a series of page turns started from (`context.keptDay`);
 * from a day of an adjacent month the calendar turns only as far as that day
 * takes, and past `minDate` / `maxDate` they stop on the last date inside the
 * limits, turning the calendar only when that date lies outside the months the
 * panels show. Home and End move to the first and last day of the week inside
 * the limits, into the adjacent month when the week starts or ends there; with
 * week rows, to the first and last week of the month the panel shows, in that
 * panel; to the first and last month or year of the row; and to the first and
 * last quarter of the year. On a grid with nothing to focus, the arrows move to
 * the limit they point toward, Page Up / Page Down turn the calendar the same
 * way, and Home / End do nothing.
 *
 * @param event - The key and its modifiers
 * @param event.code - The physical key
 * @param event.key - The key value
 * @param event.shiftKey - Whether Shift is held
 * @param event.repeat - Whether the key repeats while held
 * @param date - The date of the focused cell or week row, `null` when the grid itself has the focus
 * @param context - The state of the calendar
 * @returns `activate` to pick the focused date, `move` to focus `date` after paging by `years` and `months` when either is not zero (inside `panel` when it is set, for week rows), `page` to page the calendar by `years` and `months` and then focus `date` (on a grid without one, its panel's tab stop), `stay` when the key is handled and the focus stays, or `null` for a key the grid leaves alone; a `move` or `page` from Page Up / Page Down on a cell or a week row carries the `keptDay` that `getKeptDay` hands back for the next key
 */
export const getCalendarKeyAction = (event: { code: string; key: string; repeat?: boolean; shiftKey: boolean }, date: Date | null, context: CalendarKeyContext) : CalendarKeyAction | null =>
  date ? getCellKeyAction(event, date, context) : getGridKeyAction(event, context)

/**
 * Gives the day a series of Page Up / Page Down turns keeps after a key: the
 * one a page turn returns, the one held so far while a turn is blocked or only
 * a modifier key is pressed, and none after any other key.
 *
 * @param key - The key value
 * @param action - What `getCalendarKeyAction` decided for the key, `null` for a key the grid leaves alone
 * @param keptDay - The day held so far, `null` without one
 * @returns The day to pass as `keptDay` with the next key, or `null`
 */
export const getKeptDay = (key: string, action: CalendarKeyAction | null, keptDay: KeptDay | null) : KeptDay | null => {
  if (action && 'keptDay' in action && action.keptDay) {
    return action.keptDay
  }

  return action?.type === 'stay' || MODIFIER_KEYS.has(key) ? keptDay : null
}

/**
 * Moves a date between two limits: a date before the earliest one becomes
 * that date, a date after the latest one becomes that date.
 *
 * @param date - The date to move
 * @param min - The earliest date allowed, or `null` without one
 * @param max - The latest date allowed, or `null` without one
 * @returns The date itself when the limits allow it, else a copy of the limit it crossed
 */
export const constrainDate = (date: Date, min: Date | null, max: Date | null) : Date => {
  if (min && date < min) {
    return new Date(min)
  }

  if (max && date > max) {
    return new Date(max)
  }

  return date
}

/**
 * Tells whether a day cannot be picked: it lies before the day of `min` or
 * before year 1, or after the day of `max`, times of day aside, or it matches
 * the disabled dates, which can be a function, a date, or an array mixing
 * functions, dates and `[start, end]` ranges.
 *
 * @param date - The day to check
 * @param min - The earliest date allowed
 * @param max - The latest date allowed
 * @param disabledDates - The dates that cannot be picked
 * @returns `true` for a day that cannot be picked
 */
export const isDateDisabled = (date: Date, min?: Date | null, max?: Date | null, disabledDates?: DisabledDate | DisabledDate[]) : boolean => {
  const day = removeTimeFromDate(date)

  if ((min && day < removeTimeFromDate(min)) || date.getFullYear() < 1) {
    return true
  }

  if (max && day > removeTimeFromDate(max)) {
    return true
  }

  if (disabledDates === undefined) {
    return false
  }

  if (typeof disabledDates === "function") {
    return disabledDates(date)
  }

  if (disabledDates instanceof Date && isSameDateAs(date, disabledDates)) {
    return true
  }

  if (Array.isArray(disabledDates) && disabledDates) {
    for (const _date of disabledDates) {
      if (typeof _date === "function" && _date(date)) {
        return true
      }

      if (Array.isArray(_date) && isDateInRange(date, _date[0], _date[1])) {
        return true
      }

      if (_date instanceof Date && isSameDateAs(date, _date)) {
        return true
      }
    }
  }

  return false
}

/**
 * Tells whether a day lies between two dates, both included, comparing days
 * without their time.
 *
 * @param date - The day to check
 * @param start - The first day of the range
 * @param end - The last day of the range
 * @returns `true` for a day in the range, and `false` while either end is missing
 */
export const isDateInRange = (date: Date, start: Date | null, end: Date | null) : boolean => {
  const _date = removeTimeFromDate(date)
  const _start = start ? removeTimeFromDate(start) : null
  const _end = end ? removeTimeFromDate(end) : null

  return Boolean(_start && _end && _start <= _date && _date <= _end)
}

/**
 * Tells whether a day is the start or the end of a selection.
 *
 * @param date - The day to check
 * @param start - The selected start
 * @param end - The selected end
 * @returns `true` when the day matches either end
 */
export const isDateSelected = (date: Date, start: Date | null, end: Date | null) : boolean => {
  if (start !== null && isSameDateAs(start, date)) {
    return true
  }

  if (end !== null && isSameDateAs(end, date)) {
    return true
  }

  return false
}

/**
 * Tells whether a disabled day comes after the start of a range, where in the
 * months, quarters and years views a day counts only when its whole period is
 * disabled. The check walks a day at a time from `startDate` while it is
 * still before `endDate`, keeping the start's time of day, so an end later in
 * the day than the start also checks the day after the end. `min` and `max`
 * are not taken into account.
 *
 * @param startDate - The first day of the range
 * @param endDate - The last day of the range
 * @param disabledDates - The dates that cannot be picked
 * @param view - The view the range is picked in
 * @returns `true` when the walk reaches a disabled day
 */
export const isDisableDateInRange = (startDate?: Date | null, endDate?: Date | null, disabledDates?: DisabledDate | DisabledDate[], view: ViewTypes = 'days') : boolean => {
  if (startDate && endDate) {
    const date = new Date(startDate)
    let disabled = false

    // eslint-disable-next-line no-unmodified-loop-condition
    while (date < endDate) {
      date.setDate(date.getDate() + 1)
      if (isCellDisabled(date, view, null, null, disabledDates)) {
        disabled = true
        break
      }
    }

    return disabled
  }

  return false
}

/**
 * Tells whether a month, quarter or year cannot be picked: it lies wholly
 * before `min` or year 1, or after `max`, or `isEveryDayDisabled` finds every
 * day of it disabled.
 *
 * @param date - A date in the period
 * @param view - The unit of the period
 * @param min - The earliest date allowed
 * @param max - The latest date allowed
 * @param disabledDates - The dates that cannot be picked
 * @returns `true` for a period that cannot be picked
 */
export const isPeriodDisabled = (date: Date, view: PeriodViewTypes, min?: Date | null, max?: Date | null, disabledDates?: DisabledDate | DisabledDate[]) : boolean => {
  const period = getPeriod(date, view)

  if ((min && period < getPeriod(min, view)) || (max && period > getPeriod(max, view)) || date.getFullYear() < 1) {
    return true
  }

  if (disabledDates === undefined) {
    return false
  }

  const months = MONTHS_IN_PERIOD[view]
  const year = date.getFullYear()
  const month = Math.floor(date.getMonth() / months) * months

  return isEveryDayDisabled(createDate(year, month, 1), createDate(year, month + months, 0), min, max, disabledDates)
}

/**
 * Tells whether a cell of a calendar view cannot be picked: a day by its own
 * date, a month, quarter or year by the whole period.
 *
 * @param date - The date of the cell
 * @param view - The view the cell belongs to
 * @param min - The earliest date allowed
 * @param max - The latest date allowed
 * @param disabledDates - The dates that cannot be picked
 * @returns `true` for a cell that cannot be picked
 */
export const isCellDisabled = (date: Date, view: ViewTypes, min?: Date | null, max?: Date | null, disabledDates?: DisabledDate | DisabledDate[]) : boolean =>
  view === 'days' ? isDateDisabled(date, min, max, disabledDates) : isPeriodDisabled(date, view, min, max, disabledDates)

/**
 * Tells whether a cell of a calendar view lies wholly outside the limits: none
 * of the days of its day, week row, month, quarter or year falls between the
 * day of `min` and the day of `max`, times of day aside, or it ends before
 * year 1. Such a cell cannot take the focus; any other cell can, whether it
 * can be picked or not.
 *
 * @param date - The date of the cell, or the first day of the week row
 * @param view - The view the cell belongs to
 * @param min - The earliest date allowed
 * @param max - The latest date allowed
 * @param rows - Whether the cell is a week row of the days view
 * @returns `true` for a cell outside the limits
 */
export const isCellOutsideLimits = (date: Date, view: ViewTypes, min?: Date | null, max?: Date | null, rows = false) : boolean => {
  const start = getStartOfView(date, view)
  const end = view === 'days' ?
    createDate(start.getFullYear(), start.getMonth(), start.getDate() + (rows ? 6 : 0)) :
    createDate(start.getFullYear(), start.getMonth() + MONTHS_IN_PERIOD[view], 0)

  return end.getFullYear() < 1 || Boolean(min && end < getStartOfView(min, 'days')) || Boolean(max && start > getStartOfView(max, 'days'))
}

/**
 * Tells whether a month, quarter or year lies between the periods of two
 * dates, both included.
 *
 * @param date - A date in the period
 * @param view - The unit of the period
 * @param start - The start of the range
 * @param end - The end of the range
 * @returns `true` for a period in the range, and `false` while either end is missing
 */
export const isPeriodInRange = (date: Date, view: PeriodViewTypes, start: Date | null, end: Date | null) : boolean => {
  if (!start || !end) {
    return false
  }

  const period = getPeriod(date, view)
  return getPeriod(start, view) <= period && period <= getPeriod(end, view)
}

/**
 * Tells whether a month, quarter or year holds the start or the end of a
 * selection.
 *
 * @param date - A date in the period
 * @param view - The unit of the period
 * @param start - The selected start
 * @param end - The selected end
 * @returns `true` when either end falls in the period
 */
export const isPeriodSelected = (date: Date, view: PeriodViewTypes, start: Date | null, end: Date | null) : boolean =>
  [start, end].some(value => value !== null && getPeriod(value, view) === getPeriod(date, view))

/**
 * Tells whether the ISO week of a date holds the start or the end of a
 * selection.
 *
 * @param date - A day of the week
 * @param start - The selected start
 * @param end - The selected end
 * @returns `true` when either end falls in the week
 */
export const isWeekSelected = (date: Date, start: Date | null, end: Date | null) : boolean =>
  [start, end].some(value => value !== null && getWeekTime(value) === getWeekTime(date))

/**
 * Tells whether the ISO week of a date lies between the weeks of two dates,
 * both included.
 *
 * @param date - A day of the week
 * @param start - The start of the range
 * @param end - The end of the range
 * @returns `true` for a week in the range, and `false` while either end is missing
 */
export const isWeekInRange = (date: Date, start: Date | null, end: Date | null) : boolean => {
  if (!start || !end) {
    return false
  }

  const week = getWeekTime(date)
  return getWeekTime(start) <= week && week <= getWeekTime(end)
}

/**
 * Tells whether two dates are the same moment, down to the millisecond.
 *
 * @param date - The first date
 * @param date2 - The second date
 * @returns `true` for the same moment, or when both are `null`
 */
export const isSameInstantAs = (date: Date | null, date2: Date | null) : boolean => {
  if (date === null || date2 === null) {
    return date === date2
  }

  return date.getTime() === date2.getTime()
}

/**
 * Tells whether two dates fall on the same day, whatever their time.
 *
 * @param date - The first date
 * @param date2 - The second date
 * @returns `true` for the same day, or when both are `null`
 */
export const isSameDateAs = (date: Date | null, date2: Date | null) : boolean => {
  if (date instanceof Date && date2 instanceof Date) {
    return (
      date.getDate() === date2.getDate() &&
      date.getMonth() === date2.getMonth() &&
      date.getFullYear() === date2.getFullYear()
    )
  }

  if (date === null && date2 === null) {
    return true
  }

  return false
}

/**
 * Tells whether a date falls on today.
 *
 * @param date - The date to check
 * @returns `true` for today
 */
export const isToday = (date: Date) : boolean => {
  const today = new Date()
  return isSameDateAs(date, today)
}

/**
 * Copies a date at the start of its day.
 *
 * @param date - The date to copy
 * @returns A new date at midnight, or at the first moment of the day when a daylight saving change skips midnight
 */
export const removeTimeFromDate = (date: Date) : Date => {
  const clearedDate = new Date(date)
  clearedDate.setHours(0, 0, 0, 0)
  return clearedDate
}

/**
 * Copies a date with the time of another.
 *
 * @param target - The date whose day is kept
 * @param source - The date whose time is taken
 * @returns A new date, `target` itself without a source, or `null` without a target
 */
export const setTimeFromDate = (target: Date | null, source: Date | null) : Date | null => {
  if (target === null) {
    return null
  }

  if (!(source instanceof Date)) {
    return target
  }

  const result = new Date(target)
  result.setHours(
    source.getHours(),
    source.getMinutes(),
    source.getSeconds(),
    source.getMilliseconds()
  )

  return result
}

/**
 * Reads a year, expanding one written with one or two digits to the century
 * that puts it no more than 50 years ahead of the current year; `0026` stays
 * the year 26.
 *
 * @param yearString - The year as written
 * @returns The full year
 */
export const parseYearSmart = (yearString: string) : number => {
  let parsedYear = Number.parseInt(yearString, 10)

  if (/^\s*\d{1,2}\D*$/.test(yearString)) {
    const currentYear = new Date().getFullYear()
    const currentCentury = Math.floor(currentYear / 100) * 100
    parsedYear = currentCentury + parsedYear

    if (parsedYear > currentYear + 50) {
      parsedYear -= 100
    }
  }

  return parsedYear
}

/**
 * Builds 1 January of a parsed year.
 *
 * @param groups - The parsed year
 * @returns 1 January of the year
 */
const createDateFromYear = (groups: YearGroups) : Date => {
  const { year } = groups
  const parsedYear = parseYearSmart(year)
  return createDate(parsedYear, 0, 1)
}

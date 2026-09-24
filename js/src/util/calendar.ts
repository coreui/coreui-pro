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
 * Finds the Monday that starts ISO week 1 of a year, the week holding 4 January.
 *
 * @param year - The full week-numbering year
 * @returns The Monday of week 1
 */
const getMondayOfISOWeek1 = (year: number) : Date => {
  const jan4 = new Date(year, 0, 4)
  const jan4DayOfWeek = jan4.getDay()
  const daysFromMonday = jan4DayOfWeek === 0 ? 6 : jan4DayOfWeek - 1
  const mondayOfWeek1 = new Date(jan4)
  mondayOfWeek1.setDate(jan4.getDate() - daysFromMonday)
  return mondayOfWeek1
}

/**
 * Finds the Monday that starts an ISO week.
 *
 * @param year - The full week-numbering year
 * @param week - The ISO week number, starting at 1
 * @returns The Monday of the week
 */
const getMondayOfISOWeek = (year: number, week: number) : Date => {
  const mondayOfWeek1 = getMondayOfISOWeek1(year)
  const weekStart = new Date(mondayOfWeek1)
  weekStart.setDate(mondayOfWeek1.getDate() + ((week - 1) * 7))
  return weekStart
}

const MONTHS_IN_PERIOD: Record<PeriodViewTypes, number> = {
  months: 1,
  quarters: 3,
  years: 12
}

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
 * Tells whether every day it reaches is disabled, walking a day at a time
 * from the later of `start` and `min` to the earlier of `end` and `max`. The
 * walk keeps the time of day it starts at, so a `min` with a time can stop it
 * before the last day.
 *
 * @param start - The first day to check
 * @param end - The last day to check
 * @param min - The earliest date allowed
 * @param max - The latest date allowed
 * @param disabledDates - The dates that cannot be picked
 * @returns `true` when every day the walk reaches is disabled
 */
const isEveryDayDisabled = (start: Date, end: Date, min: Date | null | undefined, max: Date | null | undefined, disabledDates: DisabledDate | DisabledDate[]) : boolean => {
  const startTime = min ? Math.max(start.getTime(), min.getTime()) : start.getTime()
  const endTime = max ? Math.min(end.getTime(), max.getTime()) : end.getTime()

  for (
    const currentDate = new Date(startTime);
    currentDate.getTime() <= endTime;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    if (!isDateDisabled(currentDate, min, max, disabledDates)) {
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

  return getMondayOfISOWeek(parsedYear, parsedWeek)
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

      return getMondayOfISOWeek(parsedYear, parsedWeek)
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
        return new Date(parsedYear, monthIndex, 1)
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
        return new Date(parsedYear, parsedMonth, 1)
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
      referenceDate.toLocaleString(locale) :
      referenceDate.toLocaleDateString(locale)

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

  return new Date(
    parsedYear,
    parsedMonth,
    parsedDay,
    parsedHour,
    parsedMinute,
    parsedSecond
  )
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

  return new Date(parsedYear, parsedMonth, parsedDay)
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
    return new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth() + order,
      1
    )
  }

  if (order !== 0 && (view === "months" || view === "quarters")) {
    return new Date(
      calendarDate.getFullYear() + order,
      calendarDate.getMonth(),
      1
    )
  }

  if (order !== 0 && view === "years") {
    return new Date(calendarDate.getFullYear() + (12 * order), calendarDate.getMonth(), 1)
  }

  return calendarDate
}

/**
 * Writes a date as the value of a selection type: `2026W05` for a week,
 * `2026-07` for a month, `2026Q3` for a quarter and `2026` for a year.
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
    return `${year}W${weekNumber.toString().padStart(2, "0")}`
  }

  if (selectionType === "month") {
    const monthNumber = `0${date.getMonth() + 1}`.slice(-2)
    return `${date.getFullYear()}-${monthNumber}`
  }

  if (selectionType === "quarter") {
    const quarter = Math.floor(date.getMonth() / 3) + 1
    return `${date.getFullYear()}Q${quarter}`
  }

  if (selectionType === "year") {
    return `${date.getFullYear()}`
  }

  return date
}

/**
 * Lists a locale's month names.
 *
 * @param locale - The locale to use
 * @param format - How the months are written
 * @returns The twelve month names
 */
export const getMonthsNames = (locale: string, format: 'long' | 'narrow' | 'short' | 'numeric' | '2-digit' = 'short') : string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { month: format })
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
      formatter = new Intl.DateTimeFormat(locale, options)
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
export const getYears = (year: number, range: number = 6) : number[] => {
  return Array.from({ length: range * 2 }, (_, i) => year - range + i)
}

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
  const d = new Date(year, month)
  const y = d.getFullYear()
  const m = d.getMonth()
  const firstWeekday = new Date(y, m, 1).getDay()
  let leadingDays = 6 - (6 - firstWeekday) - firstDayOfWeek

  if (firstDayOfWeek) {
    leadingDays = leadingDays < 0 ? 7 + leadingDays : leadingDays
  }

  for (let i = leadingDays * -1; i < 0; i++) {
    dates.push({
      date: new Date(y, m, i + 1),
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
  const lastDay = new Date(year, month + 1, 0).getDate()
  for (let i = 1; i <= lastDay; i++) {
    dates.push({
      date: new Date(year, month, i),
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
      date: new Date(year, month + 1, i),
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
 * Builds the six week rows of a month page, each with its ISO week and its
 * seven days marked `previous`, `current` or `next`.
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

    if ((index + 1) % 7 === 0) {
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
 * @param targets - The selectable cells or rows of the grid
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
 * @param targets - The selectable cells or rows of the grid
 * @param anchor - The date the grid is anchored to, usually the calendar date
 * @param rows - Whether the targets are week rows, which may start in an adjacent month
 * @returns The time of the target's date, or `undefined` without targets
 */
export const getTabStop = (targets: TabStopTarget[], anchor: Date | null, rows: boolean) : number | undefined =>
  (targets.find(target => target.selected) ??
    (anchor ? getClosestTarget(targets, anchor, rows) : undefined) ??
    targets[0])?.date.getTime()

/**
 * Finds the selectable cells and rows of a calendar grid.
 *
 * @param element - The element holding the grid
 * @param selector - The selector of a selectable cell or row
 * @returns The matching elements, in document order
 */
export const getSelectableDates = (element: HTMLElement, selector: string = 'tr[data-coreui-selectable], td[data-coreui-selectable]') : HTMLElement[] =>
  [...Element.prototype.querySelectorAll.call(element, selector)] as HTMLElement[]

/**
 * Picks the selectable cell or week row of a rendered grid closest to a date,
 * by the dates its cells carry in `data-coreui-date`: the one whose shown days
 * hold the date, else the nearest. Days of adjacent months are skipped, a row
 * of the panel's own month wins a tie, and the selection plays no part.
 *
 * @param elements - The selectable cells or rows
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
      const position = new Date(first)
      targets.push({
        adjacent: cells[0].matches('.previous, .next'),
        date: position,
        element,
        end: new Date(last),
        position,
        selected: element.getAttribute('aria-selected') === 'true'
      })
    }
  }

  return getClosestTarget(targets, anchor, rows)?.element
}

/**
 * Moves the roving tab stop in each `.calendar` panel of a calendar: to
 * `preferred` when the panel holds it, else to the selected target, else to
 * the target closest to `anchor`, else to the first. When no panel has a
 * target, the grids themselves take the stop.
 *
 * @param element - The calendar holding the panels
 * @param selector - The selector of a selectable cell or row
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
      targets.find(target => target.getAttribute('aria-selected') === 'true') ??
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
 * Tells whether a day cannot be picked: it lies before `min` or after
 * `max`, or it matches the disabled dates, which can be a function, a date, or
 * an array mixing functions, dates and `[start, end]` ranges.
 *
 * @param date - The day to check
 * @param min - The earliest date allowed
 * @param max - The latest date allowed
 * @param disabledDates - The dates that cannot be picked
 * @returns `true` for a day that cannot be picked
 */
export const isDateDisabled = (date: Date, min?: Date | null, max?: Date | null, disabledDates?: DisabledDate | DisabledDate[]) : boolean => {
  if (min && date < min) {
    return true
  }

  if (max && date > max) {
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
 * Tells whether a disabled day comes after the start of a range. The check
 * walks a day at a time from `startDate` while it is still before `endDate`,
 * keeping the start's time of day, so an end later in the day than the start
 * also checks the day after the end. `min` and `max` are not taken into
 * account.
 *
 * @param startDate - The first day of the range
 * @param endDate - The last day of the range
 * @param disabledDates - The dates that cannot be picked
 * @returns `true` when the walk reaches a disabled day
 */
export const isDisableDateInRange = (startDate?: Date | null, endDate?: Date | null, disabledDates?: DisabledDate | DisabledDate[]) : boolean => {
  if (startDate && endDate) {
    const date = new Date(startDate)
    let disabled = false

    // eslint-disable-next-line no-unmodified-loop-condition
    while (date < endDate) {
      date.setDate(date.getDate() + 1)
      if (isDateDisabled(date, null, null, disabledDates)) {
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
 * before `min` or after `max`, or `isEveryDayDisabled` finds every day of it
 * disabled.
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

  if ((min && period < getPeriod(min, view)) || (max && period > getPeriod(max, view))) {
    return true
  }

  if (disabledDates === undefined) {
    return false
  }

  const months = MONTHS_IN_PERIOD[view]
  const year = date.getFullYear()
  const month = Math.floor(date.getMonth() / months) * months

  return isEveryDayDisabled(new Date(year, month, 1), new Date(year, month + months, 0), min, max, disabledDates)
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
 * Reads a year, expanding a value below 100, however many digits it is
 * written with, to the century that puts it no more than 50 years ahead of the
 * current year.
 *
 * @param yearString - The year as written
 * @returns The full year
 */
export const parseYearSmart = (yearString: string) : number => {
  let parsedYear = Number.parseInt(yearString, 10)

  if (parsedYear < 100) {
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
  return new Date(parsedYear, 0, 1)
}

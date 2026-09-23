export type DisabledDate = ((date: Date) => boolean) | Date | Date[]

export type SelectionTypes = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type ViewTypes = 'days' | 'months' | 'quarters' | 'years'

export type PeriodViewTypes = Exclude<ViewTypes, 'days'>

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

const getMondayOfISOWeek1 = (year: number) : Date => {
  const jan4 = new Date(year, 0, 4)
  const jan4DayOfWeek = jan4.getDay()
  const daysFromMonday = jan4DayOfWeek === 0 ? 6 : jan4DayOfWeek - 1
  const mondayOfWeek1 = new Date(jan4)
  mondayOfWeek1.setDate(jan4.getDate() - daysFromMonday)
  return mondayOfWeek1
}

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

const getPeriod = (date: Date, view: PeriodViewTypes) : number => Math.floor(((date.getFullYear() * 12) + date.getMonth()) / MONTHS_IN_PERIOD[view])

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

export const convertIsoWeekToDate = (isoWeek: string) : Date => {
  const [year, week] = isoWeek.split(/[Ww]/)
  const parsedYear = parseYearSmart(year)
  const parsedWeek = Number.parseInt(week, 10)

  return getMondayOfISOWeek(parsedYear, parsedWeek)
}

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

const validateDateComponents = (month: string, day: string) : boolean => {
  const parsedMonth = Number.parseInt(month, 10) - 1
  const parsedDay = Number.parseInt(day, 10)

  return (
    parsedMonth >= 0 && parsedMonth <= 11 && parsedDay >= 1 && parsedDay <= 31
  )
}

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

const getExpectedPartsCount = (patterns: string[]) : number => {
  if (patterns.length === 0) {
    return 3
  }

  const firstPattern = patterns[0]
  const parts = firstPattern.split(/[-/.\s:]+/).filter(part => part.length > 0)
  return parts.length
}

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

const parseLocalDateString = (dateString: string) : Date | null => {
  const trimmed = dateString.trim()
  const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
  const _date = new Date(Date.parse(isoDateOnly ? `${trimmed}T00:00` : dateString))
  if (!Number.isNaN(_date.getTime())) {
    return _date
  }

  return null
}

export const convertToDateObject = (date: Date | string, selectionType?: SelectionTypes, locale: string = 'en-US', includeTime: boolean = false) : Date | null => {
  if (date === null) {
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

export const getLocalDateFromString = (dateString: string, locale: string = 'en-US', includeTime: boolean = false, selectionType: SelectionTypes = 'day') : Date | null => {
  if (!dateString || typeof dateString !== "string") {
    return null
  }

  return convertToDateObject(dateString, selectionType, locale, includeTime)
}

export const createGroupsInArray = <T>(arr: T[], numberOfGroups: number) : T[][] => {
  const perGroup = Math.ceil(arr.length / numberOfGroups)
  return Array.from({ length: numberOfGroups })
    .fill("")
    .map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup))
}

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

export const getMonthsNames = (locale: string, format: 'long' | 'narrow' | 'short' | 'numeric' | '2-digit' = 'short') : string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { month: format })
  return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2000, i, 1)))
}

export const getYears = (year: number, range: number = 6) : number[] => {
  return Array.from({ length: range * 2 }, (_, i) => year - range + i)
}

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

export const isDateInRange = (date: Date, start: Date | null, end: Date | null) : boolean => {
  const _date = removeTimeFromDate(date)
  const _start = start ? removeTimeFromDate(start) : null
  const _end = end ? removeTimeFromDate(end) : null

  return Boolean(_start && _end && _start <= _date && _date <= _end)
}

export const isDateSelected = (date: Date, start: Date | null, end: Date | null) : boolean => {
  if (start !== null && isSameDateAs(start, date)) {
    return true
  }

  if (end !== null && isSameDateAs(end, date)) {
    return true
  }

  return false
}

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

export const isPeriodInRange = (date: Date, view: PeriodViewTypes, start: Date | null, end: Date | null) : boolean => {
  if (!start || !end) {
    return false
  }

  const period = getPeriod(date, view)
  return getPeriod(start, view) <= period && period <= getPeriod(end, view)
}

export const isPeriodSelected = (date: Date, view: PeriodViewTypes, start: Date | null, end: Date | null) : boolean =>
  [start, end].some(value => value !== null && getPeriod(value, view) === getPeriod(date, view))

export const isSameInstantAs = (date: Date | null, date2: Date | null) : boolean => {
  if (date === null || date2 === null) {
    return date === date2
  }

  return date.getTime() === date2.getTime()
}

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

export const isToday = (date: Date) : boolean => {
  const today = new Date()
  return isSameDateAs(date, today)
}

export const removeTimeFromDate = (date: Date) : Date => {
  const clearedDate = new Date(date)
  clearedDate.setHours(0, 0, 0, 0)
  return clearedDate
}

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

const createDateFromYear = (groups: YearGroups) : Date => {
  const { year } = groups
  const parsedYear = parseYearSmart(year)
  return new Date(parsedYear, 0, 1)
}

/**
 * --------------------------------------------------------------------------
 * CoreUI PRO util/date-sections.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import {
  convertToDateObject, type DisabledDate, getISOWeekNumberAndYear, isDateDisabled, parseYearSmart, type SelectionTypes
} from './calendar.js'
import { convert12hTo24h, convert24hTo12h } from './time.js'

export type EditableSectionType = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'hour' | 'minute' | 'second' | 'meridiem'

export type EditableSection = {
  type: EditableSectionType
  length: number
  padded: boolean
  value: number | null
  cycle?: 'h12' | 'h23'
  names?: string[]
  placeholder?: string
}

export type LiteralSection = {
  type: 'literal'
  value: string
}

export type DateSection = EditableSection | LiteralSection

export type SectionInputType = 'date' | 'datetime' | 'time'

/**
 * Tells an editable section from a literal.
 *
 * @param section - The section to check
 * @returns `true` for an editable section, `false` for a literal
 */
export const isEditableSection = (section: DateSection): section is EditableSection => section.type !== 'literal'

const TOKEN_TYPES: Record<string, EditableSectionType> = {
  d: 'day',
  D: 'day',
  w: 'week',
  M: 'month',
  q: 'quarter',
  Q: 'quarter',
  y: 'year',
  Y: 'year',
  H: 'hour',
  h: 'hour',
  m: 'minute',
  s: 'second',
  A: 'meridiem',
  a: 'meridiem'
}

const QUARTER_NAMES = ['Q1', 'Q2', 'Q3', 'Q4']

/**
 * Lists a locale's month names in the grammatical form used inside a full
 * date (Polish genitive "lipca", not the standalone "lipiec").
 *
 * @param locale - The locale to use
 * @param width - The width of the names
 * @returns The twelve month names
 */
export const getFormatMonthNames = (locale: string, width: 'long' | 'short'): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: width, day: 'numeric' })

  return Array.from({ length: 12 }, (_, index) =>
    formatter.formatToParts(new Date(2000, index, 15)).find(part => part.type === 'month')!.value)
}

/**
 * Lists a locale's day period names, such as `['AM', 'PM']`.
 *
 * @param locale - The locale to use
 * @returns The morning and the evening name
 */
export const getDayPeriodNames = (locale: string): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true })

  return [new Date(2000, 0, 1, 9), new Date(2000, 0, 1, 21)].map(date => {
    const part = formatter.formatToParts(date).find(({ type }) => type === 'dayPeriod')
    return part ? part.value : (date.getHours() < 12 ? 'AM' : 'PM')
  })
}

/**
 * Creates an empty editable section for a format token.
 *
 * @param char - The token character, such as `d`, `M`, `H` or `a`
 * @param tokenLength - How many times the character repeats, such as 2 for `dd` or 4 for `yyyy`
 * @param locale - The locale that names months and day periods
 * @param monthNames - Month names to use instead of the locale's
 * @returns The section
 */
const createSection = (char: string, tokenLength: number, locale = 'default', monthNames: string[] | null = null): EditableSection => {
  const type = TOKEN_TYPES[char]

  if (type === 'year') {
    return {
      type, length: tokenLength <= 2 ? 2 : 4, padded: true, value: null
    }
  }

  if (type === 'month' && tokenLength >= 3) {
    const names = monthNames || getFormatMonthNames(locale, tokenLength === 3 ? 'short' : 'long')

    return {
      type, length: 2, padded: true, value: null, names, placeholder: 'M'.repeat(tokenLength)
    }
  }

  if (type === 'hour') {
    return {
      type, length: 2, cycle: char === 'H' ? 'h23' : 'h12', padded: tokenLength > 1, value: null, placeholder: char.repeat(2)
    }
  }

  if (type === 'minute' || type === 'second') {
    return {
      type, length: 2, padded: tokenLength > 1, value: null, placeholder: char.repeat(2)
    }
  }

  if (type === 'meridiem') {
    return {
      type, length: 2, padded: true, value: null, names: getDayPeriodNames(locale), placeholder: char === 'a' ? 'am' : 'AM'
    }
  }

  if (type === 'quarter') {
    if (tokenLength >= 3) {
      return {
        type, length: 1, padded: false, value: null, names: QUARTER_NAMES, placeholder: 'Q'.repeat(tokenLength)
      }
    }

    return {
      type, length: 1, padded: tokenLength > 1, value: null
    }
  }

  return {
    type, length: 2, padded: tokenLength > 1, value: null
  }
}

/**
 * Gives the range of values a section accepts.
 *
 * @param section - The section, or an object with its `type` and, for hours, its `cycle`
 * @returns The inclusive bounds
 */
export const getSectionBounds = (section: Pick<EditableSection, 'type' | 'cycle'>): { min: number, max: number } => {
  switch (section.type) {
    case 'day': {
      return { min: 1, max: 31 }
    }

    case 'week': {
      return { min: 1, max: 53 }
    }

    case 'month': {
      return { min: 1, max: 12 }
    }

    case 'quarter': {
      return { min: 1, max: 4 }
    }

    case 'hour': {
      return section.cycle === 'h12' ? { min: 1, max: 12 } : { min: 0, max: 23 }
    }

    case 'minute':
    case 'second': {
      return { min: 0, max: 59 }
    }

    case 'meridiem': {
      return { min: 1, max: 2 }
    }

    default: {
      return { min: 1, max: 9999 }
    }
  }
}

/**
 * Parses a format string into sections and literals. Both dayjs/moment
 * tokens (`DD.MM.YYYY`) and date-fns/Unicode tokens (`dd.MM.yyyy`) work,
 * including text months (`MMM`, `MMMM`) and time tokens (`HH`/`H` for the
 * 24-hour clock, `hh`/`h` for the 12-hour clock, `mm`, `ss`, `A`/`a`); any other
 * character is a literal. Text in single quotes is always a literal, even token
 * letters (`'Week' ww` renders "Week 29"), and a doubled quote (`''`) writes the
 * quote itself.
 *
 * @param format - The format string
 * @param locale - The locale that names months and day periods
 * @param monthNames - Month names to use instead of the locale's
 * @returns The sections and literals, in order
 */
export const getSectionsFromFormat = (format: string, locale = 'default', monthNames: string[] | null = null): DateSection[] => {
  const sections: DateSection[] = []
  let literal = ''
  let index = 0

  while (index < format.length) {
    const char = format[index]

    if (char === '\'') {
      if (format[index + 1] === '\'') {
        literal += '\''
        index += 2
        continue
      }

      index++

      while (index < format.length) {
        if (format[index] === '\'' && format[index + 1] !== '\'') {
          index++
          break
        }

        literal += format[index]
        index += format[index] === '\'' ? 2 : 1
      }

      continue
    }

    if (TOKEN_TYPES[char]) {
      if (literal) {
        sections.push({ type: 'literal', value: literal })
        literal = ''
      }

      let length = 1
      while (index + length < format.length && format[index + length] === char) {
        length++
      }

      sections.push(createSection(char, length, locale, monthNames))
      index += length
      continue
    }

    literal += char
    index++
  }

  if (literal) {
    sections.push({ type: 'literal', value: literal })
  }

  return sections
}

const PART_TOKENS: Record<string, string> = {
  year: 'y',
  month: 'M',
  day: 'd',
  minute: 'm',
  second: 's',
  dayPeriod: 'A'
}

/**
 * Maps the parts of a formatted reference date to sections and literals.
 *
 * @param formatter - The formatter whose parts are read
 * @param locale - The locale that names months and day periods
 * @returns The sections and literals, in order
 */
const getSectionsFromParts = (formatter: Intl.DateTimeFormat, locale: string): DateSection[] => {
  const { hourCycle } = formatter.resolvedOptions()
  const hourChar = hourCycle === 'h11' || hourCycle === 'h12' ? 'h' : 'H'
  const sections: DateSection[] = []

  for (const part of formatter.formatToParts(new Date(2018, 11, 24, 15, 45, 35))) {
    const char = part.type === 'hour' ? hourChar : PART_TOKENS[part.type]

    if (char) {
      sections.push(createSection(char, part.type === 'year' ? 4 : 2, locale))
      continue
    }

    const previous = sections[sections.length - 1]
    if (previous && previous.type === 'literal') {
      previous.value += part.value
      continue
    }

    sections.push({ type: 'literal', value: part.value })
  }

  return sections
}

/**
 * Derives the sections of a locale's numeric date format.
 *
 * @param locale - The locale to use
 * @returns The sections and literals, in order
 */
export const getSectionsFromLocale = (locale: string): DateSection[] =>
  getSectionsFromParts(new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }), locale)

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
 * Derives the week mask of a locale the way the native week input shows it
 * ("Week 29, 2026"): the localized label, the ISO week number and the ISO
 * week-numbering year.
 *
 * @param locale - The locale to use
 * @returns The sections and literals, in order
 */
export const getWeekSectionsFromLocale = (locale: string): DateSection[] =>
  getSectionsFromFormat(`'${getWeekLabel(locale).replaceAll('\'', '\'\'')}' ww, yyyy`, locale)

/**
 * Derives the sections of a locale's time format.
 *
 * @param locale - The locale to use
 * @param seconds - Whether the time has a seconds section
 * @returns The sections and literals, in order
 */
export const getTimeSectionsFromLocale = (locale: string, seconds = false): DateSection[] =>
  getSectionsFromParts(new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: seconds ? '2-digit' : undefined
  }), locale)

/**
 * Derives the sections of a locale's date and time format.
 *
 * @param locale - The locale to use
 * @param seconds - Whether the time has a seconds section
 * @returns The sections and literals, in order
 */
export const getDateTimeSectionsFromLocale = (locale: string, seconds = false): DateSection[] =>
  getSectionsFromParts(new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: seconds ? '2-digit' : undefined
  }), locale)

export type SectionFormat = ((locale: string) => DateSection[]) | string | null

export type SectionEntry = { draft: string, value: number, completed: boolean }

const FORMAT_BY_SELECTION_TYPE: Record<string, SectionFormat> = {
  month: 'MM/yyyy',
  quarter: 'QQQ yyyy',
  week: getWeekSectionsFromLocale,
  year: 'yyyy'
}

/**
 * Resolves the field format of a picker: an explicit format wins, and every
 * selection type other than `day` gets a mask of its own unit.
 *
 * @param format - The `format` option, `null` or `undefined` when it is not set
 * @param selectionType - The `selectionType` option
 * @returns The format, or `null` for the locale's day mask
 */
export const getPickerFormat = (format: SectionFormat | undefined, selectionType: SelectionTypes = 'day'): SectionFormat =>
  format || FORMAT_BY_SELECTION_TYPE[selectionType] || null

/**
 * Resolves the sections of the `format` option.
 *
 * @param format - A token string, a function returning sections, or `null` or `undefined` for the locale's layout
 * @param locale - The locale that names months and day periods and derives the layout without a format
 * @param monthNames - Month names to use instead of the locale's
 * @param includeTime - Whether the locale's layout carries the time; `{ seconds }` also decides the seconds section
 * @returns The sections and literals, in order
 */
export const getSectionLayout = (format: SectionFormat | undefined, locale: string, monthNames: string[] | null = null, includeTime: boolean | { seconds: boolean } = false): DateSection[] => {
  if (typeof format === 'function') {
    return format(locale)
  }

  if (format) {
    return getSectionsFromFormat(format, locale, monthNames)
  }

  return includeTime ?
    getDateTimeSectionsFromLocale(locale, typeof includeTime === 'object' ? includeTime.seconds : true) :
    getSectionsFromLocale(locale)
}

/**
 * Reads the hour cycle of a layout.
 *
 * @param layout - The sections and literals of a field
 * @returns `'h12'` or `'h23'`, or `undefined` for a layout without hours
 */
export const getHourCycle = (layout: DateSection[]): EditableSection['cycle'] =>
  layout.find((section): section is EditableSection => section.type === 'hour')?.cycle

/**
 * Applies a typed digit to a section: digits add up while the value is still
 * ambiguous and start over when it would exceed the bounds.
 *
 * @param section - The section being typed into
 * @param draft - The digits typed into the section so far
 * @param digit - The digit just typed
 * @param max - The upper bound, such as the day count of the selected month
 * @returns The next draft, the value, and whether the section is complete
 */
export const applyDigitToSection = (section: EditableSection, draft: string, digit: string, max: number = getSectionBounds(section).max): SectionEntry => {
  const length = section.type === 'year' ? section.length : 2
  let next = `${draft || ''}${digit}`.slice(-length)

  if (Number.parseInt(next, 10) > max) {
    next = digit
  }

  const value = Number.parseInt(next, 10)

  return {
    draft: next,
    value,
    completed: next.length >= length || value * 10 > max
  }
}

/**
 * Applies a typed letter to a text section (month names, day periods) by
 * matching the start of its names: "m" picks March, and "may" then switches to
 * May; the section is complete when a single name is left. A letter that
 * matches no name starts the draft over.
 *
 * @param section - The text section being typed into
 * @param draft - The letters typed into the section so far
 * @param letter - The letter just typed
 * @returns The next draft, the value and whether the section is complete, or `null` when no name matches
 */
export const applyLetterToSection = (section: EditableSection, draft: string, letter: string): SectionEntry | null => {
  if (!section.names) {
    return null
  }

  const names = section.names.map(name => name.toLowerCase())
  let next = `${draft || ''}${letter}`.toLowerCase()
  let matches = names.filter(name => name.startsWith(next))

  if (matches.length === 0) {
    next = letter.toLowerCase()
    matches = names.filter(name => name.startsWith(next))
  }

  if (matches.length === 0) {
    return null
  }

  return {
    draft: next,
    value: names.indexOf(matches[0]) + 1,
    completed: matches.length === 1
  }
}

/**
 * Steps a section value up or down, wrapping around within its bounds;
 * the year clamps instead. An empty section starts at its minimum when stepping
 * up and at its maximum when stepping down, and an empty year starts at the
 * current year.
 *
 * @param section - The section to step
 * @param delta - The signed step
 * @param max - The upper bound, such as the day count of the selected month
 * @returns The next value
 */
export const getIncrementedSectionValue = (section: EditableSection, delta: number, max: number = getSectionBounds(section).max): number => {
  const { min } = getSectionBounds(section)

  if (section.value === null) {
    if (section.type === 'year') {
      return new Date().getFullYear()
    }

    return delta > 0 ? min : max
  }

  if (section.type === 'year') {
    return Math.min(Math.max(section.value + delta, min), max)
  }

  const range = max - min + 1
  return ((((section.value - min + delta) % range) + range) % range) + min
}

/**
 * Counts the days of a month in any year, including years below 100.
 *
 * @param year - The full year
 * @param month - The month, 1 to 12
 * @returns The number of days
 */
export const getDaysInMonth = (year: number, month: number): number => {
  const date = new Date(2000, 0, 1)
  date.setFullYear(year, month, 0)
  return date.getDate()
}

/**
 * Counts the ISO weeks of a week-numbering year.
 *
 * @param year - The full week-numbering year
 * @returns 52 or 53
 */
export const getISOWeeksInYear = (year: number): number => {
  const date = new Date(2000, 0, 1)
  date.setFullYear(year, 11, 28)
  return getISOWeekNumberAndYear(date).weekNumber
}

/**
 * Finds the Monday that starts an ISO week.
 *
 * @param year - The full week-numbering year
 * @param week - The ISO week number, starting at 1
 * @returns The Monday of the week
 */
export const getDateOfISOWeek = (year: number, week: number): Date => {
  const date = new Date(2000, 0, 1)
  date.setFullYear(year, 0, 4)
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + ((week - 1) * 7))
  return date
}

/**
 * Gives the highest week the week section accepts for the selected year, and
 * 53 while the year is unknown, since it can still turn out to be a long one.
 *
 * @param sections - The sections and literals of a field
 * @returns The number of weeks in the selected year
 */
export const getWeekSectionMax = (sections: DateSection[]): number => {
  const yearSection = sections.find(section => section.type === 'year')
  const year = yearSection && isEditableSection(yearSection) ? getFullYearFromSection(yearSection) : null

  if (year === null) {
    return getSectionBounds({ type: 'week' }).max
  }

  return getISOWeeksInYear(year)
}

/**
 * Gives the highest day the day section accepts for the selected month and
 * year: 31 while the month is unknown, and a leap year while the year is
 * unknown, since February can still turn out to have 29 days.
 *
 * @param sections - The sections and literals of a field
 * @returns The number of days in the selected month
 */
export const getDaySectionMax = (sections: DateSection[]): number => {
  let month: number | null = null
  let year: number | null = null

  for (const section of sections) {
    if (section.type === 'month') {
      month = section.value
    }

    if (section.type === 'year') {
      year = getFullYearFromSection(section)
    }
  }

  if (month === null) {
    return getSectionBounds({ type: 'day' }).max
  }

  return getDaysInMonth(year === null ? 2000 : year, month)
}

/**
 * Reads the full year of a year section, expanding a two-digit value to the
 * nearest fitting century.
 *
 * @param section - The year section
 * @returns The full year, or `null` for an empty section
 */
export const getFullYearFromSection = (section: EditableSection): number | null => {
  if (section.value === null) {
    return null
  }

  if (section.length === 2 && section.value < 100) {
    return parseYearSmart(String(section.value).padStart(2, '0'))
  }

  return section.value
}

/**
 * Builds a date from filled sections, cutting the day to the length of the
 * month. A week section gives the Monday of the ISO week (the year section then
 * holds the ISO week-numbering year), and a quarter section the first day of
 * the quarter. A layout without a date part gets 1 January 1970, and one
 * without a time part gets midnight.
 *
 * @param sections - The sections and literals of a field
 * @returns The date, or `null` while any section is empty
 */
export const getDateFromSections = (sections: DateSection[]): Date | null => {
  const values: Record<string, any> = {}
  let hourCycle = null

  for (const section of sections) {
    if (section.type === 'literal') {
      continue
    }

    if (section.value === null) {
      return null
    }

    values[section.type] = section.type === 'year' ? getFullYearFromSection(section) : section.value

    if (section.type === 'hour') {
      hourCycle = section.cycle
    }
  }

  const year = values.year === undefined ? 1970 : values.year
  const month = values.month === undefined ?
    (values.quarter === undefined ? 1 : ((values.quarter - 1) * 3) + 1) :
    values.month
  const day = values.day === undefined ? 1 : values.day
  let hour = values.hour === undefined ? 0 : values.hour

  if (hourCycle === 'h12') {
    hour = convert12hTo24h(values.meridiem === 2 ? 'pm' : 'am', hour)
  }

  const date = values.week === undefined ? new Date(2000, 0, 1) : getDateOfISOWeek(year, Math.min(values.week, getISOWeeksInYear(year)))

  if (values.week === undefined) {
    date.setFullYear(year, month - 1, Math.min(day, getDaysInMonth(year, month)))
  }

  date.setHours(hour, values.minute === undefined ? 0 : values.minute, values.second === undefined ? 0 : values.second, 0)
  return date
}

/**
 * Fills a copy of the sections with the values of a date. In a layout with a
 * week section the year section takes the ISO week-numbering year, which can
 * differ from the calendar year around 1 January.
 *
 * @param sections - The sections and literals of a field
 * @param date - The date to read, or `null` to empty the sections
 * @returns The filled sections
 */
export const setSectionsFromDate = (sections: DateSection[], date: Date | null): DateSection[] => {
  const weekInfo = date && sections.some(section => section.type === 'week') ? getISOWeekNumberAndYear(date) : null

  return sections.map(section => {
    if (section.type === 'literal') {
      return section
    }

    if (!date) {
      return { ...section, value: null }
    }

    switch (section.type) {
      case 'day': {
        return { ...section, value: date.getDate() }
      }

      case 'week': {
        return { ...section, value: weekInfo!.weekNumber }
      }

      case 'month': {
        return { ...section, value: date.getMonth() + 1 }
      }

      case 'quarter': {
        return { ...section, value: Math.floor(date.getMonth() / 3) + 1 }
      }

      case 'hour': {
        return { ...section, value: section.cycle === 'h12' ? convert24hTo12h(date.getHours()) : date.getHours() }
      }

      case 'minute': {
        return { ...section, value: date.getMinutes() }
      }

      case 'second': {
        return { ...section, value: date.getSeconds() }
      }

      case 'meridiem': {
        return { ...section, value: date.getHours() >= 12 ? 2 : 1 }
      }

      default: {
        return { ...section, value: weekInfo ? weekInfo.year : date.getFullYear() }
      }
    }
  })
}

/**
 * Writes a section value for display: padded with zeros when the section is
 * padded, cut to two digits for a two-digit year, and as its name in a text
 * section.
 *
 * @param section - The section to write
 * @param placeholder - What an empty section shows
 * @returns The text of the section
 */
export const formatSectionValue = (section: EditableSection, placeholder = ''): string => {
  if (section.value === null) {
    return placeholder
  }

  if (section.names) {
    return section.names[section.value - 1]
  }

  const value = section.type === 'year' && section.length === 2 ? section.value % 100 : section.value

  return section.padded === false ? String(value) : String(value).padStart(section.length, '0')
}

/**
 * Writes the sections and literals as the masked text of a field.
 *
 * @param sections - The sections and literals of a field
 * @returns The masked text
 */
export const formatSections = (sections: DateSection[]): string =>
  sections.map(section => (section.type === 'literal' ? section.value : formatSectionValue(section))).join('')

/**
 * Reads pasted text into a copy of the sections by matching names (months,
 * day periods) and then groups of digits to the editable sections in order.
 *
 * @param text - The pasted text
 * @param sections - The sections and literals of a field
 * @returns The filled sections, or `null` when the text does not fit the layout
 */
export const getSectionsFromString = (text: string, sections: DateSection[]): DateSection[] | null => {
  let normalizedText = text

  for (const section of sections) {
    if (!isEditableSection(section) || !section.names) {
      continue
    }

    const names = section.names.toSorted((a, b) => b.length - a.length)
    const match = names.find(name => normalizedText.toLowerCase().includes(name.toLowerCase()))

    if (!match) {
      continue
    }

    const index = normalizedText.toLowerCase().indexOf(match.toLowerCase())
    normalizedText = `${normalizedText.slice(0, index)} ${section.names.indexOf(match) + 1} ${normalizedText.slice(index + match.length)}`
  }

  const digitGroups = normalizedText.match(/\d+/g)
  const editableCount = sections.filter(section => section.type !== 'literal').length

  if (!digitGroups || digitGroups.length !== editableCount) {
    return null
  }

  let groupIndex = 0
  const next: DateSection[] = []

  for (const section of sections) {
    if (section.type === 'literal') {
      next.push(section)
      continue
    }

    const value = Number.parseInt(digitGroups[groupIndex++], 10)
    const { min, max } = getSectionBounds(section)

    if (Number.isNaN(value) || value < min || value > max) {
      return null
    }

    next.push({ ...section, value })
  }

  return next
}

/**
 * Converts the value a date or time field is given to a `Date`. A time field
 * also reads time-only strings such as `'14:30'` or `'2:05 pm'` on 1 January
 * 1970, without checking the range, so `'24:00'` rolls over into 2 January;
 * a date and time field reads the time with the date before trying the date
 * alone.
 *
 * @param value - The value as a `Date` or a string
 * @param type - The kind of field
 * @param locale - The locale that reads localized date strings
 * @returns The date, or `null` for an empty or unreadable value
 */
export const convertValue = (value: Date | string | null | undefined, type: SectionInputType, locale: string): Date | null => {
  if (value === null || value === undefined) {
    return null
  }

  if (type === 'time' && typeof value === 'string') {
    const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(am|pm))?$/i.exec(value.trim())

    if (match) {
      const [, hour, minute, second, meridiem] = match
      const hours = meridiem ?
        convert12hTo24h(meridiem.toLowerCase(), Number.parseInt(hour, 10)) :
        Number.parseInt(hour, 10)

      return new Date(1970, 0, 1, hours, Number.parseInt(minute, 10), second ? Number.parseInt(second, 10) : 0)
    }
  }

  if (type === 'datetime') {
    const withTime = convertToDateObject(value, 'day', locale, true)

    if (withTime) {
      return withTime
    }
  }

  return convertToDateObject(value, 'day', locale, type === 'time')
}

/**
 * Brings a date to what a field with the given layout holds: the parts the
 * layout has no section for are dropped, such as the time in a date-only field
 * or the day in a month field.
 *
 * @param layout - The sections and literals of the field
 * @param date - The date to bring into the layout
 * @returns The date the field holds, or `null` for an empty or invalid date
 */
export const getDateWithin = (layout: DateSection[], date: Date | null): Date | null =>
  date && !Number.isNaN(date.getTime()) ?
    getDateFromSections(setSectionsFromDate(layout, date)) :
    null

/**
 * Writes a date the way a field with the given layout shows it.
 *
 * @param layout - The sections and literals of the field
 * @param date - The date to write
 * @returns The masked text, or an empty string without a date
 */
export const formatDateWithin = (layout: DateSection[], date: Date | null): string =>
  date ? formatSections(setSectionsFromDate(layout, date)) : ''

/**
 * Tells whether a field with the given layout can hold a date: the date is
 * first brought into the layout and then checked against the bounds and the
 * disabled dates.
 *
 * @param layout - The sections and literals of the field
 * @param date - The date to check
 * @param minDate - The earliest date allowed
 * @param maxDate - The latest date allowed
 * @param disabledDates - The dates that cannot be picked
 * @returns `true` for a selectable date and for no date at all, `false` for an invalid date
 */
export const isDateSelectableWithin = (layout: DateSection[], date: Date | null, minDate: Date | null, maxDate: Date | null, disabledDates?: DisabledDate | DisabledDate[]): boolean => {
  if (date === null) {
    return true
  }

  const normalized = getDateWithin(layout, date)

  return normalized !== null && !isDateDisabled(normalized, minDate, maxDate, disabledDates)
}

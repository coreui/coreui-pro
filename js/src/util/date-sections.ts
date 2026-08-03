/**
 * --------------------------------------------------------------------------
 * CoreUI PRO util/date-sections.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import { getISOWeekNumberAndYear, parseYearSmart } from './calendar.js'
import { convert12hTo24h, convert24hTo12h } from './time.js'

export type DateSection = {
  type: string
  value: any
  length?: number
  padded?: boolean
  cycle?: string
  names?: string[]
  placeholder?: string
}

// Uppercase `W` is deliberately not a token, so masks can spell the ISO week
// prefix as a literal: `yyyy-Www` renders "2026-W27".
const TOKEN_TYPES: Record<string, string> = {
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
 * Returns the localized month names in the grammatical form used inside a
 * full date (e.g. Polish genitive "lipca", not the standalone "lipiec"),
 * extracted from the month part of a formatted day-month-year date.
 * @param {string} locale The locale to use.
 * @param {('short' | 'long')} width The month name width.
 * @returns {string[]} The twelve month names.
 */
export const getFormatMonthNames = (locale: string, width: 'long' | 'short'): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: width, day: 'numeric' })

  return Array.from({ length: 12 }, (_, index) =>
    formatter.formatToParts(new Date(2000, index, 15)).find(part => part.type === 'month')!.value)
}

/**
 * Returns the localized day period names, e.g. ["AM", "PM"].
 * @param {string} locale The locale to use.
 * @returns {string[]} The two day period names.
 */
export const getDayPeriodNames = (locale: string): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true })

  return [new Date(2000, 0, 1, 9), new Date(2000, 0, 1, 21)].map(date => {
    const part = formatter.formatToParts(date).find(({ type }) => type === 'dayPeriod')
    return part ? part.value : (date.getHours() < 12 ? 'AM' : 'PM')
  })
}

/**
 * Creates an editable section descriptor for a format token.
 * @param {string} char The token character (e.g. "d", "M", "H", "a").
 * @param {number} tokenLength The length of the token run (e.g. 2 for "dd", 4 for "yyyy").
 * @param {string} [locale] The locale used to resolve month and day period names.
 * @param {string[] | null} [monthNames] Custom month names overriding the locale-derived ones.
 * @returns {object} The section descriptor with `type`, `length`, `padded` and an empty `value`.
 */
const createSection = (char: string, tokenLength: number, locale = 'default', monthNames: string[] | null = null): DateSection => {
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
 * Returns the allowed value bounds for a section.
 * @param {object} section The section descriptor (or an object with `type` and, for hours, `cycle`).
 * @returns {{min: number, max: number}} The inclusive bounds.
 */
export const getSectionBounds = (section: DateSection): { min: number, max: number } => {
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
 * Parses a date or time format string into a list of sections and literals.
 * Accepts both dayjs/moment-style (`DD.MM.YYYY`) and date-fns/Unicode-style
 * (`dd.MM.yyyy`) tokens, including text month tokens (`MMM`, `MMMM`) and time
 * tokens (`HH`/`H` for the 23-hour cycle, `hh`/`h` for the 12-hour cycle,
 * `mm`, `ss`, `A`/`a`); any other character becomes a literal. Text wrapped in
 * single quotes is always a literal — even token letters (`'Week' ww` renders
 * "Week 29") — and a doubled quote (`''`) escapes the quote character itself.
 * @param {string} format The format string.
 * @param {string} [locale] The locale used to resolve month and day period names.
 * @param {string[] | null} [monthNames] Custom month names overriding the locale-derived ones.
 * @returns {Array} The ordered list of section and literal descriptors.
 */
export const getSectionsFromFormat = (format: string, locale = 'default', monthNames: string[] | null = null): DateSection[] => {
  const sections = []
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
 * Maps the parts of a formatted reference date to section descriptors.
 * @param {Intl.DateTimeFormat} formatter The formatter to read parts from.
 * @param {string} locale The locale used to resolve names.
 * @returns {Array} The ordered list of section and literal descriptors.
 */
const getSectionsFromParts = (formatter: Intl.DateTimeFormat, locale: string): DateSection[] => {
  const { hourCycle } = formatter.resolvedOptions()
  const hourChar = hourCycle === 'h11' || hourCycle === 'h12' ? 'h' : 'H'
  const sections = []

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
 * Derives the list of sections and literals from the locale's numeric date format.
 * @param {string} locale The locale to use.
 * @returns {Array} The ordered list of section and literal descriptors.
 */
export const getSectionsFromLocale = (locale: string): DateSection[] =>
  getSectionsFromParts(new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }), locale)

/**
 * Returns the localized week-of-year label, capitalized the way the native
 * week input renders it ("Week", "Tydzień", "Woche"). Falls back to "Week"
 * where `Intl.DisplayNames` has no data.
 * @param {string} locale The locale to use.
 * @returns {string} The label.
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
 * Derives the week mask from the locale, mirroring the native week input's
 * presentation ("Week 29, 2026"): a fixed localized label, the ISO week
 * number, and the ISO week-numbering year.
 * @param {string} locale The locale to use.
 * @returns {Array} The ordered list of section and literal descriptors.
 */
export const getWeekSectionsFromLocale = (locale: string): DateSection[] =>
  getSectionsFromFormat(`'${getWeekLabel(locale).replaceAll('\'', '\'\'')}' ww, yyyy`, locale)

/**
 * Derives the list of sections and literals from the locale's time format.
 * @param {string} locale The locale to use.
 * @param {boolean} [seconds] Whether to include a seconds section.
 * @returns {Array} The ordered list of section and literal descriptors.
 */
export const getTimeSectionsFromLocale = (locale: string, seconds = false): DateSection[] =>
  getSectionsFromParts(new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: seconds ? '2-digit' : undefined
  }), locale)

/**
 * Derives the list of sections and literals from the locale's date and time format.
 * @param {string} locale The locale to use.
 * @param {boolean} [seconds] Whether to include a seconds section.
 * @returns {Array} The ordered list of section and literal descriptors.
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

/**
 * Resolves the section layout from the `format` config option.
 * @param {string | Function | null} format A token string, a function returning sections, or null for locale-derived sections.
 * @param {string} locale The locale to use when `format` is null or a function.
 * @param {string[] | null} [monthNames] Custom month names for text month sections.
 * @returns {Array} The ordered list of section and literal descriptors.
 */
export const getDateSections = (format: string | ((locale: string) => DateSection[]) | null, locale: string, monthNames: string[] | null = null): DateSection[] => {
  if (typeof format === 'function') {
    return format(locale)
  }

  if (typeof format === 'string' && format.length > 0) {
    return getSectionsFromFormat(format, locale, monthNames)
  }

  return getSectionsFromLocale(locale)
}

/**
 * Applies a typed digit to a section, MUI DateField-style: digits accumulate
 * while the value stays ambiguous and restart when it would exceed the bounds.
 * @param {object} section The section descriptor.
 * @param {string} draft The digits typed into the section so far.
 * @param {string} digit The newly typed digit.
 * @param {number} [max] The upper bound, e.g. the day count of the selected month.
 * @returns {{draft: string, value: number, completed: boolean}} The next draft, numeric value and whether the section is complete.
 */
export const applyDigitToSection = (section: DateSection, draft: string, digit: string, max: number = getSectionBounds(section).max): { draft: string, value: number, completed: boolean } => {
  const length = (section.type === 'year' ? section.length : 2) as number
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
 * prefix-matching its names, MUI DateField-style: "m" selects March,
 * continuing with "may" switches to May; the section completes when the
 * prefix matches a single name. A letter that matches no name restarts the
 * draft.
 * @param {object} section The text section descriptor (with `names`).
 * @param {string} draft The letters typed into the section so far.
 * @param {string} letter The newly typed letter.
 * @returns {{draft: string, value: number, completed: boolean} | null} The next draft, section value and completion state, or null when nothing matches.
 */
export const applyLetterToSection = (section: DateSection, draft: string, letter: string): any => {
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
 * Returns the section value after an increment or decrement, wrapping within
 * the bounds (except year, which clamps). An empty section starts at the
 * minimum when incrementing and at the maximum when decrementing — except the
 * year, which starts at the current year (jumping to 0001 or 9999 would be
 * useless).
 * @param {object} section The section descriptor.
 * @param {number} delta The signed step.
 * @param {number} [max] The upper bound, e.g. the day count of the selected month.
 * @returns {number} The next section value.
 */
export const getIncrementedSectionValue = (section: DateSection, delta: number, max: number = getSectionBounds(section).max): number => {
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
 * Returns the number of days in the given month, valid for any year.
 * @param {number} year The full year.
 * @param {number} month The 1-based month.
 * @returns {number} The number of days.
 */
export const getDaysInMonth = (year: number, month: number): number => {
  const date = new Date(2000, 0, 1)
  date.setFullYear(year, month, 0)
  return date.getDate()
}

/**
 * Returns the number of ISO weeks in the given week-numbering year (52 or 53).
 * @param {number} year The full week-numbering year.
 * @returns {number} The week count.
 */
export const getISOWeeksInYear = (year: number): number => {
  const date = new Date(2000, 0, 1)
  // December 28th always belongs to the last ISO week of its year
  date.setFullYear(year, 11, 28)
  return getISOWeekNumberAndYear(date).weekNumber
}

/**
 * Returns the Monday of the given ISO week.
 * @param {number} year The full week-numbering year.
 * @param {number} week The 1-based ISO week number.
 * @returns {Date} The Monday starting the week.
 */
export const getDateOfISOWeek = (year: number, week: number): Date => {
  const date = new Date(2000, 0, 1)
  // January 4th always belongs to the first ISO week of its year
  date.setFullYear(year, 0, 4)
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + ((week - 1) * 7))
  return date
}

/**
 * Returns the effective upper bound of the week section for the currently
 * selected year. Falls back to 53 while the year is unknown (the year can
 * still turn out to be a long one).
 * @param {Array} sections The section and literal descriptors.
 * @returns {number} The week count of the selected year.
 */
export const getWeekSectionMax = (sections: DateSection[]): number => {
  const yearSection = sections.find(section => section.type === 'year')
  const year = yearSection ? getFullYearFromSection(yearSection) : null

  if (year === null) {
    return getSectionBounds({ type: 'week' } as DateSection).max
  }

  return getISOWeeksInYear(year)
}

/**
 * Returns the effective upper bound of the day section for the currently
 * selected month and year. Falls back to 31 while the month is unknown and to
 * a leap year while the year is unknown (February can still turn out to have
 * 29 days).
 * @param {Array} sections The section and literal descriptors.
 * @returns {number} The day count of the selected month.
 */
export const getDaySectionMax = (sections: DateSection[]): number => {
  let month = null
  let year = null

  for (const section of sections) {
    if (section.type === 'month') {
      month = section.value
    }

    if (section.type === 'year') {
      year = getFullYearFromSection(section)
    }
  }

  if (month === null) {
    return getSectionBounds({ type: 'day' } as DateSection).max
  }

  return getDaysInMonth(year === null ? 2000 : year, month)
}

/**
 * Resolves the full year of a year section, expanding 2-digit values with
 * smart century assignment.
 * @param {object} section The year section descriptor.
 * @returns {number | null} The full year or null when empty.
 */
export const getFullYearFromSection = (section: DateSection): number | null => {
  if (section.value === null) {
    return null
  }

  if (section.length === 2 && section.value < 100) {
    return parseYearSmart(String(section.value).padStart(2, '0'))
  }

  return section.value
}

/**
 * Builds a Date from fully filled sections, clamping the day to the month's
 * length. A week section resolves to the Monday of the ISO week (the year
 * section then holds the ISO week-numbering year) and a quarter section to
 * the first day of the quarter. Section types absent from the layout get
 * defaults (1970-01-01 for the date part — the `util/time.js` convention for
 * time-only values — and midnight for the time part). Returns null while any
 * section is empty.
 * @param {Array} sections The section and literal descriptors.
 * @returns {Date | null} The date or null when incomplete.
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
 * Returns a copy of the sections with values taken from the given date. In a
 * layout with a week section the year section holds the ISO week-numbering
 * year, which can differ from the calendar year around January 1st.
 * @param {Array} sections The section and literal descriptors.
 * @param {Date | null} date The date to read values from, or null to clear.
 * @returns {Array} The updated sections.
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
 * Formats a section value for display, padding with zeros when the section is
 * padded and shortening 4-digit years stored in 2-digit sections. Text
 * sections (month names, day periods) show their name.
 * @param {object} section The section descriptor.
 * @param {string} placeholder The placeholder to show when the section is empty.
 * @returns {string} The display string.
 */
export const formatSectionValue = (section: DateSection, placeholder = ''): string => {
  if (section.value === null) {
    return placeholder
  }

  if (section.names) {
    return section.names[section.value - 1]
  }

  const value = section.type === 'year' && section.length === 2 ? section.value % 100 : section.value

  return section.padded === false ? String(value) : String(value).padStart(section.length as number, '0')
}

/**
 * Serializes the sections into the masked string (values and literals).
 * @param {Array} sections The section and literal descriptors.
 * @returns {string} The formatted string.
 */
export const formatSections = (sections: DateSection[]): string =>
  sections.map(section => (section.type === 'literal' ? section.value : formatSectionValue(section))).join('')

/**
 * Parses a pasted string against the section layout by matching names (months,
 * day periods) and digit groups to editable sections in order. Returns null
 * when the string doesn't match.
 * @param {string} text The pasted text.
 * @param {Array} sections The section and literal descriptors.
 * @returns {Array | null} The filled sections or null.
 */
export const getSectionsFromString = (text: string, sections: DateSection[]): DateSection[] | null => {
  let normalizedText = text

  for (const section of sections) {
    if (!section.names) {
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
  const next = []

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

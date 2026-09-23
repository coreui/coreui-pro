/**
 * --------------------------------------------------------------------------
 * CoreUI PRO util/date-sections.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import { getISOWeekNumberAndYear, parseYearSmart, type SelectionTypes } from './calendar.js'
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

export const getFormatMonthNames = (locale: string, width: 'long' | 'short'): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { year: 'numeric', month: width, day: 'numeric' })

  return Array.from({ length: 12 }, (_, index) =>
    formatter.formatToParts(new Date(2000, index, 15)).find(part => part.type === 'month')!.value)
}

export const getDayPeriodNames = (locale: string): string[] => {
  const formatter = new Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: true })

  return [new Date(2000, 0, 1, 9), new Date(2000, 0, 1, 21)].map(date => {
    const part = formatter.formatToParts(date).find(({ type }) => type === 'dayPeriod')
    return part ? part.value : (date.getHours() < 12 ? 'AM' : 'PM')
  })
}

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

export const getSectionsFromLocale = (locale: string): DateSection[] =>
  getSectionsFromParts(new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }), locale)

export const getWeekLabel = (locale: string): string => {
  try {
    const label = new Intl.DisplayNames(locale, { type: 'dateTimeField' }).of('weekOfYear')
    return label ? label.charAt(0).toLocaleUpperCase(locale) + label.slice(1) : 'Week'
  } catch {
    return 'Week'
  }
}

export const getWeekSectionsFromLocale = (locale: string): DateSection[] =>
  getSectionsFromFormat(`'${getWeekLabel(locale).replaceAll('\'', '\'\'')}' ww, yyyy`, locale)

export const getTimeSectionsFromLocale = (locale: string, seconds = false): DateSection[] =>
  getSectionsFromParts(new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: seconds ? '2-digit' : undefined
  }), locale)

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

export const getPickerFormat = (format: SectionFormat, selectionType: SelectionTypes = 'day'): SectionFormat =>
  format || FORMAT_BY_SELECTION_TYPE[selectionType] || null

export const getSectionLayout = (format: SectionFormat, locale: string, monthNames: string[] | null = null, includeTime: boolean | { seconds: boolean } = false): DateSection[] => {
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

export const applyDigitToSection = (section: DateSection, draft: string, digit: string, max: number = getSectionBounds(section).max): SectionEntry => {
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

export const applyLetterToSection = (section: DateSection, draft: string, letter: string): SectionEntry | null => {
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

export const getDaysInMonth = (year: number, month: number): number => {
  const date = new Date(2000, 0, 1)
  date.setFullYear(year, month, 0)
  return date.getDate()
}

export const getISOWeeksInYear = (year: number): number => {
  const date = new Date(2000, 0, 1)
  date.setFullYear(year, 11, 28)
  return getISOWeekNumberAndYear(date).weekNumber
}

export const getDateOfISOWeek = (year: number, week: number): Date => {
  const date = new Date(2000, 0, 1)
  date.setFullYear(year, 0, 4)
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + ((week - 1) * 7))
  return date
}

export const getWeekSectionMax = (sections: DateSection[]): number => {
  const yearSection = sections.find(section => section.type === 'year')
  const year = yearSection ? getFullYearFromSection(yearSection) : null

  if (year === null) {
    return getSectionBounds({ type: 'week' } as DateSection).max
  }

  return getISOWeeksInYear(year)
}

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

export const getFullYearFromSection = (section: DateSection): number | null => {
  if (section.value === null) {
    return null
  }

  if (section.length === 2 && section.value < 100) {
    return parseYearSmart(String(section.value).padStart(2, '0'))
  }

  return section.value
}

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

export const formatSections = (sections: DateSection[]): string =>
  sections.map(section => (section.type === 'literal' ? section.value : formatSectionValue(section))).join('')

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

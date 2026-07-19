/* eslint-env jasmine */

import {
  applyDigitToSection,
  applyLetterToSection,
  formatSections,
  formatSectionValue,
  getDateFromSections,
  getDateSections,
  getDateTimeSectionsFromLocale,
  getDaysInMonth,
  getDaySectionMax,
  getFullYearFromSection,
  getIncrementedSectionValue,
  getSectionBounds,
  getSectionsFromFormat,
  getSectionsFromLocale,
  getSectionsFromString,
  getTimeSectionsFromLocale,
  setSectionsFromDate
} from '../../../src/util/date-sections.js'

describe('Date Sections Utilities', () => {
  describe('getSectionBounds', () => {
    it('should return bounds for day', () => {
      expect(getSectionBounds({ type: 'day' })).toEqual({ min: 1, max: 31 })
    })

    it('should return bounds for month', () => {
      expect(getSectionBounds({ type: 'month' })).toEqual({ min: 1, max: 12 })
    })

    it('should return bounds for year', () => {
      expect(getSectionBounds({ type: 'year' })).toEqual({ min: 1, max: 9999 })
    })

    it('should return cycle-dependent bounds for hour', () => {
      expect(getSectionBounds({ type: 'hour', cycle: 'h23' })).toEqual({ min: 0, max: 23 })
      expect(getSectionBounds({ type: 'hour', cycle: 'h12' })).toEqual({ min: 1, max: 12 })
    })

    it('should return bounds for minute, second and meridiem', () => {
      expect(getSectionBounds({ type: 'minute' })).toEqual({ min: 0, max: 59 })
      expect(getSectionBounds({ type: 'second' })).toEqual({ min: 0, max: 59 })
      expect(getSectionBounds({ type: 'meridiem' })).toEqual({ min: 1, max: 2 })
    })
  })

  describe('getSectionsFromFormat', () => {
    it('should parse date-fns/Unicode-style tokens', () => {
      const sections = getSectionsFromFormat('dd.MM.yyyy')

      expect(sections.map(section => section.type)).toEqual(['day', 'literal', 'month', 'literal', 'year'])
      expect(sections[1].value).toBe('.')
      expect(sections[4].length).toBe(4)
    })

    it('should parse dayjs/moment-style tokens', () => {
      const sections = getSectionsFromFormat('YYYY-MM-DD')

      expect(sections.map(section => section.type)).toEqual(['year', 'literal', 'month', 'literal', 'day'])
      expect(sections[1].value).toBe('-')
      expect(sections[0].length).toBe(4)
    })

    it('should parse two-digit year tokens', () => {
      const sections = getSectionsFromFormat('d.M.yy')

      expect(sections[0].padded).toBe(false)
      expect(sections[2].padded).toBe(false)
      expect(sections[4].length).toBe(2)
    })

    it('should keep unknown characters as literals', () => {
      const sections = getSectionsFromFormat('dd/MM/yyyy r.')

      expect(sections[sections.length - 1]).toEqual({ type: 'literal', value: ' r.' })
    })

    it('should create text month sections with localized names', () => {
      const long = getSectionsFromFormat('DD MMMM YYYY', 'en-US')[2]

      expect(long.type).toBe('month')
      expect(long.names[0]).toBe('January')
      expect(long.placeholder).toBe('MMMM')

      const short = getSectionsFromFormat('DD MMM YYYY', 'en-US')[2]

      expect(short.names[0]).toBe('Jan')
      expect(short.placeholder).toBe('MMM')
    })

    it('should use the grammatical form of a date context', () => {
      const section = getSectionsFromFormat('DD MMMM YYYY', 'pl-PL')[2]

      expect(section.names[6]).toBe('lipca')
    })

    it('should accept custom month names', () => {
      const names = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']
      const section = getSectionsFromFormat('DD MMMM YYYY', 'pl-PL', names)[2]

      expect(section.names[6]).toBe('lipiec')
    })

    it('should parse 23-hour cycle time tokens', () => {
      const sections = getSectionsFromFormat('HH:mm:ss')

      expect(sections.map(section => section.type)).toEqual(['hour', 'literal', 'minute', 'literal', 'second'])
      expect(sections[0].cycle).toBe('h23')
      expect(sections[0].placeholder).toBe('HH')
      expect(sections[2].placeholder).toBe('mm')
    })

    it('should parse 12-hour cycle tokens with a meridiem section', () => {
      const sections = getSectionsFromFormat('hh:mm A', 'en-US')

      expect(sections.map(section => section.type)).toEqual(['hour', 'literal', 'minute', 'literal', 'meridiem'])
      expect(sections[0].cycle).toBe('h12')
      expect(sections[4].names).toEqual(['AM', 'PM'])
    })

    it('should parse combined date and time formats', () => {
      const sections = getSectionsFromFormat('dd.MM.yyyy HH:mm')

      expect(sections.filter(section => section.type !== 'literal').map(section => section.type))
        .toEqual(['day', 'month', 'year', 'hour', 'minute'])
    })
  })

  describe('applyLetterToSection', () => {
    const section = getSectionsFromFormat('MMMM', 'en-US')[0]

    it('should return null for numeric sections', () => {
      expect(applyLetterToSection({ type: 'month', length: 2 }, '', 'm')).toBeNull()
    })

    it('should select the first matching month for an ambiguous prefix', () => {
      expect(applyLetterToSection(section, '', 'm')).toEqual({ draft: 'm', value: 3, completed: false })
      expect(applyLetterToSection(section, 'm', 'a')).toEqual({ draft: 'ma', value: 3, completed: false })
    })

    it('should switch to the unique match and complete', () => {
      expect(applyLetterToSection(section, 'ma', 'y')).toEqual({ draft: 'may', value: 5, completed: true })
      expect(applyLetterToSection(section, 'ju', 'n')).toEqual({ draft: 'jun', value: 6, completed: true })
    })

    it('should restart the draft when nothing matches', () => {
      expect(applyLetterToSection(section, 'ma', 'j')).toEqual({ draft: 'j', value: 1, completed: false })
    })

    it('should return null when the letter matches no month', () => {
      expect(applyLetterToSection(section, '', 'x')).toBeNull()
    })
  })

  describe('getSectionsFromLocale', () => {
    it('should derive month-first sections for en-US', () => {
      const sections = getSectionsFromLocale('en-US')

      expect(sections.map(section => section.type)).toEqual(['month', 'literal', 'day', 'literal', 'year'])
    })

    it('should derive day-first sections for pl-PL', () => {
      const sections = getSectionsFromLocale('pl-PL')

      expect(sections.map(section => section.type)).toEqual(['day', 'literal', 'month', 'literal', 'year'])
    })
  })

  describe('getTimeSectionsFromLocale', () => {
    it('should derive a 12-hour layout with a meridiem section for en-US', () => {
      const sections = getTimeSectionsFromLocale('en-US')
      const editable = sections.filter(section => section.type !== 'literal')

      expect(editable.map(section => section.type)).toEqual(['hour', 'minute', 'meridiem'])
      expect(editable[0].cycle).toBe('h12')
    })

    it('should derive a 23-hour layout for pl-PL', () => {
      const sections = getTimeSectionsFromLocale('pl-PL')
      const editable = sections.filter(section => section.type !== 'literal')

      expect(editable.map(section => section.type)).toEqual(['hour', 'minute'])
      expect(editable[0].cycle).toBe('h23')
    })

    it('should include a seconds section on demand', () => {
      const sections = getTimeSectionsFromLocale('pl-PL', true)

      expect(sections.filter(section => section.type !== 'literal').map(section => section.type))
        .toEqual(['hour', 'minute', 'second'])
    })
  })

  describe('getDateTimeSectionsFromLocale', () => {
    it('should derive date and time sections', () => {
      const types = getDateTimeSectionsFromLocale('pl-PL')
        .filter(section => section.type !== 'literal')
        .map(section => section.type)

      expect(types).toEqual(['day', 'month', 'year', 'hour', 'minute'])
    })
  })

  describe('getDateSections', () => {
    it('should call a format function with the locale', () => {
      const format = jasmine.createSpy('format').and.returnValue([])

      expect(getDateSections(format, 'en-US')).toEqual([])
      expect(format).toHaveBeenCalledWith('en-US')
    })

    it('should parse a format string', () => {
      expect(getDateSections('dd.MM.yyyy', 'en-US').map(section => section.type))
        .toEqual(['day', 'literal', 'month', 'literal', 'year'])
    })

    it('should fall back to the locale', () => {
      expect(getDateSections(null, 'en-US').map(section => section.type))
        .toEqual(['month', 'literal', 'day', 'literal', 'year'])
    })
  })

  describe('applyDigitToSection', () => {
    it('should complete a month section when the digit is unambiguous', () => {
      expect(applyDigitToSection({ type: 'month', length: 2 }, '', '2'))
        .toEqual({ draft: '2', value: 2, completed: true })
    })

    it('should wait for a second digit when ambiguous', () => {
      expect(applyDigitToSection({ type: 'month', length: 2 }, '', '1'))
        .toEqual({ draft: '1', value: 1, completed: false })

      expect(applyDigitToSection({ type: 'month', length: 2 }, '1', '2'))
        .toEqual({ draft: '12', value: 12, completed: true })
    })

    it('should restart the section when the value would exceed the bounds', () => {
      expect(applyDigitToSection({ type: 'month', length: 2 }, '1', '3'))
        .toEqual({ draft: '3', value: 3, completed: true })

      expect(applyDigitToSection({ type: 'day', length: 2 }, '3', '9'))
        .toEqual({ draft: '9', value: 9, completed: true })
    })

    it('should complete a day section at two digits', () => {
      expect(applyDigitToSection({ type: 'day', length: 2 }, '3', '1'))
        .toEqual({ draft: '31', value: 31, completed: true })
    })

    it('should respect a custom upper bound', () => {
      expect(applyDigitToSection({ type: 'day', length: 2 }, '2', '9', 28))
        .toEqual({ draft: '9', value: 9, completed: true })

      expect(applyDigitToSection({ type: 'day', length: 2 }, '', '3', 28))
        .toEqual({ draft: '3', value: 3, completed: true })
    })

    it('should complete a year section at its full length', () => {
      expect(applyDigitToSection({ type: 'year', length: 4 }, '202', '6'))
        .toEqual({ draft: '2026', value: 2026, completed: true })

      expect(applyDigitToSection({ type: 'year', length: 4 }, '20', '2').completed).toBeFalse()
    })
  })

  describe('getIncrementedSectionValue', () => {
    it('should increment and decrement with wrapping', () => {
      expect(getIncrementedSectionValue({ type: 'month', value: 12 }, 1)).toBe(1)
      expect(getIncrementedSectionValue({ type: 'month', value: 1 }, -1)).toBe(12)
      expect(getIncrementedSectionValue({ type: 'day', value: 31 }, 1)).toBe(1)
    })

    it('should start empty sections at the boundary, except year at the current year', () => {
      expect(getIncrementedSectionValue({ type: 'day', value: null }, 1)).toBe(1)
      expect(getIncrementedSectionValue({ type: 'day', value: null }, -1)).toBe(31)
      expect(getIncrementedSectionValue({ type: 'month', value: null }, 1)).toBe(1)
      expect(getIncrementedSectionValue({ type: 'month', value: null }, -1)).toBe(12)
      expect(getIncrementedSectionValue({ type: 'year', value: null, length: 4 }, 1)).toBe(new Date().getFullYear())
      expect(getIncrementedSectionValue({ type: 'year', value: null, length: 4 }, -1)).toBe(new Date().getFullYear())
    })

    it('should wrap at a custom upper bound', () => {
      expect(getIncrementedSectionValue({ type: 'day', value: 28 }, 1, 28)).toBe(1)
    })

    it('should start an empty day at the custom upper bound when decrementing', () => {
      expect(getIncrementedSectionValue({ type: 'day', value: null }, -1, 28)).toBe(28)
    })

    it('should clamp year instead of wrapping', () => {
      expect(getIncrementedSectionValue({ type: 'year', value: 2026 }, 1)).toBe(2027)
      expect(getIncrementedSectionValue({ type: 'year', value: 9999 }, 1)).toBe(9999)
      expect(getIncrementedSectionValue({ type: 'year', value: 1 }, -1)).toBe(1)
    })
  })

  describe('getDaysInMonth', () => {
    it('should handle leap years', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29)
      expect(getDaysInMonth(2023, 2)).toBe(28)
      expect(getDaysInMonth(2026, 4)).toBe(30)
      expect(getDaysInMonth(2026, 12)).toBe(31)
    })
  })

  describe('getDaySectionMax', () => {
    const layout = (month, year) => getSectionsFromFormat('dd.MM.yyyy').map(section => {
      if (section.type === 'month') {
        return { ...section, value: month }
      }

      if (section.type === 'year') {
        return { ...section, value: year }
      }

      return section
    })

    it('should return 31 while the month is unknown', () => {
      expect(getDaySectionMax(layout(null, null))).toBe(31)
      expect(getDaySectionMax(layout(null, 2026))).toBe(31)
    })

    it('should return the day count of the selected month', () => {
      expect(getDaySectionMax(layout(4, 2026))).toBe(30)
      expect(getDaySectionMax(layout(2, 2023))).toBe(28)
      expect(getDaySectionMax(layout(2, 2024))).toBe(29)
    })

    it('should allow 29 days in February while the year is unknown', () => {
      expect(getDaySectionMax(layout(2, null))).toBe(29)
    })
  })

  describe('getFullYearFromSection', () => {
    it('should return null for empty sections', () => {
      expect(getFullYearFromSection({ type: 'year', length: 4, value: null })).toBeNull()
    })

    it('should expand two-digit years with smart century assignment', () => {
      const currentYear = new Date().getFullYear()

      expect(getFullYearFromSection({ type: 'year', length: 2, value: currentYear % 100 })).toBe(currentYear)
      expect(getFullYearFromSection({ type: 'year', length: 2, value: 99 })).toBe(1999)
    })

    it('should return four-digit years as-is', () => {
      expect(getFullYearFromSection({ type: 'year', length: 4, value: 2026 })).toBe(2026)
    })
  })

  describe('getDateFromSections', () => {
    const sections = date => setSectionsFromDate(getSectionsFromFormat('dd.MM.yyyy'), date)

    it('should build a date from filled sections', () => {
      expect(getDateFromSections(sections(new Date(2026, 6, 14)))).toEqual(new Date(2026, 6, 14))
    })

    it('should return null while any section is empty', () => {
      const partial = sections(new Date(2026, 6, 14)).map(section => (section.type === 'day' ? { ...section, value: null } : section))

      expect(getDateFromSections(partial)).toBeNull()
    })

    it('should clamp the day to the length of the month', () => {
      const overflowing = sections(new Date(2026, 0, 31)).map(section => (section.type === 'month' ? { ...section, value: 2 } : section))

      expect(getDateFromSections(overflowing)).toEqual(new Date(2026, 1, 28))
    })

    it('should build a 1970-01-01 date from time-only sections', () => {
      const time = setSectionsFromDate(getSectionsFromFormat('HH:mm'), new Date(2026, 6, 14, 14, 30))

      expect(getDateFromSections(time)).toEqual(new Date(1970, 0, 1, 14, 30))
    })

    it('should convert the 12-hour cycle with the meridiem section', () => {
      const time = setSectionsFromDate(getSectionsFromFormat('hh:mm A', 'en-US'), new Date(2026, 6, 14, 14, 30))
      const editable = time.filter(section => section.type !== 'literal')

      expect(editable.map(section => section.value)).toEqual([2, 30, 2])
      expect(getDateFromSections(time)).toEqual(new Date(1970, 0, 1, 14, 30))
    })

    it('should build a full date-time from combined sections', () => {
      const combined = setSectionsFromDate(getSectionsFromFormat('dd.MM.yyyy HH:mm'), new Date(2026, 6, 14, 9, 5))

      expect(getDateFromSections(combined)).toEqual(new Date(2026, 6, 14, 9, 5))
    })
  })

  describe('setSectionsFromDate', () => {
    it('should fill values from a date', () => {
      const sections = setSectionsFromDate(getSectionsFromFormat('dd.MM.yyyy'), new Date(2026, 6, 14))

      expect(sections.filter(section => section.type !== 'literal').map(section => section.value)).toEqual([14, 7, 2026])
    })

    it('should clear values when the date is null', () => {
      const sections = setSectionsFromDate(setSectionsFromDate(getSectionsFromFormat('dd.MM.yyyy'), new Date(2026, 6, 14)), null)

      expect(sections.filter(section => section.type !== 'literal').every(section => section.value === null)).toBeTrue()
    })
  })

  describe('formatSectionValue', () => {
    it('should return the placeholder for empty sections', () => {
      expect(formatSectionValue({
        type: 'day', length: 2, padded: true, value: null
      }, 'DD')).toBe('DD')
    })

    it('should pad values in padded sections', () => {
      expect(formatSectionValue({
        type: 'day', length: 2, padded: true, value: 4
      })).toBe('04')
      expect(formatSectionValue({
        type: 'day', length: 2, padded: false, value: 4
      })).toBe('4')
    })

    it('should shorten years in two-digit sections', () => {
      expect(formatSectionValue({
        type: 'year', length: 2, padded: true, value: 2026
      })).toBe('26')
    })

    it('should format text month sections with the month name', () => {
      const section = getSectionsFromFormat('MMMM', 'en-US')[0]

      expect(formatSectionValue({ ...section, value: 7 })).toBe('July')
    })
  })

  describe('formatSections', () => {
    it('should serialize values and literals', () => {
      const sections = setSectionsFromDate(getSectionsFromFormat('dd.MM.yyyy'), new Date(2026, 6, 4))

      expect(formatSections(sections)).toBe('04.07.2026')
    })
  })

  describe('getSectionsFromString', () => {
    const layout = getSectionsFromFormat('dd.MM.yyyy')

    it('should match digit groups to sections in order', () => {
      const sections = getSectionsFromString('14.07.2026', layout)

      expect(sections.filter(section => section.type !== 'literal').map(section => section.value)).toEqual([14, 7, 2026])
    })

    it('should accept any separators', () => {
      const sections = getSectionsFromString('14/07/2026', layout)

      expect(sections.filter(section => section.type !== 'literal').map(section => section.value)).toEqual([14, 7, 2026])
    })

    it('should return null when the group count does not match', () => {
      expect(getSectionsFromString('14.07', layout)).toBeNull()
      expect(getSectionsFromString('not a date', layout)).toBeNull()
    })

    it('should return null when a value is out of bounds', () => {
      expect(getSectionsFromString('99.99.2026', layout)).toBeNull()
    })

    it('should match month names in text month layouts', () => {
      const textLayout = getSectionsFromFormat('DD MMMM YYYY', 'en-US')
      const sections = getSectionsFromString('14 July 2026', textLayout)

      expect(sections.filter(section => section.type !== 'literal').map(section => section.value)).toEqual([14, 7, 2026])
    })

    it('should still accept numeric input in text month layouts', () => {
      const textLayout = getSectionsFromFormat('DD MMMM YYYY', 'en-US')
      const sections = getSectionsFromString('14.07.2026', textLayout)

      expect(sections.filter(section => section.type !== 'literal').map(section => section.value)).toEqual([14, 7, 2026])
    })

    it('should match time strings', () => {
      const sections = getSectionsFromString('14:30', getSectionsFromFormat('HH:mm'))

      expect(sections.filter(section => section.type !== 'literal').map(section => section.value)).toEqual([14, 30])
    })

    it('should match 12-hour time strings with a day period', () => {
      const sections = getSectionsFromString('2:30 PM', getSectionsFromFormat('hh:mm A', 'en-US'))

      expect(sections.filter(section => section.type !== 'literal').map(section => section.value)).toEqual([2, 30, 2])
    })
  })
})

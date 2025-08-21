// Helper function to generate multiple date format patterns
const generateDatePatterns = (locale, includeTime) => {
  const referenceDate = new Date(2013, 11, 31, 17, 19, 22)
  const patterns = []

  try {
    // Get the standard locale format
    const standardFormat = includeTime ?
      referenceDate.toLocaleString(locale) :
      referenceDate.toLocaleDateString(locale)

    patterns.push(standardFormat)
  } catch {
    // Fallback to default locale if invalid locale provided
    const standardFormat = includeTime ?
      referenceDate.toLocaleString('en-US') :
      referenceDate.toLocaleDateString('en-US')
    patterns.push(standardFormat)
  }

  // Generate common alternative formats by replacing separators
  const separators = ['/', '-', '.', ' ']
  const standardFormat = patterns[0]

  // Detect the original separator
  let originalSeparator = '/' // default
  if (standardFormat.includes('/')) {
    originalSeparator = '/'
  } else if (standardFormat.includes('-')) {
    originalSeparator = '-'
  } else if (standardFormat.includes('.')) {
    originalSeparator = '.'
  }

  for (const sep of separators) {
    if (sep !== originalSeparator) {
      const altFormat = standardFormat.replace(new RegExp(`\\${originalSeparator}`, 'g'), sep)
      patterns.push(altFormat)
    }
  }

  return patterns
}

// Helper function to build regex pattern for date parsing
const buildDateRegexPattern = (formatString, includeTime) => {
  let regexPattern = formatString
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace('2013', '(?<year>\\d{2,4})')
    .replace('12', '(?<month>\\d{1,2})')
    .replace('31', '(?<day>\\d{1,2})')

  if (includeTime) {
    regexPattern = regexPattern
      .replace(/17|5/g, '(?<hour>\\d{1,2})')
      .replace('19', '(?<minute>\\d{1,2})')
      .replace('22', '(?<second>\\d{1,2})')
      .replace(/AM|PM/gi, '(?<ampm>[APap][Mm])')
  }

  return regexPattern
}

// Helper function to try parsing with multiple patterns
const tryParseWithPatterns = (dateString, patterns, includeTime) => {
  for (const pattern of patterns) {
    const regexPattern = buildDateRegexPattern(pattern, includeTime)
    const regex = new RegExp(`^${regexPattern}$`)
    const match = dateString.trim().match(regex)

    if (match?.groups) {
      return match.groups
    }
  }

  return null
}

// Helper function to validate date components
const validateDateComponents = (month, day) => {
  const parsedMonth = Number.parseInt(month, 10) - 1
  const parsedDay = Number.parseInt(day, 10)

  return parsedMonth >= 0 && parsedMonth <= 11 && parsedDay >= 1 && parsedDay <= 31
}

// Helper function to convert 12-hour to 24-hour format
const convertTo24Hour = (hour, ampm) => {
  const parsedHour = Number.parseInt(hour, 10)

  if (!ampm) {
    return parsedHour
  }

  const isPM = ampm.toLowerCase() === 'pm'

  if (isPM && parsedHour !== 12) {
    return parsedHour + 12
  }

  if (!isPM && parsedHour === 12) {
    return 0
  }

  return parsedHour
}

// Helper function to validate time components
const validateTimeComponents = (hour, minute, second) => {
  return hour >= 0 && hour <= 23 &&
         minute >= 0 && minute <= 59 &&
         second >= 0 && second <= 59
}

// Helper function to create date with time
const createDateWithTime = groups => {
  const { year, month, day, hour, minute, second, ampm } = groups

  const parsedYear = Number.parseInt(year, 10)
  const parsedMonth = Number.parseInt(month, 10) - 1
  const parsedDay = Number.parseInt(day, 10)
  const parsedHour = convertTo24Hour(hour, ampm)
  const parsedMinute = Number.parseInt(minute, 10) || 0
  const parsedSecond = Number.parseInt(second, 10) || 0

  if (!validateTimeComponents(parsedHour, parsedMinute, parsedSecond)) {
    return 'invalid'
  }

  return new Date(parsedYear, parsedMonth, parsedDay, parsedHour, parsedMinute, parsedSecond)
}

// Helper function to create date without time
const createDateOnly = groups => {
  const { year, month, day } = groups

  const parsedYear = Number.parseInt(year, 10)
  const parsedMonth = Number.parseInt(month, 10) - 1
  const parsedDay = Number.parseInt(day, 10)

  return new Date(parsedYear, parsedMonth, parsedDay)
}

/**
 * Parses a date string using locale-aware patterns and returns a Date object.
 *
 * This function generates multiple date format patterns based on the provided locale
 * and attempts to parse the input string using these patterns. It supports various
 * date separators (/, -, ., space) and handles both date-only and date-time formats.
 *
 * @param {string} dateString - The date string to parse (e.g., "12/31/2023", "31-12-2023")
 * @param {string} [locale='en-US'] - The locale to use for date format patterns (e.g., 'en-US', 'en-GB', 'de-DE')
 * @param {boolean} [includeTime=false] - Whether to include time parsing in the pattern matching
 * @returns {Date|string|undefined} A Date object if parsing succeeds, 'invalid' for malformed dates, undefined for empty input
 */
export const getLocalDateFromString = (dateString, locale = 'en-US', includeTime = false) => {
  // Input validation
  if (!dateString || typeof dateString !== 'string') {
    return
  }

  // Generate multiple format patterns to try
  const patterns = generateDatePatterns(locale, includeTime)

  // Try parsing with different patterns
  const groups = tryParseWithPatterns(dateString, patterns, includeTime)

  if (!groups) {
    return 'invalid'
  }

  // Validate date components
  const { month, day } = groups
  if (!validateDateComponents(month, day)) {
    return 'invalid'
  }

  // Create and return appropriate date object
  return includeTime ? createDateWithTime(groups) : createDateOnly(groups)
}

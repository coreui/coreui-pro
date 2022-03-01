export const convert12hTo24h = (abbr, hour) => {
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

export const convert24hTo12h = hour => hour % 12 || 12
export const getAmPm = (date, locale) => {
  if (date.toLocaleTimeString(locale).includes('AM')) {
    return 'am'
  }

  if (date.toLocaleTimeString(locale).includes('PM')) {
    return 'pm'
  }

  return date.getHours() >= 12 ? 'pm' : 'am'
}

export const isAmPm = locale => ['am', 'AM', 'pm', 'PM'].some(el => new Date().toLocaleString(locale).includes(el))

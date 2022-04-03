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
export const convertTimeToDate = time => time ? (time instanceof Date ? new Date(time) : new Date(`1970-01-01 ${time}`)) : null
export const getAmPm = (date, locale) => {
  if (date.toLocaleTimeString(locale).includes('AM')) {
    return 'am'
  }

  if (date.toLocaleTimeString(locale).includes('PM')) {
    return 'pm'
  }

  return date.getHours() >= 12 ? 'pm' : 'am'
}

export const getListOfHours = locale => Array.from({ length: isAmPm(locale) ? 12 : 24 }, (_, i) => {
  return {
    value: isAmPm(locale) ? i + 1 : i,
    label: (isAmPm(locale) ? i + 1 : i).toLocaleString(locale)
  }
})
export const getMinutesOrSeconds = locale => Array.from({ length: 60 }, (_, i) => {
  return {
    value: i,
    label: i.toLocaleString(locale).padStart(2, (0).toLocaleString(locale))
  }
})
export const getSelectedHour = (date, locale) => date ? (isAmPm(locale) ? convert24hTo12h(date.getHours()) : date.getHours()) : ''
export const getSelectedMinutes = date => (date ? date.getMinutes() : '')
export const getSelectedSeconds = date => (date ? date.getSeconds() : '')
export const isAmPm = locale => ['am', 'AM', 'pm', 'PM'].some(el => new Date().toLocaleString(locale).includes(el))
export const isValidTime = time => {
  const d = new Date(`1970-01-01 ${time}`)
  return d instanceof Date && d.getTime()
}

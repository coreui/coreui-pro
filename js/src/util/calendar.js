export const convertToLocalDate = (d, locale, options = {}) => d.toLocaleDateString(locale, options)
export const convertToLocalTime = (d, locale, options = {}) => d.toLocaleTimeString(locale, options)
export const createGroupsInArray = (arr, numberOfGroups) => {
  const perGroup = Math.ceil(arr.length / numberOfGroups)
  return Array.from({ length: numberOfGroups })
        .fill('')
        .map((_, i) => arr.slice(i * perGroup, (i + 1) * perGroup))
}

export const getCurrentYear = () => new Date().getFullYear()
export const getCurrentMonth = () => new Date().getMonth()
export const getMonthName = (month, locale) => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(month)
  return d.toLocaleString(locale, { month: 'long' })
}

export const getMonthsNames = locale => {
  const months = []
  const d = new Date()
  d.setDate(1)
  for (let i = 0; i < 12; i++) {
    d.setMonth(i)
    months.push(d.toLocaleString(locale, { month: 'short' }))
  }

  return months
}

export const getYears = year => {
  const years = []
  for (let _year = year - 6; _year < year + 6; _year++) {
    years.push(_year)
  }

  return years
}

const getLeadingDays = (year, month, firstDayOfWeek) => {
  // 0: sunday
  // 1: monday
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
      month: 'previous'
    })
  }

  return dates
}

const getMonthDays = (year, month) => {
  const dates = []
  const lastDay = new Date(year, month + 1, 0).getDate()
  for (let i = 1; i <= lastDay; i++) {
    dates.push({
      date: new Date(year, month, i),
      month: 'current'
    })
  }

  return dates
}

const getTrailingDays = (year, month, leadingDays, monthDays) => {
  const dates = []
  const days = 42 - (leadingDays.length + monthDays.length)
  for (let i = 1; i <= days; i++) {
    dates.push({
      date: new Date(year, month + 1, i),
      month: 'next'
    })
  }

  return dates
}

export const getMonthDetails = (year, month, firstDayOfWeek) => {
  const daysPrevMonth = getLeadingDays(year, month, firstDayOfWeek)
  const daysThisMonth = getMonthDays(year, month)
  const daysNextMonth = getTrailingDays(year, month, daysPrevMonth, daysThisMonth)
  const days = [...daysPrevMonth, ...daysThisMonth, ...daysNextMonth]
  const weeks = []
  days.forEach((day, index) => {
    if (index % 7 === 0 || weeks.length === 0) {
      weeks.push([])
    }

    weeks[weeks.length - 1].push(day)
  })
  return weeks
}

export const isDisabled = (date, min, max, dates) => {
  let disabled
  if (dates) {
    dates.forEach(_date => {
      if (Array.isArray(_date) && isDateInRange(date, _date[0], _date[1])) {
        disabled = true
      }

      if (_date instanceof Date && isSameDateAs(date, _date)) {
        disabled = true
      }
    })
  }

  if (min && date < min) {
    disabled = true
  }

  if (max && date > max) {
    disabled = true
  }

  return disabled
}

export const isDateInRange = (date, start, end) => {
  return start && end && start <= date && date <= end
}

export const isDateSelected = (date, start, end) => {
  return (start && isSameDateAs(start, date)) || (end && isSameDateAs(end, date))
}

export const isEndDate = (date, start, end) => {
  return start && end && isSameDateAs(end, date) && start < end
}

export const isLastDayOfMonth = date => {
  const test = new Date(date.getTime())
  const month = test.getMonth()
  test.setDate(test.getDate() + 1)
  return test.getMonth() !== month
}

export const isSameDateAs = (date, date2) => {
  return (date.getDate() === date2.getDate() &&
        date.getMonth() === date2.getMonth() &&
        date.getFullYear() === date2.getFullYear())
}

export const isStartDate = (date, start, end) => {
  return start && end && isSameDateAs(start, date) && start < end
}

export const isToday = date => {
  const today = new Date()
  return (date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear())
}

type LocalizedTimePartials = {
  listOfHours: Array<{ label: string, value: number }>
  listOfMinutes: Array<{ label: string, value: number }>
  listOfSeconds: Array<{ label: string, value: number }>
  hour12: boolean
}

export const convert12hTo24h = (abbr: string, hour: number): number => {
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

export const convert24hTo12h = (hour: number): number => hour % 12 || 12

const formatTimePartials = (values: number[], locale: string, partial: string, hour12?: boolean): Array<{ label: string, value: number }> => {
  const date = new Date(2020, 0, 1)

  const forceTwoDigit = shouldUseTwoDigitHour(locale)
  const hourCycle = hour12 === undefined ? undefined : (hour12 ? 'h12' : 'h23')
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: forceTwoDigit ? '2-digit' : 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hourCycle
  })

  return values.map(value => {
    if (partial === 'hour') {
      date.setHours(value)
    }

    if (partial === 'minute') {
      date.setMinutes(value)
    }

    if (partial === 'second') {
      date.setSeconds(value)
    }

    return {
      value,
      label:
        formatter.formatToParts(date).find(part => part.type === partial)
          ?.value || ''
    }
  })
}

export const getLocalizedTimePartials = (
  locale: string,
  ampm: 'auto' | boolean = 'auto',
  hours: boolean | number[] | ((...args: any[]) => number[]) = [],
  minutes: boolean | number[] | ((...args: any[]) => number[]) = [],
  seconds: boolean | number[] | ((...args: any[]) => number[]) = []
): LocalizedTimePartials => {
  const hour12 = (ampm === 'auto' && isAmPm(locale)) || ampm === true

  const listOfHours =
    Array.isArray(hours) && hours.length > 0 ?
      hours :
      (typeof hours === 'function' ?
        Array.from({ length: hour12 ? 12 : 24 }, (_, i) =>
          hour12 ? i + 1 : i
        ).filter(hour => hours(hour)) :
        Array.from({ length: hour12 ? 12 : 24 }, (_, i) => (hour12 ? i + 1 : i)))

  const listOfMinutes =
    Array.isArray(minutes) && minutes.length > 0 ?
      minutes :
      (typeof minutes === 'function' ?
        Array.from({ length: 60 }, (_, i) => i).filter(minute =>
          minutes(minute)
        ) :
        Array.from({ length: 60 }, (_, i) => i))

  const listOfSeconds =
    Array.isArray(seconds) && seconds.length > 0 ?
      seconds :
      (typeof seconds === 'function' ?
        Array.from({ length: 60 }, (_, i) => i).filter(second =>
          seconds(second)
        ) :
        Array.from({ length: 60 }, (_, i) => i))

  return {
    listOfHours: formatTimePartials(listOfHours, locale, 'hour', hour12),
    listOfMinutes: formatTimePartials(listOfMinutes, locale, 'minute'),
    listOfSeconds: formatTimePartials(listOfSeconds, locale, 'second'),
    hour12
  }
}

export const getSelectedHour = (date: Date | null, locale: string, ampm: 'auto' | boolean = 'auto'): number | string =>
  date ?
    ((ampm === 'auto' && isAmPm(locale)) || ampm === true ?
      convert24hTo12h(date.getHours()) :
      date.getHours()) :
    ''

export const getSelectedMinutes = (date: Date | null): number | string => (date ? date.getMinutes() : '')

export const getSelectedSeconds = (date: Date | null): number | string => (date ? date.getSeconds() : '')

export const isAmPm = (locale: string): boolean =>
  ['am', 'AM', 'pm', 'PM'].some(el =>
    new Date().toLocaleString(locale).includes(el)
  )

const shouldUseTwoDigitHour = (locale: string): boolean => {
  const d = new Date(2020, 0, 1, 7, 5, 7)
  const formatted = d.toLocaleTimeString(locale)

  return formatted.startsWith('0')
}

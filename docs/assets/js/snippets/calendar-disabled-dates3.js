/* global coreui: false */

// js-docs-start calendar-disabled-dates3
const myCalendarDisabledDates3 = document.getElementById('myCalendarDisabledDates3')

const disableWeekends = date => {
  const day = date.getDay()
  return day === 0 || day === 6
}

const specificDates = [
  new Date(2024, 10, 25),
  new Date(2024, 11, 4),
  new Date(2024, 11, 12)
]

const optionsCalendarDisabledDates3 = {
  calendarDate: new Date(2024, 10, 1),
  calendars: 2,
  disabledDates: [disableWeekends, ...specificDates],
  locale: 'en-US'
}

new coreui.Calendar(myCalendarDisabledDates3, optionsCalendarDisabledDates3)
// js-docs-end calendar-disabled-dates3

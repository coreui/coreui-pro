/* global coreui: false */

// js-docs-start calendar-disabled-dates2
const myCalendarDisabledDates2 = document.getElementById('myCalendarDisabledDates2')

const optionsCalendarDisabledDates2 = {
  calendars: 2,
  disabledDates(date) {
    const day = date.getDay()
    return day === 0 || day === 6
  },
  locale: 'en-US'
}

new coreui.Calendar(myCalendarDisabledDates2, optionsCalendarDisabledDates2)
// js-docs-end calendar-disabled-dates2

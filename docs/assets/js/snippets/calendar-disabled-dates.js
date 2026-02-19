/* global coreui: false */

// js-docs-start calendar-disabled-dates
const myCalendarDisabledDates = document.getElementById('myCalendarDisabledDates')

const optionsCalendarDisabledDates = {
  calendarDate: new Date(2022, 2, 1),
  calendars: 2,
  disabledDates: [
    [new Date(2022, 2, 4), new Date(2022, 2, 7)],
    new Date(2022, 2, 16),
    new Date(2022, 3, 16),
    [new Date(2022, 4, 2), new Date(2022, 4, 8)]
  ],
  locale: 'en-US',
  maxDate: new Date(2022, 5, 0),
  minDate: new Date(2022, 1, 1)
}

new coreui.Calendar(myCalendarDisabledDates, optionsCalendarDisabledDates)
// js-docs-end calendar-disabled-dates

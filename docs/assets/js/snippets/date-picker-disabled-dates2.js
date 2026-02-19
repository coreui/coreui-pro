/* global coreui: false */

// js-docs-start date-picker-disabled-dates2
const myDatePickerDisabledDates2 = document.getElementById('myDatePickerDisabledDates2')

const optionsDatePickerDisabledDates2 = {
  disabledDates(date) {
    const day = date.getDay()
    return day === 0 || day === 6
  },
  locale: 'en-US'
}

new coreui.DatePicker(myDatePickerDisabledDates2, optionsDatePickerDisabledDates2)
// js-docs-end date-picker-disabled-dates2

const myDateRangePickerDisabledDates2 = document.getElementById('myDateRangePickerDisabledDates2')

const optionsDateRangePickerDisabledDates2 = {
  disabledDates(date) {
    const day = date.getDay()
    return day === 0 || day === 6
  },
  locale: 'en-US'
}

new coreui.DateRangePicker(myDateRangePickerDisabledDates2, optionsDateRangePickerDisabledDates2)

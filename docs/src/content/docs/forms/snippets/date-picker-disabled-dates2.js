const myDatePickerDisabledDates2 = document.getElementById('myDatePickerDisabledDates2')

const optionsDatePickerDisabledDates2 = {
  disabledDates(date) {
    const day = date.getDay()
    return day === 0 || day === 6
  },
  locale: 'en-US'
}

new coreui.DatePicker(myDatePickerDisabledDates2, optionsDatePickerDisabledDates2)

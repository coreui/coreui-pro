const myDateRangeInputDisabledDates2 = document.getElementById('myDateRangeInputDisabledDates2')

const optionsDateRangeInputDisabledDates2 = {
  disabledDates(date) {
    const day = date.getDay()
    return day === 0 || day === 6
  },
  format: 'dd.MM.yyyy',
  locale: 'en-US'
}

new coreui.DateRangeInput(myDateRangeInputDisabledDates2, optionsDateRangeInputDisabledDates2)

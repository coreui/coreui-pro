const myDateInputDisabledDates2 = document.getElementById('myDateInputDisabledDates2')

const optionsDateInputDisabledDates2 = {
  disabledDates(date) {
    const day = date.getDay()
    return day === 0 || day === 6
  },
  format: 'dd.MM.yyyy',
  locale: 'en-US'
}

new coreui.DateInput(myDateInputDisabledDates2, optionsDateInputDisabledDates2)

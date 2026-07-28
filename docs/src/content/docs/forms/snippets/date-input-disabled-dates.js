const myDateInputDisabledDates = document.getElementById('myDateInputDisabledDates')

const optionsDateInputDisabledDates = {
  locale: 'en-US',
  format: 'dd.MM.yyyy',
  date: new Date(2026, 6, 10),
  disabledDates: [
    [new Date(2026, 6, 4), new Date(2026, 6, 7)],
    new Date(2026, 6, 16)
  ],
  minDate: new Date(2026, 6, 1),
  maxDate: new Date(2026, 6, 31)
}

new coreui.DateInput(myDateInputDisabledDates, optionsDateInputDisabledDates)

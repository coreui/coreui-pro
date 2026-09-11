const myDateRangeInputDisabledDates = document.getElementById('myDateRangeInputDisabledDates')

const optionsDateRangeInputDisabledDates = {
  locale: 'en-US',
  format: 'dd.MM.yyyy',
  startDate: new Date(2026, 6, 10),
  disabledDates: [
    [new Date(2026, 6, 4), new Date(2026, 6, 7)],
    new Date(2026, 6, 16)
  ],
  minDate: new Date(2026, 6, 1),
  maxDate: new Date(2026, 6, 31)
}

new coreui.DateRangeInput(myDateRangeInputDisabledDates, optionsDateRangeInputDisabledDates)

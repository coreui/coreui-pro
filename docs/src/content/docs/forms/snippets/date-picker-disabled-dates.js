const myDatePickerDisabledDates = document.getElementById('myDatePickerDisabledDates')

const datePickerDisabledDates = new coreui.DatePicker(myDatePickerDisabledDates, {
  locale: 'en-US',
  date: new Date(2026, 6, 10),
  disabledDates: [
    [new Date(2026, 6, 4), new Date(2026, 6, 7)],
    new Date(2026, 6, 16)
  ],
  minDate: new Date(2026, 6, 1),
  maxDate: new Date(2026, 6, 31)
})

myDatePickerDisabledDates.addEventListener('dateChange.coreui.date-picker', event => {
  console.log('dateChange', event.date)
})

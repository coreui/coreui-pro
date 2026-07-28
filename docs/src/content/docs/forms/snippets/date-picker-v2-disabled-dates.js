const myDatePickerV2DisabledDates = document.getElementById('myDatePickerV2DisabledDates')

const datePickerV2DisabledDates = new coreui.DatePickerV2(myDatePickerV2DisabledDates, {
  locale: 'en-US',
  date: new Date(2026, 6, 10),
  disabledDates: [
    [new Date(2026, 6, 4), new Date(2026, 6, 7)],
    new Date(2026, 6, 16)
  ],
  minDate: new Date(2026, 6, 1),
  maxDate: new Date(2026, 6, 31)
})

myDatePickerV2DisabledDates.addEventListener('dateChange.coreui.date-picker-v2', event => {
  console.log('dateChange', event.date)
})

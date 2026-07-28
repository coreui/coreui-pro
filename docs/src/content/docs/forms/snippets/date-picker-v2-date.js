const myDatePickerV2Date = document.getElementById('myDatePickerV2Date')

const datePickerV2Date = new coreui.DatePickerV2(myDatePickerV2Date, {
  date: new Date(2026, 6, 17),
  locale: 'en-US',
  minDate: new Date(2026, 6, 1),
  maxDate: new Date(2026, 7, 31)
})

myDatePickerV2Date.addEventListener('dateChange.coreui.date-picker-v2', event => {
  console.log('dateChange', event.date)
})

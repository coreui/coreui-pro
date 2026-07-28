const myDatePickerV2Weekends = document.getElementById('myDatePickerV2Weekends')

const datePickerV2Weekends = new coreui.DatePickerV2(myDatePickerV2Weekends, {
  locale: 'en-US',
  disabledDates: date => date.getDay() === 0 || date.getDay() === 6
})

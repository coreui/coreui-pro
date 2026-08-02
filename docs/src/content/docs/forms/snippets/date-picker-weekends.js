const myDatePickerWeekends = document.getElementById('myDatePickerWeekends')

const datePickerWeekends = new coreui.DatePicker(myDatePickerWeekends, {
  locale: 'en-US',
  disabledDates: date => date.getDay() === 0 || date.getDay() === 6
})

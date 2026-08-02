const myDatePickerFooterToday = document.getElementById('myDatePickerFooterToday')

const datePickerFooterToday = new coreui.DatePicker(myDatePickerFooterToday, {
  locale: 'en-US',
  maxDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
})

const { isDateSelectable } = datePickerFooterToday.getContext()

myDatePickerFooterToday.querySelector('[data-coreui-picker-action="today"]').disabled =
  !isDateSelectable(new Date())

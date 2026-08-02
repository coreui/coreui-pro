const myDateRangePickerDisabledDates = document.getElementById('myDateRangePickerDisabledDates')

const dateRangePickerDisabledDates = new coreui.DateRangePicker(myDateRangePickerDisabledDates, {
  locale: 'en-US',
  startDate: new Date(2026, 6, 10),
  endDate: new Date(2026, 6, 14),
  disabledDates: [
    [new Date(2026, 6, 4), new Date(2026, 6, 7)],
    new Date(2026, 6, 16)
  ],
  minDate: new Date(2026, 6, 1),
  maxDate: new Date(2026, 7, 31)
})

myDateRangePickerDisabledDates.addEventListener('endDateChange.coreui.date-range-picker', event => {
  console.log('endDateChange', event.date, event.dateObject)
})

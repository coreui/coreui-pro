const myDateRangePickerV2DisabledDates = document.getElementById('myDateRangePickerV2DisabledDates')

const dateRangePickerV2DisabledDates = new coreui.DateRangePickerV2(myDateRangePickerV2DisabledDates, {
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

myDateRangePickerV2DisabledDates.addEventListener('endDateChange.coreui.date-range-picker-v2', event => {
  console.log('endDateChange', event.date, event.dateObject)
})

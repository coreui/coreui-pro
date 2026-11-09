const myDateRangePickerAcrossDisabled = document.getElementById('myDateRangePickerAcrossDisabled')

const dateRangePickerAcrossDisabled = new coreui.DateRangePicker(myDateRangePickerAcrossDisabled, {
  allowDisabledDatesInRange: true,
  locale: 'en-US',
  calendarDate: new Date(2026, 6, 1),
  disabledDates: [
    [new Date(2026, 6, 14), new Date(2026, 6, 16)]
  ]
})

/* global coreui: false */

// js-docs-start date-range-picker-custom-ranges
const myDateRangePickerCustomRanges = document.getElementById('myDateRangePickerCustomRanges')

const optionsCustomRanges = {
  locale: 'en-US',
  ranges: {
    Today: [new Date(), new Date()],
    Yesterday: [
      new Date(new Date().setDate(new Date().getDate() - 1)),
      new Date(new Date().setDate(new Date().getDate() - 1))
    ],
    'Last 7 Days': [
      new Date(new Date().setDate(new Date().getDate() - 6)),
      new Date(new Date())
    ],
    'Last 30 Days': [
      new Date(new Date().setDate(new Date().getDate() - 29)),
      new Date(new Date())
    ],
    'This Month': [
      new Date(new Date().setDate(1)),
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    ],
    'Last Month': [
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    ]
  }
}

new coreui.DateRangePicker(myDateRangePickerCustomRanges, optionsCustomRanges)

myDateRangePickerCustomRanges.addEventListener('startDateChange.coreui.date-range-picker', event => {
  // eslint-disable-next-line no-console
  console.log(event.date)
})
// js-docs-end date-range-picker-custom-ranges

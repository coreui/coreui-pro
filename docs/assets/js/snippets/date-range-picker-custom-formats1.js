/* global coreui, dayjs: false */

// js-docs-start date-range-picker-custom-formats1
const myDateRangePickerCustomFormats1 = document.getElementById('myDateRangePickerCustomFormats1')

dayjs.extend(window.dayjs_plugin_customParseFormat)
const optionsDateRangePickerCustomFormats1 = {
  locale: 'en-US',
  startDate: new Date(2022, 8, 3),
  endDate: new Date(2022, 8, 17),
  inputDateFormat: date => dayjs(date).locale('en').format('MMMM DD, YYYY'),
  inputDateParse: date => dayjs(date, 'MMMM DD, YYYY', 'en').toDate()
}

new coreui.DateRangePicker(myDateRangePickerCustomFormats1, optionsDateRangePickerCustomFormats1)
// js-docs-end date-range-picker-custom-formats1

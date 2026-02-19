/* global coreui, dayjs: false */

// js-docs-start date-picker-custom-formats1
const myDatePickerCustomFormats1 = document.getElementById('myDatePickerCustomFormats1')

dayjs.extend(window.dayjs_plugin_customParseFormat)
const optionsDatePickerCustomFormats1 = {
  locale: 'en-US',
  date: new Date(2022, 8, 3),
  inputDateFormat: date => dayjs(date).locale('en').format('MMMM DD, YYYY'),
  inputDateParse: date => dayjs(date, 'MMMM DD, YYYY', 'en').toDate()
}

new coreui.DatePicker(myDatePickerCustomFormats1, optionsDatePickerCustomFormats1)
// js-docs-end date-picker-custom-formats1

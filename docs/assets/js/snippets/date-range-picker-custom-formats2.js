/* global coreui, dayjs: false */

// js-docs-start date-range-picker-custom-formats2
const myDateRangePickerCustomFormats2 = document.getElementById('myDateRangePickerCustomFormats2')

dayjs.extend(window.dayjs_plugin_customParseFormat)
dayjs.locale('es')
const optionsDateRangePickerCustomFormats2 = {
  locale: 'es-ES',
  startDate: new Date(2022, 8, 3),
  endDate: new Date(2022, 8, 17),
  inputDateFormat: date => dayjs(date).locale('es').format('YYYY MMMM DD'),
  inputDateParse: date => dayjs(date, 'YYYY MMMM DD', 'es').toDate()
}

new coreui.DateRangePicker(myDateRangePickerCustomFormats2, optionsDateRangePickerCustomFormats2)
// js-docs-end date-range-picker-custom-formats2

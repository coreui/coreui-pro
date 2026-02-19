/* global coreui, dayjs: false */

// js-docs-start date-picker-custom-formats2
const myDatePickerCustomFormats2 = document.getElementById('myDatePickerCustomFormats2')

dayjs.extend(window.dayjs_plugin_customParseFormat)
dayjs.locale('es')
const optionsDatePickerCustomFormats2 = {
  locale: 'es-ES',
  date: new Date(2022, 8, 3),
  inputDateFormat: date => dayjs(date).locale('es').format('YYYY MMMM DD'),
  inputDateParse: date => dayjs(date, 'YYYY MMMM DD', 'es').toDate()
}

new coreui.DatePicker(myDatePickerCustomFormats2, optionsDatePickerCustomFormats2)
// js-docs-end date-picker-custom-formats2

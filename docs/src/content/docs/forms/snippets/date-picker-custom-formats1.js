const myDatePickerCustomFormats1 = document.getElementById('myDatePickerCustomFormats1')

dayjs.extend(window.dayjs_plugin_customParseFormat)
const optionsDatePickerCustomFormats1 = {
  locale: 'en-US',
  date: new Date(2022, 8, 3),
  inputDateFormat: date => dayjs(date).locale('en').format('MMMM DD, YYYY'),
  inputDateParse: date => dayjs(date, 'MMMM DD, YYYY', 'en').toDate()
}

new coreui.DatePicker(myDatePickerCustomFormats1, optionsDatePickerCustomFormats1)

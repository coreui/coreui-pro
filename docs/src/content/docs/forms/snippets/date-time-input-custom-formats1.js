const myDateTimeInputCustomFormats1 = document.getElementById('myDateTimeInputCustomFormats1')

dayjs.extend(window.dayjs_plugin_customParseFormat)
const optionsDateTimeInputCustomFormats1 = {
  locale: 'en-US',
  date: new Date(2022, 8, 3, 14, 30),
  format: 'MMMM DD, YYYY hh:mm A',
  inputDateParse: value => dayjs(value, 'MMMM DD, YYYY hh:mm A', 'en').toDate()
}

new coreui.DateTimeInput(myDateTimeInputCustomFormats1, optionsDateTimeInputCustomFormats1)

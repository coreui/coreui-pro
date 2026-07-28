const myTimeInputCustomFormats1 = document.getElementById('myTimeInputCustomFormats1')

dayjs.extend(window.dayjs_plugin_customParseFormat)
const optionsTimeInputCustomFormats1 = {
  locale: 'en-US',
  date: '14:30',
  format: 'hh:mm A',
  inputDateParse: value => dayjs(value, 'hh:mm A', 'en').toDate()
}

new coreui.TimeInput(myTimeInputCustomFormats1, optionsTimeInputCustomFormats1)

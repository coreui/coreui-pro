const myDateInputCustomFormats1 = document.getElementById('myDateInputCustomFormats1')

dayjs.extend(window.dayjs_plugin_customParseFormat)
const optionsDateInputCustomFormats1 = {
  locale: 'en-US',
  date: new Date(2022, 8, 3),
  format: 'MMMM DD, YYYY',
  inputDateParse: value => dayjs(value, 'MMMM DD, YYYY', 'en').toDate()
}

new coreui.DateInput(myDateInputCustomFormats1, optionsDateInputCustomFormats1)

const myDateInputCustomFormats2 = document.getElementById('myDateInputCustomFormats2')

dayjs.extend(window.dayjs_plugin_customParseFormat)
dayjs.locale('es')
const optionsDateInputCustomFormats2 = {
  locale: 'es-ES',
  date: new Date(2022, 8, 3),
  format: 'YYYY MMMM DD',
  inputDateParse: value => dayjs(value, 'YYYY MMMM DD', 'es').toDate()
}

new coreui.DateInput(myDateInputCustomFormats2, optionsDateInputCustomFormats2)

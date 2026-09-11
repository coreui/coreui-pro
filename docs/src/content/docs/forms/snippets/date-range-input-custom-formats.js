const myDateRangeInputCustomFormats = document.getElementById('myDateRangeInputCustomFormats')

dayjs.extend(window.dayjs_plugin_customParseFormat)
const optionsDateRangeInputCustomFormats = {
  locale: 'en-US',
  startDate: new Date(2026, 6, 14),
  endDate: new Date(2026, 6, 20),
  format: 'MMMM DD, YYYY',
  inputDateParse: value => dayjs(value, 'MMMM DD, YYYY', 'en').toDate()
}

new coreui.DateRangeInput(myDateRangeInputCustomFormats, optionsDateRangeInputCustomFormats)

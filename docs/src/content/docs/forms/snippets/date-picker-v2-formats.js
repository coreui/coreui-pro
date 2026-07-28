// A month-and-year mask works like the native month input: the picker reports
// the first day of the selected month.
const monthYearPickers = document.querySelectorAll('[data-coreui-format="MMMM yyyy"]')

for (const element of monthYearPickers) {
  element.addEventListener('dateChange.coreui.date-picker-v2', event => {
    console.log(event.date)
  })
}

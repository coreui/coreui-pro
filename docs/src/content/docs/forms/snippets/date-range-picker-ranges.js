const myDateRangePickerRanges = document.getElementById('myDateRangePickerRanges')

const dateRangePickerRanges = new coreui.DateRangePicker(myDateRangePickerRanges, {
  locale: 'en-US',
  startName: 'report-start',
  endName: 'report-end'
})

// Projected ranges act through the slot context — labels, order, and the
// date math are userland, the shell only exposes setRange.
const context = () => dateRangePickerRanges.getContext()
const today = new Date()

const presets = {
  rangeLast7: () => context().setRange(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6), today),
  rangeLast30: () => context().setRange(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29), today),
  rangeThisMonth: () => context().setRange(new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0))
}

for (const [id, apply] of Object.entries(presets)) {
  myDateRangePickerRanges.querySelector(`#${id}`).addEventListener('click', apply)
}

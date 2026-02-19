/* global coreui: false */

// js-docs-start time-picker-custom
const myTimePickerCustom = document.getElementById('myTimePickerCustom')

const options = {
  locale: 'en-US',
  hours: [1, 3, 5, 7],
  minutes: [0, 15, 30, 45],
  seconds: s => s < 20
}

new coreui.TimePicker(myTimePickerCustom, options)
// js-docs-end time-picker-custom

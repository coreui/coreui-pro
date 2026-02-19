/* global coreui: false */

// js-docs-start range-slider-custom-labels
const myRangeSliderCustomLabels = document.getElementById('myRangeSliderCustomLabels')

const optionsRangeSliderCustomLabels = {
  min: -50,
  max: 100,
  labels: [
    {
      value: -50,
      label: '-50°C',
      class: 'text-info'
    },
    {
      value: 0,
      label: '0°C',
      style: {
        fontWeight: 'bold'
      }
    },
    {
      value: 20,
      label: '20°C',
      class: ['text-warning']
    },
    {
      value: 100,
      label: '100°C',
      class: 'text-danger'
    }
  ],
  tooltipsFormat: value => `${value}°C`,
  value: [-10, 40]
}
new coreui.RangeSlider(myRangeSliderCustomLabels, optionsRangeSliderCustomLabels)
// js-docs-end range-slider-custom-labels

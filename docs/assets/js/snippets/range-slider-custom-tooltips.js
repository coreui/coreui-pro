/* global coreui: false */

// js-docs-start range-slider-custom-tooltips
const myRangeSliderCustomTooltips = document.getElementById('myRangeSliderCustomTooltips')

const optionsRangeSliderCustomTooltips = {
  max: 1000,
  labels: [
    {
      value: 0,
      label: '$0'
    },
    {
      value: 250,
      label: '$250'
    },
    {
      value: 500,
      label: '$500'
    },
    {
      value: 1000,
      label: '$1000'
    }
  ],
  tooltipsFormat: value => `$${value}`,
  value: [100, 350]
}
new coreui.RangeSlider(myRangeSliderCustomTooltips, optionsRangeSliderCustomTooltips)
// js-docs-end range-slider-custom-tooltips

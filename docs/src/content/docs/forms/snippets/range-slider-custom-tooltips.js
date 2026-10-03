const myRangeSliderCustomTooltips = document.getElementById('myRangeSliderCustomTooltips')

const optionsRangeSliderCustomTooltips = {
  ariaLabel: ['Minimum price', 'Maximum price'],
  max: 1000,
  ticks: [
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

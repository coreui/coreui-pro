const myRangeSliderCustomTicks = document.getElementById('myRangeSliderCustomTicks')

const optionsRangeSliderCustomTicks = {
  min: -50,
  max: 100,
  ticks: [
    {
      value: -50,
      label: '-50°C',
      class: 'fg-info'
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
      class: ['fg-warning']
    },
    {
      value: 100,
      label: '100°C',
      class: 'fg-danger'
    }
  ],
  tooltipsFormat: value => `${value}°C`,
  value: [-10, 40]
}
new coreui.RangeSlider(myRangeSliderCustomTicks, optionsRangeSliderCustomTicks)

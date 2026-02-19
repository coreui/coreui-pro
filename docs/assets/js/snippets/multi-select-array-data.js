/* global coreui: false */

// js-docs-start multi-select-array-data
const myMultiSelect = document.getElementById('multiSelect')

new coreui.MultiSelect(myMultiSelect, {
  name: 'multiSelect',
  options: [
    {
      label: 'frontend',
      options: [
        {
          value: 0,
          text: 'Angular'
        },
        {
          value: 1,
          text: 'Bootstrap',
          selected: true
        },
        {
          value: 2,
          text: 'React.js',
          selected: true
        },
        {
          value: 3,
          text: 'Vue.js'
        }
      ]
    },
    {
      label: 'backend',
      options: [
        {
          value: 4,
          text: 'Django'
        },
        {
          value: 5,
          text: 'Laravel'
        },
        {
          value: 6,
          text: 'Node.js',
          selected: true
        }
      ]
    }
  ],
  search: true
})
// js-docs-end multi-select-array-data

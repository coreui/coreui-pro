/* global coreui: false */

// js-docs-start autocomplete-array-data
const myAutoComplete = document.getElementById('myAutoComplete')

new coreui.Autocomplete(myAutoComplete, {
  name: 'autocomplete',
  options: [
    'Angular',
    'Bootstrap',
    {
      label: 'React.js',
      disabled: true
    },
    'Vue.js',
    {
      label: 'backend',
      options: ['Django', 'Laravel', 'Node.js']
    }
  ],
  value: 'Laravel'
})
// js-docs-end autocomplete-array-data

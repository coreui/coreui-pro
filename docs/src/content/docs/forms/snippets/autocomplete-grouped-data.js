const myAutoCompleteGrouped = document.getElementById('myAutoCompleteGrouped')

new coreui.Autocomplete(myAutoCompleteGrouped, {
  name: 'autocomplete-grouped',
  options: [
    'Angular',
    {
      label: 'Bootstrap',
      selected: true
    },
    {
      label: 'React.js',
      disabled: true
    },
    'Vue.js',
    {
      label: 'backend',
      options: ['Django', 'Laravel', 'Node.js']
    }
  ]
})

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

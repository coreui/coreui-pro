const myAutoCompleteDisabled = document.getElementById('myAutoCompleteDisabled')

new coreui.Autocomplete(myAutoCompleteDisabled, {
  name: 'autocomplete-disabled-options',
  options: [
    { label: 'Angular', value: 'angular' },
    { label: 'React.js', value: 'react' },
    { label: 'Vue.js', value: 'vue', disabled: true }
  ],
  placeholder: 'Select framework...',
  showHints: true
})

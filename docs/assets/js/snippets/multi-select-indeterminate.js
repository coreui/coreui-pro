/* global coreui: false */

// js-docs-start multi-select-indeterminate
const myMultiSelectIndeterminate = document.getElementById('myMultiSelectIndeterminate')

new coreui.MultiSelect(myMultiSelectIndeterminate, {
  multiple: true,
  optionsGroupsSelectable: true,
  options: [
    {
      label: 'Frontend',
      options: [
        { value: 'angular', text: 'Angular' },
        { value: 'react', text: 'React.js' },
        { value: 'vue', text: 'Vue.js' }
      ]
    },
    {
      label: 'Backend',
      options: [
        { value: 'django', text: 'Django' },
        { value: 'laravel', text: 'Laravel' },
        { value: 'node', text: 'Node.js' }
      ]
    }
  ],
  placeholder: 'Select frameworks',
  search: true,
  selectAllStyle: 'checkbox',
  selectionType: 'counter'
})
// js-docs-end multi-select-indeterminate

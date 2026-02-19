/* global coreui: false */

// js-docs-start autocomplete-option-values
const myAutoCompleteValues = document.getElementById('myAutoCompleteValues')

new coreui.Autocomplete(myAutoCompleteValues, {
  cleaner: true,
  indicator: true,
  name: 'autocomplete-option-values',
  options: [
    { label: 'Product A', value: 1 },
    { label: 'Product B', value: 2 },
    { label: 'Product C', value: 3.5 },
    { label: 'Product D', value: 42 },
    {
      label: 'Categories',
      options: [
        { label: 'Electronics', value: 100 },
        { label: 'Books', value: 200 },
        { label: 'Clothing', value: 300 }
      ]
    }
  ],
  placeholder: 'Select product by ID...',
  search: 'global',
  value: 100
})

// Log the selected value to demonstrate that numbers are converted to strings
myAutoCompleteValues.addEventListener('changed.coreui.autocomplete', event => {
  // eslint-disable-next-line no-console
  console.log('Selected value:', event.value.value)
  // eslint-disable-next-line no-console
  console.log('Selected label:', event.value.label)
})
// js-docs-end autocomplete-option-values

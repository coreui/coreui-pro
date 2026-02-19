/* global coreui: false */

// js-docs-start autocomplete-custom-options
const myAutocompleteCountries = document.getElementById('myAutocompleteCountries')
const myAutocompleteCountriesAndCities = document.getElementById('myAutocompleteCountriesAndCities')

const countries = [
  {
    value: 'pl',
    label: 'Poland',
    flag: '🇵🇱'
  },
  {
    value: 'de',
    label: 'Germany',
    flag: '🇩🇪'
  },
  {
    value: 'us',
    label: 'United States',
    flag: '🇺🇸'
  },
  {
    value: 'es',
    label: 'Spain',
    flag: '🇪🇸'
  },
  {
    value: 'gb',
    label: 'United Kingdom',
    flag: '🇬🇧'
  }
]

const cities = [
  {
    label: 'United States',
    code: 'us',
    flag: '🇺🇸',
    options: [
      {
        value: 'au',
        label: 'Austin'
      },
      {
        value: 'ch',
        label: 'Chicago'
      },
      {
        value: 'la',
        label: 'Los Angeles'
      },
      {
        value: 'ny',
        label: 'New York'
      },
      {
        value: 'sa',
        label: 'San Jose'
      }
    ]
  },
  {
    label: 'United Kingdom',
    code: 'gb',
    flag: '🇬🇧',
    options: [
      {
        value: 'li',
        label: 'Liverpool'
      },
      {
        value: 'lo',
        label: 'London'
      },
      {
        value: 'ma',
        label: 'Manchester'
      }
    ]
  }
]

new coreui.Autocomplete(myAutocompleteCountries, {
  cleaner: true,
  indicator: true,
  options: countries,
  optionsTemplate(option) {
    return `<div class="d-flex align-items-center gap-2"><span class="fs-5">${option.flag}</span><span>${option.label}</span></div>`
  },
  placeholder: 'Select country',
  showHints: true,
  search: 'global'
})

new coreui.Autocomplete(myAutocompleteCountriesAndCities, {
  cleaner: true,
  indicator: true,
  options: cities,
  optionsGroupsTemplate(optionGroup) {
    return `<div class="d-flex align-items-center gap-2"><span class="text-body fs-5">${optionGroup.flag}</span><span>${optionGroup.label}</span></div>`
  },
  placeholder: 'Select city',
  showHints: true,
  search: 'global'
})
// js-docs-end autocomplete-custom-options

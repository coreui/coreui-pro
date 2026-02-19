/* global coreui: false */

// js-docs-start multi-select-custom-options
const myMultiSelectCountries = document.getElementById('myMultiSelectCountries')
const myMultiSelectCountriesAndCities = document.getElementById('myMultiSelectCountriesAndCities')

const countries = [
  {
    value: 'pl',
    text: 'Poland',
    flag: '🇵🇱'
  },
  {
    value: 'de',
    text: 'Germany',
    flag: '🇩🇪'
  },
  {
    value: 'us',
    text: 'United States',
    flag: '🇺🇸'
  },
  {
    value: 'es',
    text: 'Spain',
    flag: '🇪🇸'
  },
  {
    value: 'gb',
    text: 'United Kingdom',
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
        text: 'Austin'
      },
      {
        value: 'ch',
        text: 'Chicago'
      },
      {
        value: 'la',
        text: 'Los Angeles'
      },
      {
        value: 'ny',
        text: 'New York'
      },
      {
        value: 'sa',
        text: 'San Jose'
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
        text: 'Liverpool'
      },
      {
        value: 'lo',
        text: 'London'
      },
      {
        value: 'ma',
        text: 'Manchester'
      }
    ]
  }
]

new coreui.MultiSelect(myMultiSelectCountries, {
  cleaner: true,
  multiple: true,
  options: countries,
  optionsTemplate(option) {
    return `<div class="d-flex align-items-center gap-2"><span class="fs-5">${option.flag}</span><span>${option.text}</span></div>`
  },
  placeholder: 'Select countries',
  search: true,
  selectionType: 'tags'
})

new coreui.MultiSelect(myMultiSelectCountriesAndCities, {
  cleaner: true,
  multiple: true,
  options: cities,
  optionsGroupsTemplate(optionGroup) {
    return `<div class="d-flex align-items-center gap-2"><span class="text-body fs-5">${optionGroup.flag}</span><span>${optionGroup.label}</span></div>`
  },
  placeholder: 'Select cities',
  search: true,
  selectionType: 'tags'
})
// js-docs-end multi-select-custom-options

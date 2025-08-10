/* eslint-disable complexity */
// NOTICE!!! Initially embedded in our docs this JavaScript
// file contains elements that can help you create reproducible
// use cases in StackBlitz for instance.
// In a real project please adapt this content to your needs.
// ++++++++++++++++++++++++++++++++++++++++++

/*!
 * JavaScript for CoreUI's docs (https://coreui.io/)
 * Copyright 2025 creativeLabs Lukasz Holeczek
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 * For details, see https://creativecommons.org/licenses/by/3.0/.
 */

/* global coreui: false, dayjs: false */

export default () => {
  // --------
  // Tooltips
  // --------
  // Instantiate all tooltips in a docs or StackBlitz
  document.querySelectorAll('[data-coreui-toggle="tooltip"]')
    .forEach(tooltip => {
      new coreui.Tooltip(tooltip)
    })

  // --------
  // Popovers
  // --------
  // Instantiate all popovers in docs or StackBlitz
  document.querySelectorAll('[data-coreui-toggle="popover"]')
    .forEach(popover => {
      new coreui.Popover(popover)
    })

  // -------------------------------
  // Toasts
  // -------------------------------
  // Used by 'Placement' example in docs or StackBlitz
  const toastPlacement = document.getElementById('toastPlacement')
  if (toastPlacement) {
    document.getElementById('selectToastPlacement').addEventListener('change', function () {
      if (!toastPlacement.dataset.originalClass) {
        toastPlacement.dataset.originalClass = toastPlacement.className
      }

      toastPlacement.className = `${toastPlacement.dataset.originalClass} ${this.value}`
    })
  }

  // Instantiate all toasts in docs pages only
  document.querySelectorAll('.docs-example .toast')
    .forEach(toastNode => {
      const toast = new coreui.Toast(toastNode, {
        autohide: false
      })

      toast.show()
    })

  // Instantiate all toasts in docs pages only
  // js-docs-start live-toast
  const toastTrigger = document.getElementById('liveToastBtn')
  const toastLiveExample = document.getElementById('liveToast')

  if (toastTrigger) {
    const toastCoreUI = coreui.Toast.getOrCreateInstance(toastLiveExample)
    toastTrigger.addEventListener('click', () => {
      toastCoreUI.show()
    })
  }
  // js-docs-end live-toast

  // -------------------------------
  // Alerts
  // -------------------------------
  // Used in 'Show live alert' example in docs or StackBlitz

  // js-docs-start live-alert
  const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
  const appendAlert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-coreui-dismiss="alert" aria-label="Close"></button>',
      '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
  }

  const alertTrigger = document.getElementById('liveAlertBtn')
  if (alertTrigger) {
    alertTrigger.addEventListener('click', () => {
      appendAlert('Nice, you triggered this alert message!', 'success')
    })
  }
  // js-docs-end live-alert

  // --------
  // Carousels
  // --------
  // Instantiate all non-autoplaying carousels in docs or StackBlitz
  document.querySelectorAll('.carousel:not([data-coreui-ride="carousel"])')
    .forEach(carousel => {
      coreui.Carousel.getOrCreateInstance(carousel)
    })

  // -------------------------------
  // Checks & Radios
  // -------------------------------
  // Indeterminate checkbox example in docs and StackBlitz
  document.querySelectorAll('.docs-example-indeterminate [type="checkbox"]')
    .forEach(checkbox => {
      if (checkbox.id.includes('Indeterminate')) {
        checkbox.indeterminate = true
      }
    })

  // -------------------------------
  // Links
  // -------------------------------
  // Disable empty links in docs examples only
  document.querySelectorAll('.docs-content [href="#"]')
    .forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault()
      })
    })

  // -------------------------------
  // Modal
  // -------------------------------
  // Modal 'Varying modal content' example in docs and StackBlitz
  // js-docs-start varying-modal-content
  const exampleModal = document.getElementById('exampleModal')
  if (exampleModal) {
    exampleModal.addEventListener('show.coreui.modal', event => {
      // Button that triggered the modal
      const button = event.relatedTarget
      // Extract info from data-coreui-* attributes
      const recipient = button.getAttribute('data-coreui-whatever')
      // If necessary, you could initiate an Ajax request here
      // and then do the updating in a callback.

      // Update the modal's content.
      const modalTitle = exampleModal.querySelector('.modal-title')
      const modalBodyInput = exampleModal.querySelector('.modal-body input')

      modalTitle.textContent = `New message to ${recipient}`
      modalBodyInput.value = recipient
    })
  }
  // js-docs-end varying-modal-content

  // -------------------------------
  // Offcanvas
  // -------------------------------
  // 'Offcanvas components' example in docs only
  const myOffcanvas = document.querySelectorAll('.docs-example-offcanvas .offcanvas')
  if (myOffcanvas) {
    myOffcanvas.forEach(offcanvas => {
      offcanvas.addEventListener('show.coreui.offcanvas', event => {
        event.preventDefault()
      }, false)
    })
  }

  // -------------------------------
  // Aurocomplete
  // -------------------------------
  // 'Autocomplete components' example in docs only
  // js-docs-start autocomplete-array-data
  const myAutoComplete = document.getElementById('myAutoComplete')

  if (myAutoComplete) {
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
  }
  // js-docs-end autocomplete-array-data

  // js-docs-start autocomplete-grouped-data
  const myAutoCompleteGrouped = document.getElementById('myAutoCompleteGrouped')

  if (myAutoCompleteGrouped) {
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
  }
  // js-docs-end autocomplete-grouped-data

  // js-docs-start autocomplete-external-data
  const myAutoCompleteExternalData = document.getElementById('myAutoCompleteExternalData')

  if (myAutoCompleteExternalData) {
    const getUsers = async (name = '') => {
      try {
        const response = await fetch(`https://apitest.coreui.io/demos/users?first_name=${name}&limit=10`)
        const users = await response.json()

        return users.records.map(user => ({
          value: user.id,
          label: user.first_name
        }))
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching users:', error)
      }
    }

    const autocomplete = new coreui.Autocomplete(myAutoCompleteExternalData, {
      cleaner: true,
      highlightOptionsOnSearch: true,
      name: 'autocomplete-external',
      options: [],
      placeholder: 'Search names...',
      search: ['external', 'global'], // 🔴 'external' is required for external search
      showHints: true
    })

    let lastQuery = null
    let debounceTimer = null

    myAutoCompleteExternalData.addEventListener('show.coreui.autocomplete', async () => {
      const users = await getUsers()
      autocomplete.update({ options: users })
    })

    myAutoCompleteExternalData.addEventListener('input.coreui.autocomplete', event => {
      const query = event.value

      if (query === lastQuery) {
        return
      }

      lastQuery = query

      clearTimeout(debounceTimer)

      debounceTimer = setTimeout(async () => {
        const users = await getUsers(query)
        autocomplete.update({ options: users })
      }, 200)
    })
  }
  // js-docs-end autocomplete-external-data

  // js-docs-start autocomplete-custom-options
  const myAutocompleteCountries = document.getElementById('myAutocompleteCountries')
  const myAutocompleteCountriesAndCities = document.getElementById('myAutocompleteCountriesAndCities')

  if (myAutocompleteCountries && myAutocompleteCountriesAndCities) {
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
  }
  // js-docs-end autocomplete-custom-options

  // js-docs-start autocomplete-option-values
  const myAutoCompleteValues = document.getElementById('myAutoCompleteValues')

  if (myAutoCompleteValues) {
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
  }
  // js-docs-end autocomplete-option-values

  // -------------------------------
  // Multi Selects
  // -------------------------------
  // 'Multi Selects components' example in docs only
  // js-docs-start multi-select-array-data
  const myMultiSelect = document.getElementById('multiSelect')

  if (myMultiSelect) {
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
  }
  // js-docs-end multi-select-array-data

  // js-docs-start multi-select-custom-options
  const myMultiSelectCountries = document.getElementById('myMultiSelectCountries')
  const myMultiSelectCountriesAndCities = document.getElementById('myMultiSelectCountriesAndCities')

  if (myMultiSelectCountries && myMultiSelectCountriesAndCities) {
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
  }
  // js-docs-end multi-select-custom-options

  // -------------------------------
  // Calendars
  // -------------------------------
  // 'Calendars components' example in docs only

  // js-docs-start calendar-disabled-dates
  const myCalendarDisabledDates = document.getElementById('myCalendarDisabledDates')
  if (myCalendarDisabledDates) {
    const optionsCalendarDisabledDates = {
      calendarDate: new Date(2022, 2, 1),
      calendars: 2,
      disabledDates: [
        [new Date(2022, 2, 4), new Date(2022, 2, 7)],
        new Date(2022, 2, 16),
        new Date(2022, 3, 16),
        [new Date(2022, 4, 2), new Date(2022, 4, 8)]
      ],
      locale: 'en-US',
      maxDate: new Date(2022, 5, 0),
      minDate: new Date(2022, 1, 1)
    }

    new coreui.Calendar(myCalendarDisabledDates, optionsCalendarDisabledDates)
  }
  // js-docs-end calendar-disabled-dates

  // js-docs-start calendar-disabled-dates2
  const myCalendarDisabledDates2 = document.getElementById('myCalendarDisabledDates2')
  if (myCalendarDisabledDates2) {
    const disableWeekends = date => {
      const day = date.getDay()
      return day === 0 || day === 6
    }

    const optionsCalendarDisabledDates2 = {
      calendars: 2,
      disabledDates: disableWeekends,
      locale: 'en-US'
    }

    new coreui.Calendar(myCalendarDisabledDates2, optionsCalendarDisabledDates2)
  }
  // js-docs-end calendar-disabled-dates2

  // js-docs-start calendar-disabled-dates3
  const myCalendarDisabledDates3 = document.getElementById('myCalendarDisabledDates3')
  if (myCalendarDisabledDates3) {
    const disableWeekends = date => {
      const day = date.getDay()
      return day === 0 || day === 6
    }

    const specificDates = [
      new Date(2024, 10, 25),
      new Date(2024, 11, 4),
      new Date(2024, 11, 12)
    ]

    const optionsCalendarDisabledDates3 = {
      calendarDate: new Date(2024, 10, 1),
      calendars: 2,
      disabledDates: [disableWeekends, ...specificDates],
      locale: 'en-US'
    }

    new coreui.Calendar(myCalendarDisabledDates3, optionsCalendarDisabledDates3)
  }
  // js-docs-end calendar-disabled-dates3

  // -------------------------------
  // Date Pickers
  // -------------------------------
  // 'Date Pickers components' example in docs only

  // js-docs-start date-picker-disabled-dates
  const myDatePickerDisabledDates = document.getElementById('myDatePickerDisabledDates')
  if (myDatePickerDisabledDates) {
    const optionsDatePickerDisabledDates = {
      locale: 'en-US',
      calendarDate: new Date(2022, 2, 1),
      disabledDates: [
        [new Date(2022, 2, 4), new Date(2022, 2, 7)],
        new Date(2022, 2, 16),
        new Date(2022, 3, 16),
        [new Date(2022, 4, 2), new Date(2022, 4, 8)]
      ],
      maxDate: new Date(2022, 5, 0),
      minDate: new Date(2022, 1, 1)
    }

    new coreui.DatePicker(myDatePickerDisabledDates, optionsDatePickerDisabledDates)
  }
  // js-docs-end date-picker-disabled-dates

  // js-docs-start date-picker-disabled-dates2
  const myDatePickerDisabledDates2 = document.getElementById('myDatePickerDisabledDates2')
  if (myDatePickerDisabledDates2) {
    const disableWeekends = date => {
      const day = date.getDay()
      return day === 0 || day === 6
    }

    const optionsDatePickerDisabledDates2 = {
      disabledDates: disableWeekends,
      locale: 'en-US'
    }

    new coreui.DateRangePicker(document.getElementById('myDatePickerDisabledDates2'), optionsDatePickerDisabledDates2)
  }
  // js-docs-end date-picker-disabled-dates2

  // js-docs-start date-picker-custom-formats1
  const myDatePickerCustomFormats1 = document.getElementById('myDatePickerCustomFormats1')
  if (myDatePickerCustomFormats1) {
    dayjs.extend(window.dayjs_plugin_customParseFormat)
    const optionsDatePickerCustomFormats1 = {
      locale: 'en-US',
      date: new Date(2022, 8, 3),
      inputDateFormat: date => dayjs(date).locale('en').format('MMMM DD, YYYY'),
      inputDateParse: date => dayjs(date, 'MMMM DD, YYYY', 'en').toDate()
    }

    new coreui.DatePicker(myDatePickerCustomFormats1, optionsDatePickerCustomFormats1)
  }
  // js-docs-end date-picker-custom-formats1

  // js-docs-start date-picker-custom-formats2
  const myDatePickerCustomFormats2 = document.getElementById('myDatePickerCustomFormats2')
  if (myDatePickerCustomFormats2) {
    dayjs.extend(window.dayjs_plugin_customParseFormat)
    dayjs.locale('es')
    const optionsDatePickerCustomFormats2 = {
      locale: 'es-ES',
      date: new Date(2022, 8, 3),
      inputDateFormat: date => dayjs(date).locale('es').format('YYYY MMMM DD'),
      inputDateParse: date => dayjs(date, 'YYYY MMMM DD', 'es').toDate()
    }

    new coreui.DatePicker(myDatePickerCustomFormats2, optionsDatePickerCustomFormats2)
  }
  // js-docs-end date-picker-custom-formats2

  // -------------------------------
  // Date Range Pickers
  // -------------------------------
  // 'Date Range Pickers components' example in docs only

  // js-docs-start date-range-picker-disabled-dates
  const myDateRangePickerDisabledDates = document.getElementById('myDateRangePickerDisabledDates')
  if (myDateRangePickerDisabledDates) {
    const optionsDateRangePickerDisabledDates = {
      locale: 'en-US',
      calendarDate: new Date(2022, 2, 1),
      disabledDates: [
        [new Date(2022, 2, 4), new Date(2022, 2, 7)],
        new Date(2022, 2, 16),
        new Date(2022, 3, 16),
        [new Date(2022, 4, 2), new Date(2022, 4, 8)]
      ],
      maxDate: new Date(2022, 5, 0),
      minDate: new Date(2022, 1, 1)
    }

    new coreui.DateRangePicker(document.getElementById('myDateRangePickerDisabledDates'), optionsDateRangePickerDisabledDates)
  }
  // js-docs-end date-range-picker-disabled-dates

  // js-docs-start date-range-picker-disabled-dates2
  const myDateRangePickerDisabledDates2 = document.getElementById('myDateRangePickerDisabledDates2')
  if (myDateRangePickerDisabledDates2) {
    const disableWeekends = date => {
      const day = date.getDay()
      return day === 0 || day === 6
    }

    const optionsDateRangePickerDisabledDates2 = {
      disabledDates: disableWeekends,
      locale: 'en-US'
    }

    new coreui.DateRangePicker(document.getElementById('myDateRangePickerDisabledDates2'), optionsDateRangePickerDisabledDates2)
  }
  // js-docs-end date-range-picker-disabled-dates2

  // js-docs-start date-range-picker-custom-formats1
  const myDateRangePickerCustomFormats1 = document.getElementById('myDateRangePickerCustomFormats1')
  if (myDateRangePickerCustomFormats1) {
    dayjs.extend(window.dayjs_plugin_customParseFormat)
    const optionsDateRangePickerCustomFormats1 = {
      locale: 'en-US',
      startDate: new Date(2022, 8, 3),
      endDate: new Date(2022, 8, 17),
      inputDateFormat: date => dayjs(date).locale('en').format('MMMM DD, YYYY'),
      inputDateParse: date => dayjs(date, 'MMMM DD, YYYY', 'en').toDate()
    }

    new coreui.DateRangePicker(myDateRangePickerCustomFormats1, optionsDateRangePickerCustomFormats1)
  }
  // js-docs-end date-range-picker-custom-formats1

  // js-docs-start date-range-picker-custom-formats2
  const myDateRangePickerCustomFormats2 = document.getElementById('myDateRangePickerCustomFormats2')
  if (myDateRangePickerCustomFormats2) {
    dayjs.extend(window.dayjs_plugin_customParseFormat)
    dayjs.locale('es')
    const optionsDateRangePickerCustomFormats2 = {
      locale: 'es-ES',
      startDate: new Date(2022, 8, 3),
      endDate: new Date(2022, 8, 17),
      inputDateFormat: date => dayjs(date).locale('es').format('YYYY MMMM DD'),
      inputDateParse: date => dayjs(date, 'YYYY MMMM DD', 'es').toDate()
    }

    new coreui.DateRangePicker(myDateRangePickerCustomFormats2, optionsDateRangePickerCustomFormats2)
  }
  // js-docs-end date-range-picker-custom-formats2

  // js-docs-start date-range-picker-custom-ranges
  const myDateRangePickerCustomRanges = document.getElementById('myDateRangePickerCustomRanges')
  if (myDateRangePickerCustomRanges) {
    const optionsCustomRanges = {
      locale: 'en-US',
      ranges: {
        Today: [new Date(), new Date()],
        Yesterday: [
          new Date(new Date().setDate(new Date().getDate() - 1)),
          new Date(new Date().setDate(new Date().getDate() - 1))
        ],
        'Last 7 Days': [
          new Date(new Date().setDate(new Date().getDate() - 6)),
          new Date(new Date())
        ],
        'Last 30 Days': [
          new Date(new Date().setDate(new Date().getDate() - 29)),
          new Date(new Date())
        ],
        'This Month': [
          new Date(new Date().setDate(1)),
          new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        ],
        'Last Month': [
          new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          new Date(new Date().getFullYear(), new Date().getMonth(), 0)
        ]
      }
    }

    new coreui.DateRangePicker(myDateRangePickerCustomRanges, optionsCustomRanges)

    myDateRangePickerCustomRanges.addEventListener('startDateChange.coreui.date-range-picker', event => {
      // eslint-disable-next-line no-console
      console.log(event.date)
    })
  }
  // js-docs-end date-range-picker-custom-ranges

  // js-docs-start range-slider-custom-labels
  const myRangeSliderCustomLabels = document.getElementById('myRangeSliderCustomLabels')
  if (myRangeSliderCustomLabels) {
    const optionsRangeSliderCustomLabels = {
      min: -50,
      max: 100,
      labels: [
        {
          value: -50,
          label: '-50°C',
          class: 'text-info'
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
          class: ['text-warning']
        },
        {
          value: 100,
          label: '100°C',
          class: 'text-danger'
        }
      ],
      tooltipsFormat: value => `${value}°C`,
      value: [-10, 40]
    }
    new coreui.RangeSlider(myRangeSliderCustomLabels, optionsRangeSliderCustomLabels)
  }
  // js-docs-end range-slider-custom-labels

  // js-docs-start range-slider-custom-tooltips
  const myRangeSliderCustomTooltips = document.getElementById('myRangeSliderCustomTooltips')
  if (myRangeSliderCustomTooltips) {
    const optionsRangeSliderCustomTooltips = {
      max: 1000,
      labels: [
        {
          value: 0,
          label: '$0'
        },
        {
          value: 250,
          label: '$250'
        },
        {
          value: 500,
          label: '$500'
        },
        {
          value: 1000,
          label: '$1000'
        }
      ],
      tooltipsFormat: value => `$${value}`,
      value: [100, 350]
    }
    new coreui.RangeSlider(myRangeSliderCustomTooltips, optionsRangeSliderCustomTooltips)
  }
  // js-docs-end range-slider-custom-tooltips

  // js-docs-start rating-custom-icons1
  const myRatingCustomIcons1 = document.getElementById('myRatingCustomIcons1')
  if (myRatingCustomIcons1) {
    const optionsCustomIcons1 = {
      activeIcon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M470.935,194.043,333.8,171.757,270.227,48.22a16,16,0,0,0-28.454,0L178.2,171.757,41.065,194.043A16,16,0,0,0,32.273,221.1l97.845,98.636L108.936,457.051a16,16,0,0,0,23.02,16.724L256,411.2l124.044,62.576a16,16,0,0,0,23.02-16.724L381.882,319.74,479.727,221.1A16,16,0,0,0,470.935,194.043Z"/></svg>',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M494,198.671a40.536,40.536,0,0,0-32.174-27.592L345.917,152.242,292.185,47.828a40.7,40.7,0,0,0-72.37,0L166.083,152.242,50.176,171.079a40.7,40.7,0,0,0-22.364,68.827l82.7,83.368-17.9,116.055a40.672,40.672,0,0,0,58.548,42.538L256,428.977l104.843,52.89a40.69,40.69,0,0,0,58.548-42.538l-17.9-116.055,82.7-83.368A40.538,40.538,0,0,0,494,198.671Zm-32.53,18.7L367.4,312.2l20.364,132.01a8.671,8.671,0,0,1-12.509,9.088L256,393.136,136.744,453.3a8.671,8.671,0,0,1-12.509-9.088L144.6,312.2,50.531,217.37a8.7,8.7,0,0,1,4.778-14.706L187.15,181.238,248.269,62.471a8.694,8.694,0,0,1,15.462,0L324.85,181.238l131.841,21.426A8.7,8.7,0,0,1,461.469,217.37Z"/></svg>',
      value: 3
    }
    new coreui.Rating(myRatingCustomIcons1, optionsCustomIcons1)
  }
  // js-docs-end rating-custom-icons1

  // js-docs-start rating-custom-icons2
  const myRatingCustomIcons2 = document.getElementById('myRatingCustomIcons2')
  if (myRatingCustomIcons2) {
    const optionsCustomIcons2 = {
      activeIcon: '<i class="cil-heart text-danger"></i>',
      icon: '<i class="cil-heart"></i>',
      value: 3
    }
    new coreui.Rating(myRatingCustomIcons2, optionsCustomIcons2)
  }
  // js-docs-end rating-custom-icons2

  // js-docs-start rating-custom-icons3
  const myRatingCustomIcons3 = document.getElementById('myRatingCustomIcons3')
  if (myRatingCustomIcons3) {
    const optionsCustomIcons3 = {
      activeIcon: {
        1: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="text-danger-emphasis" role="img" aria-hidden="true"><path fill="var(--ci-primary-color, currentColor)" d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z" class="ci-primary"></path><path fill="var(--ci-primary-color, currentColor)" d="M256,280A104,104,0,0,0,152,384H360A104,104,0,0,0,256,280Z" class="ci-primary"></path><rect width="32.001" height="96.333" x="148" y="159.834" fill="var(--ci-primary-color, currentColor)" class="ci-primary" transform="rotate(-48.366 164.002 208.001)"></rect><rect width="96.333" height="32" x="291.834" y="192" fill="var(--ci-primary-color, currentColor)" class="ci-primary" transform="rotate(-48.366 340.002 208)"></rect></svg>',
        2: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="text-danger" role="img" aria-hidden="true"><path fill="var(--ci-primary-color, currentColor)" d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z" class="ci-primary"></path><rect width="40" height="40" x="152" y="200" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect><rect width="40" height="40" x="320" y="200" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect><path fill="var(--ci-primary-color, currentColor)" d="M256,280A104,104,0,0,0,152,384H360A104,104,0,0,0,256,280Z" class="ci-primary"></path></svg>',
        3: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="text-warning" role="img" aria-hidden="true"><path fill="var(--ci-primary-color, currentColor)" d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z" class="ci-primary"></path><rect width="40" height="40" x="152" y="200" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect><rect width="40" height="40" x="320" y="200" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect><rect width="176" height="32" x="168" y="320" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect></svg>',
        4: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="text-success" role="img" aria-hidden="true"><path fill="var(--ci-primary-color, currentColor)" d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z" class="ci-primary"></path><rect width="40" height="40" x="152" y="200" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect><rect width="40" height="40" x="320" y="200" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect><path fill="var(--ci-primary-color, currentColor)" d="M256,384A104,104,0,0,0,360,280H152A104,104,0,0,0,256,384Z" class="ci-primary"></path></svg>',
        5: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="text-success-emphasis" role="img" aria-hidden="true"><path fill="var(--ci-primary-color, currentColor)" d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z" class="ci-primary"></path><path fill="var(--ci-primary-color, currentColor)" d="M256,384A104,104,0,0,0,360,280H152A104,104,0,0,0,256,384Z" class="ci-primary"></path><polygon fill="var(--ci-primary-color, currentColor)" points="205.757 228.292 226.243 203.708 168 155.173 109.757 203.708 130.243 228.292 168 196.827 205.757 228.292" class="ci-primary"></polygon><polygon fill="var(--ci-primary-color, currentColor)" points="285.757 203.708 306.243 228.292 344 196.827 381.757 228.292 402.243 203.708 344 155.173 285.757 203.708" class="ci-primary"></polygon></svg>'
      },
      icon: {
        1: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-hidden="true"><path fill="var(--ci-primary-color, currentColor)" d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z" class="ci-primary"></path><path fill="var(--ci-primary-color, currentColor)" d="M256,280A104,104,0,0,0,152,384H360A104,104,0,0,0,256,280Z" class="ci-primary"></path><rect width="32.001" height="96.333" x="148" y="159.834" fill="var(--ci-primary-color, currentColor)" class="ci-primary" transform="rotate(-48.366 164.002 208.001)"></rect><rect width="96.333" height="32" x="291.834" y="192" fill="var(--ci-primary-color, currentColor)" class="ci-primary" transform="rotate(-48.366 340.002 208)"></rect></svg>',
        2: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-hidden="true"><path fill="var(--ci-primary-color, currentColor)" d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z" class="ci-primary"></path><rect width="40" height="40" x="152" y="200" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect><rect width="40" height="40" x="320" y="200" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect><path fill="var(--ci-primary-color, currentColor)" d="M256,280A104,104,0,0,0,152,384H360A104,104,0,0,0,256,280Z" class="ci-primary"></path></svg>',
        3: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-hidden="true"><path fill="var(--ci-primary-color, currentColor)" d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z" class="ci-primary"></path><rect width="40" height="40" x="152" y="200" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect><rect width="40" height="40" x="320" y="200" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect><rect width="176" height="32" x="168" y="320" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect></svg>',
        4: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-hidden="true"><path fill="var(--ci-primary-color, currentColor)" d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z" class="ci-primary"></path><rect width="40" height="40" x="152" y="200" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect><rect width="40" height="40" x="320" y="200" fill="var(--ci-primary-color, currentColor)" class="ci-primary"></rect><path fill="var(--ci-primary-color, currentColor)" d="M256,384A104,104,0,0,0,360,280H152A104,104,0,0,0,256,384Z" class="ci-primary"></path></svg>',
        5: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-hidden="true"><path fill="var(--ci-primary-color, currentColor)" d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z" class="ci-primary"></path><path fill="var(--ci-primary-color, currentColor)" d="M256,384A104,104,0,0,0,360,280H152A104,104,0,0,0,256,384Z" class="ci-primary"></path><polygon fill="var(--ci-primary-color, currentColor)" points="205.757 228.292 226.243 203.708 168 155.173 109.757 203.708 130.243 228.292 168 196.827 205.757 228.292" class="ci-primary"></polygon><polygon fill="var(--ci-primary-color, currentColor)" points="285.757 203.708 306.243 228.292 344 196.827 381.757 228.292 402.243 203.708 344 155.173 285.757 203.708" class="ci-primary"></polygon></svg>'
      },
      highlightOnlySelected: true,
      tooltips: ['Very bad', 'Bad', 'Meh', 'Good', 'Very good'],
      value: 3
    }
    new coreui.Rating(myRatingCustomIcons3, optionsCustomIcons3)
  }
  // js-docs-end rating-custom-icons3

  // js-docs-start rating-custom-feedback
  const myRatingCustomFeedback = document.getElementById('myRatingCustomFeedback')
  const myRatingCustomFeedbackStart = document.getElementById('myRatingCustomFeedbackStart')
  const myRatingCustomFeedbackEnd = document.getElementById('myRatingCustomFeedbackEnd')
  if (myRatingCustomFeedback) {
    let currentValue = 3
    const labels = {
      1: 'Very bad',
      2: 'Bad',
      3: 'Meh',
      4: 'Good',
      5: 'Very good'
    }
    const optionsCustomFeedback = {
      value: currentValue
    }

    new coreui.Rating(myRatingCustomFeedback, optionsCustomFeedback)

    myRatingCustomFeedback.addEventListener('change.coreui.rating', event => {
      currentValue = event.value
      myRatingCustomFeedbackStart.innerHTML = `${event.value} / 5`
      myRatingCustomFeedbackEnd.innerHTML = labels[event.value]
    })

    myRatingCustomFeedback.addEventListener('hover.coreui.rating', event => {
      myRatingCustomFeedbackEnd.innerHTML = event.value ? labels[event.value] : labels[currentValue]
    })
  }
  // js-docs-end rating-custom-feedback

  // -------------------------------
  // Time Pickers
  // -------------------------------
  // 'Time Pickers components' example in docs only

  // js-docs-start time-picker-custom
  const myTimePickerCustom = document.getElementById('myTimePickerCustom')
  if (myTimePickerCustom) {
    const options = {
      locale: 'en-US',
      hours: [1, 3, 5, 7],
      minutes: [0, 15, 30, 45],
      seconds: s => s < 20
    }

    new coreui.TimePicker(document.getElementById('myTimePickerCustom'), options)
  }
  // js-docs-end time-picker-custom
}

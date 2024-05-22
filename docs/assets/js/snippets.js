/* eslint-disable complexity */
// NOTICE!!! Initially embedded in our docs this JavaScript
// file contains elements that can help you create reproducible
// use cases in StackBlitz for instance.
// In a real project please adapt this content to your needs.
// ++++++++++++++++++++++++++++++++++++++++++

/*!
 * JavaScript for CoreUI's docs (https://coreui.io/)
 * Copyright 2024 creativeLabs Lukasz Holeczek
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 * For details, see https://creativecommons.org/licenses/by/3.0/.
 */

/* global coreui: false, dayjs: false */
(() => {
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

  // -------------------------------
  // Calendars
  // -------------------------------
  // 'Calendars components' example in docs only

  const myCalendar = document.getElementById('myCalendar')
  if (myCalendar) {
    new coreui.Calendar(myCalendar)

    myCalendar.addEventListener('startDateChange.coreui.calendar', event => {
      // eslint-disable-next-line no-console
      console.log(event.date)
    })

    myCalendar.addEventListener('endDateChange.coreui.calendar', event => {
      // eslint-disable-next-line no-console
      console.log(event.date)
    })
  }

  const myCalendarWeek = document.getElementById('myCalendarWeek')
  if (myCalendarWeek) {
    new coreui.Calendar(myCalendarWeek)

    myCalendarWeek.addEventListener('startDateChange.coreui.calendar', event => {
      // eslint-disable-next-line no-console
      console.log(event.date)
    })

    myCalendarWeek.addEventListener('endDateChange.coreui.calendar', event => {
      // eslint-disable-next-line no-console
      console.log(event.date)
    })

    myCalendarWeek.addEventListener('cellHover.coreui.calendar', event => {
      // eslint-disable-next-line no-console
      console.log(event.date)
    })
  }

  const myCalendarMonth = document.getElementById('myCalendarMonth')
  if (myCalendarMonth) {
    new coreui.Calendar(myCalendarMonth)

    myCalendarMonth.addEventListener('startDateChange.coreui.calendar', event => {
      // eslint-disable-next-line no-console
      console.log(event.date)
    })

    myCalendarMonth.addEventListener('endDateChange.coreui.calendar', event => {
      // eslint-disable-next-line no-console
      console.log(event.date)
    })
  }

  const myCalendarYear = document.getElementById('myCalendarYear')
  if (myCalendarYear) {
    new coreui.Calendar(myCalendarYear)

    myCalendarYear.addEventListener('startDateChange.coreui.calendar', event => {
      // eslint-disable-next-line no-console
      console.log(event.date)
    })

    myCalendarYear.addEventListener('endDateChange.coreui.calendar', event => {
      // eslint-disable-next-line no-console
      console.log(event.date)
    })
  }

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
  }
  // js-docs-end date-range-picker-custom-ranges

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
})()

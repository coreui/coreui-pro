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
  'use strict'

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
})()

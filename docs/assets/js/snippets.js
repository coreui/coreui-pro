// NOTICE!!! Initially embedded in our docs this JavaScript
// file contains elements that can help you create reproducible
// use cases in StackBlitz for instance.
// In a real project please adapt this content to your needs.
// ++++++++++++++++++++++++++++++++++++++++++

/*!
 * JavaScript for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2022 The Bootstrap Authors
 * Copyright 2011-2022 Twitter, Inc.
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 * For details, see https://creativecommons.org/licenses/by/3.0/.
 */

/* global coreui: false */

(() => {
  'use strict'

  // --------
  // Tooltips
  // --------
  // Instanciate all tooltips in a docs or StackBlitz page
  document.querySelectorAll('[data-coreui-toggle="tooltip"]')
    .forEach(tooltip => {
      new coreui.Tooltip(tooltip)
    })

  // --------
  // Popovers
  // --------
  // Instanciate all popovers in a docs or StackBlitz page
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

  // Instanciate all toasts in a docs page only
  document.querySelectorAll('.docs-example .toast')
    .forEach(toastNode => {
      const toast = new coreui.Toast(toastNode, {
        autohide: false
      })

      toast.show()
    })

  // Instanciate all toasts in a docs page only
  const toastTrigger = document.getElementById('liveToastBtn')
  const toastLiveExample = document.getElementById('liveToast')
  if (toastTrigger) {
    toastTrigger.addEventListener('click', () => {
      const toast = new coreui.Toast(toastLiveExample)

      toast.show()
    })
  }

  // -------------------------------
  // Alerts
  // -------------------------------
  // Used in 'Show live toast' example in docs or StackBlitz
  const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
  const alertTrigger = document.getElementById('liveAlertBtn')

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

  if (alertTrigger) {
    alertTrigger.addEventListener('click', () => {
      appendAlert('Nice, you triggered this alert message!', 'success')
    })
  }

  // -------------------------------
  // Checks & Radios
  // -------------------------------
  // Indeterminate checkbox example in docs and StackBlitz
  document.querySelectorAll('.docs-example-indeterminate [type="checkbox"]')
    .forEach(checkbox => {
      checkbox.indeterminate = true
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
  const exampleModal = document.getElementById('exampleModal')
  if (exampleModal) {
    exampleModal.addEventListener('show.coreui.modal', event => {
      // Button that triggered the modal
      const button = event.relatedTarget
      // Extract info from data-coreui-* attributes
      const recipient = button.getAttribute('data-coreui-whatever')

      // Update the modal's content.
      const modalTitle = exampleModal.querySelector('.modal-title')
      const modalBodyInput = exampleModal.querySelector('.modal-body input')

      modalTitle.textContent = `New message to ${recipient}`
      modalBodyInput.value = recipient
    })
  }

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
  // Loading Buttons
  // -------------------------------
  // 'Loading Buttons components' example in docs only
  const myLoadingButton = document.querySelectorAll('.docs-example .btn-loading')
  if (myLoadingButton) {
    myLoadingButton.forEach(button => {
      new coreui.LoadingButton(button)
      button.addEventListener('click', event => {
        const myBtn = coreui.LoadingButton.getInstance(event.target)
        myBtn.start()
      })
    })
  }

  // -------------------------------
  // Multi Selects
  // -------------------------------
  // 'Multi Selects components' example in docs only
  const myMultiSelect = document.getElementById('multiSelect')

  if (myMultiSelect) {
    const cuiMultiSelect = new coreui.MultiSelect(myMultiSelect, {
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
    cuiMultiSelect.update({
      options: [
        {
          value: 0,
          text: 'Angular2'
        },
        {
          value: 1,
          text: 'Bootstrap2',
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
      ]
    })
  }

  // -------------------------------
  // Date Pickers
  // -------------------------------
  // 'Date Pickers components' example in docs only

  if (document.getElementById('myDatePickerDisabledDates')) {
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
    // eslint-disable-next-line no-unused-vars
    const myDatePickerDisabledDates = new coreui.DatePicker(document.getElementById('myDatePickerDisabledDates'), optionsDatePickerDisabledDates)
  }

  // -------------------------------
  // Date Range Pickers
  // -------------------------------
  // 'Date Range Pickers components' example in docs only

  if (document.getElementById('myDateRangePickerDisabledDates')) {
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
    // eslint-disable-next-line no-unused-vars
    const myDateRangePickerDisabledDates = new coreui.DateRangePicker(document.getElementById('myDateRangePickerDisabledDates'), optionsDateRangePickerDisabledDates)
  }

  if (document.getElementById('myDateRangePickerCustomRanges')) {
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
    // eslint-disable-next-line no-unused-vars
    const myDateRangePickerCustomRanges = new coreui.DateRangePicker(document.getElementById('myDateRangePickerCustomRanges'), optionsCustomRanges)
  }
})()

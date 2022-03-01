// NOTICE!! DO NOT USE ANY OF THIS JAVASCRIPT
// IT'S ALL JUST JUNK FOR OUR DOCS!
// ++++++++++++++++++++++++++++++++++++++++++

/*!
 * JavaScript for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2021 The Bootstrap Authors
 * Copyright 2011-2021 Twitter, Inc.
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 * For details, see https://creativecommons.org/licenses/by/3.0/.
 */

/* global ClipboardJS: false, anchors: false, coreui: false */

(function () {
  'use strict'

  // Tooltip and popover demos
  document.querySelectorAll('.tooltip-demo')
    .forEach(function (tooltip) {
      new coreui.Tooltip(tooltip, {
        selector: '[data-coreui-toggle="tooltip"]'
      })
    })

  document.querySelectorAll('[data-coreui-toggle="popover"]')
    .forEach(function (popover) {
      new coreui.Popover(popover)
    })

  var toastPlacement = document.getElementById('toastPlacement')
  if (toastPlacement) {
    document.getElementById('selectToastPlacement').addEventListener('change', function () {
      if (!toastPlacement.dataset.originalClass) {
        toastPlacement.dataset.originalClass = toastPlacement.className
      }

      toastPlacement.className = toastPlacement.dataset.originalClass + ' ' + this.value
    })
  }

  document.querySelectorAll('.docs-example .toast')
    .forEach(function (toastNode) {
      var toast = new coreui.Toast(toastNode, {
        autohide: false
      })

      toast.show()
    })

  var toastTrigger = document.getElementById('liveToastBtn')
  var toastLiveExample = document.getElementById('liveToast')
  if (toastTrigger) {
    toastTrigger.addEventListener('click', function () {
      var toast = new coreui.Toast(toastLiveExample)

      toast.show()
    })
  }

  var alertPlaceholder = document.getElementById('liveAlertPlaceholder')
  var alertTrigger = document.getElementById('liveAlertBtn')

  function alert(message, type) {
    var wrapper = document.createElement('div')
    wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-coreui-dismiss="alert" aria-label="Close"></button></div>'

    alertPlaceholder.append(wrapper)
  }

  if (alertTrigger) {
    alertTrigger.addEventListener('click', function () {
      alert('Nice, you triggered this alert message!', 'success')
    })
  }

  // Demos within modals
  document.querySelectorAll('.tooltip-test')
    .forEach(function (tooltip) {
      new coreui.Tooltip(tooltip)
    })

  document.querySelectorAll('.popover-test')
    .forEach(function (popover) {
      new coreui.Popover(popover)
    })

  // Indeterminate checkbox example
  document.querySelectorAll('.docs-example-indeterminate [type="checkbox"]')
    .forEach(function (checkbox) {
      checkbox.indeterminate = true
    })

  // Disable empty links in docs examples
  document.querySelectorAll('.docs-content [href="#"]')
    .forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault()
      })
    })

  // Modal relatedTarget demo
  var exampleModal = document.getElementById('exampleModal')
  if (exampleModal) {
    exampleModal.addEventListener('show.coreui.modal', function (event) {
      // Button that triggered the modal
      var button = event.relatedTarget
      // Extract info from data-coreui-* attributes
      var recipient = button.getAttribute('data-coreui-whatever')

      // Update the modal's content.
      var modalTitle = exampleModal.querySelector('.modal-title')
      var modalBodyInput = exampleModal.querySelector('.modal-body input')

      modalTitle.textContent = 'New message to ' + recipient
      modalBodyInput.value = recipient
    })
  }

  document.querySelectorAll('.btn-loading')
  .forEach(function (button) {
    new coreui.LoadingButton(button)
    button.addEventListener('click', function (event) {
      var myBtn = coreui.LoadingButton.getInstance(event.target)
      myBtn.start()
    })
  })

  var myMultiSelect = document.getElementById('multiSelect')

  if (myMultiSelect) {
    var cuiMultiSelect = new coreui.MultiSelect(myMultiSelect, {
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

  if (document.getElementById('myDateRangePickerDisabledDates')) {
    var optionsDateRangePickerDisabledDates = {
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
    var myDateRangePickerDisabledDates = new coreui.DateRangePicker(document.getElementById('myDateRangePickerDisabledDates'), optionsDateRangePickerDisabledDates)
  }

  if (document.getElementById('myDatePickerDisabledDates')) {
    var optionsDatePickerDisabledDates = {
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
    var myDatePickerDisabledDates = new coreui.DatePicker(document.getElementById('myDatePickerDisabledDates'), optionsDatePickerDisabledDates)
  }

  if (document.getElementById('myDateRangePickerCustomRanges')) {
    var optionsCustomRanges = {
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
    var myDateRangePickerCustomRanges = new coreui.DateRangePicker(document.getElementById('myDateRangePickerCustomRanges'), optionsCustomRanges)
  }

  // Insert copy to clipboard button before .highlight
  var btnHtml = '<div class="docs-clipboard"><button type="button" class="btn-clipboard btn btn-ghost-primary" title="Copy to clipboard"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><polygon fill="var(--ci-primary-color, currentColor)" points="408 432 376 432 376 464 112 464 112 136 144 136 144 104 80 104 80 496 408 496 408 432" class="ci-primary"/><path fill="var(--ci-primary-color, currentColor)" d="M176,16V400H496V153.373L358.627,16ZM464,368H208V48H312V200H464Zm0-200H344V48h1.372L464,166.627Z" class="ci-primary"/></svg></button></div>'
  document.querySelectorAll('div.highlight')
    .forEach(function (element) {
      element.insertAdjacentHTML('beforebegin', btnHtml)
    })

  document.querySelectorAll('.btn-clipboard')
    .forEach(function (btn) {
      var tooltipBtn = new coreui.Tooltip(btn)

      btn.addEventListener('mouseleave', function () {
        // Explicitly hide tooltip, since after clicking it remains
        // focused (as it's a button), so tooltip would otherwise
        // remain visible until focus is moved away
        tooltipBtn.hide()
      })
    })

  var clipboard = new ClipboardJS('.btn-clipboard', {
    target: function (trigger) {
      return trigger.parentNode.nextElementSibling
    }
  })

  clipboard.on('success', function (e) {
    var tooltipBtn = coreui.Tooltip.getInstance(e.trigger)

    e.trigger.setAttribute('data-coreui-original-title', 'Copied!')
    tooltipBtn.show()

    e.trigger.setAttribute('data-coreui-original-title', 'Copy to clipboard')
    e.clearSelection()
  })

  clipboard.on('error', function (event) {
    var modifierKey = /mac/i.test(navigator.userAgent) ? '\u2318' : 'Ctrl-'
    var fallbackMsg = 'Press ' + modifierKey + 'C to copy'
    var tooltipBtn = coreui.Tooltip.getInstance(event.trigger)

    event.trigger.setAttribute('data-coreui-original-title', fallbackMsg)
    tooltipBtn.show()

    event.trigger.setAttribute('data-coreui-original-title', 'Copy to clipboard')
  })

  anchors.options = {
    icon: '#'
  }
  anchors.add('.docs-content > h2, .docs-content > h3, .docs-content > h4, .docs-content > h5')
})()

/* global coreui: false */

// js-docs-start multi-select-selection-limit
const getMultiSelectSelectionLimitToastContainer = () => {
  let container = document.getElementById('multiSelectSelectionLimitToastContainer')

  if (!container) {
    container = document.createElement('div')
    container.id = 'multiSelectSelectionLimitToastContainer'
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3'
    container.setAttribute('aria-live', 'polite')
    container.setAttribute('aria-atomic', 'true')
    document.body.append(container)
  }

  return container
}

const showMultiSelectSelectionLimitToast = message => {
  const toast = document.createElement('div')
  toast.classList.add('toast')
  toast.setAttribute('role', 'alert')
  toast.setAttribute('aria-live', 'assertive')
  toast.setAttribute('aria-atomic', 'true')
  toast.innerHTML = [
    '<div class="toast-header">',
    '  <strong class="me-auto">Selection limit</strong>',
    '  <button type="button" class="btn-close" data-coreui-dismiss="toast" aria-label="Close"></button>',
    '</div>',
    `<div class="toast-body">${message}</div>`
  ].join('')

  getMultiSelectSelectionLimitToastContainer().append(toast)

  toast.addEventListener('hidden.coreui.toast', () => {
    toast.remove()
  })

  coreui.Toast.getOrCreateInstance(toast).show()
}

document.addEventListener('selectionLimit.coreui.multi-select', event => {
  if (event.target.id !== 'multiSelectSelectionLimit') {
    return
  }

  showMultiSelectSelectionLimitToast(`You can select up to ${event.selectionLimit} options.`)
})
// js-docs-end multi-select-selection-limit

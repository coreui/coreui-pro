/* global coreui: false */

// js-docs-start multi-select-header
const myMultiSelectHeader = document.getElementById('myMultiSelectHeader')

new coreui.MultiSelect(myMultiSelectHeader, {
  multiple: true,
  options: [
    { value: 'angular', text: 'Angular' },
    { value: 'bootstrap', text: 'Bootstrap' },
    { value: 'react', text: 'React.js' },
    { value: 'vue', text: 'Vue.js' },
    { value: 'django', text: 'Django' },
    { value: 'laravel', text: 'Laravel' },
    { value: 'node', text: 'Node.js' }
  ],
  placeholder: 'Select frameworks',
  search: true,
  selectionType: 'tags',
  headerTemplate(state, actions) {
    const wrapper = document.createElement('div')
    wrapper.className = 'd-flex flex-wrap gap-2'

    const selectAll = document.createElement('button')
    selectAll.type = 'button'
    selectAll.className = 'btn btn-sm btn-primary'
    selectAll.textContent = `Select all (${state.total})`
    selectAll.disabled = state.selected >= state.total
    selectAll.addEventListener('click', () => actions.selectAll())

    const selectVisible = document.createElement('button')
    selectVisible.type = 'button'
    selectVisible.className = 'btn btn-sm btn-secondary'
    selectVisible.textContent = `Select visible (${state.visible})`
    selectVisible.disabled = state.visible === state.visibleSelected
    selectVisible.addEventListener('click', () => actions.selectVisible())

    const deselectVisible = document.createElement('button')
    deselectVisible.type = 'button'
    deselectVisible.className = 'btn btn-sm btn-outline-secondary'
    deselectVisible.textContent = `Deselect visible (${state.visibleSelected})`
    deselectVisible.disabled = state.visibleSelected === 0
    deselectVisible.addEventListener('click', () => actions.deselectVisible())

    const deselectAll = document.createElement('button')
    deselectAll.type = 'button'
    deselectAll.className = 'btn btn-sm btn-outline-danger'
    deselectAll.textContent = `Deselect all (${state.selected})`
    deselectAll.disabled = state.selected === 0
    deselectAll.addEventListener('click', () => actions.deselectAll())

    wrapper.append(selectAll, selectVisible, deselectVisible, deselectAll)
    return wrapper
  }
})
// js-docs-end multi-select-header

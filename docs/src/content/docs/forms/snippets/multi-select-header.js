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

    const selectFiltered = document.createElement('button')
    selectFiltered.type = 'button'
    selectFiltered.className = 'btn btn-sm btn-secondary'
    selectFiltered.textContent = `Select filtered (${state.filtered})`
    selectFiltered.disabled = state.filtered === state.filteredSelected
    selectFiltered.addEventListener('click', () => actions.selectFiltered())

    const deselectFiltered = document.createElement('button')
    deselectFiltered.type = 'button'
    deselectFiltered.className = 'btn btn-sm btn-outline-secondary'
    deselectFiltered.textContent = `Deselect filtered (${state.filteredSelected})`
    deselectFiltered.disabled = state.filteredSelected === 0
    deselectFiltered.addEventListener('click', () => actions.deselectFiltered())

    const deselectAll = document.createElement('button')
    deselectAll.type = 'button'
    deselectAll.className = 'btn btn-sm btn-outline-danger'
    deselectAll.textContent = `Deselect all (${state.selected})`
    deselectAll.disabled = state.selected === 0
    deselectAll.addEventListener('click', () => actions.deselectAll())

    wrapper.append(selectAll, selectFiltered, deselectFiltered, deselectAll)
    return wrapper
  }
})

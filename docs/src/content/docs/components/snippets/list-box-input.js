const field = document.getElementById('listBoxField')
const element = document.getElementById('listBoxWithInput')
const listBox = coreui.ListBox.getOrCreateInstance(element, { activeDescendant: field })
const output = document.getElementById('listBoxFieldOutput')

field.addEventListener('input', () => {
  listBox.filter(field.value)
})

element.addEventListener('change.coreui.list-box', event => {
  output.textContent = event.selected.join(', ') || 'nothing'
})

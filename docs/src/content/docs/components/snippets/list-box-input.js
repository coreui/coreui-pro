const field = document.getElementById('listBoxField')
const element = document.getElementById('listBoxWithInput')
const listBox = coreui.ListBox.getOrCreateInstance(element, { activeDescendant: field })
const output = document.getElementById('listBoxFieldOutput')

field.addEventListener('input', () => {
  const query = field.value.trim().toLowerCase()

  for (const option of element.querySelectorAll('.list-box-option')) {
    option.toggleAttribute('hidden', !option.textContent.toLowerCase().includes(query))
  }

  listBox.update()
})

element.addEventListener('change.coreui.list-box', event => {
  output.textContent = event.selected.join(', ') || 'nothing'
})

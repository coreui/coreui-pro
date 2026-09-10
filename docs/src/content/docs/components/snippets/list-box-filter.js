const field = document.getElementById('listBoxOwnField')
const element = document.getElementById('listBoxOwnFieldList')
const listBox = coreui.ListBox.getOrCreateInstance(element, {
  indicator: 'checkbox',
  selectionMode: 'multiple'
})

field.addEventListener('input', () => {
  listBox.filter(field.value)
})

document.getElementById('listBoxOwnFieldReset').addEventListener('click', () => {
  field.value = ''
  listBox.filter(null)
})

const element = document.getElementById('listBoxCheckboxes')
const counter = document.getElementById('listBoxCounter')
const total = element.querySelectorAll('.list-box-option').length

element.addEventListener('change.coreui.list-box', event => {
  counter.textContent = `${event.selected.length}/${total} selected`
})

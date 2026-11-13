const table = document.getElementById('contextMenuTable')
const header = document.querySelector('#contextMenuTableMenu .menu-header')

const pickRow = event => {
  const row = event.target.closest('tbody tr')
  if (row) {
    header.textContent = row.dataset.name
  }
}

table.addEventListener('focusin', pickRow)
table.addEventListener('contextmenu', pickRow)

table.addEventListener('show.coreui.context-menu', event => {
  if (event.contextmenuEvent && !event.contextmenuEvent.target.closest('tbody tr')) {
    event.preventDefault()
  }
})

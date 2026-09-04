const table = document.getElementById('contextMenuTable')
const header = document.querySelector('#contextMenuTableMenu .menu-header')

table.addEventListener('show.coreui.context-menu', event => {
  const row = event.contextmenuEvent?.target.closest('tbody tr')
  if (!row) {
    event.preventDefault()
    return
  }

  header.textContent = row.dataset.name
})

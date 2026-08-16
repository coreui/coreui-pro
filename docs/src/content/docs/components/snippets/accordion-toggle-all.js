const expandBtn = document.getElementById('accordionExpandAll')
const collapseBtn = document.getElementById('accordionCollapseAll')

if (expandBtn && collapseBtn) {
  const accordion = coreui.Accordion.getOrCreateInstance('#accordionToggleAll')

  expandBtn.addEventListener('click', () => {
    accordion.showAll()
  })

  collapseBtn.addEventListener('click', () => {
    accordion.hideAll()
  })
}

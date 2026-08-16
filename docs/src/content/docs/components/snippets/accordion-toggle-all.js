const expandBtn = document.getElementById('accordionExpandAll')
const collapseBtn = document.getElementById('accordionCollapseAll')

if (expandBtn && collapseBtn) {
  expandBtn.addEventListener('click', () => {
    coreui.Accordion.showAll('#accordionToggleAll')
  })

  collapseBtn.addEventListener('click', () => {
    coreui.Accordion.hideAll('#accordionToggleAll')
  })
}

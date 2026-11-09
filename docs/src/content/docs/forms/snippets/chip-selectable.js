const chipSelectableElement = document.querySelector('#chipSelectable')
const chipSelectableOutput = document.querySelector('#chipSelectableOutput')

const chipSelectable = new coreui.ChipFilter(chipSelectableElement)

const updateSelectedOutput = selected => {
  chipSelectableOutput.textContent = selected.length > 0 ? selected.join(', ') : 'None'
}

chipSelectableElement.addEventListener('change.coreui.chip-filter', event => {
  updateSelectedOutput(event.value)
})

updateSelectedOutput(chipSelectable.getSelectedValues())

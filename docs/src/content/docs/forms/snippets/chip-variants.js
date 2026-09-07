const chipInputElement = document.querySelector('#chipVariants')
const chipInput = new coreui.ChipInput(chipInputElement, {
  // Class is resolved dynamically from chip value.
  chipClassName(value) {
    const variants = {
      approved: 'theme-success',
      blocking: 'theme-danger',
      feature: 'theme-primary',
      'needs review': 'theme-warning'
    }

    return variants[value.trim().toLowerCase()] || 'theme-secondary'
  },
  placeholder: 'Add a bug...'
})

chipInput.add('Feature')

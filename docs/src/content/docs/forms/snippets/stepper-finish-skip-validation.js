const skipValidationStepperEl = document.getElementById('skipValidationStepper')
const skipValidationStepperMessage = document.getElementById('skipValidationStepperMessage')

skipValidationStepperEl.addEventListener('finish.coreui.stepper', () => {
  skipValidationStepperMessage.hidden = false
  skipValidationStepperMessage.querySelector('p').focus()
})

skipValidationStepperEl.addEventListener('reset.coreui.stepper', () => {
  skipValidationStepperMessage.hidden = true
})

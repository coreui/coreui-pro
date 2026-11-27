const validationStepperEl = document.getElementById('validationStepper')
const validationStepperMessage = document.getElementById('validationStepperMessage')

validationStepperEl.addEventListener('finish.coreui.stepper', () => {
  validationStepperMessage.hidden = false
  validationStepperMessage.querySelector('p').focus()
})

validationStepperEl.addEventListener('reset.coreui.stepper', () => {
  validationStepperMessage.hidden = true
})

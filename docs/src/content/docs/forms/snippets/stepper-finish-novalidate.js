const novalidateStepperEl = document.getElementById('novalidateStepper')
const novalidateStepperMessage = document.getElementById('novalidateStepperMessage')

novalidateStepperEl.addEventListener('finish.coreui.stepper', () => {
  novalidateStepperMessage.hidden = false
  novalidateStepperMessage.querySelector('p').focus()
})

novalidateStepperEl.addEventListener('reset.coreui.stepper', () => {
  novalidateStepperMessage.hidden = true
})

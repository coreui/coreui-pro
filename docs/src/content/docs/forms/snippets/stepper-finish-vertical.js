const myStepperVerticalEl = document.getElementById('myStepperVertical')
const myStepperVerticalMessage = document.getElementById('myStepperVerticalMessage')

myStepperVerticalEl.addEventListener('finish.coreui.stepper', () => {
  myStepperVerticalMessage.hidden = false
  myStepperVerticalMessage.querySelector('p').focus()
})

myStepperVerticalEl.addEventListener('reset.coreui.stepper', () => {
  myStepperVerticalMessage.hidden = true
})

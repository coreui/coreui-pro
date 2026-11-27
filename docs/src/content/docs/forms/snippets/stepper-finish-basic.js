const myStepperEl = document.getElementById('myStepper')
const myStepperMessage = document.getElementById('myStepperMessage')

myStepperEl.addEventListener('finish.coreui.stepper', () => {
  myStepperMessage.hidden = false
  myStepperMessage.querySelector('p').focus()
})

myStepperEl.addEventListener('reset.coreui.stepper', () => {
  myStepperMessage.hidden = true
})

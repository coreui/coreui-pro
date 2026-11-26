const myStepperFinish = document.getElementById('myStepperFinish')
const myStepperFinishMessage = document.getElementById('myStepperFinishMessage')

myStepperFinish.addEventListener('finish.coreui.stepper', () => {
  myStepperFinishMessage.hidden = false
  myStepperFinishMessage.querySelector('p').focus()
})

myStepperFinish.addEventListener('reset.coreui.stepper', () => {
  myStepperFinishMessage.hidden = true
})

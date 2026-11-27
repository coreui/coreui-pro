const myStepperActions = document.getElementById('myStepperActions')
const myStepperActionsMessage = document.getElementById('myStepperActionsMessage')

myStepperActions.addEventListener('stepChanged.coreui.stepper', event => {
  const label = myStepperActions.querySelectorAll('.stepper-step-label')[event.index - 1]

  queueMicrotask(() => {
    if (!document.activeElement.closest('.stepper-steps')) {
      coreui.announce(label.textContent)
    }
  })
})

myStepperActions.addEventListener('finish.coreui.stepper', () => {
  myStepperActionsMessage.hidden = false
  myStepperActionsMessage.querySelector('p').focus()
})

myStepperActions.addEventListener('reset.coreui.stepper', () => {
  myStepperActionsMessage.hidden = true
})

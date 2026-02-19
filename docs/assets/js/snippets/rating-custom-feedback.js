/* global coreui: false */

// js-docs-start rating-custom-feedback
const myRatingCustomFeedback = document.getElementById('myRatingCustomFeedback')
const myRatingCustomFeedbackStart = document.getElementById('myRatingCustomFeedbackStart')
const myRatingCustomFeedbackEnd = document.getElementById('myRatingCustomFeedbackEnd')

let currentValue = 3
const labels = {
  1: 'Very bad',
  2: 'Bad',
  3: 'Meh',
  4: 'Good',
  5: 'Very good'
}
const optionsCustomFeedback = {
  value: currentValue
}

new coreui.Rating(myRatingCustomFeedback, optionsCustomFeedback)

myRatingCustomFeedback.addEventListener('change.coreui.rating', event => {
  currentValue = event.value
  myRatingCustomFeedbackStart.innerHTML = `${event.value} / 5`
  myRatingCustomFeedbackEnd.innerHTML = labels[event.value]
})

myRatingCustomFeedback.addEventListener('hover.coreui.rating', event => {
  myRatingCustomFeedbackEnd.innerHTML = event.value ? labels[event.value] : labels[currentValue]
})
// js-docs-end rating-custom-feedback

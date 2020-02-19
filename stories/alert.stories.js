import './../dist/css/coreui.css'
import variants from './variants'
// import { withKnobs, select } from '@storybook/addon-knobs'

export default {
  title: 'Alerts',
  // decorators: [withKnobs]
}

export const Default = () => {
  const alerts = document.createElement('div')
  Object.keys(variants).forEach(key => {
    const alert = document.createElement('div')
    alert.classList.add('alert')
    alert.classList.add(`alert-${variants[key]}`)
    alert.innerText = `A simple ${key} alert—check it out!`

    alerts.appendChild(alert)
  })

  return alerts
}

export const linkColor = () => {
  const alerts = document.createElement('div')
  Object.keys(variants).forEach(key => {
    const alert = document.createElement('div')
    alert.classList.add('alert')
    alert.classList.add(`alert-${variants[key]}`)
    alert.innerHTML = `A simple primary alert with <a href="#" class="alert-link">an example link</a>. Give it a click if you like.`

    alerts.appendChild(alert)
  })

  return alerts
}

export const additionalContent = () => {
  const alerts = document.createElement('div')
  Object.keys(variants).forEach(key => {
    const alert = document.createElement('div')
    alert.classList.add('alert')
    alert.classList.add(`alert-${variants[key]}`)
    alert.innerHTML = `
      <h4 class="alert-heading">Well done!</h4>
      <p>Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.</p>
      <hr>
      <p class="mb-0">Whenever you need to, be sure to use margin utilities to keep things nice and tidy.</p>`

    alerts.appendChild(alert)
  })

  return alerts
}

// const variant = select('Variant', variants, 'primary')
// export const Default = () => {
//   const alert = document.createElement('div')
//   alert.classList.add('alert')
//   alert.classList.add(`alert-${variant}`)
//   alert.innerText = `A simple ${variant} alert—check it out!`
//   return alert
// }

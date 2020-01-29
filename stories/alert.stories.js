import './../dist/css/coreui.css'
import { withKnobs, select } from '@storybook/addon-knobs'

export default {
  title: 'Alerts',
  decorators: [withKnobs]
};

export const Default = () => {
  const variant = select('Variant', {
    Primary: 'primary',
    Secondary: 'secondary',
    Success: 'success',
    Info: 'info',
    Danger: 'danger',
    Warning: 'warning'
  }, 'primary')
  const alert = document.createElement('div')
  alert.classList.add('alert')
  alert.classList.add(`alert-${variant}`)
  alert.innerText = `A simple ${variant} alert—check it out!`
  return alert
}

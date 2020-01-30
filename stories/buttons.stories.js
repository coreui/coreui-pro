import './../dist/css/coreui.css'
import brands from './brands'
import variants from './variants'
import { withKnobs, select } from '@storybook/addon-knobs'

export default {
  title: 'Buttons',
  decorators: [withKnobs]
}

export const Default = () => {
  const wrapper = document.createElement('div')
  Object.keys(variants).forEach(key => {
    const button = document.createElement('btn')
    button.classList.add('btn', `btn-${variants[key]}`, 'mr-2')
    button.innerText = key

    wrapper.appendChild(button)
  })

  return wrapper
}

export const withWebfontIcons = () => {
  const wrapper = document.createElement('div')
  Object.keys(variants).forEach(key => {
    const button = document.createElement('btn')
    button.classList.add('btn', `btn-${variants[key]}`, 'mr-2')
    button.innerHTML = `<span class="cil-contrast c-icon mr-2"></span> ${key}`

    wrapper.appendChild(button)
  })

  return wrapper
}

export const withSVGIcons = () => {
  const wrapper = document.createElement('div')
  Object.keys(variants).forEach(key => {
    const button = document.createElement('btn')
    button.classList.add('btn', `btn-${variants[key]}`, 'mr-2')
    button.innerHTML = `<svg class="c-icon mr-2"><use xlink:href="https://unpkg.com/@coreui/icons@1.0.0/sprites/free.svg#cil-airplane-mode"></use></svg> ${key}`

    wrapper.appendChild(button)
  })

  return wrapper
}

export const BrandButtons = () => {
  const wrapper = document.createElement('div')
  Object.keys(brands).forEach(key => {
    const button = document.createElement('btn')
    button.classList.add('btn', `btn-${brands[key]}`, 'mr-2')
    button.innerHTML = `<span class="cib-${brands[key]} c-icon mr-2"></span> ${key}`

    wrapper.appendChild(button)
  })
  return wrapper
}

export const pillButtons = () => {
  const wrapper = document.createElement('div')
  Object.keys(variants).forEach(key => {
    const button = document.createElement('btn')
    button.classList.add('btn', 'btn-pill', `btn-${variants[key]}`, 'mr-2')
    button.innerText = key

    wrapper.appendChild(button)
  })

  return wrapper
}

export const squareButtons = () => {
  const wrapper = document.createElement('div')
  Object.keys(variants).forEach(key => {
    const button = document.createElement('btn')
    button.classList.add('btn', 'btn-square', `btn-${variants[key]}`, 'mr-2')
    button.innerText = key

    wrapper.appendChild(button)
  })

  return wrapper
}

export const outlineButtons = () => {
  const wrapper = document.createElement('div')
  Object.keys(variants).forEach(key => {
    const button = document.createElement('btn')
    button.classList.add('btn', `btn-outline-${variants[key]}`, 'mr-2')
    button.innerText = key

    wrapper.appendChild(button)
  })

  return wrapper
}

export const ghost = () => {
  const wrapper = document.createElement('div')
  Object.keys(variants).forEach(key => {
    const button = document.createElement('btn')
    button.classList.add('btn', `btn-ghost-${variants[key]}`, 'mr-2')
    button.innerText = key

    wrapper.appendChild(button)
  })

  return wrapper
}

export const size = () => `
  <button type="button" class="btn btn-primary btn-lg">Large button</button>
  <button type="button" class="btn btn-secondary btn-lg">Large button</button>
  <div class="mb-4"></div>
  <button type="button" class="btn btn-primary">Normal button</button>
  <button type="button" class="btn btn-secondary">Normal button</button>
  <div class="mb-4"></div>
  <button type="button" class="btn btn-primary btn-sm">Small button</button>
  <button type="button" class="btn btn-secondary btn-sm">Small button</button>
`

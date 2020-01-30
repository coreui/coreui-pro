import './../dist/css/coreui.css'
import variants from './variants'

export default {
  title: 'Badge'
}

export const Default = () => `
<h1>Example heading <span class="badge bg-secondary">New</span></h1>
<h2>Example heading <span class="badge bg-secondary">New</span></h2>
<h3>Example heading <span class="badge bg-secondary">New</span></h3>
<h4>Example heading <span class="badge bg-secondary">New</span></h4>
<h5>Example heading <span class="badge bg-secondary">New</span></h5>
<h6>Example heading <span class="badge bg-secondary">New</span></h6>
<br/><br/><br/>
<button type="button" class="btn btn-primary">
  Notifications <span class="badge badge-light">4</span>
</button>
<br/><br/><br/>
<button type="button" class="btn btn-primary">
  Profile <span class="badge badge-light">9</span>
  <span class="sr-only">unread messages</span>
</button>
`

export const contextualVariations = () => {
  const wrapper = document.createElement('div')

  Object.keys(variants).forEach(key => {
    const badge = document.createElement('span')
    badge.classList.add('badge', `badge-${variants[key]}`, 'mr-2')
    badge.innerText = `${key}`
    wrapper.appendChild(badge)
  })

  return wrapper
}

export const pillBadges = () => {
  const wrapper = document.createElement('div')

  Object.keys(variants).forEach(key => {
    const badge = document.createElement('span')
    badge.classList.add('badge', 'badge-pill', `badge-${variants[key]}`, 'mr-2')
    badge.innerText = `${key}`
    wrapper.appendChild(badge)
  })

  return wrapper
}

export const links = () => {
  const wrapper = document.createElement('div')

  Object.keys(variants).forEach(key => {
    const badge = document.createElement('a')
    badge.href = '#'
    badge.classList.add('badge', `badge-${variants[key]}`, 'mr-2')
    badge.innerText = `${key}`
    wrapper.appendChild(badge)
  })

  return wrapper
}

import './../dist/css/coreui.css'
import variants from './variants'
import defaultAvatar from './static/avatar.jpg'

export default {
  title: 'Avatar'
}

const sizes = ['sm', '', 'lg', 'xl']

export const Default = () => {
  const wrapper = document.createElement('div')
  Object.keys(variants).forEach(key => {
    const avatar = document.createElement('div')
    avatar.classList.add('c-avatar', 'mr-2')
    const avatarImg = document.createElement('img')
    avatarImg.classList.add('c-avatar-img')
    avatarImg.src = defaultAvatar
    avatarImg.alt = 'Avatar'
    const avatarStatus = document.createElement('span')
    avatarStatus.classList.add('c-avatar-status', `bg-${variants[key]}`)
    avatar.appendChild(avatarImg)
    avatar.appendChild(avatarStatus)
    wrapper.appendChild(avatar)
  })

  return wrapper
}

export const Text = () => {
  const wrapper = document.createElement('div')
  Object.keys(variants).forEach(key => {
    const avatar = document.createElement('div')
    avatar.classList.add('c-avatar', `bg-${variants[key]}`, 'mr-2')
    const avatarImg = document.createElement('span')
    avatarImg.classList.add('text-white')
    avatarImg.innerText = 'UI'
    const avatarStatus = document.createElement('span')
    avatarStatus.classList.add('c-avatar-status', `bg-${variants[key]}`)
    avatar.appendChild(avatarImg)
    avatar.appendChild(avatarStatus)
    wrapper.appendChild(avatar)
  })

  return wrapper
}

export const Sizes = () => {
  const wrapper = document.createElement('div')
  sizes.forEach(size => {
    const avatar = document.createElement('div')
    avatar.classList.add('c-avatar', `c-avatar-${size}`, 'bg-primary', 'mr-2')
    const avatarImg = document.createElement('span')
    avatarImg.classList.add('text-white')
    avatarImg.innerText = 'UI'
    const avatarStatus = document.createElement('span')
    avatarStatus.classList.add('c-avatar-status', 'bg-success')
    avatar.appendChild(avatarImg)
    avatar.appendChild(avatarStatus)
    wrapper.appendChild(avatar)
  })

  return wrapper
}

/*!
 * A menu in a navbar is placed by the navbar stylesheet: in the flow of a collapsed navbar,
 * under its toggle in an expanded one.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Menu from '../../src/menu.js'

let container
let instance

const mountNavbar = (width, content) => {
  container = document.createElement('div')
  container.style.width = `${width}px`
  container.innerHTML = `<nav class="navbar navbar-expand-sm">
      <div class="container-fluid">
        <div class="collapse navbar-collapse show">${content}</div>
      </div>
    </nav>`
  document.body.append(container)
  instance = Menu.getOrCreateInstance(container.querySelector('#toggle'))
  return {
    toggle: container.querySelector('#toggle'),
    menu: container.querySelector('#menu'),
    after: container.querySelector('#after')
  }
}

const mount = (width, placement = 'bottom-start', items = '<a class="menu-item" href="#">Action</a><a class="menu-item" href="#">Another action here</a>') => mountNavbar(width, `<ul class="navbar-nav">
      <li class="nav-item"><a class="nav-link" href="#">Home</a></li>
      <li class="nav-item">
        <button class="nav-link" type="button" data-coreui-toggle="menu" data-coreui-placement="${placement}" id="toggle">Menu toggle</button>
        <div class="menu" id="menu">${items}</div>
      </li>
      <li class="nav-item"><a class="nav-link" href="#" id="after">After</a></li>
    </ul>`)

const rect = element => element.getBoundingClientRect()

const open = async () => {
  await instance.show()
  await new Promise(resolve => {
    setTimeout(resolve, 50)
  })
}

afterEach(() => {
  instance?.dispose()
  container?.remove()
  instance = null
})

describe('menu in a navbar', () => {
  it('should push the next items down in a collapsed navbar', async () => {
    const { menu, after } = mount(400)
    const before = rect(after).top

    await open()

    expect(getComputedStyle(menu).position).toBe('static')
    expect(rect(after).top - before).toBeCloseTo(rect(menu).height + 2, 0)
  })

  it('should open under its toggle in an expanded navbar', async () => {
    const { toggle, menu, after } = mount(900)
    const before = rect(after).top

    await open()

    expect(getComputedStyle(menu).position).toBe('absolute')
    expect(rect(menu).top - rect(toggle).bottom).toBeCloseTo(2, 0)
    expect(rect(menu).left).toBeCloseTo(rect(toggle).left, 0)
    expect(rect(after).top).toBe(before)
  })

  it('should align the menu with the end of its toggle for an end placement', async () => {
    const { toggle, menu } = mount(900, 'bottom-end')

    await open()

    expect(rect(menu).right).toBeCloseTo(rect(toggle).right, 0)
  })

  it('should open above its toggle for a top placement', async () => {
    const { toggle, menu } = mount(900, 'top-start')

    await open()

    expect(rect(toggle).top - rect(menu).bottom).toBeCloseTo(2, 0)
  })

  it('should take the gap to its toggle from --cui-menu-spacer', async () => {
    const { toggle, menu } = mount(900)
    menu.style.setProperty('--cui-menu-spacer', '10px')

    await open()

    expect(rect(menu).top - rect(toggle).bottom).toBeCloseTo(10, 0)
  })

  it('should leave a menu outside the .navbar-nav to Floating UI', async () => {
    const { toggle, menu } = mountNavbar(900, `<div class="d-flex ms-auto">
        <button class="btn-outline theme-secondary" type="button" data-coreui-toggle="menu" id="toggle">Account</button>
        <div class="menu" id="menu"><a class="menu-item" href="#">Profile</a></div>
      </div>`)

    await open()

    expect(menu.style.position).toBe('absolute')
    expect(rect(menu).top - rect(toggle).bottom).toBeCloseTo(2, 0)
  })

  it('should open a submenu beside its trigger in a right-to-left navbar', async () => {
    document.documentElement.dir = 'rtl'
    try {
      const { menu } = mount(900, 'bottom-start', '<a class="menu-item" href="#">Action</a><div class="submenu"><button class="menu-item" type="button" id="trigger">More</button><div class="menu" id="submenu"><a class="menu-item" href="#">Nested</a></div></div>')

      await open()
      container.querySelector('#trigger').click()
      await new Promise(resolve => {
        setTimeout(resolve, 50)
      })

      const submenu = container.querySelector('#submenu')
      expect(submenu).toHaveClass('show')
      expect(rect(submenu).right).toBeLessThanOrEqual(rect(container.querySelector('#trigger')).left + 1)
      expect(rect(submenu).width).toBeLessThan(rect(menu).width * 2)
    } finally {
      document.documentElement.removeAttribute('dir')
    }
  })

  it('should leave the layout at once when it closes', async () => {
    const { menu } = mount(900, 'bottom-end')

    await open()
    await instance.hide()

    expect(getComputedStyle(menu).display).toBe('none')
  })
})

/*!
 * A navbar expands by its own width, so a drawer opened in a narrow navbar has
 * to close when the navbar widens past its breakpoint, even when the window
 * keeps its size. Only a real browser with the stylesheet can tell, which is
 * why this lives in the visual suite.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import { page } from 'vitest/browser'
import Drawer from '../../src/drawer.js'
import Offcanvas from '../../src/offcanvas.js'

let container
let instance

const settle = (element, eventName) => new Promise(resolve => {
  const timer = setTimeout(resolve, 1000)
  element.addEventListener(eventName, () => {
    clearTimeout(timer)
    resolve()
  }, { once: true })
})

const mount = (Component, name) => {
  container = document.createElement('div')
  container.style.width = '400px'
  container.innerHTML = `<nav class="navbar navbar-expand-md">
      <div class="container-fluid">
        <dialog class="${name} ${name}-end" id="drawer"><div class="${name}-body">Menu</div></dialog>
      </div>
    </nav>`
  document.body.append(container)
  const element = container.querySelector('#drawer')
  instance = Component.getOrCreateInstance(element)
  return element
}

afterEach(() => {
  instance?.dispose()
  container?.remove()
  instance = null
})

describe('drawer in a navbar', () => {
  for (const [Component, name] of [[Drawer, 'drawer'], [Offcanvas, 'offcanvas']]) {
    it(`should close the ${name} when its navbar expands without a window resize`, async () => {
      const element = mount(Component, name)

      await instance.show()
      expect(getComputedStyle(element).position).toBe('fixed')

      const hidden = settle(element, `hidden.coreui.${name}`)
      container.style.width = '1200px'
      await hidden

      expect(element.open).toBeFalse()
      expect(getComputedStyle(element).position).toBe('static')
    })

    it(`should show the closed ${name} inline in an expanded navbar`, async () => {
      const element = mount(Component, name)
      container.style.width = '1200px'
      await new Promise(resolve => {
        requestAnimationFrame(resolve)
      })

      expect(element.open).toBeFalse()
      expect(getComputedStyle(element).display).toBe('flex')
      expect(getComputedStyle(element).position).toBe('static')
      expect(element.getBoundingClientRect().width).toBeGreaterThan(0)
    })

    it(`should close the ${name} when its navbar expands during the opening transition`, async () => {
      const element = mount(Component, name)

      const hidden = settle(element, `hidden.coreui.${name}`)
      instance.show()
      container.style.width = '1200px'
      await hidden

      expect(element.open).toBeFalse()
    })
  }
})

describe('responsive drawer', () => {
  it('should open every responsive drawer below its breakpoint with the focus inside', async () => {
    const { innerWidth, innerHeight } = window

    try {
      await page.viewport(500, 600)

      for (const className of ['drawer', 'drawer-sm', 'drawer-md', 'drawer-lg', 'drawer-xl', 'drawer-2xl']) {
        for (const variant of ['', ' drawer-instant']) {
          container = document.createElement('div')
          container.innerHTML = `<dialog class="${className} drawer-end${variant}"><div class="drawer-body"><button type="button">Inside</button></div></dialog>`
          document.body.append(container)
          const element = container.querySelector('dialog')
          instance = new Drawer(element)

          instance.show()

          expect(getComputedStyle(element).display).toBe('flex')
          expect(element.contains(document.activeElement)).toBeTrue()

          instance.dispose()
          instance = null
          container.remove()
          container = null
        }
      }
    } finally {
      await page.viewport(innerWidth, innerHeight)
    }
  })

  it('should hide a closed .drawer-lg below its breakpoint and show it inline above', async () => {
    container = document.createElement('div')
    container.innerHTML = '<dialog class="drawer-lg drawer-end" id="drawer"><div class="drawer-body">Menu</div></dialog>'
    document.body.append(container)
    const element = container.querySelector('#drawer')
    const { innerWidth, innerHeight } = window

    try {
      await page.viewport(800, 600)
      expect(getComputedStyle(element).display).toBe('none')

      await page.viewport(1200, 600)
      expect(getComputedStyle(element).display).toBe('flex')
      expect(getComputedStyle(element).position).toBe('static')
    } finally {
      await page.viewport(innerWidth, innerHeight)
    }
  })
})


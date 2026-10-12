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

/*!
 * A closed dialog takes no room on the page, and opening or closing it still animates. Only a
 * page with the stylesheet lays the dialog out and runs its transitions.
 */

import { page } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Dialog from '../../src/dialog.js'
import Drawer from '../../src/drawer.js'
import Modal from '../../src/modal.js'
import Offcanvas from '../../src/offcanvas.js'

let container
let instance

const mount = html => {
  container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  return container.querySelector('dialog')
}

const nextFrames = () => new Promise(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(resolve))
})

const wait = ms => new Promise(resolve => {
  setTimeout(resolve, ms)
})

const cases = [
  ['dialog', Dialog],
  ['modal', Modal]
]

describe('dialog layout', () => {
  afterEach(() => {
    instance?.dispose()
    instance = null
    container?.remove()
    container = null
    document.documentElement.classList.remove('dialog-open')
  })

  for (const [className, Component, style, expected] of [
    ['dialog dialog-slide-down', Dialog, '--cui-dialog-slide-distance: 5rem; --cui-dialog-transition-duration: 100s', { m11: 1, m42: -80 }],
    ['dialog dialog-slide-up', Dialog, '--cui-dialog-slide-distance: 5rem; --cui-dialog-transition-duration: 100s', { m11: 1, m42: 80 }],
    ['modal', Modal, '--cui-modal-fade-transform: scale(.8); --cui-modal-transition-duration: 100s', { m11: 0.8, m42: 0 }]
  ]) {
    it(`should start a .${className.replaceAll(' ', '.')} from the transform its tokens give the closed state`, async () => {
      const element = mount(`<dialog class="${className}" style="${style}"><div class="dialog-body">Body</div></dialog>`)
      instance = new Component(element)
      await nextFrames()

      instance.show()
      await nextFrames()

      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform)

      expect(matrix.m11).toBeCloseTo(expected.m11, 2)
      expect(matrix.m42).toBeCloseTo(expected.m42, 0)
    })
  }

  for (const [name, Component] of cases) {
    it(`should not make the page taller with a closed .${name}`, async () => {
      const before = document.documentElement.scrollHeight
      const element = mount(`<dialog class="${name}"><div class="${name}-body"><div style="height: 3000px"></div></div></dialog>`)
      await nextFrames()

      expect(getComputedStyle(element).display).toBe('none')
      expect(document.documentElement.scrollHeight).toBe(before)
    })

    it(`should fade a .${name} in from its starting style`, async () => {
      const element = mount(`<dialog class="${name}"><div class="${name}-body">Body</div></dialog>`)
      instance = new Component(element)
      await nextFrames()

      instance.show()
      await nextFrames()

      expect(getComputedStyle(element).display).toBe('flex')
      expect(Number(getComputedStyle(element).opacity)).toBeLessThan(1)
    })
  }

  for (const [className, Component, name, options] of [
    ['dialog', Dialog, 'dialog', {}],
    ['dialog', Dialog, 'dialog', { modal: false }],
    ['modal', Modal, 'modal', {}],
    ['modal', Modal, 'modal', { modal: false }],
    ['offcanvas offcanvas-end', Offcanvas, 'offcanvas', {}],
    ['offcanvas offcanvas-end', Offcanvas, 'offcanvas', { backdrop: false, scroll: true }],
    ['drawer drawer-end', Drawer, 'drawer', {}],
    ['drawer drawer-end', Drawer, 'drawer', { backdrop: false, scroll: true }]
  ]) {
    it(`should put the focus in an animated .${className.replaceAll(' ', '.')} as it opens${Object.keys(options).length > 0 ? ' without a modal' : ''}`, async () => {
      const element = mount(`<dialog class="${className}"><div class="${name}-body"><button type="button">Inside</button></div></dialog>`)
      instance = new Component(element, options)
      await nextFrames()

      instance.show()

      expect(element.contains(document.activeElement)).toBeTrue()
    })
  }

  it('should slide a .drawer-end in from its starting style without a modal', async () => {
    const element = mount('<dialog class="drawer drawer-end" style="--cui-drawer-transition-duration: 100s"><div class="drawer-body">Body</div></dialog>')
    instance = new Drawer(element, { backdrop: false, scroll: true })
    await nextFrames()

    instance.show()
    await nextFrames()

    expect(new DOMMatrixReadOnly(getComputedStyle(element).transform).m41).toBeGreaterThan(0)
  })

  it('should slide a .drawer-end with open in its markup in as the page shows it', async () => {
    const element = mount('<dialog class="drawer drawer-end" open style="--cui-drawer-transition-duration: 100s"><div class="drawer-body">Body</div></dialog>')
    await nextFrames()

    expect(new DOMMatrixReadOnly(getComputedStyle(element).transform).m41).toBeGreaterThan(0)
  })

  it('should take a .drawer closed natively out of the layout at once', async () => {
    const element = mount('<dialog class="drawer drawer-end"><div class="drawer-body">Body</div></dialog>')
    instance = new Drawer(element)
    const shown = new Promise(resolve => {
      element.addEventListener('shown.coreui.drawer', resolve, { once: true })
    })
    instance.show()
    await shown

    element.close()
    await nextFrames()

    expect(getComputedStyle(element).display).toBe('none')
  })

  it('should take a closed .drawer out of the layout', async () => {
    const element = mount('<dialog class="drawer drawer-end"><div class="drawer-body">Body</div></dialog>')
    await nextFrames()

    expect(getComputedStyle(element).display).toBe('none')
  })

  for (const [placement, axis, sign, dir] of [
    ['start', 'm41', -1, 'ltr'],
    ['end', 'm41', 1, 'ltr'],
    ['start', 'm41', 1, 'rtl'],
    ['end', 'm41', -1, 'rtl'],
    ['top', 'm42', -1, 'ltr'],
    ['bottom', 'm42', 1, 'ltr'],
    ['fullscreen', 'm42', 1, 'ltr']
  ]) {
    it(`should slide a .drawer-${placement} in from its starting style in a ${dir} document`, async () => {
      const element = mount(`<dialog class="drawer drawer-${placement}" dir="${dir}" style="--cui-drawer-transition-duration: 100s"><div class="drawer-body">Body</div></dialog>`)
      instance = new Drawer(element)
      await nextFrames()

      instance.show()
      await nextFrames()

      expect(getComputedStyle(element).display).toBe('flex')
      expect(Math.sign(new DOMMatrixReadOnly(getComputedStyle(element).transform)[axis])).toBe(sign)
    })
  }

  for (const [className, Component, name, moves, fades] of [
    ['dialog', Dialog, 'dialog', false, true],
    ['dialog dialog-slide-down', Dialog, 'dialog', true, true],
    ['dialog dialog-slide-up', Dialog, 'dialog', true, true],
    ['modal', Modal, 'modal', true, true],
    ['drawer drawer-end', Drawer, 'drawer', true, false]
  ]) {
    it(`should finish the entry of a .${className.replaceAll(' ', '.')}, then keep it rendered while it animates out`, async () => {
      const element = mount(`<dialog class="${className}"><div class="${name}-body">Body</div></dialog>`)
      instance = new Component(element)
      await nextFrames()
      const shown = new Promise(resolve => {
        element.addEventListener(`shown.coreui.${name}`, resolve, { once: true })
      })

      instance.show()
      await shown
      await wait(50)

      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform)

      expect(Number(getComputedStyle(element).opacity)).toBeCloseTo(1, 2)
      expect(matrix.m11).toBeCloseTo(1, 2)
      expect(matrix.m42).toBeCloseTo(0, 1)

      const hidden = new Promise(resolve => {
        element.addEventListener(`hidden.coreui.${name}`, resolve, { once: true })
      })

      instance.hide()
      await wait(100)

      const opacity = Number(getComputedStyle(element).opacity)

      expect(getComputedStyle(element).display).toBe('flex')
      expect(opacity).toBeGreaterThan(0)
      expect(opacity < 1).toBe(fades)
      expect(getComputedStyle(element).transform !== 'none').toBe(moves)

      await hidden

      expect(getComputedStyle(element).display).toBe('none')
    })
  }

  for (const [size, width] of [
    ['sm', 280],
    ['lg', 800],
    ['xl', 1140],
    ['2xl', 1440]
  ]) {
    it(`should open a .dialog-${size} ${width}px wide on a wide viewport`, async () => {
      const { innerWidth, innerHeight } = window
      await page.viewport(1600, 900)

      try {
        const element = mount(`<dialog class="dialog dialog-${size}"><div class="dialog-body">Body</div></dialog>`)
        instance = new Dialog(element)
        instance.show()
        await nextFrames()

        expect(element.offsetWidth).toBe(width)
      } finally {
        await page.viewport(innerWidth, innerHeight)
      }
    })
  }

  it('should narrow a .dialog-2xl to the viewport minus its margins', async () => {
    const { innerWidth, innerHeight } = window
    await page.viewport(1366, 768)

    try {
      const element = mount('<dialog class="dialog dialog-2xl"><div class="dialog-body">Body</div></dialog>')
      instance = new Dialog(element)
      instance.show()
      await nextFrames()

      expect(element.offsetWidth).toBe(document.documentElement.clientWidth - 56)
    } finally {
      await page.viewport(innerWidth, innerHeight)
    }
  })
})

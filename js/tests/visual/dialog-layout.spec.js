/*!
 * A closed dialog takes no room on the page, and opening or closing it still animates. Only a
 * page with the stylesheet lays the dialog out and runs its transitions.
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Dialog from '../../src/dialog.js'
import Modal from '../../src/modal.js'

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

  for (const [name, Component] of cases) {
    it(`should keep a .${name} nested in a closed one visible`, async () => {
      const element = mount(`<dialog class="${name}"><div class="${name}-body"><button type="button" data-coreui-toggle="${name}" data-coreui-target="#inner">Next</button><dialog class="${name}" id="inner"><div class="${name}-body"><button type="button">OK</button></div></dialog></div></dialog>`)
      const inner = container.querySelector('#inner')
      instance = new Component(element)
      const shown = new Promise(resolve => {
        element.addEventListener(`shown.coreui.${name}`, resolve, { once: true })
      })

      instance.show()
      await shown

      const innerShown = new Promise(resolve => {
        inner.addEventListener(`shown.coreui.${name}`, resolve, { once: true })
      })

      element.querySelector('[data-coreui-toggle]').click()
      await innerShown

      expect(element.open).toBeFalse()
      expect(inner.open).toBeTrue()
      expect(inner.checkVisibility()).toBeTrue()

      Component.getInstance(inner).dispose()
    })
  }

  for (const [className, Component, style, expected] of [
    ['dialog dialog-slide-down', Dialog, '--cui-dialog-slide-distance: 5rem; --cui-dialog-transition-duration: 100s', { m11: 1, m42: -80 }],
    ['dialog dialog-slide-up', Dialog, '--cui-dialog-slide-distance: 5rem; --cui-dialog-transition-duration: 100s', { m11: 1, m42: 80 }],
    ['modal', Modal, '--cui-modal-fade-transform: scale(.8); --cui-modal-transition-duration: 100s', { m11: 0.8, m42: 0 }]
  ]) {
    it(`should start a .${className.replaceAll(' ', '.')} from the transform its tokens give the closed state`, async () => {
      const element = mount(`<dialog class="${className}" style="${style}"><div class="dialog-body">Body</div></dialog>`)
      instance = new Component(element)

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

      instance.show()
      await nextFrames()

      expect(getComputedStyle(element).display).toBe('flex')
      expect(Number(getComputedStyle(element).opacity)).toBeLessThan(1)
    })

    it(`should keep a .${name} rendered while it fades out, then take it out of the layout`, async () => {
      const element = mount(`<dialog class="${name}"><div class="${name}-body">Body</div></dialog>`)
      instance = new Component(element)
      const shown = new Promise(resolve => {
        element.addEventListener(`shown.coreui.${name}`, resolve, { once: true })
      })

      instance.show()
      await shown
      await wait(50)

      const hidden = new Promise(resolve => {
        element.addEventListener(`hidden.coreui.${name}`, resolve, { once: true })
      })

      instance.hide()
      await wait(100)

      expect(getComputedStyle(element).display).toBe('flex')
      expect(Number(getComputedStyle(element).opacity)).toBeLessThan(1)

      await hidden

      expect(getComputedStyle(element).display).toBe('none')
    })
  }
})

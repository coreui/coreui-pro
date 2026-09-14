/*!
 * The nine placement classes pin the container with logical insets and point
 * the entry with a physical translate, so the two agree only while the
 * mirroring is keyed on the same direction the insets resolve against. Nothing
 * short of a real browser with the stylesheet can tell, which is why this lives
 * in the visual suite.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Toaster from '../../src/toaster.js'

let host
let toaster

afterEach(() => {
  toaster?.dispose()
  toaster = null
  host?.remove()
  host = null
  document.documentElement.dir = ''
})

describe('toast container placement', () => {
  const shapes = [
    ['a left-to-right document', {}],
    ['a right-to-left document', { document: 'rtl' }],
    ['a left-to-right island in a right-to-left document', { document: 'rtl', host: 'ltr' }],
    ['a container carrying its own dir', { container: 'rtl' }]
  ]

  const sideOf = translate => translate.trim().startsWith('calc(-') ? 'left' : 'right'

  it.each(shapes)('sends the entry beyond the edge it is pinned to in %s', (_name, shape) => {
    for (const placement of ['top-start', 'top-end']) {
      document.documentElement.dir = shape.document ?? 'ltr'
      host = document.createElement('div')
      if (shape.host) {
        host.dir = shape.host
      }

      document.body.append(host)

      toaster = new Toaster(null, { container: host, placement })
      if (shape.container) {
        toaster._element.dir = shape.container
      }

      toaster.add({ description: 'Placement', instant: true })

      const { left, right } = toaster._element.getBoundingClientRect()
      const pinned = left < window.innerWidth - right ? 'left' : 'right'

      expect(sideOf(getComputedStyle(toaster._element).getPropertyValue('--cui-toast-translate'))).toEqual(pinned)

      toaster.dispose()
      toaster = null
      host.remove()
      host = null
    }
  })
})

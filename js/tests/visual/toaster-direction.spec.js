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

const sign = number => Math.sign(Math.round(number))

// Which way the translate would take a toast, with every percentage and custom
// property resolved against the container the toast lives in.
const offsetOf = (container, translate) => {
  const probe = document.createElement('div')
  probe.style.cssText = 'width: 100px; height: 20px;'
  container.append(probe)

  const rest = probe.getBoundingClientRect()
  probe.style.translate = translate
  const moved = probe.getBoundingClientRect()
  probe.remove()

  return { x: sign(moved.left - rest.left), y: sign(moved.top - rest.top) }
}

// The two chains the stylesheet itself reads, so an unset override falls back
// the way it does on a real toast.
const ENTER = 'var(--cui-toast-enter-translate, var(--cui-toast-translate))'
const LEAVE = 'var(--cui-toast-leave-translate, var(--cui-toast-translate))'

const mount = (placement, { document: documentDir = 'ltr', host: hostDir, container: containerDir } = {}, options = {}) => {
  document.documentElement.dir = documentDir
  host = document.createElement('div')
  if (hostDir) {
    host.dir = hostDir
  }

  document.body.append(host)

  toaster = new Toaster(null, { container: host, placement, ...options })
  if (containerDir) {
    toaster._element.dir = containerDir
  }

  return toaster._element
}

afterEach(() => {
  toaster?.dispose()
  toaster = null
  host?.remove()
  host = null
  document.documentElement.dir = ''
})

describe('toast container placement', () => {
  const cases = [
    ['top-start', { ltr: { x: -1, y: 0 }, rtl: { x: 1, y: 0 } }],
    ['middle-start', { ltr: { x: -1, y: 0 }, rtl: { x: 1, y: 0 } }],
    ['bottom-start', { ltr: { x: -1, y: 0 }, rtl: { x: 1, y: 0 } }],
    ['top-end', { ltr: { x: 1, y: 0 }, rtl: { x: -1, y: 0 } }],
    ['middle-end', { ltr: { x: 1, y: 0 }, rtl: { x: -1, y: 0 } }],
    ['bottom-end', { ltr: { x: 1, y: 0 }, rtl: { x: -1, y: 0 } }],
    ['top-center', { ltr: { x: 0, y: -1 }, rtl: { x: 0, y: -1 } }],
    ['bottom-center', { ltr: { x: 0, y: 1 }, rtl: { x: 0, y: 1 } }],
    ['middle-center', { ltr: { x: 0, y: 0 }, rtl: { x: 0, y: 0 } }]
  ]

  it.each(cases)('%s brings a toast in from the edge it is pinned to, and sends it back the same way', (placement, expected) => {
    for (const direction of ['ltr', 'rtl']) {
      const container = mount(placement, { document: direction })

      expect(offsetOf(container, ENTER)).toEqual(expected[direction])
      expect(offsetOf(container, LEAVE)).toEqual(expected[direction])

      toaster.dispose()
      toaster = null
      host.remove()
      host = null
    }
  })

  const settle = milliseconds => new Promise(resolve => {
    setTimeout(resolve, milliseconds)
  })

  it('keeps a leaving toast behind the ones that stay', async () => {
    const container = mount('top-center', {}, { timeout: 0 })
    const ids = ['first', 'second', 'third'].map(description => toaster.add({ description }))
    await settle(500)

    toaster.close(ids[0])
    await settle(150)

    const leaving = [...container.querySelectorAll('.toast')].find(
      element => Number(getComputedStyle(element).opacity) < 1
    )
    const staying = [...container.querySelectorAll('.toast')].filter(element => element !== leaving)

    expect(leaving).toBeTruthy()
    for (const element of staying) {
      expect(Number(getComputedStyle(leaving).zIndex)).toBeLessThan(Number(getComputedStyle(element).zIndex))
    }
  })

  it('sends a toast back out the edge an explicit enter brought it in from', () => {
    const container = mount('top-end', {}, { enter: 'top' })

    expect(offsetOf(container, ENTER)).toEqual({ x: 0, y: -1 })
    expect(offsetOf(container, LEAVE)).toEqual({ x: 0, y: -1 })
  })
})

describe('toast container direction', () => {
  const cases = [
    ['a left-to-right document', {}, -1],
    ['a right-to-left document', { document: 'rtl' }, 1],
    ['a left-to-right island in a right-to-left document', { document: 'rtl', host: 'ltr' }, -1],
    ['a container carrying its own dir', { container: 'rtl' }, 1]
  ]

  it.each(cases)('mirrors the inline edge with the direction the container is in: %s', (_name, shape, expected) => {
    const container = mount('top-start', shape)

    expect(offsetOf(container, ENTER).x).toEqual(expected)
  })

  it.each(cases)('mirrors an explicit start edge the same way: %s', (_name, shape, expected) => {
    const container = mount('top-center', shape, { enter: 'start' })

    expect(offsetOf(container, ENTER).x).toEqual(expected)
  })
})

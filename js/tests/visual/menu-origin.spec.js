/*!
 * The menu scales in from the point where it meets its toggle. Floating UI
 * mirrors the alignment of top and bottom placements in right-to-left while the
 * placement attribute keeps its name, so only the stylesheet's `:dir()` rules
 * can follow it, and only a real browser with the stylesheet can tell whether
 * they do.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Menu from '../../src/menu.js'

const PLACEMENTS = ['bottom', 'top', 'right', 'left'].flatMap(side => [`${side}-start`, side, `${side}-end`])

const SHAPES = [
  ['a left-to-right document', { document: 'ltr' }],
  ['a right-to-left document', { document: 'rtl' }],
  ['a right-to-left subtree whose menu moves to the body', { document: 'ltr', host: 'rtl', container: 'body' }]
]

let host
let instance
let menuElement

const mount = ({ document: documentDir, host: hostDir }) => {
  document.documentElement.dir = documentDir
  host = document.createElement('div')
  if (hostDir) {
    host.dir = hostDir
  }

  host.style.cssText = 'position: absolute; top: 200px; left: 200px;'
  host.innerHTML = [
    '<button type="button" style="width: 30px; height: 30px;">M</button>',
    '<div class="menu" style="width: 100px; transition: none;">',
    '  <a class="menu-item" href="#">One</a>',
    '  <a class="menu-item" href="#">Two</a>',
    '</div>'
  ].join('')
  document.body.append(host)
  menuElement = host.querySelector('.menu')

  return host.querySelector('button')
}

const nextFrame = () => new Promise(resolve => {
  requestAnimationFrame(resolve)
})

const placed = async element => {
  for (let frame = 0; frame < 60 && !element.hasAttribute('data-coreui-placement'); frame++) {
    // eslint-disable-next-line no-await-in-loop
    await nextFrame()
  }
}

const near = (a, b) => Math.abs(a - b) < 1

const alignment = (start, end, menuStart, menuEnd) => {
  if (near(menuStart, start)) {
    return 0
  }

  if (near(menuEnd, end)) {
    return menuEnd - menuStart
  }

  if (near((menuStart + menuEnd) / 2, (start + end) / 2)) {
    return (menuEnd - menuStart) / 2
  }

  return Number.NaN
}

const meetingPoint = (toggle, menu) => {
  const t = toggle.getBoundingClientRect()
  const m = menu.getBoundingClientRect()

  if (m.top >= t.bottom) {
    return [alignment(t.left, t.right, m.left, m.right), 0]
  }

  if (m.bottom <= t.top) {
    return [alignment(t.left, t.right, m.left, m.right), m.height]
  }

  if (m.left >= t.right) {
    return [0, alignment(t.top, t.bottom, m.top, m.bottom)]
  }

  return [m.width, alignment(t.top, t.bottom, m.top, m.bottom)]
}

afterEach(() => {
  instance?.dispose()
  instance = null
  menuElement?.remove()
  menuElement = null
  host?.remove()
  host = null
  document.documentElement.dir = ''
})

const originOf = element => getComputedStyle(element).transformOrigin.split(' ').map(Number.parseFloat)

const open = async (shape, placement) => {
  const toggle = mount(shape)
  instance = new Menu(toggle, { placement, container: shape.container ?? false })
  instance.show()
  await placed(menuElement)

  expect(menuElement.getAttribute('data-coreui-placement')).toEqual(placement)
  expect(getComputedStyle(menuElement).direction).toEqual(shape.host ?? shape.document)

  return meetingPoint(toggle, menuElement)
}

describe('menu transform origin', () => {
  describe.each(SHAPES)('in %s', (_, shape) => {
    it.each(PLACEMENTS)('grows a %s menu from the point it shares with its toggle', async placement => {
      const [x, y] = await open(shape, placement)
      const [originX, originY] = originOf(menuElement)

      expect(originX).toBeCloseTo(x, 0)
      expect(originY).toBeCloseTo(y, 0)
    })
  })

  describe.each(SHAPES)('in %s', (_, shape) => {
    it.each(PLACEMENTS)('shrinks a %s menu toward the point it shares with its toggle', async placement => {
      const [x, y] = await open(shape, placement)
      menuElement.style.transition = 'opacity 1s, transform 1s, display 1s allow-discrete'
      instance.hide()
      await nextFrame()
      await nextFrame()

      expect(getComputedStyle(menuElement).display).not.toEqual('none')

      const [originX, originY] = originOf(menuElement)

      expect(originX).toBeCloseTo(x, 0)
      expect(originY).toBeCloseTo(y, 0)
    })
  })
})

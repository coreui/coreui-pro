/*!
 * Every mirrored value in the stylesheet is keyed on `:dir()`, so it agrees
 * with the logical property it belongs to even when a subtree, or the element
 * itself, carries its own `dir`. An ancestor test parts ways with them there,
 * and only a real browser with the stylesheet can tell.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let host

const shapes = [
  ['a left-to-right document', { document: 'ltr' }],
  ['a right-to-left document', { document: 'rtl' }],
  ['a left-to-right island in a right-to-left document', { document: 'rtl', host: 'ltr' }],
  ['an element carrying its own dir', { document: 'ltr', element: 'rtl' }]
]

const mount = (markup, { document: documentDir, host: hostDir, element: elementDir }) => {
  document.documentElement.dir = documentDir
  host = document.createElement('div')
  if (hostDir) {
    host.dir = hostDir
  }

  host.innerHTML = markup
  document.body.append(host)

  const element = host.querySelector('[data-probe]')
  if (elementDir) {
    element.dir = elementDir
  }

  return element
}

afterEach(() => {
  host?.remove()
  host = null
  document.documentElement.dir = ''
})

describe('mirrored values follow the direction of the element they style', () => {
  it.each(shapes)('hides a closed panel beyond the edge it is pinned to in %s', (_name, shape) => {
    for (const className of ['offcanvas offcanvas-start', 'offcanvas offcanvas-end', 'drawer drawer-start', 'drawer drawer-end']) {
      const panel = mount(`<div class="${className}" data-probe></div>`, shape)
      const { left, right } = panel.getBoundingClientRect()
      const startIsLeft = getComputedStyle(panel).direction === 'ltr'
      const hidesLeft = className.endsWith('start') === startIsLeft

      expect(hidesLeft ? right : window.innerWidth - left).toBeLessThanOrEqual(1)

      host.remove()
      host = null
    }
  })

  it.each(shapes)('turns the breadcrumb divider around in %s', (_name, shape) => {
    const markup = '<ol class="breadcrumb" style="--cui-breadcrumb-divider: \'L\'; --cui-breadcrumb-divider-flipped: \'R\'">' +
      '<li class="breadcrumb-item">one</li>' +
      '<li class="breadcrumb-item" data-probe>two</li>' +
      '</ol>'
    const crumb = mount(markup, shape)
    const rtl = getComputedStyle(crumb).direction === 'rtl'

    expect(getComputedStyle(crumb, '::before').content).toEqual(rtl ? '"R"' : '"L"')
  })

  it.each(shapes)('turns the submenu caret around in %s', (_name, shape) => {
    const markup = '<ul class="menu" style="display: block; position: static">' +
      '<li class="submenu"><a class="menu-item" data-probe>one</a></li>' +
      '</ul>'
    const item = mount(markup, shape)
    const rtl = getComputedStyle(item).direction === 'rtl'
    const { transform } = getComputedStyle(item, '::after')
    const [a, b] = transform.slice(transform.indexOf('(') + 1).split(',').map(Number)

    expect(Math.round((Math.atan2(b, a) * 180) / Math.PI)).toEqual(rtl ? 135 : -45)
  })

  it.each(shapes)('turns the sidebar toggler around in %s', (_name, shape) => {
    // The toggler is `display: none` below 1024 px and the suite runs narrower,
    // so it needs a box before its `::before` exists at all.
    const markup = '<div class="sidebar" style="display: flex; position: static">' +
      '<button class="sidebar-toggler" data-probe style="display: block"></button>' +
      '</div>'
    const toggler = mount(markup, shape)
    const rtl = getComputedStyle(toggler).direction === 'rtl'
    const { transform } = getComputedStyle(toggler, '::before')

    expect(transform).toEqual(rtl ? 'matrix(-1, 0, 0, -1, 0, 0)' : 'none')
  })

  it.each(shapes)('straddles the corner an inset pins it to in %s', (_name, shape) => {
    const markup = '<div style="position: relative; width: 300px; height: 80px;">' +
      '<span class="badge badge-position-top-start" data-probe>9</span>' +
      '</div>'
    const badge = mount(markup, shape)
    const box = badge.parentElement.getBoundingClientRect()
    const rect = badge.getBoundingClientRect()
    const corner = getComputedStyle(badge).direction === 'ltr' ? box.left : box.right

    expect(Math.round(((rect.left + rect.right) / 2) - corner)).toEqual(0)
  })

  it.each(shapes)('centres .translate-middle on the line its inset sets in %s', (_name, shape) => {
    const markup = '<div style="position: relative; width: 300px; height: 80px;">' +
      '<span class="translate-middle" data-probe style="position: absolute; inset-block-start: 0; inset-inline-start: 0; width: 40px; height: 40px;"></span>' +
      '</div>'
    const element = mount(markup, shape)
    const box = element.parentElement.getBoundingClientRect()
    const rect = element.getBoundingClientRect()
    const corner = getComputedStyle(element).direction === 'ltr' ? box.left : box.right

    expect(Math.round(((rect.left + rect.right) / 2) - corner)).toEqual(0)
  })
})

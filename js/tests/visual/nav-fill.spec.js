/*!
 * `.nav-fill` and `.nav-justified` stretch a nav across its container, an
 * inline enclosed track included.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

const mount = classes => {
  container = document.createElement('div')
  container.style.width = '400px'
  container.innerHTML = `<ul class="nav ${classes}">
      <li class="nav-item"><a class="nav-link active" href="#">Active</a></li>
      <li class="nav-item"><a class="nav-link" href="#">Much longer nav link</a></li>
    </ul>`
  document.body.append(container)
  return container.firstElementChild
}

const width = element => element.getBoundingClientRect().width

afterEach(() => container?.remove())

describe('nav fill', () => {
  it('should leave an enclosed nav as wide as its links', () => {
    expect(width(mount('nav-enclosed'))).toBeLessThan(400)
  })

  for (const modifier of ['nav-fill', 'nav-justified']) {
    it(`should stretch an enclosed nav across its container with .${modifier}`, () => {
      const nav = mount(`nav-enclosed ${modifier}`)
      const [first, second] = nav.children

      expect(width(nav)).toBe(400)
      expect(width(first) + width(second)).toBeGreaterThan(width(nav) * 0.9)
    })
  }

  it('should give every item the same width with .nav-justified', () => {
    const [first, second] = mount('nav-enclosed nav-justified').children

    expect(width(first)).toBeCloseTo(width(second), 0)
  })
})

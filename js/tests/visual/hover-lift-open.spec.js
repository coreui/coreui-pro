/*!
 * A .hover-lift toggle stays raised while it is expanded, so it does not drop
 * under its open menu when the pointer moves onto the menu. A surface whose own
 * state class is .show stays at rest until it is hovered.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

const mount = html => {
  container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  return container.firstElementChild
}

afterEach(() => {
  container?.remove()
})

describe('hover lift', () => {
  it('should raise an expanded toggle', () => {
    const toggle = mount('<button type="button" class="btn hover-lift show" aria-expanded="true" style="transition: none">Menu</button>')

    expect(getComputedStyle(toggle).transform).not.toBe('none')
  })

  it('should leave a collapsed toggle in place', () => {
    const toggle = mount('<button type="button" class="btn hover-lift" aria-expanded="false" style="transition: none">Menu</button>')

    expect(getComputedStyle(toggle).transform).toBe('none')
  })

  for (const html of ['<div class="toast show hover-lift" style="transition: none">Saved</div>', '<div class="alert fade show hover-lift" style="transition: none">Saved</div>']) {
    it(`should leave ${html.match(/class="([^"]+)"/)[1]} in place until it is hovered`, () => {
      expect(getComputedStyle(mount(html)).transform).toBe('none')
    })
  }
})

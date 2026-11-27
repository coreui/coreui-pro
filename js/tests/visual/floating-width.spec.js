/*!
 * A tooltip or popover placed near the edge of a narrow containing block keeps
 * its own width instead of shrinking to the space left before the edge.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

const TEXT = 'A tooltip long enough to need more room than the gap before the edge'

let container

const mount = html => {
  container = document.createElement('div')
  container.style.cssText = 'position: relative; width: 300px; height: 200px'
  container.innerHTML = html
  document.body.append(container)
  return container.firstElementChild
}

afterEach(() => {
  container?.remove()
})

describe('floating element width', () => {
  it('should keep the tooltip at its own width beside the edge', () => {
    const tooltip = mount(`<div class="tooltip show" style="position: absolute; top: 0; left: 260px"><div class="tooltip-inner">${TEXT}</div></div>`)

    expect(tooltip.getBoundingClientRect().width).toBeGreaterThan(100)
  })

  it('should keep the popover at its own width beside the edge', () => {
    const popover = mount(`<div class="popover show" style="position: absolute; top: 0; left: 260px"><div class="popover-body">${TEXT}</div></div>`)

    expect(popover.getBoundingClientRect().width).toBeGreaterThan(100)
  })
})

/*!
 * Visually hidden boxes are clipped out of painting and hit testing.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

afterEach(() => container?.remove())

const isHitAtCentre = element => {
  const { left, top, width, height } = element.getBoundingClientRect()

  return document.elementFromPoint(left + (width / 2), top + (height / 2)) === element
}

describe('visually hidden clipping', () => {
  beforeEach(() => {
    container = document.createElement('div')
    container.style.padding = '50px'
    container.innerHTML = `<table class="table">
        <caption class="visually-hidden">Totals</caption>
        <tbody><tr><td>1</td></tr></tbody>
      </table>
      <span class="visually-hidden" id="hidden">Hidden</span>
      <span class="btn-check"><input type="checkbox" id="check"><label class="btn btn-primary" for="check">Bold</label></span>`
    document.body.append(container)
  })

  it('should clip a visually hidden caption that stays in flow', () => {
    const caption = container.querySelector('caption')

    expect(getComputedStyle(caption).position).toBe('static')
    expect(isHitAtCentre(caption)).toBeFalse()
  })

  it('should clip a visually hidden element', () => {
    expect(isHitAtCentre(container.querySelector('#hidden'))).toBeFalse()
  })

  it('should clip the toggle button input', () => {
    expect(getComputedStyle(container.querySelector('#check')).clipPath).toBe('inset(50%)')
  })
})

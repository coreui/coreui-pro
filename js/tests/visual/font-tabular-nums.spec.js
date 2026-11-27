/*!
 * .font-tabular-nums gives every digit the same width.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

afterEach(() => {
  container?.remove()
})

describe('font-tabular-nums', () => {
  it('should set tabular figures and keep the font family', () => {
    container = document.createElement('div')
    container.innerHTML = '<p>11,111.11</p><p class="font-tabular-nums">11,111.11</p>'
    document.body.append(container)
    const [plain, tabular] = container.querySelectorAll('p')

    expect(getComputedStyle(tabular).fontVariantNumeric).toBe('tabular-nums')
    expect(getComputedStyle(plain).fontVariantNumeric).toBe('normal')
    expect(getComputedStyle(tabular).fontFamily).toBe(getComputedStyle(plain).fontFamily)
  })

  it('should give ones and eights the same width', () => {
    container = document.createElement('div')
    container.innerHTML = '<span class="font-tabular-nums">111111</span><span class="font-tabular-nums">888888</span>'
    document.body.append(container)
    const [ones, eights] = container.querySelectorAll('span')

    expect(ones.getBoundingClientRect().width).toBeCloseTo(eights.getBoundingClientRect().width, 1)
  })
})

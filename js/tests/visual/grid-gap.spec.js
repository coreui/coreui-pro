/*!
 * Row gutters are native gaps that numbered columns, offsets and row columns account for.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { page } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

describe('Grid gaps', () => {
  let container

  const mount = (markup, dir = 'ltr') => {
    container = document.createElement('div')
    container.dir = dir
    container.style.width = '800px'
    container.innerHTML = markup
    document.body.append(container)

    return container.firstElementChild
  }

  const rect = element => element.getBoundingClientRect()
  const gapX = row => Number.parseFloat(getComputedStyle(row).columnGap)
  const span = (row, size, columns = 12) => ((rect(row).width + gapX(row)) * size / columns) - gapX(row)

  afterEach(() => {
    container.remove()
  })

  it('fits mixed spans and offsets that add up to 12 on one line', () => {
    const row = mount('<div class="row"><div class="col-4"></div><div class="col-8"></div><div class="col-3 offset-3"></div><div class="col-6"></div></div>')
    const [four, eight, offset, six] = row.children
    const { width } = rect(row)

    expect(gapX(row)).toBeGreaterThan(0)
    expect(rect(four).top).toBe(rect(eight).top)
    expect(rect(four).width).toBeCloseTo(span(row, 4), 1)
    expect(rect(eight).left - rect(four).right).toBeCloseTo(gapX(row), 1)
    expect(rect(eight).right).toBeCloseTo(rect(row).right, 1)
    expect(rect(offset).top).toBe(rect(six).top)
    expect(rect(offset).left - rect(row).left).toBeCloseTo((width + gapX(row)) * 3 / 12, 1)
    expect(rect(six).right).toBeCloseTo(rect(row).right, 1)
  })

  it('keeps the row inside its parent and the content box on the column', () => {
    const wrapper = mount('<div class="container" style="max-width: none"><div class="row"><div class="col-6"></div><div class="col-6"></div></div></div>')
    const row = wrapper.querySelector('.row')
    const style = getComputedStyle(row.firstElementChild)
    const padding = Number.parseFloat(getComputedStyle(wrapper).paddingInlineStart)

    expect(rect(row).left).toBeCloseTo(rect(wrapper).left + padding, 1)
    expect(rect(row).right).toBeCloseTo(rect(wrapper).right - padding, 1)
    expect([style.paddingInlineStart, style.paddingInlineEnd, style.boxSizing]).toEqual(['0px', '0px', 'border-box'])
  })

  it('removes the gaps with .g-0 and keeps halves at half the row', () => {
    const row = mount('<div class="row g-0"><div class="col-6"></div><div class="col-6"></div></div>')
    const [first, second] = row.children

    expect(gapX(row)).toBe(0)
    expect(rect(first).width).toBeCloseTo(rect(row).width / 2, 1)
    expect(rect(second).left).toBeCloseTo(rect(first).right, 1)
  })

  it('sizes columns from a gutter class and spaces wrapped lines with .gy-*', () => {
    const wrapper = mount('<div><div style="height: 10px"></div><div class="row gx-5 gy-3"><div class="col-6"></div><div class="col-6"></div><div class="col-12" style="height: 10px"></div></div></div>')
    const row = wrapper.lastElementChild
    const [first, second, third] = row.children
    const rowGap = Number.parseFloat(getComputedStyle(row).rowGap)

    expect(gapX(row)).toBeGreaterThan(0)
    expect(rowGap).toBeGreaterThan(0)
    expect(rect(first).width).toBeCloseTo(span(row, 6), 1)
    expect(rect(second).top).toBe(rect(first).top)
    expect(rect(third).top - rect(first).bottom).toBeCloseTo(rowGap, 1)
    expect(rect(first).top).toBe(rect(row).top)
    expect(rect(row).top).toBe(rect(wrapper.firstElementChild).bottom)
  })

  it('resolves a font-relative gutter on the row, not on each column', () => {
    const row = mount('<div class="row" style="--cui-gutter-x: 1.5em"><label class="col-2 col-form-label col-form-label-sm">Email</label><div class="col-10"></div></div>')
    const [label, field] = row.children

    expect(Number.parseFloat(getComputedStyle(label).fontSize)).toBeLessThan(Number.parseFloat(getComputedStyle(row).fontSize))
    expect(rect(field).top).toBe(rect(label).top)
    expect(rect(label).width).toBeCloseTo(span(row, 2), 1)
    expect(rect(field).right).toBeCloseTo(rect(row).right, 1)
  })

  it('accepts a unitless zero gutter set on the row', () => {
    const row = mount('<div class="row" style="--cui-gutter-x: 0"><div class="col-6"></div><div class="col-6"></div></div>')

    expect(rect(row.firstElementChild).width).toBeCloseTo(rect(row).width / 2, 1)
    expect(rect(row.lastElementChild).top).toBe(rect(row.firstElementChild).top)
  })

  it('keeps padded columns on one line without the reboot box sizing', () => {
    const row = mount('<div><style>@layer reboot { .content-box-test * { box-sizing: content-box; } }</style><div class="row content-box-test"><div class="col-6 px-7"></div><div class="col-6 px-7"></div></div></div>').lastElementChild
    const [first, second] = row.children

    expect(getComputedStyle(first).boxSizing).toBe('border-box')
    expect(rect(second).top).toBe(rect(first).top)
    expect(rect(second).right).toBeCloseTo(rect(row).right, 1)
  })

  it('lets a responsive column class override a smaller tier inside a row', async () => {
    const { innerHeight, innerWidth } = window

    await page.viewport(1024, 768)

    try {
      const row = mount('<div class="row"><div class="col-6 col-md-auto">Auto</div><div class="col-6 col-md-4"></div></div>')
      const [auto, four] = row.children

      expect(rect(auto).width).toBeLessThan(span(row, 6))
      expect(rect(four).width).toBeCloseTo(span(row, 4), 1)
    } finally {
      await page.viewport(innerWidth, innerHeight)
    }
  })

  it('fits .row-cols-* items on one line', () => {
    const row = mount('<div class="row row-cols-3"><div class="col"></div><div class="col"></div><div class="col"></div><div class="col"></div></div>')
    const [first, , third, fourth] = row.children

    expect(rect(first).width).toBeCloseTo(span(row, 1, 3), 1)
    expect(rect(third).top).toBe(rect(first).top)
    expect(rect(third).right).toBeCloseTo(rect(row).right, 1)
    expect(rect(fourth).left).toBeCloseTo(rect(row).left, 1)
  })

  it('sizes a nested row against the content box of its column', () => {
    const row = mount('<div class="row"><div class="col-6"><div class="row"><div class="col-6"></div><div class="col-6"></div></div></div></div>')
    const outer = row.firstElementChild
    const inner = outer.querySelector('.row')

    expect(rect(inner).width).toBeCloseTo(rect(outer).width, 1)
    expect(rect(inner.firstElementChild).width).toBeCloseTo(span(inner, 6), 1)
    expect(rect(inner.lastElementChild).right).toBeCloseTo(rect(outer).right, 1)
  })

  it('keeps percentage widths for column classes outside a row', () => {
    const wrapper = mount('<div class="container" style="max-width: none"><div class="col-6"></div><div class="col-3 offset-3"></div></div>')
    const content = rect(wrapper).width - (2 * Number.parseFloat(getComputedStyle(wrapper).paddingInlineStart))
    const [half, offset] = wrapper.children

    expect(rect(half).width).toBeCloseTo(content / 2, 1)
    expect(rect(offset).width).toBeCloseTo(content / 4, 1)
    expect(Number.parseFloat(getComputedStyle(offset).marginInlineStart)).toBeCloseTo(content / 4, 1)
  })

  it('offsets from the inline start in RTL', () => {
    const row = mount('<div class="row"><div class="col-3 offset-3"></div></div>', 'rtl')
    const column = row.firstElementChild

    expect(rect(row).right - rect(column).right).toBeCloseTo((rect(row).width + gapX(row)) * 3 / 12, 1)
    expect(rect(column).width).toBeCloseTo(span(row, 3), 1)
  })
})

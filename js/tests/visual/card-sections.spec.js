/*!
 * Sections stacked in a card share one rule taken from the card's own border, and
 * a card group squares the corners where its cards meet. Only a real browser with
 * the stylesheet can tell, which is why this lives in the visual suite.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

const mount = html => {
  container = document.createElement('div')
  container.style.cssText = 'width: 360px;'
  container.innerHTML = html
  document.body.append(container)
  return container.firstElementChild
}

const top = element => getComputedStyle(element).borderTopWidth
const bottom = element => getComputedStyle(element).borderBottomWidth

afterEach(() => container?.remove())

describe('card sections', () => {
  it('should draw one rule between stacked sections', () => {
    const card = mount(`<div class="card">
        <div class="card-img-top" style="height: 20px"></div>
        <div class="card-body">a</div>
        <div class="card-body">b</div>
        <ul class="list-group list-group-flush"><li class="list-group-item">c</li></ul>
        <div class="card-body">d</div>
      </div>`)
    const [image, first, second, list, last] = card.children

    expect(top(image)).toBe('0px')
    expect(top(first)).toBe('1px')
    expect(top(second)).toBe('1px')
    expect([top(list), bottom(list)]).toEqual(['1px', '0px'])
    expect(top(last)).toBe('1px')
  })

  it('should leave the divider between a cap and a list group to the cap', () => {
    const card = mount(`<div class="card">
        <div class="card-header">h</div>
        <ul class="list-group list-group-flush"><li class="list-group-item">a</li></ul>
        <div class="card-footer">f</div>
      </div>`)
    const [header, list, footer] = card.children

    expect([bottom(header), top(list), bottom(list), top(footer)]).toEqual(['1px', '0px', '0px', '1px'])
  })

  it('should keep the rule off the block axis of a horizontal card', () => {
    const card = mount(`<div class="card card-row">
        <div class="card-body">a</div>
        <ul class="list-group list-group-flush"><li class="list-group-item">b</li></ul>
      </div>`)
    const list = card.lastElementChild

    expect([top(list), bottom(list)]).toEqual(['0px', '0px'])
    expect(getComputedStyle(list).borderInlineStartWidth).toBe('1px')
  })

  for (const [classes, width] of [['card-subtle theme-primary', '1px'], ['border-success', '1px'], ['border-0', '0px']]) {
    it(`should take the rule from the border of a .${classes.split(' ')[0]} card`, () => {
      const card = mount(`<div class="card ${classes}">
          <div class="card-body">a</div>
          <div class="card-body theme-danger">b</div>
        </div>`)
      const body = card.lastElementChild

      expect(top(body)).toBe(width)
      expect(getComputedStyle(body).borderTopColor).toBe(getComputedStyle(card).borderTopColor)
    })
  }

  it('should not count a hidden section', () => {
    const card = mount(`<div class="card">
        <div class="card-img-top d-none" style="height: 20px"></div>
        <div class="card-body">a</div>
        <div class="card-body" hidden>b</div>
        <div class="card-body">c</div>
      </div>`)

    expect(top(card.children[1])).toBe('0px')
    expect(top(card.children[3])).toBe('0px')
  })

  for (const dir of ['ltr', 'rtl']) {
    it(`should square the seam corners of a card group in ${dir}`, () => {
      container = document.createElement('div')
      container.className = 'contains-inline'
      container.dir = dir
      container.style.cssText = 'width: 900px;'
      container.innerHTML = `<div class="card-group">${'<div class="card"><ul class="list-group"><li class="list-group-item">x</li></ul></div>'.repeat(3)}</div>`
      document.body.append(container)
      const [first, , last] = [...container.querySelectorAll('.list-group')]
      const start = dir === 'ltr' ? 'Left' : 'Right'
      const end = dir === 'ltr' ? 'Right' : 'Left'

      expect(getComputedStyle(first)[`borderTop${end}Radius`]).toBe('0px')
      expect(getComputedStyle(first)[`borderTop${start}Radius`]).not.toBe('0px')
      expect(getComputedStyle(last)[`borderTop${start}Radius`]).toBe('0px')
      expect(getComputedStyle(last)[`borderTop${end}Radius`]).not.toBe('0px')
    })
  }
})

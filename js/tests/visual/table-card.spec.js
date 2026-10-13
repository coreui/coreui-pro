/*!
 * `.table-card` rounds and clips a table and drops the border its last row would
 * stack on the wrapper's own, with or without a responsive wrapper in between.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

const TABLE = `<table class="table">
    <thead><tr><th>#</th><th>Name</th></tr></thead>
    <tbody>
      <tr><td>1</td><td>Mark</td></tr>
      <tr><td>2</td><td>Jacob</td></tr>
    </tbody>
  </table>`

const mount = html => {
  container = document.createElement('div')
  container.style.cssText = 'width: 360px;'
  container.innerHTML = html
  document.body.append(container)
  return container.firstElementChild
}

const bottom = element => getComputedStyle(element).borderBottomWidth

afterEach(() => container?.remove())

describe('table card', () => {
  it('rounds and clips the table like a card', () => {
    const wrapper = mount(`<div class="table-card">${TABLE}</div>`)
    const card = document.createElement('div')
    card.className = 'card'
    container.append(card)
    const style = getComputedStyle(wrapper)

    expect(style.overflow).toBe('clip')
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopColor).toBe(getComputedStyle(card).borderTopColor)
    expect(style.borderTopLeftRadius).toBe(getComputedStyle(card).borderTopLeftRadius)
    expect(style.borderTopLeftRadius).not.toBe('0px')
    expect(getComputedStyle(wrapper.querySelector('.table')).marginBottom).toBe('0px')
  })

  it('takes the frame colour a card takes under a theme', () => {
    const plain = mount('<div class="table-card"></div>')
    const plainColor = getComputedStyle(plain).borderTopColor
    container.innerHTML = '<div class="theme-success"><div class="card"></div><div class="table-card"></div></div>'
    const [card, wrapper] = container.firstElementChild.children

    expect(getComputedStyle(card).borderTopColor).not.toBe(plainColor)
    expect(getComputedStyle(wrapper).borderTopColor).toBe(getComputedStyle(card).borderTopColor)
  })

  it('keeps scrolling on the responsive wrapper itself', () => {
    const wrapper = mount(`<div class="table-responsive table-card">${TABLE}</div>`)

    expect(getComputedStyle(wrapper).overflowX).toBe('auto')
  })

  for (const [name, html] of [
    ['directly', `<div class="table-card">${TABLE}</div>`],
    ['through a responsive wrapper', `<div class="table-card"><div class="table-responsive-md">${TABLE}</div></div>`],
    ['on the responsive wrapper itself', `<div class="table-responsive table-card">${TABLE}</div>`]
  ]) {
    it(`drops the last row border only, ${name}`, () => {
      const wrapper = mount(html)
      const rows = wrapper.querySelectorAll('tr')

      expect(getComputedStyle(wrapper.querySelector('.table')).marginBottom).toBe('0px')
      expect(bottom(rows[0].cells[0])).toBe('1px')
      expect(bottom(rows[1].cells[0])).toBe('1px')
      expect(bottom(rows[2].cells[0])).toBe('0px')
      expect(bottom(rows[2].cells[1])).toBe('0px')
    })
  }

  it('drops the border of the footer row when the table ends with a footer', () => {
    const wrapper = mount(`<div class="table-card"><table class="table">
        <tbody><tr><td>1</td></tr></tbody>
        <tfoot><tr><td>Total</td></tr></tfoot>
      </table></div>`)
    const [body, foot] = wrapper.querySelectorAll('td')

    expect(bottom(body)).toBe('1px')
    expect(bottom(foot)).toBe('0px')
  })

  it('drops the outer borders of a bordered table and keeps the inner ones', () => {
    const wrapper = mount(`<div class="table-card"><table class="table table-bordered">
        <thead><tr><th>#</th><th>Name</th><th>Handle</th></tr></thead>
        <tbody><tr><td>1</td><td>Mark</td><td>@mdo</td></tr></tbody>
      </table></div>`)
    const [head, body] = wrapper.querySelectorAll('tr')
    const [first, middle, last] = body.cells
    const style = (element, property) => getComputedStyle(element)[property]

    expect(style(head, 'borderTopWidth')).toBe('0px')
    expect(style(head, 'borderBottomWidth')).toBe('1px')
    expect(style(body, 'borderBottomWidth')).toBe('0px')
    expect(style(first, 'borderInlineStartWidth')).toBe('0px')
    expect(style(last, 'borderInlineEndWidth')).toBe('0px')
    expect(style(middle, 'borderInlineStartWidth')).toBe('1px')
    expect(style(middle, 'borderInlineEndWidth')).toBe('1px')
  })

  it('keeps the last row border above a caption at the bottom', () => {
    const html = classes => `<div class="table-card"><table class="${classes}">
        <caption>Users</caption>
        <tbody><tr><td>1</td></tr></tbody>
      </table></div>`

    expect(bottom(mount(html('table')).querySelector('td'))).toBe('1px')
    container.remove()
    expect(bottom(mount(html('table caption-top')).querySelector('td'))).toBe('0px')
  })

  it('leaves a table outside the wrapper alone', () => {
    const table = mount(TABLE)
    const rows = table.querySelectorAll('tr')

    expect(getComputedStyle(table).marginBottom).not.toBe('0px')
    expect(bottom(rows[2].cells[0])).toBe('1px')
  })
})

/*!
 * A long value in the combobox toggle ends with an ellipsis instead of being cut.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Combobox from '../../src/combobox.js'

const label = 'A very long option label that does not fit the toggle'
const panel = `<div class="popup combobox-popup"><div class="list-box"><div class="list-box-options" aria-label="Item"><div class="list-box-option" data-coreui-value="1">${label}</div></div></div></div>`
const toggle = '<button class="form-control combobox-toggle" type="button" style="width: 220px"></button>'

const expectLaidOut = element => {
  const value = element.querySelector('.combobox-value')
  const style = getComputedStyle(value)
  const box = element.getBoundingClientRect()
  const valueBox = value.getBoundingClientRect()
  const caret = element.querySelector('.combobox-caret').getBoundingClientRect()
  const gap = Number.parseFloat(getComputedStyle(element).columnGap)

  expect(value.scrollWidth).toBeGreaterThan(value.clientWidth)
  expect([style.display, style.overflow, style.textOverflow, style.whiteSpace]).toEqual(['block', 'hidden', 'ellipsis', 'nowrap'])
  expect(caret.left - valueBox.right).toBeCloseTo(gap, 0)
  expect(valueBox.top - box.top).toBeCloseTo(box.bottom - valueBox.bottom, 0)
  expect(caret.right).toBeLessThanOrEqual(box.right)
}

describe('Combobox value text', () => {
  let container
  let instance

  const mount = markup => {
    container = document.createElement('div')
    container.innerHTML = markup
    document.body.append(container)

    return container.querySelector('.combobox-toggle')
  }

  afterEach(() => {
    instance?.dispose()
    instance = null
    container?.remove()
  })

  it('should end a long selected value in an ellipsis and keep it beside the caret', () => {
    const element = mount(`${toggle}${panel}`)
    instance = new Combobox(element, { value: '1' })

    expect(element.querySelector('.combobox-value').textContent).toBe(label)
    expectLaidOut(element)
  })

  it('should end a long placeholder in an ellipsis and keep it beside the caret', () => {
    const element = mount(`${toggle}${panel}`)
    instance = new Combobox(element, { placeholder: label })

    expect(element.querySelector('.combobox-value')).toHaveClass('combobox-placeholder')
    expectLaidOut(element)
  })

  it('should keep the gap between an icon and the text of a value', () => {
    const element = mount('<button class="form-control combobox-toggle" type="button" style="width: 220px"><span class="combobox-value"><svg class="icon" width="16" height="16"></svg> HTML</span></button>')
    const value = element.querySelector('.combobox-value')
    const text = document.createRange()
    text.setStart(value.lastChild, 1)
    text.setEnd(value.lastChild, value.lastChild.length)

    expect(getComputedStyle(value).display).toBe('flex')
    expect(text.getBoundingClientRect().left - value.querySelector('svg').getBoundingClientRect().right).toBeCloseTo(Number.parseFloat(getComputedStyle(element).columnGap), 0)
  })
})

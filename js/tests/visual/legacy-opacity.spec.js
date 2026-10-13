/*!
 * The v5 opacity spellings live in `coreui-legacy.css`, loaded after `coreui.css`,
 * and must paint the same colour as their v6 spellings.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui-legacy.scss'

let container

const mount = html => {
  container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  return [...container.children]
}

afterEach(() => container?.remove())

describe('legacy opacity utilities', () => {
  for (const [name, property, legacy, current, plain] of [
    ['bg-opacity', 'backgroundColor', 'bg-primary bg-opacity-50', 'bg-primary bg-50', 'bg-primary'],
    ['border-opacity', 'borderTopColor', 'border border-primary border-opacity-50', 'border border-primary border-50', 'border border-primary'],
    ['text-opacity', 'color', 'text-primary text-opacity-50', 'fg-primary fg-50', 'text-primary'],
    ['link-opacity', 'color', 'link-opacity-50', 'link-50', ''],
    ['underline-opacity', 'textDecorationColor', 'underline underline-opacity-50', 'underline underline-50', 'underline']
  ]) {
    it(`paints .${name}-* like its v6 spelling`, () => {
      const [legacyElement, currentElement, plainElement] = mount(`
        <a href="#" class="${legacy}">a</a>
        <a href="#" class="${current}">b</a>
        <a href="#" class="${plain}">c</a>`)
      const value = element => getComputedStyle(element)[property]

      expect(value(legacyElement)).toBe(value(currentElement))
      expect(value(legacyElement)).not.toBe(value(plainElement))
    })
  }
})

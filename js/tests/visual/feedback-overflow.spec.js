/*!
 * A validation message with a long unbroken string wraps inside its column
 * instead of widening the .form-field grid past it.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

const ADDRESS = 'averylongemailaddresswithoutanyplacetobreaktheline@example.com'

let container

const mount = html => {
  container = document.createElement('div')
  container.style.cssText = 'position: relative; width: 220px'
  container.innerHTML = `<div class="form-field"><input class="form-control" aria-label="Email">${html}</div>`
  document.body.append(container)
  return container.querySelector('[data-test]')
}

afterEach(() => {
  container?.remove()
})

describe('validation message overflow', () => {
  for (const className of ['invalid-feedback', 'valid-feedback', 'invalid-tooltip', 'valid-tooltip']) {
    it(`should wrap a long address inside .${className}`, () => {
      const message = mount(`<div class="${className}" style="display: block" data-test>${ADDRESS} is taken</div>`)

      expect(message.scrollWidth).toBeLessThanOrEqual(message.clientWidth)
      expect(message.getBoundingClientRect().width).toBeLessThanOrEqual(220)
      expect(container.firstElementChild.scrollWidth).toBeLessThanOrEqual(220)
    })
  }
})

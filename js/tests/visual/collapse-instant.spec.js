/*!
 * A collapsible element with .collapse-instant opens and closes without a
 * transition, so shown and hidden fire right away.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Collapse from '../../src/collapse.js'

let container

const mount = classes => {
  container = document.createElement('div')
  container.innerHTML = `<div class="${classes}"><p style="height: 200px">Content</p></div>`
  document.body.append(container)
  return container.firstElementChild
}

const timeTo = (element, eventName, action) => new Promise(resolve => {
  const start = performance.now()
  element.addEventListener(eventName, () => resolve(performance.now() - start), { once: true })
  action()
})

afterEach(() => {
  container?.remove()
})

describe('collapse-instant', () => {
  it('should open and close at once with .collapse-instant', async () => {
    const element = mount('collapse collapse-instant')
    const collapse = new Collapse(element)

    expect(getComputedStyle(element).transitionDuration.split(',').every(value => Number.parseFloat(value) === 0)).toBeTrue()
    expect(await timeTo(element, 'shown.coreui.collapse', () => collapse.show())).toBeLessThan(100)
    expect(await timeTo(element, 'hidden.coreui.collapse', () => collapse.hide())).toBeLessThan(100)
  })

  it('should keep the transition without .collapse-instant', () => {
    const element = mount('collapse')

    expect(getComputedStyle(element).transitionDuration.split(',').some(value => Number.parseFloat(value) > 0)).toBeTrue()
  })
})

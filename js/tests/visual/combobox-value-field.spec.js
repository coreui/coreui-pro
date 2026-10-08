/*!
 * The value field of a combobox is hidden and laid along its toggle by the stylesheet.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Combobox from '../../src/combobox.js'

const panel = '<div class="popup combobox-popup"><div class="list-box"><div class="list-box-options" aria-label="Country"><div class="list-box-option" data-coreui-value="us">United States</div></div></div></div>'
const toggle = '<button class="form-control combobox-toggle" type="button"></button>'

let container
let instances = []

const mount = (markup, width = '420px') => {
  container = document.createElement('div')
  container.style.cssText = `padding: 1rem; width: ${width};`
  container.innerHTML = markup
  document.body.append(container)

  return container
}

const create = (element, config = {}) => {
  const instance = new Combobox(element, config)
  instances.push(instance)

  return instance
}

describe('Combobox value field', () => {
  afterEach(() => {
    for (const instance of instances) {
      instance.dispose()
    }

    instances = []
    container?.remove()
  })

  it('should hide the value field and lay it along the start of the toggle when a validation reports it', () => {
    mount(`<form><div class="form-field"><label class="form-label">Country</label>${toggle}${panel}</div></form>`)
    const element = container.querySelector('.combobox-toggle')
    const combobox = create(element, { required: true })
    const field = combobox._valueField
    const style = getComputedStyle(field)

    expect([style.position, style.opacity, style.pointerEvents]).toEqual(['absolute', '0', 'none'])

    container.querySelector('form').checkValidity()

    const fieldRect = field.getBoundingClientRect()
    const toggleRect = element.getBoundingClientRect()

    expect([fieldRect.top, fieldRect.left, fieldRect.height, fieldRect.width]).toEqual([toggleRect.top, toggleRect.left, toggleRect.height, 1])
  })

  it('should not widen the page after the layout narrows', () => {
    mount(`<form>${toggle}${panel}</form>`, '1000px')
    const element = container.querySelector('.combobox-toggle')
    const combobox = create(element, { required: true })

    container.querySelector('form').checkValidity()
    container.style.width = '300px'

    expect(combobox._valueField.getBoundingClientRect().right).toBeLessThanOrEqual(element.getBoundingClientRect().right)
    expect(document.documentElement.scrollWidth).toBe(document.documentElement.clientWidth)
  })

  it.each([
    ['starts', `<div class="input-group">${toggle}${panel}<span class="input-group-text">@</span></div>`, 'borderStartStartRadius'],
    ['ends', `<div class="input-group"><span class="input-group-text">@</span>${toggle}${panel}</div>`, 'borderEndEndRadius']
  ])('should keep the corners of a toggle that %s an input group', (_, markup, corner) => {
    mount(markup)
    const element = container.querySelector('.combobox-toggle')

    create(element)

    expect(getComputedStyle(element)[corner]).not.toBe('0px')
  })

  it('should leave a select of the page alone', () => {
    mount(`<select class="form-select" id="page"><option>One</option></select>${toggle}${panel}`)
    const page = container.querySelector('#page')

    expect(getComputedStyle(page).opacity).toBe('1')

    create(container.querySelector('.combobox-toggle')).dispose()
    instances = []

    expect(getComputedStyle(page).opacity).toBe('1')
    expect(getComputedStyle(page).position).toBe('static')
  })
})

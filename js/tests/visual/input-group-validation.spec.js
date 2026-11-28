/*!
 * Controls in an input group overlap by a border. Which border shows on the
 * shared edge is a question of stacking, so only a real browser with the
 * stylesheet can tell.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import DateRangePicker from '../../src/date-range-picker.js'

let container

const mount = (before, state, after) => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 1rem; width: 420px;'
  container.innerHTML = `<div class="input-group">
      <input class="form-control ${before}" id="before" aria-label="Before">
      <input class="form-control ${state}" id="field" aria-label="Field">
      <input class="form-control ${after}" id="after" aria-label="After">
    </div>`
  document.body.append(container)

  const field = container.querySelector('#field')
  const rect = field.getBoundingClientRect()
  const y = rect.top + (rect.height / 2)

  return {
    edges: () => [document.elementFromPoint(rect.left + 0.5, y).id, document.elementFromPoint(rect.right - 0.5, y).id],
    focus: id => container.querySelector(`#${id}`).focus()
  }
}

afterEach(() => container?.remove())

describe('input group validation', () => {
  for (const state of ['is-invalid', 'is-valid']) {
    it(`shows the border of a control marked ${state.slice(3)} on both shared edges while it has no focus`, () => {
      const { edges } = mount('', state, '')

      expect(edges()).toEqual(['field', 'field'])
    })
  }

  it('shows the border of an invalid control over a valid neighbour', () => {
    const { edges } = mount('is-valid', 'is-invalid', 'is-valid')

    expect(edges()).toEqual(['field', 'field'])
  })

  it('keeps a focused control over a neighbour in an error state', () => {
    const { edges, focus } = mount('', 'is-invalid', '')
    focus('after')

    expect(edges()).toEqual(['field', 'after'])
  })

  for (const [name, markup, focusable = '#field'] of [
    ['a select', '<select class="form-select is-invalid" id="field" aria-label="Field"><option>a</option></select>'],
    ['a floating label', '<div class="form-floating is-invalid" id="field"><input class="form-control" id="floating" placeholder="Name"><label for="floating">Name</label></div>', '#floating']
  ]) {
    it(`shows the border of ${name} in an error state on both edges, and keeps it over its neighbours once focused`, () => {
      container = document.createElement('div')
      container.style.cssText = 'padding: 1rem; width: 420px;'
      container.innerHTML = `<div class="input-group"><input class="form-control" id="before" aria-label="Before">${markup}<button class="btn btn-outline theme-secondary" id="after" type="button">Go</button></div>`
      document.body.append(container)
      const field = container.querySelector('#field')
      const rect = field.getBoundingClientRect()
      const y = rect.top + (rect.height / 2)
      const edges = () => [document.elementFromPoint(rect.left + 0.5, y).closest('[id]').id, document.elementFromPoint(rect.right - 0.5, y).closest('[id]').id]
      const owner = id => (id === 'floating' || id === 'picker' ? 'field' : id)

      expect(edges().map(owner)).toEqual(['field', 'field'])

      container.querySelector(focusable).focus()
      expect(edges().map(owner)).toEqual(['field', 'field'])
    })
  }

  it('shows the border of a date range picker given the invalid state on both edges, and keeps it over the button once focused', () => {
    container = document.createElement('div')
    container.style.cssText = 'padding: 1rem; width: 520px;'
    container.innerHTML = '<div class="input-group"><div id="field"></div><button class="btn btn-outline theme-secondary" id="after" type="button">Go</button></div>'
    document.body.append(container)
    const field = container.querySelector('#field')
    const picker = new DateRangePicker(field, { validationState: 'invalid' })
    const rect = field.getBoundingClientRect()
    const y = rect.top + (rect.height / 2)
    const right = () => document.elementFromPoint(rect.right - 0.5, y).closest('[id]').id

    expect(right()).toBe('field')

    field.querySelector('[role="spinbutton"]').focus()
    expect(field.matches(':focus-within')).toBeTrue()
    expect(right()).toBe('field')

    picker.dispose()
  })

  it('shows the border of a control the browser marks invalid on both shared edges', () => {
    container = document.createElement('div')
    container.innerHTML = '<form data-coreui-validate novalidate><div class="input-group"><input class="form-control" id="before" aria-label="Before"><input class="form-control" id="field" aria-label="Field" required><input class="form-control" id="after" aria-label="After"></div></form>'
    document.body.append(container)
    container.querySelector('form').addEventListener('submit', event => event.preventDefault())
    container.querySelector('form').requestSubmit()
    const field = container.querySelector('#field')
    const rect = field.getBoundingClientRect()
    const y = rect.top + (rect.height / 2)

    expect(field.matches(':user-invalid')).toBeTrue()
    expect([document.elementFromPoint(rect.left + 0.5, y).id, document.elementFromPoint(rect.right - 0.5, y).id]).toEqual(['field', 'field'])
  })

  it('keeps a focused control in an error state over its neighbours', () => {
    const { edges, focus } = mount('is-invalid', 'is-invalid', 'is-invalid')
    focus('field')

    expect(edges()).toEqual(['field', 'field'])
  })
})

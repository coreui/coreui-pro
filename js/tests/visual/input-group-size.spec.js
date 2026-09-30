/*!
 * A button in a sized input group takes the size from the group, not from a
 * class of its own. Only a real browser with the stylesheet can tell, which is
 * why this lives in the visual suite.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

const mount = size => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 1rem; width: 420px;'
  container.innerHTML = `<div class="input-group ${size}">
      <span class="input-group-text">@</span>
      <input type="text" class="form-control" aria-label="Name">
      <button class="btn btn-outline theme-secondary" type="button">Go</button>
    </div>
    <button class="btn btn-outline theme-secondary" type="button" id="alone">Go</button>`
  document.body.append(container)

  return {
    alone: container.querySelector('#alone'),
    button: container.querySelector('.input-group .btn'),
    field: container.querySelector('.form-control')
  }
}

afterEach(() => container?.remove())

describe('input group size', () => {
  for (const size of ['sm', 'lg']) {
    it(`sizes the button of .input-group-${size} like its field`, () => {
      const { button, field } = mount(`input-group-${size}`)

      expect(button.getBoundingClientRect().height).toBe(field.getBoundingClientRect().height)
      expect(getComputedStyle(button).fontSize).toBe(getComputedStyle(field).fontSize)
    })
  }

  it('leaves the button of .input-group-xs at the default size', () => {
    const { alone, button } = mount('input-group-xs')

    expect(button.getBoundingClientRect().height).toBe(alone.getBoundingClientRect().height)
    expect(getComputedStyle(button).fontSize).toBe(getComputedStyle(alone).fontSize)
  })
})

/*!
 * The filled part of a Range track takes the colour of the validation state,
 * like its thumb.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

const mount = (classes, wrapper = '') => {
  container = document.createElement('div')
  container.className = wrapper
  container.innerHTML = `<div class="form-range"><input type="range" class="form-range-input ${classes}" aria-label="Volume" style="--fill: var(--cui-theme-bg, var(--cui-range-track-fill-bg))"></div>`
  document.body.append(container)
  return container.querySelector('input')
}

const token = (element, name) => getComputedStyle(element).getPropertyValue(name).trim()
const fill = input => token(input, '--fill')

afterEach(() => {
  container?.remove()
})

describe('Range fill in a validation state', () => {
  it('should fill an invalid range with the danger colour', () => {
    const input = mount('is-invalid')

    expect(fill(input)).toBe(token(input, '--cui-danger-bg'))
  })

  it('should fill an invalid range with the danger colour inside a theme', () => {
    const input = mount('is-invalid', 'theme-success')

    expect(fill(input)).toBe(token(input, '--cui-danger-bg'))
  })

  it('should fill a valid range with the success colour', () => {
    const input = mount('is-valid')

    expect(fill(input)).toBe(token(input, '--cui-success-bg'))
  })

  it('should fill a range without a state with the primary colour', () => {
    const input = mount('')

    expect(fill(input)).toBe(token(input, '--cui-primary-base'))
  })
})

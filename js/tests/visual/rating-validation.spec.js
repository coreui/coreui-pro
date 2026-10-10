/*!
 * A rating with a validation state colours its empty stars and its focus ring
 * with the state's theme. The rule lives in the forms layer and the rating's
 * own tokens in the components layer, which only a real browser with the
 * stylesheet can settle.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { userEvent } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Rating from '../../src/rating.js'

let container
let rating

const mount = (validationState, className = '') => {
  container = document.createElement('div')
  container.innerHTML = `<div class="${className}"></div>`
  document.body.append(container)
  rating = new Rating(container.firstElementChild, { validationState })

  return container.querySelector('.rating-item-label')
}

const colourOf = value => {
  const probe = document.createElement('span')
  probe.style.color = value
  container.append(probe)
  const colour = getComputedStyle(probe).color
  probe.remove()
  return colour
}

describe('rating validation', () => {
  afterEach(() => {
    rating?.dispose()
    rating = null
    container?.remove()
  })

  it('colours the empty stars with the theme of a given state', () => {
    for (const [state, theme] of [['invalid', 'danger'], ['valid', 'success']]) {
      const label = mount(state)

      expect(getComputedStyle(label).color).toEqual(colourOf(`var(--cui-${theme}-fg)`))

      rating.dispose()
      container.remove()
    }
  })

  it('draws the focus ring in the colour of the state, also on a themed rating', async () => {
    const label = mount('invalid', 'theme-success')

    await userEvent.keyboard('{Tab}')

    expect(document.activeElement).toBe(label.closest('.rating-item').querySelector('.rating-item-input'))
    expect(getComputedStyle(label.closest('.rating-item')).outlineColor).toEqual(colourOf('var(--cui-danger-focus-ring)'))
  })

  it('keeps the empty stars in the rating colour without a state', () => {
    const label = mount(null)

    expect(getComputedStyle(label).color).toEqual(colourOf('var(--cui-fg-3)'))
  })
})

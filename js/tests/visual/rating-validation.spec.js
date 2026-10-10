/*!
 * A rating with a validation state draws its focus ring in the state's theme,
 * also over a theme of its own, and keeps the colours of its stars. The rule
 * lives in the forms layer and the rating's own tokens in the components
 * layer, which only a real browser with the stylesheet can settle.
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

  it('keeps the colours of the stars under a given state', () => {
    for (const state of ['invalid', 'valid']) {
      const label = mount(state)

      expect(getComputedStyle(label).color).toEqual(colourOf('var(--cui-fg-3)'))

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
})

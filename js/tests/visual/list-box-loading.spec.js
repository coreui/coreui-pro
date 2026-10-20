/*!
 * A list box that waits for its options keeps them usable and says it is loading below them.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { userEvent } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import ListBox from '../../src/list-box.js'

describe('ListBox while loading', () => {
  let container

  afterEach(() => {
    container.remove()
  })

  it('should keep the options as they are, show the loading row and still take a click', async () => {
    container = document.createElement('div')
    container.innerHTML = [
      '<div class="list-box">',
      '<div class="list-box-options" aria-label="Sandwich">',
      '<div class="list-box-option" data-coreui-value="lettuce">Lettuce</div>',
      '<div class="list-box-option" data-coreui-value="tomato">Tomato</div>',
      '</div>',
      '</div>'
    ].join('')
    document.body.append(container)

    const listBox = new ListBox(container.firstElementChild, { loading: true, selectionMode: 'multiple' })
    const options = container.querySelector('.list-box-options')

    const region = container.querySelector('.list-box-loading')

    expect(Number(getComputedStyle(options).opacity)).toEqual(1)
    expect(region.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(region.getBoundingClientRect().top).toBeGreaterThanOrEqual(options.getBoundingClientRect().bottom)

    const option = container.querySelector('[data-coreui-value="lettuce"]')
    const optionStart = option.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(option).paddingLeft)

    expect(region.querySelector('.spinner-border').getBoundingClientRect().left).toBeCloseTo(optionStart, 0)

    await userEvent.click(container.querySelector('[data-coreui-value="tomato"]'))

    expect(listBox.getSelectedValues()).toEqual(['tomato'])
  })

  it('should take no room for the loading row while the list does not load', () => {
    container = document.createElement('div')
    container.innerHTML = '<div class="list-box"><div class="list-box-options" aria-label="Sandwich"><div class="list-box-option" data-coreui-value="lettuce">Lettuce</div></div></div>'
    document.body.append(container)

    new ListBox(container.firstElementChild)

    expect(container.querySelector('.list-box-loading').getBoundingClientRect().height).toEqual(0)
  })
})

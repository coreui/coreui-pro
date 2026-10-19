/*!
 * A list box that waits for its options dims them and keeps them usable by pointer.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { userEvent } from '@vitest/browser/context'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import ListBox from '../../src/list-box.js'

describe('ListBox while loading', () => {
  let container

  afterEach(() => {
    container.remove()
  })

  it('should dim the options and still take a click on one', async () => {
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

    expect(Number(getComputedStyle(options).opacity)).toBeLessThan(1)

    await userEvent.click(container.querySelector('[data-coreui-value="tomato"]'))

    expect(listBox.getSelectedValues()).toEqual(['tomato'])
  })
})

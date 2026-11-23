/*!
 * An option with highlighted matches stays on one line.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Autocomplete from '../../src/autocomplete.js'

describe('Autocomplete highlight', () => {
  let autocomplete
  let container

  afterEach(() => {
    autocomplete?.dispose()
    container?.remove()
  })

  it('should keep a label with several matches on one line', () => {
    container = document.createElement('div')
    container.style.width = '600px'
    document.body.append(container)

    autocomplete = new Autocomplete(container, {
      highlightOptionsOnSearch: true,
      options: ['Angular', 'Bootstrap']
    })

    autocomplete.show()
    autocomplete.search('a')

    const options = [...container.ownerDocument.querySelectorAll('.list-box-option:not([hidden])')]

    expect(options.map(option => option.innerHTML)).toEqual([
      '<span><strong>A</strong>ngul<strong>a</strong>r</span>',
      '<span>Bootstr<strong>a</strong>p</span>'
    ])

    for (const option of options) {
      const style = getComputedStyle(option)
      const contentHeight = option.getBoundingClientRect().height - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom)

      expect(contentHeight).toBeCloseTo(Number.parseFloat(style.lineHeight), 0)
    }
  })
})

/*!
 * A popup panel shown from its first style fades in unless it carries `.popup-instant`.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

describe('Popup', () => {
  let panel

  const insert = className => {
    panel = document.createElement('div')
    panel.className = className
    panel.textContent = 'Panel'
    document.body.append(panel)
    return panel
  }

  afterEach(() => {
    panel.remove()
  })

  it('should fade in a panel shown from its first style', () => {
    insert('popup show')

    expect(panel.getAnimations().length).toBeGreaterThan(0)
  })

  it('should show a panel with .popup-instant at once, and start no fade when the class goes', async () => {
    insert('popup show popup-instant')

    expect(panel.getAnimations()).toEqual([])
    expect(getComputedStyle(panel).opacity).toEqual('1')

    await new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    })
    panel.classList.remove('popup-instant')

    expect(panel.getAnimations()).toEqual([])
    expect(getComputedStyle(panel).opacity).toEqual('1')
  })

  it('should show a panel at once when .popup-instant comes before .show on a panel whose style was already computed', () => {
    insert('popup')
    expect(getComputedStyle(panel).opacity).toEqual('0')

    panel.classList.add('popup-instant', 'show')
    panel.tabIndex = -1
    panel.focus()

    expect(panel.getAnimations()).toEqual([])
    expect(getComputedStyle(panel).opacity).toEqual('1')
  })
})

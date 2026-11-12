/*!
 * A plain link and a pill carry a transparent border like a tab, so every nav
 * variant draws its links at one height. Only a real browser with the
 * stylesheet can tell, which is why this lives in the visual suite.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

afterEach(() => container?.remove())

describe('nav height', () => {
  it('should draw the links of every nav variant at one height', () => {
    container = document.createElement('div')
    container.innerHTML = ['', 'nav-pills', 'nav-tabs', 'nav-underline', 'nav-underline-border']
      .map(variant => `<ul class="nav ${variant}"><li class="nav-item"><a class="nav-link active" href="#">Link</a></li></ul>`)
      .join('')
    document.body.append(container)

    const heights = [...container.querySelectorAll('.nav-link')].map(link => link.getBoundingClientRect().height)

    expect(new Set(heights).size).toBe(1)
  })

  it('should take the global border width by default', () => {
    container = document.createElement('div')
    container.innerHTML = '<div style="--cui-border-width: 2px"><ul class="nav"><li class="nav-item"><a class="nav-link" href="#">Link</a></li></ul></div>'
    document.body.append(container)

    expect(getComputedStyle(container.querySelector('.nav-link')).borderTopWidth).toBe('2px')
  })

  it('should leave the header and sidebar links without the border', () => {
    container = document.createElement('div')
    container.innerHTML = '<ul class="header-nav"><li class="nav-item"><a class="nav-link" href="#" id="header">Link</a></li></ul><ul class="sidebar-nav"><li class="nav-item"><a class="nav-link" href="#" id="sidebar">Link</a></li></ul>'
    document.body.append(container)

    expect(getComputedStyle(container.querySelector('#header')).borderTopWidth).toBe('0px')
    expect(getComputedStyle(container.querySelector('#sidebar')).borderTopWidth).toBe('0px')
  })

  it('should keep a navbar as tall with links as with the brand alone', () => {
    container = document.createElement('div')
    container.innerHTML = '<nav class="navbar navbar-expand" id="links"><div class="container-fluid"><a class="navbar-brand" href="#">Brand</a><ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="#">Link</a></li></ul></div></nav><nav class="navbar" id="brand"><div class="container-fluid"><a class="navbar-brand" href="#">Brand</a></div></nav><nav class="navbar" id="text"><div class="container-fluid"><span class="navbar-text">Text</span></div></nav>'
    document.body.append(container)

    const height = selector => container.querySelector(selector).getBoundingClientRect().height

    expect(height('#links')).toBe(height('#brand'))
    expect(height('#text')).toBe(height('#brand'))
    expect(height('#links .navbar-brand')).toBe(height('#links .nav-link'))
  })

  it('should take the border width from the nav link token', () => {
    container = document.createElement('div')
    container.innerHTML = '<ul class="nav" style="--cui-nav-link-border-width: 3px"><li class="nav-item"><a class="nav-link" href="#">Link</a></li></ul>'
    document.body.append(container)

    expect(getComputedStyle(container.querySelector('.nav-link')).borderTopWidth).toBe('3px')
  })
})

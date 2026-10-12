/*!
 * The dark navbar derives its text colors from `--cui-white` in the browser, so
 * overriding the token reaches every one of them. Only a real browser with the
 * stylesheet can tell, which is why this lives in the visual suite.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

const mount = html => {
  container = document.createElement('div')
  container.style.cssText = '--cui-white: rgb(255, 215, 0);'
  container.innerHTML = `${html}<span id="expected" style="color: color-mix(in oklch, rgb(255, 215, 0) 55%, transparent)"></span>`
  document.body.append(container)
}

const color = selector => getComputedStyle(container.querySelector(selector)).color

afterEach(() => container?.remove())

describe('navbar dark', () => {
  for (const attributes of ['class="navbar navbar-dark"', 'class="navbar" data-coreui-theme="dark"']) {
    it(`should derive the text colors from --cui-white with ${attributes}`, () => {
      mount(`<nav ${attributes}>
          <ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="#">Link</a></li></ul>
          <span class="navbar-text">Text</span>
          <button class="navbar-toggler" type="button"><span class="navbar-toggler-icon"></span></button>
        </nav>`)

      expect(color('.nav-link')).toBe(color('#expected'))
      expect(color('.navbar-text')).toBe(color('#expected'))
      expect(color('.navbar-toggler')).toBe(color('#expected'))
    })
  }
})

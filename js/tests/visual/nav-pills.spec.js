/*!
 * Nav pills carry a fixed radius large enough to keep a wrapped label fully
 * round, and a page that squares its radius scale leaves them alone. Only a
 * real browser with the stylesheet can tell, which is why this lives in the
 * visual suite.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

const mount = () => {
  container = document.createElement('div')
  container.innerHTML = `<ul class="nav nav-pills" style="width: 120px">
      <li class="nav-item"><a class="nav-link active" href="#" id="pill">Two line pill label</a></li>
    </ul>`
  document.body.append(container)
  return container.querySelector('#pill')
}

const radius = element => Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)

afterEach(() => {
  container?.remove()
  document.documentElement.style.removeProperty('--cui-radius')
})

describe('nav pills', () => {
  it('should keep a pill whose label wraps fully round', () => {
    const pill = mount()
    const { height } = pill.getBoundingClientRect()

    expect(height).toBeGreaterThan(48)
    expect(radius(pill)).toBeGreaterThanOrEqual(height / 2)
  })

  it('should keep the pill radius when the page squares its radius scale', () => {
    document.documentElement.style.setProperty('--cui-radius', '0px')

    expect(radius(mount())).toBe(48)
  })
})

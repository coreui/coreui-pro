/*!
 * A placeholder takes the shape of the text it stands in for, and a component
 * that takes `.placeholder` as a modifier keeps its own. Only a real browser
 * with the stylesheet can tell, which is why this lives in the visual suite.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

const mount = html => {
  container = document.createElement('div')
  container.style.cssText = 'width: 600px;'
  container.innerHTML = html
  document.body.append(container)
}

const height = selector => container.querySelector(selector).getBoundingClientRect().height
const style = selector => getComputedStyle(container.querySelector(selector))

afterEach(() => container?.remove())

describe('placeholder', () => {
  for (const tag of ['h1', 'h5', 'p']) {
    it(`should keep the height of a ${tag} line`, () => {
      mount(`<${tag} id="text">Title</${tag}><${tag} id="skeleton"><span class="placeholder col-6"></span></${tag}>`)

      expect(height('#skeleton')).toBe(height('#text'))
    })
  }

  it('should round a placeholder bar', () => {
    mount('<span class="placeholder col-6"></span>')

    expect(style('.placeholder').borderTopLeftRadius).toBe('4px')
  })

  it('should leave the height and corners to a component it modifies', () => {
    mount(`<a class="btn-solid theme-primary" id="button">Go</a>
      <a class="btn-solid theme-primary disabled placeholder col-4" id="skeleton" aria-disabled="true"></a>
      <span class="avatar" id="avatar">AB</span>
      <span class="avatar placeholder" id="avatar-skeleton"></span>`)

    expect(height('#skeleton')).toBe(height('#button'))
    expect(style('#skeleton').borderTopLeftRadius).toBe(style('#button').borderTopLeftRadius)
    expect(style('#avatar-skeleton').borderTopLeftRadius).toBe(style('#avatar').borderTopLeftRadius)
  })

  it('should run the pulse under both class names', () => {
    mount(`<p class="placeholder-pulse"><span class="placeholder col-6" id="pulse"></span></p>
      <p class="placeholder-glow"><span class="placeholder col-6" id="glow"></span></p>`)

    expect(style('#pulse').animationName).toBe('placeholder-pulse')
    expect(style('#glow').animationName).toBe('placeholder-pulse')
  })
})

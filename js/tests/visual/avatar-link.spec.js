/*!
 * An avatar used as a link carries no link underline.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { userEvent } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

const mount = html => {
  container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)
  return container.firstElementChild
}

const decoration = element => getComputedStyle(element).textDecorationLine

afterEach(() => {
  container?.remove()
  document.documentElement.style.removeProperty('--cui-link-hover-decoration')
})

describe('avatar link', () => {
  for (const classes of ['theme-primary', 'avatar-subtle theme-primary']) {
    it(`should not underline an avatar link with initials and .${classes.replaceAll(' ', ' .')}`, () => {
      expect(decoration(mount(`<a class="avatar ${classes}" href="#">CU</a>`))).toBe('none')
    })
  }

  it('should not underline an avatar link with an image', () => {
    const avatar = mount('<a class="avatar" href="#"><img class="avatar-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="CU"></a>')

    expect(decoration(avatar)).toBe('none')
  })

  it('should not underline an avatar link on hover when links underline only on hover', async () => {
    document.documentElement.style.setProperty('--cui-link-hover-decoration', 'underline')
    const avatar = mount('<a class="avatar theme-primary" href="#">CU</a>')

    await userEvent.hover(avatar)

    expect(avatar.matches(':hover')).toBeTrue()
    expect(decoration(avatar)).toBe('none')
  })

  it('should let a text decoration utility underline an avatar link', () => {
    expect(decoration(mount('<a class="avatar theme-primary text-decoration-underline" href="#">CU</a>'))).toBe('underline')
  })
})

/*!
 * A menu that follows a button in an input group is left out of the rounding rules.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

const menu = '<div class="menu"><a class="menu-item" href="#">Action</a></div>'

let container

const mount = html => {
  container = document.createElement('div')
  container.innerHTML = `<div class="input-group">${html}</div>`
  document.body.append(container)
}

const corners = selector => {
  const style = getComputedStyle(container.querySelector(selector))
  return [style.borderStartStartRadius, style.borderStartEndRadius, style.borderEndEndRadius, style.borderEndStartRadius].map(value => value !== '0px')
}

afterEach(() => {
  container?.remove()
})

describe('input group with a menu', () => {
  it('should keep the outer corners of a menu toggle followed by its menu at the end', () => {
    mount(`<input type="text" class="form-control" aria-label="Name"><button class="btn-outline theme-secondary" type="button" data-coreui-toggle="menu" id="toggle">Menu</button>${menu}`)

    expect(corners('#toggle')).toEqual([false, true, true, false])
  })

  it('should keep the outer corners of a split toggle followed by its menu at the end', () => {
    mount(`<input type="text" class="form-control" aria-label="Name"><button class="btn-outline theme-secondary" type="button" id="action">Action</button><button class="btn-outline theme-secondary menu-toggle-split" type="button" data-coreui-toggle="menu" id="toggle">More</button>${menu}`)

    expect(corners('#action')).toEqual([false, false, false, false])
    expect(corners('#toggle')).toEqual([false, true, true, false])
  })

  it('should square the end corners of a split toggle whose menu is followed by a field', () => {
    mount(`<button class="btn-outline theme-secondary" type="button" id="action">Action</button><button class="btn-outline theme-secondary menu-toggle-split" type="button" data-coreui-toggle="menu" id="toggle">More</button>${menu}<input type="text" class="form-control" aria-label="Name">`)

    expect(corners('#toggle')).toEqual([false, false, false, false])
  })

  it('should square the end corners of a split toggle while its menu is moved out of the group', () => {
    mount('<button class="btn-outline theme-secondary" type="button" id="action">Action</button><button class="btn-outline theme-secondary menu-toggle-split" type="button" data-coreui-toggle="menu" id="toggle">More</button><input type="text" class="form-control" aria-label="Name">')

    expect(corners('#toggle')).toEqual([false, false, false, false])
  })

  it('should keep every corner of the menu in the group', () => {
    mount(`<input type="text" class="form-control" aria-label="Name"><button class="btn-outline theme-secondary" type="button" data-coreui-toggle="menu">Menu</button>${menu.replace('class="menu"', 'class="menu show" id="panel"')}<input type="text" class="form-control" aria-label="Other">`)

    expect(corners('#panel')).toEqual([true, true, true, true])
  })

  it('should square the inner corners of a menu toggle at the start', () => {
    mount(`<button class="btn-outline theme-secondary" type="button" data-coreui-toggle="menu" id="toggle">Menu</button>${menu}<input type="text" class="form-control" aria-label="Name" id="field">`)

    expect(corners('#toggle')).toEqual([true, false, false, true])
    expect(corners('#field')).toEqual([false, true, true, false])
  })
})

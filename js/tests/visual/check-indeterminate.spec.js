/*!
 * An indeterminate checkbox takes the colors of a checked one: the theme, a
 * token set on the field, the validation state, the highlighted card and the
 * list box indicator; the mark of a checkbox and a radio takes the contrast
 * color of the theme. Only the stylesheet decides it, so only a real browser
 * with it can tell.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

const CASES = [
  ['with no theme', '<input type="checkbox" class="check" id="field">'],
  ['with a theme on the field', '<input type="checkbox" class="check theme-success" id="field">'],
  ['in a themed container', '<div class="theme-danger"><input type="checkbox" class="check" id="field"></div>'],
  ['with the checked token set on the field', '<input type="checkbox" class="check" id="field" style="--cui-check-checked-bg: rgb(1, 2, 3); --cui-check-checked-border-color: rgb(4, 5, 6)">'],
  ['in an invalid state', '<input type="checkbox" class="check is-invalid" id="field">'],
  ['in an invalid state in a themed container', '<div class="theme-success"><input type="checkbox" class="check is-invalid" id="field"></div>']
]

const MARKS = [
  ['a checkbox with a light theme on the field', '<input type="checkbox" class="check theme-warning" id="field">', '--cui-warning-contrast'],
  ['a checkbox in a light themed container', '<div class="theme-secondary"><input type="checkbox" class="check" id="field"></div>', '--cui-secondary-contrast'],
  ['a checkbox in a table variant', '<table class="table table-warning"><tbody><tr><td><input type="checkbox" class="check" id="field"></td></tr></tbody></table>', '--cui-warning-contrast'],
  ['an invalid checkbox in a light themed container', '<div class="theme-warning"><input type="checkbox" class="check is-invalid" id="field"></div>', '--cui-danger-contrast'],
  ['a radio with a light theme on the field', '<input type="radio" class="radio theme-warning" id="field">', '--cui-warning-contrast'],
  ['an invalid radio in a light themed container', '<div class="theme-warning"><input type="radio" class="radio is-invalid" id="field"></div>', '--cui-danger-contrast']
]

let host

beforeAll(() => {
  const style = document.createElement('style')
  style.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'
  document.head.append(style)
})

const mount = html => {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  return host
}

const resolve = variable => {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${variable})`
  host.append(probe)
  return getComputedStyle(probe).backgroundColor
}

const colors = element => {
  const style = getComputedStyle(element)
  return [style.backgroundColor, style.borderTopColor]
}

afterEach(() => {
  host?.remove()
  host = null
})

describe('indeterminate checkbox', () => {
  it.each(CASES)('looks checked %s', (_, html) => {
    const field = mount(html).querySelector('#field')
    field.checked = true
    const checked = colors(field)

    field.checked = false
    field.indeterminate = true

    expect(colors(field)).toEqual(checked)
  })

  it('keeps its own colors when the indeterminate tokens are set on the field', () => {
    const field = mount('<input type="checkbox" class="check" id="field" style="--cui-check-indeterminate-bg: rgb(1, 2, 3); --cui-check-indeterminate-border-color: rgb(4, 5, 6)">').querySelector('#field')
    field.indeterminate = true

    expect(colors(field)).toEqual(['rgb(1, 2, 3)', 'rgb(4, 5, 6)'])
  })

  it.each(MARKS)('draws the mark of %s in the contrast color', (_, html, variable) => {
    const field = mount(html).querySelector('#field')
    field.checked = true

    expect(getComputedStyle(field, '::before').backgroundColor).toEqual(resolve(variable))

    if (field.type === 'checkbox') {
      field.checked = false
      field.indeterminate = true

      expect(getComputedStyle(field, '::before').backgroundColor).toEqual(resolve(variable))
    }
  })

  it('highlights its card like a checked one', () => {
    const card = mount('<div class="form-field form-field-card"><input type="checkbox" class="check" id="field"><label for="field">Label</label></div>').firstElementChild
    const field = card.querySelector('#field')
    field.checked = true
    const checked = getComputedStyle(card).backgroundColor

    field.checked = false
    field.indeterminate = true

    expect(getComputedStyle(card).backgroundColor).toEqual(checked)
    expect(checked).not.toEqual('rgba(0, 0, 0, 0)')
  })

  it('draws a list box indicator in the theme like a selected one', () => {
    mount([
      '<div class="list-box theme-success">',
      '  <div class="list-box-option selected" id="selected"><span class="check list-box-option-indicator"></span>One</div>',
      '  <div class="list-box-option indeterminate" id="indeterminate"><span class="check list-box-option-indicator"></span>Two</div>',
      '</div>'
    ].join(''))

    expect(colors(host.querySelector('#indeterminate > .list-box-option-indicator'))).toEqual(colors(host.querySelector('#selected > .list-box-option-indicator')))
  })

  it('leaves the cards of a radio group with nothing checked unhighlighted', () => {
    mount([
      '<div class="form-field form-field-card" id="first"><input type="radio" class="radio" name="group" id="a"><label for="a">A</label></div>',
      '<div class="form-field form-field-card"><input type="radio" class="radio" name="group" id="b"><label for="b">B</label></div>'
    ].join(''))

    expect(getComputedStyle(host.querySelector('#first')).backgroundColor).toEqual('rgba(0, 0, 0, 0)')
  })
})

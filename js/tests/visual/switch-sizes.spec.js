/*!
 * Every switch size centers its track on the first line of the label beside
 * it, whose font size the size sets, and a sized switch with no label stays
 * centered on the line it sits in. Only the stylesheet decides it, so only a
 * real browser with it can tell.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let host

const mount = (html, style = '') => {
  host = document.createElement('div')
  host.style.cssText = style
  host.innerHTML = html
  document.body.append(host)
  return host.querySelector('#field')
}

const center = rect => rect.top + (rect.height / 2)

const firstLineCenter = element => element.getBoundingClientRect().top + (Number.parseFloat(getComputedStyle(element).lineHeight) / 2)

const labelled = (size, text = 'Label text') => `<div class="form-field"><input type="checkbox" class="switch${size ? ` switch-${size}` : ''}" id="field"><label for="field">${text}</label></div>`

afterEach(() => {
  host?.remove()
  host = null
})

describe('switch sizes', () => {
  it.each(['', 'sm', 'lg', 'xl'])('centers the %s track on the first line of its label', size => {
    const field = mount(labelled(size))

    expect(center(field.getBoundingClientRect())).toBeCloseTo(firstLineCenter(host.querySelector('label')), 0)
  })

  it.each(['sm', 'lg', 'xl'])('centers the %s track on the first line of a label that wraps', size => {
    const field = mount(labelled(size, 'A label long enough to wrap onto a second line'), 'width: 160px')
    const label = host.querySelector('label')

    expect(label.getBoundingClientRect().height).toBeGreaterThan(Number.parseFloat(getComputedStyle(label).lineHeight) * 1.5)
    expect(center(field.getBoundingClientRect())).toBeCloseTo(firstLineCenter(label), 0)
  })

  it('follows a font size token the page sets', () => {
    const field = mount(labelled('lg'), '--cui-font-size-lg: 2rem')

    expect(center(field.getBoundingClientRect())).toBeCloseTo(firstLineCenter(host.querySelector('label')), 0)
  })

  it.each(['sm', 'lg', 'xl'])('centers a %s switch with no label on the line it sits in', size => {
    const field = mount(`<p id="line">Notifications <input type="checkbox" class="switch switch-${size}" role="switch" aria-label="Notifications" id="field"></p>`)

    expect(center(field.getBoundingClientRect())).toBeCloseTo(firstLineCenter(host.querySelector('#line')), 0)
  })
})

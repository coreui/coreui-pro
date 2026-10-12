/*!
 * Every component reads the theme slot on the property and falls back to its own
 * token, so a theme class wins over a component token, while variants and
 * validation states re-declare what they paint. Only a real browser with the
 * stylesheet can tell, which is why this lives in the visual suite.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { userEvent } from '@vitest/browser/context'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

const PINK = 'rgb(255, 192, 203)'

let container

const mount = (html, css = '') => {
  container = document.createElement('div')
  container.innerHTML = `<style>*, ::before, ::after { transition: none !important; } ${css}</style>${html}`
  document.body.append(container)
}

const style = selector => getComputedStyle(container.querySelector(selector))
const resolve = (className, value) => {
  const probe = document.createElement('span')
  probe.className = className
  probe.style.color = value
  container.append(probe)
  return getComputedStyle(probe).color
}

const slot = (theme, name) => resolve(theme, `var(--cui-theme-${name})`)
const paint = (selector, properties) => properties.map(property => style(selector)[property])

afterEach(() => container?.remove())

describe('theme slots', () => {
  for (const [name, html, target, token, property] of [
    ['alert', '<div class="alert THEME" TOKEN>a</div>', '.alert', 'alert-bg', 'backgroundColor'],
    ['avatar', '<span class="avatar THEME" TOKEN>AB</span>', '.avatar', 'avatar-bg', 'backgroundColor'],
    ['badge', '<span class="badge THEME" TOKEN>b</span>', '.badge', 'badge-bg', 'backgroundColor'],
    ['callout', '<div class="callout THEME" TOKEN>c</div>', '.callout', 'callout-border-left-color', 'borderInlineStartColor'],
    ['chip', '<span class="chip THEME" TOKEN>c</span>', '.chip', 'chip-bg', 'backgroundColor'],
    ['checkbox', '<input class="check THEME" type="checkbox" checked TOKEN>', '.check', 'check-checked-bg', 'backgroundColor'],
    ['radio', '<input class="radio THEME" type="radio" checked TOKEN>', '.radio', 'radio-checked-bg', 'backgroundColor'],
    ['switch', '<input class="switch THEME" type="checkbox" checked TOKEN>', '.switch', 'switch-checked-bg', 'backgroundColor'],
    ['list box indicator', '<div class="list-box THEME" data-coreui-indicator="checkbox"><div class="list-box-option selected"><span class="list-box-option-indicator check" TOKEN></span>x</div></div>', '.list-box-option-indicator', 'check-checked-bg', 'backgroundColor'],
    ['sidebar', '<div class="sidebar THEME" TOKEN>s</div>', '.sidebar', 'sidebar-bg', 'backgroundColor'],
    ['tooltip', '<div class="tooltip show THEME" TOKEN><div class="tooltip-inner">t</div></div>', '.tooltip-inner', 'tooltip-bg', 'backgroundColor']
  ]) {
    const render = (theme, withToken) => {
      mount(html.replace('THEME', theme).replace('TOKEN', withToken ? `style="--cui-${token}: ${PINK}"` : ''))
      const value = style(target)[property]
      container.remove()
      return value
    }

    it(`should let the theme win over the ${name} token on the element`, () => {
      expect(render('', true)).not.toBe(render('', false))
      expect(render('theme-danger', true)).toBe(render('theme-danger', false))
    })
  }

  it('should keep the theme on a themed alert when the token is set for the whole page', () => {
    mount('<div class="alert" id="plain">a</div><div class="alert theme-danger" id="themed">a</div>', `.alert { --cui-alert-bg: ${PINK}; }`)

    expect(style('#plain').backgroundColor).toBe(PINK)
    expect(style('#themed').backgroundColor).toBe(slot('theme-danger', 'bg-subtle'))
  })

  it('should recolour a themed alert through the slot', () => {
    mount(`<div class="alert theme-danger" id="el" style="--cui-theme-bg-subtle: ${PINK}">a</div>`)

    expect(style('#el').backgroundColor).toBe(PINK)
  })

  it('should paint a variant with its own slots under a theme', () => {
    mount(`<div class="alert alert-solid theme-danger" id="alert">a</div>
      <span class="badge badge-subtle theme-danger" id="badge">b</span>
      <span class="avatar avatar-subtle theme-danger" id="avatar">AB</span>
      <span class="chip chip-outline theme-danger" id="chip">c</span>`)
    const properties = ['color', 'backgroundColor', 'borderTopColor']

    expect(paint('#alert', properties)).toEqual([slot('theme-danger', 'contrast'), slot('theme-danger', 'bg'), slot('theme-danger', 'bg')])
    expect(paint('#badge', properties)).toEqual([slot('theme-danger', 'fg'), slot('theme-danger', 'bg-subtle'), 'rgba(0, 0, 0, 0)'])
    expect(paint('#avatar', ['color', 'backgroundColor'])).toEqual([slot('theme-danger', 'fg'), slot('theme-danger', 'bg-subtle')])
    expect(paint('#chip', properties)).toEqual([slot('theme-danger', 'fg'), 'rgba(0, 0, 0, 0)', slot('theme-danger', 'bg')])
  })

  it('should hover an outline chip with its own slots under a theme', async () => {
    mount('<span class="chip chip-outline chip-clickable theme-danger" id="chip">c</span>')
    await userEvent.hover(container.querySelector('#chip'))

    expect(paint('#chip', ['color', 'backgroundColor', 'borderTopColor'])).toEqual([slot('theme-danger', 'fg-emphasis'), slot('theme-danger', 'bg-subtle'), slot('theme-danger', 'bg')])
  })

  for (const control of ['check', 'radio', 'switch']) {
    for (const [state, theme] of [['is-invalid', 'theme-danger'], ['is-valid', 'theme-success']]) {
      it(`should keep a ${control} with .${state} in its state colour inside a form of another theme`, () => {
        mount(`<div class="theme-primary"><input class="${control} ${state}" type="${control === 'radio' ? 'radio' : 'checkbox'}" checked id="el"></div>`)

        expect(paint('#el', ['backgroundColor', 'borderTopColor'])).toEqual([slot(theme, 'bg'), slot(theme, 'bg')])
      })
    }
  }

  it('should draw the rule in an alert in the alert border colour', () => {
    mount(`<div class="alert" id="plain" style="--cui-alert-border-color: ${PINK}">a<hr></div>`)

    expect(style('#plain hr').borderTopColor).toBe(PINK)
  })

  it('should keep the rule visible in a solid alert', () => {
    mount(`<div class="alert alert-solid theme-danger" id="themed">a<hr></div>
      <div class="alert alert-solid" id="plain">a<hr></div>
      <div class="alert alert-solid" id="brand" style="--cui-theme-bg: #6f42c1; --cui-theme-contrast: #fff">a<hr></div>`)

    expect(style('#themed hr').borderTopColor).toBe(slot('theme-danger', 'border'))
    expect(style('#plain hr').borderTopStyle).toBe('solid')
    expect(style('#brand hr').borderTopColor).toBe(style('#brand').color)
  })

  it('should round an alert with the seventh radius stop', () => {
    mount('<div class="alert" id="alert">a</div><div id="stop" style="border-radius: var(--cui-radius-7)"></div>')

    expect(style('#alert').borderTopLeftRadius).toBe(style('#stop').borderTopLeftRadius)
  })

  it('should tint the active step indicator with a theme on the step', () => {
    mount(`<div class="stepper"><ol class="stepper-steps"><li class="stepper-step">
      <button type="button" class="stepper-step-button active theme-danger"><span class="stepper-step-indicator" id="el">1</span></button>
      </li></ol></div>`)

    expect(style('#el').backgroundColor).toBe(resolve('theme-danger', 'color-mix(in oklch, var(--cui-theme-bg) 5%, transparent)'))
  })
})

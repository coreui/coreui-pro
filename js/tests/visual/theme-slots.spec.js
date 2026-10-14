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
const declared = (selector, property) => {
  const walk = rules => {
    for (const rule of rules) {
      if (rule.selectorText?.split(',').some(part => part.trim() === selector) && rule.style.getPropertyValue(property)) {
        return rule.style.getPropertyValue(property)
      }

      const found = rule.cssRules && walk(rule.cssRules)
      if (found) {
        return found
      }
    }
  }

  return [...document.styleSheets].map(sheet => walk(sheet.cssRules)).find(Boolean)
}

const firstColorMix = value => {
  const start = value.indexOf('color-mix(')
  let depth = 0
  for (let index = start; index < value.length; index++) {
    depth += { '(': 1, ')': -1 }[value[index]] ?? 0
    if (depth === 0 && value[index] === ')') {
      return value.slice(start, index + 1)
    }
  }
}

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

  for (const [name, pseudo, property, token, color] of [
    ['range thumb', '::-webkit-slider-thumb', 'background-color', 'range-thumb-bg', value => value],
    ['range fill', '::-webkit-slider-runnable-track', 'background-image', 'range-track-fill-bg', firstColorMix]
  ]) {
    it(`should let the theme win over the ${name} token`, () => {
      const value = color(declared(`.form-range-input${pseudo}`, property))
      const render = (theme, withToken) => {
        mount(`<div class="form-range ${theme}"${withToken ? ` style="--cui-${token}: ${PINK}"` : ''}><input type="range" class="form-range-input"><span data-probe></span></div>`)
        const probe = container.querySelector('[data-probe]')
        probe.style.color = value
        const painted = getComputedStyle(probe).color
        container.remove()
        return painted
      }

      expect(render('', true)).not.toBe(render('', false))
      expect(render('theme-danger', false)).not.toBe(render('', false))
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

  it('should draw the field focus ring like every other control', () => {
    mount(`<input class="form-control" id="plain">
      <div class="theme-success"><input class="form-control" id="themed"></div>`)

    container.querySelector('#plain').focus()
    expect(style('#plain').outlineColor).toBe(resolve('', 'var(--cui-focus-ring-color)'))
    container.querySelector('#themed').focus()
    expect(style('#themed').outlineColor).toBe(slot('theme-success', 'focus-ring'))
  })

  for (const [state, theme] of [['is-invalid', 'theme-danger'], ['is-valid', 'theme-success']]) {
    it(`should keep the ${state} ring on a field inside a form of another theme`, () => {
      mount(`<div class="theme-primary">
        <input class="form-control ${state}" id="field">
        <select class="form-select ${state}" id="select"><option>a</option></select>
        <div class="form-control-group ${state}" id="group"><input class="form-control" id="inner"></div>
        <div class="form-control-group"><select class="form-select ${state}" id="grouped-select"><option>a</option></select></div>
        <div class="form-control form-date-time ${state}" id="date"><span class="form-date-time-section" tabindex="0" id="section">MM</span></div>
      </div>`)
      const ring = slot(theme, 'focus-ring')

      for (const [focus, ringed] of [['#field', '#field'], ['#select', '#select'], ['#inner', '#group'], ['#grouped-select', '#grouped-select'], ['#section', '#date']]) {
        container.querySelector(focus).focus()
        expect(style(ringed).outlineColor).toBe(ring)
      }
    })
  }

  it('should not ring an invalid field inside a control group frame', () => {
    mount('<div class="form-control-group"><input class="form-control is-invalid" id="inner"></div>')

    container.querySelector('#inner').focus()
    expect(style('#inner').outlineStyle).toBe('none')
  })

  it('should ring a list box option with the theme focus ring', () => {
    mount('<div class="theme-danger"><div class="list-box"><div class="list-box-option" tabindex="0" id="option">a</div></div></div>')

    container.querySelector('#option').focus()
    expect(style('#option').outlineColor).toBe(slot('theme-danger', 'focus-ring'))
  })

  it('should highlight a date section with the subtle slot, whatever the focus ring is', () => {
    mount(`<div class="theme-danger"><div class="form-control form-date-time"><span class="form-date-time-section" tabindex="0" id="themed">MM</span></div></div>
      <div class="form-control form-date-time"><span class="form-date-time-section" tabindex="0" id="plain">MM</span></div>`, ':root { --cui-focus-ring-opacity: 1; }')

    container.querySelector('#themed').focus()
    expect(style('#themed').backgroundColor).toBe(slot('theme-danger', 'bg-subtle'))
    container.querySelector('#plain').focus()
    expect(style('#plain').backgroundColor).toBe(resolve('', 'var(--cui-primary-bg-subtle)'))
  })

  it('should lay the calendar range under the cell content', () => {
    mount(`<div class="calendars theme-danger"><table class="calendar" id="table"><tbody><tr class="calendar-row">
      <td class="calendar-cell range" id="day"><div class="calendar-cell-inner">2</div></td>
    </tr></tbody></table></div>`)
    const band = getComputedStyle(container.querySelector('#day .calendar-cell-inner'), '::after')

    expect([band.backgroundColor, band.zIndex, style('#table').isolation]).toEqual([slot('theme-danger', 'bg-subtle'), '-1', 'isolate'])
  })

  for (const [mode, cells] of [
    ['day', '<tr class="calendar-row"><td class="calendar-cell range" id="hovered"><div class="calendar-cell-inner">3</div></td></tr>'],
    ['adjacent day', '<tr class="calendar-row"><td class="calendar-cell range next clickable" id="hovered"><div class="calendar-cell-inner">1</div></td></tr>'],
    ['week', '<tr class="calendar-row range" id="hovered"><td class="calendar-cell"><div class="calendar-cell-inner">3</div></td></tr>']
  ]) {
    it(`should mark a hovered ${mode} in the calendar range with the muted slot`, async () => {
      mount(`<div class="calendars theme-danger${mode === 'week' ? ' select-week' : ''}"><table class="calendar"><tbody>${cells}</tbody></table></div>`)
      await userEvent.hover(container.querySelector('#hovered'))

      expect(style('#hovered .calendar-cell-inner').backgroundColor).toBe(slot('theme-danger', 'bg-muted'))
    })
  }
})

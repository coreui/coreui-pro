/*!
 * Color opacity utilities carry the -opacity- segment and mix the color their companion class wrote.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

const families = [
  { color: 'bg-success', property: 'backgroundColor', prefix: 'bg' },
  { color: 'border border-success', property: 'borderTopColor', prefix: 'border' },
  { color: 'fg-success', property: 'color', prefix: 'fg' },
  { color: 'underline underline-success', property: 'textDecorationColor', prefix: 'underline' }
]

const deprecatedSteps = {
  bg: [15, 25, 75],
  border: [25, 75]
}

const collectRules = (rules, found = []) => {
  for (const rule of rules) {
    if (rule.selectorText) {
      found.push(rule)
    }

    if (rule.cssRules) {
      collectRules(rule.cssRules, found)
    }
  }

  return found
}

const ruleFor = selector => collectRules([...document.styleSheets].flatMap(sheet => [...sheet.cssRules]))
  .filter(rule => rule.selectorText === selector)

describe('Color opacity utilities', () => {
  let container

  const read = (className, property) => {
    container = document.createElement('div')
    container.innerHTML = `<a href="#" class="${className}">Text</a>`
    document.body.append(container)
    const value = getComputedStyle(container.firstElementChild)[property]
    container.remove()

    return value
  }

  for (const { color, property, prefix } of families) {
    it(`fades .${prefix}-* with .${prefix}-opacity-*`, () => {
      const full = read(color, property)

      expect(read(`${color} ${prefix}-opacity-50`, property)).not.toBe(full)
      expect(read(`${color} ${prefix}-opacity-100`, property)).toBe(full)
      expect(read(`${color} ${prefix}-50`, property)).toBe(full)
    })
  }

  it('keeps every step outside the scale of ten at its own value', () => {
    for (const [prefix, steps] of Object.entries(deprecatedSteps)) {
      for (const step of steps) {
        const [rule] = ruleFor(`.${prefix}-opacity-${step}`)

        expect(rule).withContext(`.${prefix}-opacity-${step}`).toBeDefined()
        expect(rule.style.cssText).toContain(` ${step}%`)
      }
    }
  })

  it('emits each step of ten once', () => {
    for (const prefix of ['bg', 'border', 'fg', 'underline']) {
      for (const step of [10, 50]) {
        expect(ruleFor(`.${prefix}-opacity-${step}`).length).withContext(`.${prefix}-opacity-${step}`).toBe(1)
      }
    }
  })

  it('gives every underline step of ten a hover variant', () => {
    for (const step of [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
      expect(ruleFor(`.underline-opacity-${step}`).length).withContext(`step ${step}`).toBe(1)
      expect(ruleFor(`.underline-opacity-${step}-hover:hover`).length).withContext(`step ${step}`).toBe(1)
    }
  })

  it('has no underline step outside the scale of ten', () => {
    for (const step of [0, 25, 75]) {
      expect(ruleFor(`.underline-opacity-${step}`).length).withContext(`.underline-opacity-${step}`).toBe(0)
      expect(ruleFor(`.underline-opacity-${step}-hover:hover`).length).withContext(`.underline-opacity-${step}-hover`).toBe(0)
    }
  })

  it('fades the deprecated color spellings like their new names', () => {
    for (const [color, property, opacity] of [
      ['bg-primary-subtle', 'backgroundColor', 'bg-opacity-50'],
      ['border border-primary-subtle', 'borderTopColor', 'border-opacity-50'],
      ['text-primary', 'color', 'fg-opacity-50']
    ]) {
      expect(read(`${color} ${opacity}`, property)).withContext(color).not.toBe(read(color, property))
    }
  })

  it('keeps .text-opacity-* as an alias of .fg-opacity-*', () => {
    expect(read('fg-success text-opacity-50', 'color')).toBe(read('fg-success fg-opacity-50', 'color'))
  })
})

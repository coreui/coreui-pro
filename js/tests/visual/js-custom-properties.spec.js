/*!
 * Custom properties the scripts read or write keep their `--cui-` name in a build with its own `$prefix`.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import './fixtures/prefix.scss'

const sources = import.meta.glob('../../src/**/*.ts', { query: '?raw', import: 'default', eager: true })

const scriptProperties = [...new Set(Object.values(sources).flatMap(source => source.match(/(?<=')--cui-[a-z\d-]+(?=')/g) ?? []))]

const stylesheet = () => [...document.styleSheets]
  .flatMap(sheet => [...sheet.cssRules])
  .map(rule => rule.cssText)
  .join('\n')

describe('Custom properties shared with the scripts', () => {
  it('should find properties in the scripts', () => {
    expect(scriptProperties).toContain('--cui-range-fill')
    expect(scriptProperties).toContain('--cui-progress-segments')
  })

  it('should keep the --cui- name of every property a script reads or writes', () => {
    const css = stylesheet()

    for (const property of scriptProperties) {
      const name = property.slice('--cui-'.length)

      expect(css, property).toMatch(new RegExp(`${property}(?![a-z\\d-])`))
      expect(css, property).not.toMatch(new RegExp(`--app-${name}(?![a-z\\d-])`))
    }
  })

  it('should place the range tooltip by the fill a script writes', () => {
    const container = document.createElement('div')
    const tooltip = fill => `<div class="form-range-tooltip bs-tooltip-top" style="--cui-range-fill: ${fill}">0</div>`
    container.innerHTML = `<div class="form-range" style="position: relative; width: 400px">${tooltip(0)}${tooltip(1)}</div>`
    document.body.append(container)

    const [empty, full] = container.querySelectorAll('.form-range-tooltip')

    expect(full.getBoundingClientRect().left - empty.getBoundingClientRect().left).toBeGreaterThan(300)
    container.remove()
  })
})

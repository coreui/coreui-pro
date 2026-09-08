/*!
 * Tests for the colors, root, layout-token and theme-class generators.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import assert from 'node:assert/strict'
import path from 'node:path'
import process from 'node:process'
import { describe, it } from 'node:test'
import {
  colorsLayer, layoutTokensLayer, LAYERS, loadTokens, rootLayer, themeClassesLayer
} from './root.mjs'

const theme = loadTokens([path.join(process.cwd(), 'scss/themes/bootstrap/tokens.json')])
const declared = css => [...css.matchAll(/^ +(--[\w-]+): (.+);$/gm)].map(([, name, value]) => [name, value])
const names = css => declared(css).map(([name]) => name)

describe('the generated layers', () => {
  it('wraps each block in the layer it belongs to', () => {
    assert.match(colorsLayer(), /^@layer colors \{\n {2}:root,\n {2}:host \{\n/)
    assert.match(rootLayer(), /^@layer root \{\n {2}:root,\n {2}:host,\n {2}\[data-coreui-theme=light\] \{\n/)
    assert.match(layoutTokensLayer(), /^@layer root \{\n {2}:root \{\n/)
    assert.match(themeClassesLayer(), /^@layer helpers \{\n {2}\.theme-primary \{\n/)
    for (const build of LAYERS.values()) {
      assert.match(build(), /\n}\n$/)
    }
  })

  it('declares nothing but custom properties and the color scheme', () => {
    const properties = [...rootLayer().matchAll(/^ {4}(?!--)([\w-]+): /gm)].map(([, name]) => name)
    assert.deepEqual([...new Set(properties)], ['color-scheme'])
  })
})

describe('the prefix parameter', () => {
  it('respells every token the layers declare', () => {
    for (const build of LAYERS.values()) {
      const css = build({ tokens: theme, prefix: 'bs-', dataInfix: '-bs-' })
      assert.ok(names(css).length > 0)
      assert.deepEqual(names(css).filter(name => !name.startsWith('--bs-')), [])
      assert.equal(css.includes('--cui-'), false)
    }
  })

  it('respells the color-mode selectors with the data infix', () => {
    const css = rootLayer({ tokens: theme, prefix: 'bs-', dataInfix: '-bs-' })
    assert.ok(css.includes('[data-bs-theme=light] {'))
    assert.ok(css.includes('[data-bs-theme=dark] {'))
  })
})

describe('the color scales', () => {
  it('anchors every stop of a palette color on the color itself', () => {
    const rows = new Map(declared(colorsLayer()))
    assert.equal(rows.get('--cui-blue-400'), 'color-mix(in oklch, var(--cui-white) 20%, var(--cui-blue))')
    assert.equal(rows.get('--cui-blue-500'), 'var(--cui-blue)')
    assert.equal(rows.get('--cui-blue-600'), 'color-mix(in oklch, var(--cui-black) 16%, var(--cui-blue))')
  })

  it('gives a theme color a scale only when its base is one color in both schemes', () => {
    const rows = new Map(declared(colorsLayer()))
    assert.ok(rows.has('--cui-primary-400'))
    assert.equal(rows.get('--cui-secondary-base'), 'light-dark(var(--cui-gray-100), var(--cui-gray-600))')
    assert.equal(rows.has('--cui-secondary-400'), false)

    const themed = new Map(declared(colorsLayer({ tokens: theme, prefix: 'bs-' })))
    assert.equal(themed.get('--bs-secondary-base'), '#6c757d')
    assert.equal(themed.get('--bs-secondary-400'), 'color-mix(in oklch, var(--bs-white) 20%, var(--bs-secondary-base))')
  })

  it('lets $tokens replace a generated stop in the slot it already holds', () => {
    const rows = declared(colorsLayer({ tokens: theme, prefix: 'bs-' }))
    const stops = rows.filter(([name]) => name.startsWith('--bs-gray'))

    assert.deepEqual(stops.slice(0, 3), [['--bs-gray', '#adb5bd'], ['--bs-gray-025', '#fdfdfe'], ['--bs-gray-050', '#fbfcfc']])
    assert.equal(stops.at(-1)[1], 'color-mix(in oklch, var(--bs-black) 76%, var(--bs-gray))')
  })

  it('refuses a $tokens key no layer declares', () => {
    const broken = loadTokens()
    broken.set('$tokens', new Map([['nope', '#000']]))
    assert.throws(() => colorsLayer({ tokens: broken }), /no generated layer declares/)
  })
})

describe('the theme slots', () => {
  const rows = new Map(declared(rootLayer()))

  it('points the action background at the base color', () => {
    assert.equal(rows.get('--cui-primary-bg'), 'var(--cui-primary-base)')
  })

  it('declares every slot for every theme color', () => {
    for (const color of ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'inverse']) {
      for (const slot of ['bg', 'contrast', 'fg', 'fg-emphasis', 'bg-subtle', 'bg-muted', 'border', 'focus-ring']) {
        assert.ok(rows.has(`--cui-${color}-${slot}`), `--cui-${color}-${slot}`)
      }
    }
  })
})

describe('the theme classes', () => {
  const css = themeClassesLayer()

  it('writes one class per theme color plus the reset', () => {
    const classes = [...css.matchAll(/^ {2}\.([\w-]+) \{$/gm)].map(([, name]) => name)
    assert.deepEqual(classes, ['theme-primary', 'theme-secondary', 'theme-success', 'theme-info', 'theme-warning', 'theme-danger', 'theme-inverse', 'theme-reset'])
  })

  it('maps every slot onto the color and derives the states it has no pair for', () => {
    assert.ok(css.includes('    --cui-theme-bg: var(--cui-primary-bg);'))
    assert.ok(css.includes('    --cui-theme-hover: oklch(from var(--cui-primary-bg) calc(l * 0.85) c h);'))
    assert.ok(css.includes('    --cui-theme-hover: light-dark(var(--cui-gray-200), var(--cui-gray-700));'))
  })

  it('resets every slot the classes set', () => {
    const reset = css.slice(css.indexOf('  .theme-reset {'))
    const primary = css.slice(css.indexOf('  .theme-primary {'), css.indexOf('  .theme-secondary {'))

    assert.deepEqual(names(reset), names(primary))
    assert.deepEqual([...new Set(declared(reset).map(([, value]) => value))], ['initial'])
  })
})

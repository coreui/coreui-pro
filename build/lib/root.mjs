/*!
 * The colors, root, layout-token and theme-class layers: tokens.json in, CSS out.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  css, entries, get, parseOrdered, render, tokens as packageTokens, valueOf
} from './tokens.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

const THEME_SLOTS = ['bg', 'fg-emphasis', 'bg-subtle', 'border', 'contrast', 'fg', 'bg-muted', 'focus-ring']
const SLOT_ORDER = ['bg', 'contrast', 'fg', 'fg-emphasis', 'bg-subtle', 'bg-muted', 'border', 'focus-ring']
const STATE_LIGHTNESS = new Map([['hover', 0.85], ['active', 0.8]])
const FAMILIES = ['bg', 'fg', 'border']

// A Map tree merged over another: a group merges key by key, a token replaces
// the one it shadows, so an overlay states only what it changes.
const overlay = (base, patch) => {
  for (const [key, value] of patch) {
    const current = base.get(key)

    if (current instanceof Map && value instanceof Map && !value.has('$value')) {
      overlay(current, value)
    } else {
      base.set(key, value)
    }
  }

  return base
}

export const loadTokens = (files = []) => {
  const tree = parseOrdered(readFileSync(path.join(root, 'tokens.json'), 'utf8'))

  for (const file of files) {
    overlay(tree, parseOrdered(readFileSync(path.resolve(file), 'utf8')))
  }

  return tree
}

const leadingZero = value => value.replaceAll(/(^|[\s(,])(-?)\.(\d)/g, '$1$20.$3')
const division = value => value.replaceAll(/^calc\((\d+(?:\.\d+)?) \/ (\d+(?:\.\d+)?)\)$/g, (_, a, b) => String(Math.round((a / b) * 1e10) / 1e10))
// Sass prints a bare hue as an angle, and the compiled stylesheet is the
// contract this generator has to reproduce.
const hueDegrees = value => value.replaceAll(/(oklch\((?!from)[^()]*?\s[\d.]+\s)([\d.]+)\)/g, '$1$2deg)')
const cssValue = (value, prefix) => hueDegrees(division(leadingZero(css(render(value), prefix))))

const isPair = value => value instanceof Map && value.has('light')
const themeColors = tree => entries(get(tree, 'color', 'theme'))

const scaleStops = (tree, name, anchor, prefix) => {
  const stops = (group, mixer) => entries(get(tree, 'color', 'scale', group))
    .map(([key, token]) => [`--${prefix}${name}-${key}`, `color-mix(in oklch, var(--${prefix}${mixer}) ${valueOf(token)}, var(--${prefix}${name}))`])

  return [
    [`--${prefix}${name}`, anchor],
    ...stops('tints', 'white'),
    [`--${prefix}${name}-500`, `var(--${prefix}${name})`],
    ...stops('shades', 'black')
  ]
}

const colorsTokens = (tree, prefix) => {
  const rows = []

  for (const [name, token] of entries(get(tree, 'color', 'palette'))) {
    rows.push(...scaleStops(tree, name, cssValue(valueOf(token), prefix), prefix))
  }

  for (const [name, color] of themeColors(tree)) {
    const base = valueOf(color.get('base'))

    if (isPair(base)) {
      rows.push([`--${prefix}${name}-base`, cssValue(base, prefix)])
    } else {
      rows.push(...scaleStops(tree, `${name}-base`, cssValue(base, prefix), prefix).map(([key, value]) => [key.replace(`${name}-base-`, `${name}-`), value]))
    }
  }

  return rows
}

const themeColorTokens = (tree, prefix) => {
  const rows = []

  for (const slot of THEME_SLOTS) {
    for (const [name, color] of themeColors(tree)) {
      rows.push([
        `--${prefix}${name}-${slot}`,
        slot === 'bg' ? `var(--${prefix}${name}-base)` : cssValue(valueOf(color.get(slot)), prefix)
      ])
    }
  }

  return rows
}

const shadowTokens = (tree, prefix) => entries(get(tree, 'shadow')).map(([key, token]) => {
  const value = valueOf(token)
  const name = key === 'base' ? `--${prefix}box-shadow` : `--${prefix}box-shadow-${key}`

  if (typeof value === 'string') {
    return [name, css(value, prefix)]
  }

  const layers = value.map(layer => {
    const { offsetY, blur, spread, alpha } = Object.fromEntries(layer)
    return `0 ${offsetY} ${blur}${spread ? ` ${spread}` : ''} color-mix(in oklch, var(--${prefix}shadow-tint, var(--${prefix}shadow-color)) calc(${alpha}% * var(--${prefix}shadow-strength) * var(--${prefix}shadow-opacity, 1)), transparent)`
  })

  return [name, layers.length === 1 ? leadingZero(layers[0]) : layers.join(', ')]
})

const rootTokens = (tree, prefix) => {
  const rows = [...themeColorTokens(tree, prefix)]

  for (const [key, token] of entries(get(tree, 'typography', 'size'))) {
    const value = valueOf(token)
    rows.push(
      [`--${prefix}font-size-${key}`, cssValue(value.get('fontSize'), prefix)],
      [`--${prefix}line-height-${key}`, cssValue(value.get('lineHeight'), prefix)]
    )
  }

  rows.push([`--${prefix}radius`, cssValue(valueOf(get(tree, 'radius', 'base')), prefix)])
  for (const [key, token] of entries(get(tree, 'radius', 'scale'))) {
    rows.push([`--${prefix}radius-${key}`, cssValue(valueOf(token), prefix)])
  }

  rows.push([`--${prefix}radius-pill`, '50rem'])

  for (const [key, token] of entries(get(tree, 'border', 'width'))) {
    rows.push([`--${prefix}border-width-${key}`, cssValue(valueOf(token), prefix)])
  }

  for (const [key, token] of entries(get(tree, 'z-index'))) {
    rows.push([`--${prefix}z-${key}`, cssValue(valueOf(token), prefix)])
  }

  for (const [key, token] of entries(get(tree, 'typography', 'weight'))) {
    rows.push([`--${prefix}font-weight-${key}`, cssValue(valueOf(token), prefix)])
  }

  rows.push(...shadowTokens(tree, prefix))

  for (const [key, token] of entries(get(tree, 'root'))) {
    rows.push([`--${prefix}${key}`, cssValue(valueOf(token), prefix)])
  }

  for (const family of FAMILIES) {
    for (const [key, token] of entries(get(tree, 'color', family))) {
      rows.push([`--${prefix}${family}-${key}`, cssValue(valueOf(token), prefix)])
    }
  }

  return rows
}

// The theme layer of the config: raw values for tokens the scales would
// otherwise generate, applied by name so a hand-picked ramp keeps its slot.
const substitute = (rows, tree, prefix) => {
  const overrides = get(tree, '$tokens')

  if (!overrides) {
    return rows
  }

  const names = new Set(rows.map(([name]) => name))

  for (const key of overrides.keys()) {
    if (!names.has(`--${prefix}${key}`)) {
      throw new Error(`tokens.json: $tokens overrides --${prefix}${key}, which no generated layer declares`)
    }
  }

  return rows.map(([name, value]) => [name, overrides.has(name.slice(2 + prefix.length)) ? overrides.get(name.slice(2 + prefix.length)) : value])
}

const declarations = (rows, indent) => rows.map(([name, value]) => `${indent}${name}: ${value};`).join('\n')

export const colorsLayer = ({ tokens = packageTokens, prefix = 'cui-' } = {}) => [
  '@layer colors {',
  '  :root,',
  '  :host {',
  declarations(substitute(colorsTokens(tokens, prefix), tokens, prefix), '    '),
  '  }',
  '}',
  ''
].join('\n')

export const rootLayer = ({ tokens = packageTokens, prefix = 'cui-', dataInfix = '-coreui-' } = {}) => [
  '@layer root {',
  '  :root,',
  '  :host,',
  `  [data${dataInfix}theme=light] {`,
  declarations(rootTokens(tokens, prefix), '    '),
  '    color-scheme: light;',
  '  }',
  `  [data${dataInfix}theme=dark] {`,
  declarations(entries(get(tokens, 'dark-mode')).map(([key, token]) => [`--${prefix}${key}`, cssValue(valueOf(token), prefix)]), '    '),
  '    color-scheme: dark;',
  '  }',
  '}',
  ''
].join('\n')

export const layoutTokensLayer = ({ tokens = packageTokens, prefix = 'cui-' } = {}) => {
  const rows = entries(get(tokens, 'breakpoint')).map(([key, token]) => [`--${prefix}breakpoint-${key}`, cssValue(valueOf(token), prefix)])
  rows.push([`--${prefix}spacer`, cssValue(valueOf(get(tokens, 'space', 'spacer')), prefix)])

  for (const [key, token] of entries(get(tokens, 'space', 'scale'))) {
    rows.push([`--${prefix}spacer-${key}`, cssValue(valueOf(token), prefix)])
  }

  return ['@layer root {', '  :root {', declarations(rows, '    '), '  }', '}', ''].join('\n')
}

export const themeClassesLayer = ({ tokens = packageTokens, prefix = 'cui-' } = {}) => {
  const blocks = themeColors(tokens).map(([name, color]) => {
    const rows = SLOT_ORDER.map(slot => [`--${prefix}theme-${slot}`, `var(--${prefix}${name}-${slot})`])

    for (const [state, lightness] of STATE_LIGHTNESS) {
      rows.push([
        `--${prefix}theme-${state}`,
        color.has(state) ?
          cssValue(valueOf(color.get(state)), prefix) :
          `oklch(from var(--${prefix}${name}-bg) calc(l * ${lightness}) c h)`
      ])
    }

    return [`  .theme-${name} {`, declarations(rows, '    '), '  }'].join('\n')
  })

  const reset = [...SLOT_ORDER, ...STATE_LIGHTNESS.keys()].map(slot => [`--${prefix}theme-${slot}`, 'initial'])
  blocks.push(['  .theme-reset {', declarations(reset, '    '), '  }'].join('\n'))

  return ['@layer helpers {', ...blocks, '}', ''].join('\n')
}

export const LAYERS = new Map([
  ['colors', colorsLayer],
  ['root', rootLayer],
  ['layout-tokens', layoutTokensLayer],
  ['theme-classes', themeClassesLayer]
])

#!/usr/bin/env node

/*!
 * Script to write the color maps in scss/ from tokens.json.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * tokens.json is the source of truth; every block between a pair of
 * `scss-docs-start <name>` / `scss-docs-end <name>` markers listed in BLOCKS
 * is rewritten from it. `--check` exits 1 when a block is stale.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  entries, get, render, tokens, valueOf
} from './lib/tokens.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')

const THEME_SLOTS = ['base', 'contrast', 'fg', 'fg-emphasis', 'bg-subtle', 'bg-muted', 'border', 'focus-ring']
const STATE_SLOTS = ['hover', 'active']

const pad = (key, width) => width ? `${key}:`.padEnd(width) : `${key}: `
const name = (key, quoted) => quoted ? `"${key}"` : key

const scalars = (group, width) => entries(group)
  .map(([key, token]) => `${pad(`$${key}`, width)}${render(valueOf(token))} !default;`)
  .join('\n')

const rows = (items, width, indent, trailing, quoted = true) => items
  .map(([key, value], index) => `${indent}${pad(name(key, quoted), width)}${value}${trailing || index < items.length - 1 ? ',' : ''}`)
  .join('\n')

const map = ({ name, body, blank = false, plain = false }) => (plain ?
  [
    `$${name}: (`,
    body,
    ') !default;'
  ] :
  [
    `$${name}: () !default;`,
    ...(blank ? [''] : []),
    '// stylelint-disable-next-line scss/dollar-variable-default',
    `$${name}: defaults(`,
    '  (',
    body,
    '  ),',
    `  $${name}`,
    ');'
  ]).join('\n')

const scale = (path, refs) => entries(get(tokens, ...path)).map(([key, token]) => [key, render(valueOf(token), refs)])

const shadowLayer = ({ offsetY, blur, spread, alpha }) => [
  '0',
  offsetY,
  blur,
  ...(spread ? [spread] : []),
  `color-mix(in oklch, var(--#{$prefix}shadow-tint, var(--#{$prefix}shadow-color)) calc(${alpha}% * var(--#{$prefix}shadow-strength) * var(--#{$prefix}shadow-opacity, 1)), transparent)`
].join(' ')

const shadows = () => {
  const items = entries(get(tokens, 'shadow')).map(([key, token]) => {
    const value = valueOf(token)
    const name = key === 'base' ? 'null' : key
    if (typeof value === 'string') {
      return `  ${name}: ${value},`
    }

    const layers = value.map(layer => shadowLayer(Object.fromEntries(layer)))
    return layers.length === 1 ? `  ${name}: ${layers[0]},` : `  ${name}: #{(\n${layers.map(layer => `    "${layer}"`).join(',\n')}\n  )},`
  })
  return ['', '$shadows: (', ...items, ') !default;'].join('\n')
}

const typeScale = () => {
  const items = entries(get(tokens, 'typography', 'size')).map(([key, token]) => {
    const value = valueOf(token)
    return [key, `"font-size": ${render(value.get('fontSize'))},`, `"line-height": ${render(value.get('lineHeight'))}`]
  })
  const width = Math.max(...items.map(([, size]) => size.length)) + 1
  return items
    .map(([key, size, height], index) => `    ${pad(`"${key}"`, 7)}(${size.padEnd(width)}${height})${index < items.length - 1 ? ',' : ''}`)
    .join('\n')
}

const nested = (groups, width, trailing) => groups
  .map(([key, items], index) => [
    `    "${key}": (`,
    rows(items, width, '      ', trailing),
    `    )${trailing || index < groups.length - 1 ? ',' : ''}`
  ].join('\n'))
  .join('\n')

const palette = get(tokens, 'color', 'palette')
const themeColors = entries(get(tokens, 'color', 'theme'))
const slot = (token, key) => [key, render(valueOf(token.get(key)))]
const family = name => entries(get(tokens, 'color', name)).map(([key, token]) => [key, render(valueOf(token))])
const stops = name => entries(get(tokens, 'color', 'scale', name)).map(([key, token]) => [key, valueOf(token)])

const BLOCKS = {
  'scss/_colors.scss': {
    'color-variables': () => scalars(palette, 10),
    'colors-map': () => map({
      name: 'colors',
      blank: true,
      body: rows(entries(palette).map(([key]) => [key, `$${key}`]), 14, '    ', false)
    }),
    'color-scale-maps': () => [
      map({ name: 'color-tints', blank: true, body: rows(stops('tints'), 7, '    ', false) }),
      '',
      map({ name: 'color-shades', blank: true, body: rows(stops('shades'), 7, '    ', false) })
    ].join('\n')
  },
  'scss/_config.scss': {
    'spacer-variables': () => scalars(new Map([['spacer', get(tokens, 'space', 'spacer')]]), 0),
    'spacers-map': () => map({ name: 'spacers', body: rows(scale(['space', 'scale'], 'sass'), 0, '    ', true, false) }),
    'negative-spacers-map': () => map({ name: 'negative-spacers', body: rows(scale(['space', 'negative'], 'sass'), 0, '    ', true) }),
    'sizes-map': () => map({ name: 'sizes', body: rows(scale(['space', 'size'], 'sass'), 0, '    ', false, false) }),
    breakpoints: () => map({ name: 'breakpoints', plain: true, body: rows(scale(['breakpoint']), 0, '  ', false, false) }),
    'container-max-widths': () => map({ name: 'container-max-widths', body: rows(scale(['container']), 0, '    ', false, false) }),
    'border-widths-map': () => map({ name: 'border-widths', body: rows(scale(['border', 'width']), 0, '    ', false, false) }),
    'radius-variables': () => scalars(new Map([['radius', get(tokens, 'radius', 'base')]]), 30),
    'radii-map': () => map({ name: 'radii', body: rows(scale(['radius', 'scale']), 0, '    ', true, false) }),
    'font-weights': () => map({ name: 'font-weights', body: rows(entries(get(tokens, 'typography', 'weight')).map(([key]) => [key, `$font-weight-${key}`]), 0, '    ', false, false) }),
    'font-sizes': () => map({ name: 'font-sizes', body: typeScale() }),
    'zindex-levels-map': () => map({ name: 'zindex-levels', body: rows(scale(['z-index']), 0, '    ', false, false) }),
    'aspect-ratios': () => map({ name: 'aspect-ratios', body: rows(scale(['aspect-ratio']), 9, '    ', false) }),
    'position-map': () => map({ name: 'position-values', body: rows(scale(['position']), 0, '    ', false, false) }),
    'box-shadow-variables': () => shadows()
  },
  'scss/_theme.scss': {
    'theme-color-variables': () => scalars(new Map(themeColors.map(([key, token]) => [key, token.get('base')])), 16),
    'theme-colors-map': () => map({
      name: 'theme-colors',
      body: nested(themeColors.map(([color, token]) => [color, THEME_SLOTS.map(key => key === 'base' ? [key, `$${color}`] : slot(token, key))]), 17, true)
    }),
    'theme-bgs-map': () => map({ name: 'theme-bgs', body: rows(family('bg'), 15, '    ', true) }),
    'theme-fgs-map': () => map({ name: 'theme-fgs', body: rows(family('fg'), 15, '    ', true) }),
    'theme-borders-map': () => map({ name: 'theme-borders', body: rows(family('border'), 15, '    ', true) }),
    'util-opacity-map': () => map({ name: 'util-opacity', body: rows(scale(['opacity', 'util']), 0, '    ', false, false) }),
    'theme-state-colors': () => map({
      name: 'theme-state-colors',
      body: nested(
        themeColors
          .filter(([, token]) => STATE_SLOTS.some(key => token.has(key)))
          .map(([color, token]) => [color, STATE_SLOTS.map(key => slot(token, key))]),
        10,
        false
      )
    })
  }
}

let stale = 0

for (const [file, blocks] of Object.entries(BLOCKS)) {
  const filePath = path.join(root, file)
  const source = readFileSync(filePath, 'utf8')
  let output = source

  for (const [name, build] of Object.entries(blocks)) {
    const pattern = new RegExp(`(// scss-docs-start ${name}\\n)([\\s\\S]*?)(// scss-docs-end ${name}\\n)`)
    if (!pattern.test(output)) {
      throw new Error(`${file}: block ${name} not found`)
    }

    output = output.replace(pattern, (_, start, body, end) => {
      const next = `${build()}\n`
      if (next !== body) {
        stale++
        console.log(`${check ? 'stale' : 'written'}: ${file} ${name}`)
      }

      return `${start}${next}${end}`
    })
  }

  if (!check && output !== source) {
    writeFileSync(filePath, output)
  }
}

if (check && stale > 0) {
  console.error(`${stale} block(s) differ from tokens.json — run \`npm run tokens\``)
  process.exit(1)
}

if (stale === 0) {
  console.log('tokens: scss blocks match tokens.json')
}

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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const check = process.argv.includes('--check')

// JSON.parse reorders integer-like keys ("1", "100") ahead of the rest, and the
// maps are emitted in file order, so objects are read into Maps instead.
const parseOrdered = text => {
  let index = 0
  const skip = () => {
    while (index < text.length && /\s/.test(text[index])) {
      index++
    }
  }

  const expect = char => {
    skip()
    if (text[index] !== char) {
      throw new Error(`tokens.json: expected ${char} at ${index}`)
    }

    index++
  }

  const string = () => {
    expect('"')
    let out = ''
    while (text[index] !== '"') {
      if (text[index] === '\\') {
        index++
      }

      out += text[index++]
    }

    index++
    return out
  }

  const value = () => {
    skip()
    const char = text[index]
    if (char === '{') {
      index++
      const map = new Map()
      skip()
      while (text[index] !== '}') {
        const key = string()
        expect(':')
        map.set(key, value())
        skip()
        if (text[index] === ',') {
          index++
          skip()
        }
      }

      index++
      return map
    }

    if (char === '[') {
      index++
      const list = []
      skip()
      while (text[index] !== ']') {
        list.push(value())
        skip()
        if (text[index] === ',') {
          index++
          skip()
        }
      }

      index++
      return list
    }

    if (char === '"') {
      return string()
    }

    const literal = /^(true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(text.slice(index))
    if (!literal) {
      throw new Error(`tokens.json: unexpected token at ${index}`)
    }

    index += literal[0].length
    return JSON.parse(literal[0])
  }

  return value()
}

const tokens = parseOrdered(readFileSync(path.join(root, 'tokens.json'), 'utf8'))
const get = (node, ...keys) => {
  let current = node
  for (const key of keys) {
    current = current?.get?.(key)
  }

  return current
}

const THEME_SLOTS = ['base', 'contrast', 'fg', 'fg-emphasis', 'bg-subtle', 'bg-muted', 'border', 'focus-ring']
const STATE_SLOTS = ['hover', 'active']
const SCALE_STOPS = new Set([...get(tokens, 'color', 'scale', 'tints').keys(), '500', ...get(tokens, 'color', 'scale', 'shades').keys()])

const isToken = node => node instanceof Map && node.has('$value')
const entries = group => [...group].filter(([key]) => !key.startsWith('$'))
const valueOf = token => token.get('$value')

const lookup = ref => {
  const segments = ref.slice(1, -1).split('.')
  const node = get(tokens, ...segments)

  if (isToken(node)) {
    return { node, segments }
  }

  const [group, kind, color, stop] = segments
  const owner = get(tokens, 'color', kind, color)
  const scaled = segments.length === 4 && group === 'color' && (kind === 'theme' || kind === 'palette') && SCALE_STOPS.has(stop) && (isToken(owner) || isToken(owner?.get('base')))
  if (scaled) {
    return { node: null, segments }
  }

  throw new Error(`tokens.json: unknown reference ${ref}`)
}

const cssName = ref => {
  const { node, segments } = lookup(ref)
  const override = get(node, '$extensions', 'coreui', 'css')
  if (override) {
    return override
  }

  const [, ...rest] = segments
  if (rest[0] === 'palette' || rest[0] === 'theme') {
    rest.shift()
  }

  return rest.join('-')
}

const cssVar = ref => `var(--#{$prefix}${cssName(ref)})`

const render = value => {
  if (typeof value === 'string') {
    return value.startsWith('{') ? cssVar(value) : value
  }

  if (value.has('light')) {
    return `light-dark(${render(value.get('light'))}, ${render(value.get('dark'))})`
  }

  if (value.has('mix')) {
    const [a, b] = value.get('mix')
    return `color-mix(in oklch, ${render(a)}, ${render(b)})`
  }

  if (value.has('alpha')) {
    return `color-mix(in oklch, ${render(value.get('color'))} calc(${cssVar(value.get('alpha'))} * 100%), transparent)`
  }

  throw new Error(`tokens.json: unsupported value ${JSON.stringify([...value])}`)
}

const pad = (key, width) => `${key}:`.padEnd(width)

const scalars = (group, width) => entries(group)
  .map(([key, token]) => `${pad(`$${key}`, width)}${render(valueOf(token))} !default;`)
  .join('\n')

const rows = (items, width, indent, trailing) => items
  .map(([key, value], index) => `${indent}${pad(`"${key}"`, width)}${value}${trailing || index < items.length - 1 ? ',' : ''}`)
  .join('\n')

const map = ({ name, body, blank = false }) => [
  `$${name}: () !default;`,
  ...(blank ? [''] : []),
  '// stylelint-disable-next-line scss/dollar-variable-default',
  `$${name}: defaults(`,
  '  (',
  body,
  '  ),',
  `  $${name}`,
  ');'
].join('\n')

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
  'scss/_theme.scss': {
    'theme-color-variables': () => scalars(new Map(themeColors.map(([key, token]) => [key, token.get('base')])), 16),
    'theme-colors-map': () => map({
      name: 'theme-colors',
      body: nested(themeColors.map(([color, token]) => [color, THEME_SLOTS.map(key => key === 'base' ? [key, `$${color}`] : slot(token, key))]), 17, true)
    }),
    'theme-bgs-map': () => map({ name: 'theme-bgs', body: rows(family('bg'), 15, '    ', true) }),
    'theme-fgs-map': () => map({ name: 'theme-fgs', body: rows(family('fg'), 15, '    ', true) }),
    'theme-borders-map': () => map({ name: 'theme-borders', body: rows(family('border'), 15, '    ', true) }),
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

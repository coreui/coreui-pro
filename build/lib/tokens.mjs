/*!
 * The tokens.json reader shared by the generators.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

// JSON.parse reorders integer-like keys ("1", "100") ahead of the rest, and the
// maps are emitted in file order, so objects are read into Maps instead.
export const parseOrdered = text => {
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

export const tokens = parseOrdered(readFileSync(path.join(root, 'tokens.json'), 'utf8'))
export const get = (node, ...keys) => {
  let current = node
  for (const key of keys) {
    current = current?.get?.(key)
  }

  return current
}

export const SCALE_STOPS = new Set([...get(tokens, 'color', 'scale', 'tints').keys(), '500', ...get(tokens, 'color', 'scale', 'shades').keys()])

export const isToken = node => node instanceof Map && node.has('$value')
export const entries = group => [...group].filter(([key]) => !key.startsWith('$'))
export const valueOf = token => token.get('$value')

export const lookup = ref => {
  const segments = ref.slice(1, -1).split('.')
  const node = get(tokens, ...segments)

  if (isToken(node)) {
    return { node, segments }
  }

  if (node instanceof Map) {
    throw new TypeError(`tokens.json: ${ref} is a group, not a token`)
  }

  const [group, kind, color, stop] = segments
  const owner = get(tokens, 'color', kind, color)
  const scaled = segments.length === 4 && group === 'color' && (kind === 'theme' || kind === 'palette') && SCALE_STOPS.has(stop) && (isToken(owner) || isToken(owner?.get('base')))
  if (scaled) {
    return { node: null, segments }
  }

  throw new Error(`tokens.json: unknown reference ${ref}`)
}

export const cssName = ref => {
  const { node, segments } = lookup(ref)
  const override = get(node, '$extensions', 'coreui', 'css')
  if (override) {
    return override
  }

  for (let depth = segments.length - 1; depth > 0; depth--) {
    const prefix = get(tokens, ...segments.slice(0, depth), '$extensions', 'coreui', 'css')
    if (prefix) {
      return [prefix, ...segments.slice(depth)].join('-')
    }
  }

  const [, ...rest] = segments
  if (rest[0] === 'palette' || rest[0] === 'theme') {
    rest.shift()
  }

  return rest.join('-')
}

export const cssVar = ref => `var(--#{$prefix}${cssName(ref)})`
export const sassVar = ref => `$${cssName(ref)}`
export const number = n => String(n).replace(/^(-?)0\./, '$1.')

export const render = (value, refs = 'var') => {
  if (typeof value === 'number') {
    return number(value)
  }

  if (typeof value === 'string') {
    if (value.startsWith('{')) {
      return refs === 'sass' ? sassVar(value) : cssVar(value)
    }

    return /^\d+ \/ \d+$/.test(value) ? `#{"${value}"}` : value
  }

  if (value.has('multiply')) {
    const [ref, factor] = value.get('multiply')
    return refs === 'sass' ? `${sassVar(ref)} * ${number(factor)}` : `calc(${cssVar(ref)} * ${number(factor)})`
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

export const css = value => value.replaceAll('#{$prefix}', 'cui-').replaceAll(/#\{"(.*?)"\}/g, '$1')

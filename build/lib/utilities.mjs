/*!
 * The utilities generator: utilities.json + tokens.json in, stylesheet out.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  css, cssName, entries, get, parseOrdered, render, tokens, valueOf
} from './tokens.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

export const LAYERS = ['colors', 'config', 'root', 'reboot', 'layout', 'content', 'forms', 'components', 'custom', 'helpers', 'utilities']

// The package map with user files merged over it the way `$utilities` merges:
// an existing key replaces the whole group, `null` removes it, a new key is
// appended. `only` keeps just the keys the user files name.
export const loadUtilities = ({ files = [], only = false } = {}) => {
  const utilities = parseOrdered(readFileSync(path.join(root, 'utilities.json'), 'utf8'))
  const userKeys = new Set()
  for (const file of files) {
    for (const [key, utility] of parseOrdered(readFileSync(path.resolve(file), 'utf8'))) {
      userKeys.add(key)
      if (utility === null || utility === false) {
        utilities.delete(key)
      } else {
        utilities.set(key, utility)
      }
    }
  }

  if (only) {
    for (const key of utilities.keys()) {
      if (!userKeys.has(key)) {
        utilities.delete(key)
      }
    }
  }

  return utilities
}

const leadingZero = value => value.replaceAll(/(^|[\s(,])(-?)\.(\d)/g, '$1$20.$3')
const division = value => value.replaceAll(/^calc\((\d+(?:\.\d+)?) \/ (\d+(?:\.\d+)?)\)$/g, (_, a, b) => String(Math.round((a / b) * 1e10) / 1e10))
const cssValue = value => division(leadingZero(css(render(value))))
const pathOf = dotted => dotted.split('.')

const tokenMap = (dotted, mapValue) => new Map(entries(get(tokens, ...pathOf(dotted))).map(([key, token]) => [key, mapValue(token, key)]))

const evaluate = value => {
  if (typeof value === 'string') {
    return value.startsWith('{') ? evaluate(valueOf(get(tokens, ...pathOf(value.slice(1, -1))))) : cssValue(value)
  }

  const [ref, factor] = value.get('multiply')
  const base = /^(-?[\d.]+)([a-z%]*)$/.exec(valueOf(get(tokens, ...pathOf(ref.slice(1, -1)))))
  return `${Math.round(Number(base[1]) * factor * 1e6) / 1e6}${base[2]}`
}

const sources = {
  $theme: (slot, source) => new Map(entries(get(tokens, 'color', 'theme')).map(([color]) => [`${color}${source.get('$suffix') ?? ''}`, `var(--cui-${color}-${slot})`])),
  $family: family => new Map(entries(get(tokens, 'color', family)).filter(([, token]) => valueOf(token) !== 'inherit').map(([key]) => [key, `var(--cui-${family}-${key})`])),
  $scale: dotted => tokenMap(dotted, token => evaluate(valueOf(token))),
  $refs: dotted => tokenMap(dotted, (token, key) => `var(--cui-${cssName(`{${dotted}.${key}}`)})`),
  $tokens: dotted => tokenMap(dotted, token => cssValue(valueOf(token))),
  $opacity(property, source) {
    const fallback = source.get('$fallback')
    const color = fallback ? `var(${property}, ${fallback})` : `var(${property})`
    const steps = source.get('$steps') ?? new Map(entries(get(tokens, 'opacity', 'util')).map(([key, token]) => [key, valueOf(token)]))
    return new Map([...steps].map(([key]) => [key, key === '100' ? color : `color-mix(in oklch, ${color} ${key}%, transparent)`]))
  },
  $merge(list) {
    const merged = new Map()
    for (const source of list) {
      for (const [key, value] of values(source)) {
        merged.set(key, value)
      }
    }

    return merged
  },
  $typography(field, source) {
    const keys = source.get('$keys')
    const scale = get(tokens, 'typography', 'size')
    const names = keys ? [...keys] : entries(scale).map(([key]) => [key, key])
    return new Map(names.map(([key, stop]) => {
      const value = valueOf(scale.get(stop))
      if (field === '*') {
        return [key, new Map([['font-size', cssValue(value.get('fontSize'))], ['line-height', cssValue(value.get('lineHeight'))]])]
      }

      return [key, cssValue(value.get(field))]
    }))
  },
  $shadows() {
    const map = new Map(entries(get(tokens, 'shadow')).filter(([key]) => key !== 'inset').map(([key, token]) => {
      const layers = valueOf(token).map(layer => {
        const { offsetY, blur, spread, alpha } = Object.fromEntries(layer)
        return `0 ${offsetY} ${blur}${spread ? ` ${spread}` : ''} color-mix(in oklch, var(--cui-shadow-tint, var(--cui-shadow-color)) calc(${alpha}% * var(--cui-shadow-strength) * var(--cui-shadow-opacity, 1)), transparent)`
      })
      return [key === 'base' ? 'null' : key, layers.length === 1 ? leadingZero(layers[0]) : layers.join(', ')]
    }))
    map.set('none', 'none')
    return map
  }
}

const values = source => {
  if (typeof source === 'string') {
    return new Map([[source, source]])
  }

  if (Array.isArray(source)) {
    return new Map(source.map(value => [value, value]))
  }

  const op = [...source.keys()].find(key => key.startsWith('$'))
  if (op) {
    return sources[op](source.get(op), source)
  }

  return new Map([...source].map(([key, value]) => [key, value === null ? null : cssValue(value)]))
}

const breakpoints = entries(get(tokens, 'breakpoint')).map(([name, token]) => [name, valueOf(token) === '0' ? null : valueOf(token)])

const declarations = (propertyMap, properties, value, indent) => {
  const lines = []
  if (propertyMap) {
    for (const [property, declared] of propertyMap) {
      const actual = value instanceof Map && value.has(property) ? value.get(property) : (declared === null ? value : cssValue(declared))
      if (actual !== null && actual !== undefined) {
        lines.push(`${indent}  ${property}: ${actual};`)
      }
    }
  } else {
    for (const property of properties) {
      lines.push(`${indent}  ${property}: ${value instanceof Map ? value.get(property) : value};`)
    }
  }

  return lines
}

const rules = (name, utility, infix, indent, index, only) => {
  const lines = []
  const property = utility.get('property')
  const propertyMap = property instanceof Map ? property : null
  const properties = Array.isArray(property) ? property : [property]
  let propertyClass = utility.has('class') ? utility.get('class') : (propertyMap ? null : properties[0])
  propertyClass ??= ''
  const prefix = propertyClass === '' && infix.startsWith('-') ? infix.slice(1) : infix
  const selectorType = utility.get('selector') ?? 'class'
  const child = utility.get('child-selector')
  const states = utility.has('state') ? [utility.get('state')].flat() : []

  for (const [key, value] of values(utility.get('values'))) {
    const modifier = key === 'null' ? '' : `${propertyClass === '' && prefix === '' ? '' : '-'}${key}`
    const className = `${propertyClass}${prefix}${modifier}`
    let selector = `.${className}`
    if (selectorType === 'attr-includes') {
      selector = `[class*=${propertyClass}${prefix}]`
    } else if (selectorType === 'attr-starts') {
      selector = `[class^=${propertyClass}${prefix}]`
    }

    if (child) {
      selector = `:where(${selector} ${child})`
    }

    if (value !== null || propertyMap) {
      if (!only || only.has(className)) {
        lines.push(`${indent}${selector} {`, ...declarations(propertyMap, properties, value, indent), `${indent}}`)
      }

      index?.set(className, {
        utility: name, value: key === 'null' ? null : key, breakpoint: infix.slice(1) || null, state: null
      })
      for (const pseudo of states) {
        if (!only || only.has(`${className}-${pseudo}`)) {
          lines.push(`${indent}.${className}-${pseudo}:${pseudo} {`, ...declarations(propertyMap, properties, value, indent), `${indent}}`)
        }

        index?.set(`${className}-${pseudo}`, {
          utility: name, value: key === 'null' ? null : key, breakpoint: infix.slice(1) || null, state: pseudo
        })
      }
    }
  }

  return lines
}

const build = (utilities, { layer = false, index = null, only = null } = {}) => {
  const enabled = [...utilities.entries()].filter(([, utility]) => utility.get('enabled') !== false)
  const emitted = new Map()
  const emit = (key, utility, infix, indent) => {
    const lines = rules(key, utility, infix, indent, index, only)
    if (lines.length > 0) {
      emitted.set(key, utility)
    }

    return lines
  }

  const body = []
  for (const [name, min] of breakpoints) {
    const infix = min ? `-${name}` : ''
    const indent = min ? '    ' : '  '
    const block = []
    for (const [key, utility] of enabled) {
      if (utility.get('responsive') || infix === '') {
        block.push(...emit(key, utility, infix, indent))
      }
    }

    if (min && block.length > 0) {
      body.push(`  @media (width >= ${min}) {`, ...block, '  }')
    } else {
      body.push(...block)
    }
  }

  const printed = []
  for (const [key, utility] of enabled) {
    if (utility.get('print')) {
      printed.push(...emit(key, utility, '-print', '    '))
    }
  }

  if (printed.length > 0) {
    body.push('  @media print {', ...printed, '  }')
  }

  const uses = name => !only || only.has(name)
  if (utilities.has('translate-middle') && (uses('translate-middle') || uses('translate-middle-x'))) {
    body.push(
      '  *[dir=rtl] .translate-middle {', '    transform: translate(50%, -50%);', '  }', '  *[dir=rtl] .translate-middle-x {', '    transform: translateX(50%);', '  }'
    )
  }

  const animated = utilities.has('animation') && (uses('animation-shake') || uses('animation-pop'))
  if (animated) {
    body.push('  @media (prefers-reduced-motion: reduce) {', '    .animation-shake,', '    .animation-pop {', '      animation: none;', '    }', '  }')
  }

  const registered = []
  for (const utility of emitted.values()) {
    if (utility.get('at-property') === false) {
      continue
    }

    const property = utility.get('property')
    const names = property instanceof Map ? [...property.keys()] : [property].flat()
    for (const name of names) {
      if (name.startsWith('--') && !registered.includes(name)) {
        registered.push(name)
      }
    }
  }

  const lines = layer ? [`@layer ${LAYERS.join(', ')};`] : []
  for (const name of registered) {
    lines.push(`@property ${name} {`, '  syntax: "*";', '  inherits: false;', '}')
  }

  lines.push('@layer utilities {', ...body, '}')

  if (animated) {
    lines.push(
      '@keyframes animation-shake {',
      '  10%, 90% {',
      '    transform: translate3d(-1px, 0, 0);',
      '  }',
      '  20%, 80% {',
      '    transform: translate3d(2px, 0, 0);',
      '  }',
      '  30%, 50%, 70% {',
      '    transform: translate3d(-4px, 0, 0);',
      '  }',
      '  40%, 60% {',
      '    transform: translate3d(4px, 0, 0);',
      '  }',
      '}',
      '@keyframes animation-pop {',
      '  from {',
      '    transform: scale(0);',
      '  }',
      '  to {',
      '    transform: scale(1);',
      '  }',
      '}'
    )
  }

  return `${lines.join('\n')}\n`
}

// The utilities stylesheet, byte for byte what scss/utilities/_api.scss compiles to.
export const stylesheet = (utilities, options) => build(utilities, options)

// Every class the stylesheet declares, with the utility, value, breakpoint and
// state behind it — what a build plugin or a type generator asks for.
export const classNames = utilities => {
  const index = new Map()
  build(utilities, { index })
  return index
}

const LITERALS = /'([^'\\]*)'|"([^"\\]*)"|`([^`$\\]*)`/g
const CALLS = [
  /\butilities=\{\[([^\]]*)\]\}/g,
  /(?::utilities|v-bind:utilities)="\[([^\]]*)\]"/g,
  /\bux\(([^)]*)\)/g,
  /\b(?:class|className)=(?:"([^"]*)"|'([^']*)'|\{\s*(?:'([^']*)'|"([^"]*)")\s*\})/g
]

// The utility class names a piece of source uses, read without running it: the
// string literals inside utilities={[…]}, :utilities="[…]" and ux(…), and the
// words of a static class / className attribute. Anything else — a template
// literal with an expression, a computed name — is not seen; safelist those.
export const scan = source => {
  const found = new Set()
  for (const pattern of CALLS) {
    for (const match of source.matchAll(pattern)) {
      const inner = match.slice(1).find(group => group !== undefined) ?? ''
      const literals = [...inner.matchAll(LITERALS)].map(literal => literal.slice(1).find(group => group !== undefined))
      const words = literals.length > 0 ? literals : [inner]
      for (const word of words.flatMap(text => text.split(/\s+/))) {
        if (word) {
          found.add(word)
        }
      }
    }
  }

  return found
}

// scan() over files, keeping only the names the stylesheet actually declares.
export const scanFiles = (files, utilities) => {
  const known = classNames(utilities)
  const used = new Set()
  for (const file of files) {
    for (const name of scan(readFileSync(file, 'utf8'))) {
      if (known.has(name)) {
        used.add(name)
      }
    }
  }

  return used
}

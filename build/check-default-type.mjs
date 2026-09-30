#!/usr/bin/env node

/*!
 * Script to keep `Default` and `DefaultType` in sync.
 * `DefaultType` is what validates data attributes at runtime, so an option
 * present in one and missing from the other is either an unvalidated option or
 * a rule for an option that no longer exists, and a default that does not pass
 * its own rule throws on the plainest `new Component(element)`.
 * Reads the `.ts` sources through the TypeScript AST rather than the built
 * bundle: importing every component at once registers each data-api listener
 * twice, which is exactly the thing the runtime version of this test kept
 * tripping over.
 * Copyright 2026 The CoreUI Authors
 * Copyright 2026 creativeLabs Łukasz Holeczek
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { globby } from 'globby'
import { effectiveEntries, effectiveKeys, readMaps } from './component-options.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const KNOWN_TYPES = new Set([
  'array', 'boolean', 'date', 'element', 'function', 'null', 'number', 'object', 'string', 'undefined'
])

const files = await globby(`${path.join(root, 'js/src').replaceAll('\\', '/')}/**/*.ts`)
const problems = []
let checked = 0

for (const file of files.toSorted()) {
  const { Default, DefaultType } = readMaps(file)

  if (!Default || !DefaultType) {
    continue
  }

  checked++

  const relative = path.relative(root, file)

  const defaultKeys = effectiveKeys(Default, 'Default')
  const defaultTypeKeys = effectiveKeys(DefaultType, 'DefaultType')

  const missingType = [...defaultKeys].filter(key => !defaultTypeKeys.has(key))
  const missingDefault = [...defaultTypeKeys].filter(key => !defaultKeys.has(key))

  if (missingType.length > 0) {
    problems.push(`${relative}: in Default but not in DefaultType — ${missingType.join(', ')}`)
  }

  if (missingDefault.length > 0) {
    problems.push(`${relative}: in DefaultType but not in Default — ${missingDefault.join(', ')}`)
  }

  for (const [key, value] of DefaultType.types) {
    for (const type of value.replaceAll(/[()]/g, '').split('|')) {
      if (!KNOWN_TYPES.has(type.toLowerCase())) {
        problems.push(`${relative}: DefaultType.${key} names an unknown type "${type}" in "${value}"`)
      }
    }
  }

  const declaredTypes = effectiveEntries(DefaultType, 'DefaultType', 'types')

  for (const [key, type] of effectiveEntries(Default, 'Default', 'values')) {
    const expected = declaredTypes.get(key)

    // An element cannot be written as a literal, so an option that expects one
    // carries a `null` placeholder and is handed the real element by the caller
    // or by `_configAfterMerge`. Any other value under such a rule is checked.
    if (!expected || (type === 'null' && expected.includes('element'))) {
      continue
    }

    if (!new RegExp(expected).test(type)) {
      problems.push(`${relative}: Default.${key} is "${type}" but DefaultType.${key} expects "${expected}"`)
    }
  }
}

if (problems.length > 0) {
  console.error(`Found ${problems.length} problem(s) in ${checked} component(s):\n`)
  console.error(problems.map(problem => `  ${problem}`).join('\n'))
  process.exit(1)
}

console.log(`Default and DefaultType agree in all ${checked} components.`)

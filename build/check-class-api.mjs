#!/usr/bin/env node

/*!
 * Script to guard the class API against silent losses.
 * Compares the compiled class list against the v5 snapshot in
 * build/class-api-v5.txt. A class may be removed — but the removal has to be
 * declared in build/class-api-removals.json with a reason, so every one of them
 * has an answer for the user in the migration guide.
 * Copyright 2025 The CoreUI Authors
 * Copyright 2025 creativeLabs Łukasz Holeczek
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const cssPath = path.join(root, 'dist/css/coreui.css')
const baselinePath = path.join(root, 'build/class-api-v5.txt')
const removalsPath = path.join(root, 'build/class-api-removals.json')

// Collects the text that precedes every `{`, which is where selectors live.
// Declarations are discarded at `;` and `}`, so only preludes survive.
function classNames(css) {
  const withoutComments = css.replaceAll(/\/\*[\s\S]*?\*\//g, '')
  const names = new Set()
  let prelude = ''

  for (const char of withoutComments) {
    if (char === '{') {
      for (const match of prelude.matchAll(/\.(-?[_a-zA-Z][\w-]*(?:\\:[\w-]+)?)/g)) {
        names.add(match[1])
      }

      prelude = ''
    } else if (char === '}' || char === ';') {
      prelude = ''
    } else {
      prelude += char
    }
  }

  return names
}

function patternToRegExp(pattern) {
  const escaped = pattern.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
  return new RegExp(`^${escaped.replaceAll(String.raw`\*`, '.*')}$`)
}

const current = classNames(readFileSync(cssPath, 'utf8'))
const baseline = readFileSync(baselinePath, 'utf8').split('\n').filter(Boolean)
const removals = JSON.parse(readFileSync(removalsPath, 'utf8'))

const declared = Object.entries(removals).map(([pattern, reason]) => ({
  pattern,
  reason,
  regexp: patternToRegExp(pattern),
  matched: 0
}))

const gone = baseline.filter(name => !current.has(name))
const undeclared = []

for (const name of gone) {
  const entry = declared.find(({ regexp }) => regexp.test(name))

  if (entry) {
    entry.matched++
  } else {
    undeclared.push(name)
  }
}

const missingReason = declared.filter(({ reason }) => !reason || !reason.trim())
const stale = declared.filter(({ matched }) => matched === 0)

console.log(`Class API: ${baseline.length} classes in the v5 snapshot, ${current.size} compiled now.`)
console.log(`${gone.length} removed, ${current.size - (baseline.length - gone.length)} added.`)

if (gone.length > 0) {
  console.log('\nDeclared removals:')
  for (const { pattern, reason, matched } of declared.filter(entry => entry.matched > 0)) {
    console.log(`  ${pattern} (${matched}) — ${reason}`)
  }
}

let failed = false

if (undeclared.length > 0) {
  failed = true
  console.error(`\nERROR: ${undeclared.length} class(es) disappeared without a declared removal:`)
  for (const name of undeclared) {
    console.error(`  .${name}`)
  }

  console.error(`\nMigration has to stay simple: add each one to build/class-api-removals.json`)
  console.error('with the reason a user needs, and document it in docs/.../migration/v6.mdx.')
}

if (missingReason.length > 0) {
  failed = true
  console.error('\nERROR: declared removals without a reason:')
  for (const { pattern } of missingReason) {
    console.error(`  ${pattern}`)
  }
}

if (stale.length > 0) {
  failed = true
  console.error('\nERROR: declared removals that no longer match anything (stale entries hide the next loss):')
  for (const { pattern } of stale) {
    console.error(`  ${pattern}`)
  }
}

if (failed) {
  process.exit(1)
}

console.log('\nClass API check passed.')

#!/usr/bin/env node

/*!
 * Script to keep every public option documented.
 * Each component exported from `js/src/index.ts` whose `Default` carries keys
 * must list every one of them in the Options table of its docs page, so an
 * option added to the code without a row fails here instead of shipping
 * undocumented.
 * Copyright 2026 The CoreUI Authors
 * Copyright 2026 creativeLabs Łukasz Holeczek
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { effectiveKeys, readMaps } from './component-options.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const docsDir = path.join(root, 'docs/src/content/docs')

const pages = {
  navigation: { page: 'components/sidebar.mdx', heading: 'Navigation options' }
}

const pending = {}

const inherited = {
  dropdown: {
    keys: ['submenuDelay', 'submenuTrigger'],
    reason: 'inherited from Menu; the dropdown markup has no `.submenu > .menu-item` for them to act on'
  },
  'time-input': {
    keys: ['ariaDayLabel', 'ariaMonthLabel', 'ariaQuarterLabel', 'ariaWeekLabel', 'ariaYearLabel', 'dayPlaceholder', 'monthNames', 'monthPlaceholder', 'quarterPlaceholder', 'weekPlaceholder', 'yearPlaceholder'],
    reason: 'inherited from SectionInput for the date sections a time field does not render'
  }
}

const pageOf = file => pages[file] ?? {
  page: [`components/${file}.mdx`, `components/${file}s.mdx`, `forms/${file}.mdx`]
    .find(candidate => existsSync(path.join(docsDir, candidate))),
  heading: 'Options'
}

const documented = (page, heading) => {
  const lines = readFileSync(path.join(docsDir, page), 'utf8').split('\n')
  const start = lines.findIndex(line => new RegExp(`^#{2,4} ${heading}\\s*$`).test(line))

  if (start === -1) {
    return null
  }

  const names = new Set()

  for (const line of lines.slice(start + 1)) {
    if (/^#{1,4} /.test(line)) {
      break
    }

    if (line.includes('|')) {
      const [cell] = line.replace(/^\s*\|/, '').split('|')

      for (const [, name] of cell.matchAll(/`([\w-]+)`/g)) {
        names.add(name)
      }
    }
  }

  return names
}

const plugins = [...readFileSync(path.join(root, 'js/src/index.ts'), 'utf8').matchAll(/^export \{ default as \w+ \} from '\.\/([\w-]+)\.js'/gm)]
  .map(match => match[1])

const problems = []
let checked = 0

for (const file of plugins) {
  const { Default } = readMaps(path.join(root, 'js/src', `${file}.ts`))
  const keys = Default ? [...effectiveKeys(Default, 'Default')].toSorted() : []

  if (keys.length === 0) {
    continue
  }

  checked++

  const { page, heading } = pageOf(file)
  const names = page ? documented(page, heading) : null

  if (!names) {
    problems.push(`js/src/${file}.ts: no "${heading}" table found${page ? ` in ${page}` : ''}; map it in the pages table`)
    continue
  }

  const waiting = new Set([...pending[file]?.keys ?? [], ...inherited[file]?.keys ?? []])
  const missing = keys.filter(key => !names.has(key) && !waiting.has(key))
  const stale = [...waiting].filter(key => names.has(key) || !keys.includes(key))

  if (missing.length > 0) {
    problems.push(`${page}: ${heading} has no row for ${missing.join(', ')} (js/src/${file}.ts)`)
  }

  if (stale.length > 0) {
    problems.push(`build/check-docs-options.mjs: ${stale.join(', ')} listed for ${file} are documented or gone; remove them`)
  }
}

if (problems.length > 0) {
  console.error(`Found ${problems.length} problem(s) in ${checked} component(s):\n`)
  console.error(problems.map(problem => `  ${problem}`).join('\n'))
  process.exit(1)
}

const listed = map => Object.entries(map).map(([file, { keys, reason }]) => `${file} (${keys.length}: ${reason})`).join('; ')

const waitingNote = Object.keys(pending).length > 0 ? ` Waiting: ${listed(pending)}.` : ''

console.log(`Every option of ${checked} components has a row in its docs.${waitingNote} Left out on purpose: ${listed(inherited)}.`)

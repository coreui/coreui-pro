#!/usr/bin/env node

/*!
 * Script to prove that base.css plus every component stylesheet carries exactly
 * the rules of dist/css/coreui.css — no rule lost, none emitted twice.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import postcss from 'postcss'
import { compileString } from 'sass-embedded'
import { stylesheets } from './css-components.mjs'
import { layers, withLayers } from './css-compose.mjs'
import { loadUtilities, stylesheet } from './lib/utilities.mjs'

const scssDir = path.join(process.cwd(), 'scss')

const context = node => {
  const trail = []

  for (let { parent } = node; parent && parent.type !== 'root'; parent = parent.parent) {
    trail.unshift(parent.type === 'atrule' ? `@${parent.name} ${parent.params}` : parent.selector)
  }

  return trail.join(' | ')
}

const rules = css => {
  const counted = new Map()
  let preambles = 0

  postcss.parse(css).walk(node => {
    if (node.type === 'atrule' && !node.nodes) {
      if (node.name === 'layer' || node.name === 'charset') {
        preambles += 1
        return
      }

      const key = `${context(node)} || @${node.name} ${node.params}`
      counted.set(key, (counted.get(key) ?? 0) + 1)
      return
    }

    if (node.type !== 'rule') {
      return
    }

    const declarations = node.nodes.filter(child => child.type === 'decl').map(child => `${child.prop}:${child.value}${child.important ? '!' : ''}`)
    const key = `${context(node)} || ${node.selector} { ${declarations.join('; ')} }`
    counted.set(key, (counted.get(key) ?? 0) + 1)
  })

  return { counted, preambles }
}

const merge = sources => {
  const counted = new Map()
  let preambles = 0

  for (const source of sources) {
    const parsed = rules(source)
    preambles += parsed.preambles

    for (const [key, count] of parsed.counted) {
      counted.set(key, (counted.get(key) ?? 0) + count)
    }
  }

  return { counted, preambles }
}

const { sheets, manifest, tail } = stylesheets()
const split = merge([...sheets.values(), tail])
const compiled = compileString('@forward "coreui";', { loadPaths: [scssDir], style: 'expanded', quietDeps: true }).css
const { css: composed } = withLayers(compiled, layers())
const bundle = rules(`${composed}\n${stylesheet(loadUtilities(), { layer: false })}`)

const report = []
for (const [key, count] of split.counted) {
  const expected = bundle.counted.get(key) ?? 0

  if (count !== expected) {
    report.push(`  split has ${count}, coreui.css has ${expected}: ${key}`)
  }
}

for (const [key, count] of bundle.counted) {
  if (!split.counted.has(key)) {
    report.push(`  split has 0, coreui.css has ${count}: ${key}`)
  }
}

if (split.preambles - bundle.preambles !== (sheets.size - 1) * 2) {
  report.push(`  the split repeats ${split.preambles - bundle.preambles} charset and layer order statements, expected ${(sheets.size - 1) * 2}`)
}

const declaring = new Map()
for (const [name, css] of sheets) {
  postcss.parse(css).walkRules(rule => {
    for (const selector of rule.selectors) {
      const match = selector.match(/^\.([a-zA-Z][\w-]*)$/)

      if (match && !declaring.has(match[1])) {
        declaring.set(match[1], name)
      }
    }
  })
}

const jsDir = path.join(process.cwd(), 'js/src')
const sources = (entry, seen = new Set()) => {
  if (seen.has(entry) || !fs.existsSync(entry)) {
    return []
  }

  seen.add(entry)
  const source = fs.readFileSync(entry, 'utf8')
  const imports = [...source.matchAll(/from '(\.[^']+)\.js'/g)]
    .map(match => path.resolve(path.dirname(entry), `${match[1]}.ts`))

  return [source, ...imports.flatMap(next => sources(next, seen))]
}

for (const name of Object.keys(manifest)) {
  const entry = path.join(jsDir, `${name}.ts`)

  if (!fs.existsSync(entry)) {
    continue
  }

  const allowed = new Set([name, ...manifest[name].requires])

  for (const source of sources(entry)) {
    for (const [, constant, className] of source.matchAll(/^const (CLASS_NAME_[A-Z0-9_]+) = '([^']+)'/gm)) {
      const uses = [...source.matchAll(new RegExp(`\\b${constant}\\b`, 'g'))].length
      const queries = [...source.matchAll(new RegExp(`^const SELECTOR_[A-Z0-9_]+ =.*\\b${constant}\\b`, 'gm'))].length
      const declarer = declaring.get(className)

      if (uses > 1 + queries && declarer && !allowed.has(declarer)) {
        report.push(`  ${name} renders .${className}, which ${declarer}.css declares, but does not require it`)
      }
    }
  }
}

if (report.length > 0) {
  console.error(`✗ base.css plus the component stylesheets do not reconstruct coreui.css:\n${report.slice(0, 20).join('\n')}`)

  if (report.length > 20) {
    console.error(`  … and ${report.length - 20} more`)
  }

  process.exit(1)
}

console.log(`✓ base.css plus ${sheets.size - 1} component stylesheets reconstruct every rule of coreui.css`)

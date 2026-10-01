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
const bundle = rules(compileString('@forward "coreui";', { loadPaths: [scssDir], style: 'expanded', quietDeps: true }).css)

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

const plugins = {
  button: 'buttons',
  'chip-input': 'forms/chip-input',
  collapse: 'transitions',
  'context-menu': 'menu',
  'date-input': 'forms/form-date-time',
  'date-range-input': 'forms/form-date-time',
  'date-range-picker': 'date-picker',
  'multi-select': 'forms/form-multi-select',
  navigation: 'sidebar',
  'number-input': 'forms/number-input',
  'otp-input': 'forms/otp-input',
  'password-input': 'forms/form-control-group',
  'password-strength': 'forms/password-strength',
  range: 'forms/form-range',
  'range-slider': 'range-slider',
  scrollspy: null,
  tab: 'nav',
  'time-input': 'forms/form-date-time',
  toast: 'toasts'
}

const inert = {
  calendar: { 'btn-sm': 'the navigation buttons read none of the tokens it sets' },
  'forms/chip-input': { 'form-floating': 'only a field with a floating label renders it' },
  'forms/form-control-group': { 'form-floating': 'only a field with a floating label renders it' },
  'forms/number-input': { 'form-floating': 'only a field with a floating label renders it' }
}

const entryOf = plugin => Object.hasOwn(plugins, plugin) ? plugins[plugin] : (Object.hasOwn(manifest, plugin) ? plugin : undefined)

const literalClasses = source => [
  ...[...source.matchAll(/\.className = (['`])(.*?)\1/g)].map(match => match[2]),
  ...[...source.matchAll(/classList\.(?:add|toggle)\(([^)]*)\)/g)].flatMap(match => [...match[1].matchAll(/(['`])(.*?)\1/g)].map(quoted => quoted[2])),
  ...[...source.matchAll(/\bclass="([^"]*)"/g)].map(match => match[1])
].flatMap(value => value.replaceAll(/\$\{[^}]*\}/g, ' ').split(/\s+/)).filter(token => /^[a-z][\w-]*$/.test(token))

const instantiated = source => [...source.matchAll(/^import (\w+) from '\.\/([\w-]+)\.js'/gm)]
  .filter(([, binding]) => new RegExp(`\\bnew ${binding}\\(|\\b${binding}\\.getOrCreateInstance\\(`).test(source))
  .map(match => match[2])

const pluginFiles = [...fs.readFileSync(path.join(jsDir, 'index.ts'), 'utf8').matchAll(/^export \{ default as \w+ \} from '\.\/([\w-]+)\.js'/gm)]
  .map(match => match[1])

const found = new Set()
for (const plugin of pluginFiles) {
  const name = entryOf(plugin)

  if (name === null) {
    continue
  }

  if (!name) {
    found.add(`  js/src/${plugin}.ts has no manifest entry of that name and no entry in the plugins table`)
    continue
  }

  const entry = path.join(jsDir, `${plugin}.ts`)
  const label = name === plugin ? name : `${name} (${plugin}.ts)`
  const allowed = new Set([name, ...manifest[name].requires])
  const rendered = []

  for (const source of sources(entry)) {
    for (const [, constant, className] of source.matchAll(/^const (CLASS_NAME_[A-Z0-9_]+) = '([^']+)'/gm)) {
      const uses = [...source.matchAll(new RegExp(`\\b${constant}\\b`, 'g'))].length
      const queries = [...source.matchAll(new RegExp(`^const SELECTOR_[A-Z0-9_]+ =.*\\b${constant}\\b`, 'gm'))].length

      if (uses > 1 + queries) {
        rendered.push([className, ''])
      }
    }
  }

  const pluginSource = fs.readFileSync(entry, 'utf8')
  rendered.push(...literalClasses(pluginSource).map(className => [className, ' as a literal']))

  for (const [className, how] of rendered) {
    const declarer = declaring.get(className)

    if (declarer && !allowed.has(declarer) && !inert[name]?.[className]) {
      found.add(`  ${label} renders .${className}${how}, which ${declarer}.css declares, but does not require it`)
    }
  }

  for (const created of instantiated(pluginSource)) {
    const owner = entryOf(created)

    if (owner && owner !== name && !allowed.has(owner)) {
      found.add(`  ${label} creates a ${created} instance, which ${owner}.css styles, but does not require it`)
    }
  }
}

report.push(...found)

if (report.length > 0) {
  console.error(`✗ base.css plus the component stylesheets do not reconstruct coreui.css:\n${report.slice(0, 20).join('\n')}`)

  if (report.length > 20) {
    console.error(`  … and ${report.length - 20} more`)
  }

  process.exit(1)
}

console.log(`✓ base.css plus ${sheets.size - 1} component stylesheets reconstruct every rule of coreui.css`)

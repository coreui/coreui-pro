#!/usr/bin/env node

/*!
 * Script to compile dist/css/base.css and one stylesheet per component,
 * together with the manifest that records the dependencies between them and
 * the index that records which stylesheet owns which class.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import { compileString } from 'sass-embedded'

const scssDir = path.join(process.cwd(), 'scss')
const outDir = path.join(process.cwd(), 'dist/css')
const componentsDir = path.join(outDir, 'components')

const baseModules = ['layers', 'root', 'layout/tokens', 'content/reboot', 'helpers/theme-colors']
const tailModules = ['helpers', 'utilities/api']

const renders = {
  autocomplete: ['combobox', 'forms/form-control', 'forms/form-control-group'],
  'chip-set': ['chip', 'helpers/visually-hidden'],
  combobox: ['popup', 'list-box'],
  'forms/form-multi-select': ['combobox', 'chip', 'chip-set', 'forms/form-control-group'],
  'list-box': ['forms/check', 'forms/form-control'],
  'loading-button': ['buttons', 'spinner'],
  'date-picker': ['forms/floating-labels', 'forms/form-control', 'forms/form-control-group', 'forms/form-date-time', 'popup'],
  'range-slider': ['tooltip'],
  sidebar: ['transitions'],
  'time-picker': ['forms/floating-labels', 'forms/form-control', 'forms/form-control-group', 'forms/form-date-time', 'popup'],
  transfer: ['list-box', 'buttons', 'helpers/visually-hidden', 'icon']
}

const groups = [
  { name: 'content/typography', modules: ['content/lists', 'content/blockquote'] },
  { name: 'content/images', modules: ['content/images'] },
  { name: 'content/tables', modules: ['content/tables'] },
  { name: 'layout/containers', modules: ['layout/containers'] },
  { name: 'layout/grid', modules: ['layout/grid'] },
  { name: 'forms/labels', modules: ['forms/labels'] },
  { name: 'forms/form-text', modules: ['forms/form-text'] },
  { name: 'forms/form-field', modules: ['forms/form-field'] },
  { name: 'forms/form-control', modules: ['forms/form-control'] },
  { name: 'forms/form-control-group', modules: ['forms/form-control-group'] },
  { name: 'forms/chip-input', modules: ['forms/chip-input'] },
  { name: 'forms/number-input', modules: ['forms/number-input'] },
  { name: 'forms/check', modules: ['forms/check'] },
  { name: 'forms/radio', modules: ['forms/radio'] },
  { name: 'forms/switch', modules: ['forms/switch'] },
  { name: 'forms/form-multi-select', modules: ['forms/form-multi-select'] },
  { name: 'forms/form-range', modules: ['forms/form-range'] },
  { name: 'forms/floating-labels', modules: ['forms/floating-labels'] },
  { name: 'forms/input-group', modules: ['forms/input-group'] },
  { name: 'forms/validation', modules: ['forms/validation'] },
  { name: 'forms/form-date-time', modules: ['forms/form-date-time'] },
  { name: 'forms/otp-input', modules: ['forms/otp-input'] },
  { name: 'forms/password-strength', modules: ['forms/password-strength'] },
  { name: 'buttons', modules: ['buttons/button', 'buttons/button-group'] },
  { name: 'close', modules: ['buttons/close'] },
  { name: 'loading-button', modules: ['buttons/loading-button'] },
  { name: 'search-button', modules: ['buttons/search-button'] },
  { name: 'accordion', modules: ['accordion'] },
  { name: 'alert', modules: ['alert'] },
  { name: 'autocomplete', modules: ['autocomplete'] },
  { name: 'avatar', modules: ['avatar'] },
  { name: 'badge', modules: ['badge'] },
  { name: 'breadcrumb', modules: ['breadcrumb'] },
  { name: 'calendar', modules: ['calendar'] },
  { name: 'callout', modules: ['callout'] },
  { name: 'card', modules: ['card'] },
  { name: 'carousel', modules: ['carousel'] },
  { name: 'chip', modules: ['chip'] },
  { name: 'chip-set', modules: ['chip-set'] },
  { name: 'combobox', modules: ['combobox'] },
  { name: 'date-picker', modules: ['date-picker'] },
  { name: 'dialog', modules: ['dialog'] },
  { name: 'drawer', modules: ['drawer'] },
  { name: 'dropdown', modules: ['dropdown'] },
  { name: 'header', modules: ['header'] },
  { name: 'icon', modules: ['icon'] },
  { name: 'list-box', modules: ['list-box'] },
  { name: 'list-group', modules: ['list-group'] },
  { name: 'menu', modules: ['menu'] },
  { name: 'modal', modules: ['modal'] },
  { name: 'nav', modules: ['nav'] },
  { name: 'navbar', modules: ['navbar'] },
  { name: 'offcanvas', modules: ['offcanvas'] },
  { name: 'pagination', modules: ['pagination'] },
  { name: 'placeholder', modules: ['placeholder'] },
  { name: 'popover', modules: ['popover'] },
  { name: 'popup', modules: ['popup'] },
  { name: 'progress', modules: ['progress'] },
  { name: 'range-slider', modules: ['range-slider'] },
  { name: 'rating', modules: ['rating'] },
  { name: 'sidebar', modules: ['sidebar'] },
  { name: 'spinner', modules: ['spinner'] },
  { name: 'stepper', modules: ['stepper'] },
  { name: 'time-picker', modules: ['time-picker'] },
  { name: 'toasts', modules: ['toasts'] },
  { name: 'toaster', modules: ['toaster'] },
  { name: 'tooltip', modules: ['tooltip'] },
  { name: 'transfer', modules: ['transfer'] },
  { name: 'transitions', modules: ['transitions'] },
  { name: 'helpers/visually-hidden', modules: ['helpers/visually-hidden'] }
]

const sassOptions = { loadPaths: [scssDir], style: 'expanded', quietDeps: true }

const resolve = (fromFile, spec) => {
  const bases = spec.startsWith('.') ? [path.dirname(fromFile)] : [path.dirname(fromFile), scssDir]

  for (const base of bases) {
    const target = path.resolve(base, spec)
    const dir = path.dirname(target)
    const name = path.basename(target)
    const candidates = [
      path.join(dir, `_${name}.scss`),
      path.join(dir, `${name}.scss`),
      path.join(target, '_index.scss'),
      path.join(target, 'index.scss')
    ]

    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate
      }
    }
  }

  throw new Error(`Cannot resolve "${spec}" from ${fromFile}`)
}

const idOf = file => {
  const relative = path.relative(scssDir, file).replace(/\.scss$/, '')
  return relative.replace(/(^|\/)_/, '$1').replace(/\/index$/, '')
}

const directUses = file => {
  const source = fs.readFileSync(file, 'utf8')
  const specs = [...source.matchAll(/^@(?:use|forward)\s+["']([^"']+)["']/gm)].map(match => match[1])
  return specs.filter(spec => !spec.startsWith('sass:')).map(spec => resolve(file, spec))
}

const loadOrder = (files, seen = new Set()) => {
  const order = []

  for (const file of files) {
    if (seen.has(file)) {
      continue
    }

    seen.add(file)
    order.push(...loadOrder(directUses(file), seen), file)
  }

  return order
}

const compileCache = new Map()
const compile = source => {
  if (!compileCache.has(source)) {
    compileCache.set(source, compileString(source, sassOptions).css.replace(/^@charset "UTF-8";\n/, ''))
  }

  return compileCache.get(source)
}

const expand = id => {
  const file = resolve(scssDir, id)
  return path.basename(file).startsWith('_') ? [file] : directUses(file)
}

const named = [{ name: 'base', modules: baseModules }, ...groups]
const groupFiles = new Map(named.map(group => [group.name, group.modules.flatMap(id => expand(id))]))

const ownerOf = new Map()
for (const group of named) {
  for (const file of groupFiles.get(group.name)) {
    ownerOf.set(file, group.name)
  }
}

// Whatever helpers and utilities nothing else claims still ship in coreui-utilities.css.
const tailFiles = tailModules.flatMap(id => expand(id)).filter(file => !ownerOf.has(file))
groupFiles.set('utilities', tailFiles)
for (const file of tailFiles) {
  ownerOf.set(file, 'utilities')
}

const allGroups = [...named, { name: 'utilities', modules: tailFiles.map(file => idOf(file)) }]
const groupByName = new Map(allGroups.map(group => [group.name, group]))

const ruleFree = new Set()
const dependsOn = name => {
  const order = []

  for (const file of loadOrder(groupFiles.get(name))) {
    const owner = ownerOf.get(file)

    if (!owner) {
      ruleFree.add(file)
      continue
    }

    if (owner !== name && !order.includes(owner)) {
      order.push(owner)
    }
  }

  return order
}

const ownCssCache = new Map()
const ownCss = name => {
  if (ownCssCache.has(name)) {
    return ownCssCache.get(name)
  }

  const prefix = dependsOn(name).map(dependency => ownCss(dependency)).filter(Boolean).join('\n')
  const compiled = compile(groupByName.get(name).modules.map(id => `@forward "${id}";`).join('\n'))

  if (prefix && !compiled.startsWith(`${prefix}\n`)) {
    throw new Error(`Sass did not emit ${name} after its dependencies — the split cannot be derived safely`)
  }

  const own = prefix ? compiled.slice(prefix.length + 1) : compiled
  ownCssCache.set(name, own)
  return own
}

const banner = file => compile(`@use "banner" with ($file: "${file}");`).trim()
const layerOrder = '@layer colors, config, root, reboot, layout, content, forms, components, custom, helpers, utilities;'

const label = name => {
  const words = name.split('/').at(-1).replaceAll('-', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

const render = name => {
  const css = ownCss(name).trimStart()
  const order = css.startsWith(layerOrder) ? '' : `${layerOrder}\n`

  return `@charset "UTF-8";\n${banner(label(name))}\n${order}${css}`
}

const closure = name => {
  const reached = new Set()
  const queue = [...dependsOn(name), ...(renders[name] ?? [])]

  while (queue.length > 0) {
    const next = queue.pop()

    if (next === 'base' || next === name || reached.has(next) || ownCss(next).length === 0) {
      continue
    }

    reached.add(next)
    queue.push(...dependsOn(next), ...(renders[next] ?? []))
  }

  return [...reached].toSorted()
}

const compounds = selector => {
  let stripped = selector
  let previous

  do {
    previous = stripped
    stripped = stripped.replace(/\(([^()]*)\)/g, '')
  } while (stripped !== previous)

  return stripped.trim().split(/[\s>+~]+/).filter(Boolean)
}

const soleClass = compound => {
  const match = compound.match(/^\.([a-zA-Z][\w-]*)(?::+[\w-]+)*$/)
  return match ? match[1] : null
}

const claim = (map, className, name) => {
  if (!map.has(className)) {
    map.set(className, new Set())
  }

  map.get(className).add(name)
}

export const classIndex = sheets => {
  const declared = new Map()
  const mentioned = new Map()

  for (const [name, css] of sheets) {
    if (name === 'base') {
      continue
    }

    postcss.parse(css).walkRules(rule => {
      for (const selector of rule.selectors) {
        const parts = compounds(selector)
        const own = parts.length === 1 ? soleClass(parts[0]) : null

        if (own) {
          claim(declared, own, name)
        }

        for (const [, className] of parts.join(' ').matchAll(/\.([a-zA-Z][\w-]*)/g)) {
          claim(mentioned, className, name)
        }
      }
    })
  }

  const index = new Map()

  for (const [className, names] of declared) {
    const owner = names.size === 1 ? [...names][0] : [...names].find(name => name.split('/').at(-1) === className)

    if (owner) {
      index.set(className, owner)
    }
  }

  for (const [className, names] of mentioned) {
    if (!declared.has(className) && names.size === 1) {
      index.set(className, [...names][0])
    }
  }

  return Object.fromEntries([...index].toSorted(([a], [b]) => a.localeCompare(b)))
}

export const stylesheets = () => {
  const sheets = new Map([['base', render('base')]])
  const manifest = { base: { file: 'base.css', order: 0, requires: [] } }

  for (const group of groups) {
    const requires = closure(group.name)

    if (requires.includes('utilities')) {
      throw new Error(`${group.name} depends on the helpers and utilities stylesheet, which is not a component file`)
    }

    sheets.set(group.name, render(group.name))
    manifest[group.name] = { file: `components/${group.name}.css`, order: groups.indexOf(group) + 1, requires }
  }

  for (const file of ruleFree) {
    if (compile(`@forward "${idOf(file)}";`).length > 0) {
      throw new Error(`${idOf(file)} emits CSS but belongs to no stylesheet — add it to base.css or to a component group`)
    }
  }

  return {
    sheets, manifest, classes: classIndex(sheets), renders, tail: ownCss('utilities'), layerOrder
  }
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const { sheets, manifest, classes } = stylesheets()

  fs.rmSync(componentsDir, { recursive: true, force: true })

  for (const [name, css] of sheets) {
    const target = name === 'base' ? path.join(outDir, 'base.css') : path.join(componentsDir, `${name}.css`)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, css)
    console.log(`\u2713 ${path.relative(process.cwd(), target)} (${css.length} B)`)
  }

  const manifestPath = path.join(componentsDir, 'manifest.json')
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`\u2713 ${path.relative(process.cwd(), manifestPath)}`)

  const classesPath = path.join(componentsDir, 'classes.json')
  fs.writeFileSync(classesPath, `${JSON.stringify(classes, null, 2)}\n`)
  console.log(`\u2713 ${path.relative(process.cwd(), classesPath)} (${Object.keys(classes).length} classes)`)
}

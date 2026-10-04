#!/usr/bin/env node

/*!
 * Script to check that the packed tarball carries, next to every plugin file
 * in js/dist, the ES module and both declarations the exports map points at,
 * and every js/ and dist/js/ file the exports map names directly.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const [{ files }] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8' }))
const shipped = new Set(files.map(file => file.path))
const { exports } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const problems = []

const plugins = [...shipped].filter(file => /^js\/dist\/.+\.js$/.test(file))

if (plugins.length === 0) {
  problems.push('no plugin files under js/dist — run the build first')
}

for (const plugin of plugins) {
  const base = plugin.replace(/\.js$/, '')

  for (const companion of [`${base}.mjs`, `${base}.d.ts`, `${base}.d.mts`]) {
    if (!shipped.has(companion)) {
      problems.push(`${plugin} ships without ${companion}`)
    }
  }
}

const targets = entry => typeof entry === 'string' ? [entry] : Object.values(entry).flatMap(targets)

for (const target of Object.values(exports).flatMap(targets)) {
  const file = target.replace(/^\.\//, '')

  if (!file.includes('*') && /^(js|dist\/js)\//.test(file) && !shipped.has(file)) {
    problems.push(`the exports map names ${file}, which the package does not ship`)
  }
}

if (problems.length > 0) {
  console.error(`Found ${problems.length} problem(s) in the packed files:\n`)
  console.error(problems.map(problem => `  ${problem}`).join('\n'))
  process.exit(1)
}

console.log(`The package ships the ES module and both declarations for all ${plugins.length} plugin files.`)

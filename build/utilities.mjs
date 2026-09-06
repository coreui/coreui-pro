#!/usr/bin/env node

/*!
 * Script to write the utilities stylesheet from utilities.json and tokens.json.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * `--check` compiles scss/utilities/_api.scss with Sass and exits 1 unless the
 * two stylesheets are byte-identical. Every other `.json` argument is a user
 * file merged over utilities.json (a key replaces the whole entry, `null`
 * removes it, a new key is appended); `--only` keeps just the keys those
 * files name. A `.css` argument is the output path, otherwise stdout.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LAYERS, loadUtilities, stylesheet } from './lib/utilities.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')
const only = process.argv.includes('--only')
const output = process.argv.find(argument => !argument.startsWith('-') && argument.endsWith('.css'))
const files = process.argv.slice(2).filter(argument => argument.endsWith('.json'))

const css = stylesheet(loadUtilities({ files, only }), { layer: files.length > 0 })

if (check) {
  const rootScss = readFileSync(path.join(root, 'scss/_root.scss'), 'utf8')
  if (!rootScss.includes(`@layer ${LAYERS.join(', ')};`)) {
    console.error('utilities: the layer order in build/lib/utilities.mjs differs from scss/_root.scss')
    process.exit(1)
  }

  const { compile } = await import('sass-embedded')
  const compiled = `${compile(path.join(root, 'scss/utilities/_api.scss'), { style: 'expanded' }).css}\n`
  if (compiled !== css) {
    const expected = compiled.split('\n')
    const actual = css.split('\n')
    const line = expected.findIndex((text, index) => text !== actual[index])
    console.error(`utilities: generated stylesheet differs from Sass at line ${line + 1}:\n  sass: ${expected[line]}\n  json: ${actual[line]}`)
    process.exit(1)
  }

  console.log('utilities: generated stylesheet matches Sass')
} else if (output) {
  writeFileSync(output, css)
} else {
  process.stdout.write(css)
}

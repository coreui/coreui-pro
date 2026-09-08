#!/usr/bin/env node

/*!
 * Script to write the colors, root, layout-token and theme-class layers from
 * tokens.json.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * The stylesheets ship what Sass emits; the generator is here for builds
 * without Sass and as the gate on the maps. `--check` compiles
 * scss/tokens/_api.scss and exits 1 unless the generated layers are
 * byte-identical to what Sass writes from the same maps, and does the same for
 * the Bootstrap theme, whose token overlay respells prefix and palette.
 */

import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { LAYERS, loadTokens } from './lib/root.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

export const layers = ({ prefix = 'cui-', dataInfix = '-coreui-', overlays = [] } = {}) => {
  const tokens = loadTokens(overlays.map(file => path.join(root, file)))
  return new Map([...LAYERS].map(([name, build]) => [name, build({ tokens, prefix, dataInfix })]))
}

const fail = message => {
  console.error(`layers: ${message}`)
  process.exit(1)
}

const diff = (sass, json) => {
  const want = sass.split('\n')
  const got = json.split('\n')
  const line = want.findIndex((text, index) => text !== got[index])
  return `at line ${line + 1}:\n  sass: ${want[line]}\n  json: ${got[line]}`
}

const checkLibrary = async compile => {
  const compiled = `${compile(path.join(root, 'scss/tokens/_api.scss'), { style: 'expanded' }).css}\n`
  const [order, ...rest] = compiled.split('\n')

  if (!order.startsWith('@layer ')) {
    fail('the compiled reference does not open with the layer order')
  }

  const expected = [...layers().values()].join('')

  if (rest.join('\n') !== expected) {
    fail(`generated layers differ from Sass ${diff(rest.join('\n'), expected)}`)
  }
}

// The theme has no reference file of its own — its palette and prefix come from
// a `with ()` block only the entrypoint can carry — so the generated layers are
// looked up in the compiled theme instead, in the order they are written.
const checkTheme = async compile => {
  const compiled = compile(path.join(root, 'scss/themes/bootstrap/bootstrap.scss'), {
    style: 'expanded',
    quietDeps: true
  }).css
  let previous = -1

  for (const [name, block] of layers({ prefix: 'bs-', dataInfix: '-bs-', overlays: ['scss/themes/bootstrap/tokens.json'] })) {
    const at = compiled.indexOf(block.trimEnd())

    if (at === -1) {
      fail(`the Bootstrap theme does not emit the generated ${name} layer`)
    }

    if (at < previous) {
      fail(`the Bootstrap theme emits the generated ${name} layer out of order`)
    }

    previous = at
  }
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url) && process.argv.includes('--check')) {
  const { compile } = await import('sass-embedded')
  await checkLibrary(compile)
  await checkTheme(compile)
  console.log('layers: generated layers match Sass')
}

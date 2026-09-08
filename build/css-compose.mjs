#!/usr/bin/env node

/*!
 * Script to compose the compiled stylesheets with the layers written from
 * tokens.json and utilities.json.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * Sass leaves a `/*! @coreui:<layer> *\/` comment where each generated layer
 * belongs and the composition swaps the comment for the layer, so a block that
 * sits in the middle of the sheet keeps its position without splitting the
 * entry file. The utilities layer has no comment: it goes in ahead of the
 * source map annotation, which Sass leaves last and which keeps mapping the
 * part Sass wrote. Mappings for the lines below an insertion are shifted by
 * padding the annotation's `mappings` with empty groups.
 *
 * `--check` compiles scss/tokens/_api.scss and exits 1 unless the generated
 * layers are byte-identical to what Sass emits from the same maps.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { LAYERS, loadTokens } from './lib/root.mjs'
import { loadUtilities, stylesheet } from './lib/utilities.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

export const ENTRYPOINTS = [
  { file: 'dist/css/coreui.css', utilities: true },
  { file: 'dist/css/coreui-grid.css' },
  { file: 'dist/css/coreui-reboot.css' },
  { file: 'dist/css/coreui-utilities.css', utilities: true },
  {
    file: 'dist/css/themes/bootstrap/bootstrap.css',
    prefix: 'bs-',
    dataInfix: '-bs-',
    overlays: ['scss/themes/bootstrap/tokens.json'],
    utilities: true
  }
]

export const MARKER = /^\/\*! @coreui:([a-z-]+) \*\/$/

export const layers = ({ prefix = 'cui-', dataInfix = '-coreui-', overlays = [] } = {}) => {
  const tokens = loadTokens(overlays.map(file => path.join(root, file)))
  return new Map([...LAYERS].map(([name, build]) => [name, build({ tokens, prefix, dataInfix })]))
}

export const withUtilities = (compiled, css) => {
  const annotation = /\n\/\*# sourceMappingURL=[^\n]*\*\/\n?$/.exec(compiled)

  if (!annotation) {
    throw new Error('the compiled stylesheet ends without a source map annotation')
  }

  return compiled.slice(0, annotation.index) + css + annotation[0]
}

export const withLayers = (compiled, generated) => {
  const lines = compiled.split('\n')
  const edits = []

  for (const [index, line] of lines.entries()) {
    const match = MARKER.exec(line)

    if (!match) {
      continue
    }

    const block = generated.get(match[1])

    if (!block) {
      throw new Error(`no generated layer named ${match[1]}`)
    }

    const body = block.split('\n').slice(0, -1)
    lines[index] = body.join('\n')
    edits.push({ line: index, added: body.length - 1 })
  }

  return { css: lines.join('\n'), edits }
}

// Segments are relative within a line and to the previous segment, so inserting
// empty groups leaves every existing mapping correct.
export const padMappings = (mappings, edits) => {
  const groups = mappings.split(';')

  for (const { line, added } of edits.toSorted((a, b) => b.line - a.line)) {
    while (groups.length < line + 1) {
      groups.push('')
    }

    groups.splice(line + 1, 0, ...Array.from({ length: added }, () => ''))
  }

  return groups.join(';')
}

const compose = entrypoint => {
  const file = path.join(process.cwd(), entrypoint.file)
  const generated = layers(entrypoint)
  const { css, edits } = withLayers(fs.readFileSync(file, 'utf8'), generated)
  const utilities = entrypoint.utilities ? stylesheet(loadUtilities(), { layer: false, prefix: entrypoint.prefix }) : ''

  fs.writeFileSync(file, utilities ? withUtilities(css, utilities) : css)

  const mapFile = `${file}.map`

  if (edits.length > 0 && fs.existsSync(mapFile)) {
    const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'))
    map.mappings = padMappings(map.mappings, edits)
    fs.writeFileSync(mapFile, JSON.stringify(map))
  }

  return edits.length
}

const check = async () => {
  const { compile } = await import('sass-embedded')
  const compiled = `${compile(path.join(root, 'scss/tokens/_api.scss'), { style: 'expanded' }).css}\n`
  // scss/tokens/_api.scss loads scss/_root.scss for the maps, so the compiled
  // reference opens with the layer order and the markers that file emits.
  const [order, ...rest] = compiled.split('\n')
  const body = rest.filter(line => !MARKER.test(line)).join('\n')

  if (!order.startsWith('@layer ')) {
    console.error('layers: the compiled reference does not open with the layer order')
    process.exit(1)
  }

  const expected = [...layers().values()].join('')

  if (body !== expected) {
    const want = body.split('\n')
    const got = expected.split('\n')
    const line = want.findIndex((text, index) => text !== got[index])
    console.error(`layers: generated layers differ from Sass at line ${line + 1}:\n  sass: ${want[line]}\n  json: ${got[line]}`)
    process.exit(1)
  }

  console.log('layers: generated layers match Sass')
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) {
    await check()
  } else {
    for (const entrypoint of ENTRYPOINTS) {
      try {
        console.log(`✓ ${entrypoint.file}: ${compose(entrypoint)} generated layer(s)`)
      } catch (error) {
        console.error(`✗ ${entrypoint.file}: ${error.message}`)
        process.exit(1)
      }
    }
  }
}

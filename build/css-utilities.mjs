#!/usr/bin/env node

/*!
 * Script to append the generated utilities layer to the compiled stylesheets.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * The layer goes in ahead of the source map annotation, which Sass leaves last
 * and which keeps mapping the part Sass wrote.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { loadUtilities, stylesheet } from './lib/utilities.mjs'

export const targets = ['dist/css/coreui.css', 'dist/css/coreui-utilities.css']

export const withUtilities = (compiled, css) => {
  const annotation = /\n\/\*# sourceMappingURL=[^\n]*\*\/\n?$/.exec(compiled)

  if (!annotation) {
    throw new Error('the compiled stylesheet ends without a source map annotation')
  }

  return compiled.slice(0, annotation.index) + css + annotation[0]
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const css = stylesheet(loadUtilities(), { layer: false })

  for (const target of targets) {
    const file = path.join(process.cwd(), target)

    try {
      fs.writeFileSync(file, withUtilities(fs.readFileSync(file, 'utf8'), css))
    } catch (error) {
      console.error(`✗ ${target}: ${error.message}`)
      process.exit(1)
    }

    console.log(`✓ ${target} + ${css.split('\n').length - 1} lines of utilities`)
  }
}

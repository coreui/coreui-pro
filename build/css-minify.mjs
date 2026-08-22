#!/usr/bin/env node

/*!
 * Script to minify the compiled CSS with lightningcss.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This is a modified version of the Bootstrap's build/css-minify.mjs,
 * including the `Features.LightDark` exclusion. Deviations: the walk recurses,
 * because the themed build lives in dist/css/themes/; browserslist is a static
 * import rather than an optional dynamic one; and the per-file logging is
 * trimmed.
 * Copyright 2017-2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import browserslist from 'browserslist'
import { Features, browserslistToTargets, transform } from 'lightningcss'

const distDir = path.join(process.cwd(), 'dist/css')

// The themed build sits in a subdirectory, so the walk has to recurse.
const collect = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const entryPath = path.join(dir, entry.name)

  if (entry.isDirectory()) {
    return collect(entryPath)
  }

  return entry.name.endsWith('.css') && !entry.name.endsWith('.min.css') ? [entryPath] : []
})

const cssFiles = collect(distDir)

const targets = browserslistToTargets(browserslist())

for (const inputPath of cssFiles) {
  const outputPath = inputPath.replace(/\.css$/, '.min.css')
  const mapPath = `${outputPath}.map`
  const inputMapPath = `${inputPath}.map`

  try {
    const result = transform({
      filename: path.basename(inputPath),
      code: fs.readFileSync(inputPath),
      minify: true,
      sourceMap: true,
      inputSourceMap: fs.existsSync(inputMapPath) ? fs.readFileSync(inputMapPath, 'utf8') : undefined,
      targets,
      // Lowering `light-dark()` rewrites it into a pair of custom properties
      // resolved by a media query, which cannot see `data-coreui-theme` — the
      // forced theme would follow the system instead. The browser floor already
      // requires native support.
      exclude: Features.LightDark
    })

    fs.writeFileSync(outputPath, `${result.code.toString()}\n/*# sourceMappingURL=${path.basename(mapPath)} */`)

    if (result.map) {
      fs.writeFileSync(mapPath, result.map.toString())
    }

    console.log(`✓ ${path.relative(process.cwd(), inputPath)} → ${path.basename(outputPath)}`)
  } catch (error) {
    console.error(`✗ ${path.relative(process.cwd(), inputPath)}:`, error.message)
    process.exit(1)
  }
}

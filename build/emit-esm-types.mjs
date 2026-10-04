#!/usr/bin/env node

/*!
 * Script to copy the emitted declarations to `.d.mts` for the `.mjs` files.
 * Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { globby } from 'globby'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.resolve(__dirname, '../js/dist/').replace(/\\/g, '/')

const declarations = await globby(`${distPath}/**/*.d.ts`)

await Promise.all(declarations.map(async file => {
  const source = await fs.readFile(file, 'utf8')
  const esm = source.replace(/(from\s+|import\()(['"])(\.{1,2}\/[^'"]+?)\.js\2/g, '$1$2$3.mjs$2')

  await fs.writeFile(file.replace(/\.d\.ts$/, '.d.mts'), esm)
}))

console.log(`Copied ${declarations.length} declarations to .d.mts`)

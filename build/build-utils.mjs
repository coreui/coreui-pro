#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rolldown } from 'rolldown'
import banner from './banner.mjs'
import browserTargets from './browser-targets.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const UTILS = ['calendar', 'date-sections', 'time']

const bundle = await rolldown({
  input: Object.fromEntries(UTILS.map(name => [name, path.resolve(__dirname, `../js/src/util/${name}.ts`)])),
  resolve: {
    extensionAlias: { '.js': ['.ts', '.js'] }
  },
  transform: {
    target: browserTargets()
  }
})

await bundle.write({
  banner: chunk => banner(`util/${chunk.name}.ts`),
  dir: path.resolve(__dirname, '../js/dist/util'),
  entryFileNames: '[name].mjs',
  format: 'esm',
  generatedCode: { preset: 'es2015' },
  sourcemap: true
})

await bundle.close()

console.log(`Built the ESM utils: ${UTILS.join(', ')}`)

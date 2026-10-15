#!/usr/bin/env node

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rolldown } from 'rolldown'
import banner from './banner.mjs'
import browserTargets from './browser-targets.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const UTILS = ['announce', 'calendar', 'chip-values', 'date-sections', 'field-label', 'focus', 'form-validation', 'list-navigation', 'option-tree', 'range', 'selection-state', 'time', 'transfer']

const bundle = await rolldown({
  input: Object.fromEntries(UTILS.map(name => [name, path.resolve(__dirname, `../js/src/util/${name}.ts`)])),
  resolve: {
    extensionAlias: { '.js': ['.ts', '.js'] }
  },
  transform: {
    target: browserTargets()
  }
})

const { output } = await bundle.write({
  banner: chunk => banner(chunk.isEntry ? `util/${chunk.name}.ts` : chunk.moduleIds.map(id => path.relative(path.resolve(__dirname, '../js/src'), id)).join(', ')),
  chunkFileNames: '[name]-[hash].mjs',
  comments: { jsdoc: false },
  dir: path.resolve(__dirname, '../js/dist/util'),
  entryFileNames: '[name].mjs',
  format: 'esm',
  generatedCode: { preset: 'es2015' },
  sourcemap: true
})

await bundle.close()

const misnamed = output.filter(file => file.type === 'chunk' && !file.fileName.endsWith('.mjs'))

if (misnamed.length > 0) {
  throw new Error(`The ESM utils must end in .mjs, the package has no "type": "module": ${misnamed.map(file => file.fileName).join(', ')}`)
}

console.log(`Built the ESM utils: ${UTILS.join(', ')}`)

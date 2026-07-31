#!/usr/bin/env node

/*!
 * Script to build our plugins to use them separately.
 * Copyright 2020-2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { globby } from 'globby'
import { rolldown } from 'rolldown'
import banner from './banner.mjs'
import browserTargets from './browser-targets.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const sourcePath = path.resolve(__dirname, '../js/src/').replace(/\\/g, '/')
const tsFiles = await globby(`${sourcePath}/**/*.{js,ts}`)

// Array which holds the resolved plugins
const resolvedPlugins = []

// Trims the extension and uppercases => first letter, hyphens, backslashes & slashes
const filenameToEntity = filename => filename.replace(/\.[jt]s$/, '')
  .replace(/(?:^|-|\/|\\)[a-z]/g, str => str.slice(-1).toUpperCase())

for (const file of tsFiles) {
  resolvedPlugins.push({
    src: file,
    // TypeScript sources still emit a `.js` plugin
    dist: file.replace('src', 'dist').replace(/\.ts$/, '.js'),
    fileName: path.basename(file),
    className: filenameToEntity(path.basename(file))
  })
}

// The browser global a specifier resolves to in the UMD wrapper. Local files
// map to their class name (`./util/index.js` → `Index`); packages keep the
// same globals the dist bundles use.
const PACKAGE_GLOBALS = {
  '@floating-ui/core': 'FloatingUICore',
  '@floating-ui/dom': 'FloatingUIDOM'
}

// Rolldown hands the globals function resolved ids: absolute paths for local
// files, bare specifiers for packages.
const globalFor = source => {
  if (!path.isAbsolute(source) && !source.startsWith('.')) {
    const known = PACKAGE_GLOBALS[source]
    if (!known) {
      throw new Error(`Package ${source} has no UMD global mapped!`)
    }

    return known
  }

  const target = source.replace(/^\.{1,2}\//, '').replace(/\.[jt]s$/, '')
  const usedPlugin = resolvedPlugins.find(plugin => {
    return plugin.src.replace(/\.[jt]s$/, '').endsWith(target)
  })

  if (!usedPlugin) {
    throw new Error(`Source ${source} is not mapped!`)
  }

  return usedPlugin.className
}

const build = async plugin => {
  const bundle = await rolldown({
    input: plugin.src,
    // Keep every import external, so each plugin file mirrors its source module
    external: () => true,
    resolve: {
      // Map ESM-style `.js` specifiers to the `.ts` sources on disk
      extensionAlias: { '.js': ['.ts', '.js'] }
    },
    transform: {
      target: browserTargets()
    }
  })

  await bundle.write({
    banner: banner(plugin.fileName),
    format: 'umd',
    name: plugin.className,
    sourcemap: true,
    globals: globalFor,
    generatedCode: { preset: 'es2015' },
    file: plugin.dist
  })

  await bundle.close()

  console.log(`Built ${plugin.className}`)
}

(async () => {
  try {
    const basename = path.basename(__filename)
    const timeLabel = `[${basename}] finished`

    console.log('Building individual plugins...')
    console.time(timeLabel)

    await Promise.all(Object.values(resolvedPlugins).map(plugin => build(plugin)))

    console.timeEnd(timeLabel)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()

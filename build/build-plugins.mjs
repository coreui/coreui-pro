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
const distPath = path.resolve(__dirname, '../js/dist/').replace(/\\/g, '/')
const tsFiles = await globby(`${sourcePath}/**/*.{js,ts}`)

// Array which holds the resolved plugins
const resolvedPlugins = []

// Trims the extension and uppercases => first letter, hyphens, backslashes & slashes
const filenameToEntity = filename => filename.replace(/\.[jt]s$/, '')
  .replace(/(?:^|-|\/|\\)[a-z]/g, str => str.slice(-1).toUpperCase())

const componentFiles = new Set(tsFiles.filter(file => path.dirname(file) === sourcePath).map(file => path.basename(file)))

// build-utils.mjs writes these as self-contained ESM for the React and Vue packages
const bundledUtils = new Set(['announce', 'calendar', 'date-sections', 'range', 'time'].map(name => `${sourcePath}/util/${name}.ts`))

for (const file of tsFiles) {
  const fileName = path.basename(file)
  const shadowsComponent = path.dirname(file) !== sourcePath && fileName !== 'index.ts' && componentFiles.has(fileName)

  resolvedPlugins.push({
    src: file,
    // TypeScript sources still emit a `.js` plugin
    dist: file.replace(sourcePath, distPath).replace(/\.ts$/, '.js'),
    esmDist: bundledUtils.has(file) ? null : file.replace(sourcePath, distPath).replace(/\.ts$/, '.mjs'),
    fileName,
    className: `${filenameToEntity(fileName)}${shadowsComponent ? 'Util' : ''}`
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

// Rolldown hands output.paths the absolute path of a local import; the ESM file
// imports its sibling `.mjs` by a path relative to itself.
const esmSpecifier = (from, id) => {
  const target = path.relative(path.dirname(from), id.replace(sourcePath, distPath)).replace(/\\/g, '/').replace(/\.[jt]s$/, '.mjs')

  return target.startsWith('.') ? target : `./${target}`
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

  const { output: [chunk] } = await bundle.write({
    banner: banner(plugin.fileName),
    format: 'umd',
    name: plugin.className,
    sourcemap: true,
    globals: globalFor,
    generatedCode: { preset: 'es2015' },
    file: plugin.dist
  })

  // A named export puts the UMD file in named mode, so require() returns an object instead of the plugin
  if (path.dirname(plugin.src) === sourcePath && plugin.fileName !== 'index.ts' && chunk.exports.some(name => name !== 'default')) {
    throw new Error(`${plugin.fileName} exports ${chunk.exports.join(', ')}; a plugin file exports only its default`)
  }

  if (plugin.esmDist) {
    await bundle.write({
      banner: banner(plugin.fileName),
      format: 'esm',
      sourcemap: true,
      paths: id => path.isAbsolute(id) ? esmSpecifier(plugin.esmDist, id) : id,
      generatedCode: { preset: 'es2015' },
      file: plugin.esmDist
    })
  }

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

'use strict'

/*!
 * Rollup plugin that resolves relative `.js` import specifiers to their
 * TypeScript sources. Our TS files import siblings with the standard
 * ESM-style `.js` extension (the same way tsc resolves them), so when Rollup
 * bundles straight from `js/src`, a specifier like `./util/index.js` must be
 * mapped to the `./util/index.ts` file on disk.
 *
 * The dist build no longer needs this — rolldown resolves the mapping itself —
 * so the remaining consumers are karma and the per-plugin build, both of which
 * are still on Rollup.
 *
 * Rollup has no `resolve.extensionAlias`, so this hook is what makes a mixed
 * `.js`/`.ts` tree work: when no `.ts` sibling exists it returns null and the
 * `.js` file resolves normally, which is what lets the migration convert one
 * file at a time.
 *
 * Vendored from Bootstrap v6-dev (build/rollup-plugin-ts-resolve.cjs).
 * Copyright 2011-2026 The Bootstrap Authors
 * Copyright 2025 The CoreUI Authors
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 */

const fs = require('node:fs')
const path = require('node:path')

const tsResolve = () => {
  // Cache resolutions by target path — the filesystem does not change during a
  // build, and Karma reuses this one plugin instance across every spec bundle
  const cache = new Map()

  return {
    name: 'ts-resolve',
    resolveId(source, importer) {
      if (!importer || !source.startsWith('.') || !source.endsWith('.js')) {
        return null
      }

      const tsPath = path.resolve(path.dirname(importer), `${source.slice(0, -3)}.ts`)
      if (!cache.has(tsPath)) {
        cache.set(tsPath, fs.existsSync(tsPath) ? tsPath : null)
      }

      return cache.get(tsPath)
    }
  }
}

module.exports = tsResolve

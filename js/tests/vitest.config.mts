/*!
 * Vitest browser mode runs the unit specs in a real Chromium through Playwright.
 * It replaces Karma. `js/tests/vitest-setup.js` maps the Jasmine API the specs
 * are written against onto Vitest. `JQUERY=true` switches to the jQuery
 * project: only `jquery.spec.js`, with jQuery loaded as a global first.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dirname, '../..')

const DEBUG = Boolean(process.env.DEBUG)
const JQUERY_TEST = Boolean(process.env.JQUERY)

// Same job as Rolldown's `resolve.extensionAlias`: our TypeScript sources import
// siblings with the ESM-style `.js` extension, so a specifier like
// `./util/index.js` has to resolve to `./util/index.ts` on disk. Vite has no
// built-in `extensionAlias` option.
const tsResolve = () => {
  const cache = new Map()

  return {
    name: 'ts-resolve',
    enforce: 'pre' as const,
    resolveId(source: string, importer?: string) {
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

export default defineConfig({
  root,
  // Parallel instances (js-test runs the unit and jQuery projects together)
  // must not share the Vite cache — two optimizers corrupt one directory.
  cacheDir: JQUERY_TEST ? 'node_modules/.vite-jquery' : 'node_modules/.vite',
  plugins: [tsResolve()],
  define: {
    'process.env.NODE_ENV': '"dev"'
  },
  test: {
    // The specs call describe/it/expect as globals, the way Karma provided them
    globals: true,
    setupFiles: JQUERY_TEST ?
      [path.resolve(dirname, 'vitest-setup-jquery.js'), path.resolve(dirname, 'vitest-setup.js')] :
      [path.resolve(dirname, 'vitest-setup.js')],
    include: JQUERY_TEST ? ['js/tests/unit/jquery.spec.js'] : ['js/tests/unit/**/*.spec.js'],
    exclude: JQUERY_TEST ? [] : ['js/tests/unit/jquery.spec.js'],
    coverage: {
      enabled: !JQUERY_TEST,
      provider: 'istanbul',
      // Cover every source file, not only the ones a spec happens to import.
      // Karma instrumented on demand, which hid untested files from the report.
      include: ['js/src/**/*.ts'],
      reporter: ['text-summary', 'lcov'],
      reportsDirectory: path.resolve(root, 'js/coverage'),
      // The same floors karma enforced (90/89/90/90), now measured against all
      // of `js/src` — karma's istanbul only instrumented the files a spec
      // imported, so this denominator is larger and the gate strictly stronger.
      // Measured on migration day: 95.55 / 89.04 / 94.96 / 95.62.
      thresholds: {
        statements: 90,
        branches: 89,
        functions: 90,
        lines: 90
      }
    },
    browser: {
      enabled: true,
      provider: playwright(),
      headless: !DEBUG,
      screenshotFailures: false,
      // `js-test` runs the unit and jQuery projects in parallel; without a
      // distinct port the two Vitest servers collide on the default one.
      api: { port: JQUERY_TEST ? 63320 : 63315 },
      instances: [
        { browser: 'chromium' }
      ]
    }
  }
})

import { readFileSync } from 'node:fs'

import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import { coreuiDocs } from '@coreui/astro-docs/integration'

// The engine derives Astro's `site` + `base` from `seo.url` in config.yml; a redirect
// target has to carry the same base, so take it from the same source.
const base = new URL(
  readFileSync(new URL('./src/data/config.yml', import.meta.url), 'utf8')
    .match(/^\s{2}url:\s*(\S+)/m)[1]
).pathname.replace(/\/$/, '')

export default defineConfig({
  // Publish URL (site + base) is config-driven: coreuiDocs() reads `seo.url` from
  // src/data/config.yml and sets Astro's `site` + `base` from it.
  // Vanilla JS docs render the examples as static HTML (no framework island), so there's
  // no React/Vue integration — just the engine + MDX.
  //
  // Docs are the Astro root (docs/) but dependencies live at the repo root, so the
  // library project has no docs/node_modules. Send Astro's and Vite's caches to the
  // repo-root `.cache/` (where eslint/stylelint caches already live; gitignored), so
  // the build never recreates docs/node_modules. Paths are relative to this root.
  // Build straight to the repo-root `_site/` (the directory the deploy workflow
  // publishes) so there's a single output — no separate `docs/dist` to keep in sync.
  // `/forms/checks-radios/` split into three pages in v6. The old URL has years of
  // inbound links, so it keeps resolving — Astro emits a meta-refresh page for a
  // static build, which is what gh-pages serves. Astro does not prepend `base` to a
  // redirect target, so read it from the same config the engine does.
  redirects: {
    '/forms/checks-radios/': `${base}/forms/checkbox/`,
  },
  outDir: '../_site',
  cacheDir: '../.cache/astro',
  vite: {
    cacheDir: '../.cache/vite',
    // lz-string (used by the engine's sandbox script) is a UMD/CJS package with no ESM
    // entry, and Vite's dep scanner doesn't reach the lazily-loaded sandbox script, so it
    // gets served raw and `import { compressToBase64 }` fails in dev. Force pre-bundling.
    optimizeDeps: { include: ['lz-string'] }
  },
  integrations: [...coreuiDocs(), mdx()],
})

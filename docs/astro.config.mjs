import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

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
  // Publish URL (site + base) is config-driven: coreuiDocs({ libraryConfig: 'src/styles/_library-config.scss' }) reads `seo.url` from
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
    // `/components/navs-tabs/` split into a nav page and a tab page in v6.
    '/components/navs-tabs/': `${base}/components/nav/`,
    // `/utilities/` went from grouped pages to one page per property in v6. Each old
    // URL points at the property that carried the page's name.
    '/utilities/sizing/': `${base}/utilities/width/`,
    '/utilities/spacing/': `${base}/utilities/margin/`,
    '/utilities/borders/': `${base}/utilities/border/`,
    '/utilities/text/': `${base}/utilities/font-size/`,
    '/utilities/interactions/': `${base}/utilities/user-select/`,
    // `.ratio` became a native aspect-ratio utility in v6.
    '/helpers/ratio/': `${base}/utilities/aspect-ratio/`,
    // `.link-{color}` gave way to the theme classes in v6.
    '/helpers/colored-links/': `${base}/utilities/link/`,
  },
  outDir: '../_site',
  cacheDir: '../.cache/astro',
  vite: {
    cacheDir: '../.cache/vite',
    // lz-string (used by the engine's sandbox script) is a UMD/CJS package with no ESM
    // entry, and Vite's dep scanner doesn't reach the lazily-loaded sandbox script, so it
    // gets served raw and `import { compressToBase64 }` fails in dev. Force pre-bundling.
    optimizeDeps: { include: ['lz-string'] },
    plugins: [
      // Dev runs the library JS from js/src instead of the dist/js/coreui.esm.js
      // the engine aliases. dist only changes on `npm run js`, so the dev server
      // could pair stale JS with live-compiled SCSS — invisible in Chromium
      // (`interpolate-size` animates in CSS) and indistinguishable from a
      // Firefox-only bug. With the source alias a js/src edit reloads the page
      // the same way an scss edit does. `astro build` keeps the dist alias, so
      // the built docs still exercise the shipped artifact. A plugin `config`
      // result is merged over the engine's alias (Vite prepends it), which is
      // what lets this override win.
      {
        name: 'coreui-docs-dev-js-from-source',
        config(_, { command }) {
          return command === 'serve'
            ? { resolve: { alias: { '@coreui-docs-js': fileURLToPath(new URL('../js/src/index.ts', import.meta.url)) } } }
            : undefined
        }
      }
    ]
  },
  integrations: [...coreuiDocs({ libraryConfig: 'src/styles/_library-config.scss' }), mdx()],
})

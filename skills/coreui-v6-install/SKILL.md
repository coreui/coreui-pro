---
name: coreui-v6-install
description: Add CoreUI PRO for Bootstrap v6 (@coreui/coreui-pro) to a project and set up its CSS, JavaScript and build. Use when installing CoreUI PRO from the CDN or npm, wiring it into Sass CLI, Vite, Webpack or Parcel, loading per-component CSS, importing single plugins, or customizing it through Sass.
guide: /getting-started/install/
---

# Add CoreUI PRO for Bootstrap v6 to a Project

This skill sets up the vanilla package `@coreui/coreui-pro` version `6.0.0-alpha.0` in a user's project. CSS custom properties use the `--cui-` prefix, data attributes use `data-coreui-*`, and the UMD builds expose the global `coreui`.

`@coreui/coreui-pro` is commercial software and requires a [CoreUI PRO license](https://coreui.io/pricing/?framework=bootstrap&src=skill). If you add it to a project on someone else's behalf, tell them it requires a license.

## Workflow

- [ ] Step 1: Choose an install path
- [ ] Step 2: (CDN or static files) Include the compiled files
- [ ] Step 3: (npm) Install the package and its peer dependency
- [ ] Step 4: Choose how much CSS to load
- [ ] Step 5: Choose how to load the JavaScript
- [ ] Step 6: Wire the build tool (one subsection: Sass CLI, Vite, Webpack or Parcel)
- [ ] Step 7: Customize through Sass
- [ ] Step 8: Set up color modes
- [ ] Step 9: Verify

---

## Step 1: Choose an install path

| Project | Path | Continue with |
| --- | --- | --- |
| Static page, prototype, no build step | CDN or the downloaded `dist/` files | Step 2 |
| Needs Sass customization or a JS bundler | npm | Step 3, then one subsection of Step 6 |

Supported browsers: Chrome 123, Edge 123, Firefox 130, Safari 18, iOS 18. The CSS uses `light-dark()` and `color-mix()` with no fallback.

---

## Step 2: Include the compiled files (CDN or static)

1. Put the CSS in `<head>` and the bundle before `</body>`. `coreui.bundle.min.js` already contains Floating UI.

   ```html
   <!doctype html>
   <html lang="en">
     <head>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1">
       <title>CoreUI PRO</title>
       <link href="https://cdn.jsdelivr.net/npm/@coreui/coreui-pro@6.0.0-alpha.0/dist/css/coreui.min.css" rel="stylesheet" integrity="<sha384 from the Install page>" crossorigin="anonymous">
     </head>
     <body>
       <div class="container py-5 px-4 mx-auto">
         <button class="btn-solid theme-primary">Primary button</button>
       </div>
       <script src="https://cdn.jsdelivr.net/npm/@coreui/coreui-pro@6.0.0-alpha.0/dist/js/coreui.bundle.min.js" integrity="<sha384 from the Install page>" crossorigin="anonymous"></script>
     </body>
   </html>
   ```

2. Copy each `integrity` value from the Install docs page for the exact version. Never invent an SRI hash. Keep `crossorigin="anonymous"`.
3. To load Floating UI yourself, use the standalone `coreui.min.js` and put the two Floating UI UMD files (core, then dom) before it:

   ```html
   <script src="https://cdn.jsdelivr.net/npm/@floating-ui/core@1.8.0/dist/floating-ui.core.umd.min.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.8.0/dist/floating-ui.dom.umd.min.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/@coreui/coreui-pro@6.0.0-alpha.0/dist/js/coreui.min.js"></script>
   ```

4. To use the ES module build in the browser, declare an import map before the first module script. `coreui.esm.min.js` imports `@floating-ui/dom` at the top, so the map is required even for plugins that position nothing:

   ```html
   <script type="importmap">
   {
     "imports": {
       "@floating-ui/dom": "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.8.0/+esm",
       "@coreui/coreui-pro": "https://cdn.jsdelivr.net/npm/@coreui/coreui-pro@6.0.0-alpha.0/dist/js/coreui.esm.min.js"
     }
   }
   </script>
   <script type="module">
     import { Popover } from '@coreui/coreui-pro'
     new Popover(document.getElementById('popoverButton'))
   </script>
   ```

5. For self-hosted files, use the same names from the downloaded `css/` and `js/` folders. Skip to Step 4 for the CSS choice, then Step 8.

---

## Step 3: Install with npm

1. Install the package and its only peer dependency:

   ```sh
   npm i --save @coreui/coreui-pro@6.0.0-alpha.0 @floating-ui/dom
   ```

2. Keep `@floating-ui/dom` (`^1.8.0`) whenever the project imports the package root or any of these plugins: Autocomplete, Combobox, ContextMenu, DatePicker, DateRangePicker, Dropdown, Menu, MultiSelect, Popover, Rating, TimePicker, Tooltip. Omit it only when every import is a single plugin outside that list.
3. Sass builds need Dart Sass (`sass` or `sass-embedded`) and Autoprefixer. Node Sass and `@import` do not work: v6 is `@use` only.
4. Other package managers: `pnpm add @coreui/coreui-pro`, `yarn add @coreui/coreui-pro`, `bun add @coreui/coreui-pro`. Yarn 2+ needs `yarn config set nodeLinker node-modules` so Sass can resolve the source files.

Package entry points (from `package.json`):

| Key or import | Resolves to |
| --- | --- |
| `import … from '@coreui/coreui-pro'` | `dist/js/coreui.esm.js` |
| `require('@coreui/coreui-pro')` | `dist/js/coreui.js` (UMD) |
| `@coreui/coreui-pro/js/dist/<plugin>` | `js/dist/<plugin>.mjs` (import) or `js/dist/<plugin>.js` (require) |
| `@coreui/coreui-pro/css/<file>` | `dist/css/<file>` |
| `@coreui/coreui-pro/scss/<file>` | `scss/<file>` |
| `style` / `sass` fields | `dist/css/coreui.css` / `scss/coreui.scss` |

Type declarations ship with the package. Do not install an `@types/…` package.

---

## Step 4: Choose how much CSS to load

| Option | Files | Use when |
| --- | --- | --- |
| Full | `coreui.css` / `coreui.min.css` | Default. Any page, no build step needed. |
| Per component | `base.css` + `components/<entry>.css` | A page uses a few components and you control the CSS list. |
| Partial | `coreui-grid.css`, `coreui-utilities.css`, `coreui-reboot.css` | You need only the grid, only utilities, or only Reboot. |
| v5 spellings | `coreui-legacy.css`, loaded last | Markup still uses v5 classes (`.btn-primary`, `.form-check`, `.alert-{color}`). Remove it after migrating. |
| Sass source | `scss/coreui.scss` | You customize tokens or variables (Step 7). |

Per-component rules:

1. Load `base.css` first. It holds the `:root` tokens, Reboot and the `.theme-*` classes. A component file without it renders uncolored.
2. Find the entry for each class in `dist/css/components/classes.json` (for example `"card-body": "card"`, `"input-group": "forms/input-group"`, `"container": "layout/containers"`).
3. Read the entry in `dist/css/components/manifest.json`. Load every file in its `requires` list, then its own `file`, sorted by `order`.
4. Load `coreui-utilities.css` for utilities and helpers (`.py-5`, `.mx-auto`). They are not split per component.
5. Load `coreui-legacy.css` last, if you need it.

```html
<link href="css/base.css" rel="stylesheet">
<link href="css/components/layout/containers.css" rel="stylesheet">
<link href="css/components/forms/form-control.css" rel="stylesheet">
<link href="css/components/forms/input-group.css" rel="stylesheet">
<link href="css/components/buttons.css" rel="stylesheet">
<link href="css/components/card.css" rel="stylesheet">
<link href="css/coreui-utilities.css" rel="stylesheet">
```

From npm in a bundler: `import '@coreui/coreui-pro/css/base.css'` and `import '@coreui/coreui-pro/css/components/card.css'`. Every file has a `.min.css` twin.

---

## Step 5: Choose how to load the JavaScript

1. Pick exactly one source per page. The UMD files and `dist/js/coreui.esm.js` each carry their own copy of the shared internals, and the package root and the `js/dist` files share a third. Two copies on one page register the data-attribute handlers twice, so a toggle opens and closes on the same click. In a bundler, the package root and `js/dist` imports mix safely.

   | Source | Floating UI | How |
   | --- | --- | --- |
   | `dist/js/coreui.bundle(.min).js` | included | `<script>`, global `coreui` |
   | `dist/js/coreui(.min).js` | external | `<script>` after the Floating UI UMD files, global `coreui` |
   | `dist/js/coreui.esm(.min).js` | external | `<script type="module">` with an import map |
   | `@coreui/coreui-pro` (resolves to `js/dist/index.mjs`) | external | bundler, every plugin |
   | `js/dist/<plugin>.mjs` | external | bundler, one import per plugin |

2. In a bundler, import everything:

   ```js
   import * as coreui from '@coreui/coreui-pro'
   ```

3. To ship only the plugins you use, import each plugin from `js/dist`. Each file has a default export:

   ```js
   import Modal from '@coreui/coreui-pro/js/dist/modal'
   import Dropdown from '@coreui/coreui-pro/js/dist/dropdown'

   const modal = new Modal(document.getElementById('myModal'))
   ```

   Named imports from the package root (`import { Modal } from '@coreui/coreui-pro'`) work, but they keep the whole library in the bundle. Use the `js/dist` paths when size matters.
4. Plugins also start from markup: `data-coreui-toggle="dropdown"`, `data-coreui-toggle="modal"`. Use one set of `data-coreui-*` attributes per element.
5. The programmatic API is the same in every source: `new coreui.Modal(el, { keyboard: false })`, `Modal.getInstance(el)`, `Modal.getOrCreateInstance(el, config)`. Events are namespaced, for example `show.coreui.modal`.

---

## Step 6: Wire the build tool

Pick the subsection that matches the project. Each one is complete on its own.

### npm with the Sass CLI (no bundler)

1. Install:

   ```sh
   npm i --save @coreui/coreui-pro@6.0.0-alpha.0 @floating-ui/dom
   npm i --save-dev sass postcss postcss-cli autoprefixer
   ```

2. Create `scss/styles.scss`:

   ```scss
   @use "@coreui/coreui-pro/scss/coreui";
   ```

3. Create `postcss.config.js`:

   ```js
   module.exports = {
     plugins: [require('autoprefixer')]
   }
   ```

4. Add the browser floors to `package.json` so Autoprefixer emits the prefixes CoreUI needs:

   ```json
   "browserslist": ["Chrome >= 123", "Edge >= 123", "Firefox >= 130", "Safari >= 18", "iOS >= 18"]
   ```

5. Add the scripts. `--load-path=node_modules` lets Sass resolve `@coreui/coreui-pro`:

   ```json
   "scripts": {
     "css-compile": "sass --load-path=node_modules --style expanded --source-map --embed-sources scss:css",
     "css-prefix": "postcss --config postcss.config.js --replace \"css/*.css\" \"!css/*.min.css\"",
     "build": "npm run css-compile && npm run css-prefix"
   }
   ```

6. Link `css/styles.css` in the page and load the bundle with a plain `<script>`:

   ```html
   <link rel="stylesheet" href="css/styles.css">
   <script src="node_modules/@coreui/coreui-pro/dist/js/coreui.bundle.min.js"></script>
   ```

### Vite

1. Install:

   ```sh
   npm i --save @coreui/coreui-pro@6.0.0-alpha.0 @floating-ui/dom
   npm i --save-dev vite sass
   ```

2. `vite.config.js`:

   ```js
   export default {
     root: 'src',
     build: { outDir: '../dist', emptyOutDir: true },
     server: { port: 8080 }
   }
   ```

3. `src/scss/styles.scss`. Vite resolves the package through `node_modules`, so no alias is needed:

   ```scss
   @use "@coreui/coreui-pro/scss/coreui";
   ```

4. `src/js/main.js`:

   ```js
   import '../scss/styles.scss'
   import * as coreui from '@coreui/coreui-pro'
   ```

5. `src/index.html` loads the entry with `<script type="module" src="./js/main.js"></script>`. Add `"start": "vite"` and `"build": "vite build"` to `package.json` scripts.
6. Without Sass, import the compiled CSS instead: `import '@coreui/coreui-pro/css/coreui.min.css'`.

### Webpack

1. Install:

   ```sh
   npm i --save @coreui/coreui-pro@6.0.0-alpha.0 @floating-ui/dom
   npm i --save-dev webpack webpack-cli webpack-dev-server sass sass-loader postcss-loader autoprefixer css-loader style-loader
   ```

2. Delete `"type": "commonjs"` from a fresh `package.json`. Under it, Webpack refuses the `import` statements in `src/js/main.js`.
3. `webpack.config.js`. The loaders run bottom to top: `sass-loader`, `postcss-loader` (Autoprefixer), `css-loader`, `style-loader`:

   ```js
   const path = require('path')

   module.exports = {
     entry: './src/js/main.js',
     output: {
       filename: 'main.js',
       path: path.resolve(__dirname, 'dist')
     },
     devServer: {
       static: path.resolve(__dirname, 'dist'),
       port: 8080,
       hot: true
     },
     module: {
       rules: [
         {
           test: /\.(scss)$/,
           use: [
             { loader: 'style-loader' },
             { loader: 'css-loader' },
             {
               loader: 'postcss-loader',
               options: { postcssOptions: { plugins: [require('autoprefixer')] } }
             },
             { loader: 'sass-loader' }
           ]
         }
       ]
     }
   }
   ```

4. `src/scss/styles.scss`. Write the package path without a `~` prefix:

   ```scss
   @use "@coreui/coreui-pro/scss/coreui";
   ```

5. `src/js/main.js`:

   ```js
   import '../scss/styles.scss'
   import * as coreui from '@coreui/coreui-pro'
   ```

6. `dist/index.html` loads `<script src="./main.js"></script>`. Add `"start": "webpack serve --mode development"` and `"build": "webpack --mode production"` to the scripts.
7. For production or a strict Content Security Policy, replace `style-loader` with `mini-css-extract-plugin` and link the emitted CSS file.

### Parcel

1. Install:

   ```sh
   npm i --save @coreui/coreui-pro@6.0.0-alpha.0 @floating-ui/dom
   npm i --save-dev parcel
   ```

2. Delete `"main": "index.js"` from a fresh `package.json`. Parcel treats `main` as a library target and stops the build.
3. Create `.sassrc` next to `package.json`. Parcel's Sass transformer does not search `node_modules` without it:

   ```json
   {
     "includePaths": ["node_modules"]
   }
   ```

4. `src/scss/styles.scss`:

   ```scss
   @use "@coreui/coreui-pro/scss/coreui";
   ```

5. `src/js/main.js`:

   ```js
   import * as coreui from '@coreui/coreui-pro'
   ```

6. `src/index.html` links both files. Parcel installs the Sass transformer on first run:

   ```html
   <link rel="stylesheet" href="scss/styles.scss">
   <script type="module" src="js/main.js"></script>
   ```

7. Add `"start": "parcel serve src/index.html --public-url / --dist-dir dist"` to the scripts.

---

## Step 7: Customize through Sass

1. Pass overrides with `@use … with (…)`. Include only the keys you change. `null` removes a token from the output.

   ```scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     $primary: #0074d9,
     $spacer: 1.5rem,
     $root-tokens: (
       --cui-radius-5: .25rem,
     ),
     $alert-tokens: (
       --cui-alert-padding-x: 2rem,
       --cui-alert-margin-bottom: null,
     )
   );
   ```

2. Know the three override levels:

   | Level | Example | Effect |
   | --- | --- | --- |
   | Sass variable | `$primary`, `$spacer` | Feeds the token defaults. `$primary` retints the whole primary scale. |
   | Token map | `$color-tokens`, `$root-tokens`, `$<component>-tokens` | Replaces one emitted custom property. |
   | CSS at run time | `.my-alert { --cui-alert-padding-x: 2rem; }` | No compiler needed. |

3. Write token-map keys with the full `--cui-` prefix. Override only keys the map already has: read the map in the partial (`scss/_root.scss`, `scss/_alert.scss`). A key the map does not declare is emitted as an extra declaration that can lose. For example, `--cui-spacer` is not in `$root-tokens`; change it with `$spacer`.
4. Add a color through `$colors` and `$theme-colors`, or drop one with `$theme-colors: ("info": null)`. Pass the whole sub-map when you change one slot of a built-in color.
5. For a smaller stylesheet, load only the modules you use. Configure `config` first, keep `root`, `layout` and `helpers` (they emit the tokens, the spacer scale and the `.theme-*` classes), and load `utilities/api` last:

   ```scss
   @use "@coreui/coreui-pro/scss/config" with ($spacer: 1.5rem);
   @use "@coreui/coreui-pro/scss/root";
   @use "@coreui/coreui-pro/scss/content";
   @use "@coreui/coreui-pro/scss/layout";
   @use "@coreui/coreui-pro/scss/forms";
   @use "@coreui/coreui-pro/scss/buttons";
   @use "@coreui/coreui-pro/scss/card";
   @use "@coreui/coreui-pro/scss/helpers";
   @use "@coreui/coreui-pro/scss/utilities/api";
   ```

6. To keep the v5 class spellings in a Sass build, add the legacy partial after the main import. Do not `@use` the `coreui-legacy` entry file there: it fails with "This module was already loaded".

   ```scss
   @use "@coreui/coreui-pro/scss/coreui";
   @use "@coreui/coreui-pro/scss/legacy";
   ```

---

## Step 8: Set up color modes

1. Light is the default. Turn on dark mode for the whole page with `data-coreui-theme` on `<html>`:

   ```html
   <html lang="en" data-coreui-theme="dark">
   ```

2. Scope a mode to one part with the same attribute, for example `<div class="dropdown" data-coreui-theme="light">`.
3. The operating system preference does not apply on its own. To follow it instead of the attribute, compile with:

   ```scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     $color-mode-type: media-query
   );
   ```

   This build drops per-element switching.
4. To ship light only, set `$enable-dark-mode: false`.
5. CoreUI ships no theme toggler. Write a small script that sets `data-coreui-theme` on `document.documentElement`.

---

## Step 9: Verify

1. Load the page. The `.container` and the `.btn-solid.theme-primary` button are styled. A grey button means `base.css` or the theme classes are missing.
2. Click a dropdown (`data-coreui-toggle="dropdown"`). It opens once and positions correctly. A console error `Failed to resolve module specifier "@floating-ui/dom"` means the import map or the peer dependency is missing.
3. Grep the project:
   - `@import .*coreui` in `.scss` files: replace with `@use`.
   - `coreui.bundle` together with `from '@coreui/coreui-pro` in the same page: keep one source.
   - `from '@coreui/coreui-pro'` together with `@coreui/coreui-pro/js/dist/`: keep one style.
   - `integrity=` values: copied from the Install page, never typed by hand.
4. In DevTools, check that a token you overrode (for example `--cui-radius-5`) has the new value on `:root`.
5. In a Sass build, check that `--cui-` tokens appear in the output and that `@layer colors, config, root, …;` is the first rule after the banner.

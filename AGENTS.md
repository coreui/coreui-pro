# AGENTS.md

Guidance for AI coding agents working in this repository. `CLAUDE.md` points here.

CoreUI PRO for Bootstrap v6: the vanilla JavaScript and Sass source of the CoreUI component
library. The React (`@coreui/react-pro`) and Vue (`@coreui/vue-pro`) editions consume this
package's CSS and follow its behaviour, so this repository is the reference for both.

- Sass source in `scss/`, TypeScript source in `js/src/`, unit specs in `js/tests/unit/`.
- Docs site in `docs/` (Astro, shared `@coreui/astro-docs` engine), pages in `docs/src/content/docs/`.
- Agent skills for CoreUI users in `skills/<name>/SKILL.md`, shipped in the package and listed on
  `ai-tools/skills.mdx`. `npm run js-test-skills` checks both.
- Built output in `dist/` and `js/dist/` is generated. Do not edit it and do not commit it in a feature change.

## Commands

- `npm run dist`: full CSS and JS build.
- `npm run css` / `npm run js`: one half of the build.
- `npm run lint`: ESLint, type checks, docs option checks, Stylelint, lockfile lint.
- `npm run js-test`: unit, jQuery and integration specs (Vitest browser mode, Chromium).
- `npm run js-test-visual`: specs that load the compiled stylesheet. Use it for anything a CSS rule decides.
- `npm run bundlewatch`: size budgets, after `npm run dist`.
- `npm run docs-serve` / `npm run docs-build`: docs dev server on port 9001 / production build.
- One spec file: `npx vitest run --config js/tests/vitest.config.mts js/tests/unit/<name>.spec.js`.

The Vitest browser server uses a fixed port. Two runs at once attach to the same server and the
second one reports zero tests. Pass `--api.port <free port>` when you run suites in parallel.

## Writing

- Comments are a last resort. Do not narrate code or restate it. Add one line only when the code
  cannot say it, for example why something is absent. The reason for a change goes in the commit
  message, not in the file.
- Exception: every function in `js/src/util/` has JSDoc (description, `@param`, `@returns`) and a
  spec in `js/tests/unit/util/` that calls it.
- Put new code where the file's structure says it belongs, not where the diff is smallest.
- Keep `Default`, `DefaultType`, option tables, props and `package.json` dependencies in
  alphabetical order. Breakpoints stay in size order (`xs` … `xxl`).

## JavaScript and TypeScript

- Components extend `BaseComponent`. A component file defines nothing at module level except the
  constants block (`NAME`, `DATA_KEY`, `EVENT_*`, `CLASS_NAME_*`, `SELECTOR_*`, `Default`,
  `DefaultType`). Helpers are private `_methods`, or utilities in `js/src/util/` when two
  components need them. Before you add a utility, search the component classes for the same
  expression and move every match onto it.
- Options are the only source of a component's state. Classes and attributes the component writes
  (`.disabled`, `.active`, `aria-disabled`, `aria-selected`, `tabindex`, roles) are its output,
  computed from options on every start and never read back from the DOM. From markup the
  component reads only content, names and references (`<label for>`, `aria-labelledby`, `id`).
- A live instance changes through setters, never through a generic `setConfig()`. A setter is
  named `set` + the option (`setValue`, `setDate`, `setItems`), takes the option's type, throws
  the constructor's `TypeError` on a wrong type, returns `void`, and fires no change event. A
  boolean option becomes a verb pair (`disable()` / `enable()`). Change events report what the user
  did and form resets. Value and validation state are independent.
- One fact, one writer. Selection, value and derived facts live in one model; the DOM, a native
  `<select>`, counters and labels are projections written from it.
- Never generate a `name`. A control is part of the form data only when the page gave it a name.
  Internal inputs (search fields, hints, slots) never get one. Generated `id` values are fine.
- Texts and accessible names are separate options (`ariaCleanerLabel`, `searchPlaceholder`), never one
  `labels` object.
- Do not use `MutationObserver` to keep small state in sync. Read the state when it is needed, or
  expose a method (`update()`) the page calls.
- `dispose()` removes listeners, timers and observers, removes the nodes the component inserted and
  gives back nodes it moved. It does not restore roles, `aria-*` or classes on page elements.
- Build dates with `createDate` from `util/calendar`, never `new Date(year, …)`: years below 100
  move into the 1900s.
- Files shared with Bootstrap keep its section order and method shapes, and keep its comments
  verbatim. Class names, tokens, options, events and public methods stay the same as Bootstrap's.

## Sass and CSS

- `@use` / `@forward` only. In a `@use` block: `sass:` built-ins first, then folder imports sorted
  by path, then loose partials (`config`, `functions`).
- Component tokens are declared on the component's selector, never on `:root`. A token that a rule
  reads must be declared on the element that reads it.
- A derived value is computed in the browser (`calc(var(--cui-…) * .5)`), not in Sass, so runtime
  token overrides reach it.
- A property reads the theme slot first and the component token as its fallback:
  `background-color: var(--cui-theme-bg-subtle, var(--cui-alert-bg))`.
- Keep the value column of a `$variable` block aligned when you change a value.
- Sass emits a module's CSS where it is first loaded. A new `@use` in an early file can move a
  whole `@layer` block above the layer order declaration. After moving code, compare the head of
  the compiled `coreui.css` and run the visual suite.
- Moving or renaming a `// scss-docs-start` block breaks the docs page that captures it. Run
  `npm run docs-build` after any such move.

## Tests

- Specs are plain JavaScript written against a Jasmine-style API that `js/tests/vitest-setup.js`
  maps onto Vitest. New specs may use the plain Vitest API. Async specs return a promise.
- The unit suite does not load the stylesheet. A behaviour that a CSS rule decides needs a spec in
  `js/tests/visual/`.
- Every behaviour change comes with a spec that fails without it.

## Docs

- A new class, option, token, utility or behaviour is not finished without docs in the same change.
  A visible change of a default also needs an entry in `migration/v6.mdx`.
- `## Customizing` is the last section of a page, in this order: CSS variables, Sass variables,
  Sass maps, Sass mixins, Sass loops, Utilities API. Write `Sass`, not `SASS`.

## Size budgets

`.bundlewatch.config.json` holds the gzip ceilings. Do not raise them. A change that crosses a
ceiling makes room first, in the same change or in one before it.

## Commits and pull requests

- Conventional Commits in English: `feat(Component): …`, `fix(Component): …`, `docs: …`, `chore: …`.
- Say what the change does in this code and why, not where the idea came from.
- No `Co-Authored-By` trailers and no generated-by footers.
- Stage files by name. Never commit `dist/` or `js/dist/` in a feature change.

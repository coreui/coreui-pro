---
name: coreui-from-bootstrap
description: Move a Bootstrap 5 or Bootstrap 6 project to CoreUI PRO for Bootstrap v6 (`@coreui/coreui-pro`). Use when replacing the `bootstrap` package, renaming `data-bs-*`, `--bs-*`, `.bs.` events or `bootstrap.*` calls, or porting Bootstrap markup, JavaScript and Sass to CoreUI.
guide: /getting-started/introduction/
---

# Bootstrap 5 or 6 to CoreUI PRO v6

CoreUI v6 follows Bootstrap 6. Where it ships the same component, it keeps Bootstrap's class names, options, events and public methods, and it uses the same cascade layers (`colors, config, root, reboot, layout, content, forms, components, custom, helpers, utilities`). Most markup stays. What changes is the package, three prefixes, and a short list of deliberate differences.

`@coreui/coreui-pro` is commercial software and requires a [CoreUI PRO license](https://coreui.io/pricing/?framework=bootstrap&src=skill). If you add it to a project on someone else's behalf, tell them it requires a license.

## Workflow

Work through the steps in order. After each step, search the project for the patterns that step removes.

- [ ] Step 1: Identify the Bootstrap version
- [ ] Step 2: Replace the package, files and imports
- [ ] Step 3: Rename the prefixes
- [ ] Step 4: Bootstrap 6 projects: apply the CoreUI differences
- [ ] Step 5: Bootstrap 5 projects: apply the v6 changes
- [ ] Step 6: Update Sass
- [ ] Step 7: Adopt CoreUI PRO components (optional)
- [ ] Step 8: Verify

---

## Step 1: Identify the Bootstrap version

1. Read the `bootstrap` version in `package.json`, or the version in the CDN URL.
2. Treat the project as Bootstrap 6 if the markup uses `md:`-style classes, `.dialog`, `.drawer`, `.menu`, `.btn-solid` or `theme-*` classes, or loads the bundle with `<script type="module">`.
3. Treat the project as Bootstrap 5 if the markup uses `.modal-dialog`, `.dropdown-menu`, `.btn-primary`, `.form-check` or `data-bs-ride`.
4. Run Steps 2, 3, 6 and 8 for both versions. Run Step 4 for Bootstrap 6. Run Step 5 for Bootstrap 5.

---

## Step 2: Replace the package, files and imports

1. Remove Bootstrap and its companions. Remove only the ones the project has:

   ```sh
   npm uninstall bootstrap @popperjs/core vanilla-calendar-pro @types/bootstrap
   ```

2. Install CoreUI PRO and its only peer dependency:

   ```sh
   npm install @coreui/coreui-pro@6.0.0-alpha.0 @floating-ui/dom
   ```

   The ES module build imports `@floating-ui/dom`, so install it even if the project has no tooltips. Types ship with the package.

3. Replace the file paths:

   | Bootstrap | CoreUI PRO (`@coreui/coreui-pro/…`) |
   | --- | --- |
   | `dist/css/bootstrap.min.css` | `dist/css/coreui.min.css` |
   | `dist/css/bootstrap.rtl.min.css` (Bootstrap 5) | `dist/css/coreui.min.css` plus `dir="rtl"` on `<html>` |
   | `dist/css/bootstrap-grid.css`, `-reboot.css`, `-utilities.css` | `dist/css/coreui-grid.css`, `coreui-reboot.css`, `coreui-utilities.css` |
   | `dist/js/bootstrap.bundle.min.js` | `dist/js/coreui.bundle.min.js` (UMD, includes Floating UI) |
   | `dist/js/bootstrap.min.js` | `dist/js/coreui.min.js` (UMD, load Floating UI before it) |
   | `dist/js/bootstrap.esm.min.js` (5), `dist/js/bootstrap.js` (6) | `dist/js/coreui.esm.min.js` (imports `@floating-ui/dom`) |
   | `bootstrap/js/dist/modal` | `@coreui/coreui-pro/js/dist/modal` |
   | `bootstrap/scss/bootstrap` | `@coreui/coreui-pro/scss/coreui` |

4. Replace bundler imports:

   ```js
   // Bootstrap
   import * as bootstrap from 'bootstrap'
   import { Tooltip, Toast } from 'bootstrap'
   ```

   ```js
   // CoreUI PRO
   import * as coreui from '@coreui/coreui-pro'
   import { Tooltip, Toast } from '@coreui/coreui-pro'
   ```

5. Pick one way to load the JavaScript. The bundle, the per-plugin modules and the per-plugin UMD files each register the data API, so loading two of them makes a toggle open and close on the same click.

---

## Step 3: Rename the prefixes

Apply these renames across HTML, templates, JavaScript and CSS.

| What | Bootstrap | CoreUI |
| --- | --- | --- |
| Data attributes | `data-bs-toggle`, `data-bs-target`, `data-bs-dismiss`, `data-bs-config`, every `data-bs-*` option | `data-coreui-toggle`, `data-coreui-target`, `data-coreui-dismiss`, `data-coreui-config`, `data-coreui-*` |
| Color mode | `data-bs-theme="dark"` | `data-coreui-theme="dark"` |
| CSS custom properties | `var(--bs-body-bg)`, `--bs-*` | `var(--cui-body-bg)`, `--cui-*` |
| Events | `show.bs.modal`, `shown.bs.tooltip`, `slid.bs.carousel` | `show.coreui.modal`, `shown.coreui.tooltip`, `slid.coreui.carousel` |
| Placement attribute on tips and menus | `data-popper-placement` (Bootstrap 5) | `data-coreui-placement` |
| UMD global | `bootstrap.Tooltip.getOrCreateInstance(el)` | `coreui.Tooltip.getOrCreateInstance(el)` |

```js
// Bootstrap
el.addEventListener('hidden.bs.modal', onHidden)
bootstrap.Modal.getOrCreateInstance(el).show()

// CoreUI
el.addEventListener('hidden.coreui.modal', onHidden)
coreui.Modal.getOrCreateInstance(el).show()
```

1. Rename only `data-bs-`, `--bs-` and `.bs.`. Keep `.bs-tooltip-*` and `.bs-popover-*`: CoreUI uses the same class names.
2. If the project compiled Bootstrap 6 from Sass, its tokens were unprefixed (`var(--spacer)`). Rename those reads to `--cui-` too, because CoreUI's Sass emits the prefix itself.
3. Bootstrap 6 has no UMD global. With CoreUI you can keep a classic `<script src="coreui.bundle.min.js">` and use `coreui.*`, or keep ES modules:

   ```html
   <!-- Bootstrap 6 -->
   <script type="module">
     import { Tooltip } from './bootstrap.bundle.min.js'
   </script>

   <!-- CoreUI, ES module: map the Floating UI specifier -->
   <script type="importmap">
     { "imports": { "@floating-ui/dom": "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.8.0/+esm" } }
   </script>
   <script type="module">
     import { Tooltip } from './coreui.esm.min.js'
   </script>
   ```

---

## Step 4: Bootstrap 6 projects: apply the CoreUI differences

### Responsive and state classes use an infix

CoreUI writes the breakpoint inside the class name, not as a prefix. Move `{bp}:` into the class after its property part. Hover variants become a `-hover` suffix. The breakpoint names and widths are the same (`sm 576`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`).

| Bootstrap 6 | CoreUI |
| --- | --- |
| `md:d-none`, `lg:p-3`, `2xl:d-none` | `d-md-none`, `p-lg-3`, `d-2xl-none` |
| `md:col-6`, `md:row-cols-3`, `md:offset-2` | `col-md-6`, `row-cols-md-3`, `offset-md-2` |
| `md:g-3`, `md:gx-3` | `g-md-3`, `gx-md-3` |
| `sm:container` | `container-sm` |
| `md:navbar-expand` | `navbar-expand-md` |
| `md:drawer` | `drawer-md` |
| `md:table-responsive` | `table-responsive-md` |
| `md:list-group-horizontal` | `list-group-horizontal-md` |
| `md:sticky-top`, `md:vstack`, `md:hstack` | `sticky-md-top`, `vstack-md`, `hstack-md` |
| `sm-down:dialog-fullscreen` | `dialog-fullscreen-sm-down` |
| `hover:underline-offset-2` | `underline-offset-2-hover` |

The colon stays inside attribute values: `data-coreui-placement="bottom-start lg:bottom-end"`. Stacks, navbar expansion, horizontal list groups and card groups use container queries in both libraries, so keep the `.contains-inline` containers.

### Classes that differ

| Bootstrap 6 | CoreUI |
| --- | --- |
| `.btn-text` | `.btn-ghost` |
| `.btn-styled` | No equivalent. Remove it. |
| `.theme-accent`, `.bg-accent`, `.fg-accent`, `.border-accent` and other `*-accent` | No `accent` color. Use another `.theme-*` class or add an `accent` entry to `$theme-colors` (Step 6). |
| `<div class="switch"><input type="checkbox" switch></div>` | `<input class="switch" type="checkbox" role="switch">` (the class goes on the input) |
| `.chip-dismiss` | `.chip-remove` |
| `.avatar-status.status-online`, `.status-away`, `.status-busy` | `.avatar-status.theme-success`, `.theme-warning`, `.theme-danger` |
| `.avatar-status.status-offline` | `.avatar-status` with no theme class |
| `.carousel-icon-prev`, `.carousel-icon-next` inside a `.btn-icon` | `<button class="carousel-control-prev">` with `.carousel-control-prev-icon` (and `-next`) |
| `.carousel-overlay`, `.carousel-overlay-controls` | No equivalent. See `/components/carousel/`. |
| `.otp`, `.otp-input`, `.otp-slot` | `.form-otp`, `.form-otp-control` (one input per character) |
| `.strength`, `.strength-segment` | An empty `<div data-coreui-password-strength>` (the plugin renders the meter) |
| `.stepper` with `.stepper-item` | A different component: `.stepper[data-coreui-stepper]` with `.stepper-steps` and `.stepper-step`. See `/forms/stepper/`. |

Form adorn becomes Form Control Group:

```html
<!-- Bootstrap 6 -->
<label class="form-control form-adorn">
  <div class="form-adorn-icon" aria-hidden="true">…</div>
  <input type="search" class="form-ghost" placeholder="Search…">
</label>

<!-- CoreUI -->
<div class="form-control-group">
  <span class="form-control-icon">…</span>
  <input type="search" class="form-control" placeholder="Search…" aria-label="Search">
</div>
```

Use `.form-control-text` for a static prefix or suffix and `.form-control-action` for a button inside the frame.

These Bootstrap 6 features have no CoreUI equivalent. Keep your own CSS or JavaScript for them: `.prose` / `.not-prose`, `.nav-overflow` (NavOverflow), `data-bs-toggle="toggler"` (Toggler), `.nav-pills-vertical`, `.input-group-btn`, `.color-scheme-auto`.

### JavaScript components that differ

These plugins are the same: Alert, Button, Carousel, Collapse, Dialog, Drawer, Menu, Popover, ScrollSpy, Tab, Toast and Tooltip. Their options, events and methods match, and `show()`, `hide()`, `toggle()` and `close()` return a promise in both. Collapse adds one option, `hiddenUntilFound`.

| Bootstrap 6 | CoreUI | Docs |
| --- | --- | --- |
| `Combobox`: `.menu` with `<button class="menu-item" data-bs-value>` after the toggle | `Combobox`: the toggle stays; the panel is `.popup.combobox-popup` holding `.list-box` > `.list-box-options[role="listbox"]` > `.list-box-option[data-coreui-value]` | `/forms/combobox/` |
| `Datepicker`, `data-bs-toggle="datepicker"` on an input, needs `vanilla-calendar-pro` | `DatePicker`, `data-coreui-date-picker` on a `<div>`, no third-party calendar | `/forms/date-picker/` |
| `OtpInput`, `data-bs-otp` (`length`, `groups`, `mask`, `separator`) | `OTPInput`, `data-coreui-otp` (`masked`, `linear`, `autoSubmit`, `name`) | `/forms/otp-input/` |
| `Strength`, `data-bs-strength` | `PasswordStrength`, `data-coreui-password-strength` with `data-coreui-input="#field"` | `/forms/password-strength/` |
| `Chips`, `data-bs-chips` | `ChipInput`, `data-coreui-chip-input` | `/forms/chip-input/` |
| `Range`, `data-bs-bubble`, `formatter` | `Range`, `data-coreui-tooltips` (`true` or `"always"`), `tooltipsFormat` | `/forms/range/` |

```html
<!-- Bootstrap 6 -->
<div class="form-range" data-bs-bubble>
  <input type="range" class="form-range-input">
</div>

<!-- CoreUI -->
<div class="form-range" data-coreui-tooltips>
  <input type="range" class="form-range-input">
</div>
```

---

## Step 5: Bootstrap 5 projects: apply the v6 changes

CoreUI v6 follows the Bootstrap 5 to 6 changes, with three exceptions: responsive classes keep the infix (`d-md-none`), `.modal`, `.offcanvas` and `.dropdown` keep working, and `.fs-1` to `.fs-6` stay. Apply these changes in order.

1. **Breakpoints.** Rename `xxl` to `2xl` in every class (`.col-xxl-6` → `.col-2xl-6`, `.container-xxl` → `.container-2xl`, `.modal-fullscreen-xxl-down` → `.modal-fullscreen-2xl-down`). `lg` is now `1024px`, `xl` `1280px`, `2xl` `1536px`.
2. **Spacing.** The scale has steps `0` to `12`. Keep the Bootstrap 5 sizes by mapping `2` → `3`, `3` → `5`, `4` → `7`, `5` → `12` in every margin, padding, gap and gutter class (`.p-3` → `.p-5`, `.mb-4` → `.mb-7`).
3. **Color variants.** Compose a variant class with a `.theme-*` class. Rename `-dark` to `-inverse` and `-light` to `-secondary`.

   | Bootstrap 5 | CoreUI v6 |
   | --- | --- |
   | `.btn-primary` | `.btn-solid.theme-primary` |
   | `.btn-outline-primary` | `.btn-outline.theme-primary` |
   | `.btn-dark`, `.btn-light` | `.btn-solid.theme-inverse`, `.btn-solid.theme-secondary` |
   | `.alert-primary` | `.alert.theme-primary` |
   | `.badge.bg-primary` | `.badge.theme-primary` |
   | `.link-primary` | `.theme-primary.underline` |
   | `.link-body-emphasis` | `.text-body-emphasis` |
   | `.text-muted` | `.fg-2` |
   | `.text-black-50`, `.text-white-50` | `.fg-black.fg-50`, `.fg-white.fg-50` |
   | `.bg-light`, `.bg-dark` panels | `.bg-3` or `.bg-4`; `data-coreui-theme="dark"` on a dark container |

   `dist/css/coreui-legacy.min.css`, loaded after `coreui.min.css`, keeps `.btn-{color}`, `.btn-outline-{color}`, `.alert-{color}`, `.list-group-item-{color}`, `.form-check*`, `.form-switch` and `.dropdown-menu-{bp}-{start|end}` working while you migrate. It does not cover the `-light` and `-dark` variants.

4. **Utilities.**

   | Bootstrap 5 | CoreUI v6 |
   | --- | --- |
   | `.mw-100`, `.mh-100` | `.max-w-100`, `.max-h-100` |
   | `.link-offset-2`, `.link-offset-2-hover` | `.underline-offset-2`, `.underline-offset-2-hover` |
   | `.display-4`, `.display-5`, `.lead` | `.fs-6xl`, `.fs-5xl`, `.fs-lg` (add `.fw-light` and `.lh-1` for the old look) |
   | `<div class="ratio ratio-16x9"><iframe>` | `<iframe class="w-100 ratio-16x9">` |
   | `.spinner-border-sm` | `.spinner-border.spinner-sm` |
   | `.form-select` | `.form-control` on the `<select>` (`.form-select` is a deprecated alias) |
   | `.btn-close-white` | Remove it; the icon follows the text `color` |
   | `.card-link`, `.card-header-pills`, `.has-validation`, `.form-check-reverse` | Remove them |

   `.display-1` to `.display-3` have no matching stop. Set `font-size` yourself.

5. **Modal.** Flatten `.modal > .modal-dialog > .modal-content` into one `<dialog class="modal">`. Rename `.modal-dialog-scrollable` to `.modal-scrollable` on the dialog. Remove `.modal-dialog-centered`, `.fade`, `tabindex`, `role`, `aria-modal` and `aria-hidden`. Use `.modal-instant` to turn the animation off. Remove the `focus` option. Prefer the Dialog component for new work: `.modal` is deprecated in v6.

   ```html
   <!-- Bootstrap 5 -->
   <div class="modal fade" id="m" tabindex="-1">
     <div class="modal-dialog"><div class="modal-content">
       <div class="modal-header">…</div><div class="modal-body">…</div>
     </div></div>
   </div>

   <!-- CoreUI v6 Dialog -->
   <dialog class="dialog" id="m" aria-labelledby="mTitle">
     <div class="dialog-header">
       <h5 class="dialog-title" id="mTitle">Title</h5>
       <button type="button" class="btn-close" data-coreui-dismiss="dialog" aria-label="Close"></button>
     </div>
     <div class="dialog-body">…</div>
   </dialog>
   ```

   The trigger becomes `data-coreui-toggle="dialog"`. Unconverted `.modal` markup still opens: the plugin rebuilds it at runtime and logs a console warning.

6. **Offcanvas.** Change the element to `<dialog class="offcanvas offcanvas-start">`, or move to `<dialog class="drawer drawer-start">` with `data-coreui-toggle="drawer"`. Remove `.offcanvas-backdrop` selectors.
7. **Dropdown.** The markup keeps working. Replace `.dropdown-menu-lg-end` with a responsive placement on the toggle: `data-coreui-placement="bottom-start lg:bottom-end"`. Prefer Menu (`data-coreui-toggle="menu"`, `.menu`, `.menu-item`) for new work.
8. **Accordion.** Use native `<details>`. The shared `name` replaces `data-bs-parent`.

   ```html
   <div class="accordion">
     <details class="accordion-item" name="faq" open>
       <summary class="accordion-header">Item 1</summary>
       <div class="accordion-body">Content</div>
     </details>
   </div>
   ```

   Remove `.accordion-button`, `.accordion-collapse` and the `collapse` toggles. The header draws its own icon.
9. **Checks, radios and switches.** Put the class on the input and wrap the pair in `.form-field`.

   ```html
   <!-- Bootstrap 5 -->
   <div class="form-check form-switch">
     <input class="form-check-input" type="checkbox" role="switch" id="s1">
     <label class="form-check-label" for="s1">Wi-Fi</label>
   </div>

   <!-- CoreUI v6 -->
   <div class="form-field">
     <input class="switch" type="checkbox" role="switch" id="s1">
     <label for="s1">Wi-Fi</label>
   </div>
   ```

   Use `.check` for checkboxes and `.radio` for radios. Toggle buttons move `.btn-check` to the `<label>`.
10. **Validation.** Replace `<form class="needs-validation" novalidate>` with `<form data-coreui-validate novalidate>`. Delete the script that adds `.was-validated`; the Form plugin blocks an invalid submit and marks the fields. Use `data-coreui-validate="valid"` to also style valid fields. `.is-invalid` and `.is-valid` still work for server-side results.
11. **JavaScript options.**
    - Rename `popperConfig` to `floatingConfig` on Tooltip, Popover and Dropdown. It takes a Floating UI `computePosition` config, not Popper modifiers.
    - Carousel: `data-bs-ride="carousel"` → `data-coreui-autoplay="true"`; `wrap: true` → `ends: "wrap"` (default `"loop"`); `wrap: false` → `ends: "stop"`. The `touch` option and `.carousel-dark`, `.carousel-item-start`, `.carousel-item-end`, `.carousel-item-next`, `.carousel-item-prev` and `.pointer-event` are gone.
    - Collapse: remove the `toggle` option. Triggers no longer get `.collapsed`; select `[aria-expanded="false"]`.
    - ScrollSpy: remove `offset` and `method`; use `topMargin`.
    - `show()`, `hide()`, `toggle()` and `close()` return a promise that resolves when the matching `shown`/`hidden` event fires.
12. **CSS variables.** `var(--bs-primary)` becomes `var(--cui-primary-base)`. `--bs-*-rgb` tokens are gone:

    ```css
    /* Bootstrap 5 */
    background-color: rgba(var(--bs-primary-rgb), .5);
    /* CoreUI v6 */
    background-color: color-mix(in srgb, var(--cui-primary-base) 50%, transparent);
    ```

13. **Browsers.** CoreUI v6 needs Chrome 123, Edge 123, Firefox 129, Safari 18 or newer.

---

## Step 6: Update Sass

1. Replace `@import` with `@use`. `@import` no longer resolves any CoreUI file.

   ```scss
   // Bootstrap 5
   $primary: #0074d9;
   @import "bootstrap/scss/bootstrap";

   // Bootstrap 6
   @use "bootstrap/scss/bootstrap" with (
     $root-tokens: (--spacer: 1.25rem),
   );

   // CoreUI v6
   @use "@coreui/coreui-pro/scss/coreui" with (
     $primary: #0074d9,
     $spacer: 1.25rem,
     $root-tokens: (
       --cui-radius: .375rem,
     ),
   );
   ```

2. Write token map keys with the `--cui-` prefix (`--cui-radius`, `--cui-alert-padding-x`). Bootstrap 6 writes them unprefixed and adds `--bs-` with PostCSS; CoreUI adds the prefix in Sass, so remove any PostCSS prefix step.
3. Keep the module paths and swap the package: `bootstrap/scss/config` → `@coreui/coreui-pro/scss/config`, `bootstrap/scss/forms/check` → `@coreui/coreui-pro/scss/forms/check`. Bootstrap 5's `_variables.scss` is `_config.scss`.
4. Rename Sass names:

   | Bootstrap | CoreUI v6 |
   | --- | --- |
   | `$grid-breakpoints` (5) | `$breakpoints` |
   | `$border-radius`, `$border-radius-sm/lg/xl/xxl/pill` (5) | `--cui-radius` and `--cui-radius-0` to `--cui-radius-9` tokens |
   | `$radius` in `scss/config` (6) | `--cui-radius` in `$root-tokens` |
   | `$btn-close-tokens` (6) | `$close-tokens` |
   | `$range-tokens` (6) | `$form-range-tokens` |
   | `$otp-tokens` (6) | `$form-otp-tokens` |
   | `$strength-tokens` (6) | `$password-strength-tokens` |
   | `$datepicker-tokens` (6) | `$date-picker-tokens` |
   | `$form-adorn-tokens` (6) | `$form-control-group-tokens` |

5. Pass partial maps. `$theme-colors`, `$breakpoints`, `$spacers` and the token maps merge your keys over the defaults. Set a key to `null` to remove it:

   ```scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     $breakpoints: (2xl: 1400px),
     $theme-colors: ("info": null),
   );
   ```

6. To recreate Bootstrap 6's `accent` color, add an `accent` hue to `$colors` and an `accent` entry to `$theme-colors`, as shown in `/customize/sass/` under "Add to map".
7. Compile `coreui-legacy` as its own entry, or link `dist/css/coreui-legacy.min.css`. Do not `@use` it after `coreui` in the same file: Sass rejects the second configuration of the shared banner module.

---

## Step 7: Adopt CoreUI PRO components (optional)

CoreUI ships these components that Bootstrap does not. Each one uses `data-coreui-*` attributes and `*.coreui.*` events.

| Need | Component | Docs |
| --- | --- | --- |
| Search-as-you-type input | Autocomplete | `/forms/autocomplete/` |
| Multiple selection with chips and search | Multi Select | `/forms/multi-select/` |
| Dates and times | Calendar, Date Picker, Date Range Picker, Date Input, Date Range Input, Time Picker, Time Input | `/components/calendar/`, `/forms/date-picker/`, `/forms/date-range-picker/`, `/forms/date-input/`, `/forms/date-range-input/`, `/forms/time-picker/`, `/forms/time-input/` |
| Numeric and password fields | Number Input, Password Input, Password Strength | `/forms/number-input/`, `/forms/password-input/`, `/forms/password-strength/` |
| Two-handle slider, star rating | Range Slider, Rating | `/forms/range-slider/`, `/forms/rating/` |
| Multi-step forms | Stepper | `/forms/stepper/` |
| Lists and moving items between lists | List Box, Transfer | `/components/list-box/`, `/components/transfer/` |
| Right-click menu | Context Menu | `/components/context-menu/` |
| Chips | Chip, Chip Set, Chip Input | `/components/chip/`, `/components/chip-set/`, `/forms/chip-input/` |
| Busy buttons, command search | Loading Button, Search Button | `/components/loading-button/`, `/components/search-button/` |
| Notification stack | Toaster | `/components/toaster/` |
| Admin layout | Sidebar, Header, Footer, Callout | `/components/sidebar/`, `/components/header/`, `/components/footer/`, `/components/callout/` |

React and Vue projects can use `@coreui/react-pro` and `@coreui/vue-pro` (version `6.0.0-alpha.0`) instead of the vanilla plugins.

---

## Verify

1. Build the project and fix every compile error.
2. Search for leftovers. Each pattern should return nothing, or only intended matches:
   - `bootstrap` in `package.json`, imports, `<link>` and `<script>` tags
   - `@popperjs/core`, `popperConfig`, `vanilla-calendar-pro`
   - `data-bs-`, `--bs-`, `\.bs\.`, `bootstrap\.` (keep `.bs-tooltip-*` and `.bs-popover-*`)
   - Bootstrap 6: class names containing `:` such as `md:`, `lg:`, `2xl:`, `hover:`, `sm-down:`
   - Bootstrap 6: `btn-text`, `btn-styled`, `-accent`, `form-adorn`, `form-ghost`, `chip-dismiss`, `status-online`, `carousel-icon-`, `data-bs-chips`, `data-bs-strength`, `data-bs-otp`, `data-bs-bubble`, `toggle="datepicker"`, `nav-overflow`, `prose`
   - Bootstrap 5: `-xxl`, `btn-primary`, `btn-outline-`, `-light`, `-dark` (except `.navbar-dark`), `text-muted`, `modal-dialog`, `modal-content`, `accordion-button`, `form-check`, `needs-validation`, `was-validated`, `data-bs-ride`, `display-`, `lead`, `mw-100`, `mh-100`, `link-offset-`, `--bs-.*-rgb`
   - `@import` in Sass files
3. Check every converted class against the stylesheet before keeping it:

   ```sh
   grep -c '\.d-md-none' node_modules/@coreui/coreui-pro/dist/css/coreui.css
   ```

   A count of `0` means the class does not exist in CoreUI.
4. Open the pages in a browser. Confirm the console shows no module-resolution errors and no legacy-markup warnings, then open a dialog, a menu and a tooltip.
5. If you loaded `coreui-legacy.min.css`, remove it and confirm nothing changes on screen.

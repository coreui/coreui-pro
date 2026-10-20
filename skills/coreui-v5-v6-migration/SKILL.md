---
name: coreui-v5-v6-migration
description: Migrate a project from CoreUI PRO for Bootstrap v5 (@coreui/coreui-pro 5.x) to v6, covering dependencies, Sass, CSS classes, data attributes, component markup and JavaScript plugins. Use when upgrading @coreui/coreui-pro from 5.x to 6.x or fixing v5 classes, data attributes, Sass variables or plugin calls that stopped working after the upgrade.
guide: /migration/v6/
---

# CoreUI PRO v5 to v6 Migration

Work through the steps in order. After each step, search the codebase for the v5 patterns that step lists before you move on.

Modal, Offcanvas and Dropdown keep their names in v6: `.modal`, `.offcanvas`, `.dropdown-menu`, `data-coreui-toggle="modal"` and the `*.coreui.modal` events stay. Dialog (`.dialog`), Drawer (`.drawer`) and Menu (`.menu`) are new components, not renames. Do not convert one into the other as part of the migration.

## Workflow

- [ ] Step 1: Update dependencies, distributed files and the Sass entry point
- [ ] Step 2: Rename classes and data attributes
- [ ] Step 3: Restructure component markup
- [ ] Step 4: Update JavaScript
- [ ] Step 5: Move Sass variables and CSS custom properties to tokens
- [ ] Step 6: Replace removed classes, utilities and helpers
- [ ] Step 7: Verify

---

## Step 1: Dependencies, distributed files and Sass entry point

1. Set the package version in `package.json`: `"@coreui/coreui-pro": "6.0.0-alpha.0"`.
2. Replace `@popperjs/core` with `@floating-ui/dom` (peer dependency `^1.8.0`). `coreui.bundle.js` and `coreui.bundle.min.js` include Floating UI. With `coreui.js` from a CDN, replace the Popper script with `floating-ui.core.umd.min.js` followed by `floating-ui.dom.umd.min.js`.
3. Remove `.rtl` from stylesheet links. `coreui.rtl.css`, `coreui-grid.rtl.css`, `coreui-reboot.rtl.css` and `coreui-utilities.rtl.css` no longer ship. Keep `dir="rtl"` on `<html>`.

   ```html
   <!-- v5 -->
   <link href="css/coreui.rtl.min.css" rel="stylesheet">
   <!-- v6 -->
   <link href="css/coreui.min.css" rel="stylesheet">
   ```

4. If the project loads the Bootstrap-compatible build (`dist/css/themes/bootstrap/bootstrap.css`, `dist/js/bootstrap.js`, `bootstrap.bundle.js`, `bootstrap.esm.js`), switch to `coreui.min.css` and `coreui.bundle.min.js`. Then rename `data-bs-*` to `data-coreui-*`, `*.bs.*` events to `*.coreui.*`, the `bootstrap` global to `coreui`, and `--bs-*` properties to `--cui-*`.
5. Fix JavaScript import paths. `js/src` now ships TypeScript, and `js/index.esm.js` and `js/index.umd.js` are no longer published.

   ```js
   // v5
   import Alert from '@coreui/coreui-pro/js/src/alert.js'
   import { Tooltip } from '@coreui/coreui-pro/js/index.esm.js'
   // v6
   import Alert from '@coreui/coreui-pro/js/dist/alert.js'
   import { Tooltip } from '@coreui/coreui-pro'
   ```

6. Raise the browser targets to Chrome 123, Edge 123, Firefox 130, Safari 18 and iOS 18. If the project must support older browsers, stop and keep it on v5.
7. Replace every Sass `@import` of CoreUI with `@use`. The `*.import.scss` files are gone, so `@import` no longer resolves. Configuration moves into a `with ()` clause, and the `@use` rule must come first in the file.

   ```scss
   // v5
   $primary: #6f42c1;
   @import "@coreui/coreui-pro/scss/coreui";

   // v6
   @use "@coreui/coreui-pro/scss/coreui" with (
     $primary: #6f42c1
   );
   ```

8. Update direct `@use` paths to partials:

   | v5 path | v6 path |
   | --- | --- |
   | `scss/variables` | `scss/config`, `scss/colors`, `scss/theme` |
   | `scss/maps` | `scss/utilities` (utility maps), `scss/config` (`$gutters`) |
   | `scss/variables-dark` | removed, no replacement (see Step 5) |
   | `scss/mixins` | `scss/mixins` (now `mixins/index.scss`) |
   | `scss/functions` | `scss/functions` (now `functions/index.scss`) |
   | `scss/buttons`, `scss/close` | `scss/buttons/button`, `scss/buttons/close` |
   | `scss/reboot`, `scss/tables` | `scss/content/reboot`, `scss/content/tables` |
   | `scss/grid` | `scss/layout/grid` |
   | `scss/spinners`, `scss/placeholders` | `scss/spinner`, `scss/placeholder` |
   | `scss/forms/form-check` | `scss/forms/check` |
   | `scss/forms/form-otp` | `scss/forms/otp-input` |
   | `scss/forms/form-select`, `scss/forms/form-password` | removed, styles live in `scss/forms/form-control` and the plugin |
   | `scss/mixins/breakpoints` | `scss/layout/breakpoints` |

9. Decide on the compatibility stylesheet. The deprecated v5 spellings moved out of `coreui.css` into `coreui-legacy.css`: the colour modifiers `.btn-{color}`, `.btn-outline-{color}`, `.btn-ghost-{color}`, `.alert-{color}`, `.callout-{color}`, `.chip-{color}`, `.list-group-item-{color}`, the `.form-check*` and `.form-switch*` markup, `.btn-check` on an `<input>`, and `.dropdown-menu-{breakpoint}-{start|end}`. Prefer migrating the markup in Steps 2 and 3. Load the sheet only while markup still uses them, after `coreui.css`:

   ```html
   <link href="css/coreui.min.css" rel="stylesheet">
   <link href="css/coreui-legacy.min.css" rel="stylesheet">
   ```

   From Sass, add `@use "@coreui/coreui-pro/scss/coreui-legacy";` after the main `@use`.

---

## Step 2: Rename classes and data attributes

### Breakpoint `xxl` is `2xl`

Rename the `xxl` infix to `2xl` in every responsive class. `.icon-xxl` is a size, not a breakpoint, and keeps its name.

| v5 | v6 |
| --- | --- |
| `.col-xxl-6`, `.d-xxl-none`, `.p-xxl-3` | `.col-2xl-6`, `.d-2xl-none`, `.p-2xl-3` |
| `.container-xxl` | `.container-2xl` |
| `.navbar-expand-xxl`, `.offcanvas-xxl` | `.navbar-expand-2xl`, `.offcanvas-2xl` |
| `.modal-fullscreen-xxl-down` | `.modal-fullscreen-2xl-down` |
| `.table-responsive-xxl`, `.sticky-xxl-top` | `.table-responsive-2xl`, `.sticky-2xl-top` |

### Spacing utilities

`$spacers` now has steps `0` to `12`, so the same number gives a different size. Rename every margin, padding, gap and gutter class (`m*`, `p*`, `gap-*`, `row-gap-*`, `column-gap-*`, `g-*`, `gx-*`, `gy-*`, and their responsive variants such as `.p-md-3`) to keep v5 spacing:

| v5 step | value | v6 step |
| --- | --- | --- |
| `1` | `.25rem` | `1` |
| `2` | `.5rem` | `3` |
| `3` | `1rem` | `5` |
| `4` | `1.5rem` | `7` |
| `5` | `3rem` | `12` |

Replace in descending order (`5` to `12`, then `4` to `7`, then `3` to `5`, then `2` to `3`) so that a renamed class is not renamed twice. Component spacing is unchanged and needs no action, except cards (see Step 3).

### Border-radius utilities

`.rounded-{n}` now counts stops of a ten-step radius scale. To keep v5 radii:

| v5 | v6 |
| --- | --- |
| `.rounded` (`.375rem`) | `.rounded-4` |
| `.rounded-1` | `.rounded-3` |
| `.rounded-2` | `.rounded-4` |
| `.rounded-3` | `.rounded-5` |
| `.rounded-4` | `.rounded-9` |
| `.rounded-5` (`2rem`) | no class, set `border-radius` yourself |

Apply the same numbers to `.rounded-top-*`, `.rounded-end-*`, `.rounded-bottom-*` and `.rounded-start-*`. Replace in descending order (`4` to `9`, `3` to `5`, `2` to `4`, `1` to `3`). `.rounded-0`, `.rounded-circle` and `.rounded-pill` are unchanged.

### Colour classes: variant plus theme

A colour modifier is now a variant class plus a `.theme-{color}` class. The v5 classes only work with `coreui-legacy.css`.

| v5 | v6 |
| --- | --- |
| `.btn.btn-primary` | `.btn-solid.theme-primary` (`.btn` is optional) |
| `.btn.btn-outline-primary` | `.btn-outline.theme-primary` |
| `.btn.btn-ghost-primary` | `.btn-ghost.theme-primary` |
| `.alert.alert-primary` | `.alert.theme-primary` |
| `.callout.callout-primary` | `.callout.theme-primary` |
| `.chip.chip-primary` | `.chip.theme-primary` |
| `.list-group-item.list-group-item-primary` | `.list-group-item.theme-primary` |
| `.badge.bg-primary` | `.badge.theme-primary` |
| `.link-primary` | `.theme-primary.underline` on the `<a>` |

`.text-bg-{color}`, `.bg-{color}` and `.table-{color}` keep working.

### `dark` and `light` are `inverse` and `secondary`

The `dark` and `light` theme colours are gone. Rename `-dark` to `-inverse` and `-light` to `-secondary` in `bg`, `text`, `text-bg`, `border`, `btn`, `btn-outline`, `btn-ghost`, `alert`, `callout`, `chip`, `list-group-item`, `table`, `focus-ring`, `shadow` and `underline` classes, and in their `-subtle` and `-emphasis` forms (`.bg-dark-subtle` becomes `.bg-inverse-subtle`, `.text-dark-emphasis` becomes `.text-inverse-emphasis`). `.navbar-dark`, `.dropdown-menu-dark`, `.sidebar-dark` and `.fw-light` keep their names. Where `.bg-light` meant a neutral panel, use `.bg-3` or `.bg-4`. Where `.bg-dark` meant a dark area, set `data-coreui-theme="dark"` on the container.

### Utility renames

| v5 | v6 |
| --- | --- |
| `.mw-100`, `.mh-100` | `.max-w-100`, `.max-h-100` |
| `.link-offset-{n}`, `.link-offset-{n}-hover` | `.underline-offset-{n}`, `.underline-offset-{n}-hover` |
| `.link-underline-{color}` | `.underline-{color}` |
| `.link-underline-opacity-{n}`, `-hover` | `.underline-{n}`, `.underline-{n}-hover` |
| `.link-body-emphasis` | `.text-body-emphasis` |
| `.text-muted` | `.fg-2` |
| `.text-high-emphasis`, `.text-medium-emphasis`, `.text-disabled` | `.text-body`, `.fg-2`, `.fg-3` |
| `.text-black-50`, `.text-white-50` | `.fg-black.fg-50`, `.fg-white.fg-50` |
| `.bg-body-secondary`, `.bg-body-tertiary` | `.bg-3`, `.bg-2` (old names deprecated) |
| `.text-body-secondary`, `.text-body-tertiary` | `.fg-2`, `.fg-3` (old names deprecated) |
| `.text-{color}`, `.text-{color}-emphasis` | `.fg-{color}`, `.fg-emphasis-{color}` (old names deprecated) |
| `.bg-{color}-subtle`, `.border-{color}-subtle` | `.bg-subtle-{color}`, `.border-subtle-{color}` (old names deprecated) |
| `.text-opacity-{n}`, `.bg-opacity-{n}`, `.link-opacity-{n}` | `.fg-{n}`, `.bg-{n}`, `.link-{n}` with `n` in steps of 10 (old names deprecated) |
| `.lh-base` | `.lh-md` (old name deprecated) |
| `.placeholder-glow` | `.placeholder-pulse` (old name kept as alias) |

### Component class renames

| v5 | v6 |
| --- | --- |
| `.form-select`, `.form-select-sm`, `.form-select-lg` | `.form-control`, `.form-control-sm`, `.form-control-lg` on the `<select>` (old names deprecated) |
| `.modal-dialog-scrollable` | `.modal-scrollable` on the `<dialog>` |
| `.spinner-border-sm`, `.spinner-grow-sm` | `.spinner-sm` |
| `.header-sticky` | `.sticky-top` |
| `.footer-sticky` | `.sticky-bottom` |
| `.chip-dismiss` | `.chip-remove` |
| `.form-switch-lg`, `.form-switch-xl` | `.switch-lg`, `.switch-xl` |
| `.date-picker-dropdown`, `.time-picker-dropdown` | `.date-picker-popup`, `.time-picker-popup` |
| `.time-picker-roll-col`, `.time-picker-roll-cell` | `.time-picker-col`, `.time-picker-cell` |
| `.time-picker-inline-select`, `.time-picker-inline-icon` | `.date-picker-time-select`, `.date-picker-time-icon` |

The field components (Autocomplete, Multi Select, Chip Input, Password Input, the pickers) render a shared frame. Rewrite custom CSS that targets the v5 internals:

| v5 | v6 |
| --- | --- |
| `.date-picker-input-group`, `.time-picker-input-group`, `.autocomplete-input-group`, `.form-multi-select-input-group`, `.form-password` | `.form-control-group` |
| `.date-picker-indicator`, `.time-picker-indicator`, `.autocomplete-indicator`, `.form-multi-select-indicator`, `.form-password-action` | `.form-control-action` |
| `.date-picker-cleaner`, `.time-picker-cleaner`, `.autocomplete-cleaner`, `.form-multi-select-cleaner` | `.form-control-cleaner` |
| `.autocomplete-input`, `.date-picker-input`, `.time-picker-input` | plain `.form-control` inside the group |
| `.date-picker-separator` | `.form-control-icon` |
| `.date-picker-sm`, `.time-picker-sm`, `.autocomplete-sm`, `.form-multi-select-sm` (and `-lg`) | `.form-control-sm` / `.form-control-lg` (the plugin sets it from the `size` option) |
| `.autocomplete-dropdown`, `.form-multi-select-dropdown` | `.combobox-popup` |
| `.autocomplete-options`, `.form-multi-select-options` | `.list-box-options` |
| `.autocomplete-option`, `.form-multi-select-option` | `.list-box-option` |
| `.form-multi-select-optgroup`, `.form-multi-select-optgroup-label`, `.autocomplete-optgroup-label` | `.list-box-section`, `.list-box-section-label` |
| `.autocomplete-options-empty`, `.form-multi-select-options-empty` | `.list-box-empty` |
| `.form-multi-select-all` | `.list-box-select-all` |
| `.form-multi-select-tag`, `.form-multi-select-tag-delete` | `.chip`, `.chip-remove` |
| `.autocomplete-buttons`, `.form-multi-select-buttons`, `.date-picker-input-wrapper`, `.date-picker-input-preview` | removed, no replacement |
| `.range-slider` (inner), `.range-slider-input`, `.range-slider-vertical`, `.range-slider-tooltip` | `.form-range`, `.form-range-input`, `.form-range-vertical`, `.form-range-tooltip` |
| `.range-slider-labels-container`, `.range-slider-label` | `.form-range-ticks`, `.form-range-tick` (text in `.form-range-tick-label`) |
| `.range-slider-inputs-container`, `.range-slider-track` | removed, no replacement |

### Data attributes

A plugin that builds a component inside an element is enabled with a bare `data-coreui-{name}`. `data-coreui-toggle` stays only on controls the user activates (Modal, Offcanvas, Collapse, Tab, Tooltip, Popover, Dropdown, Button, Loading Button).

| v5 | v6 |
| --- | --- |
| `data-coreui-toggle="autocomplete"` | `data-coreui-autocomplete` |
| `data-coreui-toggle="calendar"` | `data-coreui-calendar` |
| `data-coreui-toggle="date-picker"` | `data-coreui-date-picker` |
| `data-coreui-toggle="date-range-picker"` | `data-coreui-date-range-picker` |
| `data-coreui-toggle="time-picker"` | `data-coreui-time-picker` |
| `data-coreui-toggle="otp"` | `data-coreui-otp` |
| `data-coreui-toggle="range-slider"` | `data-coreui-range-slider` |
| `data-coreui-toggle="rating"` | `data-coreui-rating` |
| `data-coreui-toggle="stepper"` | `data-coreui-stepper` |
| `data-coreui-toggle="password"` (on the button) | `data-coreui-password-input` (on the input, see Step 3) |
| `data-coreui="navigation"` | `data-coreui-navigation` |
| `data-coreui-ride="carousel"` | `data-coreui-autoplay="true"` |
| `data-coreui-wrap="true"` / `"false"` | `data-coreui-ends="wrap"` / `"stop"` (default is `"loop"`) |
| `data-coreui-touch` | remove, touch is native |
| `data-coreui-animation` (Toast) | remove, add `.toast-instant` to skip the animation |
| `data-coreui-read-only` (Rating) | `data-coreui-readonly` |
| `data-coreui-readonly` (OTP) | remove, use `data-coreui-disabled="true"` |
| `data-coreui-select-adjacement-days`, `data-coreui-show-adjacement-days` | `data-coreui-select-adjacent-days`, `data-coreui-show-adjacent-days` |
| `data-coreui-labels`, `data-coreui-clickable-labels`, `data-coreui-aria-labels` (Range Slider) | `data-coreui-ticks`, `data-coreui-clickable-ticks`, `data-coreui-aria-label` |
| `data-coreui-search="global"` (Multi Select) | `data-coreui-search="true"` |
| `data-coreui-search="external, global"` (Autocomplete) | `data-coreui-search="external"` |
| `data-coreui-indicator` (pickers, Autocomplete) | `data-coreui-picker-icon` |
| `data-coreui-options-style="text"` (Multi Select) | `data-coreui-indicator="none"` |
| `data-coreui-selection-type-counter-text` (Multi Select) | `data-coreui-selected-label` (`{count}` is replaced) |
| `data-coreui-input-date-format` (pickers) | `data-coreui-format` |
| `data-popper-placement` (in CSS or JS) | `data-coreui-placement` |

---

## Step 3: Restructure component markup

### Modal and Offcanvas: native `<dialog>`

1. Flatten `.modal > .modal-dialog > .modal-content` to one `<dialog class="modal">` that holds `.modal-header`, `.modal-body` and `.modal-footer` directly.
2. Move size and fullscreen classes (`.modal-sm`, `.modal-lg`, `.modal-xl`, `.modal-fullscreen*`) onto the `<dialog>`.
3. Delete `.modal-dialog-centered`. Rename `.modal-dialog-scrollable` to `.modal-scrollable`.
4. Delete `.fade`. A modal animates by default. A v5 modal without `.fade` gets `.modal-instant`.
5. Delete `role`, `aria-modal`, `aria-hidden` and `tabindex="-1"` from the dialog.
6. For Offcanvas, change only the tag: `<dialog class="offcanvas offcanvas-start">`. Use `.offcanvas-instant` to disable animation.
7. Remove CSS that targets `.modal-dialog`, `.modal-content`, `.modal-backdrop` or `.offcanvas-backdrop`. Style the backdrop through `--cui-backdrop-color`, `--cui-backdrop-opacity` and `--cui-backdrop-blur`.

```html
<!-- v5 -->
<div class="modal fade" id="m" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content">
      <div class="modal-header">…</div>
      <div class="modal-body">…</div>
    </div>
  </div>
</div>

<!-- v6 -->
<dialog class="modal modal-lg" id="m">
  <div class="modal-header">…</div>
  <div class="modal-body">…</div>
</dialog>
```

v5 markup still renders, because the plugin rebuilds it at runtime and logs a console warning. Migrate it anyway: that layer is removed in v7.

### Accordion: native `<details>`

1. Put `.accordion-item` on a `<details>` element and `.accordion-header` on its `<summary>`.
2. Delete `.accordion-button`, the `.accordion-collapse` wrapper, `.collapsed`, `data-coreui-toggle`, `data-coreui-target`, `aria-controls` and `aria-expanded`.
3. Replace `data-coreui-parent` with the same `name` attribute on every `<details>` of one accordion. Omit `name` for an always-open accordion.
4. Replace `.show` on the open panel with the `open` attribute on its `<details>`.
5. Style the open state with `.accordion-item[open] > .accordion-header`, not `:not(.collapsed)`.

```html
<!-- v5 -->
<div class="accordion" id="acc">
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button" data-coreui-toggle="collapse" data-coreui-target="#one">Item</button>
    </h2>
    <div id="one" class="accordion-collapse collapse show" data-coreui-parent="#acc">
      <div class="accordion-body">…</div>
    </div>
  </div>
</div>

<!-- v6 -->
<div class="accordion">
  <details class="accordion-item" name="acc" open>
    <summary class="accordion-header">Item</summary>
    <div class="accordion-body">…</div>
  </details>
</div>
```

The open item is neutral in v6. Add `.theme-primary` to `.accordion` to keep the v5 tint.

### Checkbox, radio and switch

The control class moves onto the `<input>`, and the wrapper becomes `.form-field`.

| v5 | v6 |
| --- | --- |
| `<div class="form-check">` | `<div class="form-field">`, or no wrapper |
| `.form-check-input` on a checkbox | `.check` |
| `.form-check-input` on a radio | `.radio` |
| `.form-switch` wrapper plus `.form-check-input` | `.switch` on the input, with `role="switch"` |
| `.form-check-label` | a plain `<label>` |
| `.form-check-inline` | a `.d-flex.gap-4` row around the fields |
| `.form-check-reverse` | removed; use `order` utilities or `justify-content-between` |

```html
<!-- v5 -->
<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" id="s">
  <label class="form-check-label" for="s">Label</label>
</div>

<!-- v6 -->
<div class="form-field">
  <input class="switch" type="checkbox" role="switch" id="s">
  <label for="s">Label</label>
</div>
```

### Toggle buttons

Move `.btn-check` onto the `<label>` and nest the input inside it.

```html
<!-- v5 -->
<input type="checkbox" class="btn-check" id="t" autocomplete="off">
<label class="btn btn-primary" for="t">Toggle</label>

<!-- v6 -->
<label class="btn-solid theme-primary btn-check">
  <input type="checkbox" autocomplete="off">
  Toggle
</label>
```

### Password input

The plugin builds the frame, the button and its icon. Keep only the input.

```html
<!-- v5 -->
<div class="form-password">
  <input type="password" class="form-control">
  <button type="button" class="form-password-action" data-coreui-toggle="password" aria-label="Toggle password visibility">
    <span class="form-password-action-icon"></span>
  </button>
</div>

<!-- v6 -->
<input type="password" class="form-control" data-coreui-password-input>
```

Set the button's accessible name with the `ariaToggleLabel` option. Pass custom icons with `showIcon` and `hideIcon`.

### Form validation

1. Replace `.needs-validation` on the `<form>` with `data-coreui-validate`. Keep `novalidate`.
2. Delete the starter script that added `.was-validated`. The Form plugin stops an invalid submit and marks the controls.
3. Add `data-coreui-validate="valid"` to also show valid styling.
4. Keep server-side `.is-invalid` and `.is-valid`. They work without the attribute.

```html
<!-- v5 -->
<form class="needs-validation" novalidate>
<!-- v6 -->
<form data-coreui-validate novalidate>
```

### Input group with feedback

Delete `.has-validation`. Wrap the group in `.form-field` and move the feedback element out of the group, after it.

```html
<div class="form-field">
  <div class="input-group">
    <span class="input-group-text">@</span>
    <input type="text" class="form-control is-invalid" required>
  </div>
  <div class="invalid-feedback">Please choose a username.</div>
</div>
```

### Ratio

Delete the `.ratio` wrapper. Put the ratio class on the element you want sized.

```html
<!-- v5 -->
<div class="ratio ratio-16x9"><iframe src="…"></iframe></div>
<!-- v6 -->
<iframe class="w-100 ratio-16x9" src="…"></iframe>
```

A custom ratio moves from `--cui-aspect-ratio: 50%` to `--cui-ratio: 2 / 1` on `.ratio-auto`.

### Pickers: buttons and presets become templates

1. Replace the `footer`, `todayButton`, `cancelButton` and `confirmButton` options and their `*Classes` options with a `<template data-coreui-template="footer">` child. Bind buttons with `data-coreui-picker-action="today|clear|reset|close"` (`now` instead of `today` on the Time Picker).
2. Replace the `ranges` option of the Date Range Picker with a `<template data-coreui-template="ranges">` child. Apply a preset with `picker.getContext().setRange(start, end)` in your click handler.

```html
<div data-coreui-date-range-picker>
  <template data-coreui-template="footer">
    <button type="button" class="btn-ghost theme-primary btn-sm" data-coreui-picker-action="clear">Clear</button>
    <button type="button" class="btn-solid theme-primary btn-sm" data-coreui-picker-action="close">OK</button>
  </template>
</div>
```

### Other components

- **Alert.** An alert is a flex row. Wrap several block children (heading, paragraphs, `<hr>`) in `<div class="vstack">`. Keep the `.btn-close` a direct child of `.alert`. Every alert fades out on close; add `.alert-instant` where v5 omitted `.fade`.
- **Badge.** A bare `.badge` is neutral. Replace `.badge.bg-{color}` with `.badge.theme-{color}`, or keep `.text-bg-{color}`.
- **Card.** `.card-body` is a flex column. Add `.w-100` to a block child that must stretch, and replace `text-align` on buttons or links with `.mx-auto` or `.ms-auto`. Replace `.card-link` with a wrapper `<div class="hstack gap-4">`. Delete `.card-header-pills` and keep `.nav.nav-pills`.
- **Card group, list group.** `.card-group` and `.list-group-horizontal-{breakpoint}` read the width of the nearest query container. Add `.contains-inline` to an ancestor, or the cards stay stacked and the list stays vertical.
- **Navbar.** Wrap the content of every `.navbar-expand-*` navbar in `.container`, `.container-fluid` or `.container-{breakpoint}`.
- **Carousel.** Replace `.carousel-dark` with `data-coreui-theme="dark"` on the `.carousel`. Remove CSS that targets `.carousel-item-next`, `.carousel-item-prev`, `.carousel-item-start`, `.carousel-item-end` or `.pointer-event`; listen to the `slide` and `slid` events instead.
- **Toast.** Remove `.fade` from toasts. Remove CSS that targets `.showing`.
- **Tab.** Remove `.fade` from `.tab-pane`; panes fade on their own. Add `.tab-pane-instant` to switch without a fade.
- **Collapse.** Replace `.collapsed` selectors with `[aria-expanded="false"]` on the trigger.
- **Close button.** Delete `.btn-close-white`. The icon follows the text colour.
- **Button toolbar.** Remove `me-*` utilities between groups in `.btn-toolbar`; it has its own gap.
- **Spinner.** Spinners are `1em` square. Set `--cui-spinner-width` and `--cui-spinner-height` where a standalone spinner must keep a fixed size.
- **Breadcrumb.** The bottom margin is gone. Add `.mb-5` where the page relied on it.
- **Dropdown.** Replace `.dropdown-menu-{breakpoint}-{start|end}` with a responsive placement on the toggle, for example `data-coreui-placement="bottom-start lg:bottom-end"`. `.dropdown-menu-start` and `.dropdown-menu-end` stay.
- **Chip.** Replace an `.active` class with `data-coreui-selected="true"` and a `.disabled` class with `data-coreui-disabled="true"`. The `.disabled` class no longer disables Chip, Chip Set, Chip Input, Autocomplete, Multi Select or Rating either: use the `disabled` option.
- **Sidebar.** Delete `.sidebar-body` and `.sidebar-form` and keep their content. Prefer `.d-sidebar-narrow-none` over `.d-narrow-none` in new markup.

---

## Step 4: Update JavaScript

### Positioning

1. Rename the `popperConfig` option to `floatingConfig` on Tooltip, Popover and Dropdown. It takes a Floating UI `computePosition` config. Rewrite Popper `modifiers` as Floating UI middleware.
2. Read the tip's position after the `shown` event. Positioning is asynchronous.
3. Prefer `placement: 'start'` and `'end'` over `'left'` and `'right'` on Tooltip and Popover. The physical names are deprecated.

### `update(config)` is replaced by setters

Options are fixed once a component starts. Replace `update({ … })` with the setter for the value that changes. A setter fires no change event.

```js
// v5
multiSelect.update({ options })
rating.update({ value: 2 })
autocomplete.update({ disabled: true })
// v6
multiSelect.setOptions(options)
rating.setValue(2)
autocomplete.disable()
```

| Component | Setters |
| --- | --- |
| Autocomplete | `setValue()`, `setOptions()`, `setValidationState()`, `disable()`, `enable()` |
| Multi Select | `setValue()`, `setOptions()`, `setTotal()`, `setValidationState()`, `disable()`, `enable()` |
| Calendar | `setStartDate()`, `setEndDate()`, `setRange()`, `setCalendarDate()`, `setSelectEndDate()` |
| Date Picker | `setDate()`, `setValidationState()` |
| Date Range Picker | `setStartDate()`, `setEndDate()`, `setRange()`, `setValidationState()` |
| Time Picker | `setTime()`, `setValidationState()` |
| OTP Input, Range Slider, Rating | `setValue()`, `setValidationState()`, `disable()`, `enable()` |
| Chip Input | `setValidationState()` |

Any other option change (format, size, labels, icons, `name`, `required`, `readonly`) needs `dispose()` and a new instance.

### Renamed events and payloads

| v5 | v6 |
| --- | --- |
| `changed.coreui.autocomplete` | `change.coreui.autocomplete` |
| `changed.coreui.multi-select` | `change.coreui.multi-select` |
| `event.values` on `change.coreui.chip-set` and `change.coreui.chip-input` | `event.value` |
| `cellHover.coreui.calendar` | removed; listen to `mouseover` or `focusin` and read `data-coreui-date` from the cell |
| `event.dateObject ?? event.date` on picker `dateChange`, `startDateChange`, `endDateChange` | `event.date` (always a `Date` or `null`); the formatted value is `event.formattedDate` |

Change events now fire only when the value changes. Code that relied on an event from `clear()`, `reset()` or a repeated pick of the same value must not expect one.

### Renamed and removed methods

| v5 | v6 |
| --- | --- |
| `chipSet.getSelected()` (returned elements) | `chipSet.getSelectedValues()` |
| `new coreui.OffCanvas(…)` | `new coreui.Offcanvas(…)` (old name kept as alias) |

### Options by component

| Component | v5 | v6 |
| --- | --- | --- |
| Tooltip, Popover, Dropdown | `popperConfig` | `floatingConfig` |
| Collapse | `toggle` | removed; add `.show` to start open, call `show()`, `hide()` or `toggle()` |
| Modal | `focus` | removed; the native dialog always traps focus |
| Toast | `animation` | removed; add `.toast-instant` |
| Carousel | `ride` | `autoplay` (boolean) |
| Carousel | `wrap` | `ends`: `'wrap'` (v5 `wrap: true`), `'stop'` (v5 `wrap: false`) or `'loop'` (default) |
| Carousel | `touch` | removed |
| ScrollSpy | `offset: 100` | `topMargin: '100px'` |
| Autocomplete | `indicator` | `pickerIcon` |
| Autocomplete | `ariaIndicatorLabel` | `ariaPickerLabel` |
| Autocomplete | `search: ['external', 'global']` | `search: 'external'`; typing is global by default, set `globalSearch: false` to turn it off |
| Multi Select | `optionsStyle: 'text'` | `indicator: 'none'` |
| Multi Select | `selectAllStyle`, `optionsGroupsStyle` | removed; `indicator` sets the marker for the whole list |
| Multi Select | `ariaIndicatorLabel` | `ariaPickerLabel` |
| Multi Select | `selectionTypeCounterText: 'item(s) selected'` | `selectedLabel: (count) => \`${count} item(s) selected\`` or the string `'{count} item(s) selected'` |
| Multi Select | `search: 'global'` or `['global']` | `search: true` |
| Calendar, pickers | `selectAdjacementDays`, `showAdjacementDays` | `selectAdjacentDays`, `showAdjacentDays` |
| Date Picker, Date Range Picker, Time Picker | `indicator` | `pickerIcon` (`false`, `true` or an SVG string) |
| Date Picker, Date Range Picker | `inputDateFormat` | `format` |
| Date Picker, Date Range Picker, Time Picker | `placeholder` | per-section `dayPlaceholder`, `monthPlaceholder`, `yearPlaceholder`, `hourPlaceholder`, `minutePlaceholder`, `secondPlaceholder` |
| Date Picker, Date Range Picker, Time Picker | `inputReadOnly`, `inputOnChangeDelay` | removed, no replacement |
| Date Picker, Date Range Picker, Time Picker | `footer`, `todayButton`, `cancelButton`, `confirmButton` and their `*Classes` | `<template data-coreui-template="footer">` (Step 3) |
| Date Range Picker | `ranges`, `rangesButtonsClasses` | `<template data-coreui-template="ranges">` (Step 3) |
| Date Range Picker | `previewDateOnHover`, `separator` | removed; `separatorIcon` and `separatorIconRtl` set the icon |
| Time Picker | `variant` | removed, no replacement |
| Range Slider | `labels`, `clickableLabels` | `ticks`, `clickableTicks` |
| Range Slider | `ariaLabels` | `ariaLabel` (array, comma-separated string, or `(index, total) => string`) |
| Rating | `readOnly` | `readonly` |
| OTP Input | `readonly` | removed; use `disabled` |
| Autocomplete, Multi Select, pickers | `invalid`, `valid` | `validationState: 'invalid'` or `'valid'` (old options are deprecated aliases) |

### Behaviour changes that need code

1. **Time Picker `hours`.** The list is 0 to 23 in every locale. A v5 list written for a 12-hour locale, such as `hours: [1, 3, 5, 7]`, must name both halves: `[1, 3, 5, 7, 13, 15, 17, 19]`.
2. **Calendar cell selectors.** Replace `.calendar-cell[tabindex="0"]` with `.calendar-cell[data-coreui-selectable]`. Day cells write `data-coreui-date` as `date.toDateString()`, so select them with `[data-coreui-date="${date.toDateString()}"]`.
3. **Unnamed fields are not submitted.** Autocomplete, Multi Select, Chip Input and the pickers no longer generate a `name`. Set the `name` option on every one whose value the form must send.
4. **Validation state is read once.** Set it after start with `setValidationState()`, not by adding `.is-invalid` or `aria-invalid` to the element.
5. **Hidden value inputs.** Replace `input[type="hidden"]` selectors: `.chip-input > textarea` for Chip Input, `.form-otp > input:not(.form-otp-control)` for OTP Input.
6. **Loading Button.** `disabledOnLoading` sets `aria-disabled="true"` and `.disabled`, not the `disabled` attribute. Replace `:disabled` checks with `[aria-disabled="true"]`.
7. **Range Slider events.** The inner `changed.coreui.range` is gone. Listen to `input.coreui.range-slider` and `change.coreui.range-slider` on the slider element.
8. **Stepper.** `next()` on the last step now finishes the stepper and fires `finish.coreui.stepper`. `finish()` before the last step does nothing; call `next()` to move forward.
9. **Search Button.** A button added after `DOMContentLoaded` needs `coreui.SearchButton.getOrCreateInstance(element)` before its shortcut works.
10. **Tab.** `new coreui.Tab(el)` outside a tab list throws a `TypeError`. Fix the markup.
11. **Lifecycle promises (optional).** `show()`, `hide()` and `toggle()` on Collapse, Modal, Offcanvas, Popover, Sidebar and Tooltip, `show()` and `hide()` on Toast, `show()` on Tab and `close()` on Alert return a promise. You can replace a one-off `shown`/`hidden` listener with `await`.

---

## Step 5: Move Sass variables and CSS custom properties to tokens

### Rule for removed Sass variables

v6 removed most Sass variables whose only job was to feed a CSS custom property. When `@use … with ()` fails with `This variable was not declared with !default in the @used module`, do this:

1. Strip the `$` and add `--cui-`: `$alert-padding-y` becomes `--cui-alert-padding-y`.
2. Search `node_modules/@coreui/coreui-pro/scss` for that token to find the map that declares it (`$alert-tokens`, `$card-tokens`, `$modal-tokens`, `$button-tokens`, `$sidebar-tokens`, `$root-tokens`, …).
3. Pass the value through that map, or set the custom property at runtime.

```scss
@use "@coreui/coreui-pro/scss/coreui" with (
  $alert-tokens: (
    --cui-alert-padding-y: .75rem,
  ),
  $root-tokens: (
    --cui-body-line-height: 1.6,
    --cui-btn-input-padding-y: .5rem,
  )
);
```

```css
:root { --cui-btn-input-padding-y: .5rem; }
.alert { --cui-alert-padding-y: .75rem; }
```

If no token matches, the variable has no v6 replacement. Delete the line.

### Common Sass variables

| v5 | v6 |
| --- | --- |
| `$grid-breakpoints` | `$breakpoints` (`lg` is `1024px`, `xl` `1280px`, `2xl` `1536px`) |
| `$grid-gutter-width` | `$grid-gutter-x` |
| `$variable-prefix` | `$prefix` |
| `$body-bg`, `$body-color` | `$theme-bgs: ("body": …)`, `$theme-fgs: ("body": …)` |
| `$font-family-sans-serif` | `$root-tokens: (--cui-font-sans-serif: …)` |
| `$font-size-base` | `$root-tokens: (--cui-body-font-size: …)` |
| `$line-height-base` | `$root-tokens: (--cui-body-line-height: …)` |
| `$link-color`, `$link-decoration` | `--cui-link-color`, `--cui-link-decoration` in `$root-tokens` |
| `$border-width`, `$border-color` | `--cui-border-width`, `--cui-border-color` in `$root-tokens` |
| `$border-radius`, `$border-radius-sm`, `$border-radius-lg`, `$border-radius-pill` | `--cui-radius` (whole scale) in `$root-tokens`, or the stops `--cui-radius-4`, `-3`, `-5`, `--cui-radius-pill` |
| `$input-*`, `$input-btn-*`, `$btn-padding-*`, `$btn-font-*`, `$btn-border-radius` | `--cui-btn-input-*` in `$root-tokens` (fields and buttons), or `--cui-btn-*` on `.btn` |
| `$h1-font-size` … `$h6-font-size`, `$font-size-sm`, `$font-size-lg` | `$font-sizes`, keyed `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl` |
| `$font-weight-*` | `$font-weights` |
| `$box-shadow`, `$box-shadow-sm`, `$box-shadow-lg`, `$box-shadow-inset` | `$shadows` |
| `$zindex-*` | `$zindex-levels` |
| `$gray-100` … `$gray-900` (read) | `var(--cui-gray-100)` … `var(--cui-gray-900)` |
| `$secondary`, `$light`, `$dark` | removed; the `"secondary"` and `"inverse"` entries of `$theme-colors` |
| `$theme-colors` (flat `name: color` map) | a map of maps; override a whole entry copied from `scss/_theme.scss` |
| `$theme-colors-rgb`, `$theme-colors-text`, `$utilities-colors` | removed; use `theme-color-refs("fg")` or `map-get-nested($theme-colors, "base")` |
| `$component-active-bg`, `$component-active-color` | removed; set `$primary`, or the component token |
| `$progress-bar-animation-timing` | `--cui-progress-bar-animation` (full shorthand with the keyframes name) |
| `$transition-collapse` | `--cui-transition-collapse-duration` (and `-property`, `-timing`) |
| `$enable-rfs`, `$enable-important-utilities`, `$enable-container-queries`, `$enable-elevations`, `$enable-validation-icons`, `$enable-negative-margins` | removed; delete the line |

`$primary`, `$success`, `$info`, `$warning`, `$danger`, `$gray`, `$spacer`, `$spacers`, `$prefix`, `$enable-shadows`, `$enable-gradients`, `$enable-dark-mode`, `$enable-cssgrid`, `$enable-rtl`, `$enable-ltr`, `$container-max-widths`, `$mobile-breakpoint` and `$sidebar-width` are still Sass variables.

Delete every `$*-dark` variable. `scss/_variables-dark.scss` is gone; each colour is one `light-dark()` value in the light variable.

### Sass mixins and functions

| v5 | v6 |
| --- | --- |
| `button-variant($background, $border, …)` | `button-variant($variant)` reading `$button-variants` |
| `button-outline-variant()`, `button-size()`, `pagination-size()` | removed; add entries to `$button-variants`, `$button-sizes`, `$pagination-sizes` |
| `alert-variant()`, `list-group-item-variant()`, `avatar()`, `elevation()`, `carousel-dark()`, `make-c-grid-columns()` | removed, no replacement |
| `font-size()`, `rfs()` | write `font-size` directly; RFS is removed |
| `add()`, `subtract()` | write `calc()` directly |
| `rgba-css-var()` | `color-mix(in srgb, var(--cui-primary-base) 50%, transparent)` |
| `focus-ring()` | `focus-ring($offset: false, $color: null)`; draws an `outline` |
| `breakpoint-max()` | returns the raw breakpoint (`768px`, not `767.98px`) |

Hard-coded media queries at `992px`, `1200px` or `1400px` no longer match `lg`, `xl` or `2xl`. Use `media-breakpoint-up()` and `media-breakpoint-down()`.

### CSS custom properties

| v5 | v6 |
| --- | --- |
| `--cui-primary` (and every theme colour) | read `--cui-primary-base`; set `--cui-primary-500` to retint |
| `--cui-dark`, `--cui-light` | `--cui-inverse-base`, `--cui-secondary-base` |
| `--cui-{color}-rgb`, `--cui-body-color-rgb`, `--cui-link-color-rgb` | removed; `color-mix(in srgb, var(--cui-primary-base) 50%, transparent)` |
| `--cui-{color}-text-emphasis` | `--cui-{color}-fg-emphasis` |
| `--cui-{color}-border-subtle` | `--cui-{color}-border` |
| `--cui-body-bg`, `--cui-body-color` | `--cui-bg-body`, `--cui-fg-body` (old names deprecated) |
| `--cui-secondary-color`, `--cui-tertiary-color`, `--cui-tertiary-bg` | `--cui-fg-2`, `--cui-fg-3`, `--cui-bg-2` (old names deprecated) |
| `--cui-secondary-bg` (as a surface) | `--cui-bg-4`; `--cui-secondary-bg` is now the `secondary` theme fill |
| `--cui-border-radius`, `-sm`, `-lg`, `-pill` | `--cui-radius-4`, `--cui-radius-3`, `--cui-radius-5`, `--cui-radius-pill`; `--cui-radius` scales all |
| `--cui-font-monospace` | `--cui-font-mono` |
| `--cui-highlight-color`, `--cui-highlight-bg` | `--cui-mark-color`, `--cui-mark-bg`, set on `mark` |
| `--cui-text-opacity`, `--cui-bg-opacity`, `--cui-border-opacity`, `--cui-link-opacity` | removed; use `.fg-{n}`, `.bg-{n}`, `.border-{n}`, `.link-{n}`, or set `--cui-bg` to a translucent colour |
| `--cui-focus-ring-x`, `--cui-focus-ring-y`, `--cui-focus-ring-blur` | removed; `--cui-focus-ring-offset` |
| `--cui-btn-focus-box-shadow`, `--cui-pagination-focus-box-shadow`, `--cui-accordion-btn-focus-box-shadow`, `--cui-btn-focus-shadow-rgb` | removed; set `--cui-focus-ring-color` or `--cui-focus-ring-width` |
| `--cui-form-valid-color`, `--cui-form-valid-border-color`, `--cui-form-invalid-color` | removed; retint the `success` and `danger` theme colours |
| `--cui-form-select-bg-img` | `--cui-control-select-bg-img` |
| `--cui-input-placeholder-color` | `--cui-control-placeholder-color` |
| `--cui-autocomplete-*`, `--cui-date-picker-*`, `--cui-time-picker-*`, `--cui-form-multi-select-*`, `--cui-chip-input-*` frame tokens (padding, font, colour, border) | `--cui-control-*` on the same element (`--cui-control-padding-y`, `--cui-control-bg`, …) |
| `--cui-accordion-btn-*` | `--cui-accordion-header-*` |
| `--cui-accordion-inner-border-radius` | removed; the header follows `--cui-accordion-border-radius` |
| `--cui-avatar-width`, `--cui-avatar-height` | `--cui-avatar-size` |
| `--cui-avatar-status-width`, `--cui-avatar-status-height` | `--cui-avatar-status-size` |
| `--cui-btn-close-bg` | `--cui-btn-close-icon` |
| `--cui-btn-close-filter`, `--cui-btn-close-focus-shadow` | removed; recolour with `--cui-btn-close-color` |
| `--cui-btn-box-shadow` | removed |
| `--cui-alert-border` | `--cui-alert-border-width` and `--cui-alert-border-color` |
| `--cui-modal-padding`, `--cui-modal-header-padding`, `--cui-card-img-overlay-padding`, `--cui-calendar-nav-padding` | `-padding-x` and `-padding-y` pairs |
| `--cui-breadcrumb-margin-bottom`, `--cui-tooltip-margin`, `--cui-spinner-vertical-align` | removed, no replacement |
| `--cui-stepper-step-indicator-active-bg` | removed; set `--cui-stepper-step-indicator-bg` on `.stepper-step-button.active` |
| `--cui-chip-dismiss-size` | `--cui-chip-remove-size` |
| `--cui-range-slider-thumb-*`, `--cui-range-slider-track-*` | `--cui-range-thumb-*`, `--cui-range-track-*`, set on the slider's inner `.form-range` |
| `--cui-range-slider-tooltip-*` | `--cui-tooltip-*` |
| `--cui-time-picker-roll-col-*` | `--cui-time-picker-col-*` |
| `--cui-carousel-control-icon-filter` | `--cui-carousel-control-color` |
| `--cui-tertiary-bg-translucent` | removed; set `--cui-sidebar-nav-link-hover-bg` on `.sidebar-nav` |
| `--cui-mobile-breakpoint` | `--cui-breakpoint-lg` |
| `--cui-sidebar-toggler-focus-shadow`, `--cui-dropdown-inner-border-radius`, `--cui-footer-*` | removed, no replacement |

### Cascade layers

All library CSS is in cascade layers and utilities no longer carry `!important`. Unlayered project CSS now beats every utility. Move overrides that a utility class must still win against into `@layer custom { … }`.

---

## Step 6: Replace removed classes, utilities and helpers

| Removed | Replacement |
| --- | --- |
| `.display-4`, `.display-5`, `.display-6` | `.fs-6xl`, `.fs-5xl`, `.fs-4xl`, plus `.fw-light .lh-1` for the old weight and line height |
| `.display-1`, `.display-2`, `.display-3` | none; set `font-size` yourself |
| `.lead` | `.fs-lg .fw-light` |
| `.footer` | `<footer class="d-flex flex-wrap align-items-center justify-content-between bg-3 border-top px-5 py-3">` |
| `.footer-sticky` | `.sticky-bottom` |
| `.header-sticky` | `.sticky-top` |
| `.progress-group`, `.progress-group-prepend`, `.progress-group-header`, `.progress-group-bars` | `.hstack` / `.vstack` with a `gap-*` class |
| `.progress-thin` | `style="height: 4px"` or `--cui-progress-height` on `.progress` |
| `.card-link` | `<div class="hstack gap-4">` around the links |
| `.card-header-pills` | none; delete it |
| `.btn-close-white` | none; delete it |
| `.sidebar-body`, `.sidebar-form` | none; delete the class |
| `.form-check-reverse` | `order` utilities or `justify-content-between` |
| `.ratio` wrapper | ratio class on the element (Step 3) |
| `.link-{color}` | `.theme-{color}.underline` |
| `.elevation-*` | `.shadow-sm`, `.shadow`, `.shadow-lg` |
| `.bg-{color}-gradient`, `.text-bg-{color}-gradient` | `.bg-{color}.bg-gradient` |
| `.dark:bg-*`, `.dark:text-*` | none; colour utilities follow the colour mode |
| `.collapsed` | `[aria-expanded="false"]` |
| `.carousel-dark` | `data-coreui-theme="dark"` on `.carousel` |
| `.modal-dialog`, `.modal-content`, `.modal-dialog-centered` | `<dialog class="modal">` (Step 3) |
| `.modal-backdrop`, `.offcanvas-backdrop` | the native `::backdrop` |
| `.was-validated`, `.has-validation` | `data-coreui-validate` on the form, `.form-field` (Step 3) |
| `.form-password-action-icon` | none; the plugin renders the icon |
| `.accordion-button`, `.accordion-collapse` | `<details>` and `<summary>` (Step 3) |

---

## Step 7: Verify

1. Build the project. Fix every Sass error with Step 5. An `Undefined variable` or `not declared with !default` error names a removed variable.
2. Search for leftover v5 patterns:

   ```sh
   grep -rnE '@import .*coreui|variables-dark|scss/maps' --include=*.scss .
   grep -rnE '\$(grid-breakpoints|grid-gutter-width|variable-prefix|body-bg|body-color|border-radius|enable-rfs|enable-important-utilities|input-padding|btn-padding|h[1-6]-font-size|light|dark)\b' --include=*.scss .
   grep -rnE '@popperjs|popperConfig|data-popper-placement|\.rtl\.(min\.)?css|themes/bootstrap|bootstrap(\.bundle|\.esm)?(\.min)?\.js|js/src/.*\.js|index\.(esm|umd)\.js' .
   grep -rnE 'data-coreui-toggle="(autocomplete|calendar|date-picker|date-range-picker|time-picker|otp|range-slider|rating|stepper|password)"|data-coreui="navigation"|data-coreui-(ride|wrap|touch|animation|read-only)\b' .
   grep -rnE 'modal-dialog|modal-content|modal-backdrop|offcanvas-backdrop|accordion-button|accordion-collapse|was-validated|needs-validation|has-validation|form-check|form-switch|form-password|btn-close-white' .
   grep -rnE '\b(btn|btn-outline|btn-ghost|alert|callout|chip|list-group-item)-(primary|secondary|success|danger|warning|info|light|dark)\b' .
   grep -rnE '\b[a-z-]+-(xxl)\b|\b[a-z-]+-xxl-[a-z0-9-]+' .
   grep -rnE '\b(mw|mh)-100\b|link-(offset|underline|primary|secondary|success|danger|warning|info|light|dark|body-emphasis)|text-(muted|black-50|white-50|high-emphasis|medium-emphasis|disabled)\b|display-[1-6]|\blead\b|elevation-|-gradient\b|spinner-(border|grow)-sm|progress-(group|thin)|card-link|card-header-pills|(header|footer)-sticky|\bfooter\b|carousel-dark|\bcollapsed\b|chip-dismiss|form-select' .
   grep -rnE '\b(bg|text|border|text-bg|table|focus-ring|shadow)-(light|dark)\b' .
   grep -rnE '\.update\(\{|changed\.coreui\.(autocomplete|multi-select)|getSelected\(\)|cellHover|selectAdjacement|showAdjacement|optionsStyle|selectAllStyle|optionsGroupsStyle|selectionTypeCounterText|ariaIndicatorLabel|inputDateFormat|todayButton|cancelButton|confirmButton|previewDateOnHover|clickableLabels|ariaLabels|readOnly|dateObject' --include=*.js --include=*.ts --include=*.html .
   grep -rnE "\b(ride|wrap|touch|toggle|focus|animation|offset|variant|indicator|labels|placeholder|search)\s*:" --include=*.js --include=*.ts .
   grep -rnE 'var\(--cui-[a-z0-9-]+-rgb\)|--cui-(primary|secondary|success|danger|warning|info|light|dark)\)|-text-emphasis\)|-border-subtle\)|--cui-border-radius|--cui-font-monospace|--cui-highlight-|--cui-(text|bg|border|link)-opacity|focus-box-shadow|--cui-accordion-btn-|--cui-avatar-(width|height)|--cui-btn-close-(bg|filter)|--cui-range-slider-|--cui-(autocomplete|date-picker|time-picker|form-multi-select|chip-input)-' .
   ```

   Review each hit, not every hit is a v5 leftover. Expected matches include `.btn-outline` without a colour, `.icon-xxl`, the deprecated aliases listed in Step 2, and option names in code that does not configure a CoreUI plugin. The option-name `grep` lines are broad on purpose: check each hit against the tables in Step 4.
3. Search the spacing and radius classes changed in Step 2 (`[mp][tbsexy]?-[1-5]`, `gap-[1-5]`, `g[xy]?-[1-5]`, `rounded(-[a-z]+)?-[1-5]`) and confirm each was renamed once, in descending order.
4. Remove `coreui-legacy.css` (or the `coreui-legacy` `@use`) and rebuild. If nothing renders differently, the markup no longer uses v5 spellings.
5. Open the pages in a browser that meets Step 1 and check: modals, offcanvas panels and accordions open and close; pickers, Autocomplete and Multi Select submit their values under the expected `name`; forms with `data-coreui-validate` block an invalid submit.
6. Review visual changes that have no rename: theme colours are retuned, most radii are rounder, a bare `.btn` and a bare `.badge` are neutral, button labels do not wrap, card padding is `1.25rem` (set `--cui-card-spacer-y` and `--cui-card-spacer-x` to `var(--cui-spacer-5)` on `.card` to keep v5), focus rings are outlines, and the `lg`, `xl` and `2xl` breakpoints moved.

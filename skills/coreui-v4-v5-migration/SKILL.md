---
name: coreui-v4-v5-migration
description: Migrate a project from CoreUI PRO for Bootstrap v4 (@coreui/coreui-pro 4.x) to v5.29.2, covering dependencies, Sass, the dark theme, CSS variables, classes, data attributes, markup and JavaScript plugins. Use when upgrading @coreui/coreui-pro from 4.x to 5.x or fixing v4 code that stopped working after the upgrade.
guide: /migration/v5/
---

# CoreUI PRO v4 to v5 Migration

v4 and v5 are both built on Bootstrap 5. The grid, utilities, form controls and the `data-coreui-*` attributes of the Bootstrap components carry over unchanged. The breaking changes sit in four places: color modes replace the separate dark theme, the sidebar is light by default, the Date Picker formats dates differently, and many Sass variables and CSS custom properties of the PRO components were renamed or removed.

Work through the steps in order. After each step, search the codebase for the v4 patterns that step lists before you move on.

## Workflow

- [ ] Step 1: Update dependencies and distributed files
- [ ] Step 2: Update the Sass entry point and variables
- [ ] Step 3: Replace the dark theme with color modes
- [ ] Step 4: Update classes, data attributes and markup
- [ ] Step 5: Update CSS custom properties
- [ ] Step 6: Update JavaScript
- [ ] Step 7: Verify

---

## Step 1: Dependencies and distributed files

1. Set the package version in `package.json`: `"@coreui/coreui-pro": "5.29.2"`.
2. Set the peer dependency `@popperjs/core` to `^2.11.8`. `coreui.bundle.js` and `coreui.bundle.min.js` include Popper; `coreui.js` and `coreui.esm.js` do not.
3. Keep the file names. `dist/css/coreui.min.css`, `coreui.rtl.min.css`, `coreui-grid.css`, `coreui-reboot.css`, `coreui-utilities.css` and `dist/js/coreui.bundle.min.js`, `coreui.esm.js` have the same names in v5.
4. Remove every link to `css/themes/dark.css` or `css/themes/dark.min.css`. v5 does not ship the dark theme stylesheet (see Step 3).
5. Leave the browser targets as they are. v5 supports the same browsers as v4.

---

## Step 2: Sass entry point and variables

1. Keep `@import "@coreui/coreui-pro/scss/coreui";` if the project imports the whole library. It still compiles in v5 and prints Dart Sass deprecation warnings for `@import`.
2. If the project imports parts of the library, add `variables-dark` directly after `variables`:

   ```scss
   @import "@coreui/coreui-pro/scss/functions";
   @import "@coreui/coreui-pro/scss/variables";
   @import "@coreui/coreui-pro/scss/variables-dark";
   @import "@coreui/coreui-pro/scss/maps";
   @import "@coreui/coreui-pro/scss/mixins";
   @import "@coreui/coreui-pro/scss/utilities";
   ```

3. Optionally switch to the module system, which v5.29.2 supports. Variable overrides move into a `with ()` clause, and the `@use` rule must come first in the file. Do this now if the project will move to v6 later, because v6 accepts only `@use`.

   ```scss
   // v4
   $primary-base: #321fdb;
   @import "@coreui/coreui-pro/scss/coreui";

   // v5
   @use "@coreui/coreui-pro/scss/coreui" with (
     $primary: #321fdb
   );
   ```

4. Rename or delete the Sass variables that v5 removed. An `Undefined variable` error names each one.

   | v4 | v5 |
   | --- | --- |
   | `$primary-base`, `$secondary-base`, `$success-base`, `$info-base`, `$warning-base`, `$danger-base`, `$light-base`, `$dark-base` | `$primary`, `$secondary`, `$success`, `$info`, `$warning`, `$danger`, `$light`, `$dark` |
   | `$primary-50`, `$primary-25` (and the same for every theme color) | removed; delete the line |
   | `$text-high-emphasis`, `$text-medium-emphasis`, `$text-disabled` | `$body-color`, `$body-secondary-color`, `$body-tertiary-color` |
   | `$text-high-emphasis-inverse`, `$text-medium-emphasis-inverse`, `$text-disabled-inverse` | removed; delete the line |
   | `$button-variants`, `$button-outline-ghost-variants`, `$alert-variants`, `$list-group-variants` | removed; buttons, alerts and list group items loop over `$theme-colors` |
   | `btn-color-map()`, `btn-outline-color-map()`, `alert-color-map()`, `list-group-color-map()`, `table-color-map()`, `varify()` | removed, no replacement |
   | `$sidebar-light-*` | removed; the sidebar is light by default (Step 4) |
   | `$sidebar-nav-icon-width`, `$sidebar-nav-icon-height`, `$sidebar-nav-icon-font-size` | `$sidebar-nav-link-icon-width`, `$sidebar-nav-link-icon-height`, `$sidebar-nav-link-icon-font-size` |
   | `$sidebar-toggler-indicator-icon`, `$sidebar-toggler-indicator-color`, `$sidebar-toggler-indicator-hover-color`, `$sidebar-toggler-indicator-width` | `$sidebar-toggler-icon`, `$sidebar-toggler-color`, `$sidebar-toggler-hover-color`, `$sidebar-toggler-width` |
   | `$sidebar-header-*`, `$sidebar-footer-*`, `$sidebar-brand-height`, `$sidebar-close-button-*`, `$sidebar-toggler-hover-bg`, `$sidebar-toggler-indicator-hover-icon` | removed, no replacement |
   | `$subheader-*` | removed with the component (Step 4) |
   | `$picker-footer-*` | removed, no replacement |
   | `$header-min-height` | removed, no replacement |

   The sidebar toggler icon is a mask in v5. `$sidebar-toggler-icon` sets the shape and `$sidebar-toggler-color` sets the color, so an SVG with a hard-coded `fill` loses that color.

5. Delete overrides of `$form-multi-select-*`, `$date-picker-*-icon` and `$time-picker-*-icon` variables that the compiler reports as undefined. Their components were rebuilt and use different names. Search `node_modules/@coreui/coreui-pro/scss/_variables.scss` for the component prefix to find the v5 set.
6. `$high-emphasis`, `$medium-emphasis`, `$disabled` and their `-inverse` forms, and `$text-muted`, still exist but are deprecated. Prefer `$body-color`, `$body-secondary-color` and `$body-tertiary-color`.

---

## Step 3: Replace the dark theme with color modes

v4 shipped dark mode as a separate stylesheet (`scss/themes/dark.scss`, `dist/css/themes/dark.css`) scoped to a `.dark-theme` class. v5 builds dark mode into `coreui.css` and switches it with the `data-coreui-theme` attribute.

1. Remove `@import "@coreui/coreui-pro/scss/themes/dark";` and the `themes/dark.css` link.
2. Replace the `.dark-theme` class with `data-coreui-theme="dark"`. Put it on `<html>` for the whole page, or on any element to scope it.

   ```html
   <!-- v4 -->
   <body class="dark-theme">
   <!-- v5 -->
   <html lang="en" data-coreui-theme="dark">
   ```

3. Rename dark theme Sass variables from the `-dt` suffix to the `-dark` suffix when the name exists in `scss/_variables-dark.scss`. Examples: `$primary-dt` to `$primary-dark`, `$body-bg-dt` to `$body-bg-dark`, `$body-color-dt` to `$body-color-dark`, `$border-color-dt` to `$border-color-dark`, `$link-color-dt` to `$link-color-dark`. Delete every `-dt` variable that has no `-dark` counterpart, such as `$card-bg-dt` or `$theme-root-dt`. Components read the global color mode variables instead.
4. Utilities with the `dark:` prefix (`.dark:bg-primary`) keep working. They now apply under `[data-coreui-theme=dark]` instead of `.dark-theme`.
5. To follow the operating system setting instead of an attribute, set `$color-mode-type: media-query` (the default is `data`).
6. Replace component dark variants with the attribute. These classes are deprecated in v5 and still render, so this item is optional:

   | Deprecated in v5 | Replacement |
   | --- | --- |
   | `.btn-close-white` | `data-coreui-theme="dark"` on the close button or a parent |
   | `.dropdown-menu-dark` | `data-coreui-theme="dark"` on the `.dropdown` or a parent |
   | `.navbar-dark` | `data-coreui-theme="dark"` on the `.navbar` or a parent |
   | `.carousel-dark` | `data-coreui-theme="dark"` on the `.carousel` or a parent |

---

## Step 4: Classes, data attributes and markup

### Sidebar

1. Add `.sidebar-dark` to every sidebar that must stay dark. In v4 the sidebar was dark by default; in v5 it uses the page background.
2. Delete `.sidebar-light`. The class no longer exists, and light is the default.
3. `.sidebar-close` lost its styles. Keep `data-coreui-close="sidebar"` on the button and style it yourself, for example with `.btn-close`.
4. `.sidebar-self-hiding`, `.sidebar-self-hiding-{breakpoint}` and `.sidebar-sticky` were removed. Delete them and check the layout.
5. Prefer `data-coreui-navigation` over `data-coreui="navigation"` on `.sidebar-nav`. v5 accepts both.

```html
<!-- v4 -->
<div class="sidebar sidebar-fixed" id="sidebar">
<!-- v5 -->
<div class="sidebar sidebar-dark sidebar-fixed" id="sidebar">
```

### Subheader

The Subheader component is removed. Delete `.subheader`, `.subheader-nav`, `.subheader-text` and `.subheader-sticky`. Move the content into the `.header` below a `<div class="header-divider"></div>`, or into a plain flex container built with utilities.

### Calendar

A standalone `.calendar` element is no longer started automatically. Add `data-coreui-toggle="calendar"` and remove the `.calendar` class from the host. In v5 the plugin adds `.calendars` to the host and renders each month as a `.calendar` panel inside it, so a host that keeps `.calendar` gets the panel styles twice.

```html
<!-- v4 -->
<div class="calendar" data-coreui-locale="en-US"></div>
<!-- v5 -->
<div data-coreui-toggle="calendar" data-coreui-locale="en-US"></div>
```

### Date Picker and Date Range Picker

Delete `data-coreui-format`. The `format` option is removed, and its replacement takes a function, which a data attribute cannot carry. Start the picker from JavaScript instead (Step 6).

### Elevation

`.elevation-6`, `.elevation-8`, `.elevation-9`, `.elevation-12`, `.elevation-16` and `.elevation-24` are removed. v5 has `.elevation-0` to `.elevation-5`. Use `.elevation-5`, or `.shadow-lg`.

### Deprecated text utilities

These still render in v5. Replace them now so the next upgrade has less to do:

| v4 | v5 |
| --- | --- |
| `.text-muted` | `.text-body-secondary` |
| `.text-high-emphasis` | `.text-body` |
| `.text-medium-emphasis` | `.text-body-secondary` |
| `.text-disabled` | `.text-body-tertiary` |

`.text-high-emphasis-inverse`, `.text-medium-emphasis-inverse` and `.text-disabled-inverse` are deprecated with no replacement class. Where they sit on a dark surface, set `data-coreui-theme="dark"` on that surface and use the classes above.

### Progress (optional)

The legacy markup still works. For screen readers, move `role="progressbar"`, `aria-label` and the `aria-value*` attributes from `.progress-bar` to `.progress`. Wrap several bars in `.progress-stacked`, one `.progress` per segment.

```html
<!-- v4 -->
<div class="progress">
  <div class="progress-bar" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
</div>

<!-- v5 -->
<div class="progress" role="progressbar" aria-label="Upload" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-bar" style="width: 25%"></div>
</div>
```

### Custom CSS on picker and Multi Select internals

The plugins build new markup. Rewrite project CSS that targets the v4 internals:

| v4 | v5 |
| --- | --- |
| `.picker` (dropdown wrapper), `.picker .dropdown-menu` | `.date-picker-dropdown`, `.time-picker-dropdown` |
| `.picker-input-group` | `.date-picker-input-group`, `.time-picker-input-group` |
| `.picker-input-group-indicator`, `.date-picker-input-icon`, `.time-picker-input-icon` | `.date-picker-indicator`, `.time-picker-indicator` |
| `.picker-input-group-cleaner`, `.date-picker-cleaner-icon`, `.time-picker-cleaner-icon` | `.date-picker-cleaner`, `.time-picker-cleaner` |
| `.date-picker-arrow-icon` | `.date-picker-separator` |
| `.picker-footer` | `.date-picker-footer`, `.time-picker-footer` |
| `.form-multi-select-selection-cleaner` | `.form-multi-select-cleaner` |

---

## Step 5: CSS custom properties

1. v4 read several custom properties only as fallbacks, so a project could set them on any element. v5 no longer reads them, so setting them has no effect:

   | v4 | v5 |
   | --- | --- |
   | `--cui-input-bg`, `--cui-input-color`, `--cui-input-border-color` | set `$input-bg`, `$input-color`, `$input-border-color` in Sass, or `--cui-body-bg`, `--cui-body-color`, `--cui-border-color` on the control |
   | `--cui-input-focus-bg`, `--cui-input-disabled-bg`, `--cui-input-plaintext-color` | `$input-focus-bg`, `$input-disabled-bg`, `$input-plaintext-color` in Sass |
   | `--cui-form-select-*`, `--cui-form-label-color`, `--cui-form-text-color`, `--cui-form-file-button-*`, `--cui-form-range-*` | the matching `$form-select-*`, `$form-label-color`, `$form-text-color`, `$form-file-button-*`, `$form-range-*` Sass variables |
   | `--cui-subheader-*` | removed with the component |

2. Rename the sidebar properties:

   | v4 | v5 |
   | --- | --- |
   | `--cui-sidebar-nav-icon-width`, `-height`, `-font-size` | `--cui-sidebar-nav-link-icon-width`, `-height`, `-font-size` |
   | `--cui-sidebar-nav-group-indicator`, `--cui-sidebar-nav-group-indicator-hover` | `--cui-sidebar-nav-group-indicator-icon`, `--cui-sidebar-nav-group-indicator-hover-icon` |
   | `--cui-sidebar-toggler-indicator` | `--cui-sidebar-toggler-icon` (a mask; color from `--cui-sidebar-toggler-color`) |
   | `--cui-sidebar-toggler-indicator-width`, `--cui-sidebar-toggler-indicator-height` | `--cui-sidebar-toggler-width`, `--cui-sidebar-toggler-height` |
   | `--cui-sidebar-header-*`, `--cui-sidebar-footer-*`, `--cui-sidebar-brand-height`, `--cui-sidebar-close-button-*`, `--cui-sidebar-border-width`, `--cui-sidebar-border-color`, `--cui-sidebar-toggler-hover-bg` | removed, no replacement |

3. Delete `--cui-btn-close-white-filter` and `--cui-header-min-height`. Both are gone.
4. Delete overrides of `--cui-form-multi-select-*` properties that no longer appear in `dist/css/coreui.css`. Check each name there before you keep it.

---

## Step 6: JavaScript

### Date format

Replace the `format` option of Date Picker and Date Range Picker with `inputDateFormat` and `inputDateParse`. Both take functions. v4 formatted with date-fns patterns internally; in v5 you bring the formatting library.

```js
// v4
const datePicker = new coreui.DatePicker(element, { format: 'MMMM dd, yyyy' })
```

```js
// v5
const datePicker = new coreui.DatePicker(element, {
  locale: 'en-US',
  inputDateFormat: date => dayjs(date).locale('en').format('MMMM DD, YYYY'),
  inputDateParse: value => dayjs(value, 'MMMM DD, YYYY', 'en').toDate()
})
```

The example uses dayjs with its `customParseFormat` plugin. Any function that turns a `Date` into a string and back works.

### Event payloads

`dateChange.coreui.date-picker`, `startDateChange.coreui.date-range-picker` and `endDateChange.coreui.date-range-picker` carry only `event.date`. `event.formatedDate` is gone. Format `event.date` in the handler.

```js
element.addEventListener('dateChange.coreui.date-picker', event => {
  // v4: const text = event.formatedDate
  const text = event.date ? event.date.toLocaleDateString('en-US') : ''
})
```

### Renamed names

| v4 | v5 |
| --- | --- |
| `showN.coreui.multi-select` | `shown.coreui.multi-select` |
| `new coreui.OffCanvas(…)` | `new coreui.Offcanvas(…)` (old name kept as an alias) |
| `.calendar` started on load | `data-coreui-toggle="calendar"` (Step 4) |

Methods, other events and other options of Calendar, Date Picker, Date Range Picker, Time Picker, Multi Select, Loading Button, Sidebar and Navigation keep their v4 names. The jQuery interface is still available.

---

## Step 7: Verify

1. Build the project. Fix every Sass error with Step 2. An `Undefined variable` error names a removed variable.
2. Search for leftover v4 patterns:

   ```sh
   grep -rnE 'themes/dark|dark-theme|\$[a-z0-9-]+-dt\b' .
   grep -rnE '\$(primary|secondary|success|info|warning|danger|light|dark)-(base|50|25)\b|\$text-(high|medium)-emphasis|\$text-disabled|\$(button|alert|list-group)-variants|\$button-outline-ghost-variants|\$sidebar-light-|\$subheader-|\$picker-footer-|\$sidebar-nav-icon-|\$sidebar-toggler-indicator' --include=*.scss .
   grep -rnE 'subheader|sidebar-light|sidebar-close|sidebar-self-hiding|sidebar-sticky|elevation-(6|8|9|12|16|24)\b' .
   grep -rnE 'class="[^"]*\bcalendar\b' .
   grep -rnE 'data-coreui-format|formatedDate|showN\.coreui|OffCanvas|\bformat\s*:' --include=*.js --include=*.ts --include=*.html .
   grep -rnE '\.picker\b|picker-input-group|picker-footer|(date|time)-picker-(input|cleaner|arrow)-icon|form-multi-select-selection-cleaner' --include=*.css --include=*.scss .
   grep -rnE -- '--cui-(input|form-select|form-label|form-text|form-file-button|form-range|subheader|sidebar-nav-icon|sidebar-toggler-indicator|sidebar-header|sidebar-footer|sidebar-brand-height|btn-close-white|header-min-height)' .
   ```

   Review each hit. A `format:` match outside a Date Picker or Date Range Picker config is not a v4 leftover, and `.calendar` inside markup that already has `data-coreui-toggle="calendar"` is fine.
3. Search for deprecated names that still work in v5 and decide whether to replace them now: `text-muted`, `text-high-emphasis`, `text-medium-emphasis`, `text-disabled`, `btn-close-white`, `dropdown-menu-dark`, `navbar-dark`, `carousel-dark`, `data-coreui="navigation"`.
4. Open the pages and check: the sidebar has the intended color scheme, dark mode switches with `data-coreui-theme`, Date Pickers show and accept dates in the expected format, and Multi Select, Calendar and Offcanvas start and fire their events.
5. Review visual changes that have no rename. The theme colors are retuned (`$primary` is `#5856d6`, `$secondary` `#6b7785`, `$success` `#1b9e3e`; `$gray-base` is `#323a49`). Set the v4 values in Sass if the project must keep its look.

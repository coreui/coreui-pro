---
name: coreui-v4-v6-migration
description: Migrate a project from CoreUI PRO for Bootstrap v4 (@coreui/coreui-pro 4.x) to v6 by running the v4 to v5 changes and then the v5 to v6 changes, skipping the work the second hop undoes. Use when upgrading @coreui/coreui-pro from 4.x straight to 6.x or jumping two major versions.
guide: /migration/v6/
---

# CoreUI PRO v4 to v6 Migration

There is no direct v4 to v6 path. Migrate in two hops: v4 to v5 with the `coreui-v4-v5-migration` skill, then v5 to v6 with the `coreui-v5-v6-migration` skill. The v5 to v6 skill assumes v5 names, so the first hop must finish before the second starts.

This skill adds only what is specific to jumping two majors: names that changed twice, where you go straight to the v6 name, and v4 code that v6 removes, where the first hop would have you rename it for nothing.

## Workflow

- [ ] Step 1: Check the browser floor and plan the two hops
- [ ] Step 2: Run the v4 to v5 hop with the two-major overrides
- [ ] Step 3: Hand off to the v5 to v6 skill
- [ ] Step 4: Verify

---

## Step 1: Browser floor and plan

1. Check the browser floor first. v4 and v5 support Chrome 60, Firefox 60, Safari 12 and iOS 12. v6 requires Chrome 123, Edge 123, Firefox 130, Safari 18 and iOS 18. If the project must support older browsers, stop after the first hop and stay on v5.
2. Plan two commits on one branch: one for the v5 hop, one for the v6 hop. When the second hop breaks something, the split shows which wave caused it.
3. Install `@coreui/coreui-pro` `5.29.2` for the first hop. Build and open the pages before you start the second hop. The items that Step 2 tells you to write in v6 form can look wrong in the v5 build; that is expected.

---

## Step 2: v4 to v5 hop, with overrides

Work through every step of the `coreui-v4-v5-migration` skill, with these exceptions.

### Sass

1. Switch to `@use` in this hop. Do not add `@import ".../scss/variables-dark"` to an `@import` stack: v6 accepts only `@use`, and `scss/_variables-dark.scss` does not exist in v6.

   ```scss
   // v4
   $primary-base: #321fdb;
   @import "@coreui/coreui-pro/scss/coreui";

   // after the first hop
   @use "@coreui/coreui-pro/scss/coreui" with (
     $primary: #321fdb
   );
   ```

2. Delete the v4 dark theme variables with the `-dt` suffix. Do not rename them to `-dark`: v6 removes every `$*-dark` variable, and each color takes its dark value from one `light-dark()` pair.
3. Rename the other removed v4 Sass variables as the v4 to v5 skill says, including the sidebar ones. The v5 name is what the token rule in the v5 to v6 skill turns into a v6 custom property (`$sidebar-nav-link-icon-width` becomes `--cui-sidebar-nav-link-icon-width`). The v4 name has no v6 token.

### Classes that changed twice

Write the v6 class directly instead of the v5 one:

| v4 | v5 (skip) | v6 |
| --- | --- | --- |
| `.text-muted` | `.text-body-secondary` | `.fg-2` |
| `.text-high-emphasis` | `.text-body` | `.text-body` |
| `.text-medium-emphasis` | `.text-body-secondary` | `.fg-2` |
| `.text-disabled` | `.text-body-tertiary` | `.fg-3` |
| `.text-high-emphasis-inverse`, `.text-medium-emphasis-inverse`, `.text-disabled-inverse` | deprecated | `data-coreui-theme="dark"` on the dark surface plus `.text-body`, `.fg-2`, `.fg-3`; or the closest fixed value, `.fg-white` with `.fg-90`, `.fg-60`, `.fg-40` |
| `.elevation-0` to `.elevation-24` | `.elevation-0` to `.elevation-5` | `.shadow-none`, `.shadow-sm`, `.shadow`, `.shadow-lg`, picked by depth |
| `.calendar` started on load | `data-coreui-toggle="calendar"` | `data-coreui-calendar` (remove `.calendar` from the host, as in the first hop) |
| `data-coreui="navigation"` | either form | `data-coreui-navigation` |

### Dark variants

1. Delete `.btn-close-white`. Do not convert it to `data-coreui-theme="dark"`: in v6 the close icon follows the text color.
2. Replace `.carousel-dark` with `data-coreui-theme="dark"` on the `.carousel`. This is the same in both hops.
3. Leave `.navbar-dark` and `.dropdown-menu-dark` in place. They are deprecated in v5 but kept in v6.
4. Delete utilities with the `dark:` prefix (`.dark:bg-primary`, `.dark:text-*`). v5 still has them; v6 does not, because color utilities follow the color mode.

### Progress

Leave the v4 progress markup as it is. Do not move `role="progressbar"` to `.progress`: the v6 docs keep it on `.progress-bar`, and both placements render the same.

### Date Picker and Date Range Picker format

1. Keep the `format` option and the `data-coreui-format` attribute. Do not rewrite them as `inputDateFormat` and `inputDateParse` functions: v5 removed `format`, and v6 brings it back as the field mask.
2. In v6 the mask accepts the tokens `dd`, `MM`, `yyyy`, `yy` (and `DD`, `YYYY`, `YY`); other characters become literal separators. A v4 date-fns pattern built from those tokens, such as `dd.MM.yyyy`, works as it is. A pattern with month or weekday names, such as `MMMM dd, yyyy`, has no v6 equivalent: replace it with a numeric mask.

   ```html
   <!-- v4 -->
   <div data-coreui-toggle="date-picker" data-coreui-format="dd.MM.yyyy"></div>
   <!-- v6 -->
   <div data-coreui-date-picker data-coreui-format="dd.MM.yyyy"></div>
   ```

3. Do not rename the v4 `event.formatedDate` to v6 `event.formattedDate`. For day selection, v6 `formattedDate` is the `Date` itself, not a string. Format `event.date` in the handler, as the first hop says.

### Custom CSS on picker and Multi Select internals

Rewrite project CSS that targets the v4 internals straight to the v6 frame, not to the v5 `date-picker-*` and `time-picker-*` names:

| v4 | v6 |
| --- | --- |
| `.picker .dropdown-menu` | `.date-picker-popup`, `.time-picker-popup` |
| `.picker` as the dropdown wrapper | no counterpart; in v6 `.picker` sits on the host element, so a v4 `.picker` rule now styles the whole component |
| `.picker-input-group` | `.form-control-group` |
| `.picker-input-group-indicator`, `.date-picker-input-icon`, `.time-picker-input-icon` | `.form-control-action` |
| `.picker-input-group-cleaner`, `.date-picker-cleaner-icon`, `.time-picker-cleaner-icon`, `.form-multi-select-selection-cleaner` | `.form-control-cleaner` |
| `.form-multi-select`, `.form-multi-select-selection`, `.form-multi-select-search` | `.multi-select`, `.multi-select-selection`, `.multi-select-search` |
| `.form-multi-select-selection-tags` | `.multi-select-selection-chips` |
| `.date-picker-arrow-icon` | `.form-control-icon` |
| `.picker-footer` | `.date-picker-footer`, `.time-picker-footer` |

### Form control custom properties

v4 read `--cui-input-*` and `--cui-form-select-*` as fallbacks. Do not move them to the `$input-*` and `$form-select-*` Sass variables in the first hop: v6 removes those variables. Write the v6 control tokens instead. Set them on the control itself (`.form-control`, `.form-select`), because the control declares its own values. Set `--cui-btn-input-*` on `:root` to change every field and button at once.

| v4 | v6 on the control | v6 page-wide |
| --- | --- | --- |
| `--cui-input-bg`, `--cui-form-select-bg` | `--cui-control-bg` | `--cui-btn-input-bg` |
| `--cui-input-color`, `--cui-form-select-color` | `--cui-control-fg` | `--cui-btn-input-fg` |
| `--cui-input-border-color`, `--cui-form-select-border-color` | `--cui-control-border-color` | `--cui-btn-input-border-color` |
| `--cui-input-focus-bg`, `--cui-input-focus-color` | `--cui-control-focus-bg`, `--cui-control-focus-color` | `--cui-btn-input-focus-bg`, `--cui-btn-input-focus-color` |
| `--cui-input-disabled-bg`, `--cui-form-select-disabled-bg` | `--cui-control-disabled-bg` | none |
| `--cui-input-plaintext-color` | `--cui-control-plaintext-color` | none |

---

## Step 3: Hand off to the v5 to v6 skill

Once the project builds and renders on v5.29.2, commit, then work through every step of the **`coreui-v5-v6-migration`** skill. Its find-and-replace steps assume v5 names, so do not start it while v4 patterns are still present.

Two results of the first hop change again in the second:

- The `.sidebar-dark` class you added keeps its name in v6.
- The Date Picker, Date Range Picker, Time Picker and Calendar data attributes change from `data-coreui-toggle="…"` to bare `data-coreui-date-picker`, `data-coreui-date-range-picker`, `data-coreui-time-picker` and `data-coreui-calendar`. Calendar already has its v6 form from Step 2.

---

## Step 4: Verify

1. Run the Verify step of `coreui-v4-v5-migration` after the first hop and the Verify step of `coreui-v5-v6-migration` after the second.
2. Search for the names this skill told you to skip. Each hit is a v5 name written during the first hop that v6 deprecates or removes:

   ```sh
   grep -rnE 'text-body-(secondary|tertiary)|elevation-[0-9]|btn-close-white|\bdark:|data-coreui-toggle="calendar"|data-coreui="navigation"' .
   grep -rnE 'inputDateFormat|inputDateParse|formattedDate|formatedDate' --include=*.js --include=*.ts --include=*.html .
   grep -rnE '@import .*coreui|variables-dark|\$[a-z0-9-]+-(dt|dark)\b|\$(input|form-select)-' --include=*.scss .
   grep -rnE '\.picker\b|date-picker-(input-group|indicator|cleaner|separator|dropdown)|time-picker-(input-group|indicator|cleaner|dropdown)' --include=*.css --include=*.scss .
   grep -rnE -- '--cui-(input|form-select)-' .
   ```

   `.dark:` hits inside unrelated CSS selectors and `formattedDate` reads that expect a `Date` are fine.
3. Open every Date Picker and Date Range Picker that had a v4 `format` and check the mask and the submitted value.
4. Test on the oldest browser from Step 1. A v6 page below that floor shows wrong colors and broken accordions without any error.

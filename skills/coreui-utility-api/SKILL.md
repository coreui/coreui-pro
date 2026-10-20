---
name: coreui-utility-api
description: Use, extend and customize the CoreUI v6 utility API in a Sass build. Use when adding a custom utility class, changing, renaming, disabling or removing a default utility, generating responsive, hover or print variants, writing a custom-property utility, keeping utilities right-to-left safe, or building and trimming `coreui-utilities.css`.
guide: /utilities/api/
---

# CoreUI v6 utility API

Every utility class CoreUI ships comes from one Sass map, `$utilities`, in `scss/_utilities.scss`. Each entry is a group: the property it sets, the values it accepts, and the variants to generate. `scss/utilities/_api.scss` hands the map to the `generate-utilities-loop()` mixin from `scss/mixins/_utilities.scss` and writes the result into the `utilities` cascade layer. To customize utilities, change the map. Do not write utility CSS by hand.

Package: `@coreui/coreui-pro` `6.0.0-alpha.0`. React (`@coreui/react-pro`) and Vue (`@coreui/vue-pro`) use the same stylesheets from that package. Custom properties use the `--cui-` prefix.

## Workflow

- [ ] Step 1: Choose the one-file or the two-file pattern
- [ ] Step 2: Read a utility definition
- [ ] Step 3: Add a utility
- [ ] Step 4: Modify, rename, disable or remove a default utility
- [ ] Step 5: Generate responsive, state and print variants
- [ ] Step 6: Write custom-property and attribute-selector utilities
- [ ] Step 7: Keep utilities right-to-left safe
- [ ] Step 8: Build the utilities stylesheet
- [ ] Step 9: Trim the generated CSS
- [ ] Verify

---

## Step 1: Choose the one-file or the two-file pattern

`$utilities` is a configurable (`!default`) variable of the `utilities` module. `scss/coreui.scss` and `scss/coreui-utilities.scss` forward that module, so you configure it with `@use … with ()` on the entry point you load. Your map is merged over the defaults. The merge is shallow: a group you supply replaces the whole default group with that key.

1. Use the **one-file pattern** when you only add a group, replace a group completely, or remove a group:

   ```scss
   // styles.scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     $utilities: (
       // your groups
     )
   );
   ```

2. Use the **two-file pattern** when the change has to read a default definition: a new value on an existing group, a renamed class, a variant switched on, `enabled: false`. Sass cannot read a module and configure it in the same file. Put the change in a partial that loads `scss/utilities` with `as *`, then load the partial before CoreUI:

   ```scss
   // _my-utilities.scss
   @use "sass:map";
   @use "@coreui/coreui-pro/scss/utilities" as *;

   $utilities: map.merge(
     $utilities,
     (
       // your changes
     )
   );
   ```

   ```scss
   // styles.scss
   @use "my-utilities";
   @use "@coreui/coreui-pro/scss/coreui";
   ```

3. In the two-file pattern, configure every other CoreUI variable inside the partial, before `scss/utilities`. Loading the partial already loads `scss/config`, so `@use "@coreui/coreui-pro/scss/coreui" with ($enable-rtl: false)` after it fails with `This module was already loaded, so it can't be configured using "with"`.

   ```scss
   // _my-utilities.scss
   @use "sass:map";
   @use "@coreui/coreui-pro/scss/config" with ($enable-rtl: false);
   @use "@coreui/coreui-pro/scss/utilities" as *;
   ```

4. In the one-file pattern, the `with` map cannot read CoreUI Sass members such as `$utilities-spacers` or `$prefix`. Write CSS tokens instead (`var(--cui-spacer-3)`), or load `scss/config` under a namespace first. Configuring `$utilities` afterwards still works, because `$utilities` lives in a different module:

   ```scss
   @use "@coreui/coreui-pro/scss/config" as cfg;
   @use "@coreui/coreui-pro/scss/coreui" with (
     $utilities: (
       "tint": (
         property: (--#{cfg.$prefix}tint: null, background-color: var(--#{cfg.$prefix}tint)),
         class: tint,
         values: (brand: oklch(55% .2 300)),
       ),
     )
   );
   ```

5. In the partial, reassigning `$utilities` inside `@each` or `@if` needs `!global`. Without it the assignment creates a local variable and the change is silently lost:

   ```scss
   @each $key in ("margin-x", "margin-y") {
     $utilities: map.set($utilities, $key, map.merge(map.get($utilities, $key), (responsive: false))) !global;
   }
   ```

---

## Step 2: Read a utility definition

A group needs two keys:

```scss
"overflow": (
  property: overflow,
  values: auto hidden visible scroll,
),
```

These are all the keys the generator accepts:

| Key | Required | Effect |
| --- | --- | --- |
| `property` | Yes | A property name, a space-separated list of names, or a map of declarations (Step 6) |
| `values` | Yes | A list (the class suffix is the value) or a map (keys are suffixes; a `null` key adds no suffix) |
| `class` | No | Class name to use instead of the first property name |
| `child-selector` | No | Style the children instead of the element; the rule is wrapped in `:where()` |
| `selector` | No | `class` (default), `attr-starts` or `attr-includes` (Step 6) |
| `state` | No | Pseudo-classes to generate, for example `hover` or `hover focus` |
| `responsive` | No | `true` generates one class per breakpoint (default `false`) |
| `print` | No | `true` generates `-print` classes inside `@media print` (default `false`) |
| `at-property` | No | `false` keeps the group's custom properties inheriting (default `true`) |
| `enabled` | No | `false` skips the group and keeps its definition (default `true`) |

The generator checks every group:

- A missing `property` or `values` stops the build: ``Utility `…` is missing the required `property` key; keys present: …``.
- A non-boolean `at-property`, `enabled`, `print` or `responsive` stops the build: ``Utility key `responsive` takes a boolean, got `yes`.``
- Any other key prints a warning: ``Unknown utility key `responsiv`. Valid keys are: …``. Keys such as `important`, `dark` or `variables` are not part of the API and only produce this warning.

Utilities carry no `!important`. The `utilities` layer is declared last, so a utility beats every component rule. Your own unlayered CSS still beats every layer. Put project CSS that a utility must override into `@layer custom`.

---

## Step 3: Add a utility

1. Add the group with the one-file pattern. Pass only the new group:

   ```scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     $utilities: (
       "cursor": (
         property: cursor,
         class: cursor,
         responsive: true,
         values: auto pointer grab,
       ),
     )
   );
   ```

   This generates `.cursor-auto`, `.cursor-pointer`, `.cursor-grab`, and `.cursor-sm-pointer` through `.cursor-2xl-pointer`.

2. Choose the value shape for the class names you want:

   ```scss
   // List: the suffix is the value. .cursor-pointer
   values: auto pointer grab,

   // Map: keys are suffixes. .tint-brand
   values: (brand: oklch(55% .2 300), muted: var(--cui-bg-2)),

   // null key: no suffix. .shout
   values: (null: uppercase),
   ```

3. To extend an existing family without copying it, add a new group with the same `class`. New groups are appended after all default groups, so they also win over a default group on the same property:

   ```scss
   "width-extra": (
     property: width,
     class: w,
     values: (10: 10%, 15: 15%),
   ),
   ```

   This adds `.w-10` and `.w-15` next to the default `.w-25` … `.w-100`.

4. To style children, add `child-selector`. The rule has zero specificity, so a child's own margin still wins:

   ```scss
   "stack": (
     property: margin-block-start,
     class: stack,
     child-selector: "> * + *",
     values: (1: .5rem, 2: 1rem),
   ),
   ```

   ```css
   :where(.stack-1 > * + *) { margin-block-start: 0.5rem; }
   ```

---

## Step 4: Modify, rename, disable or remove a default utility

Find the group key in `scss/_utilities.scss` first (`"width"`, `"margin-start"`, `"border"`). The key is not always the class: `"margin-start"` generates `.ms-*`, `"width"` generates `.w-*`.

1. **Replace** a group with the one-file pattern. Include `property` and `values`, or the build stops:

   ```scss
   // Before: fails, the replacement has no property
   "overflow": (responsive: true, values: visible hidden scroll auto),

   // After
   "overflow": (
     property: overflow,
     responsive: true,
     values: visible hidden scroll auto,
   ),
   ```

   A replaced group keeps its original position in the generated CSS.

2. **Remove** a group with the one-file pattern:

   ```scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     $utilities: ("width": null)
   );
   ```

3. **Add a value** to a default group with the two-file pattern:

   ```scss
   // _my-utilities.scss
   @use "sass:map";
   @use "@coreui/coreui-pro/scss/utilities" as *;

   $utilities: map.merge(
     $utilities,
     (
       "width": map.merge(
         map.get($utilities, "width"),
         (values: map.merge(map.get(map.get($utilities, "width"), "values"), (10: 10%))),
       ),
     )
   );
   ```

4. **Rename** a class, **switch on** a variant, or **disable** a group with the same partial. Each entry keeps the rest of the default definition:

   ```scss
   $utilities: map.merge(
     $utilities,
     (
       "margin-start": map.merge(map.get($utilities, "margin-start"), (class: ml)),
       "border": map.merge(map.get($utilities, "border"), (responsive: true)),
       "position": map.merge(map.get($utilities, "position"), (print: true)),
       "font-weight": map.merge(map.get($utilities, "font-weight"), (state: hover)),
       "height": map.merge(map.get($utilities, "height"), (enabled: false)),
     )
   );
   ```

   The rename replaces `.ms-3` and `.ms-md-auto` with `.ml-3` and `.ml-md-auto`. Use `enabled: false` instead of `null` when the definition should stay readable in the map.

---

## Step 5: Generate responsive, state and print variants

CoreUI writes variants into the class name: the breakpoint and `print` as an infix after the class, the state as a suffix after the value. There are no prefix variants such as `md:` or `hover:`.

| Option | Class | Rule in the compiled CSS |
| --- | --- | --- |
| `responsive: true` | `.d-md-none` | `.d-md-none` inside `@media (width >= 768px)` |
| `state: hover` | `.opacity-50-hover` | `.opacity-50-hover:hover` |
| `state: hover focus` | `.opacity-50-focus` | `.opacity-50-focus:focus` |
| `responsive` and `state` | `.opacity-md-50-hover` | `.opacity-md-50-hover:hover` inside the `md` query |
| `print: true` | `.d-print-none` | `.d-print-none` inside `@media print` |
| `print` and `state` | `.opacity-print-50-hover` | `.opacity-print-50-hover:hover` inside `@media print` |
| `null` value key, responsive | `.border-md` | `.border-md` inside the `md` query |

1. The responsive infixes come from `$breakpoints`: `sm` (576px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px). `xs` (0) gets no infix and no media query.
2. A state class is a separate class. It does nothing until the pseudo-class matches. Write the base class and the state class together. With `state: hover` added to the `opacity` group:

   ```html
   <img class="opacity-50 opacity-100-hover" src="…" alt="…">
   ```

3. Default groups with variants: `display` is responsive and print (`.d-md-flex`, `.d-print-none`). Spacing, flex, grid, gap, `float`, `object-fit`, `order` and `text-align` are responsive. `link`, `link-opacity` and the `underline-*` groups have `state: hover` (`.link-opacity-50-hover`).
4. Each variant multiplies the output. A responsive group is written six times. Enable variants per group, not globally.

---

## Step 6: Write custom-property and attribute-selector utilities

1. Give `property` a map to write several declarations in a fixed order. An entry with value `null` receives the utility value. Every other entry is written as declared:

   ```scss
   "tint": (
     property: (
       --cui-tint: null,
       background-color: var(--cui-tint),
     ),
     class: tint,
     values: (brand: oklch(55% .2 300)),
   ),
   ```

   ```css
   .tint-brand {
     --cui-tint: oklch(55% 0.2 300deg);
     background-color: var(--cui-tint);
   }
   ```

2. Every custom property a group assigns is registered once, outside the layer, so it does not leak into descendants:

   ```css
   @property --cui-tint {
     syntax: "*";
     inherits: false;
   }
   ```

3. Set `at-property: false` when descendants must inherit the value, for example a token your components read on nested elements:

   ```scss
   "accent": (
     property: --cui-accent,
     class: accent,
     at-property: false,
     values: (brand: oklch(55% .2 300)),
   ),
   ```

4. Use `selector: attr-includes` (`[class*="…"]`) or `attr-starts` (`[class^="…"]`) when one shared rule serves a whole family. Both need `class`, which is the string they match. Pick a string no other class contains:

   ```scss
   "tiles": (
     property: --cui-tiles,
     class: tiles,
     values: (2: 2, 3: 3),
   ),
   "tiles-attr": (
     property: grid-template-columns,
     class: "tiles-",
     selector: "attr-includes",
     values: repeat(var(--cui-tiles), minmax(0, 1fr)),
   ),
   ```

   ```css
   .tiles-2 { --cui-tiles: 2; }
   [class*=tiles-] { grid-template-columns: repeat(var(--cui-tiles), minmax(0, 1fr)); }
   ```

---

## Step 7: Keep utilities right-to-left safe

One stylesheet serves both directions. There are no `*.rtl.css` files. The page sets `dir="rtl"` and `lang` on `<html>`.

1. Write custom utilities with logical properties and start/end names. They mirror without extra rules:

   | Use | Not |
   | --- | --- |
   | `margin-inline-start` | `margin-left` |
   | `padding-inline` | `padding-left` and `padding-right` |
   | `inset-inline-start` | `left` |
   | `float: inline-start` | `float: left` |
   | `text-align: start` | `text-align: left` |

   ```scss
   "inset-start": (
     property: inset-inline-start,
     class: inset-s,
     values: (0: 0, 50: 50%),
   ),
   ```

2. For a value CSS cannot mirror, such as `transform`, add the override yourself with the `rtl()` mixin. It writes a `:dir(rtl)` rule:

   ```scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     $utilities: (
       "nudge-start": (
         property: transform,
         class: nudge-start,
         values: (1: translateX(-.25rem)),
       ),
     )
   );
   @use "@coreui/coreui-pro/scss/mixins/ltr-rtl" as *;

   @layer utilities {
     .nudge-start-1 {
       @include rtl() {
         transform: translateX(.25rem);
       }
     }
   }
   ```

3. `$enable-rtl: false` removes every `:dir(rtl)` rule, including the `.translate-middle` override. `$enable-ltr: false` with `$enable-rtl: true` writes the mirrored values as the base declarations.

---

## Step 8: Build the utilities stylesheet

1. Pick the entry point:

   | Entry | Contains |
   | --- | --- |
   | `scss/coreui` | Everything, utilities last |
   | `scss/coreui-utilities` | Layer order, `:root` tokens, helpers and utilities (compiles to `coreui-utilities.css`) |
   | `scss/utilities` then `scss/utilities/api` | Only the `@property` rules and the `utilities` layer |

2. Rebuild `coreui-utilities.css` with your changes:

   ```scss
   // utilities.scss
   @use "@coreui/coreui-pro/scss/coreui-utilities" with (
     $utilities: (
       "cursor": (property: cursor, class: cursor, values: auto pointer),
     )
   );
   ```

   With the two-file pattern, load the partial first, then `@use "@coreui/coreui-pro/scss/coreui-utilities";`.

3. For utility classes alone, load `scss/layers` first. Without it, a file loaded before the other CoreUI CSS declares `utilities` as the first layer, and every component then beats the utilities:

   ```scss
   @use "@coreui/coreui-pro/scss/layers";
   @use "@coreui/coreui-pro/scss/utilities" with (
     $utilities: (/* … */)
   );
   @use "@coreui/coreui-pro/scss/utilities/api";
   ```

   This output has no tokens and no helpers. It needs `coreui.css` or `base.css` on the page.

4. React and Vue apps on the default entry import per-component CSS plus `@coreui/coreui-pro/css/coreui-utilities.css`. Replace that import with your compiled `utilities.scss` from item 2:

   ```js
   // Before
   import '@coreui/coreui-pro/css/coreui-utilities.css'
   // After
   import './utilities.scss'
   ```

   Apps on `@coreui/react-pro/unstyled` or `@coreui/vue-pro/unstyled` that compile `scss/coreui` configure `$utilities` in that same `@use … with ()`. Do not also import `coreui-utilities.css`.

5. To emit a separate map, for example with your own breakpoints, call the mixins yourself:

   ```scss
   @use "@coreui/coreui-pro/scss/coreui";
   @use "@coreui/coreui-pro/scss/mixins/utilities" as *;

   $app-utilities: (
     "cursor": (property: cursor, class: cursor, responsive: true, values: auto pointer),
   );

   @include generate-utility-at-properties($app-utilities);

   @layer utilities {
     @include generate-utilities-loop($app-utilities, (xs: 0, tablet: 800px, desktop: 1200px));
   }
   ```

   This generates `.cursor-tablet-pointer` inside `@media (width >= 800px)`.

---

## Step 9: Trim the generated CSS

Utilities are the largest part of the stylesheet. Cut them in the map, not with a later purge step.

1. Remove groups you do not use with `null`.
2. Switch off `responsive` on groups you use at one size only. Each responsive group is written six times.
3. Narrow `values` maps instead of removing a whole group when you need a few steps.
4. Use the `scss/coreui-utilities` entry, or the utilities-only build from Step 8, when the components come from somewhere else.

```scss
// _trim.scss
@use "sass:map";
@use "@coreui/coreui-pro/scss/utilities" as *;

$utilities: map.merge(
  $utilities,
  (
    "space-x": null,
    "space-y": null,
    "divide-x": null,
    "divide-y": null,
  )
);

@each $key in ("margin-x", "margin-y", "padding-x", "padding-y") {
  $utilities: map.set($utilities, $key, map.merge(map.get($utilities, $key), (responsive: false))) !global;
}
```

Compare the gzip size of the minified output before and after each cut.

---

## Verify

1. Compile and read the Sass output. An `Unknown utility key` warning means an option was misspelled and ignored.
2. Grep your compiled CSS file for each class you expect, with its variants:

   ```sh
   grep -E '\.cursor-pointer|\.cursor-md-pointer|\.opacity-50-hover:hover|\.d-print-none' styles.css
   ```

3. Grep for each class you removed or renamed (`\.w-25 `, `\.ms-3 `). It must be absent.
4. For a partial that uses `@each`, confirm the change reached the output. A missing `!global` leaves the defaults in place without an error.
5. Check that new custom properties appear as `@property --cui-…` rules at the top of the file, unless the group sets `at-property: false`.
6. Check that the file starts with `@layer colors, config, root, reboot, layout, content, forms, components, custom, helpers, utilities;`, or that a stylesheet loaded before it does.
7. In the browser, set `dir="rtl"` on `<html>` and confirm start/end utilities flip.

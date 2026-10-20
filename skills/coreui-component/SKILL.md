---
name: coreui-component
description: Build your own component's CSS and markup on top of CoreUI v6 with a token map, theme slots, variants, sizes, states and the right cascade layer. Use when adding a custom component, variant or size class in a project that uses @coreui/coreui-pro, @coreui/react-pro or @coreui/vue-pro, or when a custom component ignores `.theme-*` classes, utilities or RTL.
guide: /customize/components/
---

# CoreUI v6 custom component

Build a component of your own that behaves like a CoreUI component: tokens on its selector, theme support through `.theme-*` classes, utilities that still win, and RTL without extra rules. The CSS is the same for vanilla, React and Vue projects. The Sass source ships in `@coreui/coreui-pro` (version `6.0.0-alpha.0`).

This skill builds the CSS and markup only. To retune an existing CoreUI component, set its tokens (`--cui-alert-bg`) or its `$alert-tokens` map instead. For theme colors and color modes, see the `coreui-theme-colors` skill. For installing CoreUI and compiling its Sass, see the `coreui-v6-install` skill.

The examples build a `.tile` component with the token prefix `--app-tile-`.

## Workflow

- [ ] Step 1: Plan the name and the token prefix
- [ ] Step 2: Set up the partial and the load order
- [ ] Step 3: Declare the token map
- [ ] Step 4: Write the base class in the `custom` layer
- [ ] Step 5: Read the theme slots at the property
- [ ] Step 6: Add variants
- [ ] Step 7: Add sizes
- [ ] Step 8: Add states and the focus ring
- [ ] Step 9: Keep it RTL-safe
- [ ] Step 10: Write the markup
- [ ] Step 11: Verify

---

## Step 1: Plan the name and the token prefix

1. Pick a singular, kebab-case name. It sets the partial `_tile.scss`, the base class `.tile`, the token prefix `--app-tile-*` and the maps `$tile-tokens`, `$tile-variants`, `$tile-sizes`.
2. Check that CoreUI does not already use the class. `dist/css/components/classes.json` in the package maps every CoreUI class to its component:

   ```sh
   grep '"tile' node_modules/@coreui/coreui-pro/dist/css/components/classes.json
   ```

3. Use a token prefix of your own, such as `--app-`. The `--cui-` prefix belongs to CoreUI.
4. Read CoreUI tokens with the `--cui-` prefix. The examples write it literally. If your Sass build sets `$prefix`, load `@coreui/coreui-pro/scss/config` and write `var(--#{$prefix}theme-bg)` instead.

---

## Step 2: Set up the partial and the load order

1. Create `scss/_tile.scss`. Load only the functions and mixins you need. These modules emit no CSS:

   ```scss
   @use "@coreui/coreui-pro/scss/functions/defaults" as *;
   @use "@coreui/coreui-pro/scss/mixins/border-radius" as *;
   @use "@coreui/coreui-pro/scss/mixins/focus-ring" as *;
   @use "@coreui/coreui-pro/scss/mixins/ltr-rtl" as *;
   @use "@coreui/coreui-pro/scss/mixins/tokens" as *;
   @use "@coreui/coreui-pro/scss/mixins/transition" as *;

   @layer colors, config, root, reboot, layout, content, forms, components, custom, helpers, utilities;
   ```

2. Keep the `@layer` statement after the `@use` lines. It repeats CoreUI's layer order. Without it, a stylesheet that loads before CoreUI's CSS registers `custom` as the first layer, and every CoreUI rule beats your component. Reboot's link color then wins over the color of `a.tile`. Repeating the statement is harmless when CoreUI's CSS loads first.
3. If you compile CoreUI from Sass, load CoreUI first and your partial second. Sass configures a module only on its first load, so the reverse order fails with `This module was already loaded, so it can't be configured using "with"`.

   ```scss
   // styles.scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     $enable-rounded: true
   );
   @use "tile";
   ```

4. If you use the precompiled CSS (`coreui.css`, or the per-component CSS that React and Vue import), compile `tile.scss` on its own and load it as a separate stylesheet. The `@layer` statement from step 1 keeps the order correct in any load order.
5. Use `@use`, never `@import`. CoreUI v6 modules do not resolve through `@import`.

---

## Step 3: Declare the token map

1. Declare an empty map with `!default`, then fill it through `defaults()`:

   ```scss
   $tile-tokens: () !default;
   $tile-tokens: defaults(
     (
       --app-tile-gap: var(--cui-spacer-3),
       --app-tile-padding-x: var(--cui-spacer),
       --app-tile-padding-y: var(--cui-spacer-3),
       --app-tile-font-size: var(--cui-body-font-size),
       --app-tile-icon-size: calc(var(--app-tile-font-size) * 1.5),
       --app-tile-color: inherit,
       --app-tile-bg: var(--cui-bg-1),
       --app-tile-hover-bg: var(--cui-bg-2),
       --app-tile-active-color: var(--cui-fg-body),
       --app-tile-active-bg: var(--cui-bg-3),
       --app-tile-border-width: var(--cui-border-width),
       --app-tile-border-color: var(--cui-border-color),
       --app-tile-border-radius: var(--cui-radius-5),
       --app-tile-disabled-opacity: var(--cui-btn-input-disabled-opacity),
     ),
     $tile-tokens
   );
   ```

2. `defaults()` merges overrides on top of the defaults and drops every key set to `null`. The `!default` line lets the entry file pass partial overrides:

   ```scss
   @use "tile" with (
     $tile-tokens: (
       --app-tile-border-radius: var(--cui-radius-7),
     )
   );
   ```

3. Build values from CoreUI's global tokens, so the component follows the rest of the page:

   | Need | Tokens |
   | --- | --- |
   | Spacing | `--cui-spacer`, `--cui-spacer-0` to `--cui-spacer-12` |
   | Radius | `--cui-radius-0` to `--cui-radius-9`, `--cui-radius-pill` |
   | Surfaces | `--cui-bg-body`, `--cui-bg-1` to `--cui-bg-4` |
   | Text | `--cui-fg-body`, `--cui-fg-1` to `--cui-fg-4` |
   | Borders | `--cui-border-width`, `--cui-border-color`, `--cui-border-subtle`, `--cui-border-muted`, `--cui-border-emphasized` |
   | Type | `--cui-body-font-size`, `--cui-font-weight-normal`, `--cui-font-weight-medium`, `--cui-font-weight-semibold`, `--cui-font-weight-bold` |

4. Put only theme-neutral defaults in the map. Theme slots are read at the property (Step 5).
5. Compute derived values in the browser with `calc(var(...))`. Sass arithmetic freezes the result at build time, and a runtime override of the source token no longer reaches it:

   ```scss
   // Before: frozen at build time
   --app-tile-icon-size: $tile-font-size * 1.5,

   // After: follows --app-tile-font-size, also under .tile-lg
   --app-tile-icon-size: calc(var(--app-tile-font-size) * 1.5),
   ```

6. Use `color-mix()` or relative `oklch()` for color shifts. The Sass color functions cannot read a `var()`.

---

## Step 4: Write the base class in the `custom` layer

1. Emit the tokens on the component selector with `tokens()`, then the declarations:

   ```scss
   @layer custom {
     .tile {
       @include tokens($tile-tokens);

       display: flex;
       gap: var(--app-tile-gap);
       align-items: center;
       padding-block: var(--app-tile-padding-y);
       padding-inline: var(--app-tile-padding-x);
       font-size: var(--app-tile-font-size);
       color: var(--cui-theme-fg-emphasis, var(--app-tile-color));
       text-decoration: none;
       background-color: var(--cui-theme-bg-subtle, var(--app-tile-bg));
       border: var(--app-tile-border-width) solid var(--cui-theme-border, var(--app-tile-border-color));
       @include border-radius(var(--app-tile-border-radius));
       @include transition(background-color .15s ease-in-out, border-color .15s ease-in-out);
     }
   }
   ```

2. Declare the tokens on `.tile`, never on `:root`. A custom property resolves where it is declared. `--app-tile-icon-size` follows `.tile-lg` only because both declarations land on the same element. On `:root` it would compute once from the root font size.
3. Read the tokens in the declarations. Do not read the Sass map in a rule.
4. Pick the layer by what must win:

   | Where | Effect |
   | --- | --- |
   | `@layer custom` | Beats CoreUI components, loses to helpers and utilities. Use this. |
   | `@layer components` | Same layer as CoreUI components. Conflicts are settled by specificity and source order. |
   | No layer | Beats every CoreUI layer, utilities included. `.p-0` or `.text-center` on the element stops working. |

5. Use `border-radius()` and `transition()` instead of the raw properties. `border-radius()` honors `$enable-rounded`. `transition()` honors `$enable-transitions` and wraps the declaration in `@media (prefers-reduced-motion: no-preference)`.

---

## Step 5: Read the theme slots at the property

1. Read the `--cui-theme-*` slot first and your own token as the fallback, in the declaration:

   ```scss
   // Before: the slot hides in the token
   --app-tile-bg: var(--cui-theme-bg-subtle, var(--cui-bg-1)),
   background-color: var(--app-tile-bg);

   // After: the token holds the neutral value, the property reads the slot
   --app-tile-bg: var(--cui-bg-1),
   background-color: var(--cui-theme-bg-subtle, var(--app-tile-bg));
   ```

2. The result:
   - Without a theme class, the slot is unset and the token applies.
   - With `.theme-danger` on the tile, on an ancestor, or on a part, the theme wins.
   - A page-wide token override (`.tile { --app-tile-bg: … }`) does not switch themes off.
   - To recolor one themed element, set the slot: `style="--cui-theme-bg-subtle: #fde2e4"`.
   - `.theme-reset` on a subtree clears the inherited slots and brings back the tokens.
3. Pair the slots as CoreUI does. Each foreground is tuned against one background:

   | Background | Foreground | Use |
   | --- | --- | --- |
   | `--cui-theme-bg` | `--cui-theme-contrast` | Solid, active, checked |
   | `--cui-theme-bg-subtle` | `--cui-theme-fg` or `--cui-theme-fg-emphasis` | Tinted panel |
   | `--cui-theme-bg-muted` | `--cui-theme-fg-emphasis` | Heavier panel, hover |
   | `--cui-theme-border` | | Border on `bg-subtle` or `bg-muted` |
   | `--cui-theme-focus-ring` | | Focus outline (Step 8) |

   `--cui-theme-hover` and `--cui-theme-active` hold the solid color shifted for hover and pressed states.
4. Do not hardcode a palette color such as `var(--cui-danger-500)` for themeable parts. A theme class cannot change it.
5. The surface tokens (`--cui-bg-*`, `--cui-fg-*`, `--cui-border-*`) and every slot already switch with the color mode. For a literal color of your own, write a `light-dark()` pair.

---

## Step 6: Add variants

1. Declare the variants as a map from CSS property to slot name:

   ```scss
   $tile-variants: () !default;
   $tile-variants: defaults(
     (
       "solid": ("color": "contrast", "bg": "bg", "border-color": "bg"),
       "outline": ("color": "fg", "bg": "transparent", "border-color": "border"),
     ),
     $tile-variants
   );
   ```

2. Loop over the map. Point each token at its slot, then re-declare each property with a plain read of the token:

   ```scss
   @layer custom {
     @each $variant, $properties in $tile-variants {
       .tile-#{$variant} {
         @each $property, $value in $properties {
           @if $value == "transparent" {
             --app-tile-#{$property}: transparent;
           } @else {
             --app-tile-#{$property}: var(--cui-theme-#{$value});
           }
         }

         @each $property, $value in $properties {
           @if $property == "bg" {
             background-color: var(--app-tile-bg);
           } @else {
             #{$property}: var(--app-tile-#{$property});
           }
         }
       }
     }
   }
   ```

3. Keep the second loop. Without it, the base rule still reads `--cui-theme-bg-subtle` first, and `.tile-solid` collapses into the subtle color.
4. Re-declare only the properties the variant sets. A property you re-declare without mapping it loses the theme.
5. Use a slot variant together with a `.theme-*` class on the element or an ancestor. Without a theme, the slot is unset and `.tile-solid` renders a transparent background.
6. On a variant, the component token wins over the theme, because the property reads the token. Set `--app-tile-bg` on a `.tile-solid` to recolor it.
7. Add or remove a variant from the entry file: `@use "tile" with ($tile-variants: ("outline": null))`.

---

## Step 7: Add sizes

1. Declare sizes as a list. `defaults()` turns it into a map:

   ```scss
   $tile-sizes: () !default;
   $tile-sizes: defaults(("sm", "lg"), $tile-sizes);
   ```

2. Point the size class at CoreUI's shared control scale, so a small tile matches a small button and a small input:

   ```scss
   @layer custom {
     @each $size, $_ in $tile-sizes {
       .tile-#{$size} {
         --app-tile-gap: var(--cui-btn-input-#{$size}-gap);
         --app-tile-padding-x: var(--cui-btn-input-#{$size}-padding-x);
         --app-tile-padding-y: var(--cui-btn-input-#{$size}-padding-y);
         --app-tile-font-size: var(--cui-btn-input-#{$size}-font-size);
         --app-tile-border-radius: var(--cui-btn-input-#{$size}-border-radius);
       }
     }
   }
   ```

3. The scale exists for `xs`, `sm` and `lg`, each with `gap`, `padding-x`, `padding-y`, `font-size`, `line-height`, `min-height` and `border-radius`. A size outside this list needs its own token values.
4. A size class overrides tokens only. It does not repeat declarations.
5. Remove a size from the entry file: `@use "tile" with ($tile-sizes: ("sm": null))`.

---

## Step 8: Add states and the focus ring

1. Nest the states inside `.tile`. Each state reads a slot first and a state token as the fallback:

   ```scss
   &:hover {
     background-color: var(--cui-theme-bg-muted, var(--app-tile-hover-bg));
   }

   &:focus-visible {
     @include focus-ring(true);
   }

   &.active,
   &[aria-current="page"] {
     color: var(--cui-theme-contrast, var(--app-tile-active-color));
     background-color: var(--cui-theme-bg, var(--app-tile-active-bg));
   }

   &.disabled,
   &:disabled,
   &[aria-disabled="true"] {
     pointer-events: none;
     opacity: var(--app-tile-disabled-opacity);
   }
   ```

2. Draw focus with the `focus-ring()` mixin on `:focus-visible`. It writes `outline: var(--cui-focus-ring-width) solid var(--cui-theme-focus-ring, var(--cui-focus-ring-color))`, so the ring takes the theme color. The first argument `true` adds `outline-offset: var(--cui-focus-ring-offset)`.
3. Do not remove the outline with `outline: 0` unless the state draws another visible focus indicator.
4. A state that must beat the theme, such as validation, sets its token and re-declares the property, like a variant. Pass the state color to `focus-ring()`:

   ```scss
   &.is-invalid {
     --app-tile-border-color: var(--cui-danger-border);

     border-color: var(--app-tile-border-color);

     &:focus-visible {
       @include focus-ring(true, var(--cui-danger-focus-ring));
     }
   }
   ```

   An invalid tile inside a `.theme-success` container then keeps the danger border.

---

## Step 9: Keep it RTL-safe

CoreUI v6 ships one stylesheet for both directions. `dir="rtl"` on `<html>` switches it. Your component must use logical properties to follow.

1. Replace physical properties:

   | Physical | Logical |
   | --- | --- |
   | `padding-left` / `padding-right` | `padding-inline-start` / `padding-inline-end` |
   | `padding-top` and `padding-bottom` | `padding-block` |
   | `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` |
   | `left` / `right` | `inset-inline-start` / `inset-inline-end` |
   | `border-left` / `border-right` | `border-inline-start` / `border-inline-end` |
   | `text-align: left` / `right` | `text-align: start` / `end` |
   | `width` / `height` (for icon boxes) | `inline-size` / `block-size` |

2. For what CSS cannot mirror (`transform`, `scale`, `translate`, `background-position`), add the RTL value with the `rtl()` mixin. It emits a `:dir(rtl)` rule:

   ```scss
   .tile-arrow {
     margin-inline-start: auto;

     @include rtl() {
       scale: -1 1;
     }
   }
   ```

---

## Step 10: Write the markup

1. Start from the semantic element: `<a>` for navigation, `<button type="button">` for an action, `<div>` for static content.
2. Compose classes: base, then variant, size and theme:

   ```html
   <a class="tile" href="/reports">Reports</a>
   <a class="tile theme-danger" href="/alerts">Alerts</a>
   <a class="tile tile-solid tile-lg theme-primary" href="/new" aria-current="page">New</a>
   <div class="theme-success">
     <a class="tile tile-outline" href="/done">Done</a>
   </div>
   ```

3. For a disabled link, set `aria-disabled="true"`, remove `href` and remove it from the tab order with `tabindex="-1"`. For a button, use the `disabled` attribute.
4. Give an icon-only tile an accessible name with `aria-label` or `.visually-hidden` text.
5. Do not signal a state through color alone. Pair it with text, an icon or an ARIA attribute.
6. In React and Vue, put the same classes on your elements (`className` in JSX, `class` in Vue templates).

---

## Step 11: Verify

1. Compile and check the output:
   - The first `@layer` statement in your CSS is `@layer colors, config, root, reboot, layout, content, forms, components, custom, helpers, utilities;`, before any `@layer custom {`.
   - `.tile {` sits inside `@layer custom {`.
   - The `.tile-solid` rule sets both `--app-tile-bg:` and `background-color: var(--app-tile-bg)`.
2. Grep your source for mistakes. Each command should print nothing:

   ```sh
   grep -n ':root' scss/_tile.scss                                   # tokens must not sit on :root
   grep -nE -- '--app-[a-z-]+: var\(--cui-theme' scss/_tile.scss     # a slot inside a token map value
   grep -nE '(margin|padding|border)-(left|right)|(^|[^-])(left|right):|text-align: (left|right)' scss/_tile.scss
   grep -nE '\$[a-z-]+ *[*/+-] ' scss/_tile.scss                      # Sass arithmetic on a value
   grep -nE '^@import' scss/*.scss
   ```

3. Check in the browser with `getComputedStyle()`:
   - An unthemed tile, a tile with `.theme-danger`, and a tile inside a `.theme-success` container have different background colors.
   - A tile with `.theme-reset` inside a themed container matches the unthemed tile.
   - `.tile.p-0` has `padding-inline-start: 0px`. If not, the component is unlayered.
   - `a.tile` does not take the link color. If it does, the layer statement is missing.
   - `.tile-solid` without a theme class is transparent, as designed. Add a theme class in your markup.
   - Under `dir="rtl"`, start and end spacing swap and mirrored parts flip.
   - Under `data-coreui-theme="dark"` on `<html>`, the surfaces switch.
4. Press Tab to reach a tile. The outline is visible and takes the theme color.
5. With reduced motion enabled in the OS, the tile has no transition.

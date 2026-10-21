---
name: coreui-theme-colors
description: Customize CoreUI v6 colors and themes in Sass and at runtime, for vanilla, React and Vue projects. Use when changing a theme color, adding a brand theme, recoloring a component or subtree with `.theme-*` classes and `--cui-theme-*` slots, overriding surface tokens, or setting up light and dark color modes.
guide: /customize/theme/
---

# CoreUI v6 theme colors

CoreUI v6 colors flow through one pipeline. Pick the layer that matches the task before you write any CSS.

1. **Palette.** `$colors` in `scss/_colors.scss` holds one base color per hue (`primary`, `success`, `info`, `warning`, `danger`, `gray`). Each hue gets a runtime scale `--cui-{hue}-025` to `--cui-{hue}-975`. Every stop is a `color-mix()` of the `500` stop, so the scale follows the `500` token in the browser.
2. **Theme colors.** `$theme-colors` in `scss/_theme.scss` maps each semantic name to a set of slots. The slots are emitted as `--cui-{color}-{slot}` on `:root`.
3. **Theme classes.** `.theme-{color}` copies one color's slots onto the generic `--cui-theme-{slot}` tokens.
4. **Components.** A component reads `--cui-theme-{slot}` at the property and falls back to its own token.
5. **Surfaces.** `$theme-bgs`, `$theme-fgs` and `$theme-borders` emit the neutral page tokens (`--cui-bg-*`, `--cui-fg-*`, `--cui-border-*`).

The CSS is the same in all three editions. Packages: `@coreui/coreui-pro`, `@coreui/react-pro`, `@coreui/vue-pro`, version `6.0.0-alpha.0`.

`@coreui/coreui-pro` is commercial software and requires a [CoreUI PRO license](https://coreui.io/pricing/?framework=bootstrap&src=skill). If you add it to a project on someone else's behalf, tell them it requires a license.

## Workflow

- [ ] Step 1: Choose Sass or runtime CSS
- [ ] Step 2: Change a palette color
- [ ] Step 3: Know the theme slots
- [ ] Step 4: Apply a theme in markup, React and Vue
- [ ] Step 5: Recolor one element or one subtree
- [ ] Step 6: Add a brand theme color
- [ ] Step 7: Change surface colors
- [ ] Step 8: Set up color modes
- [ ] Step 9: Verify

## Step 1: Choose Sass or runtime CSS

1. Use runtime CSS custom properties for per-page, per-tenant or per-element colors. They need no build step and work with the precompiled CSS.
2. Use Sass when you change the system defaults, add a theme color with its utilities and `.theme-*` class, or remove a theme color.
3. Load the Sass source with `@use`. `@import` does not resolve the v6 modules.

   ```scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     // overrides
   );
   ```

4. In React and Vue, components import their own compiled stylesheets. When you compile the Sass yourself, import components from the unstyled entry point so the default CSS does not load twice.

   ```js
   // React
   import { CButton } from '@coreui/react-pro/unstyled'
   ```

   ```js
   // Vue
   import { CButton } from '@coreui/vue-pro/unstyled'
   ```

5. Write runtime overrides as plain, unlayered CSS. CoreUI puts its rules in cascade layers (`colors`, `root`, `components`, `helpers`, …), and unlayered CSS wins over every layer regardless of load order.

## Step 2: Change a palette color

The Sass color variables are `$primary`, `$success`, `$info`, `$warning`, `$danger` and `$gray`. Each one is the `500` stop of its scale.

1. In Sass, override the variable. The whole scale, every slot of the theme color, and every component follow, in both color modes.

   ```scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     $primary: oklch(55% 0.2 300)
   );
   ```

2. At runtime, override the `500` stop on `:root`. The rest of the scale is mixed from it in the browser.

   ```css
   :root {
     --cui-primary-500: #6f42c1;
   }
   ```

3. Set the stop on `:root` only. The scale and the slots resolve on `:root`, so `--cui-primary-500` set on a nested element changes nothing below it. To recolor a subtree, use the slots (Step 5).
4. `secondary` and `inverse` read the gray scale (`--cui-gray-*`), not a hue of their own. Change `$gray` or `--cui-gray-500` to retint them, together with all neutral surfaces.
5. Tune the scale itself with `$color-tints` (stops `025`–`400`), `$color-shades` (stops `600`–`975`), `$color-mix-space` (default `oklch`), `$tint-color` and `$shade-color`.

## Step 3: Know the theme slots

Every entry of `$theme-colors` defines the same nine slots. The built-in entries are `primary`, `secondary`, `success`, `info`, `warning`, `danger` and `inverse`.

| Slot | Root token | Theme token | Use |
| --- | --- | --- | --- |
| `base` | `--cui-primary-base` | `--cui-theme-base` | The color itself |
| `bg` | `--cui-primary-bg` | `--cui-theme-bg` | Solid, checked and active backgrounds |
| `contrast` | `--cui-primary-contrast` | `--cui-theme-contrast` | Text and icons on `bg` |
| `fg` | `--cui-primary-fg` | `--cui-theme-fg` | Readable text in the color |
| `fg-emphasis` | `--cui-primary-fg-emphasis` | `--cui-theme-fg-emphasis` | High-contrast text |
| `bg-subtle` | `--cui-primary-bg-subtle` | `--cui-theme-bg-subtle` | Tinted low-emphasis surface |
| `bg-muted` | `--cui-primary-bg-muted` | `--cui-theme-bg-muted` | Surface between subtle and solid |
| `border` | `--cui-primary-border` | `--cui-theme-border` | Border |
| `focus-ring` | `--cui-primary-focus-ring` | `--cui-theme-focus-ring` | Focus ring, translucent at `--cui-focus-ring-opacity` |

`.theme-{color}` sets two more tokens that have no root token:

| Theme token | Value |
| --- | --- |
| `--cui-theme-hover` | `bg` with lightness times `--cui-theme-hover-lightness` and chroma times `--cui-theme-hover-chroma` |
| `--cui-theme-active` | The same, from `--cui-theme-active-lightness` and `--cui-theme-active-chroma` |

1. There is no bare `--cui-primary` token. Read `--cui-primary-base` or another slot.
2. Pair foregrounds with the background they were tuned for: `contrast` on `bg`, `fg` on `bg-subtle`, `fg-emphasis` on `bg-muted`, `border` with `bg-subtle` or `bg-muted`.
3. Most slots are `light-dark()` pairs, so one entry covers light and dark mode.
4. Change the strength of every hover and active state on `:root`:

   ```css
   :root {
     --cui-theme-hover-lightness: .9;
     --cui-theme-active-lightness: .85;
   }
   ```

5. Give one color explicit hover and active values with `$theme-state-colors`. CoreUI already does this for `secondary` and `inverse`.

## Step 4: Apply a theme in markup, React and Vue

1. Put `.theme-{color}` on a component, on an ancestor, or on one part of a component. The slots are inherited custom properties, so everything themeable inside follows.

   ```html
   <div class="theme-primary">
     <button class="btn btn-solid" type="button">Save</button>
     <span class="badge">New</span>
   </div>
   ```

2. Use `.theme-reset` on a nested element to drop an inherited theme. It sets every `--cui-theme-*` token to `initial`.
3. Pair arbitrary markup with the theme utilities: `.theme-contrast` (`bg` + `contrast`), `.theme-subtle` (`bg-subtle` + `fg`), `.theme-muted` (`bg-muted` + `fg-emphasis`), `.theme-border`.
4. Single-property utilities exist for every theme color: `.bg-primary`, `.bg-subtle-primary`, `.bg-muted-primary`, `.fg-primary`, `.fg-emphasis-primary`, `.fg-contrast-primary`, `.border-primary`, `.border-subtle-primary`, `.focus-ring-primary`.
5. In React and Vue, set the `theme` prop. It renders the same `theme-{color}` class. The `color` prop is deprecated since 6.0.0 and loses to `theme` when both are set.

   ```jsx
   <>
     <CButton theme="primary" variant="outline">Save</CButton>
     <CAlert theme="danger">Error</CAlert>
     <CBadge theme="success" variant="subtle">Done</CBadge>
   </>
   ```

   ```vue
   <CButton theme="primary" variant="outline">Save</CButton>
   <CAlert theme="danger">Error</CAlert>
   <CBadge theme="success" variant="subtle">Done</CBadge>
   ```

6. `CButton` defaults `variant` to `solid` only when `theme` (or `color`) is set. Without the prop, set `variant` yourself.
7. The React `theme` prop accepts any string. The Vue `theme` prop validates against the seven built-in names, so a custom name logs a development warning. In Vue, apply a custom theme as a class: `<CButton class="theme-brand" variant="solid">`.

## Step 5: Recolor one element or one subtree

A component reads the slot first and its own token second:

```css
.alert {
  --cui-alert-bg: var(--cui-bg-1);
  background-color: var(--cui-theme-bg-subtle, var(--cui-alert-bg));
}
```

This gives two rules:

- Without a theme class, the component token decides. A page-wide `.alert { --cui-alert-bg: … }` restyles every unthemed alert.
- Inside `.theme-*`, the theme wins over the component token.

1. To change one themed element, set the slot on it, not the component token.

   ```html
   <div class="alert theme-danger" style="--cui-theme-bg-subtle: #fde2e4">…</div>
   ```

2. To change a theme for one subtree, set its root slot token on the container. `.theme-{color}` inside the container reads it.

   ```css
   .checkout {
     --cui-primary-bg: #0a7c66;
     --cui-primary-contrast: #fff;
   }
   ```

3. To change a root slot token for the whole page, use `:root, [data-coreui-theme]` as the selector. CoreUI redeclares the root slot tokens on `[data-coreui-theme="light"]`, so an override set on `:root` alone is lost inside a nested light-mode element.

   ```css
   :root,
   [data-coreui-theme] {
     --cui-primary-bg-subtle: light-dark(#eef2ff, #1e1b4b);
   }
   ```

4. Know the exceptions. These variant classes copy the slots into the component tokens and paint from the tokens: `.btn-solid`, `.btn-outline`, `.btn-subtle`, `.btn-ghost`, `.alert-solid`, `.badge-subtle`, `.badge-outline`, `.avatar-subtle`, `.chip-outline`. On them, a component token set on the element or for the whole page wins over the theme.

   | Variant class | React and Vue prop |
   | --- | --- |
   | `.btn-solid`, `.btn-outline`, `.btn-subtle`, `.btn-ghost` | `CButton` `variant` |
   | `.alert-solid` | `CAlert` `variant="solid"` |
   | `.badge-subtle`, `.badge-outline` | `CBadge` `variant` |
   | `.avatar-subtle` | `CAvatar` `variant="subtle"` |
   | `.chip-outline` | `CChip` `variant="outline"` |

   ```css
   /* Wins over .theme-primary on every .btn-solid */
   .btn {
     --cui-btn-bg: #222;
   }
   ```

5. To recolor a themed variant element, set the slot (`--cui-theme-bg`) on it, or remove the page-wide component token.

## Step 6: Add a brand theme color

No Sass function builds the slot map from one color. The scale is generated from one color in `$colors`; the slot map is one entry you write once.

1. With Sass, add the hue to `$colors` and the entry to `$theme-colors`. Both maps merge with the defaults. CoreUI then emits `--cui-brand-025` to `--cui-brand-975`, the `--cui-brand-*` slot tokens, `.theme-brand` and the color utilities (`.bg-brand`, `.fg-brand`, `.border-brand`, …).

   ```scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     $colors: (
       "brand": #6f42c1,
     ),
     $theme-colors: (
       "brand": (
         "base":        var(--cui-brand-500),
         "fg":          light-dark(var(--cui-brand-600), var(--cui-brand-400)),
         "fg-emphasis": light-dark(var(--cui-brand-800), var(--cui-brand-200)),
         "bg":          var(--cui-brand-500),
         "bg-subtle":   light-dark(var(--cui-brand-100), var(--cui-brand-900)),
         "bg-muted":    light-dark(var(--cui-brand-200), var(--cui-brand-800)),
         "border":      light-dark(var(--cui-brand-300), var(--cui-brand-600)),
         "focus-ring":  color-mix(in oklch, var(--cui-brand-base) calc(var(--cui-focus-ring-opacity) * 100%), transparent),
         "contrast":    var(--cui-white),
       ),
     )
   );
   ```

2. The merge is one level deep. To change one slot of a built-in color, pass its whole sub-map. A partial sub-map replaces the other slots, and they disappear from the CSS.

   ```scss
   // Wrong: primary keeps only bg-subtle
   $theme-colors: ("primary": ("bg-subtle": #eef2ff))
   ```

3. Set a color to `null` to remove it: `$theme-colors: ("info": null)`.
4. Give the brand explicit hover and active colors when the computed ones do not fit:

   ```scss
   $theme-state-colors: (
     "brand": ("hover": var(--cui-brand-600), "active": var(--cui-brand-700)),
   )
   ```

5. Without Sass, write the class yourself and set every slot. Components read only the `--cui-theme-*` tokens. Set `--cui-theme-hover` and `--cui-theme-active` too, or solid buttons fall back to the neutral hover. The utilities and `--cui-brand-*` tokens do not exist in this route.

   ```css
   .theme-brand {
     --brand: #6f42c1;
     --cui-theme-base: var(--brand);
     --cui-theme-bg: var(--brand);
     --cui-theme-contrast: var(--cui-white);
     --cui-theme-fg: light-dark(color-mix(in oklch, var(--cui-black) 16%, var(--brand)), color-mix(in oklch, var(--cui-white) 20%, var(--brand)));
     --cui-theme-fg-emphasis: light-dark(color-mix(in oklch, var(--cui-black) 48%, var(--brand)), color-mix(in oklch, var(--cui-white) 60%, var(--brand)));
     --cui-theme-bg-subtle: light-dark(color-mix(in oklch, var(--cui-white) 80%, var(--brand)), color-mix(in oklch, var(--cui-black) 64%, var(--brand)));
     --cui-theme-bg-muted: light-dark(color-mix(in oklch, var(--cui-white) 60%, var(--brand)), color-mix(in oklch, var(--cui-black) 48%, var(--brand)));
     --cui-theme-border: light-dark(color-mix(in oklch, var(--cui-white) 40%, var(--brand)), color-mix(in oklch, var(--cui-black) 16%, var(--brand)));
     --cui-theme-focus-ring: color-mix(in oklch, var(--brand) calc(var(--cui-focus-ring-opacity) * 100%), transparent);
     --cui-theme-hover: oklch(from var(--brand) calc(l * var(--cui-theme-hover-lightness)) calc(c * var(--cui-theme-hover-chroma)) h);
     --cui-theme-active: oklch(from var(--brand) calc(l * var(--cui-theme-active-lightness)) calc(c * var(--cui-theme-active-chroma)) h);
   }
   ```

   The mix percentages match the default stops `600`, `400`, `800`, `200`, `100`, `900`, `300`.

## Step 7: Change surface colors

Neutral surfaces do not use theme slots. They are root tokens built from the gray scale:

| Map | Tokens |
| --- | --- |
| `$theme-bgs` | `--cui-bg-body`, `--cui-bg-1` to `--cui-bg-4` |
| `$theme-fgs` | `--cui-fg-body`, `--cui-fg-1` to `--cui-fg-4` |
| `$theme-borders` | `--cui-border-body`, `--cui-border-muted`, `--cui-border-subtle`, `--cui-border-emphasized` |

`body` reads `--cui-fg-body` and `--cui-bg-body`. Many component tokens default to `--cui-bg-1` to `--cui-bg-4`.

1. Keep the `light-dark()` pair when you override a surface. A single color loses dark mode.

   ```scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     $theme-bgs: (
       "body": light-dark(#fafafa, var(--cui-gray-975)),
     )
   );
   ```

   ```css
   :root,
   [data-coreui-theme] {
     --cui-bg-body: light-dark(#fafafa, #0b0d12);
   }
   ```

2. These maps merge too. Pass only the keys you change.

## Step 8: Set up color modes

1. Color modes use the `data-coreui-theme` attribute. Light is the default. `data-coreui-theme="dark"` sets `color-scheme: dark`, and every `light-dark()` pair follows.

   ```html
   <html lang="en" data-coreui-theme="dark">
   ```

2. Scope a mode to one element by putting the attribute on it: `<div class="dropdown" data-coreui-theme="light">`.
3. The operating system preference does not apply on its own. `:root` declares `color-scheme: light`. Set the attribute from JavaScript, or compile with the media-query build:

   ```scss
   @use "@coreui/coreui-pro/scss/coreui" with (
     $color-mode-type: media-query
   );
   ```

   The media-query build drops per-element modes.
4. Remove the dark color mode block from the build with `$enable-dark-mode: false`.
5. Write mode-specific Sass with the `color-mode()` mixin. It outputs `[data-coreui-theme="dark"] …` or a `prefers-color-scheme` query, depending on `$color-mode-type`.

   ```scss
   @use "@coreui/coreui-pro/scss/coreui" as cui;

   @include cui.color-mode(dark) {
     .hero {
       background-color: var(--cui-primary-bg-subtle);
     }
   }
   ```

6. Prefer `light-dark()` pairs in your own tokens over a second set of dark rules.
7. For a custom mode, add a selector with its own `color-scheme` and override the surface tokens:

   ```css
   [data-coreui-theme="midnight"] {
     color-scheme: dark;
     --cui-bg-body: #0b1736;
     --cui-fg-body: #e6ecff;
   }
   ```

8. React and Vue ship a `useColorModes` hook and composable. It writes `data-coreui-theme` on `<html>`, stores the choice in `localStorage`, and resolves `'auto'` to the system preference.

   ```jsx
   import { useColorModes } from '@coreui/react-pro'

   const { colorMode, setColorMode } = useColorModes('my-app-color-scheme')
   setColorMode('dark') // 'light' | 'dark' | 'auto'
   ```

   ```js
   import { useColorModes } from '@coreui/vue-pro'

   const { colorMode, setColorMode } = useColorModes('my-app-color-scheme')
   ```

   In vanilla projects, set `document.documentElement.dataset.coreuiTheme` yourself.

## Step 9: Verify

1. After a Sass change, compile and grep the output for what you expect:
   - `--cui-primary-500:` holds your new value.
   - `.theme-brand {` exists and sets all eleven `--cui-theme-*` tokens.
   - `--cui-brand-bg-subtle:` and the other slots exist on `:root`.
   - No built-in slot vanished after a partial `$theme-colors` sub-map (grep `--cui-primary-fg:`).
2. Grep your own CSS for `--cui-primary-500` set on anything other than `:root`. Move it, or switch to slots.
3. Grep your own CSS for page-wide component tokens (`--cui-btn-bg`, `--cui-badge-bg`, `--cui-alert-bg`, …). Under `.theme-*` they only take effect on the variant classes from Step 5.
4. In the browser, read `getComputedStyle(el).backgroundColor` on a themed and an unthemed component. Check that the theme changes the value.
5. Check both modes: no attribute, `data-coreui-theme="dark"` on `<html>`, and a nested `data-coreui-theme="light"` inside dark.
6. Check contrast for every new color in both modes: `contrast` on `bg`, `fg` on `bg-subtle`, `fg-emphasis` on `bg-muted`.
7. In Vue, watch the console for prop validation warnings when you pass a custom `theme` name.

---
layout: docs
title: Tooltips
description: Documentation and examples for adding custom Bootstrap tooltips with CSS and JavaScript using CSS3 for animations and data-coreui-attributes for local title storage.
group: components
aliases:
  - "/4.0/components/tooltips/"
  - "/4.1/components/tooltips/"
  - "/components/bootstrap/tooltips/"
toc: true
bootstrap: true
other_frameworks: tooltip
---

## Overview

Things to know when using the tooltip plugin:

- Tooltips rely on the 3rd party library [Popper](https://popper.js.org/) for positioning. You must include [popper.min.js]({{< param "cdn.popper" >}}) before coreui.js or use `coreui.bundle.min.js` / `coreui.bundle.js` which contains Popper in order for tooltips to work!
- Tooltips are opt-in for performance reasons, so **you must initialize them yourself**.
- Tooltips with zero-length titles are never displayed.
- Specify `container: 'body'` to avoid rendering problems in more complex components (like our input groups, button groups, etc).
- Triggering tooltips on hidden elements will not work.
- Tooltips for `.disabled` or `disabled` elements must be triggered on a wrapper element.
- When triggered from hyperlinks that span multiple lines, tooltips will be centered. Use `white-space: nowrap;` on your `<a>`s to avoid this behavior.
- Tooltips must be hidden before their corresponding elements have been removed from the DOM.
- Tooltips can be triggered thanks to an element inside a shadow DOM.

{{< callout info >}}
{{< partial "callouts/info-sanitizer.md" >}}
{{< /callout >}}

{{< callout info >}}
{{< partial "callouts/info-prefersreducedmotion.md" >}}
{{< /callout >}}

Got all that? Great, let's see how they work with some examples.

## Examples

### Enable tooltips

One way to initialize all tooltips on a page would be to select them by their `data-coreui-toggle` attribute:

```js
const tooltipTriggerList = document.querySelectorAll('[data-coreui-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new coreui.Tooltip(tooltipTriggerEl))
```

### Tooltips on links

Hover over the links below to see tooltips:

<div class="docs-example tooltip-demo">
  <p class="muted">Placeholder text to demonstrate some <a href="#" data-coreui-toggle="tooltip" title="Default tooltip">inline links</a> with tooltips. This is now just filler, no killer. Content placed here just to mimic the presence of <a href="#" data-coreui-toggle="tooltip" title="Another tooltip">real text</a>. And all that just to give you an idea of how tooltips would look when used in real-world situations. So hopefully you've now seen how <a href="#" data-coreui-toggle="tooltip" title="Another one here too">these tooltips on links</a> can work in practice, once you use them on <a href="#" data-coreui-toggle="tooltip" title="The last tip!">your own</a> site or project.
  </p>
</div>

{{< callout warning >}}
{{< partial "callouts/warning-data-bs-title-vs-title.md" >}}
{{< /callout >}}

### Custom tooltips

{{< added-in "4.2.0" >}}

You can customize the appearance of tooltips using [CSS variables](#variables). We set a custom class with `data-coreui-custom-class="custom-tooltip"` to scope our custom appearance and use it to override a local CSS variable.

{{< scss-docs name="custom-tooltip" file="docs/assets/scss/_component-examples.scss" >}}


{{< example class="tooltip-demo" stackblitz_add_js="true" >}}
<button type="button" class="btn btn-secondary"
        data-coreui-toggle="tooltip" data-coreui-placement="top"
        data-coreui-custom-class="custom-tooltip"
        data-coreui-title="This top tooltip is themed via CSS variables.">
  Custom tooltip
</button>
{{< /example >}}

### Directions

Hover over the buttons below to see the four tooltips directions: top, right, bottom, and left. Directions are mirrored when using CoreUI in RTL.

<div class="docs-example tooltip-demo">
  <div class="docs-example-tooltips">
    <button type="button" class="btn btn-secondary" data-coreui-toggle="tooltip" data-coreui-placement="top" title="Tooltip on top">Tooltip on top</button>
    <button type="button" class="btn btn-secondary" data-coreui-toggle="tooltip" data-coreui-placement="right" title="Tooltip on right">Tooltip on right</button>
    <button type="button" class="btn btn-secondary" data-coreui-toggle="tooltip" data-coreui-placement="bottom" title="Tooltip on bottom">Tooltip on bottom</button>
    <button type="button" class="btn btn-secondary" data-coreui-toggle="tooltip" data-coreui-placement="left" title="Tooltip on left">Tooltip on left</button>
    <button type="button" class="btn btn-secondary" data-coreui-toggle="tooltip" data-coreui-html="true" title="<em>Tooltip</em> <u>with</u> <b>HTML</b>">Tooltip with HTML</button>
  </div>
</div>

```html
<button type="button" class="btn btn-secondary" data-coreui-toggle="tooltip" data-coreui-placement="top" title="Tooltip on top">
  Tooltip on top
</button>
<button type="button" class="btn btn-secondary" data-coreui-toggle="tooltip" data-coreui-placement="right" title="Tooltip on right">
  Tooltip on right
</button>
<button type="button" class="btn btn-secondary" data-coreui-toggle="tooltip" data-coreui-placement="bottom" title="Tooltip on bottom">
  Tooltip on bottom
</button>
<button type="button" class="btn btn-secondary" data-coreui-toggle="tooltip" data-coreui-placement="left" title="Tooltip on left">
  Tooltip on left
</button>
```

And with custom HTML added:

```html
<button type="button" class="btn btn-secondary" data-coreui-toggle="tooltip" data-coreui-html="true" title="<em>Tooltip</em> <u>with</u> <b>HTML</b>">
  Tooltip with HTML
</button>
```

With an SVG:

<div class="docs-example tooltip-demo">
  <a href="#" class="d-inline-block" data-coreui-toggle="tooltip" title="Default tooltip">
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 100 100">
      <rect width="100%" height="100%" fill="#563d7c"/>
      <circle cx="50" cy="50" r="30" fill="#007bff"/>
    </svg>
  </a>
</div>

## Usage

{{< bootstrap-compatibility >}}

The tooltip plugin generates content and markup on demand, and by default places tooltips after their trigger element.

Trigger the tooltip via JavaScript:

```js
const exampleEl = document.getElementById('example')
const tooltip = new coreui.Tooltip(exampleEl, options)
```

{{< callout warning >}}
##### Overflow `auto` and `scroll`

Tooltip position attempts to automatically change when a **parent container** has `overflow: auto` or `overflow: scroll` like our `.table-responsive`, but still keeps the original placement's positioning. To resolve this, set the [`boundary` option](https://popper.js.org/docs/v2/modifiers/flip/#boundary) (for the flip modifier using the `popperConfig` option) to any HTMLElement to override the default value, `'clippingParents'`, such as `document.body`:

```js
const tooltip = new coreui.Tooltip('#example', {
  boundary: document.body // or document.querySelector('#boundary')
})
```
{{< /callout >}}

### Markup

The required markup for a tooltip is only a `data` attribute and `title` on the HTML element you wish to have a tooltip. The generated markup of a tooltip is rather simple, though it does require a position (by default, set to `top` by the plugin).

{{< callout warning >}}
##### Making tooltips work for keyboard and assistive technology users

You should only add tooltips to HTML elements that are traditionally keyboard-focusable and interactive (such as links or form controls). Although arbitrary HTML elements (such as `<span>`s) can be made focusable by adding the `tabindex="0"` attribute, this will add potentially annoying and confusing tab stops on non-interactive elements for keyboard users, and most assistive technologies currently do not announce the tooltip in this situation. Additionally, do not rely solely on `hover` as the trigger for your tooltip, as this will make your tooltips impossible to trigger for keyboard users.
{{< /callout >}}

```html
<!-- HTML to write -->
<a href="#" data-coreui-toggle="tooltip" title="Some tooltip text!">Hover over me</a>

<!-- Generated markup by the plugin -->
<div class="tooltip bs-tooltip-auto" role="tooltip">
  <div class="tooltip-arrow"></div>
  <div class="tooltip-inner">
    Some tooltip text!
  </div>
</div>
```

### Disabled elements

Elements with the `disabled` attribute aren't interactive, meaning users cannot focus, hover, or click them to trigger a tooltip (or popover). As a workaround, you'll want to trigger the tooltip from a wrapper `<div>` or `<span>`, ideally made keyboard-focusable using `tabindex="0"`.

<div class="tooltip-demo">
{{< example >}}
<span class="d-inline-block" tabindex="0" data-coreui-toggle="tooltip" title="Disabled tooltip">
  <button class="btn btn-primary" type="button" disabled>Disabled button</button>
</span>
{{< /example >}}
</div>

### Options

{{< markdown >}}
{{< partial "js-data-attributes.md" >}}
{{< /markdown >}}

{{< callout warning >}}
Note that for security reasons the `sanitize`, `sanitizeFn`, and `allowList` options cannot be supplied using data attributes.
{{< /callout >}}


{{< bs-table "table" >}}
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `animation` | boolean | `true` | Apply a CSS fade transition to the tooltip |
| `container` | string, element, false | `false` | Appends the tooltip to a specific element. Example: `container: 'body'`. This option is particularly useful in that it allows you to position the tooltip in the flow of the document near the triggering element - which will prevent the tooltip from floating away from the triggering element during a window resize. |
| `delay` | number, object | `0` | Delay showing and hiding the tooltip (ms)—doesn't apply to manual trigger type. If a number is supplied, delay is applied to both hide/show. Object structure is: `delay: { "show": 500, "hide": 100 }`. |
| `html` | boolean | `false` | Allow HTML in the tooltip. If true, HTML tags in the tooltip's `title` will be rendered in the tooltip. If false, `innerText` property will be used to insert content into the DOM. Use text if you're worried about XSS attacks. |
| `placement` | string, function | `'top'` | How to position the tooltip: auto, top, bottom, left, right. When `auto` is specified, it will dynamically reorient the tooltip. When a function is used to determine the placement, it is called with the tooltip DOM node as its first argument and the triggering element DOM node as its second. The `this` context is set to the tooltip instance. |
| `selector` | string, false | `false` | If a selector is provided, tooltip objects will be delegated to the specified targets. In practice, this is used to also apply tooltips to dynamically added DOM elements (`jQuery.on` support). See [this issue]({{< param repo >}}/issues/4215) and [an informative example](https://codepen.io/Johann-S/pen/djJYPb). **Note**: `title` attribute must not be used as a selector. |
| `template` | string | `'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'` | Base HTML to use when creating the tooltip. The tooltip's `title` will be injected into the `.tooltip-inner`. `.tooltip-arrow` will become the tooltip's arrow. The outermost wrapper element should have the `.tooltip` class and `role="tooltip"`. |
| `title` | string, element, function | `''` | Default title value if `title` attribute isn't present. If a function is given, it will be called with its `this` reference set to the element that the popover is attached to. |
| `customClass` | string, function | `''` | Add classes to the tooltip when it is shown. Note that these classes will be added in addition to any classes specified in the template. To add multiple classes, separate them with spaces: `'class-1 class-2'`. You can also pass a function that should return a single string containing additional class names. |
| `trigger` | string | `'hover focus'` | How tooltip is triggered: click, hover, focus, manual. You may pass multiple triggers; separate them with a space. `'manual'` indicates that the tooltip will be triggered programmatically via the `.tooltip('show')`, `.tooltip('hide')` and `.tooltip('toggle')` methods; this value cannot be combined with any other trigger. `'hover'` on its own will result in tooltips that cannot be triggered via the keyboard, and should only be used if alternative methods for conveying the same information for keyboard users is present. |
| `offset` | array, string, function | `[0, 0]` | Offset of the tooltip relative to its target. You can pass a string in data attributes with comma separated values like: `data-coreui-offset="10,20"`. When a function is used to determine the offset, it is called with an object containing the popper placement, the reference, and popper rects as its first argument. The triggering element DOM node is passed as the second argument. The function must return an array with two numbers: [skidding](https://popper.js.org/docs/v2/modifiers/offset/#skidding-1), [distance](https://popper.js.org/docs/v2/modifiers/offset/#distance-1). For more information refer to Popper's [offset docs](https://popper.js.org/docs/v2/modifiers/offset/#options). |
| `fallbackPlacements` | string, array | `['top', 'right', 'bottom', 'left']` | Define fallback placements by providing a list of placements in array (in order of preference). For more information refer to Popper's [behavior docs](https://popper.js.org/docs/v2/modifiers/flip/#fallbackplacements. |
| `boundary` | string, element | `'clippingParents'` | Overflow constraint boundary of the tooltip (applies only to Popper's preventOverflow modifier). By default, it's `'clippingParents'` and can accept an HTMLElement reference (via JavaScript only). For more information refer to Popper's [detectOverflow docs](https://popper.js.org/docs/v2/utils/detect-overflow/#boundary). |
| `sanitize` | boolean | `true` | Enable or disable the sanitization. If activated `'template'`, `'content'` and `'title'` options will be sanitized. |
| `allowList` | object | [Default value]({{< docsref "/getting-started/javascript#sanitizer" >}}) | Object which contains allowed attributes and tags. |
| `sanitizeFn` | null, function | `null` | Here you can supply your own sanitize function. This can be useful if you prefer to use a dedicated library to perform sanitization. |
| `popperConfig` | null, object, function | `null` | To change CoreUI for Bootstrap's default Popper config, see [Popper's configuration](https://popper.js.org/docs/v2/constructors/#options). When a function is used to create the Popper configuration, it's called with an object that contains the CoreUI for Bootstrap's default Popper configuration. It helps you use and merge the default with your own configuration. The function must return a configuration object for Popper.|
{{< /bs-table >}}

{{< callout info >}}
#### Data attributes for individual tooltips

Options for individual tooltips can alternatively be specified through the use of data attributes, as explained above.
{{< /callout >}}

#### Using function with `popperConfig`

```js
const tooltip = new coreui.Tooltip(element, {
  popperConfig(defaultBsPopperConfig) {
    // const newPopperConfig = {...}
    // use defaultBsPopperConfig if needed...
    // return newPopperConfig
  }
})
```

### Methods

{{< callout danger >}}
{{< partial "callouts/danger-async-methods.md" >}}
{{< /callout >}}

{{< bs-table "table" >}}
| Method | Description |
| --- | --- |
| `show` | Reveals an element's tooltip. **Returns to the caller before the tooltip has actually been shown** (i.e. before the `shown.coreui.tooltip` event occurs). This is considered a "manual" triggering of the tooltip. Tooltips with zero-length titles are never displayed. |
| `hide` | Hides an element's tooltip. **Returns to the caller before the tooltip has actually been hidden** (i.e. before the `hidden.coreui.tooltip` event occurs). This is considered a "manual" triggering of the tooltip. |
| `toggle` | Toggles an element's tooltip. **Returns to the caller before the tooltip has actually been shown or hidden** (i.e. before the `shown.coreui.tooltip` or `hidden.coreui.tooltip` event occurs). This is considered a "manual" triggering of the tooltip. |
| `dispose` | Hides and destroys an element's tooltip (Removes stored data on the DOM element). Tooltips that use delegation (which are created using [the `selector` option](#options)) cannot be individually destroyed on descendant trigger elements. |
| `enable` | Gives an element's tooltip the ability to be shown. **Tooltips are enabled by default.** |
| `disable` | Removes the ability for an element's tooltip to be shown. The tooltip will only be able to be shown if it is re-enabled. |
| `setContent` | Gives a way to change the tooltip's content after its initialization. |
| `toggleEnabled` | Toggles the ability for an element's tooltip to be shown or hidden. |
| `update` | Updates the position of an element's tooltip. |
| `getInstance` | *Static* method which allows you to get the tooltip instance associated with a DOM element, or create a new one in case it wasn't initialized |
| `getOrCreateInstance` | *Static* method which allows you to get the tooltip instance associated with a DOM element, or create a new one in case it wasn't initialized |
{{< /bs-table >}}

```js
const tooltip = coreui.Tooltip.getInstance('#example') // Returns a Bootstrap tooltip instance

// setContent example
tooltip.setContent({ '.tooltip-inner': 'another title' })

```

{{< callout info >}}
The `setContent` method accepts an `object` argument, where each property-key is a valid `string` selector within the popover template, and each related property-value can be `string` | `element` | `function` | `null`
{{< /callout >}}

### Events

{{< bs-table >}}
| Event | Description |
| --- | --- |
| `show.coreui.tooltip` | This event fires immediately when the `show` instance method is called. |
| `shown.coreui.tooltip` | This event is fired when the popover has been made visible to the user (will wait for CSS transitions to complete). |
| `hide.coreui.tooltip` | This event is fired immediately when the `hide` instance method has been called. |
| `hidden.coreui.tooltip` | This event is fired when the popover has finished being hidden from the user (will wait for CSS transitions to complete). |
| `inserted.coreui.tooltip` | This event is fired after the `show.coreui.tooltip` event when the tooltip template has been added to the DOM. |
{{< /bs-table >}}

```js
const myTooltipEl = document.getElementById('myTooltip')
const tooltip = coreui.Tooltip.getOrCreateInstance(myTooltipEl)

myTooltipEl.addEventListener('hidden.coreui.tooltip', () => {
  // do something...
})

tooltip.hide()
```

## Customizing

### CSS variables

Tooltips use local CSS variables on `.tooltip` for enhanced real-time customization. Values for the CSS variables are set via Sass, so Sass customization is still supported, too.

{{< scss-docs name="tooltip-css-vars" file="scss/_tooltip.scss" >}}

### SASS variables

{{< scss-docs name="tooltip-variables" file="scss/_variables.scss" >}}

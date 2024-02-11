---
layout: docs
title: Popovers
description: Documentation and examples for adding Bootstrap popovers, like those found in iOS, to any element on your site.
group: components
aliases:
  - "/4.0/components/popovers/"
  - "/4.1/components/popovers/"
  - "/components/bootstrap/popovers/"
toc: true
bootstrap: true
other_frameworks: popover
---

## Overview

Things to know when using the popover plugin:

- Popovers rely on the 3rd party library [Popper](https://popper.js.org/) for positioning. You must include [popper.min.js]({{< param "cdn.popper" >}}) before coreui.js or use `coreui.bundle.min.js` / `coreui.bundle.js` which contains Popper in order for popovers to work!
- Popovers require the [tooltip plugin]({{< docsref "/components/tooltips" >}}) as a dependency.
- Popovers are opt-in for performance reasons, so **you must initialize them yourself**.
- Zero-length `title` and `content` values will never show a popover.
- Specify `container: 'body'` to avoid rendering problems in more complex components (like our input groups, button groups, etc).
- Triggering popovers on hidden elements will not work.
- Popovers for `.disabled` or `disabled` elements must be triggered on a wrapper element.
- When triggered from anchors that wrap across multiple lines, popovers will be centered between the anchors' overall width. Use `.text-nowrap` on your `<a>`s to avoid this behavior.
- Popovers must be hidden before their corresponding elements have been removed from the DOM.
- Popovers can be triggered thanks to an element inside a shadow DOM.

{{< callout info >}}
{{< partial "callouts/info-sanitizer.md" >}}
{{< /callout >}}

{{< callout info >}}
{{< partial "callouts/info-prefersreducedmotion.md" >}}
{{< /callout >}}

Keep reading to see how popovers work with some examples.

## Examples

### Enable popovers everywhere

One way to initialize all popovers on a page would be to select them by their `data-coreui-toggle` attribute:

```js
const popoverTriggerList = document.querySelectorAll('[data-coreui-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new coreui.Popover(popoverTriggerEl))
```
### Live demo

We use JavaScript similar to the snippet above to render the following live popover. Titles are set via `data-coreui-title` and body content is set via `data-coreui-content`.

{{< callout warning >}}
{{< partial "callouts/warning-data-bs-title-vs-title.md" >}}
{{< /callout >}}

{{< example >}}
<button type="button" class="btn btn-lg btn-danger" data-coreui-toggle="popover" title="Popover title" data-coreui-content="And here's some amazing content. It's very engaging. Right?">Click to toggle popover</button>
{{< /example >}}

### Four directions

Four options are available: top, right, bottom, and left aligned. Directions are mirrored when using CoreUI in RTL.

{{< example >}}
<button type="button" class="btn btn-secondary" data-coreui-container="body" data-coreui-toggle="popover" data-coreui-placement="top" data-coreui-content="Top popover">
  Popover on top
</button>
<button type="button" class="btn btn-secondary" data-coreui-container="body" data-coreui-toggle="popover" data-coreui-placement="right" data-coreui-content="Right popover">
  Popover on right
</button>
<button type="button" class="btn btn-secondary" data-coreui-container="body" data-coreui-toggle="popover" data-coreui-placement="bottom" data-coreui-content="Bottom popover">
  Popover on bottom
</button>
<button type="button" class="btn btn-secondary" data-coreui-container="body" data-coreui-toggle="popover" data-coreui-placement="left" data-coreui-content="Left popover">
  Popover on left
</button>
{{< /example >}}

### Using the `container` option

When you have some styles on a parent element that interfere with a popover, you'll want to specify a custom `container` so that the popover's HTML appears within that element instead.

```js
const popover = new coreui.Popover(document.querySelector('.example-popover'), {
  container: 'body'
})
```

### Custom popovers

{{< added-in "4.2.6" >}}

You can customize the appearance of popovers using [CSS variables](#variables). We set a custom class with `data-coreui-custom-class="custom-popover"` to scope our custom appearance and use it to override some of the local CSS variables.
{{< scss-docs name="custom-popovers" file="docs/assets/scss/_component-examples.scss" >}}
{{< example >}}
<button type="button" class="btn btn-secondary"
        data-coreui-toggle="popover" data-coreui-placement="right"
        data-coreui-custom-class="custom-popover"
        data-coreui-title="Custom popover"
        data-coreui-content="This popover is themed via CSS variables.">
  Custom popover
</button>
{{< /example >}}

### Dismiss on next click

Use the `focus` trigger to dismiss popovers on the user's next click of a different element than the toggle element.

{{< callout danger >}}
#### Specific markup required for dismiss-on-next-click

For proper cross-browser and cross-platform behavior, you must use the `<a>` tag, _not_ the `<button>` tag, and you also must include a [`tabindex`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex) attribute.
{{< /callout >}}

{{< example >}}
<a tabindex="0" class="btn btn-lg btn-danger" role="button" data-coreui-toggle="popover" data-coreui-trigger="focus" title="Dismissible popover" data-coreui-content="And here's some amazing content. It's very engaging. Right?">Dismissible popover</a>
{{< /example >}}

```js
const popover = new coreui.Popover(document.querySelector('.popover-dismiss'), {
  trigger: 'focus'
})
```

### Disabled elements

Elements with the `disabled` attribute aren't interactive, meaning users cannot hover or click them to trigger a popover (or tooltip). As a workaround, you'll want to trigger the popover from a wrapper `<div>` or `<span>`, ideally made keyboard-focusable using `tabindex="0"`.

For disabled popover triggers, you may also prefer `data-coreui-trigger="hover focus"` so that the popover appears as immediate visual feedback to your users as they may not expect to _click_ on a disabled element.

{{< example >}}
<span class="d-inline-block" tabindex="0" data-coreui-toggle="popover" data-coreui-trigger="hover focus" data-coreui-content="Disabled popover">
  <button class="btn btn-primary" type="button" disabled>Disabled button</button>
</span>
{{< /example >}}

## Usage

{{< bootstrap-compatibility >}}

Enable popovers via JavaScript:

```js
const exampleEl = document.getElementById('example')
const popover = new coreui.Popover(exampleEl, options)
```

{{< callout warning >}}
### Making popovers work for keyboard and assistive technology users

To allow keyboard users to activate your popovers, you should only add them to HTML elements that are traditionally keyboard-focusable and interactive (such as links or form controls). Although arbitrary HTML elements (such as `<span>`s) can be made focusable by adding the `tabindex="0"` attribute, this will add potentially annoying and confusing tab stops on non-interactive elements for keyboard users, and most assistive technologies currently do not announce the popover's content in this situation. Additionally, do not rely solely on `hover` as the trigger for your popovers, as this will make them impossible to trigger for keyboard users.

While you can insert rich, structured HTML in popovers with the `html` option, we strongly recommend that you avoid adding an excessive amount of content. The way popovers currently work is that, once displayed, their content is tied to the trigger element with the `aria-describedby` attribute. As a result, the entirety of the popover's content will be announced to assistive technology users as one long, uninterrupted stream.

Additionally, while it is possible to also include interactive controls (such as form elements or links) in your popover (by adding these elements to the `allowList` of allowed attributes and tags), be aware that currently the popover does not manage keyboard focus order. When a keyboard user opens a popover, focus remains on the triggering element, and as the popover usually does not immediately follow the trigger in the document's structure, there is no guarantee that moving forward/pressing <kbd>TAB</kbd> will move a keyboard user into the popover itself. In short, simply adding interactive controls to a popover is likely to make these controls unreachable/unusable for keyboard users and users of assistive technologies, or at the very least make for an illogical overall focus order. In these cases, consider using a modal dialog instead.
{{< /callout >}}

### Options

Options can be passed via data attributes or JavaScript. For data attributes, append the option name to `data-coreui-`, as in `data-coreui-animation=""`. Make sure to change the case type of the option name from camelCase to kebab-case when passing via data attributes. For example: instead of using `data-coreui-customClass="beautifier"`, use `data-coreui-custom-class="beautifier"`.

{{< callout warning >}}
Note that for security reasons the `sanitize`, `sanitizeFn`, and `allowList` options cannot be supplied using data attributes.
{{< /callout >}}

{{< bs-table "table" >}}
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `allowList` | object | [Default value]({{< docsref "/getting-started/javascript#sanitizer" >}}) | Object which contains allowed attributes and tags. |
| `animation` | boolean | `true` | Apply a CSS fade transition to the popover |
| `boundary` | string, element | `'clippingParents'` | Overflow constraint boundary of the popover (applies only to Popper's preventOverflow modifier). By default, it's `'clippingParents'` and can accept an HTMLElement reference (via JavaScript only). For more information refer to Popper's [detectOverflow docs](https://popper.js.org/docs/v2/utils/detect-overflow/#boundary). |
| `container` | string, element, false | `false` | Appends the popover to a specific element. Example: `container: 'body'`. This option is particularly useful in that it allows you to position the popover in the flow of the document near the triggering element - which will prevent the popover from floating away from the triggering element during a window resize. |
| `content` | string, element, function | `''` | Default content value if `data-coreui-content` attribute isn't present. If a function is given, it will be called with its `this` reference set to the element that the popover is attached to.
| `customClass` | string, function | `''` | Add classes to the popover when it is shown. Note that these classes will be added in addition to any classes specified in the template. To add multiple classes, separate them with spaces: `'class-1 class-2'`. You can also pass a function that should return a single string containing additional class names. |
| `delay` | number, object | `0` | Delay showing and hiding the popover (ms)—doesn't apply to manual trigger type. If a number is supplied, delay is applied to both hide/show. Object structure is: `delay: { "show": 500, "hide": 100 }`. |
| `fallbackPlacements` | string, array | `['top', 'right', 'bottom', 'left']` | Define fallback placements by providing a list of placements in array (in order of preference). For more information refer to Popper's [behavior docs](https://popper.js.org/docs/v2/modifiers/flip/#fallbackplacements). |
| `html` | boolean | `false` | Allow HTML in the popover. If true, HTML tags in the popover's `title` will be rendered in the popover. If false, `innerText` property will be used to insert content into the DOM. Use text if you're worried about XSS attacks. |
| `offset` | number, string, function | `[0, 0]` | Offset of the popover relative to its target. You can pass a string in data attributes with comma separated values like: `data-coreui-offset="10,20"`. When a function is used to determine the offset, it is called with an object containing the popper placement, the reference, and popper rects as its first argument. The triggering element DOM node is passed as the second argument. The function must return an array with two numbers: [skidding](https://popper.js.org/docs/v2/modifiers/offset/#skidding-1), [distance](https://popper.js.org/docs/v2/modifiers/offset/#distance-1). For more information refer to Popper's [offset docs](https://popper.js.org/docs/v2/modifiers/offset/#options). |
| `placement` | string, function | `'top'` | How to position the popover: auto, top, bottom, left, right. When `auto` is specified, it will dynamically reorient the popover. When a function is used to determine the placement, it is called with the popover DOM node as its first argument and the triggering element DOM node as its second. The `this` context is set to the popover instance. |
| `popperConfig` | null, object, function | `null` | To change CoreUI for Bootstrap's default Popper config, see [Popper's configuration](https://popper.js.org/docs/v2/constructors/#options). When a function is used to create the Popper configuration, it's called with an object that contains the CoreUI for Bootstrap's default Popper configuration. It helps you use and merge the default with your own configuration. The function must return a configuration object for Popper.|
| `sanitize` | boolean | `true` | Enable or disable the sanitization. If activated `'template'`, `'content'` and `'title'` options will be sanitized. |
| `sanitizeFn` | null, function | `null` | Here you can supply your own sanitize function. This can be useful if you prefer to use a dedicated library to perform sanitization. |
| `selector` | string, false | `false` | If a selector is provided, popover objects will be delegated to the specified targets. In practice, this is used to also apply popovers to dynamically added DOM elements (`jQuery.on` support). See [this issue]({{< param repo >}}/issues/4215) and [an informative example](https://codepen.io/Johann-S/pen/djJYPb). **Note**: `title` attribute must not be used as a selector. |
| `template` | string | `'<div class="popover" role="popover"><div class="popover-arrow"></div><div class="popover-inner"></div></div>'` | Base HTML to use when creating the popover. The popover's `title` will be injected into the `.popover-inner`. `.popover-arrow` will become the popover's arrow. The outermost wrapper element should have the `.popover` class and `role="popover"`. |
| `title` | string, element, function | `''` | Default title value if `title` attribute isn't present. If a function is given, it will be called with its `this` reference set to the element that the popover is attached to. |
| `trigger` | string | `'hover focus'` | How popover is triggered: click, hover, focus, manual. You may pass multiple triggers; separate them with a space. `'manual'` indicates that the popover will be triggered programmatically via the `.popover('show')`, `.popover('hide')` and `.popover('toggle')` methods; this value cannot be combined with any other trigger. `'hover'` on its own will result in popovers that cannot be triggered via the keyboard, and should only be used if alternative methods for conveying the same information for keyboard users is present. |
{{< /bs-table >}}

{{< callout info >}}
#### Data attributes for individual popovers

Options for individual popovers can alternatively be specified through the use of data attributes, as explained above.
{{< /callout >}}

#### Using function with `popperConfig`

```js
const popover = new coreui.Popover(element, {
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
| `disable` | Removes the ability for an element's popover to be shown. The popover will only be able to be shown if it is re-enabled. |
| `dispose` | Hides and destroys an element's popover (Removes stored data on the DOM element). Popovers that use delegation (which are created using [the `selector` option](#options)) cannot be individually destroyed on descendant trigger elements. |
| `enable` | Gives an element's popover the ability to be shown. **Popovers are enabled by default.** |
| `getInstance` | _Static_ method which allows you to get the popover instance associated with a DOM element. |
| `getOrCreateInstance` | *Static* method which allows you to get the popover instance associated with a DOM element, or create a new one in case it wasn't initialized |
| `hide` | Hides an element's popover. **Returns to the caller before the popover has actually been hidden** (i.e. before the `hidden.coreui.popover` event occurs). This is considered a "manual" triggering of the popover. |
| `setContent` | Gives a way to change the popover's content after its initialization. |
| `show` | Reveals an element's popover. **Returns to the caller before the popover has actually been shown** (i.e. before the `shown.coreui.popover` event occurs). This is considered a "manual" triggering of the popover. Popovers whose title and content are both zero-length are never displayed. |
| `toggle` | Toggles an element's popover. **Returns to the caller before the popover has actually been shown or hidden** (i.e. before the `shown.coreui.popover` or `hidden.coreui.popover` event occurs). This is considered a "manual" triggering of the popover. |
| `toggleEnabled` | Toggles the ability for an element's popover to be shown or hidden. |
| `update` | Updates the position of an element's popover. |
{{< /bs-table >}}


```js
// getOrCreateInstance example
const popover = coreui.Popover.getOrCreateInstance('#example') // Returns a Bootstrap popover instance

// setContent example
myPopover.setContent({
  '.popover-header': 'another title',
  '.popover-body': 'another content'
})

```

{{< callout info >}}
The `setContent` method accepts an `object` argument, where each property-key is a valid `string` selector within the popover template, and each related property-value can be `string` | `element` | `function` | `null`
{{< /callout >}}

### Events

{{< bs-table >}}
| Event | Description |
| --- | --- |
| `show.coreui.popover` | This event fires immediately when the `show` instance method is called. |
| `shown.coreui.popover` | This event is fired when the popover has been made visible to the user (will wait for CSS transitions to complete). |
| `hide.coreui.popover` | This event is fired immediately when the `hide` instance method has been called. |
| `hidden.coreui.popover` | This event is fired when the popover has finished being hidden from the user (will wait for CSS transitions to complete). |
| `inserted.coreui.popover` | This event is fired after the `show.coreui.popover` event when the popover template has been added to the DOM. |
{{< /bs-table >}}

```js
const myPopoverTrigger = document.getElementById('myPopover')
myPopoverTrigger.addEventListener('hidden.coreui.popover', () => {
  // do something...
})
```

## Customizing

### CSS variables

Popovers use local CSS variables on `.popover` for enhanced real-time customization. Values for the CSS variables are set via Sass, so Sass customization is still supported, too.

{{< scss-docs name="popover-css-vars" file="scss/_popover.scss" >}}

### SASS variables

{{< scss-docs name="popover-variables" file="scss/_variables.scss" >}}

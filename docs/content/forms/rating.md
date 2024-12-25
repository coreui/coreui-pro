---
layout: docs
title: Rating
description: The Rating component allows users to provide feedback on content or services by selecting a rating value. It is customizable, supports various sizes and icons, and can be made interactive or read-only.
group: forms
toc: true
bootstrap: true
pro_component: true
other_frameworks: rating
---

## How to use Rating Component.

Embed the Rating component in your HTML by using a `div` with `data-coreui-toggle="rating"`. Set the initial value with `data-coreui-value`.

{{< example stackblitz_pro="true" >}}
<div data-coreui-toggle="rating" data-coreui-value="3"></div>
{{< /example >}}

## Allow clear

Enable users to clear their selected rating by clicking on the current rating again. This functionality is activated by setting `data-coreui-allow-clear="true"`.

{{< example stackblitz_pro="true" >}}
<div data-coreui-allow-clear="true" data-coreui-toggle="rating" data-coreui-value="3"></div>
{{< /example >}}

This allows the selected rating to be deselected, effectively resetting the rating to a state where no value is selected.

## Resettable

Our Bootstrap Rating component allows users to assign and reset a star rating within a user interface. In the example below, we use the `button` to clear the selected value.

{{< example stackblitz_pro="true" >}}
<div class="d-flex align-items-center">
  <div id="myRatingResettable" data-coreui-toggle="rating" data-coreui-value="3"></div>
  <button class="btn btn-primary ms-3" type="button" onclick="coreui.Rating.getInstance('#myRatingResettable').reset()">reset</button>
</div>
{{< /example >}}

## Readonly

Set the Rating component to read-only by adding `data-coreui-read-only="true"`. This disables interaction, preventing users from changing the displayed rating value.

{{< example stackblitz_pro="true" >}}
<div data-coreui-read-only="true" data-coreui-toggle="rating" data-coreui-value="3"></div>
{{< /example >}}

## Disabled

Add the `data-coreui-disabled="true"` boolean attribute to give it a grayed out appearance, remove pointer events, and prevent focusing.

{{< example stackblitz_pro="true" >}}
<div data-coreui-disabled="true" data-coreui-toggle="rating" data-coreui-value="3"></div>
{{< /example >}}

## Precision

Adjust the granularity of the Rating component by setting `data-coreui-precision`. This attribute allows for fractional ratings, such as quarter values, to provide more precise feedback.

{{< example stackblitz_pro="true" >}}
<div data-coreui-precision="0.25" data-coreui-toggle="rating" data-coreui-value="1.5"></div>
{{< /example >}}

## Number of items

Control the total number of rating items displayed by using `data-coreui-item-count`. You can create a Rating component with a custom scale, be it larger for detailed assessments or smaller for simplicity.

{{< example stackblitz_pro="true" >}}
<div data-coreui-item-count="20" data-coreui-toggle="rating" data-coreui-value="5"></div>
{{< /example >}}

{{< example stackblitz_pro="true" >}}
<div data-coreui-item-count="3" data-coreui-toggle="rating" data-coreui-value="1"></div>
{{< /example >}}

## Tooltips

Enable descriptive text on hover by setting `data-coreui-tooltips` to `true`. This provides immediate feedback or guidance as the user interacts with the rating items.

{{< example stackblitz_pro="true" >}}
<div data-coreui-toggle="rating" data-coreui-tooltips="true" data-coreui-value="3"></div>
{{< /example >}}

For custom messages, provide a comma-separated list of tooltips corresponding to each rating value to enhance the user's understanding of each rating level.

{{< example stackblitz_pro="true" >}}
<div data-coreui-toggle="rating" data-coreui-tooltips="Very bad, Bad, Meh, Good, Very good" data-coreui-value="3"></div>
{{< /example >}}

## Sizes

Larger or smaller rating component? Add `data-coreui-size="lg"` or `data-coreui-size="sm"` for additional sizes.

{{< example stackblitz_pro="true" >}}
<div data-coreui-size="sm" data-coreui-toggle="rating" data-coreui-value="3"></div>
<div data-coreui-toggle="rating" data-coreui-value="3"></div>
<div data-coreui-size="lg" data-coreui-toggle="rating" data-coreui-value="3"></div>
{{< /example >}}

## Custom icons

Customize the Rating component with your choice of SVG icons by assigning new values to the `activeIcon` and `icon` properties in the JavaScript options. This allows for a unique look tailored to the design language of your site or application.

The Rating component can be customized with either SVG or font icons, allowing for visual alignment with your application's design. You can specify different icons for each rating value to enhance user interaction.

In the example below, we demonstrate how to set custom icons using SVG, allowing for detailed customization of the visual elements within the Rating component.

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div id="myRatingCustomIcons1"></div>
{{< /example >}}

{{< js-docs name="rating-custom-icons1" file="docs/assets/js/partials/snippets.js" >}}

In the example below, we use font icons from the CoreUI Icons set. In the `activeIcon` configuration, we also apply the utility class `text-danger` to change the icon's color to red when it is active.

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div id="myRatingCustomIcons2"></div>
{{< /example >}}

{{< js-docs name="rating-custom-icons2" file="docs/assets/js/partials/snippets.js" >}}

For a more dynamic experience, define different icons for each rating value, enhancing the visual feedback:

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div id="myRatingCustomIcons3"></div>
{{< /example >}}

{{< js-docs name="rating-custom-icons3" file="docs/assets/js/partials/snippets.js" >}}

## Custom feedback

The Bootstrap Rating component integrates interactive star ratings with dynamic textual feedback using other components from CoreUI. It enables users to select a rating that updates the display and label in real-time, enhancing the interactive experience. Hover effects provide immediate feedback on potential ratings before selection, ensuring an intuitive user interface.

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div class="d-flex align-items-center">
  <div id="myRatingCustomFeedbackStart" class="text-body-secondary me-3">3 / 5</div>
  <div id="myRatingCustomFeedback"></div>
  <div id="myRatingCustomFeedbackEnd" class="badge text-bg-dark ms-3">Meh</div>
</div>
{{< /example >}}

{{< js-docs name="rating-custom-feedback" file="docs/assets/js/partials/snippets.js" >}}

## Usage

### Via data attributes

{{< bootstrap-compatibility >}}

Add `data-coreui-toggle="rating"` to a `div` element.

```html
<div data-coreui-toggle="rating"></div>
```

### Via JavaScript

Call the rating component via JavaScript:

```html
<div class="rating"></div>
```

```js
const ratingElementList = Array.prototype.slice.call(document.querySelectorAll('.rating'))
const ratingList = ratingElementList.map(ratingEl => {
  return new coreui.Rating(ratingEl)
})
```

### Options

{{< markdown >}}
{{< partial "js-data-attributes.md" >}}
{{< /markdown >}}

{{< callout warning >}}
Note that for security reasons the `sanitize`, `sanitizeFn`, and `allowList` options cannot be supplied using data attributes.
{{< /callout >}}

{{< bs-table >}}
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `activeIcon` | object, string, null | `null` | The default icon to display when the item is selected. |
| `allowClear` | boolean | `false` | Enables the clearing upon clicking the selected item again. |
| `disabled` | boolean | `false` | Toggle the disabled state for the component. |
| `highlightOnlySelected` | boolean | `false` | If enabled, only the currently selected icon will be visibly highlighted. |
| `icon` | object, string, null | `null` | The default icon to display when the item is not selected. |
| `itemCount` | number | `5` | The maximum value the user can select. |
| `name` | string | `null` | The name attribute of the radio input elements. |
| `precision` | number | `1` | Minimum increment value change allowed. |
| `readOnly` | boolean | `false` | Toggle the readonly state for the component. |
| `size` | `'sm'`, `'lg'` | `null` | Size the component small or large. |
| `tooltips` | array, boolean, object | `false` | Enable tooltips with default values or set specific labels for each icon. |
| `value` | number, null | `null` |  The default `value` of component. |
| `sanitize` | boolean | `true` |  Enable or disable the sanitization. If activated `activeIcon`, and `icon` options will be sanitized. |
| `allowList` | object | [Default value]({{< docsref "/getting-started/javascript#sanitizer" >}}) |  Object which contains allowed attributes and tags. |
| `sanitizeFn` | null, function | `null` |  Here you can supply your own sanitize function. This can be useful if you prefer to use a dedicated library to perform sanitization. |
{{< /bs-table >}}

### Methods

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `update` | Updates the configuration of the rating. |
| `reset` | Reset the value to `null` or to provided value. |
| `dispose` | Destroys a component. (Removes stored data on the DOM element) |
| `getInstance` | Static method which allows you to get the rating instance associated to a DOM element, you can use it like this: `coreui.Rating.getInstance(element)` |
| `getOrCreateInstance` | Static method which returns a rating instance associated to a DOM element or create a new one in case it wasn't initialized. You can use it like this: `coreui.Rating.getOrCreateInstance(element)` |
{{< /bs-table >}}

### Events

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `change.coreui.rating` | The callback fired when the selected item changed. |
| `hover.coreui.rating` | The callback fired when the cursor entered and leave the item. |
{{< /bs-table >}}

```js
const myRating = document.getElementById('myRating')
myRating.addEventListener('change.coreui.rating', event => {
  // do something...
})
```

## Customizing

### CSS variables

Ratings use local CSS variables on `.rating` for enhanced real-time customization. Values for the CSS variables are set via Sass, so Sass customization is still supported, too.

{{< scss-docs name="rating-css-vars" file="scss/_rating.scss" >}}

### SASS variables

{{< scss-docs name="rating-variables" file="scss/_variables.scss" >}}

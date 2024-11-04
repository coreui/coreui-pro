---
layout: docs
title: Range Slider
description: Enhance your forms with our customizable Bootstrap 5 Range Slider component for advanced range selection.
group: forms
toc: true
bootstrap: true
---

## Overview

The **Bootstrap 5 Range Slider** component allows users to select a value or range of values within a predefined range. Unlike the standard `<input type="range">`, the Range Slider offers enhanced customization options, including multiple handles, labels, tooltips, and vertical orientation. It ensures consistent styling across browsers and provides a rich set of features for advanced use cases.

{{< example >}}
<div data-coreui-toggle="range-slider"
     data-coreui-value="25,75"
     data-coreui-labels="Low, Medium, High">
</div>
{{< /example >}}

## Features

- **Multiple Handles:** Select single or multiple values within the range.
- **Custom Labels:** Display labels at specific points on the slider.
- **Tooltips:** Show dynamic tooltips displaying current values.
- **Vertical Orientation:** Rotate the slider for vertical layouts.
- **Clickable Labels:** Enable users to click on labels to set slider values.
- **Disabled State:** Disable the slider to prevent user interaction.

## Basic Range Slider

Create a simple range slider with default settings.

{{< example >}}
<div data-coreui-toggle="range-slider" data-coreui-value="50"></div>
{{< /example >}}

## Multiple handles

Enable multiple handles to allow the selection of a range or/and multiple values.

{{< example >}}
<div data-coreui-toggle="range-slider" data-coreui-value="20,40"></div>
<div data-coreui-toggle="range-slider" data-coreui-value="20,40,60"></div>
<div data-coreui-toggle="range-slider" data-coreui-value="20,40,60,80"></div>
{{< /example >}}

## Vertical Range Slider

Rotate the slider to a vertical orientation.

{{< example >}}
<div class="d-flex">
  <div data-coreui-toggle="range-slider" data-coreui-value="20" data-coreui-vertical="true"></div>
  <div data-coreui-toggle="range-slider" data-coreui-value="20,80" data-coreui-vertical="true"></div>
</div>
{{< /example >}}

## Disabled

Disable the slider to prevent user interaction.

{{< example >}}
<div data-coreui-toggle="range-slider" data-coreui-value="50" data-coreui-disabled="true"></div>
<div data-coreui-toggle="range-slider" data-coreui-value="50, 75" data-coreui-disabled="true"></div>
{{< /example >}}

## Min and max

Range Slider has implicit values for `min` and `max`—`0` and `100`, respectively. You may specify new values for those using the `min` and `max` attributes.

{{< example >}}
<div data-coreui-toggle="range-slider" data-coreui-min="-50" data-coreui-max="150" data-coreui-value="50"></div>
<div data-coreui-toggle="range-slider" data-coreui-min="-50" data-coreui-max="150" data-coreui-value="50, 75"></div>
{{< /example >}}

## Steps

Range Slider inputs automatically "snap" to whole numbers. To modify this behavior, set a `step` value. In the example below, we increase the number of steps by specifying `step="0.25"`.

{{< example >}}
<div data-coreui-toggle="range-slider" data-coreui-step="0.25" data-coreui-value="50" ></div>
<div data-coreui-toggle="range-slider" data-coreui-step="0.25" data-coreui-value="50, 75"></div>
{{< /example >}}

## Distance

Sets the minimum distance between multiple slider handles by setting `distance` and ensures that the handles do not overlap or get too close.

{{< example >}}
<div data-coreui-toggle="range-slider" data-coreui-distance="10" data-coreui-value="50, 75"></div>
{{< /example >}}

## Labels

Add labels to specific points on the slider for better context. If you provide an array of strings, as in the example below, then labels will be spaced at equal distances from the beginning to the end of the slider.

{{< example >}}
<div data-coreui-toggle="range-slider" data-coreui-value="30,70" data-coreui-labels="Start, Middle, End"></div>
{{< /example >}}

### Labels customization

Labels can be configured as an array of strings or objects. When using objects, you can specify additional properties like `value`, `label`, `class`, and `style`.

{{< example >}}
<div id="myRangeSliderCustomLabels"></div>
{{< /example >}}

{{< js-docs name="range-slider-custom-labels" file="docs/assets/js/snippets.js" >}}

### Clickable labels

By default, users can click on labels to set the slider to specific values. You can disable this feature by setting `clickableLabels` to `false`.

{{< example >}}
<div data-coreui-toggle="range-slider" data-coreui-clickable-labels="false" data-coreui-value="20,80" data-coreui-labels="Low,Medium,High"></div>
{{< /example >}}

## Tooltips

By default, tooltips display the current value of each handle. You can disable tooltips by setting `tooltips` to `false`

{{< example >}}
<div data-coreui-toggle="range-slider" data-coreui-value="40,60" data-coreui-tooltips="false"></div>
{{< /example >}}

### Tooltips formatting

Customize the content of tooltips using the `tooltipsFormat` option. This can be a function that formats the tooltip text based on the current value.

{{< example >}}
<div id="myRangeSliderCustomTooltips"></div>
{{< /example >}}

{{< js-docs name="range-slider-custom-tooltips" file="docs/assets/js/snippets.js" >}}

## Usage

### Via data attributes

{{< bootstrap-compatibility >}}

Add `data-coreui-toggle="range-slider"` to a `div` element.

```html
<div data-coreui-toggle="range-slider" data-coreui-value="50">
</div>
```

### Via JavaScript

Call the Range Slider component via JavaScript:

```html
<div id="myRangeSlider"></div>
```

```js
const rangeSliderElement = document.getElementById('myRangeSlider')
const rangeSlider = new RangeSlider(rangeSliderElement, {
  min: 0,
  max: 100,
  step: 1,
  distance: 10,
  value: [20, 80],
  labels: ['Low', 'Medium', 'High'],
  clickableLabels: true,
  tooltips: true,
  tooltipsFormat: value => `$${value}`
})
```

### Options

{{< markdown >}}
{{< partial "js-data-attributes.md" >}}
{{< /markdown >}}


{{< bs-table >}}
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `clickableLabels` | boolean | `true` | Enables or disables the ability to click on labels to set slider values. |
| `disabled` | boolean | `false` | Disables the slider, making it non-interactive and grayed out. |
| `distance` | number | `0` | Sets the minimum distance between multiple slider handles. |
| `labels` | array, boolean, string | `false` | Adds labels to the slider. Can be an array of label objects, a comma-separated string, or false.|
| `max` | number | `100` | Defines the maximum value of the slider. |
| `min` | number | `0` | Defines the minimum value of the slider. |
| `name` | array, string, null | `null` | Sets the name attribute for each slider input. |
| `step` | number, string | `1` | Specifies the increment step for slider values. |
| `tooltips` | boolean | `true` | Enables or disables tooltips that display current slider values. |
| `tooltipsFormat` | function, null | `null` | Provides a custom formatting function for tooltip values. |
| `value` | array, number | `0` | Sets the initial value(s) of the slider. |
| `vertical` | boolean | `false` | Rotates the slider to a vertical orientation. |
{{< /bs-table >}}


### Methods

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `update` | Updates the configuration of the Range Slider Component. |
| `dispose` | Destroys a component. (Removes stored data on the DOM element) |
| `getInstance` | Static method which allows you to get the Range Slider instance associated to a DOM element, you can use it like this: `coreui.RangeSlider.getInstance(element)` |
| `getOrCreateInstance` | Static method which returns a Range Slider instance associated to a DOM element or create a new one in case it wasn't initialized. You can use it like this: `coreui.Rating.getOrCreateInstance(element)` |
{{< /bs-table >}}

### Events

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `change.coreui.range-slider` | Fired when the slider value changes. |
{{< /bs-table >}}

```js
const myRangeSlider = document.getElementById('myRangeSlider')
myRangeSlider.addEventListener('change.coreui.range-slider', event => {
  // do something...
})
```

## Customizing

### CSS variables

Bootstap Range Sliders use local CSS variables on `.range-slider` for enhanced real-time customization. Values for the CSS variables are set via Sass, so Sass customization is still supported, too.

{{< scss-docs name="range-slider-css-vars" file="scss/_range-slider.scss" >}}

{{< scss-docs name="range-slider-vertical-css-vars" file="scss/_range-slider.scss" >}}

### SASS variables

{{< scss-docs name="range-slider-variables" file="scss/_variables.scss" >}}

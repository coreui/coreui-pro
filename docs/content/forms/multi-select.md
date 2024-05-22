---
layout: docs
title: Multi Select
description: Customize the native `<select>`s with a powerful Bootstrap Multi-Select component that changes the element's initial appearance and brings some new functionalities.
group: forms
aliases:
  - "/4.0/forms/multi-select/"
toc: true
bootstrap: true
pro_component: true
other_frameworks: multi-select
---

## Basic example

A straightforward demonstration of how to implement a basic Bootstrap Multi Select dropdown, highlighting essential attributes and configurations.

{{< example >}}
<select class="form-multi-select" id="ms1" multiple data-coreui-search="true">
  <option value="0">Angular</option>
  <option value="1">Bootstrap</option>
  <option value="2">React.js</option>
  <option value="3">Vue.js</option>
  <optgroup label="backend">
    <option value="4">Django</option>
    <option value="5">Laravel</option>
    <option value="6">Node.js</option>
  </optgroup>
</select>
{{< /example >}}

{{< example >}}
<select class="form-multi-select" multiple data-coreui-search="true">
  <option value="0">Angular</option>
  <option value="1" disabled>Bootstrap</option>
  <option value="2">React.js</option>
  <option value="3">Vue.js</option>
  <optgroup label="backend">
    <option value="4" disabled>Django</option>
    <option value="5">Laravel</option>
    <option value="6">Node.js</option>
  </optgroup>
</select>
{{< /example >}}

## Data source

Learn how to populate the multi-select component with data from various sources, including arrays and objects, for dynamic content integration.

### Option elements

If you want to create a multi-select dropdown with predefined options, use the `<option>` elements inside the `<select>` tag.

{{< example >}}
<select class="form-multi-select" multiple data-coreui-search="true">
  <option value="0" selected>Angular</option>
  <option value="1">Bootstrap</option>
  <option value="2">React.js</option>
  <option value="3">Vue.js</option>
  <optgroup label="backend">
    <option value="4">Django</option>
    <option value="5" selected>Laravel</option>
    <option value="6">Node.js</option>
  </optgroup>
</select>
{{< /example >}}

### Array data

To dynamically populate a multi-select dropdown with options from an array, start with an empty `<select>` element. Use JavaScript to add options programmatically. This allows for more flexible and dynamic content management.

{{< example >}}
<select id="multiSelect" name="multiSelect"></select>
{{< /example >}}

We use the following JavaScript to set up our multi-select:

{{< js-docs name="multi-select-array-data" file="docs/assets/js/snippets.js" >}}

## Selection types

Explore different selection modes, including single and multiple selections, allowing customization based on user requirements.

### Text

If you want to enable users to select multiple options as text entries, add the `data-coreui-selection-type="text"`. This configuration includes search functionality, making it easier to filter options by typing.

{{< example >}}
<select class="form-multi-select" id="multiple-select-text" multiple data-coreui-selection-type="text" data-coreui-search="true">
  <option value="0">Angular</option>
  <option value="1">Bootstrap</option>
  <option value="2">React.js</option>
  <option value="3">Vue.js</option>
  <optgroup label="backend">
    <option value="4">Django</option>
    <option value="5">Laravel</option>
    <option value="6">Node.js</option>
  </optgroup>
</select>
{{< /example >}}

### Tag

If you want to display selected options as tags, add the `data-coreui-selection-type="tags"`. This mode is useful for visually grouping selected items. The search functionality is also enabled for better user experience.

{{< example >}}
<select class="form-multi-select" id="multiple-select-tag" multiple data-coreui-selection-type="tags" data-coreui-search="true">
  <option value="0">Angular</option>
  <option value="1">Bootstrap</option>
  <option value="2">React.js</option>
  <option value="3">Vue.js</option>
  <optgroup label="backend">
    <option value="4">Django</option>
    <option value="5">Laravel</option>
    <option value="6">Node.js</option>
  </optgroup>
</select>
{{< /example >}}

### Counter

If you prefer to show a counter indicating the number of selected options, add the `data-coreui-selection-type="tags"`. This helps users keep track of their selections and includes search functionality for filtering options.

{{< example >}}
<select class="form-multi-select" id="multiple-select-counter" multiple data-coreui-selection-type="counter" data-coreui-search="true">
  <option value="0">Angular</option>
  <option value="1">Bootstrap</option>
  <option value="2">React.js</option>
  <option value="3">Vue.js</option>
  <optgroup label="backend">
    <option value="4">Django</option>
    <option value="5">Laravel</option>
    <option value="6">Node.js</option>
  </optgroup>
</select>
{{< /example >}}

## Single Select

Add the `data-coreui-multiple="false"` boolean attribute to implement single-selection mode, enabling users to select only one option from the dropdown at a time.

{{< example >}}
<select class="form-multi-select" id="single-select" data-coreui-multiple="false">
  <option value="0">Angular</option>
  <option value="1">Bootstrap</option>
  <option value="2">React.js</option>
  <option value="3">Vue.js</option>
  <optgroup label="backend">
    <option value="4">Django</option>
    <option value="5">Laravel</option>
    <option value="6">Node.js</option>
  </optgroup>
</select>
{{< /example >}}

## Disabled

Add the `data-coreui-disabled="true"` boolean attribute to give it a grayed out appearance, remove pointer events, and prevent focusing.

{{< example >}}
<select class="form-multi-select" id="ms1" multiple data-coreui-search="true"  data-coreui-disabled="true">
  <option value="0">Angular</option>
  <option value="1">Bootstrap</option>
  <option value="2">React.js</option>
  <option value="3">Vue.js</option>
  <optgroup label="backend">
    <option value="4">Django</option>
    <option value="5">Laravel</option>
    <option value="6">Node.js</option>
  </optgroup>
</select>
{{< /example >}}

## Sizing

You may also choose from small and large multi selects to match our similarly sized text inputs.

{{< example >}}
<div class="row">
  <div class="col-md-6">
    <select class="form-multi-select form-multi-select-lg mb-3" id="multiple-select-counter" data-coreui-selection-type="counter" data-coreui-search="true">
      <option value="0">Angular</option>
      <option value="1">Bootstrap</option>
      <option value="2">React.js</option>
      <option value="3">Vue.js</option>
      <optgroup label="backend">
        <option value="4">Django</option>
        <option value="5">Laravel</option>
        <option value="6">Node.js</option>
      </optgroup>
    </select>
    <select class="form-multi-select form-multi-select-sm" id="multiple-select-counter" data-coreui-selection-type="counter" data-coreui-search="true">
      <option value="0">Angular</option>
      <option value="1">Bootstrap</option>
      <option value="2">React.js</option>
      <option value="3">Vue.js</option>
      <optgroup label="backend">
        <option value="4">Django</option>
        <option value="5">Laravel</option>
        <option value="6">Node.js</option>
      </optgroup>
    </select>
  </div>
  <div class="col-md-6">
    <select class="form-multi-select form-multi-select-lg mb-3" id="multiple-select-counter" data-coreui-selection-type="tags" data-coreui-search="true">
      <option value="0">Angular</option>
      <option value="1">Bootstrap</option>
      <option value="2">React.js</option>
      <option value="3">Vue.js</option>
      <optgroup label="backend">
        <option value="4">Django</option>
        <option value="5">Laravel</option>
        <option value="6">Node.js</option>
      </optgroup>
    </select>
    <select class="form-multi-select form-multi-select-sm" id="multiple-select-counter" data-coreui-selection-type="tags" data-coreui-search="true">
      <option value="0">Angular</option>
      <option value="1">Bootstrap</option>
      <option value="2">React.js</option>
      <option value="3">Vue.js</option>
      <optgroup label="backend">
        <option value="4">Django</option>
        <option value="5">Laravel</option>
        <option value="6">Node.js</option>
      </optgroup>
    </select>
  </div>
</div>
{{< /example >}}

## Usage

{{< bootstrap-compatibility >}}

### Via data attributes

Add `form-multi-select` class to a `select` element.

```html
<select class="form-multi-select" id="ms1" multiple data-coreui-search="true">
  <option value="0">Angular</option>
  <option value="1">Bootstrap</option>
  <option value="2">React.js</option>
  <option value="3">Vue.js</option>
  <optgroup label="backend">
    <option value="4">Django</option>
    <option value="5">Laravel</option>
    <option value="6">Node.js</option>
  </optgroup>
</select>
```

### Via JavaScript

Call the time picker via JavaScript:

```html
<select class="form-multi-select"></select>
```

```js
const mulitSelectElementList = Array.prototype.slice.call(document.querySelectorAll('.form-multi-select'))
const mulitSelectList = mulitSelectElementList.map(mulitSelectEl => {
  return new coreui.DatePicker(mulitSelectEl, {
    // options
  })
})
```

### Options

{{< markdown >}}
{{< partial "js-data-attributes.md" >}}
{{< /markdown >}}

{{< bs-table >}}
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `cleaner`| boolean| `true` | Enables selection cleaner element. |
| `disabled` | boolean | `false` | Toggle the disabled state for the component. |
| `invalid` | boolean | `false` | Toggle the invalid state for the component. |
| `multiple` | boolean | `true` | It specifies that multiple options can be selected at once. |
| `name` | string, null | `null` | Set the name attribute for the native select element. |
| `options` | boolean, array | `false` | List of option elements. |
| `optionsMaxHeight` | number, string | `'auto'` | Sets `max-height` of options list.	 |
| `optionsStyle` | string | `'checkbox'` | Sets option style. |
| `placeholder` | string | `'Select...'` | Specifies a short hint that is visible in the input. |
| `search` | boolean | `false` | Enables search input element.	 |
| `searchNoResultsLabel` | string | `'No results found'` | Sets the label for no results when filtering.	|
| `selectAll` | boolean | `true` | Enables select all button.|
| `selectAllLabel` | string | `'Select all options'` | Sets the select all button label.	 |
| `selectionType` | string | `'tag'` | Sets the selection style.	 |
| `selectionTypeCounterText` | string | `'item(s) selected'` | Sets the counter selection label.	|
| `valid` | boolean | `false` | Toggle the valid state for the component. |
{{< /bs-table >}}

### Methods

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `show` | Shows the multi select's options. |
| `hide` | Hides the multi select's options. |
| `update` | Updates the configuration of multi select. |
| `selectAll` | Select all options. |
| `deselectAll` | Deselect all options. |
| `dispose` | Destroys an element's multi select. (Removes stored data on the DOM element) |
| `getInstance` | Static method which allows you to get the multi select instance associated with a DOM element. |
| `getValue` | Returns the array with selected elements. |
{{< /bs-table >}}

### Events

Multi Select component exposes a few events for hooking into multi select functionality.

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `changed.coreui.multi-select` | Fires immediately when an option is selected or deselected. |
| `show.coreui.multi-select` | Fires immediately when the show instance method is called. |
| `shown.coreui.multi-select` | Fired when the multi select options have been made visible to the user and CSS transitions have completed. |
| `hide.coreui.multi-select` | Fires immediately when the hide instance method has been called. |
| `hidden.coreui.multi-select` | Fired when the multi select options have finished being hidden from the user and CSS transitions have completed. |
{{< /bs-table >}}

```js
const myMutliSelect = document.getElementById('myMutliSelect')
myMutliSelect.addEventListener('changed.coreui.multi-select', event => {
  // Get the list of selected options.
  const selected = event.value
})
```

## Customizing

### CSS variables

MultiSelects use local CSS variables on `.multi-select` for enhanced real-time customization. Values for the CSS variables are set via Sass, so Sass customization is still supported, too.

{{< scss-docs name="form-multi-select-css-vars" file="scss/forms/_form-multi-select.scss" >}}

### SASS variables

{{< scss-docs name="form-multi-select-variables" file="scss/_variables.scss" >}}

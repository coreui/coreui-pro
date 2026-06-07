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
snippets:
  - multi-select-array-data.js
  - multi-select-custom-options.js
  - multi-select-header.js
  - multi-select-indeterminate.js
  - multi-select-selection-limit.js
---

## Basic example

A straightforward demonstration of how to implement a basic Bootstrap Multi Select dropdown, highlighting essential attributes and configurations.

{{< example stackblitz_pro="true" >}}
<select id="ms1" data-coreui-multi-select multiple data-coreui-search="global">
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

{{< example stackblitz_pro="true" >}}
<select data-coreui-multi-select multiple data-coreui-search="true">
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

{{< example stackblitz_pro="true" >}}
<select data-coreui-multi-select multiple data-coreui-search="true">
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

{{< example stackblitz_pro="true" stackblitz_add_js="multiSelectArrayDataSnippet">}}
<select id="multiSelect" name="multiSelect"></select>
{{< /example >}}

We use the following JavaScript to set up our multi-select:

{{< js-docs id="multiSelectArrayDataSnippet" name="multi-select-array-data" file="docs/assets/js/snippets/multi-select-array-data.js" >}}

## Search

You can configure the search functionality within the component. The `data-coreui-search` option determines how the search input element is enabled and behaves. It accepts multiple types to provide flexibility in configuring search behavior. By default is set to `false`.

{{< example stackblitz_pro="true" >}}
<select data-coreui-multi-select multiple>
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

### Standard search

To enable the default search input element with standard behavior, please add `data-coreui-search="true"` like in the example below:

{{< example stackblitz_pro="true" >}}
<select data-coreui-multi-select multiple data-coreui-search="true">
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

### Global search

{{< added-in "5.6.0" >}}

To enable the global search functionality within the Multi Select component, please add `data-coreui-search="global"`. When `data-coreui-search` is set to `'global'`, the user can perform searches across the entire component, regardless of where their focus is within the component. This allows for a more flexible and intuitive search experience, ensuring the search input is recognized from any point within the component.

{{< example stackblitz_pro="true" >}}
<select data-coreui-multi-select multiple data-coreui-search="global">
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


## Selection types

Explore different selection modes, including single and multiple selections, allowing customization based on user requirements.

### Text

If you want to enable users to select multiple options as text entries, add the `data-coreui-selection-type="text"`. This configuration includes search functionality, making it easier to filter options by typing.

{{< example stackblitz_pro="true" >}}
<select id="multiple-select-text" data-coreui-multi-select multiple data-coreui-selection-type="text" data-coreui-search="true">
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

{{< example stackblitz_pro="true" >}}
<select id="multiple-select-tag" data-coreui-multi-select multiple data-coreui-selection-type="tags" data-coreui-search="true">
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

{{< example stackblitz_pro="true" >}}
<select id="multiple-select-counter" data-coreui-multi-select multiple data-coreui-selection-type="counter" data-coreui-search="true">
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

## Select all

When `multiple` is enabled, a **select all** button is rendered in the dropdown header (toggle it with the `selectAll` option, on by default). The button works as a toggle: it selects every option and its label switches to `deselectAllLabel`, then deselects everything on the next click.

With the default `selectAllStyle: 'checkbox'` the button shows a tri-state indicator that mirrors the overall selection — `none` when nothing is selected, `all` when everything is, and `indeterminate` in between. Set `selectAllStyle: 'text'` for a plain text toggle instead.

{{< example stackblitz_pro="true" >}}
<select id="multiSelectSelectAll" data-coreui-multi-select multiple data-coreui-search="true">
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

### How it interacts with other features

- **[Selection limit](#selection-limit):** with `selectionLimit` set, select all selects options only up to the limit (firing the `selectionLimit` event) and then toggles to deselect all.
- **[Selectable groups](#selectable-groups):** with `optionsGroupsSelectable`, each group label becomes its own tri-state checkbox that toggles just that group, while the header select all reflects the whole list.
- **Search:** by default (`selectAllMode: 'all'`) the header button acts on the full list, ignoring the current filter. Set `selectAllMode: 'filtered'` to make it act on the search-filtered options instead (see below).

### Acting on filtered options

Set `selectAllMode: 'filtered'` to scope the built-in select all button to the options currently matched by the search filter. The button's label and checkbox then answer "are all *filtered* options selected?". With no active filter, every option matches, so this behaves exactly like `'all'`.

To avoid a misleading "Select all" while a filter is active, the label switches to `selectFilteredLabel` / `deselectFilteredLabel` (default `Select filtered` / `Deselect filtered`) whenever the filter actually narrows the list — and falls back to `selectAllLabel` / `deselectAllLabel` when nothing is hidden.

Type into the search box below, then use select all — only the matching options are selected.

{{< example stackblitz_pro="true" >}}
<select id="multiSelectSelectAllMode" data-coreui-multi-select multiple data-coreui-search="true" data-coreui-select-all-mode="filtered">
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

Because the scope follows the filter, a side effect is worth knowing: if you select all options while a filter is active (so the checkbox shows `all`) and then clear the search, the checkbox drops to `indeterminate` — the previously hidden, unselected options are now back in the list, so not everything in view is selected anymore.

The same scoping is available programmatically through `selectFiltered` / `deselectFiltered`, regardless of `selectAllMode`:

```js
const multiSelect = coreui.MultiSelect.getInstance(document.getElementById('myMultiSelect'))

multiSelect.selectFiltered() // select only the search-filtered options
multiSelect.deselectFiltered() // deselect only the search-filtered options
```

To surface these as buttons inside the dropdown, render them through the [custom dropdown header](#custom-dropdown-header) `actions`.

## Selection limit

Use `data-coreui-selection-limit` to limit how many options can be selected. The select all button stays enabled and selects options up to the limit, then toggles to deselect all once the limit is reached. The `selectionLimit.coreui.multi-select` event can be used to show feedback when a user tries to select more options than allowed.

{{< example stackblitz_pro="true" stackblitz_add_js="multiSelectSelectionLimitSnippet">}}
<select id="multiSelectSelectionLimit" data-coreui-multi-select multiple data-coreui-search="true" data-coreui-selection-limit="3">
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

We use the following JavaScript to show a toast when the selection limit is reached. The toast container is created on demand and appended to `<body>`, so it floats above the page instead of being constrained by the example:

{{< js-docs id="multiSelectSelectionLimitSnippet" name="multi-select-selection-limit" file="docs/assets/js/snippets/multi-select-selection-limit.js" >}}

## Single Select

Add the `data-coreui-multiple="false"` boolean attribute to implement single-selection mode, enabling users to select only one option from the dropdown at a time.

{{< example stackblitz_pro="true" >}}
<select id="single-select" data-coreui-multi-select data-coreui-multiple="false">
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

{{< example stackblitz_pro="true" >}}
<select id="ms1" data-coreui-multi-select multiple data-coreui-search="true"  data-coreui-disabled="true">
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

## Custom templates

The CoreUI Bootstrap Multi Select Component provides the flexibility to personalize options and group labels by utilizing custom templates. You can easily customize the options using the `optionsTemplate`, and for groups, you can use `optionsGroupsTemplate`, as demonstrated in the examples below:

{{< example stackblitz_pro="true" stackblitz_add_js="multiSelectCustomOptionsSnippet">}}
<div class="row">
  <div class="col-md-6">
    <select id="myMultiSelectCountries" data-coreui-multi-select></select>
  </div>
  <div class="col-md-6">
    <select id="myMultiSelectCountriesAndCities" data-coreui-multi-select></select>
  </div>
</div>
{{< /example >}}

We use the following JavaScript to set up our multi-select:

{{< js-docs id="multiSelectCustomOptionsSnippet" name="multi-select-custom-options" file="docs/assets/js/snippets/multi-select-custom-options.js" >}}

## Custom dropdown header

Use the `headerTemplate` option to fully customize the dropdown header — the area above the options list — including rendering several action buttons. It renders independently of `selectAll`. The template function receives a `state` object (`{ selected, total, filtered, filteredSelected }`) and an `actions` object with bound component methods (`selectAll`, `selectFiltered`, `deselectFiltered`, `deselectAll`). Return an `HTMLElement` and wire your own listeners to the `actions`, or return an HTML string (sanitized) for simple custom content. The header re-renders on every selection change and search filter, so labels and `disabled` states stay up to date.

{{< example stackblitz_pro="true" stackblitz_add_js="multiSelectHeaderSnippet">}}
<select id="myMultiSelectHeader" data-coreui-multi-select></select>
{{< /example >}}

We use the following JavaScript to set up our multi-select:

{{< js-docs id="multiSelectHeaderSnippet" name="multi-select-header" file="docs/assets/js/snippets/multi-select-header.js" >}}

## Selectable groups

Enable `optionsGroupsSelectable` to turn each group label into its own tri-state checkbox that toggles the whole group. Because the indicator is rendered with CSS, it supports a third, `indeterminate` state — shown when only some of a group's options are selected — without any real `<input>` element. The same tri-state logic drives the header [select all](#select-all) button when `selectAllStyle: 'checkbox'`. Each section's indicator follows its own `*Style` option (`optionsStyle`, `optionsGroupsStyle`, `selectAllStyle`, all defaulting to `'checkbox'`) and requires `multiple`.

{{< example stackblitz_pro="true" stackblitz_add_js="multiSelectIndeterminateSnippet">}}
<select id="myMultiSelectIndeterminate" data-coreui-multi-select></select>
{{< /example >}}

We use the following JavaScript to set up our multi-select:

{{< js-docs id="multiSelectIndeterminateSnippet" name="multi-select-indeterminate" file="docs/assets/js/snippets/multi-select-indeterminate.js" >}}

## Sizing

You may also choose from small and large multi selects to match our similarly sized text inputs.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-md-6">
    <select id="multiple-select-counter" class="form-multi-select-lg mb-3" data-coreui-multi-select data-coreui-selection-type="counter" data-coreui-search="true">
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
    <select id="multiple-select-counter" class="form-multi-select-sm" data-coreui-multi-select data-coreui-selection-type="counter" data-coreui-search="true">
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
    <select id="multiple-select-counter" class="form-multi-select-lg mb-3" data-coreui-multi-select data-coreui-selection-type="tags" data-coreui-search="true">
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
    <select id="multiple-select-counter" class="form-multi-select-sm" data-coreui-multi-select data-coreui-selection-type="tags" data-coreui-search="true">
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

Add the `data-coreui-multi-select` attribute to a `select` element.

```html
<select id="ms1" data-coreui-multi-select multiple data-coreui-search="true">
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
<select data-coreui-multi-select></select>
```

```js
const mulitSelectElementList = Array.prototype.slice.call(document.querySelectorAll('[data-coreui-multi-select]'))
const mulitSelectList = mulitSelectElementList.map(mulitSelectEl => {
  return new coreui.MultiSelect(mulitSelectEl, {
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
| `allowList` | object | `DefaultAllowlist` | Object containing allowed tags and attributes for HTML sanitization when using custom templates. |
| `ariaCleanerLabel`| string | `Clear all selections` | A string that provides an accessible label for the cleaner button. This label is read by screen readers to describe the action associated with the button. |
| `ariaTagDeleteLabel`| string | `Remove` | Accessible label prefix for a tag's delete button (selection type `tags`). The selected option's text is appended, so screen readers announce e.g. "Remove Angular". |
| `cleaner`| boolean | `true` | Enables selection cleaner element. |
| `clearSearchOnSelect`| boolean | `false` | Clear current search on selecting an item. |
| `container` | string, element, false | `false` | Appends the dropdown to a specific element. Example: `container: 'body'`. |
| `deselectAllLabel` | string | `'Deselect all'` | Sets the select all button label shown once everything is selected. See `selectAllLabel`. |
| `deselectFilteredLabel` | string | `'Deselect filtered'` | Label shown instead of `deselectAllLabel` when `selectAllMode: 'filtered'` and a search filter narrows the list. See `selectFilteredLabel`. |
| `disabled` | boolean | `false` | Toggle the disabled state for the component. |
| `headerTemplate` | function, null | `null` | Custom template function for rendering the dropdown header (the area above the options list). Renders independently of `selectAll`. Receives a `state` object (`{ selected, total, filtered, filteredSelected }`) and an `actions` object (`{ selectAll, deselectAll, selectFiltered, deselectFiltered }`) with bound component methods. Return an `HTMLElement` (wire your own listeners using `actions`, supports multiple controls) or an HTML string (sanitized, no actions wired). Re-renders on every selection change and search filter. |
| `invalid` | boolean | `false` | Toggle the invalid state for the component. |
| `multiple` | boolean | `true` | It specifies that multiple options can be selected at once. |
| `name` | string, null | `null` | Set the name attribute for the native select element. |
| `options` | boolean, array | `false` | List of option elements. |
| `optionsGroupsSelectable` | boolean | `false` | When enabled (with `optionsGroupsStyle: 'checkbox'` and `multiple`), each option group label becomes a tri-state checkbox: clicking it toggles the whole group, and it reflects `none` / `all` / `indeterminate` based on the group's selected options. |
| `optionsGroupsStyle` | string | `'checkbox'` | Sets the option group label style: `'checkbox'` or `'text'`. Controls the checkbox appearance used by `optionsGroupsSelectable`. |
| `optionsGroupsTemplate` | function, null | `null` | Custom template function for rendering option group labels. Receives the group object as parameter. |
| `optionsMaxHeight` | number, string | `'auto'` | Sets `max-height` of options list.	 |
| `optionsStyle` | string | `'checkbox'` | Sets the option style: `'checkbox'` or `'text'`. |
| `optionsTemplate` | function, null | `null` | Custom template function for rendering individual options. Receives the option object as parameter. |
| `placeholder` | string | `'Select...'` | Specifies a short hint that is visible in the input. |
| `required` | boolean | `false` | Makes the input field required for form validation. |
| `sanitize` | boolean | `true` | Enables HTML sanitization for custom templates to prevent XSS attacks. |
| `sanitizeFn` | function, null | `null` | Custom sanitization function. If provided, it will be used instead of the built-in sanitizer. |
| `search` | boolean, string | `false` | Enables search input element. When set to `'global'`, the user can perform searches across the entire component, regardless of where their focus is within the component. |
| `searchNoResultsLabel` | string | `'No results found'` | Sets the label for no results when filtering.	|
| `selectAll` | boolean | `true` | Enables select all button.|
| `selectAllLabel` | string | `'Select all'` | Sets the select all button label shown until everything is selected. The button is a toggle: it shows `selectAllLabel` (and selects all) until everything is selected, then shows `deselectAllLabel` (and deselects all). |
| `selectAllMode` | string | `'all'` | Scope of the built-in select all button: `'all'` toggles every option (ignoring the search filter), `'filtered'` toggles only the search-filtered options. With no active filter both behave the same. |
| `selectAllStyle` | string | `'checkbox'` | Sets the select all button style: `'checkbox'` or `'text'`. With `'checkbox'` (and `multiple`), the built-in select all button shows a tri-state checkbox indicator (`none` / `all` / `indeterminate`) reflecting the overall selection, and clicking it toggles between selecting and deselecting all. |
| `selectionLimit` | number, null | `null` | Sets the maximum number of selectable options. The select all button stays enabled and selects up to the limit (firing the `selectionLimit` event), then toggles to deselect all once the limit is reached. |
| `selectFilteredLabel` | string | `'Select filtered'` | Label shown instead of `selectAllLabel` when `selectAllMode: 'filtered'` and a search filter narrows the list, so the button reads as acting on the filtered options rather than the whole list. |
| `selectionType` | string | `'tag'` | Sets the selection style.	 |
| `selectionTypeCounterText` | string | `'item(s) selected'` | Sets the counter selection label.	|
| `valid` | boolean | `false` | Toggle the valid state for the component. |
| `value` | boolean | `null` | Sets the initially selected values for the multi-select component. |
{{< /bs-table >}}

### Methods

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `show` | Shows the multi select's options. |
| `hide` | Hides the multi select's options. |
| `update` | Updates the configuration of multi select. |
| `selectAll` | Select all options. |
| `selectFiltered` | Select only the currently filtered (search-matched) options. |
| `deselectFiltered` | Deselect only the currently filtered (search-matched) options. |
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
| `selectionLimit.coreui.multi-select` | Fires when selecting an option is blocked because the selection limit has been reached. |
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

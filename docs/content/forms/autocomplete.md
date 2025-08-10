---
layout: docs
title: Autocomplete
description: Create intelligent, responsive input fields using the Bootstrap Autocomplete plugin. This component enhances user input with dynamic dropdown suggestions, flexible data providers, and callback support.
group: forms
toc: true
bootstrap: true
pro_component: true
preview_component: true
---

## Overview

The **Bootstrap Autocomplete Dropdown** component is a powerful autocomplete dropdown plugin that enhances form control usability by suggesting completions as the user types. Whether you're integrating with local JavaScript arrays or fetching live server responses via AJAX, this plugin enables rich, dynamic user interactions.

## Basic example

A straightforward demonstration of how to implement a basic Bootstrap Autocomplete input field, highlighting essential attributes and configurations.

{{< example stackblitz_pro="true" >}}
<div
  data-coreui-toggle="autocomplete"
  data-coreui-cleaner="true"
  data-coreui-highlight-options-on-search="true"
  data-coreui-indicator="true"
  data-coreui-options="Angular, Bootstrap, React.js, Vue.js"
  data-coreui-placeholder="Search technologies..."
  data-coreui-search="global"
  data-coreui-search-no-results-label="No results found"
  data-coreui-show-hints="true"
  data-coreui-value="React.js"
></div>
{{< /example >}}

## Data source

Learn how to populate the autocomplete component with data from various sources, including arrays and objects, for dynamic content integration.

### Array data

To dynamically populate an autocomplete input with suggestions from an array, use JavaScript to configure the component with predefined options.

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div id="myAutoComplete"></div>
{{< /example >}}

We use the following JavaScript to set up our autocomplete:

{{< js-docs name="autocomplete-array-data" file="docs/assets/js/partials/snippets.js" >}}

### Object data with groups

You can organize suggestions into groups using optgroups for better categorization and user experience.

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div id="myAutoCompleteGrouped"></div>
{{< /example >}}

{{< js-docs name="autocomplete-grouped-data" file="docs/assets/js/partials/snippets.js" >}}

### Options with values

You can use values in your options array. This is particularly useful when working with database IDs, product codes, or any numeric identifiers. Note that the component internally converts number values to strings for consistency and DOM compatibility.

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div id="myAutoCompleteValues"></div>
{{< /example >}}

{{< js-docs name="autocomplete-option-values" file="docs/assets/js/partials/snippets.js" >}}

{{< callout info >}}
**Important:** While you can pass number values in your options, the component internally converts all values to strings using `String(value)`. When handling selection events, remember that `event.value.value` will always be a string representation of your original number.

For example:
- Input: `{ label: 'Product A', value: 42 }`
- Internal storage: `{ label: 'Product A', value: '42' }`
- Event output: `event.value.value === '42'` (string)
{{< /callout >}}

### External data

You can configure CoreUI's AutoComplete component to fetch and display options dynamically from an external API. This is useful when you need to autocomplete data that changes frequently or is too large to preload. 

This example shows how to connect the AutoComplete to a remote API to search users by first name.

{{< example stackblitz_pro="true" >}}
<div id="myAutoCompleteExternalData"></div>
{{< /example >}}

To fetch data from an external source, you must set the search option to `'external'` or `['external', 'global']`.
This disables internal filtering and allows you to provide custom data (e.g., from an API) based on user input.

{{< js-docs name="autocomplete-external-data" file="docs/assets/js/partials/snippets.js" >}}

## Search functionality

Configure the search behavior within the component. The `data-coreui-search` option determines how the search input operates and provides different search modes.

By default, search applies only while the input field is focused:

{{< example stackblitz_pro="true" >}}
<div data-coreui-toggle="autocomplete" data-coreui-options="Angular, Bootstrap, React.js, Vue.js" data-coreui-placeholder="Search technologies..."></div>
{{< /example >}}

### Global search

Enable global search functionality that works across the entire component, regardless of focus position:

{{< example stackblitz_pro="true" >}}

<div data-coreui-toggle="autocomplete" data-coreui-search="global" data-coreui-options="Angular, Bootstrap, React.js, Vue.js" data-coreui-placeholder="Global search enabled..."></div>
{{< /example >}}

### External search

Use external search mode to fetch data dynamically from a server or API. This disables internal filtering and delegates the search logic entirely to your application via JavaScript:

```html
<div id="myAutoCompleteExternalDataExample"></div>
```

```js
const autocomplete = new coreui.AutoComplete(myAutoCompleteExternalDataExample, {
  search: 'external', // Required for remote data sources
  options: [],
  placeholder: 'Search technologies...'
})

myAutoCompleteExternalDataExample.addEventListener('input.coreui.autocomplete', async event => {
  const query = event.value
  const response = await fetch(`https://example.com/api?q=${query}`)
  const results = await response.json()

  autocomplete.update({
    options: results.map(item => ({
      value: item.id,
      label: item.name
    }))
  })
})
```

{{< callout info >}}
When `search: 'external'` is used, the component no longer filters options internally — you must handle all data fetching and filtering logic manually.

You can combine it with `'global'` (e.g. search: `['external', 'global']`) to allow search input even when focus is not in the text field.
{{< /callout >}}

## Restricted selection

Restrict users to only select from predefined options by setting `data-coreui-allow-only-defined-options="true"`:

{{< example stackblitz_pro="true" >}}
<div data-coreui-toggle="autocomplete" data-coreui-allow-only-defined-options="true" data-coreui-options="Angular, Bootstrap, React.js, Vue.js" data-coreui-placeholder="Only predefined options allowed..."></div>
{{< /example >}}

## Hints and completion

Enable intelligent hints and auto-completion features to improve user experience.

### Show hints

Display completion hints as users type:

{{< example stackblitz_pro="true" >}}
<div data-coreui-toggle="autocomplete" data-coreui-options="Angular, Bootstrap, React.js, Vue.js" data-coreui-placeholder="Type to see hints..." data-coreui-show-hints="true"></div>
{{< /example >}}

### Highlight matching text

Highlight matching portions of suggestions during search:

{{< example stackblitz_pro="true" >}}
<div data-coreui-toggle="autocomplete" data-coreui-highlight-options-on-search="true" data-coreui-options="Angular, Bootstrap, React.js, Vue.js" data-coreui-placeholder="Search with highlighting..."></div>
{{< /example >}}

## Validation states

Apply validation styling to indicate input validity.

{{< example stackblitz_pro="true" >}}
<div data-coreui-toggle="autocomplete" data-coreui-options="Angular, Bootstrap, React.js, Vue.js" data-coreui-placeholder="Valid autocomplete..." data-coreui-valid="true"></div>
{{< /example >}}

{{< example stackblitz_pro="true" >}}
<div data-coreui-toggle="autocomplete" data-coreui-options="Angular, Bootstrap, React.js, Vue.js" data-coreui-placeholder="Invalid autocomplete..." data-coreui-invalid="true"></div>
{{< /example >}}

## Disabled state

Add the `data-coreui-disabled="true"` attribute to disable the component:

{{< example stackblitz_pro="true" >}}
<div data-coreui-toggle="autocomplete" data-coreui-disabled="true" data-coreui-options="" data-coreui-placeholder="Disabled autocomplete..." ></div>
{{< /example >}}

## Sizing

You may also choose from small and large auto completes to match our similarly sized text inputs.

{{< example class="d-flex flex-column gap-3" stackblitz_pro="true" >}}
<div 
  class="autocomplete-lg"
  data-coreui-cleaner="true"
  data-coreui-highlight-options-on-search="true"
  data-coreui-indicator="true"
  data-coreui-options="Angular, Bootstrap, React.js, Vue.js"
  data-coreui-placeholder="Large autocomplete..."
  data-coreui-search="global"
  data-coreui-show-hints="true"
  data-coreui-toggle="autocomplete"
></div>
<div 
  data-coreui-cleaner="true"
  data-coreui-highlight-options-on-search="true"
  data-coreui-indicator="true"
  data-coreui-options="Angular, Bootstrap, React.js, Vue.js"
  data-coreui-placeholder="Normal autocomplete..."
  data-coreui-search="global"
  data-coreui-show-hints="true"
  data-coreui-toggle="autocomplete"
></div>
<div 
  class="autocomplete-sm"
  data-coreui-cleaner="true"
  data-coreui-highlight-options-on-search="true"
  data-coreui-indicator="true"
  data-coreui-options="Angular, Bootstrap, React.js, Vue.js"
  data-coreui-placeholder="Small autocomplete..."
  data-coreui-search="global"
  data-coreui-show-hints="true"
  data-coreui-toggle="autocomplete"
></div>
{{< /example >}}

## Cleaner functionality

Enable a cleaner button to quickly clear input element:

{{< example stackblitz_pro="true" >}}
<div data-coreui-toggle="autocomplete" data-coreui-cleaner="true" data-coreui-options="Angular, Bootstrap, React.js, Vue.js" data-coreui-placeholder="With cleaner button..."></div>
{{< /example >}}

## Custom templates

The CoreUI Bootstrap Autocomplete Component provides the flexibility to personalize options and group labels by utilizing custom templates. You can easily customize the options using the `optionsTemplate`, and for groups, you can use `optionsGroupsTemplate`, as demonstrated in the examples below:

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div class="row">
  <div class="col-md-6">
    <div id="myAutocompleteCountries"></div>
  </div>
  <div class="col-md-6">
    <div id="myAutocompleteCountriesAndCities"></div>
  </div>
</div>
{{< /example >}}

We use the following JavaScript to set up our autocomplete:

{{< js-docs name="autocomplete-custom-options" file="docs/assets/js/partials/snippets.js" >}}


## Usage

{{< bootstrap-compatibility >}}

### Via data attributes

Add `autocomplete` class to a container element with an input field:

```html
<div data-coreui-toggle="autocomplete" data-coreui-search="true"></div>
```

### Via JavaScript

Initialize the autocomplete component via JavaScript:

```html
<div data-coreui-toggle="autocomplete"></div>
```

```js
const autoCompleteElementList = Array.prototype.slice.call(document.querySelectorAll('.autocomplete'))
const autoCompleteList = autoCompleteElementList.map(autoCompleteEl => {
  return new coreui.Autocomplete(autoCompleteEl, {
    options: [
      'JavaScript',
      'TypeScript',
      'React',
      'Vue.js',
      'Angular'
    ],
    search: 'global'
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
| `allowOnlyDefinedOptions` | boolean | `false` | Restricts selection to only predefined options when set to `true`. |
| `ariaCleanerLabel` | string | `'Clear selection'` | Accessible label for the cleaner button, read by screen readers. |
| `ariaIndicatorLabel` | string | `'Toggle visibility of options menu'` | Accessible label for the indicator button, read by screen readers. |
| `cleaner` | boolean | `false` | Enables the selection cleaner button. |
| `clearSearchOnSelect` | boolean | `true` | Clears the search input when an option is selected. |
| `container` | string, element, boolean | `false` | Appends the dropdown to a specific element. Example: `container: 'body'`. |
| `disabled` | boolean | `false` | Disables the component when set to `true`. |
| `highlightOptionsOnSearch` | boolean | `false` | Highlights matching text in options during search. |
| `id` | string, null | `null` | Sets a custom ID for the component. If not provided, a unique ID is auto-generated. |
| `indicator` | boolean | `false` | Enables the selection indicator button. |
| `invalid` | boolean | `false` | Applies invalid styling to the component. |
| `name` | string, null | `null` | Sets the name attribute for the input element. |
| `options` | boolean, array | `false` | Array of options or option objects to populate the dropdown. |
| `optionsGroupsTemplate` | function, null | `null` | Custom template function for rendering option group labels. Receives the group object as parameter. |
| `optionsMaxHeight` | number, string | `'auto'` | Sets the maximum height of the options dropdown. |
| `optionsTemplate` | function, null | `null` | Custom template function for rendering individual options. Receives the option object as parameter. |
| `placeholder` | string, null | `null` | Placeholder text displayed in the input field. |
| `required` | boolean | `false` | Makes the input field required for form validation. |
| `sanitize` | boolean | `true` | Enables HTML sanitization for custom templates to prevent XSS attacks. |
| `sanitizeFn` | function, null | `null` | Custom sanitization function. If provided, it will be used instead of the built-in sanitizer. |
| `search` | array, string, null | `null` | Enables search functionality. Use `'global'` for global search across the component and `'external'` when options are provided from external sources. |
| `searchNoResultsLabel` | string | `false` | Text displayed when no search results are found. |
| `showHints` | boolean | `false` | Shows completion hints as users type. |
| `valid` | boolean | `false` | Applies valid styling to the component. |
| `value` | number, string, null | `null` | Sets the initial value of the component. |
{{< /bs-table >}}

### Methods

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `show` | Shows the Bootstrap autocomplete dropdown options. |
| `hide` | Hides the Bootstrap autocomplete dropdown options. |
| `toggle` | Toggles the visibility of the dropdown options. |
| `search` | Performs a search with the provided text parameter. |
| `update` | Updates the component configuration and rebuilds the interface. |
| `deselectAll` | Deselects all currently selected options. |
| `dispose` | Destroys the component instance and removes stored data. |
| `getInstance` | Static method to get the Bootstrap autocomplete instance associated with a DOM element. |
{{< /bs-table >}}

### Events

The Autocomplete component exposes several events for integrating with application logic.

{{< bs-table >}}
| Event | Description |
| --- | --- |
| `changed.coreui.autocomplete` | Fires when an option is selected or the input value changes. |
| `show.coreui.autocomplete` | Event fires immediately when the show method is called. |
| `shown.coreui.autocomplete` | Fired when the dropdown has been made visible and CSS transitions completed. |
| `hide.coreui.autocomplete` | Event fires immediately when the hide method is called. |
| `hidden.coreui.autocomplete` | Fired when the dropdown has been hidden and CSS transitions completed. |
| `input.coreui.autocomplete` | Fires when the search input value changes. |
{{< /bs-table >}}

```js
const myAutocomplete = document.getElementById('myAutocomplete')
myAutocomplete.addEventListener('changed.coreui.autocomplete', event => {
  // Get the selected value
  const selectedValue = event.value
  // Your callback function to handle change
  // eslint-disable-next-line no-console
  console.log('Selected:', selectedValue)
})

myAutocomplete.addEventListener('input.coreui.autocomplete', event => {
  // Get the current input value
  const inputValue = event.value
  // Your callback function to handle input
  // eslint-disable-next-line no-console
  console.log('Input changed:', inputValue)
})
```

## Accessibility

The Autocomplete component includes several accessibility features:

- **ARIA attributes**: Proper `role`, `aria-expanded`, `aria-haspopup`, and `aria-autocomplete` attributes
- **Screen reader support**: Descriptive labels and announcements for state changes
- **Keyboard navigation**: Full keyboard support with arrow keys, Enter, Escape, and Tab
- **Focus management**: Proper focus handling and visual focus indicators
- **Semantic markup**: Uses appropriate HTML elements and structure

### Keyboard shortcuts

{{< bs-table >}}
| Key | Action |
| --- | --- |
| `Arrow Down` | Navigate to the next option or open dropdown |
| `Arrow Up` | Navigate to the previous option |
| `Enter` | Select the highlighted option |
| `Escape` | Close the dropdown and clear focus |
| `Tab` | Accept hint completion (when hints are enabled) |
| `Backspace/Delete` | Clear input and trigger search |
{{< /bs-table >}}

## Customizing

### CSS variables

Autocomplete components use local CSS variables on `.autocomplete` for enhanced real-time customization. Values for the CSS variables are set via Sass, so Sass customization is still supported.

{{< scss-docs name="autocomplete-css-vars" file="scss/_autocomplete.scss" >}}

### SASS variables

{{< scss-docs name="autocomplete-variables" file="scss/_variables.scss" >}}

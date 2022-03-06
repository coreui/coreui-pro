---
layout: docs
title: Multi Select
description: Customize the native `<select>`s with a powerful Multi-Select component that changes the element's initial appearance and brings some new functionalities.
group: forms
aliases:
  - "/forms/multi-select/"
  - "/4.0/forms/multi-select/"
toc: true
---

## Basic example

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
<select class="form-multi-select" multiple data-coreui-search="true" data-coreui-placeholder="sass --style expanded --source-map --embed-sources --no-error-css --load-path=node_modules/ src/scss/:dist/css/">
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

### Option elements

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

<div class="docs-example">
  <select id="multiSelect" name="multiSelect"></select>
</div>

```html
<select id="multiSelect"></select>

<script type="text/javascript">
  var myMultiSelect = document.querySelector('#multiSelect')
  var cuiMultiSelect = new coreui.MultiSelect(myMultiSelect, {
    options: [
      {
        value: 0,
        text: 'Angular'
      },
      {
        value: 1,
        text: 'Bootstrap',
        selected: true
      },
      {
        value: 2,
        text: 'React.js',
        selected: true
      },
      {
        value: 3,
        text: 'Vue.js'
      },
      {
        label: 'backend',
        options: [
          {
            value: 4,
            text: 'Django'
          },
          {
            value: 5,
            text: 'Laravel'
          },
          {
            value: 6,
            text: 'Node.js',
            selected: true
          }
        ]
      }
    ]
  })
</script>
```

## Selection types
### Text

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

### Options

Options can be passed via data attributes or JavaScript. For data attributes, append the option name to `data-coreui-`, as in `data-coreui-inline=""`.

<table class="table">
  <thead>
    <tr>
      <th style="width: 100px;">Name</th>
      <th style="width: 100px;">Type</th>
      <th style="width: 120px;">Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>cleaner</code></td>
      <td>boolean</td>
      <td><code>true</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>multiple</code></td>
      <td>boolean</td>
      <td><code>true</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>placeholder</code></td>
      <td>string</td>
      <td><code>'Select...'</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>options</code></td>
      <td>(boolean|array)</td>
      <td><code>false</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>optionsMaxHeight</code></td>
      <td>(number|string)</td>
      <td><code>'auto'</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>optionsStyle</code></td>
      <td>string</td>
      <td><code>'checkbox'</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>search</code></td>
      <td>boolean</td>
      <td><code>false</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>searchNoResultsLabel</code></td>
      <td>string</td>
      <td><code>'No results found'</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>selectAll</code></td>
      <td>boolean</td>
      <td><code>true</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>selectAllLabel</code></td>
      <td>string</td>
      <td><code>'Select all options'</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>selectionType</code></td>
      <td>string</td>
      <td><code>'tag'</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>selectionTypeCounterText</code></td>
      <td>string</td>
      <td><code>'item(s) selected'</code></td>
      <td></td>
    </tr>
  </tbody>
</table>

### Methods

<table class="table">
  <thead>
    <tr>
      <th>Method</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>show</code></td>
      <td>
        Shows the multi select's options.
      </td>
    </tr>
    <tr>
      <td><code>hide</code></td>
      <td>
        Hides the multi select's options.
      </td>
    </tr>
    <tr>
      <td><code>update</code></td>
      <td>
        Updates the configuration of multi select.
      </td>
    </tr>
    <tr>
      <td><code>dispose</code></td>
      <td>
        Destroys an element's multi select. (Removes stored data on the DOM element)
      </td>
    </tr>
    <tr>
      <td><code>getInstance</code></td>
      <td>
        Static method which allows you to get the multi select instance associated with a DOM element.
      </td>
    </tr>
    <tr>
      <td><code>getValue</code></td>
      <td>
        Returns the array with selected elements.
      </td>
    </tr>
  </tbody>
</table>

### Events

Multi Select component exposes a few events for hooking into multi select functionality.

<table class="table">
  <thead>
    <tr>
      <th>Method</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <code>changed.coreui.multi-select</code>
      </td>
      <td>
        Fires immediately when an option is selected or deselected.
      </td>
    </tr>
    <tr>
      <td>
        <code>show.coreui.multi-select</code>
      </td>
      <td>
        Fires immediately when the show instance method is called.
      </td>
    </tr>
    <tr>
      <td>
        <code>shown.coreui.multi-select</code>
      </td>
      <td>
        Fired when the multi select options have been made visible to the user and CSS transitions have completed.
      </td>
    </tr>
    <tr>
      <td>
        <code>hide.coreui.multi-select</code>
      </td>
      <td>
        Fires immediately when the hide instance method has been called.
      </td>
    </tr>
    <tr>
      <td>
        <code>hidden.coreui.multi-select</code>
      </td>
      <td>
        Fired when the multi select options have finished being hidden from the user and CSS transitions have completed.
      </td>
    </tr>
  </tbody>
</table>

```js
var myMutliSelect = document.getElementById('myMutliSelect')
myMutliSelect.addEventListener('changed.coreui.multi-select', function (event) {
  // Get the list of selected options.
  var selected = event.value
})
```

## Customizing

### SASS
{{< scss-docs name="form-multi-select-variables" file="scss/_variables.scss" >}}

### CSS Vars
{{< css-vars-docs file="scss/forms/_form-multi-select.scss" >}}

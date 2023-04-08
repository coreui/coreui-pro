---
layout: docs
title: Multi Select New
description: Customize the native `<select>`s with a powerful Multi-Select component that changes the element's initial appearance and brings some new functionalities.
group: forms
pro_component: true
other_frameworks: multi-select
---

## Basic example

{{< example >}}
<div class="row">
  <div class="col-6">
    <select class="form-multi-select-new" id="ms-new-1" multiple data-coreui-search="true" value="">
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
  <div class="col-6">
    <input class="form-control" placeholder="select" />
  </div>
</div>
{{< /example >}}

<div class="docs-example">
  <div class="row">
    <div class="col-4">
      <label>Text with Search</label>
      <select class="form-multi-select-new" id="multiple-select-text" multiple data-coreui-selection-type="text" data-coreui-search="true" data-coreui-disabled="true">
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
    <div class="col-4">
      <label>Text without Search</label>
      <select class="form-multi-select-new" id="multiple-select-text" multiple data-coreui-selection-type="text" disabled>
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
    <div class="col-4">
      <label>Control size</label>
      <input class="form-control" placeholder="Select..." />
    </div>
    <hr class="my-3" />
    <div class="col-4">
      <label>Counter with Search</label>
      <select class="form-multi-select-new" id="multiple-select-counter" multiple data-coreui-selection-type="counter" data-coreui-search="true">
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
    <div class="col-4">
      <label>Counter without Search</label>
      <select class="form-multi-select-new" id="multiple-select-counter" multiple data-coreui-selection-type="counter">
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
    <div class="col-4">
      <label>Control size</label>
      <input class="form-control" placeholder="Select..." />
    </div>
    <hr class="my-3" />
    <div class="col-4">
      <label>Tag with Search</label>
      <select class="form-multi-select-new" id="multiple-select-tag" multiple data-coreui-selection-type="tags" data-coreui-search="true">
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
    <div class="col-4">
      <label>Tag without Search</label>
      <select class="form-multi-select-new" id="multiple-select-tag" multiple data-coreui-selection-type="tags">
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
      <div class="col-4">
      <label>Control size</label>
      <input class="form-control" placeholder="Select..." />
    </div>
    <hr class="my-3" />
    <div class="col-4">
      <label>Single with Search</label>
      <select class="form-multi-select-new" id="single-select" data-coreui-multiple="false" data-coreui-search="true">
        <option value=""></option>
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
    <div class="col-4">
      <label>Single without Search</label>
      <select class="form-multi-select-new" id="single-select" data-coreui-multiple="false">
        <option value=""></option>
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
    <div class="col-4">
      <label>Control size</label>
      <input class="form-control" placeholder="Select..." />
    </div>
  </div>
</div>

<div class="docs-example mb-4">
  <div class="row">
    <div class="col-4">
      <label>Text with Search</label>
      <select class="form-multi-select-new form-multi-select-new-lg" id="multiple-select-text" multiple data-coreui-selection-type="text" data-coreui-search="true">
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
    <div class="col-4">
      <label>Text without Search</label>
      <select class="form-multi-select-new form-multi-select-new-lg" id="multiple-select-text" multiple data-coreui-selection-type="text">
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
    <div class="col-4">
      <label>Control size</label>
      <input class="form-control form-control-lg" placeholder="Select..." />
    </div>
    <hr class="my-3" />
    <div class="col-4">
      <label>Counter with Search</label>
      <select class="form-multi-select-new form-multi-select-new-lg" id="multiple-select-counter" multiple data-coreui-selection-type="counter" data-coreui-search="true">
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
    <div class="col-4">
      <label>Counter without Search</label>
      <select class="form-multi-select-new form-multi-select-new-lg" id="multiple-select-counter" multiple data-coreui-selection-type="counter">
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
    <div class="col-4">
      <label>Control size</label>
      <input class="form-control form-control-lg" placeholder="Select..." />
    </div>
    <hr class="my-3" />
    <div class="col-4">
      <label>Tag with Search</label>
      <select class="form-multi-select-new form-multi-select-new-lg" id="multiple-select-tag" multiple data-coreui-selection-type="tags" data-coreui-search="true">
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
    <div class="col-4">
      <label>Tag without Search</label>
      <select class="form-multi-select-new form-multi-select-new-lg" id="multiple-select-tag" multiple data-coreui-selection-type="tags">
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
      <div class="col-4">
      <label>Control size</label>
      <input class="form-control form-control-lg" placeholder="Select..." />
    </div>
    <hr class="my-3" />
    <div class="col-4">
      <label>Single with Search</label>
      <select class="form-multi-select-new form-multi-select-new-lg" id="single-select" data-coreui-multiple="false" data-coreui-search="true">
        <option value=""></option>
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
    <div class="col-4">
      <label>Single without Search</label>
      <select class="form-multi-select-new form-multi-select-new-lg" id="single-select" data-coreui-multiple="false">
        <option value=""></option>
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
    <div class="col-4">
      <label>Control size</label>
      <input class="form-control form-control-lg" placeholder="Select..." />
    </div>
  </div>
</div>

<div class="docs-example mb-4">
  <div class="row">
    <div class="col-4">
      <label>Text with Search</label>
      <select class="form-multi-select-new form-multi-select-new-sm" id="multiple-select-text" multiple data-coreui-selection-type="text" data-coreui-search="true">
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
    <div class="col-4">
      <label>Text without Search</label>
      <select class="form-multi-select-new form-multi-select-new-sm" id="multiple-select-text" multiple data-coreui-selection-type="text">
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
    <div class="col-4">
      <label>Control size</label>
      <input class="form-control form-control-sm" placeholder="Select..." />
    </div>
    <hr class="my-3" />
    <div class="col-4">
      <label>Counter with Search</label>
      <select class="form-multi-select-new form-multi-select-new-sm" id="multiple-select-counter" multiple data-coreui-selection-type="counter" data-coreui-search="true">
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
    <div class="col-4">
      <label>Counter without Search</label>
      <select class="form-multi-select-new form-multi-select-new-sm" id="multiple-select-counter" multiple data-coreui-selection-type="counter">
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
    <div class="col-4">
      <label>Control size</label>
      <input class="form-control form-control-sm" placeholder="Select..." />
    </div>
    <hr class="my-3" />
    <div class="col-4">
      <label>Tag with Search</label>
      <select class="form-multi-select-new form-multi-select-new-sm" id="multiple-select-tag" multiple data-coreui-selection-type="tags" data-coreui-search="true">
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
    <div class="col-4">
      <label>Tag without Search</label>
      <select class="form-multi-select-new form-multi-select-new-sm" id="multiple-select-tag" multiple data-coreui-selection-type="tags">
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
      <div class="col-4">
      <label>Control size</label>
      <input class="form-control form-control-sm" placeholder="Select..." />
    </div>
    <hr class="my-3" />
    <div class="col-4">
      <label>Single with Search</label>
      <select class="form-multi-select-new form-multi-select-new-sm" id="single-select" data-coreui-multiple="false" data-coreui-search="true">
        <option value=""></option>
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
    <div class="col-4">
      <label>Single without Search</label>
      <select class="form-multi-select-new form-multi-select-new-sm" id="single-select" data-coreui-multiple="false">
        <option value=""></option>
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
    <div class="col-4">
      <label>Control size</label>
      <input class="form-control form-control-sm" placeholder="Select..." />
    </div>
  </div>
</div>

{{< example >}}
<select class="form-multi-select-new" id="ms1" multiple data-coreui-search="true">

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
<select class="form-multi-select-new" multiple data-coreui-search="true">

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
<select class="form-multi-select-new" multiple data-coreui-search="true">

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
  <select id="multiSelectNew" name="multiSelectNew"></select>
</div>

```html
<select id="multiSelectNew"></select>

<script type="text/javascript">
  const myMultiSelect = document.querySelector("#multiSelectNew");
  const cuiMultiSelect = new coreui.MultiSelectNew(myMultiSelect, {
    options: [
      {
        value: 0,
        text: "Angular",
      },
      {
        value: 1,
        text: "Bootstrap",
        selected: true,
      },
      {
        value: 2,
        text: "React.js",
        selected: true,
      },
      {
        value: 3,
        text: "Vue.js",
      },
      {
        label: "backend",
        options: [
          {
            value: 4,
            text: "Django",
          },
          {
            value: 5,
            text: "Laravel",
          },
          {
            value: 6,
            text: "Node.js",
            selected: true,
          },
        ],
      },
    ],
  });
</script>
```

## Selection types

### Text

{{< example >}}
<select class="form-multi-select-new" id="multiple-select-text" multiple data-coreui-selection-type="text" data-coreui-search="true">

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
<select class="form-multi-select-new" id="multiple-select-tag" multiple data-coreui-selection-type="tags" data-coreui-search="true">

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
<select class="form-multi-select-new" id="multiple-select-counter" multiple data-coreui-selection-type="counter" data-coreui-search="true">

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
<select class="form-multi-select-new" id="single-select" data-coreui-multiple="false">

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
<select class="form-multi-select-new" id="ms1" multiple data-coreui-search="true"  data-coreui-disabled="true">

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

{{< markdown >}}
{{< partial "js-data-attributes.md" >}}
{{< /markdown >}}

{{< bs-table >}}
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `cleaner`| boolean| `true` | Enables selection cleaner element. |
| `disabled` | boolean | `false` | Toggle the disabled state for the component. |
| `invalid` | boolean | `false` | Toggle the invalid state for the component. |
| `options` | (boolean\|array)| `false` | List of option elements. |
| `optionsMaxHeight` | (number\|string)| `'auto'` | Sets `max-height` of options list. |
| `optionsStyle` | string| `'checkbox'` | Sets option style. |
| `placeholder` | string| `'Select...'` | Specifies a short hint that is visible in the input. |
| `search` | boolean| `false` | Enables search input element. |
| `searchNoResultsLabel` | string| `'No results found'` | Sets the label for no results when filtering. |
| `selectAll` | boolean| `true` | Enables select all button.|
| `selectAllLabel` | string| `'Select all options'` | Sets the select all button label. |
| `selectionType` | string| `'tag'` | Sets the selection style. |
| `selectionTypeCounterText` | string| `'item(s) selected'` | Sets the counter selection label. |
| `valid` | boolean | `false` | Toggle the valid state for the component. |
{{< /bs-table >}}

### Methods

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `show` | Shows the multi select's options. |
| `hide` | Hides the multi select's options. |
| `update` | Updates the configuration of multi select. |
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
const myMutliSelect = document.getElementById("myMutliSelect");
myMutliSelect.addEventListener("changed.coreui.multi-select", (event) => {
  // Get the list of selected options.
  const selected = event.value;
});
```

## Customizing

### CSS variables

MultiSelects use local CSS variables on `.multi-select` for enhanced real-time customization. Values for the CSS variables are set via Sass, so Sass customization is still supported, too.

{{< scss-docs name="form-multi-select-css-vars" file="scss/forms/_form-multi-select.scss" >}}

### SASS variables

{{< scss-docs name="form-multi-select-variables" file="scss/_variables.scss" >}}

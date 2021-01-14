---
layout: docs
title: Multi Select
description: Customize the native `<select>`s with a powerful Multi-Select component that changes the element's initial appearance and brings some new functionalities.
group: forms
toc: true
---

## Single Select

{{< example >}}
<select class="form-multi-select" id="single-select" data-coreui-multiple="false" data-coreui-search="true">
  <option value="0">enhancement</option>
  <option value="1">bug</option>
  <option value="2">duplicate</option>
  <option value="3">invalid</option>
  <optgroup label="group">
    <option value="4">enhancement2</option>
    <option value="5">bug2</option>
  </optgroup>
</select>
{{< /example >}}

## Multiple Select - text selection

{{< example >}}
<select class="form-multi-select" id="multiple-select-text" data-coreui-search="true">
  <option value="0">enhancement</option>
  <option value="1">bug</option>
  <option value="2">duplicate</option>
  <option value="3">invalid</option>
  <optgroup label="group">
    <option value="4">enhancement2</option>
    <option value="5">bug2</option>
  </optgroup>
</select>
{{< /example >}}

## Multiple Select - tag selection

{{< example >}}
<select class="form-multi-select" id="multiple-select-tag" data-coreui-selection-type="tags" data-coreui-search="true">
  <option value="0">enhancement</option>
  <option value="1">bug</option>
  <option value="2">duplicate</option>
  <option value="3">invalid</option>
  <optgroup label="group">
    <option value="4">enhancement2</option>
    <option value="5">bug2</option>
  </optgroup>
</select>
{{< /example >}}

## Multiple Select - counter selection

{{< example >}}
<select class="form-multi-select" id="multiple-select-counter" data-coreui-selection-type="counter" data-coreui-search="true">
  <option value="0">enhancement</option>
  <option value="1">bug</option>
  <option value="2">duplicate</option>
  <option value="3">invalid</option>
  <optgroup label="group">
    <option value="4">enhancement2</option>
    <option value="5">bug2</option>
  </optgroup>
</select>
{{< /example >}}

## Sizing

You may also choose from small and large custom selects to match our similarly sized text inputs.

{{< example >}}
<select class="form-select form-select-lg mb-3" aria-label=".form-select-lg example">
  <option selected>Open this select menu</option>
  <option value="1">One</option>
  <option value="2">Two</option>
  <option value="3">Three</option>
</select>

<select class="form-select form-select-sm" aria-label=".form-select-sm example">
  <option selected>Open this select menu</option>
  <option value="1">One</option>
  <option value="2">Two</option>
  <option value="3">Three</option>
</select>
{{< /example >}}

The `multiple` attribute is also supported:

{{< example >}}
<select class="form-select" multiple aria-label="multiple select example">
  <option selected>Open this select menu</option>
  <option value="1">One</option>
  <option value="2">Two</option>
  <option value="3">Three</option>
</select>
{{< /example >}}

As is the `size` attribute:

{{< example >}}
<select class="form-select" size="3" aria-label="size 3 select example">
  <option selected>Open this select menu</option>
  <option value="1">One</option>
  <option value="2">Two</option>
  <option value="3">Three</option>
</select>
{{< /example >}}

## Disabled

Add the `disabled` boolean attribute on a select to give it a grayed out appearance and remove pointer events.

{{< example >}}
<select class="form-select" aria-label="Disabled select example" disabled>
  <option selected>Open this select menu</option>
  <option value="1">One</option>
  <option value="2">Two</option>
  <option value="3">Three</option>
</select>
{{< /example >}}

## Customizing

### SASS
{{< scss-docs name="form-select-variables" file="scss/_variables.scss" >}}

### CSS Vars
{{< css-vars-docs file="scss/forms/_form-select.scss" >}}

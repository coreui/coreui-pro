---
layout: docs
title: Time Picker
description: Create consistent cross-browser and cross-device time picker.
group: forms
toc: true
---

## Installation

This component is part of the CoreUI LAB. If you want to use Time Picker component you have to install **next** version of the `@coreui/coreui-pro@next` package. The LAB is the place where we release components that are actively developed and will be included in future releases of `@coreui/coreui-pro`.

```sh
npm install @coreui/coreui-pro@next
```

## Example

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-locale="en-US" data-coreui-toggle="time-picker"></div>
  </div>
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-locale="en-US" data-coreui-toggle="time-picker" data-coreui-value="02:17:35 PM"></div>
  </div>
</div>
{{< /example >}}

## Sizing

Set heights using `data-coreui-size` attribute like `data-coreui-size="lg"` and `data-coreui-size="sm"`.

{{< example >}}
<div class="row mb-4">
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-locale="en-US" data-coreui-size="lg" data-coreui-toggle="time-picker"></div>
  </div>
</div>
<div class="row">
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-locale="en-US" data-coreui-size="sm" data-coreui-toggle="time-picker"></div>
  </div>
</div>
{{< /example >}}

## Disabled

Add the `data-coreui-disabled="true"` attribute on an input to give it a grayed out appearance and remove pointer events.

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-disabled="true" data-coreui-locale="en-US" data-coreui-toggle="time-picker"></div>
  </div>
</div>
{{< /example >}}

## Readonly

Add the `data-coreui-input-read-only="true"` boolean attribute to prevent modification of the input's value.

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-input-read-only="true" data-coreui-locale="en-US" data-coreui-toggle="time-picker"></div>
  </div>
</div>
{{< /example >}}

## Non-english locale

### Auto

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div data-coreui-toggle="time-picker"></div>
  </div>
</div>
{{< /example >}}

### Chinese

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-locale="zh-CN" data-coreui-placeholder="入住日期" data-coreui-toggle="time-picker"></div>
  </div>
</div>
{{< /example >}}

### Japanese

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-locale="ja" data-coreui-placeholder="日付を選択" data-coreui-toggle="time-picker"></div>
  </div>
</div>
{{< /example >}}

### Korean

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-locale="ko" data-coreui-placeholder="날짜 선택" data-coreui-toggle="time-picker"></div>
  </div>
</div>
{{< /example >}}

## Right to left support

RTL support is built-in and can be explicitly controlled through the `$enable-rtl` variables in scss.

### Hebrew

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-locale="he-IL" data-coreui-placeholder="בחר תאריך" data-coreui-toggle="time-picker" dir="rtl"></div>
  </div>
</div>
{{< /example >}}

### Persian

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-locale="fa-IR" data-coreui-placeholder="تاریخ شروع" data-coreui-toggle="time-picker" dir="rtl"></div>
  </div>
</div>
{{< /example >}}

## Usage

### Via data attributes

Add `data-coreui-toggle="time-picker"` to a `div` element.

```html
<div data-coreui-toggle="time-picker"></div>
```

### Via JavaScript

Call the time picker via JavaScript:

```html
<div class="time-picker"></div>
```

```js
var timePickerElementList = Array.prototype.slice.call(document.querySelectorAll('.time-picker'))
var timePickerList = timePickerElementList.map(function (timePickerEl) {
  return new coreui.TimePicker(timePickerEl)
})
```

### Options

Options can be passed via data attributes or JavaScript. For data attributes, append the option name to `data-coreui-`, as in `data-coreui-cleaner=""`. Make sure to change the case type of the option name from camelCase to kebab-case when passing the options via data attributes. For example, instead of using `data-coreui-inputReadOnly="false"`, use `data-coreui-input-read-only="false"`.

<table class="table">
  <thead>
    <tr>
      <th style="width: 100px;">Name</th>
      <th style="width: 100px;">Type</th>
      <th style="width: 50px;">Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>cancelButtonText</code></td>
      <td>string</td>
      <td><code>'Cancel'</code></td>
      <td>Cancel button text.</td>
    </tr>
    <tr>
      <td><code>cleaner</code></td>
      <td>boolean</td>
      <td><code>true</code></td>
      <td>Enables selection cleaner element.</td>
    </tr>
    <tr>
      <td><code>container</code></td>
      <td>string</td>
      <td><code>'dropdown'</code></td>
      <td>
        <p>Set container type for the component.</p>
        <ul>
          <li><code>'dropdown'</code></li>
          <li><code>'inline'</code></li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td>boolean</td>
      <td><code>false</code></td>
      <td>Toggle the disabled state for the component.</td>
    </tr>
    <tr>
      <td><code>inputReadOnly</code></td>
      <td>boolean</td>
      <td><code>false</code></td>
      <td>Toggle the readonly state for the component.</td>
    </tr>
    <tr>
      <td><code>locale</code></td>
      <td>string</td>
      <td><code>navigator.language</code></td>
      <td>Sets the default locale for components. If not set, it is inherited from the navigator.language.</td>
    </tr>
    <tr>
      <td><code>okButtonText</code></td>
      <td>string</td>
      <td><code>'OK'</code></td>
      <td>Ok button text.</td>
    </tr>
    <tr>
      <td><code>placeholder</code></td>
      <td>string</td>
      <td><code>'Select time'</code></td>
      <td>Specifies a short hint that is visible in the input.</td>
    </tr>
    <tr>
      <td><code>size</code></td>
      <td><code>'sm'</code> | <code>'lg'</code></td>
      <td><code>null</code></td>
      <td>Size the component small or large.</td>
    </tr>
    <tr>
      <td><code>value</code></td>
      <td>date | string | null</td>
      <td><code>null</code></td>
      <td>Default value of the component</td>
    </tr>
    <tr>
      <td><code>variant</code></td>
      <td><code>'inline'</code> | <code>'roll'</code></td>
      <td><code>'roll'</code></td>
      <td>Set the time picker variant to a roll or select.</td>
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
      <td><code>clear</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>reset</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>update</code></td>
      <td>
        Updates the position of an element's dropdown.
      </td>
    </tr>
    <tr>
      <td><code>dispose</code></td>
      <td>
        Destroys an element's dropdown. (Removes stored data on the DOM element)
      </td>
    </tr>
    <tr>
      <td>
        <code>getInstance</code>
      </td>
      <td>
        Static method which allows you to get the dropdown instance associated to a DOM element, you can use it like this: <code>coreui.TimePicker.getInstance(element)</code>
      </td>
    </tr>
    <tr>
      <td>
        <code>getOrCreateInstance</code>
      </td>
      <td>
        Static method which returns a dropdown instance associated to a DOM element or create a new one in case it wasn't initialized.
        You can use it like this: <code>coreui.TimePicker.getOrCreateInstance(element)</code>
      </td>
    </tr>
  </tbody>
</table>

### Events

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
        <code>change.coreui.time-picker</code>
      </td>
      <td>
        Callback fired when the value changed.
      </td>
    </tr>
  </tbody>
</table>

```js
var myTimePicker = document.getElementById('myTimePicker')
myTimePicker.addEventListener('change.coreui.time-picker', function (timeString, localeTimeString, date) {
  // do something...
})
```

## Customizing

### SASS

#### Variables

{{< scss-docs name="time-picker-variables" file="scss/_variables.scss" >}}

### CSS Vars
{{< css-vars-docs file="scss/_time-picker.scss" >}}

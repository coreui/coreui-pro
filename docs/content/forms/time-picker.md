---
layout: docs
title: Time Picker
description: Create consistent cross-browser and cross-device time picker.
group: forms
toc: true
bootstrap: true
pro_component: true
other_frameworks: time-picker
---

## Example

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-locale="en-US" data-coreui-toggle="time-picker" id="timePicker1"></div>
  </div>
  <div class="col-lg-4">
    <div class="time-picker" data-coreui-locale="en-US" data-coreui-time="02:17:35 PM" data-coreui-toggle="time-picker" id="timePicker2"></div>
  </div>
</div>
{{< /example >}}

## Sizing

Set heights using `data-coreui-size` attribute like `data-coreui-size="lg"` and `data-coreui-size="sm"`.

{{< example >}}
<div class="row mb-4">
  <div class="col-lg-5">
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

{{< bootstrap-compatibility >}}

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
const timePickerElementList = Array.prototype.slice.call(document.querySelectorAll('.time-picker'))
const timePickerList = timePickerElementList.map(timePickerEl => {
  return new coreui.TimePicker(timePickerEl)
})
```

### Options

{{< markdown >}}
{{< partial "js-data-attributes.md" >}}
{{< /markdown >}}

{{< bs-table >}}
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `cancelButtonLabel` | string | `'Cancel'` | Cancel button inner HTML |
| `cancelButtonClasses` | array \| string | `['btn', 'btn-sm', 'btn-ghost-primary']` | CSS class names that will be added to the cancel button |
| `cleaner` | boolean | `true` | Enables selection cleaner element. |
| `confirmButtonLabel` | string | `'OK'` | Confirm button inner HTML |
| `confirmButtonClasses` | array \| string | `['btn', 'btn-sm', 'btn-primary']` | CSS class names that will be added to the confirm button |
| `container` | string | `'dropdown'` | <p>Set container type for the component.</p><ul><li>`'dropdown'`</li><li>`'inline'`</li></ul>|
| `disabled` | boolean | `false` | Toggle the disabled state for the component. |
| `indicator` | boolean | `true` | Toggle visibility or set the content of the input indicator. |
| `inputReadOnly` | boolean | `false` | Toggle the readonly state for the component. |
| `invalid` | boolean | `false` | Toggle the invalid state for the component. |
| `locale` | string | `'default'` | Sets the default locale for components. If not set, it is inherited from the navigator.language. |
| `name` | string | `null` | Set the name attribute for the input element. |
| `placeholder` | string | `'Select time'` | Specifies a short hint that is visible in the input. |
| `size` | `'sm'` \| `'lg'` | `null` | Size the component small or large. |
| `time` | date \| string \| null | `null` | Default value of the component |
| `valid` | boolean | `false` | Toggle the valid state for the component. |
| `variant` | `'inline'` \| `'roll'` | `'roll'` | Set the time picker variant to a roll or select. |
{{< /bs-table >}}
### Methods

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `clear` | Clear selection of the time picker. |
| `reset` | Reset selection of the time picker to the initial value. |
| `update` | Updates the configuration of the time picker. |
| `dispose` | Destroys a component. (Removes stored data on the DOM element) |
| `getInstance` | Static method which allows you to get the time picker instance associated to a DOM element, you can use it like this: `coreui.TimePicker.getInstance(element)` |
| `getOrCreateInstance` | Static method which returns a time picker instance associated to a DOM element or create a new one in case it wasn't initialized.  You can use it like this: `coreui.TimePicker.getOrCreateInstance(element)` |
{{< /bs-table >}}

### Events

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `timeChange.coreui.time-picker` | Callback fired when the value changed. |
| `show.coreui.time-picker` | Fires immediately when the show instance method is called. |
| `shown.coreui.time-picker` | Fired when the dropdown has been made visible to the user and CSS transitions have completed. |
| `hide.coreui.time-picker` | Fires immediately when the hide instance method has been called. |
| `hidden.coreui.time-picker` | Fired when the dropdown has finished being hidden from the user and CSS transitions have completed. |
{{< /bs-table >}}

```js
const myTimePicker = document.getElementById('myTimePicker')
myTimePicker.addEventListener('timeChange.coreui.time-picker', (timeString, localeTimeString, date) => {
  // do something...
})
```

## Customizing

### CSS variables

TimePickers use local CSS variables on `.time-picker` for enhanced real-time customization. Values for the CSS variables are set via Sass, so Sass customization is still supported, too.

{{< scss-docs name="time-picker-css-vars" file="scss/_time-picker.scss" >}}

### SASS variables

{{< scss-docs name="time-picker-variables" file="scss/_variables.scss" >}}

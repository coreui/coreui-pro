---
layout: docs
title: Date Picker
description: Create consistent cross-browser and cross-device time picker.
group: forms
toc: true
---

## Example

{{< example >}}
  <div class="row">
    <div class="col-lg-4">
      <div data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
    </div>
    <div class="col-lg-4">
      <div data-coreui-date="2023/03/15" data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
    </div>
  </div>
{{< /example >}}

### With footer

{{< example >}}
  <div class="row">
    <div class="col-lg-4">
      <div data-coreui-footer="true" data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
    </div>
    <div class="col-lg-4">
      <div data-coreui-date="2023/03/15" data-coreui-footer="true" data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
    </div>
  </div>
{{< /example >}}

### With timepicker

{{< example >}}
  <div class="row">
    <div class="col-lg-4">
      <div data-coreui-locale="en-US" data-coreui-timepicker="true" data-coreui-toggle="date-picker"></div>
    </div>
    <div class="col-lg-4">
      <div data-coreui-date="2023/03/15 02:22:13 PM" data-coreui-locale="en-US" data-coreui-timepicker="true" data-coreui-toggle="date-picker"></div>
    </div>
  </div>
{{< /example >}}

## Sizing

Set heights using `data-coreui-size` attribute like `data-coreui-size="lg"` and `data-coreui-size="sm"`.

{{< example >}}
<div class="row mb-4">
  <div class="col-lg-5">
    <div data-coreui-locale="en-US" data-coreui-size="lg" data-coreui-toggle="date-picker"></div>
  </div>
</div>
<div class="row">
  <div class="col-lg-4">
    <div data-coreui-locale="en-US" data-coreui-size="sm" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

## Disabled

Add the `data-coreui-disabled="true"` attribute on an input to give it a grayed out appearance and remove pointer events.

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div data-coreui-disabled="true" data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

## Readonly

Add the `data-coreui-input-read-only="true"` boolean attribute to prevent modification of the input's value.

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div data-coreui-input-read-only="true" data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

## Disabled dates

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div id="myDatePickerDisabledDates"></div>
  </div>
</div>
{{< /example >}}

```js
const options = {
  locale: 'en-US',
  calendarDate: new Date(2022, 2, 1),
  disabledDates: [
    [new Date(2022, 2, 4), new Date(2022, 2, 7)],
    new Date(2022, 2, 16),
    new Date(2022, 3, 16),
    [new Date(2022, 4, 2), new Date(2022, 4, 8)]
  ],
  maxDate: new Date(2022, 5, 0),
  minDate: new Date(2022, 1, 1)
}

const myDatePickerDisabledDates = new coreui.DatePicker(document.getElementById('myDatePickerDisabledDates'), options)
```

## Non-english locale

### Auto

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

### Chinese

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div data-coreui-locale="zh-CN" data-coreui-placeholder="入住日期" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

### Japanese

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div data-coreui-locale="ja" data-coreui-placeholder="日付を選択" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

### Korean

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div data-coreui-locale="ko" data-coreui-placeholder="날짜 선택" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

## Right to left support

RTL support is built-in and can be explicitly controlled through the `$enable-rtl` variables in scss.

### Hebrew

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div data-coreui-locale="he-IL" data-coreui-placeholder="בחר תאריך" data-coreui-toggle="date-picker" dir="rtl"></div>
  </div>
</div>
{{< /example >}}

### Persian

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div data-coreui-locale="fa-IR" data-coreui-placeholder="تاریخ شروع" data-coreui-toggle="date-picker" dir="rtl"></div>
  </div>
</div>
{{< /example >}}

## Usage

### Via data attributes

Add `data-coreui-toggle="date-picker"` to a `div` element.

```html
<div data-coreui-toggle="date-picker"></div>
```

### Via JavaScript

Call the time picker via JavaScript:

```html
<div class="date-picker"></div>
```

```js
const datePickerElementList = Array.prototype.slice.call(document.querySelectorAll('.date-picker'))
const datePickerList = datePickerElementList.map(datePickerEl => {
  return new coreui.DatePicker(datePickerEl)
})
```

### Options

{{< markdown >}}
{{< partial "js-data-attributes.md" >}}
{{< /markdown >}}

{{< bs-table >}}
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `calendarDate` | date \| string \| null | `null` | Default date of the component. |
| `cancelButtonLabel` | string | `'Cancel'` | Cancel button inner HTML |
| `cancelButtonClasses` | array \| string | `['btn', 'btn-sm', 'btn-ghost-primary']` | CSS class names that will be added to the cancel button |
| `cleaner` | boolean | `true` | Enables selection cleaner element. |
| `date` | date \| string \| null | `null` | Initial selected date. |
| `confirmButtonLabel` | string | `'OK'` | Confirm button inner HTML |
| `confirmButtonClasses` | array \| string | `['btn', 'btn-sm', 'btn-primary']` | CSS class names that will be added to the confirm button |
| `date` | date \| string \| null | `null` | Default value of the component |
| `disabled` | boolean | `false` | Toggle the disabled state for the component. |
| `disabledDates` | array | null | `null` | Specify the list of dates that cannot be selected. |
| `firstDayOfWeek` | number | `1` | <p>Sets the day of start week.</p><ul><li>`0` - Sunday</li><li>`1` - Monday</li><li>`2` - Tuesday</li><li>`3` - Wednesday</li><li>`4` - Thursday</li><li>`5` - Friday</li><li>`6` - Saturday</li></ul> |
| `footer` | boolean | `false` | Toggle visibility of footer element. |
| `format` | string | | Set date format. We use date-fns to format dates. Visit <a href="https://date-fns.org/v2.28.0/docs/format" target="_blank" rel="nofollow">https://date-fns.org/v2.28.0/docs/format</a> to check accepted patterns. |
| `indicator` | boolean | `true` | Toggle visibility or set the content of the input indicator. |
| `inputReadOnly` | boolean | `false` | Toggle the readonly state for the component. |
| `locale` | string | `'default'` | Sets the default locale for components. If not set, it is inherited from the navigator.language. |
| `maxDate` | date \| string \| null | `null` | Max selectable date. |
| `minDate` | date \| string \| null | `null` | Min selectable date. |
| `placeholder` | string | `'Select time'` | Specifies a short hint that is visible in the input. |
| `size` | `'sm'` \| `'lg'` | `null` | Size the component small or large. |
| `timepicker` | boolean | `false` | Provide an additional time selection by adding select boxes to choose times. |
| `todayButton` | string | `'Today'` | Today button inner HTML |
| `todayButtonClasses` | array \| string | `['btn', 'btn-sm', 'me-2']` | CSS class names that will be added to the today button |
| `weekdayFormat` | number \| 'long' \| 'narrow' \| 'short' | `2` | Set length or format of day name. |
{{< /bs-table >}}

### Methods

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `clear` | Clear selection of the date picker. |
| `reset` | Reset selection of the date picker to the initial value. |
| `update` | Updates the configuration of the date picker.|
| `dispose` | Destroys a component. (Removes stored data on the DOM element)|
| `getInstance` | Static method which allows you to get the date picker instance associated to a DOM element, you can use it like this: `coreui.DatePicker.getInstance(element)` |
| `getOrCreateInstance` | Static method which returns a date picker instance associated to a DOM element or create a new one in case it wasn't initialized. You can use it like this: `coreui.DatePicker.getOrCreateInstance(element)` |
{{< /bs-table >}}

### Events

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `dateChange.coreui.date-picker` | Callback fired when the date changed. |
{{< /bs-table >}}

```js
const myDatePicker = document.getElementById('myDatePicker')
myDatePicker.addEventListener('dateChange.coreui.date-picker', date => {
  // do something...
})
```

## Customizing

### CSS variables

DatePickers use local CSS variables on `.date-picker` and `.calendar` for enhanced real-time customization. Values for the CSS variables are set via Sass, so Sass customization is still supported, too.

{{< scss-docs name="date-picker-css-vars" file="scss/_date-picker.scss" >}}

{{< scss-docs name="calendar-css-vars" file="scss/_calendar.scss" >}}

### SASS variables

{{< scss-docs name="date-picker-variables" file="scss/_variables.scss" >}}

{{< scss-docs name="calendar-variables" file="scss/_variables.scss" >}}

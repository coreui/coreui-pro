---
layout: docs
title: Date Picker
description: Give your forms some structure—from inline to horizontal to custom grid implementations—with our form layout options.
group: forms
toc: true
---

## Example

{{< example >}}
  <div class="row mb-4">
    <div class="col-lg-4">
      <div data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
    </div>
  </div>
{{< /example >}}

### With timepicker

{{< example >}}
  <div class="row mb-4">
    <div class="col-lg-7">
      <div data-coreui-locale="en-US" data-coreui-timepicker="true" data-coreui-toggle="date-picker"></div>
    </div>
  </div>
{{< /example >}}

## Sizing

Set heights using `size` property like `size="lg"` and `size="sm"`.

{{< example >}}
<div class="row mb-4">
  <div class="col-lg-4">
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

Add the `disabled` boolean attribute on an input to give it a grayed out appearance and remove pointer events.

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div data-coreui-disabled="true" data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

## Readonly

Add the `inputReadOnly` boolean attribute to prevent modification of the input's value.

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
var options = {
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

var myDatePickerDisabledDates = new coreui.DatePicker(document.getElementById('myDatePickerDisabledDates'), options)
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


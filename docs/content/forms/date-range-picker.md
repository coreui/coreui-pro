---
layout: docs
title: Date Range Picker
description: Create consistent cross-browser and cross-device date range picker.
group: forms
toc: true
---

## Installation

This component is part of the CoreUI LAB. If you want to use Date Range Picker component you have to install **next** version of the `@coreui/coreui-pro@next` package. The LAB is the place where we release components that are actively developed and will be included in future releases of `@coreui/coreui-pro`.

```sh
npm install @coreui/coreui-pro@next
```

## Example

{{< example >}}
  <div class="row">
    <div class="col-lg-5">
      <div data-coreui-locale="en-US" data-coreui-toggle="date-range-picker"></div>
    </div>
    <div class="col-lg-5">
      <div
        data-coreui-start-date="2022/08/03"
        data-coreui-end-date="2022/08/17"
        data-coreui-locale="en-US"
        data-coreui-toggle="date-range-picker">
      </div>
    </div>
  </div>
{{< /example >}}

### With footer

{{< example >}}
  <div class="row mb-4">
    <div class="col-lg-7">
      <div
        data-coreui-footer="true"
        data-coreui-locale="en-US"
        data-coreui-toggle="date-range-picker">
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-lg-7">
      <div
        data-coreui-start-date="2022/08/03"
        data-coreui-end-date="2022/09/17"
        data-coreui-footer="true"
        data-coreui-locale="en-US"
        data-coreui-toggle="date-range-picker">
      </div>
    </div>
  </div>
{{< /example >}}

### With timepicker

{{< example >}}
  <div class="row mb-4">
    <div class="col-lg-7">
      <div
        data-coreui-locale="en-US"
        data-coreui-timepicker="true"
        data-coreui-toggle="date-range-picker">
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-lg-7">
      <div
        data-coreui-start-date="2022/08/03 02:34:17 AM"
        data-coreui-end-date="2022/09/17 11:29:41 PM"
        data-coreui-locale="en-US"
        data-coreui-timepicker="true"
        data-coreui-toggle="date-range-picker">
      </div>
    </div>
  </div>
{{< /example >}}

## Sizing

Set heights using `data-coreui-size` attribute like `data-coreui-size="lg"` and `data-coreui-size="sm"`.

{{< example >}}
<div class="row mb-4">
  <div class="col-lg-6">
    <div data-coreui-locale="en-US" data-coreui-size="lg" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-locale="en-US" data-coreui-size="sm" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

## Disabled

Add the `data-coreui-disabled="true"` attribute on an input to give it a grayed out appearance and remove pointer events.

{{< example >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-disabled="true" data-coreui-locale="en-US" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

## Readonly

Add the `data-coreui-input-read-only="true"` boolean attribute to prevent modification of the input's value.

{{< example >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-input-read-only="true" data-coreui-locale="en-US" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

## Disabled dates

{{< example >}}
<div class="row">
  <div class="col-lg-5">
    <div id="myDateRangePickerDisabledDates"></div>
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

var myDateRangePickerDisabledDates = new coreui.DateRangePicker(document.getElementById('myDateRangePickerDisabledDates'), options)
```

## Custom ranges

{{< example >}}
<div class="row">
  <div class="col-lg-5">
    <div id="myDateRangePickerCustomRanges"></div>
  </div>
</div>
{{< /example >}}

```js
var optionsCustomRanges = {
  locale: 'en-US',
  ranges: {
    Today: [new Date(), new Date()],
    Yesterday: [
      new Date(new Date().setDate(new Date().getDate() - 1)),
      new Date(new Date().setDate(new Date().getDate() - 1)),
    ],
    'Last 7 Days': [
      new Date(new Date().setDate(new Date().getDate() - 6)),
      new Date(new Date()),
    ],
    'Last 30 Days': [
      new Date(new Date().setDate(new Date().getDate() - 29)),
      new Date(new Date()),
    ],
    'This Month': [
      new Date(new Date().setDate(1)),
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    ],
    'Last Month': [
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      new Date(new Date().getFullYear(), new Date().getMonth(), 0),
    ]
  }
}

var myDateRangePickerCustomRanges = new coreui.DateRangePicker(document.getElementById('myDateRangePickerCustomRanges'), optionsCustomRanges)
```

## Non-english locale

### Auto

{{< example >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

### Chinese

{{< example >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-locale="zh-CN" data-coreui-placeholder="入住日期,退房日期" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

### Japanese

{{< example >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-locale="ja" data-coreui-placeholder="日付を選択,終了日" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

### Korean

{{< example >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-locale="ko" data-coreui-placeholder="날짜 선택,종료일" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

## Right to left support

RTL support is built-in and can be explicitly controlled through the `$enable-rtl` variables in scss.

### Hebrew

{{< example >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-locale="he-IL" data-coreui-placeholder="בחר תאריך,תאריך סיום" data-coreui-toggle="date-range-picker" dir="rtl"></div>
  </div>
</div>
{{< /example >}}

### Persian

{{< example >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-locale="fa-IR" data-coreui-placeholder="تاریخ شروع,تاریخ پایان" data-coreui-toggle="date-range-picker" dir="rtl"></div>
  </div>
</div>
{{< /example >}}

## Usage

### Via data attributes

Add `data-coreui-toggle="date-range-picker"` to a `div` element.

```html
<div data-coreui-toggle="date-range-picker"></div>
```

### Via JavaScript

Call the time picker via JavaScript:

```html
<div class="date-range-picker"></div>
```

```js
var dateRangePickerElementList = Array.prototype.slice.call(document.querySelectorAll('.date-range-picker'))
var dateRangePickerList = dateRangePickerElementList.map(function (dateRangePickerEl) {
  return new coreui.DateRangePicker(dateRangePickerEl)
})
```

### Options

Options can be passed via data attributes or JavaScript. For data attributes, append the option name to `data-coreui-`, as in `data-coreui-cleaner=""`. Make sure to change the case type of the option name from camelCase to kebab-case when passing the options via data attributes. For example, instead of using `data-coreui-inputReadOnly="false"`, use `data-coreui-input-read-only="false"`.

<div class="table-responsive">
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
        <td><code>calendarDate</code></td>
        <td>date | string | null</td>
        <td><code>null</code></td>
        <td>Default date of the component.</td>
      </tr>
      <tr>
        <td><code>calendars</code></td>
        <td>number</td>
        <td><code>2</code></td>
        <td>The number of calendars that render on desktop devices.</td>
      </tr>
      <tr>
        <td><code>cancelButton</code></td>
        <td>string</td>
        <td><code>'Cancel'</code></td>
        <td>Cancel button inner HTML</td>
      </tr>
      <tr>
        <td><code>cancelButtonClasses</code></td>
        <td>array | string</td>
        <td><code>['btn', 'btn-sm', 'btn-ghost-primary']</code></td>
        <td>CSS class names that will be added to the cancel button</td>
      </tr>
      <tr>
        <td><code>cleaner</code></td>
        <td>boolean</td>
        <td><code>true</code></td>
        <td>Enables selection cleaner element.</td>
      </tr>
      <tr>
        <td><code>confirmButton</code></td>
        <td>string</td>
        <td><code>'OK'</code></td>
        <td>Confirm button inner HTML</td>
      </tr>
      <tr>
        <td><code>confirmButtonClasses</code></td>
        <td>array | string</td>
        <td><code>['btn', 'btn-sm', 'btn-primary']</code></td>
        <td>CSS class names that will be added to the confirm button</td>
      </tr>
      <tr>
        <td><code>disabled</code></td>
        <td>boolean</td>
        <td><code>false</code></td>
        <td>Toggle the disabled state for the component.</td>
      </tr>
      <tr>
        <td><code>disabledDates</code></td>
        <td>array | null</td>
        <td><code>null</code></td>
        <td>Specify the list of dates that cannot be selected.</td>
      </tr>
      <tr>
        <td><code>endDate</code></td>
        <td>date | string | null</td>
        <td><code>null</code></td>
        <td>Initial selected to date (range).</td>
      </tr>
      <tr>
        <td><code>firstDayOfWeek</code></td>
        <td>number</td>
        <td><code>1</code></td>
        <td>
          <p>Sets the day of start week.</p>
          <ul>
            <li><code>0</code> - Sunday</li>
            <li><code>1</code> - Monday</li>
            <li><code>2</code> - Tuesday</li>
            <li><code>3</code> - Wednesday</li>
            <li><code>4</code> - Thursday</li>
            <li><code>5</code> - Friday</li>
            <li><code>6</code> - Saturday</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td><code>footer</code></td>
        <td>boolean</td>
        <td><code>false</code></td>
        <td>Toggle visibility of footer element.</td>
      </tr>
      <tr>
        <td><code>format</code></td>
        <td>string</td>
        <td></td>
        <td>Set date format. We use date-fns to format dates. Visit <a href="https://date-fns.org/v2.28.0/docs/format" target="_blank" rel="nofollow">https://date-fns.org/v2.28.0/docs/format</a> to check accepted patterns.</td>
      </tr>
      <tr>
        <td><code>indicator</code></td>
        <td>boolean</td>
        <td><code>true</code></td>
        <td>Toggle visibility or set the content of the input indicator.</td>
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
        <td><code>'default'</code></td>
        <td>Sets the default locale for components. If not set, it is inherited from the navigator.language.</td>
      </tr>
      <tr>
        <td><code>maxDate</code></td>
        <td>date | string | null</td>
        <td><code>null</code></td>
        <td>Max selectable date.</td>
      </tr>
      <tr>
        <td><code>minDate</code></td>
        <td>date | string | null</td>
        <td><code>null</code></td>
        <td>Min selectable date.</td>
      </tr>
      <tr>
        <td><code>placeholder</code></td>
        <td>string</td>
        <td><code>['Start date', 'End date']</code></td>
        <td>Specifies a short hint that is visible in the input.</td>
      </tr>
      <tr>
        <td><code>ranges</code></td>
        <td>object</td>
        <td><code>{}</code></td>
        <td>Predefined date ranges the user can select from.</td>
      </tr>
      <tr>
        <td><code>rangesButtonsClasses</code></td>
        <td>array | string</td>
        <td><code>['btn', 'btn-ghost-secondary']</code></td>
        <td>CSS class names that will be added to ranges buttons</td>
      </tr>
      <tr>
        <td><code>separator</code></td>
        <td>boolean</td>
        <td><code>true</code></td>
        <td>Toggle visibility or set the content of the inputs separator.</td>
      </tr>
      <tr>
        <td><code>size</code></td>
        <td><code>'sm'</code> | <code>'lg'</code></td>
        <td><code>null</code></td>
        <td>Size the component small or large.</td>
      </tr>
      <tr>
        <td><code>startDate</code></td>
        <td>date | string | null</td>
        <td><code>null</code></td>
        <td>Initial selected date.</td>
      </tr>
      <tr>
        <td><code>timepicker</code></td>
        <td>boolean</td>
        <td><code>false</code></td>
        <td>Provide an additional time selection by adding select boxes to choose times.</td>
      </tr>
      <tr>
        <td><code>todayButton</code></td>
        <td>string</td>
        <td><code>'Today'</code></td>
        <td>Today button inner HTML</td>
      </tr>
      <tr>
        <td><code>todayButtonClasses</code></td>
        <td>array | string</td>
        <td><code>['btn', 'btn-sm', 'me-2']</code></td>
        <td>CSS class names that will be added to the today button</td>
      </tr>
      <tr>
        <td><code>weekdayFormat</code></td>
        <td>number | 'long' | 'narrow' | 'short'</td>
        <td><code>2</code></td>
        <td>Set length or format of day name.</td>
      </tr>
    </tbody>
  </table>
</div>

### Methods

<div class="table-responsive">
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
        <td>Clear selection of the date range picker.</td>
      </tr>
      <tr>
        <td><code>reset</code></td>
        <td>Reset selection of the date range picker to the initial value.</td>
      </tr>
      <tr>
        <td><code>update</code></td>
        <td>
          Updates the configuration of the date range picker.
        </td>
      </tr>
      <tr>
        <td><code>dispose</code></td>
        <td>
          Destroys a component. (Removes stored data on the DOM element)
        </td>
      </tr>
      <tr>
        <td>
          <code>getInstance</code>
        </td>
        <td>
          Static method which allows you to get the date range picker instance associated to a DOM element, you can use it like this: <code>coreui.DateRangePicker.getInstance(element)</code>
        </td>
      </tr>
      <tr>
        <td>
          <code>getOrCreateInstance</code>
        </td>
        <td>
          Static method which returns a date range picker instance associated to a DOM element or create a new one in case it wasn't initialized.
          You can use it like this: <code>coreui.DateRangePicker.getOrCreateInstance(element)</code>
        </td>
      </tr>
    </tbody>
  </table>
</div>

### Events

<div class="table-responsive">
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
          <code>endDateChange.coreui.date-range-picker</code>
        </td>
        <td>
          Callback fired when the end date changed.
        </td>
      </tr>
      <tr>
        <td>
          <code>startDateChange.coreui.date-range-picker</code>
        </td>
        <td>
          Callback fired when the start date changed.
        </td>
      </tr>
    </tbody>
  </table>
</div>

```js
var myDateRangePicker = document.getElementById('myDateRangePicker')
myDateRangePicker.addEventListener('endDateChange.coreui.date-range-picker', function (date) {
  // do something...
})
```

## Customizing

### SASS

#### Variables

{{< scss-docs name="date-picker-variables" file="scss/_variables.scss" >}}

### CSS Vars
{{< css-vars-docs file="scss/_date-picker.scss" >}}

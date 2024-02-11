---
layout: docs
title: Date Picker
description: Create consistent cross-browser and cross-device time picker.
group: forms
toc: true
bootstrap: true
pro_component: true
other_frameworks: date-picker
dayjs: true
---

## Example

### Days

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

#### With footer

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

#### With timepicker

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

### Weeks

{{< example >}}
  <div class="row">
    <div class="col-lg-5">
      <div 
        data-coreui-locale="en-US"
        data-coreui-toggle="date-picker"
        data-coreui-show-week-number="true"
        data-coreui-selection-type="week">
      </div>
    </div>
    <div class="col-lg-5">
      <div
        data-coreui-date="2025W07"
        data-coreui-locale="en-US"
        data-coreui-toggle="date-picker"
        data-coreui-show-week-number="true"
        data-coreui-selection-type="week">
      </div>
    </div>
  </div>
{{< /example >}}

### Months

{{< example >}}
  <div class="row">
    <div class="col-lg-5">
      <div 
        data-coreui-locale="en-US"
        data-coreui-toggle="date-picker"
        data-coreui-selection-type="month">
      </div>
    </div>
    <div class="col-lg-5">
      <div
        data-coreui-date="2022-8"
        data-coreui-locale="en-US"
        data-coreui-toggle="date-picker"
        data-coreui-selection-type="month">
      </div>
    </div>
  </div>
{{< /example >}}

### Years

{{< example >}}
  <div class="row">
    <div class="col-lg-5">
      <div
        data-coreui-locale="en-US"
        data-coreui-toggle="date-picker"
        data-coreui-selection-type="year">
      </div>
    </div>
    <div class="col-lg-5">
      <div
        data-coreui-date="2022"
        data-coreui-locale="en-US"
        data-coreui-toggle="date-picker"
        data-coreui-selection-type="year">
      </div>
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

{{< js-docs name="date-picker-disabled-dates" file="docs/assets/js/snippets.js" >}}

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
<div class="row" dir="rtl">
  <div class="col-lg-4">
    <div data-coreui-locale="he-IL" data-coreui-placeholder="בחר תאריך" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

### Persian

{{< example >}}
<div class="row" dir="rtl">
  <div class="col-lg-4">
    <div data-coreui-locale="fa-IR" data-coreui-placeholder="تاریخ شروع" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

## Custom formats

As of v5.0.0, the `format` property is removed in Date Picker. Instead, utilize the `inputDateFormat` to format dates into custom strings and `inputDateParse` to parse custom strings into Date objects.

The provided code demonstrates how to use the `inputDateFormat` and `inputDateParse` properties. In this example, we use the `dayjs` library to format and parse dates.

The `inputDateFormat` property formats the date into a custom string, while the `inputDateParse` property parses a custom string into a Date object. The code showcases the date range in different formats based on locale, such as 'MMMM DD, YYYY' and 'YYYY MMMM DD', and accommodates different locales, like 'en-US' and 'es-ES'.


{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div id="myDatePickerCustomFormats1"></div>
  </div>
</div>
{{< /example >}}

```html
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/customParseFormat.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/locale/en.js"></script>
```

{{< js-docs name="date-picker-custom-formats1" file="docs/assets/js/snippets.js" >}}

To use localized dates, we need to additionally add locale files, in this case, Spanish:

{{< example >}}
<div class="row">
  <div class="col-lg-4">
    <div id="myDatePickerCustomFormats2"></div>
  </div>
</div>
{{< /example >}}

```html
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/customParseFormat.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/locale/es.js"></script>
```

{{< js-docs name="date-picker-custom-formats2" file="docs/assets/js/snippets.js" >}}

## Usage

{{< bootstrap-compatibility >}}

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
| `indicator` | boolean | `true` | Toggle visibility or set the content of the input indicator. |
| `inputDateFormat` | function | `null` | Custom function to format the selected date into a string according to a custom format. |
| `inputDateParse` | function | `null` | Custom function to parse the input value into a valid Date object. |
| `inputReadOnly` | boolean | `false` | Toggle the readonly state for the component. |
| `invalid` | boolean | `false` | Toggle the invalid state for the component. |
| `locale` | string | `'default'` | Sets the default locale for components. If not set, it is inherited from the navigator.language. |
| `maxDate` | date \| string \| null | `null` | Max selectable date. |
| `minDate` | date \| string \| null | `null` | Min selectable date. |
| `name` | string | `null` | Set the name attribute for the input element. |
| `placeholder` | string | `'Select time'` | Specifies a short hint that is visible in the input. |
| `selectAdjacementDays` | boolean | `false` | Set whether days in adjacent months shown before or after the current month are selectable. This only applies if the `showAdjacementDays` option is set to true. |
| `selectionType` | `'day'` \| `'week'` \| `'month'` \| `'year'` | `day` | Specify the type of date selection as day, week, month, or year. |
| `showAdjacementDays` | boolean | `true` | Set whether to display dates in adjacent months (non-selectable) at the start and end of the current month. |
| `showWeekNumber` | boolean | `false` | Set whether to display week numbers in the calendar. |
| `size` | `'sm'` \| `'lg'` | `null` | Size the component small or large. |
| `timepicker` | boolean | `false` | Provide an additional time selection by adding select boxes to choose times. |
| `todayButton` | string | `'Today'` | Today button inner HTML |
| `todayButtonClasses` | array \| string | `['btn', 'btn-sm', 'me-2']` | CSS class names that will be added to the today button |
| `valid` | boolean | `false` | Toggle the valid state for the component. |
| `weekdayFormat` | number \| 'long' \| 'narrow' \| 'short' | `2` | Set length or format of day name. |
| `weekNumbersLabel` | string | `null` | Label displayed over week numbers in the calendar. |
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
| `show.coreui.date-picker` | Fires immediately when the show instance method is called. |
| `shown.coreui.date-picker` | Fired when the calendar has been made visible to the user and CSS transitions have completed. |
| `hide.coreui.date-picker` | Fires immediately when the hide instance method has been called. |
| `hidden.coreui.date-picker` | Fired when the calendar has finished being hidden from the user and CSS transitions have completed. |
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

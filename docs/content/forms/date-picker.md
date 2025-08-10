---
layout: docs
title: Date Picker
description: Bootstrap Date Picker is a customizable, user-friendly, cross-browser calendar tool for Bootstrap forms, supporting localization and validation for accurate date selection.
group: forms
toc: true
bootstrap: true
pro_component: true
other_frameworks: date-picker
dayjs: true
---

## Example

Below is an example of a basic Bootstrap DatePicker.

### Days

The following examples demonstrating how to pick dates using the Bootstrap Date Picker Component.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-sm-6 col-lg-5 mb-3 mb-sm-0">
    <div data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
  </div>
  <div class="col-sm-6 col-lg-5">
    <div data-coreui-date="2023/03/15" data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

#### With timepicker

In addition to supporting date selection, our Bootstrap Date Picker component also includes a Time Picker feature, allowing users to select a specific time of day. Bootstrap Time Picker can be enabled by adding `data-coreui-timepicker="true"`.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-sm-6 col-lg-5 mb-3 mb-sm-0">
    <div data-coreui-locale="en-US" data-coreui-timepicker="true" data-coreui-toggle="date-picker"></div>
  </div>
  <div class="col-sm-6 col-lg-5">
    <div data-coreui-date="2023/03/15 02:22:13 PM" data-coreui-locale="en-US" data-coreui-timepicker="true" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

#### With footer

To add a footer, use `data-coreui-footer="true"`. The footer can display extra information or actions related to the selected date, such as buttons for "Today" or "Clear".

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-sm-6 col-lg-5 mb-3 mb-sm-0">
    <div data-coreui-footer="true" data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
  </div>
  <div class="col-sm-6 col-lg-5">
    <div data-coreui-date="2023/03/15" data-coreui-footer="true" data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

### Weeks

If you want to select the week number, add the `data-coreui-selection-type="week"` attribute. You can also use `data-coreui-show-week-number="true"` to show week numbers.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-sm-6 col-lg-5 mb-3 mb-sm-0">
    <div 
      data-coreui-locale="en-US"
      data-coreui-toggle="date-picker"
      data-coreui-show-week-number="true"
      data-coreui-selection-type="week">
    </div>
  </div>
  <div class="col-sm-6 col-lg-5">
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

Selecting whole month by adding the `data-coreui-selection-type="month"` attribute.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-sm-6 col-lg-5 mb-3 mb-sm-0">
    <div 
      data-coreui-locale="en-US"
      data-coreui-toggle="date-picker"
      data-coreui-selection-type="month">
    </div>
  </div>
  <div class="col-sm-6 col-lg-5">
    <div
      data-coreui-date="2022-08"
      data-coreui-locale="en-US"
      data-coreui-toggle="date-picker"
      data-coreui-selection-type="month">
    </div>
  </div>
</div>
{{< /example >}}

### Years

Add the `data-coreui-selection-type="year"` attribute to allow pick years.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-sm-6 col-lg-5 mb-3 mb-sm-0">
    <div
      data-coreui-locale="en-US"
      data-coreui-toggle="date-picker"
      data-coreui-selection-type="year">
    </div>
  </div>
  <div class="col-sm-6 col-lg-5">
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

{{< example stackblitz_pro="true" >}}
<div class="row mb-3">
  <div class="col-lg-5">
    <div data-coreui-locale="en-US" data-coreui-size="lg" data-coreui-toggle="date-picker"></div>
  </div>
</div>
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-locale="en-US" data-coreui-size="sm" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

## Disabled

Add the `data-coreui-disabled="true"` attribute on an input to give it a grayed out appearance and remove pointer events.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-disabled="true" data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

## Readonly

Add the `data-coreui-input-read-only="true"` boolean attribute to prevent modification of the input's value.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-input-read-only="true" data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

## Preview date on hover

By default, the date picker shows a live preview in the input field when hovering over calendar dates. To disable this feature, set `data-coreui-preview-date-on-hover="false"`.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-sm-6 col-lg-5 mb-3 mb-sm-0">
    <label class="form-label">With preview (default)</label>
    <div data-coreui-locale="en-US" data-coreui-toggle="date-picker"></div>
  </div>
  <div class="col-sm-6 col-lg-5">
    <label class="form-label">Without preview</label>
    <div data-coreui-locale="en-US" data-coreui-preview-date-on-hover="false" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

## Disabled dates

The CoreUI Bootstrap DatePicker component allows you to disable certain dates, such as weekends or holidays. You can accomplish this by passing the `disabledDates` option to the component, which determines which dates should be disabled based on custom logic.

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div class="row">
  <div class="col-lg-5">
    <div id="myDatePickerDisabledDates"></div>
  </div>
</div>
{{< /example >}}

{{< js-docs name="date-picker-disabled-dates" file="docs/assets/js/partials/snippets.js" >}}

### Disabling weekends

You can disable weekends by passing a function to the `disabledDates` option. Here's how to do it:

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div class="row">
  <div class="col-lg-5">
    <div id="myDatePickerDisabledDates2"></div>
  </div>
</div>
{{< /example >}}

{{< js-docs name="date-picker-disabled-dates2" file="docs/assets/js/partials/snippets.js" >}}

## Non-english locale

CoreUI Date Picker allows users to display dates and times in a non-English locale. This is useful for applications with international users or that need to support multiple languages. 

### Auto

By default, the DatePicker component uses the default browser locale, but it can be easily configured to use a different locale supported by the JavaScript Internationalization API. To set the locale, you can pass the desired language code as a prop to the DatePicker component. This feature enables the creation of more inclusive and accessible applications that cater to a diverse audience.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

### Chinese

Here is an example of a simple Bootstrap Date Picker with Chinese locales.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-locale="zh-CN" data-coreui-placeholder="入住日期" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

### Japanese

Here is a basic Date Picker with Japanese locales.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-locale="ja" data-coreui-placeholder="日付を選択" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

### Korean

Take a look at the following example, which demonstrates a simple date picker designed to work with Korean locales.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-lg-5">
    <div data-coreui-locale="ko" data-coreui-placeholder="날짜 선택" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

## Right to left support

RTL support is built-in and can be explicitly controlled through the `$enable-rtl` variables in scss.

### Hebrew

{{< example stackblitz_pro="true" >}}
<div class="row" dir="rtl">
  <div class="col-lg-5">
    <div data-coreui-locale="he-IL" data-coreui-placeholder="בחר תאריך" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

### Persian

{{< example stackblitz_pro="true" >}}
<div class="row" dir="rtl">
  <div class="col-lg-5">
    <div data-coreui-locale="fa-IR" data-coreui-placeholder="تاریخ شروع" data-coreui-toggle="date-picker"></div>
  </div>
</div>
{{< /example >}}

## Custom formats

As of v5.0.0, the `format` property is removed in Date Picker. Instead, utilize the `inputDateFormat` to format dates into custom strings and `inputDateParse` to parse custom strings into Date objects.

The provided code demonstrates how to use the `inputDateFormat` and `inputDateParse` properties. In this example, we use the `dayjs` library to format and parse dates.

The `inputDateFormat` property formats the date into a custom string, while the `inputDateParse` property parses a custom string into a Date object. The code showcases the date range in different formats based on locale, such as 'MMMM DD, YYYY' and 'YYYY MMMM DD', and accommodates different locales, like 'en-US' and 'es-ES'.


{{< example stackblitz_pro="true" stackblitz_dayjs="true" stackblitz_add_js="true">}}
<div class="row">
  <div class="col-lg-5">
    <div id="myDatePickerCustomFormats1"></div>
  </div>
</div>
{{< /example >}}

```html
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/customParseFormat.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/locale/en.js"></script>
```

{{< js-docs name="date-picker-custom-formats1" file="docs/assets/js/partials/snippets.js" >}}

To use localized dates, we need to additionally add locale files, in this case, Spanish:

{{< example stackblitz_pro="true" stackblitz_dayjs="true" stackblitz_add_js="true">}}
<div class="row">
  <div class="col-lg-5">
    <div id="myDatePickerCustomFormats2"></div>
  </div>
</div>
{{< /example >}}

```html
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/customParseFormat.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/locale/es.js"></script>
```

{{< js-docs name="date-picker-custom-formats2" file="docs/assets/js/partials/snippets.js" >}}

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
| `ariaNavNextMonthLabel` | string | `'Next month'` | A string that provides an accessible label for the button that navigates to the next month in the calendar. This label is read by screen readers to describe the action associated with the button. |
| `ariaNavNextYearLabel` | string | `'Next year'` | A string that provides an accessible label for the button that navigates to the next year in the calendar. This label is intended for screen readers to help users understand the button's functionality. |
| `ariaNavPrevMonthLabel` | string | `'Previous month'` | A string that provides an accessible label for the button that navigates to the previous month in the calendar. Screen readers will use this label to explain the purpose of the button. |
| `ariaNavPrevYearLabel` | string | `'Previous year'` | A string that provides an accessible label for the button that navigates to the previous year in the calendar. This label helps screen reader users understand the button's function. |
| `calendarDate` | date, number, string, null | `null` | Default date of the component. |
| `cancelButton` | boolean, string | `'Cancel'` | Cancel button inner HTML |
| `cancelButtonClasses` | array, string | `['btn', 'btn-sm', 'btn-ghost-primary']` | CSS class names that will be added to the cancel button |
| `cleaner` | boolean | `true` | Enables selection cleaner element. |
| `confirmButton` | boolean, string | `'OK'` | Confirm button inner HTML |
| `confirmButtonClasses` | array, string | `['btn', 'btn-sm', 'btn-primary']` | CSS class names that will be added to the confirm button |
| `container` | string, element, false | `false` | Appends the dropdown to a specific element. Example: `container: 'body'`. |
| `date` | date, number, string, null | `null` | Default value of the component |
| `disabled` | boolean | `false` | Toggle the disabled state for the component. |
| `disabledDates` | array, function, null | `null` | Specify the list of dates that cannot be selected. |
| `firstDayOfWeek` | number | `1` | <p>Sets the day of start week.</p><ul><li>`0` - Sunday</li><li>`1` - Monday</li><li>`2` - Tuesday</li><li>`3` - Wednesday</li><li>`4` - Thursday</li><li>`5` - Friday</li><li>`6` - Saturday</li></ul> |
| `footer` | boolean | `false` | Toggle visibility of footer element. |
| `indicator` | boolean | `true` | Toggle visibility or set the content of the input indicator. |
| `inputDateFormat` | function, null | `null` | Custom function to format the selected date into a string according to a custom format. |
| `inputDateParse` | function, null | `null` | Custom function to parse the input value into a valid Date object. |
| `inputReadOnly` | boolean | `false` | Toggle the readonly state for the component. |
| `invalid` | boolean | `false` | Toggle the invalid state for the component. |
| `locale` | string | `'default'` | Sets the default locale for components. If not set, it is inherited from the navigator.language. |
| `maxDate` | date, number, string, null | `null` | Max selectable date. |
| `minDate` | date, number, string, null | `null` | Min selectable date. |
| `name` | string, null | `null` | Set the name attribute for the input element. |
| `placeholder` | string | `'Select time'` | Specifies a short hint that is visible in the input. |
| `previewDateOnHover` | boolean | `true` | Enable live preview of dates in input field when hovering over calendar cells. |
| `selectAdjacementDays` | boolean | `false` | Set whether days in adjacent months shown before or after the current month are selectable. This only applies if the `showAdjacementDays` option is set to true. |
| `selectionType` | `'day'`, `'week'`, `'month'`, `'year'` | `day` | Specify the type of date selection as day, week, month, or year. |
| `showAdjacementDays` | boolean | `true` | Set whether to display dates in adjacent months (non-selectable) at the start and end of the current month. |
| `showWeekNumber` | boolean | `false` | Set whether to display week numbers in the calendar. |
| `size` | `'sm'`, `'lg'` | `null` | Size the component small or large. |
| `timepicker` | boolean | `false` | Provide an additional time selection by adding select boxes to choose times. |
| `todayButton` | string | `'Today'` | Today button inner HTML |
| `todayButtonClasses` | array, string | `['btn', 'btn-sm', 'me-2']` | CSS class names that will be added to the today button |
| `valid` | boolean | `false` | Toggle the valid state for the component. |
| `weekdayFormat` | number, 'long', 'narrow', 'short' | `2` | Set length or format of day name. |
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

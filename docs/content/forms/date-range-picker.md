---
layout: docs
title: Date Range Picker
description: Bootstrap Date Range Picker is a customizable, user-friendly calendar tool for Bootstrap forms, supporting date ranges, localization, and validation for accurate date selection.
toc: true
bootstrap: true
pro_component: true
other_frameworks: date-range-picker
dayjs: true
---

## Example

Below is an example of a basic Bootstrap DateRangePicker.

### Days

The following examples demonstrating how to pick dates using the Bootstrap Date Range Picker Component.

{{< example stackblitz_pro="true" >}}
  <div class="row">
    <div class="col-sm-6 mb-3 mb-sm-0">
      <div data-coreui-locale="en-US" data-coreui-toggle="date-range-picker"></div>
    </div>
    <div class="col-sm-6">
      <div
        data-coreui-start-date="2022/08/03"
        data-coreui-end-date="2022/08/17"
        data-coreui-locale="en-US"
        data-coreui-toggle="date-range-picker">
      </div>
    </div>
  </div>
{{< /example >}}

#### With timepicker

In addition to supporting date selection, our Bootstrap Date Range Picker component also includes a Time Picker feature, allowing users to select a specific time of day. Bootstrap Time Picker can be enabled by adding `data-coreui-timepicker="true"`.

{{< example stackblitz_pro="true" >}}
  <div class="row">
    <div class="col-lg-7 mb-3">
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

#### With footer

To add a footer, use `data-coreui-footer="true"`. The footer can display extra information or actions related to the selected date, such as buttons for "Today" or "Clear".

{{< example stackblitz_pro="true" >}}
  <div class="row">
    <div class="col-sm-6 mb-3 mb-sm-0">
      <div
        data-coreui-footer="true"
        data-coreui-locale="en-US"
        data-coreui-toggle="date-range-picker">
      </div>
    </div>
    <div class="col-sm-6">
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

### Weeks

If you want to select the weeks, add the `data-coreui-selection-type="week"` attribute. You can also use `data-coreui-show-week-number="true"` to show week numbers.

{{< example stackblitz_pro="true" >}}
  <div class="row">
    <div class="col-sm-6 mb-3 mb-sm-0">
      <div 
        data-coreui-locale="en-US"
        data-coreui-toggle="date-range-picker"
        data-coreui-show-week-number="true"
        data-coreui-selection-type="week">
      </div>
    </div>
    <div class="col-sm-6">
      <div
        data-coreui-start-date="2025W07"
        data-coreui-end-date="2025W12"
        data-coreui-locale="en-US"
        data-coreui-toggle="date-range-picker"
        data-coreui-show-week-number="true"
        data-coreui-selection-type="week">
      </div>
    </div>
  </div>
{{< /example >}}

### Months

Select range of months by adding the `data-coreui-selection-type="month"` attribute.

{{< example stackblitz_pro="true" >}}
  <div class="row">
    <div class="col-sm-6 mb-3 mb-sm-0">
      <div 
        data-coreui-locale="en-US"
        data-coreui-toggle="date-range-picker"
        data-coreui-selection-type="month">
      </div>
    </div>
    <div class="col-sm-6">
      <div
        data-coreui-start-date="2022-08"
        data-coreui-end-date="2023-05"
        data-coreui-locale="en-US"
        data-coreui-toggle="date-range-picker"
        data-coreui-selection-type="month">
      </div>
    </div>
  </div>
{{< /example >}}

### Years

Add the `data-coreui-selection-type="year"` attribute to allow a pick range of years.

{{< example stackblitz_pro="true" >}}
  <div class="row">
    <div class="col-sm-6 mb-3 mb-sm-0">
      <div
        data-coreui-locale="en-US"
        data-coreui-toggle="date-range-picker"
        data-coreui-selection-type="year">
      </div>
    </div>
    <div class="col-sm-6">
      <div
        data-coreui-start-date="2022"
        data-coreui-end-date="2028"
        data-coreui-locale="en-US"
        data-coreui-toggle="date-range-picker"
        data-coreui-selection-type="year">
      </div>
    </div>
  </div>
{{< /example >}}


## Sizing

Set heights using `data-coreui-size` attribute like `data-coreui-size="lg"` and `data-coreui-size="sm"`.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-lg-6 mb-3">
    <div data-coreui-locale="en-US" data-coreui-size="lg" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
<div class="row">
  <div class="col-sm-6">
    <div data-coreui-locale="en-US" data-coreui-size="sm" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

## Disabled

Add the `data-coreui-disabled="true"` attribute on an input to give it a grayed out appearance and remove pointer events.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-sm-6">
    <div data-coreui-disabled="true" data-coreui-locale="en-US" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

## Readonly

Add the `data-coreui-input-read-only="true"` boolean attribute to prevent modification of the input's value.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-sm-6">
    <div data-coreui-input-read-only="true" data-coreui-locale="en-US" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

## Preview date on hover

By default, the date range picker shows a live preview in the input fields when hovering over calendar dates. To disable this feature, set `data-coreui-preview-date-on-hover="false"`.

{{< example stackblitz_pro="true" >}}
  <div class="row">
    <div class="col-sm-6 mb-3 mb-sm-0">
      <label class="form-label">With preview (default)</label>
      <div
        data-coreui-locale="en-US"
        data-coreui-toggle="date-range-picker">
      </div>
    </div>
    <div class="col-sm-6">
      <label class="form-label">Without preview</label>
      <div
        data-coreui-locale="en-US"
        data-coreui-preview-date-on-hover="false"
        data-coreui-toggle="date-range-picker">
      </div>
    </div>
  </div>
{{< /example >}}

## Disabled dates

The CoreUI Bootstrap DateRangePicker component allows you to disable certain dates, such as weekends or holidays. You can accomplish this by passing the `disabledDates` option to the component, which determines which dates should be disabled based on custom logic.

{{< example stackblitz_pro="true"  stackblitz_add_js="true">}}
<div class="row">
  <div class="col-sm-6">
    <div id="myDateRangePickerDisabledDates"></div>
  </div>
</div>
{{< /example >}}

{{< js-docs name="date-range-picker-disabled-dates" file="docs/assets/js/partials/snippets.js" >}}

### Disabling weekends

You can disable weekends by passing a function to the `disabledDates` option. Here's how to do it:

{{< example stackblitz_pro="true"  stackblitz_add_js="true">}}
<div class="row">
  <div class="col-lg-5">
    <div id="myDateRangePickerDisabledDates2"></div>
  </div>
</div>
{{< /example >}}

{{< js-docs name="date-range-picker-disabled-dates2" file="docs/assets/js/partials/snippets.js" >}}

## Custom ranges

In order to configure custom date ranges in the Date Range component, you must use the `ranges` option to define a set of predefined ranges. These ranges can include predefined options such as "Today", "Yesterday", "Last 7 Days", etc.


{{< example stackblitz_pro="true"  stackblitz_add_js="true">}}
<div class="row">
  <div class="col-sm-6">
    <div id="myDateRangePickerCustomRanges"></div>
  </div>
</div>
{{< /example >}}

{{< js-docs name="date-range-picker-custom-ranges" file="docs/assets/js/partials/snippets.js" >}}

## Non-english locale

CoreUI Date Range Picker allows users to display dates and times in a non-English locale. This is useful for applications with international users or that need to support multiple languages. 

### Auto

By default, the DateRangePicker component uses the default browser locale, but it can be easily configured to use a different locale supported by the JavaScript Internationalization API. To set the locale, you can pass the desired language code as a prop to the DatePicker component. This feature enables the creation of more inclusive and accessible applications that cater to a diverse audience.

{{< example stackblitz_pro="true"  stackblitz_add_js="true">}}
<div class="row">
  <div class="col-sm-6">
    <div data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

### Chinese

Here is an example of a simple Bootstrap Date Range Picker with Chinese locales.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-sm-6">
    <div data-coreui-locale="zh-CN" data-coreui-placeholder="入住日期,退房日期" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

### Japanese

Here is a basic Date Range Picker with Japanese locales.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-sm-6">
    <div data-coreui-locale="ja" data-coreui-placeholder="日付を選択,終了日" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

### Korean

Take a look at the following example, which demonstrates a simple date picker designed to work with Korean locales.

{{< example stackblitz_pro="true" >}}
<div class="row">
  <div class="col-sm-6">
    <div data-coreui-locale="ko" data-coreui-placeholder="날짜 선택,종료일" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

## Right to left support

RTL support is built-in and can be explicitly controlled through the `$enable-rtl` variables in scss.

### Hebrew

{{< example stackblitz_pro="true" >}}
<div class="row" dir="rtl">
  <div class="col-sm-6">
    <div data-coreui-locale="he-IL" data-coreui-placeholder="בחר תאריך,תאריך סיום" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

### Persian

{{< example stackblitz_pro="true" >}}
<div class="row" dir="rtl">
  <div class="col-sm-6">
    <div data-coreui-locale="fa-IR" data-coreui-placeholder="تاریخ شروع,تاریخ پایان" data-coreui-toggle="date-range-picker"></div>
  </div>
</div>
{{< /example >}}

## Custom formats

As of v5.0.0, the `format` property is removed in Date Range Picker. Instead, utilize the `inputDateFormat` to format dates into custom strings and `inputDateParse` to parse custom strings into Date objects.

The provided code demonstrates how to use the `inputDateFormat` and `inputDateParse` properties. In this example, we use the `dayjs` library to format and parse dates.

The `inputDateFormat` property formats the date into a custom string, while the `inputDateParse` property parses a custom string into a Date object. The code showcases the date range in different formats based on locale, such as 'MMMM DD, YYYY' and 'YYYY MMMM DD', and accommodates different locales, like 'en-US' and 'es-ES'.


{{< example stackblitz_pro="true" stackblitz_dayjs="true" stackblitz_add_js="true">}}
<div class="row">
  <div class="col-lg-7">
    <div id="myDateRangePickerCustomFormats1"></div>
  </div>
</div>
{{< /example >}}

```html
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/customParseFormat.js"></script>
```

{{< js-docs name="date-range-picker-custom-formats1" file="docs/assets/js/partials/snippets.js" >}}

To use localized dates, we need to additionally add locale files, in this case, Spanish:

{{< example stackblitz_pro="true" stackblitz_dayjs="true" stackblitz_add_js="true">}}
<div class="row">
  <div class="col-lg-7">
    <div id="myDateRangePickerCustomFormats2"></div>
  </div>
</div>
{{< /example >}}

```html
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/plugin/customParseFormat.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dayjs@1/locale/es.js"></script>
```

{{< js-docs name="date-range-picker-custom-formats2" file="docs/assets/js/partials/snippets.js" >}}

## Usage

{{< bootstrap-compatibility >}}

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
const dateRangePickerElementList = Array.prototype.slice.call(document.querySelectorAll('.date-range-picker'))
const dateRangePickerList = dateRangePickerElementList.map(dateRangePickerEl => {
  return new coreui.DateRangePicker(dateRangePickerEl)
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
| `calendars` | number | `2` | The number of calendars that render on desktop devices. |
| `cancelButton` | boolean, string | `'Cancel'` | Cancel button inner HTML |
| `cancelButtonClasses` | array, string | `['btn', 'btn-sm', 'btn-ghost-primary']` | CSS class names that will be added to the cancel button |
| `cleaner` | boolean | `true` | Enables selection cleaner element. |
| `confirmButton` | boolean, string | `'OK'` | Confirm button inner HTML |
| `confirmButtonClasses` | array, string | `['btn', 'btn-sm', 'btn-primary']` | CSS class names that will be added to the confirm button |
| `container` | string, element, false | `false` | Appends the dropdown to a specific element. Example: `container: 'body'`. |
| `disabled` | boolean | `false` | Toggle the disabled state for the component. |
| `disabledDates` | array, function, null | `null` | Specify the list of dates that cannot be selected. |
| `endDate` | date, number, string, null | `null` | Initial selected to date (range). |
| `endName` | string, null | `null` | Set the name attribute for the end date input element. |
| `firstDayOfWeek` | number | `1` | <p>Sets the day of start week.</p>  <ul><li>`0` - Sunday</li><li>`1` - Monday</li><li>`2` - Tuesday</li><li>`3` - Wednesday</li><li>`4` - Thursday</li><li>`5` - Friday</li><li>`6` - Saturday</li></ul> |
| `footer` | boolean | `false` | Toggle visibility of footer element. |
| `indicator` | boolean | `true` | Toggle visibility or set the content of the input indicator. |
| `inputDateFormat` | function, null | `null` | Custom function to format the selected date into a string according to a custom format. |
| `inputDateParse` | function, null | `null` | Custom function to parse the input value into a valid Date object. |
| `inputReadOnly` | boolean | `false` | Toggle the readonly state for the component. |
| `invalid` | boolean | `false` | Toggle the invalid state for the component. |
| `locale` | string | `'default'` | Sets the default locale for components. If not set, it is inherited from the navigator.language. |
| `maxDate` | date, number, string, null | `null` | Max selectable date. |
| `minDate` | date, number, string, null | `null` | Min selectable date. |
| `placeholder` | string | `['Start date', 'End date']` | Specifies a short hint that is visible in the input. |
| `previewDateOnHover` | boolean | `true` | Enable live preview of dates in input fields when hovering over calendar cells. |
| `ranges` | object | `{}` | Predefined date ranges the user can select from. |
| `rangesButtonsClasses` | array, string | `['btn', 'btn-ghost-secondary']` | CSS class names that will be added to ranges buttons |
| `selectAdjacementDays` | boolean | `false` | Set whether days in adjacent months shown before or after the current month are selectable. This only applies if the `showAdjacementDays` option is set to true. |
| `selectionType` | `'day'`, `'week'`, `'month'`, `'year'` | `day` | Specify the type of date selection as day, week, month, or year. |
| `separator` | boolean | `true` | Toggle visibility or set the content of the inputs separator. |
| `showAdjacementDays` | boolean | `true` | Set whether to display dates in adjacent months (non-selectable) at the start and end of the current month. |
| `showWeekNumber` | boolean | `false` | Set whether to display week numbers in the calendar. |
| `size` | `'sm'`, `'lg'` | `null` | Size the component small or large. |
| `startDate` | date, number, string, null | `null` | Initial selected date. |
| `startName` | string, null | `null` | Set the name attribute for the start date input element. |
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
| `clear` | Clear selection of the date range picker. |
| `reset` | Reset selection of the date range picker to the initial value. |
| `update` | Updates the configuration of the date range picker. |
| `dispose` | Destroys a component. (Removes stored data on the DOM element) |
| `getInstance` | Static method which allows you to get the date range picker instance associated to a DOM element, you can use it like this: `coreui.DateRangePicker.getInstance(element)` |
| `getOrCreateInstance` | Static method which returns a date range picker instance associated to a DOM element or create a new one in case it wasn't initialized. You can use it like this: `coreui.DateRangePicker.getOrCreateInstance(element)` |
{{< /bs-table >}}

### Events

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `endDateChange.coreui.date-range-picker` | Callback fired when the end date changed. |
| `startDateChange.coreui.date-range-picker` | Callback fired when the start date changed. |
| `show.coreui.date-range-picker` | Fires immediately when the show instance method is called. |
| `shown.coreui.date-range-picker` | Fired when the calendar has been made visible to the user and CSS transitions have completed. |
| `hide.coreui.date-range-picker` | Fires immediately when the hide instance method has been called. |
| `hidden.coreui.date-range-picker` | Fired when the calendar has finished being hidden from the user and CSS transitions have completed. |
{{< /bs-table >}}

```js
const myDateRangePicker = document.getElementById('myDateRangePicker')
myDateRangePicker.addEventListener('endDateChange.coreui.date-range-picker', date => {
  // do something...
})
```

## Customizing

### CSS variables

DateRangePickers use local CSS variables on `.date-picker` and `.calendar` for enhanced real-time customization. Values for the CSS variables are set via Sass, so Sass customization is still supported, too.

{{< scss-docs name="date-picker-css-vars" file="scss/_date-picker.scss" >}}

{{< scss-docs name="calendar-css-vars" file="scss/_calendar.scss" >}}

### SASS variables

{{< scss-docs name="date-picker-variables" file="scss/_variables.scss" >}}

{{< scss-docs name="calendar-variables" file="scss/_variables.scss" >}}

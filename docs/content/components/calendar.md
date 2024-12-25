---
layout: docs
title: Calendar
description: The Bootstrap Calendar Component is a versatile, customizable tool for creating responsive calendars in Bootstrap, supporting day, month, and year selection, and global locales.
group: components
toc: true
bootstrap: true
pro_component: true
other_frameworks: calendar
---

## Example

Explore the Bootstrap 5 Calendar component's basic usage through sample code snippets demonstrating its core functionality.

### Days

Select specific days using the Bootstrap Calendar component. The example below shows basic usage.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center">
  <div
    class="border rounded"
    data-coreui-locale="en-US"
    data-coreui-start-date="2024/02/13"
    data-coreui-toggle="calendar"
  ></div>
</div>
{{< /example >}}

### Weeks

Set the `data-coreui-selection-type` to `week` to enable selection of entire week. You can also use `data-coreui-show-week-number="true"` to show week numbers.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center">
  <div
    class="border rounded"
    data-coreui-locale="en-US"
    data-coreui-selection-type="week"
    data-coreui-show-week-number="true"
    data-coreui-start-date="2024W15"
    data-coreui-toggle="calendar"
  ></div>
</div>
{{< /example >}}

### Months

Set the `data-coreui-selection-type` to `month` to enable selection of entire months.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center">
  <div 
    class="border rounded"
    data-coreui-locale="en-US"
    data-coreui-selection-type="month"
    data-coreui-start-date="2024-2"
    data-coreui-toggle="calendar"
  ></div>
</div>
{{< /example >}}

### Years

Set the `data-coreui-selection-type` to `year` to enable years range selection.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center">
  <div 
    class="border rounded"
    data-coreui-locale="en-US"
    data-coreui-selection-type="year"
    data-coreui-start-date="2024"
    data-coreui-toggle="calendar"
  ></div>
</div>
{{< /example >}}

## Multiple calendar panels

Display multiple calendar panels side by side by setting the `data-coreui-calendars` attribute. This can be useful for selecting ranges or comparing dates across different months.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center">
  <div 
    class="border rounded"
    data-coreui-calendars="2"
    data-coreui-locale="en-US"
    data-coreui-toggle="calendar"
  ></div>
</div>
{{< /example >}}

## Range selection

Enable range selection by adding `data-coreui-range="true"` to allow users to pick a start and end date. This example demonstrates how to configure the Bootstrap 5 Calendar component to handle date ranges.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center">
  <div 
    class="border rounded"
    data-coreui-locale="en-US"
    data-coreui-calendars="2"
    data-coreui-range="true"
    data-coreui-start-date="2022/08/23"
    data-coreui-end-date="2022/09/08"
    data-coreui-toggle="calendar"
  ></div>
</div>
{{< /example >}}

## Disabled dates

The Bootstrap Calendar component includes functionality to disable specific dates, such as weekends or holidays, using the `disabledDates` option. It accepts:

- A single `Date` or an array of `Date` objects.
- A function or an array of functions that take a `Date` object as an argument and return a boolean indicating whether the date should be disabled.
- A mixed array of `Date` objects and functions.

To disable certain dates, you can provide them in an array. For date ranges, use nested arrays, where each inner array indicates a start date and an end date for that range:

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div class="d-flex justify-content-center">
  <div id="myCalendarDisabledDates" class="border rounded"></div>
</div>
{{< /example >}}

{{< js-docs name="calendar-disabled-dates" file="docs/assets/js/partials/snippets.js" >}}

### Disabling weekends

To disable weekends, provide a function for the `disabledDates` option. Here's the method:

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div class="d-flex justify-content-center">
  <div id="myCalendarDisabledDates2" class="border rounded"></div>
</div>
{{< /example >}}

{{< js-docs name="calendar-disabled-dates2" file="docs/assets/js/partials/snippets.js" >}}

In the example above:

- `disableWeekends` is a function that checks if a date falls on a Saturday (`6`) or a Sunday (`0`).
- The `disabledDates` option utilizes the `disableWeekends` function to disable all weekends in the calendar.

### Combining functions and specific dates

You can also combine specific dates and functions in the `disabledDates` array. For instance:

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div class="d-flex justify-content-center">
  <div id="myCalendarDisabledDates3" class="border rounded"></div>
</div>
{{< /example >}}

{{< js-docs name="calendar-disabled-dates3" file="docs/assets/js/partials/snippets.js" >}}

In this example:

- `disableWeekends` disables weekends as before.
- `specificDates` is an array of specific dates to disable.
- The `disabledDates` option combines both, allowing you to disable weekends and specific dates simultaneously.

## Non-english locale

The CoreUI Bootstrap Calendar allows users to display dates in non-English locales, making it suitable for international applications.

### Auto

By default, the Calendar component uses the browser's default locale. However, you can easily configure it to use a different locale supported by the JavaScript Internationalization API. This feature helps create inclusive and accessible applications for a diverse audience.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center">
  <div class="border rounded" data-coreui-toggle="calendar"></div>
</div>
{{< /example >}}

### Chinese

Here is an example of the Bootstrap Calendar component with Chinese locale settings.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center">
  <div class="border rounded" data-coreui-locale="zh-CN" data-coreui-toggle="calendar"></div>
</div>
{{< /example >}}

### Japanese

Below is an example of the Calendar component with Japanese locale settings.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center">
  <div class="border rounded" data-coreui-locale="ja" data-coreui-toggle="calendar"></div>
</div>
{{< /example >}}

### Korean

Here is an example of the Calendar component with Korean locale settings.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center" dir="rtl">
  <div class="border rounded" data-coreui-locale="ko" data-coreui-toggle="calendar"></div>
</div>
{{< /example >}}

## Right to left support

RTL support is built-in and can be explicitly controlled through the `$enable-rtl` variables in scss.

### Hebrew

Example of the Calendar component with RTL support, using the Hebrew locale.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center" dir="rtl">
  <div class="border rounded" data-coreui-locale="he-IL" data-coreui-toggle="calendar"></div>
</div>
{{< /example >}}

### Persian

Example of the Bootstrap Calendar component with Persian locale settings.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center">
  <div class="border rounded" data-coreui-locale="fa-IR" data-coreui-toggle="calendar"></div>
</div>
{{< /example >}}

## Usage

{{< bootstrap-compatibility >}}

### Via data attributes

Add `data-coreui-toggle="calendar"` to a `div` element.

```html
<div data-coreui-toggle="calendar"></div>
```

### Via JavaScript

Call the time picker via JavaScript:

```html
<div class="calendar"></div>
```

```js
const calendarElementList = Array.prototype.slice.call(document.querySelectorAll('.calendar'))
const calendarList = calendarElementList.map(calendarEl => {
  return new coreui.Calendar(calendarEl)
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
| `disabledDates` | array, function, null | `null` | Specify the list of dates that cannot be selected. |
| `endDate` | date, number, string, null | `null` | Initial selected to date (range). |
| `firstDayOfWeek` | number | `1` | <p>Sets the day of start week.</p>  <ul><li>`0` - Sunday</li><li>`1` - Monday</li><li>`2` - Tuesday</li><li>`3` - Wednesday</li><li>`4` - Thursday</li><li>`5` - Friday</li><li>`6` - Saturday</li></ul> |
| `locale` | string | `'default'` | Sets the default locale for components. If not set, it is inherited from the navigator.language. |
| `maxDate` | date, number, string, null | `null` | Max selectable date. |
| `minDate` | date, number, string, null | `null` | Min selectable date. |
| `range` | boolean | `false` | Allow range selection |
| `selectAdjacementDays` | boolean | `false` | Set whether days in adjacent months shown before or after the current month are selectable. This only applies if the `showAdjacementDays` option is set to true. |
| `selectionType` | `'day'`, `'week'`, `'month'`, `'year'` | `day` | Specify the type of date selection as day, week, month, or year. |
| `showAdjacementDays` | boolean | `true` | Set whether to display dates in adjacent months (non-selectable) at the start and end of the current month. |
| `showWeekNumber` | boolean | `false` | Set whether to display week numbers in the calendar. |
| `startDate` | date, number, string, null | `null` | Initial selected date. |
| `weekdayFormat` | number, 'long', 'narrow', 'short' | `2` | Set length or format of day name. |
| `weekNumbersLabel` | string | `null` | Label displayed over week numbers in the calendar. |
{{< /bs-table >}}

### Methods

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `update` | Updates the configuration of the calendar. |
| `dispose` | Destroys a component. (Removes stored data on the DOM element) |
| `getInstance` | Static method which allows you to get the calendar instance associated to a DOM element, you can use it like this: `coreui.Calendar.getInstance(element)` |
| `getOrCreateInstance` | Static method which returns a calendar instance associated to a DOM element or create a new one in case it wasn't initialized. You can use it like this: `coreui.Calendar.getOrCreateInstance(element)` |
{{< /bs-table >}}

### Events

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `calendarDateChange.coreui.calendar` | Callback fired when the calendar date changed. |
| `calendarMouseleave.coreui.calendar` | Callback fired when the cursor leave the calendar. |
| `cellHover.coreui.calendar` | Callback fired when the user hovers over the calendar cell. |
| `endDateChange.coreui.calendar` | Callback fired when the end date changed. |
| `selectEndChange.coreui.calendar` | Callback fired when the selection type changed. |
| `startDateChange.coreui.calendar` | Callback fired when the start date changed. |
{{< /bs-table >}}

```js
const myCalendar = document.getElementById('myCalendar')
myCalendar.addEventListener('endDateChange.coreui.calendar', date => {
  // do something...
})
```

## Customizing

### CSS variables

Calendar use local CSS variables on `.calendar` for enhanced real-time customization. Values for the CSS variables are set via Sass, so Sass customization is still supported, too.

{{< scss-docs name="calendar-css-vars" file="scss/_calendar.scss" >}}

### SASS variables

{{< scss-docs name="calendar-variables" file="scss/_variables.scss" >}}

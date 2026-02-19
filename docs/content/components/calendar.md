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

### Quarters

Set the `data-coreui-selection-type` property to `quarter` to enable quarters range selection.

{{< example stackblitz_pro="true" >}}
<div class="d-flex justify-content-center">
  <div
    class="border rounded"
    data-coreui-locale="en-US"
    data-coreui-selection-type="quarter"
    data-coreui-start-date="2024Q1"
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

## Custom cell rendering

The Calendar component provides powerful customization options through render functions that allow you to completely control how calendar cells are displayed. These render functions are particularly useful when you need to add custom content, styling, or data to calendar cells.

### Render functions

The component supports four render functions, one for each view type:

- `renderDayCell(date, meta)` - Customize day cells in the days view
- `renderMonthCell(date, meta)` - Customize month cells in the months view
- `renderQuarterCell(date, meta)` - Customize quarter cells in the quarters view
- `renderYearCell(date, meta)` - Customize year cells in the years view

Each render function receives two parameters:

1. `date` - A JavaScript Date object representing the cell's date
2. `meta` - An object containing cell state information:
   - `isDisabled` - Whether the cell is disabled
   - `isInRange` - Whether the cell is within a selected range (range selection only)
   - `isSelected` - Whether the cell is selected
   - For `renderDayCell` only:
     - `isInCurrentMonth` - Whether the day belongs to the current month
     - `isToday` - Whether the day is today

The render functions should return an HTML string that will be displayed inside the cell. The returned HTML is automatically sanitized to prevent XSS attacks.

### Format options

In addition to custom rendering, you can control the display format of calendar elements using format options:

- `dayFormat` - Controls how day numbers are displayed (`'numeric'` or `'2-digit'`)
- `monthFormat` - Controls how month names are displayed (`'long'`, `'narrow'`, `'short'`, `'numeric'`, or `'2-digit'`)
- `yearFormat` - Controls how year numbers are displayed (`'numeric'` or `'2-digit'`)
- `weekdayFormat` - Controls how weekday names are displayed (number for character length, or `'long'`, `'narrow'`, `'short'`)

These format options use the JavaScript `Intl.DateTimeFormat` API and respect the `locale` setting.

### Security considerations

For security reasons, all HTML returned by render functions is automatically sanitized using the built-in sanitizer. You can:

- Disable sanitization by setting `sanitize: false` (not recommended)
- Customize allowed HTML tags and attributes using the `allowList` option
- Provide your own sanitization function using the `sanitizeFn` option

Note that `sanitize`, `sanitizeFn`, and `allowList` options cannot be supplied via data attributes for security reasons.

### Pricing calendar with custom cells

This example demonstrates advanced usage of custom cell rendering to display pricing data across different calendar views. It uses `renderDayCell` to show daily prices, `renderMonthCell` to display monthly price ranges, and `renderYearCell` to show annual price ranges. The data is fetched from an external API and cached for performance.

{{< example stackblitz_pro="true" stackblitz_add_js="true">}}
<div class="d-flex justify-content-center">
  <div id="myCalendarCustomizeCells" class="border rounded"></div>
</div>
{{< /example >}}

{{< js-docs name="calendar-customize-cells" file="docs/assets/js/partials/snippets.js" >}}


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

{{< callout warning >}}
Note that for security reasons the `sanitize`, `sanitizeFn`, and `allowList` options cannot be supplied using data attributes.
{{< /callout >}}

{{< bs-table >}}
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `allowList` | object | [Default value]({{< docsref "/getting-started/javascript#sanitizer" >}}) | Object which contains allowed attributes and tags. |
| `ariaNavNextMonthLabel` | string | `'Next month'` | A string that provides an accessible label for the button that navigates to the next month in the calendar. This label is read by screen readers to describe the action associated with the button. |
| `ariaNavNextYearLabel` | string | `'Next year'` | A string that provides an accessible label for the button that navigates to the next year in the calendar. This label is intended for screen readers to help users understand the button's functionality. |
| `ariaNavPrevMonthLabel` | string | `'Previous month'` | A string that provides an accessible label for the button that navigates to the previous month in the calendar. Screen readers will use this label to explain the purpose of the button. |
| `ariaNavPrevYearLabel` | string | `'Previous year'` | A string that provides an accessible label for the button that navigates to the previous year in the calendar. This label helps screen reader users understand the button's function. |
| `calendarDate` | date, number, string, null | `null` | Default date of the component. |
| `calendars` | number | `2` | The number of calendars that render on desktop devices. |
| `dayFormat` | `'numeric'`, `'2-digit'` | `'numeric'` | Sets the format for days. Accepts a built-in format (`'numeric'` or `'2-digit'`) |
| `disabledDates` | array, function, null | `null` | Specify the list of dates that cannot be selected. |
| `endDate` | date, number, string, null | `null` | Initial selected to date (range). |
| `firstDayOfWeek` | number | `1` | <p>Sets the day of start week.</p>  <ul><li>`0` - Sunday</li><li>`1` - Monday</li><li>`2` - Tuesday</li><li>`3` - Wednesday</li><li>`4` - Thursday</li><li>`5` - Friday</li><li>`6` - Saturday</li></ul> |
| `locale` | string | `'default'` | Sets the default locale for components. If not set, it is inherited from the navigator.language. |
| `maxDate` | date, number, string, null | `null` | Max selectable date. |
| `minDate` | date, number, string, null | `null` | Min selectable date. |
| `monthFormat` | `'long'`, `'narrow'`, `'short'`, `'numeric'`, `'2-digit'` | `'short'` | Sets the format for month names. Accepts built-in formats (`'long'`, `'narrow'`, `'short'`, `'numeric'`, `'2-digit'`). |
| `range` | boolean | `false` | Allow range selection |
| `renderDayCell` | function, null | `null` | Custom function to render day cells. Receives `date` and `meta` object (with `isDisabled`, `isInCurrentMonth`, `isInRange`, `isSelected`, `isToday`) as parameters and should return HTML string. |
| `renderMonthCell` | function, null | `null` | Custom function to render month cells. Receives `date` and `meta` object (with `isDisabled`, `isInRange`, `isSelected`) as parameters and should return HTML string. |
| `renderQuarterCell` | function, null | `null` | Custom function to render quarter cells. Receives `date` and `meta` object (with `isDisabled`, `isInRange`, `isSelected`) as parameters and should return HTML string. |
| `renderYearCell` | function, null | `null` | Custom function to render year cells. Receives `date` and `meta` object (with `isDisabled`, `isInRange`, `isSelected`) as parameters and should return HTML string. |
| `sanitize` | boolean | `true` | Enable or disable the sanitization. If activated `renderDayCell`, `renderMonthCell`, `renderQuarterCell`, and `renderYearCell` options will be sanitized. |
| `sanitizeFn` | null, function | `null` | Here you can supply your own sanitize function. This can be useful if you prefer to use a dedicated library to perform sanitization. |
| `selectAdjacementDays` | boolean | `false` | Set whether days in adjacent months shown before or after the current month are selectable. This only applies if the `showAdjacementDays` option is set to true. |
| `selectionType` | `'day'`, `'week'`, `'month'`, `'quarter'`, `'year'` | `day` | Specify the type of date selection as day, week, month, quarter, or year. |
| `showAdjacementDays` | boolean | `true` | Set whether to display dates in adjacent months (non-selectable) at the start and end of the current month. |
| `showWeekNumber` | boolean | `false` | Set whether to display week numbers in the calendar. |
| `startDate` | date, number, string, null | `null` | Initial selected date. |
| `weekdayFormat` | number, `'long'`, `'narrow'`, `'short'` | `2` | Set length or format of day name. |
| `weekNumbersLabel` | string | `null` | Label displayed over week numbers in the calendar. |
| `yearFormat` | `'numeric'`, `'2-digit'` | `'numeric'` | Sets the format for years. Accepts built-in formats (`'numeric'` or `'2-digit'`) |
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
| Method | Description | Event detail |
| --- | --- | --- |
| `calendarDateChange.coreui.calendar` | Fired when the calendar date changes. | `{ date: Date, view: 'days' \| 'months' \| 'quarters' \| 'years' }` |
| `calendarViewChange.coreui.calendar` | Fired when the calendar view changes. | `{ view: 'days' \| 'months' \| 'quarters' \| 'years', source: 'cellClick' \| 'navigation' }` |
| `calendarMouseleave.coreui.calendar` | Fired when the cursor leaves the calendar. | — |
| `cellHover.coreui.calendar` | Fired when the user hovers over a calendar cell. | `{ date: Date \| null }` |
| `endDateChange.coreui.calendar` | Fired when the end date changes. | `{ date: Date \| null }` |
| `selectEndChange.coreui.calendar` | Fired when the selection mode changes. | `{ value: boolean }` |
| `startDateChange.coreui.calendar` | Fired when the start date changes. | `{ date: Date \| null }` |
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

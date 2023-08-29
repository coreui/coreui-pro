---
layout: docs
title: Bootstrap calendar
description: Create consistent cross-browser and cross-device calendar.
group: components
toc: true
---

## Example

### Days

{{< example >}}
<div class="d-flex">
  <div id="myCalendar" class="border rounded" data-coreui-show-week-number="true" data-coreui-show-adjacement-days="true" data-coreui-start-date="2021/08/02" data-coreui-end-date="2021/08/12" data-coreui-calendars="2" data-coreui-range="true"></div>
</div>
{{< /example >}}

### Weeks

{{< example >}}
<div class="d-flex">
  <div id="myCalendarWeek" class="border rounded" data-coreui-show-week-number="true" data-coreui-show-adjacement-days="true" data-coreui-start-date="2025W07" data-coreui-end-date="2025W12" data-coreui-calendars="2" data-coreui-range="true" data-coreui-selection-type="week"></div>
</div>
{{< /example >}}

### Months

{{< example >}}
<div class="d-flex">
  <div 
    id="myCalendarMonth"
    class="border rounded"
    data-coreui-show-week-number="true"
    data-coreui-start-date="2022-8"
    data-coreui-end-date="2023-8"
    data-coreui-calendars="2"
    data-coreui-range="true"
    data-coreui-selection-type="month">
  </div>
</div>
{{< /example >}}

### Years

{{< example >}}
<div class="d-flex">
  <div id="myCalendarYear" class="border rounded" data-coreui-show-week-number="true" data-coreui-show-adjacement-days="true" data-coreui-start-date="2022" data-coreui-end-date="2024" data-coreui-calendars="2" data-coreui-range="true" data-coreui-selection-type="year"></div>
</div>
{{< /example >}}

## Customizing

### CSS variables

Calendar use local CSS variables on .accordion for enhanced real-time customization. Values for the CSS variables are set via Sass, so Sass customization is still supported, too.

{{< scss-docs name="calendar-css-vars" file="scss/_calendar.scss" >}}

### SASS variables

{{< scss-docs name="calendar-variables" file="scss/_variables.scss" >}}

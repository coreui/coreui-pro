---
layout: docs
title: Loading Buttons
description: Bootstrap loading buttons are interactive elements that provide visual feedback to users, indicating that an action is being processed. These buttons typically display a loading spinner or animation.
aliases:
  - "/4.0/components/loading-buttons/"
toc: true
bootstrap: true
pro_component: true
other_frameworks: loading-button
---

## Basic example

Create basic Bootstrap Loading Buttons with different styles: primary, outline, and ghost. These buttons show a loading state when clicked.

{{< example stackblitz_pro="true" >}}
<button type="button" class="btn btn-primary" data-coreui-timeout="2000" data-coreui-toggle="loading-button">Submit</button>
<button type="button" class="btn btn-outline-primary" data-coreui-toggle="loading-button">Submit</button>
<button type="button" class="btn btn-ghost-primary" data-coreui-toggle="loading-button">Submit</button>
{{< /example >}}

## Spinners

### Border

The default option. Use loading buttons with a border spinner to indicate loading status.

{{< example stackblitz_pro="true" >}}
<button type="button" class="btn btn-info" data-coreui-toggle="loading-button">Submit</button>
<button type="button" class="btn btn-outline-success" data-coreui-toggle="loading-button">Submit</button>
<button type="button" class="btn btn-ghost-warning" data-coreui-toggle="loading-button">Submit</button>
{{< /example >}}

### Grow

Switch to a grow spinner for Bootstrap loading buttons by adding `data-coreui-spinner-type="grow"`.

{{< example stackblitz_pro="true" >}}
<button type="button" class="btn btn-info" data-coreui-spinner-type="grow" data-coreui-toggle="loading-button">Submit</button>
<button type="button" class="btn btn-outline-success" data-coreui-spinner-type="grow" data-coreui-toggle="loading-button">Submit</button>
<button type="button" class="btn btn-ghost-warning" data-coreui-spinner-type="grow" data-coreui-toggle="loading-button">Submit</button>
{{< /example >}}


## Usage

{{< bootstrap-compatibility >}}

### Via data attributes

Add `data-coreui-toggle="loading-button"` to a `button` element.

```html
<button type="button" class="btn btn-primary" data-coreui-toggle="loading-button">Submit</button>
```

### Via JavaScript

Call the loading button via JavaScript:

```html
<div class="btn btn-primary btn-loading"></div>
```

```js
const loadingButtonElementList = Array.prototype.slice.call(document.querySelectorAll('.btn-loading'))
const loadingButtonList = loadingButtonElementList.map(loadingButtonEl => {
  return new coreui.DatePicker(loadingButtonEl)
})
```

### Options

{{< markdown >}}
{{< partial "js-data-attributes.md" >}}
{{< /markdown >}}

{{< bs-table >}}
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `disabledOnLoading`| boolean | `false`| Makes button disabled when loading. |
| `spinnerType`| 'border', 'grow' | `'border'`| Sets type of spinner. |
| `timeout`| boolean, number | `false`| Automatically starts loading animation and stops after a determined amount of milliseconds. |
{{< /bs-table >}}

### Methods
{{< bs-table >}}
| Method | Description |
| --- | --- |
| `start` | Starts loading. |
| `stop` | Stops loading. |
| `dispose` | Destroys an element's loading button. (Removes stored data on the DOM element) |
| `getInstance` | Static method which allows you to get the multi select instance associated with a DOM element. |
{{< /bs-table >}}

```js
const myBtnLoading = document.getElementById('btn-loading')
const myBtn = new coreui.LoadingButton(myBtnLoading)
myBtn.start()
```

### Events

Loading Button component exposes a few events for hooking into multi select functionality.

{{< bs-table >}}
| Method | Description |
| --- | --- |
| `start.coreui.loading-button` | Fires immediately when the start method is called. |
| `stop.coreui.loading-button` | Fires immediately when the stop method is called. |
{{< /bs-table >}}


```js
const myBtnLoading = document.getElementById('myBtnLoading')
myBtnLoading.addEventListener('stop.coreui.loading-button', () => {
  // do something...
})
```

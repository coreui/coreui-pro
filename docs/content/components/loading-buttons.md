---
layout: docs
title: Loading Buttons
description: Buttons with built-in loading indicators. Indicate the loading state of the button bridging the gap between action and feedback.
aliases:
  - "/components/loading-buttons/"
  - "/4.0/components/loading-buttons/"
toc: true
bootstrap: true
pro_component: true
other_frameworks: loading-button
---

## Basic example

{{< example >}}
<button type="button" class="btn btn-primary btn-loading" data-coreui-timeout="2000" data-coreui-toggle="loading-button">Submit</button>
<button type="button" class="btn btn-outline-primary btn-loading" data-coreui-toggle="loading-button">Submit</button>
<button type="button" class="btn btn-ghost-primary btn-loading" data-coreui-toggle="loading-button">Submit</button>
{{< /example >}}

## Spinners

### Border

{{< example >}}
<button type="button" class="btn btn-info btn-loading" data-coreui-toggle="loading-button">Submit</button>
<button type="button" class="btn btn-outline-success btn-loading" data-coreui-toggle="loading-button">Submit</button>
<button type="button" class="btn btn-ghost-warning btn-loading" data-coreui-toggle="loading-button">Submit</button>
{{< /example >}}

### Grow

{{< example >}}
<button type="button" class="btn btn-info btn-loading" data-coreui-spinner-type="grow" data-coreui-toggle="loading-button">Submit</button>
<button type="button" class="btn btn-outline-success btn-loading" data-coreui-spinner-type="grow" data-coreui-toggle="loading-button">Submit</button>
<button type="button" class="btn btn-ghost-warning btn-loading" data-coreui-spinner-type="grow" data-coreui-toggle="loading-button">Submit</button>
{{< /example >}}


## Usage

{{< bootstrap-compatibility >}}

### Options

{{< markdown >}}
{{< partial "js-data-attributes.md" >}}
{{< /markdown >}}

{{< bs-table >}}
| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `disabledOnLoading`| boolean| `false`| |
| `spinner`| boolean| `true`| |
| `spinnerType`| string| `'border'`| |
| `timeout`| boolean \| number| `false`| |
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

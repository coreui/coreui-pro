---
layout: docs
title: Loading Buttons
description: Buttons with built-in loading indicators. Indicate the loading state of the button bridging the gap between action and feedback.
aliases:
  - "/components/loading-buttons/"
  - "/4.0/components/loading-buttons/"
toc: true
---

## Basic example

{{< example >}}
<button type="button" class="btn btn-primary btn-loading" data-coreui-timeout="2000">Submit</button>
<button type="button" class="btn btn-outline-primary btn-loading">Submit</button>
<button type="button" class="btn btn-ghost-primary btn-loading">Submit</button>
{{< /example >}}

## Spinners

### Border

{{< example >}}
<button type="button" class="btn btn-info btn-loading">Submit</button>
<button type="button" class="btn btn-outline-success btn-loading">Submit</button>
<button type="button" class="btn btn-ghost-warning btn-loading">Submit</button>
{{< /example >}}

### Grow

{{< example >}}
<button type="button" class="btn btn-info btn-loading" data-coreui-spinner-type="grow">Submit</button>
<button type="button" class="btn btn-outline-success btn-loading" data-coreui-spinner-type="grow">Submit</button>
<button type="button" class="btn btn-ghost-warning btn-loading" data-coreui-spinner-type="grow">Submit</button>
{{< /example >}}


## Usage

### Options

Options can be passed via data attributes or JavaScript. For data attributes, append the option name to `data-coreui-`, as in `data-coreui-percent=""`.

<table class="table">
  <thead>
    <tr>
      <th style="width: 100px;">Name</th>
      <th style="width: 100px;">Type</th>
      <th style="width: 120px;">Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>disabledOnLoading</code></td>
      <td>boolean</td>
      <td><code>false</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>spinner</code></td>
      <td>boolean</td>
      <td><code>true</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>spinnerType</code></td>
      <td>string</td>
      <td><code>'border'</code></td>
      <td></td>
    </tr>
    <tr>
      <td><code>timeout</code></td>
      <td>boolean | number</td>
      <td><code>false</code></td>
      <td></td>
    </tr>
  </tbody>
</table>

### Methods

<table class="table">
  <thead>
    <tr>
      <th>Method</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>start</code></td>
      <td>
        Starts loading.
      </td>
    </tr>
    <tr>
      <td><code>stop</code></td>
      <td>
        Stops loading.
      </td>
    </tr>
    <tr>
      <td><code>dispose</code></td>
      <td>
        Destroys an element's loading button. (Removes stored data on the DOM element)
      </td>
    </tr>
    <tr>
      <td><code>getInstance</code></td>
      <td>
        Static method which allows you to get the multi select instance associated with a DOM element.
      </td>
    </tr>
  </tbody>
</table>

```js
var myBtnLoading = document.getElementById('btn-loading')
var myBtn = new coreui.LoadingButton(myBtnLoading)
myBtn.start()
```

### Events

Multi Select component exposes a few events for hooking into multi select functionality.

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
        <code>start.coreui.loading-button</code>
      </td>
      <td>
        Fires immediately when the start method is called.
      </td>
    </tr>
    <tr>
      <td>
        <code>stop.coreui.loading-button</code>
      </td>
      <td>
        Fires immediately when the stop method is called.
      </td>
    </tr>
  </tbody>
</table>

```js
var myBtnLoading = document.getElementById('myBtnLoading')
myBtnLoading.addEventListener('stop.coreui.loading-button', function () {
  // do something...
})
```

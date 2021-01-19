---
layout: docs
title: Loading Buttons
description: Buttons with built-in loading indicators. Indicate the loading state of the button bridging the gap between action and feedback.
aliases:
  - "/components/loading-buttons/"
toc: true
---

## Basic example

{{< example >}}
<button type="button" class="btn btn-primary btn-loading">Submit</button>
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

## Progress Bar

{{< example >}}
<button type="button" class="btn btn-danger btn-loading" data-coreui-progress="true">Submit</button>
<button type="button" class="btn btn-danger btn-loading" data-coreui-progress="true" data-coreui-spinner="false">Submit</button>
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
      <td><code>percent</code></td>
      <td>number</td>
      <td><code>0</code></td>
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
      <td>number</td>
      <td><code>1000</code></td>
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
        Shows the multi select's options.
      </td>
    </tr>
    <tr>
      <td><code>stop</code></td>
      <td>
        Stops loading and reset the percent of loaded to the initial value.
      </td>
    </tr>
    <tr>
      <td><code>pause</code></td>
      <td>
        Pauses loading.
      </td>
    </tr>
    <tr>
      <td><code>resume</code></td>
      <td>
        Resumes loading.
      </td>
    </tr>
    <tr>
      <td><code>complete</code></td>
      <td>
        Sets the percent of loaded to the 100%.
      </td>
    </tr>
        <tr>
      <td><code>update</code></td>
      <td>
        Updates the configuration of loading button.
      </td>
    </tr>
    <tr>
      <td><code>updatePercent</code></td>
      <td>
        Sets the percent of loaded to the provided value.
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
    <tr>
      <td>
        <code>complete.coreui.loading-button</code>
      </td>
      <td>
        Fires immediately when the loading process is completed.
      </td>
    </tr>
  </tbody>
</table>

```js
var myBtnLoading = document.getElementById('myBtnLoading')
myBtnLoading.addEventListener('complete.coreui.loading-button', function () {
  // do something...
})
```

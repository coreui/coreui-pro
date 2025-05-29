---
layout: docs
title: Password Input
description: Enhance your password input fields in Bootstrap with custom styles, sizing options, toggle visibility button, and more.
group: forms
toc: true
bootstrap: true
pro_component: true
---

## Example

Use the `form-password` wrapper to add a visibility toggle button to standard Bootstrap password input fields.

{{< example stackblitz_pro="true" >}}
<div class="mb-3">
  <label for="examplePasswordInput1" class="form-label">Password</label>
  <div class="form-password">
    <input type="password" class="form-control" id="examplePasswordInput1" placeholder="Enter your password">
    <button type="button" class="form-password-action" data-coreui-toggle="password" aria-label="Toggle password visibility">
      <span class="form-password-action-icon"></span>
    </button>
  </div>
</div>
<div class="mb-3">
  <label for="examplePasswordInput2" class="form-label">Password with value</label>
  <div class="form-password">
    <input type="password" class="form-control" id="examplePasswordInput2" placeholder="Enter your password" value="Top secret">
    <button type="button" class="form-password-action" data-coreui-toggle="password" aria-label="Toggle password visibility">
      <span class="form-password-action-icon"></span>
    </button>
  </div>
</div>
{{< /example >}}

## Sizing variants

Bootstrap Password Input supports different sizes using Bootstrap's sizing utilities like `.form-control-lg` and `.form-control-sm`.

{{< example stackblitz_pro="true" >}}
<div class="form-password">
  <input type="password" class="form-control form-control-lg" placeholder="Large password input">
    <button type="button" class="form-password-action" data-coreui-toggle="password" aria-label="Toggle password visibility">
      <span class="form-password-action-icon"></span>
    </button>
</div>
<div class="form-password">
  <input type="password" class="form-control" placeholder="Default password input">
    <button type="button" class="form-password-action" data-coreui-toggle="password" aria-label="Toggle password visibility">
      <span class="form-password-action-icon"></span>
    </button>
</div>
<div class="form-password">
  <input type="password" class="form-control form-control-sm" placeholder="Small password input">
    <button type="button" class="form-password-action" data-coreui-toggle="password" aria-label="Toggle password visibility">
      <span class="form-password-action-icon"></span>
    </button>
</div>
{{< /example >}}

## Disabled state

To make a Bootstrap Password Input non-interactive, add the `disabled` attribute to the `<input>` and the toggle `<button>`.

{{< example stackblitz_pro="true" >}}
<div class="form-password">
  <input type="password" class="form-control" placeholder="Disabled password input" disabled>
  <button type="button" class="form-password-action" data-coreui-toggle="password" disabled aria-label="Toggle password visibility">
    <span class="form-password-action-icon"></span>
  </button>
</div>
<div class="form-password">
  <input type="password" class="form-control" placeholder="Disabled and readonly input" disabled readonly>
  <button type="button" class="form-password-action" data-coreui-toggle="password" disabled aria-label="Toggle password visibility">
    <span class="form-password-action-icon"></span>
  </button>
</div>
{{< /example >}}

## Readonly state

Use the `readonly` attribute to make the input non-editable but still selectable. This is useful for displaying values without allowing user changes.

{{< example stackblitz_pro="true" >}}
<div class="form-password">
  <input type="password" class="form-control" placeholder="Readonly password input" value="Readonly input here..." readonly>
    <button type="button" class="form-password-action" data-coreui-toggle="password" aria-label="Toggle password visibility">
      <span class="form-password-action-icon"></span>
    </button>
</div>
{{< /example >}}

## Usage

{{< bootstrap-compatibility >}}

Via data attributes, the password input plugin toggles visibility of the password by toggling the type of input field. Add `data-coreui-toggle="password"` to the button to toggle a password visibility.

```html
<div class="form-password">
  <input type="password" class="form-control" placeholder="Readonly password input" value="Readonly input here..." readonly>
    <button type="button" class="form-password-action" data-coreui-toggle="password" aria-label="Toggle password visibility">
      <span class="form-password-action-icon"></span>
    </button>
</div>
```

## Customization options

### SASS variables

Customize the appearance of the Bootstrap Password Input using the following SASS variables:

Variables prefixed with `$input-*` are shared across most Bootstrap form controls.

{{< scss-docs name="form-input-variables" file="scss/_variables.scss" >}}

Variables like `$form-password-*` apply specifically to password input wrappers.

{{< scss-docs name="form-password-variables" file="scss/_variables.scss" >}}
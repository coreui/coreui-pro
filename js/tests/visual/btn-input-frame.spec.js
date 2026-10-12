/*!
 * Buttons and form controls share the weight of one frame, declared once on
 * `:root`, so a weight retuned there reaches both. Only a real browser with the
 * stylesheet can tell, which is why this lives in the visual suite.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container
let rootProperty

const mount = (property, value) => {
  rootProperty = property
  document.documentElement.style.setProperty(property, value)
  container = document.createElement('div')
  container.innerHTML = `<div class="input-group">
      <span class="input-group-text" id="addon">@</span>
      <input type="text" class="form-control" aria-label="Name" id="field">
      <button class="btn btn-outline theme-secondary" type="button" id="button">Go</button>
    </div>
    <button class="search-button" type="button" id="search"><span class="search-button-placeholder">Search</span></button>
    <button class="btn btn-link" type="button" id="link">Go</button>`
  document.body.append(container)
}

const weights = () => ['#button', '#field', '#addon', '#search', '#link'].map(selector => getComputedStyle(container.querySelector(selector)).fontWeight)

afterEach(() => {
  container?.remove()
  document.documentElement.style.removeProperty(rootProperty)
})

describe('btn-input frame', () => {
  it('should give buttons and fields the frame weight set on :root, and keep the link button normal', () => {
    mount('--cui-btn-input-font-weight', '600')

    expect(weights()).toEqual(['600', '600', '600', '600', '400'])
  })

  it('should give buttons and fields the body weight set on :root', () => {
    mount('--cui-body-font-weight', '300')

    expect(weights()).toEqual(['300', '300', '300', '300', '400'])
  })
})

/*!
 * A range slider shows a given state on every thumb, while only the first
 * handle blocks the submit, so the others stay valid for the browser. In a
 * form that opts in to success styling they match `:user-valid` after a
 * submit, and only a real browser with the stylesheet can tell which colour
 * wins.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { page } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import RangeSlider from '../../src/range-slider.js'

let container
let rangeSlider

const mount = validationState => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 2rem; width: 420px;'
  container.innerHTML = '<form data-coreui-validate="valid" novalidate><div></div><div class="invalid-feedback">Pick a budget.</div><button>Save</button></form>'
  document.body.append(container)

  const form = container.querySelector('form')
  form.addEventListener('submit', event => event.preventDefault())
  rangeSlider = new RangeSlider(form.firstElementChild, { tooltips: false, validationState, value: [0, 100] })
  form.querySelector('button').click()

  return [...form.querySelectorAll('.form-range-input')]
}

const pixelAt = async (element, x, y) => {
  const image = new Image()
  image.src = `data:image/png;base64,${await page.screenshot({ element, save: false })}`
  await image.decode()

  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)

  const scale = image.width / element.getBoundingClientRect().width

  return [...context.getImageData(Math.round(x * scale), Math.round(y * scale), 1, 1).data].slice(0, 3)
}

const tokenColour = async name => {
  const probe = document.createElement('div')
  probe.style.cssText = `width: 20px; height: 20px; background: var(${name});`
  container.append(probe)
  const colour = await pixelAt(probe, 10, 10)
  probe.remove()
  return colour
}

const thumbColours = inputs => {
  const probe = document.createElement('div')
  probe.style.cssText = 'position: absolute; width: var(--cui-range-thumb-width);'
  inputs[0].after(probe)
  const thumb = probe.getBoundingClientRect().width
  probe.remove()

  return Promise.all(inputs.map((input, index) => {
    const { height, width } = input.getBoundingClientRect()

    return pixelAt(input, index === 0 ? thumb / 2 : width - (thumb / 2), height / 2)
  }))
}

describe('range slider validation', () => {
  afterEach(() => {
    rangeSlider?.dispose()
    rangeSlider = null
    container?.remove()
  })

  it('paints every thumb with a given invalid state, also the handles the browser finds valid', async () => {
    const inputs = mount('invalid')
    const danger = await tokenColour('--cui-danger-bg')

    expect(inputs[1].matches(':user-valid')).toBeTrue()
    expect(await thumbColours(inputs)).toEqual([danger, danger])
  })

  it('paints every thumb with a given valid state', async () => {
    const inputs = mount('valid')
    const success = await tokenColour('--cui-success-bg')

    expect(await thumbColours(inputs)).toEqual([success, success])
  })
})

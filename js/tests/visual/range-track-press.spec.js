/*!
 * A press on the track of a multi-thumb range moves the nearest thumb so its
 * centre lands under the pointer, which only holds while the plugin and the
 * stylesheet agree on the thumb's travel. Only a real browser with the
 * stylesheet can tell, which is why this lives in the visual suite.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { userEvent } from '@vitest/browser/context'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Range from '../../src/range.js'

let container
let range

const mount = (vertical = false) => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 1rem; width: 420px;'
  container.innerHTML = `<div class="form-range${vertical ? ' form-range-vertical' : ''}">
      <input type="range" class="form-range-input" value="25" aria-label="Minimum">
      <input type="range" class="form-range-input" value="75" aria-label="Maximum">
    </div>`
  document.body.append(container)

  const element = container.querySelector('.form-range')
  range = new Range(element)

  return { element, inputs: [...element.querySelectorAll('.form-range-input')] }
}

const thumbWidth = element => {
  const probe = document.createElement('div')
  probe.style.cssText = 'position: absolute; width: var(--cui-range-thumb-width);'
  element.append(probe)
  const { width } = probe.getBoundingClientRect()
  probe.remove()

  return width
}

afterEach(() => {
  range?.dispose()
  container?.remove()
})

describe('range track press', () => {
  it('lands the nearest thumb centre under the pointer', async () => {
    const { element, inputs } = mount()
    const rect = inputs[0].getBoundingClientRect()
    const thumb = thumbWidth(element)
    const press = value => userEvent.click(element, {
      force: true,
      position: { x: (thumb / 2) + ((value / 100) * (rect.width - thumb)), y: rect.height / 2 }
    })

    await press(60)
    expect(inputs.map(input => input.value)).toEqual(['25', '60'])

    await press(90)
    expect(inputs.map(input => input.value)).toEqual(['25', '90'])

    await press(10)
    expect(inputs.map(input => input.value)).toEqual(['10', '90'])
  })

  it('leaves a thumb where it is when the press lands on its centre', async () => {
    const { element, inputs } = mount()
    const rect = inputs[0].getBoundingClientRect()
    const thumb = thumbWidth(element)

    const press = value => userEvent.click(element, {
      force: true,
      position: { x: (thumb / 2) + ((value / 100) * (rect.width - thumb)), y: rect.height / 2 }
    })

    await press(25)
    await press(75)

    expect(inputs.map(input => input.value)).toEqual(['25', '75'])
  })

  it('measures the press along the vertical track from the bottom', async () => {
    const { element, inputs } = mount(true)
    const rect = inputs[0].getBoundingClientRect()
    const thumb = thumbWidth(element)
    const y = rect.height - ((thumb / 2) + (0.9 * (rect.height - thumb)))

    await userEvent.click(element, { force: true, position: { x: rect.width / 2, y } })

    expect(inputs.map(input => input.value)).toEqual(['25', '90'])
  })
})

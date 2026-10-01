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

const OBLONG = '--cui-range-thumb-width: 2rem; --cui-range-thumb-height: 1rem;'

const mount = ({ className = '', config = {}, dir = 'ltr', style = '', vertical = false } = {}) => {
  container = document.createElement('div')
  container.dir = dir
  container.style.cssText = 'padding: 4rem; width: 420px;'
  container.innerHTML = `<div class="form-range${vertical ? ' form-range-vertical' : ''} ${className}" style="${style}">
      <input type="range" class="form-range-input" value="25" aria-label="Minimum">
      <input type="range" class="form-range-input" value="75" aria-label="Maximum">
    </div>`
  document.body.append(container)

  const element = container.querySelector('.form-range')
  range = new Range(element, config)

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

const geometry = (element, inputs, vertical = false) => {
  const rect = inputs[0].getBoundingClientRect()
  const thumb = thumbWidth(element)
  const along = value => (vertical ?
    rect.bottom - ((thumb / 2) + ((value / 100) * (rect.height - thumb))) :
    rect.left + (thumb / 2) + ((value / 100) * (rect.width - thumb)))
  const press = value => {
    const { left, top } = element.getBoundingClientRect()
    const position = vertical ?
      { x: rect.left - left + (rect.width / 2), y: along(value) - top } :
      { x: along(value) - left, y: rect.top - top + (rect.height / 2) }

    return userEvent.click(element, { force: true, position })
  }

  return { along, press, rect }
}

afterEach(() => {
  range?.dispose()
  container?.remove()
})

describe('range track press', () => {
  it('lands the nearest thumb centre under the pointer and focuses it', async () => {
    const { element, inputs } = mount()
    const { press } = geometry(element, inputs)

    await press(60)
    expect(inputs.map(input => input.value)).toEqual(['25', '60'])
    expect(document.activeElement).toEqual(inputs[1])

    await press(90)
    expect(inputs.map(input => input.value)).toEqual(['25', '90'])

    await press(10)
    expect(inputs.map(input => input.value)).toEqual(['10', '90'])
    expect(document.activeElement).toEqual(inputs[0])
  })

  it('leaves a press on a thumb to the thumb itself', async () => {
    const { element, inputs } = mount()
    const { along, press, rect } = geometry(element, inputs)
    const middle = rect.top + (rect.height / 2)

    expect(document.elementFromPoint(along(25), middle)).toEqual(inputs[0])
    expect(document.elementFromPoint(along(75), middle)).toEqual(inputs[1])

    await press(25)
    await press(75)

    expect(inputs.map(input => input.value)).toEqual(['25', '75'])
  })

  it('measures the press along the vertical track from the bottom', async () => {
    const { element, inputs } = mount({ vertical: true })
    const { press } = geometry(element, inputs, true)

    await press(90)

    expect(inputs.map(input => input.value)).toEqual(['25', '90'])
  })

  it('measures the press along an oblong thumb in a vertical range', async () => {
    const { element, inputs } = mount({ style: OBLONG, vertical: true })
    const { press } = geometry(element, inputs, true)

    await press(60)

    expect(inputs.map(input => input.value)).toEqual(['25', '60'])
  })

  it('keeps the focus on the thumb a clickable tick moves', async () => {
    const { element, inputs } = mount({ config: { clickableTicks: true, ticks: ['Low', 'High'] } })

    await userEvent.click(element.querySelectorAll('.form-range-tick-label')[1])

    expect(inputs.map(input => input.value)).toEqual(['25', '100'])
    expect(document.activeElement).toEqual(inputs[1])
  })

  it('gives a clickable tick a target as wide as the thumb', () => {
    const { element, inputs } = mount({ config: { clickableTicks: true, ticks: [0, 50, 100] } })
    const { along } = geometry(element, inputs)
    const tick = element.querySelectorAll('.form-range-tick')[1]
    const y = tick.getBoundingClientRect().top + 2

    for (const offset of [-6, 0, 6]) {
      expect(document.elementFromPoint(along(50) + offset, y)).toEqual(tick)
    }
  })

  for (const vertical of [false, true]) {
    it(`centres the tooltips and the end ticks on the thumbs of a ${vertical ? 'vertical' : 'horizontal'} range with an oblong thumb`, () => {
      const { element, inputs } = mount({ config: { ticks: ['Low', 'High'], tooltips: 'always' }, style: OBLONG, vertical })
      const { along } = geometry(element, inputs, vertical)
      const centre = node => {
        const box = node.getBoundingClientRect()
        return vertical ? box.top + (box.height / 2) : box.left + (box.width / 2)
      }

      const arrows = [...element.querySelectorAll('.form-range-tooltip .tooltip-arrow')]
      expect(centre(arrows[0])).toBeCloseTo(along(25), 0)
      expect(centre(arrows[1])).toBeCloseTo(along(75), 0)

      const ticks = [...element.querySelectorAll('.form-range-tick')]
      const line = tick => (vertical ? tick.getBoundingClientRect().top : tick.getBoundingClientRect().left)
      expect(line(ticks[0])).toBeCloseTo(along(0), 0)
      expect(line(ticks[1])).toBeCloseTo(along(100), 0)
    })
  }

  it('keeps the end tick labels inside a horizontal range', () => {
    const { element } = mount({ config: { ticks: ['Minimum', 'Maximum'] } })
    const box = element.getBoundingClientRect()

    for (const label of element.querySelectorAll('.form-range-tick-label')) {
      const rect = label.getBoundingClientRect()
      expect(rect.left).toBeGreaterThanOrEqual(box.left - 0.5)
      expect(rect.right).toBeLessThanOrEqual(box.right + 0.5)
    }
  })

  it('centres the end tick labels on their lines in a vertical range', () => {
    const { element } = mount({ config: { ticks: ['Low', 'High'] }, vertical: true })

    for (const tick of element.querySelectorAll('.form-range-tick')) {
      const label = tick.querySelector('.form-range-tick-label').getBoundingClientRect()
      expect(label.top + (label.height / 2)).toBeCloseTo(tick.getBoundingClientRect().top, 0)
    }
  })

  it('stacks the thumbs on one track despite the padding of the wrapper', () => {
    const { inputs } = mount({ className: 'px-4 pt-4' })
    const [first, second] = inputs.map(input => input.getBoundingClientRect())

    expect([second.left, second.top, second.width]).toEqual([first.left, first.top, first.width])
  })

  it('stacks the thumbs on one track and puts the tooltips beside it in a right-to-left vertical range', () => {
    const { element, inputs } = mount({ config: { tooltips: 'always' }, dir: 'rtl', vertical: true })
    const [first, second] = inputs.map(input => input.getBoundingClientRect())

    expect([second.left, second.top, second.height]).toEqual([first.left, first.top, first.height])

    for (const tooltip of element.querySelectorAll('.form-range-tooltip')) {
      expect(tooltip).toHaveClass('bs-tooltip-end')
      expect(tooltip.getBoundingClientRect().left).toBeGreaterThanOrEqual(first.right)
    }
  })

  it('sizes a vertical range to the control, not to its container', () => {
    const { element, inputs } = mount({ config: { ticks: ['Low', 'High'] }, vertical: true })
    const ticks = element.querySelector('.form-range-ticks')

    expect(element.getBoundingClientRect().width).toBeCloseTo(inputs[0].getBoundingClientRect().width + ticks.getBoundingClientRect().width, 0)
  })
})

/*!
 * In forced colors mode the browser replaces author colors with system colors.
 * The mark of a checkbox and a radio, the thumb of a switch and the track, fill
 * and thumb of a range are drawn only with a background, so each has to get a
 * system color or an outline to stay visible. Only the stylesheet decides it,
 * so only a real browser with it can tell. `getComputedStyle()` does not reach
 * the thumb and track of a range, so they are read through the DevTools protocol.
 */

import { cdp, userEvent } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let host

const mount = html => {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  return host.querySelector('#field')
}

const resolved = (property, value) => {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  host.append(probe)
  const result = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return result
}

const sliderParts = async input => {
  const session = cdp()
  input.dataset.forcedProbe = 'slider'
  input.getBoundingClientRect()
  await new Promise(requestAnimationFrame)
  await session.send('DOM.enable')
  await session.send('CSS.enable')
  const { root } = await session.send('DOM.getDocument', { depth: -1, pierce: true })
  const parts = {}
  const walk = (node, inside) => {
    const attributes = node.attributes ?? []
    const isInput = attributes.includes('data-forced-probe')
    if (inside && node.nodeType === 1) {
      const id = attributes[attributes.indexOf('id') + 1]
      if (attributes.includes('id') && ['thumb', 'track'].includes(id)) {
        parts[id] = node.nodeId
      }
    }

    for (const child of [...(node.children ?? []), ...(node.shadowRoots ?? []), ...(node.contentDocument ? [node.contentDocument] : [])]) {
      walk(child, inside || isInput)
    }
  }

  walk(root, false)
  delete input.dataset.forcedProbe
  const styles = await Promise.all(Object.entries(parts).map(async ([part, nodeId]) => {
    const { computedStyle } = await session.send('CSS.getComputedStyleForNode', { nodeId })
    return [part, Object.fromEntries(computedStyle.map(({ name, value }) => [name, value]))]
  }))

  return Object.fromEntries(styles)
}

const forceColors = () => cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })

const MARKS = [
  ['a checked checkbox', '<input type="checkbox" class="check" id="field" checked>'],
  ['an indeterminate checkbox', '<input type="checkbox" class="check" id="field">', field => {
    field.indeterminate = true
  }],
  ['a checked radio', '<input type="radio" class="radio" id="field" checked>']
]

const SWITCHES = [
  ['an unchecked switch', '<input type="checkbox" class="switch" role="switch" id="field">'],
  ['a checked switch', '<input type="checkbox" class="switch" role="switch" id="field" checked>']
]

const THEMED_RANGES = [
  ['a range in a themed wrapper', '<div class="form-range theme-warning"><input type="range" class="form-range-input" id="field"></div>'],
  ['a themed bare range input', '<input type="range" class="form-range theme-warning" id="field">']
]

const RANGES = [
  ['a range in its wrapper', '<div class="form-range"><input type="range" class="form-range-input" id="field"></div>'],
  ['a bare range input', '<input type="range" class="form-range" id="field">']
]

describe('forced colors form controls', () => {
  beforeAll(() => {
    const style = document.createElement('style')
    style.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'
    document.head.append(style)
  })

  afterEach(async () => {
    host?.remove()
    host = null
    await cdp().send('Emulation.setEmulatedMedia', { features: [] })
  })

  for (const [name, html, prepare] of MARKS) {
    it(`should paint the mark of ${name} with CanvasText in forced colors`, async () => {
      await forceColors()
      const field = mount(html)
      prepare?.(field)
      const mark = getComputedStyle(field, '::before')

      expect(mark.opacity).toBe('1')
      expect(mark.backgroundColor).toBe(resolved('background-color', 'CanvasText'))
    })
  }

  it('should keep the mark of an unchecked checkbox and radio hidden in forced colors', async () => {
    await forceColors()

    expect(getComputedStyle(mount('<input type="checkbox" class="check" id="field">'), '::before').opacity).toBe('0')
    host.remove()
    expect(getComputedStyle(mount('<input type="radio" class="radio" id="field">'), '::before').opacity).toBe('0')
  })

  for (const [name, html] of SWITCHES) {
    it(`should outline the thumb of ${name} in forced colors`, async () => {
      await forceColors()
      const thumb = getComputedStyle(mount(html), '::before')

      expect(thumb.outlineStyle).toBe('solid')
      expect(thumb.outlineWidth).toBe('1px')
      expect(thumb.outlineColor).toBe(resolved('outline-color', 'CanvasText'))
    })
  }

  for (const [name, html] of RANGES) {
    it(`should paint ${name} with system colors in forced colors`, async () => {
      await forceColors()
      const field = getComputedStyle(mount(html))

      expect(field.forcedColorAdjust).toBe('none')
      expect(field.getPropertyValue('--cui-range-track-bg')).toBe('Canvas')
      expect(field.getPropertyValue('--cui-range-track-fill-bg')).toBe('Highlight')
      expect(field.getPropertyValue('--cui-range-thumb-bg')).toBe('ButtonText')
      expect(field.getPropertyValue('--cui-range-thumb-active-bg')).toBe('Highlight')
      expect(field.getPropertyValue('--cui-range-track-disabled-bg')).toBe('GrayText')
      expect(field.getPropertyValue('--cui-range-thumb-disabled-bg')).toBe('GrayText')
    })
  }

  for (const [name, html] of [...RANGES, ...THEMED_RANGES]) {
    it(`should paint the thumb and fill of ${name} with system colors in forced colors`, async () => {
      await forceColors()
      const { thumb, track } = await sliderParts(mount(html))

      expect(thumb['background-color']).toBe(resolved('background-color', 'ButtonText'))
      expect(track['--cui-theme-bg']).toBe('Highlight')
      expect(track['outline-style']).toBe('solid')
    })
  }

  for (const [name, html] of [RANGES[0], THEMED_RANGES[0], THEMED_RANGES[1]]) {
    it(`should draw the focus ring of ${name} in Highlight in forced colors`, async () => {
      await forceColors()
      const field = mount(html)
      await userEvent.keyboard('{Shift}')
      field.focus()
      const { thumb } = await sliderParts(field)

      expect(field.matches(':focus-visible')).toBeTrue()
      expect(thumb['outline-style']).toBe('solid')
      expect(thumb['outline-color']).toBe(resolved('outline-color', 'Highlight'))
    })
  }

  it('should keep a validated range visible in forced colors', async () => {
    await forceColors()
    const { thumb, track } = await sliderParts(mount('<div class="form-range"><input type="range" class="form-range-input is-valid" id="field"></div>'))

    expect(thumb['background-color']).not.toBe(resolved('background-color', 'Canvas'))
    expect(track['--cui-theme-bg']).toBe('Highlight')
  })

  it('should leave the controls alone outside forced colors', () => {
    expect(getComputedStyle(mount('<input type="checkbox" class="switch" role="switch" id="field">'), '::before').outlineStyle).toBe('none')
    host.remove()

    const range = getComputedStyle(mount(RANGES[0][1]))
    expect(range.forcedColorAdjust).toBe('auto')
    expect(range.getPropertyValue('--cui-range-thumb-bg')).not.toBe('ButtonText')
  })
})

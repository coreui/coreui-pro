/*!
 * Monospace elements size themselves against the surrounding text.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'

let container

afterEach(() => container?.remove())

const ratio = selector => {
  const size = element => Number.parseFloat(getComputedStyle(element).fontSize)

  return size(container.querySelector(selector)) / size(container.firstElementChild)
}

describe('monospace font size', () => {
  beforeEach(() => {
    container = document.createElement('div')
    container.innerHTML = `<p style="font-size: 32px">
        <samp>out</samp> <kbd id="key">cd</kbd> <kbd><kbd id="nested">ctrl</kbd></kbd> <code>x</code>
      </p>
      <div style="font-size: 32px"><pre><code>y</code></pre><pre><samp>z</samp></pre></div>
      <p id="retyped" style="font-size: 32px; --cui-code-font-size: 1em"><samp>out</samp> <code>x</code></p>`
    document.body.append(container)
  })

  for (const [selector, expected] of [
    ['samp', 0.875],
    ['#key', 0.75],
    ['#nested', 0.75],
    ['p > code', 0.875]
  ]) {
    it(`should render ${selector} at ${expected}em of the paragraph`, () => {
      expect(ratio(selector)).toBeCloseTo(expected, 3)
    })
  }

  it('should render code in pre at .875em of the text around the pre', () => {
    const pre = container.querySelector('pre')
    const code = pre.querySelector('code')

    expect(Number.parseFloat(getComputedStyle(code).fontSize) / 32).toBeCloseTo(0.875, 3)
    expect(getComputedStyle(code).fontSize).toBe(getComputedStyle(pre).fontSize)
  })

  it('should render samp in pre at the size of code in pre', () => {
    const [codePre, sampPre] = container.querySelectorAll('pre')

    expect(getComputedStyle(sampPre.querySelector('samp')).fontSize).toBe(getComputedStyle(codePre.querySelector('code')).fontSize)
  })

  it('should size samp from --cui-code-font-size like code', () => {
    const retyped = container.querySelector('#retyped')

    expect(Number.parseFloat(getComputedStyle(retyped.querySelector('samp')).fontSize) / 32).toBeCloseTo(1, 3)
    expect(getComputedStyle(retyped.querySelector('samp')).fontSize).toBe(getComputedStyle(retyped.querySelector('code')).fontSize)
  })
})

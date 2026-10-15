import * as icons from '../../../src/util/icons.js'
import { sanitizeHtml, SVGAllowlist } from '../../../src/util/sanitizer.js'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

const parse = markup => {
  const host = document.createElement('div')
  host.innerHTML = markup
  return host.firstElementChild
}

describe('icons', () => {
  for (const [name, markup] of Object.entries(icons)) {
    it(`should parse ${name} as a standalone SVG document`, () => {
      const svg = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement

      expect(svg.namespaceURI).toEqual(SVG_NAMESPACE)
      expect(svg.localName).toEqual('svg')
      expect(svg.getElementsByTagName('parsererror')).toHaveSize(0)
    })

    it(`should paint ${name} with the current color`, () => {
      const svg = parse(markup)

      expect(svg.namespaceURI).toEqual(SVG_NAMESPACE)
      expect(svg.getAttribute('viewBox')).toMatch(/^[\d.]+ [\d.]+ [\d.]+ [\d.]+$/)
      expect([svg.getAttribute('fill'), svg.getAttribute('stroke')]).toContain('currentColor')
      expect(svg.childElementCount).toBeGreaterThan(0)
    })

    it(`should keep ${name} intact through the SVG allow list`, () => {
      const svg = parse(sanitizeHtml(markup, SVGAllowlist))

      expect(svg.outerHTML).toEqual(parse(markup).outerHTML)
    })
  }
})

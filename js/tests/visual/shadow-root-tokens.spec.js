/*!
 * A stylesheet adopted by a shadow root declares every root token on the host.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import css from '../../../scss/coreui.scss?inline'
import gridCss from '../../../scss/coreui-grid.scss?inline'

const rootTokens = rules => [...rules].flatMap(rule => {
  if (rule.selectorText === undefined) {
    return rule.cssRules ? rootTokens(rule.cssRules) : []
  }

  if (!rule.selectorText.split(',').some(selector => selector.trim() === ':root')) {
    return []
  }

  return [...rule.style].filter(property => property.startsWith('--'))
})

const createSheet = text => {
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(text)
  return sheet
}

describe('Root tokens in a shadow root', () => {
  let host

  const mount = (sheet, markup) => {
    host = document.createElement('div')
    host.className = 'widget'
    document.body.append(host)
    const shadow = host.attachShadow({ mode: 'open' })
    shadow.adoptedStyleSheets = [sheet]
    shadow.innerHTML = markup

    return shadow.firstElementChild
  }

  const compare = (sheet, names) => {
    const tokens = [...new Set(rootTokens(sheet.cssRules))]
    const probe = mount(sheet, '<div></div>')
    const values = element => {
      const style = getComputedStyle(element)
      return Object.fromEntries(tokens.map(token => [token, style.getPropertyValue(token)]))
    }

    const inShadow = values(probe)
    document.adoptedStyleSheets = [sheet]
    const inDocument = values(document.documentElement)

    for (const name of names) {
      expect(tokens).toContain(name)
      expect(inDocument[name]).not.toBe('')
    }

    expect(inShadow).toEqual(inDocument)
  }

  afterEach(() => {
    document.adoptedStyleSheets = []
    host.remove()
  })

  it('resolves every token declared on :root to the same value as in the document', () => {
    compare(createSheet(css), ['--cui-spacer-3', '--cui-breakpoint-md', '--cui-paragraph-margin-bottom'])
  })

  it('resolves the spacing and breakpoint tokens of the grid bundle', () => {
    compare(createSheet(gridCss), ['--cui-spacer-3', '--cui-breakpoint-md'])
  })

  it('pads the tooltip body inside a shadow root', () => {
    const sheet = createSheet(css)
    const tooltip = mount(sheet, '<div class="tooltip show" role="tooltip"><div class="tooltip-inner">Tooltip</div></div>')
    const copy = document.createElement('div')
    copy.innerHTML = tooltip.outerHTML
    document.body.append(copy)

    const padding = element => getComputedStyle(element).padding
    const inShadow = padding(tooltip.querySelector('.tooltip-inner'))
    document.adoptedStyleSheets = [sheet]
    const inDocument = padding(copy.querySelector('.tooltip-inner'))
    copy.remove()

    expect(inShadow).not.toBe('0px')
    expect(inShadow).toBe(inDocument)
  })

  it('takes a token the page sets on the host element, not one it sets on :root', () => {
    const sheet = createSheet(css)
    const paragraph = mount(sheet, '<p>Text</p>')
    const spacer = () => getComputedStyle(paragraph).getPropertyValue('--cui-spacer')

    document.adoptedStyleSheets = [sheet, createSheet(':root { --cui-spacer: .75rem; }')]
    expect(spacer()).toBe('1rem')

    document.adoptedStyleSheets = [sheet, createSheet('.widget { --cui-spacer: .75rem; }')]
    expect(spacer()).toBe('.75rem')
    expect(getComputedStyle(paragraph).marginBottom).toBe('12px')
  })
})

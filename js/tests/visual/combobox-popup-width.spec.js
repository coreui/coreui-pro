/*!
 * The width of a combobox panel: never narrower than its field by default, the page's own through the token.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { page } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import MultiSelect from '../../src/multi-select.js'

const docsRule = '.combobox-popup { --cui-combobox-popup-min-width: max(var(--cui-anchor-width, 100%), min(20rem, 100vw - 2rem)); }'

let container
let instance

const open = async (fieldWidth, css = '', label = 'One') => {
  container = document.createElement('div')
  container.innerHTML = `<style>${css}</style><div style="width: ${fieldWidth}"><select id="host"><option value="1">${label}</option></select></div>`
  document.body.append(container)
  instance = new MultiSelect(container.querySelector('#host'))
  instance.show()
  await instance._anchoredPosition.ready
  return [instance._wrapperElement.getBoundingClientRect().width, instance._menu.getBoundingClientRect()]
}

const close = () => {
  instance?.dispose()
  instance = null
  container?.remove()
  container = null
}

describe('Combobox panel width', () => {
  afterEach(close)

  it('should be as wide as its field when its options are narrower', async () => {
    const [field, panel] = await open('400px')

    expect(panel.width).toBeCloseTo(field, 1)
  })

  it('should grow past its field for an option wider than the field', async () => {
    const [field, panel] = await open('150px', '', 'An option with a label much wider than its field')

    expect(panel.width).toBeGreaterThan(field + 50)
  })

  it('should take 100% of its containing block without --cui-anchor-width', () => {
    container = document.createElement('div')
    container.innerHTML = '<div style="position: relative; width: 300px"><div class="popup combobox-popup show">One</div></div>'
    document.body.append(container)

    expect(container.querySelector('.combobox-popup').getBoundingClientRect().width).toBeCloseTo(300, 1)
  })

  it('should take the min-width the page sets on the token', async () => {
    const [field, panel] = await open('200px', '.combobox-popup { --cui-combobox-popup-min-width: 30rem; }')

    expect(field).toBeCloseTo(200, 1)
    expect(panel.width).toBeCloseTo(480, 1)
  })

  it('should keep the panel no narrower than the field under the docs max() rule', async () => {
    const [wide, widePanel] = await open('400px', docsRule)

    expect(widePanel.width).toBeCloseTo(wide, 1)
    close()

    const [, narrowPanel] = await open('200px', docsRule)

    expect(narrowPanel.width).toBeCloseTo(320, 1)
  })

  it('should keep the docs max() rule inside a 320px viewport with large text', async () => {
    const { innerWidth, innerHeight } = window
    await page.viewport(320, 640)

    try {
      const [, panel] = await open('200px', `html { font-size: 20px; } ${docsRule}`)

      expect(panel.right).toBeLessThanOrEqual(document.documentElement.clientWidth)
    } finally {
      await page.viewport(innerWidth, innerHeight)
    }
  })
})

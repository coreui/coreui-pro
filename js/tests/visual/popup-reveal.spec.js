/*!
 * Where the focused entry of a popup ends up on screen. Focus moves into the
 * panel before Floating UI has placed it, so the panel reveals the entry
 * itself once it is positioned — the roll column, the viewport, or the page
 * when the mobile branch never positions at all. Only a real layout with the
 * stylesheet can measure any of it.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { page } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import DatePicker from '../../src/date-picker.js'
import TimePicker from '../../src/time-picker.js'
import Popup from '../../src/util/popup.js'

let container

const mount = html => {
  container = document.createElement('div')
  container.style.cssText = 'padding: 1rem; width: 480px;'
  container.innerHTML = html || '<div id="host"></div>'
  document.body.append(container)
  return container.querySelector('#host')
}

const settle = () => new Promise(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(resolve))
})

const inViewport = element => {
  const rect = element.getBoundingClientRect()
  return rect.top >= 0 && rect.bottom <= window.innerHeight
}

const inColumn = cell => {
  const column = cell.parentElement
  return cell.offsetTop >= column.scrollTop && cell.offsetTop + cell.offsetHeight <= column.scrollTop + column.clientHeight
}

beforeAll(async () => {
  await page.viewport(640, 760)

  const style = document.createElement('style')
  style.id = 'visual-freeze'
  style.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }'
  document.head.append(style)
})

afterEach(() => {
  container?.remove()
  container = null
  window.scrollTo(0, 0)
})

describe('popup reveal', () => {
  it('should keep the selected time cell visible in its column when the picker reopens', async () => {
    const tp = new TimePicker(mount(), { locale: 'en-GB', time: '14:30:00' })

    tp.show()
    await settle()
    tp.hide()
    await settle()
    tp.show()
    await settle()

    const cell = document.activeElement
    expect(cell.dataset.coreuiHours).toEqual('14')
    expect(inColumn(cell)).toBeTrue()
    tp.dispose()
  })

  it('should bring the entry into view when the picker opens below the fold', async () => {
    const host = mount('<div style="height: 300vh"></div><div id="host"></div>')
    const dp = new DatePicker(host, { date: '2026-03-10', locale: 'en-US' })
    window.scrollTo(0, 0)

    dp.show()
    await settle()

    expect(container.contains(document.activeElement)).toBeTrue()
    expect(inViewport(document.activeElement)).toBeTrue()
    dp.dispose()
  })

  it('should bring the entry into view when the mobile branch mounts the panel away from the anchor', async () => {
    mount('<div id="host"><button id="toggle" type="button">open</button></div><div style="height: 300vh"></div><div id="panel"><button id="entry" type="button">entry</button></div>')
    const popup = new Popup({
      anchor: container.querySelector('#host'),
      container: document.body,
      content: container.querySelector('#panel'),
      focusTrap: false,
      mobileBreakpoint: 100_000
    })
    window.scrollTo(0, 0)

    popup.show()
    await settle()

    expect(document.activeElement.id).toEqual('entry')
    expect(inViewport(document.activeElement)).toBeTrue()
    popup.dispose()
  })
})

/*!
 * The width of a menu: as wide as its longest label, never wider than the viewport less 1rem.
 * Only the stylesheet decides that, so only a real browser with it can tell.
 */

import { page } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Menu from '../../src/menu.js'

const LONG = 'An item with a very long label that cannot fit on a narrow phone without wrapping'

let host
let menu

const mount = html => {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  const toggle = host.querySelector('[data-coreui-toggle="menu"]')
  menu = toggle ? new Menu(toggle) : null
  return host
}

const open = async () => {
  menu.show()
  await new Promise(resolve => {
    setTimeout(resolve, 250)
  })
}

const lines = item => {
  const style = getComputedStyle(item)
  const text = item.getBoundingClientRect().height - Number.parseFloat(style.paddingTop) - Number.parseFloat(style.paddingBottom)
  return Math.round(text / Number.parseFloat(style.lineHeight))
}

const toggle = '<button type="button" class="btn" data-coreui-toggle="menu">Menu</button>'

describe('menu width', () => {
  let size

  beforeEach(() => {
    size = [window.innerWidth, window.innerHeight]
  })

  afterEach(async () => {
    menu?.dispose()
    menu = null
    host?.remove()
    host = null
    await page.viewport(...size)
  })

  it('should wrap a long label and keep the menu inside a narrow viewport', async () => {
    await page.viewport(320, 600)
    mount(`<div>${toggle}<div class="menu"><button type="button" class="menu-item" id="long">${LONG}</button><button type="button" class="menu-item">Short</button></div></div>`)
    await open()
    const panel = host.querySelector('.menu').getBoundingClientRect()

    expect(panel.width).toBeLessThanOrEqual(320 - 16)
    expect(panel.left).toBeGreaterThanOrEqual(0)
    expect(panel.right).toBeLessThanOrEqual(320)
    expect(lines(host.querySelector('#long'))).toBeGreaterThan(1)
  })

  it('should break a long word inside the menu on a narrow viewport', async () => {
    await page.viewport(320, 600)
    mount(`<div>${toggle}<div class="menu"><button type="button" class="menu-item">firstlastname@averylongcompanydomainnameforexample.com</button></div></div>`)
    await open()
    const panel = host.querySelector('.menu')

    expect(panel.getBoundingClientRect().right).toBeLessThanOrEqual(320)
    expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth)
  })

  it('should keep the check mark of a wrapped item with a description inside the menu', async () => {
    await page.viewport(320, 600)
    mount(`<div>${toggle}<div class="menu"><button type="button" class="menu-item selected"><span class="menu-item-content">${LONG}<small class="menu-item-description">${LONG}</small></span><svg class="menu-item-check" width="16" height="16" viewBox="0 0 16 16"></svg></button></div></div>`)
    await open()
    const panel = host.querySelector('.menu')

    expect(host.querySelector('.menu-item-check').getBoundingClientRect().right).toBeLessThanOrEqual(panel.getBoundingClientRect().right)
    expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth)
  })

  it('should wrap a long header on a narrow viewport', async () => {
    await page.viewport(320, 600)
    mount(`<div>${toggle}<div class="menu"><h6 class="menu-header" id="header">${LONG}</h6><button type="button" class="menu-item">Copy</button></div></div>`)
    await open()

    expect(host.querySelector('.menu').getBoundingClientRect().right).toBeLessThanOrEqual(320)
    expect(lines(host.querySelector('#header'))).toBeGreaterThan(1)
  })

  it('should wrap a long label inside a parent that does not wrap', async () => {
    await page.viewport(320, 600)
    mount(`<div class="text-nowrap">${toggle}<div class="menu"><button type="button" class="menu-item" id="long">${LONG}</button></div></div>`)
    await open()

    expect(host.querySelector('.menu').getBoundingClientRect().right).toBeLessThanOrEqual(320)
    expect(lines(host.querySelector('#long'))).toBeGreaterThan(1)
  })

  it('should keep a label on one line in a narrow positioned parent when the viewport has room', async () => {
    await page.viewport(1024, 600)
    mount(`<div class="btn-group">${toggle}<div class="menu"><button type="button" class="menu-item" id="label">Account settings and preferences</button></div></div>`)
    await open()

    expect(lines(host.querySelector('#label'))).toBe(1)
    expect(host.querySelector('.menu').getBoundingClientRect().width).toBeGreaterThan(host.querySelector('.btn-group').getBoundingClientRect().width)
  })

  it('should let a menu in the flow of the page fill its parent', async () => {
    await page.viewport(1024, 600)
    mount('<div style="width: 400px"><div class="menu show" style="position: static" id="static"><button type="button" class="menu-item">Action</button></div></div>')

    expect(host.querySelector('#static').offsetWidth).toBe(400)
  })

  it('should keep a statically displayed menu inside its containing block', async () => {
    await page.viewport(375, 600)
    mount(`<div style="margin-left: 150px">${toggle.replace('data-coreui-toggle', 'data-coreui-display="static" data-coreui-toggle')}<div class="menu"><span class="menu-text">${LONG}</span></div></div>`)
    await open()

    expect(host.querySelector('.menu').getBoundingClientRect().right).toBeLessThanOrEqual(375)
  })

  it('should let a page width on the menu win', async () => {
    await page.viewport(1024, 600)
    mount(`<style>@layer components { .page-width { width: 18rem; } }</style><div>${toggle}<div class="menu page-width"><button type="button" class="menu-item">Action</button></div></div>`)
    await open()

    expect(host.querySelector('.menu').offsetWidth).toBe(288)
  })
})

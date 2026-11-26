/*!
 * A menu item focused from the keyboard looks different from a hovered, an
 * active and an open submenu item, and stays visible in forced colors. Only
 * the stylesheet decides that, so only a real browser with it can tell.
 */

import { cdp, page, userEvent } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Menu from '../../src/menu.js'

let host
let menu

const mount = html => {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  menu = new Menu(host.querySelector('[data-coreui-toggle="menu"]'))
  return host
}

const resolved = (property, value) => {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  host.querySelector('.menu').append(probe)
  const result = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return result
}

const MENU = [
  '<button type="button" class="btn" data-coreui-toggle="menu">Menu</button>',
  '<div class="menu">',
  '  <button type="button" class="menu-item" id="plain">Plain</button>',
  '  <button type="button" class="menu-item active" id="current">Current</button>',
  '  <button type="button" class="menu-item" id="icon"><svg class="menu-item-icon fg-3" viewBox="0 0 16 16"></svg>Copy</button>',
  '  <button type="button" class="menu-item theme-danger" id="danger">Delete</button>',
  '  <div class="submenu">',
  '    <button type="button" class="menu-item" id="more">More</button>',
  '    <div class="menu"><button type="button" class="menu-item">Inside</button></div>',
  '  </div>',
  '</div>'
].join('')

describe('menu focus', () => {
  afterEach(async () => {
    menu?.dispose()
    menu = null
    host?.remove()
    host = null
    await cdp().send('Emulation.setEmulatedMedia', { features: [] })
  })

  it('should give a keyboard-focused item the focus colors, not the hover ones', async () => {
    mount(MENU)
    await menu.show()
    const item = host.querySelector('#plain')

    await userEvent.keyboard('{Shift}')
    item.focus()

    expect(item.matches(':focus-visible')).toBeTrue()
    expect(getComputedStyle(item).backgroundColor).toBe(resolved('background-color', 'var(--cui-menu-item-focus-bg)'))
    expect(getComputedStyle(item).backgroundColor).not.toBe(resolved('background-color', 'var(--cui-menu-item-hover-bg)'))
    expect(getComputedStyle(item).color).toBe(resolved('color', 'var(--cui-menu-item-focus-color)'))
  })

  it('should give the icon of a keyboard-focused item the focus color', async () => {
    mount(MENU)
    await menu.show()
    const item = host.querySelector('#icon')

    await userEvent.keyboard('{Shift}')
    item.focus()

    expect(getComputedStyle(item.querySelector('.menu-item-icon')).color).toBe(getComputedStyle(item).color)
  })

  it('should give a keyboard-focused item with a theme the focus colors', async () => {
    mount(MENU)
    await menu.show()
    const item = host.querySelector('#danger')

    await userEvent.keyboard('{Shift}')
    item.focus()

    expect(getComputedStyle(item).backgroundColor).toBe(resolved('background-color', 'var(--cui-menu-item-focus-bg)'))
    expect(getComputedStyle(item).color).toBe(resolved('color', 'var(--cui-menu-item-focus-color)'))
  })

  it('should not paint an item focused by a click once the pointer leaves it', async () => {
    mount(MENU)
    menu.dispose()
    menu = new Menu(host.querySelector('[data-coreui-toggle="menu"]'), { autoClose: 'outside' })
    await menu.show()
    const item = host.querySelector('#plain')

    await userEvent.click(item)
    await userEvent.hover(host.querySelector('[data-coreui-toggle="menu"]'))

    expect(document.activeElement).toBe(item)
    expect(item.matches(':focus-visible')).toBeFalse()
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('should show the focus on an active item', async () => {
    mount(MENU)
    await menu.show()
    const item = host.querySelector('#current')
    const unfocused = getComputedStyle(item).backgroundColor

    await userEvent.keyboard('{Shift}')
    item.focus()

    expect(getComputedStyle(item).backgroundColor).not.toBe(unfocused)
    expect(getComputedStyle(item).backgroundColor).toBe(resolved('background-color', 'var(--cui-menu-item-focus-bg)'))
  })

  it('should show the focus on the trigger of an open submenu', async () => {
    const size = [window.innerWidth, window.innerHeight]
    await page.viewport(1024, 600)
    mount(MENU)
    await menu.show()
    const trigger = host.querySelector('#more')

    await userEvent.keyboard('{Shift}')
    trigger.focus()
    await userEvent.keyboard('{ArrowRight}')
    trigger.focus()

    expect(trigger.closest('.submenu')).toHaveClass('show')
    expect(getComputedStyle(trigger).backgroundColor).toBe(resolved('background-color', 'var(--cui-menu-item-focus-bg)'))
    await page.viewport(...size)
  })

  it('should paint a keyboard-focused item with system highlight colors in forced colors', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
    mount(MENU)
    await menu.show()
    const item = host.querySelector('#plain')
    const unfocused = getComputedStyle(item).backgroundColor

    await userEvent.keyboard('{Shift}')
    item.focus()

    expect(window.matchMedia('(forced-colors: active)').matches).toBeTrue()
    expect(getComputedStyle(item).forcedColorAdjust).toBe('none')
    expect(getComputedStyle(item).backgroundColor).not.toBe(unfocused)
    expect(getComputedStyle(item).backgroundColor).toBe(resolved('background-color', 'Highlight'))
    expect(getComputedStyle(item).color).toBe(resolved('color', 'HighlightText'))

    const withIcon = host.querySelector('#icon')
    withIcon.focus()

    expect(getComputedStyle(withIcon.querySelector('.menu-item-icon')).color).toBe(resolved('color', 'HighlightText'))
  })
})

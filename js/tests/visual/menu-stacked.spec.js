/*!
 * Submenus open in place of their parent on a narrow viewport and in a scrolling menu.
 * The stylesheet decides the layout, so only a real browser with it can tell.
 */

import axe from 'axe-core'
import { vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import ContextMenu from '../../src/context-menu.js'
import Dropdown from '../../src/dropdown.js'
import Menu from '../../src/menu.js'

let host
let menu

const wait = ms => new Promise(resolve => {
  setTimeout(resolve, ms)
})

const frames = () => new Promise(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(resolve))
})

const items = (count, prefix = 'Item') => Array.from({ length: count }, (_, index) => `<button type="button" class="menu-item" id="${prefix.toLowerCase()}-${index + 1}">${prefix} ${index + 1}</button>`).join('')

const submenu = (id, label, inner) => `<div class="submenu"><button type="button" class="menu-item" id="${id}">${label}</button><div class="menu" role="menu">${inner}</div></div>`

const MENU = [
  '<button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Places</button>',
  '<div class="menu" role="menu">',
  '  <button type="button" class="menu-item" id="first">Home</button>',
  submenu('europe', 'Europe', [
    submenu('poland', 'Poland', '<button type="button" class="menu-item" id="krakow">Kraków</button><button type="button" class="menu-item" id="gdansk">Gdańsk</button>'),
    '<button type="button" class="menu-item" id="france">France</button>'
  ].join('')),
  '  <button type="button" class="menu-item" id="last">Settings</button>',
  '</div>'
].join('')

const mount = (html, Component = Menu, config = {}) => {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  const toggle = host.querySelector('[data-coreui-toggle]')
  menu = toggle ? new Component(toggle, config) : null
  return host
}

const panel = () => host.querySelector('.menu')
const $ = selector => host.querySelector(selector)
const active = () => document.activeElement
const isShown = element => getComputedStyle(element).display !== 'none'

const open = async () => {
  await userEvent.click($('#toggle'))
  await wait(250)
}

describe('menu stacked submenus', () => {
  let size

  beforeEach(() => {
    size = [window.innerWidth, window.innerHeight]
  })

  afterEach(async () => {
    menu?.dispose()
    menu = null
    host?.remove()
    host = null
    document.documentElement.removeAttribute('dir')
    await page.viewport(...size)
  })

  it('should open a submenu next to its parent on a wide viewport (L-1)', async () => {
    await page.viewport(1024, 700)
    mount(MENU)
    await open()
    await userEvent.click($('#europe'))
    await frames()

    expect(panel()).not.toHaveAttribute('data-coreui-menu-stacked')
    expect(getComputedStyle($('#europe').nextElementSibling).position).toBe('absolute')
    expect(isShown($('#first'))).toBeTrue()
    expect(host.querySelector('.menu-back')).toBeNull()
    expect($('#europe').nextElementSibling).toHaveAttribute('role', 'menu')
    expect($('#europe').nextElementSibling).toHaveAttribute('aria-labelledby', 'europe')
  })

  it('should open a submenu in place of its parent on a tap on a narrow viewport (L-2)', async () => {
    await page.viewport(375, 667)
    mount(MENU)
    await open()
    await userEvent.click($('#europe'))

    const sub = $('#europe').nextElementSibling
    expect(panel()).toHaveAttribute('data-coreui-menu-stacked')
    expect(getComputedStyle(sub).position).toBe('static')
    expect(getComputedStyle(sub).opacity).toBe('1')
    expect(isShown($('#first'))).toBeFalse()
    expect(isShown($('#last'))).toBeFalse()
    expect(isShown($('#europe'))).toBeFalse()
    expect(isShown(sub.querySelector('.menu-back'))).toBeTrue()
    expect(active()).toBe($('#poland'))
  })

  it('should keep the back item inside the rounded corners of the panel (L-28)', async () => {
    await page.viewport(375, 667)
    mount(MENU)
    await open()
    await userEvent.click($('#europe'))

    const back = host.querySelector('.menu-back')
    const box = back.getBoundingClientRect()
    const style = getComputedStyle(panel())
    const inner = `${Number.parseFloat(style.borderTopLeftRadius) - Number.parseFloat(style.borderTopWidth)}px`
    expect(panel()).not.toHaveAttribute('data-coreui-menu-constrained')
    expect(getComputedStyle(back).borderTopLeftRadius).toBe(inner)
    expect(getComputedStyle(back).borderTopRightRadius).toBe(inner)
    expect(document.elementFromPoint(box.left + 1, box.top + 1).closest('.menu-back')).toBeNull()
    expect(document.elementFromPoint(box.right - 1, box.top + 1).closest('.menu-back')).toBeNull()
    expect(box.left).toBe(panel().getBoundingClientRect().left + Number.parseFloat(style.borderLeftWidth))
  })

  it('should enter and leave a stacked submenu from the keyboard (L-3)', async () => {
    await page.viewport(375, 667)
    mount(MENU)
    await open()
    const europe = $('#europe')
    europe.focus()

    await userEvent.keyboard('{Enter}')
    expect(active()).toBe($('#poland'))
    await userEvent.keyboard('{Escape}')
    expect(active()).toBe(europe)
    expect(europe.nextElementSibling).not.toHaveClass('show')
    expect(panel()).toHaveClass('show')

    await userEvent.keyboard('{ArrowRight}')
    expect(active()).toBe($('#poland'))
    await userEvent.keyboard('{ArrowLeft}')
    expect(active()).toBe(europe)

    await userEvent.keyboard('{ArrowRight}')
    await userEvent.keyboard('{ArrowUp}')
    expect(active()).toBe(europe.nextElementSibling.querySelector('.menu-back > .menu-item'))
    await userEvent.keyboard('{Enter}')
    expect(active()).toBe(europe)
    expect(europe.nextElementSibling).not.toHaveClass('show')
  })

  it('should mirror the keys and the back arrow in RTL (L-4)', async () => {
    await page.viewport(375, 667)
    document.documentElement.dir = 'rtl'
    mount(MENU)
    await open()
    const europe = $('#europe')
    europe.focus()

    await userEvent.keyboard('{ArrowLeft}')
    expect(active()).toBe($('#poland'))
    const arrow = getComputedStyle(europe.nextElementSibling.querySelector('.menu-back > .menu-item'), '::before').transform
    await userEvent.keyboard('{ArrowRight}')
    expect(active()).toBe(europe)

    document.documentElement.removeAttribute('dir')
    await userEvent.keyboard('{ArrowRight}')
    const ltrArrow = getComputedStyle(europe.nextElementSibling.querySelector('.menu-back > .menu-item'), '::before').transform
    expect(arrow).not.toBe(ltrArrow)
  })

  it('should stack a second level and go back one level at a time (L-5)', async () => {
    await page.viewport(375, 667)
    mount(MENU)
    await open()
    await userEvent.click($('#europe'))
    await userEvent.click($('#poland'))

    expect(active()).toBe($('#krakow'))
    expect(isShown($('#france'))).toBeFalse()
    expect(isShown($('#poland'))).toBeFalse()
    expect(isShown($('#europe').nextElementSibling.querySelector(':scope > .menu-back'))).toBeFalse()

    await userEvent.click($('#poland').nextElementSibling.querySelector('.menu-back > .menu-item'))
    expect(active()).toBe($('#poland'))
    expect(isShown($('#france'))).toBeTrue()
    expect($('#europe').nextElementSibling).toHaveClass('show')

    await userEvent.click($('#europe').nextElementSibling.querySelector(':scope > .menu-back > .menu-item'))
    expect(active()).toBe($('#europe'))
    expect(isShown($('#first'))).toBeTrue()
  })

  it('should make the items of an open stacked level items of the panel and give the level its role back on close (L-47)', async () => {
    await page.viewport(375, 667)
    mount(MENU)
    await open()
    await userEvent.click($('#europe'))
    await userEvent.click($('#poland'))
    const europeLevel = $('#europe').nextElementSibling
    const polandLevel = $('#poland').nextElementSibling

    for (const level of [europeLevel, polandLevel]) {
      expect(level).toHaveAttribute('role', 'none')
      expect(level).not.toHaveAttribute('aria-labelledby')
    }

    expect($('#europe')).toHaveAttribute('aria-expanded', 'true')
    expect($('#poland')).toHaveAttribute('aria-expanded', 'true')

    menu.update()
    expect(europeLevel).toHaveAttribute('role', 'none')
    expect(polandLevel).toHaveAttribute('role', 'none')

    await userEvent.keyboard('{Escape}')
    expect(polandLevel).toHaveAttribute('role', 'menu')
    expect(polandLevel).toHaveAttribute('aria-labelledby', 'poland')
    expect($('#poland')).toHaveAttribute('aria-expanded', 'false')
    expect(europeLevel).toHaveAttribute('role', 'none')

    await userEvent.keyboard('{ArrowRight}')
    expect(polandLevel).toHaveAttribute('role', 'none')
    expect(polandLevel).not.toHaveAttribute('aria-labelledby')

    await userEvent.keyboard('{ArrowLeft}')
    await userEvent.keyboard('{ArrowLeft}')
    expect(europeLevel).toHaveAttribute('role', 'menu')
    expect(europeLevel).toHaveAttribute('aria-labelledby', 'europe')
  })

  it('should follow a link item of an open stacked level on Space (L-48)', async () => {
    await page.viewport(375, 667)
    mount(MENU.replace('<button type="button" class="menu-item" id="france">France</button>', '<a class="menu-item" href="#france" id="france">France</a>'))
    await open()
    await userEvent.click($('#europe'))
    const onClick = vi.fn(event => event.preventDefault())
    $('#france').addEventListener('click', onClick)
    $('#france').focus()

    await userEvent.keyboard(' ')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('should hide the rest of a group around an open stacked submenu (L-5b)', async () => {
    await page.viewport(375, 667)
    mount(MENU.replace('<button type="button" class="menu-item" id="last">Settings</button>', '').replace(/(<div class="submenu"><button type="button" class="menu-item" id="europe">)/, '<div role="group" aria-label="Regions"><button type="button" class="menu-item" id="grouped">Local</button>$1').replace(/<\/div>$/, '</div><button type="button" class="menu-item" id="last">Settings</button></div>'))
    await open()
    await userEvent.click($('#europe'))

    expect(isShown($('#first'))).toBeFalse()
    expect(isShown($('#grouped'))).toBeFalse()
    expect(isShown($('#last'))).toBeFalse()
    expect(active()).toBe($('#poland'))
    await userEvent.keyboard('{Escape}')
    expect(isShown($('#grouped'))).toBeTrue()
    expect(active()).toBe($('#europe'))
  })

  it('should keep a tall menu in a pinned container inside the viewport and scroll it (L-6)', async () => {
    await page.viewport(400, 300)
    mount(`<div style="position: fixed; inset: 0 0 auto 0"><button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Menu</button><div class="menu" role="menu">${items(20)}</div></div>`)
    await open()
    const rect = panel().getBoundingClientRect()

    expect(rect.bottom).toBeLessThanOrEqual(300)
    expect(panel()).toHaveAttribute('data-coreui-menu-constrained')
    expect(getComputedStyle(panel()).overflowY).toBe('auto')

    await userEvent.keyboard('{End}')
    const last = $('#item-20').getBoundingClientRect()
    expect(active()).toBe($('#item-20'))
    expect(last.bottom).toBeLessThanOrEqual(rect.bottom)
  })

  it('should let a stacked submenu longer than its parent scroll in the menu (L-7)', async () => {
    await page.viewport(375, 667)
    mount(`<div style="position: fixed; inset: 0 0 auto 0"><button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Menu</button><div class="menu" role="menu">${items(3)}${submenu('long', 'Long', items(40, 'Sub'))}${items(2, 'After')}</div></div>`)
    await open()
    await userEvent.click($('#long'))

    expect(panel()).toHaveAttribute('data-coreui-menu-constrained')
    expect(panel().getBoundingClientRect().bottom).toBeLessThanOrEqual(667)
    await userEvent.keyboard('{End}')
    expect(active()).toBe($('#sub-40'))
    expect($('#sub-40').getBoundingClientRect().bottom).toBeLessThanOrEqual(panel().getBoundingClientRect().bottom)
  })

  it('should stack the submenus of a scrolling menu on a wide viewport (L-8)', async () => {
    await page.viewport(1024, 700)
    mount(MENU.replace('<div class="menu" role="menu">', '<div class="menu menu-scrollable" role="menu">'))
    await open()
    await userEvent.click($('#europe'))

    expect(panel()).toHaveAttribute('data-coreui-menu-stacked')
    expect(isShown($('#first'))).toBeFalse()
  })

  it('should open a menu taller than both sides on the side with more room (L-9)', async () => {
    await page.viewport(1024, 600)
    mount(`<div style="position: absolute; top: 380px; left: 20px"><button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Menu</button><div class="menu" role="menu">${items(40)}</div></div>`)
    await open()
    const rect = panel().getBoundingClientRect()

    expect(panel().dataset.coreuiPlacement).toBe('top-start')
    expect(rect.top).toBeGreaterThanOrEqual(0)
    expect(rect.bottom).toBeLessThanOrEqual(600)
  })

  it('should open a menu in the last row of a scrolling container upwards and whole (L-10)', async () => {
    await page.viewport(1024, 700)
    const rows = Array.from({ length: 8 }, (_, index) => `<tr><td>${index === 7 ? `<div class="btn-group"><button type="button" class="btn btn-sm" data-coreui-toggle="menu" id="toggle">Menu</button><div class="menu" role="menu">${items(8)}</div></div>` : `Row ${index + 1}`}</td></tr>`).join('')
    mount(`<div class="table-responsive" style="height: 300px"><table class="table">${rows}</table></div>`)
    await open()
    const container = $('.table-responsive').getBoundingClientRect()
    const rect = panel().getBoundingClientRect()

    expect(panel().dataset.coreuiPlacement).toBe('top-start')
    expect(rect.top).toBeGreaterThanOrEqual(container.top)
    expect($('#item-8').getBoundingClientRect().bottom).toBeLessThanOrEqual(rect.bottom)
  })

  it('should use a back item from the page and give it the role of an item (L-11)', async () => {
    await page.viewport(375, 667)
    mount(MENU)
    const sub = $('#europe').nextElementSibling
    sub.insertAdjacentHTML('afterbegin', '<div class="menu-back"><button type="button" class="menu-item" id="own-back"><svg class="menu-item-icon" viewBox="0 0 16 16"></svg>Continents</button></div>')
    await open()
    await userEvent.click($('#europe'))

    expect(sub.querySelectorAll(':scope > .menu-back')).toHaveSize(1)
    expect($('#own-back')).toHaveAttribute('role', 'menuitem')
    expect($('#own-back')).toHaveAttribute('tabindex', '-1')
    expect($('#own-back').parentElement).toHaveAttribute('role', 'none')
    await userEvent.keyboard('{ArrowUp}')
    expect(active()).toBe($('#own-back'))
  })

  it('should stack a disclosure panel without menu roles (L-12)', async () => {
    await page.viewport(375, 667)
    mount(MENU.replaceAll(' role="menu"', ''))
    await open()
    await userEvent.click($('#europe'))
    const back = $('#europe').nextElementSibling.querySelector('.menu-back > .menu-item')

    expect(back).not.toHaveAttribute('role')
    expect($('#europe').nextElementSibling).not.toHaveAttribute('role')
    expect($('#europe').nextElementSibling).not.toHaveAttribute('aria-labelledby')
    expect(active()).toBe($('#poland'))
    await userEvent.click(back)
    expect($('#europe').nextElementSibling).not.toHaveClass('show')
    expect($('#europe').nextElementSibling).not.toHaveAttribute('role')
    expect($('#europe').nextElementSibling).not.toHaveAttribute('aria-labelledby')
    await userEvent.click($('#europe'))
    back.focus()
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
    expect(active()).toBe($('#toggle'))
  })

  it('should stack the submenus of a context menu on a narrow viewport (L-13)', async () => {
    await page.viewport(375, 667)
    mount(`<div data-coreui-toggle="context-menu" id="area" style="height: 200px">A long area of text the menu belongs to</div>${MENU.replace(/<button[^>]*data-coreui-toggle="menu"[^>]*>Places<\/button>/, '').replace('<div class="menu" role="menu">', '<div class="menu" role="menu" aria-label="Places">')}`, ContextMenu)
    menu.show({ x: 20, y: 20 })
    await wait(250)
    await userEvent.click($('#europe'))

    expect(panel()).toHaveAttribute('data-coreui-menu-stacked')
    expect(isShown($('#first'))).toBeFalse()
    expect($('#europe').nextElementSibling).toHaveAttribute('role', 'none')
    expect($('#europe').nextElementSibling.querySelector('.menu-back > .menu-item')).toHaveAccessibleName('Back to Places')
  })

  it('should name the panel of a context menu and its first back item without a name from the page (L-45)', async () => {
    await page.viewport(375, 667)
    mount(`<div data-coreui-toggle="context-menu" id="area" style="height: 200px">A long area of text the menu belongs to</div>${MENU.replace(/<button[^>]*data-coreui-toggle="menu"[^>]*>Places<\/button>/, '')}`, ContextMenu)
    menu.show({ x: 20, y: 20 })
    await wait(250)
    await userEvent.click($('#europe'))

    expect(panel()).toHaveAccessibleName('Context menu')
    expect($('#europe').nextElementSibling.querySelector('.menu-back > .menu-item')).toHaveAccessibleName('Back to Context menu')
  })

  it('should leave the size and the placement of a dropdown as they are (L-14)', async () => {
    await page.viewport(1366, 650)
    mount(`<div class="dropdown" style="position: absolute; top: 400px; left: 20px"><button type="button" class="btn" data-coreui-toggle="dropdown" id="toggle">Menu</button><ul class="dropdown-menu">${Array.from({ length: 40 }, (_, index) => `<li><a class="dropdown-item" href="#">Item ${index + 1}</a></li>`).join('')}</ul></div>`, Dropdown)
    await open()
    const dropdownMenu = host.querySelector('.dropdown-menu')

    expect(dropdownMenu.dataset.coreuiPlacement).toBe('bottom-start')
    expect(dropdownMenu.style.getPropertyValue('--cui-menu-available-height')).toBe('')
    expect(dropdownMenu).not.toHaveAttribute('data-coreui-menu-stacked')
  })

  it('should not stack a menu in the flow of the page (L-15)', async () => {
    await page.viewport(375, 667)
    mount(`<style>.in-flow { position: static !important; }</style>${MENU.replace('<div class="menu" role="menu">', '<div class="menu in-flow" role="menu">')}`)
    await open()
    await userEvent.click($('#europe'))

    expect(panel()).not.toHaveAttribute('data-coreui-menu-stacked')
    expect(panel()).not.toHaveAttribute('data-coreui-menu-constrained')
    expect(isShown($('#first'))).toBeTrue()
  })

  it('should close an open submenu and focus its trigger when the mode changes (L-16)', async () => {
    await page.viewport(1024, 700)
    mount(MENU)
    await open()
    $('#europe').focus()
    await userEvent.keyboard('{ArrowRight}')
    await frames()
    expect(active()).toBe($('#poland'))

    await page.viewport(375, 667)
    await wait(100)
    expect($('#europe').nextElementSibling).not.toHaveClass('show')
    expect(active()).toBe($('#europe'))
    expect(panel()).toHaveAttribute('data-coreui-menu-stacked')

    await userEvent.keyboard('{ArrowRight}')
    expect(active()).toBe($('#poland'))
    await page.viewport(1024, 700)
    await wait(100)
    expect($('#europe').nextElementSibling).not.toHaveClass('show')
    expect(active()).toBe($('#europe'))
    expect(panel()).not.toHaveAttribute('data-coreui-menu-stacked')
  })

  it('should open a stacked submenu on a tap with the hover trigger (L-19)', async () => {
    await page.viewport(375, 667)
    mount(MENU, Menu, { submenuTrigger: 'hover' })
    await open()
    await userEvent.click($('#europe'))

    expect($('#europe').nextElementSibling).toHaveClass('show')
    expect(panel()).toHaveClass('show')
    expect(isShown($('#first'))).toBeFalse()
  })

  it('should take the mode from the custom property a page sets (L-20)', async () => {
    await page.viewport(500, 667)
    mount(`<style>.no-stack { --cui-menu-stack-submenus: 0; } .stack { --cui-menu-stack-submenus: 1; }</style>${MENU.replace('<div class="menu" role="menu">', '<div class="menu no-stack" role="menu">')}`)
    await open()
    await userEvent.click($('#europe'))
    expect(panel()).not.toHaveAttribute('data-coreui-menu-stacked')
    expect(isShown($('#first'))).toBeTrue()
    menu.dispose()
    host.remove()

    await page.viewport(1024, 700)
    mount(`<style>.stack { --cui-menu-stack-submenus: 1; }</style>${MENU.replace('<div class="menu" role="menu">', '<div class="menu stack" role="menu">')}`)
    await open()
    await userEvent.click($('#europe'))
    expect(panel()).toHaveAttribute('data-coreui-menu-stacked')
    expect(isShown($('#first'))).toBeFalse()
  })

  it('should scroll a stacked submenu from its top, keep the back item in view and restore the scroll (L-21)', async () => {
    await page.viewport(375, 400)
    mount(`<div style="position: fixed; inset: 0 0 auto 0"><button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Menu</button><div class="menu" role="menu">${items(14)}${submenu('long', 'Long', items(30, 'Sub'))}${items(10, 'After')}</div></div>`)
    await open()
    $('#long').scrollIntoView({ block: 'nearest' })
    const before = panel().scrollTop
    expect(before).toBeGreaterThan(0)
    expect(before).toBeLessThan(panel().scrollHeight - panel().clientHeight)

    await userEvent.click($('#long'))
    expect(panel().scrollTop).toBe(0)
    panel().scrollTop = 200
    await frames()
    const back = $('#long').nextElementSibling.querySelector('.menu-back')
    expect(back.getBoundingClientRect().top).toBeGreaterThanOrEqual(panel().getBoundingClientRect().top)
    expect(document.elementFromPoint(back.getBoundingClientRect().left + 20, back.getBoundingClientRect().bottom - 8).closest('.menu-back')).toBe(back)

    panel().scrollTop = 5
    await userEvent.click(back.querySelector('.menu-item'))
    expect(panel().scrollTop).toBe(before)
    expect(active()).toBe($('#long'))
  })

  it('should return to the parent level from a back item activated without the focus (L-29)', async () => {
    await page.viewport(375, 400)
    mount(`<div style="position: fixed; inset: 0 0 auto 0"><button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Menu</button><div class="menu" role="menu">${items(14)}${submenu('long', 'Long', items(30, 'Sub'))}${items(10, 'After')}</div></div>`)
    await open()
    $('#long').scrollIntoView({ block: 'nearest' })
    const before = panel().scrollTop
    await userEvent.click($('#long'))
    active().blur()

    $('#long').nextElementSibling.querySelector('.menu-back > .menu-item').click()
    await frames()
    expect(active()).toBe($('#long'))
    expect(panel().scrollTop).toBe(before)
  })

  it('should move the focus into a stacked submenu opened by a click without a pointer (L-22)', async () => {
    await page.viewport(375, 667)
    mount(MENU)
    await open()
    $('#europe').click()

    expect(active()).toBe($('#poland'))
  })

  it('should skip the back item on Home and End (L-23)', async () => {
    await page.viewport(375, 667)
    mount(MENU)
    await open()
    await userEvent.click($('#europe'))

    await userEvent.keyboard('{End}')
    expect(active()).toBe($('#france'))
    await userEvent.keyboard('{Home}')
    expect(active()).toBe($('#poland'))
  })

  it('should insert one back item and remove it on dispose (L-24)', async () => {
    await page.viewport(375, 667)
    mount(MENU)
    for (let round = 0; round < 2; round++) {
      // eslint-disable-next-line no-await-in-loop
      await open()
      // eslint-disable-next-line no-await-in-loop
      await userEvent.click($('#europe'))
      // eslint-disable-next-line no-await-in-loop
      await userEvent.keyboard('{Escape}{Escape}')
      // eslint-disable-next-line no-await-in-loop
      await wait(250)
    }

    expect(host.querySelectorAll('.menu-back')).toHaveSize(1)
    menu.dispose()
    menu = null
    expect(host.querySelectorAll('.menu-back')).toHaveSize(0)
  })

  it('should not open a nested submenu inside a parent closed by a mode change (L-32)', async () => {
    await page.viewport(1024, 700)
    mount(MENU)
    await open()
    $('#europe').focus()
    await userEvent.keyboard('{ArrowRight}')
    await frames()
    expect(active()).toBe($('#poland'))

    panel().style.setProperty('--cui-menu-stack-submenus', '1')
    await userEvent.keyboard('{ArrowRight}')
    await frames()

    expect(panel()).toHaveAttribute('data-coreui-menu-stacked')
    expect(panel().querySelectorAll('.submenu.show')).toHaveSize(0)
    expect(active()).toBe($('#europe'))
  })

  it('should keep dollar signs of a level name in the back item (L-33)', async () => {
    await page.viewport(375, 667)
    mount(`<button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Places</button><div class="menu" role="menu">${submenu('plans', 'Plans $& $$', submenu('pro', 'Pro', items(2)))}</div>`)
    await open()
    await userEvent.click($('#plans'))
    await userEvent.click($('#pro'))

    const back = $('#pro').nextElementSibling.querySelector('.menu-back > .menu-item')
    expect(back.textContent).toBe('Plans $& $$')
    expect(back.getAttribute('aria-label')).toBe('Back to Plans $& $$')
  })

  it('should open a first-level submenu in the mode that changed without a resize (L-35)', async () => {
    await page.viewport(1024, 700)
    mount(MENU)
    await open()
    panel().style.setProperty('--cui-menu-stack-submenus', '1')
    $('#europe').focus()
    await userEvent.keyboard('{Enter}')
    await frames()

    expect(panel()).toHaveAttribute('data-coreui-menu-stacked')
    expect($('#europe').nextElementSibling).toHaveClass('show')
    expect(active()).toBe($('#poland'))
  })

  it('should keep the item the keyboard moves to clear of the back item (L-37)', async () => {
    await page.viewport(375, 667)
    mount(`<div style="position: fixed; inset: 0 0 auto 0"><button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Menu</button><div class="menu" role="menu">${items(3)}${submenu('long', 'Long', items(40, 'Sub'))}${items(2, 'After')}</div></div>`)
    await open()
    await userEvent.click($('#long'))
    await userEvent.keyboard('{End}')

    for (let step = 0; step < 39; step++) {
      // eslint-disable-next-line no-await-in-loop
      await userEvent.keyboard('{ArrowUp}')
      const rect = active().getBoundingClientRect()
      expect(document.elementFromPoint(rect.left + 20, rect.top + 2)).toBe(active())
    }
  })

  it('should name the back item after the level as it is when the submenu opens (L-38)', async () => {
    await page.viewport(375, 667)
    mount(`<span id="row">Report.pdf</span><button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Actions</button><div class="menu" role="menu" aria-labelledby="row">${submenu('open-with', 'Open with', items(2, 'App'))}</div>`)
    await open()
    await userEvent.click($('#open-with'))
    const back = () => $('#open-with').nextElementSibling.querySelector('.menu-back > .menu-item')
    expect(back()).toHaveAttribute('aria-label', 'Back to Report.pdf')

    await userEvent.keyboard('{Escape}{Escape}')
    await wait(250)
    $('#row').textContent = 'Notes.txt'
    await open()
    await userEvent.click($('#open-with'))
    expect(back().textContent).toBe('Notes.txt')
    expect(back()).toHaveAttribute('aria-label', 'Back to Notes.txt')
    expect($('#open-with').nextElementSibling.querySelectorAll('.menu-back')).toHaveSize(1)
  })

  it('should stack a menu with an open side submenu when the room left for it shrinks (L-39)', async () => {
    await page.viewport(1024, 700)
    mount(`<div style="position: absolute; top: 10px; left: 20px"><button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Menu</button><div class="menu" role="menu">${submenu('europe', 'Europe', items(2, 'Country'))}${items(14)}</div></div>`)
    await open()
    await userEvent.click($('#europe'))
    expect($('#europe').nextElementSibling).toHaveClass('show')

    await page.viewport(1024, 380)
    await wait(150)
    expect(panel()).toHaveAttribute('data-coreui-menu-constrained')
    expect(panel()).toHaveAttribute('data-coreui-menu-stacked')
    expect(panel().getBoundingClientRect().bottom).toBeLessThanOrEqual(380)
    panel().scrollTop = panel().scrollHeight
    expect($('#item-14').getBoundingClientRect().bottom).toBeLessThanOrEqual(panel().getBoundingClientRect().bottom)
  })

  it('should move the focus to the back item of a stacked level with no item to take it (L-40)', async () => {
    await page.viewport(375, 667)
    mount(`<button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Menu</button><div class="menu" role="menu">${submenu('recent', 'Recent', '<button type="button" class="menu-item" disabled>No recent files</button>')}${items(2)}</div>`)
    await open()
    $('#recent').focus()
    await userEvent.keyboard('{Enter}')
    await frames()

    expect(active()).toBe($('#recent').nextElementSibling.querySelector('.menu-back > .menu-item'))
  })

  it('should not open a stacked submenu on hover (L-41)', async () => {
    await page.viewport(375, 667)
    mount(MENU)
    await open()
    await userEvent.hover($('#europe'))
    await wait(250)

    expect($('#europe').nextElementSibling).not.toHaveClass('show')
    expect(isShown($('#first'))).toBeTrue()
  })

  it('should take the back item texts from the backLabel and ariaBackLabel options (L-42)', async () => {
    await page.viewport(375, 667)
    mount(MENU, Menu, { ariaBackLabel: 'Return to {label}', backLabel: '‹ {label}' })
    await open()
    await userEvent.click($('#europe'))
    const back = $('#europe').nextElementSibling.querySelector('.menu-back > .menu-item')

    expect(back.textContent).toBe('‹ Places')
    expect(back).toHaveAttribute('aria-label', 'Return to Places')
  })

  it('should keep the submenus of a dropdown beside it on a narrow viewport (L-43)', async () => {
    await page.viewport(375, 667)
    mount(`<div class="dropdown"><button type="button" class="btn" data-coreui-toggle="dropdown" id="toggle">Menu</button><ul class="dropdown-menu"><li><a class="dropdown-item" href="#" id="first">Home</a></li><li class="submenu"><a class="dropdown-item" href="#" id="more">More</a><ul class="dropdown-menu"><li><a class="dropdown-item" href="#">Inside</a></li></ul></li></ul></div>`, Dropdown)
    await open()
    await userEvent.click($('#more'))
    const dropdownMenu = host.querySelector('.dropdown-menu')

    expect(dropdownMenu).not.toHaveAttribute('data-coreui-menu-stacked')
    expect(isShown($('#first'))).toBeTrue()
  })

  it('should choose the side a menu opens on within the boundary it is given (L-44)', async () => {
    await page.viewport(1024, 700)
    mount(`<div id="box" style="position: absolute; top: 20px; left: 20px; width: 300px; height: 300px"><div style="position: absolute; top: 240px"><button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Menu</button><div class="menu" role="menu">${items(6)}</div></div></div>`)
    menu.dispose()
    menu = new Menu($('#toggle'), { boundary: $('#box') })
    await open()

    expect(panel().dataset.coreuiPlacement).toBe('top-start')
  })

  it('should compute the mode again after the menu closes and the viewport changes (L-25)', async () => {
    await page.viewport(375, 667)
    mount(MENU)
    await open()
    await userEvent.click($('#europe'))
    expect(panel()).toHaveAttribute('data-coreui-menu-stacked')
    await userEvent.keyboard('{Escape}{Escape}')
    await wait(250)
    expect(panel()).not.toHaveAttribute('data-coreui-menu-stacked')
    expect(panel().style.getPropertyValue('--cui-menu-available-height')).toBe('')

    await page.viewport(1024, 700)
    await open()
    await userEvent.click($('#europe'))
    expect(panel()).not.toHaveAttribute('data-coreui-menu-stacked')
    expect(isShown($('#first'))).toBeTrue()
  })

  it('should not count a closing side submenu as content of the menu (L-31)', async () => {
    await page.viewport(1024, 700)
    mount(`<button type="button" class="btn" data-coreui-toggle="menu" id="toggle">Places</button><div class="menu" role="menu"><button type="button" class="menu-item" id="first">Home</button>${submenu('more', 'More', items(12))}</div>`)
    await open()
    await userEvent.click($('#more'))
    await wait(250)
    expect(panel()).not.toHaveAttribute('data-coreui-menu-constrained')

    await userEvent.click($('#more'))
    window.dispatchEvent(new Event('resize'))
    await wait(300)
    expect($('#more').nextElementSibling).not.toHaveClass('show')
    expect(panel()).not.toHaveAttribute('data-coreui-menu-constrained')
    expect(panel()).not.toHaveAttribute('data-coreui-menu-stacked')
  })

  it('should report no axe violations on a stacked submenu (L-26)', async () => {
    await page.viewport(375, 667)
    mount(MENU)
    await open()
    await userEvent.click($('#europe'))

    const result = await axe.run(host, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice', 'experimental'] } })
    expect(result.violations.map(({ id, nodes }) => `${id}: ${nodes.map(node => node.target.join(' ')).join(', ')}`)).toEqual([])
  })
})

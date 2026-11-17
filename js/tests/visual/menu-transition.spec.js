/*!
 * `shown` and `hidden` wait for the menu's own transition, and a menu moved to
 * a container stays there until it has faded out. The transition exists only
 * with the stylesheet, so only a real browser with it can tell.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import ContextMenu from '../../src/context-menu.js'
import Menu from '../../src/menu.js'

const TRANSITION = 'opacity .3s, transform .3s, display .3s allow-discrete'

let host
let instances = []

const mount = (html, style = 'position: absolute; top: 100px; left: 100px;') => {
  host = document.createElement('div')
  host.style.cssText = style
  host.innerHTML = html
  document.body.append(host)
  for (const menu of host.querySelectorAll('.menu')) {
    menu.style.transition = TRANSITION
  }

  return host
}

const MENU = [
  '<button type="button" id="toggle" style="width: 30px; height: 30px;">M</button>',
  '<div class="menu" id="menu">',
  '  <button type="button" class="menu-item" id="item">One</button>',
  '</div>'
].join('')

const create = (Component, element, config) => {
  const instance = new Component(element, config)
  instances.push(instance)
  return instance
}

const nextFrame = () => new Promise(resolve => {
  requestAnimationFrame(resolve)
})

const frames = async count => {
  for (let frame = 0; frame < count; frame++) {
    // eslint-disable-next-line no-await-in-loop
    await nextFrame()
  }
}

const record = (element, events, name = 'menu') => {
  const log = []
  for (const event of events) {
    element.addEventListener(`${event}.coreui.${name}`, () => log.push(event))
  }

  return log
}

const openMenu = async config => {
  mount(MENU)
  const toggle = host.querySelector('#toggle')
  const element = host.querySelector('#menu')
  const menu = create(Menu, toggle, config)
  await menu.show()
  return { menu, toggle, element }
}

afterEach(() => {
  for (const instance of instances) {
    instance.dispose()
  }

  instances = []
  document.querySelector('body > #menu')?.remove()
  host?.remove()
  host = null
})

describe('menu transition', () => {
  it('fires shown once the menu has faded in', async () => {
    mount(MENU)
    const toggle = host.querySelector('#toggle')
    const menu = create(Menu, toggle)
    let opacity = null
    toggle.addEventListener('shown.coreui.menu', () => {
      opacity = Number(getComputedStyle(host.querySelector('#menu')).opacity)
    })

    const shown = menu.show()
    await frames(2)

    expect(opacity).toBeNull()

    await shown

    expect(opacity).toBeGreaterThan(0.9)
  })

  it('fires hidden once the menu has faded out', async () => {
    const { menu, toggle, element } = await openMenu()
    const log = record(toggle, ['hide', 'hidden'])

    const hidden = menu.hide()
    await frames(2)

    expect(log).toEqual(['hide'])
    expect(getComputedStyle(element).display).not.toEqual('none')

    await hidden

    expect(log).toEqual(['hide', 'hidden'])
  })

  it('keeps a menu moved to a container there until it has faded out', async () => {
    const { menu, element } = await openMenu({ container: 'body' })

    expect(element.parentNode).toBe(document.body)

    const hidden = menu.hide()
    await frames(2)

    expect(element.parentNode).toBe(document.body)
    expect(getComputedStyle(element).display).not.toEqual('none')

    await hidden

    expect(element.parentNode).toBe(host)
  })

  it('fires no hidden for a close that a reopen interrupts', async () => {
    const { menu, toggle, element } = await openMenu({ container: 'body' })
    const log = record(toggle, ['hide', 'hidden', 'show', 'shown'])

    menu.hide()
    await frames(2)
    await menu.show()
    await frames(25)

    expect(log).toEqual(['hide', 'show', 'shown'])
    expect(element.parentNode).toBe(document.body)
  })

  it('fires hidden for the last close when the menu closes again after a reopen', async () => {
    const { menu, toggle, element } = await openMenu()
    const opacities = []
    toggle.addEventListener('hidden.coreui.menu', () => {
      opacities.push(Number(getComputedStyle(element).opacity))
    })
    const wait = ms => new Promise(resolve => {
      setTimeout(resolve, ms)
    })

    menu.hide()
    await wait(100)
    menu.show()
    await wait(50)
    await menu.hide()

    expect(opacities).toHaveSize(1)
    expect(opacities[0]).toEqual(0)
  })

  it('leaves no position tracking behind after a reopen during the close', async () => {
    const { menu } = await openMenu()

    menu.hide()
    await frames(2)
    await menu.show()

    const update = spyOn(Menu.prototype, '_updateFloatingPosition').and.callThrough()
    menu.dispose()
    instances = []
    window.dispatchEvent(new Event('resize'))
    await frames(2)

    expect(update).not.toHaveBeenCalled()
  })

  it('still fires hidden once when a show during the close is prevented', async () => {
    const { menu, toggle } = await openMenu()
    const log = record(toggle, ['hidden'])
    toggle.addEventListener('show.coreui.menu', event => {
      event.preventDefault()
    })

    const hidden = menu.hide()
    await frames(2)
    await menu.show()
    await hidden
    await frames(2)

    expect(log).toEqual(['hidden'])
  })

  it('fires no shown for an opening that a close interrupts', async () => {
    mount(MENU)
    const toggle = host.querySelector('#toggle')
    const menu = create(Menu, toggle)
    const log = record(toggle, ['show', 'shown', 'hide', 'hidden'])

    menu.show()
    await frames(2)
    await menu.hide()
    await frames(25)

    expect(log).toEqual(['show', 'hide', 'hidden'])
  })

  it('gives the menu back and fires the hidden it owes when disposed during the close', async () => {
    const { menu, toggle, element } = await openMenu({ container: 'body' })
    const log = record(toggle, ['hidden'])

    menu.hide()
    await frames(2)
    menu.dispose()
    instances = []

    expect(log).toEqual(['hidden'])
    expect(element.parentNode).toBe(host)

    await frames(25)

    expect(log).toEqual(['hidden'])
  })

  it('keeps the closing menu on its toggle while the toggle scrolls', async () => {
    mount([
      '<div id="scroller" style="height: 200px; overflow: auto;">',
      '  <div style="height: 1000px; padding-top: 100px;">',
      `    ${MENU}`,
      '  </div>',
      '</div>'
    ].join(''), 'position: absolute; top: 0; left: 100px; width: 200px;')
    const toggle = host.querySelector('#toggle')
    const element = host.querySelector('#menu')
    const menu = create(Menu, toggle, { container: 'body' })
    await menu.show()
    await frames(2)

    const gap = () => element.getBoundingClientRect().top - toggle.getBoundingClientRect().bottom
    const before = gap()

    menu.hide()
    host.querySelector('#scroller').scrollTop = 50
    await frames(3)

    expect(getComputedStyle(element).display).not.toEqual('none')
    expect(gap()).toBeCloseTo(before, 0)
  })

  it('ends the close of another toggle sharing the menu before it opens the menu', async () => {
    mount([
      '<button type="button" id="first">A</button>',
      '<button type="button" id="second" style="margin-left: 200px;">B</button>',
      '<div class="menu" id="menu"><button type="button" class="menu-item">One</button></div>'
    ].join(''))
    const element = host.querySelector('#menu')
    const first = create(Menu, host.querySelector('#first'), { container: 'body', menu: element })
    const second = create(Menu, host.querySelector('#second'), { container: 'body', menu: element })
    const firstLog = record(host.querySelector('#first'), ['hidden'])
    await first.show()

    first.hide()
    await frames(2)
    second.show()

    expect(firstLog).toEqual(['hidden'])

    await frames(25)

    expect(element.parentNode).toBe(document.body)
    expect(element.classList.contains('show')).toBeTrue()
  })

  it('ends the close of another context menu trigger sharing the menu when it opens', async () => {
    mount([
      '<div id="first" data-coreui-target="#menu" style="width: 100px; height: 100px;"></div>',
      '<div id="second" data-coreui-target="#menu" style="width: 100px; height: 100px;"></div>',
      '<div class="menu" id="menu"><button type="button" class="menu-item">One</button></div>'
    ].join(''))
    const element = host.querySelector('#menu')
    const first = create(ContextMenu, host.querySelector('#first'))
    const second = create(ContextMenu, host.querySelector('#second'))
    const firstLog = record(host.querySelector('#first'), ['hide', 'hidden'], 'context-menu')
    await first.show({ x: 150, y: 150 })

    const shown = second.show({ x: 150, y: 250 })

    expect(firstLog).toEqual(['hide', 'hidden'])

    await shown
    await frames(25)

    expect(firstLog).toEqual(['hide', 'hidden'])
    expect(element.classList.contains('show')).toBeTrue()
  })

  it('still fires shown when a close during the opening is prevented', async () => {
    mount(MENU)
    const toggle = host.querySelector('#toggle')
    const menu = create(Menu, toggle)
    const log = record(toggle, ['show', 'shown', 'hide'])
    toggle.addEventListener('hide.coreui.menu', event => {
      event.preventDefault()
    })

    const shown = menu.show()
    await frames(2)
    await menu.hide()
    await shown

    expect(log).toEqual(['show', 'hide', 'shown'])
  })

  it('waits for the opacity transition only', async () => {
    const { menu, toggle, element } = await openMenu()
    const log = record(toggle, ['hidden'])

    const hidden = menu.hide()
    element.dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'transform' }))

    expect(log).toEqual([])

    await hidden

    expect(log).toEqual(['hidden'])
  })

  it('keeps a context menu at the pointer when the page updates it during the close', async () => {
    mount([
      '<div id="area" style="width: 300px; height: 200px;"></div>',
      '<div class="menu" id="menu"><button type="button" class="menu-item">One</button></div>'
    ].join(''))
    const element = host.querySelector('#menu')
    const contextMenu = create(ContextMenu, host.querySelector('#area'))
    await contextMenu.show({ x: 250, y: 150 })
    const { left } = element.getBoundingClientRect()

    contextMenu.hide()
    contextMenu.update()
    await frames(2)

    expect(getComputedStyle(element).display).not.toEqual('none')
    expect(element.getBoundingClientRect().left).toBeCloseTo(left, 0)
  })

  it('resolves the promise of a context menu shown at a point once it has faded in', async () => {
    mount([
      '<div id="area" style="width: 300px; height: 200px;"></div>',
      '<div class="menu" id="menu"><button type="button" class="menu-item">One</button></div>'
    ].join(''))
    const area = host.querySelector('#area')
    const contextMenu = create(ContextMenu, area)
    const log = record(area, ['shown'], 'context-menu')

    const shown = contextMenu.show({ x: 150, y: 150 })

    expect(log).toEqual([])

    await shown

    expect(log).toEqual(['shown'])
  })
})

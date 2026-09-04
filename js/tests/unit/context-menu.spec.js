import ContextMenu from '../../src/context-menu.js'
import Menu from '../../src/menu.js'
import {
  clearFixture, createEvent, getFixture, jQueryMock
} from '../helpers/fixture.js'

describe('ContextMenu', () => {
  let fixtureEl

  const markup = (attributes = '') => [
    '<div>',
    `  <div class="area" tabindex="0" data-coreui-toggle="context-menu" ${attributes}>Right click here</div>`,
    '  <div class="menu">',
    '    <a class="menu-item" href="#">Item 1</a>',
    '    <a class="menu-item" href="#">Item 2</a>',
    '  </div>',
    '</div>'
  ].join('')

  const rightClick = (element, x = 120, y = 80) => {
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      button: 2,
      clientX: x,
      clientY: y
    })
    element.dispatchEvent(event)
    return event
  }

  const whenShown = (trigger, callback) => new Promise(resolve => {
    trigger.addEventListener('shown.coreui.context-menu', () => {
      setTimeout(() => {
        callback()
        resolve()
      }, 20)
    })
  })

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    for (const instance of Menu._openInstances) {
      instance.dispose()
    }

    clearFixture()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(ContextMenu.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(ContextMenu.Default).toEqual(jasmine.any(Object))
      expect(ContextMenu.Default.reference).toEqual('pointer')
      expect(ContextMenu.Default.strategy).toEqual('fixed')
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(ContextMenu.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(ContextMenu.DATA_KEY).toEqual('coreui.context-menu')
    })
  })

  describe('constructor', () => {
    it('should take care of element either passed as a CSS selector or DOM element', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const bySelector = new ContextMenu('[data-coreui-toggle="context-menu"]')
      expect(bySelector._element).toEqual(area)

      const byElement = new ContextMenu(area)
      expect(byElement._element).toEqual(area)
    })

    it('should make the menu focusable', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')

      // eslint-disable-next-line no-new
      new ContextMenu(area)

      expect(menu.getAttribute('tabindex')).toEqual('-1')
    })

    it('should keep an explicit tabindex on the menu', () => {
      fixtureEl.innerHTML = markup().replace('class="menu"', 'class="menu" tabindex="0"')

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')

      // eslint-disable-next-line no-new
      new ContextMenu(area)

      expect(menu.getAttribute('tabindex')).toEqual('0')
    })

    it('should resolve the menu option passed as a selector', () => {
      fixtureEl.innerHTML = [
        '<div class="area" data-coreui-toggle="context-menu" data-coreui-menu="#sharedMenu">Right click here</div>',
        '<div class="menu" id="sharedMenu">',
        '  <a class="menu-item" href="#">Item</a>',
        '</div>'
      ].join('')

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('#sharedMenu')
      const contextMenu = new ContextMenu(area)

      expect(contextMenu._menu).toEqual(menu)
    })

    it('should not throw when no menu is present', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="context-menu"></div>'

      const area = fixtureEl.querySelector('div')

      expect(() => new ContextMenu(area)).not.toThrow()
    })
  })

  describe('show', () => {
    it('should show the menu at the given point', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')
      const contextMenu = new ContextMenu(area)
      let showEventTriggered = false

      area.addEventListener('show.coreui.context-menu', event => {
        showEventTriggered = true
        expect(event.relatedTarget).toEqual(area)
      })

      const done = whenShown(area, () => {
        expect(showEventTriggered).toBeTrue()
        expect(menu).toHaveClass('show')
        expect(area).not.toHaveClass('show')
        expect(area.hasAttribute('aria-expanded')).toBeFalse()
        expect(menu.style.position).toEqual('fixed')
        expect(Number.parseFloat(menu.style.left)).toBeCloseTo(120, 0)
        expect(Number.parseFloat(menu.style.top)).toBeCloseTo(82, 0)
        expect(menu.getAttribute('data-coreui-placement')).toEqual('bottom-start')
        expect(document.activeElement).toEqual(menu)
      })

      contextMenu.show({ x: 120, y: 80 })
      return done
    })

    it('should anchor to the element when no point is given', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const contextMenu = new ContextMenu(area)

      const done = whenShown(area, () => {
        expect(contextMenu._getReferenceElement()).toEqual(area)
      })

      contextMenu.show()
      return done
    })

    it('should honor the reference option', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const contextMenu = new ContextMenu(area, { reference: 'toggle' })

      const done = whenShown(area, () => {
        expect(contextMenu._getReferenceElement()).toEqual(area)
      })

      contextMenu.show({ x: 10, y: 10 })
      return done
    })

    it('should not show if the element is disabled', () => {
      fixtureEl.innerHTML = markup('class="area disabled"').replace('class="area" ', '')

      const area = fixtureEl.querySelector('[data-coreui-toggle="context-menu"]')
      const menu = fixtureEl.querySelector('.menu')
      const contextMenu = new ContextMenu(area)
      const spy = spyOn(contextMenu, '_createFloating')

      contextMenu.show({ x: 1, y: 1 })

      expect(menu).not.toHaveClass('show')
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not show if already shown', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const contextMenu = new ContextMenu(area)

      const done = whenShown(area, () => {
        const spy = spyOn(contextMenu, '_createFloating')
        contextMenu.show({ x: 1, y: 1 })
        expect(spy).not.toHaveBeenCalled()
      })

      contextMenu.show({ x: 1, y: 1 })
      return done
    })

    it('should not show if the show event is prevented', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')
      const contextMenu = new ContextMenu(area)

      area.addEventListener('show.coreui.context-menu', event => {
        event.preventDefault()
      })

      contextMenu.show({ x: 1, y: 1 })

      expect(menu).not.toHaveClass('show')
      expect(Menu._openInstances.has(contextMenu)).toBeFalse()
    })
  })

  describe('hide', () => {
    it('should hide the menu and return focus to the element', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')
      const contextMenu = new ContextMenu(area)
      let hideEventTriggered = false

      area.addEventListener('hide.coreui.context-menu', () => {
        hideEventTriggered = true
      })

      const done = new Promise(resolve => {
        area.addEventListener('hidden.coreui.context-menu', event => {
          expect(hideEventTriggered).toBeTrue()
          expect(event.relatedTarget).toEqual(area)
          expect(menu).not.toHaveClass('show')
          expect(menu.hasAttribute('data-coreui-placement')).toBeFalse()
          expect(document.activeElement).toEqual(area)
          expect(contextMenu._point).toBeNull()
          resolve()
        })
      })

      whenShown(area, () => {
        expect(document.activeElement).toEqual(menu)
        contextMenu.hide()
      })

      contextMenu.show({ x: 5, y: 5 })
      return done
    })

    it('should leave focus alone when it was outside the menu', () => {
      fixtureEl.innerHTML = `${markup()}<button id="other">Other</button>`

      const area = fixtureEl.querySelector('.area')
      const other = fixtureEl.querySelector('#other')
      const contextMenu = new ContextMenu(area)

      const done = new Promise(resolve => {
        area.addEventListener('hidden.coreui.context-menu', () => {
          expect(document.activeElement).toEqual(other)
          resolve()
        })
      })

      whenShown(area, () => {
        other.focus()
        contextMenu.hide()
      })

      contextMenu.show({ x: 5, y: 5 })
      return done
    })

    it('should not hide if the hide event is prevented', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')
      const contextMenu = new ContextMenu(area)

      area.addEventListener('hide.coreui.context-menu', event => {
        event.preventDefault()
      })

      const done = whenShown(area, () => {
        contextMenu.hide()
        expect(menu).toHaveClass('show')
        expect(Menu._openInstances.has(contextMenu)).toBeTrue()
      })

      contextMenu.show({ x: 5, y: 5 })
      return done
    })

    it('should not hide if not shown', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const contextMenu = new ContextMenu(area)
      const spy = spyOn(contextMenu, '_completeHide')

      contextMenu.hide()

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('toggle', () => {
    it('should show and hide the menu', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')
      const contextMenu = new ContextMenu(area)

      const done = whenShown(area, () => {
        expect(menu).toHaveClass('show')
        contextMenu.toggle()
        expect(menu).not.toHaveClass('show')
      })

      contextMenu.toggle({ x: 5, y: 5 })
      return done
    })
  })

  describe('touch devices', () => {
    it('should add and remove the mouseover handlers on body children', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const contextMenu = new ContextMenu(area)
      const defineOnTouchStart = value => Object.defineProperty(document.documentElement, 'ontouchstart', {
        value,
        writable: true,
        configurable: true
      })

      defineOnTouchStart(() => {})

      const done = new Promise(resolve => {
        area.addEventListener('hidden.coreui.context-menu', () => {
          delete document.documentElement.ontouchstart
          resolve()
        })
      })

      whenShown(area, () => {
        contextMenu.hide()
      })

      contextMenu.show({ x: 5, y: 5 })
      return done
    })
  })

  describe('data-api', () => {
    it('should open the menu at the pointer on contextmenu and prevent the native menu', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')

      const contextmenuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2,
        clientX: 200,
        clientY: 100
      })
      let shownEvent

      area.addEventListener('show.coreui.context-menu', event => {
        expect(event.relatedTarget).toEqual(area)
        expect(event.contextmenuEvent).toEqual(contextmenuEvent)
      })

      area.addEventListener('shown.coreui.context-menu', event => {
        shownEvent = event
      })

      const done = whenShown(area, () => {
        expect(menu).toHaveClass('show')
        expect(Number.parseFloat(menu.style.left)).toBeCloseTo(200, 0)
        expect(Number.parseFloat(menu.style.top)).toBeCloseTo(102, 0)
        expect(shownEvent.contextmenuEvent).toEqual(contextmenuEvent)
      })

      area.dispatchEvent(contextmenuEvent)
      expect(contextmenuEvent.defaultPrevented).toBeTrue()
      return done
    })

    it('should open the menu from a child of the trigger', () => {
      fixtureEl.innerHTML = markup().replace('Right click here', '<span class="child">Right click here</span>')

      const area = fixtureEl.querySelector('.area')
      const child = fixtureEl.querySelector('.child')
      const menu = fixtureEl.querySelector('.menu')

      const done = whenShown(area, () => {
        expect(menu).toHaveClass('show')
      })

      rightClick(child)
      return done
    })

    it('should anchor to the element when the event carries no coordinates', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')

      const done = whenShown(area, () => {
        expect(menu).toHaveClass('show')
        expect(ContextMenu.getInstance(area)._point).toBeNull()
      })

      rightClick(area, 0, 0)
      return done
    })

    it('should ignore a disabled trigger', () => {
      fixtureEl.innerHTML = markup('class="area disabled"').replace('class="area" ', '')

      const area = fixtureEl.querySelector('[data-coreui-toggle="context-menu"]')
      const menu = fixtureEl.querySelector('.menu')

      const event = rightClick(area)

      expect(event.defaultPrevented).toBeFalse()
      expect(menu).not.toHaveClass('show')
      expect(ContextMenu.getInstance(area)).toBeNull()
    })

    it('should reposition when right-clicking the trigger again', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')
      let hiddenCount = 0

      area.addEventListener('hidden.coreui.context-menu', () => {
        hiddenCount++
      })

      const done = new Promise(resolve => {
        area.addEventListener('shown.coreui.context-menu', () => {
          if (hiddenCount === 0) {
            rightClick(area, 300, 200)
            return
          }

          setTimeout(() => {
            expect(menu).toHaveClass('show')
            expect(Number.parseFloat(menu.style.left)).toBeCloseTo(300, 0)
            expect(Number.parseFloat(menu.style.top)).toBeCloseTo(202, 0)
            resolve()
          }, 20)
        })
      })

      rightClick(area, 50, 50)
      return done
    })

    it('should keep the menu open on contextmenu inside it', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')
      const item = menu.querySelector('.menu-item')

      const done = whenShown(area, () => {
        const event = rightClick(item)
        expect(event.defaultPrevented).toBeTrue()
        expect(menu).toHaveClass('show')
      })

      rightClick(area)
      return done
    })

    it('should close the open context menu on contextmenu elsewhere', () => {
      fixtureEl.innerHTML = `${markup()}<div class="outside">Outside</div>`

      const area = fixtureEl.querySelector('.area')
      const outside = fixtureEl.querySelector('.outside')
      const menu = fixtureEl.querySelector('.menu')

      const done = whenShown(area, () => {
        const event = rightClick(outside)
        expect(event.defaultPrevented).toBeFalse()
        expect(menu).not.toHaveClass('show')
      })

      rightClick(area)
      return done
    })

    it('should keep a manually closed context menu open on contextmenu elsewhere', () => {
      fixtureEl.innerHTML = `${markup('data-coreui-auto-close="false"')}<div class="outside">Outside</div>`

      const area = fixtureEl.querySelector('.area')
      const outside = fixtureEl.querySelector('.outside')
      const menu = fixtureEl.querySelector('.menu')

      const done = whenShown(area, () => {
        rightClick(outside)
        expect(menu).toHaveClass('show')
        document.body.click()
        expect(menu).toHaveClass('show')
      })

      rightClick(area)
      return done
    })

    it('should switch between triggers', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <div class="area first" data-coreui-toggle="context-menu">First</div>',
        '  <div class="menu first-menu"><a class="menu-item" href="#">Item</a></div>',
        '</div>',
        '<div>',
        '  <div class="area second" data-coreui-toggle="context-menu">Second</div>',
        '  <div class="menu second-menu"><a class="menu-item" href="#">Item</a></div>',
        '</div>'
      ].join('')

      const first = fixtureEl.querySelector('.first')
      const second = fixtureEl.querySelector('.second')
      const firstMenu = fixtureEl.querySelector('.first-menu')
      const secondMenu = fixtureEl.querySelector('.second-menu')

      const done = whenShown(second, () => {
        expect(firstMenu).not.toHaveClass('show')
        expect(secondMenu).toHaveClass('show')
      })

      whenShown(first, () => {
        rightClick(second)
      })

      rightClick(first)
      return done
    })

    it('should close a menu opened by click when a context menu opens', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <div class="menu click-menu"><a class="menu-item" href="#">Item</a></div>',
        '</div>',
        markup()
      ].join('')

      const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const clickMenu = fixtureEl.querySelector('.click-menu')
      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu:not(.click-menu)')

      const done = whenShown(area, () => {
        expect(clickMenu).not.toHaveClass('show')
        expect(menu).toHaveClass('show')
      })

      toggle.addEventListener('shown.coreui.menu', () => {
        setTimeout(() => rightClick(area))
      })

      toggle.click()
      return done
    })

    it('should close on click outside', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')

      const done = new Promise(resolve => {
        area.addEventListener('hidden.coreui.context-menu', event => {
          expect(event.clickEvent).toEqual(jasmine.any(Event))
          expect(menu).not.toHaveClass('show')
          resolve()
        })
      })

      whenShown(area, () => {
        document.body.click()
      })

      rightClick(area)
      return done
    })

    it('should close on click inside the trigger but outside the menu', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')

      const done = new Promise(resolve => {
        area.addEventListener('hidden.coreui.context-menu', () => {
          expect(menu).not.toHaveClass('show')
          resolve()
        })
      })

      whenShown(area, () => {
        area.click()
      })

      rightClick(area)
      return done
    })

    it('should block wheel and touch scrolling outside the menu while open', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')
      const item = menu.querySelector('.menu-item')
      const scroll = (target, type) => {
        const event = new Event(type, { bubbles: true, cancelable: true })
        target.dispatchEvent(event)
        return event.defaultPrevented
      }

      expect(scroll(document.body, 'wheel')).toBeFalse()

      const done = new Promise(resolve => {
        area.addEventListener('hidden.coreui.context-menu', () => {
          expect(scroll(document.body, 'wheel')).toBeFalse()
          expect(scroll(area, 'touchmove')).toBeFalse()
          resolve()
        })
      })

      whenShown(area, () => {
        expect(scroll(document.body, 'wheel')).toBeTrue()
        expect(scroll(area, 'wheel')).toBeTrue()
        expect(scroll(document.body, 'touchmove')).toBeTrue()
        expect(scroll(item, 'wheel')).toBeFalse()
        expect(scroll(item, 'touchmove')).toBeFalse()
        ContextMenu.getInstance(area).hide()
      })

      rightClick(area)
      return done
    })

    it('should block the scroll keys on the menu container but not on its items', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')
      const item = menu.querySelector('.menu-item')
      const press = (target, key) => {
        const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key })
        target.dispatchEvent(event)
        return event.defaultPrevented
      }

      const done = whenShown(area, () => {
        expect(press(menu, ' ')).toBeTrue()
        expect(press(menu, 'PageDown')).toBeTrue()
        expect(press(document.body, 'PageUp')).toBeTrue()
        expect(press(item, ' ')).toBeFalse()
        expect(press(menu, 'a')).toBeFalse()
      })

      rightClick(area)
      return done
    })

    it('should close on click on an item', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')
      const item = menu.querySelector('.menu-item')

      const done = new Promise(resolve => {
        area.addEventListener('hidden.coreui.context-menu', () => {
          expect(menu).not.toHaveClass('show')
          resolve()
        })
      })

      whenShown(area, () => {
        item.click()
      })

      rightClick(area)
      return done
    })

    it('should close when tabbing out of the menu', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')

      const done = new Promise(resolve => {
        area.addEventListener('hidden.coreui.context-menu', () => {
          expect(menu).not.toHaveClass('show')
          resolve()
        })
      })

      whenShown(area, () => {
        const keyup = createEvent('keyup')
        keyup.key = 'Tab'
        document.dispatchEvent(keyup)
      })

      rightClick(area)
      return done
    })

    it('should move focus to the first item on ArrowDown and to the last on ArrowUp', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')
      const items = menu.querySelectorAll('.menu-item')

      const done = whenShown(area, () => {
        const keydown = createEvent('keydown', { bubbles: true })
        keydown.key = 'ArrowDown'
        menu.dispatchEvent(keydown)
        expect(document.activeElement).toEqual(items[0])

        keydown.key = 'ArrowDown'
        items[0].dispatchEvent(keydown)
        expect(document.activeElement).toEqual(items[1])

        keydown.key = 'ArrowUp'
        items[1].dispatchEvent(keydown)
        expect(document.activeElement).toEqual(items[0])
      })

      rightClick(area)
      return done
    })

    it('should close on Escape and return focus to the trigger', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')

      const done = new Promise(resolve => {
        area.addEventListener('hidden.coreui.context-menu', () => {
          setTimeout(() => {
            expect(menu).not.toHaveClass('show')
            expect(document.activeElement).toEqual(area)
            resolve()
          })
        })
      })

      whenShown(area, () => {
        const keydown = createEvent('keydown', { bubbles: true })
        keydown.key = 'Escape'
        menu.dispatchEvent(keydown)
      })

      rightClick(area)
      return done
    })

    it('should open anchored to the trigger on Shift+F10 and on the Menu key', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')

      const shiftF10 = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'F10',
        shiftKey: true
      })
      area.dispatchEvent(shiftF10)

      expect(shiftF10.defaultPrevented).toBeTrue()
      expect(menu).toHaveClass('show')
      expect(ContextMenu.getInstance(area)._point).toBeNull()
      expect(ContextMenu.getInstance(area)._getReferenceElement()).toEqual(area)

      const menuKey = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'ContextMenu'
      })
      area.dispatchEvent(menuKey)

      expect(menuKey.defaultPrevented).toBeTrue()
      expect(menu).toHaveClass('show')
    })

    it('should ignore other keys and disabled triggers', () => {
      fixtureEl.innerHTML = markup('class="area disabled"').replace('class="area" ', '')

      const area = fixtureEl.querySelector('[data-coreui-toggle="context-menu"]')
      const menu = fixtureEl.querySelector('.menu')

      const f10 = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'F10'
      })
      area.dispatchEvent(f10)
      expect(f10.defaultPrevented).toBeFalse()
      expect(ContextMenu.getInstance(area)).toBeNull()

      const menuKey = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'ContextMenu'
      })
      area.dispatchEvent(menuKey)
      expect(menuKey.defaultPrevented).toBeFalse()
      expect(menu).not.toHaveClass('show')
    })

    it('should keep keyboard navigation when the menu is moved to a container', () => {
      fixtureEl.innerHTML = markup('data-coreui-container="body"')

      const area = fixtureEl.querySelector('.area')
      const menu = fixtureEl.querySelector('.menu')
      const item = menu.querySelector('.menu-item')

      const done = new Promise(resolve => {
        area.addEventListener('hidden.coreui.context-menu', () => {
          expect(menu.parentNode).toEqual(area.parentNode)
          resolve()
        })
      })

      whenShown(area, () => {
        expect(menu.parentNode).toEqual(document.body)

        const keydown = createEvent('keydown', { bubbles: true })
        keydown.key = 'ArrowDown'
        menu.dispatchEvent(keydown)
        expect(document.activeElement).toEqual(item)

        keydown.key = 'Escape'
        item.dispatchEvent(keydown)
      })

      rightClick(area)
      return done
    })
  })

  describe('dispose', () => {
    it('should dispose the context menu', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const contextMenu = new ContextMenu(area)

      const done = whenShown(area, () => {
        contextMenu.dispose()
        expect(ContextMenu.getInstance(area)).toBeNull()
        expect(Menu._openInstances.has(contextMenu)).toBeFalse()

        const wheel = new Event('wheel', { bubbles: true, cancelable: true })
        document.body.dispatchEvent(wheel)
        expect(wheel.defaultPrevented).toBeFalse()
      })

      contextMenu.show({ x: 5, y: 5 })
      return done
    })
  })

  describe('jQueryInterface', () => {
    it('should create a context menu', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')

      jQueryMock.fn['context-menu'] = ContextMenu.jQueryInterface
      jQueryMock.elements = [area]

      jQueryMock.fn['context-menu'].call(jQueryMock)

      expect(ContextMenu.getInstance(area)).not.toBeNull()
    })

    it('should not re create a context menu', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const contextMenu = new ContextMenu(area)

      jQueryMock.fn['context-menu'] = ContextMenu.jQueryInterface
      jQueryMock.elements = [area]

      jQueryMock.fn['context-menu'].call(jQueryMock)

      expect(ContextMenu.getInstance(area)).toEqual(contextMenu)
    })

    it('should call a context menu method', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')
      const contextMenu = new ContextMenu(area)
      const spy = spyOn(contextMenu, 'show')

      jQueryMock.fn['context-menu'] = ContextMenu.jQueryInterface
      jQueryMock.elements = [area]

      jQueryMock.fn['context-menu'].call(jQueryMock, 'show')

      expect(spy).toHaveBeenCalled()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = markup()

      const area = fixtureEl.querySelector('.area')

      jQueryMock.fn['context-menu'] = ContextMenu.jQueryInterface
      jQueryMock.elements = [area]

      expect(() => {
        jQueryMock.fn['context-menu'].call(jQueryMock, 'undefinedMethod')
      }).toThrowError(TypeError, 'No method named "undefinedMethod"')
    })
  })
})

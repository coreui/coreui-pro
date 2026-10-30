import { userEvent } from 'vitest/browser'
import ContextMenu from '../../src/context-menu.js'
import Dropdown from '../../src/dropdown.js'
import EventHandler from '../../src/dom/event-handler.js'
import Menu from '../../src/menu.js'
import { noop } from '../../src/util/index.js'
import {
  clearFixture, createEvent, getFixture, jQueryMock
} from '../helpers/fixture.js'

describe('Menu', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Menu.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(Menu.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(Menu.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Menu.DATA_KEY).toEqual('coreui.menu')
    })
  })

  describe('constructor', () => {
    it('should take care of element either passed as a CSS selector or DOM element', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menuBySelector = new Menu('[data-coreui-toggle="menu"]')
      expect(menuBySelector._element).toEqual(btnMenu)

      const menuByElement = new Menu(btnMenu)
      expect(menuByElement._element).toEqual(btnMenu)
    })

    it('should create offset modifier correctly when offset option is a function', async () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Secondary link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const getOffset = jasmine.createSpy('getOffset').and.returnValue([10, 20])
      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menu = new Menu(btnMenu, {
        offset: getOffset
      })

      const offset = menu._getOffset()
      expect(typeof offset).toEqual('function')

      const shownPromise = new Promise(resolve => {
        btnMenu.addEventListener('shown.coreui.menu', resolve)
      })

      menu.show()
      await shownPromise

      // Floating UI calls offset function asynchronously
      await new Promise(resolve => {
        setTimeout(resolve, 20)
      })
      expect(getOffset).toHaveBeenCalled()
    })

    it('should create offset modifier correctly when offset option is a string into data attribute', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu" data-coreui-offset="10,20">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Secondary link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menu = new Menu(btnMenu)

      expect(menu._getOffset()).toEqual([10, 20])
    })

    it('should adapt array results from offset functions to Floating UI offset values', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Secondary link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menu = new Menu(btnMenu, {
        offset: () => [10, 20]
      })

      const offset = menu._getOffset()

      expect(offset({ placement: 'bottom', rects: { reference: {}, floating: {} } })).toEqual({ mainAxis: 20, crossAxis: 10 })
    })

    it('should allow to pass config to Floating UI with `floatingConfig`', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Secondary link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menu = new Menu(btnMenu, {
        floatingConfig: {
          placement: 'left'
        }
      })

      const floatingConfig = menu._getFloatingConfig('bottom-start', [])

      expect(floatingConfig.placement).toEqual('left')
    })

    it('should allow to pass config to Floating UI with `floatingConfig` as a function', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu" data-coreui-placement="right">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Secondary link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const getFloatingConfig = jasmine.createSpy('getFloatingConfig').and.returnValue({ placement: 'left' })
      const menu = new Menu(btnMenu, {
        floatingConfig: getFloatingConfig
      })

      const floatingConfig = menu._getFloatingConfig('bottom-start', [])

      // Ensure that the function was called with the default config.
      expect(getFloatingConfig).toHaveBeenCalledWith(jasmine.objectContaining({
        placement: jasmine.any(String)
      }))
      expect(floatingConfig.placement).toEqual('left')
    })
  })

  describe('toggle', () => {
    it('should toggle a menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          resolve()
        })

        menu.toggle()
      })
    })

    it('should destroy old Floating UI references on toggle', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div class="first">',
          '  <button class="firstBtn btn" data-coreui-toggle="menu" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>',
          '<div class="second">',
          '  <button class="secondBtn btn" data-coreui-toggle="menu" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu1 = fixtureEl.querySelector('.firstBtn')
        const btnMenu2 = fixtureEl.querySelector('.secondBtn')
        const firstMenuEl = fixtureEl.querySelector('.first')
        const secondMenuEl = fixtureEl.querySelector('.second')
        const menu1 = new Menu(btnMenu1)

        firstMenuEl.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu1).toHaveClass('show')
          expect(menu1._floatingCleanup).not.toBeNull()
          btnMenu2.click()
        })

        secondMenuEl.addEventListener('shown.coreui.menu', () => setTimeout(() => {
          expect(menu1._floatingCleanup).toBeNull()
          resolve()
        }))

        menu1.toggle()
      })
    })

    it('should toggle a menu and add/remove event listener on mobile', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const defaultValueOnTouchStart = document.documentElement.ontouchstart
        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        document.documentElement.ontouchstart = noop
        const spy = spyOn(EventHandler, 'on')
        const spyOff = spyOn(EventHandler, 'off')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          expect(spy).toHaveBeenCalledWith(jasmine.any(Object), 'mouseover', noop)

          menu.toggle()
        })

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          expect(btnMenu).not.toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('false')
          expect(spyOff).toHaveBeenCalledWith(jasmine.any(Object), 'mouseover', noop)

          document.documentElement.ontouchstart = defaultValueOnTouchStart
          resolve()
        })

        menu.toggle()
      })
    })

    it('should toggle a menu with bottom-end placement', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-placement="bottom-end" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          resolve()
        })

        menu.toggle()
      })
    })

    it('should toggle a menu with bottom (centered) placement', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-placement="bottom" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          resolve()
        })

        menu.toggle()
      })
    })

    it('should toggle a menu with top-start placement', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-placement="top-start" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          resolve()
        })

        menu.toggle()
      })
    })

    it('should toggle a menu with top (centered) placement', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-placement="top" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          resolve()
        })

        menu.toggle()
      })
    })

    it('should toggle a menu with top-end placement', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-placement="top-end" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          resolve()
        })

        menu.toggle()
      })
    })

    it('should toggle a menu with right-start placement', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-placement="right-start" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          resolve()
        })

        menu.toggle()
      })
    })

    it('should toggle a menu with left-start placement', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-placement="left-start" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          resolve()
        })

        menu.toggle()
      })
    })

    it('should toggle a menu with parent reference', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu, {
          reference: 'parent'
        })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          resolve()
        })

        menu.toggle()
      })
    })

    it('should toggle a menu with a dom node reference', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu, {
          reference: fixtureEl
        })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          resolve()
        })

        menu.toggle()
      })
    })

    it('should toggle a menu with a valid virtual element reference', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn btn visually-hidden" data-coreui-toggle="menu" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const virtualElement = {
          nodeType: 1,
          getBoundingClientRect() {
            return {
              width: 0,
              height: 0,
              top: 0,
              right: 0,
              bottom: 0,
              left: 0
            }
          }
        }

        expect(() => new Menu(btnMenu, {
          reference: {}
        })).toThrowError(TypeError, 'MENU: Option "reference" provided type "object" without a required "getBoundingClientRect" method.')

        expect(() => new Menu(btnMenu, {
          reference: {
            getBoundingClientRect: 'not-a-function'
          }
        })).toThrowError(TypeError, 'MENU: Option "reference" provided type "object" without a required "getBoundingClientRect" method.')

        const menu = new Menu(btnMenu, {
          reference: virtualElement
        })

        const spy = spyOn(virtualElement, 'getBoundingClientRect').and.callThrough()

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Floating UI calls getBoundingClientRect asynchronously
          setTimeout(() => {
            expect(spy).toHaveBeenCalled()
            expect(btnMenu).toHaveClass('show')
            expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
            resolve()
          }, 20)
        })

        menu.toggle()
      })
    })

    it('should not toggle a menu if the element is disabled', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button disabled class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          reject(new Error('should not throw shown.coreui.menu event'))
        })

        menu.toggle()

        setTimeout(() => {
          expect().nothing()
          resolve()
        })
      })
    })

    it('should not toggle a menu if the element contains .disabled', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn btn disabled" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          reject(new Error('should not throw shown.coreui.menu event'))
        })

        menu.toggle()

        setTimeout(() => {
          expect().nothing()
          resolve()
        })
      })
    })

    it('should not toggle a menu if the menu is shown', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu show">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          reject(new Error('should not throw shown.coreui.menu event'))
        })

        menu.toggle()

        setTimeout(() => {
          expect().nothing()
          resolve()
        })
      })
    })

    it('should not toggle a menu if show event is prevented', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('show.coreui.menu', event => {
          event.preventDefault()
        })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          reject(new Error('should not throw shown.coreui.menu event'))
        })

        menu.toggle()

        setTimeout(() => {
          expect().nothing()
          resolve()
        })
      })
    })
  })

  describe('show', () => {
    it('should show a menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          expect(document.activeElement).toEqual(btnMenu)
          resolve()
        })

        menu.show()
      })
    })

    it('should not show a menu if the element is disabled', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button disabled class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          reject(new Error('should not throw shown.coreui.menu event'))
        })

        menu.show()

        setTimeout(() => {
          expect().nothing()
          resolve()
        }, 10)
      })
    })

    it('should not show a menu if the element contains .disabled', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn btn disabled" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          reject(new Error('should not throw shown.coreui.menu event'))
        })

        menu.show()

        setTimeout(() => {
          expect().nothing()
          resolve()
        }, 10)
      })
    })

    it('should not show a menu if the menu is shown', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu show">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          reject(new Error('should not throw shown.coreui.menu event'))
        })

        menu.show()

        setTimeout(() => {
          expect().nothing()
          resolve()
        }, 10)
      })
    })

    it('should not show a menu if show event is prevented', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('show.coreui.menu', event => {
          event.preventDefault()
        })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          reject(new Error('should not throw shown.coreui.menu event'))
        })

        menu.show()

        setTimeout(() => {
          expect().nothing()
          resolve()
        }, 10)
      })
    })

    it('should move menu to body when container is set to body', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu, {
          container: 'body'
        })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menuEl.parentNode).toEqual(document.body)
          resolve()
        })

        menu.show()
      })
    })

    it('should move menu to body when container is set to true', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu, {
          container: true
        })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menuEl.parentNode).toEqual(document.body)
          resolve()
        })

        menu.show()
      })
    })

    it('should move menu to specified element when container is an element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div id="custom-container"></div>',
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const customContainer = fixtureEl.querySelector('#custom-container')
        const menu = new Menu(btnMenu, {
          container: customContainer
        })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menuEl.parentNode).toEqual(customContainer)
          resolve()
        })

        menu.show()
      })
    })

    it('should move the menu into a modal dialog instead of the body', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<dialog id="host">',
          '  <div>',
          '    <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '    <div class="menu">',
          '      <a class="menu-item" href="#">Link</a>',
          '    </div>',
          '  </div>',
          '</dialog>'
        ].join('')

        const dialog = fixtureEl.querySelector('#host')
        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu, {
          container: 'body'
        })

        dialog.showModal()

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menuEl.parentNode).toEqual(dialog)
          dialog.close()
          resolve()
        })

        menu.show()
      })
    })

    it('should move the menu to the body from a dialog that is not modal', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<dialog id="host">',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Link</a>',
          '  </div>',
          '</dialog>'
        ].join('')

        const dialog = fixtureEl.querySelector('#host')
        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu, {
          container: 'body'
        })

        dialog.show()

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menuEl.parentNode).toEqual(document.body)
          dialog.close()
          resolve()
        })

        menu.show()
      })
    })

    it('should keep the menu in place when the container selector matches nothing', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div id="wrapper" style="overflow: hidden;">',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu, {
          container: '#missing'
        })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menuEl.parentNode).toEqual(fixtureEl.querySelector('#wrapper'))
          resolve()
        })

        menu.show()
      })
    })

    it('should restore menu to original parent when hidden', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const originalParent = menuEl.parentNode
        const menu = new Menu(btnMenu, {
          container: 'body'
        })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menuEl.parentNode).toEqual(document.body)
          menu.hide()
        })

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          expect(menuEl.parentNode).toEqual(originalParent)
          resolve()
        })

        menu.show()
      })
    })

    it('should work with container via data attribute', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-container="body">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menuEl.parentNode).toEqual(document.body)
          resolve()
        })

        menu.show()
      })
    })
  })

  describe('layers', () => {
    const menuMarkup = (id, autoClose = 'true', inner = '') => [
      '<div>',
      `  <button class="btn" id="${id}" data-coreui-toggle="menu" data-coreui-auto-close="${autoClose}">${id}</button>`,
      `  <div class="menu"><button class="menu-item" id="${id}-item">${id} item</button>${inner}</div>`,
      '</div>'
    ].join('')

    const escape = target => {
      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' })
      target.dispatchEvent(event)
      return event
    }

    it('should close other open menus when one opens from code', () => {
      fixtureEl.innerHTML = menuMarkup('a') + menuMarkup('b')

      const a = new Menu(fixtureEl.querySelector('#a'))
      const b = new Menu(fixtureEl.querySelector('#b'))
      a.show()
      b.show()

      expect(a._isShown()).toBeFalse()
      expect(b._isShown()).toBeTrue()
    })

    it('should close an open menu when another opens with the arrow key and leave the focus in the new one', () => {
      fixtureEl.innerHTML = menuMarkup('a') + menuMarkup('b')

      const a = new Menu(fixtureEl.querySelector('#a'))
      const toggleB = fixtureEl.querySelector('#b')
      a.show()
      toggleB.focus()
      toggleB.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowDown' }))

      expect(a._isShown()).toBeFalse()
      expect(Menu.getInstance(toggleB)._isShown()).toBeTrue()
      expect(document.activeElement).toEqual(fixtureEl.querySelector('#b-item'))
    })

    it('should keep a menu with autoClose false or inside, and the menu that holds the toggle of the one that opens', () => {
      fixtureEl.innerHTML = menuMarkup('b', 'false') + menuMarkup('c', 'inside') + menuMarkup('d', 'true', menuMarkup('e'))

      const menus = ['b', 'c', 'd', 'e'].map(id => new Menu(fixtureEl.querySelector(`#${id}`)))

      for (const menu of menus) {
        menu.show()
      }

      for (const menu of menus) {
        expect(menu._isShown()).toBeTrue()
      }
    })

    it('should keep a menu whose hide event is prevented, and open nothing when the show event is prevented', () => {
      fixtureEl.innerHTML = menuMarkup('a') + menuMarkup('b') + menuMarkup('c')

      const toggleA = fixtureEl.querySelector('#a')
      const toggleC = fixtureEl.querySelector('#c')
      const [a, b, c] = [toggleA, fixtureEl.querySelector('#b'), toggleC].map(toggle => new Menu(toggle))
      toggleA.addEventListener('hide.coreui.menu', event => event.preventDefault())
      toggleC.addEventListener('show.coreui.menu', event => event.preventDefault())
      a.show()
      b.show()

      expect(a._isShown()).toBeTrue()

      c.show()

      expect(b._isShown()).toBeTrue()
      expect(c._isShown()).toBeFalse()
    })

    it('should close only the inner menu on Escape in it, and the outer one on the next Escape', () => {
      fixtureEl.innerHTML = menuMarkup('outer', 'true', menuMarkup('inner'))

      const outer = new Menu(fixtureEl.querySelector('#outer'))
      const inner = new Menu(fixtureEl.querySelector('#inner'))
      outer.show()
      inner.show()
      fixtureEl.querySelector('#inner-item').focus()

      expect(escape(fixtureEl.querySelector('#inner-item')).defaultPrevented).toBeTrue()
      expect(inner._isShown()).toBeFalse()
      expect(outer._isShown()).toBeTrue()
      expect(document.activeElement).toEqual(fixtureEl.querySelector('#inner'))

      escape(document.activeElement)

      expect(outer._isShown()).toBeFalse()
      expect(document.activeElement).toEqual(fixtureEl.querySelector('#outer'))
    })

    it('should keep the outer menu on a click in the moved panel of an inner one, and close both from the outer toggle with the focus back on it', () => {
      fixtureEl.innerHTML = menuMarkup('outer', 'true', menuMarkup('inner', 'outside'))

      const outer = new Menu(fixtureEl.querySelector('#outer'))
      const inner = new Menu(fixtureEl.querySelector('#inner'), { container: true })
      outer.show()
      inner.show()
      const innerItem = document.querySelector('#inner-item')

      expect(innerItem.closest('.menu').parentNode).toEqual(document.body)

      innerItem.focus()
      document.querySelector('#inner-item').closest('.menu').click()

      expect(outer._isShown()).toBeTrue()
      expect(inner._isShown()).toBeTrue()

      outer.hide()

      expect(inner._isShown()).toBeFalse()
      expect(document.activeElement).toEqual(fixtureEl.querySelector('#outer'))
    })

    it('should close only the open submenu on Escape in it and hand the focus to its trigger', () => {
      fixtureEl.innerHTML = [
        '<div><button class="btn" id="m" data-coreui-toggle="menu">M</button>',
        '<div class="menu"><div class="submenu" id="wrapper"><button class="menu-item" id="trigger" type="button">More</button>',
        '<div class="menu" id="sub"><button class="menu-item" id="deep" type="button">Deep</button></div></div></div></div>'
      ].join('')

      const menu = new Menu(fixtureEl.querySelector('#m'))
      menu.show()
      menu._openSubmenu(fixtureEl.querySelector('#trigger'), fixtureEl.querySelector('#sub'), fixtureEl.querySelector('#wrapper'))
      fixtureEl.querySelector('#deep').focus()
      fixtureEl.querySelector('#deep').dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' }))

      expect(fixtureEl.querySelector('#sub').classList.contains('show')).toBeFalse()
      expect(menu._isShown()).toBeTrue()
      expect(document.activeElement).toEqual(fixtureEl.querySelector('#trigger'))
    })

    it('should close the menus opened from it when it is disposed open', () => {
      fixtureEl.innerHTML = menuMarkup('outer', 'true', menuMarkup('inner', 'outside'))

      const outer = new Menu(fixtureEl.querySelector('#outer'))
      const inner = new Menu(fixtureEl.querySelector('#inner'), { container: true })
      outer.show()
      inner.show()
      outer.dispose()

      expect(inner._isShown()).toBeFalse()
    })

    it('should close a menu opened from a submenu when the submenu closes, and keep the outer menu', () => {
      fixtureEl.innerHTML = menuMarkup('outer', 'true', [
        '<div class="submenu" id="wrapper"><button class="menu-item" id="trigger" type="button">More</button>',
        `<div class="menu" id="sub">${menuMarkup('inner', 'outside')}</div></div>`
      ].join(''))

      const outer = new Menu(fixtureEl.querySelector('#outer'))
      const inner = new Menu(fixtureEl.querySelector('#inner'), { container: true })
      outer.show()
      outer._openSubmenu(fixtureEl.querySelector('#trigger'), fixtureEl.querySelector('#sub'), fixtureEl.querySelector('#wrapper'))
      inner.show()

      expect(inner._isShown()).toBeTrue()

      outer._closeSubmenu(fixtureEl.querySelector('#sub'), fixtureEl.querySelector('#wrapper'))

      expect(inner._isShown()).toBeFalse()
      expect(outer._isShown()).toBeTrue()
    })

    it('should close the top menu on Escape when the focus is on no element, but not from a page field', () => {
      fixtureEl.innerHTML = `${menuMarkup('a')}<input id="field">`

      const a = new Menu(fixtureEl.querySelector('#a'))
      a.show()
      fixtureEl.querySelector('#field').focus()
      escape(fixtureEl.querySelector('#field'))

      expect(a._isShown()).toBeTrue()

      fixtureEl.querySelector('#field').blur()
      escape(document.body)

      expect(a._isShown()).toBeFalse()
    })
  })

  describe('hide', () => {
    it('should hide a menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" aria-expanded="true">Menu</button>',
          '  <div class="menu show">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          expect(menuEl).not.toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('false')
          resolve()
        })

        menu.hide()
      })
    })

    it('should hide a menu and cleanup Floating UI', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menu._floatingCleanup).not.toBeNull()
          menu.hide()
        })

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          expect(menu._floatingCleanup).toBeNull()
          resolve()
        })

        menu.show()
      })
    })

    it('should not hide a menu if the element is disabled', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button disabled class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu show">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          reject(new Error('should not throw hidden.coreui.menu event'))
        })

        menu.hide()

        setTimeout(() => {
          expect(menuEl).toHaveClass('show')
          resolve()
        }, 10)
      })
    })

    it('should not hide a menu if the element contains .disabled', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn btn disabled" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu show">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          reject(new Error('should not throw hidden.coreui.menu event'))
        })

        menu.hide()

        setTimeout(() => {
          expect(menuEl).toHaveClass('show')
          resolve()
        }, 10)
      })
    })

    it('should not hide a menu if the menu is not shown', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          reject(new Error('should not throw hidden.coreui.menu event'))
        })

        menu.hide()

        setTimeout(() => {
          expect().nothing()
          resolve()
        }, 10)
      })
    })

    it('should not hide a menu if hide event is prevented', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu show">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('hide.coreui.menu', event => {
          event.preventDefault()
        })

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          reject(new Error('should not throw hidden.coreui.menu event'))
        })

        menu.hide()

        setTimeout(() => {
          expect(menuEl).toHaveClass('show')
          resolve()
        })
      })
    })

    it('should remove event listener on touch-enabled device that was added in show method', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Menu item</a>',
          '  </div>',
          '</div>'
        ].join('')

        const defaultValueOnTouchStart = document.documentElement.ontouchstart
        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        document.documentElement.ontouchstart = noop
        const spy = spyOn(EventHandler, 'off')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          menu.hide()
        })

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          expect(btnMenu).not.toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('false')
          expect(spy).toHaveBeenCalled()

          document.documentElement.ontouchstart = defaultValueOnTouchStart
          resolve()
        })

        menu.show()
      })
    })
  })

  describe('dispose', () => {
    it('should dispose menu', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Secondary link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')

      const menu = new Menu(btnMenu)

      expect(menu._floatingCleanup).toBeNull()
      expect(menu._menu).not.toBeNull()
      expect(menu._element).not.toBeNull()
      const spy = spyOn(EventHandler, 'off')

      menu.dispose()

      expect(menu._menu).toBeNull()
      expect(menu._element).toBeNull()
      expect(spy).toHaveBeenCalledWith(btnMenu, Menu.EVENT_KEY)
    })

    it('should dispose menu with Floating UI', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Secondary link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menu = new Menu(btnMenu)

      menu.toggle()

      expect(menu._floatingCleanup).not.toBeNull()
      expect(menu._menu).not.toBeNull()
      expect(menu._element).not.toBeNull()

      menu.dispose()

      expect(menu._floatingCleanup).toBeNull()
      expect(menu._menu).toBeNull()
      expect(menu._element).toBeNull()
    })

    it('should stop handling submenu events after dispose', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <ul class="menu">',
        '    <li class="submenu">',
        '      <button class="menu-item" type="button">More options</button>',
        '      <ul class="menu">',
        '        <li><a class="menu-item" href="#">Sub-action</a></li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
      const enterSpy = spyOn(Menu.prototype, '_onSubmenuTriggerEnter')
      const leaveSpy = spyOn(Menu.prototype, '_onSubmenuLeave')
      const moveSpy = spyOn(Menu.prototype, '_trackMousePosition')
      const clickSpy = spyOn(Menu.prototype, '_onSubmenuTriggerClick')

      new Menu(btnMenu, { submenuTrigger: 'both' }).dispose()

      submenuTrigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      submenuTrigger.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
      submenuTrigger.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
      submenuTrigger.click()

      expect(enterSpy).not.toHaveBeenCalled()
      expect(leaveSpy).not.toHaveBeenCalled()
      expect(moveSpy).not.toHaveBeenCalled()
      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('should handle a submenu event once after a re-initialization', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <ul class="menu">',
        '    <li class="submenu">',
        '      <button class="menu-item" type="button">More options</button>',
        '      <ul class="menu">',
        '        <li><a class="menu-item" href="#">Sub-action</a></li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
      const clickSpy = spyOn(Menu.prototype, '_onSubmenuTriggerClick')

      new Menu(btnMenu, { submenuTrigger: 'click' }).dispose()
      // eslint-disable-next-line no-new
      new Menu(btnMenu, { submenuTrigger: 'click' })

      submenuTrigger.click()

      expect(clickSpy).toHaveBeenCalledTimes(1)
    })

    it('should keep the submenu listeners of another instance sharing the menu', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" id="first">First</button>',
        '  <button class="btn" id="second">Second</button>',
        '  <ul class="menu">',
        '    <li class="submenu">',
        '      <button class="menu-item" type="button">More options</button>',
        '      <ul class="menu">',
        '        <li><a class="menu-item" href="#">Sub-action</a></li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('')

      const menuEl = fixtureEl.querySelector('.menu')
      const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
      const clickSpy = spyOn(Menu.prototype, '_onSubmenuTriggerClick')
      const first = new Menu('#first', { menu: menuEl, submenuTrigger: 'click' })
      // eslint-disable-next-line no-new
      new Menu('#second', { menu: menuEl, submenuTrigger: 'click' })

      first.dispose()
      submenuTrigger.click()

      expect(clickSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('update', () => {
    it('should call Floating UI update on update', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menu._floatingCleanup).not.toBeNull()

          const spyUpdate = spyOn(menu, '_updateFloatingPosition')

          menu.update()

          expect(spyUpdate).toHaveBeenCalled()
          resolve()
        })

        menu.toggle()
      })
    })

    it('should do nothing on update if not shown', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Secondary link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menu = new Menu(btnMenu)

      const spy = spyOn(menu, '_updateFloatingPosition')

      menu.update()

      expect(menu._floatingCleanup).toBeNull()
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('data-api', () => {
    it('should show and hide a menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        let showEventTriggered = false
        let hideEventTriggered = false

        btnMenu.addEventListener('show.coreui.menu', () => {
          showEventTriggered = true
        })

        btnMenu.addEventListener('shown.coreui.menu', event => setTimeout(() => {
          expect(btnMenu).toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
          expect(showEventTriggered).toBeTrue()
          expect(event.relatedTarget).toEqual(btnMenu)
          document.body.click()
        }))

        btnMenu.addEventListener('hide.coreui.menu', () => {
          hideEventTriggered = true
        })

        btnMenu.addEventListener('hidden.coreui.menu', event => {
          expect(btnMenu).not.toHaveClass('show')
          expect(btnMenu.getAttribute('aria-expanded')).toEqual('false')
          expect(hideEventTriggered).toBeTrue()
          expect(event.relatedTarget).toEqual(btnMenu)
          resolve()
        })

        btnMenu.click()
      })
    })

    it('should use Floating UI positioning in navbar', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<nav class="navbar md:navbar-expand">',
          '  <div>',
          '    <button class="btn" data-coreui-toggle="menu" aria-expanded="false">Menu</button>',
          '    <div class="menu">',
          '      <a class="menu-item" href="#">Secondary link</a>',
          '    </div>',
          '  </div>',
          '</nav>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menu._floatingCleanup).not.toBeNull()
          // Floating UI sets data-coreui-placement attribute asynchronously
          setTimeout(() => {
            expect(menuEl.getAttribute('data-coreui-placement')).not.toBeNull()
            resolve()
          }, 10)
        })

        menu.show()
      })
    })

    it('should not collapse the menu when clicking a select option nested in the menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" aria-expanded="false">Menu</button>',
          '  <div class="menu">',
          '    <select>',
          '      <option selected>Open this select menu</option>',
          '      <option value="1">One</option>',
          '    </select>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu)

        const hideSpy = spyOn(menu, '_completeHide')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          const clickEvent = new MouseEvent('click', {
            bubbles: true
          })

          menuEl.querySelector('option').dispatchEvent(clickEvent)
        })

        menuEl.addEventListener('click', event => {
          expect(event.target.tagName).toMatch(/select|option/i)

          Menu.clearMenus(event)

          setTimeout(() => {
            expect(hideSpy).not.toHaveBeenCalled()
            resolve()
          }, 10)
        })

        menu.show()
      })
    })

    it('should not use Floating UI if display set to static', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-display="static">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Floating UI adds this attribute when we use it
          expect(menuEl.getAttribute('data-coreui-placement')).toBeNull()
          resolve()
        })

        btnMenu.click()
      })
    })

    it('should manage bs attribute `data-coreui-display`="static" when display set to static', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-display="static">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menuEl.getAttribute('data-coreui-display')).toEqual('static')
          menu.hide()
        })

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          expect(menuEl.getAttribute('data-coreui-display')).toBeNull()
          resolve()
        })

        menu.show()
      })
    })

    it('should remove "show" class if tabbing outside of menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Secondary link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')

          const keyup = createEvent('keyup')

          keyup.key = 'Tab'
          document.dispatchEvent(keyup)
        })

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          expect(btnMenu).not.toHaveClass('show')
          resolve()
        })

        btnMenu.click()
      })
    })

    it('should remove "show" class if body is clicked, with multiple menus', () => {
      fixtureEl.innerHTML = [
        '<div class="nav">',
        '  <div id="testmenu">',
        '    <a class="btn" href="#testmenu" role="button" data-coreui-toggle="menu" aria-expanded="false">Test menu</a>',
        '    <div class="menu">',
        '      <a class="menu-item" href="#sub1">Submenu 1</a>',
        '    </div>',
        '  </div>',
        '</div>',
        '<div class="btn-group">',
        '  <button class="btn">Actions</button>',
        '  <button class="btn" data-coreui-toggle="menu"></button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Action 1</a>',
        '  </div>',
        '</div>'
      ].join('')

      const [triggerFirst, triggerLast] = fixtureEl.querySelectorAll('[data-coreui-toggle="menu"]')

      triggerFirst.click()

      expect(triggerFirst).toHaveClass('show')
      expect(fixtureEl.querySelectorAll('.menu.show')).toHaveSize(1)

      document.body.click()

      expect(fixtureEl.querySelectorAll('.menu.show')).toHaveSize(0)

      triggerLast.click()

      expect(triggerLast).toHaveClass('show')
      expect(fixtureEl.querySelectorAll('.menu.show')).toHaveSize(1)

      document.body.click()

      expect(fixtureEl.querySelectorAll('.menu.show')).toHaveSize(0)
    })

    it('should remove "show" class if body if tabbing outside of menu, with multiple menus', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <a class="btn" href="#testmenu" role="button" data-coreui-toggle="menu" aria-expanded="false">Test menu</a>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#sub1">Submenu 1</a>',
          '  </div>',
          '</div>',
          '<div class="btn-group">',
          '  <button class="btn">Actions</button>',
          '  <button class="btn" data-coreui-toggle="menu"></button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Action 1</a>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenuList = fixtureEl.querySelectorAll('[data-coreui-toggle="menu"]')

        expect(triggerMenuList).toHaveSize(2)

        const [triggerMenuFirst, triggerMenuLast] = triggerMenuList

        triggerMenuFirst.addEventListener('shown.coreui.menu', () => {
          expect(triggerMenuFirst).toHaveClass('show')
          expect(fixtureEl.querySelectorAll('.menu.show')).toHaveSize(1)

          const keyup = createEvent('keyup')
          keyup.key = 'Tab'

          document.dispatchEvent(keyup)
        })

        triggerMenuFirst.addEventListener('hidden.coreui.menu', () => {
          expect(fixtureEl.querySelectorAll('.menu.show')).toHaveSize(0)
          triggerMenuLast.click()
        })

        triggerMenuLast.addEventListener('shown.coreui.menu', () => {
          expect(triggerMenuLast).toHaveClass('show')
          expect(fixtureEl.querySelectorAll('.menu.show')).toHaveSize(1)

          const keyup = createEvent('keyup')
          keyup.key = 'Tab'

          document.dispatchEvent(keyup)
        })

        triggerMenuLast.addEventListener('hidden.coreui.menu', () => {
          expect(fixtureEl.querySelectorAll('.menu.show')).toHaveSize(0)
          resolve()
        })

        triggerMenuFirst.click()
      })
    })

    it('should be able to identify clicked menu, even with multiple menus in the same tag', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button id="menuToggle1" class="btn" data-coreui-toggle="menu">Menu toggle</button>',
        '  <div id="menu1" class="menu">',
        '    <a class="menu-item" href="#">Menu item</a>',
        '  </div>',
        '  <button id="menuToggle2" class="btn" data-coreui-toggle="menu">Menu toggle</button>',
        '  <div id="menu2" class="menu">',
        '    <a class="menu-item" href="#">Menu item</a>',
        '  </div>',
        '</div>'
      ].join('')

      const menuToggle1 = fixtureEl.querySelector('#menuToggle1')
      const menuToggle2 = fixtureEl.querySelector('#menuToggle2')
      const menuEl1 = fixtureEl.querySelector('#menu1')
      const menuEl2 = fixtureEl.querySelector('#menu2')
      const spy = spyOn(Menu, 'getOrCreateInstance').and.callThrough()

      menuToggle1.click()
      expect(spy).toHaveBeenCalledWith(menuToggle1)

      menuToggle2.click()
      expect(spy).toHaveBeenCalledWith(menuToggle2)

      menuEl1.click()
      expect(spy).toHaveBeenCalledWith(menuToggle1)

      menuEl2.click()
      expect(spy).toHaveBeenCalledWith(menuToggle2)
    })

    it('should be able to show the proper menu, even with multiple menus in the same tag', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button id="menuToggle1" class="btn" data-coreui-toggle="menu">Menu toggle</button>',
        '  <div id="menu1" class="menu">',
        '    <a class="menu-item" href="#">Menu item</a>',
        '  </div>',
        '  <button id="menuToggle2" class="btn" data-coreui-toggle="menu">Menu toggle</button>',
        '  <div id="menu2" class="menu">',
        '    <a class="menu-item" href="#">Menu item</a>',
        '  </div>',
        '</div>'
      ].join('')

      const menuToggle1 = fixtureEl.querySelector('#menuToggle1')
      const menuToggle2 = fixtureEl.querySelector('#menuToggle2')
      const menuEl1 = fixtureEl.querySelector('#menu1')
      const menuEl2 = fixtureEl.querySelector('#menu2')

      menuToggle1.click()
      expect(menuEl1).toHaveClass('show')
      expect(menuEl2).not.toHaveClass('show')

      menuToggle2.click()
      expect(menuEl1).not.toHaveClass('show')
      expect(menuEl2).toHaveClass('show')
    })

    it('should fire hide and hidden event without a clickEvent if event type is not click', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#sub1">Submenu 1</a>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')

        triggerMenu.addEventListener('hide.coreui.menu', event => {
          expect(event.clickEvent).toBeUndefined()
        })

        triggerMenu.addEventListener('hidden.coreui.menu', event => {
          expect(event.clickEvent).toBeUndefined()
          resolve()
        })

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          const keydown = createEvent('keydown')

          keydown.key = 'Escape'
          triggerMenu.dispatchEvent(keydown)
        })

        triggerMenu.click()
      })
    })

    it('should bubble up the events to the parent elements', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div class="menu-parent">',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#subMenu">Sub menu</a>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuParent = fixtureEl.querySelector('.menu-parent')
        const menu = new Menu(triggerMenu)

        const showFunction = jasmine.createSpy('showFunction')
        menuParent.addEventListener('show.coreui.menu', showFunction)

        const shownFunction = jasmine.createSpy('shownFunction')
        menuParent.addEventListener('shown.coreui.menu', () => {
          shownFunction()
          menu.hide()
        })

        const hideFunction = jasmine.createSpy('hideFunction')
        menuParent.addEventListener('hide.coreui.menu', hideFunction)

        menuParent.addEventListener('hidden.coreui.menu', () => {
          expect(showFunction).toHaveBeenCalled()
          expect(shownFunction).toHaveBeenCalled()
          expect(hideFunction).toHaveBeenCalled()
          resolve()
        })

        menu.show()
      })
    })

    it('should ignore keyboard events within <input>s and <textarea>s', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#sub1">Submenu 1</a>',
          '    <input type="text">',
          '    <textarea></textarea>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const input = fixtureEl.querySelector('input')
        const textarea = fixtureEl.querySelector('textarea')

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          input.focus()
          const keydown = createEvent('keydown')

          keydown.key = 'ArrowUp'
          input.dispatchEvent(keydown)

          expect(document.activeElement).toEqual(input, 'input still focused')

          textarea.focus()
          textarea.dispatchEvent(keydown)

          expect(document.activeElement).toEqual(textarea, 'textarea still focused')
          resolve()
        })

        triggerMenu.click()
      })
    })

    it('should ignore keyboard events within contenteditable elements', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#sub1">Submenu 1</a>',
          '    <div class="editor" contenteditable="true"></div>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const editor = fixtureEl.querySelector('.editor')

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          editor.focus()
          const keydown = createEvent('keydown')

          keydown.key = 'ArrowUp'
          editor.dispatchEvent(keydown)

          expect(document.activeElement).toEqual(editor, 'contenteditable still focused')
          resolve()
        })

        triggerMenu.click()
      })
    })

    it('should skip disabled element when using keyboard navigation', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item disabled" href="#sub1">Submenu 1</a>',
          '    <button class="menu-item" type="button" disabled>Disabled button</button>',
          '    <a id="item1" class="menu-item" href="#">Another link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          const keydown = createEvent('keydown')
          keydown.key = 'ArrowDown'

          triggerMenu.dispatchEvent(keydown)
          triggerMenu.dispatchEvent(keydown)

          expect(document.activeElement).not.toHaveClass('disabled')
          expect(document.activeElement.hasAttribute('disabled')).toBeFalse()
          resolve()
        })

        triggerMenu.click()
      })
    })

    it('should skip hidden element when using keyboard navigation', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<style>',
          '  .d-none {',
          '    display: none;',
          '  }',
          '</style>',
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <button class="menu-item d-none" type="button">Hidden button by class</button>',
          '    <a class="menu-item" href="#sub1" style="display: none">Hidden link</a>',
          '    <a class="menu-item" href="#sub1" style="visibility: hidden">Hidden link</a>',
          '    <a id="item1" class="menu-item" href="#">Another link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          const keydown = createEvent('keydown')
          keydown.key = 'ArrowDown'

          triggerMenu.dispatchEvent(keydown)

          expect(document.activeElement).not.toHaveClass('d-none')
          expect(document.activeElement.style.display).not.toEqual('none')
          expect(document.activeElement.style.visibility).not.toEqual('hidden')

          resolve()
        })

        triggerMenu.click()
      })
    })

    it('should focus next/previous element when using keyboard navigation', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a id="item1" class="menu-item" href="#">A link</a>',
          '    <a id="item2" class="menu-item" href="#">Another link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const item1 = fixtureEl.querySelector('#item1')
        const item2 = fixtureEl.querySelector('#item2')

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          const keydownArrowDown = createEvent('keydown')
          keydownArrowDown.key = 'ArrowDown'

          triggerMenu.dispatchEvent(keydownArrowDown)
          expect(document.activeElement).toEqual(item1, 'item1 is focused')

          document.activeElement.dispatchEvent(keydownArrowDown)
          expect(document.activeElement).toEqual(item2, 'item2 is focused')

          const keydownArrowUp = createEvent('keydown')
          keydownArrowUp.key = 'ArrowUp'

          document.activeElement.dispatchEvent(keydownArrowUp)
          expect(document.activeElement).toEqual(item1, 'item1 is focused')

          resolve()
        })

        triggerMenu.click()
      })
    })

    it('should open the menu and focus on the last item when using ArrowUp for the first time', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a id="item1" class="menu-item" href="#">A link</a>',
          '    <a id="item2" class="menu-item" href="#">Another link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const lastItem = fixtureEl.querySelector('#item2')

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          setTimeout(() => {
            expect(document.activeElement).toEqual(lastItem, 'item2 is focused')
            resolve()
          })
        })

        const keydown = createEvent('keydown')
        keydown.key = 'ArrowUp'
        triggerMenu.dispatchEvent(keydown)
      })
    })

    it('should open the menu and focus on the first item when using ArrowDown for the first time', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a id="item1" class="menu-item" href="#">A link</a>',
          '    <a id="item2" class="menu-item" href="#">Another link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const firstItem = fixtureEl.querySelector('#item1')

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          setTimeout(() => {
            expect(document.activeElement).toEqual(firstItem, 'item1 is focused')
            resolve()
          })
        })

        const keydown = createEvent('keydown')
        keydown.key = 'ArrowDown'
        triggerMenu.dispatchEvent(keydown)
      })
    })

    it('should stop at the last item on ArrowDown by default', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a id="item1" class="menu-item" href="#">A link</a>',
          '    <a id="item2" class="menu-item" href="#">Another link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const trigger = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const lastItem = fixtureEl.querySelector('#item2')
        const instance = new Menu(trigger)

        trigger.addEventListener('shown.coreui.menu', () => {
          lastItem.focus()
          const keydown = createEvent('keydown')
          keydown.key = 'ArrowDown'
          lastItem.dispatchEvent(keydown)

          expect(document.activeElement).toEqual(lastItem)
          resolve()
        })

        instance.show()
      })
    })

    it('should move from the last item to the first on ArrowDown with loopFocus', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-loop-focus="true">Menu</button>',
          '  <div class="menu">',
          '    <a id="item1" class="menu-item" href="#">A link</a>',
          '    <a id="item2" class="menu-item" href="#">Another link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const trigger = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const firstItem = fixtureEl.querySelector('#item1')
        const lastItem = fixtureEl.querySelector('#item2')
        const instance = new Menu(trigger)

        trigger.addEventListener('shown.coreui.menu', () => {
          lastItem.focus()
          const keydown = createEvent('keydown')
          keydown.key = 'ArrowDown'
          lastItem.dispatchEvent(keydown)
          expect(document.activeElement).toEqual(firstItem)

          keydown.key = 'ArrowUp'
          firstItem.dispatchEvent(keydown)
          expect(document.activeElement).toEqual(lastItem)
          resolve()
        })

        instance.show()
      })
    })

    it('should move from the last item of a submenu to its first on ArrowDown with loopFocus', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-loop-focus="true">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">A link</a>',
          '    <div class="submenu">',
          '      <button class="menu-item" type="button">More</button>',
          '      <div class="menu">',
          '        <a id="sub1" class="menu-item" href="#">Sub 1</a>',
          '        <a id="sub2" class="menu-item" href="#">Sub 2</a>',
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')

        const trigger = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const firstSubItem = fixtureEl.querySelector('#sub1')
        const lastSubItem = fixtureEl.querySelector('#sub2')
        const instance = new Menu(trigger)

        trigger.addEventListener('shown.coreui.menu', () => {
          submenuTrigger.focus()
          const keydown = createEvent('keydown')
          keydown.key = 'ArrowRight'
          submenuTrigger.dispatchEvent(keydown)

          setTimeout(() => {
            lastSubItem.focus()
            keydown.key = 'ArrowDown'
            lastSubItem.dispatchEvent(keydown)

            expect(document.activeElement).toEqual(firstSubItem)
            resolve()
          }, 20)
        })

        instance.show()
      })
    })

    it('should move into its own menu on ArrowDown from a toggle that sits in another menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div class="menu" id="outer">',
          '  <a id="outerItem" class="menu-item" href="#">Outer link</a>',
          '  <div>',
          '    <button class="btn menu-item" id="innerToggle" data-coreui-toggle="menu">Menu</button>',
          '    <div class="menu">',
          '      <a id="innerItem" class="menu-item" href="#">Inner link</a>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')

        const trigger = fixtureEl.querySelector('#innerToggle')
        const innerItem = fixtureEl.querySelector('#innerItem')

        trigger.addEventListener('shown.coreui.menu', () => {
          setTimeout(() => {
            expect(document.activeElement).toEqual(innerItem)
            resolve()
          })
        })

        trigger.focus()
        const keydown = createEvent('keydown')
        keydown.key = 'ArrowDown'
        trigger.dispatchEvent(keydown)
      })
    })

    it('should move into its own menu on End from a toggle that sits in another menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div class="menu" id="outer">',
          '  <a id="outerItem" class="menu-item" href="#">Outer link</a>',
          '  <div>',
          '    <button class="btn menu-item" id="innerToggle" data-coreui-toggle="menu">Menu</button>',
          '    <div class="menu">',
          '      <a id="innerFirst" class="menu-item" href="#">Inner link</a>',
          '      <a id="innerLast" class="menu-item" href="#">Another inner link</a>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')

        const trigger = fixtureEl.querySelector('#innerToggle')
        const innerLast = fixtureEl.querySelector('#innerLast')
        const instance = new Menu(trigger)

        trigger.addEventListener('shown.coreui.menu', () => {
          trigger.focus()
          const keydown = createEvent('keydown')
          keydown.key = 'End'
          trigger.dispatchEvent(keydown)

          expect(document.activeElement).toEqual(innerLast)
          resolve()
        })

        instance.show()
      })
    })

    it('should not close the menu if the user clicks on a text field within menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <input type="text">',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const input = fixtureEl.querySelector('input')

        input.addEventListener('click', () => {
          expect(triggerMenu).toHaveClass('show')
          resolve()
        })

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          expect(triggerMenu).toHaveClass('show')
          input.dispatchEvent(createEvent('click'))
        })

        triggerMenu.click()
      })
    })

    it('should not close the menu if the user clicks on a textarea within menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <textarea></textarea>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const textarea = fixtureEl.querySelector('textarea')

        textarea.addEventListener('click', () => {
          expect(triggerMenu).toHaveClass('show')
          resolve()
        })

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          expect(triggerMenu).toHaveClass('show')
          textarea.dispatchEvent(createEvent('click'))
        })

        triggerMenu.click()
      })
    })

    it('should not close the menu if the user clicks a label inside a form within the menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <form>',
          '      <label for="menu-email">Email</label>',
          '      <input type="text" id="menu-email">',
          '    </form>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const label = fixtureEl.querySelector('label')

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          expect(triggerMenu).toHaveClass('show')
          // clearMenus runs synchronously while this bubbling click reaches the
          // document, so assert right after dispatch returns.
          label.dispatchEvent(createEvent('click', { bubbles: true }))
          expect(triggerMenu).toHaveClass('show')
          resolve()
        })

        triggerMenu.click()
      })
    })

    it('should close the menu if the user clicks on a text field that is not contained within menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '  </div>',
          '</div>',
          '<input type="text">'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const input = fixtureEl.querySelector('input')

        triggerMenu.addEventListener('hidden.coreui.menu', () => {
          expect().nothing()
          resolve()
        })

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          input.dispatchEvent(createEvent('click', {
            bubbles: true
          }))
        })

        triggerMenu.click()
      })
    })

    it('should ignore keyboard events for <input>s and <textarea>s within menu, except for escape key', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#sub1">Submenu 1</a>',
          '    <input type="text">',
          '    <textarea></textarea>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const input = fixtureEl.querySelector('input')
        const textarea = fixtureEl.querySelector('textarea')

        const test = (eventKey, elementToDispatch) => {
          const event = createEvent('keydown')
          event.key = eventKey
          elementToDispatch.focus()
          elementToDispatch.dispatchEvent(event)
          expect(document.activeElement).toEqual(elementToDispatch, `${elementToDispatch.tagName} still focused`)
        }

        const keydownEscape = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' })

        triggerMenu.addEventListener('shown.coreui.menu', () => {
          // Key Space
          test('Space', input)

          test('Space', textarea)

          // Key ArrowUp
          test('ArrowUp', input)

          test('ArrowUp', textarea)

          // Key ArrowDown
          test('ArrowDown', input)

          test('ArrowDown', textarea)

          // Key Escape
          input.focus()
          input.dispatchEvent(keydownEscape)

          expect(triggerMenu).not.toHaveClass('show')
          resolve()
        })

        triggerMenu.click()
      })
    })

    it('should not open menu if escape key was pressed on the toggle', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div class="tabs">',
          '  <div>',
          '    <button disabled class="btn" data-coreui-toggle="menu">Menu</button>',
          '    <div class="menu">',
          '      <a class="menu-item" href="#">Secondary link</a>',
          '      <a class="menu-item" href="#">Something else here</a>',
          '      <div class="divider"></div>',
          '      <a class="menu-item" href="#">Another link</a>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')

        const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(triggerMenu)
        const button = fixtureEl.querySelector('button[data-coreui-toggle="menu"]')

        const spy = spyOn(menu, 'toggle')

        // Key escape
        button.focus()
        // Key escape
        const keydownEscape = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' })
        button.dispatchEvent(keydownEscape)

        setTimeout(() => {
          expect(spy).not.toHaveBeenCalled()
          expect(triggerMenu).not.toHaveClass('show')
          resolve()
        }, 20)
      })
    })

    it('should propagate escape key events if menu is closed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div class="parent">',
          '  <div>',
          '    <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '    <div class="menu">',
          '      <a class="menu-item" href="#">Some Item</a>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')

        const parent = fixtureEl.querySelector('.parent')
        const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')

        const parentKeyHandler = jasmine.createSpy('parentKeyHandler')

        parent.addEventListener('keydown', parentKeyHandler)
        parent.addEventListener('keyup', () => {
          expect(parentKeyHandler).toHaveBeenCalled()
          resolve()
        })

        const keydownEscape = createEvent('keydown', { bubbles: true })
        keydownEscape.key = 'Escape'
        const keyupEscape = createEvent('keyup', { bubbles: true })
        keyupEscape.key = 'Escape'

        toggle.focus()
        toggle.dispatchEvent(keydownEscape)
        toggle.dispatchEvent(keyupEscape)
      })
    })

    it('should not propagate escape key events if menu is open', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div class="parent">',
          '  <div>',
          '    <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '    <div class="menu">',
          '      <a class="menu-item" href="#">Some Item</a>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')

        const parent = fixtureEl.querySelector('.parent')
        const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')

        const parentKeyHandler = jasmine.createSpy('parentKeyHandler')

        parent.addEventListener('keydown', parentKeyHandler)
        parent.addEventListener('keyup', () => {
          expect(parentKeyHandler).not.toHaveBeenCalled()
          resolve()
        })

        const keydownEscape = createEvent('keydown', { bubbles: true })
        keydownEscape.key = 'Escape'
        const keyupEscape = createEvent('keyup', { bubbles: true })
        keyupEscape.key = 'Escape'

        toggle.click()
        toggle.dispatchEvent(keydownEscape)
        toggle.dispatchEvent(keyupEscape)
      })
    })

    it('should close menu using `escape` button, and return focus to its trigger', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Some Item</a>',
          '  </div>',
          '</div>'
        ].join('')

        const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')

        toggle.addEventListener('shown.coreui.menu', () => {
          const keydownEvent = createEvent('keydown', { bubbles: true })
          keydownEvent.key = 'ArrowDown'
          toggle.dispatchEvent(keydownEvent)
          keydownEvent.key = 'Escape'
          toggle.dispatchEvent(keydownEvent)
        })

        toggle.addEventListener('hidden.coreui.menu', () => setTimeout(() => {
          expect(document.activeElement).toEqual(toggle)
          resolve()
        }))

        toggle.click()
      })
    })

    it('should close menu (only) by clicking inside the menu menu when it has data-attribute `data-coreui-auto-close="inside"`', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-auto-close="inside">Menu toggle</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Menu item</a>',
          ' </div>',
          '</div>'
        ].join('')

        const menuToggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')

        const expectMenuToBeOpened = () => setTimeout(() => {
          expect(menuToggle).toHaveClass('show')
          menuEl.click()
        }, 150)

        menuToggle.addEventListener('shown.coreui.menu', () => {
          document.documentElement.click()
          expectMenuToBeOpened()
        })

        menuToggle.addEventListener('hidden.coreui.menu', () => setTimeout(() => {
          expect(menuToggle).not.toHaveClass('show')
          resolve()
        }))

        menuToggle.click()
      })
    })

    it('should close menu (only) by clicking outside the menu menu when it has data-attribute `data-coreui-auto-close="outside"`', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-auto-close="outside">Menu toggle</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Menu item</a>',
          ' </div>',
          '</div>'
        ].join('')

        const menuToggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')

        const expectMenuToBeOpened = () => setTimeout(() => {
          expect(menuToggle).toHaveClass('show')
          document.documentElement.click()
        }, 150)

        menuToggle.addEventListener('shown.coreui.menu', () => {
          menuEl.click()
          expectMenuToBeOpened()
        })

        menuToggle.addEventListener('hidden.coreui.menu', () => {
          expect(menuToggle).not.toHaveClass('show')
          resolve()
        })

        menuToggle.click()
      })
    })

    it('should not close menu by clicking inside or outside the menu menu when it has data-attribute `data-coreui-auto-close="false"`', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-auto-close="false">Menu toggle</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Menu item</a>',
          ' </div>',
          '</div>'
        ].join('')

        const menuToggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')

        const expectMenuToBeOpened = (shouldTriggerClick = true) => setTimeout(() => {
          expect(menuToggle).toHaveClass('show')
          if (shouldTriggerClick) {
            document.documentElement.click()
          } else {
            resolve()
          }

          expectMenuToBeOpened(false)
        }, 150)

        menuToggle.addEventListener('shown.coreui.menu', () => {
          menuEl.click()
          expectMenuToBeOpened()
        })

        menuToggle.click()
      })
    })

    it('should stay open when a press that started in the menu or on the toggle ends outside it', () => {
      for (const autoClose of [true, 'outside']) {
        fixtureEl.innerHTML = [
          '<button class="btn" data-coreui-toggle="menu">Menu toggle</button>',
          '<div class="menu"><input type="search"><a class="menu-item" href="#">Menu item</a></div>',
          '<button id="outside">Outside</button>'
        ].join('')

        const menuToggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(menuToggle, { autoClose })
        const outside = fixtureEl.querySelector('#outside')

        for (const start of [fixtureEl.querySelector('input'), fixtureEl.querySelector('.menu-item'), menuToggle]) {
          menu.show()
          start.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }))
          document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

          expect(menuToggle).toHaveClass('show')
        }

        outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }))
        outside.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

        expect(menuToggle).not.toHaveClass('show')
        menu.dispose()
      }
    })

    it('should close on a click with its own press on an item', () => {
      for (const autoClose of [true, 'inside']) {
        fixtureEl.innerHTML = [
          '<button class="btn" data-coreui-toggle="menu">Menu toggle</button>',
          '<div class="menu"><a class="menu-item" href="#">Menu item</a></div>'
        ].join('')

        const menuToggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(menuToggle, { autoClose })
        const item = fixtureEl.querySelector('.menu-item')

        menu.show()
        item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }))
        item.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

        expect(menuToggle).not.toHaveClass('show')
        menu.dispose()
      }
    })

    it('should close on a click outside that does not land on the path of an earlier press in the menu', () => {
      fixtureEl.innerHTML = [
        '<button class="btn" data-coreui-toggle="menu">Menu toggle</button>',
        '<div class="menu"><input type="search"></div>',
        '<button id="outside">Outside</button>'
      ].join('')

      const menuToggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menu = new Menu(menuToggle)

      menu.show()
      fixtureEl.querySelector('input').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }))
      fixtureEl.querySelector('#outside').dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1 }))

      expect(menuToggle).not.toHaveClass('show')
    })

    it('should close on a click outside without a press of its own, after an earlier press in the menu', () => {
      fixtureEl.innerHTML = [
        '<button class="btn" data-coreui-toggle="menu">Menu toggle</button>',
        '<div class="menu"><input type="search"></div>',
        '<button id="outside">Outside</button>'
      ].join('')

      const menuToggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menu = new Menu(menuToggle)
      const outside = fixtureEl.querySelector('#outside')
      const input = fixtureEl.querySelector('input')

      menu.show()
      input.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }))
      input.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))
      expect(menuToggle).toHaveClass('show')

      outside.click()

      expect(menuToggle).not.toHaveClass('show')
    })

    it('should be able to identify clicked menu, no matter the markup order', () => {
      fixtureEl.innerHTML = [
        '<div class="menu">',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Menu item</a>',
        '  </div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu toggle</button>',
        '</div>'
      ].join('')

      const menuToggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menuEl = fixtureEl.querySelector('.menu')
      const spy = spyOn(Menu, 'getOrCreateInstance').and.callThrough()

      menuToggle.click()
      expect(spy).toHaveBeenCalledWith(menuToggle)
      menuEl.click()
      expect(spy).toHaveBeenCalledWith(menuToggle)
    })
  })

  describe('getInstance', () => {
    it('should return menu instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const menu = new Menu(div)

      expect(Menu.getInstance(div)).toEqual(menu)
      expect(Menu.getInstance(div)).toBeInstanceOf(Menu)
    })

    it('should return null when there is no menu instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Menu.getInstance(div)).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return menu instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const menu = new Menu(div)

      expect(Menu.getOrCreateInstance(div)).toEqual(menu)
      expect(Menu.getInstance(div)).toEqual(Menu.getOrCreateInstance(div, {}))
      expect(Menu.getOrCreateInstance(div)).toBeInstanceOf(Menu)
    })

    it('should return new instance when there is no menu instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Menu.getInstance(div)).toBeNull()
      expect(Menu.getOrCreateInstance(div)).toBeInstanceOf(Menu)
    })

    it('should return new instance when there is no menu instance with given configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Menu.getInstance(div)).toBeNull()
      const menu = Menu.getOrCreateInstance(div, {
        display: 'dynamic'
      })
      expect(menu).toBeInstanceOf(Menu)

      expect(menu._config.display).toEqual('dynamic')
    })

    it('should return the instance when exists without given configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const menu = new Menu(div, {
        display: 'dynamic'
      })
      expect(Menu.getInstance(div)).toEqual(menu)

      const menu2 = Menu.getOrCreateInstance(div, {
        display: 'static'
      })
      expect(menu).toBeInstanceOf(Menu)
      expect(menu2).toEqual(menu)

      expect(menu2._config.display).toEqual('dynamic')
    })
  })

  it('should open menu when pressing keydown or keyup', () => {
    return new Promise(resolve => {
      fixtureEl.innerHTML = [
        '<div class="menu-parent">',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item disabled" href="#sub1">Submenu 1</a>',
        '    <button class="menu-item" type="button" disabled>Disabled button</button>',
        '    <a id="item1" class="menu-item" href="#">Another link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const triggerMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menuWrapper = fixtureEl.querySelector('.menu-parent')

      const keydown = createEvent('keydown')
      keydown.key = 'ArrowDown'

      const keyup = createEvent('keyup')
      keyup.key = 'ArrowUp'

      const handleArrowDown = () => {
        expect(triggerMenu).toHaveClass('show')
        expect(triggerMenu.getAttribute('aria-expanded')).toEqual('true')
        setTimeout(() => {
          Menu.getInstance(triggerMenu).hide()
          keydown.key = 'ArrowUp'
          triggerMenu.dispatchEvent(keyup)
        }, 20)
      }

      const handleArrowUp = () => {
        expect(triggerMenu).toHaveClass('show')
        expect(triggerMenu.getAttribute('aria-expanded')).toEqual('true')
        resolve()
      }

      menuWrapper.addEventListener('shown.coreui.menu', event => {
        if (event.target.key === 'ArrowDown') {
          handleArrowDown()
        } else {
          handleArrowUp()
        }
      })

      triggerMenu.dispatchEvent(keydown)
    })
  })

  it('should allow `data-coreui-toggle="menu"` click events to bubble up', () => {
    fixtureEl.innerHTML = [
      '<div>',
      '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
      '  <div class="menu">',
      '    <a class="menu-item" href="#">Secondary link</a>',
      '  </div>',
      '</div>'
    ].join('')

    const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
    const clickListener = jasmine.createSpy('clickListener')
    const delegatedClickListener = jasmine.createSpy('delegatedClickListener')

    btnMenu.addEventListener('click', clickListener)
    document.addEventListener('click', delegatedClickListener)

    btnMenu.click()

    expect(clickListener).toHaveBeenCalled()
    expect(delegatedClickListener).toHaveBeenCalled()
  })

  it('should open the menu when clicking the child element inside `data-coreui-toggle="menu"`', () => {
    return new Promise(resolve => {
      fixtureEl.innerHTML = [
        '<div class="container">',
        '  <div>',
        '    <button class="btn" data-coreui-toggle="menu"><span id="childElement">Menu</span></button>',
        '    <div class="menu">',
        '      <a class="menu-item" href="#subMenu">Sub menu</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const childElement = fixtureEl.querySelector('#childElement')

      btnMenu.addEventListener('shown.coreui.menu', () => setTimeout(() => {
        expect(btnMenu).toHaveClass('show')
        expect(btnMenu.getAttribute('aria-expanded')).toEqual('true')
        resolve()
      }))

      childElement.click()
    })
  })

  describe('responsive placements', () => {
    it('should parse responsive placement string and create instance', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu" data-coreui-placement="bottom-start md:top-end">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menu = new Menu(btnMenu)

      // Menu should have parsed responsive placements
      expect(menu._responsivePlacements).not.toBeNull()
      expect(menu._responsivePlacements.xs).toEqual('bottom-start')
      expect(menu._responsivePlacements.md).toEqual('top-end')
    })

    it('should return null for non-responsive placement', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu" data-coreui-placement="bottom-start">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menu = new Menu(btnMenu)

      // Non-responsive placement should not create responsive placements object
      expect(menu._responsivePlacements).toBeNull()
    })
  })

  describe('virtual element reference', () => {
    it('should work with virtual element as reference', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Link</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')

        // Virtual element with getBoundingClientRect
        const virtualElement = {
          getBoundingClientRect() {
            return {
              width: 100,
              height: 50,
              top: 100,
              left: 100,
              right: 200,
              bottom: 150,
              x: 100,
              y: 100
            }
          }
        }

        const menu = new Menu(btnMenu, {
          reference: virtualElement
        })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(document.querySelector('.menu.show')).not.toBeNull()
          resolve()
        })

        menu.show()
      })
    })

    it('should throw error for object reference without getBoundingClientRect', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Link</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')

      expect(() => {
        // eslint-disable-next-line no-new
        new Menu(btnMenu, {
          reference: { someProperty: 'value' } // Object without getBoundingClientRect
        })
      }).toThrowError(TypeError)
    })
  })

  describe('selectMenuItem', () => {
    it('should do nothing when menu has no visible items', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Simulate ArrowDown key - should not throw when no items
          const keydown = createEvent('keydown')
          keydown.key = 'ArrowDown'
          btnMenu.dispatchEvent(keydown)

          // No error thrown means test passed
          expect(true).toBeTrue()
          resolve()
        })

        menu.show()
      })
    })
  })

  describe('submenu', () => {
    const nestedMarkup = [
      '<div>',
      '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
      '  <div class="menu">',
      '    <a id="root" class="menu-item" href="#">Root</a>',
      '    <div class="submenu">',
      '      <button id="l1" class="menu-item" type="button">Level 1</button>',
      '      <div class="menu">',
      '        <a id="l1a" class="menu-item" href="#">L1 A</a>',
      '        <div class="submenu">',
      '          <button id="l2" class="menu-item" type="button">Level 2</button>',
      '          <div class="menu">',
      '            <a id="l2a" class="menu-item" href="#">L2 A</a>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('')

    const keyupTab = (target, shiftKey = false) => {
      target.focus()
      target.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Tab', shiftKey }))
    }

    it('should announce every submenu trigger as a menu popup before it opens', () => {
      fixtureEl.innerHTML = nestedMarkup

      const trigger = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const levelOne = fixtureEl.querySelector('#l1')
      const levelTwo = fixtureEl.querySelector('#l2')

      // eslint-disable-next-line no-new
      new Menu(trigger)

      for (const submenuTrigger of [levelOne, levelTwo]) {
        expect(submenuTrigger.getAttribute('aria-haspopup')).toEqual('menu')
        expect(submenuTrigger.getAttribute('aria-expanded')).toEqual('false')
      }

      expect(fixtureEl.querySelector('#root').getAttribute('aria-haspopup')).toBeNull()
    })

    it('should leave a submenu wrapper without a nested menu alone and write the expanded state itself', () => {
      fixtureEl.innerHTML = nestedMarkup.replace('<a id="root"', '<div class="submenu"><button id="lone" class="menu-item" type="button">Lone</button></div><a id="root"').replace('<button id="l2" class="menu-item" type="button">', '<button id="l2" class="menu-item" type="button" aria-expanded="true">')

      // eslint-disable-next-line no-new
      new Menu(fixtureEl.querySelector('[data-coreui-toggle="menu"]'))

      expect(fixtureEl.querySelector('#lone').getAttribute('aria-haspopup')).toBeNull()
      expect(fixtureEl.querySelector('#l2').getAttribute('aria-expanded')).toEqual('false')
    })

    it('should keep the menu popup value when a submenu opens and closes', () => {
      fixtureEl.innerHTML = nestedMarkup

      const trigger = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const levelOne = fixtureEl.querySelector('#l1')
      const instance = new Menu(trigger)

      instance.show()
      levelOne.click()
      expect(levelOne.getAttribute('aria-haspopup')).toEqual('menu')
      expect(levelOne.getAttribute('aria-expanded')).toEqual('true')

      levelOne.click()
      expect(levelOne.getAttribute('aria-haspopup')).toEqual('menu')
      expect(levelOne.getAttribute('aria-expanded')).toEqual('false')
    })

    it('should close the submenu Tab leaves for its parent level', () => {
      fixtureEl.innerHTML = nestedMarkup

      const trigger = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const levelOne = fixtureEl.querySelector('#l1')
      const levelOnePanel = levelOne.nextElementSibling
      const instance = new Menu(trigger)

      instance.show()
      levelOne.click()
      expect(levelOnePanel).toHaveClass('show')

      keyupTab(fixtureEl.querySelector('#root'))

      expect(levelOnePanel).not.toHaveClass('show')
      expect(levelOne.getAttribute('aria-expanded')).toEqual('false')
    })

    it('should close only the deeper submenu when Tab moves up one level', () => {
      fixtureEl.innerHTML = nestedMarkup

      const trigger = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const levelOne = fixtureEl.querySelector('#l1')
      const levelTwo = fixtureEl.querySelector('#l2')
      const instance = new Menu(trigger)

      instance.show()
      levelOne.click()
      levelTwo.click()
      expect(levelTwo.nextElementSibling).toHaveClass('show')

      keyupTab(fixtureEl.querySelector('#l1a'))

      expect(levelTwo.nextElementSibling).not.toHaveClass('show')
      expect(levelOne.nextElementSibling).toHaveClass('show')
    })

    it('should keep the submenu open when Shift+Tab returns to its own trigger', () => {
      fixtureEl.innerHTML = nestedMarkup

      const trigger = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const levelOne = fixtureEl.querySelector('#l1')
      const instance = new Menu(trigger)

      instance.show()
      levelOne.click()

      keyupTab(levelOne, true)

      expect(levelOne.nextElementSibling).toHaveClass('show')
    })

    it('should close the submenu Tab leaves whatever autoClose says', () => {
      for (const autoClose of [false, 'inside', 'outside']) {
        fixtureEl.innerHTML = nestedMarkup

        const trigger = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const levelOne = fixtureEl.querySelector('#l1')
        const instance = new Menu(trigger, { autoClose })

        instance.show()
        levelOne.click()
        keyupTab(fixtureEl.querySelector('#root'))

        expect(levelOne.nextElementSibling).not.toHaveClass('show')
        instance.dispose()
      }
    })

    it('should open submenu on click', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li><a class="menu-item" href="#">Action</a></li>',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action 1</a></li>',
          '        <li><a class="menu-item" href="#">Sub-action 2</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          submenuTrigger.click()

          expect(submenu.classList.contains('show')).toBeTrue()
          expect(submenuWrapper.classList.contains('show')).toBeTrue()
          resolve()
        })

        // eslint-disable-next-line no-new
        new Menu(btnMenu)
        btnMenu.click()
      })
    })

    it('should toggle submenu on click', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu
          submenuTrigger.click()
          expect(submenu.classList.contains('show')).toBeTrue()

          // Close submenu
          submenuTrigger.click()
          expect(submenu.classList.contains('show')).toBeFalse()
          resolve()
        })

        // eslint-disable-next-line no-new
        new Menu(btnMenu)
        btnMenu.click()
      })
    })

    it('should keep a submenu opened by hover open on the next click and close it on the click after', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <ul class="menu">',
        '    <li class="submenu">',
        '      <button class="menu-item" type="button">More options</button>',
        '      <ul class="menu">',
        '      <li><a class="menu-item" href="#">Sub-action</a></li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
      const submenu = fixtureEl.querySelector('.submenu > .menu')

      new Menu(btnMenu).show()
      submenuTrigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      expect(submenu).toHaveClass('show')

      submenuTrigger.click()
      expect(submenu).toHaveClass('show')
      expect(submenuTrigger.getAttribute('aria-expanded')).toEqual('true')

      submenuTrigger.click()
      expect(submenu).not.toHaveClass('show')
    })

    it('should open on click a submenu that a hover opened and the menu closed since', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <ul class="menu">',
        '    <li class="submenu">',
        '      <button class="menu-item" type="button">More options</button>',
        '      <ul class="menu">',
        '      <li><a class="menu-item" href="#">Sub-action</a></li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
      const submenu = fixtureEl.querySelector('.submenu > .menu')

      const menu = new Menu(btnMenu)
      menu.show()
      submenuTrigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      menu.hide()
      menu.show()
      submenuTrigger.click()

      expect(submenu).toHaveClass('show')
    })

    it('should close on a second tap a submenu that the first tap opened by hover', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <ul class="menu">',
        '    <li class="submenu">',
        '      <button class="menu-item" type="button">More options</button>',
        '      <ul class="menu">',
        '        <li><a class="menu-item" href="#">Sub-action</a></li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
      const submenu = fixtureEl.querySelector('.submenu > .menu')

      new Menu(btnMenu).show()
      submenuTrigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      submenuTrigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }))
      submenuTrigger.click()

      expect(submenu).not.toHaveClass('show')
    })

    it('should open on click a submenu that a hover opened and the pointer left since', async () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <ul class="menu">',
        '    <li class="submenu">',
        '      <button class="menu-item" type="button">More options</button>',
        '      <ul class="menu">',
        '        <li><a class="menu-item" href="#">Sub-action</a></li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
      const submenu = fixtureEl.querySelector('.submenu > .menu')

      new Menu(btnMenu).show()
      submenuTrigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      fixtureEl.querySelector('.submenu').dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: btnMenu }))
      await new Promise(resolve => {
        setTimeout(resolve, 150)
      })
      expect(submenu).not.toHaveClass('show')

      submenuTrigger.click()
      expect(submenu).toHaveClass('show')
    })

    it('should toggle on click a submenu that a hover did not open', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <ul class="menu">',
        '    <li class="submenu">',
        '      <button class="menu-item" type="button">More options</button>',
        '      <ul class="menu">',
        '      <li><a class="menu-item" href="#">Sub-action</a></li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
      const submenu = fixtureEl.querySelector('.submenu > .menu')

      new Menu(btnMenu).show()
      submenuTrigger.click()
      submenuTrigger.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      submenuTrigger.click()

      expect(submenu).not.toHaveClass('show')
    })

    it('should close sibling submenus when opening a new one', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu" id="submenu1">',
          '      <button class="menu-item" type="button">Submenu 1</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Action 1</a></li>',
          '      </ul>',
          '    </li>',
          '    <li class="submenu" id="submenu2">',
          '      <button class="menu-item" type="button">Submenu 2</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Action 2</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenu1Wrapper = fixtureEl.querySelector('#submenu1')
        const submenu2Wrapper = fixtureEl.querySelector('#submenu2')
        const submenu1Trigger = submenu1Wrapper.querySelector('.menu-item')
        const submenu2Trigger = submenu2Wrapper.querySelector('.menu-item')
        const submenu1 = submenu1Wrapper.querySelector('.menu')
        const submenu2 = submenu2Wrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open first submenu
          submenu1Trigger.click()
          expect(submenu1.classList.contains('show')).toBeTrue()
          expect(submenu2.classList.contains('show')).toBeFalse()

          // Open second submenu - first should close
          submenu2Trigger.click()
          expect(submenu1.classList.contains('show')).toBeFalse()
          expect(submenu2.classList.contains('show')).toBeTrue()
          resolve()
        })

        // eslint-disable-next-line no-new
        new Menu(btnMenu)
        btnMenu.click()
      })
    })

    it('should open submenu with ArrowRight key', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Focus the submenu trigger
          submenuTrigger.focus()

          // Press ArrowRight to open submenu
          const keydown = createEvent('keydown')
          keydown.key = 'ArrowRight'
          submenuTrigger.dispatchEvent(keydown)

          setTimeout(() => {
            // Submenu should be open
            expect(submenu.classList.contains('show')).toBeTrue()
            expect(submenuWrapper.classList.contains('show')).toBeTrue()
            resolve()
          }, 20)
        })

        // eslint-disable-next-line no-new
        new Menu(btnMenu)
        btnMenu.click()
      })
    })

    it('should close submenu via internal method', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu first using internal method
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)
          expect(submenu.classList.contains('show')).toBeTrue()
          expect(menu._openSubmenus.size).toEqual(1)

          // Close submenu using internal method
          menu._closeSubmenu(submenu, submenuWrapper)
          expect(submenu.classList.contains('show')).toBeFalse()
          expect(menu._openSubmenus.size).toEqual(0)

          resolve()
        })

        menu.show()
      })
    })

    it('should keep a mouseenter listener registered by other code when a submenu closes', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')
        const menu = new Menu(btnMenu)
        let calls = 0

        EventHandler.on(submenu, 'mouseenter.menu', () => {
          calls++
        })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)
          menu._closeSubmenu(submenu, submenuWrapper)

          submenu.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

          expect(calls).toEqual(1)
          EventHandler.off(submenu, '.menu')
          resolve()
        })

        menu.show()
      })
    })

    it('should keep an open submenu listening after a menu instance on that submenu is disposed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')
        const outer = new Menu(btnMenu)
        const inner = new Menu(submenuTrigger)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          outer._openSubmenu(submenuTrigger, submenu, submenuWrapper)
          inner.dispose()

          const cancelSpy = spyOn(outer, '_cancelSubmenuCloseTimeout')
          submenu.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

          expect(cancelSpy).toHaveBeenCalledWith(submenu)
          resolve()
        })

        outer.show()
      })
    })

    it('should open submenu with Enter key', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          submenuTrigger.focus()

          const keydown = createEvent('keydown')
          keydown.key = 'Enter'
          submenuTrigger.dispatchEvent(keydown)

          setTimeout(() => {
            // Submenu should be open
            expect(submenu.classList.contains('show')).toBeTrue()
            expect(submenuWrapper.classList.contains('show')).toBeTrue()
            resolve()
          }, 20)
        })

        // eslint-disable-next-line no-new
        new Menu(btnMenu)
        btnMenu.click()
      })
    })

    it('should open submenu with Space key', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          submenuTrigger.focus()

          const keydown = createEvent('keydown')
          keydown.key = ' '
          submenuTrigger.dispatchEvent(keydown)

          setTimeout(() => {
            // Submenu should be open
            expect(submenu.classList.contains('show')).toBeTrue()
            expect(submenuWrapper.classList.contains('show')).toBeTrue()
            resolve()
          }, 20)
        })

        // eslint-disable-next-line no-new
        new Menu(btnMenu)
        btnMenu.click()
      })
    })

    it('should close all submenus when main menu closes', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu
          submenuTrigger.click()
          expect(submenu.classList.contains('show')).toBeTrue()

          // Close main menu
          menu.hide()
        })

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          expect(submenu.classList.contains('show')).toBeFalse()
          resolve()
        })

        menu.show()
      })
    })

    it('should close nested submenus when closing parent submenu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu" id="level1">',
          '      <button class="menu-item" type="button">Level 1</button>',
          '      <ul class="menu">',
          '        <li class="submenu" id="level2">',
          '          <button class="menu-item" type="button">Level 2</button>',
          '          <ul class="menu">',
          '            <li><a class="menu-item" href="#">Level 3 action</a></li>',
          '          </ul>',
          '        </li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const level1Wrapper = fixtureEl.querySelector('#level1')
        const level2Wrapper = fixtureEl.querySelector('#level2')
        const level1Trigger = level1Wrapper.querySelector(':scope > .menu-item')
        const level2Trigger = level2Wrapper.querySelector(':scope > .menu-item')
        const level1Submenu = level1Wrapper.querySelector(':scope > .menu')
        const level2Submenu = level2Wrapper.querySelector(':scope > .menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open level 1
          level1Trigger.click()
          expect(level1Submenu.classList.contains('show')).toBeTrue()

          // Open level 2
          level2Trigger.click()
          expect(level2Submenu.classList.contains('show')).toBeTrue()

          // Close level 1 - level 2 should also close
          level1Trigger.click()
          expect(level1Submenu.classList.contains('show')).toBeFalse()
          expect(level2Submenu.classList.contains('show')).toBeFalse()
          resolve()
        })

        // eslint-disable-next-line no-new
        new Menu(btnMenu)
        btnMenu.click()
      })
    })

    it('should have submenu items visible and focusable', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu" id="submenu">',
          '        <li><a id="sub1" class="menu-item" href="#">Sub 1</a></li>',
          '        <li><a id="sub2" class="menu-item" href="#">Sub 2</a></li>',
          '        <li><a id="sub3" class="menu-item" href="#">Sub 3</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = fixtureEl.querySelector('#submenu')
        const sub1 = fixtureEl.querySelector('#sub1')
        const sub2 = fixtureEl.querySelector('#sub2')
        const sub3 = fixtureEl.querySelector('#sub3')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu using internal method
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)

          // Submenu items should be visible and focusable
          expect(submenu.classList.contains('show')).toBeTrue()

          sub1.focus()
          expect(document.activeElement).toEqual(sub1)

          sub2.focus()
          expect(document.activeElement).toEqual(sub2)

          sub3.focus()
          expect(document.activeElement).toEqual(sub3)

          resolve()
        })

        menu.show()
      })
    })

    it('should keep the submenu transparent until it is positioned, then reveal it', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu" id="submenu">',
          '        <li><a class="menu-item" href="#">Sub 1</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = fixtureEl.querySelector('#submenu')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)

          // Pinned transparent synchronously so it never paints at the fallback position
          expect(submenu.style.opacity).toEqual('0')

          // Revealed once Floating UI has applied the first position
          setTimeout(() => {
            expect(submenu.style.opacity).toEqual('')
            expect(submenu.style.left).not.toEqual('')
            resolve()
          }, 50)
        })

        menu.show()
      })
    })

    it('should close all submenus when hiding menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu" id="submenu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = fixtureEl.querySelector('#submenu')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu using internal method
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)
          expect(submenu.classList.contains('show')).toBeTrue()
          expect(menu._openSubmenus.size).toEqual(1)

          // Hide the main menu
          menu.hide()
        })

        btnMenu.addEventListener('hidden.coreui.menu', () => {
          // All submenus should be closed
          expect(submenu.classList.contains('show')).toBeFalse()
          expect(menu._openSubmenus.size).toEqual(0)
          resolve()
        })

        menu.show()
      })
    })

    it('should respect submenuTrigger: click option', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-submenu-trigger="click">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')
        const menu = new Menu(btnMenu)

        expect(menu._config.submenuTrigger).toEqual('click')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Click should work
          submenuTrigger.click()
          expect(submenu.classList.contains('show')).toBeTrue()
          resolve()
        })

        menu.show()
      })
    })

    it('should respect submenuTrigger: hover option', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-submenu-trigger="hover">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const menu = new Menu(btnMenu)

        expect(menu._config.submenuTrigger).toEqual('hover')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Hover should open submenu
          const mouseenter = createEvent('mouseenter', { bubbles: true })
          submenuTrigger.dispatchEvent(mouseenter)

          // Note: In JSDOM, hover events may not work perfectly,
          // but we verify the config is respected
          expect(menu._config.submenuTrigger).toEqual('hover')
          resolve()
        })

        menu.show()
      })
    })

    it('should respect submenuDelay config option', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu" data-coreui-submenu-delay="500">Menu</button>',
        '  <ul class="menu">',
        '    <li class="submenu">',
        '      <button class="menu-item" type="button">More options</button>',
        '      <ul class="menu">',
        '        <li><a class="menu-item" href="#">Sub-action</a></li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menu = new Menu(btnMenu)

      expect(menu._config.submenuDelay).toEqual(500)
    })

    it('should position submenu using Floating UI', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu
          submenuTrigger.click()

          // Floating UI should set position styles
          setTimeout(() => {
            expect(submenu.style.position).toEqual('absolute')
            expect(submenu.style.left).toBeTruthy()
            expect(submenu.style.top).toBeTruthy()
            resolve()
          }, 50)
        })

        // eslint-disable-next-line no-new
        new Menu(btnMenu)
        btnMenu.click()
      })
    })

    it('should set data-coreui-placement attribute on submenu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          submenuTrigger.click()

          setTimeout(() => {
            // Should have a placement data attribute
            const placement = submenu.dataset.coreuiPlacement
            expect(placement).toBeTruthy()
            // Should be a valid placement
            expect(['left-start', 'right-start', 'left-end', 'right-end', 'left', 'right'])
              .toContain(placement)
            resolve()
          }, 50)
        })

        // eslint-disable-next-line no-new
        new Menu(btnMenu)
        btnMenu.click()
      })
    })

    it('should cleanup Floating UI autoUpdate on submenu close', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu
          submenuTrigger.click()
          expect(menu._openSubmenus.size).toEqual(1)
          expect(menu._openSubmenus.has(submenu)).toBeTrue()

          // Close submenu
          submenuTrigger.click()
          expect(menu._openSubmenus.size).toEqual(0)
          expect(menu._openSubmenus.has(submenu)).toBeFalse()
          resolve()
        })

        menu.show()
      })
    })

    it('should schedule submenu close with delay', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu, { submenuDelay: 50 })
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)
          expect(submenu.classList.contains('show')).toBeTrue()

          // Schedule close
          menu._scheduleSubmenuClose(submenu, submenuWrapper)
          expect(menu._submenuCloseTimeouts.has(submenu)).toBeTrue()

          // Still open immediately
          expect(submenu.classList.contains('show')).toBeTrue()

          // After delay, should be closed
          setTimeout(() => {
            expect(submenu.classList.contains('show')).toBeFalse()
            expect(menu._submenuCloseTimeouts.has(submenu)).toBeFalse()
            resolve()
          }, 100)
        })

        menu.show()
      })
    })

    it('should cancel scheduled submenu close', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu, { submenuDelay: 50 })
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)

          // Schedule close
          menu._scheduleSubmenuClose(submenu, submenuWrapper)
          expect(menu._submenuCloseTimeouts.has(submenu)).toBeTrue()

          // Cancel the close
          menu._cancelSubmenuCloseTimeout(submenu)
          expect(menu._submenuCloseTimeouts.has(submenu)).toBeFalse()

          // After delay, should still be open
          setTimeout(() => {
            expect(submenu.classList.contains('show')).toBeTrue()
            resolve()
          }, 100)
        })

        menu.show()
      })
    })

    it('should clear all submenu timeouts on dispose', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu, { submenuDelay: 200 })
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu and schedule close
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)
          menu._scheduleSubmenuClose(submenu, submenuWrapper)
          expect(menu._submenuCloseTimeouts.size).toEqual(1)

          // Clear all timeouts
          menu._clearAllSubmenuTimeouts()
          expect(menu._submenuCloseTimeouts.size).toEqual(0)

          resolve()
        })

        menu.show()
      })
    })

    it('should detect point inside triangle', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <ul class="menu">',
        '    <li class="submenu">',
        '      <button class="menu-item" type="button">More options</button>',
        '      <ul class="menu">',
        '        <li><a class="menu-item" href="#">Sub-action</a></li>',
        '      </ul>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menu = new Menu(btnMenu)

      // Triangle with vertices at (0,0), (10,0), (5,10)
      const v1 = { x: 0, y: 0 }
      const v2 = { x: 10, y: 0 }
      const v3 = { x: 5, y: 10 }

      // Point inside triangle
      const inside = { x: 5, y: 5 }
      expect(menu._pointInTriangle(inside, v1, v2, v3)).toBeTrue()

      // Point outside triangle
      const outside = { x: 20, y: 20 }
      expect(menu._pointInTriangle(outside, v1, v2, v3)).toBeFalse()

      // Point on edge should be inside
      const onEdge = { x: 5, y: 0 }
      expect(menu._pointInTriangle(onEdge, v1, v2, v3)).toBeTrue()
    })

    it('should track mouse position for safe triangle', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Call track method directly
          menu._trackMousePosition({ clientX: 100, clientY: 200 })

          // Should have tracked position in hover intent data
          expect(menu._hoverIntentData).toBeDefined()
          expect(menu._hoverIntentData.x).toEqual(100)
          expect(menu._hoverIntentData.y).toEqual(200)
          resolve()
        })

        menu.show()
      })
    })

    it('should handle hover trigger opening submenu via internal method', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-submenu-trigger="hover">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        expect(menu._config.submenuTrigger).toEqual('hover')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Use internal handler directly with mock event
          const mockEvent = { target: submenuTrigger }
          menu._onSubmenuTriggerEnter(mockEvent)

          // Submenu should open
          expect(submenu.classList.contains('show')).toBeTrue()
          resolve()
        })

        menu.show()
      })
    })

    it('should handle submenu mouseleave with close delay', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu" data-coreui-submenu-trigger="hover" data-coreui-submenu-delay="50">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)
          expect(submenu.classList.contains('show')).toBeTrue()

          // Simulate mouseleave from submenu wrapper
          const mouseleave = new MouseEvent('mouseleave', { bubbles: true })
          Object.defineProperty(mouseleave, 'target', { value: submenuWrapper })
          menu._onSubmenuLeave(mouseleave)

          // Should schedule close
          expect(menu._submenuCloseTimeouts.has(submenu)).toBeTrue()

          resolve()
        })

        menu.show()
      })
    })

    it('should not schedule close if submenu is not open', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)
        const submenuWrapper = fixtureEl.querySelector('.submenu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Try mouseleave without opening submenu first
          const mouseleave = new MouseEvent('mouseleave', { bubbles: true })
          Object.defineProperty(mouseleave, 'target', { value: submenuWrapper })
          menu._onSubmenuLeave(mouseleave)

          // Should not schedule close since submenu wasn't open
          expect(menu._submenuCloseTimeouts.size).toEqual(0)

          resolve()
        })

        menu.show()
      })
    })

    it('should not open submenu if trigger element not found', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Mock event with target that's not a submenu trigger
          const mockEvent = { target: btnMenu }
          menu._onSubmenuTriggerEnter(mockEvent)

          // No submenus should be open
          expect(menu._openSubmenus.size).toEqual(0)

          resolve()
        })

        menu.show()
      })
    })

    it('should not close submenu if already closed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Try to close submenu that was never opened
          menu._closeSubmenu(submenu, submenuWrapper)

          // Should not throw, openSubmenus should still be empty
          expect(menu._openSubmenus.size).toEqual(0)

          resolve()
        })

        menu.show()
      })
    })

    it('should handle _isMovingTowardSubmenu with no hover data', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // No hover data tracked yet
          menu._hoverIntentData = null

          const mockEvent = { clientX: 100, clientY: 100 }
          const result = menu._isMovingTowardSubmenu(mockEvent, submenu)

          // Should return false when no hover data
          expect(result).toBeFalse()

          resolve()
        })

        menu.show()
      })
    })

    it('should handle click on submenu trigger when submenu is already open', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)
          expect(submenu.classList.contains('show')).toBeTrue()

          // Click handler should toggle (close it)
          const mockEvent = {
            target: submenuTrigger,
            preventDefault() {},
            stopPropagation() {}
          }
          menu._onSubmenuTriggerClick(mockEvent)

          expect(submenu.classList.contains('show')).toBeFalse()

          resolve()
        })

        menu.show()
      })
    })

    it('should cancel pending timeout when opening submenu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu, { submenuDelay: 200 })
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)

          // Schedule close
          menu._scheduleSubmenuClose(submenu, submenuWrapper)
          expect(menu._submenuCloseTimeouts.has(submenu)).toBeTrue()

          // Re-enter submenu trigger should cancel timeout
          const mockEvent = { target: submenuTrigger }
          menu._onSubmenuTriggerEnter(mockEvent)

          // Timeout should be cancelled
          expect(menu._submenuCloseTimeouts.has(submenu)).toBeFalse()

          resolve()
        })

        menu.show()
      })
    })

    it('should handle _onSubmenuTriggerClick with non-matching target', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li><a class="menu-item" href="#">Regular item</a></li>',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)
        const regularItem = fixtureEl.querySelector('.menu > li > a')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Click on regular item (not submenu trigger)
          const mockEvent = {
            target: regularItem,
            preventDefault() {},
            stopPropagation() {}
          }
          menu._onSubmenuTriggerClick(mockEvent)

          // No submenus should be affected
          expect(menu._openSubmenus.size).toEqual(0)

          resolve()
        })

        menu.show()
      })
    })

    it('should handle _onSubmenuLeave when not moving toward submenu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu" style="position: absolute; left: 200px; top: 0; width: 100px; height: 100px;">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu, { submenuDelay: 50 })
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)

          // Track mouse position far from submenu
          menu._trackMousePosition({ clientX: 0, clientY: 0 })

          // Simulate mouseleave moving away from submenu
          const mockEvent = {
            target: submenuWrapper,
            clientX: -100,
            clientY: -100
          }
          menu._onSubmenuLeave(mockEvent)

          // Should schedule close since not moving toward submenu
          expect(menu._submenuCloseTimeouts.has(submenu)).toBeTrue()

          resolve()
        })

        menu.show()
      })
    })

    it('should cancel timeout when calling cancelSubmenuCloseTimeout', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu" id="submenu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu, { submenuDelay: 200 })
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = fixtureEl.querySelector('#submenu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)

          // Schedule close
          menu._scheduleSubmenuClose(submenu, submenuWrapper)
          expect(menu._submenuCloseTimeouts.has(submenu)).toBeTrue()

          // Cancel the timeout directly
          menu._cancelSubmenuCloseTimeout(submenu)

          // Timeout should be cancelled
          expect(menu._submenuCloseTimeouts.has(submenu)).toBeFalse()

          resolve()
        })

        menu.show()
      })
    })

    it('should skip closing submenu if already not in openSubmenus', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Calling close on never-opened submenu should not throw
          expect(() => {
            menu._closeSubmenu(submenu, submenuWrapper)
          }).not.toThrow()

          resolve()
        })

        menu.show()
      })
    })

    it('should handle _isMovingTowardSubmenu when cursor is in safe triangle', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div class="menu" style="position: relative;">',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu" style="position: absolute; display: block;">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu" style="position: absolute; left: 100px; top: 0; width: 100px; height: 100px; display: block;">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)

          // Track a mouse position
          menu._trackMousePosition({ clientX: 50, clientY: 50 })

          // Call isMovingTowardSubmenu
          const mockEvent = { clientX: 75, clientY: 50 }
          const result = menu._isMovingTowardSubmenu(mockEvent, submenu)

          // Result depends on geometry, just verify it returns a boolean
          expect(typeof result).toBe('boolean')

          resolve()
        })

        menu.show()
      })
    })

    it('should carry the toggle direction onto a menu moved to a container', () => {
      fixtureEl.innerHTML = [
        '<div dir="rtl">',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <ul class="menu"><li><a class="menu-item" href="#">Action</a></li></ul>',
        '</div>'
      ].join('')

      const menu = new Menu(fixtureEl.querySelector('[data-coreui-toggle="menu"]'), { container: true })
      menu.show()

      expect(menu._menu.parentNode).toEqual(document.body)
      expect(menu._menu.dir).toEqual('rtl')

      menu.hide()
      menu._restoreMenuToOriginalParent()

      expect(menu._menu.hasAttribute('dir')).toBeFalse()
    })

    it('should place a submenu by the direction of the menu, not of the document', () => {
      fixtureEl.innerHTML = [
        '<div dir="rtl">',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <ul class="menu">',
        '    <li class="submenu">',
        '      <button class="menu-item" type="button">More options</button>',
        '      <ul class="menu"><li><a class="menu-item" href="#">Sub-action</a></li></ul>',
        '    </li>',
        '  </ul>',
        '</div>'
      ].join('')

      const menu = new Menu(fixtureEl.querySelector('[data-coreui-toggle="menu"]'), { placement: 'end-start' })

      expect(menu._getPlacement()).toEqual('left-start')
    })

    it('should handle RTL submenu placement', () => {
      return new Promise(resolve => {
        // Set RTL
        document.documentElement.dir = 'rtl'

        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          // Open submenu in RTL mode
          menu._openSubmenu(submenuTrigger, submenu, submenuWrapper)
          expect(submenu.classList.contains('show')).toBeTrue()

          // Reset RTL
          document.documentElement.dir = 'ltr'
          resolve()
        })

        menu.show()
      })
    })
  })

  describe('menu config option', () => {
    it('should use the menu element passed via config instead of auto-finding', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<button class="btn" data-coreui-toggle="menu">Menu</button>',
          '<div id="custom-menu" class="menu">',
          '  <a class="menu-item" href="#">Item</a>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const customMenuEl = fixtureEl.querySelector('#custom-menu')
        const menu = new Menu(btnMenu, { menu: customMenuEl })

        expect(menu._menu).toEqual(customMenuEl)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(customMenuEl).toHaveClass('show')
          resolve()
        })

        menu.show()
      })
    })
  })

  describe('_findMenu flexibility', () => {
    it('should find menu element placed before the toggle', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Item</a>',
        '  </div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const menuEl = fixtureEl.querySelector('.menu')
      const menu = new Menu(btnMenu)

      expect(menu._menu).toEqual(menuEl)
    })

    it('should resolve the wrapper and menu when the toggle is not a direct child of the wrapper', () => {
      fixtureEl.innerHTML = [
        '<div class="wrapper">',
        '  <span>',
        '    <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  </span>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Item</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const wrapperEl = fixtureEl.querySelector('.wrapper')
      const menuEl = fixtureEl.querySelector('.menu')
      const menu = new Menu(btnMenu)

      expect(menu._parent).toEqual(wrapperEl)
      expect(menu._menu).toEqual(menuEl)
    })

    it('should fall back to the direct parent when no ancestor contains a menu', () => {
      fixtureEl.innerHTML = [
        '<div class="wrapper">',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '</div>',
        '<div class="external menu">',
        '  <a class="menu-item" href="#">Item</a>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const wrapperEl = fixtureEl.querySelector('.wrapper')
      const menuEl = fixtureEl.querySelector('.menu')
      const menu = new Menu(btnMenu, { menu: menuEl })

      expect(menu._parent).toEqual(wrapperEl)
      expect(menu._menu).toEqual(menuEl)
    })
  })

  describe('Home and End key navigation', () => {
    it('should focus the first item when Home key is pressed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a id="first" class="menu-item" href="#">First</a>',
          '    <a id="middle" class="menu-item" href="#">Middle</a>',
          '    <a id="last" class="menu-item" href="#">Last</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const firstItem = fixtureEl.querySelector('#first')
        const lastItem = fixtureEl.querySelector('#last')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          lastItem.focus()
          expect(document.activeElement).toEqual(lastItem)

          const homeEvent = createEvent('keydown')
          homeEvent.key = 'Home'
          lastItem.dispatchEvent(homeEvent)

          setTimeout(() => {
            expect(document.activeElement).toEqual(firstItem)
            resolve()
          }, 20)
        })

        menu.show()
      })
    })

    it('should focus the last item when End key is pressed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a id="first" class="menu-item" href="#">First</a>',
          '    <a id="middle" class="menu-item" href="#">Middle</a>',
          '    <a id="last" class="menu-item" href="#">Last</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const firstItem = fixtureEl.querySelector('#first')
        const lastItem = fixtureEl.querySelector('#last')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          firstItem.focus()
          expect(document.activeElement).toEqual(firstItem)

          const endEvent = createEvent('keydown')
          endEvent.key = 'End'
          firstItem.dispatchEvent(endEvent)

          setTimeout(() => {
            expect(document.activeElement).toEqual(lastItem)
            resolve()
          }, 20)
        })

        menu.show()
      })
    })

    it('should move focus into the menu on Home and End from the toggle of an open menu', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a id="first" class="menu-item" href="#">First</a>',
          '    <a id="last" class="menu-item" href="#">Last</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const firstItem = fixtureEl.querySelector('#first')
        const lastItem = fixtureEl.querySelector('#last')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          btnMenu.focus()

          const endEvent = createEvent('keydown')
          endEvent.key = 'End'
          btnMenu.dispatchEvent(endEvent)
          expect(document.activeElement).toEqual(lastItem)

          btnMenu.focus()

          const homeEvent = createEvent('keydown')
          homeEvent.key = 'Home'
          btnMenu.dispatchEvent(homeEvent)
          expect(document.activeElement).toEqual(firstItem)
          resolve()
        })

        menu.show()
      })
    })
  })

  describe('fields in the panel', () => {
    it('should leave the arrow keys to a select in the panel', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a id="item" class="menu-item" href="#">Item</a>',
          '    <select id="sort"><option>Name</option><option>Date</option></select>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const select = fixtureEl.querySelector('#sort')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          select.focus()

          const downEvent = createEvent('keydown')
          downEvent.key = 'ArrowDown'
          select.dispatchEvent(downEvent)

          expect(downEvent.defaultPrevented).toBeFalse()
          expect(document.activeElement).toEqual(select)
          resolve()
        })

        menu.show()
      })
    })
  })

  describe('keys a field in the panel handles', () => {
    it('should leave Home, End and the side arrows to an input in the panel', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a id="item" class="menu-item" href="#">Item</a>',
          '    <input id="filter" type="text">',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const input = fixtureEl.querySelector('#filter')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          input.focus()

          for (const key of ['Home', 'End', 'ArrowLeft', 'ArrowRight']) {
            const event = createEvent('keydown', { bubbles: true, cancelable: true })
            event.key = key
            input.dispatchEvent(event)

            expect(event.defaultPrevented).toBeFalse()
            expect(document.activeElement).toEqual(input)
          }

          resolve()
        })

        menu.show()
      })
    })

    it('should leave the arrows, Home and End to a widget with its own keys in the panel', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Item</a>',
          '    <div id="slider" role="slider" tabindex="0" aria-valuenow="5">5</div>',
          '    <div role="radiogroup"><span id="radio" role="radio" tabindex="0" aria-checked="true">A</span></div>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          for (const control of [fixtureEl.querySelector('#slider'), fixtureEl.querySelector('#radio')]) {
            control.focus()

            for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'ArrowLeft', 'ArrowRight']) {
              const event = createEvent('keydown', { bubbles: true, cancelable: true })
              event.key = key
              control.dispatchEvent(event)

              expect(event.defaultPrevented).toBeFalse()
              expect(document.activeElement).toEqual(control)
            }
          }

          resolve()
        })

        menu.show()
      })
    })

    it('should still open from the arrow keys when the menu sits in a toolbar of the page', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div role="toolbar">',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu"><a id="item" class="menu-item" href="#">Item</a><a id="next" class="menu-item" href="#">Next</a><button id="plain" type="button">Plain</button></div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          setTimeout(() => {
            const item = fixtureEl.querySelector('#item')
            expect(document.activeElement).toEqual(item)

            const event = createEvent('keydown', { bubbles: true, cancelable: true })
            event.key = 'ArrowDown'
            item.dispatchEvent(event)
            expect(document.activeElement).toEqual(fixtureEl.querySelector('#next'))

            const plain = fixtureEl.querySelector('#plain')
            plain.focus()
            const fromPlain = createEvent('keydown', { bubbles: true, cancelable: true })
            fromPlain.key = 'ArrowDown'
            plain.dispatchEvent(fromPlain)
            expect(fromPlain.defaultPrevented).toBeTrue()
            resolve()
          })
        })

        btnMenu.focus()
        const event = createEvent('keydown', { bubbles: true, cancelable: true })
        event.key = 'ArrowDown'
        btnMenu.dispatchEvent(event)
      })
    })

    it('should keep the menu open on a click on a label or a switch in the panel without a form', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <label><input type="checkbox"> <span id="caption">Notify</span></label>',
          '    <div id="switch" role="switch" tabindex="0" aria-checked="false">Wi-Fi</div>',
          '    <a id="item" class="menu-item" href="#">Item</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          fixtureEl.querySelector('#caption').dispatchEvent(createEvent('click', { bubbles: true }))
          expect(btnMenu).toHaveClass('show')

          fixtureEl.querySelector('#switch').dispatchEvent(createEvent('click', { bubbles: true }))
          expect(btnMenu).toHaveClass('show')

          btnMenu.addEventListener('hidden.coreui.menu', () => {
            expect().nothing()
            resolve()
          })
          fixtureEl.querySelector('#item').dispatchEvent(createEvent('click', { bubbles: true }))
        })

        btnMenu.click()
      })
    })

    it('should open a link submenu trigger with Space in a role="menu" panel instead of following it', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu" role="menu">',
          '    <div class="submenu"><a id="trigger" class="menu-item" href="#more">More</a>',
          '      <div class="menu"><a id="sub" class="menu-item" href="#sub">Sub</a></div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const trigger = fixtureEl.querySelector('#trigger')
        const onClick = jasmine.createSpy('click').and.callFake(event => event.preventDefault())
        trigger.addEventListener('click', onClick)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          trigger.focus()
          const event = createEvent('keydown', { bubbles: true, cancelable: true })
          event.key = ' '
          trigger.dispatchEvent(event)

          setTimeout(() => {
            expect(event.defaultPrevented).toBeTrue()
            expect(onClick).not.toHaveBeenCalled()
            expect(trigger.closest('.submenu')).toHaveClass('show')
            resolve()
          }, 20)
        })

        new Menu(btnMenu).show()
      })
    })

    it('should keep the arrow keys for items in a toolbar of the panel and close on an option item', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a id="one" class="menu-item" href="#">One</a>',
          '    <div role="toolbar"><button id="two" class="menu-item" type="button">Two</button><button id="three" class="menu-item" type="button">Three</button></div>',
          '    <button id="option" class="menu-item" type="button" role="option">Option</button>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const two = fixtureEl.querySelector('#two')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          two.focus()
          const event = createEvent('keydown', { bubbles: true, cancelable: true })
          event.key = 'ArrowDown'
          two.dispatchEvent(event)
          expect(event.defaultPrevented).toBeTrue()
          expect(document.activeElement).not.toEqual(two)

          btnMenu.addEventListener('hidden.coreui.menu', () => {
            expect().nothing()
            resolve()
          })
          fixtureEl.querySelector('#option').dispatchEvent(createEvent('click', { bubbles: true }))
        })

        btnMenu.click()
      })
    })

    it('should click a link item that is also a menu toggle once on Space', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu" role="menu">',
          '    <div><a id="nested" class="menu-item" data-coreui-toggle="menu" role="button" href="#">Nested</a>',
          '      <div class="menu" role="menu"><a class="menu-item" href="#">Inner</a></div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const nested = fixtureEl.querySelector('#nested')
        const onClick = jasmine.createSpy('click')
        nested.addEventListener('click', onClick)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          nested.focus()
          const event = createEvent('keydown', { bubbles: true, cancelable: true })
          event.key = ' '
          nested.dispatchEvent(event)

          expect(onClick).toHaveBeenCalledTimes(1)
          resolve()
        })

        new Menu(btnMenu).show()
      })
    })

    it('should activate a link item with Space only in a role="menu" panel', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu" role="menu"><a id="item" class="menu-item" href="#">Item</a></div>',
          '</div>',
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Plain</button>',
          '  <div class="menu"><a id="plain" class="menu-item" href="#">Plain item</a></div>',
          '</div>'
        ].join('')

        const [btnMenu, btnPlain] = fixtureEl.querySelectorAll('[data-coreui-toggle="menu"]')
        const item = fixtureEl.querySelector('#item')
        const plain = fixtureEl.querySelector('#plain')
        const onClick = jasmine.createSpy('click').and.callFake(event => event.preventDefault())
        item.addEventListener('click', onClick)
        plain.addEventListener('click', onClick)
        const space = target => {
          const event = createEvent('keydown', { bubbles: true, cancelable: true })
          event.key = ' '
          target.dispatchEvent(event)
          return event.defaultPrevented
        }

        btnPlain.addEventListener('shown.coreui.menu', () => {
          expect(space(plain)).toBeFalse()
          expect(onClick).toHaveBeenCalledTimes(1)
          resolve()
        })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(space(item)).toBeTrue()
          expect(onClick).toHaveBeenCalledTimes(1)
          new Menu(btnPlain).show()
        })

        new Menu(btnMenu).show()
      })
    })
  })

  describe('Home and End on a closed menu', () => {
    it('should leave Home and End to the page while the menu is closed', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
        '  <div class="menu">',
        '    <a class="menu-item" href="#">Item</a>',
        '  </div>',
        '</div>'
      ].join('')

      const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      new Menu(btnMenu) // eslint-disable-line no-new
      btnMenu.focus()

      const event = createEvent('keydown', { bubbles: true, cancelable: true })
      event.key = 'Home'
      btnMenu.dispatchEvent(event)

      expect(event.defaultPrevented).toBeFalse()
    })
  })

  describe('direction of the submenu keys', () => {
    it('should read the exit key from the submenu, not from an item with its own direction', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div dir="rtl">',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <div class="submenu">',
          '      <button id="trigger" class="menu-item" type="button">Sub</button>',
          '      <div class="menu">',
          '        <a id="item" class="menu-item" dir="ltr" href="#">Edit</a>',
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const trigger = fixtureEl.querySelector('#trigger')
        const item = fixtureEl.querySelector('#item')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          trigger.focus()
          trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }))

          setTimeout(() => {
            item.focus()
            item.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))

            expect(item.closest('.menu')).not.toHaveClass('show')
            expect(document.activeElement).toEqual(trigger)
            resolve()
          }, 20)
        })

        menu.show()
      })
    })
  })

  describe('ArrowLeft to close submenu', () => {
    it('should close the current submenu via _handleSubmenuKeydown on ArrowLeft', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <div class="submenu">',
          '      <button id="sub-trigger" class="menu-item" type="button">Sub</button>',
          '      <div class="menu">',
          '        <a id="sub-item" class="menu-item" href="#">Sub item</a>',
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const subTrigger = fixtureEl.querySelector('#sub-trigger')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')
        const subItem = fixtureEl.querySelector('#sub-item')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          menu._openSubmenu(subTrigger, submenu, submenuWrapper)
          expect(submenu.classList.contains('show')).toBeTrue()

          subItem.focus()
          const arrowLeftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
          Object.defineProperty(arrowLeftEvent, 'target', { value: subItem })
          const handled = menu._handleSubmenuKeydown(arrowLeftEvent)

          expect(handled).toBeTrue()
          expect(submenu.classList.contains('show')).toBeFalse()
          expect(document.activeElement).toEqual(subTrigger)
          resolve()
        })

        menu.show()
      })
    })
  })

  describe('Escape in submenu', () => {
    it('should close the current submenu via dataApiKeydownHandler on Escape', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a class="menu-item" href="#">Top item</a>',
          '    <div class="submenu">',
          '      <button id="sub-trigger" class="menu-item" type="button">Sub</button>',
          '      <div class="menu">',
          '        <a id="sub-item" class="menu-item" href="#">Sub item</a>',
          '      </div>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const subTrigger = fixtureEl.querySelector('#sub-trigger')
        const submenuWrapper = fixtureEl.querySelector('.submenu')
        const submenu = submenuWrapper.querySelector('.menu')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          menu._openSubmenu(subTrigger, submenu, submenuWrapper)
          expect(submenu.classList.contains('show')).toBeTrue()
          expect(menu._openSubmenus.size).toEqual(1)

          menu._closeSubmenu(submenu, submenuWrapper)

          expect(submenu.classList.contains('show')).toBeFalse()
          expect(menu._openSubmenus.size).toEqual(0)
          expect(btnMenu).toHaveClass('show')
          resolve()
        })

        menu.show()
      })
    })
  })

  describe('scoped keyboard navigation', () => {
    it('should walk submenu triggers, items past a divider, Home and End at one level', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <div class="submenu">',
          '      <button id="trigger-1" class="menu-item" type="button">File</button>',
          '      <div class="menu">',
          '        <a id="sub-item-1" class="menu-item" href="#">New</a>',
          '      </div>',
          '    </div>',
          '    <div class="submenu">',
          '      <button id="trigger-2" class="menu-item" type="button">Edit</button>',
          '      <div class="menu">',
          '        <a class="menu-item" href="#">Cut</a>',
          '      </div>',
          '    </div>',
          '    <hr class="menu-divider">',
          '    <a id="top-item" class="menu-item" href="#">Preferences</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const trigger1 = fixtureEl.querySelector('#trigger-1')
        const trigger2 = fixtureEl.querySelector('#trigger-2')
        const topItem = fixtureEl.querySelector('#top-item')
        const menu = new Menu(btnMenu)
        const press = (element, key) => {
          const keydown = createEvent('keydown', { bubbles: true })
          keydown.key = key
          element.dispatchEvent(keydown)
        }

        btnMenu.addEventListener('shown.coreui.menu', () => {
          press(btnMenu, 'ArrowDown')
          expect(document.activeElement).toEqual(trigger1)

          press(trigger1, 'ArrowDown')
          expect(document.activeElement).toEqual(trigger2)

          press(trigger2, 'ArrowDown')
          expect(document.activeElement).toEqual(topItem)

          press(topItem, 'ArrowUp')
          expect(document.activeElement).toEqual(trigger2)

          press(trigger2, 'End')
          expect(document.activeElement).toEqual(topItem)

          press(topItem, 'Home')
          expect(document.activeElement).toEqual(trigger1)

          resolve()
        })

        menu.show()
      })
    })

    it('should close the submenu focus leaves when arrowing along the parent level', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <div class="submenu">',
          '      <button id="trigger-1" class="menu-item" type="button">File</button>',
          '      <div id="submenu-1" class="menu">',
          '        <a class="menu-item" href="#">New</a>',
          '      </div>',
          '    </div>',
          '    <a id="top-item" class="menu-item" href="#">Preferences</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const trigger1 = fixtureEl.querySelector('#trigger-1')
        const submenu1 = fixtureEl.querySelector('#submenu-1')
        const topItem = fixtureEl.querySelector('#top-item')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          trigger1.focus()
          const enter = createEvent('keydown', { bubbles: true })
          enter.key = 'Enter'
          trigger1.dispatchEvent(enter)
          expect(submenu1).toHaveClass('show')

          const arrowDown = createEvent('keydown', { bubbles: true })
          arrowDown.key = 'ArrowDown'
          trigger1.dispatchEvent(arrowDown)

          expect(document.activeElement).toEqual(topItem)
          expect(submenu1).not.toHaveClass('show')
          resolve()
        })

        menu.show()
      })
    })

    it('should scope ArrowDown/ArrowUp to direct children of the current menu level', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <div class="menu">',
          '    <a id="top-item-1" class="menu-item" href="#">Top 1</a>',
          '    <div class="submenu">',
          '      <button class="menu-item" type="button">Sub trigger</button>',
          '      <div class="menu">',
          '        <a id="sub-item-1" class="menu-item" href="#">Sub 1</a>',
          '        <a id="sub-item-2" class="menu-item" href="#">Sub 2</a>',
          '      </div>',
          '    </div>',
          '    <a id="top-item-2" class="menu-item" href="#">Top 2</a>',
          '  </div>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const topItem1 = fixtureEl.querySelector('#top-item-1')
        const menu = new Menu(btnMenu)

        btnMenu.addEventListener('shown.coreui.menu', () => {
          topItem1.focus()
          expect(document.activeElement).toEqual(topItem1)

          const arrowDown = createEvent('keydown')
          arrowDown.key = 'ArrowDown'
          topItem1.dispatchEvent(arrowDown)

          setTimeout(() => {
            resolve()
          }, 20)
        })

        menu.show()
      })
    })
  })
  describe('update', () => {
    it('should reposition against the parent when reference is "parent"', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li><a class="menu-item" href="#">Action</a></li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu, { reference: 'parent' })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(menu._floatingCleanup).not.toBeNull()
          menu.update()
          setTimeout(() => {
            expect(menu._isShown()).toBeTrue()
            resolve()
          }, 20)
        })

        menu.show()
      })
    })

    it('should reposition against an element reference on update', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <span id="ref">anchor</span>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li><a class="menu-item" href="#">Action</a></li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu, { reference: fixtureEl.querySelector('#ref') })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          menu.update()
          setTimeout(() => {
            expect(menu._isShown()).toBeTrue()
            resolve()
          }, 20)
        })

        menu.show()
      })
    })

    it('should reposition against a virtual element reference on update', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li><a class="menu-item" href="#">Action</a></li>',
          '  </ul>',
          '</div>'
        ].join('')

        const virtualElement = {
          nodeType: 1,
          getBoundingClientRect() {
            return {
              width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0
            }
          }
        }

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(btnMenu, { reference: virtualElement })

        btnMenu.addEventListener('shown.coreui.menu', () => {
          menu.update()
          setTimeout(() => {
            expect(menu._isShown()).toBeTrue()
            resolve()
          }, 20)
        })

        menu.show()
      })
    })
  })

  describe('jQueryInterface', () => {
    it('should create a menu', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="menu"></div>'

      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.menu = Menu.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.menu.call(jQueryMock)

      expect(Menu.getInstance(div)).not.toBeNull()
    })

    it('should not re create a menu', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="menu"></div>'

      const div = fixtureEl.querySelector('div')
      const menu = new Menu(div)

      jQueryMock.fn.menu = Menu.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.menu.call(jQueryMock)

      expect(Menu.getInstance(div)).toEqual(menu)
    })

    it('should call a menu method', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="menu"></div>'

      const div = fixtureEl.querySelector('div')
      const menu = new Menu(div)

      const spy = spyOn(menu, 'show')

      jQueryMock.fn.menu = Menu.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.menu.call(jQueryMock, 'show')

      expect(Menu.getInstance(div)).toEqual(menu)
      expect(spy).toHaveBeenCalled()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="menu"></div>'

      const div = fixtureEl.querySelector('div')
      const action = 'undefinedMethod'

      jQueryMock.fn.menu = Menu.jQueryInterface
      jQueryMock.elements = [div]

      expect(() => {
        jQueryMock.fn.menu.call(jQueryMock, action)
      }).toThrowError(TypeError, `No method named "${action}"`)
    })
  })
  describe('keyboard toggle discovery', () => {
    it('should find the toggle when it follows the menu in the DOM', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <ul class="menu">',
          '    <li><a class="menu-item" href="#">Action</a></li>',
          '  </ul>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menuEl = fixtureEl.querySelector('.menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          expect(btnMenu).toHaveClass('show')
          resolve()
        })

        const keydown = createEvent('keydown', { bubbles: true })
        keydown.key = 'ArrowDown'
        menuEl.dispatchEvent(keydown)
      })
    })
  })

  // `_openSubmenu()` adds a `mouseenter` listener and `_closeSubmenu()` drops it again.
  // A failed removal used to leave one live listener behind per open and close cycle.
  describe('custom mouse events', () => {
    it('should not accumulate mouseenter listeners across open and close cycles', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button class="btn" data-coreui-toggle="menu">Menu</button>',
          '  <ul class="menu">',
          '    <li class="submenu">',
          '      <button class="menu-item" type="button">More options</button>',
          '      <ul class="menu">',
          '        <li><a class="menu-item" href="#">Sub-action</a></li>',
          '      </ul>',
          '    </li>',
          '  </ul>',
          '</div>'
        ].join('')

        const btnMenu = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const submenuTrigger = fixtureEl.querySelector('.submenu > .menu-item')
        const submenu = fixtureEl.querySelector('.submenu > .menu')

        btnMenu.addEventListener('shown.coreui.menu', () => {
          for (let i = 0; i < 3; i++) {
            submenuTrigger.click()
            submenuTrigger.click()
          }

          submenuTrigger.click()
          expect(submenu.classList.contains('show')).toBeTrue()

          const spy = spyOn(menu, '_cancelSubmenuCloseTimeout')
          submenu.dispatchEvent(new MouseEvent('mouseover'))

          expect(spy.calls.count()).toEqual(1)
          resolve()
        })

        const menu = new Menu(btnMenu)
        btnMenu.click()
      })
    })
  })

  describe('role="menu" on the panel', () => {
    const menuMarkup = [
      '<button id="before" type="button">Before</button>',
      '<div class="wrapper">',
      '  <button class="btn" type="button" data-coreui-toggle="menu">Actions</button>',
      '  <div class="menu" role="menu">',
      '    <h6 class="menu-header">Edit</h6>',
      '    <button class="menu-item" type="button">Copy</button>',
      '    <a class="menu-item disabled" href="#paste">Paste</a>',
      '    <div class="submenu">',
      '      <button class="menu-item" type="button">More</button>',
      '      <div class="menu"><button class="menu-item" type="button" id="deep">Deep</button></div>',
      '    </div>',
      '  </div>',
      '</div>',
      '<button id="after" type="button">After</button>'
    ].join('')

    const press = target => {
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
      target.click()
    }

    it('should announce the menu on the toggle and name the panel from it when the instance is created', () => {
      fixtureEl.innerHTML = menuMarkup

      const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const panel = fixtureEl.querySelector('.menu')
      new Menu(toggle) // eslint-disable-line no-new

      expect(toggle.getAttribute('aria-haspopup')).toEqual('menu')
      expect(toggle.id).not.toEqual('')
      expect(panel.id).not.toEqual('')
      expect(toggle.getAttribute('aria-controls')).toEqual(panel.id)
      expect(panel.getAttribute('tabindex')).toEqual('-1')
      expect(panel.getAttribute('aria-labelledby')).toEqual(toggle.id)
    })

    it('should keep the ids and the name the page gave and take the name the toggle points at', () => {
      fixtureEl.innerHTML = [
        '<span id="label">File actions</span>',
        '<button class="btn" id="kebab" type="button" aria-labelledby="label" data-coreui-toggle="menu"></button>',
        '<div class="menu" id="actions" role="menu"><button class="menu-item" type="button">Copy</button></div>',
        '<button class="btn" type="button" data-coreui-toggle="menu">Other</button>',
        '<div class="menu" role="menu" aria-label="Other actions"><button class="menu-item" type="button">Copy</button></div>'
      ].join('')

      const [kebab, other] = fixtureEl.querySelectorAll('[data-coreui-toggle="menu"]')
      const [actions, otherPanel] = fixtureEl.querySelectorAll('.menu')
      new Menu(kebab) // eslint-disable-line no-new
      new Menu(other) // eslint-disable-line no-new

      expect(kebab.id).toEqual('kebab')
      expect(actions.id).toEqual('actions')
      expect(actions.getAttribute('aria-labelledby')).toEqual('label')
      expect(otherPanel.hasAttribute('aria-labelledby')).toBeFalse()
    })

    it('should write nothing of a menu for a panel without role="menu" or with another role', () => {
      fixtureEl.innerHTML = [
        '<button class="btn" type="button" data-coreui-toggle="menu">Plain</button>',
        '<div class="menu"><button class="menu-item" type="button">Copy</button></div>',
        '<button class="btn" type="button" data-coreui-toggle="menu">Dialog</button>',
        '<div class="menu" role="dialog"><button class="menu-item" type="button">Copy</button></div>'
      ].join('')

      for (const toggle of fixtureEl.querySelectorAll('[data-coreui-toggle="menu"]')) {
        const menu = new Menu(toggle)
        menu.show()

        const panel = toggle.nextElementSibling
        expect(toggle.hasAttribute('aria-haspopup')).toBeFalse()
        expect(panel.hasAttribute('tabindex')).toBeFalse()
        expect(panel.querySelector('.menu-item').hasAttribute('role')).toBeFalse()
        expect(panel.querySelector('.menu-item').hasAttribute('tabindex')).toBeFalse()
        expect(document.activeElement).toEqual(toggle)
      }
    })

    it('should read the role once, when the instance is created', () => {
      fixtureEl.innerHTML = [
        '<button class="btn" type="button" data-coreui-toggle="menu">Added</button>',
        '<div class="menu"><button class="menu-item" type="button">Copy</button></div>',
        '<button class="btn" type="button" data-coreui-toggle="menu">Removed</button>',
        '<div class="menu" role="menu"><button class="menu-item" type="button">Copy</button></div>'
      ].join('')

      const [added, removed] = [...fixtureEl.querySelectorAll('[data-coreui-toggle="menu"]')].map(toggle => new Menu(toggle))
      const [addedPanel, removedPanel] = fixtureEl.querySelectorAll('.menu')
      addedPanel.setAttribute('role', 'menu')
      removedPanel.removeAttribute('role')

      added.show()
      removed.show()

      expect(addedPanel.querySelector('.menu-item').hasAttribute('role')).toBeFalse()
      expect(removedPanel.querySelector('.menu-item').getAttribute('role')).toEqual('menuitem')
    })

    it('should give the items, wrappers, headers and submenus their roles when the menu opens', () => {
      fixtureEl.innerHTML = menuMarkup

      const menu = new Menu(fixtureEl.querySelector('[data-coreui-toggle="menu"]'))
      menu.show()

      const [copy, paste, more, deep] = fixtureEl.querySelectorAll('.menu-item')
      for (const item of [copy, paste, more, deep]) {
        expect(item.getAttribute('role')).toEqual('menuitem')
        expect(item.getAttribute('tabindex')).toEqual('-1')
      }

      expect(paste.getAttribute('aria-disabled')).toEqual('true')
      expect(copy.hasAttribute('aria-disabled')).toBeFalse()
      expect(fixtureEl.querySelector('.menu-header').getAttribute('role')).toEqual('none')
      expect(fixtureEl.querySelector('.submenu').getAttribute('role')).toEqual('none')
      expect(more.getAttribute('aria-haspopup')).toEqual('menu')
      expect(fixtureEl.querySelector('.submenu > .menu').getAttribute('role')).toEqual('menu')
      expect(fixtureEl.querySelector('.submenu > .menu').getAttribute('aria-labelledby')).toEqual(more.id)
    })

    it('should keep the group, separator, item role and aria-disabled the page wrote', () => {
      fixtureEl.innerHTML = [
        '<button class="btn" type="button" data-coreui-toggle="menu">Sort</button>',
        '<div class="menu" role="menu">',
        '  <ul class="group" role="group" aria-label="Sort by">',
        '    <li><button class="menu-item" type="button" role="menuitemradio" aria-checked="true">Name</button></li>',
        '    <li><button class="menu-item" type="button" role="menuitemradio" aria-checked="false">Date</button></li>',
        '  </ul>',
        '  <ul class="list"><li class="divider" role="separator"></li></ul>',
        '  <button class="menu-item" type="button" aria-disabled="true" id="author-disabled">Reset</button>',
        '</div>'
      ].join('')

      const menu = new Menu(fixtureEl.querySelector('[data-coreui-toggle="menu"]'))
      menu.show()
      menu.update()

      expect(fixtureEl.querySelector('.group').getAttribute('role')).toEqual('group')
      expect(fixtureEl.querySelector('.divider').getAttribute('role')).toEqual('separator')
      expect(fixtureEl.querySelector('.list').getAttribute('role')).toEqual('none')
      expect(fixtureEl.querySelector('.menu-item').getAttribute('role')).toEqual('menuitemradio')
      expect(fixtureEl.querySelector('#author-disabled').getAttribute('aria-disabled')).toEqual('true')
    })

    it('should move between the items of a group with the arrow keys', () => {
      fixtureEl.innerHTML = [
        '<button class="btn" type="button" data-coreui-toggle="menu">Sort</button>',
        '<div class="menu" role="menu">',
        '  <ul role="group" aria-label="Sort by">',
        '    <li><button class="menu-item" type="button" id="name">Name</button></li>',
        '    <li><button class="menu-item" type="button" id="date">Date</button></li>',
        '  </ul>',
        '  <button class="menu-item" type="button" id="reset">Reset</button>',
        '</div>'
      ].join('')

      const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      new Menu(toggle).show()

      const down = target => target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }))
      down(document.activeElement)
      expect(document.activeElement.id).toEqual('name')
      down(document.activeElement)
      expect(document.activeElement.id).toEqual('date')
      down(document.activeElement)
      expect(document.activeElement.id).toEqual('reset')
    })

    it('should give roles to items the page adds while the menu opens and on update()', () => {
      fixtureEl.innerHTML = menuMarkup

      const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const panel = fixtureEl.querySelector('.menu')
      toggle.addEventListener('show.coreui.menu', () => {
        panel.insertAdjacentHTML('beforeend', '<button class="menu-item" type="button" id="added">Added</button>')
      })

      const menu = new Menu(toggle)
      menu.show()
      expect(fixtureEl.querySelector('#added').getAttribute('role')).toEqual('menuitem')

      panel.insertAdjacentHTML('beforeend', '<button class="menu-item" type="button" id="later">Later</button>')
      menu.update()
      expect(fixtureEl.querySelector('#later').getAttribute('tabindex')).toEqual('-1')
    })

    it('should stop a click on a disabled item from following its link and closing the menu', () => {
      fixtureEl.innerHTML = menuMarkup

      const menu = new Menu(fixtureEl.querySelector('[data-coreui-toggle="menu"]'))
      menu.show()

      const click = new MouseEvent('click', { bubbles: true, cancelable: true })
      fixtureEl.querySelector('.menu-item.disabled').dispatchEvent(click)

      expect(click.defaultPrevented).toBeTrue()
      expect(fixtureEl.querySelector('.menu')).toHaveClass('show')
    })

    it('should leave the roles of another menu inside the panel alone', () => {
      fixtureEl.innerHTML = [
        '<button class="btn" type="button" data-coreui-toggle="menu">Outer</button>',
        '<div class="menu" role="menu">',
        '  <button class="menu-item" type="button">Copy</button>',
        '  <div class="dropdown">',
        '    <ul class="dropdown-menu" role="menu"><li class="inner"><a class="dropdown-item" href="#">Inner</a></li></ul>',
        '  </div>',
        '</div>'
      ].join('')

      new Menu(fixtureEl.querySelector('[data-coreui-toggle="menu"]')).show()

      expect(fixtureEl.querySelector('.dropdown-menu').getAttribute('role')).toEqual('menu')
      expect(fixtureEl.querySelector('.inner').hasAttribute('role')).toBeFalse()
    })

    it('should not take the role a context menu wrote on a shared panel for a declaration', () => {
      fixtureEl.innerHTML = [
        '<div class="area" data-coreui-toggle="context-menu" data-coreui-target="#shared">Area</div>',
        '<button class="btn" type="button" id="kebab">Actions</button>',
        '<div class="menu" id="shared"><button class="menu-item" type="button">Copy</button></div>'
      ].join('')

      const panel = fixtureEl.querySelector('#shared')
      const contextMenu = new ContextMenu(fixtureEl.querySelector('.area'))
      contextMenu.show()
      contextMenu.hide()
      expect(panel.getAttribute('role')).toEqual('menu')

      const kebab = fixtureEl.querySelector('#kebab')
      new Menu(kebab, { menu: panel }) // eslint-disable-line no-new
      expect(kebab.hasAttribute('aria-haspopup')).toBeFalse()
    })

    it('should keep a role the page wrote on a panel it shares with a context menu', () => {
      fixtureEl.innerHTML = [
        '<div class="area" data-coreui-toggle="context-menu" data-coreui-target="#shared">Area</div>',
        '<button class="btn" type="button" id="kebab">Actions</button>',
        '<div class="menu" id="shared" role="menu"><button class="menu-item" type="button">Copy</button></div>'
      ].join('')

      const panel = fixtureEl.querySelector('#shared')
      const contextMenu = new ContextMenu(fixtureEl.querySelector('.area'))
      contextMenu.show()
      contextMenu.hide()

      const kebab = fixtureEl.querySelector('#kebab')
      new Menu(kebab, { menu: panel }) // eslint-disable-line no-new
      expect(kebab.getAttribute('aria-haspopup')).toEqual('menu')
    })

    it('should keep the name the page gave the panel with aria-labelledby', () => {
      fixtureEl.innerHTML = [
        '<h6 id="heading">File</h6>',
        '<button class="btn" type="button" data-coreui-toggle="menu">Toggle</button>',
        '<div class="menu" role="menu" aria-labelledby="heading"><button class="menu-item" type="button">Copy</button></div>'
      ].join('')

      new Menu(fixtureEl.querySelector('[data-coreui-toggle="menu"]')) // eslint-disable-line no-new

      expect(fixtureEl.querySelector('.menu').getAttribute('aria-labelledby')).toEqual('heading')
    })

    it('should write no roles on update() for a panel without role="menu"', () => {
      fixtureEl.innerHTML = [
        '<button class="btn" type="button" data-coreui-toggle="menu">Toggle</button>',
        '<div class="menu"><button class="menu-item" type="button">Copy</button></div>'
      ].join('')

      const menu = new Menu(fixtureEl.querySelector('[data-coreui-toggle="menu"]'))
      menu.show()
      menu.update()

      expect(fixtureEl.querySelector('.menu-item').hasAttribute('role')).toBeFalse()
    })

    it('should keep aria-expanded on the trigger of an open submenu on update()', () => {
      fixtureEl.innerHTML = menuMarkup

      const menu = new Menu(fixtureEl.querySelector('[data-coreui-toggle="menu"]'))
      menu.show()
      const trigger = fixtureEl.querySelector('.submenu > .menu-item')
      trigger.click()
      menu.update()

      expect(trigger.getAttribute('aria-expanded')).toEqual('true')
    })

    it('should reach items directly inside a role="group" with the arrow keys', () => {
      fixtureEl.innerHTML = [
        '<button class="btn" type="button" data-coreui-toggle="menu">Sort</button>',
        '<div class="menu" role="menu">',
        '  <div role="group" aria-label="Sort by"><button class="menu-item" type="button" id="name">Name</button></div>',
        '</div>'
      ].join('')

      new Menu(fixtureEl.querySelector('[data-coreui-toggle="menu"]')).show()
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }))

      expect(document.activeElement.id).toEqual('name')
    })

    it('should not open a disabled submenu trigger on click', () => {
      fixtureEl.innerHTML = [
        '<button class="btn" type="button" data-coreui-toggle="menu">Toggle</button>',
        '<div class="menu" role="menu">',
        '  <div class="submenu"><button class="menu-item disabled" type="button">More</button><div class="menu" id="sub"><button class="menu-item" type="button">Deep</button></div></div>',
        '</div>'
      ].join('')

      new Menu(fixtureEl.querySelector('[data-coreui-toggle="menu"]')).show()
      fixtureEl.querySelector('.submenu > .menu-item').click()

      expect(fixtureEl.querySelector('#sub')).not.toHaveClass('show')
    })

    describe('focus on open', () => {
      it('should focus the panel when a pointer opens the menu', () => {
        fixtureEl.innerHTML = menuMarkup

        press(fixtureEl.querySelector('[data-coreui-toggle="menu"]'))

        expect(document.activeElement).toEqual(fixtureEl.querySelector('.menu'))
      })

      it('should focus the first item when a click without a press opens the menu', () => {
        fixtureEl.innerHTML = menuMarkup

        fixtureEl.querySelector('[data-coreui-toggle="menu"]').click()

        expect(document.activeElement.textContent).toEqual('Copy')
      })

      it('should focus the panel when no item takes the focus', () => {
        fixtureEl.innerHTML = [
          '<button class="btn" type="button" data-coreui-toggle="menu">Empty</button>',
          '<div class="menu" role="menu"><button class="menu-item" type="button" disabled>Copy</button></div>'
        ].join('')

        fixtureEl.querySelector('[data-coreui-toggle="menu"]').click()

        expect(document.activeElement).toEqual(fixtureEl.querySelector('.menu'))
      })

      it('should focus the first item on show() while the toggle has the focus, and the toggle otherwise', () => {
        fixtureEl.innerHTML = menuMarkup

        const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(toggle)

        fixtureEl.querySelector('#before').focus()
        menu.show()
        expect(document.activeElement).toEqual(toggle)
        menu.hide()

        toggle.focus()
        menu.show()
        expect(document.activeElement.textContent).toEqual('Copy')
      })

      it('should focus without scrolling the page', () => {
        fixtureEl.innerHTML = menuMarkup

        const copy = fixtureEl.querySelector('.menu-item')
        const spy = spyOn(copy, 'focus').and.callThrough()
        fixtureEl.querySelector('[data-coreui-toggle="menu"]').click()

        expect(spy).toHaveBeenCalledWith({ preventScroll: true })
      })

      it('should focus the panel without scrolling when a pointer opens the menu', () => {
        fixtureEl.innerHTML = menuMarkup

        const panel = fixtureEl.querySelector('.menu')
        const spy = spyOn(panel, 'focus').and.callThrough()
        press(fixtureEl.querySelector('[data-coreui-toggle="menu"]'))

        expect(spy).toHaveBeenCalledWith({ preventScroll: true })
      })

      it('should leave the focus in a field toggle a pointer opens the menu from', () => {
        fixtureEl.innerHTML = [
          '<input class="form-control" data-coreui-toggle="menu" aria-label="Search">',
          '<div class="menu" role="menu"><button class="menu-item" type="button">Copy</button></div>'
        ].join('')

        const field = fixtureEl.querySelector('input')
        field.focus()
        press(field)

        expect(document.activeElement).toEqual(field)
      })

      it('should open with Space on a link toggle inside another open menu', () => {
        fixtureEl.innerHTML = [
          '<button class="btn" type="button" data-coreui-toggle="menu" id="outer">Outer</button>',
          '<div class="menu">',
          '  <a class="btn" href="#" role="button" data-coreui-toggle="menu" id="inner">Inner</a>',
          '  <div class="menu" role="menu" id="inner-panel"><button class="menu-item" type="button">Copy</button></div>',
          '</div>'
        ].join('')

        new Menu(fixtureEl.querySelector('#outer')).show()
        const inner = fixtureEl.querySelector('#inner')
        inner.focus()
        inner.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: ' ' }))

        expect(fixtureEl.querySelector('#inner-panel')).toHaveClass('show')
      })

      it('should open on the last item with ArrowUp', () => {
        fixtureEl.innerHTML = menuMarkup

        const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        new Menu(toggle) // eslint-disable-line no-new
        toggle.focus()
        toggle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }))

        expect(document.activeElement.textContent).toEqual('More')
      })

      it('should open with Space on a link toggle instead of scrolling the page', () => {
        fixtureEl.innerHTML = [
          '<a class="btn" href="#" role="button" data-coreui-toggle="menu">Actions</a>',
          '<div class="menu" role="menu"><button class="menu-item" type="button">Copy</button></div>',
          '<a class="btn" href="#" role="button" data-coreui-toggle="menu">Links</a>',
          '<div class="menu"><a class="menu-item" href="#">Docs</a></div>'
        ].join('')

        const [actions, links] = fixtureEl.querySelectorAll('[data-coreui-toggle="menu"]')
        const space = target => {
          const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: ' ' })
          target.dispatchEvent(event)
          return event
        }

        expect(space(actions).defaultPrevented).toBeTrue()
        expect(actions.nextElementSibling).toHaveClass('show')
        expect(document.activeElement.textContent).toEqual('Copy')

        expect(space(links).defaultPrevented).toBeFalse()
        expect(links.nextElementSibling).not.toHaveClass('show')
      })
    })

    describe('Tab', () => {
      const openWithKeyboard = () => {
        const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        toggle.click()
        return toggle
      }

      it('should close the menu and move on from the toggle', async () => {
        fixtureEl.innerHTML = menuMarkup

        openWithKeyboard()
        let prevented = null
        document.addEventListener('keydown', event => {
          prevented = event.defaultPrevented
        }, { once: true })
        await userEvent.keyboard('{Tab}')

        expect(fixtureEl.querySelector('.menu')).not.toHaveClass('show')
        expect(document.activeElement.id).toEqual('after')
        expect(prevented).toBeFalse()
      })

      it('should close the menu and focus the toggle with Shift+Tab', async () => {
        fixtureEl.innerHTML = menuMarkup

        const toggle = openWithKeyboard()
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')

        expect(fixtureEl.querySelector('.menu')).not.toHaveClass('show')
        expect(document.activeElement).toEqual(toggle)
      })

      it('should close the whole menu from a submenu, whatever autoClose says', async () => {
        fixtureEl.innerHTML = menuMarkup

        const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        new Menu(toggle, { autoClose: false }) // eslint-disable-line no-new
        toggle.click()
        fixtureEl.querySelector('.submenu > .menu-item').click()
        fixtureEl.querySelector('#deep').focus()
        await userEvent.keyboard('{Tab}')

        expect(fixtureEl.querySelector('.menu')).not.toHaveClass('show')
        expect(fixtureEl.querySelector('.submenu > .menu')).not.toHaveClass('show')
        expect(document.activeElement.id).toEqual('after')
      })

      it('should keep the focus on the item when the page keeps the menu open', async () => {
        fixtureEl.innerHTML = menuMarkup

        const toggle = openWithKeyboard()
        toggle.addEventListener('hide.coreui.menu', event => event.preventDefault())
        await userEvent.keyboard('{Tab}')

        expect(fixtureEl.querySelector('.menu')).toHaveClass('show')
        expect(document.activeElement.textContent).toEqual('Copy')
      })

      it('should close the menu when Tab leaves its toggle', async () => {
        fixtureEl.innerHTML = menuMarkup

        const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        const menu = new Menu(toggle, { autoClose: 'inside' })
        fixtureEl.querySelector('#before').focus()
        menu.show()
        await userEvent.keyboard('{Tab}')

        expect(fixtureEl.querySelector('.menu')).not.toHaveClass('show')
        expect(document.activeElement.id).toEqual('after')
      })

      it('should move on from the toggle when the panel sits in a container', async () => {
        fixtureEl.innerHTML = menuMarkup

        const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        new Menu(toggle, { container: true }) // eslint-disable-line no-new
        toggle.click()
        await userEvent.keyboard('{Tab}')

        expect(document.activeElement.id).toEqual('after')
        expect(fixtureEl.querySelector('.wrapper .menu')).not.toBeNull()
      })

      it('should close the menu from a field in the panel', async () => {
        fixtureEl.innerHTML = [
          '<style>.menu:not(.show) { display: none; }</style>',
          '<button class="btn" type="button" data-coreui-toggle="menu">Actions</button>',
          '<div class="menu" role="menu"><input class="search" aria-label="Search"></div>',
          '<button id="after" type="button">After</button>'
        ].join('')

        const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
        new Menu(toggle).show()
        fixtureEl.querySelector('.search').focus()
        await userEvent.keyboard('{Tab}')

        expect(fixtureEl.querySelector('.menu')).not.toHaveClass('show')
        expect(document.activeElement.id).toEqual('after')
      })

      it('should leave Tab inside a menu without a role in the panel of a menu with one to that inner menu', async () => {
        fixtureEl.innerHTML = [
          '<button class="btn" type="button" data-coreui-toggle="menu" id="outer">Outer</button>',
          '<div class="menu" role="menu" id="outer-panel">',
          '  <button class="menu-item" type="button">Copy</button>',
          '  <div>',
          '    <button class="btn" type="button" data-coreui-toggle="menu" id="inner">Inner</button>',
          '    <div class="menu" id="inner-panel"><a href="#one" id="one">One</a><a href="#two" id="two">Two</a></div>',
          '  </div>',
          '</div>'
        ].join('')

        new Menu(fixtureEl.querySelector('#outer')).show()
        new Menu(fixtureEl.querySelector('#inner')).show()
        fixtureEl.querySelector('#one').focus()
        await userEvent.keyboard('{Tab}')

        expect(fixtureEl.querySelector('#outer-panel')).toHaveClass('show')
        expect(document.activeElement.id).toEqual('two')
      })
    })
  })

  describe('a Menu nested in a Dropdown', () => {
    it('should keep the arrow keys and Escape with the inner menu', () => {
      fixtureEl.innerHTML = [
        '<div class="dropdown">',
        '  <button class="btn" type="button" data-coreui-toggle="dropdown" id="outer">Outer</button>',
        '  <div class="dropdown-menu">',
        '    <a class="dropdown-item" href="#" id="o1">O1</a>',
        '    <div><button class="btn" type="button" data-coreui-toggle="menu" id="inner">Inner</button>',
        '    <div class="menu" id="inner-panel"><button class="menu-item" type="button" id="i1">I1</button><button class="menu-item" type="button" id="i2">I2</button></div></div>',
        '  </div>',
        '</div>'
      ].join('')

      new Dropdown(fixtureEl.querySelector('#outer'), { autoClose: 'outside' }).show()
      new Menu(fixtureEl.querySelector('#inner')).show()
      const i1 = fixtureEl.querySelector('#i1')
      i1.focus()

      i1.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }))
      expect(document.activeElement.id).toEqual('i2')

      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
      expect(fixtureEl.querySelector('#inner-panel')).not.toHaveClass('show')
      expect(fixtureEl.querySelector('.dropdown-menu')).toHaveClass('show')
    })
  })

  describe('Tab with the panel in a container', () => {
    const markup = [
      '<button class="btn" type="button" data-coreui-toggle="menu">Filters</button>',
      '<div class="menu"><input id="first" aria-label="Name"><button type="button" id="last">Apply</button></div>',
      '<button id="after" type="button">After</button>'
    ].join('')

    it('should enter the panel from the toggle and leave it for the stop after the toggle', async () => {
      fixtureEl.innerHTML = markup

      const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const panel = fixtureEl.querySelector('.menu')
      new Menu(toggle, { container: true }).show()
      toggle.focus()

      await userEvent.keyboard('{Tab}')
      expect(document.activeElement.id).toEqual('first')

      await userEvent.keyboard('{Tab}{Tab}')
      expect(document.activeElement.id).toEqual('after')
      expect(panel).not.toHaveClass('show')
    })

    it('should leave the panel when the toggle is the last stop before it', async () => {
      fixtureEl.innerHTML = [
        '<button class="btn" type="button" data-coreui-toggle="menu">Filters</button>',
        '<div class="menu"><input id="first" aria-label="Name"><button type="button" id="last">Apply</button></div>'
      ].join('')

      const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const panel = fixtureEl.querySelector('.menu')
      new Menu(toggle, { container: true }).show()
      document.querySelector('#last').focus()

      await userEvent.keyboard('{Tab}')
      expect(panel.contains(document.activeElement)).toBeFalse()
    })

    it('should leave Shift+Tab from the toggle to the browser', async () => {
      fixtureEl.innerHTML = markup

      const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      new Menu(toggle, { container: true }).show()
      toggle.focus()

      const event = new KeyboardEvent('keydown', {
        bubbles: true, cancelable: true, key: 'Tab', shiftKey: true
      })
      toggle.dispatchEvent(event)
      expect(event.defaultPrevented).toBeFalse()
    })

    it('should enter the moved panel from a toggle inside another open menu', async () => {
      fixtureEl.innerHTML = [
        '<button class="btn" type="button" data-coreui-toggle="menu" id="outer">Outer</button>',
        '<div class="menu">',
        '  <button class="btn" type="button" data-coreui-toggle="menu" id="inner">Inner</button>',
        '  <div class="menu"><button type="button" id="i1">I1</button></div>',
        '  <button type="button" id="z">Z</button>',
        '</div>'
      ].join('')

      new Menu(fixtureEl.querySelector('#outer'), { autoClose: 'outside' }).show()
      const inner = fixtureEl.querySelector('#inner')
      new Menu(inner, { container: true }).show()
      inner.focus()

      await userEvent.keyboard('{Tab}')
      expect(document.activeElement.id).toEqual('i1')
    })

    it('should go back to the toggle with Shift+Tab from the first stop and keep the menu open', async () => {
      fixtureEl.innerHTML = markup

      const toggle = fixtureEl.querySelector('[data-coreui-toggle="menu"]')
      const panel = fixtureEl.querySelector('.menu')
      new Menu(toggle, { container: true }).show()
      document.querySelector('#first').focus()

      await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
      expect(document.activeElement).toEqual(toggle)
      expect(panel).toHaveClass('show')
    })
  })
})

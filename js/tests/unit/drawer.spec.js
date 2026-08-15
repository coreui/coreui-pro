import Data from '../../src/dom/data.js'
import EventHandler from '../../src/dom/event-handler.js'
import Drawer from '../../src/drawer.js'
import { isVisible } from '../../src/util/index.js'
import {
  clearBodyAndDocument, clearFixture, createEvent, getFixture, jQueryMock
} from '../helpers/fixture.js'

describe('Drawer', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
    document.documentElement.classList.remove('dialog-open')
    clearBodyAndDocument()

    for (const dialog of document.querySelectorAll('dialog[open]')) {
      dialog.close()
    }
  })

  beforeEach(() => {
    clearBodyAndDocument()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Drawer.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(Drawer.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Drawer.DATA_KEY).toEqual('coreui.drawer')
    })
  })

  describe('constructor', () => {
    it('should call hide when a element with data-coreui-dismiss="drawer" is clicked', () => {
      fixtureEl.innerHTML = [
        '<dialog class="drawer">',
        '  <a href="#" data-coreui-dismiss="drawer">Close</a>',
        '</dialog>'
      ].join('')

      const drawerEl = fixtureEl.querySelector('.drawer')
      const closeEl = fixtureEl.querySelector('a')
      const drawer = new Drawer(drawerEl)

      const spy = spyOn(drawer, 'hide')

      closeEl.click()

      expect(drawer._config.keyboard).toBeTrue()
      expect(spy).toHaveBeenCalled()
    })

    it('should call hide on a responsive drawer without an explicit data-coreui-target', () => {
      fixtureEl.innerHTML = [
        '<dialog class="drawer-lg drawer-end">',
        '  <button type="button" data-coreui-dismiss="drawer">Close</button>',
        '</dialog>'
      ].join('')

      const drawerEl = fixtureEl.querySelector('dialog')
      const closeEl = fixtureEl.querySelector('button')
      const drawer = new Drawer(drawerEl)

      const spy = spyOn(drawer, 'hide')

      closeEl.click()

      expect(spy).toHaveBeenCalled()
    })

    it('should hide if esc is pressed (non-modal via keydown)', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl, { scroll: true, backdrop: false })

        const spy = spyOn(drawer, 'hide').and.callThrough()

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          const keyDownEsc = createEvent('keydown')
          keyDownEsc.key = 'Escape'
          drawerEl.dispatchEvent(keyDownEsc)

          setTimeout(() => {
            expect(spy).toHaveBeenCalled()
            resolve()
          }, 10)
        })

        drawer.show()
      })
    })

    it('should hide if cancel event fires (modal mode)', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl)

        const spy = spyOn(drawer, 'hide').and.callThrough()

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          const cancelEvent = createEvent('cancel')
          drawerEl.dispatchEvent(cancelEvent)

          setTimeout(() => {
            expect(spy).toHaveBeenCalled()
            resolve()
          }, 10)
        })

        drawer.show()
      })
    })

    it('should not hide if esc is not pressed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl, { scroll: true, backdrop: false })

        const spy = spyOn(drawer, 'hide')

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          const keydownTab = createEvent('keydown')
          keydownTab.key = 'Tab'
          drawerEl.dispatchEvent(keydownTab)

          setTimeout(() => {
            expect(spy).not.toHaveBeenCalled()
            resolve()
          }, 10)
        })

        drawer.show()
      })
    })

    it('should not hide if esc is pressed but with keyboard = false', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl, { keyboard: false })

        const spy = spyOn(drawer, 'hide')
        const hidePreventedSpy = jasmine.createSpy('hidePrevented')
        drawerEl.addEventListener('hidePrevented.coreui.drawer', hidePreventedSpy)

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          expect(drawer._config.keyboard).toBeFalse()
          const cancelEvent = createEvent('cancel')
          drawerEl.dispatchEvent(cancelEvent)

          setTimeout(() => {
            expect(hidePreventedSpy).toHaveBeenCalled()
            expect(spy).not.toHaveBeenCalled()
            resolve()
          }, 10)
        })

        drawer.show()
      })
    })

    it('should not hide if user clicks on static backdrop', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl, { backdrop: 'static' })

        const spyHide = spyOn(drawer, 'hide')
        const hidePreventedSpy = jasmine.createSpy('hidePrevented')
        drawerEl.addEventListener('hidePrevented.coreui.drawer', hidePreventedSpy)

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          // Click on dialog element itself (backdrop area)
          const clickEvent = createEvent('click')
          Object.defineProperty(clickEvent, 'target', { value: drawerEl })
          drawerEl.dispatchEvent(clickEvent)

          setTimeout(() => {
            expect(hidePreventedSpy).toHaveBeenCalled()
            expect(spyHide).not.toHaveBeenCalled()
            resolve()
          }, 10)
        })

        drawer.show()
      })
    })

    it('should call `hide` on resize, if element\'s position is not fixed any more', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer-lg"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Drawer(drawerEl)

        const spy = spyOn(drawer, 'hide').and.callThrough()

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          // Override computed position to non-fixed so resize handler triggers hide
          drawerEl.style.position = 'static'

          const resizeEvent = createEvent('resize')
          window.dispatchEvent(resizeEvent)
          expect(spy).toHaveBeenCalled()
          resolve()
        })

        drawer.show()
      })
    })
  })

  describe('config', () => {
    it('should have default values', () => {
      fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

      const drawerEl = fixtureEl.querySelector('.drawer')
      const drawer = new Drawer(drawerEl)

      expect(drawer._config.backdrop).toBeTrue()
      expect(drawer._config.keyboard).toBeTrue()
      expect(drawer._config.scroll).toBeFalse()
    })

    it('should read data attributes and override default config', () => {
      fixtureEl.innerHTML = '<dialog class="drawer" data-coreui-scroll="true" data-coreui-backdrop="false" data-coreui-keyboard="false"></dialog>'

      const drawerEl = fixtureEl.querySelector('.drawer')
      const drawer = new Drawer(drawerEl)

      expect(drawer._config.backdrop).toBeFalse()
      expect(drawer._config.keyboard).toBeFalse()
      expect(drawer._config.scroll).toBeTrue()
    })

    it('given a config object must override data attributes', () => {
      fixtureEl.innerHTML = '<dialog class="drawer" data-coreui-scroll="true" data-coreui-backdrop="false" data-coreui-keyboard="false"></dialog>'

      const drawerEl = fixtureEl.querySelector('.drawer')
      const drawer = new Drawer(drawerEl, {
        backdrop: true,
        keyboard: true,
        scroll: false
      })
      expect(drawer._config.backdrop).toBeTrue()
      expect(drawer._config.keyboard).toBeTrue()
      expect(drawer._config.scroll).toBeFalse()
    })
  })

  describe('options', () => {
    it('if scroll is enabled, should not add dialog-open class to the root element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl, { scroll: true, backdrop: false })

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          expect(document.documentElement.classList.contains('dialog-open')).toBeFalse()
          drawer.hide()
        })
        drawerEl.addEventListener('hidden.coreui.drawer', () => {
          resolve()
        })
        drawer.show()
      })
    })

    it('if scroll is disabled, should add dialog-open class to the root element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl, { scroll: false })

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          expect(document.documentElement.classList.contains('dialog-open')).toBeTrue()
          drawer.hide()
        })
        drawerEl.addEventListener('hidden.coreui.drawer', () => {
          expect(document.documentElement.classList.contains('dialog-open')).toBeFalse()
          resolve()
        })
        drawer.show()
      })
    })

    it('should hide a shown element if user click on backdrop', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Drawer(drawerEl, { backdrop: true })

        const spy = spyOn(drawer, 'hide').and.callThrough()

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          // Click on dialog element itself (backdrop area)
          const clickEvent = createEvent('click')
          Object.defineProperty(clickEvent, 'target', { value: drawerEl })
          drawerEl.dispatchEvent(clickEvent)
        })

        drawerEl.addEventListener('hidden.coreui.drawer', () => {
          expect(spy).toHaveBeenCalled()
          resolve()
        })

        drawer.show()
      })
    })

    it('should not respond to backdrop clicks for non-modal drawers (scroll + no backdrop)', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl, {
          scroll: true,
          backdrop: false
        })

        const spy = spyOn(drawer, 'hide')

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          // Click on dialog element itself
          const clickEvent = createEvent('click')
          Object.defineProperty(clickEvent, 'target', { value: drawerEl })
          drawerEl.dispatchEvent(clickEvent)

          setTimeout(() => {
            expect(spy).not.toHaveBeenCalled()
            resolve()
          }, 10)
        })

        drawer.show()
      })
    })
  })

  describe('toggle', () => {
    it('should call show method if drawer is not open', () => {
      fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

      const drawerEl = fixtureEl.querySelector('.drawer')
      const drawer = new Drawer(drawerEl)

      const spy = spyOn(drawer, 'show')

      drawer.toggle()

      expect(spy).toHaveBeenCalled()
    })

    it('should call hide method if drawer is open', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl)

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          expect(drawerEl.open).toBeTrue()
          const spy = spyOn(drawer, 'hide')

          drawer.toggle()

          expect(spy).toHaveBeenCalled()
          resolve()
        })

        drawer.show()
      })
    })
  })

  describe('show', () => {
    it('should open the dialog element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'
        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl)

        drawerEl.addEventListener('show.coreui.drawer', () => {
          expect(drawerEl.open).toBeFalse()
        })

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          expect(drawerEl.open).toBeTrue()
          resolve()
        })

        drawer.show()
      })
    })

    it('should do nothing if already open', () => {
      fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')
      const drawer = new Drawer(drawerEl)

      // Manually open the dialog
      drawerEl.showModal()

      const spyTrigger = spyOn(EventHandler, 'trigger')
      drawer.show()

      expect(spyTrigger).not.toHaveBeenCalled()
    })

    it('should show a hidden element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Drawer(drawerEl)

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          expect(drawerEl.open).toBeTrue()
          resolve()
        })

        drawer.show()
      })
    })

    it('should not fire shown when show is prevented', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Drawer(drawerEl)

        const expectEnd = () => {
          setTimeout(() => {
            expect(drawerEl.open).toBeFalse()
            resolve()
          }, 10)
        }

        drawerEl.addEventListener('show.coreui.drawer', event => {
          event.preventDefault()
          expectEnd()
        })

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          reject(new Error('should not fire shown event'))
        })

        drawer.show()
      })
    })

    it('on window load, should call show on a drawer element, if its markup contains open attribute', () => {
      fixtureEl.innerHTML = '<dialog class="drawer" open></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')
      const spy = spyOn(Drawer.prototype, 'show').and.callThrough()

      window.dispatchEvent(createEvent('load'))

      const instance = Drawer.getInstance(drawerEl)
      expect(instance).not.toBeNull()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('hide', () => {
    it('should close the dialog element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'
        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl)

        drawerEl.addEventListener('hidden.coreui.drawer', () => {
          expect(drawerEl.open).toBeFalse()
          resolve()
        })

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          drawer.hide()
        })

        drawer.show()
      })
    })

    it('should do nothing if not open', () => {
      fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

      const spyTrigger = spyOn(EventHandler, 'trigger')

      const drawerEl = fixtureEl.querySelector('dialog')
      const drawer = new Drawer(drawerEl)

      drawer.hide()
      expect(spyTrigger).not.toHaveBeenCalled()
    })

    it('should hide a shown element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Drawer(drawerEl)

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          drawer.hide()
        })

        drawerEl.addEventListener('hidden.coreui.drawer', () => {
          expect(drawerEl.open).toBeFalse()
          resolve()
        })

        drawer.show()
      })
    })

    it('should not fire hidden when hide is prevented', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Drawer(drawerEl)

        drawerEl.addEventListener('hide.coreui.drawer', event => {
          event.preventDefault()
          setTimeout(() => {
            expect(drawerEl.open).toBeTrue()
            resolve()
          }, 10)
        })

        drawerEl.addEventListener('hidden.coreui.drawer', () => {
          reject(new Error('should not fire hidden event'))
        })

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          drawer.hide()
        })

        drawer.show()
      })
    })
  })

  describe('dispose', () => {
    it('should dispose a drawer', () => {
      fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')
      const drawer = new Drawer(drawerEl)

      expect(Drawer.getInstance(drawerEl)).toEqual(drawer)

      const spyOff = spyOn(EventHandler, 'off')

      drawer.dispose()

      expect(Drawer.getInstance(drawerEl)).toBeNull()
      expect(spyOff).toHaveBeenCalled()
    })

    it('should close the drawer and restore body scroll when disposed while open', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Drawer(drawerEl)

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          expect(drawerEl.open).toBeTrue()
          expect(document.documentElement.classList.contains('dialog-open')).toBeTrue()

          drawer.dispose()

          expect(drawerEl.open).toBeFalse()
          expect(document.documentElement.classList.contains('dialog-open')).toBeFalse()
          resolve()
        })

        drawer.show()
      })
    })
  })

  describe('data-api', () => {
    it('should not prevent event for input', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<input type="checkbox" data-coreui-toggle="drawer" data-coreui-target="#drawerdiv1">',
          '<dialog id="drawerdiv1" class="drawer"></dialog>'
        ].join('')

        const target = fixtureEl.querySelector('input')
        const drawerEl = fixtureEl.querySelector('#drawerdiv1')

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          expect(drawerEl.open).toBeTrue()
          expect(target.checked).toBeTrue()
          resolve()
        })

        target.click()
      })
    })

    it('should not call toggle on disabled elements', () => {
      fixtureEl.innerHTML = [
        '<a href="#" data-coreui-toggle="drawer" data-coreui-target="#drawerdiv1" class="disabled"></a>',
        '<dialog id="drawerdiv1" class="drawer"></dialog>'
      ].join('')

      const target = fixtureEl.querySelector('a')

      const spy = spyOn(Drawer.prototype, 'toggle')

      target.click()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should call hide first, if another drawer is open', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<button id="btn2" data-coreui-toggle="drawer" data-coreui-target="#drawer2"></button>',
          '<dialog id="drawer1" class="drawer"></dialog>',
          '<dialog id="drawer2" class="drawer"></dialog>'
        ].join('')

        const trigger2 = fixtureEl.querySelector('#btn2')
        const drawerEl1 = document.querySelector('#drawer1')
        const drawerEl2 = document.querySelector('#drawer2')
        const drawer1 = new Drawer(drawerEl1)

        drawerEl1.addEventListener('shown.coreui.drawer', () => {
          trigger2.click()
        })
        drawerEl1.addEventListener('hidden.coreui.drawer', () => {
          expect(Drawer.getInstance(drawerEl2)).not.toBeNull()
          resolve()
        })
        drawer1.show()
      })
    })

    it('should focus on trigger element after closing drawer', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<button id="btn" data-coreui-toggle="drawer" data-coreui-target="#drawer"></button>',
          '<dialog id="drawer" class="drawer"></dialog>'
        ].join('')

        const trigger = fixtureEl.querySelector('#btn')
        const drawerEl = fixtureEl.querySelector('#drawer')
        const drawer = new Drawer(drawerEl)
        const spy = spyOn(trigger, 'focus')

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          drawer.hide()
        })
        drawerEl.addEventListener('hidden.coreui.drawer', () => {
          setTimeout(() => {
            expect(spy).toHaveBeenCalledWith({ preventScroll: true })
            resolve()
          }, 5)
        })

        trigger.click()
      })
    })

    it('should not focus on trigger element after closing drawer, if it is not visible', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<button id="btn" data-coreui-toggle="drawer" data-coreui-target="#drawer"></button>',
          '<dialog id="drawer" class="drawer"></dialog>'
        ].join('')

        const trigger = fixtureEl.querySelector('#btn')
        const drawerEl = fixtureEl.querySelector('#drawer')
        const drawer = new Drawer(drawerEl)
        const spy = spyOn(trigger, 'focus')

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          trigger.style.display = 'none'
          drawer.hide()
        })
        drawerEl.addEventListener('hidden.coreui.drawer', () => {
          setTimeout(() => {
            expect(isVisible(trigger)).toBeFalse()
            expect(spy).not.toHaveBeenCalled()
            resolve()
          }, 5)
        })

        trigger.click()
      })
    })
  })

  describe('getInstance', () => {
    it('should return drawer instance', () => {
      fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')
      const drawer = new Drawer(drawerEl)

      expect(Drawer.getInstance(drawerEl)).toEqual(drawer)
      expect(Drawer.getInstance(drawerEl)).toBeInstanceOf(Drawer)
    })

    it('should return null when there is no drawer instance', () => {
      fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')

      expect(Drawer.getInstance(drawerEl)).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return drawer instance', () => {
      fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')
      const drawer = new Drawer(drawerEl)

      expect(Drawer.getOrCreateInstance(drawerEl)).toEqual(drawer)
      expect(Drawer.getInstance(drawerEl)).toEqual(Drawer.getOrCreateInstance(drawerEl, {}))
      expect(Drawer.getOrCreateInstance(drawerEl)).toBeInstanceOf(Drawer)
    })

    it('should return new instance when there is no Drawer instance', () => {
      fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')

      expect(Drawer.getInstance(drawerEl)).toBeNull()
      expect(Drawer.getOrCreateInstance(drawerEl)).toBeInstanceOf(Drawer)
    })

    it('should return new instance when there is no drawer instance with given configuration', () => {
      fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')

      expect(Drawer.getInstance(drawerEl)).toBeNull()
      const drawer = Drawer.getOrCreateInstance(drawerEl, {
        scroll: true
      })
      expect(drawer).toBeInstanceOf(Drawer)

      expect(drawer._config.scroll).toBeTrue()
    })

    it('should return the instance when exists without given configuration', () => {
      fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')
      const drawer = new Drawer(drawerEl, {
        scroll: true
      })
      expect(Drawer.getInstance(drawerEl)).toEqual(drawer)

      const drawer2 = Drawer.getOrCreateInstance(drawerEl, {
        scroll: false
      })
      expect(drawer).toBeInstanceOf(Drawer)
      expect(drawer2).toEqual(drawer)

      expect(drawer2._config.scroll).toBeTrue()
    })
  })

  describe('child component cleanup', () => {
    it('should hide tooltip instances inside drawer when drawer closes', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<dialog class="drawer">',
          '  <button data-coreui-toggle="tooltip" title="tip">Hover</button>',
          '</dialog>'
        ].join('')

        const drawerEl = fixtureEl.querySelector('.drawer')
        const tooltipTrigger = fixtureEl.querySelector('[data-coreui-toggle="tooltip"]')
        const drawer = new Drawer(drawerEl)

        const fakeTooltip = { hide: jasmine.createSpy('tooltipHide') }
        Data.set(tooltipTrigger, 'coreui.tooltip', fakeTooltip)

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          drawer.hide()
        })

        drawerEl.addEventListener('hidden.coreui.drawer', () => {
          expect(fakeTooltip.hide).toHaveBeenCalled()
          Data.remove(tooltipTrigger, 'coreui.tooltip')
          resolve()
        })

        drawer.show()
      })
    })

    it('should hide popover instances inside drawer when drawer closes', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<dialog class="drawer">',
          '  <button data-coreui-toggle="popover" title="pop">Click</button>',
          '</dialog>'
        ].join('')

        const drawerEl = fixtureEl.querySelector('.drawer')
        const popoverTrigger = fixtureEl.querySelector('[data-coreui-toggle="popover"]')
        const drawer = new Drawer(drawerEl)

        const fakePopover = { hide: jasmine.createSpy('popoverHide') }
        Data.set(popoverTrigger, 'coreui.popover', fakePopover)

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          drawer.hide()
        })

        drawerEl.addEventListener('hidden.coreui.drawer', () => {
          expect(fakePopover.hide).toHaveBeenCalled()
          Data.remove(popoverTrigger, 'coreui.popover')
          resolve()
        })

        drawer.show()
      })
    })

    it('should hide toast instances inside drawer when drawer closes', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<dialog class="drawer">',
          '  <div class="toast show">Toast content</div>',
          '</dialog>'
        ].join('')

        const drawerEl = fixtureEl.querySelector('.drawer')
        const toastEl = fixtureEl.querySelector('.toast')
        const drawer = new Drawer(drawerEl)

        const fakeToast = { hide: jasmine.createSpy('toastHide') }
        Data.set(toastEl, 'coreui.toast', fakeToast)

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          drawer.hide()
        })

        drawerEl.addEventListener('hidden.coreui.drawer', () => {
          expect(fakeToast.hide).toHaveBeenCalled()
          Data.remove(toastEl, 'coreui.toast')
          resolve()
        })

        drawer.show()
      })
    })
  })

  describe('drawer-instant', () => {
    it('should show and fire shown event when drawer-instant class is present', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer drawer-instant"></dialog>'

        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl)

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          expect(drawer._isTransitioning).toBeFalse()
          expect(drawerEl.open).toBeTrue()
          resolve()
        })

        drawer.show()
      })
    })

    it('should not report as animated when drawer-instant is present', () => {
      fixtureEl.innerHTML = '<dialog class="drawer drawer-instant"></dialog>'

      const drawerEl = fixtureEl.querySelector('.drawer')
      const drawer = new Drawer(drawerEl)

      expect(drawer._isAnimated()).toBeFalse()
    })

    it('should report as animated when drawer-instant is not present', () => {
      fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

      const drawerEl = fixtureEl.querySelector('.drawer')
      const drawer = new Drawer(drawerEl)

      expect(drawer._isAnimated()).toBeTrue()
    })
  })

  describe('hiding class', () => {
    it('should add hiding class during hide and remove after hidden', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl)

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          drawer.hide()
          expect(drawerEl.classList.contains('hiding')).toBeTrue()
        })

        drawerEl.addEventListener('hidden.coreui.drawer', () => {
          expect(drawerEl.classList.contains('hiding')).toBeFalse()
          resolve()
        })

        drawer.show()
      })
    })
  })

  describe('drawer-static class', () => {
    it('should add drawer-static class when static backdrop is clicked, then remove it', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer"></dialog>'

        const drawerEl = fixtureEl.querySelector('.drawer')
        const drawer = new Drawer(drawerEl, {
          backdrop: 'static'
        })

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          const clickEvent = createEvent('click')
          Object.defineProperty(clickEvent, 'target', { value: drawerEl })
          drawerEl.dispatchEvent(clickEvent)

          expect(drawerEl.classList.contains('drawer-static')).toBeTrue()
          expect(drawerEl.classList.contains('dialog-static')).toBeFalse()

          setTimeout(() => {
            expect(drawerEl.classList.contains('drawer-static')).toBeFalse()
            resolve()
          }, 300)
        })

        drawer.show()
      })
    })
  })

  describe('resize negative path', () => {
    it('should not hide drawer on resize when position is still fixed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="drawer-lg"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Drawer(drawerEl)

        const spy = spyOn(drawer, 'hide')

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          drawerEl.style.position = 'fixed'

          const resizeEvent = createEvent('resize')
          window.dispatchEvent(resizeEvent)

          setTimeout(() => {
            expect(spy).not.toHaveBeenCalled()
            expect(drawerEl.open).toBeTrue()
            resolve()
          }, 10)
        })

        drawer.show()
      })
    })
  })

  describe('data-api link trigger', () => {
    it('should prevent default when the trigger is <a>', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<a href="#" data-coreui-toggle="drawer" data-coreui-target="#drawerEl">Toggle</a>',
          '<dialog id="drawerEl" class="drawer"></dialog>'
        ].join('')

        const drawerEl = fixtureEl.querySelector('.drawer')
        const trigger = fixtureEl.querySelector('[data-coreui-toggle="drawer"]')

        const spy = spyOn(Event.prototype, 'preventDefault').and.callThrough()

        drawerEl.addEventListener('shown.coreui.drawer', () => {
          expect(drawerEl.open).toBeTrue()
          expect(spy).toHaveBeenCalled()
          resolve()
        })

        trigger.click()
      })
    })
  })

  describe('jQueryInterface', () => {
    it('should create a drawer', () => {
      fixtureEl.innerHTML = '<dialog class="drawer drawer-start"></dialog>'

      const el = fixtureEl.querySelector('.drawer')

      jQueryMock.fn.drawer = Drawer.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.drawer.call(jQueryMock)

      expect(Drawer.getInstance(el)).not.toBeNull()
    })

    it('should create a drawer with given config', () => {
      fixtureEl.innerHTML = '<dialog class="drawer drawer-start"></dialog>'

      const el = fixtureEl.querySelector('.drawer')

      jQueryMock.fn.drawer = Drawer.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.drawer.call(jQueryMock, { keyboard: false })

      const instance = Drawer.getInstance(el)
      expect(instance).not.toBeNull()
      expect(instance._config.keyboard).toBeFalse()
    })

    it('should not re create a drawer', () => {
      fixtureEl.innerHTML = '<dialog class="drawer drawer-start"></dialog>'

      const el = fixtureEl.querySelector('.drawer')
      const instance = new Drawer(el)

      jQueryMock.fn.drawer = Drawer.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.drawer.call(jQueryMock)

      expect(Drawer.getInstance(el)).toEqual(instance)
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<dialog class="drawer drawer-start"></dialog>'

      const el = fixtureEl.querySelector('.drawer')
      const action = 'undefinedMethod'

      jQueryMock.fn.drawer = Drawer.jQueryInterface
      jQueryMock.elements = [el]

      expect(() => {
        jQueryMock.fn.drawer.call(jQueryMock, action)
      }).toThrowError(TypeError, `No method named "${action}"`)
    })

    it('should call show method', () => {
      fixtureEl.innerHTML = '<dialog class="drawer drawer-start"></dialog>'

      const el = fixtureEl.querySelector('.drawer')
      const instance = new Drawer(el)

      jQueryMock.fn.drawer = Drawer.jQueryInterface
      jQueryMock.elements = [el]

      const spy = spyOn(instance, 'show')

      jQueryMock.fn.drawer.call(jQueryMock, 'show')

      expect(spy).toHaveBeenCalled()
    })
  })
})

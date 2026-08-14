import Data from '../../src/dom/data.js'
import EventHandler from '../../src/dom/event-handler.js'
import Offcanvas from '../../src/offcanvas.js'
import { isVisible } from '../../src/util/index.js'
import {
  clearBodyAndDocument, clearFixture, createEvent, getFixture, jQueryMock
} from '../helpers/fixture.js'

describe('Offcanvas', () => {
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
      expect(Offcanvas.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(Offcanvas.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Offcanvas.DATA_KEY).toEqual('coreui.offcanvas')
    })
  })

  describe('constructor', () => {
    it('should call hide when a element with data-coreui-dismiss="offcanvas" is clicked', () => {
      fixtureEl.innerHTML = [
        '<dialog class="offcanvas">',
        '  <a href="#" data-coreui-dismiss="offcanvas">Close</a>',
        '</dialog>'
      ].join('')

      const drawerEl = fixtureEl.querySelector('.offcanvas')
      const closeEl = fixtureEl.querySelector('a')
      const drawer = new Offcanvas(drawerEl)

      const spy = spyOn(drawer, 'hide')

      closeEl.click()

      expect(drawer._config.keyboard).toBeTrue()
      expect(spy).toHaveBeenCalled()
    })

    it('should call hide on a responsive drawer without an explicit data-coreui-target', () => {
      fixtureEl.innerHTML = [
        '<dialog class="offcanvas-lg offcanvas-end">',
        '  <button type="button" data-coreui-dismiss="offcanvas">Close</button>',
        '</dialog>'
      ].join('')

      const drawerEl = fixtureEl.querySelector('dialog')
      const closeEl = fixtureEl.querySelector('button')
      const drawer = new Offcanvas(drawerEl)

      const spy = spyOn(drawer, 'hide')

      closeEl.click()

      expect(spy).toHaveBeenCalled()
    })

    it('should hide if esc is pressed (non-modal via keydown)', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl, { scroll: true, backdrop: false })

        const spy = spyOn(drawer, 'hide').and.callThrough()

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
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
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl)

        const spy = spyOn(drawer, 'hide').and.callThrough()

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
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
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl, { scroll: true, backdrop: false })

        const spy = spyOn(drawer, 'hide')

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
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
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl, { keyboard: false })

        const spy = spyOn(drawer, 'hide')
        const hidePreventedSpy = jasmine.createSpy('hidePrevented')
        drawerEl.addEventListener('hidePrevented.coreui.offcanvas', hidePreventedSpy)

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
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
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl, { backdrop: 'static' })

        const spyHide = spyOn(drawer, 'hide')
        const hidePreventedSpy = jasmine.createSpy('hidePrevented')
        drawerEl.addEventListener('hidePrevented.coreui.offcanvas', hidePreventedSpy)

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
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
        fixtureEl.innerHTML = '<dialog class="offcanvas-lg"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Offcanvas(drawerEl)

        const spy = spyOn(drawer, 'hide').and.callThrough()

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
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
      fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

      const drawerEl = fixtureEl.querySelector('.offcanvas')
      const drawer = new Offcanvas(drawerEl)

      expect(drawer._config.backdrop).toBeTrue()
      expect(drawer._config.keyboard).toBeTrue()
      expect(drawer._config.scroll).toBeFalse()
    })

    it('should read data attributes and override default config', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas" data-coreui-scroll="true" data-coreui-backdrop="false" data-coreui-keyboard="false"></dialog>'

      const drawerEl = fixtureEl.querySelector('.offcanvas')
      const drawer = new Offcanvas(drawerEl)

      expect(drawer._config.backdrop).toBeFalse()
      expect(drawer._config.keyboard).toBeFalse()
      expect(drawer._config.scroll).toBeTrue()
    })

    it('given a config object must override data attributes', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas" data-coreui-scroll="true" data-coreui-backdrop="false" data-coreui-keyboard="false"></dialog>'

      const drawerEl = fixtureEl.querySelector('.offcanvas')
      const drawer = new Offcanvas(drawerEl, {
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
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl, { scroll: true, backdrop: false })

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          expect(document.documentElement.classList.contains('dialog-open')).toBeFalse()
          drawer.hide()
        })
        drawerEl.addEventListener('hidden.coreui.offcanvas', () => {
          resolve()
        })
        drawer.show()
      })
    })

    it('if scroll is disabled, should add dialog-open class to the root element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl, { scroll: false })

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          expect(document.documentElement.classList.contains('dialog-open')).toBeTrue()
          drawer.hide()
        })
        drawerEl.addEventListener('hidden.coreui.offcanvas', () => {
          expect(document.documentElement.classList.contains('dialog-open')).toBeFalse()
          resolve()
        })
        drawer.show()
      })
    })

    it('should hide a shown element if user click on backdrop', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Offcanvas(drawerEl, { backdrop: true })

        const spy = spyOn(drawer, 'hide').and.callThrough()

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          // Click on dialog element itself (backdrop area)
          const clickEvent = createEvent('click')
          Object.defineProperty(clickEvent, 'target', { value: drawerEl })
          drawerEl.dispatchEvent(clickEvent)
        })

        drawerEl.addEventListener('hidden.coreui.offcanvas', () => {
          expect(spy).toHaveBeenCalled()
          resolve()
        })

        drawer.show()
      })
    })

    it('should not respond to backdrop clicks for non-modal drawers (scroll + no backdrop)', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl, {
          scroll: true,
          backdrop: false
        })

        const spy = spyOn(drawer, 'hide')

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
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
      fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

      const drawerEl = fixtureEl.querySelector('.offcanvas')
      const drawer = new Offcanvas(drawerEl)

      const spy = spyOn(drawer, 'show')

      drawer.toggle()

      expect(spy).toHaveBeenCalled()
    })

    it('should call hide method if drawer is open', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl)

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
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
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'
        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl)

        drawerEl.addEventListener('show.coreui.offcanvas', () => {
          expect(drawerEl.open).toBeFalse()
        })

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          expect(drawerEl.open).toBeTrue()
          resolve()
        })

        drawer.show()
      })
    })

    it('should do nothing if already open', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')
      const drawer = new Offcanvas(drawerEl)

      // Manually open the dialog
      drawerEl.showModal()

      const spyTrigger = spyOn(EventHandler, 'trigger')
      drawer.show()

      expect(spyTrigger).not.toHaveBeenCalled()
    })

    it('should show a hidden element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Offcanvas(drawerEl)

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          expect(drawerEl.open).toBeTrue()
          resolve()
        })

        drawer.show()
      })
    })

    it('should not fire shown when show is prevented', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Offcanvas(drawerEl)

        const expectEnd = () => {
          setTimeout(() => {
            expect(drawerEl.open).toBeFalse()
            resolve()
          }, 10)
        }

        drawerEl.addEventListener('show.coreui.offcanvas', event => {
          event.preventDefault()
          expectEnd()
        })

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          reject(new Error('should not fire shown event'))
        })

        drawer.show()
      })
    })

    it('on window load, should call show on a drawer element, if its markup contains open attribute', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas" open></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')
      const spy = spyOn(Offcanvas.prototype, 'show').and.callThrough()

      window.dispatchEvent(createEvent('load'))

      const instance = Offcanvas.getInstance(drawerEl)
      expect(instance).not.toBeNull()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('hide', () => {
    it('should close the dialog element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'
        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl)

        drawerEl.addEventListener('hidden.coreui.offcanvas', () => {
          expect(drawerEl.open).toBeFalse()
          resolve()
        })

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          drawer.hide()
        })

        drawer.show()
      })
    })

    it('should do nothing if not open', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

      const spyTrigger = spyOn(EventHandler, 'trigger')

      const drawerEl = fixtureEl.querySelector('dialog')
      const drawer = new Offcanvas(drawerEl)

      drawer.hide()
      expect(spyTrigger).not.toHaveBeenCalled()
    })

    it('should hide a shown element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Offcanvas(drawerEl)

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          drawer.hide()
        })

        drawerEl.addEventListener('hidden.coreui.offcanvas', () => {
          expect(drawerEl.open).toBeFalse()
          resolve()
        })

        drawer.show()
      })
    })

    it('should not fire hidden when hide is prevented', () => {
      return new Promise((resolve, reject) => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Offcanvas(drawerEl)

        drawerEl.addEventListener('hide.coreui.offcanvas', event => {
          event.preventDefault()
          setTimeout(() => {
            expect(drawerEl.open).toBeTrue()
            resolve()
          }, 10)
        })

        drawerEl.addEventListener('hidden.coreui.offcanvas', () => {
          reject(new Error('should not fire hidden event'))
        })

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          drawer.hide()
        })

        drawer.show()
      })
    })
  })

  describe('dispose', () => {
    it('should dispose a drawer', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')
      const drawer = new Offcanvas(drawerEl)

      expect(Offcanvas.getInstance(drawerEl)).toEqual(drawer)

      const spyOff = spyOn(EventHandler, 'off')

      drawer.dispose()

      expect(Offcanvas.getInstance(drawerEl)).toBeNull()
      expect(spyOff).toHaveBeenCalled()
    })

    it('should close the drawer and restore body scroll when disposed while open', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Offcanvas(drawerEl)

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
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
          '<input type="checkbox" data-coreui-toggle="offcanvas" data-coreui-target="#drawerdiv1">',
          '<dialog id="drawerdiv1" class="offcanvas"></dialog>'
        ].join('')

        const target = fixtureEl.querySelector('input')
        const drawerEl = fixtureEl.querySelector('#drawerdiv1')

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          expect(drawerEl.open).toBeTrue()
          expect(target.checked).toBeTrue()
          resolve()
        })

        target.click()
      })
    })

    it('should not call toggle on disabled elements', () => {
      fixtureEl.innerHTML = [
        '<a href="#" data-coreui-toggle="offcanvas" data-coreui-target="#drawerdiv1" class="disabled"></a>',
        '<dialog id="drawerdiv1" class="offcanvas"></dialog>'
      ].join('')

      const target = fixtureEl.querySelector('a')

      const spy = spyOn(Offcanvas.prototype, 'toggle')

      target.click()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should call hide first, if another drawer is open', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<button id="btn2" data-coreui-toggle="offcanvas" data-coreui-target="#drawer2"></button>',
          '<dialog id="drawer1" class="offcanvas"></dialog>',
          '<dialog id="drawer2" class="offcanvas"></dialog>'
        ].join('')

        const trigger2 = fixtureEl.querySelector('#btn2')
        const drawerEl1 = document.querySelector('#drawer1')
        const drawerEl2 = document.querySelector('#drawer2')
        const drawer1 = new Offcanvas(drawerEl1)

        drawerEl1.addEventListener('shown.coreui.offcanvas', () => {
          trigger2.click()
        })
        drawerEl1.addEventListener('hidden.coreui.offcanvas', () => {
          expect(Offcanvas.getInstance(drawerEl2)).not.toBeNull()
          resolve()
        })
        drawer1.show()
      })
    })

    it('should focus on trigger element after closing drawer', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<button id="btn" data-coreui-toggle="offcanvas" data-coreui-target="#drawer"></button>',
          '<dialog id="drawer" class="offcanvas"></dialog>'
        ].join('')

        const trigger = fixtureEl.querySelector('#btn')
        const drawerEl = fixtureEl.querySelector('#drawer')
        const drawer = new Offcanvas(drawerEl)
        const spy = spyOn(trigger, 'focus')

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          drawer.hide()
        })
        drawerEl.addEventListener('hidden.coreui.offcanvas', () => {
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
          '<button id="btn" data-coreui-toggle="offcanvas" data-coreui-target="#drawer"></button>',
          '<dialog id="drawer" class="offcanvas"></dialog>'
        ].join('')

        const trigger = fixtureEl.querySelector('#btn')
        const drawerEl = fixtureEl.querySelector('#drawer')
        const drawer = new Offcanvas(drawerEl)
        const spy = spyOn(trigger, 'focus')

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          trigger.style.display = 'none'
          drawer.hide()
        })
        drawerEl.addEventListener('hidden.coreui.offcanvas', () => {
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
      fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')
      const drawer = new Offcanvas(drawerEl)

      expect(Offcanvas.getInstance(drawerEl)).toEqual(drawer)
      expect(Offcanvas.getInstance(drawerEl)).toBeInstanceOf(Offcanvas)
    })

    it('should return null when there is no drawer instance', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')

      expect(Offcanvas.getInstance(drawerEl)).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return drawer instance', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')
      const drawer = new Offcanvas(drawerEl)

      expect(Offcanvas.getOrCreateInstance(drawerEl)).toEqual(drawer)
      expect(Offcanvas.getInstance(drawerEl)).toEqual(Offcanvas.getOrCreateInstance(drawerEl, {}))
      expect(Offcanvas.getOrCreateInstance(drawerEl)).toBeInstanceOf(Offcanvas)
    })

    it('should return new instance when there is no Offcanvas instance', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')

      expect(Offcanvas.getInstance(drawerEl)).toBeNull()
      expect(Offcanvas.getOrCreateInstance(drawerEl)).toBeInstanceOf(Offcanvas)
    })

    it('should return new instance when there is no drawer instance with given configuration', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')

      expect(Offcanvas.getInstance(drawerEl)).toBeNull()
      const drawer = Offcanvas.getOrCreateInstance(drawerEl, {
        scroll: true
      })
      expect(drawer).toBeInstanceOf(Offcanvas)

      expect(drawer._config.scroll).toBeTrue()
    })

    it('should return the instance when exists without given configuration', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

      const drawerEl = fixtureEl.querySelector('dialog')
      const drawer = new Offcanvas(drawerEl, {
        scroll: true
      })
      expect(Offcanvas.getInstance(drawerEl)).toEqual(drawer)

      const drawer2 = Offcanvas.getOrCreateInstance(drawerEl, {
        scroll: false
      })
      expect(drawer).toBeInstanceOf(Offcanvas)
      expect(drawer2).toEqual(drawer)

      expect(drawer2._config.scroll).toBeTrue()
    })
  })

  describe('child component cleanup', () => {
    it('should hide tooltip instances inside drawer when drawer closes', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<dialog class="offcanvas">',
          '  <button data-coreui-toggle="tooltip" title="tip">Hover</button>',
          '</dialog>'
        ].join('')

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const tooltipTrigger = fixtureEl.querySelector('[data-coreui-toggle="tooltip"]')
        const drawer = new Offcanvas(drawerEl)

        const fakeTooltip = { hide: jasmine.createSpy('tooltipHide') }
        Data.set(tooltipTrigger, 'coreui.tooltip', fakeTooltip)

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          drawer.hide()
        })

        drawerEl.addEventListener('hidden.coreui.offcanvas', () => {
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
          '<dialog class="offcanvas">',
          '  <button data-coreui-toggle="popover" title="pop">Click</button>',
          '</dialog>'
        ].join('')

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const popoverTrigger = fixtureEl.querySelector('[data-coreui-toggle="popover"]')
        const drawer = new Offcanvas(drawerEl)

        const fakePopover = { hide: jasmine.createSpy('popoverHide') }
        Data.set(popoverTrigger, 'coreui.popover', fakePopover)

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          drawer.hide()
        })

        drawerEl.addEventListener('hidden.coreui.offcanvas', () => {
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
          '<dialog class="offcanvas">',
          '  <div class="toast show">Toast content</div>',
          '</dialog>'
        ].join('')

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const toastEl = fixtureEl.querySelector('.toast')
        const drawer = new Offcanvas(drawerEl)

        const fakeToast = { hide: jasmine.createSpy('toastHide') }
        Data.set(toastEl, 'coreui.toast', fakeToast)

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          drawer.hide()
        })

        drawerEl.addEventListener('hidden.coreui.offcanvas', () => {
          expect(fakeToast.hide).toHaveBeenCalled()
          Data.remove(toastEl, 'coreui.toast')
          resolve()
        })

        drawer.show()
      })
    })
  })

  describe('offcanvas-instant', () => {
    it('should show and fire shown event when offcanvas-instant class is present', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="offcanvas offcanvas-instant"></dialog>'

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl)

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          expect(drawer._isTransitioning).toBeFalse()
          expect(drawerEl.open).toBeTrue()
          resolve()
        })

        drawer.show()
      })
    })

    it('should not report as animated when offcanvas-instant is present', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas offcanvas-instant"></dialog>'

      const drawerEl = fixtureEl.querySelector('.offcanvas')
      const drawer = new Offcanvas(drawerEl)

      expect(drawer._isAnimated()).toBeFalse()
    })

    it('should report as animated when offcanvas-instant is not present', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

      const drawerEl = fixtureEl.querySelector('.offcanvas')
      const drawer = new Offcanvas(drawerEl)

      expect(drawer._isAnimated()).toBeTrue()
    })
  })

  describe('hiding class', () => {
    it('should add hiding class during hide and remove after hidden', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl)

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          drawer.hide()
          expect(drawerEl.classList.contains('hiding')).toBeTrue()
        })

        drawerEl.addEventListener('hidden.coreui.offcanvas', () => {
          expect(drawerEl.classList.contains('hiding')).toBeFalse()
          resolve()
        })

        drawer.show()
      })
    })
  })

  describe('offcanvas-static class', () => {
    it('should add offcanvas-static class when static backdrop is clicked, then remove it', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<dialog class="offcanvas"></dialog>'

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const drawer = new Offcanvas(drawerEl, {
          backdrop: 'static'
        })

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          const clickEvent = createEvent('click')
          Object.defineProperty(clickEvent, 'target', { value: drawerEl })
          drawerEl.dispatchEvent(clickEvent)

          expect(drawerEl.classList.contains('offcanvas-static')).toBeTrue()
          expect(drawerEl.classList.contains('dialog-static')).toBeFalse()

          setTimeout(() => {
            expect(drawerEl.classList.contains('offcanvas-static')).toBeFalse()
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
        fixtureEl.innerHTML = '<dialog class="offcanvas-lg"></dialog>'

        const drawerEl = fixtureEl.querySelector('dialog')
        const drawer = new Offcanvas(drawerEl)

        const spy = spyOn(drawer, 'hide')

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
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
          '<a href="#" data-coreui-toggle="offcanvas" data-coreui-target="#drawerEl">Toggle</a>',
          '<dialog id="drawerEl" class="offcanvas"></dialog>'
        ].join('')

        const drawerEl = fixtureEl.querySelector('.offcanvas')
        const trigger = fixtureEl.querySelector('[data-coreui-toggle="offcanvas"]')

        const spy = spyOn(Event.prototype, 'preventDefault').and.callThrough()

        drawerEl.addEventListener('shown.coreui.offcanvas', () => {
          expect(drawerEl.open).toBeTrue()
          expect(spy).toHaveBeenCalled()
          resolve()
        })

        trigger.click()
      })
    })
  })

  describe('jQueryInterface', () => {
    it('should create an offcanvas', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas offcanvas-start"></dialog>'

      const offcanvasEl = fixtureEl.querySelector('.offcanvas')

      jQueryMock.fn.offcanvas = Offcanvas.jQueryInterface
      jQueryMock.elements = [offcanvasEl]

      jQueryMock.fn.offcanvas.call(jQueryMock)

      expect(Offcanvas.getInstance(offcanvasEl)).not.toBeNull()
    })

    it('should not re create an offcanvas', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas offcanvas-start"></dialog>'

      const offcanvasEl = fixtureEl.querySelector('.offcanvas')
      const offcanvas = new Offcanvas(offcanvasEl)

      jQueryMock.fn.offcanvas = Offcanvas.jQueryInterface
      jQueryMock.elements = [offcanvasEl]

      jQueryMock.fn.offcanvas.call(jQueryMock)

      expect(Offcanvas.getInstance(offcanvasEl)).toEqual(offcanvas)
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas offcanvas-start"></dialog>'

      const offcanvasEl = fixtureEl.querySelector('.offcanvas')
      const action = 'undefinedMethod'

      jQueryMock.fn.offcanvas = Offcanvas.jQueryInterface
      jQueryMock.elements = [offcanvasEl]

      expect(() => {
        jQueryMock.fn.offcanvas.call(jQueryMock, action)
      }).toThrowError(TypeError, `No method named "${action}"`)
    })

    it('should call offcanvas method', () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas offcanvas-start"></dialog>'

      const offcanvasEl = fixtureEl.querySelector('.offcanvas')
      const offcanvas = new Offcanvas(offcanvasEl)

      jQueryMock.fn.offcanvas = Offcanvas.jQueryInterface
      jQueryMock.elements = [offcanvasEl]

      const spy = spyOn(offcanvas, 'show')

      jQueryMock.fn.offcanvas.call(jQueryMock, 'show')

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('legacy markup', () => {
    it('should rebuild v5 markup into a native <dialog> inside a shell', () => {
      fixtureEl.innerHTML = [
        '<div class="offcanvas offcanvas-start" id="legacyOffcanvas" data-coreui-backdrop="static" aria-labelledby="legacyLabel">',
        '  <div class="offcanvas-header"><h5 class="offcanvas-title" id="legacyLabel">Title</h5></div>',
        '  <div class="offcanvas-body">Body</div>',
        '</div>'
      ].join('')

      const legacyEl = fixtureEl.querySelector('#legacyOffcanvas')
      const offcanvas = new Offcanvas(legacyEl)

      const dialogEl = legacyEl.querySelector('dialog')
      expect(dialogEl).not.toBeNull()
      expect(offcanvas._element).toEqual(dialogEl)

      expect(dialogEl.id).toEqual('legacyOffcanvas')
      expect(dialogEl.getAttribute('data-coreui-backdrop')).toEqual('static')
      expect(dialogEl.classList.contains('offcanvas')).toBeTrue()
      expect(dialogEl.classList.contains('offcanvas-start')).toBeTrue()
      expect(dialogEl.querySelector('.offcanvas-header')).not.toBeNull()
      expect(dialogEl.querySelector('.offcanvas-body')).not.toBeNull()

      expect(legacyEl.hasAttribute('data-coreui-legacy-shell')).toBeTrue()
      expect(legacyEl.hasAttribute('id')).toBeFalse()
      expect(legacyEl.style.display).toEqual('contents')
    })

    it('should migrate responsive variants without the base class', () => {
      fixtureEl.innerHTML = [
        '<div class="offcanvas-lg offcanvas-end" id="legacyResponsive">',
        '  <div class="offcanvas-body">Body</div>',
        '</div>'
      ].join('')

      const legacyEl = fixtureEl.querySelector('#legacyResponsive')
      const offcanvas = new Offcanvas(legacyEl)

      expect(offcanvas._element instanceof HTMLDialogElement).toBeTrue()
      expect(offcanvas._element.classList.contains('offcanvas-lg')).toBeTrue()
      expect(offcanvas._element.classList.contains('offcanvas-end')).toBeTrue()
    })

    it('should keep events reachable through the pre-migration reference', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="offcanvas offcanvas-start"><div class="offcanvas-body"></div></div>'

        const legacyEl = fixtureEl.querySelector('.offcanvas')
        const offcanvas = new Offcanvas(legacyEl)

        legacyEl.addEventListener('shown.coreui.offcanvas', () => {
          expect(offcanvas._element.open).toBeTrue()
          resolve()
        })

        offcanvas.show()
      })
    })

    it('should resolve getInstance through the shell', () => {
      fixtureEl.innerHTML = '<div class="offcanvas offcanvas-start"><div class="offcanvas-body"></div></div>'

      const legacyEl = fixtureEl.querySelector('.offcanvas')
      const offcanvas = new Offcanvas(legacyEl)

      expect(Offcanvas.getInstance(legacyEl)).toEqual(offcanvas)
      expect(Offcanvas.getOrCreateInstance(legacyEl)).toEqual(offcanvas)
    })
  })
})

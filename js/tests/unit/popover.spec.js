import EventHandler from '../../src/dom/event-handler.js'
import Popover from '../../src/popover.js'
import {
  clearFixture, createEvent, getFixture, jQueryMock
} from '../helpers/fixture.js'

describe('Popover', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()

    const popoverList = document.querySelectorAll('.popover')

    for (const popoverEl of popoverList) {
      popoverEl.remove()
    }
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Popover.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(Popover.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(Popover.NAME).toEqual(jasmine.any(String))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Popover.DATA_KEY).toEqual('coreui.popover')
    })
  })

  describe('EVENT_KEY', () => {
    it('should return plugin event key', () => {
      expect(Popover.EVENT_KEY).toEqual('.coreui.popover')
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type', () => {
      expect(Popover.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('show', () => {
    it('should toggle a popover after show', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="https://x.com/getbootstrap">BS X</a>'

        const popoverEl = fixtureEl.querySelector('a')
        const popover = new Popover(popoverEl)

        popoverEl.addEventListener('shown.coreui.popover', () => {
          expect(document.querySelector('.popover')).not.toBeNull()
          popover.toggle()
        })
        popoverEl.addEventListener('hidden.coreui.popover', () => {
          expect(document.querySelector('.popover')).toBeNull()
          resolve()
        })

        popover.show()
      })
    })

    it('should show a popover', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="https://x.com/getbootstrap">BS X</a>'

        const popoverEl = fixtureEl.querySelector('a')
        const popover = new Popover(popoverEl)

        popoverEl.addEventListener('shown.coreui.popover', () => {
          expect(document.querySelector('.popover')).not.toBeNull()
          resolve()
        })

        popover.show()
      })
    })

    it('should set title and content from functions', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#">BS X</a>'

        const popoverEl = fixtureEl.querySelector('a')
        const popover = new Popover(popoverEl, {
          title: () => 'Bootstrap',
          content: () => 'loves writing tests （╯°□°）╯︵ ┻━┻'
        })

        popoverEl.addEventListener('shown.coreui.popover', () => {
          const popoverDisplayed = document.querySelector('.popover')

          expect(popoverDisplayed).not.toBeNull()
          expect(popoverDisplayed.querySelector('.popover-header').textContent).toEqual('Bootstrap')
          expect(popoverDisplayed.querySelector('.popover-body').textContent).toEqual('loves writing tests （╯°□°）╯︵ ┻━┻')
          resolve()
        })

        popover.show()
      })
    })

    it('should call content and title functions with trigger element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" data-foo="bar">BS X</a>'

        const popoverEl = fixtureEl.querySelector('a')
        const popover = new Popover(popoverEl, {
          title(el) {
            return el.dataset.foo
          },
          content(el) {
            return el.dataset.foo
          }
        })

        popoverEl.addEventListener('shown.coreui.popover', () => {
          const popoverDisplayed = document.querySelector('.popover')

          expect(popoverDisplayed).not.toBeNull()
          expect(popoverDisplayed.querySelector('.popover-header').textContent).toEqual('bar')
          expect(popoverDisplayed.querySelector('.popover-body').textContent).toEqual('bar')
          resolve()
        })

        popover.show()
      })
    })

    it('should call content and title functions with correct this value', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" data-foo="bar">BS X</a>'

        const popoverEl = fixtureEl.querySelector('a')
        const popover = new Popover(popoverEl, {
          title() {
            return this.dataset.foo
          },
          content() {
            return this.dataset.foo
          }
        })

        popoverEl.addEventListener('shown.coreui.popover', () => {
          const popoverDisplayed = document.querySelector('.popover')

          expect(popoverDisplayed).not.toBeNull()
          expect(popoverDisplayed.querySelector('.popover-header').textContent).toEqual('bar')
          expect(popoverDisplayed.querySelector('.popover-body').textContent).toEqual('bar')
          resolve()
        })

        popover.show()
      })
    })

    it('should show a popover with just content without having header', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#">Nice link</a>'

        const popoverEl = fixtureEl.querySelector('a')
        const popover = new Popover(popoverEl, {
          content: 'Some beautiful content :)'
        })

        popoverEl.addEventListener('shown.coreui.popover', () => {
          const popoverDisplayed = document.querySelector('.popover')

          expect(popoverDisplayed).not.toBeNull()
          expect(popoverDisplayed.querySelector('.popover-header')).toBeNull()
          expect(popoverDisplayed.querySelector('.popover-body').textContent).toEqual('Some beautiful content :)')
          resolve()
        })

        popover.show()
      })
    })

    it('should show a popover whose content was set only via setContent()', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#">Nice link</a>'

        const popoverEl = fixtureEl.querySelector('a')
        const popover = new Popover(popoverEl, {})

        popover.setContent({ '.popover-header': 'Late header', '.popover-body': 'Late content' })

        popoverEl.addEventListener('shown.coreui.popover', () => {
          const popoverDisplayed = document.querySelector('.popover')

          expect(popoverDisplayed).not.toBeNull()
          expect(popoverDisplayed.querySelector('.popover-body').textContent).toEqual('Late content')
          resolve()
        })

        popover.show()
      })
    })

    it('should show a popover with just title without having body', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#">Nice link</a>'

        const popoverEl = fixtureEl.querySelector('a')
        const popover = new Popover(popoverEl, {
          title: 'Title which does not require content'
        })

        popoverEl.addEventListener('shown.coreui.popover', () => {
          const popoverDisplayed = document.querySelector('.popover')

          expect(popoverDisplayed).not.toBeNull()
          expect(popoverDisplayed.querySelector('.popover-body')).toBeNull()
          expect(popoverDisplayed.querySelector('.popover-header').textContent).toEqual('Title which does not require content')
          resolve()
        })

        popover.show()
      })
    })

    it('should show a popover with just title without having body using data-attribute to get config', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" data-coreui-content="" title="Title which does not require content">Nice link</a>'

        const popoverEl = fixtureEl.querySelector('a')
        const popover = new Popover(popoverEl)

        popoverEl.addEventListener('shown.coreui.popover', () => {
          const popoverDisplayed = document.querySelector('.popover')

          expect(popoverDisplayed).not.toBeNull()
          expect(popoverDisplayed.querySelector('.popover-body')).toBeNull()
          expect(popoverDisplayed.querySelector('.popover-header').textContent).toEqual('Title which does not require content')
          resolve()
        })

        popover.show()
      })
    })

    it('should NOT show a popover without `title` and `content`', () => {
      fixtureEl.innerHTML = '<a href="#" data-coreui-content="" title="">Nice link</a>'

      const popoverEl = fixtureEl.querySelector('a')
      const popover = new Popover(popoverEl, { animation: false })
      const spy = spyOn(EventHandler, 'trigger').and.callThrough()

      popover.show()

      expect(spy).not.toHaveBeenCalledWith(popoverEl, Popover.eventName('show'))
      expect(document.querySelector('.popover')).toBeNull()
    })

    it('"setContent" should keep the initial template', () => {
      fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="https://x.com/getbootstrap" data-coreui-custom-class="custom-class">BS X</a>'

      const popoverEl = fixtureEl.querySelector('a')
      const popover = new Popover(popoverEl)

      popover.setContent({ '.tooltip-inner': 'foo' })
      const tip = popover._getTipElement()

      expect(tip).toHaveClass('popover')
      expect(tip).toHaveClass('bs-popover-auto')
      expect(tip.querySelector('.popover-arrow')).not.toBeNull()
      expect(tip.querySelector('.popover-header')).not.toBeNull()
      expect(tip.querySelector('.popover-body')).not.toBeNull()
    })

    it('should call setContent once', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#">BS X</a>'

        const popoverEl = fixtureEl.querySelector('a')
        const popover = new Popover(popoverEl, {
          content: 'Popover content'
        })
        expect(popover._templateFactory).toBeNull()
        let spy = null
        let times = 1

        popoverEl.addEventListener('hidden.coreui.popover', () => {
          popover.show()
        })

        popoverEl.addEventListener('shown.coreui.popover', () => {
          spy = spy || spyOn(popover._templateFactory, 'constructor').and.callThrough()
          const popoverDisplayed = document.querySelector('.popover')

          expect(popoverDisplayed).not.toBeNull()
          expect(popoverDisplayed.querySelector('.popover-body').textContent).toEqual('Popover content')
          expect(spy).toHaveBeenCalledTimes(0)
          if (times > 1) {
            resolve()
          }

          times++
          popover.hide()
        })
        popover.show()
      })
    })

    it('should show a popover with provided custom class', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="https://x.com/getbootstrap" data-coreui-custom-class="custom-class">BS X</a>'

        const popoverEl = fixtureEl.querySelector('a')
        const popover = new Popover(popoverEl)

        popoverEl.addEventListener('shown.coreui.popover', () => {
          const tip = document.querySelector('.popover')
          expect(tip).not.toBeNull()
          expect(tip).toHaveClass('custom-class')
          resolve()
        })

        popover.show()
      })
    })

    it('should keep popover open when mouse leaves after click trigger', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="https://x.com/getbootstrap" data-coreui-trigger="hover click">BS X</a>'

        const popoverEl = fixtureEl.querySelector('a')
        new Popover(popoverEl) // eslint-disable-line no-new

        popoverEl.addEventListener('shown.coreui.popover', () => {
          popoverEl.dispatchEvent(createEvent('mouseout'))

          popoverEl.addEventListener('hide.coreui.popover', () => {
            throw new Error('Popover should not hide when mouse leaves after click')
          })

          expect(document.querySelector('.popover')).not.toBeNull()
          resolve()
        })

        popoverEl.click()
      })
    })
  })

  describe('hide', () => {
    it('should hide a popover', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="https://x.com/getbootstrap">BS X</a>'

        const popoverEl = fixtureEl.querySelector('a')
        const popover = new Popover(popoverEl)

        popoverEl.addEventListener('shown.coreui.popover', () => {
          popover.hide()
        })

        popoverEl.addEventListener('hidden.coreui.popover', () => {
          expect(document.querySelector('.popover')).toBeNull()
          resolve()
        })

        popover.show()
      })
    })
  })

  describe('dismiss on next click', () => {
    const settle = () => new Promise(resolve => {
      setTimeout(resolve, 20)
    })

    const press = (element, type = 'pointerdown') => {
      element.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true }))
    }

    const blur = (element, relatedTarget = null) => {
      element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget }))
    }

    const showPopover = async (popoverEl, options = {}) => {
      const popover = new Popover(popoverEl, {
        trigger: 'focus',
        html: true,
        content: 'Selectable text <a href="#inside" class="inside-link">Inside</a>',
        ...options
      })
      const shown = new Promise(resolve => {
        popoverEl.addEventListener('shown.coreui.popover', resolve, { once: true })
      })

      popoverEl.dispatchEvent(createEvent('focusin'))
      await shown

      return { popover, popoverEl, tip: document.querySelector('.popover') }
    }

    const showFocused = async (options = {}) => {
      fixtureEl.innerHTML = '<a href="#" tabindex="0">Dismissible</a><button type="button" class="outside">Outside</button>'

      return showPopover(fixtureEl.querySelector('a'), options)
    }

    it('should stay open when a press inside the popover takes focus from the trigger', async () => {
      const { popover, popoverEl, tip } = await showFocused()

      press(tip.querySelector('.popover-body'))
      blur(popoverEl)
      press(document, 'pointerup')
      tip.querySelector('.popover-body').click()
      await settle()

      expect(popover._activeTrigger.focus).toBeTrue()
      expect(tip).toHaveClass('show')
    })

    it('should stay open when a tap inside the popover takes focus after the release', async () => {
      const { popoverEl, tip } = await showFocused()

      press(tip.querySelector('.popover-body'))
      press(document, 'pointerup')
      blur(popoverEl)
      tip.querySelector('.popover-body').click()
      await settle()

      expect(tip).toHaveClass('show')
    })

    it('should stay open when a press inside the popover takes focus from a link in it', async () => {
      const { popover, tip } = await showFocused()

      press(tip.querySelector('.popover-body'))
      blur(tip.querySelector('.inside-link'))
      await settle()

      expect(popover._activeTrigger.focus).toBeTrue()
      expect(tip).toHaveClass('show')
    })

    it('should stay open when focus moves from the trigger into the popover', async () => {
      const { popover, popoverEl, tip } = await showFocused()

      blur(popoverEl, tip.querySelector('.inside-link'))
      await settle()

      expect(popover._activeTrigger.focus).toBeTrue()
      expect(tip).toHaveClass('show')
    })

    it('should hide when focus leaves the trigger for content outside the popover', async () => {
      const { popoverEl } = await showFocused()
      const hidden = new Promise(resolve => {
        popoverEl.addEventListener('hidden.coreui.popover', resolve, { once: true })
      })

      blur(popoverEl, document.body)
      await hidden

      expect(document.querySelector('.popover')).toBeNull()
    })

    it('should hide when focus leaves a link inside the popover for content outside it', async () => {
      const { popoverEl, tip } = await showFocused()
      const hidden = new Promise(resolve => {
        popoverEl.addEventListener('hidden.coreui.popover', resolve, { once: true })
      })

      blur(tip.querySelector('.inside-link'), document.body)
      await hidden

      expect(document.querySelector('.popover')).toBeNull()
    })

    it('should hide on the next click outside after a press inside the popover', async () => {
      const { popoverEl, tip } = await showFocused()
      const hidden = new Promise(resolve => {
        popoverEl.addEventListener('hidden.coreui.popover', resolve, { once: true })
      })

      press(tip.querySelector('.popover-body'))
      blur(popoverEl)
      tip.querySelector('.popover-body').click()
      await settle()

      expect(tip).toHaveClass('show')

      press(document.body)
      document.body.click()
      await hidden

      expect(document.querySelector('.popover')).toBeNull()
    })

    it('should hide when focus moves outside after a press inside the popover', async () => {
      const { popoverEl, tip } = await showFocused()
      const hidden = new Promise(resolve => {
        popoverEl.addEventListener('hidden.coreui.popover', resolve, { once: true })
      })

      press(tip.querySelector('.popover-body'))
      blur(popoverEl)
      tip.querySelector('.popover-body').click()
      fixtureEl.querySelector('.outside').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      await hidden

      expect(document.querySelector('.popover')).toBeNull()
    })

    it('should hide when focus leaves the trigger after a press that was cancelled', async () => {
      const { popoverEl, tip } = await showFocused()
      const hidden = new Promise(resolve => {
        popoverEl.addEventListener('hidden.coreui.popover', resolve, { once: true })
      })

      press(tip.querySelector('.popover-body'))
      press(document, 'pointercancel')
      blur(popoverEl)
      await hidden

      expect(document.querySelector('.popover')).toBeNull()
    })

    it('should stay open when a press outside never becomes a click', async () => {
      const { tip } = await showFocused()

      press(document.body)
      press(document, 'pointercancel')
      await settle()

      expect(tip).toHaveClass('show')
    })

    it('should stay open on a click outside while the trigger keeps focus', async () => {
      fixtureEl.innerHTML = '<a href="#" tabindex="0">Dismissible</a>'

      const popoverEl = fixtureEl.querySelector('a')
      popoverEl.focus()

      const { tip } = await showPopover(popoverEl)

      press(document.body)
      document.body.click()
      await settle()

      expect(document.activeElement).toBe(popoverEl)
      expect(tip).toHaveClass('show')
    })

    it('should stay open on a click outside when it was shown from code', async () => {
      fixtureEl.innerHTML = '<a href="#" tabindex="0">Dismissible</a>'

      const popoverEl = fixtureEl.querySelector('a')
      const popover = new Popover(popoverEl, { trigger: 'focus', content: 'Popover' })
      const shown = new Promise(resolve => {
        popoverEl.addEventListener('shown.coreui.popover', resolve, { once: true })
      })

      popover.show()
      await shown
      press(document.body)
      document.body.click()
      await settle()

      expect(document.querySelector('.popover')).toHaveClass('show')
    })

    it('should hide a hover and focus popover when a press inside is dragged out of it', async () => {
      fixtureEl.innerHTML = '<a href="#" tabindex="0">Dismissible</a>'

      const popoverEl = fixtureEl.querySelector('a')
      // eslint-disable-next-line no-new
      new Popover(popoverEl, { trigger: 'hover focus', content: 'Selectable text' })
      const shown = new Promise(resolve => {
        popoverEl.addEventListener('shown.coreui.popover', resolve, { once: true })
      })

      popoverEl.dispatchEvent(createEvent('mouseover'))
      await shown

      const tip = document.querySelector('.popover')
      const hidden = new Promise(resolve => {
        popoverEl.addEventListener('hidden.coreui.popover', resolve, { once: true })
      })

      press(tip.querySelector('.popover-body'))
      tip.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }))
      await hidden

      expect(document.querySelector('.popover')).toBeNull()
    })

    it('should stay open when the trigger inside a shadow root is pressed', async () => {
      fixtureEl.innerHTML = '<div></div>'

      const shadowRoot = fixtureEl.querySelector('div').attachShadow({ mode: 'open' })
      shadowRoot.innerHTML = '<a href="#" tabindex="0">Dismissible</a>'

      const { tip } = await showPopover(shadowRoot.querySelector('a'))

      press(shadowRoot.querySelector('a'))
      shadowRoot.querySelector('a').click()
      await settle()

      expect(tip).toHaveClass('show')
    })

    it('should stay open when a trigger with its own shadow root is pressed', async () => {
      fixtureEl.innerHTML = '<span tabindex="0"></span>'

      const host = fixtureEl.querySelector('span')
      host.attachShadow({ mode: 'open' }).innerHTML = '<b>Dismissible</b>'

      const { tip } = await showPopover(host)

      press(host.shadowRoot.querySelector('b'))
      host.shadowRoot.querySelector('b').click()
      await settle()

      expect(tip).toHaveClass('show')
    })

    it('should stay open when the focused trigger inside a closed shadow root is pressed', async () => {
      fixtureEl.innerHTML = '<div></div>'

      const shadowRoot = fixtureEl.querySelector('div').attachShadow({ mode: 'closed' })
      shadowRoot.innerHTML = '<a href="#" tabindex="0">Dismissible</a>'

      const popoverEl = shadowRoot.querySelector('a')
      popoverEl.focus()

      const { tip } = await showPopover(popoverEl)

      press(popoverEl)
      popoverEl.click()
      await settle()

      expect(tip).toHaveClass('show')
    })

    it('should stay open when a press inside a custom template without a tooltip role takes focus from the trigger', async () => {
      const { popoverEl, tip } = await showFocused({
        template: '<div class="popover"><div class="popover-arrow"></div><div class="popover-body"></div></div>'
      })

      expect(tip).not.toHaveAttribute('role')

      press(tip.querySelector('.popover-body'))
      blur(popoverEl)
      tip.querySelector('.popover-body').click()
      await settle()

      expect(tip).toHaveClass('show')
    })

    it('should stay open when a label inside the popover toggles a control that takes no focus', async () => {
      const { popoverEl, tip } = await showFocused({
        sanitize: false,
        content: '<input type="checkbox" id="toggle" hidden><label for="toggle">Toggle</label>'
      })
      const label = tip.querySelector('label')

      press(label)
      blur(popoverEl)
      label.click()
      await settle()

      expect(tip.querySelector('input').checked).toBeTrue()
      expect(tip).toHaveClass('show')
    })

    it('should stay open when focus moves to a link in the popover and the next click lands outside', async () => {
      const { tip } = await showFocused()

      tip.querySelector('.inside-link').focus()
      press(document.body)
      document.body.click()
      await settle()

      expect(document.activeElement).toBe(tip.querySelector('.inside-link'))
      expect(tip).toHaveClass('show')
    })

    it('should hide a hover-opened popover on mouseleave after a press inside moved focus off a link in it', async () => {
      fixtureEl.innerHTML = '<a href="#" tabindex="0">Dismissible</a>'

      const popoverEl = fixtureEl.querySelector('a')
      const popover = new Popover(popoverEl, {
        trigger: 'hover focus',
        html: true,
        content: 'Selectable text <a href="#inside" class="inside-link">Inside</a>'
      })
      const shown = new Promise(resolve => {
        popoverEl.addEventListener('shown.coreui.popover', resolve, { once: true })
      })

      popoverEl.dispatchEvent(createEvent('mouseover'))
      await shown

      const tip = document.querySelector('.popover')
      const hidden = new Promise(resolve => {
        popoverEl.addEventListener('hidden.coreui.popover', resolve, { once: true })
      })

      press(tip.querySelector('.popover-body'))
      blur(tip.querySelector('.inside-link'))
      tip.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }))
      await hidden

      expect(popover._activeTrigger.focus).toBeFalsy()
      expect(document.querySelector('.popover')).toBeNull()
    })

    it('should hide a hover and focus popover when a press on the trigger is dragged off it', async () => {
      fixtureEl.innerHTML = '<a href="#" tabindex="0">Dismissible</a>'

      const popoverEl = fixtureEl.querySelector('a')
      // eslint-disable-next-line no-new
      new Popover(popoverEl, { trigger: 'hover focus', content: 'Popover' })
      const shown = new Promise(resolve => {
        popoverEl.addEventListener('shown.coreui.popover', resolve, { once: true })
      })

      popoverEl.dispatchEvent(createEvent('mouseover'))
      await shown

      const hidden = new Promise(resolve => {
        popoverEl.addEventListener('hidden.coreui.popover', resolve, { once: true })
      })

      press(popoverEl)
      popoverEl.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }))
      await hidden

      expect(document.querySelector('.popover')).toBeNull()
    })

    it('should keep both popovers open when a press inside a nested popover takes focus from its trigger', async () => {
      fixtureEl.innerHTML = '<a href="#" tabindex="0">Outer</a>'

      const nestedTrigger = document.createElement('button')
      nestedTrigger.type = 'button'
      nestedTrigger.textContent = 'Inner'

      const outerEl = fixtureEl.querySelector('a')
      const { tip: outerTip } = await showPopover(outerEl, { content: nestedTrigger })
      const inner = new Popover(nestedTrigger, { trigger: 'focus', content: 'Selectable text' })
      const innerShown = new Promise(resolve => {
        nestedTrigger.addEventListener('shown.coreui.popover', resolve, { once: true })
      })

      blur(outerEl, nestedTrigger)
      nestedTrigger.dispatchEvent(createEvent('focusin', { bubbles: true }))
      await innerShown

      const innerTip = inner._getTipElement()

      press(innerTip.querySelector('.popover-body'))
      blur(nestedTrigger)
      innerTip.querySelector('.popover-body').click()
      await settle()

      expect(outerTip).toHaveClass('show')
      expect(innerTip).toHaveClass('show')
      expect(nestedTrigger.isConnected).toBeTrue()

      inner.dispose()
    })

    it('should not watch the document for a popover without the focus trigger', async () => {
      fixtureEl.innerHTML = '<a href="#">Click me</a>'

      const popoverEl = fixtureEl.querySelector('a')
      const popover = new Popover(popoverEl, { trigger: 'click', content: 'Popover' })
      const addSpy = spyOn(document, 'addEventListener').and.callThrough()
      const shown = new Promise(resolve => {
        popoverEl.addEventListener('shown.coreui.popover', resolve, { once: true })
      })

      popover.show()
      await shown

      expect(addSpy).not.toHaveBeenCalledWith('focusin', jasmine.any(Function), true)
    })

    it('should watch the document once while shown and stop once hidden or disposed', async () => {
      fixtureEl.innerHTML = '<a href="#" tabindex="0">Dismissible</a>'

      const popoverEl = fixtureEl.querySelector('a')
      const addSpy = spyOn(document, 'addEventListener').and.callThrough()
      const { popover } = await showPopover(popoverEl)

      await popover.show()

      expect(addSpy.calls.allArgs().filter(([type]) => type === 'focusin')).toHaveSize(1)

      const removeSpy = spyOn(document, 'removeEventListener').and.callThrough()
      const hidden = new Promise(resolve => {
        popoverEl.addEventListener('hidden.coreui.popover', resolve, { once: true })
      })

      popover.hide()
      await hidden

      for (const type of ['pointerdown', 'pointercancel', 'click', 'focusin']) {
        expect(removeSpy).toHaveBeenCalledWith(type, jasmine.any(Function), true)
      }

      removeSpy.calls.reset()
      await popover.show()

      expect(addSpy.calls.allArgs().filter(([type]) => type === 'focusin')).toHaveSize(2)

      popover.dispose()

      for (const type of ['pointerdown', 'pointercancel', 'click', 'focusin']) {
        expect(removeSpy).toHaveBeenCalledWith(type, jasmine.any(Function), true)
      }
    })

    it('should forget a press inside once the popover hides', async () => {
      const { popover, popoverEl, tip } = await showFocused()
      const hidden = new Promise(resolve => {
        popoverEl.addEventListener('hidden.coreui.popover', resolve, { once: true })
      })

      press(tip.querySelector('.popover-body'))
      popover.hide()
      await hidden

      const shownAgain = new Promise(resolve => {
        popoverEl.addEventListener('shown.coreui.popover', resolve, { once: true })
      })

      popoverEl.dispatchEvent(createEvent('focusin'))
      await shownAgain

      const hiddenAgain = new Promise(resolve => {
        popoverEl.addEventListener('hidden.coreui.popover', resolve, { once: true })
      })

      blur(popoverEl)
      await hiddenAgain

      expect(document.querySelector('.popover')).toBeNull()
    })
  })

  describe('getInstance', () => {
    it('should return popover instance', () => {
      fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="https://x.com/getbootstrap">BS X</a>'

      const popoverEl = fixtureEl.querySelector('a')
      const popover = new Popover(popoverEl)

      expect(Popover.getInstance(popoverEl)).toEqual(popover)
      expect(Popover.getInstance(popoverEl)).toBeInstanceOf(Popover)
    })

    it('should return null when there is no popover instance', () => {
      fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="https://x.com/getbootstrap">BS X</a>'

      const popoverEl = fixtureEl.querySelector('a')

      expect(Popover.getInstance(popoverEl)).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return popover instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const popover = new Popover(div)

      expect(Popover.getOrCreateInstance(div)).toEqual(popover)
      expect(Popover.getInstance(div)).toEqual(Popover.getOrCreateInstance(div, {}))
      expect(Popover.getOrCreateInstance(div)).toBeInstanceOf(Popover)
    })

    it('should return new instance when there is no popover instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Popover.getInstance(div)).toBeNull()
      expect(Popover.getOrCreateInstance(div)).toBeInstanceOf(Popover)
    })

    it('should return new instance when there is no popover instance with given configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Popover.getInstance(div)).toBeNull()
      const popover = Popover.getOrCreateInstance(div, {
        placement: 'top'
      })
      expect(popover).toBeInstanceOf(Popover)

      expect(popover._config.placement).toEqual('top')
    })

    it('should return the instance when exists without given configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const popover = new Popover(div, {
        placement: 'top'
      })
      expect(Popover.getInstance(div)).toEqual(popover)

      const popover2 = Popover.getOrCreateInstance(div, {
        placement: 'bottom'
      })
      expect(popover).toBeInstanceOf(Popover)
      expect(popover2).toEqual(popover)

      expect(popover2._config.placement).toEqual('top')
    })
  })

  describe('data-api', () => {
    it('should toggle popover on click via data-api', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<a href="#" data-coreui-toggle="popover" title="Popover Title" data-coreui-content="Popover content">Click me</a>'

        const popoverEl = fixtureEl.querySelector('[data-coreui-toggle="popover"]')

        popoverEl.addEventListener('shown.coreui.popover', () => {
          expect(document.querySelector('.popover')).not.toBeNull()
          resolve()
        })

        popoverEl.click()
      })
    })

    it('should do nothing when clicking on element without data-coreui-toggle', () => {
      fixtureEl.innerHTML = '<a href="#" title="Not a popover">Click me</a>'

      const linkEl = fixtureEl.querySelector('a')
      linkEl.click()

      expect(document.querySelector('.popover')).toBeNull()
      expect(Popover.getInstance(linkEl)).toBeNull()
    })

    it('should show popover on focusin via data-api', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button data-coreui-toggle="popover" data-coreui-trigger="focus" title="Popover Title" data-coreui-content="Popover content">Focus me</button>'

        const popoverEl = fixtureEl.querySelector('[data-coreui-toggle="popover"]')

        popoverEl.addEventListener('shown.coreui.popover', () => {
          expect(document.querySelector('.popover')).not.toBeNull()
          resolve()
        })

        const focusEvent = createEvent('focusin')
        popoverEl.dispatchEvent(focusEvent)
      })
    })

    it('should prevent default on click via data-api', () => {
      fixtureEl.innerHTML = '<a href="#test" data-coreui-toggle="popover" title="Popover Title" data-coreui-content="Popover content">Click me</a>'

      const popoverEl = fixtureEl.querySelector('[data-coreui-toggle="popover"]')
      const clickEvent = createEvent('click')
      const preventDefaultSpy = spyOn(clickEvent, 'preventDefault').and.callThrough()

      popoverEl.dispatchEvent(clickEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('jQueryInterface', () => {
    it('should create a popover', () => {
      fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="https://x.com/getbootstrap">BS X</a>'

      const popoverEl = fixtureEl.querySelector('a')

      jQueryMock.fn.popover = Popover.jQueryInterface
      jQueryMock.elements = [popoverEl]

      jQueryMock.fn.popover.call(jQueryMock)

      expect(Popover.getInstance(popoverEl)).not.toBeNull()
    })
    it('should pass the arguments to the method', () => {
      fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="content">BS X</a>'

      const popoverEl = fixtureEl.querySelector('a')

      jQueryMock.fn.popover = Popover.jQueryInterface
      jQueryMock.elements = [popoverEl]

      const instance = Popover.getOrCreateInstance(popoverEl)
      const spy = spyOn(instance, 'setContent')

      jQueryMock.fn.popover.call(jQueryMock, 'setContent', { '.popover-body': 'x' })

      expect(spy).toHaveBeenCalledWith({ '.popover-body': 'x' })
      instance.dispose()
    })

    it('should create a popover with a config object', () => {
      fixtureEl.innerHTML = '<a href="#" title="Popover">BS X</a>'

      const popoverEl = fixtureEl.querySelector('a')

      jQueryMock.fn.popover = Popover.jQueryInterface
      jQueryMock.elements = [popoverEl]

      jQueryMock.fn.popover.call(jQueryMock, {
        content: 'Popover content'
      })

      expect(Popover.getInstance(popoverEl)).not.toBeNull()
    })

    it('should not re create a popover', () => {
      fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="https://x.com/getbootstrap">BS X</a>'

      const popoverEl = fixtureEl.querySelector('a')
      const popover = new Popover(popoverEl)

      jQueryMock.fn.popover = Popover.jQueryInterface
      jQueryMock.elements = [popoverEl]

      jQueryMock.fn.popover.call(jQueryMock)

      expect(Popover.getInstance(popoverEl)).toEqual(popover)
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="https://x.com/getbootstrap">BS X</a>'

      const popoverEl = fixtureEl.querySelector('a')
      const action = 'undefinedMethod'

      jQueryMock.fn.popover = Popover.jQueryInterface
      jQueryMock.elements = [popoverEl]

      expect(() => {
        jQueryMock.fn.popover.call(jQueryMock, action)
      }).toThrowError(TypeError, `No method named "${action}"`)
    })

    it('should should call show method', () => {
      fixtureEl.innerHTML = '<a href="#" title="Popover" data-coreui-content="https://x.com/getbootstrap">BS X</a>'

      const popoverEl = fixtureEl.querySelector('a')
      const popover = new Popover(popoverEl)

      jQueryMock.fn.popover = Popover.jQueryInterface
      jQueryMock.elements = [popoverEl]

      const spy = spyOn(popover, 'show')

      jQueryMock.fn.popover.call(jQueryMock, 'show')

      expect(spy).toHaveBeenCalled()
    })
  })
})

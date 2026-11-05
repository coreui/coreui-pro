import EventHandler from '../../src/dom/event-handler.js'
import Dropdown from '../../src/dropdown.js'
import Modal from '../../src/modal.js'
import Popover from '../../src/popover.js'
import Tooltip from '../../src/tooltip.js'
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

  describe('layer stack', () => {
    const wait = (ms = 50) => new Promise(resolve => {
      setTimeout(resolve, ms)
    })

    const pressEscape = target => {
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      target.dispatchEvent(event)
      return event
    }

    const dropdownMarkup = item => [
      '<div class="dropdown">',
      '  <button type="button" class="btn dropdown-toggle" data-coreui-toggle="dropdown">Dropdown</button>',
      `  <div class="dropdown-menu">${item}</div>`,
      '</div>'
    ].join('')

    afterEach(() => {
      for (const element of document.querySelectorAll('.tooltip')) {
        element.remove()
      }
    })

    it('should close only the tooltip on a control inside a popover with the first Escape', async () => {
      fixtureEl.innerHTML = '<button type="button" class="open">Open</button>'

      const popover = new Popover(fixtureEl.querySelector('.open'), {
        animation: false, html: true, sanitize: false, trigger: 'click',
        content: '<button type="button" class="inner" title="Delete">X</button>'
      })
      popover.show()
      await wait()
      const inner = document.querySelector('.popover .inner')
      const tooltip = new Tooltip(inner, { animation: false })
      inner.focus()
      tooltip.show()
      await wait()

      pressEscape(inner)
      await wait()

      expect(document.querySelector('.tooltip')).toBeNull()
      expect(document.querySelector('.popover.show')).not.toBeNull()

      pressEscape(document.activeElement)
      await wait()

      expect(document.querySelector('.popover')).toBeNull()
      tooltip.dispose()
    })

    it('should close a hover tooltip and keep the modal open when the focus is in another field', async () => {
      fixtureEl.innerHTML = '<dialog class="modal"><input class="field"><button type="button" class="tip" title="Tip">T</button></dialog>'

      const dialogEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(dialogEl)
      const shown = new Promise(resolve => {
        dialogEl.addEventListener('shown.coreui.modal', resolve, { once: true })
      })
      modal.show()
      await shown
      const tooltip = new Tooltip(dialogEl.querySelector('.tip'), { animation: false, trigger: 'hover' })
      dialogEl.querySelector('.field').focus()
      tooltip.show()
      await wait()

      const event = pressEscape(dialogEl.querySelector('.field'))
      await wait()

      expect(event.defaultPrevented).toBeTrue()
      expect(dialogEl.open).toBeTrue()
      expect(document.querySelector('.tooltip')).toBeNull()
      tooltip.dispose()
      modal.dispose()
    })

    it('should close the menu when its item with a shown tooltip is clicked', async () => {
      fixtureEl.innerHTML = dropdownMarkup('<button type="button" class="dropdown-item" title="Tip">Item</button>')

      const dropdown = new Dropdown(fixtureEl.querySelector('[data-coreui-toggle="dropdown"]'))
      dropdown.show()
      await wait()
      const item = fixtureEl.querySelector('.dropdown-item')
      const tooltip = new Tooltip(item, { animation: false })
      tooltip.show()
      await wait()

      item.click()
      await wait()

      expect(fixtureEl.querySelector('.dropdown-menu')).not.toHaveClass('show')
      tooltip.dispose()
    })

    it('should hide a tooltip in the menu when the dropdown closes', async () => {
      fixtureEl.innerHTML = dropdownMarkup('<button type="button" class="dropdown-item" title="Tip">Item</button>')

      const dropdown = new Dropdown(fixtureEl.querySelector('[data-coreui-toggle="dropdown"]'))
      dropdown.show()
      await wait()
      const tooltip = new Tooltip(fixtureEl.querySelector('.dropdown-item'), { animation: false })
      tooltip.show()
      await wait()

      dropdown.hide()
      await wait()

      expect(document.querySelector('.tooltip')).toBeNull()
      tooltip.dispose()
    })

    it('should close a popover from inside after its content is replaced, and keep the modal open', async () => {
      fixtureEl.innerHTML = '<dialog class="modal"><button type="button" class="open">Open</button></dialog>'

      const dialogEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(dialogEl)
      const shown = new Promise(resolve => {
        dialogEl.addEventListener('shown.coreui.modal', resolve, { once: true })
      })
      modal.show()
      await shown
      const popover = new Popover(dialogEl.querySelector('.open'), {
        animation: false, html: true, sanitize: false, trigger: 'click',
        content: '<button type="button" class="inner">X</button>'
      })
      dialogEl.querySelector('.open').click()
      await wait()
      popover.setContent({ '.popover-body': '<a href="#" class="replaced">Y</a>' })
      await wait()
      document.querySelector('.popover .replaced').focus()

      const event = pressEscape(document.activeElement)
      await wait()

      expect(event.defaultPrevented).toBeTrue()
      expect(document.querySelector('.popover')).toBeNull()
      expect(dialogEl.open).toBeTrue()
      popover.dispose()
      modal.dispose()
    })

    it('should keep a shown tooltip and an open dropdown open when the other one opens', async () => {
      fixtureEl.innerHTML = `<button type="button" class="tip" title="Tip">T</button>${dropdownMarkup('<a class="dropdown-item" href="#">Item</a>')}`

      const tooltip = new Tooltip(fixtureEl.querySelector('.tip'), { animation: false, trigger: 'manual' })
      const dropdown = new Dropdown(fixtureEl.querySelector('[data-coreui-toggle="dropdown"]'))
      tooltip.show()
      await wait()
      dropdown.show()
      await wait()

      expect(document.querySelector('.tooltip.show')).not.toBeNull()

      tooltip.hide()
      await wait()
      tooltip.show()
      await wait()

      expect(fixtureEl.querySelector('.dropdown-menu')).toHaveClass('show')
      tooltip.dispose()
    })

    it('should close the tooltip on a dropdown toggle before the dropdown', async () => {
      fixtureEl.innerHTML = dropdownMarkup('<a class="dropdown-item" href="#">Item</a>')

      const toggle = fixtureEl.querySelector('[data-coreui-toggle="dropdown"]')
      toggle.setAttribute('title', 'Tip')
      const dropdown = new Dropdown(toggle)
      dropdown.show()
      await wait()
      const tooltip = new Tooltip(toggle, { animation: false, trigger: 'manual' })
      tooltip.show()
      await wait()
      toggle.focus()

      pressEscape(toggle)
      await wait()

      expect(document.querySelector('.tooltip')).toBeNull()
      expect(fixtureEl.querySelector('.dropdown-menu')).toHaveClass('show')
      tooltip.dispose()
    })

    it('should close the tooltip on a dropdown toggle first also when the dropdown opens after it', async () => {
      fixtureEl.innerHTML = dropdownMarkup('<a class="dropdown-item" href="#">Item</a>')

      const toggle = fixtureEl.querySelector('[data-coreui-toggle="dropdown"]')
      toggle.setAttribute('title', 'Tip')
      const tooltip = new Tooltip(toggle, { animation: false, trigger: 'manual' })
      const dropdown = new Dropdown(toggle)
      tooltip.show()
      await wait()
      dropdown.show()
      await wait()
      toggle.focus()

      pressEscape(toggle)
      await wait()

      expect(document.querySelector('.tooltip')).toBeNull()
      expect(fixtureEl.querySelector('.dropdown-menu')).toHaveClass('show')
      tooltip.dispose()
    })

    it('should not move the focus to its trigger when the dialog it is in closes', async () => {
      fixtureEl.innerHTML = '<dialog class="modal"><button type="button" class="open">Open</button></dialog>'

      const dialogEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(dialogEl)
      const shown = new Promise(resolve => {
        dialogEl.addEventListener('shown.coreui.modal', resolve, { once: true })
      })
      modal.show()
      await shown
      const trigger = dialogEl.querySelector('.open')
      const popover = new Popover(trigger, {
        animation: false, html: true, sanitize: false, trigger: 'click',
        content: '<button type="button" class="inner">X</button>'
      })
      popover.show()
      await wait()
      document.querySelector('.popover .inner').focus()
      const focus = spyOn(trigger, 'focus').and.callThrough()

      modal.hide()
      await wait(400)

      expect(document.querySelector('.popover')).toBeNull()
      expect(focus).not.toHaveBeenCalled()
      popover.dispose()
      modal.dispose()
    })

    it('should leave the layer stack when disposed while shown', async () => {
      fixtureEl.innerHTML = '<button type="button" class="tip" title="Tip">T</button>'

      const { stack } = globalThis[Symbol.for('coreui.layers')]
      const before = stack.length
      const tooltip = new Tooltip(fixtureEl.querySelector('.tip'), { animation: false })
      tooltip.show()
      await wait()

      expect(stack.length).toBe(before + 1)

      tooltip.dispose()

      expect(stack.length).toBe(before)
    })
  })

  describe('focus return', () => {
    const shownPopover = async (options = {}) => {
      fixtureEl.innerHTML = '<button type="button" class="trigger">Trigger</button><button type="button" class="outside">Outside</button>'

      const trigger = fixtureEl.querySelector('.trigger')
      const popover = new Popover(trigger, {
        animation: false,
        content: '<button type="button" class="inside">Inside</button>',
        html: true,
        sanitize: false,
        ...options
      })
      const shown = new Promise(resolve => {
        trigger.addEventListener('shown.coreui.popover', resolve, { once: true })
      })

      popover.show()
      await shown

      return { popover, trigger, tip: document.querySelector('.popover') }
    }

    const hidden = trigger => new Promise(resolve => {
      trigger.addEventListener('hidden.coreui.popover', resolve, { once: true })
    })

    const pressEscape = () => {
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    }

    it('should hand the focus back to the trigger when it hides with the focus inside', async () => {
      const { trigger, tip } = await shownPopover()
      const describedBy = []
      trigger.addEventListener('focus', () => describedBy.push(trigger.getAttribute('aria-describedby')))

      tip.querySelector('.inside').focus()
      const done = hidden(trigger)
      pressEscape()
      await done

      expect(document.activeElement).toEqual(trigger)
      expect(describedBy).toEqual([null])
      expect(document.querySelector('.popover')).toBeNull()
    })

    it('should keep the description the trigger was given when it hands the focus back', async () => {
      const { trigger, tip } = await shownPopover()
      trigger.setAttribute('aria-describedby', `hint ${trigger.getAttribute('aria-describedby')}`)
      const describedBy = []
      trigger.addEventListener('focus', () => describedBy.push(trigger.getAttribute('aria-describedby')))

      tip.querySelector('.inside').focus()
      const done = hidden(trigger)
      pressEscape()
      await done

      expect(describedBy).toEqual(['hint'])
      expect(trigger.getAttribute('aria-describedby')).toEqual('hint')
    })

    it('should stay hidden when the focus it hands back reaches a focus trigger', async () => {
      const { trigger, tip } = await shownPopover({ trigger: 'focus' })

      tip.querySelector('.inside').focus()
      const done = hidden(trigger)
      pressEscape()
      await done
      await new Promise(resolve => {
        setTimeout(resolve, 20)
      })

      expect(document.activeElement).toEqual(trigger)
      expect(document.querySelector('.popover')).toBeNull()
    })

    it('should leave the focus where it is when it is outside the popover', async () => {
      const { popover, trigger } = await shownPopover()
      const outside = fixtureEl.querySelector('.outside')

      outside.focus()
      const done = hidden(trigger)
      popover.hide()
      await done

      expect(document.activeElement).toEqual(outside)
    })

    it('should hand the focus back when the page hides it with the focus inside', async () => {
      const { popover, trigger, tip } = await shownPopover()
      const focus = spyOn(trigger, 'focus').and.callThrough()

      tip.querySelector('.inside').focus()
      const done = hidden(trigger)
      popover.hide()
      await done

      expect(document.activeElement).toEqual(trigger)
      expect(focus).toHaveBeenCalledWith(undefined)
    })

    it('should keep the focus inside when the page vetoes the hide', async () => {
      const { popover, trigger, tip } = await shownPopover()
      const inside = tip.querySelector('.inside')
      trigger.addEventListener('hide.coreui.popover', event => event.preventDefault())

      inside.focus()
      popover.hide()

      expect(document.activeElement).toEqual(inside)
      expect(tip).toHaveClass('show')
    })

    it('should leave the focus on the body when it is there as the popover hides', async () => {
      const { popover, trigger, tip } = await shownPopover()

      tip.querySelector('.inside').focus()
      document.activeElement.blur()
      const done = hidden(trigger)
      popover.hide()
      await done

      expect(document.activeElement).toEqual(document.body)
    })

    it('should not focus a trigger that is disabled', async () => {
      const { popover, trigger, tip } = await shownPopover()

      tip.querySelector('.inside').focus()
      trigger.classList.add('disabled')
      const done = hidden(trigger)
      popover.hide()
      await done

      expect(document.activeElement).not.toEqual(trigger)
    })

    it('should hand the focus back once the hide delay has passed', async () => {
      const { trigger, tip } = await shownPopover({ delay: { show: 0, hide: 300 }, trigger: 'hover' })
      const inside = tip.querySelector('.inside')

      inside.focus()
      trigger.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }))
      await new Promise(resolve => {
        setTimeout(resolve, 100)
      })

      expect(document.activeElement).toEqual(inside)

      await hidden(trigger)

      expect(document.activeElement).toEqual(trigger)
    })

    it('should hand the focus back to an SVG trigger', async () => {
      fixtureEl.innerHTML = '<svg class="icon" tabindex="0" width="16" height="16"></svg>'

      const trigger = fixtureEl.querySelector('.icon')
      const popover = new Popover(trigger, {
        animation: false,
        content: '<button type="button" class="inside">Inside</button>',
        html: true,
        sanitize: false
      })
      const shown = new Promise(resolve => {
        trigger.addEventListener('shown.coreui.popover', resolve, { once: true })
      })
      popover.show()
      await shown

      document.querySelector('.popover .inside').focus()
      const done = hidden(trigger)
      popover.hide()
      await done

      expect(document.activeElement).toEqual(trigger)
    })

    it('should leave the focus alone when the document has no focus', async () => {
      const { popover, trigger, tip } = await shownPopover()
      const inside = tip.querySelector('.inside')

      inside.focus()
      spyOn(document, 'hasFocus').and.returnValue(false)
      const focus = spyOn(trigger, 'focus')
      popover.hide()

      expect(focus).not.toHaveBeenCalled()
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

  describe('anchors', () => {
    const wait = (element, name) => new Promise(resolve => {
      element.addEventListener(`${name}.coreui.popover`, resolve, { once: true })
    })

    it('should take the title and content of the anchor it opens on and move on a click on another one', async () => {
      fixtureEl.innerHTML = '<div id="list"><button type="button" id="a" data-coreui-title="Row 1" data-coreui-content="First">A</button><button type="button" id="b" data-coreui-title="Row 2" data-coreui-content="Second">B</button></div>'
      const list = fixtureEl.querySelector('#list')
      const popover = new Popover(list, { anchors: 'button' })
      const shown = wait(list, 'shown')

      fixtureEl.querySelector('#a').click()
      await shown
      const tip = document.querySelector('.popover')

      expect(tip.querySelector('.popover-header').textContent).toBe('Row 1')
      expect(tip.querySelector('.popover-body').textContent).toBe('First')

      const moved = wait(list, 'moved')
      fixtureEl.querySelector('#b').click()
      await moved

      expect(document.querySelector('.popover')).toBe(tip)
      expect(tip.querySelector('.popover-header').textContent).toBe('Row 2')
      expect(tip.querySelector('.popover-body').textContent).toBe('Second')
      popover.dispose()
    })

    it('should keep the popover while the pointer heads to it across another anchor on hover', async () => {
      fixtureEl.innerHTML = '<style>.popover { position: absolute; }</style><div id="list" style="position: fixed; left: 40px; top: 120px;"><button type="button" id="a" data-coreui-title="Row 1" data-coreui-content="First">A</button><button type="button" id="b" data-coreui-title="Row 2" data-coreui-content="Second">B</button></div>'
      const list = fixtureEl.querySelector('#list')
      const a = fixtureEl.querySelector('#a')
      const b = fixtureEl.querySelector('#b')
      const popover = new Popover(list, { anchors: 'button', trigger: 'hover' })
      const shown = wait(list, 'shown')
      a.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
      await shown
      const moves = []
      list.addEventListener('move.coreui.popover', event => moves.push(event.relatedTarget))
      const tip = document.querySelector('.popover')
      const rect = b.getBoundingClientRect()
      const exit = { x: rect.left, y: rect.top + (rect.height / 2) }
      const edge = tip.getBoundingClientRect()

      a.dispatchEvent(new MouseEvent('mouseout', {
        bubbles: true, clientX: exit.x, clientY: exit.y, relatedTarget: b
      }))
      b.dispatchEvent(new MouseEvent('mouseover', {
        bubbles: true, clientX: exit.x, clientY: exit.y, relatedTarget: a
      }))
      document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: (exit.x + edge.left) / 2, clientY: exit.y }))

      expect(tip.getAttribute('data-coreui-placement')).toBe('right')
      expect(moves).toEqual([])

      document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: exit.x + 2, clientY: rect.bottom + 20 }))

      expect(moves).toEqual([b])
      popover.dispose()
    })

    it('should rebuild a header the previous anchor left out', async () => {
      fixtureEl.innerHTML = '<div id="list"><button type="button" id="a" data-coreui-content="First">A</button><button type="button" id="b" data-coreui-title="Row 2" data-coreui-content="Second">B</button></div>'
      const list = fixtureEl.querySelector('#list')
      const popover = new Popover(list, { anchors: 'button' })
      const shown = wait(list, 'shown')
      fixtureEl.querySelector('#a').click()
      await shown

      expect(document.querySelector('.popover-header')).toBeNull()

      const moved = wait(list, 'moved')
      fixtureEl.querySelector('#b').click()
      await moved

      expect(document.querySelector('.popover-header').textContent).toBe('Row 2')
      popover.dispose()
    })

    it('should hand the focus to the new anchor when it was in the popover', async () => {
      fixtureEl.innerHTML = '<div id="list"><button type="button" id="a" data-coreui-content="<a href=&quot;#&quot;>Link</a>">A</button><button type="button" id="b" data-coreui-content="Second">B</button></div>'
      const list = fixtureEl.querySelector('#list')
      const b = fixtureEl.querySelector('#b')
      const popover = new Popover(list, { anchors: 'button', html: true })
      const shown = wait(list, 'shown')
      fixtureEl.querySelector('#a').click()
      await shown
      document.querySelector('.popover a').focus()

      const moved = wait(list, 'moved')
      b.click()
      await moved

      expect(document.activeElement).toBe(b)
      popover.dispose()
    })

    it('should close on a click on the anchor it stands at', async () => {
      fixtureEl.innerHTML = '<div id="list"><button type="button" id="a" data-coreui-content="First">A</button></div>'
      const list = fixtureEl.querySelector('#list')
      const popover = new Popover(list, { anchors: 'button' })
      const shown = wait(list, 'shown')
      fixtureEl.querySelector('#a').click()
      await shown

      const hidden = wait(list, 'hidden')
      fixtureEl.querySelector('#a').click()
      await hidden

      expect(document.querySelector('.popover')).toBeNull()
      popover.dispose()
    })

    it('should hand the focus back to the anchor it moved to', async () => {
      fixtureEl.innerHTML = '<div id="list"><button type="button" id="a" data-coreui-content="First">A</button><button type="button" id="b" data-coreui-content="<a href=&quot;#&quot;>Link</a>">B</button></div>'
      const list = fixtureEl.querySelector('#list')
      const b = fixtureEl.querySelector('#b')
      const popover = new Popover(list, { anchors: 'button', html: true })
      const shown = wait(list, 'shown')
      fixtureEl.querySelector('#a').click()
      await shown
      const moved = wait(list, 'moved')
      b.click()
      await moved
      document.querySelector('.popover a').focus()

      const hidden = wait(list, 'hidden')
      document.querySelector('.popover a').dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
      await hidden

      expect(document.activeElement).toBe(b)
      popover.dispose()
    })

    it('should hand the focus to the anchor when content set from code replaces what held it', async () => {
      fixtureEl.innerHTML = '<div id="list"><button type="button" id="a" data-coreui-content="<a href=&quot;#&quot;>Link</a>">A</button></div>'
      const list = fixtureEl.querySelector('#list')
      const a = fixtureEl.querySelector('#a')
      const popover = new Popover(list, { anchors: 'button', html: true })
      const shown = wait(list, 'shown')
      a.click()
      await shown
      document.querySelector('.popover a').focus()

      popover.setContent({ '.popover-body': 'Saved' })

      expect(document.activeElement).toBe(a)
      expect(document.querySelector('.popover-body').textContent).toBe('Saved')
      popover.dispose()
    })

    it('should keep the default action of a link in the wrapper when an ancestor matches the anchors', () => {
      fixtureEl.innerHTML = '<div class="row"><div data-coreui-toggle="popover" data-coreui-anchors=".row"><a href="#other" id="link">Other</a></div></div>'
      const click = new MouseEvent('click', { bubbles: true, cancelable: true })

      fixtureEl.querySelector('#link').dispatchEvent(click)

      expect(click.defaultPrevented).toBeFalse()
      Popover.getInstance(fixtureEl.querySelector('[data-coreui-anchors]'))?.dispose()
    })

    it('should prevent the default action of a click only on an anchor of the data API wrapper', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="popover" data-coreui-anchors="button"><button type="button" data-coreui-content="x">A</button><a href="#other" id="link">Other</a></div>'
      const link = fixtureEl.querySelector('#link')
      const button = fixtureEl.querySelector('button')
      const linkClick = new MouseEvent('click', { bubbles: true, cancelable: true })
      const buttonClick = new MouseEvent('click', { bubbles: true, cancelable: true })

      link.dispatchEvent(linkClick)
      button.dispatchEvent(buttonClick)

      expect(linkClick.defaultPrevented).toBeFalse()
      expect(buttonClick.defaultPrevented).toBeTrue()
      Popover.getInstance(fixtureEl.querySelector('div')).dispose()
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

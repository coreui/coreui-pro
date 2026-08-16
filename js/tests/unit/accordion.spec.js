import Accordion from '../../src/accordion.js'
import EventHandler from '../../src/dom/event-handler.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('Accordion', () => {
  let fixtureEl

  const markup = (name = 'group') => [
    '<div class="accordion">',
    `  <details class="accordion-item" name="${name}" open>`,
    '    <summary class="accordion-header">Item 1</summary>',
    '    <div class="accordion-body">Body 1</div>',
    '  </details>',
    `  <details class="accordion-item" name="${name}">`,
    '    <summary class="accordion-header">Item 2</summary>',
    '    <div class="accordion-body">Body 2</div>',
    '  </details>',
    '</div>'
  ].join('')

  // The suite runs in Chromium, where `interpolate-size` is supported and the
  // data API therefore stands aside. Force the fallback path to exercise it.
  const withoutNativeAnimation = () => {
    const original = CSS.supports.bind(CSS)

    spyOn(CSS, 'supports').and.callFake((property, value) =>
      property === 'interpolate-size' ? false : original(property, value)
    )
  }

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Accordion.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Accordion.DATA_KEY).toEqual('coreui.accordion')
    })
  })

  describe('constructor', () => {
    it('should take care of element either passed as a CSS selector or DOM element', () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelector('.accordion-item')
      const accordionBySelector = new Accordion('.accordion-item')
      const accordionByElement = new Accordion(itemEl)

      expect(accordionBySelector._element).toEqual(itemEl)
      expect(accordionByElement._element).toEqual(itemEl)
    })
  })

  describe('show', () => {
    it('should open a closed item and fire shown', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(itemEl)
      const shown = new Promise(resolve => {
        EventHandler.on(itemEl, 'shown.coreui.accordion', resolve)
      })

      await accordion.show()
      await shown

      expect(itemEl.open).toBeTrue()
    })

    it('should do nothing on an already open item', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelector('.accordion-item')
      const accordion = new Accordion(itemEl)
      const spy = jasmine.createSpy('show')

      EventHandler.on(itemEl, 'show.coreui.accordion', spy)

      await accordion.show()

      expect(spy).not.toHaveBeenCalled()
      expect(itemEl.open).toBeTrue()
    })

    it('should not open when the show event is prevented', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(itemEl)

      EventHandler.on(itemEl, 'show.coreui.accordion', event => event.preventDefault())

      await accordion.show()

      expect(itemEl.open).toBeFalse()
    })

    it('should close a sibling sharing the same name', async () => {
      fixtureEl.innerHTML = markup()

      const [firstEl, secondEl] = fixtureEl.querySelectorAll('.accordion-item')
      const hidden = new Promise(resolve => {
        EventHandler.on(firstEl, 'hidden.coreui.accordion', resolve)
      })

      await new Accordion(secondEl).show()
      await hidden

      expect(secondEl.open).toBeTrue()
      expect(firstEl.open).toBeFalse()
    })

    it('should leave a sibling without a shared name alone', async () => {
      fixtureEl.innerHTML = markup().replaceAll(' name="group"', '')

      const [firstEl, secondEl] = fixtureEl.querySelectorAll('.accordion-item')

      await new Accordion(secondEl).show()

      expect(secondEl.open).toBeTrue()
      expect(firstEl.open).toBeTrue()
    })
  })

  describe('hide', () => {
    it('should close an open item and fire hidden', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelector('.accordion-item')
      const accordion = new Accordion(itemEl)
      const hidden = new Promise(resolve => {
        EventHandler.on(itemEl, 'hidden.coreui.accordion', resolve)
      })

      await accordion.hide()
      await hidden

      expect(itemEl.open).toBeFalse()
    })

    it('should do nothing on an already closed item', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(itemEl)
      const spy = jasmine.createSpy('hide')

      EventHandler.on(itemEl, 'hide.coreui.accordion', spy)

      await accordion.hide()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should not close when the hide event is prevented', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelector('.accordion-item')
      const accordion = new Accordion(itemEl)

      EventHandler.on(itemEl, 'hide.coreui.accordion', event => event.preventDefault())

      await accordion.hide()

      expect(itemEl.open).toBeTrue()
    })

    it('should clear the animating attribute once finished', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelector('.accordion-item')

      await new Accordion(itemEl).hide()

      expect(itemEl.hasAttribute('data-coreui-accordion-animating')).toBeFalse()
    })
  })

  describe('toggle', () => {
    it('should toggle the open state', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(itemEl)

      await accordion.toggle()
      expect(itemEl.open).toBeTrue()

      await accordion.toggle()
      expect(itemEl.open).toBeFalse()
    })
  })

  describe('dispose', () => {
    it('should remove the animating attribute', () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelector('.accordion-item')
      const accordion = new Accordion(itemEl)

      itemEl.setAttribute('data-coreui-accordion-animating', '')
      accordion.dispose()

      expect(itemEl.hasAttribute('data-coreui-accordion-animating')).toBeFalse()
      expect(Accordion.getInstance(itemEl)).toBeNull()
    })
  })

  describe('data-api', () => {
    it('should stand aside where CSS animates the panel', () => {
      fixtureEl.innerHTML = markup()

      const summaryEl = fixtureEl.querySelectorAll('.accordion-header')[1]
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })

      summaryEl.dispatchEvent(event)

      expect(event.defaultPrevented).toBeFalse()
      expect(Accordion.getInstance(summaryEl.parentElement)).toBeNull()
    })

    it('should toggle an item where CSS cannot', async () => {
      withoutNativeAnimation()
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const shown = new Promise(resolve => {
        EventHandler.on(itemEl, 'shown.coreui.accordion', resolve)
      })

      itemEl.querySelector('.accordion-header').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      await shown

      expect(itemEl.open).toBeTrue()
    })

    it('should leave a control inside the summary to itself', () => {
      withoutNativeAnimation()
      fixtureEl.innerHTML = [
        '<div class="accordion">',
        '  <details class="accordion-item">',
        '    <summary class="accordion-header">Item <a href="#target">link</a></summary>',
        '    <div class="accordion-body">Body</div>',
        '  </details>',
        '</div>'
      ].join('')

      const itemEl = fixtureEl.querySelector('.accordion-item')

      itemEl.querySelector('a').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(Accordion.getInstance(itemEl)).toBeNull()
    })
  })

  describe('jQueryInterface', () => {
    it('should toggle an item', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const shown = new Promise(resolve => {
        EventHandler.on(itemEl, 'shown.coreui.accordion', resolve)
      })

      jQueryMock.fn.accordion = Accordion.jQueryInterface
      jQueryMock.elements = [itemEl]
      jQueryMock.fn.accordion.call(jQueryMock, 'show')

      await shown

      expect(itemEl.open).toBeTrue()
    })

    it('should throw an error on an undefined method', () => {
      fixtureEl.innerHTML = markup()

      jQueryMock.fn.accordion = Accordion.jQueryInterface
      jQueryMock.elements = [fixtureEl.querySelector('.accordion-item')]

      expect(() => {
        jQueryMock.fn.accordion.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })
})

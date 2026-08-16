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

      const accordionEl = fixtureEl.querySelector('.accordion')
      const accordionBySelector = new Accordion('.accordion')
      const accordionByElement = new Accordion(accordionEl)

      expect(accordionBySelector._element).toEqual(accordionEl)
      expect(accordionByElement._element).toEqual(accordionEl)
    })
  })

  describe('show', () => {
    it('should open a closed item and fire shown', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const shown = new Promise(resolve => {
        EventHandler.on(itemEl, 'shown.coreui.accordion', resolve)
      })

      await accordion.show(itemEl)
      await shown

      expect(itemEl.open).toBeTrue()
    })

    it('should take an index', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))

      await accordion.show(1)

      expect(itemEl.open).toBeTrue()
    })

    it('should do nothing on an already open item', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelector('.accordion-item')
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const spy = jasmine.createSpy('shown')

      EventHandler.on(itemEl, 'shown.coreui.accordion', spy)

      await accordion.show(itemEl)

      expect(spy).not.toHaveBeenCalled()
      expect(itemEl.open).toBeTrue()
    })

    it('should ignore an item that belongs to another accordion', async () => {
      fixtureEl.innerHTML = markup() + markup('other')

      const [firstEl, secondEl] = fixtureEl.querySelectorAll('.accordion')
      const strangerEl = secondEl.querySelectorAll('.accordion-item')[1]

      await new Accordion(firstEl).show(strangerEl)

      expect(strangerEl.open).toBeFalse()
    })

    it('should close a sibling sharing the same name', async () => {
      fixtureEl.innerHTML = markup()

      const [firstEl, secondEl] = fixtureEl.querySelectorAll('.accordion-item')
      const hidden = new Promise(resolve => {
        EventHandler.on(firstEl, 'hidden.coreui.accordion', resolve)
      })

      await new Accordion(fixtureEl.querySelector('.accordion')).show(secondEl)
      await hidden

      expect(secondEl.open).toBeTrue()
      expect(firstEl.open).toBeFalse()
    })

    it('should leave a sibling without a shared name alone', async () => {
      fixtureEl.innerHTML = markup().replaceAll(' name="group"', '')

      const [firstEl, secondEl] = fixtureEl.querySelectorAll('.accordion-item')

      await new Accordion(fixtureEl.querySelector('.accordion')).show(secondEl)

      expect(secondEl.open).toBeTrue()
      expect(firstEl.open).toBeTrue()
    })
  })

  describe('hide', () => {
    it('should close an open item and fire hidden', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelector('.accordion-item')
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const hidden = new Promise(resolve => {
        EventHandler.on(itemEl, 'hidden.coreui.accordion', resolve)
      })

      await accordion.hide(itemEl)
      await hidden

      expect(itemEl.open).toBeFalse()
    })

    it('should do nothing on an already closed item', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const spy = jasmine.createSpy('hidden')

      EventHandler.on(itemEl, 'hidden.coreui.accordion', spy)

      await accordion.hide(itemEl)

      expect(spy).not.toHaveBeenCalled()
    })

    it('should clear the animating attribute once finished', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelector('.accordion-item')

      await new Accordion(fixtureEl.querySelector('.accordion')).hide(itemEl)

      expect(itemEl.hasAttribute('data-coreui-accordion-animating')).toBeFalse()
    })
  })

  describe('toggle', () => {
    it('should toggle the open state', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))

      await accordion.toggle(itemEl)
      expect(itemEl.open).toBeTrue()

      await accordion.toggle(itemEl)
      expect(itemEl.open).toBeFalse()
    })
  })

  describe('showAll / hideAll', () => {
    it('should open every item of an exclusive accordion', async () => {
      fixtureEl.innerHTML = markup()

      const items = [...fixtureEl.querySelectorAll('.accordion-item')]

      await new Accordion(fixtureEl.querySelector('.accordion')).showAll()

      expect(items.every(item => item.open)).toBeTrue()
      expect(items.every(item => !item.hasAttribute('name'))).toBeTrue()
    })

    it('should close every item and put the grouping back', async () => {
      fixtureEl.innerHTML = markup()

      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const items = [...fixtureEl.querySelectorAll('.accordion-item')]

      await accordion.showAll()
      await accordion.hideAll()

      expect(items.some(item => item.open)).toBeFalse()
      expect(items.every(item => item.getAttribute('name') === 'group')).toBeTrue()
      expect(items.every(item => !item.hasAttribute('data-coreui-accordion-name'))).toBeTrue()
    })

    it('should leave an accordion without a name alone', async () => {
      fixtureEl.innerHTML = markup().replaceAll(' name="group"', '')

      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const items = [...fixtureEl.querySelectorAll('.accordion-item')]

      await accordion.showAll()
      expect(items.every(item => item.open)).toBeTrue()

      await accordion.hideAll()
      expect(items.some(item => item.open)).toBeFalse()
      expect(items.some(item => item.hasAttribute('name'))).toBeFalse()
    })

    it('should not reach into a nested accordion', async () => {
      fixtureEl.innerHTML = [
        '<div class="accordion" id="outer">',
        '  <details class="accordion-item" name="outer">',
        '    <summary class="accordion-header">Outer</summary>',
        '    <div class="accordion-body">',
        '      <div class="accordion" id="inner">',
        '        <details class="accordion-item" name="inner">',
        '          <summary class="accordion-header">Inner</summary>',
        '          <div class="accordion-body">Inner body</div>',
        '        </details>',
        '      </div>',
        '    </div>',
        '  </details>',
        '</div>'
      ].join('')

      await new Accordion('#outer').showAll()

      expect(fixtureEl.querySelector('#outer > .accordion-item').open).toBeTrue()
      expect(fixtureEl.querySelector('#inner > .accordion-item').open).toBeFalse()
      expect(fixtureEl.querySelector('#inner > .accordion-item').getAttribute('name')).toEqual('inner')
    })
  })

  describe('dispose', () => {
    it('should remove the animating attribute from its items', () => {
      fixtureEl.innerHTML = markup()

      const accordionEl = fixtureEl.querySelector('.accordion')
      const itemEl = fixtureEl.querySelector('.accordion-item')
      const accordion = new Accordion(accordionEl)

      itemEl.setAttribute('data-coreui-accordion-animating', '')
      accordion.dispose()

      expect(itemEl.hasAttribute('data-coreui-accordion-animating')).toBeFalse()
      expect(Accordion.getInstance(accordionEl)).toBeNull()
    })
  })

  describe('events', () => {
    it('should mirror the native toggle where CSS animates the panel, without instantiating', async () => {
      fixtureEl.innerHTML = markup()

      const accordionEl = fixtureEl.querySelector('.accordion')
      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const shown = new Promise(resolve => {
        EventHandler.on(itemEl, 'shown.coreui.accordion', resolve)
      })

      itemEl.querySelector('.accordion-header').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      await shown

      expect(itemEl.open).toBeTrue()
      expect(Accordion.getInstance(accordionEl)).toBeNull()
    })

    it('should be delegatable, unlike the native toggle', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const delegated = new Promise(resolve => {
        EventHandler.on(document, 'shown.coreui.accordion', resolve)
      })

      itemEl.querySelector('.accordion-header').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      await delegated

      EventHandler.off(document, 'shown.coreui.accordion')
      expect(itemEl.open).toBeTrue()
    })

    it('should fire hidden when the item closes', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelector('.accordion-item')
      const hidden = new Promise(resolve => {
        EventHandler.on(itemEl, 'hidden.coreui.accordion', resolve)
      })

      itemEl.querySelector('.accordion-header').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      await hidden

      expect(itemEl.open).toBeFalse()
    })
  })

  describe('data-api', () => {
    it('should leave the item to the browser where CSS animates the panel', () => {
      fixtureEl.innerHTML = markup()

      const summaryEl = fixtureEl.querySelectorAll('.accordion-header')[1]
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })

      summaryEl.dispatchEvent(event)

      expect(event.defaultPrevented).toBeFalse()
      expect(Accordion.getInstance(fixtureEl.querySelector('.accordion'))).toBeNull()
    })

    it('should toggle an item where CSS cannot, instantiating on the container', async () => {
      withoutNativeAnimation()
      fixtureEl.innerHTML = markup()

      const accordionEl = fixtureEl.querySelector('.accordion')
      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const shown = new Promise(resolve => {
        EventHandler.on(itemEl, 'shown.coreui.accordion', resolve)
      })

      itemEl.querySelector('.accordion-header').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      await shown

      expect(itemEl.open).toBeTrue()
      expect(Accordion.getInstance(accordionEl)).not.toBeNull()
    })

    it('should leave the item closed when the click is already prevented', () => {
      withoutNativeAnimation()
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const summaryEl = itemEl.querySelector('.accordion-header')

      summaryEl.addEventListener('click', event => event.preventDefault())
      summaryEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(itemEl.open).toBeFalse()
      expect(Accordion.getInstance(fixtureEl.querySelector('.accordion'))).toBeNull()
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

      expect(Accordion.getInstance(fixtureEl.querySelector('.accordion'))).toBeNull()
    })
  })

  describe('jQueryInterface', () => {
    it('should open every item', async () => {
      fixtureEl.innerHTML = markup()

      const accordionEl = fixtureEl.querySelector('.accordion')
      const items = [...fixtureEl.querySelectorAll('.accordion-item')]
      const shown = new Promise(resolve => {
        EventHandler.on(items[1], 'shown.coreui.accordion', resolve)
      })

      jQueryMock.fn.accordion = Accordion.jQueryInterface
      jQueryMock.elements = [accordionEl]
      jQueryMock.fn.accordion.call(jQueryMock, 'showAll')

      await shown

      expect(items.every(item => item.open)).toBeTrue()
    })

    it('should forward arguments', async () => {
      fixtureEl.innerHTML = markup()

      const accordionEl = fixtureEl.querySelector('.accordion')
      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const shown = new Promise(resolve => {
        EventHandler.on(itemEl, 'shown.coreui.accordion', resolve)
      })

      jQueryMock.fn.accordion = Accordion.jQueryInterface
      jQueryMock.elements = [accordionEl]
      jQueryMock.fn.accordion.call(jQueryMock, 'show', 1)

      await shown

      expect(itemEl.open).toBeTrue()
    })

    it('should throw an error on an undefined method', () => {
      fixtureEl.innerHTML = markup()

      jQueryMock.fn.accordion = Accordion.jQueryInterface
      jQueryMock.elements = [fixtureEl.querySelector('.accordion')]

      expect(() => {
        jQueryMock.fn.accordion.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })
})

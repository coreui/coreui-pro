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

  const withContentTransition = () => {
    const style = document.createElement('style')
    style.textContent = '.accordion-item::details-content { transition: block-size 100ms }'
    fixtureEl.append(style)
  }

  const threeItems = () => [
    '<div class="accordion">',
    ...['open', '', ''].map((open, index) => `  <details class="accordion-item" name="group" ${open}><summary class="accordion-header">Item ${index + 1}</summary><div class="accordion-body">Body</div></details>`),
    '</div>'
  ].join('')

  const click = itemEl => itemEl.querySelector('.accordion-header').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  const record = (itemEl, log) => {
    for (const type of ['show', 'shown', 'hide', 'hidden']) {
      EventHandler.on(itemEl, `${type}.coreui.accordion`, () => log.push(`${type}:${itemEl.open}`))
    }
  }

  const wait = delay => new Promise(resolve => {
    setTimeout(resolve, delay)
  })

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
      expect(accordionBySelector._element).toEqual(accordionEl)

      const accordionByElement = new Accordion(accordionEl)
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

    it('should run the transition the stylesheet declares and clean up after it', async () => {
      withoutNativeAnimation()
      fixtureEl.innerHTML = [
        '<style>',
        '  .accordion-item[data-coreui-accordion-animating] { overflow: clip; transition: block-size 200ms linear }',
        '  .accordion-body { block-size: 120px }',
        '</style>',
        markup()
      ].join('')

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const collapsed = itemEl.getBoundingClientRect().height

      const opening = accordion.show(itemEl)

      // The only test that exercises a running transition: everywhere else the
      // fixture carries no stylesheet, so the duration is 0 and the callback
      // settles in the same tick.
      expect(itemEl.getBoundingClientRect().height).toBeCloseTo(collapsed, 0)
      expect(itemEl.hasAttribute('data-coreui-accordion-animating')).toBeTrue()

      await opening

      expect(itemEl.getBoundingClientRect().height).toBeGreaterThan(collapsed)
      expect(itemEl.hasAttribute('data-coreui-accordion-animating')).toBeFalse()
      expect(itemEl.style.blockSize).toEqual('')
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
    it('should fire show before and shown after the transition', async () => {
      fixtureEl.innerHTML = markup()
      withContentTransition()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const log = []
      record(itemEl, log)

      const promise = accordion.show(itemEl).then(() => log.push('promise'))
      await wait(50)

      expect(log).toEqual(['show:false'])

      await promise

      expect(log).toEqual(['show:false', 'shown:true', 'promise'])
    })

    it('should fire hide before and hidden after the transition', async () => {
      fixtureEl.innerHTML = markup()
      withContentTransition()

      const itemEl = fixtureEl.querySelector('.accordion-item')
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const log = []
      record(itemEl, log)

      const promise = accordion.hide(itemEl).then(() => log.push('promise'))
      await wait(50)

      expect(log).toEqual(['hide:true'])

      await promise

      expect(log).toEqual(['hide:true', 'hidden:false', 'promise'])
    })

    it('should leave the item unclipped while CSS animates the panel', async () => {
      fixtureEl.innerHTML = markup()
      withContentTransition()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))

      const promise = accordion.show(itemEl)
      await wait(30)

      expect(itemEl.hasAttribute('data-coreui-accordion-animating')).toBeFalse()
      await promise
    })

    it('should report its own close once where CSS cannot animate the panel', async () => {
      withoutNativeAnimation()
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelector('.accordion-item')
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const log = []
      record(itemEl, log)

      await accordion.hide(itemEl)
      await wait(30)

      expect(log).toEqual(['hide:true', 'hidden:false'])
    })

    it('should ignore a call while the item moves', async () => {
      fixtureEl.innerHTML = markup()
      withContentTransition()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const log = []
      record(itemEl, log)

      const shown = accordion.show(itemEl)
      await accordion.hide(itemEl)
      await shown

      expect(itemEl.open).toBeTrue()
      expect(log).toEqual(['show:false', 'shown:true'])
    })

    it('should report a change it did not make', async () => {
      fixtureEl.innerHTML = markup('')
      withContentTransition()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const log = []
      record(itemEl, log)

      itemEl.open = true
      await wait(30)

      expect(log).toEqual(['show:true'])

      await wait(150)

      expect(log).toEqual(['show:true', 'shown:true'])
    })

    it('should settle showAll once every item has finished', async () => {
      fixtureEl.innerHTML = markup()
      withContentTransition()

      const items = [...fixtureEl.querySelectorAll('.accordion-item')]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const log = []
      record(items[1], log)

      await accordion.showAll()

      expect(items.every(item => item.open)).toBeTrue()
      expect(log).toEqual(['show:false', 'shown:true'])
    })

    it('should settle without a transition', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const log = []
      record(itemEl, log)
      const start = performance.now()

      await accordion.show(itemEl)

      expect(performance.now() - start).toBeLessThan(50)
      expect(log).toEqual(['show:false', 'shown:true'])
    })

    it('should keep an item open when its hide is prevented', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelector('.accordion-item')
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      EventHandler.on(itemEl, 'hide.coreui.accordion', event => event.preventDefault())

      await accordion.hide(itemEl)

      expect(itemEl.open).toBeTrue()
    })

    it('should keep a sibling open when its hide is prevented', async () => {
      fixtureEl.innerHTML = markup()

      const [first, second] = fixtureEl.querySelectorAll('.accordion-item')
      EventHandler.on(first, 'hide.coreui.accordion', event => event.preventDefault())

      click(second)
      await wait(20)

      expect(first.open).toBeTrue()
      expect(second.open).toBeFalse()
    })

    it('should keep an item shut while an open sibling moves', async () => {
      fixtureEl.innerHTML = threeItems()
      withContentTransition()

      const items = fixtureEl.querySelectorAll('.accordion-item')
      const log = []
      record(items[1], log)

      click(items[1])
      await wait(20)
      click(items[2])
      await wait(200)

      expect([...items].map(item => item.open)).toEqual([false, true, false])
      expect(log).toEqual(['show:false', 'shown:true'])
    })

    it('should ignore a click while the item moves', async () => {
      fixtureEl.innerHTML = markup()
      withContentTransition()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const log = []
      record(itemEl, log)

      click(itemEl)
      await wait(20)
      click(itemEl)
      await wait(200)

      expect(itemEl.open).toBeTrue()
      expect(log).toEqual(['show:false', 'shown:true'])
    })

    it('should report a sibling the browser closes', async () => {
      fixtureEl.innerHTML = markup()

      const [first, second] = fixtureEl.querySelectorAll('.accordion-item')
      const log = []
      record(first, log)

      second.open = true
      await wait(30)

      expect(log).toEqual(['hide:false', 'hidden:false'])
    })

    it('should not hold an item the browser changed', async () => {
      fixtureEl.innerHTML = markup('')
      withContentTransition()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))

      itemEl.open = true
      await wait(10)
      await accordion.hide(itemEl)

      expect(itemEl.open).toBeFalse()
    })

    it('should wait for moving items before it closes them all', async () => {
      fixtureEl.innerHTML = threeItems()
      withContentTransition()

      const items = [...fixtureEl.querySelectorAll('.accordion-item')]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))

      accordion.showAll()
      await wait(20)
      await accordion.hideAll()

      expect(items.some(item => item.open)).toBeFalse()
      expect(items.every(item => item.getAttribute('name') === 'group')).toBeTrue()
    })

    it('should drop pending events on dispose', async () => {
      fixtureEl.innerHTML = markup()
      withContentTransition()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const accordion = new Accordion(fixtureEl.querySelector('.accordion'))
      const log = []
      record(itemEl, log)

      const promise = accordion.show(itemEl)
      await wait(20)
      accordion.dispose()
      await promise
      await wait(150)

      expect(log).toEqual(['show:false'])
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
    it('should take the click where CSS animates the panel, instantiating on the container', async () => {
      fixtureEl.innerHTML = markup()

      const accordionEl = fixtureEl.querySelector('.accordion')
      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      const shown = new Promise(resolve => {
        EventHandler.on(itemEl, 'shown.coreui.accordion', resolve)
      })

      itemEl.querySelector('.accordion-header').dispatchEvent(event)
      await shown

      expect(event.defaultPrevented).toBeTrue()
      expect(itemEl.open).toBeTrue()
      expect(Accordion.getInstance(accordionEl)).not.toBeNull()
    })

    it('should let a show listener keep a clicked item closed', async () => {
      fixtureEl.innerHTML = markup()

      const itemEl = fixtureEl.querySelectorAll('.accordion-item')[1]
      EventHandler.on(itemEl, 'show.coreui.accordion', event => event.preventDefault())

      itemEl.querySelector('.accordion-header').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      await wait(20)

      expect(itemEl.open).toBeFalse()
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

    it('should leave a label inside the summary to itself', async () => {
      fixtureEl.innerHTML = [
        '<div class="accordion">',
        '  <details class="accordion-item">',
        '    <summary class="accordion-header">Item <label><input type="checkbox"> Select</label></summary>',
        '    <div class="accordion-body">Body</div>',
        '  </details>',
        '</div>'
      ].join('')

      const itemEl = fixtureEl.querySelector('.accordion-item')
      itemEl.querySelector('label').click()
      await wait(20)

      expect(itemEl.querySelector('input').checked).toBeTrue()
      expect(itemEl.open).toBeFalse()
    })

    it('should leave an item that is not a direct child to the browser', async () => {
      fixtureEl.innerHTML = '<div class="accordion"><div><details class="accordion-item"><summary class="accordion-header">Item</summary><div class="accordion-body">Body</div></details></div></div>'

      const itemEl = fixtureEl.querySelector('.accordion-item')
      itemEl.querySelector('.accordion-header').click()
      await wait(20)

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

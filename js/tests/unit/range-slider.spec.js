import EventHandler from '../../src/dom/event-handler.js'
import Range from '../../src/range.js'
import RangeSlider from '../../src/range-slider.js'
import {
  clearFixture, createEvent, getFixture, jQueryMock
} from '../helpers/fixture.js'

describe('RangeSlider', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const mount = (config = {}, attributes = '') => {
    fixtureEl.innerHTML = `<div id="slider" ${attributes}></div>`
    const element = fixtureEl.querySelector('#slider')

    return { element, rangeSlider: new RangeSlider(element, config) }
  }

  const inputsOf = element => [...element.querySelectorAll('.form-range-input')]

  const move = (input, value) => {
    input.value = String(value)
    input.dispatchEvent(createEvent('input', { bubbles: true }))
  }

  const wrapperOf = element => element.querySelector(':scope > .form-range')

  const pressAt = (wrapper, value, type = 'pointerdown') => {
    const rect = wrapper.querySelector('.form-range-input').getBoundingClientRect()
    const event = new PointerEvent(type, {
      bubbles: true, button: 0, clientX: rect.left + (rect.width * value / 100), clientY: rect.top + (rect.height / 2), pointerId: 1
    })

    return type === 'pointerdown' ? wrapper.dispatchEvent(event) : document.dispatchEvent(event)
  }

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(RangeSlider.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return default config', () => {
      expect(RangeSlider.Default).toEqual(jasmine.any(Object))
      expect(RangeSlider.Default.tooltips).toBeTrue()
      expect(RangeSlider.Default.clickableTicks).toBeTrue()
    })
  })

  describe('DefaultType', () => {
    it('should return default type config', () => {
      expect(RangeSlider.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(RangeSlider.DATA_KEY).toEqual('coreui.range-slider')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(RangeSlider.NAME).toEqual('range-slider')
    })
  })

  describe('constructor', () => {
    it('should take care of element either passed as a CSS selector or DOM element', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'

      const element = fixtureEl.querySelector('#slider')
      const bySelector = new RangeSlider('#slider')
      expect(bySelector._element).toEqual(element)

      bySelector.dispose()

      const byElement = new RangeSlider(element)
      expect(byElement._element).toEqual(element)
    })

    it('should build a range with one input per value and run it without the Range plugin', () => {
      const { element } = mount({
        max: 200, min: 10, step: 5, value: [20, 150]
      })
      const inputs = inputsOf(element)

      const wrapper = wrapperOf(element)
      expect(wrapper).toHaveClass('form-range')
      expect(Range.getInstance(wrapper)).toBeNull()
      expect(element.className).toEqual('')
      expect(inputs.map(input => [input.type, input.min, input.max, input.step, input.value])).toEqual([
        ['range', '10', '200', '5', '20'],
        ['range', '10', '200', '5', '150']
      ])
    })

    it('should keep the Range data API off the range it builds before DOMContentLoaded', () => {
      const { element } = mount({ value: [20, 80] })
      const [low] = inputsOf(element)

      document.dispatchEvent(new Event('DOMContentLoaded'))
      move(low, 30)

      expect(Range.getInstance(wrapperOf(element))).toBeNull()
      expect(wrapperOf(element).style.getPropertyValue('--cui-range-fill-start')).toEqual('0.3')
      expect(wrapperOf(element).style.getPropertyValue('--cui-range-fill')).toEqual('0.8')
    })

    it('should write each value as the default value, so a form reset restores it', () => {
      const { element } = mount({ value: [25, 75] })

      expect(inputsOf(element).map(input => input.getAttribute('value'))).toEqual(['25', '75'])
    })

    it('should read a single number and a comma-separated string as values', () => {
      const { element } = mount({ value: 40 })
      expect(inputsOf(element).map(input => input.value)).toEqual(['40'])

      fixtureEl.innerHTML = '<div id="slider2" data-coreui-value="10, 30, 60"></div>'
      const other = fixtureEl.querySelector('#slider2')
      new RangeSlider(other) // eslint-disable-line no-new
      expect(inputsOf(other).map(input => input.value)).toEqual(['10', '30', '60'])
    })

    it('should stand up a vertical slider', () => {
      const { element } = mount({ value: [20, 80], vertical: true })

      expect(element.querySelector('.form-range')).toHaveClass('form-range-vertical')
      expect(inputsOf(element).map(input => input.getAttribute('aria-orientation'))).toEqual(['vertical', 'vertical'])
    })

    it('should disable every input', () => {
      const { element } = mount({ disabled: true, value: [20, 80] })

      expect(inputsOf(element).every(input => input.disabled)).toBeTrue()
    })

    it('should draw the ticks of the list datalist without linking it to the inputs, which would snap a drag', () => {
      fixtureEl.innerHTML = `
        <div id="slider"></div>
        <datalist id="stops"><option value="0" label="Low"></option><option value="100" label="High"></option></datalist>
      `
      const element = fixtureEl.querySelector('#slider')
      new RangeSlider(element, { list: 'stops', value: [20, 80] }) // eslint-disable-line no-new

      expect(inputsOf(element).some(input => input.hasAttribute('list'))).toBeFalse()
      expect([...element.querySelectorAll('.form-range-tick-label')].map(label => label.textContent)).toEqual(['Low', 'High'])
    })

    it('should not mark the inputs with what the native slider already exposes', () => {
      const { element } = mount({ value: [20, 80] })

      for (const input of inputsOf(element)) {
        expect(input.hasAttribute('role')).toBeFalse()
        expect(input.hasAttribute('aria-valuenow')).toBeFalse()
        expect(input.hasAttribute('aria-orientation')).toBeFalse()
      }
    })
  })

  describe('options', () => {
    it('should show a tooltip per thumb by default', () => {
      const { element } = mount({ value: [20, 80] })

      expect(element.querySelectorAll('.form-range-tooltip')).toHaveSize(2)
    })

    it('should leave the tooltips out with tooltips false and keep them on with always', () => {
      const { element } = mount({ tooltips: false, value: [20, 80] })
      expect(element.querySelector('.form-range-tooltip')).toBeNull()

      const { element: always } = mount({ tooltips: 'always', value: [20, 80] })
      expect([...always.querySelectorAll('.form-range-tooltip')].every(tooltip => tooltip.classList.contains('show'))).toBeTrue()
    })

    it('should format the tooltips, add tooltipClass and announce the text', () => {
      const { element } = mount({ tooltipClass: 'theme-danger', tooltipsFormat: value => `${value} km`, value: [20] })

      expect(element.querySelector('.tooltip-inner').textContent).toEqual('20 km')
      expect(element.querySelector('.form-range-tooltip')).toHaveClass('theme-danger')
      expect(element.querySelector('.form-range-input').getAttribute('aria-valuetext')).toEqual('20 km')
    })

    it('should draw ticks from the ticks option, clickable by default', () => {
      const { element } = mount({ ticks: 'Low, Mid, High', value: [20, 80] })

      expect([...element.querySelectorAll('.form-range-tick-label')].map(label => label.textContent)).toEqual(['Low', 'Mid', 'High'])
      expect(element.querySelector('.form-range-ticks')).toHaveClass('form-range-ticks-clickable')
    })

    it('should keep the ticks still with clickableTicks false', () => {
      const { element } = mount({ clickableTicks: false, ticks: ['Low', 'High'], value: [20, 80] })

      expect(element.querySelector('.form-range-ticks')).not.toHaveClass('form-range-ticks-clickable')
    })

    it('should keep the thumbs distance apart', () => {
      const { element } = mount({ distance: 10, value: [20, 80] })
      const [low, high] = inputsOf(element)

      move(low, 75)

      expect([low.value, high.value]).toEqual(['70', '80'])
    })

    it('should forward the sanitizer options', () => {
      const tooltipsFormat = value => `<b onclick="alert(1)">${value}</b>`
      const { element } = mount({ sanitize: false, tooltipsFormat, value: [20] })
      expect(element.querySelector('.tooltip-inner b').hasAttribute('onclick')).toBeTrue()

      const { element: sanitized } = mount({ tooltipsFormat, value: [20] })
      expect(sanitized.querySelector('.tooltip-inner b').hasAttribute('onclick')).toBeFalse()
    })

    it('should leave the track empty with track false', () => {
      const { element } = mount({ track: false, value: [20, 80] })

      expect(element.querySelector('.form-range').style.getPropertyValue('--cui-range-fill')).toEqual('')
    })
  })

  describe('multiple thumbs', () => {
    it('should span the band from the lowest to the highest thumb and leave it with track false', () => {
      const { element } = mount({ value: [20, 50, 80] })
      expect(wrapperOf(element).style.getPropertyValue('--cui-range-fill-start')).toEqual('0.2')
      expect(wrapperOf(element).style.getPropertyValue('--cui-range-fill')).toEqual('0.8')

      const { element: single } = mount({ value: 40 })
      expect(wrapperOf(single).style.getPropertyValue('--cui-range-fill-start')).toEqual('')
      expect(inputsOf(single)[0].style.zIndex).toEqual('')

      const { element: unfilled } = mount({ track: false, value: [20, 80] })
      expect(wrapperOf(unfilled).style.getPropertyValue('--cui-range-fill-start')).toEqual('')
      expect(wrapperOf(unfilled).style.getPropertyValue('--cui-range-fill')).toEqual('')
    })

    it('should stack the thumbs so the one that can still move is on top', () => {
      const { element } = mount({ value: [100, 100] })
      const [low, high] = inputsOf(element)

      expect(Number(low.style.zIndex)).toBeGreaterThan(Number(high.style.zIndex))

      move(low, 0)
      move(high, 0)

      expect(Number(high.style.zIndex)).toBeGreaterThan(Number(low.style.zIndex))
    })

    it('should keep the thumbs in order', () => {
      const { element } = mount({ value: [25, 75] })
      const [low, high] = inputsOf(element)

      move(low, 90)
      move(high, 10)

      expect([low.value, high.value]).toEqual(['75', '75'])
    })

    it('should keep the order before listeners on the inputs run', () => {
      const { element } = mount({ value: [25, 75] })
      const [low, high] = inputsOf(element)
      const seen = []
      low.addEventListener('input', () => seen.push(low.value))

      move(low, 90)

      expect(seen).toEqual(['75'])
      expect(high.value).toEqual('75')
    })

    it('should keep a decimal distance without overshooting it', () => {
      const { element } = mount({
        distance: 0.1, max: 1, min: 0, step: 0.1, value: [0.1, 0.3]
      })
      const [low, high] = inputsOf(element)

      move(low, 0.2)
      expect(low.value).toEqual('0.2')

      move(high, 0.2)
      expect(high.value).toEqual('0.3')
    })

    it('should step past a bound that falls between steps', () => {
      const { element } = mount({ distance: 2, step: 5, value: [0, 50] })
      const high = inputsOf(element)[1]

      move(high, 0)

      expect(high.value).toEqual('5')
    })

    it('should move the nearest thumb to a pressed point of the track and commit on release', () => {
      const { element } = mount({ value: [25, 75] })
      const wrapper = wrapperOf(element)
      const [low, high] = inputsOf(element)
      const events = []
      wrapper.addEventListener('input', event => events.push(`input:${event.target.value}`))
      wrapper.addEventListener('change', event => events.push(`change:${event.target.value}`))

      pressAt(wrapper, 60)
      expect([low.value, high.value]).toEqual(['25', '60'])
      expect(document.activeElement).toEqual(high)

      pressAt(wrapper, 90, 'pointermove')
      expect(high.value).toEqual('90')

      pressAt(wrapper, 90, 'pointerup')
      expect(events).toEqual(['input:60', 'input:90', 'change:90'])
    })

    it('should not let a dragged thumb pass its neighbour', () => {
      const { element } = mount({ value: [25, 75] })
      const wrapper = wrapperOf(element)

      pressAt(wrapper, 10)
      pressAt(wrapper, 95, 'pointermove')
      pressAt(wrapper, 95, 'pointerup')

      expect(inputsOf(element).map(input => input.value)).toEqual(['75', '75'])
    })

    it('should leave a press on a thumb to the browser', () => {
      const { element } = mount({ value: [25, 75] })
      const [low] = inputsOf(element)

      const rect = low.getBoundingClientRect()
      low.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, button: 0, clientX: rect.left + (rect.width * 0.25) + 4, clientY: rect.top + (rect.height / 2), pointerId: 1
      }))

      expect(inputsOf(element).map(input => input.value)).toEqual(['25', '75'])
    })

    it('should leave a press on the track to the browser with a single thumb', () => {
      const { element } = mount({ value: 50 })

      pressAt(wrapperOf(element), 80)

      expect(inputsOf(element)[0].value).toEqual('50')
    })

    it('should not move a disabled slider and ignore other buttons than the primary one', () => {
      const { element } = mount({ disabled: true, value: [25, 75] })
      pressAt(wrapperOf(element), 90)
      expect(inputsOf(element)[1].value).toEqual('75')

      const { element: enabled } = mount({ value: [25, 75] })
      const wrapper = wrapperOf(enabled)
      const rect = wrapper.querySelector('.form-range-input').getBoundingClientRect()
      wrapper.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, button: 2, clientX: rect.left + (rect.width * 0.9), clientY: rect.top, pointerId: 1
      }))
      expect(inputsOf(enabled)[1].value).toEqual('75')
    })

    it('should pick the farther of two equal thumbs on the side of the press', () => {
      const { element } = mount({ value: [20, 50, 50, 80] })

      pressAt(wrapperOf(element), 56)

      expect(inputsOf(element).map(input => input.value)).toEqual(['20', '50', '56', '80'])
    })

    it('should leave thumbs disabled by a fieldset alone', () => {
      fixtureEl.innerHTML = '<fieldset disabled><div id="slider" data-coreui-ticks="Low, High"></div></fieldset>'
      const element = fixtureEl.querySelector('#slider')
      new RangeSlider(element, { value: [25, 75] }) // eslint-disable-line no-new

      pressAt(wrapperOf(element), 40)
      element.querySelectorAll('.form-range-tick-label')[1].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1 }))

      expect(inputsOf(element).map(input => input.value)).toEqual(['25', '75'])
      expect(element.querySelector('.form-range-ticks')).not.toHaveClass('form-range-ticks-clickable')
    })

    it('should ignore a press on the wrapper outside the track', () => {
      const { element } = mount({ value: [25, 75] })
      const wrapper = wrapperOf(element)
      wrapper.style.paddingBottom = '40px'
      const rect = wrapper.querySelector('.form-range-input').getBoundingClientRect()

      wrapper.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, button: 0, clientX: rect.left + (rect.width * 0.6), clientY: rect.bottom + 20, pointerId: 1
      }))

      expect(inputsOf(element)[1].value).toEqual('75')
    })

    it('should measure a press from the right in a right-to-left page', () => {
      fixtureEl.innerHTML = '<div dir="rtl"><div id="slider"></div></div>'
      const element = fixtureEl.querySelector('#slider')
      new RangeSlider(element, { value: [25, 75] }) // eslint-disable-line no-new

      pressAt(wrapperOf(element), 40)

      expect(inputsOf(element).map(input => input.value)).toEqual(['25', '60'])
    })

    it('should ignore a second pointer while one press is in progress', () => {
      const { element } = mount({ value: [25, 75] })
      const wrapper = wrapperOf(element)
      const rect = wrapper.querySelector('.form-range-input').getBoundingClientRect()
      const changes = []
      wrapper.addEventListener('change', event => changes.push(event.target.value))

      pressAt(wrapper, 10)
      wrapper.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, button: 0, clientX: rect.left + (rect.width * 0.9), clientY: rect.top + (rect.height / 2), pointerId: 2
      }))
      pressAt(wrapper, 10, 'pointerup')

      expect(inputsOf(element).map(input => input.value)).toEqual(['10', '75'])
      expect(changes).toEqual(['10'])
    })

    it('should commit a press that the browser cancels', () => {
      const { element } = mount({ value: [25, 75] })
      const wrapper = wrapperOf(element)
      const changes = []
      wrapper.addEventListener('change', event => changes.push(event.target.value))

      pressAt(wrapper, 60)
      pressAt(wrapper, 60, 'pointercancel')
      pressAt(wrapper, 95, 'pointermove')

      expect(changes).toEqual(['60'])
      expect(inputsOf(element)[1].value).toEqual('60')
    })

    it('should end a track press in progress on dispose', () => {
      const { element, rangeSlider } = mount({ value: [25, 75] })
      const wrapper = wrapperOf(element)
      const high = inputsOf(element)[1]

      pressAt(wrapper, 80)
      rangeSlider.dispose()
      pressAt(wrapper, 95, 'pointermove')

      expect(high.value).toEqual('80')
    })
  })

  describe('vertical', () => {
    it('should step a thumb up with the right arrow in every browser', () => {
      const { element } = mount({ value: [25, 75], vertical: true })
      const wrapper = wrapperOf(element)
      const [low] = inputsOf(element)
      const events = []
      wrapper.addEventListener('input', () => events.push('input'))
      wrapper.addEventListener('change', () => events.push('change'))

      const arrow = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' })
      low.dispatchEvent(arrow)
      expect(arrow.defaultPrevented).toBeTrue()
      expect(low.value).toEqual('26')

      low.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' }))
      expect(low.value).toEqual('25')
      expect(events).toEqual(['input', 'change', 'input', 'change'])
    })

    it('should leave the arrow keys of a horizontal slider to the browser', () => {
      const { element } = mount({ value: [25, 75] })
      const [low] = inputsOf(element)
      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' })

      low.dispatchEvent(event)

      expect(event.defaultPrevented).toBeFalse()
      expect(low.value).toEqual('25')
    })

    it('should place the tooltips at the start, or at the end in a right-to-left page', () => {
      const { element } = mount({ value: [25, 75], vertical: true })
      for (const tooltip of element.querySelectorAll('.form-range-tooltip')) {
        expect(tooltip).toHaveClass('bs-tooltip-start')
        expect(tooltip).not.toHaveClass('bs-tooltip-top')
      }

      fixtureEl.innerHTML = '<div dir="rtl"><div id="slider"></div></div>'
      const rtl = fixtureEl.querySelector('#slider')
      new RangeSlider(rtl, { value: [25, 75], vertical: true }) // eslint-disable-line no-new
      for (const tooltip of rtl.querySelectorAll('.form-range-tooltip')) {
        expect(tooltip).toHaveClass('bs-tooltip-end')
      }
    })

    it('should lay the ticks out in rows from the bottom', () => {
      const { element } = mount({ ticks: 'Low, Mid, High', value: 50, vertical: true })
      const ticksEl = element.querySelector('.form-range-ticks')

      expect(ticksEl.style.gridTemplateRows).toEqual('0fr 0.5fr 0.5fr 0fr')
      expect([...ticksEl.children].map(tick => tick.style.gridRowStart)).toEqual(['4', '3', '2'])
      expect(ticksEl.children[0]).toHaveClass('form-range-tick-start')
      expect(ticksEl.children[2]).toHaveClass('form-range-tick-end')
    })
  })

  describe('tooltips and ticks', () => {
    it('should render one tooltip per thumb, each at its own value', () => {
      const { element } = mount({ value: [25, 75] })
      const tooltips = element.querySelectorAll('.form-range-tooltip')

      expect([...tooltips].map(tooltip => tooltip.textContent)).toEqual(['25', '75'])
      expect([...tooltips].map(tooltip => tooltip.style.getPropertyValue('--cui-range-fill'))).toEqual(['0.25', '0.75'])
      expect(tooltips[0].previousElementSibling).toEqual(inputsOf(element)[0])
    })

    it('should announce the label of the tick a handle sits on', () => {
      const { element } = mount({ ticks: 'Low, Medium, High', value: [50] })

      expect(inputsOf(element)[0].getAttribute('aria-valuetext')).toEqual('50, Medium')
    })

    it('should not move a handle to a tick with clickableTicks false', () => {
      const { element } = mount({ clickableTicks: false, ticks: 'Low, Mid, High', value: [25, 75] })

      element.querySelectorAll('.form-range-tick-label')[2].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1 }))

      expect(inputsOf(element)[1].value).toEqual('75')
    })

    it('should move the nearest thumb to a clicked tick and commit on release', () => {
      const { element } = mount({ ticks: 'Low, Mid, High', value: [25, 75] })
      const wrapper = wrapperOf(element)
      const [low, high] = inputsOf(element)
      const events = []
      wrapper.addEventListener('input', event => events.push(`input:${event.target.value}`))
      wrapper.addEventListener('change', event => events.push(`change:${event.target.value}`))

      element.querySelectorAll('.form-range-tick-label')[2].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1 }))

      expect([low.value, high.value]).toEqual(['25', '100'])
      expect(events).toEqual(['input:100'])

      pressAt(wrapper, 100, 'pointerup')
      expect(events).toEqual(['input:100', 'change:100'])
    })

    it('should follow the values a form reset restores', async () => {
      fixtureEl.innerHTML = '<form><div id="slider"></div></form>'
      const element = fixtureEl.querySelector('#slider')
      new RangeSlider(element, { value: [25, 75] }) // eslint-disable-line no-new
      const [low, high] = inputsOf(element)

      move(low, 5)
      move(high, 95)
      fixtureEl.querySelector('form').reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(wrapperOf(element).style.getPropertyValue('--cui-range-fill-start')).toEqual('0.25')
      expect(wrapperOf(element).style.getPropertyValue('--cui-range-fill')).toEqual('0.75')
      expect([...element.querySelectorAll('.tooltip-inner')].map(inner => inner.textContent)).toEqual(['25', '75'])
    })
  })

  describe('value ownership', () => {
    it('should leave the array the page passed alone', () => {
      const value = [10, 40]
      const { element } = mount({ value })

      move(inputsOf(element)[0], 30)

      expect(value).toEqual([10, 40])
    })
  })

  describe('names', () => {
    it('should name each input from an array, in order', () => {
      const { element } = mount({ name: ['min', 'max'], value: [20, 80] })

      expect(inputsOf(element).map(input => input.name)).toEqual(['min', 'max'])
    })

    it('should read a comma-separated name attribute as an array', () => {
      const { element } = mount({}, 'data-coreui-name="min, max" data-coreui-value="20, 80"')

      expect(inputsOf(element).map(input => input.name)).toEqual(['min', 'max'])
    })

    it('should number a single name across the inputs', () => {
      const { element } = mount({ name: 'price', value: [20, 80] })

      expect(inputsOf(element).map(input => input.name)).toEqual(['price-0', 'price-1'])
    })

    it('should leave the inputs an array does not cover without a name', () => {
      const { element } = mount({ name: ['min'], value: [20, 50, 80] })

      expect(inputsOf(element).map(input => input.hasAttribute('name'))).toEqual([true, false, false])
    })

    it('should keep a zero in the array as a name', () => {
      const { element } = mount({ name: [0, 'max'], value: [20, 80] })

      expect(inputsOf(element).map(input => input.name)).toEqual(['0', 'max'])
    })

    it('should not name the inputs by default', () => {
      const { element } = mount({ value: [20, 80] })

      expect(inputsOf(element).some(input => input.hasAttribute('name'))).toBeFalse()
    })
  })

  describe('accessible names', () => {
    it('should take an ariaLabel array in order', () => {
      const { element } = mount({ ariaLabel: ['Lowest price', 'Highest price'], value: [20, 80] })

      expect(inputsOf(element).map(input => input.getAttribute('aria-label'))).toEqual(['Lowest price', 'Highest price'])
    })

    it('should take an ariaLabel function of the index and the total', () => {
      const { element } = mount({ ariaLabel: (index, total) => `Handle ${index + 1} of ${total}`, value: [8, 12, 18] })

      expect(inputsOf(element).map(input => input.getAttribute('aria-label'))).toEqual(['Handle 1 of 3', 'Handle 2 of 3', 'Handle 3 of 3'])
    })

    it('should read an ariaLabel array from a data attribute', () => {
      const { element } = mount({}, 'data-coreui-value="25, 75" data-coreui-aria-label=\'["Min", "Max"]\'')

      expect(inputsOf(element).map(input => input.getAttribute('aria-label'))).toEqual(['Min', 'Max'])
    })

    it('should fall back to Minimum and Maximum for two thumbs, and to Value n beyond', () => {
      const { element } = mount({ value: [20, 80] })
      expect(inputsOf(element).map(input => input.getAttribute('aria-label'))).toEqual(['Minimum value', 'Maximum value'])

      const { element: three } = mount({ value: [20, 50, 80] })
      expect(inputsOf(three).map(input => input.getAttribute('aria-label'))).toEqual(['Value 1', 'Value 2', 'Value 3'])
    })

    it('should read a string ariaLabel, comma separated for several handles', () => {
      const { element } = mount({}, 'data-coreui-value="50" data-coreui-aria-label="Volume"')
      expect(inputsOf(element)[0].getAttribute('aria-label')).toEqual('Volume')

      const { element: two } = mount({ ariaLabel: 'Min, Max', value: [20, 80] })
      expect(inputsOf(two).map(input => input.getAttribute('aria-label'))).toEqual(['Min', 'Max'])
    })

    it('should keep the generated name of a handle the array does not cover', () => {
      const { element } = mount({ ariaLabel: ['Low'], value: [20, 80] })

      expect(inputsOf(element).map(input => input.getAttribute('aria-label'))).toEqual(['Low', 'Maximum value'])
    })

    it('should name a single handle with ariaLabel', () => {
      const { element } = mount({ ariaLabel: ['Volume'], value: 40 })

      expect(inputsOf(element)[0].getAttribute('aria-label')).toEqual('Volume')
    })

    it('should leave a single handle unnamed without ariaLabel', () => {
      const { element } = mount({ value: 40 })

      expect(inputsOf(element)[0].hasAttribute('aria-label')).toBeFalse()
    })
  })

  describe('events', () => {
    it('should fire input and change on the element with the numeric values', () => {
      const { element } = mount({ value: [20, 80] })
      const fired = []
      element.addEventListener('input.coreui.range-slider', event => fired.push(['input', event.value]))
      element.addEventListener('change.coreui.range-slider', event => fired.push(['change', event.value]))

      const [low] = inputsOf(element)
      move(low, 30)
      low.dispatchEvent(createEvent('change', { bubbles: true }))

      expect(fired).toEqual([['input', [30, 80]], ['change', [30, 80]]])
    })

    it('should report the values after the thumbs are kept in order', () => {
      const { element } = mount({ value: [20, 80] })
      const fired = []
      element.addEventListener('input.coreui.range-slider', event => fired.push(event.value))

      move(inputsOf(element)[0], 95)

      expect(fired).toEqual([[80, 80]])
    })

    it('should not report the input and change of a control the page put in the element', () => {
      fixtureEl.innerHTML = '<div id="slider"><input type="number" class="note"></div>'
      const element = fixtureEl.querySelector('#slider')
      new RangeSlider(element, { value: [20, 80] }) // eslint-disable-line no-new

      const fired = []
      element.addEventListener('input.coreui.range-slider', () => fired.push('input'))
      element.addEventListener('change.coreui.range-slider', () => fired.push('change'))

      const note = element.querySelector('.note')
      note.dispatchEvent(createEvent('input', { bubbles: true }))
      note.dispatchEvent(createEvent('change', { bubbles: true }))

      expect(fired).toEqual([])
    })

    it('should fire once per change after setConfig', () => {
      const { element, rangeSlider } = mount({ value: [20, 80] })
      rangeSlider.setConfig({ value: [10, 90] })

      const fired = []
      element.addEventListener('input.coreui.range-slider', event => fired.push(event.value))
      move(inputsOf(element)[0], 30)

      expect(fired).toEqual([[30, 90]])
    })
  })

  describe('forms', () => {
    it('should submit and reset the named values', async () => {
      fixtureEl.innerHTML = '<form><div id="slider" data-coreui-name="lo, hi" data-coreui-value="25, 75"></div></form>'
      const form = fixtureEl.querySelector('form')
      const element = fixtureEl.querySelector('#slider')
      new RangeSlider(element) // eslint-disable-line no-new

      move(inputsOf(element)[1], 90)
      expect([...new FormData(form)]).toEqual([['lo', '25'], ['hi', '90']])

      form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect([...new FormData(form)]).toEqual([['lo', '25'], ['hi', '75']])
      expect(element.querySelector('.form-range').style.getPropertyValue('--cui-range-fill')).toEqual('0.75')
    })

    it('should reset to the configured values after a setConfig that leaves value out', async () => {
      fixtureEl.innerHTML = '<form><div id="slider" data-coreui-name="lo, hi" data-coreui-value="25, 75"></div></form>'
      const form = fixtureEl.querySelector('form')
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element)

      move(inputsOf(element)[0], 40)
      rangeSlider.setConfig({ disabled: true })
      rangeSlider.setConfig({ disabled: false })
      expect(inputsOf(element).map(input => input.value)).toEqual(['40', '75'])

      form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect([...new FormData(form)]).toEqual([['lo', '25'], ['hi', '75']])
    })
  })

  describe('setConfig', () => {
    it('should rebuild from the merged config and keep the page content of the element', () => {
      fixtureEl.innerHTML = '<div id="slider"><p class="note">Page content</p></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { tooltips: false, value: [20, 80] })

      rangeSlider.setConfig({ value: [10, 30, 60] })

      expect(inputsOf(element).map(input => input.value)).toEqual(['10', '30', '60'])
      expect(element.querySelector('.note')).not.toBeNull()
      expect(element.querySelector('.form-range-tooltip')).toBeNull()
      expect(rangeSlider._config.tooltips).toBeFalse()
    })

    it('should keep the values the user picked when the change leaves value out', () => {
      const { element, rangeSlider } = mount({ value: [10, 40] })

      move(inputsOf(element)[0], 30)
      rangeSlider.setConfig({ disabled: true })

      expect(inputsOf(element).map(input => input.value)).toEqual(['30', '40'])
      expect(inputsOf(element).every(input => input.disabled)).toBeTrue()

      rangeSlider.setConfig({ value: [5, 15] })
      expect(inputsOf(element).map(input => input.value)).toEqual(['5', '15'])
    })

    it('should stop handling the wrapper it replaces', () => {
      const { element, rangeSlider } = mount({ value: [20, 80] })
      const wrapper = wrapperOf(element)
      const off = spyOn(EventHandler, 'off').and.callThrough()

      rangeSlider.setConfig({ value: [10, 90] })

      const removed = off.calls.allArgs().filter(([target]) => target === wrapper).map(([, type]) => type)
      expect(removed).toEqual(['input.coreui.range-slider', 'change.coreui.range-slider', 'keydown.coreui.range-slider', 'pointerdown.coreui.range-slider'])
      expect(wrapper.isConnected).toBeFalse()
      expect(wrapperOf(element)).not.toEqual(wrapper)
    })

    it('should switch the orientation both ways', () => {
      const { element, rangeSlider } = mount({ value: [20, 80], vertical: true })

      rangeSlider.setConfig({ vertical: false })
      expect(element.querySelector('.form-range')).not.toHaveClass('form-range-vertical')

      rangeSlider.setConfig({ vertical: true })
      expect(element.querySelector('.form-range')).toHaveClass('form-range-vertical')
    })
  })

  describe('dispose', () => {
    it('should remove what it built and keep the page content', () => {
      fixtureEl.innerHTML = '<div id="slider"><p class="note">Page content</p></div>'
      const element = fixtureEl.querySelector('#slider')
      const rangeSlider = new RangeSlider(element, { ticks: ['Low', 'High'], value: [20, 80], vertical: true })
      const wrapper = element.querySelector('.form-range')

      rangeSlider.dispose()

      expect(RangeSlider.getInstance(element)).toBeNull()
      expect(Range.getInstance(wrapper)).toBeNull()
      expect(element.className).toEqual('')
      expect([...element.children].map(child => child.className)).toEqual(['note'])
    })
  })

  describe('data-api', () => {
    it('should initialize every element with data-coreui-range-slider on load', () => {
      fixtureEl.innerHTML = '<div data-coreui-range-slider data-coreui-value="40"></div>'
      const element = fixtureEl.querySelector('[data-coreui-range-slider]')

      window.dispatchEvent(new Event('load'))

      expect(RangeSlider.getInstance(element)).toBeInstanceOf(RangeSlider)
      expect(inputsOf(element).map(input => input.value)).toEqual(['40'])
    })
  })

  describe('getInstance', () => {
    it('should return the instance or null', () => {
      const { element, rangeSlider } = mount({ value: 40 })

      expect(RangeSlider.getInstance(element)).toEqual(rangeSlider)

      fixtureEl.innerHTML = '<div></div>'
      expect(RangeSlider.getInstance(fixtureEl.querySelector('div'))).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return the existing instance or create one', () => {
      const { element, rangeSlider } = mount({ value: 40 })
      expect(RangeSlider.getOrCreateInstance(element)).toEqual(rangeSlider)

      fixtureEl.innerHTML = '<div id="other"></div>'
      expect(RangeSlider.getOrCreateInstance(fixtureEl.querySelector('#other'))).toBeInstanceOf(RangeSlider)
    })
  })

  describe('rangeSliderInterface', () => {
    it('should create an instance, call a method, and throw on an unknown one', () => {
      fixtureEl.innerHTML = '<div id="slider"></div>'
      const element = fixtureEl.querySelector('#slider')

      RangeSlider.rangeSliderInterface(element, { value: 50 })
      const rangeSlider = RangeSlider.getInstance(element)
      expect(rangeSlider).toBeInstanceOf(RangeSlider)

      spyOn(rangeSlider, 'setConfig')
      RangeSlider.rangeSliderInterface(element, 'setConfig', { value: 20 })
      expect(rangeSlider.setConfig).toHaveBeenCalledWith({ value: 20 })

      expect(() => {
        RangeSlider.rangeSliderInterface(element, 'nonExistentMethod')
      }).toThrowError(TypeError, 'No method named "nonExistentMethod"')
    })
  })

  describe('jQueryInterface', () => {
    it('should create a range slider and call a method with its arguments', () => {
      fixtureEl.innerHTML = '<div data-coreui-range-slider data-coreui-value="20"></div>'
      const element = fixtureEl.querySelector('[data-coreui-range-slider]')

      jQueryMock.fn.rangeSlider = RangeSlider.jQueryInterface
      jQueryMock.elements = [element]
      jQueryMock.fn.rangeSlider.call(jQueryMock)

      const rangeSlider = RangeSlider.getInstance(element)
      expect(rangeSlider).not.toBeNull()

      jQueryMock.fn.rangeSlider.call(jQueryMock, 'setConfig', { value: 60 })
      expect(inputsOf(element).map(input => input.value)).toEqual(['60'])
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div data-coreui-range-slider></div>'
      const element = fixtureEl.querySelector('[data-coreui-range-slider]')

      jQueryMock.fn.rangeSlider = RangeSlider.jQueryInterface
      jQueryMock.elements = [element]

      expect(() => {
        jQueryMock.fn.rangeSlider.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })
})

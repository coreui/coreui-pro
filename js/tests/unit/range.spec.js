import Range from '../../src/range.js'
import {
  clearFixture, createEvent, getFixture, jQueryMock
} from '../helpers/fixture.js'

describe('Range', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const getMultiHtml = (wrapperAttributes = '', values = [25, 75]) => {
    return `
      <div class="form-range" ${wrapperAttributes}>
        ${values.map((value, index) => `<input type="range" class="form-range-input" min="0" max="100" value="${value}" aria-label="Thumb ${index + 1}">`).join('')}
      </div>
    `
  }

  const pressAt = (rangeEl, value, type = 'pointerdown') => {
    const rect = rangeEl.querySelector('.form-range-input').getBoundingClientRect()
    const event = new PointerEvent(type, {
      bubbles: true, button: 0, clientX: rect.left + (rect.width * value / 100), clientY: rect.top + (rect.height / 2), pointerId: 1
    })

    return type === 'pointerdown' ? rangeEl.dispatchEvent(event) : document.dispatchEvent(event)
  }

  const getRangeHtml = (wrapperAttributes = '', inputAttributes = '') => {
    return `
      <div class="form-range" ${wrapperAttributes}>
        <input type="range" class="form-range-input" min="0" max="100" value="50" ${inputAttributes}>
      </div>
    `
  }

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Range.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Range.DATA_KEY).toEqual('coreui.range')
    })
  })

  describe('Default', () => {
    it('should return default config', () => {
      expect(Range.Default).toEqual(jasmine.any(Object))
      expect(Range.Default.tooltips).toBeFalse()
    })
  })

  describe('DefaultType', () => {
    it('should return default type config', () => {
      expect(Range.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('constructor', () => {
    it('should take care of element either passed as a CSS selector or DOM element', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const rangeBySelector = new Range('.form-range')
      expect(rangeBySelector._element).toEqual(rangeEl)

      rangeBySelector.dispose()

      const rangeByElement = new Range(rangeEl)
      expect(rangeByElement._element).toEqual(rangeEl)
    })

    it('should find the range input inside the wrapper', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const inputEl = fixtureEl.querySelector('.form-range-input')
      const range = new Range(rangeEl)

      expect(range._inputs).toEqual([inputEl])
    })

    it('should collect every range input of the wrapper in order', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const range = new Range(fixtureEl.querySelector('.form-range'))

      expect(range._inputs).toEqual([...fixtureEl.querySelectorAll('.form-range-input')])
    })

    it('should set the --cui-range-fill custom property on init', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('0.5')
    })

    it('should honor min/max when computing the fill ratio', () => {
      fixtureEl.innerHTML = `
        <div class="form-range">
          <input type="range" class="form-range-input" min="0" max="200" value="50">
        </div>
      `

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('0.25')
    })

    it('should fall back to 0–100 when min/max are missing', () => {
      fixtureEl.innerHTML = `
        <div class="form-range">
          <input type="range" class="form-range-input" value="20">
        </div>
      `

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('0.2')
    })

    it('should do nothing when there is no range input', () => {
      fixtureEl.innerHTML = '<div class="form-range"></div>'

      const rangeEl = fixtureEl.querySelector('.form-range')
      const range = new Range(rangeEl)

      expect(range._inputs).toEqual([])
      expect(() => range.dispose()).not.toThrow()
    })

    it('should read the tooltips option from a bare data attribute', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-tooltips')

      const range = new Range(fixtureEl.querySelector('.form-range'))

      expect(range._config.tooltips).toBeTrue()
    })
  })

  describe('update', () => {
    it('should update the --cui-range-fill custom property on input', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const inputEl = fixtureEl.querySelector('.form-range-input')
      new Range(rangeEl) // eslint-disable-line no-new

      inputEl.value = '75'
      inputEl.dispatchEvent(createEvent('input'))

      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('0.75')
    })

    it('should recompute the fill when called after a programmatic value change', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const inputEl = fixtureEl.querySelector('.form-range-input')
      const range = new Range(rangeEl)

      inputEl.value = '10'
      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('0.5')

      range.update()

      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('0.1')
    })

    it('should span the band from the lowest to the highest thumb', () => {
      fixtureEl.innerHTML = getMultiHtml('', [20, 50, 80])

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      expect(rangeEl.style.getPropertyValue('--cui-range-fill-start')).toEqual('0.2')
      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('0.8')
    })

    it('should start the band at the track start with a single thumb', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      expect(rangeEl.style.getPropertyValue('--cui-range-fill-start')).toEqual('')
    })

    it('should leave the band unset with track false', () => {
      fixtureEl.innerHTML = getMultiHtml('data-coreui-track="false"')

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('')
      expect(rangeEl.style.getPropertyValue('--cui-range-fill-start')).toEqual('')
    })

    it('should stack the thumbs so the one that can still move is on top', () => {
      fixtureEl.innerHTML = getMultiHtml('', [100, 100])

      const rangeEl = fixtureEl.querySelector('.form-range')
      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      new Range(rangeEl) // eslint-disable-line no-new

      expect(Number(low.style.zIndex)).toBeGreaterThan(Number(high.style.zIndex))

      low.value = '0'
      low.dispatchEvent(createEvent('input'))
      high.value = '0'
      high.dispatchEvent(createEvent('input'))

      expect(Number(high.style.zIndex)).toBeGreaterThan(Number(low.style.zIndex))
    })

    it('should not stack a single thumb', () => {
      fixtureEl.innerHTML = getRangeHtml()

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      expect(fixtureEl.querySelector('.form-range-input').style.zIndex).toEqual('')
    })
  })

  describe('multiple thumbs', () => {
    it('should keep the thumbs in order', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      low.value = '90'
      low.dispatchEvent(createEvent('input'))
      high.value = '10'
      high.dispatchEvent(createEvent('input'))

      expect([low.value, high.value]).toEqual(['75', '75'])
    })

    it('should keep the distance between neighbouring thumbs', () => {
      fixtureEl.innerHTML = getMultiHtml('data-coreui-distance="10"', [20, 50, 80])

      const middle = fixtureEl.querySelectorAll('.form-range-input')[1]
      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      middle.value = '78'
      middle.dispatchEvent(createEvent('input'))
      expect(middle.value).toEqual('70')

      middle.value = '22'
      middle.dispatchEvent(createEvent('input'))
      expect(middle.value).toEqual('30')
    })

    it('should move the nearest thumb to a pressed point of the track and commit on release', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      new Range(rangeEl) // eslint-disable-line no-new

      const events = []
      rangeEl.addEventListener('input', event => events.push(`input:${event.target.value}`))
      rangeEl.addEventListener('change', event => events.push(`change:${event.target.value}`))

      pressAt(rangeEl, 60)
      expect([low.value, high.value]).toEqual(['25', '60'])
      expect(document.activeElement).toEqual(high)

      pressAt(rangeEl, 90, 'pointermove')
      expect(high.value).toEqual('90')

      pressAt(rangeEl, 90, 'pointerup')
      expect(events).toEqual(['input:60', 'input:90', 'change:90'])
    })

    it('should not let a dragged thumb pass its neighbour', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      new Range(rangeEl) // eslint-disable-line no-new

      pressAt(rangeEl, 10)
      pressAt(rangeEl, 95, 'pointermove')
      pressAt(rangeEl, 95, 'pointerup')

      expect([low.value, high.value]).toEqual(['75', '75'])
    })

    it('should leave a press on a thumb to the browser', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      new Range(rangeEl) // eslint-disable-line no-new

      low.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1 }))

      expect([low.value, high.value]).toEqual(['25', '75'])
    })

    it('should leave a press on the track to the browser with a single thumb', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      pressAt(rangeEl, 80)

      expect(fixtureEl.querySelector('.form-range-input').value).toEqual('50')
    })

    it('should not move a disabled thumb', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const [, high] = fixtureEl.querySelectorAll('.form-range-input')
      high.disabled = true
      new Range(rangeEl) // eslint-disable-line no-new

      pressAt(rangeEl, 90)

      expect(high.value).toEqual('75')
    })

    it('should ignore other buttons than the primary one', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const rect = rangeEl.querySelector('.form-range-input').getBoundingClientRect()
      new Range(rangeEl) // eslint-disable-line no-new

      rangeEl.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, button: 2, clientX: rect.left + (rect.width * 0.9), clientY: rect.top, pointerId: 1
      }))

      expect(fixtureEl.querySelectorAll('.form-range-input')[1].value).toEqual('75')
    })

    it('should keep the thumbs in order before listeners on the inputs run', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      const seen = []
      low.addEventListener('input', () => seen.push(low.value))
      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      low.value = '90'
      low.dispatchEvent(createEvent('input'))

      expect(seen).toEqual(['75'])
      expect(high.value).toEqual('75')
    })

    it('should keep a decimal distance without overshooting it', () => {
      fixtureEl.innerHTML = `
        <div class="form-range" data-coreui-distance="0.1">
          <input type="range" class="form-range-input" min="0" max="1" step="0.1" value="0.1">
          <input type="range" class="form-range-input" min="0" max="1" step="0.1" value="0.3">
        </div>
      `

      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      low.value = '0.2'
      low.dispatchEvent(createEvent('input'))
      expect(low.value).toEqual('0.2')

      high.value = '0.2'
      high.dispatchEvent(createEvent('input'))
      expect(high.value).toEqual('0.3')
    })

    it('should step past a bound that falls between steps', () => {
      fixtureEl.innerHTML = `
        <div class="form-range" data-coreui-distance="2">
          <input type="range" class="form-range-input" min="0" max="100" step="5" value="0">
          <input type="range" class="form-range-input" min="0" max="100" step="5" value="50">
        </div>
      `

      const high = fixtureEl.querySelectorAll('.form-range-input')[1]
      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      high.value = '0'
      high.dispatchEvent(createEvent('input'))

      expect(high.value).toEqual('5')
    })

    it('should pick the farther of two equal thumbs on the side of the press', () => {
      fixtureEl.innerHTML = getMultiHtml('', [20, 50, 50])

      const rangeEl = fixtureEl.querySelector('.form-range')
      const inputs = [...fixtureEl.querySelectorAll('.form-range-input')]
      new Range(rangeEl) // eslint-disable-line no-new

      pressAt(rangeEl, 56)

      expect(inputs.map(input => input.value)).toEqual(['20', '50', '56'])
    })

    it('should move the nearest thumb that is not disabled', () => {
      fixtureEl.innerHTML = getMultiHtml('', [20, 80])

      const rangeEl = fixtureEl.querySelector('.form-range')
      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      low.disabled = true
      new Range(rangeEl) // eslint-disable-line no-new

      pressAt(rangeEl, 35)

      expect([low.value, high.value]).toEqual(['20', '35'])
    })

    it('should leave thumbs disabled by a fieldset alone', () => {
      fixtureEl.innerHTML = `<fieldset disabled>${getMultiHtml('data-coreui-clickable-ticks="true" data-coreui-ticks="Low, High"')}</fieldset>`

      const rangeEl = fixtureEl.querySelector('.form-range')
      const inputs = [...fixtureEl.querySelectorAll('.form-range-input')]
      new Range(rangeEl) // eslint-disable-line no-new

      pressAt(rangeEl, 40)
      fixtureEl.querySelectorAll('.form-range-tick-label')[1].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1 }))

      expect(inputs.map(input => input.value)).toEqual(['25', '75'])
      expect(fixtureEl.querySelector('.form-range-ticks')).not.toHaveClass('form-range-ticks-clickable')
    })

    it('should ignore a press on the wrapper outside the track', () => {
      fixtureEl.innerHTML = getMultiHtml().replace('class="form-range"', 'class="form-range" style="padding-bottom: 40px"')

      const rangeEl = fixtureEl.querySelector('.form-range')
      const rect = rangeEl.querySelector('.form-range-input').getBoundingClientRect()
      new Range(rangeEl) // eslint-disable-line no-new

      rangeEl.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, button: 0, clientX: rect.left + (rect.width * 0.6), clientY: rect.bottom + 20, pointerId: 1
      }))

      expect(fixtureEl.querySelectorAll('.form-range-input')[1].value).toEqual('75')
    })

    it('should measure a press from the right in a right-to-left range', () => {
      fixtureEl.innerHTML = `<div dir="rtl">${getMultiHtml()}</div>`

      const rangeEl = fixtureEl.querySelector('.form-range')
      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      new Range(rangeEl) // eslint-disable-line no-new

      pressAt(rangeEl, 40)

      expect([low.value, high.value]).toEqual(['25', '60'])
    })

    it('should ignore a second pointer while one press is in progress', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      const rect = low.getBoundingClientRect()
      new Range(rangeEl) // eslint-disable-line no-new

      const changes = []
      rangeEl.addEventListener('change', event => changes.push(event.target.value))

      pressAt(rangeEl, 10)
      rangeEl.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, button: 0, clientX: rect.left + (rect.width * 0.9), clientY: rect.top + (rect.height / 2), pointerId: 2
      }))
      pressAt(rangeEl, 10, 'pointerup')

      expect([low.value, high.value]).toEqual(['10', '75'])
      expect(changes).toEqual(['10'])
    })

    it('should commit a press that the browser cancels', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      const changes = []
      rangeEl.addEventListener('change', event => changes.push(event.target.value))

      pressAt(rangeEl, 60)
      pressAt(rangeEl, 60, 'pointercancel')
      pressAt(rangeEl, 95, 'pointermove')

      expect(changes).toEqual(['60'])
      expect(fixtureEl.querySelectorAll('.form-range-input')[1].value).toEqual('60')
    })

    it('should fire changed only on the thumb that moved', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      const fired = []
      low.addEventListener('changed.coreui.range', () => fired.push('low'))
      high.addEventListener('changed.coreui.range', () => fired.push('high'))

      low.value = '30'
      low.dispatchEvent(createEvent('input'))

      expect(fired).toEqual(['low'])
    })

    it('should step a vertical thumb up with the right arrow in every browser', () => {
      fixtureEl.innerHTML = getMultiHtml().replace('class="form-range"', 'class="form-range form-range-vertical"')

      const rangeEl = fixtureEl.querySelector('.form-range')
      const low = fixtureEl.querySelector('.form-range-input')
      new Range(rangeEl) // eslint-disable-line no-new

      const events = []
      rangeEl.addEventListener('input', () => events.push('input'))
      rangeEl.addEventListener('change', () => events.push('change'))

      low.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' }))
      expect(low.value).toEqual('26')

      low.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' }))
      expect(low.value).toEqual('25')
      expect(events).toEqual(['input', 'change', 'input', 'change'])
    })

    it('should leave the arrow keys of a horizontal range to the browser', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const low = fixtureEl.querySelector('.form-range-input')
      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' })
      low.dispatchEvent(event)

      expect(event.defaultPrevented).toBeFalse()
      expect(low.value).toEqual('25')
    })
  })

  describe('tooltips', () => {
    it('should create a tooltip that shows the value when enabled', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-tooltips')

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      const tooltip = fixtureEl.querySelector('.form-range-tooltip')
      expect(tooltip).not.toBeNull()
      expect(tooltip).toHaveClass('tooltip')
      expect(tooltip.getAttribute('aria-hidden')).toEqual('true')
      expect(tooltip.querySelector('.tooltip-inner').textContent).toEqual('50')
    })

    it('should keep the tooltip hidden until interaction unless tooltips is "always"', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-tooltips')

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      expect(fixtureEl.querySelector('.form-range-tooltip')).not.toHaveClass('show')
    })

    it('should show the tooltip permanently with tooltips "always"', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-tooltips="always"')

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      expect(fixtureEl.querySelector('.form-range-tooltip')).toHaveClass('show')
    })

    it('should not create a tooltip by default', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      expect(fixtureEl.querySelector('.form-range-tooltip')).toBeNull()
    })

    it('should update the tooltip text on input', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-tooltips')

      const rangeEl = fixtureEl.querySelector('.form-range')
      const inputEl = fixtureEl.querySelector('.form-range-input')
      new Range(rangeEl) // eslint-disable-line no-new

      inputEl.value = '80'
      inputEl.dispatchEvent(createEvent('input'))

      expect(fixtureEl.querySelector('.tooltip-inner').textContent).toEqual('80')
    })

    it('should format the tooltip text with tooltipsFormat', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-tooltips')

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl, { tooltipsFormat: value => `${value}%` }) // eslint-disable-line no-new

      expect(fixtureEl.querySelector('.tooltip-inner').textContent).toEqual('50%')
    })

    it('should render one tooltip per thumb, each at its own value', () => {
      fixtureEl.innerHTML = getMultiHtml('data-coreui-tooltips')

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      const tooltips = fixtureEl.querySelectorAll('.form-range-tooltip')
      expect([...tooltips].map(tooltip => tooltip.textContent)).toEqual(['25', '75'])
      expect([...tooltips].map(tooltip => tooltip.style.getPropertyValue('--cui-range-fill'))).toEqual(['0.25', '0.75'])
      expect(tooltips[0].previousElementSibling).toEqual(fixtureEl.querySelectorAll('.form-range-input')[0])
    })

    it('should render the tooltip as a div, which a form reset leaves intact', () => {
      fixtureEl.innerHTML = `<form>${getRangeHtml('data-coreui-tooltips')}</form>`

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new
      fixtureEl.querySelector('form').reset()

      const tooltip = fixtureEl.querySelector('.form-range-tooltip')
      expect(tooltip.tagName).toEqual('DIV')
      expect(tooltip.querySelector('.tooltip-arrow')).not.toBeNull()
      expect(tooltip.querySelector('.tooltip-inner')).not.toBeNull()
    })

    it('should place the tooltips at the start of a vertical range', () => {
      fixtureEl.innerHTML = getMultiHtml('data-coreui-tooltips').replace('class="form-range"', 'class="form-range form-range-vertical"')

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      for (const tooltip of fixtureEl.querySelectorAll('.form-range-tooltip')) {
        expect(tooltip).toHaveClass('bs-tooltip-start')
        expect(tooltip).not.toHaveClass('bs-tooltip-top')
      }
    })

    it('should place the tooltips at the end of a vertical range in a right-to-left page', () => {
      fixtureEl.innerHTML = `<div dir="rtl">${getMultiHtml('data-coreui-tooltips').replace('class="form-range"', 'class="form-range form-range-vertical"')}</div>`

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      for (const tooltip of fixtureEl.querySelectorAll('.form-range-tooltip')) {
        expect(tooltip).toHaveClass('bs-tooltip-end')
      }
    })

    it('should add tooltipClass to every tooltip', () => {
      fixtureEl.innerHTML = getMultiHtml('data-coreui-tooltips data-coreui-tooltip-class="theme-danger fw-bold"')

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      for (const tooltip of fixtureEl.querySelectorAll('.form-range-tooltip')) {
        expect(tooltip).toHaveClass('theme-danger')
        expect(tooltip).toHaveClass('fw-bold')
      }
    })

    it('should sanitize the HTML of tooltipsFormat and announce its text as aria-valuetext', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-tooltips')

      new Range(fixtureEl.querySelector('.form-range'), { // eslint-disable-line no-new
        tooltipsFormat: value => `<strong onclick="alert(1)">${value}</strong> km`
      })

      const inner = fixtureEl.querySelector('.tooltip-inner')
      expect(inner.querySelector('strong')).not.toBeNull()
      expect(inner.querySelector('strong').hasAttribute('onclick')).toBeFalse()
      expect(fixtureEl.querySelector('.form-range-input').getAttribute('aria-valuetext')).toEqual('50 km')
    })

    it('should keep a word break between the lines of tooltipsFormat in aria-valuetext', () => {
      fixtureEl.innerHTML = getRangeHtml()

      new Range(fixtureEl.querySelector('.form-range'), { tooltipsFormat: value => `<b>$${value}</b><br>USD` }) // eslint-disable-line no-new

      expect(fixtureEl.querySelector('.form-range-input').getAttribute('aria-valuetext')).toEqual('$50 USD')
    })

    it('should announce the label of the tick a thumb sits on', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-ticks="Low, Medium, High"')

      const inputEl = fixtureEl.querySelector('.form-range-input')
      inputEl.setAttribute('aria-valuetext', 'author text')
      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      expect(inputEl.getAttribute('aria-valuetext')).toEqual('50, Medium')

      inputEl.value = '40'
      inputEl.dispatchEvent(createEvent('input'))
      expect(inputEl.getAttribute('aria-valuetext')).toEqual('author text')

      inputEl.value = '100'
      inputEl.dispatchEvent(createEvent('input'))
      expect(inputEl.getAttribute('aria-valuetext')).toEqual('100, High')
    })

    it('should add a tick label to the tooltipsFormat text unless they read the same', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const inputEl = fixtureEl.querySelector('.form-range-input')
      new Range(fixtureEl.querySelector('.form-range'), { // eslint-disable-line no-new
        ticks: [{ label: 'Mild', value: 50 }, { label: '$100', value: 100 }],
        tooltipsFormat: value => `$${value}`
      })

      expect(inputEl.getAttribute('aria-valuetext')).toEqual('$50, Mild')

      inputEl.value = '100'
      inputEl.dispatchEvent(createEvent('input'))
      expect(inputEl.getAttribute('aria-valuetext')).toEqual('$100')
    })

    it('should not set aria-valuetext without tooltipsFormat', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-tooltips')

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      expect(fixtureEl.querySelector('.form-range-input').hasAttribute('aria-valuetext')).toBeFalse()
    })
  })

  describe('ticks', () => {
    const getTicksHtml = () => {
      return `
        <div class="form-range">
          <input type="range" class="form-range-input" min="0" max="100" value="50" list="ticksList">
        </div>
        <datalist id="ticksList">
          <option value="0" label="Low"></option>
          <option value="10"></option>
          <option value="100" label="High"></option>
        </datalist>
      `
    }

    it('should render a tick for each datalist option', () => {
      fixtureEl.innerHTML = getTicksHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      const ticks = fixtureEl.querySelectorAll('.form-range-tick')
      expect(ticks).toHaveSize(3)
      expect(fixtureEl.querySelector('.form-range-ticks').getAttribute('aria-hidden')).toEqual('true')
    })

    it('should place each tick on a grid line via grid-template-columns (handles uneven values)', () => {
      fixtureEl.innerHTML = getTicksHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      // datalist values 0/10/100 -> gaps between 0, .1, 1, and 1
      const ticksEl = fixtureEl.querySelector('.form-range-ticks')
      expect(ticksEl.style.gridTemplateColumns).toEqual('0fr 0.1fr 0.9fr 0fr')

      const ticks = fixtureEl.querySelectorAll('.form-range-tick')
      expect(ticks[0].style.gridColumnStart).toEqual('2')
      expect(ticks[1].style.gridColumnStart).toEqual('3')
      expect(ticks[2].style.gridColumnStart).toEqual('4')
    })

    it('should clamp options outside min/max to the track ends', () => {
      fixtureEl.innerHTML = `
        <div class="form-range">
          <input type="range" class="form-range-input" min="0" max="100" value="50" list="ticksList">
        </div>
        <datalist id="ticksList">
          <option value="-20"></option>
          <option value="50"></option>
          <option value="140"></option>
        </datalist>
      `

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      expect(fixtureEl.querySelector('.form-range-ticks').style.gridTemplateColumns).toEqual('0fr 0.5fr 0.5fr 0fr')
    })

    it('should render labels from the option label only', () => {
      fixtureEl.innerHTML = getTicksHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      new Range(rangeEl) // eslint-disable-line no-new

      const labels = fixtureEl.querySelectorAll('.form-range-tick-label')
      expect(labels).toHaveSize(2)
      expect(labels[0].textContent).toEqual('Low')
      expect(labels[1].textContent).toEqual('High')
    })

    it('should do nothing when there is no linked datalist', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const range = new Range(rangeEl)

      expect(range._ticks).toBeNull()
      expect(fixtureEl.querySelector('.form-range-ticks')).toBeNull()
    })

    it('should render ticks from the ticks option: strings spread evenly, numbers bare, objects as given', () => {
      fixtureEl.innerHTML = getRangeHtml()

      new Range(fixtureEl.querySelector('.form-range'), { // eslint-disable-line no-new
        ticks: [{ label: 'Cold', value: 0 }, 30, {
          class: 'text-danger', label: 'Hot', style: { color: 'red' }, value: 100
        }]
      })

      const ticks = fixtureEl.querySelectorAll('.form-range-tick')
      expect([...ticks].map(tick => tick.dataset.coreuiValue)).toEqual(['0', '30', '100'])
      expect([...ticks].map(tick => tick.textContent)).toEqual(['Cold', '', 'Hot'])
      expect(ticks[2]).toHaveClass('text-danger')
      expect(ticks[2].style.color).toEqual('red')
    })

    it('should add every class of a tick object, space separated', () => {
      fixtureEl.innerHTML = getRangeHtml()

      new Range(fixtureEl.querySelector('.form-range'), { ticks: [{ class: 'fw-bold  text-danger', label: 'Mid', value: 50 }] }) // eslint-disable-line no-new

      const tick = fixtureEl.querySelector('.form-range-tick')
      expect(tick).toHaveClass('fw-bold')
      expect(tick).toHaveClass('text-danger')
    })

    it('should read the datalist of the list option without a list attribute on the input', () => {
      fixtureEl.innerHTML = getTicksHtml().replace(' list="ticksList"', '')

      new Range(fixtureEl.querySelector('.form-range'), { list: 'ticksList' }) // eslint-disable-line no-new

      expect(fixtureEl.querySelector('.form-range-input').hasAttribute('list')).toBeFalse()
      expect([...fixtureEl.querySelectorAll('.form-range-tick-label')].map(label => label.textContent)).toEqual(['Low', 'High'])
    })

    it('should combine the ticks option with a linked datalist', () => {
      fixtureEl.innerHTML = getTicksHtml()

      new Range(fixtureEl.querySelector('.form-range'), { ticks: [{ label: 'Half', value: 50 }] }) // eslint-disable-line no-new

      expect([...fixtureEl.querySelectorAll('.form-range-tick')].map(tick => tick.dataset.coreuiValue)).toEqual(['0', '10', '50', '100'])
    })

    it('should read a comma-separated ticks attribute as labels spread evenly', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-ticks="Low, Mid, High"')

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      const ticks = fixtureEl.querySelectorAll('.form-range-tick')
      expect([...ticks].map(tick => tick.dataset.coreuiValue)).toEqual(['0', '50', '100'])
      expect([...ticks].map(tick => tick.textContent)).toEqual(['Low', 'Mid', 'High'])
    })

    it('should read a numeric ticks attribute as a single label', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-ticks="100"')

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      expect(fixtureEl.querySelector('.form-range-tick').textContent).toEqual('100')
    })

    it('should mark the ticks at the ends of the track', () => {
      fixtureEl.innerHTML = getTicksHtml()

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      const ticks = fixtureEl.querySelectorAll('.form-range-tick')
      expect(ticks[0]).toHaveClass('form-range-tick-start')
      expect(ticks[1]).not.toHaveClass('form-range-tick-start')
      expect(ticks[1]).not.toHaveClass('form-range-tick-end')
      expect(ticks[2]).toHaveClass('form-range-tick-end')
    })

    it('should lay the ticks out in rows from the bottom in a vertical range', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-ticks="Low, Mid, High"').replace('class="form-range"', 'class="form-range form-range-vertical"')

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      const ticksEl = fixtureEl.querySelector('.form-range-ticks')
      expect(ticksEl.style.gridTemplateRows).toEqual('0fr 0.5fr 0.5fr 0fr')
      expect([...ticksEl.children].map(tick => tick.style.gridRowStart)).toEqual(['4', '3', '2'])
      expect(ticksEl.children[0]).toHaveClass('form-range-tick-start')
      expect(ticksEl.children[2]).toHaveClass('form-range-tick-end')
    })

    it('should move the nearest thumb to a clicked tick with clickableTicks', () => {
      fixtureEl.innerHTML = getMultiHtml('data-coreui-clickable-ticks="true" data-coreui-ticks="Low, Mid, High"')

      const rangeEl = fixtureEl.querySelector('.form-range')
      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      new Range(rangeEl) // eslint-disable-line no-new

      const events = []
      rangeEl.addEventListener('input', event => events.push(`input:${event.target.value}`))
      rangeEl.addEventListener('change', event => events.push(`change:${event.target.value}`))

      expect(fixtureEl.querySelector('.form-range-ticks')).toHaveClass('form-range-ticks-clickable')

      fixtureEl.querySelectorAll('.form-range-tick-label')[2].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1 }))

      expect([low.value, high.value]).toEqual(['25', '100'])
      expect(events).toEqual(['input:100'])

      pressAt(rangeEl, 100, 'pointerup')
      expect(events).toEqual(['input:100', 'change:100'])
    })

    it('should ignore clicks on ticks by default', () => {
      fixtureEl.innerHTML = getMultiHtml('data-coreui-ticks="Low, Mid, High"')

      new Range(fixtureEl.querySelector('.form-range')) // eslint-disable-line no-new

      expect(fixtureEl.querySelector('.form-range-ticks')).not.toHaveClass('form-range-ticks-clickable')

      fixtureEl.querySelectorAll('.form-range-tick-label')[2].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1 }))

      expect(fixtureEl.querySelectorAll('.form-range-input')[1].value).toEqual('75')
    })
  })

  describe('events', () => {
    it('should trigger a changed event with the current value', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = getRangeHtml()

        const rangeEl = fixtureEl.querySelector('.form-range')
        const inputEl = fixtureEl.querySelector('.form-range-input')
        new Range(rangeEl) // eslint-disable-line no-new

        inputEl.addEventListener('changed.coreui.range', event => {
          expect(event.value).toEqual(90)
          resolve()
        })

        inputEl.value = '90'
        inputEl.dispatchEvent(createEvent('input'))
      })
    })
  })

  describe('form reset', () => {
    it('should follow the values a form reset restores', async () => {
      fixtureEl.innerHTML = `<form>${getMultiHtml('data-coreui-tooltips')}</form>`

      const rangeEl = fixtureEl.querySelector('.form-range')
      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      new Range(rangeEl) // eslint-disable-line no-new

      low.value = '5'
      low.dispatchEvent(createEvent('input'))
      high.value = '95'
      high.dispatchEvent(createEvent('input'))

      fixtureEl.querySelector('form').reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(rangeEl.style.getPropertyValue('--cui-range-fill-start')).toEqual('0.25')
      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('0.75')
      expect([...fixtureEl.querySelectorAll('.tooltip-inner')].map(inner => inner.textContent)).toEqual(['25', '75'])
    })

    it('should stop following resets after dispose', async () => {
      fixtureEl.innerHTML = `<form>${getRangeHtml()}</form>`

      const rangeEl = fixtureEl.querySelector('.form-range')
      const inputEl = fixtureEl.querySelector('.form-range-input')
      const range = new Range(rangeEl)
      const spy = spyOn(range, '_update')

      range.dispose()
      inputEl.value = '5'
      fixtureEl.querySelector('form').reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('dispose', () => {
    it('should dispose the instance and remove decorations', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-tooltips')

      const rangeEl = fixtureEl.querySelector('.form-range')
      const range = new Range(rangeEl)

      expect(Range.getInstance(rangeEl)).not.toBeNull()
      expect(fixtureEl.querySelector('.form-range-tooltip')).not.toBeNull()

      range.dispose()

      expect(Range.getInstance(rangeEl)).toBeNull()
      expect(fixtureEl.querySelector('.form-range-tooltip')).toBeNull()
    })

    it('should hand back the markup it changed', () => {
      fixtureEl.innerHTML = getMultiHtml('data-coreui-ticks="Low, High"')

      const rangeEl = fixtureEl.querySelector('.form-range')
      const [low, high] = fixtureEl.querySelectorAll('.form-range-input')
      low.setAttribute('aria-valuetext', 'author text')
      const range = new Range(rangeEl, { tooltipsFormat: value => `${value} km` })

      range.dispose()

      expect(low.getAttribute('aria-valuetext')).toEqual('author text')
      expect(high.hasAttribute('aria-valuetext')).toBeFalse()
      expect([low.style.zIndex, high.style.zIndex]).toEqual(['', ''])
      expect(rangeEl.style.getPropertyValue('--cui-range-fill-start')).toEqual('')
      expect(fixtureEl.querySelector('.form-range-ticks')).toBeNull()
    })

    it('should end a track press in progress', () => {
      fixtureEl.innerHTML = getMultiHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const high = fixtureEl.querySelectorAll('.form-range-input')[1]
      const range = new Range(rangeEl)

      pressAt(rangeEl, 80)
      range.dispose()
      pressAt(rangeEl, 95, 'pointermove')

      expect(high.value).toEqual('80')
    })

    it('should leave alone what it did not set', () => {
      fixtureEl.innerHTML = getRangeHtml('data-coreui-track="false"')

      const rangeEl = fixtureEl.querySelector('.form-range')
      const inputEl = fixtureEl.querySelector('.form-range-input')
      const range = new Range(rangeEl)

      inputEl.setAttribute('aria-valuetext', 'author text')
      inputEl.style.zIndex = '5'
      rangeEl.style.setProperty('--cui-range-fill', '0.3')
      range.dispose()

      expect(inputEl.getAttribute('aria-valuetext')).toEqual('author text')
      expect(inputEl.style.zIndex).toEqual('5')
      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('0.3')
    })

    it('should stop following the input after dispose', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const inputEl = fixtureEl.querySelector('.form-range-input')
      const range = new Range(rangeEl)

      range.dispose()

      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('')

      inputEl.value = '75'
      inputEl.dispatchEvent(createEvent('input'))

      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('')
    })
  })

  describe('data-api', () => {
    it('should initialize every wrapper with a range input on DOMContentLoaded', () => {
      fixtureEl.innerHTML = [
        getRangeHtml(),
        '<input type="range" class="form-range" id="plain">'
      ].join('')

      document.dispatchEvent(new Event('DOMContentLoaded'))

      expect(Range.getInstance(fixtureEl.querySelector('div.form-range'))).toBeInstanceOf(Range)
      expect(Range.getInstance(fixtureEl.querySelector('#plain'))).toBeNull()
    })
  })

  describe('getInstance', () => {
    it('should return range instance', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const range = new Range(rangeEl)

      expect(Range.getInstance(rangeEl)).toEqual(range)
      expect(Range.getInstance(rangeEl)).toBeInstanceOf(Range)
    })

    it('should return null when there is no instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Range.getInstance(div)).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return existing instance', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const range = new Range(rangeEl)

      expect(Range.getOrCreateInstance(rangeEl)).toEqual(range)
      expect(Range.getOrCreateInstance(rangeEl)).toBeInstanceOf(Range)
    })

    it('should create new instance when none exists', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')

      expect(Range.getInstance(rangeEl)).toBeNull()
      expect(Range.getOrCreateInstance(rangeEl)).toBeInstanceOf(Range)
    })
  })

  describe('jQueryInterface', () => {
    it('should create a range via jQueryInterface', () => {
      fixtureEl.innerHTML = getRangeHtml()
      const rangeEl = fixtureEl.querySelector('.form-range')

      jQueryMock.fn.range = Range.jQueryInterface
      jQueryMock.elements = [rangeEl]
      jQueryMock.fn.range.call(jQueryMock)

      expect(Range.getInstance(rangeEl)).not.toBeNull()
    })

    it('should call a public method by name', () => {
      fixtureEl.innerHTML = getRangeHtml()
      const rangeEl = fixtureEl.querySelector('.form-range')
      const inputEl = fixtureEl.querySelector('.form-range-input')

      jQueryMock.fn.range = Range.jQueryInterface
      jQueryMock.elements = [rangeEl]
      jQueryMock.fn.range.call(jQueryMock)

      inputEl.value = '30'
      jQueryMock.fn.range.call(jQueryMock, 'update')

      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('0.3')
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = getRangeHtml()
      const rangeEl = fixtureEl.querySelector('.form-range')

      jQueryMock.fn.range = Range.jQueryInterface
      jQueryMock.elements = [rangeEl]

      expect(() => {
        jQueryMock.fn.range.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })
})

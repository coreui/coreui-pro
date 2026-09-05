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

      expect(range._input).toEqual(inputEl)
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

      expect(range._input).toBeNull()
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

    it('should stop following the input after dispose', () => {
      fixtureEl.innerHTML = getRangeHtml()

      const rangeEl = fixtureEl.querySelector('.form-range')
      const inputEl = fixtureEl.querySelector('.form-range-input')
      const range = new Range(rangeEl)

      range.dispose()

      inputEl.value = '75'
      inputEl.dispatchEvent(createEvent('input'))

      expect(rangeEl.style.getPropertyValue('--cui-range-fill')).toEqual('0.5')
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

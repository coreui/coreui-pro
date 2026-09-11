import DateRangeInput from '../../src/date-range-input.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('DateRangeInput', () => {
  let fixtureEl
  const instances = []

  const build = (config = {}, html = '<div id="range"></div>') => {
    fixtureEl.innerHTML = html
    const instance = new DateRangeInput(fixtureEl.querySelector('#range'), { format: 'dd.MM.yyyy', locale: 'en-US', ...config })
    instances.push(instance)
    return instance
  }

  const root = () => fixtureEl.querySelector('#range')
  const hiddenInputs = () => [...root().querySelectorAll('input[type="hidden"]')]
  const fields = () => [...root().querySelectorAll('.form-date-time')]

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    for (const instance of instances) {
      instance.dispose()
    }

    instances.length = 0
    clearFixture()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(DateRangeInput.VERSION).toEqual(expect.any(String))
    })
  })

  describe('constructor', () => {
    it('should build two date fields and a separator inside the frame', () => {
      build()

      expect(root().classList.contains('form-control-group')).toBeTrue()
      expect(root().classList.contains('form-date-range')).toBeTrue()
      expect(fields()).toHaveLength(2)
      expect(root().querySelector('.form-control-icon svg')).not.toBeNull()
      expect(root().querySelector('.form-control-icon').getAttribute('aria-hidden')).toEqual('true')
      expect([...root().children].map(child => child.className.split(' ')[0])).toEqual(['form-control', 'form-control-icon', 'form-control'])
    })

    it('should name the fields for assistive technology and the form', () => {
      build({ startName: 'from', endName: 'to' })

      expect(fields()[0].getAttribute('aria-label')).toEqual('Start date')
      expect(fields()[1].getAttribute('aria-label')).toEqual('End date')
      expect(hiddenInputs().map(input => input.name)).toEqual(['from', 'to'])
    })

    it('should seed the range and the form values', () => {
      const range = build({ startDate: new Date(2026, 6, 14), endDate: new Date(2026, 6, 20) })

      expect(range.getStartDate()).toEqual(new Date(2026, 6, 14))
      expect(range.getEndDate()).toEqual(new Date(2026, 6, 20))
      expect(hiddenInputs().map(input => input.value)).toEqual(['14.07.2026', '20.07.2026'])
    })

    it('should render floating labels per field', () => {
      build({ startFloatingLabel: 'Check-in', endFloatingLabel: 'Check-out' })

      expect([...root().querySelectorAll('.form-floating > label')].map(label => label.textContent)).toEqual(['Check-in', 'Check-out'])
      expect(fields()[0].getAttribute('aria-label')).toEqual('Check-in')
    })

    it('should size the frame and disable both fields', () => {
      build({ disabled: true, size: 'lg' })

      expect(root().classList.contains('form-control-lg')).toBeTrue()
      expect(fields().every(field => field.classList.contains('disabled'))).toBeTrue()
    })
  })

  describe('range state', () => {
    it('should set both dates, update the fields and emit once per change', () => {
      const range = build()
      const seen = []
      for (const name of ['startDateChange', 'endDateChange', 'rangeChange']) {
        root().addEventListener(`${name}.coreui.date-range-input`, event => seen.push([name, event.date ?? [event.startDate, event.endDate]]))
      }

      range.setRange(new Date(2026, 6, 14), new Date(2026, 6, 20))

      expect(hiddenInputs().map(input => input.value)).toEqual(['14.07.2026', '20.07.2026'])
      expect(seen.map(([name]) => name)).toEqual(['startDateChange', 'endDateChange', 'rangeChange'])
      expect(seen[2][1]).toEqual([new Date(2026, 6, 14), new Date(2026, 6, 20)])

      range.setRange(new Date(2026, 6, 14), new Date(2026, 6, 20))
      expect(seen).toHaveLength(3)

      range.setRange(new Date(2026, 6, 14), new Date(2026, 6, 21))
      expect(seen.slice(3).map(([name]) => name)).toEqual(['endDateChange', 'rangeChange'])
    })

    it('should follow a date typed into a field', () => {
      const range = build({ startDate: new Date(2026, 6, 14) })
      const seen = []
      root().addEventListener('rangeChange.coreui.date-range-input', event => seen.push(event))

      range._endInput.update({ date: new Date(2026, 6, 20) })

      expect(range.getEndDate()).toEqual(new Date(2026, 6, 20))
      expect(seen).toHaveLength(1)
      expect(seen[0].startDate).toEqual(new Date(2026, 6, 14))
    })

    it('should keep what the field kept when it refuses a date', () => {
      const range = build({ maxDate: new Date(2026, 6, 15) })

      range.setRange(new Date(2026, 6, 14), new Date(2026, 6, 20))

      expect(range.getStartDate()).toEqual(new Date(2026, 6, 14))
      expect(range.getEndDate()).toBeNull()
    })

    it('should flag an end before the start on the frame and lift it once fixed', () => {
      const range = build()

      range.setRange(new Date(2026, 6, 20), new Date(2026, 6, 14))
      expect(range.isRangeValid()).toBeFalse()
      expect(root().classList.contains('is-invalid')).toBeTrue()
      expect(fields().some(field => field.classList.contains('is-invalid'))).toBeFalse()

      range.setRange(new Date(2026, 6, 20), new Date(2026, 6, 21))
      expect(range.isRangeValid()).toBeTrue()
      expect(root().classList.contains('is-invalid')).toBeFalse()
    })

    it('should clear and reset', () => {
      const range = build({ startDate: new Date(2026, 6, 14), endDate: new Date(2026, 6, 20) })

      range.clear()
      expect(range.getStartDate()).toBeNull()
      expect(range.getEndDate()).toBeNull()
      expect(hiddenInputs().map(input => input.value)).toEqual(['', ''])

      range.reset()
      expect(range.getStartDate()).toEqual(new Date(2026, 6, 14))
      expect(range.getEndDate()).toEqual(new Date(2026, 6, 20))
    })

    it('should follow a native form reset through the fields', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<form><div id="range"></div></form>'
        const range = new DateRangeInput(root(), { format: 'dd.MM.yyyy', locale: 'en-US', startDate: new Date(2026, 6, 14) })
        instances.push(range)

        range.clear()
        fixtureEl.querySelector('form').reset()

        setTimeout(() => {
          expect(range.getStartDate()).toEqual(new Date(2026, 6, 14))
          resolve()
        }, 10)
      })
    })
  })

  describe('keyboard', () => {
    const sections = element => [...element.querySelectorAll('.form-date-time-section')]
    const press = (target, key) => target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))

    it('should carry the arrows across the separator', () => {
      build()
      const [start, end] = fields()
      const lastOfStart = sections(start).at(-1)
      const firstOfEnd = sections(end)[0]

      lastOfStart.focus()
      press(lastOfStart, 'ArrowRight')
      expect(document.activeElement).toBe(firstOfEnd)

      press(firstOfEnd, 'ArrowLeft')
      expect(document.activeElement).toBe(lastOfStart)
    })

    it('should keep the arrows inside a field away from its edge', () => {
      build()
      const [start] = fields()
      const first = sections(start)[0]

      first.focus()
      press(first, 'ArrowRight')
      expect(start.contains(document.activeElement)).toBeTrue()
      expect(document.activeElement).not.toBe(first)
    })

    it('should mirror the crossing in RTL', () => {
      build({}, '<div id="range" dir="rtl"></div>')
      const [start, end] = fields()
      const lastOfStart = sections(start).at(-1)

      lastOfStart.focus()
      press(lastOfStart, 'ArrowLeft')
      expect(document.activeElement).toBe(sections(end)[0])
    })
  })

  describe('markup roles', () => {
    const OWN_MARKUP = `<div id="range">
        <div data-coreui-range-start></div>
        <span class="mx-2" data-coreui-range-separator><svg viewBox="0 0 16 16"><path d="M0 8h16"/></svg></span>
        <div data-coreui-range-end></div>
      </div>`

    it('should adopt the hosts and the separator the author wrote', () => {
      const range = build({ startDate: new Date(2026, 6, 14) }, OWN_MARKUP)

      expect(root().querySelector('.form-control-icon')).toBeNull()
      expect(root().querySelector('[data-coreui-range-start] .form-date-time-section')).not.toBeNull()
      expect(root().querySelector('[data-coreui-range-end] .form-date-time-section')).not.toBeNull()
      expect(root().querySelector('[data-coreui-range-separator]').getAttribute('aria-hidden')).toEqual('true')
      expect(root().querySelector('[data-coreui-range-separator] svg').getAttribute('aria-hidden')).toEqual('true')
      expect(range.getStartDate()).toEqual(new Date(2026, 6, 14))
    })

    it('should leave the author\'s elements in place on dispose', () => {
      const range = build({}, OWN_MARKUP)

      range.dispose()
      instances.length = 0

      expect(root().querySelector('[data-coreui-range-start]')).not.toBeNull()
      expect(root().querySelector('[data-coreui-range-separator] svg')).not.toBeNull()
      expect(root().querySelector('[data-coreui-range-end]')).not.toBeNull()
      expect(root().classList.contains('form-control-group')).toBeFalse()
    })
  })

  describe('dispose', () => {
    it('should remove what it built and release the frame', () => {
      const range = build()

      range.dispose()
      instances.length = 0

      expect(root().children).toHaveLength(0)
      expect(root().classList.contains('form-control-group')).toBeFalse()
      expect(root().classList.contains('form-date-range')).toBeFalse()
    })
  })

  describe('jQueryInterface', () => {
    it('should create date-range-input', () => {
      fixtureEl.innerHTML = '<div id="range"></div>'

      jQueryMock.fn.dateRangeInput = DateRangeInput.jQueryInterface
      jQueryMock.elements = [root()]
      jQueryMock.fn.dateRangeInput.call(jQueryMock)

      expect(DateRangeInput.getInstance(root())).not.toBeNull()
      DateRangeInput.getInstance(root()).dispose()
    })

    it('should throw error on undefined method', () => {
      const range = build()

      jQueryMock.fn.dateRangeInput = DateRangeInput.jQueryInterface
      jQueryMock.elements = [root()]

      expect(() => {
        jQueryMock.fn.dateRangeInput.call(jQueryMock, 'undefinedMethod')
      }).toThrowError(TypeError, 'No method named "undefinedMethod"')

      range.clear()
    })
  })

  describe('data-api', () => {
    it('should initialise elements carrying the attribute on load', () => {
      fixtureEl.innerHTML = '<div id="range" data-coreui-date-range-input data-coreui-start-name="from"></div>'

      window.dispatchEvent(new Event('load'))

      expect(DateRangeInput.getInstance(root())).toBeInstanceOf(DateRangeInput)
      expect(hiddenInputs()[0].name).toEqual('from')
      DateRangeInput.getInstance(root()).dispose()
    })
  })
})

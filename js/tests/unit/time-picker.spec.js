/* eslint-env jasmine */

import TimePicker from '../../src/time-picker.js'
import {
  getFixture, clearFixture, createEvent, jQueryMock
} from '../helpers/fixture.js'

describe('TimePicker', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(TimePicker.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('constructor', () => {
    it('should create a time picker instance with default config if no config is provided', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      expect(tp).toBeInstanceOf(TimePicker)
      expect(tp._config).toBeDefined()
      expect(tp._element).toEqual(div)
    })

    it('should set initial time if provided in config', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const timeString = '10:15:30'
      const tp = new TimePicker(div, {
        time: timeString
      })

      // _date is set internally, check that it was interpreted as 10:15:30
      expect(tp._date).toBeInstanceOf(Date)
      expect(tp._date.getHours()).toBe(10)
      expect(tp._date.getMinutes()).toBe(15)
      expect(tp._date.getSeconds()).toBe(30)
    })

    it('should create input group and dropdown by default (type=dropdown)', () => {
      fixtureEl.innerHTML = '<div id="myTimePicker"></div>'
      const div = fixtureEl.querySelector('#myTimePicker')
      new TimePicker(div) // eslint-disable-line no-new

      // Check the structure
      const inputGroup = div.querySelector('.time-picker-input-group')
      expect(inputGroup).not.toBeNull()

      const dropdown = div.querySelector('.time-picker-dropdown')
      expect(dropdown).not.toBeNull()
    })

    it('should set size class if config.size is given', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { size: 'lg' }) // eslint-disable-line no-new

      expect(div.classList.contains('time-picker-lg')).toBeTrue()
    })

    it('should add "disabled" class if config.disabled is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { disabled: true }) // eslint-disable-line no-new

      expect(div.classList.contains('disabled')).toBeTrue()
    })

    it('should add "is-valid" class if config.valid is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { valid: true }) // eslint-disable-line no-new

      expect(div.classList.contains('is-valid')).toBeTrue()
    })

    it('should add "is-invalid" class if config.invalid is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      new TimePicker(div, { invalid: true }) // eslint-disable-line no-new

      expect(div.classList.contains('is-invalid')).toBeTrue()
    })
  })

  describe('toggle', () => {
    it('should show when toggled if not shown, and hide if shown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div)

        // Initially hidden
        expect(div.classList.contains('show')).toBeFalse()

        // Listen for show event
        div.addEventListener('shown.coreui.time-picker', () => {
          expect(div.classList.contains('show')).toBeTrue()

          // Toggle again to hide
          tp.toggle()
        })

        // Listen for hide event
        div.addEventListener('hidden.coreui.time-picker', () => {
          expect(div.classList.contains('show')).toBeFalse()
          resolve()
        })

        // Start toggling
        tp.toggle()
      })
    })
  })

  describe('show', () => {
    it('should do nothing if already shown', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      // Show it once
      tp.show()
      // Show it again
      tp.show()

      // Should still be shown exactly once
      expect(div.classList.contains('show')).toBeTrue()
    })

    it('should set aria-expanded="true" when shown', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      tp.show()
      expect(div.getAttribute('aria-expanded')).toBe('true')
    })

    it('should emit show.coreui.time-picker and shown.coreui.time-picker events', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new TimePicker(div) // eslint-disable-line no-new

        let showEventTriggered = false

        div.addEventListener('show.coreui.time-picker', () => {
          showEventTriggered = true
        })

        div.addEventListener('shown.coreui.time-picker', () => {
          expect(showEventTriggered).toBeTrue()
          expect(div.classList.contains('show')).toBeTrue()
          resolve()
        })

        TimePicker.getInstance(div).show()
      })
    })
  })

  describe('hide', () => {
    it('should emit hide.coreui.time-picker and hidden.coreui.time-picker events', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new TimePicker(div) // eslint-disable-line no-new

        let hideEventTriggered = false

        div.addEventListener('hide.coreui.time-picker', () => {
          hideEventTriggered = true
        })

        div.addEventListener('hidden.coreui.time-picker', () => {
          expect(hideEventTriggered).toBeTrue()
          expect(div.classList.contains('show')).toBeFalse()
          resolve()
        })

        // Show first, then hide
        TimePicker.getInstance(div).show()
        TimePicker.getInstance(div).hide()
      })
    })
  })

  describe('cancel', () => {
    it('should revert to _initialDate and emit timeChange', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const timeString = '11:30:00'
        const tp = new TimePicker(div, { time: timeString })

        tp.show() // sets _initialDate = new Date('1970-01-01 11:30:00')
        // Modify the time to something else
        tp._date = new Date('1970-01-01T13:00:00')

        div.addEventListener('timeChange.coreui.time-picker', event => {
          // Should revert to 11:30:00
          expect(event.date.getHours()).toBe(11)
          expect(event.date.getMinutes()).toBe(30)
          resolve()
        })

        tp.cancel()
      })
    })
  })

  describe('clear', () => {
    it('should set _date to null, clear the input value, emit timeChange', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, { time: '10:00:00' })

        div.addEventListener('timeChange.coreui.time-picker', event => {
          expect(event.date).toBeNull()
          expect(tp._date).toBeNull()
          expect(tp._input.value).toBe('')
          resolve()
        })

        tp.clear()
      })
    })
  })

  describe('reset', () => {
    it('should revert to the config.time, re-render, emit timeChange', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, { time: '10:00:00' })

        // Change it to something else
        tp._date = new Date('1970-01-01T15:00:00')
        expect(tp._date).not.toContain('10:')

        div.addEventListener('timeChange.coreui.time-picker', event => {
          // Should revert to '10:00:00'
          expect(event.date).toBeInstanceOf(Date)
          expect(event.date.getHours()).toBe(10)
          resolve()
        })

        tp.reset()
      })
    })
  })

  describe('update', () => {
    it('should update config, date, ampm, then re-render time picker selection', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '08:00:00' })

      const oldDate = tp._date
      tp.update({ time: '09:30:00' })

      expect(tp._date).not.toEqual(oldDate)
      expect(tp._date.getHours()).toBe(9)
      expect(tp._date.getMinutes()).toBe(30)
    })
  })

  describe('dispose', () => {
    it('should dispose the TimePicker instance', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      const spy = spyOn(tp, 'dispose').and.callThrough()

      tp.dispose()
      expect(spy).toHaveBeenCalled()
      expect(TimePicker.getInstance(div)).toBeNull()
    })
  })

  describe('Events', () => {
    it('should emit timeChange event when an item is clicked in the roll variant', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const tp = new TimePicker(div, {
          time: '01:00:00',
          variant: 'roll'
        })

        // Show so that body is rendered
        tp.show()

        // Wait for next tick
        setTimeout(() => {
          div.addEventListener('timeChange.coreui.time-picker', event => {
            expect(event.date.getHours()).toBe(2)
            resolve()
          })

          // Find the "2" hours cell in the roll
          const hourCells = div.querySelectorAll('[data-coreui-hours]')
          // hourCells likely includes "1", "2", "3", etc.
          const hourCell2 = Array.from(hourCells).find(cell =>
            cell.getAttribute('data-coreui-hours') === '2'
          )
          hourCell2.click()
        }, 10)
      })
    })
  })

  describe('data-api', () => {
    it('should initialize timePickers on load event', () => {
      fixtureEl.innerHTML = `
        <div id="tp1" data-coreui-toggle="time-picker" data-coreui-time="09:00:00"></div>
      `
      const tpEl = fixtureEl.querySelector('#tp1')

      // Trigger data-api load
      const loadEvent = createEvent('load')
      window.dispatchEvent(loadEvent)

      const tp = TimePicker.getInstance(tpEl)
      expect(tp).not.toBeNull()
      expect(tp._date.getHours()).toBe(9)
    })
  })

  describe('jQueryInterface', () => {
    it('should create a time picker via jQueryInterface', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [div]
      jQueryMock.fn.timePicker.call(jQueryMock)

      expect(TimePicker.getInstance(div)).not.toBeNull()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [div]

      expect(() => {
        jQueryMock.fn.timePicker.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })

  describe('getInstance', () => {
    it('should return timePicker instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)

      expect(TimePicker.getInstance(div)).toEqual(tp)
      expect(TimePicker.getInstance(div)).toBeInstanceOf(TimePicker)
    })

    it('should return null when there is no timePicker instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      expect(TimePicker.getInstance(div)).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return the existing instance if it exists', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div)
      expect(TimePicker.getOrCreateInstance(div)).toBe(tp)
    })

    it('should create a new instance if it does not exist', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      expect(TimePicker.getInstance(div)).toBeNull()

      const tp = TimePicker.getOrCreateInstance(div, {
        time: '12:45:00'
      })
      expect(tp).toBeInstanceOf(TimePicker)
      expect(tp._date.getHours()).toBe(12)
      expect(tp._date.getMinutes()).toBe(45)
    })

    it('should ignore new config if instance already exists', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const tp = new TimePicker(div, { time: '01:00:00' })
      const tp2 = TimePicker.getOrCreateInstance(div, { time: '05:00:00' })

      expect(tp2).toBe(tp)
      // The new time should not override the old config
      expect(tp._date.getHours()).toBe(1)
    })
  })
})

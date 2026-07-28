/* eslint-env jasmine */

import TimeInput from '../../src/time-input.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('TimeInput', () => {
  let fixtureEl

  const createTimeInput = (config = {}) => {
    fixtureEl.innerHTML = '<div id="mytimeinput"></div>'
    const element = fixtureEl.querySelector('div')
    return new TimeInput(element, { format: 'HH:mm', ...config })
  }

  const getSections = element => element.querySelectorAll('.form-date-time-section')

  const pressKey = (target, key) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  }

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(TimeInput.DATA_KEY).toEqual('coreui.time-input')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(TimeInput.NAME).toEqual('time-input')
    })
  })

  describe('constructor', () => {
    it('should create hour and minute sections from the format', () => {
      const timeInput = createTimeInput()
      const [hour, minute] = getSections(timeInput._element)

      expect(getSections(timeInput._element)).toHaveSize(2)
      expect(hour.textContent).toEqual('HH')
      expect(minute.textContent).toEqual('mm')
      expect(hour.getAttribute('aria-label')).toEqual('Hour')
      expect(minute.getAttribute('aria-label')).toEqual('Minute')
      expect(hour.getAttribute('aria-valuemin')).toEqual('0')
      expect(hour.getAttribute('aria-valuemax')).toEqual('23')
    })

    it('should derive a meridiem section from a 12-hour locale', () => {
      fixtureEl.innerHTML = '<div></div>'
      const timeInput = new TimeInput(fixtureEl.querySelector('div'), { locale: 'en-US' })
      const sections = getSections(timeInput._element)
      const meridiem = sections[sections.length - 1]

      expect(meridiem.getAttribute('aria-label')).toEqual('AM/PM')
      expect(meridiem.getAttribute('inputmode')).toEqual('text')
    })

    it('should include seconds when enabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const timeInput = new TimeInput(fixtureEl.querySelector('div'), { locale: 'pl-PL', seconds: true })

      expect(getSections(timeInput._element)).toHaveSize(3)
    })

    it('should fill sections from the initial date', () => {
      const timeInput = createTimeInput({ date: new Date(2026, 6, 14, 14, 30) })
      const [hour, minute] = getSections(timeInput._element)

      expect(hour.textContent).toEqual('14')
      expect(minute.textContent).toEqual('30')
      expect(timeInput._element.querySelector('input[type="hidden"]').value).toEqual('14:30')
    })

    it('should accept a time string as the initial value', () => {
      const timeInput = createTimeInput({ date: '09:30' })

      expect(timeInput.getDate()).toEqual(new Date(1970, 0, 1, 9, 30))
      expect(timeInput._element.querySelector('input[type="hidden"]').value).toEqual('09:30')
    })

    it('should accept 12-hour time strings with a day period', () => {
      const timeInput = createTimeInput({ date: '2:30 PM' })

      expect(timeInput.getDate()).toEqual(new Date(1970, 0, 1, 14, 30))
    })

    it('should accept time strings with seconds', () => {
      const timeInput = createTimeInput({ format: 'HH:mm:ss', date: '09:30:15' })

      expect(timeInput.getDate()).toEqual(new Date(1970, 0, 1, 9, 30, 15))
    })

    it('should accept time strings as min and max', () => {
      const timeInput = createTimeInput({ date: '09:30', minDate: '09:00', maxDate: '17:00' })
      const [hour] = getSections(timeInput._element)

      hour.focus()
      pressKey(hour, 'ArrowDown')

      expect(timeInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(timeInput.getDate()).toBeNull()
    })
  })

  describe('typing', () => {
    it('should complete the minute section when the digit is unambiguous', () => {
      const timeInput = createTimeInput()
      const [, minute] = getSections(timeInput._element)

      minute.focus()
      pressKey(minute, '7')

      expect(minute.textContent).toEqual('07')
    })

    it('should emit timeChange with a 1970-01-01 date when complete', () => {
      const timeInput = createTimeInput()
      const element = timeInput._element
      const spy = jasmine.createSpy('timeChange')
      element.addEventListener('timeChange.coreui.time-input', spy)

      const [hour, minute] = getSections(element)

      hour.focus()
      pressKey(hour, '1')
      pressKey(hour, '4')
      pressKey(minute, '3')
      pressKey(minute, '0')

      expect(spy).toHaveBeenCalled()
      expect(spy.calls.mostRecent().args[0].date).toEqual(new Date(1970, 0, 1, 14, 30))
      expect(timeInput.getDate()).toEqual(new Date(1970, 0, 1, 14, 30))
    })

    it('should wrap the hour with arrow keys', () => {
      const timeInput = createTimeInput({ date: '23:30' })
      const [hour] = getSections(timeInput._element)

      hour.focus()
      pressKey(hour, 'ArrowUp')
      expect(hour.textContent).toEqual('00')

      pressKey(hour, 'ArrowDown')
      expect(hour.textContent).toEqual('23')
    })

    it('should start an empty hour at the boundary', () => {
      const timeInput = createTimeInput()
      const [hour] = getSections(timeInput._element)

      hour.focus()
      pressKey(hour, 'ArrowDown')

      expect(hour.textContent).toEqual('23')
    })
  })

  describe('12-hour cycle', () => {
    it('should match day periods with letters and convert the value', () => {
      const timeInput = createTimeInput({ format: 'hh:mm A', locale: 'en-US', date: new Date(2026, 6, 14, 9, 30) })
      const sections = getSections(timeInput._element)
      const [hour, , meridiem] = sections

      expect(hour.textContent).toEqual('09')
      expect(meridiem.textContent).toEqual('AM')

      meridiem.focus()
      pressKey(meridiem, 'p')

      expect(meridiem.textContent).toEqual('PM')
      expect(timeInput.getDate()).toEqual(new Date(1970, 0, 1, 21, 30))
    })

    it('should toggle the day period with arrow keys', () => {
      const timeInput = createTimeInput({ format: 'hh:mm A', locale: 'en-US', date: new Date(2026, 6, 14, 9, 30) })
      const sections = getSections(timeInput._element)
      const meridiem = sections[sections.length - 1]

      meridiem.focus()
      pressKey(meridiem, 'ArrowUp')

      expect(meridiem.textContent).toEqual('PM')
    })
  })

  describe('paste', () => {
    it('should fill sections from a pasted time', () => {
      const timeInput = createTimeInput()
      const event = new Event('paste', { bubbles: true, cancelable: true })
      event.clipboardData = { getData: () => '14:30' }
      getSections(timeInput._element)[0].dispatchEvent(event)

      expect(timeInput.getDate()).toEqual(new Date(1970, 0, 1, 14, 30))
    })
  })

  describe('jQueryInterface', () => {
    it('should create a time input', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.timeInput = TimeInput.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.timeInput.call(jQueryMock)

      expect(TimeInput.getInstance(div)).not.toBeNull()
    })
  })
})

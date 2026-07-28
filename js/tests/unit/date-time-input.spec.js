/* eslint-env jasmine */

import DateTimeInput from '../../src/date-time-input.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('DateTimeInput', () => {
  let fixtureEl

  const createDateTimeInput = (config = {}) => {
    fixtureEl.innerHTML = '<div id="mydatetimeinput"></div>'
    const element = fixtureEl.querySelector('div')
    return new DateTimeInput(element, { format: 'dd.MM.yyyy HH:mm', ...config })
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
      expect(DateTimeInput.DATA_KEY).toEqual('coreui.date-time-input')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(DateTimeInput.NAME).toEqual('date-time-input')
    })
  })

  describe('constructor', () => {
    it('should create date and time sections from the format', () => {
      const dateTimeInput = createDateTimeInput()
      const sections = getSections(dateTimeInput._element)

      expect(sections).toHaveSize(5)
      expect([...sections].map(section => section.dataset.coreuiSection))
        .toEqual(['day', 'month', 'year', 'hour', 'minute'])
    })

    it('should derive date and time sections from the locale', () => {
      fixtureEl.innerHTML = '<div></div>'
      const dateTimeInput = new DateTimeInput(fixtureEl.querySelector('div'), { locale: 'pl-PL' })

      expect([...getSections(dateTimeInput._element)].map(section => section.dataset.coreuiSection))
        .toEqual(['day', 'month', 'year', 'hour', 'minute'])
    })

    it('should fill sections and the hidden input from the initial date', () => {
      const dateTimeInput = createDateTimeInput({ date: new Date(2026, 6, 14, 14, 30) })

      expect(dateTimeInput._element.querySelector('input[type="hidden"]').value).toEqual('14.07.2026 14:30')
    })

    it('should keep the time part of an initial date string', () => {
      const dateTimeInput = createDateTimeInput({ date: '2026-07-14 14:30' })

      expect(dateTimeInput.getDate()).toEqual(new Date(2026, 6, 14, 14, 30))
    })
  })

  describe('typing', () => {
    it('should emit dateChange with the full date and time when complete', () => {
      const dateTimeInput = createDateTimeInput()
      const element = dateTimeInput._element
      const spy = jasmine.createSpy('dateChange')
      element.addEventListener('dateChange.coreui.date-time-input', spy)

      const [day, month, year, hour, minute] = getSections(element)

      day.focus()
      pressKey(day, '4')
      pressKey(month, '7')
      for (const digit of '2026') {
        pressKey(year, digit)
      }

      pressKey(hour, '1')
      pressKey(hour, '4')
      pressKey(minute, '3')
      pressKey(minute, '0')

      expect(spy).toHaveBeenCalled()
      expect(spy.calls.mostRecent().args[0].date).toEqual(new Date(2026, 6, 4, 14, 30))
      expect(dateTimeInput.getDate()).toEqual(new Date(2026, 6, 4, 14, 30))
    })

    it('should clamp the day when the month changes', () => {
      const dateTimeInput = createDateTimeInput({ date: new Date(2026, 0, 31, 12, 0) })
      const [day, month] = getSections(dateTimeInput._element)

      month.focus()
      pressKey(month, '2')

      expect(day.textContent).toEqual('28')
      expect(dateTimeInput.getDate()).toEqual(new Date(2026, 1, 28, 12, 0))
    })
  })

  describe('paste', () => {
    it('should fill all sections from a pasted date and time', () => {
      const dateTimeInput = createDateTimeInput()
      const event = new Event('paste', { bubbles: true, cancelable: true })
      event.clipboardData = { getData: () => '14.07.2026 14:30' }
      getSections(dateTimeInput._element)[0].dispatchEvent(event)

      expect(dateTimeInput.getDate()).toEqual(new Date(2026, 6, 14, 14, 30))
    })
  })

  describe('jQueryInterface', () => {
    it('should create a date-time input', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.dateTimeInput = DateTimeInput.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.dateTimeInput.call(jQueryMock)

      expect(DateTimeInput.getInstance(div)).not.toBeNull()
    })
  })
})

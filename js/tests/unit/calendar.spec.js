/* eslint-env jasmine */

import Calendar from '../../src/calendar.js'
import {
  getFixture, clearFixture, createEvent, jQueryMock
} from '../helpers/fixture.js'
import EventHandler from '../../src/dom/event-handler.js'

describe('Calendar', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(Calendar.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(Calendar.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('NAME', () => {
    it('should return plugin NAME', () => {
      expect(Calendar.NAME).toEqual('calendar')
    })
  })

  describe('constructor', () => {
    it('should create a Calendar instance with default config if no config is provided', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      expect(calendar).toBeInstanceOf(Calendar)
      expect(calendar._config).toBeDefined()
      expect(calendar._element).toEqual(div)
    })

    it('should allow overriding default config', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        locale: 'fr',
        calendars: 2,
        selectionType: 'month'
      })

      expect(calendar._config.locale).toEqual('fr')
      expect(calendar._config.calendars).toEqual(2)
      expect(calendar._config.selectionType).toEqual('month')
    })

    it('should set `_view` based on `selectionType`', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        selectionType: 'year'
      })

      expect(calendar._view).toEqual('years')
    })

    it('should properly create the initial markup for days view', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      new Calendar(div) // eslint-disable-line no-new

      // Check if .calendar container is created
      expect(div.querySelector('.calendar')).not.toBeNull()

      // Check if .calendar-nav exists
      expect(div.querySelector('.calendar-nav')).not.toBeNull()

      // Check if a table with <thead> is created (days view)
      expect(div.querySelector('.calendar table thead')).not.toBeNull()
      expect(div.querySelector('.calendar table tbody')).not.toBeNull()
    })
  })

  describe('update', () => {
    it('should clear the calendar HTML and create a new one', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const oldHtml = div.innerHTML

      calendar.update({
        selectionType: 'month'
      })

      expect(div.innerHTML).not.toEqual(oldHtml)
      // Now we should see the months view
      expect(div.querySelector('.calendar table thead')).toBeNull()
      expect(div.querySelector('.calendar table tbody')).not.toBeNull()
      expect(div.querySelector('.month')).not.toBeNull()
    })

    it('should use the new config object after update', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      calendar.update({
        showWeekNumber: true
      })

      expect(calendar._config.showWeekNumber).toBeTrue()
      expect(div.classList).toContain('show-week-numbers')
    })
  })

  describe('keyboard navigation', () => {
    it('should select a date on Enter key press', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const calendar = new Calendar(div)
        const showSpy = spyOn(calendar, '_handleCalendarClick').and.callThrough()

        setTimeout(() => {
          const dayCell = div.querySelector('.calendar-cell[tabindex="0"]')
          expect(dayCell).not.toBeNull()

          const keydownEvent = createEvent('keydown')
          keydownEvent.key = 'Enter'
          dayCell.dispatchEvent(keydownEvent)

          expect(showSpy).toHaveBeenCalled()
          resolve()
        }, 10)
      })
    })
  })

  describe('events', () => {
    it('should emit `calendarDateChange.coreui.calendar` when the calendar date changes', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const listener = jasmine.createSpy('listener')

      div.addEventListener('calendarDateChange.coreui.calendar', listener)
      // For example, go to next month
      calendar._modifyCalendarDate(0, 1)

      expect(listener).toHaveBeenCalled()
    })

    it('should emit `startDateChange.coreui.calendar` when the start date is set', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const listener = jasmine.createSpy('listener')

      div.addEventListener('startDateChange.coreui.calendar', listener)
      calendar._setStartDate(new Date())

      expect(listener).toHaveBeenCalled()
    })

    it('should emit `endDateChange.coreui.calendar` when the end date is set', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const listener = jasmine.createSpy('listener')

      div.addEventListener('endDateChange.coreui.calendar', listener)
      calendar._setEndDate(new Date())

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('dispose', () => {
    it('should dispose Calendar instance', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)
      const spy = spyOn(EventHandler, 'off').and.callThrough()

      expect(calendar._element).toEqual(div)
      calendar.dispose()

      // Typically, you'd set `_element` to null after disposing
      expect(calendar._element).toBeNull()
      // Should remove all event handlers
      expect(spy.calls.count()).toBeGreaterThan(0)
    })
  })

  describe('jQueryInterface', () => {
    it('should create a calendar via jQueryInterface', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="calendar"></div>'
      const element = fixtureEl.querySelector('[data-coreui-toggle="calendar"]')

      jQueryMock.fn.calendar = Calendar.jQueryInterface
      jQueryMock.elements = [element]
      jQueryMock.fn.calendar.call(jQueryMock)

      expect(Calendar.getInstance(element)).not.toBeNull()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="calendar"></div>'
      const element = fixtureEl.querySelector('[data-coreui-toggle="calendar"]')

      jQueryMock.fn.calendar = Calendar.jQueryInterface
      jQueryMock.elements = [element]

      expect(() => {
        jQueryMock.fn.calendar.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })

  describe('getInstance', () => {
    it('should return calendar instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      expect(Calendar.getInstance(div)).toEqual(calendar)
      expect(Calendar.getInstance(div)).toBeInstanceOf(Calendar)
    })

    it('should return null when there is no calendar instance', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      expect(Calendar.getInstance(div)).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return calendar instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div)

      expect(Calendar.getOrCreateInstance(div)).toEqual(calendar)
      expect(Calendar.getInstance(div)).toEqual(Calendar.getOrCreateInstance(div, {}))
      expect(Calendar.getOrCreateInstance(div)).toBeInstanceOf(Calendar)
    })

    it('should return new instance when there is no calendar instance', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Calendar.getInstance(div)).toBeNull()
      expect(Calendar.getOrCreateInstance(div)).toBeInstanceOf(Calendar)
    })

    it('should return new instance when there is no calendar instance with given configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      expect(Calendar.getInstance(div)).toBeNull()
      const calendar = Calendar.getOrCreateInstance(div, {
        calendars: 3
      })
      expect(calendar).toBeInstanceOf(Calendar)
      expect(calendar._config.calendars).toEqual(3)
    })

    it('should return the same instance when exists, ignoring new configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const calendar = new Calendar(div, {
        calendars: 2
      })

      const calendar2 = Calendar.getOrCreateInstance(div, {
        calendars: 5
      })
      expect(calendar2).toEqual(calendar)
      // Original config is still used
      expect(calendar2._config.calendars).toEqual(2)
    })
  })
})

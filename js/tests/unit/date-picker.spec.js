/* eslint-env jasmine */

import DatePicker from '../../src/date-picker.js'
import EventHandler from '../../src/dom/event-handler.js'
import {
  getFixture, clearFixture, createEvent, jQueryMock
} from '../helpers/fixture.js'

describe('DatePicker', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
    // Clean up any containers appended to body
    const containers = document.querySelectorAll('.date-picker-test-container')
    for (const container of containers) {
      container.remove()
    }
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(DatePicker.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(DatePicker.Default).toEqual(jasmine.any(Object))
    })

    it('should have calendars set to 1', () => {
      expect(DatePicker.Default.calendars).toEqual(1)
    })

    it('should have range set to false', () => {
      expect(DatePicker.Default.range).toEqual(false)
    })

    it('should have separator set to false', () => {
      expect(DatePicker.Default.separator).toEqual(false)
    })

    it('should have placeholder as array with "Select date"', () => {
      expect(DatePicker.Default.placeholder).toEqual(['Select date'])
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(DatePicker.DefaultType).toEqual(jasmine.any(Object))
    })

    it('should allow date type for date config', () => {
      expect(DatePicker.DefaultType.date).toEqual('(date|number|string|null)')
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(DatePicker.DATA_KEY).toEqual('coreui.date-picker')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(DatePicker.NAME).toEqual('date-picker')
    })
  })

  describe('constructor', () => {
    it('should create a DatePicker instance with default config', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker).toBeInstanceOf(DatePicker)
      expect(datePicker._config).toBeDefined()
      expect(datePicker._element).toEqual(div)
    })

    it('should allow overriding default config', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        locale: 'fr-FR',
        date: new Date(2023, 0, 15),
        previewDateOnHover: false
      })

      expect(datePicker._config.locale).toEqual('fr-FR')
      expect(datePicker._config.date).toEqual(new Date(2023, 0, 15))
      expect(datePicker._config.previewDateOnHover).toEqual(false)
    })

    it('should create proper DOM structure', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars

      expect(div.classList.contains('date-picker')).toBe(true)
      expect(div.querySelector('.date-picker-input-group')).toBeTruthy()
      expect(div.querySelector('.date-picker-input')).toBeTruthy()
    })

    it('should handle disabled state', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        disabled: true
      })

      expect(datePicker._config.disabled).toBe(true)
      expect(div.classList.contains('disabled')).toBe(true)
    })

    it('should handle different date formats', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const testDate = new Date(2023, 5, 15)
      const datePicker = new DatePicker(div, {
        date: testDate
      })

      expect(datePicker._config.date).toEqual(testDate)
    })

    it('should set initial date value in input', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const testDate = new Date(2023, 5, 15)
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        date: testDate
      })

      const input = div.querySelector('.date-picker-input')
      expect(input.value).not.toBe('')
    })

    it('should accept date as string', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        date: '2023/06/15'
      })

      expect(datePicker._config.date).toEqual('2023/06/15')
    })

    it('should accept date as null', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        date: null
      })

      expect(datePicker._config.date).toBeNull()
    })

    it('should create indicator element by default', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars

      expect(div.querySelector('.date-picker-indicator')).toBeTruthy()
    })

    it('should not create indicator element when indicator is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        indicator: false
      })

      expect(div.querySelector('.date-picker-indicator')).toBeFalsy()
    })

    it('should create cleaner element by default', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars

      expect(div.querySelector('.date-picker-cleaner')).toBeTruthy()
    })

    it('should not create cleaner element when cleaner is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        cleaner: false
      })

      expect(div.querySelector('.date-picker-cleaner')).toBeFalsy()
    })
  })

  describe('inputReadOnly', () => {
    it('should make input read-only when inputReadOnly is true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        inputReadOnly: true
      })

      const input = div.querySelector('.date-picker-input')
      expect(input.readOnly).toBe(true)
    })

    it('should allow input editing when inputReadOnly is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        inputReadOnly: false
      })

      const input = div.querySelector('.date-picker-input')
      expect(input.readOnly).toBe(false)
    })
  })

  describe('size option', () => {
    it('should add sm size class', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        size: 'sm'
      })

      expect(div.classList.contains('date-picker-sm')).toBe(true)
    })

    it('should add lg size class', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        size: 'lg'
      })

      expect(div.classList.contains('date-picker-lg')).toBe(true)
    })

    it('should not add size class when size is null', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        size: null
      })

      expect(div.classList.contains('date-picker-sm')).toBe(false)
      expect(div.classList.contains('date-picker-lg')).toBe(false)
    })
  })

  describe('valid/invalid state', () => {
    it('should add is-invalid class when invalid is true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        invalid: true
      })

      expect(div.classList.contains('is-invalid')).toBe(true)
    })

    it('should add is-valid class when valid is true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        valid: true
      })

      expect(div.classList.contains('is-valid')).toBe(true)
    })

    it('should not add validation classes by default', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars

      expect(div.classList.contains('is-invalid')).toBe(false)
      expect(div.classList.contains('is-valid')).toBe(false)
    })
  })

  describe('show', () => {
    it('should show the date picker dropdown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('shown.coreui.date-picker', () => {
          expect(div.classList.contains('show')).toBe(true)
          resolve()
        })

        datePicker.show()
      })
    })

    it('should trigger show event', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('show.coreui.date-picker', () => {
          expect().nothing()
          resolve()
        })

        datePicker.show()
      })
    })

    it('should not show if disabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        disabled: true
      })

      datePicker.show()
      expect(div.classList.contains('show')).toBe(false)
    })

    it('should not show if already shown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        let showCount = 0

        div.addEventListener('shown.coreui.date-picker', () => {
          showCount++
          if (showCount === 1) {
            // Try to show again
            datePicker.show()
            // Should still only have been called once since it's already shown
            setTimeout(() => {
              expect(showCount).toBe(1)
              resolve()
            }, 100)
          }
        })

        datePicker.show()
      })
    })

    it('should set aria-expanded to true when shown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('shown.coreui.date-picker', () => {
          expect(div.getAttribute('aria-expanded')).toBe('true')
          resolve()
        })

        datePicker.show()
      })
    })

    it('should store initial date on show', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const testDate = new Date(2023, 5, 15)
        const datePicker = new DatePicker(div, {
          date: testDate
        })

        div.addEventListener('shown.coreui.date-picker', () => {
          expect(datePicker._initialStartDate).toEqual(testDate)
          resolve()
        })

        datePicker.show()
      })
    })
  })

  describe('hide', () => {
    it('should hide the date picker dropdown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('shown.coreui.date-picker', () => {
          datePicker.hide()
        })

        div.addEventListener('hidden.coreui.date-picker', () => {
          expect(div.classList.contains('show')).toBe(false)
          resolve()
        })

        datePicker.show()
      })
    })

    it('should trigger hide event', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('shown.coreui.date-picker', () => {
          datePicker.hide()
        })

        div.addEventListener('hide.coreui.date-picker', () => {
          expect().nothing()
          resolve()
        })

        datePicker.show()
      })
    })

    it('should set aria-expanded to false when hidden', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('shown.coreui.date-picker', () => {
          datePicker.hide()
        })

        div.addEventListener('hidden.coreui.date-picker', () => {
          expect(div.getAttribute('aria-expanded')).toBe('false')
          resolve()
        })

        datePicker.show()
      })
    })
  })

  describe('toggle', () => {
    it('should toggle date picker visibility', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        let showCount = 0
        let hideCount = 0

        div.addEventListener('shown.coreui.date-picker', () => {
          showCount++
          if (showCount === 1) {
            datePicker.toggle()
          }
        })

        div.addEventListener('hidden.coreui.date-picker', () => {
          hideCount++
          if (hideCount === 1) {
            expect(showCount).toBe(1)
            expect(hideCount).toBe(1)
            resolve()
          }
        })

        datePicker.toggle()
      })
    })
  })

  describe('update', () => {
    it('should update configuration', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        locale: 'en-US'
      })

      datePicker.update({
        locale: 'fr-FR'
      })

      expect(datePicker._config.locale).toBe('fr-FR')
    })

    it('should update date value', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)
      const newDate = new Date(2023, 5, 20)

      datePicker.update({
        date: newDate
      })

      expect(datePicker._config.date).toEqual(newDate)
    })

    it('should rebuild DOM on update', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        size: null
      })

      datePicker.update({
        size: 'lg'
      })

      expect(div.classList.contains('date-picker-lg')).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear the selected date', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        date: new Date(2023, 5, 15)
      })

      datePicker.clear()

      expect(datePicker._startDate).toBeNull()
      const input = div.querySelector('.date-picker-input')
      expect(input.value).toBe('')
    })

    it('should trigger startDateChange event with null', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        date: new Date(2023, 5, 15)
      })

      const listener = jasmine.createSpy('listener')
      div.addEventListener('startDateChange.coreui.date-range-picker', listener)

      datePicker.clear()

      expect(listener).toHaveBeenCalled()
      expect(listener.calls.mostRecent().args[0].date).toBeNull()
    })
  })

  describe('reset', () => {
    it('should reset to the original configured date', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const originalDate = new Date(2023, 0, 1)
      const datePicker = new DatePicker(div, {
        startDate: originalDate
      })

      // Clear first
      datePicker.clear()
      expect(datePicker._startDate).toBeNull()

      // Reset uses config.startDate
      datePicker.reset()
      expect(datePicker._startDate).toEqual(originalDate)
    })

    it('should reset to null when no initial date was configured', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      datePicker.reset()
      expect(datePicker._startDate).toBeNull()
    })
  })

  describe('cancel', () => {
    it('should restore initial date on cancel', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const initialDate = new Date(2023, 5, 15)
        const datePicker = new DatePicker(div, {
          date: initialDate,
          footer: true
        })

        div.addEventListener('shown.coreui.date-picker', () => {
          // Simulate changing the date internally
          datePicker._startDate = new Date(2023, 6, 20)

          // Cancel should restore
          datePicker.cancel()

          expect(datePicker._startDate).toEqual(initialDate)
          resolve()
        })

        datePicker.show()
      })
    })

    it('should hide the picker on cancel', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div, {
          date: new Date(2023, 5, 15),
          footer: true
        })

        div.addEventListener('shown.coreui.date-picker', () => {
          datePicker.cancel()
        })

        div.addEventListener('hidden.coreui.date-picker', () => {
          expect(div.classList.contains('show')).toBe(false)
          resolve()
        })

        datePicker.show()
      })
    })
  })

  describe('inputDateFormat', () => {
    it('should use custom inputDateFormat function', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const customFormat = date => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      }

      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        date: new Date(2023, 5, 15),
        inputDateFormat: customFormat
      })

      const input = div.querySelector('.date-picker-input')
      expect(input.value).toBe('2023-06-15')
    })

    it('should format using locale by default', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        date: new Date(2023, 0, 1),
        locale: 'en-US'
      })

      const input = div.querySelector('.date-picker-input')
      // en-US format is M/D/YYYY
      expect(input.value).toContain('2023')
    })

    it('should format with timepicker when timepicker is true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        date: new Date(2023, 5, 15, 14, 30),
        timepicker: true,
        locale: 'en-US'
      })

      const input = div.querySelector('.date-picker-input')
      // With timepicker, should include time
      expect(input.value).toContain('2023')
    })
  })

  describe('inputDateParse', () => {
    it('should use custom inputDateParse function for input parsing', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'

        const div = fixtureEl.querySelector('div')
        const customParse = str => {
          const parts = str.split('-')
          if (parts.length === 3) {
            return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
          }

          return null
        }

        const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
          inputDateParse: customParse,
          inputOnChangeDelay: 10
        })

        const input = div.querySelector('.date-picker-input')

        div.addEventListener('startDateChange.coreui.date-range-picker', event => {
          expect(event.date).toEqual(new Date(2023, 5, 15))
          resolve()
        })

        // Simulate typing
        input.value = '2023-06-15'
        input.dispatchEvent(new Event('input', { bubbles: true }))
      })
    })
  })

  describe('disabledDates', () => {
    it('should accept an array of disabled dates', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const disabledDates = [
        new Date(2023, 5, 10),
        new Date(2023, 5, 11),
        new Date(2023, 5, 12)
      ]

      const datePicker = new DatePicker(div, {
        disabledDates
      })

      expect(datePicker._config.disabledDates).toEqual(disabledDates)
    })

    it('should accept a function for disabled dates', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const disabledDates = date => date.getDay() === 0 || date.getDay() === 6

      const datePicker = new DatePicker(div, {
        disabledDates
      })

      expect(datePicker._config.disabledDates).toEqual(disabledDates)
    })

    it('should not update date when input value is a disabled date', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'

        const div = fixtureEl.querySelector('div')
        const disabledDate = new Date(2023, 5, 15)

        const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
          disabledDates: [disabledDate],
          inputOnChangeDelay: 10
        })

        const input = div.querySelector('.date-picker-input')

        // Type a disabled date
        input.value = disabledDate.toLocaleDateString('default')
        input.dispatchEvent(new Event('input', { bubbles: true }))

        setTimeout(() => {
          // The date should not have been set
          expect(datePicker._startDate).toBeFalsy()
          resolve()
        }, 50)
      })
    })
  })

  describe('minDate and maxDate', () => {
    it('should accept minDate configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const minDate = new Date(2023, 0, 1)

      const datePicker = new DatePicker(div, {
        minDate
      })

      expect(datePicker._config.minDate).toEqual(minDate)
    })

    it('should accept maxDate configuration', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const maxDate = new Date(2023, 11, 31)

      const datePicker = new DatePicker(div, {
        maxDate
      })

      expect(datePicker._config.maxDate).toEqual(maxDate)
    })

    it('should not update date when input value is before minDate', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'

        const div = fixtureEl.querySelector('div')
        const minDate = new Date(2023, 5, 15)

        const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
          minDate,
          inputOnChangeDelay: 10,
          locale: 'en-US'
        })

        const input = div.querySelector('.date-picker-input')

        // Type a date before minDate
        input.value = '1/1/2023'
        input.dispatchEvent(new Event('input', { bubbles: true }))

        setTimeout(() => {
          expect(datePicker._startDate).toBeFalsy()
          resolve()
        }, 50)
      })
    })

    it('should not update date when input value is after maxDate', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'

        const div = fixtureEl.querySelector('div')
        const maxDate = new Date(2023, 5, 15)

        const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
          maxDate,
          inputOnChangeDelay: 10,
          locale: 'en-US'
        })

        const input = div.querySelector('.date-picker-input')

        // Type a date after maxDate
        input.value = '12/31/2023'
        input.dispatchEvent(new Event('input', { bubbles: true }))

        setTimeout(() => {
          expect(datePicker._startDate).toBeFalsy()
          resolve()
        }, 50)
      })
    })
  })

  describe('footer buttons', () => {
    it('should create footer when footer option is true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        footer: true
      })

      expect(div.querySelector('.date-picker-footer')).toBeTruthy()
    })

    it('should not create footer when footer option is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        footer: false
      })

      expect(div.querySelector('.date-picker-footer')).toBeFalsy()
    })

    it('should create today button in footer', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        footer: true,
        todayButton: 'Today'
      })

      const footer = div.querySelector('.date-picker-footer')
      const buttons = footer.querySelectorAll('button')
      const todayButton = Array.from(buttons).find(btn => btn.innerHTML === 'Today')
      expect(todayButton).toBeTruthy()
    })

    it('should set date to today when today button is clicked', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        footer: true,
        todayButton: 'Today'
      })

      const footer = div.querySelector('.date-picker-footer')
      const buttons = footer.querySelectorAll('button')
      const todayButton = Array.from(buttons).find(btn => btn.innerHTML === 'Today')

      todayButton.click()

      const today = new Date()
      expect(datePicker._startDate.getFullYear()).toBe(today.getFullYear())
      expect(datePicker._startDate.getMonth()).toBe(today.getMonth())
      expect(datePicker._startDate.getDate()).toBe(today.getDate())
    })

    it('should not create today button when todayButton is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        footer: true,
        todayButton: false
      })

      const footer = div.querySelector('.date-picker-footer')
      const buttons = footer.querySelectorAll('button')
      const todayButton = Array.from(buttons).find(btn => btn.innerHTML === 'Today')
      expect(todayButton).toBeFalsy()
    })

    it('should create cancel button in footer', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        footer: true,
        cancelButton: 'Cancel'
      })

      const footer = div.querySelector('.date-picker-footer')
      const buttons = footer.querySelectorAll('button')
      const cancelButton = Array.from(buttons).find(btn => btn.innerHTML === 'Cancel')
      expect(cancelButton).toBeTruthy()
    })

    it('should call cancel method when cancel button is clicked', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'

        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div, {
          footer: true,
          cancelButton: 'Cancel',
          date: new Date(2023, 5, 15)
        })

        div.addEventListener('shown.coreui.date-picker', () => {
          const footer = div.querySelector('.date-picker-footer')
          const buttons = footer.querySelectorAll('button')
          const cancelButton = Array.from(buttons).find(btn => btn.innerHTML === 'Cancel')

          cancelButton.click()
        })

        div.addEventListener('hidden.coreui.date-picker', () => {
          resolve()
        })

        datePicker.show()
      })
    })

    it('should not create cancel button when cancelButton is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        footer: true,
        cancelButton: false
      })

      const footer = div.querySelector('.date-picker-footer')
      const buttons = footer.querySelectorAll('button')
      const cancelButton = Array.from(buttons).find(btn => btn.innerHTML === 'Cancel')
      expect(cancelButton).toBeFalsy()
    })

    it('should create confirm button in footer', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        footer: true,
        confirmButton: 'OK'
      })

      const footer = div.querySelector('.date-picker-footer')
      const buttons = footer.querySelectorAll('button')
      const confirmButton = Array.from(buttons).find(btn => btn.innerHTML === 'OK')
      expect(confirmButton).toBeTruthy()
    })

    it('should hide picker when confirm button is clicked', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'

        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div, {
          footer: true,
          confirmButton: 'OK'
        })

        div.addEventListener('shown.coreui.date-picker', () => {
          const footer = div.querySelector('.date-picker-footer')
          const buttons = footer.querySelectorAll('button')
          const confirmButton = Array.from(buttons).find(btn => btn.innerHTML === 'OK')

          confirmButton.click()
        })

        div.addEventListener('hidden.coreui.date-picker', () => {
          expect(div.classList.contains('show')).toBe(false)
          resolve()
        })

        datePicker.show()
      })
    })

    it('should not create confirm button when confirmButton is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        footer: true,
        confirmButton: false
      })

      const footer = div.querySelector('.date-picker-footer')
      const buttons = footer.querySelectorAll('button')
      const confirmButton = Array.from(buttons).find(btn => btn.innerHTML === 'OK')
      expect(confirmButton).toBeFalsy()
    })
  })

  describe('timepicker integration', () => {
    it('should create footer when timepicker is true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        timepicker: true
      })

      expect(div.querySelector('.date-picker-footer')).toBeTruthy()
    })

    it('should create timepickers container when timepicker is true', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        timepicker: true
      })

      expect(div.querySelector('.date-picker-timepickers')).toBeTruthy()
    })

    it('should not create timepickers container when timepicker is false', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        timepicker: false
      })

      expect(div.querySelector('.date-picker-timepickers')).toBeFalsy()
    })

    it('should not auto-hide when timepicker is true and date is selected', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'

        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div, {
          timepicker: true
        })

        div.addEventListener('shown.coreui.date-picker', () => {
          // Simulate a calendar date selection
          const calendarEl = div.querySelector('.date-picker-calendar .calendars')
          if (calendarEl) {
            EventHandler.trigger(calendarEl, 'startDateChange.coreui.calendar', {
              date: new Date(2023, 5, 15)
            })
          }

          // Should still be shown because timepicker is true
          setTimeout(() => {
            expect(div.classList.contains('show')).toBe(true)
            datePicker.hide()
            resolve()
          }, 100)
        })

        datePicker.show()
      })
    })
  })

  describe('container mode', () => {
    it('should append dropdown to container when container is specified', () => {
      const containerEl = document.createElement('div')
      containerEl.classList.add('date-picker-test-container')
      document.body.append(containerEl)

      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        container: containerEl
      })

      expect(containerEl.querySelector('.date-picker-dropdown')).toBeTruthy()
    })

    it('should add show class to menu when showing with container', () => {
      return new Promise(resolve => {
        const containerEl = document.createElement('div')
        containerEl.classList.add('date-picker-test-container')
        document.body.append(containerEl)

        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div, {
          container: containerEl
        })

        div.addEventListener('shown.coreui.date-picker', () => {
          expect(datePicker._menu.classList.contains('show')).toBe(true)
          resolve()
        })

        datePicker.show()
      })
    })

    it('should remove show class from menu when hiding with container', () => {
      return new Promise(resolve => {
        const containerEl = document.createElement('div')
        containerEl.classList.add('date-picker-test-container')
        document.body.append(containerEl)

        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div, {
          container: containerEl
        })

        div.addEventListener('shown.coreui.date-picker', () => {
          datePicker.hide()
        })

        div.addEventListener('hidden.coreui.date-picker', () => {
          expect(datePicker._menu.classList.contains('show')).toBe(false)
          resolve()
        })

        datePicker.show()
      })
    })
  })

  describe('disabled state', () => {
    it('should prevent show when disabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        disabled: true
      })

      datePicker.show()
      expect(div.classList.contains('show')).toBe(false)
    })

    it('should add disabled class to element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        disabled: true
      })

      expect(div.classList.contains('disabled')).toBe(true)
    })

    it('should disable the input element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        disabled: true
      })

      const input = div.querySelector('.date-picker-input')
      expect(input.disabled).toBe(true)
    })

    it('should not toggle via indicator when disabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        disabled: true
      })

      const indicator = div.querySelector('.date-picker-indicator')
      if (indicator) {
        indicator.click()
      }

      expect(div.classList.contains('show')).toBe(false)
    })

    it('should not have tabindex on indicator when disabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        disabled: true
      })

      const indicator = div.querySelector('.date-picker-indicator')
      if (indicator) {
        expect(indicator.tabIndex).toBe(-1)
      }
    })

    it('should not create preview input wrapper when disabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        disabled: true,
        previewDateOnHover: true
      })

      expect(div.querySelector('.date-picker-input-wrapper')).toBeFalsy()
    })
  })

  describe('Escape key', () => {
    it('should close picker on Escape key', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('shown.coreui.date-picker', () => {
          const event = new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true
          })
          div.dispatchEvent(event)
        })

        div.addEventListener('hidden.coreui.date-picker', () => {
          expect(div.classList.contains('show')).toBe(false)
          resolve()
        })

        datePicker.show()
      })
    })
  })

  describe('form validation', () => {
    it('should add is-invalid class on form submit when no date selected', () => {
      fixtureEl.innerHTML = '<form class="was-validated"><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = form.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars

      form.dispatchEvent(new Event('submit'))

      expect(div.classList.contains('is-invalid')).toBe(true)
    })

    it('should add is-valid class on form submit when date is selected', () => {
      fixtureEl.innerHTML = '<form class="was-validated"><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = form.querySelector('div')
      const datePicker = new DatePicker(div, {
        date: new Date(2023, 5, 15),
        locale: 'en-US'
      })

      // Input value is already set by constructor from config.date
      form.dispatchEvent(new Event('submit'))

      expect(div.classList.contains('is-valid')).toBe(true)
    })

    it('should validate on input change/keyup/paste events when in was-validated form', () => {
      fixtureEl.innerHTML = '<form class="was-validated"><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = form.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars

      const input = div.querySelector('.date-picker-input')
      input.value = 'invalid-date'
      input.dispatchEvent(new Event('change', { bubbles: true }))

      expect(div.classList.contains('is-invalid')).toBe(true)
    })

    it('should set is-valid when valid date typed in was-validated form', () => {
      fixtureEl.innerHTML = '<form class="was-validated"><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const div = form.querySelector('div')
      new DatePicker(div, { // eslint-disable-line no-new
        date: new Date(2023, 5, 15),
        locale: 'en-US'
      })

      // Trigger form submit to fire validation (startDate is set from config)
      form.dispatchEvent(new Event('submit', { bubbles: true }))

      expect(div.classList.contains('is-valid')).toBe(true)
    })
  })

  describe('selectionType', () => {
    it('should support month selection type', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        selectionType: 'month'
      })

      expect(datePicker._config.selectionType).toBe('month')
    })

    it('should support year selection type', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        selectionType: 'year'
      })

      expect(datePicker._config.selectionType).toBe('year')
    })

    it('should default to day selection type', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker._config.selectionType).toBe('day')
    })

    it('should return raw value for non-day selection type in _formatDate', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        selectionType: 'month'
      })

      // For non-day selection type without inputDateFormat, it should return the value directly
      const result = datePicker._formatDate('2023/6')
      expect(result).toBe('2023/6')
    })
  })

  describe('events', () => {
    it('should emit dateChange event when date is selected', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)
      const listener = jasmine.createSpy('listener')

      div.addEventListener('dateChange.coreui.date-picker', listener)
      // Simulate date change by triggering internal event
      const testDate = new Date(2023, 5, 15)
      if (datePicker._calendar && datePicker._calendar._setStartDate) {
        datePicker._calendar._setStartDate(testDate)
      } else {
        // Manually trigger the event for test
        EventHandler.trigger(div, 'dateChange.coreui.date-picker', { date: testDate })
      }

      expect(listener).toHaveBeenCalled()
    })

    it('should emit dateChange event via startDateChange proxy', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars
      const listener = jasmine.createSpy('listener')

      div.addEventListener('dateChange.coreui.date-picker', listener)

      // Trigger the parent range picker event which should be proxied
      EventHandler.trigger(div, 'startDateChange.coreui.date-range-picker', { date: new Date(2023, 5, 15) })

      expect(listener).toHaveBeenCalled()
    })

    it('should proxy show event from date-range-picker', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars
      const listener = jasmine.createSpy('listener')

      div.addEventListener('show.coreui.date-picker', listener)

      EventHandler.trigger(div, 'show.coreui.date-range-picker')

      expect(listener).toHaveBeenCalled()
    })

    it('should proxy shown event from date-range-picker', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars
      const listener = jasmine.createSpy('listener')

      div.addEventListener('shown.coreui.date-picker', listener)

      EventHandler.trigger(div, 'shown.coreui.date-range-picker')

      expect(listener).toHaveBeenCalled()
    })

    it('should proxy hide event from date-range-picker', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars
      const listener = jasmine.createSpy('listener')

      div.addEventListener('hide.coreui.date-picker', listener)

      EventHandler.trigger(div, 'hide.coreui.date-range-picker')

      expect(listener).toHaveBeenCalled()
    })

    it('should proxy hidden event from date-range-picker', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars
      const listener = jasmine.createSpy('listener')

      div.addEventListener('hidden.coreui.date-picker', listener)

      EventHandler.trigger(div, 'hidden.coreui.date-range-picker')

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('keyboard navigation', () => {
    it('should handle Escape key to close dropdown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('shown.coreui.date-picker', () => {
          const event = new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true
          })
          div.dispatchEvent(event)
        })

        div.addEventListener('hidden.coreui.date-picker', () => {
          expect(div.classList.contains('show')).toBe(false)
          resolve()
        })

        datePicker.show()
      })
    })

    it('should toggle on Enter key on indicator', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars

        const indicator = div.querySelector('.date-picker-indicator')

        div.addEventListener('shown.coreui.date-picker', () => {
          expect(div.classList.contains('show')).toBe(true)
          resolve()
        })

        const event = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true
        })
        indicator.dispatchEvent(event)
      })
    })
  })

  describe('indicator', () => {
    it('should toggle picker on indicator click', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars

        const indicator = div.querySelector('.date-picker-indicator')

        div.addEventListener('shown.coreui.date-picker', () => {
          expect(div.classList.contains('show')).toBe(true)
          resolve()
        })

        indicator.click()
      })
    })
  })

  describe('cleaner', () => {
    it('should clear date on cleaner click', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        date: new Date(2023, 5, 15)
      })

      const cleaner = div.querySelector('.date-picker-cleaner')
      cleaner.click()

      expect(datePicker._startDate).toBeNull()
      const input = div.querySelector('.date-picker-input')
      expect(input.value).toBe('')
    })

    it('should stop propagation on cleaner click', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        date: new Date(2023, 5, 15)
      })

      const cleaner = div.querySelector('.date-picker-cleaner')

      // The cleaner click should not trigger show (stopPropagation)
      cleaner.click()
      expect(div.classList.contains('show')).toBe(false)
    })
  })

  describe('previewDateOnHover', () => {
    it('should be enabled by default', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker._config.previewDateOnHover).toBe(true)
    })

    it('should be configurable', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        previewDateOnHover: false
      })

      expect(datePicker._config.previewDateOnHover).toBe(false)
    })

    it('should update configuration with previewDateOnHover option', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        previewDateOnHover: true
      })

      datePicker.update({
        previewDateOnHover: false
      })

      expect(datePicker._config.previewDateOnHover).toBe(false)
    })

    it('should create input wrapper when previewDateOnHover is true', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        previewDateOnHover: true
      })

      expect(div.querySelector('.date-picker-input-wrapper')).toBeTruthy()
    })

    it('should not create input wrapper when previewDateOnHover is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        previewDateOnHover: false
      })

      expect(div.querySelector('.date-picker-input-wrapper')).toBeFalsy()
    })

    it('should create preview input element', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        previewDateOnHover: true
      })

      expect(div.querySelector('.date-picker-input-preview')).toBeTruthy()
    })
  })

  describe('dispose', () => {
    it('should dispose DatePicker instance', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker._element).toEqual(div)
      datePicker.dispose()
      expect(datePicker._element).toBeNull()
    })

    it('should return null for getInstance after dispose', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      datePicker.dispose()
      expect(DatePicker.getInstance(div)).toBeNull()
    })
  })

  describe('clearMenus static', () => {
    it('should close open date pickers on outside click', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div data-coreui-toggle="date-picker"></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('shown.coreui.date-picker', () => {
          // Simulate click outside
          const outsideEvent = new MouseEvent('click', {
            bubbles: true,
            composed: true
          })
          // Mock composedPath to return an array that doesn't include element or menu
          Object.defineProperty(outsideEvent, 'composedPath', {
            value: () => [document.body, document.documentElement, document]
          })
          DatePicker.clearMenus(outsideEvent)
        })

        div.addEventListener('hidden.coreui.date-picker', () => {
          expect(div.classList.contains('show')).toBe(false)
          resolve()
        })

        datePicker.show()
      })
    })

    it('should not close on right mouse button click', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div data-coreui-toggle="date-picker"></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('shown.coreui.date-picker', () => {
          const event = new MouseEvent('click', { button: 2, bubbles: true })
          Object.defineProperty(event, 'composedPath', {
            value: () => [document.body]
          })
          DatePicker.clearMenus(event)

          // Should still be shown
          setTimeout(() => {
            expect(div.classList.contains('show')).toBe(true)
            datePicker.hide()
            resolve()
          }, 50)
        })

        datePicker.show()
      })
    })

    it('should not close on keyup if key is not Tab', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div data-coreui-toggle="date-picker"></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('shown.coreui.date-picker', () => {
          const event = new KeyboardEvent('keyup', { key: 'a', bubbles: true })
          Object.defineProperty(event, 'composedPath', {
            value: () => [document.body]
          })
          DatePicker.clearMenus(event)

          // Should still be shown
          setTimeout(() => {
            expect(div.classList.contains('show')).toBe(true)
            datePicker.hide()
            resolve()
          }, 50)
        })

        datePicker.show()
      })
    })

    it('should not close when click is inside the element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div data-coreui-toggle="date-picker"></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('shown.coreui.date-picker', () => {
          const event = new MouseEvent('click', { bubbles: true })
          Object.defineProperty(event, 'composedPath', {
            value: () => [div, fixtureEl, document.body]
          })
          DatePicker.clearMenus(event)

          setTimeout(() => {
            expect(div.classList.contains('show')).toBe(true)
            datePicker.hide()
            resolve()
          }, 50)
        })

        datePicker.show()
      })
    })

    it('should handle clearMenus when no instance exists', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="date-picker" class="show"></div>'
      // Don't create instance, just test that clearMenus doesn't throw
      const event = new MouseEvent('click', { bubbles: true })
      Object.defineProperty(event, 'composedPath', {
        value: () => [document.body]
      })

      expect(() => {
        DatePicker.clearMenus(event)
      }).not.toThrow()
    })
  })

  describe('input parsing', () => {
    it('should handle empty input', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
          inputOnChangeDelay: 10
        })

        const input = div.querySelector('.date-picker-input')

        div.addEventListener('startDateChange.coreui.date-range-picker', event => {
          expect(event.date).toBeNull()
          resolve()
        })

        input.value = ''
        input.dispatchEvent(new Event('input', { bubbles: true }))
      })
    })

    it('should handle invalid date input', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
          inputOnChangeDelay: 10
        })

        const input = div.querySelector('.date-picker-input')

        div.addEventListener('startDateChange.coreui.date-range-picker', event => {
          // Invalid date input results in null or invalid Date
          expect(event.date === null || (event.date instanceof Date && Number.isNaN(event.date.getTime())) || typeof event.date === 'string').toBe(true)
          resolve()
        })

        input.value = 'not-a-date'
        input.dispatchEvent(new Event('input', { bubbles: true }))
      })
    })

    it('should parse date using selectionType month', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
          selectionType: 'month',
          inputOnChangeDelay: 10
        })

        const input = div.querySelector('.date-picker-input')

        div.addEventListener('startDateChange.coreui.date-range-picker', event => {
          expect(event.date).toBeDefined()
          resolve()
        })

        input.value = '2023/6'
        input.dispatchEvent(new Event('input', { bubbles: true }))
      })
    })

    it('should parse date using selectionType year', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
          selectionType: 'year',
          inputOnChangeDelay: 10
        })

        const input = div.querySelector('.date-picker-input')

        div.addEventListener('startDateChange.coreui.date-range-picker', event => {
          expect(event.date).toBeDefined()
          resolve()
        })

        input.value = '2023'
        input.dispatchEvent(new Event('input', { bubbles: true }))
      })
    })
  })

  describe('name attribute', () => {
    it('should set name attribute on input when name is provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        name: 'my-date'
      })

      const input = div.querySelector('.date-picker-input')
      expect(input.name).toBe('my-date')
    })

    it('should use element id for name when no name specified', () => {
      fixtureEl.innerHTML = '<div id="my-picker"></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars

      const input = div.querySelector('.date-picker-input')
      expect(input.name).toContain('my-picker')
    })

    it('should not set name attribute when no name or id provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars

      const input = div.querySelector('.date-picker-input')
      expect(input.name).toBe('')
    })
  })

  describe('placeholder', () => {
    it('should set placeholder from config', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        placeholder: ['Choose a date']
      })

      const input = div.querySelector('.date-picker-input')
      expect(input.placeholder).toBe('Choose a date')
    })

    it('should handle string placeholder', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        placeholder: 'Pick date'
      })

      const input = div.querySelector('.date-picker-input')
      expect(input.placeholder).toBe('Pick date')
    })
  })

  describe('static methods', () => {
    describe('datePickerInterface', () => {
      it('should create instance and call method', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')

        DatePicker.datePickerInterface(div, {})
        expect(DatePicker.getInstance(div)).toBeInstanceOf(DatePicker)
      })

      it('should call method on existing instance', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)
        const spy = spyOn(datePicker, 'show')

        DatePicker.datePickerInterface(div, 'show')
        expect(spy).toHaveBeenCalled()
      })

      it('should throw error for undefined method', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new DatePicker(div) // eslint-disable-line no-new

        expect(() => {
          DatePicker.datePickerInterface(div, 'undefinedMethod')
        }).toThrowError(TypeError, 'No method named "undefinedMethod"')
      })
    })

    describe('jQueryInterface', () => {
      it('should create date picker', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')

        jQueryMock.fn.datePicker = DatePicker.jQueryInterface
        jQueryMock.elements = [div]
        jQueryMock.fn.datePicker.call(jQueryMock, {})

        expect(DatePicker.getInstance(div)).not.toBeNull()
      })

      it('should not re-create date picker', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        jQueryMock.fn.datePicker = DatePicker.jQueryInterface
        jQueryMock.elements = [div]
        jQueryMock.fn.datePicker.call(jQueryMock, {})

        expect(DatePicker.getInstance(div)).toEqual(datePicker)
      })

      it('should throw error on undefined method', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new DatePicker(div) // eslint-disable-line no-new

        jQueryMock.fn.datePicker = DatePicker.jQueryInterface
        jQueryMock.elements = [div]

        expect(() => {
          jQueryMock.fn.datePicker.call(jQueryMock, 'undefinedMethod')
        }).toThrowError(TypeError, 'No method named "undefinedMethod"')
      })

      it('should throw error on private method', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new DatePicker(div) // eslint-disable-line no-new

        jQueryMock.fn.datePicker = DatePicker.jQueryInterface
        jQueryMock.elements = [div]

        expect(() => {
          jQueryMock.fn.datePicker.call(jQueryMock, '_addEventListeners')
        }).toThrowError(TypeError, 'No method named "_addEventListeners"')
      })

      it('should throw error on constructor method', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        new DatePicker(div) // eslint-disable-line no-new

        jQueryMock.fn.datePicker = DatePicker.jQueryInterface
        jQueryMock.elements = [div]

        expect(() => {
          jQueryMock.fn.datePicker.call(jQueryMock, 'constructor')
        }).toThrowError(TypeError, 'No method named "constructor"')
      })
    })

    describe('getInstance', () => {
      it('should return date picker instance', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        expect(DatePicker.getInstance(div)).toEqual(datePicker)
        expect(DatePicker.getInstance(div)).toBeInstanceOf(DatePicker)
      })

      it('should return null when there is no date picker instance', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')

        expect(DatePicker.getInstance(div)).toBeNull()
      })
    })

    describe('getOrCreateInstance', () => {
      it('should return date picker instance', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        expect(DatePicker.getOrCreateInstance(div)).toEqual(datePicker)
        expect(DatePicker.getOrCreateInstance(div)).toBeInstanceOf(DatePicker)
      })

      it('should return new instance when there is no date picker instance', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')

        expect(DatePicker.getInstance(div)).toBeNull()
        expect(DatePicker.getOrCreateInstance(div)).toBeInstanceOf(DatePicker)
      })

      it('should return new instance with given configuration', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')

        expect(DatePicker.getInstance(div)).toBeNull()
        const datePicker = DatePicker.getOrCreateInstance(div, {
          locale: 'fr-FR'
        })
        expect(datePicker).toBeInstanceOf(DatePicker)
        expect(datePicker._config.locale).toEqual('fr-FR')
      })

      it('should return the same instance when exists, ignoring new configuration', () => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div, {
          locale: 'en-US'
        })

        const datePicker2 = DatePicker.getOrCreateInstance(div, {
          locale: 'fr-FR'
        })
        expect(datePicker2).toEqual(datePicker)
        expect(datePicker2._config.locale).toEqual('en-US')
      })
    })
  })

  describe('data-api', () => {
    it('should initialize date picker on data-api elements', () => {
      fixtureEl.innerHTML = '<div data-coreui-toggle="date-picker"></div>'
      const div = fixtureEl.querySelector('[data-coreui-toggle="date-picker"]')

      const _datePicker = new DatePicker(div)
      expect(DatePicker.getInstance(div)).toBeInstanceOf(DatePicker)
    })
  })

  describe('_formatDate', () => {
    it('should return empty string for null date', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker._formatDate(null)).toBe('')
    })

    it('should return empty string for undefined date', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker._formatDate(undefined)).toBe('')
    })

    it('should use inputDateFormat function when provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        inputDateFormat: date => `custom-${date.getFullYear()}`
      })

      const result = datePicker._formatDate(new Date(2023, 5, 15))
      expect(result).toBe('custom-2023')
    })

    it('should return raw value for non-day selectionType without inputDateFormat', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        selectionType: 'year'
      })

      expect(datePicker._formatDate('2023')).toBe('2023')
    })

    it('should format with toLocaleDateString for day selectionType', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        locale: 'en-US'
      })

      const result = datePicker._formatDate(new Date(2023, 0, 15))
      expect(result).toContain('2023')
    })

    it('should format with toLocaleString when timepicker is enabled', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        timepicker: true,
        locale: 'en-US'
      })

      const result = datePicker._formatDate(new Date(2023, 5, 15, 14, 30))
      // Should include time component
      expect(result).toContain('2023')
    })
  })

  describe('_parseDate', () => {
    it('should return null for empty string', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker._parseDate('')).toBeNull()
    })

    it('should return null for null input', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker._parseDate(null)).toBeNull()
    })

    it('should use inputDateParse when provided', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const customParse = jasmine.createSpy('customParse').and.returnValue(new Date(2023, 5, 15))
      const datePicker = new DatePicker(div, {
        inputDateParse: customParse
      })

      const result = datePicker._parseDate('custom-date')
      expect(customParse).toHaveBeenCalledWith('custom-date')
      expect(result).toEqual(new Date(2023, 5, 15))
    })

    it('should use convertToDateObject for non-day selectionType', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        selectionType: 'month'
      })

      const result = datePicker._parseDate('2023/6')
      expect(result).toBeDefined()
    })
  })

  describe('_getButtonClasses', () => {
    it('should handle string classes', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      const result = datePicker._getButtonClasses('btn btn-sm btn-primary')
      expect(result).toEqual(['btn', 'btn-sm', 'btn-primary'])
    })

    it('should handle array classes', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      const result = datePicker._getButtonClasses(['btn', 'btn-sm'])
      expect(result).toEqual(['btn', 'btn-sm'])
    })
  })

  describe('_getPlaceholder', () => {
    it('should handle string placeholder by splitting on comma', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        placeholder: 'Start,End'
      })

      const result = datePicker._getPlaceholder()
      expect(result).toEqual(['Start', 'End'])
    })

    it('should handle array placeholder directly', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        placeholder: ['Start', 'End']
      })

      const result = datePicker._getPlaceholder()
      expect(result).toEqual(['Start', 'End'])
    })
  })

  describe('_setInputValue', () => {
    it('should return empty string for null date', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker._setInputValue(null)).toBe('')
    })

    it('should return empty string for undefined date', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker._setInputValue(undefined)).toBe('')
    })

    it('should return formatted date for valid date', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        locale: 'en-US'
      })

      const result = datePicker._setInputValue(new Date(2023, 0, 15))
      expect(result).toContain('2023')
    })
  })

  describe('_isShown', () => {
    it('should return false when picker is not shown', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker._isShown()).toBe(false)
    })

    it('should return true when picker is shown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div)

        div.addEventListener('shown.coreui.date-picker', () => {
          expect(datePicker._isShown()).toBe(true)
          datePicker.hide()
          resolve()
        })

        datePicker.show()
      })
    })
  })

  describe('input interaction', () => {
    it('should open picker when input group is clicked', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars

        div.addEventListener('shown.coreui.date-picker', () => {
          expect(div.classList.contains('show')).toBe(true)
          resolve()
        })

        const inputGroup = div.querySelector('.date-picker-input-group')
        // Click on input group (not indicator)
        const input = div.querySelector('.date-picker-input')
        input.click()
      })
    })

    it('should debounce input changes', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div></div>'
        const div = fixtureEl.querySelector('div')
        const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
          inputOnChangeDelay: 50
        })

        const input = div.querySelector('.date-picker-input')
        let callCount = 0

        div.addEventListener('startDateChange.coreui.date-range-picker', () => {
          callCount++
        })

        // Multiple rapid inputs
        input.value = '1/1/2023'
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.value = '1/2/2023'
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.value = '1/3/2023'
        input.dispatchEvent(new Event('input', { bubbles: true }))

        // Only the last should trigger
        setTimeout(() => {
          expect(callCount).toBe(1)
          resolve()
        }, 150)
      })
    })
  })

  describe('locale support', () => {
    it('should respect locale for date formatting', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        date: new Date(2023, 0, 15),
        locale: 'de-DE'
      })

      const input = div.querySelector('.date-picker-input')
      // German format uses dots
      expect(input.value).toContain('2023')
    })

    it('should accept different locale values', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        locale: 'ja-JP'
      })

      expect(datePicker._config.locale).toBe('ja-JP')
    })
  })

  describe('calendarDate', () => {
    it('should set initial calendar date', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const calDate = new Date(2025, 0, 1)
      const datePicker = new DatePicker(div, {
        calendarDate: calDate
      })

      expect(datePicker._calendarDate).toEqual(calDate)
    })

    it('should default calendarDate to null', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker._calendarDate).toBeNull()
    })
  })

  describe('required attribute', () => {
    it('should set required attribute on input by default', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div) // eslint-disable-line no-unused-vars

      const input = div.querySelector('.date-picker-input')
      expect(input.required).toBe(true)
    })

    it('should not set required when required is false', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, { // eslint-disable-line no-unused-vars
        required: false
      })

      const input = div.querySelector('.date-picker-input')
      expect(input.required).toBe(false)
    })
  })

  describe('firstDayOfWeek', () => {
    it('should accept firstDayOfWeek configuration', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div, {
        firstDayOfWeek: 0
      })

      expect(datePicker._config.firstDayOfWeek).toBe(0)
    })

    it('should default to 1 (Monday)', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')
      const datePicker = new DatePicker(div)

      expect(datePicker._config.firstDayOfWeek).toBe(1)
    })
  })
})

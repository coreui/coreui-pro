/* eslint-env jasmine */

import DateInput from '../../src/date-input.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('DateInput', () => {
  let fixtureEl

  const createDateInput = (config = {}) => {
    fixtureEl.innerHTML = '<div id="mydateinput"></div>'
    const element = fixtureEl.querySelector('div')
    return new DateInput(element, { format: 'dd.MM.yyyy', ...config })
  }

  const getSections = element => element.querySelectorAll('.form-date-time-section')

  const pressKey = (target, key, init = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', {
      key, bubbles: true, cancelable: true, ...init
    }))
  }

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(DateInput.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(DateInput.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(DateInput.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(DateInput.DATA_KEY).toEqual('coreui.date-input')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(DateInput.NAME).toEqual('date-input')
    })
  })

  describe('constructor', () => {
    it('should create sections, separators and a hidden input from the format', () => {
      const dateInput = createDateInput()
      const element = dateInput._element

      expect(element.classList.contains('form-control')).toBeTrue()
      expect(element.classList.contains('form-date-time')).toBeTrue()
      expect(element.getAttribute('role')).toEqual('group')
      expect(getSections(element)).toHaveSize(3)
      expect(element.querySelectorAll('.form-date-time-separator')).toHaveSize(2)
      expect(element.querySelector('input[type="hidden"]')).not.toBeNull()
    })

    it('should show placeholders in empty sections', () => {
      const dateInput = createDateInput()
      const [day, month, year] = getSections(dateInput._element)

      expect(day.textContent).toEqual('DD')
      expect(month.textContent).toEqual('MM')
      expect(year.textContent).toEqual('YYYY')
      expect(day.classList.contains('form-date-time-section-empty')).toBeTrue()
    })

    it('should set spinbutton attributes on sections', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      expect(day.getAttribute('role')).toEqual('spinbutton')
      expect(day.getAttribute('inputmode')).toEqual('numeric')
      expect(day.getAttribute('aria-label')).toEqual('Day')
      expect(day.getAttribute('aria-valuemin')).toEqual('1')
      expect(day.getAttribute('aria-valuemax')).toEqual('31')
      expect(day.getAttribute('aria-valuetext')).toEqual('Empty')
    })

    it('should fill sections and the hidden input from the initial date', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14), name: 'my-date' })
      const [day, month, year] = getSections(dateInput._element)

      expect(day.textContent).toEqual('14')
      expect(month.textContent).toEqual('07')
      expect(year.textContent).toEqual('2026')
      expect(dateInput._element.querySelector('input[type="hidden"]').value).toEqual('14.07.2026')
      expect(dateInput._element.classList.contains('form-date-time-filled')).toBeTrue()
    })

    it('should parse a date-only ISO string as a local date', () => {
      const dateInput = createDateInput({ date: '2000-01-15' })

      expect(dateInput.getDate()).toEqual(new Date(2000, 0, 15))
      expect(getSections(dateInput._element)[0].textContent).toEqual('15')
    })

    it('should derive sections from the locale when format is not set', () => {
      fixtureEl.innerHTML = '<div></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { locale: 'en-US' })

      expect(getSections(dateInput._element)[0].getAttribute('aria-label')).toEqual('Month')
    })

    it('should focus the first section when autofocus is set', () => {
      const dateInput = createDateInput({ autofocus: true })

      expect(document.activeElement).toEqual(getSections(dateInput._element)[0])
    })

    it('should make the first section tabbable and the rest not', () => {
      const dateInput = createDateInput()
      const sections = getSections(dateInput._element)

      expect(sections[0].tabIndex).toBe(0)
      expect(sections[1].tabIndex).toBe(-1)
      expect(sections[2].tabIndex).toBe(-1)
    })
  })

  describe('typing', () => {
    it('should set the section value and complete it when unambiguous', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '4')

      expect(day.textContent).toEqual('04')
      expect(day.getAttribute('aria-valuenow')).toEqual('4')
    })

    it('should accumulate ambiguous digits within a section', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '1')
      expect(day.textContent).toEqual('01')

      pressKey(day, '4')
      expect(day.textContent).toEqual('14')
    })

    it('should move focus to the next section when a section completes', () => {
      const dateInput = createDateInput()
      const [day, month] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '4')

      expect(document.activeElement).toEqual(month)
    })

    it('should emit dateChange when all sections are filled', () => {
      const dateInput = createDateInput()
      const element = dateInput._element
      const spy = jasmine.createSpy('dateChange')
      element.addEventListener('dateChange.coreui.date-input', spy)

      const [day, month, year] = getSections(element)

      day.focus()
      pressKey(day, '4')
      pressKey(month, '7')
      for (const digit of '2026') {
        pressKey(year, digit)
      }

      expect(spy).toHaveBeenCalled()
      expect(spy.calls.mostRecent().args[0].date).toEqual(new Date(2026, 6, 4))
      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 4))
      expect(element.querySelector('input[type="hidden"]').value).toEqual('04.07.2026')
    })

    it('should ignore non-digit keys', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a')

      expect(day.textContent).toEqual('DD')
    })
  })

  describe('partial masks', () => {
    it('should support month and year formats, valued at the first day of the month', () => {
      const dateInput = createDateInput({ format: 'MM.yyyy' })
      const [month, year] = getSections(dateInput._element)

      expect(getSections(dateInput._element)).toHaveSize(2)

      month.focus()
      pressKey(month, '7')
      for (const digit of '2026') {
        pressKey(year, digit)
      }

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 1))
      expect(dateInput._element.querySelector('input[type="hidden"]').value).toEqual('07.2026')
    })

    it('should fill month and year sections from an initial date', () => {
      const dateInput = createDateInput({ format: 'MMMM yyyy', locale: 'en-US', date: new Date(2026, 6, 14) })
      const [month] = getSections(dateInput._element)

      expect(month.textContent).toEqual('July')
      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 1))
    })
  })

  describe('text month sections', () => {
    const createTextDateInput = () => createDateInput({ format: 'DD MMMM YYYY', locale: 'en-US' })

    it('should show the format token as placeholder', () => {
      const dateInput = createTextDateInput()
      const [, month] = getSections(dateInput._element)

      expect(month.textContent).toEqual('MMMM')
    })

    it('should match month names as the user types letters', () => {
      const dateInput = createTextDateInput()
      const [, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, 'm')
      expect(month.textContent).toEqual('March')

      pressKey(month, 'a')
      expect(month.textContent).toEqual('March')

      pressKey(month, 'y')
      expect(month.textContent).toEqual('May')
    })

    it('should complete the section and move focus on a unique match', () => {
      const dateInput = createTextDateInput()
      const [, month, year] = getSections(dateInput._element)

      month.focus()
      pressKey(month, 'j')
      pressKey(month, 'u')
      pressKey(month, 'n')

      expect(month.textContent).toEqual('June')
      expect(document.activeElement).toEqual(year)
    })

    it('should still accept digits and arrow keys', () => {
      const dateInput = createTextDateInput()
      const [, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, '3')
      expect(month.textContent).toEqual('March')

      pressKey(month, 'ArrowUp')
      expect(month.textContent).toEqual('April')
    })

    it('should display and match custom month names', () => {
      const monthNames = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']
      const dateInput = createDateInput({ format: 'DD MMMM YYYY', locale: 'pl-PL', monthNames })
      const [, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, 'l')
      expect(month.textContent).toEqual('luty')

      pressKey(month, 'i')
      expect(month.textContent).toEqual('lipiec')
      expect(month.getAttribute('aria-valuetext')).toEqual('lipiec')
    })

    it('should fill sections from a pasted date with a month name', () => {
      const dateInput = createTextDateInput()
      const event = new Event('paste', { bubbles: true, cancelable: true })
      event.clipboardData = { getData: () => '14 July 2026' }
      getSections(dateInput._element)[0].dispatchEvent(event)

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
    })
  })

  describe('keyboard navigation', () => {
    it('should move between sections with arrow keys', () => {
      const dateInput = createDateInput()
      const [day, month] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowRight')
      expect(document.activeElement).toEqual(month)

      pressKey(month, 'ArrowLeft')
      expect(document.activeElement).toEqual(day)
    })

    it('should jump to the first and last section with Home and End', () => {
      const dateInput = createDateInput()
      const [day, , year] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'End')
      expect(document.activeElement).toEqual(year)

      pressKey(year, 'Home')
      expect(document.activeElement).toEqual(day)
    })

    it('should increment and decrement with arrow up and down', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowUp')
      expect(day.textContent).toEqual('15')

      pressKey(day, 'ArrowDown')
      pressKey(day, 'ArrowDown')
      expect(day.textContent).toEqual('13')
    })

    it('should start empty sections at the boundary, except year at the current year', () => {
      const dateInput = createDateInput()
      const [day, month, year] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowUp')
      expect(day.textContent).toEqual('01')

      month.focus()
      pressKey(month, 'ArrowDown')
      expect(month.textContent).toEqual('12')

      year.focus()
      pressKey(year, 'ArrowUp')
      expect(year.textContent).toEqual(String(new Date().getFullYear()))
    })

    it('should wrap month around its bounds', () => {
      const dateInput = createDateInput({ date: new Date(2026, 11, 14) })
      const [, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, 'ArrowUp')
      expect(month.textContent).toEqual('01')

      pressKey(month, 'ArrowDown')
      expect(month.textContent).toEqual('12')
    })

    it('should clear the section with Backspace and move to the previous one when empty', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, 'Backspace')
      expect(month.textContent).toEqual('MM')
      expect(dateInput.getDate()).toBeNull()

      pressKey(month, 'Backspace')
      expect(document.activeElement).toEqual(day)
    })

    it('should bound the day section by the selected month', () => {
      const dateInput = createDateInput({ date: new Date(2023, 1, 28) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowUp')
      expect(day.textContent).toEqual('01')

      pressKey(day, 'ArrowDown')
      expect(day.textContent).toEqual('28')
      expect(day.getAttribute('aria-valuemax')).toEqual('28')
    })

    it('should clamp the day when the month changes', () => {
      const dateInput = createDateInput({ date: new Date(2026, 0, 31) })
      const [day, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, '2')

      expect(day.textContent).toEqual('28')
      expect(dateInput.getDate()).toEqual(new Date(2026, 1, 28))
    })

    it('should clear the section with Delete', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'Delete')

      expect(day.textContent).toEqual('DD')
    })
  })

  describe('select all', () => {
    it('should select the whole value with Ctrl+A and copy it with Ctrl+C', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })

      expect(dateInput._element.classList.contains('form-date-time-all-selected')).toBeTrue()

      const clipboard = {}
      const event = new Event('copy', { bubbles: true, cancelable: true })
      event.clipboardData = {
        setData(type, value) {
          clipboard[type] = value
        }
      }
      day.dispatchEvent(event)

      expect(event.defaultPrevented).toBeTrue()
      expect(clipboard['text/plain']).toEqual('14.07.2026')
    })

    it('should copy and clear all sections with Ctrl+X', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })

      const clipboard = {}
      const event = new Event('cut', { bubbles: true, cancelable: true })
      event.clipboardData = {
        setData(type, value) {
          clipboard[type] = value
        }
      }
      day.dispatchEvent(event)

      expect(clipboard['text/plain']).toEqual('14.07.2026')
      expect(dateInput.getDate()).toBeNull()
      expect(day.textContent).toEqual('DD')
    })

    it('should clear all sections with Backspace after select all', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day, month, year] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })
      pressKey(day, 'Backspace')

      expect(day.textContent).toEqual('DD')
      expect(month.textContent).toEqual('MM')
      expect(year.textContent).toEqual('YYYY')
      expect(dateInput.getDate()).toBeNull()
      expect(document.activeElement).toEqual(day)
    })

    it('should restart typing from the first section after select all', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day, month, year] = getSections(dateInput._element)

      year.focus()
      pressKey(year, 'a', { ctrlKey: true })
      pressKey(year, '2')

      expect(day.textContent).toEqual('02')
      expect(month.textContent).toEqual('MM')
      expect(year.textContent).toEqual('YYYY')
    })
  })

  describe('paste', () => {
    const paste = (element, text) => {
      const event = new Event('paste', { bubbles: true, cancelable: true })
      event.clipboardData = { getData: () => text }
      element.dispatchEvent(event)
    }

    it('should fill all sections from a pasted date', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      paste(day, '14.07.2026')

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
    })

    it('should use inputDateParse when provided', () => {
      const dateInput = createDateInput({ inputDateParse: () => new Date(2026, 0, 2) })
      const [day] = getSections(dateInput._element)

      paste(day, 'anything')

      expect(dateInput.getDate()).toEqual(new Date(2026, 0, 2))
    })

    it('should ignore unparsable text', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      paste(day, 'not a date')

      expect(dateInput.getDate()).toBeNull()
    })
  })

  describe('validation', () => {
    const createInForm = (config = {}) => {
      fixtureEl.innerHTML = '<form class="was-validated"><div id="mydateinput"></div></form>'
      return new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', ...config })
    }

    it('should apply the valid and invalid config options', () => {
      const invalidInput = createDateInput({ invalid: true })
      expect(invalidInput._element.classList.contains('is-invalid')).toBeTrue()

      const validInput = createDateInput({ valid: true })
      expect(validInput._element.classList.contains('is-valid')).toBeTrue()
    })

    it('should mark a required empty field as invalid on submit of a validated form', async () => {
      const dateInput = createInForm({ required: true })

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should mark a filled field as valid on submit of a validated form', async () => {
      const dateInput = createInForm({ required: true, date: new Date(2026, 6, 14) })

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-valid')).toBeTrue()
      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
    })

    it('should apply the state even when was-validated is added during the same submit', async () => {
      fixtureEl.innerHTML = '<form><div id="mydateinput"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', required: true })
      form.addEventListener('submit', () => form.classList.add('was-validated'))

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should not touch validation classes when the form is not validated yet', async () => {
      fixtureEl.innerHTML = '<form><div id="mydateinput"></div></form>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', required: true })

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
      expect(dateInput._element.classList.contains('is-valid')).toBeFalse()
    })

    it('should emit errorChange with a reason when validation state changes', () => {
      const dateInput = createDateInput({
        date: new Date(2026, 6, 14),
        minDate: new Date(2026, 6, 10),
        maxDate: new Date(2026, 6, 14)
      })
      const spy = jasmine.createSpy('errorChange')
      dateInput._element.addEventListener('errorChange.coreui.date-input', spy)
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowUp')
      expect(spy.calls.mostRecent().args[0].error).toEqual('maxDate')

      pressKey(day, 'ArrowDown')
      expect(spy.calls.mostRecent().args[0].error).toBeNull()

      pressKey(day, 'Delete')
      expect(spy.calls.mostRecent().args[0].error).toEqual('incomplete')

      expect(spy).toHaveBeenCalledTimes(3)
    })

    it('should report disabled dates through errorChange', () => {
      const dateInput = createDateInput({
        date: new Date(2026, 6, 14),
        disabledDates: [new Date(2026, 6, 15)]
      })
      const spy = jasmine.createSpy('errorChange')
      dateInput._element.addEventListener('errorChange.coreui.date-input', spy)
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowUp')

      expect(spy.calls.mostRecent().args[0].error).toEqual('disabledDate')
    })

    it('should mark dates outside min and max as invalid', () => {
      const dateInput = createDateInput({
        date: new Date(2026, 6, 14),
        minDate: new Date(2026, 6, 1),
        maxDate: new Date(2026, 6, 14)
      })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowUp')

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(dateInput.getDate()).toBeNull()
    })
  })

  describe('disabled', () => {
    it('should not create editable or tabbable sections', () => {
      const dateInput = createDateInput({ disabled: true })
      const [day] = getSections(dateInput._element)

      expect(dateInput._element.classList.contains('disabled')).toBeTrue()
      expect(day.isContentEditable).toBeFalse()
      expect(day.tabIndex).toBe(-1)
      expect(day.getAttribute('aria-disabled')).toEqual('true')
      expect(dateInput._element.querySelector('input[type="hidden"]').disabled).toBeTrue()
    })

    it('should ignore keyboard edits when readonly', () => {
      const dateInput = createDateInput({ readonly: true })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '4')
      pressKey(day, 'ArrowUp')

      expect(day.textContent).toEqual('DD')
    })
  })

  describe('clear', () => {
    it('should empty all sections and the hidden input', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })

      dateInput.clear()

      expect(dateInput.getDate()).toBeNull()
      expect(getSections(dateInput._element)[0].textContent).toEqual('DD')
      expect(dateInput._element.querySelector('input[type="hidden"]').value).toEqual('')
      expect(dateInput._element.classList.contains('form-date-time-filled')).toBeFalse()
    })
  })

  describe('reset', () => {
    it('should restore the initial date', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })

      dateInput.clear()
      dateInput.reset()

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
      expect(getSections(dateInput._element)[0].textContent).toEqual('14')
    })
  })

  describe('update', () => {
    it('should rebuild the component with the new config', () => {
      const dateInput = createDateInput()

      dateInput.update({ format: 'yyyy-MM-dd', date: new Date(2026, 6, 14) })

      const [year] = getSections(dateInput._element)
      expect(year.getAttribute('aria-label')).toEqual('Year')
      expect(dateInput._element.querySelector('input[type="hidden"]').value).toEqual('2026-07-14')
    })
  })

  describe('jQueryInterface', () => {
    it('should create a date input', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.dateInput = DateInput.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.dateInput.call(jQueryMock)

      expect(DateInput.getInstance(div)).not.toBeNull()
    })
  })
})

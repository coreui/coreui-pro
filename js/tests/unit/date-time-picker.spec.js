import DateTimePicker from '../../src/date-time-picker.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('DateTimePicker', () => {
  let fixtureEl
  const pickers = []

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    for (const picker of pickers) {
      picker.dispose()
    }

    pickers.length = 0
    clearFixture()
  })

  const buildPicker = (config = {}, html = '<div id="picker"></div>') => {
    fixtureEl.innerHTML = html
    const picker = new DateTimePicker(fixtureEl.querySelector('#picker'), { locale: 'en-US', ...config })
    pickers.push(picker)
    return picker
  }

  const pickMinutes = (value, scope = fixtureEl) => {
    const select = scope.querySelector('select.time-picker-inline-select.minutes')
    select.value = String(value)
    select.dispatchEvent(new Event('change'))
  }

  describe('constructor', () => {
    it('should point aria-controls at the panel only while it exists', () => {
      const picker = buildPicker()
      const indicator = fixtureEl.querySelector('.form-control-action')

      expect(indicator.hasAttribute('aria-controls')).toBeFalse()

      picker.show()

      expect(indicator.getAttribute('aria-controls')).toEqual(picker._menu.id)

      picker.hide()

      expect(indicator.hasAttribute('aria-controls')).toBeFalse()
    })

    it('should compose a date-time field with a calendar and a time body', () => {
      const picker = buildPicker()
      const el = fixtureEl.querySelector('#picker')

      expect(el.classList.contains('date-time-picker')).toBeTrue()

      // both bodies are built on first open
      expect(picker._calendar).toBeNull()
      expect(picker._selection).toBeNull()

      picker.show()

      const popup = fixtureEl.querySelector('.date-picker-popup')
      expect(popup.querySelector('.date-picker-calendar')).not.toBeNull()
      expect(popup.querySelector('.date-picker-timepickers .time-picker-body')).not.toBeNull()
      expect(popup.querySelector('.calendar')).not.toBeNull()
      expect(popup.querySelectorAll('select.time-picker-inline-select').length).toBeGreaterThan(0)
      expect(popup.querySelector('.time-picker-roll-col')).toBeNull()
    })

    it('should keep the time selects to a single tab stop and move between them with the arrows', () => {
      const picker = buildPicker()
      picker.show()

      const body = fixtureEl.querySelector('.date-picker-popup .time-picker-body')
      const selects = [...body.querySelectorAll('select.time-picker-inline-select')]
      expect(selects.length).toBeGreaterThan(1)
      expect(body.querySelectorAll('[tabindex="0"]').length).toEqual(1)

      selects[0].focus()
      selects[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      expect(document.activeElement).toEqual(selects[1])
      expect(body.querySelectorAll('[tabindex="0"]').length).toEqual(1)

      const last = selects[selects.length - 1]
      last.focus()
      last.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      expect(document.activeElement).toEqual(last)
    })

    it('should initialize the field with the configured date and time', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 14, 30) })

      expect(picker.getDate().getFullYear()).toEqual(2026)
      expect(picker.getDate().getHours()).toEqual(14)
      expect(picker.getDate().getMinutes()).toEqual(30)
    })
  })

  describe('form payload', () => {
    it('should not submit a floating-label picker the page did not name', () => {
      buildPicker({ date: new Date(2026, 0, 15, 10, 30), floatingLabel: 'When', format: 'dd.MM.yyyy HH:mm' }, '<form id="form"><div id="picker"></div></form>')

      expect([...new FormData(fixtureEl.querySelector('#form')).keys()]).toEqual([])
    })

    it('should submit under the configured name', () => {
      buildPicker({
        date: new Date(2026, 0, 15, 10, 30), floatingLabel: 'When', format: 'dd.MM.yyyy HH:mm', name: 'when'
      }, '<form id="form"><div id="picker"></div></form>')

      expect([...new FormData(fixtureEl.querySelector('#form')).entries()])
        .toEqual([['when', '15.01.2026 10:30']])
    })
  })

  describe('composition of the two halves', () => {
    it('should keep the time when a calendar day is selected', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 14, 30, 0) })

      picker.show()
      fixtureEl.querySelectorAll('.date-picker-popup .calendar-cell[data-coreui-selectable]')[0].click()

      const value = picker.getDate()
      expect(value.getHours()).toEqual(14)
      expect(value.getMinutes()).toEqual(30)
    })

    it('should keep the date when a time cell is selected', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 10, 0, 0) })

      picker.show()
      pickMinutes(45)

      const value = picker.getDate()
      expect(value.getFullYear()).toEqual(2026)
      expect(value.getMonth()).toEqual(5)
      expect(value.getDate()).toEqual(15)
      expect(value.getMinutes()).toEqual(45)
    })

    it('should emit dateChange from both halves', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 10, 0, 0) })
      const el = fixtureEl.querySelector('#picker')
      const emitted = []
      el.addEventListener('dateChange.coreui.date-time-picker', event => emitted.push(event.date))

      picker.show()
      const popup = fixtureEl.querySelector('.date-picker-popup')
      popup.querySelectorAll('.calendar-cell[data-coreui-selectable]')[0].click()
      pickMinutes(15, popup)

      expect(emitted.length).toBeGreaterThanOrEqual(2)
    })

    it('should not auto-close — a date-time value needs both halves', () => {
      const picker = buildPicker()

      picker.show()
      fixtureEl.querySelectorAll('.calendar-cell[data-coreui-selectable]')[0].click()

      expect(picker._popup.isShown).toBeTrue()
    })
  })

  describe('options', () => {
    it('should not open when disabled', () => {
      const picker = buildPicker({ disabled: true })

      picker.show()

      expect(picker._popup.isShown).toBeFalse()
    })

    it('should apply the size class', () => {
      buildPicker({ size: 'sm' })

      const el = fixtureEl.querySelector('#picker')
      expect(el.classList.contains('form-control-group')).toBeTrue()
      expect(el.classList.contains('form-control-sm')).toBeTrue()
    })

    it('should toggle from the indicator button', () => {
      const picker = buildPicker()
      const indicator = fixtureEl.querySelector('.form-control-action')

      indicator.click()
      expect(picker._popup.isShown).toBeTrue()

      indicator.click()
      expect(picker._popup.isShown).toBeFalse()
    })

    it('should ignore indicator clicks when disabled', () => {
      const picker = buildPicker({ disabled: true })

      fixtureEl.querySelector('.form-control-action').click()

      expect(picker._popup.isShown).toBeFalse()
    })

    it('should set today and restore the initial value on reset', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 10, 0) })

      picker.today()
      expect(picker.getDate().getFullYear()).toEqual(new Date().getFullYear())

      picker.reset()
      expect(picker.getDate().getMonth()).toEqual(5)
    })

    it('should render a projected footer and run its actions', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 10, 0) }, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="close">OK</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()
      expect(fixtureEl.querySelector('.date-picker-footer')).not.toBeNull()

      fixtureEl.querySelector('[data-coreui-picker-action="close"]').click()
      expect(picker._popup.isShown).toBeFalse()
    })

    it('should disable a projected today action when today is not selectable', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const picker = buildPicker({ maxDate: yesterday }, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="today">Today</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()

      expect(fixtureEl.querySelector('.date-picker-popup [data-coreui-picker-action="today"]').disabled).toBeTrue()
    })

    it('should keep the value when the time half reports without a date set', () => {
      const picker = buildPicker()

      picker.show()
      pickMinutes(10)

      expect(picker.getDate().getMinutes()).toEqual(10)
    })
  })

  describe('picker toggle', () => {
    it('should not render the toggle when pickerIcon is off', () => {
      buildPicker({ date: new Date(2026, 5, 15, 10, 0), pickerIcon: false })

      expect(fixtureEl.querySelector('.form-control-action')).toBeNull()
    })

    it('should open and close without a toggle', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 10, 0), pickerIcon: false })

      picker.show()

      expect(picker._popup.isShown).toBeTrue()

      picker.hide()

      expect(picker._popup.isShown).toBeFalse()
      expect(fixtureEl.querySelector('.form-control-action')).toBeNull()
    })

    it('should name the toggle after what it opens', () => {
      buildPicker({ date: new Date(2026, 5, 15, 10, 0) })

      expect(fixtureEl.querySelector('.form-control-action').getAttribute('aria-label')).toEqual('Toggle calendar and time selection')
    })
  })

  describe('cleaner', () => {
    it('should name the cleaner after the value it clears', () => {
      buildPicker({ date: new Date(2026, 5, 15, 10, 0) })

      expect(fixtureEl.querySelector('.form-control-cleaner').getAttribute('aria-label')).toEqual('Clear date and time')
    })

    it('should clear the value when the cleaner is clicked', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 10, 0) })

      fixtureEl.querySelector('.form-control-cleaner').click()

      expect(picker.getDate()).toBeNull()
    })

    it('should not render a cleaner when the option is off', () => {
      buildPicker({ cleaner: false, date: new Date(2026, 5, 15, 10, 0) })

      expect(fixtureEl.querySelector('.form-control-cleaner')).toBeNull()
    })
  })

  describe('slot context', () => {
    it('should expose the date contract', () => {
      const picker = buildPicker()

      expect(Object.keys(picker.getContext()).toSorted())
        .toEqual(['clear', 'close', 'date', 'disabled', 'isDateSelectable', 'reset', 'setDate', 'today'])
    })

    it('should clear through the context', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 10, 0) })

      picker.getContext().clear()

      expect(picker.getDate()).toBeNull()
    })
  })

  describe('jQueryInterface', () => {
    it('should create date-time-picker', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')

      jQueryMock.fn.dateTimePicker = DateTimePicker.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.dateTimePicker.call(jQueryMock)

      expect(DateTimePicker.getInstance(el)).not.toBeNull()
      DateTimePicker.getInstance(el).dispose()
    })

    it('should pass the arguments to the method', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')

      jQueryMock.fn.dateTimePicker = DateTimePicker.jQueryInterface
      jQueryMock.elements = [el]

      const instance = DateTimePicker.getOrCreateInstance(el)
      const spy = spyOn(instance, 'setDate')

      jQueryMock.fn.dateTimePicker.call(jQueryMock, 'setDate', new Date(2027, 0, 15))

      expect(spy).toHaveBeenCalledWith(new Date(2027, 0, 15))
      instance.dispose()
    })

    it('should not re-create date-time-picker', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')
      const picker = new DateTimePicker(el)

      jQueryMock.fn.dateTimePicker = DateTimePicker.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.dateTimePicker.call(jQueryMock)

      expect(DateTimePicker.getInstance(el)).toEqual(picker)
      picker.dispose()
    })

    it('should call a public method by name', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')
      const picker = new DateTimePicker(el)
      const spy = spyOn(picker, 'show')

      jQueryMock.fn.dateTimePicker = DateTimePicker.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.dateTimePicker.call(jQueryMock, 'show')

      expect(spy).toHaveBeenCalled()
      picker.dispose()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')
      const picker = new DateTimePicker(el)

      jQueryMock.fn.dateTimePicker = DateTimePicker.jQueryInterface
      jQueryMock.elements = [el]

      expect(() => {
        jQueryMock.fn.dateTimePicker.call(jQueryMock, 'undefinedMethod')
      }).toThrowError(TypeError, 'No method named "undefinedMethod"')

      picker.dispose()
    })
  })

  describe('dispose', () => {
    it('should replace a size the markup carried and give it back', () => {
      const picker = buildPicker({ size: 'sm' }, '<div class="form-control-lg" id="picker"></div>')
      const element = fixtureEl.querySelector('#picker')

      expect(element.classList.contains('form-control-lg')).toBeFalse()
      expect(element.classList.contains('form-control-sm')).toBeTrue()

      picker.dispose()
      pickers.length = 0

      expect(element.outerHTML).toEqual('<div class="form-control-lg" id="picker"></div>')
    })

    it('should give the host back the way the page wrote it', () => {
      fixtureEl.innerHTML = '<div class="form-control-group my-own" id="picker"></div>'
      const element = fixtureEl.querySelector('#picker')
      const instance = new DateTimePicker(fixtureEl.querySelector('#picker'), { size: 'sm' })

      instance.show()
      instance.dispose()

      expect(element.outerHTML).toEqual('<div class="form-control-group my-own" id="picker"></div>')
    })

    it('should not leave a class attribute on a host that had none', () => {
      fixtureEl.innerHTML = '<div id="picker"></div>'
      const element = fixtureEl.querySelector('#picker')
      const instance = new DateTimePicker(fixtureEl.querySelector('#picker'), { size: 'sm' })

      instance.dispose()

      expect(element.outerHTML).toEqual('<div id="picker"></div>')
    })

    it('should drop the listeners on the controls it built', () => {
      fixtureEl.innerHTML = '<div id="picker"></div>'
      const picker = new DateTimePicker(fixtureEl.querySelector('#picker'))
      const indicator = fixtureEl.querySelector('.form-control-action')
      const cleaner = fixtureEl.querySelector('.form-control-cleaner')
      const errors = []
      const onError = event => {
        event.preventDefault()
        errors.push(event.error)
      }

      window.addEventListener('error', onError)
      picker.dispose()
      indicator.click()
      cleaner.click()
      window.removeEventListener('error', onError)

      expect(errors).toEqual([])
    })

    it('should remove the controls it built', () => {
      fixtureEl.innerHTML = '<div id="picker"></div>'
      const el = fixtureEl.querySelector('#picker')
      const picker = new DateTimePicker(el)

      picker.dispose()

      expect(el.children).toHaveLength(0)
      expect(el.classList.contains('form-control-group')).toBe(false)
    })

    it('should build one set of controls when re-initialised on the same element', () => {
      fixtureEl.innerHTML = '<div id="picker"></div>'
      const el = fixtureEl.querySelector('#picker')
      new DateTimePicker(el) // eslint-disable-line no-new
      pickers.push(new DateTimePicker(el))

      expect(el.querySelectorAll('.form-date-time')).toHaveLength(1)
      expect(el.querySelectorAll('.form-control-cleaner')).toHaveLength(1)
      expect(el.querySelectorAll('.form-control-action')).toHaveLength(1)
    })
  })

  describe("seconds", () => {
    it("should give the field and the panel a seconds part by default", () => {
      const picker = buildPicker({ locale: "en-US" })
      picker.show()

      expect([...picker._element.querySelectorAll("[data-coreui-section]")].map(section => section.dataset.coreuiSection)).toEqual(["month", "day", "year", "hour", "minute", "second", "meridiem"])
      expect([...document.querySelectorAll("[aria-label^=\"Select\"]")].length).toEqual(4)
    })

    it("should take both away together", () => {
      const picker = buildPicker({ locale: "en-US", seconds: false })
      picker.show()

      expect([...picker._element.querySelectorAll("[data-coreui-section]")].map(section => section.dataset.coreuiSection)).toEqual(["month", "day", "year", "hour", "minute", "meridiem"])
      expect([...document.querySelectorAll("[aria-label^=\"Select\"]")].length).toEqual(3)
    })
  })
})

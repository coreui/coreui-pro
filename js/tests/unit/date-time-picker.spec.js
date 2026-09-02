import DateTimePicker from '../../src/date-time-picker.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

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

  describe('constructor', () => {
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
      expect(popup.querySelectorAll('.time-picker-roll-col').length).toBeGreaterThan(0)
    })

    it('should initialize the field with the configured date and time', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 14, 30) })

      expect(picker.getDate().getFullYear()).toEqual(2026)
      expect(picker.getDate().getHours()).toEqual(14)
      expect(picker.getDate().getMinutes()).toEqual(30)
    })
  })

  describe('composition of the two halves', () => {
    it('should keep the time when a calendar day is selected', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 14, 30, 0) })

      picker.show()
      fixtureEl.querySelectorAll('.date-picker-popup .calendar-cell[tabindex="0"]')[0].click()

      const value = picker.getDate()
      expect(value.getHours()).toEqual(14)
      expect(value.getMinutes()).toEqual(30)
    })

    it('should keep the date when a time cell is selected', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 10, 0, 0) })

      picker.show()
      fixtureEl.querySelectorAll('.date-picker-popup [data-coreui-minutes]')[45].click()

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
      popup.querySelectorAll('.calendar-cell[tabindex="0"]')[0].click()
      popup.querySelectorAll('[data-coreui-minutes]')[15].click()

      expect(emitted.length).toBeGreaterThanOrEqual(2)
    })

    it('should not auto-close — a date-time value needs both halves', () => {
      const picker = buildPicker()

      picker.show()
      fixtureEl.querySelectorAll('.calendar-cell[tabindex="0"]')[0].click()

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
      fixtureEl.querySelectorAll('[data-coreui-minutes]')[10].click()

      expect(picker.getDate().getMinutes()).toEqual(10)
    })
  })

  describe('cleaner', () => {
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

  describe('dispose', () => {
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
})

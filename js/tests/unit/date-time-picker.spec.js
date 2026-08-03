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
      expect(el.querySelector('.date-picker-calendar')).not.toBeNull()
      expect(el.querySelector('.date-picker-timepickers .time-picker-body')).not.toBeNull()

      // both bodies are built on first open
      expect(picker._calendar).toBeNull()
      expect(picker._selection).toBeNull()

      picker.show()

      expect(el.querySelector('.calendar')).not.toBeNull()
      expect(el.querySelectorAll('.time-picker-roll-col').length).toBeGreaterThan(0)
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
      const el = fixtureEl.querySelector('#picker')

      picker.show()
      el.querySelectorAll('.calendar-cell[tabindex="0"]')[0].click()

      const value = picker.getDate()
      expect(value.getHours()).toEqual(14)
      expect(value.getMinutes()).toEqual(30)
    })

    it('should keep the date when a time cell is selected', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15, 10, 0, 0) })
      const el = fixtureEl.querySelector('#picker')

      picker.show()
      el.querySelectorAll('[data-coreui-minutes]')[45].click()

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
      el.querySelectorAll('.calendar-cell[tabindex="0"]')[0].click()
      el.querySelectorAll('[data-coreui-minutes]')[15].click()

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

      expect(fixtureEl.querySelector('#picker .form-control-group').classList.contains('form-control-sm')).toBeTrue()
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
      buildPicker({ maxDate: yesterday }, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="today">Today</button>',
        '  </template>',
        '</div>'
      ].join(''))

      expect(fixtureEl.querySelector('[data-coreui-picker-action="today"]').disabled).toBeTrue()
    })

    it('should keep the value when the time half reports without a date set', () => {
      const picker = buildPicker()

      picker.show()
      fixtureEl.querySelectorAll('[data-coreui-minutes]')[10].click()

      expect(picker.getDate().getMinutes()).toEqual(10)
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
})

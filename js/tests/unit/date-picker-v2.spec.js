import DatePickerV2 from '../../src/date-picker-v2.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

describe('DatePickerV2', () => {
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
    const picker = new DatePickerV2(fixtureEl.querySelector('#picker'), config)
    pickers.push(picker)
    return picker
  }

  describe('constructor', () => {
    it('should compose an input group, an indicator, and a calendar dropdown', () => {
      buildPicker()

      const el = fixtureEl.querySelector('#picker')
      expect(el.classList.contains('date-picker')).toBeTrue()
      expect(el.querySelector('.date-picker-input-group')).not.toBeNull()
      expect(el.querySelector('.date-picker-indicator')).not.toBeNull()
      expect(el.querySelector('.date-picker-dropdown .calendar')).not.toBeNull()
    })

    it('should initialize the section input with the configured date', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15) })

      expect(picker.getDate()).toEqual(new Date(2026, 5, 15))
    })

    it('should not render a footer without a template child', () => {
      buildPicker()

      expect(fixtureEl.querySelector('.date-picker-footer')).toBeNull()
    })

    it('should clone a footer template into the dropdown', () => {
      buildPicker({}, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="today">Today</button>',
        '    <button type="button" data-coreui-picker-action="close">OK</button>',
        '  </template>',
        '</div>'
      ].join(''))

      const footer = fixtureEl.querySelector('.date-picker-footer')
      expect(footer).not.toBeNull()
      expect(footer.querySelectorAll('[data-coreui-picker-action]')).toHaveSize(2)
    })
  })

  describe('show/hide', () => {
    it('should toggle on indicator click and fire lifecycle events', () => {
      const picker = buildPicker()
      const el = fixtureEl.querySelector('#picker')
      const calls = []
      for (const name of ['show', 'shown', 'hide', 'hidden']) {
        el.addEventListener(`${name}.coreui.date-picker-v2`, () => calls.push(name))
      }

      el.querySelector('.date-picker-indicator').click()
      expect(el.classList.contains('show')).toBeTrue()
      expect(el.getAttribute('aria-expanded')).toEqual('true')

      el.querySelector('.date-picker-indicator').click()
      expect(el.classList.contains('show')).toBeFalse()
      expect(calls).toEqual(['show', 'shown', 'hide', 'hidden'])
      expect(picker._popup.isShown).toBeFalse()
    })

    it('should not open when disabled', () => {
      const picker = buildPicker({ disabled: true })

      picker.show()

      expect(picker._popup.isShown).toBeFalse()
    })
  })

  describe('date selection', () => {
    it('should update the input, emit dateChange, and close when a calendar day is selected', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15) })
      const el = fixtureEl.querySelector('#picker')
      let emitted = null
      el.addEventListener('dateChange.coreui.date-picker-v2', event => {
        emitted = event.date
      })

      picker.show()
      const dayCell = el.querySelector('.calendar-cell[tabindex="0"]')
      dayCell.click()

      expect(emitted).not.toBeNull()
      expect(picker.getDate()).toEqual(emitted)
      expect(picker._popup.isShown).toBeFalse()
    })
  })

  describe('slot context', () => {
    it('should expose the contract actions and state', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15) })
      const context = picker.getContext()

      expect(Object.keys(context).toSorted()).toEqual(['clear', 'close', 'date', 'disabled', 'reset', 'setDate', 'today'])
      expect(context.date).toEqual(new Date(2026, 5, 15))
      expect(context.disabled).toBeFalse()
    })

    it('should clear the value through the context', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15) })

      picker.getContext().clear()

      expect(picker.getDate()).toBeNull()
    })

    it('should set today through the context', () => {
      const picker = buildPicker()

      picker.getContext().today()

      const today = new Date()
      const date = picker.getDate()
      expect(date.getFullYear()).toEqual(today.getFullYear())
      expect(date.getMonth()).toEqual(today.getMonth())
      expect(date.getDate()).toEqual(today.getDate())
    })
  })

  describe('footer actions', () => {
    it('should run context actions from data attributes', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15) }, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="clear">Clear</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()
      fixtureEl.querySelector('[data-coreui-picker-action="clear"]').click()

      expect(picker.getDate()).toBeNull()
    })
  })
})

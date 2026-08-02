import TimePicker from '../../src/time-picker.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

describe('TimePicker', () => {
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
    const picker = new TimePicker(fixtureEl.querySelector('#picker'), { locale: 'en-US', ...config })
    pickers.push(picker)
    return picker
  }

  describe('constructor', () => {
    it('should compose a section field and an indicator with an inline SVG icon', () => {
      buildPicker()

      const el = fixtureEl.querySelector('#picker')
      expect(el.classList.contains('time-picker')).toBeTrue()
      expect(el.querySelector('.time-picker-input-group .form-date-time')).not.toBeNull()
      expect(el.querySelector('.time-picker-indicator svg')).not.toBeNull()
    })

    it('should not build the selection body until the popup opens', () => {
      const picker = buildPicker()
      const el = fixtureEl.querySelector('#picker')

      expect(picker._selection).toBeNull()
      expect(el.querySelector('.time-picker-roll-col')).toBeNull()

      picker.show()

      expect(picker._selection).not.toBeNull()
      expect(el.querySelectorAll('.time-picker-roll-col').length).toBeGreaterThan(0)
    })

    it('should initialize the field with the configured time', () => {
      const picker = buildPicker({ time: new Date(2026, 0, 1, 14, 30) })

      expect(picker.getTime().getHours()).toEqual(14)
      expect(picker.getTime().getMinutes()).toEqual(30)
    })
  })

  describe('variants', () => {
    it('should render roll columns by default', () => {
      const picker = buildPicker()
      picker.show()

      const el = fixtureEl.querySelector('#picker')
      expect(el.querySelector('.time-picker-body').classList.contains('time-picker-roll')).toBeTrue()
      expect(el.querySelector('select')).toBeNull()
    })

    it('should render selects for the select variant', () => {
      const picker = buildPicker({ variant: 'select' })
      picker.show()

      const el = fixtureEl.querySelector('#picker')
      expect(el.querySelectorAll('select.time-picker-inline-select').length).toBeGreaterThan(0)
      expect(el.querySelector('.time-picker-roll-col')).toBeNull()
    })

    it('should drop the seconds column when seconds are disabled', () => {
      const picker = buildPicker({ seconds: false })
      picker.show()

      const el = fixtureEl.querySelector('#picker')
      expect(el.querySelector('[role="listbox"][aria-label="Select seconds"]')).toBeNull()
    })
  })

  describe('time selection', () => {
    it('should update the field and emit timeChange when a cell is clicked', () => {
      const picker = buildPicker({ time: new Date(2026, 0, 1, 10, 0, 0) })
      const el = fixtureEl.querySelector('#picker')
      let emitted = null
      el.addEventListener('timeChange.coreui.time-picker', event => {
        emitted = event.time
      })

      picker.show()
      const minutes = el.querySelectorAll('[data-coreui-minutes]')
      minutes[15].click()

      expect(emitted).not.toBeNull()
      expect(picker.getTime().getMinutes()).toEqual(15)
    })

    it('should mark the selected cell', () => {
      const picker = buildPicker({ time: new Date(2026, 0, 1, 10, 20, 0) })
      picker.show()

      const selected = fixtureEl.querySelector('[data-coreui-minutes].selected')
      expect(selected).not.toBeNull()
      expect(selected.getAttribute('aria-selected')).toEqual('true')
    })
  })

  describe('slot context', () => {
    it('should expose the time contract', () => {
      const picker = buildPicker()

      expect(Object.keys(picker.getContext()).toSorted())
        .toEqual(['clear', 'close', 'disabled', 'isTimeSelectable', 'now', 'reset', 'setTime', 'time'])
    })

    it('should clear and set the time through the context', () => {
      const picker = buildPicker({ time: new Date(2026, 0, 1, 10, 0) })

      picker.getContext().clear()
      expect(picker.getTime()).toBeNull()

      picker.getContext().setTime(new Date(2026, 0, 1, 8, 45))
      expect(picker.getTime().getHours()).toEqual(8)
    })
  })

  describe('options', () => {
    it('should not open when disabled', () => {
      const picker = buildPicker({ disabled: true })

      picker.show()

      expect(picker._popup.isShown).toBeFalse()
    })

    it('should apply the size class', () => {
      buildPicker({ size: 'lg' })

      expect(fixtureEl.querySelector('#picker').classList.contains('time-picker-lg')).toBeTrue()
    })

    it('should skip sanitizing when sanitize is false', () => {
      buildPicker({ indicatorIcon: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="3" /></svg>', sanitize: false })

      expect(fixtureEl.querySelector('.time-picker-indicator circle')).not.toBeNull()
    })

    it('should set the time to now through the context', () => {
      const picker = buildPicker()

      picker.getContext().now()

      expect(picker.getTime()).not.toBeNull()
    })

    it('should restore the initial time on reset', () => {
      const picker = buildPicker({ time: new Date(2026, 0, 1, 9, 15) })

      picker.setTime(new Date(2026, 0, 1, 18, 0))
      picker.reset()

      expect(picker.getTime().getHours()).toEqual(9)
    })

    it('should toggle from the indicator button', () => {
      const picker = buildPicker()
      const indicator = fixtureEl.querySelector('.time-picker-indicator')

      indicator.click()
      expect(picker._popup.isShown).toBeTrue()

      indicator.click()
      expect(picker._popup.isShown).toBeFalse()
    })

    it('should ignore indicator clicks when disabled', () => {
      const picker = buildPicker({ disabled: true })

      fixtureEl.querySelector('.time-picker-indicator').click()

      expect(picker._popup.isShown).toBeFalse()
    })

    it('should ignore unknown footer actions', () => {
      const picker = buildPicker({ time: new Date(2026, 0, 1, 9, 0) }, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="nope">Nope</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()
      fixtureEl.querySelector('[data-coreui-picker-action="nope"]').click()

      expect(picker.getTime().getHours()).toEqual(9)
    })
  })

  describe('footer actions', () => {
    it('should run context actions from data attributes', () => {
      const picker = buildPicker({ time: new Date(2026, 0, 1, 10, 0) }, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="clear">Clear</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()
      fixtureEl.querySelector('[data-coreui-picker-action="clear"]').click()

      expect(picker.getTime()).toBeNull()
    })

    it('should disable a projected now action when the current time is not selectable', () => {
      buildPicker({ maxDate: new Date(1969, 11, 31) }, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="now">Now</button>',
        '  </template>',
        '</div>'
      ].join(''))

      expect(fixtureEl.querySelector('[data-coreui-picker-action="now"]').disabled).toBeTrue()
    })

    it('should keep a projected now action enabled when the current time is selectable', () => {
      buildPicker({}, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="now">Now</button>',
        '  </template>',
        '</div>'
      ].join(''))

      expect(fixtureEl.querySelector('[data-coreui-picker-action="now"]').disabled).toBeFalse()
    })
  })
})

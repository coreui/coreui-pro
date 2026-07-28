import TimeSelection from '../../../src/util/time-selection.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('TimeSelection', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const build = (config = {}) => {
    fixtureEl.innerHTML = '<div id="body"></div>'
    return new TimeSelection(fixtureEl.querySelector('#body'), { locale: 'en-GB', ...config })
  }

  const cells = part => fixtureEl.querySelectorAll(`[data-coreui-${part}]`)

  describe('rendering', () => {
    it('should render hours, minutes and seconds columns by default', () => {
      build()

      expect(cells('hours')).toHaveSize(24)
      expect(cells('minutes')).toHaveSize(60)
      expect(cells('seconds')).toHaveSize(60)
    })

    it('should drop minutes and seconds when disabled', () => {
      build({ minutes: false, seconds: false })

      expect(cells('minutes')).toHaveSize(0)
      expect(cells('seconds')).toHaveSize(0)
    })

    it('should render a meridiem column for a 12-hour locale', () => {
      build({ locale: 'en-US' })

      expect(cells('hours')).toHaveSize(12)
      expect(cells('meridiem')).toHaveSize(2)
    })

    it('should accept an explicit list of hours', () => {
      build({ hours: [8, 12, 16] })

      expect(cells('hours')).toHaveSize(3)
    })

    it('should accept a filter function for hours', () => {
      build({ hours: hour => hour % 6 === 0 })

      expect(cells('hours')).toHaveSize(4)
    })
  })

  describe('select variant', () => {
    it('should render selects instead of roll columns', () => {
      build({ variant: 'select' })

      expect(fixtureEl.querySelectorAll('select.time-picker-inline-select')).toHaveSize(3)
      expect(fixtureEl.querySelector('.time-picker-roll-col')).toBeNull()
    })

    it('should report a change from a select', () => {
      let reported = null
      build({
        onChange(time) {
          reported = time
        }, variant: 'select'
      })

      const minutes = fixtureEl.querySelector('select.minutes')
      minutes.value = '30'
      minutes.dispatchEvent(new Event('change'))

      expect(reported.getMinutes()).toEqual(30)
    })

    it('should preselect the current value in the selects', () => {
      build({ time: new Date(2026, 0, 1, 9, 45, 0), variant: 'select' })

      expect(fixtureEl.querySelector('select.hours').value).toEqual('9')
      expect(fixtureEl.querySelector('select.minutes').value).toEqual('45')
    })
  })

  describe('changes', () => {
    it('should build a time from an empty start', () => {
      let reported = null
      const selection = build({
        onChange(time) {
          reported = time
        }
      })

      cells('hours')[7].click()

      expect(reported.getHours()).toEqual(7)
      expect(selection.getTime().getHours()).toEqual(7)
    })

    it('should keep the other parts when one changes', () => {
      const selection = build({ time: new Date(2026, 0, 1, 7, 30, 15) })

      cells('minutes')[45].click()

      expect(selection.getTime().getHours()).toEqual(7)
      expect(selection.getTime().getMinutes()).toEqual(45)
      expect(selection.getTime().getSeconds()).toEqual(15)
    })

    it('should set seconds', () => {
      const selection = build({ time: new Date(2026, 0, 1, 7, 30, 0) })

      cells('seconds')[20].click()

      expect(selection.getTime().getSeconds()).toEqual(20)
    })

    it('should convert hours when switching the meridiem', () => {
      const selection = build({ locale: 'en-US', time: new Date(2026, 0, 1, 9, 0, 0) })

      fixtureEl.querySelector('[data-coreui-meridiem="pm"]').click()
      expect(selection.getTime().getHours()).toEqual(21)

      fixtureEl.querySelector('[data-coreui-meridiem="am"]').click()
      expect(selection.getTime().getHours()).toEqual(9)
    })

    it('should apply the meridiem when picking an hour in a 12-hour locale', () => {
      const selection = build({ locale: 'en-US', time: new Date(2026, 0, 1, 13, 0, 0) })

      // the roll lists 1..12; index 2 is hour 3, which must land in the PM half
      cells('hours')[2].click()

      expect(selection.getTime().getHours()).toEqual(15)
    })

    it('should change the time from the keyboard', () => {
      const selection = build({ time: new Date(2026, 0, 1, 0, 0, 0) })

      cells('hours')[5].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))

      expect(selection.getTime().getHours()).toEqual(5)
    })

    it('should ignore unrelated keys', () => {
      const selection = build({ time: new Date(2026, 0, 1, 0, 0, 0) })

      cells('hours')[5].dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true }))

      expect(selection.getTime().getHours()).toEqual(0)
    })
  })

  describe('update and dispose', () => {
    it('should re-render with a merged configuration', () => {
      const selection = build({ time: new Date(2026, 0, 1, 7, 0, 0) })

      selection.update({ seconds: false })

      expect(cells('seconds')).toHaveSize(0)
      expect(cells('minutes').length).toBeGreaterThan(0)
    })

    it('should mark the selected cells after an update', () => {
      const selection = build()

      selection.update({ time: new Date(2026, 0, 1, 6, 5, 0) })

      expect(fixtureEl.querySelector('[data-coreui-hours="6"]').classList.contains('selected')).toBeTrue()
    })

    it('should empty the element on dispose', () => {
      const selection = build()
      const host = selection._element

      selection.dispose()

      expect(host.innerHTML).toEqual('')
      expect(selection._element).toBeNull()
    })
  })
})

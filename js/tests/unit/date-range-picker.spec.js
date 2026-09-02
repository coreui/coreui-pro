import DateRangePicker from '../../src/date-range-picker.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

describe('DateRangePicker', () => {
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
    const picker = new DateRangePicker(fixtureEl.querySelector('#picker'), config)
    pickers.push(picker)
    return picker
  }

  describe('constructor', () => {
    it('should compose two section fields, a separator, and one multi-month calendar', () => {
      const picker = buildPicker()

      const el = fixtureEl.querySelector('#picker')
      expect(el.classList.contains('date-range-picker')).toBeTrue()
      expect(el.querySelectorAll('.form-date-time')).toHaveSize(2)
      expect(el.querySelector('.form-control-icon svg')).not.toBeNull()

      // the calendar itself is built on first open
      expect(picker._calendar).toBeNull()
      picker.show()

      const popup = fixtureEl.querySelector('.date-picker-popup')
      expect(popup.querySelectorAll('.date-picker-calendar')).toHaveSize(1)
      expect(popup.querySelectorAll('.calendar-nav')).toHaveSize(2)
    })

    it('should seed the lazily built calendar with the current range and selection side', () => {
      const picker = buildPicker({
        startDate: new Date(2026, 5, 1),
        endDate: new Date(2026, 5, 15)
      })

      picker.show()

      expect(picker._calendar._config.startDate).toEqual(new Date(2026, 5, 1))
      expect(picker._calendar._config.endDate).toEqual(new Date(2026, 5, 15))
      expect(picker._calendar._config.range).toBeTrue()
    })

    it('should initialize the fields with the configured range', () => {
      const picker = buildPicker({
        startDate: new Date(2026, 5, 1),
        endDate: new Date(2026, 5, 15)
      })

      expect(picker.getStartDate()).toEqual(new Date(2026, 5, 1))
      expect(picker.getEndDate()).toEqual(new Date(2026, 5, 15))
    })

    it('should generate named hidden inputs for both fields', () => {
      buildPicker({ startName: 'trip-start', endName: 'trip-end' })

      expect(fixtureEl.querySelector('input[name="trip-start"]')).not.toBeNull()
      expect(fixtureEl.querySelector('input[name="trip-end"]')).not.toBeNull()
    })

    it('should render the LTR separator arrow by default', () => {
      const picker = buildPicker()

      expect(picker._resolveSeparatorIcon()).toEqual(picker._config.separatorIcon)
    })

    it('should render the mirrored separator arrow inside an RTL ancestor', () => {
      const picker = buildPicker({}, '<div dir="rtl"><div id="picker"></div></div>')

      expect(picker._resolveSeparatorIcon()).toEqual(picker._config.separatorIconRtl)
      expect(fixtureEl.querySelector('.form-control-icon svg')).not.toBeNull()
    })

    it('should clone a ranges template into the dropdown body', () => {
      const picker = buildPicker({}, [
        '<div id="picker">',
        '  <template data-coreui-template="ranges">',
        '    <button type="button" class="btn btn-sm" id="lastWeek">Last week</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()

      const ranges = fixtureEl.querySelector('.date-picker-popup .date-picker-ranges')
      expect(ranges).not.toBeNull()
      expect(ranges.querySelector('#lastWeek')).not.toBeNull()
    })
  })

  describe('selection types', () => {
    it('should mask a week range like the native week input', () => {
      buildPicker({
        locale: 'en-US',
        selectionType: 'week',
        startDate: new Date(2026, 6, 14),
        endDate: new Date(2026, 7, 5)
      })

      const values = [...fixtureEl.querySelectorAll('#picker input[type="hidden"]')].map(input => input.value)
      expect(values).toEqual(['Week 29, 2026', 'Week 32, 2026'])
    })

    it('should mask a quarter range with the quarter names', () => {
      buildPicker({
        selectionType: 'quarter',
        startDate: new Date(2026, 1, 10),
        endDate: new Date(2026, 10, 15)
      })

      const values = [...fixtureEl.querySelectorAll('#picker input[type="hidden"]')].map(input => input.value)
      expect(values).toEqual(['Q1 2026', 'Q4 2026'])
    })
  })

  describe('range selection', () => {
    it('should update both fields, emit both events, and close after the end date', () => {
      const picker = buildPicker()
      const el = fixtureEl.querySelector('#picker')
      const events = []
      el.addEventListener('startDateChange.coreui.date-range-picker', event => events.push(['start', event.date]))
      el.addEventListener('endDateChange.coreui.date-range-picker', event => events.push(['end', event.date]))

      picker.show()
      const popup = fixtureEl.querySelector('.date-picker-popup')
      const cells = popup.querySelectorAll('.calendar-cell[tabindex="0"]')
      cells[0].click()
      const remaining = popup.querySelectorAll('.calendar-cell[tabindex="0"]')
      remaining[5].click()

      expect(picker.getStartDate()).not.toBeNull()
      expect(picker.getEndDate()).not.toBeNull()
      expect(events.some(([type]) => type === 'start')).toBeTrue()
      expect(events.some(([type]) => type === 'end')).toBeTrue()
      expect(picker._popup.isShown).toBeFalse()
    })

    it('should stay open after the end date when a footer is projected', () => {
      const picker = buildPicker({}, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="close">OK</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()
      const popup = fixtureEl.querySelector('.date-picker-popup')
      const cells = popup.querySelectorAll('.calendar-cell[tabindex="0"]')
      cells[0].click()
      popup.querySelectorAll('.calendar-cell[tabindex="0"]')[5].click()

      expect(picker.getEndDate()).not.toBeNull()
      expect(picker._popup.isShown).toBeTrue()

      popup.querySelector('[data-coreui-picker-action="close"]').click()
      expect(picker._popup.isShown).toBeFalse()
    })

    it('should select a full range after the start field was focused', () => {
      const picker = buildPicker()
      const el = fixtureEl.querySelector('#picker')

      // focusing a section of the start field steers the calendar to
      // start-date selection — it must NOT reset the range configuration
      el.querySelector('.form-date-time-section').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      picker.show()

      const popup = fixtureEl.querySelector('.date-picker-popup')
      expect(popup.querySelectorAll('.calendar-nav')).toHaveSize(2)

      const cells = popup.querySelectorAll('.calendar-cell[tabindex="0"]')
      cells[0].click()
      popup.querySelectorAll('.calendar-cell[tabindex="0"]')[5].click()

      expect(picker.getStartDate()).not.toBeNull()
      expect(picker.getEndDate()).not.toBeNull()
      expect(picker.getEndDate().getTime()).toBeGreaterThan(picker.getStartDate().getTime())
    })

    it('should keep the popup open when navigating months', () => {
      const picker = buildPicker()

      picker.show()
      fixtureEl.querySelector('.date-picker-popup .btn-next').click()

      expect(picker._popup.isShown).toBeTrue()
      picker.hide()
    })
  })

  describe('cleaner', () => {
    it('should clear both dates when the cleaner is clicked', () => {
      const picker = buildPicker({ startDate: new Date(2026, 5, 1), endDate: new Date(2026, 5, 15) })

      fixtureEl.querySelector('.form-control-cleaner').click()

      expect(picker.getStartDate()).toBeNull()
      expect(picker.getEndDate()).toBeNull()
    })

    it('should not render a cleaner when the option is off', () => {
      buildPicker({ cleaner: false, startDate: new Date(2026, 5, 1) })

      expect(fixtureEl.querySelector('.form-control-cleaner')).toBeNull()
    })
  })

  describe('slot context', () => {
    it('should expose the range contract', () => {
      const picker = buildPicker()
      const context = picker.getContext()

      expect(Object.keys(context).toSorted()).toEqual(['clear', 'close', 'disabled', 'endDate', 'isDateSelectable', 'reset', 'setRange', 'startDate'])
    })

    it('should set a range through the context and emit both events', () => {
      const picker = buildPicker()
      const el = fixtureEl.querySelector('#picker')
      const events = []
      el.addEventListener('startDateChange.coreui.date-range-picker', () => events.push('start'))
      el.addEventListener('endDateChange.coreui.date-range-picker', () => events.push('end'))

      picker.getContext().setRange(new Date(2026, 5, 1), new Date(2026, 5, 7))

      expect(picker.getStartDate()).toEqual(new Date(2026, 5, 1))
      expect(picker.getEndDate()).toEqual(new Date(2026, 5, 7))
      expect(events).toEqual(['start', 'end'])
    })

    it('should clear the range through the context', () => {
      const picker = buildPicker({
        startDate: new Date(2026, 5, 1),
        endDate: new Date(2026, 5, 15)
      })

      picker.getContext().clear()

      expect(picker.getStartDate()).toBeNull()
      expect(picker.getEndDate()).toBeNull()
    })
  })

  describe('dispose', () => {
    it('should drop the listeners on the controls it built', () => {
      fixtureEl.innerHTML = '<div id="picker"></div>'
      const picker = new DateRangePicker(fixtureEl.querySelector('#picker'))
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
      const picker = new DateRangePicker(el)

      picker.dispose()

      expect(el.children).toHaveLength(0)
      expect(el.classList.contains('form-control-group')).toBe(false)
    })

    it('should build one set of controls when re-initialised on the same element', () => {
      fixtureEl.innerHTML = '<div id="picker"></div>'
      const el = fixtureEl.querySelector('#picker')
      new DateRangePicker(el) // eslint-disable-line no-new
      pickers.push(new DateRangePicker(el))

      expect(el.querySelectorAll('.form-date-time')).toHaveLength(2)
      expect(el.querySelectorAll('.form-control-icon')).toHaveLength(1)
      expect(el.querySelectorAll('.form-control-cleaner')).toHaveLength(1)
      expect(el.querySelectorAll('.form-control-action')).toHaveLength(1)
    })
  })
})

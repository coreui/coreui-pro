import DatePicker from '../../src/date-picker.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

describe('DatePicker', () => {
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
    const picker = new DatePicker(fixtureEl.querySelector('#picker'), config)
    pickers.push(picker)
    return picker
  }

  // The native <input type="date"> entry contract: opening puts focus on the
  // selected date; without one, on today; and when a max date has pushed both
  // out of reach, on the last date still selectable.
  describe('focus entry', () => {
    it('should land on the selected date, not on the first day of the grid', () => {
      const picker = buildPicker({ date: '2026-08-10' })
      picker.show()

      const active = document.activeElement
      expect(active.getAttribute('aria-selected')).toEqual('true')
      expect(new Date(active.dataset.coreuiDate).getDate()).toEqual(10)
    })

    it('should land on today when nothing is selected', () => {
      const picker = buildPicker()
      picker.show()

      expect(document.activeElement.getAttribute('aria-current')).toEqual('date')
    })

    it('should land on the last selectable date when today is out of range', () => {
      // A fixed past view keeps this deterministic: today is never in it, so
      // the only anchor left is the max date closing the range.
      const picker = buildPicker({ calendarDate: '2020-05-20', maxDate: '2020-05-10' })
      picker.show()

      expect(new Date(document.activeElement.dataset.coreuiDate).getDate()).toEqual(10)
    })
  })

  describe('constructor', () => {
    it('should compose an input group, an indicator, and an empty calendar container', () => {
      const picker = buildPicker()

      const el = fixtureEl.querySelector('#picker')
      expect(el.classList.contains('date-picker')).toBeTrue()
      expect(el.classList.contains('form-control-group')).toBeTrue()
      expect(el.querySelector('.form-control-action')).not.toBeNull()

      picker.show()

      expect(fixtureEl.querySelector('.date-picker-popup .date-picker-calendar')).not.toBeNull()
    })

    it('should not build the calendar until the popup opens', () => {
      const picker = buildPicker()

      expect(picker._calendar).toBeNull()
      expect(fixtureEl.querySelector('.date-picker-popup')).toBeNull()
      expect(fixtureEl.querySelector('.calendar')).toBeNull()

      picker.show()

      expect(picker._calendar).not.toBeNull()
      expect(fixtureEl.querySelector('.date-picker-popup .calendar')).not.toBeNull()
    })

    it('should seed the lazily built calendar with the current value', () => {
      const picker = buildPicker()
      picker.setDate(new Date(2026, 5, 15))

      picker.show()

      expect(picker._calendar._config.startDate).toEqual(new Date(2026, 5, 15))
    })

    it('should initialize the section input with the configured date', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15) })

      expect(picker.getDate()).toEqual(new Date(2026, 5, 15))
    })

    it('should render the indicator icon as inline SVG on currentColor', () => {
      buildPicker()

      const indicator = fixtureEl.querySelector('.form-control-action')
      const svg = indicator.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg.getAttribute('fill')).toEqual('currentColor')
      expect(indicator.getAttribute('aria-label')).toEqual('Toggle the calendar')
    })

    it('should accept a custom indicator icon and sanitize it', () => {
      buildPicker({
        indicatorIcon: '<svg xmlns="http://www.w3.org/2000/svg"><script>window.hacked = true</script><circle r="8" /></svg>'
      })

      const indicator = fixtureEl.querySelector('.form-control-action')
      expect(indicator.querySelector('circle')).not.toBeNull()
      expect(indicator.querySelector('script')).toBeNull()
      expect(window.hacked).toBeUndefined()
    })

    it('should not render a footer without a template child', () => {
      const picker = buildPicker()

      picker.show()

      expect(fixtureEl.querySelector('.date-picker-popup')).not.toBeNull()
      expect(fixtureEl.querySelector('.date-picker-footer')).toBeNull()
    })

    it('should clone a footer template into the dropdown', () => {
      const picker = buildPicker({}, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="today">Today</button>',
        '    <button type="button" data-coreui-picker-action="close">OK</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()

      const footer = fixtureEl.querySelector('.date-picker-popup .date-picker-footer')
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
        el.addEventListener(`${name}.coreui.date-picker`, () => calls.push(name))
      }

      el.querySelector('.form-control-action').click()
      expect(el.classList.contains('show')).toBeTrue()
      expect(el.getAttribute('aria-expanded')).toEqual('true')

      el.querySelector('.form-control-action').click()
      expect(el.classList.contains('show')).toBeFalse()
      expect(calls).toEqual(['show', 'shown', 'hide', 'hidden'])
      expect(picker._popup.isShown).toBeFalse()
    })

    it('should disable the indicator button when the picker is disabled', () => {
      buildPicker({ disabled: true })

      const indicator = fixtureEl.querySelector('.form-control-action')
      expect(indicator.disabled).toBeTrue()
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
      el.addEventListener('dateChange.coreui.date-picker', event => {
        emitted = event.date
      })

      picker.show()
      const dayCell = fixtureEl.querySelector('.date-picker-popup .calendar-cell[tabindex="0"]')
      dayCell.click()

      expect(emitted).not.toBeNull()
      expect(picker.getDate()).toEqual(emitted)
      expect(picker._popup.isShown).toBeFalse()
    })
  })

  describe('selection types', () => {
    it('should mask week selection like the native week input', () => {
      const picker = buildPicker({ locale: 'en-US', selectionType: 'week', date: new Date(2026, 6, 14) })

      expect(fixtureEl.querySelector('#picker input[type="hidden"]').value).toEqual('Week 29, 2026')
      expect(picker.getDate()).toEqual(new Date(2026, 6, 13))
    })

    it('should localize the fixed week label', () => {
      buildPicker({ locale: 'pl-PL', selectionType: 'week', date: new Date(2026, 6, 14) })

      expect(fixtureEl.querySelector('#picker input[type="hidden"]').value).toEqual('Tydzień 29, 2026')
    })

    it('should let an explicit format override the week mask', () => {
      buildPicker({ format: 'yyyy-Www', selectionType: 'week', date: new Date(2026, 6, 14) })

      expect(fixtureEl.querySelector('#picker input[type="hidden"]').value).toEqual('2026-W29')
    })

    it('should fill the week sections when a calendar week is selected', () => {
      const picker = buildPicker({ locale: 'en-US', selectionType: 'week', date: new Date(2026, 6, 14) })
      const el = fixtureEl.querySelector('#picker')
      let emitted = null
      el.addEventListener('dateChange.coreui.date-picker', event => {
        emitted = event.date
      })

      picker.show()
      fixtureEl.querySelector('.date-picker-popup .calendar-row[tabindex="0"] .calendar-cell').click()

      expect(emitted).toMatch(/^\d{4}W\d{2}$/)
      expect(el.querySelector('input[type="hidden"]').value).toEqual(`Week ${emitted.slice(5)}, ${emitted.slice(0, 4)}`)
    })

    it('should keep the ISO week-numbering year around January 1st', () => {
      const picker = buildPicker({ locale: 'en-US', selectionType: 'week', date: new Date(2027, 0, 1) })

      expect(fixtureEl.querySelector('#picker input[type="hidden"]').value).toEqual('Week 53, 2026')
      expect(picker.getDate()).toEqual(new Date(2026, 11, 28))
    })

    it('should mask quarter selection with the quarter name', () => {
      const picker = buildPicker({ selectionType: 'quarter', date: new Date(2026, 10, 15) })

      expect(fixtureEl.querySelector('#picker input[type="hidden"]').value).toEqual('Q4 2026')
      expect(picker.getDate()).toEqual(new Date(2026, 9, 1))
    })

    it('should fill the quarter sections when a calendar quarter is selected', () => {
      const picker = buildPicker({ selectionType: 'quarter', date: new Date(2026, 10, 15) })
      const el = fixtureEl.querySelector('#picker')

      picker.show()
      fixtureEl.querySelector('.date-picker-popup .calendar-cell[tabindex="0"]').click()

      expect(el.querySelector('input[type="hidden"]').value).toMatch(/^Q[1-4] \d{4}$/)
    })
  })

  describe('cleaner', () => {
    it('should clear the value when the cleaner is clicked', () => {
      const picker = buildPicker({ date: new Date(2026, 6, 14) })

      fixtureEl.querySelector('.form-control-cleaner').click()

      expect(picker.getDate()).toBeNull()
    })

    it('should not open the popup when the cleaner is clicked', () => {
      const picker = buildPicker({ date: new Date(2026, 6, 14) })

      fixtureEl.querySelector('.form-control-cleaner').click()

      expect(picker._popup.isShown).toBeFalse()
    })

    it('should hide the cleaner while the field is empty', () => {
      buildPicker()

      // the field reports emptiness; the rule that acts on it is CSS, so the
      // hook itself is what the test can assert
      expect(fixtureEl.querySelector('.form-date-time').classList.contains('form-date-time-filled')).toBeFalse()
      expect(fixtureEl.querySelector('.form-control-cleaner')).not.toBeNull()
    })

    it('should mark the field filled once it holds a value', () => {
      buildPicker({ date: new Date(2026, 6, 14) })

      expect(fixtureEl.querySelector('.form-date-time').classList.contains('form-date-time-filled')).toBeTrue()
    })

    it('should not render a cleaner when the option is off', () => {
      buildPicker({ cleaner: false, date: new Date(2026, 6, 14) })

      expect(fixtureEl.querySelector('.form-control-cleaner')).toBeNull()
    })

    it('should disable the cleaner when the picker is disabled', () => {
      buildPicker({ date: new Date(2026, 6, 14), disabled: true })

      expect(fixtureEl.querySelector('.form-control-cleaner').disabled).toBeTrue()
    })
  })

  describe('min/max validation', () => {
    it('should propagate field validation to a programmatic date beyond maxDate', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const picker = buildPicker({ maxDate: yesterday })
      const el = fixtureEl.querySelector('#picker')
      let emitted = 'not-fired'
      el.addEventListener('dateChange.coreui.date-picker', event => {
        emitted = event.date
      })

      picker.setDate(new Date())

      expect(picker.getDate()).toBeNull()
      expect(emitted).toBeNull()
      expect(el.querySelector('.form-date-time').classList.contains('is-invalid')).toBeTrue()
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

    it('should keep a projected today action enabled when today is selectable', () => {
      const picker = buildPicker({}, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="today">Today</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()

      expect(fixtureEl.querySelector('.date-picker-popup [data-coreui-picker-action="today"]').disabled).toBeFalse()
    })

    it('should not re-enable a today action disabled in the template', () => {
      const picker = buildPicker({}, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="today" disabled>Today</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()

      expect(fixtureEl.querySelector('.date-picker-popup [data-coreui-picker-action="today"]').disabled).toBeTrue()
    })

    it('should emit and select a programmatic date within range', () => {
      const picker = buildPicker({ maxDate: new Date(2026, 6, 31) })
      const el = fixtureEl.querySelector('#picker')
      let emitted = null
      el.addEventListener('dateChange.coreui.date-picker', event => {
        emitted = event.date
      })

      picker.setDate(new Date(2026, 6, 14))

      expect(picker.getDate()).toEqual(new Date(2026, 6, 14))
      expect(emitted).toEqual(new Date(2026, 6, 14))
      expect(el.querySelector('.form-date-time').classList.contains('is-invalid')).toBeFalse()
    })
  })

  describe('calendar navigation', () => {
    it('should keep the popup open when navigating months', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15) })
      const el = fixtureEl.querySelector('#picker')

      picker.show()
      fixtureEl.querySelector('.date-picker-popup .btn-next').click()

      expect(picker._popup.isShown).toBeTrue()
      expect(el.classList.contains('show')).toBeTrue()
    })
  })

  describe('slot context', () => {
    it('should expose the contract actions and state', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15) })
      const context = picker.getContext()

      expect(Object.keys(context).toSorted()).toEqual(['clear', 'close', 'date', 'disabled', 'isDateSelectable', 'reset', 'setDate', 'today'])
      expect(context.date).toEqual(new Date(2026, 5, 15))
      expect(context.disabled).toBeFalse()
    })

    it('should clear the value through the context', () => {
      const picker = buildPicker({ date: new Date(2026, 5, 15) })

      picker.getContext().clear()

      expect(picker.getDate()).toBeNull()
    })

    it('should answer date selectability through the context', () => {
      const picker = buildPicker({
        disabledDates: [new Date(2026, 6, 15)],
        maxDate: new Date(2026, 6, 20),
        minDate: new Date(2026, 6, 10)
      })
      const { isDateSelectable } = picker.getContext()

      expect(isDateSelectable(new Date(2026, 6, 14))).toBeTrue()
      expect(isDateSelectable(new Date(2026, 6, 15))).toBeFalse()
      expect(isDateSelectable(new Date(2026, 6, 21))).toBeFalse()
      expect(isDateSelectable(new Date(2026, 6, 9))).toBeFalse()
      expect(isDateSelectable(null)).toBeFalse()
    })

    it('should check selectability at the mask granularity', () => {
      // a raw comparison of "now" against a midnight maxDate would fail here
      const midnight = new Date()
      midnight.setHours(0, 0, 0, 0)
      const picker = buildPicker({ maxDate: midnight })

      expect(picker.getContext().isDateSelectable(new Date())).toBeTrue()
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

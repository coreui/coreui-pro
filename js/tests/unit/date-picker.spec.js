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

  describe('constructor', () => {
    it('should compose an input group, an indicator, and an empty calendar container', () => {
      buildPicker()

      const el = fixtureEl.querySelector('#picker')
      expect(el.classList.contains('date-picker')).toBeTrue()
      expect(el.querySelector('.date-picker-input-group')).not.toBeNull()
      expect(el.querySelector('.date-picker-indicator')).not.toBeNull()
      expect(el.querySelector('.date-picker-dropdown .date-picker-calendar')).not.toBeNull()
    })

    it('should not build the calendar until the popup opens', () => {
      const picker = buildPicker()
      const el = fixtureEl.querySelector('#picker')

      expect(picker._calendar).toBeNull()
      expect(el.querySelector('.calendar')).toBeNull()

      picker.show()

      expect(picker._calendar).not.toBeNull()
      expect(el.querySelector('.date-picker-dropdown .calendar')).not.toBeNull()
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

      const indicator = fixtureEl.querySelector('.date-picker-indicator')
      const svg = indicator.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg.getAttribute('fill')).toEqual('currentColor')
      expect(indicator.getAttribute('aria-label')).toEqual('Toggle the calendar')
    })

    it('should accept a custom indicator icon and sanitize it', () => {
      buildPicker({
        indicatorIcon: '<svg xmlns="http://www.w3.org/2000/svg"><script>window.hacked = true</script><circle r="8" /></svg>'
      })

      const indicator = fixtureEl.querySelector('.date-picker-indicator')
      expect(indicator.querySelector('circle')).not.toBeNull()
      expect(indicator.querySelector('script')).toBeNull()
      expect(window.hacked).toBeUndefined()
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
        el.addEventListener(`${name}.coreui.date-picker`, () => calls.push(name))
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
      el.addEventListener('dateChange.coreui.date-picker', event => {
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
      el.querySelector('.calendar-row[tabindex="0"] .calendar-cell').click()

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
      el.querySelector('.calendar-cell[tabindex="0"]').click()

      expect(el.querySelector('input[type="hidden"]').value).toMatch(/^Q[1-4] \d{4}$/)
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

    it('should keep the projected today action consistent with validation', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const picker = buildPicker({ maxDate: yesterday }, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="today">Today</button>',
        '  </template>',
        '</div>'
      ].join(''))
      const el = fixtureEl.querySelector('#picker')

      picker.show()
      el.querySelector('[data-coreui-picker-action="today"]').click()

      expect(picker.getDate()).toBeNull()
      expect(el.querySelector('.form-date-time').classList.contains('is-invalid')).toBeTrue()
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
      el.querySelector('.btn-next').click()

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

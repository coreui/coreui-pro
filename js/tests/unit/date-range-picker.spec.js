import { vi } from 'vitest'
import Calendar from '../../src/calendar.js'
import DateRangeInput from '../../src/date-range-input.js'
import DateRangePicker from '../../src/date-range-picker.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

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

  describe('calendar options', () => {
    it('should pass the years-view arrow labels to the calendar', () => {
      const picker = buildPicker({
        ariaNavNextYearsLabel: 'Następne 12 lat', ariaNavPrevYearsLabel: 'Poprzednie 12 lat', locale: 'en-US', selectionType: 'year'
      })
      picker.show()

      expect(fixtureEl.querySelector('.date-picker-popup .btn-double-next').getAttribute('aria-label')).toEqual('Następne 12 lat')
      expect(fixtureEl.querySelector('.date-picker-popup .btn-double-prev').getAttribute('aria-label')).toEqual('Poprzednie 12 lat')
    })

    it('should pass ariaNothingToPickLabel to the calendar', () => {
      const picker = buildPicker({ ariaNothingToPickLabel: 'Brak dat do wyboru', disabledDates: () => true })
      picker.show()

      const grid = fixtureEl.querySelector('.date-picker-popup table')

      expect(document.getElementById(grid.getAttribute('aria-describedby')).textContent).toEqual('Brak dat do wyboru')
    })

    it('should pass ariaWeekNumberLabel to the calendar', () => {
      const picker = buildPicker({ ariaWeekNumberLabel: weekNumber => `Tydz. ${weekNumber}`, calendarDate: '2026-09-01', showWeekNumber: true })
      picker.show()

      expect(fixtureEl.querySelector('.date-picker-popup tbody .calendar-cell-week-number').getAttribute('aria-label')).toEqual('Tydz. 36')
    })
  })

  describe('constructor', () => {
    it('should let a global picker default reach the calendar and win over a global field default', () => {
      const pickerSelection = DateRangePicker.Default.selectionType
      const pickerLabel = DateRangePicker.Default.ariaStartLabel
      const fieldLabel = DateRangeInput.Default.ariaStartLabel
      DateRangePicker.Default.selectionType = 'month'
      DateRangePicker.Default.ariaStartLabel = 'Od'
      DateRangeInput.Default.ariaStartLabel = 'Początek'

      try {
        const picker = buildPicker({ locale: 'en-US' })
        picker.show()

        expect(picker._calendar._config.selectionType).toEqual('month')
        expect(fixtureEl.querySelector('#picker .form-date-time').getAttribute('aria-label')).toEqual('Od')
      } finally {
        DateRangePicker.Default.selectionType = pickerSelection
        DateRangePicker.Default.ariaStartLabel = pickerLabel
        DateRangeInput.Default.ariaStartLabel = fieldLabel
      }
    })

    it('should fall back to the end labels the page set on the picker when the option is empty', () => {
      const pickerLabel = DateRangePicker.Default.ariaStartLabel
      DateRangePicker.Default.ariaStartLabel = 'Od'

      try {
        buildPicker({ ariaStartLabel: '', locale: 'en-US' })

        expect(fixtureEl.querySelector('#picker .form-date-time').getAttribute('aria-label')).toEqual('Od')
      } finally {
        DateRangePicker.Default.ariaStartLabel = pickerLabel
      }
    })

    it('should keep a global field default the picker leaves alone', () => {
      const fieldLabel = DateRangeInput.Default.ariaStartLabel
      DateRangeInput.Default.ariaStartLabel = 'Początek'

      try {
        buildPicker({ locale: 'en-US' })

        expect(fixtureEl.querySelector('#picker .form-date-time').getAttribute('aria-label')).toEqual('Początek')
      } finally {
        DateRangeInput.Default.ariaStartLabel = fieldLabel
      }
    })

    it('should check the options it reads under its own name', () => {
      for (const [option, value] of [['format', 42], ['selectionType', 7]]) {
        expect(() => buildPicker({ [option]: value })).toThrowError(new RegExp(`^DATE-RANGE-PICKER: Option "${option}"`))
      }
    })

    it('should point aria-controls at the panel only while it exists', () => {
      const picker = buildPicker()
      const indicator = fixtureEl.querySelector('.form-control-action')

      expect(indicator.hasAttribute('aria-controls')).toBeFalse()

      picker.show()

      expect(indicator.getAttribute('aria-controls')).toEqual(picker._menu.id)

      picker.hide()

      expect(indicator.hasAttribute('aria-controls')).toBeFalse()
    })

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

    it('should generate named value fields for both ends', () => {
      buildPicker({ startName: 'trip-start', endName: 'trip-end' })

      expect(fixtureEl.querySelector('textarea[name="trip-start"]')).not.toBeNull()
      expect(fixtureEl.querySelector('textarea[name="trip-end"]')).not.toBeNull()
    })

    it('should build its field inside the element rather than on it', () => {
      const picker = buildPicker()
      const el = fixtureEl.querySelector('#picker')

      expect(el.classList.contains('form-control-group')).toBeFalse()
      expect(el.classList.contains('date-range-picker')).toBeTrue()
      expect(picker._frameElement.classList.contains('form-control-group')).toBeTrue()
      expect(picker._frameElement.classList.contains('form-date-range')).toBeTrue()
      expect(picker._frameElement.parentElement).toBe(el)
      expect(el.querySelector('.form-control-action').getAttribute('aria-expanded')).toEqual('false')
    })

    it('should render the LTR separator arrow by default', () => {
      const picker = buildPicker()

      expect(picker._frameElement.querySelector('.form-control-icon svg')).not.toBeNull()
      expect(picker._rangeInput._config.separatorIcon).toEqual(picker._config.separatorIcon)
    })

    it('should render the mirrored separator arrow inside an RTL ancestor', () => {
      const picker = buildPicker({}, '<div dir="rtl"><div id="picker"></div></div>')

      expect(picker._frameElement.querySelector('.form-control-icon path').getAttribute('d'))
        .toEqual(new DOMParser().parseFromString(picker._config.separatorIconRtl, 'image/svg+xml').querySelector('path').getAttribute('d'))
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
    it('should open a week range on the row of today', () => {
      const picker = buildPicker({ selectionType: 'week' })
      picker.show()

      expect(document.activeElement.tagName).toEqual('TR')
      expect(document.activeElement.querySelector('[aria-current="date"]')).not.toBeNull()
    })

    it('should mask a week range like the native week input', () => {
      buildPicker({
        locale: 'en-US',
        selectionType: 'week',
        startDate: new Date(2026, 6, 14),
        endDate: new Date(2026, 7, 5)
      })

      const values = [...fixtureEl.querySelectorAll('#picker .form-date-time > textarea')].map(input => input.value)
      expect(values).toEqual(['Week 29, 2026', 'Week 32, 2026'])
    })

    it('should mask a quarter range with the quarter names', () => {
      buildPicker({
        selectionType: 'quarter',
        startDate: new Date(2026, 1, 10),
        endDate: new Date(2026, 10, 15)
      })

      const values = [...fixtureEl.querySelectorAll('#picker .form-date-time > textarea')].map(input => input.value)
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
      const cells = popup.querySelectorAll('.calendar-cell[data-coreui-selectable]')
      cells[0].click()
      const remaining = popup.querySelectorAll('.calendar-cell[data-coreui-selectable]')
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
      const cells = popup.querySelectorAll('.calendar-cell[data-coreui-selectable]')
      cells[0].click()
      popup.querySelectorAll('.calendar-cell[data-coreui-selectable]')[5].click()

      expect(picker.getEndDate()).not.toBeNull()
      expect(picker._popup.isShown).toBeTrue()

      popup.querySelector('[data-coreui-picker-action="close"]').click()
      expect(picker._popup.isShown).toBeFalse()
    })

    it('should render a projected footer in the date picker footer and name the popup the indicator controls', () => {
      const picker = buildPicker({}, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="close">OK</button>',
        '  </template>',
        '</div>'
      ].join(''))
      const indicator = fixtureEl.querySelector('.form-control-action')

      picker.show()

      expect(document.querySelector('.date-picker-popup > .date-picker-footer [data-coreui-picker-action="close"]')).not.toBeNull()
      expect(indicator.getAttribute('aria-controls')).toMatch(/^date-range-picker-popup-\d+$/)
      expect(document.getElementById(indicator.getAttribute('aria-controls'))).toEqual(document.querySelector('.date-picker-popup'))
    })

    it('should keep the picked range in the calendar when the end field is focused', () => {
      const picker = buildPicker({}, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="close">OK</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()
      const popup = fixtureEl.querySelector('.date-picker-popup')
      popup.querySelectorAll('.calendar-cell[data-coreui-selectable]')[3].click()
      popup.querySelectorAll('.calendar-cell[data-coreui-selectable]')[8].click()

      const sections = fixtureEl.querySelectorAll('#picker .form-date-time-section')
      sections[sections.length - 1].dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

      expect(popup.querySelectorAll('.calendar-cell.selected').length).toEqual(2)
    })

    it('should stay silent when the calendar picks the start it already holds', () => {
      const picker = buildPicker({ locale: 'en-US', startDate: new Date(2026, 6, 14), endDate: new Date(2026, 6, 20) }, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="close">OK</button>',
        '  </template>',
        '</div>'
      ].join(''))
      const el = fixtureEl.querySelector('#picker')
      const events = []
      el.addEventListener('startDateChange.coreui.date-range-picker', event => events.push(['start', event.date]))
      el.addEventListener('endDateChange.coreui.date-range-picker', event => events.push(['end', event.date]))

      picker.show()
      fixtureEl.querySelector('#picker .form-date-time-section').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      fixtureEl.querySelector('.date-picker-popup .calendar-cell[data-coreui-date^="Tue Jul 14 2026"]').click()

      expect(events).toEqual([])
      expect(picker.getStartDate()).toEqual(new Date(2026, 6, 14))
    })

    it('should stay silent when the calendar picks the end it already holds', () => {
      const picker = buildPicker({ locale: 'en-US', startDate: new Date(2026, 6, 14), endDate: new Date(2026, 6, 20) }, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="close">OK</button>',
        '  </template>',
        '</div>'
      ].join(''))
      const el = fixtureEl.querySelector('#picker')
      const events = []
      el.addEventListener('startDateChange.coreui.date-range-picker', event => events.push(['start', event.date]))
      el.addEventListener('endDateChange.coreui.date-range-picker', event => events.push(['end', event.date]))

      picker.show()
      const sections = fixtureEl.querySelectorAll('#picker .form-date-time-section')
      sections[sections.length - 1].dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
      fixtureEl.querySelector('.date-picker-popup .calendar-cell[data-coreui-date^="Mon Jul 20 2026"]').click()

      expect(events).toEqual([])
      expect(picker.getEndDate()).toEqual(new Date(2026, 6, 20))
    })

    it('should stay silent when the field refuses a pick for a date that was already empty', () => {
      const picker = buildPicker({
        locale: 'en-US',
        calendarOptions: { calendarDate: new Date(2026, 6, 1) },
        inputOptions: { minDate: new Date(2026, 6, 20) }
      })
      const el = fixtureEl.querySelector('#picker')
      const events = []
      el.addEventListener('startDateChange.coreui.date-range-picker', event => events.push(['start', event.date]))

      picker.show()
      fixtureEl.querySelector('.date-picker-popup .calendar-cell[data-coreui-date^="Fri Jul 10 2026"]').click()

      expect(events).toEqual([])
      expect(picker.getStartDate()).toBeNull()
    })

    it('should aim the calendar at the end date when the end field was focused', () => {
      const picker = buildPicker()
      const sections = fixtureEl.querySelectorAll('#picker .form-date-time-section')

      sections[sections.length - 1].dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

      expect(picker._selectEndDate).toBeTrue()

      sections[0].dispatchEvent(new FocusEvent('focusin', { bubbles: true }))

      expect(picker._selectEndDate).toBeFalse()
    })

    it('should keep the panel inside the picker', () => {
      const picker = buildPicker()
      picker.show()

      expect(fixtureEl.querySelector('#picker').contains(fixtureEl.querySelector('.date-picker-popup'))).toBeTrue()
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

      const cells = popup.querySelectorAll('.calendar-cell[data-coreui-selectable]')
      cells[0].click()
      popup.querySelectorAll('.calendar-cell[data-coreui-selectable]')[5].click()

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

  describe('announcements', () => {
    afterEach(() => {
      vi.useRealTimers()

      for (const announcer of document.querySelectorAll('[data-coreui-live-announcer]')) {
        announcer.remove()
      }
    })

    it('should name the toggle with the range it holds and leave the picks of a closing panel to it', async () => {
      const picker = buildPicker({ calendarDate: new Date(2026, 7, 1), calendars: 1, locale: 'en-US' })
      const toggle = fixtureEl.querySelector('[aria-haspopup]')

      expect(toggle.getAttribute('aria-label')).toEqual('Toggle calendar')

      picker.show()
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
      const added = []
      const collect = records => {
        for (const record of records) {
          added.push(...[...record.addedNodes].filter(node => node.parentElement?.matches('[aria-live]')).map(node => node.textContent))
        }
      }

      const observer = new MutationObserver(collect)
      observer.observe(document.body, { childList: true, subtree: true })
      document.querySelector(`.date-picker-popup [data-coreui-date="${new Date(2026, 7, 20).toDateString()}"]`).click()
      await Promise.resolve()
      document.querySelector(`.date-picker-popup [data-coreui-date="${new Date(2026, 7, 23).toDateString()}"]`).click()
      vi.advanceTimersByTime(2000)
      collect(observer.takeRecords())
      observer.disconnect()

      expect(added.filter(message => message.startsWith('Selected'))).toEqual([])
      expect(toggle.getAttribute('aria-label')).toMatch(/^Toggle calendar, Thursday, August 20\s–\sSunday, August 23, 2026$/)

      picker.setRange(new Date(2026, 8, 1), new Date(2026, 8, 1))
      expect(toggle.getAttribute('aria-label')).toEqual('Toggle calendar, Tuesday, September 1, 2026')

      picker.clear()
      expect(toggle.getAttribute('aria-label')).toEqual('Toggle calendar')
    })

    it('should name the toggle with the calendar options given to the picker', () => {
      buildPicker({
        endDate: new Date(2026, 7, 24), firstDayOfWeek: 0, locale: 'en-US', selectionType: 'week', showWeekNumber: true, startDate: new Date(2026, 7, 10)
      })

      expect(fixtureEl.querySelector('[aria-haspopup]').getAttribute('aria-label')).toMatch(/^Toggle calendar, Week 33 – Week 35, August 9\s–\s29, 2026$/)
    })

    it('should turn off the pick messages of the calendar only in a panel that closes on the pick', async () => {
      const messages = () => {
        const { ariaSelectedDateAnnouncement, ariaSelectedRangeAnnouncement } = Calendar.getInstance(document.querySelector('.date-picker-popup .date-picker-calendar'))._config
        return [ariaSelectedDateAnnouncement, ariaSelectedRangeAnnouncement]
      }

      buildPicker({ calendarDate: new Date(2026, 7, 1), calendars: 1, locale: 'en-US' }).show()
      expect(messages()).toEqual(['Selected date: {date}', 'Selected range: {start} to {end}'])

      document.querySelector(`.date-picker-popup [data-coreui-date="${new Date(2026, 7, 20).toDateString()}"]`).click()
      await Promise.resolve()
      expect(messages()).toEqual(['', ''])

      buildPicker({ calendarDate: new Date(2026, 7, 1), calendars: 1, locale: 'en-US' }, '<div id="picker"><template data-coreui-template="footer"><button type="button" data-coreui-picker-action="close">OK</button></template></div>').show()
      document.querySelector(`.date-picker-popup [data-coreui-date="${new Date(2026, 7, 20).toDateString()}"]`).click()
      await Promise.resolve()
      expect(messages()).toEqual(['Selected date: {date}', 'Selected range: {start} to {end}'])

      buildPicker({
        calendarDate: new Date(2026, 7, 1), calendars: 1, locale: 'en-US', pickerIcon: false
      }).show()
      document.querySelector(`.date-picker-popup [data-coreui-date="${new Date(2026, 7, 20).toDateString()}"]`).click()
      await Promise.resolve()
      expect(messages()).toEqual(['Selected date: {date}', 'Selected range: {start} to {end}'])
    })

    it('should announce a new start that keeps the end, since the panel stays open', () => {
      const picker = buildPicker({
        calendarDate: new Date(2026, 7, 1), calendars: 1, endDate: new Date(2026, 7, 23), locale: 'en-US', startDate: new Date(2026, 7, 20)
      })

      picker.show()
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
      document.querySelector(`.date-picker-popup [data-coreui-date="${new Date(2026, 7, 18).toDateString()}"]`).click()
      vi.advanceTimersByTime(110)

      expect(picker._popup.isShown).toBeTrue()
      expect([...document.querySelectorAll('.date-picker-popup > [data-coreui-live-announcer] > [aria-live="polite"] > *')].map(message => message.textContent)).toContain(
        'Selected range: Tuesday, August 18, 2026 to Sunday, August 23, 2026'
      )
    })

    it('should announce the range a panel that stays open completes', () => {
      const picker = buildPicker({ calendarDate: new Date(2026, 7, 1), calendars: 1, locale: 'en-US' }, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="close">OK</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
      document.querySelector(`.date-picker-popup [data-coreui-date="${new Date(2026, 7, 20).toDateString()}"]`).click()
      document.querySelector(`.date-picker-popup [data-coreui-date="${new Date(2026, 7, 23).toDateString()}"]`).click()
      vi.advanceTimersByTime(110)

      expect([...document.querySelectorAll('.date-picker-popup > [data-coreui-live-announcer] > [aria-live="polite"] > *')].map(message => message.textContent)).toContain(
        'Selected range: Thursday, August 20, 2026 to Sunday, August 23, 2026'
      )
    })
  })

  describe('show/hide', () => {
    it('should toggle on indicator click and fire lifecycle events', async () => {
      const picker = buildPicker()
      const el = fixtureEl.querySelector('#picker')
      const calls = []
      for (const name of ['show', 'shown', 'hide', 'hidden']) {
        el.addEventListener(`${name}.coreui.date-range-picker`, () => calls.push(name))
      }

      const next = name => new Promise(resolve => {
        el.addEventListener(`${name}.coreui.date-range-picker`, resolve, { once: true })
      })

      const shown = next('shown')
      el.querySelector('.form-control-action').click()
      expect(el.classList.contains('show')).toBeTrue()
      expect(el.querySelector('.form-control-action').getAttribute('aria-expanded')).toEqual('true')
      expect(el.querySelector('.form-control-action').getAttribute('aria-controls')).toEqual(picker._menu.id)
      expect(calls).toEqual(['show'])
      await shown

      const hidden = next('hidden')
      el.querySelector('.form-control-action').click()
      expect(el.classList.contains('show')).toBeFalse()
      expect(el.querySelector('.form-control-action').getAttribute('aria-expanded')).toEqual('false')
      expect(calls).toEqual(['show', 'shown', 'hide'])
      await hidden

      expect(calls).toEqual(['show', 'shown', 'hide', 'hidden'])
      expect(picker._popup.isShown).toBeFalse()
    })

    it('should not open when show is prevented', async () => {
      const picker = buildPicker()
      const el = fixtureEl.querySelector('#picker')
      const shown = jasmine.createSpy('shown')
      el.addEventListener('show.coreui.date-range-picker', event => event.preventDefault())
      el.addEventListener('shown.coreui.date-range-picker', shown)

      picker.show()
      await new Promise(resolve => {
        setTimeout(resolve, 50)
      })

      expect(picker._popup.isShown).toBeFalse()
      expect(el.classList.contains('show')).toBeFalse()
      expect(shown).not.toHaveBeenCalled()
    })

    it('should stay open when hide is prevented', async () => {
      const picker = buildPicker()
      const el = fixtureEl.querySelector('#picker')
      const hidden = jasmine.createSpy('hidden')
      el.addEventListener('hide.coreui.date-range-picker', event => event.preventDefault())
      el.addEventListener('hidden.coreui.date-range-picker', hidden)

      picker.show()
      picker.hide()
      await new Promise(resolve => {
        setTimeout(resolve, 50)
      })

      expect(picker._popup.isShown).toBeTrue()
      expect(el.classList.contains('show')).toBeTrue()
      expect(hidden).not.toHaveBeenCalled()
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

  describe('picker toggle', () => {
    it('should not render the toggle when pickerIcon is off', () => {
      buildPicker({ startDate: new Date(2026, 5, 1), pickerIcon: false })

      expect(fixtureEl.querySelector('.form-control-action')).toBeNull()
    })

    it('should open and close without a toggle', () => {
      const picker = buildPicker({ startDate: new Date(2026, 5, 1), pickerIcon: false })

      picker.show()

      expect(picker._popup.isShown).toBeTrue()

      picker.hide()

      expect(picker._popup.isShown).toBeFalse()
      expect(fixtureEl.querySelector('.form-control-action')).toBeNull()
    })

    it('should name the toggle after what it opens', () => {
      buildPicker({ startDate: new Date(2026, 5, 1) })

      expect(fixtureEl.querySelector('.form-control-action').getAttribute('aria-label')).toEqual('Toggle calendar')
    })

    it('should make the picker a group the page can name, and take the role back on dispose', () => {
      const picker = buildPicker({}, '<span id="period-label">Reporting period</span><div id="picker" aria-labelledby="period-label"></div>')
      const element = fixtureEl.querySelector('#picker')

      expect(element.getAttribute('role')).toEqual('group')
      expect(element.querySelector('.form-date-range').getAttribute('role')).toEqual('none')
      expect(element.querySelector('.form-date-range').hasAttribute('aria-labelledby')).toBeFalse()

      picker.dispose()

      expect(element.hasAttribute('role')).toBeFalse()
    })

    it('should keep a role the page wrote on the picker', () => {
      buildPicker({}, '<div id="picker" role="region" aria-label="Reporting period"></div>')

      expect(fixtureEl.querySelector('#picker').getAttribute('role')).toEqual('region')
    })

    it('should move the aria-describedby of the picker to both fields and give it back on dispose', () => {
      const picker = buildPicker({}, '<div id="picker" aria-describedby="period-help"></div>')
      const element = fixtureEl.querySelector('#picker')

      for (const field of element.querySelectorAll('.form-date-time')) {
        expect(field.getAttribute('aria-describedby')).toEqual('period-help')
      }

      expect(element.hasAttribute('aria-describedby')).toBeFalse()

      picker.dispose()

      expect(element.getAttribute('aria-describedby')).toEqual('period-help')
    })
  })

  describe('panel', () => {
    it('should name the panel by ariaPopupLabel', () => {
      expect(buildPicker()._menu.getAttribute('aria-label')).toEqual('Calendar')
      expect(buildPicker({ ariaPopupLabel: 'Your stay' })._menu.getAttribute('aria-label')).toEqual('Your stay')
    })
  })

  describe('cleaner', () => {
    it('should name the cleaner after the value it clears', () => {
      buildPicker({ startDate: new Date(2026, 5, 1), endDate: new Date(2026, 5, 15) })

      expect(fixtureEl.querySelector('.form-control-cleaner').getAttribute('aria-label')).toEqual('Clear date range')
    })

    it('should clear both dates when the cleaner is clicked', () => {
      const picker = buildPicker({ startDate: new Date(2026, 5, 1), endDate: new Date(2026, 5, 15) })

      fixtureEl.querySelector('.form-control-cleaner').click()

      expect(picker.getStartDate()).toBeNull()
      expect(picker.getEndDate()).toBeNull()
    })

    it('should move focus to the start field once the cleaner has cleared the range', () => {
      buildPicker({ startDate: new Date(2026, 5, 1), endDate: new Date(2026, 5, 15) })
      const cleaner = fixtureEl.querySelector('.form-control-cleaner')

      cleaner.focus()
      cleaner.click()

      expect(document.activeElement).toBe(fixtureEl.querySelector('[data-coreui-range-start] .form-date-time-section'))
    })

    it('should not render a cleaner when the option is off', () => {
      buildPicker({ cleaner: false, startDate: new Date(2026, 5, 1) })

      expect(fixtureEl.querySelector('.form-control-cleaner')).toBeNull()
    })
  })

  describe('validation state', () => {
    const sectionStates = () => [...fixtureEl.querySelectorAll('.form-date-time-section')]
      .map(section => [section.getAttribute('aria-invalid'), section.getAttribute('aria-describedby')])

    it('should announce a state class the page writes on the picker element, with the message after it', async () => {
      buildPicker({ locale: 'en-US' }, '<div class="form-field"><div id="picker" class="is-invalid"></div><div class="invalid-feedback">Already booked.</div></div>')
      const { id } = fixtureEl.querySelector('.invalid-feedback')
      const count = fixtureEl.querySelectorAll('.form-date-time-section').length

      expect(count).toBeGreaterThan(0)
      expect(sectionStates()).toEqual(Array.from({ length: count }, () => ['true', id]))

      fixtureEl.querySelector('#picker').classList.remove('is-invalid')
      await Promise.resolve()

      expect(sectionStates()).toEqual(Array.from({ length: count }, () => [null, null]))
    })

    it('should announce an aria-invalid the page writes on the picker element', async () => {
      buildPicker({ locale: 'en-US' }, '<div id="picker" aria-invalid="true"></div>')
      const invalid = () => sectionStates().map(([ariaInvalid]) => ariaInvalid)

      expect(invalid().every(value => value === 'true')).toBeTrue()

      fixtureEl.querySelector('#picker').setAttribute('aria-invalid', 'false')
      await Promise.resolve()

      expect(invalid().every(value => value === null)).toBeTrue()
    })

    it('should describe the sections with the message only while the class that shows it stays', async () => {
      buildPicker({ locale: 'en-US' }, '<div id="picker" aria-invalid="true"></div><div class="invalid-feedback">Already booked.</div>')
      const picker = fixtureEl.querySelector('#picker')
      const feedback = fixtureEl.querySelector('.invalid-feedback')

      expect(sectionStates()).toEqual(Array.from({ length: 6 }, () => ['true', null]))

      picker.classList.add('is-invalid')
      await Promise.resolve()

      expect(sectionStates()).toEqual(Array.from({ length: 6 }, () => ['true', feedback.id]))

      picker.classList.remove('is-invalid')
      await Promise.resolve()

      expect(sectionStates()).toEqual(Array.from({ length: 6 }, () => ['true', null]))
    })

    it('should not draw the range valid while the page marks the picker invalid', async () => {
      buildPicker({
        endDate: new Date(2026, 6, 20), locale: 'en-US', startDate: new Date(2026, 6, 14), valid: true
      }, '<div id="picker" class="is-invalid"></div>')
      const frame = fixtureEl.querySelector('.form-date-range')

      expect(frame).not.toHaveClass('is-valid')

      fixtureEl.querySelector('#picker').classList.remove('is-invalid')
      await Promise.resolve()

      expect(frame).toHaveClass('is-valid')
    })

    it('should keep the fields invalid while the end is before the start after the page drops its class', async () => {
      buildPicker({ endDate: new Date(2026, 6, 14), locale: 'en-US', startDate: new Date(2026, 6, 20) }, '<div id="picker" class="is-invalid"></div>')

      fixtureEl.querySelector('#picker').classList.remove('is-invalid')
      await Promise.resolve()

      expect(sectionStates()).toHaveSize(6)
      expect(sectionStates().every(([ariaInvalid]) => ariaInvalid === 'true')).toBeTrue()
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

    it('should show the range in the calendar when the context sets it again after browsing', () => {
      const picker = buildPicker({ calendars: 1, locale: 'en-US' })

      picker.show()
      picker.getContext().setRange(new Date(2026, 8, 10), new Date(2026, 8, 20))
      fixtureEl.querySelector('.date-picker-popup .btn-next').click()
      fixtureEl.querySelector('.date-picker-popup .btn-next').click()
      picker.getContext().setRange(new Date(2026, 8, 10), new Date(2026, 8, 20))

      expect(fixtureEl.querySelector('.date-picker-popup table').getAttribute('aria-label')).toBe('September 2026')
    })

    it('should show the start date when the context sets both ends of a range', () => {
      const picker = buildPicker({ calendars: 1, locale: 'en-US' })

      picker.show()
      picker.getContext().setRange(new Date(2026, 7, 26), new Date(2026, 8, 25))

      expect(fixtureEl.querySelector('.date-picker-popup table').getAttribute('aria-label')).toBe('August 2026')
    })

    it('should show the initial range in the calendar when the context resets it after browsing', () => {
      const picker = buildPicker({
        calendars: 1,
        endDate: new Date(2026, 8, 20),
        locale: 'en-US',
        startDate: new Date(2026, 8, 10)
      })

      picker.show()
      fixtureEl.querySelector('.date-picker-popup .btn-next').click()
      fixtureEl.querySelector('.date-picker-popup .btn-next').click()
      picker.getContext().reset()

      expect(fixtureEl.querySelector('.date-picker-popup table').getAttribute('aria-label')).toBe('September 2026')
    })

    it('should show the start date over the calendarDate option', () => {
      const picker = buildPicker({ calendarDate: new Date(2026, 6, 1), calendars: 1, locale: 'en-US' })

      picker.show()
      picker.getContext().setRange(new Date(2026, 8, 10), new Date(2026, 8, 20))

      expect(fixtureEl.querySelector('.date-picker-popup table').getAttribute('aria-label')).toBe('September 2026')
    })

    it('should show the end date when the context sets only the end', () => {
      const picker = buildPicker({ calendarDate: new Date(2026, 8, 1), calendars: 1, locale: 'en-US' })

      picker.show()
      picker.getContext().setRange(null, new Date(2027, 0, 15))

      expect(fixtureEl.querySelector('.date-picker-popup table').getAttribute('aria-label')).toBe('January 2027')
    })

    it('should show the end date when the context sets only the end again after browsing', () => {
      const picker = buildPicker({ calendars: 1, locale: 'en-US' })

      picker.show()
      picker.getContext().setRange(null, new Date(2027, 0, 15))
      fixtureEl.querySelector('.date-picker-popup .btn-next').click()
      fixtureEl.querySelector('.date-picker-popup .btn-next').click()
      picker.getContext().setRange(null, new Date(2027, 0, 15))

      expect(fixtureEl.querySelector('.date-picker-popup table').getAttribute('aria-label')).toBe('January 2027')
    })

    it('should show the end date when the context sets a start the picker rejects', () => {
      const picker = buildPicker({ calendars: 1, locale: 'en-US', minDate: new Date(2026, 8, 1) })

      picker.show()
      picker.getContext().setRange(new Date(2026, 7, 26), new Date(2026, 8, 25))
      fixtureEl.querySelector('.date-picker-popup .btn-next').click()
      fixtureEl.querySelector('.date-picker-popup .btn-next').click()
      picker.getContext().setRange(new Date(2026, 7, 26), new Date(2026, 8, 25))

      expect(fixtureEl.querySelector('.date-picker-popup table').getAttribute('aria-label')).toBe('September 2026')
    })

    it('should keep the navigation month and year when the context turns the calendar', () => {
      const picker = buildPicker({ calendarDate: new Date(2026, 8, 1), calendars: 1, locale: 'en-US' })

      picker.show()
      const region = fixtureEl.querySelector('.date-picker-popup .calendar-nav-date')
      picker.getContext().setRange(new Date(2027, 0, 10), new Date(2027, 0, 20))

      expect(fixtureEl.querySelector('.date-picker-popup .calendar-nav-date')).toBe(region)
      expect(region.textContent).toContain('January')
    })

    it('should keep the months view when the context sets a range', () => {
      const picker = buildPicker({ calendarDate: new Date(2026, 8, 1), calendars: 1, locale: 'en-US' })

      picker.show()
      fixtureEl.querySelector('.date-picker-popup .btn-month').click()
      picker.getContext().setRange(new Date(2027, 0, 10), new Date(2027, 0, 20))

      expect(fixtureEl.querySelector('.date-picker-popup table').getAttribute('aria-label')).toBe('2027')
    })

    it('should leave the calendar where it is when the context clears the range', () => {
      const picker = buildPicker({
        calendars: 1,
        endDate: new Date(2026, 8, 20),
        locale: 'en-US',
        startDate: new Date(2026, 8, 10)
      })

      picker.show()
      fixtureEl.querySelector('.date-picker-popup .btn-next').click()
      fixtureEl.querySelector('.date-picker-popup .btn-next').click()
      picker.getContext().clear()

      expect(fixtureEl.querySelector('.date-picker-popup table').getAttribute('aria-label')).toBe('November 2026')
    })
  })

  describe('jQueryInterface', () => {
    it('should create date-range-picker', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')

      jQueryMock.fn.dateRangePicker = DateRangePicker.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.dateRangePicker.call(jQueryMock)

      expect(DateRangePicker.getInstance(el)).not.toBeNull()
      DateRangePicker.getInstance(el).dispose()
    })

    it('should pass the arguments to the method', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')

      jQueryMock.fn.dateRangePicker = DateRangePicker.jQueryInterface
      jQueryMock.elements = [el]

      const instance = DateRangePicker.getOrCreateInstance(el)
      const spy = spyOn(instance, 'setRange')

      jQueryMock.fn.dateRangePicker.call(jQueryMock, 'setRange', new Date(2027, 0, 15), new Date(2027, 0, 20))

      expect(spy).toHaveBeenCalledWith(new Date(2027, 0, 15), new Date(2027, 0, 20))
      instance.dispose()
    })

    it('should not re-create date-range-picker', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')
      const picker = new DateRangePicker(el)

      jQueryMock.fn.dateRangePicker = DateRangePicker.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.dateRangePicker.call(jQueryMock)

      expect(DateRangePicker.getInstance(el)).toEqual(picker)
      picker.dispose()
    })

    it('should call a public method by name', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')
      const picker = new DateRangePicker(el)
      const spy = spyOn(picker, 'show')

      jQueryMock.fn.dateRangePicker = DateRangePicker.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.dateRangePicker.call(jQueryMock, 'show')

      expect(spy).toHaveBeenCalled()
      picker.dispose()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')
      const picker = new DateRangePicker(el)

      jQueryMock.fn.dateRangePicker = DateRangePicker.jQueryInterface
      jQueryMock.elements = [el]

      expect(() => {
        jQueryMock.fn.dateRangePicker.call(jQueryMock, 'undefinedMethod')
      }).toThrowError(TypeError, 'No method named "undefinedMethod"')

      picker.dispose()
    })
  })

  describe('dispose', () => {
    it('should give the host back the way the page wrote it', () => {
      fixtureEl.innerHTML = '<div class="form-control-group my-own" id="picker"></div>'
      const element = fixtureEl.querySelector('#picker')
      const instance = new DateRangePicker(fixtureEl.querySelector('#picker'))

      instance.show()
      instance.dispose()

      expect(element.outerHTML).toEqual('<div class="form-control-group my-own" id="picker"></div>')
    })

    it('should not leave a class attribute on a host that had none', () => {
      fixtureEl.innerHTML = '<div id="picker"></div>'
      const element = fixtureEl.querySelector('#picker')
      const instance = new DateRangePicker(fixtureEl.querySelector('#picker'))

      instance.dispose()

      expect(element.outerHTML).toEqual('<div id="picker"></div>')
    })

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

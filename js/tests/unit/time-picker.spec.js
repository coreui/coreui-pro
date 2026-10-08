import TimePicker from '../../src/time-picker.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

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
    it('should point aria-controls at the panel only while it exists', () => {
      const picker = buildPicker()
      const indicator = fixtureEl.querySelector('.form-control-action')

      expect(indicator.hasAttribute('aria-controls')).toBeFalse()

      picker.show()

      expect(indicator.getAttribute('aria-controls')).toEqual(picker._menu.id)

      picker.hide()

      expect(indicator.hasAttribute('aria-controls')).toBeFalse()
    })

    it('should name the popup the indicator controls', () => {
      const picker = buildPicker()
      const indicator = fixtureEl.querySelector('.form-control-action')

      picker.show()

      expect(indicator.getAttribute('aria-controls')).toMatch(/^time-picker-popup-\d+$/)
      expect(document.getElementById(indicator.getAttribute('aria-controls'))).toEqual(document.querySelector('.time-picker-popup'))
    })

    it('should announce the popup on the indicator from the start', () => {
      buildPicker()
      const indicator = fixtureEl.querySelector('.form-control-action')

      expect(indicator.getAttribute('aria-haspopup')).toEqual('dialog')
      expect(indicator.getAttribute('aria-expanded')).toEqual('false')
    })

    it('should compose a section field and an indicator with an inline SVG icon', () => {
      buildPicker()

      const el = fixtureEl.querySelector('#picker')
      expect(el.classList.contains('time-picker')).toBeTrue()
      expect(el.querySelector('.form-control-group .form-date-time')).not.toBeNull()
      expect(el.querySelector('.form-control-action svg')).not.toBeNull()
    })

    it('should not build the selection body until the popup opens', () => {
      const picker = buildPicker()

      expect(picker._selection).toBeNull()
      expect(fixtureEl.querySelector('.time-picker-popup')).toBeNull()
      expect(fixtureEl.querySelector('.time-picker-col')).toBeNull()

      picker.show()

      expect(picker._selection).not.toBeNull()
      expect(fixtureEl.querySelector('.time-picker-popup').querySelectorAll('.time-picker-col').length).toBeGreaterThan(0)
    })

    it('should initialize the field with the configured time', () => {
      const picker = buildPicker({ time: new Date(2026, 0, 1, 14, 30) })

      expect(picker.getTime().getHours()).toEqual(14)
      expect(picker.getTime().getMinutes()).toEqual(30)
    })
  })

  describe('form payload', () => {
    it('should not submit a floating-label picker the page did not name', () => {
      buildPicker({ floatingLabel: 'Pick a time', time: '10:30:00' }, '<form id="form"><div id="picker"></div></form>')

      expect([...new FormData(fixtureEl.querySelector('#form')).keys()]).toEqual([])
    })

    it('should submit under the configured name', () => {
      buildPicker({ floatingLabel: 'Pick a time', name: 'at', time: '10:30:00' }, '<form id="form"><div id="picker"></div></form>')

      expect([...new FormData(fixtureEl.querySelector('#form')).entries()])
        .toEqual([['at', '10:30:00 AM']])
    })

    it('should return to its initial time and drop the submit verdict on a native form reset', async () => {
      const picker = buildPicker({ name: 'at', time: '10:30:00' }, '<form id="form" data-coreui-validate="valid"><div id="picker"></div></form>')
      const form = fixtureEl.querySelector('#form')
      const field = fixtureEl.querySelector('.form-date-time')

      form.addEventListener('submit', event => event.preventDefault())
      form.requestSubmit()
      picker.setTime('11:45:00')

      expect(field.classList.contains('is-valid')).toBeTrue()

      form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect([...new FormData(form).entries()]).toEqual([['at', '10:30:00 AM']])
      expect(field.classList.contains('is-valid')).toBeFalse()
    })
  })

  describe('field-to-panel sync', () => {
    it('should reflect a time entered in the field in the selection body', () => {
      const picker = buildPicker({ locale: 'en-GB', time: '10:15:00' })
      picker.show()
      picker.hide()

      picker._input.setConfig({ date: '14:30:00' })

      picker.show()

      const popup = fixtureEl.querySelector('.time-picker-popup')
      const hour = popup.querySelector('[data-coreui-hours][aria-selected="true"]')
      expect(hour.dataset.coreuiHours).toEqual('14')
    })
  })

  describe('variants', () => {
    it('should render roll columns by default', () => {
      const picker = buildPicker()
      picker.show()

      const popup = fixtureEl.querySelector('.time-picker-popup')
      expect(popup.querySelector('.time-picker-body')).not.toBeNull()
      expect(popup.querySelector('select')).toBeNull()
    })

    it('should give the roll the hour cycle of the field', () => {
      for (const locale of ['ko-KR', 'en-CA']) {
        const picker = buildPicker({ locale })
        picker.show()

        const columns = fixtureEl.querySelectorAll('.time-picker-body .time-picker-col')
        expect(columns[0].querySelectorAll('.time-picker-cell').length).toEqual(12)
        expect(columns.length).toEqual(4)
        picker.dispose()
      }
    })

    it('should mark the hour in the cycle the field uses', () => {
      const picker = buildPicker({ locale: 'en-US', inputOptions: { format: 'HH:mm' }, time: '14:30:00' })
      picker.show()

      expect(fixtureEl.querySelector('.time-picker-popup [data-coreui-hours][aria-selected="true"]').dataset.coreuiHours).toEqual('14')
    })

    it('should carry a global picker default to the roll', () => {
      const { seconds } = TimePicker.Default
      TimePicker.Default.seconds = false

      try {
        const picker = buildPicker({ locale: 'en-GB' })
        picker.show()

        expect(fixtureEl.querySelectorAll('.time-picker-body .time-picker-col').length).toEqual(2)
      } finally {
        TimePicker.Default.seconds = seconds
      }
    })

    it('should fall back to the section labels the page set on the picker when the option is empty', () => {
      TimePicker.Default.ariaHourLabel = 'Godzina'

      try {
        buildPicker({ ariaHourLabel: '', locale: 'en-GB' })

        expect(fixtureEl.querySelector('[data-coreui-section="hour"]').getAttribute('aria-label')).toEqual('Godzina')
      } finally {
        delete TimePicker.Default.ariaHourLabel
      }
    })

    it('should ignore a variant passed through the config', () => {
      const picker = buildPicker({ variant: 'select' })
      picker.show()

      const popup = fixtureEl.querySelector('.time-picker-popup')
      expect(popup.querySelector('select')).toBeNull()
      expect(popup.querySelectorAll('.time-picker-col').length).toBeGreaterThan(0)
    })

    it('should keep the roll to a single tab stop and move between columns with the arrows', () => {
      const picker = buildPicker()
      picker.show()

      const body = fixtureEl.querySelector('.time-picker-body')
      expect(body.querySelectorAll('.time-picker-cell').length).toBeGreaterThan(4)
      expect(body.querySelectorAll('[tabindex="0"]').length).toEqual(1)

      const first = body.querySelector('.time-picker-col .time-picker-cell')
      first.focus()
      first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))

      const columns = [...body.querySelectorAll('.time-picker-col')]
      expect(columns.indexOf(document.activeElement.closest('.time-picker-col'))).toEqual(1)
      expect(body.querySelectorAll('[tabindex="0"]').length).toEqual(1)
    })

    it('should stop at the last column', () => {
      const picker = buildPicker()
      picker.show()

      const body = fixtureEl.querySelector('.time-picker-body')
      const columns = [...body.querySelectorAll('.time-picker-col')]
      const last = columns[columns.length - 1].querySelector('.time-picker-cell')
      last.focus()
      last.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))

      expect(document.activeElement.closest('.time-picker-col')).toEqual(columns[columns.length - 1])
    })

    it('should drop the seconds column when seconds are disabled', () => {
      const picker = buildPicker({ seconds: false })
      picker.show()

      const popup = fixtureEl.querySelector('.time-picker-popup')
      expect(popup.querySelector('[role="listbox"]')).not.toBeNull()
      expect(popup.querySelector('[role="listbox"][aria-label="Select seconds"]')).toBeNull()
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
      const minutes = fixtureEl.querySelector('.time-picker-popup').querySelectorAll('[data-coreui-minutes]')
      minutes[15].click()

      expect(emitted).not.toBeNull()
      expect(picker.getTime().getMinutes()).toEqual(15)
    })

    const listen = () => {
      const emitted = []
      fixtureEl.querySelector('#picker').addEventListener('timeChange.coreui.time-picker', event => {
        emitted.push(event.time)
      })
      return emitted
    }

    const cell = (type, value) => fixtureEl.querySelector(`.time-picker-popup [data-coreui-${type}="${value}"]`)

    it('should read hours as 0 to 23 and take the day period from an hour only one period allows', () => {
      const picker = buildPicker({ locale: 'en-US', hours: [8, 9, 10, 11, 12, 13, 14, 15, 16], seconds: false })
      picker.show()

      cell('hours', '1').click()

      expect(picker.getTime().getHours()).toEqual(13)
      expect(cell('meridiem', 'pm').classList.contains('selected')).toBeTrue()
      expect(cell('meridiem', 'am').getAttribute('aria-disabled')).toEqual('true')

      cell('meridiem', 'am').click()

      expect(picker.getTime().getHours()).toEqual(13)

      cell('hours', '9').click()

      expect(picker.getTime().getHours()).toEqual(9)
      expect(cell('meridiem', 'pm').getAttribute('aria-disabled')).toEqual('true')
    })

    it('should leave the day period to the user for an hour both periods allow', () => {
      const picker = buildPicker({ locale: 'en-US', seconds: false })
      picker.show()

      cell('meridiem', 'pm').click()
      cell('hours', '3').click()

      expect(picker.getTime().getHours()).toEqual(15)
      expect(cell('meridiem', 'am').getAttribute('aria-disabled')).toEqual('false')
    })

    it('should offer no morning when every listed hour is in the afternoon', () => {
      buildPicker({ locale: 'en-US', hours: [13, 14, 15, 16, 17] }).show()

      expect(cell('meridiem', 'am').getAttribute('aria-disabled')).toEqual('true')
      expect(cell('meridiem', 'am').getAttribute('aria-selected')).not.toEqual('true')
      expect(cell('meridiem', 'pm').getAttribute('aria-disabled')).toEqual('false')
    })

    it('should ignore Enter and Space on a disabled cell', () => {
      const picker = buildPicker({
        locale: 'en-US', hours: [13, 14, 15], seconds: false, time: '13:00'
      })
      picker.show()

      for (const init of [{ key: 'Enter' }, { key: ' ', code: 'Space' }]) {
        cell('meridiem', 'am').dispatchEvent(new KeyboardEvent('keydown', { ...init, bubbles: true, cancelable: true }))
      }

      expect(picker.getTime().getHours()).toEqual(13)
    })

    it('should keep both periods for a time the list does not hold', () => {
      buildPicker({ locale: 'en-US', hours: [8, 9, 10, 11, 12, 13, 14, 15, 16], time: '20:00' }).show()

      expect(cell('meridiem', 'pm').getAttribute('aria-disabled')).toEqual('false')
      expect(cell('meridiem', 'am').getAttribute('aria-disabled')).toEqual('false')
    })

    it('should pick an hour listed twice as that hour', () => {
      const picker = buildPicker({ locale: 'en-US', hours: [8, 9, 10, 11, 12, 12, 13], seconds: false })
      picker.show()

      cell('hours', '12').click()

      expect(picker.getTime().getHours()).toEqual(12)
    })

    it('should land on a listed hour when the day period is picked before the hour', () => {
      const morning = buildPicker({ locale: 'en-US', hours: [8, 9, 10, 11, 12, 13, 14, 15, 16], seconds: false })
      morning.show()
      cell('meridiem', 'am').click()

      expect(morning.getTime().getHours()).toEqual(8)

      const afternoon = buildPicker({ locale: 'en-US', hours: [13, 14, 15, 16, 17], seconds: false })
      afternoon.show()
      cell('meridiem', 'pm').click()

      expect(afternoon.getTime().getHours()).toEqual(13)
    })

    it('should keep the 12-hour clock a format pins on a 24-hour locale', () => {
      buildPicker({ locale: 'en-GB', format: 'hh:mm a' }).show()

      expect(cell('meridiem', 'pm')).not.toBeNull()
      expect(cell('hours', '13')).toBeNull()
    })

    it('should name the day periods of the column the way the field does', () => {
      const picker = buildPicker({ locale: 'ko', time: '09:15' })
      picker.show()

      expect(cell('meridiem', 'am').textContent).toEqual('오전')
      expect(cell('meridiem', 'pm').textContent).toEqual('오후')
      expect(fixtureEl.querySelector('[data-coreui-section="meridiem"]').textContent).toEqual('오전')
    })

    it('should emit timeChange once per change, carrying what getTime returns', () => {
      const picker = buildPicker({ time: '09:15', seconds: false })
      const emitted = listen()

      picker.setTime(new Date(2026, 0, 1, 18, 30, 45))
      expect(emitted.length).toEqual(1)
      expect(emitted[0]).toEqual(picker.getTime())
      expect(emitted[0].getSeconds()).toEqual(0)

      picker.reset()
      expect(emitted.length).toEqual(2)
      expect(emitted[1]).toBeInstanceOf(Date)
      expect(emitted[1]).toEqual(picker.getTime())

      picker.show()
      cell('minutes', 40).click()
      expect(emitted.length).toEqual(3)
      expect(emitted[2]).toEqual(picker.getTime())

      picker.getContext().now()
      expect(emitted.length).toEqual(4)
      expect(emitted[3]).toEqual(picker.getTime())
      expect(emitted[3].getSeconds()).toEqual(0)
    })

    it('should stay silent when the value does not change', () => {
      const picker = buildPicker({ time: '09:15', seconds: false })
      const emitted = listen()

      picker.setTime(new Date(1970, 0, 1, 9, 15, 59))
      picker.show()
      cell('minutes', 15).click()

      expect(emitted.length).toEqual(0)
    })

    it('should report null when the field refuses a panel pick, and let the next pick build on the panel', () => {
      const picker = buildPicker({ time: '09:15', seconds: false, inputOptions: { maxDate: '12:00' } })
      const emitted = listen()

      picker.show()
      cell('meridiem', 'pm').click()

      expect(picker.getTime()).toBeNull()
      expect(emitted).toEqual([null])

      cell('meridiem', 'am').click()

      expect(picker.getTime()).toEqual(new Date(1970, 0, 1, 9, 15))
    })

    it('should empty the panel when a refused pick is cleared', () => {
      const picker = buildPicker({ time: '09:15', seconds: false, inputOptions: { maxDate: '12:00' } })

      picker.show()
      cell('meridiem', 'pm').click()
      picker.clear()

      expect(fixtureEl.querySelector('.time-picker-popup [data-coreui-hours].selected')).toBeNull()
    })

    it('should leave the open panel alone when setTime keeps the value', () => {
      const picker = buildPicker({ time: '10:20', seconds: false })

      picker.show()
      const minute = cell('minutes', 20)
      minute.focus()
      picker.setTime(picker.getTime())

      expect(document.activeElement).toBe(minute)
    })

    it('should keep working after setTime throws on a bad argument', () => {
      const picker = buildPicker({ time: '10:00', seconds: false })

      expect(() => picker.setTime(undefined)).toThrowError(TypeError)
      picker.setTime(new Date(1970, 0, 1, 11, 30))

      expect(picker.getTime()).toEqual(new Date(1970, 0, 1, 11, 30))

      const emitted = listen()
      picker._input.setConfig({ date: '14:45' })

      expect(emitted.length).toEqual(1)
    })

    it('should let an errorChange listener clear the field it refused', () => {
      const picker = buildPicker({ time: '10:00', seconds: false, inputOptions: { maxDate: '12:00' } })
      fixtureEl.querySelector('#picker').addEventListener('errorChange.coreui.time-input', event => {
        if (event.error === 'maxDate') {
          picker.clear()
        }
      })

      picker.setTime(new Date(1970, 0, 1, 14, 0))

      expect(picker.getTime()).toBeNull()
      expect(fixtureEl.querySelector('#picker .is-invalid')).toBeNull()
    })

    it('should keep focus in the field when it is cleared', () => {
      const picker = buildPicker({ time: '10:20', seconds: false })
      const section = fixtureEl.querySelector('#picker [data-coreui-section="minute"]')

      section.focus()
      picker.clear()

      expect(document.activeElement).toBe(section)
    })

    it('should keep the panel on the value a timeChange listener sets', () => {
      const picker = buildPicker({ time: '10:00', seconds: false })
      fixtureEl.querySelector('#picker').addEventListener('timeChange.coreui.time-picker', event => {
        if (event.time && event.time.getMinutes() % 15) {
          picker.setTime(new Date(1970, 0, 1, event.time.getHours(), event.time.getMinutes() - (event.time.getMinutes() % 15)))
        }
      })

      picker.show()
      cell('minutes', 7).click()

      expect(picker.getTime().getMinutes()).toEqual(0)
      expect(fixtureEl.querySelector('.time-picker-popup [data-coreui-minutes].selected').dataset.coreuiMinutes).toEqual('0')
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
    it('should name the panel by ariaPopupLabel', () => {
      expect(buildPicker()._menu.getAttribute('aria-label')).toEqual('Time selection')
      expect(buildPicker({ ariaPopupLabel: 'Departure time' })._menu.getAttribute('aria-label')).toEqual('Departure time')
    })

    it('should not open when disabled', () => {
      const picker = buildPicker({ disabled: true })

      picker.show()

      expect(picker._popup.isShown).toBeFalse()
    })

    it('should apply the size class', () => {
      buildPicker({ size: 'lg' })

      const el = fixtureEl.querySelector('#picker')
      expect(el.classList.contains('form-control-group')).toBeTrue()
      expect(el.classList.contains('form-control-lg')).toBeTrue()
    })

    it('should skip sanitizing when sanitize is false', () => {
      buildPicker({ pickerIcon: '<svg xmlns="http://www.w3.org/2000/svg"><circle r="3" /></svg>', sanitize: false })

      expect(fixtureEl.querySelector('.form-control-action circle')).not.toBeNull()
    })

    it('should keep an icon element outside the allow list when sanitize is false', () => {
      buildPicker({ pickerIcon: '<svg xmlns="http://www.w3.org/2000/svg"><custom-mark></custom-mark></svg>', sanitize: false })

      expect(fixtureEl.querySelector('.form-control-action custom-mark')).not.toBeNull()
    })

    it('should render a projected footer in the time picker footer', () => {
      const picker = buildPicker({}, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="clear">Clear</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()

      expect(document.querySelector('.time-picker-popup > .time-picker-footer [data-coreui-picker-action="clear"]')).not.toBeNull()
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

  describe('show/hide', () => {
    it('should toggle on indicator click and fire lifecycle events', async () => {
      const picker = buildPicker()
      const el = fixtureEl.querySelector('#picker')
      const calls = []
      for (const name of ['show', 'shown', 'hide', 'hidden']) {
        el.addEventListener(`${name}.coreui.time-picker`, () => calls.push(name))
      }

      const next = name => new Promise(resolve => {
        el.addEventListener(`${name}.coreui.time-picker`, resolve, { once: true })
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
      el.addEventListener('show.coreui.time-picker', event => event.preventDefault())
      el.addEventListener('shown.coreui.time-picker', shown)

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
      el.addEventListener('hide.coreui.time-picker', event => event.preventDefault())
      el.addEventListener('hidden.coreui.time-picker', hidden)

      picker.show()
      picker.hide()
      await new Promise(resolve => {
        setTimeout(resolve, 50)
      })

      expect(picker._popup.isShown).toBeTrue()
      expect(el.classList.contains('show')).toBeTrue()
      expect(hidden).not.toHaveBeenCalled()
    })
  })

  describe('picker toggle', () => {
    it('should not render the toggle when pickerIcon is off', () => {
      buildPicker({ time: new Date(2026, 0, 1, 14, 30), pickerIcon: false })

      expect(fixtureEl.querySelector('.form-control-action')).toBeNull()
    })

    it('should open and close without a toggle', () => {
      const picker = buildPicker({ time: new Date(2026, 0, 1, 14, 30), pickerIcon: false })

      picker.show()

      expect(picker._popup.isShown).toBeTrue()

      picker.hide()

      expect(picker._popup.isShown).toBeFalse()
      expect(fixtureEl.querySelector('.form-control-action')).toBeNull()
    })

    it('should name the toggle after what it opens', () => {
      buildPicker({ time: new Date(2026, 0, 1, 14, 30) })

      expect(fixtureEl.querySelector('.form-control-action').getAttribute('aria-label')).toEqual('Toggle time selection')
    })

    it('should pass the aria-labelledby of the picker to its field', () => {
      buildPicker({}, '<span id="opening-label">Opening time</span><div id="picker" aria-labelledby="opening-label"></div>')

      expect(fixtureEl.querySelector('.form-date-time').getAttribute('aria-labelledby')).toEqual('opening-label')
    })

    it('should move focus to the first empty section of its field when a label of the picker is clicked', () => {
      buildPicker({}, '<label for="picker">Opening</label><span id="opening-label" class="form-label">Opening time</span><div id="picker" aria-labelledby="opening-label"></div>')
      const firstSection = fixtureEl.querySelector('.form-date-time-section')

      for (const label of fixtureEl.querySelectorAll('.form-label, label')) {
        document.activeElement.blur()
        label.click()

        expect(document.activeElement).toEqual(firstSection)
      }
    })

    it('should move the aria-labelledby of the picker to its field over a floating label', () => {
      buildPicker({ floatingLabel: 'Pick a time' }, '<div id="picker" aria-labelledby="opening-label"></div>')
      const field = fixtureEl.querySelector('.form-date-time')

      expect(field.getAttribute('aria-labelledby')).toEqual('opening-label')
      expect(field.getAttribute('aria-label')).toEqual('Pick a time')
    })

    it('should move the aria-label and aria-describedby of the picker to its field', () => {
      buildPicker({}, '<div id="picker" aria-label="Opening time" aria-describedby="opening-help"></div>')
      const field = fixtureEl.querySelector('.form-date-time')

      expect(field.getAttribute('aria-label')).toEqual('Opening time')
      expect(field.getAttribute('aria-describedby')).toEqual('opening-help')
      expect(fixtureEl.querySelector('#picker').hasAttribute('aria-describedby')).toBeFalse()
    })
  })

  describe('cleaner', () => {
    it('should name the cleaner after the value it clears', () => {
      buildPicker({ time: new Date(2026, 0, 1, 14, 30) })

      expect(fixtureEl.querySelector('.form-control-cleaner').getAttribute('aria-label')).toEqual('Clear time')
    })

    it('should clear the value when the cleaner is clicked', () => {
      const picker = buildPicker({ time: new Date(2026, 0, 1, 14, 30) })

      fixtureEl.querySelector('.form-control-cleaner').click()

      expect(picker.getTime()).toBeNull()
    })

    it('should not render a cleaner when the option is off', () => {
      buildPicker({ cleaner: false, time: new Date(2026, 0, 1, 14, 30) })

      expect(fixtureEl.querySelector('.form-control-cleaner')).toBeNull()
    })
  })

  describe('validation state', () => {
    const sectionStates = () => [...fixtureEl.querySelectorAll('.form-date-time-section')]
      .map(section => [section.getAttribute('aria-invalid'), section.getAttribute('aria-describedby')])

    it('should take a state class the markup carries on the picker element as the given state, with the message after it, and block with it', () => {
      buildPicker({ time: '10:30:00' }, '<form><div id="picker" class="is-invalid"></div><div class="invalid-feedback">Already booked.</div></form>')
      const { id } = fixtureEl.querySelector('.invalid-feedback')
      const count = fixtureEl.querySelectorAll('.form-date-time-section').length

      expect(count).toBeGreaterThan(0)
      expect(sectionStates()).toEqual(Array.from({ length: count }, () => ['true', id]))
      expect(fixtureEl.querySelector('form').checkValidity()).toBeFalse()
    })

    it('should take no state from a class or an aria-invalid the page writes on the picker element', async () => {
      buildPicker({}, '<div id="picker" aria-invalid="true"></div>')

      fixtureEl.querySelector('#picker').classList.add('is-invalid')
      await Promise.resolve()

      expect(sectionStates().every(([ariaInvalid]) => ariaInvalid === null)).toBeTrue()
    })

    it('should change the state through setConfig', () => {
      const picker = buildPicker({ time: '10:30:00' }, '<form><div id="picker"></div></form>')

      picker.setConfig({ validationState: 'invalid' })

      expect(fixtureEl.querySelector('form').checkValidity()).toBeFalse()

      picker.setConfig({ validationState: null })

      expect(fixtureEl.querySelector('form').checkValidity()).toBeTrue()
    })

    it('should drop the given state when the user types in the field, and through a native form reset', async () => {
      buildPicker({ time: '10:30:00' }, '<form><div id="picker" class="is-invalid"></div><div id="second" data-coreui-validation-state="invalid"></div></form>')
      const form = fixtureEl.querySelector('form')
      const [hour] = fixtureEl.querySelectorAll('#picker .form-date-time-section')

      hour.focus()
      hour.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))

      expect(fixtureEl.querySelector('#picker').classList.contains('is-invalid')).toBeFalse()
      expect([...fixtureEl.querySelectorAll('#picker .form-date-time-section')].every(section => !section.hasAttribute('aria-invalid'))).toBeTrue()

      pickers.push(new TimePicker(fixtureEl.querySelector('#second'), { locale: 'en-US', time: '10:30:00' }))

      expect(form.checkValidity()).toBeFalse()

      form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(form.checkValidity()).toBeTrue()
    })

    it.each([
      ['picks a time', picker => {
        picker.show()
        fixtureEl.querySelector('.time-picker-popup').querySelectorAll('[data-coreui-minutes]')[15].click()
      }],
      ['clears the field with the cleaner', () => {
        fixtureEl.querySelector('.form-control-cleaner').click()
      }]
    ])('should drop the given state when the user %s, and keep it through changes made by code', (_, act) => {
      const picker = buildPicker({ time: '10:30:00' }, '<form><div id="picker" class="is-invalid"></div></form>')
      const form = fixtureEl.querySelector('form')

      picker.setTime('11:45:00')
      picker.clear()
      picker.reset()

      expect(form.checkValidity()).toBeFalse()

      act(picker)

      expect(form.checkValidity()).toBeTrue()
      expect(sectionStates().every(([ariaInvalid]) => ariaInvalid === null)).toBeTrue()
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
      const picker = buildPicker({ maxDate: new Date(1969, 11, 31) }, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="now">Now</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()

      expect(fixtureEl.querySelector('.time-picker-popup [data-coreui-picker-action="now"]').disabled).toBeTrue()
    })

    it('should keep a projected now action enabled when the current time is selectable', () => {
      const picker = buildPicker({}, [
        '<div id="picker">',
        '  <template data-coreui-template="footer">',
        '    <button type="button" data-coreui-picker-action="now">Now</button>',
        '  </template>',
        '</div>'
      ].join(''))

      picker.show()

      expect(fixtureEl.querySelector('.time-picker-popup [data-coreui-picker-action="now"]').disabled).toBeFalse()
    })
  })

  describe('roll keyboard navigation', () => {
    const openRoll = () => {
      const picker = buildPicker({ seconds: false })
      picker.show()
      return fixtureEl.querySelector('.time-picker-body')
    }

    const cellsOf = column => Array.from(column.querySelectorAll('.time-picker-cell'))

    it('should move down and up within a column', () => {
      const roll = openRoll()
      const [hours] = roll.querySelectorAll('.time-picker-col')
      const cells = cellsOf(hours)

      cells[0].focus()
      cells[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      expect(document.activeElement).toEqual(cells[1])

      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
      expect(document.activeElement).toEqual(cells[0])
    })

    it('should jump to the first and the last option', () => {
      const roll = openRoll()
      const [hours] = roll.querySelectorAll('.time-picker-col')
      const cells = cellsOf(hours)

      cells[0].focus()
      cells[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
      expect(document.activeElement).toEqual(cells[cells.length - 1])

      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
      expect(document.activeElement).toEqual(cells[0])
    })

    it('should move between columns', () => {
      const roll = openRoll()
      const [hours, minutes] = roll.querySelectorAll('.time-picker-col')

      cellsOf(hours)[0].focus()
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      expect(minutes.contains(document.activeElement)).toBeTrue()

      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
      expect(hours.contains(document.activeElement)).toBeTrue()
    })

    it('should move between columns by the direction of the roll, not of the document', () => {
      const picker = buildPicker({ seconds: false }, '<div dir="rtl"><div id="picker"></div></div>')
      picker.show()

      const roll = fixtureEl.querySelector('.time-picker-body')
      const [hours, minutes] = roll.querySelectorAll('.time-picker-col')

      cellsOf(hours)[0].focus()
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))

      expect(minutes.contains(document.activeElement)).toBeTrue()
    })

    it('should stay in the first column on ArrowLeft', () => {
      const roll = openRoll()
      const [hours] = roll.querySelectorAll('.time-picker-col')
      const first = cellsOf(hours)[0]

      first.focus()
      first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
      expect(document.activeElement).toEqual(first)
    })
  })

  describe('jQueryInterface', () => {
    it('should create time-picker', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.timePicker.call(jQueryMock)

      expect(TimePicker.getInstance(el)).not.toBeNull()
      TimePicker.getInstance(el).dispose()
    })

    it('should pass the arguments to the method', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [el]

      const instance = TimePicker.getOrCreateInstance(el)
      const spy = spyOn(instance, 'setTime')

      jQueryMock.fn.timePicker.call(jQueryMock, 'setTime', '10:30:00')

      expect(spy).toHaveBeenCalledWith('10:30:00')
      instance.dispose()
    })

    it('should not re-create time-picker', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')
      const picker = new TimePicker(el)

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.timePicker.call(jQueryMock)

      expect(TimePicker.getInstance(el)).toEqual(picker)
      picker.dispose()
    })

    it('should call a public method by name', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')
      const picker = new TimePicker(el)
      const spy = spyOn(picker, 'show')

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.timePicker.call(jQueryMock, 'show')

      expect(spy).toHaveBeenCalled()
      picker.dispose()
    })

    it('should throw error on undefined method', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'
      const el = fixtureEl.querySelector('#host')
      const picker = new TimePicker(el)

      jQueryMock.fn.timePicker = TimePicker.jQueryInterface
      jQueryMock.elements = [el]

      expect(() => {
        jQueryMock.fn.timePicker.call(jQueryMock, 'undefinedMethod')
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
      const instance = new TimePicker(fixtureEl.querySelector('#picker'), { size: 'sm' })

      instance.show()
      instance.dispose()

      expect(element.outerHTML).toEqual('<div class="form-control-group my-own" id="picker"></div>')
    })

    it('should not leave a class attribute on a host that had none', () => {
      fixtureEl.innerHTML = '<div id="picker"></div>'
      const element = fixtureEl.querySelector('#picker')
      const instance = new TimePicker(fixtureEl.querySelector('#picker'), { size: 'sm' })

      instance.dispose()

      expect(element.outerHTML).toEqual('<div id="picker"></div>')
    })

    it('should drop the listeners on the controls it built', () => {
      fixtureEl.innerHTML = '<div id="picker"></div>'
      const picker = new TimePicker(fixtureEl.querySelector('#picker'))
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
      const picker = new TimePicker(el)

      picker.dispose()

      expect(el.children).toHaveLength(0)
      expect(el.classList.contains('form-control-group')).toBe(false)
    })

    it('should build one set of controls when re-initialised on the same element', () => {
      fixtureEl.innerHTML = '<div id="picker"></div>'
      const el = fixtureEl.querySelector('#picker')
      new TimePicker(el) // eslint-disable-line no-new
      pickers.push(new TimePicker(el))

      expect(el.querySelectorAll('.form-date-time')).toHaveLength(1)
      expect(el.querySelectorAll('.form-control-cleaner')).toHaveLength(1)
      expect(el.querySelectorAll('.form-control-action')).toHaveLength(1)
    })
  })

  describe("seconds", () => {
    it("should give the field and the panel a seconds part by default", () => {
      const picker = buildPicker({ locale: "en-US" })
      picker.show()

      expect([...picker._element.querySelectorAll("[data-coreui-section]")].map(section => section.dataset.coreuiSection)).toEqual(["hour", "minute", "second", "meridiem"])
      expect([...document.querySelectorAll("[aria-label^=\"Select\"]")].length).toEqual(4)
    })

    it("should take both away together", () => {
      const picker = buildPicker({ locale: "en-US", seconds: false })
      picker.show()

      expect([...picker._element.querySelectorAll("[data-coreui-section]")].map(section => section.dataset.coreuiSection)).toEqual(["hour", "minute", "meridiem"])
      expect([...document.querySelectorAll("[aria-label^=\"Select\"]")].length).toEqual(3)
    })
  })
})

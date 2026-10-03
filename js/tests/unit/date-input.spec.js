import { vi } from 'vitest'
import DateInput from '../../src/date-input.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('DateInput', () => {
  let fixtureEl

  const createDateInput = (config = {}) => {
    fixtureEl.innerHTML = '<div id="mydateinput"></div>'
    const element = fixtureEl.querySelector('div')
    return new DateInput(element, { format: 'dd.MM.yyyy', ...config })
  }

  const getSections = element => element.querySelectorAll('.form-date-time-section')

  const pressKey = (target, key, init = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', {
      key, bubbles: true, cancelable: true, ...init
    }))
  }

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('form payload', () => {
    it('should not submit a field the page only gave an id', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="date-input" id="start"></div></form>'
      const dateInputEl = fixtureEl.querySelector('.date-input')
      // eslint-disable-next-line no-new
      new DateInput(dateInputEl, { date: new Date(2026, 0, 15), format: 'dd.MM.yyyy' })

      expect([...new FormData(fixtureEl.querySelector('#form')).keys()]).toEqual([])
    })

    it('should submit under the configured name', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="date-input" id="start"></div></form>'
      const dateInputEl = fixtureEl.querySelector('.date-input')
      // eslint-disable-next-line no-new
      new DateInput(dateInputEl, { date: new Date(2026, 0, 15), format: 'dd.MM.yyyy', name: 'from' })

      expect([...new FormData(fixtureEl.querySelector('#form')).entries()])
        .toEqual([['from', '15.01.2026']])
    })

    it('should submit under a name given as a data attribute', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="date-input" id="start" data-coreui-name="from"></div></form>'
      const dateInputEl = fixtureEl.querySelector('.date-input')
      // eslint-disable-next-line no-new
      new DateInput(dateInputEl, { date: new Date(2026, 0, 15), format: 'dd.MM.yyyy' })

      expect([...new FormData(fixtureEl.querySelector('#form')).entries()])
        .toEqual([['from', '15.01.2026']])
    })

    it('should submit under a name given by setConfig', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="date-input" id="start"></div></form>'
      const dateInputEl = fixtureEl.querySelector('.date-input')
      const dateInput = new DateInput(dateInputEl, { date: new Date(2026, 0, 15), format: 'dd.MM.yyyy' })

      dateInput.setConfig({ name: 'later' })

      expect([...new FormData(fixtureEl.querySelector('#form')).entries()])
        .toEqual([['later', '15.01.2026']])
    })

    it('should stop submitting once disposed', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="date-input"></div></form>'
      const dateInputEl = fixtureEl.querySelector('.date-input')
      const dateInput = new DateInput(dateInputEl, { date: new Date(2026, 0, 15), format: 'dd.MM.yyyy', name: 'ghost' })

      dateInput.dispose()

      expect([...new FormData(fixtureEl.querySelector('#form')).keys()]).toEqual([])
    })
  })

  describe('dispose', () => {
    it('should give the host back the way the page wrote it', () => {
      fixtureEl.innerHTML = '<div class="form-control form-date-time my-own" id="start" role="note"></div>'
      const dateInputEl = fixtureEl.querySelector('#start')
      const dateInput = new DateInput(dateInputEl, { date: new Date(2026, 0, 15), format: 'dd.MM.yyyy' })

      dateInput.dispose()

      expect(dateInputEl.outerHTML)
        .toEqual('<div class="form-control form-date-time my-own" id="start" role="note"></div>')
    })

    it('should give back a state class and a label the markup carried', () => {
      fixtureEl.innerHTML = '<div class="form-date-time is-invalid my-own" id="start" aria-label="Start date"></div>'
      const dateInputEl = fixtureEl.querySelector('#start')
      const dateInput = new DateInput(dateInputEl, { date: new Date(2026, 0, 15), format: 'dd.MM.yyyy' })

      dateInput.dispose()

      expect([...dateInputEl.classList].toSorted()).toEqual(['form-date-time', 'is-invalid', 'my-own'])
      expect(dateInputEl.getAttribute('aria-label')).toEqual('Start date')
      expect(dateInputEl.children).toHaveLength(0)
    })

    it('should keep a class put on the host while it lived', () => {
      fixtureEl.innerHTML = '<div id="start"></div>'
      const dateInputEl = fixtureEl.querySelector('#start')
      const dateInput = new DateInput(dateInputEl, { date: new Date(2026, 0, 15), format: 'dd.MM.yyyy' })

      dateInputEl.classList.add('d-none')
      dateInput.dispose()

      expect(dateInputEl.outerHTML).toEqual('<div id="start" class="d-none"></div>')
    })

    it('should not leave a class attribute on a host that had none', () => {
      fixtureEl.innerHTML = '<div id="start"></div>'
      const dateInputEl = fixtureEl.querySelector('#start')
      const dateInput = new DateInput(dateInputEl, { date: new Date(2026, 0, 15), format: 'dd.MM.yyyy' })

      dateInput.dispose()

      expect(dateInputEl.outerHTML).toEqual('<div id="start"></div>')
    })

    it('should put the author\'s own nodes back, not copies of them', () => {
      fixtureEl.innerHTML = '<div id="start"><span id="hint">Pick a date</span></div>'
      const dateInputEl = fixtureEl.querySelector('#start')
      const hint = fixtureEl.querySelector('#hint')
      const dateInput = new DateInput(dateInputEl, { date: new Date(2026, 0, 15), format: 'dd.MM.yyyy' })

      dateInput.dispose()

      expect(fixtureEl.querySelector('#hint')).toBe(hint)
    })

    it('should build the same field again after a dispose', () => {
      fixtureEl.innerHTML = '<div id="start"></div>'
      const dateInputEl = fixtureEl.querySelector('#start')
      const config = { date: new Date(2026, 0, 15), format: 'dd.MM.yyyy', name: 'from' }
      const first = new DateInput(dateInputEl, config)
      const built = dateInputEl.outerHTML

      first.dispose()
      const second = new DateInput(dateInputEl, config)

      expect(dateInputEl.outerHTML).toEqual(built)
      expect(dateInputEl.querySelectorAll('input[type="hidden"]')).toHaveLength(1)

      second.dispose()
    })

    it('should tolerate a second dispose', () => {
      fixtureEl.innerHTML = '<div id="start"></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('#start'), { date: new Date(2026, 0, 15) })

      dateInput.dispose()

      expect(() => dateInput.dispose()).not.toThrow()
    })

    it('should drop a reset queued before the dispose', async () => {
      fixtureEl.innerHTML = '<form id="form"><div id="start"></div></form>'
      const dateInput = new DateInput(fixtureEl.querySelector('#start'), { date: new Date(2026, 0, 15) })

      fixtureEl.querySelector('#form').dispatchEvent(new Event('reset'))
      dateInput.dispose()

      await new Promise(resolve => {
        setTimeout(resolve, 10)
      })

      expect(fixtureEl.querySelector('#start').outerHTML).toEqual('<div id="start"></div>')
    })
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(DateInput.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(DateInput.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(DateInput.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(DateInput.DATA_KEY).toEqual('coreui.date-input')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(DateInput.NAME).toEqual('date-input')
    })
  })

  describe('constructor', () => {
    it('should create sections, separators and a hidden input from the format', () => {
      const dateInput = createDateInput()
      const element = dateInput._element

      expect(element.classList.contains('form-control')).toBeTrue()
      expect(element.classList.contains('form-date-time')).toBeTrue()
      expect(element.getAttribute('role')).toEqual('group')
      expect(getSections(element)).toHaveSize(3)
      expect(element.querySelectorAll('.form-date-time-separator')).toHaveSize(2)
      expect(element.querySelector('input[type="hidden"]')).not.toBeNull()
    })

    it('should show placeholders in empty sections', () => {
      const dateInput = createDateInput()
      const [day, month, year] = getSections(dateInput._element)

      expect(day.textContent).toEqual('DD')
      expect(month.textContent).toEqual('MM')
      expect(year.textContent).toEqual('YYYY')
      expect(day.classList.contains('form-date-time-section-empty')).toBeTrue()
    })

    it('should set spinbutton attributes on sections', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      expect(day.getAttribute('role')).toEqual('spinbutton')
      expect(day.getAttribute('inputmode')).toEqual('numeric')
      expect(day.getAttribute('aria-label')).toEqual('Day')
      expect(day.getAttribute('aria-valuemin')).toEqual('1')
      expect(day.getAttribute('aria-valuemax')).toEqual('31')
      expect(day.getAttribute('aria-valuetext')).toEqual('Empty')
      expect(day.getAttribute('autocorrect')).toEqual('off')
      expect(day.getAttribute('spellcheck')).toEqual('false')
      expect(dateInput._element.querySelector('.form-date-time-separator').getAttribute('aria-hidden')).toEqual('true')
    })

    it('should keep the default section names when their options are empty', () => {
      const dateInput = createDateInput({ ariaDayLabel: '', ariaMonthLabel: '', ariaYearLabel: '' })

      expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-label'))).toEqual(['Day', 'Month', 'Year'])
    })

    it('should fall back to the section name the page set for an empty option', () => {
      const { ariaDayLabel } = DateInput.Default
      DateInput.Default.ariaDayLabel = 'Tag'

      try {
        const dateInput = createDateInput({ ariaDayLabel: '' })

        expect(getSections(dateInput._element)[0].getAttribute('aria-label')).toEqual('Tag')
      } finally {
        DateInput.Default.ariaDayLabel = ariaDayLabel
      }
    })

    it('should show a configured placeholder', () => {
      const dateInput = createDateInput({ dayPlaceholder: 'jj' })

      expect(getSections(dateInput._element)[0].textContent).toEqual('jj')
    })

    it('should fill sections and the hidden input from the initial date', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14), name: 'my-date' })
      const [day, month, year] = getSections(dateInput._element)

      expect(day.textContent).toEqual('14')
      expect(month.textContent).toEqual('07')
      expect(year.textContent).toEqual('2026')
      expect(dateInput._element.querySelector('input[type="hidden"]').value).toEqual('14.07.2026')
      expect(dateInput._element.classList.contains('form-date-time-filled')).toBeTrue()
    })

    it('should parse a date-only ISO string as a local date', () => {
      const dateInput = createDateInput({ date: '2000-01-15' })

      expect(dateInput.getDate()).toEqual(new Date(2000, 0, 15))
      expect(getSections(dateInput._element)[0].textContent).toEqual('15')
    })

    it('should derive sections from the locale when format is not set', () => {
      fixtureEl.innerHTML = '<div></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { locale: 'en-US' })

      expect(getSections(dateInput._element)[0].getAttribute('aria-label')).toEqual('Month')
    })

    it('should focus the first section when autofocus is set', () => {
      const dateInput = createDateInput({ autofocus: true })

      expect(document.activeElement).toEqual(getSections(dateInput._element)[0])
    })

    it('should make the first section tabbable and the rest not', () => {
      const dateInput = createDateInput()
      const sections = getSections(dateInput._element)

      expect(sections[0].tabIndex).toBe(0)
      expect(sections[1].tabIndex).toBe(-1)
      expect(sections[2].tabIndex).toBe(-1)
    })

    it('should keep the aria-label the page wrote over the ariaLabel option', () => {
      fixtureEl.innerHTML = '<div aria-label="Birth date"></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { ariaLabel: 'Appointment', format: 'dd.MM.yyyy' })

      expect(dateInput._element.getAttribute('aria-label')).toEqual('Birth date')

      dateInput.setConfig({ ariaLabel: 'Meeting' })

      expect(dateInput._element.getAttribute('aria-label')).toEqual('Birth date')
    })

    it('should leave a label the page rewrites after init, also once disposed', () => {
      fixtureEl.innerHTML = '<div aria-label="Birth date"></div>'
      const element = fixtureEl.querySelector('div')
      const dateInput = new DateInput(element, { format: 'dd.MM.yyyy' })

      element.setAttribute('aria-label', 'Geburtsdatum')
      dateInput.setConfig({ date: new Date(2026, 6, 14) })

      expect(element.getAttribute('aria-label')).toEqual('Geburtsdatum')

      dateInput.dispose()

      expect(element.getAttribute('aria-label')).toEqual('Geburtsdatum')
    })

    it('should name a field with an empty aria-label from the ariaLabel option', () => {
      fixtureEl.innerHTML = '<div aria-label=""></div>'
      const element = fixtureEl.querySelector('div')
      const dateInput = new DateInput(element, { format: 'dd.MM.yyyy' })

      expect(element.getAttribute('aria-label')).toEqual('Date input')

      dateInput.dispose()

      expect(element.getAttribute('aria-label')).toEqual('')
    })

    it('should keep the default name when the ariaLabel option is empty', () => {
      fixtureEl.innerHTML = '<div></div><div></div>'
      const [dateElement, dateTimeElement] = fixtureEl.querySelectorAll('div')
      const dateInput = new DateInput(dateElement, { ariaLabel: '', format: 'dd.MM.yyyy' })
      const dateTimeInput = new DateInput(dateTimeElement, { ariaLabel: '', type: 'datetime' })

      expect(dateElement.getAttribute('aria-label')).toEqual('Date input')
      expect(dateTimeElement.getAttribute('aria-label')).toEqual('Date and time input')

      dateInput.dispose()
      dateTimeInput.dispose()
    })

    it('should fall back to the default name the page set for an empty ariaLabel', () => {
      const { ariaLabel } = DateInput.Default
      DateInput.Default.ariaLabel = 'Datum'

      try {
        fixtureEl.innerHTML = '<div></div>'
        const dateInput = new DateInput(fixtureEl.querySelector('div'), { ariaLabel: '', format: 'dd.MM.yyyy' })

        expect(dateInput._element.getAttribute('aria-label')).toEqual('Datum')
      } finally {
        DateInput.Default.ariaLabel = ariaLabel
      }
    })

    it('should keep the aria-labelledby the page wrote', () => {
      fixtureEl.innerHTML = '<span id="birth-label">Birth date</span><div aria-labelledby="birth-label"></div>'
      const element = fixtureEl.querySelector('div')
      const dateInput = new DateInput(element, { format: 'dd.MM.yyyy' })

      dateInput.setConfig({ date: new Date(2026, 6, 14) })

      expect(element.getAttribute('aria-labelledby')).toEqual('birth-label')

      dateInput.dispose()

      expect(element.getAttribute('aria-labelledby')).toEqual('birth-label')
    })
  })

  describe('typing', () => {
    it('should set the section value and complete it when unambiguous', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '4')

      expect(day.textContent).toEqual('04')
      expect(day.getAttribute('aria-valuenow')).toEqual('4')
    })

    it('should accumulate ambiguous digits within a section', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '1')
      expect(day.textContent).toEqual('01')

      pressKey(day, '4')
      expect(day.textContent).toEqual('14')
    })

    it('should move focus to the next section when a section completes', () => {
      const dateInput = createDateInput()
      const [day, month] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '4')

      expect(document.activeElement).toEqual(month)
    })

    it('should emit dateChange when all sections are filled', () => {
      const dateInput = createDateInput()
      const element = dateInput._element
      const spy = jasmine.createSpy('dateChange')
      element.addEventListener('dateChange.coreui.date-input', spy)

      const [day, month, year] = getSections(element)

      day.focus()
      pressKey(day, '4')
      pressKey(month, '7')
      for (const digit of '2026') {
        pressKey(year, digit)
      }

      expect(spy).toHaveBeenCalled()
      expect(spy.calls.mostRecent().args[0].date).toEqual(new Date(2026, 6, 4))
      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 4))
      expect(element.querySelector('input[type="hidden"]').value).toEqual('04.07.2026')
    })

    it.each(['q yyyy', 'QQQ yyyy'])('should ignore a quarter digit above 4 in %s', format => {
      const dateInput = createDateInput({ date: new Date(2026, 5, 15), format })
      const [quarter] = getSections(dateInput._element)

      quarter.focus()
      pressKey(quarter, '5')

      expect(quarter.getAttribute('aria-valuenow')).toEqual('2')
      expect(dateInput.getDate()).toEqual(new Date(2026, 3, 1))
    })

    it('should take a quarter digit typed after its letter', () => {
      const dateInput = createDateInput({ date: new Date(2026, 0, 15), format: 'QQQ yyyy' })
      const [quarter] = getSections(dateInput._element)

      quarter.focus()
      pressKey(quarter, 'q')
      pressKey(quarter, '3')

      expect(quarter.textContent).toEqual('Q3')
      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 1))
    })

    it('should report no date while a section holds a leading 0', () => {
      const dateInput = createDateInput()
      const spy = jasmine.createSpy('dateChange')
      dateInput._element.addEventListener('dateChange.coreui.date-input', spy)
      const [day, month, year] = getSections(dateInput._element)

      month.focus()
      pressKey(month, '0')
      pressKey(month, '6')
      for (const digit of '2026') {
        pressKey(year, digit)
      }

      day.focus()
      pressKey(day, '0')

      expect(dateInput.getDate()).toBeNull()

      pressKey(day, '5')

      expect(spy.calls.allArgs().map(([event]) => event.date)).toEqual([new Date(2026, 5, 5)])
    })

    it('should report no date while a four-digit year reads 0000, and year 1 once it loses focus', () => {
      const dateInput = createDateInput({ date: new Date(2026, 5, 15) })
      const errors = []
      dateInput._element.addEventListener('errorChange.coreui.date-input', event => errors.push(event.error))
      const year = getSections(dateInput._element)[2]

      year.focus()
      for (const digit of '0000') {
        pressKey(year, digit)
      }

      expect(dateInput.getDate()).toBeNull()
      expect(errors).toEqual(['incomplete'])

      year.blur()

      expect(dateInput.getDate().getFullYear()).toBe(1)
    })

    it('should keep the year a two-digit field was given when it loses focus', () => {
      const dateInput = createDateInput({ date: new Date(2026, 5, 15), format: 'dd.MM.yy' })
      const year = getSections(dateInput._element)[2]

      year.focus()
      year.blur()

      expect(dateInput.getDate()).toEqual(new Date(2026, 5, 15))
    })

    it('should keep a two-digit year of 00 as 2000 when the field loses focus', () => {
      const dateInput = createDateInput({ date: new Date(2026, 5, 15), format: 'dd.MM.yy' })
      const year = getSections(dateInput._element)[2]

      year.focus()
      pressKey(year, '0')
      pressKey(year, '0')
      year.blur()

      expect(year.textContent).toEqual('00')
      expect(dateInput.getDate()).toEqual(new Date(2000, 5, 15))
    })

    it('should ignore non-digit keys', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a')

      expect(day.textContent).toEqual('DD')
    })

    it('should type the character a beforeinput event inserts', () => {
      const dateInput = createDateInput()
      const [day, month] = getSections(dateInput._element)
      const event = new InputEvent('beforeinput', {
        inputType: 'insertText', data: '4', bubbles: true, cancelable: true
      })

      day.focus()
      day.dispatchEvent(event)

      expect(event.defaultPrevented).toBeTrue()
      expect(day.textContent).toEqual('04')
      expect(document.activeElement).toEqual(month)
    })

    it('should focus the first section when a filled field is clicked outside the sections', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day, , year] = getSections(dateInput._element)

      year.focus()
      dateInput._element.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      expect(document.activeElement).toEqual(day)
    })

    it('should focus the first empty section when the field is clicked outside the sections', () => {
      const dateInput = createDateInput()
      const [day, month, year] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '4')
      year.focus()
      dateInput._element.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      expect(document.activeElement).toEqual(month)
    })
  })

  describe('partial masks', () => {
    it('should support month and year formats, valued at the first day of the month', () => {
      const dateInput = createDateInput({ format: 'MM.yyyy' })
      const [month, year] = getSections(dateInput._element)

      expect(getSections(dateInput._element)).toHaveSize(2)

      month.focus()
      pressKey(month, '7')
      for (const digit of '2026') {
        pressKey(year, digit)
      }

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 1))
      expect(dateInput._element.querySelector('input[type="hidden"]').value).toEqual('07.2026')
    })

    it('should fill month and year sections from an initial date', () => {
      const dateInput = createDateInput({ format: 'MMMM yyyy', locale: 'en-US', date: new Date(2026, 6, 14) })
      const [month] = getSections(dateInput._element)

      expect(month.textContent).toEqual('July')
      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 1))
    })
  })

  describe('text month sections', () => {
    const createTextDateInput = () => createDateInput({ format: 'DD MMMM YYYY', locale: 'en-US' })

    it('should show the format token as placeholder', () => {
      const dateInput = createTextDateInput()
      const [, month] = getSections(dateInput._element)

      expect(month.textContent).toEqual('MMMM')
    })

    it('should match month names as the user types letters', () => {
      const dateInput = createTextDateInput()
      const [, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, 'm')
      expect(month.textContent).toEqual('March')

      pressKey(month, 'a')
      expect(month.textContent).toEqual('March')

      pressKey(month, 'y')
      expect(month.textContent).toEqual('May')
    })

    it('should complete the section and move focus on a unique match', () => {
      const dateInput = createTextDateInput()
      const [, month, year] = getSections(dateInput._element)

      month.focus()
      pressKey(month, 'j')
      pressKey(month, 'u')
      pressKey(month, 'n')

      expect(month.textContent).toEqual('June')
      expect(document.activeElement).toEqual(year)
    })

    it('should still accept digits and arrow keys', () => {
      const dateInput = createTextDateInput()
      const [, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, '3')
      expect(month.textContent).toEqual('March')

      pressKey(month, 'ArrowUp')
      expect(month.textContent).toEqual('April')
    })

    it('should name the month of a Persian-locale date in the Gregorian calendar', () => {
      const dateInput = createDateInput({ date: new Date(2026, 8, 1), locale: 'fa-IR' })
      const month = dateInput._element.querySelector('[data-coreui-section="month"]')

      expect(month.getAttribute('aria-valuetext')).toEqual('سپتامبر')
    })

    it('should display and match custom month names', () => {
      const monthNames = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']
      const dateInput = createDateInput({ format: 'DD MMMM YYYY', locale: 'pl-PL', monthNames })
      const [, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, 'l')
      expect(month.textContent).toEqual('luty')

      pressKey(month, 'i')
      expect(month.textContent).toEqual('lipiec')
      expect(month.getAttribute('aria-valuetext')).toEqual('lipiec')
    })

    it('should fill sections from a pasted date with a month name', () => {
      const dateInput = createTextDateInput()
      const event = new Event('paste', { bubbles: true, cancelable: true })
      event.clipboardData = { getData: () => '14 July 2026' }
      getSections(dateInput._element)[0].dispatchEvent(event)

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
    })
  })

  describe('keyboard navigation', () => {
    it('should clamp a section to its minimum when the focus leaves', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '0')
      day.blur()

      expect(day.textContent).toEqual('01')
      expect(day.getAttribute('aria-valuenow')).toEqual('1')
    })

    it('should move between sections with arrow keys', () => {
      const dateInput = createDateInput()
      const [day, month] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowRight')
      expect(document.activeElement).toEqual(month)

      pressKey(month, 'ArrowLeft')
      expect(document.activeElement).toEqual(day)
    })

    it('should mirror the arrow keys inside an RTL ancestor', () => {
      // sections flow right-to-left, so the visual direction inverts
      fixtureEl.innerHTML = '<div dir="rtl"><div id="mydateinput"></div></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('#mydateinput'), { format: 'dd.MM.yyyy' })
      const [day, month] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowLeft')
      expect(document.activeElement).toEqual(month)

      pressKey(month, 'ArrowRight')
      expect(document.activeElement).toEqual(day)
    })

    it('should mirror Home and End inside an RTL ancestor', () => {
      fixtureEl.innerHTML = '<div dir="rtl"><div id="mydateinput"></div></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('#mydateinput'), { format: 'dd.MM.yyyy' })
      const [day, , year] = getSections(dateInput._element)

      year.focus()
      pressKey(year, 'Home')
      expect(document.activeElement).toEqual(year)

      pressKey(year, 'End')
      expect(document.activeElement).toEqual(day)
    })

    it('should jump to the first and last section with Home and End', () => {
      const dateInput = createDateInput()
      const [day, , year] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'End')
      expect(document.activeElement).toEqual(year)

      pressKey(year, 'Home')
      expect(document.activeElement).toEqual(day)
    })

    it('should increment and decrement with arrow up and down', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowUp')
      expect(day.textContent).toEqual('15')

      pressKey(day, 'ArrowDown')
      pressKey(day, 'ArrowDown')
      expect(day.textContent).toEqual('13')
    })

    it('should edit a section from a virtual keyboard', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day, month] = getSections(dateInput._element)
      const virtualInput = (section, inputType, data = null) => {
        const event = new InputEvent('beforeinput', {
          inputType, data, bubbles: true, cancelable: true
        })

        section.dispatchEvent(new KeyboardEvent('keydown', { key: 'Unidentified', bubbles: true, cancelable: true }))
        section.dispatchEvent(event)
        return event
      }

      day.focus()

      expect(virtualInput(day, 'deleteContentBackward').defaultPrevented).toBeTrue()
      expect(day.textContent).toEqual('DD')

      virtualInput(day, 'insertText', '2')
      virtualInput(day, 'insertText', '5')

      expect(day.textContent).toEqual('25')
      expect(virtualInput(month, 'deleteContentForward').defaultPrevented).toBeTrue()
      expect(month.textContent).toEqual('MM')
    })

    it('should send no extra keydown for a virtual edit of a read-only field', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14), readonly: true })
      const [day] = getSections(dateInput._element)
      const onKeydown = vi.fn()
      const event = new InputEvent('beforeinput', {
        inputType: 'deleteContentBackward', bubbles: true, cancelable: true
      })

      document.addEventListener('keydown', onKeydown)
      day.focus()
      day.dispatchEvent(event)
      document.removeEventListener('keydown', onKeydown)

      expect(event.defaultPrevented).toBeTrue()
      expect(onKeydown).not.toHaveBeenCalled()
      expect(day.textContent).toEqual('14')
    })

    it('should leave the value alone when the arrow carries the picker modifier', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowDown', { altKey: true })

      expect(day.textContent).toEqual('14')
    })

    it('should start empty sections at the boundary, except year at the current year', () => {
      const dateInput = createDateInput()
      const [day, month, year] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowUp')
      expect(day.textContent).toEqual('01')

      month.focus()
      pressKey(month, 'ArrowDown')
      expect(month.textContent).toEqual('12')

      year.focus()
      pressKey(year, 'ArrowUp')
      expect(year.textContent).toEqual(String(new Date().getFullYear()))
    })

    it('should wrap month around its bounds', () => {
      const dateInput = createDateInput({ date: new Date(2026, 11, 14) })
      const [, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, 'ArrowUp')
      expect(month.textContent).toEqual('01')

      pressKey(month, 'ArrowDown')
      expect(month.textContent).toEqual('12')
    })

    it('should clear the section with Backspace and move to the previous one when empty', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, 'Backspace')
      expect(month.textContent).toEqual('MM')
      expect(dateInput.getDate()).toBeNull()

      pressKey(month, 'Backspace')
      expect(document.activeElement).toEqual(day)
    })

    it('should bound the day section by the selected month', () => {
      const dateInput = createDateInput({ date: new Date(2023, 1, 28) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowUp')
      expect(day.textContent).toEqual('01')

      pressKey(day, 'ArrowDown')
      expect(day.textContent).toEqual('28')
      expect(day.getAttribute('aria-valuemax')).toEqual('28')
    })

    it('should bound the week section by the ISO weeks of the year', () => {
      const dateInput = createDateInput({ date: new Date(2025, 6, 4), format: 'yyyy-Www' })
      const [year, week] = getSections(dateInput._element)

      expect(week.getAttribute('aria-valuemax')).toEqual('52')

      year.focus()
      pressKey(year, 'ArrowUp')
      expect(week.getAttribute('aria-valuemax')).toEqual('53')

      pressKey(year, 'Backspace')
      expect(week.getAttribute('aria-valuemax')).toEqual('53')
    })

    it('should keep a typed week within the ISO weeks of the year', () => {
      const dateInput = createDateInput({ date: new Date(2025, 6, 4), format: 'yyyy-Www' })
      const [, week] = getSections(dateInput._element)

      week.focus()
      pressKey(week, '5')
      pressKey(week, '3')
      expect(week.textContent).toEqual('03')

      const lastWeek = getSections(createDateInput({ date: new Date(2025, 11, 22), format: 'yyyy-Www' })._element)[1]

      lastWeek.focus()
      pressKey(lastWeek, 'ArrowUp')
      expect(lastWeek.textContent).toEqual('01')
    })

    it('should clamp the day when the month changes', () => {
      const dateInput = createDateInput({ date: new Date(2026, 0, 31) })
      const [day, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, '2')

      expect(day.textContent).toEqual('28')
      expect(dateInput.getDate()).toEqual(new Date(2026, 1, 28))
    })

    it('should keep the 29th of February while the year is typed digit by digit', () => {
      const dateInput = createDateInput({ date: new Date(2024, 1, 29) })
      const [day, , year] = getSections(dateInput._element)

      year.focus()

      for (const digit of '2024') {
        pressKey(year, digit)
      }

      expect(day.textContent).toEqual('29')
      expect(dateInput.getDate()).toEqual(new Date(2024, 1, 29))
    })

    it('should keep week 53 while the year is typed digit by digit', () => {
      const dateInput = createDateInput({ format: "'Week' ww, yyyy" })
      const [week, year] = getSections(dateInput._element)

      week.focus()
      pressKey(week, '5')
      pressKey(week, '3')

      for (const digit of '2026') {
        pressKey(year, digit)
      }

      expect(week.textContent).toEqual('53')
      expect(dateInput.getDate()).toEqual(new Date(2026, 11, 28))
    })

    it('should cut the day to a year left unfinished when focus moves on', () => {
      const dateInput = createDateInput({ date: new Date(2024, 1, 29) })
      const [day, , year] = getSections(dateInput._element)

      year.focus()
      pressKey(year, '2')
      pressKey(year, '0')
      pressKey(year, '2')
      day.focus()

      expect(day.textContent).toEqual('28')
    })

    it('should cut the day to a year left unfinished when focus leaves the field', () => {
      const dateInput = createDateInput({ date: new Date(2024, 1, 29) })
      const [day, , year] = getSections(dateInput._element)

      year.focus()
      pressKey(year, '2')
      pressKey(year, '0')
      pressKey(year, '2')
      year.blur()

      expect(day.textContent).toEqual('28')
    })

    it('should clear the section with Delete', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'Delete')

      expect(day.textContent).toEqual('DD')
    })
  })

  describe('select all', () => {
    it('should select the whole value with Ctrl+A and copy it with Ctrl+C', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })

      expect(dateInput._element.classList.contains('form-date-time-all-selected')).toBeTrue()

      const clipboard = {}
      const event = new Event('copy', { bubbles: true, cancelable: true })
      event.clipboardData = {
        setData(type, value) {
          clipboard[type] = value
        }
      }
      day.dispatchEvent(event)

      expect(event.defaultPrevented).toBeTrue()
      expect(clipboard['text/plain']).toEqual('14.07.2026')
      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
    })

    it('should copy and clear all sections with Ctrl+X', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })

      const clipboard = {}
      const event = new Event('cut', { bubbles: true, cancelable: true })
      event.clipboardData = {
        setData(type, value) {
          clipboard[type] = value
        }
      }
      day.dispatchEvent(event)

      expect(clipboard['text/plain']).toEqual('14.07.2026')
      expect(dateInput.getDate()).toBeNull()
      expect(day.textContent).toEqual('DD')
    })

    it('should clear all sections with Backspace after select all', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day, month, year] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })
      pressKey(day, 'Backspace')

      expect(day.textContent).toEqual('DD')
      expect(month.textContent).toEqual('MM')
      expect(year.textContent).toEqual('YYYY')
      expect(dateInput.getDate()).toBeNull()
      expect(document.activeElement).toEqual(day)
    })

    it('should drop the selection of all sections when it clears them', () => {
      const cut = section => {
        const event = new Event('cut', { bubbles: true, cancelable: true })
        event.clipboardData = { setData() {} }
        section.dispatchEvent(event)
      }

      for (const clearAll of [day => pressKey(day, 'Backspace'), day => pressKey(day, 'Delete'), day => pressKey(day, 'x'), cut]) {
        const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
        const [day] = getSections(dateInput._element)

        day.focus()
        pressKey(day, 'a', { ctrlKey: true })
        clearAll(day)

        expect(dateInput.getDate()).toBeNull()
        expect(dateInput._element.classList.contains('form-date-time-all-selected')).toBeFalse()
        dateInput.dispose()
      }
    })

    it('should drop the selection of all sections when the focus leaves the field', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })
      day.blur()

      expect(dateInput._element.classList.contains('form-date-time-all-selected')).toBeFalse()
    })

    it('should copy a readonly value on cut without clearing it', () => {
      const dateInput = createDateInput({ readonly: true, date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)
      const clipboard = {}
      const event = new Event('cut', { bubbles: true, cancelable: true })
      event.clipboardData = {
        setData(type, value) {
          clipboard[type] = value
        }
      }

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })
      day.dispatchEvent(event)

      expect(clipboard['text/plain']).toEqual('14.07.2026')
      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
    })

    it('should clear all sections with Delete after select all', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day, month, year] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })
      pressKey(day, 'Delete')

      expect([day.textContent, month.textContent, year.textContent]).toEqual(['DD', 'MM', 'YYYY'])
      expect(dateInput.getDate()).toBeNull()
    })

    it('should leave Ctrl+C and Tab alone after select all', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)
      const copy = new KeyboardEvent('keydown', {
        key: 'c', ctrlKey: true, bubbles: true, cancelable: true
      })
      const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })
      day.dispatchEvent(copy)
      day.dispatchEvent(tab)

      expect(copy.defaultPrevented).toBeFalse()
      expect(tab.defaultPrevented).toBeFalse()
      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
    })

    it('should type the second key after select all into the same section', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })
      pressKey(day, '2')
      pressKey(day, '5')

      expect(day.textContent).toEqual('25')
    })

    it('should restart typing from the first section after select all', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day, month, year] = getSections(dateInput._element)

      year.focus()
      pressKey(year, 'a', { ctrlKey: true })
      pressKey(year, '2')

      expect(day.textContent).toEqual('02')
      expect(month.textContent).toEqual('MM')
      expect(year.textContent).toEqual('YYYY')
    })

    it('should type a two-digit day after select all from another section', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day, , year] = getSections(dateInput._element)

      year.focus()
      pressKey(year, 'a', { ctrlKey: true })
      pressKey(year, '2')
      pressKey(day, '5')

      expect(day.textContent).toEqual('25')
    })
  })

  describe('paste', () => {
    const paste = (element, text) => {
      const event = new Event('paste', { bubbles: true, cancelable: true })
      event.clipboardData = { getData: () => text }
      element.dispatchEvent(event)
    }

    it('should fill all sections from a pasted date', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      paste(day, '14.07.2026')

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
    })

    it('should cut the day of a pasted date while the year is being typed', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day, , year] = getSections(dateInput._element)

      year.focus()
      pressKey(year, '2')
      paste(year, '31.02.2026')

      expect(day.textContent).toEqual('28')
    })

    it('should use inputDateParse when provided', () => {
      const dateInput = createDateInput({ inputDateParse: () => new Date(2026, 0, 2) })
      const [day] = getSections(dateInput._element)

      paste(day, 'anything')

      expect(dateInput.getDate()).toEqual(new Date(2026, 0, 2))
    })

    it('should call inputDateParse on the config', () => {
      const inputDateParse = vi.fn(() => new Date(2026, 0, 2))
      const dateInput = createDateInput({ inputDateParse })

      paste(getSections(dateInput._element)[0], 'anything')

      expect(inputDateParse.mock.contexts[0]).toBe(dateInput._config)
      expect(dateInput.getDate()).toEqual(new Date(2026, 0, 2))
    })

    it('should prefer inputDateParse over text the mask reads', () => {
      const dateInput = createDateInput({ inputDateParse: () => new Date(2026, 0, 2) })

      paste(getSections(dateInput._element)[0], '14.07.2026')

      expect(dateInput.getDate()).toEqual(new Date(2026, 0, 2))
    })

    it('should not fall back when inputDateParse finds nothing', () => {
      const dateInput = createDateInput({ inputDateParse: () => null })

      paste(getSections(dateInput._element)[0], '14.07.2026')

      expect(dateInput.getDate()).toBeNull()
    })

    it('should ignore unparsable text', () => {
      const dateInput = createDateInput()
      const [day] = getSections(dateInput._element)

      paste(day, 'not a date')

      expect(dateInput.getDate()).toBeNull()
    })
  })

  describe('validation', () => {
    const createInForm = (config = {}, formAttributes = 'data-coreui-validate') => {
      fixtureEl.innerHTML = `<form ${formAttributes}><div id="mydateinput"></div></form>`
      return new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', ...config })
    }

    it('should apply the valid and invalid config options', () => {
      const invalidInput = createDateInput({ invalid: true })
      expect(invalidInput._element.classList.contains('is-invalid')).toBeTrue()

      const validInput = createDateInput({ valid: true })
      expect(validInput._element.classList.contains('is-valid')).toBeTrue()
    })

    it('should not draw a field the page announces as invalid as valid', () => {
      fixtureEl.innerHTML = '<div aria-invalid="true"></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', valid: true })

      expect(dateInput._element.classList.contains('is-valid')).toBeFalse()
    })

    it('should not draw a field invalid on its own as valid', () => {
      for (const config of [{ date: new Date(2026, 6, 20), maxDate: new Date(2026, 6, 14) }, { invalid: true }]) {
        const dateInput = createDateInput({ valid: true, ...config })

        expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
        expect(dateInput._element.classList.contains('is-valid')).toBeFalse()
        dateInput.dispose()
      }
    })

    it('should mark a required empty field as invalid on submit of a validated form', async () => {
      const dateInput = createInForm({ required: true })

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should expose the invalid state on the field and every section, and drop it once the date is valid', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 20), maxDate: new Date(2026, 6, 14) })
      const invalid = () => [dateInput._element, ...getSections(dateInput._element)].map(element => element.getAttribute('aria-invalid'))

      expect(invalid()).toEqual(['true', 'true', 'true', 'true'])

      dateInput.setConfig({ date: new Date(2026, 6, 10) })

      expect(invalid()).toEqual([null, null, null, null])
    })

    it('should expose the invalid state of a required empty field on submit of a validated form', async () => {
      const dateInput = createInForm({ required: true })

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-invalid'))).toEqual(['true', 'true', 'true'])
    })

    it('should keep the aria-invalid the page set, override it while the date is invalid and give it back on dispose', () => {
      fixtureEl.innerHTML = '<div aria-invalid="grammar"></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { date: new Date(2026, 6, 10), format: 'dd.MM.yyyy', maxDate: new Date(2026, 6, 14) })
      const element = dateInput._element
      const invalid = () => [element, ...getSections(element)].map(item => item.getAttribute('aria-invalid'))

      expect(invalid()).toEqual(['grammar', 'grammar', 'grammar', 'grammar'])

      dateInput.setConfig({ date: new Date(2026, 6, 20) })

      expect(invalid()).toEqual(['true', 'true', 'true', 'true'])

      dateInput.dispose()

      expect(element.getAttribute('aria-invalid')).toEqual('grammar')
    })

    it('should leave no aria-invalid of its own on the element after dispose', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 20), maxDate: new Date(2026, 6, 14) })
      const element = dateInput._element

      dateInput.dispose()

      expect(element.hasAttribute('aria-invalid')).toBeFalse()
    })

    it.each([{ disabled: true }, { readonly: true }])('should not flag an empty required field as missing on submit when %o', async config => {
      const dateInput = createInForm({ required: true, ...config })

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
      expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-invalid'))).toEqual([null, null, null])
    })

    it('should keep a required empty field invalid after submit until it holds a date', async () => {
      const dateInput = createInForm({ required: true })
      const [day, month, year] = getSections(dateInput._element)
      const invalid = () => [dateInput._element, ...getSections(dateInput._element)].map(item => item.getAttribute('aria-invalid'))

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
      day.focus()
      day.blur()

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(invalid()).toEqual(['true', 'true', 'true', 'true'])

      day.focus()
      pressKey(day, '1')
      pressKey(day, '4')
      pressKey(month, '0')
      pressKey(month, '7')
      for (const digit of '2026') {
        pressKey(year, digit)
      }

      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
      expect(invalid()).toEqual([null, null, null, null])
    })

    it('should describe the first section with the field description, and every section while the field is invalid', () => {
      fixtureEl.innerHTML = '<div aria-describedby="help"></div><div id="help">Pick a date before 15.07.2026</div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { date: new Date(2026, 6, 10), format: 'dd.MM.yyyy', maxDate: new Date(2026, 6, 14) })
      const describedBy = () => [...getSections(dateInput._element)].map(section => section.getAttribute('aria-describedby'))

      expect(describedBy()).toEqual(['help', null, null])

      dateInput.setConfig({ date: new Date(2026, 6, 20) })

      expect(describedBy()).toEqual(['help', 'help', 'help'])

      dateInput.setConfig({ date: new Date(2026, 6, 10) })

      expect(describedBy()).toEqual(['help', null, null])
    })

    it('should describe the sections with an error the page attaches on errorChange', () => {
      fixtureEl.innerHTML = '<div aria-describedby="help"></div><div id="help">Pick a date</div><div id="error">Too late</div>'
      const element = fixtureEl.querySelector('div')
      const dateInput = new DateInput(element, { date: new Date(2026, 6, 10), format: 'dd.MM.yyyy', maxDate: new Date(2026, 6, 14) })
      const describedBy = () => [...getSections(element)].map(section => section.getAttribute('aria-describedby'))

      element.addEventListener('errorChange.coreui.date-input', event => {
        element.setAttribute('aria-describedby', event.error ? 'help error' : 'help')
      })
      dateInput.setConfig({ date: new Date(2026, 6, 20) })

      expect(describedBy()).toEqual(['help error', 'help error', 'help error'])

      dateInput.setConfig({ date: new Date(2026, 6, 10) })

      expect(describedBy()).toEqual(['help', null, null])
    })

    it('should describe every section of a field the page marks invalid', () => {
      fixtureEl.innerHTML = '<div aria-describedby="help" aria-invalid="true"></div><div id="help">Pick a date</div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy' })

      expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-describedby'))).toEqual(['help', 'help', 'help'])
    })

    it('should not describe the sections of a field without a description', () => {
      const dateInput = createDateInput({ invalid: true })

      expect([...getSections(dateInput._element)].map(section => section.hasAttribute('aria-describedby'))).toEqual([false, false, false])
    })

    it('should mark each section as required, not the group', () => {
      const dateInput = createDateInput({ required: true })

      expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-required'))).toEqual(['true', 'true', 'true'])
      expect(dateInput._element.hasAttribute('aria-required')).toBeFalse()

      dateInput.setConfig({ required: false })

      expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-required'))).toEqual([null, null, null])
    })

    it('should mark a filled field as valid on submit of a form opted into valid styling', async () => {
      const dateInput = createInForm({ required: true, date: new Date(2026, 6, 14) }, 'data-coreui-validate="valid"')

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-valid')).toBeTrue()
      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
    })

    it('should keep the valid state while the value it judged holds', async () => {
      const dateInput = createInForm({ required: true, date: new Date(2026, 6, 14) }, 'data-coreui-validate="valid"')

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      dateInput.setConfig({ date: new Date(2026, 6, 15) })

      expect(dateInput._element.classList.contains('is-valid')).toBeTrue()
    })

    it('should drop the valid state once the field is emptied', async () => {
      const dateInput = createInForm({ required: true, date: new Date(2026, 6, 14) }, 'data-coreui-validate="valid"')

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      dateInput.clear()

      expect(dateInput._element.classList.contains('is-valid')).toBeFalse()
    })

    it('should not mark a filled field as valid when the form does not opt into valid styling', async () => {
      const dateInput = createInForm({ required: true, date: new Date(2026, 6, 14) })

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-valid')).toBeFalse()
      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
    })

    it('should apply the state even when data-coreui-validate is added during the same submit', async () => {
      fixtureEl.innerHTML = '<form><div id="mydateinput"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', required: true })
      form.addEventListener('submit', () => form.setAttribute('data-coreui-validate', ''))

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should not touch validation classes when the form is not validated yet', async () => {
      fixtureEl.innerHTML = '<form><div id="mydateinput"></div></form>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', required: true })

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
      expect(dateInput._element.classList.contains('is-valid')).toBeFalse()
    })

    it('should stop listening to the form on dispose', async () => {
      const dateInput = createInForm({ required: true })
      const element = dateInput._element

      dateInput.dispose()
      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(element.classList.contains('is-invalid')).toBeFalse()
    })

    it('should run the submit handler once after re-initialization', async () => {
      const element = createInForm({ required: true })._element
      new DateInput(element, { format: 'dd.MM.yyyy', required: true }) // eslint-disable-line no-new
      const toggle = spyOn(element.classList, 'toggle').and.callThrough()

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(toggle).toHaveBeenCalledTimes(2)
      expect(element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should keep the submit handler of another field in the same form', async () => {
      fixtureEl.innerHTML = '<form data-coreui-validate><div id="first"></div><div id="second"></div></form>'
      const first = new DateInput(fixtureEl.querySelector('#first'), { format: 'dd.MM.yyyy', required: true })
      const second = new DateInput(fixtureEl.querySelector('#second'), { format: 'dd.MM.yyyy', required: true })

      first.dispose()
      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(second._element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should emit errorChange with a reason when validation state changes', () => {
      const dateInput = createDateInput({
        date: new Date(2026, 6, 14),
        minDate: new Date(2026, 6, 10),
        maxDate: new Date(2026, 6, 14)
      })
      const spy = jasmine.createSpy('errorChange')
      dateInput._element.addEventListener('errorChange.coreui.date-input', spy)
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowUp')
      expect(spy.calls.mostRecent().args[0].error).toEqual('maxDate')

      pressKey(day, 'ArrowDown')
      expect(spy.calls.mostRecent().args[0].error).toBeNull()

      pressKey(day, 'Delete')
      expect(spy.calls.mostRecent().args[0].error).toEqual('incomplete')

      expect(spy).toHaveBeenCalledTimes(3)
    })

    it('should answer whether a date would pass validation', () => {
      const dateInput = createDateInput({
        disabledDates: [new Date(2026, 6, 15)],
        maxDate: new Date(2026, 6, 20),
        minDate: new Date(2026, 6, 10)
      })

      expect(dateInput.isDateSelectable(new Date(2026, 6, 14))).toBeTrue()
      expect(dateInput.isDateSelectable(new Date(2026, 6, 15))).toBeFalse()
      expect(dateInput.isDateSelectable(new Date(2026, 6, 21))).toBeFalse()
      expect(dateInput.isDateSelectable(new Date(2026, 6, 9))).toBeFalse()
      expect(dateInput.isDateSelectable(null)).toBeFalse()
      expect(dateInput.isDateSelectable(new Date('invalid'))).toBeFalse()
    })

    it('should check a month field against the bounds and the disabled dates as a whole month', () => {
      const limited = createDateInput({ format: 'MM/yyyy', minDate: new Date(2026, 9, 15) })

      expect(limited.isDateSelectable(new Date(2026, 9, 1))).toBeTrue()
      expect(limited.isDateSelectable(new Date(2026, 8, 30))).toBeFalse()

      const weekends = createDateInput({ disabledDates: date => date.getDay() === 0 || date.getDay() === 6, format: 'MM/yyyy' })

      expect(weekends.isDateSelectable(new Date(2026, 10, 1))).toBeTrue()

      const leftDisabled = createDateInput({ disabledDates: [[new Date(2026, 9, 15), new Date(2026, 9, 31)]], format: 'MM/yyyy', minDate: new Date(2026, 9, 15) })

      expect(leftDisabled.isDateSelectable(new Date(2026, 9, 1))).toBeFalse()
      expect(createDateInput({ disabledDates: () => true, format: 'MM/yyyy' }).isDateSelectable(new Date(2026, 9, 1))).toBeFalse()
    })

    it('should normalize the checked date through the mask', () => {
      const dateInput = createDateInput({ maxDate: new Date(2026, 6, 14) })

      expect(dateInput.isDateSelectable(new Date(2026, 6, 14, 15, 30))).toBeTrue()
    })

    it('should validate a date set through the constructor', () => {
      const dateInput = createDateInput({
        date: new Date(2026, 6, 20),
        maxDate: new Date(2026, 6, 14)
      })

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(dateInput.getDate()).toBeNull()
    })

    it('should validate a date set through update() like a typed one', () => {
      const dateInput = createDateInput({ maxDate: new Date(2026, 6, 14) })
      const changeSpy = jasmine.createSpy('dateChange')
      const errorSpy = jasmine.createSpy('errorChange')
      dateInput._element.addEventListener('dateChange.coreui.date-input', changeSpy)
      dateInput._element.addEventListener('errorChange.coreui.date-input', errorSpy)

      dateInput.setConfig({ date: new Date(2026, 6, 20) })

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(dateInput.getDate()).toBeNull()
      expect(errorSpy.calls.mostRecent().args[0].error).toEqual('maxDate')
      expect(changeSpy).not.toHaveBeenCalled()
    })

    it('should clear the invalid state when update() sets a date back in range', () => {
      const dateInput = createDateInput({
        date: new Date(2026, 6, 20),
        maxDate: new Date(2026, 6, 14)
      })
      const changeSpy = jasmine.createSpy('dateChange')
      dateInput._element.addEventListener('dateChange.coreui.date-input', changeSpy)

      dateInput.setConfig({ date: new Date(2026, 6, 10) })

      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 10))
      expect(changeSpy.calls.mostRecent().args[0].date).toEqual(new Date(2026, 6, 10))
    })

    it('should report disabled dates through errorChange', () => {
      const dateInput = createDateInput({
        date: new Date(2026, 6, 14),
        disabledDates: [new Date(2026, 6, 15)]
      })
      const spy = jasmine.createSpy('errorChange')
      dateInput._element.addEventListener('errorChange.coreui.date-input', spy)
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowUp')

      expect(spy.calls.mostRecent().args[0].error).toEqual('disabledDate')
    })

    it('should mark dates outside min and max as invalid', () => {
      const dateInput = createDateInput({
        date: new Date(2026, 6, 14),
        minDate: new Date(2026, 6, 1),
        maxDate: new Date(2026, 6, 14)
      })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'ArrowUp')

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(dateInput.getDate()).toBeNull()
    })
  })

  describe('disabled', () => {
    it('should not create editable or tabbable sections', () => {
      const dateInput = createDateInput({ disabled: true })
      const [day] = getSections(dateInput._element)

      expect(dateInput._element.classList.contains('disabled')).toBeTrue()
      expect(day.isContentEditable).toBeFalse()
      expect(day.tabIndex).toBe(-1)
      expect(day.getAttribute('aria-disabled')).toEqual('true')
      expect(dateInput._element.querySelector('input[type="hidden"]').disabled).toBeTrue()
    })

    it('should mark readonly sections read-only and keep them focusable', () => {
      const dateInput = createDateInput({ readonly: true })
      const [day] = getSections(dateInput._element)

      expect(day.isContentEditable).toBeTrue()
      expect(day.tabIndex).toBe(0)
      expect(day.getAttribute('aria-readonly')).toEqual('true')
      expect(day.hasAttribute('aria-disabled')).toBeFalse()
    })

    it('should ignore beforeinput typing when readonly', () => {
      const dateInput = createDateInput({ readonly: true })
      const [day] = getSections(dateInput._element)
      const event = new InputEvent('beforeinput', {
        inputType: 'insertText', data: '4', bubbles: true, cancelable: true
      })

      day.dispatchEvent(event)

      expect(event.defaultPrevented).toBeTrue()
      expect(day.textContent).toEqual('DD')
    })

    it('should ignore keyboard edits when readonly', () => {
      const dateInput = createDateInput({ readonly: true })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '4')
      pressKey(day, 'ArrowUp')

      expect(day.textContent).toEqual('DD')
    })
  })

  describe('clear', () => {
    it('should empty all sections and the hidden input', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })

      dateInput.clear()

      expect(dateInput.getDate()).toBeNull()
      expect(getSections(dateInput._element)[0].textContent).toEqual('DD')
      expect(dateInput._element.querySelector('input[type="hidden"]').value).toEqual('')
      expect(dateInput._element.classList.contains('form-date-time-filled')).toBeFalse()
    })
  })

  describe('reset', () => {
    it('should restore the initial date', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })

      dateInput.clear()
      dateInput.reset()

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
      expect(getSections(dateInput._element)[0].textContent).toEqual('14')
    })

    it('should restore the initial date, not the last one set through update()', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })

      dateInput.setConfig({ date: new Date(2026, 6, 20) })
      dateInput.reset()

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
    })

    it('should emit dateChange when the value moves back', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const spy = jasmine.createSpy('dateChange')
      dateInput._element.addEventListener('dateChange.coreui.date-input', spy)

      dateInput.clear()
      dateInput.reset()

      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy.calls.mostRecent().args[0].date).toEqual(new Date(2026, 6, 14))
    })

    it('should follow a native form reset', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<form><div id="mydateinput"></div></form>'
        const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', date: new Date(2026, 6, 14) })

        dateInput.clear()
        expect(dateInput.getDate()).toBeNull()

        fixtureEl.querySelector('form').reset()

        setTimeout(() => {
          expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
          expect(dateInput._element.querySelector('input[type="hidden"]').value).toEqual('14.07.2026')
          resolve()
        }, 10)
      })
    })

    it('should drop the invalid verdict of a submit on a native form reset', async () => {
      fixtureEl.innerHTML = '<form data-coreui-validate><div id="mydateinput"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', required: true })
      const invalid = () => [dateInput._element, ...getSections(dateInput._element)].map(item => item.getAttribute('aria-invalid'))

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()

      form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
      expect(invalid()).toEqual([null, null, null, null])
    })

    it('should drop the valid verdict of a submit on a native form reset', async () => {
      fixtureEl.innerHTML = '<form data-coreui-validate="valid"><div id="mydateinput"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', date: new Date(2026, 6, 14) })

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-valid')).toBeTrue()

      form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(dateInput._element.classList.contains('is-valid')).toBeFalse()
    })

    it('should keep the date and the verdict when a listener cancels the form reset', async () => {
      fixtureEl.innerHTML = '<form data-coreui-validate><div id="mydateinput"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', required: true })
      const [day] = getSections(dateInput._element)

      form.addEventListener('reset', event => event.preventDefault())
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
      day.focus()
      pressKey(day, '1')
      pressKey(day, '4')

      form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(day.textContent).toEqual('14')
      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should keep the verdict of a submit that follows the reset in the same task', async () => {
      fixtureEl.innerHTML = '<form data-coreui-validate><div id="mydateinput"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', required: true })

      form.reset()
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
    })
    it('should judge the restored date for a submit that follows the reset in the same task', async () => {
      fixtureEl.innerHTML = '<form data-coreui-validate="valid"><div id="mydateinput"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', date: new Date(2026, 6, 14), maxDate: new Date(2026, 6, 31) })

      dateInput.setConfig({ date: new Date(2026, 7, 20) })

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()

      form.reset()
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await new Promise(resolve => {
        setTimeout(resolve)
      })
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-valid')).toBeTrue()
    })

    it('should drop the verdict when the page resets the form in its own submit listener', async () => {
      fixtureEl.innerHTML = '<form data-coreui-validate><div id="mydateinput"></div></form>'
      const form = fixtureEl.querySelector('form')

      form.addEventListener('submit', event => {
        event.preventDefault()
        form.reset()
      })

      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', required: true })
      const [day] = getSections(dateInput._element)

      day.focus()

      for (const digit of '14072026') {
        pressKey(document.activeElement, digit)
      }

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await new Promise(resolve => {
        setTimeout(resolve)
      })
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
    })

    it('should restore a date its limits reject, the way the field was created', async () => {
      fixtureEl.innerHTML = '<form><div id="mydateinput"></div></form>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', date: new Date(2026, 6, 20), maxDate: new Date(2026, 6, 14) })

      dateInput.clear()
      fixtureEl.querySelector('form').reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect([...getSections(dateInput._element)].map(section => section.textContent)).toEqual(['20', '07', '2026'])
      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(dateInput.getDate()).toBeNull()
    })

    it('should drop select all', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })

      expect(dateInput._element.classList.contains('form-date-time-all-selected')).toBeTrue()

      dateInput.reset()

      expect(dateInput._element.classList.contains('form-date-time-all-selected')).toBeFalse()
    })

    it('should drop the form listener on dispose', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<form><div id="mydateinput"></div></form>'
        const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', date: new Date(2026, 6, 14) })
        const spy = spyOn(dateInput, 'reset').and.callThrough()

        dateInput.dispose()
        fixtureEl.querySelector('form').reset()

        setTimeout(() => {
          expect(spy).not.toHaveBeenCalled()
          resolve()
        }, 10)
      })
    })
  })

  describe('setConfig', () => {
    it('should rebuild the component with the new config', () => {
      const dateInput = createDateInput()

      dateInput.setConfig({ format: 'yyyy-MM-dd', date: new Date(2026, 6, 14) })

      const [year] = getSections(dateInput._element)
      expect(year.getAttribute('aria-label')).toEqual('Year')
      expect(dateInput._element.querySelector('input[type="hidden"]').value).toEqual('2026-07-14')
    })
  })

  describe('data-api', () => {
    it('should initialise elements carrying the attribute on load', () => {
      fixtureEl.innerHTML = '<div data-coreui-date-input></div>'
      const element = fixtureEl.querySelector('div')

      window.dispatchEvent(new Event('load'))

      expect(DateInput.getInstance(element)).toBeInstanceOf(DateInput)
      DateInput.getInstance(element).dispose()
    })
  })

  describe('jQueryInterface', () => {
    it('should create a date input', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.dateInput = DateInput.jQueryInterface
      jQueryMock.elements = [div]

      jQueryMock.fn.dateInput.call(jQueryMock)

      expect(DateInput.getInstance(div)).not.toBeNull()
    })
    it('should pass the arguments to the method', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      jQueryMock.fn.dateInput = DateInput.jQueryInterface
      jQueryMock.elements = [div]

      const instance = DateInput.getOrCreateInstance(div)
      const spy = spyOn(instance, 'setConfig')

      jQueryMock.fn.dateInput.call(jQueryMock, 'setConfig', { disabled: true })

      expect(spy).toHaveBeenCalledWith({ disabled: true })
      instance.dispose()
    })
  })

  describe("datetime type", () => {
    const createDateTimeInput = (config = {}) => {
      fixtureEl.innerHTML = "<div id=\"mydatetimeinput\"></div>"
      return new DateInput(fixtureEl.querySelector("div"), { format: "dd.MM.yyyy HH:mm", type: "datetime", ...config })
    }

    it("should create date and time sections from the format", () => {
      const sections = getSections(createDateTimeInput()._element)

      expect(sections).toHaveSize(5)
      expect([...sections].map(section => section.dataset.coreuiSection))
        .toEqual(["day", "month", "year", "hour", "minute"])
    })

    it("should derive date and time sections from the locale", () => {
      fixtureEl.innerHTML = "<div></div>"
      const dateInput = new DateInput(fixtureEl.querySelector("div"), { locale: "pl-PL", type: "datetime" })

      expect([...getSections(dateInput._element)].map(section => section.dataset.coreuiSection))
        .toEqual(["day", "month", "year", "hour", "minute"])
    })

    it("should add a seconds section when asked", () => {
      fixtureEl.innerHTML = "<div></div>"
      const dateInput = new DateInput(fixtureEl.querySelector("div"), { locale: "pl-PL", seconds: true, type: "datetime" })

      expect([...getSections(dateInput._element)].map(section => section.dataset.coreuiSection))
        .toEqual(["day", "month", "year", "hour", "minute", "second"])
    })

    it("should keep the date-only sections on the default type", () => {
      fixtureEl.innerHTML = "<div></div>"
      const dateInput = new DateInput(fixtureEl.querySelector("div"), { locale: "pl-PL" })

      expect([...getSections(dateInput._element)].map(section => section.dataset.coreuiSection))
        .toEqual(["day", "month", "year"])
    })

    it("should name itself for screen readers", () => {
      expect(createDateTimeInput()._element.getAttribute("aria-label")).toEqual("Date and time input")
      expect(createDateInput()._element.getAttribute("aria-label")).toEqual("Date input")
    })

    it("should fill sections and the hidden input from the initial date", () => {
      const dateInput = createDateTimeInput({ date: new Date(2026, 6, 14, 14, 30) })

      expect(dateInput._element.querySelector("input[type=\"hidden\"]").value).toEqual("14.07.2026 14:30")
    })

    it("should keep the time part of an initial date string", () => {
      expect(createDateTimeInput({ date: "2026-07-14 14:30" }).getDate()).toEqual(new Date(2026, 6, 14, 14, 30))
    })

    it("should keep midnight on a date-only string", () => {
      expect(createDateTimeInput({ date: "2026-07-14" }).getDate()).toEqual(new Date(2026, 6, 14, 0, 0))
    })

    it("should emit dateChange with the full date and time when complete", () => {
      const dateInput = createDateTimeInput()
      const element = dateInput._element
      const spy = jasmine.createSpy("dateChange")
      element.addEventListener("dateChange.coreui.date-input", spy)

      const [day, month, year, hour, minute] = getSections(element)

      day.focus()
      pressKey(day, "4")
      pressKey(month, "7")
      for (const digit of "2026") {
        pressKey(year, digit)
      }

      pressKey(hour, "1")
      pressKey(hour, "4")
      pressKey(minute, "3")
      pressKey(minute, "0")

      expect(spy).toHaveBeenCalled()
      expect(spy.calls.mostRecent().args[0].date).toEqual(new Date(2026, 6, 4, 14, 30))
      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 4, 14, 30))
    })

    it("should clamp the day when the month changes", () => {
      const dateInput = createDateTimeInput({ date: new Date(2026, 0, 31, 12, 0) })
      const [day, month] = getSections(dateInput._element)

      month.focus()
      pressKey(month, "2")

      expect(day.textContent).toEqual("28")
      expect(dateInput.getDate()).toEqual(new Date(2026, 1, 28, 12, 0))
    })

    it("should fill all sections from a pasted date and time", () => {
      const dateInput = createDateTimeInput()
      const event = new Event("paste", { bubbles: true, cancelable: true })
      event.clipboardData = { getData: () => "14.07.2026 14:30" }
      getSections(dateInput._element)[0].dispatchEvent(event)

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14, 14, 30))
    })

    it("should parse a value in the locale's own date-time format", () => {
      fixtureEl.innerHTML = "<div></div>"
      const dateInput = new DateInput(fixtureEl.querySelector("div"), {
        date: "14/07/2026, 14:30:00",
        format: "dd.MM.yyyy HH:mm",
        locale: "en-GB",
        type: "datetime"
      })

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14, 14, 30))
    })

    it("should give the label back when the type goes back to date", () => {
      const dateInput = createDateTimeInput()

      expect(dateInput._element.getAttribute("aria-label")).toEqual("Date and time input")

      dateInput.setConfig({ type: "date" })

      expect(dateInput._element.getAttribute("aria-label")).toEqual("Date input")
    })

    it("should keep a label the page wrote", () => {
      const dateInput = createDateTimeInput({ ariaLabel: "Appointment" })

      expect(dateInput._element.getAttribute("aria-label")).toEqual("Appointment")
    })

    it("should keep the aria-label the page wrote on the element when the type changes", () => {
      fixtureEl.innerHTML = "<div aria-label=\"Appointment\"></div>"
      const dateInput = new DateInput(fixtureEl.querySelector("div"), { format: "dd.MM.yyyy HH:mm", type: "datetime" })

      expect(dateInput._element.getAttribute("aria-label")).toEqual("Appointment")

      dateInput.setConfig({ type: "date" })

      expect(dateInput._element.getAttribute("aria-label")).toEqual("Appointment")
    })
  })
})

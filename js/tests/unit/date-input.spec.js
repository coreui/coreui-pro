import { vi } from 'vitest'
import DateInput from '../../src/date-input.js'
import TimeInput from '../../src/time-input.js'
import Form from '../../src/form.js'
import { getFieldHandler } from '../../src/util/field-label.js'
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

    it('should submit no date while the field rejects it, as getDate does', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="date-input"></div></form>'
      const dateInputEl = fixtureEl.querySelector('.date-input')
      const dateInput = new DateInput(dateInputEl, {
        date: new Date(2026, 0, 15), format: 'dd.MM.yyyy', maxDate: new Date(2026, 0, 10), name: 'from'
      })

      expect(dateInput.getDate()).toBeNull()
      expect([...new FormData(fixtureEl.querySelector('#form')).entries()]).toEqual([['from', '']])

      dateInput.setConfig({ maxDate: null })

      expect([...new FormData(fixtureEl.querySelector('#form')).entries()]).toEqual([['from', '15.01.2026']])
    })

    it('should stop submitting once disposed', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="date-input"></div></form>'
      const dateInputEl = fixtureEl.querySelector('.date-input')
      const dateInput = new DateInput(dateInputEl, { date: new Date(2026, 0, 15), format: 'dd.MM.yyyy', name: 'ghost' })

      dateInput.dispose()

      expect([...new FormData(fixtureEl.querySelector('#form')).keys()]).toEqual([])
    })
  })

  describe('constraint validation', () => {
    const mountForm = (config, attributes = '') => {
      fixtureEl.innerHTML = `<form ${attributes}><div class="date-input"></div><button type="submit">Send</button></form>`
      const dateInput = new DateInput(fixtureEl.querySelector('.date-input'), { format: 'dd.MM.yyyy', name: 'when', ...config })

      return { dateInput, form: fixtureEl.querySelector('form'), input: fixtureEl.querySelector('.form-date-time > textarea') }
    }

    it('should keep the value in a textarea out of the tab order and away from assistive technologies', () => {
      const { input } = mountForm({})

      expect(input.tagName).toEqual('TEXTAREA')
      expect(input.tabIndex).toEqual(-1)
      expect(input.getAttribute('aria-hidden')).toEqual('true')
      expect(input.autocomplete).toEqual('off')
    })

    it('should make a required empty field, and a required field holding a rejected date, block the form', () => {
      const { dateInput, form } = mountForm({ required: true })

      expect(form.checkValidity()).toBeFalse()

      dateInput.setConfig({ date: new Date(2026, 0, 15), maxDate: new Date(2026, 0, 10) })

      expect(form.checkValidity()).toBeFalse()

      dateInput.setConfig({ maxDate: null })

      expect(form.checkValidity()).toBeTrue()
    })

    it('should leave a read-only or disabled field out of the form validation', () => {
      for (const config of [{ readonly: true }, { disabled: true }]) {
        const { form } = mountForm({ required: true, ...config })

        expect(form.checkValidity()).toBeTrue()
      }
    })

    it('should hand the focus the browser gives the value field to the first empty section', () => {
      const { dateInput } = mountForm({ date: new Date(2026, 0, 15) })

      dateInput.setConfig({ date: null })
      fixtureEl.querySelector('.form-date-time > textarea').focus()

      expect(document.activeElement).toEqual(fixtureEl.querySelector('.form-date-time-section'))
    })

    it('should mark itself invalid when a validation reports its value field, outside a submit as well', () => {
      const { form } = mountForm({ required: true }, 'novalidate')
      const host = fixtureEl.querySelector('.form-date-time')

      expect(form.checkValidity()).toBeFalse()
      expect(host).toHaveClass('is-invalid')
      expect([...getSections(host)].map(section => section.getAttribute('aria-invalid'))).toEqual(['true', 'true', 'true'])
      expect(host.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should judge the date a reset restores when a submit follows it in the same task', () => {
      const { dateInput, form } = mountForm({ date: new Date(2026, 0, 15), required: true })
      let submitted = false
      form.addEventListener('submit', event => {
        submitted = true
        event.preventDefault()
      })

      dateInput.clear()
      form.reset()
      form.requestSubmit()

      expect(submitted).toBeTrue()
    })

    it('should judge the date a reset restores under the current limits when a submit follows it in the same task', () => {
      const { dateInput, form } = mountForm({ date: new Date(2026, 0, 15), required: true })
      let submitted = false
      form.addEventListener('submit', event => {
        submitted = true
        event.preventDefault()
      })

      dateInput.setConfig({ maxDate: new Date(2026, 0, 10) })
      dateInput.clear()
      form.reset()
      form.requestSubmit()

      expect(submitted).toBeFalse()
    })

    it('should report a change of its value to the form from the value field, and stay silent when a reset puts the initial date back', async () => {
      const { dateInput, form } = mountForm({ date: new Date(2026, 0, 15) })
      const events = []
      form.addEventListener('input', event => events.push(`${event.type}:${event.target.tagName}`))
      form.addEventListener('change', event => events.push(`${event.type}:${event.target.tagName}`))

      dateInput.clear()

      expect(events).toEqual(['input:TEXTAREA', 'change:TEXTAREA'])

      events.length = 0
      form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(dateInput.getDate()).toEqual(new Date(2026, 0, 15))
      expect(events).toEqual([])
    })

    it('should not report a change while it is built or rebuilt with the same date', () => {
      const events = []
      const listener = event => events.push(event.type)
      fixtureEl.addEventListener('input', listener)
      fixtureEl.addEventListener('change', listener)

      const { dateInput } = mountForm({ date: new Date(2026, 0, 15) })
      dateInput.setConfig({ locale: 'en-US' })

      fixtureEl.removeEventListener('input', listener)
      fixtureEl.removeEventListener('change', listener)

      expect(events).toEqual([])
    })

    it('should hand the focus to the first empty section of a partly filled field', () => {
      const { input } = mountForm({})
      const [day, month] = fixtureEl.querySelectorAll('.form-date-time-section')

      day.focus()
      pressKey(day, '1')
      pressKey(day, '5')
      document.activeElement.blur()
      fixtureEl.querySelector('.form-date-time > textarea').focus()

      expect(input.isConnected).toBeTrue()
      expect(document.activeElement).toEqual(month)
    })

    it('should make an incomplete required field block the form, and a field that stops being read-only', () => {
      const { dateInput, form } = mountForm({ required: true, readonly: true })

      expect(form.checkValidity()).toBeTrue()

      dateInput.setConfig({ readonly: false })
      const [day] = fixtureEl.querySelectorAll('.form-date-time-section')
      day.focus()
      pressKey(day, '1')
      pressKey(day, '5')

      expect(form.checkValidity()).toBeFalse()
    })

    it('should make a required empty time field block the form', () => {
      fixtureEl.innerHTML = '<form><div class="time-input"></div></form>'
      // eslint-disable-next-line no-new
      new TimeInput(fixtureEl.querySelector('.time-input'), { required: true })

      expect(fixtureEl.querySelector('form').checkValidity()).toBeFalse()
    })

    it('should keep the success state of a valid-mode field after a validation that saw it empty', async () => {
      const { dateInput, form } = mountForm({ date: new Date(2026, 0, 15), required: true }, 'data-coreui-validate="valid" novalidate')
      const host = fixtureEl.querySelector('.form-date-time')
      form.addEventListener('submit', event => event.preventDefault())
      form.requestSubmit()
      await Promise.resolve()

      expect(host).toHaveClass('is-valid')

      dateInput.clear()
      form.checkValidity()

      expect(host).toHaveClass('is-invalid')

      const [day, month, year] = fixtureEl.querySelectorAll('.form-date-time-section')
      day.focus()
      for (const [section, keys] of [[day, '15'], [month, '01'], [year, '2026']]) {
        section.focus()
        for (const key of keys) {
          pressKey(section, key)
        }
      }

      expect(dateInput.getDate()).toEqual(new Date(2026, 0, 15))
      expect(host).toHaveClass('is-valid')
    })

    it('should keep focus on the section the user activates inside a wrapping label', () => {
      fixtureEl.innerHTML = '<form><label>Due <div class="date-input"></div></label></form>'
      // eslint-disable-next-line no-new
      new DateInput(fixtureEl.querySelector('.date-input'), { format: 'dd.MM.yyyy' })
      const year = fixtureEl.querySelector('[data-coreui-section="year"]')

      year.focus()
      year.click()

      expect(document.activeElement).toEqual(year)
    })

    it('should move focus to the first empty section when a label of the field is clicked, until it is disposed', () => {
      fixtureEl.innerHTML = '<label for="due" class="form-label">Due</label><span id="dueName" class="form-label">Due date</span><div class="date-input" id="due" aria-labelledby="dueName"></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('.date-input'), { format: 'dd.MM.yyyy' })
      const [day, month] = getSections(dateInput._element)

      fixtureEl.querySelector('label').click()

      expect(document.activeElement).toEqual(day)

      pressKey(day, '1')
      pressKey(day, '5')
      document.activeElement.blur()
      fixtureEl.querySelector('#dueName').click()

      expect(document.activeElement).toEqual(month)

      document.activeElement.blur()
      const element = dateInput._element
      dateInput.dispose()
      fixtureEl.querySelector('label').click()

      expect(document.activeElement).toEqual(document.body)
      expect(getFieldHandler(element)).toBeUndefined()
    })

    it('should describe the sections with the message under the field once the browser or the form plugin finds it empty', () => {
      for (const attributes of ['', 'data-coreui-validate novalidate']) {
        fixtureEl.innerHTML = `<form ${attributes}><div class="date-input"></div><div class="invalid-feedback">Pick a date.</div><button type="submit">Send</button></form>`
        const dateInput = new DateInput(fixtureEl.querySelector('.date-input'), { format: 'dd.MM.yyyy', name: 'when', required: true })
        const form = fixtureEl.querySelector('form')
        form.addEventListener('submit', event => event.preventDefault())

        form.requestSubmit()

        expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-describedby'))).toEqual(Array.from({ length: 3 }, () => fixtureEl.querySelector('.invalid-feedback').id))
      }
    })

    it('should announce the message under the field when the form plugin finds focus already on its first empty section', () => {
      fixtureEl.innerHTML = '<form data-coreui-validate novalidate><div class="date-input"></div><div class="invalid-feedback">Pick a date.</div></form>'
      // eslint-disable-next-line no-new
      new DateInput(fixtureEl.querySelector('.date-input'), { format: 'dd.MM.yyyy', name: 'when', required: true })
      const removeAnnouncers = () => {
        for (const announcer of document.querySelectorAll('[data-coreui-live-announcer]')) {
          announcer.remove()
        }
      }

      removeAnnouncers()
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
      let messages

      try {
        fixtureEl.querySelector('.form-date-time-section').focus()
        Form.getOrCreateInstance(fixtureEl.querySelector('form')).validate()
        vi.advanceTimersByTime(100)
        messages = [...document.querySelectorAll('[data-coreui-live-announcer] [aria-live="polite"] > *')].map(message => message.textContent)
      } finally {
        vi.useRealTimers()
        removeAnnouncers()
      }

      expect(document.activeElement).toEqual(fixtureEl.querySelector('.form-date-time-section'))
      expect(messages).toEqual(['Pick a date.'])
    })

    it('should be the control the browser and the form plugin focus when it is the first invalid one', () => {
      const { form } = mountForm({ required: true }, 'data-coreui-validate novalidate')
      let prevented
      form.addEventListener('submit', event => {
        prevented = event.defaultPrevented
        event.preventDefault()
      })

      form.requestSubmit()

      expect(prevented).toBeTrue()
      expect(document.activeElement).toEqual(fixtureEl.querySelector('.form-date-time-section'))

      Form.getInstance(form).dispose()
      document.activeElement.blur()

      expect(document.activeElement).toEqual(document.body)

      expect(form.reportValidity()).toBeFalse()
      expect(document.activeElement).toEqual(fixtureEl.querySelector('.form-date-time-section'))
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
      expect(dateInputEl.querySelectorAll('.form-date-time > textarea')).toHaveLength(1)

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

      fixtureEl.querySelector('#form').dispatchEvent(new Event('reset', { bubbles: true }))
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
    it('should create sections, separators and a value field from the format', () => {
      const dateInput = createDateInput()
      const element = dateInput._element

      expect(element.classList.contains('form-control')).toBeTrue()
      expect(element.classList.contains('form-date-time')).toBeTrue()
      expect(element.getAttribute('role')).toEqual('group')
      expect(getSections(element)).toHaveSize(3)
      expect(element.querySelectorAll('.form-date-time-separator')).toHaveSize(2)
      expect(element.querySelector('.form-date-time > textarea')).not.toBeNull()
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

    it('should fill sections and the value field from the initial date', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14), name: 'my-date' })
      const [day, month, year] = getSections(dateInput._element)

      expect(day.textContent).toEqual('14')
      expect(month.textContent).toEqual('07')
      expect(year.textContent).toEqual('2026')
      expect(dateInput._element.querySelector('.form-date-time > textarea').value).toEqual('14.07.2026')
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
      expect(element.querySelector('.form-date-time > textarea').value).toEqual('04.07.2026')
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

    it('should keep a typed year 0000 an entry in progress inside a shadow root', () => {
      fixtureEl.innerHTML = '<div></div>'
      const shadowRoot = fixtureEl.querySelector('div').attachShadow({ mode: 'open' })
      shadowRoot.innerHTML = '<div></div>'
      const element = shadowRoot.querySelector('div')
      const dateInput = new DateInput(element, { date: new Date(2026, 5, 15), format: 'dd.MM.yyyy' })
      const errors = []
      element.addEventListener('errorChange.coreui.date-input', event => errors.push(event.error))
      const year = getSections(element)[2]

      year.focus()
      for (const digit of '0000') {
        pressKey(year, digit)
      }

      expect(errors).toEqual(['incomplete'])
      expect(element.classList.contains('is-invalid')).toBeFalse()
      dateInput.dispose()
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
      expect(dateInput._element.querySelector('.form-date-time > textarea').value).toEqual('07.2026')
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

    it('should keep Home and End on the first and last section inside an RTL ancestor', () => {
      fixtureEl.innerHTML = '<div dir="rtl"><div id="mydateinput"></div></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('#mydateinput'), { format: 'dd.MM.yyyy' })
      const [day, , year] = getSections(dateInput._element)

      year.focus()
      pressKey(year, 'Home')
      expect(document.activeElement).toEqual(day)

      pressKey(day, 'End')
      expect(document.activeElement).toEqual(year)
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

    it.each(['altKey', 'ctrlKey', 'metaKey'])('should leave arrows, Home and End with %s to the browser', modifier => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day, month] = getSections(dateInput._element)

      month.focus()

      for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'ArrowUp', 'ArrowDown']) {
        const event = new KeyboardEvent('keydown', {
          key, bubbles: true, cancelable: true, [modifier]: true
        })

        month.dispatchEvent(event)

        expect(event.defaultPrevented).toBeFalse()
      }

      expect(document.activeElement).toEqual(month)
      expect([day, month].map(section => section.textContent)).toEqual(['14', '07'])
    })

    it('should leave a digit or a letter with Alt, Control or Meta to the browser', () => {
      const dateInput = createDateInput({ format: 'dd MMMM yyyy', locale: 'en-US' })
      const [day, month] = getSections(dateInput._element)

      for (const [section, key] of [[day, '4'], [month, 'j']]) {
        for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) {
          const event = new KeyboardEvent('keydown', {
            key, bubbles: true, cancelable: true, [modifier]: true
          })

          section.focus()
          section.dispatchEvent(event)

          expect(event.defaultPrevented).toBeFalse()
        }
      }

      expect(dateInput.getDate()).toBeNull()
      expect(day.getAttribute('aria-valuenow')).toBeNull()
    })

    it('should type a character a modifier composed once it arrives as text', () => {
      const dateInput = createDateInput({ format: 'dd MMMM yyyy', locale: 'cs-CZ' })
      const [, month] = getSections(dateInput._element)
      const keydown = new KeyboardEvent('keydown', {
        key: 'ú', bubbles: true, cancelable: true, altKey: true
      })

      month.focus()
      month.dispatchEvent(keydown)

      expect(keydown.defaultPrevented).toBeFalse()
      expect(month.getAttribute('aria-valuenow')).toBeNull()

      month.dispatchEvent(new InputEvent('beforeinput', {
        data: 'ú', inputType: 'insertText', bubbles: true, cancelable: true
      }))

      expect(month.getAttribute('aria-valuenow')).toEqual('2')
    })

    it('should leave Alt, Control or Meta keys alone once the whole value is selected', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'a', { ctrlKey: true })

      for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) {
        const event = new KeyboardEvent('keydown', {
          key: '4', bubbles: true, cancelable: true, [modifier]: true
        })

        day.dispatchEvent(event)

        expect(event.defaultPrevented).toBeFalse()
      }

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
      expect(dateInput._element.classList.contains('form-date-time-all-selected')).toBeTrue()
    })

    it('should leave Control, Meta and Alt keys of a read-only field to the browser', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14), readonly: true })
      const [day] = getSections(dateInput._element)

      for (const [key, modifier] of [['c', 'ctrlKey'], ['c', 'metaKey'], ['1', 'altKey']]) {
        const event = new KeyboardEvent('keydown', {
          key, bubbles: true, cancelable: true, [modifier]: true
        })

        day.focus()
        day.dispatchEvent(event)

        expect(event.defaultPrevented).toBeFalse()
      }
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

    it('should read a two-digit year pasted into a four-digit year as that year', () => {
      const dateInput = createDateInput()
      const [day, , year] = getSections(dateInput._element)

      paste(day, '15.06.26')

      expect(year.textContent).toEqual('0026')
      expect(dateInput.getDate()).toEqual(new Date('0026-06-15T00:00'))
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
      fixtureEl.querySelector('form').addEventListener('submit', event => event.preventDefault())
      return new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', ...config })
    }

    it('should apply the valid and invalid config options', () => {
      const invalidInput = createDateInput({ invalid: true })
      expect(invalidInput._element.classList.contains('is-invalid')).toBeTrue()

      const validInput = createDateInput({ valid: true })
      expect(validInput._element.classList.contains('is-valid')).toBeTrue()
    })

    it('should take no state from an aria-invalid the page writes on the element', () => {
      fixtureEl.innerHTML = '<div aria-invalid="true"></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', valid: true })

      expect(dateInput._element.classList.contains('is-valid')).toBeTrue()
      expect([...getSections(dateInput._element)].map(section => section.hasAttribute('aria-invalid'))).toEqual([false, false, false])
      expect(dateInput._element.getAttribute('aria-invalid')).toEqual('true')
    })

    it('should not draw a field invalid on its own as valid', () => {
      for (const config of [{ date: new Date(2026, 6, 20), maxDate: new Date(2026, 6, 14) }, { invalid: true }]) {
        const dateInput = createDateInput({ valid: true, ...config })

        expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
        expect(dateInput._element.classList.contains('is-valid')).toBeFalse()
        dateInput.dispose()
      }
    })

    it('should take the state from validationState, and let it win over invalid and valid', () => {
      const states = [
        [{ validationState: 'invalid' }, 'is-invalid'],
        [{ validationState: 'valid' }, 'is-valid'],
        [{ validationState: 'warning' }, 'is-warning'],
        [{ validationState: 'valid', invalid: true }, 'is-valid'],
        [{ invalid: true, valid: true }, 'is-invalid'],
        [{ validationState: '' }, null],
        [{ validationState: undefined }, null]
      ]

      for (const [config, className] of states) {
        const dateInput = createDateInput(config)
        const stateClasses = [...dateInput._element.classList].filter(name => name.startsWith('is-'))

        expect(stateClasses).toEqual(className ? [className] : [])
        expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-invalid'))).toEqual(Array.from({ length: 3 }, () => (className === 'is-invalid' ? 'true' : null)))
        dateInput.dispose()
      }
    })

    it('should block the submit while the given state is invalid, with the message shown for the field', () => {
      fixtureEl.innerHTML = '<form><div class="date-input"></div><div class="invalid-feedback">Already booked.</div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('.date-input'), { date: new Date(2026, 6, 14), format: 'dd.MM.yyyy', validationState: 'invalid' })
      const field = fixtureEl.querySelector('.form-date-time > textarea')

      expect(form.checkValidity()).toBeFalse()
      expect(field.validationMessage).toEqual('Already booked.')

      for (const state of ['valid', 'warning', undefined]) {
        dateInput.setConfig({ validationState: state })

        expect(form.checkValidity()).toBeTrue()
      }
    })

    it('should block with a generic message when the field shows none', () => {
      fixtureEl.innerHTML = '<form><div class="date-input"></div></form>'
      // eslint-disable-next-line no-new
      new DateInput(fixtureEl.querySelector('.date-input'), { format: 'dd.MM.yyyy', invalid: true })

      expect(fixtureEl.querySelector('.form-date-time > textarea').validationMessage).toEqual('Invalid value.')
    })

    it('should show a given invalid state on a disabled field without blocking the submit', () => {
      fixtureEl.innerHTML = '<form><div class="date-input"></div></form>'
      const dateInput = new DateInput(fixtureEl.querySelector('.date-input'), { disabled: true, format: 'dd.MM.yyyy', validationState: 'invalid' })

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(fixtureEl.querySelector('.form-date-time > textarea').validity.valid).toBeTrue()
    })

    it('should leave a custom validity the page set on the value field alone', () => {
      fixtureEl.innerHTML = '<form><div class="date-input"></div></form>'
      const dateInput = new DateInput(fixtureEl.querySelector('.date-input'), { format: 'dd.MM.yyyy' })
      const field = fixtureEl.querySelector('.form-date-time > textarea')

      field.setCustomValidity('Taken.')
      dateInput.setConfig({ validationState: 'invalid' })
      dateInput.setConfig({ validationState: undefined })

      expect(field.validationMessage).toEqual('Taken.')
    })

    it('should draw a given valid state over a reported error, while the browser still blocks the submit', () => {
      const dateInput = createInForm({ required: true })
      const form = fixtureEl.querySelector('form')

      form.requestSubmit()

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()

      dateInput.setConfig({ validationState: 'valid' })

      expect(dateInput._element.classList.contains('is-valid')).toBeTrue()
      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
      expect([...getSections(dateInput._element)].map(section => section.hasAttribute('aria-invalid'))).toEqual([false, false, false])
      expect(form.checkValidity()).toBeFalse()
    })

    it('should take a state class the markup carries as the given state and block with it', () => {
      fixtureEl.innerHTML = '<form><div class="is-invalid"></div><div class="invalid-feedback">Already booked.</div></form>'
      const dateInput = new DateInput(fixtureEl.querySelector('.is-invalid'), { date: new Date(2026, 6, 14), format: 'dd.MM.yyyy' })

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(getSections(dateInput._element)[0].getAttribute('aria-invalid')).toEqual('true')
      expect(fixtureEl.querySelector('form').checkValidity()).toBeFalse()
    })

    it('should keep a given state through changes made by code', () => {
      fixtureEl.innerHTML = '<div class="is-invalid"></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { date: new Date(2026, 6, 14), format: 'dd.MM.yyyy' })

      dateInput.setConfig({ date: new Date(2026, 6, 15) })
      dateInput.clear()
      dateInput.reset()
      dateInput.setConfig({ locale: 'en-US' })

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
    })

    it.each([
      ['a typed digit', section => {
        section.focus()
        pressKey(section, '2')
      }],
      ['an arrow', section => {
        section.focus()
        pressKey(section, 'ArrowUp')
      }],
      ['Delete', section => {
        section.focus()
        pressKey(section, 'Delete')
      }],
      ['a paste', section => {
        const event = new Event('paste', { bubbles: true, cancelable: true })
        event.clipboardData = { getData: () => '20.07.2026' }
        section.dispatchEvent(event)
      }],
      ['Backspace over the whole selected field', section => {
        section.focus()
        pressKey(section, 'a', { ctrlKey: true })
        pressKey(section, 'Backspace')
      }]
    ])('should drop a given state and a state class the markup carried on %s', (_, edit) => {
      for (const markup of ['<div class="is-invalid"></div>', '<div></div>']) {
        fixtureEl.innerHTML = `<form>${markup}</form>`
        const dateInput = new DateInput(fixtureEl.querySelector('form > div'), { date: new Date(2026, 6, 14), format: 'dd.MM.yyyy', ...(markup.includes('is-invalid') ? {} : { validationState: 'invalid' }) })

        edit(getSections(dateInput._element)[0])

        expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
        expect(fixtureEl.querySelector('form').checkValidity()).toBeTrue()
        dateInput.dispose()
      }
    })

    it('should drop a given state on a paste that inputDateParse reads', () => {
      fixtureEl.innerHTML = '<form><div></div></form>'
      const dateInput = new DateInput(fixtureEl.querySelector('form > div'), {
        date: new Date(2026, 6, 14), format: 'dd.MM.yyyy', inputDateParse: () => new Date(2026, 6, 20), validationState: 'invalid'
      })
      const paste = new Event('paste', { bubbles: true, cancelable: true })
      paste.clipboardData = { getData: () => 'next Monday' }

      getSections(dateInput._element)[0].dispatchEvent(paste)

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 20))
      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
      expect(fixtureEl.querySelector('form').checkValidity()).toBeTrue()
    })

    it('should keep the given state through user actions that leave the date as it is', () => {
      fixtureEl.innerHTML = '<form><div class="is-invalid"></div><div class="date-input"></div></form>'
      const dated = new DateInput(fixtureEl.querySelector('.is-invalid'), { date: new Date(2026, 6, 14), format: 'dd.MM.yyyy' })
      const empty = new DateInput(fixtureEl.querySelector('.date-input'), { format: 'dd.MM.yyyy', validationState: 'invalid' })
      const paste = new Event('paste', { bubbles: true, cancelable: true })
      paste.clipboardData = { getData: () => '14.07.2026' }

      getSections(dated._element)[0].dispatchEvent(paste)

      const [day] = getSections(empty._element)
      day.focus()
      pressKey(day, 'Delete')
      pressKey(day, 'a', { ctrlKey: true })
      pressKey(day, 'Backspace')

      expect(dated._element.classList.contains('is-invalid')).toBeTrue()
      expect(empty._element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should not block with a given invalid state while the field is read-only or disabled, and stop blocking once the state goes', () => {
      fixtureEl.innerHTML = '<form><div></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('form > div'), {
        date: new Date(2026, 6, 14), format: 'dd.MM.yyyy', readonly: true, validationState: 'invalid'
      })

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(form.checkValidity()).toBeTrue()

      dateInput.setConfig({ readonly: false })

      expect(form.checkValidity()).toBeFalse()

      dateInput.setConfig({ disabled: true })
      dateInput.setConfig({ disabled: false, validationState: null })

      expect(form.checkValidity()).toBeTrue()
    })

    it('should leave a state class of its own that the markup carried', () => {
      fixtureEl.innerHTML = '<div class="is-warning"></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', validationState: 'warning' })

      dateInput.setConfig({ validationState: null })

      expect(dateInput._element.classList.contains('is-warning')).toBeTrue()
    })

    it('should let the options win over a class the markup carries, and read a valid class too', () => {
      fixtureEl.innerHTML = '<div id="first" class="is-invalid"></div><div id="second" class="is-valid"></div>'
      const first = new DateInput(fixtureEl.querySelector('#first'), { format: 'dd.MM.yyyy', validationState: 'valid' })
      const second = new DateInput(fixtureEl.querySelector('#second'), { format: 'dd.MM.yyyy' })

      expect(first._element.classList.contains('is-valid')).toBeTrue()
      expect(first._element.classList.contains('is-invalid')).toBeFalse()
      expect(second._element.classList.contains('is-valid')).toBeTrue()
    })

    it('should show what a native control shows after a submit with formnovalidate', () => {
      fixtureEl.innerHTML = '<form data-coreui-validate><input class="form-control" required><div class="date-input"></div><button type="submit" formnovalidate>Send</button></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('.date-input'), { format: 'dd.MM.yyyy', required: true })

      form.addEventListener('submit', event => event.preventDefault())
      form.querySelector('button').click()

      expect(fixtureEl.querySelector('input').matches(':user-invalid')).toBeTrue()
      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should drop the given state before the change events, so a state the page sets in them stays', () => {
      fixtureEl.innerHTML = '<form><div></div></form>'
      const element = fixtureEl.querySelector('form > div')
      const dateInput = new DateInput(element, { date: new Date(2026, 6, 14), format: 'dd.MM.yyyy', validationState: 'invalid' })
      const seen = []

      for (const type of ['input', 'change']) {
        document.addEventListener(type, event => seen.push(event.target.validity.valid), { capture: true, once: true })
      }

      element.addEventListener('dateChange.coreui.date-input', () => dateInput.setConfig({ validationState: 'warning' }))
      getSections(element)[0].focus()
      pressKey(getSections(element)[0], 'ArrowUp')

      expect(seen).toEqual([true, true])
      expect(element.classList.contains('is-warning')).toBeTrue()
    })

    it('should not give a state class back on dispose once the user dropped it', () => {
      fixtureEl.innerHTML = '<div class="is-invalid my-own"></div>'
      const element = fixtureEl.querySelector('div')
      const dateInput = new DateInput(element, { date: new Date(2026, 6, 14), format: 'dd.MM.yyyy' })

      getSections(element)[0].focus()
      pressKey(getSections(element)[0], 'ArrowUp')
      dateInput.dispose()

      expect(element.className).toEqual('my-own')
    })

    it('should change the state through setConfig without rebuilding the field, and drop the class the markup carried', () => {
      fixtureEl.innerHTML = '<div class="is-invalid"></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { date: new Date(2026, 6, 14), format: 'dd.MM.yyyy' })
      const [day] = getSections(dateInput._element)

      dateInput.setConfig({ valid: true })

      expect(getSections(dateInput._element)[0]).toBe(day)
      expect(dateInput._element.classList.contains('is-valid')).toBeTrue()
      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()

      dateInput.setConfig({ validationState: undefined, valid: false })

      expect([...dateInput._element.classList].filter(name => name.startsWith('is-'))).toEqual([])
    })

    it('should keep one value field for its whole life, with what the page and the browser recorded on it', () => {
      const dateInput = createInForm({ required: true }, 'data-coreui-validate novalidate')
      const field = dateInput._element.querySelector('textarea')

      fixtureEl.querySelector('form').requestSubmit()

      expect(field.matches(':user-invalid')).toBeTrue()

      field.setCustomValidity('Pick a weekday.')
      dateInput.setConfig({ locale: 'en-US', minDate: new Date(2026, 0, 1) })

      expect(dateInput._element.querySelector('textarea')).toBe(field)
      expect(field.matches(':user-invalid')).toBeTrue()
      expect(field.validationMessage).toEqual('Pick a weekday.')
      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()

      dateInput.setConfig({ name: 'when' })
      dateInput.setConfig({ name: null })

      expect(field.hasAttribute('name')).toBeFalse()
    })

    it('should drop a given state on a native form reset', async () => {
      fixtureEl.innerHTML = '<form><div class="is-invalid"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('form > div'), { date: new Date(2026, 6, 14), format: 'dd.MM.yyyy' })

      form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
      expect(form.checkValidity()).toBeTrue()
    })

    it.each([['in a reset listener', true], ['in the same task', false]])('should keep a state the page gives after a native reset started, %s', async (_, inListener) => {
      fixtureEl.innerHTML = '<form><div class="is-valid"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('form > div'), { date: new Date(2026, 6, 14), format: 'dd.MM.yyyy' })

      if (inListener) {
        form.addEventListener('reset', () => dateInput.setConfig({ validationState: 'invalid' }))
        form.reset()
      } else {
        form.reset()
        dateInput.setConfig({ validationState: 'invalid' })
      }

      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(form.checkValidity()).toBeFalse()
    })

    it('should keep the form plugin off its value field and show what it reports on the field', () => {
      fixtureEl.innerHTML = '<form data-coreui-validate novalidate><div class="date-input"></div></form>'
      const dateInput = new DateInput(fixtureEl.querySelector('.date-input'), { format: 'dd.MM.yyyy', required: true })
      const field = dateInput._element.querySelector('textarea')

      Form.getOrCreateInstance(fixtureEl.querySelector('form')).validate()

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(field.classList.contains('is-invalid')).toBeFalse()
      expect(field.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should show what a native control shows when the page takes the result over in validate.coreui.form', () => {
      fixtureEl.innerHTML = '<form data-coreui-validate novalidate><input class="form-control" required><div class="date-input"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('.date-input'), { format: 'dd.MM.yyyy', required: true })
      const reported = vi.fn()

      form.addEventListener('validate.coreui.form', event => event.preventDefault())
      form.addEventListener('submit', event => event.preventDefault())
      form.addEventListener('invalid', reported, true)
      Form.getOrCreateInstance(form)
      form.requestSubmit()

      expect(reported).not.toHaveBeenCalled()
      expect(fixtureEl.querySelector('input').matches(':user-invalid')).toBeTrue()
      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should mark a required empty field as invalid when a submit reports it', () => {
      const dateInput = createInForm({ required: true })

      fixtureEl.querySelector('form').requestSubmit()

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should not mark a field on a submit event no validation ran for', async () => {
      const dateInput = createInForm({ required: true })

      fixtureEl.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()

      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
    })

    it('should expose the invalid state on every section, never on the group, and drop it once the date is valid', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 20), maxDate: new Date(2026, 6, 14) })
      const invalid = () => [...getSections(dateInput._element)].map(element => element.getAttribute('aria-invalid'))

      expect(invalid()).toEqual(['true', 'true', 'true'])
      expect(dateInput._element.hasAttribute('aria-invalid')).toBeFalse()

      dateInput.setConfig({ date: new Date(2026, 6, 10) })

      expect(invalid()).toEqual([null, null, null])
    })

    it('should expose the invalid state of a required empty field when a submit reports it', () => {
      const dateInput = createInForm({ required: true })

      fixtureEl.querySelector('form').requestSubmit()

      expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-invalid'))).toEqual(['true', 'true', 'true'])
    })

    it('should leave an aria-invalid the page set on the element alone, through an invalid date and dispose', () => {
      fixtureEl.innerHTML = '<div aria-invalid="grammar"></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { date: new Date(2026, 6, 10), format: 'dd.MM.yyyy', maxDate: new Date(2026, 6, 14) })
      const element = dateInput._element
      const invalid = () => [element, ...getSections(element)].map(item => item.getAttribute('aria-invalid'))

      expect(invalid()).toEqual(['grammar', null, null, null])

      dateInput.setConfig({ date: new Date(2026, 6, 20) })

      expect(invalid()).toEqual(['grammar', 'true', 'true', 'true'])

      dateInput.dispose()

      expect(element.getAttribute('aria-invalid')).toEqual('grammar')
    })

    it('should leave no aria-invalid of its own on the element after dispose', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 20), maxDate: new Date(2026, 6, 14) })
      const element = dateInput._element

      dateInput.dispose()

      expect(element.hasAttribute('aria-invalid')).toBeFalse()
    })

    it.each([{ disabled: true }, { readonly: true }])('should not flag an empty required field as missing on submit when %o', config => {
      const dateInput = createInForm({ required: true, ...config })

      fixtureEl.querySelector('form').requestSubmit()

      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
      expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-invalid'))).toEqual([null, null, null])
    })

    it('should keep a required empty field invalid after submit until it holds a date', () => {
      const dateInput = createInForm({ required: true })
      const [day, month, year] = getSections(dateInput._element)
      const invalid = () => [...getSections(dateInput._element)].map(item => item.getAttribute('aria-invalid'))

      fixtureEl.querySelector('form').requestSubmit()
      day.focus()
      day.blur()

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
      expect(invalid()).toEqual(['true', 'true', 'true'])

      day.focus()
      pressKey(day, '1')
      pressKey(day, '4')
      pressKey(month, '0')
      pressKey(month, '7')
      for (const digit of '2026') {
        pressKey(year, digit)
      }

      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
      expect(invalid()).toEqual([null, null, null])
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

    it('should describe only the first section of a field the page marks with aria-invalid alone', () => {
      fixtureEl.innerHTML = '<div aria-describedby="help" aria-invalid="true"></div><div id="help">Pick a date</div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy' })

      expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-describedby'))).toEqual(['help', null, null])
    })

    it('should describe every section with the message shown under the field while it is invalid', () => {
      fixtureEl.innerHTML = '<div class="form-field"><div aria-describedby="help"></div><div id="help">Pick a date before 15.07.2026</div><div class="invalid-feedback">Too late</div></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('[aria-describedby]'), { date: new Date(2026, 6, 10), format: 'dd.MM.yyyy', maxDate: new Date(2026, 6, 14) })
      const feedback = fixtureEl.querySelector('.invalid-feedback')
      const describedBy = () => [...getSections(dateInput._element)].map(section => section.getAttribute('aria-describedby'))

      expect(describedBy()).toEqual(['help', null, null])

      dateInput.setConfig({ date: new Date(2026, 6, 20) })

      expect(describedBy()).toEqual(Array.from({ length: 3 }, () => `help ${feedback.id}`))

      dateInput.setConfig({ date: new Date(2026, 6, 10) })

      expect(describedBy()).toEqual(['help', null, null])
    })

    it('should describe the sections with a message the page adds on errorChange', () => {
      fixtureEl.innerHTML = '<div class="form-field"><div class="date-input"></div></div>'
      const element = fixtureEl.querySelector('.date-input')
      const dateInput = new DateInput(element, { date: new Date(2026, 6, 10), format: 'dd.MM.yyyy', maxDate: new Date(2026, 6, 14) })

      element.addEventListener('errorChange.coreui.date-input', event => {
        fixtureEl.querySelector('.invalid-feedback')?.remove()

        if (event.error) {
          element.insertAdjacentHTML('afterend', '<div id="late" class="invalid-feedback">Too late</div>')
        }
      })
      dateInput.setConfig({ date: new Date(2026, 6, 20) })

      expect([...getSections(element)].map(section => section.getAttribute('aria-describedby'))).toEqual(['late', 'late', 'late'])
    })

    it('should describe the sections only with the message the page shows for the error', () => {
      fixtureEl.innerHTML = '<div class="form-field"><div class="date-input"></div><div id="early" class="invalid-feedback" hidden>Too early</div><div id="late" class="invalid-feedback" hidden>Too late</div></div>'
      const element = fixtureEl.querySelector('.date-input')
      const dateInput = new DateInput(element, {
        date: new Date(2026, 6, 10), format: 'dd.MM.yyyy', maxDate: new Date(2026, 6, 14), minDate: new Date(2026, 6, 1)
      })

      element.addEventListener('errorChange.coreui.date-input', event => {
        fixtureEl.querySelector('#early').hidden = event.error !== 'minDate'
        fixtureEl.querySelector('#late').hidden = event.error !== 'maxDate'
      })
      dateInput.setConfig({ date: new Date(2026, 6, 20) })

      expect([...getSections(element)].map(section => section.getAttribute('aria-describedby'))).toEqual(['late', 'late', 'late'])
    })

    it('should not repeat a message the page already describes the field with', () => {
      fixtureEl.innerHTML = '<div aria-describedby="late"></div><div id="late" class="invalid-feedback">Too late</div>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', invalid: true })

      expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-describedby'))).toEqual(['late', 'late', 'late'])
    })

    it('should describe the sections with the message named in data-coreui-invalid-feedback', () => {
      fixtureEl.innerHTML = '<div data-coreui-invalid-feedback="late"></div><div class="invalid-feedback">Sibling</div><p id="late">Too late</p>'
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', invalid: true })

      expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-describedby'))).toEqual(['late', 'late', 'late'])
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

    it('should mark a filled field as valid on submit of a form opted into valid styling', () => {
      const dateInput = createInForm({ required: true, date: new Date(2026, 6, 14) }, 'data-coreui-validate="valid"')

      fixtureEl.querySelector('form').requestSubmit()

      expect(dateInput._element.classList.contains('is-valid')).toBeTrue()
      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
    })

    it('should keep the valid state while the value it judged holds', () => {
      const dateInput = createInForm({ required: true, date: new Date(2026, 6, 14) }, 'data-coreui-validate="valid"')

      fixtureEl.querySelector('form').requestSubmit()
      dateInput.setConfig({ date: new Date(2026, 6, 15) })

      expect(dateInput._element.classList.contains('is-valid')).toBeTrue()
    })

    it('should drop the valid state once the field is emptied', () => {
      const dateInput = createInForm({ required: true, date: new Date(2026, 6, 14) }, 'data-coreui-validate="valid"')

      fixtureEl.querySelector('form').requestSubmit()
      dateInput.clear()

      expect(dateInput._element.classList.contains('is-valid')).toBeFalse()
    })

    it('should not mark a filled field as valid when the form does not opt into valid styling', () => {
      const dateInput = createInForm({ required: true, date: new Date(2026, 6, 14) })

      fixtureEl.querySelector('form').requestSubmit()

      expect(dateInput._element.classList.contains('is-valid')).toBeFalse()
      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
    })

    it('should apply the state even when data-coreui-validate is added during the same submit', () => {
      fixtureEl.innerHTML = '<form novalidate><div id="mydateinput"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', required: true })
      form.addEventListener('submit', event => {
        event.preventDefault()
        form.setAttribute('data-coreui-validate', '')
      })

      form.requestSubmit()

      expect(dateInput._element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should not touch validation classes when the form is not validated yet', () => {
      fixtureEl.innerHTML = '<form novalidate><div id="mydateinput"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', required: true })
      form.addEventListener('submit', event => event.preventDefault())

      form.requestSubmit()

      expect(dateInput._element.classList.contains('is-invalid')).toBeFalse()
      expect(dateInput._element.classList.contains('is-valid')).toBeFalse()
    })

    it('should stop listening to the form on dispose', () => {
      const dateInput = createInForm({ required: true })
      const element = dateInput._element

      dateInput.dispose()
      fixtureEl.querySelector('form').requestSubmit()

      expect(element.classList.contains('is-invalid')).toBeFalse()
    })

    it('should mark the field once after re-initialization', () => {
      const element = createInForm({ required: true })._element
      new DateInput(element, { format: 'dd.MM.yyyy', required: true }) // eslint-disable-line no-new
      const add = spyOn(element.classList, 'add').and.callThrough()

      fixtureEl.querySelector('form').requestSubmit()

      expect(add.calls.allArgs()).toEqual([['is-invalid']])
      expect(element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should keep following another field in the same form', () => {
      fixtureEl.innerHTML = '<form data-coreui-validate><div id="first"></div><div id="second"></div></form>'
      const first = new DateInput(fixtureEl.querySelector('#first'), { format: 'dd.MM.yyyy', required: true })
      const second = new DateInput(fixtureEl.querySelector('#second'), { format: 'dd.MM.yyyy', required: true })

      first.dispose()
      fixtureEl.querySelector('form').requestSubmit()

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

    it('should report minDate and mark the field invalid for a date before year 1', () => {
      fixtureEl.innerHTML = '<div id="mydateinput"></div>'
      const element = fixtureEl.querySelector('div')
      const errors = []
      element.addEventListener('errorChange.coreui.date-input', event => errors.push(event.error))
      const dateInput = new DateInput(element, { date: new Date('0000-06-15T00:00'), format: 'dd.MM.yyyy' })

      expect(errors).toEqual(['minDate'])
      expect(element.classList.contains('is-invalid')).toBeTrue()
      expect(getSections(element)[0].getAttribute('aria-invalid')).toEqual('true')
      expect(dateInput.getDate()).toBeNull()

      const [day] = getSections(element)
      day.focus()
      day.blur()

      expect(dateInput.getDate().getFullYear()).toBe(1)
      expect(errors.at(-1)).toBeNull()
      expect(element.classList.contains('is-invalid')).toBeFalse()
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
      expect(dateInput._element.querySelector('.form-date-time > textarea').disabled).toBeTrue()
    })

    it('should leave the focus where it is when a label of a disabled field is clicked', () => {
      fixtureEl.innerHTML = '<label for="due" class="form-label">Due</label><div class="date-input" id="due"></div>'
      const dateInput = new DateInput(fixtureEl.querySelector('.date-input'), { disabled: true, format: 'dd.MM.yyyy' })

      fixtureEl.querySelector('label').click()

      expect(document.activeElement).toEqual(document.body)
      expect(getSections(dateInput._element)[0].tabIndex).toEqual(-1)
    })

    it('should leave the focus where it is when a label of a field in a disabled fieldset is clicked', () => {
      fixtureEl.innerHTML = '<fieldset disabled><label for="due">Due</label><div class="date-input" id="due"></div></fieldset>'
      const dateInput = new DateInput(fixtureEl.querySelector('.date-input'), { format: 'dd.MM.yyyy' })

      fixtureEl.querySelector('label').click()

      expect(document.activeElement).toEqual(document.body)
      dateInput.dispose()
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
    it('should empty all sections and the value field', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14) })

      dateInput.clear()

      expect(dateInput.getDate()).toBeNull()
      expect(getSections(dateInput._element)[0].textContent).toEqual('DD')
      expect(dateInput._element.querySelector('.form-date-time > textarea').value).toEqual('')
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
          expect(dateInput._element.querySelector('.form-date-time > textarea').value).toEqual('14.07.2026')
          resolve()
        }, 10)
      })
    })

    it('should drop the invalid verdict of a submit on a native form reset', async () => {
      fixtureEl.innerHTML = '<form data-coreui-validate><div id="mydateinput"></div></form>'
      const form = fixtureEl.querySelector('form')
      const dateInput = new DateInput(fixtureEl.querySelector('div'), { format: 'dd.MM.yyyy', required: true })
      const invalid = () => [dateInput._element, ...getSections(dateInput._element)].map(item => item.getAttribute('aria-invalid'))

      form.requestSubmit()

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

      form.addEventListener('submit', event => event.preventDefault())
      form.requestSubmit()

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
      form.requestSubmit()
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
      form.requestSubmit()
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

      form.addEventListener('submit', event => event.preventDefault())
      form.reset()
      form.requestSubmit()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

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

      form.requestSubmit()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

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
      expect(dateInput._element.querySelector('.form-date-time > textarea').value).toEqual('2026-07-14')
    })

    it('should keep the date the user typed when the new config sets none', () => {
      const dateInput = createDateInput({ locale: 'pl-PL' })
      const onChange = vi.fn()

      getSections(dateInput._element)[0].focus()
      for (const digit of '14072026') {
        pressKey(document.activeElement, digit)
      }

      dateInput._element.addEventListener('dateChange.coreui.date-input', onChange)
      dateInput.setConfig({ minDate: new Date(2026, 6, 1) })
      dateInput.setConfig({ format: null, locale: 'en-GB' })

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
      expect([...getSections(dateInput._element)].map(section => section.textContent)).toEqual(['14', '07', '2026'])
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should keep the typed date over the one the field started with', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 1) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '1')
      pressKey(day, '4')
      dateInput.setConfig({ maxDate: new Date(2026, 11, 31) })

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
    })

    it('should take a typed date its new limits accept', () => {
      const dateInput = createDateInput({ maxDate: new Date(2026, 6, 10) })

      getSections(dateInput._element)[0].focus()
      for (const digit of '14072026') {
        pressKey(document.activeElement, digit)
      }

      expect(dateInput.getDate()).toBeNull()

      const onChange = vi.fn()

      document.activeElement.blur()
      dateInput._element.addEventListener('dateChange.coreui.date-input', onChange)
      dateInput.setConfig({ maxDate: new Date(2026, 6, 31) })

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange.mock.calls[0][0].date).toEqual(new Date(2026, 6, 14))
    })

    it('should keep a partly typed date when the sections stay the same', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 1) })
      const [day] = getSections(dateInput._element)
      const onChange = vi.fn()

      day.focus()
      pressKey(day, 'Backspace')
      dateInput._element.addEventListener('dateChange.coreui.date-input', onChange)
      dateInput.setConfig({ maxDate: new Date(2026, 11, 31) })

      expect([...getSections(dateInput._element)].map(section => section.textContent)).toEqual(['DD', '07', '2026'])
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should clear a partly typed date when the sections change', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 1) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, 'Backspace')
      dateInput.setConfig({ format: 'yyyy-MM-dd' })

      expect([...getSections(dateInput._element)].map(section => section.getAttribute('aria-valuenow'))).toEqual([null, null, null])
    })

    it('should rebuild from the date it shows when the sections change', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 14, 9, 30) })
      const onChange = vi.fn()

      dateInput._element.addEventListener('dateChange.coreui.date-input', onChange)
      dateInput.setConfig({ format: 'dd.MM.yyyy HH:mm' })

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 14))
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should reset to the date the field was created with after keeping a typed one', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 1) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '1')
      pressKey(day, '4')
      dateInput.setConfig({ maxDate: new Date(2026, 11, 31) })
      dateInput.reset()

      expect(dateInput.getDate()).toEqual(new Date(2026, 6, 1))
    })

    it('should replace the typed date with the one the new config sets', () => {
      const dateInput = createDateInput({ date: new Date(2026, 6, 1) })
      const [day] = getSections(dateInput._element)

      day.focus()
      pressKey(day, '1')
      pressKey(day, '4')
      dateInput.setConfig({ date: new Date(2026, 7, 20) })

      expect(dateInput.getDate()).toEqual(new Date(2026, 7, 20))
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

    it("should fill sections and the value field from the initial date", () => {
      const dateInput = createDateTimeInput({ date: new Date(2026, 6, 14, 14, 30) })

      expect(dateInput._element.querySelector(".form-date-time > textarea").value).toEqual("14.07.2026 14:30")
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

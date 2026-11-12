import Autocomplete from '../../src/autocomplete.js'
import ChipFilter from '../../src/chip-filter.js'
import ChipInput from '../../src/chip-input.js'
import Combobox from '../../src/combobox.js'
import DateInput from '../../src/date-input.js'
import DatePicker from '../../src/date-picker.js'
import DateRangeInput from '../../src/date-range-input.js'
import DateRangePicker from '../../src/date-range-picker.js'
import MultiSelect from '../../src/multi-select.js'
import OTPInput from '../../src/otp-input.js'
import RangeSlider from '../../src/range-slider.js'
import Rating from '../../src/rating.js'
import TimeInput from '../../src/time-input.js'
import TimePicker from '../../src/time-picker.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

const FEEDBACK = '<div class="invalid-feedback" id="feedback">Fix this field.</div>'
const VALIDATION_ONLY = 'its only setter of an option is setValidationState'

const sectionsOf = t => [...t.root.querySelectorAll('.form-date-time-section')]
const pressArrowUp = section => {
  section.focus()
  section.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))
}

const typeInto = (input, value) => {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

const nativeChange = field => [[field, 'input'], [field, 'change']]

const disableAndEnable = t => {
  t.instance.disable()
  t.instance.enable()
}

const ADAPTERS = [
  {
    name: 'MultiSelect',
    markup: attributes => `<select name="tech"${attributes()}></select>${FEEDBACK}`,
    create: (root, config) => new MultiSelect(root.querySelector('select'), {
      options: [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2' }],
      ...config
    }),
    serverClassElement: t => t.root.querySelector('select'),
    valueFields: t => [t.instance._element],
    verdictField: t => t.form.elements.tech,
    frames: t => [t.instance._wrapperElement],
    invalidTargets: t => [t.instance._getFocusTarget()],
    describedTargets: t => [t.instance._getFocusTarget()],
    changeAsUser: t => t.instance._optionsElement.querySelector('[data-coreui-value="1"]').click(),
    changeEvents: t => [[t.instance._element, 'change.coreui.multi-select'], ...nativeChange(t.instance._element)],
    changeFromCode: t => t.instance.selectAll(),
    reconfigure: disableAndEnable,
    pageOwnsValueField: true,
    required: { required: true }
  },
  {
    name: 'Autocomplete',
    markup: attributes => `<div${attributes('autocomplete')}></div>${FEEDBACK}`,
    create: (root, config) => new Autocomplete(root.querySelector('.autocomplete'), {
      name: 'country',
      options: [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }],
      ...config
    }),
    serverClassElement: t => t.root.querySelector('.autocomplete'),
    valueFields: t => [t.instance._inputElement],
    verdictField: t => t.form.elements.country,
    frames: t => [t.root.querySelector('.autocomplete')],
    invalidTargets: t => [t.instance._inputElement],
    describedTargets: t => [t.instance._inputElement],
    changeAsUser: t => typeInto(t.instance._inputElement, 'x'),
    changeEvents: t => [[t.root.querySelector('.autocomplete'), 'input.coreui.autocomplete']],
    verdictEvents: t => [[t.root.querySelector('.autocomplete'), 'change.coreui.autocomplete'], [t.root.querySelector('.autocomplete'), 'input.coreui.autocomplete']],
    verdictChanges: [
      ['typing', {}, t => typeInto(t.instance._inputElement, 'x'), 'now'],
      ['a pick', { value: '1' }, t => t.instance._optionsElement.querySelector('[data-coreui-value="2"]').click(), 'focus'],
      ['the cleaner', { cleaner: true, value: '1' }, t => t.instance._cleanerElement.click(), 'now'],
      ['Escape that empties the field', { allowOnlyDefinedOptions: true, value: '1' }, t => {
        typeInto(t.instance._inputElement, 'Op')
        t.verdictField.setCustomValidity('The page says no.')
        t.instance._inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      }, 'focus']
    ],
    changeFromCode: t => t.instance.setValue('2'),
    reconfigure: disableAndEnable,
    required: { required: true }
  },
  {
    name: 'Combobox',
    markup: attributes => [
      `<button type="button"${attributes('form-control combobox-toggle')}><span class="combobox-value"></span></button>`,
      '<div class="popup combobox-popup"><div class="list-box"><div class="list-box-options" aria-label="Country">',
      '<div class="list-box-option" data-coreui-value="us">United States</div>',
      '<div class="list-box-option" data-coreui-value="ca">Canada</div>',
      '</div></div></div>',
      FEEDBACK
    ].join(''),
    create: (root, config) => new Combobox(root.querySelector('.combobox-toggle'), { name: 'country', ...config }),
    serverClassElement: t => t.root.querySelector('.combobox-toggle'),
    valueFields: t => [t.instance._valueField],
    verdictField: t => t.form.elements.country,
    frames: t => [t.root.querySelector('.combobox-toggle')],
    invalidTargets: t => [t.root.querySelector('.combobox-toggle')],
    describedTargets: t => [t.root.querySelector('.combobox-toggle')],
    changeAsUser(t) {
      t.instance.show()
      t.instance._menu.querySelector('[data-coreui-value="ca"]').click()
    },
    changeEvents: t => [[t.root.querySelector('.combobox-toggle'), 'change.coreui.combobox'], ...nativeChange(t.instance._valueField)],
    changeFromCode: t => t.instance.setValue('ca'),
    required: { required: true }
  },
  {
    name: 'ChipFilter',
    markup: attributes => `<div${attributes('chip-filter')}><span class="chip">one</span><span class="chip">two</span></div>${FEEDBACK}`,
    create: (root, config) => new ChipFilter(root.querySelector('.chip-filter'), { name: 'tags', ...config }),
    serverClassElement: t => t.root.querySelector('.chip-filter'),
    valueFields: t => [t.instance._valueField],
    verdictField: t => t.form.elements.tags,
    frames: t => [t.root.querySelector('.chip-filter')],
    invalidTargets: t => [t.root.querySelector('.chip-filter')],
    describedTargets: t => [t.root.querySelector('.chip-filter')],
    changeAsUser: t => t.root.querySelector('.chip').click(),
    changeEvents: t => [[t.root.querySelector('.chip-filter'), 'change.coreui.chip-filter'], ...nativeChange(t.instance._valueField)],
    changeFromCode: t => t.instance.selectChip(t.root.querySelector('.chip')),
    required: { required: true }
  },
  {
    name: 'ChipInput',
    markup: attributes => `<div${attributes('chip-input')}></div>${FEEDBACK}`,
    create: (root, config) => new ChipInput(root.querySelector('.chip-input'), { name: 'tags', ...config }),
    serverClassElement: t => t.root.querySelector('.chip-input'),
    valueFields: t => [t.instance._valueField],
    verdictField: t => t.form.elements.tags,
    frames: t => [t.root.querySelector('.chip-input')],
    invalidTargets: t => [t.instance._input],
    describedTargets: t => [t.instance._input],
    changeAsUser: t => typeInto(t.instance._input, 'two,'),
    changeEvents: t => [[t.root.querySelector('.chip-input'), 'change.coreui.chip-input'], ...nativeChange(t.instance._valueField)],
    changeFromCode: t => t.instance.add('two'),
    required: { required: true }
  },
  {
    name: 'DateInput',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new DateInput(root.querySelector('#field'), {
      format: 'dd.MM.yyyy', locale: 'en-US', name: 'when', ...config
    }),
    filled: { date: new Date(2026, 6, 14) },
    serverClassElement: t => t.root.querySelector('#field'),
    valueFields: t => [t.instance._inputElement],
    verdictField: t => t.form.elements.when,
    frames: t => [t.root.querySelector('#field')],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => pressArrowUp(sectionsOf(t)[0]),
    changeEvents: t => [[t.root.querySelector('#field'), 'dateChange.coreui.date-input'], ...nativeChange(t.instance._inputElement)],
    changeFromCode: t => t.instance.setDate(new Date(2026, 6, 15)),
    reconfigure: disableAndEnable,
    required: { required: true }
  },
  {
    name: 'TimeInput',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new TimeInput(root.querySelector('#field'), {
      format: 'HH:mm', locale: 'en-US', name: 'at', ...config
    }),
    filled: { date: '10:30:00' },
    serverClassElement: t => t.root.querySelector('#field'),
    valueFields: t => [t.instance._inputElement],
    verdictField: t => t.form.elements.at,
    frames: t => [t.root.querySelector('#field')],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => pressArrowUp(sectionsOf(t)[0]),
    changeEvents: t => [[t.root.querySelector('#field'), 'timeChange.coreui.time-input'], ...nativeChange(t.instance._inputElement)],
    changeFromCode: t => t.instance.setDate('11:45:00'),
    reconfigure: disableAndEnable,
    required: { required: true }
  },
  {
    name: 'DateRangeInput',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new DateRangeInput(root.querySelector('#field'), {
      format: 'dd.MM.yyyy', locale: 'en-US', startName: 'from', endName: 'to', ...config
    }),
    filled: { startDate: new Date(2026, 6, 14), endDate: new Date(2026, 6, 20) },
    serverClassElement: t => t.root.querySelector('#field'),
    valueFields: t => [t.instance._startInput._inputElement, t.instance._endInput._inputElement],
    verdictField: t => t.form.elements.from,
    frames: t => [...t.root.querySelectorAll('.form-date-time')],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => pressArrowUp(sectionsOf(t)[0]),
    changeEvents: t => [
      [t.root.querySelector('#field'), 'startDateChange.coreui.date-range-input'],
      ...nativeChange(t.instance._startInput._inputElement)
    ],
    changeFromCode: t => t.instance.setRange(new Date(2026, 6, 15), new Date(2026, 6, 21)),
    required: { required: true }
  },
  {
    name: 'DatePicker',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new DatePicker(root.querySelector('#field'), { locale: 'en-US', name: 'when', ...config }),
    filled: { date: new Date(2026, 6, 14) },
    serverClassElement: t => t.root.querySelector('#field'),
    valueFields: t => [t.instance._input._inputElement],
    verdictField: t => t.form.elements.when,
    frames: t => [t.instance._input._element],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => t.root.querySelector('.form-control-cleaner').click(),
    changeEvents: t => [[t.root.querySelector('#field'), 'dateChange.coreui.date-picker'], ...nativeChange(t.instance._input._inputElement)],
    changeFromCode: t => t.instance.setDate(new Date(2026, 6, 15)),
    required: { required: true }
  },
  {
    name: 'TimePicker',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new TimePicker(root.querySelector('#field'), { locale: 'en-US', name: 'at', ...config }),
    filled: { time: '10:30:00' },
    serverClassElement: t => t.root.querySelector('#field'),
    valueFields: t => [t.instance._input._inputElement],
    verdictField: t => t.form.elements.at,
    frames: t => [t.instance._input._element],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => t.root.querySelector('.form-control-cleaner').click(),
    changeEvents: t => [[t.root.querySelector('#field'), 'timeChange.coreui.time-picker'], ...nativeChange(t.instance._input._inputElement)],
    changeFromCode: t => t.instance.setTime('11:45:00'),
    required: { required: true }
  },
  {
    name: 'DateRangePicker',
    markup: attributes => `<div class="form-field"><div id="field"${attributes()}></div>${FEEDBACK}</div>`,
    create: (root, config) => new DateRangePicker(root.querySelector('#field'), {
      locale: 'en-US', startName: 'from', endName: 'to', ...config
    }),
    filled: { startDate: new Date(2026, 6, 14), endDate: new Date(2026, 6, 20) },
    serverClassElement: t => t.root.querySelector('#field'),
    valueFields: t => [t.instance._input._startInput._inputElement, t.instance._input._endInput._inputElement],
    verdictField: t => t.form.elements.from,
    frames: t => [...t.root.querySelectorAll('.form-date-time')],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => t.root.querySelector('.form-control-cleaner').click(),
    changeEvents: t => [
      [t.root.querySelector('#field'), 'startDateChange.coreui.date-range-picker'],
      ...nativeChange(t.instance._input._startInput._inputElement)
    ],
    changeFromCode: t => t.instance.setRange(new Date(2026, 6, 15), new Date(2026, 6, 21)),
    required: { required: true }
  },
  {
    name: 'OTPInput',
    markup: attributes => `<div${attributes('form-otp')}><input class="form-otp-control"></div>${FEEDBACK}`,
    create: (root, config) => new OTPInput(root.querySelector('.form-otp'), { name: 'code', ...config }),
    serverClassElement: t => t.root.querySelector('.form-otp'),
    valueFields: t => [t.instance._inputElement],
    verdictField: t => t.form.elements.code,
    frames: t => [t.root.querySelector('.form-otp')],
    invalidTargets: t => [...t.root.querySelectorAll('.form-otp-control')],
    describedTargets: t => [...t.root.querySelectorAll('.form-otp-control')],
    changeAsUser: t => typeInto(t.root.querySelector('.form-otp-control'), '1'),
    changeEvents: t => [[t.root.querySelector('.form-otp'), 'change.coreui.otp-input'], ...nativeChange(t.instance._inputElement)],
    changeFromCode: t => t.instance.setValue('1'),
    reconfigure: disableAndEnable,
    required: { required: true }
  },
  {
    name: 'RangeSlider',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new RangeSlider(root.querySelector('#field'), { name: 'budget', value: [20, 80], ...config }),
    serverClassElement: t => t.root.querySelector('#field'),
    valueFields: t => [...t.root.querySelectorAll('.form-range-input')],
    verdictField: t => t.form.elements['budget-0'],
    frames: t => [t.root.querySelector('#field'), ...t.root.querySelectorAll('.form-range-input')],
    invalidTargets: t => [...t.root.querySelectorAll('.form-range-input')],
    describedTargets: t => [...t.root.querySelectorAll('.form-range-input')],
    pageDescribed: t => [...t.root.querySelectorAll('.form-range-input')],
    changeAsUser: t => typeInto(t.root.querySelector('.form-range-input'), '30'),
    changeEvents: t => [[t.root.querySelector('#field'), 'input.coreui.range-slider']],
    changeFromCode: t => t.instance.setValue([30, 70]),
    reconfigure: disableAndEnable,
    required: null,
    makeInvalid: t => t.root.querySelector('.form-range-input').setCustomValidity('Pick a higher budget.'),
    notApplicable: {
      reportedReconfigure: 'its rebuild replaces the handles and leaves the validity the page set on the old ones behind',
      reportedResetReconfigure: 'its rebuild replaces the handles and leaves the validity the page set on the old ones behind'
    }
  },
  {
    name: 'Rating',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new Rating(root.querySelector('#field'), { name: 'score', ...config }),
    serverClassElement: t => t.root.querySelector('#field'),
    valueFields: t => [...t.root.querySelectorAll('.rating-item-input')],
    verdictField: t => t.form.querySelector('input[name="score"]:checked') ?? t.form.querySelector('input[name="score"]'),
    frames: t => [t.root.querySelector('#field')],
    invalidTargets: t => [t.root.querySelector('#field')],
    describedTargets: t => [...t.root.querySelectorAll('.rating-item-input')],
    pageDescribed: t => [t.root.querySelector('#field')],
    changeAsUser: t => t.root.querySelectorAll('.rating-item-label')[3].click(),
    changeEvents: t => [[t.root.querySelector('#field'), 'change.coreui.rating']],
    verdictEvents: t => [[t.root.querySelector('#field'), 'change.coreui.rating']],
    verdictChanges: [
      ['a pick', { value: 2 }, t => t.root.querySelectorAll('.rating-item-label')[3].click(), 'now'],
      ['allowClear', { allowClear: true, value: 2 }, t => t.root.querySelectorAll('.rating-item-input')[1].click(), 'focus']
    ],
    changeFromCode: t => t.instance.setValue(4),
    reconfigure: disableAndEnable,
    required: { required: true }
  }
]

describe('validation conformance', () => {
  let fixtureEl
  const live = new Set()

  const tick = () => new Promise(resolve => {
    setTimeout(resolve)
  })

  const mount = (adapter, { config = {}, serverClass = '' } = {}) => {
    const attributes = (base = '') => {
      const classes = [base, serverClass].filter(Boolean).join(' ')

      return `${classes ? ` class="${classes}"` : ''} aria-describedby="hint"`
    }

    fixtureEl.innerHTML = `<div id="hint">Pick carefully.</div><form>${adapter.markup(attributes)}<button type="submit">Send</button></form>`
    const form = fixtureEl.querySelector('form')
    form.addEventListener('submit', event => event.preventDefault())
    const instance = adapter.create(fixtureEl, config)
    live.add(instance)

    return { form, instance, root: fixtureEl }
  }

  const dispose = t => {
    live.delete(t.instance)
    t.instance.dispose()
  }

  const stateClasses = element => [...element.classList].filter(name => /^is-(invalid|valid)$/.test(name))
  const shownStates = t => [...t.root.querySelectorAll('.is-invalid, .is-valid')].map(stateClasses)
  const ariaInvalid = t => [...t.root.querySelectorAll('[aria-invalid]')]
  const hasCustomError = (adapter, t) => adapter.valueFields(t).some(field => field.validity.customError)
  const describedBy = element => (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
  const describesFeedback = (adapter, t) => adapter.describedTargets(t).some(target => describedBy(target).includes('feedback'))

  const expectFrames = (adapter, t, classes) => {
    expect(adapter.frames(t).map(stateClasses)).toEqual(adapter.frames(t).map(() => classes))
  }

  const reasonFor = (adapter, rule) => adapter.notApplicable?.[rule] ??
    (rule.endsWith('Reconfigure') && !adapter.reconfigure ? VALIDATION_ONLY : null) ??
    (rule === 'pageValueField' && !adapter.pageOwnsValueField ? 'its value field is built by the component' : null)

  const conform = (rule, title, test) => {
    for (const adapter of ADAPTERS) {
      const reason = reasonFor(adapter, rule)

      if (reason) {
        it.skip(`${adapter.name} ${title} (not applicable: ${reason})`, () => {})
      } else {
        it(`${adapter.name} ${title}`, () => test(adapter))
      }
    }
  }

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    for (const instance of live) {
      instance.dispose()
    }

    live.clear()
    clearFixture()
  })

  describe('a state class in the markup', () => {
    conform('serverClass', 'should show it on the frame, let the form submit and give it back on dispose', adapter => {
      const t = mount(adapter, { serverClass: 'is-invalid' })

      expectFrames(adapter, t, ['is-invalid'])
      expect(ariaInvalid(t)).toEqual(adapter.invalidTargets(t))
      expect(hasCustomError(adapter, t)).toBe(false)
      expect(t.form.checkValidity()).toBe(true)

      const element = adapter.serverClassElement(t)
      dispose(t)

      expect(stateClasses(element)).toEqual(['is-invalid'])
    })
  })

  describe('a given invalid state', () => {
    conform('given', 'should show it on the frame, describe the targets with the message and let the form submit', adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })

      expectFrames(adapter, t, ['is-invalid'])
      expect(ariaInvalid(t)).toEqual(adapter.invalidTargets(t))
      expect(describesFeedback(adapter, t)).toBe(true)
      expect(hasCustomError(adapter, t)).toBe(false)
      expect(t.form.checkValidity()).toBe(true)
    })

    conform('aria', 'should put aria-invalid on the focus targets only and add the message to their description', adapter => {
      const t = mount(adapter, { config: { validationState: 'invalid' } })
      const targets = adapter.describedTargets(t)

      expect(ariaInvalid(t)).toEqual(adapter.invalidTargets(t))
      expect(ariaInvalid(t).every(target => target.getAttribute('aria-invalid') === 'true')).toBe(true)
      expect(targets.length).toBeGreaterThan(0)

      for (const target of targets) {
        const ids = describedBy(target)

        expect(ids.at(-1)).toBe('feedback')
        expect(new Set(ids).size).toBe(ids.length)
      }
    })

    conform('pageDescription', 'should keep the description the page gave first, with and without the state', adapter => {
      const t = mount(adapter, { config: { validationState: 'invalid' } })
      const described = adapter.pageDescribed?.(t) ?? adapter.describedTargets(t)

      expect(described.map(target => describedBy(target)[0])).toEqual(described.map(() => 'hint'))

      t.instance.setValidationState(null)

      expect(describedBy(described[0])).toEqual(['hint'])
    })
  })

  describe('setValidationState', () => {
    conform('setValidationState', 'should move between invalid, valid and none in place, without blocking the submit', adapter => {
      const t = mount(adapter)
      const nodes = [...adapter.frames(t), ...adapter.valueFields(t), ...adapter.describedTargets(t)]
      const inPlace = () => [...adapter.frames(t), ...adapter.valueFields(t), ...adapter.describedTargets(t)].every((node, index) => node === nodes[index])

      t.instance.setValidationState('invalid')

      expectFrames(adapter, t, ['is-invalid'])
      expect(ariaInvalid(t)).toEqual(adapter.invalidTargets(t))
      expect(hasCustomError(adapter, t)).toBe(false)
      expect(t.form.checkValidity()).toBe(true)

      t.instance.setValidationState('valid')

      expectFrames(adapter, t, ['is-valid'])
      expect(ariaInvalid(t)).toHaveLength(0)
      expect(describesFeedback(adapter, t)).toBe(false)

      t.instance.setValidationState(null)

      expect(shownStates(t)).toEqual([])
      expect(hasCustomError(adapter, t)).toBe(false)
      expect(inPlace()).toBe(true)
    })
  })

  describe('a rejected setValidationState', () => {
    conform('rejectedState', 'should keep a state class from the markup through a state of the wrong type', adapter => {
      const t = mount(adapter, { serverClass: 'is-invalid' })

      expect(() => t.instance.setValidationState(1)).toThrowError(TypeError)
      adapter.changeFromCode(t)

      expectFrames(adapter, t, ['is-invalid'])
      expect(ariaInvalid(t)).toEqual(adapter.invalidTargets(t))

      const element = adapter.serverClassElement(t)
      dispose(t)

      expect(stateClasses(element)).toEqual(['is-invalid'])
    })
  })

  describe('a change of the value', () => {
    const record = (adapter, t, entry) => {
      const seen = []

      for (const [target, type] of adapter.changeEvents(t)) {
        target.addEventListener(type, () => seen.push([type, ...entry()]))
      }

      return seen
    }

    conform('userChange', 'should drop a given state when the user makes it, before the change events', adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })
      const seen = record(adapter, t, () => [shownStates(t), ariaInvalid(t).length, describesFeedback(adapter, t)])

      adapter.changeAsUser(t)

      expect(seen.length).toBeGreaterThan(0)
      expect(seen).toEqual(seen.map(([type]) => [type, [], 0, false]))
      expect(shownStates(t)).toEqual([])
    })

    conform('userChangeReported', 'should show the state of the new value at the change events of a reported field', adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, ...adapter.required, validationState: 'invalid' } })
      const fieldStates = () => {
        const frames = adapter.frames(t)
        const fields = adapter.valueFields(t)

        return frames.map((_, index) => ((frames.length === fields.length ? [fields[index]] : fields).some(field => !field.validity.valid) ? ['is-invalid'] : []))
      }

      const seen = record(adapter, t, () => [adapter.frames(t).map(stateClasses), fieldStates()])
      const reported = adapter.valueFields(t)

      for (const field of reported) {
        field.setCustomValidity('Reported.')
      }

      t.form.checkValidity()

      for (const field of reported) {
        field.setCustomValidity('')
      }

      adapter.changeAsUser(t)

      expect(seen.length).toBeGreaterThan(0)
      expect(seen.map(([type, shown]) => [type, shown])).toEqual(seen.map(([type, , expected]) => [type, expected]))
    })

    conform('codeChange', 'should keep a given state when code makes it', adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })

      adapter.changeFromCode(t)

      expectFrames(adapter, t, ['is-invalid'])
      expect(ariaInvalid(t)).toEqual(adapter.invalidTargets(t))
    })
  })

  describe('a native reset', () => {
    conform('reset', 'should drop a state given before it', async adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })

      t.form.reset()
      await tick()

      expect(shownStates(t)).toEqual([])
      expect(ariaInvalid(t)).toHaveLength(0)
    })

    conform('reset', 'should keep a state given in a reset listener of the form', async adapter => {
      const t = mount(adapter, { config: adapter.filled })

      t.form.addEventListener('reset', () => t.instance.setValidationState('invalid'))
      t.form.reset()
      await tick()

      expectFrames(adapter, t, ['is-invalid'])
      expect(ariaInvalid(t)).toEqual(adapter.invalidTargets(t))
    })

    conform('reset', 'should keep a state given right after it', async adapter => {
      const t = mount(adapter, { config: adapter.filled })

      t.form.reset()
      t.instance.setValidationState('invalid')
      await tick()

      expectFrames(adapter, t, ['is-invalid'])
      expect(ariaInvalid(t)).toEqual(adapter.invalidTargets(t))
    })

    conform('resetReconfigure', 'should drop a state given before it after a setter of another option', async adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })

      adapter.reconfigure(t)
      t.form.reset()
      await tick()

      expect(shownStates(t)).toEqual([])
      expect(ariaInvalid(t)).toHaveLength(0)
    })
  })

  describe('a reported state', () => {
    const mountInvalid = adapter => {
      const t = mount(adapter, { config: adapter.required ?? {} })
      adapter.makeInvalid?.(t)

      return t
    }

    conform('reported', 'should show it on the frame once a validation reports the field', adapter => {
      const t = mountInvalid(adapter)

      expect(shownStates(t)).toEqual([])
      expect(t.form.checkValidity()).toBe(false)
      expectFrames(adapter, t, ['is-invalid'])
    })

    conform('reportedReconfigure', 'should keep it through a setter of another option', adapter => {
      const t = mountInvalid(adapter)

      t.form.checkValidity()
      adapter.reconfigure(t)

      expectFrames(adapter, t, ['is-invalid'])
    })

    conform('reportedResetReconfigure', 'should forget it when a reset listener of the form calls a setter of another option', async adapter => {
      const t = mountInvalid(adapter)

      t.form.checkValidity()
      t.form.addEventListener('reset', () => adapter.reconfigure(t))
      t.form.reset()
      await tick()

      expect(shownStates(t)).toEqual([])
    })
  })

  describe('dispose', () => {
    conform('dispose', 'should leave no state class, aria-invalid or custom validity behind', adapter => {
      const t = mount(adapter, { config: { validationState: 'invalid' } })

      dispose(t)

      expect(shownStates(t)).toEqual([])
      expect(ariaInvalid(t)).toHaveLength(0)
      expect(t.form.checkValidity()).toBe(true)
    })

    conform('disposeDescription', 'should give the host the description the page gave it', adapter => {
      const t = mount(adapter, { config: { validationState: 'invalid' } })
      const host = adapter.serverClassElement(t)

      dispose(t)

      expect(describedBy(host)).toEqual(['hint'])
    })

    conform('pageValueField', 'should leave a custom validity the page set on its value field', adapter => {
      const t = mount(adapter, { config: { validationState: 'invalid' } })
      const [field] = adapter.valueFields(t)

      field.setCustomValidity('The page says no.')
      dispose(t)

      expect(field.validationMessage).toBe('The page says no.')
    })
  })

  describe('a custom validity the page sets', () => {
    for (const [moment, given] of [['before', false], ['after', true]]) {
      conform('pageValidity', `should stay on the value field when the page sets it ${moment} the given state`, adapter => {
        const t = mount(adapter, { config: given ? { validationState: 'invalid' } : {} })
        const [field] = adapter.valueFields(t)

        field.setCustomValidity('The page says no.')
        t.instance.setValidationState('invalid')
        t.instance.setValidationState(null)

        expect(field.validationMessage).toBe('The page says no.')
      })
    }

    conform('pageValidity', 'should keep blocking the submit with it through a given state, a change from code and a change of the user, and stay after dispose', adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })
      const [field] = adapter.valueFields(t)
      const blocks = () => [field.validationMessage, t.form.checkValidity()]

      field.setCustomValidity('The page says no.')

      expect(blocks()).toEqual(['The page says no.', false])

      adapter.changeFromCode(t)

      expect(blocks()).toEqual(['The page says no.', false])

      adapter.changeAsUser(t)

      expect(blocks()).toEqual(['The page says no.', false])

      dispose(t)

      expect(field.validationMessage).toBe('The page says no.')
    })
  })

  describe('a verdict of the page', () => {
    conform('pageVerdict', 'should stop the submit with a custom validity and let it through once the page clears it on the documented event', adapter => {
      for (const [, config, act, shown] of adapter.verdictChanges ?? [['', {}, adapter.changeAsUser, 'now']]) {
        const t = mount(adapter, { config: { ...adapter.filled, ...config } })
        const field = adapter.verdictField(t)
        const drawn = () => adapter.frames(t).some(frame => frame.classList.contains('is-invalid')) || ariaInvalid(t).length > 0
        let cleared = 0
        const clear = () => {
          cleared += 1
          field.setCustomValidity('')
        }

        t.verdictField = field
        field.setCustomValidity('The page says no.')

        expect(t.form.checkValidity()).toBe(false)
        expect(drawn()).toBe(true)

        t.form.addEventListener('input', clear, true)

        for (const [target, type] of adapter.verdictEvents?.(t) ?? []) {
          target.addEventListener(type, clear)
        }

        act(t)

        expect(cleared).toBeGreaterThan(0)
        expect(t.form.checkValidity()).toBe(true)
        expect(drawn()).toBe(shown !== 'now')

        if (shown === 'focus') {
          field.focus()
          t.form.querySelector('button').focus()
        }

        expect(drawn()).toBe(false)
        dispose(t)
      }
    })
  })

  describe('a state class the page puts on a frame', () => {
    conform('pageClass', 'should stay when the given state goes', adapter => {
      const t = mount(adapter)
      const [frame] = adapter.frames(t)

      frame.classList.add('is-invalid')
      t.instance.setValidationState('invalid')
      t.instance.setValidationState(null)

      expect(stateClasses(frame)).toEqual(['is-invalid'])
    })
  })

  describe('a disabled component', () => {
    conform('disabled', 'should show a given state without blocking', adapter => {
      const t = mount(adapter, { config: { disabled: true, validationState: 'invalid' } })

      expectFrames(adapter, t, ['is-invalid'])
      expect(t.form.checkValidity()).toBe(true)
    })
  })
})

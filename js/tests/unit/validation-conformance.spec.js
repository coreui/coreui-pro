import Autocomplete from '../../src/autocomplete.js'
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
const VALIDATION_ONLY = 'its setConfig takes only the validation options'

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

const ADAPTERS = [
  {
    name: 'MultiSelect',
    markup: attributes => `<select name="tech"${attributes()}></select>${FEEDBACK}`,
    create: (root, config) => new MultiSelect(root.querySelector('select'), {
      options: [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2' }],
      ...config
    }),
    serverClassElement: t => t.root.querySelector('select'),
    blockers: t => [t.instance._element],
    frames: t => [t.instance._wrapperElement],
    invalidTargets: t => [t.instance._getFocusTarget()],
    describedTargets: t => [t.instance._getFocusTarget()],
    changeAsUser: t => t.instance._optionsElement.querySelector('[data-coreui-value="1"]').click(),
    changeEvents: t => [[t.instance._element, 'change.coreui.multi-select'], ...nativeChange(t.instance._element)],
    changeFromCode: t => t.instance.selectAll(),
    reconfigure: t => t.instance.setConfig({ placeholder: 'Pick one' }),
    rejectedOption: { multiple: 'yes' },
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
    blockers: t => [t.instance._inputElement],
    frames: t => [t.root.querySelector('.autocomplete')],
    invalidTargets: t => [t.instance._inputElement],
    describedTargets: t => [t.instance._inputElement],
    changeAsUser: t => typeInto(t.instance._inputElement, 'x'),
    changeEvents: t => [[t.root.querySelector('.autocomplete'), 'input.coreui.autocomplete']],
    changeFromCode: t => t.instance.setConfig({ value: '2' }),
    reconfigure: t => t.instance.setConfig({ placeholder: 'Pick one' }),
    rejectedOption: { cleaner: 'yes' },
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
    blockers: t => [t.instance._valueField],
    frames: t => [t.root.querySelector('.combobox-toggle')],
    invalidTargets: () => [],
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
    name: 'ChipInput',
    markup: attributes => `<div${attributes('chip-input')}></div>${FEEDBACK}`,
    create: (root, config) => new ChipInput(root.querySelector('.chip-input'), { name: 'tags', ...config }),
    serverClassElement: t => t.root.querySelector('.chip-input'),
    blockers: t => [t.instance._valueField],
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
    blockers: t => [t.instance._inputElement],
    frames: t => [t.root.querySelector('#field')],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => pressArrowUp(sectionsOf(t)[0]),
    changeEvents: t => [[t.root.querySelector('#field'), 'dateChange.coreui.date-input'], ...nativeChange(t.instance._inputElement)],
    changeFromCode: t => t.instance.setConfig({ date: new Date(2026, 6, 15) }),
    reconfigure: t => t.instance.setConfig({ locale: 'en-GB' }),
    rejectedOption: { required: 'yes' },
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
    blockers: t => [t.instance._inputElement],
    frames: t => [t.root.querySelector('#field')],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => pressArrowUp(sectionsOf(t)[0]),
    changeEvents: t => [[t.root.querySelector('#field'), 'timeChange.coreui.time-input'], ...nativeChange(t.instance._inputElement)],
    changeFromCode: t => t.instance.setConfig({ date: '11:45:00' }),
    reconfigure: t => t.instance.setConfig({ locale: 'en-GB' }),
    rejectedOption: { required: 'yes' },
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
    blockers: t => [t.instance._startInput._inputElement, t.instance._endInput._inputElement],
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
    blockers: t => [t.instance._input._inputElement],
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
    blockers: t => [t.instance._input._inputElement],
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
    blockers: t => [t.instance._rangeInput._startInput._inputElement, t.instance._rangeInput._endInput._inputElement],
    frames: t => [...t.root.querySelectorAll('.form-date-time')],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => t.root.querySelector('.form-control-cleaner').click(),
    changeEvents: t => [
      [t.root.querySelector('#field'), 'startDateChange.coreui.date-range-picker'],
      ...nativeChange(t.instance._rangeInput._startInput._inputElement)
    ],
    changeFromCode: t => t.instance.setRange(new Date(2026, 6, 15), new Date(2026, 6, 21)),
    required: { required: true }
  },
  {
    name: 'OTPInput',
    markup: attributes => `<div${attributes('form-otp')}><input class="form-otp-control"></div>${FEEDBACK}`,
    create: (root, config) => new OTPInput(root.querySelector('.form-otp'), { name: 'code', ...config }),
    serverClassElement: t => t.root.querySelector('.form-otp'),
    blockers: t => [t.instance._inputElement],
    frames: t => [t.root.querySelector('.form-otp')],
    invalidTargets: t => [...t.root.querySelectorAll('.form-otp-control')],
    describedTargets: t => [...t.root.querySelectorAll('.form-otp-control')],
    changeAsUser: t => typeInto(t.root.querySelector('.form-otp-control'), '1'),
    changeEvents: t => [[t.root.querySelector('.form-otp'), 'change.coreui.otp-input'], ...nativeChange(t.instance._inputElement)],
    changeFromCode: t => t.instance.setConfig({ value: '1' }),
    reconfigure: t => t.instance.setConfig({ placeholder: '-' }),
    rejectedOption: { required: 'yes' },
    required: { required: true }
  },
  {
    name: 'RangeSlider',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new RangeSlider(root.querySelector('#field'), { name: 'budget', value: [20, 80], ...config }),
    serverClassElement: t => t.root.querySelector('#field'),
    blockers: t => [t.root.querySelector('.form-range-input')],
    frames: t => [t.root.querySelector('#field'), ...t.root.querySelectorAll('.form-range-input')],
    invalidTargets: t => [...t.root.querySelectorAll('.form-range-input')],
    describedTargets: t => [...t.root.querySelectorAll('.form-range-input')],
    pageDescribed: t => [...t.root.querySelectorAll('.form-range-input')],
    changeAsUser: t => typeInto(t.root.querySelector('.form-range-input'), '30'),
    changeEvents: t => [[t.root.querySelector('#field'), 'input.coreui.range-slider']],
    changeFromCode: t => t.instance.setConfig({ value: [30, 70] }),
    reconfigure: t => t.instance.setConfig({ step: 5 }),
    rejectedOption: { disabled: 'yes' },
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
    blockers: t => [t.root.querySelector('.rating-item-input:checked') ?? t.root.querySelector('.rating-item-input')],
    frames: t => [t.root.querySelector('#field')],
    invalidTargets: t => [t.root.querySelector('#field')],
    describedTargets: t => [...t.root.querySelectorAll('.rating-item-input')],
    pageDescribed: t => [t.root.querySelector('#field')],
    changeAsUser: t => t.root.querySelectorAll('.rating-item-label')[3].click(),
    changeEvents: t => [[t.root.querySelector('#field'), 'change.coreui.rating']],
    changeFromCode: t => t.instance.setConfig({ value: 4 }),
    reconfigure: t => t.instance.setConfig({ itemCount: 6 }),
    rejectedOption: { itemCount: 'six' },
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
  const isBlocked = (adapter, t) => adapter.blockers(t).map(field => field.validity.customError)
  const describedBy = element => (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
  const describesFeedback = (adapter, t) => adapter.describedTargets(t).some(target => describedBy(target).includes('feedback'))

  const expectFrames = (adapter, t, classes) => {
    expect(adapter.frames(t).map(stateClasses)).toEqual(adapter.frames(t).map(() => classes))
  }

  const reasonFor = (adapter, rule) => adapter.notApplicable?.[rule] ??
    ((/^rejected(Option|Mixed)$/.test(rule) && !adapter.rejectedOption) || (rule.endsWith('Reconfigure') && !adapter.reconfigure) ? VALIDATION_ONLY : null) ??
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
    conform('serverClass', 'should show it on the frame, block with it and give it back on dispose', adapter => {
      const t = mount(adapter, { serverClass: 'is-invalid' })

      expectFrames(adapter, t, ['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBe(true)

      const element = adapter.serverClassElement(t)
      dispose(t)

      expect(stateClasses(element)).toEqual(['is-invalid'])
    })
  })

  describe('a given invalid state', () => {
    conform('given', 'should show it on the frame and block with the message', adapter => {
      const t = mount(adapter, { config: { validationState: 'invalid' } })

      expectFrames(adapter, t, ['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBe(true)
      expect(adapter.blockers(t).map(field => field.validationMessage)).toEqual(adapter.blockers(t).map(() => 'Fix this field.'))
      expect(t.form.checkValidity()).toBe(false)
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

      t.instance.setConfig({ validationState: null })

      expect(describedBy(described[0])).toEqual(['hint'])
    })
  })

  describe('setConfig with the state alone', () => {
    conform('setConfig', 'should move between invalid, valid and none in place, blocking only while invalid', adapter => {
      const t = mount(adapter)
      const nodes = [...adapter.frames(t), ...adapter.blockers(t), ...adapter.describedTargets(t)]
      const inPlace = () => [...adapter.frames(t), ...adapter.blockers(t), ...adapter.describedTargets(t)].every((node, index) => node === nodes[index])

      t.instance.setConfig({ validationState: 'invalid' })

      expectFrames(adapter, t, ['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBe(true)

      t.instance.setConfig({ validationState: 'valid' })

      expectFrames(adapter, t, ['is-valid'])
      expect(isBlocked(adapter, t).some(Boolean)).toBe(false)
      expect(ariaInvalid(t)).toHaveLength(0)
      expect(describesFeedback(adapter, t)).toBe(false)

      t.instance.setConfig({ validationState: null })

      expect(shownStates(t)).toEqual([])
      expect(isBlocked(adapter, t).some(Boolean)).toBe(false)
      expect(inPlace()).toBe(true)
    })
  })

  describe('a rejected setConfig', () => {
    const rejections = [
      ['rejectedState', 'a state of the wrong type', () => ({ validationState: 1 })],
      ['rejectedOption', 'another option of the wrong type', adapter => adapter.rejectedOption],
      ['rejectedMixed', 'a state given with another option of the wrong type', adapter => ({ validationState: 'valid', ...adapter.rejectedOption })]
    ]

    for (const [rule, title, configOf] of rejections) {
      conform(rule, `should keep a state class from the markup through ${title}`, adapter => {
        const t = mount(adapter, { serverClass: 'is-invalid' })

        expect(() => t.instance.setConfig(configOf(adapter))).toThrowError(TypeError)
        adapter.changeFromCode(t)

        expectFrames(adapter, t, ['is-invalid'])
        expect(isBlocked(adapter, t).every(Boolean)).toBe(true)

        const element = adapter.serverClassElement(t)
        dispose(t)

        expect(stateClasses(element)).toEqual(['is-invalid'])
      })
    }
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
      const seen = record(adapter, t, () => [shownStates(t), isBlocked(adapter, t).some(Boolean), ariaInvalid(t).length, describesFeedback(adapter, t)])

      adapter.changeAsUser(t)

      expect(seen.length).toBeGreaterThan(0)
      expect(seen).toEqual(seen.map(([type]) => [type, [], false, 0, false]))
      expect(shownStates(t)).toEqual([])
    })

    conform('userChangeReported', 'should show the state of the new value at the change events of a reported field', adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, ...adapter.required, validationState: 'invalid' } })
      const fieldStates = () => {
        const frames = adapter.frames(t)
        const fields = adapter.blockers(t)

        return frames.map((_, index) => ((frames.length === fields.length ? [fields[index]] : fields).some(field => !field.validity.valid) ? ['is-invalid'] : []))
      }

      const seen = record(adapter, t, () => [adapter.frames(t).map(stateClasses), fieldStates()])

      t.form.checkValidity()
      adapter.changeAsUser(t)

      expect(seen.length).toBeGreaterThan(0)
      expect(seen.map(([type, shown]) => [type, shown])).toEqual(seen.map(([type, , expected]) => [type, expected]))
    })

    conform('codeChange', 'should keep a given state when code makes it', adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })

      adapter.changeFromCode(t)

      expectFrames(adapter, t, ['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBe(true)
    })
  })

  describe('a native reset', () => {
    conform('reset', 'should drop a state given before it', async adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })

      t.form.reset()
      await tick()

      expect(shownStates(t)).toEqual([])
      expect(ariaInvalid(t)).toHaveLength(0)
      expect(isBlocked(adapter, t).some(Boolean)).toBe(false)
    })

    conform('reset', 'should keep a state given in a reset listener of the form', async adapter => {
      const t = mount(adapter, { config: adapter.filled })

      t.form.addEventListener('reset', () => t.instance.setConfig({ validationState: 'invalid' }))
      t.form.reset()
      await tick()

      expectFrames(adapter, t, ['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBe(true)
    })

    conform('reset', 'should keep a state given right after it', async adapter => {
      const t = mount(adapter, { config: adapter.filled })

      t.form.reset()
      t.instance.setConfig({ validationState: 'invalid' })
      await tick()

      expectFrames(adapter, t, ['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBe(true)
    })

    conform('resetReconfigure', 'should drop a state given before it after a setConfig of another option', async adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })

      adapter.reconfigure(t)
      t.form.reset()
      await tick()

      expect(shownStates(t)).toEqual([])
      expect(ariaInvalid(t)).toHaveLength(0)
      expect(isBlocked(adapter, t).some(Boolean)).toBe(false)
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

    conform('reportedReconfigure', 'should keep it through a setConfig of another option', adapter => {
      const t = mountInvalid(adapter)

      t.form.checkValidity()
      adapter.reconfigure(t)

      expectFrames(adapter, t, ['is-invalid'])
    })

    conform('reportedResetReconfigure', 'should forget it when a reset listener of the form makes a setConfig of another option', async adapter => {
      const t = mountInvalid(adapter)

      t.form.checkValidity()
      t.form.addEventListener('reset', () => adapter.reconfigure(t))
      t.form.reset()
      await tick()

      expect(shownStates(t)).toEqual([])
    })
  })

  describe('dispose', () => {
    conform('dispose', 'should leave no state class, aria-invalid or block behind', adapter => {
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
      const [field] = adapter.blockers(t)

      field.setCustomValidity('The page says no.')
      dispose(t)

      expect(field.validationMessage).toBe('The page says no.')
    })
  })

  describe('a custom validity the page sets', () => {
    for (const [moment, given] of [['before', false], ['after', true]]) {
      conform('pageValidity', `should stay on the value field when the page sets it ${moment} the given state`, adapter => {
        const t = mount(adapter, { config: given ? { validationState: 'invalid' } : {} })
        const [field] = adapter.blockers(t)

        field.setCustomValidity('The page says no.')
        t.instance.setConfig({ validationState: 'invalid' })
        t.instance.setConfig({ validationState: null })

        expect(field.validationMessage).toBe('The page says no.')
      })
    }
  })

  describe('a state class the page puts on a frame', () => {
    conform('pageClass', 'should stay when the given state goes', adapter => {
      const t = mount(adapter)
      const [frame] = adapter.frames(t)

      frame.classList.add('is-invalid')
      t.instance.setConfig({ validationState: 'invalid' })
      t.instance.setConfig({ validationState: null })

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

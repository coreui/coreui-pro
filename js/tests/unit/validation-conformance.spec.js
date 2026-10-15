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
const NO_REBUILD = 'its setConfig takes only the validation options'

const withClass = (attributes, serverClass) => `${attributes}${serverClass ? ` class="${serverClass}"` : ''}`
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
    markup: serverClass => `<select${withClass(' name="tech"', serverClass)}></select>${FEEDBACK}`,
    create: (root, config) => new MultiSelect(root.querySelector('select'), {
      options: [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2' }],
      ...config
    }),
    serverClassElement: t => t.root.querySelector('select'),
    blockers: t => [t.instance._element],
    frame: t => t.instance._wrapperElement,
    invalidTargets: t => [t.instance._getFocusTarget()],
    describedTargets: t => [t.instance._getFocusTarget()],
    changeAsUser: t => t.instance._optionsElement.querySelector('[data-coreui-value="1"]').click(),
    changeEvents: t => [[t.instance._element, 'change.coreui.multi-select'], ...nativeChange(t.instance._element)],
    changeFromCode: t => t.instance.selectAll(),
    rebuild: t => t.instance.setConfig({ placeholder: 'Pick one' }),
    rejectedOption: { multiple: 'yes' },
    required: { required: true }
  },
  {
    name: 'Autocomplete',
    markup: serverClass => `<div class="autocomplete${serverClass ? ` ${serverClass}` : ''}"></div>${FEEDBACK}`,
    create: (root, config) => new Autocomplete(root.querySelector('.autocomplete'), {
      name: 'country',
      options: [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }],
      ...config
    }),
    serverClassElement: t => t.root.querySelector('.autocomplete'),
    blockers: t => [t.instance._inputElement],
    frame: t => t.root.querySelector('.autocomplete'),
    invalidTargets: t => [t.instance._inputElement],
    describedTargets: t => [t.instance._inputElement],
    changeAsUser: t => typeInto(t.instance._inputElement, 'x'),
    changeEvents: t => [[t.root.querySelector('.autocomplete'), 'input.coreui.autocomplete']],
    changeFromCode: t => t.instance.setConfig({ value: '2' }),
    rebuild: t => t.instance.setConfig({ placeholder: 'Pick one' }),
    rejectedOption: { cleaner: 'yes' },
    required: { required: true }
  },
  {
    name: 'Combobox',
    markup: serverClass => [
      `<button class="form-control combobox-toggle${serverClass ? ` ${serverClass}` : ''}" type="button"><span class="combobox-value"></span></button>`,
      '<div class="popup combobox-popup"><div class="list-box"><div class="list-box-options" aria-label="Country">',
      '<div class="list-box-option" data-coreui-value="us">United States</div>',
      '<div class="list-box-option" data-coreui-value="ca">Canada</div>',
      '</div></div></div>',
      FEEDBACK
    ].join(''),
    create: (root, config) => new Combobox(root.querySelector('.combobox-toggle'), { name: 'country', ...config }),
    serverClassElement: t => t.root.querySelector('.combobox-toggle'),
    blockers: t => [t.instance._valueField],
    frame: t => t.root.querySelector('.combobox-toggle'),
    invalidTargets: () => [],
    describedTargets: t => [t.root.querySelector('.combobox-toggle')],
    changeAsUser(t) {
      t.instance.show()
      t.instance._menu.querySelector('[data-coreui-value="ca"]').click()
    },
    changeEvents: t => [[t.root.querySelector('.combobox-toggle'), 'change.coreui.combobox'], ...nativeChange(t.instance._valueField)],
    changeFromCode: t => t.instance.setValue('ca'),
    rebuild: null,
    rejectedOption: null,
    required: { required: true }
  },
  {
    name: 'ChipInput',
    markup: serverClass => `<div class="chip-input${serverClass ? ` ${serverClass}` : ''}"></div>${FEEDBACK}`,
    create: (root, config) => new ChipInput(root.querySelector('.chip-input'), { name: 'tags', ...config }),
    serverClassElement: t => t.root.querySelector('.chip-input'),
    blockers: t => [t.instance._valueField],
    frame: t => t.root.querySelector('.chip-input'),
    invalidTargets: t => [t.instance._input],
    describedTargets: t => [t.instance._input],
    changeAsUser: t => typeInto(t.instance._input, 'two,'),
    changeEvents: t => [[t.root.querySelector('.chip-input'), 'change.coreui.chip-input'], ...nativeChange(t.instance._valueField)],
    changeFromCode: t => t.instance.add('two'),
    rebuild: null,
    rejectedOption: null,
    required: { required: true }
  },
  {
    name: 'DateInput',
    markup: serverClass => `<div${withClass(' id="field"', serverClass)}></div>${FEEDBACK}`,
    create: (root, config) => new DateInput(root.querySelector('#field'), {
      format: 'dd.MM.yyyy', locale: 'en-US', name: 'when', ...config
    }),
    filled: { date: new Date(2026, 6, 14) },
    serverClassElement: t => t.root.querySelector('#field'),
    blockers: t => [t.instance._inputElement],
    frame: t => t.root.querySelector('#field'),
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => pressArrowUp(sectionsOf(t)[0]),
    changeEvents: t => [[t.root.querySelector('#field'), 'dateChange.coreui.date-input'], ...nativeChange(t.instance._inputElement)],
    changeFromCode: t => t.instance.setConfig({ date: new Date(2026, 6, 15) }),
    rebuild: t => t.instance.setConfig({ locale: 'en-GB' }),
    rejectedOption: { required: 'yes' },
    required: { required: true }
  },
  {
    name: 'TimeInput',
    markup: serverClass => `<div${withClass(' id="field"', serverClass)}></div>${FEEDBACK}`,
    create: (root, config) => new TimeInput(root.querySelector('#field'), {
      format: 'HH:mm', locale: 'en-US', name: 'at', ...config
    }),
    filled: { date: '10:30:00' },
    serverClassElement: t => t.root.querySelector('#field'),
    blockers: t => [t.instance._inputElement],
    frame: t => t.root.querySelector('#field'),
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => pressArrowUp(sectionsOf(t)[0]),
    changeEvents: t => [[t.root.querySelector('#field'), 'timeChange.coreui.time-input'], ...nativeChange(t.instance._inputElement)],
    changeFromCode: t => t.instance.setConfig({ date: '11:45:00' }),
    rebuild: t => t.instance.setConfig({ locale: 'en-GB' }),
    rejectedOption: { required: 'yes' },
    required: { required: true }
  },
  {
    name: 'DateRangeInput',
    markup: serverClass => `<div${withClass(' id="field"', serverClass)}></div>${FEEDBACK}`,
    create: (root, config) => new DateRangeInput(root.querySelector('#field'), {
      format: 'dd.MM.yyyy', locale: 'en-US', startName: 'from', endName: 'to', ...config
    }),
    filled: { startDate: new Date(2026, 6, 14), endDate: new Date(2026, 6, 20) },
    serverClassElement: t => t.root.querySelector('#field'),
    blockers: t => [t.instance._startInput._inputElement, t.instance._endInput._inputElement],
    frame: t => t.root.querySelector('.form-date-time'),
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => pressArrowUp(sectionsOf(t)[0]),
    changeEvents: t => [
      [t.root.querySelector('#field'), 'startDateChange.coreui.date-range-input'],
      ...nativeChange(t.instance._startInput._inputElement)
    ],
    changeFromCode: t => t.instance.setRange(new Date(2026, 6, 15), new Date(2026, 6, 21)),
    rebuild: null,
    rejectedOption: null,
    required: { required: true }
  },
  {
    name: 'DatePicker',
    markup: serverClass => `<div${withClass(' id="field"', serverClass)}></div>${FEEDBACK}`,
    create: (root, config) => new DatePicker(root.querySelector('#field'), { locale: 'en-US', name: 'when', ...config }),
    filled: { date: new Date(2026, 6, 14) },
    serverClassElement: t => t.root.querySelector('#field'),
    blockers: t => [t.instance._input._inputElement],
    frame: t => t.instance._input._element,
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => t.root.querySelector('.form-control-cleaner').click(),
    changeEvents: t => [[t.root.querySelector('#field'), 'dateChange.coreui.date-picker'], ...nativeChange(t.instance._input._inputElement)],
    changeFromCode: t => t.instance.setDate(new Date(2026, 6, 15)),
    rebuild: null,
    rejectedOption: null,
    required: { required: true }
  },
  {
    name: 'TimePicker',
    markup: serverClass => `<div${withClass(' id="field"', serverClass)}></div>${FEEDBACK}`,
    create: (root, config) => new TimePicker(root.querySelector('#field'), { locale: 'en-US', name: 'at', ...config }),
    filled: { time: '10:30:00' },
    serverClassElement: t => t.root.querySelector('#field'),
    blockers: t => [t.instance._input._inputElement],
    frame: t => t.instance._input._element,
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => t.root.querySelector('.form-control-cleaner').click(),
    changeEvents: t => [[t.root.querySelector('#field'), 'timeChange.coreui.time-picker'], ...nativeChange(t.instance._input._inputElement)],
    changeFromCode: t => t.instance.setTime('11:45:00'),
    rebuild: null,
    rejectedOption: null,
    required: { required: true }
  },
  {
    name: 'DateRangePicker',
    markup: serverClass => `<div class="form-field"><div${withClass(' id="field"', serverClass)}></div>${FEEDBACK}</div>`,
    create: (root, config) => new DateRangePicker(root.querySelector('#field'), {
      locale: 'en-US', startName: 'from', endName: 'to', ...config
    }),
    filled: { startDate: new Date(2026, 6, 14), endDate: new Date(2026, 6, 20) },
    serverClassElement: t => t.root.querySelector('#field'),
    blockers: t => [t.instance._rangeInput._startInput._inputElement, t.instance._rangeInput._endInput._inputElement],
    frame: t => t.root.querySelector('.form-date-time'),
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => t.root.querySelector('.form-control-cleaner').click(),
    changeEvents: t => [
      [t.root.querySelector('#field'), 'startDateChange.coreui.date-range-picker'],
      ...nativeChange(t.instance._rangeInput._startInput._inputElement)
    ],
    changeFromCode: t => t.instance.setRange(new Date(2026, 6, 15), new Date(2026, 6, 21)),
    rebuild: null,
    rejectedOption: null,
    required: { required: true }
  },
  {
    name: 'OTPInput',
    markup: serverClass => `<div class="form-otp${serverClass ? ` ${serverClass}` : ''}"><input class="form-otp-control"></div>${FEEDBACK}`,
    create: (root, config) => new OTPInput(root.querySelector('.form-otp'), { name: 'code', ...config }),
    serverClassElement: t => t.root.querySelector('.form-otp'),
    blockers: t => [t.instance._inputElement],
    frame: t => t.root.querySelector('.form-otp'),
    invalidTargets: t => [...t.root.querySelectorAll('.form-otp-control')],
    describedTargets: t => [...t.root.querySelectorAll('.form-otp-control')],
    changeAsUser: t => typeInto(t.root.querySelector('.form-otp-control'), '1'),
    changeEvents: t => [[t.root.querySelector('.form-otp'), 'change.coreui.otp-input'], ...nativeChange(t.instance._inputElement)],
    changeFromCode: t => t.instance.setConfig({ value: '1' }),
    rebuild: t => t.instance.setConfig({ placeholder: '-' }),
    rejectedOption: { required: 'yes' },
    required: { required: true }
  },
  {
    name: 'RangeSlider',
    markup: serverClass => `<div${withClass(' id="field"', serverClass)}></div>${FEEDBACK}`,
    create: (root, config) => new RangeSlider(root.querySelector('#field'), { name: 'budget', value: [20, 80], ...config }),
    serverClassElement: t => t.root.querySelector('#field'),
    blockers: t => [t.root.querySelector('.form-range-input')],
    frame: t => t.root.querySelector('#field'),
    invalidTargets: t => [...t.root.querySelectorAll('.form-range-input')],
    describedTargets: t => [...t.root.querySelectorAll('.form-range-input')],
    changeAsUser: t => typeInto(t.root.querySelector('.form-range-input'), '30'),
    changeEvents: t => [[t.root.querySelector('#field'), 'input.coreui.range-slider']],
    changeFromCode: t => t.instance.setConfig({ value: [30, 70] }),
    rebuild: t => t.instance.setConfig({ step: 5 }),
    rejectedOption: { disabled: 'yes' },
    required: null,
    makeInvalid: t => t.root.querySelector('.form-range-input').setCustomValidity('Pick a higher budget.'),
    notApplicable: {
      reportedRebuild: 'its only invalidity is a custom validity the page set on a handle the rebuild replaces'
    }
  },
  {
    name: 'Rating',
    markup: serverClass => `<div${withClass(' id="field"', serverClass)}></div>${FEEDBACK}`,
    create: (root, config) => new Rating(root.querySelector('#field'), { name: 'score', ...config }),
    serverClassElement: t => t.root.querySelector('#field'),
    blockers: t => [t.root.querySelector('.rating-item-input:checked') ?? t.root.querySelector('.rating-item-input')],
    frame: t => t.root.querySelector('#field'),
    invalidTargets: t => [t.root.querySelector('#field')],
    describedTargets: t => [...t.root.querySelectorAll('.rating-item-input')],
    changeAsUser: t => t.root.querySelectorAll('.rating-item-label')[3].click(),
    changeEvents: t => [[t.root.querySelector('#field'), 'change.coreui.rating']],
    changeFromCode: t => t.instance.setConfig({ value: 4 }),
    rebuild: t => t.instance.setConfig({ itemCount: 6 }),
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
    fixtureEl.innerHTML = `<form>${adapter.markup(serverClass)}<button type="submit">Send</button></form>`
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
  const isBlocked = (adapter, t) => adapter.blockers(t).map(field => field.validity.customError)
  const describedBy = element => (element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)

  const reasonFor = (adapter, rule) => adapter.notApplicable?.[rule] ??
    ((rule === 'rejectedOption' && !adapter.rejectedOption) || (rule === 'reportedRebuild' && !adapter.rebuild) ? NO_REBUILD : null)

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

      expect(stateClasses(adapter.frame(t))).toEqual(['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBeTrue()

      const element = adapter.serverClassElement(t)
      dispose(t)

      expect(stateClasses(element)).toEqual(['is-invalid'])
    })
  })

  describe('a given invalid state', () => {
    conform('given', 'should show it on the frame, block with the message and describe the focus targets', adapter => {
      const t = mount(adapter, { config: { validationState: 'invalid' } })

      expect(stateClasses(adapter.frame(t))).toEqual(['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBeTrue()
      expect(adapter.blockers(t).map(field => field.validationMessage)).toEqual(adapter.blockers(t).map(() => 'Fix this field.'))
      expect(t.form.checkValidity()).toBeFalse()
      expect(adapter.invalidTargets(t).map(target => target.getAttribute('aria-invalid'))).toEqual(adapter.invalidTargets(t).map(() => 'true'))
      expect(adapter.describedTargets(t).length).toBeGreaterThan(0)
      expect(adapter.describedTargets(t).every(target => describedBy(target).includes('feedback'))).toBeTrue()
    })
  })

  describe('setConfig with the state alone', () => {
    conform('setConfig', 'should move between invalid, valid and none in place, blocking only while invalid', adapter => {
      const t = mount(adapter)
      const nodes = [...adapter.blockers(t), ...adapter.invalidTargets(t)]

      t.instance.setConfig({ validationState: 'invalid' })

      expect(stateClasses(adapter.frame(t))).toEqual(['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBeTrue()

      t.instance.setConfig({ validationState: 'valid' })

      expect(stateClasses(adapter.frame(t))).toEqual(['is-valid'])
      expect(isBlocked(adapter, t).some(Boolean)).toBeFalse()
      expect(adapter.invalidTargets(t).some(target => target.hasAttribute('aria-invalid'))).toBeFalse()

      t.instance.setConfig({ validationState: null })

      expect(stateClasses(adapter.frame(t))).toEqual([])
      expect(isBlocked(adapter, t).some(Boolean)).toBeFalse()
      expect([...adapter.blockers(t), ...adapter.invalidTargets(t)]).toEqual(nodes)
    })
  })

  describe('a rejected setConfig', () => {
    conform('rejectedState', 'should keep a state class from the markup when the state has the wrong type', adapter => {
      const t = mount(adapter, { serverClass: 'is-invalid' })

      expect(() => t.instance.setConfig({ validationState: 1 })).toThrowError(TypeError)
      adapter.changeFromCode(t)

      expect(stateClasses(adapter.frame(t))).toEqual(['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBeTrue()

      const element = adapter.serverClassElement(t)
      dispose(t)

      expect(stateClasses(element)).toEqual(['is-invalid'])
    })

    conform('rejectedOption', 'should keep a given state when another option has the wrong type', adapter => {
      const t = mount(adapter, { config: { validationState: 'invalid' } })

      expect(() => t.instance.setConfig(adapter.rejectedOption)).toThrowError(TypeError)
      adapter.changeFromCode(t)

      expect(stateClasses(adapter.frame(t))).toEqual(['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBeTrue()
    })
  })

  describe('a change of the value', () => {
    conform('userChange', 'should drop a given state when the user makes it, before the change events', adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })
      const seen = []

      for (const [target, type] of adapter.changeEvents(t)) {
        target.addEventListener(type, () => seen.push([type, stateClasses(adapter.frame(t)), isBlocked(adapter, t).some(Boolean)]))
      }

      adapter.changeAsUser(t)

      expect(seen.length).toBeGreaterThan(0)
      expect(seen).toEqual(seen.map(([type]) => [type, [], false]))
      expect(adapter.invalidTargets(t).some(target => target.hasAttribute('aria-invalid'))).toBeFalse()
    })

    conform('codeChange', 'should keep a given state when code makes it', adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })

      adapter.changeFromCode(t)

      expect(stateClasses(adapter.frame(t))).toEqual(['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBeTrue()
    })
  })

  describe('a native reset', () => {
    conform('reset', 'should drop a state given before it', async adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })

      t.form.reset()
      await tick()

      expect(stateClasses(adapter.frame(t))).toEqual([])
      expect(isBlocked(adapter, t).some(Boolean)).toBeFalse()
    })

    conform('reset', 'should keep a state given in a reset listener of the form', async adapter => {
      const t = mount(adapter, { config: adapter.filled })

      t.form.addEventListener('reset', () => t.instance.setConfig({ validationState: 'invalid' }))
      t.form.reset()
      await tick()

      expect(stateClasses(adapter.frame(t))).toEqual(['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBeTrue()
    })

    conform('reset', 'should keep a state given right after it', async adapter => {
      const t = mount(adapter, { config: adapter.filled })

      t.form.reset()
      t.instance.setConfig({ validationState: 'invalid' })
      await tick()

      expect(stateClasses(adapter.frame(t))).toEqual(['is-invalid'])
      expect(isBlocked(adapter, t).every(Boolean)).toBeTrue()
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

      expect(stateClasses(adapter.frame(t))).toEqual([])
      expect(t.form.checkValidity()).toBeFalse()
      expect(stateClasses(adapter.frame(t))).toEqual(['is-invalid'])
    })

    conform('reportedRebuild', 'should keep it through a setConfig that rebuilds the component', adapter => {
      const t = mountInvalid(adapter)

      t.form.checkValidity()
      adapter.rebuild(t)

      expect(stateClasses(adapter.frame(t))).toEqual(['is-invalid'])
    })
  })

  describe('dispose', () => {
    conform('dispose', 'should leave no state class, aria-invalid or block behind', adapter => {
      const t = mount(adapter, { config: { validationState: 'invalid' } })

      dispose(t)

      expect(fixtureEl.querySelectorAll('.is-invalid, .is-valid')).toHaveSize(0)
      expect(fixtureEl.querySelectorAll('[aria-invalid]')).toHaveSize(0)
      expect(t.form.checkValidity()).toBeTrue()
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

  describe('a disabled component', () => {
    conform('disabled', 'should show a given state without blocking', adapter => {
      const t = mount(adapter, { config: { disabled: true, validationState: 'invalid' } })

      expect(stateClasses(adapter.frame(t))).toEqual(['is-invalid'])
      expect(t.form.checkValidity()).toBeTrue()
    })
  })
})

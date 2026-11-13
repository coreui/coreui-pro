import Autocomplete from '../../src/autocomplete.js'
import ChipFilter from '../../src/chip-filter.js'
import ChipInput from '../../src/chip-input.js'
import Combobox from '../../src/combobox.js'
import DateInput from '../../src/date-input.js'
import DatePicker from '../../src/date-picker.js'
import DateRangeInput from '../../src/date-range-input.js'
import DateRangePicker from '../../src/date-range-picker.js'
import Form from '../../src/form.js'
import MultiSelect from '../../src/multi-select.js'
import OTPInput from '../../src/otp-input.js'
import RangeSlider from '../../src/range-slider.js'
import Rating from '../../src/rating.js'
import TimeInput from '../../src/time-input.js'
import TimePicker from '../../src/time-picker.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

const FEEDBACK = '<div class="invalid-feedback" id="feedback">Fix this field.</div>'
const GIVEN_STATES = ['invalid', 'valid', 'warning']
const VALIDATING = ' data-coreui-validate'
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

const noop = () => {}

const nativeMessage = attributes => Object.assign(document.createElement('input'), attributes).validationMessage
const LATEST_DAY = { config: { maxDate: new Date(2026, 11, 31) }, message: nativeMessage({ max: '2026-12-31', type: 'date', value: '2027-05-05' }) }
const EARLIEST_TIME = { config: { minDate: '09:30:00' }, message: nativeMessage({ min: '09:30', type: 'time', value: '08:00' }) }

const disableAndEnable = t => {
  t.instance.disable()
  t.instance.enable()
}

const clearAndReset = t => {
  t.instance.clear()
  t.instance.reset()
}

const ADAPTERS = [
  {
    name: 'MultiSelect',
    markup: attributes => `<select name="tech"${attributes()}></select>${FEEDBACK}`,
    create: (root, config) => new MultiSelect(root.querySelector('select'), {
      options: [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2' }],
      ...config
    }),
    host: t => t.root.querySelector('select'),
    valueFields: t => [t.instance._element],
    verdictField: t => t.form.elements.tech,
    frames: t => [t.instance._wrapperElement],
    hostClassCopies: t => [t.instance._wrapperElement],
    invalidTargets: t => [t.instance._getFocusTarget()],
    describedTargets: t => [t.instance._getFocusTarget()],
    changeAsUser: t => t.instance._optionsElement.querySelector('[data-coreui-value="1"]').click(),
    changeEvents: t => [[t.instance._element, 'change.coreui.multi-select'], ...nativeChange(t.instance._element)],
    changeMethods: [
      ['selectAll()', t => t.instance.selectAll()],
      ['deselectAll()', t => t.instance.deselectAll()],
      ['selectFiltered()', t => t.instance.selectFiltered()],
      ['deselectFiltered()', t => t.instance.deselectFiltered()]
    ],
    changeFromCode: t => t.instance.selectAll(),
    clearFromCode: t => t.instance.deselectAll(),
    value: t => t.instance.getValue(),
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
    host: t => t.root.querySelector('.autocomplete'),
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
    changeMethods: [
      ['clear()', t => t.instance.clear()],
      ['setOptions() with resetSelectionOnOptionsChange', t => t.instance.setOptions([{ label: 'Option 3', value: '3' }]), { config: { resetSelectionOnOptionsChange: true, value: '1' }, prepare: noop }]
    ],
    changeFromCode: t => t.instance.setValue('2'),
    clearFromCode: t => t.instance.clear(),
    value: t => t.instance._inputElement.value,
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
    host: t => t.root.querySelector('.combobox-toggle'),
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
    changeMethods: [
      ['clear()', t => t.instance.clear()],
      ['setOptions() with resetSelectionOnOptionsChange', t => t.instance.setOptions([{ label: 'Mexico', value: 'mx' }]), { config: { resetSelectionOnOptionsChange: true } }]
    ],
    changeFromCode: t => t.instance.setValue('ca'),
    clearFromCode: t => t.instance.clear(),
    value: t => t.instance.getValue(),
    required: { required: true }
  },
  {
    name: 'ChipFilter',
    markup: attributes => `<div${attributes('chip-filter')}><span class="chip">one</span><span class="chip">two</span></div>${FEEDBACK}`,
    create: (root, config) => new ChipFilter(root.querySelector('.chip-filter'), { name: 'tags', ...config }),
    host: t => t.root.querySelector('.chip-filter'),
    valueFields: t => [t.instance._valueField],
    verdictField: t => t.form.elements.tags,
    frames: t => [t.root.querySelector('.chip-filter')],
    invalidTargets: t => [t.root.querySelector('.chip-filter')],
    describedTargets: t => [t.root.querySelector('.chip-filter')],
    changeAsUser: t => t.root.querySelector('.chip').click(),
    changeEvents: t => [[t.root.querySelector('.chip-filter'), 'change.coreui.chip-filter'], ...nativeChange(t.instance._valueField)],
    changeMethods: [
      ['selectChip()', t => t.instance.selectChip(t.root.querySelectorAll('.chip')[1])],
      ['selectAll()', t => t.instance.selectAll()],
      ['deselectAll()', t => t.instance.deselectAll()],
      ['clear()', t => t.instance.clear()]
    ],
    changeFromCode: t => t.instance.selectChip(t.root.querySelector('.chip')),
    clearFromCode: t => t.instance.clear(),
    value: t => t.instance.getSelectedValues(),
    required: { required: true }
  },
  {
    name: 'ChipInput',
    markup: attributes => `<div${attributes('chip-input')}></div>${FEEDBACK}`,
    create: (root, config) => new ChipInput(root.querySelector('.chip-input'), { name: 'tags', ...config }),
    host: t => t.root.querySelector('.chip-input'),
    valueFields: t => [t.instance._valueField],
    verdictField: t => t.form.elements.tags,
    frames: t => [t.root.querySelector('.chip-input')],
    invalidTargets: t => [t.instance._input],
    describedTargets: t => [t.instance._input],
    changeAsUser: t => typeInto(t.instance._input, 'two,'),
    changeEvents: t => [[t.root.querySelector('.chip-input'), 'change.coreui.chip-input'], ...nativeChange(t.instance._valueField)],
    changeMethods: [
      ['add()', t => t.instance.add('three')],
      ['remove()', t => t.instance.remove('two')],
      ['clear()', t => t.instance.clear()]
    ],
    changeFromCode: t => t.instance.add('two'),
    clearFromCode: t => t.instance.clear(),
    value: t => t.instance.getValues(),
    required: { required: true }
  },
  {
    name: 'DateInput',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new DateInput(root.querySelector('#field'), {
      format: 'dd.MM.yyyy', locale: 'en-US', name: 'when', ...config
    }),
    filled: { date: new Date(2026, 6, 14) },
    host: t => t.root.querySelector('#field'),
    valueFields: t => [t.instance._inputElement],
    verdictField: t => t.form.elements.when,
    frames: t => [t.root.querySelector('#field')],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => pressArrowUp(sectionsOf(t)[0]),
    changeEvents: t => [[t.root.querySelector('#field'), 'dateChange.coreui.date-input'], ...nativeChange(t.instance._inputElement)],
    changeMethods: [
      ['clear()', t => t.instance.clear()],
      ['reset()', t => t.instance.reset()]
    ],
    changeFromCode: t => t.instance.setDate(new Date(2026, 6, 15)),
    clearFromCode: clearAndReset,
    value: t => t.instance.getDate(),
    reconfigure: disableAndEnable,
    rejected: { ...LATEST_DAY, config: { ...LATEST_DAY.config, date: new Date(2027, 4, 5) } },
    required: { required: true }
  },
  {
    name: 'TimeInput',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new TimeInput(root.querySelector('#field'), {
      format: 'HH:mm', locale: 'en-US', name: 'at', ...config
    }),
    filled: { date: '10:30:00' },
    host: t => t.root.querySelector('#field'),
    valueFields: t => [t.instance._inputElement],
    verdictField: t => t.form.elements.at,
    frames: t => [t.root.querySelector('#field')],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => pressArrowUp(sectionsOf(t)[0]),
    changeEvents: t => [[t.root.querySelector('#field'), 'timeChange.coreui.time-input'], ...nativeChange(t.instance._inputElement)],
    changeMethods: [
      ['clear()', t => t.instance.clear()],
      ['reset()', t => t.instance.reset()]
    ],
    changeFromCode: t => t.instance.setDate('11:45:00'),
    clearFromCode: clearAndReset,
    value: t => t.instance.getDate(),
    reconfigure: disableAndEnable,
    rejected: { ...EARLIEST_TIME, config: { ...EARLIEST_TIME.config, date: '08:00:00' } },
    required: { required: true }
  },
  {
    name: 'DateRangeInput',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new DateRangeInput(root.querySelector('#field'), {
      format: 'dd.MM.yyyy', locale: 'en-US', startName: 'from', endName: 'to', ...config
    }),
    filled: { startDate: new Date(2026, 6, 14), endDate: new Date(2026, 6, 20) },
    host: t => t.root.querySelector('#field'),
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
    changeMethods: [
      ['clear()', t => t.instance.clear()],
      ['reset()', t => t.instance.reset()]
    ],
    changeFromCode: t => t.instance.setRange(new Date(2026, 6, 15), new Date(2026, 6, 21)),
    clearFromCode: clearAndReset,
    value: t => [t.instance.getStartDate(), t.instance.getEndDate()],
    rejected: { ...LATEST_DAY, config: { ...LATEST_DAY.config, endDate: new Date(2027, 4, 5), startDate: new Date(2026, 5, 15) } },
    required: { required: true }
  },
  {
    name: 'DatePicker',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new DatePicker(root.querySelector('#field'), { locale: 'en-US', name: 'when', ...config }),
    filled: { date: new Date(2026, 6, 14) },
    host: t => t.root.querySelector('#field'),
    valueFields: t => [t.instance._input._inputElement],
    verdictField: t => t.form.elements.when,
    frames: t => [t.instance._input._element],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => t.root.querySelector('.form-control-cleaner').click(),
    changeEvents: t => [[t.root.querySelector('#field'), 'dateChange.coreui.date-picker'], ...nativeChange(t.instance._input._inputElement)],
    changeMethods: [
      ['clear()', t => t.instance.clear(), { prepare: noop }],
      ['reset()', t => t.instance.reset()],
      ['today()', t => t.instance.today()]
    ],
    changeFromCode: t => t.instance.setDate(new Date(2026, 6, 15)),
    clearFromCode: clearAndReset,
    value: t => t.instance.getDate(),
    rejected: { ...LATEST_DAY, config: { ...LATEST_DAY.config, date: new Date(2027, 4, 5) } },
    required: { required: true }
  },
  {
    name: 'TimePicker',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new TimePicker(root.querySelector('#field'), { locale: 'en-US', name: 'at', ...config }),
    filled: { time: '10:30:00' },
    host: t => t.root.querySelector('#field'),
    valueFields: t => [t.instance._input._inputElement],
    verdictField: t => t.form.elements.at,
    frames: t => [t.instance._input._element],
    invalidTargets: sectionsOf,
    describedTargets: sectionsOf,
    changeAsUser: t => t.root.querySelector('.form-control-cleaner').click(),
    changeEvents: t => [[t.root.querySelector('#field'), 'timeChange.coreui.time-picker'], ...nativeChange(t.instance._input._inputElement)],
    changeMethods: [
      ['clear()', t => t.instance.clear(), { prepare: noop }],
      ['reset()', t => t.instance.reset()],
      ['now()', t => t.instance.now()]
    ],
    changeFromCode: t => t.instance.setTime('11:45:00'),
    clearFromCode: clearAndReset,
    value: t => t.instance.getTime(),
    rejected: { ...EARLIEST_TIME, config: { ...EARLIEST_TIME.config, time: '08:00:00' } },
    required: { required: true }
  },
  {
    name: 'DateRangePicker',
    markup: attributes => `<div class="form-field"><div id="field"${attributes()}></div>${FEEDBACK}</div>`,
    create: (root, config) => new DateRangePicker(root.querySelector('#field'), {
      locale: 'en-US', startName: 'from', endName: 'to', ...config
    }),
    filled: { startDate: new Date(2026, 6, 14), endDate: new Date(2026, 6, 20) },
    host: t => t.root.querySelector('#field'),
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
    changeMethods: [
      ['clear()', t => t.instance.clear(), { prepare: noop }],
      ['reset()', t => t.instance.reset()]
    ],
    changeFromCode: t => t.instance.setRange(new Date(2026, 6, 15), new Date(2026, 6, 21)),
    clearFromCode: clearAndReset,
    value: t => [t.instance.getStartDate(), t.instance.getEndDate()],
    rejected: { ...LATEST_DAY, config: { ...LATEST_DAY.config, endDate: new Date(2027, 4, 5), startDate: new Date(2026, 5, 15) } },
    required: { required: true }
  },
  {
    name: 'OTPInput',
    markup: attributes => `<div${attributes('form-otp')}><input class="form-otp-control"></div>${FEEDBACK}`,
    create: (root, config) => new OTPInput(root.querySelector('.form-otp'), { name: 'code', ...config }),
    host: t => t.root.querySelector('.form-otp'),
    valueFields: t => [t.instance._inputElement],
    verdictField: t => t.form.elements.code,
    frames: t => [t.root.querySelector('.form-otp')],
    invalidTargets: t => [...t.root.querySelectorAll('.form-otp-control')],
    describedTargets: t => [...t.root.querySelectorAll('.form-otp-control')],
    changeAsUser: t => typeInto(t.root.querySelector('.form-otp-control'), '1'),
    changeEvents: t => [[t.root.querySelector('.form-otp'), 'change.coreui.otp-input'], ...nativeChange(t.instance._inputElement)],
    changeMethods: [
      ['clear()', t => t.instance.clear()],
      ['reset()', t => t.instance.reset()]
    ],
    changeFromCode: t => t.instance.setValue('1'),
    clearFromCode: clearAndReset,
    value: t => t.instance._value,
    reconfigure: disableAndEnable,
    required: { required: true }
  },
  {
    name: 'RangeSlider',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new RangeSlider(root.querySelector('#field'), { name: 'budget', value: [20, 80], ...config }),
    host: t => t.root.querySelector('#field'),
    valueFields: t => [...t.root.querySelectorAll('.form-range-input')],
    verdictField: t => t.form.elements['budget-0'],
    frames: t => [t.root.querySelector('#field'), ...t.root.querySelectorAll('.form-range-input')],
    invalidTargets: t => [...t.root.querySelectorAll('.form-range-input')],
    describedTargets: t => [...t.root.querySelectorAll('.form-range-input')],
    pageDescribed: t => [...t.root.querySelectorAll('.form-range-input')],
    changeAsUser(t) {
      const handle = t.root.querySelector('.form-range-input')

      typeInto(handle, '30')
      handle.dispatchEvent(new Event('change', { bubbles: true }))
    },
    changeEvents: t => [[t.root.querySelector('#field'), 'input.coreui.range-slider']],
    stateEvents: t => [[t.root.querySelector('#field'), 'change.coreui.range-slider']],
    changeFromCode: t => t.instance.setValue([30, 70]),
    value: t => t.instance._values(),
    reconfigure: disableAndEnable,
    required: null,
    makeInvalid: t => t.root.querySelector('.form-range-input').setCustomValidity('Pick a higher budget.'),
    notApplicable: {
      givenMethods: 'it has no clear() or reset() method',
      reportedReconfigure: 'its rebuild replaces the handles and leaves the validity the page set on the old ones behind',
      reportedResetReconfigure: 'its rebuild replaces the handles and leaves the validity the page set on the old ones behind'
    }
  },
  {
    name: 'Rating',
    markup: attributes => `<div id="field"${attributes()}></div>${FEEDBACK}`,
    create: (root, config) => new Rating(root.querySelector('#field'), { name: 'score', ...config }),
    host: t => t.root.querySelector('#field'),
    valueFields: t => [...t.root.querySelectorAll('.rating-item-input')],
    verdictField: t => t.form.querySelector('input[name="score"]:checked') ?? t.form.querySelector('input[name="score"]'),
    frames: t => [t.root.querySelector('#field')],
    invalidTargets: t => [t.root.querySelector('#field')],
    describedTargets: t => [...t.root.querySelectorAll('.rating-item-input')],
    pageDescribed: t => [t.root.querySelector('#field')],
    changeAsUser: t => t.root.querySelectorAll('.rating-item-label')[3].click(),
    changeEvents: t => [[t.root.querySelector('#field'), 'change.coreui.rating']],
    changeMethods: [['reset()', t => t.instance.reset()]],
    verdictEvents: t => [[t.root.querySelector('#field'), 'change.coreui.rating']],
    verdictChanges: [
      ['a pick', { value: 2 }, t => t.root.querySelectorAll('.rating-item-label')[3].click(), 'now'],
      ['allowClear', { allowClear: true, value: 2 }, t => t.root.querySelectorAll('.rating-item-input')[1].click(), 'focus']
    ],
    changeFromCode: t => t.instance.setValue(4),
    clearFromCode: t => t.instance.reset(),
    value: t => t.instance._currentValue,
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

  const mount = (adapter, {
    config = {}, data = '', form: formAttributes = '', pageClass = ''
  } = {}) => {
    const attributes = (base = '') => {
      const classes = [base, pageClass].filter(Boolean).join(' ')

      return `${classes ? ` class="${classes}"` : ''}${data} aria-describedby="hint"`
    }

    fixtureEl.innerHTML = `<div id="hint">Pick carefully.</div><form${formAttributes}>${adapter.markup(attributes)}<button type="submit">Send</button></form>`
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

  const givenClasses = element => [...element.classList].filter(name => /^is-(invalid|valid|warning)$/.test(name))
  const givenReading = (adapter, t) => [adapter.frames(t).map(givenClasses), ariaInvalid(t).length]
  const givenExpected = (adapter, t, given) => [adapter.frames(t).map(() => [`is-${given}`]), given === 'invalid' ? adapter.invalidTargets(t).length : 0]
  const stateEvents = (adapter, t) => adapter.stateEvents?.(t) ?? adapter.verdictEvents?.(t) ?? adapter.changeEvents(t).slice(0, 1)

  const reasonFor = (adapter, rule) => adapter.notApplicable?.[rule] ??
    (rule.endsWith('Reconfigure') && !adapter.reconfigure ? VALIDATION_ONLY : null) ??
    (rule === 'pageValueField' && !adapter.pageOwnsValueField ? 'its value field is built by the component' : null) ??
    (rule === 'pageClearsOnMethods' && !adapter.changeMethods ? 'none of its methods fires the change event' : null) ??
    (rule === 'rejected' && !adapter.rejected ? 'it rejects no value of its own' : null)

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

  describe('a state given with a data attribute', () => {
    conform('dataState', 'should show it on the frame, let the form submit and take it off on dispose', adapter => {
      const t = mount(adapter, { data: ' data-coreui-validation-state="invalid"' })

      expectFrames(adapter, t, ['is-invalid'])
      expect(ariaInvalid(t)).toEqual(adapter.invalidTargets(t))
      expect(describesFeedback(adapter, t)).toBe(true)
      expect(hasCustomError(adapter, t)).toBe(false)
      expect(t.form.checkValidity()).toBe(true)

      dispose(t)

      expect(shownStates(t)).toEqual([])
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
    conform('rejectedState', 'should keep a given state through a state of the wrong type', adapter => {
      const t = mount(adapter, { config: { validationState: 'invalid' } })

      expect(() => t.instance.setValidationState(1)).toThrowError(TypeError)
      adapter.changeFromCode(t)

      expectFrames(adapter, t, ['is-invalid'])
      expect(ariaInvalid(t)).toEqual(adapter.invalidTargets(t))
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

    for (const given of GIVEN_STATES) {
      conform('givenUserChange', `should keep a given ${given} state through a change of the user, at the change events and after`, adapter => {
        const t = mount(adapter, { config: { ...adapter.filled, validationState: given } })
        const seen = record(adapter, t, () => givenReading(adapter, t))

        adapter.changeAsUser(t)

        expect(seen.length).toBeGreaterThan(0)
        expect(seen).toEqual(seen.map(([type]) => [type, ...givenExpected(adapter, t, given)]))
        expect(givenReading(adapter, t)).toEqual(givenExpected(adapter, t, given))
      })
    }

    conform('pageClears', 'should drop a given state at once when the page sets it to null in the change event', adapter => {
      for (const [, config, act] of adapter.verdictChanges ?? [['', {}, adapter.changeAsUser]]) {
        const t = mount(adapter, { config: { ...adapter.filled, ...config, validationState: 'invalid' } })
        const seen = []

        t.verdictField = adapter.verdictField(t)

        for (const [target, type] of stateEvents(adapter, t)) {
          target.addEventListener(type, () => {
            t.instance.setValidationState(null)
            seen.push([shownStates(t), ariaInvalid(t).length, describesFeedback(adapter, t)])
          })
        }

        act(t)

        expect(seen.length).toBeGreaterThan(0)
        expect(seen).toEqual(seen.map(() => [[], 0, false]))
        expect(shownStates(t)).toEqual([])
        dispose(t)
      }
    })

    conform('userChangeReported', 'should show the state of the new value at the change events of a reported field in a form with data-coreui-validate', adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, ...adapter.required }, form: VALIDATING })
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

    for (const given of GIVEN_STATES) {
      conform('givenMethods', `should keep a given ${given} state through clear() and reset()`, adapter => {
        const t = mount(adapter, { config: { ...adapter.filled, validationState: given } })

        adapter.clearFromCode(t)

        expect(givenReading(adapter, t)).toEqual(givenExpected(adapter, t, given))
      })
    }

    conform('pageClearsOnMethods', 'fires the change event on its methods that change the value, so a page that clears the state there clears it on them', adapter => {
      for (const [, act, { config = {}, prepare = adapter.changeAsUser } = {}] of adapter.changeMethods) {
        const t = mount(adapter, { config: { ...adapter.filled, ...config, validationState: 'invalid' } })
        const seen = []

        prepare(t)

        for (const [target, type] of stateEvents(adapter, t)) {
          target.addEventListener(type, () => {
            seen.push(type)
            t.instance.setValidationState(null)
          })
        }

        act(t)

        expect(seen.length).toBeGreaterThan(0)
        expect(shownStates(t)).toEqual([])
        expect(ariaInvalid(t)).toEqual([])
        dispose(t)
      }
    })
  })

  describe('a native reset', () => {
    for (const given of GIVEN_STATES) {
      conform('givenReset', `should keep a given ${given} state`, async adapter => {
        const t = mount(adapter, { config: { ...adapter.filled, validationState: given } })

        t.form.reset()
        await tick()

        expect(givenReading(adapter, t)).toEqual(givenExpected(adapter, t, given))
      })
    }

    conform('pageClearsOnReset', 'fires the change event on a native reset, so a page that clears the state there clears it on reset', async adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })
      const seen = []

      adapter.changeAsUser(t)

      for (const [target, type] of stateEvents(adapter, t)) {
        target.addEventListener(type, () => {
          seen.push(type)
          t.instance.setValidationState(null)
        })
      }

      t.form.reset()
      await tick()

      expect(seen.length).toBeGreaterThan(0)
      expect(shownStates(t)).toEqual([])
      expect(ariaInvalid(t)).toEqual([])
    })

    conform('resetValue', 'should put back the value the component was built with after a change of the user', async adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })
      const built = JSON.stringify(adapter.value(t))

      adapter.changeAsUser(t)

      expect(JSON.stringify(adapter.value(t))).not.toBe(built)

      t.form.reset()
      await tick()

      expect(JSON.stringify(adapter.value(t))).toBe(built)
      expect(givenReading(adapter, t)).toEqual(givenExpected(adapter, t, 'invalid'))
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

    conform('resetReconfigure', 'should keep a state given before it after a setter of another option', async adapter => {
      const t = mount(adapter, { config: { ...adapter.filled, validationState: 'invalid' } })

      adapter.reconfigure(t)
      t.form.reset()
      await tick()

      expectFrames(adapter, t, ['is-invalid'])
      expect(ariaInvalid(t)).toEqual(adapter.invalidTargets(t))
    })
  })

  describe('a reported state', () => {
    const mountInvalid = (adapter, form = VALIDATING) => {
      const t = mount(adapter, { config: adapter.required ?? {}, form })
      adapter.makeInvalid?.(t)

      return t
    }

    const leaveField = (adapter, t) => {
      adapter.valueFields(t)[0].dispatchEvent(new FocusEvent('focusout'))
    }

    const expectDrawn = (adapter, t) => {
      expectFrames(adapter, t, ['is-invalid'])
      expect(ariaInvalid(t)).toEqual(adapter.invalidTargets(t))
      expect(describesFeedback(adapter, t)).toBe(true)
    }

    const expectNothingDrawn = (adapter, t) => {
      expect(shownStates(t)).toEqual([])
      expect(ariaInvalid(t)).toEqual([])
      expect(describesFeedback(adapter, t)).toBe(false)
    }

    conform('reportedPlain', 'draws nothing for an error the browser reported in a plain form, also after the user leaves the field', adapter => {
      const t = mountInvalid(adapter, '')

      expect(t.form.checkValidity()).toBe(false)
      expectNothingDrawn(adapter, t)

      leaveField(adapter, t)

      expectNothingDrawn(adapter, t)
    })

    conform('reportedValidating', 'draws an error the browser reported in a form with data-coreui-validate', adapter => {
      const t = mountInvalid(adapter)

      expect(t.form.checkValidity()).toBe(false)
      expectDrawn(adapter, t)

      leaveField(adapter, t)

      expectDrawn(adapter, t)
    })

    conform('reportedFormPlugin', 'draws an error reported in a form the Form plugin validates without data-coreui-validate', adapter => {
      const t = mountInvalid(adapter, ' novalidate')
      const form = Form.getOrCreateInstance(t.form)

      expect(form.validate()).toBe(false)
      expectDrawn(adapter, t)

      form.dispose()
    })

    conform('reportedWasValidated', 'draws nothing for an error the browser reported in a form with .was-validated, which the stylesheet does not paint', adapter => {
      const t = mountInvalid(adapter, ' class="was-validated"')

      expect(t.form.checkValidity()).toBe(false)
      expectNothingDrawn(adapter, t)
    })

    conform('reportedLive', 'starts drawing once the page adds data-coreui-validate before the draw, and stops at the next draw once the page removes it', adapter => {
      const t = mountInvalid(adapter, '')

      t.form.addEventListener('invalid', () => t.form.setAttribute('data-coreui-validate', ''), { capture: true, once: true })

      expect(t.form.checkValidity()).toBe(false)
      expectDrawn(adapter, t)

      t.form.removeAttribute('data-coreui-validate')
      leaveField(adapter, t)

      expectNothingDrawn(adapter, t)
    })

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
      const host = adapter.host(t)

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

  describe('a value it rejects', () => {
    const errorFields = (adapter, t) => adapter.valueFields(t).map(field => field.previousElementSibling)
    const drawn = (adapter, t) => adapter.frames(t).some(frame => frame.classList.contains('is-invalid'))

    conform('rejected', 'should block the submit, required or not, with the message of the browser on an unnamed control right before its value field', adapter => {
      for (const required of [false, true]) {
        const t = mount(adapter, { config: { ...adapter.rejected.config, required } })
        const invalid = []
        let submitted = false

        t.form.addEventListener('invalid', event => invalid.push(event.target), true)
        t.form.addEventListener('submit', () => {
          submitted = true
        })
        t.form.requestSubmit()

        expect(submitted).toBe(false)
        expect(errorFields(adapter, t)).toContain(invalid[0])
        expect([invalid[0].name, invalid[0].required, invalid[0].validationMessage]).toEqual(['', false, adapter.rejected.message])
        expect(t.root.contains(document.activeElement)).toBe(true)
        dispose(t)
      }
    })

    conform('rejected', 'should draw the value at once in a plain, a validating and a novalidate form', adapter => {
      for (const form of ['', VALIDATING, ' novalidate']) {
        const t = mount(adapter, { config: adapter.rejected.config, form })

        expect([drawn(adapter, t), describesFeedback(adapter, t)], form).toEqual([true, true])
        expect(ariaInvalid(t).length).toBeGreaterThan(0)
        dispose(t)
      }
    })

    conform('rejected', 'should lift the block with clear()', adapter => {
      const t = mount(adapter, { config: adapter.rejected.config })

      expect(t.form.checkValidity()).toBe(false)

      t.instance.clear()

      expect(t.form.checkValidity()).toBe(true)
    })

    conform('rejected', 'should leave one error control per value field after a dispose and a new instance', adapter => {
      const t = mount(adapter, { config: adapter.rejected.config })
      const count = () => [...t.form.elements].filter(element => element.tagName === 'TEXTAREA' && !element.name).length

      dispose(t)

      expect([count(), t.form.checkValidity()]).toEqual([0, true])

      const instance = adapter.create(fixtureEl, adapter.rejected.config)

      live.add(instance)

      expect([count(), t.form.checkValidity()]).toEqual([adapter.valueFields({ ...t, instance }).length, false])
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
    conform('pageVerdict', 'should stop the submit with a custom validity and let it through once the page clears it on the documented event, in a form with data-coreui-validate', adapter => {
      for (const [, config, act, shown] of adapter.verdictChanges ?? [['', {}, adapter.changeAsUser, 'now']]) {
        const t = mount(adapter, { config: { ...adapter.filled, ...config }, form: VALIDATING })
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

  describe('a state class the page writes', () => {
    const pageClassElements = (adapter, t) => [adapter.host(t), ...(adapter.hostClassCopies?.(t) ?? [])]
    const otherFrames = (adapter, t) => adapter.frames(t).filter(frame => !pageClassElements(adapter, t).includes(frame))

    conform('pageClassRead', 'should not be read from the element of the component', adapter => {
      const t = mount(adapter, { pageClass: 'is-invalid' })

      expect(pageClassElements(adapter, t).map(stateClasses)).toEqual(pageClassElements(adapter, t).map(() => ['is-invalid']))
      expect(otherFrames(adapter, t).map(stateClasses)).toEqual(otherFrames(adapter, t).map(() => []))
      expect(ariaInvalid(t)).toHaveLength(0)
      expect(describesFeedback(adapter, t)).toBe(false)
    })

    conform('pageClassWithdrawn', 'should stay on the element of the component when its given state is withdrawn', adapter => {
      const t = mount(adapter, { config: { validationState: 'invalid' }, pageClass: 'is-invalid' })

      expectFrames(adapter, t, ['is-invalid'])

      t.instance.setValidationState(null)

      expect(pageClassElements(adapter, t).map(stateClasses)).toEqual(pageClassElements(adapter, t).map(() => ['is-invalid']))
      expect(otherFrames(adapter, t).map(stateClasses)).toEqual(otherFrames(adapter, t).map(() => []))
      expect(ariaInvalid(t)).toHaveLength(0)
    })

    conform('pageClassDispose', 'should not come back on dispose once the page took it off', adapter => {
      const t = mount(adapter, { pageClass: 'is-invalid' })
      const host = adapter.host(t)

      host.classList.remove('is-invalid')
      dispose(t)

      expect(stateClasses(host)).toEqual([])
    })

    conform('pageClass', 'should stay on a frame when the given state goes', adapter => {
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

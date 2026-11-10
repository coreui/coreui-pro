/*!
 * Every field component in three kinds of form and with three given states:
 * read at load, after submitting the empty required field and after a native
 * reset, then held to the same rules, one observable per rule. The custom
 * components also take their state from a server class and from
 * `setValidationState()`, and have to read as with the option. What a field
 * shows is decided by the stylesheet, `:user-invalid` and the accessibility
 * tree, which only a real browser has. A combination listed in KNOWN_FAILURES
 * has to keep failing its rule, so the list shrinks with every fix.
 * Copyright 2026 The Bootstrap Authors
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 */

import { cdp, page, userEvent } from 'vitest/browser'
import { vi } from 'vitest'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import * as coreui from '../../index.esm.js'

const MODES = {
  m0: '',
  m1: ' data-coreui-validate',
  m2: ' data-coreui-validate novalidate'
}
const ALL_MODES = Object.keys(MODES)
const GIVEN = ['', 'invalid', 'valid']
const STATES = new Set(['invalid', 'valid'])

const COMPONENTS = {
  input: '<input id="field" class="form-control" required name="v">',
  textarea: '<textarea id="field" class="form-control" required name="v"></textarea>',
  select: '<select id="field" class="form-control" required name="v"><option value="">Open</option><option value="1">One</option></select>',
  checkbox: '<input type="checkbox" id="field" class="check" required name="v">',
  radio: '<input type="radio" id="field" class="radio" required name="v" value="a">',
  switch: '<input type="checkbox" role="switch" id="field" class="switch" required name="v">',
  number: '<input type="number" id="field" class="form-control" required name="v" data-coreui-number-input>',
  password: '<input type="password" id="field" class="form-control" required name="v" data-coreui-password-input>',
  autocomplete: '<div data-coreui-autocomplete data-coreui-id="field" data-coreui-name="v" data-coreui-options="Alpha, Beta" data-coreui-required="true"></div>',
  combobox: '<button class="form-control combobox-toggle" type="button" id="field" data-coreui-toggle="combobox" data-coreui-name="v" data-coreui-required="true"></button><div class="popup combobox-popup"><div class="list-box"><div class="list-box-options" role="listbox" aria-label="Field"><div class="list-box-option" data-coreui-value="a">Alpha</div><div class="list-box-option" data-coreui-value="b">Beta</div></div></div></div>',
  multiselect: '<select id="field" data-coreui-multi-select multiple data-coreui-required="true" name="v"><option value="a">Alpha</option><option value="b">Beta</option></select>',
  chipinput: '<div id="field" class="chip-input" data-coreui-chip-input data-coreui-name="v" data-coreui-required="true"><label class="chip-input-label" for="field-input">Field</label></div>',
  chipfilter: '<div id="field" class="chip-set chip-filter" aria-labelledby="lbl" data-coreui-chip-filter data-coreui-name="v" data-coreui-required="true"><span class="chip">Alpha</span><span class="chip">Beta</span></div>',
  dateinput: '<div id="field" class="form-control form-date-time" data-coreui-date-input data-coreui-locale="en-US" data-coreui-name="v" data-coreui-required="true" aria-labelledby="lbl"></div>',
  timeinput: '<div id="field" class="form-control form-date-time" data-coreui-time-input data-coreui-locale="en-US" data-coreui-name="v" data-coreui-required="true" aria-labelledby="lbl"></div>',
  daterangeinput: '<div id="field" data-coreui-date-range-input data-coreui-locale="en-US" data-coreui-start-name="v" data-coreui-end-name="w" data-coreui-required="true" aria-labelledby="lbl"></div>',
  datepicker: '<div id="field" data-coreui-date-picker data-coreui-locale="en-US" data-coreui-name="v" data-coreui-required="true"></div>',
  daterangepicker: '<div id="field" data-coreui-date-range-picker data-coreui-locale="en-US" data-coreui-start-name="v" data-coreui-end-name="w" data-coreui-required="true"></div>',
  timepicker: '<div id="field" data-coreui-time-picker data-coreui-locale="en-US" data-coreui-name="v" data-coreui-required="true"></div>',
  otp: '<div id="field" class="form-otp" data-coreui-otp aria-labelledby="lbl" data-coreui-name="v" data-coreui-required="true"><input class="form-otp-control"><input class="form-otp-control"><input class="form-otp-control"><input class="form-otp-control"></div>',
  rating: '<div id="field" aria-labelledby="lbl" data-coreui-rating data-coreui-name="v" data-coreui-required="true"></div>',
  rangeslider: '<div id="field" data-coreui-range-slider data-coreui-value="25,75" data-coreui-name="v"></div>'
}

const NATIVE = new Set(['input', 'textarea', 'select', 'checkbox', 'radio', 'switch', 'number', 'password'])
const CUSTOM = Object.keys(COMPONENTS).filter(component => !NATIVE.has(component))

const SUBMITTED_NAMES = {
  daterangeinput: ['v', 'w'],
  daterangepicker: ['v', 'w'],
  rangeslider: ['v-0', 'v-1'],
  rating: ['v', 'v', 'v', 'v', 'v']
}

const STATE_READINGS = ['ariaInvalid', 'constraint', 'green', 'invalidFeedback', 'isInvalid', 'isValid', 'red', 'validFeedback']

const shownText = (feedback, text) => feedback.some(item => item.shown && item.text === text)
const bad = step => shownText(step.invalidFeedback, 'BAD')
const ok = step => shownText(step.validFeedback, 'OK')
const red = step => step.red.length > 0
const green = step => step.green.length > 0
const required = cell => cell.component !== 'rangeslider'
const plain = cell => !cell.given
const emptySubmit = cell => required(cell) && plain(cell)
const reportedMode = cell => emptySubmit(cell) && cell.mode !== 'm0'
const scriptMode = cell => emptySubmit(cell) && cell.mode === 'm2'
const givenInvalid = cell => cell.given === 'invalid'
const givenValid = cell => cell.given === 'valid'
const givenInvalidComponent = cell => givenInvalid(cell) && !NATIVE.has(cell.component)
const givenValidSubmit = cell => givenValid(cell) && required(cell)
const always = () => true

const RULES = [
  ['mount: no console or page errors', always, ({ errors }) => errors.length === 0],
  ['load, no given state: no invalid colour', plain, ({ load }) => !red(load)],
  ['load, no given state: no BAD', plain, ({ load }) => !bad(load)],
  ['load, no given state: no aria-invalid', plain, ({ load }) => load.ariaInvalid.length === 0],
  ['load, no given state: no is-invalid class', plain, ({ load }) => load.isInvalid.length === 0],
  ['load: the value is submitted under the documented names', always, ({ load }, { component }) => JSON.stringify(load.names) === JSON.stringify(SUBMITTED_NAMES[component] ?? ['v'])],
  ['submit of an empty required field is blocked', cell => required(cell) && !givenValid(cell), ({ submit }) => submit.submits === 0],
  ['submit: focus lands inside the field', emptySubmit, ({ submit }) => submit.activeInField],
  ['submit: the focused element is outside aria-hidden', emptySubmit, ({ submit }) => !submit.activeHidden],
  ['submit: the focused element has an accessible name', emptySubmit, ({ submit }) => !submit.activeInField || Boolean(submit.ax?.name)],
  ['submit m1/m2: BAD shown', reportedMode, ({ submit }) => bad(submit)],
  ['submit m1/m2: invalid colour in the field', reportedMode, ({ submit }) => red(submit)],
  ['submit m2: the focused element is invalid for assistive technology', scriptMode, ({ submit }) => Boolean(submit.ax?.invalid) && submit.ax.invalid !== 'false'],
  ['submit m2: the focused element is described by BAD', scriptMode, ({ submit }) => Boolean(submit.ax?.description?.includes('BAD'))],
  ['submit, no given state: no OK', emptySubmit, ({ submit }) => !ok(submit)],
  ['submit, no given state: no valid colour', emptySubmit, ({ submit }) => !green(submit)],
  ['submit: aria-invalid only outside aria-hidden', always, ({ submit }) => !submit.ariaInvalid.some(item => item.includes('(hidden)'))],
  ['submit: aria-invalid only on rendered elements', always, ({ submit }) => !submit.ariaInvalid.some(item => item.includes('(not rendered)'))],
  ['reset after submit, no given state: no invalid colour', emptySubmit, ({ reset }) => !red(reset)],
  ['reset after submit, no given state: no BAD', emptySubmit, ({ reset }) => !bad(reset)],
  ['reset after submit, no given state: no aria-invalid', emptySubmit, ({ reset }) => reset.ariaInvalid.length === 0],
  ['reset after submit, no given state: no is-invalid class', emptySubmit, ({ reset }) => reset.isInvalid.length === 0],
  ['given invalid at load: invalid colour', givenInvalid, ({ load }) => red(load)],
  ['given invalid at load: BAD shown', givenInvalid, ({ load }) => bad(load)],
  ['given invalid at load: aria-invalid on a visible element (components)', givenInvalidComponent, ({ load }) => load.ariaInvalid.some(item => !item.includes('('))],
  ['given invalid at load: the value field blocks with the feedback text (components)', givenInvalidComponent, ({ load }) => load.constraint.some(item => item.includes('BAD'))],
  ['given valid at load: valid colour', givenValid, ({ load }) => green(load)],
  ['given valid at load: OK shown', givenValid, ({ load }) => ok(load)],
  ['given valid at load: no invalid colour', givenValid, ({ load }) => !red(load)],
  ['given valid at load: no BAD', givenValid, ({ load }) => !bad(load)],
  ['given valid, empty required, after submit: no invalid colour', givenValidSubmit, ({ submit }) => !red(submit)],
  ['given valid, empty required, after submit: no BAD', givenValidSubmit, ({ submit }) => !bad(submit)],
  ['given valid, empty required, after submit: valid colour', givenValidSubmit, ({ submit }) => green(submit)],
  ['given valid, empty required, after submit: OK shown', givenValidSubmit, ({ submit }) => ok(submit)]
]

const SOURCES = {
  'server class': (host, given) => host.classList.add(`is-${given}`),
  'setValidationState()': (host, given) => instanceOf(host).setValidationState(given)
}

const SOURCE_RULES = [
  ...Object.keys(SOURCES).flatMap(source => STATE_READINGS.map(reading => `${source}: ${reading} as with the option`)),
  ...STATE_READINGS.map(reading => `setValidationState(null): ${reading} as with no state`)
]

const sourceCell = cell => CUSTOM.includes(cell.component) && cell.mode === 'm2' && STATES.has(cell.given)

const COVERAGE = new Map([...RULES.map(([title, applies]) => [title, applies]), ...SOURCE_RULES.map(title => [title, sourceCell])])

const KNOWN_FAILURES = [
  ['submit m1/m2: invalid colour in the field', ['chipfilter', 'rating'], ['m1', 'm2'], ['']],
  ['submit m2: the focused element is invalid for assistive technology', ['chipfilter'], ['m2'], ['']],
  ['submit m2: the focused element is described by BAD', ['chipfilter'], ['m2'], ['']],
  ['reset after submit, no given state: no invalid colour', ['checkbox', 'radio', 'switch'], ['m1'], ['']],
  ['reset after submit, no given state: no BAD', ['checkbox', 'radio', 'switch'], ['m1'], ['']],
  ['given invalid at load: invalid colour', ['chipfilter', 'rangeslider', 'rating'], ALL_MODES, ['invalid']],
  ['given valid at load: valid colour', ['chipfilter', 'rangeslider', 'rating'], ALL_MODES, ['valid']],
  ['given valid, empty required, after submit: no invalid colour', ['autocomplete', 'checkbox', 'input', 'multiselect', 'number', 'otp', 'password', 'radio', 'select', 'switch', 'textarea'], ['m1', 'm2'], ['valid']],
  ['given valid, empty required, after submit: no BAD', ['autocomplete', 'checkbox', 'chipinput', 'combobox', 'input', 'multiselect', 'number', 'otp', 'password', 'radio', 'select', 'switch', 'textarea'], ['m1', 'm2'], ['valid']],
  ['given valid, empty required, after submit: valid colour', ['autocomplete', 'checkbox', 'input', 'multiselect', 'number', 'password', 'radio', 'select', 'switch', 'textarea'], ['m1', 'm2'], ['valid']],
  ['given valid, empty required, after submit: valid colour', ['chipfilter', 'otp', 'rating'], ALL_MODES, ['valid']],
  ['given valid, empty required, after submit: OK shown', ['autocomplete', 'chipinput', 'datepicker', 'daterangeinput', 'daterangepicker', 'multiselect', 'number', 'password', 'timepicker'], ['m1', 'm2'], ['valid']]
]

const isKnownFailure = (title, { component, given, mode }) => KNOWN_FAILURES.some(([rule, components, modes, givens]) =>
  rule === title && components.includes(component) && modes.includes(mode) && givens.includes(given))

let container
let submits
const errors = []

function instanceOf(element) {
  return Object.values(coreui).map(Component => Component.getInstance?.(element)).find(Boolean)
}

const describeElement = element => {
  const type = element.tagName === 'INPUT' ? `[${element.type}]` : ''
  const classes = typeof element.className === 'string' ? element.className.trim().split(/\s+/).filter(name => name && !name.startsWith('is-')).slice(0, 2) : []

  return `${element.tagName.toLowerCase()}${type}${classes.map(name => `.${name}`).join('')}`
}

const isRendered = element => {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)

  return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
}

const isAriaHidden = element => Boolean(element.closest('[aria-hidden="true"]'))
const borderColour = id => getComputedStyle(document.getElementById(id)).borderTopColor

const read = form => {
  const field = form.querySelector('.probe-field')
  const active = document.activeElement
  const feedback = selector => [...form.querySelectorAll(selector)].map(element => ({ shown: isRendered(element), text: element.textContent.trim() }))
  const coloured = colour => [...field.querySelectorAll('*')]
    .filter(element => isRendered(element) && Number.parseFloat(getComputedStyle(element).borderTopWidth) > 0 && getComputedStyle(element).borderTopColor === colour)
    .map(describeElement)

  return {
    activeHidden: active !== document.body && isAriaHidden(active),
    activeInField: field.contains(active),
    ariaInvalid: [...form.querySelectorAll('[aria-invalid="true"]')].map(element => describeElement(element) + (isAriaHidden(element) ? '(hidden)' : '') + (isRendered(element) ? '' : '(not rendered)')),
    constraint: [...form.elements].filter(element => element.willValidate && !element.validity.valid).map(element => `${describeElement(element)}: ${element.validationMessage}`),
    green: coloured(borderColour('ref-valid')),
    invalidFeedback: feedback('.invalid-feedback, .invalid-tooltip'),
    isInvalid: [...form.querySelectorAll('.is-invalid')].map(describeElement),
    isValid: [...form.querySelectorAll('.is-valid')].map(describeElement),
    names: [...form.elements].filter(element => element.name).map(element => element.name),
    red: coloured(borderColour('ref-invalid')),
    submits,
    validFeedback: feedback('.valid-feedback, .valid-tooltip')
  }
}

const focusedNode = async () => {
  if (document.activeElement === document.body) {
    return null
  }

  const session = cdp()
  const { frameTree } = await session.send('Page.getFrameTree')
  const frames = []
  const collect = tree => {
    frames.push(tree.frame)

    for (const child of tree.childFrames ?? []) {
      collect(child)
    }
  }

  collect(frameTree)

  const { nodes } = await session.send('Accessibility.getFullAXTree', { frameId: frames.find(frame => frame.url === location.href).id })
  const node = nodes.findLast(candidate => candidate.properties?.some(({ name, value }) => name === 'focused' && value.value))

  if (!node || node.role?.value === 'RootWebArea') {
    return { ignored: true }
  }

  const property = name => node.properties.find(candidate => candidate.name === name)?.value.value

  return { description: node.description?.value ?? '', invalid: property('invalid') ?? '', name: node.name?.value ?? '' }
}

const nextFrame = () => new Promise(resolve => {
  requestAnimationFrame(() => setTimeout(resolve))
})

const settled = async form => {
  let current = JSON.stringify(read(form))
  let stableFrames = 0

  for (let frame = 0; frame < 30 && stableFrames < 2; frame++) {
    // eslint-disable-next-line no-await-in-loop
    await nextFrame()
    const next = JSON.stringify(read(form))
    stableFrames = next === current ? stableFrames + 1 : 0
    current = next
  }

  return JSON.parse(current)
}

const countSubmit = event => {
  if (!event.defaultPrevented) {
    submits++
  }

  event.preventDefault()
}

const recordError = event => errors.push(String(event.error ?? event.reason))

const unmount = () => {
  for (const element of container?.querySelectorAll('*') ?? []) {
    instanceOf(element)?.dispose()
  }

  container?.remove()
  container = null
}

const mount = ({ component, given, mode }, source = 'option') => {
  unmount()
  container = document.createElement('div')
  container.style.padding = '40px'
  container.innerHTML = `<input id="ref-invalid" class="form-control is-invalid" aria-label="ref"><input id="ref-valid" class="form-control is-valid" aria-label="ref"><button id="before" type="button">Before</button><form${MODES[mode]}><div class="form-field probe-field"><label class="form-label" for="field" id="lbl">Field</label>${COMPONENTS[component]}<div class="invalid-feedback">BAD</div><div class="valid-feedback">OK</div></div><button id="send">Send</button><button id="rst" type="reset">Reset</button></form>`
  document.body.append(container)

  const host = container.querySelector('#lbl').nextElementSibling

  if (given && source === 'option') {
    if (NATIVE.has(component)) {
      host.classList.add(`is-${given}`)
    } else {
      host.dataset.coreuiValidationState = given
    }
  }

  if (given && source === 'server class') {
    SOURCES[source](host, given)
  }

  document.dispatchEvent(new Event('DOMContentLoaded'))
  window.dispatchEvent(new Event('load'))

  if (given && source === 'setValidationState()') {
    SOURCES[source](host, given)
  }

  return { form: container.querySelector('form'), host }
}

const runCell = async cell => {
  const { form } = mount(cell)
  const load = await settled(form)

  container.querySelector('#before').focus()
  await userEvent.click(container.querySelector('#send'))
  const submit = await settled(form)
  submit.ax = await focusedNode()

  await userEvent.click(container.querySelector('#rst'))
  const reset = await settled(form)

  return {
    errors: [...errors], load, reset, submit
  }
}

const loadReading = async (cell, source) => settled(mount(cell, source).form)

const expectRule = (title, cell, passed, details) => {
  const known = isKnownFailure(title, cell)

  expect.soft(passed, `${title}${known ? ' (listed as a known failure)' : ''}\n${JSON.stringify(details, null, 1)}`).toBe(!known)
}

describe('field validation matrix', () => {
  let consoleError

  beforeAll(async () => {
    await page.viewport(900, 700)

    const style = document.createElement('style')
    style.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'
    document.head.append(style)
  })

  beforeEach(() => {
    submits = 0
    errors.length = 0
    consoleError = vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(args.join(' ')))
    window.addEventListener('submit', countSubmit)
    window.addEventListener('error', recordError)
    window.addEventListener('unhandledrejection', recordError)
  })

  afterEach(() => {
    unmount()
    consoleError.mockRestore()
    window.removeEventListener('submit', countSubmit)
    window.removeEventListener('error', recordError)
    window.removeEventListener('unhandledrejection', recordError)
  })

  it('lists known failures only for rules that cover them', () => {
    for (const [title, components, modes, givens] of KNOWN_FAILURES) {
      expect(COVERAGE.has(title), title).toBe(true)

      for (const component of components) {
        for (const mode of modes) {
          for (const given of givens) {
            expect(COVERAGE.get(title)({ component, given, mode }), `${title}: ${component} ${mode} ${given || 'none'}`).toBe(true)
          }
        }
      }
    }
  })

  for (const component of Object.keys(COMPONENTS)) {
    for (const mode of ALL_MODES) {
      for (const given of GIVEN) {
        const cell = { component, given, mode }

        it(`${component} in ${mode} with ${given || 'no'} given state`, async () => {
          const run = await runCell(cell)

          for (const [title, applies, passes] of RULES) {
            if (applies(cell)) {
              expectRule(title, cell, passes(run, cell), run)
            }
          }
        })
      }
    }
  }

  for (const component of CUSTOM) {
    for (const given of STATES) {
      const cell = { component, given, mode: 'm2' }

      it(`${component} given ${given} by a server class reads as with the option`, async () => {
        const expected = await loadReading(cell)
        const actual = await loadReading(cell, 'server class')

        for (const reading of STATE_READINGS) {
          expectRule(`server class: ${reading} as with the option`, cell, JSON.stringify(actual[reading]) === JSON.stringify(expected[reading]), { actual, expected })
        }
      })

      it(`${component} given ${given} by setValidationState() reads as with the option, and as with no state after null`, async () => {
        const expected = await loadReading(cell)
        const none = await loadReading({ ...cell, given: '' })
        const { form, host } = mount(cell, 'setValidationState()')
        const actual = await settled(form)

        for (const reading of STATE_READINGS) {
          expectRule(`setValidationState(): ${reading} as with the option`, cell, JSON.stringify(actual[reading]) === JSON.stringify(expected[reading]), { actual, expected })
        }

        instanceOf(host).setValidationState(null)
        const cleared = await settled(form)

        for (const reading of STATE_READINGS) {
          expectRule(`setValidationState(null): ${reading} as with no state`, cell, JSON.stringify(cleared[reading]) === JSON.stringify(none[reading]), { cleared, none })
        }
      })
    }
  }
})

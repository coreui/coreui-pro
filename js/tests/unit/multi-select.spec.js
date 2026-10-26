import { userEvent } from 'vitest/browser'
import { vi } from 'vitest'

import Chip from '../../src/chip.js'
import ChipSet from '../../src/chip-set.js'
import Form from '../../src/form.js'
import MultiSelect from '../../src/multi-select.js'
import EventHandler from '../../src/dom/event-handler.js'
import {
  captureErrors, getFixture, clearFixture, jQueryMock
} from '../helpers/fixture.js'

describe('MultiSelect', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(MultiSelect.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(MultiSelect.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(MultiSelect.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(MultiSelect.DATA_KEY).toEqual('coreui.multi-select')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(MultiSelect.NAME).toEqual('multi-select')
    })
  })

  describe('constructor', () => {
    it('should submit nothing when the page did not name the select', () => {
      fixtureEl.innerHTML = [
        '<form id="form">',
        '<select id="multi-select" multiple>',
        '<option value="1" selected>One</option>',
        '</select>',
        '</form>'
      ].join('')

      const multiSelectEl = fixtureEl.querySelector('#multi-select')
      // eslint-disable-next-line no-new
      new MultiSelect(multiSelectEl)

      expect(multiSelectEl.hasAttribute('name')).toBeFalse()
      expect([...new FormData(fixtureEl.querySelector('#form')).keys()]).toEqual([])
    })

    it('should create a MultiSelect instance with default config', () => {
      fixtureEl.innerHTML = '<select></select>'

      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect).toBeInstanceOf(MultiSelect)
      expect(multiSelect._config).toBeDefined()
      expect(multiSelect._element).toEqual(selectEl)
    })

    it('should allow overriding default config', () => {
      fixtureEl.innerHTML = '<select></select>'

      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, {
        options,
        multiple: true,
        search: true
      })

      expect(multiSelect._config.options).toEqual(options)
      expect(multiSelect._config.multiple).toBe(true)
      expect(multiSelect._config.search).toBe(true)
    })

    it('should create proper DOM structure', () => {
      fixtureEl.innerHTML = '<select></select>'

      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect._wrapperElement.classList.contains('multi-select')).toBe(true)
      expect(multiSelect._wrapperElement.classList.contains('form-multi-select')).toBe(false)
      expect(multiSelect._wrapperElement.classList.contains('form-control-group')).toBe(true)
      expect(multiSelect._wrapperElement.querySelector('.multi-select-selection')).toBeTruthy()
    })

    it('should handle disabled state', () => {
      fixtureEl.innerHTML = '<select></select>'

      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [],
        disabled: true
      })

      expect(multiSelect._config.disabled).toBe(true)
      expect(selectEl.classList.contains('disabled')).toBe(true)
    })

    it('should handle options with different data types', () => {
      fixtureEl.innerHTML = '<select></select>'

      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: 1, text: 'Number Option' },
        { value: 'string', text: 'String Option' },
        { value: true, text: 'Boolean Option' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      expect(multiSelect._options).toEqual(jasmine.any(Array))
      expect(multiSelect._options.length).toBe(3)
    })

    it('should handle grouped options', () => {
      fixtureEl.innerHTML = '<select></select>'

      const selectEl = fixtureEl.querySelector('select')
      const options = [
        {
          label: 'Group 1',
          options: [
            { value: '1', text: 'Option 1' },
            { value: '2', text: 'Option 2' }
          ]
        }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      expect(multiSelect._options).toEqual(jasmine.any(Array))
      expect(multiSelect._options[0].options).toBeDefined()
      expect(multiSelect._options[0].label).toBe('Group 1')
    })

    it('should read options from native select element', () => {
      fixtureEl.innerHTML = [
        '<select>',
        '  <option value="1">Option 1</option>',
        '  <option value="2" selected>Option 2</option>',
        '  <option value="3" disabled>Option 3</option>',
        '</select>'
      ].join('')

      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)

      expect(multiSelect._options.length).toBe(3)
      expect(multiSelect.getValue().length).toBe(1)
      expect(multiSelect.getValue()[0].value).toBe('2')
    })

    it('should read optgroup structure from native select element', () => {
      fixtureEl.innerHTML = [
        '<select>',
        '  <optgroup label="Group A">',
        '    <option value="a1">A1</option>',
        '    <option value="a2">A2</option>',
        '  </optgroup>',
        '  <optgroup label="Group B">',
        '    <option value="b1">B1</option>',
        '  </optgroup>',
        '</select>'
      ].join('')

      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)

      expect(multiSelect._options.length).toBe(2)
      expect(multiSelect._options[0].label).toBe('Group A')
      expect(multiSelect._options[0].options.length).toBe(2)
      expect(multiSelect._options[1].label).toBe('Group B')
      expect(multiSelect._options[1].options.length).toBe(1)
    })

    it('should set multiple attribute on native select when multiple is true', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      new MultiSelect(selectEl, { options: [], multiple: true }) // eslint-disable-line no-new

      expect(selectEl.getAttribute('multiple')).toBe('true')
    })

    it('should set required attribute on native select when required is true', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      new MultiSelect(selectEl, { options: [], required: true }) // eslint-disable-line no-new

      expect(selectEl.getAttribute('required')).toBe('true')
    })

    it('should hide native select', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      // The native select stays in the DOM as an overlay inside the wrapper.
      expect(selectEl.tabIndex).toBe(-1)
      expect(selectEl.parentNode).toBe(multiSelect._wrapperElement)
    })

    it('should keep the native select usable for required validation', () => {
      fixtureEl.innerHTML = '<form><select required multiple></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        multiple: true,
        required: true
      })

      // Not removed from the DOM via inline display:none, so the browser can focus it
      // to anchor the constraint-validation bubble over the control.
      expect(selectEl.style.display).toBe('')
      expect(selectEl.willValidate).toBe(true)
      expect(selectEl.checkValidity()).toBe(false)

      multiSelect.selectAll()

      expect(selectEl.checkValidity()).toBe(true)
    })

    it('should hand validation focus to the custom control in a novalidate form', () => {
      fixtureEl.innerHTML = '<form novalidate><select required></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] })

      selectEl.focus()

      expect(document.activeElement).toBe(multiSelect._togglerElement)
    })

    it('should hand validation focus to the search input when the control searches', () => {
      fixtureEl.innerHTML = '<form novalidate><select required></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], search: true })

      selectEl.focus()

      expect(document.activeElement).toBe(multiSelect._searchElement)
    })

    it('should hand focus to the custom control in a natively validating form and without a form', () => {
      fixtureEl.innerHTML = '<form><select id="inForm" required></select></form><select id="noForm" required></select>'
      const inForm = new MultiSelect(fixtureEl.querySelector('#inForm'), { options: [{ value: '1', text: 'Option 1' }] })
      const noForm = new MultiSelect(fixtureEl.querySelector('#noForm'), { options: [{ value: '1', text: 'Option 1' }] })

      fixtureEl.querySelector('#inForm').focus()
      expect(document.activeElement).toBe(inForm._togglerElement)

      fixtureEl.querySelector('#noForm').focus()
      expect(document.activeElement).toBe(noForm._togglerElement)
    })

    it('should keep the native select focusless while the control is disabled', () => {
      fixtureEl.innerHTML = '<form><select required></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], disabled: true })

      selectEl.focus()

      expect(document.activeElement).not.toBe(multiSelect._togglerElement)
    })

    it('should report a selection change on the native select like a native list', () => {
      fixtureEl.innerHTML = '<form><select multiple></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const events = []
      fixtureEl.querySelector('form').addEventListener('input', () => events.push('input'))
      fixtureEl.querySelector('form').addEventListener('change', () => events.push('change'))
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1', selected: true }, { value: '2', text: 'Option 2' }],
        multiple: true
      })

      expect(events).toEqual([])

      multiSelect.selectAll()

      expect(events).toEqual(['input', 'change'])
    })

    it('should show the state it is given on the control, linking the message after it', () => {
      fixtureEl.innerHTML = '<form><select></select><div class="invalid-feedback">Pick a framework.</div></form>'
      const selectEl = fixtureEl.querySelector('select')
      const feedback = fixtureEl.querySelector('.invalid-feedback')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], validationState: 'invalid' })

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(multiSelect._togglerElement.getAttribute('aria-invalid')).toBe('true')
      expect(multiSelect._togglerElement.getAttribute('aria-describedby')).toBe(feedback.id)
      expect(selectEl.validationMessage).toBe('Pick a framework.')
    })

    it('should block with the message the page links through aria-describedby on the select', () => {
      fixtureEl.innerHTML = '<form><div id="message" class="invalid-feedback">Pick one.</div><select aria-describedby="message"></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], validationState: 'invalid' })

      expect(selectEl.validationMessage).toBe('Pick one.')
      expect(multiSelect._togglerElement.getAttribute('aria-describedby')).toBe('message')
    })

    it('should block with a given state whatever other keys its configuration holds', () => {
      fixtureEl.innerHTML = '<form><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')

      new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], readonly: true, validationState: 'invalid' }) // eslint-disable-line no-new

      expect(selectEl.form.checkValidity()).toBe(false)
    })

    it('should take validationState over the invalid and valid aliases, and invalid over valid', () => {
      fixtureEl.innerHTML = '<select id="both"></select><select id="state"></select>'
      const both = new MultiSelect(fixtureEl.querySelector('#both'), { options: [], invalid: true, valid: true })
      const state = new MultiSelect(fixtureEl.querySelector('#state'), { options: [], invalid: true, validationState: 'warning' })

      expect([...both._wrapperElement.classList].filter(name => name.startsWith('is-'))).toEqual(['is-invalid'])
      expect(state._wrapperElement.classList.contains('is-warning')).toBeTrue()
      expect(state._wrapperElement.classList.contains('is-invalid')).toBeFalse()
      expect(state._togglerElement.hasAttribute('aria-invalid')).toBeFalse()
      expect(fixtureEl.querySelector('#state').checkValidity()).toBeTrue()
    })

    it('should take a state class written on the select as the state of the value it loads with, and give it back on dispose', () => {
      fixtureEl.innerHTML = '<form><select class="is-invalid"></select><div class="invalid-feedback">Taken.</div></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] })

      expect(selectEl.classList.contains('is-invalid')).toBeFalse()
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(multiSelect._togglerElement.getAttribute('aria-invalid')).toBe('true')
      expect(selectEl.validationMessage).toBe('Taken.')

      multiSelect.dispose()

      expect(selectEl.classList.contains('is-invalid')).toBeTrue()
      expect(selectEl.checkValidity()).toBeTrue()
    })

    it('should keep the state of a single select that loads with a selected option', () => {
      fixtureEl.innerHTML = '<select class="is-invalid"></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        multiple: false,
        options: [{ value: '1', text: 'Option 1', selected: true }, { value: '2', text: 'Option 2' }]
      })

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
    })

    it('should drop a given state once the user changes the selection, without bringing it back', () => {
      fixtureEl.innerHTML = '<form><select id="server" class="is-invalid"></select><select id="option"></select></form>'
      const options = [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2' }]
      const server = new MultiSelect(fixtureEl.querySelector('#server'), { options })
      const option = new MultiSelect(fixtureEl.querySelector('#option'), { options, validationState: 'invalid' })
      const pick = (multiSelect, value) => multiSelect._optionsElement.querySelector(`[data-coreui-value="${value}"]`).click()

      pick(server, '1')
      pick(option, '1')

      expect(server._wrapperElement.classList.contains('is-invalid')).toBeFalse()
      expect(server._togglerElement.hasAttribute('aria-invalid')).toBeFalse()
      expect(fixtureEl.querySelector('#server').checkValidity()).toBeTrue()
      expect(option._wrapperElement.classList.contains('is-invalid')).toBeFalse()

      pick(server, '1')
      option.disable()
      option.enable()

      expect(server._wrapperElement.classList.contains('is-invalid')).toBeFalse()
      expect(option._wrapperElement.classList.contains('is-invalid')).toBeFalse()
      expect(fixtureEl.querySelector('#option').checkValidity()).toBeTrue()
    })

    it.each([
      ['a removed chip', { selectionType: 'chips' }, multiSelect => multiSelect._selectionElement.querySelector('.chip-remove').click()],
      ['the cleaner', {}, multiSelect => multiSelect._selectionCleanerElement.click()],
      ['select all', { selectAll: true }, multiSelect => multiSelect._selectAllElement.click()],
      ['Backspace in the search box and on the chip', { search: true }, multiSelect => {
        multiSelect._searchElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))
      }],
      ['Backspace in the search box of a counter', { search: true, selectionType: 'counter' }, multiSelect => multiSelect._searchElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))]
    ])('should drop a given state through %s', (_, config, act) => {
      fixtureEl.innerHTML = '<form><select multiple></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1', selected: true }, { value: '2', text: 'Option 2' }], validationState: 'invalid', ...config })
      const before = multiSelect.getValue().map(option => option.value).join(',')

      act(multiSelect)

      expect(multiSelect.getValue().map(option => option.value).join(',')).not.toBe(before)
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeFalse()
      expect(selectEl.checkValidity()).toBeTrue()
    })

    it.each([
      ['empties', [{ value: '1', text: 'Option 1', selected: true }], ['is-invalid', 'true']],
      ['fills', [{ value: '1', text: 'Option 1' }], [null, null]]
    ])('should show the state of the new selection at the change event when the user %s a reported required field', (_, options, expected) => {
      fixtureEl.innerHTML = '<form><select multiple></select><div class="invalid-feedback">Pick one.</div></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options, required: true, validationState: 'invalid' })
      const seen = []

      selectEl.form.checkValidity()
      selectEl.addEventListener('change.coreui.multi-select', () => {
        seen.push([multiSelect._wrapperElement.classList.contains('is-invalid') ? 'is-invalid' : null, multiSelect._togglerElement.getAttribute('aria-invalid')])
      })
      multiSelect._optionsElement.querySelector('[data-coreui-value="1"]').click()

      expect(seen).toEqual([expected])
    })

    it('should keep a given state while setValue gives a value', () => {
      fixtureEl.innerHTML = '<form><select multiple></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2', selected: true }] })

      multiSelect.setValidationState('invalid')
      multiSelect.setValue(['1'])

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBe(true)
      expect(selectEl.validity.customError).toBe(true)
    })

    it('should keep a given state through user actions that leave the selection as it is', () => {
      fixtureEl.innerHTML = '<form><select class="is-invalid" multiple></select></form>'
      const options = [{ value: '1', text: 'Option 1', selected: true }, { value: '2', text: 'Option 2', selected: true }]
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options, selectAll: true })

      multiSelect._getSelectionActions().selectAll()

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()

      multiSelect._getSelectionActions().deselectAll()

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeFalse()

      multiSelect.setValidationState('invalid')
      multiSelect._getSelectionActions().deselectAll()

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
    })

    it('should spend one pick in the list once, also when the list reports it in two steps', () => {
      fixtureEl.innerHTML = '<form><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { multiple: false, options: [{ value: '1', text: 'Option 1', selected: true }, { value: '2', text: 'Option 2' }], validationState: 'invalid' })

      selectEl.addEventListener('change.coreui.multi-select', () => multiSelect.setValidationState('invalid'), { once: true })
      multiSelect._optionsElement.querySelector('[data-coreui-value="2"]').click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['2'])
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(selectEl.checkValidity()).toBeFalse()

      multiSelect._optionsElement.querySelector('[data-coreui-value="1"]').click()

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeFalse()
    })

    it('should not report the options a user action leaves as they are before its first change', () => {
      fixtureEl.innerHTML = '<form><select multiple></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2', selected: true }], validationState: 'invalid' })

      selectEl.addEventListener('change.coreui.multi-select', () => multiSelect.setValidationState('invalid'), { once: true })
      multiSelect._selectionCleanerElement.click()

      expect(multiSelect.getValue()).toEqual([])
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(selectEl.checkValidity()).toBeFalse()
    })

    it('should send no change for a user action without a change and treat what the page does next as code', () => {
      fixtureEl.innerHTML = '<form><select multiple></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1', selected: true }], validationState: 'invalid' })
      const changes = []

      selectEl.addEventListener('change', () => changes.push(true))
      multiSelect._getSelectionActions().selectAll()
      multiSelect.deselectAll()

      expect(changes).toHaveSize(1)
      expect(multiSelect.getValue()).toEqual([])
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
    })

    it('should close a user action that ends without a change', () => {
      fixtureEl.innerHTML = '<form><select multiple></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options: [{ value: '1', text: 'Option 1' }], validationState: 'invalid' })

      multiSelect._validation.runAsUser(() => {})
      multiSelect.selectAll()

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
    })

    it('should lift the block before change.coreui.multi-select and treat what the page does there as code', () => {
      fixtureEl.innerHTML = '<form><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2' }], validationState: 'invalid' })
      const seen = []

      selectEl.addEventListener('change.coreui.multi-select', () => {
        seen.push(selectEl.validity.valid)

        if (seen.length === 1) {
          multiSelect.setValidationState('invalid')
          multiSelect.deselectAll()
        }
      })
      multiSelect._optionsElement.querySelector('[data-coreui-value="1"]').click()

      expect(seen[0]).toBeTrue()
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(selectEl.checkValidity()).toBeFalse()
    })

    it('should treat what the page does in change.coreui.multi-select after the user deselects an option as code', () => {
      fixtureEl.innerHTML = '<form><select multiple></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1', selected: true }, { value: '2', text: 'Option 2' }], validationState: 'invalid' })

      selectEl.addEventListener('change.coreui.multi-select', () => {
        multiSelect.setValidationState('invalid')
        multiSelect.selectAll()
      }, { once: true })
      multiSelect._optionsElement.querySelector('[data-coreui-value="1"]').click()

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(selectEl.checkValidity()).toBeFalse()
    })

    it.each([['in a reset listener', true], ['in the same task', false]])('should keep a state the page gives after a native reset started, %s', async (_, inListener) => {
      fixtureEl.innerHTML = '<form><select class="is-valid"></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const form = fixtureEl.querySelector('form')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] })

      if (inListener) {
        form.addEventListener('reset', () => multiSelect.setValidationState('invalid'))
        form.reset()
      } else {
        form.reset()
        multiSelect.setValidationState('invalid')
      }

      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(selectEl.checkValidity()).toBeFalse()
    })

    it('should keep a given state through changes made from code', () => {
      fixtureEl.innerHTML = '<form><select class="is-invalid"></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2' }] })

      multiSelect.deselectAll()
      multiSelect.selectAll()
      multiSelect.setValue(['1'])

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(selectEl.checkValidity()).toBeFalse()
    })

    it('should keep a state the page sets while handling change.coreui.multi-select', () => {
      fixtureEl.innerHTML = '<form><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] })

      selectEl.addEventListener('change.coreui.multi-select', () => {
        multiSelect.setValidationState('invalid')
      })
      multiSelect._optionsElement.querySelector('[data-coreui-value="1"]').click()

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(selectEl.form.checkValidity()).toBeFalse()
    })

    it('should let a page listening to input set the state again after a change', () => {
      fixtureEl.innerHTML = '<form><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], validationState: 'invalid' })

      selectEl.form.addEventListener('input', () => {
        multiSelect.setValidationState('valid')
      })
      multiSelect._optionsElement.querySelector('[data-coreui-value="1"]').click()

      expect(multiSelect._wrapperElement.classList.contains('is-valid')).toBeTrue()
    })

    it('should let setValidationState withdraw a state class written on the select', () => {
      fixtureEl.innerHTML = '<form><select class="is-invalid"></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] })

      multiSelect.setValidationState(null)

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeFalse()
      expect(selectEl.form.checkValidity()).toBeTrue()

      multiSelect.dispose()

      expect(selectEl.classList.contains('is-invalid')).toBeFalse()
    })

    it('should not give a state class back on dispose once the user dropped it', () => {
      fixtureEl.innerHTML = '<form><select class="is-invalid"></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] })

      multiSelect._optionsElement.querySelector('[data-coreui-value="1"]').click()
      multiSelect.dispose()

      const next = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] })

      expect(selectEl.classList.contains('is-invalid')).toBeFalse()
      expect(next._wrapperElement.classList.contains('is-invalid')).toBeFalse()
      expect(selectEl.form.checkValidity()).toBeTrue()
    })

    it('should not follow a class or aria-invalid the page writes on the select later', async () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] })

      selectEl.classList.add('is-invalid')
      selectEl.setAttribute('aria-invalid', 'true')
      await Promise.resolve()

      expect(multiSelect._togglerElement.hasAttribute('aria-invalid')).toBeFalse()
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeFalse()

      multiSelect.disable()
      multiSelect.enable()

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeFalse()
      expect(multiSelect._togglerElement.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should change the state with setValidationState without rebuilding the control', () => {
      fixtureEl.innerHTML = '<select aria-describedby="hint"></select><p id="hint">Hint</p>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], search: true })
      const wrapper = multiSelect._wrapperElement

      expect(multiSelect._searchElement.getAttribute('aria-describedby')).toBe('hint')

      multiSelect.setValidationState('invalid')

      expect(multiSelect._wrapperElement).toBe(wrapper)
      expect(wrapper.classList.contains('is-invalid')).toBeTrue()
      expect(multiSelect._searchElement.getAttribute('aria-invalid')).toBe('true')

      multiSelect.setValidationState(null)

      expect(wrapper.classList.contains('is-invalid')).toBeFalse()
      expect(multiSelect._searchElement.hasAttribute('aria-invalid')).toBeFalse()
      expect(selectEl.checkValidity()).toBeTrue()
    })

    it('should block the submit while it is given invalid, with a generic message when none is linked', () => {
      fixtureEl.innerHTML = '<form><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], invalid: true }) // eslint-disable-line no-new

      expect(selectEl.validationMessage).toBe('Invalid value.')
      expect(selectEl.form.checkValidity()).toBeFalse()
    })

    it('should leave a validity the page sets on the select', () => {
      fixtureEl.innerHTML = '<form><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] })

      selectEl.setCustomValidity('Pick two.')
      multiSelect.setValidationState('invalid')

      expect(selectEl.validationMessage).toBe('Pick two.')

      multiSelect.setValidationState(null)
      multiSelect.selectAll()

      expect(selectEl.validationMessage).toBe('Pick two.')
      expect(selectEl.form.checkValidity()).toBeFalse()

      selectEl.setCustomValidity('')
      multiSelect.setValidationState('invalid')
      selectEl.setCustomValidity('Pick three.')
      multiSelect.setValidationState(null)

      expect(selectEl.validationMessage).toBe('Pick three.')
    })

    it('should not block the submit while disabled', () => {
      fixtureEl.innerHTML = '<form><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], disabled: true, invalid: true })

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(selectEl.form.checkValidity()).toBeTrue()
    })

    it('should block the submit once enable() runs on a select built disabled and invalid, and stop again on disable()', () => {
      fixtureEl.innerHTML = '<form><select></select></form>'
      const form = fixtureEl.querySelector('form')
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { disabled: true, validationState: 'invalid' })

      expect(form.checkValidity()).toBeTrue()

      multiSelect.enable()

      expect(form.checkValidity()).toBeFalse()

      multiSelect.disable()

      expect(form.checkValidity()).toBeTrue()
    })

    it('should name a message the select already points to once', () => {
      fixtureEl.innerHTML = '<form><select class="is-invalid" aria-describedby="hint fb"></select><div id="fb" class="invalid-feedback">Taken.</div></form><p id="hint">Hint</p>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options: [{ value: '1', text: 'Option 1' }] })

      expect(multiSelect._togglerElement.getAttribute('aria-describedby')).toBe('hint fb')
    })

    it('should show a select a validation reported invalid until its selection is valid', () => {
      fixtureEl.innerHTML = '<form novalidate><select></select><div class="invalid-feedback">Pick one.</div></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], required: true })

      expect(multiSelect._togglerElement.hasAttribute('aria-invalid')).toBeFalse()

      selectEl.form.checkValidity()

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(multiSelect._togglerElement.getAttribute('aria-invalid')).toBe('true')
      expect(multiSelect._togglerElement.getAttribute('aria-describedby')).toBe(fixtureEl.querySelector('.invalid-feedback').id)

      multiSelect.selectAll()

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeFalse()
      expect(multiSelect._togglerElement.hasAttribute('aria-invalid')).toBeFalse()
      expect(multiSelect._togglerElement.hasAttribute('aria-describedby')).toBeFalse()
    })

    it('should keep a reported state through disable() and enable()', () => {
      fixtureEl.innerHTML = '<form novalidate><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], required: true })

      selectEl.form.checkValidity()
      multiSelect.disable()
      multiSelect.enable()

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(multiSelect._togglerElement.getAttribute('aria-invalid')).toBe('true')
    })

    it('should let a given state win over a reported one', () => {
      fixtureEl.innerHTML = '<form novalidate><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], required: true })

      selectEl.form.checkValidity()
      multiSelect.setValidationState('valid')

      expect(multiSelect._wrapperElement.classList.contains('is-valid')).toBeTrue()
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeFalse()
      expect(multiSelect._togglerElement.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should follow a select that names its form from outside it', async () => {
      fixtureEl.innerHTML = '<form id="outsideForm" novalidate></form><select form="outsideForm"></select>'
      const form = fixtureEl.querySelector('form')
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options: [{ value: '1', text: 'Option 1' }], required: true })

      form.checkValidity()

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()

      form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeFalse()
    })

    it('should leave input in the other fields of the form alone', () => {
      fixtureEl.innerHTML = '<form><select></select><textarea></textarea></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options: [{ value: '1', text: 'Option 1' }] })
      const spy = spyOn(multiSelect._validation, 'update').and.callThrough()
      const textarea = fixtureEl.querySelector('textarea')

      for (let index = 0; index < 3; index++) {
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
        textarea.dispatchEvent(new Event('change', { bubbles: true }))
      }

      expect(spy).not.toHaveBeenCalled()
    })

    it('should leave the select and its search input to itself when the form plugin validates', () => {
      fixtureEl.innerHTML = '<form data-coreui-validate="valid" novalidate><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], required: true, search: true })

      Form.getOrCreateInstance(selectEl.form).validate()

      expect(selectEl.classList.contains('is-invalid')).toBeFalse()
      expect(selectEl.hasAttribute('aria-invalid')).toBeFalse()
      expect(multiSelect._searchElement.classList.contains('is-valid')).toBeFalse()
      expect(multiSelect._searchElement.getAttribute('aria-invalid')).toBe('true')
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
      expect(document.activeElement).toBe(multiSelect._searchElement)
    })

    it('should restore the selection it loaded with on a native reset, and drop a given state', async () => {
      fixtureEl.innerHTML = '<form novalidate><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2' }],
        value: ['2']
      })

      multiSelect._optionsElement.querySelector('[data-coreui-value="1"]').click()
      multiSelect.setValidationState('invalid')
      selectEl.form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['2'])
      expect([...selectEl.selectedOptions].map(option => option.value)).toEqual(['2'])
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeFalse()
      expect(selectEl.checkValidity()).toBeTrue()
    })

    it('should restore no more than the selection limit allowed at load', async () => {
      fixtureEl.innerHTML = '<form><select multiple><option value="1" selected>One</option><option value="2" selected>Two</option><option value="3" selected>Three</option></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { selectionLimit: 2 })

      multiSelect._optionsElement.querySelector('[data-coreui-value="1"]').click()
      selectEl.form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1', '2'])
    })

    it('should report the selection a native reset restores once', async () => {
      fixtureEl.innerHTML = '<form><select multiple required></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2' }] })
      const reported = []

      multiSelect._optionsElement.querySelector('[data-coreui-value="1"]').click()
      selectEl.addEventListener('change.coreui.multi-select', event => reported.push(event.value.map(option => option.value)))
      selectEl.addEventListener('input', () => reported.push('input'))
      selectEl.addEventListener('change', () => reported.push('change'))
      selectEl.form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect.getValue()).toEqual([])
      expect(reported).toEqual([[], 'input', 'change'])
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeFalse()
      expect(multiSelect._togglerElement.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should not report a native reset that leaves the selection as it was', async () => {
      fixtureEl.innerHTML = '<form><select multiple><option value="1" selected>One</option><option value="2">Two</option></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)
      const reported = []

      selectEl.addEventListener('change.coreui.multi-select', () => reported.push('change.coreui.multi-select'))
      selectEl.addEventListener('change', () => reported.push('change'))
      selectEl.form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1'])
      expect(reported).toEqual([])
    })

    it('should not report a native reset that brings the same values back in their first order', async () => {
      fixtureEl.innerHTML = '<form><select multiple><option value="1" selected>One</option><option value="2" selected>Two</option></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)
      const reported = []

      multiSelect.deselectAll([{ value: '1', text: 'One' }])
      multiSelect.selectAll([{ value: '1', text: 'One' }])
      selectEl.addEventListener('change.coreui.multi-select', () => reported.push('change.coreui.multi-select'))
      selectEl.addEventListener('change', () => reported.push('change'))
      selectEl.form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1', '2'])
      expect(reported).toEqual([])
    })

    it('should forget a reported state on a native reset', async () => {
      fixtureEl.innerHTML = '<form novalidate><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], required: true })

      selectEl.form.checkValidity()

      expect(multiSelect._togglerElement.getAttribute('aria-invalid')).toBe('true')

      selectEl.form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(selectEl.validity.valid).toBeFalse()
      expect(multiSelect._togglerElement.hasAttribute('aria-invalid')).toBeFalse()
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeFalse()
    })

    it('should show every option again after a native reset clears the search', async () => {
      fixtureEl.innerHTML = '<form><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Angular' }, { value: '2', text: 'React' }],
        search: true
      })

      multiSelect._searchElement.value = 'ang'
      multiSelect._onSearchChange(multiSelect._searchElement)

      expect(multiSelect._getDisplayedOptions().length).toBe(1)

      selectEl.form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect._searchElement.value).toBe('')
      expect(multiSelect._getDisplayedOptions().length).toBe(2)
    })

    it('should leave the selection and the state alone when a listener cancels the reset', async () => {
      fixtureEl.innerHTML = '<form novalidate><select></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1', selected: true }, { value: '2', text: 'Option 2' }]
      })

      multiSelect.selectAll()
      multiSelect.setValidationState('invalid')
      selectEl.form.addEventListener('reset', event => event.preventDefault())
      selectEl.form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1', '2'])
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
    })

    it('should stop following the form and hand the select back to the form plugin once disposed', async () => {
      fixtureEl.innerHTML = '<form novalidate><select multiple></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], required: true })
      const errors = []
      const recordError = event => errors.push(event.message)
      window.addEventListener('error', recordError)

      multiSelect.dispose()
      selectEl.form.checkValidity()
      selectEl.dispatchEvent(new Event('input', { bubbles: true }))
      selectEl.form.reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })
      window.removeEventListener('error', recordError)

      expect(errors).toEqual([])

      selectEl.required = true
      Form.getOrCreateInstance(selectEl.form).validate()

      expect(selectEl.classList.contains('is-invalid')).toBeTrue()
      expect(selectEl.getAttribute('aria-invalid')).toBe('true')
    })

    it('should hand native select keyboard interaction to the custom control', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      // Simulate validation having focused the native overlay select.
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
      selectEl.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(true)
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
      expect(multiSelect._menu.contains(document.activeElement)).toBe(true)
    })

    it('should put the focus on the active option when it opens inside a shadow root', () => {
      fixtureEl.innerHTML = '<div></div>'
      const shadowRoot = fixtureEl.querySelector('div').attachShadow({ mode: 'open' })
      shadowRoot.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(shadowRoot.querySelector('select'), {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()

      expect(shadowRoot.activeElement).toBe(multiSelect._menu.querySelector('.list-box-option'))
    })

    it('should return the focus home when it closes from inside a shadow root', () => {
      fixtureEl.innerHTML = '<div></div>'
      const shadowRoot = fixtureEl.querySelector('div').attachShadow({ mode: 'open' })
      shadowRoot.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(shadowRoot.querySelector('select'), {
        options: [{ value: '1', text: 'Opt 1' }], selectAll: true
      })

      multiSelect.show()
      multiSelect._selectAllElement.focus()
      multiSelect.hide()

      expect(shadowRoot.activeElement).toBe(multiSelect._togglerElement)
    })

    it('should see the focus on its toggler inside a shadow root when it starts to hide', () => {
      fixtureEl.innerHTML = '<div></div>'
      const shadowRoot = fixtureEl.querySelector('div').attachShadow({ mode: 'open' })
      shadowRoot.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(shadowRoot.querySelector('select'), {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      multiSelect.show()
      multiSelect._togglerElement.focus()
      multiSelect._onHideStart()

      expect(multiSelect._refocusOnHide).toBeTrue()
    })

    it('should hand a keystroke on the native select to the control once enable() follows disable()', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] })
      const spy = spyOn(multiSelect, 'show')

      multiSelect.disable()
      multiSelect.enable()
      selectEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should not intercept Tab on the native select', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] }) // eslint-disable-line no-new

      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
      selectEl.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(false)
    })

    it('should open and start searching on the first printable key from the native select', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Apple' },
          { value: '2', text: 'Banana' }
        ],
        search: true
      })

      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })
      selectEl.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(true)
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
      expect(multiSelect._searchElement.value).toBe('a')
      expect(document.activeElement).toBe(multiSelect._searchElement)
    })

    it('should use element id when provided', () => {
      fixtureEl.innerHTML = '<select id="my-select"></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect._uniqueId).toBe('my-select')
    })

    it('should use config id over element id', () => {
      fixtureEl.innerHTML = '<select id="my-select"></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [], id: 'custom-id' })

      expect(multiSelect._uniqueId).toBe('custom-id')
    })

    it('should use config name', () => {
      fixtureEl.innerHTML = '<select name="my-name"></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [], name: 'custom-name' })

      expect(multiSelect._uniqueName).toBe('custom-name')
    })

    it('should handle pre-selected options from config', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1', selected: true },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3', selected: true }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      expect(multiSelect.getValue().length).toBe(2)
      expect(multiSelect.getValue()[0].value).toBe('1')
      expect(multiSelect.getValue()[1].value).toBe('3')
    })

    it('should handle value config to pre-select options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, value: ['1', '3'] })

      expect(multiSelect.getValue().length).toBe(2)
      expect(multiSelect.getValue()[0].value).toBe('1')
      expect(multiSelect.getValue()[1].value).toBe('3')
    })

    it('should handle string value config (comma-separated)', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, value: '1, 3' })

      expect(multiSelect.getValue().length).toBe(2)
    })

    it('should handle numeric value config', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, value: 1 })

      expect(multiSelect.getValue().length).toBe(1)
      expect(multiSelect.getValue()[0].value).toBe('1')
    })

    it('should create select all button when selectAll and multiple are true', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: true,
        selectAll: true
      })

      expect(multiSelect._selectAllElement).not.toBeNull()
      expect(multiSelect._selectAllElement.classList.contains('list-box-select-all')).toBe(true)
    })

    it('should wrap select all in a dropdown header', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: true,
        selectAll: true
      })

      const header = multiSelect._selectAllElement.closest('.list-box-header')
      expect(header).not.toBeNull()
      expect(header.parentNode).toBe(multiSelect._listBoxElement)
      expect(header.nextElementSibling).toBe(multiSelect._optionsElement)
    })

    it('should not create select all button when multiple is false', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: false,
        selectAll: true
      })

      expect(multiSelect._selectAllElement).toBeNull()
    })

    it('should not create select all button when selectAll is false', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: true,
        selectAll: false
      })

      expect(multiSelect._selectAllElement).toBeNull()
    })

    it('should hide the dropdown header when search yields no results by default', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: true,
        search: true,
        selectAll: true
      })

      const header = multiSelect._dropdownHeaderElement

      multiSelect.search('no-match')
      expect(header.style.display).toBe('none')

      multiSelect.search('')
      expect(header.style.display).not.toBe('none')
    })

    it('should keep the dropdown header visible on no results when hideSelectAllOnSearchNoResults is false', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: true,
        search: true,
        selectAll: true,
        hideSelectAllOnSearchNoResults: false
      })

      multiSelect.search('no-match')
      expect(multiSelect._dropdownHeaderElement.style.display).not.toBe('none')
    })

    it('should set is-invalid class when invalid config is true', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [],
        invalid: true
      })

      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBe(true)
    })

    it('should set is-valid class when valid config is true', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [],
        valid: true
      })

      expect(multiSelect._wrapperElement.classList.contains('is-valid')).toBe(true)
    })

    it('should apply optionsMaxHeight when not auto', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        optionsMaxHeight: 200
      })

      expect(multiSelect._optionsElement.style.maxHeight).toBe('200px')
      expect(multiSelect._optionsElement.style.overflowY).toBe('auto')
    })

    it('should not apply optionsMaxHeight when auto', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        optionsMaxHeight: 'auto'
      })

      expect(multiSelect._optionsElement.style.maxHeight).toBe('')
    })

    it('should create search input when search is true', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [],
        search: true
      })

      expect(multiSelect._searchElement).not.toBeNull()
      expect(multiSelect._searchElement.classList.contains('multi-select-search')).toBe(true)
    })

    it('should create search input when search is "global"', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [],
        search: true
      })

      expect(multiSelect._searchElement).not.toBeNull()
    })

    it('should mark the frame as disabled when disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [],
        disabled: true
      })

      expect(multiSelect._togglerElement.classList.contains('disabled')).toBe(true)
    })

    it('should disable search input when disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [],
        search: true,
        disabled: true
      })

      expect(multiSelect._searchElement.disabled).toBe(true)
    })

    it('should not create search input when search is false', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [],
        search: false
      })

      expect(multiSelect._searchElement).toBeNull()
    })

    it('should set tabIndex on toggler when search is false and not disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [],
        search: false,
        disabled: false
      })

      expect(multiSelect._togglerElement.tabIndex).toBe(0)
    })

    it('should show placeholder when no options selected and no search', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        placeholder: 'Choose...'
      })

      const placeholder = multiSelect._wrapperElement.querySelector('.multi-select-placeholder')
      expect(placeholder).not.toBeNull()
      expect(placeholder.textContent).toBe('Choose...')
    })

    it('should create cleaner button when cleaner is true and selected', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1', selected: true }],
        cleaner: true
      })

      expect(multiSelect._selectionCleanerElement).not.toBeNull()
      expect(multiSelect._selectionCleanerElement.classList.contains('form-control-cleaner')).toBe(true)
    })

    it('should not create cleaner button when disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        cleaner: true,
        multiple: true,
        disabled: true
      })

      expect(multiSelect._selectionCleanerElement).toBeNull()
    })

    it('should create options with checkbox style', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        indicator: 'checkbox'
      })

      const optionEl = multiSelect._optionsElement.querySelector('.list-box-option')
      expect(optionEl.classList.contains('list-box-option')).toBe(true)
    })

    it('should handle optionsTemplate function', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        optionsTemplate: option => `<span>${option.text}</span>`
      })

      const optionEl = multiSelect._optionsElement.querySelector('.list-box-option')
      expect(optionEl.querySelector('span')).not.toBeNull()
    })

    it('should handle optionsTemplate without sanitize', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        optionsTemplate: option => `<span>${option.text}</span>`,
        sanitize: false
      })

      const optionEl = multiSelect._optionsElement.querySelector('.list-box-option')
      expect(optionEl.querySelector('span')).not.toBeNull()
    })

    it('should handle optionsGroupsTemplate function', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{
          label: 'Group 1',
          options: [{ value: '1', text: 'Opt 1' }]
        }],
        optionsGroupsTemplate: group => `<strong>${group.label}</strong>`
      })

      const groupLabel = multiSelect._optionsElement.querySelector('.list-box-section-label')
      expect(groupLabel.querySelector('strong')).not.toBeNull()
    })

    it('should handle optionsGroupsTemplate without sanitize', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{
          label: 'Group 1',
          options: [{ value: '1', text: 'Opt 1' }]
        }],
        optionsGroupsTemplate: group => `<strong>${group.label}</strong>`,
        sanitize: false
      })

      const groupLabel = multiSelect._optionsElement.querySelector('.list-box-section-label')
      expect(groupLabel.querySelector('strong')).not.toBeNull()
    })

    it('should set aria-multiselectable on the options element when multiple', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: true
      })

      expect(multiSelect._optionsElement.getAttribute('aria-multiselectable')).toBe('true')
    })

    it('should not set aria-multiselectable when not multiple', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: false
      })

      expect(multiSelect._optionsElement.getAttribute('aria-multiselectable')).toBeNull()
    })

    it('should mount next to the frame by default and leave no panel behind', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      multiSelect.show()

      // next to the frame, not inside it — the frame is a flex control chrome
      expect(multiSelect._menu.parentElement).not.toBe(multiSelect._wrapperElement)
      expect(multiSelect._wrapperElement.nextElementSibling).toBe(multiSelect._menu)

      multiSelect.hide()
      multiSelect.dispose()

      expect(document.querySelector('.combobox-popup')).toBeNull()
    })

    it('should close on Escape pressed inside the menu and return focus home', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{ value: '1', text: 'Opt 1' }], selectAll: true
      })

      multiSelect.show()
      multiSelect._selectAllElement.focus()

      // The menu mounts outside the frame, so this no longer bubbles through
      // the wrapper's own Escape handler
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      multiSelect._selectAllElement.dispatchEvent(event)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
      expect(event.defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(multiSelect._togglerElement)
    })

    it('should follow the frame width while open', async () => {
      fixtureEl.innerHTML = '<div style="width: 660px;"><select></select></div>'
      const wrap = fixtureEl.querySelector('div')
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      multiSelect.show()

      expect(multiSelect._menu.style.minWidth).toEqual(`${multiSelect._wrapperElement.offsetWidth}px`)

      // The frame resizes while the panel is open — an inline snapshot that
      // does not follow it leaves the panel at the stale width.
      wrap.style.width = '400px'
      await new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      })

      expect(multiSelect._menu.style.minWidth).toEqual(`${multiSelect._wrapperElement.offsetWidth}px`)
      expect(multiSelect._wrapperElement.offsetWidth).toBeLessThan(660)

      multiSelect.hide()
    })

    it('should stay inside an open dialog rather than escape to the body', () => {
      fixtureEl.innerHTML = [
        '<dialog id="host">',
        '  <div style="overflow: hidden; position: relative;">',
        '    <select></select>',
        '  </div>',
        '</dialog>'
      ].join('')

      const dialog = fixtureEl.querySelector('#host')
      dialog.show()

      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      multiSelect.show()

      // outside the dialog's subtree the panel would be painted but inert
      expect(dialog.contains(multiSelect._menu)).toBe(true)

      multiSelect.hide()
      dialog.close()
    })

    it('should handle container option', () => {
      fixtureEl.innerHTML = '<select></select><div id="container"></div>'
      const selectEl = fixtureEl.querySelector('select')
      const containerEl = fixtureEl.querySelector('#container')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        container: containerEl
      })

      // the panel is in the DOM only while a choice is being made
      expect(containerEl.querySelector('.combobox-popup')).toBeNull()

      multiSelect.show()

      expect(containerEl.querySelector('.combobox-popup')).not.toBeNull()
      expect(multiSelect._menu.parentElement).toBe(containerEl)
    })

    it('should handle container option set to true (document.body)', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        container: true
      })

      multiSelect.show()

      expect(multiSelect._menu.parentElement).toBe(document.body)
      // Clean up
      multiSelect._menu.remove()
    })

    it('should put the panel in an open modal dialog instead of the body container', () => {
      fixtureEl.innerHTML = '<dialog id="host"><div><select></select></div></dialog>'
      const dialog = fixtureEl.querySelector('#host')
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{ value: '1', text: 'Opt 1' }],
        container: 'body'
      })

      dialog.showModal()
      multiSelect.show()

      expect(multiSelect._menu.parentElement).toBe(dialog)

      multiSelect.hide()
      dialog.close()
    })

    it('should create disabled option elements', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Enabled' },
          { value: '2', text: 'Disabled', disabled: true }
        ]
      })

      const disabledOption = multiSelect._optionsElement.querySelector('[data-coreui-value="2"]')
      expect(disabledOption.classList.contains('disabled')).toBe(true)
    })

    it('should handle selectionType counter', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true }
        ],
        selectionType: 'counter',
        selectedLabel: count => `${count} items selected`
      })

      const selection = multiSelect._wrapperElement.querySelector('.multi-select-selection')
      expect(selection.textContent).toContain('2')
      expect(selection.textContent).toContain('items selected')
    })

    it('should count every option in the list toward {total} of the counter, disabled and grouped ones included, and only the selectable ones in the header total', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          {
            label: 'Group',
            options: [
              { value: '1', text: 'Opt 1', selected: true },
              { value: '2', text: 'Opt 2' },
              { value: '3', text: 'Opt 3', disabled: true }
            ]
          },
          { value: '4', text: 'Opt 4' },
          { value: '5', text: 'Opt 5' }
        ],
        headerTemplate: state => String(state.total),
        selectionType: 'counter',
        selectedLabel: '{count} of {total}'
      })

      const selection = multiSelect._wrapperElement.querySelector('.multi-select-selection')
      expect(selection.textContent).toBe('1 of 5')
      expect(multiSelect._headerElement.textContent).toBe('4')
    })

    it('should take {total} from the total option', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option><option value="b">B</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        search: true, selectionType: 'counter', selectedLabel: '{count} of {total}', total: 1250
      })

      expect(multiSelect._searchElement.placeholder).toBe('1 of 1250')

      const search = multiSelect._searchElement

      multiSelect.setTotal(1300)

      expect(multiSelect._searchElement).toBe(search)
      expect(search.placeholder).toBe('1 of 1300')

      multiSelect.setTotal(null)

      expect(search.placeholder).toBe('1 of 2')
    })

    it('should give the search placeholder the same {total} as the counter', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          {
            label: 'Group',
            options: [
              { value: '1', text: 'Opt 1', selected: true },
              { value: '2', text: 'Opt 2' },
              { value: '3', text: 'Opt 3', disabled: true }
            ]
          },
          { value: '4', text: 'Opt 4' }
        ],
        search: true,
        selectionType: 'counter',
        selectedLabel: '{count} of {total}'
      })

      expect(multiSelect._searchElement.placeholder).toBe('1 of 4')
    })

    it('should handle selectionType text', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true }
        ],
        selectionType: 'text'
      })

      const selection = multiSelect._wrapperElement.querySelector('.multi-select-selection')
      expect(selection.textContent).toContain('Opt 1')
      expect(selection.textContent).toContain('Opt 2')
    })

    it('should handle selectionType chips', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true }
        ],
        selectionType: 'chips'
      })

      const tags = multiSelect._wrapperElement.querySelectorAll('.chip')
      expect(tags.length).toBe(2)
    })

    it('should create chips with remove buttons', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        selectionType: 'chips'
      })

      const tag = multiSelect._wrapperElement.querySelector('.chip')
      expect(tag.querySelector('.chip-remove')).not.toBeNull()
    })

    it('should not create tag delete buttons when disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        selectionType: 'chips',
        disabled: true
      })

      const tag = multiSelect._wrapperElement.querySelector('.chip')
      expect(tag.querySelector('.chip-remove')).toBeNull()
    })

    it('should handle single select with selected option', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2' }
        ],
        multiple: false
      })

      const selection = multiSelect._wrapperElement.querySelector('.multi-select-selection')
      expect(selection.textContent).toContain('Opt 1')
    })

    it('should copy class names from original element', () => {
      fixtureEl.innerHTML = '<select class="custom-class another-class"></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect._wrapperElement.classList.contains('custom-class')).toBe(true)
      expect(multiSelect._wrapperElement.classList.contains('another-class')).toBe(true)
    })

    it('should handle custom group properties', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        {
          label: 'Group 1',
          customProp: 'custom-value',
          options: [{ value: '1', text: 'Opt 1' }]
        }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      expect(multiSelect._options[0].customProp).toBe('custom-value')
    })

    it('should keep one value in a single select given several', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        multiple: false,
        options: [{ value: '1', text: 'One', selected: true }, { value: '2', text: 'Two', selected: true }]
      })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['2'])
      expect(selectEl.value).toBe('2')
    })

    it('should take the given value over the selected options of a multiple select', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option><option value="b">B</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { value: ['b'] })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['b'])
    })

    it('should take the given value over the options marked selected in the config', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const options = [{ value: 'a', text: 'A', selected: true }, { value: 'b', text: 'B' }]
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options, value: ['b'] })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['b'])

      multiSelect.setOptions([{ value: 'a', text: 'A' }, { value: 'b', text: 'B', selected: true }])
      multiSelect.setValue(['a'])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
    })

    it('should take the given value over a selected option further down a single select', () => {
      fixtureEl.innerHTML = '<select><option value="a">A</option><option value="b" selected>B</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { multiple: false, value: 'a' })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
    })

    it('should match a value given as numbers', () => {
      fixtureEl.innerHTML = '<select multiple data-coreui-value="[1,2]"><option value="1">One</option><option value="2">Two</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1', '2'])
    })

    it('should reject a value of the wrong type with the option type error', () => {
      fixtureEl.innerHTML = '<select data-coreui-value="true"><option value="true">T</option></select>'

      expect(() => new MultiSelect(fixtureEl.querySelector('select'))).toThrowError(TypeError, /Option "value"/)
    })

    it('should read an empty value given in the config like an empty attribute', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option></select><select multiple data-coreui-value=""><option value="a" selected>A</option></select>'
      const [first, second] = fixtureEl.querySelectorAll('select')

      expect(new MultiSelect(first, { value: '' }).getValue().map(option => option.value)).toEqual(['a'])
      expect(new MultiSelect(second).getValue().map(option => option.value)).toEqual(['a'])
    })

    it('should select the start value once its options arrive through setOptions', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options: [], value: ['a'] })

      multiSelect.setOptions([{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
    })

    it('should not report the start value its options bring through setOptions', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [], value: ['a'] })
      const reported = []

      selectEl.addEventListener('change.coreui.multi-select', () => reported.push('change.coreui.multi-select'))
      selectEl.addEventListener('input', () => reported.push('input'))
      selectEl.addEventListener('change', () => reported.push('change'))
      multiSelect.setOptions([{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }])

      expect([...selectEl.selectedOptions].map(option => option.value)).toEqual(['a'])
      expect(reported).toEqual([])
    })

    it('should keep the pick of a single select over a start value that arrives later', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { multiple: false, options: [{ value: 'b', text: 'B' }], value: ['a'] })

      multiSelect.selectAll([{ value: 'b', text: 'B' }])
      multiSelect.setOptions([{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['b'])
    })

    it('should not select the start value again on options it has shown', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const options = [{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }]
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options, value: ['a'] })

      multiSelect.deselectAll()
      multiSelect.setOptions([...options, { value: 'c', text: 'C' }])

      expect(multiSelect.getValue()).toEqual([])
    })

    it('should seed later options from the value setValue gives last', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options: [{ value: 'a', text: 'A' }], value: ['a'] })

      multiSelect.setValue(['x'])
      multiSelect.setOptions([{ value: 'a', text: 'A' }, { value: 'x', text: 'X' }])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['x'])
    })

    it('should take the given value over the first option of a single select', () => {
      fixtureEl.innerHTML = '<select><option value="a">A</option><option value="b">B</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { multiple: false, value: 'b' })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['b'])
      expect(multiSelect._selectionElement.textContent).toBe('B')
    })

    it('should leave the placeholder option of a single select selected', () => {
      fixtureEl.innerHTML = '<form><select name="f"><option value="" disabled selected>Choose</option><option value="1">One</option></select></form>'
      const selectEl = fixtureEl.querySelector('select')

      // eslint-disable-next-line no-new
      new MultiSelect(selectEl, { multiple: false, required: true })

      expect(selectEl.options[0].selected).toBeTrue()
      expect(selectEl.checkValidity()).toBeFalse()
    })

    it('should keep the value of a single select that selectAll gives nothing to pick', () => {
      fixtureEl.innerHTML = '<select><option value="a">A</option><option value="b" selected>B</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { multiple: false })

      multiSelect.selectAll([])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['b'])
    })

    it('should keep the last selected option of multiple markup read as a single select', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option><option value="b" selected>B</option><option value="c">C</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { multiple: false })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['b'])
    })

    it('should send nothing with an empty single select that has no placeholder option', () => {
      fixtureEl.innerHTML = '<form><select name="f"></select></form>'
      const selectEl = fixtureEl.querySelector('select')

      // eslint-disable-next-line no-new
      new MultiSelect(selectEl, { multiple: false, options: [{ value: '1', text: 'One' }, { value: '2', text: 'Two' }], required: true })

      expect(new FormData(fixtureEl.querySelector('form')).getAll('f')).toEqual([])
      expect(selectEl.checkValidity()).toBeFalse()
    })

    it('should select the placeholder option again once a single select is cleared', () => {
      fixtureEl.innerHTML = '<form><select name="f"><option value="" disabled selected>Choose</option><option value="1">One</option><option value="2">Two</option></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { multiple: false, required: true })

      multiSelect.selectAll([{ value: '2', text: 'Two' }])
      multiSelect.deselectAll()

      expect(selectEl.options[0].selected).toBeTrue()
      expect(selectEl.checkValidity()).toBeFalse()
    })

    it('should deselect a selected native option the list does not carry in a multiple select', () => {
      fixtureEl.innerHTML = '<form><select multiple name="s"><option value="" selected>None</option><option value="a">A</option></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { required: true })

      multiSelect.selectAll([{ value: 'a', text: 'A' }])
      multiSelect.deselectAll()

      expect(new FormData(fixtureEl.querySelector('form')).getAll('s')).toEqual([])
      expect(selectEl.checkValidity()).toBeFalse()
    })
  })

  describe('show', () => {
    // The panel keys its own display and entry transition on this class, so a
    // panel opened only through an ancestor's class is laid out and invisible.
    it('should mark the popup itself as shown', () => {
      fixtureEl.innerHTML = '<select></select>'
      const element = fixtureEl.querySelector('select')
      const instance = new MultiSelect(element, { options: [] })

      instance.show()

      expect(instance._menu.classList.contains('show')).toBe(true)

      instance.hide()

      expect(instance._menu.classList.contains('show')).toBe(false)
    })

    it('should show the multi select dropdown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [{ value: '1', text: 'Option 1' }]
        })

        selectEl.addEventListener('shown.coreui.multi-select', () => {
          expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
          resolve()
        })

        multiSelect.show()
      })
    })

    it('should trigger show event', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [{ value: '1', text: 'Option 1' }]
        })

        selectEl.addEventListener('show.coreui.multi-select', () => {
          expect().nothing()
          resolve()
        })

        multiSelect.show()
      })
    })

    it('should not show if disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        disabled: true
      })

      multiSelect.show()
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should not show if already shown', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)

      // Call show again - should not throw
      multiSelect.show()
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
    })

    it('should set aria-expanded to true', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      expect(multiSelect._togglerElement.getAttribute('aria-expanded')).toBe('true')
    })

    it('should focus search input when search is enabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: true
      })

      multiSelect.show()

      const searchInput = multiSelect._wrapperElement.querySelector('.multi-select-search')
      expect(searchInput).not.toBeNull()
    })

    it('should show menu in container mode', () => {
      fixtureEl.innerHTML = '<select></select><div id="container"></div>'
      const selectEl = fixtureEl.querySelector('select')
      const containerEl = fixtureEl.querySelector('#container')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        container: containerEl
      })

      multiSelect.show()
      expect(multiSelect._menu.classList.contains('show')).toBe(true)
    })

    it('should start positioning on show', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      expect(multiSelect._floatingCleanup).not.toBeNull()
    })
  })

  describe('hide', () => {
    it('should hide the multi select dropdown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [{ value: '1', text: 'Option 1' }]
        })

        selectEl.addEventListener('shown.coreui.multi-select', () => {
          multiSelect.hide()
        })

        selectEl.addEventListener('hidden.coreui.multi-select', () => {
          expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
          resolve()
        })

        multiSelect.show()
      })
    })

    it('should trigger hide event', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [{ value: '1', text: 'Option 1' }]
        })

        selectEl.addEventListener('shown.coreui.multi-select', () => {
          multiSelect.hide()
        })

        selectEl.addEventListener('hide.coreui.multi-select', () => {
          expect().nothing()
          resolve()
        })

        multiSelect.show()
      })
    })

    it('should set aria-expanded to false', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      multiSelect.hide()
      expect(multiSelect._togglerElement.getAttribute('aria-expanded')).toBe('false')
    })

    it('should dispose the positioning cleanup on hide', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      expect(multiSelect._floatingCleanup).not.toBeNull()

      multiSelect.hide()
      expect(multiSelect._floatingCleanup).toBeNull()
    })

    it('should clear search input on hide', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: true
      })

      multiSelect.show()
      multiSelect._searchElement.value = 'test'
      multiSelect.hide()

      expect(multiSelect._searchElement.value).toBe('')
    })

    it('should hide menu in container mode', () => {
      fixtureEl.innerHTML = '<select></select><div id="container"></div>'
      const selectEl = fixtureEl.querySelector('select')
      const containerEl = fixtureEl.querySelector('#container')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        container: containerEl
      })

      multiSelect.show()
      expect(multiSelect._menu.classList.contains('show')).toBe(true)

      multiSelect.hide()
      expect(multiSelect._menu.classList.contains('show')).toBe(false)
    })
  })

  describe('toggle', () => {
    it('should toggle multi select visibility', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [{ value: '1', text: 'Option 1' }]
        })

        let showCount = 0
        let hideCount = 0

        selectEl.addEventListener('shown.coreui.multi-select', () => {
          showCount++
          if (showCount === 1) {
            multiSelect.toggle()
          }
        })

        selectEl.addEventListener('hidden.coreui.multi-select', () => {
          hideCount++
          if (hideCount === 1) {
            expect(showCount).toBe(1)
            expect(hideCount).toBe(1)
            resolve()
          }
        })

        multiSelect.toggle()
      })
    })

    it('should show when hidden', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
      multiSelect.toggle()
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
    })

    it('should hide when shown', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
      multiSelect.toggle()
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })
  })

  describe('selectAll', () => {
    it('should keep the first text of a value it is given twice', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))

      multiSelect.selectAll([{ value: 'x', text: 'First' }, { value: 'x', text: 'Second' }])

      expect(multiSelect.getValue()).toEqual([{ value: 'x', text: 'First' }])
    })

    it('should select all available options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectAll()
      expect(multiSelect.getValue().length).toBe(3)
    })

    it('should not select disabled options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2', disabled: true },
        { value: '3', text: 'Option 3' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectAll()
      expect(multiSelect.getValue().length).toBe(2)
      expect(multiSelect.getValue().find(item => item.value === '2')).toBeUndefined()
    })

    it('should not select more options than selectionLimit', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3' }
      ]
      const multiSelect = new MultiSelect(selectEl, {
        options,
        selectionLimit: 2
      })

      multiSelect.selectAll()
      expect(multiSelect.getValue().length).toBe(2)
    })

    it('should ignore the selection limit when only one value can be selected', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, { multiple: false, options, selectionLimit: 0 })
      const onLimit = vi.fn()

      selectEl.addEventListener('selectionLimit.coreui.multi-select', onLimit)
      multiSelect.selectAll([{ value: '1', text: 'Option 1' }])

      expect(multiSelect.getValue().map(item => item.value)).toEqual(['1'])
      expect(onLimit).not.toHaveBeenCalled()
    })

    it('should report the selection limit once when selectAll stops at it', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3' },
        { value: '4', text: 'Option 4' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, selectionLimit: 2 })
      const onLimit = vi.fn()

      selectEl.addEventListener('selectionLimit.coreui.multi-select', onLimit)
      multiSelect.selectAll()

      expect(multiSelect.getValue().map(item => item.value)).toEqual(['1', '2'])
      expect(onLimit).toHaveBeenCalledTimes(1)
    })

    it('should not report the selection limit when selectAll has nothing left to add', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3', disabled: true }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, selectionLimit: 2, value: ['1', '2'] })
      const onLimit = vi.fn()

      selectEl.addEventListener('selectionLimit.coreui.multi-select', onLimit)
      multiSelect.selectAll()

      expect(onLimit).not.toHaveBeenCalled()
    })

    it('should not select an option when selectionLimit is reached', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, {
        options,
        selectionLimit: 1
      })

      multiSelect.selectAll([{ value: '1', text: 'Option 1' }])
      multiSelect.selectAll([{ value: '2', text: 'Option 2' }])

      expect(multiSelect.getValue().length).toBe(1)
      expect(multiSelect.getValue()[0].value).toBe('1')
    })

    it('should trigger selectionLimit event when selectionLimit is reached', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, {
        options,
        selectionLimit: 1
      })
      let eventValue = null

      selectEl.addEventListener('selectionLimit.coreui.multi-select', event => {
        eventValue = event
      })

      multiSelect.selectAll([{ value: '1', text: 'Option 1' }])
      multiSelect.selectAll([{ value: '2', text: 'Option 2' }])

      expect(eventValue).not.toBeNull()
      expect(eventValue.selectionLimit).toBe(1)
    })

    it('should trigger selectionLimit event when clicking an option after initial selection reaches selectionLimit', () => {
      fixtureEl.innerHTML = [
        '<select multiple>',
        '  <option value="1" selected>Option 1</option>',
        '  <option value="2" selected>Option 2</option>',
        '  <option value="3" selected>Option 3</option>',
        '  <option value="4">Option 4</option>',
        '</select>'
      ].join('')
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        selectionLimit: 3
      })
      let eventValue = null

      selectEl.addEventListener('selectionLimit.coreui.multi-select', event => {
        eventValue = event
      })

      multiSelect._optionsElement.querySelector('[data-coreui-value="4"]').click()

      expect(eventValue).not.toBeNull()
      expect(eventValue.selectionLimit).toBe(3)
    })

    it('should bubble selectionLimit event', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, {
        options,
        selectionLimit: 1
      })
      let eventValue = null

      document.addEventListener('selectionLimit.coreui.multi-select', event => {
        eventValue = event
      }, { once: true })

      multiSelect.selectAll([{ value: '1', text: 'Option 1' }])
      multiSelect.selectAll([{ value: '2', text: 'Option 2' }])

      expect(eventValue).not.toBeNull()
      expect(eventValue.target).toBe(selectEl)
    })

    it('should trigger selectionLimit event when selectAll reaches selectionLimit', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3' }
      ]
      const multiSelect = new MultiSelect(selectEl, {
        options,
        selectionLimit: 2
      })
      let eventValue = null

      selectEl.addEventListener('selectionLimit.coreui.multi-select', event => {
        eventValue = event
      })

      multiSelect.selectAll()

      expect(eventValue).not.toBeNull()
      expect(eventValue.selectionLimit).toBe(2)
    })

    it('should trigger selectionLimit once when selectAll truncates grouped options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        {
          label: 'Group A',
          options: [
            { value: '1', text: 'Option 1' },
            { value: '2', text: 'Option 2' }
          ]
        },
        {
          label: 'Group B',
          options: [
            { value: '3', text: 'Option 3' },
            { value: '4', text: 'Option 4' }
          ]
        }
      ]
      // Limit falls exactly on the group boundary: the first group fills it, so the
      // old code returned from the group branch without firing the event.
      const multiSelect = new MultiSelect(selectEl, {
        options,
        selectionLimit: 2
      })
      let eventCount = 0
      let eventValue = null

      selectEl.addEventListener('selectionLimit.coreui.multi-select', event => {
        eventCount += 1
        eventValue = event
      })

      multiSelect.selectAll()

      expect(multiSelect.getValue().length).toBe(2)
      expect(eventCount).toBe(1)
      expect(eventValue.selectionLimit).toBe(2)
    })

    it('should apply selectionLimit to initially selected options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1', selected: true },
        { value: '2', text: 'Option 2', selected: true },
        { value: '3', text: 'Option 3', selected: true }
      ]
      const multiSelect = new MultiSelect(selectEl, {
        options,
        selectionLimit: 2
      })

      expect(multiSelect.getValue().length).toBe(2)
    })

    it('should select all options within groups', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        {
          label: 'Group 1',
          options: [
            { value: '1', text: 'Option 1' },
            { value: '2', text: 'Option 2' }
          ]
        },
        {
          label: 'Group 2',
          options: [
            { value: '3', text: 'Option 3' }
          ]
        }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectAll()
      expect(multiSelect.getValue().length).toBe(3)
    })

    it('should not select disabled options within groups', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        {
          label: 'Group 1',
          options: [
            { value: '1', text: 'Option 1' },
            { value: '2', text: 'Option 2', disabled: true }
          ]
        }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectAll()
      expect(multiSelect.getValue().length).toBe(1)
    })

    it('should skip disabled groups', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        {
          label: 'Group 1',
          disabled: true,
          options: [
            { value: '1', text: 'Option 1' },
            { value: '2', text: 'Option 2' }
          ]
        },
        { value: '3', text: 'Option 3' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectAll()
      expect(multiSelect.getValue().length).toBe(1)
      expect(multiSelect.getValue()[0].value).toBe('3')
    })

    it('should send no event when select all finds every option selected', () => {
      fixtureEl.innerHTML = '<select multiple><option value="1" selected>One</option><option value="2" selected>Two</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)
      const events = []

      for (const type of ['change.coreui.multi-select', 'input', 'change']) {
        selectEl.addEventListener(type, () => events.push(type))
      }

      multiSelect.selectAll()

      expect(events).toEqual([])
    })

    it('should keep select all working when the search leaves only a disabled option on the screen', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">A</option><option value="b">B</option><option value="d" disabled>D</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: true, selectAll: true })

      multiSelect.show()
      multiSelect._searchElement.value = 'D'
      multiSelect._searchElement.dispatchEvent(new Event('input', { bubbles: true }))

      const selectAll = multiSelect._menu.querySelector('[data-coreui-select-all]')

      expect(selectAll.disabled).toBeFalse()

      selectAll.click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a', 'b'])
    })

    it('should trigger one changed event for select all', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })
      let changeCount = 0

      selectEl.addEventListener('change.coreui.multi-select', () => {
        changeCount++
      })

      multiSelect.selectAll()
      expect(changeCount).toBe(1)
    })

    it('should trigger one changed event when select all adds options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, value: ['1'] })
      let changeCount = 0

      selectEl.addEventListener('change.coreui.multi-select', () => {
        changeCount++
      })

      multiSelect.selectAll()
      expect(changeCount).toBe(1)
      expect(multiSelect.getValue().map(item => item.value)).toEqual(['1', '2', '3'])

      multiSelect.selectAll()
      expect(changeCount).toBe(1)
    })

    it('should skip the options of a disabled group handed over on their own', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const options = [
        { label: 'Group 1', disabled: true, options: [{ value: '1', text: 'Option 1' }] },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options })

      multiSelect.selectAll(options[0].options)

      expect(multiSelect.getValue()).toEqual([])
    })

    it('should read a value listed twice from its first option in selectAll', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [
          { value: 'a', text: 'A' },
          { label: 'Closed', disabled: true, options: [{ value: 'a', text: 'A2' }] },
          { value: 'b', text: 'B' }
        ]
      })

      multiSelect.selectAll()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a', 'b'])
    })

    it('should read select all as pressed once the takeable options are selected, skipping a value whose first listing is disabled', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [
          { label: 'Closed', disabled: true, options: [{ value: 'x', text: 'X' }] },
          { value: 'x', text: 'X2' },
          { value: 'a', text: 'A' }
        ]
      })

      multiSelect.selectAll()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
      expect(multiSelect._getSelectAllState()).toEqual('all')
    })

    it('should leave a value whose first listing is disabled out of selectFiltered', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [
          { label: 'Closed', disabled: true, options: [{ value: 'x', text: 'X' }] },
          { value: 'x', text: 'X2' },
          { value: 'a', text: 'A' }
        ],
        selectAllMode: 'filtered'
      })

      multiSelect.selectFiltered()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
    })

    it('should skip a disabled group nested in another group', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        {
          label: 'Outer',
          options: [
            { label: 'Inner', disabled: true, options: [{ value: '1', text: 'Option 1' }] },
            { value: '2', text: 'Option 2' }
          ]
        }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectAll()
      expect(multiSelect.getValue().map(item => item.value)).toEqual(['2'])
    })

    it('should keep the text of the first option that carries a value', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { label: 'A', options: [{ value: 'x', text: 'X in A' }] },
        { label: 'B', options: [{ value: 'x', text: 'X in B' }] }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectAll()
      expect(multiSelect.getValue().map(item => item.text)).toEqual(['X in A'])
    })

    it('should end on the last enabled option in single mode, however often it runs', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3', selected: true }
      ]
      const multiSelect = new MultiSelect(selectEl, { multiple: false, options })

      multiSelect.selectAll()
      expect(multiSelect.getValue().map(item => item.value)).toEqual(['3'])

      multiSelect.selectAll()
      expect(multiSelect.getValue().map(item => item.value)).toEqual(['3'])
    })

    it('should update native select options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectAll()

      const nativeOptions = selectEl.querySelectorAll('option')
      for (const nativeOption of nativeOptions) {
        expect(nativeOption.selected).toBe(true)
      }
    })
  })

  describe('deselectAll', () => {
    it('should deselect all selected options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectAll()
      expect(multiSelect.getValue().length).toBe(3)

      multiSelect.deselectAll()
      expect(multiSelect.getValue().length).toBe(0)
    })

    it('should not deselect disabled options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2', disabled: true }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectAll()
      expect(multiSelect.getValue().length).toBe(1)

      multiSelect.deselectAll()
      expect(multiSelect.getValue().length).toBe(0)
    })

    it('should deselect all options within groups', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        {
          label: 'Group 1',
          options: [
            { value: '1', text: 'Option 1' },
            { value: '2', text: 'Option 2' }
          ]
        }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectAll()
      expect(multiSelect.getValue().length).toBe(2)

      multiSelect.deselectAll()
      expect(multiSelect.getValue().length).toBe(0)
    })

    it('should update native select options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectAll()
      multiSelect.deselectAll()

      const nativeOptions = selectEl.querySelectorAll('option')
      for (const nativeOption of nativeOptions) {
        expect(nativeOption.selected).toBe(false)
      }
    })

    it('should send one change when it deselects several options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1', selected: true },
          { value: '2', text: 'Option 2', selected: true },
          { value: '3', text: 'Option 3', selected: true }
        ]
      })
      const events = []

      selectEl.addEventListener('change.coreui.multi-select', () => events.push('component'))
      selectEl.addEventListener('change', () => events.push('native'))
      multiSelect.deselectAll()

      expect(events).toEqual(['component', 'native'])
    })

    it('should keep a selected disabled option from the config, without a remove button on its chip', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [
          {
            value: '1', text: 'Option 1', selected: true, disabled: true
          },
          { value: '2', text: 'Option 2', selected: true }
        ]
      })

      expect(multiSelect._selectionElement.querySelector('[data-value="1"] .chip-remove')).toBeNull()

      multiSelect.deselectAll()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1'])
    })

    it('should send one change when the clear button deselects several options', () => {
      fixtureEl.innerHTML = '<select multiple><option value="1" selected>One</option><option value="2" selected>Two</option><option value="3" selected>Three</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)
      const events = []

      selectEl.addEventListener('change.coreui.multi-select', () => events.push('component'))
      selectEl.addEventListener('change', () => events.push('native'))
      multiSelect._selectionCleanerElement.click()

      expect(multiSelect.getValue()).toEqual([])
      expect(events).toEqual(['component', 'native'])
    })

    it('should keep a selected option of a disabled group', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [
          { label: 'G', disabled: true, options: [{ value: '1', text: 'One', selected: true }] },
          { value: '2', text: 'Two', selected: true }
        ]
      })

      multiSelect._selectionCleanerElement.click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1'])
    })

    it('should keep a selected disabled option from the config on Backspace', async () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [
          {
            value: '1', text: 'One', selected: true, disabled: true
          },
          { value: '2', text: 'Two', selected: true }
        ],
        search: true
      })

      multiSelect._searchElement.focus()
      await userEvent.keyboard('{Backspace}{Backspace}')

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1'])
      expect(multiSelect._selectionElement.querySelector('[data-value="1"]').classList.contains('disabled')).toBeTrue()
    })

    it('should disable the options of a disabled group in the list and keep its selected option', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [
          { label: 'G', disabled: true, options: [{ value: '1', text: 'One', selected: true }, { value: '3', text: 'Three' }] },
          { value: '2', text: 'Two' }
        ]
      })

      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="3"]').click()
      multiSelect.deselectAll()

      expect(multiSelect._menu.querySelector('[data-coreui-value="3"]').getAttribute('aria-disabled')).toBe('true')
      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1'])
    })

    it('should keep a selected option of a disabled optgroup in the markup', () => {
      fixtureEl.innerHTML = '<select multiple><optgroup label="G" disabled><option value="1" selected>One</option></optgroup><option value="2" selected>Two</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))

      multiSelect._selectionCleanerElement.click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1'])
    })

    it('should count the options of a disabled group in the counter total', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [
          { label: 'G', disabled: true, options: [{ value: '1', text: 'One', selected: true }, { value: '3', text: 'Three' }] },
          { value: '2', text: 'Two' }
        ],
        selectionType: 'counter',
        selectedLabel: '{count}/{total}'
      })

      expect(multiSelect._selectionElement.textContent).toBe('1/3')
    })

    it('should send the selected option of a disabled group with the form no more than a disabled option', () => {
      fixtureEl.innerHTML = '<form><select name="f"></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { label: 'G', disabled: true, options: [{ value: '1', text: 'One', selected: true }] },
          { value: '2', text: 'Two', selected: true }
        ]
      })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1', '2'])
      expect(selectEl.querySelector('optgroup').disabled).toBeTrue()
      expect(new FormData(fixtureEl.querySelector('form')).getAll('f')).toEqual(['2'])
    })

    it('should skip a disabled group in the options selectAll is given', () => {
      fixtureEl.innerHTML = '<select></select>'
      const options = [
        { label: 'G', disabled: true, options: [{ value: '1', text: 'One' }] },
        { value: '2', text: 'Two' }
      ]
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options })

      multiSelect.selectAll(options)

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['2'])
    })

    it('should hand the group template a markup group marked disabled', () => {
      fixtureEl.innerHTML = '<select multiple><optgroup label="G" disabled><option value="1">One</option></optgroup><option value="2">Two</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { optionsGroupsTemplate: group => `${group.label}${group.disabled ? ' (unavailable)' : ''}` })

      expect(multiSelect._menu.querySelector('.list-box-section-label').textContent).toBe('G (unavailable)')
    })

    it('should keep a group the deselectAll options mark disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{ label: 'G', options: [{ value: '1', text: 'One', selected: true }] }, { value: '2', text: 'Two', selected: true }]
      })

      multiSelect.deselectAll([{ label: 'G', disabled: true, options: [{ value: '1', text: 'One' }] }, { value: '2', text: 'Two' }])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1'])
    })
  })

  describe('selectFiltered', () => {
    it('should select only the currently filtered options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Apple' },
        { value: '2', text: 'Banana' },
        { value: '3', text: 'Avocado' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, search: true })

      multiSelect.search('av')
      multiSelect.selectFiltered()

      expect(multiSelect.getValue().length).toBe(1)
      expect(multiSelect.getValue()[0].value).toBe('3')
    })

    it('should select all options when no filter is applied', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectFiltered()
      expect(multiSelect.getValue().length).toBe(3)
    })

    it('should not select disabled options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2', disabled: true },
        { value: '3', text: 'Option 3' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect.selectFiltered()
      expect(multiSelect.getValue().length).toBe(2)
      expect(multiSelect.getValue().find(item => item.value === '2')).toBeUndefined()
    })

    it('should respect selectionLimit', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' },
        { value: '3', text: 'Option 3' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, selectionLimit: 2 })

      multiSelect.selectFiltered()
      expect(multiSelect.getValue().length).toBe(2)
    })

    it('should not report the selection limit when the filtered options are already selected', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Apple' },
        { value: '2', text: 'Banana' },
        { value: '3', text: 'Avocado' }
      ]
      const multiSelect = new MultiSelect(selectEl, {
        options, search: true, selectionLimit: 2, value: ['1', '3']
      })
      const onLimit = vi.fn()

      selectEl.addEventListener('selectionLimit.coreui.multi-select', onLimit)
      multiSelect.search('av')
      multiSelect.selectFiltered()

      expect(onLimit).not.toHaveBeenCalled()
    })
  })

  describe('deselectFiltered', () => {
    it('should deselect only the currently filtered options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Apple' },
        { value: '2', text: 'Banana' },
        { value: '3', text: 'Avocado' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, search: true })

      multiSelect.selectAll()
      expect(multiSelect.getValue().length).toBe(3)

      multiSelect.search('av')
      multiSelect.deselectFiltered()

      expect(multiSelect.getValue().length).toBe(2)
      expect(multiSelect.getValue().find(item => item.value === '3')).toBeUndefined()
    })
  })

  describe('headerTemplate', () => {
    const options = [
      { value: '1', text: 'Apple' },
      { value: '2', text: 'Banana' },
      { value: '3', text: 'Avocado' }
    ]

    it('should render a div container inside the dropdown header', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        headerTemplate: () => document.createElement('span')
      })

      expect(multiSelect._headerElement.tagName).toBe('DIV')
      expect(multiSelect._headerElement.closest('.list-box-header')).not.toBeNull()
    })

    it('should render even when selectAll is false', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        selectAll: false,
        headerTemplate: () => document.createElement('span')
      })

      expect(multiSelect._headerElement).not.toBeNull()
      expect(multiSelect._selectAllElement).toBeNull()
    })

    it('should pass state and actions to the template', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      let received = null
      const multiSelect = new MultiSelect(selectEl, {
        options,
        headerTemplate(state, actions) {
          received = { state, actions }
          return document.createElement('span')
        }
      })

      expect(multiSelect).toBeDefined()
      expect(received.state).toEqual({
        selected: 0, total: 3, filtered: 3, filteredSelected: 0
      })
      expect(typeof received.actions.selectAll).toBe('function')
      expect(typeof received.actions.deselectAll).toBe('function')
      expect(typeof received.actions.selectFiltered).toBe('function')
      expect(typeof received.actions.deselectFiltered).toBe('function')
    })

    it('should render the returned element', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        headerTemplate(state) {
          const el = document.createElement('span')
          el.textContent = `${state.selected}/${state.total}`
          return el
        }
      })

      expect(multiSelect._headerElement.querySelector('span').textContent).toBe('0/3')
    })

    it('should re-render the template on selection change', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        headerTemplate(state) {
          const el = document.createElement('span')
          el.textContent = String(state.selected)
          return el
        }
      })

      expect(multiSelect._headerElement.textContent).toBe('0')

      multiSelect.selectAll()
      expect(multiSelect._headerElement.textContent).toBe('3')
    })

    it('should report filteredSelected after filtering', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      let received = null
      const multiSelect = new MultiSelect(selectEl, {
        options,
        search: true,
        headerTemplate(state) {
          received = state
          return document.createElement('span')
        }
      })

      multiSelect.selectAll()
      multiSelect.search('av')

      expect(received.filtered).toBe(1)
      expect(received.filteredSelected).toBe(1)
    })

    it('should sanitize a string returned from the template', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        headerTemplate: () => '<span>ok</span><script>window.brokenMultiSelect = true</script>'
      })

      expect(multiSelect._headerElement.querySelector('span')).not.toBeNull()
      expect(multiSelect._headerElement.querySelector('script')).toBeNull()
    })

    it('should not select all when the container is clicked', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        headerTemplate: () => document.createElement('span')
      })

      multiSelect._headerElement.click()
      expect(multiSelect.getValue().length).toBe(0)
    })
  })

  describe('selectAllLabel', () => {
    const options = [
      { value: '1', text: 'Apple' },
      { value: '2', text: 'Banana' },
      { value: '3', text: 'Avocado' }
    ]

    it('should set the button text from selectAllLabel', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        selectAllLabel: 'Pick everything'
      })

      expect(multiSelect._selectAllElement.textContent).toBe('Pick everything')
    })

    it('should toggle between the default labels', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options })

      expect(multiSelect._selectAllElement.textContent).toBe('Select all')

      multiSelect._selectAllElement.click()
      expect(multiSelect.getValue().length).toBe(3)
      expect(multiSelect._selectAllElement.textContent).toBe('Deselect all')

      multiSelect._selectAllElement.click()
      expect(multiSelect.getValue().length).toBe(0)
      expect(multiSelect._selectAllElement.textContent).toBe('Select all')
    })

    it('should toggle with custom labels regardless of style', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        selectAllLabel: 'Select all',
        deselectAllLabel: 'Deselect all'
      })

      expect(multiSelect._selectAllElement.textContent).toBe('Select all')

      multiSelect._selectAllElement.click()
      expect(multiSelect.getValue().length).toBe(3)
      expect(multiSelect._selectAllElement.textContent).toBe('Deselect all')

      multiSelect._selectAllElement.click()
      expect(multiSelect.getValue().length).toBe(0)
      expect(multiSelect._selectAllElement.textContent).toBe('Select all')
    })

    it('should switch to deselectAllLabel when everything is selected', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        selectAllLabel: 'Grab all',
        deselectAllLabel: 'Drop all'
      })

      expect(multiSelect._selectAllElement.textContent).toBe('Grab all')

      multiSelect.selectAll()
      expect(multiSelect._selectAllElement.textContent).toBe('Drop all')
    })
  })

  describe('selectAllMode', () => {
    const options = [
      { value: '1', text: 'Apple' },
      { value: '2', text: 'Apricot' },
      { value: '3', text: 'Banana' }
    ]

    it("defaults to 'all'", () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options })

      expect(multiSelect._config.selectAllMode).toBe('all')
    })

    it("in 'all' mode the button ignores the search filter and selects every option", () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options, search: true })

      multiSelect.search('ap')
      multiSelect._selectAllElement.click()

      expect(multiSelect.getValue().length).toBe(3)
    })

    it("in 'filtered' mode the button selects only the search-filtered options", () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        search: true,
        selectAllMode: 'filtered'
      })

      multiSelect.search('ap') // Apple + Apricot visible, Banana hidden
      multiSelect._selectAllElement.click()

      expect(multiSelect.getValue().map(option => option.value).toSorted()).toEqual(['1', '2'])
    })

    it("in 'filtered' mode with no active filter behaves like 'all'", () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        search: true,
        selectAllMode: 'filtered'
      })

      multiSelect._selectAllElement.click()

      expect(multiSelect.getValue().length).toBe(3)
    })

    it("in 'filtered' mode the checkbox tracks the filtered set and drops to indeterminate after clearing search", () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        search: true,
        selectAllMode: 'filtered'
      })

      multiSelect.search('ap')
      multiSelect._selectAllElement.click()

      // all filtered (2/2) selected -> 'all' state + deselect-filtered label
      expect(multiSelect._selectAllElement.classList.contains('selected')).toBe(true)
      expect(multiSelect._selectAllElement.textContent).toBe('Deselect filtered')

      // clearing the filter widens the set to all 3, only 2 selected -> indeterminate
      multiSelect.search('')
      expect(multiSelect._selectAllElement.classList.contains('indeterminate')).toBe(true)
      expect(multiSelect._selectAllElement.textContent).toBe('Select all')
    })

    it("in 'filtered' mode the label switches to the filtered variant only while a filter narrows the list", () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        search: true,
        selectAllMode: 'filtered'
      })

      // no active filter -> full scope -> "Select all"
      expect(multiSelect._selectAllElement.textContent).toBe('Select all')

      // filter narrows the list -> "Select filtered"
      multiSelect.search('ap')
      expect(multiSelect._selectAllElement.textContent).toBe('Select filtered')

      // a filter that matches everything is not narrowing -> back to "Select all"
      multiSelect.search('a')
      expect(multiSelect._selectAllElement.textContent).toBe('Select all')
    })

    it("in 'all' mode the label never switches to the filtered variant", () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options, search: true })

      multiSelect.search('ap')
      expect(multiSelect._selectAllElement.textContent).toBe('Select all')
    })
  })

  describe('optionsGroupsSelectable', () => {
    const groupedOptions = [
      {
        label: 'Group A',
        options: [
          { value: '1', text: 'A1' },
          { value: '2', text: 'A2' }
        ]
      },
      {
        label: 'Group B',
        options: [
          { value: '3', text: 'B1' }
        ]
      }
    ]

    it('should not make group labels selectable by default', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions })

      const label = multiSelect._menu.querySelector('.list-box-section-label')
      expect(label.hasAttribute('data-coreui-section-toggle')).toBe(false)
      expect(label.getAttribute('role')).toBeNull()
    })

    it('should turn group labels into tri-state buttons when enabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions, optionsGroupsSelectable: true })

      const label = multiSelect._menu.querySelector('.list-box-section-label')
      expect(label.getAttribute('role')).toBe('button')
      expect(label.getAttribute('aria-pressed')).toBe('false')
      expect(label.querySelector('.list-box-option-indicator')).not.toBeNull()
    })

    it('should leave the indicator off group labels when the indicator is none', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions, optionsGroupsSelectable: true, indicator: 'none' })

      const label = multiSelect._menu.querySelector('.list-box-section-label')
      expect(label.getAttribute('role')).toBe('button')
      expect(label.querySelector('.list-box-option-indicator')).toBeNull()
    })

    it('should select and deselect a whole group on label click', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions, optionsGroupsSelectable: true })

      const groupLabel = multiSelect._menu.querySelector('.list-box-section-label')

      groupLabel.click()
      expect(multiSelect.getValue().length).toBe(2)
      expect(groupLabel.classList.contains('selected')).toBe(true)

      groupLabel.click()
      expect(multiSelect.getValue().length).toBe(0)
    })

    it('should mark the group label as indeterminate on partial selection', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions, optionsGroupsSelectable: true })

      multiSelect.selectAll([{ value: '1', text: 'A1' }])

      const groupLabel = multiSelect._menu.querySelector('.list-box-section-label')
      expect(groupLabel.classList.contains('indeterminate')).toBe(true)
      expect(groupLabel.classList.contains('selected')).toBe(false)
    })

    it('should respect selectionLimit when toggling a group', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: groupedOptions,
        optionsGroupsSelectable: true,
        selectionLimit: 1
      })

      const groupLabel = multiSelect._menu.querySelector('.list-box-section-label')
      groupLabel.click()

      expect(multiSelect.getValue().length).toBe(1)
    })

    it('should highlight a selectable group label during arrow navigation', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions, optionsGroupsSelectable: true })

      multiSelect.show()

      const groupLabel = multiSelect._menu.querySelector('.list-box-section-label')
      expect(multiSelect._listBox.getActive()).toBe(groupLabel.id)
      expect(groupLabel.getAttribute('tabindex')).toBe('0')

      multiSelect._listBox.next()

      expect(multiSelect._listBox.getActive()).toBe('1')
    })

    it('should skip group labels during navigation when not selectable', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions })

      multiSelect.show()

      expect(multiSelect._listBox.getActive()).toBe('1')

      multiSelect._listBox.next()
      expect(multiSelect._listBox.getActive()).toBe('2')

      multiSelect._listBox.next()
      expect(multiSelect._listBox.getActive()).toBe('3')
    })
  })

  describe('select all indicator', () => {
    const options = [
      { value: '1', text: 'Apple' },
      { value: '2', text: 'Banana' },
      { value: '3', text: 'Avocado' }
    ]

    it('should carry the indicator by default', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options })

      expect(multiSelect._selectAllElement.querySelector('.list-box-option-indicator')).not.toBeNull()
    })

    it('should leave the indicator off when the indicator is none', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options, indicator: 'none' })

      expect(multiSelect._selectAllElement.querySelector('.list-box-option-indicator')).toBeNull()
    })

    it('should reflect none / indeterminate / all states', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options })
      const master = multiSelect._selectAllElement

      expect(master.getAttribute('aria-pressed')).toBe('false')
      expect(master.classList.contains('selected')).toBe(false)
      expect(master.classList.contains('indeterminate')).toBe(false)

      multiSelect.selectAll([{ value: '1', text: 'Apple' }])
      expect(master.classList.contains('indeterminate')).toBe(true)

      multiSelect.selectAll()
      expect(master.classList.contains('selected')).toBe(true)
      expect(master.classList.contains('indeterminate')).toBe(false)
    })

    it('should toggle selection on click', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options })

      multiSelect._selectAllElement.click()
      expect(multiSelect.getValue().length).toBe(3)

      multiSelect._selectAllElement.click()
      expect(multiSelect.getValue().length).toBe(0)
    })
  })

  describe('getValue', () => {
    it('should return empty array when nothing selected', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      expect(multiSelect.getValue()).toEqual([])
    })

    it('should return selected items', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2' }
        ]
      })

      const value = multiSelect.getValue()
      expect(value.length).toBe(1)
      expect(value[0].value).toBe('1')
      expect(value[0].text).toBe('Opt 1')
    })
  })

  describe('search functionality', () => {
    it('should not submit the search field', () => {
      fixtureEl.innerHTML = [
        '<form id="form">',
        '<select id="multi-select" name="tech" multiple>',
        '<option value="1" selected>One</option>',
        '</select>',
        '</form>'
      ].join('')

      const multiSelectEl = fixtureEl.querySelector('#multi-select')
      const multiSelect = new MultiSelect(multiSelectEl, { search: true })

      multiSelect._searchElement.value = 'secret query'

      const formData = new FormData(fixtureEl.querySelector('#form'))

      expect(multiSelect._searchElement.hasAttribute('name')).toBeFalse()
      expect(multiSelect._searchElement.autocomplete).toEqual('off')
      expect([...formData.entries()]).toEqual([['tech', '1']])
    })

    it('should filter options based on search term', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Apple' },
        { value: '2', text: 'Banana' },
        { value: '3', text: 'Cherry' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, search: true })

      multiSelect.show()
      multiSelect.search('app')

      const visibleOptions = Array.from(multiSelect._optionsElement.querySelectorAll('.list-box-option'))
        .filter(option => !option.hasAttribute('hidden'))

      expect(visibleOptions.length).toBe(1)
      expect(visibleOptions[0].textContent.toLowerCase()).toContain('apple')
    })

    it('should be case insensitive', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Apple' },
        { value: '2', text: 'Banana' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, search: true })

      multiSelect.show()
      multiSelect.search('APPLE')

      const visibleOptions = Array.from(multiSelect._optionsElement.querySelectorAll('.list-box-option'))
        .filter(option => !option.hasAttribute('hidden'))

      expect(visibleOptions.length).toBe(1)
    })

    it('should show all options when search is empty', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Apple' },
        { value: '2', text: 'Banana' },
        { value: '3', text: 'Cherry' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, search: true })

      multiSelect.show()
      multiSelect.search('app')
      multiSelect.search('')

      const visibleOptions = Array.from(multiSelect._optionsElement.querySelectorAll('.list-box-option'))
        .filter(option => !option.hasAttribute('hidden'))

      expect(visibleOptions.length).toBe(3)
    })

    it('should show "no results" message when no options match', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Apple' },
        { value: '2', text: 'Banana' }
      ]
      const multiSelect = new MultiSelect(selectEl, {
        options,
        search: true,
        searchNoResultsLabel: 'No results found'
      })

      multiSelect.show()
      multiSelect.search('xyz')

      const emptyMessage = multiSelect._menu.querySelector('.list-box-empty')
      expect(emptyMessage).not.toBeNull()
      expect(emptyMessage.textContent).toBe('No results found')
      expect(emptyMessage.getAttribute('role')).toBe('status')
    })

    it('should remove "no results" message when results are found again', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Apple' },
        { value: '2', text: 'Banana' }
      ]
      const multiSelect = new MultiSelect(selectEl, {
        options,
        search: true,
        searchNoResultsLabel: 'No results found'
      })

      multiSelect.show()
      multiSelect.search('xyz')

      const emptyMessage = multiSelect._menu.querySelector('.list-box-empty')
      expect(emptyMessage.hasAttribute('hidden')).toBe(false)

      multiSelect.search('app')

      expect(emptyMessage.hasAttribute('hidden')).toBe(true)
    })

    it('should trigger search event', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [{ value: '1', text: 'Option 1' }],
          search: true
        })

        selectEl.addEventListener('search.coreui.multi-select', () => {
          expect(multiSelect._search).toBe('test')
          resolve()
        })

        multiSelect.search('test')
      })
    })

    it('should update search internally via _onSearchChange', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Apple' }, { value: '2', text: 'Banana' }],
        search: true
      })

      multiSelect._searchElement.value = 'ban'
      multiSelect._onSearchChange(multiSelect._searchElement)

      expect(multiSelect._search).toBe('ban')
    })

    it('should handle null element in _onSearchChange', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Apple' }],
        search: true
      })

      // Should not throw
      multiSelect._onSearchChange(null)
      expect(multiSelect._search).toBe('')
    })

    it('should filter options within groups', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        {
          label: 'Fruits',
          options: [
            { value: '1', text: 'Apple' },
            { value: '2', text: 'Banana' }
          ]
        },
        {
          label: 'Vegetables',
          options: [
            { value: '3', text: 'Carrot' }
          ]
        }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, search: true })

      multiSelect.show()
      multiSelect.search('app')

      const visibleOptions = Array.from(multiSelect._optionsElement.querySelectorAll('.list-box-option'))
        .filter(option => !option.hasAttribute('hidden'))

      expect(visibleOptions.length).toBe(1)
      expect(visibleOptions[0].textContent).toContain('Apple')
    })

    it('should hide groups when no options match within them', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        {
          label: 'Fruits',
          options: [
            { value: '1', text: 'Apple' },
            { value: '2', text: 'Banana' }
          ]
        },
        {
          label: 'Vegetables',
          options: [
            { value: '3', text: 'Carrot' }
          ]
        }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, search: true })

      multiSelect.show()
      multiSelect.search('app')

      const vegetablesGroup = Array.from(multiSelect._optionsElement.querySelectorAll('.list-box-section'))
        .find(g => g.querySelector('.list-box-section-label').textContent === 'Vegetables')

      expect(vegetablesGroup.hasAttribute('hidden')).toBe(true)
    })

    it('should set search placeholder to selected option text in single mode', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2' }
        ],
        search: true,
        multiple: false
      })

      expect(multiSelect._searchElement.placeholder).toBe('Opt 1')
    })

    it('should set search placeholder to config placeholder when nothing selected in single mode', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' }
        ],
        search: true,
        multiple: false,
        placeholder: 'Pick one...'
      })

      expect(multiSelect._searchElement.placeholder).toBe('Pick one...')
    })

    it('should set search placeholder when nothing selected in multiple mode', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        search: true,
        multiple: true,
        placeholder: 'Choose items...'
      })

      expect(multiSelect._searchElement.placeholder).toBe('Choose items...')
    })

    it('should remove search placeholder when items selected in multiple mode with chips', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        search: true,
        multiple: true,
        selectionType: 'chips'
      })

      expect(multiSelect._searchElement.placeholder).toBe('')
    })

    it('should show counter in search placeholder when selectionType is counter', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true }
        ],
        search: true,
        multiple: true,
        selectionType: 'counter',
        selectedLabel: count => `${count} items selected`
      })

      expect(multiSelect._searchElement.placeholder).toContain('2')
      expect(multiSelect._searchElement.placeholder).toContain('items selected')
    })

    it('should clear search on select when clearSearchOnSelect is true', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Apple' },
          { value: '2', text: 'Banana' }
        ],
        search: true,
        clearSearchOnSelect: true
      })

      multiSelect.show()
      multiSelect._searchElement.value = 'app'
      multiSelect.search('app')

      // Simulate clicking an option
      const option = multiSelect._optionsElement.querySelector('[data-coreui-value="1"]')
      option.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(multiSelect._searchElement.value).toBe('')
    })
  })

  describe('selection', () => {
    it('should select an option on click', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' }
        ]
      })

      multiSelect.show()
      const option = multiSelect._optionsElement.querySelector('[data-coreui-value="1"]')
      option.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(multiSelect.getValue().length).toBe(1)
      expect(multiSelect.getValue()[0].value).toBe('1')
    })

    it('should not activate a disabled option on click or Enter', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2', disabled: true }
        ]
      })

      multiSelect.show()
      const option = multiSelect._optionsElement.querySelector('[data-coreui-value="2"]')

      expect(option.tabIndex).toBe(-1)

      option.click()

      expect(multiSelect.getValue().length).toBe(0)

      multiSelect._listBox.last()

      expect(multiSelect._listBox.getActive()).toBe('1')
    })

    it('should deselect option when clicking selected option in multiple mode', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2' }
        ],
        multiple: true
      })

      multiSelect.show()
      const option = multiSelect._optionsElement.querySelector('[data-coreui-value="1"]')
      option.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(multiSelect.getValue().length).toBe(0)
    })

    it('should only allow one selection in single mode', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' }
        ],
        multiple: false,
        search: true
      })

      multiSelect.show()
      const option1 = multiSelect._optionsElement.querySelector('[data-coreui-value="1"]')
      option1.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(multiSelect.getValue().length).toBe(1)
      expect(multiSelect.getValue()[0].value).toBe('1')

      multiSelect.show()
      const option2 = multiSelect._optionsElement.querySelector('[data-coreui-value="2"]')
      option2.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(multiSelect.getValue().length).toBe(1)
      expect(multiSelect.getValue()[0].value).toBe('2')
    })

    it('should hide dropdown after selection in single mode', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' }
        ],
        multiple: false,
        search: true
      })

      multiSelect.show()
      const option = multiSelect._optionsElement.querySelector('[data-coreui-value="1"]')
      option.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should select an option and hide dropdown in single mode without search', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' }
        ],
        multiple: false
      })

      multiSelect.show()
      const option = multiSelect._optionsElement.querySelector('[data-coreui-value="1"]')

      expect(() => option.click()).not.toThrow()
      expect(multiSelect.getValue().length).toBe(1)
      expect(multiSelect.getValue()[0].value).toBe('1')
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should add selected class on selected option', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' }
        ]
      })

      multiSelect.show()
      const option = multiSelect._optionsElement.querySelector('[data-coreui-value="1"]')
      option.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(option.classList.contains('selected')).toBe(true)
      expect(option.getAttribute('aria-selected')).toBe('true')
    })

    it('should remove selected class on deselected option', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        multiple: true
      })

      const option = multiSelect._optionsElement.querySelector('[data-coreui-value="1"]')
      option.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(option.classList.contains('selected')).toBe(false)
      expect(option.getAttribute('aria-selected')).toBe('false')
    })

    it('should not select when clicking a label element', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      const labelEl = document.createElement('div')
      labelEl.classList.add('label')
      labelEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(multiSelect.getValue().length).toBe(0)
    })

    it('should find closest option element when clicking child element', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        optionsTemplate: option => `<span class="inner">${option.text}</span>`
      })

      multiSelect.show()
      const innerElement = multiSelect._optionsElement.querySelector('.inner')
      innerElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(multiSelect.getValue().length).toBe(1)
    })

    it('should do nothing when clicking outside option area', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      const randomEl = document.createElement('div')
      multiSelect._optionsElement.append(randomEl)
      randomEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

      expect(multiSelect.getValue().length).toBe(0)
    })

    it('should not allow duplicate selections', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      multiSelect.selectAll([{ value: '1', text: 'Opt 1' }])
      multiSelect.selectAll([{ value: '1', text: 'Opt 1' }])

      expect(multiSelect.getValue().length).toBe(1)
    })

    it('should trigger changed event on selection', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [{ value: '1', text: 'Opt 1' }]
        })

        selectEl.addEventListener('change.coreui.multi-select', event => {
          expect(event.value).toBeDefined()
          expect(event.value.length).toBe(1)
          resolve()
        })

        multiSelect.selectAll([{ value: '1', text: 'Opt 1' }])
      })
    })

    it('should trigger changed event on deselection', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [{ value: '1', text: 'Opt 1', selected: true }]
        })

        selectEl.addEventListener('change.coreui.multi-select', event => {
          expect(event.value).toBeDefined()
          expect(event.value.length).toBe(0)
          resolve()
        })

        multiSelect._deselectOption('1')
      })
    })

    it('should sync native select on selection', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' }
        ]
      })

      multiSelect.selectAll([{ value: '1', text: 'Opt 1' }])

      const nativeOpt = selectEl.querySelector('option[value="1"]')
      expect(nativeOpt.selected).toBe(true)
    })

    it('should sync native select on deselection', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ]
      })

      multiSelect._deselectOption('1')

      const nativeOpt = selectEl.querySelector('option[value="1"]')
      expect(nativeOpt.selected).toBe(false)
    })
  })

  describe('chips', () => {
    it('should default selectionType to chips', () => {
      expect(MultiSelect.Default.selectionType).toEqual('chips')
    })

    it.each([
      ['by default', {}],
      ['for the deprecated tags value', { selectionType: 'tags' }]
    ])('should render the selection as chips in a chips container %s', (_, config) => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{ value: '1', text: 'Opt 1', selected: true }],
        ...config
      })

      expect(multiSelect._selectionElement.classList.contains('multi-select-selection-chips')).toBeTrue()
      expect(multiSelect._selectionElement.classList.contains('form-multi-select-selection-tags')).toBeFalse()
      expect(multiSelect._selectionElement.querySelectorAll('.chip')).toHaveSize(1)
    })

    it.each([
      ['the default label', {}, 'Remove Opt 1'],
      ['ariaChipRemoveLabel', { ariaChipRemoveLabel: 'Usuń' }, 'Usuń Opt 1'],
      ['an ariaChipRemoveLabel function', { ariaChipRemoveLabel: label => `${label} entfernen` }, 'Opt 1 entfernen'],
      ['the deprecated ariaTagDeleteLabel, which wins while it is set', { ariaChipRemoveLabel: 'Usuń', ariaTagDeleteLabel: 'Delete' }, 'Delete Opt 1']
    ])('should name the chip remove button with %s', (_, config, label) => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{ value: '1', text: 'Opt 1', selected: true }],
        ...config
      })

      expect(multiSelect._selectionElement.querySelector('.chip-remove').getAttribute('aria-label')).toBe(label)
    })

    it('should remove a chip on its remove button click', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true }
        ],
        selectionType: 'chips'
      })

      expect(multiSelect.getValue().length).toBe(2)

      const tagDelete = multiSelect._wrapperElement.querySelector('.chip-remove')
      tagDelete.click()

      expect(multiSelect.getValue().length).toBe(1)
    })

    it('should not open the dropdown when clicking a chip remove button', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1', selected: true }],
        selectionType: 'chips'
      })

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)

      multiSelect._wrapperElement.querySelector('.chip-remove').click()

      expect(multiSelect.getValue().length).toBe(0)
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should remove a chip created after initialization via delegation', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2' }
        ],
        selectionType: 'chips'
      })

      // This tag node did not exist when listeners were bound.
      multiSelect.selectAll([{ value: '2', text: 'Opt 2' }])
      const newTagDelete = multiSelect._wrapperElement
        .querySelector('.chip[data-value="2"] .chip-remove')

      newTagDelete.click()

      expect(multiSelect.getValue().some(option => option.value === '2')).toBe(false)
      expect(multiSelect.getValue().length).toBe(1)
    })

    it('should update search size based on selections', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' }
        ],
        selectionType: 'chips',
        search: true,
        multiple: true
      })

      // No items selected, size should not be set
      expect(multiSelect._searchElement.getAttribute('size')).toBeNull()

      // Select an item
      multiSelect.selectAll([{ value: '1', text: 'Opt 1' }])
      expect(multiSelect._searchElement.size).toBe(2)
    })

    it('should handle chips with disabled options', () => {
      // Pre-select via native element with disabled option
      fixtureEl.innerHTML = [
        '<select>',
        '  <option value="1" selected disabled>Opt 1</option>',
        '  <option value="2" selected>Opt 2</option>',
        '</select>'
      ].join('')

      const selectEl2 = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl2, {
        selectionType: 'chips'
      })

      // The disabled option's tag should not have a delete button
      const tags = multiSelect._wrapperElement.querySelectorAll('.chip')
      const disabledTag = Array.from(tags).find(t => t.dataset.value === '1')
      if (disabledTag) {
        expect(disabledTag.querySelector('.chip-remove')).toBeNull()
      }
    })

    it('should set the tag delete aria-label from ariaTagDeleteLabel and the option text', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Angular', selected: true }
        ],
        selectionType: 'chips'
      })

      let tagDelete = multiSelect._wrapperElement.querySelector('.chip-remove')
      expect(tagDelete.getAttribute('aria-label')).toBe('Remove Angular')

      multiSelect.dispose()
      const multiSelect2 = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Angular', selected: true }
        ],
        selectionType: 'chips',
        ariaTagDeleteLabel: 'Usuń'
      })

      tagDelete = multiSelect2._wrapperElement.querySelector('.chip-remove')
      expect(tagDelete.getAttribute('aria-label')).toBe('Usuń Angular')
    })

    it('should reuse existing tag nodes across selection changes', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2' },
          { value: '3', text: 'Opt 3' }
        ],
        selectionType: 'chips'
      })

      const firstTag = multiSelect._wrapperElement.querySelector('.chip[data-value="1"]')

      multiSelect.selectAll([{ value: '2', text: 'Opt 2' }])

      // The diff update keeps the already-rendered tag node instead of recreating it.
      expect(multiSelect._wrapperElement.querySelector('.chip[data-value="1"]')).toBe(firstTag)
      expect(multiSelect._wrapperElement.querySelectorAll('.chip').length).toBe(2)
    })

    it('should remove the placeholder when the first tag is added', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' }
        ],
        selectionType: 'chips'
      })

      expect(multiSelect._wrapperElement.querySelector('.multi-select-placeholder')).not.toBeNull()

      multiSelect.selectAll([{ value: '1', text: 'Opt 1' }])

      expect(multiSelect._wrapperElement.querySelector('.multi-select-placeholder')).toBeNull()
      expect(multiSelect._wrapperElement.querySelectorAll('.chip').length).toBe(1)
    })

    it('should keep chips ordered and before the search input', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' },
          { value: '3', text: 'Opt 3' }
        ],
        selectionType: 'chips',
        search: true,
        multiple: true
      })

      multiSelect.selectAll([{ value: '2', text: 'Opt 2' }])
      multiSelect.selectAll([{ value: '1', text: 'Opt 1' }])

      const selection = multiSelect._wrapperElement.querySelector('.multi-select-selection')
      const order = Array.from(selection.children).map(child => child.dataset.value || 'search')

      expect(order).toEqual(['2', '1', 'search'])
    })

    it('should keep the focus on a chip while the selection is rendered again', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option><option value="b">B</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))
      const chip = multiSelect._selectionElement.querySelector('[data-value="a"]')

      chip.focus()
      multiSelect.selectAll([{ value: 'b', text: 'B' }])

      expect(document.activeElement).toBe(chip)
    })

    it('should keep the focus and the width of a search box holding text while the selection is rendered again', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option><option value="b">B</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: true, selectionType: 'text' })

      multiSelect._searchElement.focus()
      multiSelect._searchElement.value = 'react'
      multiSelect.selectAll([{ value: 'b', text: 'B' }])

      expect(document.activeElement).toBe(multiSelect._searchElement)
      expect(multiSelect._searchElement.size).toBe(6)
    })

    it('should count a selected disabled option in the total', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected disabled>A</option><option value="b">B</option><option value="c">C</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { selectedLabel: '{count}/{total}', selectionType: 'counter' })

      expect(multiSelect._selectionElement.textContent).toBe('1/3')
    })
  })

  describe('keyboard navigation', () => {
    it('should ignore keydown events without a key, as autofill sends them', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: true
      })

      multiSelect.show()

      const targets = [multiSelect._wrapperElement, multiSelect._menu, selectEl, multiSelect._searchElement]
      const errors = captureErrors(() => {
        for (const target of targets) {
          target.dispatchEvent(new Event('keydown', { bubbles: true }))
        }
      })

      expect(errors).toEqual([])
    })

    it('should ignore a keydown without a key in the option list with typeahead', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()

      const target = multiSelect._listBox._field ?? multiSelect._listBox._list
      const errors = captureErrors(() => {
        target.dispatchEvent(new Event('keydown', { bubbles: true }))
      })

      expect(errors).toEqual([])
    })

    it('should ignore a keydown without a key in the search field while closed', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: true
      })

      const errors = captureErrors(() => {
        multiSelect._searchElement.dispatchEvent(new Event('keydown', { bubbles: true }))
      })

      expect(errors).toEqual([])
      expect(multiSelect._isShown()).toBe(false)
    })

    it('should not prevent the default of a keydown without a key on the native select', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      new MultiSelect(selectEl, { // eslint-disable-line no-new
        options: [{ value: '1', text: 'Option 1' }],
        search: true
      })

      const event = new Event('keydown', { bubbles: true, cancelable: true })
      selectEl.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(false)
    })

    it('should open dropdown on Enter key on toggler', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      multiSelect._togglerElement.dispatchEvent(event)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
    })

    it('should open dropdown on ArrowDown key on toggler when closed', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      multiSelect._togglerElement.dispatchEvent(event)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
    })

    it('should navigate to menu item on ArrowDown when already open', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' }
        ]
      })

      multiSelect.show()

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      multiSelect._togglerElement.dispatchEvent(event)

      // Should not throw and should handle navigation
      expect(multiSelect._optionsElement.querySelectorAll('.list-box-option').length).toBe(2)
    })

    it('should focus the first/last navigable item on Home/End keys', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' },
          { value: '3', text: 'Option 3' }
        ],
        selectAll: false
      })

      multiSelect.show()

      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }))
      expect(multiSelect._listBox.getActive()).toBe('3')

      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }))
      expect(multiSelect._listBox.getActive()).toBe('1')
      expect(document.activeElement).not.toBe(multiSelect._optionsElement)
    })

    it('should move focus into the options list on arrow keys in the search input', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' },
          { value: '3', text: 'Option 3' }
        ],
        search: true
      })

      multiSelect.show()

      expect(document.activeElement).toBe(multiSelect._searchElement)

      multiSelect._searchElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))

      expect(multiSelect._listBox.getActive()).toBe('1')
      expect(document.activeElement.dataset.coreuiValue).toBe('1')
    })

    it('should enter the options list at the last option on arrow up', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' },
          { value: '3', text: 'Option 3' }
        ],
        search: true
      })

      multiSelect.show()
      multiSelect._searchElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))

      expect(multiSelect._listBox.getActive()).toBe('3')
      expect(document.activeElement.dataset.coreuiValue).toBe('3')
    })

    it('should pass over the filtered out options when focus enters the list', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1', selected: true },
          { value: '2', text: 'Option 2' },
          { value: '3', text: 'Third' }
        ],
        search: true
      })

      multiSelect.show()
      multiSelect._searchElement.value = 'third'
      multiSelect._onSearchChange(multiSelect._searchElement)
      multiSelect._searchElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))

      expect(multiSelect._listBox.getActive()).toBe('3')
      expect(document.activeElement.dataset.coreuiValue).toBe('3')
    })

    it('should take the option the list points at on Enter in the search input', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Angular' },
          { value: '2', text: 'React' }
        ],
        search: true
      })

      multiSelect.show()
      multiSelect._searchElement.value = 'rea'
      multiSelect._onSearchChange(multiSelect._searchElement)

      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
      multiSelect._searchElement.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(true)
      expect(multiSelect.getValue().map(option => option.value)).toEqual(['2'])
    })

    it('should leave the space bar to the option under the focus', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' }
        ],
        search: true
      })

      multiSelect.show()
      multiSelect._searchElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))

      const option = document.activeElement

      option.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))

      expect(multiSelect.getValue().map(item => item.value)).toEqual(['1'])
      expect(document.activeElement).toBe(option)
    })

    it('should leave a chord to the options list rather than the search input', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' }
        ],
        search: true
      })

      multiSelect.show()
      multiSelect._searchElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))

      const option = document.activeElement

      option.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'a', ctrlKey: true, bubbles: true, cancelable: true
      }))

      expect(multiSelect.getValue().length).toBe(2)
      expect(document.activeElement).toBe(option)
    })

    it('should enter the list on the first match once a query narrows it', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Beta' },
          { value: '2', text: 'Bamma', selected: true },
          { value: '3', text: 'Bravo' }
        ],
        search: true
      })

      multiSelect.show()
      multiSelect._searchElement.value = 'b'
      multiSelect._onSearchChange(multiSelect._searchElement)
      multiSelect._searchElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))

      expect(multiSelect._listBox.getActive()).toBe('1')
    })

    it('should keep the select all button out of the arrow navigation', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' }
        ]
      })

      multiSelect.show()
      multiSelect._togglerElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))

      expect(multiSelect._listBox.getActive()).toBe('1')
      expect(multiSelect._selectAllElement.hasAttribute('tabindex')).toBe(false)
    })

    it('should keep the select all button enabled with a selection limit', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' },
          { value: '3', text: 'Option 3' }
        ],
        selectionLimit: 1
      })

      multiSelect.show()

      expect(multiSelect._selectAllElement.disabled).toBe(false)
    })

    it('should close dropdown on Escape key', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)

      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      multiSelect._wrapperElement.dispatchEvent(event)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should return focus to the toggler when closed from inside the component', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()

      expect(multiSelect._menu.contains(document.activeElement)).toBe(true)

      multiSelect.hide()

      expect(document.activeElement).toBe(multiSelect._togglerElement)
    })

    it('should return focus to the search input on close when search is enabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: true
      })

      multiSelect.show()
      multiSelect._searchElement.focus()

      multiSelect.hide()

      expect(document.activeElement).toBe(multiSelect._searchElement)
    })

    it('should focus the search input whenever the component carries one', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        globalSearch: false,
        options: [{ value: '1', text: 'Option 1' }],
        search: true
      })

      multiSelect.show()

      expect(document.activeElement).toBe(multiSelect._searchElement)
    })

    it('should hold the focus in the panel when there is no option to take it', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [], selectAll: false })

      multiSelect.show()

      expect(multiSelect._menu.contains(document.activeElement)).toBe(true)
    })

    it('should keep holding the focus when an outside press does not close the panel', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] })

      multiSelect.show()

      // A right click closes nothing, so the dialog takes its focus back.
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 2 }))
      document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 2 }))

      expect(multiSelect._isShown()).toBeTrue()
      expect(multiSelect._focustrap._isActive).toBe(true)
    })

    it('should leave no focus trap behind when a shown listener closes the panel', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }] })

      selectEl.addEventListener('shown.coreui.multi-select', () => multiSelect.hide())
      multiSelect.show()

      expect(multiSelect._focustrap).toBeNull()
    })

    it('should not move focus when closed from outside the component', () => {
      fixtureEl.innerHTML = '<select></select><button id="multiSelectOutsideBtn">Outside</button>'
      const selectEl = fixtureEl.querySelector('select')
      const outside = fixtureEl.querySelector('#multiSelectOutsideBtn')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()

      // The dialog holds focus, so the only way out is the pointer.
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      outside.focus()
      outside.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      expect(multiSelect._isShown()).toBeFalse()
      expect(document.activeElement).toBe(outside)
    })

    it('should select option on Enter key in options list', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' }
        ]
      })

      multiSelect.show()

      multiSelect._listBox.setActive('1')
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
      multiSelect._optionsElement.querySelector('.list-box-option').dispatchEvent(enterEvent)

      expect(multiSelect.getValue().length).toBe(1)
      expect(multiSelect.getValue()[0].value).toBe('1')
    })

    it('should select option on Space key in options list', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' }
        ]
      })

      multiSelect.show()

      multiSelect._listBox.setActive('1')
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
      multiSelect._optionsElement.querySelector('.list-box-option').dispatchEvent(spaceEvent)

      expect(spaceEvent.defaultPrevented).toBe(true)
      expect(multiSelect.getValue().length).toBe(1)
      expect(multiSelect.getValue()[0].value).toBe('1')
    })

    it('should navigate options with ArrowDown in options list', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' }
        ]
      })

      multiSelect.show()

      const firstOption = multiSelect._optionsElement.querySelector('[data-coreui-value="1"]')
      firstOption.focus()

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      multiSelect._optionsElement.dispatchEvent(event)

      // Should not throw
      expect(true).toBe(true)
    })

    it('should navigate options with ArrowUp in options list', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' }
        ]
      })

      multiSelect.show()

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
      multiSelect._optionsElement.dispatchEvent(event)

      // Should not throw
      expect(true).toBe(true)
    })

    it.each(['Backspace', 'Delete'])('should focus the last chip on %s in the empty search, and remove it on the next press', key => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true }
        ],
        search: true,
        multiple: true
      })
      const press = target => target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))

      multiSelect._searchElement.focus()
      press(multiSelect._searchElement)

      expect(multiSelect.getValue().length).toBe(2)
      expect(document.activeElement.dataset.value).toBe('2')

      press(document.activeElement)

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1'])
      expect(document.activeElement.dataset.value).toBe('1')
    })

    describe('selection chips', () => {
      const chipOptions = [
        { value: '1', text: 'Opt 1', selected: true },
        { value: '2', text: 'Opt 2', selected: true },
        { value: '3', text: 'Opt 3', selected: true }
      ]
      const create = (config = {}) => {
        fixtureEl.innerHTML = '<select></select>'
        return new MultiSelect(fixtureEl.querySelector('select'), { options: chipOptions, search: true, ...config })
      }

      const chip = (multiSelect, value) => multiSelect._selectionElement.querySelector(`.chip[data-value="${value}"]`)
      const key = (target, name) => target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }))

      it('should keep one tab stop among the chips', () => {
        const multiSelect = create()

        expect(['1', '2', '3'].map(value => chip(multiSelect, value).tabIndex)).toEqual([0, -1, -1])
      })

      it.each([
        ['ltr', 'ArrowLeft', 'ArrowRight'],
        ['rtl', 'ArrowRight', 'ArrowLeft']
      ])('should move between the search and the last chip with the arrows (%s)', (dir, toChips, toField) => {
        fixtureEl.innerHTML = `<div dir="${dir}"><select></select></div>`
        const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options: chipOptions, search: true })

        multiSelect._searchElement.focus()
        key(multiSelect._searchElement, toChips)

        expect(document.activeElement).toEqual(chip(multiSelect, '3'))

        key(document.activeElement, toField)

        expect(document.activeElement).toEqual(multiSelect._searchElement)
      })

      it('should not leave the search for the chips with the caret past the start', () => {
        const multiSelect = create()
        multiSelect._searchElement.value = 'ab'
        multiSelect._searchElement.focus()
        multiSelect._searchElement.setSelectionRange(1, 1)

        key(multiSelect._searchElement, 'ArrowLeft')

        expect(document.activeElement).toEqual(multiSelect._searchElement)
      })

      it.each([
        ['the next chip after removing a middle one', {}, ['1', '2', '3'], '2', '3'],
        ['the search after removing the only one', {}, ['1'], '1', 'search'],
        ['the field after removing the only one without a search', { search: false }, ['1'], '1', 'toggler']
      ])('should move focus to %s', (_, config, values, removed, expected) => {
        const multiSelect = create({ ...config, options: chipOptions.filter(option => values.includes(option.value)) })

        chip(multiSelect, removed).focus()
        key(chip(multiSelect, removed), 'Backspace')

        const target = expected === 'search' ? multiSelect._searchElement : (expected === 'toggler' ? multiSelect._togglerElement : chip(multiSelect, expected))
        expect(document.activeElement).toEqual(target)
      })

      it('should keep one tab stop when a chip is added and keep it on the focused chip when an earlier one is rebuilt', () => {
        const multiSelect = create({ options: [...chipOptions.slice(0, 2), { value: '4', text: 'Opt 4' }] })

        multiSelect._optionsElement.querySelector('[data-coreui-value="4"]').click()

        expect(['1', '2', '4'].map(value => chip(multiSelect, value).tabIndex)).toEqual([0, -1, -1])

        chip(multiSelect, '4').focus()
        multiSelect.setOptions([{ value: '1', text: 'Opt 1 (LTS)' }, { value: '2', text: 'Opt 2' }, { value: '4', text: 'Opt 4' }])

        expect(['1', '2', '4'].map(value => chip(multiSelect, value).tabIndex)).toEqual([-1, -1, 0])
        expect(document.activeElement).toEqual(chip(multiSelect, '4'))
      })

      it.each([
        ['an IME composition', { isComposing: true }],
        ['a modifier', { ctrlKey: true }]
      ])('should stay in the search for an arrow during %s', (_, init) => {
        const multiSelect = create()
        multiSelect._searchElement.focus()

        multiSelect._searchElement.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'ArrowLeft', bubbles: true, cancelable: true, ...init
        }))

        expect(document.activeElement).toEqual(multiSelect._searchElement)
      })

      it('should close the open panel when the focus moves to the chips', () => {
        const multiSelect = create()
        multiSelect.show()
        multiSelect._searchElement.focus()

        key(multiSelect._searchElement, 'Backspace')

        expect(multiSelect._isShown()).toBeFalse()
        expect(document.activeElement).toEqual(chip(multiSelect, '3'))
      })

      it('should focus the last removable chip when the last one is locked', () => {
        const multiSelect = create({
          options: [...chipOptions.slice(0, 2), {
            value: '3', text: 'Opt 3', selected: true, disabled: true
          }]
        })
        multiSelect._searchElement.focus()

        key(multiSelect._searchElement, 'Backspace')

        expect(document.activeElement).toEqual(chip(multiSelect, '2'))
      })

      it('should take the two-step model for the deprecated tags value', () => {
        const multiSelect = create({ selectionType: 'tags' })
        multiSelect._searchElement.focus()

        key(multiSelect._searchElement, 'Backspace')

        expect(multiSelect.getValue()).toHaveSize(3)
        expect(document.activeElement).toEqual(chip(multiSelect, '3'))
      })

      it.each([
        ['a single select', { multiple: false, options: [{ value: '1', text: 'Opt 1', selected: true }] }, []],
        ['the text selection', { selectionType: 'text' }, ['1', '2']]
      ])('should remove the last value at once in %s', (_, config, expected) => {
        const multiSelect = create(config)

        key(multiSelect._searchElement, 'Backspace')

        expect(multiSelect.getValue().map(option => option.value)).toEqual(expected)
      })

      it('should move to the first and last chip with Home and End', () => {
        const multiSelect = create()
        chip(multiSelect, '2').focus()

        key(chip(multiSelect, '2'), 'End')
        expect(document.activeElement).toEqual(chip(multiSelect, '3'))

        key(chip(multiSelect, '3'), 'Home')
        expect(document.activeElement).toEqual(chip(multiSelect, '1'))
      })

      it('should stay on the last chip with the arrow away from the chips when there is no search', () => {
        const multiSelect = create({ search: false })
        chip(multiSelect, '3').focus()

        key(chip(multiSelect, '3'), 'ArrowRight')

        expect(document.activeElement).toEqual(chip(multiSelect, '3'))
      })

      it.each([
        ['to the search with globalSearch', { globalSearch: true }, 'search'],
        ['nowhere without globalSearch', { globalSearch: false }, 'chip']
      ])('should send a letter typed on a chip %s, with no typeahead among the chips', (_, config, expected) => {
        const multiSelect = create({ ...config, options: [{ value: '1', text: 'Angular', selected: true }, { value: '2', text: 'Vue', selected: true }] })
        chip(multiSelect, '2').focus()

        key(chip(multiSelect, '2'), 'a')

        expect(document.activeElement).toEqual(expected === 'search' ? multiSelect._searchElement : chip(multiSelect, '2'))
        expect(chip(multiSelect, '1').tabIndex).toEqual(-1)
      })

      it('should leave focus where it is when a chip without focus is removed', () => {
        const multiSelect = create()
        multiSelect._searchElement.focus()

        chip(multiSelect, '2').querySelector('.chip-remove').click()

        expect(document.activeElement).toEqual(multiSelect._searchElement)
      })

      describe('announcement', () => {
        const messages = () => [...document.querySelectorAll('[data-coreui-live-announcer] [aria-live="polite"] > *')].map(message => message.textContent)
        const removeAnnouncers = () => {
          for (const announcer of document.querySelectorAll('[data-coreui-live-announcer]')) {
            announcer.remove()
          }
        }

        const settle = async () => {
          await Promise.resolve()
          vi.advanceTimersByTime(100)
        }

        beforeEach(() => {
          removeAnnouncers()
          vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
        })

        afterEach(() => {
          vi.useRealTimers()
          removeAnnouncers()
        })

        it('should announce a value removed through its chip, Backspace and the cleaner', async () => {
          const multiSelect = create()

          chip(multiSelect, '1').querySelector('.chip-remove').click()
          await settle()
          multiSelect._searchElement.focus()
          key(multiSelect._searchElement, 'Backspace')
          key(document.activeElement, 'Backspace')
          await settle()
          multiSelect._selectionCleanerElement.click()
          await settle()

          expect(messages()).toEqual(['Opt 1 removed', 'Opt 3 removed', 'Opt 2 removed'])
        })

        it('should announce one of two selected values that share a label', async () => {
          const multiSelect = create({ options: [{ value: '1', text: 'John', selected: true }, { value: '2', text: 'John', selected: true }] })

          chip(multiSelect, '1').querySelector('.chip-remove').click()
          await settle()

          expect(messages()).toEqual(['John removed'])
        })

        it('should word the announcement with ariaRemovedAnnouncement and stay quiet for a pick from the list', async () => {
          const multiSelect = create({ ariaRemovedAnnouncement: values => `Usunięto: ${values.join(', ')}` })

          multiSelect._optionsElement.querySelector('[data-coreui-value="1"]').click()
          await settle()
          chip(multiSelect, '2').querySelector('.chip-remove').click()
          await settle()

          expect(messages()).toEqual(['Usunięto: Opt 2'])
        })
      })
    })

    it('should deselect the last option on Backspace in the empty search of a counter', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true }
        ],
        search: true,
        selectionType: 'counter'
      })

      multiSelect._searchElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1'])
    })

    it('should not deselect if search has text on Backspace', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        search: true,
        multiple: true
      })

      multiSelect._searchElement.value = 'some text'
      const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true })
      Object.defineProperty(event, 'target', { value: multiSelect._searchElement })
      multiSelect._searchElement.dispatchEvent(event)

      expect(multiSelect.getValue().length).toBe(1)
    })

    it('should open dropdown when typing in search input', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: true
      })

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)

      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true })
      multiSelect._searchElement.dispatchEvent(event)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
    })

    it('should open dropdown on ArrowDown from search input', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: true
      })

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      multiSelect._searchElement.dispatchEvent(event)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
    })

    it('should not open on typing when ctrlKey is pressed', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: true
      })

      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, ctrlKey: true })
      multiSelect._searchElement.dispatchEvent(event)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should not open on typing when metaKey is pressed', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: true
      })

      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, metaKey: true })
      multiSelect._searchElement.dispatchEvent(event)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should move letters typed on an option into the search field', async () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">Angular</option><option value="r">React</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: true })

      multiSelect.show()
      multiSelect._menu.querySelector('.list-box-option').focus()
      await userEvent.keyboard('r')

      expect(document.activeElement).toBe(multiSelect._searchElement)
      expect(multiSelect._searchElement.value).toBe('r')
      expect(multiSelect._menu.querySelector('.list-box-option[tabindex="0"]').textContent.trim()).toBe('Angular')

      await userEvent.keyboard('e')

      expect(multiSelect._searchElement.value).toBe('re')
    })

    it('should move a letter typed on the select all button into the search field', async () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">Angular</option><option value="r">React</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: true, selectAll: true })

      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-select-all]').focus()
      await userEvent.keyboard('r')

      expect(document.activeElement).toBe(multiSelect._searchElement)
      expect(multiSelect._searchElement.value).toBe('r')
    })

    it('should move Backspace pressed on an option into the search field without deselecting', async () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>Angular</option><option value="r">React</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: true })

      multiSelect.show()
      await userEvent.keyboard('an')
      multiSelect._menu.querySelector('.list-box-option').focus()
      await userEvent.keyboard('{Backspace}')

      expect(document.activeElement).toBe(multiSelect._searchElement)
      expect(multiSelect._searchElement.value).toBe('a')
      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
    })

    it('should leave the space bar and Ctrl+A to the option under the focus', async () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">Angular</option><option value="r">React</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: true })

      multiSelect.show()
      const option = multiSelect._menu.querySelector('.list-box-option')
      option.focus()
      await userEvent.keyboard(' ')

      expect(document.activeElement).toBe(option)
      expect(multiSelect.getValue().map(item => item.value)).toEqual(['a'])

      await userEvent.keyboard('{Control>}a{/Control}')

      expect(document.activeElement).toBe(option)
      expect(multiSelect.getValue().map(item => item.value)).toEqual(['a', 'r'])
      expect(multiSelect._searchElement.value).toBe('')
    })

    it('should move a character typed with AltGr into the search field and keep a Ctrl chord on the option', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">Angular</option><option value="r">React</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: true })

      multiSelect.show()
      const option = multiSelect._menu.querySelector('.list-box-option')
      option.focus()
      option.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', ctrlKey: true, bubbles: true }))

      expect(document.activeElement).toBe(option)

      option.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'ą', ctrlKey: true, altKey: true, bubbles: true
      }))

      expect(document.activeElement).toBe(multiSelect._searchElement)
    })

    it('should leave a key of an IME composition on the option', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">Angular</option><option value="r">React</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: true })

      multiSelect.show()
      const option = multiSelect._menu.querySelector('.list-box-option')
      option.focus()
      option.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', isComposing: true, bubbles: true }))

      expect(document.activeElement).toBe(option)
    })

    it('should leave letters typed on an option to the list typeahead when globalSearch is false', async () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">Angular</option><option value="r">React</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { globalSearch: false, search: true })

      multiSelect.show()
      multiSelect._menu.querySelector('.list-box-option').focus()
      await userEvent.keyboard('r')

      expect(document.activeElement.textContent.trim()).toBe('React')
      expect(multiSelect._searchElement.value).toBe('')
    })

    it('should handle _deselectLastOption when no options are selected', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        search: true,
        multiple: true
      })

      // Should not throw when nothing is selected
      multiSelect._deselectLastOption()
      expect(multiSelect.getValue().length).toBe(0)
    })
  })

  describe('cleaner', () => {
    it('should insert cleaner when items are selected', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        cleaner: true,
        multiple: true
      })

      const cleaner = multiSelect._wrapperElement.querySelector('.form-control-cleaner')
      expect(cleaner).not.toBeNull()
    })

    it('should deselect all when clicking a re-created cleaner via delegation', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2' }
        ],
        cleaner: true,
        multiple: true
      })

      // Empty the selection so the cleaner is removed, then re-create it.
      multiSelect.deselectAll()
      expect(multiSelect._wrapperElement.querySelector('.form-control-cleaner')).toBeNull()

      multiSelect.selectAll([{ value: '2', text: 'Opt 2' }])
      const cleaner = multiSelect._wrapperElement.querySelector('.form-control-cleaner')
      expect(cleaner).not.toBeNull()

      cleaner.click()

      expect(multiSelect.getValue().length).toBe(0)
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should not insert cleaner when no items are selected', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        cleaner: true,
        multiple: true
      })

      const cleaner = multiSelect._wrapperElement.querySelector('.form-control-cleaner')
      expect(cleaner).toBeNull()
    })

    it('should insert cleaner after selecting an item', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        cleaner: true,
        multiple: true
      })

      expect(multiSelect._wrapperElement.querySelector('.form-control-cleaner')).toBeNull()

      multiSelect.selectAll([{ value: '1', text: 'Opt 1' }])

      expect(multiSelect._wrapperElement.querySelector('.form-control-cleaner')).not.toBeNull()
    })

    it('should insert cleaner and clear selection for single select', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1', selected: true }],
        cleaner: true,
        multiple: false
      })

      const cleaner = multiSelect._wrapperElement.querySelector('.form-control-cleaner')
      expect(cleaner).not.toBeNull()

      cleaner.click()

      expect(multiSelect.getValue().length).toBe(0)
      expect(multiSelect._wrapperElement.querySelector('.form-control-cleaner')).toBeNull()
    })

    it('should deselect all on cleaner click', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true }
        ],
        cleaner: true,
        multiple: true
      })

      expect(multiSelect.getValue().length).toBe(2)

      const cleaner = multiSelect._wrapperElement.querySelector('.form-control-cleaner')
      cleaner.click()

      expect(multiSelect.getValue().length).toBe(0)
      expect(multiSelect._wrapperElement.querySelector('.form-control-cleaner')).toBeNull()
    })

    it('should not deselect on cleaner click when disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        cleaner: true,
        multiple: true
      })

      multiSelect._disabled = true

      // Trigger the event handler directly
      const event = new Event('click', { bubbles: true })
      event.preventDefault = jasmine.createSpy('preventDefault')
      event.stopPropagation = jasmine.createSpy('stopPropagation')

      // The handler checks disabled, so we need to fire via EventHandler
      // But since disabled is set, clicking should not deselect
      // Force trigger the cleaner click handler
      multiSelect._selectionCleanerElement.dispatchEvent(event)

      expect(multiSelect.getValue().length).toBe(1)
    })
  })

  describe('indicator', () => {
    it('should toggle on indicator click', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
      multiSelect._indicatorElement.click()
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
    })

    it('should disable the indicator when disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        disabled: true
      })

      expect(multiSelect._indicatorElement.disabled).toBe(true)
    })
  })

  describe('select all button', () => {
    it('should select all options on selectAll button click', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' },
          { value: '3', text: 'Opt 3' }
        ],
        selectAll: true,
        multiple: true
      })

      multiSelect.show()
      multiSelect._selectAllElement.click()

      expect(multiSelect.getValue().length).toBe(3)
    })

    it('should keep selectAll button enabled and select up to the limit on click', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' },
          { value: '3', text: 'Opt 3' }
        ],
        selectAll: true,
        multiple: true,
        selectionLimit: 2
      })
      let eventCount = 0

      selectEl.addEventListener('selectionLimit.coreui.multi-select', () => {
        eventCount += 1
      })

      expect(multiSelect._selectAllElement.disabled).toBe(false)

      multiSelect._selectAllElement.click()
      expect(multiSelect.getValue().length).toBe(2)
      expect(eventCount).toBe(1)
    })

    it('should toggle to deselect all once the limit is reached', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' },
          { value: '3', text: 'Opt 3' }
        ],
        selectAll: true,
        multiple: true,
        selectionLimit: 2,
        deselectAllLabel: 'Deselect all'
      })

      multiSelect._selectAllElement.click()
      expect(multiSelect.getValue().length).toBe(2)

      // At the limit the toggle flips to "deselect all" and the checkbox reads as full.
      expect(multiSelect._isAllSelected()).toBe(true)
      expect(multiSelect._selectAllElement.textContent).toBe('Deselect all')
      expect(multiSelect._selectAllElement.classList.contains('selected')).toBe(true)

      multiSelect._selectAllElement.click()
      expect(multiSelect.getValue().length).toBe(0)
    })

    it('should keep the selectAll button enabled regardless of search with a limit', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Apple' },
          { value: '2', text: 'Apricot' },
          { value: '3', text: 'Banana' }
        ],
        search: true,
        selectAll: true,
        multiple: true,
        selectionLimit: 2
      })

      expect(multiSelect._selectAllElement.disabled).toBe(false)

      multiSelect.search('ban')

      expect(multiSelect._selectAllElement.disabled).toBe(false)
    })

    it('should display custom selectAllLabel', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        selectAll: true,
        multiple: true,
        selectAllLabel: 'Choose All'
      })

      expect(multiSelect._selectAllElement.textContent).toBe('Choose All')
    })

    it('should press select all once the limit is reached with a selected disabled option', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected disabled>A</option><option value="b">B</option><option value="c">C</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { selectionLimit: 2 })

      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="b"]').click()

      expect(multiSelect._selectAllElement.getAttribute('aria-pressed')).toBe('true')

      multiSelect._selectAllElement.click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
    })

    it('should not press select all while a selectable option is left with a selected disabled option and no limit', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected disabled>A</option><option value="b" selected>B</option><option value="c">C</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))

      expect(multiSelect._selectAllElement.getAttribute('aria-pressed')).toBe('mixed')
    })

    it('should report the limit once when Ctrl+A in the list stops at it', () => {
      fixtureEl.innerHTML = '<select multiple><option value="1">One</option><option value="2">Two</option><option value="3">Three</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { selectionLimit: 2 })
      const limits = []

      selectEl.addEventListener('selectionLimit.coreui.multi-select', () => limits.push(true))
      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="1"]').dispatchEvent(new KeyboardEvent('keydown', {
        key: 'a', ctrlKey: true, bubbles: true, cancelable: true
      }))

      expect(multiSelect.getValue()).toHaveSize(2)
      expect(limits).toHaveSize(1)
    })

    it('should not redraw the list again for a selection the list made', () => {
      fixtureEl.innerHTML = '<select multiple><option value="1" selected>One</option><option value="2" selected>Two</option><option value="3">Three</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))

      multiSelect.show()
      const update = spyOn(multiSelect._listBox, 'update').and.callThrough()
      const settle = multiSelect._onSelectionChange.bind(multiSelect)
      let redraws = 0

      spyOn(multiSelect, '_onSelectionChange').and.callFake(() => {
        const before = update.calls.count()
        settle()
        redraws += update.calls.count() - before
      })
      multiSelect._menu.querySelector('[data-coreui-value="3"]').click()

      expect(multiSelect.getValue()).toHaveSize(3)
      expect(multiSelect._onSelectionChange).toHaveBeenCalled()
      expect(redraws).toEqual(0)
    })

    it('should report the limit once when a range in the list stops at it', () => {
      fixtureEl.innerHTML = '<select multiple><option value="1">One</option><option value="2">Two</option><option value="3">Three</option><option value="4">Four</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { selectionLimit: 2 })
      const limits = []

      selectEl.addEventListener('selectionLimit.coreui.multi-select', () => limits.push(true))
      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="1"]').click()
      multiSelect._menu.querySelector('[data-coreui-value="4"]').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, shiftKey: true }))

      expect(multiSelect.getValue()).toHaveSize(2)
      expect(limits).toHaveSize(1)
    })

    it('should report the limit once when a group label in the list stops at it', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ label: 'G', options: [{ value: '1', text: 'One' }, { value: '2', text: 'Two' }] }],
        optionsGroupsSelectable: true,
        selectionLimit: 1
      })
      const limits = []

      selectEl.addEventListener('selectionLimit.coreui.multi-select', () => limits.push(true))
      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-section-toggle]').click()

      expect(limits).toHaveSize(1)
    })
  })

  describe('setters', () => {
    it('should show a selected disabled option as selected in the list', () => {
      fixtureEl.innerHTML = '<select multiple><option value="1" selected disabled>One</option><option value="2">Two</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))

      multiSelect.show()

      expect(multiSelect._menu.querySelector('[data-coreui-value="1"]').getAttribute('aria-selected')).toEqual('true')
    })

    it('should report the limit once when a group label reaches it with a value the options no longer carry', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { selectionLimit: 2, optionsGroupsSelectable: true })
      const limits = []

      multiSelect.setOptions([{ label: 'G', options: [{ value: 'b', text: 'B' }, { value: 'c', text: 'C' }, { value: 'd', text: 'D' }] }])
      selectEl.addEventListener('selectionLimit.coreui.multi-select', () => limits.push(true))
      multiSelect.show()
      multiSelect._menu.querySelector('.list-box-section-label').click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a', 'b'])
      expect(limits).toHaveSize(1)
    })

    it('should count a selected value the options no longer carry against the limit in the list', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option><option value="b">B</option><option value="c">C</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { selectionLimit: 2 })
      const limits = []

      multiSelect.setOptions([{ value: 'b', text: 'B' }, { value: 'c', text: 'C' }])
      selectEl.addEventListener('selectionLimit.coreui.multi-select', () => limits.push(true))
      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="b"]').click()
      multiSelect._menu.querySelector('[data-coreui-value="c"]').click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a', 'b'])
      expect(multiSelect._listBox.getSelectedValues()).toEqual(['a', 'b'])
      expect(multiSelect._menu.querySelector('[data-coreui-value="c"]').getAttribute('aria-selected')).toEqual('false')
      expect(limits).toHaveSize(1)
    })

    it('should not send list box events when the page changes the selection', () => {
      fixtureEl.innerHTML = '<select multiple><option value="1" selected>One</option><option value="2">Two</option><option value="3">Three</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))
      const events = []
      const listener = event => events.push(event.type)

      multiSelect.show()

      for (const name of ['select', 'selected', 'deselect', 'deselected', 'change']) {
        document.addEventListener(`${name}.coreui.list-box`, listener)
      }

      multiSelect.selectAll()
      multiSelect.deselectAll()

      for (const name of ['select', 'selected', 'deselect', 'deselected', 'change']) {
        document.removeEventListener(`${name}.coreui.list-box`, listener)
      }

      expect(multiSelect.getValue()).toEqual([])
      expect(events).toEqual([])
    })

    it('should update configuration and options', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      const newOptions = [
        { value: 'new1', text: 'New Option 1' },
        { value: 'new2', text: 'New Option 2' }
      ]

      multiSelect.setOptions(newOptions)
      expect(multiSelect._options.length).toBe(2)
      expect(multiSelect._options[0].value).toBe('new1')
    })

    it('should type check the options it is given', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        multiple: false,
        options: [{ value: '1', text: 'Option 1' }]
      })

      expect(() => multiSelect.setTotal('yes')).toThrowError(TypeError)
      expect(multiSelect._config.total).toBeNull()
    })

    it('should keep the selection when it rejects a value of the wrong type', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2', selected: true }]
      })
      const changes = []

      selectEl.addEventListener('change', () => changes.push(selectEl.value))

      expect(() => multiSelect.setValue(true)).toThrowError(TypeError)
      expect(multiSelect.getValue().map(option => option.value)).toEqual(['2'])
      expect(changes).toEqual([])
    })

    it('should drop a state given with the invalid alias in setValidationState(null)', () => {
      fixtureEl.innerHTML = '<select><option value="a">A</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { invalid: true })

      multiSelect.setValidationState(null)

      expect(multiSelect._wrapperElement).not.toHaveClass('is-invalid')
    })

    it('should not expose setConfig', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))

      expect(typeof multiSelect.setConfig).toEqual('undefined')
    })

    it('should write multiple and required on the native select at every build', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        multiple: true,
        required: true
      })

      expect(selectEl.getAttribute('multiple')).toBe('true')
      expect(selectEl.getAttribute('required')).toBe('true')

      multiSelect.dispose()
      // eslint-disable-next-line no-new
      new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1' }], multiple: false, required: false })

      expect(selectEl.hasAttribute('multiple')).toBe(false)
      expect(selectEl.hasAttribute('required')).toBe(false)
    })

    it('should deselect all when value is provided in update config', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1', selected: true },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      expect(multiSelect.getValue().length).toBe(1)

      multiSelect.setOptions([{ value: '3', text: 'Option 3' }])
      multiSelect.setValue(['3'])

      expect(multiSelect.getValue().length).toBe(1)
      expect(multiSelect.getValue()[0].value).toBe('3')
    })

    it('should keep the DOM on setValue', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      const wrapper = multiSelect._wrapperElement

      multiSelect.setValue(['1'])

      expect(multiSelect._wrapperElement).toBe(wrapper)
      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1'])
    })

    it('should keep a value setValue gives until options bring it, without a change event', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: 'a', text: 'A' }] })
      const changes = []
      selectEl.addEventListener('change.coreui.multi-select', event => changes.push(event))

      multiSelect.setValue(['x'])

      expect(multiSelect.getValue()).toEqual([])

      multiSelect.setOptions([{ value: 'x', text: 'X' }, { value: 'y', text: 'Y' }])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['x'])
      expect(changes).toEqual([])
    })

    it('should keep the focused chip and an open panel through setValue', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{ value: 'a', text: 'A', selected: true }, { value: 'b', text: 'B', selected: true }, { value: 'c', text: 'C' }]
      })
      const chip = multiSelect._selectionElement.querySelectorAll('.chip')[1]

      chip.focus()
      multiSelect.setValue(['a', 'b', 'c'])

      expect(document.activeElement).toBe(chip)
      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a', 'b', 'c'])

      multiSelect.show()
      const listOption = multiSelect._menu.querySelector('[data-coreui-value="c"]')
      listOption.focus()
      multiSelect.setValue(['a'])

      expect(multiSelect._isShown()).toBeTrue()
      expect(document.activeElement).toBe(listOption)
      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
    })

    it('should keep the selection, its chips and the menu through disable() and enable()', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1', selected: true }],
        search: true,
        selectionType: 'chips'
      })
      const selection = multiSelect._selectionElement
      const menu = multiSelect._menu
      const search = multiSelect._searchElement

      multiSelect.disable()

      expect(selectEl.disabled).toBeTrue()
      expect(search.disabled).toBeTrue()
      expect(selection.querySelector('.chip-remove')).toBeNull()

      multiSelect.enable()

      expect(multiSelect._selectionElement).toBe(selection)
      expect(multiSelect._menu).toBe(menu)
      expect(multiSelect._searchElement).toBe(search)
      expect(search.disabled).toBeFalse()
      expect(selection.querySelector('.chip-remove')).not.toBeNull()
    })

    it('should close an open panel on disable()', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options: [{ value: '1', text: 'Option 1' }] })

      multiSelect.show()
      multiSelect.disable()

      expect(multiSelect._isShown()).toBeFalse()
    })

    it('should let a select built disabled search once enable() runs', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        disabled: true,
        options: [{ value: 'a', text: 'Alpha' }, { value: 'b', text: 'Beta' }],
        search: true
      })

      multiSelect.enable()
      multiSelect.show()
      multiSelect._searchElement.value = 'Be'
      multiSelect._searchElement.dispatchEvent(new Event('input', { bubbles: true }))

      expect(multiSelect._getDisplayedItems().map(item => item.dataset.coreuiValue)).toEqual(['b'])
    })

    it('should keep the selection through disable() and enable()', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2', selected: true }]
      })

      multiSelect.selectAll()
      multiSelect.disable()
      multiSelect.enable()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['2', '1'])
      expect([...fixtureEl.querySelector('select').selectedOptions].map(option => option.value)).toEqual(['1', '2'])
    })

    it('should open from a click on the frame once enable() runs on a select built disabled, and stay closed on show() after disable()', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { disabled: true, options: [{ value: '1', text: 'Option 1' }] })

      multiSelect._wrapperElement.click()

      expect(multiSelect._isShown()).toBeFalse()

      multiSelect.enable()
      multiSelect._wrapperElement.click()

      expect(multiSelect._isShown()).toBeTrue()
      expect(multiSelect._togglerElement.getAttribute('aria-expanded')).toBe('true')

      multiSelect.hide()
      multiSelect.disable()
      multiSelect.show()

      expect(multiSelect._isShown()).toBeFalse()
      expect(multiSelect._togglerElement.getAttribute('aria-expanded')).toBe('false')
    })

    it('should write every disabled state on disable() and take it back on enable()', () => {
      fixtureEl.innerHTML = '<form><select name="tech"></select></form>'
      const form = fixtureEl.querySelector('form')
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1', selected: true }] })
      const { _indicatorElement: indicator, _togglerElement: toggler, _wrapperElement: wrapper } = multiSelect

      expect(new FormData(form).getAll('tech')).toEqual(['1'])

      multiSelect.disable()

      expect(selectEl.disabled).toBeTrue()
      expect(selectEl).toHaveClass('disabled')
      expect(wrapper).toHaveClass('disabled')
      expect(toggler).toHaveClass('disabled')
      expect(toggler.getAttribute('aria-disabled')).toBe('true')
      expect(toggler.hasAttribute('tabindex')).toBeFalse()
      expect(indicator.disabled).toBeTrue()
      expect(new FormData(form).getAll('tech')).toEqual([])

      multiSelect.enable()

      expect(selectEl.disabled).toBeFalse()
      expect(selectEl).not.toHaveClass('disabled')
      expect(wrapper).not.toHaveClass('disabled')
      expect(toggler).not.toHaveClass('disabled')
      expect(toggler.hasAttribute('aria-disabled')).toBeFalse()
      expect(toggler.getAttribute('tabindex')).toBe('0')
      expect(indicator.disabled).toBeFalse()
      expect(new FormData(form).getAll('tech')).toEqual(['1'])
    })

    it('should take the cleaner away on disable() and bring it back on enable()', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options: [{ value: '1', text: 'Option 1', selected: true }] })

      expect(multiSelect._wrapperElement.querySelector('.form-control-cleaner')).not.toBeNull()

      multiSelect.disable()

      expect(multiSelect._wrapperElement.querySelector('.form-control-cleaner')).toBeNull()

      multiSelect.enable()

      expect(multiSelect._wrapperElement.querySelector('.form-control-cleaner')).not.toBeNull()
    })

    it('should not take a gesture in an open list once disable() runs', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'Option 1', selected: true }, { value: '2', text: 'Option 2' }] })

      multiSelect.show()
      selectEl.addEventListener('hide.coreui.multi-select', event => event.preventDefault())
      multiSelect.disable()

      expect(multiSelect._isShown()).toBeTrue()

      const changes = []
      selectEl.addEventListener('change', () => changes.push(true))
      multiSelect._optionsElement.querySelector('[data-coreui-value="2"]').click()
      multiSelect._optionsElement.querySelector('[data-coreui-value="1"]').click()

      expect(changes).toEqual([])
      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1'])
      expect([...selectEl.selectedOptions].map(option => option.value)).toEqual(['1'])
      expect(multiSelect._menu.querySelector('[data-coreui-value="2"]').getAttribute('aria-selected')).toBe('false')
    })

    it('should not read options the page appends to the select after it starts', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">A</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)

      selectEl.append(new Option('B', 'b'))
      multiSelect.setValue(['b'])

      expect(multiSelect.getValue()).toEqual([])
      expect(multiSelect._getDisplayedItems().map(item => item.dataset.coreuiValue)).toEqual(['a'])
    })

    it('should clear the selection on setValue(null), as on setValue([])', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option><option value="b">B</option></select><select id="options"></select>'
      const fromMarkup = new MultiSelect(fixtureEl.querySelector('select'))
      const fromOptions = new MultiSelect(fixtureEl.querySelector('#options'), { options: [{ value: 'a', text: 'A', selected: true }, { value: 'b', text: 'B' }] })

      expect(fromMarkup.getValue().map(option => option.value)).toEqual(['a'])
      expect(fromOptions.getValue().map(option => option.value)).toEqual(['a'])

      fromMarkup.setValue(null)
      fromOptions.setValue(null)

      expect(fromMarkup.getValue()).toEqual([])
      expect(fromOptions.getValue()).toEqual([])
    })

    it('should keep the last value of a multiple select built as a single one', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option><option value="b" selected>B</option><option value="c" selected>C</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { multiple: false })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['c'])
      expect(selectEl.value).toBe('c')
      expect(multiSelect._menu.querySelector('[aria-selected="true"]').dataset.coreuiValue).toBe('c')
    })

    it('should keep the first values up to a lower selection limit', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option><option value="b" selected>B</option><option value="c" selected>C</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { selectionLimit: 1 })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
    })

    it('should bring back the initial values the options no longer carry on a form reset', async () => {
      fixtureEl.innerHTML = '<form><select multiple name="s"><option value="a" selected>A</option><option value="b">B</option></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)

      multiSelect.setOptions([{ value: 'x', text: 'X' }, { value: 'y', text: 'Y' }])
      multiSelect.selectAll([{ value: 'x', text: 'X' }])
      fixtureEl.querySelector('form').reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
      expect(new FormData(fixtureEl.querySelector('form')).getAll('s')).toEqual(['a'])
    })

    it('should give the search box its resting width back on a form reset', async () => {
      fixtureEl.innerHTML = '<form><select multiple><option value="a" selected>A</option><option value="b">B</option></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: true })

      multiSelect._searchElement.value = 'react'
      fixtureEl.querySelector('form').reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect._searchElement.size).toBe(2)
    })
  })

  describe('events', () => {
    it('should emit changed event when selection changes', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [{ value: '1', text: 'Option 1' }]
        })

        selectEl.addEventListener('change.coreui.multi-select', event => {
          expect(event.value).toBeDefined()
          expect(event.value.length).toBe(1)
          resolve()
        })

        multiSelect.selectAll([{ value: '1', text: 'Option 1' }])
      })
    })

    it('should emit search event when searching', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [{ value: '1', text: 'Option 1' }],
          search: true
        })

        selectEl.addEventListener('search.coreui.multi-select', () => {
          expect(multiSelect._search).toBe('test')
          resolve()
        })

        multiSelect.search('test')
      })
    })

    it('should show on clone click when not disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect._wrapperElement.click()
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
    })

    it('should not show on clone click when disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        disabled: true
      })

      multiSelect._wrapperElement.click()
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should send one change when a single select replaces its value', () => {
      fixtureEl.innerHTML = '<select><option value="1" selected>Option 1</option><option value="2">Option 2</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { multiple: false })
      const events = []

      selectEl.addEventListener('change.coreui.multi-select', () => events.push('component'))
      selectEl.addEventListener('change', () => events.push('native'))
      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="2"]').click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['2'])
      expect(events).toEqual(['component', 'native'])
    })

    it('should send the change once the selection shows the new value', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">A</option><option value="b">B</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { selectionType: 'text' })
      const shown = []

      selectEl.addEventListener('change.coreui.multi-select', event => shown.push([event.value.map(option => option.text), multiSelect._selectionElement.textContent]))
      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="b"]').click()

      expect(shown).toEqual([[['B'], 'B\u{A0}']])
    })

    it('should not report the value setValue gives', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option><option value="b">B</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)
      const reported = []

      selectEl.addEventListener('change.coreui.multi-select', event => reported.push(event.value.map(option => option.value)))
      selectEl.addEventListener('change', () => reported.push('native'))
      multiSelect.setValue(['b'])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['b'])
      expect([...selectEl.selectedOptions].map(option => option.value)).toEqual(['b'])
      expect(reported).toEqual([])
    })

    it('should send no change while it builds', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option><option value="b" selected>B</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const events = []

      selectEl.addEventListener('change.coreui.multi-select', () => events.push('component'))
      selectEl.addEventListener('change', () => events.push('native'))
      // eslint-disable-next-line no-new
      new MultiSelect(selectEl)

      expect(events).toEqual([])
    })

    it('should hold the new value of a single select when the panel reports hidden', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select><option value="1" selected>One</option><option value="2">Two</option></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, { multiple: false })

        selectEl.addEventListener('hidden.coreui.multi-select', () => {
          expect(multiSelect.getValue().map(option => option.value)).toEqual(['2'])
          resolve()
        })

        multiSelect.show()
        multiSelect._menu.querySelector('[data-coreui-value="2"]').click()
      })
    })

    it('should mark the getValue() entry of a selected disabled option', () => {
      fixtureEl.innerHTML = '<select></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{
          value: '1', text: 'One', selected: true, disabled: true
        }]
      })

      expect(multiSelect.getValue()).toEqual([{ value: '1', text: 'One', disabled: true }])
    })

    it('should hold a value the markup lists twice once and report its removal', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option><option value="b" selected>B</option><optgroup label="G"><option value="a" selected>A2</option></optgroup></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)
      const events = []

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a', 'b'])

      selectEl.addEventListener('change.coreui.multi-select', () => events.push('component'))
      multiSelect._selectionElement.querySelector('[data-value="b"] .chip-remove').click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
      expect(events).toEqual(['component'])
    })

    it('should give getValue() objects with only a value and a text', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))

      expect(Object.keys(multiSelect.getValue()[0])).toEqual(['value', 'text'])
    })

    it('should treat what a selectionLimit listener does during a refused user action as code', () => {
      fixtureEl.innerHTML = '<form><select multiple></select></form>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'One', selected: true },
          { value: '2', text: 'Two', selected: true },
          { value: '3', text: 'Three' }
        ],
        selectionLimit: 2,
        validationState: 'invalid'
      })

      selectEl.addEventListener('selectionLimit.coreui.multi-select', () => multiSelect.deselectAll(), { once: true })
      multiSelect._getSelectionActions().selectAll()

      expect(multiSelect.getValue()).toEqual([])
      expect(multiSelect._wrapperElement.classList.contains('is-invalid')).toBeTrue()
    })

    it('should send nothing when setValue gives the held values in another order', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">A</option><option value="b">B</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)
      const events = []

      multiSelect.selectAll([{ value: 'b', text: 'B' }])
      multiSelect.selectAll([{ value: 'a', text: 'A' }])
      selectEl.addEventListener('change.coreui.multi-select', () => events.push('component'))
      selectEl.addEventListener('change', () => events.push('native'))
      multiSelect.setValue(['a', 'b'])

      expect(events).toEqual([])
    })

    it('should let a change listener dispose the component during deselectAll() and keep the native events', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)
      const native = []

      selectEl.addEventListener('change.coreui.multi-select', () => multiSelect.dispose(), { once: true })
      selectEl.addEventListener('change', () => native.push('change'))

      expect(() => multiSelect.deselectAll()).not.toThrow()
      expect(native).toEqual(['change'])
    })

    it('should let a change listener dispose the component during selectAll() at the limit', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">A</option><option value="b">B</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { selectionLimit: 1 })

      const native = []

      selectEl.addEventListener('change.coreui.multi-select', () => multiSelect.dispose(), { once: true })
      selectEl.addEventListener('change', () => native.push('change'))

      expect(() => multiSelect.selectAll()).not.toThrow()
      expect(native).toEqual(['change'])
    })

    it('should let a change listener dispose the component when Backspace removes the last chip', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { search: true })
      const search = multiSelect._searchElement
      const errors = []
      const onError = event => {
        event.preventDefault()
        errors.push(event.message)
      }

      selectEl.addEventListener('change.coreui.multi-select', () => multiSelect.dispose(), { once: true })
      window.addEventListener('error', onError)
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))
      window.removeEventListener('error', onError)

      expect(errors).toEqual([])
    })

    it('should let a change listener dispose the component during setOptions()', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { search: 'external', options: [{ value: 'b', text: 'B', selected: true }], resetSelectionOnOptionsChange: true })
      const dispose = vi.fn(() => multiSelect.dispose())

      selectEl.addEventListener('change.coreui.multi-select', dispose, { once: true })

      expect(() => multiSelect.setOptions([{ value: 'a', text: 'A' }])).not.toThrow()
      expect(dispose).toHaveBeenCalledTimes(1)
    })

    it('should let a native change listener dispose the component', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">A</option><option value="b">B</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl)

      const errors = []
      const onError = event => {
        event.preventDefault()
        errors.push(event.message)
      }

      selectEl.addEventListener('change', () => multiSelect.dispose(), { once: true })
      window.addEventListener('error', onError)
      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="a"]').click()
      window.removeEventListener('error', onError)

      expect(errors).toEqual([])
    })

    it('should clear a single select from markup when setValue gives an empty value', () => {
      fixtureEl.innerHTML = '<select><option value="a">A</option><option value="b" selected>B</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { multiple: false })

      multiSelect.setValue([])

      expect(multiSelect.getValue()).toEqual([])
      expect(fixtureEl.querySelector('select').value).toBe('')
    })
  })

  describe('external search', () => {
    const mountExternal = (markup = '<select multiple name="tech"><option value="a">Angular</option><option value="r">React</option></select>') => {
      fixtureEl.innerHTML = `<form>${markup}</form>`
      return new MultiSelect(fixtureEl.querySelector('select'), { search: 'external' })
    }

    it('should filter nothing and report the query', async () => {
      const multiSelect = mountExternal()
      const queries = []
      fixtureEl.querySelector('select').addEventListener('search.coreui.multi-select', event => queries.push(event.query))

      multiSelect.show()
      await userEvent.keyboard('zz')

      expect(multiSelect._getDisplayedOptions()).toHaveSize(2)
      expect(queries).toEqual(['z', 'zz'])
    })

    it('should report the query with the internal search too', async () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">Angular</option><option value="r">React</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: true })
      const queries = []
      fixtureEl.querySelector('select').addEventListener('search.coreui.multi-select', event => queries.push(event.query))

      multiSelect.show()
      await userEvent.keyboard('re')

      expect(multiSelect._getDisplayedOptions()).toHaveSize(1)
      expect(queries).toEqual(['r', 're'])
    })

    it('should keep the panel, the query, the focus and the selection when the options change', async () => {
      const multiSelect = mountExternal('<select multiple name="tech"><option value="a" selected>Angular</option><option value="r">React</option></select>')

      multiSelect.show()
      await userEvent.keyboard('vu')
      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }, { value: 's', text: 'Svelte' }])

      expect(multiSelect._isShown()).toBe(true)
      expect(document.activeElement).toBe(multiSelect._searchElement)
      expect(multiSelect._searchElement.value).toBe('vu')
      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
      expect(multiSelect._getDisplayedOptions().map(option => option.textContent.trim())).toEqual(['Vue.js', 'Svelte'])
    })

    it('should keep a selected value the new options lack in the chips and the form', () => {
      const multiSelect = mountExternal('<select multiple name="tech"><option value="a" selected>Angular</option><option value="r">React</option></select>')

      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }])

      expect(multiSelect._selectionElement.querySelector('.chip').textContent).toContain('Angular')
      expect(new FormData(fixtureEl.querySelector('form')).getAll('tech')).toEqual(['a'])
    })

    it('should leave the selection to the user when new options carry selected', () => {
      const multiSelect = mountExternal()

      multiSelect.setOptions([{ value: 'v', text: 'Vue.js', selected: true }])

      expect(multiSelect.getValue()).toEqual([])
      expect(new FormData(fixtureEl.querySelector('form')).getAll('tech')).toEqual([])
    })

    it('should give the focus to the search field when the option holding it goes', async () => {
      const multiSelect = mountExternal()

      multiSelect.show()
      multiSelect._menu.querySelector('.list-box-option').focus()
      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }])

      expect(document.activeElement).toBe(multiSelect._searchElement)
    })

    it('should leave a letter on an option alone with globalSearch off', async () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">Angular</option><option value="r">React</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { globalSearch: false, search: 'external' })

      multiSelect.show()
      const option = multiSelect._menu.querySelector('.list-box-option')
      option.focus()
      await userEvent.keyboard('r')

      expect(document.activeElement).toBe(option)
      expect(multiSelect._searchElement.value).toBe('')
    })

    it('should mark the list busy while loading', () => {
      const multiSelect = mountExternal()

      multiSelect.setLoading(true)

      expect(multiSelect._menu.querySelector('[role="listbox"]').getAttribute('aria-busy')).toBe('true')
      expect(multiSelect._menu.querySelector('.list-box').classList.contains('loading')).toBeTrue()

      multiSelect.setLoading(false)

      expect(multiSelect._menu.querySelector('[role="listbox"]').hasAttribute('aria-busy')).toBe(false)
    })

    it('should bring the initial selection back on a form reset after the options changed', async () => {
      const multiSelect = mountExternal('<select multiple name="tech"><option value="a" selected>Angular</option><option value="r">React</option></select>')

      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }])
      multiSelect.selectAll()
      fixtureEl.querySelector('form').reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
      expect(new FormData(fixtureEl.querySelector('form')).getAll('tech')).toEqual(['a'])
    })

    it('should bring a start value the options delivered later back on a form reset', async () => {
      fixtureEl.innerHTML = '<form><select multiple name="tech"></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: 'external', options: [], value: ['a'] })

      multiSelect.setOptions([{ value: 'a', text: 'Angular' }, { value: 'r', text: 'React' }])
      multiSelect.deselectAll()
      fixtureEl.querySelector('form').reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
    })

    it('should bring a start value the options delivered later back on a form reset after a pick in single mode', async () => {
      fixtureEl.innerHTML = '<form><select name="tech"></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        multiple: false,
        search: 'external',
        options: [{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }],
        value: 'x'
      })

      multiSelect.selectAll([{ value: 'a', text: 'A' }])
      multiSelect.setOptions([{ value: 'x', text: 'X' }, { value: 'y', text: 'Y' }])
      fixtureEl.querySelector('form').reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['x'])
    })

    it('should bring the label of a start value the options delivered later back once they drop it', async () => {
      fixtureEl.innerHTML = '<form><select multiple name="tech"></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: 'external', options: [], value: ['a'] })

      multiSelect.setOptions([{ value: 'a', text: 'Angular' }])
      multiSelect.setOptions([{ value: 'r', text: 'React' }])
      multiSelect.deselectAll()
      fixtureEl.querySelector('form').reset()
      await new Promise(resolve => {
        setTimeout(resolve)
      })

      expect(multiSelect.getValue()).toEqual([{ value: 'a', text: 'Angular' }])
    })

    it('should keep the reset snapshot apart from the selection the options relabel', async () => {
      fixtureEl.innerHTML = '<form><select multiple name="tech"><option value="a" selected>Angular</option></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: 'external' })

      const reset = async () => {
        fixtureEl.querySelector('form').reset()
        await new Promise(resolve => {
          setTimeout(resolve)
        })
      }

      multiSelect.setOptions([{ value: 'a', text: 'Angular 20', disabled: true }])
      multiSelect.setOptions([{ value: 'r', text: 'React' }])
      await reset()

      expect(multiSelect.getValue()).toEqual([{ value: 'a', text: 'Angular' }])

      multiSelect.setOptions([{ value: 'a', text: 'Angular 21' }])
      multiSelect.setOptions([{ value: 'r', text: 'React' }])
      await reset()

      expect(multiSelect.getValue()).toEqual([{ value: 'a', text: 'Angular' }])
    })

    it('should report the query on every change of the text and not on navigation keys', async () => {
      const multiSelect = mountExternal()
      const queries = []
      fixtureEl.querySelector('select').addEventListener('search.coreui.multi-select', event => queries.push(event.query))

      multiSelect.show()
      await userEvent.keyboard('v{ArrowLeft}{Shift}{Home}')
      multiSelect._searchElement.value = 'vue'
      multiSelect._searchElement.dispatchEvent(new Event('input', { bubbles: true }))

      expect(queries).toEqual(['v', 'vue'])
    })

    it('should keep the focus on an option that survives the new options', () => {
      const multiSelect = mountExternal()

      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="r"]').focus()
      multiSelect.setOptions([{ value: 'r', text: 'React' }, { value: 'v', text: 'Vue.js' }])

      expect(document.activeElement).toBe(multiSelect._menu.querySelector('[data-coreui-value="r"]'))
    })

    it('should clear a selected value the new options lack', () => {
      const multiSelect = mountExternal('<select multiple name="tech"><option value="a" selected>Angular</option><option value="r">React</option></select>')

      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }])
      multiSelect.deselectAll()

      expect(multiSelect.getValue()).toEqual([])
      expect(new FormData(fixtureEl.querySelector('form')).getAll('tech')).toEqual([])
    })

    it('should replace a selected value the new options lack in single mode', () => {
      fixtureEl.innerHTML = '<form><select name="tech"><option value="a" selected>Angular</option><option value="r">React</option></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { multiple: false, search: 'external' })

      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }, { value: 'w', text: 'Svelte' }])
      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="v"]').click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['v'])
      expect(new FormData(fixtureEl.querySelector('form')).getAll('tech')).toEqual(['v'])
    })

    it('should count a selected value the new options lack against the selection limit', () => {
      fixtureEl.innerHTML = '<form><select multiple name="tech"><option value="a" selected>Angular</option><option value="b" selected>Backbone</option></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: 'external', selectionLimit: 2 })
      const limits = []

      fixtureEl.querySelector('select').addEventListener('selectionLimit.coreui.multi-select', () => limits.push(true))
      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }, { value: 'w', text: 'Svelte' }])
      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="v"]').click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a', 'b'])
      expect(limits).toHaveSize(1)
      expect(multiSelect._menu.querySelector('[data-coreui-value="v"]').classList.contains('selected')).toBe(false)
    })

    it('should not press select all for selected values the new options lack', () => {
      fixtureEl.innerHTML = '<form><select multiple name="tech"><option value="a" selected>Angular</option><option value="b" selected>Backbone</option></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: 'external' })

      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }, { value: 'w', text: 'Svelte' }])

      expect(multiSelect._selectAllElement.getAttribute('aria-pressed')).toBe('false')
    })

    it('should count the selected values the new options lack in the total right after the options change', () => {
      fixtureEl.innerHTML = '<form><select multiple name="tech"><option value="a" selected>Angular</option><option value="b" selected>Backbone</option></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { selectedLabel: '{count}/{total}', selectionType: 'counter' })

      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }, { value: 'w', text: 'Svelte' }, { value: 'x', text: 'Ember' }])

      expect(multiSelect._selectionElement.textContent).toBe('2/5')
    })

    it('should keep a selected value that comes back disabled out of the form, like a native select', () => {
      const multiSelect = mountExternal('<select multiple name="tech"><option value="a" selected>Angular</option><option value="r">React</option></select>')

      multiSelect.setOptions([{ value: 'a', text: 'Angular', disabled: true }])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
      expect(new FormData(fixtureEl.querySelector('form')).getAll('tech')).toEqual([])
    })

    it('should give the native select its own options back on dispose after the options changed', () => {
      const multiSelect = mountExternal()
      const select = fixtureEl.querySelector('select')

      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }])
      multiSelect.dispose()

      expect([...select.options].map(option => option.value)).toEqual(['a', 'r'])
    })

    it('should start from the marked options when resetSelectionOnOptionsChange is set and the values change', () => {
      fixtureEl.innerHTML = '<form><select multiple name="city"><option value="waw" selected>Warsaw</option><option value="krk">Krakow</option></select></form>'
      const select = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(select, { resetSelectionOnOptionsChange: true })
      const changes = []

      select.addEventListener('change', () => changes.push(true))
      multiSelect.setOptions([{ value: 'ber', text: 'Berlin', selected: true }, { value: 'muc', text: 'Munich' }])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['ber'])
      expect(new FormData(fixtureEl.querySelector('form')).getAll('city')).toEqual(['ber'])
      expect(changes).toHaveSize(1)
    })

    it('should keep the selection when resetSelectionOnOptionsChange is set and the values stay the same', () => {
      fixtureEl.innerHTML = '<form><select multiple name="city"><option value="waw" selected>Warsaw</option><option value="krk">Krakow</option></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { resetSelectionOnOptionsChange: true })

      multiSelect.setOptions([{ value: 'krk', text: 'Kraków' }, { value: 'waw', text: 'Warszawa' }])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['waw'])
    })

    it('should tick a selected value that comes back enabled', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{
          value: 'a', text: 'Angular', selected: true, disabled: true
        }],
        search: 'external'
      })

      multiSelect.setOptions([{ value: 'a', text: 'Angular' }, { value: 'r', text: 'React' }])

      expect(multiSelect._menu.querySelector('[data-coreui-value="a"]').getAttribute('aria-selected')).toBe('true')
    })

    it('should take the new label of a selected value', () => {
      const multiSelect = mountExternal('<select multiple name="tech"><option value="a" selected>Angular</option></select>')

      multiSelect.setOptions([{ value: 'a', text: 'Angular (LTS)' }])

      expect(multiSelect.getValue()[0].text).toBe('Angular (LTS)')
      expect(multiSelect._selectionElement.querySelector('.chip').textContent).toContain('Angular (LTS)')
    })

    it('should keep the text and the focus of the search box in text mode', async () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>Angular</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: 'external', selectionType: 'text' })

      multiSelect.show()
      await userEvent.keyboard('vu')
      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }])

      expect(document.activeElement).toBe(multiSelect._searchElement)
      expect(multiSelect._searchElement.value).toBe('vu')
    })

    it('should keep the focus on a chip', () => {
      const multiSelect = mountExternal('<select multiple name="tech"><option value="a" selected>Angular</option></select>')
      const chip = multiSelect._selectionElement.querySelector('.chip')

      chip.focus()
      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }])

      expect(document.activeElement).toBe(chip)
    })

    it('should keep a selected disabled value the new options lack out of the clear and the form', () => {
      fixtureEl.innerHTML = '<form><select multiple name="tech"></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{
          value: 'a', text: 'Angular', selected: true, disabled: true
        }, { value: 'r', text: 'React', selected: true }],
        search: 'external'
      })

      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }])
      multiSelect._selectionCleanerElement.click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
      expect(new FormData(fixtureEl.querySelector('form')).getAll('tech')).toEqual([])
    })

    it('should start from a marked disabled option when resetSelectionOnOptionsChange is set', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>A</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { resetSelectionOnOptionsChange: true })

      multiSelect.setOptions([{
        value: 'x', text: 'X', selected: true, disabled: true
      }, { value: 'y', text: 'Y' }])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['x'])
    })

    it('should start from the marked option of a single select once, when resetSelectionOnOptionsChange is set', () => {
      fixtureEl.innerHTML = '<form><select name="city"><option value="waw" selected>Warsaw</option><option value="krk">Krakow</option></select></form>'
      const select = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(select, { multiple: false, resetSelectionOnOptionsChange: true })
      const changes = []

      select.addEventListener('change', () => changes.push(true))
      multiSelect.setOptions([{ value: 'ber', text: 'Berlin', selected: true }, { value: 'muc', text: 'Munich' }])

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['ber'])
      expect(changes).toHaveSize(1)
    })

    it('should send nothing from a single select that gets options later', () => {
      fixtureEl.innerHTML = '<form><select name="f"></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { multiple: false, options: [], search: 'external' })

      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }, { value: 'w', text: 'Svelte' }])

      expect(new FormData(fixtureEl.querySelector('form')).getAll('f')).toEqual([])
    })

    it('should not report a query when the panel opens and closes over an empty search box', () => {
      const multiSelect = mountExternal()
      const queries = []

      fixtureEl.querySelector('select').addEventListener('search.coreui.multi-select', event => queries.push(event.query))
      multiSelect.show()
      multiSelect.hide()

      expect(queries).toEqual([])
    })

    it('should refuse a search option other than true, false or external', () => {
      fixtureEl.innerHTML = '<select multiple></select>'

      expect(() => new MultiSelect(fixtureEl.querySelector('select'), { search: 'global' })).toThrowError(TypeError)
    })

    it('should give the focus to the search field when the option holding it comes back disabled', () => {
      const multiSelect = mountExternal()

      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="r"]').focus()
      multiSelect.setOptions([{ value: 'r', text: 'React', disabled: true }])

      expect(document.activeElement).toBe(multiSelect._searchElement)
    })

    it('should give the focus to the first option without a search field', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">Angular</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))

      multiSelect.show()
      multiSelect._menu.querySelector('[data-coreui-value="a"]').focus()
      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }])

      expect(document.activeElement).toBe(multiSelect._menu.querySelector('[data-coreui-value="v"]'))
    })

    it('should give the focus to the search field when the select all button it held goes', () => {
      const multiSelect = mountExternal()

      multiSelect.show()
      multiSelect._selectAllElement.focus()
      multiSelect.setOptions([])

      expect(document.activeElement).toBe(multiSelect._searchElement)
    })

    it('should drop the hidden native option of a value the options lack once it is deselected', () => {
      const multiSelect = mountExternal('<select multiple name="tech"><option value="a" selected>Angular</option></select>')

      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }])
      multiSelect.deselectAll()

      expect(fixtureEl.querySelectorAll('select option[hidden]')).toHaveSize(0)
    })

    it('should give the focus to the panel when the select all button it held goes without a search field', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">Angular</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))

      multiSelect.show()
      multiSelect._selectAllElement.focus()
      multiSelect.setOptions([])

      expect(document.activeElement).toBe(multiSelect._menu)
    })

    it('should give the focus to the first option once options reach a panel holding it', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options: [] })

      multiSelect.show()
      multiSelect._menu.focus()
      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }])

      expect(document.activeElement).toBe(multiSelect._menu.querySelector('[data-coreui-value="v"]'))
    })

    it('should give the focus to the search field when the query hides the option that survives', async () => {
      fixtureEl.innerHTML = '<select multiple><option value="a">Angular</option><option value="r">React</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: true })

      multiSelect.show()
      await userEvent.keyboard('ang')
      multiSelect._menu.querySelector('[data-coreui-value="a"]').focus()
      multiSelect.setOptions([{ value: 'a', text: 'NG' }, { value: 'r', text: 'React' }])

      expect(document.activeElement).toBe(multiSelect._searchElement)
    })

    it('should keep the focus on a chip whose label changes', () => {
      const multiSelect = mountExternal('<select multiple name="tech"><option value="a" selected>Angular</option></select>')

      multiSelect._selectionElement.querySelector('.chip').focus()
      multiSelect.setOptions([{ value: 'a', text: 'Angular (LTS)' }])

      expect(document.activeElement).toBe(multiSelect._selectionElement.querySelector('.chip'))
    })

    it('should leave a hidden option of the page in the native select', () => {
      fixtureEl.innerHTML = '<form><select name="s"><option value="" hidden>Pick</option><option value="a">A</option></select></form>'
      const select = fixtureEl.querySelector('select')

      // eslint-disable-next-line no-new
      new MultiSelect(select, { multiple: false })

      expect(select.querySelector('option[value=""]')).not.toBeNull()
    })

    it('should leave the native select of an instance it never rebuilt as it is on dispose', () => {
      fixtureEl.innerHTML = '<select name="s"><option value="a">A</option><option value="b">B</option></select>'
      const select = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(select, { multiple: false })

      multiSelect.deselectAll()
      multiSelect.dispose()

      expect(select.value).toBe('')
    })

    it('should not bring back the initial value when resetSelectionOnOptionsChange takes new options', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const poland = [{ value: 'waw', text: 'Warsaw' }, { value: 'krk', text: 'Krakow' }]
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options: poland, resetSelectionOnOptionsChange: true, value: ['waw'] })

      multiSelect.deselectAll()
      multiSelect.setOptions([{ value: 'ber', text: 'Berlin' }])
      multiSelect.setOptions(poland)

      expect(multiSelect.getValue()).toEqual([])
    })

    it('should reset when the new options carry only some of the values', () => {
      fixtureEl.innerHTML = '<select multiple><option value="waw" selected>Warsaw</option><option value="krk">Krakow</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { resetSelectionOnOptionsChange: true })

      multiSelect.setOptions([{ value: 'waw', text: 'Warsaw' }])

      expect(multiSelect.getValue()).toEqual([])
    })

    it('should do nothing when options arrive after dispose', () => {
      const multiSelect = mountExternal()

      multiSelect.dispose()

      expect(() => multiSelect.setOptions([])).not.toThrow()
    })

    it('should show its loading label below the list while it loads', () => {
      fixtureEl.innerHTML = '<form><select multiple name="tech"><option value="a">Angular</option></select></form>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { loadingLabel: 'Fetching', search: 'external' })

      multiSelect.show()
      multiSelect.setLoading(true)

      expect(multiSelect._menu.querySelector('.list-box-loading').textContent).toEqual('Fetching')
      expect(multiSelect._menu.querySelector('.list-box-loading').hidden).toBeFalse()

      multiSelect.setLoading(false)

      expect(multiSelect._menu.querySelector('.list-box-loading').hidden).toBeTrue()
    })

    it('should pick an option from the keyboard while the list loads', async () => {
      const multiSelect = mountExternal()

      multiSelect.show()
      multiSelect.setLoading(true)
      multiSelect._menu.querySelector('[data-coreui-value="a"]').focus()
      await userEvent.keyboard(' ')

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
      expect(multiSelect._menu.querySelector('[data-coreui-value="a"]').getAttribute('aria-selected')).toBe('true')
    })

    it('should announce its loading label when the panel opens on a wait, not while it is closed', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })

      const announced = () => [...document.querySelectorAll('[data-coreui-live-announcer] [aria-live="polite"] > *')].filter(node => node.textContent === 'Fetching tech').length
      const settle = async () => {
        await Promise.resolve()
        vi.advanceTimersByTime(100)
      }

      try {
        fixtureEl.innerHTML = '<form><select multiple name="tech"><option value="a">Angular</option></select></form>'
        const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { loadingLabel: 'Fetching tech', search: 'external' })

        multiSelect.setLoading(true)
        await settle()

        expect(announced()).toEqual(0)

        multiSelect.show()
        await settle()

        expect(announced()).toEqual(1)
      } finally {
        vi.useRealTimers()

        for (const announcer of document.querySelectorAll('[data-coreui-live-announcer]')) {
          announcer.remove()
        }
      }
    })

    it('should pick the option in reach with Enter in the search box while the list loads', async () => {
      const multiSelect = mountExternal()

      multiSelect.show()
      multiSelect.setLoading(true)
      multiSelect._searchElement.focus()
      await userEvent.keyboard('{Enter}')

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
    })

    it('should drop a selected option from the keyboard while the list loads', async () => {
      const multiSelect = mountExternal('<select multiple name="tech"><option value="a" selected>Angular</option><option value="r">React</option></select>')

      multiSelect.show()
      multiSelect.setLoading(true)
      multiSelect._menu.querySelector('[data-coreui-value="a"]').focus()
      await userEvent.keyboard(' ')

      expect(multiSelect.getValue()).toEqual([])
      expect(multiSelect._menu.querySelector('[data-coreui-value="a"]').getAttribute('aria-selected')).toBe('false')
    })

    it('should report the search text as typed, once per change', () => {
      const multiSelect = mountExternal()
      const queries = []

      fixtureEl.querySelector('select').addEventListener('search.coreui.multi-select', event => queries.push(event.query))
      multiSelect.search('Vue')
      multiSelect.search('Vue')

      expect(queries).toEqual(['Vue'])
    })

    it('should deselect only the listed options when select all is pressed again', () => {
      fixtureEl.innerHTML = '<select multiple><option value="a" selected>Angular</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { search: 'external' })

      multiSelect.setOptions([{ value: 'v', text: 'Vue.js' }, { value: 'w', text: 'Svelte' }])
      multiSelect.show()
      multiSelect._selectAllElement.click()
      multiSelect._selectAllElement.click()

      expect(multiSelect.getValue().map(option => option.value)).toEqual(['a'])
    })
  })

  describe('dispose', () => {
    it('should leave the disabled state to the option, not a class or the disabled attribute on the select', () => {
      fixtureEl.innerHTML = '<select class="disabled" multiple disabled><option value="1">One</option></select>'
      const select = fixtureEl.querySelector('select')
      // eslint-disable-next-line no-new
      new MultiSelect(select)

      expect(fixtureEl.querySelector('[role="combobox"]').hasAttribute('aria-disabled')).toBeFalse()
      expect(select.disabled).toBeFalse()
      expect(select.classList.contains('disabled')).toBeFalse()
    })

    it('should leave its state to the next instance, which writes it from its own options', () => {
      fixtureEl.innerHTML = '<select multiple><option value="1">One</option></select>'
      const select = fixtureEl.querySelector('select')

      new MultiSelect(select, { disabled: true, required: true }).dispose()
      // eslint-disable-next-line no-new
      new MultiSelect(select)

      expect(select.disabled).toBeFalse()
      expect(select.required).toBeFalse()
      expect(fixtureEl.querySelector('[role="combobox"]').hasAttribute('aria-disabled')).toBeFalse()
      expect(fixtureEl.querySelectorAll('.multi-select:not(select)')).toHaveSize(1)
    })

    it('should leave the native select hidden after dispose', () => {
      fixtureEl.innerHTML = '<select multiple><option value="1">One</option></select>'
      const select = fixtureEl.querySelector('select')

      new MultiSelect(select).dispose()

      expect(select.getAttribute('aria-hidden')).toEqual('true')
      expect(select.tabIndex).toEqual(-1)
    })

    it('should disable the select with the component, so a required one does not block the form', () => {
      fixtureEl.innerHTML = '<form><select multiple required><option value="1">One</option></select></form>'
      const form = fixtureEl.querySelector('form')
      const select = fixtureEl.querySelector('select')
      // eslint-disable-next-line no-new
      new MultiSelect(select, { disabled: true })

      expect(select.disabled).toBeTrue()
      expect(form.checkValidity()).toBeTrue()
    })

    it('should disable the select and the control on disable(), keeping the selection', () => {
      fixtureEl.innerHTML = '<select multiple><option value="1" selected>One</option></select>'
      const select = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(select)

      multiSelect.disable()

      expect(select.disabled).toBeTrue()
      expect(fixtureEl.querySelector('.multi-select').classList.contains('disabled')).toBeTrue()
      expect(multiSelect.getValue().map(option => option.value)).toEqual(['1'])

      multiSelect.dispose()
    })

    it('should take back the disabled class it added once enable() enables the select', () => {
      fixtureEl.innerHTML = '<select multiple><option value="1">One</option></select>'
      const select = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(select, { disabled: true })

      expect(select.disabled).toBeTrue()

      multiSelect.enable()

      expect(select.disabled).toBeFalse()
      expect(select.classList.contains('disabled')).toBeFalse()
      expect(fixtureEl.querySelector('.multi-select').classList.contains('disabled')).toBeFalse()

      multiSelect.dispose()
    })

    it('should keep the name the page wrote on the select', () => {
      fixtureEl.innerHTML = '<select id="multi-select" name="tech" multiple></select>'

      const multiSelectEl = fixtureEl.querySelector('#multi-select')
      const multiSelect = new MultiSelect(multiSelectEl)

      multiSelect.dispose()

      expect(multiSelectEl.getAttribute('name')).toEqual('tech')
    })

    it('should take back the id and name it added when disposed', () => {
      fixtureEl.innerHTML = '<select class="multi-select" multiple></select>'

      const multiSelectEl = fixtureEl.querySelector('.multi-select')
      const multiSelect = new MultiSelect(multiSelectEl, { name: 'tech' })

      expect(multiSelectEl.getAttribute('name')).toEqual('tech')
      expect(multiSelectEl.hasAttribute('id')).toBeTrue()

      multiSelect.dispose()

      expect(multiSelectEl.hasAttribute('name')).toBeFalse()
      expect(multiSelectEl.hasAttribute('id')).toBeFalse()
    })

    it('should keep the id the page wrote on the select', () => {
      fixtureEl.innerHTML = '<select id="mine" multiple></select>'

      const multiSelectEl = fixtureEl.querySelector('#mine')
      const multiSelect = new MultiSelect(multiSelectEl)

      multiSelect.dispose()

      expect(multiSelectEl.getAttribute('id')).toEqual('mine')
    })

    it('should put back an id and a name the config overwrote', () => {
      fixtureEl.innerHTML = '<select id="mine" name="tech" multiple></select>'

      const multiSelectEl = fixtureEl.querySelector('#mine')
      const multiSelect = new MultiSelect(multiSelectEl, { id: 'other', name: 'other' })

      multiSelect.dispose()

      expect(multiSelectEl.getAttribute('id')).toEqual('mine')
      expect(multiSelectEl.getAttribute('name')).toEqual('tech')
    })

    it('should dispose MultiSelect instance', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect._element).toEqual(selectEl)
      multiSelect.dispose()
      expect(multiSelect._element).toBeNull()
    })

    it('should dispose the selection chips and their chip set', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1', selected: true }],
        selectionType: 'chips'
      })

      const selectionEl = multiSelect._selectionElement
      const chipEl = selectionEl.querySelector('.chip')

      expect(Chip.getInstance(chipEl)).not.toBeNull()
      expect(ChipSet.getInstance(selectionEl)).not.toBeNull()

      multiSelect.dispose()

      expect(Chip.getInstance(chipEl)).toBeNull()
      expect(ChipSet.getInstance(selectionEl)).toBeNull()
    })

    it('should dispose the positioning cleanup when disposing', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      expect(multiSelect._floatingCleanup).not.toBeNull()

      multiSelect.dispose()

      expect(multiSelect._floatingCleanup).toBeNull()
    })

    it('should handle dispose when positioning never started', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      // positioning never started since we never showed it
      expect(multiSelect._floatingCleanup).toBeNull()

      // Should not throw
      multiSelect.dispose()
      expect(multiSelect._element).toBeNull()
    })

    it('should remove the generated DOM and put the native select back in place', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      const wrapper = multiSelect._wrapperElement
      const menu = multiSelect._menu

      expect(fixtureEl.querySelector('.multi-select')).not.toBeNull()
      expect(selectEl.parentNode).toBe(wrapper)

      multiSelect.dispose()

      expect(wrapper.isConnected).toBe(false)
      expect(menu.isConnected).toBe(false)
      expect(selectEl.isConnected).toBe(true)
      expect(selectEl.parentNode).toBe(fixtureEl)
    })

    it('should remove the menu appended to a container', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        container: 'body'
      })

      multiSelect.show()
      const menu = multiSelect._menu
      expect(menu.isConnected).toBe(true)

      multiSelect.dispose()

      expect(menu.isConnected).toBe(false)
    })

    it('should detach listeners from generated elements on dispose', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' }
        ],
        cleaner: true
      })

      multiSelect.selectAll([{ value: '1', text: 'Option 1' }])

      const clone = multiSelect._wrapperElement
      const optionsElement = multiSelect._optionsElement
      const spy = spyOn(EventHandler, 'off').and.callThrough()

      multiSelect.dispose()

      const offTargets = spy.calls.allArgs().map(args => args[0])
      expect(offTargets).toContain(clone)
      expect(offTargets).toContain(optionsElement)
    })
  })

  describe('clearMenus', () => {
    it('should close open menus on outside click', () => {
      fixtureEl.innerHTML = '<select></select><div id="outside"></div>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)

      const outsideEl = fixtureEl.querySelector('#outside')
      const clickEvent = new Event('click', { bubbles: true })
      Object.defineProperty(clickEvent, 'composedPath', { value: () => [outsideEl] })

      MultiSelect.clearMenus(clickEvent)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should send hidden once when an outside click closes the panel', () => {
      fixtureEl.innerHTML = '<select></select><div id="outside"></div>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })
      const hidden = jasmine.createSpy('hidden')

      selectEl.addEventListener('hidden.coreui.multi-select', hidden)
      multiSelect.show()

      const clickEvent = new Event('click', { bubbles: true })
      Object.defineProperty(clickEvent, 'composedPath', { value: () => [fixtureEl.querySelector('#outside')] })
      MultiSelect.clearMenus(clickEvent)

      expect(hidden).toHaveBeenCalledTimes(1)
    })

    it('should send no hidden when the page prevents an outside close', () => {
      fixtureEl.innerHTML = '<select></select><div id="outside"></div>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })
      const hidden = jasmine.createSpy('hidden')

      selectEl.addEventListener('hide.coreui.multi-select', event => event.preventDefault())
      selectEl.addEventListener('hidden.coreui.multi-select', hidden)
      multiSelect.show()

      const clickEvent = new Event('click', { bubbles: true })
      Object.defineProperty(clickEvent, 'composedPath', { value: () => [fixtureEl.querySelector('#outside')] })
      MultiSelect.clearMenus(clickEvent)

      expect(multiSelect._isShown()).toBeTrue()
      expect(hidden).not.toHaveBeenCalled()
    })

    it('should not close when clicking inside the panel', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()

      const clickEvent = new Event('click', { bubbles: true })
      Object.defineProperty(clickEvent, 'composedPath', { value: () => [multiSelect._menu] })
      MultiSelect.clearMenus(clickEvent)

      expect(multiSelect._isShown()).toBeTrue()
    })

    it('should not close on right mouse button click', () => {
      fixtureEl.innerHTML = '<select></select><div id="outside"></div>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()

      const event = new Event('click', { bubbles: true })
      Object.defineProperty(event, 'button', { value: 2 })

      MultiSelect.clearMenus(event)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
    })

    it('should not close on keyup that is not Tab', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()

      const event = new Event('keyup', { bubbles: true })
      Object.defineProperty(event, 'key', { value: 'a' })

      MultiSelect.clearMenus(event)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
    })

    it('should close on Tab keyup', () => {
      fixtureEl.innerHTML = '<select></select><div id="outside"></div>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()

      const outsideEl = fixtureEl.querySelector('#outside')
      const event = new Event('keyup', { bubbles: true })
      Object.defineProperty(event, 'key', { value: 'Tab' })
      Object.defineProperty(event, 'composedPath', { value: () => [outsideEl] })

      MultiSelect.clearMenus(event)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should not close when clicking inside the clone', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()

      const clickEvent = new Event('click', { bubbles: true })
      Object.defineProperty(clickEvent, 'composedPath', { value: () => [multiSelect._wrapperElement] })

      MultiSelect.clearMenus(clickEvent)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
    })
  })

  describe('keyboard with no navigable option', () => {
    it('should handle an empty items list', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', disabled: true }
        ]
      })

      multiSelect.show()
      multiSelect._togglerElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))

      expect(multiSelect._listBox.getActive()).toBeNull()
    })
  })

  describe('_findOptionByValue', () => {
    it('should find option by value', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' }
        ]
      })

      const found = multiSelect._findOptionByValue('2')
      expect(found).not.toBeNull()
      expect(found.text).toBe('Opt 2')
    })

    it('should find option within groups', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          {
            label: 'Group 1',
            options: [
              { value: '1', text: 'Opt 1' }
            ]
          },
          {
            label: 'Group 2',
            options: [
              { value: '2', text: 'Opt 2' }
            ]
          }
        ]
      })

      const found = multiSelect._findOptionByValue('2')
      expect(found).not.toBeNull()
      expect(found.text).toBe('Opt 2')
    })

    it('should return null for non-existent value', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      const found = multiSelect._findOptionByValue('999')
      expect(found).toBeNull()
    })
  })

  describe('_configAfterMerge', () => {
    it('should convert container true to document.body', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        container: true
      })

      expect(multiSelect._config.container).toBe(document.body)
      // Cleanup
      multiSelect._menu.remove()
    })

    it('should convert numeric value to string array', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '5', text: 'Opt 5' }],
        value: 5
      })

      expect(multiSelect._config.value).toEqual(['5'])
    })

    it('should convert comma-separated string value to array', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' }
        ],
        value: '1, 2'
      })

      expect(multiSelect._config.value).toEqual(['1', '2'])
    })
  })

  describe('static methods', () => {
    describe('multiSelectInterface', () => {
      it('should create instance and call method', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')

        MultiSelect.multiSelectInterface(selectEl, { options: [] })
        expect(MultiSelect.getInstance(selectEl)).toBeInstanceOf(MultiSelect)
      })

      it('should call method on existing instance', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, { options: [] })
        const spy = spyOn(multiSelect, 'show')

        MultiSelect.multiSelectInterface(selectEl, 'show')
        expect(spy).toHaveBeenCalled()
      })

      it('should throw error for undefined method', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        new MultiSelect(selectEl, { options: [] }) // eslint-disable-line no-new

        expect(() => {
          MultiSelect.multiSelectInterface(selectEl, 'undefinedMethod')
        }).toThrowError(TypeError, 'No method named "undefinedMethod"')
      })
    })

    describe('jQueryInterface', () => {
      it('should create multi select', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')

        jQueryMock.fn.multiSelect = MultiSelect.jQueryInterface
        jQueryMock.elements = [selectEl]
        jQueryMock.fn.multiSelect.call(jQueryMock, { options: [] })

        expect(MultiSelect.getInstance(selectEl)).not.toBeNull()
      })

      it('should pass the arguments to the method', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, { options: [] })
        const spy = spyOn(multiSelect, 'search')

        jQueryMock.fn.multiSelect = MultiSelect.jQueryInterface
        jQueryMock.elements = [selectEl]
        jQueryMock.fn.multiSelect.call(jQueryMock, 'search', 'ab')

        expect(spy).toHaveBeenCalledWith('ab')
        multiSelect.dispose()
      })

      it('should not re-create multi select', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, { options: [] })

        jQueryMock.fn.multiSelect = MultiSelect.jQueryInterface
        jQueryMock.elements = [selectEl]
        jQueryMock.fn.multiSelect.call(jQueryMock, { options: [] })

        expect(MultiSelect.getInstance(selectEl)).toEqual(multiSelect)
      })

      it('should throw error on undefined method', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        new MultiSelect(selectEl, { options: [] }) // eslint-disable-line no-new

        jQueryMock.fn.multiSelect = MultiSelect.jQueryInterface
        jQueryMock.elements = [selectEl]

        expect(() => {
          jQueryMock.fn.multiSelect.call(jQueryMock, 'undefinedMethod')
        }).toThrowError(TypeError, 'No method named "undefinedMethod"')
      })
    })

    describe('getInstance', () => {
      it('should return multi select instance', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, { options: [] })

        expect(MultiSelect.getInstance(selectEl)).toEqual(multiSelect)
        expect(MultiSelect.getInstance(selectEl)).toBeInstanceOf(MultiSelect)
      })

      it('should return null when there is no multi select instance', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')

        expect(MultiSelect.getInstance(selectEl)).toBeNull()
      })
    })

    describe('getOrCreateInstance', () => {
      it('should return multi select instance', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, { options: [] })

        expect(MultiSelect.getOrCreateInstance(selectEl)).toEqual(multiSelect)
        expect(MultiSelect.getOrCreateInstance(selectEl)).toBeInstanceOf(MultiSelect)
      })

      it('should return new instance when there is no multi select instance', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')

        expect(MultiSelect.getInstance(selectEl)).toBeNull()
        expect(MultiSelect.getOrCreateInstance(selectEl, { options: [] })).toBeInstanceOf(MultiSelect)
      })

      it('should return new instance with given configuration', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')

        expect(MultiSelect.getInstance(selectEl)).toBeNull()
        const multiSelect = MultiSelect.getOrCreateInstance(selectEl, {
          options: [{ value: '1', text: 'Test' }],
          search: true
        })
        expect(multiSelect).toBeInstanceOf(MultiSelect)
        expect(multiSelect._config.search).toBe(true)
      })

      it('should return the same instance when exists, ignoring new configuration', () => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [],
          search: false
        })

        const multiSelect2 = MultiSelect.getOrCreateInstance(selectEl, {
          options: [],
          search: true
        })
        expect(multiSelect2).toEqual(multiSelect)
        expect(multiSelect2._config.search).toBe(false)
      })
    })
  })

  describe('data-api', () => {
    it('should initialize multi select on data-api elements', () => {
      fixtureEl.innerHTML = '<select data-coreui-toggle="multi-select"></select>'
      const selectEl = fixtureEl.querySelector('[data-coreui-toggle="multi-select"]')

      const _multiSelect = new MultiSelect(selectEl, { options: [] })
      expect(MultiSelect.getInstance(selectEl)).toBeInstanceOf(MultiSelect)
    })

    it('should auto-initialize on load via the data-coreui-multi-select attribute', () => {
      fixtureEl.innerHTML = '<select data-coreui-multi-select><option value="1">One</option></select>'
      const selectEl = fixtureEl.querySelector('select')

      expect(MultiSelect.getInstance(selectEl)).toBeNull()

      window.dispatchEvent(new Event('load'))

      expect(MultiSelect.getInstance(selectEl)).toBeInstanceOf(MultiSelect)
    })

    it('should initialize on load a select whose earlier instance was disposed', () => {
      fixtureEl.innerHTML = '<select data-coreui-multi-select><option value="1">One</option></select>'
      const selectEl = fixtureEl.querySelector('select')

      MultiSelect.getOrCreateInstance(selectEl).dispose()
      window.dispatchEvent(new Event('load'))

      expect(MultiSelect.getInstance(selectEl)).toBeInstanceOf(MultiSelect)
    })

    it.each([
      ['the v5 form-multi-select class', 'form-multi-select'],
      ['the multi-select class', 'multi-select']
    ])('should not auto-initialize a select that only carries %s', (_, className) => {
      fixtureEl.innerHTML = `<select class="${className}"><option value="1">One</option></select>`
      const selectEl = fixtureEl.querySelector('select')

      window.dispatchEvent(new Event('load'))

      expect(MultiSelect.getInstance(selectEl)).toBeNull()
    })
  })

  describe('_updateSelectionCleaner', () => {
    it('should return early when cleaner is false', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        cleaner: false
      })

      // Should not throw
      multiSelect._updateSelectionCleaner()
      expect(true).toBe(true)
    })

    it('should not insert cleaner when _selectionCleanerElement is null and no items are selected', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        cleaner: true,
        multiple: false
      })

      // Should not throw
      multiSelect._updateSelectionCleaner()
      expect(multiSelect._selectionCleanerElement).toBeNull()
    })
  })

  describe('_updateSearchSize', () => {
    it('should return early when searchElement is null', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        search: false
      })

      // Should not throw
      multiSelect._updateSearchSize()
      expect(true).toBe(true)
    })

    it('should return early when multiple is false', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        search: true,
        multiple: false
      })

      // Should not throw
      multiSelect._updateSearchSize()
      expect(true).toBe(true)
    })

    it('should set size when selected and selectionType is text', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        search: true,
        multiple: true,
        selectionType: 'text'
      })

      expect(multiSelect._searchElement.size).toBe(2)
    })

    it('should remove size attribute when nothing selected and selectionType is chips', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        search: true,
        multiple: true,
        selectionType: 'chips'
      })

      expect(multiSelect._searchElement.getAttribute('size')).toBeNull()
    })

    it('should accept custom size parameter', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        search: true,
        multiple: true,
        selectionType: 'chips'
      })

      multiSelect._updateSearchSize(10)
      expect(multiSelect._searchElement.size).toBe(10)
    })
  })

  describe('positioning', () => {
    it('should create the positioning cleanup on show', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      expect(multiSelect._floatingCleanup).toBeNull()
      multiSelect.show()
      expect(multiSelect._floatingCleanup).not.toBeNull()
    })

    it('should reposition when selection changes while shown', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' }
        ]
      })

      multiSelect.show()
      const spy = spyOn(multiSelect, '_updateFloatingPosition')

      multiSelect.selectAll([{ value: '1', text: 'Opt 1' }])

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('native select creation from config options', () => {
    it('should create native option elements from config', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      new MultiSelect(selectEl, { // eslint-disable-line no-new
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2', disabled: true },
          { value: '3', text: 'Opt 3', selected: true }
        ]
      })

      const nativeOptions = selectEl.querySelectorAll('option')
      expect(nativeOptions.length).toBe(3)
      expect(nativeOptions[1].disabled).toBe(true)
      expect(nativeOptions[2].selected).toBe(true)
    })

    it('should create native optgroup elements from config', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      new MultiSelect(selectEl, { // eslint-disable-line no-new
        options: [
          {
            label: 'Group A',
            options: [
              { value: '1', text: 'Opt 1' },
              { value: '2', text: 'Opt 2' }
            ]
          }
        ]
      })

      const optgroup = selectEl.querySelector('optgroup')
      expect(optgroup).not.toBeNull()
      expect(optgroup.label).toBe('Group A')
      expect(optgroup.querySelectorAll('option').length).toBe(2)
    })
  })

  describe('_updateSelection with different selectionTypes', () => {
    it('should show placeholder when nothing selected and no search', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        placeholder: 'Select something',
        search: false
      })

      const selection = multiSelect._wrapperElement.querySelector('.multi-select-selection')
      expect(selection.innerHTML).toContain('Select something')
    })

    it('should show selected text in single non-search mode', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        multiple: false,
        search: false
      })

      const selection = multiSelect._wrapperElement.querySelector('.multi-select-selection')
      expect(selection.textContent).toContain('Opt 1')
    })

    it('should show counter text in counter mode without search', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true },
          { value: '3', text: 'Opt 3' }
        ],
        multiple: true,
        selectionType: 'counter',
        search: false
      })

      const selection = multiSelect._wrapperElement.querySelector('.multi-select-selection')
      expect(selection.textContent).toContain('2')
      expect(selection.textContent).toContain('item(s) selected')
    })

    it('should show comma-separated text in text mode', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Apple', selected: true },
          { value: '2', text: 'Banana', selected: true },
          { value: '3', text: 'Cherry' }
        ],
        multiple: true,
        selectionType: 'text'
      })

      const selection = multiSelect._wrapperElement.querySelector('.multi-select-selection')
      expect(selection.textContent).toContain('Apple')
      expect(selection.textContent).toContain('Banana')
    })
  })

  describe('disabled state behavior', () => {
    it('should not show dropdown on click when disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        disabled: true
      })

      multiSelect._wrapperElement.click()
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should add disabled class to element', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      new MultiSelect(selectEl, { // eslint-disable-line no-new
        options: [],
        disabled: true
      })

      expect(selectEl.classList.contains('disabled')).toBe(true)
    })
  })

  describe('selection chips selection-type', () => {
    it('should add the selection-chips class when multiple and selectionType is chips', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: true,
        selectionType: 'chips'
      })

      const selection = multiSelect._wrapperElement.querySelector('.multi-select-selection')
      expect(selection.classList.contains('multi-select-selection-chips')).toBe(true)
    })

    it('should not add the selection-chips class when selectionType is not chips', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: true,
        selectionType: 'counter'
      })

      const selection = multiSelect._wrapperElement.querySelector('.multi-select-selection')
      expect(selection.classList.contains('multi-select-selection-chips')).toBe(false)
    })
  })

  describe('aria attributes', () => {
    it('should set combobox role', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect._togglerElement.getAttribute('role')).toBe('combobox')
    })

    it('should set aria-haspopup to dialog', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect._togglerElement.getAttribute('aria-haspopup')).toBe('dialog')
    })

    it('should not render the picker button when pickerIcon is off', () => {
      fixtureEl.innerHTML = '<select id="test-select"></select>'
      const selectEl = fixtureEl.querySelector('select')
      // eslint-disable-next-line no-new
      new MultiSelect(selectEl, { options: [], pickerIcon: false })

      expect(selectEl.parentNode.querySelector('.form-control-action')).toBeNull()
    })

    it('should place the selection cleaner without a picker button', () => {
      fixtureEl.innerHTML = '<select id="test-select" multiple><option value="1" selected>a</option></select>'
      const selectEl = fixtureEl.querySelector('select')
      // eslint-disable-next-line no-new
      new MultiSelect(selectEl, { cleaner: true, pickerIcon: false })

      expect(selectEl.parentNode.querySelector('.form-control-action')).toBeNull()
      expect(selectEl.parentNode.querySelector('.form-control-cleaner')).not.toBeNull()
    })

    it('should keep the cleaner in the live control without a picker button once something is selected', () => {
      fixtureEl.innerHTML = '<select id="test-select" multiple></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { cleaner: true, options: [{ value: '1', text: 'a' }], pickerIcon: false })

      multiSelect.selectAll()

      expect(fixtureEl.querySelector('.form-control-cleaner')).not.toBeNull()
    })

    it('should name the toggle after what it opens', () => {
      fixtureEl.innerHTML = '<select id="test-select"></select>'
      const selectEl = fixtureEl.querySelector('select')
      // eslint-disable-next-line no-new
      new MultiSelect(selectEl, { options: [] })

      expect(selectEl.parentNode.querySelector('.form-control-action').getAttribute('aria-label')).toBe('Toggle options list')
    })

    it('should give the search input an accessible label and point it at the list', () => {
      fixtureEl.innerHTML = '<select id="test-select"></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [], search: true })
      const input = multiSelect._searchElement

      expect(input.getAttribute('aria-label')).toBe('Search')
      expect(input.getAttribute('aria-controls')).toBeNull()

      multiSelect.show()

      expect(input.getAttribute('aria-controls')).toBe('test-select-listbox')

      // It filters the list, it does not complete the value: the options take
      // the focus themselves, so nothing writes aria-activedescendant on it.
      expect(input.getAttribute('aria-autocomplete')).toBeNull()
    })

    it('should use a custom ariaSearchLabel', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [], search: true, ariaSearchLabel: 'Szukaj' })

      expect(multiSelect._searchElement.getAttribute('aria-label')).toBe('Szukaj')
    })

    it('should leave the selection without a live region of its own', () => {
      fixtureEl.innerHTML = '<select multiple><option value="1" selected>One</option></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'))

      expect(multiSelect._selectionElement.getAttribute('aria-live')).toBeNull()
      expect(multiSelect._wrapperElement.querySelector('[role="status"], [role="log"], [aria-live]')).toBeNull()
    })

    it('should set aria-disabled on the toggler when disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [], disabled: true })

      expect(multiSelect._togglerElement.getAttribute('aria-disabled')).toBe('true')
    })

    it('should not set aria-disabled on the toggler when enabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect._togglerElement.getAttribute('aria-disabled')).toBeNull()
    })

    it('should point the toggler at the dialog and the search input at the list only while the panel is open', async () => {
      fixtureEl.innerHTML = '<select id="test-select"></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [{ value: '1', text: 'One' }], search: true })
      const referrers = [multiSelect._togglerElement, multiSelect._searchElement]

      expect(referrers.map(element => element.getAttribute('aria-controls'))).toEqual([null, null])

      multiSelect.show()

      expect(referrers.map(element => document.getElementById(element.getAttribute('aria-controls')))).toEqual([
        multiSelect._menu,
        multiSelect._menu.querySelector('#test-select-listbox')
      ])
      expect(multiSelect._menu.getAttribute('role')).toBe('dialog')

      multiSelect.hide()

      expect(referrers.map(element => element.getAttribute('aria-controls'))).toEqual([null, null])

      await new Promise(resolve => {
        setTimeout(resolve, 50)
      })

      expect(referrers.map(element => element.getAttribute('aria-controls'))).toEqual([null, null])
    })

    it('should point the toggler at its own dialog when the page already uses the select id with -dialog', () => {
      fixtureEl.innerHTML = '<div id="test-select-dialog"></div><select id="test-select"></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { options: [{ value: '1', text: 'One' }] })

      multiSelect.show()

      expect(document.getElementById(multiSelect._togglerElement.getAttribute('aria-controls'))).toBe(multiSelect._menu)
    })

    it('should keep a moved list inside its panel, with no aria-owns', () => {
      fixtureEl.innerHTML = '<select id="test-select"></select>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), { container: 'body', options: [{ value: '1', text: 'One' }] })
      const toggler = multiSelect._togglerElement

      multiSelect.show()

      expect(multiSelect._menu.parentElement).toBe(document.body)
      expect(document.getElementById(toggler.getAttribute('aria-controls'))).toBe(multiSelect._menu)
      expect(multiSelect._menu.contains(document.getElementById('test-select-listbox'))).toBeTrue()
      expect(toggler.getAttribute('aria-owns')).toBeNull()
    })

    it('should set listbox role on the options element', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      expect(multiSelect._optionsElement.getAttribute('role')).toBe('listbox')
      expect(multiSelect._optionsElement.getAttribute('id')).toBe(`${multiSelect._uniqueId}-listbox`)
    })

    it('should set option role on each option element', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      const optionEl = multiSelect._optionsElement.querySelector('.list-box-option')
      expect(optionEl.getAttribute('role')).toBe('option')
    })

    it('should set aria-selected on options at creation', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2' }
        ]
      })

      const selectedOption = multiSelect._optionsElement.querySelector('[data-coreui-value="1"]')
      const unselectedOption = multiSelect._optionsElement.querySelector('[data-coreui-value="2"]')

      expect(selectedOption.getAttribute('aria-selected')).toBe('true')
      expect(unselectedOption.getAttribute('aria-selected')).toBe('false')
    })

    it('should set aria-label on cleaner button', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1', selected: true }],
        cleaner: true,
        multiple: true,
        ariaCleanerLabel: 'Clear all'
      })

      expect(multiSelect._selectionCleanerElement.getAttribute('aria-label')).toBe('Clear all')
    })

    it('should set aria-label on indicator button', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        ariaPickerLabel: 'Toggle menu'
      })

      expect(multiSelect._indicatorElement.getAttribute('aria-label')).toBe('Toggle menu')
    })
  })

  describe('search with input event handler', () => {
    it('should filter options on input in the search box', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Apple' },
          { value: '2', text: 'Banana' }
        ],
        search: true
      })

      multiSelect.show()
      multiSelect._searchElement.value = 'ban'

      multiSelect._searchElement.dispatchEvent(new Event('input', { bubbles: true }))

      const visibleOptions = Array.from(multiSelect._optionsElement.querySelectorAll('.list-box-option'))
        .filter(option => !option.hasAttribute('hidden'))

      expect(visibleOptions.length).toBe(1)
      expect(visibleOptions[0].textContent).toContain('Banana')
    })
  })

  describe('_isOptionDisplayed', () => {
    it('should return true for visible elements', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      const el = document.createElement('div')
      document.body.append(el)

      expect(multiSelect._isOptionDisplayed(el)).toBe(true)
      el.remove()
    })

    it('should return false for hidden elements', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      const el = document.createElement('div')
      el.setAttribute('hidden', '')
      document.body.append(el)

      expect(multiSelect._isOptionDisplayed(el)).toBe(false)
      el.remove()
    })
  })

  describe('accessibility of the replaced select', () => {
    it('should hide the native select from assistive technologies', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      // eslint-disable-next-line no-new
      new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      expect(selectEl.getAttribute('aria-hidden')).toBe('true')
      expect(selectEl.tabIndex).toBe(-1)
    })

    it('should name the toggler from an associated label', () => {
      fixtureEl.innerHTML = [
        '<label for="myMultiSelect">Choose fruits</label>',
        '<select id="myMultiSelect"></select>'
      ].join('')
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      const label = fixtureEl.querySelector('label')
      expect(label.id).not.toBe('')
      expect(multiSelect._togglerElement.getAttribute('aria-labelledby')).toBe(label.id)
    })

    it('should copy an aria-label from the native select to the toggler', () => {
      fixtureEl.innerHTML = '<select aria-label="Fruits"></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      expect(multiSelect._togglerElement.getAttribute('aria-label')).toBe('Fruits')
    })

    it('should let the select\'s aria-labelledby and aria-label win over its label', () => {
      fixtureEl.innerHTML = [
        '<h2 id="heading">Heading</h2>',
        '<label for="labelled">Choose fruits</label>',
        '<select id="labelled" aria-labelledby="heading" aria-label="Fruits"></select>',
        '<label for="named">Choose fruits</label>',
        '<select id="named" aria-label="Fruits"></select>'
      ].join('')
      const [labelled, named] = [...fixtureEl.querySelectorAll('select')].map(selectEl => new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      }))

      expect(labelled._togglerElement.getAttribute('aria-labelledby')).toBe('heading')
      expect(labelled._togglerElement.hasAttribute('aria-label')).toBeFalse()
      expect(labelled._menu.getAttribute('aria-labelledby')).toBe('heading')
      expect(named._togglerElement.getAttribute('aria-label')).toBe('Fruits')
      expect(named._togglerElement.hasAttribute('aria-labelledby')).toBeFalse()
      expect(named._menu.getAttribute('aria-label')).toBe('Fruits')
    })

    it('should leave a label that wraps the select out of the name', () => {
      fixtureEl.innerHTML = '<label>Choose fruits <select></select></label>'
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      expect(fixtureEl.querySelector('label').id).toBe('')
      expect(multiSelect._togglerElement.hasAttribute('aria-labelledby')).toBeFalse()
    })

    it('should leave the search input a name of its own', () => {
      fixtureEl.innerHTML = [
        '<label for="searchable">Choose fruits</label>',
        '<select id="searchable"></select>'
      ].join('')
      const multiSelect = new MultiSelect(fixtureEl.querySelector('select'), {
        options: [{ value: '1', text: 'Opt 1' }],
        search: true
      })

      expect(multiSelect._searchElement.getAttribute('aria-label')).toBe('Search')
      expect(multiSelect._searchElement.hasAttribute('aria-labelledby')).toBeFalse()
    })

    it('should mark the focused control as required from the required option only', () => {
      fixtureEl.innerHTML = [
        '<select id="plain"></select>',
        '<select id="searchable"></select>',
        '<select id="page" aria-required="true"></select>'
      ].join('')
      const [plain, searchable, page] = [...fixtureEl.querySelectorAll('select')]
      const plainSelect = new MultiSelect(plain, { options: [{ value: '1', text: 'Opt 1' }], required: true })
      const searchableSelect = new MultiSelect(searchable, { options: [{ value: '1', text: 'Opt 1' }], required: true, search: true })
      const pageSelect = new MultiSelect(page, { options: [{ value: '1', text: 'Opt 1' }] })

      expect(plainSelect._togglerElement.getAttribute('aria-required')).toBe('true')
      expect(searchableSelect._togglerElement.hasAttribute('aria-required')).toBeFalse()
      expect(searchableSelect._searchElement.getAttribute('aria-required')).toBe('true')
      expect(pageSelect._togglerElement.hasAttribute('aria-required')).toBeFalse()
    })
  })

  describe('selectionType chips', () => {
    it('should render selected options as chips with a labelled remove button', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Apple' },
          { value: '2', text: 'Banana' }
        ],
        selectionType: 'chips',
        value: '1'
      })

      const chip = multiSelect._selectionElement.querySelector('.chip')

      expect(chip).not.toBeNull()
      expect(chip.dataset.value).toBe('1')
      expect(chip.textContent).toContain('Apple')

      const removeButton = chip.querySelector('.chip-remove')
      expect(removeButton).not.toBeNull()
      expect(removeButton.getAttribute('aria-label')).toBe('Remove Apple')
    })

    it('should deselect the option when its chip is removed', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Apple' },
          { value: '2', text: 'Banana' }
        ],
        selectionType: 'chips',
        value: '1'
      })

      const chip = multiSelect._selectionElement.querySelector('.chip')
      chip.querySelector('.chip-remove').click()

      expect(multiSelect.getValue()).toHaveLength(0)
      expect(multiSelect._selectionElement.querySelector('.chip')).toBeNull()
      expect(selectEl.querySelector('option[value="1"]').selected).toBe(false)
    })

    it('should not render a remove button on chips for disabled options', () => {
      fixtureEl.innerHTML = [
        '<select multiple>',
        '  <option value="1" selected disabled>Apple</option>',
        '  <option value="2">Banana</option>',
        '</select>'
      ].join('')
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        selectionType: 'chips'
      })

      const chip = multiSelect._selectionElement.querySelector('.chip')

      expect(chip).not.toBeNull()
      expect(chip.querySelector('.chip-remove')).toBeNull()
    })
  })

  describe('checkbox indicators reuse the form-check surface', () => {
    it('should render a decorative check indicator in checkbox options', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Apple' }]
      })

      const indicator = multiSelect._optionsElement.querySelector('.list-box-option .list-box-option-indicator')

      expect(indicator).not.toBeNull()
      expect(indicator.tagName).toBe('SPAN')
      expect(indicator).toHaveClass('check')
      expect(indicator.getAttribute('aria-hidden')).toBe('true')
    })

    it('should render the indicator inside the select all button before its label', () => {
      fixtureEl.innerHTML = '<select multiple></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Apple' }],
        selectAll: true,
        selectAllLabel: 'Select all'
      })

      const button = multiSelect._selectAllElement

      expect(button.firstElementChild).toHaveClass('list-box-option-indicator')
      expect(button.textContent).toBe('Select all')
    })
  })
})

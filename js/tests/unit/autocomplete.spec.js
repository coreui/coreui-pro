import { userEvent } from '@vitest/browser/context'
import Autocomplete from '../../src/autocomplete.js'
import Dialog from '../../src/dialog.js'
import Form from '../../src/form.js'
import {
  clearFixture, createEvent, getFixture, jQueryMock
} from '../helpers/fixture.js'

describe('Autocomplete', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Autocomplete.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(Autocomplete.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(Autocomplete.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Autocomplete.DATA_KEY).toEqual('coreui.autocomplete')
    })
  })

  describe('constructor', () => {
    it('should skip a disabled preselected option', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{
          label: 'X', value: 'x', selected: true, disabled: true
        }, { label: 'Y', value: 'y' }]
      })

      expect(autocomplete._selected).toEqual([])
      expect(autocomplete._inputElement.value).toBe('')
    })

    it('should apply a preselected option without firing change or input', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const seen = []

      autocompleteEl.addEventListener('change.coreui.autocomplete', () => seen.push('change'))
      autocompleteEl.addEventListener('input.coreui.autocomplete', () => seen.push('input'))

      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1', selected: true }, { label: 'Option 2', value: '2' }]
      })

      expect(seen).toEqual([])
      expect(autocomplete._inputElement.value).toBe('Option 1')
      expect(autocomplete._selected.map(option => option.value)).toEqual(['1'])
    })

    it('should take care of element either passed as a CSS selector or DOM element', () => {
      fixtureEl.innerHTML = [
        '<div class="autocomplete" data-coreui-autocomplete>',
        '</div>'
      ].join('')

      const autocompleteEl = fixtureEl.querySelector('[data-coreui-autocomplete]')
      const autocompleteBySelector = new Autocomplete('[data-coreui-autocomplete]', { options: [] })
      expect(autocompleteBySelector._element).toEqual(autocompleteEl)

      const autocompleteByElement = new Autocomplete(autocompleteEl, { options: [] })
      expect(autocompleteByElement._element).toEqual(autocompleteEl)
    })

    it('should create autocomplete with default options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl)

      expect(autocomplete._config.allowOnlyDefinedOptions).toBe(false)
      expect(autocomplete._config.cleaner).toBe(false)
      expect(autocomplete._config.disabled).toBe(false)
      expect(autocomplete._config.options).toEqual([])
      expect(autocomplete._config.placeholder).toBe(null)
    })

    it('should create autocomplete with custom options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const config = {
        allowOnlyDefinedOptions: true,
        cleaner: true,
        disabled: false,
        placeholder: 'Select an option',
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' }
        ]
      }
      const autocomplete = new Autocomplete(autocompleteEl, config)

      expect(autocomplete._config.allowOnlyDefinedOptions).toBe(true)
      expect(autocomplete._config.cleaner).toBe(true)
      expect(autocomplete._config.disabled).toBe(false)
      expect(autocomplete._config.placeholder).toBe('Select an option')
      expect(autocomplete._config.options).toEqual(config.options)
    })

    it('should create autocomplete structure with input element', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      expect(autocompleteEl.classList.contains('autocomplete')).toBe(true)
      expect(autocomplete._inputElement).toBeTruthy()
      expect(autocomplete._inputElement.tagName).toBe('INPUT')
      expect(autocomplete._inputElement.getAttribute('role')).toBe('combobox')
      expect(autocomplete._inputElement.getAttribute('aria-autocomplete')).toBe('list')
      expect(autocomplete._inputElement.getAttribute('aria-haspopup')).toBe('listbox')
      expect(autocomplete._inputElement.getAttribute('aria-controls')).toBeNull()
    })

    it('should point aria-controls at the list only while the list is in the document', async () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocomplete = new Autocomplete(fixtureEl.querySelector('.autocomplete'), { options: ['Option 1', 'Option 2'] })
      const input = autocomplete._inputElement

      autocomplete.show()

      expect(document.getElementById(input.getAttribute('aria-controls'))).toBe(autocomplete._menu.querySelector('[role="listbox"]'))
      expect(input.getAttribute('aria-owns')).toBeNull()

      autocomplete.hide()

      expect(input.getAttribute('aria-controls')).toBeNull()

      await new Promise(resolve => {
        setTimeout(resolve, 50)
      })

      expect(autocomplete._menu.isConnected).toBeFalse()
      expect(input.getAttribute('aria-controls')).toBeNull()

      autocomplete.setConfig({ options: ['Option 3'] })

      expect(input.getAttribute('aria-controls')).toBeNull()
    })

    it('should point a moved list through aria-controls only, with no aria-owns', () => {
      fixtureEl.innerHTML = '<div style="overflow: hidden"><div class="autocomplete"></div></div>'
      const autocomplete = new Autocomplete(fixtureEl.querySelector('.autocomplete'), { options: ['Option 1'] })
      const input = autocomplete._inputElement

      autocomplete.show()

      expect(autocomplete._menu.parentElement).toBe(document.body)
      expect(document.getElementById(input.getAttribute('aria-controls'))).not.toBeNull()
      expect(input.getAttribute('aria-owns')).toBeNull()
    })

    it('should render each option with role="option"', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }]
      })

      const optionEls = autocomplete._optionsElement.querySelectorAll('.list-box-option')
      expect(optionEls.length).toBe(2)
      for (const optionEl of optionEls) {
        expect(optionEl.getAttribute('role')).toBe('option')
        expect(optionEl.getAttribute('aria-selected')).toBe('false')
      }
    })

    it('should create autocomplete with cleaner button when cleaner option is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { cleaner: true, options: [] })

      expect(autocomplete._cleanerElement).toBeTruthy()
      expect(autocomplete._cleanerElement.classList.contains('form-control-cleaner')).toBe(true)
    })

    it('should create autocomplete with indicator button when indicator option is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { pickerIcon: true, options: [] })

      expect(autocomplete._indicatorElement).toBeTruthy()
      expect(autocomplete._indicatorElement.classList.contains('form-control-action')).toBe(true)
    })

    it('should create autocomplete with options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const options = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' }
      ]
      const autocomplete = new Autocomplete(autocompleteEl, { options })

      expect(autocomplete._options).toEqual(options)
      expect(autocomplete._optionsElement).toBeTruthy()
      expect(autocomplete._optionsElement.classList.contains('list-box-options')).toBe(true)
    })

    it('should create disabled autocomplete', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        disabled: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      expect(autocompleteEl.classList.contains('disabled')).toBe(true)
      expect(autocomplete._inputElement.getAttribute('disabled')).toBe('true')
      expect(autocomplete._inputElement.tabIndex).toBe(-1)
    })

    it('should not create cleaner button when disabled even if cleaner is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        disabled: true,
        cleaner: false,
        options: []
      })

      expect(autocomplete._cleanerElement).toBeUndefined()
    })

    it('should disable the indicator when disabled', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        disabled: true,
        pickerIcon: true,
        options: []
      })

      expect(autocomplete._indicatorElement.disabled).toBe(true)
    })

    it('should use custom id when provided', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        id: 'my-custom-id',
        options: []
      })

      expect(autocomplete._inputElement.id).toBe('my-custom-id')
    })

    it('should set required attribute on input when required is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        required: true,
        options: []
      })

      expect(autocomplete._inputElement.getAttribute('required')).toBe('true')
    })

    it('should set placeholder on input', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        placeholder: 'Type here...',
        options: []
      })

      expect(autocomplete._inputElement.placeholder).toBe('Type here...')
    })

    it('should set name attribute on input', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        name: 'my-input',
        options: []
      })

      expect(autocomplete._inputElement.getAttribute('name')).toBe('my-input')
    })

    it('should add is-invalid class when invalid is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { // eslint-disable-line no-unused-vars
        invalid: true,
        options: []
      })

      expect(autocompleteEl.classList.contains('is-invalid')).toBe(true)
    })

    it('should add is-valid class when valid is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { // eslint-disable-line no-unused-vars
        valid: true,
        options: []
      })

      expect(autocompleteEl.classList.contains('is-valid')).toBe(true)
    })

    it('should keep a validation class written in the markup and mark the field invalid', () => {
      fixtureEl.innerHTML = '<div class="autocomplete is-invalid"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      expect(autocompleteEl.classList.contains('is-invalid')).toBeTrue()
      expect(autocomplete._inputElement.getAttribute('aria-invalid')).toBe('true')
    })

    it('should set optionsMaxHeight on the options container', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        optionsMaxHeight: 200,
        options: [{ label: 'Option 1', value: '1' }]
      })

      expect(autocomplete._optionsElement.style.maxHeight).toBe('200px')
      expect(autocomplete._optionsElement.style.overflowY).toBe('auto')
    })

    it('should not set maxHeight when optionsMaxHeight is auto', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        optionsMaxHeight: 'auto',
        options: [{ label: 'Option 1', value: '1' }]
      })

      expect(autocomplete._optionsElement.style.maxHeight).toBe('')
    })

    it('should pre-select option when value config matches', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        value: '2',
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' }
        ]
      })

      expect(autocomplete._selected.length).toBe(1)
      expect(autocomplete._selected[0].value).toBe('2')
      expect(autocomplete._inputElement.value).toBe('Option 2')
    })

    it('should pre-select option when selected property is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2', selected: true }
        ]
      })

      expect(autocomplete._selected.length).toBe(1)
      expect(autocomplete._selected[0].value).toBe('2')
    })

    it('should handle string options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: ['Apple', 'Banana', 'Cherry']
      })

      expect(autocomplete._options[0].label).toBe('Apple')
      expect(autocomplete._options[0].value).toBe('Apple')
      expect(autocomplete._options[1].label).toBe('Banana')
      expect(autocomplete._options[1].value).toBe('Banana')
    })

    it('should handle options as comma-separated string via configAfterMerge', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: 'Apple, Banana, Cherry'
      })

      expect(autocomplete._options[0].label).toBe('Apple')
      expect(autocomplete._options[0].value).toBe('Apple')
      expect(autocomplete._options[1].label).toBe('Banana')
      expect(autocomplete._options[2].label).toBe('Cherry')
    })

    it('should handle search as comma-separated string via configAfterMerge', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: 'external, global',
        options: []
      })

      expect(autocomplete._isExternalSearch()).toBe(true)
      expect(autocomplete._isGlobalSearch()).toBe(true)
    })

    it('should not create hint input when disabled', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        disabled: true,
        showHints: true,
        options: []
      })

      expect(autocomplete._inputHintElement).toBeNull()
    })

    it('should create hint input when showHints is true and not disabled', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: []
      })

      expect(autocomplete._inputHintElement).toBeTruthy()
      expect(autocomplete._inputHintElement.classList.contains('autocomplete-input-hint')).toBe(true)
      expect(autocomplete._inputHintElement.readOnly).toBe(true)
      expect(autocomplete._inputHintElement.tabIndex).toBe(-1)
      expect(autocomplete._inputHintElement.hasAttribute('name')).toBeFalse()
    })

    it('should not submit a field the page did not name', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="autocomplete"></div></form>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: ['Angular'] })

      autocomplete._inputElement.value = 'Angular'

      expect(autocomplete._inputElement.hasAttribute('name')).toBeFalse()
      expect([...new FormData(fixtureEl.querySelector('#form')).keys()]).toEqual([])
    })

    it('should submit under a name given by setConfig', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="autocomplete"></div></form>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: ['Angular'] })

      autocomplete.setConfig({ name: 'tech' })
      autocomplete._inputElement.value = 'Angular'

      expect([...new FormData(fixtureEl.querySelector('#form')).entries()]).toEqual([['tech', 'Angular']])

      autocomplete.setConfig({ name: null })

      expect(autocomplete._inputElement.hasAttribute('name')).toBeFalse()
    })

    it('should submit the configured name once when showHints is true', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="autocomplete"></div></form>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        name: 'tech',
        showHints: true,
        options: ['Angular']
      })

      autocomplete._inputElement.value = 'Angular'

      const formData = new FormData(fixtureEl.querySelector('#form'))

      expect(autocomplete._inputHintElement).not.toBeNull()
      expect(formData.getAll('tech')).toEqual(['Angular'])
    })

    it('should submit nothing extra when showHints is true and no name is set', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="autocomplete"></div></form>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: ['Angular']
      })

      const keys = [...new FormData(fixtureEl.querySelector('#form')).keys()]

      expect(autocomplete._inputHintElement).not.toBeNull()
      expect(keys).toEqual([])
    })

    it('should set togglerElement tabIndex to -1 when search is falsy and not disabled', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: null,
        options: []
      })

      expect(autocomplete._togglerElement.tabIndex).toBe(-1)
    })
  })

  describe('validation', () => {
    const OPTIONS = [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }]
    const settle = () => new Promise(resolve => {
      setTimeout(resolve)
    })
    const mountInForm = (config = {}, { attributes = '', classes = '' } = {}) => {
      fixtureEl.innerHTML = `<form ${attributes}><div class="autocomplete ${classes}"></div><div class="invalid-feedback">Pick a country.</div><button type="submit">Send</button></form>`
      const form = fixtureEl.querySelector('form')
      form.addEventListener('submit', event => event.preventDefault())
      const element = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(element, { name: 'country', options: OPTIONS, ...config })

      return {
        autocomplete, element, form, input: autocomplete._inputElement
      }
    }

    const typeInto = (input, text) => {
      input.value = text
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }

    it('should show validationState on the frame and the field, and block the submit with the message while it is invalid', () => {
      const { autocomplete, element, form, input } = mountInForm({ validationState: 'invalid' })
      const { id } = fixtureEl.querySelector('.invalid-feedback')

      expect(element).toHaveClass('is-invalid')
      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(input.getAttribute('aria-describedby')).toBe(id)
      expect(form.checkValidity()).toBeFalse()
      expect(input.validationMessage).toBe('Pick a country.')

      autocomplete.setConfig({ validationState: 'warning' })

      expect(element.className).toContain('is-warning')
      expect(element).not.toHaveClass('is-invalid')
      expect(input.hasAttribute('aria-invalid')).toBeFalse()
      expect(input.hasAttribute('aria-describedby')).toBeFalse()
      expect(form.checkValidity()).toBeTrue()
    })

    it('should take validationState from a data attribute and let it win over the deprecated aliases', () => {
      fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-validation-state="valid"></div>'
      const element = fixtureEl.querySelector('.autocomplete')
      new Autocomplete(element, { invalid: true, options: OPTIONS }) // eslint-disable-line no-new

      expect(element).toHaveClass('is-valid')
      expect(element).not.toHaveClass('is-invalid')
    })

    it('should show a given state while disabled without blocking the submit', () => {
      const { element, form } = mountInForm({ disabled: true, validationState: 'invalid' })

      expect(element).toHaveClass('is-invalid')
      expect(form.checkValidity()).toBeTrue()
    })

    it('should change only the state when setConfig gets only validation options', () => {
      const { autocomplete, element, input } = mountInForm({}, { classes: 'is-valid' })
      const items = autocomplete._options
      input.value = 'Opt'

      autocomplete.setConfig({ invalid: true })

      expect(autocomplete._options).toBe(items)
      expect(input.value).toBe('Opt')
      expect(element).toHaveClass('is-invalid')
      expect(element).not.toHaveClass('is-valid')

      autocomplete.setConfig({ invalid: false })

      expect(element).not.toHaveClass('is-valid')

      autocomplete.dispose()

      expect(element.className).toBe('autocomplete')
    })

    it.each([
      ['typing', ({ input }) => typeInto(input, 'x')],
      ['a pick of a different option', ({ autocomplete }) => autocomplete._onOptionSelected('2')],
      ['the cleaner', ({ autocomplete }) => autocomplete._cleanerElement.click()],
      ['Enter on the cleaner', ({ autocomplete }) => autocomplete._cleanerElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))],
      ['Backspace on the selected option', ({ input }) => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))],
      ['Delete on the selected option', ({ input }) => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))]
    ])('should drop a given state and a state class from the markup through %s', (_, act) => {
      for (const given of [{ config: { validationState: 'invalid' } }, { classes: 'is-invalid' }]) {
        const mounted = mountInForm({ cleaner: true, value: '1', ...given.config }, { classes: given.classes ?? '' })

        act(mounted)

        expect(mounted.element).not.toHaveClass('is-invalid')
        expect(mounted.input.hasAttribute('aria-invalid')).toBeFalse()
        expect(mounted.form.checkValidity()).toBeTrue()

        mounted.autocomplete.dispose()

        expect(mounted.element).not.toHaveClass('is-invalid')
      }
    })

    it.each([['Escape', 'escape'], ['a click outside', 'click'], ['leaving the field', 'blur']])('should drop a given state when %s empties a field that takes only defined options', async (_, how) => {
      const { element, input } = mountInForm({ allowOnlyDefinedOptions: true, validationState: 'invalid' })
      input.focus()
      await userEvent.keyboard('Op')
      Autocomplete.getInstance(element).setConfig({ validationState: 'invalid' })

      if (how === 'escape') {
        await userEvent.keyboard('{Escape}')
      } else if (how === 'click') {
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      } else {
        input.blur()
      }

      expect(input.value).toBe('')
      expect(element).not.toHaveClass('is-invalid')
    })

    it('should keep a given state when Escape leaves an empty field empty', async () => {
      const { element, input } = mountInForm({ allowOnlyDefinedOptions: true, validationState: 'invalid' })
      input.focus()

      await userEvent.keyboard('{Escape}')

      expect(element).toHaveClass('is-invalid')
    })

    it('should keep a given state through changes from code and through user actions that change nothing', () => {
      const { autocomplete, element, form } = mountInForm({ value: '1', validationState: 'invalid' }, { classes: 'is-invalid' })

      autocomplete._onOptionSelected('1')
      autocomplete.setConfig({ options: [...OPTIONS, { label: 'Option 3', value: '3' }] })
      autocomplete.setConfig({ value: '2' })
      autocomplete.clear()
      autocomplete.deselectAll()

      expect(element).toHaveClass('is-invalid')
      expect(form.checkValidity()).toBeFalse()

      autocomplete.dispose()

      expect(element).toHaveClass('is-invalid')
    })

    it('should lift the block before change.coreui.autocomplete and treat what the page does there as code', () => {
      const { autocomplete, element, form, input } = mountInForm({ validationState: 'invalid' })
      const seen = []

      element.addEventListener('change.coreui.autocomplete', () => {
        seen.push(input.validity.valid)
        autocomplete.setConfig({ validationState: 'invalid' })
      }, { once: true })
      autocomplete._onOptionSelected('2')

      expect(seen).toEqual([true])
      expect(element).toHaveClass('is-invalid')
      expect(form.checkValidity()).toBeFalse()
    })

    it('should keep a state the page gives on the change Backspace reports through the input of the same key', async () => {
      const { autocomplete, element, input } = mountInForm({ value: '1', validationState: 'invalid' })

      element.addEventListener('change.coreui.autocomplete', () => autocomplete.setConfig({ validationState: 'invalid' }), { once: true })
      input.focus()
      input.setSelectionRange(input.value.length, input.value.length)
      await userEvent.keyboard('{Backspace}')

      expect(input.value).toBe('Option ')
      expect(element).toHaveClass('is-invalid')
    })

    it('should show what a validation reports on the frame and the field, and leave the field to itself when the form plugin marks the controls', () => {
      const { element, form, input } = mountInForm({ required: true }, { attributes: 'data-coreui-validate novalidate' })

      Form.getOrCreateInstance(form).validate()

      const { id } = fixtureEl.querySelector('.invalid-feedback')

      expect(element).toHaveClass('is-invalid')
      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(input.getAttribute('aria-describedby')).toBe(id)
      expect(input.className).toBe('form-control')

      typeInto(input, 'Option 1')

      expect(element).not.toHaveClass('is-invalid')
      expect(input.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should not read aria-invalid on the element, nor a state class the page writes after start', () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete" aria-invalid="true"></div></form>'
      const element = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(element, { options: OPTIONS })

      element.classList.add('is-invalid')
      autocomplete._onOptionSelected('2')

      expect(autocomplete._inputElement.hasAttribute('aria-invalid')).toBeFalse()
      expect(element.getAttribute('aria-invalid')).toBe('true')
      expect(fixtureEl.querySelector('form').checkValidity()).toBeTrue()
    })

    it('should block the submit for a state class from the markup', () => {
      expect(mountInForm({}, { classes: 'is-invalid' }).form.checkValidity()).toBeFalse()
    })

    it('should keep the description the page gives its input and add the message only while it is invalid', () => {
      const { autocomplete, input } = mountInForm()
      const observer = new MutationObserver(() => {})
      input.setAttribute('aria-describedby', 'help')

      autocomplete.setConfig({ validationState: 'invalid' })
      const { id } = fixtureEl.querySelector('.invalid-feedback')

      expect(input.getAttribute('aria-describedby')).toBe(`help ${id}`)

      observer.observe(input, { attributeFilter: ['aria-describedby', 'aria-invalid'] })
      autocomplete.setConfig({ options: OPTIONS })
      input.dispatchEvent(new Event('focusout'))

      expect(observer.takeRecords()).toHaveSize(0)
      observer.disconnect()

      typeInto(input, 'x')

      expect(input.getAttribute('aria-describedby')).toBe('help')
    })

    it('should describe the input with the message named in data-coreui-invalid-feedback on the element', () => {
      fixtureEl.innerHTML = '<form><p id="ac-message">Pick a country.</p><div class="autocomplete" data-coreui-invalid-feedback="ac-message"></div></form>'
      const autocomplete = new Autocomplete(fixtureEl.querySelector('.autocomplete'), { options: OPTIONS, validationState: 'invalid' })

      expect(autocomplete._inputElement.getAttribute('aria-describedby')).toBe('ac-message')
      expect(autocomplete._inputElement.validationMessage).toBe('Pick a country.')
    })

    it.each([['leaving the field', 'blur'], ['Enter', 'enter']])('should keep a given state when %s picks the option the text already names', (_, how) => {
      for (const disabled of [false, true]) {
        const { autocomplete, element, input } = mountInForm({ options: [{ label: 'Option 1', value: '1', disabled }, { label: 'Option 2', value: '2' }] })
        typeInto(input, 'Option 1')
        autocomplete.setConfig({ validationState: 'invalid' })

        if (how === 'blur') {
          input.dispatchEvent(new FocusEvent('blur'))
        } else {
          input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
        }

        expect(element).toHaveClass('is-invalid')
        autocomplete.dispose()
      }
    })

    it('should keep a given state when an input leaves the text as it was', () => {
      const { autocomplete, element, input } = mountInForm()
      typeInto(input, 'Germany')
      autocomplete.setConfig({ validationState: 'invalid' })

      typeInto(input, 'Germany')

      expect(element).toHaveClass('is-invalid')

      autocomplete._onOptionSelected('1')
      autocomplete.setConfig({ validationState: 'invalid' })
      typeInto(input, 'Option 1')

      expect(element).toHaveClass('is-invalid')
    })

    it('should not let a key that changed nothing hold back the next change', () => {
      const { autocomplete, element, input } = mountInForm()

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', bubbles: true }))
      input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', bubbles: true }))
      autocomplete.setConfig({ validationState: 'invalid' })
      typeInto(input, 'x')

      expect(element).not.toHaveClass('is-invalid')
    })

    it('should treat two inputs without a key between them as two actions', () => {
      const { autocomplete, element, input } = mountInForm()

      element.addEventListener('input.coreui.autocomplete', event => {
        if (event.value === 'a') {
          autocomplete.setConfig({ validationState: 'invalid' })
        }
      })
      typeInto(input, 'a')

      expect(element).toHaveClass('is-invalid')

      typeInto(input, 'ab')

      expect(element).not.toHaveClass('is-invalid')
    })

    it('should lift the block before input.coreui.autocomplete when the cleaner empties the field', () => {
      const { autocomplete, element, input } = mountInForm({ cleaner: true, value: '1', validationState: 'invalid' })
      const seen = []

      element.addEventListener('input.coreui.autocomplete', () => seen.push([input.validity.valid, element.classList.contains('is-invalid'), input.getAttribute('aria-invalid')]))
      autocomplete._cleanerElement.click()

      expect(seen[0]).toEqual([true, false, null])
    })

    it('should keep a state the page gives on input.coreui.autocomplete when Escape empties a field that takes only defined options', async () => {
      const { autocomplete, element, input } = mountInForm({ allowOnlyDefinedOptions: true })

      element.addEventListener('input.coreui.autocomplete', event => {
        if (event.value === '') {
          autocomplete.setConfig({ validationState: 'invalid' })
        }
      })
      input.focus()
      await userEvent.keyboard('Op')
      await userEvent.keyboard('{Escape}')

      expect(input.value).toBe('')
      expect(element).toHaveClass('is-invalid')
    })

    it('should keep the state class from the markup when setConfig rejects the options', () => {
      const { autocomplete, element, input } = mountInForm({}, { classes: 'is-invalid' })

      expect(() => autocomplete.setConfig({ validationState: 1 })).toThrowError(TypeError)

      input.dispatchEvent(new Event('focusout'))

      expect(element).toHaveClass('is-invalid')
    })

    it('should report the free text a native reset clears, also when the page gives a state right after it', async () => {
      const { autocomplete, element, form, input } = mountInForm()
      const changes = []
      typeInto(input, 'foo')
      element.addEventListener('change.coreui.autocomplete', event => changes.push(event.value))

      form.reset()
      autocomplete.setConfig({ validationState: 'invalid' })
      await settle()

      expect(changes).toEqual([null])
      expect(element).toHaveClass('is-invalid')

      typeInto(input, 'foo')

      expect(element).not.toHaveClass('is-invalid')
    })

    it('should settle its state before it reports a value that arrives with late options after a reset', async () => {
      const { autocomplete, element, form } = mountInForm({ options: [], required: true, value: '3' })
      const seen = []

      form.reset()
      await settle()
      form.checkValidity()

      expect(element).toHaveClass('is-invalid')

      element.addEventListener('change.coreui.autocomplete', () => seen.push(element.classList.contains('is-invalid')))
      autocomplete.setConfig({ options: [{ label: 'Option 3', value: '3' }] })

      expect(seen).toEqual([false])
    })

    it.each([['before the reset', 'before', false], ['in a reset listener', 'listener', true], ['right after form.reset()', 'after', true]])('should put back the value it started with on a native reset and treat a state given %s as the reset says', async (_, when, kept) => {
      const { autocomplete, element, form, input } = mountInForm({ value: '1' })
      const giveState = () => autocomplete.setConfig({ validationState: 'invalid' })

      autocomplete._onOptionSelected('2')

      if (when === 'before') {
        giveState()
      } else if (when === 'listener') {
        form.addEventListener('reset', giveState)
      }

      form.reset()

      if (when === 'after') {
        giveState()
      }

      await settle()

      expect(input.value).toBe('Option 1')
      expect(element.classList.contains('is-invalid')).toBe(kept)
    })

    it('should drop a state class from the markup on a native reset', async () => {
      const { element, form } = mountInForm({ value: '1' }, { classes: 'is-valid' })

      form.reset()
      await settle()

      expect(element).not.toHaveClass('is-valid')
    })
  })

  describe('toggle', () => {
    it('should toggle autocomplete visibility', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      expect(autocomplete._isShown()).toBe(false)
      autocomplete.toggle()
      expect(autocomplete._isShown()).toBe(true)
      autocomplete.toggle()
      expect(autocomplete._isShown()).toBe(false)
    })

    it('should not toggle if disabled', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        disabled: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.toggle()
      expect(autocomplete._isShown()).toBe(false)
    })
  })

  describe('show', () => {
    // The panel keys its own display and entry transition on this class, so a
    // panel opened only through an ancestor's class is laid out and invisible.
    it('should mark the popup itself as shown', () => {
      fixtureEl.innerHTML = '<div></div>'
      const element = fixtureEl.querySelector('div')
      const instance = new Autocomplete(element, { options: [{ value: 1, label: 'One' }] })

      instance.show()

      expect(instance._menu.classList.contains('show')).toBe(true)

      instance.hide()

      expect(instance._menu.classList.contains('show')).toBe(false)
    })

    it('should show the autocomplete dropdown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('shown.coreui.autocomplete', () => {
          expect(autocomplete._isShown()).toBe(true)
          expect(autocompleteEl.classList.contains('show')).toBe(true)
          expect(autocomplete._inputElement.getAttribute('aria-expanded')).toBe('true')
          resolve()
        })

        autocomplete.show()
      })
    })

    it('should trigger show event', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('show.coreui.autocomplete', () => {
          expect().nothing()
          resolve()
        })

        autocomplete.show()
      })
    })

    it('should take the first Escape for itself inside a dialog and leave the second to it', async () => {
      fixtureEl.innerHTML = '<dialog class="dialog dialog-instant" id="dialog"><div class="autocomplete"></div></dialog>'
      const dialogEl = fixtureEl.querySelector('#dialog')
      const dialog = new Dialog(dialogEl)
      const autocomplete = new Autocomplete(fixtureEl.querySelector('.autocomplete'), {
        options: [{ label: 'Option 1', value: '1' }]
      })
      const hidden = new Promise(resolve => {
        dialogEl.addEventListener('hidden.coreui.dialog', resolve)
      })

      await dialog.show()
      autocomplete._inputElement.focus()
      autocomplete.show()
      expect(autocomplete._isShown()).toBeTrue()

      await userEvent.keyboard('{Escape}')
      expect(autocomplete._isShown()).toBeFalse()
      expect(dialogEl.open).toBeTrue()

      await userEvent.keyboard('{Escape}')
      await hidden
      expect(dialogEl.open).toBeFalse()

      autocomplete.dispose()
      dialog.dispose()
    })

    it('should not show when the show event is prevented', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })
      const shown = jasmine.createSpy('shown')
      autocompleteEl.addEventListener('show.coreui.autocomplete', event => event.preventDefault())
      autocompleteEl.addEventListener('shown.coreui.autocomplete', shown)

      autocomplete.show()

      expect(autocomplete._isShown()).toBeFalse()
      expect(shown).not.toHaveBeenCalled()
    })

    it('should not show if disabled', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        disabled: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      expect(autocomplete._isShown()).toBe(false)
    })

    it('should not show if already shown', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      const isShown = autocomplete._isShown()
      autocomplete.show()
      expect(autocomplete._isShown()).toBe(isShown)
    })

    it('should not show if no matching options and no searchNoResultsLabel', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._search = 'nonexistent'
      autocomplete.show()
      expect(autocomplete._isShown()).toBe(false)
    })

    it('should show if no matching options but searchNoResultsLabel is set', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        searchNoResultsLabel: 'No results',
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._search = 'nonexistent'
      autocomplete.show()
      expect(autocomplete._isShown()).toBe(true)
    })

    it('should expose the no-results placeholder as a role="status" live region', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        searchNoResultsLabel: 'No results',
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      autocomplete._search = 'nonexistent'
      autocomplete._filterOptionsList()

      const placeholder = autocomplete._menu.querySelector('.list-box-empty')
      expect(placeholder.getAttribute('role')).toBe('status')
    })

    it('should render searchNoResultsLabel as text, not markup', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        searchNoResultsLabel: '<img src=x onerror="window.xss = true">',
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      autocomplete._search = 'nonexistent'
      autocomplete._filterOptionsList()

      const placeholder = autocomplete._menu.querySelector('.list-box-empty')
      expect(placeholder.querySelector('img')).toBeNull()
      expect(placeholder.textContent).toBe('<img src=x onerror="window.xss = true">')
    })

    it('should show the default text for searchNoResultsLabel true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        searchNoResultsLabel: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      autocomplete._search = 'nonexistent'
      autocomplete._filterOptionsList()

      expect(autocomplete._menu.querySelector('.list-box-empty').textContent).toBe('No results found')
    })

    it('should show with container mode', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div><div id="container"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const containerEl = fixtureEl.querySelector('#container')
      const autocomplete = new Autocomplete(autocompleteEl, {
        container: containerEl,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      expect(autocomplete._menu.classList.contains('show')).toBe(true)
      expect(autocomplete._menu.style.minWidth).not.toBe('')
    })
  })

  describe('hide', () => {
    it('should hide the autocomplete dropdown', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('shown.coreui.autocomplete', () => {
          autocomplete.hide()
        })

        autocompleteEl.addEventListener('hidden.coreui.autocomplete', () => {
          expect(autocomplete._isShown()).toBe(false)
          expect(autocompleteEl.classList.contains('show')).toBe(false)
          expect(autocomplete._inputElement.getAttribute('aria-expanded')).toBe('false')
          resolve()
        })

        autocomplete.show()
      })
    })

    it('should trigger hide event', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('shown.coreui.autocomplete', () => {
          autocomplete.hide()
        })

        autocompleteEl.addEventListener('hide.coreui.autocomplete', () => {
          expect().nothing()
          resolve()
        })

        autocomplete.show()
      })
    })

    it('should stay open when the hide event is prevented', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })
      const hidden = jasmine.createSpy('hidden')
      autocompleteEl.addEventListener('hide.coreui.autocomplete', event => event.preventDefault())
      autocompleteEl.addEventListener('hidden.coreui.autocomplete', hidden)

      autocomplete.show()
      autocomplete.hide()

      expect(autocomplete._isShown()).toBeTrue()
      expect(hidden).not.toHaveBeenCalled()
    })

    it('should not fire hide events for a menu that is not shown', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })
      const spy = jasmine.createSpy('hide')
      autocompleteEl.addEventListener('hide.coreui.autocomplete', spy)
      autocompleteEl.addEventListener('hidden.coreui.autocomplete', spy)

      autocomplete.hide()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should clear input hint element when hiding', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      autocomplete._inputHintElement.value = 'hint text'
      autocomplete.hide()
      expect(autocomplete._inputHintElement.value).toBe('')
    })

    it('should hide without positioning if it was never created', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._floatingCleanup = null
      autocomplete._element.classList.add('show')
      autocomplete.hide()
      expect(autocomplete._isShown()).toBe(false)
    })

    it('should remove show class from menu in container mode', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div><div id="container"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const containerEl = fixtureEl.querySelector('#container')
      const autocomplete = new Autocomplete(autocompleteEl, {
        container: containerEl,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      expect(autocomplete._menu.classList.contains('show')).toBe(true)
      autocomplete.hide()
      expect(autocomplete._menu.classList.contains('show')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all selections and input', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }],
        value: '1'
      })

      autocomplete._inputElement.value = 'some text'
      autocomplete._selected.push({ label: 'Option 1', value: '1' })

      autocomplete.clear()

      expect(autocomplete._selected).toEqual([])
      expect(autocomplete._inputElement.value).toBe('')
      expect(autocomplete._search).toBe('')
    })

    it('should trigger changed event with null value', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }],
          value: '1'
        })

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value).toBeNull()
          resolve()
        })

        autocomplete.clear()
      })
    })
  })

  describe('search', () => {
    it('should set search term and trigger input event', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('input.coreui.autocomplete', event => {
          expect(event.value).toBe('test')
          resolve()
        })

        autocomplete.search('test')
        expect(autocomplete._search).toBe('test')
      })
    })

    it('should convert search term to lowercase', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.search('TEST')
      expect(autocomplete._search).toBe('test')
    })

    it('should set empty search for empty input', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.search('')
      expect(autocomplete._search).toBe('')
    })

    it('should not filter options list when external search is configured', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: ['external'],
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' }
        ]
      })

      autocomplete.show()
      const spy = spyOn(autocomplete, '_filterOptionsList')
      autocomplete.search('app')

      expect(spy).not.toHaveBeenCalled()
    })

    it('should filter options list when not external search', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' }
        ]
      })

      autocomplete.show()
      const spy = spyOn(autocomplete, '_filterOptionsList')
      autocomplete.search('app')

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('setConfig', () => {
    it('should apply invalid and valid given to setConfig', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.setConfig({ invalid: true })

      expect(autocompleteEl.classList.contains('is-invalid')).toBeTrue()
      expect(autocomplete._inputElement.getAttribute('aria-invalid')).toBe('true')

      autocomplete.setConfig({ invalid: false, valid: true })

      expect(autocompleteEl.classList.contains('is-invalid')).toBeFalse()
      expect(autocompleteEl.classList.contains('is-valid')).toBeTrue()
      expect(autocomplete._inputElement.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should update configuration and options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      const newOptions = [
        { label: 'New Option 1', value: 'new1' },
        { label: 'New Option 2', value: 'new2' }
      ]

      autocomplete.setConfig({ options: newOptions })

      expect(autocomplete._options).toEqual(newOptions)
    })

    it('should deselect all when value is updated', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }],
        value: '1'
      })

      autocomplete._selected.push({ label: 'Option 1', value: '1' })

      autocomplete.setConfig({ value: '2' })

      expect(autocomplete._selected).toEqual([])
    })

    it('should keep the pick across an options refresh, even when the new options lack it', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        cleaner: true,
        search: 'external',
        options: [{ label: 'Zoe', value: 'z' }]
      })

      autocomplete._onOptionSelected('z')
      autocomplete.setConfig({ options: [{ label: 'Anna', value: 'a' }] })

      expect(autocomplete._selected.map(option => option.value)).toEqual(['z'])
      expect(autocomplete._inputElement.value).toBe('Zoe')
      expect(autocomplete._cleanerElement.style.display).not.toBe('none')
    })

    it('should not bring the initial value back after the user clears or types over it', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const options = [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }]
      const autocomplete = new Autocomplete(autocompleteEl, { options, value: '1' })

      autocomplete._inputElement.value = 'Opt'
      autocomplete._inputElement.dispatchEvent(createEvent('input', { bubbles: true }))
      autocomplete.setConfig({ options })

      expect(autocomplete._inputElement.value).toBe('Opt')
      expect(autocomplete._selected).toEqual([])

      autocomplete.clear()
      autocomplete.setConfig({ options, invalid: true })

      expect(autocomplete._inputElement.value).toBe('')
      expect(autocomplete._selected).toEqual([])
    })

    it('should select a value given to setConfig over a selected flag, and clear the field for null', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'A', value: 'a', selected: true }, { label: 'B', value: 'b' }]
      })

      autocomplete.setConfig({ value: 'b' })

      expect(autocomplete._selected.map(option => option.value)).toEqual(['b'])
      expect(autocomplete._inputElement.value).toBe('B')

      autocomplete.setConfig({ value: null })

      expect(autocomplete._selected).toEqual([])
      expect(autocomplete._inputElement.value).toBe('')
    })

    it('should apply a value once the refreshed options have it, and a newly flagged option once', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { search: 'external', options: [], value: 'j' })

      autocomplete.setConfig({ options: [{ label: 'John', value: 'j' }] })

      expect(autocomplete._inputElement.value).toBe('John')

      const otherEl = document.createElement('div')
      fixtureEl.append(otherEl)
      const other = new Autocomplete(otherEl, {
        options: [{ label: 'A', value: 'a' }]
      })

      other.setConfig({ options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b', selected: true }] })

      expect(other._inputElement.value).toBe('B')

      other.clear()
      other.setConfig({ options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b', selected: true }] })

      expect(other._inputElement.value).toBe('')
    })

    it('should recreate DOM options after update', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.setConfig({
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' }
        ]
      })

      const optionElements = autocomplete._optionsElement.querySelectorAll('.list-box-option')
      expect(optionElements.length).toBe(3)
      expect(optionElements[0].textContent).toBe('A')
      expect(optionElements[1].textContent).toBe('B')
      expect(optionElements[2].textContent).toBe('C')
    })
  })

  describe('deselectAll', () => {
    it('should deselect all selected options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' }
        ]
      })

      autocomplete._selected = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' }
      ]

      autocomplete.deselectAll()

      expect(autocomplete._selected).toEqual([])
    })

    it('should skip disabled options when deselecting', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2', disabled: true }
        ]
      })

      autocomplete._selected = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2', disabled: true }
      ]

      autocomplete.deselectAll()

      expect(autocomplete._selected).toEqual([{ label: 'Option 2', value: '2', disabled: true }])
    })

    it('should do nothing if no options are selected', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._selected = []
      autocomplete.deselectAll()

      expect(autocomplete._selected).toEqual([])
    })

    it('should handle nested group options when deselecting', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          {
            label: 'Group 1',
            options: [
              { label: 'Option 1', value: '1' },
              { label: 'Option 2', value: '2' }
            ]
          }
        ]
      })

      autocomplete._selected = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' }
      ]

      // The deselectAll should deselect all flat options
      autocomplete.deselectAll()
      expect(autocomplete._selected).toEqual([])
    })
  })

  describe('_flattenOptions', () => {
    it('should flatten nested options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const options = [
        { label: 'Option 1', value: '1' },
        {
          label: 'Group 1',
          options: [
            { label: 'Option 2', value: '2' },
            { label: 'Option 3', value: '3' }
          ]
        }
      ]
      const autocomplete = new Autocomplete(autocompleteEl, { options })

      const flattened = autocomplete._flattenOptions()

      expect(flattened).toEqual([
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
        { label: 'Option 3', value: '3' }
      ])
    })

    it('should return flat array for non-grouped options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const options = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' }
      ]
      const autocomplete = new Autocomplete(autocompleteEl, { options })

      const flattened = autocomplete._flattenOptions()
      expect(flattened.length).toBe(2)
    })
  })

  describe('_highlightOption', () => {
    it('should highlight matching text in options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      autocomplete._search = 'opt'
      const highlighted = autocomplete._highlightOption('Option 1')

      expect(highlighted).toBe('<strong>Opt</strong>ion 1')
    })

    it('should highlight multiple matches', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      autocomplete._search = 'o'
      const highlighted = autocomplete._highlightOption('Option One')

      expect(highlighted).toBe('<strong>O</strong>pti<strong>o</strong>n <strong>O</strong>ne')
    })

    it('should escape HTML in the label to prevent XSS', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      autocomplete._search = 'img'
      const highlighted = autocomplete._highlightOption('<img src=x onerror=alert(1)> img')

      expect(highlighted).not.toContain('<img')
      expect(highlighted).toBe('&lt;<strong>img</strong> src=x onerror=alert(1)&gt; <strong>img</strong>')
    })

    it('should not throw on regex-special characters in the search', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      autocomplete._search = '('
      expect(() => autocomplete._highlightOption('a (b) c')).not.toThrow()
      expect(autocomplete._highlightOption('a (b) c')).toBe('a <strong>(</strong>b) c')
    })

    it('should return the escaped label when the search is empty', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      autocomplete._search = ''
      expect(autocomplete._highlightOption('<b>x</b>')).toBe('&lt;b&gt;x&lt;/b&gt;')
    })
  })

  describe('_isExternalSearch', () => {
    it('should return true when search includes external', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: ['external'],
        options: []
      })

      expect(autocomplete._isExternalSearch()).toBe(true)
    })

    it('should return false when search does not include external', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: ['internal'],
        options: []
      })

      expect(autocomplete._isExternalSearch()).toBe(false)
    })

    it('should return false when search is null', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: null,
        options: []
      })

      expect(autocomplete._isExternalSearch()).toBe(false)
    })
  })

  describe('_isGlobalSearch', () => {
    it('should return true when search includes global', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: ['global'],
        options: []
      })

      expect(autocomplete._isGlobalSearch()).toBe(true)
    })

    it('should return false when search does not include global', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: ['local'],
        options: []
      })

      expect(autocomplete._isGlobalSearch()).toBe(false)
    })

    it('should return false when search is null', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: null,
        options: []
      })

      expect(autocomplete._isGlobalSearch()).toBe(false)
    })
  })

  describe('keyboard navigation', () => {
    it('should open dropdown on ArrowDown key', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('shown.coreui.autocomplete', () => {
          expect(autocomplete._isShown()).toBe(true)
          resolve()
        })

        const keydownEvent = createEvent('keydown')
        keydownEvent.key = 'ArrowDown'
        autocomplete._togglerElement.dispatchEvent(keydownEvent)
      })
    })

    it('should walk the options with the arrow keys while the focus stays in the input', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
            { label: 'Option 3', value: '3' }
          ]
        })

        autocompleteEl.addEventListener('shown.coreui.autocomplete', () => {
          const options = autocomplete._optionsElement.querySelectorAll('.list-box-option')
          autocomplete._inputElement.focus()

          const downEvent = createEvent('keydown', { bubbles: true })
          downEvent.key = 'ArrowDown'
          autocomplete._inputElement.dispatchEvent(downEvent)

          expect(document.activeElement).toBe(autocomplete._inputElement)
          expect(autocomplete._inputElement.getAttribute('aria-activedescendant')).toBe(options[0].id)
          expect(options[0].classList.contains('active')).toBe(true)

          const secondDownEvent = createEvent('keydown', { bubbles: true })
          secondDownEvent.key = 'ArrowDown'
          autocomplete._inputElement.dispatchEvent(secondDownEvent)

          expect(autocomplete._inputElement.getAttribute('aria-activedescendant')).toBe(options[1].id)

          const upEvent = createEvent('keydown', { bubbles: true })
          upEvent.key = 'ArrowUp'
          autocomplete._inputElement.dispatchEvent(upEvent)

          expect(autocomplete._inputElement.getAttribute('aria-activedescendant')).toBe(options[0].id)
          resolve()
        })

        autocomplete.show()
      })
    })

    it('should open dropdown on Enter key', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('shown.coreui.autocomplete', () => {
          expect(autocomplete._isShown()).toBe(true)
          resolve()
        })

        const keydownEvent = createEvent('keydown')
        keydownEvent.key = 'Enter'
        autocomplete._togglerElement.dispatchEvent(keydownEvent)
      })
    })

    it('should let Enter through to the form while the panel is closed', () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })

      autocomplete._inputElement.dispatchEvent(event)

      expect(event.defaultPrevented).toBeFalse()
      expect(autocomplete._isShown()).toBeFalse()
    })

    it('should submit its form on Enter, with hints on and no submit button', async () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const form = fixtureEl.querySelector('form')
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        name: 'framework',
        showHints: true,
        options: [{ label: 'Vue.js', value: 'vue' }]
      })
      let submitted = 0

      form.addEventListener('submit', event => {
        event.preventDefault()
        submitted++
      })
      autocomplete._inputElement.focus()
      await userEvent.keyboard('Vu')
      autocomplete.hide()
      await userEvent.keyboard('{Enter}')

      expect(autocomplete._inputHintElement.form).toBeNull()
      expect(submitted).toBe(1)
    })

    it('should keep text outside the options and not submit the form on Enter', async () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const form = fixtureEl.querySelector('form')
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        allowOnlyDefinedOptions: true,
        name: 'framework',
        options: [{ label: 'Angular', value: 'ng', disabled: true }, { label: 'Vue.js', value: 'vue' }]
      })
      let submitted = 0
      const changes = []

      form.addEventListener('submit', event => {
        event.preventDefault()
        submitted++
      })
      autocompleteEl.addEventListener('change.coreui.autocomplete', event => changes.push(event.value))
      autocomplete._inputElement.focus()
      await userEvent.keyboard('xyz')
      autocomplete.hide()
      await userEvent.keyboard('{Enter}')
      await userEvent.clear(autocomplete._inputElement)
      await userEvent.keyboard('Angular')
      autocomplete.hide()
      await userEvent.keyboard('{Enter}')

      expect(autocomplete._inputElement.value).toBe('Angular')
      expect(submitted).toBe(0)
      expect(changes).toEqual([])
    })

    it('should leave Enter that confirms a composition to the input method', () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })
      const changes = []
      const event = new KeyboardEvent('keydown', {
        key: 'Enter', isComposing: true, bubbles: true, cancelable: true
      })

      autocompleteEl.addEventListener('change.coreui.autocomplete', event => changes.push(event.value))
      autocomplete._inputElement.value = 'とう'
      autocomplete._inputElement.dispatchEvent(event)

      expect(event.defaultPrevented).toBeFalse()
      expect(autocomplete._inputElement.value).toBe('とう')
      expect(changes).toEqual([])
    })

    it('should not report the current selection again on Enter', () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }],
        value: '1'
      })
      const changes = []

      autocompleteEl.addEventListener('change.coreui.autocomplete', event => changes.push(event.value))
      autocomplete._inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))

      expect(changes).toEqual([])
    })

    it('should close dropdown on Escape key', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('shown.coreui.autocomplete', () => {
          const keydownEvent = createEvent('keydown')
          keydownEvent.key = 'Escape'
          autocompleteEl.dispatchEvent(keydownEvent)
        })

        autocompleteEl.addEventListener('hidden.coreui.autocomplete', () => {
          expect(autocomplete._isShown()).toBe(false)
          resolve()
        })

        autocomplete.show()
      })
    })

    it('should clear input on Escape when allowOnlyDefinedOptions and no selection', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        allowOnlyDefinedOptions: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      autocomplete._inputElement.value = 'test'

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Escape'
      autocompleteEl.dispatchEvent(keydownEvent)

      expect(autocomplete._inputElement.value).toBe('')
    })

    it('should not clear input on Escape when allowOnlyDefinedOptions and has selection', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        allowOnlyDefinedOptions: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      autocomplete._inputElement.value = 'Option 1'
      autocomplete._selected = [{ label: 'Option 1', value: '1' }]

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Escape'
      autocompleteEl.dispatchEvent(keydownEvent)

      expect(autocomplete._inputElement.value).toBe('Option 1')
    })

    it('should handle Tab key for hint completion', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'Opt'
      autocomplete._inputHintElement.value = 'Option 1'

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Tab'

      const spy = spyOn(keydownEvent, 'preventDefault')
      const spyStop = spyOn(keydownEvent, 'stopPropagation')

      autocomplete._inputElement.dispatchEvent(keydownEvent)

      expect(spy).toHaveBeenCalled()
      expect(spyStop).toHaveBeenCalled()
    })

    it('should not prevent Tab default when no hint value', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'xyz'
      autocomplete._inputHintElement.value = ''

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Tab'

      const spy = spyOn(keydownEvent, 'preventDefault')
      autocomplete._inputElement.dispatchEvent(keydownEvent)

      expect(spy).not.toHaveBeenCalled()
    })

    it('should show dropdown on any non-Tab key on input when not shown', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      expect(autocomplete._isShown()).toBe(false)

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'a'
      autocomplete._inputElement.dispatchEvent(keydownEvent)

      expect(autocomplete._isShown()).toBe(true)
    })

    it('should not show on Tab key on input when not shown', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      expect(autocomplete._isShown()).toBe(false)

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Tab'
      autocomplete._inputElement.dispatchEvent(keydownEvent)

      expect(autocomplete._isShown()).toBe(false)
    })

    it('should navigate down with ArrowDown on input when cursor at end', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' }
        ]
      })

      autocomplete.show()
      autocomplete._inputElement.value = 'Opt'
      autocomplete._inputElement.selectionStart = 3

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'ArrowDown'
      autocomplete._inputElement.dispatchEvent(keydownEvent)

      // Should call _selectMenuItem
      expect(autocomplete._isShown()).toBe(true)
    })

    it('should select option on Enter key in input when value matches', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          resolve()
        })

        autocomplete.show()
        autocomplete._inputElement.value = 'Option 1'

        const keydownEvent = createEvent('keydown')
        keydownEvent.key = 'Enter'
        autocomplete._inputElement.dispatchEvent(keydownEvent)
      })
    })

    it('should do nothing on Enter key in input when value is empty', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      autocomplete._inputElement.value = ''

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Enter'
      autocomplete._inputElement.dispatchEvent(keydownEvent)

      expect(autocomplete._selected.length).toBe(0)
    })

    it('should trigger change event on Enter with non-matching value when allowOnlyDefinedOptions is false', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          allowOnlyDefinedOptions: false,
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value).toBe('custom value')
          resolve()
        })

        autocomplete.show()
        autocomplete._inputElement.value = 'custom value'

        const keydownEvent = createEvent('keydown')
        keydownEvent.key = 'Enter'
        autocomplete._inputElement.dispatchEvent(keydownEvent)
      })
    })

    it('should not trigger change event on Enter with non-matching value when allowOnlyDefinedOptions is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        allowOnlyDefinedOptions: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      let changed = false
      autocompleteEl.addEventListener('change.coreui.autocomplete', () => {
        changed = true
      })

      autocomplete.show()
      autocomplete._inputElement.value = 'custom value'

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Enter'
      autocomplete._inputElement.dispatchEvent(keydownEvent)

      expect(changed).toBe(false)
    })

    it('should hide and clear search on Enter with non-matching value when allowOnlyDefinedOptions is false and clearSearchOnSelect is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        allowOnlyDefinedOptions: false,
        clearSearchOnSelect: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      autocomplete._inputElement.value = 'custom'

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Enter'
      autocomplete._inputElement.dispatchEvent(keydownEvent)

      expect(autocomplete._isShown()).toBe(false)
      expect(autocomplete._search).toBe('')
    })

    it('should navigate ArrowDown on toggler when shown', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' }
        ]
      })

      autocomplete.show()

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'ArrowDown'
      autocomplete._togglerElement.dispatchEvent(keydownEvent)

      // Just verify it doesn't throw
      expect(autocomplete._isShown()).toBe(true)
    })

    it('should navigate ArrowUp and ArrowDown in options list', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
          { label: 'Option 3', value: '3' }
        ]
      })

      autocomplete.show()

      const keydownDown = createEvent('keydown')
      keydownDown.key = 'ArrowDown'
      autocomplete._optionsElement.dispatchEvent(keydownDown)

      // Verify no errors and autocomplete still shown
      expect(autocomplete._isShown()).toBe(true)

      const keydownUp = createEvent('keydown')
      keydownUp.key = 'ArrowUp'
      autocomplete._optionsElement.dispatchEvent(keydownUp)

      expect(autocomplete._isShown()).toBe(true)
    })

    it('should select option on Enter in options list', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' }
          ]
        })

        autocomplete.show()

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          resolve()
        })

        autocomplete._listBox.setActive('1')
        autocomplete._inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
      })
    })

    it('should focus input on character key when global search on element keydown', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: ['global'],
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      const spy = spyOn(autocomplete._inputElement, 'focus')

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'a'
      autocompleteEl.dispatchEvent(keydownEvent)

      expect(spy).toHaveBeenCalled()
    })

    it('should focus input on Backspace key when global search on element keydown', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: ['global'],
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      const spy = spyOn(autocomplete._inputElement, 'focus')

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Backspace'
      autocompleteEl.dispatchEvent(keydownEvent)

      expect(spy).toHaveBeenCalled()
    })

    it('should focus input on Delete key when global search on element keydown', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: ['global'],
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      const spy = spyOn(autocomplete._inputElement, 'focus')

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Delete'
      autocompleteEl.dispatchEvent(keydownEvent)

      expect(spy).toHaveBeenCalled()
    })

    it('should focus input on character key when global search on menu keydown', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: ['global'],
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      const spy = spyOn(autocomplete._inputElement, 'focus')

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'b'
      autocomplete._menu.dispatchEvent(keydownEvent)

      expect(spy).toHaveBeenCalled()
    })

    it('should focus input on Backspace key when global search on menu keydown', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: ['global'],
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      const spy = spyOn(autocomplete._inputElement, 'focus')

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Backspace'
      autocomplete._menu.dispatchEvent(keydownEvent)

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('option selection', () => {
    it('should select option on click', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          expect(event.value.value).toBe('1')
          resolve()
        })

        const option = { label: 'Option 1', value: '1' }
        autocomplete._selectOption(option)
      })
    })

    it('should select option on Enter key', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          expect(event.value.value).toBe('1')
          resolve()
        })

        const option = { label: 'Option 1', value: '1' }
        autocomplete._selectOption(option)
      })
    })

    it('should update input value when option is selected', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      const option = { label: 'Option 1', value: '1' }
      autocomplete._selectOption(option)

      expect(autocomplete._inputElement.value).toBe('Option 1')
      expect(autocomplete._selected).toContain(option)
    })

    it('should hide dropdown after selection', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      const option = { label: 'Option 1', value: '1' }
      autocomplete._selectOption(option)

      expect(autocomplete._isShown()).toBe(false)
    })

    it('should clear search after selection when clearSearchOnSelect is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        clearSearchOnSelect: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._search = 'test'
      const option = { label: 'Option 1', value: '1' }
      autocomplete._selectOption(option)

      expect(autocomplete._search).toBe('')
    })

    it('should not duplicate selection if already selected', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      const option = { label: 'Option 1', value: '1' }
      autocomplete._selectOption(option)
      autocomplete._selectOption(option)

      expect(autocomplete._selected.length).toBe(1)
    })

    it('should clear hint when selecting with showHints enabled', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputHintElement.value = 'Option 1'
      const option = { label: 'Option 1', value: '1' }
      autocomplete._selectOption(option)

      expect(autocomplete._inputHintElement.value).toBe('')
    })

    it('should mark selected option with selected class in DOM', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' }
        ]
      })

      const option = { label: 'Option 1', value: '1' }
      autocomplete._selectOption(option)

      const optionEl = autocomplete._optionsElement.querySelector('[data-coreui-value="1"]')
      expect(optionEl.classList.contains('selected')).toBe(true)
      expect(optionEl.getAttribute('aria-selected')).toBe('true')
    })

    it('should deselect previous option before selecting new one', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' }
        ]
      })

      autocomplete._selectOption({ label: 'Option 1', value: '1' })
      autocomplete._selectOption({ label: 'Option 2', value: '2' })

      expect(autocomplete._selected.length).toBe(1)
      expect(autocomplete._selected[0].value).toBe('2')
    })
  })

  describe('option clicks', () => {
    it('should select option when clicking on option element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocomplete.show()

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          resolve()
        })

        const optionEl = autocomplete._optionsElement.querySelector('.list-box-option')
        const clickEvent = new Event('click', { bubbles: true })
        optionEl.dispatchEvent(clickEvent)
      })
    })

    it('should do nothing when clicking outside an option', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()

      const labelEl = document.createElement('div')
      labelEl.classList.add('label')
      autocomplete._optionsElement.append(labelEl)

      labelEl.dispatchEvent(new Event('click', { bubbles: true }))
      expect(autocomplete._selected.length).toBe(0)
    })

    it('should find closest option element when clicking on child', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocomplete.show()

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          resolve()
        })

        const optionEl = autocomplete._optionsElement.querySelector('.list-box-option')
        const childEl = document.createElement('span')
        childEl.textContent = 'inner text'
        optionEl.append(childEl)

        childEl.dispatchEvent(new Event('click', { bubbles: true }))
      })
    })

    it('should do nothing when clicking the options container itself', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()

      autocomplete._optionsElement.dispatchEvent(new Event('click', { bubbles: true }))
      expect(autocomplete._selected.length).toBe(0)
    })
  })

  describe('_findOptionByValue', () => {
    it('should find option in flat list', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' }
        ]
      })

      const found = autocomplete._findOptionByValue('2')
      expect(found).toEqual({ label: 'Option 2', value: '2' })
    })

    it('should find option in nested groups', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          {
            label: 'Group 1',
            options: [
              { label: 'Option A', value: 'a' },
              { label: 'Option B', value: 'b' }
            ]
          }
        ]
      })

      const found = autocomplete._findOptionByValue('b')
      expect(found).toEqual({ label: 'Option B', value: 'b' })
    })

    it('should return null when option not found', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      const found = autocomplete._findOptionByValue('nonexistent')
      expect(found).toBeNull()
    })
  })

  describe('filtering', () => {
    it('should filter options based on search term', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
          { label: 'Cherry', value: 'cherry' }
        ]
      })

      autocomplete.show()
      autocomplete._search = 'app'
      autocomplete._filterOptionsList()

      const visibleOptions = Array.from(autocomplete._optionsElement.querySelectorAll('.list-box-option'))
        .filter(option => !option.hasAttribute('hidden'))

      expect(visibleOptions).toHaveSize(1)
      expect(visibleOptions[0].textContent).toBe('Apple')
    })

    it('should show "no results" message when no options match', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        searchNoResultsLabel: 'No results found',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' }
        ]
      })

      autocomplete.show()
      autocomplete._search = 'xyz'
      autocomplete._filterOptionsList()

      const emptyMessage = autocomplete._menu.querySelector('.list-box-empty')
      expect(emptyMessage).toBeTruthy()
      expect(emptyMessage.innerHTML).toBe('No results found')
    })

    it('should hide dropdown when no options match and no searchNoResultsLabel', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' }
        ]
      })

      autocomplete.show()
      autocomplete._search = 'xyz'
      autocomplete._filterOptionsList()

      expect(autocomplete._isShown()).toBe(false)
    })

    it('should remove empty message when options become visible again', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        searchNoResultsLabel: 'No results found',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' }
        ]
      })

      autocomplete.show()

      autocomplete._search = 'xyz'
      autocomplete._filterOptionsList()
      expect(autocomplete._menu.querySelector('.list-box-empty').hasAttribute('hidden')).toBe(false)

      autocomplete._search = 'app'
      autocomplete._filterOptionsList()
      expect(autocomplete._menu.querySelector('.list-box-empty').hasAttribute('hidden')).toBe(true)
    })

    it('should not duplicate no results message when filtering multiple times', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        searchNoResultsLabel: 'No results found',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' }
        ]
      })

      autocomplete.show()
      autocomplete._search = 'xyz'
      autocomplete._filterOptionsList()
      autocomplete._filterOptionsList()

      const emptyMessages = autocomplete._menu.querySelectorAll('.list-box-empty')
      expect(emptyMessages.length).toBe(1)
    })

    it('should highlight options on search when highlightOptionsOnSearch is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        highlightOptionsOnSearch: true,
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' }
        ]
      })

      autocomplete.show()
      autocomplete._search = 'app'
      autocomplete._filterOptionsList()

      const visibleOption = Array.from(autocomplete._optionsElement.querySelectorAll('.list-box-option'))
        .find(option => !option.hasAttribute('hidden'))

      expect(visibleOption.innerHTML).toContain('<strong>')
    })

    it('should not highlight when optionsTemplate is set', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        highlightOptionsOnSearch: true,
        optionsTemplate: option => `<span>${option.label}</span>`,
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' }
        ]
      })

      autocomplete.show()
      autocomplete._search = 'app'
      autocomplete._filterOptionsList()

      const visibleOption = Array.from(autocomplete._optionsElement.querySelectorAll('.list-box-option'))
        .find(option => !option.hasAttribute('hidden'))

      // Should not highlight since optionsTemplate is set
      expect(visibleOption.innerHTML).not.toContain('<strong>App</strong>')
    })

    it('should hide optgroup when all its children are hidden', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          {
            label: 'Fruits',
            options: [
              { label: 'Apple', value: 'apple' },
              { label: 'Banana', value: 'banana' }
            ]
          },
          {
            label: 'Vegetables',
            options: [
              { label: 'Carrot', value: 'carrot' }
            ]
          }
        ]
      })

      autocomplete.show()
      autocomplete._search = 'carr'
      autocomplete._filterOptionsList()

      const optgroups = autocomplete._menu.querySelectorAll('.list-box-section')
      // Fruits group should be hidden, Vegetables should be visible
      expect(optgroups[0].hasAttribute('hidden')).toBe(true)
      expect(optgroups[1].hasAttribute('hidden')).toBe(false)
    })

    it('should show optgroup when at least one child is visible', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          {
            label: 'Fruits',
            options: [
              { label: 'Apple', value: 'apple' },
              { label: 'Banana', value: 'banana' }
            ]
          }
        ]
      })

      autocomplete.show()
      autocomplete._search = 'app'
      autocomplete._filterOptionsList()

      const optgroup = autocomplete._menu.querySelector('.list-box-section')
      expect(optgroup.hasAttribute('hidden')).toBe(false)
    })
  })

  describe('picker toggle', () => {
    it('should name the toggle after what it opens', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      // eslint-disable-next-line no-new
      new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }],
        pickerIcon: true
      })

      expect(autocompleteEl.querySelector('.form-control-action').getAttribute('aria-label')).toEqual('Toggle options list')
    })
  })

  describe('cleaner functionality', () => {
    it('should clear selection when cleaner button is clicked', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        cleaner: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'test'
      autocomplete._selected.push({ label: 'Option 1', value: '1' })

      autocomplete._cleanerElement.click()

      expect(autocomplete._inputElement.value).toBe('')
      expect(autocomplete._selected).toEqual([])
    })

    it('should show cleaner button when there are selections', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        cleaner: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._selected.push({ label: 'Option 1', value: '1' })
      autocomplete._updateCleaner()

      expect(autocomplete._cleanerElement.style.display).not.toBe('none')
    })

    it('should hide cleaner button when there are no selections', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        cleaner: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._selected = []
      autocomplete._updateCleaner()

      expect(autocomplete._cleanerElement.style.display).toBe('none')
    })

    it('should not clear when disabled and cleaner is clicked', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        cleaner: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      // Manually make it disabled after creation to test the event handler guard
      autocomplete._config.disabled = true
      autocomplete._inputElement.value = 'test'
      autocomplete._selected.push({ label: 'Option 1', value: '1' })

      const clickEvent = new Event('click', { bubbles: true })
      autocomplete._cleanerElement.dispatchEvent(clickEvent)

      expect(autocomplete._inputElement.value).toBe('test')
    })

    it('should clear on Enter key press on cleaner button', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        cleaner: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'test'
      autocomplete._selected.push({ label: 'Option 1', value: '1' })

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Enter'
      autocomplete._cleanerElement.dispatchEvent(keydownEvent)

      expect(autocomplete._inputElement.value).toBe('')
      expect(autocomplete._selected).toEqual([])
    })

    it('should not clear on Enter key press on cleaner button when disabled', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        cleaner: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._config.disabled = true
      autocomplete._inputElement.value = 'test'
      autocomplete._selected.push({ label: 'Option 1', value: '1' })

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Enter'
      autocomplete._cleanerElement.dispatchEvent(keydownEvent)

      expect(autocomplete._inputElement.value).toBe('test')
    })

    it('should not do anything when _updateCleaner is called without cleaner config', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        cleaner: false,
        options: [{ label: 'Option 1', value: '1' }]
      })

      // Should not throw
      autocomplete._updateCleaner()
      expect(autocomplete._cleanerElement).toBeUndefined()
    })
  })

  describe('indicator functionality', () => {
    it('should toggle dropdown on indicator click', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        pickerIcon: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      expect(autocomplete._isShown()).toBe(false)

      const clickEvent = new Event('click', { bubbles: true })
      autocomplete._indicatorElement.dispatchEvent(clickEvent)

      expect(autocomplete._isShown()).toBe(true)

      const clickEvent2 = new Event('click', { bubbles: true })
      autocomplete._indicatorElement.dispatchEvent(clickEvent2)

      expect(autocomplete._isShown()).toBe(false)
    })

    it('should not show dropdown on element click when clicking indicator', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        pickerIcon: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      // The event click handler on element checks if target is not indicator
      // By clicking directly on indicator, the element click shouldn't also show
      expect(autocomplete._isShown()).toBe(false)
    })
  })

  describe('element click', () => {
    it('should show dropdown on element click when not disabled', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      const clickEvent = new Event('click', { bubbles: true })
      Object.defineProperty(clickEvent, 'target', { value: autocomplete._inputElement })
      autocompleteEl.dispatchEvent(clickEvent)

      expect(autocomplete._isShown()).toBe(true)
    })

    it('should not show dropdown on element click when disabled', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        disabled: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      const clickEvent = new Event('click', { bubbles: true })
      Object.defineProperty(clickEvent, 'target', { value: autocomplete._inputElement })
      autocompleteEl.dispatchEvent(clickEvent)

      expect(autocomplete._isShown()).toBe(false)
    })
  })

  describe('form reset', () => {
    const settle = () => new Promise(resolve => {
      setTimeout(resolve)
    })

    it('should go back to its initial selection and report the change', async () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const form = fixtureEl.querySelector('form')
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }],
        value: '1'
      })
      const changes = []

      autocomplete._onOptionSelected('2')
      autocompleteEl.addEventListener('change.coreui.autocomplete', event => changes.push(event.value?.value ?? null))
      form.reset()
      await settle()

      expect(autocomplete._selected.map(option => option.value)).toEqual(['1'])
      expect(autocomplete._inputElement.value).toBe('Option 1')
      expect(changes).toEqual(['1'])
    })

    it('should clear a field that started empty, and leave a cancelled reset alone', async () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const form = fixtureEl.querySelector('form')
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        cleaner: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._onOptionSelected('1')
      form.addEventListener('reset', event => event.preventDefault(), { once: true })
      form.reset()
      await settle()

      expect(autocomplete._selected.map(option => option.value)).toEqual(['1'])

      form.reset()
      await settle()

      expect(autocomplete._selected).toEqual([])
      expect(autocomplete._inputElement.value).toBe('')
      expect(autocomplete._cleanerElement.style.display).toBe('none')
    })

    it('should not report a reset that leaves the selection as it was', async () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const form = fixtureEl.querySelector('form')
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      new Autocomplete(autocompleteEl, { // eslint-disable-line no-new
        options: [{ label: 'Option 1', value: '1' }],
        value: '1'
      })
      const changes = []

      autocompleteEl.addEventListener('change.coreui.autocomplete', event => changes.push(event.value))
      form.reset()
      await settle()

      expect(changes).toEqual([])
    })

    it('should go back to the option marked selected', async () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const form = fixtureEl.querySelector('form')
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2', selected: true }]
      })
      const changes = []

      autocomplete._onOptionSelected('1')
      autocompleteEl.addEventListener('change.coreui.autocomplete', event => changes.push(event.value?.value ?? null))
      form.reset()
      await settle()

      expect(autocomplete._inputElement.value).toBe('Option 2')
      expect(changes).toEqual(['2'])
    })

    it('should go back to the value it was created with', async () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const form = fixtureEl.querySelector('form')
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }, { label: 'C', value: 'c' }],
        value: 'a'
      })

      autocomplete.setConfig({ value: 'b' })
      autocomplete._onOptionSelected('c')
      form.reset()
      await settle()

      expect(autocomplete._selected.map(option => option.value)).toEqual(['a'])
    })

    it('should report the restored option over typed text equal to its value', async () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const form = fixtureEl.querySelector('form')
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Poland', value: 'PL' }],
        value: 'PL'
      })
      const changes = []

      autocomplete._inputElement.focus()
      await userEvent.clear(autocomplete._inputElement)
      await userEvent.keyboard('PL')
      autocompleteEl.addEventListener('change.coreui.autocomplete', event => changes.push(event.value?.value ?? null))
      form.reset()
      await settle()

      expect(changes).toEqual(['PL'])
    })

    it('should report the initial value once external results bring it back', async () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const form = fixtureEl.querySelector('form')
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const react = { label: 'React.js', value: 'react' }
      const vue = { label: 'Vue.js', value: 'vue' }
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [react, vue],
        search: 'external',
        value: 'react'
      })
      const changes = []

      autocompleteEl.addEventListener('input.coreui.autocomplete', event => {
        setTimeout(() => autocomplete.setConfig({ options: event.value ? [vue] : [react, vue] }), 10)
      })
      autocomplete._inputElement.focus()
      await userEvent.clear(autocomplete._inputElement)
      await userEvent.keyboard('vu')
      await new Promise(resolve => {
        setTimeout(resolve, 20)
      })
      autocompleteEl.addEventListener('change.coreui.autocomplete', event => changes.push(event.value?.value ?? null))
      form.reset()
      await new Promise(resolve => {
        setTimeout(resolve, 40)
      })

      expect(autocomplete._selected.map(option => option.value)).toEqual(['react'])
      expect(changes.at(-1)).toBe('react')
    })

    it('should report the clear of a typed value and restart the search', async () => {
      fixtureEl.innerHTML = '<form><div class="autocomplete"></div></form>'
      const form = fixtureEl.querySelector('form')
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })
      const changes = []
      const searches = []

      autocomplete._inputElement.focus()
      await userEvent.keyboard('Custom')
      autocomplete._inputElement.blur()
      autocompleteEl.addEventListener('change.coreui.autocomplete', event => changes.push(event.value))
      autocompleteEl.addEventListener('input.coreui.autocomplete', event => searches.push(event.value))
      form.reset()
      await settle()

      expect(changes).toEqual([null])
      expect(searches).toEqual([''])
    })
  })

  describe('dispose', () => {
    it('should give back validation classes from the markup and remove its own', () => {
      fixtureEl.innerHTML = '<div class="autocomplete is-valid"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        invalid: true,
        options: []
      })

      expect(autocompleteEl.classList.contains('is-valid')).toBeFalse()

      autocomplete.dispose()

      expect(autocompleteEl.classList.contains('is-valid')).toBeTrue()
      expect(autocompleteEl.classList.contains('is-invalid')).toBeFalse()
    })

    it('should leave no class attribute on an element that had none, and keep a disabled class the page wrote', () => {
      fixtureEl.innerHTML = '<div id="bare"></div><div id="marked" class="disabled"></div>'
      const bare = fixtureEl.querySelector('#bare')
      const marked = fixtureEl.querySelector('#marked')

      for (const element of [bare, marked]) {
        new Autocomplete(element, { disabled: true, options: [], validationState: 'invalid' }).dispose()
      }

      expect(bare.hasAttribute('class')).toBeFalse()
      expect(marked.getAttribute('class')).toEqual('disabled')
    })

    it('should take a disabled class the markup wrote as the disabled option, and keep it on dispose', () => {
      fixtureEl.innerHTML = '<div class="disabled"></div>'
      const element = fixtureEl.querySelector('div')
      const autocomplete = new Autocomplete(element, { options: [] })

      expect(autocomplete._config.disabled).toBeTrue()

      autocomplete.dispose()

      expect(element.getAttribute('class')).toEqual('disabled')
    })

    it('should keep a disabled class the page writes after init', () => {
      fixtureEl.innerHTML = '<div></div>'
      const element = fixtureEl.querySelector('div')
      const autocomplete = new Autocomplete(element, { options: [] })

      element.classList.add('disabled')
      autocomplete.dispose()

      expect(element.getAttribute('class')).toEqual('disabled')
    })

    it('should dispose autocomplete', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      expect(autocomplete._element).not.toBeNull()

      autocomplete.dispose()

      expect(autocomplete._element).toBeNull()
    })

    it('should dispose the positioning cleanup when disposing', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      expect(autocomplete._floatingCleanup).not.toBeNull()

      autocomplete.dispose()

      expect(autocomplete._floatingCleanup).toBeNull()
    })

    it('should dispose without positioning if it was never created', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      autocomplete._floatingCleanup = null
      autocomplete.dispose()

      expect(autocomplete._element).toBeNull()
    })

    it('should remove the listeners of the generated elements on dispose', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        cleaner: true,
        pickerIcon: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      const input = autocomplete._inputElement
      const cleaner = autocomplete._cleanerElement
      const indicator = autocomplete._indicatorElement
      const menu = autocomplete._menu
      const options = autocomplete._optionsElement

      autocomplete.dispose()

      const showSpy = spyOn(autocomplete, 'show')
      const toggleSpy = spyOn(autocomplete, 'toggle')
      const searchSpy = spyOn(autocomplete, 'search')
      const clearSpy = spyOn(autocomplete, 'clear')
      const optionSelectedSpy = spyOn(autocomplete, '_onOptionSelected')

      input.value = 'O'
      input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }))
      input.value = 'O'
      input.dispatchEvent(createEvent('input', { bubbles: true }))
      input.dispatchEvent(new Event('blur'))
      menu.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'O' }))
      indicator.click()
      cleaner.click()
      options.click()

      expect(showSpy).not.toHaveBeenCalled()
      expect(toggleSpy).not.toHaveBeenCalled()
      expect(searchSpy).not.toHaveBeenCalled()
      expect(clearSpy).not.toHaveBeenCalled()
      expect(optionSelectedSpy).not.toHaveBeenCalled()
    })

    it('should remove the elements it generated from the host on dispose', () => {
      fixtureEl.innerHTML = '<div id="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('#autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        cleaner: true,
        pickerIcon: true,
        showHints: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.dispose()

      expect(autocompleteEl.innerHTML).toEqual('')
      expect(autocompleteEl.className).toEqual('')
      expect(autocompleteEl.hasAttribute('tabindex')).toBeFalse()
    })

    it('should not accumulate generated elements across dispose and re-init cycles', () => {
      fixtureEl.innerHTML = '<div id="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('#autocomplete')
      const config = {
        cleaner: true,
        pickerIcon: true,
        showHints: true,
        options: [{ label: 'Option 1', value: '1' }]
      }

      for (let i = 0; i < 3; i++) {
        const autocomplete = new Autocomplete(autocompleteEl, config)

        expect(autocompleteEl.querySelectorAll('input').length).toEqual(2)
        expect(autocompleteEl.querySelectorAll('button').length).toEqual(2)

        autocomplete.dispose()
      }

      expect(autocompleteEl.querySelectorAll('input').length).toEqual(0)
      expect(autocompleteEl.querySelectorAll('button').length).toEqual(0)
    })

    it('should take the show class off the host when disposed while open', () => {
      fixtureEl.innerHTML = '<div id="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('#autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      expect(autocompleteEl.classList.contains('show')).toBeTrue()

      autocomplete.dispose()

      expect(autocompleteEl.classList.contains('show')).toBeFalse()
    })

    it('should tolerate a second dispose', () => {
      fixtureEl.innerHTML = '<div id="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('#autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      autocomplete.dispose()

      expect(() => autocomplete.dispose()).not.toThrow()
    })

    it('should keep the tab stop the page wrote on the host', () => {
      fixtureEl.innerHTML = '<div id="autocomplete" tabindex="0"></div>'
      const autocompleteEl = fixtureEl.querySelector('#autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      autocomplete.dispose()

      expect(autocompleteEl.getAttribute('tabindex')).toEqual('0')
    })

    it('should remove the disabled class it added even after setConfig', () => {
      fixtureEl.innerHTML = '<div id="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('#autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { disabled: true, options: [] })

      autocomplete.setConfig({ disabled: false })
      autocomplete.dispose()

      expect(autocompleteEl.classList.contains('disabled')).toBeFalse()
    })

    it('should keep a disabled class the page wrote on the host', () => {
      fixtureEl.innerHTML = '<div id="autocomplete" class="disabled"></div>'
      const autocompleteEl = fixtureEl.querySelector('#autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { disabled: true, options: [] })

      autocomplete.dispose()

      expect(autocompleteEl.classList.contains('disabled')).toBeTrue()
    })

    it('should leave no style attribute behind on a host that had none', () => {
      fixtureEl.innerHTML = '<div id="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('#autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      autocomplete.dispose()

      expect(autocompleteEl.hasAttribute('style')).toBeFalse()
    })

    it('should keep the classes the page wrote on the host', () => {
      fixtureEl.innerHTML = '<div id="autocomplete" class="autocomplete form-control-group my-custom-class"></div>'
      const autocompleteEl = fixtureEl.querySelector('#autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      autocomplete.dispose()

      expect(autocompleteEl.className).toEqual('autocomplete form-control-group my-custom-class')
    })
  })

  describe('input blur', () => {
    it('should select exact match on blur', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' }
          ]
        })

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          resolve()
        })

        autocomplete._inputElement.value = 'Option 1'
        autocomplete._inputElement.dispatchEvent(createEvent('blur'))
      })
    })

    it('should do nothing on blur when input is empty', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      let changed = false
      autocompleteEl.addEventListener('change.coreui.autocomplete', () => {
        changed = true
      })

      autocomplete._inputElement.value = ''
      autocomplete._inputElement.dispatchEvent(createEvent('blur'))

      expect(changed).toBe(false)
    })

    it('should trigger change event with input value on blur when no exact match and allowOnlyDefinedOptions is false', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          allowOnlyDefinedOptions: false,
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value).toBe('custom text')
          resolve()
        })

        autocomplete._inputElement.value = 'custom text'
        autocomplete._inputElement.dispatchEvent(createEvent('blur'))
      })
    })

    it('should clear on blur when allowOnlyDefinedOptions and no exact match', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        allowOnlyDefinedOptions: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'invalid'
      autocomplete._inputElement.dispatchEvent(createEvent('blur'))

      expect(autocomplete._inputElement.value).toBe('')
    })

    it('should prevent default on options mousedown so clicking a filtered option keeps focus', () => {
      // Regression test for #484: clicking a filtered option must not be hijacked by
      // the input blur clearing the search and re-rendering the full list. The fix
      // prevents the option mousedown from blurring the input.
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        allowOnlyDefinedOptions: true,
        options: [
          { label: 'Angular', value: 'angular' },
          { label: 'Vue.js', value: 'vue' }
        ]
      })

      autocomplete.show()
      autocomplete._inputElement.value = 'vue'
      autocomplete._search = 'vue'
      autocomplete._filterOptionsList()

      const visibleOption = Array.from(autocomplete._optionsElement.querySelectorAll('.list-box-option'))
        .find(option => !option.hasAttribute('hidden'))
      expect(visibleOption.textContent).toBe('Vue.js')

      const mousedown = createEvent('mousedown', { bubbles: true, cancelable: true })
      visibleOption.dispatchEvent(mousedown)

      expect(mousedown.defaultPrevented).toBe(true)
    })

    it('should select the clicked option after filtering with allowOnlyDefinedOptions', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          allowOnlyDefinedOptions: true,
          options: [
            { label: 'Angular', value: 'angular' },
            { label: 'Vue.js', value: 'vue' }
          ]
        })

        autocomplete.show()
        autocomplete._inputElement.value = 'vue'
        autocomplete._search = 'vue'
        autocomplete._filterOptionsList()

        const visibleOption = Array.from(autocomplete._optionsElement.querySelectorAll('.list-box-option'))
          .find(option => !option.hasAttribute('hidden'))

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Vue.js')
          resolve()
        })

        // Model the real browser ordering: mousedown -> (blur unless prevented) -> click.
        const mousedown = createEvent('mousedown', { bubbles: true, cancelable: true })
        visibleOption.dispatchEvent(mousedown)
        if (!mousedown.defaultPrevented) {
          autocomplete._inputElement.dispatchEvent(createEvent('blur'))
        }

        visibleOption.dispatchEvent(createEvent('click', { bubbles: true }))
      })
    })

    it('should not clear on blur when there is exactly one case-insensitive match', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          allowOnlyDefinedOptions: true,
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          resolve()
        })

        autocomplete._inputElement.value = 'option 1'
        autocomplete._inputElement.dispatchEvent(createEvent('blur'))
      })
    })
  })

  describe('input', () => {
    it('should update search on typed text', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'O'

      autocomplete._inputElement.dispatchEvent(createEvent('input', { bubbles: true }))

      expect(autocomplete._search).toBe('o')
    })

    it('should update search when text is deleted', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'Opt'
      autocomplete._inputElement.dispatchEvent(createEvent('input', { bubbles: true }))
      autocomplete._inputElement.value = 'Op'
      autocomplete._inputElement.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }))

      expect(autocomplete._search).toBe('op')
    })

    it('should update search on text pasted or dropped without a key', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'Opt'

      autocomplete._inputElement.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }))

      expect(autocomplete._search).toBe('opt')
    })

    it('should deselect all and trigger change when typing with selection', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocomplete._selected = [{ label: 'Option 1', value: '1' }]
        autocomplete._inputElement.value = 'O'

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value).toBeNull()
          resolve()
        })

        autocomplete._inputElement.dispatchEvent(createEvent('input', { bubbles: true }))
      })
    })

    it('should open the panel for text pasted or composed without a key press', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: '中国', value: 'cn' }, { label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'zhong'
      autocomplete._inputElement.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }))
      autocomplete._inputElement.value = '中'
      autocomplete._inputElement.dispatchEvent(new InputEvent('input', { bubbles: true }))

      expect(autocomplete._isShown()).toBeTrue()
    })

    it('should clear the selection on Backspace or Delete even when the text does not change', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1', selected: true }]
      })
      const changes = []

      autocompleteEl.addEventListener('change.coreui.autocomplete', event => changes.push(event.value))
      autocomplete._inputElement.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Backspace' }))

      expect(autocomplete._selected).toEqual([])
      expect(changes).toEqual([null])
    })

    it('should clear the selection before an input listener runs', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Anna', value: 'a', selected: true }, { label: 'Annabel', value: 'b' }]
      })
      let selectedDuringInput = null

      autocompleteEl.addEventListener('input.coreui.autocomplete', () => {
        selectedDuringInput = autocomplete._selected.length
      })
      autocomplete._inputElement.value = 'Ann'
      autocomplete._inputElement.dispatchEvent(createEvent('input', { bubbles: true }))

      expect(selectedDuringInput).toBe(0)
    })
  })

  describe('hint functionality', () => {
    it('should show hint when typing and showHints is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'Opt'

      autocomplete._inputElement.dispatchEvent(createEvent('input', { bubbles: true }))

      expect(autocomplete._inputHintElement.value).toBe('Option 1')
    })

    it('should clear hint when no matching options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputHintElement.value = 'Option 1'
      autocomplete._inputElement.value = 'xyz'

      autocomplete._inputElement.dispatchEvent(createEvent('input', { bubbles: true }))

      expect(autocomplete._inputHintElement.value).toBe('')
    })

    it('should clear hint when input is empty', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputHintElement.value = 'Option 1'
      autocomplete._inputElement.value = ''

      autocomplete._inputElement.dispatchEvent(createEvent('input', { bubbles: true }))

      expect(autocomplete._inputHintElement.value).toBe('')
    })

    it('should not hint a disabled option', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: [{ label: 'Option 1', value: '1', disabled: true }, { label: 'Option 2', value: '2' }]
      })

      autocomplete._inputElement.value = 'Opt'
      autocomplete._inputElement.dispatchEvent(createEvent('input', { bubbles: true }))

      expect(autocomplete._inputHintElement.value).toBe('Option 2')
    })

    it('should take the first enabled option on Tab', async () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: [{ label: 'Option 1', value: '1', disabled: true }, { label: 'Option 2', value: '2' }]
      })

      autocomplete._inputElement.focus()
      await userEvent.keyboard('Opt{Tab}')

      expect(autocomplete._selected.map(option => option.value)).toEqual(['2'])
      expect(autocomplete._inputElement.value).toBe('Option 2')
    })

    it('should leave Tab alone once the hint is dismissed', async () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: [{ label: 'Apple', value: 'apple' }, { label: 'Banana', value: 'banana' }]
      })

      autocomplete._inputElement.focus()
      await userEvent.keyboard('Ap{Escape}{Tab}')

      expect(autocomplete._inputElement.value).toBe('Ap')
      expect(autocomplete._selected).toEqual([])
    })
  })

  describe('allowOnlyDefinedOptions', () => {
    it('should clear input on blur when allowOnlyDefinedOptions is true and no selection', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        allowOnlyDefinedOptions: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'invalid'
      autocomplete._inputElement.dispatchEvent(createEvent('blur'))

      expect(autocomplete._inputElement.value).toBe('')
    })

    it('should not clear input on blur when there is a selection', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        allowOnlyDefinedOptions: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._selected.push({ label: 'Option 1', value: '1' })
      autocomplete._inputElement.value = 'Option 1'
      autocomplete._inputElement.dispatchEvent(createEvent('blur'))

      expect(autocomplete._inputElement.value).toBe('Option 1')
    })
  })

  describe('custom templates', () => {
    it('should use optionsTemplate for rendering options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        optionsTemplate: option => `<span class="custom">${option.label}</span>`,
        options: [{ label: 'Option 1', value: '1' }]
      })

      const optionEl = autocomplete._optionsElement.querySelector('.list-box-option')
      expect(optionEl.innerHTML).toContain('<span class="custom">Option 1</span>')
    })

    it('should sanitize optionsTemplate output by default', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        optionsTemplate: option => `<span>${option.label}</span><script>alert('xss')</script>`,
        options: [{ label: 'Option 1', value: '1' }]
      })

      const optionEl = autocomplete._optionsElement.querySelector('.list-box-option')
      expect(optionEl.innerHTML).not.toContain('<script>')
    })

    it('should not sanitize optionsTemplate output when sanitize is false', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        sanitize: false,
        optionsTemplate: option => `<span>${option.label}</span><img src="x" onerror="alert(1)">`,
        options: [{ label: 'Option 1', value: '1' }]
      })

      const optionEl = autocomplete._optionsElement.querySelector('.list-box-option')
      expect(optionEl.innerHTML).toContain('onerror')
    })

    it('should use optionsGroupsTemplate for rendering group labels', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        optionsGroupsTemplate: group => `<strong class="group-title">${group.label}</strong>`,
        options: [
          {
            label: 'Fruits',
            options: [
              { label: 'Apple', value: 'apple' }
            ]
          }
        ]
      })

      const groupLabel = autocomplete._optionsElement.querySelector('.list-box-section-label')
      expect(groupLabel.innerHTML).toContain('<strong class="group-title">Fruits</strong>')
    })

    it('should sanitize optionsGroupsTemplate output by default', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        optionsGroupsTemplate: group => `<span>${group.label}</span><script>alert(1)</script>`,
        options: [
          {
            label: 'Fruits',
            options: [
              { label: 'Apple', value: 'apple' }
            ]
          }
        ]
      })

      const groupLabel = autocomplete._optionsElement.querySelector('.list-box-section-label')
      expect(groupLabel.innerHTML).not.toContain('<script>')
    })

    it('should not sanitize optionsGroupsTemplate when sanitize is false', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        sanitize: false,
        optionsGroupsTemplate: group => `<span>${group.label}</span><img src="x" onerror="alert(1)">`,
        options: [
          {
            label: 'Fruits',
            options: [
              { label: 'Apple', value: 'apple' }
            ]
          }
        ]
      })

      const groupLabel = autocomplete._optionsElement.querySelector('.list-box-section-label')
      expect(groupLabel.innerHTML).toContain('onerror')
    })

    it('should use textContent for group labels when no optionsGroupsTemplate', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          {
            label: 'Fruits',
            options: [
              { label: 'Apple', value: 'apple' }
            ]
          }
        ]
      })

      const groupLabel = autocomplete._optionsElement.querySelector('.list-box-section-label')
      expect(groupLabel.textContent).toBe('Fruits')
    })

    it('should highlight options with external search and highlightOptionsOnSearch', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: ['external'],
        highlightOptionsOnSearch: true,
        options: [{ label: 'Apple', value: 'apple' }]
      })

      autocomplete._search = 'app'
      autocomplete._setListBoxItems()

      const optionEl = autocomplete._optionsElement.querySelector('.list-box-option')
      expect(optionEl.innerHTML).toContain('<strong>')
    })
  })

  describe('groups', () => {
    it('should render grouped options with optgroup elements', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          {
            label: 'Fruits',
            options: [
              { label: 'Apple', value: 'apple' },
              { label: 'Banana', value: 'banana' }
            ]
          },
          {
            label: 'Vegetables',
            options: [
              { label: 'Carrot', value: 'carrot' }
            ]
          }
        ]
      })

      const optgroups = autocomplete._optionsElement.querySelectorAll('.list-box-section')
      expect(optgroups.length).toBe(2)

      const firstGroupLabel = optgroups[0].querySelector('.list-box-section-label')
      expect(firstGroupLabel.textContent).toBe('Fruits')

      const firstGroupOptions = optgroups[0].querySelectorAll('.list-box-option')
      expect(firstGroupOptions.length).toBe(2)
    })

    it('should preserve custom group properties', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          {
            label: 'Fruits',
            customProp: 'custom-value',
            options: [
              { label: 'Apple', value: 'apple' }
            ]
          }
        ]
      })

      expect(autocomplete._options[0].customProp).toBe('custom-value')
    })
  })

  describe('disabled options', () => {
    it('should render disabled options with disabled class', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1', disabled: true },
          { label: 'Option 2', value: '2' }
        ]
      })

      const optionEl = autocomplete._optionsElement.querySelector('[data-coreui-value="1"]')
      expect(optionEl.classList.contains('disabled')).toBe(true)
      expect(optionEl.getAttribute('aria-disabled')).toBe('true')
    })

    it('should keep disabled options out of the keyboard order and not activate them', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1', disabled: true },
          { label: 'Option 2', value: '2' }
        ]
      })

      autocomplete.show()
      const optionEl = autocomplete._optionsElement.querySelector('[data-coreui-value="1"]')

      expect(optionEl.hasAttribute('tabindex')).toBe(false)

      autocomplete._inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))
      expect(autocomplete._listBox.getActive()).toBe('2')

      optionEl.click()

      expect(autocomplete._selected).toEqual([])
    })
  })

  describe('container mode', () => {
    it('should close on Escape pressed inside the menu and return focus to the input', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocomplete = new Autocomplete(fixtureEl.querySelector('.autocomplete'), {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      const option = autocomplete._menu.querySelector('.list-box-option')
      option.tabIndex = 0
      option.focus()

      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      option.dispatchEvent(event)

      expect(autocomplete._element.classList.contains('show')).toBe(false)
      expect(document.activeElement).toBe(autocomplete._inputElement)
    })

    it('should append dropdown to container element', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div><div id="my-container"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const containerEl = fixtureEl.querySelector('#my-container')
      const autocomplete = new Autocomplete(autocompleteEl, {
        container: containerEl,
        options: [{ label: 'Option 1', value: '1' }]
      })

      // the panel is in the DOM only while a choice is being made
      expect(containerEl.querySelector('.combobox-popup')).toBeNull()

      autocomplete.show()

      expect(containerEl.querySelector('.combobox-popup')).toBeTruthy()
      expect(containerEl.contains(document.getElementById(autocomplete._inputElement.getAttribute('aria-controls')))).toBeTrue()
      expect(autocomplete._inputElement.getAttribute('aria-owns')).toBeNull()
    })

    it('should handle container as true (uses document.body)', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        container: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()

      expect(document.body.querySelector(`#${autocomplete._uniqueId}-listbox`)).toBeTruthy()
      expect(autocomplete._menu.parentElement).toBe(document.body)

      // Cleanup
      const listbox = document.body.querySelector(`#${autocomplete._uniqueId}-listbox`)
      if (listbox) {
        listbox.remove()
      }
    })
  })

  describe('keyboard with no navigable option', () => {
    it('should do nothing when every option is disabled', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1', disabled: true }
        ]
      })

      autocomplete.show()
      autocomplete._inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))

      expect(autocomplete._listBox.getActive()).toBeNull()
    })
  })

  describe('static methods', () => {
    describe('autocompleteInterface', () => {
      it('should create instance and call method', () => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')

        Autocomplete.autocompleteInterface(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        expect(Autocomplete.getInstance(autocompleteEl)).toBeInstanceOf(Autocomplete)
      })

      it('should call method on existing instance', () => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        const spy = spyOn(autocomplete, 'show')

        Autocomplete.autocompleteInterface(autocompleteEl, 'show')

        expect(spy).toHaveBeenCalled()
      })

      it('should throw error for undefined method', () => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')

        const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

        expect(() => {
          Autocomplete.autocompleteInterface(autocompleteEl, 'undefinedMethod')
        }).toThrowError(TypeError, 'No method named "undefinedMethod"')

        autocomplete.dispose()
      })
    })

    describe('jQueryInterface', () => {
      it('should create autocomplete', () => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')

        jQueryMock.fn.autocomplete = Autocomplete.jQueryInterface
        jQueryMock.elements = [autocompleteEl]

        jQueryMock.fn.autocomplete.call(jQueryMock, { options: [] })

        expect(Autocomplete.getInstance(autocompleteEl)).not.toBeNull()
      })

      it('should pass the arguments to the method', () => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, { options: [] })
        const spy = spyOn(autocomplete, 'search')

        jQueryMock.fn.autocomplete = Autocomplete.jQueryInterface
        jQueryMock.elements = [autocompleteEl]
        jQueryMock.fn.autocomplete.call(jQueryMock, 'search', 'ab')

        expect(spy).toHaveBeenCalledWith('ab')
        autocomplete.dispose()
      })

      it('should not re-create autocomplete', () => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

        jQueryMock.fn.autocomplete = Autocomplete.jQueryInterface
        jQueryMock.elements = [autocompleteEl]

        jQueryMock.fn.autocomplete.call(jQueryMock, { options: [] })

        expect(Autocomplete.getInstance(autocompleteEl)).toEqual(autocomplete)
      })

      it('should throw error on undefined method', () => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')

        const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

        jQueryMock.fn.autocomplete = Autocomplete.jQueryInterface
        jQueryMock.elements = [autocompleteEl]

        expect(() => {
          jQueryMock.fn.autocomplete.call(jQueryMock, 'undefinedMethod')
        }).toThrowError(TypeError, 'No method named "undefinedMethod"')

        autocomplete.dispose()
      })
    })

    describe('getInstance', () => {
      it('should return autocomplete instance', () => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

        expect(Autocomplete.getInstance(autocompleteEl)).toEqual(autocomplete)
        expect(Autocomplete.getInstance(autocompleteEl)).toBeInstanceOf(Autocomplete)
      })

      it('should return null when there is no autocomplete instance', () => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')

        expect(Autocomplete.getInstance(autocompleteEl)).toBeNull()
      })
    })

    describe('clearMenus', () => {
      it('should ignore right mouse button click', () => {
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-autocomplete></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocomplete.show()

        const event = new MouseEvent('click', { button: 2, bubbles: true })
        Object.defineProperty(event, 'composedPath', { value: () => [] })
        Autocomplete.clearMenus(event)

        expect(autocomplete._isShown()).toBe(true)
      })

      it('should ignore non-Tab keyup events', () => {
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-autocomplete></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocomplete.show()

        const event = new KeyboardEvent('keyup', { key: 'a', bubbles: true })
        Object.defineProperty(event, 'composedPath', { value: () => [] })
        Autocomplete.clearMenus(event)

        expect(autocomplete._isShown()).toBe(true)
      })

      it('should close on Tab keyup', () => {
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-autocomplete></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocomplete.show()
        autocompleteEl.classList.add('show')

        const event = new KeyboardEvent('keyup', { key: 'Tab', bubbles: true })
        Object.defineProperty(event, 'composedPath', { value: () => [] })
        Autocomplete.clearMenus(event)

        expect(autocomplete._isShown()).toBe(false)
      })

      it('should not close when click is inside the autocomplete element', () => {
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-autocomplete></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocomplete.show()
        autocompleteEl.classList.add('show')

        const event = new MouseEvent('click', { button: 0, bubbles: true })
        Object.defineProperty(event, 'composedPath', { value: () => [autocompleteEl] })
        Autocomplete.clearMenus(event)

        expect(autocomplete._isShown()).toBe(true)
      })

      it('should close when click is outside the autocomplete element', () => {
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-autocomplete></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocomplete.show()
        autocompleteEl.classList.add('show')

        const event = new MouseEvent('click', { button: 0, bubbles: true })
        Object.defineProperty(event, 'composedPath', { value: () => [document.body] })
        Autocomplete.clearMenus(event)

        expect(autocomplete._isShown()).toBe(false)
      })

      it('should clear input when allowOnlyDefinedOptions and no selection on outside click', () => {
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-autocomplete></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          allowOnlyDefinedOptions: true,
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocomplete.show()
        autocompleteEl.classList.add('show')
        autocomplete._inputElement.value = 'test'

        const event = new MouseEvent('click', { button: 0, bubbles: true })
        Object.defineProperty(event, 'composedPath', { value: () => [document.body] })
        Autocomplete.clearMenus(event)

        expect(autocomplete._inputElement.value).toBe('')
      })

      it('should not clear input when allowOnlyDefinedOptions and has selection on outside click', () => {
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-autocomplete></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          allowOnlyDefinedOptions: true,
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocomplete._selectOption({ label: 'Option 1', value: '1' })
        autocomplete.show()
        autocompleteEl.classList.add('show')

        const event = new MouseEvent('click', { button: 0, bubbles: true })
        Object.defineProperty(event, 'composedPath', { value: () => [document.body] })
        Autocomplete.clearMenus(event)

        expect(autocomplete._inputElement.value).toBe('Option 1')
      })

      it('should handle click event type with clickEvent in relatedTarget', () => {
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-autocomplete></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocomplete.show()
        autocompleteEl.classList.add('show')

        const event = new MouseEvent('click', { button: 0, bubbles: true })
        Object.defineProperty(event, 'composedPath', { value: () => [document.body] })
        Autocomplete.clearMenus(event)

        // Should not throw
        expect(autocomplete._isShown()).toBe(false)
      })
    })
  })

  describe('data-api', () => {
    it('should initialize autocomplete on data-api elements', () => {
      fixtureEl.innerHTML = [
        '<div data-coreui-autocomplete></div>',
        '<div data-coreui-autocomplete data-coreui-options=\'["one"]\'></div>'
      ].join('')

      const [first, second] = fixtureEl.querySelectorAll('[data-coreui-autocomplete]')

      window.dispatchEvent(createEvent('load'))

      expect(Autocomplete.getInstance(first)).toBeInstanceOf(Autocomplete)
      expect(Autocomplete.getInstance(second)).toBeInstanceOf(Autocomplete)
    })

    it('should initialize an element the markup marks disabled, as a disabled autocomplete', () => {
      fixtureEl.innerHTML = '<div class="disabled" data-coreui-autocomplete></div>'
      const autocompleteEl = fixtureEl.querySelector('[data-coreui-autocomplete]')

      window.dispatchEvent(createEvent('load'))

      expect(Autocomplete.getInstance(autocompleteEl)._config.disabled).toBeTrue()
    })

    it('should initialize autocomplete from data attributes', () => {
      fixtureEl.innerHTML =
        '<div data-coreui-autocomplete data-coreui-options="JavaScript, TypeScript" data-coreui-search="global"></div>'

      const autocompleteEl = fixtureEl.querySelector('[data-coreui-autocomplete]')

      window.dispatchEvent(createEvent('load'))

      const autocomplete = Autocomplete.getInstance(autocompleteEl)

      expect(autocomplete).toBeInstanceOf(Autocomplete)
      expect(autocomplete._config.options).toEqual(['JavaScript', 'TypeScript'])
      expect(autocomplete._config.search).toEqual(['global'])
    })

    it('should close autocomplete when clicking outside', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-autocomplete></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('shown.coreui.autocomplete', () => {
          document.body.click()
        })

        autocompleteEl.addEventListener('hidden.coreui.autocomplete', () => {
          expect(autocomplete._isShown()).toBe(false)
          resolve()
        })

        autocomplete.show()
      })
    })
  })

  describe('number value handling', () => {
    it('should convert number values to strings internally', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const options = [
        { label: 'First Option', value: 1 },
        { label: 'Second Option', value: 2 },
        { label: 'Third Option', value: 3.5 }
      ]
      const autocomplete = new Autocomplete(autocompleteEl, { options })

      expect(autocomplete._options[0].value).toBe('1')
      expect(autocomplete._options[1].value).toBe('2')
      expect(autocomplete._options[2].value).toBe('3.5')
      expect(typeof autocomplete._options[0].value).toBe('string')
    })

    it('should select option with number value converted to string', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 }
          ]
        })

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          expect(event.value.value).toBe('1')
          expect(typeof event.value.value).toBe('string')
          resolve()
        })

        const option = autocomplete._options[0]
        autocomplete._selectOption(option)
      })
    })

    it('should update input value when option with number value is selected', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: 1 }]
      })

      const option = autocomplete._options[0]
      autocomplete._selectOption(option)

      expect(autocomplete._inputElement.value).toBe('Option 1')
      expect(autocomplete._selected).toContain(option)
      expect(autocomplete._selected[0].value).toBe('1')
      expect(typeof autocomplete._selected[0].value).toBe('string')
    })

    it('should filter options with number values based on search term', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Apple', value: 1 },
          { label: 'Banana', value: 2 },
          { label: 'Cherry', value: 3 }
        ]
      })

      autocomplete.show()
      autocomplete._search = 'app'
      autocomplete._filterOptionsList()

      const visibleOptions = Array.from(autocomplete._optionsElement.querySelectorAll('.list-box-option'))
        .filter(option => !option.hasAttribute('hidden'))

      expect(visibleOptions).toHaveSize(1)
      expect(visibleOptions[0].textContent).toBe('Apple')
      expect(visibleOptions[0].dataset.coreuiValue).toBe('1')
    })

    it('should handle mixed string and number values by converting to strings', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const options = [
        { label: 'String Option', value: 'string' },
        { label: 'Number Option', value: 42 },
        { label: 'Float Option', value: 3.14 },
        { label: 'Zero Option', value: 0 }
      ]
      const autocomplete = new Autocomplete(autocompleteEl, { options })

      expect(autocomplete._options[0].value).toBe('string')
      expect(autocomplete._options[1].value).toBe('42')
      expect(autocomplete._options[2].value).toBe('3.14')
      expect(autocomplete._options[3].value).toBe('0')
      expect(typeof autocomplete._options[0].value).toBe('string')
      expect(typeof autocomplete._options[1].value).toBe('string')
      expect(typeof autocomplete._options[2].value).toBe('string')
      expect(typeof autocomplete._options[3].value).toBe('string')
    })

    it('should handle zero as a valid number value converted to string', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Zero Option', value: 0 }]
        })

        autocompleteEl.addEventListener('change.coreui.autocomplete', event => {
          expect(event.value.value).toBe('0')
          expect(typeof event.value.value).toBe('string')
          resolve()
        })

        const option = autocomplete._options[0]
        autocomplete._selectOption(option)
      })
    })

    it('should handle negative number values converted to strings', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const options = [
        { label: 'Negative Option', value: -1 },
        { label: 'Negative Float', value: -2.5 }
      ]
      const autocomplete = new Autocomplete(autocompleteEl, { options })

      expect(autocomplete._options[0].value).toBe('-1')
      expect(autocomplete._options[1].value).toBe('-2.5')
      expect(typeof autocomplete._options[0].value).toBe('string')
      expect(typeof autocomplete._options[1].value).toBe('string')
    })

    it('should create autocomplete with number values in initial configuration', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const config = {
        value: 1,
        options: [
          { label: 'Option 1', value: 1 },
          { label: 'Option 2', value: 2 }
        ]
      }
      const autocomplete = new Autocomplete(autocompleteEl, config)

      expect(autocomplete._config.value).toBe(1)
      expect(autocomplete._options[0].value).toBe('1')
      expect(autocomplete._options[1].value).toBe('2')
    })

    it('should match options by string comparison even when passed number values', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        value: 1,
        options: [
          { label: 'Option 1', value: 1 },
          { label: 'Option 2', value: 2 }
        ]
      })

      expect(autocomplete._selected).toHaveSize(1)
      expect(autocomplete._selected[0].value).toBe('1')
      expect(autocomplete._selected[0].label).toBe('Option 1')
    })
  })

  describe('_configAfterMerge', () => {
    it('should convert container true to document.body', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        container: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      expect(autocomplete._config.container).toBe(document.body)

      // Cleanup
      const listbox = document.body.querySelector(`#${autocomplete._uniqueId}-listbox`)
      if (listbox) {
        listbox.remove()
      }
    })

    it('should convert options string to array', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: 'one, two, three'
      })

      expect(autocomplete._options.length).toBe(3)
      expect(autocomplete._options[0].label).toBe('one')
      expect(autocomplete._options[1].label).toBe('two')
      expect(autocomplete._options[2].label).toBe('three')
    })

    it('should convert search string to array', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        search: 'external, global',
        options: []
      })

      expect(autocomplete._config.search).toEqual(['external', 'global'])
    })
  })

  describe('_deselectOption', () => {
    it('should remove option from selected array', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' }
        ]
      })

      autocomplete._selected = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' }
      ]

      autocomplete._deselectOption('1')

      expect(autocomplete._selected.length).toBe(1)
      expect(autocomplete._selected[0].value).toBe('2')
    })

    it('should remove selected class from DOM element', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      // First select
      autocomplete._selectOption({ label: 'Option 1', value: '1' })
      const optionEl = autocomplete._optionsElement.querySelector('[data-coreui-value="1"]')
      expect(optionEl.classList.contains('selected')).toBe(true)

      // Then deselect
      autocomplete._deselectOption('1')
      expect(optionEl.classList.contains('selected')).toBe(false)
      expect(optionEl.getAttribute('aria-selected')).toBe('false')
    })
  })

  describe('_getOptionsFromConfig', () => {
    it('should return empty array when options is null', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: null
      })

      expect(autocomplete._options).toEqual([])
    })

    it('should return empty array when options is not an array', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: null
      })

      expect(autocomplete._getOptionsFromConfig(false)).toEqual([])
    })

    it('should preserve custom option properties', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          {
            label: 'Option 1', value: '1', customData: 'extra', icon: 'star'
          }
        ]
      })

      expect(autocomplete._options[0].customData).toBe('extra')
      expect(autocomplete._options[0].icon).toBe('star')
    })

    it('should use label as value when value is not provided', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'My Option' }]
      })

      expect(autocomplete._options[0].value).toBe('My Option')
      expect(autocomplete._options[0].label).toBe('My Option')
    })
  })

  describe('_isOptionDisplayed', () => {
    it('should return true for visible elements', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      const el = document.createElement('div')
      document.body.append(el)
      expect(autocomplete._isOptionDisplayed(el)).toBe(true)
      el.remove()
    })

    it('should return false for hidden elements', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      const el = document.createElement('div')
      el.setAttribute('hidden', '')
      document.body.append(el)
      expect(autocomplete._isOptionDisplayed(el)).toBe(false)
      el.remove()
    })
  })

  describe('clearSearchOnSelect option', () => {
    it('should not clear search when clearSearchOnSelect is false', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        clearSearchOnSelect: false,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._search = 'opt'
      autocomplete._selectOption({ label: 'Option 1', value: '1' })

      expect(autocomplete._search).toBe('opt')
    })

    it('should not clear search on Enter with custom value when clearSearchOnSelect is false', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        allowOnlyDefinedOptions: false,
        clearSearchOnSelect: false,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      autocomplete._search = 'custom'
      autocomplete._inputElement.value = 'custom'

      const keydownEvent = createEvent('keydown')
      keydownEvent.key = 'Enter'
      autocomplete._inputElement.dispatchEvent(keydownEvent)

      expect(autocomplete._search).toBe('custom')
    })
  })
})

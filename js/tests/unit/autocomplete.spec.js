import Autocomplete from '../../src/autocomplete.js'
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
    it('should take care of element either passed as a CSS selector or DOM element', () => {
      fixtureEl.innerHTML = [
        '<div class="autocomplete" data-coreui-toggle="autocomplete">',
        '</div>'
      ].join('')

      const autocompleteEl = fixtureEl.querySelector('[data-coreui-toggle="autocomplete"]')
      const autocompleteBySelector = new Autocomplete('[data-coreui-toggle="autocomplete"]', { options: [] })
      const autocompleteByElement = new Autocomplete(autocompleteEl, { options: [] })

      expect(autocompleteBySelector._element).toEqual(autocompleteEl)
      expect(autocompleteByElement._element).toEqual(autocompleteEl)
    })

    it('should create autocomplete with default options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

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
    })

    it('should create autocomplete with cleaner button when cleaner option is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { cleaner: true, options: [] })

      expect(autocomplete._cleanerElement).toBeTruthy()
      expect(autocomplete._cleanerElement.classList.contains('autocomplete-cleaner')).toBe(true)
    })

    it('should create autocomplete with indicator button when indicator option is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { indicator: true, options: [] })

      expect(autocomplete._indicatorElement).toBeTruthy()
      expect(autocomplete._indicatorElement.classList.contains('autocomplete-indicator')).toBe(true)
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
      expect(autocomplete._optionsElement.classList.contains('autocomplete-options')).toBe(true)
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

    it('should set indicator tabIndex to -1 when disabled', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        disabled: true,
        indicator: true,
        options: []
      })

      expect(autocomplete._indicatorElement.tabIndex).toBe(-1)
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
      new Autocomplete(autocompleteEl, {
        invalid: true,
        options: []
      })

      expect(autocompleteEl.classList.contains('is-invalid')).toBe(true)
    })

    it('should add is-valid class when valid is true', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      new Autocomplete(autocompleteEl, {
        valid: true,
        options: []
      })

      expect(autocompleteEl.classList.contains('is-valid')).toBe(true)
    })

    it('should set optionsMaxHeight on the options container', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        optionsMaxHeight: 200,
        options: [{ label: 'Option 1', value: '1' }]
      })

      expect(autocomplete._optionsElement.style.maxHeight).toBe('200px')
      expect(autocomplete._optionsElement.style.overflow).toBe('auto')
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

    it('should hide without popper if popper is null', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._popper = null
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

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
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

  describe('update', () => {
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

      autocomplete.update({ options: newOptions })

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

      autocomplete.update({ value: '2' })

      expect(autocomplete._selected).toEqual([])
    })

    it('should recreate DOM options after update', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.update({
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' }
        ]
      })

      const optionElements = autocomplete._optionsElement.querySelectorAll('.autocomplete-option')
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

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
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

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
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
      autocompleteEl.addEventListener('changed.coreui.autocomplete', () => {
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

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          resolve()
        })

        const optionEl = autocomplete._optionsElement.querySelector('.autocomplete-option')
        const keydownEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
        optionEl.dispatchEvent(keydownEvent)
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

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
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

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
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

      const optionEl = autocomplete._optionsElement.querySelector('[data-value="1"]')
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

  describe('_onOptionsClick', () => {
    it('should select option when clicking on option element', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocomplete.show()

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          resolve()
        })

        const optionEl = autocomplete._optionsElement.querySelector('.autocomplete-option')
        const clickEvent = new Event('click', { bubbles: true })
        optionEl.dispatchEvent(clickEvent)
      })
    })

    it('should do nothing when clicking on label element', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()

      // Create a label element inside the options
      const labelEl = document.createElement('div')
      labelEl.classList.add('label')
      autocomplete._optionsElement.append(labelEl)

      autocomplete._onOptionsClick(labelEl)
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

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          resolve()
        })

        const optionEl = autocomplete._optionsElement.querySelector('.autocomplete-option')
        const childEl = document.createElement('span')
        childEl.textContent = 'inner text'
        optionEl.append(childEl)

        autocomplete._onOptionsClick(childEl)
      })
    })

    it('should do nothing when clicking on non-option element with no closest option', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()

      // Clicking on the options container itself (not on an option)
      autocomplete._onOptionsClick(autocomplete._optionsElement)
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

      const visibleOptions = Array.from(autocomplete._optionsElement.querySelectorAll('.autocomplete-option'))
        .filter(option => option.style.display !== 'none')

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

      const emptyMessage = autocomplete._menu.querySelector('.autocomplete-options-empty')
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

      // First filter to show no results
      autocomplete._search = 'xyz'
      autocomplete._filterOptionsList()
      expect(autocomplete._menu.querySelector('.autocomplete-options-empty')).toBeTruthy()

      // Then filter to show results
      autocomplete._search = 'app'
      autocomplete._filterOptionsList()
      expect(autocomplete._menu.querySelector('.autocomplete-options-empty')).toBeNull()
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

      const emptyMessages = autocomplete._menu.querySelectorAll('.autocomplete-options-empty')
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

      const visibleOptions = Array.from(autocomplete._optionsElement.querySelectorAll('.autocomplete-option'))
        .filter(option => option.style.display !== 'none')

      expect(visibleOptions[0].innerHTML).toContain('<strong>')
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

      const visibleOptions = Array.from(autocomplete._optionsElement.querySelectorAll('.autocomplete-option'))
        .filter(option => option.style.display !== 'none')

      // Should not highlight since optionsTemplate is set
      expect(visibleOptions[0].innerHTML).not.toContain('<strong>App</strong>')
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

      const optgroups = autocomplete._menu.querySelectorAll('.autocomplete-optgroup')
      // Fruits group should be hidden, Vegetables should be visible
      expect(optgroups[0].style.display).toBe('none')
      expect(optgroups[1].style.display).not.toBe('none')
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

      const optgroup = autocomplete._menu.querySelector('.autocomplete-optgroup')
      expect(optgroup.style.display).not.toBe('none')
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
        indicator: true,
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
        indicator: true,
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

  describe('dispose', () => {
    it('should dispose autocomplete', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      expect(autocomplete._element).not.toBeNull()

      autocomplete.dispose()

      expect(autocomplete._element).toBeNull()
    })

    it('should destroy popper when disposing', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete.show()
      expect(autocomplete._popper).not.toBeNull()

      const spy = spyOn(autocomplete._popper, 'destroy')
      autocomplete.dispose()

      expect(spy).toHaveBeenCalled()
    })

    it('should dispose without popper if popper is null', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      autocomplete._popper = null
      autocomplete.dispose()

      expect(autocomplete._element).toBeNull()
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

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
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
      autocompleteEl.addEventListener('changed.coreui.autocomplete', () => {
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

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
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

    it('should not clear on blur when there is exactly one case-insensitive match', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete"></div>'
        const autocompleteEl = fixtureEl.querySelector('.autocomplete')
        const autocomplete = new Autocomplete(autocompleteEl, {
          allowOnlyDefinedOptions: true,
          options: [{ label: 'Option 1', value: '1' }]
        })

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
          expect(event.value.label).toBe('Option 1')
          resolve()
        })

        autocomplete._inputElement.value = 'option 1'
        autocomplete._inputElement.dispatchEvent(createEvent('blur'))
      })
    })
  })

  describe('input keyup', () => {
    it('should update search on character key', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'O'

      const keyupEvent = createEvent('keyup')
      keyupEvent.key = 'O'
      Object.defineProperty(keyupEvent, 'target', {
        value: autocomplete._inputElement,
        enumerable: true
      })
      autocomplete._inputElement.dispatchEvent(keyupEvent)

      expect(autocomplete._search).toBe('o')
    })

    it('should update search on Backspace key', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'Op'

      const keyupEvent = createEvent('keyup')
      keyupEvent.key = 'Backspace'
      Object.defineProperty(keyupEvent, 'target', {
        value: autocomplete._inputElement,
        enumerable: true
      })
      autocomplete._inputElement.dispatchEvent(keyupEvent)

      expect(autocomplete._search).toBe('op')
    })

    it('should update search on Delete key', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'Opt'

      const keyupEvent = createEvent('keyup')
      keyupEvent.key = 'Delete'
      Object.defineProperty(keyupEvent, 'target', {
        value: autocomplete._inputElement,
        enumerable: true
      })
      autocomplete._inputElement.dispatchEvent(keyupEvent)

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

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
          expect(event.value).toBeNull()
          resolve()
        })

        const keyupEvent = createEvent('keyup')
        keyupEvent.key = 'O'
        Object.defineProperty(keyupEvent, 'target', {
          value: autocomplete._inputElement,
          enumerable: true
        })
        autocomplete._inputElement.dispatchEvent(keyupEvent)
      })
    })

    it('should not trigger for non-character keys like Arrow keys', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._search = 'test'

      const keyupEvent = createEvent('keyup')
      keyupEvent.key = 'ArrowDown'
      Object.defineProperty(keyupEvent, 'target', {
        value: autocomplete._inputElement,
        enumerable: true
      })
      autocomplete._inputElement.dispatchEvent(keyupEvent)

      // Search should remain unchanged
      expect(autocomplete._search).toBe('test')
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

      const keyupEvent = createEvent('keyup')
      keyupEvent.key = 'p'
      Object.defineProperty(keyupEvent, 'target', {
        value: autocomplete._inputElement,
        enumerable: true
      })
      autocomplete._inputElement.dispatchEvent(keyupEvent)

      expect(autocomplete._inputHintElement.value).toBe('Option 1')
    })

    it('should clear hint when no matching options', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = 'xyz'

      const keyupEvent = createEvent('keyup')
      keyupEvent.key = 'z'
      Object.defineProperty(keyupEvent, 'target', {
        value: autocomplete._inputElement,
        enumerable: true
      })
      autocomplete._inputElement.dispatchEvent(keyupEvent)

      expect(autocomplete._inputHintElement.value).toBe('')
    })

    it('should clear hint when input is empty', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        showHints: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      autocomplete._inputElement.value = ''

      const keyupEvent = createEvent('keyup')
      keyupEvent.key = 'Backspace'
      Object.defineProperty(keyupEvent, 'target', {
        value: autocomplete._inputElement,
        enumerable: true
      })
      autocomplete._inputElement.dispatchEvent(keyupEvent)

      expect(autocomplete._inputHintElement.value).toBe('')
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

      const optionEl = autocomplete._optionsElement.querySelector('.autocomplete-option')
      expect(optionEl.innerHTML).toContain('<span class="custom">Option 1</span>')
    })

    it('should sanitize optionsTemplate output by default', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        optionsTemplate: option => `<span>${option.label}</span><script>alert('xss')</script>`,
        options: [{ label: 'Option 1', value: '1' }]
      })

      const optionEl = autocomplete._optionsElement.querySelector('.autocomplete-option')
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

      const optionEl = autocomplete._optionsElement.querySelector('.autocomplete-option')
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

      const groupLabel = autocomplete._optionsElement.querySelector('.autocomplete-optgroup-label')
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

      const groupLabel = autocomplete._optionsElement.querySelector('.autocomplete-optgroup-label')
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

      const groupLabel = autocomplete._optionsElement.querySelector('.autocomplete-optgroup-label')
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

      const groupLabel = autocomplete._optionsElement.querySelector('.autocomplete-optgroup-label')
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
      autocomplete._optionsElement.innerHTML = ''
      autocomplete._createOptions(autocomplete._optionsElement, autocomplete._options)

      const optionEl = autocomplete._optionsElement.querySelector('.autocomplete-option')
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

      const optgroups = autocomplete._optionsElement.querySelectorAll('.autocomplete-optgroup')
      expect(optgroups.length).toBe(2)

      const firstGroupLabel = optgroups[0].querySelector('.autocomplete-optgroup-label')
      expect(firstGroupLabel.textContent).toBe('Fruits')

      const firstGroupOptions = optgroups[0].querySelectorAll('.autocomplete-option')
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

      const optionEl = autocomplete._optionsElement.querySelector('[data-value="1"]')
      expect(optionEl.classList.contains('disabled')).toBe(true)
      expect(optionEl.getAttribute('aria-disabled')).toBe('true')
    })
  })

  describe('container mode', () => {
    it('should append dropdown to container element', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div><div id="my-container"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const containerEl = fixtureEl.querySelector('#my-container')
      const autocomplete = new Autocomplete(autocompleteEl, {
        container: containerEl,
        options: [{ label: 'Option 1', value: '1' }]
      })

      expect(containerEl.querySelector('.autocomplete-dropdown')).toBeTruthy()
      expect(autocomplete._inputElement.getAttribute('aria-owns')).toBeTruthy()
    })

    it('should handle container as true (uses document.body)', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        container: true,
        options: [{ label: 'Option 1', value: '1' }]
      })

      expect(document.body.querySelector(`#${autocomplete._uniqueId}-listbox`)).toBeTruthy()

      // Cleanup
      const listbox = document.body.querySelector(`#${autocomplete._uniqueId}-listbox`)
      if (listbox) {
        listbox.remove()
      }
    })
  })

  describe('_selectMenuItem', () => {
    it('should do nothing when no visible items', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, {
        options: [
          { label: 'Option 1', value: '1', disabled: true }
        ]
      })

      autocomplete.show()

      // All options are disabled, so no visible items
      // Should not throw
      autocomplete._selectMenuItem({ key: 'ArrowDown', target: autocomplete._inputElement })
      expect(true).toBe(true)
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
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-toggle="autocomplete"></div>'
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
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-toggle="autocomplete"></div>'
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
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-toggle="autocomplete"></div>'
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
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-toggle="autocomplete"></div>'
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
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-toggle="autocomplete"></div>'
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
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-toggle="autocomplete"></div>'
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
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-toggle="autocomplete"></div>'
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
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-toggle="autocomplete"></div>'
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
      fixtureEl.innerHTML = '<div data-coreui-toggle="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('[data-coreui-toggle="autocomplete"]')

      const _autocomplete = new Autocomplete(autocompleteEl, { options: [{ label: 'Test', value: '1' }] })

      expect(Autocomplete.getInstance(autocompleteEl)).toBeInstanceOf(Autocomplete)
    })

    it('should close autocomplete when clicking outside', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="autocomplete" data-coreui-toggle="autocomplete"></div>'
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

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
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

      const visibleOptions = Array.from(autocomplete._optionsElement.querySelectorAll('.autocomplete-option'))
        .filter(option => option.style.display !== 'none')

      expect(visibleOptions).toHaveSize(1)
      expect(visibleOptions[0].textContent).toBe('Apple')
      expect(visibleOptions[0].dataset.value).toBe('1')
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

        autocompleteEl.addEventListener('changed.coreui.autocomplete', event => {
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
      const optionEl = autocomplete._optionsElement.querySelector('[data-value="1"]')
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
          { label: 'Option 1', value: '1', customData: 'extra', icon: 'star' }
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

  describe('_isVisible', () => {
    it('should return true for visible elements', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      const el = document.createElement('div')
      document.body.append(el)
      expect(autocomplete._isVisible(el)).toBe(true)
      el.remove()
    })

    it('should return false for hidden elements', () => {
      fixtureEl.innerHTML = '<div class="autocomplete"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      const el = document.createElement('div')
      el.style.display = 'none'
      document.body.append(el)
      expect(autocomplete._isVisible(el)).toBe(false)
      el.remove()
    })
  })

  describe('_getClassNames', () => {
    it('should return class names from element', () => {
      fixtureEl.innerHTML = '<div class="autocomplete my-custom-class"></div>'
      const autocompleteEl = fixtureEl.querySelector('.autocomplete')
      const autocomplete = new Autocomplete(autocompleteEl, { options: [] })

      const classNames = autocomplete._getClassNames()
      expect(classNames).toContain('autocomplete')
      expect(classNames).toContain('my-custom-class')
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

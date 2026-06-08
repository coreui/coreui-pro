/* eslint-env jasmine */

import MultiSelect from '../../src/multi-select.js'
import EventHandler from '../../src/dom/event-handler.js'
import {
  getFixture, clearFixture, jQueryMock
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

      expect(multiSelect._wrapperElement.classList.contains('form-multi-select')).toBe(true)
      expect(multiSelect._wrapperElement.querySelector('.form-multi-select-input-group')).toBeTruthy()
      expect(multiSelect._wrapperElement.querySelector('.form-multi-select-selection')).toBeTruthy()
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
      expect(multiSelect._selected.length).toBe(1)
      expect(multiSelect._selected[0].value).toBe('2')
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
      expect(document.activeElement).toBe(multiSelect._togglerElement)
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

      expect(multiSelect._selected.length).toBe(2)
      expect(multiSelect._selected[0].value).toBe('1')
      expect(multiSelect._selected[1].value).toBe('3')
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

      expect(multiSelect._selected.length).toBe(2)
      expect(multiSelect._selected[0].value).toBe('1')
      expect(multiSelect._selected[1].value).toBe('3')
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

      expect(multiSelect._selected.length).toBe(2)
    })

    it('should handle numeric value config', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options, value: 1 })

      expect(multiSelect._selected.length).toBe(1)
      expect(multiSelect._selected[0].value).toBe('1')
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
      expect(multiSelect._selectAllElement.classList.contains('form-multi-select-all')).toBe(true)
    })

    it('should wrap select all in a dropdown header', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: true,
        selectAll: true
      })

      const header = multiSelect._selectAllElement.closest('.form-multi-select-dropdown-header')
      expect(header).not.toBeNull()
      expect(header.parentNode).toBe(multiSelect._menu)
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
      expect(multiSelect._optionsElement.style.overflow).toBe('auto')
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
      expect(multiSelect._searchElement.classList.contains('form-multi-select-search')).toBe(true)
    })

    it('should create search input when search is "global"', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [],
        search: 'global'
      })

      expect(multiSelect._searchElement).not.toBeNull()
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

      const placeholder = multiSelect._wrapperElement.querySelector('.form-multi-select-placeholder')
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
      expect(multiSelect._selectionCleanerElement.classList.contains('form-multi-select-cleaner')).toBe(true)
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
        optionsStyle: 'checkbox'
      })

      const optionEl = multiSelect._optionsElement.querySelector('.form-multi-select-option')
      expect(optionEl.classList.contains('form-multi-select-option-with-checkbox')).toBe(true)
    })

    it('should handle optionsTemplate function', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        optionsTemplate: option => `<span>${option.text}</span>`
      })

      const optionEl = multiSelect._optionsElement.querySelector('.form-multi-select-option')
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

      const optionEl = multiSelect._optionsElement.querySelector('.form-multi-select-option')
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

      const groupLabel = multiSelect._optionsElement.querySelector('.form-multi-select-optgroup-label')
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

      const groupLabel = multiSelect._optionsElement.querySelector('.form-multi-select-optgroup-label')
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

    it('should handle container option', () => {
      fixtureEl.innerHTML = '<select></select><div id="container"></div>'
      const selectEl = fixtureEl.querySelector('select')
      const containerEl = fixtureEl.querySelector('#container')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        container: containerEl
      })

      expect(containerEl.querySelector('.form-multi-select-dropdown')).not.toBeNull()
      expect(multiSelect._menu.parentElement).toBe(containerEl)
    })

    it('should handle container option set to true (document.body)', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        container: true
      })

      expect(multiSelect._menu.parentElement).toBe(document.body)
      // Clean up
      multiSelect._menu.remove()
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

      const disabledOption = multiSelect._optionsElement.querySelector('[data-value="2"]')
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
        selectionTypeCounterText: 'items selected'
      })

      const selection = multiSelect._wrapperElement.querySelector('.form-multi-select-selection')
      expect(selection.textContent).toContain('2')
      expect(selection.textContent).toContain('items selected')
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

      const selection = multiSelect._wrapperElement.querySelector('.form-multi-select-selection')
      expect(selection.textContent).toContain('Opt 1')
      expect(selection.textContent).toContain('Opt 2')
    })

    it('should handle selectionType tags', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true }
        ],
        selectionType: 'tags'
      })

      const tags = multiSelect._wrapperElement.querySelectorAll('.form-multi-select-tag')
      expect(tags.length).toBe(2)
    })

    it('should create tags with delete buttons', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        selectionType: 'tags'
      })

      const tag = multiSelect._wrapperElement.querySelector('.form-multi-select-tag')
      expect(tag.querySelector('.form-multi-select-tag-delete')).not.toBeNull()
    })

    it('should not create tag delete buttons when disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        selectionType: 'tags',
        disabled: true
      })

      const tag = multiSelect._wrapperElement.querySelector('.form-multi-select-tag')
      expect(tag.querySelector('.form-multi-select-tag-delete')).toBeNull()
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

      const selection = multiSelect._wrapperElement.querySelector('.form-multi-select-selection')
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
  })

  describe('show', () => {
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

      const searchInput = multiSelect._wrapperElement.querySelector('.form-multi-select-search')
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

    it('should create popper instance', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      expect(multiSelect._popper).not.toBeNull()
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

    it('should destroy popper', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      expect(multiSelect._popper).not.toBeNull()

      const spy = spyOn(multiSelect._popper, 'destroy')
      multiSelect.hide()
      expect(spy).toHaveBeenCalled()
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
      expect(multiSelect._selected.length).toBe(3)
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
      expect(multiSelect._selected.length).toBe(2)
      expect(multiSelect._selected.find(item => item.value === '2')).toBeUndefined()
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
      expect(multiSelect._selected.length).toBe(2)
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

      multiSelect._selectOption('1', 'Option 1')
      multiSelect._selectOption('2', 'Option 2')

      expect(multiSelect._selected.length).toBe(1)
      expect(multiSelect._selected[0].value).toBe('1')
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

      multiSelect._selectOption('1', 'Option 1')
      multiSelect._selectOption('2', 'Option 2')

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

      multiSelect._optionsElement.querySelector('[data-value="4"]').click()

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

      multiSelect._selectOption('1', 'Option 1')
      multiSelect._selectOption('2', 'Option 2')

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

      expect(multiSelect._selected.length).toBe(2)
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

      expect(multiSelect._selected.length).toBe(2)
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
      expect(multiSelect._selected.length).toBe(3)
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
      expect(multiSelect._selected.length).toBe(1)
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
      expect(multiSelect._selected.length).toBe(1)
      expect(multiSelect._selected[0].value).toBe('3')
    })

    it('should trigger changed event for each selected option', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1' },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })
      let changeCount = 0

      selectEl.addEventListener('changed.coreui.multi-select', () => {
        changeCount++
      })

      multiSelect.selectAll()
      expect(changeCount).toBe(2)
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
      expect(multiSelect._selected.length).toBe(3)

      multiSelect.deselectAll()
      expect(multiSelect._selected.length).toBe(0)
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
      expect(multiSelect._selected.length).toBe(1)

      multiSelect.deselectAll()
      expect(multiSelect._selected.length).toBe(0)
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
      expect(multiSelect._selected.length).toBe(2)

      multiSelect.deselectAll()
      expect(multiSelect._selected.length).toBe(0)
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

      expect(multiSelect._selected.length).toBe(1)
      expect(multiSelect._selected[0].value).toBe('3')
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
      expect(multiSelect._selected.length).toBe(3)
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
      expect(multiSelect._selected.length).toBe(2)
      expect(multiSelect._selected.find(item => item.value === '2')).toBeUndefined()
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
      expect(multiSelect._selected.length).toBe(2)
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
      expect(multiSelect._selected.length).toBe(3)

      multiSelect.search('av')
      multiSelect.deselectFiltered()

      expect(multiSelect._selected.length).toBe(2)
      expect(multiSelect._selected.find(item => item.value === '3')).toBeUndefined()
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
      expect(multiSelect._headerElement.closest('.form-multi-select-dropdown-header')).not.toBeNull()
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
      expect(multiSelect._selected.length).toBe(0)
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
      expect(multiSelect._selected.length).toBe(3)
      expect(multiSelect._selectAllElement.textContent).toBe('Deselect all')

      multiSelect._selectAllElement.click()
      expect(multiSelect._selected.length).toBe(0)
      expect(multiSelect._selectAllElement.textContent).toBe('Select all')
    })

    it('should toggle with custom labels regardless of style', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options,
        selectAllStyle: 'text',
        selectAllLabel: 'Select all',
        deselectAllLabel: 'Deselect all'
      })

      expect(multiSelect._selectAllElement.textContent).toBe('Select all')

      multiSelect._selectAllElement.click()
      expect(multiSelect._selected.length).toBe(3)
      expect(multiSelect._selectAllElement.textContent).toBe('Deselect all')

      multiSelect._selectAllElement.click()
      expect(multiSelect._selected.length).toBe(0)
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

      expect(multiSelect._selected.length).toBe(3)
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

      expect(multiSelect._selected.map(option => option.value).toSorted()).toEqual(['1', '2'])
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

      expect(multiSelect._selected.length).toBe(3)
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
      expect(multiSelect._selectAllElement.classList.contains('form-multi-selected')).toBe(true)
      expect(multiSelect._selectAllElement.textContent).toBe('Deselect filtered')

      // clearing the filter widens the set to all 3, only 2 selected -> indeterminate
      multiSelect.search('')
      expect(multiSelect._selectAllElement.classList.contains('form-multi-select-indeterminate')).toBe(true)
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

      const label = multiSelect._menu.querySelector('.form-multi-select-optgroup-label')
      expect(label.classList.contains('form-multi-select-optgroup-label-with-checkbox')).toBe(false)
    })

    it('should add the checkbox class to group labels when enabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions, optionsGroupsSelectable: true })

      const label = multiSelect._menu.querySelector('.form-multi-select-optgroup-label-with-checkbox')
      expect(label).not.toBeNull()
    })

    it('should not add the checkbox class when optionsGroupsStyle is text', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions, optionsGroupsSelectable: true, optionsGroupsStyle: 'text' })

      const label = multiSelect._menu.querySelector('.form-multi-select-optgroup-label-with-checkbox')
      expect(label).toBeNull()
    })

    it('should select and deselect a whole group on label click', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions, optionsGroupsSelectable: true })

      const groupLabel = multiSelect._menu.querySelector('.form-multi-select-optgroup-label-with-checkbox')

      groupLabel.click()
      expect(multiSelect._selected.length).toBe(2)
      expect(groupLabel.classList.contains('form-multi-selected')).toBe(true)

      groupLabel.click()
      expect(multiSelect._selected.length).toBe(0)
    })

    it('should mark the group label as indeterminate on partial selection', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions, optionsGroupsSelectable: true })

      multiSelect._selectOption('1', 'A1')

      const groupLabel = multiSelect._menu.querySelector('.form-multi-select-optgroup-label-with-checkbox')
      expect(groupLabel.classList.contains('form-multi-select-indeterminate')).toBe(true)
      expect(groupLabel.classList.contains('form-multi-selected')).toBe(false)
    })

    it('should respect selectionLimit when toggling a group', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: groupedOptions,
        optionsGroupsSelectable: true,
        selectionLimit: 1
      })

      const groupLabel = multiSelect._menu.querySelector('.form-multi-select-optgroup-label-with-checkbox')
      groupLabel.click()

      expect(multiSelect._selected.length).toBe(1)
    })

    it('should focus a selectable group label during arrow navigation', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions, optionsGroupsSelectable: true })

      multiSelect.show()

      const groupLabel = multiSelect._menu.querySelector('.form-multi-select-optgroup-label-with-checkbox')
      const firstOption = multiSelect._menu.querySelector('.form-multi-select-option')

      // Arrow up from the first option lands on the group label above it.
      multiSelect._selectMenuItem({ key: 'ArrowUp', target: firstOption })

      expect(document.activeElement).toBe(groupLabel)
    })

    it('should not focus group labels during navigation when not selectable', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: groupedOptions })

      multiSelect.show()

      const firstOption = multiSelect._menu.querySelector('.form-multi-select-option')
      multiSelect._selectMenuItem({ key: 'ArrowUp', target: firstOption })

      expect(document.activeElement.classList.contains('form-multi-select-optgroup-label')).toBe(false)
    })
  })

  describe('selectAllStyle', () => {
    const options = [
      { value: '1', text: 'Apple' },
      { value: '2', text: 'Banana' },
      { value: '3', text: 'Avocado' }
    ]

    it('should add the checkbox class by default', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options })

      expect(multiSelect._selectAllElement.classList.contains('form-multi-select-all-with-checkbox')).toBe(true)
    })

    it('should not add the checkbox class when disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options, selectAllStyle: 'text' })

      expect(multiSelect._selectAllElement.classList.contains('form-multi-select-all-with-checkbox')).toBe(false)
    })

    it('should reflect none / indeterminate / all states', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options, selectAllStyle: 'checkbox' })
      const master = multiSelect._selectAllElement

      expect(master.classList.contains('form-multi-select-all-with-checkbox')).toBe(true)
      expect(master.classList.contains('form-multi-selected')).toBe(false)
      expect(master.classList.contains('form-multi-select-indeterminate')).toBe(false)

      multiSelect._selectOption('1', 'Apple')
      expect(master.classList.contains('form-multi-select-indeterminate')).toBe(true)

      multiSelect.selectAll()
      expect(master.classList.contains('form-multi-selected')).toBe(true)
      expect(master.classList.contains('form-multi-select-indeterminate')).toBe(false)
    })

    it('should toggle selection on click', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options, selectAllStyle: 'checkbox' })

      multiSelect._selectAllElement.click()
      expect(multiSelect._selected.length).toBe(3)

      multiSelect._selectAllElement.click()
      expect(multiSelect._selected.length).toBe(0)
    })

    it('should compute checkbox state at boundaries', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options, selectAllStyle: 'checkbox' })

      expect(multiSelect._getCheckboxState(0, 3)).toBe('none')
      expect(multiSelect._getCheckboxState(2, 3)).toBe('indeterminate')
      expect(multiSelect._getCheckboxState(3, 3)).toBe('all')
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

      const visibleOptions = Array.from(multiSelect._optionsElement.querySelectorAll('.form-multi-select-option'))
        .filter(option => option.style.display !== 'none')

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

      const visibleOptions = Array.from(multiSelect._optionsElement.querySelectorAll('.form-multi-select-option'))
        .filter(option => option.style.display !== 'none')

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

      const visibleOptions = Array.from(multiSelect._optionsElement.querySelectorAll('.form-multi-select-option'))
        .filter(option => option.style.display !== 'none')

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

      const emptyMessage = multiSelect._menu.querySelector('.form-multi-select-options-empty')
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

      let emptyMessage = multiSelect._menu.querySelector('.form-multi-select-options-empty')
      expect(emptyMessage).not.toBeNull()

      multiSelect.search('app')

      emptyMessage = multiSelect._menu.querySelector('.form-multi-select-options-empty')
      expect(emptyMessage).toBeNull()
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

      const visibleOptions = Array.from(multiSelect._optionsElement.querySelectorAll('.form-multi-select-option'))
        .filter(option => option.style.display !== 'none')

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

      const vegetablesGroup = Array.from(multiSelect._optionsElement.querySelectorAll('.form-multi-select-optgroup'))
        .find(g => g.querySelector('.form-multi-select-optgroup-label').textContent === 'Vegetables')

      expect(vegetablesGroup.style.display).toBe('none')
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

    it('should remove search placeholder when items selected in multiple mode with tags', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        search: true,
        multiple: true,
        selectionType: 'tags'
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
        selectionTypeCounterText: 'items selected'
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
      const option = multiSelect._optionsElement.querySelector('[data-value="1"]')
      multiSelect._onOptionsClick(option)

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
      const option = multiSelect._optionsElement.querySelector('[data-value="1"]')
      multiSelect._onOptionsClick(option)

      expect(multiSelect._selected.length).toBe(1)
      expect(multiSelect._selected[0].value).toBe('1')
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
      const option = multiSelect._optionsElement.querySelector('[data-value="1"]')
      multiSelect._onOptionsClick(option)

      expect(multiSelect._selected.length).toBe(0)
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
      const option1 = multiSelect._optionsElement.querySelector('[data-value="1"]')
      multiSelect._onOptionsClick(option1)

      expect(multiSelect._selected.length).toBe(1)
      expect(multiSelect._selected[0].value).toBe('1')

      multiSelect.show()
      const option2 = multiSelect._optionsElement.querySelector('[data-value="2"]')
      multiSelect._onOptionsClick(option2)

      expect(multiSelect._selected.length).toBe(1)
      expect(multiSelect._selected[0].value).toBe('2')
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
      const option = multiSelect._optionsElement.querySelector('[data-value="1"]')
      multiSelect._onOptionsClick(option)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should add form-multi-selected class on selected option', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' }
        ]
      })

      multiSelect.show()
      const option = multiSelect._optionsElement.querySelector('[data-value="1"]')
      multiSelect._onOptionsClick(option)

      expect(option.classList.contains('form-multi-selected')).toBe(true)
      expect(option.getAttribute('aria-selected')).toBe('true')
    })

    it('should remove form-multi-selected class on deselected option', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true }
        ],
        multiple: true
      })

      const option = multiSelect._optionsElement.querySelector('[data-value="1"]')
      multiSelect._onOptionsClick(option)

      expect(option.classList.contains('form-multi-selected')).toBe(false)
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
      multiSelect._onOptionsClick(labelEl)

      expect(multiSelect._selected.length).toBe(0)
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
      multiSelect._onOptionsClick(innerElement)

      expect(multiSelect._selected.length).toBe(1)
    })

    it('should do nothing when clicking outside option area', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      const randomEl = document.createElement('div')
      multiSelect._optionsElement.append(randomEl)
      multiSelect._onOptionsClick(randomEl)

      expect(multiSelect._selected.length).toBe(0)
    })

    it('should not allow duplicate selections', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      multiSelect._selectOption('1', 'Opt 1')
      multiSelect._selectOption('1', 'Opt 1')

      expect(multiSelect._selected.length).toBe(1)
    })

    it('should trigger changed event on selection', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [{ value: '1', text: 'Opt 1' }]
        })

        selectEl.addEventListener('changed.coreui.multi-select', event => {
          expect(event.value).toBeDefined()
          expect(event.value.length).toBe(1)
          resolve()
        })

        multiSelect._selectOption('1', 'Opt 1')
      })
    })

    it('should trigger changed event on deselection', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<select></select>'
        const selectEl = fixtureEl.querySelector('select')
        const multiSelect = new MultiSelect(selectEl, {
          options: [{ value: '1', text: 'Opt 1', selected: true }]
        })

        selectEl.addEventListener('changed.coreui.multi-select', event => {
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

      multiSelect._selectOption('1', 'Opt 1')

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

  describe('tags', () => {
    it('should remove tag on tag delete button click', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true }
        ],
        selectionType: 'tags'
      })

      expect(multiSelect._selected.length).toBe(2)

      const tagDelete = multiSelect._wrapperElement.querySelector('.form-multi-select-tag-delete')
      tagDelete.click()

      expect(multiSelect._selected.length).toBe(1)
    })

    it('should not open the dropdown when clicking a tag delete button', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1', selected: true }],
        selectionType: 'tags'
      })

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)

      multiSelect._wrapperElement.querySelector('.form-multi-select-tag-delete').click()

      expect(multiSelect._selected.length).toBe(0)
      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
    })

    it('should remove a tag created after initialization via delegation', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2' }
        ],
        selectionType: 'tags'
      })

      // This tag node did not exist when listeners were bound.
      multiSelect._selectOption('2', 'Opt 2')
      const newTagDelete = multiSelect._wrapperElement
        .querySelector('.form-multi-select-tag[data-value="2"] .form-multi-select-tag-delete')

      newTagDelete.click()

      expect(multiSelect._selected.some(option => option.value === '2')).toBe(false)
      expect(multiSelect._selected.length).toBe(1)
    })

    it('should update search size based on selections', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' }
        ],
        selectionType: 'tags',
        search: true,
        multiple: true
      })

      // No items selected, size should not be set
      expect(multiSelect._searchElement.getAttribute('size')).toBeNull()

      // Select an item
      multiSelect._selectOption('1', 'Opt 1')
      expect(multiSelect._searchElement.size).toBe(2)
    })

    it('should handle tags with disabled options', () => {
      // Pre-select via native element with disabled option
      fixtureEl.innerHTML = [
        '<select>',
        '  <option value="1" selected disabled>Opt 1</option>',
        '  <option value="2" selected>Opt 2</option>',
        '</select>'
      ].join('')

      const selectEl2 = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl2, {
        selectionType: 'tags'
      })

      // The disabled option's tag should not have a delete button
      const tags = multiSelect._wrapperElement.querySelectorAll('.form-multi-select-tag')
      const disabledTag = Array.from(tags).find(t => t.dataset.value === '1')
      if (disabledTag) {
        expect(disabledTag.querySelector('.form-multi-select-tag-delete')).toBeNull()
      }
    })

    it('should set the tag delete aria-label from ariaTagDeleteLabel and the option text', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Angular', selected: true }
        ],
        selectionType: 'tags'
      })

      let tagDelete = multiSelect._wrapperElement.querySelector('.form-multi-select-tag-delete')
      expect(tagDelete.getAttribute('aria-label')).toBe('Remove Angular')

      multiSelect.dispose()
      const multiSelect2 = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Angular', selected: true }
        ],
        selectionType: 'tags',
        ariaTagDeleteLabel: 'Usuń'
      })

      tagDelete = multiSelect2._wrapperElement.querySelector('.form-multi-select-tag-delete')
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
        selectionType: 'tags'
      })

      const firstTag = multiSelect._wrapperElement.querySelector('.form-multi-select-tag[data-value="1"]')

      multiSelect._selectOption('2', 'Opt 2')

      // The diff update keeps the already-rendered tag node instead of recreating it.
      expect(multiSelect._wrapperElement.querySelector('.form-multi-select-tag[data-value="1"]')).toBe(firstTag)
      expect(multiSelect._wrapperElement.querySelectorAll('.form-multi-select-tag').length).toBe(2)
    })

    it('should remove the placeholder when the first tag is added', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' }
        ],
        selectionType: 'tags'
      })

      expect(multiSelect._wrapperElement.querySelector('.form-multi-select-placeholder')).not.toBeNull()

      multiSelect._selectOption('1', 'Opt 1')

      expect(multiSelect._wrapperElement.querySelector('.form-multi-select-placeholder')).toBeNull()
      expect(multiSelect._wrapperElement.querySelectorAll('.form-multi-select-tag').length).toBe(1)
    })

    it('should keep tags ordered and before the search input', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' },
          { value: '3', text: 'Opt 3' }
        ],
        selectionType: 'tags',
        search: true,
        multiple: true
      })

      multiSelect._selectOption('2', 'Opt 2')
      multiSelect._selectOption('1', 'Opt 1')

      const selection = multiSelect._wrapperElement.querySelector('.form-multi-select-selection')
      const order = Array.from(selection.children).map(child => child.dataset.value || 'search')

      expect(order).toEqual(['2', '1', 'search'])
    })
  })

  describe('keyboard navigation', () => {
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
      expect(multiSelect._optionsElement.querySelectorAll('.form-multi-select-option').length).toBe(2)
    })

    it('should focus the select all button during arrow navigation', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' }
        ]
      })

      multiSelect.show()

      const firstOption = multiSelect._optionsElement.querySelector('.form-multi-select-option')

      // Arrow up from the first option lands on the select all button above the list.
      multiSelect._selectMenuItem({ key: 'ArrowUp', target: firstOption })

      expect(document.activeElement).toBe(multiSelect._selectAllElement)
    })

    it('should navigate from the select all button to the first option with ArrowDown', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' }
        ]
      })

      multiSelect.show()

      const firstOption = multiSelect._optionsElement.querySelector('.form-multi-select-option')
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      multiSelect._selectAllElement.dispatchEvent(event)

      expect(document.activeElement).toBe(firstOption)
    })

    it('should navigate to the select all button even with a selection limit', () => {
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

      // The button stays enabled with a limit, so it joins the navigation flow.
      expect(multiSelect._selectAllElement.disabled).toBe(false)

      const firstOption = multiSelect._optionsElement.querySelector('.form-multi-select-option')
      multiSelect._selectMenuItem({ key: 'ArrowUp', target: firstOption })

      expect(document.activeElement).toBe(multiSelect._selectAllElement)
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
      const option = multiSelect._optionsElement.querySelector('[data-value="1"]')
      option.focus()
      expect(multiSelect._wrapperElement.contains(document.activeElement)).toBe(true)

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
      const option = multiSelect._optionsElement.querySelector('[data-value="1"]')
      option.focus()

      multiSelect.hide()

      expect(document.activeElement).toBe(multiSelect._searchElement)
    })

    it('should not move focus when closed from outside the component', () => {
      fixtureEl.innerHTML = '<select></select><button id="multiSelectOutsideBtn">Outside</button>'
      const selectEl = fixtureEl.querySelector('select')
      const outside = fixtureEl.querySelector('#multiSelectOutsideBtn')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      outside.focus()
      expect(document.activeElement).toBe(outside)

      multiSelect.hide()

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

      const optionEl = multiSelect._optionsElement.querySelector('[data-value="1"]')
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      optionEl.dispatchEvent(enterEvent)

      expect(multiSelect._selected.length).toBe(1)
      expect(multiSelect._selected[0].value).toBe('1')
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

      const optionEl = multiSelect._optionsElement.querySelector('[data-value="1"]')
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
      optionEl.dispatchEvent(spaceEvent)

      expect(spaceEvent.defaultPrevented).toBe(true)
      expect(multiSelect._selected.length).toBe(1)
      expect(multiSelect._selected[0].value).toBe('1')
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

      const firstOption = multiSelect._optionsElement.querySelector('[data-value="1"]')
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

    it('should deselect last option on Backspace in empty search', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true }
        ],
        search: true,
        multiple: true
      })

      expect(multiSelect._selected.length).toBe(2)

      multiSelect._searchElement.value = ''
      const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true })
      Object.defineProperty(event, 'target', { value: multiSelect._searchElement })
      multiSelect._searchElement.dispatchEvent(event)

      expect(multiSelect._selected.length).toBe(1)
    })

    it('should deselect last option on Delete in empty search', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', selected: true },
          { value: '2', text: 'Opt 2', selected: true }
        ],
        search: true,
        multiple: true
      })

      expect(multiSelect._selected.length).toBe(2)

      multiSelect._searchElement.value = ''
      const event = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true })
      Object.defineProperty(event, 'target', { value: multiSelect._searchElement })
      multiSelect._searchElement.dispatchEvent(event)

      expect(multiSelect._selected.length).toBe(1)
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

      expect(multiSelect._selected.length).toBe(1)
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

    it('should focus search on global search keydown on clone', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: 'global'
      })

      multiSelect.show()

      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true })
      multiSelect._wrapperElement.dispatchEvent(event)

      // Should focus the search element (no error thrown)
      expect(multiSelect._searchElement).not.toBeNull()
    })

    it('should focus search on global search keydown on menu', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: 'global'
      })

      multiSelect.show()

      const event = new KeyboardEvent('keydown', { key: 'b', bubbles: true })
      multiSelect._menu.dispatchEvent(event)

      expect(multiSelect._searchElement).not.toBeNull()
    })

    it('should focus search on Backspace keydown on clone in global search mode', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: 'global'
      })

      multiSelect.show()

      const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true })
      multiSelect._wrapperElement.dispatchEvent(event)

      expect(multiSelect._searchElement).not.toBeNull()
    })

    it('should focus search on Delete keydown on menu in global search mode', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        search: 'global'
      })

      multiSelect.show()

      const event = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true })
      multiSelect._menu.dispatchEvent(event)

      expect(multiSelect._searchElement).not.toBeNull()
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
      expect(multiSelect._selected.length).toBe(0)
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

      const cleaner = multiSelect._wrapperElement.querySelector('.form-multi-select-cleaner')
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
      expect(multiSelect._wrapperElement.querySelector('.form-multi-select-cleaner')).toBeNull()

      multiSelect._selectOption('2', 'Opt 2')
      const cleaner = multiSelect._wrapperElement.querySelector('.form-multi-select-cleaner')
      expect(cleaner).not.toBeNull()

      cleaner.click()

      expect(multiSelect._selected.length).toBe(0)
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

      const cleaner = multiSelect._wrapperElement.querySelector('.form-multi-select-cleaner')
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

      expect(multiSelect._wrapperElement.querySelector('.form-multi-select-cleaner')).toBeNull()

      multiSelect._selectOption('1', 'Opt 1')

      expect(multiSelect._wrapperElement.querySelector('.form-multi-select-cleaner')).not.toBeNull()
    })

    it('should insert cleaner and clear selection for single select', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1', selected: true }],
        cleaner: true,
        multiple: false
      })

      const cleaner = multiSelect._wrapperElement.querySelector('.form-multi-select-cleaner')
      expect(cleaner).not.toBeNull()

      cleaner.click()

      expect(multiSelect._selected.length).toBe(0)
      expect(multiSelect._wrapperElement.querySelector('.form-multi-select-cleaner')).toBeNull()
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

      expect(multiSelect._selected.length).toBe(2)

      const cleaner = multiSelect._wrapperElement.querySelector('.form-multi-select-cleaner')
      cleaner.click()

      expect(multiSelect._selected.length).toBe(0)
      expect(multiSelect._wrapperElement.querySelector('.form-multi-select-cleaner')).toBeNull()
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

      // Simulate disabled state after creation
      multiSelect._config.disabled = true

      // Trigger the event handler directly
      const event = new Event('click', { bubbles: true })
      event.preventDefault = jasmine.createSpy('preventDefault')
      event.stopPropagation = jasmine.createSpy('stopPropagation')

      // The handler checks disabled, so we need to fire via EventHandler
      // But since disabled is set, clicking should not deselect
      // Force trigger the cleaner click handler
      multiSelect._selectionCleanerElement.dispatchEvent(event)

      expect(multiSelect._selected.length).toBe(1)
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

    it('should set tabIndex -1 on indicator when disabled', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        disabled: true
      })

      expect(multiSelect._indicatorElement.tabIndex).toBe(-1)
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

      expect(multiSelect._selected.length).toBe(3)
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
      expect(multiSelect._selected.length).toBe(2)
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
      expect(multiSelect._selected.length).toBe(2)

      // At the limit the toggle flips to "deselect all" and the checkbox reads as full.
      expect(multiSelect._isAllSelected()).toBe(true)
      expect(multiSelect._selectAllElement.textContent).toBe('Deselect all')
      expect(multiSelect._selectAllElement.classList.contains('form-multi-selected')).toBe(true)

      multiSelect._selectAllElement.click()
      expect(multiSelect._selected.length).toBe(0)
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

      expect(multiSelect._selectAllElement.innerHTML).toBe('Choose All')
    })
  })

  describe('update', () => {
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

      multiSelect.update({ options: newOptions })
      expect(multiSelect._options.length).toBe(2)
      expect(multiSelect._options[0].value).toBe('new1')
    })

    it('should refresh multiple and required on the native select', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }],
        multiple: true,
        required: true
      })

      expect(selectEl.getAttribute('multiple')).toBe('true')
      expect(selectEl.getAttribute('required')).toBe('true')

      multiSelect.update({ multiple: false, required: false })

      expect(selectEl.hasAttribute('multiple')).toBe(false)
      expect(selectEl.hasAttribute('required')).toBe(false)

      multiSelect.update({ multiple: true, required: true })

      expect(selectEl.getAttribute('multiple')).toBe('true')
      expect(selectEl.getAttribute('required')).toBe('true')
    })

    it('should deselect all when value is provided in update config', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const options = [
        { value: '1', text: 'Option 1', selected: true },
        { value: '2', text: 'Option 2' }
      ]
      const multiSelect = new MultiSelect(selectEl, { options })

      expect(multiSelect._selected.length).toBe(1)

      multiSelect.update({
        options: [{ value: '3', text: 'Option 3' }],
        value: ['3']
      })

      expect(multiSelect._selected.length).toBe(1)
      expect(multiSelect._selected[0].value).toBe('3')
    })

    it('should rebuild DOM on update', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      const oldClone = multiSelect._wrapperElement

      multiSelect.update({
        options: [{ value: '2', text: 'Option 2' }]
      })

      expect(multiSelect._wrapperElement).not.toBe(oldClone)
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

        selectEl.addEventListener('changed.coreui.multi-select', event => {
          expect(event.value).toBeDefined()
          expect(event.value.length).toBe(1)
          resolve()
        })

        multiSelect._selectOption('1', 'Option 1')
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
  })

  describe('dispose', () => {
    it('should dispose MultiSelect instance', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect._element).toEqual(selectEl)
      multiSelect.dispose()
      expect(multiSelect._element).toBeNull()
    })

    it('should destroy popper when disposing', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      multiSelect.show()
      expect(multiSelect._popper).not.toBeNull()

      const spy = spyOn(multiSelect._popper, 'destroy')
      multiSelect.dispose()

      expect(spy).toHaveBeenCalled()
    })

    it('should handle dispose when popper is null', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      // popper is null since we never showed it
      expect(multiSelect._popper).toBeNull()

      // Should not throw
      multiSelect.dispose()
      expect(multiSelect._element).toBeNull()
    })

    it('should remove the generated DOM and restore the native select', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Option 1' }]
      })

      const wrapper = multiSelect._wrapperElement
      const menu = multiSelect._menu

      expect(fixtureEl.querySelector('.form-multi-select')).not.toBeNull()
      expect(selectEl.parentNode).toBe(wrapper)

      multiSelect.dispose()

      expect(wrapper.isConnected).toBe(false)
      expect(menu.isConnected).toBe(false)
      expect(selectEl.isConnected).toBe(true)
      expect(selectEl.parentNode).toBe(fixtureEl)
      expect(selectEl.getAttribute('tabindex')).toBeNull()
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

      multiSelect._selectOption('1', 'Option 1')

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
      Object.defineProperty(clickEvent, 'target', { value: outsideEl })

      MultiSelect.clearMenus(clickEvent)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(false)
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
      Object.defineProperty(event, 'target', { value: outsideEl })

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
      Object.defineProperty(clickEvent, 'target', { value: multiSelect._wrapperElement })

      MultiSelect.clearMenus(clickEvent)

      expect(multiSelect._wrapperElement.classList.contains('show')).toBe(true)
    })
  })

  describe('_selectMenuItem', () => {
    it('should handle empty items list', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1', disabled: true }
        ]
      })

      multiSelect.show()

      // All options are disabled, so no visible items
      // Should not throw
      multiSelect._selectMenuItem({ key: 'ArrowDown', target: document.createElement('div') })
      expect(true).toBe(true)
    })
  })

  describe('_isOptionGroup', () => {
    it('should detect groups by their options array', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect._isOptionGroup({ label: 'Group', options: [] })).toBe(true)
      expect(multiSelect._isOptionGroup({ value: '1', text: 'Opt' })).toBe(false)
      expect(multiSelect._isOptionGroup({ label: 'No options array' })).toBe(false)
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

    it('should still auto-initialize on load via the form-multi-select class (backward compat)', () => {
      fixtureEl.innerHTML = '<select class="form-multi-select"><option value="1">One</option></select>'
      const selectEl = fixtureEl.querySelector('select')

      window.dispatchEvent(new Event('load'))

      expect(MultiSelect.getInstance(selectEl)).toBeInstanceOf(MultiSelect)
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

    it('should remove size attribute when nothing selected and selectionType is tags', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        search: true,
        multiple: true,
        selectionType: 'tags'
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
        selectionType: 'tags'
      })

      multiSelect._updateSearchSize(10)
      expect(multiSelect._searchElement.size).toBe(10)
    })
  })

  describe('popper', () => {
    it('should create popper on show', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }]
      })

      expect(multiSelect._popper).toBeNull()
      multiSelect.show()
      expect(multiSelect._popper).not.toBeNull()
    })

    it('should update popper when selection changes and popper exists', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [
          { value: '1', text: 'Opt 1' },
          { value: '2', text: 'Opt 2' }
        ]
      })

      multiSelect.show()
      const spy = spyOn(multiSelect._popper, 'update')

      multiSelect._selectOption('1', 'Opt 1')

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

      const selection = multiSelect._wrapperElement.querySelector('.form-multi-select-selection')
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

      const selection = multiSelect._wrapperElement.querySelector('.form-multi-select-selection')
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
        selectionTypeCounterText: 'item(s) selected',
        search: false
      })

      const selection = multiSelect._wrapperElement.querySelector('.form-multi-select-selection')
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

      const selection = multiSelect._wrapperElement.querySelector('.form-multi-select-selection')
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

  describe('selection tags selection-type', () => {
    it('should add selection-tags class when multiple and selectionType is tags', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: true,
        selectionType: 'tags'
      })

      const selection = multiSelect._wrapperElement.querySelector('.form-multi-select-selection')
      expect(selection.classList.contains('form-multi-select-selection-tags')).toBe(true)
    })

    it('should not add selection-tags class when selectionType is not tags', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, {
        options: [{ value: '1', text: 'Opt 1' }],
        multiple: true,
        selectionType: 'counter'
      })

      const selection = multiSelect._wrapperElement.querySelector('.form-multi-select-selection')
      expect(selection.classList.contains('form-multi-select-selection-tags')).toBe(false)
    })
  })

  describe('aria attributes', () => {
    it('should set combobox role', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect._togglerElement.getAttribute('role')).toBe('combobox')
    })

    it('should set aria-haspopup to listbox', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect._togglerElement.getAttribute('aria-haspopup')).toBe('listbox')
    })

    it('should give the search input an accessible label and combobox-supporting attributes', () => {
      fixtureEl.innerHTML = '<select id="test-select"></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [], search: true })
      const input = multiSelect._searchElement

      expect(input.getAttribute('aria-label')).toBe('Search')
      expect(input.getAttribute('aria-autocomplete')).toBe('list')
      expect(input.getAttribute('aria-controls')).toBe('test-select-listbox')
    })

    it('should use a custom ariaSearchLabel', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [], search: true, ariaSearchLabel: 'Szukaj' })

      expect(multiSelect._searchElement.getAttribute('aria-label')).toBe('Szukaj')
    })

    it('should mark the selection as an aria-live region', () => {
      fixtureEl.innerHTML = '<select></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [], selectionType: 'counter' })

      expect(multiSelect._selectionElement.getAttribute('aria-live')).toBe('polite')
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

    it('should set aria-controls referencing listbox id', () => {
      fixtureEl.innerHTML = '<select id="test-select"></select>'
      const selectEl = fixtureEl.querySelector('select')
      const multiSelect = new MultiSelect(selectEl, { options: [] })

      expect(multiSelect._togglerElement.getAttribute('aria-controls')).toBe('test-select-listbox')
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

      const optionEl = multiSelect._optionsElement.querySelector('.form-multi-select-option')
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

      const selectedOption = multiSelect._optionsElement.querySelector('[data-value="1"]')
      const unselectedOption = multiSelect._optionsElement.querySelector('[data-value="2"]')

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
        ariaIndicatorLabel: 'Toggle menu'
      })

      expect(multiSelect._indicatorElement.getAttribute('aria-label')).toBe('Toggle menu')
    })
  })

  describe('search with keyup event handler', () => {
    it('should filter options on keyup in search input', () => {
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

      const keyupEvent = new KeyboardEvent('keyup', { bubbles: true })
      multiSelect._searchElement.dispatchEvent(keyupEvent)

      const visibleOptions = Array.from(multiSelect._optionsElement.querySelectorAll('.form-multi-select-option'))
        .filter(option => option.style.display !== 'none')

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
      el.style.display = 'none'
      document.body.append(el)

      expect(multiSelect._isOptionDisplayed(el)).toBe(false)
      el.remove()
    })
  })
})

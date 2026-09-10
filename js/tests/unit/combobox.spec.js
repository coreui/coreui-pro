import Combobox from '../../src/combobox.js'
import { CARET_ICON } from '../../src/util/icons.js'
import { DefaultAllowlist } from '../../src/util/sanitizer.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('Combobox', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const defaultOptions = [
    '<div class="list-box-option" data-coreui-value="us">United States</div>',
    '<div class="list-box-option" data-coreui-value="uk">United Kingdom</div>',
    '<div class="list-box-option" data-coreui-value="ca">Canada</div>'
  ]

  const setMarkup = (attrs = '', options = null) => {
    fixtureEl.innerHTML = [
      `<button class="form-control combobox-toggle" type="button"${attrs}>`,
      '<span class="combobox-value"></span>',
      '</button>',
      '<div class="popup combobox-popup">',
      '<div class="list-box">',
      '<div class="list-box-options" aria-label="Country">',
      ...(options ?? defaultOptions),
      '</div>',
      '</div>',
      '</div>'
    ].join('')

    return fixtureEl.querySelector('.combobox-toggle')
  }

  const value = toggle => toggle.querySelector('.combobox-value').textContent
  const menu = combobox => combobox._menu
  const option = (combobox, key) => combobox._menu.querySelector(`[data-coreui-value="${key}"]`)
  const searchField = combobox => combobox._menu.querySelector('[data-coreui-list-box-search]')

  const click = element => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  }

  const keydown = (target, key) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    target.dispatchEvent(event)
    return event
  }

  const type = (element, text) => {
    element.value = text
    element.dispatchEvent(new Event('input', { bubbles: true }))
  }

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Combobox.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Combobox.DATA_KEY).toEqual('coreui.combobox')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(Combobox.NAME).toEqual('combobox')
    })
  })

  describe('Default', () => {
    it('should return default configuration', () => {
      expect(Combobox.Default).toEqual({
        allowList: DefaultAllowlist,
        ariaSearchLabel: 'Search options',
        caretIcon: CARET_ICON,
        container: false,
        disabled: false,
        html: false,
        indicator: 'none',
        items: [],
        multiple: false,
        name: null,
        placeholder: '',
        sanitize: true,
        sanitizeFn: null,
        search: false,
        searchNormalize: false,
        searchPlaceholder: 'Search',
        selectedText: '{count} selected',
        selectionLimit: null,
        typeahead: true,
        value: null
      })
    })
  })

  describe('DefaultType', () => {
    it('should return default type configuration', () => {
      expect(Combobox.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('constructor', () => {
    it('should mark the toggle and take the panel out of the document', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)

      expect(toggle.getAttribute('aria-haspopup')).toEqual('listbox')
      expect(toggle.getAttribute('aria-expanded')).toEqual('false')
      expect(toggle.type).toEqual('button')
      expect(menu(combobox).isConnected).toBeFalse()
      expect(menu(combobox).classList.contains('combobox-popup')).toBeTrue()
    })

    it('should build the caret from the default icon', () => {
      const toggle = setMarkup()
      // eslint-disable-next-line no-new
      new Combobox(toggle)

      const caret = toggle.querySelector('.combobox-caret')

      expect(caret).not.toBeNull()
      expect(caret.getAttribute('aria-hidden')).toEqual('true')
    })

    it('should keep the caret the markup already carries', () => {
      const toggle = setMarkup()
      toggle.insertAdjacentHTML('beforeend', '<svg class="combobox-caret" data-mine></svg>')
      // eslint-disable-next-line no-new
      new Combobox(toggle)

      expect(toggle.querySelectorAll('.combobox-caret').length).toEqual(1)
      expect(toggle.querySelector('.combobox-caret').hasAttribute('data-mine')).toBeTrue()
    })

    it('should build the value element when the markup has none', () => {
      fixtureEl.innerHTML = [
        '<button class="form-control" type="button"></button>',
        '<div class="popup"><div class="list-box"><div class="list-box-options"></div></div></div>'
      ].join('')
      const toggle = fixtureEl.querySelector('button')
      // eslint-disable-next-line no-new
      new Combobox(toggle)

      expect(toggle.querySelector('.combobox-value')).not.toBeNull()
      expect(toggle.classList.contains('combobox-toggle')).toBeTrue()
    })

    it('should take the disabled attribute of the toggle as the disabled option', () => {
      const toggle = setMarkup(' disabled')
      const combobox = new Combobox(toggle)

      combobox.show()

      expect(combobox._config.disabled).toBeTrue()
      expect(toggle.classList.contains('show')).toBeFalse()
    })
  })

  describe('data api', () => {
    it('should toggle the panel on a click on the toggle', () => {
      const toggle = setMarkup(' data-coreui-toggle="combobox"')
      // eslint-disable-next-line no-new
      new Combobox(toggle)

      click(toggle)

      expect(toggle.classList.contains('show')).toBeTrue()

      click(toggle)

      expect(toggle.classList.contains('show')).toBeFalse()
    })

    it('should close an open panel on a click outside it', () => {
      const toggle = setMarkup(' data-coreui-toggle="combobox"')
      const combobox = new Combobox(toggle)

      combobox.show()
      click(document.body)

      expect(toggle.classList.contains('show')).toBeFalse()
    })

    it('should read the options from data attributes', () => {
      const toggle = setMarkup(' data-coreui-toggle="combobox" data-coreui-multiple="true" data-coreui-placeholder="Pick one"')
      const combobox = new Combobox(toggle)

      expect(combobox._config.multiple).toBeTrue()
      expect(value(toggle)).toEqual('Pick one')
    })
  })

  describe('placeholder and selectedText', () => {
    it('should show the placeholder while nothing is selected', () => {
      const toggle = setMarkup()
      // eslint-disable-next-line no-new
      new Combobox(toggle, { placeholder: 'Pick a country' })

      expect(value(toggle)).toEqual('Pick a country')
      expect(toggle.querySelector('.combobox-value').classList.contains('combobox-placeholder')).toBeTrue()
    })

    it('should show the label of the selected option', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { placeholder: 'Pick a country' })

      combobox.setValue('ca')

      expect(value(toggle)).toEqual('Canada')
      expect(toggle.querySelector('.combobox-value').classList.contains('combobox-placeholder')).toBeFalse()
    })

    it('should show the option label element rather than the whole option', () => {
      const toggle = setMarkup('', [
        '<div class="list-box-option" data-coreui-value="free">',
        '<span class="list-box-option-label">Free</span>',
        '<span class="list-box-option-description">One project</span>',
        '</div>'
      ])
      const combobox = new Combobox(toggle)

      combobox.setValue('free')

      expect(value(toggle)).toEqual('Free')
    })

    it('should count the selection past one in multiple mode', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { multiple: true })

      combobox.setValue(['us'])

      expect(value(toggle)).toEqual('United States')

      combobox.setValue(['us', 'ca'])

      expect(value(toggle)).toEqual('2 selected')
    })

    it('should take the count text from selectedText', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { multiple: true, selectedText: 'wybrano: {count}' })

      combobox.setValue(['us', 'ca'])

      expect(value(toggle)).toEqual('wybrano: 2')
    })
  })

  describe('selection', () => {
    it('should close the panel and return the focus on a single selection', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)

      combobox.show()
      click(option(combobox, 'uk'))

      expect(combobox.getValue()).toEqual('uk')
      expect(toggle.classList.contains('show')).toBeFalse()
      expect(document.activeElement).toEqual(toggle)
    })

    it('should keep the panel open in multiple mode', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { multiple: true })

      combobox.show()
      click(option(combobox, 'uk'))
      click(option(combobox, 'ca'))

      expect(combobox.getValue()).toEqual(['uk', 'ca'])
      expect(toggle.classList.contains('show')).toBeTrue()
    })

    it('should replace the selection in single mode', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)

      combobox.setValue('uk')
      combobox.setValue('ca')

      expect(combobox.getValue()).toEqual('ca')
    })

    it('should keep only the first value of an array in single mode', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)

      combobox.setValue(['uk', 'ca'])

      expect(combobox.getValue()).toEqual('uk')
    })

    it('should empty the selection with clear', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { placeholder: 'Pick a country' })

      combobox.setValue('uk')
      combobox.clear()

      expect(combobox.getValue()).toBeNull()
      expect(value(toggle)).toEqual('Pick a country')
    })

    it('should cap the selection at selectionLimit', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { multiple: true, selectionLimit: 2 })

      combobox.setValue(['us', 'uk', 'ca'])

      expect(combobox.getValue()).toEqual(['us', 'uk'])
    })
  })

  describe('value and selected markup', () => {
    it('should seed the selection from the value option', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { value: 'ca' })

      expect(combobox.getValue()).toEqual('ca')
      expect(value(toggle)).toEqual('Canada')
    })

    it('should seed the selection from the selected class in the markup', () => {
      const toggle = setMarkup('', [
        '<div class="list-box-option" data-coreui-value="us">United States</div>',
        '<div class="list-box-option selected" data-coreui-value="uk">United Kingdom</div>'
      ])
      const combobox = new Combobox(toggle)

      expect(combobox.getValue()).toEqual('uk')
      expect(value(toggle)).toEqual('United Kingdom')
    })

    it('should take both, with the value option first', () => {
      const toggle = setMarkup('', [
        '<div class="list-box-option" data-coreui-value="us">United States</div>',
        '<div class="list-box-option selected" data-coreui-value="uk">United Kingdom</div>'
      ])
      const combobox = new Combobox(toggle, { multiple: true, value: ['us'] })

      expect(combobox.getValue()).toEqual(['us', 'uk'])
    })

    it('should split a comma separated value attribute', () => {
      const toggle = setMarkup(' data-coreui-multiple="true" data-coreui-value="us,ca"')
      const combobox = new Combobox(toggle)

      expect(combobox.getValue()).toEqual(['us', 'ca'])
    })
  })

  describe('name and the hidden input', () => {
    it('should insert a hidden input before the toggle', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { name: 'country' })

      combobox.setValue('ca')

      const input = toggle.previousElementSibling

      expect(input.type).toEqual('hidden')
      expect(input.name).toEqual('country')
      expect(input.value).toEqual('ca')
    })

    it('should join the values with a comma in multiple mode', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { multiple: true, name: 'country' })

      combobox.setValue(['us', 'ca'])

      expect(toggle.previousElementSibling.value).toEqual('us,ca')
    })

    it('should build no hidden input without a name', () => {
      const toggle = setMarkup()
      // eslint-disable-next-line no-new
      new Combobox(toggle)

      expect(toggle.previousElementSibling).toBeNull()
    })
  })

  describe('items', () => {
    it('should render the list from the items option', () => {
      fixtureEl.innerHTML = '<button class="form-control" type="button"></button>'
      const toggle = fixtureEl.querySelector('button')
      const combobox = new Combobox(toggle, {
        items: [
          { value: 'us', label: 'United States' },
          { label: 'Europe', items: [{ value: 'uk', label: 'United Kingdom' }] }
        ]
      })

      expect(menu(combobox).querySelectorAll('.list-box-option').length).toEqual(2)
      expect(menu(combobox).querySelector('.list-box-section-label').textContent).toEqual('Europe')
    })

    it('should rebuild the list with setItems', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)

      combobox.setValue('ca')
      combobox.setItems([{ value: 'ca', label: 'Kanada' }, { value: 'de', label: 'Germany' }])

      expect(menu(combobox).querySelectorAll('.list-box-option').length).toEqual(2)
      expect(combobox.getValue()).toEqual('ca')
      expect(value(toggle)).toEqual('Kanada')
    })

    it('should drop a value the new items no longer carry', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { placeholder: 'Pick a country' })

      combobox.setValue('ca')
      combobox.setItems([{ value: 'de', label: 'Germany' }])

      expect(combobox.getValue()).toBeNull()
      expect(value(toggle)).toEqual('Pick a country')
    })
  })

  describe('search', () => {
    it('should render the search field of the list box in the panel', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { search: true, searchPlaceholder: 'Filter' })

      const field = searchField(combobox)

      expect(field).not.toBeNull()
      expect(field.classList.contains('list-box-search')).toBeTrue()
      expect(field.nextElementSibling.classList.contains('list-box-options')).toBeTrue()
      expect(field.placeholder).toEqual('Filter')
      expect(field.getAttribute('aria-label')).toEqual('Search options')
    })

    it('should filter the options and clear the field on hide', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { search: true })

      combobox.show()
      type(searchField(combobox), 'kingdom')

      expect(option(combobox, 'uk').hasAttribute('hidden')).toBeFalse()
      expect(option(combobox, 'ca').hasAttribute('hidden')).toBeTrue()

      combobox.hide()

      expect(searchField(combobox).value).toEqual('')
      expect(option(combobox, 'ca').hasAttribute('hidden')).toBeFalse()
    })

    it('should match past the accents with searchNormalize', () => {
      const toggle = setMarkup('', ['<div class="list-box-option" data-coreui-value="zoe">Zoë</div>'])
      const combobox = new Combobox(toggle, { search: true, searchNormalize: true })

      combobox.show()
      type(searchField(combobox), 'zoe')

      expect(option(combobox, 'zoe').hasAttribute('hidden')).toBeFalse()
    })

    it('should report the query and filter nothing in external mode', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { search: 'external' })
      const spy = jasmine.createSpy('search')

      toggle.addEventListener('search.coreui.combobox', event => spy(event.query))
      combobox.show()
      type(searchField(combobox), 'zzz')

      expect(spy).toHaveBeenCalledWith('zzz')
      expect(option(combobox, 'ca').hasAttribute('hidden')).toBeFalse()
    })
  })

  describe('activeDescendant', () => {
    it('should keep the active option on the toggle without a search field', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)

      combobox.show()
      keydown(toggle, 'ArrowDown')

      expect(toggle.getAttribute('aria-activedescendant')).toEqual(option(combobox, 'us').id)

      keydown(toggle, 'ArrowDown')

      expect(toggle.getAttribute('aria-activedescendant')).toEqual(option(combobox, 'uk').id)
    })

    it('should keep the active option on the search field when there is one', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { search: true })

      combobox.show()
      keydown(searchField(combobox), 'ArrowDown')

      expect(searchField(combobox).getAttribute('aria-activedescendant')).toEqual(option(combobox, 'us').id)
      expect(toggle.hasAttribute('aria-activedescendant')).toBeFalse()
    })
  })

  describe('keyboard', () => {
    it('should open the panel on ArrowDown, ArrowUp, Enter and Space', () => {
      for (const key of ['ArrowDown', 'ArrowUp', 'Enter', ' ']) {
        const toggle = setMarkup()
        const combobox = new Combobox(toggle)

        keydown(toggle, key)

        expect(toggle.classList.contains('show')).withContext(key).toBeTrue()

        combobox.dispose()
      }
    })

    it('should select the active option with Enter and close the panel', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)

      combobox.show()
      keydown(toggle, 'ArrowDown')
      keydown(toggle, 'Enter')

      expect(combobox.getValue()).toEqual('us')
      expect(toggle.classList.contains('show')).toBeFalse()
    })

    it('should close the panel on Escape and keep the focus on the toggle', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)

      combobox.show()
      toggle.focus()
      keydown(toggle, 'Escape')

      expect(toggle.classList.contains('show')).toBeFalse()
      expect(document.activeElement).toEqual(toggle)
    })

    it('should close the panel on Escape from inside it', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { search: true })

      combobox.show()
      keydown(searchField(combobox), 'Escape')

      expect(toggle.classList.contains('show')).toBeFalse()
      expect(document.activeElement).toEqual(toggle)
    })

    it('should close the panel on Tab', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)

      combobox.show()
      keydown(toggle, 'Tab')

      expect(toggle.classList.contains('show')).toBeFalse()
    })
  })

  describe('events', () => {
    it('should fire show, shown, hide and hidden', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)
      const fired = []

      for (const name of ['show', 'shown', 'hide', 'hidden']) {
        toggle.addEventListener(`${name}.coreui.combobox`, () => fired.push(name))
      }

      combobox.show()
      combobox.hide()

      expect(fired).toEqual(['show', 'shown', 'hide', 'hidden'])
    })

    it('should fire change with the value', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)
      const spy = jasmine.createSpy('change')

      toggle.addEventListener('change.coreui.combobox', event => spy(event.value))
      combobox.show()
      click(option(combobox, 'ca'))

      expect(spy).toHaveBeenCalledWith('ca')
    })

    it('should fire change with the array of values in multiple mode', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { multiple: true })
      const spy = jasmine.createSpy('change')

      toggle.addEventListener('change.coreui.combobox', event => spy(event.value))
      combobox.show()
      click(option(combobox, 'ca'))

      expect(spy).toHaveBeenCalledWith(['ca'])
    })

    it('should leave the value alone when the list box select event is cancelled', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { placeholder: 'Pick a country' })

      combobox._listBoxElement.addEventListener('select.coreui.list-box', event => event.preventDefault())
      combobox.show()
      click(option(combobox, 'ca'))

      expect(combobox.getValue()).toBeNull()
      expect(value(toggle)).toEqual('Pick a country')
    })
  })

  describe('update', () => {
    it('should re-read the panel and the value', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)

      combobox.setValue('ca')
      option(combobox, 'ca').textContent = 'Kanada'
      combobox.update()

      expect(value(toggle)).toEqual('Kanada')
    })
  })

  describe('dispose', () => {
    it('should put the panel back and remove the hidden input', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { name: 'country' })
      const panel = menu(combobox)

      combobox.dispose()

      expect(Combobox.getInstance(toggle)).toBeNull()
      expect(toggle.nextElementSibling).toEqual(panel)
      expect(toggle.previousElementSibling).toBeNull()
      expect(toggle.hasAttribute('aria-expanded')).toBeFalse()
    })
  })

  describe('jQueryInterface', () => {
    it('should create a combobox and call a method on it', () => {
      const toggle = setMarkup()

      jQueryMock.fn.combobox = Combobox.jQueryInterface
      jQueryMock.elements = [toggle]

      jQueryMock.fn.combobox.call(jQueryMock)

      expect(Combobox.getInstance(toggle)).not.toBeNull()

      jQueryMock.fn.combobox.call(jQueryMock, 'show')

      expect(toggle.classList.contains('show')).toBeTrue()
    })

    it('should throw an error on undefined method', () => {
      const toggle = setMarkup()

      jQueryMock.fn.combobox = Combobox.jQueryInterface
      jQueryMock.elements = [toggle]

      expect(() => {
        jQueryMock.fn.combobox.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })
})

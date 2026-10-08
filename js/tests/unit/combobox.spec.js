import Combobox from '../../src/combobox.js'
import { updateValidationState } from '../../src/util/form-validation.js'
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

  const setMarkupInForm = (attrs = '', options = null, after = '') => {
    setMarkup(attrs, options)

    const form = document.createElement('form')
    form.append(...fixtureEl.childNodes)
    form.insertAdjacentHTML('beforeend', after)
    fixtureEl.append(form)

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
        invalid: false,
        items: [],
        multiple: false,
        name: null,
        placeholder: '',
        required: false,
        sanitize: true,
        sanitizeFn: null,
        search: false,
        searchNormalize: false,
        searchPlaceholder: 'Search',
        selectedLabel: jasmine.any(Function),
        selectionLimit: null,
        typeahead: true,
        valid: false,
        validationState: null,
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

    it('should point aria-controls at the list only while the list is in the document', async () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle)

      expect(toggle.getAttribute('aria-controls')).toBeNull()

      combobox.show()

      expect(document.getElementById(toggle.getAttribute('aria-controls'))).toBe(menu(combobox).querySelector('.list-box-options'))

      combobox.hide()
      await new Promise(resolve => {
        setTimeout(resolve, 50)
      })

      expect(menu(combobox).isConnected).toBeFalse()
      expect(toggle.getAttribute('aria-controls')).toBeNull()
    })

    it('should not name an active option on the toggle while the panel is closed', () => {
      const toggle = setMarkup()
      new Combobox(toggle) // eslint-disable-line no-new

      toggle.focus()
      toggle.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }))

      expect(toggle.getAttribute('aria-expanded')).toEqual('false')
      expect(toggle.getAttribute('aria-activedescendant')).toBeNull()
    })

    it('should build the caret from the default icon', () => {
      const toggle = setMarkup()
      // eslint-disable-next-line no-new
      new Combobox(toggle)

      const caret = toggle.querySelector('.combobox-caret')

      expect(caret).not.toBeNull()
      expect(caret.getAttribute('aria-hidden')).toEqual('true')
    })

    it('should draw the default caret with every attribute of the icon', () => {
      const toggle = setMarkup()
      // eslint-disable-next-line no-new
      new Combobox(toggle)

      const icon = document.createElement('template')
      icon.innerHTML = CARET_ICON
      const expected = icon.content.firstElementChild
      const caret = toggle.querySelector('.combobox-caret')

      for (const { name, value } of expected.attributes) {
        expect(caret.getAttribute(name)).toEqual(value)
      }

      expect(caret.querySelector('path').getAttribute('d')).toEqual(expected.querySelector('path').getAttribute('d'))
    })

    it('should keep the caret when the labels use an allow list without SVG', () => {
      const toggle = setMarkup()
      // eslint-disable-next-line no-new
      new Combobox(toggle, { allowList: { span: [] } })

      expect(toggle.querySelector('.combobox-caret').tagName.toLowerCase()).toEqual('svg')
    })

    it('should keep the caret the markup already carries', () => {
      const toggle = setMarkup()
      toggle.insertAdjacentHTML('beforeend', '<svg class="combobox-caret" data-mine></svg>')
      // eslint-disable-next-line no-new
      new Combobox(toggle)

      expect(toggle.querySelectorAll('.combobox-caret').length).toEqual(1)
      expect(toggle.querySelector('.combobox-caret').hasAttribute('data-mine')).toBeTrue()
    })

    it('should sanitize a caret icon given in the markup', () => {
      const toggle = setMarkup()
      toggle.setAttribute('data-coreui-caret-icon', '<img src="caret.svg" onerror="window.caretInjected = true">')
      // eslint-disable-next-line no-new
      new Combobox(toggle)

      const caret = toggle.querySelector('.combobox-caret')

      expect(caret.tagName).toEqual('IMG')
      expect(caret.hasAttribute('onerror')).toBeFalse()
    })

    it('should draw a custom SVG caret', () => {
      const toggle = setMarkup()
      // eslint-disable-next-line no-new
      new Combobox(toggle, { caretIcon: '<svg viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"></path></svg>' })

      const caret = toggle.querySelector('.combobox-caret')

      expect(caret.tagName.toLowerCase()).toEqual('svg')
      expect(caret.querySelector('path').getAttribute('d')).toEqual('M4 6l4 4 4-4')
    })

    it('should keep a sprite reference in the caret', () => {
      const toggle = setMarkup()
      // eslint-disable-next-line no-new
      new Combobox(toggle, { caretIcon: '<svg class="icon"><use xlink:href="icons.svg#cil-caret-bottom"></use></svg>' })

      expect(toggle.querySelector('.combobox-caret use').getAttribute('xlink:href')).toEqual('icons.svg#cil-caret-bottom')
    })

    it('should make the last element of the icon the caret', () => {
      const toggle = setMarkup()
      // eslint-disable-next-line no-new
      new Combobox(toggle, { caretIcon: '<span class="visually-hidden">Open</span><svg viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"></path></svg>' })

      expect(toggle.querySelector('.combobox-caret').tagName.toLowerCase()).toEqual('svg')
      expect(toggle.querySelector('.visually-hidden').classList.contains('combobox-caret')).toBeFalse()
    })

    it('should keep the caret icon as given when sanitize is false', () => {
      const toggle = setMarkup()
      // eslint-disable-next-line no-new
      new Combobox(toggle, { caretIcon: '<i class="icon" data-icon="caret"></i>', sanitize: false })

      expect(toggle.querySelector('.combobox-caret').getAttribute('data-icon')).toEqual('caret')
    })

    it('should draw no caret when nothing of the icon survives the sanitizer', () => {
      const toggle = setMarkup()
      // eslint-disable-next-line no-new
      new Combobox(toggle, { caretIcon: '<script>window.caretInjected = true</script>' })

      expect(toggle.querySelector('.combobox-caret')).toBeNull()
      expect(toggle.querySelector('script')).toBeNull()
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

  describe('placeholder and selectedLabel', () => {
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

    it('should take the count text from selectedLabel', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { multiple: true, selectedLabel: 'wybrano: {count}' })

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

    it('should keep a comma inside a value passed as configuration', () => {
      const toggle = setMarkup('', [
        '<div class="list-box-option" data-coreui-value="New York, NY">NYC metro</div>',
        '<div class="list-box-option" data-coreui-value="Austin, TX">Austin</div>'
      ])
      const combobox = new Combobox(toggle, { value: 'New York, NY' })

      expect(combobox.getValue()).toEqual('New York, NY')
      expect(value(toggle)).toEqual('NYC metro')
    })

    it('should keep a comma in a configured value the markup also carries', () => {
      const toggle = setMarkup(' data-coreui-multiple="true" data-coreui-value="New York, NY"', [
        '<div class="list-box-option" data-coreui-value="New York, NY">NYC metro</div>',
        '<div class="list-box-option" data-coreui-value="Austin, TX">Austin</div>'
      ])
      const combobox = new Combobox(toggle, { value: 'New York, NY' })

      expect(combobox.getValue()).toEqual(['New York, NY'])
    })

    it('should split a comma separated value from data-coreui-config', () => {
      const toggle = setMarkup(' data-coreui-config=\'{"multiple":true,"value":"us,ca"}\'')
      const combobox = new Combobox(toggle)

      expect(combobox.getValue()).toEqual(['us', 'ca'])
    })

    it('should keep a comma in a value attribute outside multiple mode', () => {
      const toggle = setMarkup(' data-coreui-value="New York, NY"', [
        '<div class="list-box-option" data-coreui-value="New York, NY">NYC metro</div>',
        '<div class="list-box-option" data-coreui-value="Austin, TX">Austin</div>'
      ])
      const combobox = new Combobox(toggle)

      expect(combobox.getValue()).toEqual('New York, NY')
      expect(value(toggle)).toEqual('NYC metro')
    })

    it('should split a comma separated value attribute', () => {
      const toggle = setMarkup(' data-coreui-multiple="true" data-coreui-value="us,ca"')
      const combobox = new Combobox(toggle)

      expect(combobox.getValue()).toEqual(['us', 'ca'])
    })
  })

  describe('name and the value field', () => {
    it('should insert a value field after the toggle that the browser validates', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { name: 'country' })

      combobox.setValue('ca')

      const field = toggle.nextElementSibling

      expect(field.tagName).toEqual('SELECT')
      expect(field.classList.contains('combobox-select')).toBeTrue()
      expect(field.classList.contains('input-group-ignore')).toBeTrue()
      expect(field.name).toEqual('country')
      expect(field.value).toEqual('ca')
      expect(field.willValidate).toBeTrue()
      expect(field.getAttribute('aria-hidden')).toEqual('true')
      expect(field.tabIndex).toEqual(-1)
    })

    it('should submit one key per value in multiple mode', () => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle, { multiple: true, name: 'country' })

      combobox.setValue(['us', 'ca'])

      expect(new FormData(fixtureEl.querySelector('form')).getAll('country')).toEqual(['us', 'ca'])
    })

    it('should submit nothing without a name', () => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle)

      combobox.setValue('ca')

      expect(toggle.nextElementSibling.hasAttribute('name')).toBeFalse()
      expect([...new FormData(fixtureEl.querySelector('form')).keys()]).toEqual([])
    })

    it('should post an empty value for an empty single combobox and nothing for an empty multiple one', () => {
      const toggle = setMarkupInForm()
      const single = new Combobox(toggle, { name: 'country' })
      const form = fixtureEl.querySelector('form')

      expect([...new FormData(form).entries()]).toEqual([['country', '']])

      single.dispose()
      new Combobox(toggle, { multiple: true, name: 'country' }) // eslint-disable-line no-new

      expect([...new FormData(form).entries()]).toEqual([])
    })

    it('should leave a label around the toggle naming the toggle', () => {
      setMarkup()
      const label = document.createElement('label')
      label.append('Country ', fixtureEl.querySelector('.combobox-toggle'))
      fixtureEl.prepend(label)

      const toggle = label.querySelector('.combobox-toggle')
      new Combobox(toggle) // eslint-disable-line no-new

      expect(label.control).toBe(toggle)
    })
  })

  describe('validation', () => {
    const tick = () => new Promise(resolve => {
      setTimeout(resolve)
    })
    const pick = (combobox, key) => {
      combobox.show()
      option(combobox, key).click()
    }

    it('should block the submit while it is required and holds no value, with the message of a select', () => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle, { required: true })
      const form = fixtureEl.querySelector('form')

      expect(form.checkValidity()).toBeFalse()
      expect(combobox._valueField.validity.valueMissing).toBeTrue()

      combobox.setValue('ca')

      expect(form.checkValidity()).toBeTrue()
    })

    it('should show a given state on the toggle, block the submit with its message, and give back what it took on dispose', () => {
      const toggle = setMarkupInForm(' aria-describedby="hint"', null, '<div id="hint">Ships in a week.</div><div class="invalid-feedback">Pick a country.</div>')
      const form = fixtureEl.querySelector('form')

      toggle.classList.add('is-invalid')

      const feedback = fixtureEl.querySelector('.invalid-feedback')
      const combobox = new Combobox(toggle)

      expect(toggle.classList.contains('is-invalid')).toBeTrue()
      expect(toggle.hasAttribute('aria-invalid')).toBeFalse()
      expect(toggle.getAttribute('aria-describedby')).toBe(`hint ${feedback.id}`)
      expect(combobox._valueField.validationMessage).toBe('Pick a country.')
      expect(form.checkValidity()).toBeFalse()

      combobox.dispose()

      expect(toggle.classList.contains('is-invalid')).toBeTrue()
      expect(toggle.hasAttribute('aria-invalid')).toBeFalse()
      expect(toggle.getAttribute('aria-describedby')).toBe('hint')
      expect(fixtureEl.querySelector('.combobox-select')).toBeNull()
      expect(form.checkValidity()).toBeTrue()
    })

    it('should let the option win over a class from the markup, and take the deprecated aliases until validationState is set', () => {
      const toggle = setMarkupInForm()

      toggle.classList.add('is-valid')

      const combobox = new Combobox(toggle, { invalid: true, validationState: undefined })

      expect(toggle.classList.contains('is-invalid')).toBeTrue()
      expect(toggle.classList.contains('is-valid')).toBeFalse()

      combobox.setConfig({ validationState: 'valid', placeholder: 'Other' })

      expect(toggle.classList.contains('is-valid')).toBeTrue()
      expect(combobox._config.placeholder).toBe('')

      combobox.setConfig({ invalid: false, validationState: null })

      expect(toggle.classList.contains('is-valid')).toBeFalse()
      expect(toggle.classList.contains('is-invalid')).toBeFalse()
    })

    it('should drop a given state through a pick in the list, and keep it through changes from code and a pick that changes nothing', () => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle, { validationState: 'invalid', value: 'us' })
      const form = fixtureEl.querySelector('form')

      combobox.setValue('uk')
      combobox.clear()
      combobox.setValue('us')
      pick(combobox, 'us')

      expect(toggle.classList.contains('is-invalid')).toBeTrue()
      expect(form.checkValidity()).toBeFalse()

      pick(combobox, 'ca')

      expect(combobox.getValue()).toBe('ca')
      expect(toggle.classList.contains('is-invalid')).toBeFalse()
      expect(toggle.hasAttribute('aria-invalid')).toBeFalse()
      expect(form.checkValidity()).toBeTrue()
    })

    it.each([['a class in the markup', true], ['the deprecated alias', false]])('should drop a state given through %s with a pick in the list', (_, fromClass) => {
      const toggle = setMarkupInForm()

      if (fromClass) {
        toggle.classList.add('is-invalid')
      }

      const combobox = new Combobox(toggle, fromClass ? {} : { invalid: true })

      pick(combobox, 'ca')

      expect(toggle.classList.contains('is-invalid')).toBeFalse()
      expect(fixtureEl.querySelector('form').checkValidity()).toBeTrue()

      combobox.dispose()

      expect(toggle.classList.contains('is-invalid')).toBeFalse()
    })

    it('should send input and change from the value field on a pick, and keep a state the page gives there', () => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle, { name: 'country', validationState: 'invalid' })
      const form = fixtureEl.querySelector('form')
      const events = []

      form.addEventListener('input', event => events.push(['input', event.target.value]))
      form.addEventListener('change', event => {
        events.push(['change', event.target.value])
        combobox.setConfig({ validationState: 'invalid' })
      })
      pick(combobox, 'ca')

      expect(events).toEqual([['input', 'ca'], ['change', 'ca']])
      expect(toggle.classList.contains('is-invalid')).toBeTrue()
    })

    it('should leave its search field to itself when the form marks the controls', () => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle, { search: true, validationState: 'invalid' })
      const form = fixtureEl.querySelector('form')

      combobox.show()
      form.dataset.coreuiValidate = 'valid'
      updateValidationState(form, new WeakMap())

      expect(searchField(combobox).classList.contains('is-valid')).toBeFalse()
    })

    it('should keep a state given after a pick through setItems that drops the picked value', () => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle, { validationState: 'invalid' })

      pick(combobox, 'ca')
      combobox.setConfig({ validationState: 'invalid' })
      combobox.setItems([{ value: 'us', label: 'United States' }])

      expect(combobox.getValue()).toBeNull()
      expect(toggle.classList.contains('is-invalid')).toBeTrue()
    })

    it('should lift the block before change.coreui.combobox and treat what the page does there as code', () => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle, { multiple: true, validationState: 'invalid' })
      const seen = []

      toggle.addEventListener('change.coreui.combobox', () => {
        seen.push(combobox._valueField.validity.valid)

        if (seen.length === 1) {
          combobox.setConfig({ validationState: 'invalid' })
          combobox.setValue(['us', 'uk'])
        }
      })
      pick(combobox, 'us')

      expect(seen[0]).toBeTrue()
      expect(toggle.classList.contains('is-invalid')).toBeTrue()
      expect(fixtureEl.querySelector('form').checkValidity()).toBeFalse()
    })

    it('should send input and change from the value field when the value changes', () => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle, { name: 'country' })
      const events = []

      fixtureEl.querySelector('form').addEventListener('input', event => events.push(['input', event.target.value]))
      fixtureEl.querySelector('form').addEventListener('change', event => events.push(['change', event.target.value]))
      combobox.setValue('ca')
      combobox.setValue('ca')
      combobox.update()

      expect(events).toEqual([['input', 'ca'], ['change', 'ca']])
    })

    it('should show what a validation reports until the value is valid, and link the message', () => {
      const toggle = setMarkupInForm('', null, '<div class="invalid-feedback">Pick a country.</div>')
      const combobox = new Combobox(toggle, { required: true })
      const feedback = fixtureEl.querySelector('.invalid-feedback')

      fixtureEl.querySelector('form').checkValidity()

      expect(toggle.classList.contains('is-invalid')).toBeTrue()
      expect(toggle.getAttribute('aria-describedby')).toBe(feedback.id)
      expect(toggle.hasAttribute('aria-invalid')).toBeFalse()
      expect(toggle.hasAttribute('aria-required')).toBeFalse()

      combobox.setValue('us')

      expect(toggle.classList.contains('is-invalid')).toBeFalse()
      expect(toggle.hasAttribute('aria-describedby')).toBeFalse()
    })

    it('should link a message named on the toggle', () => {
      const toggle = setMarkupInForm(' data-coreui-invalid-feedback="named"', null, '<p><span id="named" class="invalid-feedback">Pick a country.</span></p>')
      const combobox = new Combobox(toggle, { validationState: 'invalid' })

      expect(toggle.getAttribute('aria-describedby')).toBe('named')
      expect(combobox._valueField.validationMessage).toBe('Pick a country.')
    })

    it('should lay the value field over the toggle when it is reported invalid, and hand its focus to the toggle', () => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle, { required: true })
      const field = combobox._valueField

      field.style.cssText = 'position: absolute; box-sizing: border-box; width: 1px; padding: 0; border: 0'
      toggle.style.marginLeft = '30px'
      fixtureEl.querySelector('form').checkValidity()

      const fieldRect = field.getBoundingClientRect()
      const toggleRect = toggle.getBoundingClientRect()

      expect([fieldRect.top, fieldRect.left, fieldRect.height]).toEqual([toggleRect.top, toggleRect.left, toggleRect.height])
      expect(fieldRect.width).toBe(1)

      field.focus()

      expect(document.activeElement).toBe(toggle)
    })

    it('should leave its value field to itself when the form marks the controls', () => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle, { required: true })

      combobox.setValue('us')
      fixtureEl.querySelector('form').dataset.coreuiValidate = 'valid'
      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(combobox._valueField.classList.contains('is-valid')).toBeFalse()
    })

    it.each([['before the reset', 'before', false], ['in a reset listener', 'listener', true], ['right after form.reset()', 'after', true]])('should put back the value it started with on a native reset and treat a state given %s as the reset says', async (_, when, kept) => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle, { name: 'country', value: 'us' })
      const form = fixtureEl.querySelector('form')
      const changes = []
      const giveState = () => combobox.setConfig({ validationState: 'invalid' })

      pick(combobox, 'ca')
      toggle.addEventListener('change.coreui.combobox', event => changes.push(event.value))

      if (when === 'before') {
        giveState()
      } else if (when === 'listener') {
        form.addEventListener('reset', giveState)
      }

      form.reset()

      if (when === 'after') {
        giveState()
      }

      await tick()

      expect(combobox.getValue()).toBe('us')
      expect(new FormData(form).get('country')).toBe('us')
      expect(changes).toEqual(['us'])
      expect(toggle.classList.contains('is-invalid')).toBe(kept)
      expect(form.checkValidity()).toBe(!kept)
    })

    it('should keep its value field through a native reset that changes nothing', async () => {
      const toggle = setMarkupInForm()
      const combobox = new Combobox(toggle, {
        multiple: true, name: 'country', required: true, value: ['us', 'ca']
      })
      const form = fixtureEl.querySelector('form')

      form.reset()
      await tick()

      expect(combobox.getValue()).toEqual(['us', 'ca'])
      expect(new FormData(form).getAll('country')).toEqual(['us', 'ca'])
      expect(form.checkValidity()).toBeTrue()
    })

    it('should not block or submit while disabled', () => {
      const toggle = setMarkupInForm(' disabled')
      const combobox = new Combobox(toggle, {
        name: 'country', required: true, validationState: 'invalid', value: 'us'
      })

      expect(combobox._valueField.disabled).toBeTrue()
      expect(fixtureEl.querySelector('form').checkValidity()).toBeTrue()
      expect([...new FormData(fixtureEl.querySelector('form')).keys()]).toEqual([])
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
    it('should put the panel back and remove the value field', () => {
      const toggle = setMarkup()
      const combobox = new Combobox(toggle, { name: 'country' })
      const panel = menu(combobox)

      combobox.dispose()

      expect(Combobox.getInstance(toggle)).toBeNull()
      expect(toggle.nextElementSibling).toEqual(panel)
      expect(fixtureEl.querySelector('.combobox-select')).toBeNull()
      expect(toggle.hasAttribute('aria-expanded')).toBeFalse()
    })

    it('should remove everything it built, so a new instance on the same button starts from the same markup', () => {
      fixtureEl.innerHTML = '<form><button class="form-control" id="pick"></button></form>'
      const before = fixtureEl.innerHTML
      const toggle = fixtureEl.querySelector('#pick')

      for (let cycle = 0; cycle < 3; cycle++) {
        new Combobox(toggle, {
          items: [{ value: 'a', label: 'A' }], name: 'pick', search: true, value: 'a'
        }).dispose()

        expect(fixtureEl.innerHTML).toEqual(before)
      }
    })

    it('should give the toggle and a page panel back their markup after the panel was open', async () => {
      fixtureEl.innerHTML = [
        '<form>',
        '<button class="form-control" id="pick" type="submit" aria-controls="help">Pick</button>',
        '<div class="popup"><div class="list-box"><div class="list-box-options"></div></div></div>',
        '</form>'
      ].join('')
      const toggle = fixtureEl.querySelector('#pick')
      const before = toggle.outerHTML
      const popup = fixtureEl.querySelector('.popup')
      const combobox = new Combobox(toggle, { items: [{ value: 'a', label: 'A' }], value: 'a' })

      combobox.show()
      await new Promise(resolve => {
        setTimeout(resolve, 50)
      })
      combobox.hide()
      combobox.dispose()

      expect(toggle.outerHTML).toEqual(before)
      expect(popup.getAttribute('class')).toEqual('popup')
      expect(popup.hasAttribute('style')).toBeFalse()
      expect(popup.querySelector('.list-box-options').hasAttribute('id')).toBeFalse()
      expect(toggle.nextElementSibling).toEqual(popup)
    })

    it('should remove the parts it added to a page panel', () => {
      fixtureEl.innerHTML = '<button class="form-control" id="pick"></button><div class="popup"></div>'
      const popup = fixtureEl.querySelector('.popup')

      new Combobox(fixtureEl.querySelector('#pick'), { items: [{ value: 'a', label: 'A' }], search: true }).dispose()

      expect(popup.outerHTML).toEqual('<div class="popup"></div>')
    })

    it('should keep the list id and the panel class the markup owns', () => {
      const toggle = setMarkup()
      fixtureEl.querySelector('.list-box-options').id = 'countries'

      new Combobox(toggle).dispose()

      expect(fixtureEl.querySelector('.list-box-options').id).toEqual('countries')
      expect(fixtureEl.querySelector('.popup').className).toEqual('popup combobox-popup')
    })

    it('should leave the disabled state the page set after init', () => {
      fixtureEl.innerHTML = '<button class="form-control" id="pick"></button>'
      const toggle = fixtureEl.querySelector('#pick')
      const combobox = new Combobox(toggle, { items: [{ value: 'a', label: 'A' }] })

      toggle.disabled = true
      toggle.classList.add('disabled')
      combobox.dispose()

      expect(toggle.disabled).toBeTrue()
      expect(toggle.classList.contains('disabled')).toBeTrue()
    })

    it('should take back the disabled state it set itself', () => {
      fixtureEl.innerHTML = '<button class="form-control" id="configured"></button><button class="form-control" id="marked" disabled></button>'
      const configured = fixtureEl.querySelector('#configured')
      const marked = fixtureEl.querySelector('#marked')

      new Combobox(configured, { disabled: true }).dispose()
      new Combobox(marked).dispose()

      expect(configured.outerHTML).toEqual('<button class="form-control" id="configured"></button>')
      expect(marked.outerHTML).toEqual('<button class="form-control" id="marked" disabled=""></button>')
    })

    it('should keep the classes and inline style the page gave its panel after init', () => {
      const toggle = setMarkup()
      const popup = fixtureEl.querySelector('.popup')
      const combobox = new Combobox(toggle)

      popup.classList.add('mine')
      popup.style.color = 'red'
      combobox.dispose()

      expect(popup.className).toEqual('popup combobox-popup mine')
      expect(popup.getAttribute('style')).toEqual('color: red;')
    })

    it('should stop listening on a page list and search field', () => {
      const toggle = setMarkup()
      fixtureEl.querySelector('.list-box-options').insertAdjacentHTML('beforebegin', '<input type="search" data-coreui-list-box-search>')
      const errors = []
      const onError = event => {
        errors.push(event.message)
        event.preventDefault()
      }

      window.addEventListener('error', onError)
      const search = fixtureEl.querySelector('[data-coreui-list-box-search]')
      new Combobox(toggle, { search: true }).dispose()
      const combobox = new Combobox(toggle, { search: true })
      combobox.setValue('ca')
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
      window.removeEventListener('error', onError)

      expect(errors).toEqual([])
      expect(value(toggle)).toEqual('Canada')
    })

    it('should give a value element the markup owns its placeholder state back', () => {
      const toggle = setMarkup()

      new Combobox(toggle, { placeholder: 'Pick one' }).dispose()

      expect(toggle.querySelector('.combobox-value').classList.contains('combobox-placeholder')).toBeFalse()
      expect(value(toggle)).toEqual('')
    })

    it('should do nothing on a second dispose', () => {
      const combobox = new Combobox(setMarkup())

      combobox.dispose()

      expect(() => combobox.dispose()).not.toThrow()
    })

    it('should leave the caret and the value element the markup owns', () => {
      const toggle = setMarkup()
      toggle.querySelector('.combobox-value').innerHTML = '<em>Choose</em>'
      toggle.insertAdjacentHTML('beforeend', '<svg class="combobox-caret" data-mine></svg>')
      const before = toggle.outerHTML

      new Combobox(toggle, { value: 'uk' }).dispose()

      expect(toggle.outerHTML).toEqual(before)
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

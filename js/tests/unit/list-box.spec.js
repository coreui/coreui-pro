import ListBox from '../../src/list-box.js'
import { DefaultAllowlist } from '../../src/util/sanitizer.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('ListBox', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const setMarkup = (attrs = '', items = null, header = '') => {
    const options = items ?? [
      '<div class="list-box-option" data-coreui-value="lettuce">Lettuce</div>',
      '<div class="list-box-option" data-coreui-value="tomato">Tomato</div>',
      '<div class="list-box-option" data-coreui-value="onion">Onion</div>',
      '<div class="list-box-option disabled" data-coreui-value="ham">Ham</div>',
      '<div class="list-box-option" data-coreui-value="cheese">Cheese</div>'
    ]

    fixtureEl.innerHTML = [
      `<div class="list-box"${attrs}>`,
      header,
      '<div class="list-box-options" aria-label="Sandwich">',
      ...options,
      '</div>',
      '</div>'
    ].join('')

    return fixtureEl.querySelector('.list-box')
  }

  const selectAllMarkup = [
    '<div class="list-box-header">',
    '<button type="button" class="list-box-select-all" data-coreui-select-all>Select all</button>',
    '</div>'
  ].join('')
  const list = element => element.querySelector('.list-box-options')
  const searchField = element => element.querySelector('[data-coreui-list-box-search]')

  const type = (element, value) => {
    element.value = value
    element.dispatchEvent(new Event('input', { bubbles: true }))
  }

  const keydown = (target, key, modifiers = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', {
      key, bubbles: true, cancelable: true, ...modifiers
    }))
  }

  const click = (item, modifiers = {}) => {
    item.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...modifiers }))
  }

  const item = (element, value) => element.querySelector(`[data-coreui-value="${value}"]`)

  it('should take care of element either passed as a CSS selector or DOM element', () => {
    const el = setMarkup()

    expect(new ListBox('.list-box')._element).toEqual(el)
    expect(new ListBox(el)._element).toEqual(el)
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(ListBox.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(ListBox.DATA_KEY).toEqual('coreui.list-box')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(ListBox.NAME).toEqual('list-box')
    })
  })

  describe('Default', () => {
    it('should return default configuration', () => {
      expect(ListBox.Default).toEqual({
        activeDescendant: null,
        allowList: DefaultAllowlist,
        ariaSearchLabel: 'Search options',
        counter: false,
        disabled: false,
        html: false,
        indicator: 'none',
        items: [],
        loading: false,
        sanitize: true,
        sanitizeFn: null,
        search: false,
        searchPlaceholder: 'Search',
        selected: null,
        selectedCounterText: 'selected',
        selectionLimit: null,
        selectionMode: 'single',
        typeahead: true
      })
    })
  })

  describe('DefaultType', () => {
    it('should return default type configuration', () => {
      expect(ListBox.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('constructor', () => {
    it('should add the listbox roles and the roving tabindex', () => {
      const el = setMarkup()
      // eslint-disable-next-line no-new
      new ListBox(el)

      expect(list(el).getAttribute('role')).toEqual('listbox')
      expect(list(el).getAttribute('aria-multiselectable')).toBeNull()
      expect(item(el, 'lettuce').getAttribute('role')).toEqual('option')
      expect(item(el, 'lettuce').getAttribute('aria-selected')).toEqual('false')
      expect(item(el, 'lettuce').getAttribute('tabindex')).toEqual('0')
      expect(item(el, 'tomato').getAttribute('tabindex')).toEqual('-1')
    })

    it('should mark a multiple listbox as multiselectable', () => {
      const el = setMarkup(' data-coreui-selection-mode="multiple"')
      const listBox = new ListBox(el)

      expect(listBox._config.selectionMode).toEqual('multiple')
      expect(list(el).getAttribute('aria-multiselectable')).toEqual('true')
    })

    it('should not expose aria-selected when the selection mode is none', () => {
      const el = setMarkup(' data-coreui-selection-mode="none"')
      // eslint-disable-next-line no-new
      new ListBox(el)

      expect(item(el, 'lettuce').getAttribute('aria-selected')).toBeNull()
    })

    it('should take the initial selection from the selected option', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selected: 'tomato' })

      expect(listBox.getSelected()).toEqual(['tomato'])
      expect(item(el, 'tomato')).toHaveClass('selected')
    })

    it('should keep only the first value of an array in single mode', () => {
      const listBox = new ListBox(setMarkup(), { selected: ['tomato', 'onion'] })

      expect(listBox.getSelected()).toEqual(['tomato'])
    })

    it('should add a role to every section', () => {
      const el = setMarkup('', [
        '<div class="list-box-section" aria-labelledby="veg"><div class="list-box-section-label" id="veg">Veggies</div>',
        '<div class="list-box-option" data-coreui-value="lettuce">Lettuce</div></div>'
      ])
      // eslint-disable-next-line no-new
      new ListBox(el)

      expect(list(el).querySelector('.list-box-section').getAttribute('role')).toEqual('group')
    })

    it('should mark a disabled listbox', () => {
      const el = setMarkup(' data-coreui-disabled="true"')
      const listBox = new ListBox(el)

      expect(list(el).getAttribute('aria-disabled')).toEqual('true')

      click(item(el, 'lettuce'))
      expect(listBox.getSelected()).toEqual([])
    })
  })

  describe('data api', () => {
    it('should initialize every list box on DOMContentLoaded', () => {
      const el = setMarkup(' data-coreui-toggle="list-box"')

      document.dispatchEvent(new Event('DOMContentLoaded'))

      expect(ListBox.getInstance(el)).not.toBeNull()
    })
  })

  describe('selection', () => {
    it('should select a single value and replace the previous one', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      listBox.select('lettuce')
      listBox.select('tomato')

      expect(listBox.getSelected()).toEqual(['tomato'])
      expect(item(el, 'lettuce')).not.toHaveClass('selected')
      expect(item(el, 'tomato').getAttribute('aria-selected')).toEqual('true')
    })

    it('should keep every selected value in multiple mode', () => {
      const listBox = new ListBox(setMarkup(), { selectionMode: 'multiple' })

      listBox.select('lettuce')
      listBox.select('tomato')

      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
    })

    it('should not select anything when the selection mode is none', () => {
      const listBox = new ListBox(setMarkup(), { selectionMode: 'none' })

      listBox.select('lettuce')

      expect(listBox.getSelected()).toEqual([])
    })

    it('should not select a disabled option', () => {
      const listBox = new ListBox(setMarkup(), { selectionMode: 'multiple' })

      listBox.select('ham')

      expect(listBox.getSelected()).toEqual([])
    })

    it('should toggle, deselect and clear', () => {
      const listBox = new ListBox(setMarkup(), { selectionMode: 'multiple' })

      listBox.toggle('lettuce')
      listBox.toggle('tomato')
      listBox.toggle('lettuce')
      expect(listBox.getSelected()).toEqual(['tomato'])

      listBox.deselect('tomato')
      expect(listBox.getSelected()).toEqual([])

      listBox.selectAll()
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato', 'onion', 'cheese'])

      listBox.clear()
      expect(listBox.getSelected()).toEqual([])
    })

    it('selects only the visible enabled options', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selectionMode: 'multiple' })
      const selectAll = el.querySelector('[data-coreui-select-all]')

      expect(selectAll).toBeNull()

      item(el, 'tomato').setAttribute('hidden', '')
      listBox.update()

      listBox.selectAll()
      expect(listBox.getSelected()).toEqual(['lettuce', 'onion', 'cheese'])

      listBox.clear()
      listBox.selectAll(['lettuce', 'tomato'])
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
    })

    it('should keep the select all button in step with the visible options only', () => {
      const el = setMarkup(' data-coreui-selection-mode="multiple"', [
        '<div class="list-box-option" data-coreui-value="lettuce">Lettuce</div>',
        '<div class="list-box-option" data-coreui-value="tomato" hidden>Tomato</div>',
        '<div class="list-box-option disabled" data-coreui-value="ham">Ham</div>'
      ], selectAllMarkup)
      const listBox = new ListBox(el)
      const selectAll = el.querySelector('[data-coreui-select-all]')

      click(selectAll)

      expect(listBox.getSelected()).toEqual(['lettuce'])
      expect(selectAll.getAttribute('aria-pressed')).toEqual('true')
      expect(selectAll).not.toHaveClass('indeterminate')
    })

    it('should not select all outside of multiple mode', () => {
      const listBox = new ListBox(setMarkup())

      listBox.selectAll()

      expect(listBox.getSelected()).toEqual([])
    })

    it('should select on click in single mode and toggle in multiple mode', () => {
      const el = setMarkup()
      const single = new ListBox(el)

      click(item(el, 'tomato'))
      expect(single.getSelected()).toEqual(['tomato'])

      single.dispose()

      const multiple = new ListBox(el, { selectionMode: 'multiple' })
      click(item(el, 'tomato'))
      click(item(el, 'onion'))
      expect(multiple.getSelected()).toEqual(['tomato', 'onion'])

      click(item(el, 'tomato'))
      expect(multiple.getSelected()).toEqual(['onion'])
    })

    it('should ignore a click on a disabled option', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      click(item(el, 'ham'))

      expect(listBox.getSelected()).toEqual([])
      expect(listBox.getActive()).toBeNull()
    })

    it('should select a range on shift-click and toggle on ctrl-click', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selectionMode: 'multiple' })

      click(item(el, 'lettuce'))
      click(item(el, 'cheese'), { shiftKey: true })
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato', 'onion', 'cheese'])

      click(item(el, 'tomato'), { ctrlKey: true })
      expect(listBox.getSelected()).toEqual(['lettuce', 'onion', 'cheese'])
    })

    it('should treat the select all button as one switch for the whole list', () => {
      const el = setMarkup(' data-coreui-selection-mode="multiple"', [
        '<div class="list-box-option" data-coreui-value="lettuce">Lettuce</div>',
        '<div class="list-box-option" data-coreui-value="tomato">Tomato</div>'
      ], selectAllMarkup)
      const listBox = new ListBox(el)
      const selectAll = el.querySelector('[data-coreui-select-all]')

      expect(selectAll.getAttribute('role')).toBeNull()
      expect(selectAll.closest('.list-box-header')).not.toBeNull()
      expect(selectAll.getAttribute('aria-controls')).toEqual(list(el).id)
      expect(list(el).id).toMatch(/^list-box-options-/)
      expect(selectAll.getAttribute('aria-pressed')).toEqual('false')

      click(selectAll)
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
      expect(selectAll.getAttribute('aria-pressed')).toEqual('true')
      expect(selectAll).toHaveClass('selected')

      click(selectAll)
      expect(listBox.getSelected()).toEqual([])
      expect(selectAll.getAttribute('aria-pressed')).toEqual('false')
      expect(selectAll).not.toHaveClass('selected')
    })

    it('should keep the select all button out of the options and out of the arrow navigation', () => {
      const el = setMarkup(' data-coreui-selection-mode="multiple"', null, selectAllMarkup)
      const listBox = new ListBox(el)
      const selectAll = el.querySelector('[data-coreui-select-all]')

      expect(el.querySelectorAll('[role="option"]').length).toEqual(5)
      expect(selectAll.closest('[role="listbox"]')).toBeNull()
      expect(selectAll.hasAttribute('tabindex')).toBeFalse()

      keydown(list(el), 'End')
      expect(listBox.getActive()).toEqual('cheese')

      keydown(list(el), 'ArrowDown')
      expect(listBox.getActive()).toEqual('cheese')
    })

    it('should disable the select all button with the list box', () => {
      const el = setMarkup(' data-coreui-disabled="true" data-coreui-selection-mode="multiple"', null, selectAllMarkup)
      // eslint-disable-next-line no-new
      new ListBox(el)

      expect(el.querySelector('[data-coreui-select-all]').disabled).toBeTrue()
      expect(list(el).getAttribute('aria-disabled')).toEqual('true')
    })
  })

  describe('selectionLimit', () => {
    it('stops selecting at the selection limit and reports it', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selectionMode: 'multiple', selectionLimit: 2 })
      const reported = []

      el.addEventListener('selectionLimit.coreui.list-box', event => reported.push([event.limit, event.value]))

      click(item(el, 'lettuce'))
      click(item(el, 'tomato'))
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
      expect(reported).toEqual([])

      click(item(el, 'onion'))
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
      expect(reported).toEqual([[2, 'onion']])
      expect(item(el, 'onion')).not.toHaveClass('disabled')

      listBox.select('cheese')
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
      expect(reported.length).toEqual(2)

      click(item(el, 'lettuce'))
      expect(listBox.getSelected()).toEqual(['tomato'])

      click(item(el, 'onion'))
      expect(listBox.getSelected()).toEqual(['tomato', 'onion'])
      expect(reported.length).toEqual(2)
    })

    it('should fire once for a batch and take the options in document order', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selectionMode: 'multiple', selectionLimit: 2 })
      const reported = []

      el.addEventListener('selectionLimit.coreui.list-box', event => reported.push([event.limit, event.value]))

      keydown(list(el), 'a', { ctrlKey: true })

      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
      expect(reported).toEqual([[2, 'onion']])
    })

    it('should stop a range at the limit and report it once', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selectionMode: 'multiple', selectionLimit: 2 })
      const reported = []

      el.addEventListener('selectionLimit.coreui.list-box', event => reported.push(event.value))

      click(item(el, 'lettuce'))
      click(item(el, 'cheese'), { shiftKey: true })

      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
      expect(reported).toEqual(['onion'])
    })

    it('should ignore the limit outside multiple mode', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selectionLimit: 1 })

      listBox.select('lettuce')
      listBox.select('tomato')

      expect(listBox.getSelected()).toEqual(['tomato'])
    })

    it('should treat the select all button as full at the limit and clear from there', () => {
      const el = setMarkup(' data-coreui-selection-mode="multiple" data-coreui-selection-limit="2"', [
        '<div class="list-box-option" data-coreui-value="lettuce">Lettuce</div>',
        '<div class="list-box-option" data-coreui-value="tomato">Tomato</div>',
        '<div class="list-box-option" data-coreui-value="onion">Onion</div>'
      ], selectAllMarkup)
      const listBox = new ListBox(el)
      const selectAll = el.querySelector('[data-coreui-select-all]')

      expect(listBox._config.selectionLimit).toEqual(2)

      listBox.select('lettuce')
      expect(selectAll.getAttribute('aria-pressed')).toEqual('mixed')

      click(selectAll)
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
      expect(selectAll.getAttribute('aria-pressed')).toEqual('true')
      expect(selectAll).not.toHaveClass('indeterminate')

      click(selectAll)
      expect(listBox.getSelected()).toEqual([])
    })
  })

  describe('indicator', () => {
    it('should not render an indicator by default', () => {
      const el = setMarkup()
      // eslint-disable-next-line no-new
      new ListBox(el)

      expect(el.querySelector('.list-box-option-indicator')).toBeNull()
      expect(el.hasAttribute('data-coreui-indicator')).toBeFalse()
    })

    it('should render one indicator per option and never a second one', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { indicator: 'checkbox' })

      expect(el.querySelectorAll('.list-box-option-indicator').length).toEqual(5)
      expect(el.getAttribute('data-coreui-indicator')).toEqual('checkbox')

      const indicator = item(el, 'lettuce').querySelector('.list-box-option-indicator')
      expect(indicator).toHaveClass('check')
      expect(indicator.getAttribute('aria-hidden')).toEqual('true')

      listBox.select('tomato')
      listBox.update()
      listBox.update()

      expect(el.querySelectorAll('.list-box-option-indicator').length).toEqual(5)
      expect(item(el, 'lettuce').firstElementChild).toEqual(indicator)
    })

    it('should keep the option value out of the indicator markup', () => {
      const el = setMarkup(' data-coreui-indicator="checkbox"', [
        '<div class="list-box-option">Lettuce</div>',
        '<div class="list-box-option">Tomato</div>'
      ])
      const listBox = new ListBox(el)

      listBox.select('Lettuce')

      expect(listBox.getSelected()).toEqual(['Lettuce'])
    })

    it('should mark the select all button as mixed for a partial selection', () => {
      const el = setMarkup(' data-coreui-selection-mode="multiple" data-coreui-indicator="checkbox"', [
        '<div class="list-box-option" data-coreui-value="lettuce">Lettuce</div>',
        '<div class="list-box-option" data-coreui-value="tomato">Tomato</div>'
      ], selectAllMarkup)
      const listBox = new ListBox(el)
      const selectAll = el.querySelector('[data-coreui-select-all]')

      expect(selectAll.getAttribute('aria-pressed')).toEqual('false')
      expect(selectAll.querySelectorAll('.list-box-option-indicator').length).toEqual(1)

      listBox.select('lettuce')
      expect(selectAll.getAttribute('aria-pressed')).toEqual('mixed')
      expect(selectAll).toHaveClass('indeterminate')

      listBox.select('tomato')
      expect(selectAll.getAttribute('aria-pressed')).toEqual('true')
      expect(selectAll).toHaveClass('selected')
      expect(selectAll).not.toHaveClass('indeterminate')
      expect(selectAll.querySelectorAll('.list-box-option-indicator').length).toEqual(1)

      listBox.clear()
      expect(selectAll.getAttribute('aria-pressed')).toEqual('false')
      expect(selectAll).not.toHaveClass('indeterminate')
    })
  })

  describe('events', () => {
    it('should fire select, selected and change', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)
      const order = []

      el.addEventListener('select.coreui.list-box', event => order.push(`select:${event.value}`))
      el.addEventListener('selected.coreui.list-box', event => order.push(`selected:${event.value}`))
      el.addEventListener('change.coreui.list-box', event => order.push(`change:${event.selected.join(',')}`))

      listBox.select('tomato')

      expect(order).toEqual(['select:tomato', 'selected:tomato', 'change:tomato'])
    })

    it('should not select when the select event is prevented', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      el.addEventListener('select.coreui.list-box', event => event.preventDefault())
      listBox.select('tomato')

      expect(listBox.getSelected()).toEqual([])
    })

    it('should fire deselect, deselected and change', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selected: 'tomato' })
      const order = []

      el.addEventListener('deselect.coreui.list-box', event => order.push(`deselect:${event.value}`))
      el.addEventListener('deselected.coreui.list-box', event => order.push(`deselected:${event.value}`))
      el.addEventListener('change.coreui.list-box', () => order.push('change'))

      listBox.deselect('tomato')

      expect(order).toEqual(['deselect:tomato', 'deselected:tomato', 'change'])
    })

    it('should not deselect when the deselect event is prevented', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selected: 'tomato' })

      el.addEventListener('deselect.coreui.list-box', event => event.preventDefault())
      listBox.deselect('tomato')

      expect(listBox.getSelected()).toEqual(['tomato'])
    })

    it('should fire activate when the highlight moves', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)
      const values = []

      el.addEventListener('activate.coreui.list-box', event => values.push(event.value))

      listBox.next()
      listBox.next()

      expect(values).toEqual(['lettuce', 'tomato'])
    })

    it('should fire action on a link and in the none mode', () => {
      const el = setMarkup(' data-coreui-selection-mode="none"', [
        '<div class="list-box-option" data-coreui-value="lettuce">Lettuce</div>',
        '<a class="list-box-option" href="#docs" data-coreui-value="docs">Docs</a>'
      ])
      const listBox = new ListBox(el)
      const values = []

      el.addEventListener('action.coreui.list-box', event => values.push(event.value))

      click(item(el, 'lettuce'))
      listBox.setActive('docs')
      keydown(list(el), 'Enter')

      expect(values).toEqual(['lettuce', 'docs'])
      expect(listBox.getSelected()).toEqual([])
    })
  })

  describe('keyboard', () => {
    it('should move the highlight with the arrows without wrapping', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      keydown(list(el), 'ArrowDown')
      expect(listBox.getActive()).toEqual('lettuce')
      expect(item(el, 'lettuce')).toHaveClass('active')

      keydown(list(el), 'ArrowDown')
      expect(listBox.getActive()).toEqual('tomato')

      keydown(list(el), 'ArrowUp')
      keydown(list(el), 'ArrowUp')
      expect(listBox.getActive()).toEqual('lettuce')
    })

    it('should skip disabled and hidden options', () => {
      const el = setMarkup()
      item(el, 'tomato').setAttribute('hidden', '')
      const listBox = new ListBox(el)

      listBox.update()
      listBox.setActive('lettuce')
      keydown(list(el), 'ArrowDown')
      expect(listBox.getActive()).toEqual('onion')

      keydown(list(el), 'ArrowDown')
      expect(listBox.getActive()).toEqual('cheese')
    })

    it('should jump to the edges with Home and End', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      keydown(list(el), 'End')
      expect(listBox.getActive()).toEqual('cheese')

      keydown(list(el), 'Home')
      expect(listBox.getActive()).toEqual('lettuce')
    })

    it('should select with Space and Enter', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      keydown(list(el), 'ArrowDown')
      keydown(list(el), ' ')
      expect(listBox.getSelected()).toEqual(['lettuce'])

      keydown(list(el), 'ArrowDown')
      keydown(list(el), 'Enter')
      expect(listBox.getSelected()).toEqual(['tomato'])
    })

    it('should toggle with Space in multiple mode', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selectionMode: 'multiple' })

      keydown(list(el), 'ArrowDown')
      keydown(list(el), ' ')
      keydown(list(el), 'ArrowDown')
      keydown(list(el), ' ')
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])

      keydown(list(el), ' ')
      expect(listBox.getSelected()).toEqual(['lettuce'])
    })

    it('should extend the selection with shift and the arrows', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selectionMode: 'multiple' })

      keydown(list(el), 'ArrowDown')
      keydown(list(el), ' ')
      keydown(list(el), 'ArrowDown', { shiftKey: true })
      keydown(list(el), 'ArrowDown', { shiftKey: true })

      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato', 'onion'])
    })

    it('should extend the selection to the edge with shift Home and End', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selectionMode: 'multiple' })

      listBox.setActive('onion')
      keydown(list(el), 'End', { shiftKey: true })
      expect(listBox.getSelected()).toEqual(['onion', 'cheese'])

      listBox.clear()
      listBox.setActive('tomato')
      keydown(list(el), 'Home', { shiftKey: true })
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
    })

    it('should select everything with Ctrl+A in multiple mode only', () => {
      const el = setMarkup()
      const single = new ListBox(el)

      keydown(list(el), 'a', { ctrlKey: true })
      expect(single.getSelected()).toEqual([])

      single.dispose()

      const multiple = new ListBox(el, { selectionMode: 'multiple' })
      keydown(list(el), 'a', { metaKey: true })
      expect(multiple.getSelected()).toEqual(['lettuce', 'tomato', 'onion', 'cheese'])
    })

    it('should move the highlight with typeahead', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      keydown(list(el), 'o')
      expect(listBox.getActive()).toEqual('onion')

      listBox.dispose()

      const second = new ListBox(el)
      keydown(list(el), 'c')
      expect(second.getActive()).toEqual('cheese')
    })

    it('should match a typed prefix over several keys', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      keydown(list(el), 't')
      keydown(list(el), 'o')
      expect(listBox.getActive()).toEqual('tomato')
    })

    it('should read the typeahead text from the option label', () => {
      const el = setMarkup('', [
        '<div class="list-box-option" data-coreui-value="lettuce"><span class="list-box-option-label">Lettuce</span><span class="list-box-option-description">Crisp</span></div>',
        '<div class="list-box-option" data-coreui-value="tomato"><span class="list-box-option-label">Tomato</span><span class="list-box-option-description">Ripe</span></div>'
      ])
      const listBox = new ListBox(el)

      keydown(list(el), 't')
      expect(listBox.getActive()).toEqual('tomato')
    })

    it('should not run typeahead when it is turned off', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { typeahead: false })

      keydown(list(el), 'o')

      expect(listBox.getActive()).toBeNull()
    })
  })

  describe('activeDescendant', () => {
    it('should keep the focus in the field and follow the highlight', () => {
      fixtureEl.innerHTML = [
        '<input type="text" id="field">',
        '<div class="list-box">',
        '<div class="list-box-option" data-coreui-value="lettuce">Lettuce</div>',
        '<div class="list-box-option" data-coreui-value="tomato">Tomato</div>',
        '</div>'
      ].join('')

      const field = fixtureEl.querySelector('#field')
      const el = fixtureEl.querySelector('.list-box')
      const listBox = new ListBox(el, { activeDescendant: '#field' })

      expect(field.getAttribute('aria-controls')).toEqual(el.id)
      expect(item(el, 'lettuce').id).toMatch(/^list-box-option-/)
      expect(item(el, 'lettuce').getAttribute('tabindex')).toBeNull()

      field.focus()
      keydown(field, 'ArrowDown')

      expect(listBox.getActive()).toEqual('lettuce')
      expect(field.getAttribute('aria-activedescendant')).toEqual(item(el, 'lettuce').id)
      expect(document.activeElement).toEqual(field)

      keydown(field, ' ')
      expect(listBox.getSelected()).toEqual(['lettuce'])
    })
  })

  describe('update', () => {
    it('should pick up options added to the DOM', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      list(el).insertAdjacentHTML('beforeend', '<div class="list-box-option" data-coreui-value="bacon">Bacon</div>')
      listBox.update()

      expect(item(el, 'bacon').getAttribute('role')).toEqual('option')

      listBox.select('bacon')
      expect(listBox.getSelected()).toEqual(['bacon'])
    })

    it('should keep the selection of an option that was hidden', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selected: 'tomato' })

      item(el, 'tomato').setAttribute('hidden', '')
      listBox.update()

      expect(listBox.getSelected()).toEqual(['tomato'])
    })

    it('should drop the highlight when the active option disappears', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      listBox.setActive('tomato')
      item(el, 'tomato').remove()
      listBox.update()

      expect(listBox.getActive()).toBeNull()
    })

    it('should show the empty state when nothing is left to navigate', () => {
      const el = setMarkup('', [
        '<div class="list-box-option" data-coreui-value="lettuce">Lettuce</div>',
        '<div class="list-box-empty" hidden>No results</div>'
      ])
      const listBox = new ListBox(el)
      const empty = el.querySelector('.list-box-empty')

      expect(empty.hasAttribute('hidden')).toBeTrue()

      item(el, 'lettuce').setAttribute('hidden', '')
      listBox.update()

      expect(empty.hasAttribute('hidden')).toBeFalse()
    })
  })

  describe('first, last, next, prev and setActive', () => {
    it('should move the highlight', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      listBox.first()
      expect(listBox.getActive()).toEqual('lettuce')

      listBox.last()
      expect(listBox.getActive()).toEqual('cheese')

      listBox.prev()
      expect(listBox.getActive()).toEqual('onion')

      listBox.next()
      expect(listBox.getActive()).toEqual('cheese')

      listBox.setActive('tomato')
      expect(listBox.getActive()).toEqual('tomato')
      expect(item(el, 'tomato')).toHaveClass('active')
    })
  })

  describe('dispose', () => {
    it('should stop reacting and clean the field up', () => {
      fixtureEl.innerHTML = [
        '<input type="text" id="field">',
        '<div class="list-box">',
        '<div class="list-box-option" data-coreui-value="lettuce">Lettuce</div>',
        '</div>'
      ].join('')

      const field = fixtureEl.querySelector('#field')
      const el = fixtureEl.querySelector('.list-box')
      const listBox = new ListBox(el, { activeDescendant: field })

      listBox.setActive('lettuce')
      expect(field.getAttribute('aria-activedescendant')).not.toBeNull()

      listBox.dispose()

      expect(ListBox.getInstance(el)).toBeNull()
      expect(el.hasAttribute('data-coreui-indicator')).toBeFalse()
      expect(field.getAttribute('aria-activedescendant')).toBeNull()
      expect(field.getAttribute('aria-controls')).toBeNull()

      keydown(field, 'ArrowDown')
      expect(field.getAttribute('aria-activedescendant')).toBeNull()
    })
  })

  describe('items', () => {
    const setEmptyMarkup = (attrs = '') => {
      fixtureEl.innerHTML = `<div class="list-box"${attrs}></div>`
      return fixtureEl.querySelector('.list-box')
    }

    it('should render flat items and create the options element', () => {
      const el = setEmptyMarkup()
      const listBox = new ListBox(el, {
        items: [
          { value: 'lettuce', label: 'Lettuce' },
          { value: 'tomato', label: 'Tomato' }
        ]
      })

      expect(list(el)).not.toBeNull()
      expect(list(el).getAttribute('role')).toEqual('listbox')
      expect(el.querySelectorAll('.list-box-option')).toHaveSize(2)
      expect(item(el, 'lettuce').textContent).toEqual('Lettuce')
      expect(item(el, 'tomato').getAttribute('role')).toEqual('option')
      expect(listBox.getSelected()).toEqual([])
    })

    it('should render sections', () => {
      const el = setEmptyMarkup()
      // eslint-disable-next-line no-new
      new ListBox(el, {
        items: [
          { label: 'Veggies', items: [{ value: 'lettuce', label: 'Lettuce' }] },
          { label: 'Protein', items: [{ value: 'ham', label: 'Ham' }] }
        ]
      })

      const sections = el.querySelectorAll('.list-box-section')

      expect(sections).toHaveSize(2)
      expect(sections[0].getAttribute('role')).toEqual('group')

      const label = sections[0].querySelector('.list-box-section-label')

      expect(label.textContent).toEqual('Veggies')
      expect(sections[0].getAttribute('aria-labelledby')).toEqual(label.id)
      expect(sections[0].querySelector('.list-box-option')).toEqual(item(el, 'lettuce'))
    })

    it('should render a description', () => {
      const el = setEmptyMarkup()
      // eslint-disable-next-line no-new
      new ListBox(el, {
        items: [{ value: 'free', label: 'Free', description: 'One project' }]
      })

      expect(item(el, 'free').querySelector('.list-box-option-label').textContent).toEqual('Free')
      expect(item(el, 'free').querySelector('.list-box-option-description').textContent).toEqual('One project')
    })

    it('should render a disabled item', () => {
      const el = setEmptyMarkup()
      const listBox = new ListBox(el, {
        items: [
          { value: 'lettuce', label: 'Lettuce' },
          { value: 'tomato', label: 'Tomato', disabled: true }
        ]
      })

      expect(item(el, 'tomato').classList.contains('disabled')).toBeTrue()
      expect(item(el, 'tomato').getAttribute('aria-disabled')).toEqual('true')

      listBox.select('tomato')
      expect(listBox.getSelected()).toEqual([])
    })

    it('should take the initial selection from the items', () => {
      const el = setEmptyMarkup(' data-coreui-selection-mode="multiple"')
      const listBox = new ListBox(el, {
        items: [
          { value: 'lettuce', label: 'Lettuce', selected: true },
          { value: 'tomato', label: 'Tomato' },
          { value: 'onion', label: 'Onion', selected: true }
        ]
      })

      expect(listBox.getSelected()).toEqual(['lettuce', 'onion'])
      expect(item(el, 'lettuce').getAttribute('aria-selected')).toEqual('true')
    })

    it('should replace the markup already present in the options', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, {
        items: [{ value: 'ham', label: 'Ham' }]
      })

      expect(el.querySelectorAll('.list-box-option')).toHaveSize(1)
      expect(item(el, 'lettuce')).toBeNull()
      expect(listBox.getItems()).toEqual([{ value: 'ham', label: 'Ham' }])
    })

    it('should keep the empty state element when rendering', () => {
      fixtureEl.innerHTML = [
        '<div class="list-box">',
        '<div class="list-box-options" aria-label="Results">',
        '<div class="list-box-empty">No results</div>',
        '</div>',
        '</div>'
      ].join('')

      const el = fixtureEl.querySelector('.list-box')
      const listBox = new ListBox(el, { items: [{ value: 'ham', label: 'Ham' }] })

      expect(el.querySelector('.list-box-empty').hasAttribute('hidden')).toBeTrue()

      listBox.setItems([])
      expect(el.querySelectorAll('.list-box-option')).toHaveSize(0)
      expect(el.querySelector('.list-box-empty').hasAttribute('hidden')).toBeFalse()
    })

    it('should normalize the items', () => {
      const el = setEmptyMarkup()
      const listBox = new ListBox(el, {
        items: [
          { value: 'lettuce' },
          { label: 'Tomato' },
          'nonsense',
          {
            label: 'Protein', items: [{
              value: 'ham', label: 'Ham', description: 'Cured', disabled: true
            }]
          }
        ]
      })

      expect(listBox.getItems()).toEqual([
        { value: 'lettuce', label: 'lettuce' },
        { value: 'Tomato', label: 'Tomato' },
        {
          label: 'Protein', items: [{
            value: 'ham', label: 'Ham', description: 'Cured', disabled: true
          }]
        }
      ])
    })

    it('should keep the selection of the values that are still there', () => {
      const el = setEmptyMarkup(' data-coreui-selection-mode="multiple"')
      const listBox = new ListBox(el, {
        items: [
          { value: 'lettuce', label: 'Lettuce' },
          { value: 'tomato', label: 'Tomato' },
          { value: 'onion', label: 'Onion' }
        ]
      })

      listBox.selectAll()
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato', 'onion'])

      const changed = []
      el.addEventListener('change.coreui.list-box', event => changed.push(event.selected))

      listBox.setItems([
        { value: 'tomato', label: 'Tomato' },
        { value: 'cheese', label: 'Cheese' }
      ])

      expect(listBox.getSelected()).toEqual(['tomato'])
      expect(changed).toEqual([['tomato']])
      expect(item(el, 'tomato').classList.contains('selected')).toBeTrue()
    })

    it('should not fire change when the selection survived the rebuild', () => {
      const el = setEmptyMarkup()
      const listBox = new ListBox(el, {
        items: [{ value: 'lettuce', label: 'Lettuce' }],
        selected: 'lettuce'
      })

      const spy = jasmine.createSpy('change')
      el.addEventListener('change.coreui.list-box', spy)

      listBox.setItems([
        { value: 'lettuce', label: 'Lettuce' },
        { value: 'tomato', label: 'Tomato' }
      ])

      expect(listBox.getSelected()).toEqual(['lettuce'])
      expect(spy).not.toHaveBeenCalled()
    })

    it('should escape the labels by default and sanitize them with html', () => {
      const el = setEmptyMarkup()
      const listBox = new ListBox(el, {
        items: [{ value: 'a', label: '<span>Ok</span>' }]
      })

      expect(item(el, 'a').textContent).toEqual('<span>Ok</span>')
      expect(item(el, 'a').querySelector('span')).toBeNull()

      listBox.dispose()

      const html = setEmptyMarkup()
      // eslint-disable-next-line no-new
      new ListBox(html, {
        html: true,
        items: [{ value: 'a', label: '<span>Ok</span><script>alert(1)</script>' }]
      })

      expect(item(html, 'a').querySelector('span').textContent).toEqual('Ok')
      expect(item(html, 'a').querySelector('script')).toBeNull()
    })

    it('should keep unsanitized html when sanitize is false', () => {
      const el = setEmptyMarkup()
      // eslint-disable-next-line no-new
      new ListBox(el, {
        html: true,
        items: [{ value: 'a', label: '<em>Ok</em>' }],
        sanitize: false
      })

      expect(item(el, 'a').querySelector('em').textContent).toEqual('Ok')
    })
  })

  describe('counter', () => {
    it('should count the selection in the header', () => {
      const el = setMarkup('', null, selectAllMarkup)
      const listBox = new ListBox(el, { counter: true, selectionMode: 'multiple' })
      const counter = el.querySelector('[data-coreui-list-box-counter]')

      expect(counter.parentElement.classList.contains('list-box-header')).toBeTrue()
      expect(counter.previousElementSibling.classList.contains('list-box-select-all')).toBeTrue()
      expect(counter.classList.contains('list-box-subtitle')).toBeTrue()
      expect(counter.textContent).toEqual('0/4 selected')

      listBox.select('tomato')

      expect(counter.textContent).toEqual('1/4 selected')

      listBox.deselect('tomato')

      expect(counter.textContent).toEqual('0/4 selected')
    })

    it('should count against the options the search left', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { counter: true, search: true, selectionMode: 'multiple' })
      const counter = el.querySelector('[data-coreui-list-box-counter]')

      listBox.select('tomato')

      expect(counter.textContent).toEqual('1/4 selected')

      type(searchField(el), 'on')

      expect(counter.textContent).toEqual('0/1 selected')
    })

    it('should follow the items it was given', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { counter: true, selectedCounterText: 'picked', selectionMode: 'multiple' })
      const counter = el.querySelector('[data-coreui-list-box-counter]')

      listBox.setItems([{ value: 'ada', label: 'Ada' }, { value: 'bob', label: 'Bob', selected: true }])

      expect(counter.textContent).toEqual('1/2 picked')
    })

    it('should build the header when the markup has none', () => {
      const el = setMarkup()
      // eslint-disable-next-line no-new
      new ListBox(el, { counter: true })

      const header = el.querySelector('.list-box-header')

      expect(header).not.toBeNull()
      expect(el.firstElementChild).toEqual(header)
      expect(header.querySelector('[data-coreui-list-box-counter]')).not.toBeNull()
    })

    it('should use the counter the markup already carries', () => {
      const el = setMarkup('', null, [
        '<div class="list-box-header">',
        '<span class="list-box-subtitle" data-coreui-list-box-counter></span>',
        '</div>'
      ].join(''))
      // eslint-disable-next-line no-new
      new ListBox(el, { counter: true })

      expect(el.querySelectorAll('[data-coreui-list-box-counter]').length).toEqual(1)
      expect(el.querySelector('[data-coreui-list-box-counter]').tagName).toEqual('SPAN')
    })
  })

  describe('search', () => {
    it('should build the search field between the header and the options', () => {
      const el = setMarkup('', null, selectAllMarkup)
      // eslint-disable-next-line no-new
      new ListBox(el, { search: true, searchPlaceholder: 'Filter' })

      const field = searchField(el)

      expect(field).not.toBeNull()
      expect(field.previousElementSibling.classList.contains('list-box-header')).toBeTrue()
      expect(field.nextElementSibling.classList.contains('list-box-options')).toBeTrue()
      expect(field.placeholder).toEqual('Filter')
      expect(field.getAttribute('aria-label')).toEqual('Search options')
      expect(field.getAttribute('aria-controls')).toEqual(list(el).id)
    })

    it('should use the search field the markup already carries', () => {
      const el = setMarkup()
      list(el).insertAdjacentHTML(
        'beforebegin',
        '<input class="form-control list-box-search" type="search" data-coreui-list-box-search aria-label="Find">'
      )
      // eslint-disable-next-line no-new
      new ListBox(el, { search: true })

      expect(el.querySelectorAll('[data-coreui-list-box-search]').length).toEqual(1)
      expect(searchField(el).getAttribute('aria-label')).toEqual('Find')
    })

    it('should filter the options with the built-in search', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { search: true })

      type(searchField(el), 'to')

      expect(item(el, 'tomato').hasAttribute('hidden')).toBeFalse()
      expect(item(el, 'lettuce').hasAttribute('hidden')).toBeTrue()
      expect(listBox.getActive()).toBeNull()

      type(searchField(el), '')

      expect(item(el, 'lettuce').hasAttribute('hidden')).toBeFalse()
    })

    it('should let select all take only the options left by the search', () => {
      const el = setMarkup('', null, selectAllMarkup)
      const listBox = new ListBox(el, { search: true, selectionMode: 'multiple' })

      type(searchField(el), 'on')
      listBox.selectAll()

      expect(listBox.getSelected()).toEqual(['onion'])
    })

    it('should not filter in external search mode and report the query', () => {
      const el = setMarkup()
      // eslint-disable-next-line no-new
      new ListBox(el, { search: 'external' })
      const spy = jasmine.createSpy('search')

      el.addEventListener('search.coreui.list-box', event => spy(event.query))
      type(searchField(el), 'zzz')

      expect(spy).toHaveBeenCalledWith('zzz')
      expect(item(el, 'lettuce').hasAttribute('hidden')).toBeFalse()
      expect(item(el, 'tomato').hasAttribute('hidden')).toBeFalse()
    })

    it('should disable the search field with the list box', () => {
      const el = setMarkup()
      // eslint-disable-next-line no-new
      new ListBox(el, { disabled: true, search: true })

      expect(searchField(el).disabled).toBeTrue()
    })
  })

  describe('loading', () => {
    const setLoadingMarkup = (attrs = '') => {
      fixtureEl.innerHTML = [
        `<div class="list-box"${attrs}>`,
        '<div class="list-box-options" aria-label="Results">',
        '<div class="list-box-option" data-coreui-value="lettuce">Lettuce</div>',
        '<div class="list-box-empty">No results</div>',
        '</div>',
        '</div>'
      ].join('')

      return fixtureEl.querySelector('.list-box')
    }

    it('should reflect the loading option on init', () => {
      const el = setLoadingMarkup(' data-coreui-loading="true"')
      // eslint-disable-next-line no-new
      new ListBox(el)

      expect(el.classList.contains('loading')).toBeTrue()
      expect(list(el).getAttribute('aria-busy')).toEqual('true')
    })

    it('should toggle the loading state and hide the empty state while loading', () => {
      const el = setLoadingMarkup()
      const listBox = new ListBox(el)
      const empty = el.querySelector('.list-box-empty')

      expect(el.classList.contains('loading')).toBeFalse()
      expect(list(el).getAttribute('aria-busy')).toBeNull()

      listBox.setItems([])
      expect(empty.hasAttribute('hidden')).toBeFalse()

      listBox.setLoading(true)
      expect(el.classList.contains('loading')).toBeTrue()
      expect(list(el).getAttribute('aria-busy')).toEqual('true')
      expect(empty.hasAttribute('hidden')).toBeTrue()

      listBox.setItems([{ value: 'ham', label: 'Ham' }])
      listBox.setLoading(false)

      expect(el.classList.contains('loading')).toBeFalse()
      expect(list(el).getAttribute('aria-busy')).toBeNull()
      expect(empty.hasAttribute('hidden')).toBeTrue()
    })

    it('should drop the loading class on dispose', () => {
      const el = setLoadingMarkup(' data-coreui-loading="true"')
      const listBox = new ListBox(el)

      listBox.dispose()
      expect(el.classList.contains('loading')).toBeFalse()
    })
  })

  describe('jQueryInterface', () => {
    it('should create a list box and call a method', () => {
      const el = setMarkup()

      jQueryMock.fn.listBox = ListBox.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.listBox.call(jQueryMock)
      expect(ListBox.getInstance(el)).not.toBeNull()

      jQueryMock.fn.listBox.call(jQueryMock, 'select', 'tomato')
      expect(ListBox.getInstance(el).getSelected()).toEqual(['tomato'])
    })

    it('should throw an error on undefined method', () => {
      const el = setMarkup()

      jQueryMock.fn.listBox = ListBox.jQueryInterface
      jQueryMock.elements = [el]

      expect(() => {
        jQueryMock.fn.listBox.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })
})

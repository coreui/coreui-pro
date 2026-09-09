import ListBox from '../../src/list-box.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('ListBox', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const setMarkup = (attrs = '', items = null) => {
    const options = items ?? [
      '<div class="list-box-item" data-coreui-value="lettuce">Lettuce</div>',
      '<div class="list-box-item" data-coreui-value="tomato">Tomato</div>',
      '<div class="list-box-item" data-coreui-value="onion">Onion</div>',
      '<div class="list-box-item disabled" data-coreui-value="ham">Ham</div>',
      '<div class="list-box-item" data-coreui-value="cheese">Cheese</div>'
    ]

    fixtureEl.innerHTML = [`<div class="list-box"${attrs}>`, ...options, '</div>'].join('')

    return fixtureEl.querySelector('.list-box')
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
        disabled: false,
        indicator: 'none',
        selected: null,
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

      expect(el.getAttribute('role')).toEqual('listbox')
      expect(el.getAttribute('aria-multiselectable')).toBeNull()
      expect(item(el, 'lettuce').getAttribute('role')).toEqual('option')
      expect(item(el, 'lettuce').getAttribute('aria-selected')).toEqual('false')
      expect(item(el, 'lettuce').getAttribute('tabindex')).toEqual('0')
      expect(item(el, 'tomato').getAttribute('tabindex')).toEqual('-1')
    })

    it('should mark a multiple listbox as multiselectable', () => {
      const el = setMarkup(' data-coreui-selection-mode="multiple"')
      const listBox = new ListBox(el)

      expect(listBox._config.selectionMode).toEqual('multiple')
      expect(el.getAttribute('aria-multiselectable')).toEqual('true')
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
        '<div class="list-box-item" data-coreui-value="lettuce">Lettuce</div></div>'
      ])
      // eslint-disable-next-line no-new
      new ListBox(el)

      expect(el.querySelector('.list-box-section').getAttribute('role')).toEqual('group')
    })

    it('should mark a disabled listbox', () => {
      const el = setMarkup(' data-coreui-disabled="true"')
      const listBox = new ListBox(el)

      expect(el.getAttribute('aria-disabled')).toEqual('true')

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

    it('should keep the select all option in step with the visible options only', () => {
      const el = setMarkup(' data-coreui-selection-mode="multiple"', [
        '<div class="list-box-item" data-coreui-select-all>Select all</div>',
        '<div class="list-box-item" data-coreui-value="lettuce">Lettuce</div>',
        '<div class="list-box-item" data-coreui-value="tomato" hidden>Tomato</div>',
        '<div class="list-box-item disabled" data-coreui-value="ham">Ham</div>'
      ])
      const listBox = new ListBox(el)
      const selectAll = el.querySelector('[data-coreui-select-all]')

      click(selectAll)

      expect(listBox.getSelected()).toEqual(['lettuce'])
      expect(selectAll.getAttribute('aria-selected')).toEqual('true')
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

    it('should treat a select all option as one switch for the whole list', () => {
      const el = setMarkup(' data-coreui-selection-mode="multiple"', [
        '<div class="list-box-item" data-coreui-select-all>Select all</div>',
        '<div class="list-box-item" data-coreui-value="lettuce">Lettuce</div>',
        '<div class="list-box-item" data-coreui-value="tomato">Tomato</div>'
      ])
      const listBox = new ListBox(el)
      const selectAll = el.querySelector('[data-coreui-select-all]')

      click(selectAll)
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
      expect(selectAll.getAttribute('aria-selected')).toEqual('true')

      click(selectAll)
      expect(listBox.getSelected()).toEqual([])
      expect(selectAll.getAttribute('aria-selected')).toEqual('false')
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

      keydown(el, 'a', { ctrlKey: true })

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

    it('should treat the select all option as full at the limit and clear from there', () => {
      const el = setMarkup(' data-coreui-selection-mode="multiple" data-coreui-selection-limit="2"', [
        '<div class="list-box-item" data-coreui-select-all>Select all</div>',
        '<div class="list-box-item" data-coreui-value="lettuce">Lettuce</div>',
        '<div class="list-box-item" data-coreui-value="tomato">Tomato</div>',
        '<div class="list-box-item" data-coreui-value="onion">Onion</div>'
      ])
      const listBox = new ListBox(el)
      const selectAll = el.querySelector('[data-coreui-select-all]')

      expect(listBox._config.selectionLimit).toEqual(2)

      listBox.select('lettuce')
      expect(selectAll).toHaveClass('indeterminate')

      click(selectAll)
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
      expect(selectAll).toHaveClass('selected')
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

      expect(el.querySelector('.list-box-item-indicator')).toBeNull()
      expect(item(el, 'lettuce')).not.toHaveClass('list-box-item-with-indicator')
    })

    it('should render one indicator per option and never a second one', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { indicator: 'checkbox' })

      expect(el.querySelectorAll('.list-box-item-indicator').length).toEqual(5)
      expect(item(el, 'lettuce')).toHaveClass('list-box-item-with-indicator')

      const indicator = item(el, 'lettuce').querySelector('.list-box-item-indicator')
      expect(indicator).toHaveClass('check')
      expect(indicator.getAttribute('aria-hidden')).toEqual('true')

      listBox.select('tomato')
      listBox.update()
      listBox.update()

      expect(el.querySelectorAll('.list-box-item-indicator').length).toEqual(5)
      expect(item(el, 'lettuce').firstElementChild).toEqual(indicator)
    })

    it('should keep the option value out of the indicator markup', () => {
      const el = setMarkup(' data-coreui-indicator="checkbox"', [
        '<div class="list-box-item">Lettuce</div>',
        '<div class="list-box-item">Tomato</div>'
      ])
      const listBox = new ListBox(el)

      listBox.select('Lettuce')

      expect(listBox.getSelected()).toEqual(['Lettuce'])
    })

    it('should mark the select all option as indeterminate for a partial selection', () => {
      const el = setMarkup(' data-coreui-selection-mode="multiple" data-coreui-indicator="checkbox"', [
        '<div class="list-box-item" data-coreui-select-all>Select all</div>',
        '<div class="list-box-item" data-coreui-value="lettuce">Lettuce</div>',
        '<div class="list-box-item" data-coreui-value="tomato">Tomato</div>'
      ])
      const listBox = new ListBox(el)
      const selectAll = el.querySelector('[data-coreui-select-all]')

      expect(selectAll).not.toHaveClass('indeterminate')

      listBox.select('lettuce')
      expect(selectAll).toHaveClass('indeterminate')
      expect(selectAll.getAttribute('aria-selected')).toEqual('false')

      listBox.select('tomato')
      expect(selectAll).not.toHaveClass('indeterminate')
      expect(selectAll.getAttribute('aria-selected')).toEqual('true')

      listBox.clear()
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
        '<div class="list-box-item" data-coreui-value="lettuce">Lettuce</div>',
        '<a class="list-box-item" href="#docs" data-coreui-value="docs">Docs</a>'
      ])
      const listBox = new ListBox(el)
      const values = []

      el.addEventListener('action.coreui.list-box', event => values.push(event.value))

      click(item(el, 'lettuce'))
      listBox.setActive('docs')
      keydown(el, 'Enter')

      expect(values).toEqual(['lettuce', 'docs'])
      expect(listBox.getSelected()).toEqual([])
    })
  })

  describe('keyboard', () => {
    it('should move the highlight with the arrows without wrapping', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      keydown(el, 'ArrowDown')
      expect(listBox.getActive()).toEqual('lettuce')
      expect(item(el, 'lettuce')).toHaveClass('active')

      keydown(el, 'ArrowDown')
      expect(listBox.getActive()).toEqual('tomato')

      keydown(el, 'ArrowUp')
      keydown(el, 'ArrowUp')
      expect(listBox.getActive()).toEqual('lettuce')
    })

    it('should skip disabled and hidden options', () => {
      const el = setMarkup()
      item(el, 'tomato').setAttribute('hidden', '')
      const listBox = new ListBox(el)

      listBox.update()
      listBox.setActive('lettuce')
      keydown(el, 'ArrowDown')
      expect(listBox.getActive()).toEqual('onion')

      keydown(el, 'ArrowDown')
      expect(listBox.getActive()).toEqual('cheese')
    })

    it('should jump to the edges with Home and End', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      keydown(el, 'End')
      expect(listBox.getActive()).toEqual('cheese')

      keydown(el, 'Home')
      expect(listBox.getActive()).toEqual('lettuce')
    })

    it('should select with Space and Enter', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      keydown(el, 'ArrowDown')
      keydown(el, ' ')
      expect(listBox.getSelected()).toEqual(['lettuce'])

      keydown(el, 'ArrowDown')
      keydown(el, 'Enter')
      expect(listBox.getSelected()).toEqual(['tomato'])
    })

    it('should toggle with Space in multiple mode', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selectionMode: 'multiple' })

      keydown(el, 'ArrowDown')
      keydown(el, ' ')
      keydown(el, 'ArrowDown')
      keydown(el, ' ')
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])

      keydown(el, ' ')
      expect(listBox.getSelected()).toEqual(['lettuce'])
    })

    it('should extend the selection with shift and the arrows', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selectionMode: 'multiple' })

      keydown(el, 'ArrowDown')
      keydown(el, ' ')
      keydown(el, 'ArrowDown', { shiftKey: true })
      keydown(el, 'ArrowDown', { shiftKey: true })

      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato', 'onion'])
    })

    it('should extend the selection to the edge with shift Home and End', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { selectionMode: 'multiple' })

      listBox.setActive('onion')
      keydown(el, 'End', { shiftKey: true })
      expect(listBox.getSelected()).toEqual(['onion', 'cheese'])

      listBox.clear()
      listBox.setActive('tomato')
      keydown(el, 'Home', { shiftKey: true })
      expect(listBox.getSelected()).toEqual(['lettuce', 'tomato'])
    })

    it('should select everything with Ctrl+A in multiple mode only', () => {
      const el = setMarkup()
      const single = new ListBox(el)

      keydown(el, 'a', { ctrlKey: true })
      expect(single.getSelected()).toEqual([])

      single.dispose()

      const multiple = new ListBox(el, { selectionMode: 'multiple' })
      keydown(el, 'a', { metaKey: true })
      expect(multiple.getSelected()).toEqual(['lettuce', 'tomato', 'onion', 'cheese'])
    })

    it('should move the highlight with typeahead', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      keydown(el, 'o')
      expect(listBox.getActive()).toEqual('onion')

      listBox.dispose()

      const second = new ListBox(el)
      keydown(el, 'c')
      expect(second.getActive()).toEqual('cheese')
    })

    it('should match a typed prefix over several keys', () => {
      const el = setMarkup()
      const listBox = new ListBox(el)

      keydown(el, 't')
      keydown(el, 'o')
      expect(listBox.getActive()).toEqual('tomato')
    })

    it('should read the typeahead text from the option label', () => {
      const el = setMarkup('', [
        '<div class="list-box-item" data-coreui-value="lettuce"><span class="list-box-item-label">Lettuce</span><span class="list-box-item-description">Crisp</span></div>',
        '<div class="list-box-item" data-coreui-value="tomato"><span class="list-box-item-label">Tomato</span><span class="list-box-item-description">Ripe</span></div>'
      ])
      const listBox = new ListBox(el)

      keydown(el, 't')
      expect(listBox.getActive()).toEqual('tomato')
    })

    it('should not run typeahead when it is turned off', () => {
      const el = setMarkup()
      const listBox = new ListBox(el, { typeahead: false })

      keydown(el, 'o')

      expect(listBox.getActive()).toBeNull()
    })
  })

  describe('activeDescendant', () => {
    it('should keep the focus in the field and follow the highlight', () => {
      fixtureEl.innerHTML = [
        '<input type="text" id="field">',
        '<div class="list-box">',
        '<div class="list-box-item" data-coreui-value="lettuce">Lettuce</div>',
        '<div class="list-box-item" data-coreui-value="tomato">Tomato</div>',
        '</div>'
      ].join('')

      const field = fixtureEl.querySelector('#field')
      const el = fixtureEl.querySelector('.list-box')
      const listBox = new ListBox(el, { activeDescendant: '#field' })

      expect(field.getAttribute('aria-controls')).toEqual(el.id)
      expect(item(el, 'lettuce').id).toMatch(/^list-box-item-/)
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

      el.insertAdjacentHTML('beforeend', '<div class="list-box-item" data-coreui-value="bacon">Bacon</div>')
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
        '<div class="list-box-item" data-coreui-value="lettuce">Lettuce</div>',
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
        '<div class="list-box-item" data-coreui-value="lettuce">Lettuce</div>',
        '</div>'
      ].join('')

      const field = fixtureEl.querySelector('#field')
      const el = fixtureEl.querySelector('.list-box')
      const listBox = new ListBox(el, { activeDescendant: field })

      listBox.setActive('lettuce')
      expect(field.getAttribute('aria-activedescendant')).not.toBeNull()

      listBox.dispose()

      expect(ListBox.getInstance(el)).toBeNull()
      expect(field.getAttribute('aria-activedescendant')).toBeNull()
      expect(field.getAttribute('aria-controls')).toBeNull()

      keydown(field, 'ArrowDown')
      expect(field.getAttribute('aria-activedescendant')).toBeNull()
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

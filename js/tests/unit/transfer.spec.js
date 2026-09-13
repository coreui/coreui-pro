import Transfer from '../../src/transfer.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('Transfer', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const options = values => values
    .map(value => `<div class="list-box-option" data-coreui-value="${value}">${value}</div>`)
    .join('')

  const setMarkup = (attrs = '', source = ['one', 'two', 'three'], target = ['four'], search = false) => {
    const searchInput = search ?
      '<input class="form-control list-box-search" type="search" data-coreui-list-box-search>' :
      ''

    fixtureEl.innerHTML = [
      `<div class="transfer"${attrs}>`,
      '<div class="list-box transfer-list" data-coreui-transfer-list="source">',
      '<div class="list-box-header">',
      '<button type="button" class="list-box-select-all" data-coreui-select-all></button>',
      '</div>',
      searchInput,
      '<div class="list-box-options">',
      options(source),
      '</div>',
      '</div>',
      '<div class="transfer-actions">',
      '<button type="button" class="btn btn-subtle btn-sm" data-coreui-transfer-move="target-all"></button>',
      '<button type="button" class="btn btn-subtle btn-sm" data-coreui-transfer-move="target"></button>',
      '<button type="button" class="btn btn-subtle btn-sm" data-coreui-transfer-move="source"></button>',
      '<button type="button" class="btn btn-subtle btn-sm" data-coreui-transfer-move="source-all"></button>',
      '</div>',
      '<div class="list-box transfer-list" data-coreui-transfer-list="target">',
      '<div class="list-box-header">',
      '<button type="button" class="list-box-select-all" data-coreui-select-all></button>',
      '</div>',
      searchInput,
      '<div class="list-box-options">',
      options(target),
      '</div>',
      '</div>',
      '</div>'
    ].join('')

    return fixtureEl.querySelector('.transfer')
  }

  const side = (el, name) => el.querySelector(`[data-coreui-transfer-list="${name}"]`)
  const moveButton = (el, name) => el.querySelector(`[data-coreui-transfer-move="${name}"]`)
  const counter = (el, name) => side(el, name).querySelector('[data-coreui-list-box-counter]')
  const searchField = (el, name) => side(el, name).querySelector('[data-coreui-list-box-search]')
  const option = (el, name, value) => side(el, name).querySelector(`[data-coreui-value="${value}"]`)

  const click = element => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  }

  const type = (element, value) => {
    element.value = value
    element.dispatchEvent(new Event('input', { bubbles: true }))
  }

  it('should take care of element either passed as a CSS selector or DOM element', () => {
    const el = setMarkup()

    expect(new Transfer('.transfer')._element).toEqual(el)
    expect(new Transfer(el)._element).toEqual(el)
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Transfer.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Transfer.DATA_KEY).toEqual('coreui.transfer')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(Transfer.NAME).toEqual('transfer')
    })
  })

  describe('Default', () => {
    it('should return default configuration', () => {
      expect(Transfer.Default).toEqual({
        allowList: jasmine.any(Object),
        ariaMoveAllToSourceLabel: 'Move all to available',
        ariaMoveAllToTargetLabel: 'Move all to chosen',
        ariaMoveToSourceLabel: 'Move to available',
        ariaMoveToTargetLabel: 'Move to chosen',
        ariaMovedAnnouncement: '{count} moved to {title}',
        disabled: false,
        html: false,
        indicator: 'checkbox',
        items: [],
        loading: false,
        moveAllToSourceIcon: jasmine.any(String),
        moveAllToTargetIcon: jasmine.any(String),
        moveToSourceIcon: jasmine.any(String),
        moveToTargetIcon: jasmine.any(String),
        oneWay: false,
        sanitize: true,
        sanitizeFn: null,
        search: false,
        searchPlaceholder: 'Search',
        selectedCounterText: 'selected',
        sourceTitle: 'Available',
        targetTitle: 'Chosen',
        typeahead: true,
        value: []
      })
    })
  })

  describe('DefaultType', () => {
    it('should return default type configuration', () => {
      expect(Transfer.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('constructor', () => {
    it('should build two multiple list boxes and name them after the titles', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      expect(transfer.getSource()).toEqual(['one', 'two', 'three'])
      expect(transfer.getTarget()).toEqual(['four'])
      expect(side(el, 'source').querySelector('.list-box-options').getAttribute('role')).toEqual('listbox')
      expect(side(el, 'source').querySelector('.list-box-options').getAttribute('aria-label')).toEqual('Available')
      expect(side(el, 'target').querySelector('.list-box-options').getAttribute('aria-label')).toEqual('Chosen')
      expect(transfer._sides.source.listBox._config.selectionMode).toEqual('multiple')
      expect(transfer._sides.source.listBox._config.indicator).toEqual('checkbox')
    })

    it('should write the titles into the empty select all buttons', () => {
      const el = setMarkup()
      // eslint-disable-next-line no-new
      new Transfer(el)

      expect(side(el, 'source').querySelector('.list-box-select-all').textContent).toEqual('Available')
      expect(side(el, 'target').querySelector('.list-box-select-all').textContent).toEqual('Chosen')
    })

    it('should keep a select all label that the markup already carries', () => {
      const el = setMarkup()
      side(el, 'source').querySelector('.list-box-select-all').textContent = 'Everything'
      // eslint-disable-next-line no-new
      new Transfer(el)

      expect(side(el, 'source').querySelector('.list-box-select-all').textContent).toEqual('Everything')
    })

    it('should name the move buttons and point them at the list they fill', () => {
      const el = setMarkup()
      // eslint-disable-next-line no-new
      new Transfer(el)

      expect(moveButton(el, 'target').getAttribute('aria-label')).toEqual('Move to chosen')
      expect(moveButton(el, 'source').getAttribute('aria-label')).toEqual('Move to available')
      expect(moveButton(el, 'target-all').getAttribute('aria-label')).toEqual('Move all to chosen')
      expect(moveButton(el, 'source-all').getAttribute('aria-label')).toEqual('Move all to available')
      expect(moveButton(el, 'target').getAttribute('aria-controls'))
        .toEqual(side(el, 'target').querySelector('.list-box-options').id)
    })

    it('should put a chevron in every empty move button', () => {
      const el = setMarkup()
      // eslint-disable-next-line no-new
      new Transfer(el)

      for (const kind of ['target', 'source', 'target-all', 'source-all']) {
        expect(moveButton(el, kind).querySelector('svg')).not.toBeNull()
      }
    })

    it('should keep the content a move button already has', () => {
      const el = setMarkup()
      moveButton(el, 'target').textContent = 'Add'
      // eslint-disable-next-line no-new
      new Transfer(el)

      expect(moveButton(el, 'target').textContent).toEqual('Add')
    })

    it('should add a live region', () => {
      const el = setMarkup()
      // eslint-disable-next-line no-new
      new Transfer(el)

      const announcer = el.querySelector('.transfer-announcer')

      expect(announcer).not.toBeNull()
      expect(announcer.getAttribute('role')).toEqual('status')
      expect(announcer).toHaveClass('visually-hidden')
    })

    it('should initialize on page load with the data api', () => {
      setMarkup(' data-coreui-toggle="transfer"')

      const el = fixtureEl.querySelector('[data-coreui-toggle="transfer"]')
      const transfer = Transfer.getOrCreateInstance(el)

      expect(transfer).not.toBeNull()
      expect(transfer.getSource()).toEqual(['one', 'two', 'three'])
    })

    it('should throw when a list is missing', () => {
      fixtureEl.innerHTML = '<div class="transfer"></div>'

      expect(() => new Transfer(fixtureEl.querySelector('.transfer')))
        .toThrowError(TypeError, 'Transfer requires a [data-coreui-transfer-list="source"] element')
    })
  })

  describe('moving', () => {
    it('should move the selected options to the target list', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      transfer._sides.source.listBox.select('one')
      transfer._sides.source.listBox.select('three')
      click(moveButton(el, 'target'))

      expect(transfer.getSource()).toEqual(['two'])
      expect(transfer.getTarget()).toEqual(['four', 'one', 'three'])
      expect(transfer.getSelected('source')).toEqual([])
    })

    it('should move the selected options back to the source list', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      transfer._sides.target.listBox.select('four')
      click(moveButton(el, 'source'))

      expect(transfer.getSource()).toEqual(['one', 'two', 'three', 'four'])
      expect(transfer.getTarget()).toEqual([])
    })

    it('should return a value to its original place in the source', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      transfer.moveToTarget(['two'])

      expect(transfer.getSource()).toEqual(['one', 'three'])
      expect(transfer.getTarget()).toEqual(['four', 'two'])

      transfer.moveToSource(['two'])

      expect(transfer.getSource()).toEqual(['one', 'two', 'three'])
    })

    it('should return several values to their original places at once', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      transfer.moveToTarget(['three', 'one'])

      expect(transfer.getTarget()).toEqual(['four', 'one', 'three'])

      transfer.moveToSource(['three', 'one'])

      expect(transfer.getSource()).toEqual(['one', 'two', 'three'])
      expect(transfer.getTarget()).toEqual(['four'])
    })

    it('should send a value that started in the target back after its own neighbours', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      transfer.moveToSource(['four'])

      expect(transfer.getSource()).toEqual(['one', 'two', 'three', 'four'])
    })

    it('should move the values passed to the api without a selection', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      transfer.moveToTarget(['two'])

      expect(transfer.getSource()).toEqual(['one', 'three'])
      expect(transfer.getTarget()).toEqual(['four', 'two'])
    })

    it('should append to the target in the order the values arrive', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      transfer.moveToTarget(['three', 'one'])

      expect(transfer.getTarget()).toEqual(['four', 'one', 'three'])

      transfer.moveToSource(['one'])
      transfer.moveToTarget(['one'])

      expect(transfer.getTarget()).toEqual(['four', 'three', 'one'])
    })

    it('should take the text of an option that carries no value', () => {
      const el = setMarkup()
      side(el, 'source').querySelector('.list-box-options')
        .insertAdjacentHTML('beforeend', '<div class="list-box-option">five</div>')
      const transfer = new Transfer(el)

      transfer.moveToTarget(['five'])

      expect(transfer.getTarget()).toEqual(['four', 'five'])
    })

    it('should do nothing when nothing is selected', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)
      const spy = jasmine.createSpy('moved')

      el.addEventListener('moved.coreui.transfer', spy)
      click(moveButton(el, 'target'))

      expect(spy).not.toHaveBeenCalled()
      expect(transfer.getSource()).toEqual(['one', 'two', 'three'])
    })

    it('should not move anything when the transfer is disabled', () => {
      const el = setMarkup()
      const transfer = new Transfer(el, { disabled: true })

      transfer.moveToTarget(['one'])

      expect(transfer.getSource()).toEqual(['one', 'two', 'three'])
    })
  })

  describe('oneWay', () => {
    it('should hide and disable both buttons that move back', () => {
      const el = setMarkup()
      // eslint-disable-next-line no-new
      new Transfer(el, { oneWay: true })

      for (const kind of ['source', 'source-all']) {
        expect(moveButton(el, kind).hasAttribute('hidden')).toBeTrue()
        expect(moveButton(el, kind).disabled).toBeTrue()
      }
    })

    it('should refuse to move back', () => {
      const el = setMarkup()
      const transfer = new Transfer(el, { oneWay: true })

      transfer.moveToSource(['four'])
      transfer.moveAllToSource()

      expect(transfer.getTarget()).toEqual(['four'])
      expect(transfer.getSource()).toEqual(['one', 'two', 'three'])
    })
  })

  describe('moving everything', () => {
    it('should move every option of the list without a selection', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      click(moveButton(el, 'target-all'))

      expect(transfer.getSource()).toEqual([])
      expect(transfer.getTarget()).toEqual(['four', 'one', 'two', 'three'])
    })

    it('should leave the disabled options behind', () => {
      const el = setMarkup()
      option(el, 'source', 'two').classList.add('disabled')
      const transfer = new Transfer(el)

      transfer.moveAllToTarget()

      expect(transfer.getSource()).toEqual(['two'])
    })

    it('should move only what the search left on screen', () => {
      const el = setMarkup('', ['one', 'two', 'three'], ['four'], true)
      const transfer = new Transfer(el)

      type(searchField(el, 'source'), 'three')
      click(moveButton(el, 'target-all'))

      expect(transfer.getSource()).toEqual(['one', 'two'])
      expect(transfer.getTarget()).toEqual(['four', 'three'])
    })

    it('should turn the all button off when the list has nothing to give', () => {
      const el = setMarkup('', [], ['four'])
      // eslint-disable-next-line no-new
      new Transfer(el)

      expect(moveButton(el, 'target-all').disabled).toBeTrue()
      expect(moveButton(el, 'source-all').disabled).toBeFalse()
    })
  })

  describe('move buttons', () => {
    it('should enable a move button only while its list has a selection', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      expect(moveButton(el, 'target').disabled).toBeTrue()
      expect(moveButton(el, 'source').disabled).toBeTrue()

      transfer._sides.source.listBox.select('one')

      expect(moveButton(el, 'target').disabled).toBeFalse()
      expect(moveButton(el, 'source').disabled).toBeTrue()

      transfer._sides.target.listBox.select('four')

      expect(moveButton(el, 'source').disabled).toBeFalse()
    })

    it('should move the focus to the moved option when the button it came from turns off', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      transfer._sides.source.listBox.select('one')
      moveButton(el, 'target').focus()
      click(moveButton(el, 'target'))

      expect(moveButton(el, 'target').disabled).toBeTrue()
      expect(document.activeElement).toEqual(option(el, 'target', 'one'))
    })

    it('should leave the focus alone when the move came from somewhere else', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)
      const selectAll = side(el, 'source').querySelector('.list-box-select-all')

      selectAll.focus()
      transfer.moveToTarget(['one'])

      expect(document.activeElement).toEqual(selectAll)
    })

    it('should disable both buttons when the transfer is disabled', () => {
      const el = setMarkup()
      // eslint-disable-next-line no-new
      new Transfer(el, { disabled: true })

      expect(moveButton(el, 'target').disabled).toBeTrue()
      expect(moveButton(el, 'source').disabled).toBeTrue()
    })
  })

  describe('events', () => {
    it('should fire move with the direction and the values, then moved', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)
      const order = []

      el.addEventListener('move.coreui.transfer', event => order.push(`move:${event.direction}:${event.values.join(',')}`))
      el.addEventListener('moved.coreui.transfer', event => order.push(`moved:${event.values.join(',')}`))

      transfer.moveToTarget(['one'])

      expect(order).toEqual(['move:target:one', 'moved:one'])
    })

    it('should not move when the move event is prevented', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      el.addEventListener('move.coreui.transfer', event => event.preventDefault())
      transfer.moveToTarget(['one'])

      expect(transfer.getSource()).toEqual(['one', 'two', 'three'])
      expect(transfer.getTarget()).toEqual(['four'])
    })

    it('should leave the dom event target alone', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)
      let target = null

      el.addEventListener('change.coreui.transfer', event => {
        target = event.target
      })

      transfer.moveToTarget(['one'])

      expect(target).toEqual(el)
    })

    it('should report both lists on change', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)
      let payload = null

      el.addEventListener('change.coreui.transfer', event => {
        payload = { sourceValues: event.sourceValues, targetValues: event.targetValues }
      })

      transfer.moveToTarget(['one'])

      expect(payload).toEqual({ sourceValues: ['two', 'three'], targetValues: ['four', 'one'] })
    })
  })

  describe('items', () => {
    const users = [
      { value: 'ada', label: 'Ada' },
      { value: 'bob', label: 'Bob' },
      { value: 'cleo', label: 'Cleo' }
    ]

    it('should build both lists from the items and the value', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, { items: users, value: ['cleo', 'ada'] })

      expect(transfer.getSource()).toEqual(['bob'])
      expect(transfer.getTarget()).toEqual(['cleo', 'ada'])
      expect(option(el, 'source', 'bob').textContent).toEqual('Bob')
    })

    it('should return the configured items', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, { items: users })

      expect(transfer.getItems()).toEqual(users)
    })

    it('should keep a group together in the source list', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, {
        items: [{ label: 'Crew', items: users }],
        value: ['bob']
      })

      expect(transfer.getSource()).toEqual(['ada', 'cleo'])
      expect(side(el, 'source').querySelector('.list-box-section-label').textContent).toEqual('Crew')
    })

    it('should build the options element when the markup has none', () => {
      fixtureEl.innerHTML = [
        '<div class="transfer">',
        '<div class="list-box transfer-list" data-coreui-transfer-list="source"></div>',
        '<div class="list-box transfer-list" data-coreui-transfer-list="target"></div>',
        '</div>'
      ].join('')
      const el = fixtureEl.querySelector('.transfer')
      const transfer = new Transfer(el, { items: users, value: ['ada'] })

      expect(transfer.getSource()).toEqual(['bob', 'cleo'])
      expect(transfer.getTarget()).toEqual(['ada'])
    })

    it('should put a value returned to the source back in the items order', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, { items: users, value: ['ada'] })

      transfer.moveToSource(['ada'])

      expect(transfer.getSource()).toEqual(['ada', 'bob', 'cleo'])
    })

    it('should keep the target when the items change', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, { items: users, value: ['cleo'] })

      transfer.setItems([...users, { value: 'dan', label: 'Dan' }])

      expect(transfer.getTarget()).toEqual(['cleo'])
      expect(transfer.getSource()).toEqual(['ada', 'bob', 'dan'])
    })

    it('should drop a target value that the new items no longer carry', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, { items: users, value: ['cleo'] })

      transfer.setItems([{ value: 'ada', label: 'Ada' }])

      expect(transfer.getTarget()).toEqual([])
      expect(transfer.getSource()).toEqual(['ada'])
    })

    it('should parse a label as markup only with the html option', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, { html: true, items: [{ value: 'ada', label: '<b>Ada</b>' }] })

      expect(option(el, 'source', 'ada').querySelector('b')).not.toBeNull()
      expect(transfer.getSource()).toEqual(['ada'])
    })

    it('should leave the target unselected after setItems', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, { items: users, value: ['cleo'] })

      transfer.moveToTarget(['ada'])

      const chosen = option(el, 'target', 'cleo')

      chosen.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      click(chosen)

      expect(transfer.getSelected('target')).toEqual(['cleo'])

      transfer.setItems([...users, { value: 'dan', label: 'Dan' }])

      expect(transfer.getTarget()).toEqual(['cleo', 'ada'])
      expect(transfer.getSelected('target')).toEqual([])
      expect(transfer.getSelected('source')).toEqual([])
      expect(option(el, 'target', 'cleo').getAttribute('aria-selected')).toEqual('false')
    })

    it('should let a target option be toggled after an external re-fetch', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, { items: users, search: 'external', value: ['cleo'] })

      type(searchField(el, 'source'), 'a')
      transfer.setItems(users)

      const target = option(el, 'target', 'cleo')

      target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      click(target)

      expect(transfer.getSelected('target')).toEqual(['cleo'])
      expect(target.hasAttribute('aria-disabled')).toBeFalse()
      expect(side(el, 'target').classList.contains('loading')).toBeFalse()

      transfer.moveToSource(['cleo'])

      expect(transfer.getTarget()).toEqual([])
      expect(transfer.getSource()).toEqual(['ada', 'bob', 'cleo'])
    })

    it('should honour a selected item on the first render only', () => {
      const el = setMarkup('', [], [])
      const marked = [{ value: 'ada', label: 'Ada', selected: true }, { value: 'bob', label: 'Bob' }]
      const transfer = new Transfer(el, { items: marked })

      expect(transfer.getSelected('source')).toEqual(['ada'])

      transfer.setItems(marked)

      expect(transfer.getSelected('source')).toEqual([])
    })

    it('should clear the destination selection after a move', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, { items: users, value: ['cleo'] })

      const chosen = option(el, 'target', 'cleo')

      chosen.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      click(chosen)
      transfer.moveToTarget(['ada'])

      expect(transfer.getSelected('target')).toEqual([])
    })

    it('should release both lists when setLoading is called without a side', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, { items: users, loading: true })

      expect(side(el, 'source').classList.contains('loading')).toBeTrue()
      expect(side(el, 'target').classList.contains('loading')).toBeTrue()

      transfer.setLoading(false)

      expect(side(el, 'source').classList.contains('loading')).toBeFalse()
      expect(side(el, 'target').classList.contains('loading')).toBeFalse()
    })

    it('should mark a loading list as busy', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, { items: users })

      transfer.setLoading(true, 'source')

      expect(side(el, 'source').querySelector('.list-box-options').getAttribute('aria-busy')).toEqual('true')
      expect(side(el, 'target').querySelector('.list-box-options').hasAttribute('aria-busy')).toBeFalse()

      transfer.setLoading(true)

      expect(side(el, 'target').querySelector('.list-box-options').getAttribute('aria-busy')).toEqual('true')

      transfer.setLoading(false)

      expect(side(el, 'source').querySelector('.list-box-options').hasAttribute('aria-busy')).toBeFalse()
    })
  })

  describe('search', () => {
    it('should hide the options that do not match', () => {
      const el = setMarkup('', ['one', 'two', 'three'], ['four'], true)
      // eslint-disable-next-line no-new
      new Transfer(el)

      type(searchField(el, 'source'), 'o')

      expect(option(el, 'source', 'one').hasAttribute('hidden')).toBeFalse()
      expect(option(el, 'source', 'two').hasAttribute('hidden')).toBeFalse()
      expect(option(el, 'source', 'three').hasAttribute('hidden')).toBeTrue()
    })

    it('should let select all take only the options left by the search', () => {
      const el = setMarkup('', ['one', 'two', 'three'], ['four'], true)
      const transfer = new Transfer(el)

      type(searchField(el, 'source'), 'three')
      click(side(el, 'source').querySelector('.list-box-select-all'))

      expect(transfer.getSelected('source')).toEqual(['three'])
    })

    it('should match the label of a described option', () => {
      const el = setMarkup('', ['one'], ['four'], true)
      side(el, 'source').querySelector('.list-box-options').innerHTML = [
        '<div class="list-box-option" data-coreui-value="one">',
        '<span class="list-box-option-label">Alpha</span>',
        '<span class="list-box-option-description">Beta</span>',
        '</div>'
      ].join('')
      const transfer = new Transfer(el)

      type(searchField(el, 'source'), 'beta')

      expect(option(el, 'source', 'one').hasAttribute('hidden')).toBeTrue()

      type(searchField(el, 'source'), 'alpha')

      expect(option(el, 'source', 'one').hasAttribute('hidden')).toBeFalse()
      expect(transfer.getSource()).toEqual(['one'])
    })

    it('should not filter in external search mode and report the query', () => {
      const el = setMarkup('', [], [])
      const transfer = new Transfer(el, {
        items: [{ value: 'ada', label: 'Ada' }, { value: 'bob', label: 'Bob' }],
        search: 'external'
      })
      const spy = jasmine.createSpy('search')

      el.addEventListener('search.coreui.transfer', event => spy(event.side, event.query))
      type(searchField(el, 'source'), 'zzz')

      expect(spy).toHaveBeenCalledWith('source', 'zzz')
      expect(option(el, 'source', 'ada').hasAttribute('hidden')).toBeFalse()
      expect(option(el, 'source', 'bob').hasAttribute('hidden')).toBeFalse()
      expect(transfer.getSource()).toEqual(['ada', 'bob'])
    })

    it('should report the side the external search was typed in', () => {
      const el = setMarkup('', [], [])
      // eslint-disable-next-line no-new
      new Transfer(el, { items: [{ value: 'ada', label: 'Ada' }], search: 'external', value: ['ada'] })
      const spy = jasmine.createSpy('search')

      el.addEventListener('search.coreui.transfer', event => spy(event.side, event.query))
      type(searchField(el, 'target'), 'ad')

      expect(spy).toHaveBeenCalledWith('target', 'ad')
    })

    it('should build the search field when the search option is on', () => {
      const el = setMarkup()
      // eslint-disable-next-line no-new
      new Transfer(el, { search: true, searchPlaceholder: 'Filter' })

      expect(searchField(el, 'source')).not.toBeNull()
      expect(searchField(el, 'source').placeholder).toEqual('Filter')
      expect(searchField(el, 'source').getAttribute('aria-label')).toEqual('Filter Available')
    })
  })

  describe('counter', () => {
    it('should read the selection against the visible options', () => {
      const el = setMarkup('', ['one', 'two', 'three'], ['four'], true)
      const transfer = new Transfer(el)

      expect(counter(el, 'source').textContent).toEqual('0/3 selected')

      transfer._sides.source.listBox.select('one')

      expect(counter(el, 'source').textContent).toEqual('1/3 selected')

      type(searchField(el, 'source'), 'three')

      expect(counter(el, 'source').textContent).toEqual('0/1 selected')
    })

    it('should follow the moved options', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      transfer.moveToTarget(['one'])

      expect(counter(el, 'source').textContent).toEqual('0/2 selected')
      expect(counter(el, 'target').textContent).toEqual('0/2 selected')
    })
  })

  describe('live region', () => {
    it('should announce the move with the count and the destination title', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      transfer.moveToTarget(['one', 'two'])

      expect(el.querySelector('.transfer-announcer').textContent).toEqual('2 moved to Chosen')

      transfer.moveToSource(['four'])

      expect(el.querySelector('.transfer-announcer').textContent).toEqual('1 moved to Available')
    })
  })

  describe('update', () => {
    it('should place an option added later after the ones already there', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      side(el, 'source').querySelector('.list-box-options')
        .insertAdjacentHTML('afterbegin', '<div class="list-box-option" data-coreui-value="five">five</div>')
      transfer.update()
      transfer.moveToTarget(['five'])
      transfer.moveToSource(['five'])

      expect(transfer.getSource()).toEqual(['one', 'two', 'three', 'five'])
    })

    it('should take options added to the dom', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)

      side(el, 'source').querySelector('.list-box-options')
        .insertAdjacentHTML('beforeend', '<div class="list-box-option" data-coreui-value="five">five</div>')
      transfer.update()

      expect(transfer.getSource()).toEqual(['one', 'two', 'three', 'five'])
      expect(counter(el, 'source').textContent).toEqual('0/4 selected')
    })
  })

  describe('dispose', () => {
    it('should destroy both list boxes and remove the live region', () => {
      const el = setMarkup()
      const transfer = new Transfer(el)
      const sourceList = side(el, 'source')

      transfer.dispose()

      expect(Transfer.getInstance(el)).toBeNull()
      expect(el.querySelector('.transfer-announcer')).toBeNull()
      expect(sourceList).not.toBeNull()
    })
  })

  describe('jQueryInterface', () => {
    it('should create a transfer and call a method', () => {
      const el = setMarkup()

      jQueryMock.fn.transfer = Transfer.jQueryInterface
      jQueryMock.elements = [el]

      jQueryMock.fn.transfer.call(jQueryMock)
      expect(Transfer.getInstance(el)).not.toBeNull()

      jQueryMock.fn.transfer.call(jQueryMock, 'moveToTarget', ['one'])
      expect(Transfer.getInstance(el).getTarget()).toEqual(['four', 'one'])
    })

    it('should throw an error on undefined method', () => {
      const el = setMarkup()

      jQueryMock.fn.transfer = Transfer.jQueryInterface
      jQueryMock.elements = [el]

      expect(() => {
        jQueryMock.fn.transfer.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })
})

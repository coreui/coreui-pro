import Chip from '../../src/chip.js'
import ChipFilter from '../../src/chip-filter.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('ChipFilter', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const tick = () => new Promise(resolve => {
    setTimeout(resolve)
  })

  const setMarkup = (chips = ['First', 'Second', 'Third'], attrs = '') => {
    fixtureEl.innerHTML = [
      `<div class="chip-set chip-filter"${attrs}>`,
      ...chips.map(chip => `  <span class="chip">${chip}</span>`),
      '</div>'
    ].join('')

    return fixtureEl.querySelector('.chip-filter')
  }

  const keydown = (chip, key, options = {}) => {
    chip.dispatchEvent(new KeyboardEvent('keydown', {
      key, bubbles: true, cancelable: true, ...options
    }))
  }

  const trackChanges = el => {
    const changes = []

    el.addEventListener('change.coreui.chip-filter', event => changes.push(event.value))
    return changes
  }

  describe('static', () => {
    it('should return the plugin version and data key', () => {
      expect(ChipFilter.VERSION).toEqual(jasmine.any(String))
      expect(ChipFilter.DATA_KEY).toEqual('coreui.chip-filter')
      expect(ChipFilter.NAME).toEqual('chip-filter')
    })

    it('should offer the selection options and no removable option', () => {
      expect(ChipFilter.Default).toEqual(jasmine.objectContaining({
        id: null,
        name: null,
        required: false,
        selectionMode: 'multiple',
        validationState: null
      }))
      expect(Object.keys(ChipFilter.Default)).not.toContain('removable')
      expect(Object.keys(ChipFilter.DefaultType)).not.toContain('removable')
      expect(ChipFilter.DefaultType).toEqual(jasmine.objectContaining({ name: '(string|null)', required: 'boolean' }))
    })
  })

  describe('roles', () => {
    it('should expose a horizontal multiselectable listbox of options', () => {
      const el = setMarkup(['First', 'Second'])
      // eslint-disable-next-line no-new
      new ChipFilter(el)

      expect(el.getAttribute('role')).toEqual('listbox')
      expect(el.getAttribute('aria-orientation')).toEqual('horizontal')
      expect(el.getAttribute('aria-multiselectable')).toEqual('true')

      for (const chip of el.querySelectorAll('.chip')) {
        expect(chip.getAttribute('role')).toEqual('option')
        expect(chip.getAttribute('aria-selected')).toEqual('false')
      }
    })

    it('should not set aria-multiselectable in single selection mode', () => {
      const el = setMarkup(['First'])
      // eslint-disable-next-line no-new
      new ChipFilter(el, { selectionMode: 'single' })

      expect(el.getAttribute('role')).toEqual('listbox')
      expect(el.hasAttribute('aria-multiselectable')).toBeFalse()
    })

    it('should make every chip an option, whatever role the markup gave it', () => {
      fixtureEl.innerHTML = '<div class="chip-filter"><span class="chip" role="button">First</span></div>'
      const el = fixtureEl.querySelector('.chip-filter')
      // eslint-disable-next-line no-new
      new ChipFilter(el)

      expect(el.querySelector('.chip').getAttribute('role')).toEqual('option')
    })

    it('should stamp role option on chips added later', () => {
      const el = setMarkup([])
      const chipFilter = new ChipFilter(el)

      expect(chipFilter.add('Fresh').getAttribute('role')).toEqual('option')
    })

    it('should take the option role off its chips on dispose, so a chip on its own becomes a button', () => {
      const el = setMarkup(['First'])
      const chip = el.querySelector('.chip')

      new ChipFilter(el).dispose()
      // eslint-disable-next-line no-new
      new Chip(chip, { selectable: true })

      expect(chip.getAttribute('role')).toEqual('button')
      expect(chip.hasAttribute('aria-selected')).toBeFalse()
    })

    it('should add its classes to the host', () => {
      fixtureEl.innerHTML = '<div id="host"><span class="chip">First</span></div>'
      const el = fixtureEl.querySelector('#host')
      // eslint-disable-next-line no-new
      new ChipFilter(el)

      expect(el.classList.contains('chip-filter')).toBeTrue()
      expect(el.classList.contains('chip-set')).toBeTrue()
    })

    it('should mark a disabled filter on the listbox', () => {
      const el = setMarkup(['First'])
      // eslint-disable-next-line no-new
      new ChipFilter(el, { disabled: true })

      expect(el.getAttribute('aria-disabled')).toEqual('true')
      expect(el.querySelector('.chip').getAttribute('aria-disabled')).toEqual('true')
      expect(el.querySelector('.chip').hasAttribute('tabindex')).toBeFalse()
    })
  })

  describe('no removal', () => {
    it('should render no remove control, also for a removable attribute on a chip', () => {
      fixtureEl.innerHTML = '<div class="chip-filter"><span class="chip" data-coreui-removable="true">First</span></div>'
      const el = fixtureEl.querySelector('.chip-filter')
      // eslint-disable-next-line no-new
      new ChipFilter(el)

      expect(el.querySelector('.chip-remove')).toBeNull()
    })

    it('should not remove a chip with Backspace', () => {
      const el = setMarkup(['First'])
      // eslint-disable-next-line no-new
      new ChipFilter(el)

      const chip = el.querySelector('.chip')
      keydown(chip, 'Backspace')

      expect(chip.isConnected).toBeTrue()
    })

    it('should not announce a change of its list', async () => {
      const el = setMarkup(['First'])
      const chipFilter = new ChipFilter(el)
      await tick()

      chipFilter.add('Second')
      await new Promise(resolve => {
        setTimeout(resolve, 200)
      })

      expect(document.querySelector('[data-coreui-live-announcer] [aria-live="polite"] > *')).toBeNull()
    })
  })

  describe('selection', () => {
    it('should allow several selected chips by default', () => {
      const el = setMarkup(['First', 'Second'])
      const chipFilter = new ChipFilter(el)

      const chips = el.querySelectorAll('.chip')
      Chip.getInstance(chips[0]).select()
      Chip.getInstance(chips[1]).select()

      expect(chipFilter.getSelectedValues()).toEqual(['First', 'Second'])
    })

    it('should deselect the others in single selection mode', () => {
      const el = setMarkup(['First', 'Second'])
      const chipFilter = new ChipFilter(el, { selectionMode: 'single' })

      const chips = el.querySelectorAll('.chip')
      Chip.getInstance(chips[0]).select()
      Chip.getInstance(chips[1]).select()

      expect(chipFilter.getSelectedValues()).toEqual(['Second'])
    })

    it('should show the check icon on a selected chip without an option', () => {
      const el = setMarkup(['First'])
      // eslint-disable-next-line no-new
      new ChipFilter(el)

      const chip = el.querySelector('.chip')
      expect(chip.querySelector('.chip-check')).toBeNull()

      Chip.getInstance(chip).select()

      expect(chip.querySelector('.chip-check')).not.toBeNull()
    })

    it('should use selectedIcon for the check', () => {
      const el = setMarkup(['First'])
      // eslint-disable-next-line no-new
      new ChipFilter(el, { selectedIcon: '<i class="mine"></i>' })

      const chip = el.querySelector('.chip')
      Chip.getInstance(chip).select()

      expect(chip.querySelector('.chip-check .mine')).not.toBeNull()
    })

    it('should select and deselect all chips', () => {
      const el = setMarkup(['First', 'Second'])
      const chipFilter = new ChipFilter(el)

      chipFilter.selectAll()
      expect(chipFilter.getSelectedValues()).toEqual(['First', 'Second'])

      chipFilter.deselectAll()
      expect(chipFilter.getSelectedValues()).toEqual([])
    })

    it('should select a specific chip with selectChip', () => {
      const el = setMarkup(['First', 'Second'])
      const chipFilter = new ChipFilter(el)

      chipFilter.selectChip(el.querySelectorAll('.chip')[1])

      expect(chipFilter.getSelectedValues()).toEqual(['Second'])
    })

    it('should ignore selectChip for an element outside it', () => {
      const el = setMarkup(['First'])
      const chipFilter = new ChipFilter(el)
      const outside = document.createElement('span')

      outside.className = 'chip'
      chipFilter.selectChip(outside)

      expect(chipFilter.getSelectedValues()).toEqual([])
    })

    it('should start with the chips marked data-coreui-selected, in silence', async () => {
      fixtureEl.innerHTML = '<div class="chip-filter"><span class="chip">First</span><span class="chip" data-coreui-selected="true">Second</span></div>'
      const el = fixtureEl.querySelector('.chip-filter')
      const changes = trackChanges(el)
      const chipFilter = new ChipFilter(el)
      await tick()

      expect(chipFilter.getSelectedValues()).toEqual(['Second'])
      expect(changes).toEqual([])
    })

    it('should not take the selection from an active class', () => {
      fixtureEl.innerHTML = '<div class="chip-filter"><span class="chip active">First</span></div>'
      const chipFilter = new ChipFilter(fixtureEl.querySelector('.chip-filter'))

      expect(chipFilter.getSelectedValues()).toEqual([])
    })
  })

  describe('keyboard and pointer', () => {
    it('should select every chip on Ctrl+A with one change', () => {
      const el = setMarkup()
      const chipFilter = new ChipFilter(el)
      const changes = trackChanges(el)

      keydown(el.querySelector('.chip'), 'a', { ctrlKey: true })

      expect(chipFilter.getSelectedValues()).toEqual(['First', 'Second', 'Third'])
      expect(changes).toEqual([['First', 'Second', 'Third']])
    })

    it('should leave Ctrl+A alone in single selection mode', () => {
      const el = setMarkup(['First', 'Second'])
      const chipFilter = new ChipFilter(el, { selectionMode: 'single' })

      keydown(el.querySelector('.chip'), 'a', { ctrlKey: true })

      expect(chipFilter.getSelectedValues()).toEqual([])
    })

    it('should select nothing with selectAll in the single mode', () => {
      const el = setMarkup()
      const chipFilter = new ChipFilter(el, { selectionMode: 'single' })

      chipFilter.selectAll()

      expect(chipFilter.getSelectedValues()).toEqual([])
    })

    it('should skip a disabled chip with selectAll and Ctrl+A', () => {
      fixtureEl.innerHTML = '<div class="chip-filter"><span class="chip">First</span><span class="chip" data-coreui-disabled="true">Second</span></div>'
      const el = fixtureEl.querySelector('.chip-filter')
      const chipFilter = new ChipFilter(el)

      keydown(el.querySelector('.chip'), 'a', { ctrlKey: true })
      expect(chipFilter.getSelectedValues()).toEqual(['First'])

      chipFilter.deselectAll()
      chipFilter.selectAll()
      expect(chipFilter.getSelectedValues()).toEqual(['First'])
    })

    it('should anchor a range on the chip that holds the focus at the first key', () => {
      const el = setMarkup()
      const chipFilter = new ChipFilter(el)
      const chips = el.querySelectorAll('.chip')

      chips[0].focus()
      keydown(chips[0], 'End', { shiftKey: true })

      expect(chipFilter.getSelectedValues()).toEqual(['First', 'Second', 'Third'])
    })

    it('should anchor a range on the chip an arrow key moved to', () => {
      const el = setMarkup()
      const chipFilter = new ChipFilter(el)
      const chips = el.querySelectorAll('.chip')

      chips[0].focus()
      keydown(chips[0], 'ArrowRight')
      keydown(chips[1], 'ArrowRight', { shiftKey: true })

      expect(chipFilter.getSelectedValues()).toEqual(['Second', 'Third'])
    })

    it('should start on the first selected enabled option', () => {
      fixtureEl.innerHTML = '<div class="chip-filter"><span class="chip">First</span><span class="chip" data-coreui-disabled="true" data-coreui-selected="true">Second</span><span class="chip" data-coreui-selected="true">Third</span></div>'
      const el = fixtureEl.querySelector('.chip-filter')
      // eslint-disable-next-line no-new
      new ChipFilter(el)

      expect([...el.querySelectorAll('.chip')].map(chip => chip.getAttribute('tabindex'))).toEqual(['-1', null, '0'])
    })

    it('should extend the selection with Shift and an arrow key', () => {
      const el = setMarkup()
      const chipFilter = new ChipFilter(el)

      const chips = el.querySelectorAll('.chip')
      chips[0].click()
      keydown(chips[0], 'ArrowRight', { shiftKey: true })

      expect(chipFilter.getSelectedValues()).toEqual(['First', 'Second'])
    })

    it('should extend the selection to the edge with Shift+End, in one change', () => {
      const el = setMarkup()
      const chipFilter = new ChipFilter(el)

      const chips = el.querySelectorAll('.chip')
      chips[0].click()

      const changes = trackChanges(el)
      keydown(chips[0], 'End', { shiftKey: true })

      expect(chipFilter.getSelectedValues()).toEqual(['First', 'Second', 'Third'])
      expect(changes).toEqual([['First', 'Second', 'Third']])
    })

    it('should select a range on Shift+click without toggling the clicked chip twice', () => {
      const el = setMarkup()
      const chipFilter = new ChipFilter(el)

      const chips = el.querySelectorAll('.chip')
      chips[0].click()
      chips[2].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }))

      expect(chipFilter.getSelectedValues()).toEqual(['First', 'Second', 'Third'])
    })

    it('should keep the anchor for the next Shift+click after a range', () => {
      const el = setMarkup(['First', 'Second', 'Third', 'Fourth', 'Fifth'])
      const chipFilter = new ChipFilter(el)

      const chips = el.querySelectorAll('.chip')
      chips[0].click()
      chips[2].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }))
      chips[4].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }))

      expect(chipFilter.getSelectedValues()).toEqual(['First', 'Second', 'Third', 'Fourth', 'Fifth'])
    })

    it('should keep the anchor for a Shift+click after the selection is cleared', () => {
      const el = setMarkup()
      const chipFilter = new ChipFilter(el)

      const chips = el.querySelectorAll('.chip')
      chips[0].click()
      chipFilter.deselectAll()
      chips[2].dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }))

      expect(chipFilter.getSelectedValues()).toEqual(['First', 'Second', 'Third'])
    })

    it('should keep the space a chip toggle during a search', () => {
      const el = setMarkup(['Newark', 'New York'])
      const chipFilter = new ChipFilter(el)

      el.querySelector('.chip').focus()

      for (const key of 'new') {
        keydown(document.activeElement, key)
      }

      const focused = document.activeElement
      keydown(focused, ' ')

      expect(chipFilter.getSelectedValues()).toEqual([focused.textContent.trim()])
      expect(document.activeElement).toEqual(focused)
    })

    it('should not move between options with the up and down keys', () => {
      const el = setMarkup(['First', 'Second'])
      // eslint-disable-next-line no-new
      new ChipFilter(el)

      const [first] = el.querySelectorAll('.chip')

      first.focus()
      keydown(first, 'ArrowDown')

      expect(document.activeElement).toEqual(first)
    })
  })

  describe('change', () => {
    it('should fire with the selected values on a click', () => {
      const el = setMarkup(['First'])
      // eslint-disable-next-line no-new
      new ChipFilter(el)
      const changes = trackChanges(el)

      el.querySelector('.chip').click()

      expect(changes).toEqual([['First']])
    })

    it('should fire once for selectAll and deselectAll', () => {
      const el = setMarkup()
      const chipFilter = new ChipFilter(el)
      const changes = trackChanges(el)

      chipFilter.selectAll()
      chipFilter.deselectAll()
      chipFilter.selectAll()
      chipFilter.deselectAll()

      expect(changes).toEqual([['First', 'Second', 'Third'], [], ['First', 'Second', 'Third'], []])
    })

    it('should fire once when a chip replaces the selected one in single mode', () => {
      const el = setMarkup(['First', 'Second'])
      // eslint-disable-next-line no-new
      new ChipFilter(el, { selectionMode: 'single' })

      const chips = el.querySelectorAll('.chip')
      chips[0].click()

      const changes = trackChanges(el)
      chips[1].click()

      expect(changes).toEqual([['Second']])
    })

    it('should stay silent when the selection did not move', () => {
      const el = setMarkup(['First', 'Second'])
      const chipFilter = new ChipFilter(el)
      const changes = trackChanges(el)

      chipFilter.deselectAll()
      chipFilter.add('Third')
      chipFilter.remove('Second')

      expect(changes).toEqual([])
    })

    it('should drop a removed selected option from the value and report it', () => {
      const el = setMarkup(['First', 'Second'])
      const chipFilter = new ChipFilter(el, { name: 'tags' })

      el.querySelector('.chip').click()

      const changes = trackChanges(el)
      chipFilter.remove('First')

      expect(changes).toEqual([[]])
      expect(chipFilter._valueField.value).toEqual('')
    })

    it('should not fire select.coreui.chip-filter', () => {
      const el = setMarkup(['First'])
      // eslint-disable-next-line no-new
      new ChipFilter(el)
      const spy = jasmine.createSpy('select')

      el.addEventListener('select.coreui.chip-filter', spy)
      el.querySelector('.chip').click()

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('name', () => {
    it('should keep an aria-label the page gave it', () => {
      const el = setMarkup(['First'], ' aria-label="Sizes"')
      // eslint-disable-next-line no-new
      new ChipFilter(el)

      expect(el.getAttribute('aria-label')).toEqual('Sizes')
      expect(el.hasAttribute('aria-labelledby')).toBeFalse()
    })

    it('should put the id option on the host and take its name from a label for it', () => {
      fixtureEl.innerHTML = '<label for="sizes">Size</label><div class="chip-filter"><span class="chip">S</span></div>'
      const el = fixtureEl.querySelector('.chip-filter')
      // eslint-disable-next-line no-new
      new ChipFilter(el, { id: 'sizes', name: 'size' })
      const label = fixtureEl.querySelector('label')

      expect(el.id).toEqual('sizes')
      expect(label.id).not.toEqual('')
      expect(el.getAttribute('aria-labelledby')).toEqual(label.id)
      expect(fixtureEl.querySelector('select').id).toEqual('')
    })

    it('should not add a label to a host that has a name', () => {
      fixtureEl.innerHTML = '<label for="sizes">Size</label><div id="sizes" class="chip-filter" aria-label="Sizes"><span class="chip">S</span></div>'
      const el = fixtureEl.querySelector('.chip-filter')
      // eslint-disable-next-line no-new
      new ChipFilter(el)

      expect(el.hasAttribute('aria-labelledby')).toBeFalse()
    })

    it('should focus the tab stop on a click on its label', () => {
      fixtureEl.innerHTML = '<label for="sizes">Size</label><div id="sizes" class="chip-filter"><span class="chip">S</span><span class="chip">M</span></div>'
      const el = fixtureEl.querySelector('.chip-filter')
      // eslint-disable-next-line no-new
      new ChipFilter(el)

      fixtureEl.querySelector('label').click()

      expect(document.activeElement).toEqual(el.querySelector('.chip'))
    })
  })

  describe('form', () => {
    it('should keep a value field out of the form without a name', () => {
      const el = setMarkup(['First'])
      // eslint-disable-next-line no-new
      new ChipFilter(el)

      expect(el.querySelector('select').hasAttribute('name')).toBeFalse()
    })

    it('should write the selection to the form', () => {
      fixtureEl.innerHTML = '<form><div class="chip-filter"><span class="chip">First</span><span class="chip">Second</span></div></form>'
      const form = fixtureEl.querySelector('form')
      const el = fixtureEl.querySelector('.chip-filter')
      // eslint-disable-next-line no-new
      new ChipFilter(el, { name: 'tags' })

      el.querySelector('.chip').click()

      expect([...new FormData(form).entries()]).toEqual([['tags', 'First']])
    })

    it('should tell the listbox it is required and block an empty form', () => {
      fixtureEl.innerHTML = '<form><div class="chip-filter"><span class="chip">First</span></div></form>'
      const form = fixtureEl.querySelector('form')
      const el = fixtureEl.querySelector('.chip-filter')
      // eslint-disable-next-line no-new
      new ChipFilter(el, { name: 'tags', required: true })

      expect(el.getAttribute('aria-required')).toEqual('true')
      expect(form.checkValidity()).toBeFalse()

      el.querySelector('.chip').click()

      expect(form.checkValidity()).toBeTrue()
    })

    it('should put the state and its message on the listbox', () => {
      fixtureEl.innerHTML = '<form><div class="chip-filter" data-coreui-validation-state="invalid"><span class="chip">First</span></div><div class="invalid-feedback" id="tags-error">Pick one.</div></form>'
      const el = fixtureEl.querySelector('.chip-filter')
      const chipFilter = new ChipFilter(el, { name: 'tags' })

      expect(el.getAttribute('aria-invalid')).toEqual('true')
      expect(el.getAttribute('aria-describedby')).toEqual('tags-error')

      chipFilter.setValidationState('valid')

      expect(el.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should keep a given state on a change the user makes and on one from code', () => {
      fixtureEl.innerHTML = '<form><div class="chip-filter" data-coreui-validation-state="invalid"><span class="chip">First</span><span class="chip">Second</span></div></form>'
      const el = fixtureEl.querySelector('.chip-filter')
      const chipFilter = new ChipFilter(el, { name: 'tags' })
      const form = fixtureEl.querySelector('form')

      chipFilter.selectChip(el.querySelectorAll('.chip')[1])

      expect(el.classList.contains('is-invalid')).toBeTrue()
      expect(el.getAttribute('aria-invalid')).toBe('true')

      el.querySelector('.chip').click()

      expect(el.classList.contains('is-invalid')).toBeTrue()
      expect(el.getAttribute('aria-invalid')).toBe('true')
      expect(form.checkValidity()).toBeTrue()
    })

    it('should keep a given state when a key changes nothing', () => {
      const el = setMarkup()
      const chipFilter = new ChipFilter(el, { name: 'tags', validationState: 'invalid' })

      chipFilter.selectAll()
      keydown(el.querySelector('.chip'), 'a', { ctrlKey: true })

      expect(el.getAttribute('aria-invalid')).toEqual('true')
    })

    it('should send a real failed submit to its tab stop', () => {
      fixtureEl.innerHTML = '<form><div class="chip-filter"><span class="chip">First</span><span class="chip">Second</span></div></form>'
      const el = fixtureEl.querySelector('.chip-filter')
      // eslint-disable-next-line no-new
      new ChipFilter(el, { name: 'tags', required: true })

      fixtureEl.querySelector('form').requestSubmit()

      expect(document.activeElement).toEqual(el.querySelector('.chip'))
    })

    it('should send a failed submit to its tab stop', () => {
      fixtureEl.innerHTML = '<form><div class="chip-filter"><span class="chip">First</span><span class="chip">Second</span></div></form>'
      const el = fixtureEl.querySelector('.chip-filter')
      const chipFilter = new ChipFilter(el, { name: 'tags', required: true })

      chipFilter._valueField.focus()

      expect(document.activeElement).toEqual(el.querySelector('.chip'))
    })

    it('should send a failed submit to the listbox when no chip takes focus', () => {
      fixtureEl.innerHTML = '<form><div class="chip-filter"><span class="chip" data-coreui-disabled="true">First</span></div></form>'
      const el = fixtureEl.querySelector('.chip-filter')
      const chipFilter = new ChipFilter(el, { name: 'tags', required: true })

      chipFilter._valueField.focus()

      expect(document.activeElement).toEqual(el)
    })

    it('should go back to the selection it started with on a reset, in one change', async () => {
      fixtureEl.innerHTML = '<form><div class="chip-filter"><span class="chip" data-coreui-selected="true">First</span><span class="chip">Second</span></div></form>'
      const form = fixtureEl.querySelector('form')
      const el = fixtureEl.querySelector('.chip-filter')
      const chipFilter = new ChipFilter(el, { name: 'tags' })
      const [first, second] = el.querySelectorAll('.chip')

      first.click()
      second.click()

      const changes = trackChanges(el)

      form.reset()
      await tick()

      expect(chipFilter.getSelectedValues()).toEqual(['First'])
      expect(changes).toEqual([['First']])
      expect([...new FormData(form).entries()]).toEqual([['tags', 'First']])
    })

    it('should submit one entry per selected chip, a chip with a comma in it as one value', () => {
      fixtureEl.innerHTML = '<form><div class="chip-filter"><span class="chip" data-coreui-selected="true">Smith, John</span><span class="chip">Roe</span><span class="chip" data-coreui-selected="true">Doe</span></div></form>'
      // eslint-disable-next-line no-new
      new ChipFilter(fixtureEl.querySelector('.chip-filter'), { name: 'names' })

      expect(new FormData(fixtureEl.querySelector('form')).getAll('names')).toEqual(['Smith, John', 'Doe'])
    })

    it('should send nothing it no longer lists after a reset', async () => {
      fixtureEl.innerHTML = '<form><div class="chip-filter"><span class="chip" data-coreui-selected="true">First</span><span class="chip">Second</span></div></form>'
      const form = fixtureEl.querySelector('form')
      const el = fixtureEl.querySelector('.chip-filter')
      const chipFilter = new ChipFilter(el, { name: 'tags' })

      chipFilter.remove('First')
      form.reset()
      await tick()

      expect(chipFilter.getSelectedValues()).toEqual([])
      expect([...new FormData(form).entries()]).toEqual([])
    })

    it('should stay silent on a reset to the selection it holds', async () => {
      fixtureEl.innerHTML = '<form><div class="chip-filter"><span class="chip">First</span></div></form>'
      const form = fixtureEl.querySelector('form')
      const el = fixtureEl.querySelector('.chip-filter')
      // eslint-disable-next-line no-new
      new ChipFilter(el, { name: 'tags' })
      const changes = trackChanges(el)

      form.reset()
      await tick()

      expect(changes).toEqual([])
    })
  })

  describe('labels and state', () => {
    it('should do nothing on a click on the label of a disabled filter', () => {
      fixtureEl.innerHTML = '<label for="topics">Topics</label><div id="topics" class="chip-filter"><span class="chip">First</span></div>'
      const el = fixtureEl.querySelector('.chip-filter')
      // eslint-disable-next-line no-new
      new ChipFilter(el, { disabled: true })

      fixtureEl.querySelector('label').click()

      expect(document.activeElement).not.toEqual(el)
      expect(el.getAttribute('aria-disabled')).toEqual('true')
    })
  })

  describe('fieldset', () => {
    const create = (fieldsetAttributes = '', attrs = '') => {
      fixtureEl.innerHTML = `<form><fieldset ${fieldsetAttributes}><div class="chip-set chip-filter" data-coreui-name="dept"${attrs}><span class="chip">Design</span><span class="chip" data-coreui-selected="true">Development</span><span class="chip">Sales</span></div></fieldset></form>`

      const element = fixtureEl.querySelector('.chip-filter')

      return {
        element,
        fieldset: fixtureEl.querySelector('fieldset'),
        form: fixtureEl.querySelector('form'),
        chipFilter: new ChipFilter(element)
      }
    }

    const chips = element => [...element.querySelectorAll('.chip')]
    const submitted = form => new FormData(form).getAll('dept')

    it('should give up the focus of a chip focused before it starts inside a disabled fieldset', async () => {
      fixtureEl.innerHTML = '<fieldset disabled><div class="chip-set chip-filter"><span class="chip" tabindex="0">Design</span></div></fieldset>'

      const element = fixtureEl.querySelector('.chip-filter')
      const [chip] = chips(element)
      chip.focus()
      const chipFilter = new ChipFilter(element)

      expect(document.activeElement).toBe(chip)
      await Promise.resolve()

      expect(document.activeElement).not.toBe(chip)
      expect(chip.hasAttribute('tabindex')).toBeFalse()
      chipFilter.dispose()
    })

    it('should start disabled inside a disabled fieldset without disabling its value field', () => {
      const { element, chipFilter } = create('disabled')

      expect(element.getAttribute('aria-disabled')).toEqual('true')
      expect(chips(element).every(chip => chip.getAttribute('aria-disabled') === 'true' && !chip.hasAttribute('tabindex'))).toBeTrue()
      expect(chipFilter._valueField.hasAttribute('disabled')).toBeFalse()
      expect(chipFilter._valueField.nextElementSibling.localName).toEqual('coreui-fieldset-watch')
    })

    it('should disable a chip that turns its own disabled off while the fieldset is disabled', () => {
      fixtureEl.innerHTML = '<fieldset disabled><div class="chip-filter"><span class="chip" data-coreui-disabled="false">Design</span></div></fieldset>'

      const element = fixtureEl.querySelector('.chip-filter')
      const chipFilter = new ChipFilter(element)
      const chip = element.querySelector('.chip')

      chip.click()

      expect(chipFilter.getSelectedValues()).toEqual([])
      expect(chip.hasAttribute('tabindex')).toBeFalse()
    })

    it('should refuse a click and Space on a chip once the fieldset is disabled', () => {
      const { element, fieldset, chipFilter } = create()
      const [design] = chips(element)

      fieldset.disabled = true
      design.click()
      keydown(design, ' ')

      expect(chipFilter.getSelectedValues()).toEqual(['Development'])
    })

    it('should keep the selection through a toggle of the fieldset', () => {
      const { element, fieldset, form, chipFilter } = create()

      fieldset.disabled = true
      expect(submitted(form)).toEqual([])

      fieldset.disabled = false

      expect(element.hasAttribute('aria-disabled')).toBeFalse()
      expect(chipFilter.getSelectedValues()).toEqual(['Development'])
      expect(submitted(form)).toEqual(['Development'])
      expect(chips(element).map(chip => chip.tabIndex)).toEqual([-1, 0, -1])
      chips(element)[0].click()
      expect(chipFilter.getSelectedValues()).toEqual(['Design', 'Development'])
    })

    it('should blur a focused chip after the task that disables the fieldset', async () => {
      const { element, fieldset } = create()
      const development = chips(element)[1]

      development.focus()
      fieldset.disabled = true

      expect(development.getAttribute('tabindex')).toEqual('-1')

      await Promise.resolve()

      expect(document.activeElement).not.toEqual(development)
      expect(development.hasAttribute('tabindex')).toBeFalse()
    })

    it('should keep the focus and the tab stop on a chip when the fieldset is disabled and enabled in one task', async () => {
      const { element, fieldset } = create()
      const [design, development] = chips(element)

      design.focus()
      fieldset.disabled = true
      fieldset.disabled = false
      await Promise.resolve()

      expect(document.activeElement).toEqual(design)
      expect([design.tabIndex, development.tabIndex]).toEqual([0, -1])
    })

    it('should leave no tab stop on a chip the focus left in the task that disabled the fieldset', async () => {
      const { element, fieldset } = create()
      const development = chips(element)[1]
      const other = document.createElement('input')

      fixtureEl.append(other)
      development.focus()
      fieldset.disabled = true
      other.focus()
      await Promise.resolve()

      expect(development.hasAttribute('tabindex')).toBeFalse()
    })

    it('should disable and enable on a call and keep the selection', () => {
      const { element, form, chipFilter } = create()

      chipFilter.disable()

      expect(chipFilter._valueField.disabled).toBeTrue()
      expect(submitted(form)).toEqual([])
      expect(element.getAttribute('aria-disabled')).toEqual('true')

      chipFilter.enable()

      expect(chipFilter._valueField.disabled).toBeFalse()
      expect(submitted(form)).toEqual(['Development'])
      expect(chips(element)[1].tabIndex).toEqual(0)
    })

    it('should stay disabled after enable() while the fieldset is disabled', () => {
      const { element, fieldset, chipFilter } = create('disabled', ' data-coreui-disabled="true"')

      chipFilter.enable()
      expect(element.getAttribute('aria-disabled')).toEqual('true')

      fieldset.disabled = false
      expect(element.hasAttribute('aria-disabled')).toBeFalse()
    })

    it('should not take the focus from its label inside a disabled fieldset', () => {
      fixtureEl.innerHTML = '<fieldset disabled><label for="dept">Department</label><div id="dept" class="chip-set chip-filter"><span class="chip">Design</span></div></fieldset>'

      const element = fixtureEl.querySelector('.chip-filter')

      new ChipFilter(element) // eslint-disable-line no-new
      fixtureEl.querySelector('label').click()

      expect(document.activeElement).not.toEqual(element)
      expect(element.hasAttribute('tabindex')).toBeFalse()
    })

    it('should update its validation when the fieldset changes', () => {
      const { fieldset, chipFilter } = create()
      const spy = spyOn(chipFilter._validation, 'update')

      fieldset.disabled = true

      expect(spy).toHaveBeenCalled()
    })

    it('should stay enabled inside the first legend of a disabled fieldset', () => {
      fixtureEl.innerHTML = '<fieldset disabled><legend><div class="chip-filter"><span class="chip">Design</span></div></legend></fieldset>'

      const element = fixtureEl.querySelector('.chip-filter')

      new ChipFilter(element) // eslint-disable-line no-new

      expect(element.hasAttribute('aria-disabled')).toBeFalse()
      expect(element.querySelector('.chip').tabIndex).toEqual(0)
    })

    it('should list its watcher in form.elements and leave it out of the submitted data', () => {
      const { form, fieldset } = create()

      expect([...form.elements].filter(element => element.localName === 'coreui-fieldset-watch')).toHaveSize(1)
      expect([...fieldset.elements].some(element => element.localName === 'coreui-fieldset-watch')).toBeTrue()
      expect([...new FormData(form).keys()]).toEqual(['dept'])
    })

    it('should follow a move out of a disabled fieldset', () => {
      const { element, form, chipFilter } = create('disabled')

      form.append(element)

      expect(element.hasAttribute('aria-disabled')).toBeFalse()
      expect(chipFilter.getSelectedValues()).toEqual(['Development'])
      expect(chips(element)[1].tabIndex).toEqual(0)
    })

    it('should remove its watcher on dispose', () => {
      const { element, chipFilter } = create('disabled')

      chipFilter.dispose()

      expect(fixtureEl.querySelector('coreui-fieldset-watch')).toBeNull()
      expect(element.querySelector('coreui-fieldset-watch')).toBeNull()
    })
  })

  describe('lifecycle', () => {
    it('should initialize through the data api', () => {
      const el = setMarkup(['First'], ' data-coreui-chip-filter')

      document.dispatchEvent(new Event('DOMContentLoaded'))

      expect(ChipFilter.getInstance(el)).not.toBeNull()
    })

    it('should call a method through jQueryInterface', () => {
      const el = setMarkup(['First'])
      const chipFilter = new ChipFilter(el)
      const spy = spyOn(chipFilter, 'deselectAll')

      jQueryMock.fn.chipFilter = ChipFilter.jQueryInterface
      jQueryMock.elements = [el]
      jQueryMock.fn.chipFilter.call(jQueryMock, 'deselectAll')

      expect(spy).toHaveBeenCalled()
    })

    it('should remove its value field and stop listening to the label on dispose', () => {
      fixtureEl.innerHTML = '<label for="sizes">Size</label><div id="sizes" class="chip-filter"><span class="chip">S</span></div>'
      const el = fixtureEl.querySelector('.chip-filter')
      const chipFilter = new ChipFilter(el, { name: 'size' })
      const chip = el.querySelector('.chip')

      chipFilter.dispose()
      fixtureEl.querySelector('label').click()

      expect(el.querySelector('select')).toBeNull()
      expect(document.activeElement).not.toEqual(chip)
    })

    it('should set a validation state from the option', () => {
      const el = setMarkup(['First'])
      // eslint-disable-next-line no-new
      new ChipFilter(el, { validationState: 'valid' })

      expect(el.classList.contains('is-valid')).toBeTrue()
    })
  })

  describe('validation of a disabled field', () => {
    const mount = () => {
      fixtureEl.innerHTML = '<form data-coreui-validate novalidate><fieldset><div class="chip-set chip-filter"><span class="chip">A</span></div></fieldset></form>'
      const fieldset = fixtureEl.querySelector('fieldset')
      const instance = new ChipFilter(fieldset.firstElementChild, { name: 'tags', required: true })

      fixtureEl.querySelector('form').checkValidity()

      return { fieldset, instance }
    }

    const drawing = element => ({
      ariaInvalid: Boolean(element.querySelector('[aria-invalid="true"]')),
      isInvalid: Boolean(element.querySelector('.is-invalid'))
    })

    it('should hide the reported error while a disabled fieldset leaves the field out of validation, and show it again once enabled', () => {
      const { fieldset, instance } = mount()

      expect(drawing(fieldset)).toEqual({ ariaInvalid: true, isInvalid: true })

      fieldset.disabled = true

      expect(drawing(fieldset)).toEqual({ ariaInvalid: false, isInvalid: false })

      fieldset.disabled = false

      expect(drawing(fieldset)).toEqual({ ariaInvalid: true, isInvalid: true })
      instance.dispose()
    })

    it('should hide the reported error on disable() and show it again on enable()', () => {
      const { fieldset, instance } = mount()

      instance.disable()

      expect(drawing(fieldset)).toEqual({ ariaInvalid: false, isInvalid: false })

      instance.enable()

      expect(drawing(fieldset)).toEqual({ ariaInvalid: true, isInvalid: true })
      instance.dispose()
    })
  })
})

import { vi } from 'vitest'
import ChipInput from '../../src/chip-input.js'
import Chip from '../../src/chip.js'
import ChipSet from '../../src/chip-set.js'
import { updateValidationState } from '../../src/util/form-validation.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

describe('ChipInput', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('form payload', () => {
    it('should not submit a field the page did not name', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="chip-input"></div></form>'
      const chipInputEl = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(chipInputEl)

      chipInput.add('one')

      expect(chipInput._valueField.hasAttribute('name')).toBeFalse()
      expect([...new FormData(fixtureEl.querySelector('#form')).keys()]).toEqual([])
    })

    it('should take back the field it built when disposed', () => {
      fixtureEl.innerHTML = '<div class="chip-input"><label class="chip-input-label">Skills</label></div>'
      const chipInputEl = fixtureEl.querySelector('.chip-input')
      const label = chipInputEl.querySelector('.chip-input-label')

      new ChipInput(chipInputEl, { name: 'tags' }).dispose()

      expect(chipInputEl.querySelector('.chip-input-field')).toBeNull()
      expect(label.hasAttribute('for')).toBeFalse()
    })

    it('should keep a field the page wrote', () => {
      fixtureEl.innerHTML = '<div class="chip-input"><input type="text" class="chip-input-field"></div>'
      const chipInputEl = fixtureEl.querySelector('.chip-input')

      new ChipInput(chipInputEl).dispose()

      expect(chipInputEl.querySelector('.chip-input-field')).not.toBeNull()
    })

    it('should leave no value field behind when disposed', () => {
      fixtureEl.innerHTML = '<div class="chip-input"></div>'
      const chipInputEl = fixtureEl.querySelector('.chip-input')

      new ChipInput(chipInputEl, { id: 'tags-field' }).dispose()
      // eslint-disable-next-line no-new
      new ChipInput(chipInputEl, { id: 'tags-field' })

      expect(chipInputEl.querySelectorAll('#tags-field').length).toEqual(1)
    })

    it('should submit the values under the configured name', () => {
      fixtureEl.innerHTML = '<form id="form"><div class="chip-input"></div></form>'
      const chipInputEl = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(chipInputEl, { name: 'tags' })

      chipInput.add('one')
      chipInput.add('two')

      expect([...new FormData(fixtureEl.querySelector('#form')).entries()]).toEqual([['tags', 'one,two']])
    })
  })

  describe('the frame', () => {
    it('should take the frame class itself', () => {
      fixtureEl.innerHTML = '<div class="chip-input"></div>'
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element) // eslint-disable-line no-unused-vars

      expect(element.classList.contains('form-control-group')).toBe(true)
    })

    it('should give the class back on dispose', () => {
      fixtureEl.innerHTML = '<div class="chip-input"></div>'
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element)

      chipInput.dispose()

      expect(element.classList.contains('form-control-group')).toBe(false)
    })

    it('should leave a class the author wrote', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element)

      chipInput.dispose()

      expect(element.classList.contains('form-control-group')).toBe(true)
    })
  })

  describe('validation', () => {
    const tick = () => new Promise(resolve => {
      setTimeout(resolve)
    })

    it('should block the submit while it is required and holds no chip, and tell the text field it is required', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"></div></form>'
      const form = fixtureEl.querySelector('form')
      const chipInput = new ChipInput(fixtureEl.querySelector('.chip-input'), { required: true })

      expect(form.checkValidity()).toBeFalse()
      expect(chipInput._valueField.validity.valueMissing).toBeTrue()
      expect(chipInput._input.getAttribute('aria-required')).toBe('true')

      chipInput.add('one')

      expect(form.checkValidity()).toBeTrue()
    })

    it('should show a given state on the frame and the text field, block the submit with its message, and give the class back on dispose', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input is-invalid"><input type="text" class="chip-input-field" aria-describedby="hint"></div><div id="hint">Up to five.</div><div class="invalid-feedback">Pick a tag.</div></form>'
      const form = fixtureEl.querySelector('form')
      const element = fixtureEl.querySelector('.chip-input')
      const feedback = fixtureEl.querySelector('.invalid-feedback')
      const chipInput = new ChipInput(element)
      const input = chipInput._input

      expect(element.classList.contains('is-invalid')).toBeTrue()
      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(input.getAttribute('aria-describedby')).toBe(`hint ${feedback.id}`)
      expect(chipInput._valueField.validationMessage).toBe('Pick a tag.')
      expect(form.checkValidity()).toBeFalse()

      chipInput.dispose()

      expect(element.classList.contains('is-invalid')).toBeTrue()
      expect(input.hasAttribute('aria-invalid')).toBeFalse()
      expect(input.getAttribute('aria-describedby')).toBe('hint')
      expect(form.checkValidity()).toBeTrue()
    })

    it('should take no state from an undefined option, and none from invalid or valid', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"></div></form>'
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element, { validationState: undefined, invalid: true })

      expect(element.classList.contains('is-invalid')).toBeFalse()

      chipInput.setConfig({ validationState: 'valid' })

      expect(element.classList.contains('is-valid')).toBeTrue()

      chipInput.setConfig({ validationState: undefined, valid: true })

      expect(element.classList.contains('is-valid')).toBeFalse()
      expect(element.classList.contains('is-invalid')).toBeFalse()
    })

    it('should let the option win over a class from the markup', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input is-valid"></div></form>'
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element, { validationState: 'invalid' }) // eslint-disable-line no-unused-vars

      expect(element.classList.contains('is-invalid')).toBeTrue()
      expect(element.classList.contains('is-valid')).toBeFalse()
    })

    it('should change only the state with setConfig, and withdraw a class from the markup with null', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input is-invalid"></div></form>'
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element, { placeholder: 'Tags' })
      const input = chipInput._input

      chipInput.setConfig({ validationState: 'valid', placeholder: 'Other' })

      expect(element.classList.contains('is-valid')).toBeTrue()
      expect(element.classList.contains('is-invalid')).toBeFalse()
      expect(input.hasAttribute('aria-invalid')).toBeFalse()
      expect(chipInput._input).toBe(input)
      expect(input.placeholder).toBe('Tags')

      chipInput.setConfig({ validationState: null })
      chipInput.dispose()

      expect(element.classList.contains('is-valid')).toBeFalse()
      expect(element.classList.contains('is-invalid')).toBeFalse()
    })

    it.each([
      ['Enter in the text field', chipInput => {
        chipInput._input.value = 'two'
        chipInput._input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
      }],
      ['a typed separator', chipInput => {
        chipInput._input.value = 'two,'
        chipInput._input.dispatchEvent(new Event('input', { bubbles: true }))
      }],
      ['a paste with separators', chipInput => {
        const clipboardData = new DataTransfer()
        clipboardData.setData('text', 'two,three')
        chipInput._input.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }))
      }],
      ['the remove button of a chip', chipInput => chipInput._element.querySelector('.chip-remove').click()],
      ['Backspace on a chip', chipInput => chipInput._element.querySelector('.chip').dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))]
    ])('should drop a given state through %s', (_, act) => {
      fixtureEl.innerHTML = '<form><div class="chip-input"><span class="chip">one</span></div></form>'
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element, { validationState: 'invalid' })

      act(chipInput)

      expect(chipInput.getValues()).not.toEqual(['one'])
      expect(element.classList.contains('is-invalid')).toBeFalse()
      expect(chipInput._input.hasAttribute('aria-invalid')).toBeFalse()
      expect(fixtureEl.querySelector('form').checkValidity()).toBeTrue()
    })

    it('should keep a given state through changes made from code and through user actions that change nothing', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"><span class="chip">one</span></div></form>'
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element, { validationState: 'invalid' })
      const enter = value => {
        chipInput._input.value = value
        chipInput._input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
      }

      chipInput.add('two')
      chipInput.remove('one')
      enter('two')
      element.addEventListener('add.coreui.chip-input', event => event.preventDefault(), { once: true })
      enter('three')
      chipInput.clear()

      expect(chipInput.getValues()).toEqual([])
      expect(element.classList.contains('is-invalid')).toBeTrue()
      expect(fixtureEl.querySelector('form').checkValidity()).toBeFalse()
    })

    it('should lift the block before change.coreui.chip-input and treat what the page does there as code', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"></div></form>'
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element, { validationState: 'invalid' })
      const seen = []

      element.addEventListener('change.coreui.chip-input', () => {
        seen.push([chipInput._valueField.value, chipInput._valueField.validity.valid, element.classList.contains('is-invalid')])

        if (seen.length === 1) {
          chipInput.setConfig({ validationState: 'invalid' })
        }
      })
      chipInput._input.value = 'one,two,'
      chipInput._input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(seen[0]).toEqual(['one', true, false])
      expect(chipInput.getValues()).toEqual(['one', 'two'])
      expect(element.classList.contains('is-invalid')).toBeTrue()
      expect(fixtureEl.querySelector('form').checkValidity()).toBeFalse()
    })

    it('should send input and change from the value field when the chips change', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"></div></form>'
      const form = fixtureEl.querySelector('form')
      const chipInput = new ChipInput(fixtureEl.querySelector('.chip-input'))
      const events = []

      form.addEventListener('input', event => events.push(['input', event.target.value]))
      form.addEventListener('change', event => events.push(['change', event.target.value]))
      chipInput.add('one')
      chipInput.add('one')

      expect(events).toEqual([['input', 'one'], ['change', 'one']])
    })

    it('should show what a validation reports until the value is valid', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"></div><div class="invalid-feedback">Add a tag.</div></form>'
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element, { required: true })

      fixtureEl.querySelector('form').checkValidity()

      expect(element.classList.contains('is-invalid')).toBeTrue()
      expect(chipInput._input.getAttribute('aria-invalid')).toBe('true')
      expect(chipInput._input.getAttribute('aria-describedby')).toBe(fixtureEl.querySelector('.invalid-feedback').id)

      chipInput.add('one')

      expect(element.classList.contains('is-invalid')).toBeFalse()
      expect(chipInput._input.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should leave its fields to itself when the form marks the controls', () => {
      fixtureEl.innerHTML = '<form data-coreui-validate="valid"><div class="chip-input"></div></form>'
      const chipInput = new ChipInput(fixtureEl.querySelector('.chip-input'), { required: true })

      chipInput.add('one')
      updateValidationState(fixtureEl.querySelector('form'), new WeakMap())

      expect(chipInput._input.classList.contains('is-valid')).toBeFalse()
      expect(chipInput._valueField.classList.contains('is-valid')).toBeFalse()
    })

    it.each([
      ['after the frame', '<form><div class="form-field"><div class="chip-input"></div><div class="form-text">Up to five.</div><div class="invalid-feedback">Add a tag.</div></div></form>'],
      ['before the frame in the field', '<form><div class="form-field"><div class="invalid-feedback">Add a tag.</div><div class="chip-input"></div></div></form>'],
      ['named on the chip input', '<form><div class="chip-input" data-coreui-invalid-feedback="named"></div><p><span id="named" class="invalid-feedback">Add a tag.</span></p></form>']
    ])('should link the message %s', (_, html) => {
      fixtureEl.innerHTML = html
      const chipInput = new ChipInput(fixtureEl.querySelector('.chip-input'), { validationState: 'invalid' })
      const feedback = fixtureEl.querySelector('.invalid-feedback')

      expect(chipInput._input.getAttribute('aria-describedby')).toBe(feedback.id)
      expect(chipInput._valueField.validationMessage).toBe('Add a tag.')
    })

    it('should hand the focus the value field gets to the text field', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"></div></form>'
      const chipInput = new ChipInput(fixtureEl.querySelector('.chip-input'), { required: true })

      chipInput._valueField.focus()

      expect(document.activeElement).toBe(chipInput._input)
    })

    it('should put back the chips it started with on a native reset, the same elements', async () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"><span class="chip">one</span><span class="chip">two</span></div></form>'
      const form = fixtureEl.querySelector('form')
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element, { name: 'tags' })
      const [one, two] = element.querySelectorAll('.chip')

      chipInput.remove('one')
      chipInput.add('three')
      form.reset()
      await tick()

      expect(chipInput.getValues()).toEqual(['one', 'two'])
      expect([...element.querySelectorAll('.chip')]).toEqual([one, two])
      expect(one.querySelector('.chip-remove')).not.toBeNull()
      expect([...new FormData(form).entries()]).toEqual([['tags', 'one,two']])

      one.querySelector('.chip-remove').click()

      expect(chipInput.getValues()).toEqual(['two'])
    })

    it.each([['before the reset', 'before', false], ['in a reset listener', 'listener', true], ['right after form.reset()', 'after', true]])('should treat a state given %s as the reset says', async (_, when, kept) => {
      fixtureEl.innerHTML = '<form><div class="chip-input"></div></form>'
      const form = fixtureEl.querySelector('form')
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element)
      const giveState = () => chipInput.setConfig({ validationState: 'invalid' })

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

      expect(element.classList.contains('is-invalid')).toBe(kept)
      expect(form.checkValidity()).toBe(!kept)
    })

    it('should write the chips it restores into the value field and report the change, also after a change from code in the same task', async () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"><span class="chip">one</span><span class="chip">two</span></div></form>'
      const form = fixtureEl.querySelector('form')
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element, { name: 'tags' })
      const changes = []

      chipInput.add('three')
      element.addEventListener('change.coreui.chip-input', event => changes.push(event.value))
      form.reset()
      chipInput.clear()
      changes.length = 0
      await tick()

      expect(chipInput.getValues()).toEqual(['one', 'two'])
      expect(new FormData(form).get('tags')).toBe('one,two')
      expect(changes).toEqual([['one', 'two']])
    })

    it('should keep the focus on a chip the reset leaves, and move it to the text field from a chip it takes', async () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"><span class="chip">one</span></div></form>'
      const form = fixtureEl.querySelector('form')
      const chipInput = new ChipInput(fixtureEl.querySelector('.chip-input'))
      const one = fixtureEl.querySelector('.chip')

      one.focus()
      form.reset()
      await tick()

      expect(document.activeElement).toBe(one)

      chipInput.add('two')
      fixtureEl.querySelectorAll('.chip')[1].focus()
      form.reset()
      await tick()

      expect(document.activeElement).toBe(chipInput._input)
    })

    it('should treat a removal from code as code, also when a listener removes another chip meanwhile', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"><span class="chip">one</span><span class="chip">two</span></div></form>'
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element, { validationState: 'invalid' })

      element.addEventListener('remove.coreui.chip-input', event => {
        if (event.value === 'one') {
          chipInput.remove('two')
        }
      })
      chipInput.remove('one')

      expect(chipInput.getValues()).toEqual([])
      expect(element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should keep a given state and send nothing from the value field when a removed chip carried no value', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"><span class="chip"></span><span class="chip">one</span></div></form>'
      const form = fixtureEl.querySelector('form')
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element, { validationState: 'invalid' })
      const events = []

      form.addEventListener('change', event => events.push(event.target))
      element.querySelector('.chip-remove').click()

      expect(chipInput.getValues()).toEqual(['one'])
      expect(events).toEqual([])
      expect(element.classList.contains('is-invalid')).toBeTrue()
    })

    it('should take back on dispose the state class and an aria-required it added, and leave the chips to a later reset', async () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"><span class="chip">one</span><input type="text" class="chip-input-field"></div></form>'
      const form = fixtureEl.querySelector('form')
      const element = fixtureEl.querySelector('.chip-input')
      const input = element.querySelector('.chip-input-field')
      const chipInput = new ChipInput(element, { required: true, validationState: 'invalid' })

      chipInput.remove('one')
      chipInput.dispose()

      expect(element.classList.contains('is-invalid')).toBeFalse()
      expect(input.hasAttribute('aria-required')).toBeFalse()

      form.reset()
      await tick()

      expect(element.querySelectorAll('.chip').length).toBe(0)
    })

    it.each([['disabled', 'disabled'], ['read-only', 'readonly']])('should not block the submit while %s', (_, option) => {
      fixtureEl.innerHTML = '<form><div class="chip-input"></div></form>'
      const chipInput = new ChipInput(fixtureEl.querySelector('.chip-input'), { [option]: true, required: true, validationState: 'invalid' })

      expect(chipInput._valueField.willValidate).toBeFalse()
      expect(fixtureEl.querySelector('form').checkValidity()).toBeTrue()
    })

    it('should draw a given state without a value field in the controlled mode', () => {
      fixtureEl.innerHTML = '<form><div class="chip-input"></div></form>'
      const element = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(element, { create: false, required: true, validationState: 'invalid' })

      expect(element.querySelector('textarea')).toBeNull()
      expect(element.classList.contains('is-invalid')).toBeTrue()
      expect(chipInput._input.getAttribute('aria-invalid')).toBe('true')
      expect(chipInput._input.hasAttribute('aria-required')).toBeFalse()
    })
  })

  it('should take care of element either passed as a CSS selector or DOM element', () => {
    fixtureEl.innerHTML = '<div class="form-control-group chip-input" data-coreui-chip-input="true"></div>'

    const el = fixtureEl.querySelector('.chip-input')
    const bySelector = new ChipInput('.chip-input')
    expect(bySelector._element).toEqual(el)

    const byElement = new ChipInput(el)
    expect(byElement._element).toEqual(el)
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(ChipInput.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(ChipInput.DATA_KEY).toEqual('coreui.chip-input')
    })
  })

  describe('Default', () => {
    it('should return default configuration', () => {
      expect(ChipInput.Default).toEqual(jasmine.objectContaining({
        createOnBlur: true,
        disabled: false,
        readonly: false,
        removable: true,
        selectable: false,
        separator: ','
      }))
    })
  })

  describe('DefaultType', () => {
    it('should return default type configuration', () => {
      expect(ChipInput.DefaultType).toEqual(jasmine.objectContaining({
        disabled: 'boolean',
        readonly: 'boolean',
        removable: 'boolean',
        selectable: 'boolean'
      }))
    })
  })

  describe('constructor', () => {
    it('should create an input element when none exists', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      // eslint-disable-next-line no-new
      new ChipInput(el)

      expect(el.querySelector('input[type="text"]')).not.toBeNull()
    })

    it('should use existing input element', () => {
      fixtureEl.innerHTML = [
        '<div class="form-control-group chip-input">',
        '  <input type="text" class="chip-input-field" id="my-input">',
        '</div>'
      ].join('')

      const el = fixtureEl.querySelector('.chip-input')
      const existingInput = el.querySelector('input')
      const chipInput = new ChipInput(el)

      expect(chipInput._input).toEqual(existingInput)
    })

    it('should create a value field for form submission that the browser validates', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      // eslint-disable-next-line no-new
      new ChipInput(el)

      const field = el.querySelector('textarea')

      expect(field).not.toBeNull()
      expect(field.willValidate).toBeTrue()
      expect(field.getAttribute('aria-hidden')).toBe('true')
      expect(field.tabIndex).toBe(-1)
      expect(el.querySelector('input[type="hidden"]')).toBeNull()
    })

    it('should use custom name on the value field', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      // eslint-disable-next-line no-new
      new ChipInput(el, { name: 'my-tags' })

      expect(el.querySelector('textarea').name).toEqual('my-tags')
    })

    it('should use custom id on the value field', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      // eslint-disable-next-line no-new
      new ChipInput(el, { id: 'my-id' })

      expect(el.querySelector('textarea').id).toEqual('my-id')
    })

    it('should initialize as disabled via config', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { disabled: true })

      expect(chipInput._disabled).toBeTrue()
      expect(el).toHaveClass('disabled')
      expect(el.querySelector('input[type="text"]').disabled).toBeTrue()
    })

    it('should initialize as disabled via class', () => {
      fixtureEl.innerHTML = '<div class="chip-input disabled"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      expect(chipInput._disabled).toBeTrue()
    })

    it('should initialize as readonly via config', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      // eslint-disable-next-line no-new
      new ChipInput(el, { readonly: true })

      expect(el.querySelector('input[type="text"]').readOnly).toBeTrue()
    })

    it('should set placeholder on text input', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      // eslint-disable-next-line no-new
      new ChipInput(el, { placeholder: 'Add tag...' })

      expect(el.querySelector('input[type="text"]').placeholder).toEqual('Add tag...')
    })

    it('should initialize existing chips', () => {
      fixtureEl.innerHTML = [
        '<div class="form-control-group chip-input">',
        '  <span class="chip">First</span>',
        '  <span class="chip">Second</span>',
        '</div>'
      ].join('')

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      expect(chipInput.getValues()).toEqual(['First', 'Second'])
    })

    it('should not set aria attributes on the container element', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      // eslint-disable-next-line no-new
      new ChipInput(el)

      expect(el.getAttribute('aria-disabled')).toBeNull()
      expect(el.getAttribute('aria-readonly')).toBeNull()
    })

    it('should not stamp a role on the container and announce added chips', async () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })

      for (const announcer of document.querySelectorAll('[data-coreui-live-announcer]')) {
        announcer.remove()
      }

      try {
        await Promise.resolve()
        chipInput.add('News')
        await Promise.resolve()
        vi.advanceTimersByTime(100)
        chipInput.remove('News')
        await Promise.resolve()
        vi.advanceTimersByTime(100)

        expect(el.hasAttribute('role')).toBe(false)
        expect([...document.querySelectorAll('[data-coreui-live-announcer] [aria-live="polite"] > *')].map(message => message.textContent)).toEqual(['News added', 'News removed'])
      } finally {
        vi.useRealTimers()
      }
    })

    it('should set label for attribute when label has no for', () => {
      fixtureEl.innerHTML = [
        '<div class="form-control-group chip-input">',
        '  <label class="chip-input-label">Tags</label>',
        '</div>'
      ].join('')

      const el = fixtureEl.querySelector('.chip-input')
      // eslint-disable-next-line no-new
      new ChipInput(el)

      const label = el.querySelector('.chip-input-label')
      const input = el.querySelector('input[type="text"]')
      expect(label.getAttribute('for')).toEqual(input.id)
    })
  })

  describe('add', () => {
    it('should add a chip with the given value', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')

      expect(chipInput.getValues()).toEqual(['JavaScript'])
      expect(el.querySelector('.chip')).not.toBeNull()
    })

    it('should return the created chip element', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      const chip = chipInput.add('JavaScript')

      expect(chip).not.toBeNull()
      expect(chip.classList.contains('chip')).toBeTrue()
    })

    it('should trim whitespace from value', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('  JavaScript  ')

      expect(chipInput.getValues()).toEqual(['JavaScript'])
    })

    it('should not add empty value', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      const result = chipInput.add('   ')

      expect(result).toBeNull()
      expect(chipInput.getValues()).toEqual([])
    })

    it('should not add duplicate values', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')
      const result = chipInput.add('JavaScript')

      expect(result).toBeNull()
      expect(chipInput.getValues()).toEqual(['JavaScript'])
    })

    it('should not add when disabled', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { disabled: true })

      const result = chipInput.add('JavaScript')

      expect(result).toBeNull()
      expect(chipInput.getValues()).toEqual([])
    })

    it('should not add when readonly', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { readonly: true })

      const result = chipInput.add('JavaScript')

      expect(result).toBeNull()
      expect(chipInput.getValues()).toEqual([])
    })

    it('should not add more chips than maxChips allows', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { maxChips: 2 })

      chipInput.add('First')
      chipInput.add('Second')
      const result = chipInput.add('Third')

      expect(result).toBeNull()
      expect(chipInput.getValues()).toEqual(['First', 'Second'])
    })

    it('should trigger add event', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

        const el = fixtureEl.querySelector('.chip-input')
        const chipInput = new ChipInput(el)

        el.addEventListener('add.coreui.chip-input', event => {
          expect(event.value).toEqual('JavaScript')
          resolve()
        })

        chipInput.add('JavaScript')
      })
    })

    it('should trigger change event after adding', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

        const el = fixtureEl.querySelector('.chip-input')
        const chipInput = new ChipInput(el)

        el.addEventListener('change.coreui.chip-input', event => {
          expect(event.value).toEqual(['JavaScript'])
          resolve()
        })

        chipInput.add('JavaScript')
      })
    })

    it('should trigger change event after removing', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

        const el = fixtureEl.querySelector('.chip-input')
        const chipInput = new ChipInput(el)

        chipInput.add('JavaScript')
        chipInput.add('TypeScript')

        el.addEventListener('change.coreui.chip-input', event => {
          expect(event.value).toEqual(['JavaScript'])
          resolve()
        })

        chipInput.remove('TypeScript')
      })
    })

    it('should not add chip if add event is prevented', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      el.addEventListener('add.coreui.chip-input', event => {
        event.preventDefault()
      })

      const result = chipInput.add('JavaScript')

      expect(result).toBeNull()
      expect(chipInput.getValues()).toEqual([])
    })

    it('should update the value field after adding', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('First')
      chipInput.add('Second')

      expect(chipInput._valueField.value).toEqual('First,Second')
    })

    it('should apply chipClassName string to added chip', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { chipClassName: 'chip-primary' })

      chipInput.add('JavaScript')

      expect(el.querySelector('.chip')).toHaveClass('chip-primary')
    })

    it('should apply chipClassName function to added chip', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { chipClassName: value => `chip-${value.toLowerCase()}` })

      chipInput.add('JS')

      expect(el.querySelector('.chip')).toHaveClass('chip-js')
    })
  })

  describe('remove', () => {
    it('should remove a chip by value string', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')
      chipInput.remove('JavaScript')

      expect(chipInput.getValues()).toEqual([])
    })

    it('should remove a chip by element reference', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')
      const chipEl = el.querySelector('.chip')
      chipInput.remove(chipEl)

      expect(chipInput.getValues()).toEqual([])
    })

    it('should move focus to the text input after removing a focused chip', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')
      chipInput.add('TypeScript')
      const chip = el.querySelector('.chip')
      chip.focus()
      chip.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))

      expect(document.activeElement).toEqual(chipInput._input)
    })

    it('should move focus to the text input after removing its only chip', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')
      const chip = el.querySelector('.chip')
      chip.focus()
      chip.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))

      expect(document.activeElement).toEqual(chipInput._input)
    })

    it('should leave focus alone when nothing had it', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')
      document.activeElement.blur()
      chipInput.remove('JavaScript')

      expect(document.activeElement).toEqual(document.body)
    })

    it('should leave focus where it is when a chip is removed from elsewhere', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div><button type="button">Clear</button>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)
      const button = fixtureEl.querySelector('button')

      chipInput.add('JavaScript')
      button.focus()
      chipInput.remove('JavaScript')

      expect(document.activeElement).toEqual(button)
    })

    it('should return false for non-existent value', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      expect(chipInput.remove('nonexistent')).toBeFalse()
    })

    it('should return false when disabled', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { disabled: true })

      expect(chipInput.remove('JavaScript')).toBeFalse()
    })

    it('should return false when readonly', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { readonly: true })

      expect(chipInput.remove('JavaScript')).toBeFalse()
    })

    it('should trigger remove event', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

        const el = fixtureEl.querySelector('.chip-input')
        const chipInput = new ChipInput(el)

        chipInput.add('JavaScript')

        el.addEventListener('remove.coreui.chip-input', event => {
          expect(event.value).toEqual('JavaScript')
          resolve()
        })

        chipInput.remove('JavaScript')
      })
    })

    it('should not remove if remove event is prevented', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')

      el.addEventListener('remove.coreui.chip-input', event => {
        event.preventDefault()
      })

      chipInput.remove('JavaScript')

      expect(chipInput.getValues()).toEqual(['JavaScript'])
    })

    it('should update the value field after removing', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('First')
      chipInput.add('Second')
      chipInput.remove('First')

      expect(chipInput._valueField.value).toEqual('Second')
    })
  })

  describe('getValues', () => {
    it('should return empty array when no chips', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      expect(chipInput.getValues()).toEqual([])
    })

    it('should return array of chip values', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('First')
      chipInput.add('Second')
      chipInput.add('Third')

      expect(chipInput.getValues()).toEqual(['First', 'Second', 'Third'])
    })

    it('should return a copy of the chips array', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')
      const values = chipInput.getValues()
      values.push('mutated')

      expect(chipInput.getValues()).toEqual(['JavaScript'])
    })
  })

  describe('clear', () => {
    it('should remove all chips', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('First')
      chipInput.add('Second')
      chipInput.add('Third')
      chipInput.clear()

      expect(chipInput.getValues()).toEqual([])
      expect(el.querySelectorAll('.chip')).toHaveSize(0)
    })

    it('should clear the value field', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('First')
      chipInput.clear()

      expect(chipInput._valueField.value).toEqual('')
    })
  })

  describe('getSelectedValues', () => {
    it('should return empty array when no chips are selected', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { selectable: true })

      chipInput.add('First')
      chipInput.add('Second')

      expect(chipInput.getSelectedValues()).toEqual([])
    })

    it('should return values of selected chips', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { selectable: true })

      chipInput.add('First')
      chipInput.add('Second')

      const chips = el.querySelectorAll('.chip')
      Chip.getInstance(chips[0])?.select()

      expect(chipInput.getSelectedValues()).toEqual(['First'])
    })
  })

  describe('clearSelection', () => {
    it('should deselect all selected chips', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { selectable: true })

      chipInput.add('First')
      chipInput.add('Second')

      const chips = el.querySelectorAll('.chip')
      Chip.getInstance(chips[0])?.select()
      Chip.getInstance(chips[1])?.select()

      chipInput.clearSelection()

      expect(chipInput.getSelectedValues()).toEqual([])
    })

    it('should trigger select event with empty array', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

        const el = fixtureEl.querySelector('.chip-input')
        const chipInput = new ChipInput(el, { selectable: true })

        chipInput.add('First')
        const chips = el.querySelectorAll('.chip')
        Chip.getInstance(chips[0])?.select()

        el.addEventListener('select.coreui.chip-input', event => {
          expect(event.selected).toEqual([])
          resolve()
        })

        chipInput.clearSelection()
      })
    })
  })

  describe('selectChip', () => {
    it('should select a chip element', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { selectable: true })

      chipInput.add('JavaScript')
      const chipEl = el.querySelector('.chip')

      chipInput.selectChip(chipEl)

      expect(chipEl).toHaveClass('active')
    })

    it('should not select a chip not belonging to this input', () => {
      fixtureEl.innerHTML = [
        '<div class="form-control-group chip-input"></div>',
        '<span class="chip" tabindex="0">External</span>'
      ].join('')

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { selectable: true })
      const externalChip = fixtureEl.querySelector('span.chip')
      // eslint-disable-next-line no-new
      new Chip(externalChip, { selectable: true })

      chipInput.selectChip(externalChip)

      expect(externalChip).not.toHaveClass('active')
    })
  })

  describe('removeSelected', () => {
    it('should remove all selected chips', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { selectable: true })

      chipInput.add('First')
      chipInput.add('Second')
      chipInput.add('Third')

      const chips = el.querySelectorAll('.chip')
      Chip.getInstance(chips[0])?.select()
      Chip.getInstance(chips[2])?.select()

      chipInput.removeSelected()

      expect(chipInput.getValues()).toEqual(['Second'])
    })
  })

  describe('focus', () => {
    it('should focus the text input', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.focus()

      expect(document.activeElement).toEqual(chipInput._input)
    })

    it('should focus the input when a character key is pressed on the container', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)
      const spy = spyOn(chipInput._input, 'focus')

      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }))

      expect(spy).toHaveBeenCalled()
    })

    it('should focus the input when clicking the container background', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)
      const spy = spyOn(chipInput._input, 'focus')

      el.dispatchEvent(new MouseEvent('click', { bubbles: true }))

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('keyboard navigation - input', () => {
    it('should create chip on Enter key', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput._input.value = 'JavaScript'
      chipInput._input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

      expect(chipInput.getValues()).toEqual(['JavaScript'])
      expect(chipInput._input.value).toEqual('')
    })

    it('should focus last chip on Backspace when input is empty', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')
      chipInput._input.value = ''
      chipInput._input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))

      const lastChip = el.querySelectorAll('.chip')[0]
      expect(document.activeElement).toEqual(lastChip)
    })

    it('should not focus chip on Backspace when input has value', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')
      chipInput._input.value = 'some text'
      chipInput._input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))

      expect(document.activeElement).not.toEqual(el.querySelector('.chip'))
    })

    it('should focus last chip on ArrowLeft when cursor is at start', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')
      chipInput._input.value = ''
      chipInput._input.setSelectionRange(0, 0)
      chipInput._input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))

      expect(document.activeElement).toEqual(el.querySelector('.chip'))
    })

    it('should clear input and blur on Escape key', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput._input.value = 'some text'
      chipInput._input.focus()
      chipInput._input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

      expect(chipInput._input.value).toEqual('')
    })
  })

  describe('separator', () => {
    it('should create chip when separator character is typed', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput._input.value = 'JavaScript,'
      chipInput._input.dispatchEvent(new InputEvent('input', { bubbles: true }))

      expect(chipInput.getValues()).toEqual(['JavaScript'])
      expect(chipInput._input.value).toEqual('')
    })

    it('should split pasted text by separator', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true
      })
      pasteEvent.clipboardData.setData('text/plain', 'First,Second,Third')
      chipInput._input.dispatchEvent(pasteEvent)

      expect(chipInput.getValues()).toContain('First')
      expect(chipInput.getValues()).toContain('Second')
      expect(chipInput.getValues()).toContain('Third')
    })

    it('should not split paste when separator is null', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { separator: null })

      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true
      })
      pasteEvent.clipboardData.setData('text/plain', 'First,Second')
      chipInput._input.dispatchEvent(pasteEvent)

      expect(chipInput.getValues()).toEqual([])
    })
  })

  describe('createOnBlur', () => {
    it('should create chip on blur when createOnBlur is true', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { createOnBlur: true })

      chipInput._input.value = 'JavaScript'
      chipInput._input.dispatchEvent(new FocusEvent('blur', { bubbles: true }))

      expect(chipInput.getValues()).toEqual(['JavaScript'])
    })

    it('should not create chip on blur when createOnBlur is false', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el, { createOnBlur: false })

      chipInput._input.value = 'JavaScript'
      chipInput._input.dispatchEvent(new FocusEvent('blur', { bubbles: true }))

      expect(chipInput.getValues()).toEqual([])
    })
  })

  describe('input event', () => {
    it('should trigger input event on typing', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

        const el = fixtureEl.querySelector('.chip-input')
        const chipInput = new ChipInput(el)

        el.addEventListener('input.coreui.chip-input', event => {
          expect(event.value).toEqual('Java')
          resolve()
        })

        chipInput._input.value = 'Java'
        chipInput._input.dispatchEvent(new InputEvent('input', { bubbles: true }))
      })
    })
  })

  describe('selection events', () => {
    it('should trigger select event when chip is selected', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

        const el = fixtureEl.querySelector('.chip-input')
        const chipInput = new ChipInput(el, { selectable: true })

        chipInput.add('JavaScript')

        el.addEventListener('select.coreui.chip-input', event => {
          expect(event.selected).toContain('JavaScript')
          resolve()
        })

        Chip.getInstance(el.querySelector('.chip'))?.select()
      })
    })

    it('should trigger select event when chip is deselected', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

        const el = fixtureEl.querySelector('.chip-input')
        const chipInput = new ChipInput(el, { selectable: true })

        chipInput.add('JavaScript')
        const chipInstance = Chip.getInstance(el.querySelector('.chip'))
        chipInstance?.select()

        let callCount = 0
        el.addEventListener('select.coreui.chip-input', event => {
          callCount++
          if (callCount === 1) {
            expect(event.selected).toEqual([])
            resolve()
          }
        })

        chipInstance?.deselect()
      })
    })
  })

  describe('disabled state', () => {
    it('should prevent chip removal when disabled', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('JavaScript')
      chipInput._disabled = true

      const chipEl = el.querySelector('.chip')
      chipEl.dispatchEvent(new Event('remove.coreui.chip', { bubbles: true, cancelable: true }))

      expect(chipInput.getValues()).toEqual(['JavaScript'])
    })
  })

  describe('data-api', () => {
    it('should initialize via data attribute on DOMContentLoaded', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input" data-coreui-chip-input="true"></div>'

      const el = fixtureEl.querySelector('.chip-input')

      document.dispatchEvent(new Event('DOMContentLoaded'))

      expect(ChipInput.getInstance(el)).not.toBeNull()
    })
  })

  describe('dispose', () => {
    it('should leave no class attribute on an element that had none, and keep a disabled class the page wrote', () => {
      fixtureEl.innerHTML = '<div id="bare"></div><div id="marked" class="disabled"></div>'
      const bare = fixtureEl.querySelector('#bare')
      const marked = fixtureEl.querySelector('#marked')

      for (const element of [bare, marked]) {
        new ChipInput(element, { disabled: true, validationState: 'invalid' }).dispose()
      }

      expect(bare.hasAttribute('class')).toBeFalse()
      expect(marked.getAttribute('class')).toEqual('disabled')
    })

    it('should keep a disabled class the page writes after init', () => {
      fixtureEl.innerHTML = '<div></div>'
      const element = fixtureEl.querySelector('div')
      const chipInput = new ChipInput(element)

      element.classList.add('disabled')
      chipInput.dispose()

      expect(element.getAttribute('class')).toEqual('disabled')
    })

    it('should dispose a chip-input instance', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      expect(ChipInput.getInstance(el)).not.toBeNull()

      chipInput.dispose()

      expect(ChipInput.getInstance(el)).toBeNull()
    })

    it('should dispose the chips it created and keep them in the document', () => {
      fixtureEl.innerHTML = '<div class="chip-input"><span class="chip">First</span></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)
      chipInput.add('Second')

      chipInput.dispose()

      const chips = el.querySelectorAll('.chip')

      expect(chips.length).toEqual(2)

      for (const chip of chips) {
        expect(Chip.getInstance(chip)).toBeNull()
        expect(chip.querySelector('.chip-remove')).toBeNull()
      }
    })

    it('should stop reacting to the text input after dispose', () => {
      fixtureEl.innerHTML = '<div class="chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)
      const input = el.querySelector('input.chip-input-field')

      chipInput.dispose()

      const inputSpy = spyOn(chipInput, '_handleInput')
      const keydownSpy = spyOn(chipInput, '_handleInputKeydown')
      const pasteSpy = spyOn(chipInput, '_handlePaste')
      const createSpy = spyOn(chipInput, '_createChipFromInput')

      input.value = 'foo,'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))
      input.dispatchEvent(new Event('paste', { bubbles: true }))
      input.dispatchEvent(new Event('blur'))
      el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }))
      el.click()

      expect(inputSpy).not.toHaveBeenCalled()
      expect(keydownSpy).not.toHaveBeenCalled()
      expect(pasteSpy).not.toHaveBeenCalled()
      expect(createSpy).not.toHaveBeenCalled()
      expect(el.querySelectorAll('.chip')).toHaveSize(0)
    })

    it('should be an instance of ChipSet', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      expect(chipInput).toBeInstanceOf(ChipSet)
    })
  })

  describe('getInstance', () => {
    it('should return chip-input instance', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      expect(ChipInput.getInstance(el)).toEqual(chipInput)
      expect(ChipInput.getInstance(el)).toBeInstanceOf(ChipInput)
    })

    it('should return null when there is no instance', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')

      expect(ChipInput.getInstance(el)).toBeNull()
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return existing instance', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      expect(ChipInput.getOrCreateInstance(el)).toEqual(chipInput)
      expect(ChipInput.getInstance(el)).toEqual(ChipInput.getOrCreateInstance(el, {}))
      expect(ChipInput.getOrCreateInstance(el)).toBeInstanceOf(ChipInput)
    })

    it('should create new instance when none exists', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')

      expect(ChipInput.getInstance(el)).toBeNull()
      expect(ChipInput.getOrCreateInstance(el)).toBeInstanceOf(ChipInput)
    })
  })

  describe('controlled mode (create: false)', () => {
    it('should not create a chip on Enter', () => {
      fixtureEl.innerHTML = '<div id="ci"></div>'
      const chipInput = new ChipInput(fixtureEl.querySelector('#ci'), { create: false })
      const input = fixtureEl.querySelector('input[type="text"]')

      input.value = 'typed'
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

      expect(chipInput.getValues()).toEqual([])
      expect(input.value).toBe('typed')
    })

    it('should not split typed separators into chips', () => {
      fixtureEl.innerHTML = '<div id="ci"></div>'
      const chipInput = new ChipInput(fixtureEl.querySelector('#ci'), { create: false })
      const input = fixtureEl.querySelector('input[type="text"]')

      input.value = 'a,b,'
      input.dispatchEvent(new Event('input', { bubbles: true }))

      expect(chipInput.getValues()).toEqual([])
    })

    it('should not render a value field', () => {
      fixtureEl.innerHTML = '<div id="ci"></div>'
      const chipInput = new ChipInput(fixtureEl.querySelector('#ci'), { create: false }) // eslint-disable-line no-unused-vars

      expect(fixtureEl.querySelector('textarea, input[type="hidden"]')).toBeNull()
    })

    it('should still accept chips from the host', () => {
      fixtureEl.innerHTML = '<div id="ci"></div>'
      const chipInput = new ChipInput(fixtureEl.querySelector('#ci'), { create: false })

      chipInput.add('Bootstrap')

      expect(chipInput.getValues()).toEqual(['Bootstrap'])
      expect(fixtureEl.querySelectorAll('.chip')).toHaveSize(1)
    })
  })

  describe('keyboard navigation', () => {
    it('should move focus to the input on ArrowRight from the last chip', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('React')
      chipInput.add('Vue')

      const chips = el.querySelectorAll('.chip')
      const lastChip = chips[chips.length - 1]
      const input = el.querySelector('input.chip-input-field')
      lastChip.focus()

      lastChip.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))

      expect(document.activeElement).toEqual(input)
    })

    it('should move focus by the direction of the chip input, not of the document', () => {
      fixtureEl.innerHTML = '<div class="form-control-group chip-input" dir="rtl"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('React')
      chipInput.add('Vue')

      const chips = el.querySelectorAll('.chip')
      const lastChip = chips[chips.length - 1]
      const input = el.querySelector('input.chip-input-field')
      lastChip.focus()

      lastChip.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))

      expect(document.activeElement).toEqual(input)
    })

    it('should move focus to the input on ArrowLeft from the last chip in RTL', () => {
      document.documentElement.dir = 'rtl'

      fixtureEl.innerHTML = '<div class="form-control-group chip-input"></div>'

      const el = fixtureEl.querySelector('.chip-input')
      const chipInput = new ChipInput(el)

      chipInput.add('React')
      chipInput.add('Vue')

      const chips = el.querySelectorAll('.chip')
      const lastChip = chips[chips.length - 1]
      const input = el.querySelector('input.chip-input-field')
      lastChip.focus()

      lastChip.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))

      expect(document.activeElement).toEqual(input)

      document.documentElement.dir = ''
    })
  })
})

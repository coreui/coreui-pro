import { userEvent } from 'vitest/browser'
import { vi } from 'vitest'
import FieldValidation from '../../../src/util/field-validation.js'
import { updateValidationState } from '../../../src/util/form-validation.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('FieldValidation', () => {
  let fixtureEl
  const controllers = []

  const tick = () => new Promise(resolve => {
    setTimeout(resolve)
  })

  const mount = ({ attributes = '', classes = '', config = {}, root = null, ...options } = {}) => {
    const markup = `<form><div id="host" class="form-control-group${classes}"${attributes}><textarea name="value"></textarea><span id="target"></span><span id="second"></span></div><div class="invalid-feedback" id="feedback">Fix it.</div></form>`
    const container = root ?? fixtureEl

    container.innerHTML = markup

    const host = container.querySelector('#host')
    const field = host.querySelector('textarea')
    const targets = [host.querySelector('#target'), host.querySelector('#second')]
    const state = { config: { validationState: null, ...config } }
    const validation = new FieldValidation(host, {
      config: () => state.config,
      fields: () => [field],
      frames: () => [host],
      invalidTargets: () => targets,
      ...options
    })

    controllers.push(validation)
    validation.refresh()

    return {
      field, form: container.querySelector('form'), host, state, targets, validation
    }
  }

  const mountOwner = ({ config = {}, error = false, frames = false } = {}) => {
    const host = document.createElement('div')
    const state = { config: { validationState: null, ...config }, error }
    const validation = new FieldValidation(host, {
      config: () => state.config,
      fields: () => [],
      frames: () => (frames ? [host] : []),
      invalidTargets: () => [],
      ownError: () => state.error
    })

    fixtureEl.append(host)
    controllers.push(validation)

    return { host, state, validation }
  }

  const stateClasses = element => [...element.classList].filter(name => name.startsWith('is-'))
  const describedBy = element => element.getAttribute('aria-describedby')

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    for (const validation of controllers) {
      validation.dispose()
    }

    controllers.length = 0
    clearFixture()
  })

  describe('a given state', () => {
    it('should not take a state class from the markup as the given state, and leave it through a given state and dispose', () => {
      const { host, state, targets, validation } = mount({ classes: ' is-invalid' })

      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(targets.map(target => target.getAttribute('aria-invalid'))).toEqual([null, null])
      expect(targets.map(describedBy)).toEqual([null, null])

      state.config.validationState = 'invalid'
      validation.update()

      expect(targets.map(target => target.getAttribute('aria-invalid'))).toEqual(['true', 'true'])

      state.config.validationState = null
      validation.update()

      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(targets.map(target => target.getAttribute('aria-invalid'))).toEqual([null, null])

      validation.dispose()

      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should take off the class it drew when the state goes, also after the page wrote the same class', () => {
      const { host, state, validation } = mount({ config: { validationState: 'invalid' } })

      host.classList.add('is-invalid')
      state.config.validationState = null
      validation.update()

      expect(stateClasses(host)).toEqual([])
    })

    it('should take off on dispose the class it drew, also after the page wrote the same class', () => {
      const { host, validation } = mount({ config: { validationState: 'invalid' } })

      host.classList.add('is-invalid')
      validation.dispose()

      expect(stateClasses(host)).toEqual([])
    })

    it('should draw the state on the frames, aria-invalid on the targets and the feedback in their description', () => {
      const { host, targets } = mount({ config: { validationState: 'invalid' } })

      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(targets.map(target => target.getAttribute('aria-invalid'))).toEqual(['true', 'true'])
      expect(targets.map(describedBy)).toEqual(['feedback', 'feedback'])
    })

    it('should draw a given invalid without a custom validity on the value fields, so the form submits', () => {
      for (const config of [{ validationState: 'invalid' }, { readonly: true, validationState: 'invalid' }]) {
        const { field, form, host, targets } = mount({ config })

        expect(stateClasses(host)).toEqual(['is-invalid'])
        expect(targets.map(target => target.getAttribute('aria-invalid'))).toEqual(['true', 'true'])
        expect(targets.map(describedBy)).toEqual(['feedback', 'feedback'])
        expect(field.validity.customError).toBe(false)
        expect(form.checkValidity()).toBe(true)
      }
    })

    it('should leave a custom validity the page set on a value field through a given state, a redraw, an input of the user and dispose', () => {
      const { field, form, state, validation } = mount()
      const blocks = () => [field.validationMessage, form.checkValidity()]

      field.setCustomValidity('Taken.')
      state.config.validationState = 'invalid'
      validation.update()

      expect(blocks()).toEqual(['Taken.', false])

      validation.update()

      expect(blocks()).toEqual(['Taken.', false])

      field.dispatchEvent(new Event('input', { bubbles: true }))

      expect(state.config.validationState).toBe('invalid')
      expect(blocks()).toEqual(['Taken.', false])

      validation.dispose()

      expect(blocks()).toEqual(['Taken.', false])
    })

    it('should give the description the page gave the host to the first target, and to every target while invalid', () => {
      const { host, state, targets, validation } = mount({ attributes: ' aria-describedby="hint"' })

      expect(describedBy(host)).toBeNull()
      expect(targets.map(describedBy)).toEqual(['hint', null])

      state.config.validationState = 'invalid'
      validation.update()

      expect(targets.map(describedBy)).toEqual(['hint feedback', 'hint feedback'])

      host.setAttribute('aria-describedby', 'later')
      validation.dispose()

      expect(describedBy(host)).toBe('hint later')
      expect(targets.map(describedBy)).toEqual([null, null])
      expect(targets.some(target => target.hasAttribute('aria-invalid'))).toBe(false)
    })

    it('should give the description the page gave the host to every element the component names', () => {
      const { host, targets } = mount({ attributes: ' aria-describedby="hint"', pageDescribed: () => [...fixtureEl.querySelectorAll('#target, #second')] })

      expect(describedBy(host)).toBeNull()
      expect(targets.map(describedBy)).toEqual(['hint', 'hint'])
    })

    it('should leave the description on a host the component names, and describe the targets with the feedback alone', () => {
      const { host, state, targets, validation } = mount({ attributes: ' aria-describedby="hint"', pageDescribed: () => [fixtureEl.querySelector('#host')] })

      expect(describedBy(host)).toBe('hint')
      expect(targets.map(describedBy)).toEqual([null, null])

      state.config.validationState = 'invalid'
      validation.update()

      expect(targets.map(describedBy)).toEqual(['feedback', 'feedback'])

      validation.dispose()

      expect(describedBy(host)).toBe('hint')
      expect(targets.map(describedBy)).toEqual([null, null])
    })

    it('should take off the aria-invalid it wrote over the one the page set, when a target leaves the list and on dispose', () => {
      fixtureEl.innerHTML = '<form><div id="host"><textarea></textarea><input id="first" aria-invalid="false"><input id="second" aria-invalid="grammar"></div></form>'
      const host = fixtureEl.querySelector('#host')
      const [first, second] = host.querySelectorAll('input')
      let targets = [first, second]
      const validation = new FieldValidation(host, {
        config: () => ({ validationState: 'invalid' }), fields: () => [host.querySelector('textarea')], frames: () => [host], invalidTargets: () => targets
      })

      controllers.push(validation)
      validation.refresh()

      expect([first, second].map(target => target.getAttribute('aria-invalid'))).toEqual(['true', 'true'])

      targets = [first]
      validation.update()

      expect(first.getAttribute('aria-invalid')).toBe('true')
      expect(second.hasAttribute('aria-invalid')).toBe(false)

      validation.dispose()

      expect(first.hasAttribute('aria-invalid')).toBe(false)
    })

    it('should describe the targets it is given apart from the ones it marks invalid', () => {
      const { host, targets } = mount({ config: { validationState: 'invalid' }, describedTargets: () => [fixtureEl.querySelector('#host')], invalidTargets: () => [] })

      expect(describedBy(host)).toBe('feedback')
      expect(targets.some(target => target.hasAttribute('aria-invalid') || target.hasAttribute('aria-describedby'))).toBe(false)
    })

    it('should take the message from the first value field, and show invalid over valid', async () => {
      fixtureEl.innerHTML = '<form data-coreui-validate="valid"><div id="host" class="form-control-group"><input id="first" data-coreui-invalid-feedback="named"><textarea id="second" required></textarea><span id="target"></span></div><div id="named" class="invalid-feedback">Named.</div><div class="invalid-feedback">Structural.</div></form>'
      const host = fixtureEl.querySelector('#host')
      const first = host.querySelector('#first')
      const second = host.querySelector('#second')
      const target = host.querySelector('#target')
      const state = { config: { validationState: 'invalid' } }
      const validation = new FieldValidation(host, {
        config: () => state.config, fields: () => [first, second], frames: () => [host], invalidTargets: () => [target]
      })

      controllers.push(validation)
      validation.refresh()

      expect(describedBy(target)).toBe('named')

      await userEvent.type(first, 'x')
      await userEvent.tab()
      state.config.validationState = null
      validation.update()

      expect(stateClasses(host)).toEqual(['is-valid'])

      second.form.checkValidity()

      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should show an error of its own as invalid over a given state, without blocking', () => {
      let hasError = true
      const { field, form, host, state, targets, validation } = mount({ config: { validationState: 'valid' }, ownError: () => hasError })

      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(targets.map(target => target.getAttribute('aria-invalid'))).toEqual(['true', 'true'])
      expect(form.checkValidity()).toBe(true)

      hasError = false
      state.config.validationState = null
      field.required = true
      form.checkValidity()
      validation.update()

      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should take the state of its owners after its own and mark the owner\'s error without the class', () => {
      const { host, state, targets, validation } = mount({ attributes: ' aria-describedby="hint"' })
      const range = mountOwner({ frames: true })
      const picker = mountOwner({ config: { validationState: 'invalid' } })

      picker.validation.adopt(range.validation)
      range.validation.adopt(validation)

      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(stateClasses(range.host)).toEqual(['is-invalid'])
      expect(targets.map(target => target.getAttribute('aria-invalid'))).toEqual(['true', 'true'])

      state.config.validationState = 'valid'
      validation.update()

      expect(stateClasses(host)).toEqual(['is-valid'])

      range.state.error = true
      validation.update()

      expect(stateClasses(host)).toEqual([])
      expect(targets.map(target => target.getAttribute('aria-invalid'))).toEqual(['true', 'true'])
      expect(targets.map(describedBy)).toEqual(['hint feedback', 'hint feedback'])

      range.state.error = false
      state.config.validationState = null
      validation.update()

      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(stateClasses(range.host)).toEqual(['is-invalid'])
    })

    it('should keep the states given to it and its owners through an input of the user, and draw the tree from the top', () => {
      const { field, host, state, validation } = mount({ config: { validationState: 'warning' } })
      const range = mountOwner({ config: { validationState: 'invalid' }, frames: true })
      const picker = mountOwner({ config: { validationState: 'invalid' }, frames: true })

      picker.validation.adopt(range.validation)
      range.validation.adopt(validation)
      field.dispatchEvent(new Event('input', { bubbles: true }))
      field.dispatchEvent(new Event('change', { bubbles: true }))

      expect([state.config.validationState, range.state.config.validationState, picker.state.config.validationState]).toEqual(['warning', 'invalid', 'invalid'])
      expect([host, range.host, picker.host].map(stateClasses)).toEqual([['is-warning'], ['is-invalid'], ['is-invalid']])

      state.config.validationState = null
      range.state.config.validationState = null
      picker.state.config.validationState = 'valid'
      validation.update()

      expect([host, range.host, picker.host].map(stateClasses)).toEqual([['is-valid'], ['is-valid'], ['is-valid']])

      range.state.error = true
      validation.update()

      expect([host, range.host, picker.host].map(stateClasses)).toEqual([[], ['is-invalid'], ['is-invalid']])
    })

    it('should keep its own invalid state class while its owner shows an error', () => {
      const { host, validation } = mount({ config: { validationState: 'invalid' } })
      const range = mountOwner({ error: true })

      range.validation.adopt(validation)

      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should show invalid on an owner whose part has an error of its own, and stop drawing a disposed part', () => {
      let hasError = true
      const { host, validation } = mount({ ownError: () => hasError })
      const range = mountOwner({ config: { validationState: 'valid' }, frames: true })

      range.validation.adopt(validation)

      expect(stateClasses(range.host)).toEqual(['is-invalid'])

      hasError = false
      range.validation.update()

      expect(stateClasses(range.host)).toEqual(['is-valid'])
      expect(stateClasses(host)).toEqual(['is-valid'])

      validation.dispose()
      hasError = true
      range.validation.update()

      expect(stateClasses(host)).toEqual([])
      expect(stateClasses(range.host)).toEqual(['is-valid'])
    })

    it('should let a host that keeps the description lend the one it had at the start to the targets it names', () => {
      const { host, state, targets, validation } = mount({
        attributes: ' aria-describedby="hint"',
        pageDescribed: isInvalid => [fixtureEl.querySelector('#host'), ...[...fixtureEl.querySelectorAll('#target, #second')].filter((_, index) => index === 0 || isInvalid)]
      })

      expect(describedBy(host)).toBe('hint')
      expect(targets.map(describedBy)).toEqual(['hint', null])

      host.setAttribute('aria-describedby', 'hint note')
      state.config.validationState = 'invalid'
      validation.update()

      expect(targets.map(describedBy)).toEqual(['hint feedback', 'hint feedback'])

      validation.dispose()

      expect(describedBy(host)).toBe('hint note')
    })

    it('should add the feedback to a host that keeps its description and is described, and take it back', () => {
      const { host, state, validation } = mount({
        attributes: ' aria-describedby="hint"',
        describedTargets: () => [fixtureEl.querySelector('#host')],
        pageDescribed: () => [fixtureEl.querySelector('#host')]
      })

      state.config.validationState = 'invalid'
      validation.update()

      expect(describedBy(host)).toBe('hint feedback')

      state.config.validationState = 'valid'
      validation.update()

      expect(describedBy(host)).toBe('hint')
    })

    it('should read the invalid and valid aliases only for a component that has them', () => {
      const without = mount({ config: { invalid: true } })

      expect(stateClasses(without.host)).toEqual([])

      const { host, state, validation } = mount({ aliases: true, config: { invalid: true, valid: true } })

      expect(stateClasses(host)).toEqual(['is-invalid'])

      state.config.invalid = false
      validation.update()

      expect(stateClasses(host)).toEqual(['is-valid'])
    })

    it('should leave a state class the page put on a frame, and take its own off a frame no longer listed', () => {
      const { host, state, validation } = mount({ config: { validationState: 'invalid' } })
      const other = document.createElement('div')
      let frames = [host, other]

      validation._options.frames = () => frames
      validation.update()
      other.classList.add('is-valid')
      state.config.validationState = 'valid'
      validation.update()

      expect(stateClasses(host)).toEqual(['is-valid'])

      state.config.validationState = null
      validation.update()

      expect(stateClasses(other)).toEqual(['is-valid'])

      state.config.validationState = 'invalid'
      validation.update()
      frames = [other]
      validation.update()

      expect(stateClasses(host)).toEqual([])
      expect(stateClasses(other)).toEqual(['is-valid', 'is-invalid'])
    })
  })

  describe('what it writes', () => {
    it('should add its ids after the ones someone else put on a target, and take back only its own', () => {
      const { field, host, state, targets, validation } = mount({ attributes: ' aria-describedby="hint"' })

      targets[1].setAttribute('aria-describedby', 'own feedback')
      state.config.validationState = 'invalid'
      validation.update()

      expect(targets.map(describedBy)).toEqual(['hint feedback', 'own feedback hint'])

      validation.dispose()

      expect(targets.map(describedBy)).toEqual([null, 'own feedback'])
      expect(describedBy(host)).toBe('hint')
      expect(field.hasAttribute('aria-describedby')).toBe(false)
    })

    it('should leave the description on a host that is itself the value field', () => {
      fixtureEl.innerHTML = '<form><textarea id="host" aria-describedby="hint"></textarea><span id="target"></span></form>'
      const host = fixtureEl.querySelector('#host')
      const target = fixtureEl.querySelector('#target')
      const validation = new FieldValidation(host, {
        config: () => ({}), fields: () => [host], frames: () => [host], invalidTargets: () => [target]
      })

      controllers.push(validation)
      validation.refresh()

      expect([describedBy(host), describedBy(target)]).toEqual(['hint', 'hint'])

      validation.dispose()

      expect([describedBy(host), describedBy(target)]).toEqual(['hint', null])
    })

    it('should take what it wrote off a target the component no longer lists', () => {
      const { host, targets, validation } = mount({ attributes: ' aria-describedby="hint"', config: { validationState: 'invalid' } })
      let listed = targets

      validation._options.invalidTargets = () => listed
      validation.update()
      listed = [targets[0]]
      validation.update()

      expect(targets[1].hasAttribute('aria-invalid')).toBe(false)
      expect(targets[1].hasAttribute('aria-describedby')).toBe(false)
      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should describe the field with the message the stylesheet shows next to the state class it draws', () => {
      fixtureEl.innerHTML = '<form><div id="host"><div><textarea></textarea></div></div><div class="invalid-feedback" id="feedback">Fix it.</div></form>'
      const host = fixtureEl.querySelector('#host')
      const field = host.querySelector('textarea')
      const validation = new FieldValidation(host, {
        config: () => ({ validationState: 'invalid' }), fields: () => [field], frames: () => [host], invalidTargets: () => [field]
      })

      controllers.push(validation)
      validation.refresh()

      expect(describedBy(field)).toBe('feedback')
    })

    it('should take the message of the first focus target when the component has no value field', () => {
      fixtureEl.innerHTML = '<form><div id="host" class="form-control-group"><input id="target" data-coreui-invalid-feedback="named"></div><div id="named" class="invalid-feedback">Named.</div></form>'
      const host = fixtureEl.querySelector('#host')
      const target = host.querySelector('#target')
      const validation = new FieldValidation(host, {
        config: () => ({ validationState: 'invalid' }), fields: () => [], frames: () => [host], invalidTargets: () => [target]
      })

      controllers.push(validation)
      validation.refresh()

      expect(describedBy(target)).toBe('named')
      expect(target.getAttribute('aria-invalid')).toBe('true')
    })
  })

  describe('update', () => {
    it('should draw no state once the given invalid goes, also on a field a validation reported because of it', () => {
      const { field, host, state, targets, validation } = mount({ config: { validationState: 'invalid' } })

      field.form.checkValidity()
      state.config.validationState = null
      validation.update()

      expect(field.validity.valid).toBe(true)
      expect(stateClasses(host)).toEqual([])
      expect(targets.some(target => target.hasAttribute('aria-invalid'))).toBe(false)
    })
  })

  describe('a change of the value', () => {
    it('should keep a given state through the input and change events of its value fields, until the page gives another', () => {
      const { field, host, state, validation } = mount({ config: { validationState: 'invalid' } })

      field.value = 'changed'
      field.dispatchEvent(new Event('input', { bubbles: true }))
      field.dispatchEvent(new Event('change', { bubbles: true }))

      expect(state.config.validationState).toBe('invalid')
      expect(stateClasses(host)).toEqual(['is-invalid'])

      state.config.validationState = null
      validation.update()

      expect(stateClasses(host)).toEqual([])
    })
  })

  describe('a reported state', () => {
    it('should show it once a validation reports a field', () => {
      const { field, host } = mount()

      field.required = true

      expect(stateClasses(host)).toEqual([])

      field.form.checkValidity()

      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should carry a report to a field that replaces one at the same position, and stop following one it removed', () => {
      const { field, host, validation } = mount()
      const replacement = document.createElement('textarea')
      let fields = [field]

      validation._options.fields = () => fields
      field.required = true
      field.form.checkValidity()
      replacement.required = true
      field.replaceWith(replacement)
      fields = [replacement]
      validation.refresh()

      expect(stateClasses(host)).toEqual(['is-invalid'])

      replacement.value = 'filled'
      field.dispatchEvent(new Event('input'))

      expect(stateClasses(host)).toEqual(['is-invalid'])

      replacement.dispatchEvent(new Event('input'))

      expect(stateClasses(host)).toEqual([])
    })

    it('should carry a report through partial replacements, and hand a field put in front the follower of a field that is gone', () => {
      fixtureEl.innerHTML = '<form><div id="host" class="form-control-group"></div></form>'
      const host = fixtureEl.querySelector('#host')
      const make = (required = true) => {
        const field = document.createElement('textarea')
        field.required = required
        host.append(field)
        return field
      }

      const [a, b] = [make(), make(false)]
      let fields = [a, b]
      const validation = new FieldValidation(host, {
        config: () => ({}), fields: () => fields, frames: () => [host], invalidTargets: () => []
      })

      controllers.push(validation)
      validation.refresh()
      a.form.checkValidity()
      fields = [make(), b]
      validation.refresh()
      fields = [make(), make(false)]
      validation.refresh()

      expect(stateClasses(host)).toEqual(['is-invalid'])

      const [kept] = fields
      kept.value = 'filled'
      fields = [make(), kept]
      validation.refresh()

      expect(stateClasses(host)).toEqual([])
    })

    it('should take over the fields it owns from the form utilities and hand them back on dispose', () => {
      const { field, form, validation } = mount()

      field.required = true
      updateValidationState(form, new WeakMap())

      expect(field.classList.contains('is-invalid')).toBe(false)

      validation.dispose()
      updateValidationState(form, new WeakMap())

      expect(field.classList.contains('is-invalid')).toBe(true)
    })
  })

  describe('a native reset', () => {
    it('should keep a given state and restore the value', async () => {
      const restore = vi.fn()
      const { form, host } = mount({ config: { validationState: 'invalid' }, restore })

      form.reset()
      await tick()

      expect(restore).toHaveBeenCalledTimes(1)
      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should answer the reset of its form when another form resets in the same task', async () => {
      const restore = vi.fn()
      const { form, host } = mount({ config: { validationState: 'invalid' }, restore })
      const other = document.createElement('form')

      fixtureEl.append(other)
      form.reset()
      other.reset()
      await tick()

      expect(restore).toHaveBeenCalledTimes(1)
      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should follow a reset while a reset listener that runs before its own builds new fields', async () => {
      const fields = () => [...fixtureEl.querySelectorAll('textarea')]
      let rebuild = () => {}
      const listener = () => rebuild()

      document.addEventListener('reset', listener, true)

      const restore = vi.fn()
      const { form, host, validation } = mount({ config: { validationState: 'invalid' }, fields, restore })

      rebuild = () => {
        const [field] = fields()

        field.replaceWith(field.cloneNode())
        validation.refresh()
      }

      form.reset()
      await tick()
      document.removeEventListener('reset', listener, true)

      expect(restore).toHaveBeenCalledTimes(1)
      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(form.checkValidity()).toBe(true)
    })

    it('should forget a report while a reset listener that runs before its own builds new fields', async () => {
      const fields = () => [...fixtureEl.querySelectorAll('textarea')]
      let rebuild = () => {}
      const listener = () => rebuild()

      document.addEventListener('reset', listener, true)

      const { field, form, host, validation } = mount({ fields })

      field.required = true
      form.checkValidity()
      rebuild = () => {
        const [current] = fields()

        current.replaceWith(current.cloneNode())
        validation.refresh()
      }

      form.reset()
      await tick()
      document.removeEventListener('reset', listener, true)

      expect(stateClasses(host)).toEqual([])
    })

    it('should keep a report when a reset listener rebuilds the fields and a later one cancels the reset', async () => {
      const fields = () => [...fixtureEl.querySelectorAll('textarea')]
      const { field, form, host, validation } = mount({ fields })

      field.required = true
      form.checkValidity()
      form.addEventListener('reset', () => {
        field.replaceWith(field.cloneNode())
        validation.refresh()
      })
      form.addEventListener('reset', event => event.preventDefault())
      form.reset()
      await tick()

      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should stop after a restore that disposes it', async () => {
      const errors = []
      const onError = event => errors.push(event.message)
      let validation = null
      const { form } = mount({ config: { validationState: 'invalid' }, restore: () => validation.dispose() })

      validation = controllers.at(-1)
      window.addEventListener('error', onError)
      form.reset()
      await tick()
      window.removeEventListener('error', onError)

      expect(errors).toEqual([])
    })

    it('should keep a state given in a reset listener of the form', async () => {
      const { form, host, state, validation } = mount()

      form.addEventListener('reset', () => {
        state.config.validationState = 'invalid'
        validation.update()
      })
      form.reset()
      await tick()

      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should leave a cancelled reset, the reset of another form and a reset after dispose alone', async () => {
      const restore = vi.fn()
      const { form, host, validation } = mount({ config: { validationState: 'invalid' }, restore })
      const other = document.createElement('form')

      fixtureEl.append(other)
      form.addEventListener('reset', event => event.preventDefault(), { once: true })
      form.reset()
      other.reset()
      await tick()

      expect(stateClasses(host)).toEqual(['is-invalid'])

      form.reset()
      validation.dispose()
      await tick()
      form.reset()
      await tick()

      expect(restore).not.toHaveBeenCalled()
    })

    it('should follow a reset inside a shadow root', async () => {
      const shadowHost = document.createElement('div')

      fixtureEl.append(shadowHost)

      const root = shadowHost.attachShadow({ mode: 'open' })
      const restore = vi.fn()
      const { form, host } = mount({ config: { validationState: 'invalid' }, restore, root })

      form.reset()
      await tick()

      expect(restore).toHaveBeenCalledTimes(1)
      expect(stateClasses(host)).toEqual(['is-invalid'])
    })
  })
})

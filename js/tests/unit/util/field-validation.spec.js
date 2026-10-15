import { userEvent } from '@vitest/browser/context'
import { vi } from 'vitest'
import FieldValidation from '../../../src/util/field-validation.js'
import { nextStateSerial, updateValidationState } from '../../../src/util/form-validation.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('FieldValidation', () => {
  let fixtureEl
  const controllers = []

  const tick = () => new Promise(resolve => {
    setTimeout(resolve)
  })

  const mount = ({ attributes = '', classes = '', config = {}, root = null, targetClasses = '', ...options } = {}) => {
    const markup = `<form><div id="host" class="form-control-group${classes}"${attributes}><textarea name="value"></textarea><span id="target" class="${targetClasses}"></span><span id="second"></span></div><div class="invalid-feedback" id="feedback">Fix it.</div></form>`
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
    it('should take a state class from the markup as the given state, block with it and give it back on dispose', () => {
      const { field, host, validation } = mount({ classes: ' is-invalid' })

      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(field.validationMessage).toBe('Fix it.')

      validation.dispose()

      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(field.validity.customError).toBe(false)
    })

    it('should draw the state on the frames, aria-invalid on the targets and the feedback in their description', () => {
      const { field, host, targets } = mount({ config: { validationState: 'invalid' } })

      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(targets.map(target => target.getAttribute('aria-invalid'))).toEqual(['true', 'true'])
      expect(targets.map(describedBy)).toEqual(['feedback', 'feedback'])
      expect(field.form.checkValidity()).toBe(false)
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

    it('should give back the aria-invalid it overwrote, when a target leaves the list and on dispose', () => {
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

      expect(second.getAttribute('aria-invalid')).toBe('grammar')

      validation.dispose()

      expect(first.getAttribute('aria-invalid')).toBe('false')
    })

    it('should describe the targets it is given apart from the ones it marks invalid', () => {
      const { host, targets } = mount({ config: { validationState: 'invalid' }, describedTargets: () => [fixtureEl.querySelector('#host')], invalidTargets: () => [] })

      expect(describedBy(host)).toBe('feedback')
      expect(targets.some(target => target.hasAttribute('aria-invalid') || target.hasAttribute('aria-describedby'))).toBe(false)
    })

    it('should block only the fields that carry the block, and show the state without a field to carry it', () => {
      const { field, host } = mount({ blockers: () => [], config: { validationState: 'invalid' } })

      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(field.validity.customError).toBe(false)
    })

    it('should not block while the component is disabled, or while it says it cannot', () => {
      const disabled = mount({ config: { disabled: true, validationState: 'invalid' } })

      expect(stateClasses(disabled.host)).toEqual(['is-invalid'])
      expect(disabled.field.validity.customError).toBe(false)

      const { field, host } = mount({ canBlock: () => false, config: { validationState: 'invalid' } })

      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(field.validity.customError).toBe(false)
    })

    it('should block for a component without a say on blocking, whatever other keys its configuration holds', () => {
      const { field } = mount({ config: { readonly: true, validationState: 'invalid' } })

      expect(field.validity.customError).toBe(true)
    })

    it('should take the message from the first field that carries the block, and show invalid over valid', async () => {
      fixtureEl.innerHTML = '<form data-coreui-validate="valid"><div id="host" class="form-control-group"><input id="first"><textarea id="second" required data-coreui-invalid-feedback="named"></textarea><span id="target"></span></div><div id="named" class="invalid-feedback">Named.</div><div class="invalid-feedback">Structural.</div></form>'
      const host = fixtureEl.querySelector('#host')
      const first = host.querySelector('#first')
      const second = host.querySelector('#second')
      const target = host.querySelector('#target')
      const state = { config: { validationState: 'invalid' } }
      const validation = new FieldValidation(host, {
        blockers: () => [second], config: () => state.config, fields: () => [first, second], frames: () => [host], invalidTargets: () => [target]
      })

      controllers.push(validation)
      validation.refresh()

      expect(describedBy(target)).toBe('named')

      await userEvent.type(first, 'x')
      await userEvent.tab()
      state.config.validationState = null
      validation.configure({ validationState: null })

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

    it('should take the state of its owner after its own, mark the owner\'s error without the class, and tell the owner every drop', () => {
      const owner = { dismiss: vi.fn(), invalid: false, state: 'invalid' }
      const { field, host, state, targets, validation } = mount({ attributes: ' aria-describedby="hint"', owner: () => owner })

      expect(stateClasses(host)).toEqual(['is-invalid'])
      expect(field.validity.customError).toBe(true)

      state.config.validationState = 'valid'
      validation.update()

      expect(stateClasses(host)).toEqual(['is-valid'])

      owner.invalid = true
      validation.update()

      expect(stateClasses(host)).toEqual([])
      expect(targets.map(target => target.getAttribute('aria-invalid'))).toEqual(['true', 'true'])
      expect(targets.map(describedBy)).toEqual(['hint feedback', 'hint feedback'])

      expect(validation.dismiss()).toBe(true)

      const serial = nextStateSerial()

      owner.state = undefined
      owner.invalid = false

      expect(validation.dismiss(serial)).toBe(false)
      expect(owner.dismiss.mock.calls).toEqual([[Number.POSITIVE_INFINITY], [serial]])
    })

    it('should keep its own invalid state class while its owner shows an error', () => {
      const owner = { dismiss() {}, invalid: true, state: undefined }
      const { host } = mount({ config: { validationState: 'invalid' }, owner: () => owner })

      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should let a host that keeps the description lend the one it carries to the targets it names', () => {
      const { host, state, targets, validation } = mount({
        attributes: ' aria-describedby="hint"',
        pageDescribed: isInvalid => [fixtureEl.querySelector('#host'), ...[...fixtureEl.querySelectorAll('#target, #second')].filter((_, index) => index === 0 || isInvalid)]
      })

      expect(describedBy(host)).toBe('hint')
      expect(targets.map(describedBy)).toEqual(['hint', null])

      host.setAttribute('aria-describedby', 'hint note')
      state.config.validationState = 'invalid'
      validation.update()

      expect(targets.map(describedBy)).toEqual(['hint note feedback', 'hint note feedback'])

      validation.dispose()

      expect(describedBy(host)).toBe('hint note')
    })

    it('should lend a kept description without the ids it wrote on a host that is also described', () => {
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

      validation.runAsUser(() => validation.change())

      expect(state.config).toEqual({ invalid: false, valid: false, validationState: null })

      state.config.valid = true

      expect(validation.configure({ invalid: false, valid: true })).toBe(true)
      expect(stateClasses(host)).toEqual(['is-valid'])

      const server = mount({ classes: ' is-invalid' })

      expect(server.validation.configure({ invalid: true })).toBe(false)

      server.validation.update()

      expect(stateClasses(server.host)).toEqual(['is-invalid'])
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
    it('should take the state classes of every server source and give each its own back', () => {
      const { host, targets, validation } = mount({ classes: ' is-valid', targetClasses: 'is-invalid', serverClassSources: () => [fixtureEl.querySelector('#host'), fixtureEl.querySelector('#target')] })

      expect(stateClasses(targets[0])).toEqual([])

      validation.dispose()

      expect(stateClasses(host)).toEqual(['is-valid'])
      expect(stateClasses(targets[0])).toEqual(['is-invalid'])
    })

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

    it('should block with the message the stylesheet shows next to the state class it draws', () => {
      fixtureEl.innerHTML = '<form><div id="host"><div><textarea></textarea></div></div><div class="invalid-feedback" id="feedback">Fix it.</div></form>'
      const host = fixtureEl.querySelector('#host')
      const field = host.querySelector('textarea')
      const validation = new FieldValidation(host, {
        config: () => ({ validationState: 'invalid' }), fields: () => [field], frames: () => [host], invalidTargets: () => [field]
      })

      controllers.push(validation)
      validation.refresh()

      expect(field.validationMessage).toBe('Fix it.')
      expect(describedBy(field)).toBe('feedback')
    })

    it('should block with a message the page linked through its description', () => {
      fixtureEl.innerHTML = '<form><div id="host" aria-describedby="error"><textarea></textarea></div></form><div class="invalid-feedback" id="error">Pick one.</div>'
      const host = fixtureEl.querySelector('#host')
      const field = host.querySelector('textarea')
      const validation = new FieldValidation(host, {
        config: () => ({ validationState: 'invalid' }), fields: () => [field], frames: () => [host], invalidTargets: () => [field]
      })

      controllers.push(validation)
      validation.refresh()

      expect(field.validationMessage).toBe('Pick one.')
    })

    it('should block only value fields, also when a blocker is not one of them', () => {
      const extra = document.createElement('textarea')
      const { field, state, validation } = mount({ blockers: () => [extra, fixtureEl.querySelector('textarea')], config: { validationState: 'invalid' } })

      fixtureEl.querySelector('form').append(extra)

      expect([field.validity.customError, extra.validity.customError]).toEqual([true, false])

      validation.dismiss()
      state.config.validationState = null
      validation.update()

      expect([field.validity.customError, extra.validity.customError]).toEqual([false, false])
    })

    it('should take the message of the first focus target when no field carries the block', () => {
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

  describe('configure', () => {
    it('should apply options of validation alone in place and forget the state class from the markup', () => {
      const { host, state, validation } = mount({ classes: ' is-invalid' })

      state.config.validationState = 'valid'

      expect(validation.configure({ validationState: 'valid' })).toBe(true)
      expect(stateClasses(host)).toEqual(['is-valid'])

      state.config.validationState = null
      validation.update()

      expect(stateClasses(host)).toEqual([])
    })

    it('should forget the state class from the markup but leave the drawing to a rebuild for mixed options', () => {
      const { host, validation } = mount({ classes: ' is-invalid' })

      expect(validation.configure({ placeholder: 'x', validationState: null })).toBe(false)
      expect(stateClasses(host)).toEqual(['is-invalid'])

      validation.refresh()

      expect(stateClasses(host)).toEqual([])
    })

    it('should draw no state once the given invalid goes, also on a field a validation reported because of it', () => {
      const { field, host, state, targets, validation } = mount({ config: { validationState: 'invalid' } })

      field.form.checkValidity()
      state.config.validationState = null
      validation.configure({ validationState: null })

      expect(field.validity.valid).toBe(true)
      expect(stateClasses(host)).toEqual([])
      expect(targets.some(target => target.hasAttribute('aria-invalid'))).toBe(false)
    })

    it('should leave the state alone for options without a validation option', () => {
      const { host, validation } = mount({ classes: ' is-invalid' })

      expect(validation.configure({ placeholder: 'x' })).toBe(false)
      expect(validation.configure(null)).toBe(false)

      validation.update()

      expect(stateClasses(host)).toEqual(['is-invalid'])
    })
  })

  describe('a change of the value', () => {
    it('should drop the given state at the first change of a user action and keep a state given after it', () => {
      const { field, host, state, validation } = mount({ classes: ' is-valid', config: { validationState: 'invalid' } })

      const changeValue = () => {
        validation.change()
        validation.update()
      }

      validation.runAsUser(() => {
        changeValue()
        state.config.validationState = 'invalid'
        changeValue()
      })

      expect(stateClasses(host)).toEqual(['is-invalid'])

      validation.runAsUser(() => validation.change())

      expect(field.validity.customError).toBe(false)
      expect(stateClasses(host)).toEqual(['is-invalid'])

      validation.update()

      expect(stateClasses(host)).toEqual([])
    })

    it('should tell whether it dropped a state, and leave the configuration alone when none was given', () => {
      const { state, validation } = mount({ config: { validationState: 'invalid' } })

      expect(validation.dismiss()).toBe(true)
      expect(state.config.validationState).toBeNull()

      state.config.validationState = undefined

      expect(validation.dismiss()).toBe(false)
      expect(state.config.validationState).toBeUndefined()
    })

    it('should drop a state given before the moment a serial stands for, and keep one given after it', () => {
      const { host, state, validation } = mount({ config: { validationState: 'invalid' } })
      const serial = nextStateSerial()

      validation.dismiss(serial)
      validation.update()

      expect(stateClasses(host)).toEqual([])

      const later = nextStateSerial()

      state.config.validationState = 'invalid'
      validation.configure({ validationState: 'invalid' })
      validation.dismiss(later)
      validation.update()

      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should keep the given state for a change made by code, and end a user action that changed nothing', () => {
      const { host, validation } = mount({ config: { validationState: 'invalid' } })

      validation.change()
      validation.runAsUser(() => {})
      validation.change()

      expect(validation.userAction).toBe(false)
      expect(stateClasses(host)).toEqual(['is-invalid'])
    })

    it('should keep a gesture open through an inner action that changed nothing, and closed once one changed the value', () => {
      const { validation } = mount({ config: { validationState: 'invalid' } })

      validation.userAction = true
      validation.runAsUser(() => {})

      expect(validation.userAction).toBe(true)

      validation.runAsUser(() => validation.change())

      expect(validation.userAction).toBe(false)
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

    it('should carry a report by position through partial replacements, and give none to a field put in front', () => {
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

    it('should lift the block from a field the component no longer lists', () => {
      const { field, validation } = mount({ config: { validationState: 'invalid' } })
      const replacement = document.createElement('textarea')

      validation._options.fields = () => [replacement]
      field.form.append(replacement)
      validation.refresh()

      expect(field.validity.customError).toBe(false)
      expect(replacement.validity.customError).toBe(true)
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
    it('should drop a state given before it and restore the value', async () => {
      const restore = vi.fn()
      const { form, host } = mount({ config: { validationState: 'invalid' }, restore })

      form.reset()
      await tick()

      expect(restore).toHaveBeenCalledTimes(1)
      expect(stateClasses(host)).toEqual([])
    })

    it('should let the fields forget a report before the value is restored', async () => {
      const seen = []
      let onRestore = () => {}
      const { field, form, host, validation } = mount({ restore: () => onRestore() })

      field.required = true
      form.checkValidity()
      field.value = 'typed'
      field.dispatchEvent(new Event('input'))
      onRestore = () => {
        field.value = ''
        validation.update()
        seen.push(stateClasses(host))
      }

      form.reset()
      await tick()

      expect(seen).toEqual([[]])
    })

    it('should draw the dropped state before the value is restored', async () => {
      const seen = []
      let onRestore = () => {}
      const { form, host } = mount({ config: { validationState: 'invalid' }, restore: () => onRestore() })

      onRestore = () => seen.push(stateClasses(host))
      form.reset()
      await tick()

      expect(seen).toEqual([[]])
    })

    it('should follow a reset while a reset listener that runs before its own builds new fields', async () => {
      const fields = () => [...fixtureEl.querySelectorAll('textarea')]
      let rebuild = () => {}
      const listener = () => rebuild()

      document.addEventListener('reset', listener, true)

      const { form, host, validation } = mount({ config: { validationState: 'invalid' }, fields })

      rebuild = () => {
        const [field] = fields()

        field.replaceWith(field.cloneNode())
        validation.refresh()
      }

      form.reset()
      await tick()
      document.removeEventListener('reset', listener, true)

      expect(stateClasses(host)).toEqual([])
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

    it('should answer a reset that ran even when a second one in the same task is cancelled', async () => {
      const restore = vi.fn()
      const { form, host } = mount({ config: { validationState: 'invalid' }, restore })

      form.reset()
      form.addEventListener('reset', event => event.preventDefault(), { once: true })
      form.dispatchEvent(new Event('reset', { cancelable: true }))
      await tick()

      expect(restore).toHaveBeenCalledTimes(1)
      expect(stateClasses(host)).toEqual([])
      expect(form.checkValidity()).toBe(true)
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

    it('should not follow resets before its first refresh', async () => {
      fixtureEl.innerHTML = '<form><div id="host"></div></form>'
      const errors = []
      const onError = event => errors.push(event.message)
      // eslint-disable-next-line no-new
      new FieldValidation(fixtureEl.querySelector('#host'), {
        config: () => ({}), fields: () => [null], frames: () => [], invalidTargets: () => []
      })

      window.addEventListener('error', onError)
      fixtureEl.querySelector('form').reset()
      await tick()
      window.removeEventListener('error', onError)

      expect(errors).toEqual([])
    })

    it('should give no report to a field a reset listener puts in place of a reported one', async () => {
      const fields = () => [...fixtureEl.querySelectorAll('textarea')]
      const { field, form, host, validation } = mount({ fields })

      field.required = true
      form.checkValidity()

      expect(stateClasses(host)).toEqual(['is-invalid'])

      form.addEventListener('reset', () => {
        field.replaceWith(field.cloneNode())
        validation.refresh()
      })
      form.reset()

      expect(stateClasses(host)).toEqual([])

      await tick()

      expect(stateClasses(host)).toEqual([])
    })

    it('should tell the owner the serial of a reset', async () => {
      const owner = { dismiss: vi.fn(), invalid: false, state: undefined }
      const { form } = mount({ owner: () => owner })
      const before = nextStateSerial()

      form.reset()
      await tick()

      expect(owner.dismiss).toHaveBeenCalledTimes(1)
      expect(owner.dismiss.mock.calls[0][0]).toBeGreaterThan(before)
      expect(Number.isFinite(owner.dismiss.mock.calls[0][0])).toBe(true)
    })

    it('should keep a state given in a reset listener of the form', async () => {
      const { form, host, state, validation } = mount()

      form.addEventListener('reset', () => {
        state.config.validationState = 'invalid'
        validation.configure({ validationState: 'invalid' })
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
      const { form, host } = mount({ config: { validationState: 'invalid' }, root })

      form.reset()
      await tick()

      expect(stateClasses(host)).toEqual([])
    })
  })
})

import { vi } from 'vitest'
import Form from '../../src/form.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('Form', () => {
  let fixtureEl

  const describedBy = element => element.getAttribute('aria-describedby')

  const mountForm = (attributes = 'data-coreui-validate novalidate') => {
    fixtureEl.innerHTML = `<form ${attributes}>
      <input id="name" required><div id="nameError" class="invalid-feedback">Enter your name.</div>
      <input id="city" required><div id="cityError" class="invalid-feedback">Enter a city.</div>
      <button id="submit" type="submit">Send</button>
    </form>`

    return fixtureEl.querySelector('form')
  }

  const submit = form => {
    let prevented
    const handleSubmit = event => {
      prevented = event.defaultPrevented
      event.preventDefault()
    }

    form.addEventListener('submit', handleSubmit)
    form.requestSubmit()
    form.removeEventListener('submit', handleSubmit)

    return prevented
  }

  const nextTask = () => new Promise(resolve => {
    setTimeout(resolve)
  })

  const type = (control, value) => {
    control.value = value
    control.dispatchEvent(new Event('input', { bubbles: true }))
  }

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    for (const form of fixtureEl.querySelectorAll('form')) {
      Form.getInstance(form)?.dispose()
    }

    clearFixture()
  })

  it('should take care of element either passed as a CSS selector or DOM element', () => {
    const form = mountForm()
    form.id = 'signup'

    expect(new Form('#signup')._element).toEqual(form)
    expect(new Form(form)._element).toEqual(form)
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Form.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Form.DATA_KEY).toEqual('coreui.form')
    })
  })

  describe('data-api', () => {
    it('should stop an invalid submit before the handlers of the form, mark the invalid controls and focus the first', () => {
      const form = mountForm()
      const name = fixtureEl.querySelector('#name')
      const city = fixtureEl.querySelector('#city')
      type(city, 'Paris')

      expect(submit(form)).toBeTrue()
      expect(name).toHaveClass('is-invalid')
      expect(name.getAttribute('aria-invalid')).toBe('true')
      expect(describedBy(name)).toBe('nameError')
      expect(city).not.toHaveClass('is-invalid')
      expect(city.hasAttribute('aria-invalid')).toBeFalse()
      expect(document.activeElement).toBe(name)
    })

    it('should let a valid submit through, and mark the valid controls only when the form opts in', () => {
      const form = mountForm('data-coreui-validate="valid" novalidate')
      const name = fixtureEl.querySelector('#name')
      type(name, 'Ada')
      type(fixtureEl.querySelector('#city'), 'Paris')

      expect(submit(form)).toBeFalse()
      expect(name).toHaveClass('is-valid')
      expect(name.hasAttribute('aria-invalid')).toBeFalse()
    })

    it('should leave a form the browser validates alone', () => {
      const form = mountForm('data-coreui-validate')
      type(fixtureEl.querySelector('#name'), 'Ada')
      type(fixtureEl.querySelector('#city'), 'Paris')

      expect(submit(form)).toBeFalse()
      expect(Form.getInstance(form)).toBeNull()
    })

    it('should leave a form without data-coreui-validate alone', () => {
      const form = mountForm('novalidate')

      expect(submit(form)).toBeFalse()
      expect(Form.getInstance(form)).toBeNull()
      expect(fixtureEl.querySelector('#name')).not.toHaveClass('is-invalid')
    })

    it('should keep the state current while the user corrects the controls', () => {
      const form = mountForm()
      const name = fixtureEl.querySelector('#name')
      submit(form)

      type(name, 'Ada')

      expect(name).not.toHaveClass('is-invalid')
      expect(name.hasAttribute('aria-invalid')).toBeFalse()
      expect(name.hasAttribute('aria-describedby')).toBeFalse()

      type(name, '')

      expect(name).toHaveClass('is-invalid')
      expect(describedBy(name)).toBe('nameError')
    })

    it('should trigger validate.coreui.form with the validity', () => {
      const form = mountForm()
      const listener = vi.fn()
      form.addEventListener('validate.coreui.form', listener)

      submit(form)

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener.mock.calls[0][0].isValid).toBeFalse()
    })

    it('should leave the submit, the controls and the focus to a handler that prevents validate.coreui.form', () => {
      const form = mountForm()
      const button = fixtureEl.querySelector('#submit')
      form.addEventListener('validate.coreui.form', event => event.preventDefault())
      button.focus()

      expect(submit(form)).toBeFalse()
      expect(fixtureEl.querySelector('#name')).not.toHaveClass('is-invalid')
      expect(fixtureEl.querySelector('#name').hasAttribute('aria-invalid')).toBeFalse()
      expect(document.activeElement).toBe(button)

      type(fixtureEl.querySelector('#name'), 'Ada')
      type(fixtureEl.querySelector('#name'), '')

      expect(fixtureEl.querySelector('#name')).not.toHaveClass('is-invalid')
    })

    it('should block the submit when a handler of validate.coreui.form sets a custom validity', () => {
      const form = mountForm()
      const name = fixtureEl.querySelector('#name')
      type(name, 'Ada')
      type(fixtureEl.querySelector('#city'), 'Paris')
      form.addEventListener('validate.coreui.form', () => name.setCustomValidity('Taken'))

      expect(submit(form)).toBeTrue()
      expect(name).toHaveClass('is-invalid')
      expect(document.activeElement).toBe(name)
    })

    it('should let a submitter with formnovalidate through untouched', () => {
      const form = mountForm()
      form.insertAdjacentHTML('beforeend', '<button id="draft" type="submit" formnovalidate>Save draft</button>')
      let prevented
      form.addEventListener('submit', event => {
        prevented = event.defaultPrevented
        event.preventDefault()
      })

      form.requestSubmit(fixtureEl.querySelector('#draft'))

      expect(prevented).toBeFalse()
      expect(fixtureEl.querySelector('#name')).not.toHaveClass('is-invalid')
    })

    it('should keep a state class the page set', async () => {
      const form = mountForm()
      const city = fixtureEl.querySelector('#city')
      city.classList.add('is-invalid')
      type(city, 'Atlantis')

      submit(form)

      expect(city).toHaveClass('is-invalid')

      form.reset()
      await nextTask()

      expect(city).toHaveClass('is-invalid')
    })

    it('should leave focus where a handler of validate.coreui.form moved it', () => {
      fixtureEl.innerHTML = '<h2 id="summary" tabindex="-1">2 errors</h2>'
      const summary = fixtureEl.querySelector('#summary')
      const form = mountFormAfter(summary)
      form.addEventListener('validate.coreui.form', () => summary.focus())

      expect(submit(form)).toBeTrue()
      expect(fixtureEl.querySelector('#name')).toHaveClass('is-invalid')
      expect(document.activeElement).toBe(summary)
    })

    it('should clear the state when the form resets, unless the reset is prevented', async () => {
      const form = mountForm()
      const name = fixtureEl.querySelector('#name')
      submit(form)

      form.addEventListener('reset', event => event.preventDefault(), { once: true })
      form.reset()
      await nextTask()

      expect(name).toHaveClass('is-invalid')

      form.reset()
      await nextTask()

      expect(name).not.toHaveClass('is-invalid')
      expect(name.hasAttribute('aria-invalid')).toBeFalse()
      expect(name.hasAttribute('aria-describedby')).toBeFalse()

      type(name, '')

      expect(name).not.toHaveClass('is-invalid')
    })

    it('should keep the state of a submit made right after a reset', async () => {
      const form = mountForm()
      const name = fixtureEl.querySelector('#name')
      submit(form)

      form.reset()

      expect(submit(form)).toBeTrue()

      await nextTask()

      expect(name).toHaveClass('is-invalid')

      type(name, 'Ada')

      expect(name).not.toHaveClass('is-invalid')
    })

    it('should not throw when the instance is disposed while a reset is pending', async () => {
      const form = mountForm()
      submit(form)

      form.reset()
      Form.getInstance(form).dispose()
      await nextTask()

      expect(Form.getInstance(form)).toBeNull()
    })
  })

  describe('validate', () => {
    it('should show the state and tell whether the form is valid', () => {
      const form = mountForm()
      const instance = new Form(form)

      expect(instance.validate()).toBeFalse()
      expect(fixtureEl.querySelector('#name')).toHaveClass('is-invalid')

      type(fixtureEl.querySelector('#name'), 'Ada')
      type(fixtureEl.querySelector('#city'), 'Paris')

      expect(instance.validate()).toBeTrue()
    })
  })

  describe('reset', () => {
    it('should clear what the validation added and stop following the input', () => {
      const form = mountForm()
      const name = fixtureEl.querySelector('#name')
      name.setAttribute('aria-describedby', 'hint')
      const instance = new Form(form)
      instance.validate()

      instance.reset()

      expect(name).not.toHaveClass('is-invalid')
      expect(name.hasAttribute('aria-invalid')).toBeFalse()
      expect(describedBy(name)).toBe('hint')

      type(name, '')

      expect(name).not.toHaveClass('is-invalid')
    })
  })

  describe('dispose', () => {
    it('should clear the state and remove the instance', () => {
      const form = mountForm()
      const name = fixtureEl.querySelector('#name')
      const instance = new Form(form)
      instance.validate()

      instance.dispose()

      expect(Form.getInstance(form)).toBeNull()
      expect(name).not.toHaveClass('is-invalid')
      expect(name.hasAttribute('aria-invalid')).toBeFalse()

      type(name, '')

      expect(name).not.toHaveClass('is-invalid')
    })
  })

  describe('jQueryInterface', () => {
    it('should create a form instance and call a method', () => {
      const form = mountForm()

      jQueryMock.fn.form = Form.jQueryInterface
      jQueryMock.elements = [form]

      jQueryMock.fn.form.call(jQueryMock, 'validate')

      expect(Form.getInstance(form)).not.toBeNull()
      expect(fixtureEl.querySelector('#name')).toHaveClass('is-invalid')
    })

    it('should throw an error on an undefined method', () => {
      const form = mountForm()

      jQueryMock.fn.form = Form.jQueryInterface
      jQueryMock.elements = [form]

      expect(() => {
        jQueryMock.fn.form.call(jQueryMock, 'noMethod')
      }).toThrowError(TypeError, 'No method named "noMethod"')
    })
  })

  describe('getInstance', () => {
    it('should return the form instance, or null when there is none', () => {
      const form = mountForm()

      expect(Form.getInstance(form)).toBeNull()

      const instance = new Form(form)

      expect(Form.getInstance(form)).toEqual(instance)
    })
  })

  describe('getOrCreateInstance', () => {
    it('should return the form instance, creating it when there is none', () => {
      const form = mountForm()
      const instance = Form.getOrCreateInstance(form)

      expect(instance).toBeInstanceOf(Form)
      expect(Form.getOrCreateInstance(form)).toEqual(instance)
    })
  })

  function mountFormAfter(element) {
    element.insertAdjacentHTML('afterend', `<form data-coreui-validate novalidate>
      <input id="name" required><div class="invalid-feedback">Enter your name.</div>
    </form>`)

    return fixtureEl.querySelector('form')
  }
})

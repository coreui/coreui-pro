import PasswordStrength from '../../src/password-strength.js'
import { getFixture, clearFixture } from '../helpers/fixture.js'

describe('PasswordStrength', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const setup = (config = {}, value = '') => {
    fixtureEl.innerHTML = [
      `<input type="password" class="form-control" value="${value}">`,
      '<div></div>'
    ].join('')

    const input = fixtureEl.querySelector('input')
    const element = fixtureEl.querySelector('div')
    const instance = new PasswordStrength(element, { debounce: 0, ...config })

    return { element, input, instance }
  }

  const type = (input, value) => {
    input.value = value
    input.dispatchEvent(new Event('input'))
  }

  describe('markup', () => {
    it('should build the meter and the feedback region', () => {
      const { element } = setup()

      expect(element.classList.contains('password-strength')).toBeTrue()
      expect(element.querySelectorAll('.password-strength-segment').length).toBe(4)

      const meter = element.querySelector('.password-strength-meter')
      const feedback = element.querySelector('.password-strength-feedback')

      expect(meter.getAttribute('aria-hidden')).toBe('true')
      expect(feedback.getAttribute('role')).toBe('status')
      expect(feedback.getAttribute('aria-live')).toBe('polite')
    })

    it('should build one segment fewer than there are levels', () => {
      const { element } = setup({ levels: ['None', 'Low', 'High'] })

      expect(element.querySelectorAll('.password-strength-segment').length).toBe(2)
    })
  })

  describe('built-in scorer', () => {
    it('should show nothing for an empty password', () => {
      const { element, instance } = setup()

      expect(instance.getScore()).toBeNull()
      expect(element.querySelector('.password-strength-text').textContent).toBe('')
      expect(element.dataset.coreuiStrength).toBeUndefined()
    })

    it('should score a strong password higher than a weak one', () => {
      const { input, instance } = setup()

      type(input, 'abc')
      const weak = instance.getScore()

      type(input, 'Str0ng!&Passphrase99')
      const strong = instance.getScore()

      expect(strong).toBeGreaterThan(weak)
    })

    it('should activate one segment per score point', () => {
      const { element, input, instance } = setup()

      type(input, 'Str0ng!&Passphrase99')

      const active = element.querySelectorAll('.password-strength-segment.active')

      expect(active.length).toBe(instance.getScore())
    })

    it('should reject a password that contains a user input', () => {
      const { input, instance } = setup({ userInputs: ['ada.lovelace@example.com'] })

      type(input, 'Ada.Lovelace@example.com!99')

      expect(instance.getScore()).toBe(0)
    })

    it('should read user inputs from a function on every evaluation', () => {
      let current = ['nothing']
      const { input, instance } = setup({ userInputs: () => current })

      type(input, 'Str0ng!&Passphrase99')
      expect(instance.getScore()).toBeGreaterThan(0)

      current = ['Str0ng!&Passphrase99']
      type(input, 'Str0ng!&Passphrase99x')

      expect(instance.getScore()).toBe(0)
    })
  })

  describe('custom scorer', () => {
    it('should accept a bare number', () => {
      const { element, input, instance } = setup({ scorer: () => 3 })

      type(input, 'anything')

      expect(instance.getScore()).toBe(3)
      expect(element.querySelector('.password-strength-text').textContent).toBe('Good')
    })

    it('should accept an object with a warning and suggestions', () => {
      const { element, input } = setup({
        scorer: () => ({
          score: 1,
          warning: 'This is a top-10 common password.',
          suggestions: ['Add another word or two.', 'Avoid common phrases.']
        })
      })

      type(input, 'password')

      expect(element.querySelector('.password-strength-warning').textContent)
        .toBe('This is a top-10 common password.')
      expect(element.querySelectorAll('.password-strength-suggestions li').length).toBe(2)
    })

    it('should receive the password and the user inputs', () => {
      const calls = []
      const { input } = setup({
        scorer(password, userInputs) {
          calls.push([password, userInputs])
          return 2
        },
        userInputs: ['ada']
      })

      type(input, 'secret')

      expect(calls.at(-1)).toEqual(['secret', ['ada']])
    })

    it('should clamp a score outside the level range', () => {
      const { input, instance } = setup({ scorer: () => 99 })

      type(input, 'anything')

      expect(instance.getScore()).toBe(4)
    })

    it('should clear the score when the scorer throws', () => {
      const { input, instance } = setup({
        scorer() {
          throw new Error('boom')
        }
      })

      type(input, 'anything')

      expect(instance.getScore()).toBeNull()
    })
  })

  describe('async scorer', () => {
    it('should show the busy state while a promise is pending', async () => {
      let resolve
      const { element, input } = setup({
        scorer: () => new Promise(r => {
          resolve = r
        })
      })

      type(input, 'anything')

      expect(element.classList.contains('password-strength-busy')).toBeTrue()
      expect(element.querySelector('.password-strength-text').textContent).toBe('Checking…')

      resolve(4)
      await Promise.resolve()

      expect(element.classList.contains('password-strength-busy')).toBeFalse()
    })

    it('should not show the busy state for a synchronous scorer', () => {
      const { element, input } = setup({ scorer: () => 2 })

      type(input, 'anything')

      expect(element.classList.contains('password-strength-busy')).toBeFalse()
    })

    it('should ignore a stale result that resolves after a newer one', async () => {
      const resolvers = []
      const { input, instance } = setup({
        scorer: () => new Promise(resolve => {
          resolvers.push(resolve)
        })
      })

      type(input, 'a')
      type(input, 'ab')

      expect(resolvers.length).toBe(2)

      // The newer request answers first, then the older one arrives late.
      resolvers[1](4)
      await Promise.resolve()
      resolvers[0](0)
      await Promise.resolve()

      expect(instance.getScore()).toBe(4)
    })

    it('should clear the score when the promise rejects', async () => {
      const { input, instance } = setup({ scorer: () => Promise.reject(new Error('offline')) })

      type(input, 'anything')
      await Promise.resolve()
      await Promise.resolve()

      expect(instance.getScore()).toBeNull()
    })
  })

  describe('event', () => {
    it('should mask the password it reports', () => {
      const { element, input } = setup()
      const payloads = []

      element.addEventListener('change.coreui.password-strength', event => {
        payloads.push(event)
      })

      type(input, 'Str0ng!&Passphrase99')

      expect(payloads.length).toBe(1)
      expect(payloads[0].password).toBe('***')
      expect(payloads[0].score).toBeGreaterThan(0)
      expect(payloads[0].level).toBe('Strong')
    })

    it('should not fire again while the score is unchanged', () => {
      const { element, input } = setup({ scorer: () => 2 })
      let count = 0

      element.addEventListener('change.coreui.password-strength', () => {
        count += 1
      })

      type(input, 'one')
      type(input, 'two')
      type(input, 'three')

      expect(count).toBe(1)
    })
  })

  describe('debounce', () => {
    it('should evaluate once for a burst of input', async () => {
      let calls = 0
      const { input, instance } = setup({
        debounce: 20,
        scorer() {
          calls += 1
          return 2
        }
      })

      type(input, 'a')
      type(input, 'ab')
      type(input, 'abc')

      expect(calls).toBe(0)

      await new Promise(resolve => {
        setTimeout(resolve, 50)
      })

      expect(calls).toBe(1)
      expect(instance.getScore()).toBe(2)
    })
  })

  describe('dispose', () => {
    it('should remove what it built and stop listening', () => {
      const { element, input, instance } = setup()

      instance.dispose()

      expect(element.querySelector('.password-strength-meter')).toBeNull()
      expect(element.querySelector('.password-strength-feedback')).toBeNull()
      expect(element.classList.contains('password-strength')).toBeFalse()

      type(input, 'Str0ng!&Passphrase99')

      expect(element.querySelector('.password-strength-text')).toBeNull()
    })
  })

  describe('data api', () => {
    it('should find the preceding password input when none is configured', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <input type="password" class="form-control" value="Str0ng!&Passphrase99">',
        '  <div id="meter" data-coreui-toggle="password-strength"></div>',
        '</div>'
      ].join('')

      const instance = new PasswordStrength(fixtureEl.querySelector('#meter'))

      expect(instance.getScore()).toBeGreaterThan(0)
    })

    it('should use the configured input selector', () => {
      fixtureEl.innerHTML = [
        '<input type="password" id="pw" value="Str0ng!&Passphrase99">',
        '<section><div id="meter"></div></section>'
      ].join('')

      const instance = new PasswordStrength(fixtureEl.querySelector('#meter'), { input: '#pw' })

      expect(instance.getScore()).toBeGreaterThan(0)
    })
  })
})

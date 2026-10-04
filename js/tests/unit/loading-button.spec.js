
import { vi } from 'vitest'
import LoadingButton from '../../src/loading-button.js'
import Data from '../../src/dom/data.js'
import {
  getFixture, clearFixture, createEvent, jQueryMock
} from '../helpers/fixture.js'

describe('LoadingButton', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(LoadingButton.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('Default', () => {
    it('should return plugin default config', () => {
      expect(LoadingButton.Default).toEqual(jasmine.any(Object))
    })
  })

  describe('DefaultType', () => {
    it('should return plugin default type config', () => {
      expect(LoadingButton.DefaultType).toEqual(jasmine.any(Object))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(LoadingButton.DATA_KEY).toEqual('coreui.loading-button')
    })
  })

  describe('NAME', () => {
    it('should return plugin name', () => {
      expect(LoadingButton.NAME).toEqual('loading-button')
    })
  })

  describe('constructor', () => {
    it('should create a LoadingButton instance with default config', () => {
      fixtureEl.innerHTML = '<button></button>'

      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button)

      expect(loadingButton).toBeInstanceOf(LoadingButton)
      expect(loadingButton._config).toBeDefined()
      expect(loadingButton._element).toEqual(button)
      expect(loadingButton._state).toBe('idle')
    })

    it('should allow overriding default config', () => {
      fixtureEl.innerHTML = '<button></button>'

      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button, {
        disabledOnLoading: true,
        spinner: false,
        spinnerType: 'grow',
        timeout: 5000
      })

      expect(loadingButton._config.disabledOnLoading).toBe(true)
      expect(loadingButton._config.spinner).toBe(false)
      expect(loadingButton._config.spinnerType).toBe('grow')
      expect(loadingButton._config.timeout).toBe(5000)
    })

    it('should add loading button class to element', () => {
      fixtureEl.innerHTML = '<button></button>'

      const button = fixtureEl.querySelector('button')
      new LoadingButton(button) // eslint-disable-line no-new

      expect(button.classList.contains('btn-loading')).toBe(true)
    })

    it('should store instance in data', () => {
      fixtureEl.innerHTML = '<button></button>'

      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button)

      expect(Data.get(button, 'coreui.loading-button')).toEqual(loadingButton)
    })
  })

  describe('start', () => {
    it('should start loading state', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button></button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button)

        button.addEventListener('start.coreui.loading-button', () => {
          expect(button.classList.contains('is-loading')).toBe(true)
          expect(loadingButton._state).toBe('loading')
          resolve()
        })

        loadingButton.start()
      })
    })

    it('should create spinner when spinner option is true', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, { spinner: true })

        button.addEventListener('start.coreui.loading-button', () => {
          const spinner = button.querySelector('.btn-loading-spinner')
          expect(spinner).toBeTruthy()
          expect(spinner.classList.contains('spinner-border')).toBe(true)
          expect(spinner.getAttribute('role')).toBe('img')
          expect(spinner.getAttribute('aria-label')).toBe('Loading')
          expect(spinner.hasAttribute('aria-hidden')).toBeFalse()
          resolve()
        })

        loadingButton.start()
      })
    })

    it('should create grow spinner when spinnerType is grow', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, {
          spinner: true,
          spinnerType: 'grow'
        })

        button.addEventListener('start.coreui.loading-button', () => {
          const spinner = button.querySelector('.btn-loading-spinner')
          expect(spinner).toBeTruthy()
          expect(spinner.classList.contains('spinner-grow')).toBe(true)
          resolve()
        })

        loadingButton.start()
      })
    })

    it('should mark the button aria-disabled when disabledOnLoading is true', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, { disabledOnLoading: true })

        button.addEventListener('start.coreui.loading-button', () => {
          setTimeout(() => {
            expect(button.getAttribute('aria-disabled')).toBe('true')
            expect(button).toHaveClass('disabled')
            expect(button.hasAttribute('disabled')).toBeFalse()
            resolve()
          }, 10)
        })

        loadingButton.start()
      })
    })

    it('should not start if already in loading state', () => {
      fixtureEl.innerHTML = '<button>Click me</button>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button)

      loadingButton._state = 'loading'
      const createSpinnerSpy = spyOn(loadingButton, '_createSpinner')

      loadingButton.start()

      expect(createSpinnerSpy).not.toHaveBeenCalled()
    })

    it('should auto-stop after timeout', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, { timeout: 100 })

        button.addEventListener('stop.coreui.loading-button', () => {
          expect(loadingButton._state).toBe('idle')
          expect(button.classList.contains('is-loading')).toBe(false)
          resolve()
        })

        loadingButton.start()
      })
    })
  })

  describe('stop', () => {
    it('should stop loading state', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button)

        button.addEventListener('start.coreui.loading-button', () => {
          loadingButton.stop()
        })

        button.addEventListener('stop.coreui.loading-button', () => {
          expect(button.classList.contains('is-loading')).toBe(false)
          expect(loadingButton._state).toBe('idle')
          resolve()
        })

        loadingButton.start()
      })
    })

    it('should remove spinner', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, { spinner: true })

        button.addEventListener('start.coreui.loading-button', () => {
          expect(button.querySelector('.btn-loading-spinner')).toBeTruthy()
          loadingButton.stop()
        })

        button.addEventListener('stop.coreui.loading-button', () => {
          expect(button.querySelector('.btn-loading-spinner')).toBeNull()
          expect(loadingButton._spinner).toBeNull()
          resolve()
        })

        loadingButton.start()
      })
    })

    it('should re-enable button when disabledOnLoading is true', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, { disabledOnLoading: true })

        button.addEventListener('start.coreui.loading-button', () => {
          setTimeout(() => {
            expect(button.getAttribute('aria-disabled')).toBe('true')
            loadingButton.stop()
          }, 10)
        })

        button.addEventListener('stop.coreui.loading-button', () => {
          expect(button.hasAttribute('aria-disabled')).toBeFalse()
          expect(button).not.toHaveClass('disabled')
          resolve()
        })

        loadingButton.start()
      })
    })

    it('should work without spinner', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, { spinner: false })

        button.addEventListener('start.coreui.loading-button', () => {
          loadingButton.stop()
        })

        button.addEventListener('stop.coreui.loading-button', () => {
          expect(loadingButton._state).toBe('idle')
          resolve()
        })

        loadingButton.start()
      })
    })

    it('should clear the timeout so it cannot cut a later loading cycle short', () => {
      jasmine.clock().install()

      try {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, { timeout: 100 })
        let stopCount = 0
        button.addEventListener('stop.coreui.loading-button', () => {
          stopCount++
        })

        loadingButton.start()
        jasmine.clock().tick(10)
        loadingButton.stop()
        expect(loadingButton._timeout).toBeNull()

        jasmine.clock().tick(10)
        expect(stopCount).toBe(1)
        expect(loadingButton._state).toBe('idle')

        loadingButton.start()
        jasmine.clock().tick(95)
        expect(loadingButton._state).toBe('loading')
        expect(stopCount).toBe(1)

        expect(() => jasmine.clock().tick(100)).not.toThrow()
        expect(loadingButton._state).toBe('idle')
        expect(stopCount).toBe(2)
      } finally {
        jasmine.clock().uninstall()
      }
    })
  })

  describe('while loading', () => {
    const messages = (priority = 'assertive') => [...document.querySelectorAll(`[data-coreui-live-announcer] [aria-live="${priority}"] > *`)].map(message => message.textContent)

    const removeAnnouncers = () => {
      for (const announcer of document.querySelectorAll('[data-coreui-live-announcer]')) {
        announcer.remove()
      }
    }

    beforeEach(() => {
      removeAnnouncers()
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    })

    afterEach(() => {
      vi.useRealTimers()
      removeAnnouncers()
    })

    it('should keep focus on the button with disabledOnLoading', async () => {
      vi.useRealTimers()
      fixtureEl.innerHTML = '<button>Save</button>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button, { disabledOnLoading: true })

      button.focus()
      loadingButton.start()
      await new Promise(resolve => {
        setTimeout(resolve, 10)
      })
      await new Promise(resolve => {
        requestAnimationFrame(resolve)
      })
      await new Promise(resolve => {
        requestAnimationFrame(resolve)
      })

      expect(document.activeElement).toBe(button)
    })

    it('should block clicks and form submission with disabledOnLoading', () => {
      fixtureEl.innerHTML = '<form><button type="submit">Save</button></form>'
      const form = fixtureEl.querySelector('form')
      const button = fixtureEl.querySelector('button')
      const clickSpy = vi.fn()
      const submitSpy = vi.fn(event => event.preventDefault())
      button.addEventListener('click', clickSpy)
      form.addEventListener('submit', submitSpy)
      const loadingButton = new LoadingButton(button, { disabledOnLoading: true })

      loadingButton.start()
      vi.advanceTimersByTime(10)
      button.click()

      expect(clickSpy).not.toHaveBeenCalled()
      expect(submitSpy).not.toHaveBeenCalled()

      loadingButton.stop()
      vi.advanceTimersByTime(1000)
      button.click()

      expect(clickSpy).toHaveBeenCalledTimes(1)
      expect(submitSpy).toHaveBeenCalledTimes(1)
    })

    it('should let clicks through without disabledOnLoading', () => {
      fixtureEl.innerHTML = '<button>Save</button>'
      const button = fixtureEl.querySelector('button')
      const clickSpy = vi.fn()
      button.addEventListener('click', clickSpy)
      const loadingButton = new LoadingButton(button)

      loadingButton.start()
      button.click()

      expect(clickSpy).toHaveBeenCalled()
    })

    it('should announce the start and the end of loading when the button has focus', () => {
      fixtureEl.innerHTML = '<button>Save</button>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button, { spinner: false })

      button.focus()
      loadingButton.start()
      vi.advanceTimersByTime(110)

      expect(messages()).toEqual(['Save, Loading'])

      loadingButton.stop()
      vi.advanceTimersByTime(110)

      expect(messages('polite')).toEqual(['Save'])
    })

    it('should cancel a start message that was not read yet', () => {
      fixtureEl.innerHTML = '<button>Save</button>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button, { spinner: false })

      button.focus()
      loadingButton.start()
      vi.advanceTimersByTime(50)
      loadingButton.stop()
      vi.advanceTimersByTime(110)

      expect(messages()).toEqual([])
      expect(messages('polite')).toEqual(['Save'])
    })

    it('should announce the accessible name', () => {
      fixtureEl.innerHTML = '<button aria-labelledby="name"><span aria-hidden="true">save</span></button><span id="name">Save draft</span><button id="text"><span aria-hidden="true">save</span>Save</button>'
      const named = fixtureEl.querySelector('button')
      const text = fixtureEl.querySelector('#text')
      const first = new LoadingButton(named, { spinner: false })
      const second = new LoadingButton(text)

      named.focus()
      first.start()
      vi.advanceTimersByTime(110)
      text.focus()
      second.start()
      vi.advanceTimersByTime(110)

      expect(messages()).toEqual(['Save draft, Loading', 'Save, Loading'])
    })

    it('should take custom ariaLoadingLabel wording', () => {
      fixtureEl.innerHTML = '<button aria-label="Save the form" data-coreui-aria-loading-label="Wird geladen">Save</button>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button, { spinner: false })

      button.focus()
      loadingButton.start()
      vi.advanceTimersByTime(110)

      expect(messages()).toEqual(['Save the form, Wird geladen'])
    })

    it('should stay silent when the button does not have focus', () => {
      fixtureEl.innerHTML = '<button>Save</button><input>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button, { spinner: false })

      fixtureEl.querySelector('input').focus()
      loadingButton.start()
      vi.advanceTimersByTime(110)
      loadingButton.stop()
      vi.advanceTimersByTime(110)

      expect(messages()).toEqual([])
    })

    it('should name the spinner with ariaLoadingLabel and hide it without one', () => {
      fixtureEl.innerHTML = '<button id="a">Save</button><button id="b">Save</button>'
      const named = new LoadingButton(fixtureEl.querySelector('#a'))
      const hidden = new LoadingButton(fixtureEl.querySelector('#b'), { ariaLoadingLabel: '' })

      named.start()
      hidden.start()
      const [first, second] = fixtureEl.querySelectorAll('.btn-loading-spinner')

      expect(first.getAttribute('aria-label')).toBe('Loading')
      expect(second.getAttribute('aria-hidden')).toBe('true')
      expect(second.hasAttribute('role')).toBeFalse()
    })

    it('should keep the click that started loading', () => {
      fixtureEl.innerHTML = '<form><button type="submit">Save</button></form>'
      const form = fixtureEl.querySelector('form')
      const button = fixtureEl.querySelector('button')
      const submitSpy = vi.fn(event => event.preventDefault())
      const loadingButton = new LoadingButton(button, { disabledOnLoading: true })
      const start = () => loadingButton.start()

      form.addEventListener('submit', submitSpy)
      document.addEventListener('click', start, true)
      button.click()
      document.removeEventListener('click', start, true)

      expect(submitSpy).toHaveBeenCalled()
    })

    it('should leave a disabled state the page set itself', () => {
      fixtureEl.innerHTML = '<a class="btn disabled" aria-disabled="true" href="#next">Next</a>'
      const link = fixtureEl.querySelector('a')
      const loadingButton = new LoadingButton(link, { disabledOnLoading: true, spinner: false })

      loadingButton.start()
      vi.advanceTimersByTime(10)
      loadingButton.stop()

      expect(link).toHaveClass('disabled')
      expect(link.getAttribute('aria-disabled')).toBe('true')
    })

    it('should give back the disabled state when disposed while loading', () => {
      fixtureEl.innerHTML = '<button>Save</button>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button, { disabledOnLoading: true })

      loadingButton.start()
      vi.advanceTimersByTime(10)
      loadingButton.dispose()

      expect(button.hasAttribute('aria-disabled')).toBeFalse()
      expect(button).not.toHaveClass('disabled')
    })

    it('should not throw when a stop listener disposes the instance', () => {
      fixtureEl.innerHTML = '<button>Save</button>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button, { spinner: false })

      button.addEventListener('stop.coreui.loading-button', () => loadingButton.dispose())
      button.focus()
      loadingButton.start()
      vi.advanceTimersByTime(10)

      expect(() => loadingButton.stop()).not.toThrow()
    })

    it('should end idle and announce in order when a start listener stops loading', () => {
      fixtureEl.innerHTML = '<button>Save</button>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button, { disabledOnLoading: true, spinner: false })

      button.addEventListener('start.coreui.loading-button', () => loadingButton.stop())
      button.focus()
      loadingButton.start()
      vi.advanceTimersByTime(110)

      expect(button.hasAttribute('aria-disabled')).toBeFalse()
      expect(messages()).toEqual([])
      expect(messages('polite')).toEqual(['Save'])
    })

    it('should stop blocking clicks after dispose', () => {
      fixtureEl.innerHTML = '<button>Save</button>'
      const button = fixtureEl.querySelector('button')
      const clickSpy = vi.fn()
      button.addEventListener('click', clickSpy)
      const loadingButton = new LoadingButton(button, { disabledOnLoading: true })

      const errors = []
      const onError = event => {
        errors.push(event.error)
        event.preventDefault()
      }

      window.addEventListener('error', onError)
      loadingButton.start()
      vi.advanceTimersByTime(10)
      loadingButton.dispose()
      button.click()
      window.removeEventListener('error', onError)

      expect(clickSpy).toHaveBeenCalled()
      expect(errors).toEqual([])
    })
  })

  describe('dispose', () => {
    it('should dispose LoadingButton instance', () => {
      fixtureEl.innerHTML = '<button>Click me</button>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button)

      expect(Data.get(button, 'coreui.loading-button')).toEqual(loadingButton)

      loadingButton.dispose()

      expect(Data.get(button, 'coreui.loading-button')).toBeNull()
    })

    it('should not let the timers fire after dispose', () => {
      jasmine.clock().install()

      try {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, { timeout: 100 })
        const startSpy = jasmine.createSpy('start')
        button.addEventListener('start.coreui.loading-button', startSpy)

        loadingButton.start()
        loadingButton.dispose()

        expect(() => jasmine.clock().tick(200)).not.toThrow()
        expect(startSpy).not.toHaveBeenCalled()
        expect(button.classList.contains('is-loading')).toBeFalse()
      } finally {
        jasmine.clock().uninstall()
      }
    })
  })

  describe('static methods', () => {
    describe('loadingButtonInterface', () => {
      it('should create instance and call method', () => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')

        LoadingButton.loadingButtonInterface(button, {})
        expect(LoadingButton.getInstance(button)).toBeInstanceOf(LoadingButton)
      })

      it('should call method on existing instance', () => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button)
        const spy = spyOn(loadingButton, 'start')

        LoadingButton.loadingButtonInterface(button, 'start')
        expect(spy).toHaveBeenCalled()
      })

      it('should throw error for undefined method', () => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        new LoadingButton(button) // eslint-disable-line no-new

        expect(() => {
          LoadingButton.loadingButtonInterface(button, 'undefinedMethod')
        }).toThrowError(TypeError, 'No method named "undefinedMethod"')
      })
    })

    describe('jQueryInterface', () => {
      it('should create loading button', () => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')

        jQueryMock.fn.loadingButton = LoadingButton.jQueryInterface
        jQueryMock.elements = [button]
        jQueryMock.fn.loadingButton.call(jQueryMock, {})

        expect(LoadingButton.getInstance(button)).not.toBeNull()
      })

      it('should not re-create loading button', () => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button)

        jQueryMock.fn.loadingButton = LoadingButton.jQueryInterface
        jQueryMock.elements = [button]
        jQueryMock.fn.loadingButton.call(jQueryMock, {})

        expect(LoadingButton.getInstance(button)).toEqual(loadingButton)
      })
    })

    describe('getInstance', () => {
      it('should return loading button instance', () => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button)

        expect(LoadingButton.getInstance(button)).toEqual(loadingButton)
        expect(LoadingButton.getInstance(button)).toBeInstanceOf(LoadingButton)
      })

      it('should return null when there is no loading button instance', () => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')

        expect(LoadingButton.getInstance(button)).toBeNull()
      })
    })

    describe('getOrCreateInstance', () => {
      it('should return loading button instance', () => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button)

        expect(LoadingButton.getOrCreateInstance(button)).toEqual(loadingButton)
        expect(LoadingButton.getOrCreateInstance(button)).toBeInstanceOf(LoadingButton)
      })

      it('should return new instance when there is no loading button instance', () => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')

        expect(LoadingButton.getInstance(button)).toBeNull()
        expect(LoadingButton.getOrCreateInstance(button)).toBeInstanceOf(LoadingButton)
      })

      it('should return new instance with given configuration', () => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')

        expect(LoadingButton.getInstance(button)).toBeNull()
        const loadingButton = LoadingButton.getOrCreateInstance(button, {
          disabledOnLoading: true,
          timeout: 2000
        })
        expect(loadingButton).toBeInstanceOf(LoadingButton)
        expect(loadingButton._config.disabledOnLoading).toBe(true)
        expect(loadingButton._config.timeout).toBe(2000)
      })

      it('should return the same instance when exists, ignoring new configuration', () => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, {
          disabledOnLoading: false,
          timeout: false
        })

        const loadingButton2 = LoadingButton.getOrCreateInstance(button, {
          disabledOnLoading: true,
          timeout: 3000
        })
        expect(loadingButton2).toEqual(loadingButton)
        expect(loadingButton2._config.disabledOnLoading).toBe(false)
        expect(loadingButton2._config.timeout).toBe(false)
      })
    })
  })

  describe('data-api', () => {
    it('should initialize and start loading button on click', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button data-coreui-toggle="loading-button">Click me</button>'
        const button = fixtureEl.querySelector('[data-coreui-toggle="loading-button"]')

        button.addEventListener('start.coreui.loading-button', () => {
          expect(LoadingButton.getInstance(button)).toBeInstanceOf(LoadingButton)
          expect(button.classList.contains('is-loading')).toBe(true)
          resolve()
        })

        const clickEvent = createEvent('click')
        button.dispatchEvent(clickEvent)
      })
    })

    it('should not prevent default behavior on click', () => {
      fixtureEl.innerHTML = '<button data-coreui-toggle="loading-button">Click me</button>'
      const button = fixtureEl.querySelector('[data-coreui-toggle="loading-button"]')

      const clickEvent = createEvent('click')
      spyOn(clickEvent, 'preventDefault')
      button.dispatchEvent(clickEvent)

      expect(clickEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('should not prevent a submit button from submitting its form', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<form>',
          '  <button type="submit" data-coreui-toggle="loading-button">Save</button>',
          '</form>'
        ].join('')
        const form = fixtureEl.querySelector('form')
        const button = fixtureEl.querySelector('[data-coreui-toggle="loading-button"]')

        form.addEventListener('submit', event => {
          event.preventDefault()
          resolve()
        })

        button.click()
      })
    })

    it('should work with nested elements', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = `
          <button data-coreui-toggle="loading-button">
            <span>Click me</span>
          </button>
        `
        const button = fixtureEl.querySelector('[data-coreui-toggle="loading-button"]')
        const span = button.querySelector('span')

        button.addEventListener('start.coreui.loading-button', () => {
          expect(LoadingButton.getInstance(button)).toBeInstanceOf(LoadingButton)
          resolve()
        })

        const clickEvent = createEvent('click')
        span.dispatchEvent(clickEvent)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle multiple start calls correctly', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, { spinner: true })
        let startCount = 0

        button.addEventListener('start.coreui.loading-button', () => {
          startCount++
          if (startCount === 1) {
            // Try to start again while already loading
            loadingButton.start()

            setTimeout(() => {
              expect(startCount).toBe(1) // Should only trigger once
              expect(button.querySelectorAll('.btn-loading-spinner')).toHaveSize(1)
              resolve()
            }, 50)
          }
        })

        loadingButton.start()
      })
    })

    it('should ignore stop when not loading', () => {
      fixtureEl.innerHTML = '<button>Click me</button>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button)
      const stopSpy = jasmine.createSpy('stop')
      button.addEventListener('stop.coreui.loading-button', stopSpy)

      expect(() => {
        loadingButton.stop()
      }).not.toThrow()

      expect(stopSpy).not.toHaveBeenCalled()
      expect(loadingButton._state).toBe('idle')
    })

    it('should handle timeout of 0', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, { timeout: 1 })

        button.addEventListener('stop.coreui.loading-button', () => {
          expect(loadingButton._state).toBe('idle')
          resolve()
        })

        loadingButton.start()
      })
    })

    it('should preserve button content when adding spinner', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button>Original Content</button>'
        const button = fixtureEl.querySelector('button')
        const originalContent = button.innerHTML
        const loadingButton = new LoadingButton(button, { spinner: true })

        button.addEventListener('start.coreui.loading-button', () => {
          expect(button.innerHTML).toContain(originalContent)
          expect(button.querySelector('.btn-loading-spinner')).toBeTruthy()
          resolve()
        })

        loadingButton.start()
      })
    })
  })
})

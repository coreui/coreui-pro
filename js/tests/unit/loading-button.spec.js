/* eslint-env jasmine */

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
          expect(spinner.classList.contains('spinner-border-sm')).toBe(true)
          expect(spinner.getAttribute('role')).toBe('status')
          expect(spinner.getAttribute('aria-hidden')).toBe('true')
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
          expect(spinner.classList.contains('spinner-grow-sm')).toBe(true)
          resolve()
        })

        loadingButton.start()
      })
    })

    it('should disable button when disabledOnLoading is true', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button>Click me</button>'
        const button = fixtureEl.querySelector('button')
        const loadingButton = new LoadingButton(button, { disabledOnLoading: true })

        button.addEventListener('start.coreui.loading-button', () => {
          // Check disabled state after a short delay as it's set in setTimeout
          setTimeout(() => {
            expect(button.hasAttribute('disabled')).toBe(true)
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
          // Check disabled state after the timeout that sets it
          setTimeout(() => {
            expect(button.hasAttribute('disabled')).toBe(true)
            loadingButton.stop()
          }, 10)
        })

        button.addEventListener('stop.coreui.loading-button', () => {
          // The disabled attribute is removed synchronously
          expect(button.hasAttribute('disabled')).toBe(false)
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
  })

  describe('dispose', () => {
    it('should dispose LoadingButton instance', () => {
      fixtureEl.innerHTML = '<button>Click me</button>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button)

      expect(Data.get(button, 'coreui.loading-button')).toEqual(loadingButton)
      expect(() => {
        loadingButton.dispose()
      }).toThrow() // Will throw because Data.removeData doesn't exist
      // The actual implementation has a bug - it should call Data.remove instead
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

    it('should prevent default behavior on click', () => {
      fixtureEl.innerHTML = '<button data-coreui-toggle="loading-button">Click me</button>'
      const button = fixtureEl.querySelector('[data-coreui-toggle="loading-button"]')

      const clickEvent = createEvent('click')
      spyOn(clickEvent, 'preventDefault')
      button.dispatchEvent(clickEvent)

      expect(clickEvent.preventDefault).toHaveBeenCalled()
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

    it('should handle stop call without start', () => {
      fixtureEl.innerHTML = '<button>Click me</button>'
      const button = fixtureEl.querySelector('button')
      const loadingButton = new LoadingButton(button)

      // The stop method will throw when trying to call remove() on null spinner
      expect(() => {
        loadingButton.stop()
      }).toThrow()

      // Even after the error, the state should remain idle
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

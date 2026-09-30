import SearchButton from '../../src/search-button.js'
import { clearFixture, getFixture, jQueryMock } from '../helpers/fixture.js'

describe('SearchButton', () => {
  let fixtureEl
  let originalPlatform
  let originalUserAgent
  let originalUserAgentData

  beforeAll(() => {
    fixtureEl = getFixture()
    originalPlatform = window.navigator.platform
    originalUserAgent = window.navigator.userAgent
    originalUserAgentData = window.navigator.userAgentData
  })

  afterEach(() => {
    clearFixture()
    Object.defineProperty(window.navigator, 'platform', {
      configurable: true,
      get: () => originalPlatform
    })
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      get: () => originalUserAgent
    })
    Object.defineProperty(window.navigator, 'userAgentData', {
      configurable: true,
      get: () => originalUserAgentData
    })
  })

  it('should take care of element either passed as a CSS selector or DOM element', () => {
    fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'

    const buttonEl = fixtureEl.querySelector('button')
    const buttonBySelector = new SearchButton('[data-coreui-search-button]')
    expect(buttonBySelector._element).toEqual(buttonEl)

    const buttonByElement = new SearchButton(buttonEl)
    expect(buttonByElement._element).toEqual(buttonEl)
  })

  describe('Default', () => {
    it('should return default configuration', () => {
      expect(SearchButton.Default).toEqual(jasmine.objectContaining({
        preventDefault: true,
        shortcut: 'meta+/,ctrl+/'
      }))
    })
  })

  describe('shortcut label', () => {
    it('should render the macOS shortcut label by default on macOS', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button>',
        '  <span class="search-button-placeholder">Search</span>',
        '</button>'
      ].join('')

      Object.defineProperty(window.navigator, 'platform', {
        configurable: true,
        get: () => 'MacIntel'
      })

      Object.defineProperty(window.navigator, 'userAgentData', {
        configurable: true,
        get: () => ({ platform: 'macOS' })
      })

      const buttonEl = fixtureEl.querySelector('button')
      // eslint-disable-next-line no-new
      new SearchButton(buttonEl, { shortcut: 'meta+k,ctrl+k' })

      expect(buttonEl.querySelector('.search-button-keys')).not.toBeNull()
      expect(buttonEl.querySelector('.search-button-keys').getAttribute('aria-hidden')).toEqual('true')
      expect(buttonEl.querySelectorAll('.search-button-key')).toHaveSize(2)
      expect(Array.from(buttonEl.querySelectorAll('.search-button-key')).map(element => element.textContent)).toEqual(['⌘', 'K'])
    })

    it('should detect macOS from userAgent when platform is not helpful', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button>',
        '  <span class="search-button-placeholder">Search</span>',
        '</button>'
      ].join('')

      Object.defineProperty(window.navigator, 'platform', {
        configurable: true,
        get: () => ''
      })
      Object.defineProperty(window.navigator, 'userAgentData', {
        configurable: true,
        get: () => undefined
      })
      Object.defineProperty(window.navigator, 'userAgent', {
        configurable: true,
        get: () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36'
      })

      const buttonEl = fixtureEl.querySelector('button')
      // eslint-disable-next-line no-new
      new SearchButton(buttonEl, { shortcut: 'meta+k,ctrl+k' })

      expect(Array.from(buttonEl.querySelectorAll('.search-button-key')).map(element => element.textContent)).toEqual(['⌘', 'K'])
    })

    it('should render the ctrl shortcut label by default on non-macOS platforms', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button>',
        '  <span class="search-button-placeholder">Search</span>',
        '</button>'
      ].join('')

      Object.defineProperty(window.navigator, 'platform', {
        configurable: true,
        get: () => 'Win32'
      })

      Object.defineProperty(window.navigator, 'userAgentData', {
        configurable: true,
        get: () => ({ platform: 'Windows' })
      })

      const buttonEl = fixtureEl.querySelector('button')
      // eslint-disable-next-line no-new
      new SearchButton(buttonEl, { shortcut: 'meta+k,ctrl+k' })

      expect(Array.from(buttonEl.querySelectorAll('.search-button-key')).map(element => element.textContent)).toEqual(['Ctrl', 'K'])
    })

    it('should fall back to the first shortcut when shortcuts are not equivalent', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button>',
        '  <span class="search-button-placeholder">Search</span>',
        '</button>'
      ].join('')

      Object.defineProperty(window.navigator, 'platform', {
        configurable: true,
        get: () => 'MacIntel'
      })

      Object.defineProperty(window.navigator, 'userAgentData', {
        configurable: true,
        get: () => ({ platform: 'macOS' })
      })

      const buttonEl = fixtureEl.querySelector('button')
      // eslint-disable-next-line no-new
      new SearchButton(buttonEl, { shortcut: 'shift+k,ctrl+k' })

      expect(Array.from(buttonEl.querySelectorAll('.search-button-key')).map(element => element.textContent)).toEqual(['Shift', 'K'])
    })

    it('should allow shortcut configuration through data attributes', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button data-coreui-shortcut="meta+l,ctrl+l">',
        '  <span class="search-button-placeholder">Search</span>',
        '</button>'
      ].join('')

      Object.defineProperty(window.navigator, 'platform', {
        configurable: true,
        get: () => 'Win32'
      })

      Object.defineProperty(window.navigator, 'userAgentData', {
        configurable: true,
        get: () => ({ platform: 'Windows' })
      })

      const buttonEl = fixtureEl.querySelector('button')
      const searchButton = SearchButton.getOrCreateInstance(buttonEl)

      expect(searchButton._config.shortcut).toEqual('meta+l,ctrl+l')
      expect(Array.from(buttonEl.querySelectorAll('.search-button-key')).map(element => element.textContent)).toEqual(['Ctrl', 'L'])
    })

    it('should reuse existing shortcut label container when present', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button>',
        '  <span class="search-button-placeholder">Search</span>',
        '  <span class="search-button-keys"></span>',
        '</button>'
      ].join('')

      const buttonEl = fixtureEl.querySelector('button')
      const shortcutLabel = buttonEl.querySelector('.search-button-keys')
      // eslint-disable-next-line no-new
      new SearchButton(buttonEl, { shortcut: 'meta+k,ctrl+k' })

      expect(buttonEl.querySelector('.search-button-keys')).toBe(shortcutLabel)
      expect(buttonEl.querySelectorAll('.search-button-key')).toHaveSize(2)
    })
  })

  describe('trigger event', () => {
    it('should trigger trigger event when trigger() is called programmatically', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'

        const buttonEl = fixtureEl.querySelector('button')
        const searchButton = new SearchButton(buttonEl)

        buttonEl.addEventListener('trigger.coreui.search-button', event => {
          expect(event.trigger).toEqual('api')
          resolve()
        })

        searchButton.trigger()
      })
    })

    it('should not trigger when the button is disabled', () => {
      fixtureEl.innerHTML = '<button type="button" data-coreui-search-button disabled>Search</button>'

      const buttonEl = fixtureEl.querySelector('button')
      const searchButton = new SearchButton(buttonEl)
      const spy = jasmine.createSpy('trigger')

      buttonEl.addEventListener('trigger.coreui.search-button', spy)
      searchButton.trigger()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should trigger trigger event on click', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'

        const buttonEl = fixtureEl.querySelector('button')

        buttonEl.addEventListener('trigger.coreui.search-button', event => {
          expect(event.trigger).toEqual('click')
          resolve()
        })

        buttonEl.click()
      })
    })

    it('should not create an instance from a shortcut pressed before the toggle is initialized', () => {
      fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'

      const buttonEl = fixtureEl.querySelector('button')
      const clickSpy = jasmine.createSpy('click')

      buttonEl.addEventListener('click', clickSpy)

      document.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: '/',
        metaKey: true
      }))

      expect(clickSpy).not.toHaveBeenCalled()
      expect(SearchButton.getInstance(buttonEl)).toBeNull()
      expect(buttonEl.querySelector('.search-button-keys')).toBeNull()
    })

    it('should trigger trigger event on meta shortcut and prevent default behavior', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'

        const buttonEl = fixtureEl.querySelector('button')
        // eslint-disable-next-line no-new
        new SearchButton(buttonEl)
        const keyboardEvent = new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: '/',
          metaKey: true
        })

        buttonEl.addEventListener('trigger.coreui.search-button', event => {
          expect(event.trigger).toEqual('shortcut')
          resolve()
        })

        document.dispatchEvent(keyboardEvent)

        expect(keyboardEvent.defaultPrevented).toBeTrue()
      })
    })

    it('should dispatch a click event on shortcut so other data APIs can react', () => {
      fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'

      const buttonEl = fixtureEl.querySelector('button')
      // eslint-disable-next-line no-new
      new SearchButton(buttonEl)
      const clickSpy = jasmine.createSpy('click')

      buttonEl.addEventListener('click', clickSpy)

      document.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: '/',
        metaKey: true
      }))

      expect(clickSpy).toHaveBeenCalled()
    })

    it('should add active class to shortcut keys while the shortcut is pressed', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button>',
        '  <span class="search-button-placeholder">Search</span>',
        '</button>'
      ].join('')

      Object.defineProperty(window.navigator, 'platform', {
        configurable: true,
        get: () => 'MacIntel'
      })

      Object.defineProperty(window.navigator, 'userAgentData', {
        configurable: true,
        get: () => ({ platform: 'macOS' })
      })

      const buttonEl = fixtureEl.querySelector('button')
      // eslint-disable-next-line no-new
      new SearchButton(buttonEl, { shortcut: 'meta+/,ctrl+/' })

      document.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Meta',
        metaKey: true
      }))

      const keys = buttonEl.querySelectorAll('.search-button-key')
      expect(keys[0]).toHaveClass('active')
      expect(keys[1]).not.toHaveClass('active')

      document.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: '/',
        metaKey: true
      }))

      expect(keys[0]).toHaveClass('active')
      expect(keys[1]).toHaveClass('active')
    })

    it('should remove active class from shortcut keys on keyup', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button>',
        '  <span class="search-button-placeholder">Search</span>',
        '</button>'
      ].join('')

      Object.defineProperty(window.navigator, 'platform', {
        configurable: true,
        get: () => 'Win32'
      })

      const buttonEl = fixtureEl.querySelector('button')
      // eslint-disable-next-line no-new
      new SearchButton(buttonEl, { shortcut: 'meta+/,ctrl+/' })

      document.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: '/',
        ctrlKey: true
      }))
      document.dispatchEvent(new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
        key: '/',
        ctrlKey: false
      }))

      for (const key of buttonEl.querySelectorAll('.search-button-key')) {
        expect(key).not.toHaveClass('active')
      }
    })

    it('should clear active class from shortcut keys on window blur', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button>',
        '  <span class="search-button-placeholder">Search</span>',
        '</button>'
      ].join('')

      Object.defineProperty(window.navigator, 'platform', {
        configurable: true,
        get: () => 'MacIntel'
      })

      Object.defineProperty(window.navigator, 'userAgentData', {
        configurable: true,
        get: () => ({ platform: 'macOS' })
      })

      const buttonEl = fixtureEl.querySelector('button')
      // eslint-disable-next-line no-new
      new SearchButton(buttonEl, { shortcut: 'meta+/,ctrl+/' })

      document.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Meta',
        metaKey: true
      }))
      window.dispatchEvent(new Event('blur'))

      for (const key of buttonEl.querySelectorAll('.search-button-key')) {
        expect(key).not.toHaveClass('active')
      }
    })

    it('should trigger trigger event on ctrl shortcut', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'

        const buttonEl = fixtureEl.querySelector('button')
        // eslint-disable-next-line no-new
        new SearchButton(buttonEl)
        const keyboardEvent = new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: '/',
          ctrlKey: true
        })

        buttonEl.addEventListener('trigger.coreui.search-button', event => {
          expect(event.trigger).toEqual('shortcut')
          resolve()
        })

        document.dispatchEvent(keyboardEvent)
      })
    })

    it('should not leak shortcut state when the synthetic click does not bubble to the data api handler', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'

        const buttonEl = fixtureEl.querySelector('button')
        const stopPropagation = event => {
          event.stopPropagation()
          buttonEl.removeEventListener('click', stopPropagation)
        }

        // eslint-disable-next-line no-new
        new SearchButton(buttonEl)
        buttonEl.addEventListener('click', stopPropagation)
        document.dispatchEvent(new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: '/',
          metaKey: true
        }))

        buttonEl.addEventListener('trigger.coreui.search-button', event => {
          expect(event.trigger).toEqual('click')
          resolve()
        })

        buttonEl.click()
      })
    })

    it('should not trigger trigger event when shortcut does not match', () => {
      fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'

      const buttonEl = fixtureEl.querySelector('button')
      // eslint-disable-next-line no-new
      new SearchButton(buttonEl)
      const spy = jasmine.createSpy('trigger')

      buttonEl.addEventListener('trigger.coreui.search-button', spy)

      document.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'k',
        metaKey: true
      }))

      expect(spy).not.toHaveBeenCalled()
    })

    it('should not prevent default behavior when preventDefault is false', () => {
      fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'

      const buttonEl = fixtureEl.querySelector('button')
      // eslint-disable-next-line no-new
      new SearchButton(buttonEl, { preventDefault: false, shortcut: 'meta+/' })

      const keyboardEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: '/',
        metaKey: true
      })

      document.dispatchEvent(keyboardEvent)

      expect(keyboardEvent.defaultPrevented).toBeFalse()
    })

    it('should not trigger shortcut handling for plain typing inside an input', () => {
      fixtureEl.innerHTML = [
        '<div>',
        '  <button type="button" data-coreui-search-button>Search</button>',
        '  <input type="search" class="form-control">',
        '</div>'
      ].join('')

      const buttonEl = fixtureEl.querySelector('button')
      const inputEl = fixtureEl.querySelector('input')
      const spy = jasmine.createSpy('trigger')
      // eslint-disable-next-line no-new
      new SearchButton(buttonEl, { shortcut: '/' })

      buttonEl.addEventListener('trigger.coreui.search-button', spy)

      const keyboardEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: '/'
      })

      inputEl.dispatchEvent(keyboardEvent)

      expect(spy).not.toHaveBeenCalled()
      expect(keyboardEvent.defaultPrevented).toBeFalse()
    })

    it('should trigger shortcut handling inside an input when cmd is pressed', () => {
      return new Promise(resolve => {
        fixtureEl.innerHTML = [
          '<div>',
          '  <button type="button" data-coreui-search-button>Search</button>',
          '  <input type="search" class="form-control">',
          '</div>'
        ].join('')

        const buttonEl = fixtureEl.querySelector('button')
        const inputEl = fixtureEl.querySelector('input')
        // eslint-disable-next-line no-new
        new SearchButton(buttonEl)
        const keyboardEvent = new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: '/',
          metaKey: true
        })

        buttonEl.addEventListener('trigger.coreui.search-button', event => {
          expect(event.trigger).toEqual('shortcut')
          resolve()
        })

        inputEl.dispatchEvent(keyboardEvent)

        expect(keyboardEvent.defaultPrevented).toBeTrue()
      })
    })
  })

  describe('dispose', () => {
    it('should not bring the instance back on the next key press', () => {
      fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'

      const buttonEl = fixtureEl.querySelector('button')
      const clickSpy = jasmine.createSpy('click')
      const searchButton = new SearchButton(buttonEl)

      buttonEl.addEventListener('click', clickSpy)
      searchButton.dispose()

      const keyboardEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: '/',
        metaKey: true
      })

      document.dispatchEvent(keyboardEvent)

      expect(clickSpy).not.toHaveBeenCalled()
      expect(keyboardEvent.defaultPrevented).toBeFalse()
      expect(SearchButton.getInstance(buttonEl)).toBeNull()
    })

    it('should not bring the instance back on keyup or window blur', () => {
      fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'

      const buttonEl = fixtureEl.querySelector('button')
      new SearchButton(buttonEl).dispose()

      document.dispatchEvent(new KeyboardEvent('keyup', {
        bubbles: true,
        key: '/',
        metaKey: true
      }))
      window.dispatchEvent(new Event('blur'))

      expect(SearchButton.getInstance(buttonEl)).toBeNull()
      expect(buttonEl.querySelector('.search-button-keys')).toBeNull()
    })

    it('should remove the shortcut keys it rendered', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button>',
        '  <span class="search-button-placeholder">Search</span>',
        '</button>'
      ].join('')

      const buttonEl = fixtureEl.querySelector('button')
      const markup = buttonEl.outerHTML
      const searchButton = new SearchButton(buttonEl)

      searchButton.dispose()

      expect(buttonEl.outerHTML).toEqual(markup)
    })

    it('should give a shortcut keys container that came with the page its own content back', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button>',
        '  <span class="search-button-placeholder">Search</span>',
        '  <span class="search-button-keys" aria-hidden="true"><kbd>⌘</kbd><kbd>K</kbd></span>',
        '</button>'
      ].join('')

      const buttonEl = fixtureEl.querySelector('button')
      const shortcutKeys = buttonEl.querySelector('.search-button-keys')
      const markup = buttonEl.outerHTML
      const searchButton = new SearchButton(buttonEl)

      searchButton.dispose()

      expect(buttonEl.querySelector('.search-button-keys')).toBe(shortcutKeys)
      expect(buttonEl.outerHTML).toEqual(markup)
    })

    it('should remove its own shortcut keys when the page has added a container since', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button>',
        '  <span class="search-button-placeholder">Search</span>',
        '</button>'
      ].join('')

      const buttonEl = fixtureEl.querySelector('button')
      const searchButton = new SearchButton(buttonEl)
      const pageKeys = document.createElement('span')
      pageKeys.className = 'search-button-keys'
      buttonEl.prepend(pageKeys)

      searchButton.dispose()

      expect(pageKeys.isConnected).toBeTrue()
      expect(buttonEl.querySelectorAll('.search-button-keys')).toHaveSize(1)
      expect(buttonEl.querySelector('.search-button-key')).toBeNull()
    })

    it('should leave the markup alone when called again', () => {
      fixtureEl.innerHTML = [
        '<button type="button" data-coreui-search-button>',
        '  <span class="search-button-placeholder">Search</span>',
        '  <span class="search-button-keys" aria-hidden="true"><kbd>K</kbd></span>',
        '</button>'
      ].join('')

      const buttonEl = fixtureEl.querySelector('button')
      const searchButton = new SearchButton(buttonEl)

      searchButton.dispose()
      const markup = buttonEl.outerHTML

      expect(() => searchButton.dispose()).not.toThrow()
      expect(buttonEl.outerHTML).toEqual(markup)
    })

    it('should keep the shortcut of another search button working', () => {
      fixtureEl.innerHTML = [
        '<button type="button" id="first" data-coreui-search-button>Search</button>',
        '<button type="button" id="second" data-coreui-search-button>Search</button>'
      ].join('')

      const firstEl = fixtureEl.querySelector('#first')
      const secondEl = fixtureEl.querySelector('#second')
      const clickSpy = jasmine.createSpy('click')

      const firstButton = new SearchButton(firstEl)
      // eslint-disable-next-line no-new
      new SearchButton(secondEl)
      secondEl.addEventListener('click', clickSpy)
      firstButton.dispose()

      document.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: '/',
        metaKey: true
      }))

      expect(clickSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('data-api', () => {
    it('should initialize every search button on DOMContentLoaded', () => {
      fixtureEl.innerHTML = [
        '<button type="button" id="first" data-coreui-search-button>Search</button>',
        '<button type="button" id="second" data-coreui-search-button>Search</button>'
      ].join('')

      document.dispatchEvent(new Event('DOMContentLoaded'))

      for (const buttonEl of fixtureEl.querySelectorAll('button')) {
        expect(SearchButton.getInstance(buttonEl)).not.toBeNull()
        expect(buttonEl.querySelectorAll('.search-button-key')).toHaveSize(2)
      }
    })
  })

  describe('Static methods', () => {
    describe('searchButtonInterface', () => {
      it('should create instance if config is object', () => {
        fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'
        const buttonEl = fixtureEl.querySelector('button')

        SearchButton.searchButtonInterface(buttonEl, {})

        expect(SearchButton.getInstance(buttonEl)).toBeInstanceOf(SearchButton)
      })

      it('should call method when config is string', () => {
        fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'
        const buttonEl = fixtureEl.querySelector('button')
        const searchButton = new SearchButton(buttonEl)
        const spyTrigger = spyOn(searchButton, 'trigger')

        SearchButton.searchButtonInterface(buttonEl, 'trigger')

        expect(spyTrigger).toHaveBeenCalled()
      })

      it('should throw error for non-existent method', () => {
        fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'
        const buttonEl = fixtureEl.querySelector('button')
        // eslint-disable-next-line no-new
        new SearchButton(buttonEl)

        expect(() => {
          SearchButton.searchButtonInterface(buttonEl, 'nonExistentMethod')
        }).toThrowError(TypeError, 'No method named "nonExistentMethod"')
      })
    })

    describe('jQueryInterface', () => {
      it('should create instance when jQuery is present', () => {
        fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'
        const buttonEl = fixtureEl.querySelector('button')
        jQueryMock.fn.searchButton = SearchButton.jQueryInterface
        jQueryMock.elements = [buttonEl]

        jQueryMock.fn.searchButton.call(jQueryMock)

        expect(SearchButton.getInstance(buttonEl)).toBeInstanceOf(SearchButton)
      })

      it('should throw error for non-existent method', () => {
        fixtureEl.innerHTML = '<button type="button" data-coreui-search-button>Search</button>'
        const buttonEl = fixtureEl.querySelector('button')
        jQueryMock.fn.searchButton = SearchButton.jQueryInterface
        jQueryMock.elements = [buttonEl]

        expect(() => {
          jQueryMock.fn.searchButton.call(jQueryMock, 'nonExistentMethod')
        }).toThrowError(TypeError, 'No method named "nonExistentMethod"')
      })
    })
  })
})

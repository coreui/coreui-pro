import BaseComponent from '../../src/base-component.js'
import EventHandler from '../../src/dom/event-handler.js'
import { noop } from '../../src/util/index.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

class DummyClass extends BaseComponent {
  constructor(element) {
    super(element)

    EventHandler.on(this._element, `click${DummyClass.EVENT_KEY}`, noop)
  }

  static get NAME() {
    return 'dummy'
  }
}

class OtherDummyClass extends BaseComponent {
  static get NAME() {
    return 'other-dummy'
  }
}

describe('Base Component', () => {
  let fixtureEl
  const name = 'dummy'
  let element
  let instance
  const createInstance = () => {
    fixtureEl.innerHTML = '<div id="foo"></div>'
    element = fixtureEl.querySelector('#foo')
    instance = new DummyClass(element)
  }

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('Static Methods', () => {
    describe('VERSION', () => {
      it('should return version', () => {
        expect(DummyClass.VERSION).toEqual(jasmine.any(String))
      })
    })

    describe('DATA_KEY', () => {
      it('should return plugin data key', () => {
        expect(DummyClass.DATA_KEY).toEqual(`coreui.${name}`)
      })
    })

    describe('NAME', () => {
      it('should throw an Error if it is not initialized', () => {
        expect(() => {
          // eslint-disable-next-line no-unused-expressions
          BaseComponent.NAME
        }).toThrowError(Error)
      })

      it('should return plugin NAME', () => {
        expect(DummyClass.NAME).toEqual(name)
      })
    })

    describe('EVENT_KEY', () => {
      it('should return plugin event key', () => {
        expect(DummyClass.EVENT_KEY).toEqual(`.coreui.${name}`)
      })
    })
  })

  describe('Public Methods', () => {
    describe('constructor', () => {
      it('should accept element, either passed as a CSS selector or DOM element', () => {
        fixtureEl.innerHTML = [
          '<div id="foo"></div>',
          '<div id="bar"></div>'
        ].join('')

        const el = fixtureEl.querySelector('#foo')
        const elInstance = new DummyClass(el)
        const selectorInstance = new DummyClass('#bar')

        expect(elInstance._element).toEqual(el)
        expect(selectorInstance._element).toEqual(fixtureEl.querySelector('#bar'))
      })

      it('should not initialize and add element record to Data (caching), if argument `element` is not an HTML element', () => {
        fixtureEl.replaceChildren()

        const el = fixtureEl.querySelector('#foo')
        const elInstance = new DummyClass(el)
        const selectorInstance = new DummyClass('#bar')

        expect(elInstance._element).not.toBeDefined()
        expect(selectorInstance._element).not.toBeDefined()
      })

      it('should dispose an existing instance when re-instantiated on the same element', () => {
        fixtureEl.innerHTML = '<div id="foo"></div>'

        const el = fixtureEl.querySelector('#foo')
        const firstInstance = new DummyClass(el)
        const disposeSpy = spyOn(firstInstance, 'dispose').and.callThrough()
        const secondInstance = new DummyClass(el)

        expect(disposeSpy).toHaveBeenCalled()
        expect(DummyClass.getInstance(el)).toEqual(secondInstance)
        expect(DummyClass.getInstance(el)).not.toEqual(firstInstance)
      })
    })

    describe('dispose', () => {
      it('should dispose an component', () => {
        createInstance()
        expect(DummyClass.getInstance(element)).not.toBeNull()

        instance.dispose()

        expect(DummyClass.getInstance(element)).toBeNull()
        expect(instance._element).toBeNull()
      })

      it('should leave another component on the same element registered', () => {
        createInstance()
        const other = new OtherDummyClass(element)

        expect(DummyClass.getInstance(element)).toBe(instance)
        expect(OtherDummyClass.getInstance(element)).toBe(other)

        instance.dispose()

        expect(DummyClass.getInstance(element)).toBeNull()
        expect(OtherDummyClass.getInstance(element)).toBe(other)
      })

      it('should de-register element event listeners', () => {
        createInstance()
        const spy = spyOn(EventHandler, 'off')

        instance.dispose()

        expect(spy).toHaveBeenCalledWith(element, DummyClass.EVENT_KEY)
      })
    })

    describe('getInstance', () => {
      it('should return an instance', () => {
        createInstance()

        expect(DummyClass.getInstance(element)).toEqual(instance)
        expect(DummyClass.getInstance(element)).toBeInstanceOf(DummyClass)
      })

      it('should accept element, either passed as a CSS selector, jQuery element, or DOM element', () => {
        createInstance()

        expect(DummyClass.getInstance('#foo')).toEqual(instance)
        expect(DummyClass.getInstance(element)).toEqual(instance)

        const fakejQueryObject = {
          0: element,
          jquery: 'foo'
        }

        expect(DummyClass.getInstance(fakejQueryObject)).toEqual(instance)
      })

      it('should return null when there is no instance', () => {
        fixtureEl.innerHTML = '<div></div>'

        const div = fixtureEl.querySelector('div')

        expect(DummyClass.getInstance(div)).toBeNull()
      })
    })

    describe('getOrCreateInstance', () => {
      it('should return an instance', () => {
        createInstance()

        expect(DummyClass.getOrCreateInstance(element)).toEqual(instance)
        expect(DummyClass.getInstance(element)).toEqual(DummyClass.getOrCreateInstance(element, {}))
        expect(DummyClass.getOrCreateInstance(element)).toBeInstanceOf(DummyClass)
      })

      it('should return new instance when there is no alert instance', () => {
        fixtureEl.innerHTML = '<div id="foo"></div>'
        element = fixtureEl.querySelector('#foo')

        expect(DummyClass.getInstance(element)).toBeNull()
        expect(DummyClass.getOrCreateInstance(element)).toBeInstanceOf(DummyClass)
      })
    })
  })

  describe('Private Methods', () => {
    describe('_queueCallback', () => {
      const createAnimatedInstance = () => {
        fixtureEl.innerHTML = '<div id="foo" style="transition: opacity .05s"></div>'
        element = fixtureEl.querySelector('#foo')
        instance = new DummyClass(element)
      }

      it('should drop the callback of a wait that a later wait on the same element replaces', async () => {
        createAnimatedInstance()
        const first = jasmine.createSpy('first')
        const second = jasmine.createSpy('second')

        await Promise.all([
          instance._queueCallback(first, element),
          instance._queueCallback(second, element)
        ])

        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledTimes(1)
      })

      it('should settle a replaced wait only together with the wait that replaced it', async () => {
        createAnimatedInstance()
        const order = []

        const first = instance._queueCallback(noop, element).then(() => order.push('first settled'))
        const second = instance._queueCallback(() => order.push('second callback'), element)
        await Promise.all([first, second])

        expect(order).toEqual(['second callback', 'first settled'])
      })

      it('should replace a pending wait with a wait that has no transition', async () => {
        createAnimatedInstance()
        const first = jasmine.createSpy('first')
        const second = jasmine.createSpy('second')

        instance._queueCallback(first, element)
        instance._queueCallback(second, element, false)

        expect(second).toHaveBeenCalledTimes(1)
        await new Promise(resolve => {
          setTimeout(resolve, 100)
        })
        expect(first).not.toHaveBeenCalled()
      })

      it('should keep the wait of another component on the same element', async () => {
        createAnimatedInstance()
        const other = new OtherDummyClass(element)
        const first = jasmine.createSpy('first')
        const second = jasmine.createSpy('second')

        await Promise.all([
          instance._queueCallback(first, element),
          other._queueCallback(second, element)
        ])

        expect(first).toHaveBeenCalledTimes(1)
        expect(second).toHaveBeenCalledTimes(1)
      })

      it('should settle a pending wait at once when disposed', async () => {
        createAnimatedInstance()
        let settled = false

        instance._queueCallback(noop, element).then(() => {
          settled = true
        })
        instance.dispose()
        await Promise.resolve()

        expect(settled).toBeTrue()
      })

      it('should leave no transition listener on the element when disposed', () => {
        createAnimatedInstance()
        const spy = spyOn(element, 'removeEventListener').and.callThrough()

        instance._queueCallback(noop, element)
        instance.dispose()

        expect(spy).toHaveBeenCalledWith('transitionend', jasmine.any(Function))
      })

      it('should settle replaced waits without callbacks when disposed', async () => {
        createAnimatedInstance()
        const first = jasmine.createSpy('first')
        const second = jasmine.createSpy('second')

        const waits = Promise.all([
          instance._queueCallback(first, element),
          instance._queueCallback(second, element)
        ])
        instance.dispose()
        await waits

        expect(first).not.toHaveBeenCalled()
        expect(second).not.toHaveBeenCalled()
      })
    })
  })
})

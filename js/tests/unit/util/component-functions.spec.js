import BaseComponent from '../../../src/base-component.js'
import EventHandler from '../../../src/dom/event-handler.js'
import { enableDismissTrigger, onDocumentReady } from '../../../src/util/component-functions.js'
import { clearFixture, createEvent, getFixture } from '../../helpers/fixture.js'

class DummyClass2 extends BaseComponent {
  static get NAME() {
    return 'test'
  }

  hide() {
    return true
  }

  testMethod() {
    return true
  }
}

describe('Plugin functions', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('data-coreui-dismiss functionality', () => {
    it('should get Plugin and execute the given method, when a click occurred on data-coreui-dismiss="PluginName"', () => {
      fixtureEl.innerHTML = [
        '<div id="foo" class="test">',
        '  <button type="button" data-coreui-dismiss="test" data-coreui-target="#foo"></button>',
        '</div>'
      ].join('')

      const spyGet = spyOn(DummyClass2, 'getOrCreateInstance').and.callThrough()
      const spyTest = spyOn(DummyClass2.prototype, 'testMethod')
      const componentWrapper = fixtureEl.querySelector('#foo')
      const btnClose = fixtureEl.querySelector('[data-coreui-dismiss="test"]')
      const event = createEvent('click')

      enableDismissTrigger(DummyClass2, 'testMethod')
      btnClose.dispatchEvent(event)

      expect(spyGet).toHaveBeenCalledWith(componentWrapper)
      expect(spyTest).toHaveBeenCalled()
    })

    it('if data-coreui-dismiss="PluginName" hasn\'t got "data-coreui-target", "getOrCreateInstance" has to be initialized by closest "plugin.Name" class', () => {
      fixtureEl.innerHTML = [
        '<div id="foo" class="test">',
        '  <button type="button" data-coreui-dismiss="test"></button>',
        '</div>'
      ].join('')

      const spyGet = spyOn(DummyClass2, 'getOrCreateInstance').and.callThrough()
      const spyHide = spyOn(DummyClass2.prototype, 'hide')
      const componentWrapper = fixtureEl.querySelector('#foo')
      const btnClose = fixtureEl.querySelector('[data-coreui-dismiss="test"]')
      const event = createEvent('click')

      enableDismissTrigger(DummyClass2)
      btnClose.dispatchEvent(event)

      expect(spyGet).toHaveBeenCalledWith(componentWrapper)
      expect(spyHide).toHaveBeenCalled()
    })

    it('if data-coreui-dismiss="PluginName" is disabled, must not trigger function', () => {
      fixtureEl.innerHTML = [
        '<div id="foo" class="test">',
        '  <button type="button" disabled data-coreui-dismiss="test"></button>',
        '</div>'
      ].join('')

      const spy = spyOn(DummyClass2, 'getOrCreateInstance').and.callThrough()
      const btnClose = fixtureEl.querySelector('[data-coreui-dismiss="test"]')
      const event = createEvent('click')

      enableDismissTrigger(DummyClass2)
      btnClose.dispatchEvent(event)

      expect(spy).not.toHaveBeenCalled()
    })

    it('should prevent default when the trigger is <a> or <area>', () => {
      fixtureEl.innerHTML = [
        '<div id="foo" class="test">',
        '  <a type="button" data-coreui-dismiss="test"></a>',
        '</div>'
      ].join('')

      const btnClose = fixtureEl.querySelector('[data-coreui-dismiss="test"]')
      const event = createEvent('click')

      enableDismissTrigger(DummyClass2)
      const spy = spyOn(Event.prototype, 'preventDefault').and.callThrough()

      btnClose.dispatchEvent(event)

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('onDocumentReady', () => {
    const nextTask = () => new Promise(resolve => {
      setTimeout(resolve)
    })

    const sources = import.meta.glob('../../../src/*.ts', { query: '?raw', import: 'default', eager: true })

    afterEach(() => {
      EventHandler.off(document, '.ready-test')
      EventHandler.off(window, '.ready-test')
    })

    it('should start a DOMContentLoaded data API on the next task once that event has fired', async () => {
      const spy = jasmine.createSpy('spy')
      spyOn(performance, 'getEntriesByType').and.returnValue([{ domContentLoadedEventStart: 120 }])

      onDocumentReady(document, 'DOMContentLoaded.ready-test', spy)

      expect(spy).not.toHaveBeenCalled()

      await nextTask()

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should wait for DOMContentLoaded while a module or deferred script runs before it', async () => {
      const spy = jasmine.createSpy('spy')
      spyOnProperty(document, 'readyState').and.returnValue('interactive')
      spyOn(performance, 'getEntriesByType').and.returnValue([{ domContentLoadedEventStart: 0 }])

      onDocumentReady(document, 'DOMContentLoaded.ready-test', spy)
      await nextTask()

      expect(spy).not.toHaveBeenCalled()

      document.dispatchEvent(createEvent('DOMContentLoaded'))

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should start a load data API on the next task once the page has loaded', async () => {
      const spy = jasmine.createSpy('spy')
      spyOnProperty(document, 'readyState').and.returnValue('complete')

      onDocumentReady(window, 'load.ready-test', spy)

      expect(spy).not.toHaveBeenCalled()

      await nextTask()

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should wait for load while the page is still loading its resources', async () => {
      const spy = jasmine.createSpy('spy')
      spyOnProperty(document, 'readyState').and.returnValue('interactive')

      onDocumentReady(window, 'load.ready-test', spy)
      await nextTask()

      expect(spy).not.toHaveBeenCalled()

      window.dispatchEvent(createEvent('load'))

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should keep the listener under its namespace, so the data API can still be turned off', () => {
      const spy = jasmine.createSpy('spy')
      spyOnProperty(document, 'readyState').and.returnValue('loading')
      spyOn(performance, 'getEntriesByType').and.returnValue([{ domContentLoadedEventStart: 0 }])

      onDocumentReady(document, 'DOMContentLoaded.ready-test', spy)
      EventHandler.off(document, '.ready-test')
      document.dispatchEvent(createEvent('DOMContentLoaded'))

      expect(spy).not.toHaveBeenCalled()
    })

    it('should start every data API through it', () => {
      const direct = Object.entries(sources)
        .filter(([, source]) => /EventHandler\.on\((?:window|document), (?:EVENT_LOAD_DATA_API|EVENT_DOM_CONTENT_LOADED|`DOMContentLoaded)/.test(source))
        .map(([path]) => path)

      expect(direct).toEqual([])
      expect(Object.values(sources).filter(source => /^onDocumentReady\(/m.test(source))).toHaveSize(35)
    })
  })
})

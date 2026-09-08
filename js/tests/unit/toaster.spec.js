import Toaster from '../../src/toaster.js'
import { clearFixture, getFixture } from '../helpers/fixture.js'

describe('Toaster', () => {
  let fixtureEl
  let toaster

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    if (toaster && toaster._element) {
      toaster.dispose()
    }

    toaster = null
    clearFixture()
  })

  const hidden = element => new Promise(resolve => {
    element.addEventListener('hidden.coreui.toast', () => resolve(), { once: true })
  })

  describe('VERSION', () => {
    it('should return plugin version', () => {
      expect(Toaster.VERSION).toEqual(jasmine.any(String))
    })
  })

  describe('DATA_KEY', () => {
    it('should return plugin data key', () => {
      expect(Toaster.DATA_KEY).toEqual('coreui.toaster')
    })
  })

  describe('constructor', () => {
    it('should create a placed container in body when no element is given', () => {
      toaster = new Toaster()

      const container = document.body.querySelector('.toast-container')
      expect(container).toEqual(toaster._element)
      expect(container).toHaveClass('toast-container-top-end')
      expect(container.getAttribute('role')).toEqual('region')
      expect(container.getAttribute('aria-label')).toEqual('Notifications')
    })

    it('should place the created container by the placement option inside the container option', () => {
      toaster = new Toaster(null, { placement: 'bottom-center', container: fixtureEl })

      expect(fixtureEl.querySelector('.toast-container-bottom-center')).toEqual(toaster._element)
    })

    it('should use an existing element as the container without a placement class', () => {
      fixtureEl.innerHTML = '<div class="toast-container position-static"></div>'
      const containerEl = fixtureEl.querySelector('.toast-container')

      toaster = new Toaster(containerEl)

      expect(toaster._element).toEqual(containerEl)
      expect(containerEl.className).toEqual('toast-container position-static')
      expect(containerEl.getAttribute('role')).toEqual('region')
    })

    it('should throw on an unknown placement', () => {
      expect(() => {
        new Toaster(null, { placement: 'left' }) // eslint-disable-line no-new
      }).toThrowError(TypeError, /placement/)
    })
  })

  describe('add', () => {
    it('should render a toast with title, description and a close button in the header', () => {
      toaster = new Toaster(null, { container: fixtureEl })

      const id = toaster.add({ title: 'Saved', description: 'Your changes are live.', instant: true })
      const toastEl = fixtureEl.querySelector('.toast')

      expect(id).toEqual(jasmine.any(String))
      expect(toastEl.getAttribute('data-coreui-toast-id')).toEqual(id)
      expect(toastEl.querySelector('.toast-header .toast-title').textContent).toEqual('Saved')
      expect(toastEl.querySelector('.toast-header .btn-close')).not.toBeNull()
      expect(toastEl.querySelector('.toast-body .toast-description').textContent).toEqual('Your changes are live.')
      expect(toastEl.querySelector('.toast-body .btn-close')).toBeNull()
      expect(toastEl.querySelector('.toast-action')).toBeNull()
      expect(toastEl).toHaveClass('show')
      expect(toastEl).toHaveClass('toast-instant')
    })

    it('should render a description-only toast with the close button in the body', () => {
      toaster = new Toaster(null, { container: fixtureEl })

      toaster.add({ description: 'Copied', instant: true })
      const toastEl = fixtureEl.querySelector('.toast')

      expect(toastEl.querySelector('.toast-header')).toBeNull()
      expect(toastEl.querySelector('.toast-body .btn-close')).not.toBeNull()
    })

    it('should drop the close button when dismissible is false', () => {
      toaster = new Toaster(null, { container: fixtureEl })

      toaster.add({
        title: 'Saved', description: 'Done', dismissible: false, instant: true
      })

      expect(fixtureEl.querySelector('.btn-close')).toBeNull()
    })

    it('should announce by priority', () => {
      toaster = new Toaster(null, { container: fixtureEl })

      toaster.add({ description: 'polite', instant: true })
      toaster.add({ description: 'urgent', priority: 'high', instant: true })

      const [urgent, polite] = fixtureEl.querySelectorAll('.toast')
      expect(polite.getAttribute('role')).toEqual('status')
      expect(polite.getAttribute('aria-live')).toEqual('polite')
      expect(urgent.getAttribute('role')).toEqual('alert')
      expect(urgent.getAttribute('aria-live')).toEqual('assertive')
    })

    it('should add the theme, translucent and custom classes', () => {
      toaster = new Toaster(null, { container: fixtureEl })

      toaster.add({
        description: 'Done', theme: 'success', translucent: true, class: 'my-toast wide', instant: true
      })
      const toastEl = fixtureEl.querySelector('.toast')

      expect(toastEl).toHaveClass('theme-success')
      expect(toastEl).toHaveClass('toast-translucent')
      expect(toastEl).toHaveClass('my-toast')
      expect(toastEl).toHaveClass('wide')
    })

    it('should prepend in top placements and append in the others', () => {
      toaster = new Toaster(null, { container: fixtureEl })
      toaster.add({ description: 'first', instant: true })
      toaster.add({ description: 'second', instant: true })
      expect(toaster._element.firstElementChild.textContent.trim()).toEqual('second')
      toaster.dispose()

      toaster = new Toaster(null, { container: fixtureEl, placement: 'bottom-end' })
      toaster.add({ description: 'first', instant: true })
      toaster.add({ description: 'second', instant: true })
      expect(toaster._element.lastElementChild.textContent.trim()).toEqual('second')
    })

    it('should fire add.coreui.toaster with the id', () => {
      toaster = new Toaster(null, { container: fixtureEl })
      const spy = jasmine.createSpy('add')
      toaster._element.addEventListener('add.coreui.toaster', spy)

      const id = toaster.add({ description: 'Done', instant: true })

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.calls.mostRecent().args[0].id).toEqual(id)
    })

    it('should not autohide when timeout is 0', () => {
      toaster = new Toaster(null, { container: fixtureEl })

      const id = toaster.add({ description: 'Sticky', timeout: 0, instant: true })

      expect(toaster._entries.get(id).instance._config.autohide).toBeFalse()
    })

    it('should update in place when the id already exists', () => {
      toaster = new Toaster(null, { container: fixtureEl })

      toaster.add({ id: 'save', description: 'Saving', instant: true })
      toaster.add({ id: 'save', description: 'Saved', instant: true })

      const toasts = fixtureEl.querySelectorAll('.toast')
      expect(toasts).toHaveSize(1)
      expect(toasts[0].querySelector('.toast-description').textContent).toEqual('Saved')
      expect(toasts[0].getAttribute('data-coreui-update-key')).toEqual('1')
      expect(toaster.getToasts()[0].updateKey).toEqual(1)
    })

    it('should render an action button and call its handler', () => {
      toaster = new Toaster(null, { container: fixtureEl })
      const onClick = jasmine.createSpy('onClick')

      const id = toaster.add({ description: 'Deleted', action: { label: 'Undo', onClick }, instant: true })
      const actionEl = fixtureEl.querySelector('.toast-action')
      expect(actionEl.textContent).toEqual('Undo')

      actionEl.click()

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.calls.mostRecent().args[1].id).toEqual(id)
    })

    it('should write text, not markup, unless html is enabled', () => {
      toaster = new Toaster(null, { container: fixtureEl })
      toaster.add({ description: '<b>bold</b>', instant: true })
      expect(fixtureEl.querySelector('.toast-description b')).toBeNull()
      toaster.dispose()

      toaster = new Toaster(null, { container: fixtureEl, html: true })
      toaster.add({ description: '<b>bold</b><script>window.__toasterXss = true</script>', instant: true })
      expect(fixtureEl.querySelector('.toast-description b')).not.toBeNull()
      expect(fixtureEl.querySelector('.toast-description script')).toBeNull()
    })
  })

  describe('update', () => {
    it('should replace content, theme and update key', () => {
      toaster = new Toaster(null, { container: fixtureEl })
      const id = toaster.add({ title: 'Upload', description: '0%', instant: true })

      toaster.update(id, { description: '100%', theme: 'success' })
      const toastEl = fixtureEl.querySelector('.toast')

      expect(toastEl.querySelector('.toast-title').textContent).toEqual('Upload')
      expect(toastEl.querySelector('.toast-description').textContent).toEqual('100%')
      expect(toastEl).toHaveClass('theme-success')
      expect(toastEl).toHaveClass('show')
      expect(toastEl.getAttribute('data-coreui-update-key')).toEqual('1')
    })

    it('should derive the update from the previous toast when given a function', () => {
      toaster = new Toaster(null, { container: fixtureEl })
      const id = toaster.add({ description: 'one', data: { count: 1 }, instant: true })

      toaster.update(id, previous => ({ description: `count ${previous.data.count + 1}` }))

      expect(fixtureEl.querySelector('.toast-description').textContent).toEqual('count 2')
    })

    it('should ignore an unknown id', () => {
      toaster = new Toaster(null, { container: fixtureEl })

      expect(() => toaster.update('missing', { description: 'x' })).not.toThrow()
    })
  })

  describe('limit', () => {
    it('should keep the newest toasts visible and mark the oldest as limited', () => {
      toaster = new Toaster(null, { container: fixtureEl, limit: 2 })

      const first = toaster.add({ description: 'first', instant: true })
      toaster.add({ description: 'second', instant: true })
      toaster.add({ description: 'third', instant: true })

      const firstEl = fixtureEl.querySelector(`[data-coreui-toast-id="${first}"]`)
      expect(firstEl.hasAttribute('data-coreui-limited')).toBeTrue()
      expect(firstEl.inert).toBeTrue()
      expect(fixtureEl.querySelectorAll('.toast:not([data-coreui-limited])')).toHaveSize(2)
      expect(toaster.getToasts().map(toast => toast.limited)).toEqual([true, false, false])
    })

    it('should release the oldest limited toast when a visible one goes away', async () => {
      toaster = new Toaster(null, { container: fixtureEl, limit: 2 })

      const first = toaster.add({ description: 'first', instant: true })
      const second = toaster.add({ description: 'second', instant: true })
      toaster.add({ description: 'third', instant: true })

      const secondEl = fixtureEl.querySelector(`[data-coreui-toast-id="${second}"]`)
      const removed = hidden(secondEl)
      toaster.close(second)
      await removed

      const firstEl = fixtureEl.querySelector(`[data-coreui-toast-id="${first}"]`)
      expect(firstEl.hasAttribute('data-coreui-limited')).toBeFalse()
      expect(firstEl.inert).toBeFalse()
    })

    it('should not limit anything when limit is 0', () => {
      toaster = new Toaster(null, { container: fixtureEl, limit: 0 })

      for (let index = 0; index < 5; index++) {
        toaster.add({ description: `toast ${index}`, instant: true })
      }

      expect(fixtureEl.querySelectorAll('[data-coreui-limited]')).toHaveSize(0)
    })
  })

  describe('close', () => {
    it('should hide one toast, remove it and call onClose and onRemove', async () => {
      toaster = new Toaster(null, { container: fixtureEl })
      const onClose = jasmine.createSpy('onClose')
      const onRemove = jasmine.createSpy('onRemove')
      const removeSpy = jasmine.createSpy('remove')
      toaster._element.addEventListener('remove.coreui.toaster', removeSpy)

      const id = toaster.add({
        description: 'Done', onClose, onRemove, instant: true
      })
      toaster.add({ description: 'Other', instant: true })
      const toastEl = fixtureEl.querySelector(`[data-coreui-toast-id="${id}"]`)
      const removed = hidden(toastEl)

      toaster.close(id)
      await removed

      expect(onClose).toHaveBeenCalledTimes(1)
      expect(onRemove).toHaveBeenCalledTimes(1)
      expect(onRemove.calls.mostRecent().args[0].id).toEqual(id)
      expect(removeSpy.calls.mostRecent().args[0].id).toEqual(id)
      expect(fixtureEl.querySelector(`[data-coreui-toast-id="${id}"]`)).toBeNull()
      expect(fixtureEl.querySelectorAll('.toast')).toHaveSize(1)
      expect(toaster.getToasts()).toHaveSize(1)
    })

    it('should close every toast without an id', async () => {
      toaster = new Toaster(null, { container: fixtureEl })
      toaster.add({ description: 'one', instant: true })
      toaster.add({ description: 'two', instant: true })
      const removals = [...fixtureEl.querySelectorAll('.toast')].map(element => hidden(element))

      toaster.close()
      await Promise.all(removals)

      expect(fixtureEl.querySelectorAll('.toast')).toHaveSize(0)
      expect(toaster.getToasts()).toHaveSize(0)
    })

    it('should remove a toast dismissed through its close button', async () => {
      toaster = new Toaster(null, { container: fixtureEl })
      const id = toaster.add({ description: 'Done', instant: true })
      const toastEl = fixtureEl.querySelector('.toast')
      const removed = hidden(toastEl)

      toastEl.querySelector('.btn-close').click()
      await removed

      expect(fixtureEl.querySelector('.toast')).toBeNull()
      expect(toaster.getToasts().some(toast => toast.id === id)).toBeFalse()
    })
  })

  describe('motion', () => {
    it('should slide the remaining toasts into place when one is removed', async () => {
      toaster = new Toaster(null, { container: fixtureEl })
      const animate = spyOn(Element.prototype, 'animate').and.callThrough()
      spyOn(toaster, '_prefersReducedMotion').and.returnValue(false)

      toaster.add({ description: 'first', instant: true })
      const second = toaster.add({ description: 'second', instant: true })
      animate.calls.reset()

      const secondEl = fixtureEl.querySelector(`[data-coreui-toast-id="${second}"]`)
      const removed = hidden(secondEl)
      toaster.close(second)
      await removed

      expect(animate).toHaveBeenCalledTimes(1)
      expect(animate.calls.mostRecent().args[0][1].transform).toMatch(/^translateY\(-?\d/)
    })

    it('should not animate positions when reduced motion is preferred', async () => {
      toaster = new Toaster(null, { container: fixtureEl })
      const animate = spyOn(Element.prototype, 'animate').and.callThrough()
      spyOn(toaster, '_prefersReducedMotion').and.returnValue(true)

      const first = toaster.add({ description: 'first', instant: true })
      toaster.add({ description: 'second', instant: true })
      const firstEl = fixtureEl.querySelector(`[data-coreui-toast-id="${first}"]`)
      const removed = hidden(firstEl)
      toaster.close(first)
      await removed

      expect(animate).not.toHaveBeenCalled()
    })
  })

  describe('promise', () => {
    it('should show the loading state and switch to success', async () => {
      toaster = new Toaster(null, { container: fixtureEl, timeout: 0 })
      const promise = Promise.resolve('world')

      const result = toaster.promise(promise, {
        loading: { description: 'Loading…', instant: true },
        success: value => `Hello ${value}`,
        error: 'Failed'
      })

      expect(fixtureEl.querySelector('.toast-description').textContent).toEqual('Loading…')
      expect(toaster.getToasts()[0].timeout).toEqual(0)

      await result
      await Promise.resolve()

      const toastEl = fixtureEl.querySelector('.toast')
      expect(toastEl.querySelector('.toast-description').textContent).toEqual('Hello world')
      expect(toastEl).toHaveClass('theme-success')
    })

    it('should switch to the error state when the promise rejects', async () => {
      toaster = new Toaster(null, { container: fixtureEl, timeout: 0 })
      const promise = Promise.reject(new Error('boom'))

      const result = toaster.promise(promise, {
        loading: 'Loading…',
        success: 'Done',
        error: error => ({ title: 'Failed', description: error.message })
      })

      await result.catch(() => {})
      await Promise.resolve()

      const toastEl = fixtureEl.querySelector('.toast')
      expect(toastEl.querySelector('.toast-title').textContent).toEqual('Failed')
      expect(toastEl.querySelector('.toast-description').textContent).toEqual('boom')
      expect(toastEl).toHaveClass('theme-danger')
    })
  })

  describe('dispose', () => {
    it('should remove every toast and the container it created', () => {
      toaster = new Toaster(null, { container: fixtureEl })
      toaster.add({ description: 'one', instant: true })
      toaster.add({ description: 'two', instant: true })

      toaster.dispose()

      expect(fixtureEl.querySelector('.toast-container')).toBeNull()
      expect(fixtureEl.querySelector('.toast')).toBeNull()
      toaster = null
    })

    it('should leave a user-provided container in place', () => {
      fixtureEl.innerHTML = '<div class="toast-container"></div>'
      const containerEl = fixtureEl.querySelector('.toast-container')
      toaster = new Toaster(containerEl)
      toaster.add({ description: 'one', instant: true })

      toaster.dispose()

      expect(fixtureEl.querySelector('.toast-container')).toEqual(containerEl)
      expect(containerEl.querySelector('.toast')).toBeNull()
      toaster = null
    })
  })

  describe('jQueryInterface', () => {
    it('should register the plugin', () => {
      expect(Toaster.jQueryInterface).toEqual(jasmine.any(Function))
    })
  })
})

import Alert from '../../src/alert.js'
import Collapse from '../../src/collapse.js'
import Modal from '../../src/modal.js'
import Offcanvas from '../../src/offcanvas.js'
import Tab from '../../src/tab.js'
import Toast from '../../src/toast.js'
import Tooltip from '../../src/tooltip.js'
import { clearBodyAndDocument, clearFixture, getFixture } from '../helpers/fixture.js'

/**
 * Every method that shows or hides a component returns a promise. The promise settles
 * once the component finishes, so `await instance.show()` resumes at the same moment a
 * `shown.coreui.*` listener would run. These specs pin down that contract.
 */

describe('Promise-returning API', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
    clearBodyAndDocument()
    document.documentElement.classList.remove('dialog-open')

    for (const element of document.querySelectorAll('.tooltip')) {
      element.remove()
    }

    for (const dialog of document.querySelectorAll('dialog[open]')) {
      dialog.close()
    }
  })

  // Runs `action` and records whether `eventName` fired before the promise settled.
  // A method that resolved too early would produce ['resolved', <eventName>].
  const orderOf = async (element, eventName, action) => {
    const order = []

    element.addEventListener(eventName, () => order.push(eventName))
    await action()
    order.push('resolved')

    return order
  }

  describe('resolves after the lifecycle event', () => {
    it('Collapse show, hide, and toggle', async () => {
      fixtureEl.innerHTML = '<div class="collapse"><div>content</div></div>'

      const collapseEl = fixtureEl.querySelector('.collapse')
      const collapse = new Collapse(collapseEl)

      expect(await orderOf(collapseEl, 'shown.coreui.collapse', () => collapse.show()))
        .toEqual(['shown.coreui.collapse', 'resolved'])
      expect(await orderOf(collapseEl, 'hidden.coreui.collapse', () => collapse.hide()))
        .toEqual(['hidden.coreui.collapse', 'resolved'])
      expect(await orderOf(collapseEl, 'shown.coreui.collapse', () => collapse.toggle()))
        .toEqual(['shown.coreui.collapse', 'resolved'])
    })

    it('Toast show and hide', async () => {
      fixtureEl.innerHTML = '<div class="toast" data-coreui-autohide="false"></div>'

      const toastEl = fixtureEl.querySelector('.toast')
      const toast = new Toast(toastEl)

      expect(await orderOf(toastEl, 'shown.coreui.toast', () => toast.show()))
        .toEqual(['shown.coreui.toast', 'resolved'])
      expect(await orderOf(toastEl, 'hidden.coreui.toast', () => toast.hide()))
        .toEqual(['hidden.coreui.toast', 'resolved'])
    })

    it('Modal show and hide', async () => {
      fixtureEl.innerHTML = '<dialog class="modal"></dialog>'

      const modalEl = fixtureEl.querySelector('.modal')
      const modal = new Modal(modalEl)

      expect(await orderOf(modalEl, 'shown.coreui.modal', () => modal.show()))
        .toEqual(['shown.coreui.modal', 'resolved'])
      expect(await orderOf(modalEl, 'hidden.coreui.modal', () => modal.hide()))
        .toEqual(['hidden.coreui.modal', 'resolved'])
    })

    it('Offcanvas show and hide', async () => {
      fixtureEl.innerHTML = '<dialog class="offcanvas offcanvas-start"></dialog>'

      const offcanvasEl = fixtureEl.querySelector('.offcanvas')
      const offcanvas = new Offcanvas(offcanvasEl)

      expect(await orderOf(offcanvasEl, 'shown.coreui.offcanvas', () => offcanvas.show()))
        .toEqual(['shown.coreui.offcanvas', 'resolved'])
      expect(await orderOf(offcanvasEl, 'hidden.coreui.offcanvas', () => offcanvas.hide()))
        .toEqual(['hidden.coreui.offcanvas', 'resolved'])
    })

    it('Tab show', async () => {
      fixtureEl.innerHTML = [
        '<ul class="nav" role="tablist">',
        '  <li><button type="button" data-coreui-target="#home" role="tab">Home</button></li>',
        '  <li><button type="button" id="triggerProfile" data-coreui-target="#profile" role="tab">Profile</button></li>',
        '</ul>',
        '<ul>',
        '  <li id="home" role="tabpanel"></li>',
        '  <li id="profile" role="tabpanel"></li>',
        '</ul>'
      ].join('')

      const triggerEl = fixtureEl.querySelector('#triggerProfile')
      const tab = new Tab(triggerEl)

      expect(await orderOf(triggerEl, 'shown.coreui.tab', () => tab.show()))
        .toEqual(['shown.coreui.tab', 'resolved'])
      expect(fixtureEl.querySelector('#profile')).toHaveClass('active')
    })

    it('Alert close', async () => {
      fixtureEl.innerHTML = '<div class="alert"></div>'

      const alertEl = fixtureEl.querySelector('.alert')
      const alert = new Alert(alertEl)

      expect(await orderOf(alertEl, 'closed.coreui.alert', () => alert.close()))
        .toEqual(['closed.coreui.alert', 'resolved'])
      expect(alertEl.parentNode).toBeNull()
    })

    it('Tooltip show, hide, and toggle', async () => {
      fixtureEl.innerHTML = '<a href="#" title="tooltip">Trigger</a>'

      const triggerEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(triggerEl)

      expect(await orderOf(triggerEl, 'shown.coreui.tooltip', () => tooltip.show()))
        .toEqual(['shown.coreui.tooltip', 'resolved'])
      expect(await orderOf(triggerEl, 'hidden.coreui.tooltip', () => tooltip.hide()))
        .toEqual(['hidden.coreui.tooltip', 'resolved'])

      // `toggle()` goes through the hover delay timer, so it has to thread the promise
      // through that timer to stay truthful
      expect(await orderOf(triggerEl, 'shown.coreui.tooltip', () => tooltip.toggle()))
        .toEqual(['shown.coreui.tooltip', 'resolved'])
    })
  })

  describe('resolves without hanging when the call does nothing', () => {
    it('a prevented show event still settles', async () => {
      fixtureEl.innerHTML = '<div class="collapse"><div>content</div></div>'

      const collapseEl = fixtureEl.querySelector('.collapse')
      const collapse = new Collapse(collapseEl)
      const shownSpy = jasmine.createSpy('shown')

      collapseEl.addEventListener('show.coreui.collapse', event => {
        event.preventDefault()
      })
      collapseEl.addEventListener('shown.coreui.collapse', shownSpy)

      await collapse.show()

      expect(shownSpy).not.toHaveBeenCalled()
      expect(collapseEl).not.toHaveClass('show')
    })

    it('showing an already shown component settles', async () => {
      fixtureEl.innerHTML = '<div class="collapse"><div>content</div></div>'

      const collapseEl = fixtureEl.querySelector('.collapse')
      const collapse = new Collapse(collapseEl)

      await collapse.show()

      const shownSpy = jasmine.createSpy('shown')
      collapseEl.addEventListener('shown.coreui.collapse', shownSpy)

      await collapse.show()

      expect(shownSpy).not.toHaveBeenCalled()
      expect(collapseEl).toHaveClass('show')
    })

    it('disposing mid-transition settles the pending promise', async () => {
      fixtureEl.innerHTML = '<div class="collapse"><div>content</div></div>'

      const collapseEl = fixtureEl.querySelector('.collapse')
      const collapse = new Collapse(collapseEl)
      const shownSpy = jasmine.createSpy('shown')

      collapseEl.addEventListener('shown.coreui.collapse', shownSpy)

      const showing = collapse.show()
      collapse.dispose()

      await showing

      expect(shownSpy).not.toHaveBeenCalled()
    })

    it('disposing a tooltip during its show delay settles the pending promise', async () => {
      fixtureEl.innerHTML = '<a href="#" title="tooltip">Trigger</a>'

      const triggerEl = fixtureEl.querySelector('a')
      const tooltip = new Tooltip(triggerEl, { delay: { show: 5000, hide: 0 } })
      const shownSpy = jasmine.createSpy('shown')

      triggerEl.addEventListener('shown.coreui.tooltip', shownSpy)

      const toggling = tooltip.toggle()
      tooltip.dispose()

      await toggling

      expect(shownSpy).not.toHaveBeenCalled()
    })
  })

  describe('sequencing', () => {
    it('awaits a full show and hide cycle without listeners', async () => {
      fixtureEl.innerHTML = '<div class="collapse"><div>content</div></div>'

      const collapseEl = fixtureEl.querySelector('.collapse')
      const collapse = new Collapse(collapseEl)

      await collapse.show()
      expect(collapseEl).toHaveClass('show')

      await collapse.hide()
      expect(collapseEl).not.toHaveClass('show')
      expect(collapseEl).not.toHaveClass('collapsing')
    })
  })
})

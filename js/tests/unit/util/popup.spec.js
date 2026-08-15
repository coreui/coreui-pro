import Popup from '../../../src/util/popup.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('Popup', () => {
  let fixtureEl
  const popups = []

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    for (const popup of popups) {
      popup.dispose()
    }

    popups.length = 0
    clearFixture()
  })

  const buildPopup = (config = {}) => {
    fixtureEl.innerHTML = [
      '<div id="anchor"><button id="inside">toggle</button></div>',
      '<div id="content"><button id="option">option</button></div>',
      '<button id="outside">outside</button>'
    ].join('')

    const popup = new Popup({
      anchor: fixtureEl.querySelector('#anchor'),
      content: fixtureEl.querySelector('#content'),
      focusTrap: false,
      ...config
    })

    popups.push(popup)
    return popup
  }

  describe('show', () => {
    it('should set isShown and fire onShow/onShown in order', () => {
      const calls = []
      const popup = buildPopup({
        onShow: () => calls.push('show'),
        onShown: () => calls.push('shown')
      })

      popup.show()

      expect(popup.isShown).toBeTrue()
      expect(calls).toEqual(['show', 'shown'])
    })

    it('should not fire callbacks when already shown', () => {
      const spy = jasmine.createSpy('onShow')
      const popup = buildPopup({ onShow: spy })

      popup.show()
      popup.show()

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should teleport content into the container', () => {
      const container = document.createElement('div')
      document.body.append(container)
      const popup = buildPopup({ container })

      popup.show()

      expect(container.querySelector('#content')).not.toBeNull()
      popup.dispose()
      container.remove()
    })
  })

  describe('hide', () => {
    it('should clear isShown and fire onHide/onHidden in order', () => {
      const calls = []
      const popup = buildPopup({
        onHide: () => calls.push('hide'),
        onHidden: () => calls.push('hidden')
      })

      popup.show()
      popup.hide()

      expect(popup.isShown).toBeFalse()
      expect(calls).toEqual(['hide', 'hidden'])
    })

    it('should be a no-op when not shown', () => {
      const spy = jasmine.createSpy('onHide')
      const popup = buildPopup({ onHide: spy })

      popup.hide()

      expect(spy).not.toHaveBeenCalled()
    })

    it('should restore focus to the previously focused element', () => {
      const popup = buildPopup()
      const outside = fixtureEl.querySelector('#outside')

      outside.focus()
      popup.show()
      fixtureEl.querySelector('#option').focus()
      popup.hide()

      expect(document.activeElement).toEqual(outside)
    })

    it('should not restore focus when returnFocus is false', () => {
      const popup = buildPopup({ returnFocus: false })
      const outside = fixtureEl.querySelector('#outside')
      const option = fixtureEl.querySelector('#option')

      outside.focus()
      popup.show()
      option.focus()
      popup.hide()

      expect(document.activeElement).toEqual(option)
    })
  })

  // The panel is in the DOM only while a choice is being made, and where it
  // goes is decided on every open — these assert the contract that decision
  // follows, because it is what keeps a picker usable inside a modal and
  // unclipped inside a scroll container.
  describe('mounting', () => {
    const buildIn = (markup, config = {}) => {
      fixtureEl.innerHTML = markup

      const popup = new Popup({
        anchor: fixtureEl.querySelector('#anchor'),
        content: fixtureEl.querySelector('#content'),
        focusTrap: false,
        mobileBreakpoint: 0,
        returnFocus: false,
        ...config
      })

      popups.push(popup)
      return popup
    }

    const PLAIN = [
      '<div id="anchor"><button id="inside">toggle</button></div>',
      '<div id="content">panel</div>'
    ].join('')

    it('should keep the panel out of the DOM until it is shown', () => {
      const popup = buildIn(PLAIN)
      const content = fixtureEl.querySelector('#content')
      content.remove()

      expect(content.isConnected).toBeFalse()

      popup.show()

      expect(content.isConnected).toBeTrue()
    })

    it('should mount next to the field, not inside it, when nothing clips', () => {
      const popup = buildIn(PLAIN)
      const anchor = fixtureEl.querySelector('#anchor')
      const content = fixtureEl.querySelector('#content')

      popup.show()

      expect(anchor.contains(content)).toBeFalse()
      expect(anchor.nextElementSibling).toEqual(content)
    })

    it('should escape to the body when an ancestor clips the panel', () => {
      const popup = buildIn([
        '<div style="overflow: hidden; position: relative;">',
        '  <div id="anchor"><button id="inside">toggle</button></div>',
        '</div>',
        '<div id="content">panel</div>'
      ].join(''))

      popup.show()

      expect(fixtureEl.querySelector('#content')).toBeNull()
      expect(document.body.lastElementChild.id).toEqual('content')
    })

    it('should stay inside an open dialog rather than escape to the body', () => {
      const popup = buildIn([
        '<dialog id="host">',
        '  <div style="overflow: hidden; position: relative;">',
        '    <div id="anchor"><button id="inside">toggle</button></div>',
        '  </div>',
        '</dialog>',
        '<div id="content">panel</div>'
      ].join(''))

      const dialog = fixtureEl.querySelector('#host')
      dialog.show()

      popup.show()

      // Outside the dialog's subtree the panel would be painted but inert.
      expect(dialog.contains(fixtureEl.querySelector('#content'))).toBeTrue()

      dialog.close()
    })

    it('should honour an explicit container over the automatic choice', () => {
      fixtureEl.innerHTML = [
        '<div id="target"></div>',
        '<div id="anchor"><button id="inside">toggle</button></div>',
        '<div id="content">panel</div>'
      ].join('')

      const popup = new Popup({
        anchor: fixtureEl.querySelector('#anchor'),
        container: fixtureEl.querySelector('#target'),
        content: fixtureEl.querySelector('#content'),
        focusTrap: false,
        mobileBreakpoint: 0,
        returnFocus: false
      })

      popups.push(popup)
      popup.show()

      expect(fixtureEl.querySelector('#target').firstElementChild.id).toEqual('content')
    })

    it('should return focus before it detaches the panel', () => {
      const popup = buildIn(PLAIN, { returnFocus: true })
      const trigger = fixtureEl.querySelector('#inside')

      trigger.focus()
      popup.show()

      const content = fixtureEl.querySelector('#content')
      content.tabIndex = -1
      content.focus()

      popup.hide()

      // Detaching with the focus still inside would drop it on <body>.
      expect(document.activeElement).toEqual(trigger)
    })
  })

  describe('dismissal', () => {
    it('should hide on outside click', () => {
      const popup = buildPopup()
      popup.show()

      fixtureEl.querySelector('#outside').click()

      expect(popup.isShown).toBeFalse()
    })

    it('should not hide on click inside the anchor or content', () => {
      const popup = buildPopup()
      popup.show()

      fixtureEl.querySelector('#inside').click()
      fixtureEl.querySelector('#option').click()

      expect(popup.isShown).toBeTrue()
    })

    it('should stay open when a click re-renders and detaches its target inside the content', () => {
      const popup = buildPopup()
      popup.show()

      const content = fixtureEl.querySelector('#content')
      const button = document.createElement('button')
      button.addEventListener('click', () => button.remove())
      content.append(button)

      button.click()

      expect(popup.isShown).toBeTrue()
    })

    it('should hide on Escape', () => {
      const popup = buildPopup()
      popup.show()

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

      expect(popup.isShown).toBeFalse()
    })

    it('should not dismiss a sibling popup instance', () => {
      const popupA = buildPopup()
      const contentB = document.createElement('div')
      const anchorB = document.createElement('div')
      document.body.append(contentB, anchorB)
      const popupB = new Popup({ anchor: anchorB, content: contentB, focusTrap: false })
      popups.push(popupB)

      popupA.show()
      popupB.show()
      popupA.hide()

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

      expect(popupB.isShown).toBeFalse()
      contentB.remove()
      anchorB.remove()
    })
  })

  describe('toggle', () => {
    it('should alternate between show and hide', () => {
      const popup = buildPopup()

      popup.toggle()
      expect(popup.isShown).toBeTrue()

      popup.toggle()
      expect(popup.isShown).toBeFalse()
    })
  })

  describe('dispose', () => {
    it('should hide and release references', () => {
      const popup = buildPopup()
      popup.show()

      popup.dispose()

      expect(popup.isShown).toBeFalse()
      expect(popup._anchor).toBeNull()
      expect(popup._content).toBeNull()
    })
  })

  describe('positioning', () => {
    it('should skip positioning in mobile mode', () => {
      // the karma iframe is narrower than the default breakpoint, so mobile
      // mode is what this environment exercises by default
      const popup = buildPopup({ mobileBreakpoint: 100000 })
      popup.show()

      expect(popup.isMobile).toBeTrue()
      expect(fixtureEl.querySelector('#content').style.position).toEqual('')
    })

    it('should absolutely position the content after show', () => {
      return new Promise((resolve, reject) => {
        const popup = buildPopup({ mobileBreakpoint: 0 })
        const content = fixtureEl.querySelector('#content')
        popup.show()

        const waitForPosition = deadline => {
          if (content.style.position === 'absolute') {
            expect(content.style.position).toEqual('absolute')
            resolve()
            return
          }

          if (Date.now() > deadline) {
            reject(new Error(`content was never positioned (position="${content.style.position}", innerWidth=${window.innerWidth}, isMobile=${popup.isMobile})`))
            return
          }

          setTimeout(() => waitForPosition(deadline), 25)
        }

        waitForPosition(Date.now() + 2000)
      })
    })
  })
})

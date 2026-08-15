import Modal from '../../../src/modal.js'
import Popup from '../../../src/util/popup.js'

/**
 * Experiment: does promoting the popup surface to the top layer (Popover API)
 * solve the clipping / stacking problems the `container` teleport exists for,
 * and does Floating UI still position it correctly there?
 *
 * These specs assert observable behavior — what the browser actually paints at
 * a point — rather than the classes we happen to set.
 *
 * Two things about the harness, both learned the hard way:
 *
 * 1. These specs deliberately do NOT use `getFixture()`. That fixture sits at
 *    `left: -10000px`, and a top-layer element is positioned against the
 *    viewport, so Floating UI's `shift()` drags every panel back on screen and
 *    no assertion about placement means anything. Everything mounts on screen.
 * 2. The unit harness loads no stylesheet, so the UA's `[popover]` rules
 *    (`inset: 0; margin: auto`) centre the panel in the viewport and defeat the
 *    coordinates Floating UI writes. The reset below is the same contract
 *    `scss/_popup.scss` ships; without it the top layer cannot be measured.
 */

const POPOVER_CONTRACT = `
  .popup { position: absolute; display: none; background: #fff; }
  .popup.show { display: block; }
  .popup[popover] {
    inset: auto;
    width: fit-content;
    height: fit-content;
    padding: 0;
    margin: 0;
    border: 0;
    overflow: visible;
  }
  .popup[popover]:not(:popover-open) { display: none; }
`

const centerOf = element => {
  const { left, top, width, height } = element.getBoundingClientRect()
  return [left + (width / 2), top + (height / 2)]
}

const topmostAt = (x, y) => document.elementFromPoint(x, y)

// computePosition resolves asynchronously; two frames is enough for the
// promise plus the style write.
const settled = () => new Promise(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(resolve))
})

describe('Popup — top layer experiment', () => {
  let host
  let styleEl

  beforeAll(() => {
    styleEl = document.createElement('style')
    styleEl.textContent = POPOVER_CONTRACT
    document.head.append(styleEl)
  })

  afterAll(() => {
    styleEl.remove()
  })

  beforeEach(() => {
    host = document.createElement('div')
    host.style.position = 'absolute'
    host.style.top = '50px'
    host.style.left = '50px'
    document.body.append(host)
  })

  afterEach(() => {
    for (const el of document.querySelectorAll('[popover]')) {
      if (el.matches(':popover-open')) {
        el.hidePopover()
      }
    }

    for (const dialog of document.querySelectorAll('dialog[open]')) {
      dialog.close()
    }

    host.remove()
    document.documentElement.classList.remove('dialog-open')
  })

  const buildPopup = (markup, config = {}) => {
    host.innerHTML = markup

    return new Popup({
      anchor: host.querySelector('.anchor'),
      content: host.querySelector('.popup'),
      focusTrap: false,
      // The harness viewport is 414px wide, which trips Popup's isMobile
      // branch and skips positioning entirely — these specs are about the
      // anchored (desktop) path.
      mobileBreakpoint: 0,
      returnFocus: false,
      ...config
    })
  }

  describe('support baseline', () => {
    it('should run in a browser that supports the Popover API', () => {
      expect(typeof document.createElement('div').showPopover).toEqual('function')
    })
  })

  describe('escaping an overflow: hidden ancestor', () => {
    const CLIPPING_MARKUP = [
      '<div style="overflow: hidden; height: 40px; width: 200px; position: relative;">',
      '  <button type="button" class="anchor" style="height: 20px;">anchor</button>',
      '  <div class="popup show" style="height: 120px; width: 160px;">panel</div>',
      '</div>'
    ].join('')

    it('should be clipped by the ancestor without the top layer', async () => {
      const popup = buildPopup(CLIPPING_MARKUP, { topLayer: false })
      popup.show()
      await settled()

      const content = host.querySelector('.popup')
      const clipper = content.parentElement

      // The panel is taller than its clipping ancestor, so the area below the
      // ancestor's box is not painted at all.
      const belowClipper = clipper.getBoundingClientRect().bottom + 20
      const [x] = centerOf(content)

      expect(topmostAt(x, belowClipper)).not.toEqual(content)

      popup.dispose()
    })

    it('should paint above the clipping ancestor in the top layer', async () => {
      const popup = buildPopup(CLIPPING_MARKUP, { topLayer: true })
      popup.show()
      await settled()

      const content = host.querySelector('.popup')
      expect(content.matches(':popover-open')).toBeTrue()

      const [x, y] = centerOf(content)
      expect(topmostAt(x, y)).toEqual(content)

      popup.dispose()
    })
  })

  describe('rendering above a native <dialog> modal', () => {
    const openModalWith = popupMarkup => {
      host.innerHTML = [
        '<dialog class="modal modal-instant">',
        '  <div class="modal-body">',
        '    <button type="button" class="anchor">anchor</button>',
        popupMarkup.inside ? popupMarkup.html : '',
        '  </div>',
        '</dialog>',
        popupMarkup.inside ? '' : popupMarkup.html
      ].join('')

      const modal = new Modal(host.querySelector('.modal'))
      modal.show()

      const popup = new Popup({
        anchor: host.querySelector('.anchor'),
        content: host.querySelector('.popup'),
        focusTrap: false,
        mobileBreakpoint: 0,
        returnFocus: false,
        topLayer: true
      })

      popup.show()

      return { modal, popup }
    }

    const PANEL = '<div class="popup show" style="height: 80px; width: 160px;">panel</div>'

    it('should paint above an open modal when it lives inside the dialog', async () => {
      const { modal, popup } = openModalWith({ html: PANEL, inside: true })
      await settled()

      const content = host.querySelector('.popup')
      expect(content.matches(':popover-open')).toBeTrue()

      const [x, y] = centerOf(content)
      expect(topmostAt(x, y)).toEqual(content)

      popup.dispose()
      modal.dispose()
    })

    // The constraint the `container` teleport has to respect from now on: a
    // modal dialog makes everything outside its subtree inert, and the top
    // layer does not exempt a popover from that. The panel is still painted
    // on top, but it stops being hit-testable — so teleporting a picker's
    // popup to `body` would render it visible and dead inside a modal.
    it('should be inert when it lives outside the dialog subtree', async () => {
      const { modal, popup } = openModalWith({ html: PANEL, inside: false })
      await settled()

      const content = host.querySelector('.popup')
      expect(content.matches(':popover-open')).toBeTrue()

      const [x, y] = centerOf(content)
      expect(topmostAt(x, y)).not.toEqual(content)

      popup.dispose()
      modal.dispose()
    })
  })

  describe('Floating UI in the top layer', () => {
    it('should anchor the panel to the trigger, not centre it in the viewport', async () => {
      const popup = buildPopup([
        '<button type="button" class="anchor" style="width: 100px; height: 24px;">anchor</button>',
        '<div class="popup show" style="height: 60px; width: 100px;">panel</div>'
      ].join(''), { offset: [0, 2], placement: 'bottom-start', topLayer: true })

      popup.show()
      await settled()

      const anchor = host.querySelector('.anchor')
      const content = host.querySelector('.popup')
      const anchorRect = anchor.getBoundingClientRect()
      const contentRect = content.getBoundingClientRect()

      expect(getComputedStyle(content).position).toEqual('absolute')
      // bottom-start: left edges aligned, panel just below the anchor
      expect(Math.abs(contentRect.left - anchorRect.left)).toBeLessThan(2)
      expect(contentRect.top).toBeGreaterThanOrEqual(anchorRect.bottom)
      expect(contentRect.top - anchorRect.bottom).toBeLessThan(8)

      popup.dispose()
    })

    // The decisive one for the drift: a top-layer element has no offsetParent,
    // so absolute coordinates resolve against the initial containing block,
    // which scrolls with the document. The browser then carries the panel
    // natively — this asserts alignment survives a scroll with JS positioning
    // switched off entirely, which is what `fixed` could never do.
    it('should follow the page scroll natively, with JS positioning stopped', async () => {
      document.body.style.height = '3000px'
      host.style.top = '600px'

      const popup = buildPopup([
        '<button type="button" class="anchor" style="width: 100px; height: 24px;">anchor</button>',
        '<div class="popup show" style="height: 60px; width: 100px;">panel</div>'
      ].join(''), { placement: 'bottom-start', topLayer: true })

      popup.show()
      await settled()

      const anchor = host.querySelector('.anchor')
      const content = host.querySelector('.popup')
      const gapBefore = content.getBoundingClientRect().top - anchor.getBoundingClientRect().bottom

      // Kill every JS update, so anything that still holds is the browser's
      // own doing.
      popup._stopPositioning()

      window.scrollTo(0, 300)
      await settled()

      const gapAfter = content.getBoundingClientRect().top - anchor.getBoundingClientRect().bottom
      expect(Math.abs(gapAfter - gapBefore)).toBeLessThan(1)

      popup.dispose()
      window.scrollTo(0, 0)
      document.body.style.height = ''
    })

    it('should hide the panel once its anchor is clipped out of view', async () => {
      host.innerHTML = [
        '<div class="scroller" style="overflow: auto; height: 60px; width: 220px; position: relative;">',
        '  <div style="height: 400px;">',
        '    <button type="button" class="anchor" style="margin-top: 200px;">anchor</button>',
        '  </div>',
        '</div>',
        '<div class="popup show" style="height: 50px; width: 120px;">panel</div>'
      ].join('')

      const popup = new Popup({
        anchor: host.querySelector('.anchor'),
        content: host.querySelector('.popup'),
        focusTrap: false,
        mobileBreakpoint: 0,
        returnFocus: false,
        topLayer: true
      })

      const scroller = host.querySelector('.scroller')
      scroller.scrollTop = 200

      popup.show()
      await settled()

      const content = host.querySelector('.popup')
      expect(getComputedStyle(content).visibility).toEqual('visible')

      // Scroll the anchor out of its clipping ancestor
      scroller.scrollTop = 0
      await settled()
      await settled()

      expect(getComputedStyle(content).visibility).toEqual('hidden')

      popup.dispose()
    })
  })

  // The top layer makes the panel viewport-fixed, so it stops scrolling with
  // the content and the main thread has to chase compositor-driven scrolling —
  // which it cannot win, and the panel visibly drifts. `auto` therefore pays
  // that price only where staying in flow would clip or bury the panel.
  describe('anchor covered by a sticky header', () => {
    it('should hide the promoted panel once a sticky header covers the anchor', async () => {
      const navbar = document.createElement('div')
      navbar.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; height: 80px; background: #000; z-index: 1030;'
      document.body.append(navbar)

      host.style.top = '40px'
      host.innerHTML = [
        '<div style="overflow: hidden; position: relative; height: 30px; width: 220px;">',
        '  <button type="button" class="anchor" style="width: 100px; height: 24px;">anchor</button>',
        '</div>',
        '<div class="popup show" style="height: 50px; width: 120px;">panel</div>'
      ].join('')

      const popup = new Popup({
        anchor: host.querySelector('.anchor'),
        content: host.querySelector('.popup'),
        focusTrap: false,
        mobileBreakpoint: 0,
        returnFocus: false,
        topLayer: true
      })

      popup.show()
      await settled()
      await settled()

      const content = host.querySelector('.popup')
      expect(popup._isInTopLayer()).toBeTrue()
      expect(getComputedStyle(content).visibility).toEqual('hidden')

      popup.dispose()
      navbar.remove()
    })

    it('should keep the panel visible when nothing covers the anchor', async () => {
      const popup = buildPopup([
        '<div style="overflow: hidden; position: relative; height: 30px; width: 220px;">',
        '  <button type="button" class="anchor" style="width: 100px; height: 24px;">anchor</button>',
        '</div>',
        '<div class="popup show" style="height: 50px; width: 120px;">panel</div>'
      ].join(''), { topLayer: true })

      popup.show()
      await settled()
      await settled()

      expect(getComputedStyle(host.querySelector('.popup')).visibility).toEqual('visible')

      popup.dispose()
    })
  })

  describe('auto promotion', () => {
    it('should stay in flow when nothing would clip the panel', () => {
      const popup = buildPopup([
        '<button type="button" class="anchor">anchor</button>',
        '<div class="popup show">panel</div>'
      ].join(''), { topLayer: 'auto' })

      popup.show()

      expect(popup._isInTopLayer()).toBeFalse()
      expect(host.querySelector('.popup').hasAttribute('popover')).toBeFalse()

      popup.dispose()
    })

    it('should promote when an ancestor clips overflow', () => {
      const popup = buildPopup([
        '<div style="overflow: hidden; height: 40px; position: relative;">',
        '  <button type="button" class="anchor">anchor</button>',
        '  <div class="popup show">panel</div>',
        '</div>'
      ].join(''), { topLayer: 'auto' })

      popup.show()

      expect(popup._isInTopLayer()).toBeTrue()

      popup.dispose()
    })

    it('should promote when an ancestor creates a containing block', () => {
      const popup = buildPopup([
        '<div style="transform: translateZ(0);">',
        '  <button type="button" class="anchor">anchor</button>',
        '  <div class="popup show">panel</div>',
        '</div>'
      ].join(''), { topLayer: 'auto' })

      popup.show()

      expect(popup._isInTopLayer()).toBeTrue()

      popup.dispose()
    })

    it('should honour an explicit override in both directions', () => {
      const forcedOff = buildPopup([
        '<div style="overflow: hidden; height: 40px; position: relative;">',
        '  <button type="button" class="anchor">anchor</button>',
        '  <div class="popup show">panel</div>',
        '</div>'
      ].join(''), { topLayer: false })

      forcedOff.show()
      expect(forcedOff._isInTopLayer()).toBeFalse()
      forcedOff.dispose()

      const forcedOn = buildPopup([
        '<button type="button" class="anchor">anchor</button>',
        '<div class="popup show">panel</div>'
      ].join(''), { topLayer: true })

      forcedOn.show()
      expect(forcedOn._isInTopLayer()).toBeTrue()
      forcedOn.dispose()
    })
  })

  describe('teardown', () => {
    it('should leave the top layer and drop the attribute on hide', () => {
      const popup = buildPopup([
        '<button type="button" class="anchor">anchor</button>',
        '<div class="popup show">panel</div>'
      ].join(''), { topLayer: true })

      const content = host.querySelector('.popup')

      popup.show()
      expect(content.matches(':popover-open')).toBeTrue()

      popup.hide()
      expect(content.matches(':popover-open')).toBeFalse()
      expect(content.hasAttribute('popover')).toBeFalse()

      popup.dispose()
    })
  })
})

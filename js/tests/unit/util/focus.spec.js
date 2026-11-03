import {
  containsFocus, deepActiveElement, focusFirstUsable, focusIfUsable, focusWithTemporaryTabindex, holdsFocusOrNone
} from '../../../src/util/focus.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('Focus utilities', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('containsFocus', () => {
    it('should tell whether the element or a node inside it holds the focus', () => {
      fixtureEl.innerHTML = '<div id="outer"><button id="inner"></button></div><button id="other"></button>'

      const outer = fixtureEl.querySelector('#outer')
      const inner = fixtureEl.querySelector('#inner')
      const other = fixtureEl.querySelector('#other')

      inner.focus()
      expect(containsFocus(outer)).toBeTrue()
      expect(containsFocus(inner)).toBeTrue()
      expect(containsFocus(other)).toBeFalse()
      expect(containsFocus(null)).toBeFalse()
      expect(containsFocus(undefined)).toBeFalse()
    })

    it('should read the focus of the shadow root the element lives in', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'

      const shadow = fixtureEl.querySelector('#host').attachShadow({ mode: 'open' })
      shadow.innerHTML = '<div id="outer"><button></button></div>'
      shadow.querySelector('button').focus()

      expect(containsFocus(shadow.querySelector('#outer'))).toBeTrue()
    })
  })

  describe('deepActiveElement', () => {
    it('should follow the focus into nested open shadow roots', () => {
      fixtureEl.innerHTML = '<div id="outer"></div><button id="plain"></button>'

      const outer = fixtureEl.querySelector('#outer').attachShadow({ mode: 'open' })
      outer.innerHTML = '<div id="inner"></div>'
      const inner = outer.querySelector('#inner').attachShadow({ mode: 'open' })
      inner.innerHTML = '<button></button>'
      const button = inner.querySelector('button')

      button.focus()
      expect(deepActiveElement(document)).toEqual(button)
      expect(deepActiveElement(outer)).toEqual(button)
      expect(deepActiveElement(inner)).toEqual(button)

      fixtureEl.querySelector('#plain').focus()
      expect(deepActiveElement(document)).toEqual(fixtureEl.querySelector('#plain'))
      expect(deepActiveElement(outer)).toBeNull()
    })

    it('should stop at the host of a closed shadow root', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'

      const host = fixtureEl.querySelector('#host')
      const shadow = host.attachShadow({ mode: 'closed' })
      shadow.innerHTML = '<button></button>'
      shadow.querySelector('button').focus()

      expect(deepActiveElement(document)).toEqual(host)
    })
  })

  describe('focusFirstUsable', () => {
    it('should focus the first element that takes the focus and return it', () => {
      fixtureEl.innerHTML = [
        '<button id="disabled" disabled></button>',
        '<button id="hidden" style="display: none"></button>',
        '<a id="plain">no href</a>',
        '<a id="marked" class="disabled" href="#">disabled by class</a>',
        '<button id="first"></button>',
        '<button id="second"></button>'
      ].join('')

      const [disabled, hidden, plain, marked, first, second] = ['disabled', 'hidden', 'plain', 'marked', 'first', 'second'].map(id => fixtureEl.querySelector(`#${id}`))

      expect(focusFirstUsable([null, disabled, undefined, hidden, plain, marked, first, second])).toEqual(first)
      expect(document.activeElement).toEqual(first)
    })

    it('should return undefined and leave the focus alone when no element takes it', () => {
      fixtureEl.innerHTML = '<button id="current"></button><button id="disabled" disabled></button>'

      const current = fixtureEl.querySelector('#current')
      current.focus()

      expect(focusFirstUsable([fixtureEl.querySelector('#disabled'), null])).toBeUndefined()
      expect(focusFirstUsable([])).toBeUndefined()
      expect(document.activeElement).toEqual(current)
    })

    it('should not count an element that only contained the focus already', () => {
      fixtureEl.innerHTML = '<div id="outer"><button id="inner"></button></div><button id="next"></button>'

      const outer = fixtureEl.querySelector('#outer')
      const next = fixtureEl.querySelector('#next')
      fixtureEl.querySelector('#inner').focus()

      expect(focusFirstUsable([outer, next])).toEqual(next)
      expect(document.activeElement).toEqual(next)
    })

    it('should pass the options on to focus()', () => {
      fixtureEl.innerHTML = '<button></button>'

      const button = fixtureEl.querySelector('button')
      const spy = spyOn(button, 'focus').and.callThrough()

      focusFirstUsable([button], { preventScroll: true })

      expect(spy).toHaveBeenCalledWith({ preventScroll: true })
    })
  })

  describe('focusWithTemporaryTabindex', () => {
    it('should focus an element that has a tabindex and leave the attribute alone', () => {
      fixtureEl.innerHTML = '<div tabindex="0"></div>'

      const element = fixtureEl.querySelector('div')
      focusWithTemporaryTabindex(element)

      expect(document.activeElement).toEqual(element)
      expect(element.getAttribute('tabindex')).toEqual('0')
    })

    it('should give an element without a tabindex one for as long as it holds the focus', () => {
      fixtureEl.innerHTML = '<div></div><button></button>'

      const element = fixtureEl.querySelector('div')
      focusWithTemporaryTabindex(element)

      expect(document.activeElement).toEqual(element)
      expect(element.getAttribute('tabindex')).toEqual('-1')

      fixtureEl.querySelector('button').focus()

      expect(element.hasAttribute('tabindex')).toBeFalse()
    })

    it('should keep the tabindex while the element holds the focus inside a shadow root', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'

      const shadow = fixtureEl.querySelector('#host').attachShadow({ mode: 'open' })
      shadow.innerHTML = '<div></div><button></button>'

      const element = shadow.querySelector('div')
      focusWithTemporaryTabindex(element)

      expect(shadow.activeElement).toEqual(element)
      expect(element.getAttribute('tabindex')).toEqual('-1')

      shadow.querySelector('button').focus()

      expect(element.hasAttribute('tabindex')).toBeFalse()
    })

    it('should take the tabindex back at once when the element cannot take the focus', () => {
      fixtureEl.innerHTML = '<div hidden></div>'

      const element = fixtureEl.querySelector('div')
      focusWithTemporaryTabindex(element)

      expect(element.hasAttribute('tabindex')).toBeFalse()
    })
  })

  describe('holdsFocusOrNone', () => {
    it('should tell whether the focus is inside the element or on the body', () => {
      fixtureEl.innerHTML = '<div id="panel"><button id="inner"></button></div><button id="other"></button>'

      const panel = fixtureEl.querySelector('#panel')

      fixtureEl.querySelector('#inner').focus()
      expect(holdsFocusOrNone(panel)).toBeTrue()

      fixtureEl.querySelector('#other').focus()
      expect(holdsFocusOrNone(panel)).toBeFalse()

      document.activeElement.blur()
      expect(holdsFocusOrNone(panel)).toBeTrue()
      expect(holdsFocusOrNone(null)).toBeFalse()
    })

    it('should look at the document when the focus is outside the shadow root of the element', () => {
      fixtureEl.innerHTML = '<div id="host"></div><input id="light">'

      const shadowRoot = fixtureEl.querySelector('#host').attachShadow({ mode: 'open' })
      const panel = document.createElement('div')
      shadowRoot.append(panel)

      fixtureEl.querySelector('#light').focus()
      expect(holdsFocusOrNone(panel)).toBeFalse()

      document.activeElement.blur()
      expect(holdsFocusOrNone(panel)).toBeTrue()
    })
  })

  describe('focusIfUsable', () => {
    it('should focus only an element in the document that is enabled and visible', () => {
      fixtureEl.innerHTML = '<button id="ok"></button><button id="off" disabled></button><button id="gone" hidden></button>'

      expect(focusIfUsable(fixtureEl.querySelector('#off'))).toBeFalse()
      expect(focusIfUsable(fixtureEl.querySelector('#gone'))).toBeFalse()
      expect(focusIfUsable(document.createElement('button'))).toBeFalse()
      expect(focusIfUsable(null)).toBeFalse()
      expect(focusIfUsable(fixtureEl.querySelector('#ok'), { preventScroll: true })).toBeTrue()
      expect(document.activeElement).toEqual(fixtureEl.querySelector('#ok'))

      fixtureEl.insertAdjacentHTML('beforeend', '<div id="plain">plain</div>')
      expect(focusIfUsable(fixtureEl.querySelector('#plain'))).toBeFalse()
      expect(document.activeElement).toEqual(fixtureEl.querySelector('#ok'))
    })

    it('should not count an element that only contains the focus', () => {
      fixtureEl.innerHTML = '<div id="area"><button id="inside"></button></div>'

      fixtureEl.querySelector('#inside').focus()

      expect(focusIfUsable(fixtureEl.querySelector('#area'))).toBeFalse()
      expect(document.activeElement).toEqual(fixtureEl.querySelector('#inside'))
    })

    it('should count an element inside a shadow root', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'

      const shadow = fixtureEl.querySelector('#host').attachShadow({ mode: 'open' })
      shadow.innerHTML = '<button></button>'

      expect(focusIfUsable(shadow.querySelector('button'))).toBeTrue()
    })

    it('should count an element whose focus() moves the focus inside it', () => {
      fixtureEl.innerHTML = '<div id="field"><input></div>'

      const field = fixtureEl.querySelector('#field')
      field.focus = () => field.querySelector('input').focus()

      expect(focusIfUsable(field)).toBeTrue()
    })

    it('should count a shadow host that hands the focus to its shadow tree', () => {
      fixtureEl.innerHTML = '<div id="host"></div>'

      const host = fixtureEl.querySelector('#host')
      host.attachShadow({ mode: 'open', delegatesFocus: true }).innerHTML = '<button></button>'

      expect(focusIfUsable(host)).toBeTrue()
      expect(host.shadowRoot.activeElement).toEqual(host.shadowRoot.querySelector('button'))
    })
  })
})

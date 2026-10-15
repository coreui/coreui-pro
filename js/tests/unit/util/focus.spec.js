import { containsFocus, focusWithTemporaryTabindex } from '../../../src/util/focus.js'
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
})

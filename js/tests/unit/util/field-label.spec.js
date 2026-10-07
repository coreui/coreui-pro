import { vi } from 'vitest'
import { getFieldHandler, getLabelledElement, onLabelClick } from '../../../src/util/field-label.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('Field label utilities', () => {
  let fixtureEl
  let removers

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  beforeEach(() => {
    removers = []
  })

  afterEach(() => {
    for (const remove of removers) {
      remove()
    }

    window.getSelection().removeAllRanges()
    clearFixture()
  })

  const register = (selector, handler = vi.fn()) => {
    removers.push(onLabelClick(fixtureEl.querySelector(selector), handler))

    return handler
  }

  describe('getLabelledElement', () => {
    it('should find the element the for of a label points at, otherwise the first element whose aria-labelledby lists the label', () => {
      fixtureEl.innerHTML = [
        '<label id="byFor" for="field">For</label>',
        '<span id="byName" class="form-label">Named</span>',
        '<label for="missing" id="fallback">Fallback</label>',
        '<span class="form-label">Nothing</span>',
        '<div id="field"></div>',
        '<div id="first" aria-labelledby="other byName"></div>',
        '<div id="second" aria-labelledby="byName fallback"></div>'
      ].join('')
      const [byFor, byName, fallback, nothing] = fixtureEl.querySelectorAll('label, .form-label')

      expect(getLabelledElement(byFor)).toEqual(fixtureEl.querySelector('#field'))
      expect(getLabelledElement(byName)).toEqual(fixtureEl.querySelector('#first'))
      expect(getLabelledElement(fallback)).toEqual(fixtureEl.querySelector('#second'))
      expect(getLabelledElement(nothing)).toBeNull()
    })

    it('should look the element up in the shadow root that holds the label', () => {
      const host = document.createElement('div')
      fixtureEl.append(host)
      const root = host.attachShadow({ mode: 'open' })
      root.innerHTML = '<label for="field">Name</label><div id="field"></div>'

      expect(getLabelledElement(root.querySelector('label'))).toEqual(root.querySelector('#field'))
    })
  })

  describe('getFieldHandler', () => {
    it('should take the element when it is registered, otherwise the first registered field inside it', () => {
      fixtureEl.innerHTML = '<div id="group"><div><div id="end"></div></div><div id="start"></div><div id="own"></div></div>'
      const end = register('#end')
      register('#start')
      const own = register('#own')

      expect(getFieldHandler(fixtureEl.querySelector('#group'))).toBe(end)
      expect(getFieldHandler(fixtureEl.querySelector('#own'))).toBe(own)
      expect(getFieldHandler(document.createElement('div'))).toBeUndefined()
    })
  })

  describe('onLabelClick', () => {
    it('should call the handler of a field when a label naming it or its group is clicked, until it is unregistered', () => {
      fixtureEl.innerHTML = [
        '<label for="field">For</label>',
        '<span id="name" class="form-label">Named</span>',
        '<label for="group">Group</label>',
        '<div id="field" aria-labelledby="name"></div>',
        '<div id="group"><div id="inner"></div></div>'
      ].join('')
      const handler = vi.fn()
      const remove = onLabelClick(fixtureEl.querySelector('#field'), handler)
      const inner = register('#inner')
      const [byFor, byName, group] = fixtureEl.querySelectorAll('label, .form-label')

      byFor.click()
      byName.click()
      group.click()

      expect(handler).toHaveBeenCalledTimes(2)
      expect(inner).toHaveBeenCalledTimes(1)

      remove()
      byFor.click()

      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('should resolve the label when it is clicked, so a label added after the field works', () => {
      fixtureEl.innerHTML = '<div id="field"></div>'
      const handler = register('#field')
      fixtureEl.insertAdjacentHTML('afterbegin', '<label for="field">Name</label>')

      fixtureEl.querySelector('label').click()

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should call only the first field a label shared through aria-labelledby names', () => {
      fixtureEl.innerHTML = '<span id="stay" class="form-label">Stay</span><div id="a" aria-labelledby="stay"></div><div id="b" aria-labelledby="stay"></div>'
      const b = register('#b')
      const a = register('#a')

      fixtureEl.querySelector('#stay').click()

      expect(a).toHaveBeenCalledTimes(1)
      expect(b).not.toHaveBeenCalled()
    })

    it('should leave a click on a link or a control inside the label to that element', () => {
      fixtureEl.innerHTML = '<label for="field">Name <a href="#field-help">help</a> <button type="button">info</button> <span tabindex="0">more</span></label><div id="field"></div>'
      const handler = register('#field')
      const label = fixtureEl.querySelector('label')

      label.querySelector('a').click()
      label.querySelector('button').click()
      label.querySelector('[tabindex]').click()

      expect(handler).not.toHaveBeenCalled()
    })

    it('should leave a click the page prevented, a double click and a click on a label with a control of its own', () => {
      fixtureEl.innerHTML = [
        '<label for="field" id="prevented">Prevented</label>',
        '<label for="field" id="twice">Twice</label>',
        '<label id="wrapping"><span>Wrapping</span><div id="wrapped" aria-labelledby="wrapping"></div><input></label>',
        '<div id="field"></div>'
      ].join('')
      const handler = register('#field')
      const wrapped = register('#wrapped')
      fixtureEl.querySelector('#prevented').addEventListener('click', event => event.preventDefault())

      fixtureEl.querySelector('#prevented').click()
      fixtureEl.querySelector('#twice').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 2 }))
      fixtureEl.querySelector('#wrapping span').click()

      expect(handler).not.toHaveBeenCalled()
      expect(wrapped).not.toHaveBeenCalled()
    })

    it('should leave a click while the text of the label is selected', () => {
      fixtureEl.innerHTML = '<label for="field">Name</label><div id="field"></div>'
      const handler = register('#field')
      const label = fixtureEl.querySelector('label')
      window.getSelection().selectAllChildren(label)

      label.click()

      expect(handler).not.toHaveBeenCalled()
    })

    it('should stop listening on the document once its last field is unregistered', () => {
      fixtureEl.innerHTML = '<div id="a"></div><div id="b"></div>'
      const spy = vi.spyOn(document, 'removeEventListener')
      const removeA = onLabelClick(fixtureEl.querySelector('#a'), vi.fn())
      const removeB = onLabelClick(fixtureEl.querySelector('#b'), vi.fn())

      removeA()

      expect(spy).not.toHaveBeenCalledWith('click', expect.any(Function))

      removeB()

      expect(spy).toHaveBeenCalledWith('click', expect.any(Function))
    })
  })
})

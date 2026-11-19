import EventHandler from '../../../src/dom/event-handler.js'
import {
  decodeFragment, enableHashTarget, getFragmentTarget, getHashTarget
} from '../../../src/util/hash-target.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('Hash targets', () => {
  let fixture
  const namespace = '.hash-target-test'
  const setHash = hash => {
    const url = new URL(window.location.href)
    url.hash = hash
    window.history.replaceState(null, '', url)
  }

  beforeEach(() => {
    fixture = getFixture()
    setHash('')
  })

  afterEach(() => {
    EventHandler.off(window, namespace)
    setHash('')
    clearFixture()
  })

  it('should decode valid escapes and retain malformed escapes', () => {
    expect(decodeFragment('a%3Ab')).toEqual('a:b')
    expect(decodeFragment('a%zz')).toEqual('a%zz')
  })

  it('should resolve punctuation without treating the fragment as a selector', () => {
    fixture.innerHTML = '<div id="a:b.c/%" data-coreui-hash></div>'
    setHash('a%3Ab.c%2F%25')
    expect(getHashTarget()).toBe(fixture.firstElementChild)
    fixture.firstElementChild.removeAttribute('data-coreui-hash')
    expect(getHashTarget()).toBeNull()
  })

  it('should resolve the fragment element with or without the opt-in', () => {
    fixture.innerHTML = '<div id="plain-target"></div>'
    expect(getFragmentTarget()).toBeNull()

    setHash('plain-target')
    expect(getFragmentTarget()).toBe(fixture.firstElementChild)
    expect(getHashTarget()).toBeNull()

    setHash('missing')
    expect(getFragmentTarget()).toBeNull()
  })

  it('should open the current hash when initialized after load', async () => {
    fixture.innerHTML = '<div id="late-target" data-coreui-hash></div>'
    setHash('late-target')
    const open = jasmine.createSpy('open')
    spyOnProperty(document, 'readyState', 'get').and.returnValue('complete')
    enableHashTarget(namespace, { matches: () => true, open })
    await new Promise(resolve => {
      setTimeout(resolve)
    })
    expect(open).toHaveBeenCalledWith(fixture.firstElementChild, jasmine.any(Function))
  })

  it('should focus a focusable target when the page had focus at the navigation', () => {
    fixture.innerHTML = '<div id="focusable" tabindex="0" data-coreui-hash></div><div id="plain" data-coreui-hash></div>'
    const [focusable, plain] = fixture.children
    const pending = []
    enableHashTarget(namespace, { matches: () => true, open: (element, done) => pending.push(done) })
    document.activeElement.blur()

    setHash('plain')
    window.dispatchEvent(new Event('hashchange'))
    pending[0]()
    expect(document.activeElement).toBe(document.body)
    expect(plain).not.toBe(document.activeElement)

    setHash('focusable')
    window.dispatchEvent(new Event('hashchange'))
    pending[1]()
    expect(document.activeElement).toBe(focusable)
  })

  it('should focus the target when the followed link keeps focus', () => {
    fixture.innerHTML = '<a href="#linked">Linked</a><div id="linked" tabindex="-1" data-coreui-hash></div>'
    const [link, target] = fixture.children
    enableHashTarget(namespace, { matches: () => true, open: (element, done) => done() })
    link.focus()

    setHash('linked')
    window.dispatchEvent(new Event('hashchange'))

    expect(document.activeElement).toBe(target)
  })

  it('should focus the target when the followed link was hidden by the opening', () => {
    fixture.innerHTML = '<div><a href="#next">Next</a></div><div id="next" tabindex="-1" data-coreui-hash></div>'
    const [wrap, target] = fixture.children
    const link = wrap.firstElementChild
    enableHashTarget(namespace, {
      matches: () => true,
      open(element, done) {
        wrap.style.display = 'none'
        link.blur()
        done()
      }
    })
    link.focus()

    setHash('next')
    window.dispatchEvent(new Event('hashchange'))

    expect(document.activeElement).toBe(target)
  })

  it('should leave focus on a link to another fragment', () => {
    fixture.innerHTML = '<a href="#elsewhere">Elsewhere</a><div id="other" tabindex="0" data-coreui-hash></div>'
    const [link] = fixture.children
    enableHashTarget(namespace, { matches: () => true, open: (element, done) => done() })
    link.focus()

    setHash('other')
    window.dispatchEvent(new Event('hashchange'))

    expect(document.activeElement).toBe(link)
  })

  it('should focus the target on load when nothing has focus', () => {
    fixture.innerHTML = '<div id="arrival" tabindex="0" data-coreui-hash></div>'
    const target = fixture.firstElementChild
    enableHashTarget(namespace, { matches: () => true, open: (element, done) => done() })
    document.activeElement.blur()

    setHash('arrival')
    window.dispatchEvent(new Event('load'))

    expect(document.activeElement).toBe(target)
  })

  it('should leave focus in a field the user moved to before load', () => {
    fixture.innerHTML = '<input type="text" aria-label="Search"><div id="loaded" tabindex="0" data-coreui-hash></div>'
    const [input, target] = fixture.children
    enableHashTarget(namespace, { matches: () => true, open: (element, done) => done() })
    input.focus()

    setHash('loaded')
    window.dispatchEvent(new Event('load'))

    expect(document.activeElement).toBe(input)
    expect(target).not.toBe(document.activeElement)
  })

  it('should leave focus in a field that has it at the navigation', () => {
    fixture.innerHTML = '<textarea aria-label="Comment"></textarea><div id="history" tabindex="0" data-coreui-hash></div>'
    const [textarea] = fixture.children
    enableHashTarget(namespace, { matches: () => true, open: (element, done) => done() })
    textarea.focus()

    setHash('history')
    window.dispatchEvent(new Event('hashchange'))

    expect(document.activeElement).toBe(textarea)
  })

  it('should not take focus back when it moved during the opening', () => {
    fixture.innerHTML = '<input type="text" aria-label="Name"><div id="moving" tabindex="0" data-coreui-hash></div>'
    const [input] = fixture.children
    let finish
    enableHashTarget(namespace, {
      matches: () => true,
      open(element, done) {
        finish = done
      }
    })
    document.activeElement.blur()

    setHash('moving')
    window.dispatchEvent(new Event('hashchange'))
    input.focus()
    finish()

    expect(document.activeElement).toBe(input)
  })

  it('should open a hidden target whose parent is visible', () => {
    fixture.innerHTML = '<div><div id="closed" style="display: none" data-coreui-hash></div></div>'
    const open = jasmine.createSpy('open')
    enableHashTarget(namespace, { matches: () => true, open })

    setHash('closed')
    window.dispatchEvent(new Event('hashchange'))

    expect(open).toHaveBeenCalledWith(fixture.querySelector('#closed'), jasmine.any(Function))
  })

  it('should leave a target inside a hidden ancestor closed', () => {
    fixture.innerHTML = '<div style="display: none"><div id="nested" data-coreui-hash></div></div><div style="visibility: hidden"><div id="invisible" data-coreui-hash></div></div>'
    const open = jasmine.createSpy('open')
    enableHashTarget(namespace, { matches: () => true, open })

    setHash('nested')
    window.dispatchEvent(new Event('hashchange'))
    setHash('invisible')
    window.dispatchEvent(new Event('hashchange'))

    expect(open).not.toHaveBeenCalled()
  })

  it('should ignore a completed animation after navigation to another hash', () => {
    fixture.innerHTML = '<div id="first" data-coreui-hash></div><div id="second" data-coreui-hash></div>'
    const first = fixture.firstElementChild
    const second = fixture.lastElementChild
    const firstScroll = spyOn(first, 'scrollIntoView')
    const secondScroll = spyOn(second, 'scrollIntoView')
    const pending = []
    enableHashTarget(namespace, { matches: () => true, open: (element, done) => pending.push(done) })
    setHash('first')
    window.dispatchEvent(new Event('hashchange'))
    setHash('second')
    window.dispatchEvent(new Event('hashchange'))
    pending[0]()
    pending[1]()
    expect(firstScroll).not.toHaveBeenCalled()
    expect(secondScroll).toHaveBeenCalledTimes(1)
  })

  it('should ignore a removed target and a cleared fragment', () => {
    fixture.innerHTML = '<div id="removed" data-coreui-hash></div>'
    let finish
    const target = fixture.firstElementChild
    const scroll = spyOn(target, 'scrollIntoView')
    enableHashTarget(namespace, {
      matches: () => true,
      open(element, done) {
        finish = done
      }
    })
    setHash('removed')
    window.dispatchEvent(new Event('hashchange'))
    target.remove()
    setHash('')
    finish()
    expect(scroll).not.toHaveBeenCalled()
  })
})

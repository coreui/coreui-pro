import {
  closeLayersIn, getLayerAnchorFor, getLayerFocusTargetFor, getParentLayer, handleEscape, isInDescendantParts, registerLayer, settleClick,
  unregisterLayer
} from '../../../src/util/layers.js'
import { trackPress } from '../../../src/util/press.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('layers', () => {
  let fixtureEl
  let calls

  const state = () => globalThis[Symbol.for('coreui.layers')]

  const layer = (name, { anchor, kind = 'popup', parts, refuses = [] } = {}) => {
    const entry = {
      open: true,
      anchor: () => anchor,
      closesOn: reason => !refuses.includes(reason),
      dismiss(reason) {
        calls.push({ name, reason })
        entry.open = false
        unregisterLayer(entry, reason)
      },
      isOpen: () => entry.open,
      kind,
      parts: () => parts
    }
    return entry
  }

  const el = selector => fixtureEl.querySelector(selector)

  const escape = (target, init = {}) => {
    const event = new KeyboardEvent('keydown', {
      bubbles: true, cancelable: true, composed: true, key: 'Escape', ...init
    })
    target.dispatchEvent(event)
    return event
  }

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  beforeEach(() => {
    calls = []
  })

  afterEach(() => {
    state()?.stack.splice(0)
    state()?.requested.clear()
    state()?.closed.splice(0)
    clearFixture()
  })

  it('should give a layer the deepest open layer holding its anchor as parent, and adopt children registered first', () => {
    fixtureEl.innerHTML = [
      '<div id="m"><button id="d-toggle"></button><div id="d-panel"><input id="l-field"></div></div>',
      '<div id="l-panel"></div>'
    ].join('')

    const l = layer('l', { anchor: el('#l-field'), parts: [el('#l-field'), el('#l-panel')] })
    const d = layer('d', { anchor: el('#d-toggle'), parts: [el('#d-toggle'), el('#d-panel')] })
    const m = layer('m', { kind: 'dialog', parts: [el('#m')] })
    registerLayer(l)
    registerLayer(d)
    registerLayer(m)

    expect(getParentLayer(l)).toBe(d)
    expect(getParentLayer(d)).toBe(m)
    expect(getParentLayer(m)).toBeNull()

    for (const entry of [l, d, m]) {
      unregisterLayer(entry)
    }

    registerLayer(m)
    registerLayer(d)
    registerLayer(l)

    expect(getParentLayer(l)).toBe(d)
    expect(calls).toEqual([])
  })

  it('should cross shadow roots when it looks for the parent', () => {
    fixtureEl.innerHTML = '<button id="d-toggle"></button><div id="d-panel"><div id="host"></div></div>'

    const shadow = el('#host').attachShadow({ mode: 'open' })
    shadow.innerHTML = '<input id="field">'
    const d = layer('d', { anchor: el('#d-toggle'), parts: [el('#d-toggle'), el('#d-panel')] })
    const l = layer('l', { anchor: shadow.querySelector('#field'), parts: [shadow.querySelector('#field')] })
    registerLayer(d)
    registerLayer(l)

    expect(getParentLayer(l)).toBe(d)
    expect(calls).toEqual([])
  })

  it('should ask open siblings to close when a layer opens, but not its ancestors, nor a layer that refuses', () => {
    fixtureEl.innerHTML = [
      '<button id="a"></button><div id="a-panel"><button id="c"></button></div>',
      '<button id="b"></button><div id="b-panel"></div>',
      '<button id="k"></button><div id="k-panel"></div>'
    ].join('')

    const a = layer('a', { anchor: el('#a'), parts: [el('#a'), el('#a-panel')] })
    const k = layer('k', { anchor: el('#k'), parts: [el('#k'), el('#k-panel')], refuses: ['sibling'] })
    const c = layer('c', { anchor: el('#c'), parts: [el('#c')] })
    const b = layer('b', { anchor: el('#b'), parts: [el('#b'), el('#b-panel')] })
    registerLayer(k)
    registerLayer(a)
    registerLayer(c)

    expect(calls).toEqual([])

    registerLayer(b)

    expect(calls.map(call => [call.name, call.reason])).toEqual([
      ['a', 'sibling'],
      ['c', 'parent']
    ])
    expect(k.open).toBeTrue()
  })

  it('should change nothing when a layer registers twice', () => {
    fixtureEl.innerHTML = '<button id="a"></button><button id="b"></button>'

    const a = layer('a', { anchor: el('#a'), parts: [el('#a')], refuses: ['sibling'] })
    const b = layer('b', { anchor: el('#b'), parts: [el('#b')] })
    registerLayer(a)
    registerLayer(b)
    registerLayer(a)

    expect(state().stack.map(record => record.entry)).toEqual([a, b])
    expect(calls).toEqual([])
  })

  it('should close the descendants first, deepest first and without the focus, and hand the focus back from a descendant', () => {
    fixtureEl.innerHTML = [
      '<button id="d"></button><div id="d-panel"><input id="l"></div>',
      '<div id="l-panel"><button id="p"></button></div>',
      '<div id="p-panel"><button id="day">1</button></div>'
    ].join('')

    const d = layer('d', { anchor: el('#d'), parts: [el('#d'), el('#d-panel')] })
    const l = layer('l', { anchor: el('#l'), parts: [el('#l'), el('#l-panel')] })
    const p = layer('p', { anchor: el('#p'), parts: [el('#p-panel')] })
    registerLayer(d)
    registerLayer(l)
    registerLayer(p)
    el('#day').focus()

    const result = unregisterLayer(d)

    expect(calls.map(call => [call.name, call.reason])).toEqual([
      ['p', 'parent'],
      ['l', 'parent']
    ])
    expect(result.returnFocus).toBeTrue()
    expect(state().stack).toEqual([])
  })

  it('should hand the focus back for a sibling only from inside, never for an outside click or a parent, nor when the focus is elsewhere', () => {
    fixtureEl.innerHTML = '<button id="d"></button><div id="d-panel"><button id="item"></button></div><input id="elsewhere">'

    const open = () => {
      const d = layer('d', { anchor: el('#d'), parts: [el('#d'), el('#d-panel')] })
      registerLayer(d)
      return d
    }

    el('#item').focus()

    for (const reason of ['outside', 'parent']) {
      expect(unregisterLayer(open(), reason).returnFocus).toBeFalse()
    }

    expect(unregisterLayer(open(), 'sibling').returnFocus).toBeTrue()
    expect(unregisterLayer(open(), 'escape').returnFocus).toBeTrue()

    el('#elsewhere').focus()

    expect(unregisterLayer(open()).returnFocus).toBeFalse()

    el('#elsewhere').blur()

    expect(unregisterLayer(open()).returnFocus).toBeTrue()
    expect(unregisterLayer(open(), 'sibling').returnFocus).toBeFalse()
  })

  it('should hand the focus back from a descendant that closed earlier in the same task, but not in a later one', async () => {
    fixtureEl.innerHTML = [
      '<button id="d"></button><div id="d-panel"><input id="l"></div>',
      '<div id="l-panel"><button id="day">1</button></div>'
    ].join('')

    const open = () => {
      const d = layer('d', { anchor: el('#d'), parts: [el('#d'), el('#d-panel')] })
      const l = layer('l', { anchor: el('#l'), parts: [el('#l'), el('#l-panel')] })
      registerLayer(d)
      registerLayer(l)
      el('#day').focus()
      expect(unregisterLayer(l, 'outside').returnFocus).toBeFalse()
      return d
    }

    expect(unregisterLayer(open()).returnFocus).toBeTrue()

    const d = open()
    await new Promise(resolve => {
      setTimeout(resolve)
    })

    expect(unregisterLayer(d).returnFocus).toBeFalse()
  })

  it('should move a descendant that stays open to the parent of the closing layer', () => {
    fixtureEl.innerHTML = '<div id="m"><button id="d"></button><div id="d-panel"><input id="l"></div></div>'

    const m = layer('m', { kind: 'dialog', parts: [el('#m')] })
    const d = layer('d', { anchor: el('#d'), parts: [el('#d'), el('#d-panel')] })
    const l = layer('l', { anchor: el('#l'), parts: [el('#l')], refuses: ['parent'] })
    registerLayer(m)
    registerLayer(d)
    registerLayer(l)
    unregisterLayer(d)

    expect(l.open).toBeTrue()
    expect(getParentLayer(l)).toBe(m)
  })

  it('should decide a click at once for a component that stops it, and leave alone a click the page stops before the document', () => {
    fixtureEl.innerHTML = '<div id="d-panel"></div><button id="own"></button><button id="page"></button>'

    const d = layer('d', { parts: [el('#d-panel')] })
    registerLayer(d)
    el('#page').addEventListener('click', event => event.stopPropagation())
    el('#page').click()

    expect(d.open).toBeTrue()

    el('#own').addEventListener('click', event => {
      settleClick(event)
      event.stopPropagation()
    })
    el('#own').click()

    expect(calls.map(call => [call.name, call.reason])).toEqual([['d', 'outside']])
  })

  it('should keep the layers open on a click the page stops on the document', () => {
    fixtureEl.innerHTML = '<div id="d-panel"></div><button id="outside"></button>'

    const stop = event => event.stopPropagation()
    const d = layer('d', { parts: [el('#d-panel')] })
    registerLayer(d)
    document.addEventListener('click', stop)
    el('#outside').click()
    document.removeEventListener('click', stop)

    expect(d.open).toBeTrue()
  })

  it('should leave a layer that opened during the press of the click, and close one open before the press', () => {
    fixtureEl.innerHTML = '<div id="a-panel"></div><div id="b-panel"></div><button id="opener"></button>'

    const a = layer('a', { parts: [el('#a-panel')], refuses: ['sibling'] })
    const b = layer('b', { parts: [el('#b-panel')] })
    registerLayer(a)
    el('#opener').addEventListener('pointerdown', () => registerLayer(b))
    el('#opener').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }))
    el('#opener').click()

    expect(calls.map(call => [call.name, call.reason])).toEqual([['a', 'outside']])
    expect(b.open).toBeTrue()
  })

  it('should leave the first layer of a window that opens during the press of the click', () => {
    const iframe = document.createElement('iframe')
    fixtureEl.append(iframe)
    const doc = iframe.contentDocument
    doc.body.innerHTML = '<div id="panel"></div><button id="opener"></button>'
    trackPress(doc)
    state().pressed = null

    const d = layer('d', { parts: [doc.querySelector('#panel')] })
    const opener = doc.querySelector('#opener')
    opener.addEventListener('pointerdown', () => registerLayer(d))
    opener.dispatchEvent(new iframe.contentWindow.PointerEvent('pointerdown', { bubbles: true, composed: true, button: 0 }))
    opener.dispatchEvent(new iframe.contentWindow.MouseEvent('click', { bubbles: true, composed: true }))

    expect(d.open).toBeTrue()
  })

  it('should give the focus target of the deepest open layer holding an element, or its anchor', () => {
    fixtureEl.innerHTML = '<button id="d"></button><div id="d-panel"><input id="l"><input id="l-field"></div><div id="l-panel"><span id="in-l"></span></div>'

    const d = layer('d', { anchor: el('#d'), parts: [el('#d'), el('#d-panel')] })
    const l = layer('l', { anchor: el('#l'), parts: [el('#l'), el('#l-panel')] })
    l.focusTarget = () => el('#l-field')
    registerLayer(d)
    registerLayer(l)

    expect(getLayerFocusTargetFor(el('#in-l'))).toEqual(el('#l-field'))
    expect(getLayerFocusTargetFor(el('#d-panel'))).toEqual(el('#d'))
    expect(getLayerFocusTargetFor(document.body)).toBeNull()
  })

  it('should record the presses of the document a layer opens in', () => {
    const iframe = document.createElement('iframe')
    fixtureEl.append(iframe)
    const doc = iframe.contentDocument
    doc.body.innerHTML = '<div id="panel"><button id="inside"></button></div>'

    const d = layer('d', { parts: [doc.querySelector('#panel')] })
    registerLayer(d)
    doc.querySelector('#inside').dispatchEvent(new iframe.contentWindow.PointerEvent('pointerdown', {
      bubbles: true, composed: true, button: 0
    }))
    doc.body.dispatchEvent(new iframe.contentWindow.MouseEvent('click', { bubbles: true, composed: true }))

    expect(d.open).toBeTrue()
  })

  it('should take off the stack a layer whose parts left the document', () => {
    fixtureEl.innerHTML = '<div id="d-panel"></div>'

    const d = layer('d', { parts: [el('#d-panel')] })
    registerLayer(d)
    el('#d-panel').remove()
    document.activeElement.blur()
    const event = escape(document.body)

    expect(event.defaultPrevented).toBeFalse()
    expect(calls).toEqual([])
    expect(state().stack).toEqual([])
  })

  it('should keep a layer whose parts are not rendered, and move the children of a dropped layer to its parent', () => {
    fixtureEl.innerHTML = [
      '<div id="g"><button id="p-anchor"></button></div>',
      '<div id="p-panel"><button id="c-anchor"></button></div>',
      '<div id="c-panel"></div><div id="e-panel"></div>'
    ].join('')

    const unrendered = layer('u', { parts: [null] })
    const g = layer('g', { parts: [el('#g')] })
    const p = layer('p', { anchor: el('#p-anchor'), parts: [el('#p-panel')] })
    const c = layer('c', { anchor: el('#c-anchor'), parts: [el('#c-panel')] })
    const e = layer('e', { parts: [el('#e-panel')] })
    e.closesSiblings = () => false
    unrendered.closesOn = () => false
    registerLayer(unrendered)
    registerLayer(g)
    registerLayer(p)
    registerLayer(c)
    el('#p-panel').remove()
    registerLayer(e)

    expect(state().stack.map(record => record.entry)).toEqual([unrendered, g, c, e])
    expect(getParentLayer(c)).toBe(g)
  })

  it('should drop a layer whose parts left the document when another one opens', () => {
    fixtureEl.innerHTML = '<div id="d-panel"></div><div id="e-panel"></div>'

    const d = layer('d', { parts: [el('#d-panel')] })
    const e = layer('e', { parts: [el('#e-panel')] })
    d.closesOn = () => false
    registerLayer(d)
    el('#d-panel').remove()
    registerLayer(e)

    expect(state().stack.map(record => record.entry)).toEqual([e])
  })

  it('should leave the open layers alone when a layer that does not close its siblings opens', () => {
    fixtureEl.innerHTML = '<div id="a-panel"></div><div id="b-panel"></div><div id="c-panel"></div>'

    const a = layer('a', { parts: [el('#a-panel')] })
    const b = layer('b', { parts: [el('#b-panel')] })
    b.closesSiblings = () => false
    registerLayer(a)
    registerLayer(b)

    expect(a.open).toBeTrue()

    registerLayer(layer('c', { parts: [el('#c-panel')] }))

    expect(calls.map(call => [call.name, call.reason])).toEqual([['a', 'sibling'], ['b', 'sibling']])
  })

  it('should close every layer a click lands outside of, from the top, and leave the ones it touched', () => {
    fixtureEl.innerHTML = [
      '<button id="d"></button><div id="d-panel"><input id="l"><span id="in-d"></span></div>',
      '<div id="l-panel"><button id="option"></button></div>',
      '<button id="outside"></button>'
    ].join('')

    const open = () => {
      const d = layer('d', { anchor: el('#d'), parts: [el('#d'), el('#d-panel')] })
      const l = layer('l', { anchor: el('#l'), parts: [el('#l'), el('#l-panel')] })
      registerLayer(d)
      registerLayer(l)
      calls = []
      return { d, l }
    }

    let layers = open()
    el('#option').click()

    expect(calls).toEqual([])

    el('#in-d').click()

    expect(calls.map(call => [call.name, call.reason])).toEqual([['l', 'outside']])
    expect(layers.d.open).toBeTrue()

    unregisterLayer(layers.d)
    layers = open()
    el('#outside').click()

    expect(calls.map(call => [call.name, call.reason])).toEqual([['l', 'outside'], ['d', 'outside']])
  })

  it('should count a click in a child that closes during the click as a click inside the parent', () => {
    fixtureEl.innerHTML = '<button id="d"></button><div id="d-panel"><input id="l"></div><div id="l-panel"><button id="option"></button></div>'

    const d = layer('d', { anchor: el('#d'), parts: [el('#d'), el('#d-panel')] })
    const l = layer('l', { anchor: el('#l'), parts: [el('#l'), el('#l-panel')] })
    registerLayer(d)
    registerLayer(l)
    const option = el('#option')
    option.addEventListener('click', () => {
      l.open = false
      unregisterLayer(l)
      el('#l-panel').remove()
    })
    option.click()

    expect(d.open).toBeTrue()
    expect(calls).toEqual([])
  })

  it('should leave a layer that the click itself opened', () => {
    fixtureEl.innerHTML = '<button id="opener"></button><div id="panel"></div>'

    const opened = layer('opened', { anchor: el('#panel'), parts: [el('#panel')] })
    const opener = el('#opener')
    opener.addEventListener('click', () => registerLayer(opened))
    opener.click()

    expect(opened.open).toBeTrue()
    expect(calls).toEqual([])
  })

  it('should tell whether a click landed in a descendant', () => {
    fixtureEl.innerHTML = '<button id="d"></button><div id="d-panel"><input id="l"><span id="in-d"></span></div><div id="l-panel"></div>'

    const d = layer('d', { anchor: el('#d'), parts: [el('#d'), el('#d-panel')], refuses: ['outside'] })
    const l = layer('l', { anchor: el('#l'), parts: [el('#l'), el('#l-panel')], refuses: ['outside'] })
    registerLayer(d)
    registerLayer(l)
    const answers = []
    fixtureEl.addEventListener('click', event => answers.push(isInDescendantParts(event, d)))
    el('#l-panel').click()
    el('#in-d').click()

    expect(answers).toEqual([true, false])

    const keyup = new KeyboardEvent('keyup', { bubbles: true, key: 'Tab' })
    let answer = null
    el('#l-panel').addEventListener('keyup', event => {
      answer = isInDescendantParts(event, d)
    })
    el('#l-panel').dispatchEvent(keyup)

    expect(answer).toBeTrue()
  })

  it('should close the layer an Escape comes from and stop it, also when the layer refuses', () => {
    fixtureEl.innerHTML = '<div id="d-panel"><button id="item"></button></div><div id="k-panel"><button id="k-item"></button></div>'

    const d = layer('d', { parts: [el('#d-panel')] })
    const k = layer('k', { parts: [el('#k-panel')], refuses: ['escape', 'sibling'] })
    registerLayer(k)
    registerLayer(d)
    el('#d-panel').addEventListener('keydown', event => handleEscape(event, d))
    el('#k-panel').addEventListener('keydown', event => handleEscape(event, k))
    const reached = jasmine.createSpy('reached')
    fixtureEl.addEventListener('keydown', reached)

    const refused = escape(el('#k-item'))

    expect(refused.defaultPrevented).toBeTrue()
    expect(handleEscape(new KeyboardEvent('keydown', { key: 'Escape' }), k)).toBeTrue()
    expect(handleEscape(new KeyboardEvent('keydown', { key: 'Enter' }), k)).toBeFalse()
    expect(k.open).toBeTrue()

    const accepted = escape(el('#item'))

    expect(accepted.defaultPrevented).toBeTrue()
    expect(calls.map(call => [call.name, call.reason])).toEqual([['d', 'escape']])
    expect(reached).not.toHaveBeenCalled()
  })

  it('should let a handled Escape pass, and stop a repeated or composing one without closing', () => {
    fixtureEl.innerHTML = '<div id="d-panel"><input id="field"></div>'

    const d = layer('d', { parts: [el('#d-panel')] })
    registerLayer(d)
    el('#d-panel').addEventListener('keydown', event => handleEscape(event, d))
    const reached = jasmine.createSpy('reached')
    fixtureEl.addEventListener('keydown', reached)
    el('#field').addEventListener('keydown', event => {
      if (event.ctrlKey) {
        event.preventDefault()
      }
    })

    escape(el('#field'), { ctrlKey: true })

    expect(reached).toHaveBeenCalledTimes(1)

    const repeated = escape(el('#field'), { repeat: true })
    const composing = escape(el('#field'), { isComposing: true })

    expect(repeated.defaultPrevented).toBeTrue()
    expect(composing.defaultPrevented).toBeFalse()
    expect(reached).toHaveBeenCalledTimes(1)
    expect(d.open).toBeTrue()
  })

  it('should let an Escape from an open dialog the layer does not sit in pass to the dialog, and handle one from a dialog it sits in', () => {
    fixtureEl.innerHTML = '<div id="d-panel"><dialog id="m"><input id="field"></dialog></div><dialog id="n"><div id="e-panel"><input id="inner"></div></dialog>'

    const d = layer('d', { parts: [el('#d-panel')] })
    registerLayer(d)
    el('#m').showModal()
    el('#d-panel').addEventListener('keydown', event => handleEscape(event, d))
    el('#field').focus()
    const event = escape(el('#field'))

    expect(event.defaultPrevented).toBeFalse()
    expect(d.open).toBeTrue()

    el('#m').close()
    el('#n').show()
    const e = layer('e', { parts: [el('#e-panel')], refuses: ['sibling'] })
    registerLayer(e)
    el('#e-panel').addEventListener('keydown', event => handleEscape(event, e))
    el('#inner').focus()

    expect(escape(el('#inner')).defaultPrevented).toBeTrue()
    expect(e.open).toBeFalse()
    el('#n').close()
  })

  it('should send an Escape with the focus on no element to the top layer, but not to a dialog, and not from a page field', () => {
    fixtureEl.innerHTML = '<div id="d-panel"></div><div id="m"></div><input id="search">'

    const d = layer('d', { parts: [el('#d-panel')], refuses: ['sibling'] })
    registerLayer(d)
    el('#search').focus()
    escape(el('#search'))

    expect(d.open).toBeTrue()

    el('#search').blur()
    const m = layer('m', { kind: 'dialog', parts: [el('#m')], refuses: ['sibling'] })
    registerLayer(m)
    escape(document.body)

    expect(d.open).toBeTrue()
    expect(m.open).toBeTrue()

    unregisterLayer(m)
    const event = escape(document.body)

    expect(event.defaultPrevented).toBeTrue()
    expect(d.open).toBeFalse()
  })

  it('should close the layers anchored inside an element that hides', () => {
    fixtureEl.innerHTML = '<div id="submenu"><input id="field"></div><button id="other"></button>'

    const inside = layer('inside', { anchor: el('#field'), parts: [el('#field')], refuses: ['sibling'] })
    const outside = layer('outside', { anchor: el('#other'), parts: [el('#other')], refuses: ['sibling'] })
    registerLayer(inside)
    registerLayer(outside)
    closeLayersIn(el('#submenu'))

    expect(calls.map(call => [call.name, call.reason])).toEqual([['inside', 'parent']])
    expect(outside.open).toBeTrue()
  })

  it('should give the anchor of the deepest open layer holding an element', () => {
    fixtureEl.innerHTML = '<button id="d"></button><div id="d-panel"><button id="item"></button><input id="l"></div><div id="l-panel"><button id="option"></button></div><button id="free"></button>'

    registerLayer(layer('d', { anchor: el('#d'), parts: [el('#d'), el('#d-panel')] }))
    registerLayer(layer('l', { anchor: el('#l'), parts: [el('#l'), el('#l-panel')] }))

    expect(getLayerAnchorFor(el('#item'))).toBe(el('#d'))
    expect(getLayerAnchorFor(el('#option'))).toBe(el('#l'))
    expect(getLayerAnchorFor(el('#free'))).toBeNull()
  })

  it('should ask a layer once per task even when several rules reach it', () => {
    fixtureEl.innerHTML = '<button id="a"></button><button id="b"></button><button id="outside"></button>'

    const a = layer('a', { anchor: el('#a'), parts: [el('#a')], refuses: ['sibling'] })
    a.dismiss = reason => {
      calls.push({ name: 'a', reason })
    }

    const b = layer('b', { anchor: el('#b'), parts: [el('#b')] })
    registerLayer(a)
    el('#outside').addEventListener('click', () => registerLayer(b))
    a.closesOn = () => true
    el('#outside').click()

    expect(calls.map(call => call.reason)).toEqual(['sibling'])
  })
})

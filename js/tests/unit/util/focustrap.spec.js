import FocusTrap from '../../../src/util/focustrap.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('FocusTrap', () => {
  let fixtureEl
  const traps = []

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    for (const trap of traps) {
      trap.deactivate()
    }

    traps.length = 0
    clearFixture()
  })

  const mount = (html, config = () => ({})) => {
    fixtureEl.innerHTML = html
    const trap = new FocusTrap({ autofocus: false, trapElement: fixtureEl.querySelector('#trap'), ...config() })
    traps.push(trap)
    trap.activate()
    return trap
  }

  const guards = () => [...fixtureEl.querySelectorAll('[data-coreui-focus-guard]')]
  const byId = id => document.getElementById(id)

  const simple = [
    '<button id="outside">outside</button>',
    '<div id="trap" tabindex="-1">',
    '  <button id="first">first</button>',
    '  <button id="last">last</button>',
    '</div>',
    '<button id="after">after</button>'
  ].join('')

  describe('activate', () => {
    it('should autofocus itself by default', () => {
      fixtureEl.innerHTML = simple
      const trap = new FocusTrap({ trapElement: byId('trap') })
      traps.push(trap)
      trap.activate()

      expect(document.activeElement).toBe(byId('trap'))
    })

    it('should not autofocus itself when configured not to', () => {
      mount(simple)

      expect(document.activeElement).not.toBe(byId('trap'))
    })

    it('should put a guard right before and right after the trap element', () => {
      mount(simple)

      const [before, after] = guards()

      expect(before.nextElementSibling).toBe(byId('trap'))
      expect(after.previousElementSibling).toBe(byId('trap'))
      expect(byId('trap').querySelector('[data-coreui-focus-guard]')).toBeNull()
    })

    it('should make each guard a hidden tab stop', () => {
      mount(simple)

      for (const guard of guards()) {
        expect(guard.tabIndex).toBe(0)
        expect(guard.getAttribute('aria-hidden')).toBe('true')
        expect(guard.getBoundingClientRect().width).toBeLessThanOrEqual(1)
      }
    })

    it('should listen to nothing on the document', () => {
      fixtureEl.innerHTML = simple
      const addEventListener = spyOn(document, 'addEventListener').and.callThrough()
      const trap = new FocusTrap({ autofocus: false, trapElement: byId('trap') })
      traps.push(trap)
      trap.activate()

      expect(addEventListener).not.toHaveBeenCalled()
    })
  })

  describe('deactivate', () => {
    it('should remove every guard', () => {
      const trap = mount(simple)

      trap.deactivate()

      expect(guards()).toEqual([])
    })

    it('should do nothing when it is not active', () => {
      fixtureEl.innerHTML = simple
      const trap = new FocusTrap({ trapElement: byId('trap') })

      expect(() => trap.deactivate()).not.toThrow()
    })
  })

  describe('one region', () => {
    it('should wrap Tab from the last element to the first', () => {
      mount(simple)
      byId('last').focus()

      guards()[1].focus()

      expect(document.activeElement).toBe(byId('first'))
    })

    it('should wrap Shift+Tab from the first element to the last', () => {
      mount(simple)
      byId('first').focus()

      guards()[0].focus()

      expect(document.activeElement).toBe(byId('last'))
    })

    it('should lead a Tab from the page into the first element', () => {
      mount(simple)
      byId('outside').focus()

      guards()[0].focus()

      expect(document.activeElement).toBe(byId('first'))
    })

    it('should lead a Shift+Tab from the page into the last element', () => {
      mount(simple)
      byId('after').focus()

      guards()[1].focus()

      expect(document.activeElement).toBe(byId('last'))
    })

    it('should wrap when the focus comes from nowhere', () => {
      mount(simple)
      document.activeElement?.blur()

      guards()[1].focus()

      expect(document.activeElement).toBe(byId('first'))
    })

    it('should leave a focus that code or the pointer moves out where it went', () => {
      mount(simple)
      byId('first').focus()

      byId('outside').focus()

      expect(document.activeElement).toBe(byId('outside'))
    })

    it('should focus the trap element when nothing in it can take the focus', () => {
      mount('<button id="outside">outside</button><div id="trap" tabindex="-1"></div>')
      byId('outside').focus()

      guards()[0].focus()

      expect(document.activeElement).toBe(byId('trap'))
    })

    it('should pass over an element that does not take the focus', () => {
      mount(simple)
      byId('outside').focus()
      spyOn(byId('first'), 'focus')

      guards()[0].focus()

      expect(document.activeElement).toBe(byId('last'))
    })

    it('should never leave the focus on a guard', () => {
      mount('<button id="outside">outside</button><div id="trap"></div>')
      byId('outside').focus()

      guards()[0].focus()

      expect(document.activeElement.hasAttribute('data-coreui-focus-guard')).toBeFalse()
    })
  })

  describe('with an additional element', () => {
    const withSearch = [
      '<button id="outside">outside</button>',
      '<input id="search">',
      '<div id="trap" tabindex="-1">',
      '  <button id="first">first</button>',
      '  <button id="last">last</button>',
      '</div>'
    ].join('')

    const mountWithSearch = () => mount(withSearch, () => ({ additionalElement: byId('search') }))

    it('should guard both regions', () => {
      mountWithSearch()

      expect(guards().length).toBe(4)
      expect(byId('search').previousElementSibling.hasAttribute('data-coreui-focus-guard')).toBeTrue()
      expect(byId('search').nextElementSibling.hasAttribute('data-coreui-focus-guard')).toBeTrue()
    })

    it('should take the additional element as a stop of its own and carry Tab from it into the trap', () => {
      mountWithSearch()
      byId('search').focus()

      byId('search').nextElementSibling.focus()

      expect(document.activeElement).toBe(byId('first'))
    })

    it('should carry Tab from the last element of the trap to the additional element', () => {
      mountWithSearch()
      byId('last').focus()

      byId('trap').nextElementSibling.focus()

      expect(document.activeElement).toBe(byId('search'))
    })

    it('should carry Shift+Tab from the additional element to the last element of the trap', () => {
      mountWithSearch()
      byId('search').focus()

      byId('search').previousElementSibling.focus()

      expect(document.activeElement).toBe(byId('last'))
    })

    it('should carry Shift+Tab from the first element of the trap to the additional element', () => {
      mountWithSearch()
      byId('first').focus()

      byId('trap').previousElementSibling.focus()

      expect(document.activeElement).toBe(byId('search'))
    })

    it('should go on to the next region when one cannot take the focus', () => {
      mountWithSearch()
      byId('search').disabled = true
      byId('last').focus()

      byId('trap').nextElementSibling.focus()

      expect(document.activeElement).toBe(byId('first'))
    })

    it('should not guard an additional element that sits inside the trap', () => {
      mount(simple, () => ({ additionalElement: byId('first') }))

      expect(guards().length).toBe(2)
    })
  })

  describe('two traps', () => {
    it('should let each trap wrap inside its own elements', () => {
      fixtureEl.innerHTML = [
        '<div id="one" tabindex="-1"><button id="one-first">1</button><button id="one-last">1</button></div>',
        '<div id="two" tabindex="-1"><button id="two-first">2</button><button id="two-last">2</button></div>'
      ].join('')
      const one = new FocusTrap({ autofocus: false, trapElement: byId('one') })
      const two = new FocusTrap({ autofocus: false, trapElement: byId('two') })
      traps.push(one, two)
      one.activate()
      two.activate()

      byId('two-last').focus()
      byId('two').nextElementSibling.focus()

      expect(document.activeElement).toBe(byId('two-first'))

      byId('one-last').focus()
      byId('one').nextElementSibling.focus()

      expect(document.activeElement).toBe(byId('one-first'))
    })
  })
})

import { watchFieldset } from '../../../src/util/fieldset.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('Fieldset utilities', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('watchFieldset', () => {
    it('places a hidden watcher right after the anchor and returns it', () => {
      fixtureEl.innerHTML = '<fieldset><input id="anchor"><input id="next"></fieldset>'

      const anchor = fixtureEl.querySelector('#anchor')
      const watch = watchFieldset(anchor, () => {})

      expect(anchor.nextElementSibling).toBe(watch)
      expect(watch.hidden).toBeTrue()
      expect(watch.localName).toBe('coreui-fieldset-watch')
    })

    it('reports each toggle of the fieldset while the setter runs', () => {
      fixtureEl.innerHTML = '<fieldset><input id="anchor"></fieldset>'

      const fieldset = fixtureEl.querySelector('fieldset')
      const calls = []
      watchFieldset(fixtureEl.querySelector('#anchor'), disabled => calls.push(disabled))

      fieldset.disabled = true
      expect(calls).toEqual([true])

      fieldset.disabled = false
      expect(calls).toEqual([true, false])
    })

    it('reports a toggle of an outer fieldset', () => {
      fixtureEl.innerHTML = '<fieldset id="outer"><fieldset><input id="anchor"></fieldset></fieldset>'

      const calls = []
      watchFieldset(fixtureEl.querySelector('#anchor'), disabled => calls.push(disabled))
      fixtureEl.querySelector('#outer').disabled = true

      expect(calls).toEqual([true])
    })

    it('stays enabled inside the first legend of a disabled fieldset', () => {
      fixtureEl.innerHTML = '<fieldset><legend><input id="anchor"></legend></fieldset>'

      const calls = []
      const watch = watchFieldset(fixtureEl.querySelector('#anchor'), disabled => calls.push(disabled))
      fixtureEl.querySelector('fieldset').disabled = true

      expect(calls).toEqual([])
      expect(watch.matches(':disabled')).toBeFalse()
    })

    it('does not call back while placing the watcher in a disabled fieldset', () => {
      fixtureEl.innerHTML = '<fieldset disabled><input id="anchor"></fieldset>'

      const calls = []
      const watch = watchFieldset(fixtureEl.querySelector('#anchor'), disabled => calls.push(disabled))

      expect(calls).toEqual([])
      expect(watch.matches(':disabled')).toBeTrue()
    })

    it('reports a move of the watcher into and out of a disabled fieldset', () => {
      fixtureEl.innerHTML = '<fieldset disabled id="off"></fieldset><div id="on"><input id="anchor"></div>'

      const calls = []
      const watch = watchFieldset(fixtureEl.querySelector('#anchor'), disabled => calls.push(disabled))

      fixtureEl.querySelector('#off').append(watch)
      expect(calls).toEqual([true])

      fixtureEl.querySelector('#on').append(watch)
      expect(calls).toEqual([true, false])
    })

    it('reports a disabled fieldset wrapped around the anchor in either order', () => {
      for (const attachFirst of [true, false]) {
        fixtureEl.innerHTML = '<div id="host"><input id="anchor"></div>'

        const host = fixtureEl.querySelector('#host')
        const calls = []
        watchFieldset(fixtureEl.querySelector('#anchor'), disabled => calls.push(disabled))
        const fieldset = document.createElement('fieldset')
        fieldset.disabled = true

        if (attachFirst) {
          host.before(fieldset)
          fieldset.append(host)
        } else {
          host.replaceWith(fieldset)
          fieldset.append(host)
        }

        expect(calls).toEqual([true])
      }
    })

    it('reports leaving a disabled fieldset when the watcher is removed', () => {
      fixtureEl.innerHTML = '<fieldset disabled><input id="anchor"></fieldset>'

      const calls = []
      const watch = watchFieldset(fixtureEl.querySelector('#anchor'), disabled => calls.push(disabled))

      watch.remove()

      expect(calls).toEqual([false])
    })

    it('does not report a fieldset that holds the anchor only in another branch', () => {
      fixtureEl.innerHTML = '<input id="anchor"><fieldset><input></fieldset>'

      const calls = []
      watchFieldset(fixtureEl.querySelector('#anchor'), disabled => calls.push(disabled))
      fixtureEl.querySelector('fieldset').disabled = true

      expect(calls).toEqual([])
    })

    it('releases in a microtask after a fieldset disables the watcher', async () => {
      fixtureEl.innerHTML = '<fieldset><input id="anchor"></fieldset>'

      const calls = []
      watchFieldset(fixtureEl.querySelector('#anchor'), disabled => calls.push(disabled), () => calls.push('release'))

      fixtureEl.querySelector('fieldset').disabled = true
      expect(calls).toEqual([true])

      await Promise.resolve()
      expect(calls).toEqual([true, 'release'])
    })

    it('releases once for any number of changes in one task', async () => {
      fixtureEl.innerHTML = '<fieldset><input id="anchor"></fieldset>'

      const fieldset = fixtureEl.querySelector('fieldset')
      const calls = []
      watchFieldset(fixtureEl.querySelector('#anchor'), () => {}, () => calls.push('release'))

      fieldset.disabled = true
      fieldset.disabled = false
      fieldset.disabled = true
      await Promise.resolve()

      expect(calls).toEqual(['release'])
    })

    it('does not release when the fieldset is enabled again in the same task', async () => {
      fixtureEl.innerHTML = '<fieldset><input id="anchor"></fieldset>'

      const fieldset = fixtureEl.querySelector('fieldset')
      const calls = []
      watchFieldset(fixtureEl.querySelector('#anchor'), disabled => calls.push(disabled), () => calls.push('release'))

      fieldset.disabled = true
      fieldset.disabled = false
      await Promise.resolve()

      expect(calls).toEqual([true, false])
    })

    it('releases after placing the watcher in a disabled fieldset unless it leaves in the same task', async () => {
      fixtureEl.innerHTML = '<fieldset disabled><input id="anchor"></fieldset><fieldset disabled><input id="other"></fieldset><input id="free">'

      const calls = []
      watchFieldset(fixtureEl.querySelector('#anchor'), () => {}, () => calls.push('anchor'))
      watchFieldset(fixtureEl.querySelector('#free'), () => {}, () => calls.push('free'))
      watchFieldset(fixtureEl.querySelector('#other'), () => {}, () => calls.push('other')).remove()
      await Promise.resolve()

      expect(calls).toEqual(['anchor'])
    })

    it('does not release when a fieldset enables the watcher, and releases again on the next disable', async () => {
      fixtureEl.innerHTML = '<fieldset disabled><input id="anchor"></fieldset>'

      const fieldset = fixtureEl.querySelector('fieldset')
      const calls = []
      watchFieldset(fixtureEl.querySelector('#anchor'), disabled => calls.push(disabled), () => calls.push('release'))
      await Promise.resolve()

      fieldset.disabled = false
      await Promise.resolve()
      expect(calls).toEqual(['release', false])

      fieldset.disabled = true
      await Promise.resolve()
      expect(calls).toEqual(['release', false, true, 'release'])
    })

    it('registers the element once for any number of watchers', () => {
      fixtureEl.innerHTML = '<fieldset><input id="first"><input id="second"></fieldset>'

      const calls = []
      watchFieldset(fixtureEl.querySelector('#first'), disabled => calls.push(['first', disabled]))
      watchFieldset(fixtureEl.querySelector('#second'), disabled => calls.push(['second', disabled]))
      fixtureEl.querySelector('fieldset').disabled = true

      expect(calls).toEqual([['first', true], ['second', true]])
    })
  })
})

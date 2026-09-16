import EventHandler from '../../../src/dom/event-handler.js'
import { addHostClassNames, restoreHost } from '../../../src/util/host.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('host', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('addHostClassNames', () => {
    it('should report only the class names it added', () => {
      fixtureEl.innerHTML = '<div class="kept"></div>'
      const el = fixtureEl.querySelector('div')

      expect(addHostClassNames(el, ['added', 'kept'])).toEqual(['added'])
      expect(el.className).toEqual('kept added')
    })

    it('should skip falsy entries', () => {
      fixtureEl.innerHTML = '<div></div>'
      const el = fixtureEl.querySelector('div')

      expect(addHostClassNames(el, ['added', false, null, undefined])).toEqual(['added'])
      expect(el.className).toEqual('added')
    })
  })

  describe('restoreHost', () => {
    it('should remove the nodes and class names it is given, and nothing else', () => {
      fixtureEl.innerHTML = '<div class="kept mine"><span class="generated"></span><b class="theirs"></b></div>'
      const el = fixtureEl.querySelector('div')
      const generated = el.querySelector('.generated')
      const spy = jasmine.createSpy()

      EventHandler.on(generated, 'click.coreui.test', spy)

      restoreHost(el, {
        classNames: ['mine'],
        eventKey: '.coreui.test',
        nodes: [generated, null]
      })

      expect(el.className).toEqual('kept')
      expect(el.querySelector('.generated')).toBeNull()
      expect(el.querySelector('.theirs')).not.toBeNull()

      generated.dispatchEvent(new Event('click'))

      expect(spy).not.toHaveBeenCalled()
    })
  })
})

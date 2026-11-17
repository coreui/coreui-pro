import { lockScroll, unlockScroll } from '../../../src/util/scroll-lock.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('Scroll lock utilities', () => {
  const root = document.documentElement
  let fixtureEl
  let originalStyle

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  beforeEach(() => {
    originalStyle = root.style.cssText
  })

  afterEach(() => {
    clearFixture()
    root.style.cssText = originalStyle
    root.classList.remove('dialog-open')
  })

  const owner = () => {
    const element = document.createElement('div')
    fixtureEl.append(element)
    return element
  }

  describe('lockScroll', () => {
    it('hides the root overflow and marks the root while any owner holds the lock', () => {
      const first = owner()
      const second = owner()

      lockScroll(first)
      lockScroll(second)
      unlockScroll(first)

      expect(root.style.overflow).toBe('hidden')
      expect(root.classList.contains('dialog-open')).toBe(true)

      unlockScroll(second)

      expect(root.style.overflow).toBe('')
      expect(root.classList.contains('dialog-open')).toBe(false)
    })

    it('lets go of an owner that left the document', () => {
      const removed = owner()

      lockScroll(removed)
      removed.remove()
      unlockScroll(owner())

      expect(root.style.overflow).toBe('')
      expect(root.classList.contains('dialog-open')).toBe(false)
    })

    it('lets go of a dialog that closed without unlocking', () => {
      const dialog = document.createElement('dialog')
      fixtureEl.append(dialog)
      dialog.show()

      lockScroll(dialog)
      dialog.close()
      unlockScroll(owner())

      expect(root.style.overflow).toBe('')
      expect(root.classList.contains('dialog-open')).toBe(false)
    })

    it('keeps the lock of an owner that is not a dialog until it unlocks', () => {
      const element = owner()
      const dialog = document.createElement('dialog')
      fixtureEl.append(dialog)

      lockScroll(element)
      lockScroll(dialog)
      unlockScroll(dialog)

      expect(root.style.overflow).toBe('hidden')

      unlockScroll(element)

      expect(root.style.overflow).toBe('')
    })
  })

  describe('unlockScroll', () => {
    it('does nothing for an element that holds no lock', () => {
      root.style.setProperty('overflow', 'auto')

      unlockScroll(owner())

      expect(root.style.overflow).toBe('auto')
    })
  })
})

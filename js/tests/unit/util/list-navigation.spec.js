import { vi } from 'vitest'
import {
  createTypeaheadBuffer, findOpeningItem, findTypeaheadMatch, getNextActiveElement, getRemovalNeighbor, getRevealScrollTop, getVirtualRows, isTypingKey, rangeBetween, scrollIntoContainer
} from '../../../src/util/list-navigation.js'
import * as Util from '../../../src/util/index.js'

describe('List navigation utilities', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getNextActiveElement', () => {
    it('should be the list walk of util/index', () => {
      expect(getNextActiveElement).toBe(Util.getNextActiveElement)
      expect(getNextActiveElement(['a', 'b', 'c'], 'c', true, true)).toBe('a')
      expect(getNextActiveElement(['a', 'b', 'c'], 'a', false, false)).toBe('a')
    })
  })

  describe('createTypeaheadBuffer', () => {
    it('should collect printable characters, lowercased', () => {
      const buffer = createTypeaheadBuffer()

      expect(buffer.push('B')).toBe('b')
      expect(buffer.push('a')).toBe('ba')
    })

    it('should ignore the space and named keys', () => {
      const buffer = createTypeaheadBuffer()

      buffer.push('b')

      expect(buffer.push(' ')).toBeNull()
      expect(buffer.push('Enter')).toBeNull()
      expect(buffer.push('a')).toBe('ba')
    })

    it('should ignore a key event without a key', () => {
      const buffer = createTypeaheadBuffer()

      buffer.push('b')

      expect(buffer.push(undefined)).toBeNull()
      expect(buffer.push('a')).toBe('ba')
    })

    it('should empty the text once no character comes for the timeout', () => {
      vi.useFakeTimers()
      const buffer = createTypeaheadBuffer(300)

      buffer.push('b')
      vi.advanceTimersByTime(299)

      expect(buffer.push('a')).toBe('ba')

      vi.advanceTimersByTime(300)

      expect(buffer.push('c')).toBe('c')
    })

    it('should count the timeout from the last character', () => {
      vi.useFakeTimers()
      const buffer = createTypeaheadBuffer(300)

      buffer.push('b')
      vi.advanceTimersByTime(200)
      buffer.push('a')
      vi.advanceTimersByTime(200)

      expect(buffer.push('c')).toBe('bac')
    })

    it('should keep the text for 500 ms when the timeout is left out', () => {
      vi.useFakeTimers()
      const buffer = createTypeaheadBuffer()

      buffer.push('b')
      vi.advanceTimersByTime(499)

      expect(buffer.push('a')).toBe('ba')

      vi.advanceTimersByTime(500)

      expect(buffer.push('c')).toBe('c')
    })

    it('should empty the text and stop the timer on clear', () => {
      vi.useFakeTimers()
      const buffer = createTypeaheadBuffer()

      buffer.push('b')
      buffer.clear()

      expect(vi.getTimerCount()).toBe(0)
      expect(buffer.push('a')).toBe('a')
    })
  })

  describe('findOpeningItem', () => {
    const items = ['Banana', 'Apple', 'Avocado', 'Blueberry', 'Apricot']
    const textOf = item => item

    it('should give the typeahead match for a character, searched after the current entry', () => {
      expect(findOpeningItem(items, 1, 'a', textOf)).toBe('Avocado')
      expect(findOpeningItem(items, -1, 'A', textOf)).toBe('Apple')
      expect(findOpeningItem(items, 3, 'b', textOf)).toBe('Banana')
    })

    it('should keep the current entry when a character matches nothing', () => {
      expect(findOpeningItem(items, 2, 'z', textOf)).toBe('Avocado')
      expect(findOpeningItem(items, -1, 'z', textOf)).toBeUndefined()
    })

    it('should treat the space as an opening key, not a character', () => {
      expect(findOpeningItem(items, 2, ' ', textOf)).toBe('Avocado')
      expect(findOpeningItem(items, -1, ' ', textOf)).toBe('Banana')
    })

    it('should keep the current entry for any other key', () => {
      expect(findOpeningItem(items, 2, 'ArrowDown', textOf)).toBe('Avocado')
      expect(findOpeningItem(items, 2, 'ArrowUp', textOf)).toBe('Avocado')
      expect(findOpeningItem(items, 2, 'Enter', textOf)).toBe('Avocado')
    })

    it('should give the last entry for ArrowUp and the first for any other key without a current entry', () => {
      expect(findOpeningItem(items, -1, 'ArrowUp', textOf)).toBe('Apricot')
      expect(findOpeningItem(items, -1, 'ArrowDown', textOf)).toBe('Banana')
      expect(findOpeningItem(items, -1, 'Enter', textOf)).toBe('Banana')
    })

    it('should give the current entry when no key opened the list', () => {
      expect(findOpeningItem(items, 4, null, textOf)).toBe('Apricot')
      expect(findOpeningItem(items, -1, null, textOf)).toBeUndefined()
    })

    it('should give nothing for an empty list', () => {
      for (const key of ['a', 'ArrowUp', 'ArrowDown', null]) {
        expect(findOpeningItem([], -1, key, textOf)).toBeUndefined()
      }
    })
  })

  describe('findTypeaheadMatch', () => {
    const items = ['Banana', 'Apple', 'Avocado', 'Blueberry', 'Apricot']
    const textOf = item => item

    it('should start after the current entry for a single character and wrap around', () => {
      expect(findTypeaheadMatch(items, 1, 'a', textOf)).toBe('Avocado')
      expect(findTypeaheadMatch(items, 4, 'a', textOf)).toBe('Apple')
      expect(findTypeaheadMatch(items, 3, 'b', textOf)).toBe('Banana')
    })

    it('should start at the current entry for longer text', () => {
      expect(findTypeaheadMatch(items, 1, 'ap', textOf)).toBe('Apple')
      expect(findTypeaheadMatch(items, 2, 'ap', textOf)).toBe('Apricot')
    })

    it('should start at the first entry when there is no current one', () => {
      expect(findTypeaheadMatch(items, -1, 'b', textOf)).toBe('Banana')
      expect(findTypeaheadMatch(items, -1, 'bl', textOf)).toBe('Blueberry')
      expect(findTypeaheadMatch(items, -1, 'ap', textOf)).toBe('Apple')
    })

    it('should ignore case and surrounding whitespace in the entry text', () => {
      const entries = [{ text: '  Cherry ' }, { text: 'DATE' }]

      expect(findTypeaheadMatch(entries, -1, 'ch', entry => entry.text)).toBe(entries[0])
      expect(findTypeaheadMatch(entries, -1, 'DA', entry => entry.text)).toBe(entries[1])
    })

    it('should return undefined when no entry starts with the text', () => {
      expect(findTypeaheadMatch(items, 0, 'z', textOf)).toBeUndefined()
      expect(findTypeaheadMatch([], -1, 'a', textOf)).toBeUndefined()
    })
  })

  describe('rangeBetween', () => {
    const items = ['a', 'b', 'c', 'd', 'e']

    it('should list the entries between anchor and target in list order', () => {
      expect(rangeBetween(items, 1, 3)).toEqual(['b', 'c', 'd'])
      expect(rangeBetween(items, 3, 1)).toEqual(['b', 'c', 'd'])
      expect(rangeBetween(items, 2, 2)).toEqual(['c'])
    })

    it('should give the target alone when the anchor is not in the list', () => {
      expect(rangeBetween(items, -1, 3)).toEqual(['d'])
    })

    it('should give nothing when the target is not in the list', () => {
      expect(rangeBetween(items, 1, -1)).toEqual([])
      expect(rangeBetween(items, 4, -1)).toEqual([])
      expect(rangeBetween(items, -1, -1)).toEqual([])
    })
  })

  describe('getRemovalNeighbor', () => {
    it('should pick the next item, or the previous one for the last', () => {
      expect(getRemovalNeighbor(['a', 'b', 'c'], 'b')).toBe('c')
      expect(getRemovalNeighbor(['a', 'b', 'c'], 'c')).toBe('b')
      expect(getRemovalNeighbor(['a', 'b', 'c'], 'a')).toBe('b')
    })

    it('should give null for the only item and the first item for one the list does not hold', () => {
      expect(getRemovalNeighbor(['a'], 'a')).toBeNull()
      expect(getRemovalNeighbor([], 'a')).toBeNull()
      expect(getRemovalNeighbor(['a', 'b'], 'z')).toBe('a')
    })
  })

  describe('isTypingKey', () => {
    const press = init => new KeyboardEvent('keydown', init)

    it('should take a character, Backspace and Delete', () => {
      expect(isTypingKey(press({ key: 'r' }))).toBeTrue()
      expect(isTypingKey(press({ key: 'R', shiftKey: true }))).toBeTrue()
      expect(isTypingKey(press({ key: '7' }))).toBeTrue()
      expect(isTypingKey(press({ key: 'Backspace' }))).toBeTrue()
      expect(isTypingKey(press({ key: 'Delete' }))).toBeTrue()
      expect(isTypingKey(press({ key: 'Dead' }))).toBeTrue()
    })

    it('should take a character typed with AltGr or Option', () => {
      expect(isTypingKey(press({ key: 'ą', ctrlKey: true, altKey: true }))).toBeTrue()
      expect(isTypingKey(press({ key: 'ß', altKey: true }))).toBeTrue()
    })

    it('should leave out the space bar, other named keys and shortcuts', () => {
      expect(isTypingKey(press({ key: ' ' }))).toBeFalse()
      expect(isTypingKey(press({ key: 'Enter' }))).toBeFalse()
      expect(isTypingKey(press({ key: 'ArrowDown' }))).toBeFalse()
      expect(isTypingKey(press({ key: 'a', ctrlKey: true }))).toBeFalse()
      expect(isTypingKey(press({ key: 'a', metaKey: true }))).toBeFalse()
      expect(isTypingKey(press({ key: 'Backspace', metaKey: true }))).toBeFalse()
      expect(isTypingKey(press({ key: 'Delete', ctrlKey: true }))).toBeFalse()
    })

    it('should leave out every key of an IME composition', () => {
      expect(isTypingKey(press({ key: 'a', isComposing: true }))).toBeFalse()
      expect(isTypingKey(press({ key: 'Backspace', isComposing: true }))).toBeFalse()
    })

    it('should leave out a key event without a key', () => {
      expect(isTypingKey(new Event('keydown'))).toBeFalse()
    })
  })

  describe('scrollIntoContainer', () => {
    it('should scroll only the container to show the element, below and above, and leave a visible one alone', () => {
      const fixture = document.createElement('div')
      fixture.innerHTML = `<div style="height: 3000px"></div><div id="box" style="height: 100px; overflow: auto">${
        Array.from({ length: 20 }, (_, index) => `<div id="i${index}" style="height: 40px">${index}</div>`).join('')
      }</div>`
      document.body.append(fixture)
      const box = fixture.querySelector('#box')
      const pageScroll = window.scrollY

      scrollIntoContainer(box, box.querySelector('#i10'))
      expect(box.scrollTop).toEqual(340)

      scrollIntoContainer(box, box.querySelector('#i9'))
      expect(box.scrollTop).toEqual(340)

      scrollIntoContainer(box, box.querySelector('#i2'))
      expect(box.scrollTop).toEqual(80)

      scrollIntoContainer(box, null)
      expect(box.scrollTop).toEqual(80)
      expect(window.scrollY).toEqual(pageScroll)
      fixture.remove()
    })

    it('should keep the element clear of the container border and align a taller element by its top', () => {
      const fixture = document.createElement('div')
      fixture.innerHTML = `<div id="box" style="height: 100px; border: 10px solid; overflow: auto">${
        Array.from({ length: 20 }, (_, index) => `<div id="i${index}" style="height: 40px">${index}</div>`).join('')
      }<div id="tall" style="height: 200px"></div></div>`
      document.body.append(fixture)
      const box = fixture.querySelector('#box')

      scrollIntoContainer(box, box.querySelector('#i10'))
      expect(box.scrollTop).toEqual(340)

      scrollIntoContainer(box, box.querySelector('#tall'))
      expect(box.scrollTop).toEqual(800)
      fixture.remove()
    })
  })

  describe('getVirtualRows', () => {
    const sizes = Array.from({ length: 50 }, () => 20)

    it('should render the visible rows and the overscan around them, with the skipped height before and after', () => {
      const { indexes, gaps } = getVirtualRows(sizes, {
        overscan: 2, rows: 5, scrollTop: 400, viewport: 100
      })

      expect(indexes).toEqual([18, 19, 20, 21, 22, 23, 24, 25, 26])
      expect(gaps).toEqual([360, ...Array.from({ length: 8 }, () => 0), 460])
    })

    it('should start the window at the row that holds the scroll position', () => {
      expect(getVirtualRows(sizes, {
        overscan: 0, rows: 5, scrollTop: 410, viewport: 100
      }).indexes).toEqual([20, 21, 22, 23, 24, 25])
    })

    it('should keep a pinned row in list order, with the gaps around it', () => {
      const { indexes, gaps } = getVirtualRows(sizes, {
        overscan: 1, pinned: [40], rows: 5, scrollTop: 0, viewport: 100
      })

      expect(indexes).toEqual([0, 1, 2, 3, 4, 5, 40])
      expect(gaps).toEqual([0, 0, 0, 0, 0, 0, 680, 180])
    })

    it('should stand in the first rows until anything is measured, and still render the pinned ones', () => {
      expect(getVirtualRows(Array.from({ length: 50 }, () => 0), {
        overscan: 2, pinned: [45], rows: 5, scrollTop: 0, viewport: 100
      }).indexes).toEqual([0, 1, 2, 3, 4, 5, 6, 45])
      expect(getVirtualRows(sizes, {
        overscan: 0, rows: 3, scrollTop: 0, viewport: 0
      }).indexes).toEqual([0, 1, 2])
    })

    it('should follow rows of different heights', () => {
      const { indexes, gaps } = getVirtualRows([40, 20, 20, 40, 20, 20], {
        overscan: 0, rows: 2, scrollTop: 50, viewport: 40
      })

      expect(indexes).toEqual([1, 2, 3])
      expect(gaps).toEqual([40, 0, 0, 40])
    })

    it('should skip pinned indexes outside the list and render nothing for an empty one', () => {
      expect(getVirtualRows(sizes.slice(0, 3), {
        overscan: 0, pinned: [-1, 7], rows: 5, scrollTop: 0, viewport: 100
      }).indexes).toEqual([0, 1, 2])
      expect(getVirtualRows([], {
        overscan: 2, pinned: [0], rows: 5, scrollTop: 0, viewport: 100
      })).toEqual({ gaps: [0], indexes: [] })
    })
  })

  describe('getRevealScrollTop', () => {
    const sizes = Array.from({ length: 50 }, () => 20)

    it('should leave the scroll position alone for a row in view', () => {
      expect(getRevealScrollTop(sizes, 22, 400, 100)).toBe(400)
    })

    it('should align a row above the view by its top edge and a row below it by its bottom edge', () => {
      expect(getRevealScrollTop(sizes, 3, 400, 100)).toBe(60)
      expect(getRevealScrollTop(sizes, 49, 400, 100)).toBe(900)
    })

    it('should align a row taller than the view by its top edge', () => {
      expect(getRevealScrollTop([20, 200, 20], 1, 0, 100)).toBe(20)
    })

    it('should keep the scroll position for an index outside the list', () => {
      expect(getRevealScrollTop(sizes, 50, 120, 100)).toBe(120)
      expect(getRevealScrollTop(sizes, -1, 120, 100)).toBe(120)
    })
  })
})

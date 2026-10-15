import { vi } from 'vitest'
import {
  createTypeaheadBuffer, findTypeaheadMatch, getNextActiveElement, getRemovalNeighbor, rangeBetween
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
})

import {
  fillSelection, getAriaPressed, getScopeSelectionState, getSelectionLimit, getSelectionState, isSelectionLimitReached,
  resolveCountLabel, toSelectionValues
} from '../../../src/util/selection-state.js'

describe('Selection utilities', () => {
  describe('getScopeSelectionState', () => {
    it('should read the scope against the room the values outside it leave under the limit', () => {
      expect(getScopeSelectionState(1, 3, 2, 2)).toBe('all')
      expect(getScopeSelectionState(1, 3, 1, 2)).toBe('some')
      expect(getScopeSelectionState(0, 3, 2, 2)).toBe('none')
      expect(getScopeSelectionState(2, 3, 2, null)).toBe('some')
      expect(getScopeSelectionState(3, 3, 5)).toBe('all')
    })
  })

  describe('getSelectionState', () => {
    it('should count the selection against the set at its boundaries', () => {
      expect(getSelectionState(0, 3)).toBe('none')
      expect(getSelectionState(2, 3)).toBe('some')
      expect(getSelectionState(3, 3)).toBe('all')
      expect(getSelectionState(3, 2)).toBe('all')
    })

    it('should reach all at the selection limit when it is lower than the set', () => {
      expect(getSelectionState(1, 3, 2)).toBe('some')
      expect(getSelectionState(2, 3, 2)).toBe('all')
      expect(getSelectionState(3, 3, 2)).toBe('all')
      expect(getSelectionState(2, 3, 5)).toBe('some')
      expect(getSelectionState(3, 3, 5)).toBe('all')
      expect(getSelectionState(3, 3, null)).toBe('all')
    })

    it('should never call an empty set or a limit of 0 all', () => {
      expect(getSelectionState(0, 0)).toBe('none')
      expect(getSelectionState(0, 3, 0)).toBe('none')
      expect(getSelectionState(3, 3, 0)).toBe('some')
      expect(getSelectionState(2, 0)).toBe('some')
    })
  })

  describe('getAriaPressed', () => {
    it('should give true, mixed and false', () => {
      expect(getAriaPressed('all')).toBe('true')
      expect(getAriaPressed('some')).toBe('mixed')
      expect(getAriaPressed('none')).toBe('false')
    })
  })

  describe('fillSelection', () => {
    it('should add every new candidate in order when there is no limit', () => {
      expect(fillSelection(['b'], ['a', 'b', 'c'])).toEqual({ added: ['a', 'c'], refused: null, values: ['b', 'a', 'c'] })
      expect(fillSelection([], ['a', 'b'], null)).toEqual({ added: ['a', 'b'], refused: null, values: ['a', 'b'] })
    })

    it('should stop at the limit and report the first candidate it refused', () => {
      expect(fillSelection(['a'], ['b', 'c', 'd'], 2)).toEqual({ added: ['b'], refused: 'c', values: ['a', 'b'] })
      expect(fillSelection(['a', 'b'], ['c'], 2)).toEqual({ added: [], refused: 'c', values: ['a', 'b'] })
      expect(fillSelection([], ['a'], 0)).toEqual({ added: [], refused: 'a', values: [] })
      expect(fillSelection(['a', 'b', 'c'], ['d'], 2)).toEqual({ added: [], refused: 'd', values: ['a', 'b', 'c'] })
    })

    it('should spend no slot on a candidate already selected or listed twice', () => {
      expect(fillSelection(['a'], ['a', 'b', 'b', 'c'], 3)).toEqual({ added: ['b', 'c'], refused: null, values: ['a', 'b', 'c'] })
      expect(fillSelection(['a', 'b'], ['a', 'b'], 2)).toEqual({ added: [], refused: null, values: ['a', 'b'] })
    })

    it('should compare values strictly, so a number and its string are different values', () => {
      expect(fillSelection([1], ['1', 1, 2], 3)).toEqual({ added: ['1', 2], refused: null, values: [1, '1', 2] })
    })

    it('should leave the selected list untouched', () => {
      const selected = ['a']

      fillSelection(selected, ['b'])

      expect(selected).toEqual(['a'])
    })
  })

  describe('toSelectionValues', () => {
    it('should give no values for nothing or the none mode', () => {
      expect(toSelectionValues(null, 'multiple')).toEqual([])
      expect(toSelectionValues(undefined, 'multiple')).toEqual([])
      expect(toSelectionValues(['a', 'b'], 'none')).toEqual([])
      expect(toSelectionValues('a', 'none')).toEqual([])
    })

    it('should wrap a single value and keep a list in order', () => {
      expect(toSelectionValues('a', 'multiple')).toEqual(['a'])
      expect(toSelectionValues(1, 'multiple')).toEqual([1])
      expect(toSelectionValues('', 'multiple')).toEqual([''])
      expect(toSelectionValues(['b', 'a', 'b'], 'multiple')).toEqual(['b', 'a', 'b'])
    })

    it('should keep only the first value in the single mode', () => {
      expect(toSelectionValues(['b', 'a'], 'single')).toEqual(['b'])
      expect(toSelectionValues('a', 'single')).toEqual(['a'])
      expect(toSelectionValues([], 'single')).toEqual([])
    })

    it('should return a new list rather than the one it was given', () => {
      const values = ['a', 'b']

      expect(toSelectionValues(values, 'multiple')).not.toBe(values)
      expect(toSelectionValues(values, 'multiple')).toEqual(values)
    })
  })

  describe('getSelectionLimit', () => {
    it('should give the limit when several values can be selected', () => {
      expect(getSelectionLimit(true, 3)).toBe(3)
      expect(getSelectionLimit(true, 0)).toBe(0)
    })

    it('should give no limit for a single selection or a limit that is not a number', () => {
      expect(getSelectionLimit(false, 3)).toBeNull()
      expect(getSelectionLimit(true, null)).toBeNull()
      expect(getSelectionLimit(true, undefined)).toBeNull()
      expect(getSelectionLimit(true, '3')).toBeNull()
    })
  })

  describe('isSelectionLimitReached', () => {
    it('should be reached at and past the limit', () => {
      expect(isSelectionLimitReached(1, 2)).toBeFalse()
      expect(isSelectionLimitReached(2, 2)).toBeTrue()
      expect(isSelectionLimitReached(3, 2)).toBeTrue()
      expect(isSelectionLimitReached(0, 0)).toBeTrue()
    })

    it('should never be reached without a limit', () => {
      expect(isSelectionLimitReached(5, null)).toBeFalse()
      expect(isSelectionLimitReached(5)).toBeFalse()
      expect(isSelectionLimitReached(5, Number.NaN)).toBeFalse()
    })
  })

  describe('resolveCountLabel', () => {
    it('should hand the count and the total to a function label', () => {
      const label = (count, total) => `${count} of ${total}`

      expect(resolveCountLabel(label, 2, 5)).toBe('2 of 5')
    })

    it('should replace every placeholder of a string label', () => {
      expect(resolveCountLabel('{count}/{total} selected', 2, 5)).toBe('2/5 selected')
      expect(resolveCountLabel('{count} chosen, {count} of {total}, {total} in all', 3, 4)).toBe('3 chosen, 3 of 4, 4 in all')
      expect(resolveCountLabel('Some selected', 1, 2)).toBe('Some selected')
    })
  })
})

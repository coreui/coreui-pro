import { fillSelection, getAriaPressed, getSelectionState } from '../../../src/util/selection-state.js'

describe('Selection utilities', () => {
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
})

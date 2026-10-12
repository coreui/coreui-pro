import { getAriaPressed, getSelectionState } from '../../../src/util/selection-state.js'

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
})

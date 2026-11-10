import { resolveFieldState } from '../../../src/util/field-state.js'

describe('Field state', () => {
  describe('resolveFieldState', () => {
    it('should show nothing without any fact', () => {
      expect(resolveFieldState({})).toEqual({
        blocks: false, invalid: false, state: undefined
      })
    })

    it('should show the given state over a reported error and block on a given invalid', () => {
      expect(resolveFieldState({ given: 'valid', reported: true })).toEqual({
        blocks: false, invalid: false, state: 'valid'
      })
      expect(resolveFieldState({ given: 'invalid' })).toEqual({
        blocks: true, invalid: true, state: 'invalid'
      })
    })

    it('should not block while the field cannot block', () => {
      expect(resolveFieldState({ canBlock: false, given: 'invalid' }).blocks).toBeFalse()
    })

    it('should take the state of the owner when it has none of its own, and count an empty string as none', () => {
      expect(resolveFieldState({ given: '', inherited: 'invalid' })).toEqual({
        blocks: true, invalid: true, state: 'invalid'
      })
      expect(resolveFieldState({ given: 'warning', inherited: 'invalid' }).state).toBe('warning')
    })

    it('should block on the invalid of the owner only for a field without a state of its own', () => {
      expect(resolveFieldState({ given: 'warning', inherited: 'invalid' }).blocks).toBeFalse()
      expect(resolveFieldState({ inherited: 'invalid' }).blocks).toBeTrue()
    })

    it('should show an error of its own over a given state, without blocking', () => {
      expect(resolveFieldState({ given: 'valid', ownError: true })).toEqual({
        blocks: false, invalid: true, state: 'invalid'
      })
    })

    it('should show a reported error over the state of the user interaction', () => {
      expect(resolveFieldState({ reported: true, user: 'valid' }).state).toBe('invalid')
      expect(resolveFieldState({ user: 'valid' })).toEqual({
        blocks: false, invalid: false, state: 'valid'
      })
    })

    it('should mark the field invalid for an error of its owner without a state class of its own', () => {
      expect(resolveFieldState({ ownerError: true })).toEqual({
        blocks: false, invalid: true, state: undefined
      })
      expect(resolveFieldState({ ownerError: true, user: 'valid' }).state).toBeUndefined()
      expect(resolveFieldState({ ownerError: true, reported: true }).state).toBe('invalid')
    })
  })
})

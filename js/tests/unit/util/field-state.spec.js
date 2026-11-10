import { resolveFieldState } from '../../../src/util/field-state.js'

describe('Field state', () => {
  describe('resolveFieldState', () => {
    it('should show nothing without any fact', () => {
      expect(resolveFieldState({})).toEqual({
        blocks: false, invalid: false, state: undefined
      })
    })

    it('should show a reported or user invalid value over a given state other than invalid', () => {
      for (const given of ['valid', 'warning']) {
        expect(resolveFieldState({ given, reported: true })).toEqual({
          blocks: false, invalid: true, state: 'invalid'
        })
        expect(resolveFieldState({ given, user: 'invalid' })).toEqual({
          blocks: false, invalid: true, state: 'invalid'
        })
        expect(resolveFieldState({ inherited: given, reported: true }).state).toBe('invalid')
      }
    })

    it('should show the given state over a valid user interaction and block on a given invalid', () => {
      expect(resolveFieldState({ given: 'warning', user: 'valid' })).toEqual({
        blocks: false, invalid: false, state: 'warning'
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

    it('should show an error of its own over a given state and block with it while the field can block', () => {
      expect(resolveFieldState({ given: 'valid', ownError: true })).toEqual({
        blocks: true, invalid: true, state: 'invalid'
      })
      expect(resolveFieldState({ ownError: true }).blocks).toBeTrue()
      expect(resolveFieldState({ canBlock: false, ownError: true }).blocks).toBeFalse()
    })

    it('should show a reported error over the state of the user interaction', () => {
      expect(resolveFieldState({ reported: true, user: 'valid' }).state).toBe('invalid')
      expect(resolveFieldState({ user: 'valid' })).toEqual({
        blocks: false, invalid: false, state: 'valid'
      })
    })

    it('should mark the field invalid and block for an error of its owner without a state class of its own', () => {
      expect(resolveFieldState({ ownerError: true })).toEqual({
        blocks: true, invalid: true, state: undefined
      })
      expect(resolveFieldState({ canBlock: false, ownerError: true }).blocks).toBeFalse()
      expect(resolveFieldState({ ownerError: true, user: 'valid' }).state).toBeUndefined()
      expect(resolveFieldState({ ownerError: true, reported: true }).state).toBe('invalid')
    })
  })
})

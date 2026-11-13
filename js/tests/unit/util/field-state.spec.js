import { resolveFieldState } from '../../../src/util/field-state.js'

describe('Field state', () => {
  describe('resolveFieldState', () => {
    it('should show nothing without any fact', () => {
      expect(resolveFieldState({})).toEqual({
        invalid: false, state: undefined
      })
    })

    it('should show a given invalid, its own or its owner\'s', () => {
      for (const input of [{ given: 'invalid' }, { inherited: 'invalid' }]) {
        expect(resolveFieldState(input)).toEqual({
          invalid: true, state: 'invalid'
        })
      }
    })

    it('should show the given state over a reported error', () => {
      expect(resolveFieldState({ given: 'valid', reported: true })).toEqual({
        invalid: false, state: 'valid'
      })
    })

    it('should take the state of the owner when it has none of its own, and count an empty string as none', () => {
      expect(resolveFieldState({ given: '', inherited: 'invalid' })).toEqual({
        invalid: true, state: 'invalid'
      })
      expect(resolveFieldState({ given: 'warning', inherited: 'invalid' }).state).toBe('warning')
    })

    it('should show an error of its own over a given state', () => {
      expect(resolveFieldState({ given: 'valid', ownError: true })).toEqual({
        invalid: true, state: 'invalid'
      })
    })

    it('should show a reported error over the state of the user interaction', () => {
      expect(resolveFieldState({ reported: true, user: 'valid' }).state).toBe('invalid')
      expect(resolveFieldState({ user: 'valid' })).toEqual({
        invalid: false, state: 'valid'
      })
    })

    it('should mark the field invalid for an error of its owner without a state class of its own', () => {
      expect(resolveFieldState({ ownerError: true })).toEqual({
        invalid: true, state: undefined
      })
      expect(resolveFieldState({ ownerError: true, user: 'valid' }).state).toBeUndefined()
      expect(resolveFieldState({ ownerError: true, reported: true }).state).toBe('invalid')
    })
  })
})

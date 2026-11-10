export type FieldValidationState = 'invalid' | 'valid' | (string & {})

export type FieldStateInput = {
  canBlock?: boolean
  given?: FieldValidationState | null
  inherited?: FieldValidationState | null
  ownError?: boolean
  ownerError?: boolean
  reported?: boolean
  user?: FieldValidationState | null
}

export type FieldState = {
  blocks: boolean
  invalid: boolean
  state: FieldValidationState | undefined
}

/**
 * Resolves what a form field shows from the facts its edition collected, without reading the DOM:
 * an error of the component's own, a given `'invalid'`, a value a validation reported and a value
 * the user's interaction left invalid all show `'invalid'`, whatever else the field was given, else
 * it shows the state it was given, else the state its owner was given, else the state the user's
 * interaction produced. An error of the owner's own marks the field invalid for assistive
 * technologies without a state class of its own. While the field can block, it blocks the submit for
 * an error of its own or of its owner's, and when the state it goes by, its own, else its owner's
 * when it has none, is `'invalid'`, so an owner's `'invalid'` blocks only a field without a state of
 * its own. Whatever blocks the submit shows the field invalid.
 *
 * @param input - The facts: `given` and `inherited` from options, props or server markup, an empty
 * string counting as none; `ownError` and `ownerError` from the component and its owner; `reported`
 * when a validation found the value invalid; `user` for `:user-invalid` or `:user-valid`, or the
 * edition's equivalent; `canBlock`, `true` by default
 * @returns `state` for the `is-{state}` class, `invalid` for `aria-invalid` and `blocks` for the
 * submit
 */
export const resolveFieldState = ({
  canBlock = true, given, inherited, ownError = false, ownerError = false, reported = false, user
}: FieldStateInput): FieldState => {
  const givenState = given || inherited
  const shown = ownError || reported || user === 'invalid' ? 'invalid' : givenState || user || undefined
  const invalid = shown === 'invalid' || ownerError

  return {
    blocks: (givenState === 'invalid' || ownError || ownerError) && canBlock,
    invalid,
    state: invalid && shown !== 'invalid' ? undefined : shown
  }
}

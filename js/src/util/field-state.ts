export type FieldValidationState = 'invalid' | 'valid' | (string & {})

export type FieldStateInput = {
  given?: FieldValidationState | null
  inherited?: FieldValidationState | null
  ownError?: boolean
  ownerError?: boolean
  reported?: boolean
  user?: FieldValidationState | null
}

export type FieldState = {
  invalid: boolean
  state: FieldValidationState | undefined
}

/**
 * Resolves what a form field shows from the facts its edition collected, without reading the DOM:
 * an error of the component's own shows `'invalid'`, else the state it was given, else the state its
 * owner was given, else `'invalid'` when a validation reported its value, else the state the user's
 * interaction produced. An error of the owner's own marks the field invalid for assistive
 * technologies without a state class of its own.
 *
 * @param input - The facts: `given` and `inherited` from options, props or server markup, an empty
 * string counting as none; `ownError` and `ownerError` from the component and its owner; `reported`
 * when a validation found the value invalid; `user` for `:user-invalid` or `:user-valid`, or the
 * edition's equivalent
 * @returns `state` for the `is-{state}` class and `invalid` for `aria-invalid`
 */
export const resolveFieldState = ({
  given, inherited, ownError = false, ownerError = false, reported = false, user
}: FieldStateInput): FieldState => {
  const shown = ownError ? 'invalid' : (given || inherited || (reported ? 'invalid' : user || undefined))
  const invalid = shown === 'invalid' || ownerError

  return {
    invalid,
    state: invalid && shown !== 'invalid' ? undefined : shown
  }
}

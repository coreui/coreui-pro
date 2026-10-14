export type FilledSelection<T extends number | string> = {
  added: T[]
  refused: T | null
  values: T[]
}

export type SelectionMode = 'multiple' | 'none' | 'single'

export type SelectionState = 'all' | 'none' | 'some'

/**
 * Turns a selection given as one value, a list of values or nothing into the list a selection
 * mode keeps: none for `'none'`, the first value for `'single'` and all of them for `'multiple'`,
 * in the order given.
 *
 * @param value - The selection: a value, a list of values, or `null` or `undefined` for none
 * @param mode - The selection mode
 * @returns The selected values
 */
export const toSelectionValues = <T>(value: T | readonly T[] | null | undefined, mode: SelectionMode): T[] => {
  if (mode === 'none' || value === null || value === undefined) {
    return []
  }

  const values = Array.isArray(value) ? [...value] as T[] : [value as T]

  return mode === 'single' ? values.slice(0, 1) : values
}

/**
 * Gives the selection limit that applies: the configured limit when several values can be
 * selected and the limit is a number, and `null` otherwise.
 *
 * @param multiple - Whether more than one value can be selected
 * @param limit - The configured selection limit
 * @returns The limit, or `null` when none applies
 */
export const getSelectionLimit = (multiple: boolean, limit: unknown): number | null =>
  multiple && typeof limit === 'number' ? limit : null

/**
 * Tells whether a selection holds as many values as its limit allows.
 *
 * @param count - How many values are selected
 * @param limit - The selection limit, `null` or left out for none
 * @returns `true` when the selection is at or past the limit
 */
export const isSelectionLimitReached = (count: number, limit?: number | null): boolean =>
  limit !== null && limit !== undefined && count >= limit

/**
 * Tells how much of a set of options is selected: `'all'` once the selected options reach the
 * size of the set, or the selection limit when it is lower, `'none'` when none is selected, and
 * `'some'` otherwise. An empty set, or a limit of `0`, is never `'all'`.
 *
 * @param selected - How many options of the set are selected
 * @param total - How many options the set holds
 * @param limit - The selection limit, `null` or left out for none
 * @returns The state of the selection
 */
export const getSelectionState = (selected: number, total: number, limit?: number | null): SelectionState => {
  const target = limit === null || limit === undefined ? total : Math.min(total, limit)

  if (target > 0 && selected >= target) {
    return 'all'
  }

  return selected > 0 ? 'some' : 'none'
}

/**
 * Gives the `aria-pressed` value of a control that selects a whole set, such as a select-all
 * button or a selectable section label.
 *
 * @param state - The state of the selection
 * @returns `'true'` for `'all'`, `'mixed'` for `'some'` and `'false'` for `'none'`
 */
export const getAriaPressed = (state: SelectionState): 'false' | 'mixed' | 'true' => {
  if (state === 'all') {
    return 'true'
  }

  return state === 'some' ? 'mixed' : 'false'
}

/**
 * Adds candidates to a selection in their order until it holds as many values as the limit
 * allows. A candidate already in the selection, or listed twice, is skipped and takes no slot.
 * Values are compared the way a `Set` compares them, so `1` and `'1'` are different values.
 *
 * @param selected - The values selected so far
 * @param candidates - The values to add, in order
 * @param limit - The selection limit, `null` or left out for none
 * @returns The selection with the candidates that fit, the candidates it added, and the first
 * candidate the limit refused, or `null` when none was refused
 */
export const fillSelection = <T extends number | string>(selected: readonly T[], candidates: readonly T[], limit?: number | null): FilledSelection<T> => {
  const present = new Set(selected)
  const values = [...selected]
  const added: T[] = []

  for (const value of candidates) {
    if (present.has(value)) {
      continue
    }

    if (limit !== null && limit !== undefined && values.length >= limit) {
      return { added, refused: value, values }
    }

    present.add(value)
    values.push(value)
    added.push(value)
  }

  return { added, refused: null, values }
}

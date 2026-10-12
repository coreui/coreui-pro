export type SelectionState = 'all' | 'none' | 'some'

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

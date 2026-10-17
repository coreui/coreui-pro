export type CountLabel = string | ((count: number, total: number) => string)

export type FilledSelection<T extends number | string> = {
  added: T[]
  refused: T | null
  values: T[]
}

export type SelectionMode = 'multiple' | 'none' | 'single'

export type SelectionStore = {
  commit: (next: readonly string[]) => boolean
  has: (value: string) => boolean
  size: () => number
  values: () => string[]
}

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
 * Tells how much of a scope of options is selected when values outside the scope, hidden by a
 * filter or missing from the current options, count against the same selection limit: the scope
 * reads `'all'` once its selected options fill what the limit leaves after those values.
 *
 * @param selected - How many options of the scope are selected
 * @param total - How many options the scope holds
 * @param selectedOverall - How many values are selected in all, the scope included
 * @param limit - The selection limit, `null` or left out for none
 * @returns The state of the selection within the scope
 */
export const getScopeSelectionState = (selected: number, total: number, selectedOverall: number, limit?: number | null): SelectionState =>
  getSelectionState(selected, total, limit === null || limit === undefined ? null : limit - selectedOverall + selected)

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

/**
 * Creates the one place a selection lives: its values in the order they were selected, written
 * only through `commit`, which hands the proposed values to the owner's rule first. A list and
 * the component that owns it read the same store, so no copy has to be kept in step.
 *
 * @param fit - The owner's rule: gets the proposed values and the current ones, and returns the
 * values to keep; left out, the proposal is kept as it is
 * @returns `commit(next)`, which stores what the rule returns and tells whether the selection
 * changed, `has(value)`, `size()` and `values()`, a copy of the values in order
 */
export const createSelectionStore = (
  fit: (next: string[], current: readonly string[]) => string[] = next => next
): SelectionStore => {
  let selected: string[] = []
  let present = new Set<string>()

  return {
    commit(next) {
      const values = [...new Set(fit([...next], selected))]
      const changed = values.length !== selected.length || values.some((value, index) => value !== selected[index])

      if (changed) {
        selected = values
        present = new Set(values)
      }

      return changed
    },
    has: value => present.has(value),
    size: () => selected.length,
    values: () => [...selected]
  }
}

/**
 * Words how many options are selected. A function label receives the count and the total; a string
 * label has every `{count}` and `{total}` replaced.
 *
 * @param label - A template string, or a function of the count and the total
 * @param count - How many options are selected
 * @param total - How many options the count is out of
 * @returns The label text
 */
export const resolveCountLabel = (label: CountLabel, count: number, total: number): string =>
  typeof label === 'function' ?
    label(count, total) :
    label.replaceAll('{count}', String(count)).replaceAll('{total}', String(total))

export type ChipClassName = string | ((value: string) => unknown) | null | undefined

/**
 * Cleans a list of chip values: each one trimmed, the empty ones, `null` and `undefined` dropped,
 * and every repeat after the first left out.
 *
 * @param values - The raw values
 * @returns The chip values, in their first order
 */
export const getChipValues = (values: readonly unknown[]): string[] =>
  [...new Set(values.map(value => String(value ?? '').trim()).filter(Boolean))]

/**
 * Adds candidates to a list of chip values, in order: each one trimmed, an empty one, `null`,
 * `undefined` or one the list already holds skipped, and nothing added once the list holds
 * `maxChips` values.
 *
 * @param values - The chip values the list holds
 * @param candidates - The values to add
 * @param maxChips - The most values the list may hold, `null` or left out for no limit
 * @returns The new list; the values it added are the ones past `values.length`
 */
export const appendChipValues = (values: readonly string[], candidates: readonly unknown[], maxChips: number | null = null): string[] => {
  const next = [...values]

  for (const candidate of candidates) {
    if (maxChips !== null && next.length >= maxChips) {
      break
    }

    const value = String(candidate ?? '').trim()

    if (value && !next.includes(value)) {
      next.push(value)
    }
  }

  return next
}

/**
 * Splits text at a separator into its pieces, as they are: empty and repeated pieces included.
 *
 * @param text - The text
 * @param separator - The separator, `null` or left out for none
 * @returns The pieces, untrimmed, or `null` when the text holds no separator
 */
export const splitChipText = (text: string, separator?: string | null): string[] | null =>
  separator && text.includes(separator) ? text.split(separator) : null

/**
 * Resolves the extra class of a chip: the string itself, or what a function returns for the
 * chip's value when that is a string.
 *
 * @param chipClassName - A class string, a function of the value, or nothing
 * @param value - The chip's value
 * @returns The class, or an empty string when there is none
 */
export const resolveChipClassName = (chipClassName: ChipClassName, value: string): string => {
  const className = typeof chipClassName === 'function' ? chipClassName(value) : chipClassName

  return typeof className === 'string' ? className : ''
}

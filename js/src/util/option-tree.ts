import { escapeHtml } from './sanitizer.js'

export type OptionItem = string | {
  disabled?: boolean
  label?: string
  options?: OptionItem[]
  value?: number | string | null
}

/**
 * Tells whether an entry of an options list is a group, that is an object holding its own
 * `options` list.
 *
 * @param option - The entry
 * @returns `true` for a group
 */
export const isOptionGroup = (option: unknown): boolean =>
  typeof option === 'object' && option !== null && Array.isArray((option as { options?: unknown }).options)

/**
 * Lists the options of an options list in order, with every group, at any depth, replaced by
 * the options it holds.
 *
 * @param options - The options list, groups included
 * @returns The options, without the groups
 */
export const flattenOptions = <T extends OptionItem>(options: readonly T[]): T[] =>
  options.flatMap(option => (isOptionGroup(option) ? flattenOptions((option as { options: T[] }).options) : [option]))

/**
 * Reads the label of an option: the string itself for a plain string option.
 *
 * @param option - The option
 * @returns The label, or an empty string when the option has none
 */
export const getOptionLabel = (option: OptionItem): string =>
  typeof option === 'string' ? option : (option.label ?? '')

/**
 * Reads the value of an option as a string: the string itself for a plain string option, else
 * `value`, falling back to `label`.
 *
 * @param option - The option
 * @returns The value, or an empty string when the option has neither
 */
export const getOptionValue = (option: OptionItem): string =>
  typeof option === 'string' ? option : String(option.value ?? option.label ?? '')

/**
 * Tells whether an option is disabled. A plain string option never is.
 *
 * @param option - The option
 * @returns `true` when the option is disabled
 */
export const isOptionDisabled = (option: OptionItem): boolean =>
  typeof option !== 'string' && Boolean(option.disabled)

/**
 * Lists the options a user can select: every option of the list, groups flattened, that is not
 * disabled.
 *
 * @param options - The options list, groups included
 * @returns The enabled options
 */
export const getSelectableOptions = <T extends OptionItem>(options: readonly T[]): T[] =>
  flattenOptions(options).filter(option => !isOptionDisabled(option))

/**
 * Finds the first option whose label equals a text, ignoring case and surrounding spaces. Group
 * labels are not matched.
 *
 * @param options - The options list, groups included
 * @param label - The text to match
 * @returns The option, or `null` when none matches
 */
export const findOptionByLabel = <T extends OptionItem>(options: readonly T[], label: string): T | null =>
  flattenOptions(options).find(option => getOptionLabel(option).trim().toLowerCase() === label.trim().toLowerCase()) ?? null

/**
 * Finds the first option whose value, compared as text, equals a value, so `1` finds an option
 * whose value is `'1'`. An option without a value is found by its label. Groups are not matched.
 *
 * @param options - The options list, groups included
 * @param value - The value to match
 * @returns The option, or `null` when none matches
 */
export const findOptionByValue = <T extends OptionItem>(options: readonly T[], value: number | string): T | null =>
  flattenOptions(options).find(option => getOptionValue(option) === String(value)) ?? null

/**
 * Prepares a text for search matching: trimmed, lowercased and, when asked, decomposed with the
 * combining diacritics removed, so `Café` and `cafe` compare equal. Only marks that are both
 * combining (category M) and diacritics go: vowel signs of scripts such as Devanagari stay, and so
 * do spacing characters such as `^`.
 *
 * @param text - The text to prepare
 * @param foldAccents - Whether to remove the combining diacritics
 * @returns The prepared text
 */
export const normalizeSearchText = (text: string, foldAccents = false): string => {
  const lowercase = text.trim().toLowerCase()

  return foldAccents ? lowercase.normalize('NFD').replaceAll(/(?=\p{Diacritic})\p{M}/gu, '') : lowercase
}

/**
 * Narrows an options list to the options whose label contains a query, both prepared by
 * `normalizeSearchText`. A group stays with those of its options that match and goes when none
 * does, so an empty query keeps every option and drops only the empty groups; a group's own label
 * is not matched.
 *
 * @param options - The options list, groups included
 * @param query - The text to search for
 * @param foldAccents - Whether accents are removed before comparing
 * @returns The matching options, in their groups
 */
export const filterOptionTree = <T extends OptionItem>(options: readonly T[], query: string, foldAccents = false): T[] => {
  const needle = normalizeSearchText(query, foldAccents)
  const filter = (list: readonly T[]): T[] => list.flatMap(option => {
    if (isOptionGroup(option)) {
      const matched = filter((option as { options: T[] }).options)

      return matched.length > 0 ? [{ ...option as object, options: matched } as unknown as T] : []
    }

    return normalizeSearchText(getOptionLabel(option), foldAccents).includes(needle) ? [option] : []
  })

  return filter(options)
}

/**
 * Renders a label as HTML with the matches of a query wrapped in `<strong>`: case-insensitive,
 * found left to right and never overlapping. The whole label is escaped, and the query is matched
 * as plain text, so none of its characters act as a pattern.
 *
 * @param label - The text to render
 * @param query - The text to mark; surrounding whitespace is ignored, and an empty or missing query
 * marks nothing
 * @returns The label as HTML
 */
export const highlightMatches = (label: string, query?: string | null): string => {
  const needle = query?.trim()

  if (!needle) {
    return escapeHtml(label)
  }

  const pattern = new RegExp(`(${needle.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')

  return String(label)
    .split(pattern)
    .map((part, index) => (index % 2 === 0 ? escapeHtml(part) : `<strong>${escapeHtml(part)}</strong>`))
    .join('')
}

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
 * Finds the first option whose label equals a text, ignoring case. Group labels are not matched.
 *
 * @param options - The options list, groups included
 * @param label - The text to match
 * @returns The option, or `null` when none matches
 */
export const findOptionByLabel = <T extends OptionItem>(options: readonly T[], label: string): T | null =>
  flattenOptions(options).find(option => getOptionLabel(option).toLowerCase() === label.toLowerCase()) ?? null

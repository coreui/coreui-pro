export type TransferOption = {
  disabled?: boolean
  hidden?: boolean
  value: string
}

/**
 * Splits the options of a transfer between its two lists. The source list holds the options whose
 * value is not chosen, in the order of `options`; the target list holds the chosen ones in the
 * order of `value`, and a chosen value that no option carries is left out.
 *
 * @param options - Every option of the transfer
 * @param value - The values of the target list
 * @returns The options of the source list and of the target list
 */
export const splitTransferOptions = <T extends { value: string }>(options: readonly T[], value: readonly string[]): { source: T[]; target: T[] } => ({
  source: options.filter(option => !value.includes(option.value)),
  target: value
    .map(entry => options.find(option => option.value === entry))
    .filter((option): option is T => option !== undefined)
})

/**
 * Lists the values a move of a whole list takes: those of its options that are neither hidden nor
 * disabled, in list order.
 *
 * @param options - The options of the list
 * @returns The values that move
 */
export const getMovableValues = (options: readonly TransferOption[]): string[] =>
  options.filter(option => !option.hidden && !option.disabled).map(option => option.value)

/**
 * Picks the values a move of a selection takes: those of the enabled options whose value is
 * wanted, in list order. A hidden option moves too, so a search does not undo a selection.
 *
 * @param options - The options of the list the move starts from
 * @param wanted - The values asked to move
 * @returns The values that move
 */
export const pickMovableValues = (options: readonly TransferOption[], wanted: readonly string[]): string[] =>
  options.filter(option => !option.disabled && wanted.includes(option.value)).map(option => option.value)

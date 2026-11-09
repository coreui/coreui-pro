export type ChipAnnouncement = string | ((values: string[]) => string)
export type ChipRemoveLabel = string | ((label: string) => string)

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
 * Filters a list without some values, each taken out once, so a repeated piece keeps its other copies.
 *
 * @param pieces - The list
 * @param values - The values to take out
 * @param read - What of a piece is compared, the piece itself by default
 * @returns The pieces left, in their order
 */
export const withoutEach = (pieces: readonly string[], values: readonly string[], read: (piece: string) => string = piece => piece): string[] => {
  const left = [...values]

  return pieces.filter(piece => {
    const index = left.indexOf(read(piece))

    if (index === -1) {
      return true
    }

    left.splice(index, 1)
    return false
  })
}

/**
 * Takes the pieces that became chips out of the text of a chip field, each once, with their
 * separators. Pieces no chip came from stay as they are.
 *
 * @param text - The text of the field
 * @param added - The values of the chips the text became
 * @param separator - The separator, `null` or left out for none
 * @returns The text left in the field
 */
export const removeChipText = (text: string, added: readonly string[], separator?: string | null): string => {
  const kept = withoutEach(splitChipText(text, separator) ?? [text], added, piece => piece.trim())

  return kept.some(piece => piece.trim()) ?
    kept.filter((piece, index) => piece.trim() || index === kept.length - 1).join(separator ?? '') :
    ''
}

/**
 * Finds the pieces of a chip field's text that a newly typed separator completed. A piece that was
 * complete before is not one of them, so a refused piece is not asked for again, and editing text
 * without adding a separator completes nothing.
 *
 * @param text - The text of the field now
 * @param previous - The text it held before
 * @param separator - The separator, `null` or left out for none
 * @returns The completed pieces, untrimmed
 */
export const getNewChipPieces = (text: string, previous: string, separator?: string | null): string[] => {
  const parts = splitChipText(text, separator)
  const before = splitChipText(previous, separator) ?? [previous]

  if (!parts || parts.length <= before.length) {
    return []
  }

  return withoutEach(parts.slice(0, -1), before.slice(0, -1))
}

/**
 * Tells which requested texts a page took, from how its values changed. A text counts when a new
 * value equals it, letter case aside, so a page that lowercases what it takes still empties the
 * field and a value that came from somewhere else does not.
 *
 * @param requested - The texts asked for
 * @param previous - The values before the change
 * @param next - The values after it
 * @returns The requested texts that became chips
 */
export const takeAcceptedChipText = (requested: readonly string[], previous: readonly string[], next: readonly string[]): string[] => {
  const added = new Set(next.filter(value => !previous.includes(value)).map(value => value.toLowerCase()))

  return requested.filter(text => added.has(text.toLowerCase()))
}

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

/**
 * Words the change between two lists of chip values for a live region. The values the list did not
 * hold before are the ones named, each once, or, when there is none, the values it no longer holds;
 * empty values are left out. A string label follows the values, joined with commas; a function label
 * receives them and returns the whole message.
 *
 * @param before - The chip values before the change
 * @param after - The chip values after it
 * @param addedLabel - The word that follows added values, or a function that words them
 * @param removedLabel - The word that follows removed values, or a function that words them
 * @returns The message, or `null` when no value was added or removed or the label gave no text
 */
export const getChipAnnouncement = (before: readonly string[], after: readonly string[], addedLabel: ChipAnnouncement, removedLabel: ChipAnnouncement): string | null => {
  let changed = [...new Set(after.filter(value => value && !before.includes(value)))]
  let label = addedLabel

  if (changed.length === 0) {
    changed = [...new Set(before.filter(value => value && !after.includes(value)))]
    label = removedLabel
  }

  return (changed.length > 0 && (typeof label === 'function' ? label(changed) : `${changed.join(', ')} ${label}`)) || null
}

/**
 * Names a chip's remove button. A string label has `{label}` replaced by the chip's label, or the
 * chip's label appended after a space when it holds no `{label}`; a function label receives the
 * chip's label and returns the whole name.
 *
 * @param removeLabel - The text of the name, or a function that words it
 * @param label - The chip's label
 * @returns The name of the remove button
 */
export const getChipRemoveLabel = (removeLabel: ChipRemoveLabel, label: string): string => {
  if (typeof removeLabel === 'function') {
    return removeLabel(label)
  }

  return removeLabel.includes('{label}') ? removeLabel.replaceAll('{label}', () => label) : `${removeLabel} ${label}`.trim()
}

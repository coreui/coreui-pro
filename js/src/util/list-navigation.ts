export { getNextActiveElement } from './index.js'

export type TypeaheadBuffer = {
  clear: () => void
  push: (key: string) => string | null
}

/**
 * Creates the buffer a list collects typed characters in for typeahead. Every character extends
 * the text, lowercased, and the text empties once no character has come for the given time.
 *
 * @param timeout - How long, in milliseconds, the text survives without a new character, 500 when
 * left out
 * @returns `push(key)`, which adds a key value of one character other than the space and returns
 * the text, or returns `null` for any other key, and `clear()`, which empties the text and stops the
 * timer
 */
export const createTypeaheadBuffer = (timeout = 500): TypeaheadBuffer => {
  let text = ''
  let timer: ReturnType<typeof setTimeout> | undefined

  return {
    clear() {
      clearTimeout(timer)
      text = ''
    },
    push(key) {
      if (key.length !== 1 || key === ' ') {
        return null
      }

      clearTimeout(timer)
      text += key.toLowerCase()
      timer = setTimeout(() => {
        text = ''
      }, timeout)

      return text
    }
  }
}

/**
 * Finds the entry typeahead moves to: the first whose text, trimmed and ignoring case, starts with
 * the typed text, searched in list order from the current entry and wrapping around. A single
 * character starts after the current entry, so typing it again once the buffer has emptied moves to
 * the next entry it starts; longer text starts at the current entry, so typing on refines the match.
 * With no current entry the search starts at the first.
 *
 * @param items - The entries, in order
 * @param current - The index of the current entry, `-1` for none
 * @param text - The typed text
 * @param textOf - Reads the text of an entry
 * @returns The matching entry, or `undefined` when none starts with the text
 */
export const findTypeaheadMatch = <T>(items: readonly T[], current: number, text: string, textOf: (item: T) => string): T | undefined => {
  const needle = text.toLowerCase()
  const start = needle.length > 1 ? Math.max(current, 0) : current + 1
  const ordered = [...items.slice(start), ...items.slice(0, start)]

  return ordered.find(item => textOf(item).trim().toLowerCase().startsWith(needle))
}

/**
 * Lists the entries from an anchor to a target, both included and in list order whichever comes
 * first. An anchor that is not in the list counts as the target itself.
 *
 * @param items - The entries, in order
 * @param from - The index of the anchor, `-1` for none
 * @param to - The index of the target, `-1` for none
 * @returns The entries in the range, or none when the target is not in the list
 */
export const rangeBetween = <T>(items: readonly T[], from: number, to: number): T[] => {
  if (to === -1) {
    return []
  }

  const start = from === -1 ? to : from

  return items.slice(Math.min(start, to), Math.max(start, to) + 1)
}

/**
 * Picks the item the focus moves to when one leaves a list: the next item, or the previous one when
 * the item was the last. An item the list does not hold gives the first item.
 *
 * @param list - The items, in order and each once, the leaving one included
 * @param item - The item that leaves
 * @returns The neighbor, or `null` when the item is the only one
 */
export const getRemovalNeighbor = <T>(list: readonly T[], item: T): T | null => {
  const index = list.indexOf(item)

  return list[index + 1] ?? list[index - 1] ?? null
}

/**
 * Tells whether a key press types into a text field: Backspace, Delete, a dead key that starts an
 * accent, or a single character other than the space bar. A press with Meta, or with Ctrl but no
 * Alt, is a shortcut instead; Ctrl with Alt is AltGr on Windows and Alt alone is Option on macOS,
 * so both still type. Nothing types during an IME composition or for a key event without a key,
 * such as the ones autofill sends.
 *
 * @param event - The key press
 * @returns `true` for a key that types
 */
export const isTypingKey = (event: Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'isComposing' | 'key' | 'metaKey'>): boolean => {
  if (typeof event.key !== 'string' || event.isComposing || event.metaKey || (event.ctrlKey && !event.altKey)) {
    return false
  }

  return ['Backspace', 'Dead', 'Delete'].includes(event.key) || (event.key.length === 1 && event.key !== ' ')
}

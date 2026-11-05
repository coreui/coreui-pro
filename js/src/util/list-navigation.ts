export { getNextActiveElement } from './index.js'

export type TypeaheadBuffer = {
  clear: () => void
  push: (key: string | undefined) => string | null
}

/**
 * Creates the buffer a list collects typed characters in for typeahead. Every character extends
 * the text, lowercased, and the text empties once no character has come for the given time.
 *
 * @param timeout - How long, in milliseconds, the text survives without a new character, 500 when
 * left out
 * @returns `push(key)`, which adds a key value of one character other than the space and returns
 * the text, or returns `null` for any other key or for a key event without a key, and `clear()`,
 * which empties the text and stops the timer
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
      if (key?.length !== 1 || key === ' ') {
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
 * Finds the entry a list starts on when a key opens it: a character other than the space gives its
 * typeahead match, and any other key the current entry. Without a current entry, `ArrowUp` gives
 * the last entry, any other key the first, and no key nothing. A character that matches nothing
 * keeps the current entry.
 *
 * @param items - The entries, in order
 * @param current - The index of the current entry, such as the selected one, `-1` for none
 * @param key - The key value that opened the list, `null` when no key did
 * @param textOf - Reads the text of an entry
 * @returns The entry to start on, or `undefined` when there is none to move to
 */
export const findOpeningItem = <T>(items: readonly T[], current: number, key: string | null, textOf: (item: T) => string): T | undefined => {
  if (key?.length === 1 && key !== ' ') {
    return findTypeaheadMatch(items, current, key, textOf) ?? items[current]
  }

  if (current !== -1 || key === null) {
    return items[current]
  }

  return items.at(key === 'ArrowUp' ? -1 : 0)
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
 * Scrolls a container just enough to show an element inside its padding box, the part a border or
 * a scrollbar does not cover. An element taller than that is aligned by its top edge. Only the
 * container's own scroll position moves, never the page's, so a panel that is still being placed
 * cannot drag the page.
 *
 * @param container - The scrolling element, such as a list with a `max-height`
 * @param element - The element to show; nothing happens without one
 * @returns Nothing
 */
export const scrollIntoContainer = (container: Element, element: Element | null | undefined): void => {
  if (!element) {
    return
  }

  const top = container.getBoundingClientRect().top + container.clientTop
  const rect = element.getBoundingClientRect()
  const above = rect.top - top
  const below = rect.bottom - top - container.clientHeight

  if (above < 0) {
    container.scrollTop += above
  } else if (below > 0) {
    container.scrollTop += Math.min(above, below)
  }
}

export type VirtualWindow = {
  overscan: number
  pinned?: readonly number[]
  rows: number
  scrollTop: number
  viewport: number
}

export type VirtualRows = {
  gaps: number[]
  indexes: number[]
}

/**
 * Picks the rows a windowed list renders: the rows the viewport shows at the scroll position, the
 * given number of rows before and after them, and the pinned rows wherever they are. Until the
 * rows or the viewport have a height, the first `rows` rows stand in for the visible ones.
 *
 * @param sizes - The height of every row, in order; `0` for a row not measured yet
 * @param window - `scrollTop` and `viewport`, the scroll position and the height of the viewport
 * (`0` when it is not known); `rows`, how many rows stand in for the visible ones before anything is
 * measured; `overscan`, how many rows are rendered before and after the visible ones; `pinned`,
 * indexes rendered even outside the window, such as the active row, skipped when outside the list
 * @returns `indexes`, the rows to render in list order, each once, and `gaps`, the height of the
 * rows skipped before each of them, with one more entry for the rows skipped after the last
 */
export const getVirtualRows = (sizes: readonly number[], { overscan, pinned = [], rows, scrollTop, viewport }: VirtualWindow): VirtualRows => {
  const offsets = [0]

  for (const size of sizes) {
    offsets.push(offsets.at(-1)! + size)
  }

  const total = offsets.at(-1)!
  let first = 0
  let last = Math.min(rows, sizes.length)

  if (viewport > 0 && total > 0) {
    while (first < sizes.length - 1 && offsets[first + 1] <= scrollTop) {
      first++
    }

    last = first

    while (last < sizes.length && offsets[last] < scrollTop + viewport) {
      last++
    }
  }

  const indexes = new Set<number>()

  for (let index = Math.max(first - overscan, 0); index < Math.min(last + overscan, sizes.length); index++) {
    indexes.add(index)
  }

  for (const index of pinned) {
    if (index >= 0 && index < sizes.length) {
      indexes.add(index)
    }
  }

  const sorted = [...indexes].toSorted((a, b) => a - b)
  const gaps = sorted.map((index, position) => offsets[index] - (position === 0 ? 0 : offsets[sorted[position - 1] + 1]))

  gaps.push(total - (sorted.length === 0 ? 0 : offsets[sorted.at(-1)! + 1]))

  return { gaps, indexes: sorted }
}

/**
 * Finds the scroll position that shows a row of a windowed list with the least movement: the
 * current one when the row is in view, the row's top edge when it is above or taller than the
 * viewport, and the position that puts its bottom edge at the bottom of the viewport when it is
 * below.
 *
 * @param sizes - The height of every row, in order
 * @param index - The row to show
 * @param scrollTop - The current scroll position
 * @param viewport - The height of the viewport
 * @returns The scroll position, or the current one for an index outside the list
 */
export const getRevealScrollTop = (sizes: readonly number[], index: number, scrollTop: number, viewport: number): number => {
  if (index < 0 || index >= sizes.length) {
    return scrollTop
  }

  const top = sizes.slice(0, index).reduce((sum, size) => sum + size, 0)
  const bottom = top + sizes[index]

  if (top < scrollTop || bottom - top > viewport) {
    return top
  }

  return bottom > scrollTop + viewport ? bottom - viewport : scrollTop
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

export type EntryRequest = {
  activate?: boolean
  key?: string
  last?: boolean
  preferSelected?: boolean
}

/**
 * Tells whether a request to enter a list waits for more options instead of landing now: while the
 * list has no option to move to, and while it is loading when the request is after the selection (an
 * open on the selected option or on a key, not on the last option) and no selected value is listed
 * yet. An activation never waits.
 *
 * @param request - The entry request: `activate`, `key`, `last`, `preferSelected`
 * @param navigable - How many options the list can move to
 * @param loading - Whether the list waits for its options
 * @param selectionListed - Whether the selection is empty or one of its values is among those options
 * @returns `true` while the request should wait
 */
export const isEntryWaiting = (request: EntryRequest, navigable: number, loading: boolean, selectionListed: boolean): boolean =>
  !request.activate &&
  (navigable === 0 || (loading && !selectionListed && !request.last && (Boolean(request.preferSelected) || request.key !== undefined)))

/**
 * Tells whether a key press ends the wait of an entry request: a key that types, or, while there are
 * options to act on, one that moves through or activates them. Home and End count only when the field
 * does not take text, where they move the caret instead. A modifier on its own, Tab and Escape leave
 * the wait alone.
 *
 * @param event - The key press
 * @param editable - Whether the key goes to a field that takes text
 * @param navigable - How many options the list can move to
 * @returns `true` when the key ends the wait
 */
export const endsEntryWait = (event: Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'isComposing' | 'key' | 'metaKey'>, editable: boolean, navigable: number): boolean =>
  isTypingKey(event) ||
  (navigable > 0 && (['ArrowUp', 'ArrowDown', 'Enter', ' '].includes(event.key) || (!editable && (event.key === 'Home' || event.key === 'End'))))

/**
 * Tells whether a list that is entered late leaves the focus where it is: everywhere but on the list,
 * on an element holding it (such as its panel) and on the document body, read in the list's own
 * document or shadow root, so a focus outside that root stays too.
 *
 * @param list - The element holding the options
 * @returns `true` when the focus stays where it is
 */
export const keepsFocus = (list: Element): boolean => {
  const focused = (list.getRootNode() as Document | ShadowRoot).activeElement

  return focused !== document.body && !focused?.contains(list)
}

const listening = new WeakSet<Document>()
let pressPath: EventTarget[] | null = null
const clickPresses = new WeakMap<Event, EventTarget[]>()

/**
 * Forgets a press that no click has taken yet, so that only presses made from now on count.
 */
export const forgetPress = (): void => {
  pressPath = null
}

/**
 * Starts recording where left-button presses begin in a document, so that a later `click` can tell
 * where its own press started. Recording starts on the first call for a document and stays on for
 * the page.
 *
 * @param doc - The document to record in, the page's own by default
 */
export const trackPress = (doc: Document = document): void => {
  if (listening.has(doc)) {
    return
  }

  listening.add(doc)
  doc.addEventListener('pointerdown', event => {
    pressPath = event.button === 0 ? event.composedPath() : null
  }, true)
  doc.addEventListener('click', event => {
    if (pressPath?.includes(event.composedPath()[0])) {
      clickPresses.set(event, pressPath)
    }

    pressPath = null
  }, true)
  doc.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      forgetPress()
    }
  }, true)
  doc.addEventListener('contextmenu', forgetPress, true)
  doc.addEventListener('pointercancel', forgetPress, true)
}

/**
 * Returns the composed path of the press that produced a `click`: the left-button `pointerdown`
 * that the click is the first click after, when the click lands on that press's path (on the
 * pressed element or on an ancestor of it, where a drag sends its click). A click with no press of
 * its own (keyboard, assistive technology, `element.click()`) has none.
 *
 * @param event - The `click` event
 * @returns The path of the press, or `null` when the click has no press of its own
 */
export const pressPathOf = (event: Event): EventTarget[] | null =>
  clickPresses.get(event) ?? null

let listening = false
let pressPath: EventTarget[] | null = null
const clickPresses = new WeakMap<Event, EventTarget[]>()

/**
 * Forgets a press that no click has taken yet, so that only presses made from now on count.
 */
export const forgetPress = (): void => {
  pressPath = null
}

/**
 * Starts recording where left-button presses begin, so that a later `click` can tell where its own
 * press started. Recording starts on the first call and stays on for the page.
 */
export const trackPress = (): void => {
  if (listening) {
    return
  }

  listening = true
  document.addEventListener('pointerdown', event => {
    pressPath = event.button === 0 ? event.composedPath() : null
  }, true)
  document.addEventListener('click', event => {
    if (pressPath?.includes(event.composedPath()[0])) {
      clickPresses.set(event, pressPath)
    }

    pressPath = null
  }, true)
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      forgetPress()
    }
  }, true)
  document.addEventListener('contextmenu', forgetPress, true)
  document.addEventListener('pointercancel', forgetPress, true)
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

const SELECTOR_CONTROL = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]'

const listening = new WeakSet<Document>()
let pressPath: EventTarget[] | null = null
let lastPressed: Element | null = null
let releaseTarget: EventTarget | null = null
let pressPoints: PointerEvent[] = []
const clickPresses = new WeakMap<Event, EventTarget[]>()
const clickReleases = new WeakMap<Event, EventTarget>()
const clickPoints = new WeakMap<Event, PointerEvent[]>()

/**
 * Forgets a press that no click has taken yet, so that only presses made from now on count.
 */
export const forgetPress = (): void => {
  pressPath = null
}

/**
 * Starts recording where left-button presses begin and end in a document, so that a later `click`
 * can tell where its own press started and was released. Recording starts on the first call for a
 * document and stays on for the page.
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
    releaseTarget = null
    pressPoints = [event]
    lastPressed = (pressPath?.find(target => target instanceof Element && target.matches(SELECTOR_CONTROL)) as Element | undefined) ?? null
  }, true)
  doc.addEventListener('pointerup', event => {
    releaseTarget = event.button === 0 ? event.composedPath()[0] : null
    pressPoints[1] = event
  }, true)
  doc.addEventListener('click', event => {
    if (pressPath?.includes(event.composedPath()[0])) {
      clickPresses.set(event, pressPath)
      clickPoints.set(event, pressPoints)

      if (releaseTarget) {
        clickReleases.set(event, releaseTarget)
      }
    }

    pressPath = null
  }, true)
  doc.addEventListener('keydown', event => {
    lastPressed = null

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

/**
 * Tells whether a `click` came from a press that started and was released on an element itself,
 * not on something inside it, or from no press of its own (keyboard, assistive technology,
 * `element.click()`). A drag from the inside of a dialog to its `::backdrop`, or back, sends its
 * click to the dialog, and this tells it apart from a click on the backdrop. A press the document
 * cannot follow into the element, inside a closed shadow root, counts.
 *
 * @param event - The `click` event
 * @param element - The element the press has to start and end on
 * @returns `false` when the click's press started or was released somewhere else, or was not
 * released at all
 */
export const isPressOn = (event: Event, element: Element): boolean => {
  const press = pressPathOf(event)

  return !press || !press.includes(element) || (press[0] === element && clickReleases.get(event) === element)
}

/**
 * Tells whether a `click` on a modal dialog belongs to its `::backdrop`: the press started and was
 * released on the dialog itself (see `isPressOn`), and both points lie outside the dialog's border
 * box. A click with no press of its own is judged by its own point. A press inside the box, on the
 * dialog's border or on a gap between its parts, and the click a screen reader sends to the middle
 * of the dialog, do not count.
 *
 * @param event - The `click` event, whose target is the dialog
 * @param dialog - The dialog element
 * @returns `true` when the click belongs to the backdrop
 */
export const isBackdropClick = (event: MouseEvent, dialog: Element): boolean => {
  const { bottom, left, right, top } = dialog.getBoundingClientRect()

  return isPressOn(event, dialog) && (clickPoints.get(event) ?? [event]).every(({ clientX: x, clientY: y }) =>
    x < left || x >= right || y < top || y >= bottom
  )
}

/**
 * Returns the control the last left-button press started in (the element itself or its closest
 * link, button, form field or element with `tabindex`, across shadow roots), until a key is
 * pressed. It tells which control a click activated where the browser does not focus it
 * (Safari, buttons).
 *
 * @returns The pressed control, or `null` when a key came after the last press, the press was on
 * no control or nothing was pressed
 */
export const lastPressedElement = (): Element | null => lastPressed

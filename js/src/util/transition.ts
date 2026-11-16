const MILLISECONDS_MULTIPLIER = 1000
const TRANSITION_END = 'transitionend'

/**
 * Read how long the first CSS transition of an element takes, its delay included.
 *
 * @param element The element whose computed transition is read.
 * @returns The duration and delay of the first transition in milliseconds, or 0 when there is none.
 */
export const getTransitionDurationFromElement = (element: Element | null): number => {
  if (!element) {
    return 0
  }

  let { transitionDuration, transitionDelay } = window.getComputedStyle(element)

  const floatTransitionDuration = Number.parseFloat(transitionDuration)
  const floatTransitionDelay = Number.parseFloat(transitionDelay)

  if (!floatTransitionDuration && !floatTransitionDelay) {
    return 0
  }

  transitionDuration = transitionDuration.split(',')[0]
  transitionDelay = transitionDelay.split(',')[0]

  return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER
}

/**
 * Return the unfinished CSS transitions of an element that a wait of the given length covers.
 *
 * @param element The element whose transitions are read.
 * @param duration Without a property, only the transitions whose delay and duration add up to no more than this many milliseconds count.
 * @param transitionProperty When given, only the transitions of this property count, whatever their length.
 * @returns The transitions, or an empty list where Web Animations are not available.
 */
export const getCoveredTransitions = (element: Element, duration: number, transitionProperty?: string): CSSTransition[] => {
  if (typeof element.getAnimations !== 'function' || typeof CSSTransition === 'undefined') {
    return []
  }

  return element.getAnimations().filter((animation): animation is CSSTransition =>
    animation instanceof CSSTransition &&
    animation.playState !== 'finished' &&
    (transitionProperty ?
      animation.transitionProperty === transitionProperty :
      Number(animation.effect?.getComputedTiming().endTime) <= duration)
  )
}

/**
 * Run a callback once the transition of an element has finished.
 *
 * The callback runs on the element's own `transitionend`, or when a timer as long as the
 * transition expires, so an element with no transition (`transition: none`, reduced motion) or one
 * whose transition never ends still gets it. A timer that fires more than a frame late means a busy
 * main thread, which delayed the start of the transition too; a covered transition still running at
 * that moment is then waited for until it finishes or is cancelled, at most as long again and one
 * more second. In a hidden document the timer always settles. Each wait ends on its own event or
 * timer, never on another wait's. `transitionProperty` narrows the wait to that property.
 *
 * @param callback The function to run.
 * @param transitionElement The element whose transition is waited for.
 * @param waitForTransition When false, the callback runs at once.
 * @param transitionProperty When given, only this property's transition is waited for.
 * @returns A function that stops the wait without running the callback.
 */
export const executeAfterTransition = (callback: () => void, transitionElement: Element, waitForTransition = true, transitionProperty?: string): (() => void) => {
  if (!waitForTransition) {
    callback()
    return () => {}
  }

  const durationPadding = 5
  const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding
  const start = Date.now()
  const transitions = getCoveredTransitions(transitionElement, emulatedDuration, transitionProperty)

  const handler = (event: Event): void => {
    if (event.target !== transitionElement) {
      return
    }

    if (transitionProperty && (event as TransitionEvent).propertyName !== transitionProperty) {
      return
    }

    finish()
  }

  let settled = false

  const cancel = (): void => {
    settled = true
    clearTimeout(timeout)
    transitionElement.removeEventListener(TRANSITION_END, handler)
  }

  const finish = (): void => {
    if (settled) {
      return
    }

    cancel()
    callback()
  }

  transitionElement.addEventListener(TRANSITION_END, handler)
  let timeout = setTimeout(() => {
    const late = Date.now() - start > emulatedDuration + 16
    const running = document.hidden || !late ? [] : transitions.filter(transition => transition.playState === 'running')

    if (running.length === 0) {
      finish()
      return
    }

    timeout = setTimeout(finish, emulatedDuration + 1000)
    Promise.race(running.map(transition => transition.finished)).then(finish, finish)
  }, emulatedDuration)

  return cancel
}

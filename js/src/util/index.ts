/**
 * --------------------------------------------------------------------------
 * CoreUI util/index.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This is a modified version of the Bootstrap's util/index.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

/**
 * Types
 */

// The jQuery bridge is untyped on purpose: jQuery is optional at runtime and we
// only ever touch `.jquery`, index 0, and the plugin registration surface.
type JQueryLike = { jquery?: unknown, [index: number]: HTMLElement }
type JQueryStatic = ((selector: unknown) => any) & Record<string, any> & { fn: Record<string, any> }
type JQueryPlugin = { NAME: string, jQueryInterface: (...args: any[]) => unknown }

declare global {
  interface Window {
    jQuery?: JQueryStatic
  }
}

const MAX_UID = 1_000_000
const MILLISECONDS_MULTIPLIER = 1000
const TRANSITION_END = 'transitionend'

/**
 * Properly escape IDs selectors to handle weird IDs
 * @param {string} selector
 * @returns {string}
 */
const parseSelector = (selector: string): string => {
  // The `window.CSS` checks guard against ancient browsers, so check them as
  // untyped values instead of letting tsc call them always-defined
  if (selector && (window as any).CSS && (window as any).CSS.escape) {
    // document.querySelector needs escaping to handle IDs (html5+) containing for instance /
    selector = selector.replace(/#([^\s"#']+)/g, (match, id: string) => `#${CSS.escape(id)}`)
  }

  return selector
}

// Shout-out Angus Croll (https://goo.gl/pxwQGp)
const toType = (object: unknown): string => {
  if (object === null || object === undefined) {
    return `${object}`
  }

  return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)![1].toLowerCase()
}

/**
 * Public Util API
 */

const getUID = (prefix: string): string => {
  do {
    prefix += Math.floor(Math.random() * MAX_UID)
  } while (document.getElementById(prefix))

  return prefix
}

const getTransitionDurationFromElement = (element: Element | null): number => {
  if (!element) {
    return 0
  }

  // Get transition-duration of the element
  let { transitionDuration, transitionDelay } = window.getComputedStyle(element)

  const floatTransitionDuration = Number.parseFloat(transitionDuration)
  const floatTransitionDelay = Number.parseFloat(transitionDelay)

  // Return 0 if element or transition duration is not found
  if (!floatTransitionDuration && !floatTransitionDelay) {
    return 0
  }

  // If multiple durations are defined, take the first
  transitionDuration = transitionDuration.split(',')[0]
  transitionDelay = transitionDelay.split(',')[0]

  return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER
}

const triggerTransitionEnd = (element: Element): void => {
  element.dispatchEvent(new Event(TRANSITION_END))
}

const isElement = (object: unknown): object is Element => {
  if (!object || typeof object !== 'object') {
    return false
  }

  if (typeof (object as JQueryLike).jquery !== 'undefined') {
    object = (object as JQueryLike)[0]
  }

  return typeof (object as Element).nodeType !== 'undefined'
}

const getElement = (object: unknown): HTMLElement | null => {
  // it's a jQuery object or a node element
  if (isElement(object)) {
    return (object as unknown as JQueryLike).jquery ? (object as unknown as JQueryLike)[0] : object as HTMLElement
  }

  if (typeof object === 'string' && object.length > 0) {
    return document.querySelector(parseSelector(object))
  }

  return null
}

const isVisible = (element: unknown): boolean => {
  if (!isElement(element) || element.getClientRects().length === 0) {
    return false
  }

  const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible'
  // Handle `details` element as its content may falsie appear visible when it is closed
  const closedDetails = element.closest('details:not([open])')

  if (!closedDetails) {
    return elementIsVisible
  }

  if (closedDetails !== element) {
    const summary = element.closest('summary')
    if (summary && summary.parentNode !== closedDetails) {
      return false
    }

    if (summary === null) {
      return false
    }
  }

  return elementIsVisible
}

const isDisabled = (element: Element | null | undefined): boolean => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return true
  }

  if (element.classList.contains('disabled')) {
    return true
  }

  if (typeof (element as HTMLInputElement).disabled !== 'undefined') {
    return (element as HTMLInputElement).disabled
  }

  return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false'
}

// ARIA state attributes take the strings 'true' and 'false', but we track those
// states as booleans. This keeps the conversion in one place, so callers do not
// have to reach for a cast to satisfy `setAttribute`.
const setAriaAttribute = (element: Element, name: string, value: boolean): void => {
  element.setAttribute(name, String(value))
}

const findShadowRoot = (element: Node): ShadowRoot | null => {
  if (!document.documentElement.attachShadow) {
    return null
  }

  // Can find the shadow root otherwise it'll return the document
  if (typeof element.getRootNode === 'function') {
    const root = element.getRootNode()
    return root instanceof ShadowRoot ? root : null
  }

  if (element instanceof ShadowRoot) {
    return element
  }

  // when we don't find a shadow root
  if (!element.parentNode) {
    return null
  }

  return findShadowRoot(element.parentNode)
}

const noop = (): void => {}

/**
 * Trick to restart an element's animation
 *
 * @param {HTMLElement} element
 * @return void
 *
 * @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
 */
const reflow = (element: HTMLElement): void => {
  element.offsetHeight // eslint-disable-line @typescript-eslint/no-unused-expressions
}

const getjQuery = (): JQueryStatic | null => {
  if (window.jQuery && !document.body.hasAttribute('data-coreui-no-jquery')) {
    return window.jQuery
  }

  return null
}

const DOMContentLoadedCallbacks: Array<() => void> = []

const onDOMContentLoaded = (callback: () => void): void => {
  if (document.readyState === 'loading') {
    // add listener on the first call when the document is in loading state
    if (!DOMContentLoadedCallbacks.length) {
      document.addEventListener('DOMContentLoaded', () => {
        for (const callback of DOMContentLoadedCallbacks) {
          callback()
        }
      })
    }

    DOMContentLoadedCallbacks.push(callback)
  } else {
    callback()
  }
}

// The direction an element is laid out in, read from the computed style rather
// than from `:dir()`: the logical properties that place everything resolve
// against this one. An element outside the document has no computed direction,
// so the nearest ancestor that declares one answers for it.
const isRTL = (element?: Element | null): boolean => {
  const target = element ?? document.documentElement

  if (target.isConnected) {
    return window.getComputedStyle(target).direction === 'rtl'
  }

  const declared = target.closest('[dir]')

  return declared ?
    declared.matches(':dir(rtl)') :
    window.getComputedStyle(document.documentElement).direction === 'rtl'
}

const defineJQueryPlugin = (plugin: JQueryPlugin): void => {
  onDOMContentLoaded(() => {
    const $ = getjQuery()
    /* istanbul ignore if */
    if ($) {
      const name = plugin.NAME
      const JQUERY_NO_CONFLICT = $.fn[name]
      $.fn[name] = plugin.jQueryInterface
      $.fn[name].Constructor = plugin
      $.fn[name].noConflict = () => {
        $.fn[name] = JQUERY_NO_CONFLICT
        return plugin.jQueryInterface
      }
    }
  })
}

type JQueryComponent = { getOrCreateInstance: (element: Element, config?: any) => any }

// A string argument names a public method; private members and misses throw.
const jQueryDispatch = (collection: any, Component: JQueryComponent, config: any, args: unknown[] | ((element: HTMLElement) => unknown[]) = []): any => {
  return collection.each(function (this: HTMLElement) {
    const data = Component.getOrCreateInstance(this, config)

    if (typeof config !== 'string') {
      return
    }

    if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
      throw new TypeError(`No method named "${config}"`)
    }

    data[config](...(typeof args === 'function' ? args(this) : args))
  })
}

const execute = <T = any>(possibleCallback: T | ((...functionArgs: any[]) => T), args: any[] = [], defaultValue: T | ((...functionArgs: any[]) => T) = possibleCallback): T => {
  return typeof possibleCallback === 'function' ? (possibleCallback as (...functionArgs: any[]) => T).call(...args as [any, ...any[]]) : defaultValue as T
}

/**
 * Return the unfinished CSS transitions of an element that a wait of the given length covers.
 *
 * @param element The element whose transitions are read.
 * @param duration Without a property, only the transitions whose delay and duration add up to no more than this many milliseconds count.
 * @param transitionProperty When given, only the transitions of this property count, whatever their length.
 * @returns The transitions, or an empty list where Web Animations are not available.
 */
const getCoveredTransitions = (element: Element, duration: number, transitionProperty?: string): CSSTransition[] => {
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
 * transition expires. A timer that fires more than a frame late means a busy main thread, which
 * delayed the start of the transition too; a covered transition still running at that moment is
 * then waited for until it finishes or is cancelled, at most as long again and one more second.
 * In a hidden document the timer always settles. `transitionProperty` narrows the wait to that
 * property, since the events of a run that just finished can land after the next run has started
 * waiting.
 *
 * @param callback The function to run.
 * @param transitionElement The element whose transition is waited for.
 * @param waitForTransition When false, the callback runs at once.
 * @param transitionProperty When given, only this property's transition is waited for.
 */
const executeAfterTransition = (callback: () => void, transitionElement: Element, waitForTransition = true, transitionProperty?: string): void => {
  if (!waitForTransition) {
    execute(callback)
    return
  }

  const durationPadding = 5
  const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding
  const start = Date.now()
  const transitions = getCoveredTransitions(transitionElement, emulatedDuration, transitionProperty)

  let called = false

  const finish = (): void => {
    if (called) {
      return
    }

    called = true
    transitionElement.removeEventListener(TRANSITION_END, handler)
    execute(callback)
  }

  const handler = (event: Event): void => {
    if (event.target !== transitionElement) {
      return
    }

    const { propertyName } = event as TransitionEvent
    if (transitionProperty && propertyName && propertyName !== transitionProperty) {
      return
    }

    finish()
  }

  transitionElement.addEventListener(TRANSITION_END, handler)
  setTimeout(() => {
    const late = Date.now() - start > emulatedDuration + 16
    const running = called || document.hidden || !late ? [] : transitions.filter(transition => transition.playState === 'running')

    if (running.length === 0) {
      if (!called) {
        triggerTransitionEnd(transitionElement)
      }

      return
    }

    Promise.race(running.map(transition => transition.finished)).then(finish, finish)
    setTimeout(finish, emulatedDuration + 1000)
  }, emulatedDuration)
}

/**
 * Return the previous/next element of a list.
 *
 * @param {array} list    The list of elements
 * @param activeElement   The active element
 * @param shouldGetNext   Choose to get next or previous element
 * @param isCycleAllowed
 * @return {Element|elem} The proper element
 */
// `isCycleAllowed` is optional here where upstream requires it: our callers
// omit it, and adding the argument to match would change the emitted code.
const getNextActiveElement = <T>(list: T[], activeElement: T, shouldGetNext: boolean, isCycleAllowed?: boolean): T => {
  const listLength = list.length
  let index = list.indexOf(activeElement)

  // if the element does not exist in the list return an element
  // depending on the direction and if cycle is allowed
  if (index === -1) {
    return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0]
  }

  index += shouldGetNext ? 1 : -1

  if (isCycleAllowed) {
    index = (index + listLength) % listLength
  }

  return list[Math.max(0, Math.min(index, listLength - 1))]
}

type CountLabel = string | ((count: number, total: number) => string)

const resolveCountLabel = (label: CountLabel, count: number, total: number): string =>
  typeof label === 'function' ?
    label(count, total) :
    label.replace('{count}', String(count)).replace('{total}', String(total))

export type HostClasses = { classNames: string[], hadAttribute: boolean }

/**
 * Records which of the classes a component manages the element already had,
 * and whether it had a `class` attribute at all.
 *
 * @param element - The element the component decorates
 * @param managed - The class names the component may add or remove
 * @returns The snapshot to hand to `restoreHostClasses`
 */
const captureHostClasses = (element: HTMLElement, managed: string[]): HostClasses => ({
  classNames: managed.filter(className => element.classList.contains(className)),
  hadAttribute: element.hasAttribute('class')
})

/**
 * Sets every managed class back to the snapshot and drops a `class`
 * attribute that the element did not have and that is now empty.
 *
 * @param element - The element the component decorates
 * @param managed - The class names the component added or removed
 * @param host - The snapshot `captureHostClasses` took
 */
const restoreHostClasses = (element: HTMLElement, managed: string[], host: HostClasses): void => {
  for (const className of managed) {
    element.classList.toggle(className, host.classNames.includes(className))
  }

  if (!host.hadAttribute && element.classList.length === 0) {
    element.removeAttribute('class')
  }
}

/**
 * Sets whether the element carries a class, and keeps whether it carried it
 * before the component changed it the first time, so that `dispose()` can undo
 * the component's own change and leave a class the page set alone.
 *
 * @param element - The element the component decorates
 * @param className - The class to set
 * @param force - Whether the element should carry the class
 * @param original - What the previous call returned, `null` before the first one
 * @returns Whether the element carried the class before the component first
 *   changed it, or `null` while the component has not changed it
 */
const toggleHostClass = (element: HTMLElement, className: string, force: boolean, original: boolean | null): boolean | null => {
  if (element.classList.contains(className) === force) {
    return original
  }

  element.classList.toggle(className, force)

  return original ?? !force
}

export {
  captureHostClasses,
  type CountLabel,
  defineJQueryPlugin,
  execute,
  executeAfterTransition,
  findShadowRoot,
  getCoveredTransitions,
  getElement,
  getjQuery,
  getNextActiveElement,
  getTransitionDurationFromElement,
  getUID,
  isDisabled,
  isElement,
  isRTL,
  isVisible,
  jQueryDispatch,
  noop,
  onDOMContentLoaded,
  parseSelector,
  reflow,
  resolveCountLabel,
  restoreHostClasses,
  setAriaAttribute,
  toggleHostClass,
  triggerTransitionEnd,
  toType
}

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
type JQueryStatic = Record<string, any> & { fn: Record<string, any> }
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

const isRTL = (): boolean => document.documentElement.dir === 'rtl'

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

const execute = <T = any>(possibleCallback: T | ((...functionArgs: any[]) => T), args: any[] = [], defaultValue: T | ((...functionArgs: any[]) => T) = possibleCallback): T => {
  return typeof possibleCallback === 'function' ? (possibleCallback as (...functionArgs: any[]) => T).call(...args as [any, ...any[]]) : defaultValue as T
}

const executeAfterTransition = (callback: () => void, transitionElement: Element, waitForTransition = true): void => {
  if (!waitForTransition) {
    execute(callback)
    return
  }

  const durationPadding = 5
  const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding

  let called = false

  const handler = ({ target }: Event): void => {
    if (target !== transitionElement) {
      return
    }

    called = true
    transitionElement.removeEventListener(TRANSITION_END, handler)
    execute(callback)
  }

  transitionElement.addEventListener(TRANSITION_END, handler)
  setTimeout(() => {
    if (!called) {
      triggerTransitionEnd(transitionElement)
    }
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
const getNextActiveElement = <T>(list: T[], activeElement: T, shouldGetNext: boolean, isCycleAllowed: boolean): T => {
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

export {
  defineJQueryPlugin,
  execute,
  executeAfterTransition,
  findShadowRoot,
  getElement,
  getjQuery,
  getNextActiveElement,
  getTransitionDurationFromElement,
  getUID,
  isDisabled,
  isElement,
  isRTL,
  isVisible,
  noop,
  onDOMContentLoaded,
  parseSelector,
  reflow,
  triggerTransitionEnd,
  toType
}

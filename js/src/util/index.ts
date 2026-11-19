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
const TRANSITION_END = 'transitionend'

/**
 * Properly escapes ID selectors to handle special characters in IDs
 * (e.g. forward slashes, periods) so that they work with `document.querySelector`.
 *
 * @param selector - The selector to escape
 * @returns The escaped selector
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

/**
 * Sets an attribute to a value, or removes it for `null`, leaving the element untouched when the
 * attribute already holds that value.
 *
 * @param element - The element to write
 * @param name - The attribute name
 * @param value - The value, or `null` for no attribute
 */
const writeAttribute = (element: Element, name: string, value: string | null): void => {
  if (element.getAttribute(name) === value) {
    return
  }

  if (value === null) {
    element.removeAttribute(name)
  } else {
    element.setAttribute(name, value)
  }
}

/**
 * Splits an id reference list, such as the value of `aria-describedby`, into its ids.
 *
 * @param value - The attribute value
 * @returns The ids, without empty entries
 */
const splitIds = (value: string | null | undefined): string[] => (value ?? '').split(/\s+/).filter(Boolean)

/**
 * Joins id reference lists, such as values of `aria-describedby` and arrays of ids, into one list
 * in their order, without empty entries and without repeating an id.
 *
 * @param lists - Attribute values or arrays of ids; `null`, `undefined` and `false` are skipped
 * @returns The joined list, or an empty string when there is no id
 */
const joinIds = (...lists: Array<string | readonly string[] | false | null | undefined>): string =>
  [...new Set(lists.flatMap(list => splitIds(typeof list === 'string' ? list : (list || []).join(' '))))].join(' ')

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
 * Trick to restart an element's animation by forcing a reflow.
 *
 * @param element - The element whose animation should be restarted
 *
 * @see https://www.harrytheo.com/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
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
 * Return the previous/next element of a list.
 *
 * @param list - The list of elements to traverse
 * @param activeElement - The currently active element
 * @param shouldGetNext - Whether to return the next element (`true`) or the previous one (`false`)
 * @param isCycleAllowed - Whether to cycle back to the opposite end of the list when reaching the boundary
 * @returns The appropriate previous/next element from the list
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

export {
  defineJQueryPlugin,
  execute,
  findShadowRoot,
  getElement,
  getjQuery,
  getNextActiveElement,
  getUID,
  isDisabled,
  isElement,
  isRTL,
  isVisible,
  joinIds,
  jQueryDispatch,
  noop,
  onDOMContentLoaded,
  parseSelector,
  reflow,
  setAriaAttribute,
  splitIds,
  triggerTransitionEnd,
  toType,
  writeAttribute
}

export { executeAfterTransition, getCoveredTransitions, getTransitionDurationFromElement } from './transition.js'

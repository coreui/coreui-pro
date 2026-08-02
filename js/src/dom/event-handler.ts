/**
 * --------------------------------------------------------------------------
 * CoreUI dom/event-handler.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This is a modified version of the Bootstrap's dom/event-handler.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import { getjQuery } from '../util/index.js'

/**
 * Types
 */

type CoreUIEvent = Event & Record<string, any>

type EventCallable = (this: any, event: CoreUIEvent) => any

interface WrappedHandler {
  (this: Element, event: Event): any
  oneOff?: boolean
  uidEvent?: string | number
  callable?: EventCallable
  delegationSelector?: string | null
  handlerTypeEvent?: string
}

interface NormalizedParameters {
  isDelegated: boolean
  callable: EventCallable
  typeEvent: string
  handlerTypeEvent: string
}

type ElementEvents = Record<string, Record<string, WrappedHandler>>

/**
 * Constants
 */

const namespaceRegex = /[^.]*(?=\..*)\.|.*/
const stripNameRegex = /\..*/
const stripUidRegex = /::\d+$/
const eventRegistry: Record<string | number, ElementEvents> = {} // Events storage
let uidEvent = 1
const customEvents: Record<string, string> = {
  mouseenter: 'mouseover',
  mouseleave: 'mouseout'
}

const nativeEvents = new Set([
  'click',
  'dblclick',
  'mouseup',
  'mousedown',
  'contextmenu',
  'mousewheel',
  'DOMMouseScroll',
  'mouseover',
  'mouseout',
  'mousemove',
  'selectstart',
  'selectend',
  'keydown',
  'keypress',
  'keyup',
  'beforeinput',
  'copy',
  'cut',
  'paste',
  'orientationchange',
  'touchstart',
  'touchmove',
  'touchend',
  'touchcancel',
  'pointerdown',
  'pointermove',
  'pointerup',
  'pointerleave',
  'pointercancel',
  'gesturestart',
  'gesturechange',
  'gestureend',
  'focus',
  'blur',
  'change',
  'input',
  'reset',
  'select',
  'submit',
  'focusin',
  'focusout',
  'load',
  'unload',
  'beforeunload',
  'resize',
  'move',
  'DOMContentLoaded',
  'readystatechange',
  'error',
  'abort',
  'scroll'
])

/**
 * Private methods
 */

function makeEventUid(element: any, uid?: string): string | number {
  return (uid && `${uid}::${uidEvent++}`) || element.uidEvent || uidEvent++
}

function getElementEvents(element: Element & { uidEvent?: string | number }): ElementEvents {
  const uid = makeEventUid(element)

  element.uidEvent = uid
  eventRegistry[uid] = eventRegistry[uid] || {}

  return eventRegistry[uid]
}

// `mouseenter` and `mouseleave` ride on `mouseover` and `mouseout`, which also fire when
// the pointer moves between descendants of the listening element. Drop those events, so the
// handler only sees the pointer entering or leaving `delegateTarget` itself.
// `Node.contains()` is inclusive, so this also covers `relatedTarget === delegateTarget`.
function isMouseEventWithinTarget(event: CoreUIEvent): boolean {
  const { delegateTarget, relatedTarget } = event

  return Boolean(relatedTarget && delegateTarget.contains(relatedTarget))
}

function bootstrapHandler(element: Element, fn: EventCallable, handlerTypeEvent: string): WrappedHandler {
  const isCustomMouseEvent = handlerTypeEvent in customEvents

  return function handler(event: Event) {
    const coreuiEvent = hydrateObj(event, { delegateTarget: element })

    if (isCustomMouseEvent && isMouseEventWithinTarget(coreuiEvent)) {
      return
    }

    if ((handler as WrappedHandler).oneOff) {
      EventHandler.off(element, handlerTypeEvent, fn)
    }

    return fn.apply(element, [coreuiEvent])
  } as WrappedHandler
}

function bootstrapDelegationHandler(element: Element, selector: string, fn: EventCallable, handlerTypeEvent: string): WrappedHandler {
  const isCustomMouseEvent = handlerTypeEvent in customEvents

  return function handler(this: Element, event: Event) {
    const domElements = element.querySelectorAll(selector)

    for (let { target } = event; target && target !== this; target = (target as Node).parentNode) {
      for (const domElement of domElements) {
        if (domElement !== target) {
          continue
        }

        const coreuiEvent = hydrateObj(event, { delegateTarget: target })

        if (isCustomMouseEvent && isMouseEventWithinTarget(coreuiEvent)) {
          return
        }

        if ((handler as WrappedHandler).oneOff) {
          EventHandler.off(element, handlerTypeEvent, selector, fn)
        }

        return fn.apply(target, [coreuiEvent])
      }
    }
  } as WrappedHandler
}

function findHandler(events: Record<string, WrappedHandler>, callable: EventCallable, handlerTypeEvent: string, delegationSelector: string | null = null): WrappedHandler | undefined {
  return Object.values(events)
    .find(event => event.callable === callable && event.handlerTypeEvent === handlerTypeEvent && event.delegationSelector === delegationSelector)
}

// `typeEvent` is the DOM event type the listener is registered under. `handlerTypeEvent` is
// the type the caller asked for. The two differ only for `mouseenter` and `mouseleave`, which
// the registry must keep apart from the `mouseover` and `mouseout` listeners they share.
function normalizeParameters(originalTypeEvent: string, handler?: string | EventCallable, delegationFunction?: EventCallable): NormalizedParameters {
  const isDelegated = typeof handler === 'string'
  // TODO: tooltip passes `false` instead of selector, so we need to check
  const callable = (isDelegated ? delegationFunction : (handler || delegationFunction)) as EventCallable
  // Strip the namespace to get the plain event ('click.coreui.button' --> 'click')
  const baseTypeEvent = originalTypeEvent.replace(stripNameRegex, '')
  let typeEvent = customEvents[baseTypeEvent] || baseTypeEvent

  if (!nativeEvents.has(typeEvent)) {
    typeEvent = originalTypeEvent
  }

  const handlerTypeEvent = baseTypeEvent in customEvents ? baseTypeEvent : typeEvent

  return {
    isDelegated, callable, typeEvent, handlerTypeEvent
  }
}

function addHandler(element: Element, originalTypeEvent: string, handler?: string | EventCallable, delegationFunction?: EventCallable, oneOff?: boolean): void {
  if (typeof originalTypeEvent !== 'string' || !element) {
    return
  }

  const { isDelegated, callable, typeEvent, handlerTypeEvent } = normalizeParameters(originalTypeEvent, handler, delegationFunction)
  const events = getElementEvents(element)
  const handlers = events[typeEvent] || (events[typeEvent] = {})
  const previousFunction = findHandler(handlers, callable, handlerTypeEvent, isDelegated ? (handler as string) : null)

  if (previousFunction) {
    previousFunction.oneOff = previousFunction.oneOff && oneOff

    return
  }

  const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ''))
  const fn = isDelegated ?
    bootstrapDelegationHandler(element, handler as string, callable, handlerTypeEvent) :
    bootstrapHandler(element, callable, handlerTypeEvent)

  fn.delegationSelector = isDelegated ? (handler as string) : null
  fn.callable = callable
  fn.handlerTypeEvent = handlerTypeEvent
  fn.oneOff = oneOff
  fn.uidEvent = uid
  handlers[uid] = fn

  element.addEventListener(typeEvent, fn, isDelegated)
}

function removeHandler(element: Element, events: ElementEvents, typeEvent: string, handler: WrappedHandler): void {
  element.removeEventListener(typeEvent, handler, Boolean(handler.delegationSelector))
  delete events[typeEvent][handler.uidEvent!]
}

function removeNamespacedHandlers(element: Element, events: ElementEvents, typeEvent: string, namespace: string): void {
  const storeElementEvent = events[typeEvent] || {}

  for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
    if (handlerKey.includes(namespace)) {
      removeHandler(element, events, typeEvent, event)
    }
  }
}

function getTypeEvent(event: string): string {
  // allow to get the native events from namespaced events ('click.coreui.button' --> 'click')
  event = event.replace(stripNameRegex, '')
  return customEvents[event] || event
}

const EventHandler = {
  on(element: EventTarget | null, event: string, handler?: string | EventCallable, delegationFunction?: EventCallable): void {
    addHandler(element as Element, event, handler, delegationFunction, false)
  },

  one(element: EventTarget | null, event: string, handler?: string | EventCallable, delegationFunction?: EventCallable): void {
    addHandler(element as Element, event, handler, delegationFunction, true)
  },

  off(element: EventTarget | null, originalTypeEvent: string, handler?: string | EventCallable, delegationFunction?: EventCallable): void {
    if (typeof originalTypeEvent !== 'string' || !element) {
      return
    }

    const { isDelegated, callable, typeEvent, handlerTypeEvent } = normalizeParameters(originalTypeEvent, handler, delegationFunction)
    // The caller gave a namespace when neither event type matches what they passed in.
    // `handlerTypeEvent` must take part, or plain `mouseenter` looks namespaced next to `mouseover`.
    const inNamespace = typeEvent !== originalTypeEvent && handlerTypeEvent !== originalTypeEvent
    const events = getElementEvents(element as Element)
    const storeElementEvent = events[typeEvent] || {}
    const isNamespace = originalTypeEvent.startsWith('.')

    if (typeof callable !== 'undefined') {
      // Simplest case: handler is passed, remove that listener ONLY.
      if (!Object.keys(storeElementEvent).length) {
        return
      }

      const fn = findHandler(storeElementEvent, callable, handlerTypeEvent, isDelegated ? (handler as string) : null)

      if (fn) {
        removeHandler(element as Element, events, typeEvent, fn)
      }

      return
    }

    if (isNamespace) {
      for (const elementEvent of Object.keys(events)) {
        removeNamespacedHandlers(element as Element, events, elementEvent, originalTypeEvent.slice(1))
      }
    }

    for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
      const handlerKey = keyHandlers.replace(stripUidRegex, '')

      if (event.handlerTypeEvent === handlerTypeEvent && (!inNamespace || originalTypeEvent.includes(handlerKey))) {
        removeHandler(element as Element, events, typeEvent, event)
      }
    }
  },

  trigger(element: EventTarget | null, event: string, args?: Record<string, unknown>): CoreUIEvent | null {
    if (typeof event !== 'string' || !element) {
      return null
    }

    const $ = getjQuery()
    const typeEvent = getTypeEvent(event)
    const inNamespace = event !== typeEvent

    let jQueryEvent = null
    let bubbles = true
    let nativeDispatch = true
    let defaultPrevented = false

    if (inNamespace && $) {
      jQueryEvent = $.Event(event, args)

      $(element).trigger(jQueryEvent)
      bubbles = !jQueryEvent.isPropagationStopped()
      nativeDispatch = !jQueryEvent.isImmediatePropagationStopped()
      defaultPrevented = jQueryEvent.isDefaultPrevented()
    }

    const evt = hydrateObj(new Event(event, { bubbles, cancelable: true }), args)

    if (defaultPrevented) {
      evt.preventDefault()
    }

    if (nativeDispatch) {
      element.dispatchEvent(evt)
    }

    if (evt.defaultPrevented && jQueryEvent) {
      jQueryEvent.preventDefault()
    }

    return evt
  }
}

function hydrateObj<T extends object>(obj: T, meta: Record<string, unknown> = {}): T & Record<string, any> {
  for (const [key, value] of Object.entries(meta)) {
    try {
      (obj as Record<string, unknown>)[key] = value
    } catch {
      Object.defineProperty(obj, key, {
        configurable: true,
        get() {
          return value
        }
      })
    }
  }

  return obj
}

export default EventHandler
export type { CoreUIEvent, EventCallable }

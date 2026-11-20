/**
 * --------------------------------------------------------------------------
 * CoreUI util/hash-target.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This is a modified version of the Bootstrap's util/hash-target.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import EventHandler from '../dom/event-handler.js'
import { onDocumentReady } from './component-functions.js'

/**
 * Constants
 */

const ATTR_HASH = 'data-coreui-hash'

type HashTargetHandler = {
  /** Return true when this component should open the hashed element. */
  matches: (element: HTMLElement) => boolean
  /**
   * Optional visible anchor to scroll before opening (usually the trigger).
   * Closed collapses and inactive tab panes use `display: none`, so they cannot
   * be scrolled to until after they open.
   */
  getAnchor?: (element: HTMLElement) => HTMLElement | null
  /**
   * Open the target. Call `done` after the open animation finishes,
   * or immediately when the target is already open.
   */
  open: (element: HTMLElement, done: () => void) => void
}

/**
 * Decode a URL fragment id, tolerating malformed escapes (returns it as-is).
 *
 * @param value The fragment without the leading `#`.
 * @returns The decoded id, or `value` unchanged when it is not valid percent-encoding.
 */
const decodeFragment = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Resolve the element the URL fragment names.
 *
 * @returns The element whose `id` matches `location.hash`, otherwise `null`.
 */
const getFragmentTarget = (): HTMLElement | null => {
  const { hash } = window.location
  if (!hash || hash === '#') {
    return null
  }

  const id = decodeFragment(hash.slice(1))
  return id ? document.getElementById(id) : null
}

/**
 * Resolve the element named by `location.hash` when it opts in with `data-coreui-hash`.
 *
 * @returns The element whose `id` matches the fragment and carries `data-coreui-hash`, otherwise `null`.
 */
const getHashTarget = (): HTMLElement | null => {
  const element = getFragmentTarget()
  return element?.hasAttribute(ATTR_HASH) ? element : null
}

/**
 * Open an opted-in hash target on `load` and `hashchange`.
 * Put `data-coreui-hash` on the collapse or tab pane that the URL fragment names.
 *
 * Scrolls a visible anchor first when one exists, then opens the target, then
 * scrolls the target into view after it is shown. A focusable target takes focus
 * when, at the navigation, focus was on the page itself or on a link to this
 * fragment, and it has not moved to another element since. A target inside a hidden
 * ancestor is left alone.
 *
 * @param namespace Event namespace for the `load` and `hashchange` listeners.
 * @param handler How the component recognizes, anchors and opens its target.
 * @returns Nothing.
 */
const enableHashTarget = (namespace: string, handler: HashTargetHandler): void => {
  let generation = 0
  const onHash = (): void => {
    const current = ++generation
    const element = getHashTarget()
    if (!element?.parentElement?.checkVisibility({ visibilityProperty: true }) || !handler.matches(element)) {
      return
    }

    const { activeElement } = document
    const takeFocus = activeElement === document.body || (activeElement as HTMLAnchorElement | null)?.hash === window.location.hash

    const anchor = handler.getAnchor?.(element)
    if (anchor) {
      anchor.scrollIntoView()
    }

    handler.open(element, () => {
      if (current === generation && element.isConnected && getHashTarget() === element) {
        element.scrollIntoView()
        if (takeFocus && (document.activeElement === activeElement || document.activeElement === document.body)) {
          element.focus({ preventScroll: true })
        }
      }
    })
  }

  onDocumentReady(window, `load${namespace}`, onHash)
  EventHandler.on(window, `hashchange${namespace}`, onHash)
}

export {
  ATTR_HASH,
  decodeFragment,
  enableHashTarget,
  getFragmentTarget,
  getHashTarget
}
export type { HashTargetHandler }

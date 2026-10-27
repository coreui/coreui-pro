import { isDisabled, isVisible } from './index.js'

/**
 * Tells whether an element, or a node inside it, holds the focus of its document or shadow root.
 *
 * @param element - The element
 * @returns `true` when the focus is on the element or inside it
 */
export const containsFocus = (element: Element | null | undefined): boolean =>
  Boolean(element?.contains((element.getRootNode() as Document | ShadowRoot).activeElement))

/**
 * Tells whether the focus of an element's document or shadow root is inside the element, or on no
 * element at all (the body). A panel that closes in either state hands the focus back.
 *
 * @param element - The element, typically a panel about to close
 * @returns `true` when the focus is inside the element or on the body
 */
export const holdsFocusOrNone = (element: Element | null | undefined): boolean => {
  if (!element) {
    return false
  }

  const active = (element.getRootNode() as Document | ShadowRoot).activeElement ?? document.activeElement
  return !active || active === document.body || element.contains(active)
}

/**
 * Focuses an element only when it can take the focus: in the document, enabled and visible.
 *
 * @param element - The element to focus
 * @param options - Passed on to `focus()`, e.g. `{ preventScroll: true }`
 * @returns `true` when the focus is on the element or inside it afterwards
 */
export const focusIfUsable = (element: HTMLElement | null | undefined, options?: FocusOptions): boolean => {
  if (!element?.isConnected || isDisabled(element) || !isVisible(element)) {
    return false
  }

  element.focus(options)
  return containsFocus(element)
}

/**
 * Focuses an element that need not be focusable. One without a `tabindex` gets `tabindex="-1"`
 * for as long as it holds the focus, and loses it again when the focus leaves.
 *
 * @param element - The element to focus
 */
export const focusWithTemporaryTabindex = (element: HTMLElement): void => {
  if (element.hasAttribute('tabindex')) {
    element.focus()
    return
  }

  const release = () => {
    if ((element.getRootNode() as Document | ShadowRoot).activeElement !== element) {
      element.removeEventListener('blur', release)
      element.removeAttribute('tabindex')
    }
  }

  element.setAttribute('tabindex', '-1')
  element.addEventListener('blur', release)
  element.focus()
  release()
}

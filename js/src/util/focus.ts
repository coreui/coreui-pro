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
 * Returns the element holding the focus of a document or shadow root, followed into the open shadow
 * roots it hosts, so a focused button inside a web component is returned instead of its host.
 *
 * @param root - The document or shadow root to start from
 * @returns The deepest focused element, or `null`
 */
export const deepActiveElement = (root: Document | ShadowRoot): Element | null => {
  let active = root.activeElement

  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement
  }

  return active
}

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
 * @returns `true` when the element holds the focus afterwards, or when `focus()` moved the focus
 * inside it; an element that only already contained the focus does not count
 */
export const focusIfUsable = (element: HTMLElement | null | undefined, options?: FocusOptions): boolean => {
  if (!element?.isConnected || isDisabled(element) || !isVisible(element)) {
    return false
  }

  const root = element.getRootNode() as Document | ShadowRoot
  const before = root.activeElement
  element.focus(options)
  const { activeElement } = root

  return activeElement === element || (activeElement !== before && element.contains(activeElement))
}

/**
 * Focuses the first of several elements that can take the focus, trying them in order with
 * `focusIfUsable`.
 *
 * @param elements - The candidates in the order to try them; empty entries are skipped
 * @param options - Passed on to `focus()`, e.g. `{ preventScroll: true }`
 * @returns The first element that holds the focus afterwards or into which `focus()` moved it, or
 * `undefined` when none did
 */
export const focusFirstUsable = (elements: (HTMLElement | null | undefined)[], options?: FocusOptions): HTMLElement | undefined =>
  elements.find((element): element is HTMLElement => focusIfUsable(element, options))

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

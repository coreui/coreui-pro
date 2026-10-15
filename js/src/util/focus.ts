/**
 * Tells whether an element, or a node inside it, holds the focus of its document or shadow root.
 *
 * @param element - The element
 * @returns `true` when the focus is on the element or inside it
 */
export const containsFocus = (element: Element | null | undefined): boolean =>
  Boolean(element?.contains((element.getRootNode() as Document | ShadowRoot).activeElement))

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

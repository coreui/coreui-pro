import { splitIds } from './index.js'

export const SELECTOR_HIDDEN = '[hidden], [aria-hidden="true"]'

/**
 * Reads the text of an element as a screen reader would announce it: without the descendants
 * marked `hidden` or `aria-hidden="true"`, with white space collapsed.
 *
 * @param element - The element
 * @returns Its text, or an empty string when there is no element
 */
export const getText = (element: Element | null): string => {
  if (!element) {
    return ''
  }

  const clone = element.cloneNode(true) as Element

  for (const hidden of clone.querySelectorAll(SELECTOR_HIDDEN)) {
    hidden.remove()
  }

  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/**
 * Reads the accessible name of an element that takes its name from its content, such as a button:
 * the text of the elements its `aria-labelledby` lists in the document or shadow root that holds
 * it, else its `aria-label`, else its text, else its `title`. Only this subset of the accessible
 * name computation: names of descendants (`aria-label`, `alt`) and values of embedded controls are
 * not read.
 *
 * @param element - The element
 * @returns Its name, or an empty string when it has none
 */
export const getAccessibleName = (element: Element): string => {
  const root = element.getRootNode()
  const labelledBy = root instanceof Document || root instanceof ShadowRoot ?
    splitIds(element.getAttribute('aria-labelledby'))
      .map(id => getText(root.getElementById(id)))
      .filter(Boolean)
      .join(' ') :
    ''

  return labelledBy ||
    element.getAttribute('aria-label')?.trim() ||
    getText(element) ||
    element.getAttribute('title')?.trim() ||
    ''
}

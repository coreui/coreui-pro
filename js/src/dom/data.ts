/**
 * --------------------------------------------------------------------------
 * CoreUI dom/data.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This is a modified version of the Bootstrap's dom/data.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

/**
 * Constants
 */

const elementMap = new Map<Element, Map<string, unknown>>()

export default {
  set(element: Element, key: string, instance: unknown): void {
    if (!elementMap.has(element)) {
      elementMap.set(element, new Map())
    }

    const instanceMap = elementMap.get(element)!

    instanceMap.set(key, instance)
  },

  // Callers pass the result of getElement(), which can be null; Map.has(null)
  // is simply false at runtime, so the parameter is widened without adding a
  // guard that would change the emitted code.
  get(element: Element | null, key: string): any {
    if (elementMap.has(element as Element)) {
      return elementMap.get(element as Element)!.get(key) || null
    }

    return null
  },

  remove(element: Element, key: string): void {
    if (!elementMap.has(element)) {
      return
    }

    const instanceMap = elementMap.get(element)!

    instanceMap.delete(key)

    // free up element references if there are no instances left for an element
    if (instanceMap.size === 0) {
      elementMap.delete(element)
    }
  }
}

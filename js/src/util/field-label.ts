const SELECTOR_INTERACTIVE = 'a[href], button, input, select, textarea, [tabindex]'
const SELECTOR_LABEL = 'label, .form-label'

const fields = new Map<Element, () => void>()

/**
 * Finds the element a label names: the element its `for` points at, otherwise the first element
 * whose `aria-labelledby` lists the label's id, in the document or shadow root that holds the label.
 *
 * @param label - A `<label>` or `.form-label` element
 * @returns The named element, or `null` when the label names none
 */
export const getLabelledElement = (label: Element): Element | null => {
  const root = label.getRootNode() as ParentNode
  const forId = (label as HTMLLabelElement).htmlFor

  if (forId) {
    const target = [...root.querySelectorAll('[id]')].find(element => element.id === forId)

    if (target) {
      return target
    }
  }

  if (!label.id) {
    return null
  }

  return [...root.querySelectorAll('[aria-labelledby]')]
    .find(element => element.getAttribute('aria-labelledby')!.split(/\s+/).includes(label.id)) ?? null
}

/**
 * Finds the registered field that takes a click on the label of an element: the element itself
 * when it is registered, otherwise the first registered field inside it in document order.
 *
 * @param element - The element a label names
 * @returns The handler of that field, or `undefined` when there is none
 */
export const getFieldHandler = (element: Element): (() => void) | undefined => {
  const field = fields.has(element) ? element : [...element.querySelectorAll('*')].find(descendant => fields.has(descendant))

  return field && fields.get(field)
}

const handleClick = (event: MouseEvent): void => {
  const target = event.composedPath()[0]

  if (event.defaultPrevented || event.detail > 1 || !(target instanceof Element)) {
    return
  }

  const label = target.closest(SELECTOR_LABEL)

  if (!label || (label as HTMLLabelElement).control) {
    return
  }

  const interactive = target.closest(SELECTOR_INTERACTIVE)
  const selection = label.ownerDocument.getSelection()

  if ((interactive && interactive !== label && label.contains(interactive)) || (selection && !selection.isCollapsed && label.contains(selection.anchorNode))) {
    return
  }

  const element = getLabelledElement(label)

  if (element) {
    getFieldHandler(element)?.()
  }
}

/**
 * Registers a field that is not labelable, such as a group of sections or slots, so a click on a
 * `<label>` or `.form-label` that names it, or names an element it is the first field of, calls
 * the handler, as a click on the label of an input focuses the input. The label is resolved at
 * click time, through its `for` or an `aria-labelledby` listing its id. The click is left alone
 * when the page prevented it, when the browser already activates a control of the label, on
 * a double or triple click, while the label text is selected, and when it lands on a link, a form
 * control or an element with a `tabindex` inside the label.
 *
 * @param element - The field
 * @param handler - Called on a click on a label of the field
 * @returns A function that unregisters the field
 */
export const onLabelClick = (element: Element, handler: () => void): (() => void) => {
  const document = element.ownerDocument

  fields.set(element, handler)
  document.addEventListener('click', handleClick)

  return () => {
    if (fields.get(element) === handler) {
      fields.delete(element)
    }

    if (![...fields.keys()].some(field => field.ownerDocument === document)) {
      document.removeEventListener('click', handleClick)
    }
  }
}

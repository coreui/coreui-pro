/**
 * --------------------------------------------------------------------------
 * CoreUI util/legacy-markup.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import { getElement } from './index.js'

/**
 * Transitional v5 → v6 markup upgrade for Modal and Offcanvas, removed in v7.
 *
 * v5 shipped both components as <div> structures; v6 renders them on the
 * native <dialog> element. When a component is instantiated on legacy markup,
 * the markup is rebuilt in place: a <dialog> carrying the element's
 * attributes and (flattened) children is inserted INSIDE the original
 * element, which stays in the DOM as an inert `display: contents` shell.
 * Keeping the shell preserves consumer references to the old element —
 * bubbling `*.coreui.*` events still reach listeners bound to it, and
 * constructing a component with the old reference resolves to the inner
 * <dialog>. Only selectors targeting the removed wrapper layers
 * (`.modal-dialog`, `.modal-content`) cannot be preserved.
 */

const ATTRIBUTE_SHELL = 'data-coreui-legacy-shell'

// Dropped during migration: the native <dialog> provides the semantics, and
// the stateful classes are replaced by the [open] attribute.
const SKIPPED_ATTRIBUTES = new Set(['aria-hidden', 'aria-modal', 'class', 'role', 'style', 'tabindex'])
const SKIPPED_CLASSES = new Set(['fade', 'hiding', 'show', 'showing'])

// v5 wrapper classes → v6 dialog classes ('' drops the class)
const MODAL_WRAPPER_CLASS_MAP = new Map([
  ['modal-dialog', ''],
  ['modal-dialog-centered', ''],
  ['modal-dialog-scrollable', 'modal-scrollable']
])

// Responsive offcanvas variants (.offcanvas-md, …) replace the base class in
// v5 markup, so component detection must accept them too.
const RESPONSIVE_SUFFIXES = new Set(['sm', 'md', 'lg', 'xl', 'xxl'])

const matchesComponent = (element: Element, name: string): boolean =>
  element.classList.contains(name) ||
  [...element.classList].some(className => className.startsWith(`${name}-`) && RESPONSIVE_SUFFIXES.has(className.slice(name.length + 1)))

const migrateClasses = (dialog: HTMLDialogElement, element: Element): void => {
  for (const className of element.classList) {
    if (!SKIPPED_CLASSES.has(className)) {
      dialog.classList.add(className)
    }
  }
}

const migrate = (element: HTMLElement, name: string): HTMLDialogElement => {
  const dialog = document.createElement('dialog')

  for (const attribute of element.attributes) {
    if (!SKIPPED_ATTRIBUTES.has(attribute.name)) {
      dialog.setAttribute(attribute.name, attribute.value)
    }
  }

  migrateClasses(dialog, element)

  if (name === 'modal') {
    // v5 modals were animated only with .fade; v6 animates by default
    if (!element.classList.contains('fade')) {
      dialog.classList.add('modal-instant')
    }

    const wrapper = element.querySelector('.modal-dialog')
    if (wrapper) {
      for (const className of wrapper.classList) {
        const mapped = MODAL_WRAPPER_CLASS_MAP.get(className) ?? className
        if (mapped) {
          dialog.classList.add(mapped)
        }
      }
    }

    const content = element.querySelector('.modal-content') ?? wrapper ?? element
    dialog.append(...content.childNodes)
  } else {
    dialog.append(...element.childNodes)
  }

  while (element.attributes.length > 0) {
    element.removeAttribute(element.attributes[0].name)
  }

  element.setAttribute(ATTRIBUTE_SHELL, name)
  element.style.display = 'contents'
  element.replaceChildren(dialog)

  // eslint-disable-next-line no-console
  console.warn(
    `CoreUI ${name}: legacy v5 markup detected and upgraded to the native <dialog> structure at runtime. ` +
    'Update the markup to the v6 structure — this automatic migration will be removed in v7. ' +
    'See https://coreui.io/docs/migration/',
    element
  )

  return dialog
}

/**
 * Unwraps a previously migrated shell without touching anything else — safe
 * for lookups (getInstance) that must not mutate the DOM.
 */
const unwrapLegacyShell = (element: string | Element | null | undefined, name: string): Element | null => {
  const resolved = getElement(element)

  if (resolved && resolved.getAttribute(ATTRIBUTE_SHELL) === name) {
    return resolved.querySelector('dialog')
  }

  return resolved
}

/**
 * Resolves the element a dialog-based component should mount on. Returns the
 * element untouched when it is already a <dialog>; unwraps a previously
 * migrated shell; rebuilds legacy v5 markup.
 */
const resolveDialogElement = (element: string | Element | null | undefined, name: string): Element | null => {
  const resolved = getElement(element)

  if (!resolved || resolved instanceof HTMLDialogElement) {
    return resolved
  }

  if (resolved.getAttribute(ATTRIBUTE_SHELL) === name) {
    return resolved.querySelector('dialog')
  }

  if (resolved instanceof HTMLElement && matchesComponent(resolved, name)) {
    return migrate(resolved, name)
  }

  return resolved
}

export {
  resolveDialogElement,
  unwrapLegacyShell
}

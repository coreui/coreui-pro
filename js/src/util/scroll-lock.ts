/**
 * --------------------------------------------------------------------------
 * CoreUI util/scroll-lock.ts
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This is a modified version of the Bootstrap's util/scroll-lock.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import SelectorEngine from '../dom/selector-engine.js'

const CLASS_NAME_OPEN = 'dialog-open'
const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed'

const owners = new Set<HTMLElement>()
let restore: (() => void) | null = null

type StyleChange = {
  element: HTMLElement
  property: string
  value: string
  priority: string
  adjustedValue: string
}

/**
 * Reads the inline value of a style property and the value it gets after an offset.
 *
 * @param element The element whose property changes.
 * @param property The CSS property, a length.
 * @param offset Pixels added to the computed value.
 * @returns The inline value and priority to restore later, and the adjusted value.
 */
const getStyleChange = (element: HTMLElement, property: string, offset: number): StyleChange => {
  const value = Number.parseFloat(getComputedStyle(element).getPropertyValue(property)) || 0
  return {
    element,
    property,
    value: element.style.getPropertyValue(property),
    priority: element.style.getPropertyPriority(property),
    adjustedValue: `${value + offset}px`
  }
}

/**
 * Forgets owners that left the document or a dialog that closed, and undoes the lock when none is left.
 */
const releaseUnusedLock = (): void => {
  // A removed or natively closed dialog must not keep a later lock alive.
  for (const owner of owners) {
    if (!owner.isConnected || (owner instanceof HTMLDialogElement && !owner.open)) {
      owners.delete(owner)
    }
  }

  if (owners.size === 0 && restore) {
    restore()
    restore = null
  }
}

/**
 * Stops the page from scrolling while the owner is open. The first owner hides the root overflow,
 * adds `dialog-open` to the root and pads the root and full-width fixed elements by the scrollbar
 * width that disappears; later owners share that lock.
 *
 * @param owner The dialog, or any element, that holds the lock until `unlockScroll()`, until it
 * leaves the document or, for a dialog, until it closes.
 */
const lockScroll = (owner: HTMLElement): void => {
  releaseUnusedLock()
  if (owners.has(owner)) {
    return
  }

  owners.add(owner)
  if (owners.size > 1) {
    return
  }

  const root = document.documentElement
  const alreadyLocked = root.classList.contains(CLASS_NAME_OPEN)
  const initialWidth = root.offsetWidth
  const viewportWidth = root.clientWidth
  const initialLeft = root.getBoundingClientRect().left + root.clientLeft + window.scrollX
  const changes: StyleChange[] = []
  const fixed = SelectorEngine.find(SELECTOR_FIXED_CONTENT)
    .filter(element => !element.closest('dialog') && getComputedStyle(element).position === 'fixed' &&
      element.offsetWidth >= viewportWidth)
    .map(element => ({ element, width: element.offsetWidth }))

  root.classList.add(CLASS_NAME_OPEN)
  const overflow: StyleChange[] = ['overflow-x', 'overflow-y'].map(property => ({
    element: root,
    property,
    value: root.style.getPropertyValue(property),
    priority: root.style.getPropertyPriority(property),
    adjustedValue: 'hidden'
  }))

  for (const { property, adjustedValue } of overflow) {
    root.style.setProperty(property, adjustedValue, 'important')
  }

  // Use layout boxes: clientWidth can grow even when an application-owned
  // stable gutter still reserves space in the root's box.
  const width = Math.max(0, root.offsetWidth - initialWidth)
  const lockedLeft = root.getBoundingClientRect().left + root.clientLeft + window.scrollX
  // RTL scrollbars can be on either side, depending on the browser and OS.
  const side = initialLeft > lockedLeft ? 'left' : 'right'
  const fixedChanges = fixed.map(item => ({
    element: item.element,
    width: Math.max(0, item.element.offsetWidth - item.width)
  }))

  // Finish geometry reads before applying spacing to avoid repeated layouts.
  if (width > 0) {
    changes.push(getStyleChange(root, `padding-${side}`, width))
  }

  // Normal-flow and sticky content follow the root padding. Full-width fixed
  // content uses the viewport instead; compensate only its actual expansion.
  for (const item of fixedChanges) {
    if (item.width > 0) {
      changes.push(getStyleChange(item.element, `margin-${side}`, item.width))
    }
  }

  for (const { element, property, adjustedValue } of changes) {
    element.style.setProperty(property, adjustedValue, 'important')
  }

  restore = () => {
    for (const { element, property, value, priority } of [...changes, ...overflow]) {
      if (value) {
        element.style.setProperty(property, value, priority)
      } else {
        element.style.removeProperty(property)
      }
    }

    if (!alreadyLocked) {
      root.classList.remove(CLASS_NAME_OPEN)
    }
  }
}

/**
 * Gives up the owner's share of the page scroll lock and restores the page when it was the last one.
 *
 * @param owner The element passed to `lockScroll()`.
 */
const unlockScroll = (owner: HTMLElement): void => {
  owners.delete(owner)
  releaseUnusedLock()
}

export { lockScroll, unlockScroll }

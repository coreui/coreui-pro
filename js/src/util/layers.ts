import { pressPathOf, trackPress } from './press.js'

export type LayerReason = 'escape' | 'outside' | 'parent' | 'sibling'

export interface LayerEntry {
  anchor: () => Element | null | undefined
  closesOn: (reason: LayerReason, event?: Event) => boolean
  dismiss: (reason: LayerReason, event: Event | undefined, options: { returnFocus: boolean }) => void
  isOpen: () => boolean
  kind: 'dialog' | 'popup'
  parts: () => Array<Element | null | undefined>
}

interface LayerRecord {
  closing: boolean
  doc: Document
  entry: LayerEntry
  parent: LayerRecord | null
}

interface ClickSnapshot {
  hits: Map<LayerRecord, boolean>
  stack: LayerRecord[]
}

interface LayerState {
  listening: WeakSet<Window>
  requested: Set<LayerRecord>
  snapshots: WeakMap<Event, ClickSnapshot>
  stack: LayerRecord[]
}

const STATE_KEY = Symbol.for('coreui.layers')

/**
 * Returns the engine state shared by every copy of this module on the page.
 *
 * @returns The shared state
 */
const getState = (): LayerState => {
  const scope = globalThis as unknown as Record<symbol, LayerState | undefined>
  scope[STATE_KEY] ??= {
    listening: new WeakSet(),
    requested: new Set(),
    snapshots: new WeakMap(),
    stack: []
  }

  return scope[STATE_KEY]
}

/**
 * Tells whether a node lies inside a container, crossing shadow roots through their hosts.
 *
 * @param container - The possible ancestor
 * @param node - The node
 * @returns `true` when the node is the container or lies inside it
 */
const containsAcross = (container: Element, node: Node | null | undefined): boolean => {
  let current = node ?? null

  while (current) {
    if (current === container) {
      return true
    }

    current = current.parentNode ?? (current as ShadowRoot).host ?? null
  }

  return false
}

/**
 * Returns the focused element of a document, looking into open shadow roots.
 *
 * @param doc - The document
 * @returns The deepest focused element, or `null`
 */
const deepActiveElement = (doc: Document): Element | null => {
  let active = doc.activeElement

  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement
  }

  return active
}

/**
 * Tells whether a node lies inside any of a layer's parts.
 *
 * @param record - The layer
 * @param node - The node
 * @returns `true` when one of the parts contains the node
 */
const inParts = (record: LayerRecord, node: Node | null | undefined): boolean =>
  record.entry.parts().some(part => part && containsAcross(part, node))

/**
 * Tells whether a layer is an ancestor of another one.
 *
 * @param ancestor - The possible ancestor
 * @param record - The layer
 * @returns `true` when the parent chain of the layer reaches the ancestor
 */
const isAncestor = (ancestor: LayerRecord, record: LayerRecord): boolean => {
  for (let current = record.parent; current; current = current.parent) {
    if (current === ancestor) {
      return true
    }
  }

  return false
}

/**
 * Lists the descendants of a layer in a stack, deepest first.
 *
 * @param record - The layer
 * @param stack - The stack to look in
 * @returns The descendants, children after their own descendants
 */
const descendantsOf = (record: LayerRecord, stack: LayerRecord[]): LayerRecord[] =>
  stack.filter(other => isAncestor(record, other)).toReversed()

/**
 * Sends a layer a close request once per task, so one user action never asks a layer twice.
 *
 * @param record - The layer
 * @param reason - Why it should close
 * @param event - The event behind the request
 * @param returnFocus - Whether the layer hands the focus back
 */
const request = (record: LayerRecord, reason: LayerReason, event: Event | undefined, returnFocus: boolean): void => {
  const { requested } = getState()

  if (requested.has(record) || record.closing || !record.entry.isOpen() || !record.entry.closesOn(reason, event)) {
    return
  }

  if (requested.size === 0) {
    setTimeout(() => requested.clear())
  }

  requested.add(record)
  record.entry.dismiss(reason, event, { returnFocus })
}

/**
 * Finds the record of an entry on the stack.
 *
 * @param entry - The layer entry
 * @returns The record, or `undefined` when the layer is not registered
 */
const recordOf = (entry: LayerEntry): LayerRecord | undefined =>
  getState().stack.find(record => record.entry === entry)

/**
 * Tells whether a click or its press touched a layer or one of its descendants in a snapshot.
 *
 * @param record - The layer
 * @param snapshot - The snapshot of the click
 * @param pressPath - The path of the press that produced the click
 * @param withSelf - Whether the layer's own parts count
 * @returns `true` when the click is inside
 */
const touched = (record: LayerRecord, snapshot: ClickSnapshot, pressPath: EventTarget[] | null, withSelf: boolean): boolean =>
  snapshot.stack.some(other =>
    (withSelf ? other === record || isAncestor(record, other) : isAncestor(record, other)) &&
    (snapshot.hits.get(other) || pressPath?.some(node => inParts(other, node as Node)))
  )

/**
 * Takes the snapshot of a click before any handler of the document runs.
 *
 * @param event - The click
 */
const snapshotClick = (event: Event): void => {
  const { snapshots, stack } = getState()
  const doc = (event.target as Node | null)?.ownerDocument ?? document
  const path = event.composedPath()
  const layers = stack.filter(record => record.doc === doc)
  const hits = new Map<LayerRecord, boolean>()

  for (const record of layers) {
    hits.set(record, path.some(node => inParts(record, node as Node)))
  }

  snapshots.set(event, { hits, stack: layers })
}

/**
 * Asks every layer a click landed outside of to close, from the top, on the snapshot of the click.
 *
 * @param event - The click
 */
const decideClick = (event: Event): void => {
  const snapshot = getState().snapshots.get(event)

  if (!snapshot) {
    return
  }

  const pressPath = pressPathOf(event)

  for (const record of snapshot.stack.toReversed()) {
    if (!touched(record, snapshot, pressPath, true)) {
      request(record, 'outside', event, false)
    }
  }
}

/**
 * Sends an Escape that nobody handled, while the focus is on no element, to the top layer.
 *
 * @param event - The keydown
 */
const fallbackEscape = (event: KeyboardEvent): void => {
  if (event.key !== 'Escape' || event.defaultPrevented) {
    return
  }

  const doc = (event.target as Node | null)?.ownerDocument ?? document
  const active = doc.activeElement

  if (active && active !== doc.body) {
    return
  }

  const top = getState().stack.findLast(record => record.doc === doc)

  if (!top || top.entry.kind === 'dialog' || !top.entry.closesOn('escape', event)) {
    return
  }

  event.preventDefault()
  request(top, 'escape', event, true)
}

/**
 * Attaches the engine's listeners to a window once; they stay for the page.
 *
 * @param doc - The document a layer opened in
 */
const listen = (doc: Document): void => {
  const view = doc.defaultView
  const { listening } = getState()

  if (!view || listening.has(view)) {
    return
  }

  listening.add(view)
  trackPress()
  view.addEventListener('click', snapshotClick, true)
  view.addEventListener('click', decideClick)
  view.addEventListener('keydown', fallbackEscape)
}

/**
 * Puts an open layer on the stack. Its parent is the deepest open layer whose parts hold its
 * anchor; open layers anchored in its own parts become its children. Every other open layer that
 * accepts it is asked to close as a sibling. Registering a layer twice changes nothing.
 *
 * @param entry - The layer
 */
export const registerLayer = (entry: LayerEntry): void => {
  const { stack } = getState()

  if (recordOf(entry)) {
    return
  }

  const anchor = entry.anchor()
  const doc = anchor?.ownerDocument ?? entry.parts().find(Boolean)?.ownerDocument ?? document
  const candidates = stack.filter(record => record.doc === doc && inParts(record, anchor))
  const parent = candidates.find(record => candidates.every(other => other === record || !inParts(record, other.entry.parts().find(Boolean)))) ?? null
  const record: LayerRecord = {
    closing: false, doc, entry, parent
  }

  for (const other of stack) {
    if (other.doc === doc && (!other.parent || isAncestor(other.parent, record)) && inParts(record, other.entry.anchor())) {
      other.parent = record
    }
  }

  const siblings = stack.filter(other => other.doc === doc && !isAncestor(other, record) && !isAncestor(record, other))
  stack.push(record)
  listen(doc)

  for (const other of siblings) {
    request(other, 'sibling', undefined, false)
  }
}

/**
 * Takes a layer off the stack at the start of its closing. Its descendants are asked to close
 * first, deepest first and without taking the focus; a descendant that stays open moves to the
 * layer's parent. The layer hands the focus back when the focus was in it, in a descendant or on
 * no element, unless it closes because of an outside click, a sibling or its parent.
 *
 * @param entry - The layer
 * @param reason - Why it closes; none for a close from code or a choice in the layer
 * @returns Whether the layer hands the focus back
 */
export const unregisterLayer = (entry: LayerEntry, reason?: LayerReason): { returnFocus: boolean } => {
  const { stack } = getState()
  const record = recordOf(entry)

  if (!record) {
    return { returnFocus: false }
  }

  record.closing = true
  const descendants = descendantsOf(record, stack)
  const active = deepActiveElement(record.doc)
  const focusInside = !active || active === record.doc.body ||
    [record, ...descendants].some(layer => inParts(layer, active))

  for (const descendant of descendants) {
    request(descendant, 'parent', undefined, false)
  }

  stack.splice(stack.indexOf(record), 1)

  for (const other of stack) {
    if (other.parent === record) {
      other.parent = record.parent
    }
  }

  return { returnFocus: focusInside && reason !== 'outside' && reason !== 'sibling' && reason !== 'parent' }
}

/**
 * Handles Escape on a layer's parts and anchor. An Escape that something inside already handled
 * passes; one that ends an IME composition, repeats, or comes from an open native select closes
 * nothing and goes no further; any other closes the layer when it accepts Escape, and goes no
 * further even when the layer refuses.
 *
 * @param event - The keydown
 * @param entry - The layer the listener belongs to
 */
export const handleEscape = (event: KeyboardEvent, entry: LayerEntry): void => {
  const record = recordOf(entry)

  if (event.key !== 'Escape' || event.defaultPrevented || !record || !entry.isOpen()) {
    return
  }

  event.stopPropagation()

  if (event.repeat) {
    event.preventDefault()
    return
  }

  // eslint-disable-next-line unicorn/prefer-keyboard-event-key -- Safari reports an IME composition only as keyCode 229
  if (event.isComposing || event.keyCode === 229) {
    return
  }

  event.preventDefault()
  request(record, 'escape', event, true)
}

/**
 * Tells whether an event landed in the parts of one of a layer's descendants: the descendants as
 * they were when a click began, and the ones open now (a child the click itself opened, a key event
 * that has no snapshot). A component asks this before it treats a click or a focus move as one
 * inside its own panel.
 *
 * @param event - The click or key event
 * @param entry - The layer
 * @returns `true` when the event or its press touched a descendant
 */
export const isInDescendantParts = (event: Event, entry: LayerEntry): boolean => {
  const { snapshots, stack } = getState()
  const snapshot = snapshots.get(event)
  const snapped = snapshot?.stack.find(layer => layer.entry === entry)
  const record = recordOf(entry)
  const path = event.composedPath()

  return Boolean(snapshot && snapped && touched(snapped, snapshot, pressPathOf(event), false)) ||
    Boolean(record && descendantsOf(record, stack).some(descendant => path.some(node => inParts(descendant, node as Node))))
}

/**
 * Asks every open layer anchored inside an element to close as if its parent closed. A part of a
 * component that is not a layer itself (a submenu) calls this when it hides.
 *
 * @param container - The element that hides
 */
export const closeLayersIn = (container: Element): void => {
  for (const record of getState().stack.toReversed()) {
    if (containsAcross(container, record.entry.anchor())) {
      request(record, 'parent', undefined, false)
    }
  }
}

/**
 * Returns the parent of a registered layer.
 *
 * @param entry - The layer
 * @returns The parent's entry, or `null` for a root layer or one that is not registered
 */
export const getParentLayer = (entry: LayerEntry): LayerEntry | null =>
  recordOf(entry)?.parent?.entry ?? null

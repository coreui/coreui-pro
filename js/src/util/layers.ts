import { deepActiveElement } from './focus.js'
import { pressPathOf, trackPress } from './press.js'

export type LayerReason = 'escape' | 'outside' | 'parent' | 'sibling'

export interface LayerEntry {
  anchor: () => Element | null | undefined
  closesOn: (reason: LayerReason, event?: Event) => boolean
  closesSiblings?: () => boolean
  dismiss: (reason: LayerReason, event?: Event) => void
  escapeAnywhere?: () => boolean
  focusTarget?: () => Element | null | undefined
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
  closed: LayerRecord[]
  dialogs: WeakSet<Element>
  listening: WeakSet<Window>
  pressed: LayerRecord[] | null
  requested: Map<LayerRecord, LayerReason>
  snapshots: WeakMap<Event, ClickSnapshot>
  stack: LayerRecord[]
}

/**
 * Tells whether a key press belongs to an input method composition, so it ends the composition
 * rather than acting on the page. Safari reports such a press only as `keyCode` 229.
 *
 * @param event - The keydown
 * @returns `true` when the press is part of a composition
 */
// eslint-disable-next-line unicorn/prefer-keyboard-event-key -- Safari reports an IME composition only as keyCode 229
export const isComposingKey = (event: KeyboardEvent): boolean => event.isComposing || event.keyCode === 229

const STATE_KEY = Symbol.for('coreui.layers')

/**
 * Returns the engine state shared by every copy of this module on the page.
 *
 * @returns The shared state
 */
const getState = (): LayerState => {
  const scope = globalThis as unknown as Record<symbol, LayerState | undefined>
  scope[STATE_KEY] ??= {
    closed: [],
    dialogs: new WeakSet(),
    listening: new WeakSet(),
    pressed: null,
    requested: new Map(),
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
 * Tells whether a node lies inside any of a layer's parts.
 *
 * @param record - The layer
 * @param node - The node
 * @returns `true` when one of the parts contains the node
 */
const inParts = (record: LayerRecord, node: Node | null | undefined): boolean =>
  record.entry.parts().some(part => part && containsAcross(part, node))

/**
 * Tells whether a node lies inside a layer's panel, that is its parts other than the anchor itself;
 * a layer is the parent of the layers anchored in its panel, never of those sharing its anchor.
 *
 * @param record - The layer
 * @param node - The node
 * @returns `true` when one of the parts other than the anchor contains the node
 */
const inPanel = (record: LayerRecord, node: Node | null | undefined): boolean => {
  const anchor = record.entry.anchor()
  return record.entry.parts().some(part => part && part !== anchor && containsAcross(part, node))
}

/**
 * Tells whether a layer is a tip: a tooltip or popover that Escape reaches from anywhere.
 *
 * @param record - The layer
 * @returns `true` for a tip
 */
const isTip = (record: LayerRecord): boolean => record.entry.escapeAnywhere?.() === true

/**
 * Walks up from a layer past the tips, which leave the focus to the layer they open from.
 *
 * @param record - The layer
 * @returns The layer itself, or its nearest ancestor that is not a tip
 */
const throughTips = (record: LayerRecord | null | undefined): LayerRecord | null => {
  let current = record ?? null

  while (current && isTip(current)) {
    current = current.parent
  }

  return current
}

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
 * Makes the engine forget, when the current task ends, the requests sent and the layers closed in it.
 *
 * @param state - The engine state, before anything is added for this task
 */
const forgetAtTaskEnd = (state: LayerState): void => {
  if (state.requested.size > 0 || state.closed.length > 0) {
    return
  }

  setTimeout(() => {
    state.requested.clear()
    state.closed.length = 0
  })
}

/**
 * Sends a layer a close request once per task, so one user action never asks a layer twice.
 *
 * @param record - The layer
 * @param reason - Why it should close
 * @param event - The event behind the request
 */
const request = (record: LayerRecord, reason: LayerReason, event?: Event): void => {
  const state = getState()

  if (state.requested.has(record) || record.closing || !record.entry.isOpen() || !record.entry.closesOn(reason, event)) {
    return
  }

  forgetAtTaskEnd(state)
  state.requested.set(record, reason)
  record.entry.dismiss(reason, event)
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
  const { pressed, snapshots } = getState()
  const snapshot = snapshots.get(event)

  if (!snapshot) {
    return
  }

  const pressPath = pressPathOf(event)

  for (const record of snapshot.stack.toReversed()) {
    if (pressPath && pressed && !pressed.includes(record)) {
      continue
    }

    if (!touched(record, snapshot, pressPath, true)) {
      request(record, 'outside', event)
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

  const state = getState()
  prune(state)
  const top = state.stack.findLast(record => record.doc === doc)

  if (!top || top.entry.kind === 'dialog' || !top.entry.closesOn('escape', event)) {
    return
  }

  event.preventDefault()
  request(top, 'escape', event)
}

/**
 * Sends an Escape to the top open tip before any element handles it, when the tip sits above every
 * layer that holds the focus (or the focus is on its trigger), so it closes alone. With the focus on
 * no element the tip has to be the top layer. An Escape inside the tip itself, from an open modal
 * dialog the tip is not in, already handled, ending an IME composition or repeating is left alone.
 *
 * @param event - The keydown
 */
const routeEscape = (event: KeyboardEvent): void => {
  if (event.key !== 'Escape' || event.defaultPrevented || event.repeat || isComposingKey(event)) {
    return
  }

  const doc = (event.target as Node | null)?.ownerDocument ?? document
  const state = getState()
  prune(state)
  const stack = state.stack.filter(record => record.doc === doc)
  const dialog = (event.composedPath()[0] as Element | undefined)?.closest?.('dialog[open]')
  const modal = dialog?.matches(':modal') ? dialog : null
  const tip = stack.findLast(record => isTip(record) && record.entry.isOpen() &&
    (!modal || record.entry.parts().some(part => part && containsAcross(modal, part))))

  if (!tip) {
    return
  }

  const active = deepActiveElement(doc)
  const anchor = tip.entry.anchor()
  const onTrigger = Boolean(anchor && containsAcross(anchor, active))
  const focused = stack.findLastIndex(record => inParts(record, active))
  const nowhere = !active || active === doc.body

  if (inParts(tip, active) || (nowhere ? stack.at(-1) !== tip : !onTrigger && stack.indexOf(tip) < focused)) {
    return
  }

  event.stopPropagation()
  event.preventDefault()
  request(tip, 'escape', event)
}

/**
 * Takes off the stack the layers whose rendered parts have all left the document, as when a page
 * removes an open component without disposing of it; a part that is not rendered does not count.
 * Their children move to their parents.
 *
 * @param state - The engine state
 */
const prune = ({ stack }: LayerState): void => {
  const removed = stack.filter(record => {
    const parts = record.entry.parts().filter(Boolean) as Element[]
    return parts.length > 0 && parts.every(part => !part.isConnected)
  })

  for (const record of removed) {
    stack.splice(stack.indexOf(record), 1)

    for (const other of stack) {
      if (other.parent === record) {
        other.parent = record.parent
      }
    }
  }
}

/**
 * Attaches the engine's listeners to a window once; they stay for the page. A press remembers the
 * layers open when it began; before the first press seen, none count as open, since the layer
 * that starts the listening may be opening during a press. A `<dialog>` that closes without being
 * a layer asks the layers anchored in it to close as if their parent closed.
 *
 * @param doc - The document a layer opened in
 */
const listen = (doc: Document): void => {
  const view = doc.defaultView
  const state = getState()

  if (!view || state.listening.has(view)) {
    return
  }

  state.listening.add(view)
  state.pressed = []
  view.addEventListener('pointerdown', event => {
    state.pressed = event.button === 0 ? [...state.stack] : null
  }, true)
  view.addEventListener('click', snapshotClick, true)
  view.addEventListener('click', decideClick)
  view.addEventListener('keydown', routeEscape, true)
  view.addEventListener('keydown', fallbackEscape)
  view.addEventListener('close', event => {
    if (event.target instanceof Element && !(event.target as HTMLDialogElement).open && !state.dialogs.has(event.target)) {
      closeLayersIn(event.target)
    }
  }, true)
}

/**
 * Finds the parent of a layer anchored at an element: the deepest open layer of the document whose
 * parts other than its own anchor hold that anchor.
 *
 * @param stack - The open layers
 * @param doc - The document of the anchor
 * @param anchor - The anchor of the layer
 * @param self - The layer itself, never its own parent
 * @returns The parent, or `null` for a top-level layer
 */
const parentOf = (stack: LayerRecord[], doc: Document, anchor: Element | null | undefined, self?: LayerRecord): LayerRecord | null => {
  const candidates = stack.filter(record => record !== self && record.doc === doc && inPanel(record, anchor))
  return candidates.find(record => candidates.every(other => other === record || !inParts(record, other.entry.parts().find(Boolean)))) ?? null
}

/**
 * Puts an open layer on the stack. Its parent is the deepest open layer whose parts other than its
 * own anchor hold the new layer's anchor; open layers anchored in the new layer's parts other than
 * its anchor become its children, unless that would make a cycle. Every other open layer that
 * accepts it is asked to close as a sibling, unless the layer's `closesSiblings()` says `false`, as
 * a dialog that leaves the page interactive does. Registering a layer twice changes nothing.
 *
 * @param entry - The layer
 */
export const registerLayer = (entry: LayerEntry): void => {
  const state = getState()
  const { stack } = state
  prune(state)

  if (recordOf(entry)) {
    return
  }

  const anchor = entry.anchor()
  const doc = anchor?.ownerDocument ?? entry.parts().find(Boolean)?.ownerDocument ?? document
  trackPress(doc)
  const parent = parentOf(stack, doc, anchor)
  const record: LayerRecord = {
    closing: false, doc, entry, parent
  }

  for (const other of stack) {
    if (other.doc === doc && other !== parent && !isAncestor(other, record) && (!other.parent || isAncestor(other.parent, record)) && inPanel(record, other.entry.anchor())) {
      other.parent = record
    }
  }

  const siblings = entry.closesSiblings?.() === false ? [] : stack.filter(other => other.doc === doc && !isAncestor(other, record) && !isAncestor(record, other))
  stack.push(record)
  listen(doc)

  if (entry.kind === 'dialog') {
    for (const part of entry.parts()) {
      if (part) {
        state.dialogs.add(part)
      }
    }
  }

  for (const other of siblings) {
    request(other, 'sibling')
  }
}

/**
 * Follows an open layer whose anchor changed, as a tooltip that moves to another anchor: its parent
 * is found again for the new anchor and it moves to the top of the stack, above that parent. A layer
 * that is not open changes nothing.
 *
 * @param entry - The layer
 */
export const reanchorLayer = (entry: LayerEntry): void => {
  const { stack } = getState()
  const record = recordOf(entry)

  if (!record) {
    return
  }

  record.parent = parentOf(stack, record.doc, entry.anchor(), record)
  stack.splice(stack.indexOf(record), 1)
  stack.push(record)
}

/**
 * Takes a layer off the stack at the start of its closing. Its descendants are asked to close
 * first, deepest first and without taking the focus; a descendant that stays open moves to the
 * layer's parent. The layer hands the focus back when the focus was in it or in a descendant, also
 * one that closed earlier in the same task, or on no element unless a sibling closes it; never when
 * an outside click or its parent closes it.
 *
 * @param entry - The layer
 * @param reason - Why it closes; when left out, the reason the engine asked the layer to close with
 *   in this task, otherwise none (a close from code or a choice in the layer)
 * @returns `focusInside`: whether the focus was in the layer or a descendant (never for an outside
 *   click or a parent close); `returnFocus`: whether the layer hands the focus back
 */
export const unregisterLayer = (entry: LayerEntry, reason?: LayerReason): { focusInside: boolean, returnFocus: boolean } => {
  const state = getState()
  const { closed, stack } = state
  const record = recordOf(entry)

  if (!record) {
    return { focusInside: false, returnFocus: false }
  }

  const why = reason ?? state.requested.get(record)
  record.closing = true
  const descendants = descendantsOf(record, stack)
  const closedBelow = closed.filter(other => isAncestor(record, other))
  const active = deepActiveElement(record.doc)
  const focusInParts = [record, ...descendants, ...closedBelow].some(layer => inParts(layer, active))
  const focusNowhere = !active || active === record.doc.body

  for (const descendant of descendants) {
    request(descendant, 'parent')
  }

  stack.splice(stack.indexOf(record), 1)
  forgetAtTaskEnd(state)
  closed.push(record)

  for (const other of stack) {
    if (other.parent === record) {
      other.parent = record.parent
    }
  }

  if (why === 'outside' || why === 'parent') {
    return { focusInside: false, returnFocus: false }
  }

  return { focusInside: focusInParts, returnFocus: focusInParts || (why !== 'sibling' && focusNowhere) }
}

/**
 * Handles Escape on a layer's parts and anchor. An Escape that something inside already handled,
 * or that comes from an open dialog the layer does not sit in, passes; one that ends an IME
 * composition, repeats, or comes from an open native select closes nothing and goes no further; any
 * other closes the layer when it accepts Escape, and goes no further even when the layer refuses.
 *
 * @param event - The keydown
 * @param entry - The layer the listener belongs to
 * @returns `true` when the Escape stops here, so a framework can stop its own propagation too
 */
export const handleEscape = (event: KeyboardEvent, entry: LayerEntry): boolean => {
  const record = recordOf(entry)
  const dialog = (event.composedPath()[0] as Element | undefined)?.closest?.('dialog[open]')

  if (event.key !== 'Escape' || event.defaultPrevented || !record || !entry.isOpen() ||
      (dialog && ![entry.anchor(), ...entry.parts()].some(node => node && dialog.contains(node)))) {
    return false
  }

  event.stopPropagation()

  if (isComposingKey(event)) {
    return true
  }

  event.preventDefault()

  if (!event.repeat) {
    request(record, 'escape', event)
  }

  return true
}

/**
 * Decides a click at once, for a component that stops its propagation before the document: every
 * layer the click landed outside of is asked to close, as when the click reaches the document.
 *
 * @param event - The click
 */
export const settleClick = (event: Event): void => {
  decideClick(event)
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
      request(record, 'parent')
    }
  }
}

/**
 * Returns the anchor of the deepest open layer that holds an element, so a panel can tell that the
 * focus moved into a layer opened from it. A layer that takes Escape from anywhere (a tooltip or
 * popover) passes the question to its nearest ancestor that does not.
 *
 * @param element - The element, typically the one that has the focus
 * @returns The anchor, or `null` when no open layer holds the element
 */
export const getLayerAnchorFor = (element: Element): Element | null =>
  throughTips(getState().stack.findLast(record => inParts(record, element)))?.entry.anchor() ?? null

/**
 * Returns where the focus goes back to for the deepest open layer that holds an element: the
 * layer's own `focusTarget()`, otherwise its anchor. A layer that takes Escape from anywhere (a
 * tooltip or popover) passes the question to its nearest ancestor that does not. A dialog opened from inside a layer that closes
 * on the way hands the focus there once it hides.
 *
 * @param element - The element, typically the trigger of a dialog
 * @returns The target, or `null` when no open layer holds the element
 */
export const getLayerFocusTargetFor = (element: Element): Element | null => {
  const entry = throughTips(getState().stack.findLast(record => inParts(record, element)))?.entry
  return (entry?.focusTarget?.() ?? entry?.anchor()) || null
}

export type AnnouncePriority = 'assertive' | 'polite'

export type AnnounceOptions = {
  context?: Element | null
  priority?: AnnouncePriority
  timeout?: number
}

type Moment = [time: number, clock: () => number]

type Message = {
  context: Element | null
  node: HTMLElement
  page: HTMLElement | null
  priority: AnnouncePriority
  timeout: number
}

const ATTRIBUTE = 'data-coreui-live-announcer'
const CLASS_NAME_HIDING = 'hiding'
const CLOSE_DELAY = 500
const FIRST_MESSAGE_DELAY = 100
const PRIORITIES: AnnouncePriority[] = ['assertive', 'polite']

const VISUALLY_HIDDEN: Partial<CSSStyleDeclaration> = {
  border: '0',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: '0',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px'
}

const holds = new WeakMap<Element, Moment>()
const readyAt = new WeakMap<Element, Moment>()
const pending: Message[] = []

/**
 * Tells whether an element is an open modal dialog: a native dialog opened with `showModal()`, or
 * a shown element with `aria-modal="true"`, such as a picker panel that traps focus.
 *
 * @param element - The element to check
 * @returns `true` when the rest of the page is inert or hidden behind the element
 */
const isModal = (element: Element): boolean => {
  if (element.matches('dialog[open]')) {
    return element.matches(':modal')
  }

  return element.matches('[aria-modal="true"]') && element.isConnected &&
    (typeof element.checkVisibility !== 'function' || element.checkVisibility())
}

/**
 * Finds the open modal dialog around an element, through the slots it is assigned to and the
 * shadow roots it sits in.
 *
 * @param element - The element to start from
 * @returns The closest open modal dialog, or `null` when there is none
 */
const getDialogAround = (element: Element | null): HTMLElement | null => {
  let node = element

  while (node) {
    if (isModal(node)) {
      return node as HTMLElement
    }

    node = node.assignedSlot ?? node.parentElement ?? ((node.getRootNode() as ShadowRoot).host ?? null)
  }

  return null
}

/**
 * Finds the modal dialog the rest of the page is inert behind: the one holding focus, then the
 * one around `context`, then the last one open in the document.
 *
 * @param context - The element the message comes from, if any
 * @returns The modal dialog to announce in, or `null` when none is open
 */
const getModal = (context: Element | null): HTMLElement | null => {
  let focused = document.activeElement

  while (focused?.shadowRoot?.activeElement) {
    focused = focused.shadowRoot.activeElement
  }

  const modals = [...document.querySelectorAll<HTMLElement>('dialog[open], [aria-modal="true"]')].filter(isModal)

  return getDialogAround(focused) ?? getDialogAround(context) ?? modals.at(-1) ?? null
}

/**
 * Reads a stored time when it was taken on the clock in use now. A time from another clock, such
 * as a test's fake timers, counts as long past.
 *
 * @param times - The ready times of regions or the holds of hosts
 * @param element - The element the time belongs to
 * @returns The time on the `performance.now()` clock, `0` when there is none
 */
const readTime = (times: WeakMap<Element, Moment>, element: Element): number => {
  const [time, clock] = times.get(element) ?? [0, null]

  return clock === performance.now ? time : 0
}

/**
 * Tells when new regions of a host can take a message: 100 ms from now, or later while a dialog
 * that closed less than 500 ms ago holds the host.
 *
 * @param host - `document.body` or an open modal dialog
 * @returns The ready time with the clock it was read from
 */
const getReadyTime = (host: HTMLElement): Moment =>
  [Math.max(performance.now() + FIRST_MESSAGE_DELAY, readTime(holds, host)), performance.now]

/**
 * Returns the live regions a host carries, creating them when it has none. Regions this copy of
 * the util has not seen yet count as new, and regions in a dialog leave with it when it closes.
 *
 * @param host - `document.body` or an open modal dialog
 * @returns The element holding the assertive and the polite region
 */
const getAnnouncer = (host: HTMLElement): HTMLElement => {
  const existing = host.querySelector<HTMLElement>(`:scope > [${ATTRIBUTE}]`)

  if (existing) {
    if (!readyAt.has(existing)) {
      readyAt.set(existing, getReadyTime(host))
    }

    return existing
  }

  const announcer = document.createElement('div')
  announcer.setAttribute(ATTRIBUTE, '')
  Object.assign(announcer.style, VISUALLY_HIDDEN)

  for (const priority of PRIORITIES) {
    const region = document.createElement('div')
    region.setAttribute('role', 'log')
    region.setAttribute('aria-live', priority)
    region.setAttribute('aria-relevant', 'additions')
    announcer.append(region)
  }

  if (host === document.body) {
    host.prepend(announcer)
  } else {
    const onClose = (event: Event): void => {
      if (event.target === host && !(host as HTMLDialogElement).open) {
        announcer.remove()
        host.removeEventListener('close', onClose)
      }
    }

    host.append(announcer)
    host.addEventListener('close', onClose)
  }

  readyAt.set(announcer, getReadyTime(host))

  return announcer
}

/**
 * Holds the host that takes over when a dialog closes for 500 ms: focus moves back to the page
 * then, and a screen reader following it drops a message added at that moment. The observer
 * reports the close before a queued insertion runs.
 *
 * @param records - The changes of the `open` attribute
 */
const holdAfterClose = (records: MutationRecord[]): void => {
  if (!records.some(record => record.target.nodeName === 'DIALOG' && !(record.target as HTMLDialogElement).open)) {
    return
  }

  const host = getModal(null) ?? document.body
  const until = performance.now() + CLOSE_DELAY
  const announcer = host.querySelector(`:scope > [${ATTRIBUTE}]`)
  holds.set(host, [until, performance.now])

  if (announcer && readyAt.has(announcer)) {
    readyAt.set(announcer, [Math.max(readTime(readyAt, announcer), until), performance.now])
  }

  if (pending.length > 0) {
    setTimeout(flush, CLOSE_DELAY)
  }
}

/**
 * Adds the waiting messages to their regions in the order they came in. Each goes to the page or
 * to the modal dialog open at that moment. The queue holds while that dialog, or the dialog holding
 * focus, plays its closing transition, for 500 ms after a dialog closes, and while a region is
 * younger than 100 ms. A message that waited for page regions removed since is dropped with them,
 * and the whole queue once there is no document, as when a test environment tears down.
 */
const flush = (): void => {
  if (typeof document === 'undefined') {
    pending.length = 0
    return
  }

  while (pending.length > 0) {
    const [{ context, node, page, priority, timeout }] = pending

    if (page && !page.isConnected) {
      pending.shift()
      continue
    }

    const modal = getModal(context)

    if (modal?.classList.contains(CLASS_NAME_HIDING) || document.activeElement?.closest(`dialog.${CLASS_NAME_HIDING}`)) {
      setTimeout(flush, CLOSE_DELAY)
      return
    }

    const announcer = getAnnouncer(modal ?? document.body)
    const wait = readTime(readyAt, announcer) - performance.now()

    if (wait > 0) {
      setTimeout(flush, wait)
      return
    }

    pending.shift()
    announcer.querySelector(`[aria-live="${priority}"]`)!.append(node)

    if (timeout > 0 && Number.isFinite(timeout)) {
      setTimeout(() => node.remove(), timeout)
    }
  }
}

/**
 * Reads a message to screen reader users. The message goes to a visually hidden live region at
 * the start of the page or, while a modal dialog leaves the rest of the page inert, to one inside
 * that dialog, native or marked with `aria-modal="true"`. The region is picked when the message is added: one task after the call, once a
 * new region is 100 ms old, and after a closing dialog has closed and 500 ms have passed. Messages
 * are added in the order of the calls, and each call adds a new one, so the same text is read
 * again.
 *
 * @param message - The text to read
 * @param options - `priority` picks the polite (default) or the assertive region, `timeout` how
 *   long (ms) the message stays once added, 7000 by default and `0` to keep it, `context` the
 *   element the message comes from, which tells a modal dialog it sits in
 * @returns A function that removes the message, or cancels it before it is added
 */
export const announce = (message: string, { context = null, priority = 'polite', timeout = 7000 }: AnnounceOptions = {}): (() => void) => {
  if (typeof document === 'undefined' || !document.body || !message) {
    return () => {}
  }

  const node = document.createElement('div')
  node.textContent = message
  const modal = getModal(context)
  const host = modal && !modal.classList.contains(CLASS_NAME_HIDING) ? modal : document.body
  const announcer = getAnnouncer(host)

  pending.push({
    context, node, page: host === document.body ? announcer : null, priority: priority === 'assertive' ? 'assertive' : 'polite', timeout
  })
  setTimeout(flush, Math.max(0, readTime(readyAt, announcer) - performance.now()))

  return () => {
    const index = pending.findIndex(message => message.node === node)

    if (index !== -1) {
      pending.splice(index, 1)
    }

    node.remove()
  }
}

if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
  new MutationObserver(holdAfterClose).observe(document.documentElement, { attributeFilter: ['open'], subtree: true })
}

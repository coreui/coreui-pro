export type AnnouncePriority = 'assertive' | 'polite'

export type AnnounceOptions = {
  context?: Element | null
  priority?: AnnouncePriority
  timeout?: number
}

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

const holds = new WeakMap<Element, number>()
const readyAt = new WeakMap<Element, number>()
const pending: Message[] = []

/**
 * Finds the modal dialog the rest of the page is inert behind: the one holding focus, then the
 * one around `context`, then the last one open in the document.
 *
 * @param context - The element the message comes from, if any
 * @returns The modal dialog to announce in, or `null` when none is open
 */
const getModal = (context: Element | null): HTMLDialogElement | null => {
  for (const element of [document.activeElement, context]) {
    const dialog = element?.closest<HTMLDialogElement>('dialog[open]')

    if (dialog?.matches(':modal')) {
      return dialog
    }
  }

  const modals = [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].filter(dialog => dialog.matches(':modal'))

  return modals.at(-1) ?? null
}

/**
 * Tells when new regions of a host can take a message: 100 ms from now, or later while a dialog
 * that closed less than 500 ms ago holds the host. A hold further away than that comes from
 * another clock, such as a test's, and is ignored.
 *
 * @param host - `document.body` or an open modal dialog
 * @returns The time, on the `performance.now()` clock, the first message can be added
 */
const getReadyTime = (host: HTMLElement): number => {
  const now = performance.now()
  const hold = holds.get(host) ?? 0

  return Math.max(now + FIRST_MESSAGE_DELAY, hold - now <= CLOSE_DELAY ? hold : 0)
}

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
  holds.set(host, until)

  if (announcer && readyAt.has(announcer)) {
    readyAt.set(announcer, Math.max(readyAt.get(announcer)!, until))
  }

  if (pending.length > 0) {
    setTimeout(flush, CLOSE_DELAY)
  }
}

/**
 * Adds the waiting messages to their regions in the order they came in. Each goes to the page or
 * to the modal dialog open at that moment. The queue holds while that dialog, or the dialog holding
 * focus, plays its closing transition, for 500 ms after a dialog closes, and while a region is
 * younger than 100 ms. A message that waited for page regions removed since is dropped with them.
 */
const flush = (): void => {
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
    const wait = readyAt.get(announcer)! - performance.now()

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
 * that dialog. The region is picked when the message is added: one task after the call, once a
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
  setTimeout(flush, Math.max(0, readyAt.get(announcer)! - performance.now()))

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

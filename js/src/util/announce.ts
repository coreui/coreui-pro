export type AnnouncePriority = 'assertive' | 'polite'

export type AnnounceOptions = {
  priority?: AnnouncePriority
  timeout?: number
}

const ATTRIBUTE = 'data-coreui-live-announcer'
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

const readyAt = new WeakMap<Element, number>()
const queues = new WeakMap<Element, (() => void)[]>()

/**
 * Finds the modal dialog the rest of the page is inert behind. Focus cannot leave the topmost
 * one, so the dialog holding focus wins; without focus in a dialog, the last one in the document.
 *
 * @returns The topmost open modal dialog, or `null` when none is open
 */
const getTopModal = (): HTMLDialogElement | null => {
  const focused = document.activeElement?.closest<HTMLDialogElement>('dialog[open]')

  if (focused?.matches(':modal')) {
    return focused
  }

  const modals = [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].filter(dialog => dialog.matches(':modal'))

  return modals.at(-1) ?? null
}

/**
 * Returns the live regions a host carries, creating them when it has none. Regions in a dialog
 * leave with it when it closes, so a dialog opened again gets new ones.
 *
 * @param host - `document.body` or an open modal dialog
 * @returns The element holding the assertive and the polite region
 */
const getAnnouncer = (host: HTMLElement): HTMLElement => {
  const existing = host.querySelector<HTMLElement>(`:scope > [${ATTRIBUTE}]`)

  if (existing) {
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
    host.append(announcer)
    host.addEventListener('close', () => announcer.remove(), { once: true })
  }

  readyAt.set(announcer, Date.now() + FIRST_MESSAGE_DELAY)

  return announcer
}

/**
 * Runs an insertion once the regions are ready, in the order the messages came in. The first
 * message after the regions were created waits until 100 ms have passed, the rest one task.
 *
 * @param announcer - The element holding the regions
 * @param insert - Adds one message to its region
 */
const enqueue = (announcer: HTMLElement, insert: () => void): void => {
  const queue = queues.get(announcer)

  if (queue) {
    queue.push(insert)
    return
  }

  queues.set(announcer, [insert])
  setTimeout(() => {
    const inserts = queues.get(announcer) ?? []
    queues.delete(announcer)

    for (const run of inserts) {
      run()
    }
  }, Math.max(0, (readyAt.get(announcer) ?? 0) - Date.now()))
}

/**
 * Reads a message to screen reader users. The message goes to a visually hidden live region of
 * the page, or of the topmost open modal dialog, since a modal dialog leaves the rest of the page
 * inert. Each call adds a new message, so the same text is read again. The first message after a
 * region is created waits 100 ms, which Safari needs before it reads a new region.
 *
 * @param message - The text to read
 * @param options - `priority` picks the polite (default) or the assertive region, `timeout` how
 *   long (ms) the message stays in the region, 7000 by default
 * @returns A function that removes the message, or cancels it while it waits for the region
 */
export const announce = (message: string, { priority = 'polite', timeout = 7000 }: AnnounceOptions = {}): (() => void) => {
  if (typeof document === 'undefined' || !document.body || !message) {
    return () => {}
  }

  const announcer = getAnnouncer(getTopModal() ?? document.body)
  const region = announcer.querySelector(`[aria-live="${priority === 'assertive' ? 'assertive' : 'polite'}"]`)!
  const node = document.createElement('div')
  node.textContent = message
  let cancelled = false

  const remove = (): void => {
    cancelled = true
    node.remove()
  }

  enqueue(announcer, () => {
    if (!cancelled) {
      region.append(node)
    }
  })
  setTimeout(remove, timeout)

  return remove
}

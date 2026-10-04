import { vi } from 'vitest'
import { announce } from '../../../src/util/announce.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('announce', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()

    for (const dialog of document.querySelectorAll('dialog[open]')) {
      dialog.close()
    }

    for (const announcer of document.querySelectorAll('[data-coreui-live-announcer]')) {
      announcer.remove()
    }

    clearFixture()
  })

  const announcers = () => document.querySelectorAll('[data-coreui-live-announcer]')
  const region = (host, priority = 'polite') => host.querySelector(`:scope > [data-coreui-live-announcer] > [aria-live="${priority}"]`)
  const messages = (host, priority) => [...region(host, priority).children].map(message => message.textContent)

  it('should create no region before the first message', () => {
    expect(announcers()).toHaveSize(0)

    announce('')

    expect(announcers()).toHaveSize(0)
  })

  it('should create a visually hidden polite and assertive log region at the start of the page', () => {
    announce('Saved')

    const announcer = document.body.firstElementChild
    expect(announcer.hasAttribute('data-coreui-live-announcer')).toBeTrue()
    expect([...announcer.children].map(child => [
      child.getAttribute('role'),
      child.getAttribute('aria-live'),
      child.getAttribute('aria-relevant')
    ])).toEqual([['log', 'assertive', 'additions'], ['log', 'polite', 'additions']])

    const style = getComputedStyle(announcer)
    expect(style.position).toEqual('absolute')
    expect(announcer.getBoundingClientRect().width).toEqual(1)
    expect(style.overflow).toEqual('hidden')
  })

  it('should hold the first message of a new region for 100 ms', () => {
    announce('Saved')

    vi.advanceTimersByTime(99)
    expect(messages(document.body)).toEqual([])

    vi.advanceTimersByTime(1)
    expect(messages(document.body)).toEqual(['Saved'])
  })

  it('should keep the order of messages sent while the region waits', () => {
    announce('First')
    vi.advanceTimersByTime(50)
    announce('Second')

    vi.advanceTimersByTime(50)
    expect(messages(document.body)).toEqual(['First', 'Second'])
  })

  it('should keep the order of a burst of messages on real timers', async () => {
    vi.useRealTimers()
    const pause = () => {
      let now = Date.now()
      const end = now + 2
      while (now < end) {
        now = Date.now()
      }
    }

    announce('First')
    pause()
    announce('Second')
    pause()
    announce('Third')
    await new Promise(resolve => {
      setTimeout(resolve, 150)
    })

    expect(messages(document.body)).toEqual(['First', 'Second', 'Third'])
  })

  it('should add a later message on the next task', () => {
    announce('First')
    vi.advanceTimersByTime(100)
    announce('Second')

    expect(messages(document.body)).toEqual(['First'])

    vi.advanceTimersByTime(0)
    expect(messages(document.body)).toEqual(['First', 'Second'])
  })

  it('should send each message to the region of its priority', () => {
    announce('Saved')
    announce('Failed', { priority: 'assertive' })
    announce('Unknown', { priority: 'high' })
    vi.advanceTimersByTime(100)

    expect(messages(document.body, 'polite')).toEqual(['Saved', 'Unknown'])
    expect(messages(document.body, 'assertive')).toEqual(['Failed'])
  })

  it('should add the same text again as a new message', () => {
    announce('Saved')
    announce('Saved')
    vi.advanceTimersByTime(100)

    expect(messages(document.body)).toEqual(['Saved', 'Saved'])
  })

  it('should drop a message after seven seconds, or after its timeout', () => {
    announce('Saved')
    announce('Copied', { timeout: 1000 })
    vi.advanceTimersByTime(1000)

    expect(messages(document.body)).toEqual(['Saved'])

    vi.advanceTimersByTime(5999)
    expect(messages(document.body)).toEqual(['Saved'])

    vi.advanceTimersByTime(1)
    expect(messages(document.body)).toEqual([])
  })

  it('should cancel a waiting message and remove an added one', () => {
    const cancel = announce('Uploading')
    cancel()
    vi.advanceTimersByTime(100)

    expect(messages(document.body)).toEqual([])

    const remove = announce('Uploaded')
    vi.advanceTimersByTime(0)
    expect(messages(document.body)).toEqual(['Uploaded'])

    remove()
    expect(messages(document.body)).toEqual([])
  })

  it('should share the regions a page already has', () => {
    announce('First')
    vi.advanceTimersByTime(100)
    const announcer = announcers()[0]

    announce('Second')
    vi.advanceTimersByTime(0)

    expect(announcers()).toHaveSize(1)
    expect(announcers()[0]).toBe(announcer)
    expect(messages(document.body)).toEqual(['First', 'Second'])
  })

  it('should announce inside an open modal dialog, which leaves the page inert', () => {
    fixtureEl.innerHTML = '<dialog><button type="button">Close</button></dialog>'
    const dialog = fixtureEl.querySelector('dialog')
    announce('Before')
    vi.advanceTimersByTime(100)

    dialog.showModal()
    announce('Saved')
    vi.advanceTimersByTime(99)
    expect(messages(dialog)).toEqual([])

    vi.advanceTimersByTime(1)
    expect(dialog.lastElementChild.hasAttribute('data-coreui-live-announcer')).toBeTrue()
    expect(messages(dialog)).toEqual(['Saved'])
    expect(messages(document.body)).toEqual(['Before'])
  })

  it('should remove the regions of a dialog when it closes and create new ones when it opens again', async () => {
    fixtureEl.innerHTML = '<dialog><button type="button">Close</button></dialog>'
    const dialog = fixtureEl.querySelector('dialog')

    dialog.showModal()
    announce('Saved')
    vi.advanceTimersByTime(100)
    const announcer = dialog.querySelector('[data-coreui-live-announcer]')

    const closed = new Promise(resolve => {
      dialog.addEventListener('close', resolve, { once: true })
    })
    dialog.close()
    await closed
    expect(announcer.isConnected).toBeFalse()

    dialog.showModal()
    announce('Saved again')
    vi.advanceTimersByTime(99)
    expect(messages(dialog)).toEqual([])

    vi.advanceTimersByTime(1)
    expect(messages(dialog)).toEqual(['Saved again'])
  })

  it('should announce in the dialog that holds focus when modal dialogs are nested', () => {
    fixtureEl.innerHTML = [
      '<dialog id="inner"><button type="button">Inner</button></dialog>',
      '<dialog id="outer"><button type="button">Outer</button></dialog>'
    ].join('')
    const outer = fixtureEl.querySelector('#outer')
    const inner = fixtureEl.querySelector('#inner')

    outer.showModal()
    inner.showModal()
    expect(inner.contains(document.activeElement)).toBeTrue()

    announce('Saved')
    vi.advanceTimersByTime(100)

    expect(messages(inner)).toEqual(['Saved'])
    expect(outer.querySelector('[data-coreui-live-announcer]')).toBeNull()
  })

  it('should fall back to the last modal dialog in the document when none holds focus', () => {
    fixtureEl.innerHTML = [
      '<dialog id="first"><p>First</p></dialog>',
      '<dialog id="second"><p>Second</p></dialog>'
    ].join('')
    const first = fixtureEl.querySelector('#first')
    const second = fixtureEl.querySelector('#second')

    first.showModal()
    second.showModal()
    document.activeElement?.blur()

    announce('Saved')
    vi.advanceTimersByTime(100)

    expect(messages(second)).toEqual(['Saved'])
    expect(first.querySelector('[data-coreui-live-announcer]')).toBeNull()
  })

  it('should announce on the page while a dialog is open without being modal', () => {
    fixtureEl.innerHTML = '<dialog><p>Details</p></dialog>'
    const dialog = fixtureEl.querySelector('dialog')

    dialog.show()
    announce('Saved')
    vi.advanceTimersByTime(100)

    expect(messages(document.body)).toEqual(['Saved'])
    expect(dialog.querySelector('[data-coreui-live-announcer]')).toBeNull()
  })
})

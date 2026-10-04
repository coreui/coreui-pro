import { vi } from 'vitest'
import { announce } from '../../../src/util/announce.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

describe('announce on a fresh page', () => {
  afterEach(() => {
    vi.useRealTimers()

    for (const announcer of document.querySelectorAll('[data-coreui-live-announcer]')) {
      announcer.remove()
    }

    clearFixture()
  })

  it('should hold for 500 ms a first message sent as a dialog closes', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    const fixtureEl = getFixture()
    fixtureEl.innerHTML = '<dialog><button type="button">Close</button></dialog>'
    const dialog = fixtureEl.querySelector('dialog')
    dialog.showModal()
    await Promise.resolve()

    dialog.close()
    announce('Saved')
    await Promise.resolve()
    vi.advanceTimersByTime(499)

    const region = document.body.querySelector(':scope > [data-coreui-live-announcer] > [aria-live="polite"]')
    expect(region.children).toHaveSize(0)

    vi.advanceTimersByTime(1)
    expect(region.textContent).toEqual('Saved')
  })
})

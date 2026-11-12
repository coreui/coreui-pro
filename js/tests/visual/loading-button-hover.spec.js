import { userEvent } from 'vitest/browser'
// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import LoadingButton from '../../src/loading-button.js'
import Tooltip from '../../src/tooltip.js'

const wait = delay => new Promise(resolve => {
  setTimeout(resolve, delay)
})

const pointerEvents = element => getComputedStyle(element).pointerEvents

describe('LoadingButton while it blocks itself', () => {
  let container

  afterEach(() => {
    container.remove()
  })

  it('should keep the pointer, so a hover tooltip still explains the wait', async () => {
    container = document.createElement('div')
    container.innerHTML = '<button type="button" class="btn btn-primary" title="Saving your draft">Save</button>'
    document.body.append(container)
    const button = container.querySelector('button')
    const loadingButton = new LoadingButton(button, { disabledOnLoading: true })
    const tooltip = new Tooltip(button, { animation: false })

    expect(pointerEvents(button)).toBe('auto')

    loadingButton.start()
    await wait(20)

    expect(button).toHaveClass('disabled')
    expect(pointerEvents(button)).toBe('auto')
    expect(getComputedStyle(button).cursor).toBe('default')

    const shown = new Promise(resolve => {
      button.addEventListener('shown.coreui.tooltip', resolve, { once: true })
    })
    await userEvent.unhover(button)
    await userEvent.hover(button)
    await shown

    expect(document.querySelector('.tooltip.show')?.textContent).toBe('Saving your draft')
    tooltip.dispose()
    loadingButton.dispose()
  })

  it('should leave links and an idle button without pointer events', async () => {
    container = document.createElement('div')
    container.innerHTML = [
      '<a class="btn btn-primary" href="#next">Next</a>',
      '<a class="btn btn-primary disabled" aria-disabled="true" href="#back">Back</a>',
      '<button type="button" class="btn btn-primary disabled">Idle</button>'
    ].join('')
    document.body.append(container)
    const [link, pageLink, idle] = container.querySelectorAll('.btn')
    const instances = [
      new LoadingButton(link, { disabledOnLoading: true }),
      new LoadingButton(pageLink),
      new LoadingButton(idle)
    ]

    for (const instance of instances.slice(0, 2)) {
      instance.start()
    }

    await wait(20)

    expect([link, pageLink, idle].map(pointerEvents)).toEqual(['none', 'none', 'none'])

    for (const instance of instances) {
      instance.dispose()
    }
  })
})

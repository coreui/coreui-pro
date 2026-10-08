/*!
 * A busy main thread delays the start of a transition, not the timer set beside it, so only a page
 * that renders frames can tell whether a wait ends on a finished transition. The unit suite's frame
 * keeps transitions running while the thread is blocked.
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Tab from '../../src/tab.js'
import { executeAfterTransition } from '../../src/util/index.js'

let element

const busy = () => {
  const until = performance.now() + 220

  while (performance.now() < until) {
    Math.random()
  }
}

const nextFrames = () => new Promise(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(resolve))
})

const mountBox = async () => {
  element = document.createElement('div')
  element.style.cssText = 'width: 40px; height: 40px; opacity: 0; transition: opacity 100ms linear;'
  document.body.append(element)
  await nextFrames()

  return element
}

describe('waiting for a transition', () => {
  afterEach(() => {
    element?.remove()
    element = null
  })

  it('should wait for a transition whose start a busy main thread delayed', async () => {
    const box = await mountBox()

    box.style.opacity = '1'

    const opacity = new Promise(resolve => {
      executeAfterTransition(() => resolve(getComputedStyle(box).opacity), box)
    })

    busy()

    expect(await opacity).toBe('1')
  })

  it('should leave a later wait on the same element to its own transition', async () => {
    const box = await mountBox()

    box.style.opacity = '1'
    executeAfterTransition(() => {}, box)
    busy()
    await new Promise(resolve => {
      setTimeout(resolve, 40)
    })
    box.style.opacity = '0'

    const start = performance.now()
    const elapsed = await new Promise(resolve => {
      executeAfterTransition(() => resolve(performance.now() - start), box)
    })

    expect(elapsed).toBeGreaterThan(20)
  })

  it('should leave a tab switched away from during its fade unselected', async () => {
    element = document.createElement('div')
    element.innerHTML = [
      '<ul class="nav nav-tabs" role="tablist">',
      '  <li class="nav-item" role="presentation"><button class="nav-link active" id="one" data-coreui-toggle="tab" data-coreui-target="#pane-one" type="button" role="tab" aria-controls="pane-one" aria-selected="true">One</button></li>',
      '  <li class="nav-item" role="presentation"><button class="nav-link" id="two" data-coreui-toggle="tab" data-coreui-target="#pane-two" type="button" role="tab" aria-controls="pane-two" aria-selected="false" tabindex="-1">Two</button></li>',
      '</ul>',
      '<div class="tab-content">',
      '  <div class="tab-pane fade show active" id="pane-one" role="tabpanel" aria-labelledby="one">One</div>',
      '  <div class="tab-pane fade" id="pane-two" role="tabpanel" aria-labelledby="two">Two</div>',
      '</div>'
    ].join('')
    document.body.append(element)
    await nextFrames()

    const one = element.querySelector('#one')
    const two = element.querySelector('#two')

    Tab.getOrCreateInstance(two).show()
    busy()
    await new Promise(resolve => {
      setTimeout(resolve, 40)
    })
    Tab.getOrCreateInstance(one).show()
    await new Promise(resolve => {
      setTimeout(resolve, 400)
    })

    expect(two.getAttribute('aria-selected')).toBe('false')
    expect(two.getAttribute('tabindex')).toBe('-1')
    expect(one.getAttribute('aria-selected')).toBe('true')
  })

  it('should settle on its timer when the document was hidden before it fired', async () => {
    const box = await mountBox()

    try {
      box.style.opacity = '1'

      const opacity = new Promise(resolve => {
        executeAfterTransition(() => resolve(getComputedStyle(box).opacity), box)
      })

      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
      busy()

      expect(await opacity).not.toBe('1')
    } finally {
      delete document.hidden
    }
  })
})

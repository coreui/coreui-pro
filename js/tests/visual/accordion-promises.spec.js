// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Accordion from '../../src/accordion.js'

describe('Accordion promises with the stylesheet', () => {
  let container

  afterEach(() => {
    container.remove()
  })

  it('should settle show together with shown once the panel has finished opening', async () => {
    container = document.createElement('div')
    container.innerHTML = [
      '<div class="accordion">',
      '<details class="accordion-item" name="group"><summary class="accordion-header">One</summary><div class="accordion-body">Body<br>line<br>line<br>line</div></details>',
      '</div>'
    ].join('')
    document.body.append(container)
    const itemEl = container.querySelector('.accordion-item')
    const accordion = new Accordion(container.querySelector('.accordion'))
    const start = performance.now()
    let shownAt = null
    itemEl.addEventListener('shown.coreui.accordion', () => {
      shownAt = performance.now() - start
    })

    await accordion.show(itemEl)
    const settledAt = performance.now() - start
    const settledHeight = itemEl.getBoundingClientRect().height
    await new Promise(resolve => {
      setTimeout(resolve, 200)
    })

    expect(settledAt).toBeGreaterThan(300)
    expect(shownAt).not.toBeNull()
    expect(settledAt - shownAt).toBeLessThan(5)
    expect(settledHeight).toBeCloseTo(itemEl.getBoundingClientRect().height, 0)
    accordion.dispose()
  })
})

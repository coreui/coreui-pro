// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Collapse from '../../src/collapse.js'

describe('Collapse reveal with the stylesheet', () => {
  let container

  afterEach(() => {
    container.remove()
  })

  it('should close the open collapse of the parent group without a transition when the browser reveals another', async () => {
    container = document.createElement('div')
    container.id = 'revealGroup'
    container.innerHTML = [
      '<div class="collapse show" id="revealA" data-coreui-parent="#revealGroup" data-coreui-hidden-until-found="true"><p style="height: 200px">A</p></div>',
      '<div class="collapse" id="revealB" data-coreui-parent="#revealGroup" data-coreui-hidden-until-found="true"><p>B</p></div>'
    ].join('')
    document.body.append(container)

    const itemA = container.querySelector('#revealA')
    const itemB = container.querySelector('#revealB')
    Collapse._initializeDataApi()
    itemA.getBoundingClientRect()

    itemB.dispatchEvent(new Event('beforematch', { bubbles: true }))
    itemB.removeAttribute('hidden')
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    })

    expect(itemA.getBoundingClientRect().height).toBe(0)
    expect(itemA.style.transition).toBe('')
  })
})

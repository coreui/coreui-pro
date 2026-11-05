/*!
 * The tip of a tooltip or popover with `anchors` slides to the next anchor only while it carries
 * `data-coreui-moving`; outside a move it follows its anchor at once, so it never trails on scroll.
 * Decided by the compiled stylesheet, which the unit suite does not load.
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Popover from '../../src/popover.js'
import Tooltip from '../../src/tooltip.js'

let bar

beforeEach(() => {
  bar = document.createElement('div')
  bar.innerHTML = '<button type="button" title="Bold" data-coreui-content="Bold">B</button><button type="button" title="Italic" data-coreui-content="Italic" style="margin-left:200px">I</button>'
  bar.style.cssText = 'position:fixed;left:40px;top:120px;'
  document.body.append(bar)
})

afterEach(() => {
  bar.remove()
})

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

describe.each([
  ['tooltip', Tooltip],
  ['popover', Popover]
])('%s anchors', (name, Component) => {
  it('should transition left and top only while it moves', async () => {
    const component = new Component(bar, { anchors: 'button', trigger: 'click' })
    const [a, b] = bar.querySelectorAll('button')
    const shown = new Promise(resolve => {
      bar.addEventListener(`shown.coreui.${name}`, resolve, { once: true })
    })
    a.click()
    await shown
    const tip = document.querySelector(`.${name}`)

    expect(getComputedStyle(tip).transitionProperty.split(', ')).not.toContain('left')

    const moved = new Promise(resolve => {
      bar.addEventListener(`moved.coreui.${name}`, resolve, { once: true })
    })
    b.click()
    const moving = tip.hasAttribute('data-coreui-moving')
    const property = getComputedStyle(tip).transitionProperty.split(', ')
    const { transitionDuration, transitionTimingFunction } = getComputedStyle(tip)
    const arrow = getComputedStyle(tip.querySelector(`.${name}-arrow`)).transitionProperty.split(', ')
    await moved

    if (reducedMotion()) {
      expect(transitionDuration).toBe('0s')
    } else {
      expect(moving).toBeTrue()
      expect(property).toEqual(['opacity', 'left', 'top'])
      expect(transitionDuration).toBe('0.2s')
      expect(transitionTimingFunction).toBe('cubic-bezier(0.22, 1, 0.36, 1)')
      expect(arrow).toContain('left')
    }

    expect(tip.hasAttribute('data-coreui-moving')).toBeFalse()
    expect(getComputedStyle(tip).transitionProperty.split(', ')).not.toContain('left')
    component.dispose()
  })
})

/*!
 * Behavioral probe for the hover bridge: the invisible strip each placement
 * draws over the offset gap, so the pointer can cross from the trigger to the
 * tip anywhere along its edge, not only over the arrow. Asserted with real
 * hit-testing (`elementFromPoint`) against the compiled stylesheet — the unit
 * suite runs without CSS, so it cannot see this.
 */

// eslint-disable-next-line import/no-unassigned-import
import '../../../scss/coreui.scss'
import Popover from '../../src/popover.js'
import Tooltip from '../../src/tooltip.js'

let trigger

beforeEach(() => {
  trigger = document.createElement('button')
  trigger.type = 'button'
  trigger.textContent = 'trigger'
  trigger.style.cssText = 'position:fixed;left:50%;top:50%;width:120px;height:40px;'
  document.body.append(trigger)
})

afterEach(() => {
  trigger.remove()
})

const nextFrames = () => new Promise(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(resolve))
})

const gapPoint = (placement, tipRect, triggerRect) => {
  switch (placement) {
    case 'top': {
      return [tipRect.left + 2, (tipRect.bottom + triggerRect.top) / 2]
    }

    case 'bottom': {
      return [tipRect.left + 2, (triggerRect.bottom + tipRect.top) / 2]
    }

    case 'left': {
      return [(tipRect.right + triggerRect.left) / 2, tipRect.top + 2]
    }

    default: {
      return [(triggerRect.right + tipRect.left) / 2, tipRect.top + 2]
    }
  }
}

describe('hover bridge', () => {
  for (const placement of ['top', 'bottom', 'left', 'right']) {
    it(`tooltip: a point in the offset gap beside the arrow hits the tip (${placement})`, async () => {
      const tooltip = new Tooltip(trigger, { title: 'Another tooltip', placement, animation: false })

      await tooltip.show()
      await nextFrames()

      const tip = tooltip._getTipElement()
      const [x, y] = gapPoint(placement, tip.getBoundingClientRect(), trigger.getBoundingClientRect())
      const hit = document.elementFromPoint(x, y)

      expect(tip.contains(hit)).toBeTrue()

      tooltip.dispose()
    })

    it(`popover: a point in the offset gap beside the arrow hits the tip (${placement})`, async () => {
      const popover = new Popover(trigger, {
        title: 'A popover', content: 'content', placement, animation: false
      })

      await popover.show()
      await nextFrames()

      const tip = popover._getTipElement()
      const [x, y] = gapPoint(placement, tip.getBoundingClientRect(), trigger.getBoundingClientRect())
      const hit = document.elementFromPoint(x, y)

      expect(tip.contains(hit)).toBeTrue()

      popover.dispose()
    })
  }
})

import { followPointerIntent, isInTriangle, safeTriangle } from '../../../src/util/safe-triangle.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

const noop = () => {}

describe('Safe triangle', () => {
  let fixtureEl
  let floating

  const sleep = ms => new Promise(resolve => {
    setTimeout(resolve, ms)
  })
  const pointer = ({ x, y }, target = document) => target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: y }))
  const follow = (onLeave, point) => followPointerIntent({
    exit: { x: 10, y: 215 }, floating, onLeave, placement: 'right', point: point ?? { x: 20, y: 215 }, rest: 30
  })

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  beforeEach(() => {
    fixtureEl.innerHTML = '<div style="position: fixed; left: 100px; top: 200px; width: 50px; height: 30px;"></div>'
    floating = fixtureEl.firstElementChild
  })

  afterEach(() => {
    clearFixture()
  })

  describe('isInTriangle', () => {
    const a = { x: 0, y: 0 }
    const b = { x: 10, y: 0 }
    const c = { x: 5, y: 10 }

    it('should find a point inside the triangle', () => {
      expect(isInTriangle({ x: 5, y: 5 }, a, b, c)).toBeTrue()
    })

    it('should count a point on an edge or a corner as inside', () => {
      expect(isInTriangle({ x: 5, y: 0 }, a, b, c)).toBeTrue()
      expect(isInTriangle(a, a, b, c)).toBeTrue()
    })

    it('should not find a point outside the triangle', () => {
      expect(isInTriangle({ x: 20, y: 20 }, a, b, c)).toBeFalse()
      expect(isInTriangle({ x: 5, y: -0.5 }, a, b, c)).toBeFalse()
    })

    it('should not depend on the order of the corners', () => {
      expect(isInTriangle({ x: 5, y: 5 }, c, b, a)).toBeTrue()
      expect(isInTriangle({ x: 20, y: 20 }, c, b, a)).toBeFalse()
    })
  })

  describe('safeTriangle', () => {
    const rect = new DOMRect(100, 200, 50, 30)

    it('should reach the bottom edge of a tip above and move the apex down', () => {
      expect(safeTriangle({ x: 10, y: 300 }, rect, 'top')).toEqual([{ x: 10, y: 304 }, { x: 100, y: 230 }, { x: 150, y: 230 }])
    })

    it('should reach the top edge of a tip below and move the apex up', () => {
      expect(safeTriangle({ x: 10, y: 100 }, rect, 'bottom-start')).toEqual([{ x: 10, y: 96 }, { x: 100, y: 200 }, { x: 150, y: 200 }])
    })

    it('should reach the right edge of a tip on the left and move the apex right', () => {
      expect(safeTriangle({ x: 300, y: 210 }, rect, 'left')).toEqual([{ x: 304, y: 210 }, { x: 150, y: 200 }, { x: 150, y: 230 }])
    })

    it('should reach the left edge of a tip on the right and move the apex left', () => {
      expect(safeTriangle({ x: 10, y: 210 }, rect, 'right-end')).toEqual([{ x: 6, y: 210 }, { x: 100, y: 200 }, { x: 100, y: 230 }])
    })

    it('should keep a pointer that has just left towards the tip inside', () => {
      const exit = { x: 10, y: 215 }

      expect(isInTriangle({ x: 10.6, y: 215.7 }, ...safeTriangle(exit, rect, 'right'))).toBeTrue()
    })
  })

  describe('followPointerIntent', () => {
    it('should not follow a pointer that is not heading for the floating element', () => {
      const onLeave = jasmine.createSpy('onLeave')

      expect(follow(onLeave, { x: 20, y: 300 })).toBeNull()
      expect(onLeave).not.toHaveBeenCalled()
    })

    it('should keep following while the pointer moves inside the triangle', async () => {
      const onLeave = jasmine.createSpy('onLeave')
      const stop = follow(onLeave)

      await sleep(20)
      pointer({ x: 40, y: 215 })
      await sleep(20)
      pointer({ x: 60, y: 215 })

      expect(onLeave).not.toHaveBeenCalled()
      stop()
    })

    it('should call onLeave at once when the pointer leaves the triangle', () => {
      const onLeave = jasmine.createSpy('onLeave')
      follow(onLeave)

      pointer({ x: 40, y: 300 })

      expect(onLeave).toHaveBeenCalledTimes(1)
    })

    it('should call onLeave once the pointer rests', async () => {
      const onLeave = jasmine.createSpy('onLeave')
      follow(onLeave)
      pointer({ x: 40, y: 215 })

      await sleep(10)

      expect(onLeave).not.toHaveBeenCalled()

      await sleep(40)

      expect(onLeave).toHaveBeenCalledTimes(1)
    })

    it('should end without onLeave when the pointer reaches the floating element', async () => {
      const onLeave = jasmine.createSpy('onLeave')
      follow(onLeave)

      pointer({ x: 120, y: 215 }, floating)
      pointer({ x: 40, y: 300 })
      await sleep(50)

      expect(onLeave).not.toHaveBeenCalled()
    })

    it('should call onReach once when the pointer reaches the floating element', () => {
      const onReach = jasmine.createSpy('onReach')
      followPointerIntent({
        exit: { x: 10, y: 215 }, floating, onLeave: noop, onReach, placement: 'right', point: { x: 20, y: 215 }, rest: 30
      })

      pointer({ x: 120, y: 215 }, floating)
      pointer({ x: 120, y: 216 }, floating)

      expect(onReach).toHaveBeenCalledTimes(1)
    })

    it('should count a pointer over the floating element inside a shadow root as reaching it', () => {
      const host = document.createElement('div')
      fixtureEl.append(host)
      const panel = document.createElement('div')
      panel.style.cssText = 'position: fixed; left: 100px; top: 200px; width: 50px; height: 30px;'
      host.attachShadow({ mode: 'open' }).append(panel)
      const onLeave = jasmine.createSpy('onLeave')
      const onReach = jasmine.createSpy('onReach')
      followPointerIntent({
        exit: { x: 10, y: 215 }, floating: panel, onLeave, onReach, placement: 'right', point: { x: 20, y: 215 }, rest: 30
      })

      panel.dispatchEvent(new PointerEvent('pointermove', {
        bubbles: true, clientX: 120, clientY: 215, composed: true
      }))

      expect(onReach).toHaveBeenCalledTimes(1)
      expect(onLeave).not.toHaveBeenCalled()
    })

    it('should stop following when the returned function runs', async () => {
      const onLeave = jasmine.createSpy('onLeave')
      const stop = follow(onLeave)

      stop()
      pointer({ x: 40, y: 300 })
      await sleep(50)

      expect(onLeave).not.toHaveBeenCalled()
    })
  })
})

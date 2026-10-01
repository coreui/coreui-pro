import { onTestFinished } from 'vitest'
import {
  constrainInput,
  getNearestInput,
  getRatio,
  getRatioAt,
  getStackOrder,
  getThumbSize,
  getTickPositions,
  sanitizeValue,
  setInputValue
} from '../../../src/util/range.js'
import { clearFixture, getFixture } from '../../helpers/fixture.js'

const rect = (width, height) => ({
  bottom: height, height, left: 0, right: width, top: 0, width, x: 0, y: 0
})

describe('Range utilities', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  const inputs = (...markup) => {
    fixtureEl.innerHTML = markup.map(attributes => `<input type="range" ${attributes}>`).join('')
    return [...fixtureEl.querySelectorAll('input')]
  }

  describe('setInputValue', () => {
    it('writes the value through the prototype setter and lets the browser sanitize it', () => {
      const [input] = inputs('step="5"')
      let instanceWrites = 0
      Object.defineProperty(input, 'value', {
        configurable: true,
        get: () => Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').get.call(input),
        set(value) {
          instanceWrites++
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value)
        }
      })

      setInputValue(input, 52)

      expect(input.value).toBe('50')
      expect(instanceWrites).toBe(0)
    })
  })

  describe('constrainInput', () => {
    it('keeps an input above the one before it and below the one after it', () => {
      const [first, second, third] = inputs('value="20"', 'value="10"', 'value="60"')

      constrainInput(second, first, third, 0)
      expect(second.value).toBe('20')

      second.value = '80'
      constrainInput(second, first, third, 0)
      expect(second.value).toBe('60')
    })

    it('keeps the distance and moves to the next step inside a limit off the grid', () => {
      const [lower, upper] = inputs('step="10" value="20"', 'step="10" value="0"')

      constrainInput(upper, lower, undefined, 3)
      expect(upper.value).toBe('30')

      const [low, high] = inputs('step="10" value="100"', 'step="10" value="80"')
      constrainInput(low, undefined, high, 3)
      expect(low.value).toBe('70')
    })

    it('keeps an exact limit with step any', () => {
      const [lower, upper] = inputs('step="any" value="20"', 'step="any" value="0"')

      constrainInput(upper, lower, undefined, 2.5)

      expect(upper.value).toBe('22.5')
    })

    it('does not step a step any input when the limit lies past max', () => {
      const [lower, upper] = inputs('step="any" value="99"', 'step="any" value="0"')

      expect(() => constrainInput(upper, lower, undefined, 5)).not.toThrow()
      expect(upper.value).toBe('100')
    })

    it('leaves an input that is in order', () => {
      const [first, second] = inputs('value="20"', 'value="40"')

      constrainInput(second, first, undefined, 10)

      expect(second.value).toBe('40')
    })
  })

  describe('getRatio', () => {
    it('reads the value as a ratio of the track', () => {
      expect(getRatio(inputs('min="10" max="30" value="15"')[0])).toBe(0.25)
      expect(getRatio(inputs('value="40"')[0])).toBe(0.4)
    })

    it('returns 0 for an empty span', () => {
      expect(getRatio(inputs('min="5" max="5" value="5"')[0])).toBe(0)
    })
  })

  describe('getNearestInput', () => {
    it('moves the first thumb below it, the last above it and the closest between', () => {
      const thumbs = inputs('value="20"', 'value="60"')

      expect(getNearestInput(thumbs, 0.1)).toBe(thumbs[0])
      expect(getNearestInput(thumbs, 0.3)).toBe(thumbs[0])
      expect(getNearestInput(thumbs, 0.5)).toBe(thumbs[1])
      expect(getNearestInput(thumbs, 0.9)).toBe(thumbs[1])
    })

    it('breaks a tie towards the side of the press', () => {
      const thumbs = inputs('value="40"', 'value="40"')

      expect(getNearestInput(thumbs, 0.39)).toBe(thumbs[0])
      expect(getNearestInput(thumbs, 0.41)).toBe(thumbs[1])

      const stacked = inputs('value="20"', 'value="50"', 'value="50"', 'value="80"')
      expect(getNearestInput(stacked, 0.45)).toBe(stacked[1])
      expect(getNearestInput(stacked, 0.55)).toBe(stacked[2])
    })

    it('skips disabled thumbs and returns null when every thumb is disabled', () => {
      const thumbs = inputs('value="20" disabled', 'value="60"')

      expect(getNearestInput(thumbs, 0.1)).toBe(thumbs[1])

      thumbs[1].disabled = true
      expect(getNearestInput(thumbs, 0.1)).toBeNull()
    })
  })

  describe('getRatioAt', () => {
    it('measures between the thumb centres at either end', () => {
      expect(getRatioAt({ clientX: 10, clientY: 0 }, rect(220, 20), 20, false, false)).toBe(0)
      expect(getRatioAt({ clientX: 110, clientY: 0 }, rect(220, 20), 20, false, false)).toBe(0.5)
      expect(getRatioAt({ clientX: 500, clientY: 0 }, rect(220, 20), 20, false, false)).toBe(1)
    })

    it('measures from the box of the track wherever it sits and clamps both ends', () => {
      const box = { ...rect(220, 20), left: 100, right: 320 }

      expect(getRatioAt({ clientX: 210, clientY: 0 }, box, 20, false, false)).toBe(0.5)
      expect(getRatioAt({ clientX: 0, clientY: 0 }, box, 20, false, false)).toBe(0)
      expect(getRatioAt({ clientX: 260, clientY: 0 }, box, 20, false, true)).toBe(0.25)
      expect(getRatioAt({ clientX: 0, clientY: 10 }, { ...rect(20, 220), top: 100, bottom: 320 }, 20, true, false)).toBe(1)
    })

    it('reads a right-to-left track from the right and a vertical one from the bottom', () => {
      expect(getRatioAt({ clientX: 60, clientY: 0 }, rect(220, 20), 20, false, true)).toBe(0.75)
      expect(getRatioAt({ clientX: 0, clientY: 60 }, rect(20, 220), 20, true, false)).toBe(0.75)
    })

    it('returns 0 when the track is no longer than the thumb', () => {
      expect(getRatioAt({ clientX: 10, clientY: 0 }, rect(20, 20), 20, false, false)).toBe(0)
    })
  })

  describe('getStackOrder', () => {
    it('puts the thumb that can still move on top', () => {
      expect(getStackOrder(0.9, 0, 2)).toBeGreaterThan(getStackOrder(0.9, 1, 2))
      expect(getStackOrder(0.1, 1, 2)).toBeGreaterThan(getStackOrder(0.1, 0, 2))
    })
  })

  describe('getThumbSize', () => {
    it('resolves --cui-range-thumb-width in pixels and leaves no probe behind', () => {
      fixtureEl.innerHTML = '<div style="--cui-range-thumb-width: 1.5rem; font-size: 10px"></div>'
      const element = fixtureEl.firstElementChild
      document.documentElement.style.fontSize = '16px'
      onTestFinished(() => document.documentElement.style.removeProperty('font-size'))

      expect(getThumbSize(element)).toBe(24)
      expect(element.children.length).toBe(0)
    })
  })

  describe('getTickPositions', () => {
    it('places numbers and objects with a value at it, and the rest by position', () => {
      const positions = getTickPositions(0, 100, [{ value: 100 }, 'Mid', 10, { label: 'Low' }])

      expect(positions.map(position => position.index)).toEqual([2, 1, 0, 3])
      expect(positions.map(position => position.value)).toEqual([10, (1 / 3) * 100, 100, 100])
      expect(positions[1].ratio).toBeCloseTo(1 / 3, 10)
      expect(positions[3].ratio).toBe(1)
    })

    it('places a single label at min, clamps the ratio and drops values that are not numbers', () => {
      expect(getTickPositions(10, 20, ['Only'])).toEqual([{ index: 0, ratio: 0, value: 10 }])
      expect(getTickPositions(0, 10, [-5, 15, Number.NaN, Infinity])).toEqual([
        { index: 0, ratio: 0, value: -5 },
        { index: 1, ratio: 1, value: 15 }
      ])
    })

    it('treats an empty span as one unit', () => {
      expect(getTickPositions(5, 5, [6])).toEqual([{ index: 0, ratio: 1, value: 6 }])
      expect(getTickPositions(5, 5, [5])).toEqual([{ index: 0, ratio: 0, value: 5 }])
    })

    it('reads an object value as a number and places a null tick by its position', () => {
      expect(getTickPositions(0, 100, [{ value: '50', label: 'Half' }])).toEqual([{ index: 0, ratio: 0.5, value: 50 }])
      expect(getTickPositions(0, 100, [null, 100]).map(position => position.value)).toEqual([0, 100])
      expect(getTickPositions(0, 100, [{ value: 'half' }, { value: 'Infinity' }])).toEqual([])
    })
  })

  describe('sanitizeValue', () => {
    it('matches the value the browser gives the input', () => {
      const cases = [
        [25, 0, 100, 10],
        [75, 0, 100, 10],
        [50, 0, 100, 3],
        [150, 0, 100, 1],
        [-5, 0, 100, 1],
        [9.7, 0, 10, 4],
        [10, 0, 10, 4],
        [6, 0, 10, 4],
        [7, 1, 10, 2],
        [0.3, 0, 1, 0.1],
        [0.15, 0, 1, 0.1],
        [0.35, 0, 1, 0.1],
        [0.125, 0.05, 1, 0.025],
        [5, 10, 0, 1],
        [33.3, 0, 100, 0],
        [33.3, 0, 100, -2]
      ]

      for (const [value, min, max, step] of cases) {
        const [input] = inputs(`min="${min}" max="${max}" step="${step}" value="${value}"`)
        expect(sanitizeValue(value, min, max, step), `${value} in ${min}..${max} by ${step}`).toBe(Number(input.value))
      }
    })

    it('clamps without rounding for step any and takes the midpoint for a value that is not finite', () => {
      expect(sanitizeValue(33.3, 0, 100, 'any')).toBe(33.3)
      expect(sanitizeValue(Number.NaN, 0, 10, 1)).toBe(5)
      expect(sanitizeValue(Infinity, 0, 100, 1)).toBe(50)
    })
  })
})

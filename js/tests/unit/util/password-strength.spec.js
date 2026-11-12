import {
  createStrengthEvaluator, normalizeStrength, PASSWORD_STRENGTH_THRESHOLDS, PASSWORD_STRENGTH_WEIGHTS, scorePassword
} from '../../../src/util/password-strength.js'

const wait = ms => new Promise(resolve => {
  setTimeout(resolve, ms)
})

describe('Password strength', () => {
  describe('scorePassword', () => {
    const defaults = { minLength: 8 }

    it('should score a password by its rules with the default weights and thresholds', () => {
      expect(scorePassword('abc', [], defaults).score).toBe(1)
      expect(scorePassword('abcdefgh1', [], defaults).score).toBe(2)
      expect(scorePassword('Abcdefgh1!', [], defaults).score).toBe(3)
      expect(scorePassword('Abcdefghijkl1!@#', [], defaults).score).toBe(4)
      expect(PASSWORD_STRENGTH_THRESHOLDS).toEqual([2, 4, 6])
      expect(Object.keys(PASSWORD_STRENGTH_WEIGHTS)).toHaveLength(8)
    })

    it('should score 0 for a password that contains a user input of three characters or more', () => {
      expect(scorePassword('Correct-JOHN-horse1', ['  john '], defaults).score).toBe(0)
      expect(scorePassword('Correct-jo-horse1', ['jo'], defaults).score).not.toBe(0)
    })

    it('should take the weights and thresholds it is given and keep the defaults for the rest', () => {
      expect(scorePassword('abc', [], { minLength: 8, weights: { lowercase: 10 } }).score).toBe(4)
      expect(scorePassword('abc', [], { minLength: 8, weights: { lowercase: Number.NaN } }).score).toBe(1)
      expect(scorePassword('abcdefgh1', [], { minLength: 8, thresholds: [0] }).score).toBe(2)
      expect(scorePassword('abcdefgh1', [], { minLength: 8, thresholds: [0, 0, 0] }).score).toBe(4)
    })
  })

  describe('normalizeStrength', () => {
    it('should round and clamp a number to the levels', () => {
      expect(normalizeStrength(2.4, 5)).toEqual({ score: 2, warning: undefined, suggestions: undefined })
      expect(normalizeStrength(9, 5).score).toBe(4)
      expect(normalizeStrength(-3, 5).score).toBe(0)
    })

    it('should keep the warning and suggestions of an object and drop other fields', () => {
      expect(normalizeStrength({
        score: 3, warning: 'w', suggestions: ['s'], extra: 1
      }, 5)).toEqual({ score: 3, warning: 'w', suggestions: ['s'] })
    })

    it('should return null for anything without a finite score', () => {
      for (const raw of [null, undefined, 'x', Number.NaN, {}, { score: '3' }, { score: Infinity }]) {
        expect(normalizeStrength(raw, 5)).toBeNull()
      }
    })
  })

  describe('createStrengthEvaluator', () => {
    const create = (overrides = {}) => {
      const events = []
      const evaluator = createStrengthEvaluator({
        debounce: () => 20,
        levelCount: () => 5,
        onBusy: busy => events.push(['busy', busy]),
        onResult: (result, password) => events.push(['result', result && result.score, password]),
        scorer: () => null,
        scoring: () => ({ minLength: 8 }),
        userInputs: () => [],
        ...overrides
      })
      return { events, evaluator }
    }

    it('should score with the built-in scorer without a busy state', () => {
      const { events, evaluator } = create()

      evaluator.evaluate('abc')

      expect(events).toEqual([['busy', false], ['result', 1, 'abc']])
    })

    it('should report no result for an empty password at once, even when scheduled', () => {
      const { events, evaluator } = create()

      evaluator.schedule('')

      expect(events).toEqual([['busy', false], ['result', null, '']])
    })

    it('should wait for the debounce before it scores a scheduled password', async () => {
      const { events, evaluator } = create()

      evaluator.schedule('a')
      evaluator.schedule('abc')

      expect(events).toEqual([])
      await wait(40)
      expect(events).toEqual([['busy', false], ['result', 1, 'abc']])
    })

    it('should score at once with a debounce of 0', () => {
      const { events, evaluator } = create({ debounce: () => 0 })

      evaluator.schedule('abc')

      expect(events).toEqual([['busy', false], ['result', 1, 'abc']])
    })

    it('should pass the cleaned user inputs read on every evaluation to the scorer', () => {
      const seen = []
      let inputs = ['john', '', null, 5]
      const { evaluator } = create({
        scorer: () => (password, userInputs) => {
          seen.push(userInputs)
          return 2
        },
        userInputs: () => inputs
      })

      evaluator.evaluate('a')
      inputs = 'not a list'
      evaluator.evaluate('b')

      expect(seen).toEqual([['john', '5'], []])
    })

    it('should report no result when the scorer throws', () => {
      const { events, evaluator } = create({
        scorer: () => () => {
          throw new Error('broken')
        }
      })

      evaluator.evaluate('abc')

      expect(events).toEqual([['busy', false], ['result', null, 'abc']])
    })

    it('should show the busy state while a promise is pending and report what it resolves to', async () => {
      const { events, evaluator } = create({ scorer: () => () => Promise.resolve(3) })

      evaluator.evaluate('abc')

      expect(events).toEqual([['busy', true]])
      await Promise.resolve()
      expect(events).toEqual([['busy', true], ['busy', false], ['result', 3, 'abc']])
    })

    it('should report no result when the promise rejects', async () => {
      const { events, evaluator } = create({ scorer: () => () => Promise.reject(new Error('offline')) })

      evaluator.evaluate('abc')
      await Promise.resolve()
      await Promise.resolve()

      expect(events).toEqual([['busy', true], ['busy', false], ['result', null, 'abc']])
    })

    for (const [title, act] of [
      ['a schedule', evaluator => evaluator.schedule('abc')],
      ['an evaluation', evaluator => evaluator.evaluate('')],
      ['a cancel', evaluator => evaluator.cancel()]
    ]) {
      for (const [settle, outcome] of [['answer', resolve => resolve(4)], ['rejection', (_resolve, reject) => reject(new Error('offline'))]]) {
        it(`should drop the ${settle} of a pending evaluation after ${title}`, async () => {
          const settlers = []
          const { events, evaluator } = create({
            scorer: () => () => new Promise((resolve, reject) => {
              settlers.push([resolve, reject])
            })
          })

          evaluator.evaluate('Correct-horse-1')
          act(evaluator)
          const before = [...events]
          outcome(...settlers[0])
          await Promise.resolve()
          await Promise.resolve()

          expect(events).toEqual(before)
        })
      }
    }

    it('should stay usable after a cancel', async () => {
      const { events, evaluator } = create()

      evaluator.schedule('abc')
      evaluator.cancel()
      await wait(40)

      expect(events).toEqual([])

      evaluator.evaluate('abc')

      expect(events).toEqual([['busy', false], ['result', 1, 'abc']])
    })
  })
})

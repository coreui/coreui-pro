export type PasswordStrengthResult = { score: number, warning?: string, suggestions?: string[] }

export type PasswordStrengthScorer = (password: string, userInputs: string[]) => unknown

export type PasswordStrengthScoring = {
  minLength: number
  thresholds?: number[]
  weights?: Record<string, number>
}

export const PASSWORD_STRENGTH_THRESHOLDS: number[] = [2, 4, 6]

export const PASSWORD_STRENGTH_WEIGHTS: Record<string, number> = {
  minLength: 1,
  extraLength: 1,
  longPassword: 1,
  lowercase: 1,
  uppercase: 1,
  numbers: 1,
  special: 1,
  multipleSpecial: 1
}

const RULES: Record<string, (password: string, minLength: number) => boolean> = {
  minLength: (password, minLength) => password.length >= minLength,
  extraLength: (password, minLength) => password.length >= minLength + 4,
  longPassword: password => password.length >= 16,
  lowercase: password => /[a-z]/.test(password),
  uppercase: password => /[A-Z]/.test(password),
  numbers: password => /\d/.test(password),
  special: password => /[^\w\s]/.test(password),
  multipleSpecial: password => /[^\w\s].*[^\w\s]/.test(password)
}

/**
 * Scores a password by the rules the built-in scorer knows: length and character classes, each
 * worth its weight in points, with the points split into levels by the thresholds. A password
 * that contains one of the user's own inputs of three characters or more scores 0. It counts
 * rules, it does not estimate how guessable the password is.
 *
 * @param password - The password to score.
 * @param userInputs - Values the password must not contain, such as the user's name or email.
 * @param scoring - `minLength` for the length rules; `weights` and `thresholds` override the
 * defaults rule by rule and step by step, and a missing or non-finite entry keeps the default.
 * @returns The score: 0 for a password with a user input in it, else 1 to 4.
 */
export const scorePassword = (password: string, userInputs: string[], scoring: PasswordStrengthScoring): PasswordStrengthResult => {
  const lowered = password.toLowerCase()

  if (userInputs.some(input => input.trim().length >= 3 && lowered.includes(input.trim().toLowerCase()))) {
    return { score: 0 }
  }

  let points = 0

  for (const [rule, test] of Object.entries(RULES)) {
    if (test(password, scoring.minLength)) {
      const weight = scoring.weights?.[rule]
      points += Number.isFinite(weight) ? weight! : PASSWORD_STRENGTH_WEIGHTS[rule]
    }
  }

  const steps = PASSWORD_STRENGTH_THRESHOLDS.map((threshold, index) => {
    const step = scoring.thresholds?.[index]
    return Number.isFinite(step) ? step! : threshold
  })
  const level = steps.findIndex(step => points <= step)

  return { score: level === -1 ? 4 : level + 1 }
}

/**
 * Reads what a scorer returned: a number, or an object with a numeric `score` and an optional
 * `warning` and `suggestions`. The score is rounded and kept within the levels.
 *
 * @param raw - The scorer's answer.
 * @param levelCount - How many levels the component shows.
 * @returns The result, or `null` when the answer has no finite score.
 */
export const normalizeStrength = (raw: unknown, levelCount: number): PasswordStrengthResult | null => {
  const result = typeof raw === 'number' ? { score: raw } : raw as Partial<PasswordStrengthResult> | null

  if (!result || typeof result !== 'object' || !Number.isFinite(result.score)) {
    return null
  }

  return {
    score: Math.max(0, Math.min(levelCount - 1, Math.round(result.score!))),
    warning: result.warning,
    suggestions: result.suggestions
  }
}

export type PasswordStrengthEvaluatorOptions = {
  debounce: () => number
  levelCount: () => number
  onBusy: (busy: boolean) => void
  onResult: (result: PasswordStrengthResult | null, password: string) => void
  scorer: () => PasswordStrengthScorer | null | undefined
  scoring: () => PasswordStrengthScoring
  userInputs: () => unknown
}

export type PasswordStrengthEvaluator = {
  cancel: () => void
  evaluate: (password: string) => void
  schedule: (password: string) => void
}

/**
 * Evaluates passwords one after another and reports only the latest. Each `schedule`,
 * `evaluate` and `cancel` makes any evaluation still waiting on an asynchronous scorer stale, so
 * its answer or rejection is dropped without a call to `onBusy` or `onResult`. `debounce` is read
 * when an evaluation is scheduled and the other getters when it runs, so the caller can pass
 * getters over its current props or config.
 *
 * @param options - `debounce`, `levelCount`, `scorer`, `scoring` and `userInputs` as getters;
 * `onBusy(true)` is called when an asynchronous scorer starts and `onBusy(false)` before every
 * reported result; `onResult` gets the result of the latest evaluation, `null` for an empty
 * password, a failed scorer or an answer without a finite score.
 * @returns `schedule(password)` evaluates after the debounce, or at once for an empty password or
 * a debounce of 0; `evaluate(password)` evaluates at once; `cancel()` drops a pending evaluation
 * and leaves the evaluator usable.
 */
export const createStrengthEvaluator = (options: PasswordStrengthEvaluatorOptions): PasswordStrengthEvaluator => {
  let token = 0
  let timeout: ReturnType<typeof setTimeout> | undefined

  const cancel = () => {
    token += 1
    clearTimeout(timeout)
  }

  const evaluate = (password: string) => {
    cancel()
    const current = token
    const report = (raw: unknown) => {
      if (current === token) {
        options.onBusy(false)
        options.onResult(normalizeStrength(raw, options.levelCount()), password)
      }
    }

    if (!password) {
      report(null)
      return
    }

    const inputs = options.userInputs()
    const userInputs = Array.isArray(inputs) ? inputs.filter(Boolean).map(String) : []
    const scorer = options.scorer()
    let raw: unknown

    try {
      raw = typeof scorer === 'function' ? scorer(password, userInputs) : scorePassword(password, userInputs, options.scoring())
    } catch {
      raw = null
    }

    if (typeof (raw as Promise<unknown> | null)?.then !== 'function') {
      report(raw)
      return
    }

    const pending = raw as Promise<unknown>

    options.onBusy(true)
    pending.then(report, () => report(null))
  }

  return {
    cancel,
    evaluate,
    schedule(password) {
      cancel()

      if (password && options.debounce() > 0) {
        timeout = setTimeout(() => evaluate(password), options.debounce())
        return
      }

      evaluate(password)
    }
  }
}

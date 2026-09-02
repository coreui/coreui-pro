/**
 * --------------------------------------------------------------------------
 * CoreUI password-strength.js
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 *
 * This component is a modified version of the Bootstrap's strength.ts
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { defineJQueryPlugin } from './util/index.js'

/**
 * Constants
 */

const NAME = 'password-strength'
const DATA_KEY = 'coreui.password-strength'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CHANGE = `change${EVENT_KEY}`

const CLASS_NAME_BUSY = 'password-strength-busy'
const CLASS_NAME_FEEDBACK = 'password-strength-feedback'
const CLASS_NAME_METER = 'password-strength-meter'
const CLASS_NAME_PASSWORD_STRENGTH = 'password-strength'
const CLASS_NAME_SEGMENT = 'password-strength-segment'
const CLASS_NAME_SUGGESTIONS = 'password-strength-suggestions'
const CLASS_NAME_TEXT = 'password-strength-text'
const CLASS_NAME_WARNING = 'password-strength-warning'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="password-strength"]'
// Password Input switches `type` to reveal the value, so a field paired with it
// is only sometimes `type="password"`. Its toggle attribute is not, which keeps
// the pairing findable while the password is visible.
const SELECTOR_PASSWORD = 'input[type="password"], input[data-coreui-toggle="password-input"]'

type StrengthResult = number | { score: number, warning?: string, suggestions?: string[] }

interface PasswordStrengthConfig {
  busyLabel: string
  debounce: number
  input: string | HTMLInputElement | null
  levels: string[]
  minLength: number
  scorer: ((password: string, userInputs: string[]) => StrengthResult | Promise<StrengthResult>) | null
  thresholds: number[]
  userInputs: string[] | (() => string[])
  weights: Record<string, number>
}

const Default: PasswordStrengthConfig = {
  busyLabel: 'Checking…',
  debounce: 200,
  input: null,
  levels: ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'],
  minLength: 8,
  scorer: null,
  thresholds: [2, 4, 6],
  userInputs: [],
  weights: {
    minLength: 1,
    extraLength: 1,
    longPassword: 1,
    lowercase: 1,
    uppercase: 1,
    numbers: 1,
    special: 1,
    multipleSpecial: 1
  }
}

const DefaultType = {
  busyLabel: 'string',
  debounce: 'number',
  input: '(string|element|null)',
  levels: 'array',
  minLength: 'number',
  scorer: '(function|null)',
  thresholds: 'array',
  userInputs: '(array|function)',
  weights: 'object'
}

const isThenable = (value: unknown): value is Promise<StrengthResult> =>
  Boolean(value) && typeof (value as Promise<StrengthResult>).then === 'function'

/**
 * Class definition
 */

class PasswordStrength extends BaseComponent {
  protected declare _config: PasswordStrengthConfig
  private _input: HTMLInputElement | null = null
  private _meterElement: HTMLElement | null = null
  private _textElement: HTMLElement | null = null
  private _warningElement: HTMLElement | null = null
  private _suggestionsElement: HTMLElement | null = null
  private _segments: HTMLElement[] = []
  private _score: number | null = null
  private _timeout: ReturnType<typeof setTimeout> | null = null
  // Every evaluation takes the next token. A resolved scorer whose token is no
  // longer the current one answered a password the field has already replaced.
  private _token = 0

  constructor(element: string | Element, config?: Partial<PasswordStrengthConfig>) {
    super(element, config)

    this._input = this._getInput()
    this._createMeter()

    if (this._input) {
      EventHandler.on(this._input, 'input', () => this._schedule())
      EventHandler.on(this._input, 'change', () => this._schedule())
      this._evaluate()
    }
  }

  // Getters
  static override get Default(): typeof Default {
    return Default
  }

  static override get DefaultType(): typeof DefaultType {
    return DefaultType
  }

  static override get NAME(): string {
    return NAME
  }

  // Public
  getScore(): number | null {
    return this._score
  }

  evaluate(): void {
    this._evaluate()
  }

  override dispose(): void {
    if (this._timeout) {
      clearTimeout(this._timeout)
    }

    if (this._input) {
      EventHandler.off(this._input, 'input')
      EventHandler.off(this._input, 'change')
    }

    this._meterElement?.remove()
    SelectorEngine.findOne(`.${CLASS_NAME_FEEDBACK}`, this._element)?.remove()
    this._element.classList.remove(CLASS_NAME_PASSWORD_STRENGTH, CLASS_NAME_BUSY)

    super.dispose()
  }

  // Private
  _getInput(): HTMLInputElement | null {
    if (this._config.input) {
      return typeof this._config.input === 'string' ?
        SelectorEngine.findOne<HTMLInputElement>(this._config.input) :
        this._config.input
    }

    const parent = this._element.parentElement

    return parent ? SelectorEngine.findOne<HTMLInputElement>(SELECTOR_PASSWORD, parent) : null
  }

  _createMeter(): void {
    this._element.classList.add(CLASS_NAME_PASSWORD_STRENGTH)

    const meter = document.createElement('div')
    meter.classList.add(CLASS_NAME_METER)
    // The bar restates the label, so a screen reader that reads both hears the
    // same verdict twice.
    meter.setAttribute('aria-hidden', 'true')

    for (let index = 0; index < this._config.levels.length - 1; index++) {
      const segment = document.createElement('span')
      segment.classList.add(CLASS_NAME_SEGMENT)
      meter.append(segment)
      this._segments.push(segment)
    }

    const feedback = document.createElement('div')
    feedback.classList.add(CLASS_NAME_FEEDBACK)
    feedback.setAttribute('role', 'status')
    feedback.setAttribute('aria-live', 'polite')

    this._textElement = document.createElement('span')
    this._textElement.classList.add(CLASS_NAME_TEXT)

    this._warningElement = document.createElement('span')
    this._warningElement.classList.add(CLASS_NAME_WARNING)

    this._suggestionsElement = document.createElement('ul')
    this._suggestionsElement.classList.add(CLASS_NAME_SUGGESTIONS)

    feedback.append(this._textElement, this._warningElement, this._suggestionsElement)

    this._meterElement = meter
    this._element.append(meter, feedback)
  }

  _schedule(): void {
    if (this._timeout) {
      clearTimeout(this._timeout)
    }

    if (this._config.debounce > 0) {
      this._timeout = setTimeout(() => this._evaluate(), this._config.debounce)
      return
    }

    this._evaluate()
  }

  _evaluate(): void {
    const password = this._input ? this._input.value : ''
    this._token += 1
    const token = this._token

    if (!password) {
      this._setBusy(false)
      this._apply(null, '')
      return
    }

    const userInputs = this._getUserInputs()

    if (typeof this._config.scorer !== 'function') {
      this._setBusy(false)
      this._apply(this._builtInScore(password, userInputs), password)
      return
    }

    let result

    try {
      result = this._config.scorer(password, userInputs)
    } catch {
      this._setBusy(false)
      this._apply(null, password)
      return
    }

    if (!isThenable(result)) {
      this._setBusy(false)
      this._apply(this._normalize(result), password)
      return
    }

    // Only an async scorer gets the pending state; a sync one would flash it.
    this._setBusy(true)

    result.then(
      value => {
        if (token !== this._token) {
          return
        }

        this._setBusy(false)
        this._apply(this._normalize(value), password)
      },
      () => {
        if (token !== this._token) {
          return
        }

        this._setBusy(false)
        this._apply(null, password)
      }
    )
  }

  _getUserInputs(): string[] {
    const { userInputs } = this._config
    const values = typeof userInputs === 'function' ? userInputs() : userInputs

    return Array.isArray(values) ? values.filter(Boolean).map(String) : []
  }

  _normalize(result: unknown): { score: number, warning?: string, suggestions?: string[] } | null {
    if (typeof result === 'number' && Number.isFinite(result)) {
      return { score: this._clamp(result) }
    }

    if (result && typeof result === 'object') {
      const { score, warning, suggestions } = result as { score: unknown, warning?: string, suggestions?: string[] }

      if (typeof score === 'number' && Number.isFinite(score)) {
        return { score: this._clamp(score), warning, suggestions }
      }
    }

    return null
  }

  _clamp(score: number): number {
    return Math.max(0, Math.min(this._config.levels.length - 1, Math.round(score)))
  }

  // A rule check, not a strength measurement: it counts character classes and
  // length, which says nothing about how guessable the password actually is.
  _builtInScore(password: string, userInputs: string[]): { score: number } {
    const lowered = password.toLowerCase()

    for (const value of userInputs) {
      const needle = value.trim().toLowerCase()

      if (needle.length >= 3 && lowered.includes(needle)) {
        return { score: 0 }
      }
    }

    const { minLength, weights } = this._config
    let points = 0

    if (password.length >= minLength) {
      points += weights.minLength
    }

    if (password.length >= minLength + 4) {
      points += weights.extraLength
    }

    if (password.length >= 16) {
      points += weights.longPassword
    }

    if (/[a-z]/.test(password)) {
      points += weights.lowercase
    }

    if (/[A-Z]/.test(password)) {
      points += weights.uppercase
    }

    if (/\d/.test(password)) {
      points += weights.numbers
    }

    if (/[^\w\s]/.test(password)) {
      points += weights.special
    }

    if (/[^\w\s].*[^\w\s]/.test(password)) {
      points += weights.multipleSpecial
    }

    const [weak, fair, good] = this._config.thresholds

    if (points <= weak) {
      return { score: 1 }
    }

    if (points <= fair) {
      return { score: 2 }
    }

    if (points <= good) {
      return { score: 3 }
    }

    return { score: 4 }
  }

  _setBusy(busy: boolean): void {
    this._element.classList.toggle(CLASS_NAME_BUSY, busy)

    if (busy && this._textElement) {
      this._textElement.textContent = this._config.busyLabel
    }
  }

  _apply(result: { score: number, warning?: string, suggestions?: string[] } | null, password: string): void {
    const score = result ? result.score : null
    const changed = score !== this._score

    this._score = score
    this._render(result)

    if (!changed) {
      return
    }

    EventHandler.trigger(this._element, EVENT_CHANGE, {
      score,
      level: score === null ? null : this._config.levels[score],
      password: password.length > 0 ? '***' : ''
    })
  }

  _render(result: { score: number, warning?: string, suggestions?: string[] } | null): void {
    const score = result ? result.score : null

    if (score === null) {
      delete this._element.dataset.coreuiStrength
    } else {
      this._element.dataset.coreuiStrength = String(score)
    }

    for (const [index, segment] of this._segments.entries()) {
      segment.classList.toggle('active', score !== null && index < score)
    }

    if (this._textElement) {
      this._textElement.textContent = score === null ? '' : this._config.levels[score]
    }

    if (this._warningElement) {
      this._warningElement.textContent = result?.warning ?? ''
    }

    if (this._suggestionsElement) {
      this._suggestionsElement.replaceChildren()

      for (const suggestion of result?.suggestions ?? []) {
        const item = document.createElement('li')
        item.textContent = suggestion
        this._suggestionsElement.append(item)
      }
    }
  }

  // Static
  static _initializeDataApi(): void {
    for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) {
      PasswordStrength.getOrCreateInstance(element)
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = PasswordStrength.getOrCreateInstance(this)

      data[config as string](this)
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
  PasswordStrength._initializeDataApi()
})

/**
 * jQuery
 */

defineJQueryPlugin(PasswordStrength)

export default PasswordStrength
export type { PasswordStrengthConfig, StrengthResult }

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
import {
  defineJQueryPlugin, jQueryDispatch
} from './util/index.js'
import {
  createStrengthEvaluator, PASSWORD_STRENGTH_THRESHOLDS, PASSWORD_STRENGTH_WEIGHTS,
  type PasswordStrengthEvaluator, type PasswordStrengthResult
} from './util/password-strength.js'

/**
 * Constants
 */

const NAME = 'password-strength'
const DATA_KEY = 'coreui.password-strength'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`

const CLASS_NAME_BUSY = 'password-strength-busy'
const CLASS_NAME_FEEDBACK = 'password-strength-feedback'
const CLASS_NAME_METER = 'password-strength-meter'
const CLASS_NAME_PASSWORD_STRENGTH = 'password-strength'
const CLASS_NAME_SEGMENT = 'password-strength-segment'
const CLASS_NAME_SUGGESTIONS = 'password-strength-suggestions'
const CLASS_NAME_TEXT = 'password-strength-text'
const CLASS_NAME_WARNING = 'password-strength-warning'

const SELECTOR_DATA_PASSWORD_STRENGTH = '[data-coreui-password-strength]'
// Password Input switches `type` to reveal the value, so a field paired with it
// is only sometimes `type="password"`. Its toggle attribute is not, which keeps
// the pairing findable while the password is visible.
const SELECTOR_PASSWORD = 'input[type="password"], input[data-coreui-password-input]'

type StrengthResult = number | { score: number, warning?: string, suggestions?: string[] }

interface PasswordStrengthConfig {
  busyLabel: string
  debounce: number
  input: string | Element | null
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
  thresholds: [...PASSWORD_STRENGTH_THRESHOLDS],
  userInputs: [],
  weights: { ...PASSWORD_STRENGTH_WEIGHTS }
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
  private _evaluator: PasswordStrengthEvaluator
  private _value = ''

  constructor(element: string | Element, config?: Partial<PasswordStrengthConfig>) {
    super(element, config)

    this._input = this._getInput()
    this._createMeter()
    this._evaluator = createStrengthEvaluator({
      debounce: () => this._config.debounce,
      levelCount: () => this._config.levels.length,
      onBusy: busy => this._setBusy(busy),
      onResult: (result, password) => this._apply(result, password),
      scorer: () => this._config.scorer,
      scoring: () => this._config,
      userInputs: () => (typeof this._config.userInputs === 'function' ? this._config.userInputs() : this._config.userInputs)
    })

    if (this._input) {
      EventHandler.on(this._input, EVENT_INPUT, () => this._schedule())
      EventHandler.on(this._input, EVENT_CHANGE, () => this._schedule())
      this.evaluate()
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
    this._value = this._input ? this._input.value : ''
    this._evaluator.evaluate(this._value)
  }

  override dispose(): void {
    this._evaluator.cancel()

    if (this._input) {
      EventHandler.off(this._input, EVENT_KEY)
    }

    this._meterElement?.remove()
    SelectorEngine.findOne(`.${CLASS_NAME_FEEDBACK}`, this._element)?.remove()
    this._element.classList.remove(CLASS_NAME_BUSY)

    super.dispose()
  }

  // Private
  _getInput(): HTMLInputElement | null {
    if (this._config.input) {
      return typeof this._config.input === 'string' ?
        SelectorEngine.findOne<HTMLInputElement>(this._config.input) :
        this._config.input as HTMLInputElement
    }

    const parent = this._element.parentElement

    return parent ? SelectorEngine.findOne<HTMLInputElement>(SELECTOR_PASSWORD, parent) : null
  }

  _schedule(): void {
    if (this._input!.value === this._value) {
      return
    }

    this._value = this._input!.value
    this._evaluator.schedule(this._value)
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

  _setBusy(busy: boolean): void {
    this._element.classList.toggle(CLASS_NAME_BUSY, busy)

    if (busy && this._textElement) {
      this._textElement.textContent = this._config.busyLabel
    }
  }

  _apply(result: PasswordStrengthResult | null, password: string): void {
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

  _render(result: PasswordStrengthResult | null): void {
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
    for (const element of SelectorEngine.find(SELECTOR_DATA_PASSWORD_STRENGTH)) {
      PasswordStrength.getOrCreateInstance(element)
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, PasswordStrength, config, element => [element])
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

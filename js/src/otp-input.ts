/**
 * --------------------------------------------------------------------------
 * CoreUI PRO password-input.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { defineJQueryPlugin, getNextActiveElement, isRTL } from './util/index.js'

/**
 * Constants
 */

const NAME = 'otp-input'
const DATA_KEY = 'coreui.otp-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const ARROW_RIGHT_KEY = 'ArrowRight'
const ARROW_LEFT_KEY = 'ArrowLeft'
const BACKSPACE_KEY = 'Backspace'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_COMPLETE = `complete${EVENT_KEY}`
const EVENT_FOCUS = `focus${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_PASTE = `paste`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_FORM_OTP_CONTROL = '.form-otp-control'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="otp"]'

/**
 * Types
 */

type OtpInputConfig = {
  ariaLabel: (index: number, total: number) => string
  autoSubmit: boolean
  disabled: boolean
  id: string | null
  linear: boolean
  masked: boolean
  name: string | null
  placeholder: string | null
  readonly: boolean
  required: boolean
  type: string
  value: string | null
}

const Default: OtpInputConfig = {
  ariaLabel: (index: number, total: number) => `Digit ${index + 1} of ${total}`,
  autoSubmit: false,
  disabled: false,
  id: null,
  linear: true,
  masked: false,
  name: null,
  placeholder: null,
  readonly: false,
  required: false,
  type: 'number',
  value: null
}

const DefaultType = {
  ariaLabel: 'function',
  autoSubmit: 'boolean',
  disabled: 'boolean',
  id: '(string|null)',
  linear: 'boolean',
  masked: 'boolean',
  name: '(string|null)',
  placeholder: '(number|string|null)',
  readonly: 'boolean',
  required: 'boolean',
  type: 'string',
  value: '(number|string|null)'
}

/**
 * Class definition
 */

class OTPInput extends BaseComponent {
  protected declare _inputElement: HTMLInputElement | null

  constructor(element?: string | Element | null, config?: Partial<OtpInputConfig> | null) {
    super(element, config)

    this._config = this._getConfig(config)
    this._inputElement = null

    this._createHiddenInput()
    this._setRoleAttribute()
    this._setInputsAttributes()
    this._setInputsTabIndexes()
    this._addEventListeners()
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
  clear(): void {
    const inputs = this._getInputs()
    for (const input of inputs) {
      input.value = ''
    }

    this._setHiddenInputValue(null)
    this._syncFirstInputMaxLength()
    this._setInputsTabIndexes()
  }

  reset(): void {
    const inputs = this._getInputs()
    for (const [index, input] of inputs.entries()) {
      const valueString = String(this._config.value || '')

      input.value = valueString && valueString[index] ? valueString[index] : ''
    }

    this._setHiddenInputValue(null)
    this._syncFirstInputMaxLength()
    this._setInputsTabIndexes()
  }

  update(config: any): void {
    if (typeof config !== 'object') {
      return
    }

    this._config = { ...this._config, ...config }
    this._typeCheckConfig(this._config)

    this._setInputsAttributes()
    this._setInputsTabIndexes()
    this._inputElement!.remove()
    this._createHiddenInput()
  }

  // Private
  _addEventListeners(): void {
    EventHandler.on(this._element, EVENT_FOCUS, SELECTOR_FORM_OTP_CONTROL, event => {
      const { target } = event as unknown as { target: HTMLInputElement }

      if (target!.value) {
        setTimeout(() => {
          target!.select()
        }, 0)

        return
      }

      if (this._config.linear) {
        const inputs = this._getInputs()
        const firstEmptyInput = inputs.find((input: HTMLInputElement) => !input.value)
        if (firstEmptyInput && firstEmptyInput !== target) {
          firstEmptyInput.focus()
        }
      }
    })

    EventHandler.on(this._element, EVENT_INPUT, SELECTOR_FORM_OTP_CONTROL, event => {
      const { target } = event as unknown as { target: HTMLInputElement }

      // SMS autofill, password managers, dictation and IME commits insert the
      // whole code at once and fire `input`, not `paste`. Spread it across the
      // slots instead of leaving it in one of them.
      if (target!.value.length > 1) {
        const chars = this._extractValidChars(target!.value)
        target!.value = ''

        if (chars) {
          this._distributeChars(target as HTMLInputElement, chars)
        }

        return
      }

      if (target!.value.length === 1 && !this._isValidInput(target!.value)) {
        target!.value = ''
        return
      }

      const inputs = this._getInputs()

      if (!inputs.length) {
        return
      }

      this._setHiddenInputValue(inputs.map((input: HTMLInputElement) => input.value).join(''))

      if (target!.value.length === 1) {
        const nextInput = getNextActiveElement(inputs, target as HTMLInputElement, true)
        if (nextInput) {
          nextInput.focus()
        }
      }

      this._setInputsTabIndexes()
      this._checkAutoSubmit(inputs)
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, SELECTOR_FORM_OTP_CONTROL, event => {
      const { key, target } = event as unknown as { key: string, target: HTMLInputElement }

      if (key === BACKSPACE_KEY && target!.value === '') {
        const inputs = this._getInputs()

        if (!inputs.length) {
          return
        }

        getNextActiveElement(inputs, target as HTMLInputElement, false).focus()

        const currentValue = inputs.map((input: HTMLInputElement) => input.value).join('')

        this._setHiddenInputValue(currentValue)
        this._setInputsTabIndexes()
        return
      }

      if (key === ARROW_RIGHT_KEY) {
        if (this._config.linear && target!.value === '') {
          return
        }

        const inputs = this._getInputs()

        if (!inputs.length) {
          return
        }

        // In RTL mode, right arrow moves to previous input, in LTR mode it moves to next input
        const shouldMoveNext = !isRTL()
        getNextActiveElement(inputs, target, shouldMoveNext).focus()

        return
      }

      if (key === ARROW_LEFT_KEY) {
        const inputs = this._getInputs()

        if (!inputs.length) {
          return
        }

        // In RTL mode, left arrow moves to next input, in LTR mode it moves to previous input
        const shouldMoveNext = isRTL()
        getNextActiveElement(inputs, target, shouldMoveNext).focus()
      }
    })

    EventHandler.on(this._element, EVENT_PASTE, SELECTOR_FORM_OTP_CONTROL, event => {
      event.preventDefault()
      const pastedData = event.clipboardData.getData('text')
      const validChars = this._extractValidChars(pastedData)

      if (!validChars) {
        return
      }

      this._distributeChars(event.target as HTMLInputElement, validChars)
    })
  }

  // Write `chars` across the slots starting at `startInput`, then sync focus,
  // the hidden form value and auto-submit. Shared by paste and by multi-character
  // `input` events.
  _distributeChars(startInput: HTMLInputElement, chars: string): void {
    const inputs = this._getInputs()

    if (!inputs.length) {
      return
    }

    // A value at least as long as the field is a complete code: fill from the
    // first slot, whichever slot happens to be focused.
    const startIndex = chars.length >= inputs.length ? 0 : Math.max(inputs.indexOf(startInput), 0)

    for (let i = 0; i < chars.length && (startIndex + i) < inputs.length; i++) {
      inputs[startIndex + i].value = chars[i]
    }

    // Focus the next empty input or the last filled one
    const nextEmptyIndex = startIndex + chars.length
    inputs[nextEmptyIndex < inputs.length ? nextEmptyIndex : inputs.length - 1].focus()

    // Read the value back from the slots so already-filled ones are preserved.
    this._setHiddenInputValue(inputs.map((input: HTMLInputElement) => input.value).join(''))
    this._syncFirstInputMaxLength()
    this._setInputsTabIndexes()
    this._checkAutoSubmit(inputs)
  }

  // An empty first slot is where autofill lands, so it has to accept the whole
  // code; once it holds a character it behaves like every other slot.
  _syncFirstInputMaxLength(): void {
    const inputs = this._getInputs()
    const [first] = inputs

    if (first) {
      first.maxLength = first.value ? 1 : inputs.length
    }
  }

  _checkAutoSubmit(inputs: HTMLInputElement[]): void {
    if (!this._config.autoSubmit) {
      return
    }

    // Check if all inputs are filled
    const allFilled = inputs.every((input: HTMLInputElement) => input.value.length === 1)

    if (allFilled) {
      // Find the closest form element
      const form = this._element.closest('form')
      if (form && typeof form.requestSubmit === 'function') {
        form.requestSubmit()
      }
    }
  }

  _getInputs(): HTMLInputElement[] {
    return SelectorEngine.find<HTMLInputElement>(SELECTOR_FORM_OTP_CONTROL, this._element)
  }

  _createHiddenInput(): void {
    const hiddenInput = document.createElement('input')
    hiddenInput.type = 'hidden'

    if (this._config.disabled) {
      hiddenInput.disabled = true
    }

    if (this._config.id) {
      hiddenInput.id = this._config.id
    }

    if (this._config.name) {
      hiddenInput.name = this._config.name
    }

    hiddenInput.value = this._config.value || ''

    this._element.append(hiddenInput)
    this._inputElement = hiddenInput
  }

  _extractValidChars(text: string): string {
    switch (this._config.type) {
      case 'number': {
        return text.replace(/\D/g, '')
      }

      default: {
        return text // Allow all characters for unknown types
      }
    }
  }

  _isValidInput(value: string): boolean {
    if (value.length !== 1) {
      return false
    }

    switch (this._config.type) {
      case 'number': {
        return /^\d$/.test(value)
      }

      default: {
        return /^.$/s.test(value) // Allow any single character for unknown types
      }
    }
  }

  _setHiddenInputValue(value: string | null): void {
    if (this._inputElement) {
      this._inputElement.value = value || ''
    }

    EventHandler.trigger(this._element, EVENT_CHANGE, { value })

    if (value && value.length === this._getInputs().length) {
      EventHandler.trigger(this._element, EVENT_COMPLETE, { value })
    }
  }

  _setInputsAttributes(): void {
    const inputs = SelectorEngine.find<HTMLInputElement>(SELECTOR_FORM_OTP_CONTROL, this._element)
    for (const [index, input] of inputs.entries()) {
      input.type = this._config.masked ? 'password' : 'text'

      input.maxLength = 1
      // Only the first slot advertises the one-time code, so SMS autofill and
      // password managers target a single field instead of every slot.
      input.autocomplete = index === 0 ? 'one-time-code' : 'off'
      input.autocapitalize = 'off'
      input.setAttribute('autocorrect', 'off')
      input.spellcheck = false
      input.enterKeyHint = index === inputs.length - 1 ? 'done' : 'next'

      if (this._config.placeholder !== null) {
        const placeholder = String(this._config.placeholder)
        input.placeholder = placeholder.length > 1 ? placeholder[index] || '' : placeholder
      }

      input.required = this._config.required

      switch (this._config.type) {
        case 'number': {
          input.inputMode = 'numeric'
          input.pattern = '[0-9]*'
          break
        }

        default: {
          input.inputMode = 'text'
          input.pattern = '.*'
        }
      }

      if (this._config.disabled) {
        input.disabled = true
      }

      if (this._config.id) {
        input.id = `${this._config.id}-${index}`
      }

      if (this._config.name) {
        input.name = `${this._config.name}-${index}`
      }

      if (this._config.readonly) {
        input.readOnly = true
      }

      const valueString = String(this._config.value || '')

      if (valueString && valueString[index]) {
        input.value = valueString[index]
      }

      if (typeof this._config.ariaLabel === 'function') {
        const ariaLabel = this._config.ariaLabel(index, inputs.length)
        input.setAttribute('aria-label', ariaLabel as unknown as string)
      }
    }

    this._syncFirstInputMaxLength()
  }

  _setInputsTabIndexes(): void {
    if (!this._config.linear) {
      return
    }

    const inputs = this._getInputs()
    let foundEmpty = false

    for (const input of inputs) {
      const hasValue = input.value !== ''

      if (hasValue) {
        input.removeAttribute('tabindex')
      } else if (foundEmpty) {
        input.tabIndex = -1
      } else {
        // First empty input - should be tabbable
        input.removeAttribute('tabindex')
        foundEmpty = true
      }
    }
  }

  _setRoleAttribute(): any {
    this._element.setAttribute('role', 'group')
  }

  // Static
  static otpInputInterface(element: string | Element | null, config?: any): void {
    const data: any = OTPInput.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string]()
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = OTPInput.getOrCreateInstance(this)

      if (typeof config === 'string') {
        if (typeof data[config as string] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }

        data[config as string]()
      }
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const otp of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) {
    OTPInput.otpInputInterface(otp)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(OTPInput)

export default OTPInput
export type { OtpInputConfig }

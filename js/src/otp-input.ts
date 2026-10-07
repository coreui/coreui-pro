/**
 * --------------------------------------------------------------------------
 * CoreUI otp-input.js
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { getFeedbackIds } from './util/form-validation.js'
import {
  defineJQueryPlugin, getNextActiveElement, isRTL, jQueryDispatch
} from './util/index.js'

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

const EVENT_BEFORE_INPUT = `beforeinput${EVENT_KEY}`
const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_COMPLETE = `complete${EVENT_KEY}`
const EVENT_FOCUS = `focus${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_INVALID = `invalid${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_PASTE = `paste${EVENT_KEY}`
const EVENT_RESET = `reset${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_IS_INVALID = 'is-invalid'

const SELECTOR_DATA_OTP = '[data-coreui-otp]'
const SELECTOR_FORM_OTP_CONTROL = '.form-otp-control'
const SELECTOR_VALUE_FIELD = 'input:not(.form-otp-control)'

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
  placeholder: number | string | null
  readonly: boolean
  required: boolean
  type: string
  value: number | string | null
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
  protected declare _disabledSlots: Set<HTMLInputElement>
  protected declare _inputElement: HTMLInputElement | null
  protected declare _ownsInvalidClass: boolean
  protected declare _placeholders: Map<HTMLInputElement, string | null>
  protected declare _readOnlySlots: Set<HTMLInputElement>
  protected declare _reported: boolean
  protected declare _requiredSlots: Set<HTMLInputElement>
  protected declare _resetHandler: (event: Event) => void
  protected declare _slotAria: Map<HTMLInputElement, { describedBy: string | null, invalid: string | null }>
  protected declare _validityObserver: MutationObserver | null

  constructor(element?: string | Element | null, config?: Partial<OtpInputConfig> | null) {
    super(element, config)

    this._config = this._getConfig(config)
    this._disabledSlots = new Set()
    this._inputElement = null
    this._ownsInvalidClass = false
    this._placeholders = new Map()
    this._readOnlySlots = new Set()
    this._reported = false
    this._requiredSlots = new Set()
    this._slotAria = new Map()
    this._validityObserver = null
    this._resetHandler = (event: Event) => {
      if (!(event.target as Node).contains(this._element)) {
        return
      }

      setTimeout(() => {
        if (this._element && !event.defaultPrevented) {
          this._reported = false
          this._syncValidity()
        }
      })
    }

    this._setRoleAttribute()
    this._setInputsAttributes()
    this._seedSlots()
    this._createValueField()
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

    this._setValue(null)
    this._syncFirstInputMaxLength()
    this._setInputsTabIndexes()
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    EventHandler.off(document, EVENT_RESET, this._resetHandler)
    this._validityObserver?.disconnect()
    this._inputElement?.remove()
    this._inputElement = null
    this._reported = false
    this._syncValidity()
    this._unmarkSlots()

    for (const input of this._requiredSlots) {
      input.removeAttribute('aria-required')
    }

    for (const input of this._disabledSlots) {
      input.disabled = false
    }

    for (const input of this._readOnlySlots) {
      input.readOnly = false
    }

    for (const input of this._placeholders.keys()) {
      this._restorePlaceholder(input)
    }

    super.dispose()
  }

  reset(): void {
    this._seedSlots({ clearWhenEmpty: true })
    this._setValue(this._readSlots() || null)
    this._setInputsTabIndexes()
  }

  setConfig(config: Partial<OtpInputConfig> | null): void {
    if (typeof config !== 'object' || config === null) {
      return
    }

    const previousValue = this._config.value
    this._config = this._getConfig({ ...this._config, ...config })
    const repaint = this._config.value !== previousValue

    this._setInputsAttributes()

    if (repaint) {
      this._seedSlots({ clearWhenEmpty: true })
    }

    this._setInputsTabIndexes()
    this._syncValueField()

    if (repaint) {
      this._setValue(this._readSlots() || null)
    }
  }

  // Private
  _addEventListeners(): void {
    EventHandler.on(this._element, EVENT_BEFORE_INPUT, SELECTOR_FORM_OTP_CONTROL, event => {
      const { data, inputType } = event as unknown as { data: string | null, inputType: string }

      if (inputType === 'insertText' && data && data.length === 1 && !this._isValidInput(data)) {
        event.preventDefault()
      }
    })

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
          return
        }
      }

      if (target!.value.length === 1 && !this._isValidInput(target!.value)) {
        target!.value = ''
      }

      const inputs = this._getInputs()

      if (!inputs.length) {
        return
      }

      const value = inputs.map((input: HTMLInputElement) => input.value).join('')

      if (value !== (this._inputElement ? this._inputElement.value : '')) {
        this._setValue(value)
      }

      if (target!.value.length === 1) {
        const nextInput = getNextActiveElement(inputs, target as HTMLInputElement, true)
        if (nextInput) {
          nextInput.focus()
        }
      }

      this._setInputsTabIndexes()
      this._syncFirstInputMaxLength()
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

        this._setInputsTabIndexes()
        return
      }

      if (key === ARROW_RIGHT_KEY || key === ARROW_LEFT_KEY) {
        const shouldMoveNext = (key === ARROW_RIGHT_KEY) !== isRTL(this._element)

        if (shouldMoveNext && this._config.linear && target!.value === '') {
          return
        }

        const inputs = this._getInputs()

        if (!inputs.length) {
          return
        }

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

    EventHandler.on(this._element, EVENT_FOCUS, SELECTOR_VALUE_FIELD, () => {
      const inputs = this._getInputs()
      const target = inputs.find(input => !input.value) ?? inputs[0]

      target?.focus()
    })

    EventHandler.on(this._element, EVENT_INVALID, SELECTOR_VALUE_FIELD, () => {
      this._reported = true
      this._syncValidity()
    })

    EventHandler.on(document, EVENT_RESET, this._resetHandler)

    this._validityObserver = new MutationObserver(() => this._syncValidity())
    this._validityObserver.observe(this._element, { attributeFilter: ['aria-invalid', 'class'], subtree: true })
  }

  // Write `chars` across the slots starting at `startInput`, then sync focus,
  // the form value and auto-submit. Shared by paste and by multi-character
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
    this._setValue(inputs.map((input: HTMLInputElement) => input.value).join(''))
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

  _readSlots(): string {
    return this._getInputs().map(input => input.value).join('')
  }

  _createValueField(): void {
    const valueField = document.createElement('input')
    valueField.type = 'text'
    valueField.autocomplete = 'off'
    valueField.tabIndex = -1
    valueField.setAttribute('aria-hidden', 'true')
    valueField.value = this._readSlots()

    this._element.append(valueField)
    this._inputElement = valueField
    this._syncValueField()
  }

  _syncValueField(): void {
    const valueField = this._inputElement!
    const inputs = this._getInputs()
    valueField.defaultValue = inputs.map(input => input.defaultValue).join('')
    valueField.disabled = this._config.disabled
    valueField.pattern = `${this._config.type === 'number' ? '[0-9]' : '.'}{${inputs.length}}`
    valueField.readOnly = this._config.readonly
    valueField.required = this._config.required

    for (const name of ['id', 'name'] as const) {
      if (this._config[name]) {
        valueField[name] = this._config[name]
      } else {
        valueField.removeAttribute(name)
      }
    }

    this._syncValidity()
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

  _setValue(value: string | null): void {
    if (this._inputElement) {
      const isChanged = this._inputElement.value !== (value || '')
      this._inputElement.value = value || ''

      if (isChanged) {
        this._inputElement.dispatchEvent(new Event('input', { bubbles: true }))
      }

      this._syncValidity()
    }

    EventHandler.trigger(this._element, EVENT_CHANGE, { value })

    if (value && value.length === this._getInputs().length) {
      EventHandler.trigger(this._element, EVENT_COMPLETE, { value })
    }
  }

  _syncValidity(): void {
    const isReported = this._reported && this._inputElement !== null && !this._inputElement.validity.valid

    if (isReported !== this._ownsInvalidClass && (!isReported || !this._element.classList.contains(CLASS_NAME_IS_INVALID))) {
      this._ownsInvalidClass = isReported
      this._element.classList.toggle(CLASS_NAME_IS_INVALID, isReported)
    }

    if (!isReported && !this._isMarkedInvalid()) {
      this._unmarkSlots()
      return
    }

    const feedbackIds = this._inputElement ? getFeedbackIds(this._inputElement) : []

    for (const input of this._getInputs()) {
      if (!this._slotAria.has(input)) {
        this._slotAria.set(input, { describedBy: input.getAttribute('aria-describedby'), invalid: input.getAttribute('aria-invalid') })
      }

      const ids = [...new Set([...(this._slotAria.get(input)!.describedBy ?? '').split(/\s+/), ...feedbackIds])].filter(Boolean)

      this._writeSlotAttribute(input, 'aria-describedby', ids.length > 0 ? ids.join(' ') : null)
      this._writeSlotAttribute(input, 'aria-invalid', 'true')
    }
  }

  _unmarkSlots(): void {
    for (const [input, { describedBy, invalid }] of this._slotAria) {
      this._writeSlotAttribute(input, 'aria-describedby', describedBy)
      this._writeSlotAttribute(input, 'aria-invalid', invalid)
    }

    this._slotAria.clear()
  }

  _isMarkedInvalid(): boolean {
    return this._element.getAttribute('aria-invalid') === 'true' ||
      (!this._ownsInvalidClass && this._element.classList.contains(CLASS_NAME_IS_INVALID)) ||
      this._getInputs().some(input => input.classList.contains(CLASS_NAME_IS_INVALID))
  }

  _writeSlotAttribute(input: HTMLInputElement, name: string, value: string | null): void {
    if (input.getAttribute(name) === value) {
      return
    }

    if (value === null) {
      input.removeAttribute(name)
    } else {
      input.setAttribute(name, value)
    }
  }

  _seedSlots({ clearWhenEmpty = false }: { clearWhenEmpty?: boolean } = {}): void {
    const value = this._extractValidChars(String(this._config.value ?? ''))

    if (!value && !clearWhenEmpty) {
      return
    }

    for (const [index, input] of this._getInputs().entries()) {
      input.value = value[index] ?? ''
    }

    this._syncFirstInputMaxLength()
  }

  _setInputsAttributes(): void {
    const inputs = this._getInputs()
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
        if (!this._placeholders.has(input)) {
          this._placeholders.set(input, input.getAttribute('placeholder'))
        }

        const placeholder = String(this._config.placeholder)
        input.placeholder = placeholder.length > 1 ? placeholder[index] || '' : placeholder
      } else if (this._placeholders.has(input)) {
        this._restorePlaceholder(input)
      }

      if (this._config.required && !input.hasAttribute('aria-required')) {
        input.setAttribute('aria-required', 'true')
        this._requiredSlots.add(input)
      } else if (!this._config.required && this._requiredSlots.delete(input)) {
        input.removeAttribute('aria-required')
      }

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

      this._setSlotFlag(input, 'disabled', this._config.disabled, this._disabledSlots)

      if (this._config.id && !input.id) {
        input.id = `${this._config.id}-${index}`
      }

      this._setSlotFlag(input, 'readOnly', this._config.readonly, this._readOnlySlots)

      if (typeof this._config.ariaLabel === 'function') {
        const ariaLabel = this._config.ariaLabel(index, inputs.length)
        input.setAttribute('aria-label', ariaLabel as unknown as string)
      }
    }

    this._syncFirstInputMaxLength()
  }

  _setSlotFlag(input: HTMLInputElement, flag: 'disabled' | 'readOnly', on: boolean, slots: Set<HTMLInputElement>): void {
    if (on && !input[flag]) {
      input[flag] = true
      slots.add(input)
    } else if (!on && slots.delete(input)) {
      input[flag] = false
    }
  }

  _restorePlaceholder(input: HTMLInputElement): void {
    const placeholder = this._placeholders.get(input)

    if (typeof placeholder === 'string') {
      input.placeholder = placeholder
    } else {
      input.removeAttribute('placeholder')
    }

    this._placeholders.delete(input)
  }

  _setInputsTabIndexes(): void {
    const inputs = this._getInputs()

    if (!this._config.linear) {
      for (const input of inputs) {
        input.removeAttribute('tabindex')
      }

      return
    }

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
  static otpInputInterface(element: string | Element | null, config?: any, ...args: any[]): void {
    const data: any = OTPInput.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string](...args)
    }
  }

  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, OTPInput, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  for (const otp of SelectorEngine.find(SELECTOR_DATA_OTP)) {
    OTPInput.otpInputInterface(otp)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(OTPInput)

export default OTPInput
export type { OtpInputConfig }

/**
 * --------------------------------------------------------------------------
 * CoreUI otp-input.js
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import { onLabelClick } from './util/field-label.js'
import {
  configureValueField, createValueField, dispatchValueChange, followUserValidity, getFeedbackIds, getValidationState,
  nextStateSerial, ownValidationState, setStateValidity, writeValueField, type UserValidity, type ValidationState
} from './util/form-validation.js'
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
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_PASTE = `paste${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const STATE_CLASSES = [CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID]

const SELECTOR_DATA_OTP = '[data-coreui-otp]'
const SELECTOR_FORM_OTP_CONTROL = '.form-otp-control'

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
  validationState: ValidationState | null
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
  validationState: null,
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
  validationState: '(string|null|undefined)',
  value: '(number|string|null)'
}

/**
 * Class definition
 */

class OTPInput extends BaseComponent {
  protected declare _disabledSlots: Set<HTMLInputElement>
  protected declare _inputElement: HTMLInputElement | null
  protected declare _placeholders: Map<HTMLInputElement, string | null>
  protected declare _readOnlySlots: Set<HTMLInputElement>
  protected declare _releaseValidationState: (() => void) | null
  protected declare _removeLabelClick: () => void
  protected declare _requiredSlots: Set<HTMLInputElement>
  protected declare _resetCode: string | null
  protected declare _serverMarks: Map<Element, string[]>
  protected declare _slotAria: Map<HTMLInputElement, { describedBy: string | null, invalid: string | null }>
  protected declare _stateClass: string | null
  protected declare _stateSerial: number
  protected declare _userValidity: UserValidity | null

  constructor(element?: string | Element | null, config?: Partial<OtpInputConfig> | null) {
    super(element, config)

    this._config = this._getConfig(config)
    this._disabledSlots = new Set()
    this._inputElement = null
    this._placeholders = new Map()
    this._readOnlySlots = new Set()
    this._releaseValidationState = null
    this._requiredSlots = new Set()
    this._resetCode = null
    this._serverMarks = new Map()
    this._slotAria = new Map()
    this._stateClass = null
    this._stateSerial = nextStateSerial()
    this._userValidity = null

    for (const element of [this._element, ...this._getInputs()]) {
      const names = STATE_CLASSES.filter(name => element.classList.contains(name))

      if (names.length > 0) {
        element.classList.remove(...names)
        this._serverMarks.set(element, names)
      }
    }

    this._setRoleAttribute()
    this._setInputsAttributes()
    this._seedSlots()
    this._createValueField()
    this._setInputsTabIndexes()
    this._addEventListeners()
    this._removeLabelClick = onLabelClick(this._element, () => this._getFirstEmptySlot()?.focus())
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

    this._removeLabelClick()
    this._userValidity?.stop()
    this._releaseValidationState?.()
    this._inputElement?.remove()
    this._inputElement = null

    if (this._stateClass) {
      this._element.classList.remove(this._stateClass)
    }

    for (const [element, names] of this._serverMarks) {
      element.classList.add(...names)
    }

    for (const [input, { describedBy, invalid }] of this._slotAria) {
      this._writeSlotAttribute(input, 'aria-describedby', describedBy)
      this._writeSlotAttribute(input, 'aria-invalid', invalid)
    }

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

    if ('validationState' in config) {
      this._serverMarks.clear()
      this._stateSerial = nextStateSerial()

      if (Object.keys(config).length === 1) {
        this._updateValidity()
        return
      }
    }

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
        this._setValue(value, true)
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

      if (this._config.readonly) {
        return
      }

      const pastedData = event.clipboardData.getData('text')
      const validChars = this._extractValidChars(pastedData)

      if (!validChars) {
        return
      }

      this._distributeChars(event.target as HTMLInputElement, validChars)
    })
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
    this._setValue(inputs.map((input: HTMLInputElement) => input.value).join(''), true)
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

  _getFirstEmptySlot(): HTMLInputElement | undefined {
    const inputs = this._getInputs()

    return inputs.find(input => !input.value) ?? inputs[0]
  }

  _getInputs(): HTMLInputElement[] {
    return SelectorEngine.find<HTMLInputElement>(SELECTOR_FORM_OTP_CONTROL, this._element)
  }

  _readSlots(): string {
    return this._getInputs().map(input => input.value).join('')
  }

  _createValueField(): void {
    const field = createValueField('input', () => this._getFirstEmptySlot())
    this._resetCode = this._extractValidChars(String(this._config.value ?? '')) ? this._readSlots() : null
    field.defaultValue = this._resetCode ?? this._getInputs().map(input => input.defaultValue).join('')
    field.value = this._readSlots()

    this._element.append(field)
    this._inputElement = field
    this._userValidity = followUserValidity(field, () => this._updateValidity(), serial => this._restoreValue(serial))
    this._syncValueField()
  }

  _syncValueField(): void {
    const field = this._inputElement!

    configureValueField(field, {
      disabled: this._config.disabled,
      name: this._config.name,
      readOnly: this._config.readonly,
      required: this._config.required
    })
    field.pattern = `${this._config.type === 'number' ? '[0-9]' : '.'}{${this._getInputs().length}}`
    this._releaseValidationState?.()
    this._releaseValidationState = ownValidationState(field, ...this._getInputs())

    if (this._config.id) {
      field.id = this._config.id
    } else {
      field.removeAttribute('id')
    }

    this._updateValidity()
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

  _setValue(value: string | null, byUser = false): void {
    if (this._inputElement) {
      const isChanged = writeValueField(this._inputElement, value || '')

      if (isChanged && byUser) {
        this._dismissValidationState()
      }

      this._updateValidity()

      if (isChanged) {
        dispatchValueChange(this._inputElement)
      }
    }

    EventHandler.trigger(this._element, EVENT_CHANGE, { value })

    if (value && value.length === this._getInputs().length) {
      EventHandler.trigger(this._element, EVENT_COMPLETE, { value })
    }
  }

  _dismissValidationState(serial: number = Number.POSITIVE_INFINITY): void {
    if (this._stateSerial > serial) {
      return
    }

    this._config.validationState = null
    this._serverMarks.clear()
  }

  _updateValidity(): void {
    const field = this._inputElement

    if (!field) {
      return
    }

    const serverClasses = new Set([...this._serverMarks.values()].flat())
    const givenState = getValidationState(this._config.validationState) ??
      getValidationState(null, serverClasses.has(CLASS_NAME_IS_VALID), serverClasses.has(CLASS_NAME_IS_INVALID))

    setStateValidity(field, givenState === 'invalid')

    const state = givenState ?? this._userValidity?.read()
    const stateClass = state ? `is-${state}` : null
    const feedbackIds = state === 'invalid' ? getFeedbackIds(field) : []

    if (stateClass !== this._stateClass) {
      if (this._stateClass) {
        this._element.classList.remove(this._stateClass)
      }

      if (stateClass) {
        this._element.classList.add(stateClass)
      }

      this._stateClass = stateClass
    }

    for (const input of this._getInputs()) {
      if (!this._slotAria.has(input)) {
        this._slotAria.set(input, { describedBy: input.getAttribute('aria-describedby'), invalid: input.getAttribute('aria-invalid') })
      }

      const ids = [...new Set([...(this._slotAria.get(input)!.describedBy ?? '').split(/\s+/), ...feedbackIds])].filter(Boolean)

      this._writeSlotAttribute(input, 'aria-describedby', ids.length > 0 ? ids.join(' ') : null)
      this._writeSlotAttribute(input, 'aria-invalid', state === 'invalid' ? 'true' : null)
    }
  }

  _restoreValue(serial: number): void {
    const code = this._resetCode

    this._dismissValidationState(serial)

    if (code !== null) {
      for (const [index, input] of this._getInputs().entries()) {
        input.value = code[index] ?? ''
      }
    }

    this._syncFirstInputMaxLength()
    this._setInputsTabIndexes()
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

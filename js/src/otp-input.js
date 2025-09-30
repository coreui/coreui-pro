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
const EVENT_INPUT = `input`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_PASTE = `paste`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_FORM_OTP_CONTROL = '.form-otp-control'
const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="otp"]'

const Default = {
  ariaLabel: (index, total) => `Digit ${index + 1} of ${total}`,
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
  constructor(element, config) {
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
  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  static get NAME() {
    return NAME
  }

  // Public
  clear() {
    const inputs = this._getInputs()
    for (const input of inputs) {
      input.value = ''
    }

    this._setHiddenInputValue(null)
    this._setInputsTabIndexes()
  }

  reset() {
    const inputs = this._getInputs()
    for (const [index, input] of inputs.entries()) {
      const valueString = String(this._config.value || '')

      input.value = valueString && valueString[index] ? valueString[index] : ''
    }

    this._setHiddenInputValue(null)
    this._setInputsTabIndexes()
  }

  update(config) {
    if (typeof config !== 'object') {
      return
    }

    this._config = { ...this._config, ...config }
    this._typeCheckConfig(this._config)

    this._setInputsAttributes()
    this._setInputsTabIndexes()
    this._inputElement.remove()
    this._createHiddenInput()
  }

  // Private
  _addEventListeners() {
    EventHandler.on(this._element, EVENT_FOCUS, SELECTOR_FORM_OTP_CONTROL, event => {
      const { target } = event

      if (target.value) {
        setTimeout(() => {
          target.select()
        }, 0)

        return
      }

      if (this._config.linear) {
        const inputs = this._getInputs()
        const firstEmptyInput = inputs.find(input => !input.value)
        if (firstEmptyInput && firstEmptyInput !== target) {
          firstEmptyInput.focus()
        }
      }
    })

    EventHandler.on(this._element, EVENT_INPUT, SELECTOR_FORM_OTP_CONTROL, event => {
      const { target } = event

      if (target.value.length === 1 && !this._isValidInput(target.value)) {
        target.value = ''
        return
      }

      if (target.value.length === 1) {
        const inputs = this._getInputs()

        if (!inputs.length) {
          return
        }

        const currentValue = inputs.map(input => input.value).join('')

        this._setHiddenInputValue(currentValue)

        const nextInput = getNextActiveElement(inputs, target, true)
        if (nextInput) {
          nextInput.focus()
        }

        this._setInputsTabIndexes()
        this._checkAutoSubmit(inputs)
      }
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, SELECTOR_FORM_OTP_CONTROL, event => {
      const { key, target } = event

      if (key === BACKSPACE_KEY && target.value === '') {
        const inputs = this._getInputs()

        if (!inputs.length) {
          return
        }

        getNextActiveElement(inputs, target, false).focus()

        const currentValue = inputs.map(input => input.value).join('')

        this._setHiddenInputValue(currentValue)
        this._setInputsTabIndexes()
        return
      }

      if (key === ARROW_RIGHT_KEY) {
        if (this._config.linear && target.value === '') {
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

      const inputs = this._getInputs()
      const currentIndex = inputs.indexOf(event.target)

      for (let i = 0; i < validChars.length && (currentIndex + i) < inputs.length; i++) {
        inputs[currentIndex + i].value = validChars[i]
      }

      // Focus the next empty input or the last filled input
      const nextEmptyIndex = currentIndex + validChars.length
      if (nextEmptyIndex < inputs.length) {
        inputs[nextEmptyIndex].focus()
      } else {
        inputs[inputs.length - 1].focus()
      }

      this._setHiddenInputValue(validChars)
      this._setInputsTabIndexes()
      this._checkAutoSubmit(inputs)
    })
  }

  _checkAutoSubmit(inputs) {
    if (!this._config.autoSubmit) {
      return
    }

    // Check if all inputs are filled
    const allFilled = inputs.every(input => input.value.length === 1)

    if (allFilled) {
      // Find the closest form element
      const form = this._element.closest('form')
      if (form && typeof form.requestSubmit === 'function') {
        form.requestSubmit()
      }
    }
  }

  _getInputs() {
    return SelectorEngine.find(SELECTOR_FORM_OTP_CONTROL, this._element)
  }

  _createHiddenInput() {
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

  _extractValidChars(text) {
    switch (this._config.type) {
      case 'number': {
        return text.replace(/\D/g, '')
      }

      default: {
        return text // Allow all characters for unknown types
      }
    }
  }

  _isValidInput(value) {
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

  _setHiddenInputValue(value) {
    if (this._inputElement) {
      this._inputElement.value = value || ''
    }

    EventHandler.trigger(this._element, EVENT_CHANGE, { value })

    if (value && value.length === this._getInputs().length) {
      EventHandler.trigger(this._element, EVENT_COMPLETE, { value })
    }
  }

  _setInputsAttributes() {
    const inputs = SelectorEngine.find(SELECTOR_FORM_OTP_CONTROL, this._element)
    for (const [index, input] of inputs.entries()) {
      input.type = this._config.masked ? 'password' : 'text'

      input.maxLength = 1
      input.autocomplete = 'off'

      if (this._config.placeholder !== null) {
        const placeholder = String(this._config.placeholder)
        input.placeholder = placeholder.length > 1 ? placeholder[index] || '' : placeholder
      }

      if (this._config.required !== null) {
        input.setAttribute('required', true)
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
        input.setAttribute('aria-label', ariaLabel)
      }
    }
  }

  _setInputsTabIndexes() {
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

  _setRoleAttribute() {
    this._element.setAttribute('role', 'group')
  }

  // Static
  static otpInputInterface(element, config) {
    const data = OTPInput.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(config) {
    return this.each(function () {
      const data = OTPInput.getOrCreateInstance(this)

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }

        data[config]()
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

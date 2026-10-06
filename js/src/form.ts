/**
 * --------------------------------------------------------------------------
 * CoreUI PRO form.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import { clearValidationState, updateValidationState, validateForm } from './util/form-validation.js'
import type { ValidationMarks } from './util/form-validation.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'form'
const DATA_KEY = 'coreui.form'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_RESET = `reset${EVENT_KEY}`
const EVENT_SUBMIT_DATA_API = `submit${EVENT_KEY}${DATA_API_KEY}`
const EVENT_VALIDATE = `validate${EVENT_KEY}`

const SELECTOR_DATA_VALIDATE = 'form[data-coreui-validate][novalidate]'

/**
 * Class definition
 */

class Form extends BaseComponent {
  protected declare _element: HTMLFormElement
  protected declare _validated: boolean
  protected declare _validatedSinceReset: boolean
  protected declare _validationMarks: ValidationMarks

  constructor(element: HTMLFormElement | string) {
    super(element)

    this._validated = false
    this._validatedSinceReset = false
    this._validationMarks = new WeakMap()

    EventHandler.on(this._element, EVENT_RESET, (event: Event) => {
      this._validatedSinceReset = false
      setTimeout(() => {
        if (this._element && !event.defaultPrevented && !this._validatedSinceReset) {
          this.reset()
        }
      })
    })
  }

  // Getters
  static override get NAME(): string {
    return NAME
  }

  // Public
  validate(): boolean {
    return this._validate().isValid
  }

  reset(): void {
    EventHandler.off(this._element, EVENT_INPUT)
    clearValidationState(this._element, this._validationMarks)
    this._validated = false
  }

  override dispose(): void {
    this.reset()
    super.dispose()
  }

  // Private
  _validate(): { handled: boolean, isValid: boolean } {
    const result = validateForm(this._element, this._validationMarks, isValid =>
      EventHandler.trigger(this._element, EVENT_VALIDATE, { isValid }).defaultPrevented)

    if (result.handled) {
      this._validatedSinceReset = true

      if (!this._validated) {
        this._validated = true
        EventHandler.on(this._element, EVENT_INPUT, () => updateValidationState(this._element, this._validationMarks))
      }
    }

    return result
  }

  // Static
  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, Form, config)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, EVENT_SUBMIT_DATA_API, SELECTOR_DATA_VALIDATE, function (this: HTMLFormElement, event: Event) {
  if ((event as SubmitEvent).submitter?.hasAttribute('formnovalidate')) {
    return
  }

  const { handled, isValid } = Form.getOrCreateInstance(this)._validate()

  if (handled && !isValid) {
    event.preventDefault()
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Form)

export default Form

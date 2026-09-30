/**
 * --------------------------------------------------------------------------
 * CoreUI number-input.js
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import {
  createControlGroupAction, ensureControlGroup, releaseControlGroup, type ControlGroup
} from './util/form-control-group.js'
import { MINUS_ICON, PLUS_ICON } from './util/icons.js'
import { sanitizeByConfig, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'
import { defineJQueryPlugin, jQueryDispatch } from './util/index.js'

/**
 * Constants
 */

const NAME = 'number-input'
const DATA_KEY = 'coreui.number-input'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY}`
const EVENT_RESET = `reset${EVENT_KEY}`
const EVENTS_STOP_REPEAT = ['pointerup', 'pointercancel', 'pointerleave'].map(event => `${event}${EVENT_KEY}`)

const CLASS_NAME_ACTION = 'form-control-action'
const CLASS_NAME_NUMBER_INPUT = 'number-input'

const SELECTOR_DATA_NUMBER_INPUT = '[data-coreui-number-input]'

// The repeat while a button is held: long enough that a single click never
// starts it, then fast enough to cross a range without waiting.
const REPEAT_DELAY = 400
const REPEAT_INTERVAL = 60

interface NumberInputConfig {
  allowList: SanitizerAllowList
  ariaDecrementLabel: string
  ariaIncrementLabel: string
  decrementIcon: string
  incrementIcon: string
  repeat: boolean
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
}

const Default: NumberInputConfig = {
  allowList: SVGAllowlist,
  ariaDecrementLabel: 'Decrease',
  ariaIncrementLabel: 'Increase',
  decrementIcon: MINUS_ICON,
  incrementIcon: PLUS_ICON,
  repeat: true,
  sanitize: true,
  sanitizeFn: null
}

const DefaultType = {
  allowList: 'object',
  ariaDecrementLabel: 'string',
  ariaIncrementLabel: 'string',
  decrementIcon: 'string',
  incrementIcon: 'string',
  repeat: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)'
}

/**
 * Class definition
 */

class NumberInput extends BaseComponent {
  // The component binds to the <input>; the buttons are its own.
  protected declare _element: HTMLInputElement
  protected declare _config: NumberInputConfig
  private _decrementElement: HTMLButtonElement | null = null
  private _incrementElement: HTMLButtonElement | null = null
  private _group: ControlGroup | null = null
  private _observer: MutationObserver | null = null
  private _repeatTimeout: ReturnType<typeof setTimeout> | null = null
  private _repeatInterval: ReturnType<typeof setInterval> | null = null
  private _repeated = false
  private _stopRepeatingHandler = (): void => this._stopRepeating()
  private _resetHandler = (): void => {
    setTimeout(() => this._updateButtonState())
  }

  constructor(element: string | Element, config?: Partial<NumberInputConfig>) {
    super(element, config)

    this._createButtons()
    this._addEventListeners()
    this._updateButtonState()
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
  increment(): void {
    this._step('up')
  }

  decrement(): void {
    this._step('down')
  }

  override dispose(): void {
    this._stopRepeating()

    for (const event of EVENTS_STOP_REPEAT) {
      EventHandler.off(document, event, this._stopRepeatingHandler)
    }

    EventHandler.off(this._element.form, EVENT_RESET, this._resetHandler)
    this._observer?.disconnect()

    for (const button of [this._decrementElement, this._incrementElement]) {
      EventHandler.off(button, EVENT_KEY)
      button?.remove()
    }

    if (this._group) {
      EventHandler.off(this._group.element, EVENT_POINTERDOWN)
      this._group.element.classList.remove(CLASS_NAME_NUMBER_INPUT)
      releaseControlGroup(this._element, this._group)
    }

    super.dispose()
  }

  // Private
  _step(direction: 'up' | 'down'): boolean {
    if (!this._canStep(direction)) {
      return false
    }

    this._stepValue(this._element, direction)

    EventHandler.trigger(this._element, 'input', { bubbles: true })
    EventHandler.trigger(this._element, 'change', { bubbles: true })
    EventHandler.trigger(this._element, EVENT_CHANGE, { value: this._element.value })

    return true
  }

  _stepValue(input: HTMLInputElement, direction: 'up' | 'down'): void {
    if (input.step.toLowerCase() === 'any') {
      this._stepByOne(input, direction)
      return
    }

    input[direction === 'up' ? 'stepUp' : 'stepDown']()

    // WebKit leaves an empty field empty when the range lies behind zero in the step's direction.
    if (input.value === '') {
      input[direction === 'up' ? 'stepDown' : 'stepUp']()
    }
  }

  // stepUp()/stepDown() throw on step="any"; the native spinner moves such a
  // field by one, so the buttons do the same.
  _stepByOne(input: HTMLInputElement, direction: 'up' | 'down'): void {
    const delta = direction === 'up' ? 1 : -1
    const value = input.value === '' ? 0 : Number(input.value)
    const next = this._clamp(Number((value + delta).toPrecision(15)))

    if (input.value === '' || (next - value) * delta > 0) {
      input.value = String(next)
    }
  }

  _clamp(value: number): number {
    const { max, min } = this._element

    return Math.min(Math.max(value, min === '' ? -Infinity : Number(min)), max === '' ? Infinity : Number(max))
  }

  _createButtons(): void {
    this._group = ensureControlGroup(this._element)
    const group = this._group.element

    group.classList.add(CLASS_NAME_NUMBER_INPUT)

    this._decrementElement = createControlGroupAction({
      className: CLASS_NAME_ACTION,
      icon: this._config.decrementIcon,
      label: this._config.ariaDecrementLabel,
      sanitizeIcon: (icon: string) => sanitizeByConfig(icon, this._config)
    })

    this._incrementElement = createControlGroupAction({
      className: CLASS_NAME_ACTION,
      icon: this._config.incrementIcon,
      label: this._config.ariaIncrementLabel,
      sanitizeIcon: (icon: string) => sanitizeByConfig(icon, this._config)
    })

    // A number field already steps with the up and down arrows, so putting the
    // buttons in the tab order would add two stops per field for something the
    // keyboard reaches anyway. They keep their labels for assistive technology.
    for (const button of [this._decrementElement, this._incrementElement]) {
      button.tabIndex = -1
      group.append(button)
    }
  }

  _addEventListeners(): void {
    for (const [button, direction] of [
      [this._decrementElement, 'down'],
      [this._incrementElement, 'up']
    ] as Array<[HTMLButtonElement | null, 'up' | 'down']>) {
      if (!button) {
        continue
      }

      EventHandler.on(button, EVENT_CLICK, (event: any) => {
        const repeated = this._repeated
        this._repeated = false

        if (!repeated || event.detail === 0) {
          this._step(direction)
        }
      })

      if (this._config.repeat) {
        EventHandler.on(button, EVENT_POINTERDOWN, (event: any) => {
          if (event.button !== 0) {
            return
          }

          this._startRepeating(direction)
        })
      }
    }

    if (this._group) {
      EventHandler.on(this._group.element, EVENT_POINTERDOWN, (event: any) => this._handleFramePointerDown(event))
    }

    // The value can change without the buttons — typing, a form reset — and the
    // bounds have to follow it. The reset event precedes the reset itself.
    EventHandler.on(this._element, EVENT_INPUT, () => this._updateButtonState())

    if (this._element.form) {
      EventHandler.on(this._element.form, EVENT_RESET, this._resetHandler)
    }

    this._observer = new MutationObserver(() => this._updateButtonState())
    this._observer.observe(this._element, { attributeFilter: ['disabled', 'max', 'min', 'readonly', 'step'] })

    for (const event of EVENTS_STOP_REPEAT) {
      EventHandler.on(document, event, this._stopRepeatingHandler)
    }
  }

  _handleFramePointerDown(event: PointerEvent): void {
    const target = event.target as Element

    // A disabled button lets the press through to the frame.
    if (event.pointerType !== 'mouse' || (target !== this._group?.element && ![this._decrementElement, this._incrementElement].includes(target.closest('button')))) {
      return
    }

    event.preventDefault()

    if (document.activeElement !== this._element) {
      this._element.focus({ preventScroll: true })
    }
  }

  _startRepeating(direction: 'up' | 'down'): void {
    this._stopRepeating()
    this._repeated = false

    this._repeatTimeout = setTimeout(() => {
      this._repeatInterval = setInterval(() => {
        this._repeated = true

        if (!this._step(direction)) {
          this._stopRepeating()
        }
      }, REPEAT_INTERVAL)
    }, REPEAT_DELAY)
  }

  _stopRepeating(): void {
    if (this._repeatTimeout) {
      clearTimeout(this._repeatTimeout)
      this._repeatTimeout = null
    }

    if (this._repeatInterval) {
      clearInterval(this._repeatInterval)
      this._repeatInterval = null
    }
  }

  // A button that cannot move the value any further is disabled rather than
  // silently inert, so it reads the same to a pointer, a screen reader and the
  // frame's disabled styling.
  _updateButtonState(): void {
    if (this._decrementElement) {
      this._decrementElement.disabled = !this._canStep('down')
    }

    if (this._incrementElement) {
      this._incrementElement.disabled = !this._canStep('up')
    }
  }

  _canStep(direction: 'up' | 'down'): boolean {
    if (this._element.matches(':disabled') || this._element.readOnly) {
      return false
    }

    const input = this._element.cloneNode() as HTMLInputElement
    input.value = this._element.value
    this._stepValue(input, direction)

    return input.value !== '' && input.valueAsNumber !== this._element.valueAsNumber
  }

  // Static
  static _initializeDataApi(): void {
    for (const element of SelectorEngine.find(SELECTOR_DATA_NUMBER_INPUT)) {
      NumberInput.getOrCreateInstance(element)
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return jQueryDispatch(this, NumberInput, config)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
  NumberInput._initializeDataApi()
})

/**
 * jQuery
 */

defineJQueryPlugin(NumberInput)

export default NumberInput

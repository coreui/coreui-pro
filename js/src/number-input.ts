/**
 * --------------------------------------------------------------------------
 * CoreUI number-input.js
 * Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import {
  createControlGroupAction, ensureControlGroup, releaseControlGroup, type ControlGroup
} from './util/form-control-group.js'
import { MINUS_ICON, PLUS_ICON } from './util/icons.js'
import { sanitizeHtml, SVGAllowlist, type SanitizerAllowList } from './util/sanitizer.js'
import { defineJQueryPlugin } from './util/index.js'

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
const EVENTS_STOP_REPEAT = ['pointerup', 'pointercancel', 'pointerleave'].map(event => `${event}${EVENT_KEY}`)

const CLASS_NAME_ACTION = 'form-control-action'
const CLASS_NAME_NUMBER_INPUT = 'number-input'

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="number-input"]'

// The repeat while a button is held: long enough that a single click never
// starts it, then fast enough to cross a range without waiting.
const REPEAT_DELAY = 400
const REPEAT_INTERVAL = 60

const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn'])

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
  private _repeatTimeout: ReturnType<typeof setTimeout> | null = null
  private _repeatInterval: ReturnType<typeof setInterval> | null = null
  private _stopRepeatingHandler = (): void => this._stopRepeating()

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

    for (const button of [this._decrementElement, this._incrementElement]) {
      EventHandler.off(button, EVENT_KEY)
      button?.remove()
    }

    if (this._group) {
      this._group.element.classList.remove(CLASS_NAME_NUMBER_INPUT)
      releaseControlGroup(this._element, this._group)
    }

    super.dispose()
  }

  // Private
  // The native input owns min, max and step, so stepping is its own API. It
  // throws when the value is not a valid number — which it is whenever the
  // field is empty or holds something the browser refused — so an unusable
  // value starts from the minimum, or from zero when there is none.
  _step(direction: 'up' | 'down'): void {
    if (this._element.disabled || this._element.readOnly) {
      return
    }

    if (this._element.value === '') {
      this._element.value = this._element.min === '' ? '0' : this._element.min
    } else if (direction === 'up') {
      this._element.stepUp()
    } else {
      this._element.stepDown()
    }

    this._updateButtonState()
    EventHandler.trigger(this._element, 'input', { bubbles: true })
    EventHandler.trigger(this._element, 'change', { bubbles: true })
    EventHandler.trigger(this._element, EVENT_CHANGE, { value: this._element.value })
  }

  _createButtons(): void {
    this._group = ensureControlGroup(this._element)
    const group = this._group.element

    group.classList.add(CLASS_NAME_NUMBER_INPUT)

    this._decrementElement = createControlGroupAction({
      className: CLASS_NAME_ACTION,
      icon: this._config.decrementIcon,
      label: this._config.ariaDecrementLabel,
      sanitizeIcon: (icon: string) => this._sanitizeIcon(icon)
    })

    this._incrementElement = createControlGroupAction({
      className: CLASS_NAME_ACTION,
      icon: this._config.incrementIcon,
      label: this._config.ariaIncrementLabel,
      sanitizeIcon: (icon: string) => this._sanitizeIcon(icon)
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

      EventHandler.on(button, EVENT_CLICK, () => this._step(direction))

      if (this._config.repeat) {
        EventHandler.on(button, EVENT_POINTERDOWN, (event: any) => {
          if (event.button !== 0) {
            return
          }

          this._startRepeating(direction)
        })
      }
    }

    // The value can change without the buttons — typing, a form reset, a script
    // — and the bounds have to follow it.
    EventHandler.on(this._element, EVENT_INPUT, () => this._updateButtonState())

    for (const event of EVENTS_STOP_REPEAT) {
      EventHandler.on(document, event, this._stopRepeatingHandler)
    }
  }

  _startRepeating(direction: 'up' | 'down'): void {
    this._stopRepeating()

    this._repeatTimeout = setTimeout(() => {
      this._repeatInterval = setInterval(() => this._step(direction), REPEAT_INTERVAL)
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
    const { max, min, value } = this._element

    if (this._decrementElement) {
      this._decrementElement.disabled = min !== '' && value !== '' && Number(value) <= Number(min)
    }

    if (this._incrementElement) {
      this._incrementElement.disabled = max !== '' && value !== '' && Number(value) >= Number(max)
    }
  }

  _sanitizeIcon(icon: string): string {
    return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon
  }

  override _getConfig(config: any): any {
    const dataAttributes = Manipulator.getDataAttributes(this._element)

    for (const dataAttribute of Object.keys(dataAttributes)) {
      if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
        delete dataAttributes[dataAttribute]
      }
    }

    return super._getConfig({ ...dataAttributes, ...(typeof config === 'object' ? config : {}) })
  }

  // Static
  static _initializeDataApi(): void {
    for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE)) {
      NumberInput.getOrCreateInstance(element)
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = NumberInput.getOrCreateInstance(this)

      if (typeof config === 'string') {
        data[config]()
      }
    })
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

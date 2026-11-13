/**
 * --------------------------------------------------------------------------
 * CoreUI PRO rating.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import FieldValidation from './util/field-validation.js'
import { type ValidationState } from './util/form-validation.js'
import { sanitizeByConfig, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'
import {
  defineJQueryPlugin, getUID, jQueryDispatch, writeAttribute
} from './util/index.js'
import Tooltip from './tooltip.js'

/**
 * Constants
 */

const NAME = 'rating'
const DATA_KEY = 'coreui.rating'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_FOCUSIN = `focusin${EVENT_KEY}`
const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`
const EVENT_HOVER = `hover${EVENT_KEY}`
const EVENT_INPUT = `input${EVENT_KEY}`
const EVENT_KEYDOWN = `keydown${EVENT_KEY}`
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`
const EVENT_MOUSEENTER = `mouseenter${EVENT_KEY}`
const EVENT_MOUSELEAVE = `mouseleave${EVENT_KEY}`

const CLASS_NAME_ACTIVE = 'active'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_RATING = 'rating'
const CLASS_NAME_RATING_ITEM = 'rating-item'
const CLASS_NAME_RATING_ITEM_ICON = 'rating-item-icon'
const CLASS_NAME_RATING_ITEM_CUSTOM_ICON = 'rating-item-custom-icon'
const CLASS_NAME_RATING_ITEM_CUSTOM_ICON_ACTIVE = 'rating-item-custom-icon-active'
const CLASS_NAME_RATING_ITEM_INPUT = 'rating-item-input'
const CLASS_NAME_RATING_ITEM_LABEL = 'rating-item-label'
const CLASS_NAME_READONLY = 'readonly'

const SIZE_CLASS_NAMES = ['rating-lg', 'rating-sm']

const SELECTOR_DATA_RATING = '[data-coreui-rating]'
const SELECTOR_RATING_ITEM = '.rating-item'
const SELECTOR_RATING_ITEM_INPUT = '.rating-item-input'
const SELECTOR_RATING_ITEM_LABEL = '.rating-item-label'

type RatingConfig = {
  activeIcon: string | Record<number, string> | null
  allowClear: boolean
  allowList: SanitizerAllowList
  ariaItemLabel: (value: number, itemCount: number) => string
  disabled: boolean
  highlightOnlySelected: boolean
  icon: string | Record<number, string> | null
  itemCount: number
  name: string | null
  precision: number
  readonly: boolean
  required: boolean
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  size: 'sm' | 'lg' | null
  tooltips: boolean | string | string[] | Record<string, string>
  validationState: ValidationState | null
  value: number | null
}

const Default: RatingConfig = {
  activeIcon: null,
  allowClear: false,
  allowList: SVGAllowlist,
  ariaItemLabel: (value: number, itemCount: number) => `${value} of ${itemCount}`,
  disabled: false,
  highlightOnlySelected: false,
  icon: null,
  itemCount: 5,
  name: null,
  precision: 1,
  readonly: false,
  required: false,
  sanitize: true,
  sanitizeFn: null,
  size: null,
  tooltips: false,
  validationState: null,
  value: null
}

const DefaultType = {
  activeIcon: '(object|string|null)',
  allowClear: 'boolean',
  allowList: 'object',
  ariaItemLabel: 'function',
  disabled: 'boolean',
  highlightOnlySelected: 'boolean',
  icon: '(object|string|null)',
  itemCount: 'number',
  name: '(string|null)',
  precision: 'number',
  readonly: 'boolean',
  required: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  size: '(string|null)',
  tooltips: '(array|boolean|object)',
  validationState: '(string|null|undefined)',
  value: '(number|null)'
}

/**
 * Class definition
 */

class Rating extends BaseComponent {
  protected declare _currentValue: number | string | null
  protected declare _disabled: boolean
  protected declare _items: HTMLElement[]
  protected declare _name: string
  protected declare _startValue: number | string | null
  protected declare _tooltip: Tooltip | null
  protected declare _validation: FieldValidation

  constructor(element?: string | Element | null, config?: Partial<RatingConfig> | null) {
    super(element)

    this._items = []
    this._config = this._getConfig(config)
    this._currentValue = this._config.value
    this._disabled = this._config.disabled
    this._startValue = this._config.value
    this._name = this._config.name || getUID(`${this.constructor.NAME}-name-`).toString()
    this._items = Array.from({ length: this._config.itemCount }, (_, index) => this._createRatingItem(index))
    this._currentValue = this._starValue(this._currentValue)
    this._validation = new FieldValidation(this._element, {
      blockers: () => {
        const blocked = this._blockedRadio()

        return blocked ? [blocked] : []
      },
      canBlock: () => !this._disabled && !this._config.readonly,
      config: () => this._config,
      describedTargets: () => this._radios(),
      fields: () => this._radios(),
      frames: () => [this._element],
      invalidTargets: () => [this._element],
      pageDescribed: () => [this._element],
      restore: () => this._restoreValue()
    })

    this._tooltip = null

    this._createRating()
    this._addEventListeners()
    this._createTooltip()
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
  disable(): void {
    this._setDisabled(true)
  }

  enable(): void {
    this._setDisabled(false)
  }

  setValidationState(validationState: ValidationState | null): void {
    this._config = this._getConfig({ ...this._config, validationState })
    this._validation.configure()
  }

  setValue(value: RatingConfig['value']): void {
    this._typeCheckConfig({ value }, { value: DefaultType.value })
    this._currentValue = this._starValue(value)
    this._paintValue()
  }

  reset(value: number | null = null): void {
    const starValue = this._starValue(value)
    // eslint-disable-next-line eqeqeq
    const isChanged = starValue != this._currentValue

    this._currentValue = starValue
    this._paintValue()

    if (isChanged) {
      EventHandler.trigger(this._element, EVENT_CHANGE, {
        value: starValue
      })
    }
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    this._validation?.dispose()
    this._removeRating()
    this._tooltip?.dispose()
    super.dispose()
  }

  // Private
  _setDisabled(disabled: boolean): void {
    if (disabled === this._disabled) {
      return
    }

    this._disabled = disabled
    this._element.classList.toggle(CLASS_NAME_DISABLED, disabled)

    for (const radio of this._radios()) {
      radio.disabled = disabled
    }

    if (disabled) {
      this._tooltip?.disable()
    } else if (!this._config.readonly) {
      this._tooltip?.enable()
    }

    this._paintValue()
  }

  _paintValue(): void {
    let checked: HTMLInputElement | null = null

    for (const radio of this._radios()) {
      // eslint-disable-next-line eqeqeq
      radio.checked = radio.value == this._currentValue

      if (radio.checked) {
        checked = radio
      }
    }

    this._highlightLabels(checked)
    this._updateTabStop()
    this._validation.update()
  }

  _radios(): HTMLInputElement[] {
    return SelectorEngine.find<HTMLInputElement>(SELECTOR_RATING_ITEM_INPUT, this._element as ParentNode)
  }

  _blockedRadio(): HTMLInputElement | undefined {
    const radios = this._radios()

    return radios.find(radio => radio.checked) ?? radios[0]
  }

  _removeRating(): void {
    this._tooltip?.hide()

    for (const item of this._items) {
      item.remove()
    }

    this._items = []
  }

  _addEventListeners(): void {
    EventHandler.on(this._element, EVENT_CLICK, SELECTOR_RATING_ITEM_INPUT, (event: any) => {
      const { target } = event

      if (this._config.readonly) {
        event.preventDefault()
        return
      }

      if (this._disabled) {
        return
      }

      // eslint-disable-next-line eqeqeq
      if (this._config.allowClear && this._currentValue == target.value) {
        this._currentValue = null
        target.checked = false
        this._resetLabels()
        this._validation.dismiss()
        this._validation.update()

        EventHandler.trigger(this._element, EVENT_CHANGE, {
          value: null
        })
      }
    })

    EventHandler.on(this._element, EVENT_INPUT, SELECTOR_RATING_ITEM_INPUT, () => {
      if (!this._disabled && !this._config.readonly) {
        this._validation.dismiss()
      }
    })

    EventHandler.on(this._element, EVENT_CHANGE, SELECTOR_RATING_ITEM_INPUT, ({ target }: any) => {
      if (this._disabled || this._config.readonly) {
        return
      }

      this._currentValue = target.value

      EventHandler.trigger(this._element, EVENT_CHANGE, {
        value: target.value
      })

      if (target.isConnected) {
        this._highlightLabels(target)
      }
    })

    EventHandler.on(this._element, EVENT_MOUSEENTER, SELECTOR_RATING_ITEM_LABEL, ({ target }) => {
      if (this._disabled || this._config.readonly) {
        return
      }

      const label = (target as HTMLElement).closest(SELECTOR_RATING_ITEM_LABEL)
      const labels = SelectorEngine.find(SELECTOR_RATING_ITEM_LABEL, this._element as ParentNode)
      this._resetLabels()

      const input = SelectorEngine.findOne(SELECTOR_RATING_ITEM_INPUT, label!.parentElement as ParentNode)

      EventHandler.trigger(this._element, EVENT_HOVER, {
        value: (input as HTMLInputElement).value
      })

      if (this._config.highlightOnlySelected) {
        label!.classList.add(CLASS_NAME_ACTIVE)

        return
      }

      for (const _label of labels) {
        _label.classList.add(CLASS_NAME_ACTIVE)
        if (_label === label) {
          break
        }
      }
    })

    EventHandler.on(this._element, EVENT_MOUSELEAVE, SELECTOR_RATING_ITEM_LABEL, () => {
      if (this._disabled || this._config.readonly) {
        return
      }

      const checkedInput = SelectorEngine.findOne(`${SELECTOR_RATING_ITEM_INPUT}[value="${this._currentValue}"]`, this._element as ParentNode)
      this._resetLabels()

      EventHandler.trigger(this._element, EVENT_HOVER, {
        value: null
      })

      this._highlightLabels(checkedInput)
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, SELECTOR_RATING_ITEM_INPUT, (event: any) => {
      if (this._config.readonly && event.key?.startsWith('Arrow')) {
        event.preventDefault()
      }
    })

    EventHandler.on(this._element, EVENT_FOCUSIN, SELECTOR_RATING_ITEM_INPUT, ({ target }: any) => {
      if (this._disabled || this._config.readonly) {
        return
      }

      EventHandler.trigger(this._element, EVENT_HOVER, {
        value: target.value
      })
    })

    EventHandler.on(this._element, EVENT_FOCUSOUT, SELECTOR_RATING_ITEM_INPUT, () => {
      if (this._disabled || this._config.readonly) {
        return
      }

      EventHandler.trigger(this._element, EVENT_HOVER, {
        value: null
      })
    })
  }

  _createTooltip(): void {
    const { tooltips } = this._config

    if (tooltips === false) {
      return
    }

    this._tooltip = new Tooltip(this._element, {
      anchors: `${SELECTOR_RATING_ITEM}, ${SELECTOR_RATING_ITEM} > div`,
      disabled: this._disabled || this._config.readonly,
      title(anchor: Element) {
        const { value } = SelectorEngine.findOne<HTMLInputElement>(SELECTOR_RATING_ITEM_INPUT, anchor)!

        if (Array.isArray(tooltips)) {
          return tooltips[Math.ceil(Number(value)) - 1]
        }

        return typeof tooltips === 'object' ? tooltips[value] : value
      }
    })
  }

  override _configAfterMerge(config: any): any {
    if (typeof config.tooltips === 'string') {
      config.tooltips = config.tooltips.split(',')
    }

    return config
  }

  _resetLabels(): void {
    const labels = SelectorEngine.find(SELECTOR_RATING_ITEM_LABEL, this._element as ParentNode)

    for (const label of labels) {
      label.classList.remove(CLASS_NAME_ACTIVE)
    }
  }

  _highlightLabels(checkedInput: Element | null): void {
    this._resetLabels()

    if (!checkedInput) {
      return
    }

    if (this._config.highlightOnlySelected) {
      const label = SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, checkedInput.parentElement as ParentNode)
      label!.classList.add(CLASS_NAME_ACTIVE)

      return
    }

    for (const input of SelectorEngine.find(SELECTOR_RATING_ITEM_INPUT, this._element as ParentNode)) {
      const label = SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, input.parentElement as ParentNode)
      label!.classList.add(CLASS_NAME_ACTIVE)

      if (input === checkedInput) {
        break
      }
    }
  }

  _createRating(): void {
    this._element.classList.add(CLASS_NAME_RATING)
    this._element.classList.toggle(CLASS_NAME_DISABLED, this._disabled)
    this._element.classList.toggle(CLASS_NAME_READONLY, Boolean(this._config.readonly))

    this._element.classList.remove(...SIZE_CLASS_NAMES)

    if (this._config.size) {
      this._element.classList.add(`rating-${this._config.size}`)
    }

    this._element.setAttribute('role', 'radiogroup')
    writeAttribute(this._element, 'aria-readonly', this._config.readonly ? 'true' : null)
    writeAttribute(this._element, 'aria-required', this._isRequired() ? 'true' : null)

    this._element.append(...this._items)
    this._updateTabStop()
    this._validation.refresh()
  }

  _starValue(value: number | string | null): number | string | null {
    if (value !== null && value !== 0 && !this._items.some(item => item.querySelector(`${SELECTOR_RATING_ITEM_INPUT}[value="${value}"]`))) {
      throw new TypeError(`${NAME.toUpperCase()}: Option "value" provided value "${value}" but expected the value of a star.`)
    }

    return value || null
  }

  _isRequired(): boolean {
    return this._config.required && !this._config.readonly
  }

  _updateTabStop(): void {
    if (!this._config.readonly) {
      return
    }

    const stop = this._blockedRadio()

    for (const input of this._radios()) {
      input.tabIndex = input === stop ? 0 : -1
    }
  }

  _restoreValue(): void {
    const checkedInput = SelectorEngine.findOne<HTMLInputElement>(`${SELECTOR_RATING_ITEM_INPUT}:checked`, this._element as ParentNode)
    const value = checkedInput?.value ?? null

    // eslint-disable-next-line eqeqeq
    if (value == this._currentValue) {
      return
    }

    this._currentValue = value
    this._highlightLabels(checkedInput)

    this._updateTabStop()

    EventHandler.trigger(this._element, EVENT_CHANGE, {
      value
    })
  }

  _createRatingItem(index: number): HTMLElement {
    const ratingItemElement = document.createElement('div')
    ratingItemElement.classList.add(CLASS_NAME_RATING_ITEM)

    const numberOfRadios = 1 / this._config.precision

    // eslint-disable-next-line array-callback-return
    Array.from({ length: numberOfRadios }, (_, _index) => {
      const ratingItemId = getUID(`${this.constructor.NAME}${index}`).toString()
      const isNotLastItem = _index + 1 < numberOfRadios
      const value = Number((index + ((_index + 1) * this._config.precision)).toFixed(10))

      // Create label
      const ratingItemLabelElement = document.createElement('label')
      ratingItemLabelElement.classList.add(CLASS_NAME_RATING_ITEM_LABEL)
      ratingItemLabelElement.setAttribute('for', ratingItemId)

      // eslint-disable-next-line eqeqeq
      if (this._config.highlightOnlySelected && this._currentValue == value) {
        ratingItemLabelElement.classList.add(CLASS_NAME_ACTIVE)
      }

      if (!this._config.highlightOnlySelected && (this._currentValue as number) >= value) {
        ratingItemLabelElement.classList.add(CLASS_NAME_ACTIVE)
      }

      if (isNotLastItem) {
        ratingItemLabelElement.style.zIndex = ((1 / this._config.precision) - _index) as any
        ratingItemLabelElement.style.position = 'absolute'
        ratingItemLabelElement.style.width = `${this._config.precision * (_index + 1) * 100}%`
        ratingItemLabelElement.style.overflow = 'hidden'
        ratingItemLabelElement.style.opacity = 0 as any
      }

      if (this._config.icon) {
        const ratingItemIconElement = document.createElement('div')
        ratingItemIconElement.classList.add(CLASS_NAME_RATING_ITEM_CUSTOM_ICON)
        ratingItemIconElement.innerHTML = sanitizeByConfig(typeof this._config.icon === 'object' ? this._config.icon[index + 1] : this._config.icon, this._config)

        ratingItemLabelElement.append(ratingItemIconElement)
      } else {
        const ratingItemIconElement = document.createElement('div')
        ratingItemIconElement.classList.add(CLASS_NAME_RATING_ITEM_ICON)

        ratingItemLabelElement.append(ratingItemIconElement)
      }

      if (this._config.icon && this._config.activeIcon) {
        const ratingItemIconActiveElement = document.createElement('div')
        ratingItemIconActiveElement.classList.add(CLASS_NAME_RATING_ITEM_CUSTOM_ICON_ACTIVE)
        ratingItemIconActiveElement.innerHTML = sanitizeByConfig(typeof this._config.activeIcon === 'object' ? this._config.activeIcon[index + 1] : this._config.activeIcon, this._config)

        ratingItemLabelElement.append(ratingItemIconActiveElement)
      }

      // Create input
      const ratingItemInputElement = document.createElement('input')
      ratingItemInputElement.classList.add(CLASS_NAME_RATING_ITEM_INPUT)
      ratingItemInputElement.id = ratingItemId
      ratingItemInputElement.type = 'radio'
      ratingItemInputElement.value = value as any

      if (!this._config.readonly) {
        ratingItemInputElement.name = this._name
      } else if (this._config.name) {
        ratingItemInputElement.name = this._config.name
      }

      if (typeof this._config.ariaItemLabel === 'function') {
        ratingItemInputElement.setAttribute('aria-label', this._config.ariaItemLabel(value, this._config.itemCount))
      }

      if (this._disabled) {
        ratingItemInputElement.disabled = true
      }

      ratingItemInputElement.required = this._isRequired()

      // eslint-disable-next-line eqeqeq
      ratingItemInputElement.defaultChecked = this._startValue == value
      // eslint-disable-next-line eqeqeq
      ratingItemInputElement.checked = this._currentValue == value

      // Append elements

      if (this._config.precision === 1) {
        ratingItemElement.append(ratingItemLabelElement)
        ratingItemElement.append(ratingItemInputElement)
      } else {
        const wrapper = document.createElement('div')
        wrapper.append(ratingItemLabelElement)
        wrapper.append(ratingItemInputElement)
        ratingItemElement.append(wrapper)
      }
    })

    return ratingItemElement
  }

  // Static
  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, Rating, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  const ratings = SelectorEngine.find(SELECTOR_DATA_RATING)
  for (const rating of ratings) {
    Rating.getOrCreateInstance(rating)
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Rating)

export default Rating
export type { RatingConfig }

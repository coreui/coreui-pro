/**
 * --------------------------------------------------------------------------
 * CoreUI PRO rating.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import SelectorEngine from './dom/selector-engine.js'
import {
  followUserValidity, getFeedbackIds, getValidationState, nextStateSerial, ownValidationState, setStateValidity,
  type UserValidity, type ValidationState
} from './util/form-validation.js'
import { sanitizeByConfig, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'
import {
  captureHostClasses, defineJQueryPlugin, getUID, type HostClasses, jQueryDispatch, restoreHostClasses
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
const EVENT_RESET = `reset${EVENT_KEY}`

const CLASS_NAME_ACTIVE = 'active'
const CLASS_NAME_DISABLED = 'disabled'
const CLASS_NAME_IS_INVALID = 'is-invalid'
const CLASS_NAME_IS_VALID = 'is-valid'
const CLASS_NAME_RATING = 'rating'
const CLASS_NAME_RATING_ITEM = 'rating-item'
const CLASS_NAME_RATING_ITEM_ICON = 'rating-item-icon'
const CLASS_NAME_RATING_ITEM_CUSTOM_ICON = 'rating-item-custom-icon'
const CLASS_NAME_RATING_ITEM_CUSTOM_ICON_ACTIVE = 'rating-item-custom-icon-active'
const CLASS_NAME_RATING_ITEM_INPUT = 'rating-item-input'
const CLASS_NAME_RATING_ITEM_LABEL = 'rating-item-label'
const CLASS_NAME_READONLY = 'readonly'

const SIZE_CLASS_NAMES = ['rating-lg', 'rating-sm']
const STATE_CLASSES = [CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID]

const SELECTOR_DATA_RATING = '[data-coreui-rating]'
const SELECTOR_FORM = 'form'
const SELECTOR_RATING_ITEM = '.rating-item'
const SELECTOR_RATING_ITEM_INPUT = '.rating-item-input'
const SELECTOR_RATING_ITEM_LABEL = '.rating-item-label'

type RatingConfig = {
  activeIcon: string | Record<number, string> | null
  allowClear: boolean
  allowList: SanitizerAllowList
  ariaLabel: (value: number, itemCount: number) => string
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
  ariaLabel: (value: number, itemCount: number) => `${value} of ${itemCount}`,
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
  ariaLabel: 'function',
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
  protected declare _feedbackIds: string[]
  protected declare _form: HTMLFormElement | null
  protected declare _hostAriaInvalid: string | null
  protected declare _hostAriaReadonly: string | null
  protected declare _hostAriaRequired: string | null
  protected declare _hostClasses: HostClasses
  protected declare _hostRole: string | null
  protected declare _items: HTMLElement[]
  protected declare _name: string
  protected declare _releaseValidationState: (() => void) | null
  protected declare _resetHandler: (event: Event) => void
  protected declare _resetRoot: Document | ShadowRoot
  protected declare _serverMarks: string[]
  protected declare _sizeClassName: string | null
  protected declare _sizeClassNames: Set<string>
  protected declare _stateClass: string | null
  protected declare _stateSerial: number
  protected declare _tooltip: any
  protected declare _userValidity: UserValidity[]

  constructor(element?: string | Element | null, config?: Partial<RatingConfig> | null) {
    super(element)

    this._hostClasses = captureHostClasses(this._element, [
      CLASS_NAME_RATING,
      CLASS_NAME_DISABLED,
      CLASS_NAME_READONLY,
      ...[...this._element.classList].filter(className => className.startsWith(`${CLASS_NAME_RATING}-`))
    ])
    this._hostAriaInvalid = this._element.getAttribute('aria-invalid')
    this._hostAriaReadonly = this._element.getAttribute('aria-readonly')
    this._hostAriaRequired = this._element.getAttribute('aria-required')
    this._hostRole = this._element.getAttribute('role')
    this._feedbackIds = []
    this._items = []
    this._form = this._element.closest('form')
    this._releaseValidationState = null
    this._resetRoot = this._element.getRootNode() instanceof ShadowRoot ? this._element.getRootNode() as ShadowRoot : this._element.ownerDocument
    this._serverMarks = STATE_CLASSES.filter(name => this._element.classList.contains(name))
    this._stateClass = null
    this._stateSerial = nextStateSerial()
    this._userValidity = []

    if (this._serverMarks.length > 0) {
      this._element.classList.remove(...this._serverMarks)
    }

    this._resetHandler = (event: Event) => {
      if (event.target !== this._form) {
        return
      }

      const serial = nextStateSerial()

      setTimeout(() => {
        if (!this._element || event.defaultPrevented) {
          return
        }

        this._dismissValidationState(serial)

        const checkedInput = SelectorEngine.findOne<HTMLInputElement>(`${SELECTOR_RATING_ITEM_INPUT}:checked`, this._element as ParentNode)
        const value = checkedInput?.value ?? null

        // eslint-disable-next-line eqeqeq
        if (value == this._currentValue) {
          return
        }

        this._currentValue = value
        this._highlightLabels(checkedInput)

        EventHandler.trigger(this._element, EVENT_CHANGE, {
          value
        })
      })
    }

    this._sizeClassName = null
    this._sizeClassNames = new Set()
    this._config = this._getConfig(config)
    this._currentValue = this._config.value
    this._name = this._config.name || getUID(`${this.constructor.NAME}-name-`).toString()
    this._tooltip = null

    this._createRating()
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
  setConfig(config: Partial<RatingConfig> | null): void {
    this._config = this._getConfig({ ...this._config, ...config })
    this._name = this._config.name || this._name

    if (config && 'validationState' in config) {
      this._serverMarks = []
      this._stateSerial = nextStateSerial()

      if (Object.keys(config).length === 1) {
        this._updateValidity()
        return
      }
    }

    if (config?.value !== undefined) {
      this._currentValue = this._config.value
    }

    this._createRating(this._removeRating())
  }

  reset(value: number | null = null): void {
    this._currentValue = value

    this._createRating(this._removeRating())

    EventHandler.trigger(this._element, EVENT_CHANGE, {
      value
    })
  }

  override dispose(): void {
    if (!this._element) {
      return
    }

    EventHandler.off(this._resetRoot, EVENT_RESET, SELECTOR_FORM, this._resetHandler)
    this._removeRating()
    restoreHostClasses(this._element, this._managedClassNames(), this._hostClasses)

    if (this._stateClass) {
      this._element.classList.remove(this._stateClass)
    }

    if (this._serverMarks.length > 0) {
      this._element.classList.add(...this._serverMarks)
    }

    this._writeFeedbackIds([])

    if (this._hostAriaInvalid === null) {
      this._element.removeAttribute('aria-invalid')
    }

    if (this._hostAriaRequired === null) {
      this._element.removeAttribute('aria-required')
    }

    if (this._hostRole === null && this._element.getAttribute('role') === 'radiogroup') {
      this._element.removeAttribute('role')
    }

    if (this._hostAriaReadonly === null) {
      this._element.removeAttribute('aria-readonly')
    }

    super.dispose()
  }

  // Private
  _managedClassNames(): string[] {
    return [CLASS_NAME_RATING, CLASS_NAME_DISABLED, CLASS_NAME_READONLY, ...this._sizeClassNames]
  }

  _radios(): HTMLInputElement[] {
    return SelectorEngine.find<HTMLInputElement>(SELECTOR_RATING_ITEM_INPUT, this._element as ParentNode)
  }

  _removeRating(): ChildNode | null {
    this._disposeTooltips()

    for (const follower of this._userValidity) {
      follower.stop()
    }

    this._userValidity = []
    this._releaseValidationState?.()
    this._releaseValidationState = null

    const anchor = this._items.at(-1)?.nextSibling ?? null

    for (const item of this._items) {
      item.remove()
    }

    this._items = []
    return anchor
  }

  _disposeTooltips(): void {
    for (const item of SelectorEngine.find(`${SELECTOR_RATING_ITEM}, ${SELECTOR_RATING_ITEM} > div`, this._element as ParentNode)) {
      Tooltip.getInstance(item)?.dispose()
    }

    this._tooltip = null
  }

  _addEventListeners(): void {
    if (this._form) {
      EventHandler.on(this._resetRoot, EVENT_RESET, SELECTOR_FORM, this._resetHandler)
    }

    EventHandler.on(this._element, EVENT_CLICK, SELECTOR_RATING_ITEM_INPUT, (event: any) => {
      const { target } = event

      if (this._config.readonly) {
        event.preventDefault()
        return
      }

      if (this._config.disabled) {
        return
      }

      // eslint-disable-next-line eqeqeq
      if (this._config.allowClear && this._currentValue == target.value) {
        this._currentValue = null
        target.checked = false
        this._resetLabels()
        this._dismissValidationState()

        EventHandler.trigger(this._element, EVENT_CHANGE, {
          value: null
        })
      }
    })

    EventHandler.on(this._element, EVENT_INPUT, SELECTOR_RATING_ITEM_INPUT, () => {
      if (!this._config.disabled && !this._config.readonly) {
        this._dismissValidationState()
      }
    })

    EventHandler.on(this._element, EVENT_CHANGE, SELECTOR_RATING_ITEM_INPUT, ({ target }: any) => {
      if (this._config.disabled || this._config.readonly) {
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
      if (this._config.disabled || this._config.readonly) {
        return
      }

      const label = (target as HTMLElement).closest(SELECTOR_RATING_ITEM_LABEL)
      const labels = SelectorEngine.find(SELECTOR_RATING_ITEM_LABEL, this._element as ParentNode)
      this._resetLabels()

      const input = SelectorEngine.findOne(SELECTOR_RATING_ITEM_INPUT, label!.parentElement as ParentNode)

      EventHandler.trigger(this._element, EVENT_HOVER, {
        value: (input as HTMLInputElement).value
      })

      this._createTooltip(label!.parentElement, (input as HTMLInputElement).value)

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
      if (this._config.disabled || this._config.readonly) {
        return
      }

      if (this._tooltip) {
        this._tooltip.hide()
      }

      const checkedInput = SelectorEngine.findOne(`${SELECTOR_RATING_ITEM_INPUT}[value="${this._currentValue}"]`, this._element as ParentNode)
      this._resetLabels()

      EventHandler.trigger(this._element, EVENT_HOVER, {
        value: null
      })

      this._highlightLabels(checkedInput)
    })

    EventHandler.on(this._element, EVENT_KEYDOWN, SELECTOR_RATING_ITEM_INPUT, (event: any) => {
      if (this._config.readonly && event.key.startsWith('Arrow')) {
        event.preventDefault()
      }
    })

    EventHandler.on(this._element, EVENT_FOCUSIN, SELECTOR_RATING_ITEM_INPUT, ({ target }: any) => {
      if (this._config.disabled || this._config.readonly) {
        return
      }

      EventHandler.trigger(this._element, EVENT_HOVER, {
        value: target.value
      })

      this._createTooltip(target.parentElement, target.value)
    })

    EventHandler.on(this._element, EVENT_FOCUSOUT, SELECTOR_RATING_ITEM_INPUT, () => {
      if (this._config.disabled || this._config.readonly) {
        return
      }

      EventHandler.trigger(this._element, EVENT_HOVER, {
        value: null
      })

      if (this._tooltip) {
        this._tooltip.hide()
      }
    })
  }

  _createTooltip(selector: any, value: any): void {
    if (this._config.tooltips === false) {
      return
    }

    if (this._tooltip) {
      this._tooltip.hide()
    }

    let tooltipTitle

    if (typeof this._config.tooltips === 'boolean') {
      tooltipTitle = value
    }

    if (typeof this._config.tooltips === 'object') {
      tooltipTitle = this._config.tooltips[value]
    }

    if (Array.isArray(this._config.tooltips)) {
      tooltipTitle = this._config.tooltips[value - 1]
    }

    this._tooltip = new Tooltip(selector, {
      title: tooltipTitle
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

  _createRating(anchor: ChildNode | null = null): void {
    this._element.classList.add(CLASS_NAME_RATING)
    this._element.classList.toggle(CLASS_NAME_DISABLED, Boolean(this._config.disabled))
    this._element.classList.toggle(CLASS_NAME_READONLY, Boolean(this._config.readonly))

    if (this._sizeClassName) {
      this._element.classList.remove(this._sizeClassName)
      this._sizeClassName = null
    }

    if (this._config.size) {
      const sizeClassName = `rating-${this._config.size}`
      this._element.classList.remove(...SIZE_CLASS_NAMES)
      this._element.classList.add(sizeClassName)
      this._sizeClassName = sizeClassName

      for (const className of [...SIZE_CLASS_NAMES, sizeClassName]) {
        this._sizeClassNames.add(className)
      }
    }

    if (!this._element.hasAttribute('role')) {
      this._element.setAttribute('role', 'radiogroup')
    }

    if (this._hostAriaReadonly === null) {
      if (this._config.readonly) {
        this._element.setAttribute('aria-readonly', 'true')
      } else {
        this._element.removeAttribute('aria-readonly')
      }
    }

    if (this._hostAriaRequired === null) {
      if (this._isRequired()) {
        this._element.setAttribute('aria-required', 'true')
      } else {
        this._element.removeAttribute('aria-required')
      }
    }

    this._items = Array.from({ length: this._config.itemCount }, (_, index) => this._createRatingItem(index))

    for (const item of this._items) {
      this._element.insertBefore(item, anchor)
    }

    if (!this._items.some(item => item.querySelector(`${SELECTOR_RATING_ITEM_INPUT}:checked`))) {
      this._currentValue = null
      this._resetLabels()
    }

    const radios = this._radios()
    this._userValidity = radios.map(radio => followUserValidity(radio, () => this._updateValidity()))
    this._releaseValidationState = ownValidationState(...radios)
    this._updateValidity()
  }

  _isRequired(): boolean {
    return this._config.required && !this._config.readonly
  }

  _dismissValidationState(serial: number = Number.POSITIVE_INFINITY): void {
    if (this._stateSerial > serial || (this._config.validationState === null && this._serverMarks.length === 0)) {
      return
    }

    this._config.validationState = null
    this._serverMarks = []
    this._updateValidity()
  }

  _updateValidity(): void {
    const [first] = this._radios()

    if (!first) {
      return
    }

    const givenState = getValidationState(this._config.validationState) ??
      getValidationState(null, this._serverMarks.includes(CLASS_NAME_IS_VALID), this._serverMarks.includes(CLASS_NAME_IS_INVALID))

    if (givenState !== 'invalid') {
      setStateValidity(first, false)
    }

    const reported = this._userValidity.map(follower => follower.read())
    const state = givenState ?? (reported.includes('invalid') ? 'invalid' : reported.find(Boolean))
    const stateClass = state ? `is-${state}` : null

    if (stateClass !== this._stateClass) {
      if (this._stateClass) {
        this._element.classList.remove(this._stateClass)
      }

      if (stateClass) {
        this._element.classList.add(stateClass)
      }

      this._stateClass = stateClass
    }

    setStateValidity(first, givenState === 'invalid' && !this._config.readonly)
    this._writeFeedbackIds(state === 'invalid' ? getFeedbackIds(first) : [])

    if (this._hostAriaInvalid !== null) {
      return
    }

    if (state !== 'invalid') {
      this._element.removeAttribute('aria-invalid')
    } else if (!this._element.hasAttribute('aria-invalid')) {
      this._element.setAttribute('aria-invalid', 'true')
    }
  }

  _writeFeedbackIds(feedbackIds: string[]): void {
    const pageIds = (this._element.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(id => id && !this._feedbackIds.includes(id))
    this._feedbackIds = feedbackIds.filter(id => !pageIds.includes(id))
    const describedBy = [...pageIds, ...this._feedbackIds].join(' ')

    if (!describedBy) {
      this._element.removeAttribute('aria-describedby')
    } else if (this._element.getAttribute('aria-describedby') !== describedBy) {
      this._element.setAttribute('aria-describedby', describedBy)
    }
  }

  _createRatingItem(index: number): HTMLElement {
    const ratingItemElement = document.createElement('div')
    ratingItemElement.classList.add(CLASS_NAME_RATING_ITEM)

    const numberOfRadios = 1 / this._config.precision

    // eslint-disable-next-line array-callback-return
    Array.from({ length: numberOfRadios }, (_, _index) => {
      const ratingItemId = getUID(`${this.constructor.NAME}${index}`).toString()
      const isNotLastItem = _index + 1 < numberOfRadios
      const value = numberOfRadios === 1 ? index + 1 : ((_index + 1) * (Number(this._config.precision))) + index

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

      if (typeof this._config.ariaLabel === 'function') {
        ratingItemInputElement.setAttribute('aria-label', this._config.ariaLabel(value, this._config.itemCount))
      }

      if (this._config.disabled) {
        ratingItemInputElement.setAttribute('disabled', true as any)
      }

      ratingItemInputElement.required = this._isRequired()

      // eslint-disable-next-line eqeqeq
      ratingItemInputElement.defaultChecked = this._config.value == value
      // eslint-disable-next-line eqeqeq
      ratingItemInputElement.checked = this._currentValue == value

      if (this._config.readonly && !ratingItemInputElement.checked) {
        ratingItemInputElement.tabIndex = -1
      }

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
  static ratingInterface(element: string | Element | null, config?: any, ...args: any[]): void {
    const data: any = Rating.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string](...args)
    }
  }

  static jQueryInterface(this: any, config: any, ...args: any[]): void {
    return jQueryDispatch(this, Rating, config, args)
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  const ratings = SelectorEngine.find(SELECTOR_DATA_RATING)
  for (let i = 0, len = ratings.length; i < len; i++) {
    Rating.ratingInterface(ratings[i])
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Rating)

export default Rating
export type { RatingConfig }

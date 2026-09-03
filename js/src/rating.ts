/**
 * --------------------------------------------------------------------------
 * CoreUI PRO rating.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import type { ComponentConfig } from './util/config.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import { sanitizeHtml, type SanitizerAllowList, SVGAllowlist } from './util/sanitizer.js'
import { defineJQueryPlugin, getUID } from './util/index.js'
import Tooltip from './tooltip.js'

/**
 * Constants
 */

const NAME = 'rating'
const DATA_KEY = 'coreui.rating'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'
const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn'])

const EVENT_CHANGE = `change${EVENT_KEY}`
const EVENT_CLICK = `click${EVENT_KEY}`
const EVENT_FOCUSIN = `focusin${EVENT_KEY}`
const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`
const EVENT_HOVER = `hover${EVENT_KEY}`
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

const SELECTOR_DATA_TOGGLE = '[data-coreui-toggle="rating"]'
const SELECTOR_RATING_ITEM = '.rating-item'
const SELECTOR_RATING_ITEM_INPUT = '.rating-item-input'
const SELECTOR_RATING_ITEM_LABEL = '.rating-item-label'

type RatingConfig = {
  activeIcon: string | null
  allowClear: boolean
  allowList: SanitizerAllowList
  ariaLabel: (value: number, itemCount: number) => string
  disabled: boolean
  highlightOnlySelected: boolean
  icon: string | null
  itemCount: number
  name: string | null
  precision: number
  readOnly: boolean
  sanitize: boolean
  sanitizeFn: ((unsafeHtml: string) => string) | null
  size: string | null
  tooltips: boolean | string[] | Record<string, string>
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
  readOnly: false,
  sanitize: true,
  sanitizeFn: null,
  size: null,
  tooltips: false,
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
  readOnly: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  size: '(string|null)',
  tooltips: '(array|boolean|object)',
  value: '(number|null)'
}

/**
 * Class definition
 */

class Rating extends BaseComponent {
  protected declare _currentValue: number | string | null
  protected declare _name: string
  protected declare _tooltip: any

  constructor(element?: string | Element | null, config?: ComponentConfig | null) {
    super(element)

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
  update(config: any): void {
    this._config = this._getConfig(config)
    this._currentValue = this._config.value

    this._disposeTooltips()
    this._element.innerHTML = ''
    this._createRating()
  }

  reset(value: number | null = null): void {
    this._currentValue = value

    this._disposeTooltips()
    this._element.innerHTML = ''
    this._createRating()

    EventHandler.trigger(this._element, EVENT_CHANGE, {
      value
    })
  }

  override dispose(): void {
    this._disposeTooltips()

    super.dispose()
  }

  // Private
  _disposeTooltips(): void {
    for (const item of SelectorEngine.find(SELECTOR_RATING_ITEM, this._element as ParentNode)) {
      Tooltip.getInstance(item)?.dispose()
    }

    this._tooltip = null
  }

  _addEventListeners(): void {
    EventHandler.on(this._element, EVENT_CLICK, SELECTOR_RATING_ITEM_INPUT, ({ target }: any) => {
      if (this._config.disabled || this._config.readOnly) {
        return
      }

      // eslint-disable-next-line eqeqeq
      if (this._config.allowClear && this._currentValue == target.value) {
        this._currentValue = null
        target.checked = false
        this._resetLabels()

        EventHandler.trigger(this._element, EVENT_CHANGE, {
          value: null
        })
      }
    })

    EventHandler.on(this._element, EVENT_CHANGE, SELECTOR_RATING_ITEM_INPUT, ({ target }: any) => {
      if (this._config.disabled || this._config.readOnly) {
        return
      }

      this._currentValue = target.value

      EventHandler.trigger(this._element, EVENT_CHANGE, {
        value: target.value
      })

      const inputs = SelectorEngine.find(SELECTOR_RATING_ITEM_INPUT, this._element as ParentNode)
      this._resetLabels()

      if (this._config.highlightOnlySelected) {
        const label = SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, target.parentElement as ParentNode)
        label!.classList.add(CLASS_NAME_ACTIVE)

        return
      }

      for (const input of inputs) {
        const label = SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, input.parentElement as ParentNode)

        label!.classList.add(CLASS_NAME_ACTIVE)

        if (input === target) {
          break
        }
      }
    })

    EventHandler.on(this._element, EVENT_MOUSEENTER, SELECTOR_RATING_ITEM_LABEL, ({ target }) => {
      if (this._config.disabled || this._config.readOnly) {
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
      if (this._config.disabled || this._config.readOnly) {
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

      if (checkedInput && this._config.highlightOnlySelected) {
        const label = SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, checkedInput.parentElement as ParentNode)
        label!.classList.add(CLASS_NAME_ACTIVE)

        return
      }

      if (checkedInput) {
        const inputs = SelectorEngine.find(SELECTOR_RATING_ITEM_INPUT, this._element as ParentNode)
        this._resetLabels()

        for (const input of inputs) {
          const label = SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, input.parentElement as ParentNode)
          label!.classList.add(CLASS_NAME_ACTIVE)

          if (input === checkedInput) {
            break
          }
        }
      }
    })

    EventHandler.on(this._element, EVENT_FOCUSIN, SELECTOR_RATING_ITEM_INPUT, ({ target }: any) => {
      EventHandler.trigger(this._element, EVENT_HOVER, {
        value: target.value
      })

      this._createTooltip(target.parentElement, target.value)
    })

    EventHandler.on(this._element, EVENT_FOCUSOUT, SELECTOR_RATING_ITEM_INPUT, () => {
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

  _createRating(): void {
    this._element.classList.add(CLASS_NAME_RATING)

    if (this._config.size) {
      this._element.classList.add(`rating-${this._config.size}`)
    }

    if (this._config.disabled) {
      this._element.classList.add(CLASS_NAME_DISABLED)
    }

    if (this._config.readOnly) {
      this._element.classList.add(CLASS_NAME_READONLY)
    }

    this._element.setAttribute('role', 'radiogroup')
    Array.from({ length: this._config.itemCount }, (_, index) => this._createRatingItem(index))
  }

  _createRatingItem(index: number): void {
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
        ratingItemIconElement.innerHTML = this._sanitizeIcon(typeof this._config.icon === 'object' ? this._config.icon[index + 1] : this._config.icon)

        ratingItemLabelElement.append(ratingItemIconElement)
      } else {
        const ratingItemIconElement = document.createElement('div')
        ratingItemIconElement.classList.add(CLASS_NAME_RATING_ITEM_ICON)

        ratingItemLabelElement.append(ratingItemIconElement)
      }

      if (this._config.icon && this._config.activeIcon) {
        const ratingItemIconActiveElement = document.createElement('div')
        ratingItemIconActiveElement.classList.add(CLASS_NAME_RATING_ITEM_CUSTOM_ICON_ACTIVE)
        ratingItemIconActiveElement.innerHTML = this._sanitizeIcon(typeof this._config.activeIcon === 'object' ? this._config.activeIcon[index + 1] : this._config.activeIcon)

        ratingItemLabelElement.append(ratingItemIconActiveElement)
      }

      // Create input
      const ratingItemInputElement = document.createElement('input')
      ratingItemInputElement.classList.add(CLASS_NAME_RATING_ITEM_INPUT)
      ratingItemInputElement.id = ratingItemId
      ratingItemInputElement.type = 'radio'
      ratingItemInputElement.value = value as any
      ratingItemInputElement.name = this._name

      if (typeof this._config.ariaLabel === 'function') {
        ratingItemInputElement.setAttribute('aria-label', this._config.ariaLabel(value, this._config.itemCount))
      }

      if (this._config.disabled || this._config.readOnly) {
        ratingItemInputElement.setAttribute('disabled', true as any)
      }

      if (this._currentValue === value) {
        ratingItemInputElement.checked = true
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

    this._element.append(ratingItemElement)
  }

  _sanitizeIcon(icon: any): any {
    return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon
  }

  override _getConfig(config?: any): ComponentConfig {
    const dataAttributes = Manipulator.getDataAttributes(this._element)

    for (const dataAttribute of Object.keys(dataAttributes)) {
      if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
        delete dataAttributes[dataAttribute]
      }
    }

    config = {
      ...dataAttributes,
      ...(typeof config === 'object' && config ? config : {})
    }
    config = this._mergeConfigObj(config)
    config = this._configAfterMerge(config)
    this._typeCheckConfig(config)

    return config
  }

  // Static
  static ratingInterface(element: string | Element | null, config?: any): void {
    const data: any = Rating.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config as string] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string]()
    }
  }

  static jQueryInterface(this: any, config: any): void {
    return this.each(function (this: HTMLElement) {
      const data: any = Rating.getOrCreateInstance(this, config)

      if (typeof config !== 'string') {
        return
      }

      if (data[config as string] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config as string](this)
    })
  }
}

/**
 * Data API implementation
 */

EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
  const ratings = SelectorEngine.find(SELECTOR_DATA_TOGGLE)
  for (let i = 0, len = ratings.length; i < len; i++) {
    Rating.ratingInterface(ratings[i])
  }
})

/**
 * jQuery
 */

defineJQueryPlugin(Rating)

export default Rating

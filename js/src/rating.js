/**
 * --------------------------------------------------------------------------
 * CoreUI PRO rating.js
 * License (https://coreui.io/pro/license/)
 * --------------------------------------------------------------------------
 */

import BaseComponent from './base-component.js'
import EventHandler from './dom/event-handler.js'
import Manipulator from './dom/manipulator.js'
import SelectorEngine from './dom/selector-engine.js'
import { DefaultAllowlist, sanitizeHtml } from './util/sanitizer.js'
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
const SELECTOR_RATING_ITEM_INPUT = '.rating-item-input'
const SELECTOR_RATING_ITEM_LABEL = '.rating-item-label'

// js-docs-start svg-allow-list
export const svgAllowList = {
  ...DefaultAllowlist,
  svg: ['xmlns', 'version', 'baseprofile', 'width', 'height', 'viewbox', 'preserveaspectratio', 'aria-hidden', 'role', 'focusable'],
  g: ['id', 'class', 'transform', 'style'],
  path: ['id', 'class', 'd', 'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity'],
  circle: ['id', 'class', 'cx', 'cy', 'r', 'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity'],
  rect: ['id', 'class', 'x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity'],
  ellipse: ['id', 'class', 'cx', 'cy', 'rx', 'ry', 'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity'],
  line: ['id', 'class', 'x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width', 'stroke-opacity'],
  polygon: ['id', 'class', 'points', 'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity'],
  polyline: ['id', 'class', 'points', 'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity'],
  text: ['id', 'class', 'x', 'y', 'dx', 'dy', 'text-anchor', 'font-family', 'font-size', 'font-weight', 'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity'],
  tspan: ['id', 'class', 'x', 'y', 'dx', 'dy', 'text-anchor', 'font-family', 'font-size', 'font-weight', 'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity'],
  defs: [],
  symbol: ['id', 'class', 'viewbox', 'preserveaspectratio'],
  use: ['id', 'class', 'x', 'y', 'width', 'height', 'href'],
  image: ['id', 'class', 'x', 'y', 'width', 'height', 'href', 'preserveaspectratio', 'xlink:href'],
  pattern: ['id', 'class', 'x', 'y', 'width', 'height', 'patternunits', 'patterncontentunits', 'patterntransform', 'preserveaspectratio'],
  lineargradient: ['id', 'class', 'gradientunits', 'x1', 'y1', 'x2', 'y2', 'spreadmethod', 'gradienttransform'],
  radialgradient: ['id', 'class', 'gradientunits', 'cx', 'cy', 'r', 'fx', 'fy', 'spreadmethod', 'gradienttransform'],
  mask: ['id', 'class', 'x', 'y', 'width', 'height', 'maskunits', 'maskcontentunits', 'masktransform'],
  clippath: ['id', 'class', 'clippathunits'],
  marker: ['id', 'class', 'markerunits', 'markerwidth', 'markerheight', 'orient', 'preserveaspectratio', 'viewbox', 'refx', 'refy'],
  title: [],
  desc: []
}
// js-docs-end svg-allow-list

const Default = {
  activeIcon: null,
  allowClear: false,
  allowList: svgAllowList,
  disabled: false,
  highlightOnlySelected: false,
  icon: null,
  itemCount: 5,
  name: null,
  precision: 1,
  readOnly: false,
  sanitizeFn: null,
  size: null,
  tooltips: false,
  value: null
}

const DefaultType = {
  activeIcon: '(object|string|null)',
  allowClear: 'boolean',
  allowList: 'object',
  disabled: 'boolean',
  highlightOnlySelected: 'boolean',
  icon: '(object|string|null)',
  itemCount: 'number',
  name: '(string|null)',
  precision: 'number',
  readOnly: 'boolean',
  sanitizeFn: '(null|function)',
  size: '(string|null)',
  tooltips: '(array|boolean|object)',
  value: '(number|null)'
}

/**
 * Class definition
 */

class Rating extends BaseComponent {
  constructor(element, config) {
    super(element)

    this._config = this._getConfig(config)
    this._currentValue = this._config.value
    this._name = this._config.name || getUID(`${this.constructor.NAME}-name-`).toString()
    this._tooltip = null

    this._createRating()
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
  update(config) {
    this._config = this._getConfig(config)
    this._currentValue = this._config.value

    this._element.innerHTML = ''
    this._createRating()
    this._addEventListeners()
  }

  reset(value = null) {
    this._currentValue = value

    this._element.innerHTML = ''
    this._createRating()
    this._addEventListeners()

    EventHandler.trigger(this._element, EVENT_CHANGE, {
      value
    })
  }

  // Private
  _addEventListeners() {
    EventHandler.on(this._element, EVENT_CLICK, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
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

    EventHandler.on(this._element, EVENT_CHANGE, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
      if (this._config.disabled || this._config.readOnly) {
        return
      }

      this._currentValue = target.value

      EventHandler.trigger(this._element, EVENT_CHANGE, {
        value: target.value
      })

      const inputs = SelectorEngine.find(SELECTOR_RATING_ITEM_INPUT, this._element)
      this._resetLabels()

      if (this._config.highlightOnlySelected) {
        const label = SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, target.parentElement)
        label.classList.add(CLASS_NAME_ACTIVE)

        return
      }

      for (const input of inputs) {
        const label = SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, input.parentElement)

        label.classList.add(CLASS_NAME_ACTIVE)

        if (input === target) {
          break
        }
      }
    })

    EventHandler.on(this._element, EVENT_MOUSEENTER, SELECTOR_RATING_ITEM_LABEL, ({ target }) => {
      if (this._config.disabled || this._config.readOnly) {
        return
      }

      const label = target.closest(SELECTOR_RATING_ITEM_LABEL)
      const labels = SelectorEngine.find(SELECTOR_RATING_ITEM_LABEL, this._element)
      this._resetLabels()

      const input = SelectorEngine.findOne(SELECTOR_RATING_ITEM_INPUT, label.parentElement)

      EventHandler.trigger(this._element, EVENT_HOVER, {
        value: input.value
      })

      this._createTooltip(label.parentElement, input.value)

      if (this._config.highlightOnlySelected) {
        label.classList.add(CLASS_NAME_ACTIVE)

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

      const checkedInput = SelectorEngine.findOne(`${SELECTOR_RATING_ITEM_INPUT}[value="${this._currentValue}"]`, this._element)
      this._resetLabels()

      EventHandler.trigger(this._element, EVENT_HOVER, {
        value: null
      })

      if (checkedInput && this._config.highlightOnlySelected) {
        const label = SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, checkedInput.parentElement)
        label.classList.add(CLASS_NAME_ACTIVE)

        return
      }

      if (checkedInput) {
        const inputs = SelectorEngine.find(SELECTOR_RATING_ITEM_INPUT, this._element)
        this._resetLabels()

        for (const input of inputs) {
          const label = SelectorEngine.findOne(SELECTOR_RATING_ITEM_LABEL, input.parentElement)
          label.classList.add(CLASS_NAME_ACTIVE)

          if (input === checkedInput) {
            break
          }
        }
      }
    })

    EventHandler.on(this._element, EVENT_FOCUSIN, SELECTOR_RATING_ITEM_INPUT, ({ target }) => {
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

  _createTooltip(selector, value) {
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

  _configAfterMerge(config) {
    if (typeof config.tooltips === 'string') {
      config.tooltips = config.tooltips.split(',')
    }

    return config
  }

  _resetLabels() {
    const labels = SelectorEngine.find(SELECTOR_RATING_ITEM_LABEL, this._element)

    for (const label of labels) {
      label.classList.remove(CLASS_NAME_ACTIVE)
    }
  }

  _createRating() {
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

  _createRatingItem(index) {
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

      if (!this._config.highlightOnlySelected && this._currentValue >= value) {
        ratingItemLabelElement.classList.add(CLASS_NAME_ACTIVE)
      }

      if (isNotLastItem) {
        ratingItemLabelElement.style.zIndex = (1 / this._config.precision) - _index
        ratingItemLabelElement.style.position = 'absolute'
        ratingItemLabelElement.style.width = `${this._config.precision * (_index + 1) * 100}%`
        ratingItemLabelElement.style.overflow = 'hidden'
        ratingItemLabelElement.style.opacity = 0
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
      ratingItemInputElement.value = value
      ratingItemInputElement.name = this._name

      if (this._config.disabled || this._config.readOnly) {
        ratingItemInputElement.setAttribute('disabled', true)
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

  _sanitizeIcon(icon) {
    return this._config.sanitize ? sanitizeHtml(icon, this._config.allowList, this._config.sanitizeFn) : icon
  }

  _getConfig(config) {
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
  static ratingInterface(element, config) {
    const data = Rating.getOrCreateInstance(element, config)

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(config) {
    return this.each(function () {
      const data = Rating.getOrCreateInstance(this, config)

      if (typeof config !== 'string') {
        return
      }

      if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config](this)
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

/**
 * --------------------------------------------------------------------------
 * CoreUI (v3.2.0): class-toggler.js
 * Licensed under MIT (https://coreui.io/license)
 * --------------------------------------------------------------------------
 */

import {
  getjQuery
} from './util/index'
import Data from './dom/data'
import EventHandler from './dom/event-handler'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'class-toggler'
const VERSION = '3.2.0'
const DATA_KEY = 'coreui.class-toggler'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const Default = {
  breakpoints: '-sm,-md,-lg,-xl',
  postfix: '-show',
  responsive: false,
  target: 'body'
}

const CLASS_NAME_CLASS_TOGGLER = 'c-class-toggler'

const EVENT_CLASS_TOGGLE = 'classtoggle'
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_CLASS_TOGGLER = '.c-class-toggler'

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class ClassToggler {
  constructor(element) {
    this._element = element
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  // Public
  toggle() {
    this._getElementDataAttributes(this._element).forEach(dataAttributes => {
      let element
      const { target, toggle } = dataAttributes
      if (target === '_parent' || target === 'parent') {
        element = this._element.parentNode
      } else {
        element = document.querySelector(target)
      }

      toggle.forEach(object => {
        const { className, responsive, postfix } = object
        const breakpoints = (typeof object.breakpoints === 'undefined' || object.breakpoints === null) ? null : this._arrayFromString(object.breakpoints)

        // eslint-disable-next-line no-negated-condition
        if (!responsive) {
          const add = element.classList.toggle(className)
          const event = new CustomEvent(EVENT_CLASS_TOGGLE, {
            detail: {
              target,
              add,
              className
            }
          })
          element.dispatchEvent(event)
        } else {
          let currentBreakpoint
          breakpoints.forEach(breakpoint => {
            if (className.includes(breakpoint)) {
              currentBreakpoint = breakpoint
            }
          })
          const responsiveClassNames = []
          if (typeof currentBreakpoint === 'undefined') {
            responsiveClassNames.push(className)
          } else {
            responsiveClassNames.push(className.replace(`${currentBreakpoint}${postfix}`, postfix))
            breakpoints.splice(0, breakpoints.indexOf(currentBreakpoint) + 1).forEach(breakpoint => {
              responsiveClassNames.push(className.replace(`${currentBreakpoint}${postfix}`, `${breakpoint}${postfix}`))
            })
          }

          let addResponsiveClasses = false
          responsiveClassNames.forEach(responsiveClassName => {
            if (element.classList.contains(responsiveClassName)) {
              addResponsiveClasses = true
            }
          })

          if (addResponsiveClasses) {
            responsiveClassNames.forEach(responsiveClassName => {
              element.classList.remove(responsiveClassName)
              const event = new CustomEvent(EVENT_CLASS_TOGGLE, {
                detail: {
                  target,
                  add: false,
                  className: responsiveClassName
                }
              })
              element.dispatchEvent(event)
            })
          } else {
            element.classList.add(className)
            const event = new CustomEvent(EVENT_CLASS_TOGGLE, {
              detail: {
                target,
                add: true,
                className
              }
            })
            element.dispatchEvent(event)
          }
        }
      })
    })
  }

  // Private

  _arrayFromString(string) {
    return string.replace(/ /g, '').split(',')
  }

  _isArray(array) {
    try {
      JSON.parse(array.replace(/'/g, '"'))
      return true
    } catch {
      return false
    }
  }

  _convertToArray(array) {
    return JSON.parse(array.replace(/'/g, '"'))
  }

  _getDataAttributes(data, attribute) {
    const dataAttribute = data[attribute]
    return this._isArray(dataAttribute) ? this._convertToArray(dataAttribute) : dataAttribute
  }

  _getToggleDetails(classNames, responsive, breakpoints, postfix) {
    class ToggleDetails {
      // eslint-disable-next-line default-param-last
      constructor(className, responsive = Default.responsive, breakpoints, postfix) {
        this.className = className
        this.responsive = responsive
        this.breakpoints = breakpoints
        this.postfix = postfix
      }
    }

    const toggle = []

    if (Array.isArray(classNames)) {
      classNames.forEach((className, index) => {
        responsive = Array.isArray(responsive) ? responsive[index] : responsive
        breakpoints = responsive ? (Array.isArray(breakpoints) ? breakpoints[index] : breakpoints) : null
        postfix = responsive ? (Array.isArray(postfix) ? postfix[index] : postfix) : null
        toggle.push(new ToggleDetails(className, responsive, breakpoints, postfix))
      })
    } else {
      breakpoints = responsive ? breakpoints : null
      postfix = responsive ? postfix : null
      toggle.push(new ToggleDetails(classNames, responsive, breakpoints, postfix))
    }

    return toggle
  }

  _ifArray(array, index) {
    return Array.isArray(array) ? array[index] : array
  }

  _getElementDataAttributes(element) {
    const data = element.dataset
    const targets = (typeof data.target === 'undefined') ? Default.target : this._getDataAttributes(data, 'target')
    const classNames = (typeof data.class === 'undefined') ? 'undefined' : this._getDataAttributes(data, 'class')
    const responsive = (typeof data.responsive === 'undefined') ? Default.responsive : this._getDataAttributes(data, 'responsive')
    const breakpoints = (typeof data.breakpoints === 'undefined') ? Default.breakpoints : this._getDataAttributes(data, 'breakpoints')
    const postfix = (typeof data.postfix === 'undefined') ? Default.postfix : this._getDataAttributes(data, 'postfix')

    const toggle = []

    class TargetDetails {
      constructor(target, toggle) {
        this.target = target
        this.toggle = toggle
      }
    }

    if (Array.isArray(targets)) {
      targets.forEach((target, index) => {
        toggle.push(new TargetDetails(target, this._getToggleDetails(this._ifArray(classNames, index), this._ifArray(responsive, index), this._ifArray(breakpoints, index), this._ifArray(postfix, index))))
      })
    } else {
      toggle.push(new TargetDetails(targets, this._getToggleDetails(classNames, responsive, breakpoints, postfix)))
    }

    return toggle
  }

  // Static

  static _classTogglerInterface(element, config) {
    let data = Data.getData(element, DATA_KEY)
    const _config = typeof config === 'object' && config

    if (!data) {
      data = new ClassToggler(element, _config)
    }

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError(`No method named "${config}"`)
      }

      data[config]()
    }
  }

  static jQueryInterface(config) {
    return this.each(function () {
      ClassToggler._classTogglerInterface(this, config)
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_CLASS_TOGGLER, event => {
  event.preventDefault()
  let toggler = event.target
  if (!toggler.classList.contains(CLASS_NAME_CLASS_TOGGLER)) {
    toggler = toggler.closest(SELECTOR_CLASS_TOGGLER)
  }

  ClassToggler._classTogglerInterface(toggler, 'toggle')
})

const $ = getjQuery()

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .c-class-toggler to jQuery only if jQuery is present
 */

if ($) {
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = ClassToggler.jQueryInterface
  $.fn[NAME].Constructor = ClassToggler
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return ClassToggler.jQueryInterface
  }
}

export default ClassToggler

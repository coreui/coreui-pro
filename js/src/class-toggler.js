/**
 * --------------------------------------------------------------------------
 * CoreUI (v3.2.1): class-toggler.js
 * Licensed under MIT (https://coreui.io/license)
 * --------------------------------------------------------------------------
 */

import {
  getjQuery,
  typeCheckConfig
} from './util/index'
import Data from './dom/data'
import EventHandler from './dom/event-handler'
import Manipulator from './dom/manipulator'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'class-toggler'
const VERSION = '3.2.1'
const DATA_KEY = 'coreui.class-toggler'
const EVENT_KEY = `.${DATA_KEY}`
const DATA_API_KEY = '.data-api'

const DefaultType = {
  attach: '(null|array|string)',
  breakpoints: '(null|array|string)',
  detach: '(null|array|string)',
  postfix: '(null|string)',
  responsive: '(null|boolean)',
  target: '(null|string)',
  toggle: '(null|array|string)'
}

const Default = {
  attach: null,
  breakpoints: ['', 'sm', 'md', 'lg', 'xl'],
  detach: null,
  postfix: '-show',
  responsive: false,
  target: 'body',
  toggle: null
}

const CLASS_NAME_CLASS_TOGGLER = 'c-class-toggler'

const EVENT_CLASS_ATTACH = 'classattached'
const EVENT_CLASS_DETACH = 'classdetached'
const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`

const SELECTOR_CLASS_TOGGLER = '.c-class-toggler'

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class ClassToggler {
  constructor(element, config) {
    this._element = element
    this._config = this._getConfig(config)

    Data.setData(element, DATA_KEY, this)
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  static get Default() {
    return Default
  }

  static get DefaultType() {
    return DefaultType
  }

  // Public
  attach() {
    const target = document.querySelector(this._config.target)
    const classNames = this._config.attach.split(',')

    classNames.forEach(className => {
      target.classList.add(className)
      this._customEvent(EVENT_CLASS_ATTACH, target, className)
    })
  }

  detach() {
    const target = document.querySelector(this._config.target)
    const classNames = this._config.detach.split(',')

    classNames.forEach(className => {
      if (this._config.responsive) {
        this._updateResponsiveClassNames(className).forEach(className => {
          target.classList.remove(className)
          this._customEvent(EVENT_CLASS_DETACH, target, className)
        })
      } else {
        target.classList.remove(className)
        this._customEvent(EVENT_CLASS_DETACH, target, className)
      }
    })
  }

  toggle() {
    const target = document.querySelector(this._config.target)
    const classNames = this._config.toggle.split(',')

    classNames.forEach(className => {
      if (target.classList.contains(className)) {
        this._config.detach = className
        this.detach()
      }

      if (!target.classList.contains(className)) {
        this._config.attach = className
        this.attach()
      }
    })
  }

  class() {
    this._config.toggle = this.config.class
  }

  // Private

  _customEvent(eventName, target, className) {
    const event = new CustomEvent(eventName, {
      detail: {
        target,
        className
      }
    })
    target.dispatchEvent(event)
  }

  _breakpoint(className) {
    const { breakpoints } = this._config
    return breakpoints.filter(breakpoint => breakpoint.length > 0).filter(breakpoint => className.includes(breakpoint))[0]
  }

  _breakpoints(className) {
    const { breakpoints } = this._config
    return breakpoints.slice(0, breakpoints.indexOf(breakpoints.filter(breakpoint => breakpoint.length > 0).filter(breakpoint => className.includes(breakpoint))[0]) + 1)
  }

  _updateResponsiveClassNames(className) {
    const bp = this._breakpoint(className)
    return this._breakpoints(className).map(breakpoint => breakpoint.length > 0 ? className.replace(bp, breakpoint) : className.replace(`-${bp}`, breakpoint))
  }

  // _newBreakpoints(className)

  // _breakpoints(className) {
  //   const { breakpoints } = this._config
  //   let newBp = []
  //   breakpoints.some((element, index, array) => {
  //     if (element.lenght > 0) {
  //       if (className.includes(element)) {
  //         newBp.push(element)
  //       }
  //     }
  //   })
  // }

  // _classNamesWithBreakpoint(className) {
  //   const { breakpoints } = this._config
  //   const idx = breakpoints.filter((breakpoint, index) => breakpoint.lenght > 0 ? className.includes(breakpoint) ? index : false : false)
  //   const selectedBreakpoints = breakpoints.filter((breakpoint, index) => )
  // }

  // _whichBreakpoint(className) {
  //   const { breakpoints } = this._config

  //   return breakpoints.filter((breakpoint, index) => breakpoint.lenght > 0 ? className.includes(breakpoint) ? index : false : false)
  // }

  // toggle() {
  //   this._getElementDataAttributes(this._element).forEach(dataAttributes => {
  //     let element
  //     const { target, toggle } = dataAttributes
  //     if (target === '_parent' || target === 'parent') {
  //       element = this._element.parentNode
  //     } else {
  //       element = document.querySelector(target)
  //     }

  //     toggle.forEach(object => {
  //       const { className, responsive, postfix } = object
  //       const breakpoints = (typeof object.breakpoints === 'undefined' || object.breakpoints === null) ? null : this._arrayFromString(object.breakpoints)

  //       // eslint-disable-next-line no-negated-condition
  //       if (!responsive) {
  //         const add = element.classList.toggle(className)
  //         const event = new CustomEvent(EVENT_CLASS_TOGGLE, {
  //           detail: {
  //             target,
  //             add,
  //             className
  //           }
  //         })
  //         element.dispatchEvent(event)
  //       } else {
  //         let currentBreakpoint
  //         breakpoints.forEach(breakpoint => {
  //           if (className.includes(breakpoint)) {
  //             currentBreakpoint = breakpoint
  //           }
  //         })
  //         const responsiveClassNames = []
  //         if (typeof currentBreakpoint === 'undefined') {
  //           responsiveClassNames.push(className)
  //         } else {
  //           responsiveClassNames.push(className.replace(`${currentBreakpoint}${postfix}`, postfix))
  //           breakpoints.splice(0, breakpoints.indexOf(currentBreakpoint) + 1).forEach(breakpoint => {
  //             responsiveClassNames.push(className.replace(`${currentBreakpoint}${postfix}`, `${breakpoint}${postfix}`))
  //           })
  //         }

  //         let addResponsiveClasses = false
  //         responsiveClassNames.forEach(responsiveClassName => {
  //           if (element.classList.contains(responsiveClassName)) {
  //             addResponsiveClasses = true
  //           }
  //         })

  //         if (addResponsiveClasses) {
  //           responsiveClassNames.forEach(responsiveClassName => {
  //             element.classList.remove(responsiveClassName)
  //             const event = new CustomEvent(EVENT_CLASS_TOGGLE, {
  //               detail: {
  //                 target,
  //                 add: false,
  //                 className: responsiveClassName
  //               }
  //             })
  //             element.dispatchEvent(event)
  //           })
  //         } else {
  //           element.classList.add(className)
  //           const event = new CustomEvent(EVENT_CLASS_TOGGLE, {
  //             detail: {
  //               target,
  //               add: true,
  //               className
  //             }
  //           })
  //           element.dispatchEvent(event)
  //         }
  //       }
  //     })
  //   })
  // }

  // Private

  _arrayFromString(string) {
    return string.replace(/ /g, '').split(',')
  }

  _isArray(array) {
    // console.log(array.replace(/'/g, '"'))
    // try {
    //   JSON.parse(array.replace(/'/g, '"'))
    //   return true
    // } catch {
    //   return false
    // }
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

  // _getElementDataAttributes(element) {
  //   const data = element.dataset
  //   const targets = (typeof data.target === 'undefined') ? Default.target : this._getDataAttributes(data, 'target')
  //   const classNames = (typeof data.class === 'undefined') ? 'undefined' : this._getDataAttributes(data, 'class')
  //   const responsive = (typeof data.responsive === 'undefined') ? Default.responsive : this._getDataAttributes(data, 'responsive')
  //   const breakpoints = (typeof data.breakpoints === 'undefined') ? Default.breakpoints : this._getDataAttributes(data, 'breakpoints')
  //   const postfix = (typeof data.postfix === 'undefined') ? Default.postfix : this._getDataAttributes(data, 'postfix')

  //   const toggle = []

  //   class TargetDetails {
  //     constructor(target, toggle) {
  //       this.target = target
  //       this.toggle = toggle
  //     }
  //   }

  //   if (Array.isArray(targets)) {
  //     targets.forEach((target, index) => {
  //       toggle.push(new TargetDetails(target, this._getToggleDetails(this._ifArray(classNames, index), this._ifArray(responsive, index), this._ifArray(breakpoints, index), this._ifArray(postfix, index))))
  //     })
  //   } else {
  //     toggle.push(new TargetDetails(targets, this._getToggleDetails(classNames, responsive, breakpoints, postfix)))
  //   }

  //   return toggle
  // }

  // Static

  _getConfig(config) {
    config = {
      ...this.constructor.Default,
      ...Manipulator.getDataAttributes(this._element),
      ...config
    }

    typeCheckConfig(
      NAME,
      config,
      this.constructor.DefaultType
    )

    return config
  }

  // _getConfig(config) {
  //   config = {
  //     ...Default,
  //     ...Manipulator.getDataAttributes(this.element),
  //     ...config
  //   }

  //   typeCheckConfig(
  //     NAME,
  //     config,
  //     DefaultType
  //   )

  //   return config
  // }

  static classTogglerInterface(element, config) {
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
      ClassToggler.classTogglerInterface(this, config)
    })
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */

EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_CLASS_TOGGLER, function (event) {
  event.preventDefault()
  event.stopPropagation()
  const toggler = event.target

  if (typeof toggler.dataset.attach !== 'undefined') {
    ClassToggler.classTogglerInterface(this, 'attach')
  }

  if (typeof toggler.dataset.detach !== 'undefined') {
    ClassToggler.classTogglerInterface(this, 'detach')
  }

  if (typeof toggler.dataset.toggle !== 'undefined') {
    ClassToggler.classTogglerInterface(this, 'toggle')
  }

  if (typeof toggler.dataset.class !== 'undefined') {
    ClassToggler.classTogglerInterface(this, 'class')
  }
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

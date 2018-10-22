import $ from 'jquery'
import PerfectScrollbar from 'perfect-scrollbar'
import toggleClasses from './toggle-classes'

/**
 * --------------------------------------------------------------------------
 * CoreUI (v2.0.20): sidebar.js
 * Licensed under MIT (https://coreui.io/license)
 * --------------------------------------------------------------------------
 */

const Sidebar = (($) => {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME                = 'sidebar'
  const VERSION             = '2.0.20'
  const DATA_KEY            = 'coreui.sidebar'
  const EVENT_KEY           = `.${DATA_KEY}`
  const DATA_API_KEY        = '.data-api'
  const JQUERY_NO_CONFLICT  = $.fn[NAME]

  const Default = {
    transition : 400
  }

  const ClassName = {
    ACTIVE              : 'active',
    BRAND_MINIMIZED     : 'brand-minimized',
    NAV_DROPDOWN_TOGGLE : 'nav-dropdown-toggle',
    OPEN                : 'open',
    SIDEBAR_FIXED       : 'sidebar-fixed',
    SIDEBAR_MINIMIZED   : 'sidebar-minimized',
    SIDEBAR_OFF_CANVAS  : 'sidebar-off-canvas'
  }

  const Event = {
    CLICK         : 'click',
    DESTROY       : 'destroy',
    INIT          : 'init',
    LOAD_DATA_API : `load${EVENT_KEY}${DATA_API_KEY}`,
    TOGGLE        : 'toggle',
    UPDATE        : 'update'
  }

  const Selector = {
    BODY                 : 'body',
    BRAND_MINIMIZER      : '.brand-minimizer',
    NAV_DROPDOWN_TOGGLE  : '.nav-dropdown-toggle',
    NAV_DROPDOWN_ITEMS   : '.nav-dropdown-items',
    NAV_ITEM             : '.nav-item',
    NAV_LINK             : '.nav-link',
    NAV_LINK_QUERIED     : '.nav-link-queried',
    NAVIGATION_CONTAINER : '.sidebar-nav',
    NAVIGATION           : '.sidebar-nav > .nav',
    SIDEBAR              : '.sidebar',
    SIDEBAR_MINIMIZER    : '.sidebar-minimizer',
    SIDEBAR_TOGGLER      : '.sidebar-toggler'
  }

  const ShowClassNames = [
    'sidebar-show',
    'sidebar-sm-show',
    'sidebar-md-show',
    'sidebar-lg-show',
    'sidebar-xl-show'
  ]

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Sidebar {
    constructor(element) {
      this._element = element
      this.ps = null
      this.perfectScrollbar(Event.INIT)
      this.setActiveLink()
      this._addEventListeners()
    }

    // Getters

    static get VERSION() {
      return VERSION
    }

    // Public

    perfectScrollbar(event) {
      if (typeof PerfectScrollbar !== 'undefined') {
        const classList = document.body.classList
        if (event === Event.INIT && !classList.contains(ClassName.SIDEBAR_MINIMIZED)) {
          this.ps = this.makeScrollbar()
        }

        if (event === Event.DESTROY) {
          this.destroyScrollbar()
        }

        if (event === Event.TOGGLE) {
          if (classList.contains(ClassName.SIDEBAR_MINIMIZED)) {
            this.destroyScrollbar()
          } else {
            this.destroyScrollbar()
            this.ps = this.makeScrollbar()
          }
        }

        if (event === Event.UPDATE && !classList.contains(ClassName.SIDEBAR_MINIMIZED)) {
          // ToDo: Add smooth transition
          setTimeout(() => {
            this.destroyScrollbar()
            this.ps = this.makeScrollbar()
          }, Default.transition)
        }
      }
    }

    makeScrollbar(container = Selector.NAVIGATION_CONTAINER) {
      const ps = new PerfectScrollbar(document.querySelector(container), {
        suppressScrollX: true
      })
      // ToDo: find real fix for ps rtl
      ps.isRtl = false
      return ps
    }

    destroyScrollbar() {
      if (this.ps) {
        this.ps.destroy()
        this.ps = null
      }
    }

    setActiveLink() {
      $(Selector.NAVIGATION).find(Selector.NAV_LINK).each((key, value) => {
        let link = value
        let cUrl

        if (link.classList.contains(Selector.NAV_LINK_QUERIED)) {
          cUrl = String(window.location)
        } else {
          cUrl = String(window.location).split('?')[0]
        }

        if (cUrl.substr(cUrl.length - 1) === '#') {
          cUrl = cUrl.slice(0, -1)
        }
        if ($($(link))[0].href === cUrl) {
          $(link).addClass(ClassName.ACTIVE).parents(Selector.NAV_DROPDOWN_ITEMS).add(link).each((key, value) => {
            link = value
            $(link).parent().addClass(ClassName.OPEN)
          })
        }
      })
    }

    // Private

    _addEventListeners() {
      $(Selector.BRAND_MINIMIZER).on(Event.CLICK, (event) => {
        event.preventDefault()
        event.stopPropagation()
        $(Selector.BODY).toggleClass(ClassName.BRAND_MINIMIZED)
      })

      $(Selector.NAV_DROPDOWN_TOGGLE).on(Event.CLICK, (event) => {
        event.preventDefault()
        event.stopPropagation()
        const dropdown = event.target
        $(dropdown).parent().toggleClass(ClassName.OPEN)
        this.perfectScrollbar(Event.UPDATE)
      })

      $(Selector.SIDEBAR_MINIMIZER).on(Event.CLICK, (event) => {
        event.preventDefault()
        event.stopPropagation()
        $(Selector.BODY).toggleClass(ClassName.SIDEBAR_MINIMIZED)
        this.perfectScrollbar(Event.TOGGLE)
      })

      $(Selector.SIDEBAR_TOGGLER).on(Event.CLICK, (event) => {
        event.preventDefault()
        event.stopPropagation()
        const toggle = event.currentTarget.dataset.toggle
        toggleClasses(toggle, ShowClassNames)
      })

      $(`${Selector.NAVIGATION} > ${Selector.NAV_ITEM} ${Selector.NAV_LINK}:not(${Selector.NAV_DROPDOWN_TOGGLE})`).on(Event.CLICK, () => {
        document.body.classList.remove('sidebar-show')
      })
    }

    // Static

    static _jQueryInterface() {
      return this.each(function () {
        const $element = $(this)
        let data = $element.data(DATA_KEY)

        if (!data) {
          data = new Sidebar(this)
          $element.data(DATA_KEY, data)
        }
      })
    }
  }

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(window).on(Event.LOAD_DATA_API, () => {
    const sidebar = $(Selector.SIDEBAR)
    Sidebar._jQueryInterface.call(sidebar)
  })

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Sidebar._jQueryInterface
  $.fn[NAME].Constructor = Sidebar
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Sidebar._jQueryInterface
  }

  return Sidebar
})($)

export default Sidebar

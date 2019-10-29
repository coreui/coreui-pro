function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * --------------------------------------------------------------------------
 * CoreUI (v3.0.0-beta.1): dropdown.js
 * Licensed under MIT (https://coreui.io/license)
 *
 * This component is a modified version of the Bootstrap's dropdown.js
 * Bootstrap (v4.3.1): dropdown.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */
import { jQuery as $, getSelectorFromElement, isElement, makeArray, noop, typeCheckConfig } from './util/index';
import Data from './dom/data';
import EventHandler from './dom/event-handler';
import Manipulator from './dom/manipulator';
import Popper from 'popper.js';
import SelectorEngine from './dom/selector-engine';
/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

var NAME = 'dropdown';
var VERSION = '3.0.0-beta.1';
var DATA_KEY = 'coreui.dropdown';
var EVENT_KEY = "." + DATA_KEY;
var DATA_API_KEY = '.data-api';
var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

var SPACE_KEYCODE = 32; // KeyboardEvent.which value for space key

var TAB_KEYCODE = 9; // KeyboardEvent.which value for tab key

var ARROW_UP_KEYCODE = 38; // KeyboardEvent.which value for up arrow key

var ARROW_DOWN_KEYCODE = 40; // KeyboardEvent.which value for down arrow key

var RIGHT_MOUSE_BUTTON_WHICH = 3; // MouseEvent.which value for the right button (assuming a right-handed mouse)

var REGEXP_KEYDOWN = new RegExp(ARROW_UP_KEYCODE + "|" + ARROW_DOWN_KEYCODE + "|" + ESCAPE_KEYCODE);
var Event = {
  HIDE: "hide" + EVENT_KEY,
  HIDDEN: "hidden" + EVENT_KEY,
  SHOW: "show" + EVENT_KEY,
  SHOWN: "shown" + EVENT_KEY,
  CLICK: "click" + EVENT_KEY,
  CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY,
  KEYDOWN_DATA_API: "keydown" + EVENT_KEY + DATA_API_KEY,
  KEYUP_DATA_API: "keyup" + EVENT_KEY + DATA_API_KEY
};
var ClassName = {
  DISABLED: 'disabled',
  SHOW: 'show',
  DROPUP: 'dropup',
  DROPRIGHT: 'dropright',
  DROPLEFT: 'dropleft',
  MENURIGHT: 'dropdown-menu-right',
  POSITION_STATIC: 'position-static'
};
var Selector = {
  DATA_TOGGLE: '[data-toggle="dropdown"]',
  FORM_CHILD: '.dropdown form',
  MENU: '.dropdown-menu',
  NAVBAR_NAV: '.navbar-nav',
  HEADER_NAV: '.c-header-nav',
  VISIBLE_ITEMS: '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)'
};
var AttachmentMap = {
  TOP: 'top-start',
  TOPEND: 'top-end',
  BOTTOM: 'bottom-start',
  BOTTOMEND: 'bottom-end',
  RIGHT: 'right-start',
  RIGHTEND: 'right-end',
  LEFT: 'left-start',
  LEFTEND: 'left-end'
};
var Default = {
  offset: 0,
  flip: true,
  boundary: 'scrollParent',
  reference: 'toggle',
  display: 'dynamic'
};
var DefaultType = {
  offset: '(number|string|function)',
  flip: 'boolean',
  boundary: '(string|element)',
  reference: '(string|element)',
  display: 'string'
};
/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

var Dropdown =
/*#__PURE__*/
function () {
  function Dropdown(element, config) {
    this._element = element;
    this._popper = null;
    this._config = this._getConfig(config);
    this._menu = this._getMenuElement();
    this._inNavbar = this._detectNavbar();
    this._inHeader = this._detectHeader();

    this._addEventListeners();

    Data.setData(element, DATA_KEY, this);
  } // Getters


  var _proto = Dropdown.prototype;

  // Public
  _proto.toggle = function toggle() {
    if (this._element.disabled || this._element.classList.contains(ClassName.DISABLED)) {
      return;
    }

    var parent = Dropdown._getParentFromElement(this._element);

    var isActive = this._menu.classList.contains(ClassName.SHOW);

    Dropdown._clearMenus();

    if (isActive) {
      return;
    }

    var relatedTarget = {
      relatedTarget: this._element
    };
    var showEvent = EventHandler.trigger(parent, Event.SHOW, relatedTarget);

    if (showEvent.defaultPrevented) {
      return;
    } // Disable totally Popper.js for Dropdown in Navbar and Header


    if (!this._inNavbar && !this._inHeader) {
      /**
       * Check for Popper dependency
       * Popper - https://popper.js.org
       */
      if (typeof Popper === 'undefined') {
        throw new TypeError('Bootstrap\'s dropdowns require Popper.js (https://popper.js.org)');
      }

      var referenceElement = this._element;

      if (this._config.reference === 'parent') {
        referenceElement = parent;
      } else if (isElement(this._config.reference)) {
        referenceElement = this._config.reference; // Check if it's jQuery element

        if (typeof this._config.reference.jquery !== 'undefined') {
          referenceElement = this._config.reference[0];
        }
      } // If boundary is not `scrollParent`, then set position to `static`
      // to allow the menu to "escape" the scroll parent's boundaries
      // https://github.com/twbs/bootstrap/issues/24251


      if (this._config.boundary !== 'scrollParent') {
        parent.classList.add(ClassName.POSITION_STATIC);
      }

      this._popper = new Popper(referenceElement, this._menu, this._getPopperConfig());
    } // If this is a touch-enabled device we add extra
    // empty mouseover listeners to the body's immediate children;
    // only needed because of broken event delegation on iOS
    // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html


    if ('ontouchstart' in document.documentElement && !makeArray(SelectorEngine.closest(parent, Selector.NAVBAR_NAV)).length) {
      makeArray(document.body.children).forEach(function (elem) {
        return EventHandler.on(elem, 'mouseover', null, noop());
      });
    }

    if ('ontouchstart' in document.documentElement && !makeArray(SelectorEngine.closest(parent, Selector.HEADER_NAV)).length) {
      makeArray(document.body.children).forEach(function (elem) {
        return EventHandler.on(elem, 'mouseover', null, noop());
      });
    }

    this._element.focus();

    this._element.setAttribute('aria-expanded', true);

    Manipulator.toggleClass(this._menu, ClassName.SHOW);
    Manipulator.toggleClass(parent, ClassName.SHOW);
    EventHandler.trigger(parent, Event.SHOWN, relatedTarget);
  };

  _proto.show = function show() {
    if (this._element.disabled || this._element.classList.contains(ClassName.DISABLED) || this._menu.classList.contains(ClassName.SHOW)) {
      return;
    }

    var parent = Dropdown._getParentFromElement(this._element);

    var relatedTarget = {
      relatedTarget: this._element
    };
    var showEvent = EventHandler.trigger(parent, Event.SHOW, relatedTarget);

    if (showEvent.defaultPrevented) {
      return;
    }

    Manipulator.toggleClass(this._menu, ClassName.SHOW);
    Manipulator.toggleClass(parent, ClassName.SHOW);
    EventHandler.trigger(parent, Event.SHOWN, relatedTarget);
  };

  _proto.hide = function hide() {
    if (this._element.disabled || this._element.classList.contains(ClassName.DISABLED) || !this._menu.classList.contains(ClassName.SHOW)) {
      return;
    }

    var parent = Dropdown._getParentFromElement(this._element);

    var relatedTarget = {
      relatedTarget: this._element
    };
    var hideEvent = EventHandler.trigger(parent, Event.HIDE, relatedTarget);

    if (hideEvent.defaultPrevented) {
      return;
    }

    Manipulator.toggleClass(this._menu, ClassName.SHOW);
    Manipulator.toggleClass(parent, ClassName.SHOW);
    EventHandler.trigger(parent, Event.HIDDEN, relatedTarget);
  };

  _proto.dispose = function dispose() {
    Data.removeData(this._element, DATA_KEY);
    EventHandler.off(this._element, EVENT_KEY);
    this._element = null;
    this._menu = null;

    if (this._popper !== null) {
      this._popper.destroy();

      this._popper = null;
    }
  };

  _proto.update = function update() {
    this._inNavbar = this._detectNavbar();
    this._inHeader = this._detectHeader();

    if (this._popper !== null) {
      this._popper.scheduleUpdate();
    }
  } // Private
  ;

  _proto._addEventListeners = function _addEventListeners() {
    var _this = this;

    EventHandler.on(this._element, Event.CLICK, function (event) {
      event.preventDefault();
      event.stopPropagation();

      _this.toggle();
    });
  };

  _proto._getConfig = function _getConfig(config) {
    config = _objectSpread({}, this.constructor.Default, {}, Manipulator.getDataAttributes(this._element), {}, config);
    typeCheckConfig(NAME, config, this.constructor.DefaultType);
    return config;
  };

  _proto._getMenuElement = function _getMenuElement() {
    if (!this._menu) {
      var parent = Dropdown._getParentFromElement(this._element);

      if (parent) {
        this._menu = SelectorEngine.findOne(Selector.MENU, parent);
      }
    }

    return this._menu;
  };

  _proto._getPlacement = function _getPlacement() {
    var parentDropdown = this._element.parentNode;
    var placement = AttachmentMap.BOTTOM; // Handle dropup

    if (parentDropdown.classList.contains(ClassName.DROPUP)) {
      placement = AttachmentMap.TOP;

      if (this._menu.classList.contains(ClassName.MENURIGHT)) {
        placement = AttachmentMap.TOPEND;
      }
    } else if (parentDropdown.classList.contains(ClassName.DROPRIGHT)) {
      placement = AttachmentMap.RIGHT;
    } else if (parentDropdown.classList.contains(ClassName.DROPLEFT)) {
      placement = AttachmentMap.LEFT;
    } else if (this._menu.classList.contains(ClassName.MENURIGHT)) {
      placement = AttachmentMap.BOTTOMEND;
    }

    return placement;
  };

  _proto._detectNavbar = function _detectNavbar() {
    return Boolean(SelectorEngine.closest(this._element, '.navbar'));
  };

  _proto._detectHeader = function _detectHeader() {
    return Boolean(SelectorEngine.closest(this._element, '.c-header'));
  };

  _proto._getOffset = function _getOffset() {
    var _this2 = this;

    var offset = {};

    if (typeof this._config.offset === 'function') {
      offset.fn = function (data) {
        data.offsets = _objectSpread({}, data.offsets, {}, _this2._config.offset(data.offsets, _this2._element) || {});
        return data;
      };
    } else {
      offset.offset = this._config.offset;
    }

    return offset;
  };

  _proto._getPopperConfig = function _getPopperConfig() {
    var popperConfig = {
      placement: this._getPlacement(),
      modifiers: {
        offset: this._getOffset(),
        flip: {
          enabled: this._config.flip
        },
        preventOverflow: {
          boundariesElement: this._config.boundary
        }
      }
    }; // Disable Popper.js if we have a static display

    if (this._config.display === 'static') {
      popperConfig.modifiers.applyStyle = {
        enabled: false
      };
    }

    return popperConfig;
  } // Static
  ;

  Dropdown._dropdownInterface = function _dropdownInterface(element, config) {
    var data = Data.getData(element, DATA_KEY);

    var _config = typeof config === 'object' ? config : null;

    if (!data) {
      data = new Dropdown(element, _config);
    }

    if (typeof config === 'string') {
      if (typeof data[config] === 'undefined') {
        throw new TypeError("No method named \"" + config + "\"");
      }

      data[config]();
    }
  };

  Dropdown._jQueryInterface = function _jQueryInterface(config) {
    return this.each(function () {
      Dropdown._dropdownInterface(this, config);
    });
  };

  Dropdown._clearMenus = function _clearMenus(event) {
    if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH || event.type === 'keyup' && event.which !== TAB_KEYCODE)) {
      return;
    }

    var toggles = makeArray(SelectorEngine.find(Selector.DATA_TOGGLE));

    for (var i = 0, len = toggles.length; i < len; i++) {
      var parent = Dropdown._getParentFromElement(toggles[i]);

      var context = Data.getData(toggles[i], DATA_KEY);
      var relatedTarget = {
        relatedTarget: toggles[i]
      };

      if (event && event.type === 'click') {
        relatedTarget.clickEvent = event;
      }

      if (!context) {
        continue;
      }

      var dropdownMenu = context._menu;

      if (!parent.classList.contains(ClassName.SHOW)) {
        continue;
      }

      if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) && parent.contains(event.target)) {
        continue;
      }

      var hideEvent = EventHandler.trigger(parent, Event.HIDE, relatedTarget);

      if (hideEvent.defaultPrevented) {
        continue;
      } // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support


      if ('ontouchstart' in document.documentElement) {
        makeArray(document.body.children).forEach(function (elem) {
          return EventHandler.off(elem, 'mouseover', null, noop());
        });
      }

      toggles[i].setAttribute('aria-expanded', 'false');
      dropdownMenu.classList.remove(ClassName.SHOW);
      parent.classList.remove(ClassName.SHOW);
      EventHandler.trigger(parent, Event.HIDDEN, relatedTarget);
    }
  };

  Dropdown._getParentFromElement = function _getParentFromElement(element) {
    var parent;
    var selector = getSelectorFromElement(element);

    if (selector) {
      parent = SelectorEngine.findOne(selector);
    }

    return parent || element.parentNode;
  };

  Dropdown._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
    // If not input/textarea:
    //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
    // If input/textarea:
    //  - If space key => not a dropdown command
    //  - If key is other than escape
    //    - If key is not up or down => not a dropdown command
    //    - If trigger inside the menu => not a dropdown command
    if (/input|textarea/i.test(event.target.tagName) ? event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE && (event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE || SelectorEngine.closest(event.target, Selector.MENU)) : !REGEXP_KEYDOWN.test(event.which)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.disabled || this.classList.contains(ClassName.DISABLED)) {
      return;
    }

    var parent = Dropdown._getParentFromElement(this);

    var isActive = parent.classList.contains(ClassName.SHOW);

    if (!isActive || isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE)) {
      if (event.which === ESCAPE_KEYCODE) {
        EventHandler.trigger(SelectorEngine.findOne(Selector.DATA_TOGGLE, parent), 'focus');
      }

      Dropdown._clearMenus();

      return;
    }

    var items = makeArray(SelectorEngine.find(Selector.VISIBLE_ITEMS, parent));

    if (!items.length) {
      return;
    }

    var index = items.indexOf(event.target);

    if (event.which === ARROW_UP_KEYCODE && index > 0) {
      // Up
      index--;
    }

    if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) {
      // Down
      index++;
    }

    if (index < 0) {
      index = 0;
    }

    items[index].focus();
  };

  Dropdown._getInstance = function _getInstance(element) {
    return Data.getData(element, DATA_KEY);
  };

  _createClass(Dropdown, null, [{
    key: "VERSION",
    get: function get() {
      return VERSION;
    }
  }, {
    key: "Default",
    get: function get() {
      return Default;
    }
  }, {
    key: "DefaultType",
    get: function get() {
      return DefaultType;
    }
  }]);

  return Dropdown;
}();
/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */


EventHandler.on(document, Event.KEYDOWN_DATA_API, Selector.DATA_TOGGLE, Dropdown._dataApiKeydownHandler);
EventHandler.on(document, Event.KEYDOWN_DATA_API, Selector.MENU, Dropdown._dataApiKeydownHandler);
EventHandler.on(document, Event.CLICK_DATA_API, Dropdown._clearMenus);
EventHandler.on(document, Event.KEYUP_DATA_API, Dropdown._clearMenus);
EventHandler.on(document, Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
  event.preventDefault();
  event.stopPropagation();

  Dropdown._dropdownInterface(this, 'toggle');
});
EventHandler.on(document, Event.CLICK_DATA_API, Selector.FORM_CHILD, function (e) {
  return e.stopPropagation();
});
/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .dropdown to jQuery only if jQuery is present
 */

if (typeof $ !== 'undefined') {
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  $.fn[NAME] = Dropdown._jQueryInterface;
  $.fn[NAME].Constructor = Dropdown;

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Dropdown._jQueryInterface;
  };
}

export default Dropdown;
//# sourceMappingURL=dropdown.js.map
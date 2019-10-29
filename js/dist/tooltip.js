function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * --------------------------------------------------------------------------
 * CoreUI (v3.0.0-beta.1): tooltip.js
 * Licensed under MIT (https://coreui.io/license)
 *
 * This component is a modified version of the Bootstrap's tooltip.js
 * Bootstrap (v4.3.1): tooltip.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */
import { jQuery as $, TRANSITION_END, emulateTransitionEnd, findShadowRoot, getTransitionDurationFromElement, getUID, isElement, makeArray, noop, typeCheckConfig } from './util/index';
import { DefaultWhitelist, sanitizeHtml } from './util/sanitizer';
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

var NAME = 'tooltip';
var VERSION = '3.0.0-beta.1';
var DATA_KEY = 'coreui.tooltip';
var EVENT_KEY = "." + DATA_KEY;
var CLASS_PREFIX = 'bs-tooltip';
var BSCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');
var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn'];
var DefaultType = {
  animation: 'boolean',
  template: 'string',
  title: '(string|element|function)',
  trigger: 'string',
  delay: '(number|object)',
  html: 'boolean',
  selector: '(string|boolean)',
  placement: '(string|function)',
  offset: '(number|string|function)',
  container: '(string|element|boolean)',
  fallbackPlacement: '(string|array)',
  boundary: '(string|element)',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  whiteList: 'object'
};
var AttachmentMap = {
  AUTO: 'auto',
  TOP: 'top',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  LEFT: 'left'
};
var Default = {
  animation: true,
  template: "<div class=\"tooltip\" role=\"tooltip\">\n               <div class=\"tooltip-arrow\"></div>\n               <div class=\"tooltip-inner\"></div>\n             </div>",
  trigger: 'hover focus',
  title: '',
  delay: 0,
  html: false,
  selector: false,
  placement: 'top',
  offset: 0,
  container: false,
  fallbackPlacement: 'flip',
  boundary: 'scrollParent',
  sanitize: true,
  sanitizeFn: null,
  whiteList: DefaultWhitelist
};
var HoverState = {
  SHOW: 'show',
  OUT: 'out'
};
var Event = {
  HIDE: "hide" + EVENT_KEY,
  HIDDEN: "hidden" + EVENT_KEY,
  SHOW: "show" + EVENT_KEY,
  SHOWN: "shown" + EVENT_KEY,
  INSERTED: "inserted" + EVENT_KEY,
  CLICK: "click" + EVENT_KEY,
  FOCUSIN: "focusin" + EVENT_KEY,
  FOCUSOUT: "focusout" + EVENT_KEY,
  MOUSEENTER: "mouseenter" + EVENT_KEY,
  MOUSELEAVE: "mouseleave" + EVENT_KEY
};
var ClassName = {
  FADE: 'fade',
  SHOW: 'show'
};
var Selector = {
  TOOLTIP_INNER: '.tooltip-inner',
  TOOLTIP_ARROW: '.tooltip-arrow'
};
var Trigger = {
  HOVER: 'hover',
  FOCUS: 'focus',
  CLICK: 'click',
  MANUAL: 'manual'
};
/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

var Tooltip =
/*#__PURE__*/
function () {
  function Tooltip(element, config) {
    /**
     * Check for Popper dependency
     * Popper - https://popper.js.org
     */
    if (typeof Popper === 'undefined') {
      throw new TypeError('Bootstrap\'s tooltips require Popper.js (https://popper.js.org)');
    } // private


    this._isEnabled = true;
    this._timeout = 0;
    this._hoverState = '';
    this._activeTrigger = {};
    this._popper = null; // Protected

    this.element = element;
    this.config = this._getConfig(config);
    this.tip = null;

    this._setListeners();

    Data.setData(element, this.constructor.DATA_KEY, this);
  } // Getters


  var _proto = Tooltip.prototype;

  // Public
  _proto.enable = function enable() {
    this._isEnabled = true;
  };

  _proto.disable = function disable() {
    this._isEnabled = false;
  };

  _proto.toggleEnabled = function toggleEnabled() {
    this._isEnabled = !this._isEnabled;
  };

  _proto.toggle = function toggle(event) {
    if (!this._isEnabled) {
      return;
    }

    if (event) {
      var dataKey = this.constructor.DATA_KEY;
      var context = Data.getData(event.delegateTarget, dataKey);

      if (!context) {
        context = new this.constructor(event.delegateTarget, this._getDelegateConfig());
        Data.setData(event.delegateTarget, dataKey, context);
      }

      context._activeTrigger.click = !context._activeTrigger.click;

      if (context._isWithActiveTrigger()) {
        context._enter(null, context);
      } else {
        context._leave(null, context);
      }
    } else {
      if (this.getTipElement().classList.contains(ClassName.SHOW)) {
        this._leave(null, this);

        return;
      }

      this._enter(null, this);
    }
  };

  _proto.dispose = function dispose() {
    clearTimeout(this._timeout);
    Data.removeData(this.element, this.constructor.DATA_KEY);
    EventHandler.off(this.element, this.constructor.EVENT_KEY);
    EventHandler.off(SelectorEngine.closest(this.element, '.modal'), 'hide.bs.modal');

    if (this.tip) {
      this.tip.parentNode.removeChild(this.tip);
    }

    this._isEnabled = null;
    this._timeout = null;
    this._hoverState = null;
    this._activeTrigger = null;

    if (this._popper !== null) {
      this._popper.destroy();
    }

    this._popper = null;
    this.element = null;
    this.config = null;
    this.tip = null;
  };

  _proto.show = function show() {
    var _this = this;

    if (this.element.style.display === 'none') {
      throw new Error('Please use show on visible elements');
    }

    if (this.isWithContent() && this._isEnabled) {
      var showEvent = EventHandler.trigger(this.element, this.constructor.Event.SHOW);
      var shadowRoot = findShadowRoot(this.element);
      var isInTheDom = shadowRoot === null ? this.element.ownerDocument.documentElement.contains(this.element) : shadowRoot.contains(this.element);

      if (showEvent.defaultPrevented || !isInTheDom) {
        return;
      }

      var tip = this.getTipElement();
      var tipId = getUID(this.constructor.NAME);
      tip.setAttribute('id', tipId);
      this.element.setAttribute('aria-describedby', tipId);
      this.setContent();

      if (this.config.animation) {
        tip.classList.add(ClassName.FADE);
      }

      var placement = typeof this.config.placement === 'function' ? this.config.placement.call(this, tip, this.element) : this.config.placement;

      var attachment = this._getAttachment(placement);

      this.addAttachmentClass(attachment);

      var container = this._getContainer();

      Data.setData(tip, this.constructor.DATA_KEY, this);

      if (!this.element.ownerDocument.documentElement.contains(this.tip)) {
        container.appendChild(tip);
      }

      EventHandler.trigger(this.element, this.constructor.Event.INSERTED);
      this._popper = new Popper(this.element, tip, {
        placement: attachment,
        modifiers: {
          offset: this._getOffset(),
          flip: {
            behavior: this.config.fallbackPlacement
          },
          arrow: {
            element: Selector.TOOLTIP_ARROW
          },
          preventOverflow: {
            boundariesElement: this.config.boundary
          }
        },
        onCreate: function onCreate(data) {
          if (data.originalPlacement !== data.placement) {
            _this._handlePopperPlacementChange(data);
          }
        },
        onUpdate: function onUpdate(data) {
          return _this._handlePopperPlacementChange(data);
        }
      });
      tip.classList.add(ClassName.SHOW); // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

      if ('ontouchstart' in document.documentElement) {
        makeArray(document.body.children).forEach(function (element) {
          EventHandler.on(element, 'mouseover', noop());
        });
      }

      var complete = function complete() {
        if (_this.config.animation) {
          _this._fixTransition();
        }

        var prevHoverState = _this._hoverState;
        _this._hoverState = null;
        EventHandler.trigger(_this.element, _this.constructor.Event.SHOWN);

        if (prevHoverState === HoverState.OUT) {
          _this._leave(null, _this);
        }
      };

      if (this.tip.classList.contains(ClassName.FADE)) {
        var transitionDuration = getTransitionDurationFromElement(this.tip);
        EventHandler.one(this.tip, TRANSITION_END, complete);
        emulateTransitionEnd(this.tip, transitionDuration);
      } else {
        complete();
      }
    }
  };

  _proto.hide = function hide(callback) {
    var _this2 = this;

    var tip = this.getTipElement();

    var complete = function complete() {
      if (_this2._hoverState !== HoverState.SHOW && tip.parentNode) {
        tip.parentNode.removeChild(tip);
      }

      _this2._cleanTipClass();

      _this2.element.removeAttribute('aria-describedby');

      EventHandler.trigger(_this2.element, _this2.constructor.Event.HIDDEN);

      if (_this2._popper !== null) {
        _this2._popper.destroy();
      }

      if (callback) {
        callback();
      }
    };

    var hideEvent = EventHandler.trigger(this.element, this.constructor.Event.HIDE);

    if (hideEvent.defaultPrevented) {
      return;
    }

    tip.classList.remove(ClassName.SHOW); // If this is a touch-enabled device we remove the extra
    // empty mouseover listeners we added for iOS support

    if ('ontouchstart' in document.documentElement) {
      makeArray(document.body.children).forEach(function (element) {
        return EventHandler.off(element, 'mouseover', noop);
      });
    }

    this._activeTrigger[Trigger.CLICK] = false;
    this._activeTrigger[Trigger.FOCUS] = false;
    this._activeTrigger[Trigger.HOVER] = false;

    if (this.tip.classList.contains(ClassName.FADE)) {
      var transitionDuration = getTransitionDurationFromElement(tip);
      EventHandler.one(tip, TRANSITION_END, complete);
      emulateTransitionEnd(tip, transitionDuration);
    } else {
      complete();
    }

    this._hoverState = '';
  };

  _proto.update = function update() {
    if (this._popper !== null) {
      this._popper.scheduleUpdate();
    }
  } // Protected
  ;

  _proto.isWithContent = function isWithContent() {
    return Boolean(this.getTitle());
  };

  _proto.addAttachmentClass = function addAttachmentClass(attachment) {
    this.getTipElement().classList.add(CLASS_PREFIX + "-" + attachment);
  };

  _proto.getTipElement = function getTipElement() {
    if (this.tip) {
      return this.tip;
    }

    var element = document.createElement('div');
    element.innerHTML = this.config.template;
    this.tip = element.children[0];
    return this.tip;
  };

  _proto.setContent = function setContent() {
    var tip = this.getTipElement();
    this.setElementContent(SelectorEngine.findOne(Selector.TOOLTIP_INNER, tip), this.getTitle());
    tip.classList.remove(ClassName.FADE);
    tip.classList.remove(ClassName.SHOW);
  };

  _proto.setElementContent = function setElementContent(element, content) {
    if (element === null) {
      return;
    }

    if (typeof content === 'object' && (content.nodeType || content.jquery)) {
      if (content.jquery) {
        content = content[0];
      } // content is a DOM node or a jQuery


      if (this.config.html) {
        if (content.parentNode !== element) {
          element.innerHTML = '';
          element.appendChild(content);
        }
      } else {
        element.innerText = content.textContent;
      }

      return;
    }

    if (this.config.html) {
      if (this.config.sanitize) {
        content = sanitizeHtml(content, this.config.whiteList, this.config.sanitizeFn);
      }

      element.innerHTML = content;
    } else {
      element.innerText = content;
    }
  };

  _proto.getTitle = function getTitle() {
    var title = this.element.getAttribute('data-original-title');

    if (!title) {
      title = typeof this.config.title === 'function' ? this.config.title.call(this.element) : this.config.title;
    }

    return title;
  } // Private
  ;

  _proto._getOffset = function _getOffset() {
    var _this3 = this;

    var offset = {};

    if (typeof this.config.offset === 'function') {
      offset.fn = function (data) {
        data.offsets = _objectSpread({}, data.offsets, {}, _this3.config.offset(data.offsets, _this3.element) || {});
        return data;
      };
    } else {
      offset.offset = this.config.offset;
    }

    return offset;
  };

  _proto._getContainer = function _getContainer() {
    if (this.config.container === false) {
      return document.body;
    }

    if (isElement(this.config.container)) {
      return this.config.container;
    }

    return SelectorEngine.findOne(this.config.container);
  };

  _proto._getAttachment = function _getAttachment(placement) {
    return AttachmentMap[placement.toUpperCase()];
  };

  _proto._setListeners = function _setListeners() {
    var _this4 = this;

    var triggers = this.config.trigger.split(' ');
    triggers.forEach(function (trigger) {
      if (trigger === 'click') {
        EventHandler.on(_this4.element, _this4.constructor.Event.CLICK, _this4.config.selector, function (event) {
          return _this4.toggle(event);
        });
      } else if (trigger !== Trigger.MANUAL) {
        var eventIn = trigger === Trigger.HOVER ? _this4.constructor.Event.MOUSEENTER : _this4.constructor.Event.FOCUSIN;
        var eventOut = trigger === Trigger.HOVER ? _this4.constructor.Event.MOUSELEAVE : _this4.constructor.Event.FOCUSOUT;
        EventHandler.on(_this4.element, eventIn, _this4.config.selector, function (event) {
          return _this4._enter(event);
        });
        EventHandler.on(_this4.element, eventOut, _this4.config.selector, function (event) {
          return _this4._leave(event);
        });
      }
    });
    EventHandler.on(SelectorEngine.closest(this.element, '.modal'), 'hide.bs.modal', function () {
      if (_this4.element) {
        _this4.hide();
      }
    });

    if (this.config.selector) {
      this.config = _objectSpread({}, this.config, {
        trigger: 'manual',
        selector: ''
      });
    } else {
      this._fixTitle();
    }
  };

  _proto._fixTitle = function _fixTitle() {
    var titleType = typeof this.element.getAttribute('data-original-title');

    if (this.element.getAttribute('title') || titleType !== 'string') {
      this.element.dataset.originalTitle = this.element.getAttribute('title') || '';
      this.element.setAttribute('title', '');
    }
  };

  _proto._enter = function _enter(event, context) {
    var dataKey = this.constructor.DATA_KEY;
    context = context || Data.getData(event.delegateTarget, dataKey);

    if (!context) {
      context = new this.constructor(event.delegateTarget, this._getDelegateConfig());
      Data.setData(event.delegateTarget, dataKey, context);
    }

    if (event) {
      context._activeTrigger[event.type === 'focusin' ? Trigger.FOCUS : Trigger.HOVER] = true;
    }

    if (context.getTipElement().classList.contains(ClassName.SHOW) || context._hoverState === HoverState.SHOW) {
      context._hoverState = HoverState.SHOW;
      return;
    }

    clearTimeout(context._timeout);
    context._hoverState = HoverState.SHOW;

    if (!context.config.delay || !context.config.delay.show) {
      context.show();
      return;
    }

    context._timeout = setTimeout(function () {
      if (context._hoverState === HoverState.SHOW) {
        context.show();
      }
    }, context.config.delay.show);
  };

  _proto._leave = function _leave(event, context) {
    var dataKey = this.constructor.DATA_KEY;
    context = context || Data.getData(event.delegateTarget, dataKey);

    if (!context) {
      context = new this.constructor(event.delegateTarget, this._getDelegateConfig());
      Data.setData(event.delegateTarget, dataKey, context);
    }

    if (event) {
      context._activeTrigger[event.type === 'focusout' ? Trigger.FOCUS : Trigger.HOVER] = false;
    }

    if (context._isWithActiveTrigger()) {
      return;
    }

    clearTimeout(context._timeout);
    context._hoverState = HoverState.OUT;

    if (!context.config.delay || !context.config.delay.hide) {
      context.hide();
      return;
    }

    context._timeout = setTimeout(function () {
      if (context._hoverState === HoverState.OUT) {
        context.hide();
      }
    }, context.config.delay.hide);
  };

  _proto._isWithActiveTrigger = function _isWithActiveTrigger() {
    for (var trigger in this._activeTrigger) {
      if (this._activeTrigger[trigger]) {
        return true;
      }
    }

    return false;
  };

  _proto._getConfig = function _getConfig(config) {
    var dataAttributes = Manipulator.getDataAttributes(this.element);
    Object.keys(dataAttributes).forEach(function (dataAttr) {
      if (DISALLOWED_ATTRIBUTES.indexOf(dataAttr) !== -1) {
        delete dataAttributes[dataAttr];
      }
    });

    if (config && typeof config.container === 'object' && config.container.jquery) {
      config.container = config.container[0];
    }

    config = _objectSpread({}, this.constructor.Default, {}, dataAttributes, {}, typeof config === 'object' && config ? config : {});

    if (typeof config.delay === 'number') {
      config.delay = {
        show: config.delay,
        hide: config.delay
      };
    }

    if (typeof config.title === 'number') {
      config.title = config.title.toString();
    }

    if (typeof config.content === 'number') {
      config.content = config.content.toString();
    }

    typeCheckConfig(NAME, config, this.constructor.DefaultType);

    if (config.sanitize) {
      config.template = sanitizeHtml(config.template, config.whiteList, config.sanitizeFn);
    }

    return config;
  };

  _proto._getDelegateConfig = function _getDelegateConfig() {
    var config = {};

    if (this.config) {
      for (var key in this.config) {
        if (this.constructor.Default[key] !== this.config[key]) {
          config[key] = this.config[key];
        }
      }
    }

    return config;
  };

  _proto._cleanTipClass = function _cleanTipClass() {
    var tip = this.getTipElement();
    var tabClass = tip.getAttribute('class').match(BSCLS_PREFIX_REGEX);

    if (tabClass !== null && tabClass.length) {
      tabClass.map(function (token) {
        return token.trim();
      }).forEach(function (tClass) {
        return tip.classList.remove(tClass);
      });
    }
  };

  _proto._handlePopperPlacementChange = function _handlePopperPlacementChange(popperData) {
    var popperInstance = popperData.instance;
    this.tip = popperInstance.popper;

    this._cleanTipClass();

    this.addAttachmentClass(this._getAttachment(popperData.placement));
  };

  _proto._fixTransition = function _fixTransition() {
    var tip = this.getTipElement();
    var initConfigAnimation = this.config.animation;

    if (tip.getAttribute('x-placement') !== null) {
      return;
    }

    tip.classList.remove(ClassName.FADE);
    this.config.animation = false;
    this.hide();
    this.show();
    this.config.animation = initConfigAnimation;
  } // Static
  ;

  Tooltip._jQueryInterface = function _jQueryInterface(config) {
    return this.each(function () {
      var data = Data.getData(this, DATA_KEY);

      var _config = typeof config === 'object' && config;

      if (!data && /dispose|hide/.test(config)) {
        return;
      }

      if (!data) {
        data = new Tooltip(this, _config);
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError("No method named \"" + config + "\"");
        }

        data[config]();
      }
    });
  };

  Tooltip._getInstance = function _getInstance(element) {
    return Data.getData(element, DATA_KEY);
  };

  _createClass(Tooltip, null, [{
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
    key: "NAME",
    get: function get() {
      return NAME;
    }
  }, {
    key: "DATA_KEY",
    get: function get() {
      return DATA_KEY;
    }
  }, {
    key: "Event",
    get: function get() {
      return Event;
    }
  }, {
    key: "EVENT_KEY",
    get: function get() {
      return EVENT_KEY;
    }
  }, {
    key: "DefaultType",
    get: function get() {
      return DefaultType;
    }
  }]);

  return Tooltip;
}();
/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .tooltip to jQuery only if jQuery is present
 */


if (typeof $ !== 'undefined') {
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  $.fn[NAME] = Tooltip._jQueryInterface;
  $.fn[NAME].Constructor = Tooltip;

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Tooltip._jQueryInterface;
  };
}

export default Tooltip;
//# sourceMappingURL=tooltip.js.map
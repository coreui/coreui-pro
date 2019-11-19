function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * --------------------------------------------------------------------------
 * CoreUI (v3.0.0-beta.3): modal.js
 * Licensed under MIT (https://coreui.io/license)
 *
 * This component is a modified version of the Bootstrap's modal.js
 * Bootstrap (v4.3.1): modal.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */
import { jQuery as $, TRANSITION_END, emulateTransitionEnd, getSelectorFromElement, getTransitionDurationFromElement, isVisible, makeArray, reflow, typeCheckConfig } from './util/index';
import Data from './dom/data';
import EventHandler from './dom/event-handler';
import Manipulator from './dom/manipulator';
import SelectorEngine from './dom/selector-engine';
/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

var NAME = 'modal';
var VERSION = '3.0.0-beta.3';
var DATA_KEY = 'coreui.modal';
var EVENT_KEY = "." + DATA_KEY;
var DATA_API_KEY = '.data-api';
var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

var Default = {
  backdrop: true,
  keyboard: true,
  focus: true,
  show: true
};
var DefaultType = {
  backdrop: '(boolean|string)',
  keyboard: 'boolean',
  focus: 'boolean',
  show: 'boolean'
};
var Event = {
  HIDE: "hide" + EVENT_KEY,
  HIDDEN: "hidden" + EVENT_KEY,
  SHOW: "show" + EVENT_KEY,
  SHOWN: "shown" + EVENT_KEY,
  FOCUSIN: "focusin" + EVENT_KEY,
  RESIZE: "resize" + EVENT_KEY,
  CLICK_DISMISS: "click.dismiss" + EVENT_KEY,
  KEYDOWN_DISMISS: "keydown.dismiss" + EVENT_KEY,
  MOUSEUP_DISMISS: "mouseup.dismiss" + EVENT_KEY,
  MOUSEDOWN_DISMISS: "mousedown.dismiss" + EVENT_KEY,
  CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
};
var ClassName = {
  SCROLLABLE: 'modal-dialog-scrollable',
  SCROLLBAR_MEASURER: 'modal-scrollbar-measure',
  BACKDROP: 'modal-backdrop',
  OPEN: 'modal-open',
  FADE: 'fade',
  SHOW: 'show'
};
var Selector = {
  DIALOG: '.modal-dialog',
  MODAL_BODY: '.modal-body',
  DATA_TOGGLE: '[data-toggle="modal"]',
  DATA_DISMISS: '[data-dismiss="modal"]',
  FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
  STICKY_CONTENT: '.sticky-top'
};
/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

var Modal =
/*#__PURE__*/
function () {
  function Modal(element, config) {
    this._config = this._getConfig(config);
    this._element = element;
    this._dialog = SelectorEngine.findOne(Selector.DIALOG, element);
    this._backdrop = null;
    this._isShown = false;
    this._isBodyOverflowing = false;
    this._ignoreBackdropClick = false;
    this._isTransitioning = false;
    this._scrollbarWidth = 0;
    Data.setData(element, DATA_KEY, this);
  } // Getters


  var _proto = Modal.prototype;

  // Public
  _proto.toggle = function toggle(relatedTarget) {
    return this._isShown ? this.hide() : this.show(relatedTarget);
  };

  _proto.show = function show(relatedTarget) {
    var _this = this;

    if (this._isShown || this._isTransitioning) {
      return;
    }

    if (this._element.classList.contains(ClassName.FADE)) {
      this._isTransitioning = true;
    }

    var showEvent = EventHandler.trigger(this._element, Event.SHOW, {
      relatedTarget: relatedTarget
    });

    if (this._isShown || showEvent.defaultPrevented) {
      return;
    }

    this._isShown = true;

    this._checkScrollbar();

    this._setScrollbar();

    this._adjustDialog();

    this._setEscapeEvent();

    this._setResizeEvent();

    EventHandler.on(this._element, Event.CLICK_DISMISS, Selector.DATA_DISMISS, function (event) {
      return _this.hide(event);
    });
    EventHandler.on(this._dialog, Event.MOUSEDOWN_DISMISS, function () {
      EventHandler.one(_this._element, Event.MOUSEUP_DISMISS, function (event) {
        if (event.target === _this._element) {
          _this._ignoreBackdropClick = true;
        }
      });
    });

    this._showBackdrop(function () {
      return _this._showElement(relatedTarget);
    });
  };

  _proto.hide = function hide(event) {
    var _this2 = this;

    if (event) {
      event.preventDefault();
    }

    if (!this._isShown || this._isTransitioning) {
      return;
    }

    var hideEvent = EventHandler.trigger(this._element, Event.HIDE);

    if (!this._isShown || hideEvent.defaultPrevented) {
      return;
    }

    this._isShown = false;

    var transition = this._element.classList.contains(ClassName.FADE);

    if (transition) {
      this._isTransitioning = true;
    }

    this._setEscapeEvent();

    this._setResizeEvent();

    EventHandler.off(document, Event.FOCUSIN);

    this._element.classList.remove(ClassName.SHOW);

    EventHandler.off(this._element, Event.CLICK_DISMISS);
    EventHandler.off(this._dialog, Event.MOUSEDOWN_DISMISS);

    if (transition) {
      var transitionDuration = getTransitionDurationFromElement(this._element);
      EventHandler.one(this._element, TRANSITION_END, function (event) {
        return _this2._hideModal(event);
      });
      emulateTransitionEnd(this._element, transitionDuration);
    } else {
      this._hideModal();
    }
  };

  _proto.dispose = function dispose() {
    [window, this._element, this._dialog].forEach(function (htmlElement) {
      return EventHandler.off(htmlElement, EVENT_KEY);
    });
    /**
     * `document` has 2 events `Event.FOCUSIN` and `Event.CLICK_DATA_API`
     * Do not move `document` in `htmlElements` array
     * It will remove `Event.CLICK_DATA_API` event that should remain
     */

    EventHandler.off(document, Event.FOCUSIN);
    Data.removeData(this._element, DATA_KEY);
    this._config = null;
    this._element = null;
    this._dialog = null;
    this._backdrop = null;
    this._isShown = null;
    this._isBodyOverflowing = null;
    this._ignoreBackdropClick = null;
    this._isTransitioning = null;
    this._scrollbarWidth = null;
  };

  _proto.handleUpdate = function handleUpdate() {
    this._adjustDialog();
  } // Private
  ;

  _proto._getConfig = function _getConfig(config) {
    config = _objectSpread({}, Default, {}, config);
    typeCheckConfig(NAME, config, DefaultType);
    return config;
  };

  _proto._showElement = function _showElement(relatedTarget) {
    var _this3 = this;

    var transition = this._element.classList.contains(ClassName.FADE);

    if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
      // Don't move modal's DOM position
      document.body.appendChild(this._element);
    }

    this._element.style.display = 'block';

    this._element.removeAttribute('aria-hidden');

    this._element.setAttribute('aria-modal', true);

    if (this._dialog.classList.contains(ClassName.SCROLLABLE)) {
      SelectorEngine.findOne(Selector.MODAL_BODY, this._dialog).scrollTop = 0;
    } else {
      this._element.scrollTop = 0;
    }

    if (transition) {
      reflow(this._element);
    }

    this._element.classList.add(ClassName.SHOW);

    if (this._config.focus) {
      this._enforceFocus();
    }

    var transitionComplete = function transitionComplete() {
      if (_this3._config.focus) {
        _this3._element.focus();
      }

      _this3._isTransitioning = false;
      EventHandler.trigger(_this3._element, Event.SHOWN, {
        relatedTarget: relatedTarget
      });
    };

    if (transition) {
      var transitionDuration = getTransitionDurationFromElement(this._dialog);
      EventHandler.one(this._dialog, TRANSITION_END, transitionComplete);
      emulateTransitionEnd(this._dialog, transitionDuration);
    } else {
      transitionComplete();
    }
  };

  _proto._enforceFocus = function _enforceFocus() {
    var _this4 = this;

    EventHandler.off(document, Event.FOCUSIN); // guard against infinite focus loop

    EventHandler.on(document, Event.FOCUSIN, function (event) {
      if (document !== event.target && _this4._element !== event.target && !_this4._element.contains(event.target)) {
        _this4._element.focus();
      }
    });
  };

  _proto._setEscapeEvent = function _setEscapeEvent() {
    var _this5 = this;

    if (this._isShown && this._config.keyboard) {
      EventHandler.on(this._element, Event.KEYDOWN_DISMISS, function (event) {
        if (event.which === ESCAPE_KEYCODE) {
          event.preventDefault();

          _this5.hide();
        }
      });
    } else if (!this._isShown) {
      EventHandler.off(this._element, Event.KEYDOWN_DISMISS);
    }
  };

  _proto._setResizeEvent = function _setResizeEvent() {
    var _this6 = this;

    if (this._isShown) {
      EventHandler.on(window, Event.RESIZE, function (event) {
        return _this6.handleUpdate(event);
      });
    } else {
      EventHandler.off(window, Event.RESIZE);
    }
  };

  _proto._hideModal = function _hideModal() {
    var _this7 = this;

    this._element.style.display = 'none';

    this._element.setAttribute('aria-hidden', true);

    this._element.removeAttribute('aria-modal');

    this._isTransitioning = false;

    this._showBackdrop(function () {
      document.body.classList.remove(ClassName.OPEN);

      _this7._resetAdjustments();

      _this7._resetScrollbar();

      EventHandler.trigger(_this7._element, Event.HIDDEN);
    });
  };

  _proto._removeBackdrop = function _removeBackdrop() {
    if (this._backdrop) {
      this._backdrop.parentNode.removeChild(this._backdrop);

      this._backdrop = null;
    }
  };

  _proto._showBackdrop = function _showBackdrop(callback) {
    var _this8 = this;

    var animate = this._element.classList.contains(ClassName.FADE) ? ClassName.FADE : '';

    if (this._isShown && this._config.backdrop) {
      this._backdrop = document.createElement('div');
      this._backdrop.className = ClassName.BACKDROP;

      if (animate) {
        this._backdrop.classList.add(animate);
      }

      document.body.appendChild(this._backdrop);
      EventHandler.on(this._element, Event.CLICK_DISMISS, function (event) {
        if (_this8._ignoreBackdropClick) {
          _this8._ignoreBackdropClick = false;
          return;
        }

        if (event.target !== event.currentTarget) {
          return;
        }

        if (_this8._config.backdrop === 'static') {
          _this8._element.focus();
        } else {
          _this8.hide();
        }
      });

      if (animate) {
        reflow(this._backdrop);
      }

      this._backdrop.classList.add(ClassName.SHOW);

      if (!callback) {
        return;
      }

      if (!animate) {
        callback();
        return;
      }

      var backdropTransitionDuration = getTransitionDurationFromElement(this._backdrop);
      EventHandler.one(this._backdrop, TRANSITION_END, callback);
      emulateTransitionEnd(this._backdrop, backdropTransitionDuration);
    } else if (!this._isShown && this._backdrop) {
      this._backdrop.classList.remove(ClassName.SHOW);

      var callbackRemove = function callbackRemove() {
        _this8._removeBackdrop();

        if (callback) {
          callback();
        }
      };

      if (this._element.classList.contains(ClassName.FADE)) {
        var _backdropTransitionDuration = getTransitionDurationFromElement(this._backdrop);

        EventHandler.one(this._backdrop, TRANSITION_END, callbackRemove);
        emulateTransitionEnd(this._backdrop, _backdropTransitionDuration);
      } else {
        callbackRemove();
      }
    } else if (callback) {
      callback();
    }
  } // ----------------------------------------------------------------------
  // the following methods are used to handle overflowing modals
  // ----------------------------------------------------------------------
  ;

  _proto._adjustDialog = function _adjustDialog() {
    var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

    if (!this._isBodyOverflowing && isModalOverflowing) {
      this._element.style.paddingLeft = this._scrollbarWidth + "px";
    }

    if (this._isBodyOverflowing && !isModalOverflowing) {
      this._element.style.paddingRight = this._scrollbarWidth + "px";
    }
  };

  _proto._resetAdjustments = function _resetAdjustments() {
    this._element.style.paddingLeft = '';
    this._element.style.paddingRight = '';
  };

  _proto._checkScrollbar = function _checkScrollbar() {
    var rect = document.body.getBoundingClientRect();
    this._isBodyOverflowing = rect.left + rect.right < window.innerWidth;
    this._scrollbarWidth = this._getScrollbarWidth();
  };

  _proto._setScrollbar = function _setScrollbar() {
    var _this9 = this;

    if (this._isBodyOverflowing) {
      // Note: DOMNode.style.paddingRight returns the actual value or '' if not set
      //   while $(DOMNode).css('padding-right') returns the calculated value or 0 if not set
      // Adjust fixed content padding
      makeArray(SelectorEngine.find(Selector.FIXED_CONTENT)).forEach(function (element) {
        var actualPadding = element.style.paddingRight;
        var calculatedPadding = window.getComputedStyle(element)['padding-right'];
        Manipulator.setDataAttribute(element, 'padding-right', actualPadding);
        element.style.paddingRight = parseFloat(calculatedPadding) + _this9._scrollbarWidth + "px";
      }); // Adjust sticky content margin

      makeArray(SelectorEngine.find(Selector.STICKY_CONTENT)).forEach(function (element) {
        var actualMargin = element.style.marginRight;
        var calculatedMargin = window.getComputedStyle(element)['margin-right'];
        Manipulator.setDataAttribute(element, 'margin-right', actualMargin);
        element.style.marginRight = parseFloat(calculatedMargin) - _this9._scrollbarWidth + "px";
      }); // Adjust body padding

      var actualPadding = document.body.style.paddingRight;
      var calculatedPadding = window.getComputedStyle(document.body)['padding-right'];
      Manipulator.setDataAttribute(document.body, 'padding-right', actualPadding);
      document.body.style.paddingRight = parseFloat(calculatedPadding) + this._scrollbarWidth + "px";
    }

    document.body.classList.add(ClassName.OPEN);
  };

  _proto._resetScrollbar = function _resetScrollbar() {
    // Restore fixed content padding
    makeArray(SelectorEngine.find(Selector.FIXED_CONTENT)).forEach(function (element) {
      var padding = Manipulator.getDataAttribute(element, 'padding-right');

      if (typeof padding !== 'undefined') {
        Manipulator.removeDataAttribute(element, 'padding-right');
        element.style.paddingRight = padding;
      }
    }); // Restore sticky content and navbar-toggler margin

    makeArray(SelectorEngine.find("" + Selector.STICKY_CONTENT)).forEach(function (element) {
      var margin = Manipulator.getDataAttribute(element, 'margin-right');

      if (typeof margin !== 'undefined') {
        Manipulator.removeDataAttribute(element, 'margin-right');
        element.style.marginRight = margin;
      }
    }); // Restore body padding

    var padding = Manipulator.getDataAttribute(document.body, 'padding-right');

    if (typeof padding === 'undefined') {
      document.body.style.paddingRight = '';
    } else {
      Manipulator.removeDataAttribute(document.body, 'padding-right');
      document.body.style.paddingRight = padding;
    }
  };

  _proto._getScrollbarWidth = function _getScrollbarWidth() {
    // thx d.walsh
    var scrollDiv = document.createElement('div');
    scrollDiv.className = ClassName.SCROLLBAR_MEASURER;
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  } // Static
  ;

  Modal._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
    return this.each(function () {
      var data = Data.getData(this, DATA_KEY);

      var _config = _objectSpread({}, Default, {}, Manipulator.getDataAttributes(this), {}, typeof config === 'object' && config ? config : {});

      if (!data) {
        data = new Modal(this, _config);
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError("No method named \"" + config + "\"");
        }

        data[config](relatedTarget);
      } else if (_config.show) {
        data.show(relatedTarget);
      }
    });
  };

  Modal._getInstance = function _getInstance(element) {
    return Data.getData(element, DATA_KEY);
  };

  _createClass(Modal, null, [{
    key: "VERSION",
    get: function get() {
      return VERSION;
    }
  }, {
    key: "Default",
    get: function get() {
      return Default;
    }
  }]);

  return Modal;
}();
/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */


EventHandler.on(document, Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
  var _this10 = this;

  var target;
  var selector = getSelectorFromElement(this);

  if (selector) {
    target = SelectorEngine.findOne(selector);
  }

  var config = Data.getData(target, DATA_KEY) ? 'toggle' : _objectSpread({}, Manipulator.getDataAttributes(target), {}, Manipulator.getDataAttributes(this));

  if (this.tagName === 'A' || this.tagName === 'AREA') {
    event.preventDefault();
  }

  EventHandler.one(target, Event.SHOW, function (showEvent) {
    if (showEvent.defaultPrevented) {
      // only register focus restorer if modal will actually get shown
      return;
    }

    EventHandler.one(target, Event.HIDDEN, function () {
      if (isVisible(_this10)) {
        _this10.focus();
      }
    });
  });
  var data = Data.getData(target, DATA_KEY);

  if (!data) {
    data = new Modal(target, config);
  }

  data.show(this);
});
/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

if (typeof $ !== 'undefined') {
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  $.fn[NAME] = Modal._jQueryInterface;
  $.fn[NAME].Constructor = Modal;

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Modal._jQueryInterface;
  };
}

export default Modal;
//# sourceMappingURL=modal.js.map
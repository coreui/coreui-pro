function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * --------------------------------------------------------------------------
 * CoreUI (v3.0.0-beta.0): carousel.js
 * Licensed under MIT (https://coreui.io/license)
 *
 * This component is a modified version of the Bootstrap's carousel.js
 * Bootstrap (v4.3.1): carousel.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */
import { jQuery as $, TRANSITION_END, emulateTransitionEnd, getSelectorFromElement, getTransitionDurationFromElement, isVisible, makeArray, reflow, triggerTransitionEnd, typeCheckConfig } from './util/index';
import Data from './dom/data';
import EventHandler from './dom/event-handler';
import Manipulator from './dom/manipulator';
import SelectorEngine from './dom/selector-engine';
/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

var NAME = 'carousel';
var VERSION = '3.0.0-beta.0';
var DATA_KEY = 'coreui.carousel';
var EVENT_KEY = "." + DATA_KEY;
var DATA_API_KEY = '.data-api';
var ARROW_LEFT_KEYCODE = 37; // KeyboardEvent.which value for left arrow key

var ARROW_RIGHT_KEYCODE = 39; // KeyboardEvent.which value for right arrow key

var TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

var SWIPE_THRESHOLD = 40;
var BS_PREFIX = window.CoreUIDefaults ? window.CoreUIDefaults.bsPrefix ? window.CoreUIDefaults.bsPrefix : '' : '';
var Default = {
  interval: 5000,
  keyboard: true,
  slide: false,
  pause: 'hover',
  wrap: true,
  touch: true
};
var DefaultType = {
  interval: '(number|boolean)',
  keyboard: 'boolean',
  slide: '(boolean|string)',
  pause: '(string|boolean)',
  wrap: 'boolean',
  touch: 'boolean'
};
var Direction = {
  NEXT: 'next',
  PREV: 'prev',
  LEFT: 'left',
  RIGHT: 'right'
};
var Event = {
  SLIDE: "slide" + EVENT_KEY,
  SLID: "slid" + EVENT_KEY,
  KEYDOWN: "keydown" + EVENT_KEY,
  MOUSEENTER: "mouseenter" + EVENT_KEY,
  MOUSELEAVE: "mouseleave" + EVENT_KEY,
  TOUCHSTART: "touchstart" + EVENT_KEY,
  TOUCHMOVE: "touchmove" + EVENT_KEY,
  TOUCHEND: "touchend" + EVENT_KEY,
  POINTERDOWN: "pointerdown" + EVENT_KEY,
  POINTERUP: "pointerup" + EVENT_KEY,
  DRAG_START: "dragstart" + EVENT_KEY,
  LOAD_DATA_API: "load" + EVENT_KEY + DATA_API_KEY,
  CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
};
var ClassName = {
  CAROUSEL: BS_PREFIX + "carousel",
  ACTIVE: BS_PREFIX + "active",
  SLIDE: 'slide',
  RIGHT: BS_PREFIX + "carousel-item-right",
  LEFT: BS_PREFIX + "carousel-item-left",
  NEXT: BS_PREFIX + "carousel-item-next",
  PREV: BS_PREFIX + "carousel-item-prev",
  ITEM: BS_PREFIX + "carousel-item",
  POINTER_EVENT: BS_PREFIX + "pointer-event"
};
var Selector = {
  ACTIVE: "." + BS_PREFIX + "active",
  ACTIVE_ITEM: "." + BS_PREFIX + "active." + BS_PREFIX + "carousel-item",
  ITEM: "." + BS_PREFIX + "carousel-item",
  ITEM_IMG: "." + BS_PREFIX + "carousel-item img",
  NEXT_PREV: "." + BS_PREFIX + "carousel-item-next, ." + BS_PREFIX + "carousel-item-prev",
  INDICATORS: "." + BS_PREFIX + "carousel-indicators",
  DATA_SLIDE: '[data-slide], [data-slide-to]',
  DATA_RIDE: '[data-ride="carousel"]'
};
var PointerType = {
  TOUCH: 'touch',
  PEN: 'pen'
};
/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

var Carousel =
/*#__PURE__*/
function () {
  function Carousel(element, config) {
    this._items = null;
    this._interval = null;
    this._activeElement = null;
    this._isPaused = false;
    this._isSliding = false;
    this.touchTimeout = null;
    this.touchStartX = 0;
    this.touchDeltaX = 0;
    this._config = this._getConfig(config);
    this._element = element;
    this._indicatorsElement = SelectorEngine.findOne(Selector.INDICATORS, this._element);
    this._touchSupported = 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
    this._pointerEvent = Boolean(window.PointerEvent || window.MSPointerEvent);

    this._addEventListeners();

    Data.setData(element, DATA_KEY, this);
  } // Getters


  var _proto = Carousel.prototype;

  // Public
  _proto.next = function next() {
    if (!this._isSliding) {
      this._slide(Direction.NEXT);
    }
  };

  _proto.nextWhenVisible = function nextWhenVisible() {
    // Don't call next when the page isn't visible
    // or the carousel or its parent isn't visible
    if (!document.hidden && isVisible(this._element)) {
      this.next();
    }
  };

  _proto.prev = function prev() {
    if (!this._isSliding) {
      this._slide(Direction.PREV);
    }
  };

  _proto.pause = function pause(event) {
    if (!event) {
      this._isPaused = true;
    }

    if (SelectorEngine.findOne(Selector.NEXT_PREV, this._element)) {
      triggerTransitionEnd(this._element);
      this.cycle(true);
    }

    clearInterval(this._interval);
    this._interval = null;
  };

  _proto.cycle = function cycle(event) {
    if (!event) {
      this._isPaused = false;
    }

    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }

    if (this._config && this._config.interval && !this._isPaused) {
      this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
    }
  };

  _proto.to = function to(index) {
    var _this = this;

    this._activeElement = SelectorEngine.findOne(Selector.ACTIVE_ITEM, this._element);

    var activeIndex = this._getItemIndex(this._activeElement);

    if (index > this._items.length - 1 || index < 0) {
      return;
    }

    if (this._isSliding) {
      EventHandler.one(this._element, Event.SLID, function () {
        return _this.to(index);
      });
      return;
    }

    if (activeIndex === index) {
      this.pause();
      this.cycle();
      return;
    }

    var direction = index > activeIndex ? Direction.NEXT : Direction.PREV;

    this._slide(direction, this._items[index]);
  };

  _proto.dispose = function dispose() {
    EventHandler.off(this._element, EVENT_KEY);
    Data.removeData(this._element, DATA_KEY);
    this._items = null;
    this._config = null;
    this._element = null;
    this._interval = null;
    this._isPaused = null;
    this._isSliding = null;
    this._activeElement = null;
    this._indicatorsElement = null;
  } // Private
  ;

  _proto._getConfig = function _getConfig(config) {
    config = _objectSpread({}, Default, {}, config);
    typeCheckConfig(NAME, config, DefaultType);
    return config;
  };

  _proto._handleSwipe = function _handleSwipe() {
    var absDeltax = Math.abs(this.touchDeltaX);

    if (absDeltax <= SWIPE_THRESHOLD) {
      return;
    }

    var direction = absDeltax / this.touchDeltaX;
    this.touchDeltaX = 0; // swipe left

    if (direction > 0) {
      this.prev();
    } // swipe right


    if (direction < 0) {
      this.next();
    }
  };

  _proto._addEventListeners = function _addEventListeners() {
    var _this2 = this;

    if (this._config.keyboard) {
      EventHandler.on(this._element, Event.KEYDOWN, function (event) {
        return _this2._keydown(event);
      });
    }

    if (this._config.pause === 'hover') {
      EventHandler.on(this._element, Event.MOUSEENTER, function (event) {
        return _this2.pause(event);
      });
      EventHandler.on(this._element, Event.MOUSELEAVE, function (event) {
        return _this2.cycle(event);
      });
    }

    if (this._config.touch) {
      this._addTouchEventListeners();
    }
  };

  _proto._addTouchEventListeners = function _addTouchEventListeners() {
    var _this3 = this;

    if (!this._touchSupported) {
      return;
    }

    var start = function start(event) {
      if (_this3._pointerEvent && PointerType[event.pointerType.toUpperCase()]) {
        _this3.touchStartX = event.clientX;
      } else if (!_this3._pointerEvent) {
        _this3.touchStartX = event.touches[0].clientX;
      }
    };

    var move = function move(event) {
      // ensure swiping with one touch and not pinching
      if (event.touches && event.touches.length > 1) {
        _this3.touchDeltaX = 0;
      } else {
        _this3.touchDeltaX = event.touches[0].clientX - _this3.touchStartX;
      }
    };

    var end = function end(event) {
      if (_this3._pointerEvent && PointerType[event.pointerType.toUpperCase()]) {
        _this3.touchDeltaX = event.clientX - _this3.touchStartX;
      }

      _this3._handleSwipe();

      if (_this3._config.pause === 'hover') {
        // If it's a touch-enabled device, mouseenter/leave are fired as
        // part of the mouse compatibility events on first tap - the carousel
        // would stop cycling until user tapped out of it;
        // here, we listen for touchend, explicitly pause the carousel
        // (as if it's the second time we tap on it, mouseenter compat event
        // is NOT fired) and after a timeout (to allow for mouse compatibility
        // events to fire) we explicitly restart cycling
        _this3.pause();

        if (_this3.touchTimeout) {
          clearTimeout(_this3.touchTimeout);
        }

        _this3.touchTimeout = setTimeout(function (event) {
          return _this3.cycle(event);
        }, TOUCHEVENT_COMPAT_WAIT + _this3._config.interval);
      }
    };

    makeArray(SelectorEngine.find(Selector.ITEM_IMG, this._element)).forEach(function (itemImg) {
      EventHandler.on(itemImg, Event.DRAG_START, function (e) {
        return e.preventDefault();
      });
    });

    if (this._pointerEvent) {
      EventHandler.on(this._element, Event.POINTERDOWN, function (event) {
        return start(event);
      });
      EventHandler.on(this._element, Event.POINTERUP, function (event) {
        return end(event);
      });

      this._element.classList.add(ClassName.POINTER_EVENT);
    } else {
      EventHandler.on(this._element, Event.TOUCHSTART, function (event) {
        return start(event);
      });
      EventHandler.on(this._element, Event.TOUCHMOVE, function (event) {
        return move(event);
      });
      EventHandler.on(this._element, Event.TOUCHEND, function (event) {
        return end(event);
      });
    }
  };

  _proto._keydown = function _keydown(event) {
    if (/input|textarea/i.test(event.target.tagName)) {
      return;
    }

    switch (event.which) {
      case ARROW_LEFT_KEYCODE:
        event.preventDefault();
        this.prev();
        break;

      case ARROW_RIGHT_KEYCODE:
        event.preventDefault();
        this.next();
        break;

      default:
    }
  };

  _proto._getItemIndex = function _getItemIndex(element) {
    this._items = element && element.parentNode ? makeArray(SelectorEngine.find(Selector.ITEM, element.parentNode)) : [];
    return this._items.indexOf(element);
  };

  _proto._getItemByDirection = function _getItemByDirection(direction, activeElement) {
    var isNextDirection = direction === Direction.NEXT;
    var isPrevDirection = direction === Direction.PREV;

    var activeIndex = this._getItemIndex(activeElement);

    var lastItemIndex = this._items.length - 1;
    var isGoingToWrap = isPrevDirection && activeIndex === 0 || isNextDirection && activeIndex === lastItemIndex;

    if (isGoingToWrap && !this._config.wrap) {
      return activeElement;
    }

    var delta = direction === Direction.PREV ? -1 : 1;
    var itemIndex = (activeIndex + delta) % this._items.length;
    return itemIndex === -1 ? this._items[this._items.length - 1] : this._items[itemIndex];
  };

  _proto._triggerSlideEvent = function _triggerSlideEvent(relatedTarget, eventDirectionName) {
    var targetIndex = this._getItemIndex(relatedTarget);

    var fromIndex = this._getItemIndex(SelectorEngine.findOne(Selector.ACTIVE_ITEM, this._element));

    return EventHandler.trigger(this._element, Event.SLIDE, {
      relatedTarget: relatedTarget,
      direction: eventDirectionName,
      from: fromIndex,
      to: targetIndex
    });
  };

  _proto._setActiveIndicatorElement = function _setActiveIndicatorElement(element) {
    if (this._indicatorsElement) {
      var indicators = SelectorEngine.find(Selector.ACTIVE, this._indicatorsElement);

      for (var i = 0; i < indicators.length; i++) {
        indicators[i].classList.remove(ClassName.ACTIVE);
      }

      var nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)];

      if (nextIndicator) {
        nextIndicator.classList.add(ClassName.ACTIVE);
      }
    }
  };

  _proto._slide = function _slide(direction, element) {
    var _this4 = this;

    var activeElement = SelectorEngine.findOne(Selector.ACTIVE_ITEM, this._element);

    var activeElementIndex = this._getItemIndex(activeElement);

    var nextElement = element || activeElement && this._getItemByDirection(direction, activeElement);

    var nextElementIndex = this._getItemIndex(nextElement);

    var isCycling = Boolean(this._interval);
    var directionalClassName;
    var orderClassName;
    var eventDirectionName;

    if (direction === Direction.NEXT) {
      directionalClassName = ClassName.LEFT;
      orderClassName = ClassName.NEXT;
      eventDirectionName = Direction.LEFT;
    } else {
      directionalClassName = ClassName.RIGHT;
      orderClassName = ClassName.PREV;
      eventDirectionName = Direction.RIGHT;
    }

    if (nextElement && nextElement.classList.contains(ClassName.ACTIVE)) {
      this._isSliding = false;
      return;
    }

    var slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);

    if (slideEvent.defaultPrevented) {
      return;
    }

    if (!activeElement || !nextElement) {
      // Some weirdness is happening, so we bail
      return;
    }

    this._isSliding = true;

    if (isCycling) {
      this.pause();
    }

    this._setActiveIndicatorElement(nextElement);

    if (this._element.classList.contains(ClassName.SLIDE)) {
      nextElement.classList.add(orderClassName);
      reflow(nextElement);
      activeElement.classList.add(directionalClassName);
      nextElement.classList.add(directionalClassName);
      var nextElementInterval = parseInt(nextElement.getAttribute('data-interval'), 10);

      if (nextElementInterval) {
        this._config.defaultInterval = this._config.defaultInterval || this._config.interval;
        this._config.interval = nextElementInterval;
      } else {
        this._config.interval = this._config.defaultInterval || this._config.interval;
      }

      var transitionDuration = getTransitionDurationFromElement(activeElement);
      EventHandler.one(activeElement, TRANSITION_END, function () {
        nextElement.classList.remove(directionalClassName);
        nextElement.classList.remove(orderClassName);
        nextElement.classList.add(ClassName.ACTIVE);
        activeElement.classList.remove(ClassName.ACTIVE);
        activeElement.classList.remove(orderClassName);
        activeElement.classList.remove(directionalClassName);
        _this4._isSliding = false;
        setTimeout(function () {
          EventHandler.trigger(_this4._element, Event.SLID, {
            relatedTarget: nextElement,
            direction: eventDirectionName,
            from: activeElementIndex,
            to: nextElementIndex
          });
        }, 0);
      });
      emulateTransitionEnd(activeElement, transitionDuration);
    } else {
      activeElement.classList.remove(ClassName.ACTIVE);
      nextElement.classList.add(ClassName.ACTIVE);
      this._isSliding = false;
      EventHandler.trigger(this._element, Event.SLID, {
        relatedTarget: nextElement,
        direction: eventDirectionName,
        from: activeElementIndex,
        to: nextElementIndex
      });
    }

    if (isCycling) {
      this.cycle();
    }
  } // Static
  ;

  Carousel._carouselInterface = function _carouselInterface(element, config) {
    var data = Data.getData(element, DATA_KEY);

    var _config = _objectSpread({}, Default, {}, Manipulator.getDataAttributes(element));

    if (typeof config === 'object') {
      _config = _objectSpread({}, _config, {}, config);
    }

    var action = typeof config === 'string' ? config : _config.slide;

    if (!data) {
      data = new Carousel(element, _config);
    }

    if (typeof config === 'number') {
      data.to(config);
    } else if (typeof action === 'string') {
      if (typeof data[action] === 'undefined') {
        throw new TypeError("No method named \"" + action + "\"");
      }

      data[action]();
    } else if (_config.interval && _config.ride) {
      data.pause();
      data.cycle();
    }
  };

  Carousel._jQueryInterface = function _jQueryInterface(config) {
    return this.each(function () {
      Carousel._carouselInterface(this, config);
    });
  };

  Carousel._dataApiClickHandler = function _dataApiClickHandler(event) {
    var selector = getSelectorFromElement(this);

    if (!selector) {
      return;
    }

    var target = SelectorEngine.findOne(selector);

    if (!target || !target.classList.contains(ClassName.CAROUSEL)) {
      return;
    }

    var config = _objectSpread({}, Manipulator.getDataAttributes(target), {}, Manipulator.getDataAttributes(this));

    var slideIndex = this.getAttribute('data-slide-to');

    if (slideIndex) {
      config.interval = false;
    }

    Carousel._carouselInterface(target, config);

    if (slideIndex) {
      Data.getData(target, DATA_KEY).to(slideIndex);
    }

    event.preventDefault();
  };

  Carousel._getInstance = function _getInstance(element) {
    return Data.getData(element, DATA_KEY);
  };

  _createClass(Carousel, null, [{
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

  return Carousel;
}();
/**
 * ------------------------------------------------------------------------
 * Data Api implementation
 * ------------------------------------------------------------------------
 */


EventHandler.on(document, Event.CLICK_DATA_API, Selector.DATA_SLIDE, Carousel._dataApiClickHandler);
EventHandler.on(window, Event.LOAD_DATA_API, function () {
  var carousels = makeArray(SelectorEngine.find(Selector.DATA_RIDE));

  for (var i = 0, len = carousels.length; i < len; i++) {
    Carousel._carouselInterface(carousels[i], Data.getData(carousels[i], DATA_KEY));
  }
});
/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .carousel to jQuery only if jQuery is present
 */

if (typeof $ !== 'undefined') {
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  $.fn[NAME] = Carousel._jQueryInterface;
  $.fn[NAME].Constructor = Carousel;

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Carousel._jQueryInterface;
  };
}

export default Carousel;
//# sourceMappingURL=carousel.js.map
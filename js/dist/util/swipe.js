/*!
* CoreUI PRO swipe.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("../dom/event-handler.js"), require("./config.js"), require("./index.js")) : typeof define === "function" && define.amd ? define([
		"../dom/event-handler.js",
		"./config.js",
		"./index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Swipe = factory(global.EventHandler, global.Config, global.Index));
})(this, function(js_src_dom_event_handler_js, js_src_util_config_js, js_src_util_index_js) {
	//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	//#endregion
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_util_config_js = __toESM(js_src_util_config_js);
	//#region js/src/util/swipe.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/swipe.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's util/swipe.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "swipe";
	const EVENT_KEY = ".coreui.swipe";
	const EVENT_TOUCHSTART = `touchstart${EVENT_KEY}`;
	const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY}`;
	const EVENT_TOUCHEND = `touchend${EVENT_KEY}`;
	const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY}`;
	const EVENT_POINTERUP = `pointerup${EVENT_KEY}`;
	const POINTER_TYPE_TOUCH = "touch";
	const POINTER_TYPE_PEN = "pen";
	const CLASS_NAME_POINTER_EVENT = "pointer-event";
	const SWIPE_THRESHOLD = 40;
	const Default = {
		endCallback: null,
		leftCallback: null,
		rightCallback: null
	};
	const DefaultType = {
		endCallback: "(function|null)",
		leftCallback: "(function|null)",
		rightCallback: "(function|null)"
	};
	//#endregion
	return class Swipe extends js_src_util_config_js.default {
		constructor(element, config) {
			super();
			this._element = element;
			if (!element || !Swipe.isSupported()) return;
			this._config = this._getConfig(config);
			this._deltaX = 0;
			this._supportPointerEvents = Boolean(window.PointerEvent);
			this._initEvents();
		}
		static get Default() {
			return Default;
		}
		static get DefaultType() {
			return DefaultType;
		}
		static get NAME() {
			return NAME;
		}
		dispose() {
			js_src_dom_event_handler_js.default.off(this._element, EVENT_KEY);
		}
		_start(event) {
			if (!this._supportPointerEvents) {
				this._deltaX = event.touches[0].clientX;
				return;
			}
			if (this._eventIsPointerPenTouch(event)) this._deltaX = event.clientX;
		}
		_end(event) {
			if (this._eventIsPointerPenTouch(event)) this._deltaX = event.clientX - this._deltaX;
			this._handleSwipe();
			(0, js_src_util_index_js.execute)(this._config.endCallback);
		}
		_move(event) {
			this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
		}
		_handleSwipe() {
			const absDeltaX = Math.abs(this._deltaX);
			if (absDeltaX <= SWIPE_THRESHOLD) return;
			const direction = absDeltaX / this._deltaX;
			this._deltaX = 0;
			if (!direction) return;
			(0, js_src_util_index_js.execute)(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
		}
		_initEvents() {
			if (this._supportPointerEvents) {
				js_src_dom_event_handler_js.default.on(this._element, EVENT_POINTERDOWN, (event) => this._start(event));
				js_src_dom_event_handler_js.default.on(this._element, EVENT_POINTERUP, (event) => this._end(event));
				this._element.classList.add(CLASS_NAME_POINTER_EVENT);
			} else {
				js_src_dom_event_handler_js.default.on(this._element, EVENT_TOUCHSTART, (event) => this._start(event));
				js_src_dom_event_handler_js.default.on(this._element, EVENT_TOUCHMOVE, (event) => this._move(event));
				js_src_dom_event_handler_js.default.on(this._element, EVENT_TOUCHEND, (event) => this._end(event));
			}
		}
		_eventIsPointerPenTouch(event) {
			return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
		}
		static isSupported() {
			return "ontouchstart" in document.documentElement || navigator.maxTouchPoints > 0;
		}
	};
});

//# sourceMappingURL=swipe.js.map
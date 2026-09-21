/*!
* CoreUI PRO popover.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./tooltip.js"), require("./util/index.js"), require("./dom/event-handler.js")) : typeof define === "function" && define.amd ? define([
		"./tooltip.js",
		"./util/index.js",
		"./dom/event-handler.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Popover = factory(global.Tooltip, global.Index, global.EventHandler));
})(this, function(js_src_tooltip_js, js_src_util_index_js, js_src_dom_event_handler_js) {
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
	js_src_tooltip_js = __toESM(js_src_tooltip_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	//#region js/src/popover.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI popover.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's popover.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "popover";
	const SELECTOR_TITLE = ".popover-header";
	const SELECTOR_CONTENT = ".popover-body";
	const SELECTOR_DATA_TOGGLE = "[data-coreui-toggle=\"popover\"]";
	const EVENT_CLICK = "click";
	const EVENT_FOCUSIN = "focusin";
	const EVENT_MOUSEENTER = "mouseenter";
	const Default = {
		...js_src_tooltip_js.default.Default,
		content: "",
		offset: [0, 8],
		placement: "right",
		template: "<div class=\"popover\" role=\"tooltip\"><div class=\"popover-arrow\"></div><h3 class=\"popover-header\"></h3><div class=\"popover-body\"></div></div>",
		trigger: "click"
	};
	const DefaultType = {
		...js_src_tooltip_js.default.DefaultType,
		content: "(null|string|element|function)"
	};
	/**
	* Class definition
	*/
	var Popover = class Popover extends js_src_tooltip_js.default {
		constructor(element, config) {
			super(element, config);
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
		_isWithContent() {
			return Boolean(this._getTitle() || this._getContent()) || this._hasNewContent();
		}
		_getContentForTemplate() {
			return {
				[SELECTOR_TITLE]: this._getTitle(),
				[SELECTOR_CONTENT]: this._getContent()
			};
		}
		_getContent() {
			return this._resolvePossibleFunction(this._config.content);
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Popover, config, args);
		}
	};
	/**
	* Data API implementation - auto-initialize popovers
	*/
	const initPopover = (event) => {
		const target = event.target.closest(SELECTOR_DATA_TOGGLE);
		if (!target) return;
		if (event.type === "click") event.preventDefault();
		Popover.getOrCreateInstance(target);
	};
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK, SELECTOR_DATA_TOGGLE, initPopover);
	js_src_dom_event_handler_js.default.on(document, EVENT_FOCUSIN, SELECTOR_DATA_TOGGLE, initPopover);
	js_src_dom_event_handler_js.default.on(document, EVENT_MOUSEENTER, SELECTOR_DATA_TOGGLE, initPopover);
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Popover);
	//#endregion
	return Popover;
});

//# sourceMappingURL=popover.js.map
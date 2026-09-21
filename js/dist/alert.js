/*!
* CoreUI PRO alert.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./util/component-functions.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./util/component-functions.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Alert = factory(global.BaseComponent, global.EventHandler, global.ComponentFunctions, global.Index));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_util_component_functions_js, js_src_util_index_js) {
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
	js_src_base_component_js = __toESM(js_src_base_component_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	//#region js/src/alert.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI alert.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's alert.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "alert";
	const EVENT_KEY = `.coreui.alert`;
	const EVENT_CLOSE = `close${EVENT_KEY}`;
	const EVENT_CLOSED = `closed${EVENT_KEY}`;
	const CLASS_NAME_HIDING = "hiding";
	const CLASS_NAME_SHOW = "show";
	/**
	* Class definition
	*/
	var Alert = class Alert extends js_src_base_component_js.default {
		static get NAME() {
			return NAME;
		}
		async close() {
			if (js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CLOSE).defaultPrevented) return;
			this._element.classList.remove(CLASS_NAME_SHOW);
			this._element.classList.add(CLASS_NAME_HIDING);
			const isAnimated = (0, js_src_util_index_js.getTransitionDurationFromElement)(this._element) > 0;
			await this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
		}
		_destroyElement() {
			this._element.remove();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CLOSED);
			this.dispose();
		}
		static jQueryInterface(config) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Alert, config, (element) => [element]);
		}
	};
	/**
	* Data API implementation
	*/
	(0, js_src_util_component_functions_js.enableDismissTrigger)(Alert, "close");
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Alert);
	//#endregion
	return Alert;
});

//# sourceMappingURL=alert.js.map
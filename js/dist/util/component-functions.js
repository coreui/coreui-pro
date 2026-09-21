/*!
* CoreUI PRO component-functions.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("../dom/event-handler.js"), require("../dom/selector-engine.js"), require("./index.js")) : typeof define === "function" && define.amd ? define([
		"exports",
		"../dom/event-handler.js",
		"../dom/selector-engine.js",
		"./index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.ComponentFunctions = {}, global.EventHandler, global.SelectorEngine, global.Index));
})(this, function(exports, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_index_js) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
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
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	//#region js/src/util/component-functions.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/component-functions.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's util/component-functions.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	const enableDismissTrigger = (component, method = "hide", closestSelector) => {
		const clickEvent = `click.dismiss${component.EVENT_KEY}`;
		const name = component.NAME;
		js_src_dom_event_handler_js.default.on(document, clickEvent, `[data-coreui-dismiss="${name}"]`, function(event) {
			if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
			if ((0, js_src_util_index_js.isDisabled)(this)) return;
			const target = js_src_dom_selector_engine_js.default.getElementFromSelector(this) || this.closest(closestSelector ?? `.${name}`);
			component.getOrCreateInstance(target)[method]();
		});
	};
	//#endregion
	exports.enableDismissTrigger = enableDismissTrigger;
});

//# sourceMappingURL=component-functions.js.map
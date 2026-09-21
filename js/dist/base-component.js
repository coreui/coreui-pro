/*!
* CoreUI PRO base-component.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./dom/data.js"), require("./dom/event-handler.js"), require("./util/config.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./dom/data.js",
		"./dom/event-handler.js",
		"./util/config.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.BaseComponent = factory(global.Data, global.EventHandler, global.Config, global.Index));
})(this, function(js_src_dom_data_js, js_src_dom_event_handler_js, js_src_util_config_js, js_src_util_index_js) {
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
	js_src_dom_data_js = __toESM(js_src_dom_data_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_util_config_js = __toESM(js_src_util_config_js);
	//#region js/src/base-component.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI base-component.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's base-component.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const VERSION = "6.0.0-alpha.0";
	/**
	* Class definition
	*/
	var BaseComponent = class extends js_src_util_config_js.default {
		constructor(element, config) {
			super();
			element = (0, js_src_util_index_js.getElement)(element);
			if (!element) return;
			this._element = element;
			this._config = this._getConfig(config);
			const existingInstance = js_src_dom_data_js.default.get(this._element, this.constructor.DATA_KEY);
			if (existingInstance) existingInstance.dispose();
			js_src_dom_data_js.default.set(this._element, this.constructor.DATA_KEY, this);
		}
		dispose() {
			js_src_dom_data_js.default.remove(this._element, this.constructor.DATA_KEY);
			js_src_dom_event_handler_js.default.off(this._element, this.constructor.EVENT_KEY);
			for (const propertyName of Object.getOwnPropertyNames(this)) this[propertyName] = null;
		}
		_queueCallback(callback, element, isAnimated = true, transitionProperty) {
			return new Promise((resolve) => {
				(0, js_src_util_index_js.executeAfterTransition)(() => {
					if (this._element) callback();
					resolve();
				}, element, isAnimated, transitionProperty);
			});
		}
		_getConfig(config) {
			config = this._mergeConfigObj(config, this._element);
			config = this._configAfterMerge(config);
			this._typeCheckConfig(config);
			return config;
		}
		static getInstance(element) {
			return js_src_dom_data_js.default.get((0, js_src_util_index_js.getElement)(element), this.DATA_KEY);
		}
		static getOrCreateInstance(element, config = {}) {
			return this.getInstance(element) || new this(element, typeof config === "object" ? config : null);
		}
		static get VERSION() {
			return VERSION;
		}
		static get DATA_KEY() {
			return `coreui.${this.NAME}`;
		}
		static get EVENT_KEY() {
			return `.${this.DATA_KEY}`;
		}
		static eventName(name) {
			return `${name}${this.EVENT_KEY}`;
		}
	};
	//#endregion
	return BaseComponent;
});

//# sourceMappingURL=base-component.js.map
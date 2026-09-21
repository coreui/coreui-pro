/*!
* CoreUI PRO config.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("../dom/manipulator.js"), require("./index.js")) : typeof define === "function" && define.amd ? define(["../dom/manipulator.js", "./index.js"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Config = factory(global.Manipulator, global.Index));
})(this, function(js_src_dom_manipulator_js, js_src_util_index_js) {
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
	js_src_dom_manipulator_js = __toESM(js_src_dom_manipulator_js);
	//#region js/src/util/config.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/config.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's util/config.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const DISALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set([
		"sanitize",
		"allowList",
		"sanitizeFn"
	]);
	/**
	* Class definition
	*/
	var Config = class {
		static get Default() {
			return {};
		}
		static get DefaultType() {
			return {};
		}
		static get NAME() {
			throw new Error("You have to implement the static method \"NAME\", for each component!");
		}
		_getConfig(config) {
			config = this._mergeConfigObj(config);
			config = this._configAfterMerge(config);
			this._typeCheckConfig(config);
			return config;
		}
		_configAfterMerge(config) {
			return config;
		}
		_mergeConfigObj(config, element) {
			const jsonConfig = (0, js_src_util_index_js.isElement)(element) ? js_src_dom_manipulator_js.default.getDataAttribute(element, "config") : {};
			const markupConfig = {
				...typeof jsonConfig === "object" ? jsonConfig : {},
				...(0, js_src_util_index_js.isElement)(element) ? js_src_dom_manipulator_js.default.getDataAttributes(element) : {}
			};
			for (const key of DISALLOWED_ATTRIBUTES) delete markupConfig[key];
			return {
				...this.constructor.Default,
				...markupConfig,
				...typeof config === "object" ? config : {}
			};
		}
		_typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
			for (const [property, expectedTypes] of Object.entries(configTypes)) {
				const value = config[property];
				const valueType = (0, js_src_util_index_js.isElement)(value) ? "element" : (0, js_src_util_index_js.toType)(value);
				if (!new RegExp(expectedTypes).test(valueType)) throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
			}
		}
	};
	//#endregion
	return Config;
});

//# sourceMappingURL=config.js.map
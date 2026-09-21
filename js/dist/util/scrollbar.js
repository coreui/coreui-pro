/*!
* CoreUI PRO scrollbar.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("../dom/manipulator.js"), require("../dom/selector-engine.js"), require("./index.js")) : typeof define === "function" && define.amd ? define([
		"../dom/manipulator.js",
		"../dom/selector-engine.js",
		"./index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Scrollbar = factory(global.Manipulator, global.SelectorEngine, global.Index));
})(this, function(js_src_dom_manipulator_js, js_src_dom_selector_engine_js, js_src_util_index_js) {
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
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	//#region js/src/util/scrollbar.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/scrollBar.js
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's util/scrollBar.js
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const SELECTOR_FIXED_CONTENT = ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top";
	const SELECTOR_STICKY_CONTENT = ".sticky-top";
	const PROPERTY_PADDING = "padding-right";
	const PROPERTY_MARGIN = "margin-right";
	/**
	* Class definition
	*/
	var ScrollBarHelper = class {
		constructor() {
			this._element = document.body;
		}
		getWidth() {
			const documentWidth = document.documentElement.clientWidth;
			return Math.abs(window.innerWidth - documentWidth);
		}
		hide() {
			const width = this.getWidth();
			this._disableOverFlow();
			this._setElementAttributes(this._element, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
			this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
			this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, (calculatedValue) => calculatedValue - width);
		}
		reset() {
			this._resetElementAttributes(this._element, "overflow");
			this._resetElementAttributes(this._element, PROPERTY_PADDING);
			this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
			this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
		}
		isOverflowing() {
			return this.getWidth() > 0;
		}
		_disableOverFlow() {
			this._saveInitialAttribute(this._element, "overflow");
			this._element.style.overflow = "hidden";
		}
		_setElementAttributes(selector, styleProperty, callback) {
			const scrollbarWidth = this.getWidth();
			const manipulationCallBack = (element) => {
				if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) return;
				this._saveInitialAttribute(element, styleProperty);
				const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
				element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
			};
			this._applyManipulationCallback(selector, manipulationCallBack);
		}
		_saveInitialAttribute(element, styleProperty) {
			const actualValue = element.style.getPropertyValue(styleProperty);
			if (actualValue) js_src_dom_manipulator_js.default.setDataAttribute(element, styleProperty, actualValue);
		}
		_resetElementAttributes(selector, styleProperty) {
			const manipulationCallBack = (element) => {
				const value = js_src_dom_manipulator_js.default.getDataAttribute(element, styleProperty);
				if (value === null) {
					element.style.removeProperty(styleProperty);
					return;
				}
				js_src_dom_manipulator_js.default.removeDataAttribute(element, styleProperty);
				element.style.setProperty(styleProperty, value);
			};
			this._applyManipulationCallback(selector, manipulationCallBack);
		}
		_applyManipulationCallback(selector, callBack) {
			if ((0, js_src_util_index_js.isElement)(selector)) {
				callBack(selector);
				return;
			}
			for (const sel of js_src_dom_selector_engine_js.default.find(selector, this._element)) callBack(sel);
		}
	};
	//#endregion
	return ScrollBarHelper;
});

//# sourceMappingURL=scrollbar.js.map
/*!
* CoreUI PRO backdrop.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("../dom/event-handler.js"), require("./config.js"), require("./index.js")) : typeof define === "function" && define.amd ? define([
		"../dom/event-handler.js",
		"./config.js",
		"./index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Backdrop = factory(global.EventHandler, global.Config, global.Index));
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
	//#region js/src/util/backdrop.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/backdrop.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's util/backdrop.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "backdrop";
	const CLASS_NAME_FADE = "fade";
	const CLASS_NAME_SHOW = "show";
	const EVENT_MOUSEDOWN = `mousedown.coreui.${NAME}`;
	const Default = {
		className: "modal-backdrop",
		clickCallback: null,
		isAnimated: false,
		isVisible: true,
		rootElement: "body"
	};
	const DefaultType = {
		className: "string",
		clickCallback: "(function|null)",
		isAnimated: "boolean",
		isVisible: "boolean",
		rootElement: "(element|string)"
	};
	/**
	* Class definition
	*/
	var Backdrop = class extends js_src_util_config_js.default {
		constructor(config) {
			super();
			this._config = this._getConfig(config);
			this._isAppended = false;
			this._element = null;
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
		show(callback) {
			if (!this._config.isVisible) {
				(0, js_src_util_index_js.execute)(callback);
				return;
			}
			this._append();
			const element = this._getElement();
			if (this._config.isAnimated) (0, js_src_util_index_js.reflow)(element);
			element.classList.add(CLASS_NAME_SHOW);
			this._emulateAnimation(() => {
				(0, js_src_util_index_js.execute)(callback);
			});
		}
		hide(callback) {
			if (!this._config.isVisible) {
				(0, js_src_util_index_js.execute)(callback);
				return;
			}
			this._getElement().classList.remove(CLASS_NAME_SHOW);
			this._emulateAnimation(() => {
				this.dispose();
				(0, js_src_util_index_js.execute)(callback);
			});
		}
		dispose() {
			if (!this._isAppended) return;
			js_src_dom_event_handler_js.default.off(this._element, EVENT_MOUSEDOWN);
			this._element.remove();
			this._isAppended = false;
		}
		_getElement() {
			if (!this._element) {
				const backdrop = document.createElement("div");
				backdrop.className = this._config.className;
				if (this._config.isAnimated) backdrop.classList.add(CLASS_NAME_FADE);
				this._element = backdrop;
			}
			return this._element;
		}
		_configAfterMerge(config) {
			config.rootElement = (0, js_src_util_index_js.getElement)(config.rootElement);
			return config;
		}
		_append() {
			if (this._isAppended) return;
			const element = this._getElement();
			this._config.rootElement.append(element);
			js_src_dom_event_handler_js.default.on(element, EVENT_MOUSEDOWN, () => {
				(0, js_src_util_index_js.execute)(this._config.clickCallback);
			});
			this._isAppended = true;
		}
		_emulateAnimation(callback) {
			(0, js_src_util_index_js.executeAfterTransition)(callback, this._getElement(), this._config.isAnimated);
		}
	};
	//#endregion
	return Backdrop;
});

//# sourceMappingURL=backdrop.js.map
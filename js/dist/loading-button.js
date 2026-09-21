/*!
* CoreUI PRO loading-button.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.LoadingButton = factory(global.BaseComponent, global.EventHandler, global.Index));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_util_index_js) {
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
	//#region js/src/loading-button.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO loading-button.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "loading-button";
	const EVENT_KEY = `.coreui.loading-button`;
	const DATA_API_KEY = ".data-api";
	const EVENT_START = `start${EVENT_KEY}`;
	const EVENT_STOP = `stop${EVENT_KEY}`;
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
	const CLASS_NAME_IS_LOADING = "is-loading";
	const CLASS_NAME_LOADING_BUTTON = "btn-loading";
	const CLASS_NAME_LOADING_BUTTON_SPINNER = "btn-loading-spinner";
	const SELECTOR_DATA_TOGGLE = "[data-coreui-toggle=\"loading-button\"]";
	const Default = {
		disabledOnLoading: false,
		spinner: true,
		spinnerType: "border",
		timeout: false
	};
	const DefaultType = {
		disabledOnLoading: "boolean",
		spinner: "boolean",
		spinnerType: "string",
		timeout: "(boolean|number)"
	};
	/**
	* Class definition
	*/
	var LoadingButton = class LoadingButton extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._startTimeout = null;
			this._timeout = null;
			this._spinner = null;
			this._state = "idle";
			this._createButton();
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
		start() {
			if (this._state === "loading") return;
			this._createSpinner();
			this._state = "loading";
			this._startTimeout = setTimeout(() => {
				this._element.classList.add(CLASS_NAME_IS_LOADING);
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_START);
				if (this._config.disabledOnLoading) this._element.setAttribute("disabled", true);
			}, 1);
			if (this._config.timeout) this._timeout = setTimeout(() => {
				this.stop();
			}, this._config.timeout);
		}
		stop() {
			if (this._state !== "loading") return;
			this._clearTimeouts();
			this._element.classList.remove(CLASS_NAME_IS_LOADING);
			const stoped = () => {
				this._removeSpinner();
				this._state = "idle";
				if (this._config.disabledOnLoading) this._element.removeAttribute("disabled");
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_STOP);
			};
			if (this._spinner) {
				this._queueCallback(stoped, this._spinner, true);
				return;
			}
			stoped();
		}
		dispose() {
			this._clearTimeouts();
			super.dispose();
		}
		_clearTimeouts() {
			if (this._startTimeout) {
				clearTimeout(this._startTimeout);
				this._startTimeout = null;
			}
			if (this._timeout) {
				clearTimeout(this._timeout);
				this._timeout = null;
			}
		}
		_createButton() {
			this._element.classList.add(CLASS_NAME_LOADING_BUTTON);
		}
		_createSpinner() {
			if (this._config.spinner) {
				const spinner = document.createElement("span");
				const type = this._config.spinnerType;
				spinner.classList.add(CLASS_NAME_LOADING_BUTTON_SPINNER, `spinner-${type}`);
				spinner.setAttribute("role", "status");
				spinner.setAttribute("aria-hidden", "true");
				this._element.insertBefore(spinner, this._element.firstChild);
				this._spinner = spinner;
			}
		}
		_removeSpinner() {
			if (this._config.spinner) {
				this._spinner.remove();
				this._spinner = null;
			}
		}
		static loadingButtonInterface(element, config, ...args) {
			const data = LoadingButton.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, LoadingButton, config);
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, (event) => {
		const button = event.target.closest(SELECTOR_DATA_TOGGLE);
		LoadingButton.getOrCreateInstance(button).start();
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(LoadingButton);
	//#endregion
	return LoadingButton;
});

//# sourceMappingURL=loading-button.js.map
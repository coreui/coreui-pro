/*!
* CoreUI PRO loading-button.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./util/announce.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./util/announce.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.LoadingButton = factory(global.BaseComponent, global.EventHandler, global.Announce, global.Index));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_util_announce_js, js_src_util_index_js) {
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
	const NAME = "loading-button";
	const EVENT_KEY = `.coreui.loading-button`;
	const DATA_API_KEY = ".data-api";
	const EVENT_START = `start${EVENT_KEY}`;
	const EVENT_STOP = `stop${EVENT_KEY}`;
	const EVENT_CLICK = "click";
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
	const CLASS_NAME_DISABLED = "disabled";
	const CLASS_NAME_IS_LOADING = "is-loading";
	const CLASS_NAME_LOADING_BUTTON = "btn-loading";
	const CLASS_NAME_LOADING_BUTTON_SPINNER = "btn-loading-spinner";
	const SELECTOR_HIDDEN_CONTENT = `[aria-hidden="true"], [hidden], .${CLASS_NAME_LOADING_BUTTON_SPINNER}`;
	const SELECTOR_DATA_TOGGLE = "[data-coreui-toggle=\"loading-button\"]";
	const Default = {
		ariaLoadingLabel: "Loading",
		disabledOnLoading: false,
		spinner: true,
		spinnerType: "border",
		timeout: false
	};
	const DefaultType = {
		ariaLoadingLabel: "string",
		disabledOnLoading: "boolean",
		spinner: "boolean",
		spinnerType: "string",
		timeout: "(boolean|number)"
	};
	var LoadingButton = class LoadingButton extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._startTimeout = null;
			this._timeout = null;
			this._spinner = null;
			this._state = "idle";
			this._handleClick = (event) => this._blockClick(event);
			this._blocked = false;
			this._announcement = null;
			this._createButton();
			this._element.addEventListener(EVENT_CLICK, this._handleClick, true);
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
				if (this._config.disabledOnLoading) this._block();
				this._announcement = this._announce([this._getName(), this._config.ariaLoadingLabel].filter(Boolean).join(", "), "high");
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_START);
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
				this._unblock();
				if (this._announcement) {
					this._announcement();
					this._announcement = null;
					this._announce(this._getName(), "normal");
				}
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
			this._unblock();
			this._spinner?.remove();
			this._announcement?.();
			this._element.removeEventListener(EVENT_CLICK, this._handleClick, true);
			this._element.classList.remove(CLASS_NAME_IS_LOADING);
			super.dispose();
		}
		_announce(message, priority) {
			if (!message || this._element.getRootNode().activeElement !== this._element) return null;
			return (0, js_src_util_announce_js.announce)(message, {
				context: this._element,
				priority
			});
		}
		_block() {
			if (this._element.classList.contains(CLASS_NAME_DISABLED) || this._element.getAttribute("aria-disabled") === "true") return;
			this._element.classList.add(CLASS_NAME_DISABLED);
			this._element.setAttribute("aria-disabled", "true");
			this._blocked = true;
		}
		_blockClick(event) {
			if (this._blocked) {
				event.preventDefault();
				event.stopImmediatePropagation();
			}
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
				if (this._config.ariaLoadingLabel) {
					spinner.setAttribute("role", "img");
					spinner.setAttribute("aria-label", this._config.ariaLoadingLabel);
				} else spinner.setAttribute("aria-hidden", "true");
				this._element.insertBefore(spinner, this._element.firstChild);
				this._spinner = spinner;
			}
		}
		_getName() {
			const root = this._element.getRootNode();
			const ids = this._element.getAttribute("aria-labelledby");
			if (ids && (root instanceof Document || root instanceof ShadowRoot)) {
				const labelledBy = ids.split(/\s+/).map((id) => root.getElementById(id)?.textContent?.trim()).filter(Boolean).join(" ");
				if (labelledBy) return labelledBy;
			}
			const label = this._element.getAttribute("aria-label")?.trim();
			if (label) return label;
			const content = this._element.cloneNode(true);
			for (const hidden of content.querySelectorAll(SELECTOR_HIDDEN_CONTENT)) hidden.remove();
			return content.textContent?.trim() || this._element.getAttribute("title")?.trim() || "";
		}
		_unblock() {
			if (!this._blocked) return;
			this._element.classList.remove(CLASS_NAME_DISABLED);
			this._element.removeAttribute("aria-disabled");
			this._blocked = false;
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
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, (event) => {
		const button = event.target.closest(SELECTOR_DATA_TOGGLE);
		LoadingButton.getOrCreateInstance(button).start();
	});
	(0, js_src_util_index_js.defineJQueryPlugin)(LoadingButton);
	//#endregion
	return LoadingButton;
});

//# sourceMappingURL=loading-button.js.map
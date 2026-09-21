/*!
* CoreUI PRO focustrap.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("../dom/event-handler.js"), require("../dom/selector-engine.js"), require("./config.js")) : typeof define === "function" && define.amd ? define([
		"../dom/event-handler.js",
		"../dom/selector-engine.js",
		"./config.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Focustrap = factory(global.EventHandler, global.SelectorEngine, global.Config));
})(this, function(js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_config_js) {
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
	js_src_util_config_js = __toESM(js_src_util_config_js);
	//#region js/src/util/focustrap.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI util/focustrap.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This is a modified version of the Bootstrap's util/focustrap.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "focustrap";
	const EVENT_KEY = `.coreui.focustrap`;
	const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
	const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY}`;
	const TAB_KEY = "Tab";
	const TAB_NAV_FORWARD = "forward";
	const TAB_NAV_BACKWARD = "backward";
	const Default = {
		additionalElement: null,
		autofocus: true,
		trapElement: null
	};
	const DefaultType = {
		additionalElement: "(element|null|undefined)",
		autofocus: "boolean",
		trapElement: "element"
	};
	const activeTraps = [];
	/**
	* Class definition
	*/
	var FocusTrap = class extends js_src_util_config_js.default {
		constructor(config) {
			super();
			this._config = this._getConfig(config);
			this._isActive = false;
			this._lastTabNavDirection = null;
			this._focusinHandler = (event) => this._handleFocusin(event);
			this._keydownHandler = (event) => this._handleKeydown(event);
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
		activate() {
			if (this._isActive) return;
			if (this._config.autofocus) this._config.trapElement.focus();
			js_src_dom_event_handler_js.default.on(document, EVENT_FOCUSIN, this._focusinHandler);
			js_src_dom_event_handler_js.default.on(document, EVENT_KEYDOWN_TAB, this._keydownHandler);
			activeTraps.push(this);
			this._isActive = true;
		}
		deactivate() {
			if (!this._isActive) return;
			this._isActive = false;
			activeTraps.splice(activeTraps.indexOf(this), 1);
			js_src_dom_event_handler_js.default.off(document, EVENT_FOCUSIN, this._focusinHandler);
			js_src_dom_event_handler_js.default.off(document, EVENT_KEYDOWN_TAB, this._keydownHandler);
		}
		_isTopmost() {
			return activeTraps[activeTraps.length - 1] === this;
		}
		_handleFocusin(event) {
			const { additionalElement, trapElement } = this._config;
			if (!this._isTopmost() || event.target === document || event.target === trapElement || trapElement.contains(event.target)) return;
			if (additionalElement && (event.target === additionalElement || additionalElement.contains(event.target))) return;
			const elements = js_src_dom_selector_engine_js.default.focusableChildren(trapElement);
			if (elements.length === 0) trapElement.focus();
			else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) elements[elements.length - 1].focus();
			else elements[0].focus();
		}
		_handleKeydown(event) {
			if (!this._isTopmost() || event.key !== TAB_KEY) return;
			this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
			const { additionalElement, trapElement } = this._config;
			if (!additionalElement) return;
			const trapElements = js_src_dom_selector_engine_js.default.focusableChildren(trapElement);
			const additionalElements = js_src_dom_selector_engine_js.default.focusableChildren(additionalElement);
			if (trapElements.length === 0 || additionalElements.length === 0) return;
			const target = event.target;
			const trapIndex = trapElements.indexOf(target);
			const additionalIndex = additionalElements.indexOf(target);
			const redirect = (element) => {
				event.preventDefault();
				element.focus();
			};
			if (trapIndex === trapElements.length - 1 && !event.shiftKey) {
				redirect(additionalElements[0]);
				return;
			}
			if (trapIndex === 0 && event.shiftKey) {
				redirect(additionalElements[additionalElements.length - 1]);
				return;
			}
			if (additionalIndex === additionalElements.length - 1 && !event.shiftKey) {
				redirect(trapElements[0]);
				return;
			}
			if (additionalIndex === 0 && event.shiftKey) redirect(trapElements[trapElements.length - 1]);
		}
	};
	//#endregion
	return FocusTrap;
});

//# sourceMappingURL=focustrap.js.map
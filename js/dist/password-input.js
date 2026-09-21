/*!
* CoreUI PRO password-input.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/form-control-group.js"), require("./util/icons.js"), require("./util/sanitizer.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/form-control-group.js",
		"./util/icons.js",
		"./util/sanitizer.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.PasswordInput = factory(global.BaseComponent, global.EventHandler, global.SelectorEngine, global.FormControlGroup, global.Icons, global.Sanitizer, global.Index));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_form_control_group_js, js_src_util_icons_js, js_src_util_sanitizer_js, js_src_util_index_js) {
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
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	//#region js/src/password-input.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI password-input.js
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "password-input";
	const EVENT_KEY = `.coreui.password-input`;
	const DATA_API_KEY = ".data-api";
	const EVENT_CLICK = `click${EVENT_KEY}`;
	const CLASS_NAME_ACTION = "form-control-action";
	const CLASS_NAME_PASSWORD_INPUT = "password-input";
	const SELECTOR_DATA_PASSWORD_INPUT = "[data-coreui-password-input]";
	const Default = {
		allowList: js_src_util_sanitizer_js.SVGAllowlist,
		ariaToggleLabel: "Toggle password visibility",
		hideIcon: js_src_util_icons_js.PASSWORD_HIDE_ICON,
		sanitize: true,
		sanitizeFn: null,
		showIcon: js_src_util_icons_js.PASSWORD_SHOW_ICON
	};
	const DefaultType = {
		allowList: "object",
		ariaToggleLabel: "string",
		hideIcon: "string",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		showIcon: "string"
	};
	/**
	* Class definition
	*/
	var PasswordInput = class PasswordInput extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element, config);
			this._group = null;
			this._toggleElement = null;
			this._createToggle();
			this._updateToggleState();
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
		toggle() {
			this._element.type = this._element.type === "password" ? "text" : "password";
			this._updateToggleState();
		}
		dispose() {
			if (this._toggleElement) {
				js_src_dom_event_handler_js.default.off(this._toggleElement, EVENT_KEY);
				this._toggleElement.remove();
			}
			if (this._group) {
				this._group.element.classList.remove(CLASS_NAME_PASSWORD_INPUT);
				(0, js_src_util_form_control_group_js.releaseControlGroup)(this._element, this._group);
			}
			super.dispose();
		}
		_createToggle() {
			this._group = (0, js_src_util_form_control_group_js.ensureControlGroup)(this._element);
			this._group.element.classList.add(CLASS_NAME_PASSWORD_INPUT);
			this._toggleElement = (0, js_src_util_form_control_group_js.createControlGroupAction)({
				className: CLASS_NAME_ACTION,
				disabled: this._element.disabled,
				icon: this._config.showIcon,
				label: this._config.ariaToggleLabel,
				sanitizeIcon: (icon) => (0, js_src_util_sanitizer_js.sanitizeByConfig)(icon, this._config)
			});
			js_src_dom_event_handler_js.default.on(this._toggleElement, EVENT_CLICK, () => this.toggle());
			this._group.element.append(this._toggleElement);
		}
		_updateToggleState() {
			if (!this._toggleElement) return;
			const visible = this._element.type === "text";
			this._toggleElement.setAttribute("aria-pressed", visible ? "true" : "false");
			this._toggleElement.innerHTML = (0, js_src_util_sanitizer_js.sanitizeByConfig)(visible ? this._config.hideIcon : this._config.showIcon, this._config);
		}
		static _initializeDataApi() {
			for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_PASSWORD_INPUT)) PasswordInput.getOrCreateInstance(element);
		}
		static jQueryInterface(config) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, PasswordInput, config, (element) => [element]);
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
		PasswordInput._initializeDataApi();
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(PasswordInput);
	//#endregion
	return PasswordInput;
});

//# sourceMappingURL=password-input.js.map
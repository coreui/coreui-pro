/*!
* CoreUI PRO otp-input.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.OtpInput = factory(global.BaseComponent, global.EventHandler, global.SelectorEngine, global.Index));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_index_js) {
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
	//#region js/src/otp-input.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI otp-input.js
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "otp-input";
	const EVENT_KEY = `.coreui.otp-input`;
	const DATA_API_KEY = ".data-api";
	const ARROW_RIGHT_KEY = "ArrowRight";
	const ARROW_LEFT_KEY = "ArrowLeft";
	const BACKSPACE_KEY = "Backspace";
	const EVENT_BEFORE_INPUT = `beforeinput${EVENT_KEY}`;
	const EVENT_CHANGE = `change${EVENT_KEY}`;
	const EVENT_COMPLETE = `complete${EVENT_KEY}`;
	const EVENT_FOCUS = `focus${EVENT_KEY}`;
	const EVENT_INPUT = `input${EVENT_KEY}`;
	const EVENT_KEYDOWN = `keydown${EVENT_KEY}`;
	const EVENT_PASTE = `paste${EVENT_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const SELECTOR_DATA_OTP = "[data-coreui-otp]";
	const SELECTOR_FORM_OTP_CONTROL = ".form-otp-control";
	const Default = {
		ariaLabel: (index, total) => `Digit ${index + 1} of ${total}`,
		autoSubmit: false,
		disabled: false,
		id: null,
		linear: true,
		masked: false,
		name: null,
		placeholder: null,
		readonly: false,
		required: false,
		type: "number",
		value: null
	};
	const DefaultType = {
		ariaLabel: "function",
		autoSubmit: "boolean",
		disabled: "boolean",
		id: "(string|null)",
		linear: "boolean",
		masked: "boolean",
		name: "(string|null)",
		placeholder: "(number|string|null)",
		readonly: "boolean",
		required: "boolean",
		type: "string",
		value: "(number|string|null)"
	};
	/**
	* Class definition
	*/
	var OTPInput = class OTPInput extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element, config);
			this._config = this._getConfig(config);
			this._inputElement = null;
			this._setRoleAttribute();
			this._setInputsAttributes();
			this._seedSlots();
			this._createHiddenInput();
			this._setInputsTabIndexes();
			this._addEventListeners();
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
		clear() {
			const inputs = this._getInputs();
			for (const input of inputs) input.value = "";
			this._setHiddenInputValue(null);
			this._syncFirstInputMaxLength();
			this._setInputsTabIndexes();
		}
		dispose() {
			this._inputElement?.remove();
			super.dispose();
		}
		reset() {
			this._seedSlots({ clearWhenEmpty: true });
			this._setHiddenInputValue(this._readSlots() || null);
			this._setInputsTabIndexes();
		}
		setConfig(config) {
			if (typeof config !== "object" || config === null) return;
			const previousValue = this._config.value;
			this._config = this._getConfig({
				...this._config,
				...config
			});
			const repaint = this._config.value !== previousValue;
			this._setInputsAttributes();
			if (repaint) this._seedSlots({ clearWhenEmpty: true });
			this._setInputsTabIndexes();
			this._inputElement.remove();
			this._createHiddenInput();
			if (repaint) this._setHiddenInputValue(this._readSlots() || null);
		}
		_addEventListeners() {
			js_src_dom_event_handler_js.default.on(this._element, EVENT_BEFORE_INPUT, SELECTOR_FORM_OTP_CONTROL, (event) => {
				const { data, inputType } = event;
				if (inputType === "insertText" && data && data.length === 1 && !this._isValidInput(data)) event.preventDefault();
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_FOCUS, SELECTOR_FORM_OTP_CONTROL, (event) => {
				const { target } = event;
				if (target.value) {
					setTimeout(() => {
						target.select();
					}, 0);
					return;
				}
				if (this._config.linear) {
					const firstEmptyInput = this._getInputs().find((input) => !input.value);
					if (firstEmptyInput && firstEmptyInput !== target) firstEmptyInput.focus();
				}
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_INPUT, SELECTOR_FORM_OTP_CONTROL, (event) => {
				const { target } = event;
				if (target.value.length > 1) {
					const chars = this._extractValidChars(target.value);
					target.value = "";
					if (chars) {
						this._distributeChars(target, chars);
						return;
					}
				}
				if (target.value.length === 1 && !this._isValidInput(target.value)) target.value = "";
				const inputs = this._getInputs();
				if (!inputs.length) return;
				const value = inputs.map((input) => input.value).join("");
				if (value !== (this._inputElement ? this._inputElement.value : "")) this._setHiddenInputValue(value);
				if (target.value.length === 1) {
					const nextInput = (0, js_src_util_index_js.getNextActiveElement)(inputs, target, true);
					if (nextInput) nextInput.focus();
				}
				this._setInputsTabIndexes();
				this._syncFirstInputMaxLength();
				this._checkAutoSubmit(inputs);
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, SELECTOR_FORM_OTP_CONTROL, (event) => {
				const { key, target } = event;
				if (key === BACKSPACE_KEY && target.value === "") {
					const inputs = this._getInputs();
					if (!inputs.length) return;
					(0, js_src_util_index_js.getNextActiveElement)(inputs, target, false).focus();
					this._setInputsTabIndexes();
					return;
				}
				if (key === ARROW_RIGHT_KEY || key === ARROW_LEFT_KEY) {
					const shouldMoveNext = key === ARROW_RIGHT_KEY !== (0, js_src_util_index_js.isRTL)(this._element);
					if (shouldMoveNext && this._config.linear && target.value === "") return;
					const inputs = this._getInputs();
					if (!inputs.length) return;
					(0, js_src_util_index_js.getNextActiveElement)(inputs, target, shouldMoveNext).focus();
				}
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_PASTE, SELECTOR_FORM_OTP_CONTROL, (event) => {
				event.preventDefault();
				const pastedData = event.clipboardData.getData("text");
				const validChars = this._extractValidChars(pastedData);
				if (!validChars) return;
				this._distributeChars(event.target, validChars);
			});
		}
		_distributeChars(startInput, chars) {
			const inputs = this._getInputs();
			if (!inputs.length) return;
			const startIndex = chars.length >= inputs.length ? 0 : Math.max(inputs.indexOf(startInput), 0);
			for (let i = 0; i < chars.length && startIndex + i < inputs.length; i++) inputs[startIndex + i].value = chars[i];
			const nextEmptyIndex = startIndex + chars.length;
			inputs[nextEmptyIndex < inputs.length ? nextEmptyIndex : inputs.length - 1].focus();
			this._setHiddenInputValue(inputs.map((input) => input.value).join(""));
			this._syncFirstInputMaxLength();
			this._setInputsTabIndexes();
			this._checkAutoSubmit(inputs);
		}
		_syncFirstInputMaxLength() {
			const inputs = this._getInputs();
			const [first] = inputs;
			if (first) first.maxLength = first.value ? 1 : inputs.length;
		}
		_checkAutoSubmit(inputs) {
			if (!this._config.autoSubmit) return;
			if (inputs.every((input) => input.value.length === 1)) {
				const form = this._element.closest("form");
				if (form && typeof form.requestSubmit === "function") form.requestSubmit();
			}
		}
		_getInputs() {
			return js_src_dom_selector_engine_js.default.find(SELECTOR_FORM_OTP_CONTROL, this._element);
		}
		_readSlots() {
			return this._getInputs().map((input) => input.value).join("");
		}
		_createHiddenInput() {
			const hiddenInput = document.createElement("input");
			hiddenInput.type = "hidden";
			if (this._config.disabled) hiddenInput.disabled = true;
			if (this._config.id) hiddenInput.id = this._config.id;
			if (this._config.name) hiddenInput.name = this._config.name;
			hiddenInput.value = this._readSlots();
			this._element.append(hiddenInput);
			this._inputElement = hiddenInput;
		}
		_extractValidChars(text) {
			switch (this._config.type) {
				case "number": return text.replace(/\D/g, "");
				default: return text;
			}
		}
		_isValidInput(value) {
			if (value.length !== 1) return false;
			switch (this._config.type) {
				case "number": return /^\d$/.test(value);
				default: return /^.$/s.test(value);
			}
		}
		_setHiddenInputValue(value) {
			if (this._inputElement) this._inputElement.value = value || "";
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value });
			if (value && value.length === this._getInputs().length) js_src_dom_event_handler_js.default.trigger(this._element, EVENT_COMPLETE, { value });
		}
		_seedSlots({ clearWhenEmpty = false } = {}) {
			const value = this._extractValidChars(String(this._config.value ?? ""));
			if (!value && !clearWhenEmpty) return;
			for (const [index, input] of this._getInputs().entries()) input.value = value[index] ?? "";
			this._syncFirstInputMaxLength();
		}
		_setInputsAttributes() {
			const inputs = this._getInputs();
			for (const [index, input] of inputs.entries()) {
				input.type = this._config.masked ? "password" : "text";
				input.maxLength = 1;
				input.autocomplete = index === 0 ? "one-time-code" : "off";
				input.autocapitalize = "off";
				input.setAttribute("autocorrect", "off");
				input.spellcheck = false;
				input.enterKeyHint = index === inputs.length - 1 ? "done" : "next";
				if (this._config.placeholder !== null) {
					const placeholder = String(this._config.placeholder);
					input.placeholder = placeholder.length > 1 ? placeholder[index] || "" : placeholder;
				}
				input.required = this._config.required;
				switch (this._config.type) {
					case "number":
						input.inputMode = "numeric";
						input.pattern = "[0-9]*";
						break;
					default:
						input.inputMode = "text";
						input.pattern = ".*";
				}
				if (this._config.disabled) input.disabled = true;
				if (this._config.id && !input.id) input.id = `${this._config.id}-${index}`;
				if (this._config.readonly) input.readOnly = true;
				if (typeof this._config.ariaLabel === "function") {
					const ariaLabel = this._config.ariaLabel(index, inputs.length);
					input.setAttribute("aria-label", ariaLabel);
				}
			}
			this._syncFirstInputMaxLength();
		}
		_setInputsTabIndexes() {
			const inputs = this._getInputs();
			if (!this._config.linear) {
				for (const input of inputs) input.removeAttribute("tabindex");
				return;
			}
			let foundEmpty = false;
			for (const input of inputs) if (input.value !== "") input.removeAttribute("tabindex");
			else if (foundEmpty) input.tabIndex = -1;
			else {
				input.removeAttribute("tabindex");
				foundEmpty = true;
			}
		}
		_setRoleAttribute() {
			this._element.setAttribute("role", "group");
		}
		static otpInputInterface(element, config, ...args) {
			const data = OTPInput.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, OTPInput, config, args);
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const otp of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_OTP)) OTPInput.otpInputInterface(otp);
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(OTPInput);
	//#endregion
	return OTPInput;
});

//# sourceMappingURL=otp-input.js.map
/*!
* CoreUI PRO otp-input.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/field-label.js"), require("./util/field-validation.js"), require("./util/form-validation.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/field-label.js",
		"./util/field-validation.js",
		"./util/form-validation.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.OtpInput = factory(global.BaseComponent, global.EventHandler, global.SelectorEngine, global.FieldLabel, global.FieldValidation, global.FormValidation, global.Index));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_field_label_js, js_src_util_field_validation_js, js_src_util_form_validation_js, js_src_util_index_js) {
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
	js_src_util_field_validation_js = __toESM(js_src_util_field_validation_js);
	//#region js/src/otp-input.ts
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
		required: false,
		type: "number",
		validationState: null,
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
		required: "boolean",
		type: "string",
		validationState: "(string|null|undefined)",
		value: "(number|string|null)"
	};
	var OTPInput = class OTPInput extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element, config);
			this._config = this._getConfig(config);
			this._disabled = this._config.disabled;
			this._inputElement = null;
			this._placeholders = /* @__PURE__ */ new Map();
			this._resetCode = null;
			this._value = "";
			this._validation = new js_src_util_field_validation_js.default(this._element, {
				canBlock: () => !this._disabled,
				config: () => this._config,
				fields: () => this._inputElement ? [this._inputElement] : [],
				frames: () => [this._element],
				invalidTargets: () => this._getInputs(),
				owned: () => [this._inputElement, ...this._getInputs()],
				restore: () => this._restoreValue(),
				serverClassSources: () => [this._element, ...this._getInputs()]
			});
			this._setRoleAttribute();
			this._setInputsAttributes();
			this._seedSlots(this._config.value);
			this._createValueField();
			this._setInputsTabIndexes();
			this._addEventListeners();
			this._removeLabelClick = (0, js_src_util_field_label_js.onLabelClick)(this._element, () => this._getFirstEmptySlot()?.focus());
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
			this._setValue(null);
			this._syncFirstInputMaxLength();
			this._setInputsTabIndexes();
		}
		dispose() {
			if (!this._element) return;
			this._removeLabelClick();
			this._validation.dispose();
			this._inputElement?.remove();
			this._inputElement = null;
			for (const input of this._placeholders.keys()) this._restorePlaceholder(input);
			super.dispose();
		}
		reset() {
			this._restoreValue();
		}
		disable() {
			this._setDisabled(true);
		}
		enable() {
			this._setDisabled(false);
		}
		setValidationState(validationState) {
			this._config = this._getConfig({
				...this._config,
				validationState
			});
			this._validation.configure({ validationState });
		}
		setValue(value) {
			this._typeCheckConfig({ value }, { value: DefaultType.value });
			this._seedSlots(value, true);
			this._setInputsTabIndexes();
			this._value = this._readSlots();
			(0, js_src_util_form_validation_js.writeValueField)(this._inputElement, this._value);
			this._validation.update();
		}
		_setDisabled(disabled) {
			if (disabled === this._disabled) return;
			this._disabled = disabled;
			for (const input of this._getInputs()) input.disabled = disabled;
			this._inputElement.disabled = disabled;
			this._validation.update();
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
				if (value !== (this._inputElement ? this._inputElement.value : "")) this._setValue(value, true);
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
			this._setValue(inputs.map((input) => input.value).join(""), true);
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
		_getFirstEmptySlot() {
			const inputs = this._getInputs();
			return inputs.find((input) => !input.value) ?? inputs[0];
		}
		_getInputs() {
			return js_src_dom_selector_engine_js.default.find(SELECTOR_FORM_OTP_CONTROL, this._element);
		}
		_readSlots() {
			return this._getInputs().map((input) => input.value).join("");
		}
		_createValueField() {
			const field = (0, js_src_util_form_validation_js.createValueField)("input", () => this._getFirstEmptySlot());
			this._resetCode = this._extractValidChars(String(this._config.value ?? "")) ? this._readSlots() : null;
			field.defaultValue = this._resetCode ?? this._getInputs().map((input) => input.defaultValue).join("");
			this._value = this._readSlots();
			field.value = this._value;
			this._element.append(field);
			this._inputElement = field;
			this._syncValueField();
		}
		_syncValueField() {
			const field = this._inputElement;
			(0, js_src_util_form_validation_js.configureValueField)(field, {
				disabled: this._disabled,
				name: this._config.name,
				required: this._config.required
			});
			field.pattern = `${this._config.type === "number" ? "[0-9]" : "."}{${this._getInputs().length}}`;
			if (this._config.id) field.id = this._config.id;
			else field.removeAttribute("id");
			this._validation.refresh();
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
		_setValue(value, byUser = false) {
			if (!this._inputElement) return;
			const code = value || "";
			const isChanged = code !== this._value;
			this._value = code;
			(0, js_src_util_form_validation_js.writeValueField)(this._inputElement, code);
			if (isChanged && byUser) this._validation.dismiss();
			this._validation.update();
			if (!isChanged) return;
			(0, js_src_util_form_validation_js.dispatchValueChange)(this._inputElement);
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value });
			if (value && value.length === this._getInputs().length) js_src_dom_event_handler_js.default.trigger(this._element, EVENT_COMPLETE, { value });
		}
		_restoreValue() {
			const code = this._resetCode;
			for (const [index, input] of this._getInputs().entries()) input.value = code === null ? input.defaultValue : code[index] ?? "";
			this._setValue(this._readSlots() || null);
			this._syncFirstInputMaxLength();
			this._setInputsTabIndexes();
		}
		_seedSlots(code, clearWhenEmpty = false) {
			const value = this._extractValidChars(String(code ?? ""));
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
					if (!this._placeholders.has(input)) this._placeholders.set(input, input.getAttribute("placeholder"));
					const placeholder = String(this._config.placeholder);
					input.placeholder = placeholder.length > 1 ? placeholder[index] || "" : placeholder;
				}
				(0, js_src_util_index_js.writeAttribute)(input, "aria-required", this._config.required ? "true" : null);
				switch (this._config.type) {
					case "number":
						input.inputMode = "numeric";
						input.pattern = "[0-9]*";
						break;
					default:
						input.inputMode = "text";
						input.pattern = ".*";
				}
				input.disabled = this._disabled;
				input.readOnly = false;
				if (this._config.id && !input.id) input.id = `${this._config.id}-${index}`;
				if (typeof this._config.ariaLabel === "function") {
					const ariaLabel = this._config.ariaLabel(index, inputs.length);
					input.setAttribute("aria-label", ariaLabel);
				}
			}
			this._syncFirstInputMaxLength();
		}
		_restorePlaceholder(input) {
			const placeholder = this._placeholders.get(input);
			if (typeof placeholder === "string") input.placeholder = placeholder;
			else input.removeAttribute("placeholder");
			this._placeholders.delete(input);
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
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const otp of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_OTP)) OTPInput.otpInputInterface(otp);
	});
	(0, js_src_util_index_js.defineJQueryPlugin)(OTPInput);
	//#endregion
	return OTPInput;
});

//# sourceMappingURL=otp-input.js.map
/*!
* CoreUI PRO chip-input.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./chip-set.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/form-control-group.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./chip-set.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/form-control-group.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.ChipInput = factory(global.ChipSet, global.EventHandler, global.SelectorEngine, global.FormControlGroup, global.Index));
})(this, function(js_src_chip_set_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_form_control_group_js, js_src_util_index_js) {
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
	js_src_chip_set_js = __toESM(js_src_chip_set_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	//#region js/src/chip-input.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI chip-input.js
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "chip-input";
	const EVENT_KEY = `.coreui.chip-input`;
	const DATA_API_KEY = ".data-api";
	const EVENT_BLUR = `blur${EVENT_KEY}`;
	const EVENT_CLICK = `click${EVENT_KEY}`;
	const EVENT_FOCUS = `focus${EVENT_KEY}`;
	const EVENT_INPUT = `input${EVENT_KEY}`;
	const EVENT_KEYDOWN = `keydown${EVENT_KEY}`;
	const EVENT_PASTE = `paste${EVENT_KEY}`;
	const SELECTOR_DATA_CHIP_INPUT = "[data-coreui-chip-input]";
	const SELECTOR_CHIP = ".chip";
	const SELECTOR_CHIP_INPUT_LABEL = ".chip-input-label";
	const SELECTOR_CHIP_REMOVE = ".chip-remove";
	const CLASS_NAME_DISABLED = "disabled";
	const CLASS_NAME_CHIP_INPUT_FIELD = "chip-input-field";
	const CLASS_NAME_GROUP = "form-control-group";
	const Default = {
		...js_src_chip_set_js.default.Default,
		create: true,
		createOnBlur: true,
		id: null,
		name: null,
		placeholder: "",
		readonly: false,
		removable: true,
		separator: ",",
		unique: true
	};
	const DefaultType = {
		...js_src_chip_set_js.default.DefaultType,
		create: "boolean",
		createOnBlur: "boolean",
		id: "(string|null)",
		name: "(string|null)",
		placeholder: "string",
		readonly: "boolean",
		separator: "(string|null)"
	};
	/**
	* Class definition
	*
	* ChipInput is a thin input layer on top of ChipSet: ChipSet owns the chips
	* (the single source of truth), while ChipInput only adds the text field, form
	* integration (hidden input) and turns typed text into chips. The public API
	* (methods + `*.coreui.chip-input` events) is preserved through overrides.
	*/
	var ChipInput = class extends js_src_chip_set_js.default {
		constructor(element, config) {
			super(element, config);
			this._addedGroupClass = false;
			this._createdInput = false;
			this._labelledFor = null;
			this._uniqueId = this._config.id ?? (0, js_src_util_index_js.getUID)(NAME);
			this._hiddenInput = null;
			this._addedGroupClass = !this._element.classList.contains(CLASS_NAME_GROUP);
			(0, js_src_util_form_control_group_js.applyControlGroupClasses)(this._element, CLASS_NAME_GROUP);
			this._input = js_src_dom_selector_engine_js.default.findOne("input", this._element);
			if (this._input) this._setInputSize();
			else this._createInput();
			this._applyInteractionState();
			if (this._config.create) this._createHiddenInput();
			this._addInputEventListeners();
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
		add(value) {
			const chip = super.add(value);
			if (chip) this._syncHiddenInput();
			return chip;
		}
		focus() {
			this._input?.focus();
		}
		dispose() {
			if (this._addedGroupClass) this._element.classList.remove(CLASS_NAME_GROUP);
			js_src_dom_event_handler_js.default.off(this._input, EVENT_KEY);
			this._hiddenInput?.remove();
			if (this._createdInput) {
				this._input.remove();
				this._labelledFor?.removeAttribute("for");
			}
			super.dispose();
		}
		_applyAccessibilityRoles() {}
		_canModify() {
			return !this._disabled && !this._config.readonly;
		}
		_appendChip(chip) {
			this._element.insertBefore(chip, this._input);
		}
		_getChipConfig(chip) {
			return {
				ariaRemoveLabel: `Remove ${this._getChipValue(chip)}`,
				disabled: this._disabled,
				removable: this._config.removable && !this._config.readonly && !this._disabled,
				removeIcon: this._config.removeIcon,
				selectable: this._config.selectable
			};
		}
		_setupChip(chip) {
			super._setupChip(chip);
			const removeButton = js_src_dom_selector_engine_js.default.findOne(SELECTOR_CHIP_REMOVE, chip);
			if (removeButton) removeButton.disabled = this._disabled || this._config.readonly;
		}
		_handleChipRemoved(event) {
			super._handleChipRemoved(event);
			this._syncHiddenInput();
			this._input?.focus();
		}
		_syncHiddenInput() {
			if (this._hiddenInput) this._hiddenInput.value = this.getValues().join(",");
		}
		_addInputEventListeners() {
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, (event) => {
				if (event.target === this._input) return;
				if (event.key === ((0, js_src_util_index_js.isRTL)(this._element) ? "ArrowLeft" : "ArrowRight")) {
					const chips = this._getFocusableChips();
					if (chips.length > 0 && chips[chips.length - 1].contains(event.target)) {
						event.preventDefault();
						this._input.focus();
						return;
					}
				}
				if (event.key.length === 1) this._input.focus();
			});
			js_src_dom_event_handler_js.default.on(this._input, EVENT_KEYDOWN, (event) => this._handleInputKeydown(event));
			js_src_dom_event_handler_js.default.on(this._input, EVENT_INPUT, (event) => this._handleInput(event));
			js_src_dom_event_handler_js.default.on(this._input, EVENT_PASTE, (event) => this._handlePaste(event));
			js_src_dom_event_handler_js.default.on(this._input, EVENT_FOCUS, () => this.clearSelection());
			if (this._config.createOnBlur) js_src_dom_event_handler_js.default.on(this._input, EVENT_BLUR, (event) => {
				if (!event.relatedTarget?.closest(SELECTOR_CHIP)) this._createChipFromInput();
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK, (event) => {
				if (event.target === this._element) this._input?.focus();
			});
		}
		_createInput() {
			const input = document.createElement("input");
			const label = js_src_dom_selector_engine_js.default.findOne(SELECTOR_CHIP_INPUT_LABEL, this._element);
			const labelFor = label?.getAttribute("for");
			const generatedInputId = labelFor || (0, js_src_util_index_js.getUID)(`${NAME}-input`);
			this._createdInput = true;
			this._labelledFor = label && !labelFor ? label : null;
			input.type = "text";
			input.className = CLASS_NAME_CHIP_INPUT_FIELD;
			input.id = generatedInputId;
			if (this._config.placeholder) input.placeholder = this._config.placeholder;
			if (label && !labelFor) label.setAttribute("for", generatedInputId);
			this._input = input;
			this._setInputSize();
			this._element.append(input);
		}
		_createHiddenInput() {
			const hiddenInput = document.createElement("input");
			hiddenInput.type = "hidden";
			hiddenInput.id = this._uniqueId;
			if (this._config.name) hiddenInput.name = this._config.name;
			this._element.append(hiddenInput);
			this._hiddenInput = hiddenInput;
			this._hiddenInput.value = this.getValues().join(",");
		}
		_createChipFromInput() {
			if (!this._canModify() || !this._config.create) return;
			const value = this._input.value.trim();
			if (value) {
				this.add(value);
				this._input.value = "";
				this._setInputSize();
			}
		}
		_applyInteractionState() {
			const { readonly } = this._config;
			this._element.classList.toggle(CLASS_NAME_DISABLED, this._disabled);
			this._input.disabled = this._disabled;
			this._input.readOnly = !this._disabled && readonly;
		}
		_handleInputKeydown(event) {
			const { key } = event;
			switch (key) {
				case "Enter":
					event.preventDefault();
					this._createChipFromInput();
					break;
				case "Backspace":
				case "Delete":
					if (this._input.value === "") {
						event.preventDefault();
						const chips = this._getChipElements();
						if (chips.length > 0) chips[chips.length - 1].focus();
					}
					break;
				case "ArrowLeft":
				case "ArrowRight":
					if (key === ((0, js_src_util_index_js.isRTL)(this._element) ? "ArrowRight" : "ArrowLeft") && this._input.selectionStart === 0 && this._input.selectionEnd === 0) {
						event.preventDefault();
						const chips = this._getChipElements();
						if (chips.length > 0) chips[chips.length - 1].focus();
					}
					break;
				case "Escape":
					this._input.value = "";
					this._input.blur();
			}
		}
		_handleInput(event) {
			if (!this._canModify()) return;
			const { value } = event.target;
			const { separator } = this._config;
			if (this._config.create && separator && value.includes(separator)) {
				const parts = value.split(separator);
				for (const part of parts.slice(0, -1)) this.add(part.trim());
				this._input.value = parts[parts.length - 1];
			}
			this._setInputSize();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_INPUT, {
				value: this._input.value,
				relatedTarget: this._input
			});
		}
		_handlePaste(event) {
			if (!this._canModify()) return;
			const { separator } = this._config;
			if (!separator || !this._config.create) return;
			const pastedData = (event.clipboardData || window.clipboardData).getData("text");
			if (pastedData.includes(separator)) {
				event.preventDefault();
				const parts = pastedData.split(separator);
				for (const part of parts) this.add(part.trim());
			}
		}
		_setInputSize() {
			if (!this._input) return;
			this._input.size = Math.max(this._input.placeholder.length, this._input.value.length) || 1;
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_CHIP_INPUT)) ChipInput.getOrCreateInstance(element);
	});
	//#endregion
	return ChipInput;
});

//# sourceMappingURL=chip-input.js.map
/*!
* CoreUI PRO chip-input.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./chip.js"), require("./chip-set.js"), require("./dom/event-handler.js"), require("./dom/manipulator.js"), require("./dom/selector-engine.js"), require("./util/chip-values.js"), require("./util/field-validation.js"), require("./util/focus.js"), require("./util/form-control-group.js"), require("./util/form-validation.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./chip.js",
		"./chip-set.js",
		"./dom/event-handler.js",
		"./dom/manipulator.js",
		"./dom/selector-engine.js",
		"./util/chip-values.js",
		"./util/field-validation.js",
		"./util/focus.js",
		"./util/form-control-group.js",
		"./util/form-validation.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.ChipInput = factory(global.Chip, global.ChipSet, global.EventHandler, global.Manipulator, global.SelectorEngine, global.ChipValues, global.FieldValidation, global.Focus, global.FormControlGroup, global.FormValidation, global.Index));
})(this, function(js_src_chip_js, js_src_chip_set_js, js_src_dom_event_handler_js, js_src_dom_manipulator_js, js_src_dom_selector_engine_js, js_src_util_chip_values_js, js_src_util_field_validation_js, js_src_util_focus_js, js_src_util_form_control_group_js, js_src_util_form_validation_js, js_src_util_index_js) {
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
	js_src_chip_js = __toESM(js_src_chip_js);
	js_src_chip_set_js = __toESM(js_src_chip_set_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_dom_manipulator_js = __toESM(js_src_dom_manipulator_js);
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	js_src_util_field_validation_js = __toESM(js_src_util_field_validation_js);
	//#region js/src/chip-input.ts
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
		required: false,
		separator: ",",
		unique: true,
		validationState: null
	};
	const DefaultType = {
		...js_src_chip_set_js.default.DefaultType,
		create: "boolean",
		createOnBlur: "boolean",
		id: "(string|null)",
		name: "(string|null)",
		placeholder: "string",
		readonly: "boolean",
		required: "boolean",
		separator: "(string|null)",
		validationState: "(string|null|undefined)"
	};
	var ChipInput = class extends js_src_chip_set_js.default {
		constructor(element, config) {
			super(element, config);
			this._createdInput = false;
			this._labelledFor = null;
			this._uniqueId = this._config.id ?? (0, js_src_util_index_js.getUID)(NAME);
			this._valueField = null;
			this._removingByCode = false;
			this._validation = new js_src_util_field_validation_js.default(this._element, {
				config: () => this._config,
				fields: () => this._valueField ? [this._valueField] : [],
				frames: () => [this._element],
				invalidTargets: () => [this._input],
				owned: () => [this._valueField, this._input].filter(Boolean),
				restore: () => this._restoreChips()
			});
			(0, js_src_util_form_control_group_js.applyControlGroupClasses)(this._element, CLASS_NAME_GROUP);
			this._input = js_src_dom_selector_engine_js.default.findOne("input", this._element);
			if (this._input) this._setInputSize();
			else this._createInput();
			this._applyInteractionState();
			if (this._config.create) this._createValueField();
			this._initialChips = this._getChipElements();
			this._addInputEventListeners();
			this._validation.refresh();
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
		remove(chipOrValue) {
			const previous = this._removingByCode;
			this._removingByCode = true;
			try {
				return super.remove(chipOrValue);
			} finally {
				this._removingByCode = previous;
			}
		}
		focus() {
			this._input?.focus();
		}
		setValidationState(validationState) {
			this._setConfig({ validationState });
		}
		dispose() {
			this._validation.dispose();
			js_src_dom_event_handler_js.default.off(this._input, EVENT_KEY);
			this._valueField?.remove();
			if (this._createdInput) {
				this._input.remove();
				this._labelledFor?.removeAttribute("for");
			}
			super.dispose();
		}
		_setConfig(config) {
			if (!config || !("validationState" in config)) return;
			this._config = this._getConfig({
				...this._config,
				validationState: config.validationState
			});
			this._validation.configure({ validationState: config.validationState });
		}
		_containerRole() {
			return null;
		}
		_canModify() {
			return !this._disabled && !this._config.readonly;
		}
		_appendChip(chip) {
			this._element.insertBefore(chip, this._input);
		}
		_getChipConfig(chip) {
			const disabled = this._disabled || js_src_dom_manipulator_js.default.getDataAttribute(chip, "disabled") === true;
			return {
				ariaRemoveLabel: this._config.ariaRemoveLabel,
				disabled,
				removable: this._config.removable && !this._config.readonly && !disabled,
				removeIcon: this._config.removeIcon,
				selectable: this._config.selectable
			};
		}
		_setupChip(chip) {
			super._setupChip(chip);
			const removeButton = js_src_dom_selector_engine_js.default.findOne(SELECTOR_CHIP_REMOVE, chip);
			if (removeButton) removeButton.disabled = this._disabled || this._config.readonly;
		}
		_getRemovalFallback() {
			return this._input ?? super._getRemovalFallback();
		}
		_handleChipRemoved(event) {
			if (this._removingByCode) {
				super._handleChipRemoved(event);
				return;
			}
			this._validation.runAsUser(() => super._handleChipRemoved(event));
		}
		_noteChange() {
			super._noteChange();
			this._validation.change();
		}
		_triggerChange() {
			const isChanged = this._valueField ? (0, js_src_util_form_validation_js.writeValueField)(this._valueField, this.getValues()) : false;
			this._validation.update();
			super._triggerChange();
			if (isChanged) (0, js_src_util_form_validation_js.dispatchValueChange)(this._valueField);
		}
		_restoreChips() {
			const values = this.getValues().join(",");
			let hadFocus = false;
			for (const chip of this._getChipElements()) if (!this._initialChips.includes(chip)) {
				hadFocus ||= (0, js_src_util_focus_js.containsFocus)(chip);
				js_src_chip_js.default.getInstance(chip)?.dispose();
				this._ownedChips.delete(chip);
				chip.remove();
			}
			let anchor = this._input;
			for (const chip of this._initialChips.toReversed()) {
				if (!this._element.contains(chip)) {
					this._element.insertBefore(chip, anchor);
					this._setupChip(chip);
				}
				anchor = chip;
			}
			this._chips = this._initialChips.map((chip) => this._getChipValue(chip));
			this._setInputSize();
			if (hadFocus) this._input.focus();
			if (this.getValues().join(",") !== values || this._valueField.value !== this.getValues().join(",")) this._triggerChange();
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
				if (event.key?.length === 1) this._input.focus();
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
			input.type = "text";
			input.className = CLASS_NAME_CHIP_INPUT_FIELD;
			input.id = generatedInputId;
			if (this._config.placeholder) input.placeholder = this._config.placeholder;
			if (label && !labelFor) {
				label.setAttribute("for", generatedInputId);
				this._labelledFor = label;
			}
			this._input = input;
			this._setInputSize();
			this._element.append(input);
		}
		_createValueField() {
			const field = (0, js_src_util_form_validation_js.createValueField)("textarea", () => this._input);
			field.id = this._uniqueId;
			(0, js_src_util_form_validation_js.configureValueField)(field, {
				disabled: this._disabled,
				name: this._config.name,
				readOnly: this._config.readonly,
				required: this._config.required
			});
			field.defaultValue = this.getValues().join(",");
			this._element.append(field);
			this._valueField = field;
		}
		_createChipFromInput() {
			if (!this._canModify() || !this._config.create) return;
			const value = this._input.value.trim();
			if (value) {
				this._validation.runAsUser(() => this.add(value));
				this._input.value = "";
				this._setInputSize();
			}
		}
		_applyInteractionState() {
			const { readonly } = this._config;
			this._element.classList.toggle(CLASS_NAME_DISABLED, this._disabled);
			this._input.disabled = this._disabled;
			this._input.readOnly = !this._disabled && readonly;
			(0, js_src_util_index_js.writeAttribute)(this._input, "aria-required", this._config.create && this._config.required ? "true" : null);
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
			const parts = this._config.create ? (0, js_src_util_chip_values_js.splitChipText)(event.target.value, this._config.separator) : null;
			if (parts) {
				const rest = parts.pop();
				this._validation.runAsUser(() => {
					for (const part of parts) this.add(part);
				});
				this._input.value = rest;
			}
			this._setInputSize();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_INPUT, {
				value: this._input.value,
				relatedTarget: this._input
			});
		}
		_handlePaste(event) {
			if (!this._canModify()) return;
			if (!this._config.create || !this._config.separator) return;
			const parts = (0, js_src_util_chip_values_js.splitChipText)((event.clipboardData || window.clipboardData).getData("text"), this._config.separator);
			if (parts) {
				event.preventDefault();
				this._validation.runAsUser(() => {
					for (const part of parts) this.add(part);
				});
			}
		}
		_setInputSize() {
			if (!this._input) return;
			this._input.size = Math.max(this._input.placeholder.length, this._input.value.length) || 1;
		}
	};
	js_src_dom_event_handler_js.default.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_CHIP_INPUT)) ChipInput.getOrCreateInstance(element);
	});
	//#endregion
	return ChipInput;
});

//# sourceMappingURL=chip-input.js.map
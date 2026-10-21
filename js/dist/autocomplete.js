/*!
* CoreUI PRO autocomplete.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./combobox-base.js"), require("./dom/data.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/field-validation.js"), require("./util/form-control-group.js"), require("./util/form-validation.js"), require("./util/sanitizer.js"), require("./util/icons.js"), require("./util/list-navigation.js"), require("./util/option-tree.js"), require("./util/selection-state.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./combobox-base.js",
		"./dom/data.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/field-validation.js",
		"./util/form-control-group.js",
		"./util/form-validation.js",
		"./util/sanitizer.js",
		"./util/icons.js",
		"./util/list-navigation.js",
		"./util/option-tree.js",
		"./util/selection-state.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Autocomplete = factory(global.ComboboxBase, global.Data, global.EventHandler, global.SelectorEngine, global.FieldValidation, global.FormControlGroup, global.FormValidation, global.Sanitizer, global.Icons, global.ListNavigation, global.OptionTree, global.SelectionState, global.Index));
})(this, function(js_src_combobox_base_js, js_src_dom_data_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_field_validation_js, js_src_util_form_control_group_js, js_src_util_form_validation_js, js_src_util_sanitizer_js, js_src_util_icons_js, js_src_util_list_navigation_js, js_src_util_option_tree_js, js_src_util_selection_state_js, js_src_util_index_js) {
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
	js_src_combobox_base_js = __toESM(js_src_combobox_base_js);
	js_src_dom_data_js = __toESM(js_src_dom_data_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	js_src_util_field_validation_js = __toESM(js_src_util_field_validation_js);
	//#region js/src/autocomplete.ts
	const NAME = "autocomplete";
	const DATA_KEY = "coreui.autocomplete";
	const EVENT_KEY = `.${DATA_KEY}`;
	const DATA_API_KEY = ".data-api";
	const ARROW_DOWN_KEY = "ArrowDown";
	const BACKSPACE_KEY = "Backspace";
	const DELETE_KEY = "Delete";
	const ENTER_KEY = "Enter";
	const ESCAPE_KEY = "Escape";
	const TAB_KEY = "Tab";
	const RIGHT_MOUSE_BUTTON = 2;
	const EVENT_BLUR = `blur${EVENT_KEY}`;
	const EVENT_CHANGE = `change${EVENT_KEY}`;
	const EVENT_CLICK = `click${EVENT_KEY}`;
	const EVENT_INPUT = `input${EVENT_KEY}`;
	const EVENT_KEYDOWN = `keydown${EVENT_KEY}`;
	const EVENT_KEYUP = `keyup${EVENT_KEY}`;
	const EVENT_MOUSEDOWN = `mousedown${EVENT_KEY}`;
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const CLASS_NAME_AUTOCOMPLETE = "autocomplete";
	const CLASS_NAME_CLEANER = "form-control-cleaner";
	const CLASS_NAME_DISABLED = "disabled";
	const CLASS_NAME_INDICATOR = "form-control-action";
	const CLASS_NAME_INPUT = "form-control";
	const CLASS_NAME_INPUT_HINT = "autocomplete-input-hint";
	const CLASS_NAME_INPUT_GROUP = "form-control-group";
	const CLASS_NAME_SHOW = "show";
	const HOST_FIELD_ATTRIBUTES = /* @__PURE__ */ new Set([
		"aria-description",
		"aria-details",
		"aria-errormessage",
		"aria-label",
		"aria-labelledby",
		"aria-placeholder",
		"aria-readonly",
		"aria-required"
	]);
	const SELECTOR_DATA_AUTOCOMPLETE = "[data-coreui-autocomplete]";
	const SELECTOR_DATA_TOGGLE_SHOWN = `.autocomplete.${CLASS_NAME_SHOW}`;
	const SELECTOR_INDICATOR = ".form-control-action";
	const Default = {
		allowList: js_src_util_sanitizer_js.DefaultAllowlist,
		allowOnlyDefinedOptions: false,
		ariaCleanerLabel: "Clear selection",
		ariaPickerLabel: "Toggle options list",
		cleaner: false,
		clearSearchOnSelect: true,
		container: false,
		disabled: false,
		globalSearch: true,
		highlightOptionsOnSearch: false,
		id: null,
		invalid: false,
		name: null,
		options: [],
		optionsGroupsTemplate: null,
		optionsMaxHeight: "auto",
		optionsTemplate: null,
		pickerIcon: false,
		placeholder: null,
		required: false,
		sanitize: true,
		sanitizeFn: null,
		search: null,
		searchNoResultsLabel: false,
		showHints: false,
		valid: false,
		validationState: null,
		value: null
	};
	const DefaultType = {
		allowList: "object",
		allowOnlyDefinedOptions: "boolean",
		ariaCleanerLabel: "string",
		ariaPickerLabel: "string",
		cleaner: "boolean",
		clearSearchOnSelect: "boolean",
		container: "(string|element|boolean)",
		disabled: "boolean",
		globalSearch: "boolean",
		highlightOptionsOnSearch: "boolean",
		id: "(string|null)",
		invalid: "boolean",
		name: "(string|null)",
		options: "(array|null)",
		optionsGroupsTemplate: "(function|null)",
		optionsMaxHeight: "(number|string)",
		optionsTemplate: "(function|null)",
		pickerIcon: "(string|boolean)",
		placeholder: "(string|null)",
		required: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		search: "(string|null)",
		searchNoResultsLabel: "boolean|string",
		showHints: "boolean",
		valid: "boolean",
		validationState: "(string|null|undefined)",
		value: "(number|string|null)"
	};
	var Autocomplete = class Autocomplete extends js_src_combobox_base_js.default {
		constructor(element, config) {
			super(element, config);
			this._uniqueId = this._config.id ?? (0, js_src_util_index_js.getUID)(`${this.constructor.NAME}`);
			this._cleanerElement = null;
			this._indicatorElement = null;
			this._inputElement = null;
			this._inputHintElement = null;
			this._togglerElement = null;
			this._keySerial = null;
			this._shownText = "";
			this._validation = new js_src_util_field_validation_js.default(this._element, {
				aliases: true,
				canBlock: () => !this._disabled,
				config: () => this._config,
				fields: () => [this._inputElement],
				frames: () => [this._element],
				invalidTargets: () => [this._inputElement],
				restore: () => this._restoreInitialSelection()
			});
			this._optionsElement = null;
			this._menu = null;
			this._known = /* @__PURE__ */ new Map();
			this._store = (0, js_src_util_selection_state_js.createSelectionStore)((next) => next.slice(-1));
			this._disabled = this._config.disabled;
			this._givenValue = this._config.value;
			this._options = this._getOptionsFromConfig(this._config.options);
			this._floatingCleanup = null;
			this._anchoredPosition = null;
			this._search = "";
			this._seenOptionValues = /* @__PURE__ */ new Set();
			this._valueApplied = false;
			this._initialValue = this._config.value;
			this._reportSeed = false;
			this._createAutocomplete();
			this._validation.refresh();
			this._addEventListeners();
			js_src_dom_data_js.default.set(this._element, DATA_KEY, this);
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
		_canShow() {
			return Boolean(this._config.searchNoResultsLabel) || (this._isExternalSearch() ? this._options : (0, js_src_util_option_tree_js.filterOptionTree)(this._options, this._search)).length > 0;
		}
		_getAriaExpandedTarget() {
			return this._inputElement;
		}
		_onHideEnd() {
			if (this._inputHintElement) this._inputHintElement.value = "";
		}
		_escapeFocusTarget() {
			return this._inputElement;
		}
		dispose() {
			if (!this._element) return;
			this._validation.dispose();
			this._disposeFloating();
			this._disposeListBox();
			for (const element of [
				this._menu,
				this._optionsElement,
				this._inputHintElement,
				this._inputElement,
				this._cleanerElement,
				this._indicatorElement
			]) if (element) {
				js_src_dom_event_handler_js.default.off(element, EVENT_KEY);
				element.remove();
			}
			this._element.classList.remove(CLASS_NAME_SHOW);
			for (const [name, value] of this._hostAria) if (!this._element.hasAttribute(name)) this._element.setAttribute(name, value);
			super.dispose();
		}
		clear() {
			const isChanged = this._store.size() > 0 || this._shownText !== "";
			this._valueApplied = true;
			this._clearSelection();
			this.search("");
			this._filterOptionsList();
			this._setText("");
			this._validation.update();
			if (isChanged) this._triggerChangeEvent(null);
		}
		search(label) {
			this._search = label.length > 0 ? label.toLowerCase() : "";
			if (!this._isExternalSearch()) this._filterOptionsList();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_INPUT, { value: label });
		}
		disable() {
			this._setDisabled(true);
		}
		enable() {
			this._setDisabled(false);
		}
		setOptions(options) {
			const normalized = this._normalizeOptions(options);
			this._typeCheckConfig({ options: normalized }, { options: DefaultType.options });
			this._options = this._getOptionsFromConfig(normalized);
			this._setListBoxItems();
			this._seedSelection();
			this._validation.update();
		}
		setValidationState(validationState) {
			const state = {
				invalid: false,
				valid: false,
				validationState
			};
			this._config = this._getConfig({
				...this._config,
				...state
			});
			this._validation.configure(state);
		}
		setValue(value) {
			this._typeCheckConfig({ value }, { value: DefaultType.value });
			this._givenValue = value;
			this._valueApplied = false;
			this._reportSeed = false;
			this._clearSelection();
			this._setText("");
			this._seedSelection();
			this._validation.update();
		}
		deselectAll(options = this._selectedOptions()) {
			if (this._store.size() === 0) return;
			for (const option of options) {
				if (option.disabled) continue;
				if ((0, js_src_util_option_tree_js.isOptionGroup)(option)) {
					this.deselectAll(option.options);
					continue;
				}
				this._deselectOption(option.value);
				this._updateCleaner();
			}
		}
		_triggerChangeEvent(value) {
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value });
		}
		_isExternalSearch() {
			return this._config.search === "external";
		}
		_isDisabled() {
			return this._disabled;
		}
		_setDisabled(disabled) {
			if (disabled === this._disabled) return;
			this._disabled = disabled;
			if (disabled) this.hide();
			this._applyState();
			this._validation.update();
		}
		_addEventListeners() {
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK, (event) => {
				if (!this._disabled && !event.target.closest(SELECTOR_INDICATOR)) {
					this.show();
					this._inputElement.focus();
				}
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, (event) => {
				this._keySerial = (0, js_src_util_form_validation_js.nextStateSerial)();
				if (event.key === ESCAPE_KEY) {
					if (this._isShown()) {
						event.preventDefault();
						event.stopPropagation();
					}
					this.hide();
					if (this._config.allowOnlyDefinedOptions && this._store.size() === 0) {
						this._emptyByUser();
						this.search("");
					}
					return;
				}
				if (this._config.globalSearch && !event.defaultPrevented && (0, js_src_util_list_navigation_js.isTypingKey)(event)) this._inputElement.focus();
				if (event.target === this._inputElement && (event.key === BACKSPACE_KEY || event.key === DELETE_KEY) && this._store.size() > 0) {
					this._validation.dismiss(this._keySerial);
					this._clearSelection();
					this._validation.update();
					this._triggerChangeEvent(null);
				}
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYUP, () => {
				this._keySerial = null;
			});
			js_src_dom_event_handler_js.default.on(this._menu, EVENT_KEYDOWN, (event) => {
				if (this._config.globalSearch && !event.defaultPrevented && (0, js_src_util_list_navigation_js.isTypingKey)(event)) this._inputElement.focus();
			});
			this._addTogglerKeydownListeners();
			js_src_dom_event_handler_js.default.on(this._indicatorElement, EVENT_CLICK, (event) => {
				event.preventDefault();
				this.toggle();
			});
			js_src_dom_event_handler_js.default.on(this._inputElement, EVENT_BLUR, () => {
				const inputValue = this._inputElement.value;
				if (this._disabled || inputValue.length === 0) return;
				if (this._namesSelection(inputValue)) {
					this.hide();
					return;
				}
				const inputValueLower = inputValue.trim().toLowerCase();
				const exactMatches = (0, js_src_util_option_tree_js.getSelectableOptions)(this._options).filter((option) => option.label.trim().toLowerCase() === inputValueLower);
				if (exactMatches.length === 1) {
					this._selectOption(exactMatches[0]);
					return;
				}
				if (this._config.allowOnlyDefinedOptions) {
					this._clearByUser();
					return;
				}
				this._triggerChangeEvent(inputValue);
			});
			js_src_dom_event_handler_js.default.on(this._inputElement, EVENT_KEYDOWN, (event) => {
				const handledByList = event.key === ENTER_KEY && event.defaultPrevented;
				if (!handledByList && !this._isShown() && event.key !== TAB_KEY && event.key !== ESCAPE_KEY && event.key !== ENTER_KEY) this.show();
				if (handledByList) return;
				if (event.key === TAB_KEY && this._inputHintElement?.value) {
					event.preventDefault();
					event.stopPropagation();
					const option = this._findHintOption(this._inputElement.value);
					if (option) this._selectOption(option);
				}
				if (event.key === ENTER_KEY) this._handleEnterKey(event);
			});
			js_src_dom_event_handler_js.default.on(this._inputElement, EVENT_INPUT, () => {
				const { value } = this._inputElement;
				if (value !== this._shownText) this._validation.dismiss(this._keySerial ?? Number.POSITIVE_INFINITY);
				this._shownText = value;
				this._valueApplied = true;
				this._validation.update();
				if (this._store.size() > 0) {
					this._clearSelection();
					this._triggerChangeEvent(null);
				}
				this.search(value);
				if (this._inputHintElement) {
					const option = value.trim() ? this._findHintOption(value) : void 0;
					this._inputHintElement.value = option ? `${value}${option.label.slice(value.trimStart().length)}` : "";
				}
				if (value && !this._isShown()) this.show();
			});
			js_src_dom_event_handler_js.default.on(this._optionsElement, EVENT_MOUSEDOWN, (event) => {
				event.preventDefault();
			});
			js_src_dom_event_handler_js.default.on(this._cleanerElement, EVENT_CLICK, (event) => {
				if (!this._disabled) {
					event.preventDefault();
					event.stopPropagation();
					this._clearByUser();
				}
			});
			js_src_dom_event_handler_js.default.on(this._cleanerElement, EVENT_KEYDOWN, (event) => {
				if (!this._disabled && event.key === ENTER_KEY) {
					event.preventDefault();
					event.stopPropagation();
					this._clearByUser();
				}
			});
		}
		_handleEnterKey(event) {
			if (event.isComposing || event.keyCode === 229) return;
			if (this._isShown()) {
				event.preventDefault();
				event.stopPropagation();
			}
			if (this._inputElement.value.length === 0) return;
			if (this._namesSelection(this._inputElement.value)) {
				this.hide();
				return;
			}
			const options = (0, js_src_util_option_tree_js.getSelectableOptions)(this._options).filter((option) => option.label.trim().toLowerCase() === this._inputElement.value.trim().toLowerCase());
			if (options.length > 0) {
				if (this._store.has(String(options[0].value))) this.hide();
				else this._selectOption(options[0]);
				return;
			}
			if (this._config.allowOnlyDefinedOptions) {
				event.preventDefault();
				return;
			}
			this._triggerChangeEvent(this._inputElement.value);
			this.hide();
			if (this._config.clearSearchOnSelect) this.search("");
		}
		_syncInputName() {
			if (this._config.name) {
				this._inputElement.setAttribute("name", this._config.name.toString());
				return;
			}
			this._inputElement.removeAttribute("name");
		}
		_getOptionsFromConfig(options, disabled = false) {
			if (!options || !Array.isArray(options)) return [];
			const _options = [];
			for (const option of options) {
				if ((0, js_src_util_option_tree_js.isOptionGroup)(option)) {
					const customGroupProperties = { ...option };
					delete customGroupProperties.label;
					delete customGroupProperties.options;
					_options.push({
						...customGroupProperties,
						label: option.label,
						options: this._getOptionsFromConfig(option.options, disabled || option.disabled)
					});
					continue;
				}
				const label = typeof option === "string" ? option : option.label;
				const value = option.value ?? (typeof option === "string" ? option : option.label);
				const customProperties = typeof option === "object" ? { ...option } : {};
				delete customProperties.label;
				delete customProperties.value;
				delete customProperties.selected;
				delete customProperties.disabled;
				_options.push({
					...customProperties,
					label,
					value: String(value),
					...option.selected && { selected: true },
					...(disabled || option.disabled) && { disabled: true }
				});
			}
			return _options;
		}
		_createAutocomplete() {
			this._element.classList.add(CLASS_NAME_AUTOCOMPLETE);
			this._createInputGroup();
			this._createButtons();
			this._createOptionsContainer();
			this._seedSelection();
			this._applyState();
		}
		_applyState() {
			const { required } = this._config;
			const disabled = this._disabled;
			this._element.classList.toggle(CLASS_NAME_DISABLED, disabled);
			this._inputElement.disabled = disabled;
			this._inputElement.required = required;
			(0, js_src_util_index_js.writeAttribute)(this._inputElement, "tabindex", disabled ? "-1" : null);
			if (this._indicatorElement) this._indicatorElement.disabled = disabled;
			this._updateCleaner();
		}
		_createInputGroup() {
			const togglerEl = this._element;
			this._hostAria = [...togglerEl.attributes].filter(({ name }) => HOST_FIELD_ATTRIBUTES.has(name)).map(({ name, value }) => [name, value]);
			togglerEl.removeAttribute("tabindex");
			(0, js_src_util_form_control_group_js.applyControlGroupClasses)(togglerEl, CLASS_NAME_INPUT_GROUP);
			this._togglerElement = togglerEl;
			if (this._config.showHints) {
				const inputHintEl = document.createElement("input");
				inputHintEl.classList.add(CLASS_NAME_INPUT, CLASS_NAME_INPUT_HINT);
				inputHintEl.autocomplete = "off";
				inputHintEl.readOnly = true;
				inputHintEl.tabIndex = -1;
				inputHintEl.setAttribute("aria-hidden", true);
				inputHintEl.setAttribute("form", "");
				togglerEl.append(inputHintEl);
				this._inputHintElement = inputHintEl;
			}
			const inputEl = document.createElement("input");
			inputEl.classList.add(CLASS_NAME_INPUT);
			inputEl.id = this._uniqueId;
			inputEl.autocomplete = "off";
			inputEl.placeholder = this._config.placeholder ?? "";
			inputEl.role = "combobox";
			for (const [name, value] of this._hostAria) {
				inputEl.setAttribute(name, value);
				togglerEl.removeAttribute(name);
			}
			inputEl.setAttribute("aria-autocomplete", "list");
			inputEl.setAttribute("aria-expanded", "false");
			inputEl.setAttribute("aria-haspopup", "listbox");
			togglerEl.append(inputEl);
			this._inputElement = inputEl;
			this._syncInputName();
		}
		_createButtons() {
			if (!this._config.cleaner && !this._config.pickerIcon) return;
			const buttons = this._togglerElement;
			if (this._config.cleaner) {
				const cleaner = document.createElement("button");
				cleaner.type = "button";
				cleaner.classList.add(CLASS_NAME_CLEANER);
				cleaner.style.display = "none";
				cleaner.setAttribute("aria-label", this._config.ariaCleanerLabel);
				cleaner.innerHTML = js_src_util_icons_js.CLEANER_ICON;
				buttons.append(cleaner);
				this._cleanerElement = cleaner;
			}
			if (this._config.pickerIcon) {
				const indicator = document.createElement("button");
				indicator.type = "button";
				indicator.classList.add(CLASS_NAME_INDICATOR);
				indicator.setAttribute("aria-label", this._config.ariaPickerLabel);
				indicator.innerHTML = (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config.pickerIcon === true ? js_src_util_icons_js.PICKER_ICON : this._config.pickerIcon, {
					...this._config,
					allowList: js_src_util_sanitizer_js.SVGAllowlist
				});
				buttons.append(indicator);
				this._indicatorElement = indicator;
			}
			this._updateCleaner();
		}
		_decorateListbox(optionsDiv) {
			optionsDiv.setAttribute("aria-labelledby", this._uniqueId);
		}
		_getActiveDescendantField() {
			return this._inputElement;
		}
		_onOptionSelected(value) {
			const foundOption = this._findOptionByValue(value);
			if (foundOption && !this._disabled) {
				this._selectOption(foundOption);
				this._inputElement.focus();
			}
		}
		_selectOption(option) {
			if (option.disabled) return;
			this._valueApplied = true;
			if (this._inputElement.value !== option.label) this._validation.dismiss();
			this._applySelection(option);
			this._validation.update();
			this._triggerChangeEvent(option);
			if (this._inputHintElement) this._inputHintElement.value = "";
			this.hide();
			if (this._config.clearSearchOnSelect) this.search("");
		}
		_applySelection(option) {
			this._known.set(String(option.value), option);
			this._commitSelection([String(option.value)]);
			this._setText(option.label);
			this._updateCleaner();
		}
		_clearSelection() {
			this._commitSelection([]);
			this._updateCleaner();
		}
		_deselectOption(value) {
			this._commitSelection(this._store.values().filter((selected) => selected !== String(value)));
		}
		_selectedOptions() {
			return this._store.values().map((value) => this._known.get(value) ?? this._findOptionByValue(value)).filter(Boolean);
		}
		_findHintOption(text) {
			return (0, js_src_util_option_tree_js.getSelectableOptions)(this._options).find((option) => option.label.toLowerCase().startsWith(text.trimStart().toLowerCase()));
		}
		_namesSelection(text) {
			return this._selectedOptions().some((option) => option.label.trim() === text.trim());
		}
		_clearByUser() {
			if (this._store.size() > 0 || this._inputElement.value !== "") this._validation.dismiss();
			this.clear();
		}
		_emptyByUser() {
			if (this._inputElement.value !== "") this._validation.dismiss();
			this._setText("");
			this._validation.update();
		}
		_setText(text) {
			this._inputElement.value = text;
			this._shownText = text;
		}
		_updateCleaner() {
			if (!this._cleanerElement) return;
			if (this._store.size() > 0 && !this._disabled) {
				this._cleanerElement.style.removeProperty("display");
				return;
			}
			this._cleanerElement.style.display = "none";
		}
		_isOpenKey(event) {
			return event.key === ARROW_DOWN_KEY || event.key === ENTER_KEY && event.target === this._togglerElement;
		}
		_restoreInitialSelection() {
			const previous = this._selectedOptions()[0]?.value;
			const text = this._shownText;
			this._reportSeed = false;
			this._clearSelection();
			this._setText("");
			if (this._inputHintElement) this._inputHintElement.value = "";
			if (this._search !== "") this.search("");
			this._givenValue = this._initialValue;
			this._valueApplied = false;
			this._seenOptionValues.clear();
			this._seedSelection();
			this._validation.update();
			const current = this._selectedOptions()[0];
			if (current ? current.value !== previous : previous !== void 0 || text !== "") this._triggerChangeEvent(current ?? null);
			this._reportSeed = !current;
		}
		_seedSelection() {
			const options = (0, js_src_util_option_tree_js.flattenOptions)(this._options);
			const value = this._givenValue;
			let seed;
			if (value === null || value === void 0 || value === "") seed = options.find((option) => option.selected && !this._seenOptionValues.has(option.value));
			else if (!this._valueApplied) {
				seed = (0, js_src_util_option_tree_js.findOptionByValue)(options, value);
				this._valueApplied = Boolean(seed);
			}
			for (const option of options) this._seenOptionValues.add(option.value);
			if (seed && !this._store.has(String(seed.value))) {
				this._applySelection(seed);
				if (this._reportSeed && this._store.has(String(seed.value))) {
					this._reportSeed = false;
					this._validation.update();
					this._triggerChangeEvent(seed);
				}
			}
		}
		_afterOptionsRendered() {
			if (!this._config.highlightOptionsOnSearch || this._config.optionsTemplate) return;
			for (const option of this._getDisplayedOptions()) option.innerHTML = (0, js_src_util_option_tree_js.highlightMatches)(option.textContent, this._search);
		}
		_afterFilter(visibleOptions) {
			if (visibleOptions === 0 && !this._config.searchNoResultsLabel) this.hide();
		}
		_normalizeOptions(options) {
			return typeof options === "string" ? options.split(/,\s*/).map(String) : options;
		}
		_configAfterMerge(config) {
			config = this._normalizeContainerConfig(config);
			config.options = this._normalizeOptions(config.options);
			if (config.searchNoResultsLabel === true) config.searchNoResultsLabel = "No results found";
			return config;
		}
		static autocompleteInterface(element, config, ...args) {
			const data = Autocomplete.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Autocomplete, config, args);
		}
		static clearMenus(event) {
			if (event.button === RIGHT_MOUSE_BUTTON || event.type === "keyup" && event.key !== TAB_KEY) return;
			const openToggles = js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_TOGGLE_SHOWN);
			for (const toggle of openToggles) {
				const context = Autocomplete.getInstance(toggle);
				if (!context) continue;
				const composedPath = event.composedPath();
				if (composedPath.includes(context._element) || composedPath.includes(context._menu)) continue;
				context.hide();
				if (context._config.allowOnlyDefinedOptions && context._store.size() === 0) context._emptyByUser();
				context.search("");
			}
		}
	};
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const autocomplete of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_AUTOCOMPLETE)) Autocomplete.autocompleteInterface(autocomplete);
	});
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, Autocomplete.clearMenus);
	js_src_dom_event_handler_js.default.on(document, EVENT_KEYUP_DATA_API, Autocomplete.clearMenus);
	(0, js_src_util_index_js.defineJQueryPlugin)(Autocomplete);
	//#endregion
	return Autocomplete;
});

//# sourceMappingURL=autocomplete.js.map
/*!
* CoreUI PRO autocomplete.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./combobox-base.js"), require("./dom/data.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/form-control-group.js"), require("./util/sanitizer.js"), require("./util/icons.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./combobox-base.js",
		"./dom/data.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/form-control-group.js",
		"./util/sanitizer.js",
		"./util/icons.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Autocomplete = factory(global.ComboboxBase, global.Data, global.EventHandler, global.SelectorEngine, global.FormControlGroup, global.Sanitizer, global.Icons, global.Index));
})(this, function(js_src_combobox_base_js, js_src_dom_data_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_form_control_group_js, js_src_util_sanitizer_js, js_src_util_icons_js, js_src_util_index_js) {
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
	//#region js/src/autocomplete.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO autocomplete.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* ------------------------------------------------------------------------
	* Constants
	* ------------------------------------------------------------------------
	*/
	const NAME = "autocomplete";
	const DATA_KEY = "coreui.autocomplete";
	const EVENT_KEY = `.${DATA_KEY}`;
	const DATA_API_KEY = ".data-api";
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
	const CLASS_NAME_IS_INVALID = "is-invalid";
	const CLASS_NAME_IS_VALID = "is-valid";
	const CLASS_NAME_SHOW = "show";
	const SELECTOR_DATA_AUTOCOMPLETE = "[data-coreui-autocomplete]:not(.disabled)";
	const SELECTOR_DATA_TOGGLE_SHOWN = `.autocomplete:not(.disabled).${CLASS_NAME_SHOW}`;
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
		search: "(array|string|null)",
		searchNoResultsLabel: "boolean|string",
		showHints: "boolean",
		valid: "boolean",
		value: "(number|string|null)"
	};
	/**
	* ------------------------------------------------------------------------
	* Class Definition
	* ------------------------------------------------------------------------
	*/
	var Autocomplete = class Autocomplete extends js_src_combobox_base_js.default {
		constructor(element, config) {
			super(element, config);
			this._uniqueId = this._config.id ?? (0, js_src_util_index_js.getUID)(`${this.constructor.NAME}`);
			this._indicatorElement = null;
			this._inputElement = null;
			this._inputHintElement = null;
			this._togglerElement = null;
			this._addedClassNames = [];
			this._previousTabIndex = null;
			this._optionsElement = null;
			this._menu = null;
			this._selected = [];
			this._options = this._getOptionsFromConfig();
			this._floatingCleanup = null;
			this._anchoredPosition = null;
			this._search = "";
			this._createAutocomplete();
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
			return Boolean(this._config.searchNoResultsLabel) || this._flattenOptions().some((option) => option.label.toLowerCase().includes(this._search.toLowerCase()));
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
			this._element.classList.remove(CLASS_NAME_IS_INVALID, CLASS_NAME_IS_VALID, CLASS_NAME_SHOW, ...this._addedClassNames);
			if (this._previousTabIndex === null) this._element.removeAttribute("tabindex");
			else this._element.setAttribute("tabindex", this._previousTabIndex);
			super.dispose();
		}
		clear() {
			this.deselectAll();
			this.search("");
			this._filterOptionsList();
			this._inputElement.value = "";
			this._triggerChangeEvent(null);
		}
		search(label) {
			this._search = label.length > 0 ? label.toLowerCase() : "";
			if (!this._isExternalSearch()) this._filterOptionsList();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_INPUT, { value: label });
		}
		setConfig(config) {
			if (config?.value) this.deselectAll();
			this._config = this._getConfig({
				...this._config,
				...config
			});
			this._options = this._getOptionsFromConfig();
			this._setListBoxItems();
			this._syncInputName();
		}
		deselectAll(options = this._selected) {
			if (this._selected.length === 0) return;
			for (const option of options) {
				if (option.disabled) continue;
				if (Array.isArray(option.options)) {
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
		_highlightOption(label) {
			if (!this._search) return (0, js_src_util_sanitizer_js.escapeHtml)(label);
			const escapedSearch = this._search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const regex = new RegExp(`(${escapedSearch})`, "gi");
			return String(label).split(regex).map((part, index) => index % 2 === 0 ? (0, js_src_util_sanitizer_js.escapeHtml)(part) : `<strong>${(0, js_src_util_sanitizer_js.escapeHtml)(part)}</strong>`).join("");
		}
		_isExternalSearch() {
			return Array.isArray(this._config.search) && this._config.search.includes("external");
		}
		_isGlobalSearch() {
			return Array.isArray(this._config.search) && this._config.search.includes("global");
		}
		_addEventListeners() {
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK, (event) => {
				if (!this._config.disabled && !event.target.closest(SELECTOR_INDICATOR)) this.show();
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, (event) => {
				if (event.key === ESCAPE_KEY) {
					if (this._isShown()) {
						event.preventDefault();
						event.stopPropagation();
					}
					this.hide();
					if (this._config.allowOnlyDefinedOptions && this._selected.length === 0) {
						this.search("");
						this._inputElement.value = "";
					}
					return;
				}
				if (this._isGlobalSearch() && (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY)) this._inputElement.focus();
			});
			js_src_dom_event_handler_js.default.on(this._menu, EVENT_KEYDOWN, (event) => {
				if (this._isGlobalSearch() && (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY)) this._inputElement.focus();
			});
			this._addTogglerKeydownListeners();
			js_src_dom_event_handler_js.default.on(this._indicatorElement, EVENT_CLICK, (event) => {
				event.preventDefault();
				this.toggle();
			});
			js_src_dom_event_handler_js.default.on(this._inputElement, EVENT_BLUR, () => {
				const inputValue = this._inputElement.value;
				if (inputValue.length === 0) return;
				const inputValueLower = inputValue.toLowerCase();
				const exactMatches = this._flattenOptions().filter((option) => option.label.toLowerCase() === inputValueLower);
				if (exactMatches.length === 1) {
					this._selectOption(exactMatches[0]);
					return;
				}
				if (this._config.allowOnlyDefinedOptions) {
					this.clear();
					return;
				}
				this._triggerChangeEvent(inputValue);
			});
			js_src_dom_event_handler_js.default.on(this._inputElement, EVENT_KEYDOWN, (event) => {
				const handledByList = event.key === ENTER_KEY && event.defaultPrevented;
				if (!handledByList && !this._isShown() && event.key !== TAB_KEY && event.key !== ESCAPE_KEY) this.show();
				if (handledByList) return;
				if (event.key === TAB_KEY && this._config.showHints && this._inputElement.value.length > 0) {
					if (this._inputHintElement.value) {
						event.preventDefault();
						event.stopPropagation();
					}
					const options = this._flattenOptions().filter((option) => option.label.toLowerCase().startsWith(this._inputElement.value.toLowerCase()));
					if (options.length > 0) this._selectOption(options[0]);
				}
				if (event.key === ENTER_KEY) {
					event.preventDefault();
					event.stopPropagation();
					if (this._inputElement.value.length === 0) return;
					const options = this._flattenOptions().filter((option) => option.label.toLowerCase() === this._inputElement.value.toLowerCase());
					if (options.length > 0) this._selectOption(options[0]);
					if (options.length === 0 && !this._config.allowOnlyDefinedOptions) {
						this._triggerChangeEvent(this._inputElement.value);
						this.hide();
						if (this._config.clearSearchOnSelect) this.search("");
					}
				}
			});
			js_src_dom_event_handler_js.default.on(this._inputElement, EVENT_KEYUP, (event) => {
				if (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY) {
					const { value } = event.target;
					this.search(value);
					if (this._config.showHints) {
						const options = value ? this._flattenOptions().filter((option) => option.label.toLowerCase().startsWith(value.toLowerCase())) : [];
						this._inputHintElement.value = options.length > 0 ? `${value}${options[0].label.slice(value.length)}` : "";
					}
					if (this._selected.length > 0) {
						this.deselectAll();
						this._triggerChangeEvent(null);
					}
				}
			});
			js_src_dom_event_handler_js.default.on(this._optionsElement, EVENT_MOUSEDOWN, (event) => {
				event.preventDefault();
			});
			js_src_dom_event_handler_js.default.on(this._cleanerElement, EVENT_CLICK, (event) => {
				if (!this._config.disabled) {
					event.preventDefault();
					event.stopPropagation();
					this.clear();
				}
			});
			js_src_dom_event_handler_js.default.on(this._cleanerElement, EVENT_KEYDOWN, (event) => {
				if (!this._config.disabled && event.key === ENTER_KEY) {
					event.preventDefault();
					event.stopPropagation();
					this.clear();
				}
			});
		}
		_syncInputName() {
			if (this._config.name) {
				this._inputElement.setAttribute("name", this._config.name.toString());
				return;
			}
			this._inputElement.removeAttribute("name");
		}
		_getOptionsFromConfig(options = this._config.options) {
			if (!options || !Array.isArray(options)) return [];
			const _options = [];
			for (const option of options) {
				if (option.options && Array.isArray(option.options)) {
					const customGroupProperties = { ...option };
					delete customGroupProperties.label;
					delete customGroupProperties.options;
					_options.push({
						...customGroupProperties,
						label: option.label,
						options: this._getOptionsFromConfig(option.options)
					});
					continue;
				}
				const label = typeof option === "string" ? option : option.label;
				const value = option.value ?? (typeof option === "string" ? option : option.label);
				const isSelected = option.selected || this._config.value && this._config.value === value;
				const customProperties = typeof option === "object" ? { ...option } : {};
				delete customProperties.label;
				delete customProperties.value;
				delete customProperties.selected;
				delete customProperties.disabled;
				_options.push({
					...customProperties,
					label,
					value: String(value),
					...isSelected && { selected: true },
					...option.disabled && { disabled: true }
				});
				if (isSelected) this._selected.push({
					label: option.label,
					value: String(value)
				});
			}
			return _options;
		}
		_addClassName(className) {
			if (this._element.classList.contains(className)) return;
			this._element.classList.add(className);
			this._addedClassNames.push(className);
		}
		_createAutocomplete() {
			this._addClassName(CLASS_NAME_AUTOCOMPLETE);
			this._element.classList.toggle(CLASS_NAME_IS_INVALID, this._config.invalid);
			this._element.classList.toggle(CLASS_NAME_IS_VALID, this._config.valid);
			if (this._config.disabled) this._addClassName(CLASS_NAME_DISABLED);
			this._createInputGroup();
			this._createButtons();
			this._createOptionsContainer();
			this._updateOptionsList();
		}
		_createInputGroup() {
			const togglerEl = this._element;
			this._previousTabIndex = togglerEl.getAttribute("tabindex");
			if (!togglerEl.classList.contains(CLASS_NAME_INPUT_GROUP)) this._addedClassNames.push(CLASS_NAME_INPUT_GROUP);
			(0, js_src_util_form_control_group_js.applyControlGroupClasses)(togglerEl, CLASS_NAME_INPUT_GROUP);
			this._togglerElement = togglerEl;
			if (!this._config.search && !this._config.disabled) togglerEl.tabIndex = -1;
			if (!this._config.disabled && this._config.showHints) {
				const inputHintEl = document.createElement("input");
				inputHintEl.classList.add(CLASS_NAME_INPUT, CLASS_NAME_INPUT_HINT);
				inputHintEl.autocomplete = "off";
				inputHintEl.readOnly = true;
				inputHintEl.tabIndex = -1;
				inputHintEl.setAttribute("aria-hidden", true);
				togglerEl.append(inputHintEl);
				this._inputHintElement = inputHintEl;
			}
			const inputEl = document.createElement("input");
			inputEl.classList.add(CLASS_NAME_INPUT);
			inputEl.id = this._uniqueId;
			inputEl.autocomplete = "off";
			inputEl.placeholder = this._config.placeholder ?? "";
			inputEl.role = "combobox";
			inputEl.setAttribute("aria-autocomplete", "list");
			inputEl.setAttribute("aria-expanded", "false");
			inputEl.setAttribute("aria-haspopup", "listbox");
			inputEl.setAttribute("aria-controls", `${this._uniqueId}-listbox`);
			if (this._config.disabled) {
				inputEl.setAttribute("disabled", true);
				inputEl.tabIndex = -1;
			}
			if (this._config.required) inputEl.setAttribute("required", true);
			togglerEl.append(inputEl);
			this._inputElement = inputEl;
			this._syncInputName();
		}
		_createButtons() {
			if (!this._config.cleaner && !this._config.pickerIcon) return;
			const buttons = this._togglerElement;
			if (!this._config.disabled && this._config.cleaner) {
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
				indicator.disabled = this._config.disabled;
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
		_afterMenuCreated() {
			if (this._config.container) this._inputElement.setAttribute("aria-owns", `${this._uniqueId}-listbox`);
		}
		_getActiveDescendantField() {
			return this._inputElement;
		}
		_onOptionSelected(value) {
			const foundOption = this._findOptionByValue(value);
			if (foundOption) {
				this._selectOption(foundOption);
				this._inputElement.focus();
			}
		}
		_selectOption(option) {
			this.deselectAll();
			if (this._selected.filter((selectedOption) => selectedOption.value === option.value).length === 0) this._selected.push(option);
			this._syncOptionElementState(option.value, true);
			this._triggerChangeEvent(option);
			this._inputElement.value = option.label;
			if (this._config.showHints) this._inputHintElement.value = "";
			this.hide();
			if (this._config.clearSearchOnSelect) this.search("");
			this._updateCleaner();
		}
		_deselectOption(value) {
			this._selected = this._selected.filter((option) => option.value !== value);
			this._syncOptionElementState(value, false);
		}
		_updateCleaner() {
			if (!this._config.cleaner || this._cleanerElement === null) return;
			if (this._selected.length > 0) {
				this._cleanerElement.style.removeProperty("display");
				return;
			}
			this._cleanerElement.style.display = "none";
		}
		_updateOptionsList(options = this._options) {
			for (const option of options) {
				if (Array.isArray(option.options)) {
					this._updateOptionsList(option.options);
					continue;
				}
				if (option.selected) this._selectOption(option);
			}
		}
		_afterOptionsRendered() {
			if (!this._config.highlightOptionsOnSearch || this._config.optionsTemplate) return;
			for (const option of this._getDisplayedOptions()) option.innerHTML = this._highlightOption(option.textContent);
		}
		_afterFilter(visibleOptions) {
			if (visibleOptions === 0 && !this._config.searchNoResultsLabel) this.hide();
		}
		_configAfterMerge(config) {
			config = this._normalizeContainerConfig(config);
			if (typeof config.options === "string") config.options = config.options.split(/,\s*/).map(String);
			if (typeof config.search === "string") config.search = config.search.split(/,\s*/).map(String);
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
				const relatedTarget = { relatedTarget: context._element };
				if (event.type === "click") relatedTarget.clickEvent = event;
				context.hide();
				context.search("");
				if (context._config.allowOnlyDefinedOptions && context._selected.length === 0) context._inputElement.value = "";
			}
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const autocomplete of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_AUTOCOMPLETE)) Autocomplete.autocompleteInterface(autocomplete);
	});
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, Autocomplete.clearMenus);
	js_src_dom_event_handler_js.default.on(document, EVENT_KEYUP_DATA_API, Autocomplete.clearMenus);
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Autocomplete);
	//#endregion
	return Autocomplete;
});

//# sourceMappingURL=autocomplete.js.map
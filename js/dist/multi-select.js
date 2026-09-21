/*!
* CoreUI PRO multi-select.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./chip.js"), require("./chip-set.js"), require("./combobox-base.js"), require("./dom/data.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/icons.js"), require("./util/sanitizer.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./chip.js",
		"./chip-set.js",
		"./combobox-base.js",
		"./dom/data.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/icons.js",
		"./util/sanitizer.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.MultiSelect = factory(global.Chip, global.ChipSet, global.ComboboxBase, global.Data, global.EventHandler, global.SelectorEngine, global.Icons, global.Sanitizer, global.Index));
})(this, function(js_src_chip_js, js_src_chip_set_js, js_src_combobox_base_js, js_src_dom_data_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_icons_js, js_src_util_sanitizer_js, js_src_util_index_js) {
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
	js_src_combobox_base_js = __toESM(js_src_combobox_base_js);
	js_src_dom_data_js = __toESM(js_src_dom_data_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	//#region js/src/multi-select.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI PRO multi-select.js
	* License (https://coreui.io/pro/license/)
	* --------------------------------------------------------------------------
	*/
	/**
	* ------------------------------------------------------------------------
	* Constants
	* ------------------------------------------------------------------------
	*/
	const NAME = "multi-select";
	const DATA_KEY = "coreui.multi-select";
	const EVENT_KEY = `.${DATA_KEY}`;
	const DATA_API_KEY = ".data-api";
	const ARROW_DOWN_KEY = "ArrowDown";
	const BACKSPACE_KEY = "Backspace";
	const DELETE_KEY = "Delete";
	const ENTER_KEY = "Enter";
	const ESCAPE_KEY = "Escape";
	const TAB_KEY = "Tab";
	const RIGHT_MOUSE_BUTTON = 2;
	const SELECTOR_CHIP = ".chip";
	const SELECTOR_CLEANER = ".form-control-cleaner";
	const SELECTOR_OPTION = ".list-box-option";
	const SELECTOR_SEARCH = ".form-multi-select-search";
	const SELECTOR_SELECT_ALL = "[data-coreui-select-all]";
	const SELECTOR_DATA_MULTI_SELECT = "[data-coreui-multi-select]";
	const SELECTOR_SELECT = "select.form-multi-select";
	const SELECTOR_SELECTION = ".form-multi-select-selection";
	const EVENT_CHANGE = `change${EVENT_KEY}`;
	const EVENT_CLICK = `click${EVENT_KEY}`;
	const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
	const EVENT_KEYDOWN = `keydown${EVENT_KEY}`;
	const EVENT_KEYUP = `keyup${EVENT_KEY}`;
	const EVENT_SEARCH = `search${EVENT_KEY}`;
	const EVENT_SELECTION_LIMIT = `selectionLimit${EVENT_KEY}`;
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_CHIP_REMOVE = "remove.coreui.chip";
	const CLASS_NAME_CHIP = "chip";
	const CLASS_NAME_CLEANER = "form-control-cleaner";
	const CLASS_NAME_DISABLED = "disabled";
	const CLASS_NAME_HEADER = "list-box-header";
	const CLASS_NAME_INPUT_GROUP = "form-control-group";
	const CLASS_NAME_SELECT = "form-multi-select";
	const HOST_ATTRIBUTES = [
		"aria-hidden",
		"id",
		"multiple",
		"name",
		"required",
		"tabindex"
	];
	const CLASS_NAME_SELECT_FILLED = "form-multi-select-filled";
	const CLASS_NAME_SELECT_ALL = "list-box-select-all";
	const CLASS_NAME_SEARCH = "form-multi-select-search";
	const CLASS_NAME_SELECTED = "selected";
	const CLASS_NAME_INDETERMINATE = "indeterminate";
	const CLASS_NAME_SELECTION = "form-multi-select-selection";
	const CLASS_NAME_SELECTION_TAGS = "form-multi-select-selection-tags";
	const CLASS_NAME_SHOW = "show";
	const Default = {
		allowList: js_src_util_sanitizer_js.DefaultAllowlist,
		ariaCleanerLabel: "Clear all selections",
		ariaPickerLabel: "Toggle options list",
		ariaSearchLabel: "Search",
		ariaTagDeleteLabel: "Remove",
		cleaner: true,
		clearSearchOnSelect: false,
		container: false,
		deselectAllLabel: "Deselect all",
		deselectFilteredLabel: "Deselect filtered",
		disabled: false,
		headerTemplate: null,
		hideSelectAllOnSearchNoResults: true,
		id: null,
		indicator: "checkbox",
		invalid: false,
		multiple: true,
		name: null,
		options: false,
		optionsGroupsSelectable: false,
		optionsGroupsTemplate: null,
		optionsMaxHeight: "auto",
		optionsTemplate: null,
		pickerIcon: true,
		placeholder: "Select...",
		required: false,
		sanitize: true,
		sanitizeFn: null,
		search: false,
		searchNoResultsLabel: "No results found",
		selectAll: true,
		selectAllLabel: "Select all",
		selectAllMode: "all",
		selectedLabel: (count) => `${count} item(s) selected`,
		selectFilteredLabel: "Select filtered",
		selectionLimit: null,
		selectionType: "tags",
		valid: false,
		value: null
	};
	const DefaultType = {
		allowList: "object",
		ariaCleanerLabel: "string",
		ariaPickerLabel: "string",
		ariaSearchLabel: "string",
		ariaTagDeleteLabel: "string",
		cleaner: "boolean",
		clearSearchOnSelect: "boolean",
		container: "(string|element|boolean)",
		deselectAllLabel: "string",
		deselectFilteredLabel: "string",
		disabled: "boolean",
		headerTemplate: "(function|null)",
		hideSelectAllOnSearchNoResults: "boolean",
		id: "(string|null)",
		indicator: "string",
		invalid: "boolean",
		multiple: "boolean",
		name: "(string|null)",
		options: "(boolean|array)",
		optionsGroupsSelectable: "boolean",
		optionsGroupsTemplate: "(function|null)",
		optionsMaxHeight: "(number|string)",
		optionsTemplate: "(function|null)",
		pickerIcon: "(string|boolean)",
		placeholder: "string",
		required: "boolean",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		search: "(boolean|string)",
		searchNoResultsLabel: "string",
		selectAll: "boolean",
		selectAllLabel: "string",
		selectAllMode: "string",
		selectedLabel: "(string|function)",
		selectFilteredLabel: "string",
		selectionLimit: "(number|null)",
		selectionType: "string",
		valid: "boolean",
		value: "(string|array|null)"
	};
	/**
	* ------------------------------------------------------------------------
	* Class Definition
	* ------------------------------------------------------------------------
	*/
	var MultiSelectChipSet = class extends js_src_chip_set_js.default {
		_applyAccessibilityRoles() {}
	};
	var MultiSelect = class MultiSelect extends js_src_combobox_base_js.default {
		constructor(element, config) {
			super(element, config);
			this._hostAttributes = new Map(HOST_ATTRIBUTES.map((name) => [name, this._element.getAttribute(name)]));
			this._addedSelectClass = !this._element.classList.contains(CLASS_NAME_SELECT);
			this._configureNativeSelect();
			this._indicatorElement = null;
			this._selectAllElement = null;
			this._dropdownHeaderElement = null;
			this._headerElement = null;
			this._selectionElement = null;
			this._selectionCleanerElement = null;
			this._searchElement = null;
			this._togglerElement = null;
			this._optionsElement = null;
			this._wrapperElement = null;
			this._menu = null;
			this._nativeKeydownHandler = null;
			this._selected = [];
			this._options = this._getOptions();
			this._floatingCleanup = null;
			this._anchoredPosition = null;
			this._search = "";
			if (this._config.options.length > 0) this._createNativeOptions(this._element, this._config.options);
			this._createSelect();
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
		_escapeFocusTarget() {
			return this._config.search ? this._searchElement : this._togglerElement;
		}
		_getShowTarget() {
			return this._wrapperElement;
		}
		_afterShow() {
			if (this._config.search) js_src_dom_selector_engine_js.default.findOne(SELECTOR_SEARCH, this._wrapperElement).focus();
		}
		_onHideStart() {
			this._refocusOnHide = this._wrapperElement.contains(document.activeElement) || this._menu.contains(document.activeElement);
		}
		_afterHideDispose() {
			if (this._config.search) this._searchElement.value = "";
			this._onSearchChange(this._searchElement);
		}
		_onHideEnd() {
			if (this._refocusOnHide && !this._config.disabled) {
				const refocusTarget = this._config.search ? this._searchElement : this._togglerElement;
				if (refocusTarget) refocusTarget.focus();
			}
		}
		dispose() {
			this._destroySelect();
			for (const [name, value] of this._hostAttributes) this._restoreAttribute(name, value);
			if (this._addedSelectClass) this._element.classList.remove(CLASS_NAME_SELECT);
			super.dispose();
		}
		search(text) {
			this._search = text.length > 0 ? text.toLowerCase() : text;
			this._filterOptionsList();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SEARCH);
		}
		setConfig(config) {
			if (config?.value) this.deselectAll();
			this._config = this._getConfig({
				...this._config,
				...config
			});
			this._selected = [];
			this._options = this._getOptions();
			this._destroySelect();
			this._element.innerHTML = "";
			this._configureNativeSelect();
			this._createNativeOptions(this._element, this._options);
			this._createSelect();
			this._addEventListeners();
		}
		selectAll(options = this._options) {
			const limitReached = this._selectAllOptions(options);
			this._refreshAfterSelectionChange();
			if (limitReached) this._triggerSelectionLimit();
		}
		deselectAll(options = this._options) {
			this._deselectAllOptions(options);
			this._refreshAfterSelectionChange();
		}
		selectFiltered() {
			const items = this._getDisplayedItems();
			let limitReached = false;
			for (const item of items) {
				if (this._isSelectionLimitReached()) {
					limitReached = true;
					break;
				}
				const value = String(item.dataset.coreuiValue);
				const option = this._findOptionByValue(value);
				if (option && !this._selected.some((selected) => selected.value === value)) this._selectOption(value, option.text, { refresh: false });
			}
			this._refreshAfterSelectionChange();
			if (limitReached) this._triggerSelectionLimit();
		}
		deselectFiltered() {
			const items = this._getDisplayedItems();
			for (const item of items) {
				const value = String(item.dataset.coreuiValue);
				if (this._selected.some((selected) => selected.value === value)) this._deselectOption(value, { refresh: false });
			}
			this._refreshAfterSelectionChange();
		}
		getValue() {
			return this._selected;
		}
		_destroySelect() {
			this._disposeFloating();
			this._disposeListBox();
			this._disposeSelection();
			for (const element of [
				this._wrapperElement,
				this._menu,
				this._selectionElement,
				this._togglerElement,
				this._searchElement,
				this._indicatorElement,
				this._selectAllElement,
				this._headerElement,
				this._optionsElement
			]) if (element) js_src_dom_event_handler_js.default.off(element, EVENT_KEY);
			if (this._menu) this._menu.remove();
			if (this._wrapperElement) {
				this._wrapperElement.before(this._element);
				this._wrapperElement.remove();
			}
		}
		_addEventListeners() {
			js_src_dom_event_handler_js.default.on(this._selectionElement, EVENT_CHIP_REMOVE, SELECTOR_CHIP, (event) => {
				event.preventDefault();
				const chip = event.target.closest(SELECTOR_CHIP);
				if (chip) this._deselectOption(String(chip.dataset.value));
			});
			js_src_dom_event_handler_js.default.on(this._togglerElement, EVENT_CLICK, SELECTOR_CLEANER, (event) => {
				if (!this._config.disabled) {
					event.preventDefault();
					event.stopPropagation();
					this.deselectAll();
				}
			});
			js_src_dom_event_handler_js.default.on(this._wrapperElement, EVENT_CLICK, () => {
				if (!this._config.disabled) this.show();
			});
			js_src_dom_event_handler_js.default.on(this._wrapperElement, EVENT_KEYDOWN, (event) => {
				if (event.key === ESCAPE_KEY) {
					if (this._isShown()) {
						event.preventDefault();
						event.stopPropagation();
					}
					this.hide();
					return;
				}
				if (this._config.search === "global" && (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY)) this._searchElement.focus();
			});
			js_src_dom_event_handler_js.default.on(this._menu, EVENT_KEYDOWN, (event) => {
				if (this._config.search === "global" && (event.key.length === 1 || event.key === BACKSPACE_KEY || event.key === DELETE_KEY)) this._searchElement.focus();
			});
			this._addTogglerKeydownListeners();
			if (this._nativeKeydownHandler) js_src_dom_event_handler_js.default.off(this._element, EVENT_KEYDOWN, this._nativeKeydownHandler);
			this._nativeKeydownHandler = (event) => {
				if (event.key === TAB_KEY || event.key === ESCAPE_KEY) return;
				event.preventDefault();
				const isPrintable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
				if (!this._isShown() && (event.key === ENTER_KEY || event.key === ARROW_DOWN_KEY || this._config.search && isPrintable)) this.show();
				if (this._config.search) {
					this._searchElement.focus();
					if (isPrintable) {
						this._searchElement.value += event.key;
						this._onSearchChange(this._searchElement);
					}
				} else this._togglerElement.focus();
			};
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, this._nativeKeydownHandler);
			js_src_dom_event_handler_js.default.on(this._indicatorElement, EVENT_CLICK, (event) => {
				event.preventDefault();
				event.stopPropagation();
				this.toggle();
			});
			js_src_dom_event_handler_js.default.on(this._searchElement, EVENT_KEYUP, () => {
				this._onSearchChange(this._searchElement);
			});
			js_src_dom_event_handler_js.default.on(this._searchElement, EVENT_KEYDOWN, (event) => {
				if (!this._isShown() && event.key.length === 1 && !event.ctrlKey && !event.metaKey || event.key === ARROW_DOWN_KEY) this.show();
				if ((event.key === BACKSPACE_KEY || event.key === DELETE_KEY) && event.target.value.length === 0) this._deselectLastOption();
				this._searchElement.focus();
			});
			if (this._selectAllElement) js_src_dom_event_handler_js.default.on(this._menu, EVENT_CLICK, SELECTOR_SELECT_ALL, (event) => {
				event.preventDefault();
				event.stopPropagation();
				if (!this._config.disabled) this._toggleSelectAll();
			});
		}
		_getOptions() {
			if (this._config.options) return this._getOptionsFromConfig();
			return this._getOptionsFromElement();
		}
		_getOptionsFromConfig(options = this._config.options) {
			const _options = [];
			for (const option of options) {
				if (this._isOptionGroup(option)) {
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
				const value = String(option.value);
				const shouldSelect = (option.selected || this._config.value && this._config.value.includes(value)) && !this._isSelectionLimitReached();
				const customProperties = typeof option === "object" ? { ...option } : {};
				delete customProperties.value;
				delete customProperties.selected;
				delete customProperties.disabled;
				_options.push({
					...customProperties,
					value,
					...shouldSelect && { selected: true },
					...option.disabled && { disabled: true }
				});
				if (shouldSelect) this._selected.push({
					value: String(option.value),
					text: option.text
				});
			}
			return _options;
		}
		_getOptionsFromElement(node = this._element) {
			const nodes = Array.from(node.childNodes).filter((element) => element.nodeName === "OPTION" || element.nodeName === "OPTGROUP");
			const options = [];
			for (const node of nodes) {
				if (node.nodeName === "OPTION" && node.value) {
					const value = String(node.value);
					const text = node.textContent;
					const shouldSelect = (node.selected || this._config.value && this._config.value.includes(node.value)) && !this._isSelectionLimitReached();
					options.push({
						value,
						text,
						selected: shouldSelect,
						disabled: node.disabled
					});
					node.selected = shouldSelect;
					if (shouldSelect) this._selected.push({
						value,
						text: node.textContent,
						...node.disabled && { disabled: true }
					});
				}
				if (node.nodeName === "OPTGROUP") options.push({
					label: node.label,
					options: this._getOptionsFromElement(node)
				});
			}
			return options;
		}
		_configureNativeSelect() {
			this._element.classList.add(CLASS_NAME_SELECT);
			if (this._config.multiple) this._element.setAttribute("multiple", true);
			else this._element.removeAttribute("multiple");
			if (this._config.required) this._element.setAttribute("required", true);
			else this._element.removeAttribute("required");
		}
		_createNativeOptions(parentElement, options) {
			for (const option of options) if (this._isOptionGroup(option)) {
				const optgroup = document.createElement("optgroup");
				optgroup.label = option.label;
				this._createNativeOptions(optgroup, option.options);
				parentElement.append(optgroup);
			} else {
				const opt = document.createElement("OPTION");
				opt.value = option.value;
				if (option.disabled === true) opt.setAttribute("disabled", "disabled");
				if (option.selected === true) opt.setAttribute("selected", "selected");
				opt.textContent = option.text;
				parentElement.append(opt);
			}
		}
		_restoreAttribute(name, value) {
			if (value === null) {
				this._element.removeAttribute(name);
				return;
			}
			this._element.setAttribute(name, value);
		}
		_hideNativeSelect() {
			this._element.tabIndex = "-1";
			this._element.setAttribute("aria-hidden", "true");
		}
		_wireTogglerAccessibleName() {
			const nativeLabel = this._element.labels?.[0];
			if (nativeLabel) {
				if (!nativeLabel.id) nativeLabel.id = `${this._uniqueId}-label`;
				this._togglerElement.setAttribute("aria-labelledby", nativeLabel.id);
				return;
			}
			const ariaLabel = this._element.getAttribute("aria-label");
			if (ariaLabel) this._togglerElement.setAttribute("aria-label", ariaLabel);
		}
		_createSelect() {
			const wrapper = document.createElement("div");
			wrapper.classList.add(CLASS_NAME_SELECT);
			wrapper.classList.toggle("is-invalid", this._config.invalid);
			wrapper.classList.toggle("is-valid", this._config.valid);
			if (this._config.disabled) this._element.classList.add(CLASS_NAME_DISABLED);
			for (const className of this._element.classList.value.split(" ")) wrapper.classList.add(className);
			this._wrapperElement = wrapper;
			this._element.parentNode.insertBefore(wrapper, this._element);
			wrapper.prepend(this._element);
			this._createSelection();
			this._createButtons();
			if (this._config.search) {
				this._createSearchInput();
				this._updateSearch();
			}
			this._uniqueId = this._config.id || this._hostAttributes.get("id") || (0, js_src_util_index_js.getUID)(`${this.constructor.NAME}`);
			this._uniqueName = this._config.name || this._hostAttributes.get("name");
			this._element.setAttribute("id", this._uniqueId);
			if (this._uniqueName) this._element.setAttribute("name", this._uniqueName);
			this._wireTogglerAccessibleName();
			this._createOptionsContainer();
			this._hideNativeSelect();
			this._selectInitialOptions();
		}
		_createSelection() {
			const togglerEl = this._wrapperElement;
			togglerEl.classList.add(CLASS_NAME_INPUT_GROUP);
			togglerEl.setAttribute("role", "combobox");
			togglerEl.setAttribute("aria-expanded", "false");
			togglerEl.setAttribute("aria-haspopup", "listbox");
			togglerEl.setAttribute("aria-controls", `${this._uniqueId}-listbox`);
			this._togglerElement = togglerEl;
			if (this._config.disabled) {
				togglerEl.classList.add(CLASS_NAME_DISABLED);
				togglerEl.setAttribute("aria-disabled", "true");
			}
			if (!this._config.search && !this._config.disabled) togglerEl.tabIndex = 0;
			const selectionEl = document.createElement("div");
			selectionEl.classList.add(CLASS_NAME_SELECTION);
			if (this._config.multiple && ["chips", "tags"].includes(this._config.selectionType)) selectionEl.classList.add(CLASS_NAME_SELECTION_TAGS);
			togglerEl.append(selectionEl);
			this._updateSelection();
			this._selectionElement = selectionEl;
			if (this._config.multiple && ["chips", "tags"].includes(this._config.selectionType)) this._selectionChipSet = new MultiSelectChipSet(selectionEl, { removable: !this._config.disabled });
		}
		_createButtons() {
			this._indicatorElement = null;
			if (this._config.pickerIcon) {
				const indicator = document.createElement("button");
				indicator.type = "button";
				indicator.classList.add("form-control-action");
				indicator.disabled = this._config.disabled;
				indicator.setAttribute("aria-label", this._config.ariaPickerLabel);
				indicator.innerHTML = (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config.pickerIcon === true ? js_src_util_icons_js.PICKER_ICON : this._config.pickerIcon, {
					...this._config,
					allowList: js_src_util_sanitizer_js.SVGAllowlist
				});
				this._togglerElement.append(indicator);
				this._indicatorElement = indicator;
			}
			this._updateSelectionCleaner();
		}
		_createSelectionCleaner() {
			const cleaner = document.createElement("button");
			cleaner.type = "button";
			cleaner.classList.add(CLASS_NAME_CLEANER);
			cleaner.setAttribute("aria-label", this._config.ariaCleanerLabel);
			cleaner.innerHTML = js_src_util_icons_js.CLEANER_ICON;
			return cleaner;
		}
		_createSearchInput() {
			const input = document.createElement("input");
			input.classList.add(CLASS_NAME_SEARCH);
			if (this._config.disabled) input.disabled = true;
			input.setAttribute("id", `search-${this._uniqueId}`);
			input.autocomplete = "off";
			input.setAttribute("aria-label", this._config.ariaSearchLabel);
			input.setAttribute("aria-autocomplete", "list");
			input.setAttribute("aria-controls", `${this._uniqueId}-listbox`);
			this._searchElement = input;
			this._updateSearchSize();
			this._selectionElement.append(input);
		}
		_buildMenuHeader(listBoxDiv) {
			const hasHeaderTemplate = typeof this._config.headerTemplate === "function";
			const showSelectAll = this._config.selectAll && this._config.multiple;
			if (!hasHeaderTemplate && !showSelectAll) return;
			const header = document.createElement("div");
			header.classList.add(CLASS_NAME_HEADER);
			this._dropdownHeaderElement = header;
			if (hasHeaderTemplate) {
				const headerContent = document.createElement("div");
				js_src_dom_event_handler_js.default.on(headerContent, EVENT_CLICK, (event) => {
					event.stopPropagation();
				});
				this._headerElement = headerContent;
				header.append(headerContent);
			} else {
				const selectAllButton = document.createElement("button");
				selectAllButton.type = "button";
				selectAllButton.classList.add(CLASS_NAME_SELECT_ALL);
				selectAllButton.setAttribute("data-coreui-select-all", "");
				const selectAllLabel = document.createElement("span");
				selectAllButton.append(selectAllLabel);
				this._selectAllLabelElement = selectAllLabel;
				this._selectAllElement = selectAllButton;
				header.append(selectAllButton);
			}
			listBoxDiv.append(header);
		}
		_afterMenuCreated() {
			this._updateHeader();
			this._updateMasterCheckbox();
		}
		_getListBoxConfig() {
			return {
				...super._getListBoxConfig(),
				indicator: this._config.indicator,
				sectionsSelectable: this._config.optionsGroupsSelectable,
				selectionLimit: this._config.selectionLimit,
				selectionMode: this._config.multiple ? "multiple" : "single"
			};
		}
		_getActiveDescendantField() {
			return this._config.search ? this._searchElement : this._togglerElement;
		}
		_optionText(option) {
			return option.text;
		}
		_createChip(value, text, disabled) {
			const chip = document.createElement("div");
			chip.classList.add(CLASS_NAME_CHIP);
			chip.dataset.value = value;
			chip.textContent = text;
			new js_src_chip_js.default(chip, {
				ariaRemoveLabel: `${this._config.ariaTagDeleteLabel} ${text}`.trim(),
				removable: !this._config.disabled && disabled !== true
			});
			return chip;
		}
		_updateChips(selection, search) {
			const placeholder = js_src_dom_selector_engine_js.default.findOne(".form-multi-select-placeholder", selection);
			if (placeholder) placeholder.remove();
			const existingChips = /* @__PURE__ */ new Map();
			for (const chip of js_src_dom_selector_engine_js.default.children(selection, SELECTOR_CHIP)) existingChips.set(chip.dataset.value, chip);
			const selectedValues = new Set(this._selected.map((option) => String(option.value)));
			for (const [value, chip] of existingChips) if (!selectedValues.has(value)) {
				js_src_chip_js.default.getInstance(chip)?.dispose();
				chip.remove();
				existingChips.delete(value);
			}
			for (const option of this._selected) {
				const value = String(option.value);
				const chip = existingChips.get(value) || this._createChip(option.value, option.text, option.disabled);
				if (search) search.before(chip);
				else selection.append(chip);
			}
		}
		_onOptionSelected(value) {
			const option = this._findOptionByValue(value);
			this._selectOption(value, option ? option.text : value, { refresh: false });
		}
		_onOptionDeselected(value) {
			this._deselectOption(value, { refresh: false });
		}
		_onSelectionChange() {
			if (!this._config.multiple) {
				this.hide();
				this.search("");
				if (this._config.search) this._searchElement.value = null;
			}
			if (this._config.clearSearchOnSelect && this._config.search) {
				this.search("");
				this._searchElement.value = null;
				this._searchElement.focus();
			}
			this._refreshAfterSelectionChange();
		}
		_onSelectionLimit() {
			this._triggerSelectionLimit();
		}
		_selectAllOptions(options) {
			for (const option of options) {
				if (option.disabled) continue;
				if (this._isOptionGroup(option)) {
					if (this._selectAllOptions(option.options)) return true;
					continue;
				}
				if (this._isSelectionLimitReached()) return true;
				this._selectOption(option.value, option.text, { refresh: false });
			}
			return false;
		}
		_deselectAllOptions(options) {
			for (const option of options) {
				if (option.disabled) continue;
				if (this._isOptionGroup(option)) {
					this._deselectAllOptions(option.options);
					continue;
				}
				this._deselectOption(option.value, { refresh: false });
			}
		}
		_getNativeOption(value) {
			return js_src_dom_selector_engine_js.default.findOne(`option[value="${CSS.escape(value)}"]`, this._element);
		}
		_getOptionElement(value) {
			return js_src_dom_selector_engine_js.default.findOne(`[data-coreui-value="${CSS.escape(value)}"]`, this._optionsElement);
		}
		_getDisplayedItems() {
			return this._getDisplayedOptions().filter((element) => !element.classList.contains(CLASS_NAME_DISABLED));
		}
		_isOptionGroup(option) {
			return Array.isArray(option.options);
		}
		_selectOption(value, text, { refresh = true } = {}) {
			if (!this._config.multiple) this.deselectAll();
			const isSelected = this._selected.some((option) => option.value === String(value));
			if (!isSelected && this._isSelectionLimitReached()) {
				this._triggerSelectionLimit();
				return;
			}
			if (!isSelected) this._selected.push({
				value: String(value),
				text
			});
			const nativeOption = this._getNativeOption(value);
			if (nativeOption) nativeOption.selected = true;
			this._syncOptionElementState(value, true);
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value: this._selected });
			if (refresh) this._refreshAfterSelectionChange();
		}
		_deselectOption(value, { refresh = true } = {}) {
			this._selected = this._selected.filter((option) => option.value !== String(value));
			const nativeOption = this._getNativeOption(value);
			if (nativeOption) nativeOption.selected = false;
			this._syncOptionElementState(value, false);
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_CHANGE, { value: this._selected });
			if (refresh) this._refreshAfterSelectionChange();
		}
		_deselectLastOption() {
			if (this._selected.length > 0) {
				const last = this._selected.findLast((option) => option.disabled !== true);
				if (last) this._deselectOption(last.value);
			}
		}
		_refreshAfterSelectionChange() {
			this._updateSelection();
			this._updateSelectionCleaner();
			this._updateSearch();
			this._updateSearchSize();
			this._updateHeader();
			this._updateMasterCheckbox();
		}
		_selectInitialOptions() {
			for (const option of this._selected) this._selectOption(option.value, option.text, { refresh: false });
			this._refreshAfterSelectionChange();
		}
		_updateSelection() {
			const selection = js_src_dom_selector_engine_js.default.findOne(SELECTOR_SELECTION, this._wrapperElement);
			const search = js_src_dom_selector_engine_js.default.findOne(SELECTOR_SEARCH, this._wrapperElement);
			this._wrapperElement.classList.toggle(CLASS_NAME_SELECT_FILLED, this._selected.length > 0);
			if (this._selected.length === 0 && !this._config.search) {
				this._renderEmptySelection(selection);
				return;
			}
			if (this._config.multiple && this._config.selectionType === "counter" && !this._config.search) selection.textContent = (0, js_src_util_index_js.resolveCountLabel)(this._config.selectedLabel, this._selected.length, this._options.length);
			if (this._config.multiple && ["chips", "tags"].includes(this._config.selectionType)) this._updateChips(selection, search);
			if (this._config.multiple && this._config.selectionType === "text") {
				selection.innerHTML = "";
				for (const [index, option] of this._selected.entries()) {
					const span = document.createElement("span");
					span.textContent = `${option.text}${index === this._selected.length - 1 ? "" : ","}\u00A0`;
					selection.append(span);
				}
			}
			if (!this._config.multiple && this._selected.length > 0 && !this._config.search) selection.textContent = this._selected[0].text;
			if (search) selection.append(search);
			if (this._floatingCleanup) this._updateFloatingPosition();
		}
		_renderEmptySelection(selection) {
			const placeholder = document.createElement("span");
			placeholder.classList.add("form-multi-select-placeholder");
			placeholder.textContent = this._config.placeholder;
			for (const chip of js_src_dom_selector_engine_js.default.find(SELECTOR_CHIP, selection)) js_src_chip_js.default.getInstance(chip)?.dispose();
			selection.innerHTML = "";
			selection.append(placeholder);
		}
		_disposeSelection() {
			if (!this._selectionElement) return;
			for (const chip of js_src_dom_selector_engine_js.default.find(SELECTOR_CHIP, this._selectionElement)) js_src_chip_js.default.getInstance(chip)?.dispose();
			this._selectionChipSet?.dispose();
			this._selectionChipSet = null;
			js_src_dom_event_handler_js.default.off(this._selectionElement, js_src_chip_js.default.EVENT_KEY);
		}
		_updateSelectionCleaner() {
			if (!this._config.cleaner || this._config.disabled) return;
			if (this._selected.length > 0 && this._selectionCleanerElement === null) {
				const selectionCleaner = this._createSelectionCleaner();
				if (this._indicatorElement) this._indicatorElement.before(selectionCleaner);
				else this._togglerElement.append(selectionCleaner);
				this._selectionCleanerElement = selectionCleaner;
				return;
			}
			if (this._selected.length === 0 && this._selectionCleanerElement !== null) {
				this._selectionCleanerElement.remove();
				this._selectionCleanerElement = null;
			}
		}
		_updateSearch() {
			if (!this._config.search) return;
			if (!this._config.multiple && this._selected.length > 0) {
				this._searchElement.placeholder = this._selected[0].text;
				return;
			}
			if (!this._config.multiple && this._selected.length === 0) {
				this._searchElement.placeholder = this._config.placeholder;
				return;
			}
			if (this._config.multiple && this._selected.length > 0 && this._config.selectionType !== "counter") {
				this._searchElement.removeAttribute("placeholder");
				return;
			}
			if (this._config.multiple && this._selected.length === 0) {
				this._searchElement.placeholder = this._config.placeholder;
				return;
			}
			if (this._config.multiple && this._config.selectionType === "counter") this._searchElement.placeholder = (0, js_src_util_index_js.resolveCountLabel)(this._config.selectedLabel, this._selected.length, this._options.length);
		}
		_updateSearchSize(size = 2) {
			if (!this._searchElement || !this._config.multiple) return;
			if (this._selected.length > 0 && [
				"chips",
				"tags",
				"text"
			].includes(this._config.selectionType)) {
				this._searchElement.size = size;
				return;
			}
			if (this._selected.length === 0 && [
				"chips",
				"tags",
				"text"
			].includes(this._config.selectionType)) this._searchElement.removeAttribute("size");
		}
		_updateHeader() {
			if (this._headerElement) {
				this._renderHeader();
				return;
			}
			if (!this._selectAllElement) return;
			this._selectAllLabelElement.textContent = this._getSelectAllLabel();
		}
		_getSelectAllLabel() {
			const allSelected = this._isAllSelected();
			if (this._isFilteredScopeNarrowed()) return allSelected ? this._config.deselectFilteredLabel : this._config.selectFilteredLabel;
			return allSelected ? this._config.deselectAllLabel : this._config.selectAllLabel;
		}
		_isAllSelected() {
			const { selected, total } = this._getSelectAllScope();
			const target = this._getSelectableTarget(total);
			return target > 0 && selected >= target;
		}
		_getSelectAllScope() {
			const { selected, total, filtered, filteredSelected } = this._getSelectionState();
			return this._config.selectAllMode === "filtered" ? {
				selected: filteredSelected,
				total: filtered
			} : {
				selected,
				total
			};
		}
		_isFilteredScopeNarrowed() {
			if (this._config.selectAllMode !== "filtered") return false;
			const { filtered, total } = this._getSelectionState();
			return filtered < total;
		}
		_toggleSelectAll() {
			const filteredMode = this._config.selectAllMode === "filtered";
			if (this._isAllSelected()) {
				if (filteredMode) this.deselectFiltered();
				else this.deselectAll();
				return;
			}
			if (filteredMode) this.selectFiltered();
			else this.selectAll();
		}
		_getSelectableTarget(total) {
			return this._hasSelectionLimit() ? Math.min(total, this._config.selectionLimit) : total;
		}
		_getCheckboxState(selected, total) {
			if (total > 0 && selected >= total) return "all";
			return selected === 0 ? "none" : "indeterminate";
		}
		_applyCheckboxState(element, state) {
			element.classList.toggle(CLASS_NAME_SELECTED, state === "all");
			element.classList.toggle(CLASS_NAME_INDETERMINATE, state === "indeterminate");
			element.setAttribute("aria-pressed", state === "all" ? "true" : state === "none" ? "false" : "mixed");
		}
		_updateMasterCheckbox() {
			if (!this._selectAllElement) return;
			const { selected, total } = this._getSelectAllScope();
			this._applyCheckboxState(this._selectAllElement, this._getCheckboxState(selected, this._getSelectableTarget(total)));
		}
		_renderHeader() {
			if (!this._headerElement || typeof this._config.headerTemplate !== "function") return;
			const result = this._config.headerTemplate(this._getSelectionState(), this._getSelectionActions());
			if (result instanceof Node) this._headerElement.replaceChildren(result);
			else this._headerElement.innerHTML = (0, js_src_util_sanitizer_js.sanitizeByConfig)(result, this._config);
		}
		_getSelectionState() {
			const allItems = js_src_dom_selector_engine_js.default.find(SELECTOR_OPTION, this._optionsElement).filter((element) => !element.classList.contains(CLASS_NAME_DISABLED));
			const filteredItems = allItems.filter((element) => this._isOptionDisplayed(element));
			return {
				selected: this._selected.length,
				total: allItems.length,
				filtered: filteredItems.length,
				filteredSelected: filteredItems.filter((element) => element.classList.contains(CLASS_NAME_SELECTED)).length
			};
		}
		_getSelectionActions() {
			return {
				selectAll: () => this.selectAll(),
				deselectAll: () => this.deselectAll(),
				selectFiltered: () => this.selectFiltered(),
				deselectFiltered: () => this.deselectFiltered()
			};
		}
		_onSearchChange(element) {
			if (element) {
				this.search(element.value);
				this._updateSearchSize(element.value.length + 1);
			}
		}
		_hasSelectionLimit() {
			return this._config.multiple && this._config.selectionLimit !== null;
		}
		_isSelectionLimitReached() {
			return this._hasSelectionLimit() && this._selected.length >= this._config.selectionLimit;
		}
		_triggerSelectionLimit() {
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SELECTION_LIMIT, { selectionLimit: this._config.selectionLimit });
		}
		_afterFilter(visibleOptions) {
			this._updateHeader();
			this._updateMasterCheckbox();
			this._updateSelectAllVisibility(visibleOptions);
		}
		_updateSelectAllVisibility(visibleOptions) {
			if (!this._dropdownHeaderElement || !this._selectAllElement) return;
			if (this._config.hideSelectAllOnSearchNoResults && visibleOptions === 0) this._dropdownHeaderElement.style.display = "none";
			else this._dropdownHeaderElement.style.removeProperty("display");
		}
		_configAfterMerge(config) {
			config = this._normalizeContainerConfig(config);
			if (typeof config.value === "number") config.value = [String(config.value)];
			if (typeof config.value === "string") config.value = config.value.split(/,\s*/).map(String);
			return config;
		}
		static multiSelectInterface(element, config, ...args) {
			const data = MultiSelect.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, MultiSelect, config, args);
		}
		static clearMenus(event) {
			if (event && (event.button === RIGHT_MOUSE_BUTTON || event.type === "keyup" && event.key !== TAB_KEY)) return;
			const selects = js_src_dom_selector_engine_js.default.find(SELECTOR_SELECT);
			for (let i = 0, len = selects.length; i < len; i++) {
				const context = js_src_dom_data_js.default.get(selects[i], DATA_KEY);
				const relatedTarget = { relatedTarget: selects[i] };
				if (event && event.type === "click") relatedTarget.clickEvent = event;
				if (!context) continue;
				if (!context._wrapperElement.classList.contains(CLASS_NAME_SHOW)) continue;
				if (context._wrapperElement.contains(event.target) || context._menu.contains(event.target)) continue;
				context.hide();
				js_src_dom_event_handler_js.default.trigger(context._element, EVENT_HIDDEN);
			}
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		const elements = /* @__PURE__ */ new Set([...js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_MULTI_SELECT), ...js_src_dom_selector_engine_js.default.find(SELECTOR_SELECT)]);
		for (const ms of elements) if (ms.tabIndex !== -1) MultiSelect.multiSelectInterface(ms);
	});
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, MultiSelect.clearMenus);
	js_src_dom_event_handler_js.default.on(document, EVENT_KEYUP_DATA_API, MultiSelect.clearMenus);
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(MultiSelect);
	//#endregion
	return MultiSelect;
});

//# sourceMappingURL=multi-select.js.map
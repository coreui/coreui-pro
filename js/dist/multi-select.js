/*!
* CoreUI PRO multi-select.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./chip.js"), require("./chip-set.js"), require("./combobox-base.js"), require("./dom/data.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/announce.js"), require("./util/calendar.js"), require("./util/chip-values.js"), require("./util/field-validation.js"), require("./util/focus.js"), require("./util/focustrap.js"), require("./util/form-validation.js"), require("./util/icons.js"), require("./util/list-navigation.js"), require("./util/option-tree.js"), require("./util/selection-state.js"), require("./util/sanitizer.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./chip.js",
		"./chip-set.js",
		"./combobox-base.js",
		"./dom/data.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/announce.js",
		"./util/calendar.js",
		"./util/chip-values.js",
		"./util/field-validation.js",
		"./util/focus.js",
		"./util/focustrap.js",
		"./util/form-validation.js",
		"./util/icons.js",
		"./util/list-navigation.js",
		"./util/option-tree.js",
		"./util/selection-state.js",
		"./util/sanitizer.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.MultiSelect = factory(global.Chip, global.ChipSet, global.ComboboxBase, global.Data, global.EventHandler, global.SelectorEngine, global.Announce, global.CalendarUtil, global.ChipValues, global.FieldValidation, global.Focus, global.Focustrap, global.FormValidation, global.Icons, global.ListNavigation, global.OptionTree, global.SelectionState, global.Sanitizer, global.Index));
})(this, function(js_src_chip_js, js_src_chip_set_js, js_src_combobox_base_js, js_src_dom_data_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_announce_js, js_src_util_calendar_js, js_src_util_chip_values_js, js_src_util_field_validation_js, js_src_util_focus_js, js_src_util_focustrap_js, js_src_util_form_validation_js, js_src_util_icons_js, js_src_util_list_navigation_js, js_src_util_option_tree_js, js_src_util_selection_state_js, js_src_util_sanitizer_js, js_src_util_index_js) {
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
	js_src_util_field_validation_js = __toESM(js_src_util_field_validation_js);
	js_src_util_focustrap_js = __toESM(js_src_util_focustrap_js);
	//#region js/src/multi-select.ts
	const NAME = "multi-select";
	const DATA_KEY = "coreui.multi-select";
	const EVENT_KEY = `.${DATA_KEY}`;
	const DATA_API_KEY = ".data-api";
	const ARROW_DOWN_KEY = "ArrowDown";
	const ARROW_LEFT_KEY = "ArrowLeft";
	const ARROW_RIGHT_KEY = "ArrowRight";
	const ARROW_UP_KEY = "ArrowUp";
	const BACKSPACE_KEY = "Backspace";
	const DELETE_KEY = "Delete";
	const ENTER_KEY = "Enter";
	const ESCAPE_KEY = "Escape";
	const TAB_KEY = "Tab";
	const RIGHT_MOUSE_BUTTON = 2;
	const SELECTOR_CHIP_REMOVE = ".chip-remove";
	const SELECTOR_CHIP = ".chip";
	const SELECTOR_CLEANER = ".form-control-cleaner";
	const SELECTOR_OPTION = ".list-box-option";
	const SELECTOR_SEARCH = ".multi-select-search";
	const SELECTOR_SELECT_ALL = "[data-coreui-select-all]";
	const SELECTOR_TEXT_ENTRY = "input, textarea, select, [contenteditable=\"\"], [contenteditable=\"true\"]";
	const SELECTOR_DATA_MULTI_SELECT = "[data-coreui-multi-select]";
	const SELECTOR_SELECT = "select.multi-select";
	const SELECTOR_SELECTION = ".multi-select-selection";
	const EVENT_CHANGE = `change${EVENT_KEY}`;
	const EVENT_CLICK = `click${EVENT_KEY}`;
	const EVENT_FOCUS = `focus${EVENT_KEY}`;
	const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
	const EVENT_KEYDOWN = `keydown${EVENT_KEY}`;
	const EVENT_INPUT = `input${EVENT_KEY}`;
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
	const CLASS_NAME_IS_INVALID = "is-invalid";
	const CLASS_NAME_IS_VALID = "is-valid";
	const CLASS_NAME_SELECT = "multi-select";
	const HOST_ATTRIBUTES = ["id", "name"];
	const CLASS_NAME_SELECT_FILLED = "multi-select-filled";
	const CLASS_NAME_SELECT_ALL = "list-box-select-all";
	const CLASS_NAME_SEARCH = "multi-select-search";
	const CLASS_NAME_SELECTED = "selected";
	const CLASS_NAME_INDETERMINATE = "indeterminate";
	const CLASS_NAME_SELECTION = "multi-select-selection";
	const CLASS_NAME_SELECTION_CHIPS = "multi-select-selection-chips";
	const CLASS_NAME_SHOW = "show";
	const Default = {
		allowList: js_src_util_sanitizer_js.DefaultAllowlist,
		ariaChipRemoveLabel: "Remove",
		ariaCleanerLabel: "Clear all selections",
		ariaPickerLabel: "Toggle options list",
		ariaRemovedAnnouncement: "removed",
		ariaSearchLabel: "Search",
		ariaTagDeleteLabel: null,
		cleaner: true,
		clearSearchOnSelect: false,
		container: false,
		deselectAllLabel: "Deselect all",
		deselectFilteredLabel: "Deselect filtered",
		disabled: false,
		globalSearch: true,
		headerTemplate: null,
		hideSelectAllOnSearchNoResults: true,
		id: null,
		indicator: "checkbox",
		invalid: false,
		loadingLabel: "Loading…",
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
		resetSelectionOnOptionsChange: false,
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
		selectionType: "chips",
		total: null,
		valid: false,
		validationState: null,
		value: null
	};
	const DefaultType = {
		allowList: "object",
		ariaChipRemoveLabel: "(string|function)",
		ariaCleanerLabel: "string",
		ariaPickerLabel: "string",
		ariaRemovedAnnouncement: "(string|function)",
		ariaSearchLabel: "string",
		ariaTagDeleteLabel: "(string|null)",
		cleaner: "boolean",
		clearSearchOnSelect: "boolean",
		container: "(string|element|boolean)",
		deselectAllLabel: "string",
		deselectFilteredLabel: "string",
		disabled: "boolean",
		globalSearch: "boolean",
		headerTemplate: "(function|null)",
		hideSelectAllOnSearchNoResults: "boolean",
		id: "(string|null)",
		indicator: "string",
		invalid: "boolean",
		loadingLabel: "string",
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
		resetSelectionOnOptionsChange: "boolean",
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
		total: "(number|null|undefined)",
		valid: "boolean",
		validationState: "(string|null|undefined)",
		value: "(string|array|null)"
	};
	var MultiSelectChipSet = class extends js_src_chip_set_js.default {
		_containerRole() {
			return null;
		}
	};
	var MultiSelect = class MultiSelect extends js_src_combobox_base_js.default {
		constructor(element, config) {
			super(element, config);
			this._hostAttributes = new Map(HOST_ATTRIBUTES.map((name) => [name, this._element.getAttribute(name)]));
			this._hostOptions = [...this._element.childNodes];
			this._validation = new js_src_util_field_validation_js.default(this._element, {
				aliases: true,
				config: () => this._config,
				canBlock: () => !this._disabled,
				fields: () => [this._element],
				frames: () => [this._wrapperElement],
				invalidTargets: () => [this._getFocusTarget()],
				owned: () => [this._element, this._searchElement].filter(Boolean),
				restore: () => this._restoreSelection()
			});
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
			this._nativeFocusHandler = null;
			this._nativeKeydownHandler = null;
			this._initialSelection = [];
			this._known = /* @__PURE__ */ new Map();
			this._seenValues = /* @__PURE__ */ new Set();
			this._disabled = this._config.disabled;
			this._givenApplies = Boolean(this._config.value);
			this._givenValues = this._config.value ? new Set(this._config.value) : null;
			this._sourceOptions = this._config.options || this._getOptionsFromElement();
			this._total = this._config.total;
			this._store = (0, js_src_util_selection_state_js.createSelectionStore)((next) => this._fit(next));
			this._options = this._getOptions();
			this._store.commit(this._markedValues());
			this._configureNativeSelect();
			this._floatingCleanup = null;
			this._anchoredPosition = null;
			this._search = "";
			this._loading = false;
			this._offListOptions = [];
			if (this._config.options.length > 0) this._createNativeOptions(this._element, this._options);
			this._createSelect();
			this._initialSelection = this._selectedOptions();
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
			if (!this._isShown()) return;
			this._focustrap = new js_src_util_focustrap_js.default({
				additionalElement: this._config.search ? this._searchElement : null,
				autofocus: false,
				trapElement: this._menu
			});
			this._focustrap.activate();
			this._pointerDownListener = (event) => {
				if (this._wrapperElement.contains(event.target) || this._menu.contains(event.target)) return;
				this._focustrap?.deactivate();
				const rearm = () => {
					document.removeEventListener("pointerup", rearm, true);
					if (this._isShown()) this._focustrap?.activate();
				};
				document.addEventListener("pointerup", rearm, true);
			};
			document.addEventListener("pointerdown", this._pointerDownListener, true);
			if (this._config.search) {
				this._searchElement.focus();
				return;
			}
			this._focusListBox();
		}
		_focusListBox() {
			if (!this._listBox) return;
			if (this._listBox.getActive() === null && !this._searchElement?.value) {
				const selected = js_src_dom_selector_engine_js.default.findOne(`${SELECTOR_OPTION}.${CLASS_NAME_SELECTED}:not([hidden])`, this._menu);
				if (selected?.dataset.coreuiValue) this._listBox.setActive(selected.dataset.coreuiValue);
			}
			this._listBox.focusActive();
			if (!(0, js_src_util_focus_js.containsFocus)(this._menu)) this._menu.focus();
		}
		_releaseFocus() {
			if (this._pointerDownListener) {
				document.removeEventListener("pointerdown", this._pointerDownListener, true);
				this._pointerDownListener = null;
			}
			this._focustrap?.deactivate();
			this._focustrap = null;
		}
		_onHideStart() {
			this._releaseFocus();
			this._refocusOnHide = (0, js_src_util_focus_js.containsFocus)(this._wrapperElement) || (0, js_src_util_focus_js.containsFocus)(this._menu);
		}
		_afterHideDispose() {
			if (this._config.search) this._searchElement.value = "";
			this._onSearchChange(this._searchElement);
		}
		_onHideEnd() {
			if (this._refocusOnHide && !this._disabled) {
				const refocusTarget = this._config.search ? this._searchElement : this._togglerElement;
				if (refocusTarget) refocusTarget.focus();
			}
		}
		dispose() {
			this._validation.dispose();
			this._destroySelect();
			if (this._element.firstChild !== this._hostOptions[0]) this._element.replaceChildren(...this._hostOptions);
			for (const [name, value] of this._hostAttributes) (0, js_src_util_index_js.writeAttribute)(this._element, name, value);
			super.dispose();
		}
		search(text) {
			const changed = text !== this._search;
			this._search = text;
			this._filterOptionsList();
			if (changed) js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SEARCH, { query: text });
		}
		setLoading(loading) {
			this._loading = loading;
			this._listBox?.setLoading(loading);
		}
		setOptions(options) {
			if (!this._config) return;
			this._typeCheckConfig({ options }, { options: DefaultType.options });
			const hadFocus = (0, js_src_util_focus_js.containsFocus)(this._menu);
			const active = this._listBox?.getActive();
			const previous = new Set((0, js_src_util_option_tree_js.flattenOptions)(this._options).map((option) => String(option.value)));
			const seen = new Set(this._seenValues);
			this._sourceOptions = options;
			this._givenApplies = false;
			this._options = this._getOptionsFromConfig(options);
			const values = new Set((0, js_src_util_option_tree_js.flattenOptions)(this._options).map((option) => String(option.value)));
			const reset = this._config.resetSelectionOnOptionsChange && (values.size !== previous.size || [...values].some((value) => !previous.has(value)));
			const marked = this._markedValues();
			const seeded = this._givenValues ? marked.filter((value) => !seen.has(value)) : [];
			const selected = this._store.values();
			const next = reset ? marked : [...selected, ...this._config.multiple || selected.length === 0 ? seeded : []];
			const listed = this._listedOptions();
			const initial = [...this._initialSelection, ...seeded.map((value) => ({
				value,
				...this._describe(listed.get(value))
			}))];
			this._initialSelection = this._fit(initial.map((option) => option.value)).map((value) => initial.find((option) => option.value === value));
			this._element.replaceChildren();
			this._createNativeOptions(this._element, this._options);
			this._listBox?.setItems(this._getListBoxItems());
			this._filterOptionsList();
			this._commit(next, reset);
			if (!this._config) return;
			const focused = this._menu.getRootNode().activeElement;
			if (!hadFocus || focused !== this._menu && (0, js_src_util_focus_js.containsFocus)(this._menu) && (0, js_src_util_index_js.isVisible)(focused)) return;
			const items = this._getDisplayedItems();
			const target = items.find((item) => item.dataset.coreuiValue === active) ?? (this._config.search ? null : items[0]);
			if (target) {
				this._listBox.setActive(target.dataset.coreuiValue);
				this._listBox.focusActive();
			} else (this._config.search ? this._searchElement : this._menu).focus();
		}
		disable() {
			this._setDisabled(true);
		}
		enable() {
			this._setDisabled(false);
		}
		setTotal(total) {
			this._typeCheckConfig({ total }, { total: DefaultType.total });
			this._total = total;
			this._render();
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
			const select = this._element;
			const values = this._normalizeValue(value);
			this._givenValues = values ? new Set(values) : /* @__PURE__ */ new Set();
			this._givenApplies = true;
			this._options = this._getOptions();
			select.selectedIndex = -1;
			this._commit(this._markedValues(), false);
		}
		selectAll(options = this._options) {
			this._selectUpToLimit(this._enabledOptions(options));
		}
		deselectAll(options) {
			const values = options ? new Set(this._enabledOptions(options).map((option) => String(option.value))) : null;
			this._commit(this._selectedOptions().filter((option) => option.disabled === true || values !== null && !values.has(option.value)).map((option) => option.value));
		}
		selectFiltered() {
			const options = this._getDisplayedItems().map((item) => this._findOptionByValue(String(item.dataset.coreuiValue))).filter(Boolean);
			this._selectUpToLimit(options);
		}
		deselectFiltered() {
			const values = new Set(this._getDisplayedItems().map((item) => String(item.dataset.coreuiValue)));
			this._commit(this._store.values().filter((value) => !values.has(value)));
		}
		getValue() {
			return this._selectedOptions();
		}
		_isDisabled() {
			return this._disabled;
		}
		_setDisabled(disabled) {
			if (disabled === this._disabled) return;
			this._disabled = disabled;
			if (disabled) this.hide();
			this._element.toggleAttribute("disabled", disabled);
			this._element.classList.toggle(CLASS_NAME_DISABLED, disabled);
			this._wrapperElement.classList.toggle(CLASS_NAME_DISABLED, disabled);
			this._togglerElement.classList.toggle(CLASS_NAME_DISABLED, disabled);
			(0, js_src_util_index_js.writeAttribute)(this._togglerElement, "aria-disabled", disabled ? "true" : null);
			if (!this._config.search) (0, js_src_util_index_js.writeAttribute)(this._togglerElement, "tabindex", disabled ? null : "0");
			if (this._indicatorElement) this._indicatorElement.disabled = disabled;
			if (this._searchElement) this._searchElement.disabled = disabled;
			this._render();
		}
		_destroySelect() {
			this._releaseFocus();
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
				if (!chip) return;
				const target = (0, js_src_util_focus_js.containsFocus)(chip) ? (0, js_src_util_list_navigation_js.getRemovalNeighbor)(this._getChips(), chip) ?? (this._config.search ? this._searchElement : this._togglerElement) : null;
				this._removeAsUser(() => this._deselectOption(String(chip.dataset.value)));
				target?.focus();
			});
			js_src_dom_event_handler_js.default.on(this._selectionElement, EVENT_KEYDOWN, SELECTOR_CHIP, (event) => {
				const towardField = (0, js_src_util_index_js.isRTL)(this._wrapperElement) ? ARROW_LEFT_KEY : ARROW_RIGHT_KEY;
				if (this._config.search && event.key === towardField && event.delegateTarget === this._getChips().at(-1)) {
					event.preventDefault();
					this._searchElement.focus();
				}
			});
			js_src_dom_event_handler_js.default.on(this._togglerElement, EVENT_CLICK, SELECTOR_CLEANER, (event) => {
				if (!this._disabled) {
					event.preventDefault();
					event.stopPropagation();
					this._removeAsUser(() => this.deselectAll());
				}
			});
			js_src_dom_event_handler_js.default.on(this._wrapperElement, EVENT_CLICK, () => {
				if (!this._disabled) this.show();
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
				if (this._isShown() && event.target === this._searchElement) {
					if (event.key === ARROW_DOWN_KEY || event.key === ARROW_UP_KEY) {
						event.preventDefault();
						if (event.key === ARROW_UP_KEY && this._listBox?.getActive() === null) {
							this._listBox.last();
							return;
						}
						this._focusListBox();
						return;
					}
					if (event.key === ENTER_KEY) {
						const stop = js_src_dom_selector_engine_js.default.findOne(`${SELECTOR_OPTION}[tabindex="0"]`, this._menu);
						if (stop?.dataset.coreuiValue) {
							event.preventDefault();
							this._listBox?.toggle(stop.dataset.coreuiValue);
						}
						return;
					}
				}
				if (this._routesTypingToSearch() && (0, js_src_util_list_navigation_js.isTypingKey)(event) && !event.defaultPrevented) this._searchElement.focus();
			});
			js_src_dom_event_handler_js.default.on(this._menu, EVENT_KEYDOWN, (event) => {
				if (this._routesTypingToSearch() && (0, js_src_util_list_navigation_js.isTypingKey)(event) && !event.target.closest(SELECTOR_TEXT_ENTRY)) this._searchElement.focus();
			});
			this._addTogglerKeydownListeners();
			if (this._nativeKeydownHandler) js_src_dom_event_handler_js.default.off(this._element, EVENT_KEYDOWN, this._nativeKeydownHandler);
			this._nativeKeydownHandler = (event) => {
				if (!event.key || event.key === TAB_KEY || event.key === ESCAPE_KEY) return;
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
			if (this._nativeFocusHandler) js_src_dom_event_handler_js.default.off(this._element, EVENT_FOCUS, this._nativeFocusHandler);
			this._nativeFocusHandler = () => {
				this._getFocusTarget().focus();
			};
			js_src_dom_event_handler_js.default.on(this._element, EVENT_FOCUS, this._nativeFocusHandler);
			js_src_dom_event_handler_js.default.on(this._indicatorElement, EVENT_CLICK, (event) => {
				event.preventDefault();
				event.stopPropagation();
				this.toggle();
			});
			js_src_dom_event_handler_js.default.on(this._searchElement, EVENT_INPUT, () => {
				this._onSearchChange(this._searchElement);
			});
			js_src_dom_event_handler_js.default.on(this._searchElement, EVENT_KEYDOWN, (event) => {
				if (!this._isShown() && event.key?.length === 1 && !event.ctrlKey && !event.metaKey || event.key === ARROW_DOWN_KEY) this.show();
				if (this._handleSearchToChips(event)) return;
				if ((event.key === BACKSPACE_KEY || event.key === DELETE_KEY) && event.target.value.length === 0) this._deselectLastOption();
				this._searchElement?.focus();
			});
			if (this._selectAllElement) js_src_dom_event_handler_js.default.on(this._menu, EVENT_CLICK, SELECTOR_SELECT_ALL, (event) => {
				event.preventDefault();
				event.stopPropagation();
				if (!this._disabled) this._validation.runAsUser(() => this._toggleSelectAll());
			});
		}
		_getOptions() {
			return this._getOptionsFromConfig(this._sourceOptions);
		}
		_getOptionsFromConfig(options = this._sourceOptions, disabled = false) {
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
				const value = String(option.value);
				const values = this._givenApplies || !this._seenValues.has(value) ? this._givenValues : null;
				const isSelected = values ? values.has(value) : option.selected;
				this._seenValues.add(value);
				const customProperties = typeof option === "object" ? { ...option } : {};
				delete customProperties.value;
				delete customProperties.selected;
				delete customProperties.disabled;
				_options.push({
					...customProperties,
					value,
					...isSelected && { selected: true },
					...(disabled || option.disabled) && { disabled: true }
				});
			}
			return _options;
		}
		_getOptionsFromElement(node = this._element) {
			return [...node.children].filter((child) => child.nodeName === "OPTGROUP" || child.nodeName === "OPTION" && child.value).map((child) => child.nodeName === "OPTGROUP" ? {
				label: child.label,
				disabled: child.disabled,
				options: this._getOptionsFromElement(child)
			} : {
				value: child.value,
				text: child.textContent,
				selected: child.selected,
				disabled: child.disabled
			});
		}
		_configureNativeSelect() {
			this._element.classList.add(CLASS_NAME_SELECT);
			if (this._config.multiple) this._element.setAttribute("multiple", true);
			else this._element.removeAttribute("multiple");
			if (this._config.required) this._element.setAttribute("required", true);
			else this._element.removeAttribute("required");
			this._element.toggleAttribute("disabled", this._disabled);
		}
		_createNativeOptions(parentElement, options) {
			for (const option of options) if ((0, js_src_util_option_tree_js.isOptionGroup)(option)) {
				const optgroup = document.createElement("optgroup");
				optgroup.label = option.label;
				optgroup.disabled = option.disabled === true;
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
		_hideNativeSelect() {
			this._element.tabIndex = "-1";
			this._element.setAttribute("aria-hidden", "true");
		}
		_wireTogglerAccessibleName() {
			const labelledBy = this._element.getAttribute("aria-labelledby");
			const ariaLabel = this._element.getAttribute("aria-label");
			const nativeLabel = [...this._element.labels ?? []].find((label) => !label.contains(this._element));
			if (labelledBy) this._togglerElement.setAttribute("aria-labelledby", labelledBy);
			else if (ariaLabel) this._togglerElement.setAttribute("aria-label", ariaLabel);
			else if (nativeLabel) {
				if (!nativeLabel.id) nativeLabel.id = `${this._uniqueId}-label`;
				this._togglerElement.setAttribute("aria-labelledby", nativeLabel.id);
			}
		}
		_getFocusTarget() {
			return this._config.search ? this._searchElement : this._togglerElement;
		}
		_markRequired() {
			if (this._config.required) (this._config.search ? this._searchElement : this._togglerElement).setAttribute("aria-required", "true");
		}
		_createSelect() {
			const wrapper = document.createElement("div");
			wrapper.classList.add(CLASS_NAME_SELECT);
			this._element.classList.toggle(CLASS_NAME_DISABLED, this._disabled);
			for (const className of this._element.classList) if (className !== CLASS_NAME_IS_INVALID && className !== CLASS_NAME_IS_VALID) wrapper.classList.add(className);
			this._wrapperElement = wrapper;
			this._element.parentNode.insertBefore(wrapper, this._element);
			wrapper.prepend(this._element);
			this._uniqueId = this._config.id || this._hostAttributes.get("id") || (0, js_src_util_index_js.getUID)(`${this.constructor.NAME}`);
			this._createSelection();
			this._createButtons();
			if (this._config.search) {
				this._createSearchInput();
				this._updateSearch();
			}
			this._uniqueName = this._config.name || this._hostAttributes.get("name");
			this._element.setAttribute("id", this._uniqueId);
			if (this._uniqueName) this._element.setAttribute("name", this._uniqueName);
			this._wireTogglerAccessibleName();
			this._markRequired();
			this._validation.refresh();
			this._createOptionsContainer();
			this._hideNativeSelect();
			this._render();
		}
		_createSelection() {
			const togglerEl = this._wrapperElement;
			togglerEl.classList.add(CLASS_NAME_INPUT_GROUP);
			togglerEl.setAttribute("role", "combobox");
			togglerEl.setAttribute("aria-expanded", "false");
			togglerEl.setAttribute("aria-haspopup", "dialog");
			this._togglerElement = togglerEl;
			if (this._disabled) {
				togglerEl.classList.add(CLASS_NAME_DISABLED);
				togglerEl.setAttribute("aria-disabled", "true");
			}
			if (!this._config.search && !this._disabled) togglerEl.tabIndex = 0;
			const selectionEl = document.createElement("div");
			selectionEl.classList.add(CLASS_NAME_SELECTION);
			if (this._config.multiple && ["chips", "tags"].includes(this._config.selectionType)) selectionEl.classList.add(CLASS_NAME_SELECTION_CHIPS);
			togglerEl.append(selectionEl);
			this._updateSelection();
			this._selectionElement = selectionEl;
			if (this._config.multiple && ["chips", "tags"].includes(this._config.selectionType)) this._selectionChipSet = new MultiSelectChipSet(selectionEl, {
				removable: !this._disabled,
				typeahead: false
			});
		}
		_createButtons() {
			this._indicatorElement = null;
			if (this._config.pickerIcon) {
				const indicator = document.createElement("button");
				indicator.type = "button";
				indicator.classList.add("form-control-action");
				indicator.disabled = this._disabled;
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
			if (this._disabled) input.disabled = true;
			input.setAttribute("id", `search-${this._uniqueId}`);
			input.autocomplete = "off";
			input.setAttribute("aria-label", this._config.ariaSearchLabel);
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
			this._menu.id = (0, js_src_util_index_js.getUID)(`${this.constructor.NAME}-dialog-`);
			this._menu.setAttribute("role", "dialog");
			this._menu.setAttribute("tabindex", "-1");
			this._nameMenu();
			if (!this._config.search) this._menu.setAttribute("aria-modal", "true");
			this._updateHeader();
			this._updateMasterCheckbox();
		}
		_nameMenu() {
			const labelledBy = this._togglerElement.getAttribute("aria-labelledby");
			if (labelledBy) {
				this._menu.setAttribute("aria-labelledby", labelledBy);
				return;
			}
			const label = this._togglerElement.getAttribute("aria-label");
			if (label) {
				this._menu.setAttribute("aria-label", label);
				return;
			}
			this._togglerElement.id ||= (0, js_src_util_index_js.getUID)(`${this.constructor.NAME}-toggler-`);
			this._menu.setAttribute("aria-labelledby", this._togglerElement.id);
		}
		_routesTypingToSearch() {
			return Boolean(this._config.search && this._config.globalSearch);
		}
		_getListBoxConfig() {
			return {
				...super._getListBoxConfig(),
				indicator: this._config.indicator,
				sectionsSelectable: this._config.optionsGroupsSelectable,
				selectionLimit: this._config.selectionLimit,
				selectionMode: this._config.multiple ? "multiple" : "single",
				loading: this._loading,
				loadingLabel: this._config.loadingLabel,
				typeahead: !this._routesTypingToSearch() && this._config.search !== "external"
			};
		}
		_getActiveDescendantField() {
			return null;
		}
		_getPanelReferences() {
			const references = [[this._togglerElement, this._menu.id]];
			if (this._searchElement) references.push([this._searchElement, this._optionsElement.id]);
			return references;
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
				ariaRemoveLabel: this._config.ariaTagDeleteLabel ?? this._config.ariaChipRemoveLabel,
				disabled: disabled === true,
				removable: !this._disabled && disabled !== true
			});
			return chip;
		}
		_updateChips(selection, search) {
			const placeholder = js_src_dom_selector_engine_js.default.findOne(".multi-select-placeholder", selection);
			if (placeholder) placeholder.remove();
			const chips = /* @__PURE__ */ new Map();
			let focused;
			const selected = this._selectedOptions();
			for (const chip of js_src_dom_selector_engine_js.default.children(selection, SELECTOR_CHIP)) {
				const option = selected.find((option) => option.value === chip.dataset.value);
				if (option && chip.firstChild?.textContent === option.text && Boolean(js_src_dom_selector_engine_js.default.findOne(SELECTOR_CHIP_REMOVE, chip)) === (!this._disabled && option.disabled !== true)) {
					chips.set(option.value, chip);
					continue;
				}
				if ((0, js_src_util_focus_js.containsFocus)(chip)) focused = chip.dataset.value;
				js_src_chip_js.default.getInstance(chip)?.dispose();
				chip.remove();
			}
			const stop = [...chips.values()].find((chip) => chip.tabIndex === 0);
			let next = search?.parentElement === selection ? search : null;
			for (const option of selected.toReversed()) {
				const chip = chips.get(option.value) ?? this._createChip(option.value, option.text, option.disabled);
				if (chip.parentElement !== selection || chip.nextElementSibling !== next) {
					if (next) next.before(chip);
					else selection.append(chip);
				}
				if (option.value === focused) chip.focus();
				next = chip;
			}
			this._selectionChipSet?._moveTabStop(stop);
		}
		_onSelectionChange() {
			this._validation.runAsUser(() => this._settle(true));
			if (!this._config) return;
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
			this._updateSearchSize();
		}
		_onSelectionLimit() {
			this._triggerSelectionLimit();
		}
		_lockedValues() {
			return new Set([...this._listedOptions()].filter(([, option]) => option.disabled).map(([value]) => value));
		}
		_listedOptions() {
			return new Map((0, js_src_util_option_tree_js.flattenOptions)(this._options).toReversed().map((option) => [String(option.value), option]));
		}
		_enabledOptions(options, locked = this._lockedValues()) {
			return options.filter((option) => !option.disabled && !locked.has(String(option.value))).flatMap((option) => (0, js_src_util_option_tree_js.isOptionGroup)(option) ? this._enabledOptions(option.options, locked) : [option]);
		}
		_selectUpToLimit(options) {
			const given = new Map(options.toReversed().map((option) => [String(option.value), option]));
			const { added, refused } = (0, js_src_util_selection_state_js.fillSelection)(this._config.multiple ? this._store.values() : [], options.map((option) => String(option.value)), this._selectionLimit());
			for (const value of added) this._known.set(value, this._describe(given.get(value)));
			this._commit([...this._store.values(), ...added]);
			if (this._config && refused !== null) this._triggerSelectionLimit();
		}
		_getDisplayedItems() {
			return this._takeable(this._getDisplayedOptions());
		}
		_takeable(elements) {
			const locked = this._lockedValues();
			return elements.filter((element) => !element.classList.contains(CLASS_NAME_DISABLED) && !locked.has(String(element.dataset.coreuiValue)));
		}
		_getTotalCount() {
			if (typeof this._total === "number") return this._total;
			const values = new Set((0, js_src_util_option_tree_js.flattenOptions)(this._options).map((option) => String(option.value)));
			return values.size + this._store.values().filter((value) => !values.has(value)).length;
		}
		_deselectOption(value) {
			this._commit(this._store.values().filter((selected) => selected !== String(value)));
		}
		_deselectLastOption() {
			const last = this._selectedOptions().findLast((option) => option.disabled !== true);
			if (last) this._removeAsUser(() => this._deselectOption(last.value));
		}
		_getChips() {
			return this._selectionChipSet?._getFocusableChips() ?? [];
		}
		_handleSearchToChips(event) {
			const removing = event.key === BACKSPACE_KEY || event.key === DELETE_KEY;
			const arrow = event.key === ARROW_LEFT_KEY || event.key === ARROW_RIGHT_KEY;
			if (!removing && !arrow || event.isComposing || event.shiftKey || (0, js_src_util_calendar_js.hasShortcutModifier)(event)) return false;
			const field = event.target;
			const towardChips = (0, js_src_util_index_js.isRTL)(this._wrapperElement) ? ARROW_RIGHT_KEY : ARROW_LEFT_KEY;
			const last = (removing ? field.value.length === 0 : event.key === towardChips && field.selectionStart === 0 && field.selectionEnd === 0) ? this._getChips().at(-1) : void 0;
			if (!last) return false;
			event.preventDefault();
			this.hide();
			last.focus();
			return true;
		}
		_removeAsUser(remove) {
			const before = this._selectedOptions();
			this._validation.runAsUser(remove);
			const after = new Set(this._store.values());
			const removed = before.filter((option) => !after.has(String(option.value))).map((option) => option.text);
			const message = (0, js_src_util_chip_values_js.getChipAnnouncement)(removed, [], this._config.ariaRemovedAnnouncement, this._config.ariaRemovedAnnouncement);
			if (message) (0, js_src_util_announce_js.announce)(message, { context: this._wrapperElement });
		}
		_fit(values) {
			if (!this._config.multiple) return values.slice(-1);
			const unique = [...new Set(values)];
			return unique.slice(0, this._selectionLimit() ?? unique.length);
		}
		_markedValues() {
			return (0, js_src_util_option_tree_js.flattenOptions)(this._options).filter((option) => option.selected).map((option) => String(option.value));
		}
		_describe(option) {
			return {
				text: option.text,
				...option.disabled && { disabled: true }
			};
		}
		_selectedOptions() {
			return this._store.values().map((value) => ({
				value,
				...this._known.get(value)
			}));
		}
		_commit(values, notify = true) {
			const previous = new Set(this._store.values());
			this._commitSelection(values);
			this._settle(this._store.size() !== previous.size || this._store.values().some((value) => !previous.has(value)), notify);
		}
		_settle(changed, notify = true) {
			const element = this._element;
			if (changed) this._validation.change();
			this._render();
			if (changed && notify) {
				js_src_dom_event_handler_js.default.trigger(element, EVENT_CHANGE, { value: this._selectedOptions() });
				element.dispatchEvent(new Event("input", { bubbles: true }));
				element.dispatchEvent(new Event("change", { bubbles: true }));
			}
		}
		_render() {
			const options = this._listedOptions();
			for (const value of this._store.values()) {
				const listed = options.get(value);
				if (listed) this._known.set(value, this._describe(listed));
			}
			this._syncNativeSelection(options);
			this._validation.userAction = false;
			this._updateSelection();
			this._updateSelectionCleaner();
			this._updateSearch();
			this._updateSearchSize();
			this._updateHeader();
			this._updateMasterCheckbox();
			this._validation.update();
		}
		_syncNativeSelection(options) {
			for (const option of this._offListOptions) option.remove();
			this._offListOptions = this._selectedOptions().filter((option) => !options.has(option.value)).map((option) => Object.assign(new Option(option.text, option.value), {
				disabled: option.disabled === true,
				hidden: true
			}));
			this._element.append(...this._offListOptions);
			if (!this._config.multiple) {
				this._element.value = this._store.values()[0] ?? "";
				return;
			}
			for (const option of js_src_dom_selector_engine_js.default.find("option", this._element)) option.selected = this._store.has(option.value);
		}
		_restoreSelection() {
			this._onSearchChange(this._searchElement);
			for (const { value, ...option } of this._initialSelection) this._known.set(value, option);
			this._commit(this._initialSelection.map((option) => option.value));
		}
		_updateSelection() {
			const selection = js_src_dom_selector_engine_js.default.findOne(SELECTOR_SELECTION, this._wrapperElement);
			const search = js_src_dom_selector_engine_js.default.findOne(SELECTOR_SEARCH, this._wrapperElement);
			this._wrapperElement.classList.toggle(CLASS_NAME_SELECT_FILLED, this._store.size() > 0);
			if (this._store.size() === 0 && !this._config.search) {
				this._renderEmptySelection(selection);
				return;
			}
			if (this._config.multiple && this._config.selectionType === "counter" && !this._config.search) selection.textContent = (0, js_src_util_selection_state_js.resolveCountLabel)(this._config.selectedLabel, this._store.size(), this._getTotalCount());
			if (this._config.multiple && ["chips", "tags"].includes(this._config.selectionType)) this._updateChips(selection, search);
			if (this._config.multiple && this._config.selectionType === "text") {
				while (selection.firstChild && selection.firstChild !== search) selection.firstChild.remove();
				selection.prepend(...this._selectedOptions().map((option, index) => {
					const span = document.createElement("span");
					span.textContent = `${option.text}${index === this._store.size() - 1 ? "" : ","}\u00A0`;
					return span;
				}));
			}
			if (!this._config.multiple && this._store.size() > 0 && !this._config.search) selection.textContent = this._selectedOptions()[0].text;
			if (search && selection.lastElementChild !== search) selection.append(search);
			if (this._floatingCleanup) this._updateFloatingPosition();
		}
		_renderEmptySelection(selection) {
			const placeholder = document.createElement("span");
			placeholder.classList.add("multi-select-placeholder");
			placeholder.textContent = this._config.placeholder;
			for (const chip of js_src_dom_selector_engine_js.default.find(SELECTOR_CHIP, selection)) js_src_chip_js.default.getInstance(chip)?.dispose();
			selection.replaceChildren(placeholder);
		}
		_disposeSelection() {
			if (!this._selectionElement) return;
			for (const chip of js_src_dom_selector_engine_js.default.find(SELECTOR_CHIP, this._selectionElement)) js_src_chip_js.default.getInstance(chip)?.dispose();
			this._selectionChipSet?.dispose();
			this._selectionChipSet = null;
			js_src_dom_event_handler_js.default.off(this._selectionElement, js_src_chip_js.default.EVENT_KEY);
		}
		_updateSelectionCleaner() {
			if (!this._config.cleaner) return;
			if (this._store.size() > 0 && !this._disabled && this._selectionCleanerElement === null) {
				const selectionCleaner = this._createSelectionCleaner();
				if (this._indicatorElement) this._indicatorElement.before(selectionCleaner);
				else this._togglerElement.append(selectionCleaner);
				this._selectionCleanerElement = selectionCleaner;
				return;
			}
			if ((this._store.size() === 0 || this._disabled) && this._selectionCleanerElement !== null) {
				this._selectionCleanerElement.remove();
				this._selectionCleanerElement = null;
			}
		}
		_updateSearch() {
			if (!this._config.search) return;
			if (this._store.size() === 0) this._searchElement.placeholder = this._config.placeholder;
			else if (!this._config.multiple) this._searchElement.placeholder = this._selectedOptions()[0].text;
			else if (this._config.selectionType === "counter") this._searchElement.placeholder = (0, js_src_util_selection_state_js.resolveCountLabel)(this._config.selectedLabel, this._store.size(), this._getTotalCount());
			else this._searchElement.removeAttribute("placeholder");
		}
		_updateSearchSize(size = Math.max(2, (this._searchElement?.value.length ?? 0) + 1)) {
			if (!this._searchElement || !this._config.multiple || ![
				"chips",
				"tags",
				"text"
			].includes(this._config.selectionType)) return;
			if (this._store.size() > 0) this._searchElement.size = size;
			else this._searchElement.removeAttribute("size");
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
			return this._getSelectAllState() === "all";
		}
		_getSelectAllState() {
			const scope = this._config.selectAllMode === "filtered" ? this._getDisplayedItems() : this._getSelectableElements();
			const selected = scope.filter((element) => element.classList.contains(CLASS_NAME_SELECTED)).length;
			return (0, js_src_util_selection_state_js.getScopeSelectionState)(selected, scope.length, this._store.size(), this._selectionLimit());
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
				else this.deselectAll(this._options);
				return;
			}
			if (filteredMode) this.selectFiltered();
			else this.selectAll();
		}
		_updateMasterCheckbox() {
			if (!this._selectAllElement) return;
			const state = this._getSelectAllState();
			this._selectAllElement.classList.toggle(CLASS_NAME_SELECTED, state === "all");
			this._selectAllElement.classList.toggle(CLASS_NAME_INDETERMINATE, state === "some");
			this._selectAllElement.setAttribute("aria-pressed", (0, js_src_util_selection_state_js.getAriaPressed)(state));
		}
		_renderHeader() {
			if (!this._headerElement || typeof this._config.headerTemplate !== "function") return;
			const result = this._config.headerTemplate(this._getSelectionState(), this._getSelectionActions());
			if (result instanceof Node) this._headerElement.replaceChildren(result);
			else this._headerElement.innerHTML = (0, js_src_util_sanitizer_js.sanitizeByConfig)(result, this._config);
		}
		_getSelectableElements() {
			return this._takeable(js_src_dom_selector_engine_js.default.find(SELECTOR_OPTION, this._optionsElement));
		}
		_getSelectionState() {
			const allItems = this._getSelectableElements();
			const filteredItems = allItems.filter((element) => this._isOptionDisplayed(element));
			return {
				selected: this._store.size(),
				total: allItems.length,
				filtered: filteredItems.length,
				filteredSelected: filteredItems.filter((element) => element.classList.contains(CLASS_NAME_SELECTED)).length
			};
		}
		_getSelectionActions() {
			return {
				selectAll: () => this._validation.runAsUser(() => this.selectAll()),
				deselectAll: () => this._validation.runAsUser(() => this.deselectAll()),
				selectFiltered: () => this._validation.runAsUser(() => this.selectFiltered()),
				deselectFiltered: () => this._validation.runAsUser(() => this.deselectFiltered())
			};
		}
		_filterQuery() {
			return this._config.search === "external" ? null : super._filterQuery();
		}
		_onSearchChange(element) {
			if (element) {
				this.search(element.value);
				this._updateSearchSize(element.value.length + 1);
			}
		}
		_selectionLimit() {
			return (0, js_src_util_selection_state_js.getSelectionLimit)(this._config.multiple, this._config.selectionLimit);
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
			if (typeof config.search === "string" && config.search !== "external") throw new TypeError(`${NAME.toUpperCase()}: Option "search" takes true, false or "external".`);
			config.value = this._normalizeValue(config.value);
			return config;
		}
		_normalizeValue(value) {
			if (typeof value === "number" || typeof value === "string") return value === "" ? null : String(value).split(/,\s*/);
			return Array.isArray(value) ? value.map(String) : value;
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
			for (const select of selects) {
				const context = js_src_dom_data_js.default.get(select, DATA_KEY);
				if (!context) continue;
				if (!context._wrapperElement.classList.contains(CLASS_NAME_SHOW)) continue;
				if (context._wrapperElement.contains(event.target) || context._menu.contains(event.target)) continue;
				context.hide();
				js_src_dom_event_handler_js.default.trigger(context._element, EVENT_HIDDEN);
			}
		}
	};
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const multiSelect of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_MULTI_SELECT)) MultiSelect.multiSelectInterface(multiSelect);
	});
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, MultiSelect.clearMenus);
	js_src_dom_event_handler_js.default.on(document, EVENT_KEYUP_DATA_API, MultiSelect.clearMenus);
	(0, js_src_util_index_js.defineJQueryPlugin)(MultiSelect);
	//#endregion
	return MultiSelect;
});

//# sourceMappingURL=multi-select.js.map
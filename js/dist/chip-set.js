/*!
* CoreUI PRO chip-set.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./chip.js"), require("./dom/event-handler.js"), require("./dom/manipulator.js"), require("./dom/selector-engine.js"), require("./util/icons.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./chip.js",
		"./dom/event-handler.js",
		"./dom/manipulator.js",
		"./dom/selector-engine.js",
		"./util/icons.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.ChipSet = factory(global.BaseComponent, global.Chip, global.EventHandler, global.Manipulator, global.SelectorEngine, global.Icons, global.Index));
})(this, function(js_src_base_component_js, js_src_chip_js, js_src_dom_event_handler_js, js_src_dom_manipulator_js, js_src_dom_selector_engine_js, js_src_util_icons_js, js_src_util_index_js) {
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
	js_src_chip_js = __toESM(js_src_chip_js);
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_dom_manipulator_js = __toESM(js_src_dom_manipulator_js);
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	//#region js/src/chip-set.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI chip-set.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "chip-set";
	const EVENT_KEY = `.coreui.chip-set`;
	const DATA_API_KEY = ".data-api";
	const EVENT_ADD = "add";
	const EVENT_REMOVE = "remove";
	const EVENT_CHANGE = "change";
	const EVENT_SELECT = "select";
	const EVENT_CLICK = "click";
	const EVENT_KEYDOWN = "keydown";
	const A_KEY = "a";
	const ARROW_LEFT_KEY = "ArrowLeft";
	const ARROW_RIGHT_KEY = "ArrowRight";
	const END_KEY = "End";
	const HOME_KEY = "Home";
	const SPACE_KEY = " ";
	const TYPEAHEAD_TIMEOUT = 500;
	const EVENT_CHIP_SELECTED = "selected.coreui.chip";
	const EVENT_CHIP_DESELECTED = "deselected.coreui.chip";
	const EVENT_CHIP_REMOVE = "remove.coreui.chip";
	const EVENT_CHIP_REMOVED = "removed.coreui.chip";
	const SELECTOR_DATA_CHIP_SET = "[data-coreui-chip-set]";
	const SELECTOR_CHIP = ".chip";
	const SELECTOR_CHIP_ACTIVE = `${SELECTOR_CHIP}.active`;
	const SELECTOR_CHIP_REMOVE = ".chip-remove";
	const SELECTOR_FOCUSABLE_ITEMS = ".chip:not(.disabled)";
	const CLASS_NAME_CHIP = "chip";
	const CLASS_NAME_DISABLED = "disabled";
	const SELECTION_MODE_SINGLE = "single";
	const Default = {
		ariaAddedAnnouncement: "added",
		ariaRemoveLabel: "Remove",
		ariaRemovedAnnouncement: "removed",
		chipClassName: null,
		disabled: false,
		filter: false,
		maxChips: null,
		removable: false,
		removeIcon: js_src_util_icons_js.REMOVE_ICON,
		selectable: false,
		selectedIcon: js_src_util_icons_js.CHECK_ICON,
		selectionMode: "multiple",
		typeahead: true,
		unique: false
	};
	const DefaultType = {
		ariaAddedAnnouncement: "string",
		ariaRemoveLabel: "string",
		ariaRemovedAnnouncement: "string",
		chipClassName: "(string|function|null)",
		disabled: "boolean",
		filter: "boolean",
		maxChips: "(number|null)",
		removable: "boolean",
		removeIcon: "string",
		selectable: "boolean",
		selectedIcon: "string",
		selectionMode: "string",
		typeahead: "boolean",
		unique: "boolean"
	};
	/**
	* Class definition
	*/
	var ChipSet = class ChipSet extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element, config);
			this._disabled = this._config.disabled || this._element.classList.contains(CLASS_NAME_DISABLED);
			this._pendingFocus = null;
			this._chips = [];
			this._liveRegion = null;
			this._anchor = null;
			this._search = "";
			this._searchTimeout = null;
			this._applyAccessibilityRoles();
			this._initChips();
			this._createLiveRegion();
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
		add(chip) {
			if (!this._canModify()) return null;
			const isElement = typeof chip !== "string";
			const value = isElement ? this._getChipValue(chip) : String(chip).trim();
			if (!value) return null;
			if (this._config.unique && this._chips.includes(value)) return null;
			if (this._config.maxChips !== null && this._chips.length >= this._config.maxChips) return null;
			if (js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_ADD), {
				value,
				relatedTarget: this._input ?? null
			}).defaultPrevented) return null;
			const element = isElement ? chip : this._createChip(value);
			this._appendChip(element);
			this._setupChip(element);
			this._chips.push(value);
			this._announce(`${value} ${this._config.ariaAddedAnnouncement}`);
			js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_CHANGE), { value: this.getValues() });
			return element;
		}
		remove(chipOrValue) {
			if (!this._canModify()) return false;
			let chip;
			let value;
			if (typeof chipOrValue === "string") {
				value = chipOrValue;
				chip = this._findChipByValue(value);
			} else {
				chip = chipOrValue;
				value = this._getChipValue(chip);
			}
			if (!chip || !value) return false;
			if (js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_REMOVE), {
				value,
				chip,
				relatedTarget: this._input ?? null
			}).defaultPrevented) return false;
			const instance = js_src_chip_js.default.getInstance(chip);
			if (instance) instance.remove();
			else {
				chip.remove();
				this._handleChipRemoval(chip, value);
			}
			return !chip.isConnected;
		}
		removeSelected() {
			for (const chip of this._getSelectedChipElements()) this.remove(chip);
		}
		clear() {
			for (const chip of this._getChipElements()) this.remove(chip);
		}
		selectChip(chip) {
			if (!this._getChipElements().includes(chip)) return;
			js_src_chip_js.default.getInstance(chip)?.select();
		}
		selectAll() {
			if (!this._config.selectable) return;
			for (const chip of this._getChipElements()) js_src_chip_js.default.getInstance(chip)?.select();
		}
		deselectAll() {
			for (const chip of this._getSelectedChipElements()) js_src_chip_js.default.getInstance(chip)?.deselect();
		}
		clearSelection() {
			this.deselectAll();
			js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_SELECT), { selected: this.getSelectedValues() });
		}
		getValues() {
			return [...this._chips];
		}
		getSelectedValues() {
			return this._getSelectedChipElements().map((chip) => this._getChipValue(chip));
		}
		dispose() {
			js_src_dom_event_handler_js.default.off(this._element, js_src_chip_js.default.EVENT_KEY);
			if (this._searchTimeout) clearTimeout(this._searchTimeout);
			if (this._liveRegion) {
				this._liveRegion.remove();
				this._liveRegion = null;
			}
			super.dispose();
		}
		_configAfterMerge(config) {
			if (config.filter) config.selectable = true;
			return config;
		}
		_canModify() {
			return !this._disabled;
		}
		_appendChip(chip) {
			this._element.append(chip);
		}
		_getChipElements() {
			return js_src_dom_selector_engine_js.default.find(SELECTOR_CHIP, this._element);
		}
		_getSelectedChipElements() {
			return js_src_dom_selector_engine_js.default.find(SELECTOR_CHIP_ACTIVE, this._element);
		}
		_findChipByValue(value) {
			return this._getChipElements().find((chip) => this._getChipValue(chip) === value);
		}
		_getChipValue(chip) {
			if (chip.dataset.coreuiChipValue) return chip.dataset.coreuiChipValue;
			const clone = chip.cloneNode(true);
			const remove = js_src_dom_selector_engine_js.default.findOne(SELECTOR_CHIP_REMOVE, clone);
			if (remove) remove.remove();
			return clone.textContent?.trim() || "";
		}
		_getFocusableChips() {
			return js_src_dom_selector_engine_js.default.find(SELECTOR_FOCUSABLE_ITEMS, this._element);
		}
		_initChips() {
			for (const chip of this._getChipElements()) {
				const value = this._getChipValue(chip);
				if (value) {
					this._chips.push(value);
					this._applyChipClassName(chip, value);
				}
				this._setupChip(chip);
			}
		}
		_applyAccessibilityRoles() {
			if (!this._element.hasAttribute("role")) this._element.setAttribute("role", this._config.selectable ? "listbox" : "group");
			if (this._config.selectable && this._element.getAttribute("role") === "listbox") {
				this._element.setAttribute("aria-orientation", "horizontal");
				if (this._config.selectionMode === "multiple") this._element.setAttribute("aria-multiselectable", "true");
			}
		}
		_createLiveRegion() {
			const region = document.createElement("span");
			region.classList.add("visually-hidden");
			region.setAttribute("role", "status");
			this._element.after(region);
			this._liveRegion = region;
		}
		_announce(message) {
			if (this._liveRegion) this._liveRegion.textContent = message;
		}
		_setupChip(chip) {
			if (this._element.getAttribute("role") === "listbox" && !chip.hasAttribute("role")) chip.setAttribute("role", "option");
			js_src_chip_js.default.getOrCreateInstance(chip, this._getChipConfig(chip));
		}
		_getChipConfig(chip) {
			return {
				ariaRemoveLabel: this._config.ariaRemoveLabel,
				disabled: this._disabled,
				filter: this._config.filter,
				removable: this._config.removable,
				removeIcon: this._config.removeIcon,
				selectable: this._config.selectable,
				selectedIcon: this._config.selectedIcon,
				...js_src_dom_manipulator_js.default.getDataAttributes(chip)
			};
		}
		_createChip(value) {
			const chip = document.createElement("span");
			chip.className = CLASS_NAME_CHIP;
			chip.dataset.coreuiChipValue = value;
			chip.append(document.createTextNode(value));
			this._applyChipClassName(chip, value);
			return chip;
		}
		_applyChipClassName(chip, value) {
			const className = this._resolveChipClassName(value);
			if (!className) return;
			chip.classList.add(...className.split(/\s+/).filter(Boolean));
		}
		_resolveChipClassName(value) {
			const { chipClassName } = this._config;
			if (!chipClassName) return "";
			if (typeof chipClassName === "function") {
				const resolvedClassName = chipClassName(value);
				return typeof resolvedClassName === "string" ? resolvedClassName : "";
			}
			return typeof chipClassName === "string" ? chipClassName : "";
		}
		_addEventListeners() {
			js_src_dom_event_handler_js.default.on(this._element, this.constructor.eventName(EVENT_KEYDOWN), SELECTOR_CHIP, (event) => this._handleKeydown(event));
			js_src_dom_event_handler_js.default.on(this._element, this.constructor.eventName(EVENT_CLICK), SELECTOR_CHIP, (event) => this._handleClick(event));
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CHIP_SELECTED, SELECTOR_CHIP, (event) => this._handleSelectionChange(event));
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CHIP_DESELECTED, SELECTOR_CHIP, (event) => this._handleSelectionChange(event));
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CHIP_REMOVE, SELECTOR_CHIP, (event) => this._handleChipRemove(event));
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CHIP_REMOVED, SELECTOR_CHIP, (event) => this._handleChipRemoved(event));
		}
		_handleKeydown(event) {
			const chip = event.target.closest(SELECTOR_CHIP);
			if (!chip || chip.classList.contains(CLASS_NAME_DISABLED)) return;
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === A_KEY) {
				if (this._selectsRange()) {
					event.preventDefault();
					this.selectAll();
				}
				return;
			}
			const rtl = (0, js_src_util_index_js.isRTL)(this._element);
			switch (event.key) {
				case ARROW_LEFT_KEY:
					event.preventDefault();
					this._moveFocus(this._focusSibling(chip, rtl), event.shiftKey);
					break;
				case ARROW_RIGHT_KEY:
					event.preventDefault();
					this._moveFocus(this._focusSibling(chip, !rtl), event.shiftKey);
					break;
				case HOME_KEY:
					event.preventDefault();
					this._moveFocus(this._navigateToEdge(0), event.shiftKey);
					break;
				case END_KEY:
					event.preventDefault();
					this._moveFocus(this._navigateToEdge(-1), event.shiftKey);
					break;
				default: this._typeahead(event.key);
			}
		}
		_handleClick(event) {
			const chip = event.target.closest(SELECTOR_CHIP);
			if (!chip || chip.classList.contains(CLASS_NAME_DISABLED) || event.target.closest(SELECTOR_CHIP_REMOVE)) return;
			if (event.shiftKey && this._selectsRange()) {
				this._selectRange(this._anchor ?? chip, chip);
				return;
			}
			this._anchor = chip;
		}
		_selectsRange() {
			return this._config.selectable && this._config.selectionMode !== SELECTION_MODE_SINGLE;
		}
		_moveFocus(target, extend) {
			if (!target) return;
			if (extend && this._selectsRange()) {
				this._selectRange(this._anchor ?? target, target);
				return;
			}
			this._anchor = target;
		}
		_selectRange(from, to) {
			const chips = this._getFocusableChips();
			const start = chips.indexOf(from);
			const end = chips.indexOf(to);
			if (end === -1) return;
			const first = Math.min(start === -1 ? end : start, end);
			const last = Math.max(start === -1 ? end : start, end);
			for (const chip of chips.slice(first, last + 1)) js_src_chip_js.default.getInstance(chip)?.select();
		}
		_typeahead(key) {
			if (!this._config.typeahead || key.length !== 1 || key === SPACE_KEY) return;
			if (this._searchTimeout) clearTimeout(this._searchTimeout);
			this._search += key.toLowerCase();
			this._searchTimeout = setTimeout(() => {
				this._search = "";
			}, TYPEAHEAD_TIMEOUT);
			const chips = this._getFocusableChips();
			const current = chips.indexOf(document.activeElement);
			const start = this._search.length > 1 ? Math.max(current, 0) : current + 1;
			[...chips.slice(start), ...chips.slice(0, start)].find((chip) => this._getChipValue(chip).toLowerCase().startsWith(this._search))?.focus();
		}
		_focusSibling(chip, shouldGetNext) {
			const chips = this._getFocusableChips();
			if (chips.length === 0) return null;
			const sibling = (0, js_src_util_index_js.getNextActiveElement)(chips, chip, shouldGetNext, false);
			if (sibling && sibling !== chip) {
				sibling.focus();
				return sibling;
			}
			return null;
		}
		_getRemovalNeighbor(chip) {
			const chips = this._getFocusableChips();
			if (chips.length === 0) return null;
			const next = (0, js_src_util_index_js.getNextActiveElement)(chips, chip, true, false);
			if (next && next !== chip) return next;
			const previous = (0, js_src_util_index_js.getNextActiveElement)(chips, chip, false, false);
			return previous && previous !== chip ? previous : null;
		}
		_navigateToEdge(targetIndex) {
			const chips = this._getFocusableChips();
			const target = chips[targetIndex < 0 ? chips.length + targetIndex : targetIndex] ?? null;
			target?.focus();
			return target;
		}
		_handleSelectionChange(event) {
			const chip = event.target.closest(SELECTOR_CHIP);
			if (this._config.selectionMode === SELECTION_MODE_SINGLE && chip?.matches(SELECTOR_CHIP_ACTIVE)) this._enforceSingleSelection(chip);
			js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_SELECT), { selected: this.getSelectedValues() });
		}
		_enforceSingleSelection(selectedChip) {
			for (const chip of this._getSelectedChipElements()) if (chip !== selectedChip) js_src_chip_js.default.getInstance(chip)?.deselect();
		}
		_handleChipRemove(event) {
			const chip = event.target.closest(SELECTOR_CHIP);
			this._pendingFocus = chip ? this._getRemovalNeighbor(chip) : null;
		}
		_handleChipRemoved(event) {
			const chip = event.target.closest(SELECTOR_CHIP);
			this._pendingFocus?.focus();
			this._pendingFocus = null;
			this._handleChipRemoval(chip, this._getChipValue(chip));
		}
		_handleChipRemoval(chip, value) {
			const index = this._chips.indexOf(value);
			if (index !== -1) this._chips.splice(index, 1);
			this._announce(`${value} ${this._config.ariaRemovedAnnouncement}`);
			js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_CHANGE), { value: this.getValues() });
			js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_SELECT), { selected: this.getSelectedValues() });
		}
		static chipSetInterface(element, config, ...args) {
			const data = ChipSet.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config, ...args) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, ChipSet, config, args);
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_CHIP_SET)) ChipSet.chipSetInterface(element);
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(ChipSet);
	//#endregion
	return ChipSet;
});

//# sourceMappingURL=chip-set.js.map
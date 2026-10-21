/*!
* CoreUI PRO chip-set.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./chip.js"), require("./dom/event-handler.js"), require("./dom/manipulator.js"), require("./dom/selector-engine.js"), require("./util/announce.js"), require("./util/chip-values.js"), require("./util/focus.js"), require("./util/icons.js"), require("./util/list-navigation.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./chip.js",
		"./dom/event-handler.js",
		"./dom/manipulator.js",
		"./dom/selector-engine.js",
		"./util/announce.js",
		"./util/chip-values.js",
		"./util/focus.js",
		"./util/icons.js",
		"./util/list-navigation.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.ChipSet = factory(global.BaseComponent, global.Chip, global.EventHandler, global.Manipulator, global.SelectorEngine, global.Announce, global.ChipValues, global.Focus, global.Icons, global.ListNavigation, global.Index));
})(this, function(js_src_base_component_js, js_src_chip_js, js_src_dom_event_handler_js, js_src_dom_manipulator_js, js_src_dom_selector_engine_js, js_src_util_announce_js, js_src_util_chip_values_js, js_src_util_focus_js, js_src_util_icons_js, js_src_util_list_navigation_js, js_src_util_index_js) {
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
	const NAME = "chip-set";
	const EVENT_KEY = `.coreui.chip-set`;
	const DATA_API_KEY = ".data-api";
	const EVENT_ADD = "add";
	const EVENT_REMOVE = "remove";
	const EVENT_CHANGE = "change";
	const EVENT_SELECT = "select";
	const EVENT_CLICK = "click";
	const EVENT_FOCUSIN = "focusin";
	const EVENT_KEYDOWN = "keydown";
	const A_KEY = "a";
	const ARROW_LEFT_KEY = "ArrowLeft";
	const ARROW_RIGHT_KEY = "ArrowRight";
	const END_KEY = "End";
	const HOME_KEY = "Home";
	const EVENT_CHIP_SELECTED = "selected.coreui.chip";
	const EVENT_CHIP_DESELECTED = "deselected.coreui.chip";
	const EVENT_CHIP_REMOVE = "remove.coreui.chip";
	const EVENT_CHIP_REMOVED = "removed.coreui.chip";
	const SELECTOR_DATA_CHIP_SET = "[data-coreui-chip-set]";
	const SELECTOR_CHIP = ".chip";
	const SELECTOR_CHIP_ACTIVE = `${SELECTOR_CHIP}.active`;
	const SELECTOR_CHIP_REMOVE = ".chip-remove";
	const SELECTOR_FOCUSABLE_ITEMS = ".chip[data-coreui-chip-focusable]";
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
		ariaAddedAnnouncement: "(string|function)",
		ariaRemoveLabel: "(string|function)",
		ariaRemovedAnnouncement: "(string|function)",
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
	var ChipSet = class ChipSet extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element, config);
			this._disabled = this._config.disabled;
			this._pendingFocus = null;
			this._chips = [];
			this._ownedChips = /* @__PURE__ */ new Map();
			this._anchor = null;
			this._typeaheadBuffer = (0, js_src_util_list_navigation_js.createTypeaheadBuffer)();
			this._announcedFrom = null;
			this._batch = null;
			this._settled = false;
			this._applyAccessibilityRoles();
			this._initChips();
			this._moveTabStop();
			this._addEventListeners();
			queueMicrotask(() => {
				this._settled = true;
			});
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
			this._moveTabStop();
			this._noteChange();
			this._chips.push(value);
			if (this._batch) this._batch.added = true;
			else this._triggerChange();
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
			this._removeChips(this._getSelectedChipElements());
		}
		clear() {
			this._removeChips(this._getChipElements());
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
			if (!this._element) return;
			js_src_dom_event_handler_js.default.off(this._element, js_src_chip_js.default.EVENT_KEY);
			for (const [chip, instance] of this._ownedChips) if (js_src_chip_js.default.getInstance(chip) === instance && this._element.contains(chip)) instance.dispose();
			if (this._containerRole() === "listbox") for (const chip of this._getChipElements()) chip.removeAttribute("role");
			this._typeaheadBuffer.clear();
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
		_containerRole() {
			return this._config.selectable ? "listbox" : "group";
		}
		_applyAccessibilityRoles() {
			const role = this._containerRole();
			if (!role) return;
			const listbox = role === "listbox";
			this._element.setAttribute("role", role);
			(0, js_src_util_index_js.writeAttribute)(this._element, "aria-orientation", listbox ? "horizontal" : null);
			(0, js_src_util_index_js.writeAttribute)(this._element, "aria-multiselectable", listbox && this._config.selectionMode === "multiple" ? "true" : null);
		}
		_moveTabStop(stop = null) {
			const chips = this._getFocusableChips();
			const current = stop ?? chips.find((chip) => chip.tabIndex === 0) ?? chips[0];
			for (const chip of chips) chip.tabIndex = chip === current ? 0 : -1;
		}
		_noteChange() {
			if (!this._settled || this._announcedFrom) return;
			this._announcedFrom = [...this._chips];
			queueMicrotask(() => this._announceChange());
		}
		_announceChange() {
			const before = this._announcedFrom ?? [];
			this._announcedFrom = null;
			if (!this._element?.isConnected || !this._element.checkVisibility()) return;
			const message = (0, js_src_util_chip_values_js.getChipAnnouncement)(before, this._chips, this._config.ariaAddedAnnouncement, this._config.ariaRemovedAnnouncement);
			if (message) (0, js_src_util_announce_js.announce)(message, { context: this._element });
		}
		_triggerChange() {
			js_src_dom_event_handler_js.default.trigger(this._element, this.constructor.eventName(EVENT_CHANGE), { value: this.getValues() });
		}
		_setupChip(chip) {
			if (!js_src_chip_js.default.getInstance(chip)) {
				if (this._containerRole() === "listbox") chip.setAttribute("role", "option");
				this._ownedChips.set(chip, new js_src_chip_js.default(chip, this._getChipConfig(chip)));
			}
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
			const className = (0, js_src_util_chip_values_js.resolveChipClassName)(this._config.chipClassName, value);
			if (!className) return;
			chip.classList.add(...className.split(/\s+/).filter(Boolean));
		}
		_addEventListeners() {
			js_src_dom_event_handler_js.default.on(this._element, this.constructor.eventName(EVENT_KEYDOWN), SELECTOR_CHIP, (event) => this._handleKeydown(event));
			js_src_dom_event_handler_js.default.on(this._element, this.constructor.eventName(EVENT_CLICK), SELECTOR_CHIP, (event) => this._handleClick(event));
			js_src_dom_event_handler_js.default.on(this._element, this.constructor.eventName(EVENT_FOCUSIN), SELECTOR_CHIP, (event) => this._moveTabStop(event.delegateTarget));
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
			for (const chip of (0, js_src_util_list_navigation_js.rangeBetween)(chips, chips.indexOf(from), chips.indexOf(to))) js_src_chip_js.default.getInstance(chip)?.select();
		}
		_typeahead(key) {
			const text = this._config.typeahead ? this._typeaheadBuffer.push(key) : null;
			if (!text) return;
			const chips = this._getFocusableChips();
			const current = chips.indexOf(document.activeElement);
			(0, js_src_util_list_navigation_js.findTypeaheadMatch)(chips, current, text, (chip) => this._getChipValue(chip))?.focus();
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
		_getRemovalFocusTarget(chip) {
			return (0, js_src_util_list_navigation_js.getRemovalNeighbor)(this._getFocusableChips(), chip) ?? this._getRemovalFallback();
		}
		_getRemovalFallback() {
			return this._element;
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
			this._pendingFocus = chip ? this._getRemovalFocusTarget(chip) : null;
		}
		_handleChipRemoved(event) {
			const chip = event.target.closest(SELECTOR_CHIP);
			const target = this._pendingFocus;
			this._pendingFocus = null;
			if (target && (0, js_src_util_focus_js.containsFocus)(chip)) {
				if (target === this._element) (0, js_src_util_focus_js.focusWithTemporaryTabindex)(this._element);
				else target.focus();
			}
			this._handleChipRemoval(chip, this._getChipValue(chip));
		}
		_handleChipRemoval(chip, value) {
			this._ownedChips.delete(chip);
			this._moveTabStop();
			const index = this._chips.indexOf(value);
			if (index !== -1) {
				this._noteChange();
				this._chips.splice(index, 1);
			}
			if (this._batch) this._batch.removed = true;
			else this._reportRemoval();
		}
		_removeChips(chips) {
			const outer = !this._batch;
			const batch = this._batch ?? {
				added: false,
				removed: false
			};
			this._batch = batch;
			try {
				for (const chip of chips) if (this._element.contains(chip)) this.remove(chip);
			} finally {
				if (outer) {
					this._batch = null;
					if (batch.removed) this._reportRemoval();
					else if (batch.added) this._triggerChange();
				}
			}
		}
		_reportRemoval() {
			this._triggerChange();
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
	js_src_dom_event_handler_js.default.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_CHIP_SET)) ChipSet.chipSetInterface(element);
	});
	(0, js_src_util_index_js.defineJQueryPlugin)(ChipSet);
	//#endregion
	return ChipSet;
});

//# sourceMappingURL=chip-set.js.map
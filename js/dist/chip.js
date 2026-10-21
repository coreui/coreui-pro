/*!
* CoreUI PRO chip.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/sanitizer.js"), require("./util/chip-values.js"), require("./util/icons.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/sanitizer.js",
		"./util/chip-values.js",
		"./util/icons.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Chip = factory(global.BaseComponent, global.EventHandler, global.SelectorEngine, global.Sanitizer, global.ChipValues, global.Icons, global.Index));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_sanitizer_js, js_src_util_chip_values_js, js_src_util_icons_js, js_src_util_index_js) {
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
	//#region js/src/chip.ts
	const NAME = "chip";
	const EVENT_KEY = `.coreui.chip`;
	const DATA_API_KEY = ".data-api";
	const EVENT_REMOVE = `remove${EVENT_KEY}`;
	const EVENT_REMOVED = `removed${EVENT_KEY}`;
	const EVENT_SELECT = `select${EVENT_KEY}`;
	const EVENT_SELECTED = `selected${EVENT_KEY}`;
	const EVENT_DESELECT = `deselect${EVENT_KEY}`;
	const EVENT_DESELECTED = `deselected${EVENT_KEY}`;
	const EVENT_CLICK = `click${EVENT_KEY}`;
	const EVENT_KEYDOWN = `keydown${EVENT_KEY}`;
	const SELECTOR_CHIP_CHECK = ".chip-check";
	const SELECTOR_CHIP_REMOVE = ".chip-remove";
	const SELECTOR_DATA_CHIP = "[data-coreui-chip]";
	const CLASS_NAME_CHIP_CHECK = "chip-check";
	const CLASS_NAME_CHIP_CLICKABLE = "chip-clickable";
	const CLASS_NAME_CHIP_REMOVE = "chip-remove";
	const CLASS_NAME_ACTIVE = "active";
	const CLASS_NAME_DISABLED = "disabled";
	const Default = {
		allowList: js_src_util_sanitizer_js.SVGAllowlist,
		ariaRemoveLabel: "Remove",
		disabled: false,
		filter: false,
		removable: false,
		removeIcon: js_src_util_icons_js.REMOVE_ICON,
		sanitize: true,
		sanitizeFn: null,
		selectable: false,
		selected: false,
		selectedIcon: js_src_util_icons_js.CHECK_ICON
	};
	const DefaultType = {
		allowList: "object",
		ariaRemoveLabel: "(string|function)",
		disabled: "boolean",
		filter: "boolean",
		removable: "boolean",
		removeIcon: "string",
		sanitize: "boolean",
		sanitizeFn: "(null|function)",
		selectable: "boolean",
		selected: "boolean",
		selectedIcon: "string"
	};
	var Chip = class Chip extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element, config);
			this._checkIcon = null;
			this._disabled = this._config.disabled;
			this._removeControl = null;
			this._selected = this._config.selected;
			this._applyRole();
			this._ensureRemoveControl();
			this._applyState();
			this._makeFocusable();
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
		remove() {
			if (js_src_dom_event_handler_js.default.trigger(this._element, EVENT_REMOVE).defaultPrevented) return;
			this._destroyElement();
		}
		toggle() {
			if (!this._config.selectable) return;
			if (this._selected) {
				this.deselect();
				return;
			}
			this.select();
		}
		select() {
			if (!this._config.selectable) return;
			if (this._selected) return;
			if (js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SELECT).defaultPrevented) return;
			this._selected = true;
			this._applyState();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SELECTED);
		}
		deselect() {
			if (!this._config.selectable) return;
			if (!this._selected) return;
			if (js_src_dom_event_handler_js.default.trigger(this._element, EVENT_DESELECT).defaultPrevented) return;
			this._selected = false;
			this._applyState();
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_DESELECTED);
		}
		dispose() {
			if (!this._element) return;
			this._checkIcon?.remove();
			this._removeControl?.remove();
			super.dispose();
		}
		_configAfterMerge(config) {
			if (config.filter) config.selectable = true;
			return config;
		}
		_addEventListeners() {
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, (event) => this._handleKeydown(event));
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK, (event) => {
				if (this._disabled) return;
				if (event.target.closest(SELECTOR_CHIP_REMOVE)) return;
				if (event.shiftKey && this._element.getAttribute("role") === "option") return;
				this.toggle();
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK, SELECTOR_CHIP_REMOVE, (event) => {
				event.stopPropagation();
				if (this._config.removable && !this._disabled) this.remove();
			});
		}
		_applyRole() {
			const option = this._element.getAttribute("role") === "option";
			(0, js_src_util_index_js.writeAttribute)(this._element, "role", option ? "option" : this._config.selectable ? "button" : null);
		}
		_applyState() {
			this._element.classList.toggle(CLASS_NAME_CHIP_CLICKABLE, !this._disabled && (this._config.clickable || this._config.selectable));
			this._element.classList.toggle(CLASS_NAME_DISABLED, this._disabled);
			if (this._disabled && this._element.hasAttribute("role")) this._element.setAttribute("aria-disabled", "true");
			else this._element.removeAttribute("aria-disabled");
			const selected = this._config.selectable && this._selected;
			const option = this._element.getAttribute("role") === "option";
			this._element.classList.toggle(CLASS_NAME_ACTIVE, selected);
			(0, js_src_util_index_js.writeAttribute)(this._element, "aria-selected", option ? String(selected) : null);
			(0, js_src_util_index_js.writeAttribute)(this._element, "aria-pressed", !option && this._config.selectable ? String(selected) : null);
			if (this._config.filter) {
				if (selected) this._ensureCheckIcon();
				else js_src_dom_selector_engine_js.default.findOne(SELECTOR_CHIP_CHECK, this._element)?.remove();
			}
		}
		_ensureCheckIcon() {
			if (js_src_dom_selector_engine_js.default.findOne(SELECTOR_CHIP_CHECK, this._element)) return;
			const check = document.createElement("span");
			check.className = CLASS_NAME_CHIP_CHECK;
			check.setAttribute("aria-hidden", "true");
			check.innerHTML = (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config.selectedIcon, this._config);
			this._element.prepend(check);
			this._checkIcon = check;
		}
		_createRemoveControl() {
			if (this._element.hasAttribute("role")) {
				const indicator = document.createElement("span");
				indicator.className = CLASS_NAME_CHIP_REMOVE;
				indicator.setAttribute("aria-hidden", "true");
				indicator.innerHTML = (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config.removeIcon, this._config);
				return indicator;
			}
			const button = document.createElement("button");
			button.type = "button";
			button.className = CLASS_NAME_CHIP_REMOVE;
			button.setAttribute("aria-label", this._getRemoveLabel());
			button.setAttribute("tabindex", "-1");
			button.innerHTML = (0, js_src_util_sanitizer_js.sanitizeByConfig)(this._config.removeIcon, this._config);
			return button;
		}
		_getRemoveLabel() {
			return (0, js_src_util_chip_values_js.getChipRemoveLabel)(this._config.ariaRemoveLabel, this._element.textContent.replaceAll(/\s+/g, " ").trim());
		}
		_ensureRemoveControl() {
			if (!this._config.removable || this._disabled) return;
			const existing = js_src_dom_selector_engine_js.default.findOne(SELECTOR_CHIP_REMOVE, this._element);
			if (existing) {
				if (existing.tagName === "BUTTON" && !existing.hasAttribute("aria-label")) existing.setAttribute("aria-label", this._getRemoveLabel());
				return;
			}
			this._removeControl = this._createRemoveControl();
			this._element.append(this._removeControl);
		}
		_makeFocusable() {
			const focusable = !this._disabled && (this._config.selectable || this._config.removable);
			(0, js_src_util_index_js.writeAttribute)(this._element, "tabindex", focusable ? "0" : null);
			(0, js_src_util_index_js.writeAttribute)(this._element, "data-coreui-chip-focusable", focusable ? "true" : null);
		}
		_handleKeydown(event) {
			const { key } = event;
			if (this._disabled) return;
			switch (key) {
				case "Enter":
				case " ":
				case "Spacebar":
					if (!this._config.selectable) return;
					event.preventDefault();
					this.toggle();
					break;
				case "Backspace":
				case "Delete": if (this._config.removable) {
					event.preventDefault();
					this.remove();
				}
			}
		}
		_destroyElement() {
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_REMOVED);
			this._element.remove();
			this.dispose();
		}
		static chipInterface(element, config, ...args) {
			const data = Chip.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Chip, config, (element) => [element]);
		}
	};
	js_src_dom_event_handler_js.default.on(document, `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_CHIP)) Chip.chipInterface(element);
	});
	(0, js_src_util_index_js.defineJQueryPlugin)(Chip);
	//#endregion
	return Chip;
});

//# sourceMappingURL=chip.js.map
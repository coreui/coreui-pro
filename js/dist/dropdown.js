/*!
* CoreUI PRO dropdown.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("@floating-ui/dom"), require("./dom/event-handler.js"), require("./dom/manipulator.js"), require("./dom/selector-engine.js"), require("./menu.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"exports",
		"@floating-ui/dom",
		"./dom/event-handler.js",
		"./dom/manipulator.js",
		"./dom/selector-engine.js",
		"./menu.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.Dropdown = {}, global.FloatingUIDOM, global.EventHandler, global.Manipulator, global.SelectorEngine, global.Menu, global.Index));
})(this, function(exports, _floating_ui_dom, js_src_dom_event_handler_js, js_src_dom_manipulator_js, js_src_dom_selector_engine_js, js_src_menu_js, js_src_util_index_js) {
	Object.defineProperties(exports, {
		__esModule: { value: true },
		[Symbol.toStringTag]: { value: "Module" }
	});
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
	js_src_dom_event_handler_js = __toESM(js_src_dom_event_handler_js);
	js_src_dom_manipulator_js = __toESM(js_src_dom_manipulator_js);
	js_src_dom_selector_engine_js = __toESM(js_src_dom_selector_engine_js);
	js_src_menu_js = __toESM(js_src_menu_js);
	//#region js/src/dropdown.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI dropdown.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* Dropdown is the v5 compatibility surface built on the Menu implementation:
	* the same engine, keyboard handling and dismissal, with the v5 class names,
	* events (`*.coreui.dropdown`), class-driven placement and the navbar/static
	* CSS hook preserved. The acceptance contract is the untouched v5 spec suite.
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "dropdown";
	const EVENT_KEY = `.coreui.dropdown`;
	const DATA_API_KEY = ".data-api";
	const ARROW_DOWN_KEY = "ArrowDown";
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY}${DATA_API_KEY}`;
	const CLASS_NAME_DROPUP = "dropup";
	const CLASS_NAME_DROPEND = "dropend";
	const CLASS_NAME_DROPSTART = "dropstart";
	const CLASS_NAME_DROPUP_CENTER = "dropup-center";
	const CLASS_NAME_DROPDOWN_CENTER = "dropdown-center";
	const SELECTOR_NAVBAR = ".navbar";
	const PLACEMENT_TOP = "top-start";
	const PLACEMENT_TOPEND = "top-end";
	const PLACEMENT_BOTTOM = "bottom-start";
	const PLACEMENT_BOTTOMEND = "bottom-end";
	const PLACEMENT_END = "right-start";
	const PLACEMENT_START = "left-start";
	const PLACEMENT_TOPCENTER = "top";
	const PLACEMENT_BOTTOMCENTER = "bottom";
	const Default = {
		...js_src_menu_js.default.Default,
		placement: null
	};
	const DefaultType = {
		...js_src_menu_js.default.DefaultType,
		placement: "(null|string)"
	};
	/**
	* Class definition
	*/
	var Dropdown = class Dropdown extends js_src_menu_js.default {
		constructor(element, config) {
			super(element, config);
			this._inNavbar = this._detectNavbar();
		}
		static get SELECTOR_DATA_TOGGLE() {
			return "[data-coreui-toggle=\"dropdown\"]:not(.disabled):not(:disabled)";
		}
		static get SELECTOR_MENU() {
			return ".dropdown-menu";
		}
		static get SELECTOR_VISIBLE_ITEMS() {
			return ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)";
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
		update() {
			this._inNavbar = this._detectNavbar();
			super.update();
		}
		_getPlacement() {
			if (this._config.placement) return super._getPlacement();
			const parentDropdown = this._parent;
			const rtl = (0, js_src_util_index_js.isRTL)(this._element);
			if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) return rtl ? PLACEMENT_START : PLACEMENT_END;
			if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) return rtl ? PLACEMENT_END : PLACEMENT_START;
			if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) return PLACEMENT_TOPCENTER;
			if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) return PLACEMENT_BOTTOMCENTER;
			const isEnd = getComputedStyle(this._menu).getPropertyValue("--cui-position").trim() === "end";
			if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
			return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
		}
		_createFloating() {
			if (this._isStatic()) {
				js_src_dom_manipulator_js.default.setDataAttribute(this._menu, "popper", "static");
				js_src_dom_manipulator_js.default.setDataAttribute(this._menu, "placement", this._getPlacement());
				return;
			}
			super._createFloating();
		}
		async _updateFloatingPosition(referenceElement = null) {
			if (this._isStatic()) {
				js_src_dom_manipulator_js.default.setDataAttribute(this._menu, "placement", this._getPlacement());
				return;
			}
			return super._updateFloatingPosition(referenceElement);
		}
		_isStatic() {
			return this._inNavbar || this._config.display === "static";
		}
		_removeMenuAttributes() {
			super._removeMenuAttributes();
			js_src_dom_manipulator_js.default.removeDataAttribute(this._menu, "popper");
		}
		_selectMenuItem({ key, target }) {
			const items = js_src_dom_selector_engine_js.default.find(this.constructor.SELECTOR_VISIBLE_ITEMS, this._menu).filter((element) => (0, js_src_util_index_js.isVisible)(element));
			if (!items.length) return;
			(0, js_src_util_index_js.getNextActiveElement)(items, target, key === ARROW_DOWN_KEY, !items.includes(target)).focus();
		}
		_detectNavbar() {
			return this._element.closest(SELECTOR_NAVBAR) !== null;
		}
		static jQueryInterface(config) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Dropdown, config);
		}
	};
	/**
	* Data API implementation
	*
	* clearMenus is not re-registered here: Menu's document-level registration
	* iterates the open-instance registry, which the subclass shares.
	*/
	js_src_dom_event_handler_js.default.on(document, EVENT_KEYDOWN_DATA_API, Dropdown.SELECTOR_DATA_TOGGLE, (event) => Dropdown.dataApiKeydownHandler(event));
	js_src_dom_event_handler_js.default.on(document, EVENT_KEYDOWN_DATA_API, Dropdown.SELECTOR_MENU, (event) => Dropdown.dataApiKeydownHandler(event));
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, Dropdown.SELECTOR_DATA_TOGGLE, function(event) {
		event.preventDefault();
		Dropdown.getOrCreateInstance(this).toggle();
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Dropdown);
	//#endregion
	exports.Default = Default;
	exports.DefaultType = DefaultType;
	exports.default = Dropdown;
});

//# sourceMappingURL=dropdown.js.map
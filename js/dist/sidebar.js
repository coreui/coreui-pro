/*!
* CoreUI PRO sidebar.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/manipulator.js"), require("./util/index.js"), require("./util/backdrop.js"), require("./util/scrollbar.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/manipulator.js",
		"./util/index.js",
		"./util/backdrop.js",
		"./util/scrollbar.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Sidebar = factory(global.BaseComponent, global.EventHandler, global.Manipulator, global.Index, global.Backdrop, global.Scrollbar));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_manipulator_js, js_src_util_index_js, js_src_util_backdrop_js, js_src_util_scrollbar_js) {
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
	js_src_dom_manipulator_js = __toESM(js_src_dom_manipulator_js);
	js_src_util_backdrop_js = __toESM(js_src_util_backdrop_js);
	js_src_util_scrollbar_js = __toESM(js_src_util_scrollbar_js);
	//#region js/src/sidebar.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI sidebar.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* ------------------------------------------------------------------------
	* Constants
	* ------------------------------------------------------------------------
	*/
	const NAME = "sidebar";
	const EVENT_KEY = `.coreui.sidebar`;
	const DATA_API_KEY = ".data-api";
	const Default = {};
	const DefaultType = {};
	const CLASS_NAME_BACKDROP = "sidebar-backdrop";
	const CLASS_NAME_HIDE = "hide";
	const CLASS_NAME_SHOW = "show";
	const CLASS_NAME_SIDEBAR_NARROW = "sidebar-narrow";
	const CLASS_NAME_SIDEBAR_OVERLAID = "sidebar-overlaid";
	const CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE = "sidebar-narrow-unfoldable";
	const EVENT_HIDE = `hide${EVENT_KEY}`;
	const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
	const EVENT_RESIZE = `resize${EVENT_KEY}`;
	const EVENT_SHOW = `show${EVENT_KEY}`;
	const EVENT_SHOWN = `shown${EVENT_KEY}`;
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const SELECTOR_DATA_CLOSE = "[data-coreui-close=\"sidebar\"]";
	const SELECTOR_DATA_TOGGLE = "[data-coreui-toggle=\"narrow\"], [data-coreui-toggle=\"unfoldable\"]";
	const SELECTOR_SIDEBAR = ".sidebar";
	/**
	* ------------------------------------------------------------------------
	* Class Definition
	* ------------------------------------------------------------------------
	*/
	var Sidebar = class Sidebar extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._show = this._isVisible();
			this._mobile = this._isMobile();
			this._overlaid = this._isOverlaid();
			this._narrow = this._isNarrow();
			this._unfoldable = this._isUnfoldable();
			this._backdrop = this._initializeBackDrop();
			this._clickOutHandler = (event) => this._clickOutListener(event);
			this._resizeHandler = () => {
				if (this._isMobile() && this._isVisible()) {
					this.hide();
					this._backdrop = this._initializeBackDrop();
				}
			};
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
		async show() {
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SHOW);
			if (this._element.classList.contains(CLASS_NAME_HIDE)) this._element.classList.remove(CLASS_NAME_HIDE);
			if (this._overlaid) this._element.classList.add(CLASS_NAME_SHOW);
			if (this._isMobile()) {
				this._element.classList.add(CLASS_NAME_SHOW);
				this._backdrop.show();
				new js_src_util_scrollbar_js.default().hide();
			}
			const complete = () => {
				if (this._isVisible() === true) {
					this._show = true;
					if (this._isMobile() || this._isOverlaid()) this._addClickOutListener();
					js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SHOWN);
				}
			};
			await this._queueCallback(complete, this._element, true);
		}
		async hide() {
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_HIDE);
			if (this._element.classList.contains(CLASS_NAME_SHOW)) this._element.classList.remove(CLASS_NAME_SHOW);
			if (this._isMobile()) {
				this._backdrop.hide();
				new js_src_util_scrollbar_js.default().reset();
			}
			if (!this._isMobile() && !this._overlaid) this._element.classList.add(CLASS_NAME_HIDE);
			const complete = () => {
				if (this._isVisible() === false) {
					this._show = false;
					if (this._isMobile() || this._isOverlaid()) this._removeClickOutListener();
					js_src_dom_event_handler_js.default.trigger(this._element, EVENT_HIDDEN);
				}
			};
			await this._queueCallback(complete, this._element, true);
		}
		toggle() {
			return this._isVisible() ? this.hide() : this.show();
		}
		narrow() {
			if (!this._isMobile()) {
				this._element.classList.add(CLASS_NAME_SIDEBAR_NARROW);
				this._narrow = true;
			}
		}
		unfoldable() {
			if (!this._isMobile()) {
				this._element.classList.add(CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE);
				this._unfoldable = true;
			}
		}
		reset() {
			if (!this._isMobile()) {
				if (this._narrow) {
					this._element.classList.remove(CLASS_NAME_SIDEBAR_NARROW);
					this._narrow = false;
				}
				if (this._unfoldable) {
					this._element.classList.remove(CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE);
					this._unfoldable = false;
				}
			}
		}
		toggleNarrow() {
			if (this._narrow) {
				this.reset();
				return;
			}
			this.narrow();
		}
		toggleUnfoldable() {
			if (this._unfoldable) {
				this.reset();
				return;
			}
			this.unfoldable();
		}
		dispose() {
			if (this._isMobile() && this._isVisible()) new js_src_util_scrollbar_js.default().reset();
			this._backdrop.dispose();
			this._removeClickOutListener();
			js_src_dom_event_handler_js.default.off(window, EVENT_RESIZE, this._resizeHandler);
			super.dispose();
		}
		_initializeBackDrop() {
			return new js_src_util_backdrop_js.default({
				className: CLASS_NAME_BACKDROP,
				isVisible: this._isMobile(),
				isAnimated: true,
				rootElement: this._element.parentNode,
				clickCallback: () => this.hide()
			});
		}
		_isMobile() {
			return Boolean(window.getComputedStyle(this._element, null).getPropertyValue("--cui-is-mobile"));
		}
		_isNarrow() {
			return this._element.classList.contains(CLASS_NAME_SIDEBAR_NARROW);
		}
		_isOverlaid() {
			return this._element.classList.contains(CLASS_NAME_SIDEBAR_OVERLAID);
		}
		_isUnfoldable() {
			return this._element.classList.contains(CLASS_NAME_SIDEBAR_NARROW_UNFOLDABLE);
		}
		_isVisible() {
			const rect = this._element.getBoundingClientRect();
			return rect.top >= 0 && rect.left >= 0 && Math.floor(rect.bottom) <= (window.innerHeight || document.documentElement.clientHeight) && Math.floor(rect.right) <= (window.innerWidth || document.documentElement.clientWidth);
		}
		_clickOutListener(event) {
			if (event.target.closest(SELECTOR_SIDEBAR) === null) {
				event.preventDefault();
				event.stopPropagation();
				this.hide();
			}
		}
		_addClickOutListener() {
			js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, this._clickOutHandler);
		}
		_removeClickOutListener() {
			js_src_dom_event_handler_js.default.off(document, EVENT_CLICK_DATA_API, this._clickOutHandler);
		}
		_addEventListeners() {
			if (this._mobile && this._show) this._addClickOutListener();
			if (this._overlaid && this._show) this._addClickOutListener();
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, (event) => {
				event.preventDefault();
				const toggle = js_src_dom_manipulator_js.default.getDataAttribute(event.target.closest(SELECTOR_DATA_TOGGLE), "toggle");
				if (toggle === "narrow") this.toggleNarrow();
				if (toggle === "unfoldable") this.toggleUnfoldable();
			});
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_DATA_CLOSE, (event) => {
				event.preventDefault();
				this.hide();
			});
			js_src_dom_event_handler_js.default.on(window, EVENT_RESIZE, this._resizeHandler);
		}
		static sidebarInterface(element, config, ...args) {
			const data = Sidebar.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Sidebar, config);
		}
	};
	/**
	* ------------------------------------------------------------------------
	* Data Api implementation
	* ------------------------------------------------------------------------
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of Array.from(document.querySelectorAll(SELECTOR_SIDEBAR))) Sidebar.sidebarInterface(element);
	});
	/**
	* ------------------------------------------------------------------------
	* jQuery
	* ------------------------------------------------------------------------
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Sidebar);
	//#endregion
	return Sidebar;
});

//# sourceMappingURL=sidebar.js.map
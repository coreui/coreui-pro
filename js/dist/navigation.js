/*!
* CoreUI PRO navigation.ts v5.27.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/index.js"), require("./util/size-transition.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/index.js",
		"./util/size-transition.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Navigation = factory(global.BaseComponent, global.EventHandler, global.SelectorEngine, global.Index, global.SizeTransition));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_index_js, js_src_util_size_transition_js) {
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
	//#region js/src/navigation.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI navigation.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* ------------------------------------------------------------------------
	* Constants
	* ------------------------------------------------------------------------
	*/
	const NAME = "navigation";
	const EVENT_KEY = `.coreui.navigation`;
	const DATA_API_KEY = ".data-api";
	const Default = {
		activeLinksExact: true,
		groupsAutoCollapse: true
	};
	const DefaultType = {
		activeLinksExact: "boolean",
		groupsAutoCollapse: "(string|boolean)"
	};
	const CLASS_NAME_ACTIVE = "active";
	const CLASS_NAME_COLLAPSING = "collapsing";
	const CLASS_NAME_SHOW = "show";
	const CLASS_NAME_NAV_GROUP = "nav-group";
	const CLASS_NAME_NAV_GROUP_TOGGLE = "nav-group-toggle";
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const SELECTOR_NAV_GROUP = ".nav-group";
	const SELECTOR_NAV_GROUP_ITEMS = ".nav-group-items";
	const SELECTOR_NAV_GROUP_TOGGLE = ".nav-group-toggle";
	const SELECTOR_NAV_LINK = ".nav-link";
	const SELECTOR_DATA_NAVIGATION = "[data-coreui-navigation]";
	/**
	* ------------------------------------------------------------------------
	* Class Definition
	* ------------------------------------------------------------------------
	*/
	var Navigation = class Navigation extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element);
			this._config = this._getConfig(config);
			this._setActiveLink();
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
		_setActiveLink() {
			const currentUrl = String(window.location).split(/[?#]/)[0];
			for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_NAV_LINK, this._element)) {
				if (element.classList.contains(CLASS_NAME_NAV_GROUP_TOGGLE)) continue;
				if (!(this._config.activeLinksExact ? element.href === currentUrl : currentUrl.startsWith(element.href))) continue;
				element.classList.add(CLASS_NAME_ACTIVE);
				for (const group of this._getParentGroups(element)) this._setExpanded(group, true, false);
			}
		}
		_getParentGroups(element) {
			const groups = [];
			let group = element.closest(SELECTOR_NAV_GROUP);
			while (group && this._element.contains(group)) {
				groups.push(group);
				group = group.parentElement ? group.parentElement.closest(SELECTOR_NAV_GROUP) : null;
			}
			return groups;
		}
		_setExpanded(group, expanded, animate = true) {
			const toggle = group.querySelector(`:scope > ${SELECTOR_NAV_GROUP_TOGGLE}`);
			if (toggle) toggle.setAttribute("aria-expanded", String(expanded));
			const items = js_src_dom_selector_engine_js.default.findOne(`:scope > ${SELECTOR_NAV_GROUP_ITEMS}`, group);
			if (!items || !animate) {
				group.classList.toggle(CLASS_NAME_SHOW, expanded);
				return;
			}
			const cssPath = (0, js_src_util_size_transition_js.supportsInterpolateSize)();
			const size = expanded || cssPath ? 0 : items.getBoundingClientRect().height;
			items.classList.add(CLASS_NAME_COLLAPSING);
			group.classList.toggle(CLASS_NAME_SHOW, expanded);
			if (!cssPath) (0, js_src_util_size_transition_js.startSizeTransition)(items, "height", expanded ? 0 : size, expanded ? items.scrollHeight : 0);
			this._queueCallback(() => {
				items.classList.remove(CLASS_NAME_COLLAPSING);
				items.style.height = "";
			}, items, true);
		}
		_toggleGroupItems(event) {
			const toggler = event.target.closest(SELECTOR_NAV_GROUP_TOGGLE);
			const group = toggler ? toggler.closest(SELECTOR_NAV_GROUP) : null;
			if (!group) return;
			if (this._config.groupsAutoCollapse === true && group.parentElement) {
				for (const sibling of Array.from(group.parentElement.children)) if (sibling !== group && sibling.classList.contains(CLASS_NAME_NAV_GROUP) && sibling.classList.contains(CLASS_NAME_SHOW)) this._setExpanded(sibling, false);
			}
			this._setExpanded(group, !group.classList.contains(CLASS_NAME_SHOW));
		}
		_addEventListeners() {
			js_src_dom_event_handler_js.default.on(this._element, EVENT_CLICK_DATA_API, SELECTOR_NAV_GROUP_TOGGLE, (event) => {
				event.preventDefault();
				this._toggleGroupItems(event);
			});
		}
		static navigationInterface(element, config, ...args) {
			const data = Navigation.getOrCreateInstance(element, config);
			if (typeof config === "string") {
				if (typeof data[config] === "undefined") throw new TypeError(`No method named "${config}"`);
				data[config](...args);
			}
		}
		static jQueryInterface(config) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Navigation, config);
		}
	};
	/**
	* ------------------------------------------------------------------------
	* Data Api implementation
	* ------------------------------------------------------------------------
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of Array.from(document.querySelectorAll(SELECTOR_DATA_NAVIGATION))) Navigation.navigationInterface(element);
	});
	/**
	* ------------------------------------------------------------------------
	* jQuery
	* ------------------------------------------------------------------------
	* add .Navigation to jQuery only if jQuery is present
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Navigation);
	//#endregion
	return Navigation;
});

//# sourceMappingURL=navigation.js.map
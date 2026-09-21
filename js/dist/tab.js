/*!
* CoreUI PRO tab.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Tab = factory(global.BaseComponent, global.EventHandler, global.SelectorEngine, global.Index));
})(this, function(js_src_base_component_js, js_src_dom_event_handler_js, js_src_dom_selector_engine_js, js_src_util_index_js) {
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
	//#region js/src/tab.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI tab.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's tab.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "tab";
	const EVENT_KEY = `.coreui.tab`;
	const EVENT_HIDE = `hide${EVENT_KEY}`;
	const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
	const EVENT_SHOW = `show${EVENT_KEY}`;
	const EVENT_SHOWN = `shown${EVENT_KEY}`;
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY}`;
	const EVENT_KEYDOWN = `keydown${EVENT_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}`;
	const ARROW_LEFT_KEY = "ArrowLeft";
	const ARROW_RIGHT_KEY = "ArrowRight";
	const ARROW_UP_KEY = "ArrowUp";
	const ARROW_DOWN_KEY = "ArrowDown";
	const HOME_KEY = "Home";
	const END_KEY = "End";
	const CLASS_NAME_ACTIVE = "active";
	const CLASS_NAME_SHOW = "show";
	const SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
	const SELECTOR_DROPDOWN_MENU = ".dropdown-menu";
	const NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
	const SELECTOR_TAB_PANEL = ".list-group, .nav, [role=\"tablist\"]";
	const SELECTOR_OUTER = ".nav-item, .list-group-item";
	const SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
	const SELECTOR_DATA_TOGGLE = "[data-coreui-toggle=\"tab\"], [data-coreui-toggle=\"pill\"], [data-coreui-toggle=\"list\"]";
	const SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
	const SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-coreui-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-coreui-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-coreui-toggle="list"]`;
	/**
	* Class definition
	*/
	var Tab = class Tab extends js_src_base_component_js.default {
		constructor(element) {
			super(element);
			this._parent = this._element.closest(SELECTOR_TAB_PANEL);
			if (!this._parent) throw new TypeError(`${this._element.outerHTML} has not a valid parent ${SELECTOR_INNER_ELEM}`);
			this._setInitialAttributes(this._parent, this._getChildren());
			js_src_dom_event_handler_js.default.on(this._element, EVENT_KEYDOWN, (event) => this._keydown(event));
		}
		static get NAME() {
			return NAME;
		}
		async show() {
			const innerElem = this._element;
			if (this._elemIsActive(innerElem)) return;
			const active = this._getActiveElem();
			const hideEvent = active ? js_src_dom_event_handler_js.default.trigger(active, EVENT_HIDE, { relatedTarget: innerElem }) : null;
			if (js_src_dom_event_handler_js.default.trigger(innerElem, EVENT_SHOW, { relatedTarget: active }).defaultPrevented || hideEvent && hideEvent.defaultPrevented) return;
			this._deactivate(active, innerElem);
			await this._activate(innerElem, active);
		}
		async _activate(element, relatedElem) {
			if (!element) return;
			element.classList.add(CLASS_NAME_ACTIVE);
			if (element.getAttribute("role") !== "tab") {
				element.classList.add(CLASS_NAME_SHOW);
				return;
			}
			const pane = js_src_dom_selector_engine_js.default.getElementFromSelector(element);
			this._activate(pane);
			const complete = () => {
				element.removeAttribute("tabindex");
				(0, js_src_util_index_js.setAriaAttribute)(element, "aria-selected", true);
				this._toggleDropDown(element, true);
				js_src_dom_event_handler_js.default.trigger(element, EVENT_SHOWN, { relatedTarget: relatedElem });
			};
			await this._queueCallback(complete, pane ?? element, (0, js_src_util_index_js.getTransitionDurationFromElement)(pane) > 0);
		}
		async _deactivate(element, relatedElem) {
			if (!element) return;
			element.classList.remove(CLASS_NAME_ACTIVE);
			element.blur();
			if (element.getAttribute("role") !== "tab") {
				element.classList.remove(CLASS_NAME_SHOW);
				return;
			}
			this._deactivate(js_src_dom_selector_engine_js.default.getElementFromSelector(element));
			const complete = () => {
				(0, js_src_util_index_js.setAriaAttribute)(element, "aria-selected", false);
				element.setAttribute("tabindex", "-1");
				this._toggleDropDown(element, false);
				js_src_dom_event_handler_js.default.trigger(element, EVENT_HIDDEN, { relatedTarget: relatedElem });
			};
			await this._queueCallback(complete, element, false);
		}
		_keydown(event) {
			if (![
				ARROW_LEFT_KEY,
				ARROW_RIGHT_KEY,
				ARROW_UP_KEY,
				ARROW_DOWN_KEY,
				HOME_KEY,
				END_KEY
			].includes(event.key)) return;
			if (event.altKey || event.ctrlKey || event.metaKey) return;
			event.stopPropagation();
			event.preventDefault();
			const children = this._getChildren().filter((element) => !(0, js_src_util_index_js.isDisabled)(element));
			let nextActiveElement;
			if ([HOME_KEY, END_KEY].includes(event.key)) nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
			else {
				const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
				nextActiveElement = (0, js_src_util_index_js.getNextActiveElement)(children, event.target, isNext, true);
			}
			if (nextActiveElement) {
				nextActiveElement.focus({ preventScroll: true });
				Tab.getOrCreateInstance(nextActiveElement).show();
			}
		}
		_getChildren() {
			return js_src_dom_selector_engine_js.default.find(SELECTOR_INNER_ELEM, this._parent);
		}
		_getActiveElem() {
			return this._getChildren().find((child) => this._elemIsActive(child)) || null;
		}
		_setInitialAttributes(parent, children) {
			this._setAttributeIfNotExists(parent, "role", "tablist");
			for (const child of children) this._setInitialAttributesOnChild(child);
		}
		_setInitialAttributesOnChild(child) {
			child = this._getInnerElement(child);
			const isActive = this._elemIsActive(child);
			const outerElem = this._getOuterElement(child);
			(0, js_src_util_index_js.setAriaAttribute)(child, "aria-selected", isActive);
			if (outerElem !== child) this._setAttributeIfNotExists(outerElem, "role", "presentation");
			if (!isActive) child.setAttribute("tabindex", "-1");
			this._setAttributeIfNotExists(child, "role", "tab");
			this._setInitialAttributesOnTargetPanel(child);
		}
		_setInitialAttributesOnTargetPanel(child) {
			const target = js_src_dom_selector_engine_js.default.getElementFromSelector(child);
			if (!target) return;
			this._setAttributeIfNotExists(target, "role", "tabpanel");
			if (child.id) this._setAttributeIfNotExists(target, "aria-labelledby", `${child.id}`);
		}
		_toggleDropDown(element, open) {
			const outerElem = this._getOuterElement(element);
			const dropdownToggle = js_src_dom_selector_engine_js.default.findOne(SELECTOR_DROPDOWN_TOGGLE, outerElem);
			if (!dropdownToggle) return;
			const dropdownMenu = js_src_dom_selector_engine_js.default.findOne(SELECTOR_DROPDOWN_MENU, outerElem);
			dropdownToggle.classList.toggle(CLASS_NAME_ACTIVE, open);
			if (dropdownMenu) dropdownMenu.classList.toggle(CLASS_NAME_SHOW, open);
			(0, js_src_util_index_js.setAriaAttribute)(dropdownToggle, "aria-expanded", open);
		}
		_setAttributeIfNotExists(element, attribute, value) {
			if (!element.hasAttribute(attribute)) element.setAttribute(attribute, value);
		}
		_elemIsActive(elem) {
			return elem.classList.contains(CLASS_NAME_ACTIVE);
		}
		_getInnerElement(elem) {
			return elem.matches(SELECTOR_INNER_ELEM) ? elem : js_src_dom_selector_engine_js.default.findOne(SELECTOR_INNER_ELEM, elem);
		}
		_getOuterElement(elem) {
			return elem.closest(SELECTOR_OUTER) || elem;
		}
		static jQueryInterface(config) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Tab, config);
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function(event) {
		if (["A", "AREA"].includes(this.tagName)) event.preventDefault();
		if ((0, js_src_util_index_js.isDisabled)(this)) return;
		Tab.getOrCreateInstance(this).show();
	});
	/**
	* Initialize on focus
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_TOGGLE_ACTIVE)) Tab.getOrCreateInstance(element);
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Tab);
	//#endregion
	return Tab;
});

//# sourceMappingURL=tab.js.map
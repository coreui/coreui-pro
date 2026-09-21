/*!
* CoreUI PRO collapse.ts v6.0.0-alpha.0 (https://coreui.io)
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
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Collapse = factory(global.BaseComponent, global.EventHandler, global.SelectorEngine, global.Index, global.SizeTransition));
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
	//#region js/src/collapse.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI collapse.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's collapse.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "collapse";
	const EVENT_KEY = `.coreui.collapse`;
	const DATA_API_KEY = ".data-api";
	const EVENT_SHOW = `show${EVENT_KEY}`;
	const EVENT_SHOWN = `shown${EVENT_KEY}`;
	const EVENT_HIDE = `hide${EVENT_KEY}`;
	const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
	const EVENT_CLICK_DATA_API = `click${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_LOAD_DATA_API = `DOMContentLoaded${EVENT_KEY}${DATA_API_KEY}`;
	const EVENT_BEFOREMATCH = `beforematch${EVENT_KEY}`;
	const CLASS_NAME_SHOW = "show";
	const CLASS_NAME_COLLAPSE = "collapse";
	const CLASS_NAME_COLLAPSING = "collapsing";
	const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
	const CLASS_NAME_HORIZONTAL = "collapse-horizontal";
	const WIDTH = "width";
	const HEIGHT = "height";
	const ATTRIBUTE_HIDDEN = "hidden";
	const VALUE_UNTIL_FOUND = "until-found";
	const SELECTOR_ACTIVES = ".collapse.show";
	const SELECTOR_DATA_TOGGLE = "[data-coreui-toggle=\"collapse\"]";
	const SELECTOR_HIDDEN_UNTIL_FOUND = ".collapse[data-coreui-hidden-until-found=\"true\"]";
	const Default = {
		hiddenUntilFound: false,
		parent: null
	};
	const DefaultType = {
		hiddenUntilFound: "boolean",
		parent: "(null|element)"
	};
	const supportsUntilFound = () => typeof document !== "undefined" && "onbeforematch" in document.documentElement;
	/**
	* Class definition
	*/
	var Collapse = class Collapse extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element, config);
			this._isTransitioning = false;
			this._triggerArray = [];
			const toggleList = js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_TOGGLE);
			for (const elem of toggleList) {
				const selector = js_src_dom_selector_engine_js.default.getSelectorFromElement(elem);
				const filterElement = js_src_dom_selector_engine_js.default.find(selector).filter((foundElement) => foundElement === this._element);
				if (selector !== null && filterElement.length) this._triggerArray.push(elem);
			}
			this._initializeChildren();
			if (!this._config.parent) this._setAriaExpanded(this._triggerArray, this._isShown());
			if (this._config.hiddenUntilFound && supportsUntilFound()) {
				js_src_dom_event_handler_js.default.on(this._element, EVENT_BEFOREMATCH, () => this._onBeforeMatch());
				this._setHiddenUntilFound(!this._isShown());
			}
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
		toggle() {
			return this._isShown() ? this.hide() : this.show();
		}
		async show() {
			if (this._isTransitioning || this._isShown()) return;
			let activeChildren = [];
			if (this._config.parent) activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter((element) => element !== this._element && !this._sharesTrigger(element)).map((element) => Collapse.getOrCreateInstance(element));
			if (activeChildren.length && activeChildren[0]._isTransitioning) return;
			if (js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SHOW).defaultPrevented) return;
			for (const activeInstance of activeChildren) activeInstance.hide();
			const dimension = this._getDimension();
			this._setHiddenUntilFound(false);
			this._element.classList.add(CLASS_NAME_COLLAPSING, CLASS_NAME_SHOW);
			this._setAriaExpanded(this._triggerArray, true);
			this._isTransitioning = true;
			const complete = () => {
				this._isTransitioning = false;
				this._element.classList.remove(CLASS_NAME_COLLAPSING);
				this._element.style[dimension] = "";
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SHOWN);
			};
			if ((0, js_src_util_size_transition_js.supportsInterpolateSize)()) {
				await this._queueCallback(complete, this._element, true, dimension);
				return;
			}
			const scrollSize = `scroll${dimension[0].toUpperCase() + dimension.slice(1)}`;
			(0, js_src_util_size_transition_js.startSizeTransition)(this._element, dimension, 0, this._element[scrollSize]);
			await this._queueCallback(complete, this._element, true, dimension);
		}
		async hide() {
			if (this._isTransitioning || !this._isShown()) return;
			if (js_src_dom_event_handler_js.default.trigger(this._element, EVENT_HIDE).defaultPrevented) return;
			const cssPath = (0, js_src_util_size_transition_js.supportsInterpolateSize)();
			const dimension = this._getDimension();
			const size = cssPath ? 0 : this._element.getBoundingClientRect()[dimension];
			this._element.classList.add(CLASS_NAME_COLLAPSING);
			if (cssPath) this._setHiddenUntilFound(true);
			this._element.classList.remove(CLASS_NAME_SHOW);
			for (const trigger of this._triggerArray) {
				const element = js_src_dom_selector_engine_js.default.getElementFromSelector(trigger);
				if (element && !this._isShown(element)) this._setAriaExpanded([trigger], false);
			}
			this._isTransitioning = true;
			const complete = () => {
				this._isTransitioning = false;
				this._element.classList.remove(CLASS_NAME_COLLAPSING);
				this._element.style[dimension] = "";
				if (!cssPath) this._setHiddenUntilFound(true);
				js_src_dom_event_handler_js.default.trigger(this._element, EVENT_HIDDEN);
			};
			if (!cssPath) (0, js_src_util_size_transition_js.startSizeTransition)(this._element, dimension, size, 0);
			await this._queueCallback(complete, this._element, true, dimension);
		}
		_isShown(element = this._element) {
			return element.classList.contains(CLASS_NAME_SHOW);
		}
		_configAfterMerge(config) {
			config.parent = (0, js_src_util_index_js.getElement)(config.parent);
			return config;
		}
		_getDimension() {
			return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
		}
		_sharesTrigger(element) {
			return this._triggerArray.some((trigger) => js_src_dom_selector_engine_js.default.getMultipleElementsFromSelector(trigger).includes(element));
		}
		_initializeChildren() {
			if (!this._config.parent) return;
			const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE);
			for (const element of children) {
				const selected = js_src_dom_selector_engine_js.default.getElementFromSelector(element);
				if (selected) this._setAriaExpanded([element], this._isShown(selected));
			}
		}
		_getFirstLevelChildren(selector) {
			const children = js_src_dom_selector_engine_js.default.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
			return js_src_dom_selector_engine_js.default.find(selector, this._config.parent).filter((element) => !children.includes(element));
		}
		_setHiddenUntilFound(hidden) {
			if (!this._config.hiddenUntilFound || !supportsUntilFound()) return;
			if (hidden) {
				this._element.setAttribute(ATTRIBUTE_HIDDEN, VALUE_UNTIL_FOUND);
				return;
			}
			this._element.removeAttribute(ATTRIBUTE_HIDDEN);
		}
		_onBeforeMatch() {
			if (this._isShown()) return;
			this._element.classList.add(CLASS_NAME_SHOW);
			this._setAriaExpanded(this._triggerArray, true);
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_SHOWN);
		}
		_setAriaExpanded(triggerArray, isOpen) {
			if (!triggerArray.length) return;
			for (const element of triggerArray) (0, js_src_util_index_js.setAriaAttribute)(element, "aria-expanded", isOpen);
		}
		static _initializeDataApi() {
			if (!supportsUntilFound()) return;
			for (const element of js_src_dom_selector_engine_js.default.find(SELECTOR_HIDDEN_UNTIL_FOUND)) Collapse.getOrCreateInstance(element);
		}
		static jQueryInterface(config) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, Collapse, config);
		}
	};
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(document, EVENT_LOAD_DATA_API, () => {
		Collapse._initializeDataApi();
	});
	js_src_dom_event_handler_js.default.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function(event) {
		if (event.target.tagName === "A" || event.delegateTarget && event.delegateTarget.tagName === "A") event.preventDefault();
		for (const element of js_src_dom_selector_engine_js.default.getMultipleElementsFromSelector(this)) Collapse.getOrCreateInstance(element).toggle();
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(Collapse);
	//#endregion
	return Collapse;
});

//# sourceMappingURL=collapse.js.map
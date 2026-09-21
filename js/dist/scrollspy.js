/*!
* CoreUI PRO scrollspy.ts v6.0.0-alpha.0 (https://coreui.io)
* Copyright 2026 The CoreUI Team (https://github.com/orgs/coreui/people)
* License (https://coreui.io/pro/license/)
*/
(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory(require("./base-component.js"), require("./dom/event-handler.js"), require("./dom/selector-engine.js"), require("./util/index.js")) : typeof define === "function" && define.amd ? define([
		"./base-component.js",
		"./dom/event-handler.js",
		"./dom/selector-engine.js",
		"./util/index.js"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Scrollspy = factory(global.BaseComponent, global.EventHandler, global.SelectorEngine, global.Index));
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
	//#region js/src/scrollspy.ts
	/**
	* --------------------------------------------------------------------------
	* CoreUI scrollspy.ts
	* Licensed under MIT (https://github.com/coreui/coreui/blob/main/LICENSE)
	*
	* This component is a modified version of the Bootstrap's scrollspy.ts
	* Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
	* --------------------------------------------------------------------------
	*/
	/**
	* Constants
	*/
	const NAME = "scrollspy";
	const EVENT_KEY = `.coreui.scrollspy`;
	const DATA_API_KEY = ".data-api";
	const EVENT_ACTIVATE = `activate${EVENT_KEY}`;
	const EVENT_CLICK = `click${EVENT_KEY}`;
	const EVENT_SCROLL = `scroll${EVENT_KEY}`;
	const EVENT_SCROLLEND = `scrollend${EVENT_KEY}`;
	const EVENT_RESIZE = `resize${EVENT_KEY}`;
	const EVENT_LOAD_DATA_API = `load${EVENT_KEY}${DATA_API_KEY}`;
	const CLASS_NAME_MENU_ITEM = "menu-item";
	const CLASS_NAME_DROPDOWN_ITEM = "dropdown-item";
	const CLASS_NAME_ACTIVE = "active";
	const SELECTOR_DATA_SPY = "[data-coreui-spy=\"scroll\"]";
	const SELECTOR_TARGET_LINKS = "[href]";
	const SELECTOR_NAV_LIST_GROUP = ".nav, .list-group";
	const SELECTOR_NAV_LINKS = ".nav-link";
	const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, .nav-item > ${SELECTOR_NAV_LINKS}, .list-group-item`;
	const SELECTOR_MENU_TOGGLE = "[data-coreui-toggle=\"menu\"]";
	const SELECTOR_DROPDOWN = ".dropdown";
	const SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
	const SCROLL_IDLE_TIMEOUT = 100;
	const RESIZE_DEBOUNCE = 100;
	const Default = {
		rootMargin: null,
		smoothScroll: false,
		target: null,
		threshold: [0],
		topMargin: "12%"
	};
	const DefaultType = {
		rootMargin: "(string|null)",
		smoothScroll: "boolean",
		target: "element",
		threshold: "array",
		topMargin: "string"
	};
	/**
	* Class definition
	*/
	var ScrollSpy = class ScrollSpy extends js_src_base_component_js.default {
		constructor(element, config) {
			super(element, config);
			this._sections = [];
			this._linkBySection = /* @__PURE__ */ new Map();
			this._sectionByLink = /* @__PURE__ */ new Map();
			this._intersecting = /* @__PURE__ */ new Set();
			this._activeTarget = null;
			this._lastActive = null;
			this._atBottom = false;
			this._rootElement = getComputedStyle(this._element).overflowY === "visible" ? null : this._element;
			this._observer = null;
			this._sentinel = null;
			this._sentinelObserver = null;
			this._pendingNavigation = null;
			this._settleTimeout = null;
			this._settleHandler = null;
			this._scrollIdleHandler = null;
			this._resizeHandler = null;
			this._resizeTimeout = null;
			this.refresh();
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
		refresh() {
			this._initializeTargetsAndObservables();
			this._maybeEnableSmoothScroll();
			this._observer?.disconnect();
			this._intersecting.clear();
			this._observer = this._getNewObserver();
			for (const section of this._sections) this._observer.observe(section);
			this._setUpSentinel();
			this._maybeAddResizeListener();
		}
		dispose() {
			this._observer?.disconnect();
			this._teardownSentinel();
			this._disarmSettle();
			this._removeResizeListener();
			js_src_dom_event_handler_js.default.off(this._config.target, EVENT_CLICK);
			super.dispose();
		}
		_configAfterMerge(config) {
			config.target = (0, js_src_util_index_js.getElement)(config.target) || document.body;
			if (typeof config.threshold === "string") config.threshold = config.threshold.split(",").map((value) => Number.parseFloat(value));
			return config;
		}
		_getNewObserver() {
			const options = {
				root: this._rootElement,
				threshold: this._config.threshold,
				rootMargin: this._config.rootMargin ?? this._getDerivedRootMargin()
			};
			return new IntersectionObserver((entries) => this._onIntersect(entries), options);
		}
		_onIntersect(entries) {
			for (const entry of entries) if (entry.isIntersecting) this._intersecting.add(entry.target);
			else this._intersecting.delete(entry.target);
			this._computeActive();
		}
		_computeActive() {
			if (!this._element?.isConnected || this._sections.length === 0) return;
			let active = null;
			if (this._atBottom) active = this._sections.at(-1);
			else {
				for (const section of this._sections) if (this._intersecting.has(section)) active = section;
				active ||= this._lastActive ?? this._sections.at(0);
			}
			if (!active) return;
			this._lastActive = active;
			const link = this._linkBySection.get(active);
			if (link) this._process(link);
		}
		_parseTopMargin() {
			const value = String(this._config.topMargin);
			return {
				value: Number.parseFloat(value) || 0,
				unit: value.endsWith("%") ? "%" : "px"
			};
		}
		_getDerivedRootMargin() {
			const { value, unit } = this._parseTopMargin();
			let percent = value;
			if (unit === "px") {
				const rootHeight = this._rootElement ? this._rootElement.clientHeight : document.documentElement.clientHeight || window.innerHeight;
				percent = rootHeight ? value / rootHeight * 100 : 12;
			}
			return `0px 0px -${Math.min(Math.max(100 - percent, 0), 100)}% 0px`;
		}
		_usesPixelMargin() {
			return !this._config.rootMargin && this._parseTopMargin().unit === "px";
		}
		_setUpSentinel() {
			this._teardownSentinel();
			if (this._sections.length === 0) return;
			const sentinel = document.createElement("div");
			sentinel.setAttribute("aria-hidden", "true");
			sentinel.style.cssText = "position:relative;width:0;height:0;margin:0;padding:0;border:0;visibility:hidden;";
			this._element.append(sentinel);
			this._sentinel = sentinel;
			this._sentinelObserver = new IntersectionObserver((entries) => this._onSentinel(entries), {
				root: this._rootElement,
				threshold: [0]
			});
			this._sentinelObserver.observe(sentinel);
		}
		_onSentinel(entries) {
			const entry = entries.at(-1);
			this._atBottom = Boolean(entry?.isIntersecting) && this._isOverflowing();
			this._computeActive();
		}
		_isOverflowing() {
			const scroller = this._rootElement || document.scrollingElement || document.documentElement;
			return scroller.scrollHeight > scroller.clientHeight;
		}
		_teardownSentinel() {
			this._sentinelObserver?.disconnect();
			this._sentinelObserver = null;
			this._sentinel?.remove();
			this._sentinel = null;
			this._atBottom = false;
		}
		_maybeAddResizeListener() {
			this._removeResizeListener();
			if (!this._usesPixelMargin()) return;
			this._resizeHandler = () => {
				clearTimeout(this._resizeTimeout);
				this._resizeTimeout = setTimeout(() => this._rebuildObserver(), RESIZE_DEBOUNCE);
			};
			js_src_dom_event_handler_js.default.on(window, EVENT_RESIZE, this._resizeHandler);
		}
		_removeResizeListener() {
			clearTimeout(this._resizeTimeout);
			this._resizeTimeout = null;
			if (this._resizeHandler) {
				js_src_dom_event_handler_js.default.off(window, EVENT_RESIZE, this._resizeHandler);
				this._resizeHandler = null;
			}
		}
		_rebuildObserver() {
			if (!this._observer) return;
			this._observer.disconnect();
			this._intersecting.clear();
			this._observer = this._getNewObserver();
			for (const section of this._sections) this._observer.observe(section);
		}
		_maybeEnableSmoothScroll() {
			if (!this._config.smoothScroll) return;
			js_src_dom_event_handler_js.default.off(this._config.target, EVENT_CLICK);
			js_src_dom_event_handler_js.default.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, (event) => {
				const link = event.target.closest(SELECTOR_TARGET_LINKS);
				const section = link && this._sectionByLink.get(link);
				if (!section || !this._element) return;
				event.preventDefault();
				const root = this._rootElement || window;
				const height = section.offsetTop - this._element.offsetTop;
				const currentTop = this._rootElement ? this._rootElement.scrollTop : window.scrollY ?? window.pageYOffset;
				if (matchMedia("(prefers-reduced-motion: reduce)").matches || Math.abs(currentTop - height) <= 2) {
					if (root.scrollTo) root.scrollTo({
						top: height,
						behavior: "auto"
					});
					else root.scrollTop = height;
					this._settleNavigation(link.hash, section);
					return;
				}
				this._pendingNavigation = {
					hash: link.hash,
					section
				};
				this._armSettle();
				if (root.scrollTo) root.scrollTo({
					top: height,
					behavior: "smooth"
				});
				else root.scrollTop = height;
			});
		}
		_armSettle() {
			this._disarmSettle();
			const target = this._getSettleTarget();
			this._settleHandler = () => this._onSettle();
			this._scrollIdleHandler = () => {
				clearTimeout(this._settleTimeout);
				this._settleTimeout = setTimeout(() => this._onSettle(), SCROLL_IDLE_TIMEOUT);
			};
			js_src_dom_event_handler_js.default.on(target, EVENT_SCROLLEND, this._settleHandler);
			js_src_dom_event_handler_js.default.on(target, EVENT_SCROLL, this._scrollIdleHandler);
		}
		_disarmSettle() {
			clearTimeout(this._settleTimeout);
			this._settleTimeout = null;
			const target = this._getSettleTarget();
			if (this._settleHandler) {
				js_src_dom_event_handler_js.default.off(target, EVENT_SCROLLEND, this._settleHandler);
				this._settleHandler = null;
			}
			if (this._scrollIdleHandler) {
				js_src_dom_event_handler_js.default.off(target, EVENT_SCROLL, this._scrollIdleHandler);
				this._scrollIdleHandler = null;
			}
		}
		_getSettleTarget() {
			return this._rootElement || document;
		}
		_onSettle() {
			this._disarmSettle();
			if (!this._pendingNavigation) return;
			const { hash, section } = this._pendingNavigation;
			this._settleNavigation(hash, section);
		}
		_settleNavigation(hash, section) {
			this._pendingNavigation = null;
			if (window.history?.replaceState) window.history.replaceState(null, "", hash);
			if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
			section.focus({ preventScroll: true });
		}
		_initializeTargetsAndObservables() {
			this._sections = [];
			this._linkBySection = /* @__PURE__ */ new Map();
			this._sectionByLink = /* @__PURE__ */ new Map();
			const targetLinks = js_src_dom_selector_engine_js.default.find(SELECTOR_TARGET_LINKS, this._config.target);
			const seen = /* @__PURE__ */ new Set();
			for (const anchor of targetLinks) {
				if (!anchor.hash || (0, js_src_util_index_js.isDisabled)(anchor)) continue;
				const id = decodeFragment(anchor.hash.slice(1));
				if (!id) continue;
				const section = document.getElementById(id);
				if (!section || !this._element.contains(section) || !(0, js_src_util_index_js.isVisible)(section)) continue;
				this._sectionByLink.set(anchor, section);
				this._linkBySection.set(section, anchor);
				if (!seen.has(section)) {
					seen.add(section);
					this._sections.push(section);
				}
			}
			this._sections.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
		}
		_process(target) {
			if (this._activeTarget === target) return;
			this._clearActiveClass(this._config.target);
			this._activeTarget = target;
			target.classList.add(CLASS_NAME_ACTIVE);
			this._activateParents(target);
			js_src_dom_event_handler_js.default.trigger(this._element, EVENT_ACTIVATE, { relatedTarget: target });
		}
		_activateParents(target) {
			if (target.classList.contains(CLASS_NAME_MENU_ITEM)) {
				const menuToggle = target.closest(".menu")?.previousElementSibling;
				if (menuToggle?.matches(SELECTOR_MENU_TOGGLE)) menuToggle.classList.add(CLASS_NAME_ACTIVE);
				return;
			}
			if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
				js_src_dom_selector_engine_js.default.findOne(SELECTOR_DROPDOWN_TOGGLE, target.closest(SELECTOR_DROPDOWN))?.classList.add(CLASS_NAME_ACTIVE);
				return;
			}
			for (const listGroup of js_src_dom_selector_engine_js.default.parents(target, SELECTOR_NAV_LIST_GROUP)) for (const item of js_src_dom_selector_engine_js.default.prev(listGroup, SELECTOR_LINK_ITEMS)) item.classList.add(CLASS_NAME_ACTIVE);
		}
		_clearActiveClass(parent) {
			parent.classList.remove(CLASS_NAME_ACTIVE);
			const activeNodes = js_src_dom_selector_engine_js.default.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE}`, parent);
			for (const node of activeNodes) node.classList.remove(CLASS_NAME_ACTIVE);
		}
		static jQueryInterface(config) {
			return (0, js_src_util_index_js.jQueryDispatch)(this, ScrollSpy, config);
		}
	};
	function decodeFragment(hash) {
		try {
			return decodeURIComponent(hash);
		} catch {
			return hash;
		}
	}
	/**
	* Data API implementation
	*/
	js_src_dom_event_handler_js.default.on(window, EVENT_LOAD_DATA_API, () => {
		for (const spy of js_src_dom_selector_engine_js.default.find(SELECTOR_DATA_SPY)) ScrollSpy.getOrCreateInstance(spy);
	});
	/**
	* jQuery
	*/
	(0, js_src_util_index_js.defineJQueryPlugin)(ScrollSpy);
	//#endregion
	return ScrollSpy;
});

//# sourceMappingURL=scrollspy.js.map